// app/(auth)/auth/verifying/page.tsx
"use client";

import { useEffect, useRef, useState, Suspense } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { motion, AnimatePresence } from "framer-motion";
import { CheckCircle2, XCircle, Mail } from "lucide-react";
import AppLogo from "@/components/reusables/app-logo";
import { useAuthStore } from "@/store/authStore";
import { createBrowserClient } from "@supabase/ssr";

const STEPS = ["Verifying your identity…","Securing your session…","Loading your profile…","Almost there…"];
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
  const handled     = useRef(false);

  const redirectPath = next.startsWith("/") ? next : "/profile";

  useEffect(() => {
    if (handled.current || !code) return;
    handled.current = true;

    const url = process.env.NEXT_PUBLIC_SUPABASE_URL!;
    const key = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!;
    if (!url || !key) {
      setErrorMsg("Auth not configured."); setUiState("error"); return;
    }

    // Create a FRESH client (not the singleton) so it initializes with
    // the current page's cookie state and can read the code_verifier.
    const freshClient = createBrowserClient(url, key);
    freshClient.auth.exchangeCodeForSession(code)
      .then(({ error }) => {
        if (error) {
          console.error("[verifying] exchange error:", error.message);
          setErrorMsg("Sign-in failed: " + error.message);
          setUiState("error");
        }
        // On success: SIGNED_IN fires → useSessionHydration updates store → redirect
      })
      .catch((e) => {
        console.error("[verifying] exchange exception:", e);
        setErrorMsg("Sign-in failed. Please try again.");
        setUiState("error");
      });
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [code]);

  useEffect(() => {
    if (uiState !== "verifying") return;
    const t = setInterval(() => setStepIndex(i => Math.min(i + 1, STEPS.length - 1)), 950);
    return () => clearInterval(t);
  }, [uiState]);

  useEffect(() => {
    if (redirected.current || uiState === "error") return;
    if (isHydrating) return;
    if (isAuthenticated) {
      redirected.current = true;
      setUiState("success");
      setTimeout(() => router.replace(redirectPath), 700);
    }
  }, [isHydrating, isAuthenticated, redirectPath, router, uiState]);

  // Safety timeout — only fires if no code (OTP path) and session never comes
  useEffect(() => {
    if (code) return; // PKCE path has its own error handling
    const t = setTimeout(() => {
      if (!redirected.current && uiState === "verifying") {
        setErrorMsg("Session timed out. Please sign in again.");
        setUiState("error");
      }
    }, 12000);
    return () => clearTimeout(t);
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  return (
    <div className="min-h-screen flex flex-col items-center justify-center px-4"
      style={{ background: "radial-gradient(ellipse at 60% 0%, #2d1052 0%, #1a0b2e 60%, #0f0720 100%)" }}
    >
      <motion.div initial={{ opacity:0, y:24 }} animate={{ opacity:1, y:0 }} transition={{ duration:0.5 }}
        className="flex flex-col items-center gap-8 w-full max-w-sm text-center"
      >
        <AppLogo width={52} height={52} />

        <div className="relative w-20 h-20 flex items-center justify-center">
          <AnimatePresence mode="wait">
            {uiState === "success" && (
              <motion.div key="c" initial={{scale:0}} animate={{scale:1}} transition={{type:"spring",stiffness:260,damping:20}}>
                <CheckCircle2 className="w-20 h-20 text-lilac" strokeWidth={1.5} />
              </motion.div>
            )}
            {uiState === "error" && (
              <motion.div key="x" initial={{scale:0}} animate={{scale:1}} transition={{type:"spring",stiffness:260,damping:20}}>
                <XCircle className="w-20 h-20 text-red-400" strokeWidth={1.5} />
              </motion.div>
            )}
            {uiState === "verifying" && (
              <motion.div key="s" initial={{opacity:0}} animate={{opacity:1}} exit={{opacity:0}}>
                <svg className="w-20 h-20 -rotate-90" viewBox="0 0 80 80">
                  <circle cx="40" cy="40" r="34" fill="none" stroke="rgba(212,165,255,0.1)" strokeWidth="4"/>
                  <motion.circle cx="40" cy="40" r="34" fill="none" stroke="#d4a5ff" strokeWidth="4" strokeLinecap="round"
                    strokeDasharray={`${2*Math.PI*34}`}
                    animate={{strokeDashoffset:[2*Math.PI*34,0]}}
                    transition={{duration:2.5,ease:"easeInOut",repeat:Infinity,repeatType:"reverse"}}
                  />
                </svg>
                <motion.div className="absolute inset-0 flex items-center justify-center"
                  animate={{scale:[1,1.15,1]}} transition={{duration:1.2,repeat:Infinity}}>
                  <div className="w-3 h-3 rounded-full bg-lilac/70"/>
                </motion.div>
              </motion.div>
            )}
          </AnimatePresence>
        </div>

        <AnimatePresence mode="wait">
          {uiState === "verifying" && (
            <motion.div key="v" initial={{opacity:0,y:6}} animate={{opacity:1,y:0}} exit={{opacity:0,y:-6}} className="space-y-3">
              <AnimatePresence mode="wait">
                <motion.p key={stepIndex} initial={{opacity:0,y:6}} animate={{opacity:1,y:0}} exit={{opacity:0,y:-6}} transition={{duration:0.3}}
                  className="text-soft-white font-semibold text-base">{STEPS[stepIndex]}</motion.p>
              </AnimatePresence>
              <p className="text-muted-lavender text-xs">Please keep this tab open</p>
              <div className="flex items-center justify-center gap-2 pt-1">
                {STEPS.map((_,i) => (
                  <motion.div key={i} className="rounded-full bg-lilac"
                    animate={{width:i===stepIndex?20:6,opacity:i<=stepIndex?1:0.25}} transition={{duration:0.3}} style={{height:6}}/>
                ))}
              </div>
            </motion.div>
          )}
          {uiState === "success" && (
            <motion.div key="ok" initial={{opacity:0,y:6}} animate={{opacity:1,y:0}} className="space-y-1">
              <p className="text-soft-white font-semibold text-base">You&apos;re in!</p>
              <p className="text-muted-lavender text-sm">Redirecting you now…</p>
            </motion.div>
          )}
          {uiState === "error" && (
            <motion.div key="e" initial={{opacity:0,y:6}} animate={{opacity:1,y:0}} className="space-y-4 w-full">
              <div>
                <p className="text-soft-white font-semibold text-base mb-1">Sign-in failed</p>
                <p className="text-muted-lavender text-sm leading-relaxed max-w-xs mx-auto">
                  {errorMsg || "Please try signing in again."}
                </p>
              </div>
              <div className="flex flex-col gap-2 w-full max-w-xs mx-auto">
                <button onClick={() => router.push(`/auth?redirectTo=${encodeURIComponent(redirectPath)}`)}
                  className="flex items-center justify-center gap-2 h-11 rounded-xl bg-lilac text-deep-purple font-semibold text-sm hover:bg-lilac/90 transition-colors">
                  <Mail className="w-4 h-4"/> Try signing in again
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
  return <Suspense><VerifyingContent/></Suspense>;
}