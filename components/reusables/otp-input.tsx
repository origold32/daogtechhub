"use client";

import * as React from "react";
import {
  InputOTP,
  InputOTPGroup,
  InputOTPSlot,
} from "@/components/ui/input-otp";
import { cn } from "@/lib/utils";
import { InputInfo, InputInfoProps } from "@/components/ui/input";

export type InputOtpV1Props = InputInfoProps & {
  maxLength?: number;
  containerClassName?: string;
  value?: string;
  onChange?: (newValue: string) => unknown;
  onComplete?: (...args: any[]) => unknown;
  textAlign?: "left" | "center" | "right";
  inputMode?:
    | "numeric"
    | "text"
    | "decimal"
    | "tel"
    | "search"
    | "email"
    | "url";
  pushPasswordManagerStrategy?: "increase-width" | "none";
  noScriptCSSFallback?: string | null;
  rootClassName?: string;

  // ✅ Add disabled support
  disabled?: boolean;
};

export function InputOtpV1(properties: InputOtpV1Props) {
  const {
    maxLength = 6,
    rootClassName,
    warn,
    error,
    info,
    disabled = false,
    ...props
  } = properties;

  return (
    <div className={cn("space-y-2", rootClassName)}>
      <InputOTP
        required
        minLength={maxLength}
        autoFocus={false}
        maxLength={maxLength}
        disabled={disabled}
        onComplete={(args) => console.log("on complete", args)}
        {...props}
      >
        <InputOTPGroup>
          {Array(maxLength)
            .fill(0)
            .map((_, i) => (
              <InputOTPSlot
                key={i}
                index={i}
                className={cn(
                  error &&
                    "[--ring:var(--destructive)] [--input:var(--destructive)]",
                  warn && "[--ring:var(--warn)] [--input:var(--warn)]",
                )}
              />
            ))}
        </InputOTPGroup>
      </InputOTP>
      <InputInfo warn={warn} error={error} info={info} />
    </div>
  );
}
