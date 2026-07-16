import { createApi, fetchBaseQuery } from "@reduxjs/toolkit/query/react";
import type { RootState } from "../index";
import type { PaymentMethod } from "./jobsService";

// ─── Types ────────────────────────────────────────────────────────────────────

export type PaymentState = "FULL" | "PARTIAL" | "ONCREDIT";

export interface Payment {
  id: string;
  jobId: string;
  recordedById: string;
  receivedById: string;
  verifiedById?: string;
  receiptNo: string;
  amountPaid: number;
  balance: number;
  paymentMethod: PaymentMethod;
  paymentState: PaymentState;
  paymentNote?: string;
  paidAt: string;
  job?: { id: string; jobNumber: string; title: string; status?: string; customer?: { id: string; name: string; phone?: string } };
  receivedBy?: { id: string; name: string };
}

// POST /api/payments
export interface RecordPaymentPayload {
  jobId: string;
  receivedById: string;
  amountPaid: number;
  paymentMethod: PaymentMethod;
  paymentState: PaymentState;
  paymentNote?: string;
}

export interface RecordPaymentResponse {
  payment: Payment;
  receiptNo: string;
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

    // POST /payments — record a payment
    recordPayment: builder.mutation<RecordPaymentResponse, RecordPaymentPayload>({
      query: (body) => ({ url: "/payments", method: "POST", body }),
      transformResponse: (res: ApiResponse<any>) => {
        const data = res.data;
        return {
          payment: data.payment ?? data,
          receiptNo: data.receiptNo ?? data.payment?.receiptNo ?? "",
        };
      },
      invalidatesTags: (_r, _e, { jobId }) => [
        { type: "Payment", id: jobId },
        { type: "Payment", id: "LIST" },
        { type: "Job" as any, id: jobId },
        { type: "Job" as any, id: "LIST" },
        { type: "Job" as any, id: "COMPLETED_PAID" },
      ],
      async onQueryStarted(_arg, { dispatch, queryFulfilled }) {
        await queryFulfilled;
        const { withdrawalsApi } = await import("./withdrawalsService");
        dispatch(withdrawalsApi.util.invalidateTags(["WithdrawalBalance"]));
      },
    }),

    // GET /payments — all payments paginated
    getPayments: builder.query<PaginatedPayments, { page?: number; limit?: number; from?: string; to?: string; paymentMethod?: string } | void>({
      query: (params) => ({ url: "/payments", params: (params ?? {}) as Record<string, any> }),
      transformResponse: (res: any) => {
        console.log("[paymentsService] raw GET /payments response:", JSON.stringify(res).slice(0, 500));
        const payments = Array.isArray(res.data) ? res.data : (res.data?.payments ?? []);
        const pagination = res.pagination ?? { total: payments.length, page: 1, limit: payments.length, totalPages: 1 };
        return { payments, ...pagination };
      },
      providesTags: [{ type: "Payment", id: "LIST" }],
    }),

    // GET /payments/:id
    getPaymentById: builder.query<Payment, string>({
      query: (id) => `/payments/${id}`,
      transformResponse: (res: ApiResponse<Payment>) => res.data,
      providesTags: (_r, _e, id) => [{ type: "Payment", id }],
    }),

    // GET /payments/job/:jobId
    getPaymentsByJob: builder.query<Payment[], string>({
      query: (jobId) => `/payments/job/${jobId}`,
      transformResponse: (res: ApiResponse<Payment[]>) => res.data,
      providesTags: (_r, _e, jobId) => [{ type: "Payment", id: jobId }],
    }),
  }),
});

export const {
  useRecordPaymentMutation,
  useGetPaymentsQuery,
  useGetPaymentByIdQuery,
  useGetPaymentsByJobQuery,
} = paymentsApi;
