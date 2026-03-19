// app/(auth)/auth/page.tsx
// Unified auth page — Sign In and Sign Up via passwordless OTP / OAuth.
// Design matches uploaded reference; all mock logic replaced with real Supabase calls.
"use client";

import { useState, useEffect, useRef, Suspense } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { toast } from "sonner";
import { Loader2, CheckCircle2, AlertCircle } from "lucide-react";
import { FaGoogle, FaFacebookF } from "react-icons/fa";
import { Value } from "react-phone-number-input";
import AppLogo from "@/components/reusables/app-logo";
import InputV1 from "@/components/reusables/input-v1";
import InputPhone5 from "@/components/reusables/input-phone-5";
import TabsUnderline from "@/components/reusables/tab-underline";
import VerifyAccount from "@/components/layouts/auth/verify-account";
import GoBack from "@/components/reusables/go-back";
import { Button } from "@/components/ui/button";
import { useSupabaseAuth, toFriendlyError } from "@/hooks/useSupabase";
import { useAuthStore } from "@/store/authStore";

type Step   = "form" | "otp" | "success";
type Mode   = "signin" | "signup";
type Method = "email" | "phone";

function ErrorBanner({ message }: { message: string }) {
  return (
    <div className="flex items-start gap-2.5 px-3.5 py-2.5 rounded-xl bg-red-500/[0.08] border border-red-500/20">
      <AlertCircle size={13} className="text-red-400 shrink-0 mt-0.5" />
      <p className="text-red-300/90 text-xs leading-relaxed">{message}</p>
    </div>
  );
}

