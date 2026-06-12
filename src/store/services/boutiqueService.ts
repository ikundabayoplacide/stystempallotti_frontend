import { createApi, fetchBaseQuery } from "@reduxjs/toolkit/query/react";
import type { RootState } from "../index";

// ─── Types ────────────────────────────────────────────────────────────────────

export type StockStatus = "in-stock" | "low-stock" | "out-of-stock";

export interface BoutiqueCategory {
  id: string;
  name: string;
  prefix: string;       // e.g. "PRN", "BND" — used for SKU generation
  isActive: boolean;
  createdAt: string;
  updatedAt: string;
}

export type SaleStatus = "pending" | "sold";

export interface BoutiqueProduct {
  id: string;
  sku: string;
  name: string;
  description: string;
  categoryId: string;
  category: BoutiqueCategory;
  unit: string;
  price: number;
  stock: number;
  minStock: number;
  status: StockStatus;   // computed by backend
  saleStatus: SaleStatus; // derived: pending = has stock, sold = stock === 0
  isActive: boolean;
  createdAt: string;
  updatedAt: string;
}

export interface StockMovement {
  id: string;
  productId: string;
  change: number;        // positive = restock, negative = sale/use
  reason: string;
  changedBy: {
    id: string;
    name: string;
  };
  createdAt: string;
}

// ─── Request / Response shapes ────────────────────────────────────────────────

export interface GetProductsParams {
  categoryId?: string;
  status?: StockStatus;
  search?: string;
  page?: number;
  limit?: number;
}

export interface PaginatedProducts {
  products: BoutiqueProduct[];
  pagination: {
    total: number;
    page: number;
    limit: number;
    totalPages: number;
  };
}

export interface CreateCategoryPayload {
  name: string;
  prefix: string;
}

export interface UpdateCategoryPayload {
  id: string;
  name?: string;
  prefix?: string;
}

export interface CreateProductPayload {
  name: string;
  description: string;
  categoryId: string;
  unit: string;
  price: number;
  stock: number;
  minStock: number;
}

export interface UpdateProductPayload {
  id: string;
  name?: string;
  description?: string;
  categoryId?: string;
  unit?: string;
  price?: number;
  minStock?: number;
}

export interface UpdateStockPayload {
  id: string;
  change: number;   // positive = restock, negative = sale/use
  reason: string;
}

// ─── Sales ────────────────────────────────────────────────────────────────────

export type PaymentMethod = "cash" | "mobile" | "card" | "bank";

export type SalePaymentStatus = "paid" | "partial" | "overpaid";

export interface BoutiqueSale {
  id: string;
  quantity: number;
  unitPrice: string;
  totalPrice: number;
  amountPaid: string;
  balanceDue: number;
  changeGiven: number;
  paymentStatus: SalePaymentStatus;
  paymentMethod: PaymentMethod;
  note?: string;
  createdAt: string;
  product: { sku: string; name: string; unit: string };
  soldBy: { name: string; email: string; role: string };
  customer: { name: string; phone: string } | null;
}

export interface SalesSummary {
  totals: {
    totalTransactions: number;
    totalQuantitySold: number;
    totalAmountPaid: string;
    totalExpectedRevenue: string;
  };
  byProduct: {
    product: { sku: string; name: string; unit: string };
    totalQuantity: number;
    totalAmountPaid: string;
    totalExpectedRevenue: string;
    transactions: number;
  }[];
  byPaymentMethod: {
    paymentMethod: string;
    transactions: number;
    totalAmountPaid: string;
  }[];
}

export interface RecordSalePayload {
  id: string;
  quantity?: number;
  amountPaid: number;
  paymentMethod?: PaymentMethod;
  customerId?: string;
  note?: string;
}

export interface GetSalesParams {
  page?: number;
  limit?: number;
  productId?: string;
  soldById?: string;
  customerId?: string;
  from?: string;
  to?: string;
  paymentStatus?: SalePaymentStatus;
}

export interface PaginatedSales {
  sales: BoutiqueSale[];
  pagination: { total: number; page: number; limit: number; totalPages: number };
}

// ─── Boutique Requests (reception → stock) ────────────────────────────────────

export type BoutiqueRequestStatus = "pending" | "approved" | "rejected" | "fulfilled";

export interface BoutiqueRequestItem {
  productId: string;
  product?: BoutiqueProduct;
  quantity: number;
  unit: string;
}

export interface BoutiqueRequest {
  id: string;
  requestNumber: string;
  requestedBy: { id: string; name: string };
  notes?: string;
  status: BoutiqueRequestStatus;
  responseNotes?: string;
  respondedAt?: string;
  createdAt: string;
  updatedAt: string;
  items: BoutiqueRequestItem[];
}

