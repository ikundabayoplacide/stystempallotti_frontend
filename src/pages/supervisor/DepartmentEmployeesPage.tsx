import { useState } from "react";
import { useSelector } from "react-redux";
import {
  HiOutlineCheckCircle,
  HiOutlineChevronDown,
  HiOutlineChevronRight,
  HiOutlineClipboardList,
  HiOutlineClock,
  HiOutlineMail,
  HiOutlinePhone,
  HiOutlineRefresh,
  HiOutlineSearch,
  HiOutlineUserAdd,
  HiOutlineUsers,
  HiOutlineX,
  HiOutlineXCircle,
} from "react-icons/hi";
import { DashboardLayout } from "../../components";
import { Card } from "../../components/ui";
import {
  useGetAllEmployeesQuery,
  useGetEmployeeByIdQuery,
  useAssignJobToEmployeeMutation,
  useUnassignJobFromEmployeeMutation,
  type Employee,
  type EmployeeJob,
} from "../../store/services/employeesService";
import { useGetJobsQuery, type Job } from "../../store/services/jobsService";
import { useGetDepartmentsQuery } from "../../store/services/departmentsService";
import { jobStatusConfig } from "../../types/JobStatus";
import type { RootState } from "../../store";

// ─── Helpers ──────────────────────────────────────────────────────────────────

const priorityColor: Record<string, string> = {
  high:   "bg-red-500 text-white",
  urgent: "bg-red-700 text-white",
  normal: "bg-yellow-500 text-white",
  low:    "bg-green-500 text-white",
};

const priorityBadge: Record<string, string> = {
  urgent: "bg-red-100 text-red-700",
  high:   "bg-orange-100 text-orange-700",
  normal: "bg-blue-100 text-blue-700",
  low:    "bg-green-100 text-green-700",
};

type ViewMode = "employees" | "jobs";

/** Normalise: backend now returns assignedJobs[], fallback to legacy jobs[]/job */
function getEmployeeJobs(emp: Employee): EmployeeJob[] {
  console.log(`[getEmployeeJobs] emp.id=${emp.id} assignedJobs=`, emp.assignedJobs, "jobs=", emp.jobs, "job=", emp.job);
  if (Array.isArray(emp.assignedJobs) && emp.assignedJobs.length > 0) return emp.assignedJobs;
  if (Array.isArray(emp.jobs) && emp.jobs.length > 0) return emp.jobs;
  if (emp.job) return [emp.job];
  return [];
}

// ─── Workload bar ────────────────────────────────────────────────────────────

const MAX_JOBS = 5;

function WorkloadBar({ jobCount }: { jobCount: number }) {
  const pct = Math.min(100, Math.round((jobCount / MAX_JOBS) * 100));
  const color =
    pct === 0   ? "bg-gray-300" :
    pct <= 40   ? "bg-green-500" :
    pct <= 75   ? "bg-yellow-500" :
                  "bg-red-500";
  const label =
    pct === 0   ? "Free" :
    pct <= 40   ? "Light" :
    pct <= 75   ? "Busy" :
                  "Overloaded";
  return (
    <div className="flex flex-col items-end gap-0.5 flex-shrink-0 min-w-[80px]">
      <div className="flex items-center justify-between w-full">
        <span className="text-[10px] text-custom-500">{jobCount} job{jobCount !== 1 ? "s" : ""}</span>
        <span className={`text-[10px] font-bold ${
          pct === 0 ? "text-gray-400" : pct <= 40 ? "text-green-600" : pct <= 75 ? "text-yellow-600" : "text-red-600"
        }`}>{label}</span>
      </div>
      <div className="w-full h-1.5 rounded-full bg-custom-200">
        <div
          className={`h-1.5 rounded-full transition-all duration-300 ${color}`}
          style={{ width: `${pct}%` }}
        />
      </div>
    </div>
  );
}


