import { useMemo, useState } from "react";
import {
  HiOutlineCheck,
  HiOutlineExclamation,
  HiOutlineLockClosed,
  HiOutlineLockOpen,
  HiOutlinePencil,
  HiOutlinePlus,
  HiOutlineRefresh,
  HiOutlineShieldCheck,
  HiOutlineTrash,
  HiOutlineX,
} from "react-icons/hi";
import { DashboardLayout } from "../../components";
import { Button, Card } from "../../components/ui";
import type {
  CreatePermissionPayload,
  Permission,
} from "../../store/services/permissionsService";
import {
  useCreatePermissionMutation,
  useDeletePermissionMutation,
  useGetAllPermissionsQuery,
  useGetPermissionsForRoleQuery,
  useReplaceRolePermissionsMutation,
  useUpdatePermissionMutation,
} from "../../store/services/permissionsService";
import type { Role } from "../../store/services/rolesService";
import {
  useCreateRoleMutation,
  useDeleteRoleMutation,
  useGetAllRolesQuery,
  useUpdateRoleMutation,
} from "../../store/services/rolesService";

// ─── Constants ────────────────────────────────────────────────────────────────

/** Colour palette cycled for dynamically-created roles */
const ROLE_COLORS = [
  "bg-red-100 text-red-700",
  "bg-blue-100 text-blue-700",
  "bg-green-100 text-green-700",
  "bg-purple-100 text-purple-700",
  "bg-yellow-100 text-yellow-700",
  "bg-orange-100 text-orange-700",
  "bg-teal-100 text-teal-700",
  "bg-indigo-100 text-indigo-700",
  "bg-gray-100 text-gray-700",
  "bg-pink-100 text-pink-700",
  "bg-cyan-100 text-cyan-700",
  "bg-lime-100 text-lime-700",
];

function roleColor(name: string, index: number): string {
  // Keep stable colours for system roles
  const fixed: Record<string, string> = {
    ADMIN:              "bg-red-100 text-red-700",
    RECEPTIONIST:       "bg-blue-100 text-blue-700",
    SALES:              "bg-green-100 text-green-700",
    DAF:                "bg-purple-100 text-purple-700",
    ACCOUNTANT:         "bg-yellow-100 text-yellow-700",
    PRODUCTION_MANAGER: "bg-orange-100 text-orange-700",
    STOCK:              "bg-teal-100 text-teal-700",
    SUPERVISOR:         "bg-indigo-100 text-indigo-700",
    WORKER:             "bg-gray-100 text-gray-700",
  };
  return fixed[name] ?? ROLE_COLORS[index % ROLE_COLORS.length];
}

const RESOURCE_LABELS: Record<string, string> = {
  jobs:             "Jobs",
  users:            "Users",
  customers:        "Customers",
  payments:         "Payments",
  invoices:         "Invoices",
  quotations:       "Quotations",
  stock:            "Stock / Inventory",
  suppliers:        "Suppliers",
  reports:          "Reports",
  production:       "Production",
  departments:      "Departments",
  workers:          "Workers",
  tasks:            "Tasks",
  materials:        "Material Requests",
  visitors:         "Visitors / Reception",
  boutique:         "Boutique",
  deliveries:       "Deliveries",
  dossiers:         "Dossiers",
  taxes:            "Taxes",
  procurement:      "Procurement",
  recovery:         "Recovery",
  hr:               "HR Management",
  finance:          "Finance Control",
  settings:         "System Settings",
  dashboard:        "Dashboard",
  teams:            "Teams",
  timelogs:         "Time Logs",
  ui_permissions:   "UI Permissions",
  workflow_config:  "Workflow Config",
};

// Action badge colors — solid enough to read clearly
const ACTION_COLORS: Record<string, string> = {
  view:     "bg-blue-100 text-blue-800 border border-blue-300",
  create:   "bg-green-100 text-green-800 border border-green-300",
  edit:     "bg-amber-100 text-amber-800 border border-amber-300",
  update:   "bg-amber-100 text-amber-800 border border-amber-300",
  delete:   "bg-red-100 text-red-800 border border-red-300",
  approve:  "bg-purple-100 text-purple-800 border border-purple-300",
  reject:   "bg-orange-100 text-orange-800 border border-orange-300",
  export:   "bg-teal-100 text-teal-800 border border-teal-300",
  print:    "bg-teal-100 text-teal-800 border border-teal-300",
  assign:   "bg-indigo-100 text-indigo-800 border border-indigo-300",
  reassign: "bg-indigo-100 text-indigo-800 border border-indigo-300",
  cancel:   "bg-gray-100 text-gray-700 border border-gray-300",
  manage:   "bg-pink-100 text-pink-800 border border-pink-300",
};

function actionBadge(action: string) {
  return ACTION_COLORS[action] ?? "bg-custom-50 text-custom-600 border border-custom-200";
}

// ─── Helpers ──────────────────────────────────────────────────────────────────

function groupByResource(permissions: Permission[]): Record<string, Permission[]> {
  return permissions.reduce<Record<string, Permission[]>>((acc, perm) => {
    const key = perm.resource ?? perm.name.split(".")[0];
    if (!acc[key]) acc[key] = [];
    acc[key].push(perm);
    return acc;
  }, {});
}

// ─── Permission Row ───────────────────────────────────────────────────────────

