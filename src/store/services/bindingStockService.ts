import { createApi, fetchBaseQuery } from "@reduxjs/toolkit/query/react";
import type { RootState } from "../index";

export type StockStatus = "available" | "low" | "out-of-stock";
export type SortieStatus = "pending" | "approved" | "rejected";

export interface BindingStockItem {
  id: string;
  itemName: string;
  description?: string;
  category: string;
  unit: string;
  unitCost?: number;
  currentStock: number;
  alarmStock: number;
  stockStatus: StockStatus;
  createdAt: string;
  updatedAt: string;
}

export interface BindingStockEntry {
  id: string;
  stockItemId: string;
  stockItem?: BindingStockItem;
  quantity: number;
  note?: string;
  createdBy?: { id: string; name: string };
  createdAt: string;
}

export interface BindingStockSortie {
  id: string;
  stockItemId: string;
  stockItem?: BindingStockItem;
  quantityOut: string;
  reason?: string;
  notes?: string | null;
  status: SortieStatus;
  sortieDate: string;
  requester?: { id: string; name: string; email: string; role: string };
  approvedBy?: { id: string; name: string; email: string; role: string } | null;
  createdAt: string;
  updatedAt: string;
}

export interface Paginated<T> {
  data: T[];
  pagination: { total: number; page: number; limit: number; totalPages: number };
}

interface ApiResponse<T> {
  success: boolean;
  message: string;
  data: T;
  pagination?: { total: number; page: number; limit: number; totalPages: number };
}

function toPaginated<T>(res: ApiResponse<T[]>): Paginated<T> {
  return {
    data: res.data ?? [],
    pagination: res.pagination ?? { total: res.data?.length ?? 0, page: 1, limit: 100, totalPages: 1 },
  };
}

const BASE = `${import.meta.env.VITE_API_URL ?? "http://localhost:8000/api"}/binding-stock`;

