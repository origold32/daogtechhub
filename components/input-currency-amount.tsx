import { InputInfo } from "@/components/ui/input";
import formatNumberWithCommas, {
  removeDecimal,
} from "@/lib/formatNumbersWithCommas";
import { cn } from "@/lib/utils";
import useRemoteData from "@/swr/use-swr-data";
import React, { EventHandler, ReactNode, useState } from "react";
import useSWR from "swr";
import { Label } from "./ui/label";
import { Currency } from "./currency-amount";
import { formatAmount, getCurrencySymbol } from "@/lib/formatCurrency";

type InputCurrencyAmountProps = {
  info?: ReactNode;
  currency?: string;
  error?: boolean;
  label?: string;
  onChange?: (value: number) => void;
};

const InputCurrencyAmount = ({
  label,
  info,
  error,
  currency = "",
  // <Currency curr="NGN" />,
  onChange,
}: InputCurrencyAmountProps) => {
  const [value, setValue] = useState<string>("");
  const { data: userData } = useRemoteData({ url: "/user" });
  const balance = userData?.user?.balance ?? 0;
  const onInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const amount = e.target.value;
    setValue(formatNumberWithCommas(amount));
    onChange && onChange(+amount.replaceAll(",", ""));
  };
  return (
    <div>
      {label ? <Label className="mb-2">{label}</Label> : null}
      <div
        className={cn(
          " bg-primary/5 rounded-lg /pt-8 p-6 pt-5 pb-4",
          error && " ring-2 ring-offset-2 ring-destructive"
        )}
      >
        <div className="  mb-2 justify-center flex items-center">
          <span
            className={cn(
              " font-semibold text-primary mr-2 text-4xl ",
              error && " text-destructive/20"
            )}
          >
            {/* {currency ? currency : "$"} */}
            {getCurrencySymbol(currency)}
          </span>
          <input
            required
            value={value}
            placeholder="0.00"
            className={cn(
              " w-full outline-none bg-transparent placeholder:text-black/95 text-black/95 text-4xl font-semibold",
              error && " text-destructive placeholder:text-destructive"
            )}
            onChange={onInputChange}
          />
        </div>
        {/* <div className=" text-sm text-muted-foreground">
          {info ? (
            info
          ) : (
            <span>
              Amount balance -{" "}
              <span className=" font-sans font-semibold">
                {getCurrencySymbol(currency)}
                {formatAmount(balance)}
              </span>
            </span>
          )}
        </div> */}
      </div>
      {error ? <InputInfo className="mt-4" error="Insufficient funds" /> : null}
    </div>
  );
};

export default InputCurrencyAmount;
