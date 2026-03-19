// app/api/auth/reset-password/route.ts
// POST  → Sends a password reset email via Supabase
// PUT   → Updates password from the reset token (called on the reset page)

import { NextRequest } from "next/server";
import { createServerSupabaseClient } from "@/supabase/server";
import { ok, badRequest, serverError } from "@/lib/api-response";

// Step 1: Request reset email
export async function POST(req: NextRequest) {
  try {
    const { email } = await req.json();
    if (!email?.trim()) return badRequest("Email is required");

    const supabase  = await createServerSupabaseClient();
    const siteUrl   = process.env.NEXT_PUBLIC_SITE_URL ?? "http://localhost:3232";

    const { error } = await supabase.auth.resetPasswordForEmail(
      email.toLowerCase().trim(),
      { redirectTo: `${siteUrl}/auth/callback?next=/reset-password` }
    );

    // Always return success — never reveal whether email exists (security)
    if (error) console.warn("[reset-password] Supabase error:", error.message);

    return ok(
      { sent: true },
      "If an account exists for that email, a reset link has been sent."
    );
  } catch (err) {
    return serverError(err);
  }
}

// Step 2: Set new password (after Supabase redirect with session)
export async function PUT(req: NextRequest) {
  try {
    const { password } = await req.json();
    if (!password) return badRequest("Password is required");
    if (password.length < 8) return badRequest("Password must be at least 8 characters");

    const supabase = await createServerSupabaseClient();
    const { error } = await supabase.auth.updateUser({ password });

    if (error) return badRequest(error.message);

    return ok({ updated: true }, "Password updated successfully");
  } catch (err) {
    return serverError(err);
  }
}
