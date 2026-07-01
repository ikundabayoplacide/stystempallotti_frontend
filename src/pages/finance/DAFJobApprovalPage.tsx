import { useEffect, useRef, useState } from "react";
import {
  HiOutlineArrowRight,
  HiOutlineBadgeCheck,
  HiOutlineCheckCircle,
  HiOutlineClock,
  HiOutlineCube,
  HiOutlineCurrencyDollar,
  HiOutlineDocumentText,
  HiOutlineDotsVertical,
  HiOutlineDownload,
  HiOutlineExclamationCircle,
  HiOutlineEye,
  HiOutlinePaperClip,
  HiOutlineRefresh,
  HiOutlineSearch,
  HiOutlineX,
  HiOutlineXCircle,
} from "react-icons/hi";
import { printQuotation } from "../../components/QuotationPrint";
import { DashboardLayout } from "../../components";
import { Card } from "../../components/ui";
import { useGetDepartmentsQuery } from "../../store/services/departmentsService";
import {
  useApproveJobMutation,
  useAssignJobMutation,
  useGetJobDetailsQuery,
  useGetJobsQuery,
  useRejectJobMutation,
  useVerifyJobMutation,
  type Job,
} from "../../store/services/jobsService";
import {
  useGetJobDocumentsQuery,
} from "../../store/services/jobDocumentsService";
import {
  useGetJobItemsQuery,
} from "../../store/services/jobsService";
import { jobStatusConfig } from "../../types/JobStatus";

const priorityColor: Record<string, string> = {
  high:   "bg-red-500 text-white",
  urgent: "bg-red-700 text-white",
  normal: "bg-yellow-500 text-white",
  low:    "bg-green-500 text-white",
};

