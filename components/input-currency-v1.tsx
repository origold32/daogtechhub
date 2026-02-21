"use client";

import React from "react";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import formatNumberWithCommas from "@/lib/formatNumbersWithCommas";
import { cn } from "@/lib/utils";
import InputV1, { InputV1Props } from "./input-v1";

export interface InputCurrencyAmountV1Props extends InputV1Props {
  onAmountChange?: (amount: number) => void;
  onCurrencyChange?: (curr: string) => void;
}

const InputCurrencyAmountV1 = ({ onAmountChange, onChange, defaultValue, rootClassName, ...inputProps }: InputCurrencyAmountV1Props) => {
  const currs = ["NGN", "USD", "GBP"];
  const [value, setValue] = React.useState<string | number>("");

  const onInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const amount = e.target.value;
    setValue(formatNumberWithCommas(amount));
    onChange && onChange({ ...e, target: { ...e.target, name: e.target.name, value: `${+amount.replaceAll(",", "")}` } });
    onAmountChange && onAmountChange(+amount.replaceAll(",", ""));
  };

  React.useEffect(() => {
    if (defaultValue || defaultValue == 0) {
      setValue(formatNumberWithCommas(defaultValue));
    }
  }, [defaultValue]);
  return (
    <div className={cn("flex items-center", rootClassName)}>
      <Select defaultValue={currs[0]}>
        <SelectTrigger className="w-[80px] rounded-r-none focus:z-10 bg-[#EBF1F5] text-[#B0B7C3] font-semibold gap-1">
          <SelectValue placeholder="Theme" className="text-[#B0B7C3] font-semibold" />
        </SelectTrigger>
        <SelectContent>
          {currs?.map((el) => {
            return (
              <SelectItem key={el} value={el}>
                {el}
              </SelectItem>
            );
          })}
        </SelectContent>
      </Select>
      <InputV1 className=" rounded-l-none" {...inputProps} onChange={onInputChange} value={value} defaultValue={defaultValue} />
    </div>
  );
};

export default InputCurrencyAmountV1;
