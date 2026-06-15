import { createApi, fetchBaseQuery } from "@reduxjs/toolkit/query/react";
import type { RootState } from "../index";

// ─── Types ────────────────────────────────────────────────────────────────────

export interface JobDocument {
  id: string;
  jobId: string;
  uploadedById: string;
  fileName: string;
  mimeType: string;
  fileUrl: string; // base64 data URL or URL
  createdAt: string;
  uploadedBy?: { id: string; name: string };
}

interface ApiResponse<T> {
  success: boolean;
  message: string;
  data: T;
}

// ─── Service ──────────────────────────────────────────────────────────────────

export const jobDocumentsApi = createApi({
  reducerPath: "jobDocumentsApi",

  baseQuery: fetchBaseQuery({
    baseUrl: import.meta.env.VITE_API_URL ?? "http://localhost:8000/api",
    prepareHeaders: (headers, { getState }) => {
      const token = (getState() as RootState).auth.token;
      if (token) headers.set("Authorization", `Bearer ${token}`);
      return headers;
    },
  }),

  tagTypes: ["JobDocument"],

  endpoints: (builder) => ({

    // GET /jobs/:jobId/documents
    getJobDocuments: builder.query<JobDocument[], string>({
      query: (jobId) => `/jobs/${jobId}/documents`,
      transformResponse: (res: ApiResponse<JobDocument[]>) => res.data ?? [],
      providesTags: (_r, _e, jobId) => [{ type: "JobDocument", id: jobId }],
    }),

    // POST /jobs/:jobId/documents  — upload more docs to an existing job
    uploadJobDocuments: builder.mutation<JobDocument[], { jobId: string; files: File[] }>({
      query: ({ jobId, files }) => {
        const form = new FormData();
        files.forEach((f) => form.append("documents", f));
        return { url: `/jobs/${jobId}/documents`, method: "POST", body: form };
      },
      transformResponse: (res: ApiResponse<JobDocument[]>) => res.data ?? [],
      invalidatesTags: (_r, _e, { jobId }) => [{ type: "JobDocument", id: jobId }],
    }),

    // DELETE /jobs/:jobId/documents/:id
    deleteJobDocument: builder.mutation<void, { jobId: string; docId: string }>({
      query: ({ jobId, docId }) => ({
        url: `/jobs/${jobId}/documents/${docId}`,
        method: "DELETE",
      }),
      invalidatesTags: (_r, _e, { jobId }) => [{ type: "JobDocument", id: jobId }],
    }),
  }),
});

export const {
  useGetJobDocumentsQuery,
  useUploadJobDocumentsMutation,
  useDeleteJobDocumentMutation,
} = jobDocumentsApi;
