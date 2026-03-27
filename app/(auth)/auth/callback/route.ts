export const dynamic = "force-dynamic";
// app/(auth)/auth/callback/route.ts
// Official Supabase SSR PKCE callback — server-side code exchange.

import { NextRequest, NextResponse } from "next/server";
import { createServerClient } from "@supabase/ssr";

export async function GET(request: NextRequest) {
  const { searchParams } = new URL(request.url);

  const code       = searchParams.get("code");
  const next       = searchParams.get("next") ?? "/profile";
  const errorParam = searchParams.get("error");
  const errorDesc  = searchParams.get("error_description");

  // x-forwarded-host gives the real public domain on Vercel
  const forwardedHost = request.headers.get("x-forwarded-host");
  const origin = forwardedHost && process.env.NODE_ENV !== "development"
    ? `https://${forwardedHost}`
    : new URL(request.url).origin;

  // Temporary debug logging — remove after auth confirmed working
  console.log("[/auth/callback] incoming URL:", request.url);
  console.log("[/auth/callback] code present:", !!code);
  console.log("[/auth/callback] origin resolved:", origin);

  if (errorParam) {
    console.error("[/auth/callback] provider error:", errorParam, errorDesc);
    return NextResponse.redirect(
      `${origin}/auth?error=${encodeURIComponent(errorDesc ?? errorParam)}`
    );
  }

  if (!code) {
    console.error("[/auth/callback] no code — redirecting to auth");
    return NextResponse.redirect(`${origin}/auth?error=${encodeURIComponent("Missing auth code.")}`);
  }

  const redirectPath = next.startsWith("/") ? next : "/profile";
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

  console.log("[/auth/callback] exchangeCodeForSession success:", !!data?.user, "error:", error?.message ?? "none");

  if (error || !data.user) {
    const message = error?.message ?? "Sign-in failed.";

    const clearPkceCookies = (response: NextResponse) => {
      for (const cookie of request.cookies.getAll()) {
        if (cookie.name.endsWith("-code-verifier")) {
          // Next.js response.cookies.delete() takes only the cookie name.
          response.cookies.delete(cookie.name);
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
