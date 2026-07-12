import { createApi, fetchBaseQuery } from "@reduxjs/toolkit/query/react";
import type { RootState } from "../index";

// ─── Types ────────────────────────────────────────────────────────────────────

export type OvertimeStatus = "PENDING" | "APPROVED" | "REJECTED";

export interface OvertimeRequest {
  id: string;
  date: string;
  startTime: string;
  endTime: string;
  reason: string;
  // who it belongs to
  employeeId?: string | null;
  employee?: { id: string; name?: string; fullName?: string; email?: string } | null;
  // who registered it
  registeredById?: string | null;
  registeredByUser?: { id: string; name: string } | null;
  // approval
  status: OvertimeStatus;
  approvalComment?: string | null;
  approvedById?: string | null;
  approvedByUser?: { id: string; name: string } | null;
  approvedAt?: string | null;
  createdAt?: string;
  updatedAt?: string;
}

export interface OvertimePayload {
  date: string;
  startTime: string;
  endTime: string;
  reason: string;
  employeeId?: string;
}

export interface OvertimeApprovalPayload {
  status: "APPROVED" | "REJECTED";
  approvalComment?: string;
}

export interface GetOvertimeParams {
  page?: number;
  limit?: number;
  status?: OvertimeStatus | "";
  date?: string;
  employeeId?: string;
}

export interface OvertimeResponse {
  data: OvertimeRequest[];
  total: number;
  totalPages: number;
  page: number;
  limit: number;
}

// ─── Normaliser ───────────────────────────────────────────────────────────────

function normalise(res: any): OvertimeResponse {
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

export const overtimeApi = createApi({
  reducerPath: "overtimeApi",

  baseQuery: fetchBaseQuery({
    baseUrl: import.meta.env.VITE_API_URL ?? "http://localhost:8000/api",
    prepareHeaders: (headers, { getState }) => {
      const token = (getState() as RootState).auth.token;
      if (token) headers.set("Authorization", `Bearer ${token}`);
      return headers;
    },
  }),

  tagTypes: ["Overtime"],

  endpoints: (builder) => ({

    // GET /overtime
    getOvertimeRequests: builder.query<OvertimeResponse, GetOvertimeParams | void>({
      query: (params) => ({ url: "/overtime", params: params ?? {} }),
      transformResponse: (res: any) => normalise(res),
      providesTags: (result) =>
        result?.data?.length
          ? [
              ...result.data.map(({ id }) => ({ type: "Overtime" as const, id })),
              { type: "Overtime", id: "LIST" },
            ]
          : [{ type: "Overtime", id: "LIST" }],
    }),

    // GET /overtime/:id
    getOvertimeById: builder.query<OvertimeRequest, string>({
      query: (id) => `/overtime/${id}`,
      transformResponse: (res: any) => res?.data ?? res,
      providesTags: (_r, _e, id) => [{ type: "Overtime", id }],
    }),

    // POST /overtime
    createOvertimeRequest: builder.mutation<OvertimeRequest, OvertimePayload>({
      query: (body) => ({ url: "/overtime", method: "POST", body }),
      transformResponse: (res: any) => res?.data ?? res,
      invalidatesTags: [{ type: "Overtime", id: "LIST" }],
    }),

    // PUT /overtime/:id
    updateOvertimeRequest: builder.mutation<OvertimeRequest, { id: string } & Partial<OvertimePayload>>({
      query: ({ id, ...body }) => ({ url: `/overtime/${id}`, method: "PUT", body }),
      transformResponse: (res: any) => res?.data ?? res,
      invalidatesTags: (_r, _e, { id }) => [
        { type: "Overtime", id },
        { type: "Overtime", id: "LIST" },
      ],
    }),

    // DELETE /overtime/:id
    deleteOvertimeRequest: builder.mutation<void, string>({
      query: (id) => ({ url: `/overtime/${id}`, method: "DELETE" }),
      invalidatesTags: [{ type: "Overtime", id: "LIST" }],
    }),

    // PATCH /overtime/:id/approval
    approveOvertimeRequest: builder.mutation<OvertimeRequest, { id: string } & OvertimeApprovalPayload>({
      query: ({ id, ...body }) => ({
        url: `/overtime/${id}/approval`,
        method: "PATCH",
        body,
      }),
      transformResponse: (res: any) => res?.data ?? res,
      invalidatesTags: (_r, _e, { id }) => [
        { type: "Overtime", id },
        { type: "Overtime", id: "LIST" },
      ],
    }),
  }),
});

export const {
  useGetOvertimeRequestsQuery,
  useGetOvertimeByIdQuery,
  useCreateOvertimeRequestMutation,
  useUpdateOvertimeRequestMutation,
  useDeleteOvertimeRequestMutation,
  useApproveOvertimeRequestMutation,
} = overtimeApi;
