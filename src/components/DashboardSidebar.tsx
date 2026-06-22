import {
  HiOutlineAdjustments,
  HiOutlineArchive,
  HiOutlineBell,
  HiOutlineBriefcase,
  HiOutlineCalendar,
  HiOutlineChartBar,
  HiOutlineChevronDown,
  HiOutlineClipboardList,
  HiOutlineCog,
  HiOutlineCube,
  HiOutlineCurrencyDollar,
  HiOutlineDocumentText,
  HiOutlineHome,
  HiOutlineMenu,
  HiOutlineUsers,
  HiOutlineViewGrid,
  HiOutlineX
} from "react-icons/hi";
import { useMemo, useState } from "react";
import { useNavigate, useLocation } from "react-router-dom";
import { type UserRole } from "../context/AuthContext";
import { useAppSelector } from "../store/hooks";
import { useGetMyPermissionsQuery } from "../store/services/permissionsService";
import { useGetUnreadCountQuery } from "../store/services/notificationsService";

interface MenuItem {
  label: string;
  path: string;
  icon: React.ComponentType<{ className?: string }>;
  permissionKey?: string;
  children?: { label: string; path: string; icon: React.ComponentType<{ className?: string }> }[];
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
    { label: "Users", path: "/admin/users", icon: HiOutlineUsers, permissionKey: "users.view" },
    { label: "Customers", path: "/admin/customers", icon: HiOutlineUsers, permissionKey: "customers.view" },
    { label: "Jobs", path: "/admin/jobs", icon: HiOutlineClipboardList, permissionKey: "jobs.view" },
    { label: "Departments", path: "/admin/departments", icon: HiOutlineUsers, permissionKey: "departments.view" },
    { label: "Production", path: "/admin/production", icon: HiOutlineCube, permissionKey: "production.view" },
    { label: "Sales", path: "/admin/sales", icon: HiOutlineBriefcase, permissionKey: "quotations.view" },
    { label: "Finance", path: "/admin/finance", icon: HiOutlineCurrencyDollar, permissionKey: "finance.view" },
    { label: "Stock", path: "/admin/stock", icon: HiOutlineArchive, permissionKey: "stock.view" },
    { label: "Reports", path: "/admin/reports", icon: HiOutlineChartBar, permissionKey: "reports.view" },
    { label: "View Reports", path: "/admin/reports/view", icon: HiOutlineDocumentText, permissionKey: "reports.view" },
    { label: "Workflow Config", path: "/admin/workflow", icon: HiOutlineAdjustments, permissionKey: "workflow_config.view" },
    { label: "UI Permissions", path: "/admin/ui-permissions", icon: HiOutlineViewGrid, permissionKey: "ui_permissions.view" },
    { label: "Settings", path: "/admin/settings", icon: HiOutlineCog, permissionKey: "settings.view" },
    { label: "Leave Management", path: "/admin/leave", icon: HiOutlineCalendar },
  ],
  receptionist: [
    { label: "Dashboard", path: "/reception", icon: HiOutlineHome },
    { label: "Visitor", path: "/reception/visitor", icon: HiOutlineClipboardList, permissionKey: "visitors.view" },
    { label: "Payments", path: "/reception/payments", icon: HiOutlineCurrencyDollar, permissionKey: "payments.view" },
    { label: "Deliveries", path: "/reception/deliveries", icon: HiOutlineArchive, permissionKey: "deliveries.view" },
    { label: "Boutique", path: "/reception/boutique", icon: HiOutlineViewGrid, permissionKey: "boutique.view" },
    { label: "My Leave", path: "/reception/leave", icon: HiOutlineCalendar },
    {
      label: "Reports", path: "/reception/reports", icon: HiOutlineChartBar, children: [
        { label: "Generate Reports", path: "/reception/reports", icon: HiOutlineChartBar },
        { label: "My Reports", path: "/reception/reports/my", icon: HiOutlineDocumentText },
      ]
    },
  ],
  sales: [
    { label: "Dashboard", path: "/sales", icon: HiOutlineHome },
    { label: "Jobs", path: "/sales/jobs", icon: HiOutlineBriefcase, permissionKey: "jobs.view" },
    { label: "Stock", path: "/sales/stocks", icon: HiOutlineArchive, permissionKey: "stock.view" },
    { label: "Performa Invoice", path: "/sales/proformas", icon: HiOutlineDocumentText},
    // { label: "Performa Invoice", path: "/sales/performaInvoice", icon: HiOutlineCurrencyDollar, permissionKey: "invoices.view" },
    { label: "My Leave", path: "/sales/leave", icon: HiOutlineCalendar },
    {
      label: "Reports", path: "/sales/reports", icon: HiOutlineChartBar, children: [
        { label: "Generate Reports", path: "/sales/reports", icon: HiOutlineChartBar },
        { label: "My Reports", path: "/sales/reports/my", icon: HiOutlineDocumentText },
      ]
    },
  ],
  hr: [
    { label: "Dashboard", path: "/hr", icon: HiOutlineHome },
    { label: "Employees", path: "/hr/employees", icon: HiOutlineUsers },
    { label: "Leave Management", path: "/hr/leave", icon: HiOutlineCalendar },
  ],

  hobe: [
    { label: "Dashboard", path: "/hobe", icon: HiOutlineHome },
    { label: "Trade", path: "/hobe/trade", icon: HiOutlineCube },
    { label: "Requests", path: "/hobe/requests", icon: HiOutlineClipboardList },
    { label: "My Leave", path: "/hobe/leave", icon: HiOutlineCalendar },
    {
      label: "Reports", path: "/hobe/report", icon: HiOutlineChartBar, children: [
        { label: "Generate Reports", path: "/hobe/report", icon: HiOutlineChartBar },
        { label: "My Reports", path: "/hobe/report/my-reports", icon: HiOutlineDocumentText },
      ]
    },
  ],
  daf: [
    { label: "Dashboard", path: "/finance/daf", icon: HiOutlineHome },
    { label: "Job Approvals", path: "/finance/daf/approvals", icon: HiOutlineClipboardList, permissionKey: "jobs.view" },
    // { label: "Finance Control", path: "/finance/daf/control", icon: HiOutlineCurrencyDollar, permissionKey: "finance.view" },
    { label: "Employees", path: "/finance/daf/hr", icon: HiOutlineUsers, permissionKey: "hr.view" },
    // { label: "Quotations", path: "/finance/daf/quatation", icon: HiOutlineAdjustments, permissionKey: "finance.view" },
    { label: "Procurement", path: "/finance/daf/procurement", icon: HiOutlineArchive },
    { label: "My Leave", path: "/finance/daf/leave", icon: HiOutlineCalendar },
    {
      label: "Reports", path: "/finance/daf/reports", icon: HiOutlineChartBar, permissionKey: "reports.view", children: [
        { label: "Generate Reports", path: "/finance/daf/reports", icon: HiOutlineChartBar },
        { label: "Reports", path: "/finance/daf/reports/my", icon: HiOutlineDocumentText },
      ]
    },
  ],
  accountant: [
    { label: "Dashboard", path: "/finance/accountant1", icon: HiOutlineHome },
    { label: "Payments", path: "/finance/accountant1/payments", icon: HiOutlineCurrencyDollar, permissionKey: "payments.view" },
    { label: "Invoices", path: "/finance/accountant1/invoices", icon: HiOutlineDocumentText, permissionKey: "invoices.view" },
    { label: "Documents", path: "/finance/accountant1/documents", icon: HiOutlineClipboardList, permissionKey: "dossiers.view" },
    { label: "Operations", path: "/finance/accountant1/operations", icon: HiOutlineClipboardList},
    // { label: "E-Procurement", path: "/finance/accountant2/procurement", icon: HiOutlineCube, permissionKey: "procurement.view" },
    // { label: "Taxes", path: "/finance/accountant2/taxes", icon: HiOutlineDocumentText, permissionKey: "taxes.view" },
    { label: "Recovery", path: "/finance/accountant2/recovery", icon: HiOutlineCurrencyDollar, permissionKey: "recovery.view" },
    { label: "My Leave", path: "/finance/accountant1/leave", icon: HiOutlineCalendar },
  ],
  "production-manager": [
    { label: "Dashboard", path: "/production-manager", icon: HiOutlineHome },
    { label: "Job Planning", path: "/production-manager/planning", icon: HiOutlineClipboardList, permissionKey: "jobs.view" },
    { label: "Departments", path: "/production-manager/departments", icon: HiOutlineUsers, permissionKey: "departments.view" },
    { label: "My Leave", path: "/production-manager/leave", icon: HiOutlineCalendar },
    { label: "Reports", path: "/production-manager/reports", icon: HiOutlineChartBar, children: [
      { label: "Generate Reports", path: "/production-manager/reports", icon: HiOutlineChartBar },
      { label: "My Reports", path: "/production-manager/reports/my", icon: HiOutlineDocumentText },
    ] },
  ],
  stock: [
    { label: "Dashboard", path: "/stock", icon: HiOutlineHome },
    { label: "Inventory", path: "/stock/inventory", icon: HiOutlineArchive, permissionKey: "stock.view" },
    { label: "Material Requests", path: "/stock/requests", icon: HiOutlineClipboardList, permissionKey: "stock.view" },
    { label: "Suppliers", path: "/stock/suppliers", icon: HiOutlineUsers, permissionKey: "suppliers.view" },
    { label: "My Leave", path: "/stock/leave", icon: HiOutlineCalendar },
  ],
  supervisor: [
    { label: "Dashboard", path: "/supervisor", icon: HiOutlineHome },
    { label: "Jobs", path: "/supervisor/jobs", icon: HiOutlineClipboardList, permissionKey: "jobs.view" },
    { label: "Employees", path: "/supervisor/employees", icon: HiOutlineUsers },
    { label: "My Leave", path: "/supervisor/leave", icon: HiOutlineCalendar },
    {
      label: "Reports", path: "/supervisor/reports", icon: HiOutlineChartBar, permissionKey: "reports.view", children: [
        { label: "Generate Reports", path: "/supervisor/reports", icon: HiOutlineChartBar },
        { label: "My Reports", path: "/supervisor/reports/my", icon: HiOutlineDocumentText },
      ]
    },
  ],
  worker: [
    { label: "My Jobs", path: "/worker", icon: HiOutlineHome },
    { label: "Task Board", path: "/worker/tasks", icon: HiOutlineClipboardList, permissionKey: "tasks.view" },
    { label: "Material Requests", path: "/worker/materials", icon: HiOutlineArchive, permissionKey: "stock.view" },
    { label: "My Leave", path: "/worker/leave", icon: HiOutlineCalendar },
    {
      label: "Reports", path: "/worker/reports", icon: HiOutlineChartBar, permissionKey: "reports.view", children: [
        { label: "Generate Reports", path: "/worker/reports", icon: HiOutlineChartBar },
        { label: "My Reports", path: "/worker/reports/my", icon: HiOutlineDocumentText },
      ]
    },
  ],
};

