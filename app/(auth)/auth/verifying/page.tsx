// app/(auth)/auth/verifying/page.tsx
// OAuth session confirmation page.
//
// When ?code= is present (PKCE flow from Google):
//   → Calls /api/auth/exchange?code=XXX (server route)
//   → Server exchanges code with code_verifier from cookies, sets session cookies
//   → We wait for useSessionHydration to detect the session, then redirect
//
// When no code (OTP or returning session):
//   → Session already in cookies, just wait for auth store confirmation
"use client";

import { useEffect, useRef, useState, Suspense } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { motion, AnimatePresence } from "framer-motion";
import { CheckCircle2, XCircle, Mail } from "lucide-react";
import AppLogo from "@/components/reusables/app-logo";
import { useAuthStore } from "@/store/authStore";

const STEPS = [
  "Verifying your identity…",
  "Securing your session…",
  "Loading your profile…",
  "Almost there…",
];

type UIState = "verifying" | "success" | "error";

function VerifyingContent() {
  const router = useRouter();
  const params = useSearchParams();
  const next   = params.get("next") ?? "/profile";
  const code   = params.get("code");

  const { isAuthenticated, isHydrating } = useAuthStore();
  const [uiState,   setUiState]   = useState<UIState>("verifying");
  const [stepIndex, setStepIndex] = useState(0);
  const [errorMsg,  setErrorMsg]  = useState("");
  const redirected  = useRef(false);
  const exchanged   = useRef(false);

  const redirectPath = next.startsWith("/") ? next : "/profile";

  // ── Exchange PKCE code via server route ─────────────────────────────────
  // If ?code= is in the URL, call the server-side exchange endpoint.
  // The server reads the code_verifier cookie, exchanges with Supabase,
  // and returns session cookies in the response headers.
  useEffect(() => {
    if (!code || exchanged.current) return;
    exchanged.current = true;

    // Strip code from URL immediately to prevent re-use on refresh
    const clean = new URL(window.location.href);
    clean.searchParams.delete("code");
    window.history.replaceState(null, "", clean.toString());

    fetch(`/api/auth/exchange?code=${encodeURIComponent(code)}`)
      .then(async (res) => {
        if (!res.ok) {
          const body = await res.json().catch(() => ({}));
          const msg  = (body as { error?: string }).error ?? "Exchange failed";
          setErrorMsg("Sign-in failed: " + msg);
          setUiState("error");
        }
        // On success: server set session cookies in response headers.
        // The browser stores them. useSessionHydration will detect the session
        // via getSession() → SIGNED_IN → auth store updates → redirect below.
      })
      .catch(() => {
        setErrorMsg("Network error during sign-in. Please try again.");
        setUiState("error");
      });
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  // ── Animate status messages ─────────────────────────────────────────────
  useEffect(() => {
    if (uiState !== "verifying") return;
    const t = setInterval(() => setStepIndex(i => Math.min(i + 1, STEPS.length - 1)), 900);
    return () => clearInterval(t);
  }, [uiState]);

  // ── Watch auth store → redirect on session confirmed ────────────────────
  useEffect(() => {
    if (redirected.current || uiState === "error") return;
    if (isHydrating) return;
    if (isAuthenticated) {
      redirected.current = true;
      setUiState("success");
      setTimeout(() => router.replace(redirectPath), 600);
    }
  }, [isHydrating, isAuthenticated, redirectPath, router, uiState]);

  // ── Safety timeout — 20s ────────────────────────────────────────────────
  useEffect(() => {
    const t = setTimeout(() => {
      if (!redirected.current && uiState === "verifying") {
        setErrorMsg("Sign-in timed out. Please try again.");
        setUiState("error");
      }
    }, 20000);
    return () => clearTimeout(t);
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  return (
    <div
      className="min-h-screen flex flex-col items-center justify-center px-4"
      style={{ background: "radial-gradient(ellipse at 60% 0%, #2d1052 0%, #1a0b2e 60%, #0f0720 100%)" }}
    >
      <motion.div
        initial={{ opacity: 0, y: 24 }} animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.4 }}
        className="flex flex-col items-center gap-8 w-full max-w-sm text-center"
      >
        <AppLogo width={52} height={52} />

        <div className="relative w-20 h-20 flex items-center justify-center">
          <AnimatePresence mode="wait">
            {uiState === "success" && (
              <motion.div key="c" initial={{ scale: 0 }} animate={{ scale: 1 }}
                transition={{ type: "spring", stiffness: 300, damping: 20 }}>
                <CheckCircle2 className="w-20 h-20 text-lilac" strokeWidth={1.5} />
              </motion.div>
            )}
            {uiState === "error" && (
              <motion.div key="x" initial={{ scale: 0 }} animate={{ scale: 1 }}
                transition={{ type: "spring", stiffness: 300, damping: 20 }}>
                <XCircle className="w-20 h-20 text-red-400" strokeWidth={1.5} />
              </motion.div>
            )}
            {uiState === "verifying" && (
              <motion.div key="s" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}>
                <svg className="w-20 h-20 -rotate-90" viewBox="0 0 80 80">
                  <circle cx="40" cy="40" r="34" fill="none" stroke="rgba(212,165,255,0.12)" strokeWidth="4" />
                  <motion.circle cx="40" cy="40" r="34" fill="none" stroke="#d4a5ff"
                    strokeWidth="4" strokeLinecap="round"
                    strokeDasharray={`${2 * Math.PI * 34}`}
                    animate={{ strokeDashoffset: [2 * Math.PI * 34, 0] }}
                    transition={{ duration: 2.4, ease: "easeInOut", repeat: Infinity, repeatType: "reverse" }}
                  />
                </svg>
                <motion.div className="absolute inset-0 flex items-center justify-center"
                  animate={{ scale: [1, 1.18, 1] }} transition={{ duration: 1.2, repeat: Infinity }}>
                  <div className="w-3 h-3 rounded-full bg-lilac/70" />
                </motion.div>
              </motion.div>
            )}
          </AnimatePresence>
        </div>

        <AnimatePresence mode="wait">
          {uiState === "verifying" && (
            <motion.div key="v" initial={{ opacity: 0, y: 6 }} animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -6 }} className="space-y-3">
              <AnimatePresence mode="wait">
                <motion.p key={stepIndex} initial={{ opacity: 0, y: 6 }} animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, y: -6 }} transition={{ duration: 0.25 }}
                  className="text-soft-white font-semibold text-base">
                  {STEPS[stepIndex]}
                </motion.p>
              </AnimatePresence>
              <p className="text-muted-lavender text-xs">Please keep this tab open</p>
              <div className="flex items-center justify-center gap-2 pt-1">
                {STEPS.map((_, i) => (
                  <motion.div key={i} className="rounded-full bg-lilac"
                    animate={{ width: i === stepIndex ? 20 : 6, opacity: i <= stepIndex ? 1 : 0.25 }}
                    transition={{ duration: 0.3 }} style={{ height: 6 }} />
                ))}
              </div>
            </motion.div>
          )}
          {uiState === "success" && (
            <motion.div key="ok" initial={{ opacity: 0, y: 6 }} animate={{ opacity: 1, y: 0 }} className="space-y-1">
              <p className="text-soft-white font-bold text-xl">You&apos;re in!</p>
              <p className="text-muted-lavender text-sm">Redirecting you now…</p>
            </motion.div>
          )}
          {uiState === "error" && (
            <motion.div key="err" initial={{ opacity: 0, y: 6 }} animate={{ opacity: 1, y: 0 }}
              className="space-y-5 w-full">
              <div>
                <p className="text-soft-white font-semibold text-base mb-1">Sign-in failed</p>
                <p className="text-muted-lavender text-sm leading-relaxed max-w-[260px] mx-auto">
                  {errorMsg || "Please try signing in again."}
                </p>
              </div>
              <div className="flex flex-col gap-2.5 w-full max-w-[260px] mx-auto">
                <button
                  onClick={() => router.push(`/auth?redirectTo=${encodeURIComponent(redirectPath)}`)}
                  className="flex items-center justify-center gap-2 h-11 rounded-xl bg-lilac text-deep-purple font-bold text-sm hover:bg-lilac/90 active:scale-[0.98] transition-all"
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