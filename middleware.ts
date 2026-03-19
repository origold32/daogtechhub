// middleware.ts  (root of project)
// Runs on every request — refreshes Supabase session and guards protected routes.

import { type NextRequest } from "next/server";
import { updateSession } from "@/supabase/middleware";

export async function middleware(request: NextRequest) {
  return await updateSession(request);
}

export const config = {
  matcher: [
    /*
     * Match all routes EXCEPT:
     * - _next/static (static assets)
     * - _next/image  (image optimisation)
     * - favicon.ico
     * - public folder files
     */
    "/((?!_next/static|_next/image|favicon.ico|.*\\.(?:svg|png|jpg|jpeg|gif|webp)$).*)",
  ],
};
