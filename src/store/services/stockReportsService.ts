import { createApi, fetchBaseQuery } from "@reduxjs/toolkit/query/react";
import type { RootState } from "../index";

// ─── Types ────────────────────────────────────────────────────────────────────

export type ReportInterval = "daily" | "weekly" | "monthly" | "annual";

export interface DatePeriod {
  startDate: string;
  endDate: string;
}

export interface StockItem {
  id: string;
  itemName: string;
  category: string;
  currentStock: number;
  alarmStock: number;
  unit: string;
}

export interface OutOfStockItem {
  id: string;
  itemName: string;
  category: string;
  unit: string;
  currentStock: number;
  alarmStock: number;
  totalValue?: number;
}

export interface TopRequestedItem {
  itemName: string;
  unit: string;
  totalQuantity: number;
  count: number;
}

export interface TopReceivedItem {
  itemName: string;
  unit: string;
  totalQuantity: number;
  totalValue: number;
  count: number;
}

export interface RecentEntry {
  id: string;
  itemName: string;
  quantity: number;
  unitCost: number;
  totalCost: number;
  receivedBy: string;
  receivedAt: string;
  supplier?: string;
}

export interface RecentSortie {
  id: string;
  itemName: string;
  quantityRequested: number;
  status: string;
  requester: string;
  requesterRole: string;
  approvedBy?: string;
  requestedAt: string;
  approvedAt?: string;
  reason?: string;
}

export interface StockReportSummary {
  totalItems: number;
  lowStockItems: number;
  outOfStockItems: number;
  totalStockValue: number;
  entries: {
    count: number;
    totalQuantity: number;
    totalValue: number;
  };
  sorties: {
    total: number;
    approved: number;
    pending: number;
    rejected: number;
    totalQuantity: number;
  };
}

export interface StockStatus {
  lowStock: StockItem[];
  outOfStock: OutOfStockItem[];
}

export interface TopItems {
  mostRequested: TopRequestedItem[];
  mostReceived: TopReceivedItem[];
}

export interface StockReport {
  stockType: string;
  interval: string;
  period: DatePeriod;
  summary: StockReportSummary;
  stockStatus: StockStatus;
  topItems: TopItems;
  recentEntries: RecentEntry[];
  recentSorties: RecentSortie[];
}

export interface StockReportResponse {
  success: boolean;
  message: string;
  data: StockReport;
}

export interface ComparisonData {
  stockType: string;
  summary: StockReportSummary;
}

export interface ComparisonReport {
  interval: string;
  period: DatePeriod;
  comparison: {
    general: ComparisonData;
    boutique: ComparisonData;
  };
  details: {
    general: StockReport;
    boutique: StockReport;
  };
}

export interface ComparisonReportResponse {
  success: boolean;
  message: string;
  data: ComparisonReport;
}

// ─── API ──────────────────────────────────────────────────────────────────────

export const stockReportsApi = createApi({
  reducerPath: "stockReportsApi",
  baseQuery: fetchBaseQuery({
    baseUrl: import.meta.env.VITE_API_URL ?? "http://localhost:8000/api",
    prepareHeaders: (headers, { getState }) => {
      const token = (getState() as RootState).auth.token;
      if (token) headers.set("Authorization", `Bearer ${token}`);
      return headers;
    },
  }),
  tagTypes: ["StockReport"],
  endpoints: (builder) => ({
    // GET /api/stock-reports/general?interval={interval}&from={from}&to={to}
    getGeneralStockReport: builder.query<
      StockReport,
      { interval: ReportInterval; from?: string; to?: string }
    >({
      query: ({ interval, from, to }) => {
        let url = `/stock-reports/general?interval=${interval}`;
        if (from && to) url += `&from=${from}&to=${to}`;
        return url;
      },
      transformResponse: (res: StockReportResponse) => res.data,
      providesTags: ["StockReport"],
    }),

    // GET /api/stock-reports/boutique?interval={interval}&from={from}&to={to}
    getBoutiqueStockReport: builder.query<
      StockReport,
      { interval: ReportInterval; from?: string; to?: string }
    >({
      query: ({ interval, from, to }) => {
        let url = `/stock-reports/boutique?interval=${interval}`;
        if (from && to) url += `&from=${from}&to=${to}`;
        return url;
      },
      transformResponse: (res: StockReportResponse) => res.data,
      providesTags: ["StockReport"],
    }),

    // GET /api/stock-reports/comparison?interval={interval}&from={from}&to={to}
    getComparisonReport: builder.query<
      ComparisonReport,
      { interval: ReportInterval; from?: string; to?: string }
    >({
      query: ({ interval, from, to }) => {
        let url = `/stock-reports/comparison?interval=${interval}`;
        if (from && to) url += `&from=${from}&to=${to}`;
        return url;
      },
      transformResponse: (res: ComparisonReportResponse) => res.data,
      providesTags: ["StockReport"],
    }),
  }),
});

export const {
  useGetGeneralStockReportQuery,
  useGetBoutiqueStockReportQuery,
  useGetComparisonReportQuery,
} = stockReportsApi;
