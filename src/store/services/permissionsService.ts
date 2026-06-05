import { createApi, fetchBaseQuery } from "@reduxjs/toolkit/query/react";
import type { RootState } from "../index";

// ─── Types ────────────────────────────────────────────────────────────────────

/** A single permission as returned by the backend */
export interface Permission {
  id: string | number;
  name: string;        // e.g. "jobs.create"
  resource: string;    // e.g. "jobs"
  action: string;      // e.g. "create"
  description?: string;
}

/** A role-permission mapping */
export interface RolePermission {
  id: number;
  role: string;        // e.g. "ADMIN"
  permissionId: number;
  permission?: Permission;
}

/** What the backend returns for GET /permissions/role/:role */
export interface RolePermissionsResponse {
  success: boolean;
  message: string;
  data: Permission[];
}

/** What the backend returns for GET /permissions */
export interface AllPermissionsResponse {
  success: boolean;
  message: string;
  data: Permission[];
}

/** What the backend returns for GET /permissions/my */
export interface MyPermissionsResponse {
  success: boolean;
  message: string;
  data: Permission[];
}

/** Body for POST /permissions/role/:role  (grant one permission) */
export interface GrantPermissionPayload {
  role: string;
  permissionId: string | number;
}

/** Body for PUT /permissions/role/:role  (replace all permissions) */
export interface ReplacePermissionsPayload {
  role: string;
  permissionIds: (string | number)[];
}

/** Body for DELETE /permissions/role/:role/:permissionId */
export interface RevokePermissionPayload {
  role: string;
  permissionId: string | number;
}

/** Body for POST /permissions — create a new permission */
export interface CreatePermissionPayload {
  name: string;        // e.g. "jobs.export"
  resource: string;    // e.g. "jobs"
  action: string;      // e.g. "export"
  description?: string;
}

/** Body for PUT /permissions/:id — update description */
export interface UpdatePermissionPayload {
  id: string | number;
  description?: string;
}

// ─── Service ──────────────────────────────────────────────────────────────────

