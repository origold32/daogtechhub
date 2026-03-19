// components/reusables/input-phone-5.tsx
// Phone number input using react-phone-number-input with emoji flag country selector.
// react-flag-kit removed — replaced with Unicode emoji flags (zero extra dependencies).
"use client";

import * as React from "react";
import { InputInfoProps } from "@/components/ui/input";
import PhoneInput, { Country, Value, getCountryCallingCode } from "react-phone-number-input";
import "react-phone-number-input/style.css";
import {
  Select, SelectContent, SelectGroup, SelectItem, SelectLabel, SelectValue,
} from "@/components/ui/select";
import * as SelectPrimitive from "@radix-ui/react-select";
import { cn } from "@/lib/utils";
import { Label } from "@/components/ui/label";
import InputV1 from "./input-v1";

export interface InputPhone5Props
  extends Omit<React.ComponentPropsWithoutRef<"input">, "onChange" | "value">,
    InputInfoProps {
  label: string;
  labelClassName?: string;
  requiredStar?: boolean;
  rootClassName?: string;
  value?: Value | undefined;
  onChange?: (val: Value | undefined) => void;
  defaultValue?: string;
}

/** Convert ISO country code to emoji flag (e.g. "NG" → "🇳🇬") */
function countryToEmoji(code: string): string {
  if (!code || code.length !== 2) return "🌐";
  return code
    .toUpperCase()
    .split("")
    .map((c) => String.fromCodePoint(c.codePointAt(0)! - 65 + 0x1f1e6))
    .join("");
}

const InputPhone5 = React.forwardRef<HTMLInputElement, InputPhone5Props>(
  ({ defaultValue, className, rootClassName, onChange, label, labelClassName,
     requiredStar, warn, error, info, ...props }, _ref) => {

    const [value, setValue] = React.useState<string>(defaultValue ?? "");

    React.useEffect(() => {
      setValue(defaultValue ?? "");
    }, [defaultValue]);

    return (
      <div className={rootClassName}>
        {label && (
          <Label className={cn("block text-[11px] text-white/40 font-medium tracking-widest uppercase mb-1", labelClassName)}>
            {label}{requiredStar && <span className="text-red-400 ml-0.5">*</span>}
          </Label>
        )}
        <PhoneInput
          defaultCountry="NG"
          international={false}
          withCountryCallingCode
          limitMaxLength
          inputComponent={InputV1}
          numberInputProps={{ className: "rounded-l-none focus:z-10" }}
          placeholder="e.g. 07012345678"
          countrySelectComponent={CountrySelect}
          label={label ?? "Phone number"}
          {...props}
          value={props.value ?? value}
          onChange={(val) => {
            onChange?.(val);
            setValue(val ?? "");
          }}
        />
        {error && <p className="text-[11px] text-red-400 mt-1">{error}</p>}
        {warn  && <p className="text-[11px] text-amber-400 mt-1">{warn}</p>}
        {info  && <p className="text-[11px] text-white/40 mt-1">{info}</p>}
      </div>
    );
  }
);

InputPhone5.displayName = "InputPhone5";
export default InputPhone5;

type CountrySelectProps = {
  value: Country;
  onChange: (val: string) => void;
  options: { value: string; label: string; divider: boolean }[];
};

const CountrySelect = ({ value, onChange, options }: CountrySelectProps) => (
  <Select value={value} onValueChange={onChange}>
    <SelectPrimitive.Trigger
      className="relative mr-0.5 focus:z-10 flex h-9 w-[90px] items-center justify-between rounded-l-lg border border-r-0 border-white/[0.08] bg-white/[0.04] px-3 py-1 text-sm text-white focus:outline-none focus:ring-1 focus:ring-[#d4a5ff]/50 disabled:opacity-50"
    >
      <SelectValue placeholder="🌐">
        <span className="flex items-center gap-1 text-sm">
          <span>{countryToEmoji(value)}</span>
          <span className="text-xs text-white/60">
            {value ? `+${getCountryCallingCode(value)}` : ""}
          </span>
        </span>
      </SelectValue>
    </SelectPrimitive.Trigger>
    <SelectContent className="max-h-64">
      <SelectGroup>
        <SelectLabel>Country</SelectLabel>
        {options
          .filter((o) => o.value)
          .map(({ value: v, label }) => (
            <SelectItem key={v} value={v} className="flex items-center gap-2">
              <span className="mr-1">{countryToEmoji(v)}</span>
              <span className="truncate max-w-[120px]">{label}</span>
              <span className="text-xs text-white/40 ml-auto">
                +{(() => { try { return getCountryCallingCode(v as Country); } catch { return ""; } })()}
              </span>
            </SelectItem>
          ))}
      </SelectGroup>
    </SelectContent>
  </Select>
);
