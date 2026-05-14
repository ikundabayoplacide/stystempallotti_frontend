import { Navigate } from "react-router-dom";
import { useAuth, type UserRole } from "../context/AuthContext";
import { usePermissions } from "../hooks/usePermissions";

interface ProtectedRouteProps {
  children: React.ReactNode;
  allowedRoles?: UserRole[];
  pageId?: string; // Optional page ID for permission checking
  requireAction?: string; // Optional required action (e.g., "view", "edit")
}

export default function ProtectedRoute({ 
  children, 
  allowedRoles,
  pageId,
  requireAction = "view"
}: ProtectedRouteProps) {
  const { isAuthenticated, userRole } = useAuth();
  const { canAccessPage, hasPermission } = usePermissions();

  console.log("🔒 ProtectedRoute:", { 
    isAuthenticated, 
    userRole, 
    allowedRoles,
    pageId,
    requireAction,
    match: allowedRoles ? allowedRoles.includes(userRole!) : 'no restriction'
  });

  if (!isAuthenticated) {
    console.log("❌ REDIRECT: Not authenticated");
    return <Navigate to="/login" replace />;
  }

  if (allowedRoles && userRole && !allowedRoles.includes(userRole)) {
    console.log("❌ REDIRECT: Role not in allowed list");
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
    };
    return <Navigate to={redirectMap[userRole]} replace />;
  }

  // Check page-level permissions if pageId is provided
  if (pageId) {
    const hasPageAccess = canAccessPage(pageId);
    const hasRequiredAction = hasPermission(pageId, requireAction);

    console.log("🔐 Page Permission Check:", {
      pageId,
      hasPageAccess,
      requireAction,
      hasRequiredAction,
    });

    if (!hasPageAccess) {
      console.log("❌ PAGE DISABLED - Redirecting to home");
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
      };
      return <Navigate to={userRole ? redirectMap[userRole] : "/login"} replace />;
    }

    if (!hasRequiredAction) {
      console.log("❌ ACTION NOT ALLOWED - Redirecting to home");
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
      };
      return <Navigate to={userRole ? redirectMap[userRole] : "/login"} replace />;
    }
  }

  console.log("✅ ACCESS GRANTED - Rendering children");
  return <>{children}</>;
}
