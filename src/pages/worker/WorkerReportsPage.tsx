import { useState } from "react";
import {
    HiOutlineCheckCircle,
    HiOutlineClipboardList,
    HiOutlineClock,
    HiOutlineDocumentText,
    HiOutlinePlus,
    HiOutlineX,
    HiOutlineXCircle,
} from "react-icons/hi";
import { DashboardLayout } from "../../components";
import { Card } from "../../components/ui";

type ReportStatus = "draft" | "submitted" | "confirmed" | "rejected";

interface AssignedJob {
  id: string;
  title: string;
  client: string;
  service: string;
  deadline: string;
  status: "pending" | "in-progress" | "paused" | "completed";
}

interface JobDetail {
  jobId: string;
  jobTitle: string;
  startTime: string;
  endTime: string;
  duration: number; // in hours
  toolsUsed: string[];
  materialsUsed: { name: string; quantity: string; unit: string }[];
  notes?: string;
}

interface Report {
  id: string;
  title: string;
  date: string;
  jobsCompleted: JobDetail[];
  totalHoursWorked: number;
  description: string;
  issues?: string;
  status: ReportStatus;
  submittedAt?: string;
  reviewedAt?: string;
  reviewedBy?: string;
  rejectionReason?: string;
}

const initialReports: Report[] = [
  {
    id: "RPT-001",
    title: "Daily Report - May 1, 2026",
    date: "2026-05-01",
    jobsCompleted: [
      {
        jobId: "JOB-003",
        jobTitle: "Business Cards Printing",
        startTime: "08:00",
        endTime: "12:00",
        duration: 4,
        toolsUsed: ["Digital Printer HP-500", "Paper Cutter", "Laminator"],
        materialsUsed: [
          { name: "Cardstock Paper", quantity: "500", unit: "sheets" },
          { name: "Ink Cartridge (Black)", quantity: "1", unit: "unit" },
          { name: "Laminating Film", quantity: "50", unit: "meters" },
        ],
        notes: "Quality check passed. Client requested glossy finish.",
      },
      {
        jobId: "JOB-010",
        jobTitle: "Packaging Materials",
        startTime: "13:00",
        endTime: "17:00",
        duration: 4,
        toolsUsed: ["Offset Printer", "Die Cutting Machine"],
        materialsUsed: [
          { name: "Corrugated Board", quantity: "100", unit: "sheets" },
          { name: "Printing Ink (CMYK)", quantity: "4", unit: "liters" },
        ],
      },
    ],
    totalHoursWorked: 8,
    description: "Completed printing of business cards and packaging materials. All quality checks passed.",
    status: "confirmed",
    submittedAt: "2026-05-01T17:00:00",
    reviewedAt: "2026-05-01T18:00:00",
    reviewedBy: "Supervisor",
  },
  {
    id: "RPT-002",
    title: "Daily Report - May 2, 2026",
    date: "2026-05-02",
    jobsCompleted: [
      {
        jobId: "JOB-001",
        jobTitle: "Brochure Printing",
        startTime: "08:30",
        endTime: "14:30",
        duration: 6,
        toolsUsed: ["Digital Printer Canon-700", "Folding Machine", "Stapler"],
        materialsUsed: [
          { name: "Glossy Paper A4", quantity: "1000", unit: "sheets" },
          { name: "Ink Cartridge (Color)", quantity: "2", unit: "units" },
          { name: "Staples", quantity: "1", unit: "box" },
        ],
        notes: "65% complete. Need to finish folding tomorrow.",
      },
    ],
    totalHoursWorked: 6,
    description: "Working on brochure printing. Progress at 65%.",
    status: "submitted",
    submittedAt: "2026-05-02T16:00:00",
  },
  {
    id: "RPT-003",
    title: "Daily Report - April 30, 2026",
    date: "2026-04-30",
    jobsCompleted: [
      {
        jobId: "JOB-005",
        jobTitle: "Annual Report Design",
        startTime: "09:00",
        endTime: "16:00",
        duration: 7,
        toolsUsed: ["Laser Printer", "Binding Machine"],
        materialsUsed: [
          { name: "Premium Paper", quantity: "200", unit: "sheets" },
          { name: "Binding Coils", quantity: "10", unit: "units" },
          { name: "Cover Stock", quantity: "10", unit: "sheets" },
        ],
        notes: "Printer had minor issues in the morning, resolved by maintenance at 10:30 AM.",
      },
    ],
    totalHoursWorked: 7,
    description: "Completed report design work.",
    issues: "Printer had minor issues in the morning, resolved by maintenance.",
    status: "rejected",
    submittedAt: "2026-04-30T17:00:00",
    reviewedAt: "2026-04-30T18:30:00",
    reviewedBy: "Supervisor",
    rejectionReason: "Please provide more details about the printer issue and resolution time.",
  },
];

const statusConfig: Record<
  ReportStatus,
  { label: string; color: string; icon: any; bgColor: string }
