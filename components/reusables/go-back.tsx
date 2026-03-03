// components/reusables/go-back.tsx

"use client";

import { cn } from "@/lib/utils";
import { ArrowLeft } from "lucide-react";
import Link from "next/link";
import { useRouter } from "next/navigation";

export type GoBackProps = {
  link?: string;
  className?: string;
  onClick?: () => void;
  label?: string;
  showIcon?: boolean;
  variant?: "default" | "nav"; // 👈 add this
};

const GoBack = ({
  className,
  link,
  onClick,
  label = "Back",
  showIcon = true,
  variant = "default",
}: GoBackProps) => {
  const router = useRouter();

  const baseClasses =
    "flex items-center gap-2 transition-colors cursor-pointer";

  // 👇 variant styles
  const variantClasses =
    variant === "nav"
      ? "text-lilac hover:text-muted-foreground text-sm font-medium"
      : "text-[rgb(243,233,255)] font-semibold";

  const content = (
    <>
      {showIcon && <ArrowLeft className="w-5 h-5" />}
      <span className="hidden sm:inline">{label}</span>
    </>
  );

  if (link) {
    return (
      <Link href={link} className={cn(baseClasses, variantClasses, className)}>
        {content}
      </Link>
    );
  }

  return (
    <button
      onClick={() => {
        if (onClick) {
          onClick();
        } else {
          router.back();
        }
      }}
      className={cn(baseClasses, variantClasses, className)}
    >
      {content}
    </button>
  );
};

export default GoBack;
