import { createApi, fetchBaseQuery } from "@reduxjs/toolkit/query/react";
import type { RootState } from "../index";

// ─── Types ────────────────────────────────────────────────────────────────────

export type MarketStage  = "prospect" | "contacted" | "negotiating" | "won" | "lost";
export type MarketSector = "printing" | "publishing" | "education" | "government" | "ngo" | "corporate" | "retail" | "other";

// Field names match the backend DB columns exactly
export interface ProcurementLead {
  id: string;
  company: string;
  contactPerson: string;
  phone?: string;
  email?: string;
  sector: MarketSector;
  stage: MarketStage;
  estimatedValue?: number;
  location?: string;
  notes?: string;
  nextFollowUp?: string;
  createdAt: string;
  updatedAt: string;
}

export interface ProcurementStats {
  kpi: {
    totalLeads: number;
    inProgress: number;
    wonCount: number;
    overdueFollowUps: number;
    wonValue: number;
  };
  pipeline: Array<{
    stage: MarketStage;
    count: number;
    totalValue: number;
  }>;
}

export interface GetProcurementParams {
  search?: string;
  sector?: MarketSector;
  stage?: MarketStage;
  page?: number;
  limit?: number;
}

export interface PaginatedLeads {
  leads: ProcurementLead[];
  total: number;
  page: number;
  limit: number;
  totalPages: number;
}

export interface CreateLeadPayload {
  company: string;
  contactPerson: string;
  phone?: string;
  email?: string;
  sector: MarketSector;
  stage: MarketStage;
  estimatedValue?: number;
  location?: string;
  notes?: string;
  nextFollowUp?: string;
}

export type UpdateLeadPayload = Partial<CreateLeadPayload> & { id: string };

interface ApiResponse<T> {
  success: boolean;
  message: string;
  data: T;
}

function normalizeLeads(raw: unknown): PaginatedLeads {
  if (raw && typeof raw === "object" && "leads" in raw) {
    const r = raw as PaginatedLeads;
    return {
      leads: Array.isArray(r.leads) ? r.leads : [],
      total: r.total ?? 0,
      page:  r.page  ?? 1,
      limit: r.limit ?? 20,
      totalPages: r.totalPages ?? 1,
    };
  }
  if (Array.isArray(raw)) {
    return { leads: raw as ProcurementLead[], total: raw.length, page: 1, limit: raw.length || 20, totalPages: 1 };
  }
  return { leads: [], total: 0, page: 1, limit: 20, totalPages: 1 };
}

// ─── Service ──────────────────────────────────────────────────────────────────

export const procurementApi = createApi({
  reducerPath: "procurementApi",

  baseQuery: fetchBaseQuery({
    baseUrl: import.meta.env.VITE_API_URL ?? "http://localhost:8000/api",
    prepareHeaders: (headers, { getState }) => {
      const token = (getState() as RootState).auth.token;
      if (token) headers.set("Authorization", `Bearer ${token}`);
      return headers;
    },
  }),

  tagTypes: ["Lead"],

  endpoints: (builder) => ({

    // GET /procurement/stats
    getProcurementStats: builder.query<ProcurementStats, void>({
      query: () => "/procurement/stats",
      transformResponse: (res: ApiResponse<ProcurementStats>) => res.data,
      providesTags: [{ type: "Lead", id: "STATS" }],
    }),

    // GET /procurement
    getLeads: builder.query<PaginatedLeads, GetProcurementParams | void>({
      query: (params) => ({ url: "/procurement", params: (params ?? {}) as Record<string, unknown> }),
      transformResponse: (res: ApiResponse<unknown>) => normalizeLeads(res.data),
      providesTags: (result) =>
        result?.leads?.length
          ? [
              ...result.leads.map(({ id }) => ({ type: "Lead" as const, id })),
              { type: "Lead", id: "LIST" },
            ]
          : [{ type: "Lead", id: "LIST" }],
    }),

    // GET /procurement/:id
    getLeadById: builder.query<ProcurementLead, string>({
      query: (id) => `/procurement/${id}`,
      transformResponse: (res: ApiResponse<ProcurementLead>) => res.data,
      providesTags: (_r, _e, id) => [{ type: "Lead", id }],
    }),

    // POST /procurement
    createLead: builder.mutation<ProcurementLead, CreateLeadPayload>({
      query: (body) => ({ url: "/procurement", method: "POST", body }),
      transformResponse: (res: ApiResponse<ProcurementLead>) => res.data,
      invalidatesTags: [{ type: "Lead", id: "LIST" }, { type: "Lead", id: "STATS" }],
    }),

    // PUT /procurement/:id
    updateLead: builder.mutation<ProcurementLead, UpdateLeadPayload>({
      query: ({ id, ...body }) => ({ url: `/procurement/${id}`, method: "PUT", body }),
      transformResponse: (res: ApiResponse<ProcurementLead>) => res.data,
      invalidatesTags: (_r, _e, { id }) => [
        { type: "Lead", id },
        { type: "Lead", id: "LIST" },
        { type: "Lead", id: "STATS" },
      ],
    }),

    // PATCH /procurement/:id/stage
    updateLeadStage: builder.mutation<ProcurementLead, { id: string; stage: MarketStage }>({
      query: ({ id, stage }) => ({ url: `/procurement/${id}/stage`, method: "PATCH", body: { stage } }),
      transformResponse: (res: ApiResponse<ProcurementLead>) => res.data,
      invalidatesTags: (_r, _e, { id }) => [
        { type: "Lead", id },
        { type: "Lead", id: "LIST" },
        { type: "Lead", id: "STATS" },
      ],
    }),

    // DELETE /procurement/:id
    deleteLead: builder.mutation<void, string>({
      query: (id) => ({ url: `/procurement/${id}`, method: "DELETE" }),
      invalidatesTags: (_r, _e, id) => [
        { type: "Lead", id },
        { type: "Lead", id: "LIST" },
        { type: "Lead", id: "STATS" },
      ],
    }),
  }),
});

export const {
  useGetProcurementStatsQuery,
  useGetLeadsQuery,
  useGetLeadByIdQuery,
  useCreateLeadMutation,
  useUpdateLeadMutation,
  useUpdateLeadStageMutation,
  useDeleteLeadMutation,
} = procurementApi;
