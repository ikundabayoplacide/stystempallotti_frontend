import { createApi, fetchBaseQuery } from "@reduxjs/toolkit/query/react";
import type { RootState } from "../index";

// ─── Types ────────────────────────────────────────────────────────────────────

export type StockStatus = "available" | "low" | "out-of-stock";
export type StockItemType = "boutique" | "hobe" | "general";

export interface StockItem {
  id: string;
  itemName: string;          // backend field name
  name?: string;             // alias — some responses may use this
  description?: string;
  category: string;
  type: StockItemType;
  unit: string;
  unitCost?: number;
  currentStock: number;
  alarmStock: number;
  minStock: number;          // kept for backwards compat
  stockStatus: StockStatus;
  createdAt: string;
  updatedAt: string;
}

export interface StockEntry {
  id: string;
  stockItemId: string;
  stockItem?: StockItem;
  quantity: number;
  note?: string;
  createdBy?: { id: string; name: string };
  createdAt: string;
}

export type SortieStatus = "pending" | "approved" | "rejected";

export interface StockSortie {
  id: string;
  stockItemId: string;
  stockItem?: StockItem;
  quantity: number;
  jobId?: string;
  job?: { id: string; jobNumber: string; title: string };
  reason?: string;
  status: SortieStatus;
  requestedBy?: { id: string; name: string };
  approvedBy?: { id: string; name: string };
  createdAt: string;
  updatedAt: string;
}

// ─── Request shapes ───────────────────────────────────────────────────────────

export interface GetItemsParams {
  category?: string;
  type?: StockItemType;       // filter by boutique | hobe | general
  stockStatus?: string;
  search?: string;
  page?: number;
  limit?: number;
}

export interface GetEntriesParams {
  stockItemId?: string;
  page?: number;
  limit?: number;
}

export interface GetSortiesParams {
  stockItemId?: string;
  status?: SortieStatus;
  jobId?: string;
  page?: number;
  limit?: number;
}

export interface CreateStockItemPayload {
  itemName: string;          // backend expects "itemName"
  description?: string;
  category: string;
  type: StockItemType;
  unit: string;
  currentStock: number;
  alarmStock: number;        // backend expects "alarmStock"
}

export interface UpdateStockItemPayload {
  id: string;
  itemName?: string;
  description?: string;
  category?: string;
  type?: StockItemType;
  unit?: string;
  alarmStock?: number;       // backend expects "alarmStock"
}

export interface CreateEntryPayload {
  stockItemId: string;
  quantity: number;
  note?: string;
}

export interface CreateSortiePayload {
  stockItemId: string;
  quantityOut: number;
  reason: string;
  notes?: string;
  jobId?: string;
  dossierNo?: string;
}

// ─── Paginated wrapper ────────────────────────────────────────────────────────

export interface Paginated<T> {
  data: T[];
  pagination: {
    total: number;
    page: number;
    limit: number;
    totalPages: number;
  };
}

interface ApiResponse<T> {
  success: boolean;
  message: string;
  data: T;
  pagination?: {
    total: number;
    page: number;
    limit: number;
    totalPages: number;
  };
}

function toPaginated<T>(res: ApiResponse<T[]>): Paginated<T> {
  return {
    data: res.data ?? [],
    pagination: res.pagination ?? {
      total: res.data?.length ?? 0,
      page: 1,
      limit: 100,
      totalPages: 1,
    },
  };
}

// ─── Service ──────────────────────────────────────────────────────────────────

