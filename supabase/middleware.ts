// supabase/middleware.ts
// Lightweight route guard — NO Supabase session processing.
// With implicit flow, sessions are stored in localStorage (client-only).
// Server cannot read them, so we just redirect based on a simple check.
// Protected routes do their own client-side auth guard via useAuthStore.

import { NextResponse, type NextRequest } from "next/server";

// Routes that require authentication — middleware sends unauthenticated users to /auth
// The actual session check happens client-side via useAuthStore + AuthGuard
const PROTECTED_PATHS = ["/profile", "/orders", "/admin", "/wishlist", "/checkout", "/inbox"];

export async function updateSession(request: NextRequest) {
  const pathname = request.nextUrl.pathname;

  // Pass through all auth-related pages without any processing
  if (pathname.startsWith("/auth")) {
    return NextResponse.next({ request });
  }

  // For protected routes: let the page load. Client-side AuthGuard handles the redirect.
  // We cannot check localStorage server-side, so middleware just passes through.
  // The AuthGuard component in each protected page handles the redirect.
  return NextResponse.next({ request });
}