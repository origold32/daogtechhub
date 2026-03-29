export const dynamic = "force-dynamic";

import { NextRequest, NextResponse } from "next/server";
import { createServerClient } from "@supabase/ssr";
import {
  buildRedirectUrl,
  listSupabasePkceCookieNames,
  resolveRequestOrigin,
  sanitizeRedirectPath,
  SUPABASE_AUTH_COOKIE_OPTIONS,
} from "@/lib/auth-utils";

type OAuthProvider = "google" | "facebook";

function isOAuthProvider(value: string | null): value is OAuthProvider {
  return value === "google" || value === "facebook";
}

export async function GET(request: NextRequest) {
  const { searchParams } = new URL(request.url);
  const provider = searchParams.get("provider");
  const redirectPath = sanitizeRedirectPath(searchParams.get("next"));
  const origin = resolveRequestOrigin(request.url, request.headers);
  const authUrl = buildRedirectUrl(origin, "/auth", "redirectTo", redirectPath);

  if (!isOAuthProvider(provider)) {
    const errorUrl = new URL(authUrl);
    errorUrl.searchParams.set("error", "Unsupported OAuth provider.");
    return NextResponse.redirect(errorUrl.toString());
  }

  const cookiesToSet: Array<{
    name: string;
    value: string;
    options?: Parameters<NextResponse["cookies"]["set"]>[2];
  }> = [];

  const supabase = createServerClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
    {
      cookieOptions: SUPABASE_AUTH_COOKIE_OPTIONS,
      cookies: {
        getAll: () => request.cookies.getAll(),
        setAll: (incomingCookies) => {
          incomingCookies.forEach(({ name, value, options }) => {
            cookiesToSet.push({ name, value, options });
          });
        },
      },
    }
  );

  const callbackUrl = buildRedirectUrl(origin, "/auth/callback", "next", redirectPath);
  const { data, error } = await supabase.auth.signInWithOAuth({
    provider,
    options: {
      redirectTo: callbackUrl,
      skipBrowserRedirect: true,
    },
  });

  if (error || !data?.url) {
    const errorUrl = new URL(authUrl);
    errorUrl.searchParams.set("error", error?.message ?? "Google sign-in failed.");
    return NextResponse.redirect(errorUrl.toString());
  }

  const response = NextResponse.redirect(data.url);
  const pkceCookieNames = listSupabasePkceCookieNames(
    request.cookies.getAll().map(({ name }) => name),
    process.env.NEXT_PUBLIC_SUPABASE_URL,
  );

  pkceCookieNames.forEach((name) => {
    response.cookies.set(name, "", {
      path: "/",
      expires: new Date(0),
      maxAge: 0,
    });
  });

  cookiesToSet.forEach(({ name, value, options }) => {
    response.cookies.set(name, value, options);
  });

  response.headers.set("Cache-Control", "private, no-store");
  return response;
}
