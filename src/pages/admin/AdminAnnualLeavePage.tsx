import { useState, useRef, useEffect } from "react";
import {
  HiOutlineCalendar,
  HiOutlineRefresh,
  HiOutlineX,
  HiOutlineSearch,
  HiOutlineUpload,
  HiOutlineEye,
  HiOutlinePencil,
  HiOutlineTrash,
  HiOutlinePlus,
  HiOutlineDocumentText,
  HiOutlineDownload,
  HiOutlineDotsVertical,
  HiOutlineBell,
} from "react-icons/hi";
import { toast } from "react-toastify";
import { DashboardLayout } from "../../components";
import { Card } from "../../components/ui";
import {
  useGetAnnualLeavesQuery,
  useCreateAnnualLeaveMutation,
  useUpdateAnnualLeaveMutation,
  useDeleteAnnualLeaveMutation,
  useImportAnnualLeavesMutation,
  type AnnualLeave,
  type CreateAnnualLeavePayload,
  type CountdownResult,
} from "../../store/services/annualLeaveService";

// ─── Helpers ──────────────────────────────────────────────────────────────────

function fmt(d?: string | null) {
  if (!d) return "—";
  return new Date(d).toLocaleDateString("en-GB", { day: "2-digit", month: "short", year: "numeric" });
}

function CountdownBadge({ cd }: { cd?: CountdownResult | null }) {
  if (!cd) return <span className="text-xs text-custom-400">—</span>;
  if (cd.status === "upcoming")
    return <span className="inline-flex items-center text-xs font-semibold px-2 py-0.5 rounded-full bg-blue-100 text-blue-700">Starts in {cd.daysUntilStart}d</span>;
  if (cd.status === "ongoing")
    return <span className="inline-flex items-center text-xs font-semibold px-2 py-0.5 rounded-full bg-emerald-100 text-emerald-700">{cd.daysRemaining}d left / {cd.totalDays}d</span>;
  return <span className="inline-flex items-center text-xs font-semibold px-2 py-0.5 rounded-full bg-custom-100 text-custom-500">Ended {cd.daysAgo}d ago</span>;
}

function CountdownBlock({ label, period, cd }: { label: string; period?: string | null; cd?: CountdownResult | null }) {
  if (!period) return null;
  const pct = cd?.status === "ongoing" && cd.totalDays > 0
    ? Math.round(((cd.totalDays - (cd.daysRemaining ?? 0)) / cd.totalDays) * 100)
    : cd?.status === "completed" ? 100 : 0;
  return (
    <div className="rounded-xl border border-custom-200 p-3 space-y-2">
      <div className="flex items-center justify-between">
        <span className="text-xs font-bold text-secondary-100">{label}</span>
        <CountdownBadge cd={cd} />
      </div>
      <p className="text-xs text-custom-700">{period}</p>
      {cd?.status === "ongoing" && (
        <div className="w-full h-1.5 rounded-full bg-custom-200 overflow-hidden">
          <div className="h-full rounded-full bg-emerald-500 transition-all" style={{ width: `${pct}%` }} />
        </div>
      )}
    </div>
  );
}

const inputCls =
  "w-full px-3 py-2.5 rounded-xl border border-custom-300 bg-style-500 text-secondary-100 " +
  "text-sm placeholder:text-custom-700 focus:outline-none focus:border-primary-400 " +
  "focus:ring-2 focus:ring-primary-200 transition-colors " +
  "font-[family-name:var(--font-family-primary)]";

// ─── Actions Dropdown ─────────────────────────────────────────────────────────

