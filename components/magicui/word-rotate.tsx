"use client";

import { useEffect, useState } from "react";
import { AnimatePresence, HTMLMotionProps, motion } from "framer-motion";

import { cn } from "@/lib/utils";

interface WordRotateProps {
  words: string[];
  duration?: number;
  framerProps?: HTMLMotionProps<"h1">;
  className?: string;
  rootClassName?: string;
}

export default function WordRotate({
  words,
  duration = 2500,
  framerProps = {
    initial: { opacity: 0, y: -50 },
    animate: { opacity: 1, y: 0 },
    exit: { opacity: 0, y: 50 },
    transition: { duration: 0.25, ease: "easeOut" },
  },
  className,
  rootClassName,
}: WordRotateProps) {
  const [index, setIndex] = useState(0);
  const [init, setInit] = useState(false);

  useEffect(() => {
    const interval = setInterval(() => {
      setIndex((prevIndex) => (prevIndex + 1) % words.length);
    }, duration);

    const id = setTimeout(() => {
      setInit(true);
    }, 1000);

    // Clean up interval on unmount
    return () => clearInterval(id);
  }, [words, duration]);

  return (
    <span
      className={cn("block [clip-path:polygon(1%_14.58%,_99.88%_13.54%,_99.88%_105%,_-0.12%_104.12%)] sm:[clip-path:polygon(0.75%_-2.08%,_100%_1.04%,_99.88%_125%,_0.13%_128.12%)] ", rootClassName)}
    >
      <AnimatePresence mode="wait">
        <motion.span key={words[index]} className={cn("block", className)} {...framerProps} initial={!init ? false : framerProps.initial} transition={{ ...framerProps.transition }}>
          {words[index]}
        </motion.span>
      </AnimatePresence>
    </span>
  );
}
