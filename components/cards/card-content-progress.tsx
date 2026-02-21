import { cn } from "@/lib/utils";
import { motion as m } from "framer-motion";
import React, { ReactNode } from "react";

type Props = {
  tl: ReactNode;
  tr: ReactNode;
  bl: ReactNode;
  br: ReactNode;
  progress?: number;
  className?: string;
};

const CardContentProgress = ({ tl, tr, bl, br, progress = 0, className }: Props) => {
  return (
    <div className={cn(className)}>
      <div className="flex items-center justify-between gap-2 ">
        {tl}
        {tr}
      </div>

      <div className="w-full bg-gray-200 rounded-full h-1.5 my-2.5 mb-3 dark:bg-gray-700 overflow-hidden">
        <m.div className="bg-blue-600 h-1.5 rounded-2xl" initial={{ width: 0 }} animate={{ width: `${progress}%`, transition: { ease: "easeOut", duration: 1 } }}></m.div>
      </div>
      <div className="flex items-center justify-between gap-2 ">
        {bl}
        {br}
      </div>
    </div>
  );
};

export default CardContentProgress;
