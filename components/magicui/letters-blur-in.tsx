import { cn } from "@/lib/utils";
import { delay, motion as m } from "framer-motion";
import React from "react";

type Props = {
  texts?: string;
  className?: string;
};

const LettersBlurIn = ({ texts, className }: Props) => {
  const container = {
    hidden: { opacity: 0 },
    show: {
      opacity: 1,

      transition: {
        staggerChildren: 0.05,
        delayChildren: 1.1,
        duration: 2,
      },
    },
  };
  const item = {
    hidden: { filter: "blur(10px)", opacity: 0, x: -500 },
    show: { filter: "blur(0px)", opacity: 1, x: 0 },
  };
  return (
    <m.div variants={container} initial="hidden" animate="show" className={cn(className)}>
      {texts?.split("").map((text, i) => {
        return (
          <m.span variants={item} key={i}>
            {text}
          </m.span>
        );
      })}
    </m.div>
  );
};

export default LettersBlurIn;
