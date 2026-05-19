import { createApi, fetchBaseQuery } from "@reduxjs/toolkit/query/react";
import type { RootState } from "../index";

// ─── Types ────────────────────────────────────────────────────────────────────

export type PaymentMethod = "CASH" | "MOMO" | "BANK_TRANSFER" | "CHEQUE" | "OTHER";
export type PaymentStatus = "PENDING" | "CONFIRMED" | "FAILED" | "REFUNDED";

export interface Payment {
  id: string;
  jobId: string;
  jobNumber: string;
  customerName: string;
  customerPhone?: string;
  amount: number;
  method: PaymentMethod;
  status: PaymentStatus;
  reference?: string;   // e.g. MoMo transaction ID, cheque number
  notes?: string;
  collectedById: string;
  createdAt: string;
  updatedAt: string;
}

export interface CreatePaymentPayload {
  jobId: string;
  amount: number;
  method: PaymentMethod;
  reference?: string;
  notes?: string;
}

export interface GetPaymentsParams {
  page?: number;
  limit?: number;
  search?: string;
  method?: PaymentMethod;
  status?: PaymentStatus;
  jobId?: string;
}

export interface PaginatedPayments {
  payments: Payment[];
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

function normalizePaginatedPayments(raw: unknown): PaginatedPayments {
  if (raw && typeof raw === "object" && "payments" in raw) {
    const r = raw as PaginatedPayments;
    return {
      payments: Array.isArray(r.payments) ? r.payments : [],
      total: r.total ?? 0,
      page: r.page ?? 1,
      limit: r.limit ?? 10,
      totalPages: r.totalPages ?? 1,
    };
  }
  if (Array.isArray(raw)) {
    return {
      payments: raw as Payment[],
      total: (raw as Payment[]).length,
      page: 1,
      limit: (raw as Payment[]).length,
      totalPages: 1,
    };
  }
  return { payments: [], total: 0, page: 1, limit: 10, totalPages: 1 };
}

// ─── Service ──────────────────────────────────────────────────────────────────

export const paymentsApi = createApi({
  reducerPath: "paymentsApi",

  baseQuery: fetchBaseQuery({
    baseUrl: import.meta.env.VITE_API_URL ?? "http://localhost:8000/api",
    prepareHeaders: (headers, { getState }) => {
      const token = (getState() as RootState).auth.token;
      if (token) headers.set("Authorization", `Bearer ${token}`);
      return headers;
    },
  }),

  tagTypes: ["Payment"],

  endpoints: (builder) => ({

    // GET /payments
    getPayments: builder.query<PaginatedPayments, GetPaymentsParams | void>({
      query: (params) => ({ url: "/payments", params: params ?? {} }),
      transformResponse: (res: ApiResponse<unknown>) =>
        normalizePaginatedPayments(res.data),
      providesTags: (result) =>
        result?.payments?.length
          ? [
              ...result.payments.map(({ id }) => ({ type: "Payment" as const, id })),
              { type: "Payment", id: "LIST" },
            ]
          : [{ type: "Payment", id: "LIST" }],
    }),

    // GET /payments/:id
    getPaymentById: builder.query<Payment, string>({
      query: (id) => `/payments/${id}`,
      transformResponse: (res: ApiResponse<Payment>) => res.data,
      providesTags: (_r, _e, id) => [{ type: "Payment", id }],
    }),

    // POST /payments
    createPayment: builder.mutation<Payment, CreatePaymentPayload>({
      query: (body) => ({ url: "/payments", method: "POST", body }),
      transformResponse: (res: ApiResponse<Payment>) => res.data,
      invalidatesTags: [{ type: "Payment", id: "LIST" }],
    }),

    // PATCH /payments/:id/status
    updatePaymentStatus: builder.mutation<
      Payment,
      { id: string; status: PaymentStatus }
    >({
      query: ({ id, status }) => ({
        url: `/payments/${id}/status`,
        method: "PATCH",
        body: { status },
      }),
      transformResponse: (res: ApiResponse<Payment>) => res.data,
      invalidatesTags: (_r, _e, { id }) => [
        { type: "Payment", id },
        { type: "Payment", id: "LIST" },
      ],
    }),
  }),
});

export const {
  useGetPaymentsQuery,
  useGetPaymentByIdQuery,
  useCreatePaymentMutation,
  useUpdatePaymentStatusMutation,
} = paymentsApi;
