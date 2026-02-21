"use client";
import * as React from "react";

import { cn } from "@/lib/utils";
import { InputInfo, InputInfoProps } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "./ui/textarea";
import {
  inputActive,
  inputFocusLabelClassName,
  inputPlaceholdernotshownLabelClassName,
} from "./input-v1";

export interface TextAreaV1Props
  extends React.TextareaHTMLAttributes<HTMLTextAreaElement>,
    React.ComponentPropsWithRef<"textarea">,
    InputInfoProps {
  label?: string | React.ReactNode;
  labelClassName?: string;
  requiredStar?: boolean;
  leftIcon?: React.ReactNode;
  rightIcon?: React.ReactNode;
  rootClassName?: string;
  defaultValue?: string | number | readonly string[];
  wordLimit?: number;
}

const TextAreaV1 = React.forwardRef<HTMLTextAreaElement, TextAreaV1Props>(
  (
    {
      label,
      labelClassName,
      requiredStar,
      className,
      rootClassName,
      error,
      warn,
      info,
      defaultValue,
      onChange,
      leftIcon,
      rightIcon,
      children,
      value: controlledValue,
      wordLimit,
      ...props
    },
    ref
  ) => {
    const id = React.useId();
    const [internalValue, setInternalValue] = React.useState<
      string | number | readonly string[]
    >("");

    const isControlled = controlledValue !== undefined;
    const inputValue = isControlled ? controlledValue : internalValue;

    const wordCount = String(inputValue)
      .trim()
      .split(/\s+/)
      .filter(Boolean).length;
    const remainingWords = wordLimit ? wordLimit - wordCount : undefined;
    const showWarning =
      typeof remainingWords === "number" &&
      remainingWords <= 10 &&
      remainingWords > 0;
    const showError = typeof remainingWords === "number" && remainingWords < 0;

    const onInputChange = (e: React.ChangeEvent<HTMLTextAreaElement>) => {
      const value = e.target.value;
      const words = value.trim().split(/\s+/).filter(Boolean);

      // Blocking input if over word limit
      if (wordLimit && words.length > wordLimit) return;

      if (!isControlled) {
        setInternalValue(value);
      }

      onChange && onChange(e);
    };

    React.useEffect(() => {
      if (!isControlled && defaultValue !== undefined) {
        setInternalValue(defaultValue);
      }
    }, [defaultValue, isControlled]);

    return (
      <div className={cn("w-full", rootClassName)}>
        <div className="relative">
          <Textarea
            className={cn(
              "peer placeholder:opacity-0 focus-visible:placeholder:opacity-100 focus-visible:placeholder:visible transition placeholder-shown:text-ellipsis",
              className,
              (error || warn) && " border-2",
              error &&
                "[--ring:var(--destructive)] ring-destructive border-destructive",
              warn && "[--ring:var(--warn)] ring-warn border-warn",
              rightIcon && "pr-10",
              leftIcon && "pl-12"
            )}
            ref={ref}
            id={id}
            value={inputValue}
            defaultValue={isControlled ? undefined : defaultValue}
            onChange={onInputChange}
            {...props}
          />

          <Label
            htmlFor={id}
            className={cn(
              "absolute left-0 top-4 px-3 h-max transition-all ease-out duration-200 pointer-events-none",
              inputValue && inputActive,
              inputFocusLabelClassName,
              props.placeholder && inputPlaceholdernotshownLabelClassName,
              error && "!text-destructive",
              warn && "!text-warn",
              labelClassName
            )}
          >
            {label}
            {requiredStar && props.required && (
              <span className="text-destructive ml-1">*</span>
            )}
          </Label>

          {children}
          {rightIcon && (
            <div className="absolute right-4 inset-y-0 flex justify-center items-center text-ring">
              {rightIcon}
            </div>
          )}
          {leftIcon && (
            <div className="absolute left-4 inset-y-0 flex justify-center items-center text-ring">
              {leftIcon}
            </div>
          )}
        </div>

        <InputInfo info={info} warn={warn} error={error} />

        {typeof remainingWords === "number" && (
          <div
            className={cn(
              "text-xs text-right mt-1",
              showError
                ? "text-destructive"
                : showWarning
                ? "text-yellow-600"
                : "text-muted-foreground"
            )}
          >
            {remainingWords < 0
              ? "Word limit exceeded"
              : `${remainingWords} word${
                  remainingWords === 1 ? "" : "s"
                } remaining`}
          </div>
        )}
      </div>
    );
  }
);

TextAreaV1.displayName = "TextAreaV1";

export default TextAreaV1;
