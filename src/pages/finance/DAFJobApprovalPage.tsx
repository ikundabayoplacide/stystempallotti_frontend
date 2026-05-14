import { useState } from "react";
import {
    HiOutlineCheckCircle,
    HiOutlineClipboardList,
    HiOutlineCurrencyDollar,
    HiOutlineExclamationCircle,
    HiOutlineSearch,
    HiOutlineTable,
    HiOutlineViewBoards,
    HiOutlineX,
    HiOutlineXCircle
} from "react-icons/hi";
import { DashboardLayout, WorkflowRulesEngine, WorkflowValidator } from "../../components";
import { Card } from "../../components/ui";
import { useWorkflowValidation } from "../../hooks/useWorkflowValidation";
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
  jobValue: number;
  quotationAmount: number;
  paymentReceived: number;
  paymentDate?: string;
  notes?: string;
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
    jobValue: 750000,
    quotationAmount: 750000,
    paymentReceived: 750000,
    paymentDate: "2026-04-28",
  },
  {
    id: "JOB-002",
    title: "Annual report printing",
    client: "Finance Corp",
    service: "Offset Printing",
    deadline: "2026-05-05",
    priority: "High",
    status: "paid",
    jobValue: 1200000,
    quotationAmount: 1200000,
    paymentReceived: 1200000,
    paymentDate: "2026-04-29",
  },
  {
    id: "JOB-003",
    title: "Marketing materials package",
    client: "Tech Startup",
    service: "Digital Printing",
    deadline: "2026-05-03",
    priority: "Medium",
    status: "paid",
    jobValue: 850000,
    quotationAmount: 850000,
    paymentReceived: 850000,
    paymentDate: "2026-04-27",
  },
  {
    id: "JOB-004",
    title: "Bind 200 booklets",
    client: "XYZ Ltd",
    service: "Binding",
    deadline: "2026-05-01",
    priority: "Medium",
    status: "paid",
    jobValue: 350000,
    quotationAmount: 350000,
    paymentReceived: 350000,
    paymentDate: "2026-04-26",
    notes: "Low value - Auto-approved (< 500,000 RWF)",
  },
  {
    id: "JOB-005",
    title: "Corporate branding materials",
    client: "Bank D",
    service: "Composition",
    deadline: "2026-05-06",
    priority: "High",
    status: "approved",
    jobValue: 2500000,
    quotationAmount: 2500000,
    paymentReceived: 2500000,
    paymentDate: "2026-04-25",
    notes: "Approved by DAF on 2026-04-26",
  },
];

const priorityColor: Record<string, string> = {
  High: "bg-red-500 text-white",
  Medium: "bg-yellow-500 text-white",
  Low: "bg-green-500 text-white",
};

