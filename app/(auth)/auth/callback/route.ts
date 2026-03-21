export const dynamic = "force-dynamic";
// app/(auth)/auth/callback/route.ts
// Forwards OAuth codes to /auth/verifying for CLIENT-SIDE exchange.
// The PKCE code_verifier is stored in localStorage by @supabase/supabase-js.
// Server-side exchange cannot access localStorage, so we forward to the client page.
// This handles both: new JS (redirects to /auth/verifying directly) and
// old cached JS (redirects to /auth/callback first, then forwarded here).

import { NextRequest, NextResponse } from "next/server";

export async function GET(request: NextRequest) {
  const { searchParams, origin } = new URL(request.url);

  const code       = searchParams.get("code");
  const next       = searchParams.get("next") ?? "/profile";
  const errorParam = searchParams.get("error");
  const errorDesc  = searchParams.get("error_description");

  // Surface provider-level errors
  if (errorParam) {
    const msg = errorDesc ?? errorParam;
    return NextResponse.redirect(
      `${origin}/auth?error=${encodeURIComponent(msg)}`
    );
  }

  const redirectPath = next.startsWith("/") ? next : "/profile";

  // Forward code to /auth/verifying for client-side exchange.
  // The browser client uses localStorage for the PKCE verifier.
  if (code) {
    const dest = new URL(`${origin}/auth/verifying`);
    dest.searchParams.set("code", code);
    dest.searchParams.set("next", redirectPath);
    return NextResponse.redirect(dest.toString());
  }

  // No code — just go to verifying
  return NextResponse.redirect(
    `${origin}/auth/verifying?next=${encodeURIComponent(redirectPath)}`
  );
}