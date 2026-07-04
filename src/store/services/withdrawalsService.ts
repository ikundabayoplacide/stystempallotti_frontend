import { createApi, fetchBaseQuery } from "@reduxjs/toolkit/query/react";
import type { RootState } from "../index";

// ─── Types ────────────────────────────────────────────────────────────────────

export interface Withdrawal {
  id: string;
  title: string;
  description: string;
  amount: number | string;
  withdrawnAt: string;
  takenByName: string;
  takenByContact: string;
  source: string;
  notes?: string | null;
  recordedBy?: { id: string; name: string; role: string };
  createdAt: string;
  updatedAt: string;
}

export interface WithdrawalBalance {
  initialAmount: number;
  totalPaymentsIn: number;
  totalWithdrawalsIn: number;
  totalExpensesOut: number;
  totalBalance: number;
}

export interface FundConfig {
  initialAmount: number;
}

export interface SetInitialAmountResponse {
  initialAmount: number;
  balance: WithdrawalBalance;
}

export interface CreateWithdrawalPayload {
  title: string;
  description: string;
  amount: number;
  withdrawnAt: string;
  takenByName: string;
  takenByContact: string;
  source: string;
  notes?: string;
}

export interface UpdateWithdrawalPayload extends Partial<CreateWithdrawalPayload> {}

export interface GetWithdrawalsParams {
  from?: string;
  to?: string;
  search?: string;
  page?: number;
  limit?: number;
}

export interface PaginatedWithdrawals {
  withdrawals: Withdrawal[];
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

function normalizePaginated(res: ApiResponse<unknown>): PaginatedWithdrawals {
  const raw = res.data;
  if (raw && typeof raw === "object" && "withdrawals" in raw) {
    const r = raw as PaginatedWithdrawals;
    return { withdrawals: r.withdrawals ?? [], total: r.total ?? 0, page: r.page ?? 1, limit: r.limit ?? 10, totalPages: r.totalPages ?? 1 };
  }
  if (Array.isArray(raw)) {
    return { withdrawals: raw as Withdrawal[], total: (raw as Withdrawal[]).length, page: 1, limit: (raw as Withdrawal[]).length, totalPages: 1 };
  }
  return { withdrawals: [], total: 0, page: 1, limit: 10, totalPages: 1 };
}

// ─── Service ──────────────────────────────────────────────────────────────────

export const withdrawalsApi = createApi({
  reducerPath: "withdrawalsApi",

  baseQuery: fetchBaseQuery({
    baseUrl: import.meta.env.VITE_API_URL ?? "http://localhost:8000/api",
    prepareHeaders: (headers, { getState }) => {
      const token = (getState() as RootState).auth.token;
      if (token) headers.set("Authorization", `Bearer ${token}`);
      return headers;
    },
  }),

  tagTypes: ["Withdrawal", "WithdrawalBalance", "FundConfig"],

  endpoints: (builder) => ({

    // GET /withdrawals/config
    getWithdrawalConfig: builder.query<FundConfig, void>({
      query: () => "/withdrawals/config",
      transformResponse: (res: ApiResponse<FundConfig>) => res.data,
      providesTags: ["FundConfig"],
    }),

    // PUT /withdrawals/config
    setInitialAmount: builder.mutation<SetInitialAmountResponse, number>({
      query: (initialAmount) => ({ url: "/withdrawals/config", method: "PUT", body: { initialAmount } }),
      transformResponse: (res: ApiResponse<SetInitialAmountResponse>) => res.data,
      invalidatesTags: ["FundConfig", "WithdrawalBalance"],
    }),

    // GET /withdrawals/balance
    getWithdrawalBalance: builder.query<WithdrawalBalance, void>({
      query: () => "/withdrawals/balance",
      transformResponse: (res: ApiResponse<WithdrawalBalance>) => res.data,
      providesTags: ["WithdrawalBalance"],
    }),

    // GET /withdrawals
    getWithdrawals: builder.query<PaginatedWithdrawals, GetWithdrawalsParams | void>({
      query: (params) => ({ url: "/withdrawals", params: (params ?? {}) as Record<string, unknown> }),
      transformResponse: (res: ApiResponse<unknown>) => normalizePaginated(res),
      providesTags: (result) =>
        result?.withdrawals?.length
          ? [...result.withdrawals.map(({ id }) => ({ type: "Withdrawal" as const, id })), { type: "Withdrawal", id: "LIST" }]
          : [{ type: "Withdrawal", id: "LIST" }],
    }),

    // GET /withdrawals/:id
    getWithdrawalById: builder.query<Withdrawal, string>({
      query: (id) => `/withdrawals/${id}`,
      transformResponse: (res: ApiResponse<Withdrawal>) => res.data,
      providesTags: (_r, _e, id) => [{ type: "Withdrawal", id }],
    }),

    // POST /withdrawals
    createWithdrawal: builder.mutation<Withdrawal, CreateWithdrawalPayload>({
      query: (body) => ({ url: "/withdrawals", method: "POST", body }),
      transformResponse: (res: ApiResponse<Withdrawal>) => res.data,
      invalidatesTags: [{ type: "Withdrawal", id: "LIST" }, "WithdrawalBalance"],
    }),

    // PUT /withdrawals/:id
    updateWithdrawal: builder.mutation<Withdrawal, { id: string; data: UpdateWithdrawalPayload }>({
      query: ({ id, data }) => ({ url: `/withdrawals/${id}`, method: "PUT", body: data }),
      transformResponse: (res: ApiResponse<Withdrawal>) => res.data,
      invalidatesTags: (_r, _e, { id }) => [{ type: "Withdrawal", id }, { type: "Withdrawal", id: "LIST" }, "WithdrawalBalance"],
    }),

    // DELETE /withdrawals/:id
    deleteWithdrawal: builder.mutation<void, string>({
      query: (id) => ({ url: `/withdrawals/${id}`, method: "DELETE" }),
      invalidatesTags: (_r, _e, id) => [{ type: "Withdrawal", id }, { type: "Withdrawal", id: "LIST" }, "WithdrawalBalance"],
    }),
  }),
});

export const {
  useGetWithdrawalConfigQuery,
  useSetInitialAmountMutation,
  useGetWithdrawalBalanceQuery,
  useGetWithdrawalsQuery,
  useGetWithdrawalByIdQuery,
  useCreateWithdrawalMutation,
  useUpdateWithdrawalMutation,
  useDeleteWithdrawalMutation,
} = withdrawalsApi;
