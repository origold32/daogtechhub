export function formatShortDate(date?: string | Date | null): string {
  if (!date) return "";
  const dt = typeof date === "string" ? new Date(date) : date;
  if (isNaN(dt.getTime())) return "";
  return dt.toLocaleDateString("en-GB"); // e.g., 10/08/2002
}

export function formatLongDate(date?: string | Date | null): string {
  if (!date) return "";
  const dt = typeof date === "string" ? new Date(date) : date;
  if (isNaN(dt.getTime())) return "";
  return dt.toLocaleDateString("en-GB", {
    day: "numeric",
    month: "long", // e.g., August
    year: "numeric",
  }); // e.g., 10 August 2002
}

export function formatHumanDate(date?: string | Date | null): string {
  if (!date) return "";
  const dt = typeof date === "string" ? new Date(date) : date;
  if (isNaN(dt.getTime())) return "";

  const day = dt.getDate();
  const month = dt.toLocaleString("en-GB", { month: "short" }); // e.g., "Jun"
  const year = dt.getFullYear();

  const getSuffix = (d: number) => {
    if (d > 3 && d < 21) return "th";
    switch (d % 10) {
      case 1:
        return "st";
      case 2:
        return "nd";
      case 3:
        return "rd";
      default:
        return "th";
    }
  };

  return `${day}${getSuffix(day)} ${month}. ${year}`;
}

export function formatTime(date?: string | Date | null): string {
  if (!date) return "";
  const dt = typeof date === "string" ? new Date(date) : date;
  if (isNaN(dt.getTime())) return "";

  return dt.toLocaleTimeString("en-US", {
    hour: "numeric",
    minute: "2-digit",
    hour12: true,
  });
}

export function formatFullDateTime(date?: string | Date | null): string {
  const datePart = formatHumanDate(date);
  const timePart = formatTime(date);
  if (!datePart && !timePart) return "";
  if (datePart && timePart) return `${datePart} at ${timePart}`;
  return datePart || timePart;
}
