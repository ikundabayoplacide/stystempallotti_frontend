import { createApi, fetchBaseQuery } from "@reduxjs/toolkit/query/react";
import type { RootState } from "../index";

export interface CasualWorker {
  id: string;
  fullName: string;
  phoneNumber?: string;
  jobDone: string;
  startDate: string;
  endDate: string;
  daysWorked: number;
  dailyRate: number;
  totalAmount: number;
  notes?: string;
  createdAt?: string;
}

export interface CasualWorkersResponse {
  data: CasualWorker[];
  total: number;
  totalPages: number;
}

export interface CasualWorkerPayload {
  fullName: string;
  phoneNumber?: string;
  jobDone: string;
  startDate: string;
  endDate: string;
  daysWorked?: number; // omit to let backend compute from dates
  dailyRate: number;
  notes?: string;
}

export const casualWorkersApi = createApi({
  reducerPath: "casualWorkersApi",
  baseQuery: fetchBaseQuery({
    baseUrl: import.meta.env.VITE_API_URL ?? "http://localhost:8000/api",
    prepareHeaders: (headers, { getState }) => {
      const token = (getState() as RootState).auth.token;
      if (token) headers.set("Authorization", `Bearer ${token}`);
      return headers;
    },
  }),
  tagTypes: ["CasualWorker"],
  endpoints: (builder) => ({
    getCasualWorkers: builder.query<CasualWorkersResponse, { page?: number; limit?: number; search?: string }>({
      query: (params) => ({ url: "/casual-workers", params }),
      transformResponse: (res: any) => ({
        data: Array.isArray(res?.data) ? res.data : [],
        total: res?.pagination?.total ?? 0,
        totalPages: res?.pagination?.totalPages ?? 1,
      }),
      providesTags: ["CasualWorker"],
    }),

    createCasualWorker: builder.mutation<CasualWorker, CasualWorkerPayload>({
      query: (body) => ({ url: "/casual-workers", method: "POST", body }),
      transformResponse: (res: any) => res?.data ?? res,
      invalidatesTags: ["CasualWorker"],
    }),

    updateCasualWorker: builder.mutation<CasualWorker, { id: string } & Partial<CasualWorkerPayload>>({
      query: ({ id, ...body }) => ({ url: `/casual-workers/${id}`, method: "PUT", body }),
      transformResponse: (res: any) => res?.data ?? res,
      invalidatesTags: ["CasualWorker"],
    }),

    deleteCasualWorker: builder.mutation<void, string>({
      query: (id) => ({ url: `/casual-workers/${id}`, method: "DELETE" }),
      invalidatesTags: ["CasualWorker"],
    }),
  }),
});

export const {
  useGetCasualWorkersQuery,
  useCreateCasualWorkerMutation,
  useUpdateCasualWorkerMutation,
  useDeleteCasualWorkerMutation,
} = casualWorkersApi;
