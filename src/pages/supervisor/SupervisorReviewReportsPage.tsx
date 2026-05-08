import { useState } from "react";
import {
    HiOutlineCheckCircle,
    HiOutlineClock,
    HiOutlineX,
    HiOutlineXCircle
} from "react-icons/hi";
import { DashboardLayout } from "../../components";
import { Card } from "../../components/ui";

type ReportStatus = "submitted" | "confirmed" | "rejected";

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
  jobsCompleted: JobDetail[];
  totalHoursWorked: number;
  description: string;
  issues?: string;
  status: ReportStatus;
  submittedAt: string;
  reviewedAt?: string;
  rejectionReason?: string;
}

const initialReports: Report[] = [
  {
    id: "RPT-002",
    title: "Daily Report - May 2, 2026",
    date: "2026-05-02",
    workerName: "John Worker",
    workerId: "W-001",
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
        ],
      },
    ],
    totalHoursWorked: 6,
    description: "Working on brochure printing. Progress at 65%.",
    status: "submitted",
    submittedAt: "2026-05-02T16:00:00",
  },
  {
    id: "RPT-004",
    title: "Daily Report - May 2, 2026",
    date: "2026-05-02",
    workerName: "Jane Smith",
    workerId: "W-002",
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
    status: "submitted",
    submittedAt: "2026-05-02T17:00:00",
  },
  {
    id: "RPT-001",
    title: "Daily Report - May 1, 2026",
    date: "2026-05-01",
    workerName: "John Worker",
    workerId: "W-001",
    jobsCompleted: [
      {
        jobId: "JOB-003",
        jobTitle: "Business Cards Printing",
        startTime: "08:00",
        endTime: "12:00",
        duration: 4,
        toolsUsed: ["Digital Printer HP-500", "Laminator"],
        materialsUsed: [
          { name: "Cardstock Paper", quantity: "500", unit: "sheets" },
        ],
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
        ],
      },
    ],
    totalHoursWorked: 8,
    description:
      "Completed printing of business cards and packaging materials. All quality checks passed.",
    status: "confirmed",
    submittedAt: "2026-05-01T17:00:00",
    reviewedAt: "2026-05-01T18:00:00",
  },
];

const statusConfig: Record<
  ReportStatus,
  { label: string; color: string; icon: any; bgColor: string }
