// app/(auth)/auth/verifying/page.tsx
// Production-grade PKCE OAuth completion + OTP session confirmation.
//
// PKCE flow (Google/Facebook OAuth):
//   Google → Supabase → /auth/verifying?code=XXX
//   We call exchangeCodeForSession(code) with a FRESH createBrowserClient.
//   The fresh client reads the code_verifier from cookies (set before OAuth redirect).
//   Exchange succeeds → SIGNED_IN fires → auth store updates → redirect to profile.
//
// OTP flow:
//   Server verifies OTP → session in cookies → SIGNED_IN fires → redirect.
//
// Implicit fallback (#access_token):
//   Calls setSession() directly → SIGNED_IN fires → redirect.
"use client";

import { useEffect, useRef, useState, Suspense } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { motion, AnimatePresence } from "framer-motion";
import { CheckCircle2, XCircle, Mail } from "lucide-react";
import { createBrowserClient } from "@supabase/ssr";
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
  const processed   = useRef(false);

  const redirectPath = next.startsWith("/") ? next : "/profile";

  // ── Process auth on mount ─────────────────────────────────────────────────
  useEffect(() => {
    if (processed.current) return;
    processed.current = true;

    const url = process.env.NEXT_PUBLIC_SUPABASE_URL!;
    const key = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!;

    // Always create a FRESH client for auth exchange.
    // This ensures it reads the current cookie state (including code_verifier)
    // rather than relying on any cached singleton state.
    const supabase = createBrowserClient(url, key);

    async function processAuth() {
      // ── Case 1: PKCE OAuth — ?code= in URL ─────────────────────────────
      // The code_verifier was stored in cookies by the SAME createBrowserClient
      // type when signInWithOAuth was called. The fresh instance here reads
      // those same cookies and can complete the PKCE exchange.
      if (code) {
        const { data, error } = await supabase.auth.exchangeCodeForSession(code);

        if (error) {
          console.error("[verifying] PKCE exchange failed:", error.message);
          setErrorMsg("Sign-in failed. Please try again.");
          setUiState("error");
          return;
        }

        // Exchange succeeded — session is now set.
        // onAuthStateChange(SIGNED_IN) will fire and update the auth store.
        // The useEffect below watches isAuthenticated and will redirect.
        console.log("[verifying] PKCE exchange successful for:", data.user?.email);

        // Clean the code from the URL
        const clean = new URL(window.location.href);
        clean.searchParams.delete("code");
        window.history.replaceState(null, "", clean.toString());
        return;
      }

      // ── Case 2: Implicit flow — #access_token in URL hash ──────────────
      const hash = window.location.hash;
      if (hash && hash.includes("access_token")) {
        const hp           = new URLSearchParams(hash.slice(1));
        const accessToken  = hp.get("access_token");
        const refreshToken = hp.get("refresh_token");
        const hashError    = hp.get("error_description");

        window.history.replaceState(null, "", window.location.pathname + window.location.search);

        if (hashError) {
          setErrorMsg(decodeURIComponent(hashError).replace(/\+/g, " "));
          setUiState("error");
          return;
        }

        if (accessToken && refreshToken) {
          const { error } = await supabase.auth.setSession({
            access_token: accessToken,
            refresh_token: refreshToken,
          });
          if (error) {
            setErrorMsg("Could not establish session. Please try again.");
            setUiState("error");
          }
        }
        return;
      }

      // ── Case 3: OTP verified server-side — session already in cookies ───
      // No action needed. useSessionHydration will detect the session via
      // getSession() → INITIAL_SESSION/SIGNED_IN → auth store updates → redirect.
    }

    processAuth().catch((err) => {
      console.error("[verifying] unexpected error:", err);
      setErrorMsg("Sign-in failed. Please try again.");
      setUiState("error");
    });
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  // ── Cycle status messages ─────────────────────────────────────────────────
  useEffect(() => {
    if (uiState !== "verifying") return;
    const t = setInterval(() => setStepIndex(i => Math.min(i + 1, STEPS.length - 1)), 950);
    return () => clearInterval(t);
  }, [uiState]);

  // ── Redirect once auth store confirms session ─────────────────────────────
  useEffect(() => {
    if (redirected.current || uiState === "error") return;
    if (isHydrating) return;
    if (isAuthenticated) {
      redirected.current = true;
      setUiState("success");
      setTimeout(() => router.replace(redirectPath), 650);
    }
  }, [isHydrating, isAuthenticated, redirectPath, router, uiState]);

  // ── Safety timeout ────────────────────────────────────────────────────────
  useEffect(() => {
    const t = setTimeout(() => {
      if (!redirected.current && uiState === "verifying") {
        setErrorMsg("Sign-in timed out. Please try again.");
        setUiState("error");
      }
    }, 15000);
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
        transition={{ duration: 0.45, ease: "easeOut" }}
        className="flex flex-col items-center gap-8 w-full max-w-sm text-center"
      >
        <AppLogo width={52} height={52} />

        {/* Animated icon */}
        <div className="relative w-20 h-20 flex items-center justify-center">
          <AnimatePresence mode="wait">
            {uiState === "success" && (
              <motion.div key="check"
                initial={{ scale: 0 }} animate={{ scale: 1 }}
                transition={{ type: "spring", stiffness: 300, damping: 22 }}
              >
                <CheckCircle2 className="w-20 h-20 text-lilac" strokeWidth={1.5} />
              </motion.div>
            )}
            {uiState === "error" && (
              <motion.div key="x"
                initial={{ scale: 0 }} animate={{ scale: 1 }}
                transition={{ type: "spring", stiffness: 300, damping: 22 }}
              >
                <XCircle className="w-20 h-20 text-red-400" strokeWidth={1.5} />
              </motion.div>
            )}
            {uiState === "verifying" && (
              <motion.div key="spin"
                initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
              >
                <svg className="w-20 h-20 -rotate-90" viewBox="0 0 80 80">
                  <circle cx="40" cy="40" r="34" fill="none"
                    stroke="rgba(212,165,255,0.12)" strokeWidth="4" />
                  <motion.circle cx="40" cy="40" r="34" fill="none"
                    stroke="#d4a5ff" strokeWidth="4" strokeLinecap="round"
                    strokeDasharray={`${2 * Math.PI * 34}`}
                    animate={{ strokeDashoffset: [2 * Math.PI * 34, 0] }}
                    transition={{ duration: 2.4, ease: "easeInOut", repeat: Infinity, repeatType: "reverse" }}
                  />
                </svg>
                <motion.div
                  className="absolute inset-0 flex items-center justify-center"
                  animate={{ scale: [1, 1.18, 1] }}
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
          {uiState === "verifying" && (
            <motion.div key="v"
              initial={{ opacity: 0, y: 6 }} animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -6 }} className="space-y-3"
            >
              <AnimatePresence mode="wait">
                <motion.p key={stepIndex}
                  initial={{ opacity: 0, y: 6 }} animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, y: -6 }} transition={{ duration: 0.25 }}
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

          {uiState === "success" && (
            <motion.div key="ok"
              initial={{ opacity: 0, y: 6 }} animate={{ opacity: 1, y: 0 }}
              className="space-y-1"
            >
              <p className="text-soft-white font-bold text-xl">You&apos;re in!</p>
              <p className="text-muted-lavender text-sm">Redirecting you now…</p>
            </motion.div>
          )}

          {uiState === "error" && (
            <motion.div key="err"
              initial={{ opacity: 0, y: 6 }} animate={{ opacity: 1, y: 0 }}
              className="space-y-5 w-full"
            >
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
                  <Mail className="w-4 h-4" />
                  Try signing in again
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
  return (
    <Suspense>
      <VerifyingContent />
    </Suspense>
  );
}