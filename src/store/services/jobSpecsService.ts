import { createApi, fetchBaseQuery } from "@reduxjs/toolkit/query/react";
import type { RootState } from "../index";

export interface JobSpecDocument {
  id: string;
  fileName: string;
  mimeType: string;
  fileUrl: string;
}

export interface JobSpec {
  id: string;
  jobId: string;
  description: string;
  paperType?: string;
  paperWeight?: string;
  size?: string;
  colors?: string;
  finishType?: string;
  quantity?: number;
  materials?: string;
  notes?: string;
  addedById: string;
  createdAt: string;
  updatedAt: string;
  documents?: JobSpecDocument[];
}

export interface CreateJobSpecPayload {
  jobId: string;
  description: string;
  paperType?: string;
  paperWeight?: string;
  size?: string;
  colors?: string;
  finishType?: string;
  quantity?: number;
  materials?: string;
  notes?: string;
  documents?: File[];
}

interface ApiResponse<T> { success: boolean; message: string; data: T; }

export const jobSpecsApi = createApi({
  reducerPath: "jobSpecsApi",
  baseQuery: fetchBaseQuery({
    baseUrl: import.meta.env.VITE_API_URL ?? "http://localhost:8000/api",
    prepareHeaders: (headers, { getState }) => {
      const token = (getState() as RootState).auth.token;
      if (token) headers.set("Authorization", `Bearer ${token}`);
      return headers;
    },
  }),
  tagTypes: ["JobSpec"],
  endpoints: (builder) => ({

    getJobSpecs: builder.query<JobSpec[], string>({
      query: (jobId) => `/jobs/${jobId}/specs`,
      transformResponse: (res: ApiResponse<JobSpec[]>) => res.data ?? [],
      providesTags: (_r, _e, jobId) => [{ type: "JobSpec", id: jobId }],
    }),

    createJobSpec: builder.mutation<JobSpec, CreateJobSpecPayload>({
      query: ({ jobId, documents, ...rest }) => {
        if (!documents?.length) {
          return { url: `/jobs/${jobId}/specs`, method: "POST", body: rest };
        }
        const form = new FormData();
        Object.entries(rest).forEach(([k, v]) => {
          if (v !== undefined && v !== null) form.append(k, String(v));
        });
        documents.forEach((f) => form.append("documents", f));
        return { url: `/jobs/${jobId}/specs`, method: "POST", body: form };
      },
      transformResponse: (res: ApiResponse<JobSpec>) => res.data,
      invalidatesTags: (_r, _e, { jobId }) => [{ type: "JobSpec", id: jobId }],
    }),

    deleteJobSpecDocument: builder.mutation<void, { jobId: string; specId: string; docId: string }>({
      query: ({ jobId, specId, docId }) => ({
        url: `/jobs/${jobId}/specs/${specId}/documents/${docId}`,
        method: "DELETE",
      }),
      invalidatesTags: (_r, _e, { jobId }) => [{ type: "JobSpec", id: jobId }],
    }),
  }),
});

export const {
  useGetJobSpecsQuery,
  useCreateJobSpecMutation,
  useDeleteJobSpecDocumentMutation,
} = jobSpecsApi;
