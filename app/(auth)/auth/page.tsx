// app/(auth)/auth/page.tsx
// Unified OTP-only passwordless auth.
// After OTP verified: waits for auth store to confirm session before redirecting.
"use client";

import { useState, useEffect, useRef, Suspense } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { toast } from "sonner";
import { Loader2, Mail, ArrowLeft, CheckCircle2, AlertCircle, ShieldCheck, RefreshCw } from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";
import { FaGoogle } from "react-icons/fa";
import AppLogo from "@/components/reusables/app-logo";
import { InputOtpV1 } from "@/components/reusables/otp-input";
import { useSupabaseAuth, toFriendlyError } from "@/hooks/useSupabase";
import { useAuthStore } from "@/store/authStore";
import { cn } from "@/lib/utils";
import { clearSupabasePkceCookiesInBrowser } from "@/lib/auth-utils";
import CustomCountDown from "@/components/reusables/countdown-custom";

type Step = "email" | "otp" | "waiting" | "success";

function ErrorBanner({ message }: { message: string }) {
  return (
    <motion.div
      initial={{ opacity: 0, y: -4 }} animate={{ opacity: 1, y: 0 }}
      className="flex items-start gap-2.5 px-3.5 py-2.5 rounded-xl bg-red-500/[0.08] border border-red-500/20"
    >
      <AlertCircle size={13} className="text-red-400 shrink-0 mt-0.5" />
      <p className="text-red-300/90 text-xs leading-relaxed">{message}</p>
    </motion.div>
  );
}

