import { createApi, fetchBaseQuery } from "@reduxjs/toolkit/query/react";
import type { RootState } from "../index";

// ─── Types ────────────────────────────────────────────────────────────────────

export type OutstandCategory = "purchase" | "utility" | "maintenance" | "supplier" | "other";
export type OutstandStatus   = "pending" | "approved" | "paid" | "rejected";

export interface Outstand {
  id: string;
  ref: string;
  description: string;
  category: OutstandCategory;
  quantity: number;
  unitCost: number | string;
  totalAmount: number | string;
  recipient: string;
  recipientName: string;
  recipientPhone: string;
  recipientRole: string;
  purpose: string;
  notes?: string | null;
  status: OutstandStatus;
  rejectionNote?: string | null;
  recordedBy?: { id: string; name: string; role: string };
  approvedBy?: { id: string; name: string; role: string } | null;
  approvedAt?: string | null;
  paidAt?: string | null;
  createdAt: string;
  updatedAt: string;
}

export interface CreateOutstandPayload {
  description: string;
  category: OutstandCategory;
  amount: number;
  quantity?: number;
  unitCost?: number;
  recipientName: string;
  recipientPhone?: string;
  recipientRole?: string;
  purpose: string;
  notes?: string;
}

export interface UpdateOutstandPayload {
  description?: string;
  category?: OutstandCategory;
  amount?: number;
  quantity?: number;
  unitCost?: number;
  recipientName?: string;
  recipientPhone?: string;
  recipientRole?: string;
  purpose?: string;
  notes?: string;
}

export interface GetOutstandsParams {
  status?: OutstandStatus;
  category?: OutstandCategory;
  from?: string;
  to?: string;
  page?: number;
  limit?: number;
}

export interface PaginatedOutstands {
  outstands: Outstand[];
  total: number;
  page: number;
  limit: number;
  totalPages: number;
}

interface ApiResponse<T> {
  success: boolean;
  message: string;
  data: T;
  pagination?: { total: number; page: number; limit: number; totalPages: number };
}

function normalizePaginated(res: ApiResponse<unknown>): PaginatedOutstands {
  const raw = res.data;
  const p = res.pagination;
  const rows = Array.isArray(raw) ? raw as Outstand[] : [];
  return {
    outstands: rows,
    total: p?.total ?? rows.length,
    page: p?.page ?? 1,
    limit: p?.limit ?? rows.length,
    totalPages: p?.totalPages ?? 1,
  };
}

// ─── Service ──────────────────────────────────────────────────────────────────

export const outstandsApi = createApi({
  reducerPath: "outstandsApi",

  baseQuery: fetchBaseQuery({
    baseUrl: import.meta.env.VITE_API_URL ?? "http://localhost:8000/api",
    prepareHeaders: (headers, { getState }) => {
      const token = (getState() as RootState).auth.token;
      if (token) headers.set("Authorization", `Bearer ${token}`);
      return headers;
    },
  }),

  tagTypes: ["Outstand"],

  endpoints: (builder) => ({

    // GET /outstands
    getOutstands: builder.query<PaginatedOutstands, GetOutstandsParams | void>({
      query: (params) => ({ url: "/outstands", params: (params ?? {}) as Record<string, any> }),
      transformResponse: (res: ApiResponse<unknown>) => normalizePaginated(res),
      providesTags: (result) =>
        result?.outstands?.length
          ? [...result.outstands.map(({ id }) => ({ type: "Outstand" as const, id })), { type: "Outstand", id: "LIST" }]
          : [{ type: "Outstand", id: "LIST" }],
    }),

    // GET /outstands/:id
    getOutstandById: builder.query<Outstand, string>({
      query: (id) => `/outstands/${id}`,
      transformResponse: (res: ApiResponse<Outstand>) => res.data,
      providesTags: (_r, _e, id) => [{ type: "Outstand", id }],
    }),

    // POST /outstands
    createOutstand: builder.mutation<Outstand, CreateOutstandPayload>({
      query: (body) => ({ url: "/outstands", method: "POST", body }),
      transformResponse: (res: ApiResponse<Outstand>) => res.data,
      invalidatesTags: [{ type: "Outstand", id: "LIST" }],
    }),

    // PATCH /outstands/:id
    updateOutstand: builder.mutation<Outstand, { id: string; data: UpdateOutstandPayload }>({
      query: ({ id, data }) => ({ url: `/outstands/${id}`, method: "PUT", body: data }),
      transformResponse: (res: ApiResponse<Outstand>) => res.data,
      invalidatesTags: (_r, _e, { id }) => [{ type: "Outstand", id }, { type: "Outstand", id: "LIST" }],
    }),

    // PATCH /outstands/:id/approve
    approveOutstand: builder.mutation<Outstand, string>({
      query: (id) => ({ url: `/outstands/${id}/approve`, method: "PATCH" }),
      transformResponse: (res: ApiResponse<Outstand>) => res.data,
      invalidatesTags: (_r, _e, id) => [{ type: "Outstand", id }, { type: "Outstand", id: "LIST" }],
    }),

    // PATCH /outstands/:id/reject
    rejectOutstand: builder.mutation<Outstand, { id: string; rejectionNote: string }>({
      query: ({ id, rejectionNote }) => ({ url: `/outstands/${id}/reject`, method: "PATCH", body: { rejectionNote } }),
      transformResponse: (res: ApiResponse<Outstand>) => res.data,
      invalidatesTags: (_r, _e, { id }) => [{ type: "Outstand", id }, { type: "Outstand", id: "LIST" }],
    }),

    // PATCH /outstands/:id/pay
    payOutstand: builder.mutation<{ outstand: Outstand; totalBalance: number }, string>({
      query: (id) => ({ url: `/outstands/${id}/pay`, method: "PATCH" }),
      transformResponse: (res: ApiResponse<{ outstand: Outstand; totalBalance: number }>) => res.data,
      invalidatesTags: (_r, _e, id) => [{ type: "Outstand", id }, { type: "Outstand", id: "LIST" }],
      async onQueryStarted(_id, { dispatch, queryFulfilled }) {
        await queryFulfilled;
        const { withdrawalsApi } = await import("./withdrawalsService");
        dispatch(withdrawalsApi.util.invalidateTags(["WithdrawalBalance"]));
      },
    }),

    // DELETE /outstands/:id
    deleteOutstand: builder.mutation<void, string>({
      query: (id) => ({ url: `/outstands/${id}`, method: "DELETE" }),
      invalidatesTags: (_r, _e, id) => [{ type: "Outstand", id }, { type: "Outstand", id: "LIST" }],
    }),
  }),
});

export const {
  useGetOutstandsQuery,
  useGetOutstandByIdQuery,
  useCreateOutstandMutation,
  useUpdateOutstandMutation,
  useApproveOutstandMutation,
  useRejectOutstandMutation,
  usePayOutstandMutation,
  useDeleteOutstandMutation,
} = outstandsApi;
