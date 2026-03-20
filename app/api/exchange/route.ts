export const dynamic = "force-dynamic";
// app/api/auth/exchange/route.ts
// Handles ALL server-side auth exchanges:
//   ?code=       → PKCE OAuth (Google) — exchanges code using code_verifier cookie
//   ?token_hash= → Email magic link — stateless OTP exchange, no verifier needed

import { NextRequest, NextResponse } from "next/server";
import { createServerClient } from "@supabase/ssr";

export async function GET(request: NextRequest) {
  const { searchParams } = new URL(request.url);
  const code       = searchParams.get("code");
  const tokenHash  = searchParams.get("token_hash");
  const type       = (searchParams.get("type") ?? "email") as
    "email" | "signup" | "magiclink" | "recovery" | "invite" | "email_change";

  if (!code && !tokenHash) {
    return NextResponse.json({ error: "No code or token_hash provided" }, { status: 400 });
  }

  const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!;
  const supabaseKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!;
  const cookiesToWrite: { name: string; value: string; options: Record<string, unknown> }[] = [];

  const supabase = createServerClient(supabaseUrl, supabaseKey, {
    cookies: {
      getAll: () => request.cookies.getAll(),
      setAll: (cookies) => cookies.forEach(c => cookiesToWrite.push(c)),
    },
  });

  let userId: string;

  if (code) {
    // PKCE OAuth code exchange
    const { data, error } = await supabase.auth.exchangeCodeForSession(code);
    if (error || !data.user) {
      return NextResponse.json({ error: error?.message ?? "PKCE exchange failed" }, { status: 401 });
    }
    userId = data.user.id;
    upsertProfile(data.user).catch(() => {});
  } else {
    // Email magic link / OTP token_hash exchange (stateless — no verifier needed)
    const otpTypes: Array<typeof type> = ["email", "magiclink", "signup", "invite", "recovery", "email_change"];
    const ordered = [type, ...otpTypes.filter(t => t !== type)];
    let succeeded = false;
    let uid = "";
    for (const t of ordered) {
      const { data, error } = await supabase.auth.verifyOtp({
        token_hash: tokenHash!,
        type: t,
      });
      if (!error && data.user) {
        succeeded = true;
        uid = data.user.id;
        upsertProfile(data.user).catch(() => {});
        break;
      }
    }
    if (!succeeded || !uid) {
      return NextResponse.json({ error: "Email link has expired or already been used." }, { status: 401 });
    }
    userId = uid;
  }

  const response = NextResponse.json({ ok: true, userId });
  cookiesToWrite.forEach(({ name, value, options }) =>
    response.cookies.set(name, value, options as Parameters<typeof response.cookies.set>[2])
  );
  return response;
}

async function upsertProfile(user: {
  id: string; email?: string | null; phone?: string | null;
  user_metadata?: Record<string, unknown>;
}) {
  if (!process.env.SUPABASE_SERVICE_ROLE_KEY) return;
  const { createClient } = await import("@supabase/supabase-js");
  const svc = createClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.SUPABASE_SERVICE_ROLE_KEY,
    { auth: { autoRefreshToken: false, persistSession: false } }
  );
  const meta  = (user.user_metadata ?? {}) as Record<string, string>;
  const raw   = meta.full_name ?? meta.name ?? user.email?.split("@")[0] ?? "User";
  const parts = raw.trim().split(/\s+/);
  await svc.from("profiles").upsert({
    id:         user.id,
    email:      user.email      ?? null,
    phone:      user.phone      ?? null,
    first_name: meta.first_name ?? parts[0]                ?? "User",
    last_name:  meta.last_name  ?? parts.slice(1).join(" ") ?? "",
    avatar_url: meta.avatar_url ?? meta.picture            ?? null,
    role:       "customer",
  }, { onConflict: "id", ignoreDuplicates: false });
}