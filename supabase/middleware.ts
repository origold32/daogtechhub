// supabase/middleware.ts
// Official Supabase SSR middleware pattern.
// Refreshes session on every request. Never intercepts auth routes.

import { createServerClient } from "@supabase/ssr";
import { NextResponse, type NextRequest } from "next/server";
import { SUPABASE_AUTH_COOKIE_OPTIONS } from "@/lib/auth-utils";
import type { Database } from "@/types/database";

const PROTECTED_PATHS   = ["/profile", "/orders", "/admin", "/wishlist", "/checkout", "/inbox"];
const PUBLIC_EXCEPTIONS = ["/checkout/verify", "/payment/callback"];
const AUTH_PATHS        = ["/auth/callback", "/auth/confirm", "/auth/verifying", "/auth"];

// These accounts are always admin — bypasses DB check if profile fetch fails
const PRIMARY_ADMIN_EMAILS = ["daogstore@gmail.com", "adegbesanadebola1@gmail.com"];

export async function updateSession(request: NextRequest) {
  const pathname = request.nextUrl.pathname;

  if (AUTH_PATHS.some(p => pathname.startsWith(p))) {
    const res = NextResponse.next({ request });
    res.headers.set("Cache-Control", "private, no-store");
    return res;
  }

  let supabaseResponse = NextResponse.next({ request });

  const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
  const supabaseKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;

  // If env vars are missing, pass all requests through — client-side guards handle auth
  if (!supabaseUrl || !supabaseKey) {
    supabaseResponse.headers.set("Cache-Control", "private, no-store");
    return supabaseResponse;
  }

  const supabase = createServerClient<Database>(supabaseUrl, supabaseKey, {
    cookieOptions: SUPABASE_AUTH_COOKIE_OPTIONS,
    cookies: {
      getAll() { return request.cookies.getAll(); },
      setAll(cookiesToSet) {
        cookiesToSet.forEach(({ name, value }) => request.cookies.set(name, value));
        supabaseResponse = NextResponse.next({ request });
        cookiesToSet.forEach(({ name, value, options }) =>
          supabaseResponse.cookies.set(name, value, options)
        );
      },
    },
  });

  const { data: { user }, error: userError } = await supabase.auth.getUser();

  const isPublicException = PUBLIC_EXCEPTIONS.some(p => pathname.startsWith(p));
  const isProtected       = !isPublicException && PROTECTED_PATHS.some(p => pathname.startsWith(p));

  if (isProtected && (userError || !user)) {
    const url = request.nextUrl.clone();
    url.pathname = "/auth";
    url.searchParams.set("redirectTo", pathname);
    return NextResponse.redirect(url);
  }

  if (pathname.startsWith("/admin") && user && !userError) {
    // Primary admin emails always have access — no DB round-trip needed
    const isPrimaryAdmin = PRIMARY_ADMIN_EMAILS.includes(user.email ?? "");

    if (!isPrimaryAdmin) {
      const { data: profile } = await supabase
        .from("profiles").select("role, is_active").eq("id", user.id).single();

      // Only block when we have a definitive non-admin result.
      // If profile is null (fetch failed), pass through — client-side guard handles it.
      if (profile && (profile.role !== "admin" || profile.is_active === false)) {
        return NextResponse.redirect(new URL("/", request.url));
      }
    }
  }

  supabaseResponse.headers.set("Cache-Control", "private, no-store");
  return supabaseResponse;
}
