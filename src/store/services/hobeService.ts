import { createApi, fetchBaseQuery } from "@reduxjs/toolkit/query/react";
import type { RootState } from "../index";

// ─── Types ────────────────────────────────────────────────────────────────────

export type HobePaymentMethod = "cash" | "mobile" | "card" | "bank";
export type HobePaymentStatus = "paid" | "partial" | "overpaid";

export interface Hobe {
  id: string;
  hobeNo: string;
  nameOfHobe: string;
  doneAt: string;
  expiredAt: string;
  qty: number;
  qtyRemains: number;
  qtySold: number;
  pricePerItem: number;
  ob: number;
  note?: string;
  status: "active" | "expired" | "sold-out";
  createdAt: string;
  updatedAt: string;
}

export interface HobeSale {
  id: string;
  hobeId: string;
  hobeNo: string;
  quantity: number;
  unitPrice: number;
  totalPrice: number;
  amountPaid: number;
  balanceDue: number;
  changeGiven: number;
  paymentStatus: HobePaymentStatus;
  paymentMethod: HobePaymentMethod;
  note?: string;
  createdAt: string;
  hobe: { nameOfHobe: string; hobeNo: string };
  soldBy: { name: string; email: string; role: string };
  customer?: { name: string; phone?: string } | null;
  qtyRemains: number;
  qtySold: number;
}

export interface HobeSalesSummary {
  totalTransactions: number;
  totalQuantitySold: number;
  totalAmountPaid: number;
  totalExpectedRevenue: number;
  totalBalanceDue: number;
}

// ─── Params / Payloads ────────────────────────────────────────────────────────

export interface GetHobesParams {
  status?: "active" | "expired" | "sold-out";
  search?: string;
  page?: number;
  limit?: number;
}

export interface PaginatedHobes {
  hobes: Hobe[];
  pagination: { total: number; page: number; limit: number; totalPages: number };
}

export interface CreateHobePayload {
  nameOfHobe: string;
  doneAt: string;
  expiredAt: string;
  qty: number;
  pricePerItem: number;
  ob?: number;
  note?: string;
}

export interface SellHobePayload {
  id: string;
  quantity: number;
  amountPaid: number;
  paymentMethod: HobePaymentMethod;
  customerId?: string;
  note?: string;
}

export interface GetHobeSalesParams {
  hobeId?: string;
  from?: string;
  to?: string;
  paymentStatus?: HobePaymentStatus;
  page?: number;
  limit?: number;
}

export interface PaginatedHobeSales {
  sales: HobeSale[];
  pagination: { total: number; page: number; limit: number; totalPages: number };
}

interface ApiResponse<T> {
  success: boolean;
  message: string;
  data: T;
  pagination?: { total: number; page: number; limit: number; totalPages: number };
}

// ─── Service ──────────────────────────────────────────────────────────────────

// Base URL is /api  — all paths are written in full (/hobes/...)
// This avoids the trailing-slash ambiguity that caused /hobes/sales/all
// to resolve incorrectly when baseUrl already ended with "/hobes".

