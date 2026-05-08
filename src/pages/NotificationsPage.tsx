import { useState } from "react";
import {
    HiOutlineBell,
    HiOutlineCheckCircle,
    HiOutlineClock,
    HiOutlineExclamation,
    HiOutlineInformationCircle,
    HiOutlineTrash
} from "react-icons/hi";
import { DashboardLayout } from "../components";
import { Card } from "../components/ui";
import type { UserRole } from "../context/AuthContext";

type NotificationType = "info" | "warning" | "success" | "urgent";

interface Notification {
  id: string;
  type: NotificationType;
  title: string;
  message: string;
  timestamp: string;
  read: boolean;
  actionUrl?: string;
}

const initialNotifications: Notification[] = [
  {
    id: "N-001",
    type: "urgent",
    title: "Urgent: Job Deadline Approaching",
    message: "JOB-001 (Print 500 brochures) is due in 2 hours. Current progress: 65%",
    timestamp: "2026-05-01T12:00:00",
    read: false,
    actionUrl: "/worker/tasks",
  },
  {
    id: "N-002",
    type: "success",
    title: "Job Completed",
    message: "JOB-003 (Print business cards) has been marked as completed by John Worker",
    timestamp: "2026-05-01T09:30:00",
    read: false,
  },
  {
    id: "N-003",
    type: "info",
    title: "New Job Assigned",
    message: "You have been assigned a new job: JOB-008 (Print 1000 posters)",
    timestamp: "2026-05-01T08:00:00",
    read: false,
    actionUrl: "/worker/tasks",
  },
  {
    id: "N-004",
    type: "warning",
    title: "High Workload Alert",
    message: "Worker Mike Johnson has 3 active jobs. Consider redistributing workload.",
    timestamp: "2026-04-30T16:00:00",
    read: true,
  },
  {
    id: "N-005",
    type: "info",
    title: "Subtask Added",
    message: "A new subtask was added to JOB-001: Quality check and packaging",
    timestamp: "2026-04-30T14:00:00",
    read: true,
  },
  {
    id: "N-006",
    type: "success",
    title: "Daily Goal Achieved",
    message: "Congratulations! You completed 5 jobs today.",
    timestamp: "2026-04-30T17:00:00",
    read: true,
  },
];

const notificationConfig: Record<
  NotificationType,
  { icon: any; color: string; bgColor: string; borderColor: string }
> = {
  info: {
    icon: HiOutlineInformationCircle,
    color: "text-blue-600",
    bgColor: "bg-blue-50",
    borderColor: "border-blue-200",
  },
  warning: {
    icon: HiOutlineExclamation,
    color: "text-yellow-600",
    bgColor: "bg-yellow-50",
    borderColor: "border-yellow-200",
  },
  success: {
    icon: HiOutlineCheckCircle,
    color: "text-green-600",
    bgColor: "bg-green-50",
    borderColor: "border-green-200",
  },
  urgent: {
    icon: HiOutlineClock,
    color: "text-red-600",
    bgColor: "bg-red-50",
    borderColor: "border-red-200",
  },
};

interface NotificationsPageProps {
  userRole: UserRole;
  userName?: string;
}

