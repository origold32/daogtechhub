export const dynamic = "force-dynamic";
// app/(auth)/auth/callback/route.ts
// Official Supabase SSR PKCE callback — server-side code exchange.

import { NextRequest, NextResponse } from "next/server";
import { createServerClient } from "@supabase/ssr";
import {
  buildRedirectUrl,
  getLegacySupabaseCookieOptions,
  isPkceMismatchError,
  listSupabasePkceCookieNames,
  OAUTH_PROVIDER_COOKIE_NAME,
  OAUTH_REDIRECT_COOKIE_NAME,
  OAUTH_RETRY_COOKIE_NAME,
  resolveRequestOrigin,
  sanitizeRedirectPath,
  SUPABASE_AUTH_COOKIE_OPTIONS,
} from "@/lib/auth-utils";

function redirectWithClearedPkce(request: NextRequest, url: string) {
  const response = NextResponse.redirect(url);
  const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;

  if (!supabaseUrl) return response;

  const pkceCookieNames = listSupabasePkceCookieNames(
    request.cookies.getAll().map(({ name }) => name),
    supabaseUrl,
  );

  pkceCookieNames.forEach((name) => {
    response.cookies.set(name, "", {
      path: "/",
      expires: new Date(0),
      maxAge: 0,
    });
  });

  return response;
}

function clearOAuthHelperCookies(response: NextResponse) {
  [OAUTH_PROVIDER_COOKIE_NAME, OAUTH_REDIRECT_COOKIE_NAME, OAUTH_RETRY_COOKIE_NAME].forEach((name) => {
    response.cookies.set(name, "", {
      path: "/",
      expires: new Date(0),
      maxAge: 0,
    });
  });
}

export async function GET(request: NextRequest) {
  const { searchParams } = new URL(request.url);

  const code       = searchParams.get("code");
  const next       = searchParams.get("next");
  const errorParam = searchParams.get("error");
  const errorDesc  = searchParams.get("error_description");
  const origin = resolveRequestOrigin(request.url, request.headers);
  const redirectPath = sanitizeRedirectPath(next);
  const authUrl = buildRedirectUrl(origin, "/auth", "redirectTo", redirectPath);

  if (errorParam) {
    const errorUrl = new URL(authUrl);
    errorUrl.searchParams.set("error", errorDesc ?? errorParam);
    return redirectWithClearedPkce(request, errorUrl.toString());
  }

  if (!code) {
    const errorUrl = new URL(authUrl);
    errorUrl.searchParams.set("error", "Missing auth code.");
    return redirectWithClearedPkce(request, errorUrl.toString());
  }

  const successUrl   = `${origin}/auth/verifying?next=${encodeURIComponent(redirectPath)}`;
  let response = NextResponse.redirect(successUrl);

  const supabase = createServerClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
    {
      cookieOptions: SUPABASE_AUTH_COOKIE_OPTIONS,
      cookies: {
        getAll: () => request.cookies.getAll(),
        setAll: (cookiesToSet) => {
          cookiesToSet.forEach(({ name, value, options }) => {
            response.cookies.set(name, value, options);
          });
        },
      },
    }
  );

  let { data, error } = await supabase.auth.exchangeCodeForSession(code);

  if ((error || !data?.user) && isPkceMismatchError(error?.message)) {
    const legacyCookieOptions = getLegacySupabaseCookieOptions(
      process.env.NEXT_PUBLIC_SUPABASE_URL,
    );

    if (legacyCookieOptions) {
      const legacySupabase = createServerClient(
        process.env.NEXT_PUBLIC_SUPABASE_URL!,
        process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
        {
          cookieOptions: legacyCookieOptions,
          cookies: {
            getAll: () => request.cookies.getAll(),
            setAll: () => {},
          },
        }
      );

      const legacyResult = await legacySupabase.auth.exchangeCodeForSession(code);

      if (!legacyResult.error && legacyResult.data.user && legacyResult.data.session) {
        const migration = await supabase.auth.setSession({
          access_token: legacyResult.data.session.access_token,
          refresh_token: legacyResult.data.session.refresh_token,
        });

        if (!migration.error) {
          data = legacyResult.data;
          error = null;
        }
      }
    }
  }

  if (error || !data.user) {
    const message = error?.message ?? "Sign-in failed.";
    if (isPkceMismatchError(message)) {
      const provider = request.cookies.get(OAUTH_PROVIDER_COOKIE_NAME)?.value;
      const retryValue = request.cookies.get(OAUTH_RETRY_COOKIE_NAME)?.value;

      if ((provider === "google" || provider === "facebook") && retryValue !== "1") {
        const retryUrl = new URL("/auth", origin);
        retryUrl.searchParams.set("redirectTo", redirectPath);
        retryUrl.searchParams.set("oauthRetry", provider);
        const retryResponse = redirectWithClearedPkce(request, retryUrl.toString());
        retryResponse.cookies.set(OAUTH_RETRY_COOKIE_NAME, "1", {
          path: "/",
          sameSite: "lax",
          maxAge: 600,
        });
        return retryResponse;
      }

      const errorUrl = new URL(authUrl);
      errorUrl.searchParams.set("error", "OAuth failed due to stale PKCE state. Please try Google again.");
      const errorResponse = redirectWithClearedPkce(request, errorUrl.toString());
      clearOAuthHelperCookies(errorResponse);
      return errorResponse;
    }

    const errorUrl = new URL(authUrl);
    errorUrl.searchParams.set("error", message);
    const errorResponse = redirectWithClearedPkce(request, errorUrl.toString());
    clearOAuthHelperCookies(errorResponse);
    return errorResponse;
  }

  response.headers.set("Cache-Control", "private, no-store");
  clearOAuthHelperCookies(response);
  upsertProfile(data.user).catch(() => {});
  return response;
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
    id: user.id, email: user.email ?? null, phone: user.phone ?? null,
    first_name: meta.first_name ?? parts[0] ?? "User",
    last_name:  meta.last_name  ?? parts.slice(1).join(" ") ?? "",
    avatar_url: meta.avatar_url ?? meta.picture ?? null,
    role: "customer",
  }, { onConflict: "id", ignoreDuplicates: false });
}
