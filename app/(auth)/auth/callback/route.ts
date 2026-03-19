// app/(auth)/auth/callback/route.ts
// Single canonical handler for ALL Supabase auth redirects.
//
// Handles:
//  1. PKCE code exchange → ?code=...           (OAuth: Google/Facebook)
//  2. OTP token hash    → ?token_hash=...&type= (magic-link email clicks)
//
// Supabase Dashboard → Auth → URL Configuration:
//   Site URL:      http://localhost:3232
//   Redirect URLs: http://localhost:3232/auth/callback

import { NextRequest, NextResponse } from "next/server";

export async function GET(request: NextRequest) {
  const { searchParams, origin } = new URL(request.url);

  const code       = searchParams.get("code");
  const tokenHash  = searchParams.get("token_hash");
  const type       = searchParams.get("type") ?? "email";
  const next       = searchParams.get("next") ?? "/profile";
  const errorParam = searchParams.get("error");
  const errorDesc  = searchParams.get("error_description");

  // Surface provider-level errors (OAuth denied, etc.)
  if (errorParam) {
    const friendly = toFriendlyCallbackError(errorDesc ?? errorParam);
    return NextResponse.redirect(`${origin}/auth?error=${encodeURIComponent(friendly)}`);
  }

  if (!code && !tokenHash) {
    return NextResponse.redirect(
      `${origin}/auth?error=${encodeURIComponent("Invalid sign-in link — please request a new one.")}`
    );
  }

  if (!process.env.NEXT_PUBLIC_SUPABASE_URL || !process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY) {
    return NextResponse.redirect(
      `${origin}/auth?error=${encodeURIComponent("Auth is not configured — check your .env.local.")}`
    );
  }

  try {
    const { createServerSupabaseClient, createServiceRoleClient } = await import("@/supabase/server");
    const supabase = await createServerSupabaseClient();

    let userId:    string | undefined;
    let userEmail: string | null | undefined;
    let userPhone: string | null | undefined;
    let userMeta:  Record<string, any> = {};

    // Path A: PKCE code exchange (OAuth, email sign-up)
    if (code) {
      const { data, error } = await supabase.auth.exchangeCodeForSession(code);
      if (error || !data?.user) {
        const msg = toFriendlyCallbackError(error?.message ?? "Authentication failed.");
        return NextResponse.redirect(`${origin}/auth?error=${encodeURIComponent(msg)}`);
      }
      userId    = data.user.id;
      userEmail = data.user.email;
      userPhone = data.user.phone;
      userMeta  = data.user.user_metadata ?? {};
    }

    // Path B: token_hash (magic-link clicks, OTP email)
    if (tokenHash && !code) {
      const otpType = (
        type === "signup"       ? "signup"       :
        type === "invite"       ? "invite"       :
        type === "email_change" ? "email_change" :
        type === "magiclink"    ? "magiclink"    : "email"
      ) as "email" | "signup" | "invite" | "magiclink" | "email_change";

      const { data, error } = await supabase.auth.verifyOtp({ token_hash: tokenHash, type: otpType });

      if (error || !data?.user) {
        const msg = toFriendlyCallbackError(error?.message ?? "Invalid or expired link.");
        return NextResponse.redirect(`${origin}/auth?error=${encodeURIComponent(msg)}`);
      }

      userId    = data.user.id;
      userEmail = data.user.email;
      userPhone = data.user.phone;
      userMeta  = data.user.user_metadata ?? {};
    }

    if (!userId) {
      return NextResponse.redirect(
        `${origin}/auth?error=${encodeURIComponent("Authentication failed — please try signing in again.")}`
      );
    }

    // Upsert profile (belt-and-suspenders alongside the DB trigger)
    try {
      const rawName   = userMeta.full_name ?? userMeta.name ?? userEmail?.split("@")[0] ?? "User";
      const nameParts = rawName.trim().split(/\s+/);
      const service   = createServiceRoleClient();

      await service.from("profiles").upsert(
        {
          id:         userId,
          email:      userEmail  ?? null,
          phone:      userPhone  ?? null,
          first_name: userMeta.first_name ?? nameParts[0]               ?? "User",
          last_name:  userMeta.last_name  ?? nameParts.slice(1).join(" ") ?? "",
          avatar_url: userMeta.avatar_url ?? userMeta.picture           ?? null,
          role:       "customer",
        },
        { onConflict: "id", ignoreDuplicates: false }
      );
    } catch (profileErr) {
      // Non-fatal — DB trigger is the primary path
      console.warn("[callback] profile upsert:", (profileErr as Error).message);
    }

    const redirectPath = next.startsWith("/") ? next : "/";
    return NextResponse.redirect(`${origin}${redirectPath}`);

  } catch (err) {
    console.error("[auth/callback]", err);
    return NextResponse.redirect(
      `${origin}/auth?error=${encodeURIComponent("Something went wrong — please try signing in again.")}`
    );
  }
}

function toFriendlyCallbackError(raw: string): string {
  const m = raw.toLowerCase();
  if (m.includes("expired"))                              return "Your sign-in link has expired. Please request a new one.";
  if (m.includes("already used") || m.includes("used"))  return "This sign-in link was already used. Please request a new one.";
  if (m.includes("invalid") && m.includes("code"))       return "Invalid authentication code. Please try signing in again.";
  if (m.includes("email link is invalid"))                return "That sign-in link is invalid or has already been used.";
  if (m.includes("access denied"))                        return "Access was denied. Please try again.";
  if (m.includes("pkce") || m.includes("code verifier")) return "Session mismatch — please clear cookies and try again.";
  if (m.includes("redirect_uri"))                         return "Redirect URL mismatch — contact support.";
  return raw.charAt(0).toUpperCase() + raw.slice(1);
}
