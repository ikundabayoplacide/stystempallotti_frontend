import { createContext, type ReactNode, useContext } from "react";
import { useAppDispatch, useAppSelector } from "../store/hooks";
import { clearCredentials } from "../store/slices/authSlice";
import type { UserRole } from "../store/services/authService";

// ─── Types ────────────────────────────────────────────────────────────────────

// Keep Department type for the rest of the app that still uses it
type Department =
  | "composition"
  | "montage"
  | "printing"
  | "binding"
  | "packaging"
  | "stock"
  | "sales"
  | "finance"
  | "reception"
  | "management";

// Map backend UPPER_CASE roles to the lowercase roles the rest of the app uses
const roleMap: Record<UserRole, LegacyRole> = {
  ADMIN: "admin",
  RECEPTIONIST: "receptionist",
  SALES: "sales",
  DAF: "daf",
  ACCOUNTANT: "accountant",
  PRODUCTION_MANAGER: "production-manager",
  STOCK: "stock",
  SUPERVISOR: "supervisor",
  WORKER: "worker",
  HR: "hr",
};

// Legacy lowercase roles — kept so existing components don't break
type LegacyRole =
  | "admin"
  | "receptionist"
  | "sales"
  | "daf"
  | "accountant"
  | "production-manager"
  | "stock"
  | "supervisor"
  | "worker"
  | "hr";

interface AuthContextType {
  isAuthenticated: boolean;
  userRole: LegacyRole | null;
  userName: string | null;
  userDepartment: Department | null;
  departmentId: string | null;
  logout: () => void;
}

export type { Department, LegacyRole as UserRole };

// ─── Context ──────────────────────────────────────────────────────────────────

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export function AuthProvider({ children }: { children: ReactNode }) {
  const dispatch = useAppDispatch();
  const { isAuthenticated, user } = useAppSelector((state) => state.auth);

  const logout = () => {
    dispatch(clearCredentials());
  };

  // Convert backend role to legacy lowercase role for existing components
  const userRole = user?.role ? (roleMap[user.role] ?? null) : null;

  return (
    <AuthContext.Provider
      value={{
        isAuthenticated,
        userRole,
        userName: user?.name ?? null,
        userDepartment: null,
        departmentId: user?.departmentId ?? null,
        logout,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error("useAuth must be used within an AuthProvider");
  }
  return context;
}
