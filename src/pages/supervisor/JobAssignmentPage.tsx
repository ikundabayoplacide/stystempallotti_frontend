import { useEffect, useMemo, useRef, useState } from "react";
import ReactDOM from "react-dom";
import { useSelector } from "react-redux";
import {
  HiOutlineCheckCircle,
  HiOutlineClock,
  HiOutlineDotsVertical,
  HiOutlineEye,
  HiOutlineExclamationCircle,
  HiOutlineFlag,
  HiOutlinePlus,
  HiOutlineRefresh,
  HiOutlineSearch,
  HiOutlineUserAdd,
  HiOutlineX,
} from "react-icons/hi";
import { toast } from "react-toastify";
import { DashboardLayout } from "../../components";
import { Card } from "../../components/ui";
import { useGetDepartmentsQuery } from "../../store/services/departmentsService";
import { useGetAllEmployeesQuery, useAssignJobToEmployeeMutation } from "../../store/services/employeesService";
import type { Job, JobState } from "../../store/services/jobsService";
import {
  useGetJobsQuery,
  useGetJobDetailsQuery,
  useUpdateJobStateMutation,
  useMarkJobDoneMutation,
} from "../../store/services/jobsService";
import { useCreateJobSpecMutation, useGetJobSpecsQuery } from "../../store/services/jobSpecsService";
import { jobStatusConfig } from "../../types/JobStatus";
import type { RootState } from "../../store";

// ─── State config ─────────────────────────────────────────────────────────────

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

// Only the supervisor's own department state can be marked done
const DONE_STATE_MAP: Partial<Record<NonNullable<JobState>, string>> = {
  "in-composition": "composition-done",
  "in-montage":     "montage-done",
  "in-printing":    "printing-done",
  "in-binding":     "binding-done",
  "in-packaging":   "packaging-done",
  "quality-check":  "qualitycheck-done",
};

const priorityColor: Record<string, string> = {
  low:    "bg-green-100 text-green-700",
  normal: "bg-blue-100 text-blue-700",
  high:   "bg-orange-100 text-orange-700",
  urgent: "bg-red-500 text-white",
};

const PAGE_SIZE = 10;

const inputCls = "w-full px-3 py-2 rounded-xl border border-custom-300 bg-style-500 text-secondary-100 text-sm focus:outline-none focus:border-primary-400 transition-colors";

// ─── Job Detail Modal (tabbed) ────────────────────────────────────────────────────────────

