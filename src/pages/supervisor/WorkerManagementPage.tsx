import { useState } from "react";
import { useSelector } from "react-redux";
import {
  HiOutlineCheckCircle,
  HiOutlineClipboardList,
  HiOutlineClock,
  HiOutlineRefresh,
  HiOutlineUserAdd,
  HiOutlineUsers,
  HiOutlineX,
  HiOutlineXCircle,
} from "react-icons/hi";
import { DashboardLayout } from "../../components";
import { Card } from "../../components/ui";
import { useGetUsersQuery } from "../../store/services/usersService";
import {
  useAssignJobToEmployeeMutation,
  useUnassignEmployeeMutation,
} from "../../store/services/jobAssignmentsService";
import { useGetJobsQuery, type Job } from "../../store/services/jobsService";
import { useGetDepartmentsQuery } from "../../store/services/departmentsService";
import { jobStatusConfig } from "../../types/JobStatus";
import type { RootState } from "../../store";

const priorityColor: Record<string, string> = {
  high:   "bg-red-500 text-white",
  urgent: "bg-red-700 text-white",
  normal: "bg-yellow-500 text-white",
  low:    "bg-green-500 text-white",
};

type ViewMode = "workers" | "jobs";

export default function WorkerManagementPage() {
  const [viewMode, setViewMode]       = useState<ViewMode>("workers");
  const [selectedJob, setSelectedJob] = useState<Job | null>(null);
  const [showModal, setShowModal]     = useState(false);
  const [error, setError]             = useState("");

  const currentUser = useSelector((state: RootState) => state.auth.user);
  const myDeptId    = currentUser?.departmentId;

  // GET /users?departmentId=<id> — real employee data with currentJob
  const {
    data: usersRaw,
    isLoading: loadingEmployees,
    refetch: refetchEmployees,
  } = useGetUsersQuery(
    { departmentId: myDeptId ?? undefined },
    { skip: !myDeptId, refetchOnMountOrArgChange: true }
  );

  // Guard: ensure we always have an array
  const employees = Array.isArray(usersRaw) ? usersRaw : [];

  const { data: activeJobsData, isLoading: loadingJobs, refetch: refetchJobs } = useGetJobsQuery(
    { limit: 200, departmentAssignedToId: myDeptId ?? undefined },
    { skip: !myDeptId }
  );
  const { data: completedData } = useGetJobsQuery(
    { status: "completed", limit: 200, departmentAssignedToId: myDeptId ?? undefined },
    { skip: !myDeptId }
  );
  const { data: departments = [] } = useGetDepartmentsQuery();

  const [assignJob,   { isLoading: isAssigning }]   = useAssignJobToEmployeeMutation();
  const [unassignEmp, { isLoading: isUnassigning }] = useUnassignEmployeeMutation();

  const activeJobs    = activeJobsData?.jobs ?? [];
  const completedJobs = completedData?.jobs ?? [];
  const myDept        = departments.find((d) => d.id === myDeptId);

  const isLoading = loadingEmployees || loadingJobs;
  const isSaving  = isAssigning || isUnassigning;

  // Employees with no current job
  const freeCount = employees.filter((e) => !e.currentJobId).length;

  const openAssignModal = (job: Job) => {
    setSelectedJob(job);
    setError("");
    setShowModal(true);
  };
  const closeModal = () => { setShowModal(false); setSelectedJob(null); setError(""); };

  const handleAssign = async (employeeId: string) => {
    if (!selectedJob) return;
    try {
      await assignJob({ jobId: selectedJob.id, employeeId }).unwrap();
      await refetchEmployees();
      closeModal();
    } catch (err: any) {
      setError(err?.data?.message ?? "Failed to assign job");
    }
  };

  const handleUnassign = async (employeeId: string) => {
    try {
      await unassignEmp(employeeId).unwrap();
      await refetchEmployees();
    } catch (err: any) {
      alert(err?.data?.message ?? "Failed to unassign employee");
    }
  };

  const refetchAll = () => { refetchEmployees(); refetchJobs(); };

  if (!myDeptId) {
    return (
      <DashboardLayout userRole="supervisor" userName={currentUser?.name ?? "Supervisor"} notificationCount={0}>
        <Card className="!p-8 text-center">
          <p className="text-custom-700 text-sm">Your account is not assigned to a department yet.</p>
          <p className="text-custom-700 text-xs mt-1">Contact an administrator to assign you to a department.</p>
        </Card>
      </DashboardLayout>
    );
  }

  return (
    <DashboardLayout
      userRole="supervisor"
      userName={currentUser?.name ?? "Supervisor"}
      notificationCount={freeCount}
    >
      <div className="space-y-6 font-[family-name:var(--font-family-primary)]">

        {/* Header */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
          <div>
            <h1 className="text-2xl md:text-3xl font-bold text-secondary-100">Worker Management</h1>
            <p className="text-sm text-custom-700 mt-1">
              Department: <span className="font-semibold text-primary-600">{myDept?.name ?? myDeptId}</span>
              {" · "}{freeCount} employee{freeCount !== 1 ? "s" : ""} available
            </p>
          </div>
          <div className="flex items-center gap-2">
            <button
              onClick={refetchAll}
              className="p-2 rounded-xl border border-custom-300 hover:bg-custom-100 transition-colors"
              title="Refresh"
            >
              <HiOutlineRefresh className="w-5 h-5 text-custom-700" />
            </button>
            <button
              onClick={() => setViewMode("workers")}
              className={`px-4 py-2 rounded-xl transition-colors text-sm font-semibold ${
                viewMode === "workers" ? "bg-primary-500 text-white" : "border border-custom-300 text-custom-700 hover:bg-custom-100"
              }`}
            >
              <HiOutlineUsers className="w-4 h-4 inline mr-2" />
              Workers
            </button>
            <button
              onClick={() => setViewMode("jobs")}
              className={`px-4 py-2 rounded-xl transition-colors text-sm font-semibold ${
                viewMode === "jobs" ? "bg-primary-500 text-white" : "border border-custom-300 text-custom-700 hover:bg-custom-100"
              }`}
            >
              <HiOutlineClipboardList className="w-4 h-4 inline mr-2" />
              Jobs
            </button>
          </div>
        </div>

        {isLoading ? (
          <Card className="!p-8 text-center text-custom-700">Loading…</Card>
        ) : (
          <>
            {/* ── Workers View ── */}
            {viewMode === "workers" && (
              <Card className="!p-0 overflow-hidden">
                <div className="overflow-x-auto">
                  <table className="w-full">
                    <thead className="bg-custom-100 border-b border-custom-300">
                      <tr>
                        <th className="px-4 py-3 text-left text-xs font-bold text-secondary-100 uppercase">Employee</th>
                        <th className="px-4 py-3 text-left text-xs font-bold text-secondary-100 uppercase">Role</th>
                        <th className="px-4 py-3 text-left text-xs font-bold text-secondary-100 uppercase">Current Job</th>
                        <th className="px-4 py-3 text-left text-xs font-bold text-secondary-100 uppercase">Status</th>
                        <th className="px-4 py-3 text-right text-xs font-bold text-secondary-100 uppercase">Action</th>
                      </tr>
                    </thead>
                    <tbody className="bg-white divide-y divide-custom-200">
                      {employees.length === 0 ? (
                        <tr>
                          <td colSpan={5} className="px-4 py-8 text-center text-custom-700 text-sm">
                            No active employees in this department
                          </td>
                        </tr>
                      ) : (
                        employees.map((emp) => (
                          <tr key={emp.id} className="hover:bg-custom-50 transition-colors">
                            <td className="px-4 py-4">
                              <div className="flex items-center gap-3">
                                <div className="w-9 h-9 rounded-full bg-primary-100 flex items-center justify-center flex-shrink-0">
                                  <span className="text-primary-600 font-bold text-sm">{emp.name.charAt(0)}</span>
                                </div>
                                <p className="text-sm font-semibold text-secondary-100">{emp.name}</p>
                              </div>
                            </td>
                            <td className="px-4 py-4">
                              <span className="text-xs font-semibold px-2 py-1 rounded-full bg-custom-100 text-custom-700">
                                {emp.role}
                              </span>
                            </td>
                            <td className="px-4 py-4">
                              {emp.currentJob ? (
                                <div>
                                  <span className="text-sm font-bold text-primary-600">{emp.currentJob.jobNumber}</span>
                                  <p className="text-xs text-custom-700 max-w-[160px] truncate">{emp.currentJob.title}</p>
                                  {emp.currentJob.state && (
                                    <span className="text-xs text-custom-500">{emp.currentJob.state}</span>
                                  )}
                                </div>
                              ) : (
                                <span className="text-xs text-custom-500 italic">No job assigned</span>
                              )}
                            </td>
                            <td className="px-4 py-4">
                              {emp.currentJobId ? (
                                <span className="text-xs font-semibold px-2 py-1 rounded-full bg-yellow-100 text-yellow-700">
                                  Busy
                                </span>
                              ) : (
                                <span className="text-xs font-semibold px-2 py-1 rounded-full bg-green-100 text-green-700">
                                  Available
                                </span>
                              )}
                            </td>
                            <td className="px-4 py-4 text-right">
                              {emp.currentJobId ? (
                                <button
                                  onClick={() => handleUnassign(emp.id)}
                                  disabled={isSaving}
                                  title="Unassign"
                                  className="p-1.5 rounded-lg text-red-500 hover:bg-red-50 transition-colors disabled:opacity-50"
                                >
                                  <HiOutlineXCircle className="w-5 h-5" />
                                </button>
                              ) : (
                                <span className="text-xs text-custom-500">—</span>
                              )}
                            </td>
                          </tr>
                        ))
                      )}
                    </tbody>
                  </table>
                </div>
              </Card>
            )}

            {/* ── Jobs View ── */}
            {viewMode === "jobs" && (
              <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
                {[
                  { label: "Active Jobs",  color: "bg-yellow-500", icon: HiOutlineClock,        jobs: activeJobs    },
                  { label: "Completed",    color: "bg-green-500",  icon: HiOutlineCheckCircle,  jobs: completedJobs },
                ].map(({ label, color, icon: Icon, jobs: colJobs }) => (
                  <div key={label} className="flex flex-col">
                    <div className={`${color} text-white rounded-t-xl p-3 flex items-center justify-between`}>
                      <div className="flex items-center gap-2">
                        <Icon className="w-4 h-4" />
                        <span className="font-bold text-sm">{label}</span>
                      </div>
                      <span className="text-xs font-bold bg-white/20 px-2 py-0.5 rounded-full">
                        {colJobs.length}
                      </span>
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

        {/* ── Assign Employee Modal ── */}
        {showModal && selectedJob && (
          <div className="fixed inset-0 bg-secondary-100/50 z-50 flex items-center justify-center p-4">
            <Card className="!p-6 max-w-md w-full max-h-[90vh] overflow-y-auto">

              <div className="flex items-start justify-between mb-4">
                <div>
                  <h3 className="text-lg font-bold text-secondary-100">Assign Employee</h3>
                  <p className="text-sm text-custom-700 mt-1">
                    {selectedJob.jobNumber} — {selectedJob.title}
                  </p>
                </div>
                <button onClick={closeModal} className="text-custom-700 hover:text-secondary-100">
                  <HiOutlineX className="w-6 h-6" />
                </button>
              </div>

              {/* Job summary */}
              <div className="p-3 rounded-xl bg-custom-50 border border-custom-200 mb-4 grid grid-cols-2 gap-2 text-sm">
                <div>
                  <span className="text-custom-700">Client: </span>
                  <span className="font-semibold text-secondary-100">{selectedJob.customer?.name ?? "—"}</span>
                </div>
                <div>
                  <span className="text-custom-700">Priority: </span>
                  <span className="font-semibold text-secondary-100 capitalize">{selectedJob.priority}</span>
                </div>
                <div>
                  <span className="text-custom-700">Due: </span>
                  <span className="font-semibold text-secondary-100">
                    {selectedJob.dueDate ? selectedJob.dueDate.split("T")[0] : "—"}
                  </span>
                </div>
                <div>
                  <span className="text-custom-700">Dept: </span>
                  <span className="font-semibold text-primary-600">{myDept?.name ?? "—"}</span>
                </div>
              </div>

              {error && (
                <p className="mb-3 text-sm text-red-600 bg-red-50 px-3 py-2 rounded-lg">{error}</p>
              )}

              <p className="text-sm font-semibold text-custom-700 mb-3">
                Select an employee to assign:
              </p>

              <div className="space-y-2">
                {employees.length === 0 ? (
                  <p className="text-sm text-custom-700 text-center py-4">No employees in this department</p>
                ) : (
                  employees.map((emp) => (
                    <button
                      key={emp.id}
                      onClick={() => handleAssign(emp.id)}
                      disabled={isSaving}
                      className="w-full p-3 rounded-xl border-2 border-custom-300 hover:border-primary-400 hover:bg-primary-50 transition-colors text-left disabled:opacity-60"
                    >
                      <div className="flex items-center justify-between">
                        <div className="flex items-center gap-3">
                          <div className="w-9 h-9 rounded-full bg-primary-100 flex items-center justify-center flex-shrink-0">
                            <span className="text-primary-600 font-bold text-xs">{emp.name.charAt(0)}</span>
                          </div>
                          <div>
                            <p className="font-semibold text-secondary-100 text-sm">{emp.name}</p>
                            <p className="text-xs text-custom-700">{emp.role}</p>
                          </div>
                        </div>
                        {emp.currentJobId ? (
                          <div className="text-right">
                            <span className="text-xs font-semibold px-2 py-0.5 rounded-full bg-yellow-100 text-yellow-700">
                              Busy
                            </span>
                            {emp.currentJob && (
                              <p className="text-xs text-custom-500 mt-0.5">{emp.currentJob.jobNumber}</p>
                            )}
                          </div>
                        ) : (
                          <span className="text-xs font-semibold px-2 py-0.5 rounded-full bg-green-100 text-green-700">
                            Available
                          </span>
                        )}
                      </div>
                    </button>
                  ))
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

      </div>
    </DashboardLayout>
  );
}