export default function NotificationsPage({
  userRole,
  userName = "User",
}: NotificationsPageProps) {
  const [notifications, setNotifications] = useState<Notification[]>(initialNotifications);
  const [filter, setFilter] = useState<"all" | "unread">("all");

  const unreadCount = notifications.filter((n) => !n.read).length;

  const filteredNotifications =
    filter === "unread"
      ? notifications.filter((n) => !n.read)
      : notifications;

  const handleMarkAsRead = (id: string) => {
    setNotifications(
      notifications.map((n) => (n.id === id ? { ...n, read: true } : n))
    );
  };

  const handleMarkAllAsRead = () => {
    setNotifications(notifications.map((n) => ({ ...n, read: true })));
  };

  const handleDelete = (id: string) => {
    setNotifications(notifications.filter((n) => n.id !== id));
  };

  const handleClearAll = () => {
    setNotifications([]);
  };

  const getTimeAgo = (timestamp: string) => {
    const now = new Date();
    const time = new Date(timestamp);
    const diffInMs = now.getTime() - time.getTime();
    const diffInMins = Math.floor(diffInMs / 60000);
    const diffInHours = Math.floor(diffInMs / 3600000);
    const diffInDays = Math.floor(diffInMs / 86400000);

    if (diffInMins < 1) return "Just now";
    if (diffInMins < 60) return `${diffInMins}m ago`;
    if (diffInHours < 24) return `${diffInHours}h ago`;
    return `${diffInDays}d ago`;
  };

  return (
    <DashboardLayout
      userRole={userRole}
      userName={userName}
      notificationCount={unreadCount}
    >
      <div className="space-y-6 font-[family-name:var(--font-family-primary)]">
        {/* Header */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
          <div>
            <h1 className="text-2xl md:text-3xl font-bold text-secondary-100 flex items-center gap-2">
              <HiOutlineBell className="w-8 h-8" />
              Notifications
            </h1>
            <p className="text-sm text-custom-700 mt-1">
              {unreadCount > 0
                ? `You have ${unreadCount} unread notification${unreadCount > 1 ? "s" : ""}`
                : "You're all caught up!"}
            </p>
          </div>
          <div className="flex gap-2">
            {unreadCount > 0 && (
              <button
                onClick={handleMarkAllAsRead}
                className="px-4 py-2 rounded-xl border border-custom-300 text-custom-700 hover:bg-custom-100 transition-colors text-sm font-semibold"
              >
                Mark All as Read
              </button>
            )}
            {notifications.length > 0 && (
              <button
                onClick={handleClearAll}
                className="px-4 py-2 rounded-xl border border-red-300 text-red-600 hover:bg-red-50 transition-colors text-sm font-semibold"
              >
                Clear All
              </button>
            )}
          </div>
        </div>

        {/* Filter Tabs */}
        <div className="flex gap-2">
          <button
            onClick={() => setFilter("all")}
            className={`px-4 py-2 rounded-xl transition-colors text-sm font-semibold ${
              filter === "all"
                ? "bg-primary-500 text-white"
                : "border border-custom-300 text-custom-700 hover:bg-custom-100"
            }`}
          >
            All ({notifications.length})
          </button>
          <button
            onClick={() => setFilter("unread")}
            className={`px-4 py-2 rounded-xl transition-colors text-sm font-semibold ${
              filter === "unread"
                ? "bg-primary-500 text-white"
                : "border border-custom-300 text-custom-700 hover:bg-custom-100"
            }`}
          >
            Unread ({unreadCount})
          </button>
        </div>

        {/* Notifications List */}
        {filteredNotifications.length === 0 ? (
          <Card className="!p-12 text-center">
            <HiOutlineBell className="w-16 h-16 mx-auto text-custom-400 mb-4" />
            <h3 className="text-lg font-bold text-secondary-100 mb-2">
              No notifications
            </h3>
            <p className="text-sm text-custom-700">
              {filter === "unread"
                ? "You have no unread notifications"
                : "You're all caught up!"}
            </p>
          </Card>
        ) : (
          <div className="space-y-3">
            {filteredNotifications.map((notification) => {
              const config = notificationConfig[notification.type];
              const Icon = config.icon;

              return (
                <Card
                  key={notification.id}
                  className={`!p-4 ${
                    !notification.read
                      ? "border-l-4 border-l-primary-500"
                      : "opacity-75"
                  }`}
                >
                  <div className="flex items-start gap-4">
                    {/* Icon */}
                    <div
                      className={`w-10 h-10 rounded-full ${config.bgColor} border ${config.borderColor} flex items-center justify-center flex-shrink-0`}
                    >
                      <Icon className={`w-5 h-5 ${config.color}`} />
                    </div>

                    {/* Content */}
                    <div className="flex-1 min-w-0">
                      <div className="flex items-start justify-between gap-2 mb-1">
                        <h3
                          className={`text-sm font-bold ${
                            !notification.read
                              ? "text-secondary-100"
                              : "text-custom-700"
                          }`}
                        >
                          {notification.title}
                        </h3>
                        <span className="text-xs text-custom-700 whitespace-nowrap">
                          {getTimeAgo(notification.timestamp)}
                        </span>
                      </div>
                      <p className="text-sm text-custom-700 mb-2">
                        {notification.message}
                      </p>

                      {/* Actions */}
                      <div className="flex items-center gap-2">
                        {!notification.read && (
                          <button
                            onClick={() => handleMarkAsRead(notification.id)}
                            className="text-xs font-semibold text-primary-500 hover:text-primary-600 transition-colors"
                          >
                            Mark as read
                          </button>
                        )}
                        {notification.actionUrl && (
                          <a
                            href={notification.actionUrl}
                            className="text-xs font-semibold text-primary-500 hover:text-primary-600 transition-colors"
                          >
                            View →
                          </a>
                        )}
                        <button
                          onClick={() => handleDelete(notification.id)}
                          className="ml-auto text-xs font-semibold text-red-500 hover:text-red-600 transition-colors flex items-center gap-1"
                        >
                          <HiOutlineTrash className="w-3 h-3" />
                          Delete
                        </button>
                      </div>
                    </div>

                    {/* Unread Indicator */}
                    {!notification.read && (
                      <div className="w-2 h-2 rounded-full bg-primary-500 flex-shrink-0 mt-2" />
                    )}
                  </div>
                </Card>
              );
            })}
          </div>
        )}
      </div>
    </DashboardLayout>
  );
}
