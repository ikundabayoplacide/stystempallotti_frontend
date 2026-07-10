import { useMemo, useState } from "react";
import { useNavigate } from "react-router-dom";
import { useSelector } from "react-redux";
import {
  HiOutlineArchive,
  HiOutlineCheckCircle,
  HiOutlineClipboardList,
  HiOutlineClock,
  HiOutlineCog,
  HiOutlineExclamationCircle,
  HiOutlinePlus,
  HiOutlineRefresh,
  HiOutlineUsers,
  HiOutlineX,
} from "react-icons/hi";
import { toast } from "react-toastify";
import { Card } from "../../components/ui";
import { useGetJobsQuery } from "../../store/services/jobsService";
import { useGetAllEmployeesQuery } from "../../store/services/employeesService";
import { useGetDepartmentsQuery } from "../../store/services/departmentsService";
import { useGetMachinesQuery } from "../../store/services/machinesService";
import { useGetBindingStockItemsQuery } from "../../store/services/bindingStockService";
import { useCreateJobSpecMutation } from "../../store/services/jobSpecsService";
import { jobStatusConfig } from "../../types/JobStatus";
import type { RootState } from "../../store";

const priorityColor: Record<string, string> = {
  high:   "bg-orange-100 text-orange-700",
  urgent: "bg-red-500 text-white",
  normal: "bg-blue-100 text-blue-700",
  low:    "bg-green-100 text-green-700",
};