function EmployeeJobsPanel({
  employeeId,
  onUnassign,
  isSaving,
}: {
  employeeId: string;
  onUnassign: (employeeId: string, jobId: string) => void;
  isSaving: boolean;
}) {
  const { data: detail, isLoading } = useGetEmployeeByIdQuery(employeeId, {
    refetchOnMountOrArgChange: true,
  });

  console.log(`[EmployeeJobsPanel] employeeId=${employeeId} isLoading=${isLoading} detail=`, detail);

  const jobs = detail ? getEmployeeJobs(detail) : [];

  if (isLoading) {
    return (
      <p className="text-xs text-custom-500 italic py-2 flex items-center gap-1">
        <HiOutlineRefresh className="w-3 h-3 animate-spin" /> Loading jobs…
      </p>
    );
  }

  if (jobs.length === 0) {
    return <p className="text-xs text-custom-500 italic">No jobs assigned to this employee.</p>;
  }

  return (
    <div className="space-y-1.5">
      {jobs.map((job) => (
        <div
          key={job.id}
          className="flex items-center gap-2 px-3 py-2 rounded-lg bg-white border border-custom-200"
        >
          <div className="flex-1 min-w-0">
            <span className="text-xs font-bold text-primary-600 mr-2">{job.jobNumber}</span>
            <span className="text-xs text-secondary-100 truncate">{job.title}</span>
          </div>
          <span
            className={`text-[10px] font-bold px-1.5 py-0.5 rounded-full flex-shrink-0 ${
              priorityBadge[job.priority] ?? "bg-gray-100 text-gray-700"
            }`}
          >
            {job.priority}
          </span>
          <button
            onClick={() => onUnassign(employeeId, job.id)}
            disabled={isSaving}
            title="Remove this job"
            className="p-1 rounded text-red-400 hover:text-red-600 hover:bg-red-50 transition-colors disabled:opacity-40 flex-shrink-0"
          >
            <HiOutlineXCircle className="w-4 h-4" />
          </button>
        </div>
      ))}
    </div>
  );
}

// ─── Main Component ───────────────────────────────────────────────────────────

