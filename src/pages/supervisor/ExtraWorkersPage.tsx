import { useState, useMemo, useRef, useEffect } from "react";
import ReactDOM from "react-dom";
import {
  HiOutlineUsers,
  HiOutlinePlus,
  HiOutlineRefresh,
  HiOutlineSearch,
  HiOutlinePencil,
  HiOutlineTrash,
  HiOutlineX,
  HiOutlineFilter,
  HiOutlineCalendar,
  HiOutlineClock,
  HiOutlineUserCircle,
  HiOutlineEye,
  HiOutlineCheckCircle,
  HiOutlineXCircle,
  HiOutlineBadgeCheck,
  HiOutlineDotsVertical,
} from "react-icons/hi";
import { toast } from "react-toastify";
import { DashboardLayout } from "../../components";
import { Card } from "../../components/ui";
import { useAppSelector } from "../../store/hooks";
import {
  useGetExtraWorkersQuery,
  useCreateExtraWorkerMutation,
  useUpdateExtraWorkerMutation,
  useDeleteExtraWorkerMutation,
  useApproveExtraWorkerMutation,
  type ExtraWorker,
  type ExtraWorkerPayload,
  type Gender,
  type ApprovalStatus,
} from "../../store/services/extraWorkersService";

// ─── Constants ────────────────────────────────────────────────────────────────

const cls =
  "w-full px-3 py-2 rounded-xl border border-custom-300 bg-style-500 text-secondary-100 text-sm focus:outline-none focus:border-primary-400 transition-colors";

const GENDER_COLORS: Record<Gender, string> = {
  MALE:   "bg-blue-100 text-blue-700",
  FEMALE: "bg-pink-100 text-pink-700",
};

const PAGE_SIZE = 10;

// ─── Helpers ──────────────────────────────────────────────────────────────────

function fmtDate(iso: string) {
  if (!iso) return "—";
  return new Date(iso).toLocaleDateString("en-RW", {
    day: "2-digit", month: "short", year: "numeric",
  });
}

function calcHours(start: string, end: string) {
  const [sh, sm] = start.split(":").map(Number);
  const [eh, em] = end.split(":").map(Number);
  const diff = (eh * 60 + em) - (sh * 60 + sm);
  if (diff <= 0) return "—";
  const h = Math.floor(diff / 60);
  const m = diff % 60;
  if (h === 0) return `${m}m`;
  if (m === 0) return `${h}h 00m`;
  return `${h}h ${m}m`;
}

function doneName(w: ExtraWorker) {
  // preferred: doneByUser.name (new backend shape)
  if (w.doneByUser?.name) return w.doneByUser.name;
  // fallback: doneBy object
  const d = w.doneBy;
  if (!d) return "—";
  if (typeof d === "string") return d;
  return d.fullName ?? d.name ?? d.email ?? d.id ?? "—";
}

// ─── Gender Badge ─────────────────────────────────────────────────────────────

