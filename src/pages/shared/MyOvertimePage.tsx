import { useState, useMemo } from "react";
import {
  HiOutlineClock,
  HiOutlinePlus,
  HiOutlineRefresh,
  HiOutlineX,
  HiOutlineCheckCircle,
  HiOutlineXCircle,
  HiOutlinePencil,
  HiOutlineTrash,
  HiOutlineEye,
  HiOutlineBadgeCheck,
  HiOutlineCalendar,
} from "react-icons/hi";
import { toast } from "react-toastify";
import { DashboardLayout } from "../../components";
import { Card } from "../../components/ui";
import { useAppSelector } from "../../store/hooks";
import {
  useGetOvertimeRequestsQuery,
  useCreateOvertimeRequestMutation,
  useUpdateOvertimeRequestMutation,
  useDeleteOvertimeRequestMutation,
  type OvertimeRequest,
  type OvertimeStatus,
} from "../../store/services/overtimeService";

// ─── Helpers ──────────────────────────────────────────────────────────────────

const inp =
  "w-full px-3 py-2.5 rounded-xl border border-custom-300 bg-style-500 text-secondary-100 text-sm focus:outline-none focus:border-primary-400 transition-colors";

function fmtDate(iso: string) {
  if (!iso) return "—";
  return new Date(iso).toLocaleDateString("en-RW", {
    day: "2-digit",
    month: "short",
    year: "numeric",
  });
}

function calcHours(start: string, end: string) {
  const [sh, sm] = start.split(":").map(Number);
  const [eh, em] = end.split(":").map(Number);
  const diff = eh * 60 + em - (sh * 60 + sm);
  if (diff <= 0) return "—";
  const h = Math.floor(diff / 60);
  const m = diff % 60;
  return h === 0 ? `${m}m` : m === 0 ? `${h}h` : `${h}h ${m}m`;
}

function today() {
  const d = new Date();
  return `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, "0")}-${String(d.getDate()).padStart(2, "0")}`;
}

// ─── Status Badge ─────────────────────────────────────────────────────────────

const STATUS_CFG: Record<OvertimeStatus, { label: string; bg: string; text: string; Icon: React.ElementType }> = {
  PENDING:  { label: "Pending",  bg: "bg-yellow-100",  text: "text-yellow-700",  Icon: HiOutlineClock        },
  APPROVED: { label: "Approved", bg: "bg-emerald-100", text: "text-emerald-700", Icon: HiOutlineBadgeCheck   },
  REJECTED: { label: "Rejected", bg: "bg-red-100",     text: "text-red-600",     Icon: HiOutlineXCircle      },
};

function StatusBadge({ status }: { status: OvertimeStatus }) {
  const cfg = STATUS_CFG[status];
  return (
    <span className={`inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-xs font-semibold ${cfg.bg} ${cfg.text}`}>
      <cfg.Icon className="w-3.5 h-3.5" />
      {cfg.label}
    </span>
  );
}

// ─── Register / Edit Modal ────────────────────────────────────────────────────

interface FormModalProps {
  record?: OvertimeRequest;
  onClose: () => void;
}

