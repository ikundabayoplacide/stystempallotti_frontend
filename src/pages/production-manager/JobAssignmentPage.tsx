import { useEffect, useMemo, useRef, useState } from "react";
import ReactDOM from "react-dom";
import {
  HiOutlineCheckCircle,
  HiOutlineClipboardList,
  HiOutlineClock,
  HiOutlineDotsVertical,
  HiOutlineExclamationCircle,
  HiOutlineEye,
  HiOutlinePencil,
  HiOutlineRefresh,
  HiOutlineSearch,
  HiOutlineThumbDown,
  HiOutlineX,
} from "react-icons/hi";
import { DashboardLayout } from "../../components";
import { Card } from "../../components/ui";
import { useGetDepartmentsQuery } from "../../store/services/departmentsService";
import type { Job, JobState } from "../../store/services/jobsService";
import {
  useAssignJobMutation,
  useCompleteJobMutation,
  useGetJobDetailsQuery,
  useGetJobsQuery,
  useReassignJobMutation,
  useRejectJobMutation,
  useUpdateJobMutation,
} from "../../store/services/jobsService";
import { jobStatusConfig } from "../../types/JobStatus";

// ─── State badge (same as supervisor page) ────────────────────────────────────

const STATE_LABELS: Record<NonNullable<JobState>, string> = {
  "in-composition":    "In Composition",
  "in-montage":        "In Montage",
  "in-printing":       "In Printing",
  "in-binding":        "In Binding",
  "in-packaging":      "In Packaging",
  "quality-check":     "Quality Check",
  "composition-done":  "Composition Done",
  "montage-done":      "Montage Done",
  "printing-done":     "Printing Done",
  "binding-done":      "Binding Done",
  "packaging-done":    "Packaging Done",
  "qualitycheck-done": "Quality Check Done",
};

const STATE_COLORS: Record<NonNullable<JobState>, { bg: string; text: string }> = {
  "in-composition":    { bg: "bg-orange-100",  text: "text-orange-700" },
  "in-montage":        { bg: "bg-amber-100",   text: "text-amber-700" },
  "in-printing":       { bg: "bg-pink-100",    text: "text-pink-700" },
  "in-binding":        { bg: "bg-teal-100",    text: "text-teal-700" },
  "in-packaging":      { bg: "bg-cyan-100",    text: "text-cyan-700" },
  "quality-check":     { bg: "bg-purple-100",  text: "text-purple-700" },
  "composition-done":  { bg: "bg-green-100",   text: "text-green-700" },
  "montage-done":      { bg: "bg-green-100",   text: "text-green-700" },
  "printing-done":     { bg: "bg-green-100",   text: "text-green-700" },
  "binding-done":      { bg: "bg-green-100",   text: "text-green-700" },
  "packaging-done":    { bg: "bg-green-100",   text: "text-green-700" },
  "qualitycheck-done": { bg: "bg-green-100",   text: "text-green-700" },
};

function StateBadge({ state }: { state: JobState }) {
  if (!state) return <span className="text-xs text-custom-500 italic">—</span>;
  const label  = STATE_LABELS[state] ?? state;
  const colors = STATE_COLORS[state] ?? { bg: "bg-gray-100", text: "text-gray-700" };
  return (
    <span className={`px-2 py-0.5 rounded-full text-xs font-semibold ${colors.bg} ${colors.text}`}>
      {label}
    </span>
  );
}

const priorityColor: Record<string, string> = {
  low:    "bg-green-100 text-green-700",
  normal: "bg-blue-100 text-blue-700",
  high:   "bg-orange-100 text-orange-700",
  urgent: "bg-red-500 text-white",
};

const IN_PRODUCTION_STATUSES = new Set([
  "in-composition", "in-montage", "in-printing",
  "in-binding", "in-packaging", "quality-check", "ready-for-delivery",
]);

