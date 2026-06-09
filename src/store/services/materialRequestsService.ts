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
      invalidatesTags: [{ type: "MaterialRequest", id: "MY" }],
    }),

    // PATCH /material-requests/:id/reject
    rejectMaterialRequest: builder.mutation<MaterialRequest, { id: string; responseNotes?: string }>({
      query: ({ id, responseNotes }) => ({
        url: `/material-requests/${id}/reject`,
        method: "PATCH",
        body: { responseNotes },
      }),
      transformResponse: (res: ApiResponse<MaterialRequest>) => res.data,
      invalidatesTags: [{ type: "MaterialRequest", id: "MY" }],
    }),
  }),
});

export const {
  useGetMyMaterialRequestsQuery,
  useCreateMaterialRequestMutation,
  useApproveMaterialRequestMutation,
  useRejectMaterialRequestMutation,
} = materialRequestsApi;
