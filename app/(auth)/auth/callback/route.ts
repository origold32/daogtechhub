export const dynamic = "force-dynamic";
// app/(auth)/auth/callback/route.ts
//
// PKCE OAuth (Google/Facebook): ?code=XXX
//   → Forward to /auth/verifying?code=XXX so the BROWSER client can exchange it.
//   → The browser client has the PKCE code_verifier in storage; server does not.
//
// OTP email links: ?token_hash=XXX&type=YYY
//   → Exchange server-side (stateless, no code_verifier needed).
//
// Errors: ?error=XXX → show on /auth page.

import { NextRequest, NextResponse } from "next/server";

export async function GET(request: NextRequest) {
  const { searchParams, origin } = new URL(request.url);

  const code       = searchParams.get("code");
  const tokenHash  = searchParams.get("token_hash");
  const type       = searchParams.get("type") ?? "magiclink";
  const next       = searchParams.get("next") ?? "/profile";
  const errorParam = searchParams.get("error");
  const errorDesc  = searchParams.get("error_description");

  // ── Provider errors ────────────────────────────────────────────────────────
  if (errorParam) {
    const msg = toFriendlyError(errorDesc ?? errorParam);
    return NextResponse.redirect(`${origin}/auth?error=${encodeURIComponent(msg)}`);
  }

  const redirectPath = next.startsWith("/") ? next : "/profile";

  // ── OAuth PKCE (?code=) — forward to client-side verifying page ───────────
  // The browser client holds the PKCE code_verifier. We cannot exchange this
  // server-side because the verifier is in the browser's localStorage/cookies,
  // not accessible to the server route handler.
  if (code) {
    const url = new URL(`${origin}/auth/verifying`);
    url.searchParams.set("code", code);
    url.searchParams.set("next", redirectPath);
    return NextResponse.redirect(url.toString());
  }

  // ── OTP token_hash — exchange server-side (stateless) ─────────────────────
  if (tokenHash) {
    if (!process.env.NEXT_PUBLIC_SUPABASE_URL || !process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY) {
      return NextResponse.redirect(`${origin}/auth?error=${encodeURIComponent("Auth not configured.")}`);
    }

    try {
      const { createServerSupabaseClient, createServiceRoleClient } = await import("@/supabase/server");
      const supabase = await createServerSupabaseClient();

      const typesToTry: Array<"email" | "signup" | "magiclink" | "invite" | "recovery" | "email_change"> =
        ["email", "magiclink", "signup", "invite", "recovery", "email_change"];
      // Put declared type first
      const declared = typesToTry.find((t) => t === type);
      const ordered  = declared ? [declared, ...typesToTry.filter((t) => t !== declared)] : typesToTry;

      let userId: string | undefined;
      let userEmail: string | null | undefined;
      let userMeta: Record<string, any> = {};

      for (const otpType of ordered) {
        const { data, error } = await supabase.auth.verifyOtp({ token_hash: tokenHash, type: otpType });
        if (!error && data?.user) {
          userId    = data.user.id;
          userEmail = data.user.email;
          userMeta  = data.user.user_metadata ?? {};
          break;
        }
      }

      if (!userId) {
        return NextResponse.redirect(
          `${origin}/auth?error=${encodeURIComponent("Your sign-in link has expired. Please request a new one.")}`
        );
      }

      // Upsert profile via service role
      try {
        const service   = createServiceRoleClient();
        const rawName   = userMeta.full_name ?? userMeta.name ?? userEmail?.split("@")[0] ?? "User";
        const nameParts = rawName.trim().split(/\s+/);
        await service.from("profiles").upsert({
          id:         userId,
          email:      userEmail ?? null,
          first_name: userMeta.first_name ?? nameParts[0] ?? "User",
          last_name:  userMeta.last_name  ?? nameParts.slice(1).join(" ") ?? "",
          avatar_url: userMeta.avatar_url ?? userMeta.picture ?? null,
          role:       "customer",
        }, { onConflict: "id", ignoreDuplicates: false });
      } catch (e) {
        console.warn("[callback] profile upsert:", (e as Error).message);
      }

      // Redirect to verifying page — client will detect active session
      const dest = new URL(`${origin}/auth/verifying`);
      dest.searchParams.set("next", redirectPath);
      return NextResponse.redirect(dest.toString());

    } catch (err) {
      console.error("[auth/callback]", err);
      return NextResponse.redirect(
        `${origin}/auth?error=${encodeURIComponent("Something went wrong. Please try again.")}`
      );
    }
  }

  // ── No code or token_hash — go to verifying (handles #hash implicit flow) ──
  const dest = new URL(`${origin}/auth/verifying`);
  dest.searchParams.set("next", redirectPath);
  return NextResponse.redirect(dest.toString());
}

function toFriendlyError(raw: string): string {
  const m = raw.toLowerCase();
  if (m.includes("expired"))      return "Your sign-in link has expired. Please request a new one.";
  if (m.includes("already used")) return "This link was already used. Please request a new one.";
  if (m.includes("access denied")) return "Access was denied. Please try again.";
  if (m.includes("pkce") || m.includes("code verifier")) return "Session error — please sign in again.";
  return raw.charAt(0).toUpperCase() + raw.slice(1);
}