function ActionsDropdown({
  onView,
  onEdit,
  onDelete,
}: {
  row: AnnualLeave;
  onView: () => void;
  onEdit: () => void;
  onDelete: () => void;
}) {
  const [open, setOpen] = useState(false);
  const ref = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (!open) return;
    const handler = (e: MouseEvent) => {
      if (ref.current && !ref.current.contains(e.target as Node)) setOpen(false);
    };
    document.addEventListener("mousedown", handler);
    return () => document.removeEventListener("mousedown", handler);
  }, [open]);

  const actions = [
    { label: "View Details", icon: <HiOutlineEye className="w-4 h-4" />, onClick: onView, cls: "text-primary-600 hover:bg-primary-50" },
    { label: "Edit", icon: <HiOutlinePencil className="w-4 h-4" />, onClick: onEdit, cls: "text-secondary-100 hover:bg-custom-100" },
    { label: "Delete", icon: <HiOutlineTrash className="w-4 h-4" />, onClick: onDelete, cls: "text-red-600 hover:bg-red-50" },
  ];

  return (
    <div ref={ref} className="relative">
      <button
        onClick={() => setOpen((p) => !p)}
        className="p-1.5 rounded-lg text-custom-700 hover:bg-custom-100 transition-colors"
      >
        <HiOutlineDotsVertical className="w-4 h-4" />
      </button>
      {open && (
        <div className="absolute right-0 z-50 mt-1 w-44 bg-style-500 border border-custom-200 rounded-xl shadow-lg overflow-hidden">
          {actions.map((a) => (
            <button
              key={a.label}
              onClick={() => { setOpen(false); a.onClick(); }}
              className={`w-full flex items-center gap-2.5 px-3 py-2 text-sm font-semibold transition-colors ${a.cls}`}
            >
              {a.icon} {a.label}
            </button>
          ))}
        </div>
      )}
    </div>
  );
}

// ─── Create / Edit Modal ──────────────────────────────────────────────────────

interface FormState {
  fullNames: string;
  firstLeave: string;
  secondLeave: string;
  notes: string;
}

const emptyForm = (): FormState => ({
  fullNames: "",
  firstLeave: "",
  secondLeave: "",
  notes: "",
});

