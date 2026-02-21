import React, { ReactNode } from "react";
import { Activity, LucideProps } from "lucide-react";

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { cn } from "@/lib/utils";
import TitleCatption from "@/components/title-caption";
import formatNumberWithCommas from "@/lib/formatNumbersWithCommas";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Currency } from "../currency-amount";

export interface CardAnalytics2Props {
  title: string | number;
  sub?: string | number;
  icon?: ReactNode;
  loading?: boolean;
  loadingBg?: string;
  hasCurr?: boolean;
  hasCurrSelect?: boolean;
  defaultSelectValue?: "USD" | "NGN";
  onCurrencyChange?: (val: "USD" | "NGN") => void;
  className?: string;
  bgClassName?: string;
}

const CardAnalytics2 = ({
  title = "No card title",
  sub,
  hasCurr = true,
  hasCurrSelect,
  defaultSelectValue,
  icon,
  bgClassName,
  loadingBg,
  className,
  loading,
  onCurrencyChange,
}: CardAnalytics2Props) => {
  return (
    <Card
      className={cn(
        "relative rounded-xl p-4 md:px-10 py-6 flex items-center gap-4 min-w-[250px] sm:min-w-[300px] h-max md:h-44 w-full bg-[#242424]",
        className
      )}
    >
      {hasCurrSelect ? (
        <Select
          defaultValue={defaultSelectValue}
          onValueChange={(val) => {
            if (onCurrencyChange) onCurrencyChange(val as "USD" | "NGN");
          }}
        >
          <SelectTrigger className="w-max px-3 text-xs rounded-full h-auto py-1 absolute right-4 top-4 bg-white">
            <SelectValue placeholder="USD" />
          </SelectTrigger>
          <SelectContent align="end">
            {["USD", "NGN"].map((currency) => (
              <SelectItem key={currency} value={currency}>
                {currency}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
      ) : null}

      <div
        className={cn(
          "grid place-content-center p-4 rounded-full  w-16 h-16 bg-white/10"
        )}
      >
        {icon}
      </div>

      <TitleCatption
        titleLoading={loading}
        loadingBg={cn(loadingBg ? loadingBg : `${bgClassName} bg-opacity-80`)}
        // invert={true}
        title={
          <span>
            {hasCurr ? <Currency curr={defaultSelectValue ?? "NGN"} /> : null}
            {formatNumberWithCommas(title)}
          </span>
        }
        titleClassName="text-2xl font-semibold text-white"
        caption={sub}
        captionClassName="text-sm text-muted-foreground text-white"
      />
    </Card>
  );
};

export default CardAnalytics2;
