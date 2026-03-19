// supabase/middleware.ts
// Runs on every request via middleware.ts.
// Refreshes Supabase auth session so tokens stay valid, and guards protected routes.

import { createServerClient } from "@supabase/ssr";
import { NextResponse, type NextRequest } from "next/server";
import type { Database } from "@/types/database";

// Routes that require an authenticated session
const PROTECTED_PATHS = ["/profile", "/orders", "/admin", "/wishlist", "/checkout", "/inbox"];

// Routes that are always public even if they look protected
// (e.g. /checkout/verify is the Paystack return page — user may not be logged in)
const PUBLIC_EXCEPTIONS = ["/checkout/verify", "/payment/callback"];

export async function updateSession(request: NextRequest) {
  let supabaseResponse = NextResponse.next({ request });

  const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
  const supabaseKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;

  // Skip gracefully if env vars aren't set (dev without .env.local)
  if (!supabaseUrl || !supabaseKey) return supabaseResponse;

  const supabase = createServerClient<Database>(supabaseUrl, supabaseKey, {
    cookies: {
      getAll() { return request.cookies.getAll(); },
      setAll(cookiesToSet) {
        // Must set cookies on both request AND response for SSR session propagation
        cookiesToSet.forEach(({ name, value }) => request.cookies.set(name, value));
        supabaseResponse = NextResponse.next({ request });
        cookiesToSet.forEach(({ name, value, options }) =>
          supabaseResponse.cookies.set(name, value, options)
        );
      },
    },
  });

  // IMPORTANT: do not remove this call — it refreshes the session cookie
  const { data: { user }, error: userError } = await supabase.auth.getUser();

  const pathname = request.nextUrl.pathname;

  // Check if this path requires auth
  const isPublicException = PUBLIC_EXCEPTIONS.some((p) => pathname.startsWith(p));
  const isProtected = !isPublicException && PROTECTED_PATHS.some((p) => pathname.startsWith(p));

  // Redirect unauthenticated users away from protected routes
  if (isProtected && (userError || !user)) {
    const url = request.nextUrl.clone();
    url.pathname = "/auth";
    url.searchParams.set("redirectTo", pathname);
    return NextResponse.redirect(url);
  }

  // Admin-only guard — redirect non-admins away from /admin
  if (pathname.startsWith("/admin") && user && !userError) {
    const { data: profile } = await supabase
      .from("profiles")
      .select("role")
      .eq("id", user.id)
      .single();

    if (profile?.role !== "admin") {
      return NextResponse.redirect(new URL("/", request.url));
    }
  }

  // Already signed in — don't show the auth page again
  if (pathname === "/auth" && user && !userError) {
    const redirectTo = request.nextUrl.searchParams.get("redirectTo") ?? "/profile";
    return NextResponse.redirect(new URL(redirectTo, request.url));
  }

  return supabaseResponse;
}
