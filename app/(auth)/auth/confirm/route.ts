export const dynamic = "force-dynamic";
// app/(auth)/auth/confirm/route.ts
// Handles direct email-link clicks from Gmail / email clients.
//
// Flow: User clicks link in email → Supabase sends ?token_hash=XXX&type=email here
// 1. createServerClient reads token_hash from URL
// 2. verifyOtp() exchanges token server-side (stateless — no code_verifier needed)
// 3. Session cookies are written onto the redirect response
// 4. Browser is redirected to /auth/verifying which shows success UI
//
// This is separate from OAuth (/auth/callback) because email links use
// token_hash verification, not PKCE code exchange.

import { NextRequest, NextResponse } from "next/server";
import { createServerClient } from "@supabase/ssr";

export async function GET(request: NextRequest) {
  const { searchParams, origin } = new URL(request.url);

  const tokenHash  = searchParams.get("token_hash");
  const type       = (searchParams.get("type") ?? "email") as
    "email" | "signup" | "magiclink" | "recovery" | "invite" | "email_change";
  const next       = searchParams.get("next") ?? "/profile";
  const errorParam = searchParams.get("error");
  const errorDesc  = searchParams.get("error_description");

  if (errorParam) {
    return NextResponse.redirect(
      `${origin}/auth?error=${encodeURIComponent(errorDesc ?? errorParam)}`
    );
  }

  if (!tokenHash) {
    return NextResponse.redirect(`${origin}/auth?error=${encodeURIComponent("Invalid sign-in link.")}`);
  }

  const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!;
  const supabaseKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!;

  const redirectPath = next.startsWith("/") ? next : "/profile";
  const successUrl   = `${origin}/auth/verifying?next=${encodeURIComponent(redirectPath)}`;
  let   response     = NextResponse.redirect(successUrl);

  const supabase = createServerClient(supabaseUrl, supabaseKey, {
    cookies: {
      getAll: () => request.cookies.getAll(),
      setAll: (cookiesToSet) => {
        cookiesToSet.forEach(({ name, value }) => request.cookies.set(name, value));
        response = NextResponse.redirect(successUrl);
        cookiesToSet.forEach(({ name, value, options }) =>
          response.cookies.set(name, value, options)
        );
      },
    },
  });

  // Try the declared type first, then fallback through common types
  const typesToTry: typeof type[] = [type, "email", "magiclink", "signup", "recovery", "invite", "email_change"];
  const ordered = [...new Set(typesToTry)]; // deduplicate

  let succeeded = false;
  for (const t of ordered) {
    const { data, error } = await supabase.auth.verifyOtp({ token_hash: tokenHash, type: t });
    if (!error && data.user) {
      upsertProfile(data.user).catch(() => {});
      succeeded = true;
      break;
    }
  }

  if (!succeeded) {
    return NextResponse.redirect(
      `${origin}/auth?error=${encodeURIComponent("Sign-in link has expired or already been used. Please request a new one.")}`
    );
  }

  return response; // carries session cookies
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
