// Workflow Configuration Types

export type WorkflowStepType =
  | "receptionist"
  | "sales"
  | "production-manager"
  | "stock-manager"
  | "department"
  | "worker"
  | "supervisor"
  | "daf"
  | "accountant"
  | "delivery"
  | "quality-control"
  | "custom";

export type WorkflowStepStatus = "pending" | "in-progress" | "completed" | "skipped" | "blocked";

export type ConditionOperator = "equals" | "not_equals" | "greater_than" | "less_than" | "contains";

export interface WorkflowCondition {
  id: string;
  field: string;
  operator: ConditionOperator;
  value: string | number | boolean;
}

export interface WorkflowAction {
  id: string;
  type: "generate_invoice" | "send_notification" | "authorize_delivery" | "send_reminder" | "assign_task" | "custom";
  target?: string;
  params?: Record<string, any>;
}

export interface WorkflowRule {
  id: string;
  name: string;
  description: string;
  conditions: WorkflowCondition[];
  conditionLogic: "AND" | "OR"; // How to combine multiple conditions
  actions: WorkflowAction[];
  enabled: boolean;
}

export interface WorkflowStepConfig {
  id: string;
  type: WorkflowStepType;
  name: string;
  description: string;
  order: number;
  enabled: boolean;
  required: boolean;
  roles: string[]; // Which roles can perform this step
  requiredFields: string[];
  optionalFields: string[];
  availableActions: string[];
  autoActions?: WorkflowAction[]; // Actions that happen automatically
  rules?: WorkflowRule[]; // Conditional logic for this step
  estimatedDuration?: number; // in hours
  canSkip?: boolean;
  skipConditions?: WorkflowCondition[];
}

export interface DepartmentWorkflowConfig {
  departmentId: string;
  departmentName: string;
  supervisorRequired: boolean;
  workerAssignmentRequired: boolean;
  qualityCheckRequired: boolean;
  materialRequestEnabled: boolean;
  timeTrackingRequired: boolean;
}

export interface WorkflowConfiguration {
  id: string;
  name: string;
  description: string;
  version: string;
  isDefault: boolean;
  steps: WorkflowStepConfig[];
  globalRules: WorkflowRule[];
  departmentConfigs: DepartmentWorkflowConfig[];
  createdAt: string;
  updatedAt: string;
  createdBy: string;
}

export interface JobWorkflowInstance {
  jobId: string;
  workflowConfigId: string;
  currentStepId: string;
  steps: {
    stepId: string;
    status: WorkflowStepStatus;
    assignedTo?: string;
    assignedRole?: string;
    startedAt?: string;
    completedAt?: string;
    completedBy?: string;
    notes?: string;
    data?: Record<string, any>;
  }[];
  history: {
    timestamp: string;
    stepId: string;
    action: string;
    performedBy: string;
    notes?: string;
  }[];
}

