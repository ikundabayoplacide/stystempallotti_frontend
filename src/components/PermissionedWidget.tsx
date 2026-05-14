import type { ReactNode } from "react";
import { useUIPermissions } from "../context/UIPermissionsContext";
import type { DashboardWidget } from "../types/UIPermissions";

interface PermissionedWidgetProps {
  widgetId: DashboardWidget;
  children: ReactNode;
  fallback?: ReactNode;
}

/**
 * Component that conditionally renders dashboard widgets based on user permissions
 * Also applies widget-specific settings like size and refresh interval
 * 
 * Example:
 * <PermissionedWidget widgetId="jobs-in-progress">
 *   <JobsWidget />
 * </PermissionedWidget>
 */
export function PermissionedWidget({ widgetId, children, fallback = null }: PermissionedWidgetProps) {
  const { isWidgetEnabled, currentRoleConfig } = useUIPermissions();
  
  if (!isWidgetEnabled(widgetId)) {
    return <>{fallback}</>;
  }

  // Get widget configuration
  const widgetConfig = currentRoleConfig?.dashboardWidgets.find(w => w.widgetId === widgetId);
  
  // Apply widget size class if configured
  const sizeClass = widgetConfig?.size ? `widget-${widgetConfig.size}` : '';
  
  // Wrap in div with size class if size is specified
  if (sizeClass) {
    return (
      <div className={sizeClass} data-widget-id={widgetId}>
        {children}
      </div>
    );
  }
  
  return <>{children}</>;
}

export default PermissionedWidget;