function OvertimeFormModal({ record, onClose }: FormModalProps) {
  const isEdit = !!record;
  const userId = useAppSelector((s) => s.auth.user?.id);

  const [form, setForm] = useState({
    date:      record?.date?.slice(0, 10) ?? today(),
    startTime: record?.startTime ?? "17:00",
    endTime:   record?.endTime ?? "20:00",
    reason:    record?.reason ?? "",
  });

  const [create, { isLoading: creating }] = useCreateOvertimeRequestMutation();
  const [update, { isLoading: updating }] = useUpdateOvertimeRequestMutation();
  const isLoading = creating || updating;

  const set = (k: keyof typeof form) => (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) =>
    setForm((p) => ({ ...p, [k]: e.target.value }));

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!form.date)      { toast.error("Date is required"); return; }
    if (!form.startTime) { toast.error("Start time is required"); return; }
    if (!form.endTime)   { toast.error("End time is required"); return; }


    const [sh, sm] = form.startTime.split(":").map(Number);
    const [eh, em] = form.endTime.split(":").map(Number);
    if (eh * 60 + em <= sh * 60 + sm) {
      toast.error("End time must be after start time");
      return;
    }

    try {
      if (isEdit) {
        await update({ id: record!.id, ...form, reason: form.reason.trim() }).unwrap();
        toast.success("Overtime request updated");
      } else {
        await create({ ...form, reason: form.reason.trim(), employeeId: userId ?? undefined }).unwrap();
        toast.success("Overtime request submitted");
      }
      onClose();
    } catch (err: any) {
      toast.error(err?.data?.message ?? "Failed to save overtime request");
    }
  };

  const duration = useMemo(() => {
    if (!form.startTime || !form.endTime) return null;
    const d = calcHours(form.startTime, form.endTime);
    return d === "—" ? null : d;
  }, [form.startTime, form.endTime]);

  return (
    <div className="fixed inset-0 bg-secondary-100/50 z-50 flex items-start justify-center p-4 overflow-y-auto">
      <Card className="!p-6 max-w-lg w-full my-8">
        {/* Header */}
        <div className="flex items-center justify-between mb-5">
          <div className="flex items-center gap-3">
            <div className="w-9 h-9 rounded-xl bg-primary-100 flex items-center justify-center">
              <HiOutlineClock className="w-5 h-5 text-primary-600" />
            </div>
            <div>
              <h3 className="text-lg font-bold text-secondary-100">
                {isEdit ? "Edit Overtime Request" : "Register Overtime"}
              </h3>
              <p className="text-xs text-custom-700">
                {isEdit ? "Only pending requests can be edited" : "Record overtime worked"}
              </p>
            </div>
          </div>
          <button onClick={onClose} className="text-custom-700 hover:text-secondary-100 transition-colors">
            <HiOutlineX className="w-5 h-5" />
          </button>
        </div>

        <form onSubmit={handleSubmit} className="space-y-4">
          {/* Date */}
          <div>
            <label className="block text-sm font-semibold text-secondary-100 mb-1.5">Date *</label>
            <input type="date" value={form.date} onChange={set("date")} max={today()} className={inp} />
          </div>

          {/* Times */}
          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="block text-sm font-semibold text-secondary-100 mb-1.5">Start Time *</label>
              <input type="time" value={form.startTime} onChange={set("startTime")} className={inp} />
            </div>
            <div>
              <label className="block text-sm font-semibold text-secondary-100 mb-1.5">End Time *</label>
              <input type="time" value={form.endTime} onChange={set("endTime")} className={inp} />
            </div>
          </div>

          {/* Duration preview */}
          {duration && (
            <p className="text-xs font-semibold text-primary-600 -mt-1">
              ⏱ Duration: {duration}
            </p>
          )}

          {/* Reason */}
          <div>
            <label className="block text-sm font-semibold text-secondary-100 mb-1.5">
              Reason <span className="text-custom-500 font-normal">(optional)</span>
            </label>
            <textarea
              value={form.reason}
              onChange={set("reason")}
              rows={3}
              placeholder="Describe the work done during overtime…"
              className={`${inp} resize-none`}
            />
          </div>

          {/* Actions */}
          <div className="flex gap-3 justify-end pt-2 border-t border-custom-200">
            <button
              type="button"
              onClick={onClose}
              disabled={isLoading}
              className="px-4 py-2 rounded-xl border border-custom-300 text-sm font-semibold text-secondary-100 hover:bg-custom-100 disabled:opacity-40 transition-colors"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={isLoading}
              className="flex items-center gap-2 px-4 py-2 rounded-xl bg-primary-500 text-white text-sm font-semibold hover:bg-primary-600 disabled:opacity-40 transition-colors"
            >
              <HiOutlineClock className="w-4 h-4" />
              {isLoading ? "Saving…" : isEdit ? "Save Changes" : "Submit Request"}
            </button>
          </div>
        </form>
      </Card>
    </div>
  );
}

// ─── Delete Confirm Modal ─────────────────────────────────────────────────────

function DeleteModal({ record, onClose, onConfirm, isLoading }: {
  record: OvertimeRequest;
  onClose: () => void;
  onConfirm: () => void;
  isLoading: boolean;
}) {
  return (
    <div className="fixed inset-0 bg-secondary-100/50 z-50 flex items-center justify-center p-4">
      <div className="bg-style-600 border border-custom-200 rounded-2xl shadow-xl w-full max-w-sm p-6">
        <div className="flex items-center gap-3 mb-4">
          <div className="w-9 h-9 rounded-xl bg-red-100 flex items-center justify-center shrink-0">
            <HiOutlineTrash className="w-5 h-5 text-red-500" />
          </div>
          <div>
            <h3 className="text-base font-bold text-secondary-100">Delete Overtime Record</h3>
            <p className="text-xs text-custom-700 mt-0.5">{fmtDate(record.date)} · {record.startTime} – {record.endTime}</p>
          </div>
        </div>
        <p className="text-sm text-custom-700 mb-5">
          This record will be permanently deleted. This action cannot be undone.
        </p>
        <div className="flex gap-3 justify-end">
          <button
            onClick={onClose}
            disabled={isLoading}
            className="px-4 py-2 rounded-xl border border-custom-300 text-sm font-semibold text-secondary-100 hover:bg-custom-100 disabled:opacity-40 transition-colors"
          >
            Cancel
          </button>
          <button
            onClick={onConfirm}
            disabled={isLoading}
            className="flex items-center gap-2 px-4 py-2 rounded-xl bg-red-500 text-white text-sm font-semibold hover:bg-red-600 disabled:opacity-40 transition-colors"
          >
            <HiOutlineTrash className="w-4 h-4" />
            {isLoading ? "Deleting…" : "Delete"}
          </button>
        </div>
      </div>
    </div>
  );
}