function PermissionRow({
  permission,
  granted,
  onToggle,
  onEdit,
  onDelete,
}: {
  permission: Permission;
  granted: boolean;
  onToggle: () => void;
  onEdit: (p: Permission) => void;
  onDelete: (p: Permission) => void;
}) {
  const action = permission.action ?? permission.name.split(".")[1] ?? "";

  return (
    <div
      className={`
        group flex items-center justify-between px-3 py-2.5 rounded-lg border transition-all
        ${granted
          ? "bg-white border-green-200 hover:border-green-400"
          : "bg-gray-50 border-gray-200 hover:border-gray-400"
        }
      `}
    >
      {/* Checkbox + name — clickable area for toggle */}
      <div
        onClick={onToggle}
        className="flex items-center gap-3 min-w-0 flex-1 cursor-pointer"
      >
        <div className={`
          w-5 h-5 rounded flex items-center justify-center shrink-0 border-2 transition-colors
          ${granted ? "bg-green-500 border-green-500" : "bg-white border-gray-300"}
        `}>
          {granted && <HiOutlineCheck className="h-3 w-3 text-white stroke-2" />}
        </div>
        <div className="min-w-0">
          <span className={`text-sm font-mono truncate block ${granted ? "text-gray-900 font-semibold" : "text-gray-400"}`}>
            {permission.name}
          </span>
          {permission.description && (
            <span className="text-xs text-custom-400 truncate block">{permission.description}</span>
          )}
        </div>
      </div>

      {/* Right: action badge + lock + controls */}
      <div className="flex items-center gap-1.5 shrink-0 ml-2">
        <span className={`text-xs font-bold px-2 py-0.5 rounded-full capitalize ${actionBadge(action)}`}>
          {action}
        </span>
        {granted
          ? <HiOutlineLockOpen className="h-4 w-4 text-green-500 shrink-0" />
          : <HiOutlineLockClosed className="h-4 w-4 text-gray-300 shrink-0" />
        }
        {/* Edit / Delete — appear on hover */}
        <button
          onClick={(e) => { e.stopPropagation(); onEdit(permission); }}
          className="opacity-0 group-hover:opacity-100 p-1 rounded text-custom-400 hover:text-primary-600 hover:bg-primary-50 transition-all"
          title="Edit permission"
        >
          <HiOutlinePencil className="h-3.5 w-3.5" />
        </button>
        <button
          onClick={(e) => { e.stopPropagation(); onDelete(permission); }}
          className="opacity-0 group-hover:opacity-100 p-1 rounded text-custom-400 hover:text-red-600 hover:bg-red-50 transition-all"
          title="Delete permission"
        >
          <HiOutlineTrash className="h-3.5 w-3.5" />
        </button>
      </div>
    </div>
  );
}

// ─── Resource Group ───────────────────────────────────────────────────────────

function ResourceGroup({
  resource,
  perms,
  effectiveNames,
  onToggle,
  onToggleAll,
  onAddPermission,
  onEditPermission,
  onDeletePermission,
}: {
  resource: string;
  perms: Permission[];
  effectiveNames: Set<string>;
  onToggle: (name: string) => void;
  onToggleAll: (perms: Permission[], grant: boolean) => void;
  onAddPermission: (resource: string) => void;
  onEditPermission: (p: Permission) => void;
  onDeletePermission: (p: Permission) => void;
}) {
  const grantedCount = perms.filter((p) => effectiveNames.has(p.name)).length;
  const allGranted = grantedCount === perms.length;
  const noneGranted = grantedCount === 0;

  return (
    <div className="rounded-xl border border-custom-200 overflow-hidden">
      {/* Header */}
      <div className={`
        flex items-center justify-between px-4 py-3 border-b border-gray-200
        ${allGranted ? "bg-green-50" : noneGranted ? "bg-gray-50" : "bg-blue-50"}
      `}>
        <div className="flex items-center gap-3">
          <HiOutlineShieldCheck className={`h-5 w-5 shrink-0 ${allGranted ? "text-green-600" : "text-gray-400"}`} />
          <div>
            <span className="font-bold text-gray-900 text-sm">
              {RESOURCE_LABELS[resource] ?? resource}
            </span>
            <span className="ml-2 text-xs text-gray-500 font-medium">
              {grantedCount} / {perms.length} granted
            </span>
          </div>
        </div>

        <div className="flex items-center gap-3">
          <div className="w-24 h-1.5 bg-custom-200 rounded-full overflow-hidden">
            <div
              className="h-full bg-primary-500 rounded-full transition-all"
              style={{ width: `${(grantedCount / perms.length) * 100}%` }}
            />
          </div>
          <button
            onClick={(e) => { e.stopPropagation(); onToggleAll(perms, true); }}
            disabled={allGranted}
            className="text-xs font-semibold text-green-600 hover:underline disabled:opacity-30 disabled:no-underline"
          >
            Grant all
          </button>
          <span className="text-custom-300 text-xs">|</span>
          <button
            onClick={(e) => { e.stopPropagation(); onToggleAll(perms, false); }}
            disabled={noneGranted}
            className="text-xs font-semibold text-red-500 hover:underline disabled:opacity-30 disabled:no-underline"
          >
            Revoke all
          </button>
          <span className="text-custom-300 text-xs">|</span>
          {/* Add permission to this resource */}
          <button
            onClick={(e) => { e.stopPropagation(); onAddPermission(resource); }}
            className="flex items-center gap-1 text-xs font-semibold text-primary-600 hover:underline"
            title={`Add permission to ${resource}`}
          >
            <HiOutlinePlus className="h-3.5 w-3.5" />
            Add
          </button>
        </div>
      </div>

      {/* Permission rows */}
      <div className="p-3 grid grid-cols-1 md:grid-cols-2 gap-2 bg-white">
        {perms.map((perm) => (
          <PermissionRow
            key={perm.name}
            permission={perm}
            granted={effectiveNames.has(perm.name)}
            onToggle={() => onToggle(perm.name)}
            onEdit={onEditPermission}
            onDelete={onDeletePermission}
          />
        ))}
      </div>
    </div>
  );
}

