export const dynamic = "force-dynamic";
// app/(auth)/auth/callback/route.ts
// Official Supabase SSR PKCE callback — server-side code exchange.

import { NextRequest, NextResponse } from "next/server";
import { createServerClient } from "@supabase/ssr";
import {
  buildRedirectUrl,
  listSupabasePkceCookieNames,
  resolveRequestOrigin,
  sanitizeRedirectPath,
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

  const successUrl   = `${origin}/auth/verifying?next=${encodeURIComponent(redirectPath)}`;
  let response = NextResponse.redirect(successUrl);

  const supabase = createServerClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
    {
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

  const { data, error } = await supabase.auth.exchangeCodeForSession(code);

  if (error || !data.user) {
<<<<<<< HEAD
    const errorUrl = new URL(authUrl);
    errorUrl.searchParams.set("error", error?.message ?? "Sign-in failed.");
    return redirectWithClearedPkce(request, errorUrl.toString());
=======
    const message = error?.message ?? "Sign-in failed.";

    // PKCE FIX: On code challenge/verifier mismatch, delete stale cookies and redirect to retry
    const clearPkceCookies = (response: NextResponse) => {
      for (const cookie of request.cookies.getAll()) {
        if (cookie.name.endsWith("-code-verifier")) {
          response.cookies.delete(cookie.name); // Next.js deletes by name only
        }
      }
    };

    if (message.includes("code challenge") && message.includes("code verifier")) {
      console.warn("[/auth/callback] PKCE mismatch: clearing stale code verifier cookie and forcing fresh login");
      const errResponse = NextResponse.redirect(
        `${origin}/auth?error=${encodeURIComponent("OAuth failed due to stale PKCE code_verifier. Clear cookies and try again.")}`
      );
      clearPkceCookies(errResponse);
      return errResponse;
    }

    const errResponse = NextResponse.redirect(
      `${origin}/auth?error=${encodeURIComponent(message)}`
    );
    clearPkceCookies(errResponse);
    return errResponse;
>>>>>>> 2de6c6e723f445f4bdc88963590271f99a4e3a1b
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
