/* eslint-disable react-hooks/exhaustive-deps */
"use client";

import InputCurrencyAmountV1, {
  InputCurrencyAmountV1Props,
} from "@/components/input-currency-v1";
import InputDatev1, { InputDatev1Props } from "@/components/input-date-v1";
import InputPasswordV1 from "@/components/input-password-1";
import InputPhone5, { InputPhone5Props } from "@/components/input-phone-5";
import InputSelectV1, {
  InputSelectV1Props,
} from "@/components/input-select-v1";
import InputV1, { InputV1Props } from "@/components/input-v1";
import { Button, ButtonProps } from "@/components/ui/button";
import { cn } from "@/lib/utils";
import * as React from "react";
import { InputOtpV1, InputOtpV1Props } from "./otp-input";
import TextAreaV1, { TextAreaV1Props } from "./text-area-v1";
import Loader1 from "./loaders/loader-1";

export interface FormItem {
  name: string;
  type:
    | "input"
    | "input-textarea"
    | "input-date"
    | "input-currency"
    | "password"
    | "input-phone"
    | "input-otp"
    | "split"
    | "select"
    | "profile"
    | "custom";
  inputProps?: InputV1Props;
  inputTextAreaProps?: TextAreaV1Props;
  inputPhoneProps?: InputPhone5Props;
  inputDateV2Props?: InputDatev1Props;
  inputCurrencyAmountV1Props?: InputCurrencyAmountV1Props;
  inputOtpProps?: InputOtpV1Props;
  selectProps?: InputSelectV1Props;
  otherProps?: Record<string, any>;
  customContent?: React.ReactNode;
  split?: {
    firstCol: FormItem;
    secondCol: FormItem;
  };
}

export interface FormBuilderProps {
  formItems: FormItem[];
  onSubmit?: (data: Record<string, any>) => void;
  onCancel?: () => void;
  onItemChange?: (name: string, value: any) => void;
  formButtonText?: string;
  loadingText?: string;
  formButtonProps?: ButtonProps;
  externalLoading?: boolean; // Add this prop
}

