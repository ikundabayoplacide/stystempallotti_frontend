import { useRef, useState } from "react";
import {
  HiOutlineCheckCircle,
  HiOutlineCurrencyDollar,
  HiOutlineDotsVertical,
  HiOutlineExclamationCircle,
  HiOutlinePencil,
  HiOutlineSearch,
  HiOutlineTable,
  HiOutlineViewBoards,
  HiOutlineX,
  HiOutlineXCircle,
} from "react-icons/hi";
import { HiOutlineArrowRight } from "react-icons/hi";
import { DashboardLayout } from "../../components";
import { Card } from "../../components/ui";
import {
  useGetJobsQuery,
  useApproveJobMutation,
  useRejectJobMutation,
  useAssignJobMutation,
  useUpdateJobMutation,
  type Job,
} from "../../store/services/jobsService";
import { useGetDepartmentsQuery } from "../../store/services/departmentsService";
import { jobStatusConfig } from "../../types/JobStatus";

const priorityColor: Record<string, string> = {
  high: "bg-red-500 text-white",
  urgent: "bg-red-700 text-white",
  normal: "bg-yellow-500 text-white",
  low: "bg-green-500 text-white",
};

type ModalMode = "approve" | "reject" | "assign" | "edit";

export default function DAFJobApprovalPage() {
  const [search, setSearch] = useState("");
  const [selectedJob, setSelectedJob] = useState<Job | null>(null);
  const [modalMode, setModalMode] = useState<ModalMode>("approve");
  const [showModal, setShowModal] = useState(false);
  const [approvalNotes, setApprovalNotes] = useState("");
  const [rejectReason, setRejectReason] = useState("");
  const [assignDeptId, setAssignDeptId] = useState("");
  const [editTitle, setEditTitle] = useState("");
  const [editDeadline, setEditDeadline] = useState("");
  const [openMenuId, setOpenMenuId] = useState<string | null>(null);
  const [viewMode, setViewMode] = useState<"cards" | "table">("table");
  const menuRef = useRef<HTMLDivElement>(null);

  // Fetch jobs by status from the API
  const { data: pendingData, isLoading: loadingPending } = useGetJobsQuery({ status: "pending", limit: 100 });
  const { data: confirmedData } = useGetJobsQuery({ status: "confirmed", limit: 100 });
  const { data: rejectedData } = useGetJobsQuery({ status: "rejected", limit: 100 });

  const { data: departments = [] } = useGetDepartmentsQuery();

  const [approveJob, { isLoading: approving }] = useApproveJobMutation();
  const [rejectJob, { isLoading: rejecting }] = useRejectJobMutation();
  const [assignJob, { isLoading: assigning }] = useAssignJobMutation();
  const [updateJob, { isLoading: updating }] = useUpdateJobMutation();

  const pendingJobs = pendingData?.jobs ?? [];
  const approvedJobs = confirmedData?.jobs ?? [];
  const rejectedJobs = rejectedData?.jobs ?? [];

  const allJobs = [...pendingJobs, ...approvedJobs, ...rejectedJobs];

  const filtered = allJobs.filter(
    (job) =>
      job.jobNumber?.toLowerCase().includes(search.toLowerCase()) ||
      job.customer?.name?.toLowerCase().includes(search.toLowerCase()) ||
      job.title?.toLowerCase().includes(search.toLowerCase())
  );

  const openModal = (job: Job, mode: ModalMode) => {
    setSelectedJob(job);
    setModalMode(mode);
    setApprovalNotes("");
    setRejectReason("");
    setAssignDeptId(job.departmentAssignedToId ?? "");
    setEditTitle(job.title);
    setEditDeadline(job.dueDate ?? "");
    setOpenMenuId(null);
    setShowModal(true);
  };

  const closeModal = () => {
    setShowModal(false);
    setSelectedJob(null);
  };

  const handleApprove = async () => {
    if (!selectedJob) return;
    try {
      await approveJob(selectedJob.id).unwrap();
      closeModal();
    } catch {
      alert("Failed to confirm job. Please try again.");
    }
  };

  const handleReject = async () => {
    if (!selectedJob) return;
    if (!rejectReason.trim()) { alert("Please provide a reason for rejection"); return; }
    try {
      await rejectJob({ id: selectedJob.id, rejectReason }).unwrap();
      closeModal();
    } catch {
      alert("Failed to reject job. Please try again.");
    }
  };

  const handleAssign = async () => {
    if (!selectedJob || !assignDeptId) { alert("Please select a department"); return; }
    try {
      await assignJob({ id: selectedJob.id, departmentAssignedToId: assignDeptId }).unwrap();
      closeModal();
    } catch {
      alert("Failed to assign job. Please try again.");
    }
  };

  const handleEdit = async () => {
    if (!selectedJob) return;
    try {
      await updateJob({ id: selectedJob.id, title: editTitle, dueDate: editDeadline || undefined }).unwrap();
      closeModal();
    } catch {
      alert("Failed to update job. Please try again.");
    }
  };

  const totalPendingValue = pendingJobs.reduce((sum, j) => sum + (j.amount ?? 0), 0);

  return (
    <DashboardLayout userRole="daf" userName="DAF" notificationCount={pendingJobs.length}>
      <div className="space-y-6 font-[family-name:var(--font-family-primary)]">
        {/* Header */}
        <div className="flex flex-col sm:flex-row sm:items-start justify-between gap-4">
          <div>
            <h1 className="text-2xl md:text-3xl font-bold text-secondary-100">
              Job Financial Approval
            </h1>
            <p className="text-sm text-custom-700 mt-1">
              Review and confirm pending jobs before production
            </p>
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
                <p className="text-xs text-custom-700">Pending Confirmation</p>
                <p className="text-2xl font-bold text-secondary-100">{pendingJobs.length}</p>
              </div>
            </div>
          </Card>
          <Card className="!p-4">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-xl bg-green-100 flex items-center justify-center">
                <HiOutlineCheckCircle className="w-5 h-5 text-green-600" />
              </div>
              <div>
                <p className="text-xs text-custom-700">Confirmed</p>
                <p className="text-2xl font-bold text-secondary-100">{approvedJobs.length}</p>
              </div>
            </div>
          </Card>
          <Card className="!p-4">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-xl bg-red-100 flex items-center justify-center">
                <HiOutlineXCircle className="w-5 h-5 text-red-600" />
              </div>
              <div>
                <p className="text-xs text-custom-700">Rejected</p>
                <p className="text-2xl font-bold text-secondary-100">{rejectedJobs.length}</p>
              </div>
            </div>
          </Card>
          <Card className="!p-4">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-xl bg-primary-100 flex items-center justify-center">
                <HiOutlineCurrencyDollar className="w-5 h-5 text-primary-600" />
              </div>
              <div>
                <p className="text-xs text-custom-700">Pending Value</p>
                <p className="text-lg font-bold text-secondary-100">
                  {totalPendingValue >= 1000
                    ? `${(totalPendingValue / 1000).toFixed(0)}K`
                    : totalPendingValue.toLocaleString()}
                </p>
              </div>
            </div>
          </Card>
        </div>

        {/* Cards View — Pending Jobs */}
        {viewMode === "cards" && (
          <Card className="!p-6">
            <div className="flex items-center gap-2 mb-4">
              <HiOutlineExclamationCircle className="w-5 h-5 text-yellow-600" />
              <h2 className="text-lg font-bold text-secondary-100">
                Pending Confirmation ({pendingJobs.length})
              </h2>
            </div>

            {loadingPending ? (
              <p className="text-sm text-custom-700 py-4 text-center">Loading jobs…</p>
            ) : pendingJobs.length === 0 ? (
              <p className="text-sm text-custom-700 py-4 text-center">No pending jobs requiring approval.</p>
            ) : (
              <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
                {pendingJobs.map((job) => (
                  <Card key={job.id} hoverable className="!p-4 !bg-yellow-50 !border-yellow-300">
                    <div className="flex items-start justify-between mb-3">
                      <div>
                        <span className="text-sm font-bold text-primary-600">{job.jobNumber}</span>
                        <h3 className="text-base font-bold text-secondary-100 mt-1">{job.title}</h3>
                        <p className="text-sm text-custom-700">{job.customer?.name ?? "—"}</p>
                      </div>
                      <span
                        className={`text-xs font-bold px-3 py-1 rounded-full ${priorityColor[job.priority] ?? "bg-gray-200 text-gray-700"}`}
                      >
                        {job.priority}
                      </span>
                    </div>

                    <div className="space-y-2 mb-4">
                      <div className="flex justify-between text-sm">
                        <span className="text-custom-700">Amount:</span>
                        <span className="font-bold text-secondary-100">
                          {job.amount != null ? `${job.amount.toLocaleString()} RWF` : "—"}
                        </span>
                      </div>
                      <div className="flex justify-between text-sm">
                        <span className="text-custom-700">Service:</span>
                        <span className="font-semibold text-secondary-100">{job.jobType ?? "—"}</span>
                      </div>
                      <div className="flex justify-between text-sm">
                        <span className="text-custom-700">Deadline:</span>
                        <span className="font-semibold text-secondary-100">
                          {job.dueDate ? job.dueDate.split("T")[0] : "—"}
                        </span>
                      </div>
                    </div>

                    <div className="flex gap-2">
                      <button
                        onClick={() => openModal(job, "approve")}
                        className="flex-1 px-4 py-2 rounded-xl bg-green-500 text-white hover:bg-green-600 transition-colors text-sm font-semibold"
                      >
                        Confirm
                      </button>
                      <button
                        onClick={() => openModal(job, "reject")}
                        className="flex-1 px-4 py-2 rounded-xl bg-red-500 text-white hover:bg-red-600 transition-colors text-sm font-semibold"
                      >
                        Reject
                      </button>
                    </div>
                  </Card>
                ))}
              </div>
            )}
          </Card>
        )}

        {/* Cards View — Rejected Jobs */}
        {viewMode === "cards" && rejectedJobs.length > 0 && (
          <Card className="!p-6">
            <div className="flex items-center gap-2 mb-4">
              <HiOutlineXCircle className="w-5 h-5 text-red-500" />
              <h2 className="text-lg font-bold text-secondary-100">
                Rejected Jobs ({rejectedJobs.length})
              </h2>
            </div>
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
              {rejectedJobs.map((job) => (
                <Card key={job.id} className="!p-4 !bg-red-50 !border-red-200">
                  <div className="flex items-start justify-between mb-3">
                    <div>
                      <span className="text-sm font-bold text-primary-600">{job.jobNumber}</span>
                      <h3 className="text-base font-bold text-secondary-100 mt-1">{job.title}</h3>
                      <p className="text-sm text-custom-700">{job.customer?.name ?? "—"}</p>
                    </div>
                    <span className={`text-xs font-bold px-3 py-1 rounded-full ${priorityColor[job.priority] ?? "bg-gray-200 text-gray-700"}`}>
                      {job.priority}
                    </span>
                  </div>
                  <div className="space-y-2">
                    <div className="flex justify-between text-sm">
                      <span className="text-custom-700">Amount:</span>
                      <span className="font-bold text-secondary-100">
                        {job.amount != null ? `${job.amount.toLocaleString()} RWF` : "—"}
                      </span>
                    </div>
                    <div className="flex justify-between text-sm">
                      <span className="text-custom-700">Service:</span>
                      <span className="font-semibold text-secondary-100">{job.jobType ?? "—"}</span>
                    </div>
                    {job.rejectReason && (
                      <div className="pt-2 border-t border-red-200">
                        <p className="text-xs text-red-600 font-semibold mb-0.5">Rejection reason:</p>
                        <p className="text-xs text-secondary-100">{job.rejectReason}</p>
                      </div>
                    )}
                  </div>
                </Card>
              ))}
            </div>
          </Card>
        )}

        {/* Table View */}
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
                    <th className="px-4 py-3 text-left text-xs font-bold text-secondary-100 uppercase">Job #</th>
                    <th className="px-4 py-3 text-left text-xs font-bold text-secondary-100 uppercase">Title & Client</th>
                    <th className="px-4 py-3 text-left text-xs font-bold text-secondary-100 uppercase">Amount</th>
                    <th className="px-4 py-3 text-left text-xs font-bold text-secondary-100 uppercase">Priority</th>
                    <th className="px-4 py-3 text-left text-xs font-bold text-secondary-100 uppercase">Status</th>
                    <th className="px-4 py-3 text-left text-xs font-bold text-secondary-100 uppercase">Deadline</th>
                    <th className="px-4 py-3 text-right text-xs font-bold text-secondary-100 uppercase">Actions</th>
                  </tr>
                </thead>
                <tbody className="bg-white divide-y divide-custom-200">
                  {loadingPending ? (
                    <tr>
                      <td colSpan={7} className="px-4 py-8 text-center text-custom-700">Loading…</td>
                    </tr>
                  ) : filtered.length === 0 ? (
                    <tr>
                      <td colSpan={7} className="px-4 py-8 text-center text-custom-700">No jobs found</td>
                    </tr>
                  ) : (
                    filtered.map((job) => {
                      const statusCfg = jobStatusConfig[job.status];
                      const isPending = job.status === "pending";
                      return (
                        <tr
                          key={job.id}
                          className={`hover:bg-custom-50 transition-colors relative ${isPending ? "bg-yellow-50" : ""}`}
                        >
                          <td className="px-4 py-4">
                            <span className="text-sm font-bold text-primary-600">{job.jobNumber}</span>
                          </td>
                          <td className="px-4 py-4">
                            <div>
                              <span className="text-sm font-semibold text-secondary-100 block">{job.title}</span>
                              <span className="text-xs text-custom-700">{job.customer?.name ?? "—"}</span>
                            </div>
                          </td>
                          <td className="px-4 py-4">
                            <span className="text-sm font-bold text-secondary-100">
                              {job.amount != null ? `${job.amount.toLocaleString()} RWF` : "—"}
                            </span>
                          </td>
                          <td className="px-4 py-4">
                            <span
                              className={`text-xs font-bold px-3 py-1 rounded-full ${priorityColor[job.priority] ?? "bg-gray-200 text-gray-700"}`}
                            >
                              {job.priority}
                            </span>
                          </td>
                          <td className="px-4 py-4">
                            {statusCfg ? (
                              <span className={`text-xs font-bold px-3 py-1 rounded-full ${statusCfg.bgColor} ${statusCfg.color}`}>
                                {statusCfg.label}
                              </span>
                            ) : (
                              <span className="text-xs text-custom-700">{job.status}</span>
                            )}
                          </td>
                          <td className="px-4 py-4">
                            <span className="text-sm text-custom-700">
                              {job.dueDate ? job.dueDate.split("T")[0] : "—"}
                            </span>
                          </td>
                          <td className="px-4 py-4">
                            <div
                              className="flex items-center justify-end"
                              ref={openMenuId === job.id ? menuRef : undefined}
                            >
                              <button
                                onClick={(e) => {
                                  e.stopPropagation();
                                  setOpenMenuId(openMenuId === job.id ? null : job.id);
                                }}
                                className="p-2 rounded-lg hover:bg-custom-100 transition-colors"
                                title="Actions"
                              >
                                <HiOutlineDotsVertical className="w-5 h-5 text-custom-700" />
                              </button>
                              {openMenuId === job.id && (
                                <div className="absolute right-4 mt-1 w-44 bg-white rounded-xl shadow-lg border border-custom-200 z-50 overflow-hidden">
                                  {isPending && (
                                    <button
                                      onClick={() => openModal(job, "approve")}
                                      className="w-full flex items-center gap-2 px-4 py-2.5 text-sm text-green-700 hover:bg-green-50 transition-colors"
                                    >
                                      <HiOutlineCheckCircle className="w-4 h-4" /> Confirm
                                    </button>
                                  )}
                                  {job.status === "confirmed" && (
                                    <button
                                      onClick={() => openModal(job, "assign")}
                                      className="w-full flex items-center gap-2 px-4 py-2.5 text-sm text-blue-700 hover:bg-blue-50 transition-colors"
                                    >
                                      <HiOutlineArrowRight className="w-4 h-4" /> Assign Dept
                                    </button>
                                  )}
                                  <button
                                    onClick={() => openModal(job, "edit")}
                                    className="w-full flex items-center gap-2 px-4 py-2.5 text-sm text-secondary-100 hover:bg-custom-50 transition-colors"
                                  >
                                    <HiOutlinePencil className="w-4 h-4" /> Edit
                                  </button>
                                  {isPending && (
                                    <button
                                      onClick={() => openModal(job, "reject")}
                                      className="w-full flex items-center gap-2 px-4 py-2.5 text-sm text-red-600 hover:bg-red-50 transition-colors"
                                    >
                                      <HiOutlineXCircle className="w-4 h-4" /> Reject
                                    </button>
                                  )}
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
                    {modalMode === "approve" && "Confirm Job"}
                    {modalMode === "reject" && "Reject Job"}
                    {modalMode === "assign" && "Assign to Department"}
                    {modalMode === "edit" && "Edit Job"}
                  </h3>
                  <p className="text-sm text-custom-700 mt-1">
                    {selectedJob.jobNumber} — {selectedJob.title}
                  </p>
                </div>
                <button onClick={closeModal} className="text-custom-700 hover:text-secondary-100">
                  <HiOutlineX className="w-6 h-6" />
                </button>
              </div>

              {/* Job summary */}
              <div className="p-3 rounded-xl bg-custom-50 border border-custom-200 mb-4 text-sm space-y-2">
                <div className="grid grid-cols-2 gap-2">
                  <div>
                    <span className="text-custom-700">Client: </span>
                    <span className="font-semibold text-secondary-100">{selectedJob.customer?.name ?? "—"}</span>
                  </div>
                  <div>
                    <span className="text-custom-700">Amount: </span>
                    <span className="font-semibold text-secondary-100">
                      {selectedJob.amount != null ? `${selectedJob.amount.toLocaleString()} RWF` : "—"}
                    </span>
                  </div>
                  <div>
                    <span className="text-custom-700">Status: </span>
                    <span className="font-semibold text-secondary-100">{selectedJob.status}</span>
                  </div>
                  <div>
                    <span className="text-custom-700">Deadline: </span>
                    <span className="font-semibold text-secondary-100">
                      {selectedJob.dueDate ? selectedJob.dueDate.split("T")[0] : "—"}
                    </span>
                  </div>
                </div>
                {selectedJob.description && (
                  <div className="pt-1 border-t border-custom-200">
                    <p className="text-custom-700 mb-0.5">Description:</p>
                    <p className="text-secondary-100 font-medium leading-snug">{selectedJob.description}</p>
                  </div>
                )}
              </div>

              {/* Confirm */}
              {modalMode === "approve" && (
                <div className="space-y-3">
                  <div>
                    <label className="block text-sm font-semibold text-custom-700 mb-1">Notes (optional)</label>
                    <textarea
                      value={approvalNotes}
                      onChange={(e) => setApprovalNotes(e.target.value)}
                      rows={3}
                      placeholder="Confirmation notes…"
                      className="w-full px-4 py-2 rounded-xl border border-custom-300 focus:outline-none focus:border-primary-500 resize-none"
                    />
                  </div>
                  <button
                    onClick={handleApprove}
                    disabled={approving}
                    className="w-full px-4 py-2 rounded-xl bg-green-500 text-white hover:bg-green-600 transition-colors text-sm font-semibold flex items-center justify-center gap-2 disabled:opacity-60"
                  >
                    <HiOutlineCheckCircle className="w-4 h-4" />
                    {approving ? "Confirming…" : "Confirm Job"}
                  </button>
                </div>
              )}

              {/* Reject */}
              {modalMode === "reject" && (
                <div className="space-y-3">
                  <div>
                    <label className="block text-sm font-semibold text-custom-700 mb-1">
                      Reason for rejection <span className="text-red-500">*</span>
                    </label>
                    <textarea
                      value={rejectReason}
                      onChange={(e) => setRejectReason(e.target.value)}
                      rows={4}
                      placeholder="Explain why this job is being rejected…"
                      className="w-full px-4 py-2 rounded-xl border border-custom-300 focus:outline-none focus:border-primary-500 resize-none"
                    />
                  </div>
                  <button
                    onClick={handleReject}
                    disabled={rejecting}
                    className="w-full px-4 py-2 rounded-xl bg-red-500 text-white hover:bg-red-600 transition-colors text-sm font-semibold flex items-center justify-center gap-2 disabled:opacity-60"
                  >
                    <HiOutlineXCircle className="w-4 h-4" />
                    {rejecting ? "Rejecting…" : "Confirm Rejection"}
                  </button>
                </div>
              )}

              {/* Assign */}
              {modalMode === "assign" && (
                <div className="space-y-3">
                  <div>
                    <label className="block text-sm font-semibold text-custom-700 mb-1">
                      Department <span className="text-red-500">*</span>
                    </label>
                    <select
                      value={assignDeptId}
                      onChange={(e) => setAssignDeptId(e.target.value)}
                      className="w-full px-4 py-2 rounded-xl border border-custom-300 focus:outline-none focus:border-primary-500"
                    >
                      <option value="">Select department…</option>
                      {departments.map((d) => (
                        <option key={d.id} value={d.id}>{d.name}</option>
                      ))}
                    </select>
                  </div>
                  <button
                    onClick={handleAssign}
                    disabled={assigning}
                    className="w-full px-4 py-2 rounded-xl bg-blue-500 text-white hover:bg-blue-600 transition-colors text-sm font-semibold flex items-center justify-center gap-2 disabled:opacity-60"
                  >
                    <HiOutlineArrowRight className="w-4 h-4" />
                    {assigning ? "Assigning…" : "Assign Department"}
                  </button>
                </div>
              )}

              {/* Edit */}
              {modalMode === "edit" && (
                <div className="space-y-3">
                  <div>
                    <label className="block text-sm font-semibold text-custom-700 mb-1">Title</label>
                    <input
                      type="text"
                      value={editTitle}
                      onChange={(e) => setEditTitle(e.target.value)}
                      className="w-full px-4 py-2 rounded-xl border border-custom-300 focus:outline-none focus:border-primary-500"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-semibold text-custom-700 mb-1">Deadline</label>
                    <input
                      type="date"
                      value={editDeadline?.split("T")[0] ?? ""}
                      onChange={(e) => setEditDeadline(e.target.value)}
                      className="w-full px-4 py-2 rounded-xl border border-custom-300 focus:outline-none focus:border-primary-500"
                    />
                  </div>
                  <button
                    onClick={handleEdit}
                    disabled={updating}
                    className="w-full px-4 py-2 rounded-xl bg-primary-500 text-white hover:bg-primary-600 transition-colors text-sm font-semibold flex items-center justify-center gap-2 disabled:opacity-60"
                  >
                    <HiOutlinePencil className="w-4 h-4" />
                    {updating ? "Saving…" : "Save Changes"}
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
