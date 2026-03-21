export const dynamic = "force-dynamic";
// app/(auth)/auth/callback/route.ts
// Official @supabase/ssr PKCE callback handler.
//
// Flow: Google → Supabase → here with ?code=
// 1. createServerClient reads the code_verifier cookie (set by browser before OAuth redirect)
// 2. exchangeCodeForSession exchanges code + verifier with Supabase
// 3. Session cookies are written onto the redirect response
// 4. Browser receives session cookies and is redirected to /auth/verifying
// 5. /auth/verifying reads the session from cookies and redirects to profile
//
// This is the ONLY place code exchange happens. No browser client is involved.

import { NextRequest, NextResponse } from "next/server";
import { createServerClient } from "@supabase/ssr";

export async function GET(request: NextRequest) {
  const { searchParams, origin } = new URL(request.url);

  const code        = searchParams.get("code");
  const next        = searchParams.get("next") ?? "/profile";
  const errorParam  = searchParams.get("error");
  const errorDesc   = searchParams.get("error_description");

  // Surface OAuth provider errors
  if (errorParam) {
    const msg = errorDesc ?? errorParam;
    return NextResponse.redirect(
      `${origin}/auth?error=${encodeURIComponent(msg)}`
    );
  }

  if (!code) {
    // No code — could be OTP flow landing here, just go to verifying
    return NextResponse.redirect(`${origin}/auth/verifying`);
  }

  const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!;
  const supabaseKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!;

  // Build the success redirect URL — verifying page confirms session to user
  const redirectPath = next.startsWith("/") ? next : "/profile";
  const successUrl   = `${origin}/auth/verifying?next=${encodeURIComponent(redirectPath)}`;
  let   response     = NextResponse.redirect(successUrl);

  // createServerClient reads code_verifier from incoming request cookies
  // and writes session tokens to the outgoing redirect response
  const supabase = createServerClient(supabaseUrl, supabaseKey, {
    cookies: {
      getAll: ()               => request.cookies.getAll(),
      setAll: (cookiesToSet)   => {
        // Write cookies to both request (for in-handler reads) and response (for browser)
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
    const errMsg = error?.message ?? "No user returned";
    console.error("[callback] PKCE exchange failed:", errMsg);
    // Pass the real error so it's visible during debugging
    return NextResponse.redirect(
      `${origin}/auth?error=${encodeURIComponent(errMsg)}`
    );
  }

  // Upsert profile non-blocking
  upsertProfile(data.user).catch(() => {});

  return response; // response carries sb-* session cookies
}

async function upsertProfile(user: {
  id: string;
  email?: string | null;
  phone?: string | null;
  user_metadata?: Record<string, unknown>;
}) {
  if (!process.env.SUPABASE_SERVICE_ROLE_KEY) return;
  const { createClient } = await import("@supabase/supabase-js");
  const service = createClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.SUPABASE_SERVICE_ROLE_KEY,
    { auth: { autoRefreshToken: false, persistSession: false } }
  );
  const meta  = (user.user_metadata ?? {}) as Record<string, string>;
  const raw   = meta.full_name ?? meta.name ?? user.email?.split("@")[0] ?? "User";
  const parts = raw.trim().split(/\s+/);
  await service.from("profiles").upsert({
    id:         user.id,
    email:      user.email      ?? null,
    phone:      user.phone      ?? null,
    first_name: meta.first_name ?? parts[0]                ?? "User",
    last_name:  meta.last_name  ?? parts.slice(1).join(" ") ?? "",
    avatar_url: meta.avatar_url ?? meta.picture            ?? null,
    role:       "customer",
  }, { onConflict: "id", ignoreDuplicates: false });
}