function GenderBadge({ gender }: { gender: Gender }) {
  return (
    <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-semibold ${GENDER_COLORS[gender]}`}>
      {gender === "MALE" ? "♂ Male" : "♀ Female"}
    </span>
  );
}

// ─── Approval Status Badge ────────────────────────────────────────────────────

const APPROVAL_CFG: Record<ApprovalStatus, { label: string; bg: string; text: string; icon: React.ElementType }> = {
  PENDING:  { label: "Pending",  bg: "bg-yellow-100", text: "text-yellow-700", icon: HiOutlineClock        },
  APPROVED: { label: "Approved", bg: "bg-emerald-100", text: "text-emerald-700", icon: HiOutlineBadgeCheck },
  REJECTED: { label: "Rejected", bg: "bg-red-100",    text: "text-red-600",    icon: HiOutlineXCircle      },
};

function StatusBadge({ status }: { status?: ApprovalStatus | null }) {
  const s = status ?? "PENDING";
  const cfg = APPROVAL_CFG[s];
  const Icon = cfg.icon;
  return (
    <span className={`inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-xs font-semibold ${cfg.bg} ${cfg.text}`}>
      <Icon className="w-3.5 h-3.5" />
      {cfg.label}
    </span>
  );
}

// ─── KPI Cards ────────────────────────────────────────────────────────────────

interface KpiProps {
  total: number;
  males: number;
  females: number;
  today: number;
  pending: number;
  approved: number;
  rejected: number;
  loading: boolean;
}

function KpiCards({ total, males, females, today, pending, approved, rejected, loading }: KpiProps) {
  const cards = [
    { label: "Total Records",  value: total,    color: "text-primary-500"  },
    { label: "Male Workers",   value: males,    color: "text-blue-600"     },
    { label: "Female Workers", value: females,  color: "text-pink-500"     },
    { label: "Today",          value: today,    color: "text-emerald-600"  },
    { label: "Pending",        value: pending,  color: "text-yellow-600"   },
    { label: "Approved",       value: approved, color: "text-emerald-600"  },
    { label: "Rejected",       value: rejected, color: "text-red-500"      },
  ];
  return (
    <div className="grid grid-cols-2 sm:grid-cols-4 lg:grid-cols-7 gap-3">
      {cards.map((c) => (
        <Card key={c.label} className="!p-4 text-center">
          <p className="text-xs text-custom-700 mb-1">{c.label}</p>
          <p className={`text-2xl font-bold ${c.color}`}>
            {loading ? "—" : c.value}
          </p>
        </Card>
      ))}
    </div>
  );
}

// ─── Filters Bar ──────────────────────────────────────────────────────────────

interface FiltersProps {
  search: string;
  onSearch: (v: string) => void;
  dateFilter: string;
  onDate: (v: string) => void;
  genderFilter: Gender | "";
  onGender: (v: Gender | "") => void;
  statusFilter: ApprovalStatus | "";
  onStatus: (v: ApprovalStatus | "") => void;
  onClear: () => void;
  loading: boolean;
  onRefresh: () => void;
  onAdd: () => void;
}

function FiltersBar({
  search, onSearch, dateFilter, onDate,
  genderFilter, onGender, statusFilter, onStatus,
  onClear, loading, onRefresh, onAdd,
}: FiltersProps) {
  const hasFilters = !!search || !!dateFilter || !!genderFilter || !!statusFilter;
  return (
    <div className="flex flex-wrap items-center gap-3">
      {/* Search */}
      <div className="relative flex-1 min-w-48">
        <HiOutlineSearch className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-custom-700" />
        <input
          value={search}
          onChange={(e) => onSearch(e.target.value)}
          placeholder="Search by name or task…"
          className="w-full pl-9 pr-4 py-2 rounded-xl border border-custom-300 bg-style-500 text-secondary-100 text-sm placeholder:text-custom-400 focus:outline-none focus:border-primary-400 transition-colors"
        />
      </div>

      {/* Date filter */}
      <div className="relative">
        <HiOutlineCalendar className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-custom-700 pointer-events-none" />
        <input
          type="date"
          value={dateFilter}
          onChange={(e) => onDate(e.target.value)}
          className="pl-9 pr-3 py-2 rounded-xl border border-custom-300 bg-style-500 text-secondary-100 text-sm focus:outline-none focus:border-primary-400 transition-colors"
        />
      </div>

      {/* Gender */}
      <select
        value={genderFilter}
        onChange={(e) => onGender(e.target.value as Gender | "")}
        className="px-3 py-2 rounded-xl border border-custom-300 bg-style-500 text-secondary-100 text-sm focus:outline-none focus:border-primary-400 transition-colors"
      >
        <option value="">All genders</option>
        <option value="MALE">Male</option>
        <option value="FEMALE">Female</option>
      </select>

      {/* Status */}
      <select
        value={statusFilter}
        onChange={(e) => onStatus(e.target.value as ApprovalStatus | "")}
        className="px-3 py-2 rounded-xl border border-custom-300 bg-style-500 text-secondary-100 text-sm focus:outline-none focus:border-primary-400 transition-colors"
      >
        <option value="">All statuses</option>
        <option value="PENDING">Pending</option>
        <option value="APPROVED">Approved</option>
        <option value="REJECTED">Rejected</option>
      </select>

      {/* Clear filters */}
      {hasFilters && (
        <button
          onClick={onClear}
          className="flex items-center gap-1.5 px-3 py-2 rounded-xl border border-custom-300 text-xs font-semibold text-custom-700 hover:bg-custom-100 transition-colors"
        >
          <HiOutlineFilter className="w-3.5 h-3.5" /> Clear
        </button>
      )}

      <div className="flex items-center gap-2 ml-auto">
        <button
          onClick={onRefresh}
          className="p-2 rounded-xl border border-custom-300 hover:bg-custom-100 transition-colors text-custom-700"
          title="Refresh"
        >
          <HiOutlineRefresh className={`w-4 h-4 ${loading ? "animate-spin" : ""}`} />
        </button>
        <button
          onClick={onAdd}
          className="flex items-center gap-2 px-4 py-2 rounded-xl bg-primary-500 text-white text-sm font-semibold hover:bg-primary-600 transition-colors"
        >
          <HiOutlinePlus className="w-4 h-4" /> Add Record
        </button>
      </div>
    </div>
  );
}

// ─── Row Actions Dropdown ─────────────────────────────────────────────────────

interface RowActionsProps {
  record: ExtraWorker;
  canDelete: boolean;
  canApprove: boolean;
  onView: () => void;
  onEdit: () => void;
  onDelete: () => void;
  onApprove: (decision: "APPROVED" | "REJECTED") => void;
}

function RowActions({ canDelete, canApprove, onView, onEdit, onDelete, onApprove }: RowActionsProps) {
  const [open, setOpen] = useState(false);
  const [pos,  setPos]  = useState<{ top: number; right: number } | null>(null);
  const btnRef  = useRef<HTMLButtonElement>(null);
  const menuRef = useRef<HTMLDivElement>(null);

  const handleToggle = () => {
    if (!open && btnRef.current) {
      const r = btnRef.current.getBoundingClientRect();
      setPos({ top: r.top, right: window.innerWidth - r.right });
    }
    setOpen((p) => !p);
  };

  // close on outside click
  useEffect(() => {
    if (!open) return;
    const handler = (e: MouseEvent) => {
      if (
        menuRef.current && !menuRef.current.contains(e.target as Node) &&
        btnRef.current  && !btnRef.current.contains(e.target as Node)
      ) setOpen(false);
    };
    document.addEventListener("mousedown", handler);
    return () => document.removeEventListener("mousedown", handler);
  }, [open]);

  const act = (fn: () => void) => { setOpen(false); fn(); };

  return (
    <div className="flex justify-end">
      <button
        ref={btnRef}
        onClick={handleToggle}
        className="p-1.5 rounded-lg hover:bg-custom-100 transition-colors text-custom-700"
        title="Actions"
      >
        <HiOutlineDotsVertical className="w-4 h-4" />
      </button>

      {open && pos && ReactDOM.createPortal(
        <div
          ref={menuRef}
          style={{ position: "fixed", bottom: window.innerHeight - pos.top, right: pos.right, zIndex: 9999 }}
          className="w-44 bg-style-600 border border-custom-200 rounded-xl shadow-xl py-1 text-sm mb-1"
        >
          <button
            onClick={() => act(onView)}
            className="w-full flex items-center gap-2 px-3 py-2 hover:bg-custom-100 text-secondary-100 transition-colors"
          >
            <HiOutlineEye className="w-4 h-4 text-blue-500" /> View
          </button>
          <button
            onClick={() => act(onEdit)}
            className="w-full flex items-center gap-2 px-3 py-2 hover:bg-custom-100 text-secondary-100 transition-colors"
          >
            <HiOutlinePencil className="w-4 h-4 text-primary-500" /> Edit
          </button>
          {canApprove && (
            <>
              <button
                onClick={() => act(() => onApprove("APPROVED"))}
                className="w-full flex items-center gap-2 px-3 py-2 hover:bg-custom-100 text-secondary-100 transition-colors"
              >
                <HiOutlineCheckCircle className="w-4 h-4 text-emerald-500" /> Approve
              </button>
              <button
                onClick={() => act(() => onApprove("REJECTED"))}
                className="w-full flex items-center gap-2 px-3 py-2 hover:bg-custom-100 text-secondary-100 transition-colors"
              >
                <HiOutlineXCircle className="w-4 h-4 text-red-500" /> Reject
              </button>
            </>
          )}
          {canDelete && (
            <>
              <div className="border-t border-custom-200 my-1" />
              <button
                onClick={() => act(onDelete)}
                className="w-full flex items-center gap-2 px-3 py-2 hover:bg-red-50 text-red-500 transition-colors"
              >
                <HiOutlineTrash className="w-4 h-4" /> Delete
              </button>
            </>
          )}
        </div>,
        document.body
      )}
    </div>
  );
}

// ─── Table ────────────────────────────────────────────────────────────────────

interface TableProps {
  records: ExtraWorker[];
  loading: boolean;
  canDelete: boolean;
  canApprove: boolean;
  onView: (r: ExtraWorker) => void;
  onEdit: (r: ExtraWorker) => void;
  onDelete: (id: string) => void;
  onApprove: (r: ExtraWorker, decision: "APPROVED" | "REJECTED") => void;
}

function ExtraWorkersTable({ records, loading, canDelete, canApprove, onView, onEdit, onDelete, onApprove }: TableProps) {
  if (loading) {
    return (
      <Card className="!p-0 overflow-hidden">
        <div className="divide-y divide-custom-200">
          {Array.from({ length: 6 }).map((_, i) => (
            <div key={i} className="flex items-center gap-4 px-5 py-4 animate-pulse">
              <div className="h-4 w-32 bg-custom-200 rounded" />
              <div className="h-4 w-16 bg-custom-200 rounded" />
              <div className="h-4 w-24 bg-custom-200 rounded" />
              <div className="h-4 w-20 bg-custom-200 rounded" />
              <div className="h-4 flex-1 bg-custom-200 rounded" />
            </div>
          ))}
        </div>
      </Card>
    );
  }

  if (!records.length) {
    return (
      <Card className="!p-12 text-center">
        <HiOutlineUsers className="w-10 h-10 text-custom-400 mx-auto mb-3" />
        <p className="text-secondary-100 font-semibold">No records found</p>
        <p className="text-sm text-custom-700 mt-1">Add extra worker records using the button above.</p>
      </Card>
    );
  }

  return (
    <Card className="!p-0 overflow-hidden">
      <div className="overflow-x-auto">
        <table className="w-full text-sm table-fixed min-w-[800px]">
          <thead>
            <tr className="border-b border-custom-200 bg-custom-50">
              <th className="text-left px-5 py-3 text-xs font-semibold text-custom-700 uppercase tracking-wide w-8">#</th>
              <th className="text-left px-5 py-3 text-xs font-semibold text-custom-700 uppercase tracking-wide w-28">Full Name</th>
              <th className="text-left px-5 py-3 text-xs font-semibold text-custom-700 uppercase tracking-wide w-20">Gender</th>
              <th className="text-left px-5 py-3 text-xs font-semibold text-custom-700 uppercase tracking-wide w-24">Date</th>
              <th className="text-left px-5 py-3 text-xs font-semibold text-custom-700 uppercase tracking-wide w-32">Time</th>
              <th className="text-left px-5 py-3 text-xs font-semibold text-custom-700 uppercase tracking-wide w-20">Duration</th>
              <th className="text-left px-5 py-3 text-xs font-semibold text-custom-700 uppercase tracking-wide w-36">Task</th>
              <th className="text-left px-5 py-3 text-xs font-semibold text-custom-700 uppercase tracking-wide w-36">Description</th>
              <th className="text-left px-5 py-3 text-xs font-semibold text-custom-700 uppercase tracking-wide w-24">Status</th>
              <th className="text-right px-5 py-3 text-xs font-semibold text-custom-700 uppercase tracking-wide w-16">Actions</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-custom-100">
            {records.map((r, idx) => (
              <tr key={r.id} className="hover:bg-custom-50 transition-colors">
                <td className="px-5 py-3.5 text-custom-500 text-xs">{idx + 1}</td>
                <td className="px-5 py-3.5 font-semibold text-secondary-100 max-w-[120px]">
                  <span className="block truncate" title={r.fullName}>{r.fullName}</span>
                </td>
                <td className="px-5 py-3.5"><GenderBadge gender={r.gender} /></td>
                <td className="px-5 py-3.5 text-custom-700 whitespace-nowrap">{fmtDate(r.date)}</td>
                <td className="px-5 py-3.5 whitespace-nowrap max-w-[130px]">
                  <span className="inline-flex items-center gap-1 text-custom-700">
                    <HiOutlineClock className="w-3.5 h-3.5 shrink-0" />
                    {r.startTime} – {r.endTime}
                  </span>
                </td>
                <td className="px-5 py-3.5 text-custom-700 whitespace-nowrap">{calcHours(r.startTime, r.endTime)}</td>
                <td className="px-5 py-3.5 max-w-[150px]">
                  <span className="block truncate px-2 py-0.5 rounded-lg bg-primary-50 text-primary-700 text-xs font-semibold" title={r.task}>
                    {r.task}
                  </span>
                </td>
                <td className="px-5 py-3.5 text-custom-700 max-w-[150px]">
                  <span className="block truncate text-xs" title={r.description || ""}>{r.description || "—"}</span>
                </td>
                <td className="px-5 py-3.5">
                  <StatusBadge status={r.status} />
                </td>
                <td className="px-5 py-3.5">
                  <RowActions
                    record={r}
                    canDelete={canDelete}
                    canApprove={canApprove}
                    onView={() => onView(r)}
                    onEdit={() => onEdit(r)}
                    onDelete={() => onDelete(r.id)}
                    onApprove={(decision) => onApprove(r, decision)}
                  />
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </Card>
  );
}

// ─── Pagination ───────────────────────────────────────────────────────────────

function Pagination({
  page, totalPages, onPage,
}: { page: number; totalPages: number; onPage: (p: number) => void }) {
  if (totalPages <= 1) return null;
  return (
    <div className="flex items-center justify-center gap-2">
      <button
        onClick={() => onPage(page - 1)}
        disabled={page <= 1}
        className="px-3 py-1.5 rounded-lg border border-custom-300 text-sm text-secondary-100 disabled:opacity-40 hover:bg-custom-100 transition-colors"
      >
        ← Prev
      </button>
      <span className="text-sm text-custom-700">
        Page <span className="font-bold text-secondary-100">{page}</span> of {totalPages}
      </span>
      <button
        onClick={() => onPage(page + 1)}
        disabled={page >= totalPages}
        className="px-3 py-1.5 rounded-lg border border-custom-300 text-sm text-secondary-100 disabled:opacity-40 hover:bg-custom-100 transition-colors"
      >
        Next →
      </button>
    </div>
  );
}

// ─── View Modal ───────────────────────────────────────────────────────────────

function ViewModal({ record, onClose, onEdit, onApprove, canApprove }: {
  record: ExtraWorker;
  onClose: () => void;
  onEdit: () => void;
  onApprove: (decision: "APPROVED" | "REJECTED") => void;
  canApprove: boolean;
}) {
  return (
    <div className="fixed inset-0 bg-secondary-100/50 z-50 flex items-start justify-center p-4 overflow-y-auto">
      <Card className="!p-6 max-w-lg w-full my-8">

        {/* Header */}
        <div className="flex items-center justify-between mb-5">
          <div className="flex items-center gap-3">
            <div className="w-9 h-9 rounded-xl bg-primary-100 flex items-center justify-center">
              <HiOutlineUsers className="w-5 h-5 text-primary-600" />
            </div>
            <div>
              <h3 className="text-lg font-bold text-secondary-100">Record Details</h3>
              <p className="text-xs text-custom-700">Extra worker entry</p>
            </div>
          </div>
          <button onClick={onClose} className="text-custom-700 hover:text-secondary-100">
            <HiOutlineX className="w-5 h-5" />
          </button>
        </div>

        {/* Fields */}
        <dl className="space-y-3">
          <div className="grid grid-cols-2 gap-3">
            <div className="rounded-xl bg-custom-50 border border-custom-200 px-4 py-3">
              <dt className="text-xs font-semibold text-custom-700 mb-0.5">Full Name</dt>
              <dd className="text-sm font-bold text-secondary-100">{record.fullName}</dd>
            </div>
            <div className="rounded-xl bg-custom-50 border border-custom-200 px-4 py-3">
              <dt className="text-xs font-semibold text-custom-700 mb-0.5">Gender</dt>
              <dd><GenderBadge gender={record.gender} /></dd>
            </div>
          </div>

          <div className="grid grid-cols-2 gap-3">
            <div className="rounded-xl bg-custom-50 border border-custom-200 px-4 py-3">
              <dt className="text-xs font-semibold text-custom-700 mb-0.5">Date</dt>
              <dd className="text-sm text-secondary-100">{fmtDate(record.date)}</dd>
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
            <dt className="text-xs font-semibold text-custom-700 mb-0.5">Task / Work</dt>
            <dd className="text-sm font-semibold text-primary-600 break-all whitespace-pre-wrap">{record.task}</dd>
          </div>

          {record.description && (
            <div className="rounded-xl bg-custom-50 border border-custom-200 px-4 py-3">
              <dt className="text-xs font-semibold text-custom-700 mb-0.5">Description</dt>
              <dd className="text-sm text-secondary-100 leading-relaxed break-all whitespace-pre-wrap">{record.description}</dd>
            </div>
          )}

          <div className="rounded-xl bg-custom-50 border border-custom-200 px-4 py-3">
            <dt className="text-xs font-semibold text-custom-700 mb-0.5">Recorded By</dt>
            <dd className="flex items-center gap-1.5 text-sm text-secondary-100">
              <HiOutlineUserCircle className="w-4 h-4 text-custom-500" />
              {doneName(record)}
            </dd>
          </div>

          {/* Approval section */}
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

        {/* Actions */}
        <div className="flex gap-3 justify-end pt-4 mt-4 border-t border-custom-200">
          <button
            onClick={onClose}
            className="px-4 py-2 rounded-xl border border-custom-300 text-sm font-semibold text-secondary-100 hover:bg-custom-100 transition-colors"
          >
            Close
          </button>
          {canApprove && (
            <>
              <button
                onClick={() => { onClose(); onApprove("APPROVED"); }}
                className="flex items-center gap-2 px-4 py-2 rounded-xl bg-emerald-500 text-white text-sm font-semibold hover:bg-emerald-600 transition-colors"
              >
                <HiOutlineCheckCircle className="w-4 h-4" /> Approve
              </button>
              <button
                onClick={() => { onClose(); onApprove("REJECTED"); }}
                className="flex items-center gap-2 px-4 py-2 rounded-xl bg-red-500 text-white text-sm font-semibold hover:bg-red-600 transition-colors"
              >
                <HiOutlineXCircle className="w-4 h-4" /> Reject
              </button>
            </>
          )}
          <button
            onClick={() => { onClose(); onEdit(); }}
            className="flex items-center gap-2 px-4 py-2 rounded-xl bg-primary-500 text-white text-sm font-semibold hover:bg-primary-600 transition-colors"
          >
            <HiOutlinePencil className="w-4 h-4" /> Edit
          </button>
        </div>
      </Card>
    </div>
  );
}



// ─── Approval Modal ───────────────────────────────────────────────────────────

function ApprovalModal({
  record,
  initialDecision,
  onClose,
}: {
  record: ExtraWorker;
  initialDecision: "APPROVED" | "REJECTED";
  onClose: () => void;
}) {
  const [approve, { isLoading }] = useApproveExtraWorkerMutation();
  const [comment, setComment]   = useState(record.approvalComment ?? "");

  const isApprove = initialDecision === "APPROVED";

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      await approve({
        id: record.id,
        status: initialDecision,
        ...(comment.trim() && { approvalComment: comment.trim() }),
      }).unwrap();
      toast.success(`Record ${isApprove ? "approved" : "rejected"} successfully`);
      onClose();
    } catch (err: any) {
      toast.error(err?.data?.message ?? "Failed to update approval");
    }
  };

  return (
    <div className="fixed inset-0 bg-secondary-100/50 z-50 flex items-center justify-center p-4">
      <Card className="!p-6 max-w-md w-full">

        {/* Header */}
        <div className="flex items-center justify-between mb-5">
          <div className="flex items-center gap-3">
            <div className={`w-9 h-9 rounded-xl flex items-center justify-center ${isApprove ? "bg-emerald-100" : "bg-red-100"}`}>
              {isApprove
                ? <HiOutlineCheckCircle className="w-5 h-5 text-emerald-600" />
                : <HiOutlineXCircle    className="w-5 h-5 text-red-500" />}
            </div>
            <div>
              <h3 className="text-lg font-bold text-secondary-100">
                {isApprove ? "Approve Record" : "Reject Record"}
              </h3>
              <p className="text-xs text-custom-700 truncate max-w-[220px]">
                {record.fullName} — {record.task}
              </p>
            </div>
          </div>
          <button onClick={onClose} className="text-custom-700 hover:text-secondary-100">
            <HiOutlineX className="w-5 h-5" />
          </button>
        </div>

        <form onSubmit={handleSubmit} className="space-y-4">

          {/* Current status */}
          <div className="rounded-xl bg-custom-50 border border-custom-200 px-4 py-3 flex items-center justify-between">
            <span className="text-xs font-semibold text-custom-700">Current Status</span>
            <StatusBadge status={record.status} />
          </div>

          {/* Comment (optional) */}
          <div>
            <label className="block text-xs font-semibold text-secondary-100 mb-1">
              Comment <span className="text-custom-500 font-normal">(optional)</span>
            </label>
            <textarea
              value={comment}
              onChange={(e) => setComment(e.target.value)}
              rows={3}
              placeholder={isApprove ? "Add approval note…" : "Reason for rejection…"}
              className={`${cls} resize-none`}
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
              className={`flex items-center gap-2 px-4 py-2 rounded-xl text-white text-sm font-semibold disabled:opacity-40 transition-colors ${
                isApprove ? "bg-emerald-500 hover:bg-emerald-600" : "bg-red-500 hover:bg-red-600"
              }`}
            >
              {isApprove
                ? <HiOutlineCheckCircle className="w-4 h-4" />
                : <HiOutlineXCircle    className="w-4 h-4" />}
              {isLoading
                ? "Saving…"
                : isApprove ? "Confirm Approval" : "Confirm Rejection"}
            </button>
          </div>
        </form>
      </Card>
    </div>
  );
}


interface FormModalProps {
  record?: ExtraWorker;
  onClose: () => void;
}

function ExtraWorkerFormModal({ record, onClose }: FormModalProps) {
  const isEdit = !!record;

  const [create, { isLoading: creating }] = useCreateExtraWorkerMutation();
  const [update, { isLoading: updating }] = useUpdateExtraWorkerMutation();

  const [form, setForm] = useState<ExtraWorkerPayload>({
    fullName:    record?.fullName    ?? "",
    gender:      record?.gender      ?? "MALE",
    date:        record?.date        ? record.date.slice(0, 10) : "",
    startTime:   record?.startTime   ?? "",
    endTime:     record?.endTime     ?? "",
    task:        record?.task        ?? "",
    description: record?.description ?? "",
  });

  const set = (k: keyof ExtraWorkerPayload) =>
    (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement>) =>
      setForm((p) => ({ ...p, [k]: e.target.value }));

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!form.fullName.trim() || !form.date || !form.startTime || !form.endTime || !form.task.trim()) {
      toast.error("Please fill all required fields");
      return;
    }
    try {
      if (isEdit) {
        await update({ id: record!.id, ...form }).unwrap();
        toast.success("Record updated");
      } else {
        await create(form).unwrap();
        toast.success("Record added");
      }
      onClose();
    } catch (err: any) {
      toast.error(err?.data?.message ?? "Failed to save record");
    }
  };

  const busy = creating || updating;

  return (
    <div className="fixed inset-0 bg-secondary-100/50 z-50 flex items-start justify-center p-4 overflow-y-auto">
      <Card className="!p-6 max-w-lg w-full my-8">

        {/* Header */}
        <div className="flex items-center justify-between mb-5">
          <div className="flex items-center gap-3">
            <div className="w-9 h-9 rounded-xl bg-primary-100 flex items-center justify-center">
              <HiOutlineUsers className="w-5 h-5 text-primary-600" />
            </div>
            <div>
              <h3 className="text-lg font-bold text-secondary-100">
                {isEdit ? "Edit Record" : "Add Extra Worker"}
              </h3>
              <p className="text-xs text-custom-700">Weekend / after-hours work</p>
            </div>
          </div>
          <button onClick={onClose} className="text-custom-700 hover:text-secondary-100">
            <HiOutlineX className="w-5 h-5" />
          </button>
        </div>

        <form onSubmit={handleSubmit} className="space-y-4">

          {/* Full Name + Gender */}
          <div className="grid grid-cols-2 gap-3">
            <div className="col-span-2 sm:col-span-1">
              <label className="block text-xs font-semibold text-secondary-100 mb-1">Full Name *</label>
              <input
                value={form.fullName}
                onChange={set("fullName")}
                placeholder="John Doe"
                required
                className={cls}
              />
            </div>
            <div className="col-span-2 sm:col-span-1">
              <label className="block text-xs font-semibold text-secondary-100 mb-1">Gender *</label>
              <select value={form.gender} onChange={set("gender")} className={cls}>
                <option value="MALE">Male</option>
                <option value="FEMALE">Female</option>
              </select>
            </div>
          </div>

          {/* Date */}
          <div>
            <label className="block text-xs font-semibold text-secondary-100 mb-1">Date *</label>
            <input type="date" value={form.date} onChange={set("date")} required className={cls} />
          </div>

          {/* Start + End Time */}
          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="block text-xs font-semibold text-secondary-100 mb-1">Start Time *</label>
              <input type="time" value={form.startTime} onChange={set("startTime")} required className={cls} />
            </div>
            <div>
              <label className="block text-xs font-semibold text-secondary-100 mb-1">End Time *</label>
              <input type="time" value={form.endTime} onChange={set("endTime")} required className={cls} />
            </div>
          </div>

          {/* Task */}
          <div>
            <label className="block text-xs font-semibold text-secondary-100 mb-1">Task / Work *</label>
            <input
              value={form.task}
              onChange={set("task")}
              placeholder="e.g. Binding, Printing, Finishing…"
              required
              className={cls}
            />
          </div>

          {/* Description */}
          <div>
            <label className="block text-xs font-semibold text-secondary-100 mb-1">Description</label>
            <textarea
              value={form.description}
              onChange={set("description")}
              rows={3}
              placeholder="Optional details about the work done…"
              className={`${cls} resize-none`}
            />
          </div>

          {/* Actions */}
          <div className="flex gap-3 justify-end pt-2 border-t border-custom-200">
            <button
              type="button"
              onClick={onClose}
              disabled={busy}
              className="px-4 py-2 rounded-xl border border-custom-300 text-sm font-semibold text-secondary-100 hover:bg-custom-100 disabled:opacity-40 transition-colors"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={busy}
              className="flex items-center gap-2 px-4 py-2 rounded-xl bg-primary-500 text-white text-sm font-semibold hover:bg-primary-600 disabled:opacity-40 transition-colors"
            >
              {busy ? "Saving…" : isEdit ? "Save Changes" : "Add Record"}
            </button>
          </div>
        </form>
      </Card>
    </div>
  );
}

// ─── Delete Confirm Dialog ────────────────────────────────────────────────────

function DeleteDialog({
  id, onClose,
}: { id: string; onClose: () => void }) {
  const [deleteRecord, { isLoading }] = useDeleteExtraWorkerMutation();

  const handleConfirm = async () => {
    try {
      await deleteRecord(id).unwrap();
      toast.success("Record deleted");
      onClose();
    } catch (err: any) {
      toast.error(err?.data?.message ?? "Failed to delete");
    }
  };

  return (
    <div className="fixed inset-0 bg-secondary-100/60 z-50 flex items-center justify-center p-4">
      <Card className="!p-6 max-w-sm w-full">
        <div className="flex items-start gap-3 mb-5">
          <div className="w-10 h-10 rounded-xl bg-red-100 flex items-center justify-center shrink-0">
            <HiOutlineTrash className="w-5 h-5 text-red-500" />
          </div>
          <div>
            <h3 className="text-base font-bold text-secondary-100">Delete Record</h3>
            <p className="text-sm text-custom-700 mt-1">This action cannot be undone.</p>
          </div>
        </div>
        <div className="flex gap-3 justify-end">
          <button
            onClick={onClose}
            disabled={isLoading}
            className="px-4 py-2 rounded-xl border border-custom-300 text-sm font-semibold text-secondary-100 hover:bg-custom-100 disabled:opacity-40 transition-colors"
          >
            Cancel
          </button>
          <button
            onClick={handleConfirm}
            disabled={isLoading}
            className="flex items-center gap-2 px-4 py-2 rounded-xl bg-red-500 text-white text-sm font-semibold hover:bg-red-600 disabled:opacity-40 transition-colors"
          >
            <HiOutlineTrash className="w-4 h-4" />
            {isLoading ? "Deleting…" : "Yes, Delete"}
          </button>
        </div>
      </Card>
    </div>
  );
}

// ─── Main Page ────────────────────────────────────────────────────────────────

export default function ExtraWorkersPage() {
  const userRole = useAppSelector((s) => s.auth.user?.role);
  const canDelete  = userRole === "ADMIN" || userRole === "DAF" || userRole === "SUPERVISOR" || userRole === "PRODUCTION_MANAGER";
  const canApprove = userRole === "ADMIN" || userRole === "DAF";

  // ── Filter state ──
  const [search,       setSearch]       = useState("");
  const [dateFilter,   setDateFilter]   = useState("");
  const [genderFilter, setGenderFilter] = useState<Gender | "">("");
  const [statusFilter, setStatusFilter] = useState<ApprovalStatus | "">("");
  const [page,         setPage]         = useState(1);

  // ── Modal state ──
  const [formTarget,    setFormTarget]    = useState<ExtraWorker | "new" | null>(null);
  const [viewTarget,    setViewTarget]    = useState<ExtraWorker | null>(null);
  const [deleteTarget,  setDeleteTarget]  = useState<string | null>(null);
  const [approveTarget, setApproveTarget] = useState<{ record: ExtraWorker; decision: "APPROVED" | "REJECTED" } | null>(null);

  // ── Query — passes date filter to backend, search is client-side ──
  const { data, isLoading, refetch } = useGetExtraWorkersQuery({
    page,
    limit: PAGE_SIZE,
    ...(dateFilter && { date: dateFilter }),
  });

  const records = data?.data ?? [];
  const totalPages = data?.totalPages ?? 1;

  // ── Client-side search + gender filter ──
  const filtered = useMemo(() => {
    const q = search.trim().toLowerCase();
    return records.filter((r) => {
      if (genderFilter && r.gender !== genderFilter) return false;
      if (statusFilter && (r.status ?? "PENDING") !== statusFilter) return false;
      if (q && !r.fullName.toLowerCase().includes(q) && !r.task.toLowerCase().includes(q)) return false;
      return true;
    });
  }, [records, search, genderFilter, statusFilter]);

  // ── KPI counts from current page data ──
  const today = new Date().toISOString().slice(0, 10);
  const males      = records.filter((r) => r.gender === "MALE").length;
  const females    = records.filter((r) => r.gender === "FEMALE").length;
  const todayCount = records.filter((r) => r.date?.slice(0, 10) === today).length;
  const pending    = records.filter((r) => (r.status ?? "PENDING") === "PENDING").length;
  const approved   = records.filter((r) => r.status === "APPROVED").length;
  const rejected   = records.filter((r) => r.status === "REJECTED").length;

  const clearFilters = () => {
    setSearch("");
    setDateFilter("");
    setGenderFilter("");
    setStatusFilter("");
    setPage(1);
  };

  return (
    <DashboardLayout>
      <div className="space-y-6 font-[family-name:var(--font-family-primary)]">

        {/* Page Header */}
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-xl bg-primary-100 flex items-center justify-center">
            <HiOutlineUsers className="w-5 h-5 text-primary-600" />
          </div>
          <div>
            <h1 className="text-2xl md:text-3xl font-bold text-secondary-100">Extra Workers</h1>
            <p className="text-sm text-custom-700 mt-0.5">
              Weekend &amp; after-hours work records
            </p>
          </div>
        </div>

        {/* KPI Cards */}
        <KpiCards
          total={data?.total ?? 0}
          males={males}
          females={females}
          today={todayCount}
          pending={pending}
          approved={approved}
          rejected={rejected}
          loading={isLoading}
        />

        {/* Filters */}
        <FiltersBar
          search={search}           onSearch={(v) => { setSearch(v); setPage(1); }}
          dateFilter={dateFilter}   onDate={(v) => { setDateFilter(v); setPage(1); }}
          genderFilter={genderFilter} onGender={(v) => { setGenderFilter(v); setPage(1); }}
          statusFilter={statusFilter} onStatus={(v) => { setStatusFilter(v); setPage(1); }}
          onClear={clearFilters}
          loading={isLoading}
          onRefresh={refetch}
          onAdd={() => setFormTarget("new")}
        />

        {/* Table */}
        <ExtraWorkersTable
          records={filtered}
          loading={isLoading}
          canDelete={canDelete}
          canApprove={canApprove}
          onView={(r) => setViewTarget(r)}
          onEdit={(r) => setFormTarget(r)}
          onDelete={(id) => setDeleteTarget(id)}
          onApprove={(r, decision) => setApproveTarget({ record: r, decision })}
        />

        {/* Pagination */}
        <Pagination page={page} totalPages={totalPages} onPage={setPage} />

      </div>

      {/* Form Modal */}
      {formTarget !== null && (
        <ExtraWorkerFormModal
          record={formTarget === "new" ? undefined : formTarget}
          onClose={() => setFormTarget(null)}
        />
      )}

      {/* View Modal */}
      {viewTarget && (
        <ViewModal
          record={viewTarget}
          onClose={() => setViewTarget(null)}
          onEdit={() => setFormTarget(viewTarget)}
          onApprove={(decision) => setApproveTarget({ record: viewTarget, decision })}
          canApprove={canApprove}
        />
      )}

      {/* Approval Modal */}
      {approveTarget && (
        <ApprovalModal
          record={approveTarget.record}
          initialDecision={approveTarget.decision}
          onClose={() => setApproveTarget(null)}
        />
      )}

      {/* Delete Confirm */}
      {deleteTarget && (
        <DeleteDialog
          id={deleteTarget}
          onClose={() => setDeleteTarget(null)}
        />
      )}
    </DashboardLayout>
  );
}
