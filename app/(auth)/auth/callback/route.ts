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

  const successUrl = new URL(redirectPath, origin).toString();
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
      const errorUrl = new URL(authUrl);
      errorUrl.searchParams.set("error", "OAuth failed due to stale PKCE state. Please try Google again.");
      return redirectWithClearedPkce(request, errorUrl.toString());
    }

    const errorUrl = new URL(authUrl);
    errorUrl.searchParams.set("error", message);
    return redirectWithClearedPkce(request, errorUrl.toString());
  }

  response.headers.set("Cache-Control", "private, no-store");
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
