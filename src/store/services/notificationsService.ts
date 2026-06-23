import { createApi, fetchBaseQuery } from "@reduxjs/toolkit/query/react";
import type { RootState } from "../index";

// ─── Types ────────────────────────────────────────────────────────────────────

export type NotificationType =
  | "CUSTOMER_CREATED"
  | "CUSTOMER_CHECKIN"
  | "PAYMENT_COLLECTED"
  | "JOB_DELIVERED"
  | "BOUTIQUE_STOCK_REQUEST"
  | "BOUTIQUE_PRODUCT_ADDED"
  | "REPORT_GENERATED"
  | "JOB_CREATED"
  | "JOB_ASSIGNED"
  | "JOB_STATUS_CHANGED"
  | "PROGRESS_COMPLETED"
  | "JOB_DONE"
  | "JOB_COMPLETED"
  | "EMPLOYEE_CREATED"
  | "JOB_DAF_ACTION"
  | "STOCK_SORTIE_APPROVED"
  | "STOCK_SORTIE_REJECTED"
  | "STOCK_SORTIE_REQUEST";

export interface Notification {
  id: string;                  // NotificationRead id
  notificationId: string;
  type: NotificationType;
  title: string;
  message: string;
  relatedEntityType?: string;
  relatedEntityId?: string;
  createdById: string;
  createdBy?: { id: string; name: string; role: string };
  targetRoles: string[];
  createdAt: string;
  // NotificationRead fields
  isRead: boolean;
  viewedAt?: string | null;
}

export interface NotificationStats {
  unreadCount: number;
  latest: Notification[];
}

export interface PaginatedNotifications {
  notifications: Notification[];
  total: number;
  page: number;
  totalPages: number;
}

interface ApiResponse<T> {
  success: boolean;
  data: T;
  message?: string;
  pagination?: {
    total: number;
    page: number;
    limit: number;
    totalPages: number;
  };
}

// ─── Service ──────────────────────────────────────────────────────────────────

export const notificationsApi = createApi({
  reducerPath: "notificationsApi",

  baseQuery: fetchBaseQuery({
    baseUrl: import.meta.env.VITE_API_URL ?? "http://localhost:8000/api",
    prepareHeaders: (headers, { getState }) => {
      const token = (getState() as RootState).auth.token;
      if (token) headers.set("Authorization", `Bearer ${token}`);
      return headers;
    },
  }),

  tagTypes: ["Notification", "NotificationStats"],

  endpoints: (builder) => ({
    // GET /notifications/stats — bell icon data
    getNotificationStats: builder.query<NotificationStats, void>({
      query: () => "/notifications/stats",
      transformResponse: (res: ApiResponse<{ unreadCount: number; latest: any[] }>) => ({
        unreadCount: res.data.unreadCount,
        latest: (res.data.latest ?? []).map((row: any) => ({
          id: row.notificationId ?? row.id,
          notificationId: row.notificationId ?? row.id,
          type: row.notification?.type ?? row.type,
          title: row.notification?.title ?? row.title,
          message: row.notification?.message ?? row.message,
          relatedEntityType: row.notification?.relatedEntityType,
          relatedEntityId: row.notification?.relatedEntityId,
          createdById: row.notification?.createdById,
          createdBy: row.notification?.createdBy,
          targetRoles: row.notification?.targetRoles ?? [],
          createdAt: row.notification?.createdAt ?? row.createdAt,
          isRead: row.isRead,
          viewedAt: row.viewedAt,
        })),
      }),
      providesTags: ["NotificationStats"],
    }),

    // GET /notifications/unread-count
    getUnreadCount: builder.query<number, void>({
      query: () => "/notifications/unread-count",
      transformResponse: (res: ApiResponse<{ unreadCount: number }>) => res.data.unreadCount,
      providesTags: ["NotificationStats"],
    }),

    // GET /notifications?page=&limit=&unreadOnly=
    getNotifications: builder.query<
      PaginatedNotifications,
      { page?: number; limit?: number; unreadOnly?: boolean }
    >({
      query: (params) => ({ url: "/notifications", params }),
      transformResponse: (res: ApiResponse<any[]>) => ({
        notifications: (res.data ?? []).map((row: any) => ({
          id: row.notificationId ?? row.id,
          notificationId: row.notificationId ?? row.id,
          type: row.notification?.type ?? row.type,
          title: row.notification?.title ?? row.title,
          message: row.notification?.message ?? row.message,
          relatedEntityType: row.notification?.relatedEntityType ?? row.relatedEntityType,
          relatedEntityId: row.notification?.relatedEntityId ?? row.relatedEntityId,
          createdById: row.notification?.createdById ?? row.createdById,
          createdBy: row.notification?.createdBy ?? row.createdBy,
          targetRoles: row.notification?.targetRoles ?? row.targetRoles ?? [],
          createdAt: row.notification?.createdAt ?? row.createdAt,
          isRead: row.isRead,
          viewedAt: row.viewedAt,
        })),
        total: res.pagination?.total ?? 0,
        page: res.pagination?.page ?? 1,
        totalPages: res.pagination?.totalPages ?? 1,
      }),
      providesTags: (result) =>
        result?.notifications?.length
          ? [
              ...result.notifications.map(({ id }) => ({
                type: "Notification" as const,
                id,
              })),
              { type: "Notification", id: "LIST" },
            ]
          : [{ type: "Notification", id: "LIST" }],
    }),

    // PATCH /notifications/:id/read
    markOneRead: builder.mutation<void, string>({
      query: (id) => ({ url: `/notifications/${id}/read`, method: "PATCH" }),
      invalidatesTags: (_r, _e, id) => [
        { type: "Notification", id },
        { type: "Notification", id: "LIST" },
        "NotificationStats",
      ],
    }),

    // PATCH /notifications/read-all
    markAllRead: builder.mutation<void, void>({
      query: () => ({ url: "/notifications/read-all", method: "PATCH" }),
      invalidatesTags: [{ type: "Notification", id: "LIST" }, "NotificationStats"],
    }),

    // DELETE /notifications/:id
    deleteOne: builder.mutation<void, string>({
      query: (id) => ({ url: `/notifications/${id}`, method: "DELETE" }),
      invalidatesTags: [{ type: "Notification", id: "LIST" }, "NotificationStats"],
    }),

    // DELETE /notifications
    deleteAll: builder.mutation<void, void>({
      query: () => ({ url: "/notifications", method: "DELETE" }),
      invalidatesTags: [{ type: "Notification", id: "LIST" }, "NotificationStats"],
    }),
  }),
});

export const {
  useGetNotificationStatsQuery,
  useLazyGetNotificationStatsQuery,
  useGetUnreadCountQuery,
  useGetNotificationsQuery,
  useMarkOneReadMutation,
  useMarkAllReadMutation,
  useDeleteOneMutation,
  useDeleteAllMutation,
} = notificationsApi;
