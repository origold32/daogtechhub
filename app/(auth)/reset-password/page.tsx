"use client";

import { useState, useEffect, Suspense } from "react";
import { motion, AnimatePresence } from "framer-motion";
import Link from "next/link";
import { useSearchParams } from "next/navigation";
import { toast } from "sonner";
import { Eye, EyeOff, Check, X, Loader2, Mail, Lock, CheckCircle2 } from "lucide-react";
import AppLogo from "@/components/reusables/app-logo";

const fade = {
  initial: { opacity: 0, y: 8 },
  animate: { opacity: 1, y: 0, transition: { duration: 0.2, ease: "easeOut" } },
  exit:    { opacity: 0, y: -8, transition: { duration: 0.14 } },
};

const RULES = [
  { label: "8+ chars",      test: (p: string) => p.length >= 8 },
  { label: "Uppercase A–Z", test: (p: string) => /[A-Z]/.test(p) },
  { label: "Number 0–9",    test: (p: string) => /[0-9]/.test(p) },
];

function Field({
  label, icon, error, right, ...props
}: React.InputHTMLAttributes<HTMLInputElement> & {
  label: string; icon?: React.ReactNode; error?: string; right?: React.ReactNode;
}) {
  return (
    <div className="space-y-1">
      <label className="block text-[11px] text-white/40 font-medium tracking-widest uppercase">{label}</label>
      <div className={`flex items-center gap-2 h-11 px-3 rounded-xl border transition-all ${
        error ? "border-red-500/50 bg-red-500/5" : "border-white/[0.08] bg-white/[0.04] focus-within:border-white/20"
      }`}>
        {icon && <span className="text-white/25 shrink-0">{icon}</span>}
        <input {...props} className="flex-1 bg-transparent text-sm text-white placeholder-white/20 outline-none min-w-0" />
        {right}
      </div>
      {error && <p className="text-[11px] text-red-400 pt-0.5">{error}</p>}
    </div>
  );
}

type Step = "request" | "sent" | "set-password" | "done";