// ─── Detail Modal ─────────────────────────────────────────────────────────────

function DetailModal({ record, onClose, onEdit }: {
  record: OvertimeRequest;
  onClose: () => void;
  onEdit: () => void;
}) {
  const canEdit = record.status === "PENDING";
  return (
    <div className="fixed inset-0 bg-secondary-100/50 z-50 flex items-start justify-center p-4 overflow-y-auto">
      <Card className="!p-6 max-w-md w-full my-8">
        <div className="flex items-center justify-between mb-5">
          <div className="flex items-center gap-3">
            <div className="w-9 h-9 rounded-xl bg-primary-100 flex items-center justify-center">
              <HiOutlineClock className="w-5 h-5 text-primary-600" />
            </div>
            <div>
              <h3 className="text-lg font-bold text-secondary-100">Overtime Details</h3>
              <p className="text-xs text-custom-700">Request summary</p>
            </div>
          </div>
          <button onClick={onClose} className="text-custom-700 hover:text-secondary-100 transition-colors">
            <HiOutlineX className="w-5 h-5" />
          </button>
        </div>

        <dl className="space-y-3">
          <div className="grid grid-cols-2 gap-3">
            <div className="rounded-xl bg-custom-50 border border-custom-200 px-4 py-3">
              <dt className="text-xs font-semibold text-custom-700 mb-0.5">Date</dt>
              <dd className="text-sm font-semibold text-secondary-100">{fmtDate(record.date)}</dd>
            </div>
            <div className="rounded-xl bg-custom-50 border border-custom-200 px-4 py-3">
              <dt className="text-xs font-semibold text-custom-700 mb-0.5">Duration</dt>
              <dd className="text-sm font-semibold text-secondary-100">{calcHours(record.startTime, record.endTime)}</dd>
            </div>
          </div>

          <div className="grid grid-cols-2 gap-3">
            <div className="rounded-xl bg-custom-50 border border-custom-200 px-4 py-3">
              <dt className="text-xs font-semibold text-custom-700 mb-0.5">Start Time</dt>
              <dd className="text-sm text-secondary-100">{record.startTime}</dd>
            </div>
            <div className="rounded-xl bg-custom-50 border border-custom-200 px-4 py-3">
              <dt className="text-xs font-semibold text-custom-700 mb-0.5">End Time</dt>
              <dd className="text-sm text-secondary-100">{record.endTime}</dd>
            </div>
          </div>

          <div className="rounded-xl bg-custom-50 border border-custom-200 px-4 py-3">
            <dt className="text-xs font-semibold text-custom-700 mb-0.5">Reason / Work Done</dt>
            <dd className="text-sm text-secondary-100 leading-relaxed whitespace-pre-wrap">{record.reason}</dd>
          </div>

          <div className="rounded-xl bg-custom-50 border border-custom-200 px-4 py-3">
            <dt className="text-xs font-semibold text-custom-700 mb-1.5">Approval Status</dt>
            <dd className="flex items-center gap-2 flex-wrap">
              <StatusBadge status={record.status} />
              {record.approvedByUser?.name && (
                <span className="text-xs text-custom-700">
                  by <span className="font-semibold text-secondary-100">{record.approvedByUser.name}</span>
                </span>
              )}
              {record.approvedAt && (
                <span className="text-xs text-custom-500">{fmtDate(record.approvedAt)}</span>
              )}
            </dd>
            {record.approvalComment && (
              <dd className="mt-2 text-xs text-custom-700 italic border-l-2 border-custom-300 pl-2">
                "{record.approvalComment}"
              </dd>
            )}
          </div>
        </dl>

        <div className="flex gap-3 justify-end pt-4 mt-4 border-t border-custom-200">
          <button
            onClick={onClose}
            className="px-4 py-2 rounded-xl border border-custom-300 text-sm font-semibold text-secondary-100 hover:bg-custom-100 transition-colors"
          >
            Close
          </button>
          {canEdit && (
            <button
              onClick={() => { onClose(); onEdit(); }}
              className="flex items-center gap-2 px-4 py-2 rounded-xl bg-primary-500 text-white text-sm font-semibold hover:bg-primary-600 transition-colors"
            >
              <HiOutlinePencil className="w-4 h-4" /> Edit
            </button>
          )}
        </div>
      </Card>
    </div>
  );
}

