import { useState } from "react";
import {
  HiOutlineClipboardList,
  HiOutlinePlay,
  HiOutlineTruck,
  HiOutlineCheckCircle,
  HiOutlineRefresh,
  HiOutlineClock,
} from "react-icons/hi";
import { Card } from "./ui";
import { useGetJobStatsQuery, useGetJobsQuery } from "../store/services/jobsService";

const statusColor: Record<string, string> = {
  pending:              "bg-yellow-100 text-yellow-700",
  confirmed:            "bg-indigo-100 text-indigo-700",
  "in-composition":     "bg-purple-100 text-purple-700",
  "in-montage":         "bg-amber-100 text-amber-700",
  "in-printing":        "bg-pink-100 text-pink-700",
  "in-binding":         "bg-teal-100 text-teal-700",
  "in-packaging":       "bg-cyan-100 text-cyan-700",
  "quality-check":      "bg-blue-100 text-blue-700",
  "ready-for-delivery": "bg-orange-100 text-orange-700",
  "partial-delivered":  "bg-orange-100 text-orange-700",
  delivered:            "bg-green-100 text-green-700",
  completed:            "bg-emerald-100 text-emerald-700",
  rejected:             "bg-red-100 text-red-700",
  verified:             "bg-emerald-100 text-emerald-700",
};

function statusLabel(s: string) {
  return s.split("-").map((w) => w.charAt(0).toUpperCase() + w.slice(1)).join(" ");
}

