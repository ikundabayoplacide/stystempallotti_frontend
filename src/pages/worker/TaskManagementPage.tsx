import { useState } from "react";
import {
  HiOutlineCheckCircle,
  HiOutlineClipboardList,
  HiOutlineClock,
  HiOutlinePause,
  HiOutlinePlay,
  HiOutlineRefresh,
  HiOutlineExclamationCircle,
} from "react-icons/hi";
import { DashboardLayout } from "../../components";
import { Card } from "../../components/ui";
import { useAuth } from "../../context/AuthContext";
import {
  useGetMyEmployeeProfileQuery,
  useGetEmployeeJobsQuery,
  type EmployeeJob,
} from "../../store/services/employeesService";
import { useStartJobMutation, usePauseJobMutation, useResumeJobMutation, useMarkJobDoneMutation } from "../../store/services/jobsService";

// ─── Types ────────────────────────────────────────────────────────────────────

type TaskStatus = "pending" | "in-progress" | "paused" | "completed";

// ─── Helpers ──────────────────────────────────────────────────────────────────

function mapToTaskStatus(job: EmployeeJob): TaskStatus {
  if (job.inProduction === "paused") return "paused";
  if (job.inProduction === "inprogress") return "in-progress";
  if (job.inProduction === "done" || job.status === "completed" || job.status === "delivered") return "completed";
  return "pending";
}

const priorityColor: Record<string, string> = {
  urgent: "bg-red-500 text-white",
  high:   "bg-orange-100 text-orange-700",
  normal: "bg-blue-100 text-blue-700",
  low:    "bg-green-100 text-green-700",
};

const statusConfig: Record<TaskStatus, { label: string; color: string; icon: any }> = {
  pending:      { label: "To Do",      color: "bg-blue-500",   icon: HiOutlineClipboardList },
  "in-progress":{ label: "In Progress",color: "bg-yellow-500", icon: HiOutlineClock },
  paused:       { label: "Paused",     color: "bg-orange-500", icon: HiOutlinePause },
  completed:    { label: "Completed",  color: "bg-green-500",  icon: HiOutlineCheckCircle },
};

const columns: TaskStatus[] = ["pending", "in-progress", "paused", "completed"];

// ─── Page ─────────────────────────────────────────────────────────────────────

