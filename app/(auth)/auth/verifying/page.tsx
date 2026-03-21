// app/(auth)/auth/verifying/page.tsx
// Handles all auth completions client-side.
// A fresh createBrowserClient reads the PKCE code_verifier from cookies (set by @supabase/ssr).
// Cookies persist across page navigations, so the verifier is always available here.
"use client";

import { useEffect, useRef, useState, Suspense } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { motion, AnimatePresence } from "framer-motion";
import { CheckCircle2, XCircle, Mail } from "lucide-react";
import AppLogo from "@/components/reusables/app-logo";
import { getSupabaseBrowserClient } from "@/lib/supabaseClient";

const STEPS = [
  "Verifying your identity…",
  "Securing your session…",
  "Loading your profile…",
  "Almost there…",
];

type UIState = "verifying" | "success" | "error";

function VerifyingContent() {
  const router   = useRouter();
  const params   = useSearchParams();
  const next     = params.get("next") ?? "/profile";
  const code     = params.get("code");
  const tokenHash = params.get("token_hash");
  const type     = params.get("type") ?? "email";

  const [uiState,   setUiState]   = useState<UIState>("verifying");
  const [stepIndex, setStepIndex] = useState(0);
  const [errorMsg,  setErrorMsg]  = useState("");
  const done = useRef(false);

  const redirectPath = next.startsWith("/") ? next : "/profile";

  useEffect(() => {
    if (done.current) return;
    done.current = true;

    const supabase = getSupabaseBrowserClient();

    const succeed = () => {
      setUiState("success");
      // Clean URL params
      window.history.replaceState({}, "", "/auth/verifying");
      setTimeout(() => router.replace(redirectPath), 500);
    };

    const fail = (msg: string) => {
      setErrorMsg(msg);
      setUiState("error");
    };

    async function run() {
      // ── PKCE OAuth: ?code= in URL ────────────────────────────────────────
      // Exchange client-side — verifier is in localStorage (same browser session).
      if (code) {
        const { error } = await supabase.auth.exchangeCodeForSession(code);
        if (error) {
          fail(error.message);
        } else {
          succeed();
        }
        return;
      }

      // ── Email token_hash ─────────────────────────────────────────────────
      if (tokenHash) {
        const types = [type as "email"|"magiclink"|"signup", "email", "magiclink", "signup"] as const;
        const seen = new Set<string>();
        for (const t of types) {
          if (seen.has(t)) continue;
          seen.add(t);
          const { error } = await supabase.auth.verifyOtp({ token_hash: tokenHash, type: t });
          if (!error) { succeed(); return; }
        }
        fail("Sign-in link has expired. Please request a new one.");
        return;
      }

      // ── No params: OTP already verified or session in cookies ────────────
      for (let i = 0; i < 12; i++) {
        const { data, error } = await supabase.auth.getSession();
        if (error) { fail("Sign-in failed. Please try again."); return; }
        if (data.session) { succeed(); return; }
        await new Promise(r => setTimeout(r, 350));
      }
      fail("Session could not be confirmed. Please sign in again.");
    }

    run().catch(e => fail(e?.message ?? "Unexpected error."));
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  useEffect(() => {
    if (uiState !== "verifying") return;
    const t = setInterval(() => setStepIndex(i => Math.min(i + 1, STEPS.length - 1)), 900);
    return () => clearInterval(t);
  }, [uiState]);

  return (
    <div className="min-h-screen flex flex-col items-center justify-center px-4"
      style={{ background: "radial-gradient(ellipse at 60% 0%, #2d1052 0%, #1a0b2e 60%, #0f0720 100%)" }}>
      <motion.div initial={{ opacity: 0, y: 24 }} animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.4 }}
        className="flex flex-col items-center gap-8 w-full max-w-sm text-center">
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
                <button onClick={() => router.push(`/auth?redirectTo=${encodeURIComponent(redirectPath)}`)}
                  className="flex items-center justify-center gap-2 h-11 rounded-xl bg-lilac text-deep-purple font-bold text-sm hover:bg-lilac/90 active:scale-[0.98] transition-all">
                  <Mail className="w-4 h-4" /> Try signing in again
                </button>
                <button onClick={() => router.push("/")}
                  className="h-10 rounded-xl border border-white/10 text-muted-lavender text-sm hover:border-lilac/30 hover:text-lilac transition-colors">
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