const STATE_LABELS: Record<string, string> = {
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

const STATE_COLORS: Record<string, { bg: string; text: string }> = {
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

const MAX_JOBS  = 5;
const PAGE_SIZE = 5;

function WorkloadBar({ jobCount }: { jobCount: number }) {
  const pct       = Math.min(100, Math.round((jobCount / MAX_JOBS) * 100));
  const color     = pct === 0 ? "bg-gray-300" : pct <= 40 ? "bg-green-500" : pct <= 75 ? "bg-yellow-500" : "bg-red-500";
  const label     = pct === 0 ? "Free" : pct <= 40 ? "Light" : pct <= 75 ? "Busy" : "Overloaded";
  const textColor = pct === 0 ? "text-gray-400" : pct <= 40 ? "text-green-600" : pct <= 75 ? "text-yellow-600" : "text-red-600";
  return (
    <div className="mt-2 space-y-0.5">
      <div className="flex items-center justify-between">
        <span className="text-[10px] text-custom-500">{jobCount} job{jobCount !== 1 ? "s" : ""}</span>
        <span className={`text-[10px] font-bold ${textColor}`}>{label}</span>
      </div>
      <div className="w-full h-1.5 rounded-full bg-custom-200">
        <div className={`h-1.5 rounded-full transition-all duration-300 ${color}`} style={{ width: `${pct}%` }} />
      </div>
    </div>
  );
}

const inputCls = "w-full px-3 py-2 rounded-xl border border-custom-300 bg-style-500 text-secondary-100 text-sm focus:outline-none focus:border-primary-400 transition-colors";

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

export default function SupervisorDashboard() {
  const [jobPage, setJobPage] = useState(1);
  const [specTarget, setSpecTarget] = useState<{ id: string; jobNumber: string } | null>(null);
  const navigate = useNavigate();

  const currentUser = useSelector((state: RootState) => state.auth.user);
  const myDeptId    = currentUser?.departmentId;

  const { data: activeData, isLoading, isFetching, refetch } = useGetJobsQuery(
    { limit: 200, departmentAssignedToId: myDeptId ?? undefined },
    { skip: !myDeptId }
  );
  const { data: completedData } = useGetJobsQuery(
    { status: "completed", limit: 200, departmentAssignedToId: myDeptId ?? undefined },
    { skip: !myDeptId }
  );
  const { data: employeesRes } = useGetAllEmployeesQuery(
    { isActive: true, limit: 200, departmentId: myDeptId ?? undefined },
    { skip: !myDeptId }
  );
  const { data: departments = [] } = useGetDepartmentsQuery();

  const myDept        = departments.find((d) => d.id === myDeptId);
  const jobs          = activeData?.jobs ?? [];
  const completedJobs = completedData?.jobs ?? [];
  const workers       = employeesRes?.data ?? [];

  const urgentJobs = jobs.filter(
    (j) => j.priority === "urgent" && j.status !== "completed" && j.status !== "delivered"
  );
  const todayStr = new Date().toLocaleDateString();
  const isToday = (dateStr?: string | null) =>
    !!dateStr && new Date(dateStr).toLocaleDateString() === todayStr;
  const completedToday = [...completedJobs, ...jobs]
    .filter((j) => isToday(j.completedAt) || isToday(j.updatedAt))
    .filter((j, i, arr) => arr.findIndex((x) => x.id === j.id) === i);
  const activeCount = jobs.filter((j) => j.status !== "completed" && j.status !== "rejected").length;

  const busyWorkers = useMemo(
    () => workers.filter((w) => (w.assignedJobs?.length ?? (w.jobId ? 1 : 0)) > 0).length,
    [workers]
  );
  const busyPct = workers.length > 0 ? Math.round((busyWorkers / workers.length) * 100) : 0;

  const { data: machinesData = [] } = useGetMachinesQuery(
    myDeptId ? { departmentId: myDeptId } : undefined,
    { skip: !myDeptId }
  );
  const isBindingDept = !!myDept && myDept.name.toLowerCase().includes("binding");
  const { data: stockData } = useGetBindingStockItemsQuery(
    { limit: 200 },
    { skip: !isBindingDept }
  );
  const lowStockCount = isBindingDept
    ? (stockData?.data ?? []).filter((i) => i.stockStatus === "low" || i.stockStatus === "out-of-stock").length
    : 0;

  const totalPages = Math.max(1, Math.ceil(jobs.length / PAGE_SIZE));
  const pagedJobs  = useMemo(
    () => jobs.slice((jobPage - 1) * PAGE_SIZE, jobPage * PAGE_SIZE),
    [jobs, jobPage]
  );

  const kpis = [
    {
      label: "Active Jobs",
      value: activeCount,
      icon: HiOutlineClock,
      color: "text-blue-600",
      bg: "bg-blue-100",
      to: "/supervisor/jobs",
    },
    {
      label: "Total Employees",
      value: workers.length,
      icon: HiOutlineUsers,
      color: "text-indigo-600",
      bg: "bg-indigo-100",
      to: "/supervisor/employees",
    },
    {
      label: "Total Machines",
      value: machinesData.length,
      icon: HiOutlineCog,
      color: "text-purple-600",
      bg: "bg-purple-100",
      to: "/supervisor/machines",
    },
    {
      label: "Completed Today",
      value: completedToday.length,
      icon: HiOutlineCheckCircle,
      color: "text-emerald-600",
      bg: "bg-emerald-100",
      to: "/supervisor/jobs",
    },
    {
      label: "Urgent",
      value: urgentJobs.length,
      icon: HiOutlineExclamationCircle,
      color: urgentJobs.length > 0 ? "text-red-600" : "text-custom-700",
      bg: urgentJobs.length > 0 ? "bg-red-100" : "bg-custom-100",
      to: "/supervisor/jobs",
    },
    ...(isBindingDept ? [{
      label: "Low Stock",
      value: lowStockCount,
      icon: HiOutlineArchive,
      color: lowStockCount > 0 ? "text-yellow-600" : "text-custom-700",
      bg: lowStockCount > 0 ? "bg-yellow-100" : "bg-custom-100",
      to: "/supervisor/binding-stock",
    }] : []),
  ];

  if (!myDeptId) {
    return (
      <div className="space-y-6">
        <Card className="!p-8 text-center">
          <p className="text-custom-700 text-sm">Your account is not assigned to a department.</p>
          <p className="text-custom-700 text-xs mt-1">Contact an administrator.</p>
        </Card>
      </div>
    );
  }

  return (
    <div className="space-y-8 font-[family-name:var(--font-family-primary)]">

      {/* Header */}
      <div className="flex flex-col xs:flex-row xs:items-center justify-between gap-3">
        <div>
          <h1 className="text-2xl md:text-3xl font-bold text-secondary-100">Supervisor Dashboard</h1>
          <p className="text-sm text-custom-700 mt-1">
            Department: <span className="font-semibold text-primary-600">{myDept?.name ?? myDeptId}</span>
          </p>
        </div>
        <button
          onClick={() => refetch()}
          className="self-start p-2 rounded-xl border border-custom-300 hover:bg-custom-100 transition-colors"
          title="Refresh"
        >
          <HiOutlineRefresh className={`w-5 h-5 text-custom-700 ${isFetching ? "animate-spin" : ""}`} />
        </button>
      </div>

      {/* KPI Grid */}
      <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-5 gap-4">
        {kpis.map(({ label, value, icon: Icon, color, bg, to }) => (
          <Card
            key={label}
            className="!p-4 flex flex-col gap-3 cursor-pointer hover:shadow-md hover:scale-[1.02] transition-all duration-200 group"
            onClick={() => navigate(to)}
          >
            <div className={`w-10 h-10 rounded-xl flex items-center justify-center ${bg}`}>
              <Icon className={`w-5 h-5 ${color}`} />
            </div>
            <div>
              <p className="text-xs text-custom-700 group-hover:text-primary-500 transition-colors">{label}</p>
              <p className="text-2xl font-bold text-secondary-100">{value}</p>
            </div>
          </Card>
        ))}
      </div>

      {/* Workers Summary + Workload */}
      <Card>
        <div className="flex items-center justify-between mb-4">
          <div className="flex items-center gap-2">
            <HiOutlineUsers className="w-5 h-5 text-primary-500" />
            <h2 className="font-bold text-secondary-100">
              Workers — {myDept?.name ?? "Department"} ({workers.length})
            </h2>
          </div>
          <div className="flex items-center gap-3">
            <span className="text-xs text-custom-700 hidden sm:block">
              {busyWorkers}/{workers.length} busy
            </span>
            <div className="w-28 space-y-0.5">
              <div className="flex justify-between">
                <span className="text-[10px] text-custom-500">Dept load</span>
                <span className={`text-[10px] font-bold ${
                  busyPct === 0 ? "text-gray-400" : busyPct <= 40 ? "text-green-600" : busyPct <= 75 ? "text-yellow-600" : "text-red-600"
                }`}>{busyPct}%</span>
              </div>
              <div className="w-full h-2 rounded-full bg-custom-200">
                <div
                  className={`h-2 rounded-full transition-all duration-500 ${
                    busyPct === 0 ? "bg-gray-300" : busyPct <= 40 ? "bg-green-500" : busyPct <= 75 ? "bg-yellow-500" : "bg-red-500"
                  }`}
                  style={{ width: `${busyPct}%` }}
                />
              </div>
            </div>
          </div>
        </div>

        {workers.length === 0 ? (
          <p className="text-sm text-custom-700">No active workers assigned to this department.</p>
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
            {workers.map((w) => {
              const jobCount = w.assignedJobs?.length ?? (w.jobId ? 1 : 0);
              return (
                <div key={w.id} className="p-3 rounded-xl bg-custom-50 border border-custom-200">
                  <div className="flex items-center gap-2 mb-2">
                    <div className="w-8 h-8 rounded-full bg-primary-100 flex items-center justify-center flex-shrink-0">
                      <span className="text-primary-600 font-bold text-xs">{w.fullName.charAt(0)}</span>
                    </div>
                    <div className="min-w-0">
                      <p className="text-sm font-semibold text-secondary-100 truncate">{w.fullName}</p>
                      <p className="text-xs text-custom-700 capitalize">{w.contractType?.replace("_", " ").toLowerCase() ?? "—"}</p>
                    </div>
                  </div>
                  <WorkloadBar jobCount={jobCount} />
                </div>
              );
            })}
          </div>
        )}
      </Card>

      {/* Jobs in Production */}
      <Card className="!p-0 overflow-hidden">
        <div className="flex items-center gap-2 px-4 py-3 border-b border-custom-200">
          <HiOutlineClipboardList className="w-5 h-5 text-primary-500" />
          <h2 className="font-bold text-secondary-100">Jobs in Production</h2>
          <span className="text-xs text-custom-500">({jobs.length})</span>
        </div>

        {isLoading ? (
          <div className="flex items-center gap-2 py-8 justify-center text-custom-700">
            <HiOutlineRefresh className="w-4 h-4 animate-spin" />
            <span className="text-sm">Loading…</span>
          </div>
        ) : jobs.length === 0 ? (
          <p className="text-sm text-custom-700 py-8 text-center">No jobs assigned to your department</p>
        ) : (
          <>
            <div className="overflow-x-auto">
              <table className="w-full text-sm">
                <thead className="bg-custom-100 border-b border-custom-300">
                  <tr>
                    {["Job", "Client", "Status", "Dept State", "Priority", "Due Date", ""].map((h) => (
                      <th key={h} className="text-left py-2 px-4 text-xs font-bold text-secondary-100 uppercase tracking-wide whitespace-nowrap">
                        {h}
                      </th>
                    ))}
                  </tr>
                </thead>
                <tbody className="divide-y divide-custom-200">
                  {pagedJobs.map((job) => {
                    const statusCfg   = jobStatusConfig[job.status] ?? { label: job.status, bgColor: "bg-gray-100", color: "text-gray-700" };
                    const stateColors = job.state ? (STATE_COLORS[job.state] ?? { bg: "bg-gray-100", text: "text-gray-700" }) : null;
                    return (
                      <tr key={job.id} className={`hover:bg-custom-50 transition-colors ${job.priority === "urgent" ? "bg-red-50" : ""}`}>
                        <td className="py-3 px-4">
                          <span className="font-bold text-primary-600 whitespace-nowrap">{job.jobNumber}</span>
                          <p className="text-xs text-custom-700 max-w-[140px] truncate">{job.title}</p>
                        </td>
                        <td className="py-3 px-4 text-secondary-100 whitespace-nowrap">{job.customer?.name ?? "—"}</td>
                        <td className="py-3 px-4">
                          <span className={`text-xs font-semibold px-2 py-0.5 rounded-full whitespace-nowrap ${statusCfg.bgColor} ${statusCfg.color}`}>
                            {statusCfg.label}
                          </span>
                        </td>
                        <td className="py-3 px-4">
                          {stateColors ? (
                            <span className={`text-xs font-semibold px-2 py-0.5 rounded-full whitespace-nowrap ${stateColors.bg} ${stateColors.text}`}>
                              {STATE_LABELS[job.state!] ?? job.state}
                            </span>
                          ) : (
                            <span className="text-xs text-custom-500 italic">—</span>
                          )}
                        </td>
                        <td className="py-3 px-4">
                          <span className={`text-xs font-bold px-2 py-0.5 rounded-full whitespace-nowrap ${priorityColor[job.priority] ?? "bg-gray-100 text-gray-700"}`}>
                            {job.priority}
                          </span>
                        </td>
                        <td className="py-3 px-4 text-custom-700 whitespace-nowrap">
                          {job.dueDate ? job.dueDate.split("T")[0] : "—"}
                        </td>
                        <td className="py-3 px-4">
                          <button
                            onClick={() => setSpecTarget({ id: job.id, jobNumber: job.jobNumber })}
                            className="flex items-center gap-1 px-2.5 py-1.5 rounded-lg bg-primary-50 border border-primary-200 text-xs font-semibold text-primary-600 hover:bg-primary-100 transition-colors whitespace-nowrap"
                          >
                            <HiOutlinePlus className="w-3.5 h-3.5" /> Add Spec
                          </button>
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>

            {jobs.length > PAGE_SIZE && (
              <div className="flex items-center justify-between px-4 py-3 border-t border-custom-200 bg-custom-50">
                <p className="text-xs text-custom-700">
                  {(jobPage - 1) * PAGE_SIZE + 1}–{Math.min(jobPage * PAGE_SIZE, jobs.length)} of {jobs.length}
                </p>
                <div className="flex items-center gap-2">
                  <button
                    disabled={jobPage <= 1}
                    onClick={() => setJobPage((p) => p - 1)}
                    className="px-3 py-1.5 rounded-lg border border-custom-300 text-xs font-semibold disabled:opacity-40 hover:bg-custom-100 transition-colors"
                  >
                    Previous
                  </button>
                  <span className="text-xs text-custom-700 font-semibold">{jobPage} / {totalPages}</span>
                  <button
                    disabled={jobPage >= totalPages}
                    onClick={() => setJobPage((p) => p + 1)}
                    className="px-3 py-1.5 rounded-lg border border-custom-300 text-xs font-semibold disabled:opacity-40 hover:bg-custom-100 transition-colors"
                  >
                    Next
                  </button>
                </div>
              </div>
            )}
          </>
        )}
      </Card>

      {/* Completed Today */}
      {completedToday.length > 0 && (
        <Card>
          <div className="flex items-center gap-2 mb-4">
            <HiOutlineCheckCircle className="w-5 h-5 text-green-600" />
            <h2 className="font-bold text-secondary-100">Completed Today ({completedToday.length})</h2>
          </div>
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
            {completedToday.map((job) => (
              <div key={job.id} className="p-3 rounded-xl bg-green-50 border border-green-200">
                <span className="font-bold text-primary-500 text-sm">{job.jobNumber}</span>
                <p className="text-sm font-semibold text-secondary-100 mt-1">{job.customer?.name ?? "—"}</p>
                <p className="text-xs text-custom-700">{job.title}</p>
              </div>
            ))}
          </div>
        </Card>
      )}

      {specTarget && (
        <AddSpecModal
          jobId={specTarget.id}
          jobNumber={specTarget.jobNumber}
          onClose={() => setSpecTarget(null)}
        />
      )}
    </div>
  );
}
