import { type ReactNode, useEffect, useRef, useState } from "react";
import {
  HiOutlineBell,
  HiOutlineLogout,
  HiOutlineMenu,
  HiOutlineQuestionMarkCircle,
  HiOutlineUser,
} from "react-icons/hi";
import { useNavigate } from "react-router-dom";
import { useAuth, type UserRole } from "../context/AuthContext";
import { useGetUnreadCountQuery } from "../store/services/notificationsService";
import DashboardSidebar from "./DashboardSidebar";

interface DashboardLayoutProps {
  children: ReactNode;
  userRole?: UserRole;
  userName?: string;
  showNotifications?: boolean;
  /** @deprecated — badge count now comes from the API automatically */
  notificationCount?: number;
}

const notificationPaths: Record<UserRole, string> = {
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

const profilePaths: Record<UserRole, string> = {
  admin: "/admin/profile",
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

export default function DashboardLayout({
  children,
  userRole: userRoleProp,
  userName: userNameProp,
  showNotifications = true,
}: DashboardLayoutProps) {
  const [isSidebarCollapsed, setIsSidebarCollapsed] = useState(false);
  const [dropdownOpen, setDropdownOpen] = useState(false);
  const dropdownRef = useRef<HTMLDivElement>(null);
  const navigate = useNavigate();
  const { userRole: authRole, userName: authName, isAuthenticated, logout } = useAuth();

  const { data: unreadCount = 0 } = useGetUnreadCountQuery(undefined, {
    skip: !isAuthenticated,
    pollingInterval: 30_000,
  });

  const userRole = (authRole ?? userRoleProp ?? "receptionist") as UserRole;
  const userName = authName ?? userNameProp ?? "User";

  // Close dropdown on outside click
  useEffect(() => {
    function handleClick(e: MouseEvent) {
      if (dropdownRef.current && !dropdownRef.current.contains(e.target as Node)) {
        setDropdownOpen(false);
      }
    }
    document.addEventListener("mousedown", handleClick);
    return () => document.removeEventListener("mousedown", handleClick);
  }, []);

  const handleLogout = () => {
    logout();
    navigate("/login");
  };

  return (
    <div className="flex h-screen bg-custom-50 font-[family-name:var(--font-family-primary)]">
      <DashboardSidebar
        userRole={userRole}
        userName={userName}
        isCollapsed={isSidebarCollapsed}
        onToggle={() => setIsSidebarCollapsed((v) => !v)}
      />

      <div className="flex-1 flex flex-col overflow-hidden">
        {/* Top Bar */}
        <header className="bg-style-600 border-b border-custom-300 px-4 py-3 flex items-center justify-between lg:px-6">
          {/* Mobile menu toggle */}
          <button
            onClick={() => setIsSidebarCollapsed((v) => !v)}
            className="lg:hidden p-2 rounded-lg hover:bg-custom-100 transition-colors text-custom-700 hover:text-secondary-100"
            aria-label="Toggle menu"
          >
            <HiOutlineMenu className="w-6 h-6" />
          </button>

          <div className="hidden lg:block" />

          {/* Right side */}
          <div className="flex items-center gap-2">
            {/* Bell */}
            {showNotifications && (
              <button
                onClick={() => navigate(notificationPaths[userRole])}
                className="relative p-2 rounded-lg hover:bg-custom-100 transition-colors text-custom-700 hover:text-secondary-100"
                aria-label="Notifications"
              >
                <HiOutlineBell className="w-6 h-6" />
                {unreadCount > 0 && (
                  <span className="absolute top-1 right-1 w-4 h-4 bg-red-500 text-white text-[10px] font-bold rounded-full flex items-center justify-center">
                    {unreadCount > 9 ? "9+" : unreadCount}
                  </span>
                )}
              </button>
            )}

            {/* Avatar + dropdown */}
            <div className="relative" ref={dropdownRef}>
              <button
                onClick={() => setDropdownOpen((v) => !v)}
                className="w-9 h-9 rounded-full bg-primary-100 flex items-center justify-center hover:ring-2 hover:ring-primary-400 transition-all"
                aria-label="User menu"
              >
                <span className="text-primary-600 font-bold text-sm">
                  {userName.charAt(0).toUpperCase()}
                </span>
              </button>

              {dropdownOpen && (
                <div className="absolute right-0 mt-2 w-52 bg-style-600 border border-custom-300 rounded-2xl shadow-xl z-50 overflow-hidden">
                  {/* Mini profile header */}
                  <div className="px-4 py-3 border-b border-custom-200">
                    <p className="text-sm font-bold text-secondary-100 truncate">{userName}</p>
                    <p className="text-xs text-custom-700 capitalize">{userRole.replace("-", " ")}</p>
                  </div>

                  <div className="p-1.5 space-y-0.5">
                    <button
                      onClick={() => { setDropdownOpen(false); navigate(profilePaths[userRole]); }}
                      className="w-full flex items-center gap-3 px-3 py-2 rounded-xl text-sm text-secondary-100 hover:bg-custom-100 transition-colors"
                    >
                      <HiOutlineUser className="w-4 h-4 text-custom-700" />
                      Profile & Password
                    </button>

                    <button
                      onClick={() => { setDropdownOpen(false); navigate(notificationPaths[userRole]); }}
                      className="w-full flex items-center gap-3 px-3 py-2 rounded-xl text-sm text-secondary-100 hover:bg-custom-100 transition-colors"
                    >
                      <HiOutlineBell className="w-4 h-4 text-custom-700" />
                      Notifications
                      {unreadCount > 0 && (
                        <span className="ml-auto w-5 h-5 bg-red-500 text-white text-[10px] font-bold rounded-full flex items-center justify-center">
                          {unreadCount > 9 ? "9+" : unreadCount}
                        </span>
                      )}
                    </button>

                    <button
                      onClick={() => { setDropdownOpen(false); window.open("mailto:support@santech.com"); }}
                      className="w-full flex items-center gap-3 px-3 py-2 rounded-xl text-sm text-secondary-100 hover:bg-custom-100 transition-colors"
                    >
                      <HiOutlineQuestionMarkCircle className="w-4 h-4 text-custom-700" />
                      Help & Support
                    </button>

                    <div className="border-t border-custom-200 my-1" />

                    <button
                      onClick={handleLogout}
                      className="w-full flex items-center gap-3 px-3 py-2 rounded-xl text-sm text-red-600 hover:bg-red-50 transition-colors"
                    >
                      <HiOutlineLogout className="w-4 h-4" />
                      Logout
                    </button>
                  </div>
                </div>
              )}
            </div>
          </div>
        </header>

        <main className="flex-1 overflow-y-auto p-4 lg:p-6">
          <div className="max-w-[1920px] mx-auto">{children}</div>
        </main>
      </div>
    </div>
  );
}
