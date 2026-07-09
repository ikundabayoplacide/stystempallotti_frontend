import { createApi, fetchBaseQuery } from "@reduxjs/toolkit/query/react";
import type { RootState } from "../index";

// ─── Types ────────────────────────────────────────────────────────────────────

export interface Sheet {
  id: string;
  ref?: string;
  name: string;
  description?: string | null;
  qty: number;
  unitPrice: number | string;
  totalAmount: number | string;
  customerName?: string | null;
  customerPhone?: string | null;
  notes?: string | null;
  createdBy?: { id: string; name: string; role: string };
  createdAt: string;
  updatedAt: string;
}

export interface CreateSheetPayload {
  name: string;
  description?: string;
  qty: number;
  unitPrice: number;
  customerName?: string;
  customerPhone?: string;
  notes?: string;
}

export interface UpdateSheetPayload {
  name?: string;
  description?: string;
  qty?: number;
  unitPrice?: number;
  customerName?: string;
  customerPhone?: string;
  notes?: string;
}

export interface GetSheetsParams {
  page?: number;
  limit?: number;
  search?: string;
}

export interface PaginatedSheets {
  sheets: Sheet[];
  total: number;
  page: number;
  limit: number;
  totalPages: number;
}

interface ApiResponse<T> {
  success: boolean;
  message: string;
  data: T;
  pagination?: { total: number; page: number; limit: number; totalPages: number };
}

// ─── API ──────────────────────────────────────────────────────────────────────

export const sheetsApi = createApi({
  reducerPath: "sheetsApi",

  baseQuery: fetchBaseQuery({
    baseUrl: import.meta.env.VITE_API_URL,
    prepareHeaders: (headers, { getState }) => {
      const token =
        (getState() as RootState).auth?.token ??
        localStorage.getItem("token");
      if (token) headers.set("Authorization", `Bearer ${token}`);
      return headers;
    },
  }),

  tagTypes: ["Sheet"],

  endpoints: (builder) => ({
    // GET /api/sheets
    getSheets: builder.query<PaginatedSheets, GetSheetsParams | void>({
      query: (params) => ({
        url: "/sheets",
        params: params ?? {},
      }),
      transformResponse: (res: ApiResponse<Sheet[] | PaginatedSheets>) => {
        if (Array.isArray(res.data)) {
          return {
            sheets: res.data,
            total: res.data.length,
            page: 1,
            limit: res.data.length,
            totalPages: 1,
          };
        }
        return res.data as PaginatedSheets;
      },
      providesTags: (result) =>
        result
          ? [
              ...result.sheets.map(({ id }) => ({ type: "Sheet" as const, id })),
              { type: "Sheet", id: "LIST" },
            ]
          : [{ type: "Sheet", id: "LIST" }],
    }),

    // GET /api/sheets/:id
    getSheet: builder.query<Sheet, string>({
      query: (id) => `/sheets/${id}`,
      transformResponse: (res: ApiResponse<Sheet>) => res.data,
      providesTags: (_result, _err, id) => [{ type: "Sheet", id }],
    }),

    // POST /api/sheets
    createSheet: builder.mutation<Sheet, CreateSheetPayload>({
      query: (body) => ({
        url: "/sheets",
        method: "POST",
        body,
      }),
      transformResponse: (res: ApiResponse<Sheet>) => res.data,
      invalidatesTags: [{ type: "Sheet", id: "LIST" }],
    }),

    // PUT /api/sheets/:id
    updateSheet: builder.mutation<Sheet, { id: string } & UpdateSheetPayload>({
      query: ({ id, ...body }) => ({
        url: `/sheets/${id}`,
        method: "PUT",
        body,
      }),
      transformResponse: (res: ApiResponse<Sheet>) => res.data,
      invalidatesTags: (_result, _err, { id }) => [
        { type: "Sheet", id },
        { type: "Sheet", id: "LIST" },
      ],
    }),

    // DELETE /api/sheets/:id  (ADMIN only)
    deleteSheet: builder.mutation<void, string>({
      query: (id) => ({
        url: `/sheets/${id}`,
        method: "DELETE",
      }),
      invalidatesTags: (_result, _err, id) => [
        { type: "Sheet", id },
        { type: "Sheet", id: "LIST" },
      ],
    }),
  }),
});

export const {
  useGetSheetsQuery,
  useGetSheetQuery,
  useCreateSheetMutation,
  useUpdateSheetMutation,
  useDeleteSheetMutation,
} = sheetsApi;
