import { type ReactNode, useState } from "react";
import { HiOutlineBell, HiOutlineMenu } from "react-icons/hi";
import { useNavigate } from "react-router-dom";
import type { UserRole } from "../context/AuthContext";
import DashboardSidebar from "./DashboardSidebar";

interface DashboardLayoutProps {
  children: ReactNode;
  userRole: UserRole;
  userName?: string;
  showNotifications?: boolean;
  notificationCount?: number;
}

export default function DashboardLayout({
  children,
  userRole,
  userName = "User",
  showNotifications = true,
  notificationCount = 0,
}: DashboardLayoutProps) {
  const [isSidebarCollapsed, setIsSidebarCollapsed] = useState(false);
  const navigate = useNavigate();

  const toggleSidebar = () => {
    setIsSidebarCollapsed(!isSidebarCollapsed);
  };

  const handleNotificationClick = () => {
    // Map roles to their correct notification paths
    const notificationPaths: Record<UserRole, string> = {
      admin: "/admin/notifications",
      receptionist: "/reception/notifications",
      sales: "/sales/notifications",
      daf: "/finance/daf/notifications",
      accountant: "/finance/accountant1/notifications",
      "production-manager": "/production-manager/notifications",
      stock: "/stock/notifications",
      supervisor: "/supervisor/notifications",
      worker: "/worker/notifications",
    };
    navigate(notificationPaths[userRole] || `/${userRole}/notifications`);
  };

  return (
    <div className="flex h-screen bg-custom-50 font-[family-name:var(--font-family-primary)]">
      {/* Sidebar */}
      <DashboardSidebar
        userRole={userRole}
        userName={userName}
        isCollapsed={isSidebarCollapsed}
        onToggle={toggleSidebar}
      />

      {/* Main Content */}
      <div className="flex-1 flex flex-col overflow-hidden">
        {/* Top Bar */}
        <header className="bg-style-600 border-b border-custom-300 px-4 py-3 flex items-center justify-between lg:px-6">
          {/* Mobile Menu Button */}
          <button
            onClick={toggleSidebar}
            className="lg:hidden p-2 rounded-lg hover:bg-custom-100 transition-colors text-custom-700 hover:text-secondary-100"
            aria-label="Toggle menu"
          >
            <HiOutlineMenu className="w-6 h-6" />
          </button>

          {/* Spacer for desktop */}
          <div className="hidden lg:block" />

          {/* Right Side Actions */}
          <div className="flex items-center gap-3">
            {showNotifications && (
              <button 
                onClick={handleNotificationClick}
                className="relative p-2 rounded-lg hover:bg-custom-100 transition-colors text-custom-700 hover:text-secondary-100"
              >
                <HiOutlineBell className="w-6 h-6" />
                {notificationCount > 0 && (
                  <span className="absolute top-1 right-1 w-4 h-4 bg-red-500 text-secondary-200 text-[10px] font-bold rounded-full flex items-center justify-center">
                    {notificationCount > 9 ? "9+" : notificationCount}
                  </span>
                )}
              </button>
            )}

            {/* User Avatar (Mobile) */}
            <div className="lg:hidden w-8 h-8 rounded-full bg-primary-100 flex items-center justify-center">
              <span className="text-primary-600 font-bold text-xs">
                {userName.charAt(0).toUpperCase()}
              </span>
            </div>
          </div>
        </header>

        {/* Main Content Area */}
        <main className="flex-1 overflow-y-auto p-4 lg:p-6">
          <div className="max-w-[1920px] mx-auto">
            {children}
          </div>
        </main>
      </div>
    </div>
  );
}
