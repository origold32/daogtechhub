"use client";

import { createPortal } from "react-dom";
import { useEffect, useState } from "react";
import { X } from "lucide-react";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";

type OverlayManagerProps = {
  isOpen: boolean;
  onClose: () => void;
  title?: string | React.ReactNode;
  caption?: string | React.ReactNode;
  children?: React.ReactNode;
  overlayClassName?: string;
  titleClassName?: string;
  captionClassName?: string;
  contentClassName?: string;
};

export default function OverlayManager({
  isOpen,
  onClose,
  title,
  caption,
  children,
  overlayClassName,
  titleClassName,
  captionClassName,
  contentClassName,
}: OverlayManagerProps) {
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
  }, []);

  useEffect(() => {
    if (isOpen) {
      const originalOverflow = document.body.style.overflow;
      document.body.style.overflow = "hidden";

      return () => {
        document.body.style.overflow = originalOverflow;
      };
    }
  }, [isOpen]);

  if (!mounted || !isOpen) return null;

  return createPortal(
    <div
      className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4"
      onClick={onClose}
    >
      <div
        className={cn(
          "relative bg-white rounded-xl max-w-md w-full max-h-[90vh] overflow-y-auto p-6 shadow-lg space-y-4",
          overlayClassName
        )}
        onClick={(e) => e.stopPropagation()}
      >
        <Button
          onClick={onClose}
          variant="ghost"
          size="icon-sm"
          className="absolute right-4 top-4 text-muted-foreground"
        >
          <X size={16} />
        </Button>

        {title && (
          <h2 className={cn("text-xl font-semibold mb-2", titleClassName)}>
            {title}
          </h2>
        )}
        {caption && (
          <p
            className={cn(
              "text-sm text-muted-foreground mb-4",
              captionClassName
            )}
          >
            {caption}
          </p>
        )}
        <div className={cn("space-y-4", contentClassName)}>{children}</div>
      </div>
    </div>,
    document.body
  );
}
