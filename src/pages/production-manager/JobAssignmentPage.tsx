import { useState } from "react";
import {
    HiOutlineCheckCircle,
    HiOutlineClipboardList,
    HiOutlineClock,
    HiOutlineExclamationCircle,
    HiOutlineSearch,
    HiOutlineX,
} from "react-icons/hi";
import { DashboardLayout } from "../../components";
import { Card } from "../../components/ui";
import type { JobStatus } from "../../types/JobStatus";
import { jobStatusConfig } from "../../types/JobStatus";

interface Job {
  id: string;
  title: string;
  client: string;
  service: string;
  deadline: string;
  priority: "High" | "Medium" | "Low";
  status: JobStatus;
  assignedDepartment?: string;
  estimatedDuration?: string;
}

const initialJobs: Job[] = [
  {
    id: "JOB-001",
    title: "Print 500 brochures",
    client: "ABC Corp",
    service: "Offset Printing",
    deadline: "2026-05-02",
    priority: "High",
    status: "paid",
  },
  {
    id: "JOB-002",
    title: "Bind 200 booklets",
    client: "XYZ Ltd",
    service: "Binding",
    deadline: "2026-05-01",
    priority: "Medium",
    status: "paid",
  },
  {
    id: "JOB-003",
    title: "Design 50-page report",
    client: "NGO B",
    service: "Composition",
    deadline: "2026-05-03",
    priority: "Low",
    status: "paid",
  },
  {
    id: "JOB-005",
    title: "Print 300 flyers",
    client: "Bank D",
    service: "Digital Printing",
    deadline: "2026-05-04",
    priority: "High",
    status: "in-production",
    assignedDepartment: "Printing",
    estimatedDuration: "2 days",
  },
  {
    id: "JOB-006",
    title: "Package 1000 items",
    client: "Hotel C",
    service: "Packaging",
    deadline: "2026-05-05",
    priority: "Medium",
    status: "in-packaging",
    assignedDepartment: "Packaging",
    estimatedDuration: "1 day",
  },
];

const departments = [
  { name: "Composition", capacity: 8, activeJobs: 5, workers: 3, avgDuration: "3 days" },
  { name: "Montage", capacity: 5, activeJobs: 3, workers: 2, avgDuration: "2 days" },
  { name: "Printing", capacity: 8, activeJobs: 7, workers: 5, avgDuration: "2 days" },
  { name: "Binding", capacity: 5, activeJobs: 3, workers: 3, avgDuration: "1 day" },
  { name: "Packaging", capacity: 4, activeJobs: 3, workers: 2, avgDuration: "1 day" },
];

const priorityColor: Record<string, string> = {
  High: "bg-red-500 text-white",
  Medium: "bg-yellow-500 text-white",
  Low: "bg-green-500 text-white",
};