export const permissionsApi = createApi({
  reducerPath: "permissionsApi",

  baseQuery: fetchBaseQuery({
    baseUrl: import.meta.env.VITE_API_URL ?? "http://localhost:8000/api",
    prepareHeaders: (headers, { getState }) => {
      const token = (getState() as RootState).auth.token;
      if (token) {
        headers.set("Authorization", `Bearer ${token}`);
      }
      return headers;
    },
  }),

  tagTypes: ["Permission", "RolePermission"],

  endpoints: (builder) => ({

    // GET /permissions — all permissions in the system
    getAllPermissions: builder.query<Permission[], void>({
      query: () => "/permissions",
      transformResponse: (res: any) => {
        console.log("[permissions] GET /permissions raw response:", res);
        const raw = res?.data ?? res;
        const result = Array.isArray(raw) ? raw : Array.isArray(raw?.permissions) ? raw.permissions : [];
        console.log("[permissions] GET /permissions parsed:", result.length, "items", result);
        return result;
      },
      providesTags: ["Permission"],
    }),

    // GET /permissions/my — current user's permissions
    getMyPermissions: builder.query<Permission[], void>({
      query: () => "/permissions/my",
      transformResponse: (res: any) => {
        console.log("[permissions] GET /permissions/my raw response:", res);
        const raw = res?.data ?? res;
        const arr: unknown[] = Array.isArray(raw)
          ? raw
          : Array.isArray(raw?.permissions)
          ? raw.permissions
          : Array.isArray(raw?.data)
          ? raw.data
          : [];
        const result: Permission[] = arr.map((item, idx) => {
          if (typeof item === "string") {
            const [resource, action] = item.split(".");
            return { id: idx, name: item, resource: resource ?? item, action: action ?? "" };
          }
          return item as Permission;
        });
        console.log("[permissions] GET /permissions/my parsed:", result.length, "names:", result.map(p => p.name));
        return result;
      },
      providesTags: ["Permission", "RolePermission"],
    }),

    // GET /permissions/role/:role — permissions for a specific role
    getPermissionsForRole: builder.query<Permission[], string>({
      query: (role) => `/permissions/role/${role}`,
      transformResponse: (res: any, _meta, role) => {
        console.log(`[permissions] GET /permissions/role/${role} raw response:`, res);
        const raw = res?.data ?? res;
        const arr: unknown[] = Array.isArray(raw)
          ? raw
          : Array.isArray(raw?.permissions)
          ? raw.permissions
          : Array.isArray(raw?.data)
          ? raw.data
          : [];
        const result: Permission[] = arr.map((item, idx) => {
          if (typeof item === "string") {
            const [resource, action] = item.split(".");
            return { id: idx, name: item, resource: resource ?? item, action: action ?? "" };
          }
          return item as Permission;
        });
        console.log(`[permissions] GET /permissions/role/${role} parsed:`, result.length, "items", result.map(p => p.name));
        return result;
      },
      // If backend returns 400 (role exists but has no permissions), treat as empty
      transformErrorResponse: (response, _meta, role) => {
        console.warn(`[permissions] GET /permissions/role/${role} returned ${response.status} — treating as empty`);
        return response;
      },
      providesTags: (_result, _err, role) => [{ type: "RolePermission", id: role }],
    }),

    // POST /permissions/role/:role — grant a single permission to a role
    grantPermission: builder.mutation<void, GrantPermissionPayload>({
      query: ({ role, permissionId }) => ({
        url: `/permissions/role/${role}`,
        method: "POST",
        body: { permissionId },
      }),
      invalidatesTags: (_result, _err, { role }) => [{ type: "RolePermission", id: role }],
    }),

    // PUT /permissions/role/:role — replace ALL permissions for a role at once
    replaceRolePermissions: builder.mutation<void, ReplacePermissionsPayload>({
      query: ({ role, permissionIds }) => ({
        url: `/permissions/role/${role}`,
        method: "PUT",
        body: { permissionIds },
      }),
      // Don't invalidate — backend returns 400 on refetch for new roles.
      // We update the cache manually in handleSave instead.
      invalidatesTags: (_result, err, { role }) =>
        err ? [{ type: "RolePermission", id: role }] : [],
    }),

    // DELETE /permissions/role/:role/:permissionId — revoke one permission
    revokePermission: builder.mutation<void, RevokePermissionPayload>({
      query: ({ role, permissionId }) => ({
        url: `/permissions/role/${role}/${permissionId}`,
        method: "DELETE",
      }),
      invalidatesTags: (_result, _err, { role }) => [{ type: "RolePermission", id: role }],
    }),

    // POST /permissions — create a new permission (ADMIN only)
    createPermission: builder.mutation<Permission, CreatePermissionPayload>({
      query: (body) => ({
        url: "/permissions",
        method: "POST",
        body,
      }),
      transformResponse: (res: any) => res?.data ?? res,
      invalidatesTags: ["Permission"],
    }),

    // PUT /permissions/:id — update description (ADMIN only)
    updatePermission: builder.mutation<Permission, UpdatePermissionPayload>({
      query: ({ id, ...body }) => ({
        url: `/permissions/${id}`,
        method: "PUT",
        body,
      }),
      transformResponse: (res: any) => res?.data ?? res,
      invalidatesTags: ["Permission"],
    }),

    // DELETE /permissions/:id — delete permission from all roles (ADMIN only)
    deletePermission: builder.mutation<void, string | number>({
      query: (id) => ({
        url: `/permissions/${id}`,
        method: "DELETE",
      }),
      invalidatesTags: ["Permission", "RolePermission"],
    }),
  }),
});

export const {
  useGetAllPermissionsQuery,
  useGetMyPermissionsQuery,
  useGetPermissionsForRoleQuery,
  useGrantPermissionMutation,
  useReplaceRolePermissionsMutation,
  useRevokePermissionMutation,
  useCreatePermissionMutation,
  useUpdatePermissionMutation,
  useDeletePermissionMutation,
} = permissionsApi;
