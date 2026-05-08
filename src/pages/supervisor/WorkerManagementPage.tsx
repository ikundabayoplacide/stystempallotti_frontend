import { useState } from "react";
import {
    HiOutlineCheckCircle,
    HiOutlineClipboardList,
    HiOutlineClock,
    HiOutlineUser,
    HiOutlineUsers
} from "react-icons/hi";
import { DashboardLayout } from "../../components";
import { Card } from "../../components/ui";

type JobStatus = "unassigned" | "assigned" | "in-progress" | "paused" | "completed";

interface Worker {
  id: string;
  name: string;
  department: string;
  activeJobs: number;
  completedToday: number;
  avatar?: string;
}

interface Job {
  id: string;
  title: string;
  client: string;
  service: string;
  deadline: string;
  priority: "High" | "Medium" | "Low";
  assignedTo?: string;
  assignedWorkerName?: string;
  department: string;
  status: JobStatus;
  progress: number;
}

const initialWorkers: Worker[] = [
  {
    id: "W-001",
    name: "John Worker",
    department: "Offset Printing",
    activeJobs: 2,
    completedToday: 3,
  },
  {
    id: "W-002",
    name: "Jane Smith",
    department: "Offset Printing",
    activeJobs: 1,
    completedToday: 5,
  },
  {
    id: "W-003",
    name: "Mike Johnson",
    department: "Offset Printing",
    activeJobs: 3,
    completedToday: 2,
  },
  {
    id: "W-004",
    name: "Sarah Williams",
    department: "Offset Printing",
    activeJobs: 1,
    completedToday: 4,
  },
];

const initialJobs: Job[] = [
  {
    id: "JOB-001",
    title: "Print 500 brochures",
    client: "ABC Corp",
    service: "Offset Printing",
    deadline: "2026-05-02 14:00",
    priority: "High",
    department: "Offset Printing",
    status: "unassigned",
    progress: 0,
  },
  {
    id: "JOB-002",
    title: "Bind 200 booklets",
    client: "XYZ Ltd",
    service: "Binding",
    deadline: "2026-05-01 16:00",
    priority: "Medium",
    department: "Offset Printing",
    status: "unassigned",
    progress: 0,
  },
  {
    id: "JOB-008",
    title: "Print 1000 posters",
    client: "Event Co",
    service: "Offset Printing",
    deadline: "2026-05-03 10:00",
    priority: "High",
    assignedTo: "W-001",
    assignedWorkerName: "John Worker",
    department: "Offset Printing",
    status: "in-progress",
    progress: 45,
  },
  {
    id: "JOB-009",
    title: "Print 300 flyers",
    client: "Bank D",
    service: "Offset Printing",
    deadline: "2026-05-04 12:00",
    priority: "Medium",
    assignedTo: "W-002",
    assignedWorkerName: "Jane Smith",
    department: "Offset Printing",
    status: "in-progress",
    progress: 80,
  },
  {
    id: "JOB-010",
    title: "Print business cards",
    client: "Tech Startup",
    service: "Offset Printing",
    deadline: "2026-04-30 17:00",
    priority: "High",
    assignedTo: "W-001",
    assignedWorkerName: "John Worker",
    department: "Offset Printing",
    status: "completed",
    progress: 100,
  },
];

const priorityColor: Record<string, string> = {
  High: "bg-red-500 text-white",
  Medium: "bg-yellow-500 text-white",
  Low: "bg-green-500 text-white",
};

const statusConfig: Record<JobStatus, { label: string; color: string; icon: any }> = {
  unassigned: { label: "Unassigned", color: "bg-blue-500", icon: HiOutlineClipboardList },
  assigned: { label: "Assigned", color: "bg-purple-500", icon: HiOutlineUser },
  "in-progress": { label: "In Progress", color: "bg-yellow-500", icon: HiOutlineClock },
  paused: { label: "Paused", color: "bg-orange-500", icon: HiOutlineClock },
  completed: { label: "Completed", color: "bg-green-500", icon: HiOutlineCheckCircle },
};

