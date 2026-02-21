import React, { ReactNode } from "react";
import { Activity, LucideProps } from "lucide-react";

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { cn } from "@/lib/utils";
import TitleCatption from "@/components/title-caption";
import formatNumberWithCommas from "@/lib/formatNumbersWithCommas";

export interface CardAnalyticsProps {
  title: string | number;
  sub?: string | number;
  icon?: ReactNode;
  loading?: boolean;
  loadingBg?: string;
  hasCurr?: boolean;

  className?: string;
  bgClassName?: string;
}

const CardAnalytics1 = ({ title = "No card title", sub, hasCurr = true, icon, bgClassName, loadingBg, className, loading }: CardAnalyticsProps) => {
  return (
    <Card className={cn("p-4 py-6 flex items-center gap-4 min-w-[250px] h-max w-max bg-opacity-40", className, bgClassName)}>
      <div className={cn("grid place-content-center p-4 rounded-full  w-14 h-14", bgClassName)}>{icon}</div>

      <TitleCatption
        titleLoading={loading}
        loadingBg={cn(loadingBg ? loadingBg : `${bgClassName} bg-opacity-80`)}
        invert={true}
        title={
          <span>
            {hasCurr ? <sup className=" text-xs align-top mr-0.5 leading-[unset]">₦</sup> : null}
            {formatNumberWithCommas(title) || 0}
          </span>
        }
        titleClassName="text-2xl font-semibold"
        caption={sub}
        captionClassName="text-xs text-muted-foreground"
      />
    </Card>
  );
};

export default CardAnalytics1;
