import { createApi, fetchBaseQuery } from "@reduxjs/toolkit/query/react";
import type { RootState } from "../index";

// ─── Types ────────────────────────────────────────────────────────────────────

export type DebtType = "unpaid" | "partial";
export type RecoveryStatus = "pending" | "recovered" | "partial" | "written_off";
export type PaymentMethod = "CASH" | "MOBILE_MONEY" | "BANK_TRANSFER" | "CARD";

export interface DebtItem {
  jobId: string;
  jobNumber: string;
  title: string;
  status: string;
  customer: {
    id: string;
    name: string;
    phone?: string;
    email?: string;
    company?: string;
  };
  totalAmount: number;
  amountPaid: number;
  balanceDue: number;
  dueDate?: string;
  daysOverdue: number;
  lastPaymentAt?: string;
  paymentMethod?: string;
  debtType: DebtType;
}

export interface RecoveryRecord {
  id: string;
  jobId: string;
  jobNumber?: string;
  amountRecovered: number;
  paymentMethod: PaymentMethod;
  note?: string;
  contactedAt: string;
  status: RecoveryStatus;
  createdAt: string;
  // customer may come nested under job, or directly on the record
  customer?: { name: string; phone?: string; email?: string; company?: string };
  job?: {
    jobNumber: string;
    title: string;
    customer?: { name: string; phone?: string; email?: string; company?: string };
  };
}

export interface RecordRecoveryPayload {
  jobId: string;
  amountRecovered: number;
  paymentMethod: PaymentMethod;
  note?: string;
  contactedAt: string;
}

export interface UpdateRecoveryStatusPayload {
  id: string;
  status: RecoveryStatus;
}

interface ApiResponse<T> {
  success: boolean;
  message: string;
  data: T;
}

// ─── Service ──────────────────────────────────────────────────────────────────

export const recoveryApi = createApi({
  reducerPath: "recoveryApi",

  baseQuery: fetchBaseQuery({
    baseUrl: import.meta.env.VITE_API_URL ?? "http://localhost:8000/api",
    prepareHeaders: (headers, { getState }) => {
      const token = (getState() as RootState).auth.token;
      if (token) headers.set("Authorization", `Bearer ${token}`);
      return headers;
    },
  }),

  tagTypes: ["Debt", "RecoveryRecord"],

  endpoints: (builder) => ({

    // GET /recovery/debts — all outstanding debts
    getDebts: builder.query<DebtItem[], void>({
      query: () => "/recovery/debts",
      transformResponse: (res: ApiResponse<DebtItem[]>) => res.data ?? [],
      providesTags: [{ type: "Debt", id: "LIST" }],
    }),

    // GET /recovery/records — all recovery transactions
    getRecoveryRecords: builder.query<RecoveryRecord[], void>({
      query: () => "/recovery/records",
      transformResponse: (res: any) => {
        // Handle { success, data: [...] } or direct array
        const records: RecoveryRecord[] = Array.isArray(res)
          ? res
          : Array.isArray(res?.data)
          ? res.data
          : [];
        return records;
      },
      providesTags: [{ type: "RecoveryRecord", id: "LIST" }],
    }),

    // POST /recovery — record a recovery payment
    recordRecovery: builder.mutation<RecoveryRecord, RecordRecoveryPayload>({
      query: (body) => ({ url: "/recovery", method: "POST", body }),
      transformResponse: (res: ApiResponse<RecoveryRecord>) => res.data,
      invalidatesTags: [
        { type: "Debt", id: "LIST" },
        { type: "RecoveryRecord", id: "LIST" },
      ],
    }),

    // PATCH /recovery/:id/status
    updateRecoveryStatus: builder.mutation<RecoveryRecord, UpdateRecoveryStatusPayload>({
      query: ({ id, status }) => ({
        url: `/recovery/${id}/status`,
        method: "PATCH",
        body: { status },
      }),
      transformResponse: (res: ApiResponse<RecoveryRecord>) => res.data,
      invalidatesTags: [
        { type: "Debt", id: "LIST" },
        { type: "RecoveryRecord", id: "LIST" },
      ],
    }),
  }),
});

export const {
  useGetDebtsQuery,
  useGetRecoveryRecordsQuery,
  useRecordRecoveryMutation,
  useUpdateRecoveryStatusMutation,
} = recoveryApi;