// ─── Main Page ────────────────────────────────────────────────────────────────

export default function MyOvertimePage() {
  const userId = useAppSelector((s) => s.auth.user?.id);

  const [statusFilter, setStatusFilter] = useState<OvertimeStatus | "">("");
  const [showForm,     setShowForm]     = useState(false);
  const [editRecord,   setEditRecord]   = useState<OvertimeRequest | null>(null);
  const [viewRecord,   setViewRecord]   = useState<OvertimeRequest | null>(null);
  const [deleteTarget, setDeleteTarget] = useState<OvertimeRequest | null>(null);

  const { data, isLoading, refetch } = useGetOvertimeRequestsQuery(
    { limit: 100, employeeId: userId, ...(statusFilter ? { status: statusFilter } : {}) },
    { skip: !userId }
  );

  const [deleteReq, { isLoading: deleting }] = useDeleteOvertimeRequestMutation();

  const records = useMemo(() => data?.data ?? [], [data]);

  const pendingCount  = records.filter((r) => r.status === "PENDING").length;
  const approvedCount = records.filter((r) => r.status === "APPROVED").length;
  const rejectedCount = records.filter((r) => r.status === "REJECTED").length;

  const handleDeleteConfirm = async () => {
    if (!deleteTarget) return;
    try {
      await deleteReq(deleteTarget.id).unwrap();
      toast.success("Record deleted");
      setDeleteTarget(null);
    } catch (err: any) {
      toast.error(err?.data?.message ?? "Failed to delete");
    }
  };

  return (
    <DashboardLayout>
      <div className="space-y-6 font-[family-name:var(--font-family-primary)]">

        {/* ── Header ── */}
        <div className="flex items-start justify-between gap-4 flex-wrap">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-primary-100 flex items-center justify-center">
              <HiOutlineClock className="w-5 h-5 text-primary-600" />
            </div>
            <div>
              <h1 className="text-2xl md:text-3xl font-bold text-secondary-100">My Overtime</h1>
              <p className="text-sm text-custom-700 mt-0.5">Register and track your overtime hours</p>
            </div>
          </div>
          <div className="flex items-center gap-2">
            <button
              onClick={() => refetch()}
              className="p-2 rounded-xl border border-custom-300 hover:bg-custom-100 transition-colors text-custom-700"
              title="Refresh"
            >
              <HiOutlineRefresh className={`w-4 h-4 ${isLoading ? "animate-spin" : ""}`} />
            </button>
            <button
              onClick={() => setShowForm(true)}
              className="flex items-center gap-2 px-4 py-2 rounded-xl bg-primary-500 text-white text-sm font-semibold hover:bg-primary-600 transition-colors"
            >
              <HiOutlinePlus className="w-4 h-4" />
              Register Overtime
            </button>
          </div>
        </div>

        {/* ── Summary Cards ── */}
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

        {/* ── Filter Tabs ── */}
        <div className="flex gap-2 flex-wrap">
          {(["", "PENDING", "APPROVED", "REJECTED"] as const).map((s) => (
            <button
              key={s}
              onClick={() => setStatusFilter(s)}
              className={`px-3 py-1.5 rounded-lg text-sm font-semibold transition-colors ${
                statusFilter === s
                  ? "bg-primary-500 text-white"
                  : "border border-custom-300 text-custom-700 hover:bg-custom-100"
              }`}
            >
              {s === "" ? "All" : s.charAt(0) + s.slice(1).toLowerCase()}
            </button>
          ))}
        </div>

        {/* ── Records List ── */}
        {isLoading ? (
          <Card className="!p-0 overflow-hidden">
            <div className="divide-y divide-custom-200">
              {Array.from({ length: 5 }).map((_, i) => (
                <div key={i} className="flex items-center gap-4 px-5 py-4 animate-pulse">
                  <div className="h-4 w-24 bg-custom-200 rounded" />
                  <div className="h-4 w-20 bg-custom-200 rounded" />
                  <div className="h-4 flex-1 bg-custom-200 rounded" />
                  <div className="h-4 w-16 bg-custom-200 rounded" />
                </div>
              ))}
            </div>
          </Card>
        ) : records.length === 0 ? (
          <Card className="!p-12 text-center">
            <HiOutlineClock className="w-10 h-10 text-custom-400 mx-auto mb-3" />
            <p className="text-secondary-100 font-semibold">No overtime records</p>
            <p className="text-sm text-custom-700 mt-1">
              Use the "Register Overtime" button to add your first entry.
            </p>
          </Card>
        ) : (
          <div className="space-y-3">
            {records.map((r) => (
              <Card key={r.id} className="!p-4 hover:shadow-md transition-shadow">
                <div className="flex items-start gap-4">
                  {/* Date block */}
                  <div className="w-14 h-14 rounded-xl bg-primary-50 border border-primary-100 flex flex-col items-center justify-center shrink-0">
                    <span className="text-xs font-bold text-primary-600 uppercase">
                      {new Date(r.date).toLocaleDateString("en-RW", { month: "short" })}
                    </span>
                    <span className="text-xl font-bold text-primary-700 leading-none">
                      {new Date(r.date).getDate()}
                    </span>
                  </div>

                  {/* Info */}
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2 flex-wrap mb-1">
                      <span className="text-sm font-bold text-secondary-100">
                        {r.startTime} – {r.endTime}
                      </span>
                      <span className="text-xs text-custom-500 font-medium bg-custom-100 px-2 py-0.5 rounded-full">
                        {calcHours(r.startTime, r.endTime)}
                      </span>
                      <StatusBadge status={r.status} />
                    </div>
                    <p className="text-sm text-custom-700 line-clamp-2">{r.reason}</p>
                    {r.approvalComment && (
                      <p className="text-xs text-custom-500 italic mt-1">"{r.approvalComment}"</p>
                    )}
                  </div>

                  {/* Actions */}
                  <div className="flex items-center gap-1.5 shrink-0">
                    <button
                      onClick={() => setViewRecord(r)}
                      title="View details"
                      className="p-1.5 rounded-lg hover:bg-custom-100 text-custom-700 transition-colors"
                    >
                      <HiOutlineEye className="w-4 h-4" />
                    </button>
                    {r.status === "PENDING" && (
                      <>
                        <button
                          onClick={() => setEditRecord(r)}
                          title="Edit"
                          className="p-1.5 rounded-lg hover:bg-custom-100 text-primary-600 transition-colors"
                        >
                          <HiOutlinePencil className="w-4 h-4" />
                        </button>
                        <button
                          onClick={() => setDeleteTarget(r)}
                          title="Delete"
                          className="p-1.5 rounded-lg hover:bg-red-50 text-red-500 transition-colors"
                        >
                          <HiOutlineTrash className="w-4 h-4" />
                        </button>
                      </>
                    )}
                    {r.status === "APPROVED" && (
                      <HiOutlineCheckCircle className="w-4 h-4 text-emerald-500" title="Approved" />
                    )}
                  </div>
                </div>
              </Card>
            ))}
          </div>
        )}

        {/* ── Today quick-info ── */}
        <Card className="!p-4 border-l-4 border-primary-400 bg-primary-50/40">
          <div className="flex items-center gap-2 mb-1">
            <HiOutlineCalendar className="w-4 h-4 text-primary-600" />
            <span className="text-sm font-semibold text-primary-700">How it works</span>
          </div>
          <p className="text-xs text-custom-700 leading-relaxed">
            Submit overtime after it happens. Your request will be reviewed by Admin / DAF.
            You can only edit or delete <strong>pending</strong> requests.
          </p>
        </Card>
      </div>

      {/* ── Modals ── */}
      {showForm && (
        <OvertimeFormModal onClose={() => setShowForm(false)} />
      )}
      {editRecord && (
        <OvertimeFormModal
          record={editRecord}
          onClose={() => setEditRecord(null)}
        />
      )}
      {viewRecord && (
        <DetailModal
          record={viewRecord}
          onClose={() => setViewRecord(null)}
          onEdit={() => setEditRecord(viewRecord)}
        />
      )}
      {deleteTarget && (
        <DeleteModal
          record={deleteTarget}
          onClose={() => setDeleteTarget(null)}
          onConfirm={handleDeleteConfirm}
          isLoading={deleting}
        />
      )}
    </DashboardLayout>
  );
}
