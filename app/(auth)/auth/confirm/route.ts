export const dynamic = "force-dynamic";
// app/(auth)/auth/confirm/route.ts
// Handles email magic link clicks. Verifies token_hash server-side.

import { NextRequest, NextResponse } from "next/server";
import { createServerClient } from "@supabase/ssr";
import {
  buildRedirectUrl,
  resolveRequestOrigin,
  sanitizeRedirectPath,
} from "@/lib/auth-utils";

export async function GET(request: NextRequest) {
  const { searchParams } = new URL(request.url);

  const tokenHash  = searchParams.get("token_hash");
  const type       = (searchParams.get("type") ?? "email") as "email" | "signup" | "magiclink" | "recovery";
  const next       = searchParams.get("next");
  const errorParam = searchParams.get("error");
  const origin     = resolveRequestOrigin(request.url, request.headers);
  const redirectPath = sanitizeRedirectPath(next);
  const successUrl = `${origin}/auth/verifying?next=${encodeURIComponent(redirectPath)}`;
  const authUrl = buildRedirectUrl(origin, "/auth", "redirectTo", redirectPath);

  if (errorParam) {
    const errorUrl = new URL(authUrl);
    errorUrl.searchParams.set("error", searchParams.get("error_description") ?? errorParam);
    return NextResponse.redirect(errorUrl);
  }

  if (!tokenHash) {
    const errorUrl = new URL(authUrl);
    errorUrl.searchParams.set("error", "Invalid sign-in link.");
    return NextResponse.redirect(errorUrl);
  }
  let response = NextResponse.redirect(successUrl);

  const supabase = createServerClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
    {
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
    }
  );

  const { error } = await supabase.auth.verifyOtp({ token_hash: tokenHash, type });

  if (error) {
    const errorUrl = new URL(authUrl);
    errorUrl.searchParams.set("error", "Sign-in link expired. Please request a new one.");
    return NextResponse.redirect(errorUrl);
  }

  response.headers.set("Cache-Control", "private, no-store");
  return response;
}