const ASSIGNABLE_STATUSES  = new Set(["confirmed", "in-composition", "in-montage", "in-printing", "in-binding", "in-packaging"]);
const REJECTABLE_STATUSES  = new Set(["confirmed"]);
const EDITABLE_STATUSES    = new Set(["confirmed"]);
const COMPLETABLE_STATES = new Set([
  "composition-done", "montage-done", "printing-done",
  "binding-done", "packaging-done", "qualitycheck-done",
]);

const PAGE_SIZE = 5;

type ModalType = "assign" | "reject" | "edit" | "complete" | null;

// ─── Job Details Modal ────────────────────────────────────────────────────────

function RowDetail({ label, value }: { label: string; value?: string | number | null }) {
  if (!value && value !== 0) return null;
  return (
    <div className="flex justify-between gap-2">
      <span className="text-custom-700 shrink-0">{label}</span>
      <span className="font-semibold text-secondary-100 text-right">{value}</span>
    </div>
  );
}

function SectionDetail({ title, children }: { title: string; children: React.ReactNode }) {
  return (
    <div>
      <p className="text-xs font-bold text-custom-700 uppercase tracking-wide mb-2">{title}</p>
      <div className="p-3 rounded-xl bg-custom-50 border border-custom-200 space-y-1.5 text-sm">
        {children}
      </div>
    </div>
  );
}

