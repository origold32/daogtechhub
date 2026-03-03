"use client";

import { useState } from "react";
import { Button } from "@/components/ui/button";
import useSWRMutation from "swr/mutation";
import { toast } from "sonner";
import CustomCountDown from "@/components/reusables/countdown-custom";
import { createRemoteMutationFetcher } from "@/swr";
import { InputOtpV1 } from "@/components/reusables/otp-input";
import { cn } from "@/lib/utils";
import { Value } from "react-phone-number-input";
import type { User } from "@/store/authStore";

// ---------------------------------------------------------------------------
// 🧪 MOCK — remove this entire block when the API is ready
// ---------------------------------------------------------------------------
const MOCK_OTP = "123456";
const MOCK_DELAY_MS = 900;

function buildMockUser(
  identifier: string | Value,
  isExistingUser: boolean,
): User {
  if (isExistingUser) {
    return {
      id: "usr_001",
      firstName: "John",
      lastName: "Doe",
      email: String(identifier),
      role: "customer",
    };
  }
  return {
    id: `usr_${Date.now()}`,
    firstName: "New",
    lastName: "User",
    email: String(identifier),
    role: "customer",
  };
}
// ---------------------------------------------------------------------------

type VerifyAccountProps = {
  identifier: string | Value;
  isExistingUser?: boolean; // 🧪 MOCK only — remove when API returns user data
  onSuccess?: (data: any) => void;
};

const VerifyAccount = ({
  identifier,
  isExistingUser = false,
  onSuccess,
}: VerifyAccountProps) => {
  const [otpValue, setOtpValue] = useState("");
  const [countdown, setCountdown] = useState(Date.now() + 0.2 * 60 * 1000);
  const [otpWrong, setOtpWrong] = useState(false);

  // ---------------------------------------------------------------------------
  // 🧪 MOCK state — remove when using real SWR mutations below
  // ---------------------------------------------------------------------------
  const [verifying, setVerifying] = useState(false);
  const [resending, setResending] = useState(false);
  // ---------------------------------------------------------------------------

  // ---------------------------------------------------------------------------
  // ✅ REAL — uncomment these and remove the mock handlers below when API is ready
  //
  // const { trigger: verifyOtpApi, isMutating: verifying } = useSWRMutation(
  //   "/auth/otp-verify",
  //   createRemoteMutationFetcher("post"),
  //   {
  //     onSuccess: (data) => {
  //       toast.success(data.message);
  //       onSuccess?.(data); // data should include the user object
  //     },
  //     onError: (err: any) => {
  //       toast.error(err.message);
  //       setOtpWrong(true);
  //       setTimeout(() => setOtpWrong(false), 400);
  //     },
  //   },
  // );
  //
  // const { trigger: resendOtpApi, isMutating: resending } = useSWRMutation(
  //   "/auth/otp-generate",
  //   createRemoteMutationFetcher("post"),
  //   {
  //     onSuccess: (data) => {
  //       toast.success(data.message);
  //       setCountdown(Date.now() + 0.2 * 60 * 1000);
  //     },
  //     onError: (err: any) => toast.error(err.message),
  //   },
  // );
  // ---------------------------------------------------------------------------

  // ---------------------------------------------------------------------------
  // 🧪 MOCK handlers — replace with API calls above when backend is ready
  // ---------------------------------------------------------------------------
  const verifyOtpMock = async (otp: string) => {
    setVerifying(true);
    await new Promise((r) => setTimeout(r, MOCK_DELAY_MS));
    if (otp === MOCK_OTP) {
      toast.success("OTP verified!");
      onSuccess?.(buildMockUser(identifier, isExistingUser));
    } else {
      toast.error("Incorrect OTP. Try again.");
      setOtpWrong(true);
      setTimeout(() => setOtpWrong(false), 400);
      setOtpValue("");
    }
    setVerifying(false);
  };

  const resendOtpMock = async () => {
    setResending(true);
    await new Promise((r) => setTimeout(r, 600));
    toast.success(`OTP resent to ${String(identifier)}`);
    setCountdown(Date.now() + 0.2 * 60 * 1000);
    setResending(false);
  };
  // ---------------------------------------------------------------------------

  const canResendCode = countdown < Date.now();

  const handleOtpChange = (val: string) => {
    setOtpValue(val);
    if (val.length === 6 && !verifying) {
      // 🧪 MOCK: verifyOtpMock(val)
      // ✅ REAL: verifyOtpApi({ data: { otp: val, identifier } })
      verifyOtpMock(val);
    }
  };

  return (
    <div className="space-y-4 w-full">
      {/* 🧪 MOCK hint — remove before production */}
      <p className="text-center text-xs text-yellow-400/70 bg-yellow-400/10 rounded px-3 py-1">
        🧪 Mock mode — use OTP <strong>{MOCK_OTP}</strong> to verify
      </p>

      <p className="text-center text-sm text-muted-lavender">
        We sent a verification code to{" "}
        <span className="font-semibold">{identifier}</span>. Kindly provide the
        code to continue
      </p>

      <InputOtpV1
        value={otpValue}
        onChange={handleOtpChange}
        maxLength={6}
        disabled={verifying}
        className={cn("transition-all", otpWrong && "shake border-destructive")}
      />

      {verifying && (
        <p className="text-center text-sm text-muted-lavender animate-pulse">
          Verifying OTP…
        </p>
      )}

      <Button
        loading={resending}
        loadingText="Resending OTP"
        onClick={() => {
          // 🧪 MOCK: resendOtpMock()
          // ✅ REAL: resendOtpApi({ data: { verify: identifier } })
          resendOtpMock();
        }}
        disabled={!canResendCode}
        variant="ghost"
        className="mt-2 text-center text-sm text-primary w-full hover:bg-transparent hover:text-muted-foreground disabled:cursor-not-allowed disabled:text-muted-lavender"
        rounded={"default"}
      >
        {canResendCode ? (
          <span>Resend code</span>
        ) : (
          <div>
            Resend code in:{" "}
            <CustomCountDown
              date={countdown}
              variant="ms"
              onComplete={() => setCountdown(0)}
              className="font-semibold"
            />
          </div>
        )}
      </Button>

      {/* Shake animation CSS */}
      <style jsx>{`
        @keyframes shake {
          0%,
          100% {
            transform: translateX(0);
          }
          20%,
          60% {
            transform: translateX(-8px);
          }
          40%,
          80% {
            transform: translateX(8px);
          }
        }
        .shake {
          animation: shake 0.4s ease-in-out;
        }
      `}</style>
    </div>
  );
};

export default VerifyAccount;
