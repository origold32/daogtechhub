// components/layouts/auth/verify-account.tsx
// OTP entry component — used for both email 6-digit codes and SMS codes.
"use client";

import { useState, useEffect, useRef } from "react";
import { toast } from "sonner";
import CustomCountDown from "@/components/reusables/countdown-custom";
import { InputOtpV1 } from "@/components/reusables/otp-input";
import { cn } from "@/lib/utils";
import { Value } from "react-phone-number-input";
import { Loader2, RefreshCw, AlertCircle } from "lucide-react";

type VerifyAccountProps = {
  identifier:  string | Value;
  onSuccess?:  (data: any) => void;
  onVerify:    (otp: string) => Promise<{ success: boolean; error?: string }>;
  onResend:    ()            => Promise<{ success: boolean; error?: string }>;
};

const VerifyAccount = ({ identifier, onSuccess, onVerify, onResend }: VerifyAccountProps) => {
  const [otpValue,   setOtpValue]   = useState("");
  const [countdown,  setCountdown]  = useState(Date.now() + 2 * 60 * 1000);
  const [otpWrong,   setOtpWrong]   = useState(false);
  const [verifying,  setVerifying]  = useState(false);
  const [resending,  setResending]  = useState(false);
  const [errorMsg,   setErrorMsg]   = useState<string | null>(null);
  const [attempts,   setAttempts]   = useState(0);
  const verifyingRef = useRef(false); // prevent double-fire on StrictMode

  const canResend = countdown < Date.now();

  // Auto-submit when 6 digits entered
  const handleOtpChange = async (val: string) => {
    setOtpValue(val);
    setErrorMsg(null);

    if (val.length === 6 && !verifyingRef.current) {
      verifyingRef.current = true;
      setVerifying(true);

      const result = await onVerify(val);

      setVerifying(false);
      verifyingRef.current = false;

      if (!result.success) {
        const msg = result.error ?? "Incorrect code — please try again.";
        setErrorMsg(msg);
        setOtpWrong(true);
        setAttempts((n) => n + 1);
        setTimeout(() => setOtpWrong(false), 500);
        setOtpValue("");
      } else {
        toast.success("Verified! Welcome to DAOG Tech Hub.", { duration: 3000 });
        onSuccess?.(result);
      }
    }
  };

  const handleResend = async () => {
    setResending(true);
    setErrorMsg(null);
    const result = await onResend();
    setResending(false);

    if (result.success) {
      toast.success(`New code sent to ${String(identifier)}`);
      setCountdown(Date.now() + 2 * 60 * 1000);
      setOtpValue("");
      setAttempts(0);
    } else {
      setErrorMsg(result.error ?? "Failed to resend code. Please try again.");
    }
  };

  return (
    <div className="space-y-4 w-full">
      <p className="text-center text-sm text-white/40">
        Enter the 6-digit code sent to{" "}
        <span className="font-semibold text-white/70 break-all">{String(identifier)}</span>
      </p>

      {/* OTP input */}
      <div className={cn("transition-all duration-200", otpWrong && "animate-shake")}>
        <InputOtpV1
          value={otpValue}
          onChange={handleOtpChange}
          maxLength={6}
          disabled={verifying || resending}
          className={cn(
            "transition-all",
            otpWrong ? "border-red-500/50" : ""
          )}
        />
      </div>

      {/* Loading indicator */}
      {verifying && (
        <div className="flex items-center justify-center gap-2">
          <Loader2 size={13} className="animate-spin text-lilac/60" />
          <p className="text-center text-xs text-white/40">Verifying…</p>
        </div>
      )}

      {/* Inline error */}
      {errorMsg && (
        <div className="flex items-start gap-2 px-3 py-2.5 rounded-xl bg-red-500/[0.08] border border-red-500/20">
          <AlertCircle size={13} className="text-red-400 shrink-0 mt-0.5" />
          <p className="text-red-300/90 text-xs leading-relaxed">{errorMsg}</p>
        </div>
      )}

      {/* Too many attempts hint */}
      {attempts >= 3 && (
        <p className="text-center text-[11px] text-white/25 leading-relaxed">
          Having trouble? Check your spam folder, or go back and try a different method.
        </p>
      )}

      {/* Resend button */}
      <button
        onClick={handleResend}
        disabled={!canResend || resending || verifying}
        className="w-full flex items-center justify-center gap-2 mt-1 text-sm text-white/35 hover:text-white/60 disabled:opacity-40 disabled:cursor-not-allowed transition-colors"
      >
        {resending ? (
          <><Loader2 size={13} className="animate-spin" />Resending…</>
        ) : canResend ? (
          <><RefreshCw size={12} />Resend code</>
        ) : (
          <span className="text-xs">
            Resend in{" "}
            <CustomCountDown
              date={countdown}
              variant="ms"
              onComplete={() => setCountdown(0)}
              className="font-semibold text-white/50"
            />
          </span>
        )}
      </button>

      <style jsx>{`
        @keyframes shake {
          0%, 100% { transform: translateX(0); }
          20%, 60% { transform: translateX(-8px); }
          40%, 80% { transform: translateX(8px); }
        }
        .animate-shake { animation: shake 0.45s ease-in-out; }
      `}</style>
    </div>
  );
};

export default VerifyAccount;
