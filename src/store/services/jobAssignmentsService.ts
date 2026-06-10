import { createApi, fetchBaseQuery } from "@reduxjs/toolkit/query/react";
import type { RootState } from "../index";

// ─── Types ────────────────────────────────────────────────────────────────────

export interface EmployeeWithJob {
  id: string;
  name: string;
  role: string;
  departmentId: string;
  currentJobId: string | null;
  currentJob: {
    id: string;
    jobNumber: string;
    title: string;
    state: string | null;
  } | null;
}

export interface AssignJobPayload {
  jobId: string;
  employeeId: string;
}

export interface AssignJobResponse {
  success: boolean;
  message: string;
  data: {
    employeeId: string;
    jobId: string;
    replacedJobId?: string | null;
  };
}

// ─── Service ──────────────────────────────────────────────────────────────────

export const jobAssignmentsApi = createApi({
  reducerPath: "jobAssignmentsApi",

  baseQuery: fetchBaseQuery({
    baseUrl: import.meta.env.VITE_API_URL ?? "http://localhost:8000/api",
    prepareHeaders: (headers, { getState }) => {
      const token = (getState() as RootState).auth.token;
      if (token) headers.set("Authorization", `Bearer ${token}`);
      return headers;
    },
  }),

  tagTypes: ["JobAssignment"],

  endpoints: (builder) => ({

    // GET /job-assignments/employees/:departmentId
    // Response: { success, message, data: { department: {...}, employees: [...] } }
    getEmployeesByDepartment: builder.query<EmployeeWithJob[], string>({
      query: (departmentId) => `/job-assignments/employees/${departmentId}`,
      transformResponse: (res: any) => {
        const employees = res?.data?.employees ?? res?.data ?? res;
        return Array.isArray(employees) ? employees : [];
      },
      providesTags: (_r, _e, departmentId) => [
        { type: "JobAssignment", id: `dept-${departmentId}` },
      ],
    }),

    // GET /job-assignments/job/:jobId/employees
    getEmployeesByJob: builder.query<EmployeeWithJob[], string>({
      query: (jobId) => `/job-assignments/job/${jobId}/employees`,
      transformResponse: (res: any) => {
        const raw = res?.data?.employees ?? res?.data ?? res;
        return Array.isArray(raw) ? raw : [];
      },
      providesTags: (_r, _e, jobId) => [
        { type: "JobAssignment", id: `job-${jobId}` },
      ],
    }),

    // POST /job-assignments/assign — body: { jobId, employeeId }
    assignJobToEmployee: builder.mutation<AssignJobResponse, AssignJobPayload>({
      query: (body) => ({ url: "/job-assignments/assign", method: "POST", body }),
      invalidatesTags: [{ type: "JobAssignment" }],
    }),

    // DELETE /job-assignments/unassign/:employeeId
    unassignEmployee: builder.mutation<void, string>({
      query: (employeeId) => ({
        url: `/job-assignments/unassign/${employeeId}`,
        method: "DELETE",
      }),
      invalidatesTags: [{ type: "JobAssignment" }],
    }),
  }),
});

export const {
  useGetEmployeesByDepartmentQuery,
  useGetEmployeesByJobQuery,
  useAssignJobToEmployeeMutation,
  useUnassignEmployeeMutation,
} = jobAssignmentsApi;
