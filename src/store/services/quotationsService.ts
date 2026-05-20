import { createApi, fetchBaseQuery } from "@reduxjs/toolkit/query/react";
import type { RootState } from "../index";

// ─── Types ────────────────────────────────────────────────────────────────────

export type QuotationStatus = "draft" | "sent" | "accepted" | "rejected" | "expired";

export interface QuotationCustomer {
  id: string;
  name: string;
  email: string;
  phone?: string;
  company?: string;
}

export interface Quotation {
  id: string;
  quotationNo: string;          // e.g. QT-2026-001
  jobId: string;
  customer?: QuotationCustomer; // top-level include from backend
  job?: {
    id: string;
    jobNumber: string;
    title: string;
    customer?: QuotationCustomer;
    items?: Array<{
      id: string;
      stockItem: { name: string; unit: string };
      quantityNeeded: number;
      notes?: string;
    }>;
  };
  subtotal: number;
  taxRate: number;
  taxAmount: number;
  discount: number;
  totalAmount: number;
  status: QuotationStatus;
  terms?: string;
  notes?: string;
  validUntil?: string;
  createdById?: string;
  createdAt: string;
  updatedAt: string;
}

// ─── Request shapes ───────────────────────────────────────────────────────────

export interface GetQuotationsParams {
  status?: QuotationStatus;
  customerId?: string;
  search?: string;
  page?: number;
  limit?: number;
}

export interface CreateQuotationPayload {
  jobId: string;
  taxRate?: number;
  discount?: number;
  terms?: string;
  notes?: string;
  validUntil?: string;
}

export interface UpdateQuotationPayload {
  id: string;
  taxRate?: number;
  discount?: number;
  terms?: string;
  notes?: string;
  validUntil?: string;
}

export interface UpdateQuotationStatusPayload {
  id: string;
  status: QuotationStatus;
}

// ─── Paginated wrapper ────────────────────────────────────────────────────────

export interface PaginatedQuotations {
  quotations: Quotation[];
  pagination: {
    total: number;
    page: number;
    limit: number;
    totalPages: number;
  };
}

interface ApiResponse<T> {
  success: boolean;
  message: string;
  data: T;
  pagination?: {
    total: number;
    page: number;
    limit: number;
    totalPages: number;
  };
}

function toPaginated(res: ApiResponse<Quotation[]>): PaginatedQuotations {
  return {
    quotations: res.data ?? [],
    pagination: res.pagination ?? {
      total: res.data?.length ?? 0,
      page: 1,
      limit: 20,
      totalPages: 1,
    },
  };
}

// ─── Service ──────────────────────────────────────────────────────────────────

export const quotationsApi = createApi({
  reducerPath: "quotationsApi",

  baseQuery: fetchBaseQuery({
    baseUrl: `${import.meta.env.VITE_API_URL ?? "http://localhost:8000/api"}`,
    prepareHeaders: (headers, { getState }) => {
      const token = (getState() as RootState).auth.token;
      if (token) headers.set("Authorization", `Bearer ${token}`);
      return headers;
    },
  }),

  tagTypes: ["Quotation"],

  endpoints: (builder) => ({

    // GET /quotations
    getQuotations: builder.query<PaginatedQuotations, GetQuotationsParams | void>({
      query: (params) => ({
        url: "/quotations",
        params: { limit: 20, ...(params ?? {}) } as Record<string, unknown>,
      }),
      transformResponse: (res: ApiResponse<Quotation[]>) => toPaginated(res),
      providesTags: (result) =>
        result?.quotations
          ? [
              ...result.quotations.map(({ id }) => ({ type: "Quotation" as const, id })),
              { type: "Quotation", id: "LIST" },
            ]
          : [{ type: "Quotation", id: "LIST" }],
    }),

    // GET /quotations/:id
    getQuotationById: builder.query<Quotation, string>({
      query: (id) => `/quotations/${id}`,
      transformResponse: (res: ApiResponse<Quotation>) => res.data,
      providesTags: (_r, _e, id) => [{ type: "Quotation", id }],
    }),

    // GET /quotations/job/:jobId
    getQuotationsByJob: builder.query<Quotation[], string>({
      query: (jobId) => `/quotations/job/${jobId}`,
      transformResponse: (res: ApiResponse<Quotation[]>) => res.data ?? [],
      providesTags: (_r, _e, jobId) => [{ type: "Quotation", id: `job-${jobId}` }],
    }),

    // POST /quotations — ADMIN, RECEPTIONIST, SALES
    createQuotation: builder.mutation<Quotation, CreateQuotationPayload>({
      query: (body) => ({ url: "/quotations", method: "POST", body }),
      transformResponse: (res: ApiResponse<Quotation>) => res.data,
      invalidatesTags: [{ type: "Quotation", id: "LIST" }],
    }),

    // PUT /quotations/:id — ADMIN, RECEPTIONIST, SALES (draft only)
    updateQuotation: builder.mutation<Quotation, UpdateQuotationPayload>({
      query: ({ id, ...body }) => ({ url: `/quotations/${id}`, method: "PUT", body }),
      transformResponse: (res: ApiResponse<Quotation>) => res.data,
      invalidatesTags: (_r, _e, { id }) => [
        { type: "Quotation", id },
        { type: "Quotation", id: "LIST" },
      ],
    }),

    // PATCH /quotations/:id/status — ADMIN, RECEPTIONIST, SALES
    updateQuotationStatus: builder.mutation<Quotation, UpdateQuotationStatusPayload>({
      query: ({ id, status }) => ({
        url: `/quotations/${id}/status`,
        method: "PATCH",
        body: { status },
      }),
      transformResponse: (res: ApiResponse<Quotation>) => res.data,
      invalidatesTags: (_r, _e, { id }) => [
        { type: "Quotation", id },
        { type: "Quotation", id: "LIST" },
      ],
    }),

    // DELETE /quotations/:id — ADMIN, RECEPTIONIST (draft only)
    deleteQuotation: builder.mutation<void, string>({
      query: (id) => ({ url: `/quotations/${id}`, method: "DELETE" }),
      invalidatesTags: (_r, _e, id) => [
        { type: "Quotation", id },
        { type: "Quotation", id: "LIST" },
      ],
    }),
  }),
});

export const {
  useGetQuotationsQuery,
  useGetQuotationByIdQuery,
  useGetQuotationsByJobQuery,
  useCreateQuotationMutation,
  useUpdateQuotationMutation,
  useUpdateQuotationStatusMutation,
  useDeleteQuotationMutation,
} = quotationsApi;
