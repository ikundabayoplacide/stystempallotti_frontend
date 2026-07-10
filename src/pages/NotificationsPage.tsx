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
  HiOutlineTrash,
  HiOutlineUser,
  HiOutlineUserAdd,
  HiOutlineX,
  HiOutlineArrowRight,
  HiOutlineBriefcase,
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
  type Notification,
  type NotificationType,
} from "../store/services/notificationsService";

// ─── Icon / colour config per type ───────────────────────────────────────────

const typeConfig: Record<
  NotificationType,
  { icon: React.ElementType; color: string; bg: string; border: string }
> = {
  CUSTOMER_CREATED: { icon: HiOutlineUser, color: "text-blue-600", bg: "bg-blue-50", border: "border-blue-200" },
  CUSTOMER_CHECKIN: { icon: HiOutlineCheckCircle, color: "text-green-600", bg: "bg-green-50", border: "border-green-200" },
  PAYMENT_COLLECTED: { icon: HiOutlineCurrencyDollar, color: "text-emerald-600", bg: "bg-emerald-50", border: "border-emerald-200" },
  PAYMENT_RECEIVED: { icon: HiOutlineCurrencyDollar, color: "text-emerald-700", bg: "bg-emerald-50", border: "border-emerald-200" },
  JOB_DELIVERED: { icon: HiOutlineCheckCircle, color: "text-green-700", bg: "bg-green-50", border: "border-green-200" },
  BOUTIQUE_STOCK_REQUEST: { icon: HiOutlineExclamation, color: "text-yellow-600", bg: "bg-yellow-50", border: "border-yellow-200" },
  BOUTIQUE_PRODUCT_ADDED: { icon: HiOutlineShoppingBag, color: "text-purple-600", bg: "bg-purple-50", border: "border-purple-200" },
  REPORT_GENERATED: { icon: HiOutlineDocumentText, color: "text-indigo-600", bg: "bg-indigo-50", border: "border-indigo-200" },
  JOB_CREATED: { icon: HiOutlineClock, color: "text-orange-600", bg: "bg-orange-50", border: "border-orange-200" },
  JOB_ASSIGNED: { icon: HiOutlineInformationCircle, color: "text-sky-600", bg: "bg-sky-50", border: "border-sky-200" },
  JOB_STATUS_CHANGED: { icon: HiOutlineInformationCircle, color: "text-cyan-600", bg: "bg-cyan-50", border: "border-cyan-200" },
  DEPARTMENT_ASSIGNED: { icon: HiOutlineBriefcase, color: "text-violet-600", bg: "bg-violet-50", border: "border-violet-200" },
  EMPLOYEE_CREATED: { icon: HiOutlineUserAdd, color: "text-violet-600", bg: "bg-violet-50", border: "border-violet-200" },
  JOB_DAF_ACTION: { icon: HiOutlineBriefcase, color: "text-blue-600", bg: "bg-blue-50", border: "border-blue-200" },
  HOBE_CREATED: { icon: HiOutlineShoppingBag, color: "text-teal-600", bg: "bg-teal-50", border: "border-teal-200" },
  OUTSTAND_CREATED: { icon: HiOutlineCurrencyDollar, color: "text-red-600", bg: "bg-red-50", border: "border-red-200" },
  GENERAL: { icon: HiOutlineBell, color: "text-custom-700", bg: "bg-custom-100", border: "border-custom-300" },
};

const fallbackConfig = { icon: HiOutlineBell, color: "text-custom-700", bg: "bg-custom-100", border: "border-custom-300" };

// Dynamically adjust icon for types whose meaning depends on the content
function getConfig(n: Notification) {
  const base = typeConfig[n.type] ?? fallbackConfig;
  const text = (n.title + " " + n.message).toLowerCase();
  if (n.type === "JOB_DAF_ACTION" || n.type === "JOB_STATUS_CHANGED") {
    if (text.includes("confirm") || text.includes("approv") || text.includes("accept")) {
      return { ...base, icon: HiOutlineCheckCircle, color: "text-emerald-600", bg: "bg-emerald-50", border: "border-emerald-200" };
    }
    if (text.includes("reject") || text.includes("declin") || text.includes("denied")) {
      return { ...base, icon: HiOutlineExclamation, color: "text-red-600", bg: "bg-red-50", border: "border-red-200" };
    }
  }
  return base;
}