export interface CreateBoutiqueRequestPayload {
  notes?: string;
  items: { productId: string; quantity: number }[];
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

// ─── Service ──────────────────────────────────────────────────────────────────

export const boutiqueApi = createApi({
  reducerPath: "boutiqueApi",

  baseQuery: fetchBaseQuery({
    baseUrl: `${import.meta.env.VITE_API_URL ?? "http://localhost:8000/api"}/boutique`,
    prepareHeaders: (headers, { getState }) => {
      const token = (getState() as RootState).auth.token;
      if (token) headers.set("Authorization", `Bearer ${token}`);
      return headers;
    },
  }),

  tagTypes: ["BoutiqueCategory", "BoutiqueProduct", "StockMovement", "BoutiqueRequest"],

  endpoints: (builder) => ({

    // ── Categories ────────────────────────────────────────────────────────────

    // GET /boutique/categories
    getCategories: builder.query<BoutiqueCategory[], void>({
      query: () => "/categories",
      transformResponse: (res: ApiResponse<BoutiqueCategory[]>) => res.data,
      providesTags: (result) =>
        result
          ? [
              ...result.map(({ id }) => ({ type: "BoutiqueCategory" as const, id })),
              { type: "BoutiqueCategory", id: "LIST" },
            ]
          : [{ type: "BoutiqueCategory", id: "LIST" }],
    }),

    // POST /boutique/categories — ADMIN only
    createCategory: builder.mutation<BoutiqueCategory, CreateCategoryPayload>({
      query: (body) => ({ url: "/categories", method: "POST", body }),
      transformResponse: (res: ApiResponse<BoutiqueCategory>) => res.data,
      invalidatesTags: [{ type: "BoutiqueCategory", id: "LIST" }],
    }),

    // PUT /boutique/categories/:id — ADMIN only
    updateCategory: builder.mutation<BoutiqueCategory, UpdateCategoryPayload>({
      query: ({ id, ...body }) => ({ url: `/categories/${id}`, method: "PUT", body }),
      transformResponse: (res: ApiResponse<BoutiqueCategory>) => res.data,
      invalidatesTags: (_r, _e, { id }) => [
        { type: "BoutiqueCategory", id },
        { type: "BoutiqueCategory", id: "LIST" },
      ],
    }),

    // DELETE /boutique/categories/:id — ADMIN only (soft delete)
    deleteCategory: builder.mutation<void, string>({
      query: (id) => ({ url: `/categories/${id}`, method: "DELETE" }),
      invalidatesTags: (_r, _e, id) => [
        { type: "BoutiqueCategory", id },
        { type: "BoutiqueCategory", id: "LIST" },
      ],
    }),

    // ── Products ──────────────────────────────────────────────────────────────

    // GET /boutique/products?categoryId=&status=&search=&page=&limit=
    getProducts: builder.query<PaginatedProducts, GetProductsParams | void>({
      query: (params) => ({
        url: "/products",
        // default limit=100 so we get all products in one shot for the boutique view
        params: { limit: 100, ...(params ?? {}) } as Record<string, unknown>,
      }),
      transformResponse: (res: ApiResponse<BoutiqueProduct[]>) => ({
        products: res.data ?? [],
        pagination: res.pagination ?? {
          total: res.data?.length ?? 0,
          page: 1,
          limit: 100,
          totalPages: 1,
        },
      }),
      providesTags: (result) =>
        result?.products
          ? [
              ...result.products.map(({ id }) => ({ type: "BoutiqueProduct" as const, id })),
              { type: "BoutiqueProduct", id: "LIST" },
            ]
          : [{ type: "BoutiqueProduct", id: "LIST" }],
    }),

    // GET /boutique/products/:id
    getProductById: builder.query<BoutiqueProduct, string>({
      query: (id) => `/products/${id}`,
      transformResponse: (res: ApiResponse<BoutiqueProduct>) => res.data,
      providesTags: (_r, _e, id) => [{ type: "BoutiqueProduct", id }],
    }),

    // POST /boutique/products — ADMIN, STOCK
    createProduct: builder.mutation<BoutiqueProduct, CreateProductPayload>({
      query: (body) => ({ url: "/products", method: "POST", body }),
      transformResponse: (res: ApiResponse<BoutiqueProduct>) => res.data,
      invalidatesTags: [{ type: "BoutiqueProduct", id: "LIST" }],
    }),

    // PUT /boutique/products/:id — ADMIN, STOCK
    updateProduct: builder.mutation<BoutiqueProduct, UpdateProductPayload>({
      query: ({ id, ...body }) => ({ url: `/products/${id}`, method: "PUT", body }),
      transformResponse: (res: ApiResponse<BoutiqueProduct>) => res.data,
      invalidatesTags: (_r, _e, { id }) => [
        { type: "BoutiqueProduct", id },
        { type: "BoutiqueProduct", id: "LIST" },
      ],
    }),

    // DELETE /boutique/products/:id — ADMIN only (soft delete)
    deleteProduct: builder.mutation<void, string>({
      query: (id) => ({ url: `/products/${id}`, method: "DELETE" }),
      invalidatesTags: (_r, _e, id) => [
        { type: "BoutiqueProduct", id },
        { type: "BoutiqueProduct", id: "LIST" },
      ],
    }),

    // ── Stock ─────────────────────────────────────────────────────────────────

    // PATCH /boutique/products/:id/stock — ADMIN, STOCK
    updateStock: builder.mutation<BoutiqueProduct, UpdateStockPayload>({
      query: ({ id, ...body }) => ({
        url: `/products/${id}/stock`,
        method: "PATCH",
        body,
      }),
      transformResponse: (res: ApiResponse<BoutiqueProduct>) => res.data,
      invalidatesTags: (_r, _e, { id }) => [
        { type: "BoutiqueProduct", id },
        { type: "BoutiqueProduct", id: "LIST" },
        { type: "StockMovement", id },
      ],
    }),

    // GET /boutique/products/:id/stock-movements
    getStockMovements: builder.query<StockMovement[], string>({
      query: (id) => `/products/${id}/stock-movements`,
      transformResponse: (res: ApiResponse<StockMovement[]>) => res.data,
      providesTags: (_r, _e, id) => [{ type: "StockMovement", id }],
    }),

    // PATCH /boutique/products/:id/sale-status — record a sale
    recordSale: builder.mutation<BoutiqueSale, RecordSalePayload>({
      query: ({ id, ...body }) => ({
        url: `/products/${id}/sale-status`,
        method: "PATCH",
        body,
      }),
      transformResponse: (res: ApiResponse<BoutiqueSale>) => res.data,
      invalidatesTags: (_r, _e, { id }) => [
        { type: "BoutiqueProduct", id },
        { type: "BoutiqueProduct", id: "LIST" },
        { type: "StockMovement", id },
      ],
    }),

    // GET /boutique/sales
    getSales: builder.query<PaginatedSales, GetSalesParams | void>({
      query: (params) => ({ url: "/sales", params: (params ?? {}) as Record<string, unknown> }),
      transformResponse: (res: unknown) => {
        const r = res as any;
        const sales = r?.data ?? r?.sales ?? [];
        const pagination = r?.pagination ?? {
          total: Array.isArray(sales) ? sales.length : 0,
          page: 1, limit: 20, totalPages: 1,
        };
        return { sales, pagination };
      },
      transformErrorResponse: (err) => {
        console.error("[getSales] error:", JSON.stringify(err, null, 2));
        return err;
      },
    }),

    // PUT /boutique/sales/:id — update a sale (e.g. pay remaining balance)
    updateSale: builder.mutation<BoutiqueSale, { id: string; amountPaid: number }>({
      query: ({ id, amountPaid }) => ({ url: `/sales/${id}`, method: "PUT", body: { amountPaid } }),
      transformResponse: (res: ApiResponse<BoutiqueSale>) => res.data,
    }),

    // GET /boutique/sales/summary
    getSalesSummary: builder.query<SalesSummary, { from?: string; to?: string; productId?: string } | void>({
      query: (params) => ({ url: "/sales/summary", params: (params ?? {}) as Record<string, unknown> }),
      transformResponse: (res: ApiResponse<SalesSummary>) => res.data,
    }),

    // PATCH /boutique/products/:id/sale-status
    sellProduct: builder.mutation<BoutiqueProduct, { id: string; quantity: number }>({ 
      query: ({ id, quantity }) => ({
        url: `/products/${id}/sale-status`,
        method: "PATCH",
        body: { quantity },
      }),
      transformResponse: (res: ApiResponse<BoutiqueProduct>) => res.data,
      invalidatesTags: (_r, _e, { id }) => [
        { type: "BoutiqueProduct", id },
        { type: "BoutiqueProduct", id: "LIST" },
      ],
    }),

    // ── Boutique Requests ─────────────────────────────────────────────────────

    // POST /boutique-stock-requests — receptionist sends a request for products
    createBoutiqueRequest: builder.mutation<BoutiqueRequest, CreateBoutiqueRequestPayload>({
      query: (body) => ({
        url: `${import.meta.env.VITE_API_URL ?? "http://localhost:8000/api"}/boutique-stock-requests`,
        method: "POST",
        body,
      }),
      transformResponse: (res: ApiResponse<BoutiqueRequest>) => res.data,
      invalidatesTags: [{ type: "BoutiqueRequest", id: "LIST" }],
    }),

    // GET /boutique-stock-requests/my — receptionist's own requests
    getMyBoutiqueRequests: builder.query<BoutiqueRequest[], void>({
      query: () => ({
        url: `${import.meta.env.VITE_API_URL ?? "http://localhost:8000/api"}/boutique-stock-requests/my`,
      }),
      transformResponse: (res: ApiResponse<BoutiqueRequest[]>) => res.data ?? [],
      providesTags: [{ type: "BoutiqueRequest", id: "LIST" }],
    }),
  }),
});

export const {
  useGetCategoriesQuery,
  useCreateCategoryMutation,
  useUpdateCategoryMutation,
  useDeleteCategoryMutation,
  useGetProductsQuery,
  useGetProductByIdQuery,
  useCreateProductMutation,
  useUpdateProductMutation,
  useDeleteProductMutation,
  useUpdateStockMutation,
  useGetStockMovementsQuery,
  useRecordSaleMutation,
  useUpdateSaleMutation,
  useGetSalesQuery,
  useGetSalesSummaryQuery,
  useCreateBoutiqueRequestMutation,
  useGetMyBoutiqueRequestsQuery,
} = boutiqueApi;
