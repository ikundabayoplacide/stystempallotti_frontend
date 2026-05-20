import { createApi, fetchBaseQuery } from "@reduxjs/toolkit/query/react";
import type { RootState } from "../index";

// ─── Types ────────────────────────────────────────────────────────────────────

export type VisitType = "IN" | "OUT";

export interface Visit {
  id: string;
  customerId: string;
  customer?: { id: string; name: string; phone?: string; company?: string };
  purpose?: string;
  notes?: string;
  type: VisitType;
  checkinAt: string;
  checkoutAt?: string;
  recordedBy?: { id: string; name: string };
}

export interface CheckInPayload {
  customerId: string;
  purpose?: string;
  notes?: string;
}

export interface GetVisitsParams {
  customerId?: string;
  type?: VisitType;
  date?: string;
  page?: number;
  limit?: number;
}

interface ApiResponse<T> {
  success: boolean;
  message: string;
  data: T;
  pagination?: { total: number; page: number; limit: number; totalPages: number };
}

// ─── Service ──────────────────────────────────────────────────────────────────

export const visitsApi = createApi({
  reducerPath: "visitsApi",

  baseQuery: fetchBaseQuery({
    baseUrl: `${import.meta.env.VITE_API_URL ?? "http://localhost:8000/api"}/visits`,
    prepareHeaders: (headers, { getState }) => {
      const token = (getState() as RootState).auth.token;
      if (token) headers.set("Authorization", `Bearer ${token}`);
      return headers;
    },
  }),

  tagTypes: ["Visit"],

  endpoints: (builder) => ({

    // GET /api/visits — filter by customerId, type, date
    getVisits: builder.query<Visit[], GetVisitsParams | void>({
      query: (params) => ({
        url: "/",
        params: { limit: 200, ...(params ?? {}) } as Record<string, unknown>,
      }),
      transformResponse: (res: ApiResponse<Visit[]>) => res.data ?? [],
      providesTags: (result) =>
        result
          ? [...result.map(({ id }) => ({ type: "Visit" as const, id })), { type: "Visit", id: "LIST" }]
          : [{ type: "Visit", id: "LIST" }],
    }),

    // GET /api/visits/:id
    getVisitById: builder.query<Visit, string>({
      query: (id) => `/${id}`,
      transformResponse: (res: ApiResponse<Visit>) => res.data,
      providesTags: (_r, _e, id) => [{ type: "Visit", id }],
    }),

    // GET /api/visits/customer/:customerId — all visits for a customer
    getVisitsByCustomer: builder.query<Visit[], string>({
      query: (customerId) => `/customer/${customerId}`,
      transformResponse: (res: ApiResponse<Visit[]>) => res.data ?? [],
      providesTags: (_r, _e, customerId) => [{ type: "Visit", id: `customer-${customerId}` }],
    }),

    // POST /api/visits/checkin — ADMIN, RECEPTIONIST
    checkIn: builder.mutation<Visit, CheckInPayload>({
      query: (body) => ({ url: "/checkin", method: "POST", body }),
      transformResponse: (res: ApiResponse<Visit>) => res.data,
      invalidatesTags: [{ type: "Visit", id: "LIST" }],
    }),

    // PATCH /api/visits/:id/checkout — ADMIN, RECEPTIONIST
    checkOut: builder.mutation<Visit, string>({
      query: (id) => ({ url: `/${id}/checkout`, method: "PATCH" }),
      transformResponse: (res: ApiResponse<Visit>) => res.data,
      invalidatesTags: (_r, _e, id) => [
        { type: "Visit", id },
        { type: "Visit", id: "LIST" },
      ],
    }),

    // DELETE /api/visits/:id — ADMIN
    deleteVisit: builder.mutation<void, string>({
      query: (id) => ({ url: `/${id}`, method: "DELETE" }),
      invalidatesTags: (_r, _e, id) => [
        { type: "Visit", id },
        { type: "Visit", id: "LIST" },
      ],
    }),
  }),
});

export const {
  useGetVisitsQuery,
  useGetVisitByIdQuery,
  useGetVisitsByCustomerQuery,
  useCheckInMutation,
  useCheckOutMutation,
  useDeleteVisitMutation,
} = visitsApi;
