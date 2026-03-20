// app/(auth)/auth/verifying/page.tsx
// Handles OAuth PKCE completion and OTP session propagation.
// 
// For Google/OAuth: Supabase redirects here with ?code=XXX&oauth=1
//   → Call exchangeCodeForSession client-side (browser has the PKCE verifier)
// For OTP: Arrives after server-side verification
//   → Wait for auth store to confirm session from SIGNED_IN event
"use client";

import { useEffect, useRef, useState, Suspense } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { motion, AnimatePresence } from "framer-motion";
import { CheckCircle2, XCircle, Mail } from "lucide-react";
import AppLogo from "@/components/reusables/app-logo";
import { useAuthStore } from "@/store/authStore";
import { createClient } from "@/supabase/client";

const STEPS = [
  "Verifying your identity…",
  "Securing your session…",
  "Loading your profile…",
  "Almost there…",
];

type State = "verifying" | "success" | "error";

function VerifyingContent() {
  const router  = useRouter();
  const params  = useSearchParams();
  const next    = params.get("next") ?? "/profile";
  const code    = params.get("code");
  const isOAuth = params.get("oauth") === "1";

  const { isAuthenticated, isHydrating } = useAuthStore();

  const [state,     setState]     = useState<State>("verifying");
  const [stepIndex, setStepIndex] = useState(0);
  const [errorMsg,  setErrorMsg]  = useState("");
  const redirected  = useRef(false);
  const exchanged   = useRef(false);

  const redirectPath = next.startsWith("/") ? next : "/profile";

  // ── Exchange OAuth code client-side ───────────────────────────────────────
  // Only runs when ?code= is present (OAuth PKCE flow).
  // The browser client retains the code_verifier from signInWithOAuth().
  useEffect(() => {
    if (!code || exchanged.current) return;
    exchanged.current = true;

    const supabase = createClient();
    supabase.auth.exchangeCodeForSession(code)
      .then(({ data, error }) => {
        if (error) {
          console.error("[verifying] exchangeCodeForSession error:", error.message);
          // Try to give a helpful message
          if (error.message.toLowerCase().includes("expired") || 
              error.message.toLowerCase().includes("invalid")) {
            setErrorMsg("The sign-in link has expired. Please try again.");
          } else {
            setErrorMsg("Sign-in failed: " + error.message);
          }
          setState("error");
          return;
        }
        // Success — SIGNED_IN event will fire and update auth store
        // The useEffect watching isAuthenticated below will handle redirect
        console.log("[verifying] code exchanged successfully for user:", data.user?.email);
      })
      .catch((err) => {
        console.error("[verifying] exchange exception:", err);
        setErrorMsg("Sign-in failed. Please try again.");
        setState("error");
      });
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [code]);

  // ── Cycle status messages ─────────────────────────────────────────────────
  useEffect(() => {
    if (state !== "verifying") return;
    const t = setInterval(() => setStepIndex((i) => Math.min(i + 1, STEPS.length - 1)), 950);
    return () => clearInterval(t);
  }, [state]);

  // ── Watch auth store → redirect when session confirmed ────────────────────
  useEffect(() => {
    if (redirected.current || state === "error") return;
    if (isHydrating) return; // wait for session check to complete

    if (isAuthenticated) {
      redirected.current = true;
      setState("success");
      setTimeout(() => router.replace(redirectPath), 700);
      return;
    }

    // Hydration complete but NOT authenticated
    if (!code) {
      // No code to exchange — OTP flow session failed
      setErrorMsg("Session could not be established. Please sign in again.");
      setState("error");
    }
    // If code exists, we're still waiting for exchange to complete + SIGNED_IN to fire
  }, [isHydrating, isAuthenticated, redirectPath, router, state, code]);

  return (
    <div
      className="min-h-screen flex flex-col items-center justify-center px-4"
      style={{ background: "radial-gradient(ellipse at 60% 0%, #2d1052 0%, #1a0b2e 60%, #0f0720 100%)" }}
    >
      <motion.div
        initial={{ opacity: 0, y: 24 }} animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5 }}
        className="flex flex-col items-center gap-8 w-full max-w-sm text-center"
      >
        <AppLogo width={52} height={52} />

        {/* Animated icon */}
        <div className="relative w-20 h-20 flex items-center justify-center">
          <AnimatePresence mode="wait">
            {state === "success" && (
              <motion.div key="check"
                initial={{ scale: 0 }} animate={{ scale: 1 }}
                transition={{ type: "spring", stiffness: 260, damping: 20 }}
              >
                <CheckCircle2 className="w-20 h-20 text-lilac" strokeWidth={1.5} />
              </motion.div>
            )}
            {state === "error" && (
              <motion.div key="x"
                initial={{ scale: 0 }} animate={{ scale: 1 }}
                transition={{ type: "spring", stiffness: 260, damping: 20 }}
              >
                <XCircle className="w-20 h-20 text-red-400" strokeWidth={1.5} />
              </motion.div>
            )}
            {state === "verifying" && (
              <motion.div key="spinner"
                initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
              >
                <svg className="w-20 h-20 -rotate-90" viewBox="0 0 80 80">
                  <circle cx="40" cy="40" r="34" fill="none"
                    stroke="rgba(212,165,255,0.1)" strokeWidth="4" />
                  <motion.circle cx="40" cy="40" r="34" fill="none" stroke="#d4a5ff"
                    strokeWidth="4" strokeLinecap="round"
                    strokeDasharray={`${2 * Math.PI * 34}`}
                    animate={{ strokeDashoffset: [2 * Math.PI * 34, 0] }}
                    transition={{ duration: 2.5, ease: "easeInOut", repeat: Infinity, repeatType: "reverse" }}
                  />
                </svg>
                <motion.div
                  className="absolute inset-0 flex items-center justify-center"
                  animate={{ scale: [1, 1.15, 1] }}
                  transition={{ duration: 1.2, repeat: Infinity }}
                >
                  <div className="w-3 h-3 rounded-full bg-lilac/70" />
                </motion.div>
              </motion.div>
            )}
          </AnimatePresence>
        </div>

        {/* Text content */}
        <AnimatePresence mode="wait">
          {state === "verifying" && (
            <motion.div key="v"
              initial={{ opacity: 0, y: 6 }} animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -6 }} className="space-y-3"
            >
              <AnimatePresence mode="wait">
                <motion.p key={stepIndex}
                  initial={{ opacity: 0, y: 6 }} animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, y: -6 }} transition={{ duration: 0.3 }}
                  className="text-soft-white font-semibold text-base"
                >
                  {STEPS[stepIndex]}
                </motion.p>
              </AnimatePresence>
              <p className="text-muted-lavender text-xs">Please keep this tab open</p>
              <div className="flex items-center justify-center gap-2 pt-1">
                {STEPS.map((_, i) => (
                  <motion.div key={i} className="rounded-full bg-lilac"
                    animate={{ width: i === stepIndex ? 20 : 6, opacity: i <= stepIndex ? 1 : 0.25 }}
                    transition={{ duration: 0.3 }} style={{ height: 6 }}
                  />
                ))}
              </div>
            </motion.div>
          )}

          {state === "success" && (
            <motion.div key="s"
              initial={{ opacity: 0, y: 6 }} animate={{ opacity: 1, y: 0 }}
              className="space-y-1"
            >
              <p className="text-soft-white font-semibold text-base">You&apos;re in!</p>
              <p className="text-muted-lavender text-sm">Redirecting you now…</p>
            </motion.div>
          )}

          {state === "error" && (
            <motion.div key="e"
              initial={{ opacity: 0, y: 6 }} animate={{ opacity: 1, y: 0 }}
              className="space-y-4 w-full"
            >
              <div>
                <p className="text-soft-white font-semibold text-base mb-1">Sign-in failed</p>
                <p className="text-muted-lavender text-sm leading-relaxed max-w-xs mx-auto">
                  {errorMsg || "Please try signing in again."}
                </p>
              </div>
              <div className="flex flex-col gap-2 w-full max-w-xs mx-auto">
                <button
                  onClick={() => router.push(`/auth?redirectTo=${encodeURIComponent(redirectPath)}`)}
                  className="flex items-center justify-center gap-2 h-11 rounded-xl bg-lilac text-deep-purple font-semibold text-sm hover:bg-lilac/90 transition-colors"
                >
                  <Mail className="w-4 h-4" /> Try signing in again
                </button>
                <button
                  onClick={() => router.push("/")}
                  className="h-10 rounded-xl border border-white/10 text-muted-lavender text-sm hover:border-lilac/30 hover:text-lilac transition-colors"
                >
                  Back to home
                </button>
              </div>
            </motion.div>
          )}
        </AnimatePresence>
      </motion.div>
    </div>
  );
}

export default function VerifyingPage() {
  return <Suspense><VerifyingContent /></Suspense>;
}