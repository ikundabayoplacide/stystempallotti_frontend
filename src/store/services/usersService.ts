import { createApi, fetchBaseQuery } from "@reduxjs/toolkit/query/react";
import type { RootState } from "../index";

// ─── Types ────────────────────────────────────────────────────────────────────

export interface User {
  id: string;
  name: string;
  email: string;
  phone?: string;
  gender?: string;
  departmentId?: string | null;
  department?: { id: string; name: string } | null;
  role: string;
  isActive: boolean;
  createdAt: string;
  lastLogin?: string;
  currentJobId?: string | null;
  currentJob?: {
    id: string;
    jobNumber: string;
    title: string;
    state: string | null;
    status: string;
    priority: string;
  } | null;
}

export interface GetUsersParams {
  page?: number;
  limit?: number;
  search?: string;
  role?: string;
  departmentId?: string;
  isActive?: boolean;
}

export interface PaginatedUsers {
  users: User[];
  total: number;
  page: number;
  totalPages: number;
}

export interface CreateUserPayload {
  name: string;
  email: string;
  password: string;
  phone: string;
  gender: string;
  role: string;
  departmentId?: string;
}

export interface UpdateUserPayload {
  id: string;
  name?: string;
  email?: string;
  phone?: string;
  gender?: string;
  role?: string;
  departmentId?: string;
  isActive?: boolean;
}

export interface ChangePasswordPayload {
  currentPassword: string;
  newPassword: string;
}

// Generic wrapper the backend uses: { success, message, data, pagination }
interface ApiResponse<T> {
  success: boolean;
  message: string;
  data: T;
  pagination?: { total: number; page: number; limit: number; totalPages: number };
}

// ─── Service ──────────────────────────────────────────────────────────────────

export const usersApi = createApi({
  reducerPath: "usersApi",

  baseQuery: fetchBaseQuery({
    baseUrl: import.meta.env.VITE_API_URL ?? "http://localhost:8000/api",
    prepareHeaders: (headers, { getState }) => {
      // Pull token directly from Redux state (no localStorage read needed)
      const token = (getState() as RootState).auth.token;
      if (token) {
        headers.set("Authorization", `Bearer ${token}`);
      }
      return headers;
    },
  }),

  // Tag system — lets RTK Query auto-refetch lists after mutations
  tagTypes: ["User"],

  endpoints: (builder) => ({

    // GET /users  (paginated, supports ?page=, ?limit=, ?search=, ?role=, ?departmentId=)
    getUsers: builder.query<PaginatedUsers, GetUsersParams | void>({
      query: (params) => ({ url: "/users", params: (params ?? {}) as Record<string, any> }),
      transformResponse: (res: ApiResponse<User[]>) => ({
        users: res.data ?? [],
        total: res.pagination?.total ?? 0,
        page: res.pagination?.page ?? 1,
        totalPages: res.pagination?.totalPages ?? 1,
      }),
      providesTags: (result) =>
        result?.users
          ? [
              ...result.users.map(({ id }) => ({ type: "User" as const, id })),
              { type: "User", id: "LIST" },
            ]
          : [{ type: "User", id: "LIST" }],
    }),

    // GET /users/:id
    getUserById: builder.query<User, string>({
      query: (id) => `/users/${id}`,
      transformResponse: (res: ApiResponse<User>) => res.data,
      providesTags: (_result, _err, id) => [{ type: "User", id }],
    }),

    // POST /users
    createUser: builder.mutation<User, CreateUserPayload>({
      query: (body) => ({
        url: "/users",
        method: "POST",
        body,
      }),
      transformResponse: (res: ApiResponse<User>) => res.data,
      // After creating, invalidate the list so it refetches automatically
      invalidatesTags: [{ type: "User", id: "LIST" }],
    }),

    // PUT /users/:id
    updateUser: builder.mutation<User, UpdateUserPayload>({
      query: ({ id, ...body }) => ({
        url: `/users/${id}`,
        method: "PUT",
        body,
      }),
      transformResponse: (res: ApiResponse<User>) => res.data,
      // Invalidate both the specific user and the list
      invalidatesTags: (_result, _err, { id }) => [
        { type: "User", id },
        { type: "User", id: "LIST" },
      ],
    }),

    // DELETE /users/:id
    deleteUser: builder.mutation<void, string>({
      query: (id) => ({
        url: `/users/${id}`,
        method: "DELETE",
      }),
      invalidatesTags: (_result, _err, id) => [
        { type: "User", id },
        { type: "User", id: "LIST" },
      ],
    }),

    // GET /users/me
    getMe: builder.query<User, void>({
      query: () => "/users/me",
      transformResponse: (res: ApiResponse<User>) => res.data,
      providesTags: [{ type: "User", id: "ME" }],
    }),

    // PUT /users/me
    updateMe: builder.mutation<User, Partial<Pick<User, "name" | "phone" | "gender">>>({
      query: (body) => ({ url: "/users/me", method: "PUT", body }),
      transformResponse: (res: ApiResponse<User>) => res.data,
      invalidatesTags: [{ type: "User", id: "ME" }],
    }),

    // POST /auth/change-password
    changePassword: builder.mutation<void, ChangePasswordPayload>({
      query: (body) => ({ url: "/auth/change-password", method: "POST", body }),
    }),
  }),
});

export const {
  useGetUsersQuery,
  useGetUserByIdQuery,
  useCreateUserMutation,
  useUpdateUserMutation,
  useDeleteUserMutation,
  useGetMeQuery,
  useUpdateMeMutation,
  useChangePasswordMutation,
} = usersApi;
