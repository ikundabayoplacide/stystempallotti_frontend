import { useState } from "react";
import {
  HiOutlineCalendar,
  HiOutlineExclamationCircle,
  HiOutlineEye,
  HiOutlineFilter,
  HiOutlinePencil,
  HiOutlineRefresh,
  HiOutlineSearch,
  HiOutlineTrash,
  HiOutlineX,
} from "react-icons/hi";
import { FaPlus } from "react-icons/fa";
import { DashboardLayout } from "../../components";
import { useAuth } from "../../context/AuthContext";
import CreateJobModal from "./CreateJobModal";
import EditJobModal from "./EditJobModal";
import { Button, Card } from "../../components/ui";
import { useGetJobsQuery } from "../../store/services/jobsService";
import type { Job, JobStatus, JobPriority } from "../../store/services/jobsService";
import { useGetDepartmentsQuery } from "../../store/services/departmentsService";
import JobDetailModal from "./JobDetailModal";

// ─── Helpers ──────────────────────────────────────────────────────────────────

const getDeadlineInfo = (dueDate?: string) => {
  if (!dueDate) return { text: "No deadline", color: "text-custom-700", bgColor: "bg-custom-100", isOverdue: false };
  const now = new Date();
  const deadlineDate = new Date(dueDate);
  const diffMs = deadlineDate.getTime() - now.getTime();
  const diffHours = Math.floor(diffMs / (1000 * 60 * 60));
  const diffDays = Math.floor(diffHours / 24);
  if (diffMs < 0) {
    const overdueDays = Math.abs(diffDays);
    const overdueHours = Math.abs(diffHours) % 24;
    return { text: overdueDays > 0 ? `${overdueDays}d overdue` : `${overdueHours}h overdue`, color: "text-red-600", bgColor: "bg-red-50", isOverdue: true };
  } else if (diffHours < 24) {
    return { text: `${diffHours}h left`, color: "text-orange-600", bgColor: "bg-orange-50", isOverdue: false };
  } else if (diffDays <= 3) {
    return { text: `${diffDays}d left`, color: "text-yellow-600", bgColor: "bg-yellow-50", isOverdue: false };
  }
  return { text: `${diffDays}d left`, color: "text-green-600", bgColor: "bg-green-50", isOverdue: false };
};

const statusColors: Record<string, string> = {
  pending: "bg-gray-100 text-gray-700",
  confirmed: "bg-blue-100 text-blue-700",
  "in-composition": "bg-purple-100 text-purple-700",
  "in-montage": "bg-indigo-100 text-indigo-700",
  "in-printing": "bg-cyan-100 text-cyan-700",
  "in-binding": "bg-teal-100 text-teal-700",
  "in-packaging": "bg-green-100 text-green-700",
  "quality-check": "bg-yellow-100 text-yellow-700",
  "ready-for-delivery": "bg-orange-100 text-orange-700",
  delivered: "bg-pink-100 text-pink-700",
  completed: "bg-emerald-100 text-emerald-700",
};

const priorityColors: Record<string, string> = {
  low: "bg-green-500 text-white",
  normal: "bg-yellow-500 text-white",
  high: "bg-orange-500 text-white",
  urgent: "bg-red-500 text-white",
};

// ─── Component ────────────────────────────────────────────────────────────────

