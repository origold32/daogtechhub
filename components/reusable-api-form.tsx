"use client";

import React, { ReactNode } from "react";
import useSWRMutation from "swr/mutation";
import { toast } from "sonner";
import { createRemoteMutationFetcher } from "@/swr";
import GoBack, { GoBackProps } from "@/components/go-back";
import { TitleCaptionProps } from "@/components/title-caption";
import { useRouter } from "next/navigation";
import FormBuilder, { FormBuilderProps } from "./form-builder";
import AuthTitleCaption from "./layouts/auth/_auth-title-caption";

export interface RAFsubmitHookResponse {
  passed: boolean;
  extraData?: Record<string, any>;
}

export interface ReusableApiFormProps
  extends Omit<FormBuilderProps, "onSubmit"> {
  title?: ReactNode;
  caption?: ReactNode;
  titleCaptionProps?: Partial<TitleCaptionProps>;
  submitUrl: string;
  apiActionType?: "post" | "patch" | "put";
  redirectUrlonSuccess?: string;
  onSuccess?: (respData: any) => void;
  shouldToast?: boolean;
  disabled?: boolean;
  // this taps into the flow of on submit before auth request is made
  // return true if should proceed or false otherwise
  // not compulsory, but used in the signup page
  onSubmitHook?: (
    formData: any
  ) => Promise<RAFsubmitHookResponse> | RAFsubmitHookResponse;
  goBackProps?: GoBackProps;
  extraSubmitData?: Record<string, any>;
}

const ReusableApiForm = ({
  title,
  caption,
  submitUrl,
  apiActionType = "post",
  redirectUrlonSuccess,
  onSuccess,
  shouldToast = true,
  onSubmitHook,
  goBackProps,
  extraSubmitData,
  titleCaptionProps,
  ...props
}: ReusableApiFormProps) => {
  const router = useRouter();
  const { trigger, isMutating: loading } = useSWRMutation(
    submitUrl,
    createRemoteMutationFetcher(apiActionType),
    {
      onSuccess: (data) => {
        onSuccess && onSuccess(data);
        shouldToast && toast.success(data.message);
        redirectUrlonSuccess && router.replace(redirectUrlonSuccess);
      },
      onError: () => {
        toast.error("Uh oh! Something went wrong.");
      },
    }
  );
  
  return (
    <div>
      {goBackProps ? <GoBack className="mb-10" {...goBackProps} /> : null}
      {caption || title ? (
        <AuthTitleCaption
          className="mb-6"
          title={title}
          caption={caption}
          {...titleCaptionProps}
        />
      ) : null}
      <FormBuilder
        // Pass the external loading state to FormBuilder
        externalLoading={loading}
        onSubmit={async (data: Record<string, any>) => {
          let payload: any = { ...data, ...extraSubmitData };

          if (onSubmitHook) {
            const resp = await onSubmitHook(data);
            if (!resp.passed) return;
            payload = resp.extraData ?? payload;
          }

          const hasFile = Object.values(payload).some(
            (val) => val instanceof File || val instanceof Blob
          );

          if (hasFile) {
            const formData = new FormData();
            Object.entries(payload).forEach(([key, val]) => {
              if (Array.isArray(val)) {
                val.forEach((v) => {
                  if (v instanceof File || v instanceof Blob) {
                    formData.append(`${key}[]`, v);
                  } else {
                    formData.append(`${key}[]`, String(v));
                  }
                });
              } else if (val instanceof File || val instanceof Blob) {
                formData.append(key, val);
              } else if (typeof val !== "undefined" && val !== null) {
                formData.append(key, String(val));
              }
            });

            trigger(formData);
          } else {
            trigger(payload);
          }
        }}
        {...props}
      />
    </div>
  );
};

export default ReusableApiForm;