import { useState } from "react";
import {
    HiOutlineAdjustments,
    HiOutlineCog,
    HiOutlineRefresh,
    HiOutlineSave,
    HiOutlineShieldCheck,
    HiOutlineViewGrid,
} from "react-icons/hi";
import { DashboardLayout } from "../../components";
import { Button, Card } from "../../components/ui";
import { useUIPermissions } from "../../context/UIPermissionsContext";
import { type DashboardWidget, type PageAction } from "../../types/UIPermissions";

type SettingsSection = "widgets" | "menu" | "permissions";

const SETTINGS_SECTIONS: Array<{
  id: SettingsSection;
  label: string;
  description: string;
  icon: React.ComponentType<{ className?: string }>;
}> = [
  {
    id: "widgets",
    label: "Dashboard Widgets",
    description: "Configure visible dashboard widgets",
    icon: HiOutlineViewGrid,
  },
  {
    id: "menu",
    label: "Sidebar Menu",
    description: "Control navigation menu items",
    icon: HiOutlineAdjustments,
  },
  {
    id: "permissions",
    label: "Page Permissions",
    description: "Manage page access and actions",
    icon: HiOutlineShieldCheck,
  },
];

const ACTIONS: PageAction[] = [
  "view",
  "create",
  "edit",
  "delete",
  "approve",
  "reject",
  "export",
  "print",
  "assign",
  "reassign",
  "cancel",
];