function AnnualLeaveFormModal({
  editing,
  onClose,
  onSuccess,
}: {
  editing?: AnnualLeave;
  onClose: () => void;
  onSuccess: () => void;
}) {
  const [form, setForm] = useState<FormState>(
    editing
      ? {
          fullNames:   editing.fullNames,
          firstLeave:  editing.firstLeave  ?? "",
          secondLeave: editing.secondLeave ?? "",
          notes:       editing.notes ?? "",
        }
      : emptyForm()
  );

  const [createLeave, { isLoading: creating }] = useCreateAnnualLeaveMutation();
  const [updateLeave, { isLoading: updating }] = useUpdateAnnualLeaveMutation();
  const isLoading = creating || updating;

  const set = (k: keyof FormState) => (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) =>
    setForm((p) => ({ ...p, [k]: e.target.value }));

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!form.fullNames.trim()) { toast.error("Employee name is required"); return; }
    if (!form.firstLeave && !form.secondLeave) {
      toast.error("At least one leave period is required"); return;
    }

    const payload: CreateAnnualLeavePayload = {
      fullNames:   form.fullNames.trim(),
      firstLeave:  form.firstLeave  || undefined,
      secondLeave: form.secondLeave || undefined,
      notes:       form.notes.trim() || undefined,
    };

    try {
      if (editing) {
        await updateLeave({ id: editing.id, ...payload }).unwrap();
        toast.success("Annual leave updated");
      } else {
        await createLeave(payload).unwrap();
        toast.success("Annual leave created");
      }
      onSuccess();
    } catch (err: any) {
      toast.error(err?.data?.message ?? "Failed to save");
    }
  };

  return (
    <div className="fixed inset-0 bg-secondary-100/50 z-50 flex items-start justify-center p-4 overflow-y-auto">
      <Card className="!p-6 max-w-lg w-full my-8">
        <div className="flex items-center justify-between mb-5">
          <div>
            <h3 className="text-xl font-bold text-secondary-100">
              {editing ? "Edit Annual Leave" : "Add Annual Leave"}
            </h3>
            <p className="text-sm text-custom-700 mt-0.5">
              Leave days are calculated automatically by the server
            </p>
          </div>
          <button onClick={onClose} className="text-custom-700 hover:text-secondary-100">
            <HiOutlineX className="w-6 h-6" />
          </button>
        </div>

        <form onSubmit={handleSubmit} className="space-y-4">
          {/* Employee Name */}
          <div>
            <label className="block text-sm font-semibold text-secondary-100 mb-1.5">
              Employee Name *
            </label>
            <input
              type="text"
              value={form.fullNames}
              onChange={set("fullNames")}
              placeholder="Full name of the employee"
              className={inputCls}
            />
          </div>

          {/* First Leave Period */}
          <div className="rounded-xl border border-custom-200 p-4 space-y-3">
            <p className="text-sm font-bold text-secondary-100">First Leave Period</p>
            <input
              type="text"
              value={form.firstLeave}
              onChange={set("firstLeave")}
              placeholder="e.g. 03/07/2026 - 16/07/2026"
              className={inputCls}
            />
          </div>

          {/* Second Leave Period */}
          <div className="rounded-xl border border-custom-200 p-4 space-y-3">
            <p className="text-sm font-bold text-secondary-100">Second Leave Period <span className="text-custom-700 font-normal">(optional)</span></p>
            <input
              type="text"
              value={form.secondLeave}
              onChange={set("secondLeave")}
              placeholder="e.g. 01/10/2026 – 13/10/2026"
              className={inputCls}
            />
          </div>

          {/* Notes */}
          <div>
            <label className="block text-sm font-semibold text-secondary-100 mb-1.5">Notes <span className="text-custom-700 font-normal">(optional)</span></label>
            <textarea
              value={form.notes}
              onChange={set("notes")}
              rows={2}
              placeholder="Any additional notes..."
              className="w-full px-3 py-2.5 rounded-xl border border-custom-300 bg-style-500 text-secondary-100 text-sm placeholder:text-custom-700 focus:outline-none focus:border-primary-400 transition-colors resize-none font-[family-name:var(--font-family-primary)]"
            />
          </div>

          <div className="flex gap-3 justify-end pt-2 border-t border-custom-300">
            <button type="button" onClick={onClose}
              className="px-4 py-2 rounded-xl border border-custom-300 text-sm font-semibold text-secondary-100 hover:bg-custom-100 transition-colors">
              Cancel
            </button>
            <button type="submit" disabled={isLoading}
              className="px-4 py-2 rounded-xl bg-primary-500 text-white text-sm font-semibold hover:bg-primary-600 disabled:opacity-40 transition-colors">
              {isLoading ? "Saving..." : editing ? "Save Changes" : "Create"}
            </button>
          </div>
        </form>
      </Card>
    </div>
  );
}

// ─── Detail Modal ─────────────────────────────────────────────────────────────

