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
  | "completed"
  | "rejected";

export type JobState =
  | "in-composition"
  | "in-montage"
  | "in-printing"
  | "in-binding"
  | "in-packaging"
  | "quality-check"
  | "composition-done"
  | "montage-done"
  | "printing-done"
  | "binding-done"
  | "packaging-done"
  | "qualitycheck-done"
  | null;

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
  state?: JobState;
  rejectReason?: string;
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
  deliveredByName?: string;
  deliveredByContact?: string;
  createdAt: string;
  updatedAt: string;
}

export interface JobItem {
  id: string;
  jobId: string;
  stockItemId: string;
  stockItem?: {
    id: string;
    name: string;
    unit: string;
    currentStock: number;
    stockStatus: string;
  };
  quantityNeeded: number;
  quantityUsed?: number;
  notes?: string;
  createdAt: string;
  updatedAt: string;
}

export interface JobItemPayload {
  stockItemId: string;
  quantityNeeded: number;
  notes?: string;
}

export interface UpdateJobItemPayload {
  jobId: string;
  itemId: string;
  quantityNeeded?: number;
  quantityUsed?: number;
  notes?: string;
}

export interface CreateJobPayload {
  title: string;
  customerId: string;
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
  items?: JobItemPayload[];
}

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

export interface RecordJobPaymentPayload {
  id: string;
  paymentMethod: PaymentMethod;
  paymentNote?: string;
}

export interface RecordJobPaymentResponse {
  job: Job;
  receiptNo: string;
}

export interface UpdateJobStatusPayload {
  id: string;
  status: JobStatus;
}

export interface AssignJobPayload {
  id: string;
  departmentAssignedToId: string;
}

