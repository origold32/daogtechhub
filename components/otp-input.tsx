"use client";

import * as React from "react";

import { InputOTP, InputOTPGroup, InputOTPSlot } from "@/components/ui/input-otp";
import { cn } from "@/lib/utils";
import { InputInfo, InputInfoProps } from "@/components/ui/input";

export type InputOtpV1Props = InputInfoProps & {
  // The number of slots
  maxLength?: number;

  // The class name for the root container
  containerClassName?: string;

  // Value state controlling the input
  value?: string;
  // Setter for the controlled value (or callback for uncontrolled value)
  onChange?: (newValue: string) => unknown;

  // Callback when the input is complete
  onComplete?: (...args: any[]) => unknown;

  // Where is the text located within the input
  // Affects click-holding or long-press behavior
  // Default: 'left'
  textAlign?: "left" | "center" | "right";

  // Virtual keyboard appearance on mobile
  // Default: 'numeric'
  inputMode?: "numeric" | "text" | "decimal" | "tel" | "search" | "email" | "url";

  // Enabled by default, it's an optional
  // strategy for detecting Password Managers
  // in the page and then shifting their
  // badges to the right side, outside the input.
  pushPasswordManagerStrategy?: "increase-width" | "none";

  noScriptCSSFallback?: string | null;

  rootClassName?: string;
};

export function InputOtpV1(properties: InputOtpV1Props) {
  const { maxLength = 6, rootClassName, warn, error, info, ...props } = properties;
  return (
    <div className={cn("space-y-2", rootClassName)}>
      <InputOTP required={true} minLength={maxLength} autoFocus={false} maxLength={maxLength} onComplete={(args) => console.log("on complete", args)} {...props}>
        <InputOTPGroup>
          {Array(maxLength)
            .fill(0)
            .map((el, i) => {
              return <InputOTPSlot key={i} index={i} className={cn(error && "[--ring:var(--destructive)] [--input:var(--destructive)]", warn && "[--ring:var(--warn)] [--input:var(--warn)]")} />;
            })}
        </InputOTPGroup>
      </InputOTP>
      <InputInfo warn={warn} error={error} info={info} />
    </div>
  );
}
