import { cn } from "@/lib/utils";
import { motion as m, VariantLabels } from "framer-motion";
import React, { ReactNode } from "react";

type PullUpProps = { whileInView?: boolean; viewPortProps?: { amount?: number; once?: boolean }; delay?: number; className?: string; children: ReactNode };
type PullUpItemProps = { y?: number; delay?: number; clipBox?: boolean; className?: string; children: ReactNode };

export const PullUp = ({ whileInView, viewPortProps = { once: true }, delay = 0, className, children }: PullUpProps) => {
  const pullUpVariants = {
    show: {
      transition: {
        staggerChildren: 0.08,
        delayChildren: delay,
        // type: "inertia",
      },
    },
    hidden: {},
  };
  return (
    <m.div
      className={cn(className)}
      transition={{ duration: 3 }}
      variants={pullUpVariants}
      initial="hidden"
      animate={whileInView ? undefined : "show"}
      whileInView={whileInView ? "show" : undefined}
      viewport={viewPortProps}
    >
      {children}
    </m.div>
  );
};

export const PullUpItem = ({ y = 50, clipBox, className, children }: PullUpItemProps) => {
  const pullUpItemVariants = {
    show: {
      y: 0,
      opacity: 1,
      ease: "easeOut",
      transition: {
        // type: "inertia",
        ease: "easeInOut",
        // type: "spring",
        stiffness: 0,
        restDelta: 30,
        restSpeed: 10,
      },
    },
    hidden: {
      y: y,
      opacity: 0,
      ease: "easeOut",
    },
  };
  return (
    <m.div className={cn(className, clipBox && " clip-box")} variants={pullUpItemVariants}>
      {children}
    </m.div>
  );
};
