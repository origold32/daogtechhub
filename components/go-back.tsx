"use client";

import { cn } from "@/lib/utils";
import { ChevronLeft } from "lucide-react";
import Link from "next/link";
import { useRouter } from "next/navigation";

export type GoBackProps = {
  link?: string;
  className?: string;
  onClick?: () => void;
  label?: string;
  showIcon?: boolean;
};

const GoBack = ({
  className,
  link,
  onClick,
  label = "Go back",
  showIcon = true,
}: GoBackProps) => {
  const router = useRouter();

  const content = (
    <>
      {showIcon && <ChevronLeft color="rgb(243, 233, 255)" />}
      {label}
    </>
  );

  const baseClasses =
    "flex gap-2 items-center font-semibold cursor-pointer w-max text-[rgb(243,233,255)]";

  if (link) {
    return (
      <Link href={link} className={cn(baseClasses, className)}>
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
      className={cn(baseClasses, className)}
    >
      {content}
    </button>
  );
};

export default GoBack;