export default function TaskManagementPage() {
  const { userName } = useAuth();

  const { data: me, isLoading: loadingMe, isError: errorMe } = useGetMyEmployeeProfileQuery();
  const employeeId = me?.id;

  const { data: jobs = [], isLoading: loadingJobs, refetch } = useGetEmployeeJobsQuery(
    { employeeId: employeeId! },
    { skip: !employeeId, refetchOnMountOrArgChange: true }
  );

  const [startJob]    = useStartJobMutation();
  const [pauseJob]    = usePauseJobMutation();
  const [resumeJob]   = useResumeJobMutation();
  const [markJobDone] = useMarkJobDoneMutation();

  const [selectedJob, setSelectedJob] = useState<EmployeeJob | null>(null);
  const [showDetailsModal, setShowDetailsModal] = useState(false);

  const isLoading = loadingMe || loadingJobs;

  const getJobsByStatus = (status: TaskStatus) =>
    jobs.filter((j) => mapToTaskStatus(j) === status);

  // ── Handlers ────────────────────────────────────────────────────────────────

  const handleStart = async (job: EmployeeJob) => {
    await startJob(job.id);
    refetch();
  };

  const handlePause = async (job: EmployeeJob) => {
    await pauseJob(job.id);
    refetch();
  };

  const handleResume = async (job: EmployeeJob) => {
    await resumeJob(job.id);
    refetch();
  };

  const handleComplete = async (job: EmployeeJob) => {
    await markJobDone(job.id);
    refetch();
  };

  // ── No profile ──────────────────────────────────────────────────────────────

  if (!loadingMe && (errorMe || !me)) {
    return (
      <DashboardLayout userRole="worker" userName={userName ?? "Worker"} notificationCount={0}>
        <Card className="!p-8 text-center">
          <HiOutlineExclamationCircle className="w-12 h-12 text-red-400 mx-auto mb-3" />
          <p className="text-secondary-100 font-bold text-sm">Employee profile not linked</p>
          <p className="text-custom-700 text-xs mt-1">Ask an administrator to link your account to an employee record.</p>
        </Card>
      </DashboardLayout>
    );
  }

  return (
    <DashboardLayout userRole="worker" userName={userName ?? "Worker"} notificationCount={0}>
      <div className="space-y-6 font-[family-name:var(--font-family-primary)]">

        {/* Header */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
          <div>
            <h1 className="text-2xl md:text-3xl font-bold text-secondary-100">My Task Board</h1>
            <p className="text-sm text-custom-700 mt-1">Manage your assigned jobs and track progress</p>
          </div>
          <button
            onClick={refetch}
            disabled={isLoading}
            className="self-start p-2 rounded-xl border border-custom-300 hover:bg-custom-100 transition-colors disabled:opacity-50"
          >
            <HiOutlineRefresh className={`w-5 h-5 text-custom-700 ${isLoading ? "animate-spin" : ""}`} />
          </button>
        </div>

        {/* Summary Stats */}
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
          {columns.map((status) => {
            const config = statusConfig[status];
            const count = getJobsByStatus(status).length;
            const Icon = config.icon;
            return (
              <Card key={status} className="!p-4">
                <div className="flex items-center gap-3">
                  <div className={`w-10 h-10 rounded-xl ${config.color} flex items-center justify-center`}>
                    <Icon className="w-5 h-5 text-white" />
                  </div>
                  <div>
                    <p className="text-xs text-custom-700">{config.label}</p>
                    <p className="text-2xl font-bold text-secondary-100">{isLoading ? "—" : count}</p>
                  </div>
                </div>
              </Card>
            );
          })}
        </div>

        {/* Kanban Board */}
        {isLoading ? (
          <div className="flex items-center justify-center gap-2 py-16 text-custom-700">
            <HiOutlineRefresh className="w-5 h-5 animate-spin" />
            <span className="text-sm">Loading tasks…</span>
          </div>
        ) : (
          <div className="grid grid-cols-1 lg:grid-cols-4 gap-4">
            {columns.map((status) => {
              const config = statusConfig[status];
              const columnJobs = getJobsByStatus(status);
              const Icon = config.icon;

              return (
                <div key={status} className="flex flex-col">
                  <div className={`${config.color} text-white rounded-t-xl p-3 flex items-center justify-between`}>
                    <div className="flex items-center gap-2">
                      <Icon className="w-4 h-4" />
                      <span className="font-bold text-sm">{config.label}</span>
                    </div>
                    <span className="text-xs font-bold bg-white/20 px-2 py-0.5 rounded-full">{columnJobs.length}</span>
                  </div>

                  <div className="bg-custom-100 rounded-b-xl p-3 flex-1 space-y-3 min-h-[500px]">
                    {columnJobs.map((job) => {
                      const taskStatus = mapToTaskStatus(job);

                      return (
                        <Card
                          key={job.id}
                          hoverable
                          className="!p-3 !bg-style-600 cursor-pointer"
                          onClick={() => { setSelectedJob(job); setShowDetailsModal(true); }}
                        >
                          {/* Header */}
                          <div className="flex items-start justify-between gap-2 mb-2">
                            <span className="text-xs font-bold text-primary-500">{job.jobNumber}</span>
                            <span className={`text-[10px] font-bold px-2 py-0.5 rounded-full ${priorityColor[job.priority] ?? "bg-gray-100 text-gray-700"}`}>
                              {job.priority}
                            </span>
                          </div>

                          <h3 className="text-sm font-bold text-secondary-100 mb-1">{job.title}</h3>
                          <p className="text-xs text-custom-700 mb-2">{job.customer?.name ?? "—"}</p>

                          <div className="space-y-1 mb-3">
                            {job.dueDate && (
                              <div className="flex items-center gap-2 text-xs text-custom-700">
                                <HiOutlineClock className="w-3 h-3" />
                                <span>Due: {job.dueDate.split("T")[0]}</span>
                              </div>
                            )}
                            {job.estimatedTime && (
                              <div className="text-xs text-custom-700">Est: {job.estimatedTime}</div>
                            )}
                          </div>



                          {/* Action Buttons */}
                          <div className="flex gap-2">
                            {taskStatus === "pending" && (
                              <button
                                onClick={(e) => { e.stopPropagation(); handleStart(job); }}
                                className="flex-1 flex items-center justify-center gap-1 px-3 py-1.5 rounded-lg bg-primary-500 text-white hover:bg-primary-600 transition-colors text-xs font-semibold"
                              >
                                <HiOutlinePlay className="w-3 h-3" /> Start
                              </button>
                            )}
                            {taskStatus === "in-progress" && (
                              <>
                                <button
                                  onClick={(e) => { e.stopPropagation(); handlePause(job); }}
                                  className="flex-1 flex items-center justify-center gap-1 px-3 py-1.5 rounded-lg border border-custom-300 text-custom-700 hover:bg-custom-100 transition-colors text-xs font-semibold"
                                >
                                  <HiOutlinePause className="w-3 h-3" /> Pause
                                </button>
                                <button
                                  onClick={(e) => { e.stopPropagation(); handleComplete(job); }}
                                  className="flex-1 flex items-center justify-center gap-1 px-3 py-1.5 rounded-lg bg-green-500 text-white hover:bg-green-600 transition-colors text-xs font-semibold"
                                >
                                  <HiOutlineCheckCircle className="w-3 h-3" /> Complete
                                </button>
                              </>
                            )}
                            {taskStatus === "paused" && (
                              <button
                                onClick={(e) => { e.stopPropagation(); handleResume(job); }}
                                className="flex-1 flex items-center justify-center gap-1 px-3 py-1.5 rounded-lg bg-primary-500 text-white hover:bg-primary-600 transition-colors text-xs font-semibold"
                              >
                                <HiOutlinePlay className="w-3 h-3" /> Resume
                              </button>
                            )}
                          </div>

                          {/* Timestamps */}
                          {job.startedAt && taskStatus !== "pending" && (
                            <div className="mt-2 text-xs text-custom-700">
                              Started: {new Date(job.startedAt).toLocaleTimeString()}
                            </div>
                          )}
                          {job.completedAt && (
                            <div className="mt-1 text-xs text-green-600">
                              Completed: {new Date(job.completedAt).toLocaleTimeString()}
                            </div>
                          )}
                        </Card>
                      );
                    })}
                  </div>
                </div>
              );
            })}
          </div>
        )}

        {showDetailsModal && selectedJob && (
          <DetailsModal job={selectedJob} onClose={() => setShowDetailsModal(false)} />
        )}
      </div>
    </DashboardLayout>
  );
}

// ─── Details Modal ────────────────────────────────────────────────────────────

function DetailsModal({ job, onClose }: { job: EmployeeJob; onClose: () => void }) {

  return (
    <div className="fixed inset-0 bg-secondary-100/50 z-50 flex items-center justify-center p-4">
      <Card className="!p-6 max-w-2xl w-full max-h-[90vh] overflow-y-auto">
        <div className="flex items-start justify-between mb-4">
          <div>
            <div className="flex items-center gap-2 mb-2">
              <span className="text-sm font-bold text-primary-500">{job.jobNumber}</span>
              <span className={`text-xs font-bold px-2 py-0.5 rounded-full ${priorityColor[job.priority] ?? "bg-gray-100 text-gray-700"}`}>
                {job.priority}
              </span>
            </div>
            <h3 className="text-xl font-bold text-secondary-100">{job.title}</h3>
          </div>
          <button onClick={onClose} className="text-custom-700 hover:text-secondary-100 text-2xl">×</button>
        </div>

        <div className="space-y-4">
          {job.customer?.name && (
            <div>
              <p className="text-sm font-semibold text-custom-700 mb-1">Client</p>
              <p className="text-base text-secondary-100">{job.customer.name}</p>
            </div>
          )}
          {job.jobType && (
            <div>
              <p className="text-sm font-semibold text-custom-700 mb-1">Service</p>
              <p className="text-base text-secondary-100">{job.jobType}</p>
            </div>
          )}
          {job.description && (
            <div>
              <p className="text-sm font-semibold text-custom-700 mb-1">Description</p>
              <p className="text-base text-secondary-100">{job.description}</p>
            </div>
          )}
          <div className="grid grid-cols-2 gap-4">
            {job.dueDate && (
              <div>
                <p className="text-sm font-semibold text-custom-700 mb-1">Deadline</p>
                <p className="text-base text-secondary-100">{job.dueDate.split("T")[0]}</p>
              </div>
            )}
            {job.estimatedTime && (
              <div>
                <p className="text-sm font-semibold text-custom-700 mb-1">Estimated Time</p>
                <p className="text-base text-secondary-100">{job.estimatedTime}</p>
              </div>
            )}
          </div>



          {job.startedAt && (
            <div>
              <p className="text-sm font-semibold text-custom-700 mb-1">Started At</p>
              <p className="text-base text-secondary-100">{new Date(job.startedAt).toLocaleString()}</p>
            </div>
          )}
          {job.completedAt && (
            <div>
              <p className="text-sm font-semibold text-custom-700 mb-1">Completed At</p>
              <p className="text-base text-green-600">{new Date(job.completedAt).toLocaleString()}</p>
            </div>
          )}


        </div>

        <div className="flex gap-3 mt-6">
          <button onClick={onClose} className="flex-1 px-4 py-2 rounded-xl border border-custom-300 hover:bg-custom-100 transition-colors text-sm font-semibold text-custom-700">Close</button>
        </div>
      </Card>
    </div>
  );
}


