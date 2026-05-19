import * as HeroIcons from "react-icons/hi";
import {
    HiOutlineAdjustments,
    HiOutlineArchive,
    HiOutlineBriefcase,
    HiOutlineChartBar,
    HiOutlineClipboardList,
    HiOutlineClock,
    HiOutlineCog,
    HiOutlineCube,
    HiOutlineCurrencyDollar,
    HiOutlineDocumentText,
    HiOutlineHome,
    HiOutlineLogout,
    HiOutlineMenu,
    HiOutlineUsers,
    HiOutlineViewGrid,
    HiOutlineX
} from "react-icons/hi";
import { useNavigate } from "react-router-dom";
import { useAuth, type UserRole } from "../context/AuthContext";
import { useUIPermissions } from "../context/UIPermissionsContext";

interface MenuItem {
  label: string;
  path: string;
  icon: React.ComponentType<{ className?: string }>;
}

interface DashboardSidebarProps {
  userRole: UserRole;
  userName?: string;
  isCollapsed: boolean;
  onToggle: () => void;
}

const menuItems: Record<UserRole, MenuItem[]> = {
  admin: [
    { label: "Dashboard", path: "/admin", icon: HiOutlineHome },
    { label: "Users", path: "/admin/users", icon: HiOutlineUsers },
    { label: "Customers", path: "/admin/customers", icon: HiOutlineUsers },
    { label: "Jobs", path: "/admin/jobs", icon: HiOutlineClipboardList },
    { label: "Production", path: "/admin/production", icon: HiOutlineCube },
    { label: "Sales", path: "/admin/sales", icon: HiOutlineBriefcase },
    { label: "Finance", path: "/admin/finance", icon: HiOutlineCurrencyDollar },
    { label: "Stock", path: "/admin/stock", icon: HiOutlineArchive },
    { label: "Reports", path: "/admin/reports", icon: HiOutlineChartBar },
    {
      label: "View Reports",
      path: "/admin/reports/view",
      icon: HiOutlineDocumentText,
    },
    { label: "Workflow Config", path: "/admin/workflow", icon: HiOutlineAdjustments },
    { label: "UI Permissions", path: "/admin/ui-permissions", icon: HiOutlineViewGrid },
    { label: "Settings", path: "/admin/settings", icon: HiOutlineCog },
  ],
  receptionist: [
    { label: "Dashboard", path: "/reception", icon: HiOutlineHome },
    { label: "Visitor", path: "/reception/visitor", icon: HiOutlineClipboardList },
    { label: "Payments", path: "/reception/payments", icon: HiOutlineCurrencyDollar },
    {
      label: "Deliveries",
      path: "/reception/deliveries",
      icon: HiOutlineArchive,
    },
  ],
  sales: [
    { label: "Dashboard", path: "/sales", icon: HiOutlineHome },
    {
      label: "Quotations",
      path: "/sales/quotations",
      icon: HiOutlineDocumentText,
    },
    {
      label: "Invoices",
      path: "/sales/invoices",
      icon: HiOutlineCurrencyDollar,
    },
    { label: "Dossiers", path: "/sales/dossiers", icon: HiOutlineArchive },
    { label: "Jobs", path: "/sales/jobs", icon: HiOutlineBriefcase },
  ],
  daf: [
    { label: "Dashboard", path: "/finance/daf", icon: HiOutlineHome },
    {
      label: "Job Approvals",
      path: "/finance/daf/approvals",
      icon: HiOutlineClipboardList,
    },
    {
      label: "Finance Control",
      path: "/finance/daf/control",
      icon: HiOutlineCurrencyDollar,
    },
    { label: "HR Management", path: "/finance/daf/hr", icon: HiOutlineUsers },
    { label: "Reports", path: "/finance/daf/reports", icon: HiOutlineChartBar },
  ],
  accountant: [
    { label: "Dashboard", path: "/finance/accountant1", icon: HiOutlineHome },
    {
      label: "Invoices",
      path: "/finance/accountant1/invoices",
      icon: HiOutlineDocumentText,
    },
    {
      label: "Payments",
      path: "/finance/accountant1/payments",
      icon: HiOutlineCurrencyDollar,
    },
    {
      label: "Documents",
      path: "/finance/accountant1/documents",
      icon: HiOutlineClipboardList,
    },
    {
      label: "E-Procurement",
      path: "/finance/accountant2/procurement",
      icon: HiOutlineCube,
    },
    {
      label: "Taxes",
      path: "/finance/accountant2/taxes",
      icon: HiOutlineDocumentText,
    },
    {
      label: "Recovery",
      path: "/finance/accountant2/recovery",
      icon: HiOutlineCurrencyDollar,
    },
  ],
  "production-manager": [
    { label: "Dashboard", path: "/production-manager", icon: HiOutlineHome },
    {
      label: "Job Planning",
      path: "/production-manager/planning",
      icon: HiOutlineClipboardList,
    },
    {
      label: "Departments",
      path: "/production-manager/departments",
      icon: HiOutlineUsers,
    },
    {
      label: "Progress",
      path: "/production-manager/progress",
      icon: HiOutlineChartBar,
    },
  ],
  stock: [
    { label: "Dashboard", path: "/stock", icon: HiOutlineHome },
    { label: "Inventory", path: "/stock/inventory", icon: HiOutlineArchive },
    {
      label: "Material Requests",
      path: "/stock/requests",
      icon: HiOutlineClipboardList,
    },
    { label: "Suppliers", path: "/stock/suppliers", icon: HiOutlineUsers },
  ],
  supervisor: [
    { label: "Dashboard", path: "/supervisor", icon: HiOutlineHome },
    {
      label: "Production",
      path: "/supervisor/production",
      icon: HiOutlineClipboardList,
    },
    { label: "Teams", path: "/supervisor/teams", icon: HiOutlineUsers },
    { label: "Workers", path: "/supervisor/workers", icon: HiOutlineUsers },
    { label: "Reports", path: "/supervisor/reports", icon: HiOutlineChartBar },
    {
      label: "Review Reports",
      path: "/supervisor/reports/review",
      icon: HiOutlineDocumentText,
    },
  ],
  worker: [
    { label: "My Jobs", path: "/worker", icon: HiOutlineHome },
    {
      label: "Task Board",
      path: "/worker/tasks",
      icon: HiOutlineClipboardList,
    },
    { label: "Time Logs", path: "/worker/time-logs", icon: HiOutlineClock },
    { label: "My Stats", path: "/worker/stats", icon: HiOutlineChartBar },
    {
      label: "My Reports",
      path: "/worker/reports",
      icon: HiOutlineDocumentText,
    },
    {
      label: "Material Requests",
      path: "/worker/materials",
      icon: HiOutlineArchive,
    },
  ],
};