function DetailModal({
  leave,
  onClose,
  onEdit,
}: {
  leave: AnnualLeave;
  onClose: () => void;
  onEdit: () => void;
}) {
  const totalDays = (leave.firstLeaveDays ?? 0) + (leave.secondLeaveDays ?? 0);

  return (
    <div className="fixed inset-0 bg-secondary-100/50 z-50 overflow-y-auto">
      <div className="flex min-h-full items-start justify-center p-4">
      <Card className="!p-6 max-w-lg w-full my-8">
        <div className="flex items-center justify-between mb-5">
          <h3 className="text-xl font-bold text-secondary-100">Annual Leave Details</h3>
          <button onClick={onClose} className="text-custom-700 hover:text-secondary-100">
            <HiOutlineX className="w-6 h-6" />
          </button>
        </div>

        <div className="space-y-3 mb-4">
          <div className="flex items-center justify-between">
            <span className="text-sm text-custom-700">Employee</span>
            <span className="text-sm font-semibold text-secondary-100">{leave.fullNames}</span>
          </div>
          <div className="flex items-center justify-between">
            <span className="text-sm text-custom-700">Total Days</span>
            <span className="text-sm font-bold text-secondary-100">{totalDays > 0 ? `${totalDays} day(s)` : "—"}</span>
          </div>
          <div className="flex items-center justify-between">
            <span className="text-sm text-custom-700">Created</span>
            <span className="text-sm font-semibold text-secondary-100">{fmt(leave.createdAt)}</span>
          </div>

          <div className="space-y-2 pt-1">
            <CountdownBlock label="First Leave Period" period={leave.firstLeave} cd={leave.firstLeaveCountdown} />
            <CountdownBlock label="Second Leave Period" period={leave.secondLeave} cd={leave.secondLeaveCountdown} />
          </div>

          {leave.notes && (
            <div>
              <p className="text-sm text-custom-700 mb-1">Notes</p>
              <p className="text-sm text-secondary-100 bg-custom-50 rounded-xl p-3">{leave.notes}</p>
            </div>
          )}
        </div>

        <div className="flex gap-2 justify-end border-t border-custom-300 pt-4">
          <button onClick={onEdit}
            className="flex items-center gap-1.5 px-3 py-2 rounded-xl text-sm font-semibold text-secondary-100 border border-custom-300 hover:bg-custom-100 transition-colors">
            <HiOutlinePencil className="w-4 h-4" /> Edit
          </button>
          <button onClick={onClose}
            className="px-4 py-2 rounded-xl border border-custom-300 text-sm font-semibold text-secondary-100 hover:bg-custom-100 transition-colors">
            Close
          </button>
        </div>
      </Card>
      </div>
    </div>
  );
}

// ─── Delete Confirm Modal ────────────────────────────────────────────────────

function DeleteModal({
  leave,
  onClose,
  onSuccess,
}: {
  leave: AnnualLeave;
  onClose: () => void;
  onSuccess: () => void;
}) {
  const [deleteLeave, { isLoading }] = useDeleteAnnualLeaveMutation();

  const handleDelete = async () => {
    try {
      await deleteLeave(leave.id).unwrap();
      toast.success("Record deleted");
      onSuccess();
    } catch (err: any) {
      toast.error(err?.data?.message ?? "Failed to delete");
    }
  };

  return (
    <div className="fixed inset-0 bg-secondary-100/50 z-50 flex items-center justify-center p-4">
      <Card className="!p-6 max-w-sm w-full">
        <div className="flex items-center gap-3 mb-4">
          <div className="w-10 h-10 rounded-full bg-red-100 flex items-center justify-center shrink-0">
            <HiOutlineTrash className="w-5 h-5 text-red-600" />
          </div>
          <div>
            <h3 className="text-lg font-bold text-secondary-100">Delete Record</h3>
            <p className="text-sm text-custom-700">This action cannot be undone.</p>
          </div>
        </div>
        <div className="rounded-xl bg-red-50 border border-red-200 p-3 mb-5 text-sm">
          <span className="text-red-700">You are about to delete the annual leave record for </span>
          <span className="font-bold text-red-800">{leave.fullNames}</span>.
        </div>
        <div className="flex gap-3 justify-end">
          <button onClick={onClose}
            className="px-4 py-2 rounded-xl border border-custom-300 text-sm font-semibold text-secondary-100 hover:bg-custom-100 transition-colors">
            Cancel
          </button>
          <button onClick={handleDelete} disabled={isLoading}
            className="px-4 py-2 rounded-xl bg-red-600 hover:bg-red-700 text-white text-sm font-semibold disabled:opacity-40 transition-colors">
            {isLoading ? "Deleting..." : "Yes, Delete"}
          </button>
        </div>
      </Card>
    </div>
  );
}

// ─── Import Modal ─────────────────────────────────────────────────────────────