export default function JobManagementPage() {
  const { userRole, userName } = useAuth();
  const [searchQuery, setSearchQuery]       = useState("");
  const [filterStatus, setFilterStatus]     = useState<JobStatus | "all">("all");
  const [filterPriority, setFilterPriority] = useState<JobPriority | "all">("all");
  const [showFilterModal, setShowFilterModal]   = useState(false);
  const [showCreateModal, setShowCreateModal]   = useState(false);
  const [selectedJobId, setSelectedJobId]       = useState<string | null>(null);
  const [editJobId, setEditJobId]               = useState<string | null>(null);
  const [page, setPage] = useState(1);
  const limit = 20;

  // Build query params — only send defined filters
  const queryParams = {
    page,
    limit,
    ...(searchQuery.trim()              && { search: searchQuery.trim() }),
    ...(filterStatus   !== "all"        && { status: filterStatus }),
    ...(filterPriority !== "all"        && { priority: filterPriority }),
  };

  const { data, isLoading, isFetching, isError, refetch } = useGetJobsQuery(queryParams);
  const { data: departments = [] } = useGetDepartmentsQuery();

  const jobs       = data?.jobs       ?? [];
  const total      = data?.total      ?? 0;
  const totalPages = data?.totalPages ?? 1;

  const activeFilterCount =
    (filterStatus   !== "all" ? 1 : 0) +
    (filterPriority !== "all" ? 1 : 0);

  // Stats derived from current page — for accurate totals the backend would
  // need separate count endpoints; for now we use what we have.
  const activeCount    = jobs.filter((j) => !["completed", "delivered"].includes(j.status)).length;
  const delayedCount   = jobs.filter((j) => getDeadlineInfo(j.dueDate).isOverdue && !["completed", "delivered"].includes(j.status)).length;
  const urgentCount    = jobs.filter((j) => j.priority === "urgent").length;
  const completedCount = jobs.filter((j) => j.status === "completed").length;

  return (
    <DashboardLayout userRole={userRole ?? "sales"} userName={userName ?? "Sales Officer"} notificationCount={0}>
      <div className="space-y-6 font-[family-name:var(--font-family-primary)]">

        {/* ── Header ──────────────────────────────────────────────────────── */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
          <div>
            <h1 className="text-2xl md:text-3xl font-bold text-secondary-100">Job Management</h1>
            <p className="text-sm text-custom-700 mt-1">View and manage all jobs across the system</p>
          </div>
          <Button onClick={() => setShowCreateModal(true)} className="self-start sm:self-auto">
            <FaPlus /> Create New Job
          </Button>
        </div>

        {/* ── Search & Filters ────────────────────────────────────────────── */}
        <div className="flex flex-col sm:flex-row gap-3">
          <div className="flex-1 relative">
            <HiOutlineSearch className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-custom-700" />
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => { setSearchQuery(e.target.value); setPage(1); }}
              placeholder="Search by job number, title, or client..."
              className="w-full pl-10 pr-4 py-2 rounded-xl border border-custom-300 focus:outline-none focus:border-primary-500"
            />
          </div>
          <button
            onClick={() => setShowFilterModal(true)}
            className="flex items-center gap-2 px-4 py-2 rounded-xl border border-custom-300 hover:bg-custom-100 transition-colors relative"
          >
            <HiOutlineFilter className="w-4 h-4" />
            <span className="text-sm font-semibold">Filters</span>
            {activeFilterCount > 0 && (
              <span className="absolute -top-1 -right-1 w-5 h-5 rounded-full bg-primary-500 text-white text-xs flex items-center justify-center font-bold">
                {activeFilterCount}
              </span>
            )}
          </button>
          <button
            onClick={() => refetch()}
            className="flex items-center gap-2 px-4 py-2 rounded-xl border border-custom-300 hover:bg-custom-100 transition-colors"
            title="Refresh"
          >
            <HiOutlineRefresh className={`w-4 h-4 ${isFetching ? "animate-spin" : ""}`} />
          </button>
        </div>

        {/* ── Stats ───────────────────────────────────────────────────────── */}
        <div className="grid grid-cols-2 sm:grid-cols-5 gap-4">
          <Card className="!p-4"><p className="text-xs text-custom-700 mb-1">Total Jobs</p><p className="text-2xl font-bold text-secondary-100">{total}</p></Card>
          <Card className="!p-4"><p className="text-xs text-custom-700 mb-1">Active</p><p className="text-2xl font-bold text-blue-600">{activeCount}</p></Card>
          <Card className="!p-4"><p className="text-xs text-custom-700 mb-1">Delayed</p><p className="text-2xl font-bold text-red-600">{delayedCount}</p></Card>
          <Card className="!p-4"><p className="text-xs text-custom-700 mb-1">Urgent</p><p className="text-2xl font-bold text-orange-600">{urgentCount}</p></Card>
          <Card className="!p-4"><p className="text-xs text-custom-700 mb-1">Completed</p><p className="text-2xl font-bold text-green-600">{completedCount}</p></Card>
        </div>

        {/* ── Table ───────────────────────────────────────────────────────── */}
        <Card className="!p-0 overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead className="bg-custom-100 border-b border-custom-300">
                <tr>
                  {["Job Number", "Title & Client", "Status", "Priority", "Amount", "Department", "Deadline", "Actions"].map((h) => (
                    <th key={h} className={`px-4 py-3 text-xs font-bold text-secondary-100 uppercase ${h === "Actions" ? "text-right" : "text-left"}`}>{h}</th>
                  ))}
                </tr>
              </thead>
              <tbody className="bg-white divide-y divide-custom-200">
                {isLoading ? (
                  <tr>
                    <td colSpan={7} className="px-4 py-12 text-center">
                      <div className="flex flex-col items-center gap-2 text-custom-700">
                        <HiOutlineRefresh className="w-6 h-6 animate-spin" />
                        <span className="text-sm">Loading jobs…</span>
                      </div>
                    </td>
                  </tr>
                ) : isError ? (
                  <tr>
                    <td colSpan={7} className="px-4 py-12 text-center">
                      <div className="flex flex-col items-center gap-3 text-red-600">
                        <p className="text-sm font-semibold">Failed to load jobs</p>
                        <Button size="sm" variant="outline" onClick={() => refetch()}>
                          <HiOutlineRefresh className="w-4 h-4" /> Retry
                        </Button>
                      </div>
                    </td>
                  </tr>
                ) : jobs.length === 0 ? (
                  <tr>
                    <td colSpan={7} className="px-4 py-12 text-center text-custom-700 text-sm">
                      No jobs found
                    </td>
                  </tr>
                ) : (
                  jobs.map((job: Job) => {
                    const deadlineInfo = getDeadlineInfo(job.dueDate);
                    return (
                      <tr
                        key={job.id}
                        className="hover:bg-custom-50 transition-colors cursor-pointer"
                        onClick={() => setSelectedJobId(job.id)}
                      >
                        <td className="px-4 py-4">
                          <span className="text-sm font-bold text-primary-600">{job.jobNumber}</span>
                        </td>
                        <td className="px-4 py-4">
                          <p className="text-sm font-semibold text-secondary-100">{job.title}</p>
                          <p className="text-xs text-custom-700">({job.customer?.name})</p>
                        </td>
                        <td className="px-4 py-4">
                          <span className={`px-3 py-1 rounded-full text-xs font-semibold ${statusColors[job.status] || "bg-gray-100 text-gray-700"}`}>
                            {job.status}
                          </span>
                        </td>
                        <td className="px-4 py-4">
                          <span className={`px-3 py-1 rounded-full text-xs font-bold ${priorityColors[job.priority] || "bg-gray-500 text-white"}`}>
                            {job.priority}
                          </span>
                        </td>
                        <td className="px-4 py-4">
                          {job.amount != null ? (
                            <span className="text-sm font-semibold text-secondary-100">
                              {job.amount.toLocaleString()} <span className="text-xs font-normal text-custom-700">RWF</span>
                            </span>
                          ) : (
                            <span className="text-xs text-custom-400">—</span>
                          )}
                        </td>
                        <td className="px-4 py-4">
                          <span className="text-sm text-secondary-100">
                            {job.departmentAssignedToId
                              ? (departments.find((d) => d.id === job.departmentAssignedToId)?.name ?? "-")
                              : "-"}
                          </span>
                        </td>
                        <td className="px-4 py-4">
                          {job.dueDate ? (
                            <div className="space-y-1">
                              <div className="flex items-center gap-1 text-sm text-custom-700">
                                <HiOutlineCalendar className="w-4 h-4" />
                                {job.dueDate.split("T")[0]}
                              </div>
                              <div className={`inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-xs font-semibold ${deadlineInfo.color} ${deadlineInfo.bgColor}`}>
                                {deadlineInfo.isOverdue && <HiOutlineExclamationCircle className="w-3 h-3" />}
                                {deadlineInfo.text}
                              </div>
                            </div>
                          ) : (
                            <span className="text-xs text-custom-700">—</span>
                          )}
                        </td>
                        <td className="px-4 py-4">
                          <div className="flex items-center justify-end gap-2" onClick={(e) => e.stopPropagation()}>
                            <button
                              className="p-2 rounded-lg border border-custom-300 hover:bg-custom-100 transition-colors"
                              title="View Details"
                              onClick={() => setSelectedJobId(job.id)}
                            >
                              <HiOutlineEye className="w-4 h-4 text-custom-700" />
                            </button>
                            <button
                              className="p-2 rounded-lg border border-custom-300 hover:bg-custom-100 transition-colors"
                              title="Edit Job"
                              onClick={() => setEditJobId(job.id)}
                            >
                              <HiOutlinePencil className="w-4 h-4 text-custom-700" />
                            </button>
                            <button className="p-2 rounded-lg border border-red-300 hover:bg-red-50 transition-colors" title="Delete Job">
                              <HiOutlineTrash className="w-4 h-4 text-red-600" />
                            </button>
                          </div>
                        </td>
                      </tr>
                    );
                  })
                )}
              </tbody>
            </table>
          </div>

          {/* ── Pagination ──────────────────────────────────────────────── */}
          {totalPages > 1 && (
            <div className="flex items-center justify-between px-4 py-3 border-t border-custom-300">
              <p className="text-xs text-custom-700">
                Page {page} of {totalPages} · {total} total jobs
              </p>
              <div className="flex gap-2">
                <Button
                  size="sm"
                  variant="outline"
                  disabled={page <= 1}
                  onClick={() => setPage((p) => p - 1)}
                >
                  Previous
                </Button>
                <Button
                  size="sm"
                  variant="outline"
                  disabled={page >= totalPages}
                  onClick={() => setPage((p) => p + 1)}
                >
                  Next
                </Button>
              </div>
            </div>
          )}
        </Card>

        {/* ── Filter Modal ─────────────────────────────────────────────────── */}
        {showFilterModal && (
          <div className="fixed inset-0 bg-secondary-100/50 z-50 flex items-center justify-center p-4">
            <Card className="!p-6 max-w-md w-full">
              <div className="flex items-center justify-between mb-4">
                <h3 className="text-xl font-bold text-secondary-100">Filter Jobs</h3>
                <button onClick={() => setShowFilterModal(false)} className="text-custom-700 hover:text-secondary-100">
                  <HiOutlineX className="w-6 h-6" />
                </button>
              </div>
              <div className="space-y-4">
                <div>
                  <label className="block text-sm font-semibold text-custom-700 mb-2">Status</label>
                  <select
                    value={filterStatus}
                    onChange={(e) => { setFilterStatus(e.target.value as JobStatus | "all"); setPage(1); }}
                    className="w-full px-4 py-2 rounded-xl border border-custom-300 focus:outline-none focus:border-primary-500"
                  >
                    {[["all","All Statuses"],["pending","Pending"],["confirmed","Confirmed"],["in-composition","In Composition"],["in-montage","In Montage"],["in-printing","In Printing"],["in-binding","In Binding"],["in-packaging","In Packaging"],["quality-check","Quality Check"],["ready-for-delivery","Ready for Delivery"],["delivered","Delivered"],["completed","Completed"]].map(([v,l]) => (
                      <option key={v} value={v}>{l}</option>
                    ))}
                  </select>
                </div>
                <div>
                  <label className="block text-sm font-semibold text-custom-700 mb-2">Priority</label>
                  <select
                    value={filterPriority}
                    onChange={(e) => { setFilterPriority(e.target.value as JobPriority | "all"); setPage(1); }}
                    className="w-full px-4 py-2 rounded-xl border border-custom-300 focus:outline-none focus:border-primary-500"
                  >
                    {[["all","All Priorities"],["low","Low"],["normal","Normal"],["high","High"],["urgent","Urgent"]].map(([v,l]) => (
                      <option key={v} value={v}>{l}</option>
                    ))}
                  </select>
                </div>
              </div>
              <div className="flex gap-3 mt-6">
                <Button
                  variant="outline"
                  onClick={() => { setFilterStatus("all"); setFilterPriority("all"); setPage(1); }}
                  fullWidth
                >
                  Reset
                </Button>
                <Button onClick={() => setShowFilterModal(false)} fullWidth>
                  Apply Filters
                </Button>
              </div>
            </Card>
          </div>
        )}

        {/* ── Create Job Modal ─────────────────────────────────────────────── */}
        {showCreateModal && (
          <CreateJobModal
            onClose={() => setShowCreateModal(false)}
            onCreated={() => {
              setShowCreateModal(false);
              refetch();
            }}
          />
        )}

        {/* ── Job Detail Modal ─────────────────────────────────────────────── */}
        {selectedJobId && (
          <JobDetailModal
            jobId={selectedJobId}
            onClose={() => setSelectedJobId(null)}
            onAssigned={() => {
              setSelectedJobId(null);
              refetch();
            }}
          />
        )}

        {/* ── Edit Job Modal ───────────────────────────────────────────────── */}
        {editJobId && (
          <EditJobModal
            jobId={editJobId}
            onClose={() => setEditJobId(null)}
            onUpdated={() => {
              setEditJobId(null);
              refetch();
            }}
          />
        )}
      </div>
    </DashboardLayout>
  );
}
