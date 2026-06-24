import { createApi, fetchBaseQuery } from "@reduxjs/toolkit/query/react";
import type { RootState } from "../index";

export type StockStatus = "available" | "low" | "out-of-stock";

export interface BoutiqueStockItem {
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

export interface BoutiqueStockEntry {
  id: string;
  stockItemId: string;
  stockItem?: BoutiqueStockItem;
  quantity: number;
  note?: string;
  createdBy?: { id: string; name: string };
  createdAt: string;
}

export type SortieStatus = "pending" | "approved" | "rejected";

export interface BoutiqueStockSortie {
  id: string;
  stockItemId: string;
  stockItem?: BoutiqueStockItem;
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

const BASE = `${import.meta.env.VITE_API_URL ?? "http://localhost:8000/api"}/boutique-stock`;

export const boutiqueStockApi = createApi({
  reducerPath: "boutiqueStockApi",
  baseQuery: fetchBaseQuery({
    baseUrl: BASE,
    prepareHeaders: (headers, { getState }) => {
      const token = (getState() as RootState).auth.token;
      if (token) headers.set("Authorization", `Bearer ${token}`);
      return headers;
    },
  }),
  tagTypes: ["BSItem", "BSEntry", "BSSortie"],
  endpoints: (builder) => ({
    // Items
    getBoutiqueStockItems: builder.query<Paginated<BoutiqueStockItem>, { search?: string; stockStatus?: string; limit?: number } | void>({
      query: (params) => ({ url: "/items", params: { limit: 200, ...(params ?? {}) } as Record<string, unknown> }),
      transformResponse: (res: ApiResponse<BoutiqueStockItem[]>) => toPaginated(res),
      providesTags: (r) => r ? [...r.data.map(({ id }) => ({ type: "BSItem" as const, id })), { type: "BSItem", id: "LIST" }] : [{ type: "BSItem", id: "LIST" }],
    }),
    createBoutiqueStockItem: builder.mutation<BoutiqueStockItem, { itemName: string; description?: string; category: string; unit: string; currentStock: number; alarmStock: number }>({
      query: (body) => ({ url: "/items", method: "POST", body }),
      transformResponse: (res: ApiResponse<BoutiqueStockItem>) => res.data,
      invalidatesTags: [{ type: "BSItem", id: "LIST" }],
    }),
    updateBoutiqueStockItem: builder.mutation<BoutiqueStockItem, { id: string; itemName?: string; description?: string; category?: string; unit?: string; alarmStock?: number }>({
      query: ({ id, ...body }) => ({ url: `/items/${id}`, method: "PUT", body }),
      transformResponse: (res: ApiResponse<BoutiqueStockItem>) => res.data,
      invalidatesTags: (_r, _e, { id }) => [{ type: "BSItem", id }, { type: "BSItem", id: "LIST" }],
    }),
    deleteBoutiqueStockItem: builder.mutation<void, string>({
      query: (id) => ({ url: `/items/${id}`, method: "DELETE" }),
      invalidatesTags: (_r, _e, id) => [{ type: "BSItem", id }, { type: "BSItem", id: "LIST" }],
    }),
    // Entries
    getBoutiqueStockEntries: builder.query<Paginated<BoutiqueStockEntry>, { stockItemId?: string; limit?: number } | void>({
      query: (params) => ({ url: "/entries", params: { limit: 50, ...(params ?? {}) } as Record<string, unknown> }),
      transformResponse: (res: ApiResponse<BoutiqueStockEntry[]>) => toPaginated(res),
      providesTags: [{ type: "BSEntry", id: "LIST" }],
    }),
    createBoutiqueStockEntry: builder.mutation<BoutiqueStockEntry, { stockItemId: string; quantity: number; note?: string }>({
      query: (body) => ({ url: "/entries", method: "POST", body }),
      transformResponse: (res: ApiResponse<BoutiqueStockEntry>) => res.data,
      invalidatesTags: [{ type: "BSEntry", id: "LIST" }, { type: "BSItem", id: "LIST" }],
    }),
    // Sorties
    getBoutiqueStockSorties: builder.query<Paginated<BoutiqueStockSortie>, { status?: SortieStatus; limit?: number } | void>({
      query: (params) => ({ url: "/sorties", params: { limit: 200, ...(params ?? {}) } as Record<string, unknown> }),
      transformResponse: (res: ApiResponse<BoutiqueStockSortie[]>) => toPaginated(res),
      providesTags: (r) => r ? [...r.data.map(({ id }) => ({ type: "BSSortie" as const, id })), { type: "BSSortie", id: "LIST" }] : [{ type: "BSSortie", id: "LIST" }],
    }),
    getMyBoutiqueStockSorties: builder.query<Paginated<BoutiqueStockSortie>, { limit?: number } | void>({
      query: (params) => ({ url: "/sorties/my", params: { limit: 100, ...(params ?? {}) } as Record<string, unknown> }),
      transformResponse: (res: ApiResponse<BoutiqueStockSortie[]>) => toPaginated(res),
      providesTags: [{ type: "BSSortie", id: "MY" }],
    }),
    createBoutiqueStockSortie: builder.mutation<BoutiqueStockSortie, { stockItemId: string; quantityOut: number; reason: string; notes?: string }>({
      query: (body) => ({ url: "/sorties", method: "POST", body }),
      transformResponse: (res: ApiResponse<BoutiqueStockSortie>) => res.data,
      invalidatesTags: [{ type: "BSSortie", id: "LIST" }, { type: "BSSortie", id: "MY" }],
    }),
    approveBoutiqueStockSortie: builder.mutation<BoutiqueStockSortie, string>({
      query: (id) => ({ url: `/sorties/${id}/approve`, method: "PATCH" }),
      transformResponse: (res: ApiResponse<BoutiqueStockSortie>) => res.data,
      invalidatesTags: (_r, _e, id) => [{ type: "BSSortie", id }, { type: "BSSortie", id: "LIST" }, { type: "BSItem", id: "LIST" }],
    }),
    rejectBoutiqueStockSortie: builder.mutation<BoutiqueStockSortie, { id: string; notes?: string }>({
      query: ({ id, ...body }) => ({ url: `/sorties/${id}/reject`, method: "PATCH", body }),
      transformResponse: (res: ApiResponse<BoutiqueStockSortie>) => res.data,
      invalidatesTags: (_r, _e, { id }) => [{ type: "BSSortie", id }, { type: "BSSortie", id: "LIST" }, { type: "BSSortie", id: "MY" }],
    }),
  }),
});

export const {
  useGetBoutiqueStockItemsQuery,
  useCreateBoutiqueStockItemMutation,
  useUpdateBoutiqueStockItemMutation,
  useDeleteBoutiqueStockItemMutation,
  useGetBoutiqueStockEntriesQuery,
  useCreateBoutiqueStockEntryMutation,
  useGetBoutiqueStockSortiesQuery,
  useGetMyBoutiqueStockSortiesQuery,
  useCreateBoutiqueStockSortieMutation,
  useApproveBoutiqueStockSortieMutation,
  useRejectBoutiqueStockSortieMutation,
} = boutiqueStockApi;
