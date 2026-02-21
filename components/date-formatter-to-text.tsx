import { DATE_FORMAT_DEFAULTS } from "@/lib/date-config";
import {
  formatHumanDate,
  formatShortDate,
  formatLongDate,
  formatTime,
} from "@/lib/format-date";

interface DateFormatterToTextProps {
  date?: string | Date | null;
  prefix?: string;
  className?: string;
  mode?: "date" | "time" | "datetime";
  display?: "human" | "short" | "long";
}

export default function DateFormatterToText({
  date,
  prefix = "",
  className = "",
  mode = DATE_FORMAT_DEFAULTS.mode,
  display = DATE_FORMAT_DEFAULTS.display,
}: DateFormatterToTextProps) {
  let formatted = "";

  if (mode === "date") {
    if (display === "short") formatted = formatShortDate(date);
    else if (display === "long") formatted = formatLongDate(date);
    else formatted = formatHumanDate(date);
  } else if (mode === "time") {
    formatted = formatTime(date);
  } else if (mode === "datetime") {
    const datePart =
      display === "short"
        ? formatShortDate(date)
        : display === "long"
        ? formatLongDate(date)
        : formatHumanDate(date);

    const timePart = formatTime(date);
    if (datePart && timePart) formatted = `${datePart} at ${timePart}`;
    else formatted = datePart || timePart;
  }

  if (!formatted) return null;

  return (
    <p className={className}>{prefix ? `${prefix} ${formatted}` : formatted}</p>
  );
}
