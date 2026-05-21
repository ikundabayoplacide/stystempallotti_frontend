import { useEffect, useRef, useState } from "react";
import {
    HiOutlineCheckCircle,
    HiOutlineClipboardList,
    HiOutlineCurrencyDollar,
    HiOutlineDotsVertical,
    HiOutlineExclamationCircle,
    HiOutlinePencil,
    HiOutlineSearch,
    HiOutlineTable,
    HiOutlineViewBoards,
    HiOutlineX,
    HiOutlineXCircle
} from "react-icons/hi";
import { HiOutlineArrowRight } from "react-icons/hi";
import { DashboardLayout, WorkflowRulesEngine, WorkflowValidator } from "../../components";
import { Card } from "../../components/ui";
import { useWorkflowValidation } from "../../hooks/useWorkflowValidation";
import { useGetDepartmentsQuery } from "../../store/services/departmentsService";
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
  departmentId?: string;
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

type ModalMode = "approve" | "reject" | "assign" | "edit";

export default function DAFJobApprovalPage() {
  const [jobs, setJobs] = useState<Job[]>(initialJobs);
  const [search, setSearch] = useState("");
  const [selectedJob, setSelectedJob] = useState<Job | null>(null);
  const [modalMode, setModalMode] = useState<ModalMode>("approve");
  const [showModal, setShowModal] = useState(false);
  const [approvalNotes, setApprovalNotes] = useState("");
  const [adjustments, setAdjustments] = useState("");
  const [rejectReason, setRejectReason] = useState("");
  const [assignDeptId, setAssignDeptId] = useState("");
  const [editTitle, setEditTitle] = useState("");
  const [editDeadline, setEditDeadline] = useState("");
  const [openMenuId, setOpenMenuId] = useState<string | null>(null);
  const [viewMode, setViewMode] = useState<"cards" | "table">("table");
  const menuRef = useRef<HTMLDivElement>(null);

  const { data: departments = [] } = useGetDepartmentsQuery();

  // Close dropdown on outside click
  useEffect(() => {
    const handler = (e: MouseEvent) => {
      if (menuRef.current && !menuRef.current.contains(e.target as Node)) {
        setOpenMenuId(null);
      }
    };
    document.addEventListener("mousedown", handler);
    return () => document.removeEventListener("mousedown", handler);
  }, []);

  const openModal = (job: Job, mode: ModalMode) => {
    setSelectedJob(job);
    setModalMode(mode);
    setApprovalNotes("");
    setAdjustments("");
    setRejectReason("");
    setAssignDeptId(job.departmentId ?? "");
    setEditTitle(job.title);
    setEditDeadline(job.deadline);
    setOpenMenuId(null);
    setShowModal(true);
  };

  const closeModal = () => {
    setShowModal(false);
    setSelectedJob(null);
  };

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
    setJobs(jobs.map((j) =>
      j.id === selectedJob.id
        ? { ...j, status: "approved" as JobStatus, notes: approvalNotes || `Approved by DAF on ${new Date().toISOString().split("T")[0]}` }
        : j
    ));
    closeModal();
  };

  const handleReject = () => {
    if (!selectedJob) return;
    if (!rejectReason.trim()) { alert("Please provide a reason for rejection"); return; }
    setJobs(jobs.map((j) =>
      j.id === selectedJob.id
        ? { ...j, status: "quotation-completed" as JobStatus, notes: `Rejected by DAF: ${rejectReason}` }
        : j
    ));
    closeModal();
  };

  const handleAssign = () => {
    if (!selectedJob || !assignDeptId) { alert("Please select a department"); return; }
    setJobs(jobs.map((j) =>
      j.id === selectedJob.id ? { ...j, departmentId: assignDeptId } : j
    ));
    closeModal();
  };

  const handleEdit = () => {
    if (!selectedJob) return;
    setJobs(jobs.map((j) =>
      j.id === selectedJob.id ? { ...j, title: editTitle, deadline: editDeadline } : j
    ));
    closeModal();
  };

  const workflowData = selectedJob
    ? {
        financialApproval: false,
        jobValue: selectedJob.jobValue,
        quotationAmount: selectedJob.quotationAmount,
        paymentReceived: selectedJob.paymentReceived,
        adjustments,
        notes: approvalNotes,
      }
    : {};

  return (
    <DashboardLayout userRole="daf" userName="DAF" notificationCount={pendingApproval.length}>
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
                        onClick={() => openModal(job, "approve")}
                        className="flex-1 px-4 py-2 rounded-xl bg-green-500 text-white hover:bg-green-600 transition-colors text-sm font-semibold"
                      >
                        Approve
                      </button>
                      <button
                        onClick={() => openModal(job, "reject")}
                        className="flex-1 px-4 py-2 rounded-xl bg-red-500 text-white hover:bg-red-600 transition-colors text-sm font-semibold"
                      >
                        Reject
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
                        className={`hover:bg-custom-50 transition-colors relative ${
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
                          <div className="flex items-center justify-end" ref={openMenuId === job.id ? menuRef : undefined}>
                            <button
                              onClick={(e) => { e.stopPropagation(); setOpenMenuId(openMenuId === job.id ? null : job.id); }}
                              className="p-2 rounded-lg hover:bg-custom-100 transition-colors"
                              title="Actions"
                            >
                              <HiOutlineDotsVertical className="w-5 h-5 text-custom-700" />
                            </button>
                            {openMenuId === job.id && (
                              <div className="absolute right-4 mt-1 w-44 bg-white rounded-xl shadow-lg border border-custom-200 z-50 overflow-hidden" style={{ top: "auto" }}>
                                {requiresApproval && (
                                  <button onClick={() => openModal(job, "approve")} className="w-full flex items-center gap-2 px-4 py-2.5 text-sm text-green-700 hover:bg-green-50 transition-colors">
                                    <HiOutlineCheckCircle className="w-4 h-4" /> Approve
                                  </button>
                                )}
                                {job.status === "approved" && (
                                  <button onClick={() => openModal(job, "assign")} className="w-full flex items-center gap-2 px-4 py-2.5 text-sm text-blue-700 hover:bg-blue-50 transition-colors">
                                    <HiOutlineArrowRight className="w-4 h-4" /> Assign
                                  </button>
                                )}
                                <button onClick={() => openModal(job, "edit")} className="w-full flex items-center gap-2 px-4 py-2.5 text-sm text-secondary-100 hover:bg-custom-50 transition-colors">
                                  <HiOutlinePencil className="w-4 h-4" /> Edit
                                </button>
                                <button onClick={() => openModal(job, "reject")} className="w-full flex items-center gap-2 px-4 py-2.5 text-sm text-red-600 hover:bg-red-50 transition-colors">
                                  <HiOutlineXCircle className="w-4 h-4" /> Reject
                                </button>
                              </div>
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

        {/* Action Modal */}
        {showModal && selectedJob && (
          <div className="fixed inset-0 bg-secondary-100/50 z-50 flex items-center justify-center p-4">
            <Card className="!p-6 max-w-lg w-full">
              <div className="flex items-start justify-between mb-4">
                <div>
                  <h3 className="text-xl font-bold text-secondary-100 capitalize">
                    {modalMode === "approve" && "Approve Job"}
                    {modalMode === "reject" && "Reject Job"}
                    {modalMode === "assign" && "Assign to Department"}
                    {modalMode === "edit" && "Edit Job"}
                  </h3>
                  <p className="text-sm text-custom-700 mt-1">{selectedJob.id} — {selectedJob.title}</p>
                </div>
                <button onClick={closeModal} className="text-custom-700 hover:text-secondary-100">
                  <HiOutlineX className="w-6 h-6" />
                </button>
              </div>

              {/* Job summary */}
              <div className="p-3 rounded-xl bg-custom-50 border border-custom-200 mb-4 grid grid-cols-2 gap-2 text-sm">
                <div><span className="text-custom-700">Client:</span> <span className="font-semibold text-secondary-100">{selectedJob.client}</span></div>
                <div><span className="text-custom-700">Value:</span> <span className="font-semibold text-secondary-100">{selectedJob.jobValue.toLocaleString()} RWF</span></div>
                <div><span className="text-custom-700">Status:</span> <span className="font-semibold text-secondary-100">{selectedJob.status}</span></div>
                <div><span className="text-custom-700">Deadline:</span> <span className="font-semibold text-secondary-100">{selectedJob.deadline}</span></div>
              </div>

              {/* Approve form */}
              {modalMode === "approve" && (
                <div className="space-y-3">
                  {dafStep && <WorkflowValidator stepId={dafStep.id} data={workflowData} showErrors={false} />}
                  <div>
                    <label className="block text-sm font-semibold text-custom-700 mb-1">Adjustments (optional)</label>
                    <input type="text" value={adjustments} onChange={(e) => setAdjustments(e.target.value)} placeholder="e.g., 5% discount" className="w-full px-4 py-2 rounded-xl border border-custom-300 focus:outline-none focus:border-primary-500" />
                  </div>
                  <div>
                    <label className="block text-sm font-semibold text-custom-700 mb-1">Notes (optional)</label>
                    <textarea value={approvalNotes} onChange={(e) => setApprovalNotes(e.target.value)} rows={3} placeholder="Approval notes..." className="w-full px-4 py-2 rounded-xl border border-custom-300 focus:outline-none focus:border-primary-500 resize-none" />
                  </div>
                  <button onClick={handleApprove} className="w-full px-4 py-2 rounded-xl bg-green-500 text-white hover:bg-green-600 transition-colors text-sm font-semibold flex items-center justify-center gap-2">
                    <HiOutlineCheckCircle className="w-4 h-4" /> Confirm Approval
                  </button>
                </div>
              )}

              {/* Reject form */}
              {modalMode === "reject" && (
                <div className="space-y-3">
                  <div>
                    <label className="block text-sm font-semibold text-custom-700 mb-1">Reason for rejection <span className="text-red-500">*</span></label>
                    <textarea value={rejectReason} onChange={(e) => setRejectReason(e.target.value)} rows={4} placeholder="Explain why this job is being rejected..." className="w-full px-4 py-2 rounded-xl border border-custom-300 focus:outline-none focus:border-primary-500 resize-none" />
                  </div>
                  <button onClick={handleReject} className="w-full px-4 py-2 rounded-xl bg-red-500 text-white hover:bg-red-600 transition-colors text-sm font-semibold flex items-center justify-center gap-2">
                    <HiOutlineXCircle className="w-4 h-4" /> Confirm Rejection
                  </button>
                </div>
              )}

              {/* Assign form */}
              {modalMode === "assign" && (
                <div className="space-y-3">
                  <div>
                    <label className="block text-sm font-semibold text-custom-700 mb-1">Department <span className="text-red-500">*</span></label>
                    <select value={assignDeptId} onChange={(e) => setAssignDeptId(e.target.value)} className="w-full px-4 py-2 rounded-xl border border-custom-300 focus:outline-none focus:border-primary-500">
                      <option value="">Select department...</option>
                      {departments.map((d) => <option key={d.id} value={d.id}>{d.name}</option>)}
                    </select>
                  </div>
                  <button onClick={handleAssign} className="w-full px-4 py-2 rounded-xl bg-blue-500 text-white hover:bg-blue-600 transition-colors text-sm font-semibold flex items-center justify-center gap-2">
                    <HiOutlineArrowRight className="w-4 h-4" /> Assign Department
                  </button>
                </div>
              )}

              {/* Edit form */}
              {modalMode === "edit" && (
                <div className="space-y-3">
                  <div>
                    <label className="block text-sm font-semibold text-custom-700 mb-1">Title</label>
                    <input type="text" value={editTitle} onChange={(e) => setEditTitle(e.target.value)} className="w-full px-4 py-2 rounded-xl border border-custom-300 focus:outline-none focus:border-primary-500" />
                  </div>
                  <div>
                    <label className="block text-sm font-semibold text-custom-700 mb-1">Deadline</label>
                    <input type="date" value={editDeadline} onChange={(e) => setEditDeadline(e.target.value)} className="w-full px-4 py-2 rounded-xl border border-custom-300 focus:outline-none focus:border-primary-500" />
                  </div>
                  <button onClick={handleEdit} className="w-full px-4 py-2 rounded-xl bg-primary-500 text-white hover:bg-primary-600 transition-colors text-sm font-semibold flex items-center justify-center gap-2">
                    <HiOutlinePencil className="w-4 h-4" /> Save Changes
                  </button>
                </div>
              )}
            </Card>
          </div>
        )}
      </div>
    </DashboardLayout>
  );
}
