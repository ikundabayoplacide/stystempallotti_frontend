/**
 * Receptionist Material Requests Service
 *
 * Receptionalists can submit material/supply requests to DAF.
 * DAF can view, approve or reject these requests.
 *
 * Backend endpoints needed (see bottom of file):
 *   POST   /api/reception-requests          – receptionist creates a request
 *   GET    /api/reception-requests/my       – receptionist sees their own requests
 *   GET    /api/reception-requests          – DAF/ADMIN sees all requests
 *   GET    /api/reception-requests/:id      – any authenticated user
 *   PUT    /api/reception-requests/:id      – receptionist edits own pending request
 *   DELETE /api/reception-requests/:id      – receptionist deletes own pending request
 *   PATCH  /api/reception-requests/:id/approve – DAF/ADMIN approves
 *   PATCH  /api/reception-requests/:id/reject  – DAF/ADMIN rejects
 */
import { createApi, fetchBaseQuery } from "@reduxjs/toolkit/query/react";
import type { RootState } from "../index";

// ─── Types ────────────────────────────────────────────────────────────────────

export type ReceptionRequestStatus = "pending" | "approved" | "rejected";

export interface ReceptionRequestItem {
  id: string;
  itemName: string;
  description?: string;
  quantity: string;
  unit: string;
  unitPrice: string;
  totalAmount: string;
}

export interface ReceptionRequest {
  id: string;
  requestNumber: string;
  status: ReceptionRequestStatus;
  notes?: string;
  responseNotes?: string | null;
  respondedAt?: string | null;
  requestedBy: { id: string; name: string; email: string; role: string };
  responder?: { id: string; name: string; email: string; role: string } | null;
  items: ReceptionRequestItem[];
  createdAt: string;
  updatedAt: string;
}

export interface ReceptionRequestItemInput {
  itemName: string;
  description?: string;
  quantity: number;
  unit: string;
  unitPrice: number;
}

export interface CreateReceptionRequestPayload {
  notes?: string;
  items: ReceptionRequestItemInput[];
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
    pagination: res.pagination ?? {
      total: res.data?.length ?? 0,
      page: 1,
      limit: 10,
      totalPages: 1,
    },
  };
}

const BASE = `${import.meta.env.VITE_API_URL ?? "http://localhost:8000/api"}/reception-requests`;

// ─── API ──────────────────────────────────────────────────────────────────────

export const receptionRequestsApi = createApi({
  reducerPath: "receptionRequestsApi",
  baseQuery: fetchBaseQuery({
    baseUrl: BASE,
    prepareHeaders: (headers, { getState }) => {
      const token = (getState() as RootState).auth.token;
      if (token) headers.set("Authorization", `Bearer ${token}`);
      return headers;
    },
  }),
  tagTypes: ["ReceptionRequest"],
  endpoints: (builder) => ({
    // POST / — receptionist submits a request
    createReceptionRequest: builder.mutation<ReceptionRequest, CreateReceptionRequestPayload>({
      query: (body) => ({ url: "/", method: "POST", body }),
      transformResponse: (res: ApiResponse<ReceptionRequest>) => res.data,
      invalidatesTags: [{ type: "ReceptionRequest", id: "LIST" }],
    }),

    // GET /my — receptionist sees their own requests
    getMyReceptionRequests: builder.query<
      Paginated<ReceptionRequest>,
      { status?: ReceptionRequestStatus; page?: number; limit?: number } | void
    >({
      query: (params) => ({
        url: "/my",
        params: { limit: 10, ...(params ?? {}) } as Record<string, unknown>,
      }),
      transformResponse: (res: ApiResponse<ReceptionRequest[]>) => toPaginated(res),
      providesTags: [{ type: "ReceptionRequest", id: "LIST" }],
    }),

    // GET / — DAF/ADMIN sees all reception requests
    getAllReceptionRequests: builder.query<
      Paginated<ReceptionRequest>,
      { status?: ReceptionRequestStatus; page?: number; limit?: number } | void
    >({
      query: (params) => ({
        url: "/",
        params: { limit: 10, ...(params ?? {}) } as Record<string, unknown>,
      }),
      transformResponse: (res: ApiResponse<ReceptionRequest[]>) => toPaginated(res),
      providesTags: [{ type: "ReceptionRequest", id: "LIST" }],
    }),

    // GET /:id — any authenticated user
    getReceptionRequest: builder.query<ReceptionRequest, string>({
      query: (id) => ({ url: `/${id}` }),
      transformResponse: (res: ApiResponse<ReceptionRequest>) => res.data,
      providesTags: (_r, _e, id) => [{ type: "ReceptionRequest", id }],
    }),

    // PUT /:id — receptionist edits their own pending request
    updateReceptionRequest: builder.mutation<
      ReceptionRequest,
      { id: string } & CreateReceptionRequestPayload
    >({
      query: ({ id, ...body }) => ({ url: `/${id}`, method: "PUT", body }),
      transformResponse: (res: ApiResponse<ReceptionRequest>) => res.data,
      invalidatesTags: (_r, _e, { id }) => [
        { type: "ReceptionRequest", id },
        { type: "ReceptionRequest", id: "LIST" },
      ],
    }),

    // DELETE /:id — receptionist deletes their own pending request
    deleteReceptionRequest: builder.mutation<void, string>({
      query: (id) => ({ url: `/${id}`, method: "DELETE" }),
      invalidatesTags: [{ type: "ReceptionRequest", id: "LIST" }],
    }),

    // PATCH /:id/approve — DAF/ADMIN approves
    approveReceptionRequest: builder.mutation<
      ReceptionRequest,
      { id: string; responseNotes?: string }
    >({
      query: ({ id, ...body }) => ({ url: `/${id}/approve`, method: "PATCH", body }),
      transformResponse: (res: ApiResponse<ReceptionRequest>) => res.data,
      invalidatesTags: (_r, _e, { id }) => [
        { type: "ReceptionRequest", id },
        { type: "ReceptionRequest", id: "LIST" },
      ],
    }),

    // PATCH /:id/reject — DAF/ADMIN rejects
    rejectReceptionRequest: builder.mutation<
      ReceptionRequest,
      { id: string; responseNotes?: string }
    >({
      query: ({ id, ...body }) => ({ url: `/${id}/reject`, method: "PATCH", body }),
      transformResponse: (res: ApiResponse<ReceptionRequest>) => res.data,
      invalidatesTags: (_r, _e, { id }) => [
        { type: "ReceptionRequest", id },
        { type: "ReceptionRequest", id: "LIST" },
      ],
    }),
  }),
});

export const {
  useCreateReceptionRequestMutation,
  useGetMyReceptionRequestsQuery,
  useGetAllReceptionRequestsQuery,
  useGetReceptionRequestQuery,
  useUpdateReceptionRequestMutation,
  useDeleteReceptionRequestMutation,
  useApproveReceptionRequestMutation,
  useRejectReceptionRequestMutation,
} = receptionRequestsApi;