// ─── Role Permissions Panel ───────────────────────────────────────────────────

function RolePermissionsPanel({ role }: { role: string }) {
  const { data: allPerms = [], isLoading: loadingAll } = useGetAllPermissionsQuery();
  const { data: rolePerms = [], isLoading: loadingRole, isFetching } = useGetPermissionsForRoleQuery(role);
  const [replacePermissions, { isLoading: isSaving }] = useReplaceRolePermissionsMutation();

  const [draft, setDraft] = useState<Set<string> | null>(null);

  // Permission CRUD modals
  const [addPermResource, setAddPermResource] = useState<string | null>(null);
  const [editPerm, setEditPerm] = useState<Permission | null>(null);
  const [deletePerm, setDeletePerm] = useState<Permission | null>(null);

  const grantedNames = useMemo(() => {
    const arr = Array.isArray(rolePerms) ? rolePerms : [];
    return new Set(arr.map((p) => p.name));
  }, [rolePerms]);

  const effectiveNames: Set<string> = useMemo(
    () => draft ?? grantedNames,
    [draft, grantedNames]
  );

  const hasChanges = useMemo(() => {
    if (!draft) return false;
    if (draft.size !== grantedNames.size) return true;
    for (const name of draft) if (!grantedNames.has(name)) return true;
    return false;
  }, [draft, grantedNames]);

  const grouped = useMemo(() => groupByResource(allPerms), [allPerms]);

  function toggle(permName: string) {
    setDraft((prev) => {
      const base = new Set(prev ?? grantedNames);
      base.has(permName) ? base.delete(permName) : base.add(permName);
      return base;
    });
  }

  function toggleAll(perms: Permission[], grant: boolean) {
    setDraft((prev) => {
      const base = new Set(prev ?? grantedNames);
      perms.forEach((p) => grant ? base.add(p.name) : base.delete(p.name));
      return base;
    });
  }

  async function handleSave() {
    if (!draft) return;
    const permissionIds = allPerms.filter((p) => draft.has(p.name)).map((p) => p.id);
    await replacePermissions({ role, permissionIds });
    setDraft(null);
  }

  if (loadingAll || loadingRole) {
    return (
      <div className="flex flex-col items-center justify-center py-24 gap-3 text-custom-500">
        <HiOutlineRefresh className="h-8 w-8 animate-spin" />
        <span className="text-sm">Loading permissions…</span>
      </div>
    );
  }

  const totalGranted = effectiveNames.size;
  const totalAvailable = allPerms.length;
  const pct = totalAvailable > 0 ? Math.round((totalGranted / totalAvailable) * 100) : 0;

  return (
    <>
      <div className="space-y-4">
        {/* Summary bar */}
        <div className="flex items-center justify-between flex-wrap gap-3 pb-4 border-b border-custom-200">
          <div className="flex items-center gap-4">
            <div>
              <span className="text-2xl font-bold text-secondary-100">{totalGranted}</span>
              <span className="text-sm text-custom-500"> / {totalAvailable} permissions</span>
            </div>
            <div className="w-32 h-2 bg-custom-200 rounded-full overflow-hidden">
              <div
                className="h-full bg-primary-500 rounded-full transition-all"
                style={{ width: `${pct}%` }}
              />
            </div>
            <span className="text-sm font-semibold text-primary-500">{pct}%</span>
            {isFetching && !loadingRole && (
              <span className="text-xs text-custom-400 flex items-center gap-1">
                <HiOutlineRefresh className="h-3 w-3 animate-spin" /> syncing
              </span>
            )}
          </div>

          <div className="flex gap-2">
            {hasChanges && (
              <Button variant="outline" onClick={() => setDraft(null)} className="text-sm">
                Discard
              </Button>
            )}
            <Button
              onClick={handleSave}
              disabled={!hasChanges || isSaving}
              className="flex items-center gap-2 text-sm"
            >
              {isSaving
                ? <HiOutlineRefresh className="h-4 w-4 animate-spin" />
                : <HiOutlineCheck className="h-4 w-4" />
              }
              {isSaving ? "Saving…" : "Save Changes"}
            </Button>
          </div>
        </div>

        {/* Unsaved banner */}
        {hasChanges && (
          <div className="flex items-center gap-3 rounded-lg border border-yellow-300 bg-yellow-50 px-4 py-3 text-sm">
            <HiOutlineExclamation className="h-5 w-5 text-yellow-600 shrink-0" />
            <span className="text-yellow-800">
              You have unsaved changes — click <strong>Save Changes</strong> to apply to the backend.
            </span>
          </div>
        )}

        {/* Resource groups */}
        {allPerms.length === 0 ? (
          <div className="rounded-xl border border-custom-200 bg-custom-50 px-6 py-16 text-center">
            <HiOutlineShieldCheck className="h-12 w-12 text-custom-300 mx-auto mb-4" />
            <p className="font-bold text-secondary-100">No permissions found</p>
            <p className="text-sm text-custom-500 mt-1">
              Run the seed:{" "}
              <code className="bg-custom-100 px-1.5 py-0.5 rounded text-xs font-mono">
                npx sequelize-cli db:seed --seed 08-permissions.js
              </code>
            </p>
          </div>
        ) : (
          <div className="space-y-3">
            {Object.entries(grouped)
              .sort(([a], [b]) => a.localeCompare(b))
              .map(([resource, perms]) => (
                <ResourceGroup
                  key={resource}
                  resource={resource}
                  perms={perms}
                  effectiveNames={effectiveNames}
                  onToggle={toggle}
                  onToggleAll={toggleAll}
                  onAddPermission={(res) => setAddPermResource(res)}
                  onEditPermission={(p) => setEditPerm(p)}
                  onDeletePermission={(p) => setDeletePerm(p)}
                />
              ))}
            {/* Add permission to a brand-new resource */}
            <button
              onClick={() => setAddPermResource("")}
              className="w-full flex items-center justify-center gap-2 py-3 rounded-xl border-2 border-dashed border-custom-300 text-sm text-custom-500 hover:border-primary-400 hover:text-primary-600 transition-colors"
            >
              <HiOutlinePlus className="h-4 w-4" />
              Add permission to new resource
            </button>
          </div>
        )}
      </div>

      {/* Permission modals */}
      {addPermResource !== null && (
        <CreatePermissionModal
          defaultResource={addPermResource}
          onClose={() => setAddPermResource(null)}
        />
      )}
      {editPerm && (
        <EditPermissionModal
          permission={editPerm}
          onClose={() => setEditPerm(null)}
        />
      )}
      {deletePerm && (
        <DeletePermissionModal
          permission={deletePerm}
          onClose={() => setDeletePerm(null)}
        />
      )}
    </>
  );
}

