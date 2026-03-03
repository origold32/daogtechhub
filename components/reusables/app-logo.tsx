"use client";

import useUser from "@/hooks/useUser";
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
  link,
  className,
  text,
  width = 90,
  height = 90,
  logoSrc,
  logoAlt = "App Logo",
}: Props) => {
  const { user } = useUser();

  const fallbackLogo = "/images/logo.png"; // Local fallback
  const resolvedLogo =
    logoSrc && logoSrc.trim() !== "" ? logoSrc : fallbackLogo;

  return (
    <Link
      className={cn(
        "relative flex items-center gap-1 focus:outline-none",
        className,
      )}
      href={user ? "/" : "/"}
    >
      <Image
        src={resolvedLogo}
        alt={logoAlt}
        width={width}
        height={height}
        onError={(e) => {
          const target = e.target as HTMLImageElement;
          target.src = fallbackLogo; // fallback if remote fails
        }}
      />
      {text ? (
        <span className="font-bold whitespace-nowrap dark:text-white">
          {text}
        </span>
      ) : null}
      {children}
      <span className="sr-only">App logo</span>
    </Link>
  );
};

export default AppLogo;
