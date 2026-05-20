import { createApi, fetchBaseQuery } from "@reduxjs/toolkit/query/react";
import type { RootState } from "../index";

// ─── Types ────────────────────────────────────────────────────────────────────

export type CustomerType = "BUSINESS" | "VISITOR" | "BOUTIQUE";

export interface Customer {
  id: string;
  name: string;
  email: string;
  phone?: string;
  company?: string;
  address?: string;
  city?: string;
  country?: string;
  notes?: string;
  type: CustomerType;
  isActive: boolean;
  createdAt: string;
  updatedAt: string;
}

export interface CreateCustomerPayload {
  name: string;
  email: string;
  phone?: string;
  company?: string;
  address?: string;
  city?: string;
  country?: string;
  notes?: string;
  type: CustomerType;
}

export interface UpdateCustomerPayload {
  id: string;
  name?: string;
  email?: string;
  phone?: string;
  company?: string;
  address?: string;
  city?: string;
  country?: string;
  notes?: string;
  type?: CustomerType;
  isActive?: boolean;
}

export interface GetCustomersParams {
  page?: number;
  limit?: number;
  search?: string;
  type?: CustomerType;
}

// Paginated list response shape
export interface PaginatedCustomers {
  customers: Customer[];
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

// Normalize whatever shape the backend sends into PaginatedCustomers
function normalizePaginatedCustomers(raw: unknown): PaginatedCustomers {
  // Shape A: { customers: [...], total, page, limit, totalPages }
  if (raw && typeof raw === "object" && "customers" in raw) {
    const r = raw as PaginatedCustomers;
    return {
      customers: Array.isArray(r.customers) ? r.customers : [],
      total: r.total ?? 0,
      page: r.page ?? 1,
      limit: r.limit ?? 10,
      totalPages: r.totalPages ?? 1,
    };
  }
  // Shape B: flat array
  if (Array.isArray(raw)) {
    return {
      customers: raw as Customer[],
      total: (raw as Customer[]).length,
      page: 1,
      limit: (raw as Customer[]).length,
      totalPages: 1,
    };
  }
  // Fallback
  return { customers: [], total: 0, page: 1, limit: 10, totalPages: 1 };
}

// ─── Service ──────────────────────────────────────────────────────────────────

export const customersApi = createApi({
  reducerPath: "customersApi",

  baseQuery: fetchBaseQuery({
    baseUrl: import.meta.env.VITE_API_URL ?? "http://localhost:8000/api",
    prepareHeaders: (headers, { getState }) => {
      const token = (getState() as RootState).auth.token;
      if (token) {
        headers.set("Authorization", `Bearer ${token}`);
      }
      return headers;
    },
  }),

  tagTypes: ["Customer"],

  endpoints: (builder) => ({

    // GET /customers  (paginated, filterable)
    getCustomers: builder.query<PaginatedCustomers, GetCustomersParams | void>({
      query: (params) => ({
        url: "/customers",
        params: params ?? {},
      }),
      transformResponse: (res: ApiResponse<unknown>) =>
        normalizePaginatedCustomers(res.data),
      providesTags: (result) =>
        result?.customers?.length
          ? [
              ...result.customers.map(({ id }) => ({ type: "Customer" as const, id })),
              { type: "Customer", id: "LIST" },
            ]
          : [{ type: "Customer", id: "LIST" }],
    }),

    // GET /customers/:id
    getCustomerById: builder.query<Customer, string>({
      query: (id) => `/customers/${id}`,
      transformResponse: (res: ApiResponse<Customer>) => res.data,
      providesTags: (_result, _err, id) => [{ type: "Customer", id }],
    }),

    // POST /customers  — ADMIN, RECEPTIONIST
    createCustomer: builder.mutation<Customer, CreateCustomerPayload>({
      query: (body) => ({
        url: "/customers",
        method: "POST",
        body,
      }),
      transformResponse: (res: ApiResponse<Customer>) => res.data,
      invalidatesTags: [{ type: "Customer", id: "LIST" }],
    }),

    // PUT /customers/:id  — ADMIN, RECEPTIONIST, SALESMANAGER
    updateCustomer: builder.mutation<Customer, UpdateCustomerPayload>({
      query: ({ id, ...body }) => ({
        url: `/customers/${id}`,
        method: "PUT",
        body,
      }),
      transformResponse: (res: ApiResponse<Customer>) => res.data,
      invalidatesTags: (_result, _err, { id }) => [
        { type: "Customer", id },
        { type: "Customer", id: "LIST" },
      ],
    }),

    // DELETE /customers/:id  — ADMIN only (soft delete via isActive)
    deleteCustomer: builder.mutation<{ success: boolean; message: string }, string>({
      query: (id) => ({
        url: `/customers/${id}`,
        method: "DELETE",
      }),
      invalidatesTags: (_result, _err, id) => [
        { type: "Customer", id },
        { type: "Customer", id: "LIST" },
      ],
    }),
  }),
});

export const {
  useGetCustomersQuery,
  useGetCustomerByIdQuery,
  useCreateCustomerMutation,
  useUpdateCustomerMutation,
  useDeleteCustomerMutation,
} = customersApi;
