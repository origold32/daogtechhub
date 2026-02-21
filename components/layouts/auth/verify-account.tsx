"use client";

import { useState } from "react";
import { Button } from "@/components/ui/button";
import useSWRMutation from "swr/mutation";
import { toast } from "sonner";
import CustomCountDown from "@/components/countdown-custom";
import TitleCaptionStatusInfo, {
  TitleCaptionStatusInfoProps,
} from "@/components/title-caption-status-info";
import { CalculatorIcon } from "lucide-react";
import { createRemoteMutationFetcher } from "@/swr";
import ReusableApiForm, {
  ReusableApiFormProps,
} from "@/components/reusable-api-form";
import { FormItem } from "@/components/form-builder";

type VerifyAccountProps = {
  reusableAuthFormProps?: Partial<ReusableApiFormProps>;
  email: string;
};

const VerifyAccount = ({
  email,
  reusableAuthFormProps,
}: VerifyAccountProps) => {
  const { trigger: resendOtp, isMutating: resending } = useSWRMutation(
    "/auth/otp-generate",
    createRemoteMutationFetcher("post"),
    {
      onSuccess: (data) => {
        toast.success(data.message);
        setCountdown(Date.now() + 0.2 * 60 * 1000);
      },
      onError: (err) => {
        toast.error(err.message);
      },
    }
  );
  const [showSuccess, setShowSuccess] = useState(false);
  const [countdown, setCountdown] = useState(Date.now() + 0.2 * 60 * 1000);
  const [canSubmitOtp, setCanSubmitOtp] = useState(false);
  const formItems: FormItem[] = [
    {
      name: "otp",
      type: "input-otp",
      inputOtpProps: {
        maxLength: 6,
        // error: "Hey error here",
        onChange: (val) => {
          val.length == 6 ? setCanSubmitOtp(true) : setCanSubmitOtp(false);
        },
      },
    },
  ];

  const canResendCode = countdown < Date.now();
  console.log("re render");

  return (
    <div>
      <ReusableApiForm
        submitUrl="/auth/otp-verify"
        title="Verify your account"
        caption={
          <span>
            We sent a verification code to{" "}
            <span className=" font-semibold">{email}</span> Kindly provide the
            code to continue
          </span>
        }
        formItems={formItems}
        formButtonText="Continue"
        loadingText="Verifying otp"
        formButtonProps={{
          title: canSubmitOtp ? "" : "Otp length is not valid",
          loadingText:
            reusableAuthFormProps?.formButtonProps?.loadingText ??
            "Verifying...",
        }}
        {...reusableAuthFormProps}
      />
      <Button
        loading={resending}
        loadingText="Resending otp"
        onClick={() => {
          resendOtp({ data: { verify: email } });
        }}
        disabled={!canResendCode}
        variant="ghost"
        className="mt-2 text-center text-sm text-primary w-full"
        rounded={"default"}
      >
        {canResendCode ? (
          <span>Resend code</span>
        ) : (
          <div>
            Resend code in:{" "}
            <CustomCountDown
              date={countdown}
              variant={"ms"}
              onComplete={() => setCountdown(0)}
              className=" font-semibold"
            />
          </div>
        )}
      </Button>
    </div>
  );
};

export default VerifyAccount;
