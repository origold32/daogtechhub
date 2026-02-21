"use client";

import * as React from "react";
import { format } from "date-fns";
import { Calendar as CalendarIcon } from "lucide-react";

import { cn } from "@/lib/utils";
import { Button } from "@/components/ui/button";
import { Calendar } from "@/components/ui/calendar";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";
import { Label } from "@/components/ui/label";
import { InputInfo, InputInfoProps } from "@/components/ui/input";
import { inputActive } from "./input-v1";

export interface InputDatev1Props extends InputInfoProps {
  rootClassName?: string;
  requiredStar?: boolean;
  requiredErrorMessage?: string;
  label: string;
  labelClassName?: string;
  className?: string;
  placeholder?: React.ReactNode;
  name?: string;
  defaultValue?: Date;
  required?: boolean;
  onChange?: (e: React.ChangeEvent<HTMLInputElement>) => void;
  disablePastDates?: boolean;
  minDate?: Date;
}

const InputDatev2 = React.forwardRef<HTMLButtonElement, InputDatev1Props>(
  (properties, ref) => {
    const {
      requiredStar,
      rootClassName,
      labelClassName,
      error,
      warn,
      info,
      className,
      onChange,
      defaultValue,
      disablePastDates = false,
      minDate,
      label = "Pick a date",
      placeholder = "press enter to pick a date",
      ...props
    } = properties;
    const [date, setDate] = React.useState<Date>();
    const [btnFocused, setBtnFocused] = React.useState<boolean>(false);
    const [datePickerOpen, setDatePickerOpen] = React.useState<boolean>(false);
    const id = React.useId();
    const btnRef = React.useRef<HTMLButtonElement>(null);

    React.useEffect(() => {
      defaultValue && setDate(defaultValue);
    }, [defaultValue]);

    // Fixed function to determine which dates should be disabled
    const getDisabledDates = React.useCallback(() => {
      return (dateToCheck: Date) => {
        const today = new Date();
        today.setHours(0, 0, 0, 0); // Reset time to start of day

        // Create a copy of the date to check and reset its time
        const checkDate = new Date(dateToCheck);
        checkDate.setHours(0, 0, 0, 0);

        // If disablePastDates is true, disable dates before today
        if (disablePastDates && checkDate < today) {
          return true;
        }

        // If minDate is provided, disable dates before minDate
        if (minDate) {
          const minDateCopy = new Date(minDate);
          minDateCopy.setHours(0, 0, 0, 0);

          if (checkDate < minDateCopy) {
            return true;
          }
        }

        return false;
      };
    }, [disablePastDates, minDate]);

    // Create a synthetic event for the onChange callback
    const createSyntheticEvent = (selectedDate: Date | undefined) => {
      const syntheticEvent = {
        target: {
          name: props.name || "",
          value: selectedDate ? selectedDate.toISOString() : "",
        },
      } as React.ChangeEvent<HTMLInputElement>;

      return syntheticEvent;
    };

    return (
      <Popover
        modal={false}
        onOpenChange={setDatePickerOpen}
        open={datePickerOpen}
      >
        <div className={cn(rootClassName)}>
          <div className="relative">
            <input
              onFocus={() => {
                setBtnFocused(true);
              }}
              onBlur={() => setBtnFocused(false)}
              type="text"
              id={id}
              className=" sr-only bottom-0 left-0"
              tabIndex={-1}
              aria-hidden="true"
              name={props.name}
              value={defaultValue?.toISOString() || date?.toISOString() || ""}
              onChange={() => {}}
              required={props.required}
              placeholder={
                typeof placeholder === "string" ? placeholder : undefined
              }
              title={label}
            />
            <PopoverTrigger asChild>
              <Button
                id={id}
                type="button"
                ref={ref ?? btnRef}
                variant={"outline"}
                onFocus={() => setBtnFocused(true)}
                onBlur={() => setBtnFocused(false)}
                className={cn(
                  "peer px-3 hover:bg-background  w-full justify-start text-left font-normal rounded-xl h-12 sm:h-12",
                  !date && "text-muted-foreground",
                  (error || warn) && "ring-2/ ring-offset-2/ border-2",
                  error &&
                    "[--ring:var(--destructive)] ring-destructive border-destructive",
                  warn && "[--ring:var(--warn)] ring-warn border-warn",
                  className
                )}
              >
                {date ? format(date, "PPP") : null}
                <div
                  className={cn(
                    " text-muted-foreground",
                    (datePickerOpen || btnFocused) && !date
                      ? " opacity-100"
                      : "hidden "
                  )}
                >
                  {placeholder}
                </div>
                <CalendarIcon className={"ml-auto h-4 w-4"} />
              </Button>
            </PopoverTrigger>
            <Label
              htmlFor={id}
              className={cn(
                "absolute  left-0 top-1/2 -translate-y-1/2 px-3 h-max transition-all ease-out duration-200  pointer-events-none ",
                (date || datePickerOpen || btnFocused) && inputActive,
                error && " !text-destructive",
                warn && " !text-warn",
                labelClassName
              )}
            >
              {label}
              {requiredStar && props.required && " *"}
            </Label>
          </div>
          <InputInfo info={info} warn={warn} error={error} />
        </div>
        <PopoverContent className="w-auto p-0">
          <Calendar
            mode="single"
            selected={date}
            onSelect={(selectedDate) => {
              setDate(selectedDate);
              setDatePickerOpen(false);

              // Call the onChange callback with a synthetic event
              if (onChange) {
                onChange(createSyntheticEvent(selectedDate));
              }
            }}
            disabled={getDisabledDates()}
            initialFocus
          />
        </PopoverContent>
      </Popover>
    );
  }
);

InputDatev2.displayName = "InputDatev2";

export default InputDatev2;
