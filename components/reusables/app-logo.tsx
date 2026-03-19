"use client";

import { cn } from "@/lib/utils";
import Image from "next/image";
import Link from "next/link";
import { ReactNode } from "react";

type Props = {
  link?: string;
  className?: string;
  children?: ReactNode;
  text?: string;
  width?: number;
  height?: number;
  logoSrc?: string;
  logoAlt?: string;
};

const AppLogo = ({
  children,
  link = "/",
  className,
  text,
  width = 90,
  height = 90,
  logoSrc,
  logoAlt = "DAOG Tech Hub",
}: Props) => {
  const fallbackLogo = "/images/logo.png";
  const resolvedLogo = logoSrc && logoSrc.trim() !== "" ? logoSrc : fallbackLogo;

  return (
    <Link
      className={cn("relative flex items-center gap-1 focus:outline-none", className)}
      href={link}
    >
      <Image
        src={resolvedLogo}
        alt={logoAlt}
        width={width}
        height={height}
        priority
        onError={(e) => {
          (e.target as HTMLImageElement).src = fallbackLogo;
        }}
      />
      {text && (
        <span className="font-bold whitespace-nowrap dark:text-white">{text}</span>
      )}
      {children}
      <span className="sr-only">App logo</span>
    </Link>
  );
};

export default AppLogo;
