import React, { ReactNode } from "react";
import TitleCatption, { TitleCaptionProps } from "../title-caption";
import { ChevronLeft } from "lucide-react";
import Link from "next/link";
import { cn } from "@/lib/utils";

type Props = { titleCaptionProps: TitleCaptionProps; backLink?: string; rC?: ReactNode; className?: string };

const PageLocationIndicator = ({ titleCaptionProps, backLink, rC, className }: Props) => {
  return (
    <div className={cn("mb-6 bg-primary/5 py-4  sm:py-9", className)}>
      <div className=" container px-4/ flex justify-between gap-4">
        <div className="flex items-center gap-1">
          {backLink ? (
            <Link href={backLink}>
              <ChevronLeft size={20} />
            </Link>
          ) : null}
          <TitleCatption titleClassName=" text-xl font-semibold" {...titleCaptionProps} />
        </div>
        {rC}
      </div>
    </div>
  );
};

export default PageLocationIndicator;