export default function DAFJobApprovalPage() {
  const [jobs, setJobs] = useState<Job[]>(initialJobs);
  const [search, setSearch] = useState("");
  const [selectedJob, setSelectedJob] = useState<Job | null>(null);
  const [showApprovalModal, setShowApprovalModal] = useState(false);
  const [approvalNotes, setApprovalNotes] = useState("");
  const [adjustments, setAdjustments] = useState("");
  const [viewMode, setViewMode] = useState<"cards" | "table">("table");

  const { getStepByType } = useWorkflowValidation();
  const dafStep = getStepByType("daf");

  // Jobs requiring DAF approval (value >= 500,000 RWF and status = paid)
  const pendingApproval = jobs.filter(
    (job) => job.status === "paid" && job.jobValue >= 500000
  );

  // Jobs already approved
  const approvedJobs = jobs.filter((job) => job.status === "approved");

  // Jobs that auto-skip DAF (value < 500,000 RWF)
  const autoApprovedJobs = jobs.filter(
    (job) => job.status === "paid" && job.jobValue < 500000
  );

  const filtered = jobs.filter(
    (job) =>
      job.id.toLowerCase().includes(search.toLowerCase()) ||
      job.client.toLowerCase().includes(search.toLowerCase()) ||
      job.title.toLowerCase().includes(search.toLowerCase())
  );

  const handleApprove = () => {
    if (!selectedJob) return;

    setJobs(
      jobs.map((job) =>
        job.id === selectedJob.id
          ? {
              ...job,
              status: "approved" as JobStatus,
              notes: approvalNotes || `Approved by DAF on ${new Date().toISOString().split("T")[0]}`,
            }
          : job
      )
    );

    setShowApprovalModal(false);
    setSelectedJob(null);
    setApprovalNotes("");
    setAdjustments("");
  };

  const handleReject = () => {
    if (!selectedJob) return;
    if (!approvalNotes) {
      alert("Please provide a reason for rejection");
      return;
    }

    setJobs(
      jobs.map((job) =>
        job.id === selectedJob.id
          ? {
              ...job,
              status: "quotation-completed" as JobStatus,
              notes: `Rejected by DAF: ${approvalNotes}`,
            }
          : job
      )
    );

    setShowApprovalModal(false);
    setSelectedJob(null);
    setApprovalNotes("");
    setAdjustments("");
  };

  // Prepare workflow data
  const workflowData = selectedJob
    ? {
        financialApproval: false,
        jobValue: selectedJob.jobValue,
        quotationAmount: selectedJob.quotationAmount,
        paymentReceived: selectedJob.paymentReceived,
        adjustments: adjustments,
        notes: approvalNotes,
      }
    : {};

  return (
    <DashboardLayout userRole="daf" userName="DAF" notificationCount={pendingApproval.length}>
      {/* Workflow Rules Engine */}
      {dafStep && selectedJob && (
        <WorkflowRulesEngine
          stepId={dafStep.id}
          data={workflowData}
          onRuleTriggered={(action, ruleName) => {
            console.log(`DAF Rule triggered: ${ruleName}`, action);
          }}
          checkGlobalRules
        />
      )}

      <div className="space-y-6 font-[family-name:var(--font-family-primary)]">
        {/* Header */}
        <div className="flex flex-col sm:flex-row sm:items-start justify-between gap-4">
          <div>
            <h1 className="text-2xl md:text-3xl font-bold text-secondary-100">
              Job Financial Approval
            </h1>
            <p className="text-sm text-custom-700 mt-1">
              Review and approve high-value jobs (≥ 500,000 RWF) before production
            </p>
            {dafStep && (
              <p className="text-xs text-custom-600 mt-1">
                Workflow Step: {dafStep.name} • Required: {dafStep.requiredFields.join(", ")}
              </p>
            )}
          </div>
          
          {/* View Toggle */}
          <div className="flex gap-2">
            <button
              onClick={() => setViewMode("cards")}
              className={`px-4 py-2 rounded-xl flex items-center gap-2 text-sm font-semibold transition-colors ${
                viewMode === "cards"
                  ? "bg-primary-500 text-white"
                  : "bg-custom-100 text-custom-700 hover:bg-custom-200"
              }`}
            >
              <HiOutlineViewBoards className="w-4 h-4" />
              Cards
            </button>
            <button
              onClick={() => setViewMode("table")}
              className={`px-4 py-2 rounded-xl flex items-center gap-2 text-sm font-semibold transition-colors ${
                viewMode === "table"
                  ? "bg-primary-500 text-white"
                  : "bg-custom-100 text-custom-700 hover:bg-custom-200"
              }`}
            >
              <HiOutlineTable className="w-4 h-4" />
              Table
            </button>
          </div>
        </div>

        {/* Summary Cards */}
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
          <Card className="!p-4">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-xl bg-yellow-100 flex items-center justify-center">
                <HiOutlineExclamationCircle className="w-5 h-5 text-yellow-600" />
              </div>
              <div>
                <p className="text-xs text-custom-700">Pending Approval</p>
                <p className="text-2xl font-bold text-secondary-100">{pendingApproval.length}</p>
              </div>
            </div>
          </Card>
          <Card className="!p-4">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-xl bg-green-100 flex items-center justify-center">
                <HiOutlineCheckCircle className="w-5 h-5 text-green-600" />
              </div>
              <div>
                <p className="text-xs text-custom-700">Approved</p>
                <p className="text-2xl font-bold text-secondary-100">{approvedJobs.length}</p>
              </div>
            </div>
          </Card>
          <Card className="!p-4">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-xl bg-blue-100 flex items-center justify-center">
                <HiOutlineClipboardList className="w-5 h-5 text-blue-600" />
              </div>
              <div>
                <p className="text-xs text-custom-700">Auto-Approved</p>
                <p className="text-2xl font-bold text-secondary-100">{autoApprovedJobs.length}</p>
              </div>
            </div>
          </Card>
          <Card className="!p-4">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-xl bg-primary-100 flex items-center justify-center">
                <HiOutlineCurrencyDollar className="w-5 h-5 text-primary-600" />
              </div>
              <div>
                <p className="text-xs text-custom-700">Total Value</p>
                <p className="text-lg font-bold text-secondary-100">
                  {(pendingApproval.reduce((sum, job) => sum + job.jobValue, 0) / 1000).toFixed(0)}K
                </p>
              </div>
            </div>
          </Card>
        </div>

        {/* Pending Approval Section - Cards View */}
        {viewMode === "cards" && pendingApproval.length > 0 && (
          <Card className="!p-6">
            <div className="flex items-center gap-2 mb-4">
              <HiOutlineExclamationCircle className="w-5 h-5 text-yellow-600" />
              <h2 className="text-lg font-bold text-secondary-100">
                Pending Financial Approval ({pendingApproval.length})
              </h2>
            </div>
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
              {pendingApproval.map((job) => {
                return (
                  <Card
                    key={job.id}
                    hoverable
                    className="!p-4 !bg-yellow-50 !border-yellow-300"
                  >
                    <div className="flex items-start justify-between mb-3">
                      <div>
                        <span className="text-sm font-bold text-primary-600">{job.id}</span>
                        <h3 className="text-base font-bold text-secondary-100 mt-1">
                          {job.title}
                        </h3>
                        <p className="text-sm text-custom-700">{job.client}</p>
                      </div>
                      <span
                        className={`text-xs font-bold px-3 py-1 rounded-full ${priorityColor[job.priority]}`}
                      >
                        {job.priority}
                      </span>
                    </div>

                    <div className="space-y-2 mb-4">
                      <div className="flex justify-between text-sm">
                        <span className="text-custom-700">Job Value:</span>
                        <span className="font-bold text-secondary-100">
                          {job.jobValue.toLocaleString()} RWF
                        </span>
                      </div>
                      <div className="flex justify-between text-sm">
                        <span className="text-custom-700">Payment Received:</span>
                        <span className="font-bold text-green-600">
                          {job.paymentReceived.toLocaleString()} RWF
                        </span>
                      </div>
                      <div className="flex justify-between text-sm">
                        <span className="text-custom-700">Payment Date:</span>
                        <span className="font-semibold text-secondary-100">
                          {job.paymentDate}
                        </span>
                      </div>
                      <div className="flex justify-between text-sm">
                        <span className="text-custom-700">Deadline:</span>
                        <span className="font-semibold text-secondary-100">{job.deadline}</span>
                      </div>
                    </div>

                    <div className="flex gap-2">
                      <button
                        onClick={() => {
                          setSelectedJob(job);
                          setShowApprovalModal(true);
                        }}
                        className="flex-1 px-4 py-2 rounded-xl bg-primary-500 text-white hover:bg-primary-600 transition-colors text-sm font-semibold"
                      >
                        Review & Approve
                      </button>
                    </div>
                  </Card>
                );
              })}
            </div>
          </Card>
        )}

        {/* All Jobs Table - Table View */}
        {viewMode === "table" && (
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
                    Value
                  </th>
                  <th className="px-4 py-3 text-left text-xs font-bold text-secondary-100 uppercase">
                    Priority
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
                    <td colSpan={7} className="px-4 py-8 text-center text-custom-700">
                      No jobs found
                    </td>
                  </tr>
                ) : (
                  filtered.map((job) => {
                    const statusCfg = jobStatusConfig[job.status];
                    const requiresApproval = job.jobValue >= 500000 && job.status === "paid";
                    return (
                      <tr
                        key={job.id}
                        className={`hover:bg-custom-50 transition-colors ${
                          requiresApproval ? "bg-yellow-50" : ""
                        }`}
                      >
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
                          <div>
                            <span className="text-sm font-bold text-secondary-100 block">
                              {job.jobValue.toLocaleString()} RWF
                            </span>
                            {job.jobValue < 500000 && (
                              <span className="text-xs text-blue-600">Auto-approved</span>
                            )}
                          </div>
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
                          <span className="text-sm text-custom-700">{job.deadline}</span>
                        </td>
                        <td className="px-4 py-4">
                          <div className="flex items-center justify-end gap-2">
                            {requiresApproval && (
                              <button
                                onClick={() => {
                                  setSelectedJob(job);
                                  setShowApprovalModal(true);
                                }}
                                className="px-3 py-1.5 rounded-lg bg-primary-500 text-white hover:bg-primary-600 transition-colors text-xs font-semibold"
                              >
                                Review
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
        )}

        {/* Approval Modal */}
        {showApprovalModal && selectedJob && (
          <div className="fixed inset-0 bg-secondary-100/50 z-50 flex items-center justify-center p-4">
            <Card className="!p-6 max-w-2xl w-full max-h-[90vh] overflow-y-auto">
              <div className="flex items-start justify-between mb-4">
                <div>
                  <h3 className="text-xl font-bold text-secondary-100">Financial Approval</h3>
                  <p className="text-sm text-custom-700 mt-1">
                    {selectedJob.id} - {selectedJob.title}
                  </p>
                </div>
                <button
                  onClick={() => {
                    setShowApprovalModal(false);
                    setSelectedJob(null);
                    setApprovalNotes("");
                    setAdjustments("");
                  }}
                  className="text-custom-700 hover:text-secondary-100 text-2xl"
                >
                  <HiOutlineX className="w-6 h-6" />
                </button>
              </div>

              {/* Job Details */}
              <div className="p-4 rounded-xl bg-custom-50 border border-custom-200 mb-4">
                <h4 className="text-sm font-bold text-secondary-100 mb-3">Job Details</h4>
                <div className="grid grid-cols-2 gap-3 text-sm">
                  <div>
                    <span className="text-custom-700">Client:</span>
                    <span className="font-semibold text-secondary-100 ml-2">
                      {selectedJob.client}
                    </span>
                  </div>
                  <div>
                    <span className="text-custom-700">Service:</span>
                    <span className="font-semibold text-secondary-100 ml-2">
                      {selectedJob.service}
                    </span>
                  </div>
                  <div>
                    <span className="text-custom-700">Quotation:</span>
                    <span className="font-semibold text-secondary-100 ml-2">
                      {selectedJob.quotationAmount.toLocaleString()} RWF
                    </span>
                  </div>
                  <div>
                    <span className="text-custom-700">Payment Received:</span>
                    <span className="font-bold text-green-600 ml-2">
                      {selectedJob.paymentReceived.toLocaleString()} RWF
                    </span>
                  </div>
                  <div>
                    <span className="text-custom-700">Payment Date:</span>
                    <span className="font-semibold text-secondary-100 ml-2">
                      {selectedJob.paymentDate}
                    </span>
                  </div>
                  <div>
                    <span className="text-custom-700">Deadline:</span>
                    <span className="font-semibold text-secondary-100 ml-2">
                      {selectedJob.deadline}
                    </span>
                  </div>
                </div>
              </div>

              {/* Workflow Validation */}
              {dafStep && (
                <WorkflowValidator
                  stepId={dafStep.id}
                  data={workflowData}
                  showErrors={false}
                />
              )}

              {/* Approval Form */}
              <div className="space-y-4">
                <div>
                  <label className="block text-sm font-semibold text-custom-700 mb-2">
                    Adjustments (Optional)
                  </label>
                  <input
                    type="text"
                    value={adjustments}
                    onChange={(e) => setAdjustments(e.target.value)}
                    placeholder="e.g., Approved with 5% discount"
                    className="w-full px-4 py-2 rounded-xl border border-custom-300 focus:outline-none focus:border-primary-500"
                  />
                </div>

                <div>
                  <label className="block text-sm font-semibold text-custom-700 mb-2">
                    Notes
                  </label>
                  <textarea
                    value={approvalNotes}
                    onChange={(e) => setApprovalNotes(e.target.value)}
                    placeholder="Add approval notes or rejection reason..."
                    rows={3}
                    className="w-full px-4 py-2 rounded-xl border border-custom-300 focus:outline-none focus:border-primary-500 resize-none"
                  />
                </div>
              </div>

              {/* Action Buttons */}
              <div className="flex gap-3 mt-6">
                <button
                  onClick={handleReject}
                  className="flex-1 px-4 py-2 rounded-xl bg-red-500 text-white hover:bg-red-600 transition-colors text-sm font-semibold flex items-center justify-center gap-2"
                >
                  <HiOutlineXCircle className="w-4 h-4" />
                  Reject
                </button>
                <button
                  onClick={handleApprove}
                  className="flex-1 px-4 py-2 rounded-xl bg-green-500 text-white hover:bg-green-600 transition-colors text-sm font-semibold flex items-center justify-center gap-2"
                >
                  <HiOutlineCheckCircle className="w-4 h-4" />
                  Approve
                </button>
              </div>
            </Card>
          </div>
        )}
      </div>
    </DashboardLayout>
  );
}
