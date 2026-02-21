export enum Status {
  Completed = "COMPLETED",
  Scheduled = "SCHEDULED",
  Cancelled = "CANCELLED",
  Accepted = "ACCEPTED",
  Declined = "DECLINED",
  Pending = "PENDING",
  InProgress = "IN_PROGRESS",
}

export const statusConfig: Record<Status, { label: string; color: string }> = {
  [Status.Completed]: { label: "Completed", color: "#39BD78" }, // success green
  [Status.Cancelled]: { label: "Cancelled", color: "#D34646" }, // error red
  [Status.Scheduled]: { label: "Scheduled", color: "#3B82F6" }, // info blue
  [Status.Accepted]: { label: "Accepted", color: "#F59E0B" }, // amber
  [Status.Declined]: { label: "Declined", color: "#6B7280" }, // gray
  [Status.Pending]: { label: "Pending", color: "#EAB308" }, // yellow
  [Status.InProgress]: { label: "In Progress", color: "#06B6D4" }, // cyan
};