// ─── Route resolver per role + type ──────────────────────────────────────────

const roleTypeRoutes: Partial<Record<UserRole, Partial<Record<NotificationType, string>>>> = {
  receptionist: {
    CUSTOMER_CREATED: "/reception/visitor",
    CUSTOMER_CHECKIN: "/reception/visitor",
    PAYMENT_COLLECTED: "/reception/payments",
    PAYMENT_RECEIVED: "/reception/payments",
    JOB_DELIVERED: "/reception/deliveries",
    BOUTIQUE_STOCK_REQUEST: "/reception/boutique-stock",
    BOUTIQUE_PRODUCT_ADDED: "/reception/boutique",
    REPORT_GENERATED: "/reception/reports",
    JOB_CREATED: "/reception/deliveries",
    JOB_DAF_ACTION: "/reception/deliveries",
  },
  sales: {
    JOB_CREATED: "/sales/jobs",
    JOB_ASSIGNED: "/sales/jobs",
    JOB_STATUS_CHANGED: "/sales/jobs",
    JOB_DELIVERED: "/sales/jobs",
    JOB_DAF_ACTION: "/sales/jobs",
    CUSTOMER_CREATED: "/sales/jobs",
    CUSTOMER_CHECKIN: "/sales/jobs",
    PAYMENT_COLLECTED: "/sales/jobs",
    BOUTIQUE_STOCK_REQUEST: "/sales/stocks",
    BOUTIQUE_PRODUCT_ADDED: "/sales/stocks",
    REPORT_GENERATED: "/sales/reports",
    HOBE_CREATED: "/sales/jobs",
  },
  daf: {
    JOB_CREATED: "/finance/daf/approvals",
    JOB_ASSIGNED: "/finance/daf/approvals",
    JOB_STATUS_CHANGED: "/finance/daf/approvals",
    JOB_DELIVERED: "/finance/daf/approvals",
    JOB_DAF_ACTION: "/finance/daf/approvals",
    PAYMENT_COLLECTED: "/finance/daf/control",
    PAYMENT_RECEIVED: "/finance/daf/control",
    CUSTOMER_CREATED: "/finance/daf/control",
    CUSTOMER_CHECKIN: "/finance/daf/control",
    OUTSTAND_CREATED: "/finance/daf/control",
    EMPLOYEE_CREATED: "/finance/daf/hr",
    BOUTIQUE_STOCK_REQUEST: "/finance/daf/procurement",
    BOUTIQUE_PRODUCT_ADDED: "/finance/daf/procurement",
    REPORT_GENERATED: "/finance/daf/reports",
  },
  accountant: {
    PAYMENT_COLLECTED: "/finance/accountant1/payments",
    PAYMENT_RECEIVED: "/finance/accountant1/payments",
    OUTSTAND_CREATED: "/finance/accountant1/payments",
    REPORT_GENERATED: "/finance/accountant1/reports",
  },
  "production-manager": {
    JOB_CREATED: "/production-manager/planning",
    JOB_ASSIGNED: "/production-manager/planning",
    JOB_STATUS_CHANGED: "/production-manager/planning",
    JOB_DELIVERED: "/production-manager/planning",
    JOB_DAF_ACTION: "/production-manager/planning",
    DEPARTMENT_ASSIGNED: "/production-manager/planning",
    REPORT_GENERATED: "/production-manager/reports",
  },
  supervisor: {
    JOB_CREATED: "/supervisor/jobs",
    JOB_ASSIGNED: "/supervisor/jobs",
    JOB_STATUS_CHANGED: "/supervisor/jobs",
    JOB_DELIVERED: "/supervisor/jobs",
    JOB_DAF_ACTION: "/supervisor/jobs",
    DEPARTMENT_ASSIGNED: "/supervisor/jobs",
    EMPLOYEE_CREATED: "/supervisor/employees",
    BOUTIQUE_STOCK_REQUEST: "/supervisor/binding-stock",
    REPORT_GENERATED: "/supervisor/reports",
  },
  stock: {
    BOUTIQUE_PRODUCT_ADDED: "/stock/boutique-stock",
    JOB_CREATED: "/stock/requests",
    JOB_STATUS_CHANGED: "/stock/inventory",
    REPORT_GENERATED: "/stock/reports",
  },
  hobe: {
    HOBE_CREATED: "/hobe/trade",
    BOUTIQUE_STOCK_REQUEST: "/hobe/requests",
    REPORT_GENERATED: "/hobe/report",
    JOB_CREATED: "/hobe/trade",
    JOB_STATUS_CHANGED: "/hobe/trade",
  },
  worker: {
    JOB_ASSIGNED: "/worker/tasks",
    JOB_STATUS_CHANGED: "/worker/tasks",
    JOB_CREATED: "/worker/tasks",
    DEPARTMENT_ASSIGNED: "/worker/tasks",
    BOUTIQUE_STOCK_REQUEST: "/worker/materials",
    REPORT_GENERATED: "/worker/reports",
  },
  admin: {
    JOB_CREATED: "/admin/jobs",
    JOB_ASSIGNED: "/admin/jobs",
    JOB_STATUS_CHANGED: "/admin/jobs",
    JOB_DELIVERED: "/admin/jobs",
    JOB_DAF_ACTION: "/admin/jobs",
    DEPARTMENT_ASSIGNED: "/admin/jobs",
    CUSTOMER_CREATED: "/admin/customers",
    CUSTOMER_CHECKIN: "/admin/customers",
    EMPLOYEE_CREATED: "/admin/users",
    PAYMENT_COLLECTED: "/admin/finance",
    PAYMENT_RECEIVED: "/admin/finance",
    OUTSTAND_CREATED: "/admin/finance",
    BOUTIQUE_STOCK_REQUEST: "/admin/stock",
    BOUTIQUE_PRODUCT_ADDED: "/admin/stock",
    HOBE_CREATED: "/admin/customers",
    REPORT_GENERATED: "/admin/reports",
  },
};

