import { useState } from "react";
import { useNavigate } from "react-router-dom";
import {
  HiOutlineBell,
  HiOutlineCheckCircle,
  HiOutlineClock,
  HiOutlineCurrencyDollar,
  HiOutlineDocumentText,
  HiOutlineExclamation,
  HiOutlineInformationCircle,
  HiOutlineShoppingBag,
  HiOutlineThumbDown,
  HiOutlineThumbUp,
  HiOutlineTrash,
  HiOutlineUser,
  HiOutlineUserAdd,
} from "react-icons/hi";
import { DashboardLayout } from "../components";
import { Card } from "../components/ui";
import type { UserRole } from "../context/AuthContext";
import {
  useDeleteAllMutation,
  useDeleteOneMutation,
  useGetNotificationsQuery,
  useMarkAllReadMutation,
  useMarkOneReadMutation,
  type NotificationType,
} from "../store/services/notificationsService";

// ─── Icon / colour config per type ───────────────────────────────────────────

const typeConfig: Record<
  NotificationType,
  { icon: React.ElementType; color: string; bg: string; border: string }
> = {
  CUSTOMER_CREATED: {
    icon: HiOutlineUser,
    color: "text-blue-600",
    bg: "bg-blue-50",
    border: "border-blue-200",
  },
  CUSTOMER_CHECKIN: {
    icon: HiOutlineCheckCircle,
    color: "text-green-600",
    bg: "bg-green-50",
    border: "border-green-200",
  },
  PAYMENT_COLLECTED: {
    icon: HiOutlineCurrencyDollar,
    color: "text-emerald-600",
    bg: "bg-emerald-50",
    border: "border-emerald-200",
  },
  JOB_DELIVERED: {
    icon: HiOutlineCheckCircle,
    color: "text-green-700",
    bg: "bg-green-50",
    border: "border-green-200",
  },
  BOUTIQUE_STOCK_REQUEST: {
    icon: HiOutlineExclamation,
    color: "text-yellow-600",
    bg: "bg-yellow-50",
    border: "border-yellow-200",
  },
  BOUTIQUE_PRODUCT_ADDED: {
    icon: HiOutlineShoppingBag,
    color: "text-purple-600",
    bg: "bg-purple-50",
    border: "border-purple-200",
  },
  REPORT_GENERATED: {
    icon: HiOutlineDocumentText,
    color: "text-indigo-600",
    bg: "bg-indigo-50",
    border: "border-indigo-200",
  },
  JOB_CREATED: {
    icon: HiOutlineClock,
    color: "text-orange-600",
    bg: "bg-orange-50",
    border: "border-orange-200",
  },
  JOB_ASSIGNED: {
    icon: HiOutlineInformationCircle,
    color: "text-sky-600",
    bg: "bg-sky-50",
    border: "border-sky-200",
  },
  JOB_STATUS_CHANGED: {
    icon: HiOutlineInformationCircle,
    color: "text-cyan-600",
    bg: "bg-cyan-50",
    border: "border-cyan-200",
  },
  PROGRESS_COMPLETED: {
    icon: HiOutlineCheckCircle,
    color: "text-teal-600",
    bg: "bg-teal-50",
    border: "border-teal-200",
  },
  JOB_DONE: {
    icon: HiOutlineThumbUp,
    color: "text-green-700",
    bg: "bg-green-50",
    border: "border-green-200",
  },
  JOB_COMPLETED: {
    icon: HiOutlineCheckCircle,
    color: "text-emerald-700",
    bg: "bg-emerald-50",
    border: "border-emerald-200",
  },
  EMPLOYEE_CREATED: {
    icon: HiOutlineUserAdd,
    color: "text-violet-600",
    bg: "bg-violet-50",
    border: "border-violet-200",
  },
  JOB_DAF_ACTION: {
    icon: HiOutlineThumbDown,
    color: "text-rose-600",
    bg: "bg-rose-50",
    border: "border-rose-200",
  },
};

const fallbackConfig = {
  icon: HiOutlineBell,
  color: "text-custom-700",
  bg: "bg-custom-100",
  border: "border-custom-300",
};

