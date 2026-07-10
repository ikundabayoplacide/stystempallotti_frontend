import { useState } from "react";
import {
  HiOutlineCalendar,
  HiOutlineRefresh,
  HiOutlineX,
  HiOutlineCheckCircle,
  HiOutlineExclamationCircle,
  HiOutlineClock,
  HiOutlineDocumentText,
  HiOutlineSearch,
  HiOutlineUser,
  HiOutlineEye,
  HiOutlineUsers,
} from "react-icons/hi";
import { toast } from "react-toastify";
import { DashboardLayout } from "../../components";
import { Card } from "../../components/ui";
import {
  useGetDepartmentLeavesQuery,
  type LeaveRequest,
  type LeaveStatus,
} from "../../store/services/leaveService";
import {
  useGetMyLeavesQuery,
  useCreateLeaveMutation,
  useCancelLeaveMutation,
  useUploadLeaveDocumentMutation,
  type LeaveType,
} from "../../store/services/leaveService";

// ─── Helpers ──────────────────────────────────────────────────────────────────

const LEAVE_TYPE_LABELS: Record<string, string> = {
  ANNUAL: "Annual", SICK: "Sick", MATERNITY: "Maternity",
  PATERNITY: "Paternity", EMERGENCY: "Emergency", UNPAID: "Unpaid", OTHER: "Other",
};

const statusStyle: Record<string, string> = {
  PENDING: "bg-yellow-100 text-yellow-700",
  APPROVED: "bg-emerald-100 text-emerald-700",
  REJECTED: "bg-red-100 text-red-700",
};

const statusIcon = {
  PENDING: <HiOutlineClock className="w-3.5 h-3.5" />,
  APPROVED: <HiOutlineCheckCircle className="w-3.5 h-3.5" />,
  REJECTED: <HiOutlineExclamationCircle className="w-3.5 h-3.5" />,
};

function daysBetween(start: string, end: string) {
  return Math.max(1, Math.round((new Date(end).getTime() - new Date(start).getTime()) / (1000 * 60 * 60 * 24)) + 1);
}

function formatDuration(startDate: string, startTime: string, endDate: string, endTime: string) {
  const from = new Date(`${startDate}T${startTime || "00:00"}`);
  const to   = new Date(`${endDate}T${endTime   || "23:59"}`);
  const totalMins = Math.max(0, Math.round((to.getTime() - from.getTime()) / 60000));
  const days  = Math.floor(totalMins / (60 * 24));
  const hours = Math.floor((totalMins % (60 * 24)) / 60);
  const mins  = totalMins % 60;
  const parts: string[] = [];
  if (days)  parts.push(`${days}d`);
  if (hours) parts.push(`${hours}h`);
  if (mins)  parts.push(`${mins}m`);
  return parts.length ? parts.join(' ') : '0m';
}

function daysRemaining(endDate: string): number {
  const today = new Date(); today.setHours(0, 0, 0, 0);
  const end = new Date(endDate); end.setHours(0, 0, 0, 0);
  return Math.round((end.getTime() - today.getTime()) / (1000 * 60 * 60 * 24));
}

function formatDate(d: string) {
  return new Date(d).toLocaleDateString("en-GB", { day: "2-digit", month: "short", year: "numeric" });
}

const PAGE_SIZE = 8;