function resolveRoute(userRole: UserRole, n: Notification): string | null {
  const fromMap = roleTypeRoutes[userRole]?.[n.type] ?? null;
  if (fromMap) return fromMap;

  // Fallback: infer from title/message keywords if the type isn't mapped
  const text = (n.title + " " + n.message).toLowerCase();
  if (userRole === "receptionist") {
    if (text.includes("sortie") || text.includes("stock request")) return "/reception/boutique-stock";
    if (text.includes("boutique")) return "/reception/boutique";
    if (text.includes("payment")) return "/reception/payments";
    if (text.includes("deliver")) return "/reception/deliveries";
    if (text.includes("visitor") || text.includes("customer")) return "/reception/visitor";
  }
  if (userRole === "hobe") {
    if (text.includes("sortie") || text.includes("stock request") || text.includes("approved") || text.includes("rejected")) return "/hobe/requests";
    if (text.includes("trade") || text.includes("sale") || text.includes("hobe")) return "/hobe/trade";
    if (text.includes("report")) return "/hobe/report";
  }
  if (userRole === "sales") {
    if (text.includes("job") || text.includes("deliver") || text.includes("progress") || text.includes("daf") || text.includes("approved") || text.includes("rejected") || text.includes("customer") || text.includes("client") || text.includes("check")) return "/sales/jobs";
    if (text.includes("proforma") || text.includes("performa") || text.includes("quotation")) return "/sales/proformas";
    if (text.includes("stock") || text.includes("sortie")) return "/sales/stocks";
    if (text.includes("report")) return "/sales/reports";
  }
  if (userRole === "daf") {
    if (text.includes("job") || text.includes("approv") || text.includes("rejected") || text.includes("deliver") || text.includes("progress")) return "/finance/daf/approvals";
    if (text.includes("payment") || text.includes("customer") || text.includes("client")) return "/finance/daf/control";
    if (text.includes("employee") || text.includes("hr") || text.includes("staff")) return "/finance/daf/hr";
    if (text.includes("procurement") || text.includes("sortie") || text.includes("stock")) return "/finance/daf/procurement";
    if (text.includes("report")) return "/finance/daf/reports";
  }
  if (userRole === "production-manager") {
    if (text.includes("job") || text.includes("confirm") || text.includes("approv") || text.includes("assign") || text.includes("progress") || text.includes("deliver")) return "/production-manager/planning";
    if (text.includes("report")) return "/production-manager/reports";
  }
  if (userRole === "supervisor") {
    if (text.includes("binding") || text.includes("stock request") || text.includes("sortie")) return "/supervisor/binding-stock";
    if (text.includes("job") || text.includes("confirm") || text.includes("approv") || text.includes("assign") || text.includes("progress") || text.includes("deliver")) return "/supervisor/jobs";
    if (text.includes("employee") || text.includes("worker") || text.includes("staff")) return "/supervisor/employees";
    if (text.includes("report")) return "/supervisor/reports";
  }
  if (userRole === "worker") {
    if (text.includes("task") || text.includes("job") || text.includes("assign") || text.includes("progress") || text.includes("confirm")) return "/worker/tasks";
    if (text.includes("material") || text.includes("sortie") || text.includes("stock") || text.includes("approv") || text.includes("rejected")) return "/worker/materials";
    if (text.includes("report")) return "/worker/reports";
  }
  if (userRole === "stock") {
    if (text.includes("boutique")) return "/stock/boutique-stock";
    if (text.includes("sortie") || text.includes("stock request") || text.includes("general stock")) return "/stock/requests";
    if (text.includes("request") || text.includes("approv") || text.includes("rejected")) return "/stock/requests";
    if (text.includes("inventory") || text.includes("product") || text.includes("item")) return "/stock/inventory";
    if (text.includes("supplier")) return "/stock/suppliers";
    if (text.includes("report")) return "/stock/reports";
  }
  if (userRole === "admin") {
    if (text.includes("job") || text.includes("progress") || text.includes("deliver") || text.includes("confirm")) return "/admin/jobs";
    if (text.includes("customer") || text.includes("client")) return "/admin/customers";
    if (text.includes("employee") || text.includes("user") || text.includes("staff")) return "/admin/users";
    if (text.includes("payment") || text.includes("finance")) return "/admin/finance";
    if (text.includes("stock") || text.includes("sortie")) return "/admin/stock";
    if (text.includes("report")) return "/admin/reports";
  }
  return null;
}

