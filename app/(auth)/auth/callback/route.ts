export const dynamic = "force-dynamic";
// app/(auth)/auth/callback/route.ts
// Handles ALL possible Supabase auth redirect formats:
//   ?token_hash=X&type=Y  → magic link / OTP (token hash flow, works cross-browser)
//   ?code=X               → OAuth PKCE (Google, Facebook)
//   #access_token=X       → implicit flow (handled client-side via /auth/verifying)
//   ?error=X              → provider-level errors

import { NextRequest, NextResponse } from "next/server";

export async function GET(request: NextRequest) {
  const { searchParams, origin } = new URL(request.url);

  const code        = searchParams.get("code");
  const tokenHash   = searchParams.get("token_hash");
  const type        = searchParams.get("type") ?? "magiclink";
  const next        = searchParams.get("next") ?? "/profile";
  const errorParam  = searchParams.get("error");
  const errorDesc   = searchParams.get("error_description");

  // ── Provider-level errors (OAuth denied, link expired at provider) ─────────
  if (errorParam) {
    const friendly = toFriendlyCallbackError(errorDesc ?? errorParam);
    return NextResponse.redirect(
      `${origin}/auth?error=${encodeURIComponent(friendly)}`
    );
  }

  // ── No usable params — may be hash/implicit flow (handled client-side) ─────
  if (!code && !tokenHash) {
    // Redirect to verifying page; client JS will pick up #access_token from hash
    return NextResponse.redirect(
      `${origin}/auth/verifying?next=${encodeURIComponent(next)}`
    );
  }

  if (!process.env.NEXT_PUBLIC_SUPABASE_URL || !process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY) {
    return NextResponse.redirect(
      `${origin}/auth?error=${encodeURIComponent("Auth is not configured.")}`
    );
  }

  try {
    const { createServerSupabaseClient, createServiceRoleClient } =
      await import("@/supabase/server");
    const supabase = await createServerSupabaseClient();

    let userId:    string | undefined;
    let userEmail: string | null | undefined;
    let userPhone: string | null | undefined;
    let userMeta:  Record<string, any> = {};

    // ── Path A: token_hash — magic links, OTP email clicks ───────────────────
    // Stateless — works in any browser, no PKCE cookie needed.
    if (tokenHash) {
      // Supabase sends type=magiclink for magic links, type=signup for new users,
      // type=email for OTP codes. Try the declared type first, then fall back.
      const typesToTry = buildTypeFallbacks(type);
      let lastError: string | undefined;

      for (const otpType of typesToTry) {
        const { data, error } = await supabase.auth.verifyOtp({
          token_hash: tokenHash,
          type: otpType,
        });

        if (!error && data?.user) {
          userId    = data.user.id;
          userEmail = data.user.email;
          userPhone = data.user.phone;
          userMeta  = data.user.user_metadata ?? {};
          lastError = undefined;
          break;
        }
        lastError = error?.message ?? "Verification failed.";
      }

      if (!userId) {
        const msg = toFriendlyCallbackError(lastError ?? "Invalid or expired link.");
        return NextResponse.redirect(
          `${origin}/auth?error=${encodeURIComponent(msg)}`
        );
      }
    }

    // ── Path B: code — OAuth PKCE (Google, Facebook) ─────────────────────────
    if (code && !tokenHash) {
      const { data, error } = await supabase.auth.exchangeCodeForSession(code);

      if (error || !data?.user) {
        const msg = toFriendlyCallbackError(error?.message ?? "Authentication failed.");
        return NextResponse.redirect(
          `${origin}/auth?error=${encodeURIComponent(msg)}`
        );
      }

      userId    = data.user.id;
      userEmail = data.user.email;
      userPhone = data.user.phone;
      userMeta  = data.user.user_metadata ?? {};
    }

    if (!userId) {
      return NextResponse.redirect(
        `${origin}/auth?error=${encodeURIComponent("Authentication failed — please try again.")}`
      );
    }

    // ── Upsert profile ────────────────────────────────────────────────────────
    try {
      const rawName   = userMeta.full_name ?? userMeta.name ?? userEmail?.split("@")[0] ?? "User";
      const nameParts = rawName.trim().split(/\s+/);
      const service   = createServiceRoleClient();

      await service.from("profiles").upsert(
        {
          id:         userId,
          email:      userEmail  ?? null,
          phone:      userPhone  ?? null,
          first_name: userMeta.first_name ?? nameParts[0]                ?? "User",
          last_name:  userMeta.last_name  ?? nameParts.slice(1).join(" ") ?? "",
          avatar_url: userMeta.avatar_url ?? userMeta.picture            ?? null,
          role:       "customer",
        },
        { onConflict: "id", ignoreDuplicates: false }
      );
    } catch (profileErr) {
      console.warn("[callback] profile upsert:", (profileErr as Error).message);
    }

    // ── Success → smooth verifying page ──────────────────────────────────────
    const redirectPath = next.startsWith("/") ? next : "/profile";
    return NextResponse.redirect(
      `${origin}/auth/verifying?next=${encodeURIComponent(redirectPath)}`
    );

  } catch (err) {
    console.error("[auth/callback]", err);
    return NextResponse.redirect(
      `${origin}/auth?error=${encodeURIComponent("Something went wrong — please try signing in again.")}`
    );
  }
}

// Try multiple OTP types in order — Supabase sometimes sends a different
// type string than expected (e.g. "email" vs "magiclink").
function buildTypeFallbacks(declared: string) {
  type OtpType = "email" | "signup" | "invite" | "magiclink" | "email_change" | "recovery";
  const all: OtpType[] = ["magiclink", "email", "signup", "invite", "recovery", "email_change"];
  const primary = all.find((t) => t === declared) ?? "magiclink";
  // Put declared type first, then try the rest
  return [primary, ...all.filter((t) => t !== primary)];
}

function toFriendlyCallbackError(raw: string): string {
  const m = raw.toLowerCase();
  if (m.includes("expired") || m.includes("otp has expired"))
    return "Your sign-in link has expired. Please request a new one.";
  if (m.includes("already used") || m.includes("token has been used"))
    return "This sign-in link has already been used. Please request a new one.";
  if (m.includes("invalid") && m.includes("code"))
    return "Invalid sign-in code. Please try again.";
  if (m.includes("email link is invalid"))
    return "That sign-in link is invalid or has already been used.";
  if (m.includes("access denied"))
    return "Access was denied. Please try again.";
  if (m.includes("pkce") || m.includes("code verifier"))
    return "Session expired — please request a new sign-in link.";
  if (m.includes("redirect_uri"))
    return "Redirect URL mismatch — please contact support.";
  if (m.includes("invalid otp") || m.includes("invalid token"))
    return "Your sign-in link is invalid. Please request a new one.";
  return raw.charAt(0).toUpperCase() + raw.slice(1);
}