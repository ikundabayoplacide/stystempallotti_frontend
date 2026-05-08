import { createContext, type ReactNode, useContext, useState } from "react";

type UserRole = 
  | "admin" 
  | "receptionist" 
  | "sales" 
  | "daf" 
  | "accountant1" 
  | "accountant2" 
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
  const [isAuthenticated, setIsAuthenticated] = useState(() => {
    // Check if user was previously logged in
    return localStorage.getItem("isAuthenticated") === "true";
  });
  
  const [userRole, setUserRole] = useState<UserRole | null>(() => {
    return (localStorage.getItem("userRole") as UserRole) || null;
  });
  
  const [userName, setUserName] = useState<string | null>(() => {
    return localStorage.getItem("userName") || null;
  });

  const [userDepartment, setUserDepartment] = useState<Department | null>(() => {
    return (localStorage.getItem("userDepartment") as Department) || null;
  });

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
