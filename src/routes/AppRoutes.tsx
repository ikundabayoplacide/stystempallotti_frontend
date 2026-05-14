import { Navigate, Route, Routes } from "react-router-dom";
import Layout from "../components/Layout";
import ProtectedRoute from "../components/ProtectedRoute";
import LoginPage from "../pages/LoginPage";

// Admin Pages
import {
    AdminPage,
    ReportsPage as AdminReportsPage,
    SalesPage as AdminSalesPage,
    StockPage as AdminStockPage,
    AdminViewReportsPage,
    FinancePage,
    JobManagementPage,
    ProductionOverviewPage,
    SystemSettingsPage,
    UIPermissionsPage,
    UserManagementPage,
    WorkflowConfigPage
} from "../pages/admin";

// Sales Officer Pages
import { ClientsPage, QuotationsPage, SalesPage } from "../pages/sales";
import DossierPage from "../pages/sales/DossierPage";
import ProformaInvoicePage from "../pages/sales/ProformaInvoicePage";

// Finance Pages
import {
    Accountant1DocumentsPage,
    Accountant1InvoicesPage,
    Accountant1Page,
    Accountant1PaymentsPage,
    Accountant2Page,
    Accountant2ProcurementPage,
    Accountant2RecoveryPage,
    Accountant2TaxesPage,
    DAFJobApprovalPage,
    DAFPage,
    DAFReportsPage,
    FinanceControlPage,
    HRManagementPage
} from "../pages/finance";

// Production Manager Pages
import { DepartmentsPage, JobAssignmentPage, ProductionManagerPage, ProgressPage } from "../pages/production-manager";

// Production Department Pages

// Stock Pages
import { InventoryPage, MaterialRequestsPage, SuppliersPage } from "../pages/stock";
import StockPage from "../pages/stock/StockPage";

// Supervisor Pages

// Worker Pages
import StatsPage from "../pages/worker/StatsPage";
import TaskManagementPage from "../pages/worker/TaskManagementPage";
import TimeLogsPage from "../pages/worker/TimeLogsPage";
import WorkerPage from "../pages/worker/WorkerPage";
import WorkerReportsPage from "../pages/worker/WorkerReportsPage";

// Reception Pages
import NotificationsPage from "../pages/NotificationsPage";
import {
    DeliveriesPage,
    NewJobPage,
    ReceptionPage,
    TaskAssignmentPage,
} from "../pages/receptionalist";
import { ProductionPage, SupervisorPage, SupervisorReviewReportsPage, TeamsPage, WorkerManagementPage } from "../pages/supervisor";
import { MaterialRequestPage } from "../pages/worker";

