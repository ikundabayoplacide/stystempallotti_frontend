import { createApi, fetchBaseQuery } from "@reduxjs/toolkit/query/react";
import type { RootState } from "../index";

// ─── Types ────────────────────────────────────────────────────────────────────

export type ProformaStatus = "draft" | "sent" | "accepted" | "rejected" | "expired";

export interface ProformaCustomer {
  id: string;
  name: string;
  email: string;
  phone?: string;
  company?: string;
}

export interface Proforma {
  id: string;
  proformaNo: string;          // e.g. PF-2026-001
  jobId: string;
  customer?: ProformaCustomer;
  job?: {
    id: string;
    jobNumber: string;
    title: string;
    customer?: ProformaCustomer;
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
  status: ProformaStatus;
  terms?: string;
  notes?: string;
  validUntil?: string;
  createdById?: string;
  createdAt: string;
  updatedAt: string;
}

// ─── Request shapes ───────────────────────────────────────────────────────────

export interface GetProformasParams {
  status?: ProformaStatus;
  customerId?: string;
  search?: string;
  page?: number;
  limit?: number;
}

export interface CreateProformaPayload {
  jobId: string;
  taxRate?: number;
  discount?: number;
  terms?: string;
  notes?: string;
  validUntil?: string;
}

export interface UpdateProformaPayload {
  id: string;
  taxRate?: number;
  discount?: number;
  terms?: string;
  notes?: string;
  validUntil?: string;
}

export interface UpdateProformaStatusPayload {
  id: string;
  status: ProformaStatus;
}

// ─── Paginated wrapper ────────────────────────────────────────────────────────

export interface PaginatedProformas {
  proformas: Proforma[];
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

function toPaginated(res: ApiResponse<Proforma[]>): PaginatedProformas {
  return {
    proformas: res.data ?? [],
    pagination: res.pagination ?? {
      total: res.data?.length ?? 0,
      page: 1,
      limit: 20,
      totalPages: 1,
    },
  };
}

// ─── Service ──────────────────────────────────────────────────────────────────

export const proformasApi = createApi({
  reducerPath: "proformasApi",

  baseQuery: fetchBaseQuery({
    baseUrl: `${import.meta.env.VITE_API_URL ?? "http://localhost:8000/api"}`,
    prepareHeaders: (headers, { getState }) => {
      const token = (getState() as RootState).auth.token;
      if (token) headers.set("Authorization", `Bearer ${token}`);
      return headers;
    },
  }),

  tagTypes: ["Proforma"],

  endpoints: (builder) => ({

    // GET /proformas
    getProformas: builder.query<PaginatedProformas, GetProformasParams | void>({
      query: (params) => ({
        url: "/proformas",
        params: { limit: 20, ...(params ?? {}) } as Record<string, unknown>,
      }),
      transformResponse: (res: ApiResponse<Proforma[]>) => toPaginated(res),
      providesTags: (result) =>
        result?.proformas
          ? [
              ...result.proformas.map(({ id }) => ({ type: "Proforma" as const, id })),
              { type: "Proforma", id: "LIST" },
            ]
          : [{ type: "Proforma", id: "LIST" }],
    }),

    // GET /proformas/:id
    getProformaById: builder.query<Proforma, string>({
      query: (id) => `/proformas/${id}`,
      transformResponse: (res: ApiResponse<Proforma>) => res.data,
      providesTags: (_r, _e, id) => [{ type: "Proforma", id }],
    }),

    // GET /proformas/job/:jobId
    getProformasByJob: builder.query<Proforma[], string>({
      query: (jobId) => `/proformas/job/${jobId}`,
      transformResponse: (res: ApiResponse<Proforma[]>) => res.data ?? [],
      providesTags: (_r, _e, jobId) => [{ type: "Proforma", id: `job-${jobId}` }],
    }),

    // POST /proformas
    createProforma: builder.mutation<Proforma, CreateProformaPayload>({
      query: (body) => ({ url: "/proformas", method: "POST", body }),
      transformResponse: (res: ApiResponse<Proforma>) => res.data,
      invalidatesTags: [{ type: "Proforma", id: "LIST" }],
    }),

    // PUT /proformas/:id
    updateProforma: builder.mutation<Proforma, UpdateProformaPayload>({
      query: ({ id, ...body }) => ({ url: `/proformas/${id}`, method: "PUT", body }),
      transformResponse: (res: ApiResponse<Proforma>) => res.data,
      invalidatesTags: (_r, _e, { id }) => [
        { type: "Proforma", id },
        { type: "Proforma", id: "LIST" },
      ],
    }),

    // PATCH /proformas/:id/status
    updateProformaStatus: builder.mutation<Proforma, UpdateProformaStatusPayload>({
      query: ({ id, status }) => ({
        url: `/proformas/${id}/status`,
        method: "PATCH",
        body: { status },
      }),
      transformResponse: (res: ApiResponse<Proforma>) => res.data,
      invalidatesTags: (_r, _e, { id }) => [
        { type: "Proforma", id },
        { type: "Proforma", id: "LIST" },
      ],
    }),

    // DELETE /proformas/:id
    deleteProforma: builder.mutation<void, string>({
      query: (id) => ({ url: `/proformas/${id}`, method: "DELETE" }),
      invalidatesTags: (_r, _e, id) => [
        { type: "Proforma", id },
        { type: "Proforma", id: "LIST" },
      ],
    }),
  }),
});

export const {
  useGetProformasQuery,
  useGetProformaByIdQuery,
  useGetProformasByJobQuery,
  useCreateProformaMutation,
  useUpdateProformaMutation,
  useUpdateProformaStatusMutation,
  useDeleteProformaMutation,
} = proformasApi;
