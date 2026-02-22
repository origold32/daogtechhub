"use client";
import { useState } from "react";
import { Eye, EyeOff, Check, X } from "lucide-react";
import { cn } from "@/lib/utils";
import InputV1 from "./input-v1";

type PasswordInputV1Props = {
  label?: string;
  name: string;
  placeholder?: string;
  confirmPassword?: boolean;
  validate?: boolean; // enforce validation rules
  numberOnly?: boolean; // restrict only numbers
  maxLength?: number; // for numberOnly case
  required?: boolean;
  className?: string;
  onChange?: (e: React.ChangeEvent<HTMLInputElement>) => void;
  /** Called with the raw confirm-password string so FormBuilder can track it */
  onConfirmChange?: (value: string) => void;
};

export default function PasswordInputV1({
  label,
  name,
  placeholder,
  confirmPassword = false,
  validate = false,
  numberOnly = false,
  maxLength,
  required,
  className,
  onChange,
  onConfirmChange,
}: PasswordInputV1Props) {
  const [show, setShow] = useState(false);
  const [showConfirm, setShowConfirm] = useState(false);
  const [value, setValue] = useState("");
  const [confirmValue, setConfirmValue] = useState("");

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    let newValue = e.target.value;

    if (numberOnly) {
      newValue = newValue.replace(/\D/g, "");
      if (maxLength) {
        newValue = newValue.slice(0, maxLength);
      }
    }

    setValue(newValue);
    onChange?.({
      ...e,
      target: { ...e.target, value: newValue, name },
    });
  };

  const handleConfirmChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    let newValue = e.target.value;

    if (numberOnly) {
      newValue = newValue.replace(/\D/g, "");
      if (maxLength) {
        newValue = newValue.slice(0, maxLength);
      }
    }

    setConfirmValue(newValue);
    onConfirmChange?.(newValue);
  };

  const mismatch =
    confirmPassword &&
    confirmValue.length >= value.length &&
    confirmValue.length > 0 &&
    confirmValue !== value;

  const inputType = show ? (numberOnly ? "number" : "text") : "password";
  const confirmInputType = showConfirm
    ? numberOnly
      ? "number"
      : "text"
    : "password";

  // Password validation rules
  const validations = [
    {
      label: "At least 8 characters",
      isValid: value.length >= 8,
    },
    {
      label: "Contains uppercase letter",
      isValid: /[A-Z]/.test(value),
    },
    {
      label: "Contains lowercase letter",
      isValid: /[a-z]/.test(value),
    },
    {
      label: "Contains number",
      isValid: /\d/.test(value),
    },
    {
      label: "Contains special character",
      isValid: /[!@#$%^&*(),.?":{}|<>]/.test(value),
    },
  ];

  const numberOnlyValidations = [
    {
      label: `At least ${maxLength || 4} digits`,
      isValid: value.length >= (maxLength || 4),
    },
  ];

  const currentValidations = numberOnly ? numberOnlyValidations : validations;
  const allValid = validate ? currentValidations.every((v) => v.isValid) : true;
  const confirmValid =
    !confirmPassword || (confirmValue === value && confirmValue.length > 0);

  return (
    <div className={cn("space-y-4 w-full", className)}>
      {/* Hidden inputs so FormData picks up both values */}
      <input type="hidden" name={name} value={value} />
      {confirmPassword && (
        <input type="hidden" name={`${name}_confirm`} value={confirmValue} />
      )}

      <div>
        <InputV1
          label={label || "Password"}
          name={`${name}_visible`}
          type={inputType}
          placeholder={placeholder}
          value={value}
          onChange={handleChange}
          required={required}
          inputMode={numberOnly ? "numeric" : "text"}
          pattern={numberOnly ? "[0-9]*" : undefined}
          maxLength={numberOnly ? maxLength : undefined}
          // Block native form submission when validate rules are unmet
          {...(validate && !allValid
            ? {
                title:
                  "Please meet the password requirements before submitting",
              }
            : {})}
          rightElement={
            <button
              type="button"
              onClick={() => setShow((p) => !p)}
              className="text-gray-500 hover:text-gray-700 transition-colors"
            >
              {show ? <EyeOff size={16} /> : <Eye size={16} />}
            </button>
          }
        />

        {/* Validation checklist */}
        {validate && value.length > 0 && (
          <div className="mt-2 p-3 bg-gray-50 rounded-md border">
            <div className="grid gap-2">
              {currentValidations.map((validation, index) => (
                <div
                  key={index}
                  className={cn(
                    "flex items-center gap-2 text-xs transition-colors",
                    validation.isValid ? "text-green-600" : "text-red-500",
                  )}
                >
                  {validation.isValid ? (
                    <Check size={12} className="flex-shrink-0" />
                  ) : (
                    <X size={12} className="flex-shrink-0" />
                  )}
                  <span>{validation.label}</span>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Helper text when field is empty */}
        {validate && value.length === 0 && (
          <p className="text-xs text-gray-500 mt-1">
            {numberOnly
              ? `Password must be at least ${maxLength || 4} digits`
              : "Password must be at least 8 characters"}
          </p>
        )}
      </div>

      {confirmPassword && (
        <div>
          <InputV1
            label="Confirm Password"
            type={confirmInputType}
            placeholder="Confirm Password"
            value={confirmValue}
            onChange={handleConfirmChange}
            required={required}
            inputMode={numberOnly ? "numeric" : "text"}
            pattern={numberOnly ? "[0-9]*" : undefined}
            maxLength={numberOnly ? maxLength : undefined}
            rightElement={
              <button
                type="button"
                onClick={() => setShowConfirm((p) => !p)}
                className="text-gray-500 hover:text-gray-700 transition-colors"
              >
                {showConfirm ? <EyeOff size={16} /> : <Eye size={16} />}
              </button>
            }
          />
          {mismatch && (
            <p className="text-xs text-red-500 mt-1">Passwords do not match</p>
          )}
        </div>
      )}

      {/*
        Invisible submit-blocker: a required hidden input that only has a value
        when both validate passes AND passwords match. This prevents native
        form submission without any JavaScript gate in the parent.
      */}
      {(validate || confirmPassword) && (
        <input
          type="hidden"
          name={`${name}_valid`}
          value={allValid && confirmValid ? "true" : ""}
          required={validate || confirmPassword}
        />
      )}
    </div>
  );
}
