import { useState } from "react";
import {
  HiOutlineCheckCircle,
  HiOutlineDownload,
  HiOutlineFilter,
  HiOutlineSearch,
  HiOutlineX,
} from "react-icons/hi";
import { DashboardLayout } from "../../components";
import { Card } from "../../components/ui";

interface JobDetail {
  jobId: string;
  jobTitle: string;
  startTime: string;
  endTime: string;
  duration: number;
  toolsUsed: string[];
  materialsUsed: { name: string; quantity: string; unit: string }[];
  notes?: string;
}

interface Report {
  id: string;
  title: string;
  date: string;
  workerName: string;
  workerId: string;
  department: string;
  jobsCompleted: JobDetail[];
  totalHoursWorked: number;
  description: string;
  issues?: string;
  submittedAt: string;
  confirmedAt: string;
  confirmedBy: string;
}

const initialReports: Report[] = [
  {
    id: "RPT-001",
    title: "Daily Report - May 1, 2026",
    date: "2026-05-01",
    workerName: "John Worker",
    workerId: "W-001",
    department: "Printing",
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
        notes: "Quality check passed.",
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
    description:
      "Completed printing of business cards and packaging materials. All quality checks passed.",
    submittedAt: "2026-05-01T17:00:00",
    confirmedAt: "2026-05-01T18:00:00",
    confirmedBy: "Supervisor A",
  },
  {
    id: "RPT-005",
    title: "Daily Report - May 1, 2026",
    date: "2026-05-01",
    workerName: "Jane Smith",
    workerId: "W-002",
    department: "Design",
    jobsCompleted: [
      {
        jobId: "JOB-009",
        jobTitle: "Flyer Printing",
        startTime: "09:00",
        endTime: "17:00",
        duration: 8,
        toolsUsed: ["Offset Printer", "Paper Cutter"],
        materialsUsed: [
          { name: "Flyer Paper", quantity: "300", unit: "sheets" },
          { name: "Printing Ink", quantity: "2", unit: "liters" },
        ],
      },
    ],
    totalHoursWorked: 8,
    description: "Completed flyer printing. All 300 units delivered.",
    submittedAt: "2026-05-01T17:00:00",
    confirmedAt: "2026-05-01T18:30:00",
    confirmedBy: "Supervisor B",
  },
  {
    id: "RPT-006",
    title: "Daily Report - April 30, 2026",
    date: "2026-04-30",
    workerName: "Mike Johnson",
    workerId: "W-003",
    department: "Printing",
    jobsCompleted: [
      {
        jobId: "JOB-012",
        jobTitle: "Brochure Printing",
        startTime: "08:00",
        endTime: "12:30",
        duration: 4.5,
        toolsUsed: ["Digital Printer Canon-700", "Folding Machine"],
        materialsUsed: [
          { name: "Glossy Paper A4", quantity: "500", unit: "sheets" },
        ],
      },
      {
        jobId: "JOB-015",
        jobTitle: "Banner Production",
        startTime: "13:00",
        endTime: "16:00",
        duration: 3,
        toolsUsed: ["Large Format Printer", "Cutting Table"],
        materialsUsed: [
          { name: "Banner Vinyl", quantity: "20", unit: "meters" },
          { name: "Eco-Solvent Ink", quantity: "1", unit: "liter" },
        ],
      },
    ],
    totalHoursWorked: 7.5,
    description: "Completed brochure printing and banner production.",
    submittedAt: "2026-04-30T16:30:00",
    confirmedAt: "2026-04-30T17:00:00",
    confirmedBy: "Supervisor A",
  },
  {
    id: "RPT-007",
    title: "Daily Report - April 29, 2026",
    date: "2026-04-29",
    workerName: "Sarah Lee",
    workerId: "W-004",
    department: "Design",
    jobsCompleted: [
      {
        jobId: "JOB-020",
        jobTitle: "Logo Design & Mockups",
        startTime: "09:00",
        endTime: "17:00",
        duration: 8,
        toolsUsed: ["Design Workstation", "Color Printer"],
        materialsUsed: [
          { name: "Presentation Paper", quantity: "50", unit: "sheets" },
        ],
        notes: "Client presentation materials prepared.",
      },
    ],
    totalHoursWorked: 8,
    description: "Completed logo design and mockups for client presentation.",
    submittedAt: "2026-04-29T17:00:00",
    confirmedAt: "2026-04-29T17:30:00",
    confirmedBy: "Supervisor B",
  },
];