export const stockApi = createApi({
  reducerPath: "stockApi",

  baseQuery: fetchBaseQuery({
    baseUrl: `${import.meta.env.VITE_API_URL ?? "http://localhost:8000/api"}/stock`,
    prepareHeaders: (headers, { getState }) => {
      const token = (getState() as RootState).auth.token;
      if (token) headers.set("Authorization", `Bearer ${token}`);
      return headers;
    },
  }),

  tagTypes: ["StockItem", "StockEntry", "StockSortie"],

  endpoints: (builder) => ({

    // ── Stock Items ───────────────────────────────────────────────────────────

    // GET /stock/items
    getStockItems: builder.query<Paginated<StockItem>, GetItemsParams | void>({
      query: (params) => ({
        url: "/items",
        params: { limit: 100, ...(params ?? {}) } as Record<string, unknown>,
      }),
      transformResponse: (res: ApiResponse<StockItem[]>) => toPaginated(res),
      providesTags: (result) =>
        result?.data
          ? [
              ...result.data.map(({ id }) => ({ type: "StockItem" as const, id })),
              { type: "StockItem", id: "LIST" },
            ]
          : [{ type: "StockItem", id: "LIST" }],
    }),

    // GET /stock/items/:id
    getStockItemById: builder.query<StockItem, string>({
      query: (id) => `/items/${id}`,
      transformResponse: (res: ApiResponse<StockItem>) => res.data,
      providesTags: (_r, _e, id) => [{ type: "StockItem", id }],
    }),

    // POST /stock/items — ADMIN, STOCK
    createStockItem: builder.mutation<StockItem, CreateStockItemPayload>({
      query: (body) => ({ url: "/items", method: "POST", body }),
      transformResponse: (res: ApiResponse<StockItem>) => res.data,
      invalidatesTags: [{ type: "StockItem", id: "LIST" }],
    }),

    // PUT /stock/items/:id — ADMIN, STOCK
    updateStockItem: builder.mutation<StockItem, UpdateStockItemPayload>({
      query: ({ id, ...body }) => ({ url: `/items/${id}`, method: "PUT", body }),
      transformResponse: (res: ApiResponse<StockItem>) => res.data,
      invalidatesTags: (_r, _e, { id }) => [
        { type: "StockItem", id },
        { type: "StockItem", id: "LIST" },
      ],
    }),

    // DELETE /stock/items/:id — ADMIN
    deleteStockItem: builder.mutation<void, string>({
      query: (id) => ({ url: `/items/${id}`, method: "DELETE" }),
      invalidatesTags: (_r, _e, id) => [
        { type: "StockItem", id },
        { type: "StockItem", id: "LIST" },
      ],
    }),

    // ── Stock Entries (IN) ────────────────────────────────────────────────────

    // GET /stock/entries
    getStockEntries: builder.query<Paginated<StockEntry>, GetEntriesParams | void>({
      query: (params) => ({
        url: "/entries",
        params: { limit: 50, ...(params ?? {}) } as Record<string, unknown>,
      }),
      transformResponse: (res: ApiResponse<StockEntry[]>) => toPaginated(res),
      providesTags: [{ type: "StockEntry", id: "LIST" }],
    }),

    // POST /stock/entries — ADMIN, STOCK (restock)
    createStockEntry: builder.mutation<StockEntry, CreateEntryPayload>({
      query: (body) => ({ url: "/entries", method: "POST", body }),
      transformResponse: (res: ApiResponse<StockEntry>) => res.data,
      invalidatesTags: [
        { type: "StockEntry", id: "LIST" },
        { type: "StockItem", id: "LIST" },
      ],
    }),

    // ── Stock Sorties (OUT) ───────────────────────────────────────────────────

    // GET /stock/sorties
    getStockSorties: builder.query<Paginated<StockSortie>, GetSortiesParams | void>({
      query: (params) => ({
        url: "/sorties",
        params: { limit: 50, ...(params ?? {}) } as Record<string, unknown>,
      }),
      transformResponse: (res: ApiResponse<StockSortie[]>) => toPaginated(res),
      providesTags: (result) =>
        result?.data
          ? [
              ...result.data.map(({ id }) => ({ type: "StockSortie" as const, id })),
              { type: "StockSortie", id: "LIST" },
            ]
          : [{ type: "StockSortie", id: "LIST" }],
    }),

    // POST /stock/sorties — ADMIN, STOCK, SUPERVISOR, PRODUCTION_MANAGER
    createStockSortie: builder.mutation<StockSortie, CreateSortiePayload>({
      query: (body) => ({ url: "/sorties", method: "POST", body }),
      transformResponse: (res: ApiResponse<StockSortie>) => res.data,
      invalidatesTags: [{ type: "StockSortie", id: "LIST" }],
    }),

    // PATCH /stock/sorties/:id/approve — ADMIN, STOCK
    approveSortie: builder.mutation<StockSortie, string>({
      query: (id) => ({ url: `/sorties/${id}/approve`, method: "PATCH" }),
      transformResponse: (res: ApiResponse<StockSortie>) => res.data,
      invalidatesTags: (_r, _e, id) => [
        { type: "StockSortie", id },
        { type: "StockSortie", id: "LIST" },
        { type: "StockItem", id: "LIST" }, // stock deducted
      ],
    }),

    // PATCH /stock/sorties/:id/reject — ADMIN, STOCK
    rejectSortie: builder.mutation<StockSortie, string>({
      query: (id) => ({ url: `/sorties/${id}/reject`, method: "PATCH" }),
      transformResponse: (res: ApiResponse<StockSortie>) => res.data,
      invalidatesTags: (_r, _e, id) => [
        { type: "StockSortie", id },
        { type: "StockSortie", id: "LIST" },
      ],
    }),
  }),
});

export const {
  useGetStockItemsQuery,
  useGetStockItemByIdQuery,
  useCreateStockItemMutation,
  useUpdateStockItemMutation,
  useDeleteStockItemMutation,
  useGetStockEntriesQuery,
  useCreateStockEntryMutation,
  useGetStockSortiesQuery,
  useCreateStockSortieMutation,
  useApproveSortieMutation,
  useRejectSortieMutation,
} = stockApi;
