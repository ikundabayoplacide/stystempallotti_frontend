import { useAuth } from "../context/AuthContext";
import { useUIPermissions } from "../context/UIPermissionsContext";

/**
 * Enhanced permissions hook with detailed permission checks
 */
export function usePermissions() {
  const { currentRoleConfig, hasPermission: hasBasicPermission } = useUIPermissions();
  const { userRole } = useAuth();

  /**
   * Check if user has a specific detailed permission
   */
  const hasDetailedPermission = (pageId: string, permissionId: string): boolean => {
    if (!currentRoleConfig) return false;
    
    const page = currentRoleConfig.pagePermissions.find(p => p.pageId === pageId);
    if (!page || !page.enabled) return false;
    
    if (!page.detailedPermissions) return true; // No detailed perms = allowed
    
    const permission = page.detailedPermissions.find(p => p.id === permissionId);
    return permission?.enabled ?? false;
  };

  /**
   * Check if user can access a page at all
   */
  const canAccessPage = (pageId: string): boolean => {
    if (!currentRoleConfig) return false;
    const page = currentRoleConfig.pagePermissions.find(p => p.pageId === pageId);
    return page?.enabled ?? false;
  };

  /**
   * Check if user should only see their own data
   */
  const isOwnDataOnly = (pageId: string): boolean => {
    if (!currentRoleConfig) return true;
    const page = currentRoleConfig.pagePermissions.find(p => p.pageId === pageId);
    return page?.dataFilters?.ownDataOnly ?? false;
  };

  /**
   * Check if user should only see department data
   */
  const isDepartmentOnly = (pageId: string): boolean => {
    if (!currentRoleConfig) return true;
    const page = currentRoleConfig.pagePermissions.find(p => p.pageId === pageId);
    return page?.dataFilters?.departmentOnly ?? false;
  };

  /**
   * Get custom filter for a page
   */
  const getCustomFilter = (pageId: string): string | undefined => {
    if (!currentRoleConfig) return undefined;
    const page = currentRoleConfig.pagePermissions.find(p => p.pageId === pageId);
    return page?.dataFilters?.customFilter;
  };

  /**
   * Check if user has any of the specified actions
   */
  const hasAnyAction = (pageId: string, actions: string[]): boolean => {
    return actions.some(action => hasBasicPermission(pageId, action));
  };

  /**
   * Check if user has all of the specified actions
   */
  const hasAllActions = (pageId: string, actions: string[]): boolean => {
    return actions.every(action => hasBasicPermission(pageId, action));
  };

  /**
   * Get all allowed actions for a page
   */
  const getAllowedActions = (pageId: string): string[] => {
    if (!currentRoleConfig) return [];
    const page = currentRoleConfig.pagePermissions.find(p => p.pageId === pageId);
    return page?.allowedActions ?? [];
  };

  return {
    userRole,
    currentRoleConfig,
    hasPermission: hasBasicPermission,
    hasDetailedPermission,
    canAccessPage,
    isOwnDataOnly,
    isDepartmentOnly,
    getCustomFilter,
    hasAnyAction,
    hasAllActions,
    getAllowedActions,
  };
}