export default function JobStatsWidget() {
  const { data: stats, isLoading: statsLoading, refetch: refetchStats } = useGetJobStatsQuery();

  const [tab, setTab] = useState<"all" | "active" | "delivered" | "completed">("all");

  // Fetch logs per tab using server-side filtering
  const { data: allData,       isLoading: allLoading,       refetch: refetchAll }       = useGetJobsQuery({ limit: 10 },                                          { skip: tab !== "all" });
  const { data: activeData,    isLoading: activeLoading,    refetch: refetchActive }    = useGetJobsQuery({ limit: 10, status: "confirmed" as any },               { skip: tab !== "active" });
  const { data: deliveredData, isLoading: deliveredLoading, refetch: refetchDelivered } = useGetJobsQuery({ limit: 10, status: "delivered" as any },               { skip: tab !== "delivered" });
  const { data: completedData, isLoading: completedLoading, refetch: refetchCompleted } = useGetJobsQuery({ limit: 10, status: "completed" as any },               { skip: tab !== "completed" });

  const logsMap = { all: allData, active: activeData, delivered: deliveredData, completed: completedData };
  const loadingMap = { all: allLoading, active: activeLoading, delivered: deliveredLoading, completed: completedLoading };
  const refetchMap = { all: refetchAll, active: refetchActive, delivered: refetchDelivered, completed: refetchCompleted };

  const currentData = logsMap[tab];
  const logsLoading = loadingMap[tab];
  const logs = currentData?.jobs ?? [];
  const logsTotal = currentData?.total ?? 0;

  const kpis = [
    {
      label: "Total Jobs",
      value: statsLoading ? "…" : String(stats?.totalJobs ?? 0),
      icon: HiOutlineClipboardList,
      color: "text-violet-600",
      bg: "bg-violet-50",
      border: "border-violet-200",
      tab: "all" as const,
    },
    {
      label: "Active",
      value: statsLoading ? "…" : String(stats?.inProgress ?? 0),
      icon: HiOutlinePlay,
      color: "text-blue-600",
      bg: "bg-blue-50",
      border: "border-blue-200",
      tab: "active" as const,
    },
    {
      label: "Delivered",
      value: statsLoading ? "…" : String(stats?.delayed ?? 0),
      icon: HiOutlineTruck,
      color: "text-orange-600",
      bg: "bg-orange-50",
      border: "border-orange-200",
      tab: "delivered" as const,
    },
    {
      label: "Completed",
      value: statsLoading ? "…" : String(stats?.completedToday ?? 0),
      icon: HiOutlineCheckCircle,
      color: "text-emerald-600",
      bg: "bg-emerald-50",
      border: "border-emerald-200",
      tab: "completed" as const,
    },
  ];

  return (
    <Card>
      {/* Header */}
      <div className="flex items-center justify-between mb-4">
        <div className="flex items-center gap-2">
          <HiOutlineClipboardList className="w-5 h-5 text-primary-500" />
          <h2 className="font-bold text-secondary-100">Job Overview</h2>
        </div>
        <button
          onClick={() => { refetchStats(); refetchMap[tab](); }}
          className="p-1.5 rounded-lg border border-custom-300 hover:bg-custom-100 transition-colors"
          title="Refresh"
        >
          <HiOutlineRefresh className="w-4 h-4 text-custom-700" />
        </button>
      </div>

      {/* KPI Cards */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 mb-5">
        {kpis.map(({ label, value, icon: Icon, color, bg, border, tab: t }) => (
          <button
            key={label}
            onClick={() => setTab(t)}
            className={`rounded-xl border p-3 flex flex-col gap-1 text-left transition-all ${bg} ${border} ${tab === t ? "ring-2 ring-offset-1 ring-primary-400" : "hover:opacity-80"}`}
          >
            <div className="flex items-center justify-between">
              <span className="text-xs text-custom-700 font-medium">{label}</span>
              <Icon className={`w-4 h-4 ${color}`} />
            </div>
            <span className={`text-xl font-bold ${color}`}>{value}</span>
          </button>
        ))}
      </div>

      {/* Logs */}
      <div>
        <div className="flex items-center gap-2 mb-3">
          <HiOutlineClock className="w-4 h-4 text-custom-700" />
          <span className="text-sm font-semibold text-secondary-100">Recent Logs</span>
          <span className="ml-1 text-xs font-bold px-2 py-0.5 rounded-full bg-custom-100 text-custom-700">
            {logsLoading ? "…" : logsTotal}
          </span>
          <button
            onClick={() => refetchMap[tab]()}
            className="ml-auto p-1 rounded hover:bg-custom-100 transition-colors"
            title="Refresh logs"
          >
            <HiOutlineRefresh className={`w-3.5 h-3.5 text-custom-500 ${logsLoading ? "animate-spin" : ""}`} />
          </button>
        </div>

        {logsLoading ? (
          <div className="flex items-center justify-center py-6 gap-2 text-custom-700">
            <HiOutlineRefresh className="w-4 h-4 animate-spin" />
            <span className="text-sm">Loading…</span>
          </div>
        ) : logs.length === 0 ? (
          <p className="text-sm text-custom-700 text-center py-6">No jobs found</p>
        ) : (
          <div className="space-y-2">
            {logs.map((job) => (
              <div key={job.id} className="flex items-center justify-between py-2 border-b border-custom-100 last:border-0 gap-3">
                <div className="min-w-0">
                  <p className="text-sm font-semibold text-primary-500">{job.jobNumber}</p>
                  <p className="text-xs text-custom-700 truncate">{job.title} · {job.customer?.name ?? "—"}</p>
                </div>
                <div className="flex flex-col items-end gap-1 shrink-0">
                  <span className={`text-xs font-semibold px-2 py-0.5 rounded-full ${statusColor[job.status] ?? "bg-custom-100 text-custom-700"}`}>
                    {statusLabel(job.status)}
                  </span>
                  <span className="text-xs text-custom-500">
                    {job.updatedAt ? new Date(job.updatedAt).toLocaleDateString() : "—"}
                  </span>
                </div>
              </div>
            ))}
            {logsTotal > 10 && (
              <p className="text-xs text-center text-custom-500 pt-1">Showing 10 of {logsTotal} — use Job Management for full list</p>
            )}
          </div>
        )}
      </div>
    </Card>
  );
}
