import { createApi, fetchBaseQuery } from "@reduxjs/toolkit/query/react";
import type { RootState } from "../index";

export type ProformaStatus = "draft" | "sent" | "accepted" | "rejected" | "expired";

export interface ProformaItem {
  id?: string;
  description: string;
  qty: number;
  unitPrice: number;
  totalPrice?: number;
}

export interface Proforma {
  id: string;
  proformaNo: string;
  jobNumber?: string;
  jobName?: string;
  clientName?: string;
  clientPhone?: string;
  jobCreatedAt?: string;
  subtotal: number;
  taxRate: number;
  taxAmount: number;
  discount: number;
  totalAmount: number;
  status: ProformaStatus;
  terms?: string;
  notes?: string;
  validUntil?: string;
  items: ProformaItem[];
  // Legacy: populated when proforma is linked to a job
  job?: {
    id: string;
    jobNumber: string;
    title: string;
    customer?: { id: string; name: string; phone?: string; email?: string; company?: string };
    jobItems?: any[];
    items?: any[];
  };
  customer?: { id: string; name: string; phone?: string; email?: string; company?: string };
  createdAt: string;
  updatedAt: string;
}

export interface GetProformasParams {
  status?: ProformaStatus;
  search?: string;
  page?: number;
  limit?: number;
}

export interface ProformaPayload {
  jobNumber?: string;
  jobName?: string;
  clientName?: string;
  clientPhone?: string;
  jobCreatedAt?: string;
  taxRate?: number;
  discount?: number;
  terms?: string;
  notes?: string;
  validUntil?: string;
  items: { description: string; qty: number; unitPrice: number }[];
}

export interface PaginatedProformas {
  proformas: Proforma[];
  pagination: { total: number; page: number; limit: number; totalPages: number };
}

interface ApiResponse<T> {
  success: boolean;
  message: string;
  data: T;
  pagination?: { total: number; page: number; limit: number; totalPages: number };
}

export const proformasApi = createApi({
  reducerPath: "proformasApi",
  baseQuery: fetchBaseQuery({
    baseUrl: import.meta.env.VITE_API_URL ?? "http://localhost:8000/api",
    prepareHeaders: (headers, { getState }) => {
      const token = (getState() as RootState).auth.token;
      if (token) headers.set("Authorization", `Bearer ${token}`);
      return headers;
    },
  }),
  tagTypes: ["Proforma"],
  endpoints: (builder) => ({

    getProformas: builder.query<PaginatedProformas, GetProformasParams | void>({
      query: (params) => ({ url: "/proformas", params: { limit: 20, ...(params ?? {}) } as Record<string, unknown> }),
      transformResponse: (res: ApiResponse<Proforma[]>) => ({
        proformas: res.data ?? [],
        pagination: res.pagination ?? { total: res.data?.length ?? 0, page: 1, limit: 20, totalPages: 1 },
      }),
      providesTags: (result) =>
        result?.proformas
          ? [...result.proformas.map(({ id }) => ({ type: "Proforma" as const, id })), { type: "Proforma", id: "LIST" }]
          : [{ type: "Proforma", id: "LIST" }],
    }),

    getProformaById: builder.query<Proforma, string>({
      query: (id) => `/proformas/${id}`,
      transformResponse: (res: ApiResponse<Proforma>) => res.data,
      providesTags: (_r, _e, id) => [{ type: "Proforma", id }],
    }),

    createProforma: builder.mutation<Proforma, ProformaPayload>({
      query: (body) => ({ url: "/proformas", method: "POST", body }),
      transformResponse: (res: ApiResponse<Proforma>) => res.data,
      invalidatesTags: [{ type: "Proforma", id: "LIST" }],
    }),

    updateProforma: builder.mutation<Proforma, ProformaPayload & { id: string }>({
      query: ({ id, ...body }) => ({ url: `/proformas/${id}`, method: "PUT", body }),
      transformResponse: (res: ApiResponse<Proforma>) => res.data,
      invalidatesTags: (_r, _e, { id }) => [{ type: "Proforma", id }, { type: "Proforma", id: "LIST" }],
    }),

    updateProformaStatus: builder.mutation<Proforma, { id: string; status: ProformaStatus }>({
      query: ({ id, status }) => ({ url: `/proformas/${id}/status`, method: "PATCH", body: { status } }),
      transformResponse: (res: ApiResponse<Proforma>) => res.data,
      invalidatesTags: (_r, _e, { id }) => [{ type: "Proforma", id }, { type: "Proforma", id: "LIST" }],
    }),

    deleteProforma: builder.mutation<void, string>({
      query: (id) => ({ url: `/proformas/${id}`, method: "DELETE" }),
      invalidatesTags: (_r, _e, id) => [{ type: "Proforma", id }, { type: "Proforma", id: "LIST" }],
    }),
  }),
});

export const {
  useGetProformasQuery,
  useGetProformaByIdQuery,
  useCreateProformaMutation,
  useUpdateProformaMutation,
  useUpdateProformaStatusMutation,
  useDeleteProformaMutation,
} = proformasApi;
