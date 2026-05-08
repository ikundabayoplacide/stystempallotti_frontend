import { useState } from "react";
import {
  HiOutlineCheck,
  HiOutlineCheckCircle,
  HiOutlineClipboardList,
  HiOutlineClock,
  HiOutlineExclamationCircle,
  HiOutlinePause,
  HiOutlinePlay,
  HiOutlineTrendingUp,
} from "react-icons/hi";
import { Button, Card } from "../../components/ui";
import type { Department } from "../../context/AuthContext";

// All jobs across departments
const allJobs = [
  // Composition jobs
  {
    id: "JOB-005",
    client: "NGO B",
    service: "Composition",
    department: "composition" as Department,
    task: "Design layout for 50-page report",
    deadline: "2026-05-03 10:00",
    priority: "Low",
    status: "Pending",
    progress: 0,
    estimatedTime: "4h 00m",
    timeRemaining: "Not started",
  },
  {
    id: "JOB-011",
    client: "Magazine Co",
    service: "Composition",
    department: "composition" as Department,
    task: "Layout design for monthly magazine",
    deadline: "2026-05-06 16:00",
    priority: "Medium",
    status: "Pending",
    progress: 0,
    estimatedTime: "6h 00m",
    timeRemaining: "Not started",
  },
  // Montage jobs
  {
    id: "JOB-012",
    client: "Publisher X",
    service: "Montage",
    department: "montage" as Department,
    task: "Prepare plates for book printing",
    deadline: "2026-05-05 10:00",
    priority: "High",
    status: "Pending",
    progress: 0,
    estimatedTime: "3h 00m",
    timeRemaining: "Not started",
  },
  // Printing jobs
  {
    id: "JOB-001",
    client: "ABC Corp",
    service: "Offset Printing",
    department: "printing" as Department,
    task: "Print 500 copies on A4 paper",
    deadline: "2026-05-02 14:00",
    priority: "High",
    status: "In Progress",
    progress: 65,
    estimatedTime: "2h 30m",
    timeRemaining: "45m left",
  },
  {
    id: "JOB-007",
    client: "Bank D",
    service: "Digital Printing",
    department: "printing" as Department,
    task: "Print 300 flyers on glossy paper",
    deadline: "2026-05-04 12:00",
    priority: "High",
    status: "Pending",
    progress: 0,
    estimatedTime: "1h 45m",
    timeRemaining: "Not started",
  },
  // Binding jobs
  {
    id: "JOB-002",
    client: "XYZ Ltd",
    service: "Binding",
    department: "binding" as Department,
    task: "Bind 200 booklets with spiral binding",
    deadline: "2026-05-01 16:00",
    priority: "Medium",
    status: "In Progress",
    progress: 80,
    estimatedTime: "1h 15m",
    timeRemaining: "15m left",
  },
  {
    id: "JOB-013",
    client: "School District",
    service: "Binding",
    department: "binding" as Department,
    task: "Bind 500 student handbooks",
    deadline: "2026-05-07 14:00",
    priority: "Medium",
    status: "Pending",
    progress: 0,
    estimatedTime: "4h 30m",
    timeRemaining: "Not started",
  },
  // Packaging jobs
  {
    id: "JOB-014",
    client: "Corporate Ltd",
    service: "Packaging",
    department: "packaging" as Department,
    task: "Package 1000 brochures in boxes",
    deadline: "2026-05-05 16:00",
    priority: "Low",
    status: "Pending",
    progress: 0,
    estimatedTime: "2h 00m",
    timeRemaining: "Not started",
  },
];

// Completed jobs by department
const allCompletedToday = [
  { id: "JOB-003", client: "Gov Office", service: "Digital Printing", department: "printing" as Department, completedAt: "09:30 AM", duration: "1h 15m" },
  { id: "JOB-004", client: "School A", service: "Packaging", department: "packaging" as Department, completedAt: "11:15 AM", duration: "45m" },
  { id: "JOB-006", client: "Hotel C", service: "Composition", department: "composition" as Department, completedAt: "02:45 PM", duration: "2h 30m" },
  { id: "JOB-008", client: "Bank E", service: "Binding", department: "binding" as Department, completedAt: "10:15 AM", duration: "1h 30m" },
  { id: "JOB-009", client: "Publisher Y", service: "Montage", department: "montage" as Department, completedAt: "01:00 PM", duration: "2h 00m" },
];

