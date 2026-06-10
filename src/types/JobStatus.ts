// Backend statuses — must match /api/jobs exactly
export type JobStatus =
  | "pending"
  | "confirmed"
  | "in-composition"
  | "in-montage"
  | "in-printing"
  | "in-binding"
  | "in-packaging"
  | "quality-check"
  | "ready-for-delivery"
  | "delivered"
  | "completed"
  | "rejected";

export const jobStatusConfig: Record<
  JobStatus,
  { label: string; color: string; bgColor: string; description: string }
> = {
  pending: {
    label: "Pending",
    color: "text-yellow-700",
    bgColor: "bg-yellow-100",
    description: "Awaiting supervisor approval",
  },
  confirmed: {
    label: "Confirmed",
    color: "text-indigo-600",
    bgColor: "bg-indigo-100",
    description: "Approved and ready for production",
  },
  "in-composition": {
    label: "In Composition",
    color: "text-orange-600",
    bgColor: "bg-orange-100",
    description: "Design & layout in progress",
  },
  "in-montage": {
    label: "In Montage",
    color: "text-amber-600",
    bgColor: "bg-amber-100",
    description: "Montage in progress",
  },
  "in-printing": {
    label: "In Printing",
    color: "text-pink-600",
    bgColor: "bg-pink-100",
    description: "Printing in progress",
  },
  "in-binding": {
    label: "In Binding",
    color: "text-teal-600",
    bgColor: "bg-teal-100",
    description: "Binding in progress",
  },
  "in-packaging": {
    label: "In Packaging",
    color: "text-cyan-600",
    bgColor: "bg-cyan-100",
    description: "Packaging in progress",
  },
  "quality-check": {
    label: "Quality Check",
    color: "text-purple-600",
    bgColor: "bg-purple-100",
    description: "Quality inspection",
  },
  "ready-for-delivery": {
    label: "Ready for Delivery",
    color: "text-blue-600",
    bgColor: "bg-blue-100",
    description: "Ready to be delivered",
  },
  delivered: {
    label: "Delivered",
    color: "text-green-600",
    bgColor: "bg-green-100",
    description: "Delivered to client",
  },
  completed: {
    label: "Completed",
    color: "text-green-700",
    bgColor: "bg-green-200",
    description: "All production completed",
  },
  rejected: {
    label: "Rejected",
    color: "text-red-600",
    bgColor: "bg-red-100",
    description: "Job rejected",
  },
};

// Status flow — next valid statuses per current status
export const statusFlow: Record<JobStatus, JobStatus[]> = {
  pending:              ["confirmed", "rejected"],
  confirmed:            ["in-composition", "rejected"],
  "in-composition":     ["in-montage"],
  "in-montage":         ["in-printing"],
  "in-printing":        ["in-binding"],
  "in-binding":         ["in-packaging"],
  "in-packaging":       ["quality-check"],
  "quality-check":      ["ready-for-delivery"],
  "ready-for-delivery": ["delivered"],
  delivered:            ["completed"],
  completed:            [],
  rejected:             [],
};

export const getNextStatuses = (currentStatus: JobStatus): JobStatus[] =>
  statusFlow[currentStatus] ?? [];

export const isValidTransition = (from: JobStatus, to: JobStatus): boolean =>
  statusFlow[from]?.includes(to) ?? false;

export const getStatusByDepartment = (department: string): JobStatus | null => {
  const map: Record<string, JobStatus> = {
    composition: "in-composition",
    montage:     "in-montage",
    printing:    "in-printing",
    binding:     "in-binding",
    packaging:   "in-packaging",
  };
  return map[department.toLowerCase()] ?? null;
};