function ImportModal({ onClose, onSuccess }: { onClose: () => void; onSuccess: () => void }) {
  const [file, setFile] = useState<File | null>(null);
  const fileRef = useRef<HTMLInputElement>(null);
  const [importLeaves, { isLoading }] = useImportAnnualLeavesMutation();

  const handleImport = async () => {
    if (!file) { toast.error("Please select an Excel file (.xlsx)"); return; }
    const fd = new FormData();
    fd.append("file", file);
    try {
      const res = await importLeaves(fd).unwrap();
      toast.success(`Imported ${res.imported} record(s) successfully`);
      if (res.errors?.length) {
        toast.warn(`${res.errors.length} row(s) had errors — check console`);
        console.warn("[Annual Leave Import errors]", res.errors);
      }
      onSuccess();
    } catch (err: any) {
      toast.error(err?.data?.message ?? "Import failed");
    }
  };

  return (
    <div className="fixed inset-0 bg-secondary-100/50 z-50 flex items-start justify-center p-4 overflow-y-auto">
      <Card className="!p-6 max-w-md w-full my-8">
        <div className="flex items-center justify-between mb-5">
          <div>
            <h3 className="text-xl font-bold text-secondary-100">Import Annual Leaves</h3>
            <p className="text-sm text-custom-700 mt-0.5">Upload your Excel spreadsheet (.xlsx)</p>
          </div>
          <button onClick={onClose} className="text-custom-700 hover:text-secondary-100">
            <HiOutlineX className="w-6 h-6" />
          </button>
        </div>

        <div className="space-y-4">
          {/* Info box */}
          <div className="rounded-xl bg-blue-50 border border-blue-200 p-3 text-sm text-blue-700 space-y-1">
            <p className="font-semibold">Expected columns in your Excel file:</p>
            <ul className="list-disc list-inside text-xs space-y-0.5">
              <li><strong>Noms</strong> — employee full name</li>
              <li><strong>Dates de congés</strong> — leave date ranges</li>
            </ul>
            <p className="text-xs mt-1">The server auto-detects merged header rows, calculates leave days, and bulk-inserts all rows.</p>
          </div>

          {/* File drop zone */}
          <label className="flex flex-col items-center justify-center gap-3 px-4 py-8 rounded-xl border-2 border-dashed border-custom-300 bg-style-500 cursor-pointer hover:border-primary-400 transition-colors">
            <HiOutlineUpload className="w-8 h-8 text-custom-400" />
            <div className="text-center">
              <p className="text-sm font-semibold text-secondary-100">
                {file ? file.name : "Click to select Excel file"}
              </p>
              <p className="text-xs text-custom-700 mt-0.5">
                {file ? `${(file.size / 1024).toFixed(1)} KB` : "Supports .xlsx format"}
              </p>
            </div>
            <input
              ref={fileRef}
              type="file"
              accept=".xlsx,application/vnd.openxmlformats-officedocument.spreadsheetml.sheet"
              className="hidden"
              onChange={(e) => setFile(e.target.files?.[0] ?? null)}
            />
          </label>

          {file && (
            <div className="flex items-center justify-between px-3 py-2 rounded-xl bg-custom-50 border border-custom-200 text-sm">
              <div className="flex items-center gap-2">
                <HiOutlineDocumentText className="w-4 h-4 text-primary-600" />
                <span className="font-medium text-secondary-100 truncate max-w-[200px]">{file.name}</span>
              </div>
              <button onClick={() => { setFile(null); if (fileRef.current) fileRef.current.value = ""; }}
                className="text-red-500 hover:underline text-xs font-semibold shrink-0 ml-2">
                Remove
              </button>
            </div>
          )}

          <div className="flex gap-3 justify-end pt-2 border-t border-custom-300">
            <button type="button" onClick={onClose}
              className="px-4 py-2 rounded-xl border border-custom-300 text-sm font-semibold text-secondary-100 hover:bg-custom-100 transition-colors">
              Cancel
            </button>
            <button onClick={handleImport} disabled={!file || isLoading}
              className="flex items-center gap-2 px-4 py-2 rounded-xl bg-primary-500 text-white text-sm font-semibold hover:bg-primary-600 disabled:opacity-40 transition-colors">
              <HiOutlineDownload className="w-4 h-4" />
              {isLoading ? "Importing..." : "Import"}
            </button>
          </div>
        </div>
      </Card>
    </div>
  );
}