const FormBuilder: React.FC<FormBuilderProps> = ({
  formItems,
  onSubmit,
  formButtonText,
  loadingText,
  onItemChange,
  onCancel,
  formButtonProps,
  externalLoading = false, // Add this prop with default value
}) => {
  const [internalData, setInternalData] = React.useState<Record<string, any>>(
    {}
  );
  const [isSubmitting, setIsSubmitting] = React.useState(false);

  // Use external loading state if provided, otherwise use internal state
  const isLoading = externalLoading || isSubmitting;

  const handleSubmit = async (event: React.FormEvent) => {
    event.preventDefault();
    setIsSubmitting(true);
    try {
      const formValues: Record<string, any> = {};
      const formData = new FormData(event.target as HTMLFormElement);
      formData.forEach((value, key) => {
        formValues[key] = value;
      });
      await onSubmit?.({ ...internalData, ...formValues });
    } finally {
      // Only reset internal loading if not using external loading
      if (!externalLoading) {
        setIsSubmitting(false);
      } else {
        setIsSubmitting(false);
      }
    }
  };

  const onFormItemChange = (name: string, value: any) => {
    setInternalData((val) => ({ ...val, [name]: value }));
    onItemChange && onItemChange(name, value);
  };

  React.useEffect(() => {
    // console.log("form items change", internalData);
  }, [formItems]);

  return (
    <form onSubmit={handleSubmit} className="grid">
      {formItems.map(
        ({
          name,
          type,
          inputProps,
          inputTextAreaProps,
          inputPhoneProps,
          inputDateV2Props,
          inputCurrencyAmountV1Props,
          inputOtpProps,
          selectProps,
          otherProps,
          customContent,
          split,
        }) => {
          if (type == "input" && inputProps) {
            return (
              <div key={name}>
                <InputV1
                  name={name}
                  {...inputProps}
                  rootClassName={cn("mb-6", inputProps?.rootClassName)}
                  {...otherProps}
                  onChange={(e) => {
                    inputProps.onChange && inputProps.onChange(e);
                    onFormItemChange(e.target.name, e.target.value);
                  }}
                />
              </div>
            );
          }
          if (type == "input-textarea" && inputTextAreaProps) {
            return (
              <div key={name}>
                <TextAreaV1
                  name={name}
                  {...inputTextAreaProps}
                  rootClassName={cn("mb-6", inputTextAreaProps?.rootClassName)}
                  {...otherProps}
                  onChange={(e) => {
                    inputTextAreaProps.onChange &&
                      inputTextAreaProps.onChange(e);
                    onFormItemChange(e.target.name, e.target.value);
                  }}
                />
              </div>
            );
          }
          if (type == "input-date" && inputDateV2Props) {
            return (
              <div key={name}>
                <InputDatev1
                  name={name}
                  {...inputDateV2Props}
                  rootClassName={cn("mb-6", inputDateV2Props?.rootClassName)}
                  {...otherProps}
                  onChange={(e) => {
                    inputDateV2Props.onChange && inputDateV2Props.onChange(e);
                    onFormItemChange(e.target.name, e.target.value);
                  }}
                />
              </div>
            );
          }
          if (type == "input-currency" && inputCurrencyAmountV1Props) {
            return (
              <div key={name}>
                <InputCurrencyAmountV1
                  name={name}
                  {...inputCurrencyAmountV1Props}
                  rootClassName={cn(
                    "mb-6",
                    inputCurrencyAmountV1Props?.rootClassName
                  )}
                  {...otherProps}
                  onChange={(e) => {
                    inputCurrencyAmountV1Props.onChange &&
                      inputCurrencyAmountV1Props.onChange(e);
                    onFormItemChange(e.target.name, e.target.value);
                  }}
                />
              </div>
            );
          }
          if (type == "password" && inputProps) {
            return (
              <div key={name}>
                <InputPasswordV1
                  name={name}
                  {...inputProps}
                  rootClassName={cn("mb-6", inputProps?.rootClassName)}
                  {...otherProps}
                  onChange={(e) => {
                    inputProps.onChange && inputProps.onChange(e);
                    onFormItemChange(e.target.name, e.target.value);
                  }}
                />
              </div>
            );
          }

          if (type == "select" && selectProps) {
            return (
              <div key={name}>
                <InputSelectV1
                  name={name}
                  {...selectProps}
                  rootClassName={cn("mb-6", selectProps.rootClassName)}
                  {...otherProps}
                  onChange={(e) => {
                    selectProps.onChange && selectProps.onChange(e);
                    onFormItemChange(e.target.name, e.target.value);
                  }}
                />
              </div>
            );
          }

          if (type == "input-phone" && inputPhoneProps) {
            return (
              <div key={name}>
                <InputPhone5
                  name={name}
                  {...inputPhoneProps}
                  rootClassName={cn("mb-6", inputPhoneProps?.rootClassName)}
                  {...otherProps}
                  onChange={(value) => {
                    inputPhoneProps.onChange && inputPhoneProps.onChange(value);
                    onFormItemChange(name, value);
                    // console.log("phone change,,,dd", value);
                  }}
                />
              </div>
            );
          }
          if (type == "input-otp" && inputOtpProps) {
            return (
              <div key={name}>
                <InputOtpV1
                  {...inputOtpProps}
                  rootClassName={cn("mb-6", inputOtpProps.rootClassName)}
                  onComplete={(value) => onFormItemChange(name, value)}
                />
              </div>
            );
          }
          if (type == "custom" && customContent) {
            return (
              <div
                key={name}
                {...otherProps}
                className={cn("mb-6", otherProps?.className)}
              >
                {customContent}
              </div>
            );
          }

          if (type == "split" && split) {
            return (
              <div
                className={cn(
                  "mb-6 grid grid-cols-2 gap-4",
                  otherProps?.className
                )}
                key={name}
              >
                {split.firstCol.type == "input" && split.firstCol.inputProps ? (
                  <InputV1
                    name={split.firstCol.name}
                    {...split.firstCol.inputProps}
                    {...split.firstCol.otherProps}
                    onChange={(e) => {
                      split.firstCol?.inputProps?.onChange &&
                        split.firstCol?.inputProps?.onChange(e);
                      onFormItemChange(e.target.name, e.target.value);
                    }}
                  />
                ) : null}
                {split.secondCol.type == "input" &&
                split.secondCol.inputProps ? (
                  <InputV1
                    name={split.secondCol.name}
                    {...split.secondCol.inputProps}
                    {...split.secondCol.otherProps}
                    onChange={(e) => {
                      split.secondCol?.inputProps?.onChange &&
                        split.secondCol?.inputProps?.onChange(e);
                      onFormItemChange(e.target.name, e.target.value);
                    }}
                  />
                ) : null}
                {split.firstCol.type == "input-date" &&
                split.firstCol.inputDateV2Props ? (
                  <InputDatev1
                    name={split.firstCol.name}
                    {...split.firstCol.inputDateV2Props}
                    {...split.firstCol.otherProps}
                    onChange={(e) => {
                      split.firstCol?.inputDateV2Props?.onChange &&
                        split.firstCol?.inputDateV2Props?.onChange(e);
                      onFormItemChange(e.target.name, e.target.value);
                    }}
                  />
                ) : null}
                {split.secondCol.type == "input-date" &&
                split.secondCol.inputDateV2Props ? (
                  <InputDatev1
                    name={split.secondCol.name}
                    {...split.secondCol.inputDateV2Props}
                    {...split.secondCol.otherProps}
                    onChange={(e) => {
                      split.secondCol?.inputDateV2Props?.onChange &&
                        split.secondCol?.inputDateV2Props?.onChange(e);
                      onFormItemChange(e.target.name, e.target.value);
                    }}
                  />
                ) : null}
                {split.firstCol.type == "select" &&
                split.firstCol.selectProps ? (
                  <InputSelectV1
                    name={split.firstCol.name}
                    {...split.firstCol.selectProps}
                    {...split.firstCol.otherProps}
                    onChange={(e) => {
                      split.firstCol?.selectProps?.onChange &&
                        split.firstCol?.selectProps?.onChange(e);
                      onFormItemChange(e.target.name, e.target.value);
                    }}
                  />
                ) : null}
                {split.secondCol.type == "select" &&
                split.secondCol.selectProps ? (
                  <InputSelectV1
                    name={split.secondCol.name}
                    {...split.secondCol.selectProps}
                    {...split.secondCol.otherProps}
                    onChange={(e) => {
                      split.secondCol?.selectProps?.onChange &&
                        split.secondCol?.selectProps?.onChange(e);
                      onFormItemChange(e.target.name, e.target.value);
                    }}
                  />
                ) : null}
                {split.firstCol.type == "custom" && split.firstCol.customContent
                  ? split.firstCol.customContent
                  : null}
                {split.secondCol.type == "custom" &&
                split.secondCol.customContent
                  ? split.secondCol.customContent
                  : null}
              </div>
            );
          }
        }
      )}
      <div className="flex gap-4 mt-2">
        {onCancel && (
          <Button
            className="flex-1"
            type="button"
            variant={"outline"}
            rounded={"md"}
            onClick={onCancel}
            disabled={isLoading} // Disable cancel button during loading
          >
            Cancel
          </Button>
        )}
        <Button
          type="submit"
          className="w-full sm:h-11 flex-1 bg-gradient-to-r from-[#1B75BC] to-[#29ABE2] text-white"
          rounded={"md"}
          disabled={isLoading} // Disable submit button during loading
          {...formButtonProps}
        >
          {isLoading ? (
            <div className="flex items-center justify-center gap-2">
              {loadingText ?? "Submitting"}
              <Loader1 />
            </div>
          ) : (
            formButtonText ?? "Submit"
          )}
        </Button>
      </div>
    </form>
  );
};

export default FormBuilder;