function timeAgo(ts: string) {
  const diff = Date.now() - new Date(ts).getTime();
  const mins = Math.floor(diff / 60000);
  const hrs = Math.floor(diff / 3600000);
  const days = Math.floor(diff / 86400000);
  if (mins < 1) return "Just now";
  if (mins < 60) return `${mins}m ago`;
  if (hrs < 24) return `${hrs}h ago`;
  return `${days}d ago`;
}

// ─── Component ────────────────────────────────────────────────────────────────

interface NotificationsPageProps {
  userRole: UserRole;
  userName?: string;
}

const routeMap: Record<string, (id: string) => string> = {
  job: (id) => `/jobs/${id}`,
  employee: (id) => `/employees/${id}`,
  payment: (id) => `/payments/${id}`,
};

export default function NotificationsPage({
  userRole,
  userName = "User",
}: NotificationsPageProps) {
  const navigate = useNavigate();
  const [filter, setFilter] = useState<"all" | "unread">("all");
  const [page, setPage] = useState(1);
  const limit = 20;

  const { data, isLoading, isFetching } = useGetNotificationsQuery({
    page,
    limit,
    unreadOnly: filter === "unread" ? true : undefined,
  });

  const [markOne] = useMarkOneReadMutation();
  const [markAll] = useMarkAllReadMutation();
  const [deleteOne] = useDeleteOneMutation();
  const [deleteAll] = useDeleteAllMutation();

  const notifications = data?.notifications ?? [];
  const totalPages = data?.totalPages ?? 1;
  const unreadCount = notifications.filter((n) => !n.isRead).length;

  const handleFilterChange = (f: "all" | "unread") => {
    setFilter(f);
    setPage(1);
  };

  return (
    <DashboardLayout userRole={userRole} userName={userName}>
      <div className="space-y-6 font-[family-name:var(--font-family-primary)]">
        {/* Header */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
          <div>
            <h1 className="text-2xl md:text-3xl font-bold text-secondary-100 flex items-center gap-2">
              <HiOutlineBell className="w-8 h-8" />
              Notifications
            </h1>
            <p className="text-sm text-custom-700 mt-1">
              {isLoading
                ? "Loading…"
                : unreadCount > 0
                ? `You have ${unreadCount} unread notification${unreadCount > 1 ? "s" : ""}`
                : "You're all caught up!"}
            </p>
          </div>

          <div className="flex gap-2">
            {unreadCount > 0 && (
              <button
                onClick={() => markAll()}
                className="px-4 py-2 rounded-xl border border-custom-300 text-custom-700 hover:bg-custom-100 transition-colors text-sm font-semibold"
              >
                Mark All as Read
              </button>
            )}
            {notifications.length > 0 && (
              <button
                onClick={() => deleteAll()}
                className="px-4 py-2 rounded-xl border border-red-300 text-red-600 hover:bg-red-50 transition-colors text-sm font-semibold"
              >
                Clear All
              </button>
            )}
          </div>
        </div>

        {/* Filter Tabs */}
        <div className="flex gap-2">
          {(["all", "unread"] as const).map((f) => (
            <button
              key={f}
              onClick={() => handleFilterChange(f)}
              className={`px-4 py-2 rounded-xl transition-colors text-sm font-semibold capitalize ${
                filter === f
                  ? "bg-primary-500 text-white"
                  : "border border-custom-300 text-custom-700 hover:bg-custom-100"
              }`}
            >
              {f === "all" ? `All (${data?.total ?? 0})` : `Unread (${unreadCount})`}
            </button>
          ))}
        </div>

        {/* List */}
        {isLoading ? (
          <Card className="!p-12 text-center text-custom-700 text-sm">Loading…</Card>
        ) : notifications.length === 0 ? (
          <Card className="!p-12 text-center">
            <HiOutlineBell className="w-16 h-16 mx-auto text-custom-400 mb-4" />
            <h3 className="text-lg font-bold text-secondary-100 mb-2">No notifications</h3>
            <p className="text-sm text-custom-700">
              {filter === "unread" ? "No unread notifications" : "You're all caught up!"}
            </p>
          </Card>
        ) : (
          <div className={`space-y-3 transition-opacity ${isFetching ? "opacity-60" : ""}`}>
            {notifications.map((n) => {
              const cfg = typeConfig[n.type] ?? fallbackConfig;
              const Icon = cfg.icon;

              return (
                <Card
                  key={n.id}
                  onClick={() => {
                    if (!n.isRead) markOne(n.id);
                    if (n.relatedEntityType && n.relatedEntityId) {
                      const fn = routeMap[n.relatedEntityType];
                      if (fn) navigate(fn(n.relatedEntityId));
                    }
                  }}
                  className={`!p-4 cursor-pointer hover:shadow-sm transition-shadow ${!n.isRead ? "border-l-4 border-l-primary-500" : "opacity-75"}`}
                >
                  <div className="flex items-start gap-4">
                    {/* Icon */}
                    <div
                      className={`w-10 h-10 rounded-full ${cfg.bg} border ${cfg.border} flex items-center justify-center flex-shrink-0`}
                    >
                      <Icon className={`w-5 h-5 ${cfg.color}`} />
                    </div>

                    {/* Content */}
                    <div className="flex-1 min-w-0">
                      <div className="flex items-start justify-between gap-2 mb-1">
                        <h3
                          className={`text-sm font-bold ${
                            !n.isRead ? "text-secondary-100" : "text-custom-700"
                          }`}
                        >
                          {n.title}
                        </h3>
                        <span className="text-xs text-custom-700 whitespace-nowrap">
                          {timeAgo(n.createdAt)}
                        </span>
                      </div>

                      <p className="text-sm text-custom-700 mb-2">{n.message}</p>

                      {/* Type badge */}
                      <span className="inline-block text-[10px] font-semibold uppercase tracking-wide px-2 py-0.5 rounded-full bg-custom-100 text-custom-700 mb-2">
                        {n.type.replace(/_/g, " ")}
                      </span>

                      {/* Actions */}
                      <div className="flex items-center gap-3">
                        {!n.isRead && (
                          <button
                            onClick={() => markOne(n.id)}
                            className="text-xs font-semibold text-primary-500 hover:text-primary-600 transition-colors"
                          >
                            Mark as read
                          </button>
                        )}
                        {n.relatedEntityType && n.relatedEntityId && (
                          <span className="text-xs text-custom-500">
                            Ref: {n.relatedEntityType} #{n.relatedEntityId}
                          </span>
                        )}
                        <button
                          onClick={() => deleteOne(n.id)}
                          className="ml-auto text-xs font-semibold text-red-500 hover:text-red-600 transition-colors flex items-center gap-1"
                        >
                          <HiOutlineTrash className="w-3 h-3" />
                          Remove
                        </button>
                      </div>
                    </div>

                    {/* Unread dot */}
                    {!n.isRead && (
                      <div className="w-2 h-2 rounded-full bg-primary-500 flex-shrink-0 mt-2" />
                    )}
                  </div>
                </Card>
              );
            })}
          </div>
        )}

        {/* Pagination */}
        {totalPages > 1 && (
          <div className="flex items-center justify-center gap-2 pt-2">
            <button
              disabled={page === 1}
              onClick={() => setPage((p) => p - 1)}
              className="px-3 py-1.5 rounded-lg border border-custom-300 text-sm text-custom-700 hover:bg-custom-100 disabled:opacity-40 disabled:cursor-not-allowed transition-colors"
            >
              Prev
            </button>
            <span className="text-sm text-custom-700">
              {page} / {totalPages}
            </span>
            <button
              disabled={page === totalPages}
              onClick={() => setPage((p) => p + 1)}
              className="px-3 py-1.5 rounded-lg border border-custom-300 text-sm text-custom-700 hover:bg-custom-100 disabled:opacity-40 disabled:cursor-not-allowed transition-colors"
            >
              Next
            </button>
          </div>
        )}
      </div>
    </DashboardLayout>
  );
}
