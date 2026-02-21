import formatNumberWithCommas from "@/lib/formatNumbersWithCommas";
import { cn } from "@/lib/utils";
import React, { useState } from "react";
import NumberTicker from "./magicui/number-ticker";

type Props = {
  curr: string;
  amount: number;
  className?: string;
  ticker?: boolean;
  editable?: boolean;
  onChange?: (val: number) => void;
};

const CurrencyAmount = ({
  curr,
  amount = 0,
  ticker = false,
  editable = false,
  onChange,
  className,
}: Props) => {
  const [internalAmount, setInternalAmount] = useState(amount.toString());

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const val = e.target.value.replace(/,/g, "");
    setInternalAmount(e.target.value);
    const parsed = parseFloat(val);
    if (!isNaN(parsed) && onChange) {
      onChange(parsed);
    }
  };

  return (
    <span className={cn("font-semibold text-lg text-secondary", className)}>
      <Currency curr={curr} />
      {editable ? (
        <input
          title="Currency Amount"
          type="text"
          value={internalAmount}
          onChange={handleChange}
          inputMode="numeric"
          className="bg-transparent border-none outline-none w-24"
        />
      ) : ticker && amount > 0 && amount < 10000 ? (
        <NumberTicker value={amount} />
      ) : (
        formatNumberWithCommas(amount)
      )}
    </span>
  );
};

// export const Currency = ({ curr }: { curr: "NGN" | "USD" }) => {
//   return (
//     <span>
//       {curr?.toLowerCase() === "NGN" ? "₦" : null}
//       {curr?.toLowerCase() === "USD" ? "$" : null}
//     </span>
//   );
// };

export const Currency = ({ curr }: { curr?: string }) => {
  const currencyCode = (curr || "NGN").toUpperCase();
  const fallbackSymbols: Record<string, string> = {
    NGN: "₦",
    USD: "$",
    EUR: "€",
  };
  try {
    const formatter = new Intl.NumberFormat("en", {
      style: "currency",
      currency: curr,
      minimumFractionDigits: 0,
      maximumFractionDigits: 0,
    });
    const parts = formatter.formatToParts(0);
    const symbol = parts.find((p) => p.type === "currency")?.value;
    if (!symbol || symbol === currencyCode) {
      return <span>{fallbackSymbols[currencyCode] ?? currencyCode}</span>;
    }

    return <span>{symbol}</span>;
  } catch {
    return <span>{fallbackSymbols[currencyCode] ?? currencyCode}</span>;
  }
};

export default CurrencyAmount;