// ─── Create Permission Modal ──────────────────────────────────────────────────

const COMMON_ACTIONS = ["view", "create", "edit", "delete", "approve", "reject", "export", "print", "assign", "manage", "cancel"];

function CreatePermissionModal({
  defaultResource,
  onClose,
}: {
  defaultResource: string;
  onClose: () => void;
}) {
  const [resource, setResource] = useState(defaultResource);
  const [action, setAction] = useState("");
  const [customAction, setCustomAction] = useState("");
  const [description, setDescription] = useState("");
  const [createPermission, { isLoading, error }] = useCreatePermissionMutation();

  const effectiveAction = action === "__custom__" ? customAction : action;
  const name = resource && effectiveAction ? `${resource}.${effectiveAction}` : "";

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (!resource.trim() || !effectiveAction.trim()) return;
    try {
      await createPermission({
        name,
        resource: resource.trim(),
        action: effectiveAction.trim(),
        description: description.trim() || undefined,
      } as CreatePermissionPayload).unwrap();
      onClose();
    } catch {
      // error shown below
    }
  }

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 backdrop-blur-sm p-4">
      <div className="bg-white rounded-2xl shadow-2xl w-full max-w-md">
        <div className="flex items-center justify-between px-6 py-4 border-b border-custom-200">
          <h2 className="text-lg font-bold text-secondary-100">Add Permission</h2>
          <button onClick={onClose} className="text-custom-400 hover:text-custom-700 transition-colors">
            <HiOutlineX className="h-5 w-5" />
          </button>
        </div>

        <form onSubmit={handleSubmit} className="p-6 space-y-4">
          {/* Resource */}
          <div>
            <label className="block text-sm font-semibold text-secondary-100 mb-1">
              Resource <span className="text-red-500">*</span>
            </label>
            <input
              type="text"
              value={resource}
              onChange={(e) => setResource(e.target.value.toLowerCase().replace(/\s+/g, "_"))}
              placeholder="e.g. jobs"
              className="w-full px-3 py-2 rounded-lg border border-custom-300 bg-white text-sm font-mono focus:outline-none focus:ring-2 focus:ring-primary-500 transition-colors"
            />
            <p className="mt-1 text-xs text-custom-400">Lowercase, underscores only</p>
          </div>

          {/* Action */}
          <div>
            <label className="block text-sm font-semibold text-secondary-100 mb-1">
              Action <span className="text-red-500">*</span>
            </label>
            <select
              value={action}
              onChange={(e) => setAction(e.target.value)}
              className="w-full px-3 py-2 rounded-lg border border-custom-300 bg-white text-sm focus:outline-none focus:ring-2 focus:ring-primary-500 transition-colors"
            >
              <option value="">Select action…</option>
              {COMMON_ACTIONS.map((a) => (
                <option key={a} value={a}>{a}</option>
              ))}
              <option value="__custom__">Custom…</option>
            </select>
            {action === "__custom__" && (
              <input
                type="text"
                value={customAction}
                onChange={(e) => setCustomAction(e.target.value.toLowerCase())}
                placeholder="e.g. archive"
                className="mt-2 w-full px-3 py-2 rounded-lg border border-custom-300 bg-white text-sm font-mono focus:outline-none focus:ring-2 focus:ring-primary-500 transition-colors"
              />
            )}
          </div>

          {/* Preview */}
          {name && (
            <div className="flex items-center gap-2 rounded-lg bg-custom-50 border border-custom-200 px-3 py-2">
              <span className="text-xs text-custom-500">Permission name:</span>
              <code className="text-sm font-mono font-bold text-secondary-100">{name}</code>
            </div>
          )}

          {/* Description */}
          <div>
            <label className="block text-sm font-semibold text-secondary-100 mb-1">Description</label>
            <input
              type="text"
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              placeholder="Optional description"
              className="w-full px-3 py-2 rounded-lg border border-custom-300 bg-white text-sm focus:outline-none focus:ring-2 focus:ring-primary-500 transition-colors"
            />
          </div>

          {error && (
            <div className="flex items-center gap-2 rounded-lg border border-red-300 bg-red-50 px-3 py-2 text-sm text-red-700">
              <HiOutlineExclamation className="h-4 w-4 shrink-0" />
              {(error as any)?.data?.message ?? "Failed to create permission."}
            </div>
          )}

          <div className="flex justify-end gap-2 pt-2">
            <Button variant="outline" type="button" onClick={onClose} className="text-sm">Cancel</Button>
            <Button
              type="submit"
              disabled={!resource.trim() || !effectiveAction.trim() || isLoading}
              className="flex items-center gap-2 text-sm"
            >
              {isLoading ? <HiOutlineRefresh className="h-4 w-4 animate-spin" /> : <HiOutlinePlus className="h-4 w-4" />}
              {isLoading ? "Creating…" : "Create Permission"}
            </Button>
          </div>
        </form>
      </div>
    </div>
  );
}

