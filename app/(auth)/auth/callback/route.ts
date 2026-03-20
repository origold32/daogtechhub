export const dynamic = "force-dynamic";
// app/(auth)/auth/callback/route.ts
// Handles ALL Supabase auth redirects using the official @supabase/ssr pattern.
//
// PKCE OAuth (?code=): Exchange server-side. The code_verifier is in cookies
//   (set by createBrowserClient before OAuth redirect) and IS available here.
//   Session cookies are written onto the redirect response so the browser gets them.
//
// OTP (?token_hash=): Stateless exchange server-side.
//
// Errors: Redirect to /auth with friendly message.

import { NextRequest, NextResponse } from "next/server";
import { createServerClient } from "@supabase/ssr";

export async function GET(request: NextRequest) {
  const { searchParams, origin } = new URL(request.url);

  const code       = searchParams.get("code");
  const tokenHash  = searchParams.get("token_hash");
  const type       = searchParams.get("type") ?? "email";
  const next       = searchParams.get("next") ?? "/profile";
  const errorParam = searchParams.get("error");
  const errorDesc  = searchParams.get("error_description");

  const redirectPath = next.startsWith("/") ? next : "/profile";

  // ── Provider errors ────────────────────────────────────────────────────────
  if (errorParam) {
    const msg = toFriendlyError(errorDesc ?? errorParam);
    return NextResponse.redirect(`${origin}/auth?error=${encodeURIComponent(msg)}`);
  }

  if (!process.env.NEXT_PUBLIC_SUPABASE_URL || !process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY) {
    return NextResponse.redirect(`${origin}/auth?error=${encodeURIComponent("Auth not configured.")}`);
  }

  // ── Build the final redirect response FIRST ───────────────────────────────
  // We pass this response to createServerClient so Supabase can write the
  // session cookies directly onto the response the browser will receive.
  const successUrl  = `${origin}/auth/verifying?next=${encodeURIComponent(redirectPath)}`;
  let   response    = NextResponse.redirect(successUrl);

  // ── Create server Supabase client that writes cookies onto our response ───
  const supabase = createServerClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY,
    {
      cookies: {
        getAll: () => request.cookies.getAll(),
        setAll: (cookiesToSet) => {
          // Write to the request (for this handler's use)
          cookiesToSet.forEach(({ name, value }) => request.cookies.set(name, value));
          // Re-create the response so new cookies are included
          response = NextResponse.redirect(successUrl);
          cookiesToSet.forEach(({ name, value, options }) =>
            response.cookies.set(name, value, options)
          );
        },
      },
    }
  );

  // ── Handle ?code= (OAuth PKCE) ────────────────────────────────────────────
  if (code) {
    const { data, error } = await supabase.auth.exchangeCodeForSession(code);

    if (error || !data?.user) {
      const msg = toFriendlyError(error?.message ?? "Authentication failed.");
      return NextResponse.redirect(`${origin}/auth?error=${encodeURIComponent(msg)}`);
    }

    // Upsert profile via service role (non-blocking)
    upsertProfile(data.user).catch(console.warn);

    return response; // carries the session cookies
  }

  // ── Handle ?token_hash= (OTP email links) ─────────────────────────────────
  if (tokenHash) {
    const types: Array<"email"|"signup"|"magiclink"|"invite"|"recovery"|"email_change"> =
      ["email", "magiclink", "signup", "invite", "recovery", "email_change"];
    const declared = types.find((t) => t === type);
    const ordered  = declared ? [declared, ...types.filter((t) => t !== declared)] : types;

    let succeeded = false;
    for (const otpType of ordered) {
      const { data, error } = await supabase.auth.verifyOtp({ token_hash: tokenHash, type: otpType });
      if (!error && data?.user) {
        upsertProfile(data.user).catch(console.warn);
        succeeded = true;
        break;
      }
    }

    if (!succeeded) {
      return NextResponse.redirect(
        `${origin}/auth?error=${encodeURIComponent("Your sign-in link has expired. Please request a new one.")}`
      );
    }

    return response; // carries the session cookies
  }

  // ── No code or token_hash — just go to verifying ──────────────────────────
  return response;
}

// ── Profile upsert helper ─────────────────────────────────────────────────────
async function upsertProfile(user: { id: string; email?: string | null; phone?: string | null; user_metadata?: Record<string, any> }) {
  if (!process.env.SUPABASE_SERVICE_ROLE_KEY) return;
  const { createClient } = await import("@supabase/supabase-js");
  const service   = createClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.SUPABASE_SERVICE_ROLE_KEY,
    { auth: { autoRefreshToken: false, persistSession: false } }
  );
  const meta      = user.user_metadata ?? {};
  const rawName   = meta.full_name ?? meta.name ?? user.email?.split("@")[0] ?? "User";
  const parts     = rawName.trim().split(/\s+/);
  await service.from("profiles").upsert({
    id:         user.id,
    email:      user.email      ?? null,
    phone:      user.phone      ?? null,
    first_name: meta.first_name ?? parts[0]                ?? "User",
    last_name:  meta.last_name  ?? parts.slice(1).join(" ") ?? "",
    avatar_url: meta.avatar_url ?? meta.picture            ?? null,
    role:       "customer",
  }, { onConflict: "id", ignoreDuplicates: false });
}

function toFriendlyError(raw: string): string {
  const m = raw.toLowerCase();
  if (m.includes("expired"))           return "Your sign-in link has expired. Please request a new one.";
  if (m.includes("already used"))      return "This link was already used. Please request a new one.";
  if (m.includes("access denied"))     return "Access was denied. Please try again.";
  if (m.includes("pkce") || m.includes("code verifier")) return "Session error — please try signing in again.";
  if (m.includes("redirect_uri"))      return "Redirect URL mismatch — please contact support.";
  return raw.charAt(0).toUpperCase() + raw.slice(1);
}