function JobDetailModal({ job, onClose }: { job: Job; onClose: () => void }) {
  const [tab, setTab] = useState<"overview" | "specs">("overview");
  const { data: specs = [], isLoading: loadingSpecs } = useGetJobSpecsQuery(job.id);
  const { data: details } = useGetJobDetailsQuery(job.id);

  return (
    <div className="fixed inset-0 bg-secondary-100/50 z-50 flex items-start justify-center p-4 overflow-y-auto">
      <div className="bg-style-600 rounded-2xl border border-custom-300 shadow-xl w-full max-w-3xl my-8">

        {/* Header */}
        <div className="flex items-start justify-between px-6 pt-6 pb-4 border-b border-custom-200">
          <div>
            <h3 className="text-xl font-bold text-secondary-100">{job.jobNumber}</h3>
            <p className="text-sm text-custom-700 mt-0.5">{job.title}</p>
          </div>
          <button onClick={onClose} className="text-custom-700 hover:text-secondary-100 mt-0.5">
            <HiOutlineX className="w-5 h-5" />
          </button>
        </div>

        {/* Tabs */}
        <div className="flex gap-1 px-6 pt-3">
          {(["overview", "specs"] as const).map((t) => (
            <button key={t} onClick={() => setTab(t)}
              className={`px-4 py-1.5 rounded-lg text-sm font-semibold capitalize transition-colors ${
                tab === t ? "bg-primary-500 text-white" : "text-custom-700 hover:text-secondary-100 hover:bg-custom-100"
              }`}>
              {t === "specs" ? `Specs (${specs.length})` : "Overview"}
            </button>
          ))}
        </div>

        <div className="px-6 py-5">
          {/* ── Overview Tab ── */}
          {tab === "overview" && (
            <div className="space-y-4 text-sm">
              <div className="grid grid-cols-2 sm:grid-cols-3 gap-3">
                <div className="p-3 rounded-xl bg-custom-50 border border-custom-200">
                  <p className="text-xs text-custom-700 mb-0.5">Client</p>
                  <p className="font-semibold text-secondary-100">{job.customer?.name ?? "—"}</p>
                  {job.customer?.phone && <p className="text-xs text-custom-700">{job.customer.phone}</p>}
                </div>
                <div className="p-3 rounded-xl bg-custom-50 border border-custom-200">
                  <p className="text-xs text-custom-700 mb-1">Status</p>
                  <span className={`px-2 py-0.5 rounded-full text-xs font-semibold ${jobStatusConfig[job.status]?.bgColor} ${jobStatusConfig[job.status]?.color}`}>
                    {jobStatusConfig[job.status]?.label ?? job.status}
                  </span>
                </div>
                <div className="p-3 rounded-xl bg-custom-50 border border-custom-200">
                  <p className="text-xs text-custom-700 mb-0.5">Priority</p>
                  <span className={`px-2 py-0.5 rounded-full text-xs font-bold ${priorityColor[job.priority] ?? "bg-gray-100 text-gray-700"}`}>
                    {job.priority}
                  </span>
                </div>
                <div className="p-3 rounded-xl bg-custom-50 border border-custom-200">
                  <p className="text-xs text-custom-700 mb-1">Dept State</p>
                  <StateBadge state={job.state ?? null} />
                </div>
                <div className="p-3 rounded-xl bg-custom-50 border border-custom-200">
                  <p className="text-xs text-custom-700 mb-1">Progress</p>
                  <ProgressBadge progress={job.progress ?? null} />
                </div>
                <div className="p-3 rounded-xl bg-custom-50 border border-custom-200">
                  <p className="text-xs text-custom-700 mb-0.5">Due Date</p>
                  <p className="font-semibold text-secondary-100">{job.dueDate ? job.dueDate.split("T")[0] : "—"}</p>
                </div>
              </div>

              {(job.jobType || job.quantity || job.size || job.colorMode) && (
                <div className="p-3 rounded-xl bg-custom-50 border border-custom-200 grid grid-cols-2 sm:grid-cols-4 gap-3">
                  {job.jobType   && <div><p className="text-xs text-custom-700">Type</p><p className="font-semibold text-secondary-100">{job.jobType}</p></div>}
                  {job.quantity  && <div><p className="text-xs text-custom-700">Quantity</p><p className="font-semibold text-secondary-100">{job.quantity}</p></div>}
                  {job.size      && <div><p className="text-xs text-custom-700">Size</p><p className="font-semibold text-secondary-100">{job.size}</p></div>}
                  {job.colorMode && <div><p className="text-xs text-custom-700">Color Mode</p><p className="font-semibold text-secondary-100">{job.colorMode}</p></div>}
                </div>
              )}

              {(job.startedAt || job.pausedAt || job.resumedAt || job.completedAt) && (
                <div className="p-3 rounded-xl bg-custom-50 border border-custom-200 grid grid-cols-2 gap-2">
                  <p className="col-span-2 text-xs font-semibold text-custom-700 mb-0.5">Timeline</p>
                  {job.startedAt   && <p className="text-xs text-secondary-100">Started: <span className="font-semibold">{new Date(job.startedAt).toLocaleString()}</span></p>}
                  {job.pausedAt    && <p className="text-xs text-secondary-100">Paused: <span className="font-semibold">{new Date(job.pausedAt).toLocaleString()}</span></p>}
                  {job.resumedAt   && <p className="text-xs text-secondary-100">Resumed: <span className="font-semibold">{new Date(job.resumedAt).toLocaleString()}</span></p>}
                  {job.completedAt && <p className="text-xs text-secondary-100">Completed: <span className="font-semibold">{new Date(job.completedAt).toLocaleString()}</span></p>}
                </div>
              )}

              {job.description && (
                <div className="p-3 rounded-xl bg-custom-50 border border-custom-200">
                  <p className="text-xs text-custom-700 mb-1">Description</p>
                  <p className="text-secondary-100 leading-snug">{job.description}</p>
                </div>
              )}
              {job.notes && (
                <div className="p-3 rounded-xl bg-yellow-50 border border-yellow-200">
                  <p className="text-xs text-yellow-700 mb-1 font-semibold">Notes</p>
                  <p className="text-secondary-100 leading-snug">{job.notes}</p>
                </div>
              )}

              {/* Assigned Workers */}
              <div className="p-3 rounded-xl bg-custom-50 border border-custom-200">
                <p className="text-xs font-bold text-custom-700 uppercase tracking-wide mb-2">Assigned Workers</p>
                {!details?.assignedWorkers?.length ? (
                  <p className="text-xs text-custom-500 italic">No workers assigned to this job.</p>
                ) : (
                  <div className="space-y-2">
                    {details.assignedWorkers.map((w) => (
                      <div key={w.id} className="flex items-center justify-between">
                        <div className="flex items-center gap-2">
                          <div className="w-7 h-7 rounded-full bg-primary-100 flex items-center justify-center shrink-0">
                            <span className="text-primary-600 font-bold text-xs">{w.fullName.charAt(0).toUpperCase()}</span>
                          </div>
                          <div>
                            <p className="text-sm font-semibold text-secondary-100">{w.fullName}</p>
                            <p className="text-xs text-custom-700">{w.department?.name ?? "—"} · {w.phoneNumber}</p>
                          </div>
                        </div>
                        <span className="text-xs text-custom-500">
                          {new Date(w.EmployeeJobAssignment.assignedAt).toLocaleDateString()}
                        </span>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            </div>
          )}

          {/* ── Specs Tab ── */}
          {tab === "specs" && (
            <div>
              {loadingSpecs ? (
                <div className="space-y-3">{[1,2].map(i => <div key={i} className="h-20 bg-custom-100 rounded-xl animate-pulse" />)}</div>
              ) : specs.length === 0 ? (
                <div className="py-12 text-center">
                  <p className="text-sm text-custom-700">No specs added yet for this job.</p>
                  <p className="text-xs text-custom-500 mt-1">Use the ➕ button on the job row to add one.</p>
                </div>
              ) : (
                <div className="space-y-4">
                  {specs.map((spec, i) => (
                    <div key={spec.id} className="rounded-xl border border-custom-200 overflow-hidden">
                      <div className="flex items-center justify-between px-4 py-2.5 bg-custom-50 border-b border-custom-200">
                        <span className="text-xs font-bold text-custom-500 uppercase tracking-wide">Spec #{i + 1}</span>
                        <span className="text-xs text-custom-500">{new Date(spec.createdAt).toLocaleDateString()}</span>
                      </div>
                      <div className="p-4 space-y-3">
                        <p className="text-sm text-secondary-100">{spec.description}</p>
                        <div className="grid grid-cols-2 sm:grid-cols-3 gap-2">
                          {([
                            ["Paper Type",   spec.paperType],
                            ["Paper Weight", spec.paperWeight],
                            ["Size",         spec.size],
                            ["Colors",       spec.colors],
                            ["Finish Type",  spec.finishType],
                            ["Materials",    spec.materials],
                            ["Quantity",     spec.quantity ? String(spec.quantity) : undefined],
                          ] as [string, string | undefined][]).filter(([, v]) => v).map(([label, value]) => (
                            <div key={label} className="px-3 py-2 rounded-lg bg-custom-50 border border-custom-100">
                              <p className="text-[10px] text-custom-500 uppercase tracking-wide">{label}</p>
                              <p className="text-sm font-semibold text-secondary-100">{value}</p>
                            </div>
                          ))}
                        </div>
                        {spec.notes && (
                          <p className="text-xs text-custom-700 italic border-t border-custom-100 pt-2">{spec.notes}</p>
                        )}
                        {spec.documents && spec.documents.length > 0 && (
                          <div className="border-t border-custom-100 pt-2">
                            <p className="text-xs font-semibold text-custom-700 mb-1.5">Attachments</p>
                            <div className="flex flex-wrap gap-2">
                              {spec.documents.map(doc => (
                                <a key={doc.id} href={doc.fileUrl} download={doc.fileName}
                                  className="flex items-center gap-1.5 px-2.5 py-1 rounded-lg bg-primary-50 border border-primary-200 text-xs font-semibold text-primary-600 hover:bg-primary-100 transition-colors">
                                  📎 {doc.fileName}
                                </a>
                              ))}
                            </div>
                          </div>
                        )}
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>
          )}
        </div>

        <div className="px-6 pb-6">
          <button onClick={onClose}
            className="w-full px-4 py-2 rounded-xl border border-custom-300 hover:bg-custom-100 text-sm font-semibold text-custom-700 transition-colors">
            Close
          </button>
        </div>
      </div>
    </div>
  );
}

function AddSpecModal({ jobId, jobNumber, onClose }: { jobId: string; jobNumber: string; onClose: () => void }) {
  const [form, setForm] = useState({
    description: "", paperType: "", paperWeight: "", size: "",
    colors: "", finishType: "", quantity: "", materials: "", notes: "",
  });
  const [files, setFiles] = useState<File[]>([]);
  const [createJobSpec, { isLoading }] = useCreateJobSpecMutation();

  const set = (k: string) => (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) =>
    setForm(prev => ({ ...prev, [k]: e.target.value }));

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      await createJobSpec({
        jobId,
        description: form.description,
        ...(form.paperType   && { paperType: form.paperType }),
        ...(form.paperWeight && { paperWeight: form.paperWeight }),
        ...(form.size        && { size: form.size }),
        ...(form.colors      && { colors: form.colors }),
        ...(form.finishType  && { finishType: form.finishType }),
        ...(form.quantity    && { quantity: Number(form.quantity) }),
        ...(form.materials   && { materials: form.materials }),
        ...(form.notes       && { notes: form.notes }),
        ...(files.length     && { documents: files }),
      }).unwrap();
      toast.success("Spec added successfully");
      onClose();
    } catch (err: any) { toast.error(err?.data?.message ?? "Failed to add spec"); }
  };

  return (
    <div className="fixed inset-0 bg-secondary-100/50 z-50 flex items-start justify-center p-4 overflow-y-auto">
      <div className="bg-style-600 rounded-2xl border border-custom-300 shadow-xl w-full max-w-2xl my-8 p-6">
        <div className="flex items-center justify-between mb-5">
          <div>
            <h3 className="text-lg font-bold text-secondary-100">Add Job Spec</h3>
            <p className="text-xs text-custom-700 mt-0.5">Job <span className="font-semibold text-primary-500">{jobNumber}</span></p>
          </div>
          <button onClick={onClose} className="text-custom-700 hover:text-secondary-100"><HiOutlineX className="w-5 h-5" /></button>
        </div>
        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label className="block text-sm font-semibold text-secondary-100 mb-1">Description *</label>
            <textarea value={form.description} onChange={set("description")} rows={2} required
              placeholder="Describe the specification..."
              className="w-full px-3 py-2 rounded-xl border border-custom-300 bg-style-500 text-secondary-100 text-sm focus:outline-none focus:border-primary-400 transition-colors resize-none" />
          </div>
          <div className="grid grid-cols-2 gap-3">
            {([
              ["paperType",   "Paper Type",   "e.g. Glossy, Matte"],
              ["paperWeight", "Paper Weight", "e.g. 90gsm, 150gsm"],
              ["size",        "Size",         "e.g. A4, A3, Custom"],
              ["colors",      "Colors",       "e.g. CMYK, Black only"],
              ["finishType",  "Finish Type",  "e.g. Lamination, UV"],
              ["materials",   "Materials",    "e.g. Paper, Cardboard"],
            ] as [string, string, string][]).map(([key, label, placeholder]) => (
              <div key={key}>
                <label className="block text-sm font-semibold text-secondary-100 mb-1">{label}</label>
                <input value={(form as any)[key]} onChange={set(key)} placeholder={placeholder} className={inputCls} />
              </div>
            ))}
            <div>
              <label className="block text-sm font-semibold text-secondary-100 mb-1">Quantity</label>
              <input type="number" min="1" value={form.quantity} onChange={set("quantity")} placeholder="e.g. 500" className={inputCls} />
            </div>
          </div>
          <div>
            <label className="block text-sm font-semibold text-secondary-100 mb-1">Notes <span className="font-normal text-custom-700">(optional)</span></label>
            <input value={form.notes} onChange={set("notes")} placeholder="Any additional notes..." className={inputCls} />
          </div>
          <div>
            <label className="block text-sm font-semibold text-secondary-100 mb-1">Attachments <span className="font-normal text-custom-700">(optional)</span></label>
            <input type="file" multiple onChange={e => setFiles(Array.from(e.target.files ?? []))}
              className="w-full text-sm text-custom-700 file:mr-3 file:py-1.5 file:px-3 file:rounded-lg file:border-0 file:text-xs file:font-semibold file:bg-primary-100 file:text-primary-700 hover:file:bg-primary-200 transition-colors" />
            {files.length > 0 && <p className="text-xs text-custom-700 mt-1">{files.length} file(s) selected</p>}
          </div>
          <div className="flex gap-3 justify-end pt-2 border-t border-custom-300">
            <button type="button" onClick={onClose} className="px-4 py-2 rounded-xl border border-custom-300 text-sm font-semibold text-secondary-100 hover:bg-custom-100 transition-colors">Cancel</button>
            <button type="submit" disabled={isLoading} className="px-4 py-2 rounded-xl bg-primary-500 text-white text-sm font-semibold hover:bg-primary-600 transition-colors disabled:opacity-40">
              {isLoading ? "Saving..." : "Add Spec"}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}

// ─── State Badge ─────────────────────────────────────────────────────────────

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

// ─── Progress Badge ──────────────────────────────────────────────────────────

const PROGRESS_CONFIG: Record<string, { label: string; bg: string; text: string; dot: string }> = {
  started:   { label: "Started",   bg: "bg-blue-100",   text: "text-blue-700",   dot: "bg-blue-500" },
  paused:    { label: "Paused",    bg: "bg-yellow-100", text: "text-yellow-700", dot: "bg-yellow-500" },
  resumed:   { label: "Resumed",   bg: "bg-indigo-100", text: "text-indigo-700", dot: "bg-indigo-500" },
  completed: { label: "Completed", bg: "bg-green-100",  text: "text-green-700",  dot: "bg-green-500" },
};

function ProgressBadge({ progress }: { progress: string | null }) {
  if (!progress) return <span className="text-xs text-custom-500 italic">—</span>;
  const cfg = PROGRESS_CONFIG[progress] ?? { label: progress, bg: "bg-gray-100", text: "text-gray-700", dot: "bg-gray-400" };
  return (
    <span className={`inline-flex items-center gap-1.5 px-2 py-0.5 rounded-full text-xs font-semibold ${cfg.bg} ${cfg.text}`}>
      <span className={`w-1.5 h-1.5 rounded-full ${cfg.dot}`} />
      {cfg.label}
    </span>
  );
}

// ─── Actions Menu ─────────────────────────────────────────────────────────────

interface ActionsMenuProps {
  job: Job;
  alreadyAssigned: boolean;
  onView: (job: Job) => void;
  onAssign: (job: Job) => void;
  onMarkDone: (job: Job) => void;
  onAddSpec: (job: Job) => void;
}

function ActionsMenu({ job, alreadyAssigned, onView, onAssign, onMarkDone, onAddSpec }: ActionsMenuProps) {
  const [open, setOpen] = useState(false);
  const [menuPos, setMenuPos] = useState<{ top: number; right: number } | null>(null);
  const btnRef = useRef<HTMLButtonElement>(null);
  const menuRef = useRef<HTMLDivElement>(null);
  const canMarkDone = job.status !== "completed" && job.status !== "rejected" && job.status !== "delivered";

  const updatePos = () => {
    const rect = btnRef.current?.getBoundingClientRect();
    if (rect) setMenuPos({ top: rect.bottom + 4, right: window.innerWidth - rect.right });
  };

  useEffect(() => {
    if (!open) return;
    const handler = (e: MouseEvent) => {
      if (btnRef.current?.contains(e.target as Node)) return;
      if (menuRef.current && !menuRef.current.contains(e.target as Node)) setOpen(false);
    };
    document.addEventListener("mousedown", handler);
    window.addEventListener("scroll", updatePos, true);
    window.addEventListener("resize", updatePos);
    return () => {
      document.removeEventListener("mousedown", handler);
      window.removeEventListener("scroll", updatePos, true);
      window.removeEventListener("resize", updatePos);
    };
  }, [open]);

  const handleToggle = (e: React.MouseEvent<HTMLButtonElement>) => {
    const rect = e.currentTarget.getBoundingClientRect();
    setMenuPos({ top: rect.bottom + 4, right: window.innerWidth - rect.right });
    setOpen((v) => !v);
  };

  if (job.status === "delivered" || job.status === "completed") {
    return (
      <div className="flex items-center justify-end gap-1">
        <button onClick={() => onView(job)} className="p-1.5 rounded-lg hover:bg-custom-100 transition-colors text-custom-700 hover:text-primary-600" title="View details">
          <HiOutlineEye className="w-4 h-4" />
        </button>
        <button onClick={() => onAddSpec(job)} className="p-1.5 rounded-lg hover:bg-blue-50 transition-colors text-blue-500" title="Add Spec">
          <HiOutlinePlus className="w-4 h-4" />
        </button>
      </div>
    );
  }

  return (
    <div className="flex items-center justify-end gap-1">
      <button onClick={() => onView(job)} className="p-1.5 rounded-lg hover:bg-custom-100 transition-colors text-custom-700 hover:text-primary-600" title="View details">
        <HiOutlineEye className="w-4 h-4" />
      </button>
      <button onClick={() => onAddSpec(job)} className="p-1.5 rounded-lg hover:bg-blue-50 transition-colors text-blue-500" title="Add Spec">
        <HiOutlinePlus className="w-4 h-4" />
      </button>
      <button ref={btnRef} onClick={handleToggle} className="p-1.5 rounded-lg hover:bg-custom-100 transition-colors text-custom-700" title="Actions">
        <HiOutlineDotsVertical className="w-4 h-4" />
      </button>

      {open && menuPos && ReactDOM.createPortal(
        <div
          ref={menuRef}
          style={{ position: "fixed", top: menuPos.top, right: menuPos.right, zIndex: 9999 }}
          className="w-44 bg-style-600 border border-custom-200 rounded-xl shadow-xl py-1 text-sm"
        >
          <button
            onClick={() => { setOpen(false); onAssign(job); }}
            className="w-full flex items-center gap-2 px-3 py-2 hover:bg-custom-100 text-secondary-100 transition-colors"
          >
            <HiOutlineUserAdd className="w-4 h-4 text-primary-500" />
            {alreadyAssigned ? "Reassign" : "Assign"}
          </button>
          {canMarkDone && (
            <button
              onClick={() => { setOpen(false); onMarkDone(job); }}
              className="w-full flex items-center gap-2 px-3 py-2 hover:bg-custom-100 text-secondary-100 transition-colors"
            >
              <HiOutlineFlag className="w-4 h-4 text-green-500" />
              Mark Done
            </button>
          )}
        </div>,
        document.body
      )}
    </div>
  );
}

// ─── Main Page ────────────────────────────────────────────────────────────────

export default function SupervisorJobsPage() {
  const [search, setSearch]       = useState("");
  const [page, setPage]           = useState(1);
  const [showModal, setShowModal] = useState(false);
  const [activeJob, setActiveJob] = useState<Job | null>(null);
  const [error, setError]         = useState("");

  // ── Detail view modal state ──
  const [showDetailModal, setShowDetailModal] = useState(false);
  const [detailJob, setDetailJob]             = useState<Job | null>(null);

  const openDetailModal  = (job: Job) => { setDetailJob(job); setShowDetailModal(true); };
  const closeDetailModal = () => { setShowDetailModal(false); setDetailJob(null); };

  // ── Add Spec modal state ──
  const [specTarget, setSpecTarget] = useState<{ id: string; jobNumber: string } | null>(null);

  // ── Assign employee modal state ──
  const [showAssignModal, setShowAssignModal] = useState(false);
  const [assignJob_,      setAssignJob_]      = useState<Job | null>(null);
  const [assignError,     setAssignError]     = useState("");

  const currentUser = useSelector((state: RootState) => state.auth.user);
  const myDeptId = currentUser?.departmentId;

  const { data: allData, isLoading, isFetching, refetch } = useGetJobsQuery(
    { limit: 1000, departmentAssignedToId: myDeptId ?? undefined, search: search || undefined },
    { skip: !myDeptId }
  );
  const { data: departments = [] } = useGetDepartmentsQuery();
  const [updateJobState, { isLoading: isSaving }] = useUpdateJobStateMutation();
  const [markJobDone, { isLoading: isMarkingDone }] = useMarkJobDoneMutation();

  // Employees scoped to supervisor's department (backend auto-scopes)
  const { data: employeesData, refetch: refetchEmployees } = useGetAllEmployeesQuery(
    { limit: 200 },
    { skip: !myDeptId }
  );
  const employees = employeesData?.data ?? [];
  const [assignToEmployee, { isLoading: isAssigning }] = useAssignJobToEmployeeMutation();

  const allJobs    = allData?.jobs ?? [];
  const total      = allJobs.length;
  const totalPages = Math.max(1, Math.ceil(total / PAGE_SIZE));
  const jobs       = allJobs.slice((page - 1) * PAGE_SIZE, page * PAGE_SIZE);

  const myDept = departments.find((d) => d.id === myDeptId);

  const activeCount    = useMemo(() => allJobs.filter((j) => j.status !== "completed" && j.status !== "rejected").length, [allJobs]);
  const doneCount      = useMemo(() => allJobs.filter((j) => j.state && (j.state as string).endsWith("-done")).length, [allJobs]);
  const completedCount = useMemo(() => allJobs.filter((j) => j.status === "completed").length, [allJobs]);
  const urgentCount    = useMemo(() => allJobs.filter((j) => j.priority === "urgent" && j.status !== "completed").length, [allJobs]);

  const openModal = (job: Job) => {
    setActiveJob(job);
    setError("");
    setShowModal(true);
  };

  const closeModal      = () => { setShowModal(false); setActiveJob(null); setError(""); };
  const closeAndRefetch = () => { closeModal(); refetch(); };

  // ── Assign employee handlers ──
  const openAssignModal = (job: Job) => {
    setAssignJob_(job);
    setAssignError("");
    setShowAssignModal(true);
  };
  const closeAssignModal = () => { setShowAssignModal(false); setAssignJob_(null); setAssignError(""); };

  const handleAssignEmployee = async (employeeId: string) => {
    if (!assignJob_) return;
    try {
      await assignToEmployee({ employeeId, jobId: assignJob_.id }).unwrap();
      await Promise.all([refetchEmployees(), refetch()]);
      closeAssignModal();
    } catch (err: any) {
      console.log("[assign-job] error response:", err);
      const msg = err?.data?.message ?? err?.error ?? "Failed to assign employee";
      setAssignError(msg);
    }
  };

  const handleMarkDone = async () => {
    if (!activeJob) return;
    try {
      const doneState = activeJob.state
        ? DONE_STATE_MAP[activeJob.state as NonNullable<JobState>]
        : undefined;
      await markJobDone(activeJob.id).unwrap();
      if (doneState) {
        await updateJobState({ id: activeJob.id, state: doneState }).unwrap();
      }
      closeAndRefetch();
    } catch (err: any) {
      setError(err?.data?.message ?? "Failed to mark as done");
    }
  };

  if (!myDeptId) {
    return (
      <DashboardLayout userRole="supervisor" userName={currentUser?.name ?? "Supervisor"} notificationCount={0}>
        <Card className="!p-8 text-center">
          <p className="text-custom-700 text-sm">Your account is not assigned to a department.</p>
        </Card>
      </DashboardLayout>
    );
  }

  return (
    <DashboardLayout
      userRole="supervisor"
      userName={currentUser?.name ?? "Supervisor"}
      notificationCount={urgentCount}
    >
      <div className="space-y-6 font-[family-name:var(--font-family-primary)]">

        {/* Header */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
          <div>
            <h1 className="text-2xl md:text-3xl font-bold text-secondary-100">Jobs</h1>
            <p className="text-sm text-custom-700 mt-1">
              Department: <span className="font-semibold text-primary-600">{myDept?.name ?? myDeptId}</span>
              {" · "}Mark work done when your department finishes a job
            </p>
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
              <div className="w-9 h-9 rounded-xl bg-blue-100 flex items-center justify-center">
                <HiOutlineClock className="w-5 h-5 text-blue-600" />
              </div>
              <div>
                <p className="text-xs text-custom-700">Active</p>
                <p className="text-2xl font-bold text-secondary-100">{activeCount}</p>
              </div>
            </div>
          </Card>
          <Card className="!p-4">
            <div className="flex items-center gap-3">
              <div className="w-9 h-9 rounded-xl bg-green-100 flex items-center justify-center">
                <HiOutlineFlag className="w-5 h-5 text-green-600" />
              </div>
              <div>
                <p className="text-xs text-custom-700">Dept Done</p>
                <p className="text-2xl font-bold text-secondary-100">{doneCount}</p>
              </div>
            </div>
          </Card>
          <Card className="!p-4">
            <div className="flex items-center gap-3">
              <div className="w-9 h-9 rounded-xl bg-primary-100 flex items-center justify-center">
                <HiOutlineCheckCircle className="w-5 h-5 text-primary-600" />
              </div>
              <div>
                <p className="text-xs text-custom-700">Completed</p>
                <p className="text-2xl font-bold text-secondary-100">{completedCount}</p>
              </div>
            </div>
          </Card>
          <Card className="!p-4">
            <div className="flex items-center gap-3">
              <div className="w-9 h-9 rounded-xl bg-red-100 flex items-center justify-center">
                <HiOutlineExclamationCircle className="w-5 h-5 text-red-600" />
              </div>
              <div>
                <p className="text-xs text-custom-700">Urgent</p>
                <p className="text-2xl font-bold text-secondary-100">{urgentCount}</p>
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
            placeholder="Search by job number, title or client…"
            className="w-full pl-10 pr-4 py-2 rounded-xl border border-custom-300 focus:outline-none focus:border-primary-500"
          />
        </div>

        {/* Table */}
        <Card className="!p-0 overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead className="bg-custom-100 border-b border-custom-300">
                <tr>
                  {["Job", "Client", "Status", "Dept State", "Progress", "Priority", "Due Date", "Actions"].map((h) => (
                    <th
                      key={h}
                      className={`px-4 py-3 text-xs font-bold text-secondary-100 uppercase ${h === "Actions" ? "text-right" : "text-left"}`}>
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
                      No jobs assigned to your department
                    </td>
                  </tr>
                ) : (
                  jobs.map((job) => {
                    const statusCfg = jobStatusConfig[job.status] ?? { label: job.status, bgColor: "bg-gray-100", color: "text-gray-700" };
                    return (
                      <tr
                        key={job.id}
                        className={`hover:bg-custom-50 transition-colors ${job.priority === "urgent" ? "bg-red-50" : ""}`}
                      >
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
                          <ProgressBadge progress={job.progress ?? null} />
                        </td>
                        <td className="px-4 py-4">
                          <span className={`px-2.5 py-1 rounded-full text-xs font-bold ${priorityColor[job.priority] ?? "bg-gray-100 text-gray-700"}`}>
                            {job.priority}
                          </span>
                        </td>
                        <td className="px-4 py-4">
                          <span className="text-sm text-custom-700">
                            {job.dueDate ? job.dueDate.split("T")[0] : "—"}
                          </span>
                        </td>
                        <td className="px-4 py-4">
                          <ActionsMenu
                            job={job}
                            alreadyAssigned={employees.some(
                              (e) => (e.assignedJobs?.some((j) => j.id === job.id) ?? false) || e.jobId === job.id
                            )}
                            onView={openDetailModal}
                            onAssign={openAssignModal}
                            onMarkDone={openModal}
                            onAddSpec={(j) => setSpecTarget({ id: j.id, jobNumber: j.jobNumber })}
                          />
                        </td>
                      </tr>
                    );
                  })
                )}
              </tbody>
            </table>
          </div>

          {!isLoading && total > PAGE_SIZE && (
            <div className="flex items-center justify-between px-4 py-3 border-t border-custom-300">
              <p className="text-xs text-custom-700">
                {((page - 1) * PAGE_SIZE) + 1}–{Math.min(page * PAGE_SIZE, total)} of {total} jobs
              </p>
              <div className="flex items-center gap-2">
                <button disabled={page <= 1} onClick={() => setPage((p) => p - 1)}
                  className="px-3 py-1.5 rounded-lg border border-custom-300 text-sm font-semibold disabled:opacity-40 hover:bg-custom-100 transition-colors">
                  Previous
                </button>
                <span className="text-xs text-custom-700 font-semibold">{page} / {totalPages}</span>
                <button disabled={page >= totalPages} onClick={() => setPage((p) => p + 1)}
                  className="px-3 py-1.5 rounded-lg border border-custom-300 text-sm font-semibold disabled:opacity-40 hover:bg-custom-100 transition-colors">
                  Next
                </button>
              </div>
            </div>
          )}
        </Card>

        {/* ── Job Detail Modal ── */}
        {showDetailModal && detailJob && (
          <JobDetailModal job={detailJob} onClose={closeDetailModal} />
        )}

        {/* ── Mark Done Confirm Modal ── */}
        {showModal && activeJob && (() => {
          const doneState = activeJob.state
            ? DONE_STATE_MAP[activeJob.state as NonNullable<JobState>]
            : undefined;
          return (
            <div className="fixed inset-0 bg-secondary-100/50 z-50 flex items-center justify-center p-4">
              <Card className="!p-6 max-w-md w-full">

                <div className="flex items-start justify-between mb-4">
                  <div>
                    <h3 className="text-xl font-bold text-secondary-100">Mark Department Done</h3>
                    <p className="text-sm text-custom-700 mt-1">
                      {activeJob.jobNumber} — {activeJob.title}
                    </p>
                  </div>
                  <button onClick={closeModal} className="text-custom-700 hover:text-secondary-100">
                    <HiOutlineX className="w-6 h-6" />
                  </button>
                </div>

                {/* Job summary */}
                <div className="p-3 rounded-xl bg-custom-50 border border-custom-200 mb-4 text-sm space-y-2">
                  <div className="grid grid-cols-2 gap-2">
                    <div>
                      <span className="text-custom-700">Client: </span>
                      <span className="font-semibold text-secondary-100">{activeJob.customer?.name ?? "—"}</span>
                    </div>
                    <div>
                      <span className="text-custom-700">Priority: </span>
                      <span className="font-semibold text-secondary-100 capitalize">{activeJob.priority}</span>
                    </div>
                    <div>
                      <span className="text-custom-700">Status: </span>
                      <span className={`font-semibold text-xs px-2 py-0.5 rounded-full ${jobStatusConfig[activeJob.status]?.bgColor} ${jobStatusConfig[activeJob.status]?.color}`}>
                        {jobStatusConfig[activeJob.status]?.label ?? activeJob.status}
                      </span>
                    </div>
                    <div>
                      <span className="text-custom-700">Current state: </span>
                      <StateBadge state={activeJob.state ?? null} />
                    </div>
                  </div>
                  {activeJob.description && (
                    <div className="pt-1 border-t border-custom-200">
                      <p className="text-custom-700 mb-0.5">Description:</p>
                      <p className="text-secondary-100 font-medium leading-snug">{activeJob.description}</p>
                    </div>
                  )}
                </div>

                {/* What will change */}
                <div className="flex items-center gap-3 p-3 rounded-xl bg-green-50 border border-green-200 mb-4">
                  <HiOutlineFlag className="w-5 h-5 text-green-600 flex-shrink-0" />
                  <div className="text-sm">
                    <p className="text-green-700">This will mark the job as <span className="font-bold">Done</span> and complete it.</p>
                    {doneState && (
                      <p className="text-green-600 mt-0.5">
                        Dept state → <span className="font-bold">{STATE_LABELS[doneState as NonNullable<JobState>] ?? doneState}</span>
                      </p>
                    )}
                  </div>
                </div>

                {error && (
                  <p className="mb-3 text-sm text-red-600 bg-red-50 px-3 py-2 rounded-lg">{error}</p>
                )}

                <button
                  onClick={handleMarkDone}
                  disabled={isSaving || isMarkingDone}
                  className="w-full px-4 py-2 rounded-xl bg-green-600 text-white hover:bg-green-700 transition-colors text-sm font-semibold disabled:opacity-50 flex items-center justify-center gap-2"
                >
                  <HiOutlineFlag className="w-4 h-4" />
                  {(isSaving || isMarkingDone) ? "Saving…" : "Confirm — Mark Done"}
                </button>

              </Card>
            </div>
          );
        })()}

        {/* ── Assign Employee Modal ── */}
        {showAssignModal && assignJob_ && (
          <div className="fixed inset-0 bg-secondary-100/50 z-50 flex items-center justify-center p-4">
            <Card className="!p-6 max-w-md w-full max-h-[90vh] overflow-y-auto">

              <div className="flex items-start justify-between mb-4">
                <div>
                  <h3 className="text-lg font-bold text-secondary-100">Assign Employee</h3>
                  <p className="text-sm text-custom-700 mt-1">
                    {assignJob_.jobNumber} — {assignJob_.title}
                  </p>
                </div>
                <button onClick={closeAssignModal} className="text-custom-700 hover:text-secondary-100">
                  <HiOutlineX className="w-6 h-6" />
                </button>
              </div>

              {/* Job summary */}
              <div className="p-3 rounded-xl bg-custom-50 border border-custom-200 mb-4 grid grid-cols-2 gap-2 text-sm">
                <div>
                  <span className="text-custom-700">Client: </span>
                  <span className="font-semibold text-secondary-100">{assignJob_.customer?.name ?? "—"}</span>
                </div>
                <div>
                  <span className="text-custom-700">Priority: </span>
                  <span className="font-semibold text-secondary-100 capitalize">{assignJob_.priority}</span>
                </div>
                <div>
                  <span className="text-custom-700">Due: </span>
                  <span className="font-semibold text-secondary-100">
                    {assignJob_.dueDate ? assignJob_.dueDate.split("T")[0] : "—"}
                  </span>
                </div>
                <div>
                  <span className="text-custom-700">Dept: </span>
                  <span className="font-semibold text-primary-600">
                    {departments.find((d) => d.id === myDeptId)?.name ?? "—"}
                  </span>
                </div>
              </div>

              {assignError && (
                <p className="mb-3 text-sm text-red-600 bg-red-50 px-3 py-2 rounded-lg">{assignError}</p>
              )}

              <p className="text-sm font-semibold text-custom-700 mb-3">
                Select an employee to assign:
              </p>

              <div className="space-y-2">
                {employees.length === 0 ? (
                  <p className="text-sm text-custom-700 text-center py-4">
                    No employees in this department
                  </p>
                ) : (
                  employees.map((emp) => {
                    // Disable if this employee already has this exact job assigned
                    const alreadyHasThisJob =
                      (emp.assignedJobs?.some((j) => j.id === assignJob_.id) ?? false) ||
                      emp.jobId === assignJob_.id;
                    return (
                      <button
                        key={emp.id}
                        onClick={() => !alreadyHasThisJob && handleAssignEmployee(emp.id)}
                        disabled={isAssigning || alreadyHasThisJob}
                        className={`w-full p-3 rounded-xl border-2 transition-colors text-left ${
                          alreadyHasThisJob
                            ? "border-green-300 bg-green-50 cursor-not-allowed opacity-70"
                            : "border-custom-300 hover:border-primary-400 hover:bg-primary-50 disabled:opacity-60"
                        }`}
                      >
                        <div className="flex items-center justify-between">
                          <div className="flex items-center gap-3">
                            <div className="w-9 h-9 rounded-full bg-primary-100 flex items-center justify-center flex-shrink-0">
                              <span className="text-primary-600 font-bold text-xs">
                                {emp.fullName.charAt(0).toUpperCase()}
                              </span>
                            </div>
                            <div>
                              <p className="font-semibold text-secondary-100 text-sm">{emp.fullName}</p>
                              <p className="text-xs text-custom-700">
                                {emp.contractType?.replace("_", " ").toLowerCase() ?? "—"}
                              </p>
                            </div>
                          </div>
                          {alreadyHasThisJob ? (
                            <span className="text-xs font-semibold px-2 py-0.5 rounded-full bg-green-100 text-green-700">
                              Already assigned ✓
                            </span>
                          ) : (emp.assignedJobs?.length ?? 0) > 0 || emp.jobId ? (
                            <span className="text-xs font-semibold px-2 py-0.5 rounded-full bg-yellow-100 text-yellow-700">
                              Has other job
                            </span>
                          ) : (
                            <span className="text-xs font-semibold px-2 py-0.5 rounded-full bg-green-100 text-green-700">
                              Available
                            </span>
                          )}
                        </div>
                      </button>
                    );
                  })
                )}
              </div>

              <button
                onClick={closeAssignModal}
                className="mt-4 w-full px-4 py-2 rounded-xl border border-custom-300 hover:bg-custom-100 text-sm font-semibold text-custom-700"
              >
                Cancel
              </button>

            </Card>
          </div>
        )}

        {/* ── Add Spec Modal ── */}
        {specTarget && (
          <AddSpecModal
            jobId={specTarget.id}
            jobNumber={specTarget.jobNumber}
            onClose={() => setSpecTarget(null)}
          />
        )}

      </div>
    </DashboardLayout>
  );
}
