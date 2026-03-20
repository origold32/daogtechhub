export const dynamic = "force-dynamic";
// app/api/auth/otp/route.ts
// Sends a 6-digit OTP via Supabase Email OTP (no magic link, no PKCE).
// User enters the code manually — clean, reliable, works in all email clients.

import { NextRequest, NextResponse } from "next/server";
import { authLimiter, getClientIp } from "@/lib/rate-limit";

function isValidEmail(v: string) {
  return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(v.trim());
}

function isValidPhone(v: string) {
  return /^\+?[1-9]\d{6,14}$/.test(v.replace(/\s/g, ""));
}

export async function POST(req: NextRequest) {
  const ip = getClientIp(req.headers);
  const { success, remaining, reset } = authLimiter.check(`otp:${ip}`);
  if (!success) {
    const retryAfter = Math.ceil((reset - Date.now()) / 1000);
    return NextResponse.json(
      { success: false, error: `Too many attempts — please wait ${retryAfter}s.` },
      { status: 429, headers: { "Retry-After": String(retryAfter) } }
    );
  }

  let body: { identifier?: string; type?: string; firstName?: string; lastName?: string; redirectTo?: string };
  try { body = await req.json(); }
  catch { return NextResponse.json({ success: false, error: "Invalid request." }, { status: 400 }); }

  const { identifier, type, firstName, lastName } = body;

  if (!identifier?.trim() || !type) {
    return NextResponse.json({ success: false, error: "Email or phone number is required." }, { status: 400 });
  }
  if (type !== "email" && type !== "phone") {
    return NextResponse.json({ success: false, error: "Invalid type." }, { status: 400 });
  }
  if (type === "email" && !isValidEmail(identifier)) {
    return NextResponse.json({ success: false, error: "Please enter a valid email address." }, { status: 400 });
  }
  if (type === "phone" && !isValidPhone(identifier)) {
    return NextResponse.json(
      { success: false, error: "Enter a valid phone number in international format e.g. +2348012345678." },
      { status: 400 }
    );
  }
  if (!process.env.NEXT_PUBLIC_SUPABASE_URL || !process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY) {
    return NextResponse.json({ success: false, error: "Auth is not configured." }, { status: 503 });
  }

  try {
    const { createServerSupabaseClient } = await import("@/supabase/server");
    const supabase = await createServerSupabaseClient();

    const userMetadata: Record<string, string> = {};
    if (firstName?.trim()) userMetadata.first_name = firstName.trim();
    if (lastName?.trim())  userMetadata.last_name  = lastName.trim();
    if (firstName?.trim() || lastName?.trim()) {
      userMetadata.full_name = [firstName?.trim(), lastName?.trim()].filter(Boolean).join(" ");
    }

    let result;
    if (type === "email") {
      // No emailRedirectTo — sends a pure 6-digit code only, no magic link.
      // User types the code in the app. Works in every email client and browser.
      result = await supabase.auth.signInWithOtp({
        email: identifier.trim().toLowerCase(),
        options: {
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
      else if (m.includes("signups not allowed"))
        friendly = "Sign-ups are temporarily disabled. Please contact support.";
      return NextResponse.json({ success: false, error: friendly }, { status: 400 });
    }

    return NextResponse.json(
      {
        success: true,
        message: type === "email"
          ? "Check your inbox — enter the 6-digit code to sign in."
          : "SMS sent — enter the 6-digit code to continue.",
      },
      { headers: { "X-RateLimit-Remaining": String(remaining) } }
    );
  } catch (err) {
    console.error("[otp]", err);
    return NextResponse.json({ success: false, error: "Unexpected error — please try again." }, { status: 500 });
  }
}