function AuthForm() {
  const router = useRouter();
  const params = useSearchParams();
  const { sendOtp, verifyOtp, signInWithOAuth, isLoading } = useSupabaseAuth();
  const { user, isAuthenticated, isHydrating } = useAuthStore();

  const urlMode    = params.get("mode") === "signup" ? "signup" : "signin";
  const redirectTo = params.get("redirectTo") ?? "/profile";

  const [mode,       setMode]       = useState<Mode>(urlMode);
  const [step,       setStep]       = useState<Step>("form");
  const [method,     setMethod]     = useState<Method>("email");
  const [oauthBusy,  setOauthBusy]  = useState<"google" | "facebook" | null>(null);
  const [email,      setEmail]      = useState("");
  const [phone,      setPhone]      = useState<Value>();
  const [firstName,  setFirstName]  = useState("");
  const [lastName,   setLastName]   = useState("");
  const [identifier, setIdentifier] = useState("");
  const [formError,  setFormError]  = useState<string | null>(null);

  // Show ?error= from OAuth / callback
  useEffect(() => {
    const err = params.get("error");
    if (err) setFormError(toFriendlyError(decodeURIComponent(err).replace(/_/g, " ")));
  }, [params]);

  // Redirect if already authenticated — wait for real session check.
  // Guard: only redirect when we have BOTH a live session (isAuthenticated)
  // AND the store has fully hydrated from Supabase (not just from localStorage).
  // Using a mounted ref prevents a double-fire on strict-mode remounts.
  const didRedirect = useRef(false);
  useEffect(() => {
    if (didRedirect.current) return;
    if (!isHydrating && isAuthenticated && user && step !== "success") {
      didRedirect.current = true;
      router.replace(redirectTo);
    }
  }, [isHydrating, isAuthenticated, user, step, router, redirectTo]);

  function switchMode(m: Mode) {
    setMode(m);
    setFormError(null);
    setEmail(""); setPhone(undefined);
    setFirstName(""); setLastName("");
    const qs = new URLSearchParams({ mode: m });
    if (redirectTo !== "/profile") qs.set("redirectTo", redirectTo);
    router.replace(`/auth?${qs}`, { scroll: false });
  }

  function validate(): string | null {
    if (mode === "signup" && !firstName.trim()) return "First name is required.";
    if (mode === "signup" && firstName.trim().length < 2) return "First name must be at least 2 characters.";
    if (method === "email") {
      if (!email.trim()) return "Email address is required.";
      if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email.trim())) return "Enter a valid email address.";
    } else {
      if (!phone) return "Phone number is required.";
    }
    return null;
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setFormError(null);
    const err = validate();
    if (err) { setFormError(err); return; }

    const id   = method === "phone" ? String(phone ?? "").trim() : email.trim();
    const meta = mode === "signup"
      ? { firstName: firstName.trim(), lastName: lastName.trim() }
      : undefined;

    const r = await sendOtp(id, method, meta, redirectTo);
    if (!r.success) { setFormError(r.error ?? "Failed to send code."); return; }

    setIdentifier(id);
    setStep("otp");
    toast.success(
      method === "email"
        ? "Check your inbox — a sign-in link and 6-digit code have been sent."
        : "SMS sent — enter the 6-digit code to continue.",
      { duration: 5000 }
    );
  }

  async function handleOAuth(p: "google" | "facebook") {
    setFormError(null);
    setOauthBusy(p);
    const r = await signInWithOAuth(p, redirectTo);
    setOauthBusy(null);
    if (!r.success) setFormError(r.error ?? "Sign-in failed. Please try again.");
  }

  function handleOtpSuccess() {
    setStep("success");
    setTimeout(() => { router.push(redirectTo); router.refresh(); }, 900);
  }

  // ── Hydration spinner ────────────────────────────────────────────────────────
  if (isHydrating) {
    return (
      <div className="flex flex-col items-center justify-center py-16 gap-3">
        <Loader2 className="w-6 h-6 text-[#d4a5ff]/60 animate-spin" />
        <p className="text-white/25 text-xs">Checking session…</p>
      </div>
    );
  }

  // ── Success ──────────────────────────────────────────────────────────────────
  if (step === "success") {
    return (
      <div className="flex flex-col items-center gap-3 py-12 text-center">
        <CheckCircle2 className="w-14 h-14 text-[#d4a5ff]" strokeWidth={1.5} />
        <p className="text-white font-bold text-xl">
          {mode === "signup" ? "Account created!" : "Welcome back!"}
        </p>
        <p className="text-white/40 text-sm">Taking you to your profile…</p>
        <Loader2 className="w-4 h-4 text-[#d4a5ff]/50 animate-spin mt-1" />
      </div>
    );
  }

  // ── OTP verification screen ───────────────────────────────────────────────────
  if (step === "otp") {
    return (
      <div className="flex flex-col items-center text-center space-y-1">
        <AppLogo width={52} height={52} />
        <p className="text-muted-lavender text-sm">Enter the verification code</p>
        <p className="text-xs text-muted-lavender opacity-60">
          Code sent to <span className="text-white/70">{identifier}</span>
        </p>
        {method === "email" && (
          <p className="text-[11px] text-white/25 pt-1">
            Click the link in the email, or type the 6-digit code below.
          </p>
        )}

        <div className="mt-6 space-y-6 flex flex-col items-center w-full">
          <VerifyAccount
            identifier={identifier}
            onVerify={(otp) => verifyOtp(identifier, otp, method === "phone" ? "sms" : "email")}
            onResend={() => sendOtp(identifier, method, undefined, redirectTo)}
            onSuccess={handleOtpSuccess}
          />
          <GoBack
            onClick={() => { setStep("form"); setFormError(null); }}
            label="Use a different method"
            className="text-muted-lavender hover:text-lilac text-sm"
          />
        </div>
      </div>
    );
  }

  // ── Main form ─────────────────────────────────────────────────────────────────
  return (
    <>
      {/* Header */}
      <div className="flex flex-col items-center text-center space-y-1">
        <AppLogo width={52} height={52} />
        <p className="text-muted-lavender text-sm">
          {mode === "signin"
            ? "Sign in to your DAOG account."
            : "Join DAOG — shop gadgets, jerseys, cars & more."}
        </p>
        <p className="text-xs text-muted-lavender opacity-60">
          {mode === "signin"
            ? "No password needed — we'll send a secure code."
            : "We'll create your account automatically on first sign-in."}
        </p>
      </div>

      {/* Mode toggle */}
      <div className="flex rounded-xl border border-white/[0.08] bg-white/[0.03] p-1 gap-1 mt-4">
        {(["signin", "signup"] as const).map((m) => (
          <button
            key={m}
            type="button"
            onClick={() => switchMode(m)}
            className={`flex-1 h-9 rounded-lg text-sm font-semibold transition-all ${
              mode === m
                ? "bg-[#d4a5ff] text-[#1a0b2e] shadow-sm"
                : "text-white/40 hover:text-white/70"
            }`}
          >
            {m === "signin" ? "Sign In" : "Sign Up"}
          </button>
        ))}
      </div>

      {/* Error banner */}
      {formError && <ErrorBanner message={formError} />}

      {/* Email / Phone tabs */}
      <TabsUnderline
        key={mode}
        defaultValue="email"
        onChange={(val) => { setMethod(val as Method); setFormError(null); }}
        tabs={[
          {
            value: "email",
            valueDisplay: "Email",
            content: (
              <form className="space-y-3" onSubmit={handleSubmit} noValidate>
                {/* Name fields for sign-up */}
                {mode === "signup" && (
                  <div className="grid grid-cols-2 gap-2">
                    <InputV1
                      label="First name"
                      value={firstName}
                      onChange={(e) => { setFirstName(e.target.value); setFormError(null); }}
                      placeholder="Ada"
                      autoComplete="given-name"
                      required
                    />
                    <InputV1
                      label="Last name"
                      value={lastName}
                      onChange={(e) => setLastName(e.target.value)}
                      placeholder="Okafor"
                      autoComplete="family-name"
                    />
                  </div>
                )}

                <InputV1
                  name="email"
                  label="Email address"
                  type="email"
                  value={email}
                  onChange={(e) => { setEmail(e.target.value); setFormError(null); }}
                  placeholder="you@example.com"
                  autoComplete="email"
                  required
                />

                <Button
                  type="submit"
                  disabled={!email.trim() || isLoading}
                  loading={isLoading}
                  loadingText="Sending code…"
                  className="w-full bg-lilac text-deep-purple hover:bg-lilac/90"
                >
                  {mode === "signin" ? "Send sign-in code" : "Create account"}
                </Button>
              </form>
            ),
          },
          {
            value: "phone",
            valueDisplay: "Phone",
            content: (
              <form className="space-y-3" onSubmit={handleSubmit} noValidate>
                {mode === "signup" && (
                  <div className="grid grid-cols-2 gap-2">
                    <InputV1
                      label="First name"
                      value={firstName}
                      onChange={(e) => { setFirstName(e.target.value); setFormError(null); }}
                      placeholder="Ada"
                      autoComplete="given-name"
                      required
                    />
                    <InputV1
                      label="Last name"
                      value={lastName}
                      onChange={(e) => setLastName(e.target.value)}
                      placeholder="Okafor"
                      autoComplete="family-name"
                    />
                  </div>
                )}

                <InputPhone5
                  name="phone"
                  label="Phone number"
                  value={phone}
                  onChange={(v) => { setPhone(v); setFormError(null); }}
                  required
                />

                <Button
                  type="submit"
                  disabled={!phone || isLoading}
                  loading={isLoading}
                  loadingText="Sending code…"
                  className="w-full bg-lilac text-deep-purple hover:bg-lilac/90"
                >
                  {mode === "signin" ? "Send sign-in code" : "Create account"}
                </Button>
              </form>
            ),
          },
        ]}
      />

      {/* Divider */}
      <div className="flex items-center gap-2 my-2">
        <div className="flex-1 h-px bg-muted-lavender opacity-30" />
        <span className="text-xs text-muted-lavender opacity-60">or continue with</span>
        <div className="flex-1 h-px bg-muted-lavender opacity-30" />
      </div>

      {/* OAuth */}
      <div className="flex items-center justify-center gap-3">
        {(["google", "facebook"] as const).map((p) => (
          <Button
            key={p}
            type="button"
            variant="outline"
            disabled={!!oauthBusy || isLoading}
            onClick={() => handleOAuth(p)}
            className="rounded-full text-lilac hover:text-deep-purple hover:bg-lilac border-lilac/40 flex items-center gap-2 px-5"
          >
            {oauthBusy === p
              ? <Loader2 size={14} className="animate-spin" />
              : p === "google" ? <FaGoogle size={16} /> : <FaFacebookF size={16} />
            }
            <span className="capitalize text-sm">{p}</span>
          </Button>
        ))}
      </div>

      {/* Footer toggle */}
      <p className="text-center text-xs text-muted-lavender opacity-60 mt-2">
        {mode === "signin" ? "New to DAOG? " : "Already have an account? "}
        <button
          type="button"
          onClick={() => switchMode(mode === "signin" ? "signup" : "signin")}
          className="text-lilac hover:underline font-medium"
        >
          {mode === "signin" ? "Create an account" : "Sign in instead"}
        </button>
        {" · "}
        <a href="/legal/terms" className="hover:text-white/60 transition-colors">Terms</a>
        {" & "}
        <a href="/legal/privacy" className="hover:text-white/60 transition-colors">Privacy</a>
      </p>
    </>
  );
}

export default function AuthPage() {
  return (
    <Suspense
      fallback={
        <div className="flex justify-center items-center min-h-[300px]">
          <Loader2 className="w-5 h-5 text-[#d4a5ff]/50 animate-spin" />
        </div>
      }
    >
      <AuthForm />
    </Suspense>
  );
}
