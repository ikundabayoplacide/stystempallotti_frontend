import { useState } from "react";
import {
  HiOutlineCheckCircle,
  HiOutlineClock,
  HiOutlineEye,
  HiOutlineSearch,
  HiOutlineTrendingUp,
  HiOutlineX,
} from "react-icons/hi";
import { DashboardLayout } from "../../components";
import { Card } from "../../components/ui";
import type { JobStatus } from "../../types/JobStatus";
import { jobStatusConfig } from "../../types/JobStatus";

interface JobProgress {
  id: string;
  title: string;
  client: string;
  department: string;
  status: JobStatus;
  progress: number;
  startDate: string;
  deadline: string;
  assignedWorkers: number;
  completedStages: number;
  totalStages: number;
  currentStage: string;
}

const initialJobs: JobProgress[] = [
  {
    id: "JOB-001",
    title: "Business Cards - 1000pcs",
    client: "ABC Corp",
    department: "Printing",
    status: "in-printing",
    progress: 75,
    startDate: "2026-04-28",
    deadline: "2026-05-10",
    assignedWorkers: 3,
    completedStages: 3,
    totalStages: 4,
    currentStage: "Printing",
  },
  {
    id: "JOB-002",
    title: "Annual Report - 200 copies",
    client: "XYZ Ltd",
    department: "Binding",
    status: "in-binding",
    progress: 60,
    startDate: "2026-04-29",
    deadline: "2026-05-12",
    assignedWorkers: 2,
    completedStages: 2,
    totalStages: 4,
    currentStage: "Binding",
  },
  {
    id: "JOB-003",
    title: "Marketing Brochures - 500pcs",
    client: "Tech Solutions",
    department: "Composition",
    status: "in-composition",
    progress: 40,
    startDate: "2026-05-01",
    deadline: "2026-05-15",
    assignedWorkers: 2,
    completedStages: 1,
    totalStages: 5,
    currentStage: "Design & Layout",
  },
  {
    id: "JOB-004",
    title: "Product Catalog - 300 copies",
    client: "Design Studio",
    department: "Montage",
    status: "in-composition",
    progress: 85,
    startDate: "2026-04-25",
    deadline: "2026-05-08",
    assignedWorkers: 2,
    completedStages: 4,
    totalStages: 5,
    currentStage: "Final Assembly",
  },
  {
    id: "JOB-005",
    title: "Event Posters - 100pcs",
    client: "Marketing Ltd",
    department: "Packaging",
    status: "in-packaging",
    progress: 95,
    startDate: "2026-04-26",
    deadline: "2026-05-07",
    assignedWorkers: 2,
    completedStages: 4,
    totalStages: 4,
    currentStage: "Final Packaging",
  },
];

