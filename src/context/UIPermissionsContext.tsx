import { createContext, useContext, useEffect, useState, type ReactNode } from "react";
import { DEFAULT_UI_PERMISSIONS, type RoleUIConfiguration, type UIPermissionsConfiguration } from "../types/UIPermissions";
import { useAuth } from "./AuthContext";

interface UIPermissionsContextType {
  uiPermissions: UIPermissionsConfiguration;
  currentRoleConfig: RoleUIConfiguration | null;
  updateUIPermissions: (config: UIPermissionsConfiguration) => void;
  updateRoleConfig: (roleId: string, config: RoleUIConfiguration) => void;
  resetToDefault: () => void;
  isLoading: boolean;
  hasPermission: (pageId: string, action: string) => boolean;
  isWidgetEnabled: (widgetId: string) => boolean;
  isMenuItemEnabled: (menuId: string) => boolean;
}

const UIPermissionsContext = createContext<UIPermissionsContextType | undefined>(undefined);

function normalizeLegacyUIPermissions(config: UIPermissionsConfiguration): UIPermissionsConfiguration {
  const legacyPathMap: Record<string, string> = {
    "/accountant1": "/finance/accountant1",
    "/accountant1/invoices": "/finance/accountant1/invoices",
    "/accountant1/payments": "/finance/accountant1/payments",
    "/accountant1/documents": "/finance/accountant1/documents",
    "/accountant2": "/finance/accountant2",
    "/accountant2/procurement": "/finance/accountant2/procurement",
    "/accountant2/recovery": "/finance/accountant2/recovery",
    "/accountant2/taxes": "/finance/accountant2/taxes",
    "/accountant2/payment-confirmation": "/finance/accountant2/payment-confirmation",
    "/daf": "/finance/daf",
    "/daf/reports": "/finance/daf/reports",
    "/daf/control": "/finance/daf/control",
    "/daf/hr": "/finance/daf/hr",
    "/production-manager/jobs": "/production-manager/planning",
    "/sales/proforma": "/sales/invoices",
    "/sales/dossier": "/sales/dossiers",
    "/supervisor/review-reports": "/supervisor/reports/review",
  };

  return {
    ...config,
    roles: config.roles.map((role) => ({
      ...role,
      sidebarMenu: role.sidebarMenu.map((item) => {
        const normalizedPath = legacyPathMap[item.path] ?? item.path;

        if (role.roleId === "accountant" && item.id === "payment-confirmation") {
          return {
            ...item,
            path: normalizedPath,
            enabled: false,
          };
        }

        if (role.roleId === "sales" && item.id === "confirmation") {
          return {
            ...item,
            path: normalizedPath,
            enabled: false,
          };
        }

        return {
          ...item,
          path: normalizedPath,
        };
      }),
      uiSettings: role.uiSettings
        ? {
            ...role.uiSettings,
            defaultLandingPage: role.uiSettings.defaultLandingPage
              ? (legacyPathMap[role.uiSettings.defaultLandingPage] ?? role.uiSettings.defaultLandingPage)
              : role.uiSettings.defaultLandingPage,
          }
        : role.uiSettings,
    })),
  };
}

export function UIPermissionsProvider({ children }: { children: ReactNode }) {
  const { userRole } = useAuth();
  const [uiPermissions, setUIPermissions] = useState<UIPermissionsConfiguration>(DEFAULT_UI_PERMISSIONS);
  const [currentRoleConfig, setCurrentRoleConfig] = useState<RoleUIConfiguration | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    // Load UI permissions configuration from localStorage or API
    const loadUIPermissions = () => {
      try {
        const savedConfig = localStorage.getItem("jts-ui-permissions");
        if (savedConfig) {
          const parsedConfig = JSON.parse(savedConfig) as UIPermissionsConfiguration;
          const normalizedConfig = normalizeLegacyUIPermissions(parsedConfig);
          setUIPermissions(normalizedConfig);
          localStorage.setItem("jts-ui-permissions", JSON.stringify(normalizedConfig));
        } else {
          setUIPermissions(DEFAULT_UI_PERMISSIONS);
        }
      } catch (error) {
        console.error("Error loading UI permissions:", error);
        setUIPermissions(DEFAULT_UI_PERMISSIONS);
      } finally {
        setIsLoading(false);
      }
    };

    loadUIPermissions();
  }, []);

  useEffect(() => {
    // Update current role config when user or permissions change
    if (userRole && uiPermissions) {
      const roleConfig = uiPermissions.roles.find((r) => r.roleId === userRole);
      setCurrentRoleConfig(roleConfig || null);
    }
  }, [userRole, uiPermissions]);

  const updateUIPermissions = (config: UIPermissionsConfiguration) => {
    const updatedConfig = {
      ...config,
      updatedAt: new Date().toISOString(),
    };
    setUIPermissions(updatedConfig);
    localStorage.setItem("jts-ui-permissions", JSON.stringify(updatedConfig));
  };

  const updateRoleConfig = (roleId: string, config: RoleUIConfiguration) => {
    const updatedRoles = uiPermissions.roles.map((role) =>
      role.roleId === roleId ? config : role
    );
    updateUIPermissions({ ...uiPermissions, roles: updatedRoles });
  };

  const resetToDefault = () => {
    setUIPermissions(DEFAULT_UI_PERMISSIONS);
    localStorage.setItem("jts-ui-permissions", JSON.stringify(DEFAULT_UI_PERMISSIONS));
  };

  const hasPermission = (pageId: string, action: string): boolean => {
    if (!currentRoleConfig) return false;
    const pagePerm = currentRoleConfig.pagePermissions.find((p) => p.pageId === pageId);
    if (!pagePerm || !pagePerm.enabled) return false;
    return pagePerm.allowedActions.includes(action as any);
  };

  const isWidgetEnabled = (widgetId: string): boolean => {
    if (!currentRoleConfig) return false;
    const widget = currentRoleConfig.dashboardWidgets.find((w) => w.widgetId === widgetId);
    return widget?.enabled || false;
  };

  const isMenuItemEnabled = (menuId: string): boolean => {
    if (!currentRoleConfig) return false;
    const menuItem = currentRoleConfig.sidebarMenu.find((m) => m.id === menuId);
    return menuItem?.enabled || false;
  };

  return (
    <UIPermissionsContext.Provider
      value={{
        uiPermissions,
        currentRoleConfig,
        updateUIPermissions,
        updateRoleConfig,
        resetToDefault,
        isLoading,
        hasPermission,
        isWidgetEnabled,
        isMenuItemEnabled,
      }}
    >
      {children}
    </UIPermissionsContext.Provider>
  );
}

export function useUIPermissions() {
  const context = useContext(UIPermissionsContext);
  if (context === undefined) {
    throw new Error("useUIPermissions must be used within a UIPermissionsProvider");
  }
  return context;
}
