// UI Permissions and Dashboard Configuration Types

export type DashboardWidget =
  | "jobs-in-progress"
  | "completed-today"
  | "delayed-jobs"
  | "revenue"
  | "payments-received"
  | "outstanding"
  | "department-breakdown"
  | "low-stock-alerts"
  | "outstanding-balances"
  | "delayed-jobs-tracker"
  | "bottleneck-detection"
  | "performance-metrics"
  | "client-overview"
  | "upcoming-deadlines"
  | "recent-activity"
  | "active-staff"
  | "recent-jobs-table"
  | "my-tasks"
  | "time-logs"
  | "material-requests"
  | "team-performance"
  | "quotations-summary"
  | "invoices-summary"
  | "stock-levels"
  | "custom";

export type SidebarMenuItem = {
  id: string;
  label: string;
  path: string;
  icon: string;
  enabled: boolean;
  order: number;
  badge?: string;
  children?: SidebarMenuItem[];
};

export type PageAction =
  | "view"
  | "create"
  | "edit"
  | "delete"
  | "approve"
  | "reject"
  | "export"
  | "print"
  | "assign"
  | "reassign"
  | "cancel";

export interface DetailedPermission {
  id: string;
  question: string;
  description?: string;
  enabled: boolean;
  category?: string;
}

export interface PagePermissions {
  pageId: string;
  pageName: string;
  enabled: boolean;
  allowedActions: PageAction[];
  detailedPermissions?: DetailedPermission[]; // New detailed permissions
  dataFilters?: {
    ownDataOnly?: boolean;
    departmentOnly?: boolean;
    customFilter?: string;
  };
}

export interface DashboardWidgetConfig {
  widgetId: DashboardWidget;
  widgetName: string;
  enabled: boolean;
  order: number;
  size?: "small" | "medium" | "large" | "full-width";
  refreshInterval?: number; // in seconds
  customSettings?: Record<string, any>;
}

export interface RoleUIConfiguration {
  roleId: string;
  roleName: string;
  description: string;
  
  // Dashboard Configuration
  dashboardWidgets: DashboardWidgetConfig[];
  
  // Sidebar Menu Configuration
  sidebarMenu: SidebarMenuItem[];
  
  // Page Permissions
  pagePermissions: PagePermissions[];
  
  // General UI Settings
  uiSettings: {
    theme?: "light" | "dark" | "auto";
    compactMode?: boolean;
    showNotifications?: boolean;
    showHelp?: boolean;
    defaultLandingPage?: string;
  };
}

export interface UIPermissionsConfiguration {
  id: string;
  version: string;
  roles: RoleUIConfiguration[];
  createdAt: string;
  updatedAt: string;
}

