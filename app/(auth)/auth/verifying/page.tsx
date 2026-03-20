// app/(auth)/auth/verifying/page.tsx
// Single client-side page that handles ALL OAuth callback scenarios:
//
//   PKCE flow:     URL has ?code=XXX
//                  → call supabase.auth.exchangeCodeForSession(code)
//                    The browser client has the code_verifier in its cookie storage
//
//   Implicit flow: URL has #access_token=XXX&refresh_token=YYY  
//                  → call supabase.auth.setSession({ access_token, refresh_token })
//
//   OTP verified:  No code, no hash — session already in cookies from server
//                  → just wait for onAuthStateChange to fire SIGNED_IN
//
// In all cases: watch auth store → redirect when isAuthenticated becomes true
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

type UIState = "verifying" | "success" | "error";

function VerifyingContent() {
  const router = useRouter();
  const params = useSearchParams();
  const next   = params.get("next") ?? "/profile";

  const { isAuthenticated, isHydrating } = useAuthStore();
  const [uiState,   setUiState]   = useState<UIState>("verifying");
  const [stepIndex, setStepIndex] = useState(0);
  const [errorMsg,  setErrorMsg]  = useState("");
  const redirected  = useRef(false);
  const handled     = useRef(false);

  const redirectPath = next.startsWith("/") ? next : "/profile";

  // ── Handle code/hash on mount ─────────────────────────────────────────────
  useEffect(() => {
    if (handled.current) return;
    handled.current = true;

    const urlCode = params.get("code");
    const hash    = window.location.hash;

    async function handle() {
      const supabase = createClient();

      // ── PKCE: ?code= in URL ────────────────────────────────────────────────
      if (urlCode) {
        console.log("[verifying] PKCE flow, exchanging code...");
        const { error } = await supabase.auth.exchangeCodeForSession(urlCode);
        if (error) {
          console.error("[verifying] PKCE exchange error:", error.message);
          setErrorMsg(friendlyError(error.message));
          setUiState("error");
        }
        // Clean the code from the URL so it can't be re-used
        const clean = new URL(window.location.href);
        clean.searchParams.delete("code");
        window.history.replaceState(null, "", clean.toString());
        return;
      }

      // ── Implicit: #access_token in hash ────────────────────────────────────
      if (hash && hash.includes("access_token")) {
        console.log("[verifying] Implicit flow, setting session from hash...");
        const hp           = new URLSearchParams(hash.slice(1));
        const accessToken  = hp.get("access_token");
        const refreshToken = hp.get("refresh_token");
        const errorDesc    = hp.get("error_description");

        if (errorDesc) {
          setErrorMsg(friendlyError(decodeURIComponent(errorDesc)));
          setUiState("error");
          return;
        }

        if (accessToken && refreshToken) {
          const { error } = await supabase.auth.setSession({
            access_token: accessToken,
            refresh_token: refreshToken,
          });
          if (error) {
            console.error("[verifying] setSession error:", error.message);
            setErrorMsg(friendlyError(error.message));
            setUiState("error");
          }
          // Clean hash from URL
          window.history.replaceState(null, "", window.location.pathname + window.location.search);
        }
        return;
      }

      // ── No code, no hash — session should already be in cookies (OTP flow) ─
      console.log("[verifying] No code/hash — waiting for session from cookies...");
    }

    handle().catch((err) => {
      console.error("[verifying] handle error:", err);
      setErrorMsg("Sign-in failed. Please try again.");
      setUiState("error");
    });
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  // ── Cycle status messages ─────────────────────────────────────────────────
  useEffect(() => {
    if (uiState !== "verifying") return;
    const t = setInterval(() => setStepIndex((i) => Math.min(i + 1, STEPS.length - 1)), 950);
    return () => clearInterval(t);
  }, [uiState]);

  // ── Watch auth store → redirect when authenticated ────────────────────────
  useEffect(() => {
    if (redirected.current || uiState === "error") return;
    if (isHydrating) return;

    if (isAuthenticated) {
      redirected.current = true;
      setUiState("success");
      setTimeout(() => router.replace(redirectPath), 700);
    } else {
      // Hydration done, not authenticated — something failed
      // Don't show error immediately — the exchange might still be in flight
      // The 5s safety timeout in useSessionHydration will eventually fire
      // If we're still here after it, show the error
    }
  }, [isHydrating, isAuthenticated, redirectPath, router, uiState]);

  // ── Final safety timeout — 12s max ───────────────────────────────────────
  useEffect(() => {
    const t = setTimeout(() => {
      if (!redirected.current && uiState === "verifying") {
        setErrorMsg("Sign-in timed out. Please try again.");
        setUiState("error");
      }
    }, 12000);
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
        transition={{ duration: 0.5 }}
        className="flex flex-col items-center gap-8 w-full max-w-sm text-center"
      >
        <AppLogo width={52} height={52} />

        <div className="relative w-20 h-20 flex items-center justify-center">
          <AnimatePresence mode="wait">
            {uiState === "success" && (
              <motion.div key="check" initial={{ scale: 0 }} animate={{ scale: 1 }}
                transition={{ type: "spring", stiffness: 260, damping: 20 }}
              >
                <CheckCircle2 className="w-20 h-20 text-lilac" strokeWidth={1.5} />
              </motion.div>
            )}
            {uiState === "error" && (
              <motion.div key="x" initial={{ scale: 0 }} animate={{ scale: 1 }}
                transition={{ type: "spring", stiffness: 260, damping: 20 }}
              >
                <XCircle className="w-20 h-20 text-red-400" strokeWidth={1.5} />
              </motion.div>
            )}
            {uiState === "verifying" && (
              <motion.div key="spin" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}>
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
          {uiState === "verifying" && (
            <motion.div key="v" initial={{ opacity: 0, y: 6 }} animate={{ opacity: 1, y: 0 }}
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
          {uiState === "success" && (
            <motion.div key="s" initial={{ opacity: 0, y: 6 }} animate={{ opacity: 1, y: 0 }} className="space-y-1">
              <p className="text-soft-white font-semibold text-base">You&apos;re in!</p>
              <p className="text-muted-lavender text-sm">Redirecting you now…</p>
            </motion.div>
          )}
          {uiState === "error" && (
            <motion.div key="e" initial={{ opacity: 0, y: 6 }} animate={{ opacity: 1, y: 0 }}
              className="space-y-4 w-full"
            >
              <div>
                <p className="text-soft-white font-semibold text-base mb-1">Sign-in failed</p>
                <p className="text-muted-lavender text-sm leading-relaxed max-w-xs mx-auto">
                  {errorMsg || "Please try signing in again."}
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

function friendlyError(raw: string): string {
  const m = raw.toLowerCase();
  if (m.includes("expired"))                             return "The sign-in link has expired. Please try again.";
  if (m.includes("already used"))                        return "This link was already used. Please request a new one.";
  if (m.includes("pkce") || m.includes("code verifier")) return "Sign-in failed. Please try again (clear cookies if this persists).";
  if (m.includes("access denied"))                       return "Access was denied. Please try again.";
  return "Sign-in failed. Please try again.";
}

export default function VerifyingPage() {
  return <Suspense><VerifyingContent /></Suspense>;
}