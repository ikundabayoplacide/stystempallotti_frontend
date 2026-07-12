import { createApi, fetchBaseQuery } from "@reduxjs/toolkit/query/react";
import type { RootState } from "../index";

// ─── Types ────────────────────────────────────────────────────────────────────

export type Gender           = "MALE" | "FEMALE";
export type ApprovalStatus   = "PENDING" | "APPROVED" | "REJECTED";

export interface ExtraWorker {
  id: string;
  fullName: string;
  gender: Gender;
  date: string;
  startTime: string;
  endTime: string;
  task: string;
  description?: string | null;
  // who recorded it
  doneBy?: { id: string; fullName?: string; name?: string; email?: string } | string | null;
  doneById?: string | null;
  doneByUser?: { id: string; name: string } | null;
  // approval
  status?: ApprovalStatus | null;
  approvalComment?: string | null;
  approvedBy?: string | null;
  approvedByUser?: { id: string; name: string } | null;
  approvedAt?: string | null;
  createdAt?: string;
  updatedAt?: string;
}

export interface ExtraWorkerPayload {
  fullName: string;
  gender: Gender;
  date: string;
  startTime: string;
  endTime: string;
  task: string;
  description?: string;
}

export interface ApprovalPayload {
  status: "APPROVED" | "REJECTED";
  approvalComment?: string;
}

export interface GetExtraWorkersParams {
  page?: number;
  limit?: number;
  search?: string;
  date?: string;
}

export interface ExtraWorkersResponse {
  data: ExtraWorker[];
  total: number;
  totalPages: number;
  page: number;
  limit: number;
}

// ─── Normalizer ───────────────────────────────────────────────────────────────

function normalise(res: any): ExtraWorkersResponse {
  const pagination = res?.pagination ?? res?.meta ?? {};
  const raw = res?.data ?? res;
  return {
    data:       Array.isArray(raw) ? raw : [],
    total:      pagination?.total      ?? 0,
    totalPages: pagination?.totalPages ?? 1,
    page:       pagination?.page       ?? 1,
    limit:      pagination?.limit      ?? 10,
  };
}

// ─── API ──────────────────────────────────────────────────────────────────────

export const extraWorkersApi = createApi({
  reducerPath: "extraWorkersApi",

  baseQuery: fetchBaseQuery({
    baseUrl: import.meta.env.VITE_API_URL ?? "http://localhost:8000/api",
    prepareHeaders: (headers, { getState }) => {
      const token = (getState() as RootState).auth.token;
      if (token) headers.set("Authorization", `Bearer ${token}`);
      return headers;
    },
  }),

  tagTypes: ["ExtraWorker"],

  endpoints: (builder) => ({

    // GET /extra-workers
    getExtraWorkers: builder.query<ExtraWorkersResponse, GetExtraWorkersParams | void>({
      query: (params) => ({ url: "/extra-workers", params: params ?? {} }),
      transformResponse: (res: any) => normalise(res),
      providesTags: (result) =>
        result?.data?.length
          ? [
              ...result.data.map(({ id }) => ({ type: "ExtraWorker" as const, id })),
              { type: "ExtraWorker", id: "LIST" },
            ]
          : [{ type: "ExtraWorker", id: "LIST" }],
    }),

    // GET /extra-workers/:id
    getExtraWorkerById: builder.query<ExtraWorker, string>({
      query: (id) => `/extra-workers/${id}`,
      transformResponse: (res: any) => res?.data ?? res,
      providesTags: (_r, _e, id) => [{ type: "ExtraWorker", id }],
    }),

    // POST /extra-workers
    createExtraWorker: builder.mutation<ExtraWorker, ExtraWorkerPayload>({
      query: (body) => ({ url: "/extra-workers", method: "POST", body }),
      transformResponse: (res: any) => res?.data ?? res,
      invalidatesTags: [{ type: "ExtraWorker", id: "LIST" }],
    }),

    // PUT /extra-workers/:id
    updateExtraWorker: builder.mutation<ExtraWorker, { id: string } & Partial<ExtraWorkerPayload>>({
      query: ({ id, ...body }) => ({ url: `/extra-workers/${id}`, method: "PUT", body }),
      transformResponse: (res: any) => res?.data ?? res,
      invalidatesTags: (_r, _e, { id }) => [
        { type: "ExtraWorker", id },
        { type: "ExtraWorker", id: "LIST" },
      ],
    }),

    // DELETE /extra-workers/:id
    deleteExtraWorker: builder.mutation<void, string>({
      query: (id) => ({ url: `/extra-workers/${id}`, method: "DELETE" }),
      invalidatesTags: [{ type: "ExtraWorker", id: "LIST" }],
    }),

    // PATCH /extra-workers/:id/approval  (ADMIN, DAF only)
    approveExtraWorker: builder.mutation<ExtraWorker, { id: string } & ApprovalPayload>({
      query: ({ id, ...body }) => ({
        url: `/extra-workers/${id}/approval`,
        method: "PATCH",
        body,
      }),
      transformResponse: (res: any) => res?.data ?? res,
      invalidatesTags: (_r, _e, { id }) => [
        { type: "ExtraWorker", id },
        { type: "ExtraWorker", id: "LIST" },
      ],
    }),
  }),
});

export const {
  useGetExtraWorkersQuery,
  useGetExtraWorkerByIdQuery,
  useCreateExtraWorkerMutation,
  useUpdateExtraWorkerMutation,
  useDeleteExtraWorkerMutation,
  useApproveExtraWorkerMutation,
} = extraWorkersApi;
