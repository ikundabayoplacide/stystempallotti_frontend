import { createApi, fetchBaseQuery } from "@reduxjs/toolkit/query/react";
import type { RootState } from "../index";

// ─── Types ────────────────────────────────────────────────────────────────────

export interface DepartmentEmployee {
  id: string;
  fullName: string;
  phoneNumber: string;
  contractType?: string;
  isActive: boolean;
}

export interface DepartmentUser {
  id: string;
  name: string;
  email: string;
  phone?: string;
  role: string;
  isActive: boolean;
}

export interface Department {
  id: string;
  name: string;
  description?: string;
  capacity?: number;
  activeJobs?: number;
  workers?: number;
  avgDuration?: string;
  employees?: DepartmentEmployee[];
  users?: DepartmentUser[];
}

export interface DepartmentJob {
  id: string;
  title: string;
  departmentId: string;
}

export interface CreateDepartmentPayload {
  name: string;
  description?: string;
}

export interface UpdateDepartmentPayload {
  id: string;
  name?: string;
  description?: string;
}

interface ApiResponse<T> {
  success: boolean;
  message: string;
  data: T;
}

// ─── Service ──────────────────────────────────────────────────────────────────

export const departmentsApi = createApi({
  reducerPath: "departmentsApi",

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

  tagTypes: ["Department"],

  endpoints: (builder) => ({

    // GET /departments
    getDepartments: builder.query<Department[], void>({
      query: () => "/departments",
      transformResponse: (res: ApiResponse<Department[]>) => res.data,
      providesTags: (result) =>
        result
          ? [
              ...result.map(({ id }) => ({ type: "Department" as const, id })),
              { type: "Department", id: "LIST" },
            ]
          : [{ type: "Department", id: "LIST" }],
    }),

    // GET /departments/:id
    getDepartmentById: builder.query<Department, string>({
      query: (id) => `/departments/${id}`,
      transformResponse: (res: ApiResponse<Department>) => res.data,
      providesTags: (_result, _err, id) => [{ type: "Department", id }],
    }),

    // GET /departments/:id/jobs
    getDepartmentJobs: builder.query<DepartmentJob[], string>({
      query: (id) => `/departments/${id}/jobs`,
      transformResponse: (res: ApiResponse<DepartmentJob[]>) => res.data,
    }),

    // POST /departments
    createDepartment: builder.mutation<Department, CreateDepartmentPayload>({
      query: (body) => ({ url: "/departments", method: "POST", body }),
      transformResponse: (res: ApiResponse<Department>) => res.data,
      invalidatesTags: ["Department"],
    }),

    // PUT /departments/:id
    updateDepartment: builder.mutation<Department, UpdateDepartmentPayload>({
      query: ({ id, ...body }) => ({ url: `/departments/${id}`, method: "PUT", body }),
      transformResponse: (res: ApiResponse<Department>) => res.data,
      invalidatesTags: (_result, _err, { id }) => [
        { type: "Department", id },
        { type: "Department", id: "LIST" },
      ],
    }),

    // DELETE /departments/:id
    deleteDepartment: builder.mutation<void, string>({
      query: (id) => ({ url: `/departments/${id}`, method: "DELETE" }),
      invalidatesTags: (_result, _err, id) => [
        { type: "Department", id },
        { type: "Department", id: "LIST" },
      ],
    }),
  }),
});

export const {
  useGetDepartmentsQuery,
  useGetDepartmentByIdQuery,
  useGetDepartmentJobsQuery,
  useCreateDepartmentMutation,
  useUpdateDepartmentMutation,
  useDeleteDepartmentMutation,
} = departmentsApi;