function AuthForm() {
  const router  = useRouter();
  const params  = useSearchParams();
  const { sendOtp, verifyOtp, signInWithOAuth } = useSupabaseAuth();
  const { user, isAuthenticated, isHydrating } = useAuthStore();

  const mode = params.get("mode") === "signup" ? "signup" : "signin";
  const redirectTo = params.get("redirectTo") ?? "/profile";
  const isSignupMode = mode === "signup";

  const [step,       setStep]       = useState<Step>("email");
  const [email,      setEmail]      = useState("");
  const [otp,        setOtp]        = useState("");
  const [formError,  setFormError]  = useState<string | null>(null);
  const [oauthBusy,  setOauthBusy]  = useState(false);
  const [otpWrong,   setOtpWrong]   = useState(false);
  const [verifying,  setVerifying]  = useState(false);
  const [resending,  setResending]  = useState(false);
  const [attempts,   setAttempts]   = useState(0);
  const [cooldown,   setCooldown]   = useState(0);
  const [submitting, setSubmitting] = useState(false);

  const verifyingRef = useRef(false);
  const didRedirect  = useRef(false);

  // Show ?error= from callback redirects
  useEffect(() => {
    const err = params.get("error") ?? params.get("error_description");
    if (!err) return;

    const decodedError = decodeURIComponent(err).replace(/_/g, " ");
    setFormError(toFriendlyError(decodedError));

    const normalized = decodedError.toLowerCase();
    if (!normalized.includes("pkce")) return;

    clearSupabasePkceCookiesInBrowser();

    if ("serviceWorker" in navigator) {
      navigator.serviceWorker.getRegistrations()
        .then((regs) => Promise.all(regs.map((reg) => reg.unregister().catch(() => false))))
        .catch(() => {});
    }

    if ("caches" in window) {
      caches.keys()
        .then((keys) => Promise.all(
          keys
            .filter((key) => key.startsWith("daog-"))
            .map((key) => caches.delete(key).catch(() => false)),
        ))
        .catch(() => {});
    }
  }, [params]);

  // ── THE KEY FIX: watch auth store, redirect when session is confirmed ────────
  // This runs whether user came from OTP, Google OAuth, or a page reload.
  // We only redirect after isHydrating=false AND isAuthenticated=true.
  // This guarantees the session is real before we navigate to a protected page.
  useEffect(() => {
    if (didRedirect.current) return;
    if (isHydrating) return; // still checking session — wait
    if (isAuthenticated && user) {
      didRedirect.current = true;
      if (step === "waiting") setStep("success");
      setTimeout(() => router.replace(redirectTo), 600);
    } else if (step === "waiting") {
      // isHydrating just cleared but not authenticated
      // This happens when session didn't persist — show error
      setStep("otp");
      setFormError("Could not verify session. Please try again.");
    }
  }, [isHydrating, isAuthenticated, user, step, router, redirectTo]);

  // ── Step 1: Send OTP ───────────────────────────────────────────────────────
  async function handleEmailSubmit(e: React.FormEvent) {
    e.preventDefault();
    setFormError(null);
    const trimmed = email.trim();
    if (!trimmed) { setFormError("Email address is required."); return; }
    if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(trimmed)) {
      setFormError("Please enter a valid email address.");
      return;
    }
    setSubmitting(true);
    const r = await sendOtp(trimmed, "email", undefined, redirectTo);
    setSubmitting(false);
    if (!r.success) { setFormError(r.error ?? "Failed to send code."); return; }
    setCooldown(Date.now() + 2 * 60 * 1000);
    setStep("otp");
    toast.success("Code sent! Check your inbox.", { duration: 4000 });
  }

  // ── Step 2: Verify OTP — then wait for auth store to confirm ──────────────
  async function handleOtpChange(val: string) {
    setOtp(val);
    setFormError(null);
    if (val.length !== 6 || verifyingRef.current) return;

    verifyingRef.current = true;
    setVerifying(true);

    const r = await verifyOtp(email.trim(), val, "email");

    setVerifying(false);
    verifyingRef.current = false;

    if (!r.success) {
      setFormError(r.error ?? "Incorrect code — please try again.");
      setOtpWrong(true);
      setAttempts((n) => n + 1);
      setTimeout(() => setOtpWrong(false), 500);
      setOtp("");
    } else {
      // OTP accepted by Supabase. 
      // Move to "waiting" — the useEffect above will redirect once auth store confirms.
      setStep("waiting");
    }
  }

  async function handleResend() {
    if (Date.now() < cooldown) return;
    setResending(true);
    setFormError(null);
    const r = await sendOtp(email.trim(), "email", undefined, redirectTo);
    setResending(false);
    if (r.success) {
      setCooldown(Date.now() + 2 * 60 * 1000);
      setOtp(""); setAttempts(0);
      toast.success("New code sent!", { duration: 3000 });
    } else {
      setFormError(r.error ?? "Failed to resend. Try again.");
    }
  }

  async function handleGoogle() {
    setFormError(null);
    setOauthBusy(true);
    const r = await signInWithOAuth("google", redirectTo);
    if (!r.success) {
      setOauthBusy(false);
      setFormError(r.error ?? "Google sign-in failed.");
    }
  }

  // ── Hydrating ──────────────────────────────────────────────────────────────
  if (isHydrating) {
    return (
      <div className="flex flex-col items-center justify-center py-16 gap-3">
        <Loader2 className="w-5 h-5 text-lilac/50 animate-spin" />
        <p className="text-muted-lavender text-xs">Checking session…</p>
      </div>
    );
  }

  // ── Waiting for session to propagate ──────────────────────────────────────
  if (step === "waiting") {
    return (
      <motion.div
        initial={{ opacity: 0, scale: 0.95 }} animate={{ opacity: 1, scale: 1 }}
        className="flex flex-col items-center gap-5 py-12 text-center"
      >
        <div className="relative w-16 h-16">
          <svg className="w-16 h-16 -rotate-90" viewBox="0 0 64 64">
            <circle cx="32" cy="32" r="28" fill="none" stroke="rgba(212,165,255,0.1)" strokeWidth="3" />
            <motion.circle cx="32" cy="32" r="28" fill="none" stroke="#d4a5ff"
              strokeWidth="3" strokeLinecap="round"
              strokeDasharray={`${2 * Math.PI * 28}`}
              animate={{ strokeDashoffset: [2 * Math.PI * 28, 0] }}
              transition={{ duration: 2, ease: "easeInOut", repeat: Infinity, repeatType: "reverse" }}
            />
          </svg>
          <div className="absolute inset-0 flex items-center justify-center">
            <motion.div className="w-2.5 h-2.5 rounded-full bg-lilac/70"
              animate={{ scale: [1, 1.3, 1] }} transition={{ duration: 1, repeat: Infinity }} />
          </div>
        </div>
        <div>
          <p className="text-soft-white font-semibold text-base">Verified! Setting up your session…</p>
          <p className="text-muted-lavender text-xs mt-1">This takes just a moment</p>
        </div>
      </motion.div>
    );
  }

  // ── Success ────────────────────────────────────────────────────────────────
  if (step === "success") {
    return (
      <motion.div
        initial={{ opacity: 0, scale: 0.95 }} animate={{ opacity: 1, scale: 1 }}
        className="flex flex-col items-center gap-4 py-12 text-center"
      >
        <motion.div initial={{ scale: 0 }} animate={{ scale: 1 }}
          transition={{ type: "spring", stiffness: 260, damping: 20, delay: 0.1 }}
        >
          <CheckCircle2 className="w-16 h-16 text-lilac" strokeWidth={1.5} />
        </motion.div>
        <div>
          <p className="text-soft-white font-bold text-xl">You&apos;re in!</p>
          <p className="text-muted-lavender text-sm mt-1">Redirecting you now…</p>
        </div>
        <Loader2 className="w-4 h-4 text-lilac/50 animate-spin" />
      </motion.div>
    );
  }

  // ── OTP step ───────────────────────────────────────────────────────────────
  if (step === "otp") {
    const canResend = Date.now() >= cooldown;
    return (
      <motion.div key="otp" initial={{ opacity: 0, x: 20 }} animate={{ opacity: 1, x: 0 }}
        exit={{ opacity: 0, x: -20 }} transition={{ duration: 0.25 }} className="space-y-5"
      >
        <div className="flex flex-col items-center text-center space-y-2">
          <div className="w-14 h-14 rounded-2xl bg-lilac/10 flex items-center justify-center mb-1">
            <ShieldCheck className="w-7 h-7 text-lilac" strokeWidth={1.5} />
          </div>
          <h2 className="text-soft-white font-bold text-xl">Check your inbox</h2>
          <p className="text-muted-lavender text-sm">We sent a 6-digit code to</p>
          <p className="text-lilac font-semibold text-sm break-all">{email}</p>
        </div>

        <AnimatePresence>
          {formError && <ErrorBanner message={formError} />}
        </AnimatePresence>

        <div className={cn("transition-transform", otpWrong && "animate-shake")}>
          <InputOtpV1
            value={otp}
            onChange={handleOtpChange}
            maxLength={6}
            disabled={verifying || resending}
            className={cn(otpWrong && "border-red-500/50")}
          />
        </div>

        <AnimatePresence>
          {verifying && (
            <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
              className="flex items-center justify-center gap-2"
            >
              <Loader2 size={13} className="animate-spin text-lilac/60" />
              <span className="text-xs text-muted-lavender">Verifying…</span>
            </motion.div>
          )}
        </AnimatePresence>

        {attempts >= 3 && (
          <p className="text-center text-[11px] text-muted-lavender/50 leading-relaxed">
            Having trouble? Check your spam folder, or go back and try again.
          </p>
        )}

        <button onClick={handleResend} disabled={!canResend || resending || verifying}
          className="w-full flex items-center justify-center gap-2 text-sm text-muted-lavender hover:text-lilac disabled:opacity-40 disabled:cursor-not-allowed transition-colors"
        >
          {resending ? (
            <><Loader2 size={13} className="animate-spin" />Resending…</>
          ) : canResend ? (
            <><RefreshCw size={12} />Resend code</>
          ) : (
            <span className="text-xs">
              Resend in{" "}
              <CustomCountDown date={cooldown} variant="ms" onComplete={() => setCooldown(0)}
                className="font-semibold text-muted-lavender" />
            </span>
          )}
        </button>

        <button type="button"
          onClick={() => { setStep("email"); setOtp(""); setFormError(null); }}
          className="w-full flex items-center justify-center gap-1.5 text-xs text-muted-lavender/60 hover:text-muted-lavender transition-colors"
        >
          <ArrowLeft size={12} /> Use a different email
        </button>
      </motion.div>
    );
  }

  // ── Email step ─────────────────────────────────────────────────────────────
  return (
    <motion.div key="email" initial={{ opacity: 0, x: -20 }} animate={{ opacity: 1, x: 0 }}
      exit={{ opacity: 0, x: 20 }} transition={{ duration: 0.25 }} className="space-y-5"
    >
      <div className="flex flex-col items-center text-center space-y-1">
        <AppLogo width={52} height={52} />
        <h1 className="text-soft-white font-bold text-2xl mt-2">
          {isSignupMode ? "Create your DAOG account" : "Sign in to DAOG"}
        </h1>
        <p className="text-muted-lavender text-sm">
          {isSignupMode
            ? "Use your email or Google to get started. New accounts are created automatically."
            : "Enter your email — we&apos;ll send a code. No password needed."}
        </p>
      </div>

      <AnimatePresence>
        {formError && <ErrorBanner message={formError} />}
      </AnimatePresence>

      <form onSubmit={handleEmailSubmit} className="space-y-3" noValidate>
        <div className="relative">
          <Mail className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-lavender pointer-events-none" />
          <input
            type="email"
            value={email}
            onChange={(e) => { setEmail(e.target.value); setFormError(null); }}
            placeholder="you@example.com"
            autoComplete="email"
            autoFocus
            required
            disabled={submitting}
            className="w-full h-12 pl-10 pr-4 rounded-xl border border-white/10 bg-white/5 text-soft-white placeholder-muted-lavender text-sm focus:outline-none focus:border-lilac/50 focus:bg-white/8 transition-all disabled:opacity-50"
          />
        </div>
        <button type="submit" disabled={!email.trim() || submitting}
          className="w-full h-12 rounded-xl bg-lilac text-deep-purple font-bold text-sm hover:bg-lilac/90 active:scale-[0.98] transition-all disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2"
        >
          {submitting
            ? <><Loader2 size={15} className="animate-spin" />Sending code…</>
            : isSignupMode ? "Send sign-up code" : "Send sign-in code"
          }
        </button>
      </form>

      <div className="flex items-center gap-2">
        <div className="flex-1 h-px bg-white/10" />
        <span className="text-xs text-muted-lavender/50">or</span>
        <div className="flex-1 h-px bg-white/10" />
      </div>

      <button type="button" onClick={handleGoogle} disabled={oauthBusy || submitting}
        className="w-full h-12 rounded-xl border border-white/10 bg-white/5 text-soft-white text-sm font-medium hover:bg-white/8 hover:border-lilac/30 active:scale-[0.98] transition-all disabled:opacity-50 flex items-center justify-center gap-3"
      >
        {oauthBusy
          ? <Loader2 size={15} className="animate-spin text-muted-lavender" />
          : <FaGoogle size={16} className="text-[#4285F4]" />
        }
        Continue with Google
      </button>

      <p className="text-center text-[11px] text-muted-lavender/50 leading-relaxed">
        New users are registered automatically.{" "}
        <a href="/legal/terms" className="hover:text-muted-lavender transition-colors underline underline-offset-2">Terms</a>
        {" & "}
        <a href="/legal/privacy" className="hover:text-muted-lavender transition-colors underline underline-offset-2">Privacy</a>
      </p>
    </motion.div>
  );
}

export default function AuthPage() {
  return (
    <Suspense fallback={
      <div className="flex justify-center items-center min-h-[300px]">
        <Loader2 className="w-5 h-5 text-lilac/50 animate-spin" />
      </div>
    }>
      <AuthForm />
    </Suspense>
  );
}

// Inject shake animation
if (typeof document !== "undefined") {
  const id = "__daog-shake";
  if (!document.getElementById(id)) {
    const s = document.createElement("style");
    s.id = id;
    s.textContent = `@keyframes shake{0%,100%{transform:translateX(0)}20%,60%{transform:translateX(-8px)}40%,80%{transform:translateX(8px)}}.animate-shake{animation:shake 0.45s ease-in-out}`;
    document.head.appendChild(s);
  }
}