> = {
  submitted: {
    label: "Pending Review",
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

export default function SupervisorReviewReportsPage() {
  const [reports, setReports] = useState<Report[]>(initialReports);
  const [selectedReport, setSelectedReport] = useState<Report | null>(null);
  const [showReviewModal, setShowReviewModal] = useState(false);
  const [rejectionReason, setRejectionReason] = useState("");
  const [filter, setFilter] = useState<"all" | ReportStatus>("all");

  const pendingCount = reports.filter((r) => r.status === "submitted").length;

  const filteredReports =
    filter === "all" ? reports : reports.filter((r) => r.status === filter);

  const handleConfirm = (reportId: string) => {
    setReports(
      reports.map((r) =>
        r.id === reportId
          ? {
              ...r,
              status: "confirmed" as ReportStatus,
              reviewedAt: new Date().toISOString(),
            }
          : r
      )
    );
    setShowReviewModal(false);
    setSelectedReport(null);
  };

  const handleReject = (reportId: string) => {
    if (!rejectionReason.trim()) {
      alert("Please provide a rejection reason");
      return;
    }

    setReports(
      reports.map((r) =>
        r.id === reportId
          ? {
              ...r,
              status: "rejected" as ReportStatus,
              reviewedAt: new Date().toISOString(),
              rejectionReason: rejectionReason,
            }
          : r
      )
    );
    setShowReviewModal(false);
    setSelectedReport(null);
    setRejectionReason("");
  };

  return (
    <DashboardLayout
      userRole="supervisor"
      userName="Supervisor"
      notificationCount={pendingCount}
    >
      <div className="space-y-6 font-[family-name:var(--font-family-primary)]">
        {/* Header */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
          <div>
            <h1 className="text-2xl md:text-3xl font-bold text-secondary-100">
              Review Worker Reports
            </h1>
            <p className="text-sm text-custom-700 mt-1">
              {pendingCount > 0
                ? `${pendingCount} report${pendingCount > 1 ? "s" : ""} pending review`
                : "All reports reviewed"}
            </p>
          </div>
        </div>

        {/* Filter Tabs */}
        <div className="flex gap-2 overflow-x-auto">
          <button
            onClick={() => setFilter("all")}
            className={`px-4 py-2 rounded-xl transition-colors text-sm font-semibold whitespace-nowrap ${
              filter === "all"
                ? "bg-primary-500 text-white"
                : "border border-custom-300 text-custom-700 hover:bg-custom-100"
            }`}
          >
            All ({reports.length})
          </button>
          <button
            onClick={() => setFilter("submitted")}
            className={`px-4 py-2 rounded-xl transition-colors text-sm font-semibold whitespace-nowrap ${
              filter === "submitted"
                ? "bg-primary-500 text-white"
                : "border border-custom-300 text-custom-700 hover:bg-custom-100"
            }`}
          >
            Pending ({pendingCount})
          </button>
          <button
            onClick={() => setFilter("confirmed")}
            className={`px-4 py-2 rounded-xl transition-colors text-sm font-semibold whitespace-nowrap ${
              filter === "confirmed"
                ? "bg-primary-500 text-white"
                : "border border-custom-300 text-custom-700 hover:bg-custom-100"
            }`}
          >
            Confirmed ({reports.filter((r) => r.status === "confirmed").length})
          </button>
        </div>

        {/* Reports List */}
        <Card className="!p-0 overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead className="bg-custom-100 border-b border-custom-300">
                <tr>
                  <th className="px-4 py-3 text-left text-xs font-bold text-secondary-100 uppercase">
                    Report ID
                  </th>
                  <th className="px-4 py-3 text-left text-xs font-bold text-secondary-100 uppercase">
                    Title & Worker
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
                {filteredReports.length === 0 ? (
                  <tr>
                    <td colSpan={7} className="px-4 py-8 text-center text-custom-700">
                      No reports found
                    </td>
                  </tr>
                ) : (
                  filteredReports.map((report) => {
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
                            <p className="text-xs text-custom-700">
                              {report.workerName} • {report.date}
                            </p>
                          </div>
                        </td>
                        <td className="px-4 py-4">
                          <span className="text-sm font-bold text-secondary-100">
                            {report.jobsCompleted.length}
                          </span>
                        </td>
                        <td className="px-4 py-4">
                          <span className="text-sm font-bold text-secondary-100">
                            {report.totalHoursWorked}h
                          </span>
                        </td>
                        <td className="px-4 py-4">
                          <div className="flex items-center gap-2">
                            <Icon className={`w-4 h-4 ${config.color}`} />
                            <span
                              className={`text-xs font-bold px-3 py-1 rounded-full ${config.bgColor} ${config.color}`}
                            >
                              {config.label}
                            </span>
                          </div>
                        </td>
                        <td className="px-4 py-4">
                          <span className="text-sm text-custom-700">
                            {new Date(report.submittedAt).toLocaleDateString()}
                          </span>
                        </td>
                        <td className="px-4 py-4">
                          <div className="flex items-center justify-end gap-2">
                            {report.status === "submitted" ? (
                              <>
                                <button
                                  onClick={(e) => {
                                    e.stopPropagation();
                                    handleConfirm(report.id);
                                  }}
                                  className="px-3 py-1.5 rounded-lg bg-green-500 text-white hover:bg-green-600 transition-colors text-xs font-semibold"
                                >
                                  <HiOutlineCheckCircle className="w-3 h-3 inline mr-1" />
                                  Confirm
                                </button>
                                <button
                                  onClick={(e) => {
                                    e.stopPropagation();
                                    setSelectedReport(report);
                                    setShowReviewModal(true);
                                  }}
                                  className="px-3 py-1.5 rounded-lg border border-red-300 text-red-600 hover:bg-red-50 transition-colors text-xs font-semibold"
                                >
                                  <HiOutlineXCircle className="w-3 h-3 inline mr-1" />
                                  Reject
                                </button>
                              </>
                            ) : (
                              <button
                                onClick={() => {
                                  setSelectedReport(report);
                                  setShowReviewModal(true);
                                }}
                                className="px-3 py-1.5 rounded-lg border border-custom-300 text-custom-700 hover:bg-custom-100 transition-colors text-xs font-semibold"
                              >
                                View Details
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

        {/* Review Modal */}
        {showReviewModal && selectedReport && (
          <div className="fixed inset-0 bg-secondary-100/50 z-50 flex items-center justify-center p-4">
            <Card className="!p-6 max-w-2xl w-full max-h-[90vh] overflow-y-auto">
              <div className="flex items-start justify-between mb-4">
                <div>
                  <h3 className="text-xl font-bold text-secondary-100">
                    {selectedReport.title}
                  </h3>
                  <p className="text-sm text-custom-700 mt-1">
                    By {selectedReport.workerName}
                  </p>
                  <span
                    className={`inline-block mt-2 text-xs font-bold px-3 py-1 rounded-full ${
                      statusConfig[selectedReport.status].bgColor
                    } ${statusConfig[selectedReport.status].color}`}
                  >
                    {statusConfig[selectedReport.status].label}
                  </span>
                </div>
                <button
                  onClick={() => {
                    setShowReviewModal(false);
                    setRejectionReason("");
                  }}
                  className="text-custom-700 hover:text-secondary-100 text-2xl"
                >
                  <HiOutlineX className="w-6 h-6" />
                </button>
              </div>

              <div className="space-y-4">
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
                        className="p-3 rounded-xl bg-custom-50 border border-custom-200"
                      >
                        <div className="flex items-start justify-between mb-2">
                          <div>
                            <h4 className="text-sm font-bold text-secondary-100">
                              {job.jobTitle}
                            </h4>
                            <p className="text-xs text-custom-700">{job.jobId}</p>
                          </div>
                          <span className="px-2 py-1 rounded-lg bg-primary-100 text-primary-700 text-xs font-semibold">
                            {job.duration}h
                          </span>
                        </div>

                        <div className="grid grid-cols-2 gap-3 mb-2 text-xs">
                          <div>
                            <span className="text-custom-700">Start: </span>
                            <span className="text-secondary-100 font-semibold">
                              {job.startTime}
                            </span>
                          </div>
                          <div>
                            <span className="text-custom-700">End: </span>
                            <span className="text-secondary-100 font-semibold">
                              {job.endTime}
                            </span>
                          </div>
                        </div>

                        {job.toolsUsed.length > 0 && (
                          <div className="mb-2">
                            <p className="text-xs font-semibold text-custom-700 mb-1">
                              Tools: {job.toolsUsed.join(", ")}
                            </p>
                          </div>
                        )}

                        {job.materialsUsed.length > 0 && (
                          <div className="mb-2">
                            <p className="text-xs font-semibold text-custom-700 mb-1">
                              Materials:
                            </p>
                            <div className="text-xs text-secondary-100">
                              {job.materialsUsed.map((mat, matIdx) => (
                                <div key={matIdx}>
                                  • {mat.name}: {mat.quantity} {mat.unit}
                                </div>
                              ))}
                            </div>
                          </div>
                        )}

                        {job.notes && (
                          <div className="text-xs text-custom-700 italic">
                            Note: {job.notes}
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
                    <p className="text-base text-secondary-100">{selectedReport.issues}</p>
                  </div>
                )}

                {selectedReport.status === "submitted" && (
                  <div>
                    <label className="block text-sm font-semibold text-custom-700 mb-2">
                      Rejection Reason (if rejecting)
                    </label>
                    <textarea
                      value={rejectionReason}
                      onChange={(e) => setRejectionReason(e.target.value)}
                      placeholder="Provide a reason for rejection..."
                      rows={3}
                      className="w-full px-4 py-2 rounded-xl border border-custom-300 focus:outline-none focus:border-primary-500 resize-none"
                    />
                  </div>
                )}
              </div>

              <div className="flex gap-3 mt-6">
                {selectedReport.status === "submitted" && (
                  <>
                    <button
                      onClick={() => handleReject(selectedReport.id)}
                      className="flex-1 px-4 py-2 rounded-xl border border-red-300 text-red-600 hover:bg-red-50 transition-colors text-sm font-semibold"
                    >
                      <HiOutlineXCircle className="w-4 h-4 inline mr-2" />
                      Reject
                    </button>
                    <button
                      onClick={() => handleConfirm(selectedReport.id)}
                      className="flex-1 px-4 py-2 rounded-xl bg-green-500 text-white hover:bg-green-600 transition-colors text-sm font-semibold"
                    >
                      <HiOutlineCheckCircle className="w-4 h-4 inline mr-2" />
                      Confirm
                    </button>
                  </>
                )}
                {selectedReport.status !== "submitted" && (
                  <button
                    onClick={() => {
                      setShowReviewModal(false);
                      setRejectionReason("");
                    }}
                    className="flex-1 px-4 py-2 rounded-xl border border-custom-300 hover:bg-custom-100 transition-colors text-sm font-semibold text-custom-700"
                  >
                    Close
                  </button>
                )}
              </div>
            </Card>
          </div>
        )}
      </div>
    </DashboardLayout>
  );
}
