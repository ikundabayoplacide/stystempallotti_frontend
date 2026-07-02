import { createApi, fetchBaseQuery } from "@reduxjs/toolkit/query/react";
import type { RootState } from "../index";

export type SampleStatus = "pending" | "reviewed" | "approved" | "rejected";

export interface SampleDocument {
  id: string;
  fileName: string;
  fileUrl: string;
  fileType?: string;
  fileSize?: number;
  createdAt: string;
}

export interface DepartmentSample {
  id: string;
  name: string;
  description?: string;
  quantity?: number;
  unit?: string;
  sampleDate: string;
  referenceNo?: string;
  status: SampleStatus;
  reviewNote?: string;
  reviewedAt?: string;
  notes?: string;
  departmentId: string;
  createdById: string;
  reviewedById?: string;
  createdAt: string;
  updatedAt: string;
  department?: { id: string; name: string };
  createdBy?: { id: string; fullName: string };
  reviewedBy?: { id: string; fullName: string };
  documents?: SampleDocument[];
}

const BASE = import.meta.env.VITE_API_URL ?? "http://localhost:8000/api";

export const departmentSamplesApi = createApi({
  reducerPath: "departmentSamplesApi",
  baseQuery: fetchBaseQuery({
    baseUrl: BASE,
    prepareHeaders: (headers, { getState }) => {
      const token = (getState() as RootState).auth.token;
      if (token) headers.set("Authorization", `Bearer ${token}`);
      return headers;
    },
  }),
  tagTypes: ["DepartmentSample"],
  endpoints: (builder) => ({

    getSamples: builder.query<DepartmentSample[], { departmentId?: string } | void>({
      query: (params) => ({ url: "/department-samples", params: params ?? {} }),
      transformResponse: (res: any) => {
        const d = res?.data ?? res;
        return Array.isArray(d) ? d : [];
      },
      providesTags: (result) =>
        result
          ? [...result.map(({ id }) => ({ type: "DepartmentSample" as const, id })), { type: "DepartmentSample", id: "LIST" }]
          : [{ type: "DepartmentSample", id: "LIST" }],
    }),

    getSampleById: builder.query<DepartmentSample, string>({
      query: (id) => `/department-samples/${id}`,
      transformResponse: (res: any) => res?.data ?? res,
      providesTags: (_r, _e, id) => [{ type: "DepartmentSample", id }],
    }),

    createSample: builder.mutation<DepartmentSample, FormData>({
      query: (body) => ({ url: "/department-samples", method: "POST", body }),
      transformResponse: (res: any) => res?.data ?? res,
      invalidatesTags: [{ type: "DepartmentSample", id: "LIST" }],
    }),

    updateSample: builder.mutation<DepartmentSample, { id: string; body: FormData }>({
      query: ({ id, body }) => ({ url: `/department-samples/${id}`, method: "PUT", body }),
      transformResponse: (res: any) => res?.data ?? res,
      invalidatesTags: (_r, _e, { id }) => [{ type: "DepartmentSample", id }, { type: "DepartmentSample", id: "LIST" }],
    }),

    reviewSample: builder.mutation<DepartmentSample, { id: string; status: "reviewed" | "approved" | "rejected"; reviewNote?: string }>({
      query: ({ id, ...body }) => ({ url: `/department-samples/${id}/review`, method: "PATCH", body }),
      transformResponse: (res: any) => res?.data ?? res,
      invalidatesTags: (_r, _e, { id }) => [{ type: "DepartmentSample", id }, { type: "DepartmentSample", id: "LIST" }],
    }),

    deleteSample: builder.mutation<void, string>({
      query: (id) => ({ url: `/department-samples/${id}`, method: "DELETE" }),
      invalidatesTags: [{ type: "DepartmentSample", id: "LIST" }],
    }),

    deleteSampleDocument: builder.mutation<void, { sampleId: string; docId: string }>({
      query: ({ sampleId, docId }) => ({ url: `/department-samples/${sampleId}/documents/${docId}`, method: "DELETE" }),
      invalidatesTags: (_r, _e, { sampleId }) => [{ type: "DepartmentSample", id: sampleId }],
    }),
  }),
});

export const {
  useGetSamplesQuery,
  useGetSampleByIdQuery,
  useCreateSampleMutation,
  useUpdateSampleMutation,
  useReviewSampleMutation,
  useDeleteSampleMutation,
  useDeleteSampleDocumentMutation,
} = departmentSamplesApi;
