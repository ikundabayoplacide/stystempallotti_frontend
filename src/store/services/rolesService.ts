import { createApi, fetchBaseQuery } from "@reduxjs/toolkit/query/react";
import type { RootState } from "../index";

// ─── Types ────────────────────────────────────────────────────────────────────

export interface Role {
  id: number;
  name: string;          // e.g. "ADMIN", "DESIGNER"
  description?: string;
  isActive: boolean;
  isSystem?: boolean;    // backend marks built-in roles — cannot be deleted
  createdAt?: string;
  updatedAt?: string;
}

export interface CreateRolePayload {
  name: string;
  description?: string;
}

export interface UpdateRolePayload {
  id: number;
  name?: string;
  description?: string;
  isActive?: boolean;
}

// ─── Service ──────────────────────────────────────────────────────────────────

export const rolesApi = createApi({
  reducerPath: "rolesApi",

  baseQuery: fetchBaseQuery({
    baseUrl: import.meta.env.VITE_API_URL ?? "http://localhost:8000/api",
    prepareHeaders: (headers, { getState }) => {
      const token = (getState() as RootState).auth.token;
      if (token) headers.set("Authorization", `Bearer ${token}`);
      return headers;
    },
  }),

  tagTypes: ["Role"],

  endpoints: (builder) => ({

    // GET /roles — list all roles
    getAllRoles: builder.query<Role[], void>({
      query: () => "/roles",
      transformResponse: (res: any) => {
        const raw = res?.data ?? res;
        return Array.isArray(raw) ? raw : [];
      },
      providesTags: ["Role"],
    }),

    // GET /roles/:id — single role
    getRoleById: builder.query<Role, number>({
      query: (id) => `/roles/${id}`,
      transformResponse: (res: any) => res?.data ?? res,
      providesTags: (_result, _err, id) => [{ type: "Role", id }],
    }),

    // POST /roles — create a new role (ADMIN only)
    createRole: builder.mutation<Role, CreateRolePayload>({
      query: (body) => ({
        url: "/roles",
        method: "POST",
        body,
      }),
      transformResponse: (res: any) => res?.data ?? res,
      invalidatesTags: ["Role"],
    }),

    // PATCH /roles/:id — update name, description or isActive (ADMIN only)
    updateRole: builder.mutation<Role, UpdateRolePayload>({
      query: ({ id, ...body }) => ({
        url: `/roles/${id}`,
        method: "PATCH",
        body,
      }),
      transformResponse: (res: any) => res?.data ?? res,
      invalidatesTags: (_result, _err, { id }) => [{ type: "Role", id }, "Role"],
    }),

    // DELETE /roles/:id — delete custom role (ADMIN only; system roles & roles in use are blocked)
    deleteRole: builder.mutation<void, number>({
      query: (id) => ({
        url: `/roles/${id}`,
        method: "DELETE",
      }),
      invalidatesTags: ["Role"],
    }),
  }),
});

export const {
  useGetAllRolesQuery,
  useGetRoleByIdQuery,
  useCreateRoleMutation,
  useUpdateRoleMutation,
  useDeleteRoleMutation,
} = rolesApi;