// ─── Main Page ────────────────────────────────────────────────────────────────

export default function AdminAnnualLeavePage() {
  const [search, setSearch] = useState("");
  const [page, setPage] = useState(1);
  const [showCreate, setShowCreate] = useState(false);
  const [editing, setEditing] = useState<AnnualLeave | null>(null);
  const [detail, setDetail] = useState<AnnualLeave | null>(null);
  const [deleteTarget, setDeleteTarget] = useState<AnnualLeave | null>(null);
  const [showImport, setShowImport] = useState(false);

  const { data, isLoading, refetch } = useGetAnnualLeavesQuery({ page, limit: 7 });

  const all = data?.data ?? [];
  const totalPages = data?.totalPages ?? 1;
  const total = data?.total ?? 0;

  const upcomingSoon = all.filter((r) => {
    const cd1 = r.firstLeaveCountdown;
    const cd2 = r.secondLeaveCountdown;
    return (
      (cd1?.status === "upcoming" && (cd1.daysUntilStart ?? Infinity) >= 1 && (cd1.daysUntilStart ?? Infinity) <= 3) ||
      (cd2?.status === "upcoming" && (cd2.daysUntilStart ?? Infinity) >= 1 && (cd2.daysUntilStart ?? Infinity) <= 3)
    );
  });

  const [alertDismissed, setAlertDismissed] = useState(false);

  const rows = all.filter((r) => {
    const q = search.trim().toLowerCase();
    return !q || (r.fullNames ?? "").toLowerCase().includes(q);
  });


  return (
    <DashboardLayout userRole="admin">
      <div className="space-y-6 font-[family-name:var(--font-family-primary)]">

        {/* Header */}
        <div className="flex items-start justify-between gap-4 flex-wrap">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-indigo-100 flex items-center justify-center">
              <HiOutlineCalendar className="w-5 h-5 text-indigo-600" />
            </div>
            <div>
              <h1 className="text-2xl md:text-3xl font-bold text-secondary-100">Annual Leave</h1>
              <p className="text-sm text-custom-700 mt-0.5">Manage employee annual leave records</p>
            </div>
          </div>
          <div className="flex items-center gap-2 flex-wrap">
            <button onClick={() => refetch()}
              className="p-2 rounded-xl border border-custom-300 hover:bg-custom-100 transition-colors text-custom-700" title="Refresh">
              <HiOutlineRefresh className={`w-4 h-4 ${isLoading ? "animate-spin" : ""}`} />
            </button>
            <button onClick={() => setShowImport(true)}
              className="flex items-center gap-2 px-4 py-2 rounded-xl border border-custom-300 text-sm font-semibold text-secondary-100 hover:bg-custom-100 transition-colors">
              <HiOutlineUpload className="w-4 h-4" /> Import Excel
            </button>
            <button onClick={() => setShowCreate(true)}
              className="flex items-center gap-2 px-4 py-2 rounded-xl bg-primary-500 text-white text-sm font-semibold hover:bg-primary-600 transition-colors">
              <HiOutlinePlus className="w-4 h-4" /> Add Record
            </button>
          </div>
        </div>

        {/* Upcoming Soon Alert */}
        {!alertDismissed && upcomingSoon.length > 0 && (
          <div className="rounded-xl border border-amber-300 bg-amber-50 px-4 py-3 flex items-start gap-3">
            <HiOutlineBell className="w-5 h-5 text-amber-600 shrink-0 mt-0.5" />
            <div className="flex-1 min-w-0">
              <p className="text-sm font-bold text-amber-800">
                {upcomingSoon.length} employee{upcomingSoon.length > 1 ? "s" : ""} starting leave within 3 days
              </p>
              <ul className="mt-1 space-y-0.5">
                {upcomingSoon.map((r) => {
                  const isFirst = r.firstLeaveCountdown?.status === "upcoming" && (r.firstLeaveCountdown.daysUntilStart ?? Infinity) <= 3;
                  const cd = isFirst ? r.firstLeaveCountdown : r.secondLeaveCountdown;
                  const period = isFirst ? r.firstLeave : r.secondLeave;
                  return (
                    <li key={r.id} className="text-xs text-amber-700">
                      <span className="font-semibold">{r.fullNames}</span>
                      {" — "}{period}
                      {cd?.daysUntilStart === 0 ? " (starts today!)" : ` (in ${cd?.daysUntilStart}d)`}
                    </li>
                  );
                })}
              </ul>
            </div>
            <button onClick={() => setAlertDismissed(true)} className="text-amber-500 hover:text-amber-700 shrink-0">
              <HiOutlineX className="w-4 h-4" />
            </button>
          </div>
        )}

        {/* Summary Cards */}
        <div className="grid grid-cols-1 gap-4">
          <Card className="!p-4">
            <p className="text-xs text-custom-700 mb-1">Total Records</p>
            <p className="text-2xl font-bold text-secondary-100">{isLoading ? "—" : total}</p>
          </Card>
        </div>

        {/* Search */}
        <div className="relative">
          <HiOutlineSearch className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-custom-700" />
          <input
            type="text"
            value={search}
            onChange={(e) => { setSearch(e.target.value); setPage(1); }}
            placeholder="Search by employee name..."
            className="w-full pl-9 pr-4 py-2 rounded-xl border border-custom-300 bg-style-500 text-secondary-100 text-sm placeholder:text-custom-700 focus:outline-none focus:border-primary-400 transition-colors"
          />
        </div>

        {/* Table */}
        {isLoading ? (
          <div className="space-y-2">
            {Array.from({ length: 6 }).map((_, i) => (
              <Card key={i} className="!p-4 animate-pulse">
                <div className="h-4 w-1/3 bg-custom-200 rounded mb-2" />
                <div className="h-3 w-full bg-custom-200 rounded" />
              </Card>
            ))}
          </div>
        ) : rows.length === 0 ? (
          <Card className="!p-10 text-center">
            <HiOutlineCalendar className="w-10 h-10 text-custom-400 mx-auto mb-3" />
            <p className="font-semibold text-secondary-100">No annual leave records found</p>
            <p className="text-sm text-custom-700 mt-1">
              {search ? `No results for "${search}"` : "Import an Excel file or add records manually"}
            </p>
          </Card>
        ) : (
          <Card className="!p-0 overflow-hidden">
            <div className="overflow-x-auto">
              <table className="w-full text-sm">
                <thead className="bg-custom-50">
                  <tr>
                    {[
                      "Employee",
                      "1st Period",
                      "1st Days",
                      "2nd Period",
                      "2nd Days",
                      "Total Days",
                      "Countdown",
                      "Actions",
                    ].map((h) => (
                      <th
                        key={h}
                        className="px-4 py-3 text-left text-xs font-bold text-custom-500 uppercase tracking-wider whitespace-nowrap"
                      >
                        {h}
                      </th>
                    ))}
                  </tr>
                </thead>
                <tbody className="divide-y divide-custom-100">
                  {rows.map((row) => (
                    <tr key={row.id} className="hover:bg-custom-50 transition-colors">
                      <td className="px-4 py-3">
                        <div className="flex items-center gap-2">
                          <div className="w-7 h-7 rounded-full bg-indigo-100 flex items-center justify-center shrink-0">
                            <span className="text-xs font-bold text-indigo-600">
                              {(row.fullNames ?? "?").charAt(0).toUpperCase()}
                            </span>
                          </div>
                          <span className="font-semibold text-secondary-100 whitespace-nowrap">
                            {row.fullNames}
                          </span>
                        </div>
                      </td>
                      <td className="px-4 py-3 text-custom-700 whitespace-nowrap">
                        {row.firstLeave ?? "—"}
                      </td>
                      <td className="px-4 py-3 text-custom-700 whitespace-nowrap">
                        {row.firstLeaveDays != null ? `${row.firstLeaveDays}d` : "—"}
                      </td>
                      <td className="px-4 py-3 text-custom-700 whitespace-nowrap">
                        {row.secondLeave ?? "—"}
                      </td>
                      <td className="px-4 py-3 text-custom-700 whitespace-nowrap">
                        {row.secondLeaveDays != null ? `${row.secondLeaveDays}d` : "—"}
                      </td>
                      <td className="px-4 py-3 font-bold text-secondary-100 whitespace-nowrap">
                        {(row.firstLeaveDays ?? 0) + (row.secondLeaveDays ?? 0)}d
                      </td>
                      <td className="px-4 py-3 whitespace-nowrap">
                        <div className="flex flex-col gap-1">
                          <CountdownBadge cd={row.firstLeaveCountdown} />
                          {row.secondLeave && <CountdownBadge cd={row.secondLeaveCountdown} />}
                        </div>
                      </td>
                      <td className="px-4 py-3 whitespace-nowrap">
                        <ActionsDropdown
                          row={row}
                          onView={() => setDetail(row)}
                          onEdit={() => setEditing(row)}
                          onDelete={() => setDeleteTarget(row)}
                        />
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </Card>
        )}

        {/* Pagination */}
        {totalPages > 1 && (
          <div className="flex items-center justify-between px-2 text-sm">
            <span className="text-custom-700">
              {total} total · page {page} of {totalPages}
            </span>
            <div className="flex gap-2">
              <button
                disabled={page <= 1}
                onClick={() => setPage((p) => p - 1)}
                className="px-3 py-1.5 rounded-lg border border-custom-300 text-custom-700 hover:bg-custom-100 disabled:opacity-40 disabled:cursor-not-allowed text-xs font-semibold transition-colors"
              >
                ← Prev
              </button>
              {Array.from({ length: totalPages }, (_, i) => i + 1).map((p) => (
                <button
                  key={p}
                  onClick={() => setPage(p)}
                  className={`px-3 py-1.5 rounded-lg text-xs font-semibold transition-colors ${
                    p === page
                      ? "bg-primary-500 text-white"
                      : "border border-custom-300 text-custom-700 hover:bg-custom-100"
                  }`}
                >
                  {p}
                </button>
              ))}
              <button
                disabled={page >= totalPages}
                onClick={() => setPage((p) => p + 1)}
                className="px-3 py-1.5 rounded-lg border border-custom-300 text-custom-700 hover:bg-custom-100 disabled:opacity-40 disabled:cursor-not-allowed text-xs font-semibold transition-colors"
              >
                Next →
              </button>
            </div>
          </div>
        )}
      </div>

      {/* Modals */}


      {showCreate && (
        <AnnualLeaveFormModal
          onClose={() => setShowCreate(false)}
          onSuccess={() => { setShowCreate(false); refetch(); }}
        />
      )}

      {editing && (
        <AnnualLeaveFormModal
          editing={editing}
          onClose={() => setEditing(null)}
          onSuccess={() => { setEditing(null); refetch(); }}
        />
      )}

      {detail && (
        <DetailModal
          leave={detail}
          onClose={() => setDetail(null)}
          onEdit={() => { setEditing(detail); setDetail(null); }}
        />
      )}

      {deleteTarget && (
        <DeleteModal
          leave={deleteTarget}
          onClose={() => setDeleteTarget(null)}
          onSuccess={() => { setDeleteTarget(null); refetch(); }}
        />
      )}

      {showImport && (
        <ImportModal
          onClose={() => setShowImport(false)}
          onSuccess={() => { setShowImport(false); refetch(); }}
        />
      )}
    </DashboardLayout>
  );
}
