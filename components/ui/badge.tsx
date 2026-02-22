import * as React from "react";
import { Slot } from "@radix-ui/react-slot";
import { cva, type VariantProps } from "class-variance-authority";
import { Circle } from "lucide-react";

import { cn } from "@/lib/utils";

const badgeVariants = cva(
  "inline-flex items-center justify-center whitespace-nowrap shrink-0 gap-1 font-medium transition-all overflow-hidden [&>svg]:pointer-events-none",
  {
    variants: {
      variant: {
        default:
          "border-transparent bg-primary text-primary-foreground [a&]:hover:bg-primary/90",
        secondary:
          "border-transparent bg-secondary text-secondary-foreground [a&]:hover:bg-secondary/90",
        destructive:
          "border-transparent bg-destructive text-white [a&]:hover:bg-destructive/90",
        outline:
          "border text-foreground [a&]:hover:bg-accent [a&]:hover:text-accent-foreground",
        friendly:
          "border-transparent bg-friendly text-friendly-foreground hover:bg-friendly/90",
        yellow: "border border-yellow-400 bg-yellow-50 text-yellow-500",
      },
      size: {
        default: "px-2 py-0.5 text-xs",
        sm: "px-2 py-0.5 text-xs",
        lg: "px-3 py-1 text-sm",
      },
      rounded: {
        default: "rounded-full",
        md: "rounded-md",
      },
    },
    defaultVariants: {
      variant: "default",
      size: "default",
      rounded: "default",
    },
  },
);

/* ---------------- BADGE ---------------- */

export interface BadgeProps
  extends React.ComponentProps<"span">, VariantProps<typeof badgeVariants> {
  asChild?: boolean;
  showCircle?: boolean;
}

function Badge({
  className,
  variant,
  size,
  rounded,
  asChild = false,
  showCircle = false,
  children,
  ...props
}: BadgeProps) {
  const Comp = asChild ? Slot : "span";

  return (
    <Comp
      data-slot="badge"
      className={cn(badgeVariants({ variant, size, rounded }), className)}
      {...props}
    >
      {showCircle && <Circle fill="currentColor" size={10} className="mr-1" />}
      {children}
    </Comp>
  );
}

Badge.displayName = "Badge";

/* ---------------- BADGE DISPLAY ---------------- */

const BadgeDisplay = ({
  type,
  content,
}: {
  type: string;
  content: React.ReactNode;
}) => {
  if (type === "CANCELLED") {
    return (
      <Badge size="sm" variant="destructive" showCircle>
        {content}
      </Badge>
    );
  }

  if (type === "SUCCESS") {
    return (
      <Badge size="sm" variant="friendly" showCircle>
        {content}
      </Badge>
    );
  }

  if (type === "PENDING") {
    return (
      <Badge size="sm" variant="yellow" showCircle>
        {content}
      </Badge>
    );
  }

  return <Badge>{content}</Badge>;
};

export { Badge, badgeVariants, BadgeDisplay };
