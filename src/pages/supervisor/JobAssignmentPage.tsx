import { useMemo, useState } from "react";
import { useSelector } from "react-redux";
import {
  HiOutlineCheckCircle,
  HiOutlineClock,
  HiOutlineExclamationCircle,
  HiOutlineFlag,
  HiOutlineRefresh,
  HiOutlineSearch,
  HiOutlineUserAdd,
  HiOutlineX,
} from "react-icons/hi";
import { DashboardLayout } from "../../components";
import { Card } from "../../components/ui";
import { useGetDepartmentsQuery } from "../../store/services/departmentsService";
import { useGetAllEmployeesQuery, useAssignJobToEmployeeMutation } from "../../store/services/employeesService";
import type { Job, JobState } from "../../store/services/jobsService";
import {
  useGetJobsQuery,
  useUpdateJobStateMutation,
} from "../../store/services/jobsService";
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

// ─── Mark Done button (inline) ───────────────────────────────────────────────

function MarkDoneButton({ job, onClick }: { job: Job; onClick: (job: Job) => void }) {
  const canMark = job.state != null && DONE_STATE_MAP[job.state as NonNullable<JobState>] !== undefined;
  if (!canMark) return <span className="text-xs text-custom-500 italic">—</span>;
  return (
    <button
      onClick={() => onClick(job)}
      className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-green-500 text-white hover:bg-green-600 transition-colors text-xs font-semibold"
    >
      <HiOutlineFlag className="w-3.5 h-3.5" />
      Mark Done
    </button>
  );
}

// ─── Main Page ────────────────────────────────────────────────────────────────

export default function SupervisorJobsPage() {
  const [search, setSearch]       = useState("");
  const [page, setPage]           = useState(1);
  const [showModal, setShowModal] = useState(false);
  const [activeJob, setActiveJob] = useState<Job | null>(null);
  const [error, setError]         = useState("");

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
    if (!activeJob?.state) return;
    const doneState = DONE_STATE_MAP[activeJob.state as NonNullable<JobState>];
    if (!doneState) return;
    try {
      await updateJobState({ id: activeJob.id, state: doneState }).unwrap();
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
                  {["Job", "Client", "Status", "Dept State", "Priority", "Due Date", "Actions"].map((h) => (
                    <th
                      key={h}
                      className={`px-4 py-3 text-xs font-bold text-secondary-100 uppercase ${h === "Actions" ? "text-right" : "text-left"}`}
                    >
                      {h}
                    </th>
                  ))}
                </tr>
              </thead>
              <tbody className="bg-white divide-y divide-custom-200">
                {isLoading ? (
                  <tr>
                    <td colSpan={7} className="px-4 py-12 text-center">
                      <div className="flex items-center justify-center gap-2 text-custom-700">
                        <HiOutlineRefresh className="w-5 h-5 animate-spin" />
                        <span className="text-sm">Loading jobs…</span>
                      </div>
                    </td>
                  </tr>
                ) : jobs.length === 0 ? (
                  <tr>
                    <td colSpan={7} className="px-4 py-12 text-center text-custom-700 text-sm">
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
                          <span className={`px-2.5 py-1 rounded-full text-xs font-bold ${priorityColor[job.priority] ?? "bg-gray-100 text-gray-700"}`}>
                            {job.priority}
                          </span>
                        </td>
                        <td className="px-4 py-4">
                          <span className="text-sm text-custom-700">
                            {job.dueDate ? job.dueDate.split("T")[0] : "—"}
                          </span>
                        </td>
                        <td className="px-4 py-4 text-right">
                          <div className="flex items-center justify-end gap-2">
                            {/* Assign / Reassign employee to this job */}
                            {(() => {
                              const alreadyAssigned = employees.some(
                                (e) =>
                                  (e.assignedJobs?.some((j) => j.id === job.id) ?? false) ||
                                  e.jobId === job.id
                              );
                              return (
                                <button
                                  onClick={() => openAssignModal(job)}
                                  className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg transition-colors text-xs font-semibold text-white ${
                                    alreadyAssigned
                                      ? "bg-amber-500 hover:bg-amber-600"
                                      : "bg-primary-500 hover:bg-primary-600"
                                  }`}
                                  title={alreadyAssigned ? "Reassign employee" : "Assign employee"}
                                >
                                  <HiOutlineUserAdd className="w-3.5 h-3.5" />
                                  {alreadyAssigned ? "Reassign" : "Assign"}
                                </button>
                              );
                            })()}
                            {/* Mark department done */}
                            <MarkDoneButton job={job} onClick={openModal} />
                          </div>
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
                    <p className="text-custom-700">State will change to:</p>
                    <p className="font-bold text-green-700 mt-0.5">
                      {doneState ? (STATE_LABELS[doneState as NonNullable<JobState>] ?? doneState) : "—"}
                    </p>
                  </div>
                </div>

                {error && (
                  <p className="mb-3 text-sm text-red-600 bg-red-50 px-3 py-2 rounded-lg">{error}</p>
                )}

                <button
                  onClick={handleMarkDone}
                  disabled={isSaving}
                  className="w-full px-4 py-2 rounded-xl bg-green-600 text-white hover:bg-green-700 transition-colors text-sm font-semibold disabled:opacity-50 flex items-center justify-center gap-2"
                >
                  <HiOutlineFlag className="w-4 h-4" />
                  {isSaving ? "Saving…" : "Confirm — Mark Done"}
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

      </div>
    </DashboardLayout>
  );
}