// ─── Edit Permission Modal ────────────────────────────────────────────────────

function EditPermissionModal({ permission, onClose }: { permission: Permission; onClose: () => void }) {
  const [description, setDescription] = useState(permission.description ?? "");
  const [updatePermission, { isLoading, error }] = useUpdatePermissionMutation();

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    try {
      await updatePermission({ id: permission.id, description: description.trim() || undefined }).unwrap();
      onClose();
    } catch {
      // error shown below
    }
  }

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 backdrop-blur-sm p-4">
      <div className="bg-white rounded-2xl shadow-2xl w-full max-w-md">
        <div className="flex items-center justify-between px-6 py-4 border-b border-custom-200">
          <h2 className="text-lg font-bold text-secondary-100">Edit Permission</h2>
          <button onClick={onClose} className="text-custom-400 hover:text-custom-700 transition-colors">
            <HiOutlineX className="h-5 w-5" />
          </button>
        </div>

        <form onSubmit={handleSubmit} className="p-6 space-y-4">
          <div className="rounded-lg bg-custom-50 border border-custom-200 px-3 py-2">
            <span className="text-xs text-custom-500">Permission</span>
            <p className="text-sm font-mono font-bold text-secondary-100">{permission.name}</p>
          </div>

          <div>
            <label className="block text-sm font-semibold text-secondary-100 mb-1">Description</label>
            <input
              type="text"
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              placeholder="Optional description"
              className="w-full px-3 py-2 rounded-lg border border-custom-300 bg-white text-sm focus:outline-none focus:ring-2 focus:ring-primary-500 transition-colors"
            />
          </div>

          {error && (
            <div className="flex items-center gap-2 rounded-lg border border-red-300 bg-red-50 px-3 py-2 text-sm text-red-700">
              <HiOutlineExclamation className="h-4 w-4 shrink-0" />
              {(error as any)?.data?.message ?? "Failed to update permission."}
            </div>
          )}

          <div className="flex justify-end gap-2 pt-2">
            <Button variant="outline" type="button" onClick={onClose} className="text-sm">Cancel</Button>
            <Button type="submit" disabled={isLoading} className="flex items-center gap-2 text-sm">
              {isLoading ? <HiOutlineRefresh className="h-4 w-4 animate-spin" /> : <HiOutlineCheck className="h-4 w-4" />}
              {isLoading ? "Saving…" : "Save"}
            </Button>
          </div>
        </form>
      </div>
    </div>
  );
}

// ─── Delete Permission Modal ──────────────────────────────────────────────────

function DeletePermissionModal({ permission, onClose }: { permission: Permission; onClose: () => void }) {
  const [deletePermission, { isLoading, error }] = useDeletePermissionMutation();

  async function handleDelete() {
    try {
      await deletePermission(permission.id).unwrap();
      onClose();
    } catch {
      // error shown below
    }
  }

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 backdrop-blur-sm p-4">
      <div className="bg-white rounded-2xl shadow-2xl w-full max-w-sm">
        <div className="flex items-center justify-between px-6 py-4 border-b border-custom-200">
          <h2 className="text-lg font-bold text-secondary-100">Delete Permission</h2>
          <button onClick={onClose} className="text-custom-400 hover:text-custom-700 transition-colors">
            <HiOutlineX className="h-5 w-5" />
          </button>
        </div>

        <div className="p-6 space-y-4">
          <p className="text-sm text-custom-700">
            Delete{" "}
            <span className="font-bold font-mono text-secondary-100">{permission.name}</span>?
            This removes it from <strong>all roles</strong> and cannot be undone.
          </p>

          {error && (
            <div className="flex items-center gap-2 rounded-lg border border-red-300 bg-red-50 px-3 py-2 text-sm text-red-700">
              <HiOutlineExclamation className="h-4 w-4 shrink-0" />
              {(error as any)?.data?.message ?? "Failed to delete permission."}
            </div>
          )}

          <div className="flex justify-end gap-2">
            <Button variant="outline" onClick={onClose} className="text-sm">Cancel</Button>
            <button
              onClick={handleDelete}
              disabled={isLoading}
              className="flex items-center gap-2 px-4 py-2 rounded-lg bg-red-600 hover:bg-red-700 text-white text-sm font-semibold transition-colors disabled:opacity-50"
            >
              {isLoading ? <HiOutlineRefresh className="h-4 w-4 animate-spin" /> : <HiOutlineTrash className="h-4 w-4" />}
              {isLoading ? "Deleting…" : "Delete"}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}

