"use client";

import { motion } from "framer-motion";

import { cn } from "@/lib/utils";

interface BlurIntProps {
  word: string;
  className?: string;
  variant?: {
    hidden: { filter: string; opacity: number };
    visible: { filter: string; opacity: number };
  };
  duration?: number;
  delay?: number;
}
const BlurIn = ({ word, className, variant, duration = 0.75, delay }: BlurIntProps) => {
  const defaultVariants = {
    hidden: { filter: "blur(10px)", opacity: 0 },
    visible: { filter: "blur(0px)", opacity: 1, once: true },
  };
  const combinedVariants = variant || defaultVariants;

  return (
    <motion.span initial="hidden" whileInView="visible" viewport={{ once: true }} transition={{ duration, delay: delay }} variants={combinedVariants} className={cn(className)}>
      {word}
    </motion.span>
  );
};

export default BlurIn;
