import { createApi, fetchBaseQuery } from "@reduxjs/toolkit/query/react";
import type { RootState } from "../index";

// ─── Types ────────────────────────────────────────────────────────────────────

export type JobStatus =
  | "pending"
  | "confirmed"
  | "in-composition"
  | "in-montage"
  | "in-printing"
  | "in-binding"
  | "in-packaging"
  | "quality-check"
  | "ready-for-delivery"
  | "delivered"
  | "completed";

export type JobPriority = "low" | "normal" | "high" | "urgent";

export type PaymentMethod = "CASH" | "MOBILE_MONEY" | "BANK_TRANSFER" | "CARD";

export type PaymentStatus = "unpaid" | "paid";

export interface JobPayment {
  id: string;
  paymentMethod: PaymentMethod;
  paymentState: "FULL" | "PARTIAL";
  amountPaid: string;
  balance: string;
  receiptNo: string;
  paidAt: string;
}

export interface Job {
  department: any;
  customer: any;
  id: string;
  jobNumber: string;
  title: string;
  description?: string;
  jobType?: string;
  quantity?: number;
  size?: string;
  colorMode?: string;
  bindingType?: string;
  priority: JobPriority;
  status: JobStatus;
  paymentStatus?: PaymentStatus;
  amount?: number;
  paymentMethod?: PaymentMethod;
  paymentReference?: string;
  paidAt?: string;
  receiptNo?: string;
  dueDate?: string;
  notes?: string;
  customerId: string;
  createdById: string;
  departmentAssignedToId?: string;
  payments?: JobPayment[];
  createdAt: string;
  updatedAt: string;
}

// POST /api/jobs — what frontend sends
export interface CreateJobPayload {
  title: string;           // required
  customerId: string;      // required — UUID from selected customer
  description?: string;
  jobType?: string;
  quantity?: number;       // integer >= 1
  size?: string;
  colorMode?: string;
  bindingType?: string;
  priority?: JobPriority;  // default: "normal"
  amount?: number;         // price in RWF
  dueDate?: string;        // ISO 8601
  notes?: string;
}

// PUT /api/jobs/:id — all fields optional
export interface UpdateJobPayload {
  id: string;
  title?: string;
  description?: string;
  jobType?: string;
  quantity?: number;
  size?: string;
  colorMode?: string;
  bindingType?: string;
  priority?: JobPriority;
  amount?: number;
  dueDate?: string;
  notes?: string;
  departmentAssignedToId?: string;
}

// PATCH /api/jobs/:id/payment — body: { paymentMethod, paymentNote? }
export interface RecordJobPaymentPayload {
  id: string;
  paymentMethod: PaymentMethod;
  paymentNote?: string;
}

// PATCH /api/jobs/:id/payment — response includes receiptNo
export interface RecordJobPaymentResponse {
  job: Job;
  receiptNo: string;
}

// PATCH /api/jobs/:id/status
export interface UpdateJobStatusPayload {
  id: string;
  status: JobStatus;
}

// POST /api/jobs/:id/assign
export interface AssignJobPayload {
  id: string;
  departmentAssignedToId: string;
}

// GET /api/jobs query params
export interface GetJobsParams {
  page?: number;
  limit?: number;
  search?: string;
  status?: JobStatus;
  priority?: JobPriority;
  customerId?: string;
  departmentAssignedToId?: string;
}

// GET /api/jobs/completed-and-paid query params
export interface GetCompletedPaidJobsParams {
  page?: number;
  limit?: number;
  search?: string;
}

export interface PaginatedJobs {
  jobs: Job[];
  total: number;
  page: number;
  limit: number;
  totalPages: number;
}

interface ApiResponse<T> {
  success: boolean;
  message: string;
  data: T;
}