// ─── Helpers ──────────────────────────────────────────────────────────────────

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

// ─── Detail Modal ─────────────────────────────────────────────────────────────

function NotificationModal({
  notification,
  userRole,
  onClose,
  onNavigate,
}: {
  notification: Notification;
  userRole: UserRole;
  onClose: () => void;
  onNavigate: (path: string) => void;
}) {
  const cfg = getConfig(notification);
  const Icon = cfg.icon;
  const route = resolveRoute(userRole, notification);

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 px-4"
      onClick={onClose}
    >
      <div className="w-full max-w-md" onClick={(e) => e.stopPropagation()}>
      <Card className="!p-6 relative">
        {/* Close */}
        <button
          onClick={onClose}
          className="absolute top-4 right-4 text-custom-500 hover:text-secondary-100 transition-colors"
        >
          <HiOutlineX className="w-5 h-5" />
        </button>

        {/* Icon + Type */}
        <div className="flex items-center gap-3 mb-4">
          <div className={`w-12 h-12 rounded-full ${cfg.bg} border ${cfg.border} flex items-center justify-center flex-shrink-0`}>
            <Icon className={`w-6 h-6 ${cfg.color}`} />
          </div>
          <div>
            <span className="text-[11px] font-semibold uppercase tracking-wide px-2 py-0.5 rounded-full bg-custom-100 text-custom-700">
              {notification.type.replace(/_/g, " ")}
            </span>
            <p className="text-xs text-custom-500 mt-0.5">{timeAgo(notification.createdAt)}</p>
          </div>
        </div>

        {/* Title */}
        <h2 className="text-lg font-bold text-secondary-100 mb-2">{notification.title}</h2>

        {/* Message */}
        <p className="text-sm text-custom-700 leading-relaxed mb-6">{notification.message}</p>

        {/* Actions */}
        <div className="flex items-center gap-3">
          {route && (
            <button
              onClick={() => onNavigate(route)}
              className="flex items-center gap-2 px-4 py-2 rounded-xl bg-primary-500 text-white text-sm font-semibold hover:bg-primary-600 transition-colors"
            >
              Check
              <HiOutlineArrowRight className="w-4 h-4" />
            </button>
          )}
          <button
            onClick={onClose}
            className="px-4 py-2 rounded-xl border border-custom-300 text-custom-700 text-sm font-semibold hover:bg-custom-100 transition-colors"
          >
            Close
          </button>
        </div>
      </Card>
      </div>
    </div>
  );
}