function JobDetailsModal({ jobId, onClose }: { jobId: string; onClose: () => void }) {
  const { data: d, isLoading } = useGetJobDetailsQuery(jobId);
  const { data: docs = [], isLoading: loadingDocs } = useGetJobDocumentsQuery(jobId);
  const { data: jobItems = [] } = useGetJobItemsQuery(jobId);
  const items = d?.jobItems ?? [];
  console.log("[JobDetailsModal] d.jobItems:", d?.jobItems);
  console.log("[JobDetailsModal] useGetJobItemsQuery result:", jobItems);

  const getFileIcon = (mimeType: string) => {
    if (mimeType?.startsWith("image/"))  return "text-blue-500";
    if (mimeType === "application/pdf")  return "text-red-500";
    if (mimeType?.includes("sheet") || mimeType?.includes("excel")) return "text-green-600";
    if (mimeType?.includes("word")  || mimeType?.includes("document")) return "text-blue-600";
    return "text-custom-700";
  };

  return (
    <div className="fixed inset-0 bg-secondary-100/50 z-50 flex items-center justify-center p-4">
      <div className="w-full max-w-4xl flex flex-col" style={{ height: "min(92vh, 820px)" }}>
        <Card className="!p-0 overflow-hidden flex flex-col h-full">

          {/* Header */}
          <div className="flex items-center justify-between px-6 py-4 border-b border-custom-300 shrink-0">
            <div className="flex items-center gap-3">
              <HiOutlineDocumentText className="w-5 h-5 text-primary-500" />
              <div>
                <h3 className="text-lg font-bold text-secondary-100">Job Details</h3>
                {d && <p className="text-xs text-primary-600 font-semibold">{d.jobNumber}</p>}
              </div>
            </div>
            <button onClick={onClose}
              className="p-1.5 rounded-lg hover:bg-custom-100 transition-colors text-custom-700 hover:text-secondary-100">
              <HiOutlineX className="w-5 h-5" />
            </button>
          </div>

          {/* Body */}
          <div className="flex-1 overflow-y-auto min-h-0">
            {isLoading ? (
              <div className="flex items-center justify-center py-20 text-custom-700 text-sm gap-2">
                <HiOutlineClock className="w-5 h-5 animate-spin" /> Loading job details…
              </div>
            ) : !d ? (
              <div className="flex items-center justify-center py-20 text-red-600 text-sm">
                Failed to load job details.
              </div>
            ) : (
              <div className="px-6 py-6 space-y-6">

                {/* Title + badges */}
                <div>
                  <h2 className="text-xl font-bold text-secondary-100 mb-2">{d.title}</h2>
                  <div className="flex flex-wrap items-center gap-2">
                    <span className={`px-3 py-1 rounded-full text-xs font-semibold border ${
                      jobStatusConfig[d.status]
                        ? `${jobStatusConfig[d.status].bgColor} ${jobStatusConfig[d.status].color}`
                        : "bg-gray-100 text-gray-700"
                    }`}>{d.status.replace(/-/g, " ")}</span>
                    <span className={`px-3 py-1 rounded-full text-xs font-semibold ${
                      d.priority === "urgent" ? "bg-red-100 text-red-700" :
                      d.priority === "high"   ? "bg-orange-100 text-orange-700" :
                      d.priority === "normal" ? "bg-yellow-100 text-yellow-700" :
                                                "bg-green-100 text-green-700"
                    }`}>{d.priority} priority</span>
                    {d.dueDate && (
                      <span className="px-3 py-1 rounded-full text-xs font-semibold bg-blue-100 text-blue-700">
                        Due: {d.dueDate.split("T")[0]}
                      </span>
                    )}
                  </div>
                </div>

                {/* Two-column details */}
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div className="space-y-3">
                    <p className="text-xs font-bold text-custom-700 uppercase tracking-wide">Job Info</p>
                    {[
                      { label: "Job Type",   value: d.jobType },
                      { label: "Quantity",   value: d.quantity },
                      { label: "Size",       value: d.size },
                      { label: "Color Mode", value: d.colorMode },
                      { label: "Binding",    value: d.bindingType },
                      { label: "Amount",     value: d.amount != null ? `${Number(d.amount).toLocaleString()} RWF` : null },
                    ].filter(r => r.value != null && r.value !== "").map(({ label, value }) => (
                      <div key={label} className="flex items-start gap-3">
                        <div>
                          <p className="text-xs text-custom-700">{label}</p>
                          <p className="text-sm font-semibold text-secondary-100">{value}</p>
                        </div>
                      </div>
                    ))}
                  </div>
                  <div className="space-y-3">
                    <p className="text-xs font-bold text-custom-700 uppercase tracking-wide">Dates & Customer</p>
                    {[
                      { label: "Due Date", value: d.dueDate ? d.dueDate.split("T")[0] : null },
                      { label: "Created",  value: new Date(d.createdAt).toLocaleDateString("en-RW", { day: "2-digit", month: "short", year: "numeric" }) },
                      { label: "Customer", value: d.customer?.name },
                      { label: "Phone",    value: d.customer?.phone },
                      { label: "Email",    value: d.customer?.email },
                    ].filter(r => r.value).map(({ label, value }) => (
                      <div key={label} className="flex items-start gap-3">
                        <div>
                          <p className="text-xs text-custom-700">{label}</p>
                          <p className="text-sm font-semibold text-secondary-100">{value}</p>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>

                {/* Description */}
                {d.description && (
                  <div>
                    <p className="text-xs font-bold text-custom-700 uppercase tracking-wide mb-2">Description</p>
                    <p className="text-sm text-secondary-100 leading-relaxed">{d.description}</p>
                  </div>
                )}

                {/* Notes */}
                {d.notes && (
                  <div>
                    <p className="text-xs font-bold text-custom-700 uppercase tracking-wide mb-2">Notes</p>
                    <p className="text-sm text-secondary-100 leading-relaxed">{d.notes}</p>
                  </div>
                )}

                {/* Materials */}
                {items.length > 0 && (
                  <div className="border-t border-custom-300 pt-5">
                    <div className="flex items-center gap-2 mb-3">
                      <HiOutlineCube className="w-4 h-4 text-custom-700" />
                      <p className="text-xs font-bold text-custom-700 uppercase tracking-wide">
                        Materials / Stock Items ({items.length})
                      </p>
                    </div>
                    <div className="space-y-2">
                      {items.map((item, i) => {
                        const name     = item.stockItem?.itemName ?? item.stockItem?.name ?? item.itemName ?? `Item ${i + 1}`;
                        const unit     = item.stockItem?.unit ?? item.unit ?? "";
                        const isCustom = !item.stockItemId;
                        return (
                          <div key={item.id ?? i}
                            className={`flex items-center justify-between px-4 py-3 rounded-xl border bg-custom-50 ${
                              isCustom ? "border-yellow-200" : "border-custom-200"
                            }`}>
                            <div className="min-w-0">
                              <div className="flex items-center gap-2">
                                <p className="text-sm font-semibold text-secondary-100 truncate">{name}</p>
                                {isCustom && (
                                  <span className="text-[10px] font-bold px-1.5 py-0.5 rounded-full bg-yellow-100 text-yellow-700 shrink-0">custom</span>
                                )}
                              </div>
                              <p className="text-xs text-custom-700">
                                {item.stockItem?.category ?? ""}
                                {unit ? ` · ${unit}` : ""}
                                {item.unitCost ? ` · ${Number(item.unitCost).toLocaleString()} RWF/unit` : ""}
                              </p>
                              {item.notes && <p className="text-xs text-custom-500 italic mt-0.5">{item.notes}</p>}
                            </div>
                            <div className="text-right shrink-0 ml-4">
                              <p className="text-sm font-bold text-secondary-100">{item.quantityNeeded}</p>
                              {item.quantityUsed != null && (
                                <p className="text-xs text-custom-700">Used: {item.quantityUsed}</p>
                              )}
                            </div>
                          </div>
                        );
                      })}
                    </div>
                  </div>
                )}

                {/* Documents */}
                <div className="border-t border-custom-300 pt-5">
                  <div className="flex items-center gap-2 mb-3">
                    <HiOutlinePaperClip className="w-4 h-4 text-custom-700" />
                    <p className="text-xs font-bold text-custom-700 uppercase tracking-wide">
                      Documents {!loadingDocs && `(${docs.length})`}
                    </p>
                  </div>
                  {loadingDocs ? (
                    <p className="text-xs text-custom-700">Loading…</p>
                  ) : docs.length === 0 ? (
                    <div className="py-5 text-center rounded-xl border-2 border-dashed border-custom-200">
                      <HiOutlinePaperClip className="w-7 h-7 text-custom-400 mx-auto mb-1" />
                      <p className="text-sm text-custom-700">No documents attached</p>
                    </div>
                  ) : (
                    <div className="space-y-2">
                      {docs.map((doc) => (
                        <div key={doc.id}
                          className="flex items-center gap-3 p-3 rounded-xl border border-custom-200 bg-custom-50">
                          <div className="w-9 h-9 rounded-lg bg-white border border-custom-200 flex items-center justify-center shrink-0">
                            <HiOutlineDocumentText className={`w-5 h-5 ${getFileIcon(doc.mimeType)}`} />
                          </div>
                          <div className="min-w-0 flex-1">
                            <p className="text-sm font-semibold text-secondary-100 truncate">{doc.fileName}</p>
                            <p className="text-xs text-custom-700">{doc.mimeType}</p>
                          </div>
                          <a href={doc.fileUrl} download={doc.fileName}
                            className="p-1.5 rounded-lg hover:bg-primary-100 text-custom-700 hover:text-primary-600 transition-colors" title="Download">
                            <HiOutlineDownload className="w-4 h-4" />
                          </a>
                        </div>
                      ))}
                    </div>
                  )}
                </div>

              </div>
            )}
          </div>

          {/* Footer */}
          <div className="px-6 py-4 border-t border-custom-300 shrink-0 flex gap-3">
            {d && (
              <button
                onClick={() => printQuotation(d, jobItems)}
                className="flex items-center gap-2 px-4 py-2 rounded-xl bg-primary-500 text-white hover:bg-primary-600 transition-colors text-sm font-semibold"
              >
                <HiOutlineDownload className="w-4 h-4" /> Download Quotation
              </button>
            )}
            <button onClick={onClose}
              className="flex-1 px-4 py-2 rounded-xl bg-custom-100 text-secondary-100 hover:bg-custom-200 transition-colors text-sm font-semibold">
              Close
            </button>
          </div>
        </Card>
      </div>
    </div>
  );
}

type ModalMode = "approve" | "reject" | "assign" | "verify";

export default function DAFJobApprovalPage() {
  const [search, setSearch]           = useState("");
  const [page, setPage]               = useState(1);
  const [selectedJob, setSelectedJob] = useState<Job | null>(null);
  const [modalMode, setModalMode]     = useState<ModalMode>("approve");
  const [showModal, setShowModal]     = useState(false);
  const [approvalNotes, setApprovalNotes] = useState("");
  const [rejectReason, setRejectReason]   = useState("");
  const [assignDeptId, setAssignDeptId]   = useState("");
  const [openMenuId, setOpenMenuId]         = useState<string | null>(null);
  const [detailsJobId, setDetailsJobId]     = useState<string | null>(null);
  const menuRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const handler = (e: MouseEvent) => {
      if (menuRef.current && !menuRef.current.contains(e.target as Node)) {
        setOpenMenuId(null);
      }
    };
    document.addEventListener("mousedown", handler);
    return () => document.removeEventListener("mousedown", handler);
  }, []);

  const { data: pendingData,   isLoading: loadingPending, isFetching: fetchingPending,   refetch: refetchPending   } = useGetJobsQuery({ status: "pending",   limit: 100 });
  const { data: confirmedData, refetch: refetchConfirmed } = useGetJobsQuery({ status: "confirmed", limit: 100 });
  const { data: rejectedData,  refetch: refetchRejected  } = useGetJobsQuery({ status: "rejected",  limit: 100 });
  const { data: completedData, refetch: refetchCompleted } = useGetJobsQuery({ status: "completed", limit: 100 });
  const { data: verifiedData,  refetch: refetchVerified  } = useGetJobsQuery({ status: "verified",  limit: 100 });

  const refetchAll = () => { refetchPending(); refetchConfirmed(); refetchRejected(); refetchCompleted(); refetchVerified(); };
  const { data: departments = [] }                         = useGetDepartmentsQuery();

  const [approveJob, { isLoading: approving }] = useApproveJobMutation();
  const [rejectJob,  { isLoading: rejecting }] = useRejectJobMutation();
  const [assignJob,  { isLoading: assigning }] = useAssignJobMutation();
  const [verifyJob,  { isLoading: verifying }] = useVerifyJobMutation();

  const pendingJobs   = pendingData?.jobs   ?? [];
  const approvedJobs  = confirmedData?.jobs ?? [];
  const rejectedJobs  = rejectedData?.jobs  ?? [];
  const completedJobs = completedData?.jobs ?? [];
  const verifiedJobs  = verifiedData?.jobs  ?? [];
  const allJobs       = [...pendingJobs, ...approvedJobs, ...rejectedJobs, ...completedJobs, ...verifiedJobs];

  const filtered = allJobs.filter(
    (job) =>
      job.jobNumber?.toLowerCase().includes(search.toLowerCase()) ||
      job.customer?.name?.toLowerCase().includes(search.toLowerCase()) ||
      job.title?.toLowerCase().includes(search.toLowerCase())
  );

  const PAGE_SIZE  = 5;
  const totalPages = Math.max(1, Math.ceil(filtered.length / PAGE_SIZE));
  const paginated  = filtered.slice((page - 1) * PAGE_SIZE, page * PAGE_SIZE);

  const openModal = (job: Job, mode: ModalMode) => {
    setSelectedJob(job);
    setModalMode(mode);
    setApprovalNotes("");
    setRejectReason("");
    setAssignDeptId(job.departmentAssignedToId ?? "");
    setOpenMenuId(null);
    setShowModal(true);
  };

  const closeModal = () => { setShowModal(false); setSelectedJob(null); };

  const handleApprove = async () => {
    if (!selectedJob) return;
    try { await approveJob(selectedJob.id).unwrap(); closeModal(); }
    catch { alert("Failed to confirm job. Please try again."); }
  };

  const handleReject = async () => {
    if (!selectedJob) return;
    if (!rejectReason.trim()) { alert("Please provide a reason for rejection"); return; }
    try { await rejectJob({ id: selectedJob.id, rejectReason }).unwrap(); closeModal(); }
    catch { alert("Failed to reject job. Please try again."); }
  };

  const handleAssign = async () => {
    if (!selectedJob || !assignDeptId) { alert("Please select a department"); return; }
    try { await assignJob({ id: selectedJob.id, departmentAssignedToId: assignDeptId }).unwrap(); closeModal(); }
    catch { alert("Failed to assign job. Please try again."); }
  };

  const handleVerify = async () => {
    if (!selectedJob) return;
    try {
      await verifyJob(selectedJob.id).unwrap();
      closeModal();
    } catch { alert("Failed to verify job. Please try again."); }
  };

  const totalPendingValue = pendingJobs.reduce((sum, j) => sum + (Number(j.amount) || 0), 0);

  return (
    <DashboardLayout>
      <div className="space-y-6 font-[family-name:var(--font-family-primary)]">

        {/* Header */}
        <div>
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-2xl md:text-3xl font-bold text-secondary-100">Job Financial Approval</h1>
              <p className="text-sm text-custom-700 mt-1">Review and confirm pending jobs before production</p>
            </div>
            <button
              onClick={refetchAll}
              className="flex items-center gap-2 px-4 py-2 rounded-xl border border-custom-300 hover:bg-custom-100 transition-colors"
              title="Refresh"
            >
              <HiOutlineRefresh className={`w-4 h-4 ${fetchingPending ? "animate-spin" : ""}`} />
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
                <p className="text-xs text-custom-700">Pending</p>
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
                  {totalPendingValue.toLocaleString()} <span className="text-xs font-normal text-custom-700">RWF</span>
                </p>
              </div>
            </div>
          </Card>
        </div>

        {/* Table */}
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
                  onChange={(e) => { setSearch(e.target.value); setPage(1); }}
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
              <tbody className="divide-y divide-custom-200">
                {loadingPending ? (
                  <tr><td colSpan={7} className="px-4 py-8 text-center text-custom-700">Loading…</td></tr>
                ) : filtered.length === 0 ? (
                  <tr><td colSpan={7} className="px-4 py-8 text-center text-custom-700">No jobs found</td></tr>
                ) : (
                  paginated.map((job) => {
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
                          <span className="text-sm font-semibold text-secondary-100 block">{job.title}</span>
                          <span className="text-xs text-custom-700">{job.customer?.name ?? "—"}</span>
                          {job.customer?.phone && (
                            <span className="text-xs text-custom-500 block">{job.customer.phone}</span>
                          )}
                        </td>
                        <td className="px-4 py-4">
                          <span className="text-sm font-bold text-secondary-100">
                            {job.amount != null ? `${Number(job.amount).toLocaleString()} RWF` : "—"}
                          </span>
                        </td>
                        <td className="px-4 py-4">
                          <span className={`text-xs font-bold px-3 py-1 rounded-full ${priorityColor[job.priority] ?? "bg-gray-200 text-gray-700"}`}>
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
                          <div className="flex items-center justify-end gap-1" ref={openMenuId === job.id ? menuRef : undefined}>
                            <button
                              onClick={() => setDetailsJobId(job.id)}
                              className="p-2 rounded-lg hover:bg-custom-100 transition-colors"
                              title="View details"
                            >
                              <HiOutlineEye className="w-5 h-5 text-custom-700" />
                            </button>

                            {/* Verified icon badge */}
                            {job.status === "verified" && (
                              <span className="p-2 text-emerald-600" title="Verified">
                                <HiOutlineBadgeCheck className="w-5 h-5" />
                              </span>
                            )}

                            {/* Verify button — pending only */}
                            {isPending && (
                              <button
                                onClick={() => openModal(job, "verify")}
                                className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-blue-50 border border-blue-200 text-blue-700 hover:bg-blue-100 transition-colors text-xs font-semibold"
                                title="Verify job"
                              >
                                <HiOutlineBadgeCheck className="w-4 h-4" /> Verify
                              </button>
                            )}

                            {/* Dots menu — pending and verified */}
                            {(isPending || job.status === "verified") && (
                              <button
                                onClick={(e) => { e.stopPropagation(); setOpenMenuId(openMenuId === job.id ? null : job.id); }}
                                className="p-2 rounded-lg hover:bg-custom-100 transition-colors"
                              >
                                <HiOutlineDotsVertical className="w-5 h-5 text-custom-700" />
                              </button>
                            )}

                            {openMenuId === job.id && (
                              <div className="absolute right-4 mt-1 w-44 bg-white rounded-xl shadow-lg border border-custom-200 z-50 overflow-hidden">
                                <button
                                  onClick={() => openModal(job, "approve")}
                                  className="w-full flex items-center gap-2 px-4 py-2.5 text-sm text-green-700 hover:bg-green-50 transition-colors"
                                >
                                  <HiOutlineCheckCircle className="w-4 h-4" /> Confirm
                                </button>
                                <button
                                  onClick={() => openModal(job, "reject")}
                                  className="w-full flex items-center gap-2 px-4 py-2.5 text-sm text-red-600 hover:bg-red-50 transition-colors"
                                >
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

        {/* Pagination */}
        {filtered.length > 0 && (
          <div className="flex items-center justify-between">
            <p className="text-xs text-custom-700">
              Showing{" "}
              <span className="font-semibold text-secondary-100">
                {(page - 1) * PAGE_SIZE + 1}–{Math.min(page * PAGE_SIZE, filtered.length)}
              </span>{" "}
              of <span className="font-semibold text-secondary-100">{filtered.length}</span> jobs
            </p>
            <div className="flex items-center gap-1">
              <button
                onClick={() => setPage((p) => Math.max(1, p - 1))}
                disabled={page === 1}
                className="px-3 py-1.5 rounded-lg border border-custom-300 text-xs font-semibold text-secondary-100 hover:bg-custom-100 disabled:opacity-40 transition-colors"
              >
                Prev
              </button>
              {Array.from({ length: totalPages }, (_, i) => i + 1).map((n) => (
                <button
                  key={n}
                  onClick={() => setPage(n)}
                  className={`w-8 h-8 rounded-lg text-xs font-bold transition-colors ${
                    n === page
                      ? "bg-primary-500 text-white"
                      : "border border-custom-300 text-secondary-100 hover:bg-custom-100"
                  }`}
                >
                  {n}
                </button>
              ))}
              <button
                onClick={() => setPage((p) => Math.min(totalPages, p + 1))}
                disabled={page === totalPages}
                className="px-3 py-1.5 rounded-lg border border-custom-300 text-xs font-semibold text-secondary-100 hover:bg-custom-100 disabled:opacity-40 transition-colors"
              >
                Next
              </button>
            </div>
          </div>
        )}

        {/* Job Details Modal */}
        {detailsJobId && (
          <JobDetailsModal jobId={detailsJobId} onClose={() => setDetailsJobId(null)} />
        )}

        {/* Action Modal */}
        {showModal && selectedJob && (
          <div className="fixed inset-0 bg-secondary-100/50 z-50 flex items-center justify-center p-4">
            <Card className="!p-6 max-w-lg w-full">
              <div className="flex items-start justify-between mb-4">
                <div>
                  <h3 className="text-xl font-bold text-secondary-100 capitalize">
                    {modalMode === "approve" && "Confirm Job"}
                    {modalMode === "reject"  && "Reject Job"}
                    {modalMode === "assign"  && "Assign to Department"}
                    {modalMode === "verify"  && "Verify Job"}
                  </h3>
                  <p className="text-sm text-custom-700 mt-1">{selectedJob.jobNumber} — {selectedJob.title}</p>
                </div>
                <button onClick={closeModal} className="text-custom-700 hover:text-secondary-100">
                  <HiOutlineX className="w-6 h-6" />
                </button>
              </div>

              {/* Job summary */}
              <div className="p-3 rounded-xl bg-custom-50 border border-custom-200 mb-4 text-sm space-y-2">
                <div className="grid grid-cols-2 gap-2">
                  <div><span className="text-custom-700">Client: </span><span className="font-semibold text-secondary-100">{selectedJob.customer?.name ?? "—"}</span></div>
                  <div><span className="text-custom-700">Amount: </span><span className="font-semibold text-secondary-100">{selectedJob.amount != null ? `${Number(selectedJob.amount).toLocaleString()} RWF` : "—"}</span></div>
                  <div><span className="text-custom-700">Status: </span><span className="font-semibold text-secondary-100">{selectedJob.status}</span></div>
                  <div><span className="text-custom-700">Deadline: </span><span className="font-semibold text-secondary-100">{selectedJob.dueDate ? selectedJob.dueDate.split("T")[0] : "—"}</span></div>
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
                    <textarea value={approvalNotes} onChange={(e) => setApprovalNotes(e.target.value)} rows={3}
                      placeholder="Confirmation notes…"
                      className="w-full px-4 py-2 rounded-xl border border-custom-300 focus:outline-none focus:border-primary-500 resize-none" />
                  </div>
                  <button onClick={handleApprove} disabled={approving}
                    className="w-full px-4 py-2 rounded-xl bg-green-500 text-white hover:bg-green-600 transition-colors text-sm font-semibold flex items-center justify-center gap-2 disabled:opacity-60">
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
                    <textarea value={rejectReason} onChange={(e) => setRejectReason(e.target.value)} rows={4}
                      placeholder="Explain why this job is being rejected…"
                      className="w-full px-4 py-2 rounded-xl border border-custom-300 focus:outline-none focus:border-primary-500 resize-none" />
                  </div>
                  <button onClick={handleReject} disabled={rejecting}
                    className="w-full px-4 py-2 rounded-xl bg-red-500 text-white hover:bg-red-600 transition-colors text-sm font-semibold flex items-center justify-center gap-2 disabled:opacity-60">
                    <HiOutlineXCircle className="w-4 h-4" />
                    {rejecting ? "Rejecting…" : "Confirm Rejection"}
                  </button>
                </div>
              )}

              {/* Verify */}
              {modalMode === "verify" && (
                <div className="space-y-3">
                  <p className="text-sm text-custom-700">This will mark the job as <span className="font-semibold text-secondary-100">verified</span>. This action cannot be undone.</p>
                  <button
                    onClick={handleVerify}
                    disabled={verifying}
                    className="w-full px-4 py-2 rounded-xl bg-blue-600 hover:bg-blue-700 text-white transition-colors text-sm font-semibold flex items-center justify-center gap-2 disabled:opacity-60"
                  >
                    <HiOutlineBadgeCheck className="w-4 h-4" />
                    {verifying ? "Verifying…" : "Mark as Verified"}
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
                    <select value={assignDeptId} onChange={(e) => setAssignDeptId(e.target.value)}
                      className="w-full px-4 py-2 rounded-xl border border-custom-300 focus:outline-none focus:border-primary-500">
                      <option value="">Select department…</option>
                      {departments.map((d) => <option key={d.id} value={d.id}>{d.name}</option>)}
                    </select>
                  </div>
                  <button onClick={handleAssign} disabled={assigning}
                    className="w-full px-4 py-2 rounded-xl bg-blue-500 text-white hover:bg-blue-600 transition-colors text-sm font-semibold flex items-center justify-center gap-2 disabled:opacity-60">
                    <HiOutlineArrowRight className="w-4 h-4" />
                    {assigning ? "Assigning…" : "Assign Department"}
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
