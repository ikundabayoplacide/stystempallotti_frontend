import { createContext, type ReactNode, useContext, useEffect, useState } from "react";

type UserRole = 
  | "admin" 
  | "receptionist" 
  | "sales" 
  | "daf" 
  | "accountant" 
  | "production-manager" 
  | "stock" 
  | "supervisor" 
  | "worker";

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

interface AuthContextType {
  isAuthenticated: boolean;
  userRole: UserRole | null;
  userName: string | null;
  userDepartment: Department | null;
  login: (role: UserRole, name: string, department?: Department) => void;
  logout: () => void;
}

export type { Department, UserRole };

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export function AuthProvider({ children }: { children: ReactNode }) {
  const [isLoading, setIsLoading] = useState(true);
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [userRole, setUserRole] = useState<UserRole | null>(null);
  const [userName, setUserName] = useState<string | null>(null);
  const [userDepartment, setUserDepartment] = useState<Department | null>(null);

  // Initialize from localStorage on mount
  useEffect(() => {
    const storedAuth = localStorage.getItem("isAuthenticated") === "true";
    const storedRole = localStorage.getItem("userRole");
    const storedName = localStorage.getItem("userName");
    const storedDept = localStorage.getItem("userDepartment") as Department;

    // Migrate old accountant roles
    let finalRole = storedRole;
    if (storedRole === "accountant1" || storedRole === "accountant2") {
      finalRole = "accountant";
      localStorage.setItem("userRole", "accountant");
    }

    setIsAuthenticated(storedAuth);
    setUserRole(finalRole as UserRole);
    setUserName(storedName);
    setUserDepartment(storedDept);
    setIsLoading(false);
  }, []);

  const login = (role: UserRole, name: string, department?: Department) => {
    setIsAuthenticated(true);
    setUserRole(role);
    setUserName(name);
    setUserDepartment(department || null);
    localStorage.setItem("isAuthenticated", "true");
    localStorage.setItem("userRole", role);
    localStorage.setItem("userName", name);
    if (department) {
      localStorage.setItem("userDepartment", department);
    }
  };

  const logout = () => {
    setIsAuthenticated(false);
    setUserRole(null);
    setUserName(null);
    setUserDepartment(null);
    localStorage.removeItem("isAuthenticated");
    localStorage.removeItem("userRole");
    localStorage.removeItem("userName");
    localStorage.removeItem("userDepartment");
  };

  return (
    <AuthContext.Provider value={{ isAuthenticated, userRole, userName, userDepartment, login, logout }}>
      {isLoading ? (
        <div style={{ display: 'flex', justifyContent: 'center', alignItems: 'center', height: '100vh' }}>
          Loading...
        </div>
      ) : (
        children
      )}
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
