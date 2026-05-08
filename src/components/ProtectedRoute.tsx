import { Navigate } from "react-router-dom";
import { useAuth, type UserRole } from "../context/AuthContext";

interface ProtectedRouteProps {
  children: React.ReactNode;
  allowedRoles?: UserRole[];
}

export default function ProtectedRoute({ children, allowedRoles }: ProtectedRouteProps) {
  const { isAuthenticated, userRole } = useAuth();

  if (!isAuthenticated) {
    // Redirect to login if not authenticated
    return <Navigate to="/login" replace />;
  }

  if (allowedRoles && userRole && !allowedRoles.includes(userRole)) {
    // Redirect to their own dashboard if trying to access unauthorized page
    const redirectMap: Record<UserRole, string> = {
      admin: "/admin",
      receptionist: "/reception",
      sales: "/sales",
      daf: "/finance/daf",
      accountant1: "/finance/accountant1",
      accountant2: "/finance/accountant2",
      "production-manager": "/production-manager",
      stock: "/stock",
      supervisor: "/supervisor",
      worker: "/worker",
    };
    return <Navigate to={redirectMap[userRole]} replace />;
  }

  return <>{children}</>;
}
