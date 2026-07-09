import { createApi, fetchBaseQuery } from "@reduxjs/toolkit/query/react";
import type { RootState } from "../index";

// ─── Types ────────────────────────────────────────────────────────────────────

export type StockRequestStatus = "pending" | "approved" | "rejected";

export interface StockRequestItem {
  id: string;
  itemName: string;
  description?: string;
  quantity: string;
  unit: string;
  unitPrice: string;
  totalAmount: string;
}

export interface StockRequest {
  id: string;
  requestNumber: string;
  status: StockRequestStatus;
  notes?: string;
  responseNotes?: string | null;
  respondedAt?: string | null;
  requestedBy: { id: string; name: string; email: string; role: string };
  responder?: { id: string; name: string; email: string; role: string } | null;
  items: StockRequestItem[];
  createdAt: string;
  updatedAt: string;
}

export interface StockRequestItemInput {
  itemName: string;
  description?: string;
  quantity: number;
  unit: string;
  unitPrice: number;
}

export interface CreateStockRequestPayload {
  notes?: string;
  items: StockRequestItemInput[];
}

export interface Paginated<T> {
  data: T[];
  pagination: { total: number; page: number; limit: number; totalPages: number };
}

interface ApiResponse<T> {
  success: boolean;
  message: string;
  data: T;
  pagination?: { total: number; page: number; limit: number; totalPages: number };
}

function toPaginated<T>(res: ApiResponse<T[]>): Paginated<T> {
  return {
    data: res.data ?? [],
    pagination: res.pagination ?? { total: res.data?.length ?? 0, page: 1, limit: 10, totalPages: 1 },
  };
}

const BASE = `${import.meta.env.VITE_API_URL ?? "http://localhost:8000/api"}/stock-requests`;

// ─── API ──────────────────────────────────────────────────────────────────────

export const stockRequestsApi = createApi({
  reducerPath: "stockRequestsApi",
  baseQuery: fetchBaseQuery({
    baseUrl: BASE,
    prepareHeaders: (headers, { getState }) => {
      const token = (getState() as RootState).auth.token;
      if (token) headers.set("Authorization", `Bearer ${token}`);
      return headers;
    },
  }),
  tagTypes: ["StockRequest"],
  endpoints: (builder) => ({
    // POST / — STOCK submits a request
    createStockRequest: builder.mutation<StockRequest, CreateStockRequestPayload>({
      query: (body) => ({ url: "/", method: "POST", body }),
      transformResponse: (res: ApiResponse<StockRequest>) => res.data,
      invalidatesTags: [{ type: "StockRequest", id: "LIST" }],
    }),

    // GET /my — STOCK sees their own requests
    getMyStockRequests: builder.query<
      Paginated<StockRequest>,
      { status?: StockRequestStatus; page?: number; limit?: number } | void
    >({
      query: (params) => ({ url: "/my", params: { limit: 10, ...(params ?? {}) } as Record<string, unknown> }),
      transformResponse: (res: ApiResponse<StockRequest[]>) => toPaginated(res),
      providesTags: [{ type: "StockRequest", id: "LIST" }],
    }),

    // GET / — DAF/ADMIN sees all requests
    getAllStockRequests: builder.query<
      Paginated<StockRequest>,
      { status?: StockRequestStatus; page?: number; limit?: number } | void
    >({
      query: (params) => ({ url: "/", params: { limit: 10, ...(params ?? {}) } as Record<string, unknown> }),
      transformResponse: (res: ApiResponse<StockRequest[]>) => toPaginated(res),
      providesTags: [{ type: "StockRequest", id: "LIST" }],
    }),

    // GET /:id — any authenticated user
    getStockRequest: builder.query<StockRequest, string>({
      query: (id) => ({ url: `/${id}` }),
      transformResponse: (res: ApiResponse<StockRequest>) => res.data,
      providesTags: (_r, _e, id) => [{ type: "StockRequest", id }],
    }),

    // PUT /:id — STOCK edits their own pending request
    updateStockRequest: builder.mutation<StockRequest, { id: string } & CreateStockRequestPayload>({
      query: ({ id, ...body }) => ({ url: `/${id}`, method: "PUT", body }),
      transformResponse: (res: ApiResponse<StockRequest>) => res.data,
      invalidatesTags: (_r, _e, { id }) => [{ type: "StockRequest", id }, { type: "StockRequest", id: "LIST" }],
    }),

    // DELETE /:id — STOCK deletes their own pending request
    deleteStockRequest: builder.mutation<void, string>({
      query: (id) => ({ url: `/${id}`, method: "DELETE" }),
      invalidatesTags: [{ type: "StockRequest", id: "LIST" }],
    }),

    // PATCH /:id/approve — DAF/ADMIN approves
    approveStockRequest: builder.mutation<StockRequest, { id: string; responseNotes?: string }>({
      query: ({ id, ...body }) => ({ url: `/${id}/approve`, method: "PATCH", body }),
      transformResponse: (res: ApiResponse<StockRequest>) => res.data,
      invalidatesTags: (_r, _e, { id }) => [{ type: "StockRequest", id }, { type: "StockRequest", id: "LIST" }],
    }),

    // PATCH /:id/reject — DAF/ADMIN rejects
    rejectStockRequest: builder.mutation<StockRequest, { id: string; responseNotes?: string }>({
      query: ({ id, ...body }) => ({ url: `/${id}/reject`, method: "PATCH", body }),
      transformResponse: (res: ApiResponse<StockRequest>) => res.data,
      invalidatesTags: (_r, _e, { id }) => [{ type: "StockRequest", id }, { type: "StockRequest", id: "LIST" }],
    }),
  }),
});

export const {
  useCreateStockRequestMutation,
  useGetMyStockRequestsQuery,
  useGetAllStockRequestsQuery,
  useGetStockRequestQuery,
  useUpdateStockRequestMutation,
  useDeleteStockRequestMutation,
  useApproveStockRequestMutation,
  useRejectStockRequestMutation,
} = stockRequestsApi;