export default function WorkerManagementPage() {
  const [workers] = useState<Worker[]>(initialWorkers);
  const [jobs, setJobs] = useState<Job[]>(initialJobs);
  const [selectedJob, setSelectedJob] = useState<Job | null>(null);
  const [showAssignModal, setShowAssignModal] = useState(false);
  const [viewMode, setViewMode] = useState<"workers" | "jobs">("workers");

  const handleAssignToWorker = (jobId: string, workerId: string) => {
    const worker = workers.find((w) => w.id === workerId);
    setJobs(
      jobs.map((job) =>
        job.id === jobId
          ? {
              ...job,
              assignedTo: workerId,
              assignedWorkerName: worker?.name,
              status: "assigned" as JobStatus,
            }
          : job
      )
    );
    setShowAssignModal(false);
    setSelectedJob(null);
  };

  const getJobsByWorker = (workerId: string) => {
    return jobs.filter((job) => job.assignedTo === workerId && job.status !== "completed");
  };

  const getUnassignedJobs = () => {
    return jobs.filter((job) => job.status === "unassigned");
  };

  return (
    <DashboardLayout
      userRole="supervisor"
      userName="Supervisor"
      notificationCount={4}
    >
      <div className="space-y-6 font-[family-name:var(--font-family-primary)]">
        {/* Header */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
          <div>
            <h1 className="text-2xl md:text-3xl font-bold text-secondary-100">
              Worker Management
            </h1>
            <p className="text-sm text-custom-700 mt-1">
              Assign jobs to workers and track their progress
            </p>
          </div>
          <div className="flex gap-2">
            <button
              onClick={() => setViewMode("workers")}
              className={`px-4 py-2 rounded-xl transition-colors text-sm font-semibold ${
                viewMode === "workers"
                  ? "bg-primary-500 text-white"
                  : "border border-custom-300 text-custom-700 hover:bg-custom-100"
              }`}
            >
              <HiOutlineUsers className="w-4 h-4 inline mr-2" />
              Workers View
            </button>
            <button
              onClick={() => setViewMode("jobs")}
              className={`px-4 py-2 rounded-xl transition-colors text-sm font-semibold ${
                viewMode === "jobs"
                  ? "bg-primary-500 text-white"
                  : "border border-custom-300 text-custom-700 hover:bg-custom-100"
              }`}
            >
              <HiOutlineClipboardList className="w-4 h-4 inline mr-2" />
              Jobs View
            </button>
          </div>
        </div>

        {/* Workers View */}
        {viewMode === "workers" && (
          <>
            {/* Workers Table */}
            <Card className="!p-0 overflow-hidden">
              <div className="overflow-x-auto">
                <table className="w-full">
                  <thead className="bg-custom-100 border-b border-custom-300">
                    <tr>
                      <th className="px-4 py-3 text-left text-xs font-bold text-secondary-100 uppercase">
                        Worker ID
                      </th>
                      <th className="px-4 py-3 text-left text-xs font-bold text-secondary-100 uppercase">
                        Name & Department
                      </th>
                      <th className="px-4 py-3 text-left text-xs font-bold text-secondary-100 uppercase">
                        Active Jobs
                      </th>
                      <th className="px-4 py-3 text-left text-xs font-bold text-secondary-100 uppercase">
                        Completed Today
                      </th>
                      <th className="px-4 py-3 text-left text-xs font-bold text-secondary-100 uppercase">
                        Workload
                      </th>
                      <th className="px-4 py-3 text-left text-xs font-bold text-secondary-100 uppercase">
                        Current Jobs
                      </th>
                    </tr>
                  </thead>
                  <tbody className="bg-white divide-y divide-custom-200">
                    {workers.map((worker) => {
                      const workerJobs = getJobsByWorker(worker.id);
                      const workload = worker.activeJobs;

                      return (
                        <tr key={worker.id} className="hover:bg-custom-50 transition-colors">
                          <td className="px-4 py-4">
                            <span className="text-sm font-bold text-primary-600">
                              {worker.id}
                            </span>
                          </td>
                          <td className="px-4 py-4">
                            <div className="flex items-center gap-3">
                              <div className="w-10 h-10 rounded-full bg-primary-100 flex items-center justify-center flex-shrink-0">
                                <span className="text-primary-600 font-bold">
                                  {worker.name.charAt(0)}
                                </span>
                              </div>
                              <div>
                                <p className="text-sm font-semibold text-secondary-100">
                                  {worker.name}
                                </p>
                                <p className="text-xs text-custom-700">{worker.department}</p>
                              </div>
                            </div>
                          </td>
                          <td className="px-4 py-4">
                            <span
                              className={`text-sm font-bold ${
                                workload >= 3
                                  ? "text-red-600"
                                  : workload >= 2
                                  ? "text-yellow-600"
                                  : "text-green-600"
                              }`}
                            >
                              {workload}
                            </span>
                          </td>
                          <td className="px-4 py-4">
                            <span className="text-sm font-bold text-green-600">
                              {worker.completedToday}
                            </span>
                          </td>
                          <td className="px-4 py-4">
                            <div className="space-y-1">
                              <div className="w-32 bg-custom-200 rounded-full h-2">
                                <div
                                  className={`h-2 rounded-full ${
                                    workload >= 3
                                      ? "bg-red-500"
                                      : workload >= 2
                                      ? "bg-yellow-500"
                                      : "bg-green-500"
                                  }`}
                                  style={{ width: `${Math.min((workload / 4) * 100, 100)}%` }}
                                />
                              </div>
                              <p className="text-xs text-custom-700">
                                {workload >= 3 ? "High" : workload >= 2 ? "Moderate" : "Available"}
                              </p>
                            </div>
                          </td>
                          <td className="px-4 py-4">
                            {workerJobs.length > 0 ? (
                              <div className="space-y-1">
                                {workerJobs.slice(0, 2).map((job) => (
                                  <div
                                    key={job.id}
                                    className="text-xs text-secondary-100"
                                  >
                                    <span className="font-bold text-primary-500">{job.id}</span> - {job.progress}%
                                  </div>
                                ))}
                                {workerJobs.length > 2 && (
                                  <p className="text-xs text-custom-700">
                                    +{workerJobs.length - 2} more
                                  </p>
                                )}
                              </div>
                            ) : (
                              <span className="text-xs text-custom-700">No active jobs</span>
                            )}
                          </td>
                        </tr>
                      );
                    })}
                  </tbody>
                </table>
              </div>
            </Card>

            {/* Unassigned Jobs Table */}
            <Card className="!p-0 overflow-hidden">
              <div className="p-4 bg-custom-100 border-b border-custom-300">
                <div className="flex items-center gap-2">
                  <HiOutlineClipboardList className="w-5 h-5 text-primary-500" />
                  <h2 className="font-bold text-secondary-100">
                    Unassigned Jobs ({getUnassignedJobs().length})
                  </h2>
                </div>
              </div>
              <div className="overflow-x-auto">
                <table className="w-full">
                  <thead className="bg-custom-50 border-b border-custom-300">
                    <tr>
                      <th className="px-4 py-3 text-left text-xs font-bold text-secondary-100 uppercase">
                        Job ID
                      </th>
                      <th className="px-4 py-3 text-left text-xs font-bold text-secondary-100 uppercase">
                        Title & Client
                      </th>
                      <th className="px-4 py-3 text-left text-xs font-bold text-secondary-100 uppercase">
                        Service
                      </th>
                      <th className="px-4 py-3 text-left text-xs font-bold text-secondary-100 uppercase">
                        Priority
                      </th>
                      <th className="px-4 py-3 text-left text-xs font-bold text-secondary-100 uppercase">
                        Deadline
                      </th>
                      <th className="px-4 py-3 text-right text-xs font-bold text-secondary-100 uppercase">
                        Actions
                      </th>
                    </tr>
                  </thead>
                  <tbody className="bg-white divide-y divide-custom-200">
                    {getUnassignedJobs().length === 0 ? (
                      <tr>
                        <td colSpan={6} className="px-4 py-8 text-center text-custom-700">
                          No unassigned jobs
                        </td>
                      </tr>
                    ) : (
                      getUnassignedJobs().map((job) => (
                        <tr key={job.id} className="hover:bg-custom-50 transition-colors">
                          <td className="px-4 py-4">
                            <span className="text-sm font-bold text-primary-600">
                              {job.id}
                            </span>
                          </td>
                          <td className="px-4 py-4">
                            <div>
                              <p className="text-sm font-semibold text-secondary-100">
                                {job.title}
                              </p>
                              <p className="text-xs text-custom-700">{job.client}</p>
                            </div>
                          </td>
                          <td className="px-4 py-4">
                            <span className="text-sm text-secondary-100">{job.service}</span>
                          </td>
                          <td className="px-4 py-4">
                            <span
                              className={`px-3 py-1 rounded-full text-xs font-bold ${priorityColor[job.priority]}`}
                            >
                              {job.priority}
                            </span>
                          </td>
                          <td className="px-4 py-4">
                            <div className="flex items-center gap-1 text-sm text-custom-700">
                              <HiOutlineClock className="w-4 h-4" />
                              {job.deadline}
                            </div>
                          </td>
                          <td className="px-4 py-4">
                            <div className="flex items-center justify-end">
                              <button
                                onClick={() => {
                                  setSelectedJob(job);
                                  setShowAssignModal(true);
                                }}
                                className="px-3 py-1 rounded-lg bg-primary-500 text-white hover:bg-primary-600 transition-colors text-xs font-semibold"
                              >
                                Assign Worker
                              </button>
                            </div>
                          </td>
                        </tr>
                      ))
                    )}
                  </tbody>
                </table>
              </div>
            </Card>
          </>
        )}

        {/* Jobs View */}
        {viewMode === "jobs" && (
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-4">
            {(["unassigned", "in-progress", "completed"] as JobStatus[]).map((status) => {
              const config = statusConfig[status];
              const columnJobs = jobs.filter((job) => job.status === status);
              const Icon = config.icon;

              return (
                <div key={status} className="flex flex-col">
                  <div
                    className={`${config.color} text-white rounded-t-xl p-3 flex items-center justify-between`}
                  >
                    <div className="flex items-center gap-2">
                      <Icon className="w-4 h-4" />
                      <span className="font-bold text-sm">{config.label}</span>
                    </div>
                    <span className="text-xs font-bold bg-white/20 px-2 py-0.5 rounded-full">
                      {columnJobs.length}
                    </span>
                  </div>

                  <div className="bg-custom-100 rounded-b-xl p-3 flex-1 space-y-3 min-h-[400px]">
                    {columnJobs.map((job) => (
                      <Card
                        key={job.id}
                        hoverable
                        className="!p-3 !bg-style-600 cursor-pointer"
                        onClick={() => {
                          if (status === "unassigned") {
                            setSelectedJob(job);
                            setShowAssignModal(true);
                          }
                        }}
                      >
                        <div className="flex items-start justify-between gap-2 mb-2">
                          <span className="text-xs font-bold text-primary-500">{job.id}</span>
                          <span
                            className={`text-[10px] font-bold px-2 py-0.5 rounded-full ${priorityColor[job.priority]}`}
                          >
                            {job.priority}
                          </span>
                        </div>
                        <h3 className="text-sm font-bold text-secondary-100 mb-1">
                          {job.title}
                        </h3>
                        <p className="text-xs text-custom-700 mb-2">{job.client}</p>
                        <div className="flex items-center gap-2 text-xs text-custom-700 mb-2">
                          <HiOutlineClock className="w-3 h-3" />
                          <span>Due: {job.deadline}</span>
                        </div>

                        {job.assignedWorkerName && (
                          <div className="text-xs bg-primary-50 text-primary-700 px-2 py-1 rounded-lg mb-2">
                            👤 {job.assignedWorkerName}
                          </div>
                        )}

                        {job.progress > 0 && status !== "completed" && (
                          <div>
                            <div className="flex items-center justify-between mb-1">
                              <span className="text-xs text-custom-700">Progress</span>
                              <span className="text-xs font-semibold text-primary-500">
                                {job.progress}%
                              </span>
                            </div>
                            <div className="w-full bg-custom-200 rounded-full h-1.5">
                              <div
                                className="h-1.5 rounded-full bg-primary-500"
                                style={{ width: `${job.progress}%` }}
                              />
                            </div>
                          </div>
                        )}

                        {status === "unassigned" && (
                          <button className="w-full mt-2 text-xs font-semibold text-primary-500 hover:text-primary-600 transition-colors">
                            Assign to Worker →
                          </button>
                        )}
                      </Card>
                    ))}
                  </div>
                </div>
              );
            })}
          </div>
        )}

        {/* Assignment Modal */}
        {showAssignModal && selectedJob && (
          <div className="fixed inset-0 bg-secondary-100/50 z-50 flex items-center justify-center p-4">
            <Card className="!p-6 max-w-md w-full max-h-[90vh] overflow-y-auto">
              <h3 className="text-lg font-bold text-secondary-100 mb-4">
                Assign Job to Worker
              </h3>
              <div className="mb-4">
                <p className="text-sm text-custom-700 mb-1">Job: {selectedJob.id}</p>
                <p className="text-sm font-semibold text-secondary-100">
                  {selectedJob.title}
                </p>
              </div>
              <div className="space-y-2 mb-6">
                {workers.map((worker) => {
                  const workload = worker.activeJobs;
                  return (
                    <button
                      key={worker.id}
                      onClick={() => handleAssignToWorker(selectedJob.id, worker.id)}
                      className="w-full p-3 rounded-xl border-2 border-custom-300 hover:border-primary-400 hover:bg-primary-50 transition-colors text-left"
                    >
                      <div className="flex items-center gap-3 mb-2">
                        <div className="w-10 h-10 rounded-full bg-primary-100 flex items-center justify-center flex-shrink-0">
                          <span className="text-primary-600 font-bold">
                            {worker.name.charAt(0)}
                          </span>
                        </div>
                        <div className="flex-1">
                          <p className="font-semibold text-secondary-100">{worker.name}</p>
                          <p className="text-xs text-custom-700">{worker.department}</p>
                        </div>
                        <span
                          className={`text-xs font-semibold ${
                            workload >= 3
                              ? "text-red-600"
                              : workload >= 2
                              ? "text-yellow-600"
                              : "text-green-600"
                          }`}
                        >
                          {workload} jobs
                        </span>
                      </div>
                      <div className="w-full bg-custom-200 rounded-full h-1.5">
                        <div
                          className={`h-1.5 rounded-full ${
                            workload >= 3
                              ? "bg-red-500"
                              : workload >= 2
                              ? "bg-yellow-500"
                              : "bg-green-500"
                          }`}
                          style={{ width: `${Math.min((workload / 4) * 100, 100)}%` }}
                        />
                      </div>
                    </button>
                  );
                })}
              </div>
              <button
                onClick={() => {
                  setShowAssignModal(false);
                  setSelectedJob(null);
                }}
                className="w-full px-4 py-2 rounded-xl border border-custom-300 hover:bg-custom-100 transition-colors text-sm font-semibold text-custom-700"
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