// Default UI Permissions Configuration
export const DEFAULT_UI_PERMISSIONS: UIPermissionsConfiguration = {
  id: "default-ui-permissions",
  version: "1.8.0",
  roles: [
    {
      roleId: "admin",
      roleName: "Administrator",
      description: "Full system access",
      dashboardWidgets: [
        { widgetId: "jobs-in-progress", widgetName: "Jobs In Progress", enabled: true, order: 1, size: "small" },
        { widgetId: "completed-today", widgetName: "Completed Today", enabled: true, order: 2, size: "small" },
        { widgetId: "delayed-jobs", widgetName: "Delayed Jobs", enabled: true, order: 3, size: "small" },
        { widgetId: "revenue", widgetName: "Revenue", enabled: true, order: 4, size: "small" },
        { widgetId: "payments-received", widgetName: "Payments Received", enabled: true, order: 5, size: "small" },
        { widgetId: "outstanding", widgetName: "Outstanding", enabled: true, order: 6, size: "small" },
        { widgetId: "department-breakdown", widgetName: "Department Breakdown", enabled: true, order: 7, size: "medium" },
        { widgetId: "low-stock-alerts", widgetName: "Low Stock Alerts", enabled: true, order: 8, size: "medium" },
        { widgetId: "outstanding-balances", widgetName: "Outstanding Balances", enabled: true, order: 9, size: "medium" },
        { widgetId: "delayed-jobs-tracker", widgetName: "Delayed Jobs Tracker", enabled: true, order: 10, size: "large" },
        { widgetId: "bottleneck-detection", widgetName: "Bottleneck Detection", enabled: true, order: 11, size: "large" },
        { widgetId: "performance-metrics", widgetName: "Performance Metrics", enabled: true, order: 12, size: "medium" },
        { widgetId: "client-overview", widgetName: "Client Overview", enabled: true, order: 13, size: "medium" },
        { widgetId: "upcoming-deadlines", widgetName: "Upcoming Deadlines", enabled: true, order: 14, size: "medium" },
        { widgetId: "recent-activity", widgetName: "Recent Activity", enabled: true, order: 15, size: "large" },
        { widgetId: "active-staff", widgetName: "Active Staff", enabled: true, order: 16, size: "large" },
        { widgetId: "recent-jobs-table", widgetName: "Recent Jobs", enabled: true, order: 17, size: "full-width" },
      ],
      sidebarMenu: [
        { id: "dashboard", label: "Dashboard", path: "/admin", icon: "HiOutlineHome", enabled: true, order: 1 },
        { id: "users", label: "Users", path: "/admin/users", icon: "HiOutlineUsers", enabled: true, order: 2 },
        { id: "customers", label: "Customers", path: "/admin/customers", icon: "HiOutlineUserGroup", enabled: true, order: 3 },
        { id: "jobs", label: "Jobs", path: "/admin/jobs", icon: "HiOutlineClipboardList", enabled: true, order: 4 },
        { id: "departments", label: "Departments", path: "/admin/departments", icon: "HiOutlineUsers", enabled: true, order: 5 },
        { id: "production", label: "Production", path: "/admin/production", icon: "HiOutlineCube", enabled: true, order: 6 },
        { id: "sales", label: "Sales", path: "/admin/sales", icon: "HiOutlineBriefcase", enabled: true, order: 7 },
        { id: "finance", label: "Finance", path: "/admin/finance", icon: "HiOutlineCurrencyDollar", enabled: true, order: 8 },
        { id: "stock", label: "Stock", path: "/admin/stock", icon: "HiOutlineArchive", enabled: true, order: 9 },
        { id: "reports", label: "Reports", path: "/admin/reports", icon: "HiOutlineChartBar", enabled: true, order: 10 },
        { id: "view-reports", label: "View Reports", path: "/admin/reports/view", icon: "HiOutlineDocumentText", enabled: true, order: 11 },
        { id: "workflow", label: "Workflow Config", path: "/admin/workflow", icon: "HiOutlineAdjustments", enabled: true, order: 12 },
        { id: "ui-permissions", label: "UI Permissions", path: "/admin/ui-permissions", icon: "HiOutlineViewGrid", enabled: true, order: 13 },
        { id: "settings", label: "Settings", path: "/admin/settings", icon: "HiOutlineCog", enabled: true, order: 14 },
      ],
      pagePermissions: [
        { 
          pageId: "users", 
          pageName: "User Management", 
          enabled: true, 
          allowedActions: ["view", "create", "edit", "delete"],
          detailedPermissions: [
            { id: "view-all-users", question: "Allow viewing all users in the system", enabled: true },
            { id: "create-admin-users", question: "Allow creating admin users", enabled: true },
            { id: "delete-users", question: "Allow deleting user accounts", enabled: true },
            { id: "reset-passwords", question: "Allow resetting user passwords", enabled: true },
          ]
        },
        { 
          pageId: "jobs", 
          pageName: "Job Management", 
          enabled: true, 
          allowedActions: ["view", "create", "edit", "delete", "assign"],
          detailedPermissions: [
            { id: "view-all-jobs", question: "Allow viewing all jobs regardless of assignment", enabled: true },
            { id: "edit-completed-jobs", question: "Allow editing jobs after completion", enabled: false },
            { id: "delete-jobs", question: "Allow deleting jobs with active work", enabled: false },
            { id: "override-deadlines", question: "Allow overriding job deadlines", enabled: true },
          ]
        },
        { 
          pageId: "reports", 
          pageName: "Reports", 
          enabled: true, 
          allowedActions: ["view", "create", "export"],
          detailedPermissions: [
            { id: "view-financial-reports", question: "Allow viewing financial reports", enabled: true },
            { id: "export-sensitive-data", question: "Allow exporting reports with sensitive data", enabled: true },
            { id: "schedule-reports", question: "Allow scheduling automated reports", enabled: true },
          ]
        },
      ],
      uiSettings: {
        theme: "auto",
        compactMode: false,
        showNotifications: true,
        showHelp: true,
        defaultLandingPage: "/admin",
      },
    },
    {
      roleId: "receptionist",
      roleName: "Receptionist",
      description: "Customer reception and job creation",
      dashboardWidgets: [
        { widgetId: "jobs-in-progress", widgetName: "Jobs In Progress", enabled: true, order: 1, size: "small" },
        { widgetId: "completed-today", widgetName: "Completed Today", enabled: true, order: 2, size: "small" },
        { widgetId: "recent-activity", widgetName: "Recent Activity", enabled: true, order: 3, size: "medium" },
        { widgetId: "upcoming-deadlines", widgetName: "Upcoming Deadlines", enabled: true, order: 4, size: "medium" },
      ],
      sidebarMenu: [
        { id: "dashboard", label: "Dashboard", path: "/reception", icon: "HiOutlineHome", enabled: true, order: 1 },
        { id: "visitor", label: "Visitor", path: "/reception/visitor", icon: "HiOutlineClipboardList", enabled: true, order: 2 },
        { id: "payments", label: "Payments", path: "/reception/payments", icon: "HiOutlineCurrencyDollar", enabled: true, order: 3 },
        { id: "tasks", label: "Task Assignment", path: "/reception/tasks", icon: "HiOutlineClipboardCheck", enabled: false, order: 4 },
        { id: "deliveries", label: "Deliveries", path: "/reception/deliveries", icon: "HiOutlineTruck", enabled: true, order: 5 },
        { id: "boutique", label: "Boutique", path: "/reception/boutique", icon: "HiOutlineShoppingBag", enabled: true, order: 6 },
      ],
      pagePermissions: [
        { pageId: "visitor", pageName: "Visitor", enabled: true, allowedActions: ["view", "create"] },
        { pageId: "payments", pageName: "Payments", enabled: true, allowedActions: ["view", "create"] },
        { pageId: "tasks", pageName: "Tasks", enabled: true, allowedActions: ["view", "assign"] },
        { pageId: "deliveries", pageName: "Deliveries", enabled: true, allowedActions: ["view", "edit"] },
        { pageId: "boutique", pageName: "Boutique", enabled: true, allowedActions: ["view"] },
      ],
      uiSettings: {
        showNotifications: true,
        showHelp: true,
        defaultLandingPage: "/reception",
      },
    },
    {
      roleId: "worker",
      roleName: "Worker",
      description: "Department worker",
      dashboardWidgets: [
        { widgetId: "my-tasks", widgetName: "My Tasks", enabled: true, order: 1, size: "medium" },
        { widgetId: "time-logs", widgetName: "Time Logs", enabled: true, order: 2, size: "small" },
        { widgetId: "material-requests", widgetName: "Material Requests", enabled: true, order: 3, size: "small" },
        { widgetId: "performance-metrics", widgetName: "My Performance", enabled: true, order: 4, size: "medium" },
      ],
      sidebarMenu: [
        { id: "dashboard", label: "Dashboard", path: "/worker", icon: "HiOutlineHome", enabled: true, order: 1 },
        { id: "tasks", label: "My Tasks", path: "/worker/tasks", icon: "HiOutlineClipboardList", enabled: true, order: 2 },
        { id: "time-logs", label: "Time Logs", path: "/worker/time-logs", icon: "HiOutlineClock", enabled: true, order: 3 },
        { id: "material-requests", label: "Material Requests", path: "/worker/materials", icon: "HiOutlineCube", enabled: true, order: 4 },
        { id: "reports", label: "My Reports", path: "/worker/reports", icon: "HiOutlineDocumentText", enabled: false, order: 5 },
        { id: "stats", label: "Statistics", path: "/worker/stats", icon: "HiOutlineChartBar", enabled: false, order: 6 },
      ],
      pagePermissions: [
        { 
          pageId: "tasks", 
          pageName: "Tasks", 
          enabled: true, 
          allowedActions: ["view", "edit"],
          dataFilters: { ownDataOnly: true }
        },
        { 
          pageId: "time-logs", 
          pageName: "Time Logs", 
          enabled: true, 
          allowedActions: ["view", "create"],
          dataFilters: { ownDataOnly: true }
        },
        { 
          pageId: "material-requests", 
          pageName: "Material Requests", 
          enabled: true, 
          allowedActions: ["view", "create"],
          dataFilters: { ownDataOnly: true }
        },
      ],
      uiSettings: {
        compactMode: true,
        showNotifications: true,
        showHelp: true,
        defaultLandingPage: "/worker",
      },
    },
    {
      roleId: "accountant",
      roleName: "Accountant",
      description: "Financial management: invoices, payments, procurement, recovery, and taxes",
      dashboardWidgets: [
        { widgetId: "revenue", widgetName: "Revenue", enabled: true, order: 1, size: "small" },
        { widgetId: "payments-received", widgetName: "Payments Received", enabled: true, order: 2, size: "small" },
        { widgetId: "outstanding", widgetName: "Outstanding", enabled: true, order: 3, size: "small" },
        { widgetId: "outstanding-balances", widgetName: "Outstanding Balances", enabled: true, order: 4, size: "medium" },
        { widgetId: "recent-activity", widgetName: "Recent Activity", enabled: true, order: 5, size: "medium" },
        { widgetId: "invoices-summary", widgetName: "Invoices Summary", enabled: true, order: 6, size: "large" },
      ],
      sidebarMenu: [
        { id: "dashboard", label: "Dashboard", path: "/finance/accountant1", icon: "HiOutlineHome", enabled: true, order: 1 },
        { id: "invoices", label: "Invoices", path: "/finance/accountant1/invoices", icon: "HiOutlineDocumentText", enabled: true, order: 2 },
        { id: "payments", label: "Payments", path: "/finance/accountant1/payments", icon: "HiOutlineCurrencyDollar", enabled: true, order: 3 },
        { id: "documents", label: "Documents", path: "/finance/accountant1/documents", icon: "HiOutlineFolder", enabled: true, order: 4 },
        { id: "procurement", label: "Procurement", path: "/finance/accountant2/procurement", icon: "HiOutlineShoppingCart", enabled: true, order: 5 },
        { id: "recovery", label: "Recovery", path: "/finance/accountant2/recovery", icon: "HiOutlineRefresh", enabled: true, order: 6 },
        { id: "taxes", label: "Taxes", path: "/finance/accountant2/taxes", icon: "HiOutlineCalculator", enabled: true, order: 7 },
        { id: "payment-confirmation", label: "Payment Confirmation", path: "/finance/accountant2/payment-confirmation", icon: "HiOutlineCheckCircle", enabled: false, order: 8 },
      ],
      pagePermissions: [
        { pageId: "invoices", pageName: "Invoices", enabled: true, allowedActions: ["view", "create", "edit", "export"] },
        { pageId: "payments", pageName: "Payments", enabled: true, allowedActions: ["view", "create", "edit"] },
        { pageId: "documents", pageName: "Documents", enabled: true, allowedActions: ["view", "export"] },
        { pageId: "procurement", pageName: "Procurement", enabled: true, allowedActions: ["view", "create", "edit"] },
        { pageId: "recovery", pageName: "Recovery", enabled: true, allowedActions: ["view", "create", "edit"] },
        { pageId: "taxes", pageName: "Taxes", enabled: true, allowedActions: ["view", "create", "edit", "export"] },
        { pageId: "payment-confirmation", pageName: "Payment Confirmation", enabled: true, allowedActions: ["view", "approve"] },
      ],
      uiSettings: {
        showNotifications: true,
        showHelp: true,
        defaultLandingPage: "/finance/accountant1",
      },
    },
    {
      roleId: "production-manager",
      roleName: "Production Manager",
      description: "Production planning and oversight",
      dashboardWidgets: [
        { widgetId: "jobs-in-progress", widgetName: "Jobs In Progress", enabled: true, order: 1, size: "small" },
        { widgetId: "delayed-jobs", widgetName: "Delayed Jobs", enabled: true, order: 2, size: "small" },
        { widgetId: "department-breakdown", widgetName: "Department Performance", enabled: true, order: 3, size: "medium" },
        { widgetId: "bottleneck-detection", widgetName: "Bottleneck Detection", enabled: true, order: 4, size: "large" },
        { widgetId: "team-performance", widgetName: "Team Performance", enabled: true, order: 5, size: "medium" },
      ],
      sidebarMenu: [
        { id: "dashboard", label: "Dashboard", path: "/production-manager", icon: "HiOutlineHome", enabled: true, order: 1 },
        { id: "job-assignment", label: "Job Assignment", path: "/production-manager/planning", icon: "HiOutlineClipboardList", enabled: true, order: 2 },
        { id: "departments", label: "Departments", path: "/production-manager/departments", icon: "HiOutlineCube", enabled: true, order: 3 },
        { id: "progress", label: "Progress", path: "/production-manager/progress", icon: "HiOutlineChartBar", enabled: true, order: 4 },
      ],
      pagePermissions: [
        { pageId: "job-assignment", pageName: "Job Assignment", enabled: true, allowedActions: ["view", "assign", "reassign"] },
        { pageId: "departments", pageName: "Departments", enabled: true, allowedActions: ["view", "edit"] },
        { pageId: "progress", pageName: "Progress", enabled: true, allowedActions: ["view"] },
      ],
      uiSettings: {
        showNotifications: true,
        showHelp: true,
        defaultLandingPage: "/production-manager",
      },
    },
    {
      roleId: "sales",
      roleName: "Sales Representative",
      description: "Sales and client management",
      dashboardWidgets: [
        { widgetId: "quotations-summary", widgetName: "Quotations", enabled: true, order: 1, size: "medium" },
        { widgetId: "client-overview", widgetName: "Client Overview", enabled: true, order: 2, size: "medium" },
        { widgetId: "revenue", widgetName: "Revenue", enabled: true, order: 3, size: "small" },
        { widgetId: "recent-activity", widgetName: "Recent Activity", enabled: true, order: 4, size: "medium" },
        { widgetId: "upcoming-deadlines", widgetName: "Upcoming Deadlines", enabled: true, order: 5, size: "medium" },
      ],
      sidebarMenu: [
        { id: "dashboard",    label: "Dashboard",         path: "/sales",             icon: "HiOutlineHome",           enabled: true,  order: 1 },
        { id: "jobs",         label: "Jobs",              path: "/sales/jobs",         icon: "HiOutlineBriefcase",      enabled: true,  order: 2 },
        { id: "stocks",       label: "Stock",             path: "/sales/stocks",       icon: "HiOutlineArchive",        enabled: true,  order: 3 },
        { id: "quotations",   label: "Quotations",        path: "/sales/quotations",   icon: "HiOutlineDocumentText",   enabled: true,  order: 4 },
        { id: "proforma",     label: "Proforma Invoice",  path: "/sales/invoices",     icon: "HiOutlineClipboardList",  enabled: true,  order: 5 },
        { id: "dossier",      label: "Dossier",           path: "/sales/dossiers",     icon: "HiOutlineFolder",         enabled: true,  order: 6 },
        { id: "confirmation", label: "Client Confirmation", path: "/sales/confirmation", icon: "HiOutlineCheckCircle",  enabled: false, order: 7 },
      ],
      pagePermissions: [
        { pageId: "jobs", pageName: "Jobs", enabled: true, allowedActions: ["view", "create", "edit"] },
        { pageId: "quotations", pageName: "Quotations", enabled: true, allowedActions: ["view", "create", "edit", "export"] },
        { pageId: "proforma", pageName: "Proforma Invoice", enabled: true, allowedActions: ["view", "create", "edit"] },
        { pageId: "dossier", pageName: "Dossier", enabled: true, allowedActions: ["view", "create", "edit"] },
        { pageId: "stocks", pageName: "Stock", enabled: true, allowedActions: ["view"] },
      ],
      uiSettings: {
        showNotifications: true,
        showHelp: true,
        defaultLandingPage: "/sales",
      },
    },
    {
      roleId: "daf",
      roleName: "DAF (Finance Director)",
      description: "Financial oversight and approval",
      dashboardWidgets: [
        { widgetId: "revenue", widgetName: "Revenue", enabled: true, order: 1, size: "small" },
        { widgetId: "payments-received", widgetName: "Payments Received", enabled: true, order: 2, size: "small" },
        { widgetId: "outstanding", widgetName: "Outstanding", enabled: true, order: 3, size: "small" },
        { widgetId: "outstanding-balances", widgetName: "Outstanding Balances", enabled: true, order: 4, size: "medium" },
        { widgetId: "performance-metrics", widgetName: "Financial Performance", enabled: true, order: 5, size: "large" },
        { widgetId: "recent-activity", widgetName: "Recent Activity", enabled: true, order: 6, size: "medium" },
      ],
      sidebarMenu: [
        { id: "dashboard", label: "Dashboard", path: "/finance/daf", icon: "HiOutlineHome", enabled: true, order: 1 },
        { id: "job-approvals", label: "Job Approvals", path: "/finance/daf/approvals", icon: "HiOutlineCheckCircle", enabled: true, order: 2 },
        { id: "reports", label: "Financial Reports", path: "/finance/daf/reports", icon: "HiOutlineChartBar", enabled: true, order: 3 },
        { id: "finance-control", label: "Finance Control", path: "/finance/daf/control", icon: "HiOutlineShieldCheck", enabled: true, order: 4 },
        { id: "hr", label: "HR Management", path: "/finance/daf/hr", icon: "HiOutlineUsers", enabled: true, order: 5 },
      ],
      pagePermissions: [
        { pageId: "job-approvals", pageName: "Job Approvals", enabled: true, allowedActions: ["view", "approve", "reject"] },
        { pageId: "reports", pageName: "Financial Reports", enabled: true, allowedActions: ["view", "export", "approve"] },
        { pageId: "finance-control", pageName: "Finance Control", enabled: true, allowedActions: ["view", "approve", "reject"] },
        { pageId: "hr", pageName: "HR Management", enabled: true, allowedActions: ["view", "edit"] },
      ],
      uiSettings: {
        showNotifications: true,
        showHelp: true,
        defaultLandingPage: "/finance/daf",
      },
    },
    {
      roleId: "stock",
      roleName: "Stock Manager",
      description: "Inventory and supplier management",
      dashboardWidgets: [
        { widgetId: "stock-levels", widgetName: "Stock Levels", enabled: true, order: 1, size: "medium" },
        { widgetId: "low-stock-alerts", widgetName: "Low Stock Alerts", enabled: true, order: 2, size: "medium" },
        { widgetId: "material-requests", widgetName: "Material Requests", enabled: true, order: 3, size: "medium" },
        { widgetId: "recent-activity", widgetName: "Recent Activity", enabled: true, order: 4, size: "medium" },
      ],
      sidebarMenu: [
        { id: "dashboard", label: "Dashboard", path: "/stock", icon: "HiOutlineHome", enabled: true, order: 1 },
        { id: "inventory", label: "Inventory", path: "/stock/inventory", icon: "HiOutlineArchive", enabled: true, order: 2 },
        { id: "material-requests", label: "Material Requests", path: "/stock/requests", icon: "HiOutlineClipboardList", enabled: true, order: 3 },
        { id: "suppliers", label: "Suppliers", path: "/stock/suppliers", icon: "HiOutlineTruck", enabled: true, order: 4 },
      ],
      pagePermissions: [
        { pageId: "inventory", pageName: "Inventory", enabled: true, allowedActions: ["view", "create", "edit"] },
        { pageId: "material-requests", pageName: "Material Requests", enabled: true, allowedActions: ["view", "approve", "reject"] },
        { pageId: "suppliers", pageName: "Suppliers", enabled: true, allowedActions: ["view", "create", "edit"] },
      ],
      uiSettings: {
        showNotifications: true,
        showHelp: true,
        defaultLandingPage: "/stock",
      },
    },
    {
      roleId: "supervisor",
      roleName: "Supervisor",
      description: "Team supervision and quality control",
      dashboardWidgets: [
        { widgetId: "team-performance", widgetName: "Team Performance", enabled: true, order: 1, size: "medium" },
        { widgetId: "jobs-in-progress", widgetName: "Jobs In Progress", enabled: true, order: 2, size: "small" },
        { widgetId: "delayed-jobs", widgetName: "Delayed Jobs", enabled: true, order: 3, size: "small" },
        { widgetId: "recent-activity", widgetName: "Recent Activity", enabled: true, order: 4, size: "medium" },
      ],
      sidebarMenu: [
        { id: "dashboard", label: "Dashboard", path: "/supervisor", icon: "HiOutlineHome", enabled: true, order: 1 },
        { id: "teams", label: "Teams", path: "/supervisor/teams", icon: "HiOutlineUsers", enabled: true, order: 2 },
        { id: "workers", label: "Worker Management", path: "/supervisor/workers", icon: "HiOutlineUserGroup", enabled: true, order: 3 },
        { id: "production", label: "Production", path: "/supervisor/production", icon: "HiOutlineCube", enabled: true, order: 4 },
        { id: "reports", label: "Reports", path: "/supervisor/reports", icon: "HiOutlineDocumentText", enabled: true, order: 5 },
        { id: "review-reports", label: "Review Reports", path: "/supervisor/reports/review", icon: "HiOutlineClipboardCheck", enabled: true, order: 6 },
      ],
      pagePermissions: [
        { 
          pageId: "teams", 
          pageName: "Teams", 
          enabled: true, 
          allowedActions: ["view", "edit"],
          dataFilters: { departmentOnly: true }
        },
        { 
          pageId: "workers", 
          pageName: "Worker Management", 
          enabled: true, 
          allowedActions: ["view", "assign"],
          dataFilters: { departmentOnly: true }
        },
        { 
          pageId: "production", 
          pageName: "Production", 
          enabled: true, 
          allowedActions: ["view", "approve", "reject"],
          dataFilters: { departmentOnly: true }
        },
        { pageId: "reports", pageName: "Reports", enabled: true, allowedActions: ["view", "create", "export"] },
      ],
      uiSettings: {
        showNotifications: true,
        showHelp: true,
        defaultLandingPage: "/supervisor",
      },
    },
  ],
  createdAt: new Date().toISOString(),
  updatedAt: new Date().toISOString(),
};
