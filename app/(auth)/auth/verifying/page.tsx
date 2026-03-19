// app/(auth)/auth/verifying/page.tsx
// Shown after a successful magic-link / OAuth callback.
// Waits for the client session to hydrate, then redirects to the destination.
"use client";

import { useEffect, useRef, useState } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { motion, AnimatePresence } from "framer-motion";
import { CheckCircle2 } from "lucide-react";
import AppLogo from "@/components/reusables/app-logo";
import { useAuthStore } from "@/store/authStore";
import { Suspense } from "react";

const STEPS = [
  "Verifying your identity…",
  "Securing your session…",
  "Setting up your account…",
  "Almost there…",
];

function VerifyingContent() {
  const router       = useRouter();
  const params       = useSearchParams();
  const next         = params.get("next") ?? "/profile";
  const { isAuthenticated, isHydrating } = useAuthStore();

  const [stepIndex,  setStepIndex]  = useState(0);
  const [done,       setDone]       = useState(false);
  const redirected   = useRef(false);

  // Cycle through status messages
  useEffect(() => {
    const interval = setInterval(() => {
      setStepIndex((i) => Math.min(i + 1, STEPS.length - 1));
    }, 900);
    return () => clearInterval(interval);
  }, []);

  // Watch for hydrated session then redirect
  useEffect(() => {
    if (redirected.current) return;
    if (!isHydrating && isAuthenticated) {
      redirected.current = true;
      setDone(true);
      // Small delay so user sees the success state
      setTimeout(() => {
        router.replace(next.startsWith("/") ? next : "/profile");
      }, 800);
    }
  }, [isHydrating, isAuthenticated, next, router]);

  // Safety fallback — if session never hydrates after 8s, go to auth
  useEffect(() => {
    const timeout = setTimeout(() => {
      if (!redirected.current) {
        router.replace("/auth?error=" + encodeURIComponent("Session could not be verified. Please try signing in again."));
      }
    }, 8000);
    return () => clearTimeout(timeout);
  }, [router]);

  return (
    <div
      className="min-h-screen flex flex-col items-center justify-center px-4"
      style={{ background: "radial-gradient(ellipse at 60% 0%, #2d1052 0%, #1a0b2e 60%, #0f0720 100%)" }}
    >
      <motion.div
        initial={{ opacity: 0, y: 24 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5, ease: "easeOut" }}
        className="flex flex-col items-center gap-8 w-full max-w-xs text-center"
      >
        {/* Logo */}
        <AppLogo width={52} height={52} />

        {/* Spinner / Check */}
        <div className="relative w-20 h-20">
          <AnimatePresence mode="wait">
            {done ? (
              <motion.div
                key="check"
                initial={{ scale: 0, opacity: 0 }}
                animate={{ scale: 1, opacity: 1 }}
                transition={{ type: "spring", stiffness: 260, damping: 20 }}
                className="absolute inset-0 flex items-center justify-center"
              >
                <CheckCircle2 className="w-20 h-20 text-lilac" strokeWidth={1.5} />
              </motion.div>
            ) : (
              <motion.div
                key="spinner"
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                exit={{ opacity: 0 }}
                className="absolute inset-0"
              >
                {/* Outer ring */}
                <svg className="w-20 h-20 -rotate-90" viewBox="0 0 80 80">
                  <circle cx="40" cy="40" r="34" fill="none" stroke="rgba(212,165,255,0.1)" strokeWidth="4" />
                  <motion.circle
                    cx="40" cy="40" r="34"
                    fill="none"
                    stroke="#d4a5ff"
                    strokeWidth="4"
                    strokeLinecap="round"
                    strokeDasharray={`${2 * Math.PI * 34}`}
                    animate={{ strokeDashoffset: [2 * Math.PI * 34, 0] }}
                    transition={{ duration: 2.5, ease: "easeInOut", repeat: Infinity, repeatType: "reverse" }}
                  />
                </svg>
                {/* Inner pulse dot */}
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

        {/* Status text */}
        <div className="space-y-2">
          <AnimatePresence mode="wait">
            <motion.p
              key={done ? "done" : stepIndex}
              initial={{ opacity: 0, y: 6 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -6 }}
              transition={{ duration: 0.3 }}
              className="text-soft-white font-semibold text-base"
            >
              {done ? "You're in! Redirecting…" : STEPS[stepIndex]}
            </motion.p>
          </AnimatePresence>
          <p className="text-muted-lavender text-xs">
            Please keep this tab open
          </p>
        </div>

        {/* Progress dots */}
        {!done && (
          <div className="flex items-center gap-2">
            {STEPS.map((_, i) => (
              <motion.div
                key={i}
                className="rounded-full bg-lilac"
                animate={{
                  width:   i === stepIndex ? 20 : 6,
                  opacity: i <= stepIndex  ? 1  : 0.25,
                }}
                transition={{ duration: 0.3 }}
                style={{ height: 6 }}
              />
            ))}
          </div>
        )}
      </motion.div>
    </div>
  );
}

export default function VerifyingPage() {
  return (
    <Suspense>
      <VerifyingContent />
    </Suspense>
  );
}