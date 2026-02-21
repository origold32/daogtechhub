"use client";
import * as React from "react";
import { cn } from "@/lib/utils";

export interface InputFillGapProps
  extends React.InputHTMLAttributes<HTMLInputElement>,
    React.ComponentPropsWithRef<"input"> {
  title: string;
  className?: string;
  titleClassName?: string;
  underlineClassName?: string;
  /** Only applies when layout is column */
  labelPosition?: "top" | "bottom";
}

const InputFillGapV1 = React.forwardRef<HTMLInputElement, InputFillGapProps>(
  (
    {
      title,
      className,
      titleClassName,
      underlineClassName,
      labelPosition = "top",
      ...props
    },
    ref
  ) => {
    const id = React.useId();
    const isColumn = className?.includes("flex-col");

    const labelEl = (
      <label
        htmlFor={id}
        className={cn(
          "whitespace-nowrap text-xs font-medium flex-shrink-0",
          titleClassName
        )}
      >
        {title}
      </label>
    );

    const inputEl = (
      <input
        id={id}
        ref={ref}
        {...props}
        className={cn(
          "w-full border-[#010f01]",
          isColumn
            ? "border-b bg-transparent outline-none px-1 py-0.5 text-sm focus:border-ring focus-visible:outline-none"
            : "flex-1 min-w-0 border-b bg-transparent outline-none px-1 py-0.5 text-sm focus:border-ring focus-visible:outline-none",
          underlineClassName
        )}
      />
    );

    return (
      <div className={cn("flex items-center gap-1 w-full", className)}>
        {isColumn ? (
          labelPosition === "top" ? (
            <>
              {labelEl}
              {inputEl}
            </>
          ) : (
            <>
              {inputEl}
              {labelEl}
            </>
          )
        ) : (
          <>
            {labelEl}
            {inputEl}
          </>
        )}
      </div>
    );
  }
);

InputFillGapV1.displayName = "InputFillGapV1";
export default InputFillGapV1;