function Pagination({ page, total, pageSize, onChange }: { page: number; total: number; pageSize: number; onChange: (p: number) => void }) {
  const totalPages = Math.ceil(total / pageSize);
  if (totalPages <= 1) return null;
  return (
    <div className="flex items-center justify-between pt-3 border-t border-custom-200">
      <p className="text-xs text-custom-700">
        Showing {Math.min((page - 1) * pageSize + 1, total)}–{Math.min(page * pageSize, total)} of {total}
      </p>
      <div className="flex items-center gap-1">
        <button onClick={() => onChange(page - 1)} disabled={page === 1}
          className="px-2.5 py-1.5 rounded-lg border border-custom-300 text-xs font-semibold text-custom-700 hover:bg-custom-100 disabled:opacity-40 transition-colors">←</button>
        {Array.from({ length: totalPages }, (_, i) => i + 1).map((p) => (
          <button key={p} onClick={() => onChange(p)}
            className={`px-2.5 py-1.5 rounded-lg text-xs font-semibold transition-colors ${p === page ? "bg-primary-500 text-white" : "border border-custom-300 text-custom-700 hover:bg-custom-100"}`}>{p}</button>
        ))}
        <button onClick={() => onChange(page + 1)} disabled={page === totalPages}
          className="px-2.5 py-1.5 rounded-lg border border-custom-300 text-xs font-semibold text-custom-700 hover:bg-custom-100 disabled:opacity-40 transition-colors">→</button>
      </div>
    </div>
  );
}

// ─── Detail Modal ─────────────────────────────────────────────────────────────

function LeaveDetailModal({ leave, onClose }: {
  leave: LeaveRequest; onClose: () => void;
}) {
  return (
    <div className="fixed inset-0 bg-secondary-100/50 z-50 flex items-start justify-center p-4 overflow-y-auto">
      <Card className="!p-6 max-w-md w-full my-8">
        <div className="flex items-center justify-between mb-5">
          <h3 className="text-xl font-bold text-secondary-100">Leave Request Details</h3>
          <button onClick={onClose} className="text-custom-700 hover:text-secondary-100"><HiOutlineX className="w-6 h-6" /></button>
        </div>
        <div className="space-y-3">
          <div className="flex items-center gap-3">
            <div className="w-9 h-9 rounded-full bg-primary-100 flex items-center justify-center shrink-0">
              <HiOutlineUser className="w-4 h-4 text-primary-600" />
            </div>
            <div>
              <p className="font-semibold text-secondary-100 text-sm">{leave.user?.name ?? "Unknown"}</p>
              <p className="text-xs text-custom-700 capitalize">{leave.user?.role?.replace("_", " ").toLowerCase() ?? "—"}</p>
            </div>
          </div>
          {[
            { label: "Leave Type", value: LEAVE_TYPE_LABELS[leave.type] ?? leave.type },
            { label: "Start Date", value: formatDate(leave.startDate) },
            { label: "End Date", value: formatDate(leave.endDate) },
            { label: "Duration", value: `${daysBetween(leave.startDate, leave.endDate)} day(s)` },
            { label: "Submitted", value: formatDate(leave.createdAt) },
          ].map(({ label, value }) => (
            <div key={label} className="flex items-center justify-between">
              <span className="text-sm text-custom-700">{label}</span>
              <span className="text-sm font-semibold text-secondary-100">{value}</span>
            </div>
          ))}
          <div className="flex items-center justify-between">
            <span className="text-sm text-custom-700">Status</span>
            <span className={`inline-flex items-center gap-1 text-xs font-bold px-2 py-0.5 rounded-full ${statusStyle[leave.status]}`}>
              {statusIcon[leave.status]}{leave.status}
            </span>
          </div>
          <div>
            <p className="text-sm text-custom-700 mb-1">Reason</p>
            <p className="text-sm text-secondary-100 bg-custom-50 rounded-xl p-3">{leave.reason}</p>
          </div>
          {leave.status === "REJECTED" && leave.rejectionReason && (
            <div className="rounded-xl bg-red-50 border border-red-200 p-3">
              <p className="text-xs font-bold text-red-600 mb-1">Rejection Reason</p>
              <p className="text-sm text-red-700">{leave.rejectionReason}</p>
            </div>
          )}
          {leave.documentUrl && (
            <a href={leave.documentUrl} download
              className="flex items-center gap-2 text-sm text-primary-600 hover:underline font-semibold">
              <HiOutlineDocumentText className="w-4 h-4" /> View Supporting Document
            </a>
          )}
          {leave.reviewedBy && leave.reviewedAt && (
            <div className="pt-3 border-t border-custom-200">
              <p className="text-xs text-custom-700">
                Reviewed by <span className="font-semibold text-secondary-100">{leave.reviewedBy.name}</span> on {formatDate(leave.reviewedAt)}
              </p>
            </div>
          )}
        </div>
        <div className="mt-5 flex justify-end">
          <button onClick={onClose}
            className="px-4 py-2 rounded-xl border border-custom-300 text-sm font-semibold text-secondary-100 hover:bg-custom-100 transition-colors">Close</button>
        </div>
      </Card>
    </div>
  );
}