export default function AdminViewReportsPage() {
  const [reports] = useState<Report[]>(initialReports);
  const [selectedReport, setSelectedReport] = useState<Report | null>(null);
  const [showViewModal, setShowViewModal] = useState(false);
  const [showFilterModal, setShowFilterModal] = useState(false);
  const [searchQuery, setSearchQuery] = useState("");
  const [filters, setFilters] = useState({
    department: "all",
    worker: "all",
    dateFrom: "",
    dateTo: "",
  });

  // Get unique departments and workers for filter dropdowns
  const departments = ["all", ...Array.from(new Set(reports.map((r) => r.department)))];
  const workers = [
    "all",
    ...Array.from(new Set(reports.map((r) => `${r.workerName} (${r.workerId})`))),
  ];

  // Filter reports
  const filteredReports = reports.filter((report) => {
    const matchesSearch =
      searchQuery === "" ||
      report.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
      report.workerName.toLowerCase().includes(searchQuery.toLowerCase()) ||
      report.id.toLowerCase().includes(searchQuery.toLowerCase());

    const matchesDepartment =
      filters.department === "all" || report.department === filters.department;

    const matchesWorker =
      filters.worker === "all" ||
      filters.worker === `${report.workerName} (${report.workerId})`;

    const matchesDateFrom =
      !filters.dateFrom || new Date(report.date) >= new Date(filters.dateFrom);

    const matchesDateTo =
      !filters.dateTo || new Date(report.date) <= new Date(filters.dateTo);

    return (
      matchesSearch &&
      matchesDepartment &&
      matchesWorker &&
      matchesDateFrom &&
      matchesDateTo
    );
  });

  const handleDownloadReport = (report: Report) => {
    // Create a detailed text-based report
    const jobsSection = report.jobsCompleted
      .map(
        (job, idx) => `
JOB ${idx + 1}: ${job.jobTitle} (${job.jobId})
${"=".repeat(50)}
Time: ${job.startTime} - ${job.endTime} (${job.duration}h)

Tools Used:
${job.toolsUsed.map((tool) => `  • ${tool}`).join("\n") || "  None"}

Materials Used:
${
  job.materialsUsed.map((mat) => `  • ${mat.name}: ${mat.quantity} ${mat.unit}`).join("\n") ||
  "  None"
}
${job.notes ? `\nNotes: ${job.notes}` : ""}
`
      )
      .join("\n");

    const reportContent = `
JOB TRACKING SYSTEM - WORKER REPORT
${"=".repeat(70)}

Report ID: ${report.id}
Title: ${report.title}
Date: ${report.date}

WORKER INFORMATION
${"-".repeat(70)}
Name: ${report.workerName}
ID: ${report.workerId}
Department: ${report.department}

WORK SUMMARY
${"-".repeat(70)}
Total Hours Worked: ${report.totalHoursWorked}h
Jobs Completed: ${report.jobsCompleted.length}

DETAILED JOB BREAKDOWN
${"-".repeat(70)}
${jobsSection}

OVERALL DESCRIPTION
${"-".repeat(70)}
${report.description}

${report.issues ? `ISSUES/NOTES\n${"-".repeat(70)}\n${report.issues}\n` : ""}
APPROVAL INFORMATION
${"-".repeat(70)}
Submitted: ${new Date(report.submittedAt).toLocaleString()}
Confirmed: ${new Date(report.confirmedAt).toLocaleString()}
Confirmed By: ${report.confirmedBy}

${"=".repeat(70)}
Generated: ${new Date().toLocaleString()}
    `.trim();

    // Create a blob and download
    const blob = new Blob([reportContent], { type: "text/plain" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = `${report.id}_${report.workerName.replace(/\s+/g, "_")}_${report.date}.txt`;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
  };

  const handleDownloadAll = () => {
    // Download all filtered reports as a single file
    const allReportsContent = filteredReports
      .map(
        (report) => {
          const jobsSection = report.jobsCompleted
            .map(
              (job, idx) => `
  Job ${idx + 1}: ${job.jobTitle} (${job.jobId})
  Time: ${job.startTime} - ${job.endTime} (${job.duration}h)
  Tools: ${job.toolsUsed.join(", ") || "None"}
  Materials: ${
    job.materialsUsed.map((m) => `${m.name} (${m.quantity} ${m.unit})`).join(", ") || "None"
  }
  ${job.notes ? `Notes: ${job.notes}` : ""}
`
            )
            .join("\n");

          return `
${"=".repeat(70)}
Report ID: ${report.id}
Title: ${report.title}
Date: ${report.date}
Worker: ${report.workerName} (${report.workerId})
Department: ${report.department}
Total Hours Worked: ${report.totalHoursWorked}h

Jobs Completed (${report.jobsCompleted.length}):
${jobsSection}

Description:
${report.description}

${report.issues ? `Issues/Notes:\n${report.issues}\n` : ""}
Confirmed: ${new Date(report.confirmedAt).toLocaleString()} by ${report.confirmedBy}
${"=".repeat(70)}
    `.trim();
        }
      )
      .join("\n\n");

    const header = `JOB TRACKING SYSTEM - WORKER REPORTS SUMMARY
${"=".repeat(70)}
Generated: ${new Date().toLocaleString()}
Total Reports: ${filteredReports.length}
Total Hours: ${filteredReports.reduce((sum, r) => sum + r.totalHoursWorked, 0)}h
Total Jobs: ${filteredReports.reduce((sum, r) => sum + r.jobsCompleted.length, 0)}
${"=".repeat(70)}

`;

    const blob = new Blob([header + allReportsContent], { type: "text/plain" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = `All_Reports_${new Date().toISOString().split("T")[0]}.txt`;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
  };

  const handleResetFilters = () => {
    setFilters({
      department: "all",
      worker: "all",
      dateFrom: "",
      dateTo: "",
    });
  };

  const activeFilterCount =
    (filters.department !== "all" ? 1 : 0) +
    (filters.worker !== "all" ? 1 : 0) +
    (filters.dateFrom ? 1 : 0) +
    (filters.dateTo ? 1 : 0);

  return (
    <DashboardLayout userRole="admin" userName="Admin" notificationCount={0}>
      <div className="space-y-6 font-[family-name:var(--font-family-primary)]">
        {/* Header */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
          <div>
            <h1 className="text-2xl md:text-3xl font-bold text-secondary-100">
              Worker Reports
            </h1>
            <p className="text-sm text-custom-700 mt-1">
              View and download confirmed worker reports
            </p>
          </div>
          <button
            onClick={handleDownloadAll}
            disabled={filteredReports.length === 0}
            className="flex items-center gap-2 px-4 py-2 rounded-xl bg-primary-500 text-white hover:bg-primary-600 transition-colors self-start sm:self-auto disabled:opacity-50 disabled:cursor-not-allowed"
          >
            <HiOutlineDownload className="w-4 h-4" />
            <span className="text-sm font-semibold">Download All</span>
          </button>
        </div>

        {/* Search and Filter Bar */}
        <div className="flex flex-col sm:flex-row gap-3">
          <div className="flex-1 relative">
            <HiOutlineSearch className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-custom-700" />
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="Search by report ID, worker name, or title..."
              className="w-full pl-10 pr-4 py-2 rounded-xl border border-custom-300 focus:outline-none focus:border-primary-500"
            />
          </div>
          <button
            onClick={() => setShowFilterModal(true)}
            className="flex items-center gap-2 px-4 py-2 rounded-xl border border-custom-300 hover:bg-custom-100 transition-colors relative"
          >
            <HiOutlineFilter className="w-4 h-4" />
            <span className="text-sm font-semibold">Filters</span>
            {activeFilterCount > 0 && (
              <span className="absolute -top-1 -right-1 w-5 h-5 rounded-full bg-primary-500 text-white text-xs flex items-center justify-center font-bold">
                {activeFilterCount}
              </span>
            )}
          </button>
        </div>

        {/* Active Filters Display */}
        {activeFilterCount > 0 && (
          <div className="flex flex-wrap items-center gap-2">
            <span className="text-sm text-custom-700">Active filters:</span>
            {filters.department !== "all" && (
              <span className="px-3 py-1 rounded-full bg-primary-100 text-primary-700 text-xs font-semibold">
                Department: {filters.department}
              </span>
            )}
            {filters.worker !== "all" && (
              <span className="px-3 py-1 rounded-full bg-primary-100 text-primary-700 text-xs font-semibold">
                Worker: {filters.worker}
              </span>
            )}
            {filters.dateFrom && (
              <span className="px-3 py-1 rounded-full bg-primary-100 text-primary-700 text-xs font-semibold">
                From: {filters.dateFrom}
              </span>
            )}
            {filters.dateTo && (
              <span className="px-3 py-1 rounded-full bg-primary-100 text-primary-700 text-xs font-semibold">
                To: {filters.dateTo}
              </span>
            )}
            <button
              onClick={handleResetFilters}
              className="text-xs text-red-600 hover:text-red-700 font-semibold"
            >
              Clear all
            </button>
          </div>
        )}

        {/* Summary Stats */}
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
          <Card className="!p-4">
            <p className="text-xs text-custom-700 mb-1">Total Reports</p>
            <p className="text-2xl font-bold text-secondary-100">
              {filteredReports.length}
            </p>
          </Card>
          <Card className="!p-4">
            <p className="text-xs text-custom-700 mb-1">Total Hours</p>
            <p className="text-2xl font-bold text-secondary-100">
              {filteredReports.reduce((sum, r) => sum + r.totalHoursWorked, 0)}h
            </p>
          </Card>
          <Card className="!p-4">
            <p className="text-xs text-custom-700 mb-1">Jobs Completed</p>
            <p className="text-2xl font-bold text-secondary-100">
              {filteredReports.reduce((sum, r) => sum + r.jobsCompleted.length, 0)}
            </p>
          </Card>
          <Card className="!p-4">
            <p className="text-xs text-custom-700 mb-1">Workers</p>
            <p className="text-2xl font-bold text-secondary-100">
              {new Set(filteredReports.map((r) => r.workerId)).size}
            </p>
          </Card>
        </div>

        {/* Reports Table */}
        <Card className="!p-0 overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead className="bg-custom-100 border-b border-custom-300">
                <tr>
                  <th className="px-4 py-3 text-left text-xs font-bold text-secondary-100 uppercase tracking-wider">
                    Status
                  </th>
                  <th className="px-4 py-3 text-left text-xs font-bold text-secondary-100 uppercase tracking-wider">
                    Report ID
                  </th>
                  <th className="px-4 py-3 text-left text-xs font-bold text-secondary-100 uppercase tracking-wider">
                    Date
                  </th>
                  <th className="px-4 py-3 text-left text-xs font-bold text-secondary-100 uppercase tracking-wider">
                    Worker
                  </th>
                  <th className="px-4 py-3 text-left text-xs font-bold text-secondary-100 uppercase tracking-wider">
                    Department
                  </th>
                  <th className="px-4 py-3 text-left text-xs font-bold text-secondary-100 uppercase tracking-wider">
                    Jobs
                  </th>
                  <th className="px-4 py-3 text-left text-xs font-bold text-secondary-100 uppercase tracking-wider">
                    Hours
                  </th>
                  <th className="px-4 py-3 text-left text-xs font-bold text-secondary-100 uppercase tracking-wider">
                    Confirmed By
                  </th>
                  <th className="px-4 py-3 text-right text-xs font-bold text-secondary-100 uppercase tracking-wider">
                    Actions
                  </th>
                </tr>
              </thead>
              <tbody className="bg-white divide-y divide-custom-200">
                {filteredReports.length === 0 ? (
                  <tr>
                    <td colSpan={9} className="px-4 py-8 text-center text-custom-700">
                      No reports found matching your criteria
                    </td>
                  </tr>
                ) : (
                  filteredReports.map((report) => (
                    <tr
                      key={report.id}
                      className="hover:bg-custom-50 transition-colors"
                    >
                      <td className="px-4 py-4 whitespace-nowrap">
                        <div className="flex items-center">
                          <div className="w-8 h-8 rounded-lg bg-green-100 flex items-center justify-center">
                            <HiOutlineCheckCircle className="w-5 h-5 text-green-600" />
                          </div>
                        </div>
                      </td>
                      <td className="px-4 py-4 whitespace-nowrap">
                        <div className="text-sm font-bold text-primary-600">
                          {report.id}
                        </div>
                        <div className="text-xs text-custom-700 truncate max-w-[200px]">
                          {report.title}
                        </div>
                      </td>
                      <td className="px-4 py-4 whitespace-nowrap">
                        <div className="text-sm text-secondary-100">{report.date}</div>
                        <div className="text-xs text-custom-700">
                          {new Date(report.confirmedAt).toLocaleDateString()}
                        </div>
                      </td>
                      <td className="px-4 py-4 whitespace-nowrap">
                        <div className="text-sm font-semibold text-secondary-100">
                          {report.workerName}
                        </div>
                        <div className="text-xs text-custom-700">{report.workerId}</div>
                      </td>
                      <td className="px-4 py-4 whitespace-nowrap">
                        <span className="px-3 py-1 rounded-full bg-primary-100 text-primary-700 text-xs font-semibold">
                          {report.department}
                        </span>
                      </td>
                      <td className="px-4 py-4 whitespace-nowrap text-center">
                        <div className="text-sm font-bold text-secondary-100">
                          {report.jobsCompleted.length}
                        </div>
                      </td>
                      <td className="px-4 py-4 whitespace-nowrap text-center">
                        <div className="text-sm font-bold text-secondary-100">
                          {report.totalHoursWorked}h
                        </div>
                      </td>
                      <td className="px-4 py-4 whitespace-nowrap">
                        <div className="text-sm text-secondary-100">
                          {report.confirmedBy}
                        </div>
                      </td>
                      <td className="px-4 py-4 whitespace-nowrap text-right">
                        <div className="flex items-center justify-end gap-2">
                          <button
                            onClick={() => {
                              setSelectedReport(report);
                              setShowViewModal(true);
                            }}
                            className="p-2 rounded-lg border border-custom-300 hover:bg-custom-100 transition-colors text-custom-700 hover:text-secondary-100"
                            title="View Details"
                          >
                            <HiOutlineSearch className="w-4 h-4" />
                          </button>
                          <button
                            onClick={() => handleDownloadReport(report)}
                            className="p-2 rounded-lg bg-primary-500 text-white hover:bg-primary-600 transition-colors"
                            title="Download Report"
                          >
                            <HiOutlineDownload className="w-4 h-4" />
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

        {/* Filter Modal */}
        {showFilterModal && (
          <div className="fixed inset-0 bg-secondary-100/50 z-50 flex items-center justify-center p-4">
            <Card className="!p-6 max-w-md w-full">
              <div className="flex items-center justify-between mb-4">
                <h3 className="text-xl font-bold text-secondary-100">Filter Reports</h3>
                <button
                  onClick={() => setShowFilterModal(false)}
                  className="text-custom-700 hover:text-secondary-100 text-2xl"
                >
                  <HiOutlineX className="w-6 h-6" />
                </button>
              </div>

              <div className="space-y-4">
                <div>
                  <label className="block text-sm font-semibold text-custom-700 mb-2">
                    Department
                  </label>
                  <select
                    value={filters.department}
                    onChange={(e) =>
                      setFilters({ ...filters, department: e.target.value })
                    }
                    className="w-full px-4 py-2 rounded-xl border border-custom-300 focus:outline-none focus:border-primary-500"
                  >
                    {departments.map((dept) => (
                      <option key={dept} value={dept}>
                        {dept === "all" ? "All Departments" : dept}
                      </option>
                    ))}
                  </select>
                </div>

                <div>
                  <label className="block text-sm font-semibold text-custom-700 mb-2">
                    Worker
                  </label>
                  <select
                    value={filters.worker}
                    onChange={(e) => setFilters({ ...filters, worker: e.target.value })}
                    className="w-full px-4 py-2 rounded-xl border border-custom-300 focus:outline-none focus:border-primary-500"
                  >
                    {workers.map((worker) => (
                      <option key={worker} value={worker}>
                        {worker === "all" ? "All Workers" : worker}
                      </option>
                    ))}
                  </select>
                </div>

                <div>
                  <label className="block text-sm font-semibold text-custom-700 mb-2">
                    Date From
                  </label>
                  <input
                    type="date"
                    value={filters.dateFrom}
                    onChange={(e) =>
                      setFilters({ ...filters, dateFrom: e.target.value })
                    }
                    className="w-full px-4 py-2 rounded-xl border border-custom-300 focus:outline-none focus:border-primary-500"
                  />
                </div>

                <div>
                  <label className="block text-sm font-semibold text-custom-700 mb-2">
                    Date To
                  </label>
                  <input
                    type="date"
                    value={filters.dateTo}
                    onChange={(e) => setFilters({ ...filters, dateTo: e.target.value })}
                    className="w-full px-4 py-2 rounded-xl border border-custom-300 focus:outline-none focus:border-primary-500"
                  />
                </div>
              </div>

              <div className="flex gap-3 mt-6">
                <button
                  onClick={handleResetFilters}
                  className="flex-1 px-4 py-2 rounded-xl border border-custom-300 hover:bg-custom-100 transition-colors text-sm font-semibold text-custom-700"
                >
                  Reset
                </button>
                <button
                  onClick={() => setShowFilterModal(false)}
                  className="flex-1 px-4 py-2 rounded-xl bg-primary-500 text-white hover:bg-primary-600 transition-colors text-sm font-semibold"
                >
                  Apply Filters
                </button>
              </div>
            </Card>
          </div>
        )}

        {/* View Report Modal */}
        {showViewModal && selectedReport && (
          <div className="fixed inset-0 bg-secondary-100/50 z-50 flex items-center justify-center p-4">
            <Card className="!p-6 max-w-2xl w-full max-h-[90vh] overflow-y-auto">
              <div className="flex items-start justify-between mb-4">
                <div>
                  <h3 className="text-xl font-bold text-secondary-100">
                    {selectedReport.title}
                  </h3>
                  <p className="text-sm text-custom-700 mt-1">
                    Report ID: {selectedReport.id}
                  </p>
                  <span className="inline-block mt-2 text-xs font-bold px-3 py-1 rounded-full bg-green-100 text-green-600">
                    Confirmed
                  </span>
                </div>
                <button
                  onClick={() => setShowViewModal(false)}
                  className="text-custom-700 hover:text-secondary-100 text-2xl"
                >
                  <HiOutlineX className="w-6 h-6" />
                </button>
              </div>

              <div className="space-y-4">
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <p className="text-sm font-semibold text-custom-700 mb-1">Worker</p>
                    <p className="text-base text-secondary-100">
                      {selectedReport.workerName}
                    </p>
                    <p className="text-xs text-custom-700">{selectedReport.workerId}</p>
                  </div>
                  <div>
                    <p className="text-sm font-semibold text-custom-700 mb-1">
                      Department
                    </p>
                    <p className="text-base text-secondary-100">
                      {selectedReport.department}
                    </p>
                  </div>
                </div>

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

                <div>
                  <p className="text-sm font-semibold text-custom-700 mb-3">
                    Jobs Completed ({selectedReport.jobsCompleted.length})
                  </p>
                  <div className="space-y-3">
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
                    <p className="text-base text-secondary-100">
                      {selectedReport.issues}
                    </p>
                  </div>
                )}

                <div className="pt-4 border-t border-custom-300">
                  <p className="text-sm font-semibold text-custom-700 mb-2">
                    Approval Information
                  </p>
                  <div className="space-y-1 text-sm text-custom-700">
                    <p>
                      Submitted: {new Date(selectedReport.submittedAt).toLocaleString()}
                    </p>
                    <p>
                      Confirmed: {new Date(selectedReport.confirmedAt).toLocaleString()}
                    </p>
                    <p>Confirmed By: {selectedReport.confirmedBy}</p>
                  </div>
                </div>
              </div>

              <div className="flex gap-3 mt-6">
                <button
                  onClick={() => setShowViewModal(false)}
                  className="flex-1 px-4 py-2 rounded-xl border border-custom-300 hover:bg-custom-100 transition-colors text-sm font-semibold text-custom-700"
                >
                  Close
                </button>
                <button
                  onClick={() => handleDownloadReport(selectedReport)}
                  className="flex-1 px-4 py-2 rounded-xl bg-primary-500 text-white hover:bg-primary-600 transition-colors text-sm font-semibold"
                >
                  <HiOutlineDownload className="w-4 h-4 inline mr-2" />
                  Download Report
                </button>
              </div>
            </Card>
          </div>
        )}
      </div>
    </DashboardLayout>
  );
}
