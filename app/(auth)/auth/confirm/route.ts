export const dynamic = "force-dynamic";
// app/(auth)/auth/confirm/route.ts
// Handles email magic link clicks. Verifies token_hash server-side.

import { NextRequest, NextResponse } from "next/server";
import { createServerClient } from "@supabase/ssr";

export async function GET(request: NextRequest) {
  const { searchParams, origin } = new URL(request.url);

  const tokenHash  = searchParams.get("token_hash");
  const type       = (searchParams.get("type") ?? "email") as "email" | "signup" | "magiclink" | "recovery";
  const next       = searchParams.get("next") ?? "/profile";
  const errorParam = searchParams.get("error");

  if (errorParam) {
    return NextResponse.redirect(
      `${origin}/auth?error=${encodeURIComponent(searchParams.get("error_description") ?? errorParam)}`
    );
  }

  if (!tokenHash) {
    return NextResponse.redirect(`${origin}/auth?error=${encodeURIComponent("Invalid sign-in link.")}`);
  }

  const forwardedHost = request.headers.get("x-forwarded-host");
  const host = forwardedHost && process.env.NODE_ENV !== "development"
    ? `https://${forwardedHost}`
    : origin;

  const redirectPath = next.startsWith("/") ? next : "/profile";
  let   response     = NextResponse.redirect(`${host}${redirectPath}`);

  const supabase = createServerClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
    {
      cookies: {
        getAll: () => request.cookies.getAll(),
        setAll: (cookiesToSet) => {
          cookiesToSet.forEach(({ name, value }) => request.cookies.set(name, value));
          response = NextResponse.redirect(`${host}${redirectPath}`);
          cookiesToSet.forEach(({ name, value, options }) =>
            response.cookies.set(name, value, options)
          );
        },
      },
    }
  );

  const { error } = await supabase.auth.verifyOtp({ token_hash: tokenHash, type });

  if (error) {
    return NextResponse.redirect(
      `${host}/auth?error=${encodeURIComponent("Sign-in link expired. Please request a new one.")}`
    );
  }

  response.headers.set("Cache-Control", "private, no-store");
  return response;
}
