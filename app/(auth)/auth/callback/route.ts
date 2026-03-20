export const dynamic = "force-dynamic";
// app/(auth)/auth/callback/route.ts
// Legacy redirect handler — forwards any traffic to /auth/verifying.
// The implicit flow sends tokens in the URL hash which server routes cannot read.
// All actual auth processing happens client-side on /auth/verifying.

import { NextRequest, NextResponse } from "next/server";

export async function GET(request: NextRequest) {
  const { origin, searchParams } = new URL(request.url);

  // Surface provider-level errors
  const errorParam = searchParams.get("error");
  const errorDesc  = searchParams.get("error_description");
  if (errorParam) {
    const msg = errorDesc ?? errorParam;
    return NextResponse.redirect(`${origin}/auth?error=${encodeURIComponent(msg)}`);
  }

  // Forward next param if present
  const next = searchParams.get("next") ?? "/profile";
  return NextResponse.redirect(
    `${origin}/auth/verifying?next=${encodeURIComponent(next)}`
  );
}