function ResetForm() {
  const params = useSearchParams();
  const [step,     setStep]    = useState<Step>("request");
  const [email,    setEmail]   = useState("");
  const [password, setPassword] = useState("");
  const [confirm,  setConfirm]  = useState("");
  const [showPw,   setShowPw]   = useState(false);
  const [showPw2,  setShowPw2]  = useState(false);
  const [loading,  setLoading]  = useState(false);
  const [errors,   setErrors]   = useState<Record<string, string>>({});

  const allRulesPassed = RULES.every((r) => r.test(password));
  const pwMatch        = confirm.length > 0 ? confirm === password : null;

  // Supabase redirects to /reset-password?type=recovery after email link click
  useEffect(() => {
    if (params.get("type") === "recovery") setStep("set-password");
  }, [params]);

  // ── Step 1: request reset email ───────────────────────────────────────────
  async function handleRequest(e: React.FormEvent) {
    e.preventDefault();
    if (!email.trim()) { setErrors({ email: "Email is required" }); return; }
    if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) { setErrors({ email: "Enter a valid email" }); return; }
    setLoading(true);
    try {
      await fetch("/api/auth/reset-password", {
        method: "POST", headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email }),
      });
      setStep("sent"); // Always show "sent" — never reveal if account exists
    } catch {
      toast.error("Network error — try again.");
    } finally {
      setLoading(false);
    }
  }

  // ── Step 2: set new password ──────────────────────────────────────────────
  async function handleSetPassword(e: React.FormEvent) {
    e.preventDefault();
    const errs: Record<string, string> = {};
    if (!password)          errs.password = "Required";
    else if (!allRulesPassed) errs.password = "Password doesn't meet all requirements";
    if (!confirm)           errs.confirm  = "Required";
    else if (confirm !== password) errs.confirm = "Passwords don't match";
    if (Object.keys(errs).length) { setErrors(errs); return; }
    setLoading(true);
    try {
      const res  = await fetch("/api/auth/reset-password", {
        method: "PUT", headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ password }),
      });
      const json = await res.json();
      if (!json.success) { toast.error(json.error ?? "Failed to update password"); return; }
      setStep("done");
    } catch {
      toast.error("Network error — try again.");
    } finally {
      setLoading(false);
    }
  }

  return (
    <AnimatePresence mode="wait">
      {/* ── Request reset ─────────────────────────────────────────────────── */}
      {step === "request" && (
        <motion.div key="req" {...fade} className="space-y-5">
          <div className="flex justify-center"><AppLogo width={60} height={60} /></div>
          <div className="text-center space-y-1">
            <h1 className="text-white font-bold text-xl">Forgot your password?</h1>
            <p className="text-white/35 text-sm">Enter your email and we&apos;ll send a reset link.</p>
          </div>
          <form onSubmit={handleRequest} className="space-y-3" noValidate>
            <Field label="Email address" name="email" type="email" placeholder="you@example.com"
              autoComplete="email" value={email}
              onChange={(e) => { setEmail(e.target.value); setErrors({}); }}
              error={errors.email} icon={<Mail size={13} />} />
            <button type="submit" disabled={loading}
              className="w-full h-11 rounded-xl bg-[#d4a5ff] text-[#1a0b2e] font-bold text-sm hover:bg-[#c990ff] active:scale-[0.99] transition-all disabled:opacity-50 flex items-center justify-center gap-2">
              {loading ? <><Loader2 size={14} className="animate-spin" />Sending…</> : "Send reset link"}
            </button>
          </form>
          <div className="text-center">
            <Link href="/auth" className="text-[13px] text-white/25 hover:text-white/50 transition-colors">
              ← Back to sign in
            </Link>
          </div>
        </motion.div>
      )}

      {/* ── Link sent ─────────────────────────────────────────────────────── */}
      {step === "sent" && (
        <motion.div key="sent" {...fade} className="text-center space-y-5 py-2">
          <div className="flex justify-center">
            <div className="w-16 h-16 rounded-full bg-[#d4a5ff]/10 border border-[#d4a5ff]/20 flex items-center justify-center">
              <Mail className="w-7 h-7 text-[#d4a5ff]" strokeWidth={1.5} />
            </div>
          </div>
          <div className="space-y-2">
            <h2 className="text-white font-bold text-xl">Check your inbox</h2>
            <p className="text-white/40 text-sm leading-relaxed max-w-[280px] mx-auto">
              If an account exists for{" "}
              <span className="text-white/70 font-medium">{email}</span>,
              you&apos;ll receive a reset link shortly.
            </p>
          </div>
          <p className="text-white/20 text-xs">
            Didn&apos;t get it?{" "}
            <button onClick={() => setStep("request")} className="text-[#d4a5ff]/50 hover:text-[#d4a5ff] underline underline-offset-2 transition-colors">
              Try again
            </button>
          </p>
          <Link href="/auth" className="block text-xs text-white/20 hover:text-white/45 transition-colors pt-1">
            ← Back to sign in
          </Link>
        </motion.div>
      )}

      {/* ── Set new password ──────────────────────────────────────────────── */}
      {step === "set-password" && (
        <motion.div key="set-pw" {...fade} className="space-y-5">
          <div className="flex justify-center"><AppLogo width={60} height={60} /></div>
          <div className="text-center space-y-1">
            <h1 className="text-white font-bold text-xl">Set new password</h1>
            <p className="text-white/35 text-sm">Choose a strong password for your account.</p>
          </div>
          <form onSubmit={handleSetPassword} className="space-y-3" noValidate>
            <div className="space-y-1.5">
              <Field label="New password" name="password" type={showPw ? "text" : "password"}
                placeholder="Min. 8 characters" autoComplete="new-password"
                value={password} onChange={(e) => { setPassword(e.target.value); setErrors((x) => ({ ...x, password: "" })); }}
                error={errors.password} icon={<Lock size={13} />}
                right={
                  <button type="button" onClick={() => setShowPw((v) => !v)} tabIndex={-1}
                    className="text-white/20 hover:text-white/50 transition-colors shrink-0">
                    {showPw ? <EyeOff size={13} /> : <Eye size={13} />}
                  </button>
                } />
              {password && (
                <div className="grid grid-cols-3 gap-1 pt-0.5">
                  {RULES.map((r) => {
                    const ok = r.test(password);
                    return (
                      <div key={r.label} className={`flex items-center gap-1 text-[10px] transition-colors ${ok ? "text-green-400/90" : "text-white/25"}`}>
                        {ok ? <Check size={9} /> : <X size={9} />}
                        <span>{r.label}</span>
                      </div>
                    );
                  })}
                </div>
              )}
            </div>

            <Field label="Confirm password" name="confirm" type={showPw2 ? "text" : "password"}
              placeholder="Repeat password" autoComplete="new-password"
              value={confirm} onChange={(e) => { setConfirm(e.target.value); setErrors((x) => ({ ...x, confirm: "" })); }}
              error={errors.confirm} icon={<Lock size={13} />}
              right={
                <div className="flex items-center gap-2 shrink-0">
                  {pwMatch !== null && (pwMatch ? <Check size={12} className="text-green-400" /> : <X size={12} className="text-red-400" />)}
                  <button type="button" onClick={() => setShowPw2((v) => !v)} tabIndex={-1}
                    className="text-white/20 hover:text-white/50 transition-colors">
                    {showPw2 ? <EyeOff size={13} /> : <Eye size={13} />}
                  </button>
                </div>
              } />

            <button type="submit" disabled={loading}
              className="w-full h-11 rounded-xl bg-[#d4a5ff] text-[#1a0b2e] font-bold text-sm hover:bg-[#c990ff] active:scale-[0.99] transition-all disabled:opacity-50 flex items-center justify-center gap-2 mt-1">
              {loading ? <><Loader2 size={14} className="animate-spin" />Updating…</> : "Update password"}
            </button>
          </form>
        </motion.div>
      )}

      {/* ── Done ─────────────────────────────────────────────────────────── */}
      {step === "done" && (
        <motion.div key="done" {...fade} className="text-center space-y-5 py-4">
          <CheckCircle2 className="w-14 h-14 text-green-400 mx-auto" strokeWidth={1.5} />
          <div className="space-y-1">
            <h2 className="text-white font-bold text-xl">Password updated</h2>
            <p className="text-white/40 text-sm">Your password has been changed successfully.</p>
          </div>
          <Link href="/auth"
            className="block w-full h-11 rounded-xl bg-[#d4a5ff] text-[#1a0b2e] font-bold text-sm hover:bg-[#c990ff] transition-all flex items-center justify-center">
            Sign in with new password
          </Link>
        </motion.div>
      )}
    </AnimatePresence>
  );
}

export default function ResetPasswordPage() {
  return (
    <Suspense fallback={
      <div className="flex justify-center py-16">
        <Loader2 className="w-5 h-5 text-[#d4a5ff]/50 animate-spin" />
      </div>
    }>
      <ResetForm />
    </Suspense>
  );
}