export default function ProgressPage() {
  const [jobs] = useState<JobProgress[]>(initialJobs);
  const [search, setSearch] = useState("");
  const [filterDepartment, setFilterDepartment] = useState<string>("all");
  const [selectedJob, setSelectedJob] = useState<JobProgress | null>(null);
  const [showDetailsModal, setShowDetailsModal] = useState(false);

  const filtered = jobs.filter((job) => {
    const matchesSearch =
      job.id.toLowerCase().includes(search.toLowerCase()) ||
      job.title.toLowerCase().includes(search.toLowerCase()) ||
      job.client.toLowerCase().includes(search.toLowerCase());
    const matchesDepartment = filterDepartment === "all" || job.department === filterDepartment;
    return matchesSearch && matchesDepartment;
  });

  const departments = ["all", ...Array.from(new Set(jobs.map((j) => j.department)))];

  const avgProgress = Math.round(
    jobs.reduce((sum, j) => sum + j.progress, 0) / jobs.length
  );
  const onTrack = jobs.filter((j) => j.progress >= 70).length;
  const delayed = jobs.filter((j) => j.progress < 50).length;

  const getProgressColor = (progress: number) => {
    if (progress >= 75) return "bg-green-500";
    if (progress >= 50) return "bg-yellow-500";
    return "bg-red-500";
  };

  return (
    <DashboardLayout
      userRole="production-manager"
      userName="Production Manager"
      notificationCount={6}
    >
      <div className="space-y-6 font-[family-name:var(--font-family-primary)]">
        {/* Header */}
        <div>
          <h1 className="text-2xl md:text-3xl font-bold text-secondary-100">
            Production Progress
          </h1>
          <p className="text-sm text-custom-700 mt-1">
            Track real-time progress of all production jobs
          </p>
        </div>

        {/* Summary Cards */}
        <div className="grid grid-cols-1 sm:grid-cols-4 gap-4">
          <Card className="!p-4">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-xl bg-primary-100 flex items-center justify-center">
                <HiOutlineTrendingUp className="w-5 h-5 text-primary-600" />
              </div>
              <div>
                <p className="text-xs text-custom-700">Active Jobs</p>
                <p className="text-xl font-bold text-secondary-100">{jobs.length}</p>
              </div>
            </div>
          </Card>
          <Card className="!p-4">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-xl bg-blue-100 flex items-center justify-center">
                <HiOutlineTrendingUp className="w-5 h-5 text-blue-600" />
              </div>
              <div>
                <p className="text-xs text-custom-700">Avg Progress</p>
                <p className="text-xl font-bold text-blue-600">{avgProgress}%</p>
              </div>
            </div>
          </Card>
          <Card className="!p-4">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-xl bg-green-100 flex items-center justify-center">
                <HiOutlineCheckCircle className="w-5 h-5 text-green-600" />
              </div>
              <div>
                <p className="text-xs text-custom-700">On Track</p>
                <p className="text-xl font-bold text-green-600">{onTrack}</p>
              </div>
            </div>
          </Card>
          <Card className="!p-4">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-xl bg-red-100 flex items-center justify-center">
                <HiOutlineClock className="w-5 h-5 text-red-600" />
              </div>
              <div>
                <p className="text-xs text-custom-700">Delayed</p>
                <p className="text-xl font-bold text-red-600">{delayed}</p>
              </div>
            </div>
          </Card>
        </div>

        {/* Filters */}
        <Card className="!p-4">
          <div className="flex flex-col sm:flex-row gap-3">
            <div className="relative flex-1">
              <HiOutlineSearch className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-custom-700" />
              <input
                type="text"
                placeholder="Search jobs..."
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                className="w-full pl-9 pr-4 py-2 rounded-xl border border-custom-300 bg-style-500 text-secondary-100 text-sm placeholder:text-custom-700 focus:outline-none focus:border-primary-400 focus:ring-2 focus:ring-primary-200"
              />
            </div>
            <div className="flex gap-2 overflow-x-auto">
              {departments.map((dept) => (
                <button
                  key={dept}
                  onClick={() => setFilterDepartment(dept)}
                  className={`px-4 py-2 rounded-xl text-sm font-semibold transition-colors whitespace-nowrap ${
                    filterDepartment === dept
                      ? "bg-primary-500 text-white"
                      : "bg-custom-100 text-custom-700 hover:bg-custom-200"
                  }`}
                >
                  {dept.charAt(0).toUpperCase() + dept.slice(1)}
                </button>
              ))}
            </div>
          </div>
        </Card>

        {/* Progress Table */}
        <Card className="!p-0 overflow-hidden">
          <div className="p-4 bg-custom-100 border-b border-custom-300">
            <h2 className="text-lg font-bold text-secondary-100">Job Progress Tracking</h2>
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
                    Department
                  </th>
                  <th className="px-4 py-3 text-left text-xs font-bold text-secondary-100 uppercase">
                    Current Stage
                  </th>
                  <th className="px-4 py-3 text-left text-xs font-bold text-secondary-100 uppercase">
                    Progress
                  </th>
                  <th className="px-4 py-3 text-left text-xs font-bold text-secondary-100 uppercase">
                    Stages
                  </th>
                  <th className="px-4 py-3 text-left text-xs font-bold text-secondary-100 uppercase">
                    Status
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
                    <td colSpan={9} className="px-4 py-8 text-center text-custom-700">
                      No jobs found
                    </td>
                  </tr>
                ) : (
                  filtered.map((job) => {
                    const statusConfig = jobStatusConfig[job.status];
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
                          <span className="text-xs font-bold px-3 py-1 rounded-full bg-primary-100 text-primary-700">
                            {job.department}
                          </span>
                        </td>
                        <td className="px-4 py-4">
                          <span className="text-sm text-secondary-100">{job.currentStage}</span>
                        </td>
                        <td className="px-4 py-4">
                          <div className="flex items-center gap-2">
                            <div className="flex-1 h-2 bg-custom-200 rounded-full overflow-hidden min-w-[80px]">
                              <div
                                className={`h-full ${getProgressColor(job.progress)}`}
                                style={{ width: `${job.progress}%` }}
                              />
                            </div>
                            <span className="text-sm font-bold text-secondary-100 w-10">
                              {job.progress}%
                            </span>
                          </div>
                        </td>
                        <td className="px-4 py-4">
                          <span className="text-sm text-secondary-100">
                            {job.completedStages}/{job.totalStages}
                          </span>
                        </td>
                        <td className="px-4 py-4">
                          <span
                            className={`text-xs font-bold px-3 py-1 rounded-full ${statusConfig.bgColor} ${statusConfig.color}`}
                          >
                            {statusConfig.label}
                          </span>
                        </td>
                        <td className="px-4 py-4">
                          <span className="text-sm text-custom-700">{job.deadline}</span>
                        </td>
                        <td className="px-4 py-4">
                          <div className="flex items-center justify-end">
                            <button
                              onClick={() => {
                                setSelectedJob(job);
                                setShowDetailsModal(true);
                              }}
                              className="px-3 py-1.5 rounded-lg bg-primary-500 text-white hover:bg-primary-600 transition-colors text-xs font-semibold"
                            >
                              <HiOutlineEye className="w-3 h-3 inline mr-1" />
                              Details
                            </button>
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

        {/* Details Modal */}
        {showDetailsModal && selectedJob && (
          <div className="fixed inset-0 bg-secondary-100/50 z-50 flex items-center justify-center p-4">
            <Card className="!p-6 max-w-2xl w-full">
              <div className="flex items-start justify-between mb-4">
                <div>
                  <h3 className="text-xl font-bold text-secondary-100">{selectedJob.title}</h3>
                  <p className="text-sm text-custom-700 mt-1">
                    {selectedJob.id} - {selectedJob.client}
                  </p>
                </div>
                <button
                  onClick={() => setShowDetailsModal(false)}
                  className="text-custom-700 hover:text-secondary-100"
                >
                  <HiOutlineX className="w-6 h-6" />
                </button>
              </div>

              <div className="space-y-4">
                {/* Progress Bar */}
                <div className="p-4 rounded-xl bg-custom-50 border border-custom-200">
                  <div className="flex items-center justify-between mb-2">
                    <span className="text-sm font-semibold text-secondary-100">
                      Overall Progress
                    </span>
                    <span className="text-lg font-bold text-primary-600">
                      {selectedJob.progress}%
                    </span>
                  </div>
                  <div className="h-3 bg-custom-200 rounded-full overflow-hidden">
                    <div
                      className={`h-full ${getProgressColor(selectedJob.progress)}`}
                      style={{ width: `${selectedJob.progress}%` }}
                    />
                  </div>
                </div>

                {/* Job Details */}
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <p className="text-xs text-custom-700 mb-1">Department</p>
                    <p className="text-sm font-semibold text-secondary-100">
                      {selectedJob.department}
                    </p>
                  </div>
                  <div>
                    <p className="text-xs text-custom-700 mb-1">Current Stage</p>
                    <p className="text-sm font-semibold text-secondary-100">
                      {selectedJob.currentStage}
                    </p>
                  </div>
                  <div>
                    <p className="text-xs text-custom-700 mb-1">Completed Stages</p>
                    <p className="text-sm font-semibold text-secondary-100">
                      {selectedJob.completedStages} / {selectedJob.totalStages}
                    </p>
                  </div>
                  <div>
                    <p className="text-xs text-custom-700 mb-1">Assigned Workers</p>
                    <p className="text-sm font-semibold text-secondary-100">
                      {selectedJob.assignedWorkers}
                    </p>
                  </div>
                  <div>
                    <p className="text-xs text-custom-700 mb-1">Start Date</p>
                    <p className="text-sm font-semibold text-secondary-100">
                      {selectedJob.startDate}
                    </p>
                  </div>
                  <div>
                    <p className="text-xs text-custom-700 mb-1">Deadline</p>
                    <p className="text-sm font-semibold text-secondary-100">
                      {selectedJob.deadline}
                    </p>
                  </div>
                  <div className="col-span-2">
                    <p className="text-xs text-custom-700 mb-1">Status</p>
                    <span
                      className={`text-xs font-bold px-3 py-1 rounded-full ${
                        jobStatusConfig[selectedJob.status].bgColor
                      } ${jobStatusConfig[selectedJob.status].color}`}
                    >
                      {jobStatusConfig[selectedJob.status].label}
                    </span>
                  </div>
                </div>
              </div>

              <div className="flex gap-3 mt-6">
                <button
                  onClick={() => setShowDetailsModal(false)}
                  className="flex-1 px-4 py-2 rounded-xl border border-custom-300 hover:bg-custom-100 transition-colors text-sm font-semibold text-custom-700"
                >
                  Close
                </button>
              </div>
            </Card>
          </div>
        )}
      </div>
    </DashboardLayout>
  );
}
