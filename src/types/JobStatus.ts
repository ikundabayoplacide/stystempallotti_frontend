// Job Status Types - 11 statuses as per JTS document
export type JobStatus =
  | "received"              // 1. Reception receives job
  | "quotation-completed"   // 2. Sales completes quotation
  | "approved"              // 3. Client/Sales approves
  | "paid"                  // 4. Finance confirms payment
  | "in-production"         // 5. Production Manager assigns
  | "in-composition"        // 6. Composition department working
  | "in-printing"           // 7. Printing department working
  | "in-binding"            // 8. Binding department working
  | "in-packaging"          // 9. Packaging department working
  | "completed"             // 10. All production done
  | "delivered";            // 11. Delivered to client

export const jobStatusConfig: Record<
  JobStatus,
  { label: string; color: string; bgColor: string; description: string }
> = {
  received: {
    label: "Received",
    color: "text-blue-600",
    bgColor: "bg-blue-100",
    description: "Job received at reception",
  },
  "quotation-completed": {
    label: "Quotation Completed",
    color: "text-purple-600",
    bgColor: "bg-purple-100",
    description: "Quotation prepared by sales",
  },
  approved: {
    label: "Approved",
    color: "text-indigo-600",
    bgColor: "bg-indigo-100",
    description: "Quotation approved by client",
  },
  paid: {
    label: "Paid",
    color: "text-green-600",
    bgColor: "bg-green-100",
    description: "Payment confirmed by finance",
  },
  "in-production": {
    label: "In Production",
    color: "text-yellow-600",
    bgColor: "bg-yellow-100",
    description: "Assigned to production manager",
  },
  "in-composition": {
    label: "In Composition",
    color: "text-orange-600",
    bgColor: "bg-orange-100",
    description: "Design & layout in progress",
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
  completed: {
    label: "Completed",
    color: "text-green-700",
    bgColor: "bg-green-200",
    description: "All production completed",
  },
  delivered: {
    label: "Delivered",
    color: "text-gray-600",
    bgColor: "bg-gray-200",
    description: "Delivered to client",
  },
};

// Status flow - defines which status can transition to which
export const statusFlow: Record<JobStatus, JobStatus[]> = {
  received: ["quotation-completed"],
  "quotation-completed": ["approved"],
  approved: ["paid"],
  paid: ["in-production"],
  "in-production": ["in-composition", "in-printing", "in-binding", "in-packaging"],
  "in-composition": ["in-printing"],
  "in-printing": ["in-binding"],
  "in-binding": ["in-packaging"],
  "in-packaging": ["completed"],
  completed: ["delivered"],
  delivered: [],
};

// Get next possible statuses for a given status
export const getNextStatuses = (currentStatus: JobStatus): JobStatus[] => {
  return statusFlow[currentStatus] || [];
};

// Check if a status transition is valid
export const isValidTransition = (from: JobStatus, to: JobStatus): boolean => {
  return statusFlow[from]?.includes(to) || false;
};

// Get status by department
export const getStatusByDepartment = (department: string): JobStatus | null => {
  const departmentStatusMap: Record<string, JobStatus> = {
    composition: "in-composition",
    montage: "in-composition", // Montage is part of composition/prepress
    printing: "in-printing",
    binding: "in-binding",
    packaging: "in-packaging",
  };
  return departmentStatusMap[department.toLowerCase()] || null;
};