export default function AppRoutes() {
  return (
    <Routes>
      {/* Standalone login page (no navbar/footer) */}
      <Route path="/login" element={<LoginPage />} />

      {/* Admin Routes */}
      <Route path="/admin" element={<ProtectedRoute allowedRoles={["admin"]}><AdminPage /></ProtectedRoute>} />
      <Route path="/admin/users" element={<ProtectedRoute allowedRoles={["admin"]} pageId="users"><UserManagementPage /></ProtectedRoute>} />
      <Route path="/admin/jobs" element={<ProtectedRoute allowedRoles={["admin"]} pageId="jobs"><JobManagementPage /></ProtectedRoute>} />
      <Route path="/admin/production" element={<ProtectedRoute allowedRoles={["admin"]}><ProductionOverviewPage /></ProtectedRoute>} />
      <Route path="/admin/finance" element={<ProtectedRoute allowedRoles={["admin"]}><FinancePage /></ProtectedRoute>} />
      <Route path="/admin/sales" element={<ProtectedRoute allowedRoles={["admin"]}><AdminSalesPage /></ProtectedRoute>} />
      <Route path="/admin/stock" element={<ProtectedRoute allowedRoles={["admin"]}><AdminStockPage /></ProtectedRoute>} />
      <Route path="/admin/reports" element={<ProtectedRoute allowedRoles={["admin"]} pageId="reports"><AdminReportsPage /></ProtectedRoute>} />
      <Route path="/admin/reports/view" element={<ProtectedRoute allowedRoles={["admin"]} pageId="reports"><AdminViewReportsPage /></ProtectedRoute>} />
      <Route path="/admin/settings" element={<ProtectedRoute allowedRoles={["admin"]}><SystemSettingsPage /></ProtectedRoute>} />
      <Route path="/admin/workflow" element={<ProtectedRoute allowedRoles={["admin"]}><WorkflowConfigPage /></ProtectedRoute>} />
      <Route path="/admin/ui-permissions" element={<ProtectedRoute allowedRoles={["admin"]}><UIPermissionsPage /></ProtectedRoute>} />
      <Route path="/admin/notifications" element={<ProtectedRoute allowedRoles={["admin"]}><NotificationsPage userRole="admin" userName="Admin" /></ProtectedRoute>} />

      {/* Reception Routes */}
      <Route path="/reception" element={<ProtectedRoute allowedRoles={["receptionist"]}><ReceptionPage /></ProtectedRoute>} />
      <Route path="/reception/new" element={<ProtectedRoute allowedRoles={["receptionist"]} pageId="new-job"><NewJobPage /></ProtectedRoute>} />
      <Route path="/reception/tasks" element={<ProtectedRoute allowedRoles={["receptionist"]} pageId="tasks"><TaskAssignmentPage /></ProtectedRoute>} />
      <Route path="/reception/deliveries" element={<ProtectedRoute allowedRoles={["receptionist"]} pageId="deliveries"><DeliveriesPage /></ProtectedRoute>} />
      <Route path="/reception/notifications" element={<ProtectedRoute allowedRoles={["receptionist"]}><NotificationsPage userRole="receptionist" userName="Receptionist" /></ProtectedRoute>} />

      {/* Sales Officer Routes */}
      <Route path="/sales" element={<ProtectedRoute allowedRoles={["sales"]}><SalesPage /></ProtectedRoute>} />
      <Route path="/sales/quotations" element={<ProtectedRoute allowedRoles={["sales"]} pageId="quotations"><QuotationsPage /></ProtectedRoute>} />
      <Route path="/sales/invoices" element={<ProtectedRoute allowedRoles={["sales"]} pageId="proforma"><ProformaInvoicePage /></ProtectedRoute>} />
      <Route path="/sales/dossiers" element={<ProtectedRoute allowedRoles={["sales"]} pageId="dossier"><DossierPage /></ProtectedRoute>} />
      <Route path="/sales/clients" element={<ProtectedRoute allowedRoles={["sales"]} pageId="clients"><ClientsPage /></ProtectedRoute>} />
      <Route path="/sales/notifications" element={<ProtectedRoute allowedRoles={["sales"]}><NotificationsPage userRole="sales" userName="Sales Officer" /></ProtectedRoute>} />

      {/* Finance Routes */}
      {/* DAF Routes */}
      <Route path="/finance/daf" element={<ProtectedRoute allowedRoles={["daf"]}><DAFPage /></ProtectedRoute>} />
      <Route path="/finance/daf/control" element={<ProtectedRoute allowedRoles={["daf"]}><FinanceControlPage /></ProtectedRoute>} />
      <Route path="/finance/daf/hr" element={<ProtectedRoute allowedRoles={["daf"]}><HRManagementPage /></ProtectedRoute>} />
      <Route path="/finance/daf/reports" element={<ProtectedRoute allowedRoles={["daf"]}><DAFReportsPage /></ProtectedRoute>} />
      <Route path="/finance/daf/approvals" element={<ProtectedRoute allowedRoles={["daf"]} pageId="finance-control"><DAFJobApprovalPage /></ProtectedRoute>} />
      <Route path="/finance/daf/notifications" element={<ProtectedRoute allowedRoles={["daf"]}><NotificationsPage userRole="daf" userName="DAF" /></ProtectedRoute>} />
      
      {/* Accountant Routes - Unified */}
      <Route path="/finance/accountant1" element={<ProtectedRoute allowedRoles={["accountant"]}><Accountant1Page /></ProtectedRoute>} />
      <Route path="/finance/accountant1/invoices" element={<ProtectedRoute allowedRoles={["accountant"]} pageId="invoices"><Accountant1InvoicesPage /></ProtectedRoute>} />
      <Route path="/finance/accountant1/payments" element={<ProtectedRoute allowedRoles={["accountant"]} pageId="payments"><Accountant1PaymentsPage /></ProtectedRoute>} />
      <Route path="/finance/accountant1/documents" element={<ProtectedRoute allowedRoles={["accountant"]} pageId="documents"><Accountant1DocumentsPage /></ProtectedRoute>} />
      <Route path="/finance/accountant1/notifications" element={<ProtectedRoute allowedRoles={["accountant"]}><NotificationsPage userRole="accountant" userName="Accountant" /></ProtectedRoute>} />
      
      <Route path="/finance/accountant2" element={<ProtectedRoute allowedRoles={["accountant"]}><Accountant2Page /></ProtectedRoute>} />
      <Route path="/finance/accountant2/procurement" element={<ProtectedRoute allowedRoles={["accountant"]} pageId="procurement"><Accountant2ProcurementPage /></ProtectedRoute>} />
      <Route path="/finance/accountant2/taxes" element={<ProtectedRoute allowedRoles={["accountant"]} pageId="taxes"><Accountant2TaxesPage /></ProtectedRoute>} />
      <Route path="/finance/accountant2/recovery" element={<ProtectedRoute allowedRoles={["accountant"]} pageId="recovery"><Accountant2RecoveryPage /></ProtectedRoute>} />
      <Route path="/finance/accountant2/notifications" element={<ProtectedRoute allowedRoles={["accountant"]}><NotificationsPage userRole="accountant" userName="Accountant" /></ProtectedRoute>} />

      {/* Production Manager Routes */}
      <Route path="/production-manager" element={<ProtectedRoute allowedRoles={["production-manager"]}><ProductionManagerPage /></ProtectedRoute>} />
      <Route path="/production-manager/planning" element={<ProtectedRoute allowedRoles={["production-manager"]}><JobAssignmentPage /></ProtectedRoute>} />
      <Route path="/production-manager/departments" element={<ProtectedRoute allowedRoles={["production-manager"]}><DepartmentsPage /></ProtectedRoute>} />
      <Route path="/production-manager/progress" element={<ProtectedRoute allowedRoles={["production-manager"]}><ProgressPage /></ProtectedRoute>} />
      <Route path="/production-manager/notifications" element={<ProtectedRoute allowedRoles={["production-manager"]}><NotificationsPage userRole="production-manager" userName="Production Manager" /></ProtectedRoute>} />

      {/* Stock Department Routes */}
      <Route path="/stock" element={<ProtectedRoute allowedRoles={["stock"]}><StockPage /></ProtectedRoute>} />
      <Route path="/stock/inventory" element={<ProtectedRoute allowedRoles={["stock"]}><InventoryPage /></ProtectedRoute>} />
      <Route path="/stock/requests" element={<ProtectedRoute allowedRoles={["stock"]}><MaterialRequestsPage /></ProtectedRoute>} />
      <Route path="/stock/suppliers" element={<ProtectedRoute allowedRoles={["stock"]}><SuppliersPage /></ProtectedRoute>} />
      <Route path="/stock/notifications" element={<ProtectedRoute allowedRoles={["stock"]}><NotificationsPage userRole="stock" userName="Stock Manager" /></ProtectedRoute>} />

      {/* Supervisor Routes */}
      <Route path="/supervisor" element={<ProtectedRoute allowedRoles={["supervisor"]}><SupervisorPage /></ProtectedRoute>} />
      <Route path="/supervisor/production" element={<ProtectedRoute allowedRoles={["supervisor"]}><ProductionPage /></ProtectedRoute>} />
      <Route path="/supervisor/teams" element={<ProtectedRoute allowedRoles={["supervisor"]}><TeamsPage /></ProtectedRoute>} />
      <Route path="/supervisor/workers" element={<ProtectedRoute allowedRoles={["supervisor"]}><WorkerManagementPage /></ProtectedRoute>} />
      <Route path="/supervisor/reports" element={<ProtectedRoute allowedRoles={["supervisor"]}><SupervisorReviewReportsPage /></ProtectedRoute>} />
      <Route path="/supervisor/reports/review" element={<ProtectedRoute allowedRoles={["supervisor"]}><SupervisorReviewReportsPage /></ProtectedRoute>} />
      <Route path="/supervisor/notifications" element={<ProtectedRoute allowedRoles={["supervisor"]}><NotificationsPage userRole="supervisor" userName="Supervisor" /></ProtectedRoute>} />

      {/* Worker Routes */}
      <Route path="/worker" element={<ProtectedRoute allowedRoles={["worker"]}><WorkerPage /></ProtectedRoute>} />
      <Route path="/worker/tasks" element={<ProtectedRoute allowedRoles={["worker"]} pageId="tasks"><TaskManagementPage /></ProtectedRoute>} />
      <Route path="/worker/time-logs" element={<ProtectedRoute allowedRoles={["worker"]} pageId="time-logs"><TimeLogsPage /></ProtectedRoute>} />
      <Route path="/worker/stats" element={<ProtectedRoute allowedRoles={["worker"]}><StatsPage /></ProtectedRoute>} />
      <Route path="/worker/reports" element={<ProtectedRoute allowedRoles={["worker"]}><WorkerReportsPage /></ProtectedRoute>} />
      <Route path="/worker/materials" element={<ProtectedRoute allowedRoles={["worker"]} pageId="material-requests"><MaterialRequestPage /></ProtectedRoute>} />
      <Route path="/worker/notifications" element={<ProtectedRoute allowedRoles={["worker"]}><NotificationsPage userRole="worker" userName="Worker" /></ProtectedRoute>} />

      {/* Public Routes with Layout (if needed) */}
      <Route element={<Layout />}>
        {/* Add public page routes here if needed */}
      </Route>

      {/* Default redirect to login */}
      <Route path="/" element={<Navigate to="/login" replace />} />

      {/* 404 — redirect to login */}
      <Route path="*" element={<Navigate to="/login" replace />} />
    </Routes>
  );
}