export default function DashboardSidebar({
  userRole,
  userName = "User",
  isCollapsed,
  onToggle,
}: DashboardSidebarProps) {
  const navigate = useNavigate();
  const location = useLocation();
  const { token } = useAppSelector((state) => state.auth);
  const [openDropdowns, setOpenDropdowns] = useState<Set<string>>(() => {
    // Auto-open dropdowns whose children match the current path on mount
    const initial = new Set<string>();
    Object.values(menuItems).flat().forEach((item) => {
      if (item.children?.some((c) => window.location.pathname === c.path)) {
        initial.add(item.path);
      }
    });
    return initial;
  });
  const { data: myPermissions = [], isSuccess } = useGetMyPermissionsQuery(undefined, {
    skip: !token,
    refetchOnMountOrArgChange: true,
  });

  const { data: unreadCount = 0 } = useGetUnreadCountQuery(undefined, {
    skip: !token,
    pollingInterval: 30_000,
  });

  const toggleDropdown = (path: string) =>
    setOpenDropdowns((prev) => {
      const next = new Set(prev);
      next.has(path) ? next.delete(path) : next.add(path);
      return next;
    });

  const grantedSet = useMemo(() => {
    const s = new Set(myPermissions.map((p) => p.name));
    if (isSuccess) {
      console.log(`[sidebar] role=${userRole} | granted permissions (${s.size}):`, [...s].sort());
    }
    return s;
  }, [myPermissions, isSuccess, userRole]);

  // Always use the hardcoded menuItems — no localStorage / UIPermissions config involved
  const items = useMemo(() => {
    const base = menuItems[userRole] ?? [];
    const filtered = base.filter(
      (item) => !item.permissionKey || grantedSet.has(item.permissionKey)
    );
    console.log(
      `[sidebar] visible items (${filtered.length}/${base.length}):`,
      filtered.map((i) => i.label),
      "| blocked:",
      base
        .filter((i) => i.permissionKey && !grantedSet.has(i.permissionKey!))
        .map((i) => `${i.label}(${i.permissionKey})`)
    );
    return filtered;
  }, [userRole, grantedSet]);

  const notifPath: Record<UserRole, string> = {
    admin: "/admin/notifications",
    receptionist: "/reception/notifications",
    sales: "/sales/notifications",
    hr: "/hr/notifications",
    hobe: "/hobe/notifications",
    daf: "/finance/daf/notifications",
    accountant: "/finance/accountant1/notifications",
    "production-manager": "/production-manager/notifications",
    stock: "/stock/notifications",
    supervisor: "/supervisor/notifications",
    worker: "/worker/notifications",
  };

  const settingsPath: Record<UserRole, string> = {
    admin: "/admin/settings",
    receptionist: "/reception/profile",
    sales: "/sales/profile",
    hr: "/hr/profile",
    hobe: "/hobe/profile",
    daf: "/finance/daf/profile",
    accountant: "/finance/accountant1/profile",
    "production-manager": "/production-manager/profile",
    stock: "/stock/profile",
    supervisor: "/supervisor/profile",
    worker: "/worker/profile",
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
            const isActive = location.pathname === item.path;
            const hasChildren = !!item.children?.length;
            const isDropdownOpen = openDropdowns.has(item.path);
            const childActive = item.children?.some((c) => location.pathname === c.path);

            return (
              <div key={item.path}>
                <button
                  onClick={(e) => {
                    e.preventDefault();
                    e.stopPropagation();
                    if (hasChildren && !isCollapsed) {
                      toggleDropdown(item.path);
                    } else {
                      navigate(item.path);
                      if (window.innerWidth < 1024 && !isCollapsed) onToggle();
                    }
                  }}
                  className={`
                    w-full flex items-center gap-3 px-3 py-2.5 rounded-xl
                    transition-all duration-200
                    ${(isActive || childActive)
                      ? "bg-primary-500 text-secondary-200"
                      : "text-custom-700 hover:bg-custom-100 hover:text-secondary-100"
                    }
                    ${isCollapsed ? "justify-center" : ""}
                  `}
                  title={isCollapsed ? item.label : undefined}
                >
                  <item.icon className="w-5 h-5 flex-shrink-0" />
                  {!isCollapsed && (
                    <>
                      <span className="font-semibold text-sm flex-1 text-left">{item.label}</span>
                      {item.label === "Notifications" && unreadCount > 0 && (
                        <span className="ml-auto w-5 h-5 bg-red-500 text-white text-[10px] font-bold rounded-full flex items-center justify-center">
                          {unreadCount > 9 ? "9+" : unreadCount}
                        </span>
                      )}
                      {hasChildren && (
                        <HiOutlineChevronDown className={`w-4 h-4 transition-transform ${isDropdownOpen ? "rotate-180" : ""
                          }`} />
                      )}
                    </>
                  )}
                </button>

                {/* Children */}
                {hasChildren && !isCollapsed && isDropdownOpen && (
                  <div className="ml-4 mt-1 space-y-1 border-l-2 border-custom-200 pl-3">
                    {item.children!.map((child) => {
                      const childIsActive = location.pathname === child.path;
                      return (
                        <button
                          key={child.path}
                          onClick={() => {
                            navigate(child.path);
                            if (window.innerWidth < 1024 && !isCollapsed) onToggle();
                          }}
                          className={`w-full flex items-center gap-2 px-3 py-2 rounded-xl text-sm transition-all duration-200 ${childIsActive
                              ? "bg-primary-100 text-primary-600 font-semibold"
                              : "text-custom-700 hover:bg-custom-100 hover:text-secondary-100"
                            }`}
                        >
                          <child.icon className="w-4 h-4 flex-shrink-0" />
                          <span className="font-medium text-sm">{child.label}</span>
                        </button>
                      );
                    })}
                  </div>
                )}
              </div>
            );
          })}
        </nav>

        {/* Footer */}
        <div className="p-3 border-t border-custom-300 space-y-1">
          <button
            onClick={() => navigate(notifPath[userRole])}
            className={`relative w-full flex items-center gap-3 px-3 py-2.5 rounded-xl transition-all duration-200 ${
              location.pathname === notifPath[userRole]
                ? "bg-primary-500 text-secondary-200"
                : "text-custom-700 hover:bg-custom-100 hover:text-secondary-100"
            } ${isCollapsed ? "justify-center" : ""}`}
            title={isCollapsed ? "Notifications" : undefined}
          >
            <HiOutlineBell className="w-5 h-5 flex-shrink-0" />
            {!isCollapsed && <span className="font-semibold text-sm flex-1 text-left">Notifications</span>}
            {unreadCount > 0 && (
              <span className="w-5 h-5 bg-red-500 text-white text-[10px] font-bold rounded-full flex items-center justify-center flex-shrink-0">
                {unreadCount > 9 ? "9+" : unreadCount}
              </span>
            )}
          </button>
          <button
            onClick={() => navigate(settingsPath[userRole])}
            className={`w-full flex items-center gap-3 px-3 py-2.5 rounded-xl transition-all duration-200 ${
              location.pathname === settingsPath[userRole]
                ? "bg-primary-500 text-secondary-200"
                : "text-custom-700 hover:bg-custom-100 hover:text-secondary-100"
            } ${isCollapsed ? "justify-center" : ""}`}
            title={isCollapsed ? "Settings" : undefined}
          >
            <HiOutlineCog className="w-5 h-5 flex-shrink-0" />
            {!isCollapsed && <span className="font-semibold text-sm">Settings</span>}
          </button>
        </div>
      </aside>
    </>
  );
}