// ─── Edit Role Modal ──────────────────────────────────────────────────────────

function EditRoleModal({ role, onClose }: { role: Role; onClose: (newName?: string) => void }) {
  const [name, setName] = useState(role.name);
  const [description, setDescription] = useState(role.description ?? "");
  const [isActive, setIsActive] = useState(role.isActive);
  const [updateRole, { isLoading, error }] = useUpdateRoleMutation();

  const nameError = name && !/^[A-Z0-9_]+$/.test(name)
    ? "Use uppercase letters, digits, and underscores only"
    : null;

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (nameError) return;
    try {
      console.log("[EditRole] submitting:", { id: role.id, name: name.trim(), description: description.trim() || undefined, isActive });
      const result = await updateRole({ id: role.id, name: name.trim(), description: description.trim() || undefined, isActive }).unwrap();
      console.log("[EditRole] success:", result);
      if (result?.name && result.name !== role.name) {
        // role was renamed — keep the panel pointing at the new name
        onClose(result.name);
      } else {
        onClose();
      }
    } catch (err) {
      console.error("[EditRole] error:", err);
    }
  }

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 backdrop-blur-sm p-4">
      <div className="bg-white rounded-2xl shadow-2xl w-full max-w-md">
        <div className="flex items-center justify-between px-6 py-4 border-b border-custom-200">
          <h2 className="text-lg font-bold text-secondary-100">Edit Role</h2>
          <button onClick={() => onClose()} className="text-custom-400 hover:text-custom-700 transition-colors">
            <HiOutlineX className="h-5 w-5" />
          </button>
        </div>

        <form onSubmit={handleSubmit} className="p-6 space-y-4">
          {/* Role name */}
          <div>
            <label className="block text-sm font-semibold text-secondary-100 mb-1">
              Role Name <span className="text-red-500">*</span>
            </label>
            <input
              type="text"
              value={name}
              onChange={(e) => setName(e.target.value.toUpperCase())}
              className={`w-full px-3 py-2 rounded-lg border text-sm font-mono focus:outline-none focus:ring-2 focus:ring-primary-500 transition-colors ${
                nameError ? "border-red-400 bg-red-50" : "border-custom-300 bg-white"
              }`}
            />
            {nameError && <p className="mt-1 text-xs text-red-600">{nameError}</p>}
          </div>

          {/* Description */}
          <div>
            <label className="block text-sm font-semibold text-secondary-100 mb-1">Description</label>
            <input
              type="text"
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              placeholder="e.g. Handles design work"
              className="w-full px-3 py-2 rounded-lg border border-custom-300 bg-white text-sm focus:outline-none focus:ring-2 focus:ring-primary-500 transition-colors"
            />
          </div>

          {/* Active toggle */}
          <div className="flex items-center justify-between rounded-lg border border-custom-200 px-4 py-3">
            <div>
              <p className="text-sm font-semibold text-secondary-100">Active</p>
              <p className="text-xs text-custom-500">Inactive roles cannot be assigned to users.</p>
            </div>
            <button
              type="button"
              onClick={() => setIsActive((v) => !v)}
              className={`relative inline-flex h-6 w-11 items-center rounded-full transition-colors focus:outline-none ${
                isActive ? "bg-primary-500" : "bg-gray-300"
              }`}
            >
              <span className={`inline-block h-4 w-4 transform rounded-full bg-white shadow transition-transform ${
                isActive ? "translate-x-6" : "translate-x-1"
              }`} />
            </button>
          </div>

          {error && (
            <div className="flex items-center gap-2 rounded-lg border border-red-300 bg-red-50 px-3 py-2 text-sm text-red-700">
              <HiOutlineExclamation className="h-4 w-4 shrink-0" />
              {(error as any)?.data?.message ?? "Failed to update role."}
            </div>
          )}

          <div className="flex justify-end gap-2 pt-2">
            <Button variant="outline" type="button" onClick={() => onClose()} className="text-sm">Cancel</Button>
            <Button type="submit" disabled={isLoading} className="flex items-center gap-2 text-sm">
              {isLoading ? <HiOutlineRefresh className="h-4 w-4 animate-spin" /> : <HiOutlineCheck className="h-4 w-4" />}
              {isLoading ? "Saving…" : "Save Changes"}
            </Button>
          </div>
        </form>
      </div>
    </div>
  );
}

// ─── Create Role Modal ────────────────────────────────────────────────────────