export const bindingStockApi = createApi({
  reducerPath: "bindingStockApi",
  baseQuery: fetchBaseQuery({
    baseUrl: BASE,
    prepareHeaders: (headers, { getState }) => {
      const token = (getState() as RootState).auth.token;
      if (token) headers.set("Authorization", `Bearer ${token}`);
      return headers;
    },
  }),
  tagTypes: ["BDItem", "BDEntry", "BDSortie"],
  endpoints: (builder) => ({
    getBindingStockItems: builder.query<Paginated<BindingStockItem>, { search?: string; stockStatus?: string; limit?: number } | void>({
      query: (params) => ({ url: "/items", params: { limit: 200, ...(params ?? {}) } as Record<string, unknown> }),
      transformResponse: (res: ApiResponse<BindingStockItem[]>) => toPaginated(res),
      providesTags: (r) => r ? [...r.data.map(({ id }) => ({ type: "BDItem" as const, id })), { type: "BDItem", id: "LIST" }] : [{ type: "BDItem", id: "LIST" }],
    }),
    createBindingStockItem: builder.mutation<BindingStockItem, { itemName: string; description?: string; category: string; unit: string; currentStock: number; alarmStock: number }>({
      query: (body) => ({ url: "/items", method: "POST", body }),
      transformResponse: (res: ApiResponse<BindingStockItem>) => res.data,
      invalidatesTags: [{ type: "BDItem", id: "LIST" }],
    }),
    updateBindingStockItem: builder.mutation<BindingStockItem, { id: string; itemName?: string; description?: string; category?: string; unit?: string; alarmStock?: number }>({
      query: ({ id, ...body }) => ({ url: `/items/${id}`, method: "PUT", body }),
      transformResponse: (res: ApiResponse<BindingStockItem>) => res.data,
      invalidatesTags: (_r, _e, { id }) => [{ type: "BDItem", id }, { type: "BDItem", id: "LIST" }],
    }),
    deleteBindingStockItem: builder.mutation<void, string>({
      query: (id) => ({ url: `/items/${id}`, method: "DELETE" }),
      invalidatesTags: (_r, _e, id) => [{ type: "BDItem", id }, { type: "BDItem", id: "LIST" }],
    }),
    getBindingStockEntries: builder.query<Paginated<BindingStockEntry>, { stockItemId?: string; limit?: number } | void>({
      query: (params) => ({ url: "/entries", params: { limit: 50, ...(params ?? {}) } as Record<string, unknown> }),
      transformResponse: (res: ApiResponse<BindingStockEntry[]>) => toPaginated(res),
      providesTags: [{ type: "BDEntry", id: "LIST" }],
    }),
    createBindingStockEntry: builder.mutation<BindingStockEntry, { stockItemId: string; quantity: number; note?: string }>({
      query: (body) => ({ url: "/entries", method: "POST", body }),
      transformResponse: (res: ApiResponse<BindingStockEntry>) => res.data,
      invalidatesTags: [{ type: "BDEntry", id: "LIST" }, { type: "BDItem", id: "LIST" }],
    }),
    getBindingStockSorties: builder.query<Paginated<BindingStockSortie>, { status?: SortieStatus; limit?: number } | void>({
      query: (params) => ({ url: "/sorties", params: { limit: 200, ...(params ?? {}) } as Record<string, unknown> }),
      transformResponse: (res: ApiResponse<BindingStockSortie[]>) => toPaginated(res),
      providesTags: (r) => r ? [...r.data.map(({ id }) => ({ type: "BDSortie" as const, id })), { type: "BDSortie", id: "LIST" }] : [{ type: "BDSortie", id: "LIST" }],
    }),
    getMyBindingStockSorties: builder.query<Paginated<BindingStockSortie>, { limit?: number } | void>({
      query: (params) => ({ url: "/sorties/my", params: { limit: 100, ...(params ?? {}) } as Record<string, unknown> }),
      transformResponse: (res: ApiResponse<BindingStockSortie[]>) => toPaginated(res),
      providesTags: [{ type: "BDSortie", id: "MY" }],
    }),
    createBindingStockSortie: builder.mutation<BindingStockSortie, { stockItemId: string; quantityOut: number; reason: string; notes?: string }>({
      query: (body) => ({ url: "/sorties", method: "POST", body }),
      transformResponse: (res: ApiResponse<BindingStockSortie>) => res.data,
      invalidatesTags: [{ type: "BDSortie", id: "LIST" }, { type: "BDSortie", id: "MY" }],
    }),
    approveBindingStockSortie: builder.mutation<BindingStockSortie, string>({
      query: (id) => ({ url: `/sorties/${id}/approve`, method: "PATCH" }),
      transformResponse: (res: ApiResponse<BindingStockSortie>) => res.data,
      invalidatesTags: (_r, _e, id) => [{ type: "BDSortie", id }, { type: "BDSortie", id: "LIST" }, { type: "BDItem", id: "LIST" }],
    }),
    rejectBindingStockSortie: builder.mutation<BindingStockSortie, string>({
      query: (id) => ({ url: `/sorties/${id}/reject`, method: "PATCH" }),
      transformResponse: (res: ApiResponse<BindingStockSortie>) => res.data,
      invalidatesTags: (_r, _e, id) => [{ type: "BDSortie", id }, { type: "BDSortie", id: "LIST" }, { type: "BDSortie", id: "MY" }],
    }),
  }),
});

export const {
  useGetBindingStockItemsQuery,
  useCreateBindingStockItemMutation,
  useUpdateBindingStockItemMutation,
  useDeleteBindingStockItemMutation,
  useGetBindingStockEntriesQuery,
  useCreateBindingStockEntryMutation,
  useGetBindingStockSortiesQuery,
  useGetMyBindingStockSortiesQuery,
  useCreateBindingStockSortieMutation,
  useApproveBindingStockSortieMutation,
  useRejectBindingStockSortieMutation,
} = bindingStockApi;