// ─── Component ────────────────────────────────────────────────────────────────

interface NotificationsPageProps {
  userRole: UserRole;
  userName?: string;
}

export default function NotificationsPage({ userRole, userName = "User" }: NotificationsPageProps) {
  const navigate = useNavigate();
  const [filter, setFilter] = useState<"all" | "unread">("all");
  const [page, setPage] = useState(1);
  const [selected, setSelected] = useState<Notification | null>(null);
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

  const handleRead = (n: Notification) => {
    if (!n.isRead) markOne(n.id);
    setSelected(n);
  };

  const handleNavigate = (path: string) => {
    setSelected(null);
    navigate(path);
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
              onClick={() => { setFilter(f); setPage(1); }}
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
              const cfg = getConfig(n);
              const Icon = cfg.icon;

              return (
                <Card
                  key={n.id}
                  className={`!p-4 ${!n.isRead ? "border-l-4 border-l-primary-500" : "opacity-75"}`}
                >
                  <div className="flex items-start gap-4">
                    {/* Icon */}
                    <div className={`w-10 h-10 rounded-full ${cfg.bg} border ${cfg.border} flex items-center justify-center flex-shrink-0`}>
                      <Icon className={`w-5 h-5 ${cfg.color}`} />
                    </div>

                    {/* Content */}
                    <div className="flex-1 min-w-0">
                      <div className="flex items-start justify-between gap-2 mb-1">
                        <h3 className={`text-sm font-bold ${!n.isRead ? "text-secondary-100" : "text-custom-700"}`}>
                          {n.title}
                        </h3>
                        <span className="text-xs text-custom-700 whitespace-nowrap">{timeAgo(n.createdAt)}</span>
                      </div>

                      <p className="text-sm text-custom-700 mb-3 line-clamp-2">{n.message}</p>

                      {/* Type badge */}
                      <span className="inline-block text-[10px] font-semibold uppercase tracking-wide px-2 py-0.5 rounded-full bg-custom-100 text-custom-700 mb-3">
                        {n.type.replace(/_/g, " ")}
                      </span>

                      {/* Actions */}
                      <div className="flex items-center gap-3">
                        <button
                          onClick={() => handleRead(n)}
                          className="text-xs font-semibold text-white bg-primary-500 hover:bg-primary-600 transition-colors px-3 py-1.5 rounded-lg"
                        >
                          Read
                        </button>
                        {!n.isRead && (
                          <button
                            onClick={(e) => { e.stopPropagation(); markOne(n.id); }}
                            className="text-xs font-semibold text-primary-500 hover:text-primary-600 transition-colors"
                          >
                            Mark as read
                          </button>
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
            <span className="text-sm text-custom-700">{page} / {totalPages}</span>
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

      {/* Detail Modal */}
      {selected && (
        <NotificationModal
          notification={selected}
          userRole={userRole}
          onClose={() => setSelected(null)}
          onNavigate={handleNavigate}
        />
      )}
    </DashboardLayout>
  );
}
