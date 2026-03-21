export const dynamic = "force-dynamic";
// app/(auth)/auth/callback/route.ts
// Handles Google OAuth PKCE code exchange server-side.
// The code_verifier is stored in a cookie (pkce_verifier) that we wrote
// in signInWithOAuth using skipBrowserRedirect before navigating to Google.
// HTTP cookies survive cross-origin redirects in all browsers including Brave.

import { NextRequest, NextResponse } from "next/server";
import { createServerClient } from "@supabase/ssr";

export async function GET(request: NextRequest) {
  const { searchParams, origin } = new URL(request.url);

  const code       = searchParams.get("code");
  const next       = searchParams.get("next") ?? "/profile";
  const errorParam = searchParams.get("error");
  const errorDesc  = searchParams.get("error_description");

  if (errorParam) {
    return NextResponse.redirect(
      `${origin}/auth?error=${encodeURIComponent(errorDesc ?? errorParam)}`
    );
  }

  if (!code) {
    return NextResponse.redirect(`${origin}/auth/verifying`);
  }

  const redirectPath = next.startsWith("/") ? next : "/profile";
  const successUrl   = `${origin}/auth/verifying?next=${encodeURIComponent(redirectPath)}`;
  let   response     = NextResponse.redirect(successUrl);

  const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!;
  const supabaseKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!;

  // Read the pkce_verifier cookie that signInWithOAuth saved before redirecting
  const cookieVerifier = request.cookies.get("pkce_verifier")?.value;

  // Build a server client. If we have the verifier from our cookie, inject it.
  const allCookies = request.cookies.getAll();
  
  // If we have our saved verifier, also inject it under the supabase key
  const projectRef = supabaseUrl.split("//")[1]?.split(".")[0] ?? "";
  const supabaseVerifierKey = `sb-${projectRef}-auth-token-code-verifier`;
  
  const enrichedCookies = cookieVerifier
    ? [...allCookies, { name: supabaseVerifierKey, value: decodeURIComponent(cookieVerifier) }]
    : allCookies;

  const supabase = createServerClient(supabaseUrl, supabaseKey, {
    cookies: {
      getAll: () => enrichedCookies,
      setAll: (cookiesToSet) => {
        cookiesToSet.forEach(({ name, value }) => request.cookies.set(name, value));
        response = NextResponse.redirect(successUrl);
        cookiesToSet.forEach(({ name, value, options }) =>
          response.cookies.set(name, value, options)
        );
      },
    },
  });

  const { data, error } = await supabase.auth.exchangeCodeForSession(code);

  if (error || !data.user) {
    // Fallback: forward code to client page for localStorage-based exchange
    const dest = new URL(`${origin}/auth/verifying`);
    dest.searchParams.set("code", code);
    dest.searchParams.set("next", redirectPath);
    const fallback = NextResponse.redirect(dest.toString());
    // Clear the stale pkce_verifier cookie
    fallback.cookies.set("pkce_verifier", "", { maxAge: 0, path: "/" });
    return fallback;
  }

  // Clear the pkce_verifier cookie on success
  response.cookies.set("pkce_verifier", "", { maxAge: 0, path: "/" });
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
    id:         user.id,
    email:      user.email      ?? null,
    phone:      user.phone      ?? null,
    first_name: meta.first_name ?? parts[0]                ?? "User",
    last_name:  meta.last_name  ?? parts.slice(1).join(" ") ?? "",
    avatar_url: meta.avatar_url ?? meta.picture            ?? null,
    role:       "customer",
  }, { onConflict: "id", ignoreDuplicates: false });
}