function normalizePaginatedJobs(raw: unknown): PaginatedJobs {
  if (raw && typeof raw === "object" && "jobs" in raw) {
    const r = raw as PaginatedJobs;
    return {
      jobs: Array.isArray(r.jobs) ? r.jobs : [],
      total: r.total ?? 0,
      page: r.page ?? 1,
      limit: r.limit ?? 10,
      totalPages: r.totalPages ?? 1,
    };
  }
  if (Array.isArray(raw)) {
    return {
      jobs: raw as Job[],
      total: (raw as Job[]).length,
      page: 1,
      limit: (raw as Job[]).length,
      totalPages: 1,
    };
  }
  return { jobs: [], total: 0, page: 1, limit: 10, totalPages: 1 };
}

// ─── Service ──────────────────────────────────────────────────────────────────

export const jobsApi = createApi({
  reducerPath: "jobsApi",

  baseQuery: fetchBaseQuery({
    baseUrl: import.meta.env.VITE_API_URL ?? "http://localhost:8000/api",
    prepareHeaders: (headers, { getState }) => {
      const token = (getState() as RootState).auth.token;
      if (token) headers.set("Authorization", `Bearer ${token}`);
      return headers;
    },
  }),

  tagTypes: ["Job"],

  endpoints: (builder) => ({

    // GET /jobs
    getJobs: builder.query<PaginatedJobs, GetJobsParams | void>({
      query: (params) => ({ url: "/jobs", params: (params ?? {}) as Record<string, any> }),
      transformResponse: (res: ApiResponse<unknown>) => normalizePaginatedJobs(res.data),
      providesTags: (result) =>
        result?.jobs?.length
          ? [
              ...result.jobs.map(({ id }) => ({ type: "Job" as const, id })),
              { type: "Job", id: "LIST" },
            ]
          : [{ type: "Job", id: "LIST" }],
    }),

    // GET /jobs/next-number
    getNextJobNumber: builder.query<string, void>({
      query: () => "/jobs/next-number",
      transformResponse: (res: ApiResponse<{ nextNumber: string }>) =>
        res.data.nextNumber,
    }),

    // GET /jobs/number/:jobNumber
    getJobByNumber: builder.query<Job, string>({
      query: (jobNumber) => `/jobs/number/${jobNumber}`,
      transformResponse: (res: ApiResponse<Job>) => res.data,
      providesTags: (_r, _e, jobNumber) => [{ type: "Job", id: jobNumber }],
    }),

    // GET /jobs/:id
    getJobById: builder.query<Job, string>({
      query: (id) => `/jobs/${id}`,
      transformResponse: (res: ApiResponse<Job>) => res.data,
      providesTags: (_r, _e, id) => [{ type: "Job", id }],
    }),

    // POST /jobs — ADMIN, RECEPTIONIST
    createJob: builder.mutation<Job, CreateJobPayload>({
      query: (body) => ({ url: "/jobs", method: "POST", body }),
      transformResponse: (res: ApiResponse<Job>) => res.data,
      invalidatesTags: [{ type: "Job", id: "LIST" }],
    }),

    // PUT /jobs/:id — ADMIN, RECEPTIONIST
    updateJob: builder.mutation<Job, UpdateJobPayload>({
      query: ({ id, ...body }) => ({ url: `/jobs/${id}`, method: "PUT", body }),
      transformResponse: (res: ApiResponse<Job>) => res.data,
      invalidatesTags: (_r, _e, { id }) => [
        { type: "Job", id },
        { type: "Job", id: "LIST" },
      ],
    }),

    // PATCH /jobs/:id/status
    updateJobStatus: builder.mutation<Job, UpdateJobStatusPayload>({
      query: ({ id, status }) => ({
        url: `/jobs/${id}/status`,
        method: "PATCH",
        body: { status },
      }),
      transformResponse: (res: ApiResponse<Job>) => res.data,
      invalidatesTags: (_r, _e, { id }) => [
        { type: "Job", id },
        { type: "Job", id: "LIST" },
      ],
    }),

    // PATCH /jobs/:id/payment — record payment method at reception
    recordJobPayment: builder.mutation<RecordJobPaymentResponse, RecordJobPaymentPayload>({
      query: ({ id, ...body }) => ({
        url: `/jobs/${id}/payment`,
        method: "PATCH",
        body,
      }),
      transformResponse: (res: ApiResponse<any>) => {
        // Backend may return { job, receiptNo } or just the job directly
        const data = res.data;
        if (data && typeof data === "object" && "receiptNo" in data) {
          return { job: data.job ?? data, receiptNo: data.receiptNo };
        }
        // Fallback: no receiptNo in response
        return { job: data, receiptNo: data?.receiptNo ?? "" };
      },
      invalidatesTags: (_r, _e, { id }) => [
        { type: "Job", id },
        { type: "Job", id: "LIST" },
      ],
    }),

    // POST /jobs/:id/assign — ADMIN, SUPERVISOR
    assignJob: builder.mutation<Job, AssignJobPayload>({
      query: ({ id, departmentAssignedToId }) => ({
        url: `/jobs/${id}/assign`,
        method: "POST",
        body: { departmentAssignedToId },
      }),
      transformResponse: (res: ApiResponse<Job>) => res.data,
      invalidatesTags: (_r, _e, { id }) => [
        { type: "Job", id },
        { type: "Job", id: "LIST" },
      ],
    }),

    // PATCH /jobs/:id/deliver — mark job as delivered
    deliverJob: builder.mutation<Job, string>({
      query: (id) => ({ url: `/jobs/${id}/deliver`, method: "PATCH" }),
      transformResponse: (res: ApiResponse<Job>) => res.data,
      invalidatesTags: (_r, _e, id) => [
        { type: "Job", id },
        { type: "Job", id: "LIST" },
        { type: "Job", id: "COMPLETED_PAID" },
      ],
    }),

    // GET /jobs/completed-and-paid — any authenticated user
    getCompletedAndPaidJobs: builder.query<PaginatedJobs, GetCompletedPaidJobsParams | void>({
      query: (params) => ({ url: "/jobs/completed-and-paid", params: (params ?? {}) as Record<string, any> }),
      transformResponse: (res: ApiResponse<unknown>) => normalizePaginatedJobs(res.data),
      providesTags: (result) =>
        result?.jobs?.length
          ? [
              ...result.jobs.map(({ id }) => ({ type: "Job" as const, id })),
              { type: "Job", id: "COMPLETED_PAID" },
            ]
          : [{ type: "Job", id: "COMPLETED_PAID" }],
    }),

    // PATCH /jobs/:id/complete — ADMIN, RECEPTIONIST, SUPERVISOR
    completeJob: builder.mutation<Job, string>({
      query: (id) => ({ url: `/jobs/${id}/complete`, method: "PATCH" }),
      transformResponse: (res: ApiResponse<Job>) => res.data,
      invalidatesTags: (_r, _e, id) => [
        { type: "Job", id },
        { type: "Job", id: "LIST" },
        { type: "Job", id: "COMPLETED_PAID" },
      ],
    }),

    // DELETE /jobs/:id — ADMIN only
    deleteJob: builder.mutation<{ success: boolean; message: string }, string>({
      query: (id) => ({ url: `/jobs/${id}`, method: "DELETE" }),
      invalidatesTags: (_r, _e, id) => [
        { type: "Job", id },
        { type: "Job", id: "LIST" },
      ],
    }),
  }),
});

export const {
  useGetJobsQuery,
  useGetNextJobNumberQuery,
  useGetJobByNumberQuery,
  useGetJobByIdQuery,
  useGetCompletedAndPaidJobsQuery,
  useCreateJobMutation,
  useUpdateJobMutation,
  useUpdateJobStatusMutation,
  useRecordJobPaymentMutation,
  useDeliverJobMutation,
  useCompleteJobMutation,
  useAssignJobMutation,
  useDeleteJobMutation,
} = jobsApi;
