import * as React from "react";
import { Slot } from "@radix-ui/react-slot";
import { cva, type VariantProps } from "class-variance-authority";
import Link from "next/link";

import { cn } from "@/lib/utils";
import Loader1 from "../loaders/loader-1";

const buttonVariants = cva(
  "inline-flex items-center justify-center gap-2 whitespace-nowrap text-sm font-medium transition-all disabled:pointer-events-none disabled:opacity-50",
  {
    variants: {
      variant: {
        default: "bg-primary text-primary-foreground hover:bg-primary/90",
        "default-no-hover": "bg-primary text-primary-foreground",
        destructive: "bg-destructive text-white hover:bg-destructive/90",
        "outline-destructive":
          "border border-destructive bg-transparent text-destructive hover:opacity-80",
        outline:
          "border bg-background hover:bg-accent hover:text-accent-foreground",
        secondary:
          "bg-secondary text-secondary-foreground hover:bg-secondary/80",
        "outline-secondary":
          "border border-secondary bg-background text-secondary",
        ghost: "hover:bg-accent hover:text-accent-foreground",
        link: "text-primary underline-offset-4 hover:underline",
      },
      size: {
        default: "h-9 px-4 py-2",
        sm: "h-8 px-3",
        lg: "h-10 px-6",
        icon: "size-9",
        "icon-sm": "size-8",
        "icon-lg": "size-10",
      },
      rounded: {
        default: "rounded-full",
        md: "rounded-xl",
        sm: "rounded-md",
      },
    },
    defaultVariants: {
      variant: "default",
      size: "default",
      rounded: "default",
    },
  },
);

/* ---------------- BUTTON ---------------- */

export interface ButtonProps
  extends React.ComponentProps<"button">, VariantProps<typeof buttonVariants> {
  asChild?: boolean;
  loading?: boolean;
  loadingText?: React.ReactNode;
  rightIcon?: React.ReactNode;
  leftIcon?: React.ReactNode;
}

export function Button({
  className,
  variant,
  size,
  rounded,
  asChild = false,
  loading,
  loadingText,
  rightIcon,
  leftIcon,
  children,
  ...props
}: ButtonProps) {
  const Comp = asChild ? Slot : "button";

  return (
    <Comp
      disabled={loading || props.disabled}
      className={cn(
        "overflow-hidden inline-flex items-center justify-center",
        buttonVariants({ variant, size, rounded, className }),
      )}
      {...props}
    >
      {leftIcon && !loading && <span className="shrink-0">{leftIcon}</span>}

      {loading && loadingText ? loadingText : children}

      {loading && <Loader1 className="ml-2" />}

      {rightIcon && !loading && (
        <span className="shrink-0 ml-2">{rightIcon}</span>
      )}
    </Comp>
  );
}

Button.displayName = "Button";

/* ---------------- LINK BUTTON ---------------- */

export interface LinkButtonProps
  extends
    React.AnchorHTMLAttributes<HTMLAnchorElement>,
    VariantProps<typeof buttonVariants> {
  href: string;
  loading?: boolean;
  loadingText?: React.ReactNode;
  rightIcon?: React.ReactNode;
  leftIcon?: React.ReactNode;
}

export const ButtonLink = React.forwardRef<HTMLAnchorElement, LinkButtonProps>(
  (
    {
      className,
      variant,
      size,
      rounded,
      loading,
      loadingText,
      rightIcon,
      leftIcon,
      children,
      href,
      ...props
    },
    ref,
  ) => {
    return (
      <Link
        ref={ref}
        href={href}
        className={cn(
          "inline-flex items-center justify-center",
          buttonVariants({ variant, size, rounded, className }),
        )}
        {...props}
      >
        {leftIcon && !loading && <span className="shrink-0">{leftIcon}</span>}

        {loading && loadingText ? loadingText : children}

        {loading && <Loader1 className="ml-2" />}

        {rightIcon && !loading && (
          <span className="shrink-0 ml-2">{rightIcon}</span>
        )}
      </Link>
    );
  },
);

ButtonLink.displayName = "ButtonLink";

export { buttonVariants };
