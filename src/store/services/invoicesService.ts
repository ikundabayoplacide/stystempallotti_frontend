import { createApi, fetchBaseQuery } from "@reduxjs/toolkit/query/react";
import type { RootState } from "../index";

// ─── Types ────────────────────────────────────────────────────────────────────

export type InvoiceStatus = "paid" | "cancelled";

export interface InvoiceItem {
  id?: string;
  name: string;          // backend field — displayed as the item name/description
  quantity: number;
  unitPrice: number;
  total: number;
}

export interface Invoice {
  id: string;
  invoiceNo: string;
  jobId: string;
  job?: {
    id: string;
    jobNumber: string;
    title: string;
    customer?: { id: string; name: string; email?: string; phone?: string };
  };
  customerId?: string;
  customer?: { id: string; name: string; email?: string; phone?: string };
  lineItems: InvoiceItem[];
  items?: InvoiceItem[];
  subtotal: number | string;
  // backend fields
  discountType?: string | null;
  discountValue?: number | string;
  discountAmount?: number | string;
  taxRate?: number | string;
  taxAmount?: number | string;
  totalAmount: number | string;
  notes?: string | null;
  status: InvoiceStatus;

  dueDate?: string | null;
  paidAt?: string | null;
  createdById?: string;
  createdAt: string;
  updatedAt: string;
}

// POST /api/invoices
export interface CreateInvoicePayload {
  jobId: string;
  customerId: string;
  lineItems: Omit<InvoiceItem, "id" | "total">[];
  discountType?: "PERCENTAGE" | "FIXED";
  discountValue?: number;
  taxRate?: number;
  notes?: string;
  dueDate?: string;
}

// PUT /api/invoices/:id
export interface UpdateInvoicePayload {
  id: string;
  lineItems?: Omit<InvoiceItem, "id" | "total">[];
  discountType?: "PERCENTAGE" | "FIXED";
  discountValue?: number;
  taxRate?: number;
  notes?: string;
  dueDate?: string;
}

export interface PaginatedInvoices {
  invoices: Invoice[];
  total: number;
  page: number;
  limit: number;
  totalPages: number;
}

export interface GetInvoicesParams {
  page?: number;
  limit?: number;
  search?: string;
  status?: InvoiceStatus;
  jobId?: string;
}

interface ApiResponse<T> {
  success: boolean;
  message: string;
  data: T;
}

function normalizePaginated(raw: unknown): PaginatedInvoices {
  if (raw && typeof raw === "object" && "invoices" in raw) {
    const r = raw as PaginatedInvoices;
    return { invoices: r.invoices ?? [], total: r.total ?? 0, page: r.page ?? 1, limit: r.limit ?? 10, totalPages: r.totalPages ?? 1 };
  }
  if (Array.isArray(raw)) {
    return { invoices: raw as Invoice[], total: (raw as Invoice[]).length, page: 1, limit: (raw as Invoice[]).length, totalPages: 1 };
  }
  return { invoices: [], total: 0, page: 1, limit: 10, totalPages: 1 };
}

// ─── Service ──────────────────────────────────────────────────────────────────

export const invoicesApi = createApi({
  reducerPath: "invoicesApi",

  baseQuery: fetchBaseQuery({
    baseUrl: import.meta.env.VITE_API_URL ?? "http://localhost:8000/api",
    prepareHeaders: (headers, { getState }) => {
      const token = (getState() as RootState).auth.token;
      if (token) headers.set("Authorization", `Bearer ${token}`);
      return headers;
    },
  }),

  tagTypes: ["Invoice"],

  endpoints: (builder) => ({

    // GET /invoices
    getInvoices: builder.query<PaginatedInvoices, GetInvoicesParams | void>({
      query: (params) => ({ url: "/invoices", params: (params ?? {}) as Record<string, any> }),
      transformResponse: (res: ApiResponse<unknown>) => normalizePaginated(res.data),
      providesTags: (result) =>
        result?.invoices?.length
          ? [...result.invoices.map(({ id }) => ({ type: "Invoice" as const, id })), { type: "Invoice", id: "LIST" }]
          : [{ type: "Invoice", id: "LIST" }],
    }),

    // GET /invoices/:id
    getInvoiceById: builder.query<Invoice, string>({
      query: (id) => `/invoices/${id}`,
      transformResponse: (res: ApiResponse<Invoice>) => res.data,
      providesTags: (_r, _e, id) => [{ type: "Invoice", id }],
    }),

    // GET /invoices/job/:jobId — invoices for a specific job
    getInvoicesByJob: builder.query<Invoice[], string>({
      query: (jobId) => `/invoices/job/${jobId}`,
      transformResponse: (res: ApiResponse<Invoice[]>) => {
        const raw = res?.data ?? res;
        return Array.isArray(raw) ? raw : [];
      },
      providesTags: (_r, _e, jobId) => [{ type: "Invoice", id: `job-${jobId}` }],
    }),

    // POST /invoices — ADMIN, ACCOUNTANT, RECEPTIONIST, SALES
    createInvoice: builder.mutation<Invoice, CreateInvoicePayload>({
      query: (body) => ({ url: "/invoices", method: "POST", body }),
      transformResponse: (res: ApiResponse<Invoice>) => res.data,
      invalidatesTags: (_r, _e, body) => [
        { type: "Invoice", id: "LIST" },
        { type: "Invoice", id: `job-${body.jobId}` },
      ],
    }),

    // PUT /invoices/:id — ADMIN, ACCOUNTANT, RECEPTIONIST, SALES
    updateInvoice: builder.mutation<Invoice, UpdateInvoicePayload>({
      query: ({ id, ...body }) => ({ url: `/invoices/${id}`, method: "PUT", body }),
      transformResponse: (res: ApiResponse<Invoice>) => res.data,
      invalidatesTags: (_r, _e, { id }) => [{ type: "Invoice", id }, { type: "Invoice", id: "LIST" }],
    }),

    // PATCH /invoices/:id/cancel — ADMIN, ACCOUNTANT
    cancelInvoice: builder.mutation<Invoice, string>({
      query: (id) => ({ url: `/invoices/${id}/cancel`, method: "PATCH" }),
      transformResponse: (res: ApiResponse<Invoice>) => res.data,
      invalidatesTags: (_r, _e, id) => [{ type: "Invoice", id }, { type: "Invoice", id: "LIST" }],
    }),

    // DELETE /invoices/:id — ADMIN, ACCOUNTANT
    deleteInvoice: builder.mutation<void, string>({
      query: (id) => ({ url: `/invoices/${id}`, method: "DELETE" }),
      invalidatesTags: (_r, _e, id) => [{ type: "Invoice", id }, { type: "Invoice", id: "LIST" }],
    }),
  }),
});

export const {
  useGetInvoicesQuery,
  useGetInvoiceByIdQuery,
  useGetInvoicesByJobQuery,
  useCreateInvoiceMutation,
  useUpdateInvoiceMutation,
  useCancelInvoiceMutation,
  useDeleteInvoiceMutation,
} = invoicesApi;
