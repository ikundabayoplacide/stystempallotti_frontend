import { createApi, fetchBaseQuery } from "@reduxjs/toolkit/query/react";
import type { RootState } from "../index";

export interface MaterialRequestItem {
  id: string;
  name: string;
  quantity: number;
  unit: string;
}

export interface MaterialRequest {
  id: string;
  requestNumber: string;
  jobId: string;
  job?: { id: string; jobNumber: string; title: string };
  employeeId: string;
  employee?: { id: string; fullName: string; phoneNumber?: string; role?: string };
  responder?: { id: string; fullName: string; role?: string };
  notes?: string;
  status: "pending" | "approved" | "rejected";
  responseNotes?: string;
  respondedAt?: string;
  createdAt: string;
  items: MaterialRequestItem[];
}

export interface CreateMaterialRequestPayload {
  jobId: string;
  notes?: string;
  items: { name: string; quantity: number; unit: string }[];
}

interface ApiResponse<T> {
  success: boolean;
  message: string;
  data: T;
}

export const materialRequestsApi = createApi({
  reducerPath: "materialRequestsApi",

  baseQuery: fetchBaseQuery({
    baseUrl: import.meta.env.VITE_API_URL ?? "http://localhost:8000/api",
    prepareHeaders: (headers, { getState }) => {
      const token = (getState() as RootState).auth.token;
      if (token) headers.set("Authorization", `Bearer ${token}`);
      return headers;
    },
  }),

  tagTypes: ["MaterialRequest"],

  endpoints: (builder) => ({

    // GET /material-requests — ADMIN, SUPERVISOR, STOCK
    getAllMaterialRequests: builder.query<MaterialRequest[], { status?: string } | void>({
      query: (params) => ({ url: "/material-requests", params: params ?? {} }),
      transformResponse: (res: ApiResponse<MaterialRequest[]>) => res.data ?? [],
      providesTags: (result) =>
        result
          ? [...result.map(({ id }) => ({ type: "MaterialRequest" as const, id })), { type: "MaterialRequest", id: "LIST" }]
          : [{ type: "MaterialRequest", id: "LIST" }],
    }),

    // GET /material-requests/:id — ADMIN, SUPERVISOR, STOCK
    getMaterialRequestById: builder.query<MaterialRequest, string>({
      query: (id) => `/material-requests/${id}`,
      transformResponse: (res: ApiResponse<MaterialRequest>) => res.data,
      providesTags: (_r, _e, id) => [{ type: "MaterialRequest", id }],
    }),

    // GET /material-requests/my  — worker's own requests
    getMyMaterialRequests: builder.query<MaterialRequest[], void>({
      query: () => "/material-requests/my",
      transformResponse: (res: ApiResponse<MaterialRequest[]>) => res.data ?? [],
      providesTags: [{ type: "MaterialRequest", id: "MY" }],
    }),

    // POST /material-requests
    createMaterialRequest: builder.mutation<MaterialRequest, CreateMaterialRequestPayload>({
      query: (body) => ({ url: "/material-requests", method: "POST", body }),
      transformResponse: (res: ApiResponse<MaterialRequest>) => res.data,
      invalidatesTags: [{ type: "MaterialRequest", id: "MY" }],
    }),

    // PATCH /material-requests/:id/approve
    approveMaterialRequest: builder.mutation<MaterialRequest, { id: string; responseNotes?: string }>({
      query: ({ id, responseNotes }) => ({
        url: `/material-requests/${id}/approve`,
        method: "PATCH",
        body: { responseNotes },
      }),
      transformResponse: (res: ApiResponse<MaterialRequest>) => res.data,
      invalidatesTags: (_r, _e, { id }) => [
        { type: "MaterialRequest", id },
        { type: "MaterialRequest", id: "LIST" },
        { type: "MaterialRequest", id: "MY" },
      ],
    }),

    // PATCH /material-requests/:id/reject
    rejectMaterialRequest: builder.mutation<MaterialRequest, { id: string; responseNotes?: string }>({
      query: ({ id, responseNotes }) => ({
        url: `/material-requests/${id}/reject`,
        method: "PATCH",
        body: { responseNotes },
      }),
      transformResponse: (res: ApiResponse<MaterialRequest>) => res.data,
      invalidatesTags: (_r, _e, { id }) => [
        { type: "MaterialRequest", id },
        { type: "MaterialRequest", id: "LIST" },
        { type: "MaterialRequest", id: "MY" },
      ],
    }),
  }),
});

export const {
  useGetAllMaterialRequestsQuery,
  useGetMaterialRequestByIdQuery,
  useGetMyMaterialRequestsQuery,
  useCreateMaterialRequestMutation,
  useApproveMaterialRequestMutation,
  useRejectMaterialRequestMutation,
} = materialRequestsApi;