export default function DepartmentEmployeesPage() {
  const [viewMode, setViewMode]       = useState<ViewMode>("employees");
  const [search, setSearch]           = useState("");
  const [expandedId, setExpandedId]   = useState<string | null>(null);
  const [selectedJob, setSelectedJob] = useState<Job | null>(null);
  const [showModal, setShowModal]     = useState(false);
  const [assignError, setAssignError] = useState("");

  const currentUser = useSelector((state: RootState) => state.auth.user);
  const myDeptId    = currentUser?.departmentId;

  const {
    data: employeesData,
    isLoading: loadingEmployees,
    refetch: refetchEmployees,
  } = useGetAllEmployeesQuery(
    { limit: 200 },
    { skip: !myDeptId, refetchOnMountOrArgChange: true }
  );

  const employees = employeesData?.data ?? [];

  const { data: activeJobsData, isLoading: loadingJobs, refetch: refetchJobs } =
    useGetJobsQuery(
      { limit: 200, departmentAssignedToId: myDeptId ?? undefined },
      { skip: !myDeptId }
    );
  const { data: completedData } = useGetJobsQuery(
    { status: "completed", limit: 200, departmentAssignedToId: myDeptId ?? undefined },
    { skip: !myDeptId }
  );

  const { data: departments = [] } = useGetDepartmentsQuery();
  const [assignJob, { isLoading: isAssigning }]   = useAssignJobToEmployeeMutation();
  const [unassignJob, { isLoading: isUnassigning }] = useUnassignJobFromEmployeeMutation();

  // ─── Derived ────────────────────────────────────────────────────────────────

  const activeJobs    = activeJobsData?.jobs ?? [];
  const completedJobs = completedData?.jobs ?? [];
  const myDept        = departments.find((d) => d.id === myDeptId);
  const isLoading     = loadingEmployees || loadingJobs;

  const filteredEmployees = employees.filter((emp) => {
    if (!search.trim()) return true;
    const q = search.toLowerCase();
    return (
      emp.fullName?.toLowerCase().includes(q) ||
      emp.email?.toLowerCase().includes(q) ||
      emp.phoneNumber?.toLowerCase().includes(q)
    );
  });

  // hasjob: backend now returns assignedJobs[]; fallback to legacy jobId
  const freeCount = employees.filter((e) => !(e.assignedJobs?.length ?? (e.jobId ? 1 : 0))).length;

  // ─── Handlers ───────────────────────────────────────────────────────────────

  const toggleExpand = (id: string) =>
    setExpandedId((prev) => (prev === id ? null : id));

  const openAssignModal = (job: Job) => {
    setSelectedJob(job);
    setAssignError("");
    setShowModal(true);
  };

  const closeModal = () => {
    setShowModal(false);
    setSelectedJob(null);
    setAssignError("");
  };

  const handleAssign = async (employeeId: string) => {
    if (!selectedJob) return;
    try {
      await assignJob({ employeeId, jobId: selectedJob.id }).unwrap();
      await refetchEmployees();
      closeModal();
    } catch (err: any) {
      console.log("[assign-job] error response:", err);
      const msg = err?.data?.message ?? err?.error ?? "Failed to assign job";
      setAssignError(msg);
    }
  };

  const handleUnassign = async (employeeId: string, jobId: string) => {
    try {
      console.log("[unassign-job] employeeId:", employeeId, "jobId:", jobId);
      await unassignJob({ employeeId, jobId }).unwrap();
      await refetchEmployees();
    } catch (err: any) {
      console.log("[unassign-job] error response:", err);
      alert(err?.data?.message ?? err?.error ?? "Failed to unassign");
    }
  };

  const refetchAll = () => { refetchEmployees(); refetchJobs(); };

  // ─── No department guard ─────────────────────────────────────────────────────

  if (!myDeptId) {
    return (
      <DashboardLayout userRole="supervisor" userName={currentUser?.name ?? "Supervisor"} notificationCount={0}>
        <Card className="!p-8 text-center">
          <HiOutlineUsers className="w-12 h-12 text-custom-400 mx-auto mb-3" />
          <p className="text-custom-700 text-sm font-semibold">Your account is not assigned to a department yet.</p>
          <p className="text-custom-700 text-xs mt-1">Contact an administrator to assign you to a department.</p>
        </Card>
      </DashboardLayout>
    );
  }

  // ─── Render ──────────────────────────────────────────────────────────────────

  return (
    <DashboardLayout
      userRole="supervisor"
      userName={currentUser?.name ?? "Supervisor"}
      notificationCount={freeCount}
    >
      <div className="space-y-6 font-[family-name:var(--font-family-primary)]">

        {/* ── Header ── */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
          <div>
            <h1 className="text-2xl md:text-3xl font-bold text-secondary-100">Department Employees</h1>
            <p className="text-sm text-custom-700 mt-1">
              Department: <span className="font-semibold text-primary-600">{myDept?.name ?? myDeptId}</span>
              {" · "}{freeCount} available · {employees.length} total
            </p>
          </div>
          <div className="flex items-center gap-2">
            <button
              onClick={refetchAll}
              disabled={isLoading}
              className="p-2 rounded-xl border border-custom-300 hover:bg-custom-100 transition-colors text-custom-700 disabled:opacity-50"
              title="Refresh"
            >
              <HiOutlineRefresh className={`w-5 h-5 ${isLoading ? "animate-spin" : ""}`} />
            </button>
            <button
              onClick={() => setViewMode("employees")}
              className={`px-4 py-2 rounded-xl transition-colors text-sm font-semibold ${
                viewMode === "employees" ? "bg-primary-500 text-white" : "border border-custom-300 text-custom-700 hover:bg-custom-100"
              }`}
            >
              <HiOutlineUsers className="w-4 h-4 inline mr-1" /> Employees
            </button>
            <button
              onClick={() => setViewMode("jobs")}
              className={`px-4 py-2 rounded-xl transition-colors text-sm font-semibold ${
                viewMode === "jobs" ? "bg-primary-500 text-white" : "border border-custom-300 text-custom-700 hover:bg-custom-100"
              }`}
            >
              <HiOutlineClipboardList className="w-4 h-4 inline mr-1" /> Jobs
            </button>
          </div>
        </div>

        {/* ── Search ── */}
        {viewMode === "employees" && (
          <div className="relative max-w-sm">
            <HiOutlineSearch className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-custom-500 pointer-events-none" />
            <input
              type="text"
              placeholder="Search by name, email, phone…"
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="w-full pl-9 pr-4 py-2 rounded-xl border border-custom-300 bg-white text-sm text-secondary-100 placeholder-custom-500 focus:outline-none focus:ring-2 focus:ring-primary-400"
            />
          </div>
        )}

        {isLoading ? (
          <Card className="!p-8 text-center text-custom-700 text-sm">Loading…</Card>
        ) : (
          <>
            {/* ══ Employees View ══ */}
            {viewMode === "employees" && (
              <Card className="!p-0 overflow-hidden">

                {/* hint */}
                <div className="px-4 py-2 bg-custom-50 border-b border-custom-200 text-xs text-custom-500">
                  Click a row to see the jobs assigned to that employee
                </div>

                <div className="divide-y divide-custom-200">
                  {filteredEmployees.length === 0 ? (
                    <p className="px-4 py-10 text-center text-custom-700 text-sm">
                      {search ? "No employees match your search." : "No employees found in this department."}
                    </p>
                  ) : (
                    filteredEmployees.map((emp) => {
                      const isExpanded = expandedId === emp.id;
                      // hasjob: prefer assignedJobs[], fallback to legacy jobId
                      const hasjob = (emp.assignedJobs?.length ?? 0) > 0 || !!emp.jobId;

                      return (
                        <div key={emp.id} className="bg-white">

                          {/* ── Employee summary row ── */}
                          <button
                            onClick={() => toggleExpand(emp.id)}
                            className="w-full text-left hover:bg-custom-50 transition-colors"
                          >
                            <div className="flex items-center gap-3 px-4 py-3">

                              {/* Chevron */}
                              <span className="text-custom-400 flex-shrink-0">
                                {isExpanded
                                  ? <HiOutlineChevronDown className="w-4 h-4" />
                                  : <HiOutlineChevronRight className="w-4 h-4" />
                                }
                              </span>

                              {/* Avatar */}
                              <div className="w-9 h-9 rounded-full bg-primary-100 flex items-center justify-center flex-shrink-0">
                                <span className="text-primary-600 font-bold text-sm">
                                  {emp.fullName.charAt(0).toUpperCase()}
                                </span>
                              </div>

                              {/* Name + contact */}
                              <div className="flex-1 min-w-0">
                                <p className="text-sm font-semibold text-secondary-100 truncate">{emp.fullName}</p>
                                <div className="flex flex-wrap items-center gap-3 mt-0.5">
                                  {emp.email && (
                                    <span className="flex items-center gap-1 text-xs text-custom-700">
                                      <HiOutlineMail className="w-3 h-3" />{emp.email}
                                    </span>
                                  )}
                                  {emp.phoneNumber && (
                                    <span className="flex items-center gap-1 text-xs text-custom-700">
                                      <HiOutlinePhone className="w-3 h-3" />{emp.phoneNumber}
                                    </span>
                                  )}
                                </div>
                              </div>

                              {/* Contract */}
                              <span className="hidden sm:inline text-xs font-semibold px-2 py-1 rounded-full bg-custom-100 text-custom-700 capitalize flex-shrink-0">
                                {emp.contractType?.replace("_", " ").toLowerCase() ?? "—"}
                              </span>

                              {/* Workload bar */}
                              <WorkloadBar jobCount={(emp.assignedJobs?.length ?? (emp.jobId ? 1 : 0))} />

                              {/* Chevron indicator if has jobs */}
                              {hasjob && (
                                <span className="text-xs font-semibold px-2 py-1 rounded-full bg-yellow-100 text-yellow-700 flex-shrink-0">
                                  ↓
                                </span>
                              )}
                            </div>
                          </button>

                          {/* ── Expanded: fetch employee detail to get full jobs list ── */}
                          {isExpanded && (
                            <div className="px-6 pb-4 pt-2 bg-custom-50 border-t border-custom-200">
                              <p className="text-xs font-semibold text-custom-700 mb-2 uppercase tracking-wide">
                                Assigned Jobs
                              </p>
                              <EmployeeJobsPanel
                                employeeId={emp.id}
                                onUnassign={handleUnassign}
                                isSaving={isAssigning || isUnassigning}
                              />
                            </div>
                          )}
                        </div>
                      );
                    })
                  )}
                </div>

                {/* Footer */}
                {filteredEmployees.length > 0 && (
                  <div className="px-4 py-3 border-t border-custom-200 bg-custom-50">
                    <p className="text-xs text-custom-700">
                      Showing {filteredEmployees.length} of {employees.length} employee{employees.length !== 1 ? "s" : ""}
                    </p>
                  </div>
                )}
              </Card>
            )}

            {/* ══ Jobs View ══ */}
            {viewMode === "jobs" && (
              <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
                {[
                  { label: "Active Jobs",  color: "bg-yellow-500", icon: HiOutlineClock,       jobs: activeJobs    },
                  { label: "Completed",    color: "bg-green-500",  icon: HiOutlineCheckCircle, jobs: completedJobs },
                ].map(({ label, color, icon: Icon, jobs: colJobs }) => (
                  <div key={label} className="flex flex-col">
                    <div className={`${color} text-white rounded-t-xl p-3 flex items-center justify-between`}>
                      <div className="flex items-center gap-2">
                        <Icon className="w-4 h-4" />
                        <span className="font-bold text-sm">{label}</span>
                      </div>
                      <span className="text-xs font-bold bg-white/20 px-2 py-0.5 rounded-full">{colJobs.length}</span>
                    </div>
                    <div className="bg-custom-100 rounded-b-xl p-3 flex-1 space-y-3 min-h-[200px]">
                      {colJobs.length === 0 ? (
                        <p className="text-xs text-custom-700 text-center pt-4">No jobs</p>
                      ) : (
                        colJobs.map((job) => {
                          const statusCfg = jobStatusConfig[job.status];
                          const isActive  = label === "Active Jobs";
                          return (
                            <Card key={job.id} className="!p-3 !bg-style-600">
                              <div className="flex items-start justify-between gap-2 mb-1">
                                <span className="text-xs font-bold text-primary-500">{job.jobNumber}</span>
                                <span className={`text-[10px] font-bold px-2 py-0.5 rounded-full ${priorityColor[job.priority] ?? "bg-gray-200 text-gray-700"}`}>
                                  {job.priority}
                                </span>
                              </div>
                              <h3 className="text-sm font-bold text-secondary-100 mb-0.5">{job.title}</h3>
                              <p className="text-xs text-custom-700 mb-2">{job.customer?.name ?? "—"}</p>
                              {statusCfg && (
                                <span className={`text-[10px] font-semibold px-2 py-0.5 rounded-full ${statusCfg.bgColor} ${statusCfg.color}`}>
                                  {statusCfg.label}
                                </span>
                              )}
                              {job.dueDate && (
                                <div className="flex items-center gap-1 text-xs text-custom-700 mt-2">
                                  <HiOutlineClock className="w-3 h-3" />
                                  <span>Due: {job.dueDate.split("T")[0]}</span>
                                </div>
                              )}
                              {isActive && (
                                <button
                                  onClick={() => openAssignModal(job)}
                                  className="mt-2 w-full flex items-center justify-center gap-1.5 px-3 py-1.5 rounded-lg bg-primary-500 text-white hover:bg-primary-600 transition-colors text-xs font-semibold"
                                >
                                  <HiOutlineUserAdd className="w-3.5 h-3.5" />
                                  Assign Employee
                                </button>
                              )}
                            </Card>
                          );
                        })
                      )}
                    </div>
                  </div>
                ))}
              </div>
            )}
          </>
        )}
      </div>

      {/* ══ Assign Employee Modal ══ */}
      {showModal && selectedJob && (
        <div className="fixed inset-0 bg-secondary-100/50 z-50 flex items-center justify-center p-4">
          <Card className="!p-6 max-w-md w-full max-h-[90vh] overflow-y-auto">

            <div className="flex items-start justify-between mb-4">
              <div>
                <h3 className="text-lg font-bold text-secondary-100">Assign Employee</h3>
                <p className="text-sm text-custom-700 mt-1">{selectedJob.jobNumber} — {selectedJob.title}</p>
              </div>
              <button onClick={closeModal} className="text-custom-700 hover:text-secondary-100">
                <HiOutlineX className="w-6 h-6" />
              </button>
            </div>

            <div className="p-3 rounded-xl bg-custom-50 border border-custom-200 mb-4 grid grid-cols-2 gap-2 text-sm">
              <div><span className="text-custom-700">Client: </span><span className="font-semibold text-secondary-100">{selectedJob.customer?.name ?? "—"}</span></div>
              <div><span className="text-custom-700">Priority: </span><span className="font-semibold text-secondary-100 capitalize">{selectedJob.priority}</span></div>
              <div><span className="text-custom-700">Due: </span><span className="font-semibold text-secondary-100">{selectedJob.dueDate ? selectedJob.dueDate.split("T")[0] : "—"}</span></div>
              <div><span className="text-custom-700">Dept: </span><span className="font-semibold text-primary-600">{myDept?.name ?? "—"}</span></div>
            </div>

            {assignError && (
              <p className="mb-3 text-sm text-red-600 bg-red-50 px-3 py-2 rounded-lg">{assignError}</p>
            )}

            <p className="text-sm font-semibold text-custom-700 mb-3">Select an employee to assign:</p>

            <div className="space-y-2">
              {employees.length === 0 ? (
                <p className="text-sm text-custom-700 text-center py-4">No employees in this department</p>
              ) : (
                employees.map((emp) => {
                  const alreadyHasThisJob =
                    (emp.assignedJobs?.some((j) => j.id === selectedJob.id) ?? false) ||
                    emp.jobId === selectedJob.id;
                  return (
                    <button
                      key={emp.id}
                      onClick={() => !alreadyHasThisJob && handleAssign(emp.id)}
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
                            <span className="text-primary-600 font-bold text-xs">{emp.fullName.charAt(0).toUpperCase()}</span>
                          </div>
                          <div>
                            <p className="font-semibold text-secondary-100 text-sm">{emp.fullName}</p>
                            <p className="text-xs text-custom-700">{emp.contractType?.replace("_", " ").toLowerCase() ?? "—"}</p>
                          </div>
                        </div>
                        {alreadyHasThisJob ? (
                          <span className="text-xs font-semibold px-2 py-0.5 rounded-full bg-green-100 text-green-700">
                            Already assigned ✓
                          </span>
                        ) : (emp.assignedJobs?.length ?? 0) > 0 || emp.jobId ? (
                          <span className="text-xs font-semibold px-2 py-0.5 rounded-full bg-yellow-100 text-yellow-700">Has other job</span>
                        ) : (
                          <span className="text-xs font-semibold px-2 py-0.5 rounded-full bg-green-100 text-green-700">Available</span>
                        )}
                      </div>
                    </button>
                  );
                })
              )}
            </div>

            <button
              onClick={closeModal}
              className="mt-4 w-full px-4 py-2 rounded-xl border border-custom-300 hover:bg-custom-100 text-sm font-semibold text-custom-700"
            >
              Cancel
            </button>
          </Card>
        </div>
      )}
    </DashboardLayout>
  );
}