export default function UIPermissionsPage() {
  const { uiPermissions, updateRoleConfig, resetToDefault } = useUIPermissions();
  const [selectedRole, setSelectedRole] = useState<string>(uiPermissions.roles[0]?.roleId || "");
  const [selectedSection, setSelectedSection] = useState<SettingsSection>("widgets");
  const [hasChanges, setHasChanges] = useState(false);

  const currentRoleConfig = uiPermissions.roles.find((role) => role.roleId === selectedRole);
  const activeSection = SETTINGS_SECTIONS.find((section) => section.id === selectedSection);

  const toggleWidget = (widgetId: DashboardWidget) => {
    if (!currentRoleConfig) return;
    const updatedWidgets = currentRoleConfig.dashboardWidgets.map((widget) =>
      widget.widgetId === widgetId ? { ...widget, enabled: !widget.enabled } : widget
    );
    updateRoleConfig(selectedRole, { ...currentRoleConfig, dashboardWidgets: updatedWidgets });
    setHasChanges(true);
  };

  const toggleMenuItem = (menuId: string) => {
    if (!currentRoleConfig) return;
    const updatedMenu = currentRoleConfig.sidebarMenu.map((menuItem) =>
      menuItem.id === menuId ? { ...menuItem, enabled: !menuItem.enabled } : menuItem
    );
    updateRoleConfig(selectedRole, { ...currentRoleConfig, sidebarMenu: updatedMenu });
    setHasChanges(true);
  };

  const togglePageAction = (pageId: string, action: PageAction) => {
    if (!currentRoleConfig) return;
    const updatedPermissions = currentRoleConfig.pagePermissions.map((page) => {
      if (page.pageId !== pageId) return page;
      const hasAction = page.allowedActions.includes(action);
      const updatedActions = hasAction
        ? page.allowedActions.filter((a) => a !== action)
        : [...page.allowedActions, action];
      return { ...page, allowedActions: updatedActions };
    });
    updateRoleConfig(selectedRole, { ...currentRoleConfig, pagePermissions: updatedPermissions });
    setHasChanges(true);
  };

  const toggleDetailedPermission = (pageId: string, permissionId: string, enabled: boolean) => {
    if (!currentRoleConfig) return;
    const updatedPermissions = currentRoleConfig.pagePermissions.map((page) => {
      if (page.pageId !== pageId || !page.detailedPermissions) return page;
      const updatedDetailedPerms = page.detailedPermissions.map((perm) =>
        perm.id === permissionId ? { ...perm, enabled } : perm
      );
      return { ...page, detailedPermissions: updatedDetailedPerms };
    });
    updateRoleConfig(selectedRole, { ...currentRoleConfig, pagePermissions: updatedPermissions });
    setHasChanges(true);
  };

  const handleSave = () => {
    alert("UI permissions saved successfully!");
    setHasChanges(false);
  };

  const handleReset = () => {
    if (confirm("Reset to default UI permissions? This cannot be undone.")) {
      resetToDefault();
      setHasChanges(false);
    }
  };

  if (!currentRoleConfig || !activeSection) return <div>Loading...</div>;

  const enabledWidgetsCount = currentRoleConfig.dashboardWidgets.filter((w) => w.enabled).length;
  const enabledMenuCount = currentRoleConfig.sidebarMenu.filter((m) => m.enabled).length;
  const enabledActionsCount = currentRoleConfig.pagePermissions.reduce((c, p) => c + p.allowedActions.length, 0);

  return (
    <DashboardLayout userRole="admin" userName="Admin" notificationCount={3}>
      <div className="space-y-6 font-[family-name:var(--font-family-primary)]">
        {/* Header */}
        <div className="flex flex-col gap-4 lg:flex-row lg:items-start lg:justify-between">
          <div>
            <h1 className="text-3xl font-bold text-secondary-100">UI Permissions</h1>
            <p className="mt-2 text-sm text-custom-700">
              Configure dashboard widgets, sidebar menu, and page permissions for each role
            </p>
          </div>
          <div className="flex gap-2">
            <Button onClick={handleReset} variant="outline" className="flex items-center gap-2">
              <HiOutlineRefresh className="h-4 w-4" />
              Reset
            </Button>
            <Button onClick={handleSave} disabled={!hasChanges} className="flex items-center gap-2">
              <HiOutlineSave className="h-4 w-4" />
              Save Changes
            </Button>
          </div>
        </div>

        {/* Main Layout */}
        <div className="grid gap-6 lg:grid-cols-[280px_1fr]">
          {/* Sidebar */}
          <Card className="!p-0 h-fit">
            {/* Roles */}
            <div className="border-b border-custom-300 p-4">
              <h3 className="text-sm font-bold text-custom-700 mb-3">ROLES</h3>
              <div className="space-y-1">
                {uiPermissions.roles.map((role) => (
                  <button
                    key={role.roleId}
                    onClick={() => setSelectedRole(role.roleId)}
                    className={`w-full text-left px-3 py-2 rounded-lg text-sm transition-colors ${
                      selectedRole === role.roleId
                        ? "bg-primary-500 text-white font-semibold"
                        : "hover:bg-custom-100 text-custom-700"
                    }`}
                  >
                    {role.roleName}
                  </button>
                ))}
              </div>
            </div>

            {/* Sections */}
            <div className="p-4">
              <h3 className="text-sm font-bold text-custom-700 mb-3">CONFIGURE</h3>
              <div className="space-y-1">
                {SETTINGS_SECTIONS.map((section) => (
                  <button
                    key={section.id}
                    onClick={() => setSelectedSection(section.id)}
                    className={`w-full flex items-center gap-3 px-3 py-2 rounded-lg text-sm transition-colors ${
                      selectedSection === section.id
                        ? "bg-custom-100 text-secondary-100 font-medium"
                        : "hover:bg-custom-50 text-custom-700"
                    }`}
                  >
                    <section.icon className="h-4 w-4" />
                    {section.label}
                  </button>
                ))}
              </div>
            </div>
          </Card>

          {/* Content */}
          <div className="space-y-4">
            <Card>
              <div className="flex items-start justify-between mb-6">
                <div>
                  <h2 className="text-xl font-bold text-secondary-100">{activeSection.label}</h2>
                  <p className="text-sm text-custom-700 mt-1">{activeSection.description}</p>
                </div>
                <div className="flex gap-4 text-sm">
                  <div className="text-center">
                    <div className="font-bold text-secondary-100">{enabledWidgetsCount}/{currentRoleConfig.dashboardWidgets.length}</div>
                    <div className="text-xs text-custom-700">Widgets</div>
                  </div>
                  <div className="text-center">
                    <div className="font-bold text-secondary-100">{enabledMenuCount}/{currentRoleConfig.sidebarMenu.length}</div>
                    <div className="text-xs text-custom-700">Menu</div>
                  </div>
                  <div className="text-center">
                    <div className="font-bold text-secondary-100">{enabledActionsCount}</div>
                    <div className="text-xs text-custom-700">Actions</div>
                  </div>
                </div>
              </div>

              {/* Widgets Section */}
              {selectedSection === "widgets" && (
                <div className="space-y-3">
                  {currentRoleConfig.dashboardWidgets.sort((a, b) => a.order - b.order).map((widget) => (
                    <div key={widget.widgetId} className="flex items-center justify-between p-3 rounded-lg border border-custom-300">
                      <div>
                        <div className="font-semibold text-secondary-100">{widget.widgetName}</div>
                        <div className="text-xs text-custom-700 mt-1">Order: {widget.order} • Size: {widget.size || "medium"}</div>
                      </div>
                      <ToggleSwitch enabled={widget.enabled} onClick={() => toggleWidget(widget.widgetId)} />
                    </div>
                  ))}
                </div>
              )}

              {/* Menu Section */}
              {selectedSection === "menu" && (
                <div className="space-y-3">
                  {currentRoleConfig.sidebarMenu.sort((a, b) => a.order - b.order).map((menuItem) => (
                    <div key={menuItem.id} className="flex items-center justify-between p-3 rounded-lg border border-custom-300">
                      <div>
                        <div className="font-semibold text-secondary-100">{menuItem.label}</div>
                        <div className="text-xs text-custom-700 mt-1 font-mono">{menuItem.path}</div>
                      </div>
                      <ToggleSwitch enabled={menuItem.enabled} onClick={() => toggleMenuItem(menuItem.id)} />
                    </div>
                  ))}
                </div>
              )}

              {/* Permissions Section */}
              {selectedSection === "permissions" && (
                <div className="space-y-6">
                  {currentRoleConfig.pagePermissions.map((page) => (
                    <div key={page.pageId} className="rounded-lg border border-custom-300 overflow-hidden">
                      {/* Page Header */}
                      <div className="bg-custom-50 px-4 py-3 border-b border-custom-300">
                        <div className="flex items-start justify-between">
                          <div>
                            <div className="font-semibold text-secondary-100">{page.pageName}</div>
                            <div className="text-xs text-custom-700 mt-1">{page.pageId}</div>
                          </div>
                          <span className={`px-2 py-1 rounded-full text-xs font-semibold ${page.enabled ? "bg-green-100 text-green-700" : "bg-red-100 text-red-700"}`}>
                            {page.enabled ? "Enabled" : "Disabled"}
                          </span>
                        </div>
                      </div>

                      {/* Basic Actions */}
                      <div className="px-4 py-3 border-b border-custom-300 bg-white">
                        <div className="text-xs font-semibold text-custom-700 mb-2">BASIC ACTIONS</div>
                        <div className="flex flex-wrap gap-2">
                          {ACTIONS.map((action) => {
                            const isEnabled = page.allowedActions.includes(action);
                            return (
                              <button
                                key={action}
                                onClick={() => togglePageAction(page.pageId, action)}
                                className={`px-3 py-1.5 rounded-full text-xs font-semibold capitalize transition-all ${
                                  isEnabled 
                                    ? "bg-primary-500 text-white shadow-sm" 
                                    : "bg-custom-200 text-custom-600 hover:bg-custom-300 border border-custom-300"
                                }`}
                              >
                                {action.replace("-", " ")}
                              </button>
                            );
                          })}
                        </div>
                      </div>

                      {/* Detailed Permissions */}
                      {page.detailedPermissions && page.detailedPermissions.length > 0 && (
                        <div className="px-4 py-3 bg-white">
                          <div className="text-xs font-semibold text-custom-700 mb-3">DETAILED PERMISSIONS</div>
                          <div className="space-y-4">
                            {page.detailedPermissions.map((permission) => (
                              <div key={permission.id} className="flex items-start justify-between py-2 border-b border-custom-100 last:border-0">
                                <div className="flex-1 pr-4">
                                  <div className="text-sm text-secondary-100">{permission.question}</div>
                                  {permission.description && (
                                    <div className="text-xs text-custom-600 mt-1">{permission.description}</div>
                                  )}
                                </div>
                                <div className="flex items-center gap-4">
                                  <label className="flex items-center gap-2 cursor-pointer">
                                    <input
                                      type="radio"
                                      name={`${page.pageId}-${permission.id}`}
                                      checked={permission.enabled}
                                      onChange={() => toggleDetailedPermission(page.pageId, permission.id, true)}
                                      className="w-4 h-4 text-primary-500 cursor-pointer"
                                    />
                                    <span className="text-sm text-secondary-100">Yes</span>
                                  </label>
                                  <label className="flex items-center gap-2 cursor-pointer">
                                    <input
                                      type="radio"
                                      name={`${page.pageId}-${permission.id}`}
                                      checked={!permission.enabled}
                                      onChange={() => toggleDetailedPermission(page.pageId, permission.id, false)}
                                      className="w-4 h-4 text-custom-500 cursor-pointer"
                                    />
                                    <span className="text-sm text-secondary-100">No</span>
                                  </label>
                                </div>
                              </div>
                            ))}
                          </div>
                        </div>
                      )}
                    </div>
                  ))}
                </div>
              )}
            </Card>

            {/* Unsaved Changes Banner */}
            {hasChanges && (
              <Card className="!bg-yellow-50 !border-yellow-300">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-3">
                    <HiOutlineCog className="h-5 w-5 text-yellow-600" />
                    <div>
                      <div className="font-semibold text-secondary-100">Unsaved Changes</div>
                      <div className="text-sm text-custom-700">Click Save Changes to apply</div>
                    </div>
                  </div>
                  <Button onClick={handleSave}>
                    <HiOutlineSave className="h-4 w-4 mr-2" />
                    Save Now
                  </Button>
                </div>
              </Card>
            )}
          </div>
        </div>
      </div>
    </DashboardLayout>
  );
}

function ToggleSwitch({ enabled, onClick }: { enabled: boolean; onClick: () => void }) {
  return (
    <button
      onClick={onClick}
      className={`relative inline-flex h-6 w-11 items-center rounded-full transition-colors ${
        enabled ? "bg-primary-500" : "bg-custom-300"
      }`}
    >
      <span
        className={`inline-block h-4 w-4 transform rounded-full bg-white transition-transform ${
          enabled ? "translate-x-6" : "translate-x-1"
        }`}
      />
    </button>
  );
}