function JobDetailsModal({ jobId, onClose }: { jobId: string; onClose: () => void }) {
  const { data: d, isLoading } = useGetJobDetailsQuery(jobId);
  const items = d?.jobItems ?? [];
  return (
    <div className="fixed inset-0 bg-secondary-100/50 z-50 flex items-center justify-center p-4">
      <Card className="!p-6 w-full max-w-2xl max-h-[90vh] overflow-y-auto">
        <div className="flex items-center justify-between mb-5">
          <div>
            <h3 className="text-xl font-bold text-secondary-100">Job Details</h3>
            {d && <p className="text-xs text-custom-700 mt-0.5">{d.jobNumber} — {d.title}</p>}
          </div>
          <button onClick={onClose} className="text-custom-700 hover:text-secondary-100">
            <HiOutlineX className="w-6 h-6" />
          </button>
        </div>

        {isLoading ? (
          <p className="text-center text-custom-700 py-10">Loading…</p>
        ) : !d ? (
          <p className="text-center text-custom-700 py-10">Details not available.</p>
        ) : (
          <div className="space-y-5">
            <SectionDetail title="Client">
              <RowDetail label="Name"    value={d.customer?.name} />
              <RowDetail label="Company" value={d.customer?.company} />
              <RowDetail label="Phone"   value={d.customer?.phone} />
              <RowDetail label="Email"   value={d.customer?.email} />
            </SectionDetail>

            <SectionDetail title="Job Information">
              <RowDetail label="Job #"       value={d.jobNumber} />
              <RowDetail label="Title"       value={d.title} />
              <RowDetail label="Type"        value={d.jobType} />
              <RowDetail label="Quantity"    value={d.quantity} />
              <RowDetail label="Size"        value={d.size} />
              <RowDetail label="Color Mode"  value={d.colorMode} />
              <RowDetail label="Binding"     value={d.bindingType} />
              <RowDetail label="Priority"    value={d.priority} />
              <RowDetail label="Status"      value={d.status} />
              <RowDetail label="Deadline"    value={d.dueDate?.split("T")[0]} />
              <RowDetail label="Created"     value={new Date(d.createdAt).toLocaleDateString()} />
              {d.description && (
                <div className="pt-1 border-t border-custom-200">
                  <p className="text-custom-700 mb-0.5">Description</p>
                  <p className="text-secondary-100 font-medium leading-snug">{d.description}</p>
                </div>
              )}
              {d.notes && (
                <div className="pt-1 border-t border-custom-200">
                  <p className="text-custom-700 mb-0.5">Notes</p>
                  <p className="text-secondary-100 font-medium leading-snug">{d.notes}</p>
                </div>
              )}
            </SectionDetail>

            <SectionDetail title="Materials Needed">
              {!items.length ? (
                <p className="text-custom-700 italic">No materials listed.</p>
              ) : items.map((item) => (
                <div key={item.id} className="flex items-center justify-between">
                  <span className="font-semibold text-secondary-100">{item.stockItem?.itemName ?? "—"}</span>
                  <span className="text-xs text-custom-700">
                    {item.quantityNeeded} {item.stockItem?.unit ?? ""}{item.notes ? ` · ${item.notes}` : ""}
                  </span>
                </div>
              ))}
            </SectionDetail>

            <SectionDetail title="Financial">
              <RowDetail label="Amount"         value={d.amount != null ? `${Number(d.amount).toLocaleString()} RWF` : null} />
              <RowDetail label="Payment Status" value={d.paymentStatus} />
              <RowDetail label="Payment Method" value={d.paymentMethod} />
              <RowDetail label="Receipt #"      value={d.receiptNo} />
            </SectionDetail>

            <SectionDetail title="Department Position">
              {!d.departmentPosition ? (
                <p className="text-custom-700 italic">Not yet assigned to a department.</p>
              ) : (
                <>
                  <RowDetail label="Department"    value={d.departmentPosition.department?.name} />
                  <RowDetail label="State"         value={d.departmentPosition.state} />
                  <RowDetail label="In Production" value={d.departmentPosition.inProduction} />
                  <RowDetail label="Progress"      value={d.departmentPosition.progress} />
                  {d.departmentPosition.startedAt   && <RowDetail label="Started"   value={new Date(d.departmentPosition.startedAt).toLocaleString()} />}
                  {d.departmentPosition.completedAt && <RowDetail label="Completed" value={new Date(d.departmentPosition.completedAt).toLocaleString()} />}
                  {d.departmentPosition.supervisors?.length > 0 && (
                    <div className="pt-1 border-t border-custom-200">
                      <p className="text-custom-700 mb-1">Supervisors</p>
                      <div className="space-y-1">
                        {d.departmentPosition.supervisors.map((s) => (
                          <div key={s.id} className="flex items-center justify-between">
                            <span className="font-semibold text-secondary-100">{s.name}</span>
                            <span className="text-xs text-custom-700">{s.phone}</span>
                          </div>
                        ))}
                      </div>
                    </div>
                  )}
                </>
              )}
            </SectionDetail>

            <SectionDetail title="Assigned Workers">
              {!d.assignedWorkers?.length ? (
                <p className="text-custom-700 italic">No workers assigned.</p>
              ) : d.assignedWorkers.map((w) => (
                <div key={w.id} className="flex items-center justify-between">
                  <div>
                    <p className="font-semibold text-secondary-100">{w.fullName}</p>
                    <p className="text-xs text-custom-700">{w.department?.name ?? "—"} · {w.phoneNumber}</p>
                  </div>
                  <p className="text-xs text-custom-700">{new Date(w.EmployeeJobAssignment.assignedAt).toLocaleDateString()}</p>
                </div>
              ))}
            </SectionDetail>
          </div>
        )}

        <button
          onClick={onClose}
          className="mt-5 w-full px-4 py-2 rounded-xl bg-primary-500 text-white hover:bg-primary-600 transition-colors text-sm font-semibold"
        >
          Close
        </button>
      </Card>
    </div>
  );
}

// ─── Three-dot Action Menu ────────────────────────────────────────────────────