export default function DashboardSidebar({
  userRole,
  userName = "User",
  isCollapsed,
  onToggle,
}: DashboardSidebarProps) {
  const { currentRoleConfig } = useUIPermissions();
  const navigate = useNavigate();
  const { logout } = useAuth();

  // Use configured menu items if available and non-empty, fallback to hardcoded
  const configuredItems = currentRoleConfig?.sidebarMenu
    .filter(item => item.enabled)
    .sort((a, b) => a.order - b.order)
    .map(item => ({
      label: item.label,
      path: item.path,
      icon: (HeroIcons as any)[item.icon] || HiOutlineHome,
    })) ?? [];

  const items = configuredItems.length > 0 ? configuredItems : (menuItems[userRole] ?? []);

  const handleLogout = () => {
    logout();
    navigate("/login");
  };

  return (
    <>
      {/* Mobile Overlay */}
      {!isCollapsed && (
        <div
          className="fixed inset-0 bg-secondary-100/50 z-40 lg:hidden"
          onClick={onToggle}
        />
      )}

      {/* Sidebar */}
      <aside
        className={`
          fixed lg:sticky top-0 left-0 h-screen
          bg-style-600 border-r border-custom-300
          transition-all duration-300 ease-in-out
          z-50 flex flex-col
          font-[family-name:var(--font-family-primary)]
          ${isCollapsed ? "-translate-x-full lg:translate-x-0 lg:w-20" : "translate-x-0 w-64"}
        `}
      >
        {/* Header */}
        <div className="flex items-center justify-between p-4 border-b border-custom-300">
          {!isCollapsed && (
            <div className="flex items-center gap-2">
              <div className="w-8 h-8 rounded-lg bg-primary-500 flex items-center justify-center">
                <span className="text-secondary-200 font-bold text-sm">ST</span>
              </div>
              <span className="font-bold text-secondary-100 text-lg">SAN Track</span>
            </div>
          )}
          <button
            onClick={onToggle}
            className="p-2 rounded-lg hover:bg-custom-100 transition-colors text-custom-700 hover:text-secondary-100"
            aria-label={isCollapsed ? "Expand sidebar" : "Collapse sidebar"}
          >
            {isCollapsed ? (
              <HiOutlineMenu className="w-5 h-5" />
            ) : (
              <HiOutlineX className="w-5 h-5 lg:hidden" />
            )}
            {!isCollapsed && (
              <HiOutlineMenu className="w-5 h-5 hidden lg:block" />
            )}
          </button>
        </div>

        {/* User Info */}
        <div className={`p-4 border-b border-custom-300 ${isCollapsed ? "hidden" : "block"}`}>
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-full bg-primary-100 flex items-center justify-center">
              <span className="text-primary-600 font-bold text-sm">
                {userName.charAt(0).toUpperCase()}
              </span>
            </div>
            <div className="flex-1 min-w-0">
              <p className="font-semibold text-secondary-100 text-sm truncate">{userName}</p>
              <p className="text-xs text-custom-700 capitalize">{userRole.replace("-", " ")}</p>
            </div>
          </div>
        </div>

        {/* Navigation */}
        <nav className="flex-1 overflow-y-auto p-3 space-y-1">
          {items.map((item) => {
            const isActive = window.location.pathname === item.path;
            return (
              <button
                key={item.path}
                onClick={(e) => {
                  e.preventDefault();
                  e.stopPropagation();
                  console.log("🔗 Navigating to:", item.path);
                  navigate(item.path);
                  // Close mobile sidebar after navigation
                  if (window.innerWidth < 1024 && !isCollapsed) {
                    onToggle();
                  }
                }}
                className={`
                  w-full flex items-center gap-3 px-3 py-2.5 rounded-xl
                  transition-all duration-200
                  ${isActive
                    ? "bg-primary-500 text-secondary-200"
                    : "text-custom-700 hover:bg-custom-100 hover:text-secondary-100"
                  }
                  ${isCollapsed ? "justify-center" : ""}
                `}
                title={isCollapsed ? item.label : undefined}
              >
                <item.icon className="w-5 h-5 flex-shrink-0" />
                {!isCollapsed && (
                  <span className="font-semibold text-sm">{item.label}</span>
                )}
              </button>
            );
          })}
        </nav>

        {/* Footer Actions */}
        <div className="p-3 border-t border-custom-300 space-y-1">
          <button
            className={`
              w-full flex items-center gap-3 px-3 py-2.5 rounded-xl
              text-red-600 hover:bg-red-50 hover:text-red-700
              transition-all duration-200
              ${isCollapsed ? "justify-center" : ""}
            `}
            title={isCollapsed ? "Logout" : undefined}
            onClick={handleLogout}
          >
            <HiOutlineLogout className="w-5 h-5 flex-shrink-0" />
            {!isCollapsed && <span className="font-semibold text-sm">Logout</span>}
          </button>
        </div>
      </aside>
    </>
  );
}
