import { cn } from "@/lib/utils";
import { motion as m } from "framer-motion";
import Image from "next/image";
import React from "react";

type Props = {
  className?: string;
  imgClassName?: string;
  rootClassName?: string;
  src: string;
  delay?: number;
};

const SpringImage = ({ rootClassName, imgClassName, className, delay, src }: Props) => {
  return (
    <div className={cn(rootClassName)}>
      <m.div
        className={cn(className)}
        initial={{ opacity: 0, scale: 0, rotate: "-20deg", y: 90, origin: "bottom left" }}
        animate={{ opacity: 1, scale: 1, y: 0, rotate: 0 }}
        transition={{ type: "spring", delay: delay, restSpeed: 0.9, bounce: 0.6, duration: 2 }}
        // transition={{ delay: delay, restSpeed: 0.5 }}
      >
        <Image src={src} alt="decorator" width={227} height={227} className={cn(imgClassName)} />
      </m.div>
    </div>
  );
};

export default SpringImage;