function ActionMenu({ job, onAction }: { job: Job; onAction: (type: ModalType, job: Job) => void }) {
  const [open, setOpen]   = useState(false);
  const [pos, setPos]     = useState<{ top: number; right: number } | null>(null);
  const btnRef  = useRef<HTMLButtonElement>(null);
  const menuRef = useRef<HTMLDivElement>(null);

  const updatePos = () => {
    const rect = btnRef.current?.getBoundingClientRect();
    if (rect) setPos({ top: rect.bottom + 4, right: window.innerWidth - rect.right });
  };

  useEffect(() => {
    if (!open) return;
    function handler(e: MouseEvent) {
      if (btnRef.current?.contains(e.target as Node)) return;
      if (menuRef.current && !menuRef.current.contains(e.target as Node)) setOpen(false);
    }
    document.addEventListener("mousedown", handler);
    window.addEventListener("scroll", updatePos, true);
    window.addEventListener("resize", updatePos);
    return () => {
      document.removeEventListener("mousedown", handler);
      window.removeEventListener("scroll", updatePos, true);
      window.removeEventListener("resize", updatePos);
    };
  }, [open]);

  if (job.status === "delivered") return null;

  const canAssign    = ASSIGNABLE_STATUSES.has(job.status);
  const canReject    = REJECTABLE_STATUSES.has(job.status);
  const canEdit      = EDITABLE_STATUSES.has(job.status);
  const canComplete  = !!job.state && COMPLETABLE_STATES.has(job.state);

  type ActionDef = { label: string; type: ModalType; icon: React.ReactNode; cls: string };
  const actions: ActionDef[] = [
    ...(canAssign   ? [{ label: job.departmentAssignedToId ? "Reassign" : "Assign", type: "assign" as ModalType, icon: <HiOutlineClipboardList className="h-4 w-4" />, cls: "text-primary-700 hover:bg-primary-50" }] : []),
    ...(canComplete ? [{ label: "Complete", type: "complete" as ModalType, icon: <HiOutlineCheckCircle className="h-4 w-4" />, cls: "text-blue-700 hover:bg-blue-50" }] : []),
    ...(canEdit     ? [{ label: "Edit",     type: "edit"     as ModalType, icon: <HiOutlinePencil className="h-4 w-4" />,     cls: "text-secondary-100 hover:bg-custom-50" }] : []),
    ...(canReject   ? [{ label: "Reject",   type: "reject"   as ModalType, icon: <HiOutlineThumbDown className="h-4 w-4" />, cls: "text-red-600 hover:bg-red-50" }] : []),
  ];

  if (actions.length === 0) return null;

  const handleOpen = () => {
    if (open) { setOpen(false); return; }
    updatePos();
    setOpen(true);
  };

  return (
    <>
      <button
        ref={btnRef}
        onClick={handleOpen}
        className="p-1.5 rounded-lg hover:bg-custom-100 text-custom-500 hover:text-secondary-100 transition-colors"
        title="Actions"
      >
        <HiOutlineDotsVertical className="h-5 w-5" />
      </button>
      {open && pos && ReactDOM.createPortal(
        <div
          ref={menuRef}
          style={{ position: "fixed", top: pos.top, right: pos.right, zIndex: 9999 }}
          className="w-44 bg-style-600 border border-custom-200 rounded-xl shadow-xl py-1 overflow-hidden"
        >
          {actions.map((a) => (
            <button
              key={a.type}
              onClick={() => { setOpen(false); onAction(a.type, job); }}
              className={`w-full flex items-center gap-2.5 px-4 py-2.5 text-sm font-semibold transition-colors ${a.cls}`}
            >
              {a.icon}{a.label}
            </button>
          ))}
        </div>,
        document.body
      )}
    </>
  );
}

// ─── Main Page ────────────────────────────────────────────────────────────────

