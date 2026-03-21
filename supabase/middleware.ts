// supabase/middleware.ts
import { createServerClient } from "@supabase/ssr";
import { NextResponse, type NextRequest } from "next/server";
import type { Database } from "@/types/database";

const PROTECTED_PATHS   = ["/profile", "/orders", "/admin", "/wishlist", "/checkout", "/inbox"];
const PUBLIC_EXCEPTIONS = ["/checkout/verify", "/payment/callback"];

export async function updateSession(request: NextRequest) {
  const pathname = request.nextUrl.pathname;

  // Never interfere with auth pages — especially /auth/verifying?code=
  // The PKCE code_verifier cookie must not be touched here
  if (pathname.startsWith("/auth")) {
    return NextResponse.next({ request });
  }

  let supabaseResponse = NextResponse.next({ request });

  const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
  const supabaseKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;
  if (!supabaseUrl || !supabaseKey) return supabaseResponse;

  const supabase = createServerClient<Database>(supabaseUrl, supabaseKey, {
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

  // Refresh session — keeps tokens valid
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
    const { data: profile } = await supabase
      .from("profiles").select("role").eq("id", user.id).single();
    if (profile?.role !== "admin") {
      return NextResponse.redirect(new URL("/", request.url));
    }
  }

  if (pathname === "/auth" && user && !userError) {
    const redirectTo = request.nextUrl.searchParams.get("redirectTo") ?? "/profile";
    return NextResponse.redirect(new URL(redirectTo, request.url));
  }

  return supabaseResponse;
}
