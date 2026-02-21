import { cn } from "@/lib/utils";
import { motion } from "framer-motion";
import React, { ReactNode } from "react";

type Props = { viewPortProps?: { amount?: number; once?: boolean }; className?: string; delay?: number; children: ReactNode };

const FadeIn = ({ viewPortProps, delay = 0, className, children }: Props) => {
  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={!viewPortProps ? { opacity: 1 } : undefined}
      whileInView={viewPortProps ? { opacity: 1 } : undefined}
      transition={{ delay: delay, duration: 0.5 }}
      viewport={viewPortProps}
      className={cn(className)}
    >
      {children}
    </motion.div>
  );
};

export default FadeIn;