export default function JobAssignmentPage() {
  const [search, setSearch]             = useState("");
  const [page, setPage]                 = useState(1);
  const [modalType, setModalType]       = useState<ModalType>(null);
  const [activeJob, setActiveJob]       = useState<Job | null>(null);
  const [detailsJobId, setDetailsJobId] = useState<string | null>(null);
  const [deptId, setDeptId]             = useState("");
  const [rejectReason, setRejectReason] = useState("");
  const [editTitle, setEditTitle]       = useState("");
  const [editDueDate, setEditDueDate]   = useState("");
  const [error, setError]               = useState("");

  const { data: allData, isLoading, isFetching, refetch } = useGetJobsQuery({ limit: 1000, search: search || undefined });
  const { data: departments = [] }               = useGetDepartmentsQuery();
  const [rejectJob,   { isLoading: isRejecting }]   = useRejectJobMutation();
  const [assignJob,   { isLoading: isAssigning }]   = useAssignJobMutation();
  const [reassignJob, { isLoading: isReassigning }] = useReassignJobMutation();
  const [updateJob,   { isLoading: isUpdatingJob }] = useUpdateJobMutation();
  const [completeJob, { isLoading: isCompleting }]  = useCompleteJobMutation();

  const allJobs    = allData?.jobs ?? [];
  const total      = allJobs.length;
  const totalPages = Math.max(1, Math.ceil(total / PAGE_SIZE));
  const jobs       = allJobs.slice((page - 1) * PAGE_SIZE, page * PAGE_SIZE);

  const pendingCount      = useMemo(() => allJobs.filter((j) => j.status === "pending").length, [allJobs]);
  const inProductionCount = useMemo(() => allJobs.filter((j) => IN_PRODUCTION_STATUSES.has(j.status)).length, [allJobs]);
  const assignedCount     = useMemo(() => allJobs.filter((j) => !!j.departmentAssignedToId).length, [allJobs]);
  const deptMap           = useMemo(() => Object.fromEntries(departments.map((d) => [d.id, d.name])), [departments]);

  const openModal = (type: ModalType, job: Job) => {
    setActiveJob(job);
    setModalType(type);
    setDeptId(job.departmentAssignedToId ?? "");
    setRejectReason("");
    setEditTitle(job.title);
    setEditDueDate(job.dueDate?.split("T")[0] ?? "");
    setError("");
  };

  const closeAndRefetch = () => {
    setModalType(null);
    setActiveJob(null);
    setError("");
    refetch();
  };

  const closeModal = () => { setModalType(null); setActiveJob(null); setError(""); };

  const handleAssign = async () => {
    if (!activeJob || !deptId) return;
    try {
      if (activeJob.departmentAssignedToId) {
        // PATCH /reassign — backend handles status transition
        await reassignJob({ id: activeJob.id, departmentAssignedToId: deptId }).unwrap();
      } else {
        // POST /assign — first-time assignment
        await assignJob({ id: activeJob.id, departmentAssignedToId: deptId }).unwrap();
      }
      closeAndRefetch();
    } catch (err: any) {
      setError(err?.data?.message ?? "Failed to assign job");
    }
  };

  const handleReject = async () => {
    if (!activeJob) return;
    try {
      await rejectJob({ id: activeJob.id, rejectReason: rejectReason.trim() || undefined }).unwrap();
      closeAndRefetch();
    } catch (err: any) {
      setError(err?.data?.message ?? "Failed to reject job");
    }
  };

  const handleEdit = async () => {
    if (!activeJob) return;
    try {
      await updateJob({ id: activeJob.id, title: editTitle, dueDate: editDueDate || undefined }).unwrap();
      closeAndRefetch();
    } catch (err: any) {
      setError(err?.data?.message ?? "Failed to update job");
    }
  };

  const handleComplete = async () => {
    if (!activeJob) return;
    try {
      await completeJob(activeJob.id).unwrap();
      closeAndRefetch();
    } catch (err: any) {
      setError(err?.data?.message ?? "Failed to complete job");
    }
  };

  const isSaving = isRejecting || isAssigning || isReassigning || isUpdatingJob || isCompleting;

  return (
    <DashboardLayout userRole="production-manager" userName="Production Manager" notificationCount={pendingCount}>
      <div className="space-y-6 font-[family-name:var(--font-family-primary)]">

        {/* Header */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
          <div>
            <h1 className="text-2xl md:text-3xl font-bold text-secondary-100">Job Planning</h1>
            <p className="text-sm text-custom-700 mt-1">Assign and manage jobs across departments</p>
          </div>
          <button
            onClick={() => refetch()}
            className="self-start sm:self-auto p-2 rounded-xl border border-custom-300 hover:bg-custom-100 transition-colors"
            title="Refresh"
          >
            <HiOutlineRefresh className={`w-5 h-5 text-custom-700 ${isFetching ? "animate-spin" : ""}`} />
          </button>
        </div>

        {/* Stats */}
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
          <Card className="!p-4">
            <div className="flex items-center gap-3">
              <div className="w-9 h-9 rounded-xl bg-yellow-100 flex items-center justify-center">
                <HiOutlineExclamationCircle className="w-5 h-5 text-yellow-600" />
              </div>
              <div>
                <p className="text-xs text-custom-700">Pending</p>
                <p className="text-2xl font-bold text-secondary-100">{pendingCount}</p>
              </div>
            </div>
          </Card>
          <Card className="!p-4">
            <div className="flex items-center gap-3">
              <div className="w-9 h-9 rounded-xl bg-blue-100 flex items-center justify-center">
                <HiOutlineClock className="w-5 h-5 text-blue-600" />
              </div>
              <div>
                <p className="text-xs text-custom-700">In Production</p>
                <p className="text-2xl font-bold text-secondary-100">{inProductionCount}</p>
              </div>
            </div>
          </Card>
          <Card className="!p-4">
            <div className="flex items-center gap-3">
              <div className="w-9 h-9 rounded-xl bg-green-100 flex items-center justify-center">
                <HiOutlineCheckCircle className="w-5 h-5 text-green-600" />
              </div>
              <div>
                <p className="text-xs text-custom-700">Assigned</p>
                <p className="text-2xl font-bold text-secondary-100">{assignedCount}</p>
              </div>
            </div>
          </Card>
          <Card className="!p-4">
            <div className="flex items-center gap-3">
              <div className="w-9 h-9 rounded-xl bg-primary-100 flex items-center justify-center">
                <HiOutlineClipboardList className="w-5 h-5 text-primary-600" />
              </div>
              <div>
                <p className="text-xs text-custom-700">Total</p>
                <p className="text-2xl font-bold text-secondary-100">{total}</p>
              </div>
            </div>
          </Card>
        </div>

        {/* Search */}
        <div className="relative">
          <HiOutlineSearch className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-custom-700" />
          <input
            type="text"
            value={search}
            onChange={(e) => { setSearch(e.target.value); setPage(1); }}
            placeholder="Search by job number, title or client..."
            className="w-full pl-10 pr-4 py-2 rounded-xl border border-custom-300 focus:outline-none focus:border-primary-500"
          />
        </div>

        {/* Table */}
        <Card className="!p-0 overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead className="bg-custom-100 border-b border-custom-300">
                <tr>
                  {["Job", "Client", "Status", "Dept State", "Priority", "Department", "Due Date", "Actions"].map((h) => (
                    <th key={h} className={`px-4 py-3 text-xs font-bold text-secondary-100 uppercase ${h === "Actions" ? "text-right" : "text-left"}`}>
                      {h}
                    </th>
                  ))}
                </tr>
              </thead>
              <tbody className="bg-white divide-y divide-custom-200">
                {isLoading ? (
                  <tr>
                    <td colSpan={8} className="px-4 py-12 text-center">
                      <div className="flex items-center justify-center gap-2 text-custom-700">
                        <HiOutlineRefresh className="w-5 h-5 animate-spin" />
                        <span className="text-sm">Loading jobs…</span>
                      </div>
                    </td>
                  </tr>
                ) : jobs.length === 0 ? (
                  <tr>
                    <td colSpan={8} className="px-4 py-12 text-center text-custom-700 text-sm">
                      No jobs found
                    </td>
                  </tr>
                ) : (
                  jobs.map((job) => {
                    const statusCfg = jobStatusConfig[job.status] ?? { label: job.status, bgColor: "bg-gray-100", color: "text-gray-700" };
                    return (
                      <tr key={job.id} className="hover:bg-custom-50 transition-colors">
                        <td className="px-4 py-4">
                          <span className="text-sm font-bold text-primary-600">{job.jobNumber}</span>
                          <p className="text-xs text-custom-700 mt-0.5 max-w-[160px] truncate">{job.title}</p>
                        </td>
                        <td className="px-4 py-4">
                          <span className="text-sm text-secondary-100">{job.customer?.name ?? "—"}</span>
                        </td>
                        <td className="px-4 py-4">
                          <span className={`px-2.5 py-1 rounded-full text-xs font-semibold ${statusCfg.bgColor} ${statusCfg.color}`}>
                            {statusCfg.label}
                          </span>
                        </td>
                        <td className="px-4 py-4">
                          <StateBadge state={job.state ?? null} />
                        </td>
                        <td className="px-4 py-4">
                          <span className={`px-2.5 py-1 rounded-full text-xs font-bold ${priorityColor[job.priority] ?? "bg-gray-100 text-gray-700"}`}>
                            {job.priority}
                          </span>
                        </td>
                        <td className="px-4 py-4">
                          <span className="text-sm text-secondary-100">
                            {job.departmentAssignedToId ? (deptMap[job.departmentAssignedToId] ?? "—") : (
                              <span className="text-xs text-custom-500 italic">Unassigned</span>
                            )}
                          </span>
                        </td>
                        <td className="px-4 py-4">
                          <span className="text-sm text-custom-700">{job.dueDate ? job.dueDate.split("T")[0] : "—"}</span>
                        </td>
                        <td className="px-4 py-4 text-right">
                          <div className="flex items-center justify-end gap-1">
                            <button
                              onClick={() => setDetailsJobId(job.id)}
                              className="p-1.5 rounded-lg hover:bg-custom-100 text-custom-500 hover:text-secondary-100 transition-colors"
                              title="View details"
                            >
                              <HiOutlineEye className="h-5 w-5" />
                            </button>
                            <ActionMenu job={job} onAction={openModal} />
                          </div>
                        </td>
                      </tr>
                    );
                  })
                )}
              </tbody>
            </table>
          </div>

          {/* Pagination */}
          {!isLoading && total > 0 && (
            <div className="flex items-center justify-between px-4 py-3 border-t border-custom-300">
              <p className="text-xs text-custom-700">
                {((page - 1) * PAGE_SIZE) + 1}–{Math.min(page * PAGE_SIZE, total)} of {total} jobs
              </p>
              <div className="flex items-center gap-2">
                <button
                  disabled={page <= 1}
                  onClick={() => setPage((p) => p - 1)}
                  className="px-3 py-1.5 rounded-lg border border-custom-300 text-sm font-semibold disabled:opacity-40 hover:bg-custom-100 transition-colors"
                >
                  Previous
                </button>
                <span className="text-xs text-custom-700 font-semibold">{page} / {totalPages}</span>
                <button
                  disabled={page >= totalPages}
                  onClick={() => setPage((p) => p + 1)}
                  className="px-3 py-1.5 rounded-lg border border-custom-300 text-sm font-semibold disabled:opacity-40 hover:bg-custom-100 transition-colors"
                >
                  Next
                </button>
              </div>
            </div>
          )}
        </Card>

        {/* Job Details Modal */}
        {detailsJobId && (
          <JobDetailsModal jobId={detailsJobId} onClose={() => setDetailsJobId(null)} />
        )}

        {/* ── Action Modals ── */}
        {modalType && activeJob && (
          <div className="fixed inset-0 bg-secondary-100/50 z-50 flex items-center justify-center p-4">
            <Card className="!p-6 max-w-md w-full">
              <div className="flex items-start justify-between mb-4">
                <div>
                  <h3 className="text-xl font-bold text-secondary-100">
                    {modalType === "assign"  && (activeJob.departmentAssignedToId ? "Reassign Job" : "Assign Job")}
                    {modalType === "reject"  && "Reject Job"}
                    {modalType === "edit"    && "Edit Job"}
                    {modalType === "complete" && "Complete Job"}
                  </h3>
                  <p className="text-sm text-custom-700 mt-1">{activeJob.jobNumber} — {activeJob.title}</p>
                </div>
                <button onClick={closeModal} className="text-custom-700 hover:text-secondary-100">
                  <HiOutlineX className="w-6 h-6" />
                </button>
              </div>

              {error && (
                <p className="mb-3 text-sm text-red-600 bg-red-50 px-3 py-2 rounded-lg">{error}</p>
              )}

              {modalType === "assign" && (
                <div className="space-y-4">
                  {activeJob.departmentAssignedToId && (
                    <p className="text-xs text-custom-700 bg-custom-50 px-3 py-2 rounded-lg">
                      Currently: <span className="font-semibold">{deptMap[activeJob.departmentAssignedToId] ?? "—"}</span>
                    </p>
                  )}
                  <div>
                    <label className="block text-sm font-semibold text-custom-700 mb-1">
                      {activeJob.departmentAssignedToId ? "New Department" : "Department"} <span className="text-red-500">*</span>
                    </label>
                    <select
                      value={deptId}
                      onChange={(e) => setDeptId(e.target.value)}
                      className="w-full px-4 py-2 rounded-xl border border-custom-300 focus:outline-none focus:border-primary-500"
                    >
                      <option value="">Select department…</option>
                      {departments.map((d) => (
                        <option key={d.id} value={d.id}>{d.name}</option>
                      ))}
                    </select>
                  </div>
                  <button
                    onClick={handleAssign}
                    disabled={!deptId || isSaving}
                    className="w-full px-4 py-2 rounded-xl bg-primary-500 text-white hover:bg-primary-600 transition-colors text-sm font-semibold disabled:opacity-50"
                  >
                    {isSaving ? "Saving…" : activeJob.departmentAssignedToId ? "Reassign" : "Assign"}
                  </button>
                </div>
              )}

              {modalType === "complete" && (
                <div className="space-y-4">
                  <p className="text-sm text-custom-700">
                    Mark <span className="font-semibold text-secondary-100">{activeJob.jobNumber}</span> as{" "}
                    <span className="font-semibold text-green-600">completed</span>? This cannot be undone.
                  </p>
                  <button
                    onClick={handleComplete}
                    disabled={isSaving}
                    className="w-full px-4 py-2 rounded-xl bg-green-600 text-white hover:bg-green-700 transition-colors text-sm font-semibold disabled:opacity-50"
                  >
                    {isSaving ? "Saving…" : "Confirm Complete"}
                  </button>
                </div>
              )}

              {modalType === "reject" && (
                <div className="space-y-4">
                  <div>
                    <label className="block text-sm font-semibold text-custom-700 mb-1">
                      Reason <span className="text-custom-500 font-normal">(optional)</span>
                    </label>
                    <textarea
                      value={rejectReason}
                      onChange={(e) => setRejectReason(e.target.value)}
                      maxLength={1000}
                      rows={4}
                      placeholder="Explain why this job is being rejected…"
                      className="w-full px-4 py-2 rounded-xl border border-custom-300 focus:outline-none focus:border-primary-500 resize-none"
                    />
                  </div>
                  <button
                    onClick={handleReject}
                    disabled={isSaving}
                    className="w-full px-4 py-2 rounded-xl bg-red-500 text-white hover:bg-red-600 transition-colors text-sm font-semibold disabled:opacity-50"
                  >
                    {isSaving ? "Saving…" : "Confirm Rejection"}
                  </button>
                </div>
              )}

              {modalType === "edit" && (
                <div className="space-y-4">
                  <div>
                    <label className="block text-sm font-semibold text-custom-700 mb-1">Title</label>
                    <input
                      type="text"
                      value={editTitle}
                      onChange={(e) => setEditTitle(e.target.value)}
                      className="w-full px-4 py-2 rounded-xl border border-custom-300 focus:outline-none focus:border-primary-500"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-semibold text-custom-700 mb-1">Due Date</label>
                    <input
                      type="date"
                      value={editDueDate}
                      onChange={(e) => setEditDueDate(e.target.value)}
                      className="w-full px-4 py-2 rounded-xl border border-custom-300 focus:outline-none focus:border-primary-500"
                    />
                  </div>
                  <button
                    onClick={handleEdit}
                    disabled={isSaving}
                    className="w-full px-4 py-2 rounded-xl bg-primary-500 text-white hover:bg-primary-600 transition-colors text-sm font-semibold disabled:opacity-50"
                  >
                    {isSaving ? "Saving…" : "Save Changes"}
                  </button>
                </div>
              )}
            </Card>
          </div>
        )}
      </div>
    </DashboardLayout>
  );
}