function CreateRoleModal({ onClose }: { onClose: () => void }) {
  const [name, setName] = useState("");
  const [description, setDescription] = useState("");
  const [createRole, { isLoading, error }] = useCreateRoleMutation();

  const nameError = name && !/^[A-Z0-9_]+$/.test(name)
    ? "Use uppercase letters, digits, and underscores only (e.g. DESIGNER)"
    : null;

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (!name.trim() || nameError) return;
    try {
      await createRole({ name: name.trim().toUpperCase(), description: description.trim() || undefined }).unwrap();
      onClose();
    } catch {
      // error shown below
    }
  }

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 backdrop-blur-sm p-4">
      <div className="bg-white rounded-2xl shadow-2xl w-full max-w-md">
        {/* Header */}
        <div className="flex items-center justify-between px-6 py-4 border-b border-custom-200">
          <h2 className="text-lg font-bold text-secondary-100">Create New Role</h2>
          <button onClick={onClose} className="text-custom-400 hover:text-custom-700 transition-colors">
            <HiOutlineX className="h-5 w-5" />
          </button>
        </div>

        <form onSubmit={handleSubmit} className="p-6 space-y-4">
          {/* Role name */}
          <div>
            <label className="block text-sm font-semibold text-secondary-100 mb-1">
              Role Name <span className="text-red-500">*</span>
            </label>
            <input
              type="text"
              value={name}
              onChange={(e) => setName(e.target.value.toUpperCase())}
              placeholder="e.g. DESIGNER"
              className={`w-full px-3 py-2 rounded-lg border text-sm font-mono focus:outline-none focus:ring-2 focus:ring-primary-500 transition-colors ${
                nameError ? "border-red-400 bg-red-50" : "border-custom-300 bg-white"
              }`}
            />
            {nameError && (
              <p className="mt-1 text-xs text-red-600">{nameError}</p>
            )}
          </div>

          {/* Description */}
          <div>
            <label className="block text-sm font-semibold text-secondary-100 mb-1">
              Description
            </label>
            <input
              type="text"
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              placeholder="e.g. Handles design work"
              className="w-full px-3 py-2 rounded-lg border border-custom-300 bg-white text-sm focus:outline-none focus:ring-2 focus:ring-primary-500 transition-colors"
            />
          </div>

          {/* API error */}
          {error && (
            <div className="flex items-center gap-2 rounded-lg border border-red-300 bg-red-50 px-3 py-2 text-sm text-red-700">
              <HiOutlineExclamation className="h-4 w-4 shrink-0" />
              {(error as any)?.data?.message ?? "Failed to create role. Please try again."}
            </div>
          )}

          {/* Actions */}
          <div className="flex justify-end gap-2 pt-2">
            <Button variant="outline" type="button" onClick={onClose} className="text-sm">
              Cancel
            </Button>
            <Button
              type="submit"
              disabled={!name.trim() || !!nameError || isLoading}
              className="flex items-center gap-2 text-sm"
            >
              {isLoading
                ? <HiOutlineRefresh className="h-4 w-4 animate-spin" />
                : <HiOutlinePlus className="h-4 w-4" />
              }
              {isLoading ? "Creating…" : "Create Role"}
            </Button>
          </div>
        </form>
      </div>
    </div>
  );
}

// ─── Delete Role Confirm Modal ────────────────────────────────────────────────

function DeleteRoleModal({ role, onClose }: { role: Role; onClose: () => void }) {
  const [deleteRole, { isLoading, error }] = useDeleteRoleMutation();

  async function handleDelete() {
    try {
      await deleteRole(role.id).unwrap();
      onClose();
    } catch {
      // error shown below
    }
  }

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 backdrop-blur-sm p-4">
      <div className="bg-white rounded-2xl shadow-2xl w-full max-w-sm">
        <div className="flex items-center justify-between px-6 py-4 border-b border-custom-200">
          <h2 className="text-lg font-bold text-secondary-100">Delete Role</h2>
          <button onClick={onClose} className="text-custom-400 hover:text-custom-700 transition-colors">
            <HiOutlineX className="h-5 w-5" />
          </button>
        </div>

        <div className="p-6 space-y-4">
          <p className="text-sm text-custom-700">
            Are you sure you want to delete the role{" "}
            <span className="font-bold text-secondary-100 font-mono">{role.name}</span>?
            This action cannot be undone. The backend will block deletion if the role is currently assigned to users.
          </p>

          {error && (
            <div className="flex items-center gap-2 rounded-lg border border-red-300 bg-red-50 px-3 py-2 text-sm text-red-700">
              <HiOutlineExclamation className="h-4 w-4 shrink-0" />
              {(error as any)?.data?.message ?? "Failed to delete role."}
            </div>
          )}

          <div className="flex justify-end gap-2">
            <Button variant="outline" onClick={onClose} className="text-sm">
              Cancel
            </Button>
            <button
              onClick={handleDelete}
              disabled={isLoading}
              className="flex items-center gap-2 px-4 py-2 rounded-lg bg-red-600 hover:bg-red-700 text-white text-sm font-semibold transition-colors disabled:opacity-50"
            >
              {isLoading
                ? <HiOutlineRefresh className="h-4 w-4 animate-spin" />
                : <HiOutlineTrash className="h-4 w-4" />
              }
              {isLoading ? "Deleting…" : "Delete"}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}

// ─── Page ─────────────────────────────────────────────────────────────────────