> = {
  draft: {
    label: "Draft",
    color: "text-gray-600",
    icon: HiOutlineDocumentText,
    bgColor: "bg-gray-100",
  },
  submitted: {
    label: "Submitted",
    color: "text-blue-600",
    icon: HiOutlineClock,
    bgColor: "bg-blue-100",
  },
  confirmed: {
    label: "Confirmed",
    color: "text-green-600",
    icon: HiOutlineCheckCircle,
    bgColor: "bg-green-100",
  },
  rejected: {
    label: "Rejected",
    color: "text-red-600",
    icon: HiOutlineXCircle,
    bgColor: "bg-red-100",
  },
};

// Mock assigned jobs (in real app, this would come from the task management system)
const assignedJobs: AssignedJob[] = [
  {
    id: "JOB-001",
    title: "Print 500 brochures",
    client: "ABC Corp",
    service: "Offset Printing",
    deadline: "2026-05-02 14:00",
    status: "in-progress",
  },
  {
    id: "JOB-002",
    title: "Bind 200 booklets",
    client: "XYZ Ltd",
    service: "Binding",
    deadline: "2026-05-01 16:00",
    status: "in-progress",
  },
  {
    id: "JOB-005",
    title: "Design 50-page report",
    client: "NGO B",
    service: "Composition",
    deadline: "2026-05-03 10:00",
    status: "pending",
  },
  {
    id: "JOB-007",
    title: "Print 300 flyers",
    client: "Bank D",
    service: "Digital Printing",
    deadline: "2026-05-04 12:00",
    status: "pending",
  },
  {
    id: "JOB-003",
    title: "Print business cards",
    client: "Tech Startup",
    service: "Digital Printing",
    deadline: "2026-04-30 17:00",
    status: "completed",
  },
  {
    id: "JOB-004",
    title: "Package materials",
    client: "School A",
    service: "Packaging",
    deadline: "2026-04-29 15:00",
    status: "completed",
  },
];

