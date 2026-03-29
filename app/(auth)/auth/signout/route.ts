export const dynamic = "force-dynamic";
// app/api/auth/signout/route.ts
// Terminates the Supabase session server-side and clears all auth cookies.
// Called by the client sign-out flow to ensure cookies are properly cleared.

import { NextRequest, NextResponse } from "next/server";
import { createServerClient } from "@supabase/ssr";
import { SUPABASE_AUTH_COOKIE_OPTIONS } from "@/lib/auth-utils";

export async function POST(request: NextRequest) {
  const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!;
  const supabaseKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!;

  const response = NextResponse.json({ ok: true });

  const supabase = createServerClient(supabaseUrl, supabaseKey, {
    cookieOptions: SUPABASE_AUTH_COOKIE_OPTIONS,
    cookies: {
      getAll: ()               => request.cookies.getAll(),
      setAll: (cookiesToSet)   => {
        cookiesToSet.forEach(({ name, value, options }) =>
          response.cookies.set(name, value, options as Parameters<typeof response.cookies.set>[2])
        );
      },
    },
  });

  await supabase.auth.signOut();

  return response;
}
