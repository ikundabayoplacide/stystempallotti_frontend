import { createApi, fetchBaseQuery } from "@reduxjs/toolkit/query/react";
import type { RootState } from "../index";

export interface EmployeeJob {
  id: string;
  jobNumber: string;
  title: string;
  status: string;
  priority: string;
  state?: string | null;
  EmployeeJobAssignment?: { id: string; assignedAt: string; assignedById: string };
}

export interface Employee {
  id: string;
  fullName: string;
  phoneNumber: string;
  gender: "MALE" | "FEMALE" | "OTHER";
  dateOfBirth: string;
  address: string;
  contractSalary: number;
  contractType?: "FULL_TIME" | "PART_TIME" | "CONTRACT" | "INTERN";
  nid?: string;
  email?: string;
  supportContact?: string;
  bankAccount?: string;
  hiredAt?: string;
  departmentId?: string;
  // Legacy single-job fields (kept for backward compat)
  jobId?: string | null;
  job?: EmployeeJob | null;
  jobs?: EmployeeJob[];
  // New many-to-many field from backend
  assignedJobs?: EmployeeJob[];
  isActive: boolean;
  createdAt?: string;
  updatedAt?: string;
}

export interface EmployeesResponse {
  success: boolean;
  message: string;
  data: Employee[];
  total: number;
  page: number;
  limit: number;
}

export interface CreateEmployeePayload {
  fullName: string;
  phoneNumber: string;
  gender: "MALE" | "FEMALE" | "OTHER";
  dateOfBirth: string;
  address: string;
  contractSalary: number;
  contractType?: string;
  nid?: string;
  email?: string;
  supportContact?: string;
  bankAccount?: string;
  hiredAt?: string;
  departmentId?: string;
}

export interface UpdateEmployeePayload extends Partial<CreateEmployeePayload> {
  id: string;
  isActive?: boolean;
}

export interface GetEmployeesParams {
  page?: number;
  limit?: number;
  departmentId?: string;
  isActive?: boolean;
  search?: string;
}

export interface AssignJobPayload {
  id: string;
  jobId: string | null;
}

export const employeesApi = createApi({
  reducerPath: "employeesApi",

  baseQuery: fetchBaseQuery({
    baseUrl: import.meta.env.VITE_API_URL ?? "http://localhost:8000/api",
    prepareHeaders: (headers, { getState }) => {
      const token = (getState() as RootState).auth.token;
      if (token) headers.set("Authorization", `Bearer ${token}`);
      return headers;
    },
  }),

  tagTypes: ["Employee"],

  endpoints: (builder) => ({

    getAllEmployees: builder.query<EmployeesResponse, GetEmployeesParams>({
      query: (params) => ({
        url: "/employees",
        params,
      }),
      transformResponse: (res: any) => {
        const data = res?.data ?? res?.employees ?? [];
        const result = {
          data: Array.isArray(data) ? data : [],
          total: res?.total ?? res?.count ?? res?.pagination?.total ?? (Array.isArray(data) ? data.length : 0),
          page: res?.page ?? res?.pagination?.page ?? 1,
          limit: res?.limit ?? res?.pagination?.limit ?? 10,
          success: res?.success,
          message: res?.message,
        };
        return result;
      },
      providesTags: ["Employee"],
    }),

    getEmployeeById: builder.query<Employee, string>({
      query: (id) => `/employees/${id}`,
      transformResponse: (res: any) => res?.data ?? res,
      providesTags: (_result, _err, id) => [{ type: "Employee", id }],
    }),

    createEmployee: builder.mutation<Employee, CreateEmployeePayload>({
      query: (body) => ({ url: "/employees", method: "POST", body }),
      transformResponse: (res: any) => res?.data ?? res,
      invalidatesTags: ["Employee"],
    }),

    updateEmployee: builder.mutation<Employee, UpdateEmployeePayload>({
      query: ({ id, ...body }) => ({ url: `/employees/${id}`, method: "PUT", body }),
      transformResponse: (res: any) => res?.data ?? res,
      invalidatesTags: ["Employee"],
    }),

    toggleEmployeeActive: builder.mutation<Employee, string>({
      query: (id) => ({ url: `/employees/${id}/toggle-active`, method: "PATCH" }),
      transformResponse: (res: any) => res?.data ?? res,
      invalidatesTags: ["Employee"],
    }),

    deleteEmployee: builder.mutation<void, string>({
      query: (id) => ({ url: `/employees/${id}`, method: "DELETE" }),
      invalidatesTags: ["Employee"],
    }),

    assignDepartment: builder.mutation<Employee, { id: string; departmentId: string | null }>({
      query: ({ id, departmentId }) => ({
        url: `/employees/${id}/department`,
        method: "PATCH",
        body: { departmentId },
      }),
      transformResponse: (res: any) => res?.data ?? res,
      invalidatesTags: ["Employee"],
    }),

    // PATCH /employees/:employeeId/assign-job
    assignJobToEmployee: builder.mutation<Employee, { employeeId: string; jobId: string }>({
      query: ({ employeeId, jobId }) => ({
        url: `/employees/${employeeId}/assign-job`,
        method: "PATCH",
        body: { jobId },
      }),
      transformResponse: (res: any) => {
        console.log("[assignJobToEmployee] raw response:", JSON.stringify(res, null, 2));
        return res?.data ?? res;
      },
      invalidatesTags: ["Employee"],
    }),

    // PATCH /employees/:employeeId/unassign-job
    unassignJobFromEmployee: builder.mutation<Employee, { employeeId: string; jobId: string }>({
      query: ({ employeeId, jobId }) => ({
        url: `/employees/${employeeId}/unassign-job`,
        method: "PATCH",
        body: { jobId },
      }),
      transformResponse: (res: any) => {
        console.log("[unassignJobFromEmployee] raw response:", JSON.stringify(res, null, 2));
        return res?.data ?? res;
      },
      invalidatesTags: ["Employee"],
    }),
  }),
});

export const {
  useGetAllEmployeesQuery,
  useGetEmployeeByIdQuery,
  useCreateEmployeeMutation,
  useUpdateEmployeeMutation,
  useToggleEmployeeActiveMutation,
  useDeleteEmployeeMutation,
  useAssignDepartmentMutation,
  useAssignJobToEmployeeMutation,
  useUnassignJobFromEmployeeMutation,
} = employeesApi;
