"use client";

import {
  Select,
  SelectContent,
  SelectGroup,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { InputInfo, InputInfoProps } from "@/components/ui/input";
import { cn } from "@/lib/utils";
import * as React from "react";
import * as RadixSelect from "@radix-ui/react-select";
import { Label } from "@/components/ui/label";
import { inputActive } from "./input-v1";

export type SelectItem = { content?: React.ReactNode; value: string };

export interface InputSelectV1Props
  extends RadixSelect.SelectProps,
    InputInfoProps {
  items: SelectItem[];
  className?: string;
  rootClassName?: string;
  requiredStar?: boolean;
  requiredErrorMessage?: string;
  label?: string;
  labelClassName?: string;
  placeholder?: React.ReactNode;
  immediateOpenSelectWhenNoValue?: boolean;
  name?: string;
  onChange?: (e: { target: { name: string; value: string } }) => void;
}

const InputSelectV1 = React.forwardRef<HTMLButtonElement, InputSelectV1Props>(
  (
    {
      className,
      placeholder,
      label,
      requiredStar,
      requiredErrorMessage = "Please select a value in the list",
      onOpenChange,
      onValueChange,
      onChange,
      labelClassName,
      info,
      warn,
      error,
      items,
      immediateOpenSelectWhenNoValue,
      rootClassName,
      ...props
    },
    ref
  ) => {
    const id = React.useId();
    const focusComingFromContentClose = React.useRef(false);
    const [selectOpened, setSelectOpened] = React.useState(false);

    const isControlled = props.value !== undefined;

    const [internalValue, setInternalValue] = React.useState(() => {
      const defaultItem = items.find(
        (item) => item.value === props.defaultValue
      );
      return defaultItem?.value ?? "";
    });

    const currentValue = isControlled ? props.value : internalValue;
    const [labelOpen, setLabelOpen] = React.useState(!!currentValue);

    React.useEffect(() => {
      setLabelOpen(!!currentValue);
    }, [currentValue]);

    React.useEffect(() => {
      const bgInput = document.getElementById(
        "background_select"
      ) as HTMLInputElement | null;
      if (bgInput && props.required && requiredErrorMessage && !currentValue) {
        bgInput.setCustomValidity(requiredErrorMessage);
      } else if (bgInput) {
        bgInput.setCustomValidity("");
      }
    }, [currentValue, props.required, requiredErrorMessage]);

    return (
      <div className={cn("min-h-[calc(2.5rem+10px)]", rootClassName)}>
        <div className="relative">
          {/* Hidden input for HTML form validation */}
          <input
            type="text"
            id="background_select"
            className="sr-only"
            tabIndex={-1}
            aria-hidden="true"
            name={props.name}
            value={currentValue}
            onChange={() => {}}
            required={props.required}
            title={label || "Select input"}
            placeholder={
              typeof placeholder === "string" ? placeholder : "Select an item"
            }
            readOnly
          />

          <Select
            open={selectOpened}
            onOpenChange={(open) => {
              setSelectOpened(open);
              open && setLabelOpen(true);
              onOpenChange?.(open);
            }}
            onValueChange={(value) => {
              if (!isControlled) {
                setInternalValue(value);
              }

              onValueChange?.(value);
              onChange?.({
                target: { name: props.name ?? "", value },
              });
            }}
            value={currentValue}
            {...props}
          >
            <SelectTrigger
              id={id}
              ref={ref}
              className={cn(
                "cursor-pointer",
                (error || warn) && "border-2 ring-offset-2",
                error &&
                  "border-destructive ring-destructive/ [--ring:var(--destructive)]",
                warn && "border-warn ring-warn/ [--ring:var(--warn)]",
                className
              )}
              onFocus={() => {
                setLabelOpen(true);
                if (!focusComingFromContentClose.current) {
                  !currentValue &&
                    immediateOpenSelectWhenNoValue &&
                    setSelectOpened(true);
                }
              }}
              onBlur={() => {
                if (!selectOpened && !currentValue) {
                  setLabelOpen(false);
                }
                focusComingFromContentClose.current = false;
              }}
            >
              <SelectValue
                placeholder={
                  <span className={cn(labelOpen ? "opacity-100" : "opacity-0")}>
                    {placeholder || "Select an item"}
                  </span>
                }
              />
            </SelectTrigger>

            {/* Floating label */}
            <Label
              htmlFor={id}
              className={cn(
                "absolute left-0 top-1/2 -translate-y-1/2 px-3 h-max transition-all duration-200 pointer-events-none",
                labelOpen && inputActive,
                error && "text-destructive",
                warn && "text-warn",
                labelClassName
              )}
            >
              {label}
              {requiredStar && props.required && " *"}
            </Label>

            <SelectContent
              onCloseAutoFocus={() => {
                focusComingFromContentClose.current = true;
              }}
            >
              <SelectGroup>
                {items?.map((item, i) => (
                  <SelectItem key={i} value={item.value}>
                    {item.content ?? item.value}
                  </SelectItem>
                ))}
              </SelectGroup>
            </SelectContent>
          </Select>
        </div>
        <InputInfo info={info} warn={warn} error={error} />
      </div>
    );
  }
);

InputSelectV1.displayName = "InputSelectV1";

export default InputSelectV1;