export default function UIPermissionsPage() {
  const { data: roles = [], isLoading: loadingRoles } = useGetAllRolesQuery();
  const [selectedRole, setSelectedRole] = useState<string>("ADMIN");
  const [showCreateRole, setShowCreateRole] = useState(false);
  const [roleToDelete, setRoleToDelete] = useState<Role | null>(null);
  const [roleToEdit, setRoleToEdit] = useState<Role | null>(null);

  // When roles load, ensure the selected role still exists
  const currentRole = roles.find((r) => r.name === selectedRole) ?? roles[0];

  // If the selected role was deleted, fall back to the first available
  const safeSelected = currentRole?.name ?? selectedRole;

  return (
    <DashboardLayout userRole="admin" userName="Admin" notificationCount={3}>
      <div className="space-y-6 font-[family-name:var(--font-family-primary)]">
        {/* Header */}
        <div className="flex items-start justify-between gap-4 flex-wrap">
          <div>
            <h1 className="text-3xl font-bold text-secondary-100">Role Permissions</h1>
            <p className="mt-2 text-sm text-custom-700">
              Select a role to view and modify its permissions. Changes are saved directly to the server.
            </p>
          </div>
          <Button
            onClick={() => setShowCreateRole(true)}
            className="flex items-center gap-2 text-sm shrink-0"
          >
            <HiOutlinePlus className="h-4 w-4" />
            New Role
          </Button>
        </div>

        <div className="grid gap-6 lg:grid-cols-[260px_1fr]">
          {/* Role list */}
          <Card className="!p-0 h-fit sticky top-4">
            <div className="px-4 py-3 border-b border-custom-200 flex items-center justify-between">
              <h3 className="text-xs font-bold text-custom-500 uppercase tracking-wider">Roles</h3>
              {loadingRoles && <HiOutlineRefresh className="h-3.5 w-3.5 text-custom-400 animate-spin" />}
            </div>

            <div className="p-2 space-y-1">
              {loadingRoles && roles.length === 0 ? (
                <div className="py-8 text-center text-sm text-custom-400">Loading…</div>
              ) : (
                roles.map((role, idx) => {
                  const color = roleColor(role.name, idx);
                  const isSelected = safeSelected === role.name;
                  return (
                    <div
                      key={role.id}
                      className={`
                        flex items-center justify-between px-3 py-3 rounded-lg transition-all cursor-pointer
                        ${isSelected
                          ? "bg-primary-500 text-white shadow-sm"
                          : "hover:bg-custom-50 text-custom-700"
                        }
                      `}
                      onClick={() => setSelectedRole(role.name)}
                    >
                      <div className="flex items-center gap-2 min-w-0">
                        <span className={`w-2 h-2 rounded-full shrink-0 ${
                          isSelected ? "bg-white" : color.split(" ")[0]
                        }`} />
                        <div className="min-w-0">
                          <div className={`text-sm font-semibold truncate ${isSelected ? "text-white" : "text-secondary-100"}`}>
                            {role.name}
                          </div>
                          {role.description && (
                            <div className={`text-xs mt-0.5 truncate ${isSelected ? "text-white/70" : "text-custom-500"}`}>
                              {role.description}
                            </div>
                          )}
                        </div>
                      </div>

                      {/* Edit + Delete buttons */}
                      <div className="flex items-center gap-0.5 shrink-0 ml-1">
                        <button
                          onClick={(e) => { e.stopPropagation(); setRoleToEdit(role); }}
                          className={`p-1.5 rounded-md transition-colors ${
                            isSelected
                              ? "text-white/80 hover:text-white hover:bg-white/20"
                              : "text-custom-400 hover:text-primary-600 hover:bg-primary-50"
                          }`}
                          title="Edit role"
                        >
                          <HiOutlinePencil className="h-3.5 w-3.5" />
                        </button>
                        <button
                          onClick={(e) => { e.stopPropagation(); setRoleToDelete(role); }}
                          className={`p-1.5 rounded-md transition-colors ${
                            isSelected
                              ? "text-red-300 hover:text-red-100 hover:bg-white/20"
                              : "text-red-400 hover:text-red-600 hover:bg-red-50"
                          }`}
                          title="Delete role"
                        >
                          <HiOutlineTrash className="h-3.5 w-3.5" />
                        </button>
                      </div>
                    </div>
                  );
                })
              )}
            </div>
          </Card>

          {/* Permissions panel */}
          <Card>
            {currentRole ? (
              <>
                <div className="flex items-center gap-3 mb-6">
                  <span className={`px-3 py-1 rounded-full text-xs font-bold font-mono ${roleColor(currentRole.name, 0)}`}>
                    {currentRole.name}
                  </span>
                  <div>
                    <h2 className="text-xl font-bold text-secondary-100">{currentRole.name}</h2>
                    {currentRole.description && (
                      <p className="text-sm text-custom-500">{currentRole.description}</p>
                    )}
                  </div>
                  {!currentRole.isActive && (
                    <span className="ml-auto px-2 py-0.5 rounded-full text-xs font-semibold bg-gray-100 text-gray-500 border border-gray-300">
                      Inactive
                    </span>
                  )}
                  {/* Quick edit button in panel header */}
                  <button
                    onClick={() => setRoleToEdit(currentRole)}
                    className="ml-auto flex items-center gap-1.5 px-3 py-1.5 rounded-lg border border-custom-200 text-xs font-semibold text-custom-600 hover:border-primary-400 hover:text-primary-600 transition-colors"
                  >
                    <HiOutlinePencil className="h-3.5 w-3.5" />
                    Edit Role
                  </button>
                </div>
                <RolePermissionsPanel key={safeSelected} role={safeSelected} />
              </>
            ) : (
              <div className="py-24 text-center text-custom-400 text-sm">
                {loadingRoles ? "Loading roles…" : "Select a role from the list."}
              </div>
            )}
          </Card>
        </div>
      </div>

      {/* Modals */}
      {showCreateRole && (
        <CreateRoleModal onClose={() => setShowCreateRole(false)} />
      )}
      {roleToEdit && (
        <EditRoleModal
          role={roleToEdit}
          onClose={(newName) => {
            if (newName) setSelectedRole(newName);
            setRoleToEdit(null);
          }}
        />
      )}
      {roleToDelete && (
        <DeleteRoleModal
          role={roleToDelete}
          onClose={() => {
            setRoleToDelete(null);
            if (roleToDelete.name === safeSelected) setSelectedRole("ADMIN");
          }}
        />
      )}
    </DashboardLayout>
  );
}
