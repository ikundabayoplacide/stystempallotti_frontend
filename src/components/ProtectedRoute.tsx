import { Navigate } from "react-router-dom";
import { useAuth, type UserRole } from "../context/AuthContext";
import { usePermissions } from "../hooks/usePermissions";
import { useUIPermissions } from "../context/UIPermissionsContext";

interface ProtectedRouteProps {
  children: React.ReactNode;
  allowedRoles?: UserRole[];
  pageId?: string;
  requireAction?: string;
}

export default function ProtectedRoute({ 
  children, 
  allowedRoles,
  pageId,
  requireAction = "view"
}: ProtectedRouteProps) {
  const { isAuthenticated, userRole } = useAuth();
  const { canAccessPage, hasPermission } = usePermissions();
  const { isLoading } = useUIPermissions();

  if (!isAuthenticated) {
    return <Navigate to="/login" replace />;
  }

  if (allowedRoles && userRole && !allowedRoles.includes(userRole)) {
    const redirectMap: Record<UserRole, string> = {
      admin: "/admin",
      receptionist: "/reception",
      sales: "/sales",
      daf: "/finance/daf",
      accountant: "/finance/accountant1",
      "production-manager": "/production-manager",
      stock: "/stock",
      supervisor: "/supervisor",
      worker: "/worker",
      hr: "/hr",
      hobe: "/hobe",
      cashier: "/cashier",
    };
    return <Navigate to={redirectMap[userRole]} replace />;
  }

  // Wait for permissions to load before checking page access
  if (pageId && isLoading) {
    return null;
  }

  if (pageId) {
    const redirectMap: Record<UserRole, string> = {
      admin: "/admin",
      receptionist: "/reception",
      sales: "/sales",
      daf: "/finance/daf",
      accountant: "/finance/accountant1",
      "production-manager": "/production-manager",
      stock: "/stock",
      supervisor: "/supervisor",
      worker: "/worker",
      hr: "/hr",
      hobe: "/hobe",
      cashier: "/cashier",
    };

    if (!canAccessPage(pageId)) {
      return <Navigate to={userRole ? redirectMap[userRole] : "/login"} replace />;
    }

    if (!hasPermission(pageId, requireAction)) {
      return <Navigate to={userRole ? redirectMap[userRole] : "/login"} replace />;
    }
  }

  return <>{children}</>;
}
