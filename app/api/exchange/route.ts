export const dynamic = "force-dynamic";
// app/api/auth/exchange/route.ts
// Server-side PKCE code exchange endpoint.
// Called by /auth/verifying page with the OAuth code.
// Reads code_verifier from cookies, exchanges with Supabase, sets session cookies.

import { NextRequest, NextResponse } from "next/server";
import { createServerClient } from "@supabase/ssr";

export async function GET(request: NextRequest) {
  const { searchParams } = new URL(request.url);
  const code = searchParams.get("code");

  if (!code) {
    return NextResponse.json({ error: "No code provided" }, { status: 400 });
  }

  const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!;
  const supabaseKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!;

  const cookiesToWrite: { name: string; value: string; options: Record<string, unknown> }[] = [];

  const supabase = createServerClient(supabaseUrl, supabaseKey, {
    cookies: {
      getAll: () => request.cookies.getAll(),
      setAll: (cookies) => {
        cookies.forEach(c => cookiesToWrite.push(c));
      },
    },
  });

  const { data, error } = await supabase.auth.exchangeCodeForSession(code);

  if (error || !data.user) {
    return NextResponse.json(
      { error: error?.message ?? "Exchange failed" },
      { status: 401 }
    );
  }

  // Build JSON success response and attach session cookies
  const response = NextResponse.json({ ok: true, userId: data.user.id });
  cookiesToWrite.forEach(({ name, value, options }) => {
    response.cookies.set(name, value, options as Parameters<typeof response.cookies.set>[2]);
  });

  // Upsert profile non-blocking
  upsertProfile(data.user).catch(() => {});

  return response;
}

async function upsertProfile(user: {
  id: string;
  email?: string | null;
  phone?: string | null;
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