const priorityColor: Record<string, string> = {
  High: "bg-red-500 text-white",
  Medium: "bg-yellow-500 text-white",
  Low: "bg-green-500 text-white",
};

const statusColor: Record<string, string> = {
  "In Progress": "bg-blue-100 text-blue-700 border-blue-300",
  "Pending": "bg-gray-100 text-gray-700 border-gray-300",
  "Completed": "bg-green-100 text-green-700 border-green-300",
};

interface WorkerDashboardProps {
  department: Department | null;
}

export default function WorkerDashboard({ department }: WorkerDashboardProps) {
  const [activeJob, setActiveJob] = useState<string | null>("JOB-001");

  // Filter jobs by department
  const myJobs = department 
    ? allJobs.filter(job => job.department === department)
    : allJobs;

  const completedToday = department
    ? allCompletedToday.filter(job => job.department === department)
    : allCompletedToday;

  // Get department display name
  const departmentName = department 
    ? department.charAt(0).toUpperCase() + department.slice(1)
    : "All Departments";

  const handleStartJob = (jobId: string) => {
    setActiveJob(jobId);
  };

  const handlePauseJob = () => {
    setActiveJob(null);
  };

  const urgentJobs = myJobs.filter(job => job.priority === "High" && job.status === "Pending");

  return (
    <div className="space-y-6 font-[family-name:var(--font-family-primary)]">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-3xl md:text-4xl font-bold text-secondary-100 mb-1">
            My Work Dashboard
          </h1>
          <p className="text-sm text-custom-700">
            Thursday, April 30, 2026 • 3:45 PM
          </p>
          {department && (
            <div className="inline-flex items-center gap-2 mt-2 px-3 py-1.5 rounded-lg bg-primary-100 border border-primary-300">
              <span className="text-xs font-bold text-primary-700">Department:</span>
              <span className="text-xs font-bold text-primary-900">{departmentName}</span>
            </div>
          )}
        </div>
        {activeJob && (
          <div className="inline-flex items-center gap-3 px-4 py-3 rounded-xl bg-gradient-to-r from-primary-500 to-primary-600 text-white shadow-lg self-start sm:self-auto">
            <span className="relative flex h-3 w-3">
              <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-white opacity-75"></span>
              <span className="relative inline-flex rounded-full h-3 w-3 bg-white"></span>
            </span>
            <div>
              <p className="text-xs font-semibold opacity-90">Currently Working On</p>
              <p className="text-sm font-bold">{activeJob}</p>
            </div>
          </div>
        )}
      </div>

      {/* Urgent Alert */}
      {urgentJobs.length > 0 && (
        <Card className="!p-4 !bg-red-50 border-2 border-red-200">
          <div className="flex items-start gap-3">
            <div className="w-10 h-10 rounded-xl bg-red-500 flex items-center justify-center flex-shrink-0">
              <HiOutlineExclamationCircle className="w-6 h-6 text-white" />
            </div>
            <div className="flex-1">
              <h3 className="text-sm font-bold text-red-900 mb-1">
                {urgentJobs.length} Urgent Job{urgentJobs.length > 1 ? 's' : ''} Pending
              </h3>
              <p className="text-xs text-red-700">
                {urgentJobs.map(j => j.id).join(", ")} require immediate attention
              </p>
            </div>
          </div>
        </Card>
      )}

      {/* KPI Grid */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        {[
          {
            label: "Assigned Jobs",
            value: myJobs.length.toString(),
            icon: HiOutlineClipboardList,
            color: "text-primary-500",
            bg: "bg-primary-100",
            trend: `${departmentName}`,
          },
          {
            label: "In Progress",
            value: myJobs.filter(j => j.status === "In Progress").length.toString(),
            icon: HiOutlineClock,
            color: "text-yellow-600",
            bg: "bg-yellow-100",
            trend: "Active now",
          },
          {
            label: "Completed Today",
            value: completedToday.length.toString(),
            icon: HiOutlineCheckCircle,
            color: "text-green-600",
            bg: "bg-green-100",
            trend: completedToday.length > 0 ? "Great work!" : "Keep going",
          },
        ].map(({ label, value, icon: Icon, color, bg, trend }) => (
          <Card key={label} hoverable className="!p-5 transition-all hover:shadow-lg">
            <div className="flex items-start justify-between mb-3">
              <div className={`w-12 h-12 rounded-xl flex items-center justify-center ${bg} shadow-sm`}>
                <Icon className={`w-6 h-6 ${color}`} />
              </div>
              <HiOutlineTrendingUp className="w-4 h-4 text-green-500" />
            </div>
            <div>
              <p className="text-3xl font-bold text-secondary-100 mb-1">{value}</p>
              <p className="text-sm text-custom-700 font-semibold mb-1">{label}</p>
              <p className="text-xs text-green-600 font-semibold">{trend}</p>
            </div>
          </Card>
        ))}
      </div>

      {/* My Assigned Jobs */}
      <Card className="!p-6">
        <div className="flex items-center justify-between mb-6">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-primary-100 flex items-center justify-center">
              <HiOutlineClipboardList className="w-5 h-5 text-primary-500" />
            </div>
            <div>
              <h2 className="text-lg font-bold text-secondary-100">
                My Assigned Jobs {department && `- ${departmentName}`}
              </h2>
              <p className="text-xs text-custom-700">{myJobs.length} active jobs</p>
            </div>
          </div>
          <button className="text-sm font-semibold text-primary-500 hover:text-primary-600 transition-colors">
            View All →
          </button>
        </div>
        <div className="space-y-4">
          {myJobs.length === 0 ? (
            <div className="text-center py-12">
              <div className="w-16 h-16 rounded-full bg-custom-200 flex items-center justify-center mx-auto mb-4">
                <HiOutlineClipboardList className="w-8 h-8 text-custom-500" />
              </div>
              <p className="text-lg font-bold text-secondary-100 mb-2">No Jobs Assigned</p>
              <p className="text-sm text-custom-700">
                {department 
                  ? `No jobs currently assigned to ${departmentName} department`
                  : "No jobs currently assigned to you"}
              </p>
            </div>
          ) : (
            myJobs.map((job) => (
              <div
              key={job.id}
              className={`
                group p-5 rounded-2xl border-2 transition-all duration-300 hover:shadow-md
                ${activeJob === job.id
                  ? "border-primary-500 bg-gradient-to-br from-primary-50 to-primary-100/50 shadow-lg"
                  : "border-custom-300 bg-style-600 hover:border-primary-300"
                }
              `}
            >
              <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-4">
                {/* Job Info */}
                <div className="flex-1 space-y-3">
                  <div className="flex flex-wrap items-center gap-2">
                    <span className="text-base font-bold text-primary-500">{job.id}</span>
                    <span className="text-sm text-custom-700">•</span>
                    <span className="text-sm font-bold text-secondary-100">{job.client}</span>
                    <span className={`text-xs font-bold px-3 py-1 rounded-full ${priorityColor[job.priority]} shadow-sm`}>
                      {job.priority}
                    </span>
                    <span className={`text-xs font-semibold px-3 py-1 rounded-full border ${statusColor[job.status]}`}>
                      {job.status}
                    </span>
                  </div>
                  
                  <p className="text-sm text-secondary-100 font-medium">{job.task}</p>
                  
                  <div className="flex flex-wrap gap-4 text-xs">
                    <span className="flex items-center gap-1.5 text-custom-700">
                      <HiOutlineClock className="w-4 h-4 text-primary-500" />
                      <span className="font-semibold">Due:</span> {job.deadline}
                    </span>
                    <span className="flex items-center gap-1.5 text-custom-700">
                      <span className="font-semibold">Est:</span> {job.estimatedTime}
                    </span>
                    <span className={`flex items-center gap-1.5 font-semibold ${
                      job.status === "In Progress" ? "text-primary-600" : "text-custom-700"
                    }`}>
                      {job.timeRemaining}
                    </span>
                  </div>
                  
                  {/* Progress Bar */}
                  {job.progress > 0 && (
                    <div className="space-y-1.5">
                      <div className="flex items-center justify-between">
                        <span className="text-xs font-semibold text-custom-700">Progress</span>
                        <span className="text-xs font-bold text-primary-600">{job.progress}%</span>
                      </div>
                      <div className="relative w-full bg-custom-200 rounded-full h-2.5 overflow-hidden">
                        <div
                          className="h-2.5 rounded-full bg-gradient-to-r from-primary-500 to-primary-600 transition-all duration-500 shadow-sm"
                          style={{ width: `${job.progress}%` }}
                        />
                      </div>
                    </div>
                  )}
                </div>

                {/* Action Buttons */}
                <div className="flex gap-2 lg:flex-col lg:w-32">
                  {job.status === "Pending" && (
                    <Button
                      size="sm"
                      onClick={() => handleStartJob(job.id)}
                      className="flex-1 lg:flex-none flex items-center justify-center gap-2 !py-2.5"
                    >
                      <HiOutlinePlay className="w-4 h-4" />
                      Start Job
                    </Button>
                  )}
                  {job.status === "In Progress" && activeJob === job.id && (
                    <>
                      <Button
                        size="sm"
                        variant="outline"
                        onClick={handlePauseJob}
                        className="flex-1 lg:flex-none flex items-center justify-center gap-2 !py-2.5"
                      >
                        <HiOutlinePause className="w-4 h-4" />
                        Pause
                      </Button>
                      <Button
                        size="sm"
                        className="flex-1 lg:flex-none flex items-center justify-center gap-2 !py-2.5 bg-green-600 hover:bg-green-700"
                      >
                        <HiOutlineCheck className="w-4 h-4" />
                        Complete
                      </Button>
                    </>
                  )}
                  {job.status === "In Progress" && activeJob !== job.id && (
                    <Button
                      size="sm"
                      onClick={() => handleStartJob(job.id)}
                      className="flex-1 lg:flex-none flex items-center justify-center gap-2 !py-2.5"
                    >
                      <HiOutlinePlay className="w-4 h-4" />
                      Resume
                    </Button>
                  )}
                </div>
              </div>
            </div>
            ))
          )}
        </div>
      </Card>

      {/* Completed Today */}
      {completedToday.length > 0 && (
        <Card className="!p-6">
          <div className="flex items-center justify-between mb-6">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-xl bg-green-100 flex items-center justify-center">
                <HiOutlineCheckCircle className="w-5 h-5 text-green-600" />
              </div>
              <div>
                <h2 className="text-lg font-bold text-secondary-100">Completed Today</h2>
                <p className="text-xs text-custom-700">{completedToday.length} jobs finished</p>
              </div>
            </div>
            <span className="text-sm font-bold text-green-600">Great work! 🎉</span>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
            {completedToday.map((job) => (
              <div
              key={job.id}
              className="group p-4 rounded-xl bg-gradient-to-br from-green-50 to-green-100/50 border-2 border-green-200 hover:border-green-300 transition-all hover:shadow-md"
            >
              <div className="flex items-start gap-3 mb-3">
                <div className="w-10 h-10 rounded-full bg-green-500 flex items-center justify-center flex-shrink-0 shadow-sm">
                  <HiOutlineCheckCircle className="w-5 h-5 text-white" />
                </div>
                <div className="flex-1 min-w-0">
                  <p className="text-sm font-bold text-secondary-100 truncate">
                    {job.id}
                  </p>
                  <p className="text-xs text-custom-700">{job.client}</p>
                </div>
              </div>
              <div className="space-y-1 text-xs">
                <p className="text-custom-700">
                  <span className="font-semibold">Service:</span> {job.service}
                </p>
                <p className="text-green-700 font-semibold">
                  <HiOutlineClock className="w-3 h-3 inline mr-1" />
                  {job.completedAt} • {job.duration}
                </p>
              </div>
            </div>
            ))}
          </div>
        </Card>
      )}
    </div>
  );
}