// Default Workflow Configuration
export const DEFAULT_WORKFLOW: WorkflowConfiguration = {
  id: "default-jts-workflow",
  name: "JTS Default Workflow",
  description: "Standard job processing workflow for JTS printing services",
  version: "1.0.0",
  isDefault: true,
  steps: [
    {
      id: "step-1-receptionist",
      type: "receptionist",
      name: "Customer Reception",
      description: "Receive customer and create initial job record",
      order: 1,
      enabled: true,
      required: true,
      roles: ["receptionist"],
      requiredFields: ["customerName", "contactInfo", "serviceType", "paymentMode"],
      optionalFields: ["deliveryAddress", "urgency", "specialInstructions"],
      availableActions: ["create_job", "record_payment", "schedule_visit"],
      autoActions: [
        {
          id: "notify-sales",
          type: "send_notification",
          target: "sales",
          params: { message: "New job created, awaiting quotation" },
        },
      ],
    },
    {
      id: "step-2-sales",
      type: "sales",
      name: "Sales & Quotation",
      description: "Create quotation and get client approval",
      order: 2,
      enabled: true,
      required: true,
      roles: ["sales", "sales-officer"],
      requiredFields: ["quotationAmount", "clientApproval"],
      optionalFields: ["discount", "paymentTerms", "deliveryDate"],
      availableActions: ["create_quotation", "edit_pricing", "approve_quotation"],
      autoActions: [
        {
          id: "generate-proforma",
          type: "generate_invoice",
          params: { type: "proforma" },
        },
      ],
      rules: [
        {
          id: "high-value-approval",
          name: "High Value Job Approval",
          description: "Jobs over 500,000 RWF require manager approval",
          conditions: [
            {
              id: "cond-1",
              field: "quotationAmount",
              operator: "greater_than",
              value: 500000,
            },
          ],
          conditionLogic: "AND",
          actions: [
            {
              id: "notify-manager",
              type: "send_notification",
              target: "sales-manager",
            },
          ],
          enabled: true,
        },
      ],
    },
    {
      id: "step-3-production-manager",
      type: "production-manager",
      name: "Production Planning",
      description: "Review job and assign to department",
      order: 3,
      enabled: true,
      required: true,
      roles: ["production-manager", "prodmanager"],
      requiredFields: ["assignedDepartment", "deadline"],
      optionalFields: ["priority", "estimatedDuration"],
      availableActions: ["assign_department", "set_deadline", "set_priority"],
      autoActions: [
        {
          id: "notify-stock",
          type: "send_notification",
          target: "stock-manager",
          params: { message: "Check material availability for new job" },
        },
      ],
    },
    {
      id: "step-4-stock",
      type: "stock-manager",
      name: "Material Management",
      description: "Check and allocate materials",
      order: 4,
      enabled: true,
      required: true,
      roles: ["stock-manager", "stock"],
      requiredFields: ["materialsAvailable"],
      optionalFields: ["materialsList", "estimatedCost"],
      availableActions: ["check_stock", "approve_request", "issue_materials"],
      rules: [
        {
          id: "low-stock-alert",
          name: "Low Stock Alert",
          description: "Alert if materials not available",
          conditions: [
            {
              id: "cond-2",
              field: "materialsAvailable",
              operator: "equals",
              value: false,
            },
          ],
          conditionLogic: "AND",
          actions: [
            {
              id: "pause-job",
              type: "custom",
              params: { action: "pause_job", reason: "Materials unavailable" },
            },
            {
              id: "notify-procurement",
              type: "send_notification",
              target: "procurement",
            },
          ],
          enabled: true,
        },
      ],
    },
    {
      id: "step-5-department",
      type: "department",
      name: "Department Processing",
      description: "Department receives and processes job",
      order: 5,
      enabled: true,
      required: true,
      roles: ["supervisor", "worker"],
      requiredFields: ["assignedWorker", "workStarted"],
      optionalFields: ["qualityCheck", "notes"],
      availableActions: ["assign_worker", "start_work", "request_materials", "complete_work"],
      autoActions: [
        {
          id: "notify-supervisor",
          type: "send_notification",
          target: "supervisor",
          params: { message: "New job assigned to department" },
        },
      ],
    },
    {
      id: "step-5a-worker",
      type: "worker",
      name: "Worker Execution",
      description: "Worker performs the actual work",
      order: 5.5,
      enabled: true,
      required: true,
      roles: ["worker"],
      requiredFields: ["timeLogStarted", "workCompleted"],
      optionalFields: ["materialUsed", "issues", "photos"],
      availableActions: ["start_task", "log_time", "request_materials", "report_issue", "complete_task"],
      autoActions: [
        {
          id: "notify-supervisor-complete",
          type: "send_notification",
          target: "supervisor",
          params: { message: "Worker completed task" },
        },
      ],
    },
    {
      id: "step-6-daf",
      type: "daf",
      name: "Financial Approval",
      description: "DAF reviews and approves for invoicing",
      order: 6,
      enabled: true,
      required: false,
      roles: ["daf"],
      requiredFields: ["financialApproval"],
      optionalFields: ["adjustments", "notes"],
      availableActions: ["approve", "reject", "request_changes"],
      canSkip: true,
      skipConditions: [
        {
          id: "skip-low-value",
          field: "jobValue",
          operator: "less_than",
          value: 500000,
        },
      ],
    },
    {
      id: "step-7-accountant",
      type: "accountant",
      name: "Payment & Invoicing",
      description: "Process payment and generate invoice",
      order: 7,
      enabled: true,
      required: true,
      roles: ["accountant1", "accountant2", "accountant"],
      requiredFields: ["paymentStatus"],
      optionalFields: ["paymentMethod", "transactionId"],
      availableActions: ["record_payment", "generate_invoice", "authorize_delivery"],
      rules: [
        {
          id: "payment-invoice-rule",
          name: "Payment to Invoice",
          description: "Generate invoice when payment is received",
          conditions: [
            {
              id: "cond-3",
              field: "paymentStatus",
              operator: "equals",
              value: "paid",
            },
          ],
          conditionLogic: "AND",
          actions: [
            {
              id: "gen-invoice",
              type: "generate_invoice",
              params: { type: "final" },
            },
            {
              id: "auth-delivery",
              type: "authorize_delivery",
            },
          ],
          enabled: true,
        },
        {
          id: "payment-reminder-rule",
          name: "Payment Reminder",
          description: "Send reminder if payment not received",
          conditions: [
            {
              id: "cond-4",
              field: "paymentStatus",
              operator: "not_equals",
              value: "paid",
            },
          ],
          conditionLogic: "AND",
          actions: [
            {
              id: "send-reminder",
              type: "send_reminder",
              target: "customer",
            },
          ],
          enabled: true,
        },
      ],
    },
    {
      id: "step-8-delivery",
      type: "delivery",
      name: "Delivery",
      description: "Deliver product to customer",
      order: 8,
      enabled: true,
      required: false,
      roles: ["receptionist", "delivery"],
      requiredFields: ["deliveryConfirmed"],
      optionalFields: ["deliveryDate", "receivedBy", "signature"],
      availableActions: ["confirm_delivery", "record_feedback"],
    },
  ],
  globalRules: [
    {
      id: "global-urgent-job",
      name: "Urgent Job Priority",
      description: "Urgent jobs get priority notifications",
      conditions: [
        {
          id: "cond-urgent",
          field: "urgency",
          operator: "equals",
          value: "urgent",
        },
      ],
      conditionLogic: "AND",
      actions: [
        {
          id: "notify-all",
          type: "send_notification",
          target: "all-stakeholders",
          params: { priority: "high" },
        },
      ],
      enabled: true,
    },
  ],
  departmentConfigs: [
    {
      departmentId: "dept-printing",
      departmentName: "Printing",
      supervisorRequired: true,
      workerAssignmentRequired: true,
      qualityCheckRequired: true,
      materialRequestEnabled: true,
      timeTrackingRequired: true,
    },
    {
      departmentId: "dept-binding",
      departmentName: "Binding",
      supervisorRequired: true,
      workerAssignmentRequired: true,
      qualityCheckRequired: true,
      materialRequestEnabled: true,
      timeTrackingRequired: true,
    },
    {
      departmentId: "dept-composition",
      departmentName: "Composition",
      supervisorRequired: true,
      workerAssignmentRequired: true,
      qualityCheckRequired: false,
      materialRequestEnabled: true,
      timeTrackingRequired: true,
    },
    {
      departmentId: "dept-packaging",
      departmentName: "Packaging",
      supervisorRequired: false,
      workerAssignmentRequired: true,
      qualityCheckRequired: false,
      materialRequestEnabled: true,
      timeTrackingRequired: true,
    },
    {
      departmentId: "dept-montage",
      departmentName: "Montage",
      supervisorRequired: true,
      workerAssignmentRequired: true,
      qualityCheckRequired: true,
      materialRequestEnabled: true,
      timeTrackingRequired: true,
    },
  ],
  createdAt: new Date().toISOString(),
  updatedAt: new Date().toISOString(),
  createdBy: "system",
};
