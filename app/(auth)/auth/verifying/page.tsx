// app/(auth)/auth/verifying/page.tsx
// Used after Google OAuth callback and magic link clicks.
// Waits for the auth store to confirm a live session, then redirects.
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
  const { isAuthenticated, isHydrating } = useAuthStore();

  const [state,     setState]     = useState<State>("verifying");
  const [stepIndex, setStepIndex] = useState(0);
  const [errorMsg,  setErrorMsg]  = useState("");
  const redirected  = useRef(false);

  // Handle implicit flow (#access_token in hash — set by Google OAuth)
  useEffect(() => {
    const hash = window.location.hash;
    if (!hash) return;
    const hp          = new URLSearchParams(hash.slice(1));
    const accessToken  = hp.get("access_token");
    const refreshToken = hp.get("refresh_token");
    const errorDesc    = hp.get("error_description");
    if (errorDesc) { setErrorMsg(decodeURIComponent(errorDesc).replace(/\+/g, " ")); setState("error"); return; }
    if (accessToken && refreshToken) {
      const supabase = createClient();
      supabase.auth.setSession({ access_token: accessToken, refresh_token: refreshToken })
        .catch(() => { setErrorMsg("Could not establish session. Please try signing in again."); setState("error"); });
      window.history.replaceState(null, "", window.location.pathname + window.location.search);
    }
  }, []);

  // Cycle status messages
  useEffect(() => {
    if (state !== "verifying") return;
    const t = setInterval(() => setStepIndex((i) => Math.min(i + 1, STEPS.length - 1)), 900);
    return () => clearInterval(t);
  }, [state]);

  // Watch auth store — redirect when session confirmed
  useEffect(() => {
    if (redirected.current || state === "error") return;
    if (isHydrating) return; // still checking
    if (isAuthenticated) {
      redirected.current = true;
      setState("success");
      setTimeout(() => router.replace(next.startsWith("/") ? next : "/profile"), 700);
    } else {
      // Hydration done but not authenticated — session didn't take
      setErrorMsg("Your sign-in link may have expired. Please request a new one.");
      setState("error");
    }
  }, [isHydrating, isAuthenticated, next, router, state]);

  const redirectPath = next.startsWith("/") ? next : "/profile";

  return (
    <div className="min-h-screen flex flex-col items-center justify-center px-4"
      style={{ background: "radial-gradient(ellipse at 60% 0%, #2d1052 0%, #1a0b2e 60%, #0f0720 100%)" }}
    >
      <motion.div initial={{ opacity: 0, y: 24 }} animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5 }}
        className="flex flex-col items-center gap-8 w-full max-w-sm text-center"
      >
        <AppLogo width={52} height={52} />

        <div className="relative w-20 h-20 flex items-center justify-center">
          <AnimatePresence mode="wait">
            {state === "success" && (
              <motion.div key="check" initial={{ scale: 0 }} animate={{ scale: 1 }}
                transition={{ type: "spring", stiffness: 260, damping: 20 }}
              >
                <CheckCircle2 className="w-20 h-20 text-lilac" strokeWidth={1.5} />
              </motion.div>
            )}
            {state === "error" && (
              <motion.div key="x" initial={{ scale: 0 }} animate={{ scale: 1 }}
                transition={{ type: "spring", stiffness: 260, damping: 20 }}
              >
                <XCircle className="w-20 h-20 text-red-400" strokeWidth={1.5} />
              </motion.div>
            )}
            {state === "verifying" && (
              <motion.div key="spinner" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}>
                <svg className="w-20 h-20 -rotate-90" viewBox="0 0 80 80">
                  <circle cx="40" cy="40" r="34" fill="none" stroke="rgba(212,165,255,0.1)" strokeWidth="4" />
                  <motion.circle cx="40" cy="40" r="34" fill="none" stroke="#d4a5ff"
                    strokeWidth="4" strokeLinecap="round"
                    strokeDasharray={`${2 * Math.PI * 34}`}
                    animate={{ strokeDashoffset: [2 * Math.PI * 34, 0] }}
                    transition={{ duration: 2.5, ease: "easeInOut", repeat: Infinity, repeatType: "reverse" }}
                  />
                </svg>
                <motion.div className="absolute inset-0 flex items-center justify-center"
                  animate={{ scale: [1, 1.15, 1] }} transition={{ duration: 1.2, repeat: Infinity }}
                >
                  <div className="w-3 h-3 rounded-full bg-lilac/70" />
                </motion.div>
              </motion.div>
            )}
          </AnimatePresence>
        </div>

        <AnimatePresence mode="wait">
          {state === "verifying" && (
            <motion.div key="verifying" initial={{ opacity: 0, y: 6 }} animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -6 }} className="space-y-3"
            >
              <AnimatePresence mode="wait">
                <motion.p key={stepIndex} initial={{ opacity: 0, y: 6 }} animate={{ opacity: 1, y: 0 }}
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
            <motion.div key="success" initial={{ opacity: 0, y: 6 }} animate={{ opacity: 1, y: 0 }} className="space-y-1">
              <p className="text-soft-white font-semibold text-base">You&apos;re in!</p>
              <p className="text-muted-lavender text-sm">Redirecting you now…</p>
            </motion.div>
          )}
          {state === "error" && (
            <motion.div key="error" initial={{ opacity: 0, y: 6 }} animate={{ opacity: 1, y: 0 }}
              className="space-y-4 w-full"
            >
              <div>
                <p className="text-soft-white font-semibold text-base mb-1">Sign-in failed</p>
                <p className="text-muted-lavender text-sm leading-relaxed max-w-xs mx-auto">
                  {errorMsg || "Please request a new sign-in code and try again."}
                </p>
              </div>
              <div className="flex flex-col gap-2 w-full max-w-xs mx-auto">
                <button onClick={() => router.push(`/auth?redirectTo=${encodeURIComponent(redirectPath)}`)}
                  className="flex items-center justify-center gap-2 h-11 rounded-xl bg-lilac text-deep-purple font-semibold text-sm hover:bg-lilac/90 transition-colors"
                >
                  <Mail className="w-4 h-4" /> Try signing in again
                </button>
                <button onClick={() => router.push("/")}
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