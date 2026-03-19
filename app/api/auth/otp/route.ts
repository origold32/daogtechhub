// app/api/auth/otp/route.ts
// Sends a passwordless OTP / magic-link via Supabase Auth.
// Handles both Sign In (existing users) and Sign Up (new users — same flow).
// Rate limited: 10 requests / minute per IP.

import { NextRequest, NextResponse } from "next/server";
import { authLimiter, getClientIp } from "@/lib/rate-limit";

function isValidEmail(v: string) {
  return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(v.trim());
}

function isValidPhone(v: string) {
  return /^\+?[1-9]\d{6,14}$/.test(v.replace(/\s/g, ""));
}

export async function POST(req: NextRequest) {
  // Rate limit
  const ip = getClientIp(req.headers);
  const { success, remaining, reset } = authLimiter.check(`otp:${ip}`);
  if (!success) {
    const retryAfter = Math.ceil((reset - Date.now()) / 1000);
    return NextResponse.json(
      { success: false, error: `Too many attempts — please wait ${retryAfter}s.` },
      { status: 429, headers: { "Retry-After": String(retryAfter) } }
    );
  }

  // Parse body
  let body: { identifier?: string; type?: string; firstName?: string; lastName?: string; redirectTo?: string };
  try { body = await req.json(); }
  catch {
    return NextResponse.json({ success: false, error: "Invalid request." }, { status: 400 });
  }

  const { identifier, type, firstName, lastName, redirectTo } = body;

  if (!identifier?.trim() || !type) {
    return NextResponse.json(
      { success: false, error: "Email or phone number is required." },
      { status: 400 }
    );
  }

  if (type !== "email" && type !== "phone") {
    return NextResponse.json({ success: false, error: "Invalid type." }, { status: 400 });
  }

  if (type === "email" && !isValidEmail(identifier)) {
    return NextResponse.json(
      { success: false, error: "Please enter a valid email address." },
      { status: 400 }
    );
  }

  if (type === "phone" && !isValidPhone(identifier)) {
    return NextResponse.json(
      { success: false, error: "Enter a valid phone number in international format e.g. +2348012345678." },
      { status: 400 }
    );
  }

  if (!process.env.NEXT_PUBLIC_SUPABASE_URL || !process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY) {
    return NextResponse.json(
      { success: false, error: "Auth is not configured. Add Supabase keys to .env.local." },
      { status: 503 }
    );
  }

  try {
    const { createServerSupabaseClient } = await import("@/supabase/server");
    const supabase = await createServerSupabaseClient();
    const siteUrl  = process.env.NEXT_PUBLIC_SITE_URL ?? "http://localhost:3232";

    // Build user metadata — passed to handle_new_user DB trigger
    const userMetadata: Record<string, string> = {};
    if (firstName?.trim()) userMetadata.first_name = firstName.trim();
    if (lastName?.trim())  userMetadata.last_name  = lastName.trim();
    if (firstName?.trim() || lastName?.trim()) {
      userMetadata.full_name = [firstName?.trim(), lastName?.trim()].filter(Boolean).join(" ");
    }

    let result;
    if (type === "email") {
      // Include ?next= so the callback can forward the user to the right page
      // instead of always falling back to "/" (home).
      const next = redirectTo && redirectTo.startsWith("/") && redirectTo !== "/"
        ? `?next=${encodeURIComponent(redirectTo)}`
        : "";
      result = await supabase.auth.signInWithOtp({
        email: identifier.trim().toLowerCase(),
        options: {
          emailRedirectTo: `${siteUrl}/auth/callback${next}`,
          shouldCreateUser: true,
          data: { source: "email_otp", ...userMetadata },
        },
      });
    } else {
      result = await supabase.auth.signInWithOtp({
        phone: identifier.trim(),
        options: {
          shouldCreateUser: true,
          channel: "sms",
          data: { source: "sms_otp", ...userMetadata },
        },
      });
    }

    if (result.error) {
      const m = result.error.message.toLowerCase();
      let friendly = result.error.message;

      if (m.includes("rate limit") || m.includes("too many") || m.includes("security purposes"))
        friendly = "Too many attempts — please wait a few minutes.";
      else if (m.includes("invalid email") || m.includes("unable to validate"))
        friendly = "That email address doesn't appear to be valid.";
      else if (m.includes("phone") && m.includes("invalid"))
        friendly = "Invalid phone number. Use international format: +2348012345678";
      else if (m.includes("signups not allowed") || m.includes("sign-ups not allowed"))
        friendly = "Sign-ups are temporarily disabled. Please contact support.";
      else if (m.includes("email provider") || m.includes("sms provider"))
        friendly = "Messaging service unavailable — please try again shortly.";
      else if (m.includes("not configured"))
        friendly = "Auth is not configured. Check your .env.local.";

      return NextResponse.json({ success: false, error: friendly }, { status: 400 });
    }

    return NextResponse.json(
      {
        success: true,
        message: type === "email"
          ? "Check your inbox — we sent a sign-in link and 6-digit code."
          : "SMS sent — enter the 6-digit code to continue.",
      },
      { headers: { "X-RateLimit-Remaining": String(remaining) } }
    );
  } catch (err) {
    console.error("[otp]", err);
    const msg = (err as Error).message ?? "";
    if (msg.includes("not configured") || msg.includes(".env")) {
      return NextResponse.json(
        { success: false, error: "Auth is not configured. Check your .env.local." },
        { status: 503 }
      );
    }
    return NextResponse.json(
      { success: false, error: "Unexpected error — please try again." },
      { status: 500 }
    );
  }
}