export const hobeApi = createApi({
  reducerPath: "hobeApi",

  baseQuery: fetchBaseQuery({
    baseUrl: import.meta.env.VITE_API_URL ?? "http://localhost:8000/api",
    prepareHeaders: (headers, { getState }) => {
      const token = (getState() as RootState).auth.token;
      if (token) headers.set("Authorization", `Bearer ${token}`);
      return headers;
    },
  }),

  tagTypes: ["Hobe", "HobeSale"],

  endpoints: (builder) => ({

    // ── Hobes CRUD ────────────────────────────────────────────────────────────

    // GET /hobes   (hobe.view)
    getHobes: builder.query<PaginatedHobes, GetHobesParams | void>({
      query: (params) => ({
        url: "/hobes",
        params: { limit: 100, ...(params ?? {}) } as Record<string, unknown>,
      }),
      transformResponse: (res: ApiResponse<Hobe[]>) => ({
        hobes: res.data ?? [],
        pagination: res.pagination ?? {
          total: res.data?.length ?? 0, page: 1, limit: 100, totalPages: 1,
        },
      }),
      providesTags: (result) =>
        result?.hobes
          ? [
              ...result.hobes.map(({ id }) => ({ type: "Hobe" as const, id })),
              { type: "Hobe", id: "LIST" },
            ]
          : [{ type: "Hobe", id: "LIST" }],
    }),

    // GET /hobes/:id   (hobe.view)
    getHobeById: builder.query<Hobe, string>({
      query: (id) => `/hobes/${id}`,
      transformResponse: (res: ApiResponse<Hobe>) => res.data,
      providesTags: (_r, _e, id) => [{ type: "Hobe", id }],
    }),

    // POST /hobes   (hobe.create)
    createHobe: builder.mutation<Hobe, CreateHobePayload>({
      query: (body) => ({ url: "/hobes", method: "POST", body }),
      transformResponse: (res: ApiResponse<Hobe>) => res.data,
      invalidatesTags: [{ type: "Hobe", id: "LIST" }],
    }),

    // PUT /hobes/:id   (hobe.edit)
    updateHobe: builder.mutation<Hobe, { id: string } & Partial<CreateHobePayload>>({
      query: ({ id, ...body }) => ({ url: `/hobes/${id}`, method: "PUT", body }),
      transformResponse: (res: ApiResponse<Hobe>) => res.data,
      invalidatesTags: (_r, _e, { id }) => [
        { type: "Hobe", id },
        { type: "Hobe", id: "LIST" },
      ],
    }),

    // DELETE /hobes/:id   (hobe.delete)
    deleteHobe: builder.mutation<void, string>({
      query: (id) => ({ url: `/hobes/${id}`, method: "DELETE" }),
      invalidatesTags: (_r, _e, id) => [
        { type: "Hobe", id },
        { type: "Hobe", id: "LIST" },
      ],
    }),

    // ── Trade ─────────────────────────────────────────────────────────────────

    // POST /hobes/:id/sell   (hobe.sell)
    sellHobe: builder.mutation<HobeSale, SellHobePayload>({
      query: ({ id, ...body }) => ({ url: `/hobes/${id}/sell`, method: "POST", body }),
      transformResponse: (res: ApiResponse<HobeSale>) => res.data,
      invalidatesTags: (_r, _e, { id }) => [
        { type: "Hobe", id },
        { type: "Hobe", id: "LIST" },
        { type: "HobeSale", id: "LIST" },
      ],
    }),

    // ── Sales ─────────────────────────────────────────────────────────────────

    // GET /hobes/sales/all   (hobe.view)
    getHobeSales: builder.query<PaginatedHobeSales, GetHobeSalesParams | void>({
      query: (params) => ({
        url: "/hobes/sales/all",
        params: { limit: 200, ...(params ?? {}) } as Record<string, unknown>,
      }),
      transformResponse: (res: unknown) => {
        const r = res as any;
        const sales: HobeSale[] = r?.data ?? r?.sales ?? [];
        const pagination = r?.pagination ?? {
          total: sales.length, page: 1, limit: 200, totalPages: 1,
        };
        return { sales, pagination };
      },
      providesTags: [{ type: "HobeSale", id: "LIST" }],
    }),

    // GET /hobes/sales/summary   (hobe.view)
    getHobeSalesSummary: builder.query<HobeSalesSummary, { from?: string; to?: string } | void>({
      query: (params) => ({
        url: "/hobes/sales/summary",
        params: (params ?? {}) as Record<string, unknown>,
      }),
      transformResponse: (res: ApiResponse<HobeSalesSummary>) => res.data,
      providesTags: [{ type: "HobeSale", id: "SUMMARY" }],
    }),

    // PUT /hobes/sales/:saleId   (hobe.edit)
    updateHobeSale: builder.mutation<HobeSale, {
      saleId: string;
      amountPaid?: number;
      paymentMethod?: HobePaymentMethod;
      note?: string;
    }>({
      query: ({ saleId, ...body }) => ({
        url: `/hobes/sales/${saleId}`,
        method: "PUT",
        body,
      }),
      transformResponse: (res: ApiResponse<HobeSale>) => res.data,
      invalidatesTags: [
        { type: "HobeSale", id: "LIST" },
        { type: "HobeSale", id: "SUMMARY" },
      ],
    }),

    // DELETE /hobes/sales/:saleId   (hobe.delete)
    deleteHobeSale: builder.mutation<void, string>({
      query: (saleId) => ({ url: `/hobes/sales/${saleId}`, method: "DELETE" }),
      invalidatesTags: [
        { type: "HobeSale", id: "LIST" },
        { type: "HobeSale", id: "SUMMARY" },
        { type: "Hobe", id: "LIST" }, // qty is restored on the hobe
      ],
    }),
  }),
});

export const {
  useGetHobesQuery,
  useGetHobeByIdQuery,
  useCreateHobeMutation,
  useUpdateHobeMutation,
  useDeleteHobeMutation,
  useSellHobeMutation,
  useGetHobeSalesQuery,
  useGetHobeSalesSummaryQuery,
  useUpdateHobeSaleMutation,
  useDeleteHobeSaleMutation,
} = hobeApi;
