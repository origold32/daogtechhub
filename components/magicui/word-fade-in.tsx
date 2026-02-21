"use client";

import { motion, Variants } from "framer-motion";

import { cn } from "@/lib/utils";

interface WordFadeInProps {
  whileInView?: boolean;
  words: string;
  className?: string;
  delay?: number;
  variants?: Variants;
}

export default function WordFadeIn({
  whileInView,
  words,
  delay = 0.16,
  variants = {
    hidden: { opacity: 0 },
    visible: (i: any) => ({
      once: true,
      y: 0,
      opacity: 1,
      transition: { delay: i * delay },
    }),
  },
  className,
}: WordFadeInProps) {
  const _words = words.split(" ");

  return (
    <motion.span
      variants={variants}
      // transition={{ delay: 2 }}
      initial="hidden"
      animate={!whileInView ? "visible" : undefined}
      whileInView={whileInView ? "visible" : undefined}
      viewport={{ once: true, amount: 1 }}
      className={cn(
        // "font-display text-center text-4xl font-bold tracking-[-0.02em] text-black drop-shadow-sm dark:text-white md:text-7xl md:leading-[5rem]",
        className
      )}
    >
      {_words.map((word, i) => (
        <motion.span key={word} variants={variants} custom={i}>
          {word}{" "}
        </motion.span>
      ))}
    </motion.span>
  );
}