export interface GetJobsParams {
  page?: number;
  limit?: number;
  search?: string;
  status?: JobStatus;
  priority?: JobPriority;
  customerId?: string;
  departmentAssignedToId?: string;
}

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

    // POST /jobs
    createJob: builder.mutation<Job, CreateJobPayload>({
      query: (body) => ({ url: "/jobs", method: "POST", body }),
      transformResponse: (res: ApiResponse<Job>) => res.data,
      invalidatesTags: [{ type: "Job", id: "LIST" }],
    }),

    // PUT /jobs/:id
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

    // POST /jobs/:id/approve — pending → confirmed
    approveJob: builder.mutation<Job, string>({
      query: (id) => ({ url: `/jobs/${id}/approve`, method: "POST" }),
      transformResponse: (res: ApiResponse<Job>) => res.data,
      invalidatesTags: (_r, _e, id) => [
        { type: "Job", id },
        { type: "Job", id: "LIST" },
      ],
    }),

    // POST /jobs/:id/reject — pending/confirmed → rejected
    rejectJob: builder.mutation<Job, { id: string; rejectReason?: string }>({
      query: ({ id, rejectReason }) => ({
        url: `/jobs/${id}/reject`,
        method: "POST",
        body: rejectReason ? { rejectReason } : {},
      }),
      transformResponse: (res: ApiResponse<Job>) => res.data,
      invalidatesTags: (_r, _e, { id }) => [
        { type: "Job", id },
        { type: "Job", id: "LIST" },
      ],
    }),

    // POST /jobs/:id/assign — first-time assignment
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

    // PATCH /jobs/:id/reassign — ADMIN, SUPERVISOR, SALES, PRODUCTION_MANAGER
    reassignJob: builder.mutation<Job, AssignJobPayload>({
      query: ({ id, departmentAssignedToId }) => ({
        url: `/jobs/${id}/reassign`,
        method: "PATCH",
        body: { departmentAssignedToId },
      }),
      transformResponse: (res: ApiResponse<Job>) => res.data,
      invalidatesTags: (_r, _e, { id }) => [
        { type: "Job", id },
        { type: "Job", id: "LIST" },
      ],
    }),

    // PATCH /jobs/:id/complete
    completeJob: builder.mutation<Job, string>({
      query: (id) => ({ url: `/jobs/${id}/complete`, method: "PATCH" }),
      transformResponse: (res: ApiResponse<Job>) => res.data,
      invalidatesTags: (_r, _e, id) => [
        { type: "Job", id },
        { type: "Job", id: "LIST" },
        { type: "Job", id: "COMPLETED_PAID" },
      ],
    }),

    // PATCH /jobs/:id/deliver
    deliverJob: builder.mutation<Job, { id: string; deliveredByName?: string; deliveredByContact?: string }>({
      query: ({ id, ...body }) => ({ url: `/jobs/${id}/deliver`, method: "PATCH", body }),
      transformResponse: (res: ApiResponse<Job>) => res.data,
      invalidatesTags: (_r, _e, { id }) => [
        { type: "Job", id },
        { type: "Job", id: "LIST" },
        { type: "Job", id: "COMPLETED_PAID" },
      ],
    }),

    // PATCH /jobs/:id/payment
    recordJobPayment: builder.mutation<RecordJobPaymentResponse, RecordJobPaymentPayload>({
      query: ({ id, ...body }) => ({
        url: `/jobs/${id}/payment`,
        method: "PATCH",
        body,
      }),
      transformResponse: (res: ApiResponse<any>) => {
        const data = res.data;
        if (data && typeof data === "object" && "receiptNo" in data) {
          return { job: data.job ?? data, receiptNo: data.receiptNo };
        }
        return { job: data, receiptNo: data?.receiptNo ?? "" };
      },
      invalidatesTags: (_r, _e, { id }) => [
        { type: "Job", id },
        { type: "Job", id: "LIST" },
      ],
    }),

    // GET /jobs/completed-and-paid
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

    // DELETE /jobs/:id — ADMIN only (pending or confirmed)
    deleteJob: builder.mutation<{ success: boolean; message: string }, string>({
      query: (id) => ({ url: `/jobs/${id}`, method: "DELETE" }),
      invalidatesTags: (_r, _e, id) => [
        { type: "Job", id },
        { type: "Job", id: "LIST" },
      ],
    }),

    // PATCH /jobs/:id/state — Supervisor marks department work done
    updateJobState: builder.mutation<Job, { id: string; state: string }>({
      query: ({ id, state }) => ({
        url: `/jobs/${id}/state`,
        method: "PATCH",
        body: { state },
      }),
      transformResponse: (res: ApiResponse<Job>) => res.data,
      invalidatesTags: (_r, _e, { id }) => [
        { type: "Job", id },
        { type: "Job", id: "LIST" },
      ],
    }),

    // ── Job Items ─────────────────────────────────────────────────────────────

    getJobItems: builder.query<JobItem[], string>({
      query: (jobId) => `/jobs/${jobId}/items`,
      transformResponse: (res: ApiResponse<JobItem[]>) => res.data ?? [],
      providesTags: (_r, _e, jobId) => [{ type: "Job", id: `${jobId}-items` }],
    }),

    addJobItem: builder.mutation<JobItem, { jobId: string } & JobItemPayload>({
      query: ({ jobId, ...body }) => ({
        url: `/jobs/${jobId}/items`,
        method: "POST",
        body,
      }),
      transformResponse: (res: ApiResponse<JobItem>) => res.data,
      invalidatesTags: (_r, _e, { jobId }) => [{ type: "Job", id: `${jobId}-items` }],
    }),

    updateJobItem: builder.mutation<JobItem, UpdateJobItemPayload>({
      query: ({ jobId, itemId, ...body }) => ({
        url: `/jobs/${jobId}/items/${itemId}`,
        method: "PUT",
        body,
      }),
      transformResponse: (res: ApiResponse<JobItem>) => res.data,
      invalidatesTags: (_r, _e, { jobId }) => [{ type: "Job", id: `${jobId}-items` }],
    }),

    removeJobItem: builder.mutation<void, { jobId: string; itemId: string }>({
      query: ({ jobId, itemId }) => ({
        url: `/jobs/${jobId}/items/${itemId}`,
        method: "DELETE",
      }),
      invalidatesTags: (_r, _e, { jobId }) => [{ type: "Job", id: `${jobId}-items` }],
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
  useUpdateJobStateMutation,
  useApproveJobMutation,
  useRejectJobMutation,
  useRecordJobPaymentMutation,
  useDeliverJobMutation,
  useCompleteJobMutation,
  useAssignJobMutation,
  useReassignJobMutation,
  useDeleteJobMutation,
  useGetJobItemsQuery,
  useAddJobItemMutation,
  useUpdateJobItemMutation,
  useRemoveJobItemMutation,
} = jobsApi;
