// app/api/auth/register/route.ts
// POST  → Creates a new user account with email + password
// Supabase sends a confirmation email; user clicks to verify via /auth/confirm.

import { NextRequest } from "next/server";
import { buildRedirectUrl, resolveRequestOrigin } from "@/lib/auth-utils";
import { createServiceRoleClient } from "@/supabase/server";
import { ok, badRequest, serverError } from "@/lib/api-response";

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const { firstName, lastName, email, password, phone } = body as {
      firstName: string;
      lastName:  string;
      email:     string;
      password:  string;
      phone?:    string;
    };

    // ── Validate inputs ────────────────────────────────────────────────────
    if (!firstName?.trim()) return badRequest("First name is required");
    if (!lastName?.trim())  return badRequest("Last name is required");
    if (!email?.trim())     return badRequest("Email is required");
    if (!password)          return badRequest("Password is required");

    const emailRe = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRe.test(email)) return badRequest("Enter a valid email address");

    if (password.length < 8)                    return badRequest("Password must be at least 8 characters");
    if (!/[A-Z]/.test(password))                return badRequest("Password must contain an uppercase letter");
    if (!/[0-9]/.test(password))                return badRequest("Password must contain a number");

    // ── Create account ─────────────────────────────────────────────────────
    // Use anon client for signUp — service role would bypass email confirmation
    const { createServerSupabaseClient } = await import("@/supabase/server");
    const supabase = await createServerSupabaseClient();

    const origin = resolveRequestOrigin(req.url, req.headers);
    const emailRedirectTo = buildRedirectUrl(origin, "/auth/confirm", "next", "/profile");

    const { data, error } = await supabase.auth.signUp({
      email: email.toLowerCase().trim(),
      password,
      options: {
        emailRedirectTo,
        data: {
          first_name: firstName.trim(),
          last_name:  lastName.trim(),
          full_name:  `${firstName.trim()} ${lastName.trim()}`,
          phone:      phone?.trim() ?? null,
        },
      },
    });

    if (error) {
      // Normalise Supabase errors to readable messages
      if (error.message.includes("already registered")) {
        return badRequest("An account with this email already exists. Sign in instead.");
      }
      return badRequest(error.message);
    }

    if (!data.user) return badRequest("Failed to create account. Try again.");

    // ── Create / update profile row immediately via service role ───────────
    // The handle_new_user trigger should do this, but we do it here too as a
    // safety net in case the trigger hasn't fired yet (async).
    try {
      const service = createServiceRoleClient();
      await service.from("profiles").upsert(
        {
          id:         data.user.id,
          first_name: firstName.trim(),
          last_name:  lastName.trim(),
          email:      email.toLowerCase().trim(),
          phone:      phone?.trim() ?? null,
          role:       "customer",
        },
        { onConflict: "id", ignoreDuplicates: false }
      );
    } catch {
      // Non-fatal — trigger will handle it
    }

    // Supabase returns user even before confirmation; check if email needs confirming
    const needsConfirmation = !data.user.confirmed_at && !data.session;

    return ok(
      {
        needsConfirmation,
        email: email.toLowerCase().trim(),
      },
      needsConfirmation
        ? "Account created! Check your email to verify your account."
        : "Account created and verified!"
    );
  } catch (err) {
    return serverError(err);
  }
}
