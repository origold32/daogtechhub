"use client";

import React, { useEffect, useMemo, useRef, useState } from "react";
import { Search, X } from "lucide-react";
import { buttonVariants } from "@/components/ui/button";
import { cn } from "@/lib/utils";
import { Input } from "./ui/input";
import { debounce } from "@/lib/debounce";

type Props = {
  value?: string;
  defaultValue?: string;
  onChange?: (e: React.ChangeEvent<HTMLInputElement>) => void;
  onClickSearch?: (value: string) => void;
  placeholder?: string;
  className?: string;
  searchClassName?: string;
  debounceMs?: number;
};

const InputSearch = ({
  value,
  defaultValue,
  onChange,
  onClickSearch,
  placeholder = "Search...",
  className,
  searchClassName,
  debounceMs = 300, // default debounce time
}: Props) => {
  const isControlled = value !== undefined;
  const [internal, setInternal] = useState<string>(defaultValue ?? "");
  const inputRef = useRef<HTMLInputElement | null>(null);

  // Create debounced search function (memoized so it doesn't recreate on each render)
  const debouncedSearch = useMemo(
    () => debounce((val: string) => onClickSearch?.(val), debounceMs),
    [onClickSearch, debounceMs]
  );

  useEffect(() => {
    if (!isControlled && defaultValue !== undefined) {
      setInternal(defaultValue);
    }
  }, [defaultValue, isControlled]);

  const displayed = isControlled ? value ?? "" : internal;

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const newValue = e.target.value;
    if (!isControlled) setInternal(newValue);
    onChange?.(e);
    debouncedSearch(newValue);
  };

  const handleClear = () => {
    const fakeEvent = {
      target: { value: "" },
    } as React.ChangeEvent<HTMLInputElement>;
    if (isControlled) {
      onChange?.(fakeEvent);
    } else {
      setInternal("");
      onChange?.(fakeEvent);
    }
    onClickSearch?.(""); // Clear triggers immediate search
    inputRef.current?.focus();
  };

  const handleManualSearch = () => {
    onClickSearch?.(displayed); // Manual trigger (no debounce)
  };

  return (
    <div
      className={cn("h-max relative max-w-[300px] min-w-[250px]", className)}
    >
      <Input
        ref={inputRef}
        placeholder={placeholder}
        className={cn(
          "px-4 pr-12 w-full rounded-full h-11 sm:h-12",
          searchClassName
        )}
        type="text"
        value={displayed}
        onChange={handleChange}
      />

      {displayed ? (
        <button
          type="button"
          onClick={handleClear}
          aria-label="Clear search"
          title="Clear search"
          className="absolute right-2 inset-y-0 flex items-center justify-center h-10 w-10 my-auto rounded-full z-20 bg-destructive text-white"
        >
          <X size={16} />
        </button>
      ) : (
        <button
          type="button"
          onClick={handleManualSearch}
          aria-label="Search"
          title="Search"
          className={cn(
            buttonVariants({ size: "icon-sm" }),
            "absolute right-2 inset-y-0 h-10 w-10 my-auto rounded-full z-20"
          )}
        >
          <Search className="text-white" size={16} />
        </button>
      )}
    </div>
  );
};

export default InputSearch;