export default function JobAssignmentPage() {
  const [jobs, setJobs] = useState<Job[]>(initialJobs);
  const [search, setSearch] = useState("");
  const [selectedJob, setSelectedJob] = useState<Job | null>(null);
  const [showAssignModal, setShowAssignModal] = useState(false);
  const [estimatedDuration, setEstimatedDuration] = useState("");

  const paidJobs = jobs.filter((job) => job.status === "paid");
  const inProductionJobs = jobs.filter(
    (job) =>
      job.status === "in-production" ||
      job.status === "in-composition" ||
      job.status === "in-printing" ||
      job.status === "in-binding" ||
      job.status === "in-packaging"
  );

  const filtered = jobs.filter(
    (job) =>
      job.id.toLowerCase().includes(search.toLowerCase()) ||
      job.client.toLowerCase().includes(search.toLowerCase()) ||
      job.title.toLowerCase().includes(search.toLowerCase())
  );

  const handleAssignJob = (jobId: string, department: string) => {
    if (!estimatedDuration) {
      alert("Please enter estimated duration");
      return;
    }

    // Determine the status based on department
    let newStatus: JobStatus = "in-production";
    if (department.toLowerCase().includes("composition")) {
      newStatus = "in-composition";
    } else if (department.toLowerCase().includes("printing")) {
      newStatus = "in-printing";
    } else if (department.toLowerCase().includes("binding")) {
      newStatus = "in-binding";
    } else if (department.toLowerCase().includes("packaging")) {
      newStatus = "in-packaging";
    }

    setJobs(
      jobs.map((job) =>
        job.id === jobId
          ? {
              ...job,
              status: newStatus,
              assignedDepartment: department,
              estimatedDuration: estimatedDuration,
            }
          : job
      )
    );

    setShowAssignModal(false);
    setSelectedJob(null);
    setEstimatedDuration("");
  };

  return (
    <DashboardLayout
      userRole="production-manager"
      userName="Production Manager"
      notificationCount={paidJobs.length}
    >
      <div className="space-y-6 font-[family-name:var(--font-family-primary)]">
        {/* Header */}
        <div>
          <h1 className="text-2xl md:text-3xl font-bold text-secondary-100">
            Job Assignment & Planning
          </h1>
          <p className="text-sm text-custom-700 mt-1">
            Assign paid jobs to production departments
          </p>
        </div>

        {/* Summary Cards */}
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
          <Card className="!p-4">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-xl bg-green-100 flex items-center justify-center">
                <HiOutlineCheckCircle className="w-5 h-5 text-green-600" />
              </div>
              <div>
                <p className="text-xs text-custom-700">Paid & Ready</p>
                <p className="text-2xl font-bold text-secondary-100">{paidJobs.length}</p>
              </div>
            </div>
          </Card>
          <Card className="!p-4">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-xl bg-yellow-100 flex items-center justify-center">
                <HiOutlineClock className="w-5 h-5 text-yellow-600" />
              </div>
              <div>
                <p className="text-xs text-custom-700">In Production</p>
                <p className="text-2xl font-bold text-secondary-100">{inProductionJobs.length}</p>
              </div>
            </div>
          </Card>
          <Card className="!p-4">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-xl bg-primary-100 flex items-center justify-center">
                <HiOutlineClipboardList className="w-5 h-5 text-primary-600" />
              </div>
              <div>
                <p className="text-xs text-custom-700">Total Jobs</p>
                <p className="text-2xl font-bold text-secondary-100">{jobs.length}</p>
              </div>
            </div>
          </Card>
          <Card className="!p-4">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-xl bg-red-100 flex items-center justify-center">
                <HiOutlineExclamationCircle className="w-5 h-5 text-red-600" />
              </div>
              <div>
                <p className="text-xs text-custom-700">High Priority</p>
                <p className="text-2xl font-bold text-secondary-100">
                  {jobs.filter((j) => j.priority === "High").length}
                </p>
              </div>
            </div>
          </Card>
        </div>

        {/* Department Capacity */}
        <Card className="!p-6">
          <h2 className="text-lg font-bold text-secondary-100 mb-4">Department Capacity</h2>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-5 gap-4">
            {departments.map((dept) => {
              const utilization = (dept.activeJobs / dept.capacity) * 100;
              return (
                <div
                  key={dept.name}
                  className="p-4 rounded-xl bg-custom-50 border border-custom-200"
                >
                  <h3 className="font-bold text-secondary-100 mb-3">{dept.name}</h3>
                  <div className="space-y-2 text-sm">
                    <div className="flex justify-between">
                      <span className="text-custom-700">Active:</span>
                      <span className="font-bold text-primary-500">
                        {dept.activeJobs}/{dept.capacity}
                      </span>
                    </div>
                    <div className="w-full bg-custom-200 rounded-full h-2">
                      <div
                        className={`h-2 rounded-full ${
                          utilization >= 80
                            ? "bg-red-500"
                            : utilization >= 60
                            ? "bg-yellow-500"
                            : "bg-green-500"
                        }`}
                        style={{ width: `${utilization}%` }}
                      />
                    </div>
                    <div className="flex justify-between text-xs">
                      <span className="text-custom-700">Workers:</span>
                      <span className="font-semibold text-secondary-100">{dept.workers}</span>
                    </div>
                    <div className="flex justify-between text-xs">
                      <span className="text-custom-700">Avg Duration:</span>
                      <span className="font-semibold text-secondary-100">{dept.avgDuration}</span>
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        </Card>

        {/* Jobs List */}
        <Card className="!p-0 overflow-hidden">
          <div className="p-4 bg-custom-100 border-b border-custom-300">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
              <h2 className="text-lg font-bold text-secondary-100">All Jobs</h2>
              <div className="relative w-full sm:w-64">
                <HiOutlineSearch className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-custom-700" />
                <input
                  type="text"
                  placeholder="Search jobs..."
                  value={search}
                  onChange={(e) => setSearch(e.target.value)}
                  className="w-full pl-9 pr-4 py-2 rounded-xl border border-custom-300 bg-style-500 text-secondary-100 text-sm placeholder:text-custom-700 focus:outline-none focus:border-primary-400 focus:ring-2 focus:ring-primary-200"
                />
              </div>
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
                    Status
                  </th>
                  <th className="px-4 py-3 text-left text-xs font-bold text-secondary-100 uppercase">
                    Department
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
                {filtered.length === 0 ? (
                  <tr>
                    <td colSpan={8} className="px-4 py-8 text-center text-custom-700">
                      No jobs found
                    </td>
                  </tr>
                ) : (
                  filtered.map((job) => {
                    const statusCfg = jobStatusConfig[job.status];
                    return (
                      <tr key={job.id} className="hover:bg-custom-50 transition-colors">
                        <td className="px-4 py-4">
                          <span className="text-sm font-bold text-primary-600">{job.id}</span>
                        </td>
                        <td className="px-4 py-4">
                          <div>
                            <span className="text-sm font-semibold text-secondary-100 block">
                              {job.title}
                            </span>
                            <span className="text-xs text-custom-700">{job.client}</span>
                          </div>
                        </td>
                        <td className="px-4 py-4">
                          <span className="text-sm text-secondary-100">{job.service}</span>
                        </td>
                        <td className="px-4 py-4">
                          <span
                            className={`text-xs font-bold px-3 py-1 rounded-full ${priorityColor[job.priority]}`}
                          >
                            {job.priority}
                          </span>
                        </td>
                        <td className="px-4 py-4">
                          <span
                            className={`text-xs font-bold px-3 py-1 rounded-full ${statusCfg.bgColor} ${statusCfg.color}`}
                          >
                            {statusCfg.label}
                          </span>
                        </td>
                        <td className="px-4 py-4">
                          {job.assignedDepartment ? (
                            <div>
                              <span className="text-sm font-semibold text-primary-600 block">
                                {job.assignedDepartment}
                              </span>
                              {job.estimatedDuration && (
                                <span className="text-xs text-custom-700">
                                  Est: {job.estimatedDuration}
                                </span>
                              )}
                            </div>
                          ) : (
                            <span className="text-sm text-custom-700">-</span>
                          )}
                        </td>
                        <td className="px-4 py-4">
                          <span className="text-sm text-custom-700">{job.deadline}</span>
                        </td>
                        <td className="px-4 py-4">
                          <div className="flex items-center justify-end gap-2">
                            {job.status === "paid" && (
                              <button
                                onClick={() => {
                                  setSelectedJob(job);
                                  setShowAssignModal(true);
                                }}
                                className="px-3 py-1.5 rounded-lg bg-primary-500 text-white hover:bg-primary-600 transition-colors text-xs font-semibold"
                              >
                                Assign
                              </button>
                            )}
                            {job.status !== "paid" &&
                              job.status !== "completed" &&
                              job.status !== "delivered" && (
                                <button
                                  onClick={() => {
                                    setSelectedJob(job);
                                    setShowAssignModal(true);
                                  }}
                                  className="px-3 py-1.5 rounded-lg bg-custom-100 text-custom-700 hover:bg-custom-200 transition-colors text-xs font-semibold"
                                >
                                  Reassign
                                </button>
                              )}
                          </div>
                        </td>
                      </tr>
                    );
                  })
                )}
              </tbody>
            </table>
          </div>
        </Card>

        {/* Assignment Modal */}
        {showAssignModal && selectedJob && (
          <div className="fixed inset-0 bg-secondary-100/50 z-50 flex items-center justify-center p-4">
            <Card className="!p-6 max-w-2xl w-full max-h-[90vh] overflow-y-auto">
              <div className="flex items-start justify-between mb-4">
                <div>
                  <h3 className="text-xl font-bold text-secondary-100">
                    Assign Job to Department
                  </h3>
                  <p className="text-sm text-custom-700 mt-1">
                    {selectedJob.id} - {selectedJob.title}
                  </p>
                </div>
                <button
                  onClick={() => {
                    setShowAssignModal(false);
                    setSelectedJob(null);
                    setEstimatedDuration("");
                  }}
                  className="text-custom-700 hover:text-secondary-100 text-2xl"
                >
                  <HiOutlineX className="w-6 h-6" />
                </button>
              </div>

              <div className="space-y-4">
                <div>
                  <label className="block text-sm font-semibold text-custom-700 mb-2">
                    Estimated Duration *
                  </label>
                  <input
                    type="text"
                    value={estimatedDuration}
                    onChange={(e) => setEstimatedDuration(e.target.value)}
                    placeholder="e.g., 2 days, 3 hours"
                    className="w-full px-4 py-2 rounded-xl border border-custom-300 focus:outline-none focus:border-primary-500"
                  />
                </div>

                <div>
                  <label className="block text-sm font-semibold text-custom-700 mb-3">
                    Select Department *
                  </label>
                  <div className="space-y-2">
                    {departments.map((dept) => {
                      const utilization = (dept.activeJobs / dept.capacity) * 100;
                      return (
                        <button
                          key={dept.name}
                          onClick={() => handleAssignJob(selectedJob.id, dept.name)}
                          className="w-full p-4 rounded-xl border-2 border-custom-300 hover:border-primary-400 hover:bg-primary-50 transition-colors text-left"
                        >
                          <div className="flex items-center justify-between mb-2">
                            <span className="font-bold text-secondary-100">{dept.name}</span>
                            <span
                              className={`text-xs font-semibold px-2 py-1 rounded-full ${
                                utilization >= 80
                                  ? "bg-red-100 text-red-700"
                                  : utilization >= 60
                                  ? "bg-yellow-100 text-yellow-700"
                                  : "bg-green-100 text-green-700"
                              }`}
                            >
                              {Math.round(utilization)}% Load
                            </span>
                          </div>
                          <div className="flex items-center justify-between text-xs text-custom-700">
                            <span>
                              {dept.activeJobs}/{dept.capacity} jobs
                            </span>
                            <span>•</span>
                            <span>{dept.workers} workers</span>
                            <span>•</span>
                            <span>Avg: {dept.avgDuration}</span>
                          </div>
                        </button>
                      );
                    })}
                  </div>
                </div>
              </div>

              <div className="flex gap-3 mt-6">
                <button
                  onClick={() => {
                    setShowAssignModal(false);
                    setSelectedJob(null);
                    setEstimatedDuration("");
                  }}
                  className="flex-1 px-4 py-2 rounded-xl border border-custom-300 hover:bg-custom-100 transition-colors text-sm font-semibold text-custom-700"
                >
                  Cancel
                </button>
              </div>
            </Card>
          </div>
        )}
      </div>
    </DashboardLayout>
  );
}
