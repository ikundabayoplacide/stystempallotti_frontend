import { createApi, fetchBaseQuery } from "@reduxjs/toolkit/query/react";
import type { RootState } from "../index";

// ─── Types ────────────────────────────────────────────────────────────────────

export type LeaveType =
  | "ANNUAL"
  | "SICK"
  | "MATERNITY"
  | "PATERNITY"
  | "UNPAID"
  | "EMERGENCY"
  | "OTHER";

export type LeaveStatus = "PENDING" | "APPROVED" | "REJECTED";

export interface LeaveRequest {
  id: string;
  userId: string;
  type: LeaveType;
  startDate: string;
  endDate: string;
  reason: string;
  status: LeaveStatus;
  rejectionReason?: string | null;
  documentUrl?: string | null;
  reviewedById?: string | null;
  reviewedAt?: string | null;
  createdAt: string;
  updatedAt: string;
  user?: {
    id: string;
    name: string;
    role: string;
  };
  reviewedBy?: {
    id: string;
    name: string;
  } | null;
}

export interface LeaveListResponse {
  success: boolean;
  message: string;
  data: LeaveRequest[];
  total: number;
  page: number;
  limit: number;
}

export interface CreateLeavePayload {
  type: LeaveType;
  startDate: string;
  endDate: string;
  reason: string;
  documentUrl?: string;
}

export interface UpdateLeavePayload {
  id: string;
  type?: LeaveType;
  startDate?: string;
  endDate?: string;
  reason?: string;
  documentUrl?: string;
}

export interface ReviewLeavePayload {
  id: string;
  action: "approve" | "reject";
  rejectionReason?: string;
}

export interface GetLeavesParams {
  page?: number;
  limit?: number;
  status?: LeaveStatus;
  userId?: string;
}

export interface UploadDocumentResponse {
  success: boolean;
  message: string;
  data: { url: string };
}

// ─── API ──────────────────────────────────────────────────────────────────────

export const leaveApi = createApi({
  reducerPath: "leaveApi",

  baseQuery: fetchBaseQuery({
    baseUrl: import.meta.env.VITE_API_URL ?? "http://localhost:8000/api",
    prepareHeaders: (headers, { getState }) => {
      const token = (getState() as RootState).auth.token;
      if (token) headers.set("Authorization", `Bearer ${token}`);
      return headers;
    },
  }),

  tagTypes: ["Leave"],

  endpoints: (builder) => ({

    // GET /leaves/my — current user's own leave requests
    getMyLeaves: builder.query<LeaveListResponse, GetLeavesParams>({
      query: (params) => ({ url: "/leaves/my", params }),
      transformResponse: (res: any) => ({
        success: res?.success ?? true,
        message: res?.message ?? "",
        data: Array.isArray(res?.data) ? res.data : [],
        total: res?.total ?? 0,
        page: res?.page ?? 1,
        limit: res?.limit ?? 20,
      }),
      providesTags: [{ type: "Leave", id: "MY" }],
    }),

    // GET /leaves — all leave requests (HR / Admin)
    getAllLeaves: builder.query<LeaveListResponse, GetLeavesParams>({
      query: (params) => ({ url: "/leaves", params }),
      transformResponse: (res: any) => ({
        success: res?.success ?? true,
        message: res?.message ?? "",
        data: Array.isArray(res?.data) ? res.data : [],
        total: res?.total ?? 0,
        page: res?.page ?? 1,
        limit: res?.limit ?? 20,
      }),
      providesTags: [{ type: "Leave", id: "LIST" }],
    }),

    // GET /leaves/:id
    getLeaveById: builder.query<LeaveRequest, string>({
      query: (id) => `/leaves/${id}`,
      transformResponse: (res: any) => res?.data ?? res,
      providesTags: (_r, _e, id) => [{ type: "Leave", id }],
    }),

    // POST /leaves — create a new leave request
    createLeave: builder.mutation<LeaveRequest, CreateLeavePayload>({
      query: (body) => ({ url: "/leaves", method: "POST", body }),
      transformResponse: (res: any) => res?.data ?? res,
      invalidatesTags: [{ type: "Leave", id: "MY" }, { type: "Leave", id: "LIST" }],
    }),

    // PATCH /leaves/:id/review — HR / Admin approve or reject
    reviewLeave: builder.mutation<LeaveRequest, ReviewLeavePayload>({
      query: ({ id, ...body }) => ({ url: `/leaves/${id}/review`, method: "PATCH", body }),
      transformResponse: (res: any) => res?.data ?? res,
      invalidatesTags: (_r, _e, { id }) => [
        { type: "Leave", id },
        { type: "Leave", id: "LIST" },
        { type: "Leave", id: "MY" },
      ],
    }),

    // PUT /leaves/:id — edit a pending leave (owner only)
    updateLeave: builder.mutation<LeaveRequest, UpdateLeavePayload>({
      query: ({ id, ...body }) => ({ url: `/leaves/${id}`, method: "PUT", body }),
      transformResponse: (res: any) => res?.data ?? res,
      invalidatesTags: (_r, _e, { id }) => [
        { type: "Leave", id },
        { type: "Leave", id: "MY" },
        { type: "Leave", id: "LIST" },
      ],
    }),

    // DELETE /leaves/:id — cancel a pending leave (own)
    cancelLeave: builder.mutation<void, string>({
      query: (id) => ({ url: `/leaves/${id}`, method: "DELETE" }),
      invalidatesTags: [{ type: "Leave", id: "MY" }, { type: "Leave", id: "LIST" }],
    }),

    // POST /leaves/upload-document — upload supporting document
    uploadLeaveDocument: builder.mutation<UploadDocumentResponse, FormData>({
      query: (formData) => ({
        url: "/leaves/upload-document",
        method: "POST",
        body: formData,
      }),
    }),
  }),
});

export const {
  useGetMyLeavesQuery,
  useGetAllLeavesQuery,
  useGetLeaveByIdQuery,
  useCreateLeaveMutation,
  useUpdateLeaveMutation,
  useReviewLeaveMutation,
  useCancelLeaveMutation,
  useUploadLeaveDocumentMutation,
} = leaveApi;
