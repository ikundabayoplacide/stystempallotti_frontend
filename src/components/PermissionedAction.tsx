import type { ReactNode } from "react";
import { usePermissions } from "../hooks/usePermissions";
import type { PageAction } from "../types/UIPermissions";

interface PermissionedActionProps {
  pageId: string;
  action?: PageAction;
  detailedPermissionId?: string; // For detailed permission checks
  requireAll?: boolean; // If true, requires both action AND detailed permission
  fallback?: ReactNode; // Optional fallback content when permission denied
  children: ReactNode;
}

/**
 * Component that conditionally renders children based on user permissions
 * Supports both basic actions and detailed permissions
 * 
 * Examples:
 * - Basic action: <PermissionedAction pageId="users" action="delete">...</PermissionedAction>
 * - Detailed permission: <PermissionedAction pageId="users" detailedPermissionId="delete-users">...</PermissionedAction>
 * - Both: <PermissionedAction pageId="users" action="delete" detailedPermissionId="delete-users" requireAll>...</PermissionedAction>
 */
export function PermissionedAction({ 
  pageId, 
  action,
  detailedPermissionId,
  requireAll = false,
  fallback = null,
  children 
}: PermissionedActionProps) {
  const { hasPermission, hasDetailedPermission } = usePermissions();
  
  let hasAccess = true;

  // Check basic action permission
  if (action) {
    const hasActionPermission = hasPermission(pageId, action);
    if (requireAll) {
      hasAccess = hasAccess && hasActionPermission;
    } else {
      hasAccess = hasActionPermission;
    }
  }

  // Check detailed permission
  if (detailedPermissionId) {
    const hasDetailedPerm = hasDetailedPermission(pageId, detailedPermissionId);
    if (requireAll && action) {
      hasAccess = hasAccess && hasDetailedPerm;
    } else if (!action) {
      hasAccess = hasDetailedPerm;
    } else {
      // If not requireAll, either permission is sufficient
      hasAccess = hasAccess || hasDetailedPerm;
    }
  }

  if (!hasAccess) {
    return <>{fallback}</>;
  }
  
  return <>{children}</>;
}

export default PermissionedAction;
