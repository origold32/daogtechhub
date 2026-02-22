"use client";

import * as React from "react";
import { cn } from "@/lib/utils";
import { CircleHelpIcon, Info, TriangleAlert } from "lucide-react";

/* ---------------- TYPES ---------------- */

export interface InputProps extends React.InputHTMLAttributes<HTMLInputElement> {}

export interface InputInfoProps {
  error?: React.ReactNode;
  warn?: React.ReactNode;
  info?: React.ReactNode;
  className?: string;
}

export const inputErrorClassName = "text-destructive";
export const inputWarnClassName = "text-yellow-500";

const Input = React.forwardRef<HTMLInputElement, InputProps>(
  ({ className, type, onFocus, ...props }, ref) => {
    const handleMobileFocus = (e: React.FocusEvent<HTMLInputElement>) => {
      onFocus?.(e);

      const isMobile = /iPhone|iPad|iPod|Android/i.test(navigator.userAgent);
      if (!isMobile) return;

      const element = e.target as HTMLInputElement;
      const rect = element.getBoundingClientRect();
      const viewportHeight = window.innerHeight;

      if (rect.top > viewportHeight * 0.6) {
        setTimeout(() => {
          element.scrollIntoView({
            behavior: "smooth",
            block: "center",
          });
        }, 100);
      }

      setTimeout(() => {
        const currentViewportHeight =
          window.visualViewport?.height || window.innerHeight;

        if (currentViewportHeight < viewportHeight * 0.8) {
          const newRect = element.getBoundingClientRect();

          if (newRect.bottom > currentViewportHeight - 50) {
            element.scrollIntoView({
              behavior: "smooth",
              block: "center",
            });
          }
        }
      }, 300);
    };

    return (
      <input
        type={type}
        data-slot="input"
        ref={ref}
        onFocus={handleMobileFocus}
        className={cn(
          // ✅ Your NEW design system styles
          "file:text-foreground placeholder:text-muted-foreground selection:bg-primary selection:text-primary-foreground dark:bg-input/30 border-input h-9 w-full min-w-0 rounded-md border bg-transparent px-3 py-1 text-base shadow-xs transition-[color,box-shadow] outline-none",
          "file:inline-flex file:h-7 file:border-0 file:bg-transparent file:text-sm file:font-medium",
          "disabled:pointer-events-none disabled:cursor-not-allowed disabled:opacity-50 md:text-sm",

          // Focus & validation
          "focus-visible:border-ring focus-visible:ring-ring/50 focus-visible:ring-[3px]",
          "aria-invalid:ring-destructive/20 dark:aria-invalid:ring-destructive/40 aria-invalid:border-destructive",

          // ✅ Mobile fix (from old component)
          "[font-size:16px] md:[font-size:0.875rem]",

          className,
        )}
        {...props}
      />
    );
  },
);

Input.displayName = "Input";

export { Input };

export const InputInfo = ({ error, warn, info, className }: InputInfoProps) => {
  const base = "mt-2 flex gap-1 items-center text-sm font-medium";

  return (
    <>
      {error && (
        <div
          className={cn(
            "p-3 px-5 rounded-lg bg-destructive/15",
            base,
            inputErrorClassName,
            className,
          )}
        >
          <CircleHelpIcon className="shrink-0 text-destructive" />
          <span className="ml-2 text-muted-foreground">{error}</span>
        </div>
      )}

      {warn && (
        <div className={cn(base, inputWarnClassName, className)}>
          <TriangleAlert className="shrink-0" size={16} />
          <span>{warn}</span>
        </div>
      )}

      {info && (
        <div className={cn(base, className)}>
          <Info className="shrink-0" size={16} />
          <span>{info}</span>
        </div>
      )}
    </>
  );
};