export default function WorkerReportsPage() {
  const [reports, setReports] = useState<Report[]>(initialReports);
  const [showCreateModal, setShowCreateModal] = useState(false);
  const [showViewModal, setShowViewModal] = useState(false);
  const [showJobSelectionModal, setShowJobSelectionModal] = useState(false);
  const [selectedReport, setSelectedReport] = useState<Report | null>(null);
  const [formData, setFormData] = useState({
    title: "",
    date: new Date().toISOString().split("T")[0],
    description: "",
    issues: "",
  });
  const [jobDetails, setJobDetails] = useState<JobDetail[]>([
    {
      jobId: "",
      jobTitle: "",
      startTime: "",
      endTime: "",
      duration: 0,
      toolsUsed: [],
      materialsUsed: [],
      notes: "",
    },
  ]);
  const [currentJobIndex, setCurrentJobIndex] = useState(0);
  const [toolInput, setToolInput] = useState("");
  const [materialInput, setMaterialInput] = useState({
    name: "",
    quantity: "",
    unit: "",
  });
  const [jobSearchQuery, setJobSearchQuery] = useState("");

  const calculateDuration = (start: string, end: string): number => {
    if (!start || !end) return 0;
    const [startHour, startMin] = start.split(":").map(Number);
    const [endHour, endMin] = end.split(":").map(Number);
    const startMinutes = startHour * 60 + startMin;
    const endMinutes = endHour * 60 + endMin;
    return Math.round(((endMinutes - startMinutes) / 60) * 100) / 100;
  };

  const updateJobDetail = (index: number, field: keyof JobDetail, value: any) => {
    const updated = [...jobDetails];
    updated[index] = { ...updated[index], [field]: value };
    
    // Auto-calculate duration when start or end time changes
    if (field === "startTime" || field === "endTime") {
      updated[index].duration = calculateDuration(
        updated[index].startTime,
        updated[index].endTime
      );
    }
    
    setJobDetails(updated);
  };

  const addJobDetail = () => {
    setShowJobSelectionModal(true);
  };

  const handleSelectJob = (job: AssignedJob) => {
    const newJob: JobDetail = {
      jobId: job.id,
      jobTitle: job.title,
      startTime: "",
      endTime: "",
      duration: 0,
      toolsUsed: [],
      materialsUsed: [],
      notes: "",
    };
    
    setJobDetails([...jobDetails, newJob]);
    setCurrentJobIndex(jobDetails.length);
    setShowJobSelectionModal(false);
    setJobSearchQuery("");
  };

  const filteredAssignedJobs = assignedJobs.filter(
    (job) =>
      jobSearchQuery === "" ||
      job.id.toLowerCase().includes(jobSearchQuery.toLowerCase()) ||
      job.title.toLowerCase().includes(jobSearchQuery.toLowerCase()) ||
      job.client.toLowerCase().includes(jobSearchQuery.toLowerCase())
  );

  const removeJobDetail = (index: number) => {
    if (jobDetails.length === 1) return;
    const updated = jobDetails.filter((_, i) => i !== index);
    setJobDetails(updated);
    if (currentJobIndex >= updated.length) {
      setCurrentJobIndex(updated.length - 1);
    }
  };

  const addTool = () => {
    if (!toolInput.trim()) return;
    const updated = [...jobDetails];
    updated[currentJobIndex].toolsUsed.push(toolInput.trim());
    setJobDetails(updated);
    setToolInput("");
  };

  const removeTool = (toolIndex: number) => {
    const updated = [...jobDetails];
    updated[currentJobIndex].toolsUsed = updated[currentJobIndex].toolsUsed.filter(
      (_, i) => i !== toolIndex
    );
    setJobDetails(updated);
  };

  const addMaterial = () => {
    if (!materialInput.name.trim() || !materialInput.quantity.trim()) return;
    const updated = [...jobDetails];
    updated[currentJobIndex].materialsUsed.push({ ...materialInput });
    setJobDetails(updated);
    setMaterialInput({ name: "", quantity: "", unit: "" });
  };

  const removeMaterial = (materialIndex: number) => {
    const updated = [...jobDetails];
    updated[currentJobIndex].materialsUsed = updated[
      currentJobIndex
    ].materialsUsed.filter((_, i) => i !== materialIndex);
    setJobDetails(updated);
  };

  const handleCreateReport = () => {
    // Validate job details
    const validJobs = jobDetails.filter(
      (job) => job.jobId && job.jobTitle && job.startTime && job.endTime
    );

    if (validJobs.length === 0) {
      alert("Please add at least one complete job detail");
      return;
    }

    const totalHours = validJobs.reduce((sum, job) => sum + job.duration, 0);

    const newReport: Report = {
      id: `RPT-${String(reports.length + 1).padStart(3, "0")}`,
      title: formData.title,
      date: formData.date,
      jobsCompleted: validJobs,
      totalHoursWorked: Math.round(totalHours * 100) / 100,
      description: formData.description,
      issues: formData.issues || undefined,
      status: "draft",
    };

    setReports([newReport, ...reports]);
    setShowCreateModal(false);
    
    // Reset form
    setFormData({
      title: "",
      date: new Date().toISOString().split("T")[0],
      description: "",
      issues: "",
    });
    setJobDetails([
      {
        jobId: "",
        jobTitle: "",
        startTime: "",
        endTime: "",
        duration: 0,
        toolsUsed: [],
        materialsUsed: [],
        notes: "",
      },
    ]);
    setCurrentJobIndex(0);
  };

  const handleSubmitReport = (reportId: string) => {
    setReports(
      reports.map((r) =>
        r.id === reportId
          ? {
              ...r,
              status: "submitted" as ReportStatus,
              submittedAt: new Date().toISOString(),
            }
          : r
      )
    );
  };

  const handleViewReport = (report: Report) => {
    setSelectedReport(report);
    setShowViewModal(true);
  };

  return (
    <DashboardLayout userRole="worker" userName="John Worker" notificationCount={2}>
      <div className="space-y-6 font-[family-name:var(--font-family-primary)]">
        {/* Header */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
          <div>
            <h1 className="text-2xl md:text-3xl font-bold text-secondary-100">
              My Reports
            </h1>
            <p className="text-sm text-custom-700 mt-1">
              Create and manage your daily work reports
            </p>
          </div>
          <button
            onClick={() => setShowCreateModal(true)}
            className="flex items-center gap-2 px-4 py-2 rounded-xl bg-primary-500 text-white hover:bg-primary-600 transition-colors self-start sm:self-auto"
          >
            <HiOutlinePlus className="w-4 h-4" />
            <span className="text-sm font-semibold">Create Report</span>
          </button>
        </div>

        {/* Summary Stats */}
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
          {(["draft", "submitted", "confirmed", "rejected"] as ReportStatus[]).map(
            (status) => {
              const config = statusConfig[status];
              const count = reports.filter((r) => r.status === status).length;
              const Icon = config.icon;

              return (
                <Card key={status} className="!p-4">
                  <div className="flex items-center gap-3">
                    <div
                      className={`w-10 h-10 rounded-xl ${config.bgColor} flex items-center justify-center`}
                    >
                      <Icon className={`w-5 h-5 ${config.color}`} />
                    </div>
                    <div>
                      <p className="text-xs text-custom-700">{config.label}</p>
                      <p className="text-2xl font-bold text-secondary-100">{count}</p>
                    </div>
                  </div>
                </Card>
              );
            }
          )}
        </div>

        {/* Reports Table */}
        <Card className="!p-0 overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead className="bg-custom-100 border-b border-custom-300">
                <tr>
                  <th className="px-4 py-3 text-left text-xs font-bold text-secondary-100 uppercase">
                    Report ID
                  </th>
                  <th className="px-4 py-3 text-left text-xs font-bold text-secondary-100 uppercase">
                    Title & Date
                  </th>
                  <th className="px-4 py-3 text-left text-xs font-bold text-secondary-100 uppercase">
                    Jobs
                  </th>
                  <th className="px-4 py-3 text-left text-xs font-bold text-secondary-100 uppercase">
                    Hours
                  </th>
                  <th className="px-4 py-3 text-left text-xs font-bold text-secondary-100 uppercase">
                    Status
                  </th>
                  <th className="px-4 py-3 text-left text-xs font-bold text-secondary-100 uppercase">
                    Submitted
                  </th>
                  <th className="px-4 py-3 text-right text-xs font-bold text-secondary-100 uppercase">
                    Actions
                  </th>
                </tr>
              </thead>
              <tbody className="bg-white divide-y divide-custom-200">
                {reports.length === 0 ? (
                  <tr>
                    <td colSpan={7} className="px-4 py-8 text-center text-custom-700">
                      No reports found. Create your first report!
                    </td>
                  </tr>
                ) : (
                  reports.map((report) => {
                    const config = statusConfig[report.status];
                    const Icon = config.icon;

                    return (
                      <tr key={report.id} className="hover:bg-custom-50 transition-colors">
                        <td className="px-4 py-4">
                          <span className="text-sm font-bold text-primary-600">
                            {report.id}
                          </span>
                        </td>
                        <td className="px-4 py-4">
                          <div>
                            <p className="text-sm font-semibold text-secondary-100">
                              {report.title}
                            </p>
                            <p className="text-xs text-custom-700">{report.date}</p>
                          </div>
                        </td>
                        <td className="px-4 py-4">
                          <span className="text-sm text-secondary-100">
                            {report.jobsCompleted.length} job{report.jobsCompleted.length !== 1 ? 's' : ''}
                          </span>
                        </td>
                        <td className="px-4 py-4">
                          <span className="text-sm font-semibold text-secondary-100">
                            {report.totalHoursWorked}h
                          </span>
                        </td>
                        <td className="px-4 py-4">
                          <div className="flex items-center gap-2">
                            <Icon className={`w-4 h-4 ${config.color}`} />
                            <span
                              className={`px-3 py-1 rounded-full text-xs font-semibold ${config.bgColor} ${config.color}`}
                            >
                              {config.label}
                            </span>
                          </div>
                        </td>
                        <td className="px-4 py-4">
                          <span className="text-sm text-custom-700">
                            {report.submittedAt
                              ? new Date(report.submittedAt).toLocaleDateString()
                              : "-"}
                          </span>
                        </td>
                        <td className="px-4 py-4">
                          <div className="flex items-center justify-end gap-2">
                            <button
                              onClick={() => handleViewReport(report)}
                              className="px-3 py-1 rounded-lg border border-custom-300 hover:bg-custom-100 transition-colors text-xs font-semibold text-custom-700"
                              title="View Details"
                            >
                              View
                            </button>
                            {report.status === "draft" && (
                              <button
                                onClick={(e) => {
                                  e.stopPropagation();
                                  handleSubmitReport(report.id);
                                }}
                                className="px-3 py-1 rounded-lg bg-primary-500 text-white hover:bg-primary-600 transition-colors text-xs font-semibold"
                                title="Submit to Supervisor"
                              >
                                Submit
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

          {/* Rejection Reasons - Show below table for rejected reports */}
          {reports.some(r => r.status === "rejected" && r.rejectionReason) && (
            <div className="p-4 bg-red-50 border-t border-red-200">
              <p className="text-sm font-bold text-red-700 mb-2">⚠️ Rejected Reports - Action Required:</p>
              <div className="space-y-2">
                {reports
                  .filter(r => r.status === "rejected" && r.rejectionReason)
                  .map(report => (
                    <div key={report.id} className="text-xs text-red-600">
                      <strong>{report.id}:</strong> {report.rejectionReason}
                    </div>
                  ))}
              </div>
            </div>
          )}
        </Card>

        {/* Job Selection Modal */}
        {showJobSelectionModal && (
          <div className="fixed inset-0 bg-secondary-100/50 z-[60] flex items-center justify-center p-4">
            <Card className="!p-6 max-w-3xl w-full max-h-[90vh] overflow-y-auto">
              <div className="flex items-center justify-between mb-4">
                <h3 className="text-xl font-bold text-secondary-100">
                  Select Job to Add
                </h3>
                <button
                  onClick={() => {
                    setShowJobSelectionModal(false);
                    setJobSearchQuery("");
                  }}
                  className="text-custom-700 hover:text-secondary-100 text-2xl"
                >
                  <HiOutlineX className="w-6 h-6" />
                </button>
              </div>

              {/* Search Bar */}
              <div className="mb-4">
                <div className="relative">
                  <HiOutlineClipboardList className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-custom-700" />
                  <input
                    type="text"
                    value={jobSearchQuery}
                    onChange={(e) => setJobSearchQuery(e.target.value)}
                    placeholder="Search by job ID, title, or client..."
                    className="w-full pl-10 pr-4 py-2 rounded-xl border border-custom-300 focus:outline-none focus:border-primary-500"
                  />
                </div>
              </div>

              {/* Jobs List */}
              <div className="space-y-3 max-h-[500px] overflow-y-auto">
                {filteredAssignedJobs.length === 0 ? (
                  <div className="text-center py-8 text-custom-700">
                    <p>No jobs found matching your search</p>
                  </div>
                ) : (
                  filteredAssignedJobs.map((job) => {
                    const isAlreadyAdded = jobDetails.some((jd) => jd.jobId === job.id);
                    const statusColors = {
                      pending: "bg-blue-100 text-blue-700",
                      "in-progress": "bg-yellow-100 text-yellow-700",
                      paused: "bg-orange-100 text-orange-700",
                      completed: "bg-green-100 text-green-700",
                    };

                    return (
                      <Card
                        key={job.id}
                        hoverable={!isAlreadyAdded}
                        className={`!p-4 ${
                          isAlreadyAdded
                            ? "opacity-50 cursor-not-allowed"
                            : "cursor-pointer"
                        }`}
                        onClick={() => !isAlreadyAdded && handleSelectJob(job)}
                      >
                        <div className="flex items-start justify-between gap-3">
                          <div className="flex-1">
                            <div className="flex items-center gap-2 mb-2">
                              <span className="text-sm font-bold text-primary-500">
                                {job.id}
                              </span>
                              <span
                                className={`text-xs font-bold px-2 py-0.5 rounded-full ${
                                  statusColors[job.status]
                                }`}
                              >
                                {job.status.replace("-", " ")}
                              </span>
                              {isAlreadyAdded && (
                                <span className="text-xs font-bold px-2 py-0.5 rounded-full bg-gray-200 text-gray-600">
                                  Already Added
                                </span>
                              )}
                            </div>
                            <h4 className="text-base font-bold text-secondary-100 mb-1">
                              {job.title}
                            </h4>
                            <div className="flex flex-wrap items-center gap-3 text-xs text-custom-700">
                              <span>Client: {job.client}</span>
                              <span>•</span>
                              <span>Service: {job.service}</span>
                              <span>•</span>
                              <span>
                                <HiOutlineClock className="w-3 h-3 inline mr-1" />
                                Due: {job.deadline}
                              </span>
                            </div>
                          </div>
                          {!isAlreadyAdded && (
                            <button
                              onClick={(e) => {
                                e.stopPropagation();
                                handleSelectJob(job);
                              }}
                              className="px-4 py-2 rounded-xl bg-primary-500 text-white hover:bg-primary-600 transition-colors text-sm font-semibold"
                            >
                              Select
                            </button>
                          )}
                        </div>
                      </Card>
                    );
                  })
                )}
              </div>

              <div className="flex gap-3 mt-6">
                <button
                  onClick={() => {
                    setShowJobSelectionModal(false);
                    setJobSearchQuery("");
                  }}
                  className="flex-1 px-4 py-2 rounded-xl border border-custom-300 hover:bg-custom-100 transition-colors text-sm font-semibold text-custom-700"
                >
                  Cancel
                </button>
              </div>
            </Card>
          </div>
        )}

        {/* Create Report Modal */}
        {showCreateModal && (
          <div className="fixed inset-0 bg-secondary-100/50 z-50 flex items-center justify-center p-4">
            <Card className="!p-6 max-w-4xl w-full max-h-[90vh] overflow-y-auto">
              <div className="flex items-center justify-between mb-4">
                <h3 className="text-xl font-bold text-secondary-100">
                  Create New Report
                </h3>
                <button
                  onClick={() => setShowCreateModal(false)}
                  className="text-custom-700 hover:text-secondary-100 text-2xl"
                >
                  <HiOutlineX className="w-6 h-6" />
                </button>
              </div>

              <div className="space-y-6">
                {/* Basic Info */}
                <div className="space-y-4">
                  <h4 className="text-sm font-bold text-secondary-100 uppercase tracking-wide">
                    Basic Information
                  </h4>
                  <div>
                    <label className="block text-sm font-semibold text-custom-700 mb-2">
                      Report Title *
                    </label>
                    <input
                      type="text"
                      value={formData.title}
                      onChange={(e) =>
                        setFormData({ ...formData, title: e.target.value })
                      }
                      placeholder="e.g., Daily Report - May 1, 2026"
                      className="w-full px-4 py-2 rounded-xl border border-custom-300 focus:outline-none focus:border-primary-500"
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-semibold text-custom-700 mb-2">
                      Date *
                    </label>
                    <input
                      type="date"
                      value={formData.date}
                      onChange={(e) =>
                        setFormData({ ...formData, date: e.target.value })
                      }
                      className="w-full px-4 py-2 rounded-xl border border-custom-300 focus:outline-none focus:border-primary-500"
                    />
                  </div>
                </div>

                {/* Job Details */}
                <div className="space-y-4">
                  <div className="flex items-center justify-between">
                    <h4 className="text-sm font-bold text-secondary-100 uppercase tracking-wide">
                      Job Details
                    </h4>
                    <button
                      onClick={addJobDetail}
                      className="text-xs font-semibold text-primary-500 hover:text-primary-600"
                    >
                      + Add Another Job
                    </button>
                  </div>

                  {/* Job Tabs */}
                  <div className="flex gap-2 overflow-x-auto pb-2">
                    {jobDetails.map((job, index) => (
                      <button
                        key={index}
                        onClick={() => setCurrentJobIndex(index)}
                        className={`px-4 py-2 rounded-lg text-sm font-semibold whitespace-nowrap transition-colors ${
                          currentJobIndex === index
                            ? "bg-primary-500 text-white"
                            : "bg-custom-100 text-custom-700 hover:bg-custom-200"
                        }`}
                      >
                        Job {index + 1}
                        {job.jobId && ` (${job.jobId})`}
                      </button>
                    ))}
                  </div>

                  {/* Current Job Form */}
                  <div className="p-4 rounded-xl bg-custom-50 space-y-4">
                    <div className="flex items-center justify-between">
                      <h5 className="text-sm font-bold text-secondary-100">
                        Job {currentJobIndex + 1} Details
                      </h5>
                      {jobDetails.length > 1 && (
                        <button
                          onClick={() => removeJobDetail(currentJobIndex)}
                          className="text-xs font-semibold text-red-600 hover:text-red-700"
                        >
                          Remove Job
                        </button>
                      )}
                    </div>

                    <div className="grid grid-cols-2 gap-4">
                      <div>
                        <label className="block text-sm font-semibold text-custom-700 mb-2">
                          Job ID *
                        </label>
                        <input
                          type="text"
                          value={jobDetails[currentJobIndex].jobId}
                          onChange={(e) =>
                            updateJobDetail(currentJobIndex, "jobId", e.target.value)
                          }
                          placeholder="JOB-001"
                          readOnly={!!jobDetails[currentJobIndex].jobId}
                          className={`w-full px-4 py-2 rounded-xl border border-custom-300 focus:outline-none focus:border-primary-500 ${
                            jobDetails[currentJobIndex].jobId
                              ? "bg-custom-100 cursor-not-allowed"
                              : ""
                          }`}
                        />
                        {!jobDetails[currentJobIndex].jobId && (
                          <p className="text-xs text-custom-700 mt-1">
                            💡 Tip: Use "Add Another Job" button above to select from your assigned jobs
                          </p>
                        )}
                      </div>
                      <div>
                        <label className="block text-sm font-semibold text-custom-700 mb-2">
                          Job Title *
                        </label>
                        <input
                          type="text"
                          value={jobDetails[currentJobIndex].jobTitle}
                          onChange={(e) =>
                            updateJobDetail(currentJobIndex, "jobTitle", e.target.value)
                          }
                          placeholder="Business Cards Printing"
                          readOnly={!!jobDetails[currentJobIndex].jobId}
                          className={`w-full px-4 py-2 rounded-xl border border-custom-300 focus:outline-none focus:border-primary-500 ${
                            jobDetails[currentJobIndex].jobId
                              ? "bg-custom-100 cursor-not-allowed"
                              : ""
                          }`}
                        />
                      </div>
                    </div>

                    <div className="grid grid-cols-3 gap-4">
                      <div>
                        <label className="block text-sm font-semibold text-custom-700 mb-2">
                          Start Time *
                        </label>
                        <input
                          type="time"
                          value={jobDetails[currentJobIndex].startTime}
                          onChange={(e) =>
                            updateJobDetail(currentJobIndex, "startTime", e.target.value)
                          }
                          className="w-full px-4 py-2 rounded-xl border border-custom-300 focus:outline-none focus:border-primary-500"
                        />
                      </div>
                      <div>
                        <label className="block text-sm font-semibold text-custom-700 mb-2">
                          End Time *
                        </label>
                        <input
                          type="time"
                          value={jobDetails[currentJobIndex].endTime}
                          onChange={(e) =>
                            updateJobDetail(currentJobIndex, "endTime", e.target.value)
                          }
                          className="w-full px-4 py-2 rounded-xl border border-custom-300 focus:outline-none focus:border-primary-500"
                        />
                      </div>
                      <div>
                        <label className="block text-sm font-semibold text-custom-700 mb-2">
                          Duration (hours)
                        </label>
                        <input
                          type="text"
                          value={jobDetails[currentJobIndex].duration || "0"}
                          readOnly
                          className="w-full px-4 py-2 rounded-xl border border-custom-300 bg-custom-100 text-custom-700"
                        />
                      </div>
                    </div>

                    {/* Tools Used */}
                    <div>
                      <label className="block text-sm font-semibold text-custom-700 mb-2">
                        Tools Used
                      </label>
                      <div className="flex gap-2 mb-2">
                        <input
                          type="text"
                          value={toolInput}
                          onChange={(e) => setToolInput(e.target.value)}
                          onKeyPress={(e) => e.key === "Enter" && (e.preventDefault(), addTool())}
                          placeholder="e.g., Digital Printer HP-500"
                          className="flex-1 px-4 py-2 rounded-xl border border-custom-300 focus:outline-none focus:border-primary-500"
                        />
                        <button
                          onClick={addTool}
                          className="px-4 py-2 rounded-xl bg-primary-500 text-white hover:bg-primary-600 transition-colors text-sm font-semibold"
                        >
                          Add
                        </button>
                      </div>
                      <div className="flex flex-wrap gap-2">
                        {jobDetails[currentJobIndex].toolsUsed.map((tool, idx) => (
                          <span
                            key={idx}
                            className="px-3 py-1 rounded-lg bg-blue-100 text-blue-700 text-sm flex items-center gap-2"
                          >
                            {tool}
                            <button
                              onClick={() => removeTool(idx)}
                              className="text-blue-700 hover:text-blue-900"
                            >
                              <HiOutlineX className="w-3 h-3" />
                            </button>
                          </span>
                        ))}
                      </div>
                    </div>

                    {/* Materials Used */}
                    <div>
                      <label className="block text-sm font-semibold text-custom-700 mb-2">
                        Materials Used
                      </label>
                      <div className="grid grid-cols-12 gap-2 mb-2">
                        <input
                          type="text"
                          value={materialInput.name}
                          onChange={(e) =>
                            setMaterialInput({ ...materialInput, name: e.target.value })
                          }
                          placeholder="Material name"
                          className="col-span-5 px-4 py-2 rounded-xl border border-custom-300 focus:outline-none focus:border-primary-500"
                        />
                        <input
                          type="text"
                          value={materialInput.quantity}
                          onChange={(e) =>
                            setMaterialInput({
                              ...materialInput,
                              quantity: e.target.value,
                            })
                          }
                          placeholder="Qty"
                          className="col-span-3 px-4 py-2 rounded-xl border border-custom-300 focus:outline-none focus:border-primary-500"
                        />
                        <input
                          type="text"
                          value={materialInput.unit}
                          onChange={(e) =>
                            setMaterialInput({ ...materialInput, unit: e.target.value })
                          }
                          placeholder="Unit"
                          className="col-span-2 px-4 py-2 rounded-xl border border-custom-300 focus:outline-none focus:border-primary-500"
                        />
                        <button
                          onClick={addMaterial}
                          className="col-span-2 px-4 py-2 rounded-xl bg-primary-500 text-white hover:bg-primary-600 transition-colors text-sm font-semibold"
                        >
                          Add
                        </button>
                      </div>
                      <div className="space-y-2">
                        {jobDetails[currentJobIndex].materialsUsed.map((material, idx) => (
                          <div
                            key={idx}
                            className="flex items-center justify-between p-2 rounded-lg bg-green-50 border border-green-200"
                          >
                            <span className="text-sm text-green-700">
                              <strong>{material.name}</strong> - {material.quantity}{" "}
                              {material.unit}
                            </span>
                            <button
                              onClick={() => removeMaterial(idx)}
                              className="text-green-700 hover:text-green-900"
                            >
                              <HiOutlineX className="w-4 h-4" />
                            </button>
                          </div>
                        ))}
                      </div>
                    </div>

                    {/* Job Notes */}
                    <div>
                      <label className="block text-sm font-semibold text-custom-700 mb-2">
                        Job Notes (Optional)
                      </label>
                      <textarea
                        value={jobDetails[currentJobIndex].notes}
                        onChange={(e) =>
                          updateJobDetail(currentJobIndex, "notes", e.target.value)
                        }
                        placeholder="Any specific notes about this job..."
                        rows={2}
                        className="w-full px-4 py-2 rounded-xl border border-custom-300 focus:outline-none focus:border-primary-500 resize-none"
                      />
                    </div>
                  </div>
                </div>

                {/* Overall Summary */}
                <div className="space-y-4">
                  <h4 className="text-sm font-bold text-secondary-100 uppercase tracking-wide">
                    Overall Summary
                  </h4>
                  <div>
                    <label className="block text-sm font-semibold text-custom-700 mb-2">
                      Work Description *
                    </label>
                    <textarea
                      value={formData.description}
                      onChange={(e) =>
                        setFormData({ ...formData, description: e.target.value })
                      }
                      placeholder="Describe what you accomplished today..."
                      rows={3}
                      className="w-full px-4 py-2 rounded-xl border border-custom-300 focus:outline-none focus:border-primary-500 resize-none"
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-semibold text-custom-700 mb-2">
                      Issues/Notes (Optional)
                    </label>
                    <textarea
                      value={formData.issues}
                      onChange={(e) =>
                        setFormData({ ...formData, issues: e.target.value })
                      }
                      placeholder="Any issues, delays, or important notes..."
                      rows={2}
                      className="w-full px-4 py-2 rounded-xl border border-custom-300 focus:outline-none focus:border-primary-500 resize-none"
                    />
                  </div>
                </div>
              </div>

              <div className="flex gap-3 mt-6">
                <button
                  onClick={() => setShowCreateModal(false)}
                  className="flex-1 px-4 py-2 rounded-xl border border-custom-300 hover:bg-custom-100 transition-colors text-sm font-semibold text-custom-700"
                >
                  Cancel
                </button>
                <button
                  onClick={handleCreateReport}
                  disabled={
                    !formData.title ||
                    !formData.date ||
                    !formData.description ||
                    jobDetails.every((job) => !job.jobId || !job.jobTitle)
                  }
                  className="flex-1 px-4 py-2 rounded-xl bg-primary-500 text-white hover:bg-primary-600 transition-colors text-sm font-semibold disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  Create Report
                </button>
              </div>
            </Card>
          </div>
        )}

        {/* View Report Modal */}
        {showViewModal && selectedReport && (
          <div className="fixed inset-0 bg-secondary-100/50 z-50 flex items-center justify-center p-4">
            <Card className="!p-6 max-w-4xl w-full max-h-[90vh] overflow-y-auto">
              <div className="flex items-start justify-between mb-4">
                <div>
                  <h3 className="text-xl font-bold text-secondary-100">
                    {selectedReport.title}
                  </h3>
                  <span
                    className={`inline-block mt-2 text-xs font-bold px-3 py-1 rounded-full ${
                      statusConfig[selectedReport.status].bgColor
                    } ${statusConfig[selectedReport.status].color}`}
                  >
                    {statusConfig[selectedReport.status].label}
                  </span>
                </div>
                <button
                  onClick={() => setShowViewModal(false)}
                  className="text-custom-700 hover:text-secondary-100 text-2xl"
                >
                  <HiOutlineX className="w-6 h-6" />
                </button>
              </div>

              <div className="space-y-6">
                {/* Basic Info */}
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <p className="text-sm font-semibold text-custom-700 mb-1">Date</p>
                    <p className="text-base text-secondary-100">{selectedReport.date}</p>
                  </div>
                  <div>
                    <p className="text-sm font-semibold text-custom-700 mb-1">
                      Total Hours Worked
                    </p>
                    <p className="text-base text-secondary-100">
                      {selectedReport.totalHoursWorked}h
                    </p>
                  </div>
                </div>

                {/* Jobs Completed */}
                <div>
                  <p className="text-sm font-semibold text-custom-700 mb-3">
                    Jobs Completed ({selectedReport.jobsCompleted.length})
                  </p>
                  <div className="space-y-4">
                    {selectedReport.jobsCompleted.map((job, idx) => (
                      <div
                        key={idx}
                        className="p-4 rounded-xl bg-custom-50 border border-custom-200"
                      >
                        <div className="flex items-start justify-between mb-3">
                          <div>
                            <h4 className="text-base font-bold text-secondary-100">
                              {job.jobTitle}
                            </h4>
                            <p className="text-sm text-custom-700">{job.jobId}</p>
                          </div>
                          <span className="px-3 py-1 rounded-lg bg-primary-100 text-primary-700 text-sm font-semibold">
                            {job.duration}h
                          </span>
                        </div>

                        <div className="grid grid-cols-2 gap-4 mb-3">
                          <div>
                            <p className="text-xs font-semibold text-custom-700 mb-1">
                              Start Time
                            </p>
                            <p className="text-sm text-secondary-100">{job.startTime}</p>
                          </div>
                          <div>
                            <p className="text-xs font-semibold text-custom-700 mb-1">
                              End Time
                            </p>
                            <p className="text-sm text-secondary-100">{job.endTime}</p>
                          </div>
                        </div>

                        {job.toolsUsed.length > 0 && (
                          <div className="mb-3">
                            <p className="text-xs font-semibold text-custom-700 mb-2">
                              Tools Used
                            </p>
                            <div className="flex flex-wrap gap-2">
                              {job.toolsUsed.map((tool, toolIdx) => (
                                <span
                                  key={toolIdx}
                                  className="px-3 py-1 rounded-lg bg-blue-100 text-blue-700 text-xs font-semibold"
                                >
                                  {tool}
                                </span>
                              ))}
                            </div>
                          </div>
                        )}

                        {job.materialsUsed.length > 0 && (
                          <div className="mb-3">
                            <p className="text-xs font-semibold text-custom-700 mb-2">
                              Materials Used
                            </p>
                            <div className="space-y-1">
                              {job.materialsUsed.map((material, matIdx) => (
                                <div
                                  key={matIdx}
                                  className="text-xs text-secondary-100 bg-green-50 px-3 py-1 rounded-lg border border-green-200"
                                >
                                  <strong>{material.name}</strong> - {material.quantity}{" "}
                                  {material.unit}
                                </div>
                              ))}
                            </div>
                          </div>
                        )}

                        {job.notes && (
                          <div>
                            <p className="text-xs font-semibold text-custom-700 mb-1">
                              Notes
                            </p>
                            <p className="text-sm text-secondary-100">{job.notes}</p>
                          </div>
                        )}
                      </div>
                    ))}
                  </div>
                </div>

                {/* Overall Description */}
                <div>
                  <p className="text-sm font-semibold text-custom-700 mb-1">
                    Work Description
                  </p>
                  <p className="text-base text-secondary-100">
                    {selectedReport.description}
                  </p>
                </div>

                {selectedReport.issues && (
                  <div>
                    <p className="text-sm font-semibold text-custom-700 mb-1">
                      Issues/Notes
                    </p>
                    <p className="text-base text-secondary-100">{selectedReport.issues}</p>
                  </div>
                )}

                {selectedReport.submittedAt && (
                  <div>
                    <p className="text-sm font-semibold text-custom-700 mb-1">
                      Submitted At
                    </p>
                    <p className="text-base text-secondary-100">
                      {new Date(selectedReport.submittedAt).toLocaleString()}
                    </p>
                  </div>
                )}

                {selectedReport.reviewedAt && (
                  <div>
                    <p className="text-sm font-semibold text-custom-700 mb-1">
                      Reviewed At
                    </p>
                    <p className="text-base text-secondary-100">
                      {new Date(selectedReport.reviewedAt).toLocaleString()} by{" "}
                      {selectedReport.reviewedBy}
                    </p>
                  </div>
                )}

                {selectedReport.status === "rejected" &&
                  selectedReport.rejectionReason && (
                    <div className="p-4 rounded-xl bg-red-50 border border-red-200">
                      <p className="text-sm font-semibold text-red-700 mb-1">
                        Rejection Reason
                      </p>
                      <p className="text-sm text-red-600">
                        {selectedReport.rejectionReason}
                      </p>
                    </div>
                  )}
              </div>

              <div className="flex gap-3 mt-6">
                {selectedReport.status === "draft" && (
                  <button
                    onClick={() => {
                      handleSubmitReport(selectedReport.id);
                      setShowViewModal(false);
                    }}
                    className="flex-1 px-4 py-2 rounded-xl bg-primary-500 text-white hover:bg-primary-600 transition-colors text-sm font-semibold"
                  >
                    Submit to Supervisor
                  </button>
                )}
                <button
                  onClick={() => setShowViewModal(false)}
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
