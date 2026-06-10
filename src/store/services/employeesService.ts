import { createApi, fetchBaseQuery } from "@reduxjs/toolkit/query/react";
import type { RootState } from "../index";

export interface SubTask {
  id: string;
  title: string;
  completed: boolean;
  completedAt?: string | null;
}

export interface EmployeeJob {
  id: string;
  jobNumber: string;
  title: string;
  status: string;
  priority: string;
  state?: string | null;
  inProduction?: string | null;
  dueDate?: string | null;
  jobType?: string | null;
  description?: string | null;
  estimatedTime?: string | null;
  startedAt?: string | null;
  pausedAt?: string | null;
  completedAt?: string | null;
  customer?: { id: string; name: string } | null;
  subtasks?: SubTask[];
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
  userId?: string | null;
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
  password?: string;
  supportContact?: string;
  bankAccount?: string;
  hiredAt?: string;
  departmentId?: string;
}

export interface UpdateEmployeePayload extends Partial<CreateEmployeePayload> {
  id: string;
  isActive?: boolean;
  userId?: string | null;
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

    // GET /employees/me — logged-in worker's own employee profile
    getMyEmployeeProfile: builder.query<Employee, void>({
      query: () => "/employees/me",
      transformResponse: (res: any) => {
        console.log("[getMyEmployeeProfile] raw:", res);
        return res?.data ?? res;
      },
      providesTags: [{ type: "Employee", id: "ME" }],
    }),

    // GET /employees/:id/jobs?status=...&date=...
    getEmployeeJobs: builder.query<EmployeeJob[], { employeeId: string; status?: string; date?: string }>({
      query: ({ employeeId, status, date }) => ({
        url: `/employees/${employeeId}/jobs`,
        params: { ...(status ? { status } : {}), ...(date ? { date } : {}) },
      }),
      transformResponse: (res: any) => {
        const data = res?.data ?? res?.jobs ?? res;
        return Array.isArray(data) ? data : [];
      },
      providesTags: (_r, _e, { employeeId }) => [{ type: "Employee", id: `jobs-${employeeId}` }],
    }),

    // GET /jobs/:id/subtasks
    getJobSubtasks: builder.query<SubTask[], string>({
      query: (jobId) => `/jobs/${jobId}/subtasks`,
      transformResponse: (res: any) => {
        const data = res?.data ?? res;
        return Array.isArray(data) ? data : [];
      },
      providesTags: (_r, _e, jobId) => [{ type: "Employee", id: `subtasks-${jobId}` }],
    }),

    // POST /jobs/:id/subtasks
    addSubtask: builder.mutation<SubTask, { jobId: string; title: string }>({
      query: ({ jobId, title }) => ({ url: `/jobs/${jobId}/subtasks`, method: "POST", body: { title } }),
      transformResponse: (res: any) => res?.data ?? res,
      invalidatesTags: (_r, _e, { jobId }) => [{ type: "Employee", id: `subtasks-${jobId}` }],
    }),

    // PATCH /jobs/:id/subtasks/:subtaskId  — toggle completed
    toggleSubtask: builder.mutation<SubTask, { jobId: string; subtaskId: string; completed: boolean }>({
      query: ({ jobId, subtaskId, completed }) => ({
        url: `/jobs/${jobId}/subtasks/${subtaskId}`,
        method: "PATCH",
        body: { completed },
      }),
      transformResponse: (res: any) => res?.data ?? res,
      invalidatesTags: (_r, _e, { jobId }) => [{ type: "Employee", id: `subtasks-${jobId}` }],
    }),

    // DELETE /jobs/:id/subtasks/:subtaskId
    deleteSubtask: builder.mutation<void, { jobId: string; subtaskId: string }>({
      query: ({ jobId, subtaskId }) => ({ url: `/jobs/${jobId}/subtasks/${subtaskId}`, method: "DELETE" }),
      invalidatesTags: (_r, _e, { jobId }) => [{ type: "Employee", id: `subtasks-${jobId}` }],
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
  useGetMyEmployeeProfileQuery,
  useGetEmployeeJobsQuery,
  useGetJobSubtasksQuery,
  useAddSubtaskMutation,
  useToggleSubtaskMutation,
  useDeleteSubtaskMutation,
  useCreateEmployeeMutation,
  useUpdateEmployeeMutation,
  useToggleEmployeeActiveMutation,
  useDeleteEmployeeMutation,
  useAssignDepartmentMutation,
  useAssignJobToEmployeeMutation,
  useUnassignJobFromEmployeeMutation,
} = employeesApi;