// ─── Workers Leave Tab ────────────────────────────────────────────────────────

function WorkersLeaveTab() {
  const [statusFilter, setStatusFilter] = useState<"" | LeaveStatus>("");
  const [search, setSearch] = useState("");
  const [detailLeave, setDetailLeave] = useState<LeaveRequest | null>(null);
  const [page, setPage] = useState(1);

  const { data, isLoading, refetch } = useGetDepartmentLeavesQuery({
    limit: 100,
    ...(statusFilter ? { status: statusFilter } : {}),
  });

  const allLeaves = data?.data ?? [];
  const leaves = allLeaves.filter((l) => {
    const q = search.trim().toLowerCase();
    return !q || (l.user?.name ?? "").toLowerCase().includes(q);
  });
  const pagedLeaves = leaves.slice((page - 1) * PAGE_SIZE, page * PAGE_SIZE);

  const pendingCount  = allLeaves.filter((l) => l.status === "PENDING").length;
  const approvedCount = allLeaves.filter((l) => l.status === "APPROVED").length;
  const rejectedCount = allLeaves.filter((l) => l.status === "REJECTED").length;

  return (
    <div className="space-y-6">
      {/* Summary */}
      <div className="grid grid-cols-3 gap-4">
        <Card className="!p-4 text-center">
          <p className="text-xs text-custom-700 mb-1">Pending</p>
          <p className="text-2xl font-bold text-yellow-600">{isLoading ? "—" : pendingCount}</p>
        </Card>
        <Card className="!p-4 text-center">
          <p className="text-xs text-custom-700 mb-1">Approved</p>
          <p className="text-2xl font-bold text-emerald-600">{isLoading ? "—" : approvedCount}</p>
        </Card>
        <Card className="!p-4 text-center">
          <p className="text-xs text-custom-700 mb-1">Rejected</p>
          <p className="text-2xl font-bold text-red-600">{isLoading ? "—" : rejectedCount}</p>
        </Card>
      </div>

      {/* Filters */}
      <div className="flex items-center gap-3 flex-wrap">
        <div className="relative flex-1 min-w-[200px]">
          <HiOutlineSearch className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-custom-700" />
          <input type="text" value={search} onChange={(e) => { setSearch(e.target.value); setPage(1); }}
            placeholder="Search by worker name..."
            className="w-full pl-9 pr-4 py-2 rounded-xl border border-custom-300 bg-style-500 text-secondary-100 text-sm placeholder:text-custom-700 focus:outline-none focus:border-primary-400 transition-colors" />
        </div>
        <div className="flex gap-2 flex-wrap">
          {(["", "PENDING", "APPROVED", "REJECTED"] as const).map((s) => (
            <button key={s} onClick={() => { setStatusFilter(s); setPage(1); }}
              className={`px-3 py-1.5 rounded-lg text-sm font-semibold transition-colors ${statusFilter === s ? "bg-primary-500 text-white" : "border border-custom-300 text-custom-700 hover:bg-custom-100"}`}>
              {s === "" ? "All" : s.charAt(0) + s.slice(1).toLowerCase()}
            </button>
          ))}
        </div>
        <button onClick={() => refetch()} className="p-2 rounded-xl border border-custom-300 hover:bg-custom-100 transition-colors text-custom-700" title="Refresh">
          <HiOutlineRefresh className={`w-4 h-4 ${isLoading ? "animate-spin" : ""}`} />
        </button>
      </div>

      {/* Table */}
      {isLoading ? (
        <div className="space-y-2">
          {Array.from({ length: 5 }).map((_, i) => (
            <Card key={i} className="!p-4 animate-pulse">
              <div className="h-4 w-1/3 bg-custom-200 rounded mb-2" />
              <div className="h-3 w-full bg-custom-200 rounded" />
            </Card>
          ))}
        </div>
      ) : leaves.length === 0 ? (
        <Card className="!p-10 text-center">
          <HiOutlineCalendar className="w-10 h-10 text-custom-400 mx-auto mb-3" />
          <p className="font-semibold text-secondary-100">No leave requests found</p>
          <p className="text-sm text-custom-700 mt-1">
            {statusFilter ? `No ${statusFilter.toLowerCase()} requests` : "No workers in your department have submitted leave requests"}
          </p>
        </Card>
      ) : (
        <Card className="!p-0 overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead className="bg-custom-50">
                <tr>
                  {["Worker", "Type", "Period", "Duration", "Days Remaining", "Submitted", "Status", "Actions"].map((h) => (
                    <th key={h} className="px-4 py-3 text-left text-xs font-bold text-custom-500 uppercase tracking-wider whitespace-nowrap">{h}</th>
                  ))}
                </tr>
              </thead>
              <tbody className="divide-y divide-custom-100">
                {pagedLeaves.map((leave) => (
                  <tr key={leave.id} className="hover:bg-custom-50 transition-colors">
                    <td className="px-4 py-3">
                      <div className="flex items-center gap-2">
                        <div className="w-7 h-7 rounded-full bg-primary-100 flex items-center justify-center shrink-0">
                          <span className="text-xs font-bold text-primary-600">{(leave.user?.name ?? "?").charAt(0).toUpperCase()}</span>
                        </div>
                        <div>
                          <p className="font-semibold text-secondary-100">{leave.user?.name ?? "—"}</p>
                          <p className="text-xs text-custom-700 capitalize">{leave.user?.role?.replace("_", " ").toLowerCase() ?? "—"}</p>
                        </div>
                      </div>
                    </td>
                    <td className="px-4 py-3 font-medium text-secondary-100 whitespace-nowrap">{LEAVE_TYPE_LABELS[leave.type] ?? leave.type}</td>
                    <td className="px-4 py-3 text-custom-700 whitespace-nowrap">{formatDate(leave.startDate)} — {formatDate(leave.endDate)}</td>
                    <td className="px-4 py-3 text-custom-700 whitespace-nowrap">{daysBetween(leave.startDate, leave.endDate)}d</td>
                    <td className="px-4 py-3 whitespace-nowrap">
                      {leave.status === "APPROVED" ? (() => {
                        const rem = daysRemaining(leave.endDate);
                        const today = new Date(); today.setHours(0,0,0,0);
                        const start = new Date(leave.startDate); start.setHours(0,0,0,0);
                        if (rem < 0) return <span className="text-xs text-custom-400 font-medium">Ended</span>;
                        if (today < start) return <span className="text-xs text-blue-600 font-semibold bg-blue-50 px-2 py-0.5 rounded-full">End in {Math.round((start.getTime()-today.getTime())/(1000*60*60*24))}d</span>;
                        if (rem === 0) return <span className="text-xs text-orange-600 font-semibold bg-orange-50 px-2 py-0.5 rounded-full">Last day</span>;
                        return <span className="text-xs text-emerald-600 font-semibold bg-emerald-50 px-2 py-0.5 rounded-full">{rem}d left</span>;
                      })() : <span className="text-xs text-custom-300">—</span>}
                    </td>
                    <td className="px-4 py-3 text-custom-700 whitespace-nowrap">{formatDate(leave.createdAt)}</td>
                    <td className="px-4 py-3 whitespace-nowrap">
                      <span className={`inline-flex items-center gap-1 text-xs font-bold px-2 py-0.5 rounded-full ${statusStyle[leave.status]}`}>
                        {statusIcon[leave.status]}{leave.status}
                      </span>
                    </td>
                    <td className="px-4 py-3 whitespace-nowrap">
                      <button onClick={() => setDetailLeave(leave)} className="p-1.5 rounded-lg text-primary-600 hover:bg-primary-50 transition-colors" title="View details">
                        <HiOutlineEye className="w-4 h-4" />
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
          <div className="px-4 py-3">
            <Pagination page={page} total={leaves.length} pageSize={PAGE_SIZE} onChange={setPage} />
          </div>
        </Card>
      )}

      {detailLeave && (
        <LeaveDetailModal leave={detailLeave} onClose={() => setDetailLeave(null)} />
      )}
    </div>
  );
}

// ─── My Leave Tab (own requests) ────────────────────────────────────────────

const LEAVE_TYPE_LABELS_FULL: { value: string; label: string }[] = [
  { value: "ANNUAL", label: "Annual Leave" }, { value: "SICK", label: "Sick Leave" },
  { value: "MATERNITY", label: "Maternity Leave" }, { value: "PATERNITY", label: "Paternity Leave" },
  { value: "EMERGENCY", label: "Emergency Leave" }, { value: "UNPAID", label: "Unpaid Leave" },
  { value: "OTHER", label: "Other" },
];

function resolveTypeLabel(value: string) {
  return LEAVE_TYPE_LABELS_FULL.find((t) => t.value === value)?.label ?? value;
}

function MyLeaveTab() {
  const [showModal, setShowModal] = useState(false);
  const [statusFilter, setStatusFilter] = useState<"" | "PENDING" | "APPROVED" | "REJECTED">("");
  const [page, setPage] = useState(1);

  const { data, isLoading, refetch } = useGetMyLeavesQuery({ limit: 50, ...(statusFilter ? { status: statusFilter } : {}) });
  const [cancelLeave, { isLoading: cancelling }] = useCancelLeaveMutation();

  const leaves = data?.data ?? [];
  const pagedLeaves = leaves.slice((page - 1) * PAGE_SIZE, page * PAGE_SIZE);

  const handleCancel = async (id: string) => {
    if (!window.confirm("Cancel this leave request?")) return;
    try { await cancelLeave(id).unwrap(); toast.success("Leave request cancelled"); }
    catch (err: any) { toast.error(err?.data?.message ?? "Failed to cancel"); }
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between gap-4 flex-wrap">
        <div className="flex gap-2 flex-wrap">
          {(["", "PENDING", "APPROVED", "REJECTED"] as const).map((s) => (
            <button key={s} onClick={() => { setStatusFilter(s); setPage(1); }}
              className={`px-3 py-1.5 rounded-lg text-sm font-semibold transition-colors ${statusFilter === s ? "bg-primary-500 text-white" : "border border-custom-300 text-custom-700 hover:bg-custom-100"}`}>
              {s === "" ? "All" : s.charAt(0) + s.slice(1).toLowerCase()}
            </button>
          ))}
        </div>
        <div className="flex items-center gap-2">
          <button onClick={() => refetch()} className="p-2 rounded-xl border border-custom-300 hover:bg-custom-100 transition-colors text-custom-700">
            <HiOutlineRefresh className={`w-4 h-4 ${isLoading ? "animate-spin" : ""}`} />
          </button>
          <button onClick={() => setShowModal(true)}
            className="flex items-center gap-2 px-4 py-2 rounded-xl bg-primary-500 text-white text-sm font-semibold hover:bg-primary-600 transition-colors">
            + Request Leave
          </button>
        </div>
      </div>

      <div className="grid grid-cols-3 gap-4">
        {(["PENDING", "APPROVED", "REJECTED"] as const).map((s) => (
          <Card key={s} className="!p-4 text-center">
            <p className="text-xs text-custom-700 mb-1">{s.charAt(0) + s.slice(1).toLowerCase()}</p>
            <p className={`text-2xl font-bold ${s === "PENDING" ? "text-yellow-600" : s === "APPROVED" ? "text-emerald-600" : "text-red-600"}`}>
              {isLoading ? "—" : leaves.filter((l) => l.status === s).length}
            </p>
          </Card>
        ))}
      </div>

      {isLoading ? (
        <div className="space-y-3">{Array.from({ length: 3 }).map((_, i) => <Card key={i} className="!p-4 animate-pulse"><div className="h-4 w-1/3 bg-custom-200 rounded mb-2" /><div className="h-3 w-full bg-custom-200 rounded" /></Card>)}</div>
      ) : leaves.length === 0 ? (
        <Card className="!p-10 text-center">
          <HiOutlineCalendar className="w-10 h-10 text-custom-400 mx-auto mb-3" />
          <p className="text-secondary-100 font-semibold">No leave requests found</p>
          <p className="text-sm text-custom-700 mt-1 mb-4">{statusFilter ? `No ${statusFilter.toLowerCase()} requests` : "You haven't requested any leave yet"}</p>
          <button onClick={() => setShowModal(true)} className="px-4 py-2 rounded-xl bg-primary-500 text-white text-sm font-semibold hover:bg-primary-600 transition-colors">Request Leave</button>
        </Card>
      ) : (
        <div className="space-y-3">
          {pagedLeaves.map((leave) => (
            <Card key={leave.id} className="!p-0 overflow-hidden">
              <div className="flex items-center justify-between px-4 py-3 bg-custom-50 border-b border-custom-200">
                <div className="flex items-center gap-2">
                  <span className="text-sm font-bold text-secondary-100">{resolveTypeLabel(leave.type)}</span>
                  <span className={`inline-flex items-center gap-1 text-xs font-bold px-2 py-0.5 rounded-full ${statusStyle[leave.status]}`}>
                    {statusIcon[leave.status]}{leave.status}
                  </span>
                </div>
                <span className="text-xs text-custom-700">{formatDate(leave.createdAt)}</span>
              </div>
              <div className="px-4 py-3 space-y-1">
                <p className="text-sm text-custom-700">
                  <span className="font-semibold text-secondary-100">{formatDate(leave.startDate)}</span>
                  {" → "}
                  <span className="font-semibold text-secondary-100">{formatDate(leave.endDate)}</span>
                  <span className="ml-2 text-xs text-primary-600 font-semibold bg-primary-50 px-2 py-0.5 rounded-full">{daysBetween(leave.startDate, leave.endDate)} day(s)</span>
                </p>
                <p className="text-sm text-custom-700 line-clamp-2">{leave.reason}</p>
                {leave.status === "REJECTED" && leave.rejectionReason && (
                  <div className="rounded-lg bg-red-50 border border-red-100 px-3 py-2">
                    <p className="text-xs font-bold text-red-600">Rejection reason:</p>
                    <p className="text-xs text-red-700 mt-0.5">{leave.rejectionReason}</p>
                  </div>
                )}
              </div>
              {leave.status === "PENDING" && (
                <div className="px-4 py-2.5 border-t border-custom-100 flex justify-end">
                  <button onClick={() => handleCancel(leave.id)} disabled={cancelling}
                    className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-semibold text-red-600 border border-red-200 hover:bg-red-50 disabled:opacity-40 transition-colors">
                    Cancel
                  </button>
                </div>
              )}
            </Card>
          ))}
          <Pagination page={page} total={leaves.length} pageSize={PAGE_SIZE} onChange={setPage} />
        </div>
      )}

      {showModal && <RequestLeaveModal onClose={() => setShowModal(false)} onSuccess={() => { setShowModal(false); refetch(); }} />}
    </div>
  );
}

const timeCls = "w-full px-3 py-2.5 rounded-xl border border-custom-300 bg-style-500 text-secondary-100 text-sm focus:outline-none focus:border-primary-400 transition-colors";

function RequestLeaveModal({ onClose, onSuccess }: { onClose: () => void; onSuccess: () => void }) {
  const [type, setType] = useState<string>("ANNUAL");
  const [startDate, setStartDate] = useState("");
  const [startTime, setStartTime] = useState("08:00");
  const [endDate, setEndDate] = useState("");
  const [endTime, setEndTime] = useState("17:00");
  const [reason, setReason] = useState("");
  const [docFile, setDocFile] = useState<File | null>(null);
  const [uploading, setUploading] = useState(false);
  const [createLeave, { isLoading }] = useCreateLeaveMutation();
  const [uploadDoc] = useUploadLeaveDocumentMutation();
  const _n = new Date(); const today = `${_n.getFullYear()}-${String(_n.getMonth()+1).padStart(2,"0")}-${String(_n.getDate()).padStart(2,"0")}`;

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!startDate || !endDate) { toast.error("Please select start and end dates"); return; }
    if (new Date(endDate) < new Date(startDate)) { toast.error("End date must be after start date"); return; }
    if (!reason.trim()) { toast.error("Please provide a reason"); return; }
    try {
      let documentUrl: string | undefined;
      if (docFile) {
        setUploading(true);
        const fd = new FormData(); fd.append("document", docFile);
        const res = await uploadDoc(fd).unwrap();
        documentUrl = res.data.url;
        setUploading(false);
      }
      await createLeave({ type: type as LeaveType, startDate, startTime, endDate, endTime, reason: reason.trim(), documentUrl }).unwrap();
      toast.success("Leave request submitted successfully");
      onSuccess();
    } catch (err: any) { setUploading(false); toast.error(err?.data?.message ?? "Failed to submit leave request"); }
  };

  return (
    <div className="fixed inset-0 bg-secondary-100/50 z-50 flex items-start justify-center p-4 overflow-y-auto">
      <Card className="!p-6 max-w-lg w-full my-8">
        <div className="flex items-center justify-between mb-5">
          <h3 className="text-xl font-bold text-secondary-100">Request Leave</h3>
          <button onClick={onClose} className="text-custom-700 hover:text-secondary-100"><HiOutlineX className="w-6 h-6" /></button>
        </div>
        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label className="block text-sm font-semibold text-secondary-100 mb-1.5">Leave Type *</label>
            <select value={type} onChange={(e) => setType(e.target.value)} className={timeCls}>
              {LEAVE_TYPE_LABELS_FULL.map((t) => <option key={t.value} value={t.value}>{t.label}</option>)}
            </select>
          </div>
          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="block text-sm font-semibold text-secondary-100 mb-1.5">Start Date *</label>
              <input type="date" value={startDate} min={today} onChange={(e) => setStartDate(e.target.value)} className={timeCls} />
            </div>
            <div>
              <label className="block text-sm font-semibold text-secondary-100 mb-1.5">Start Time *</label>
              <input type="time" value={startTime} onChange={(e) => setStartTime(e.target.value)} className={timeCls} />
            </div>
          </div>
          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="block text-sm font-semibold text-secondary-100 mb-1.5">End Date *</label>
              <input type="date" value={endDate} min={startDate || today} onChange={(e) => setEndDate(e.target.value)} className={timeCls} />
            </div>
            <div>
              <label className="block text-sm font-semibold text-secondary-100 mb-1.5">End Time *</label>
              <input type="time" value={endTime} onChange={(e) => setEndTime(e.target.value)} className={timeCls} />
            </div>
          </div>
          {startDate && endDate && new Date(endDate) >= new Date(startDate) && (
            <p className="text-xs text-primary-600 font-semibold">Duration: {formatDuration(startDate, startTime, endDate, endTime)}</p>
          )}
          <div>
            <label className="block text-sm font-semibold text-secondary-100 mb-1.5">Reason *</label>
            <textarea value={reason} onChange={(e) => setReason(e.target.value)} placeholder="Describe the reason for your leave..." rows={3}
              className="w-full px-3 py-2.5 rounded-xl border border-custom-300 bg-style-500 text-secondary-100 text-sm placeholder:text-custom-700 focus:outline-none focus:border-primary-400 transition-colors resize-none" />
          </div>
          <div>
            <label className="block text-sm font-semibold text-secondary-100 mb-1.5">Supporting Document <span className="text-custom-700 font-normal">(optional)</span></label>
            <label className="flex items-center gap-2 px-3 py-2.5 rounded-xl border border-dashed border-custom-300 bg-style-500 cursor-pointer hover:border-primary-400 transition-colors">
              <span className="text-sm text-custom-700 truncate">{docFile ? docFile.name : "Click to upload PDF, JPG, or PNG (max 5 MB)"}</span>
              <input type="file" accept=".pdf,.jpg,.jpeg,.png" onChange={(e) => { const f = e.target.files?.[0] ?? null; if (f && f.size > 5*1024*1024) { toast.error("File size must be under 5 MB"); return; } setDocFile(f); }} className="hidden" />
            </label>
            {docFile && <button type="button" onClick={() => setDocFile(null)} className="mt-1 text-xs text-red-500 hover:underline">Remove file</button>}
          </div>
          <div className="flex gap-3 justify-end pt-2 border-t border-custom-300">
            <button type="button" onClick={onClose} className="px-4 py-2 rounded-xl border border-custom-300 text-sm font-semibold text-secondary-100 hover:bg-custom-100 transition-colors">Cancel</button>
            <button type="submit" disabled={isLoading || uploading} className="px-4 py-2 rounded-xl bg-primary-500 text-white text-sm font-semibold hover:bg-primary-600 disabled:opacity-40 transition-colors">
              {uploading ? "Uploading..." : isLoading ? "Submitting..." : "Submit Request"}
            </button>
          </div>
        </form>
      </Card>
    </div>
  );
}

// ─── Main Page ────────────────────────────────────────────────────────────────

type Tab = "workers" | "mine";

export default function SupervisorLeavePage() {
  const [activeTab, setActiveTab] = useState<Tab>("workers");

  return (
    <DashboardLayout userRole="supervisor">
      <div className="space-y-6 font-[family-name:var(--font-family-primary)]">

        {/* Header */}
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-xl bg-blue-100 flex items-center justify-center">
            <HiOutlineCalendar className="w-5 h-5 text-blue-600" />
          </div>
          <div>
            <h1 className="text-2xl md:text-3xl font-bold text-secondary-100">Leave</h1>
            <p className="text-sm text-custom-700 mt-0.5">Manage your workers' leave and your own</p>
          </div>
        </div>

        {/* Tabs */}
        <div className="flex gap-1 p-1 bg-custom-100 rounded-xl w-fit">
          <button onClick={() => setActiveTab("workers")}
            className={`flex items-center gap-2 px-4 py-2 rounded-lg text-sm font-semibold transition-all ${activeTab === "workers" ? "bg-white text-secondary-100 shadow-sm" : "text-custom-700 hover:text-secondary-100"}`}>
            <HiOutlineUsers className="w-4 h-4" />
            My Workers' Leave
          </button>
          <button onClick={() => setActiveTab("mine")}
            className={`flex items-center gap-2 px-4 py-2 rounded-lg text-sm font-semibold transition-all ${activeTab === "mine" ? "bg-white text-secondary-100 shadow-sm" : "text-custom-700 hover:text-secondary-100"}`}>
            <HiOutlineCalendar className="w-4 h-4" />
            My Leave
          </button>
        </div>

        {activeTab === "workers" ? <WorkersLeaveTab /> : <MyLeaveTab />}
      </div>
    </DashboardLayout>
  );
}
