import { useEffect, useRef, useState } from "react";
import {
  HiOutlineArrowRight,
  HiOutlineCheckCircle,
  HiOutlineCurrencyDollar,
  HiOutlineDotsVertical,
  HiOutlineExclamationCircle,
  HiOutlineEye,
  HiOutlineSearch,
  HiOutlineX,
  HiOutlineXCircle,
} from "react-icons/hi";
import { DashboardLayout } from "../../components";
import { Card } from "../../components/ui";
import { useGetDepartmentsQuery } from "../../store/services/departmentsService";
import {
  useApproveJobMutation,
  useAssignJobMutation,
  useGetJobDetailsQuery,
  useGetJobsQuery,
  useRejectJobMutation,
  type Job,
} from "../../store/services/jobsService";
import { jobStatusConfig } from "../../types/JobStatus";

const priorityColor: Record<string, string> = {
  high:   "bg-red-500 text-white",
  urgent: "bg-red-700 text-white",
  normal: "bg-yellow-500 text-white",
  low:    "bg-green-500 text-white",
};

function Row({ label, value }: { label: string; value?: string | number | null }) {
  if (!value && value !== 0) return null;
  return (
    <div className="flex justify-between gap-2">
      <span className="text-custom-700 shrink-0">{label}</span>
      <span className="font-semibold text-secondary-100 text-right">{value}</span>
    </div>
  );
}

function Section({ title, children }: { title: string; children: React.ReactNode }) {
  return (
    <div>
      <p className="text-xs font-bold text-custom-700 uppercase tracking-wide mb-2">{title}</p>
      <div className="p-3 rounded-xl bg-custom-50 border border-custom-200 space-y-1.5 text-sm">
        {children}
      </div>
    </div>
  );
}

function JobDetailsModal({ jobId, onClose }: { jobId: string; onClose: () => void }) {
  const { data: d, isLoading } = useGetJobDetailsQuery(jobId);
  const items = d?.jobItems ?? [];
  return (
    <div className="fixed inset-0 bg-secondary-100/50 z-50 flex items-center justify-center p-4">
      <Card className="!p-6 w-full max-w-2xl max-h-[90vh] overflow-y-auto">
        <div className="flex items-center justify-between mb-5">
          <div>
            <h3 className="text-xl font-bold text-secondary-100">Job Details</h3>
            {d && <p className="text-xs text-custom-700 mt-0.5">{d.jobNumber} — {d.title}</p>}
          </div>
          <button onClick={onClose} className="text-custom-700 hover:text-secondary-100">
            <HiOutlineX className="w-6 h-6" />
          </button>
        </div>

        {isLoading ? (
          <p className="text-center text-custom-700 py-10">Loading…</p>
        ) : !d ? (
          <p className="text-center text-custom-700 py-10">Details not available.</p>
        ) : (
          <div className="space-y-5">

            {/* Client */}
            <Section title="Client">
              <Row label="Name"    value={d.customer?.name} />
              <Row label="Company" value={d.customer?.company} />
              <Row label="Phone"   value={d.customer?.phone} />
              <Row label="Email"   value={d.customer?.email} />
            </Section>

            {/* Job info */}
            <Section title="Job Information">
              <Row label="Job #"       value={d.jobNumber} />
              <Row label="Title"       value={d.title} />
              <Row label="Type"        value={d.jobType} />
              <Row label="Quantity"    value={d.quantity} />
              <Row label="Size"        value={d.size} />
              <Row label="Color Mode" value={d.colorMode} />
              <Row label="Binding"     value={d.bindingType} />
              <Row label="Priority"    value={d.priority} />
              <Row label="Status"      value={d.status} />
              <Row label="Deadline"    value={d.dueDate?.split("T")[0]} />
              <Row label="Created"     value={new Date(d.createdAt).toLocaleDateString()} />
              {d.description && (
                <div className="pt-1 border-t border-custom-200">
                  <p className="text-custom-700 mb-0.5">Description</p>
                  <p className="text-secondary-100 font-medium leading-snug">{d.description}</p>
                </div>
              )}
              {d.notes && (
                <div className="pt-1 border-t border-custom-200">
                  <p className="text-custom-700 mb-0.5">Notes</p>
                  <p className="text-secondary-100 font-medium leading-snug">{d.notes}</p>
                </div>
              )}
            </Section>

            {/* Materials — right after Job Information */}
            <Section title="Materials Needed">
              {!items.length ? (
                <p className="text-custom-700 italic">No materials listed.</p>
              ) : (
                items.map((item) => (
                  <div key={item.id} className="flex items-center justify-between">
                    <span className="font-semibold text-secondary-100">
                      {item.stockItem?.itemName ?? "—"}
                    </span>
                    <span className="text-xs text-custom-700">
                      {item.quantityNeeded} {item.stockItem?.unit ?? ""}{item.notes ? ` · ${item.notes}` : ""}
                    </span>
                  </div>
                ))
              )}
            </Section>

            {/* Financial */}
            <Section title="Financial">
              <Row label="Amount"         value={d.amount != null ? `${Number(d.amount).toLocaleString()} RWF` : null} />
              <Row label="Payment Status" value={d.paymentStatus} />
              <Row label="Payment Method" value={d.paymentMethod} />
              <Row label="Receipt #"      value={d.receiptNo} />
            </Section>

            {/* Department position */}
            <Section title="Department Position">
              {!d.departmentPosition ? (
                <p className="text-custom-700 italic">Not yet assigned to a department.</p>
              ) : (
                <>
                  <Row label="Department"   value={d.departmentPosition.department?.name} />
                  <Row label="State"        value={d.departmentPosition.state} />
                  <Row label="In Production" value={d.departmentPosition.inProduction} />
                  <Row label="Progress"     value={d.departmentPosition.progress} />
                  {d.departmentPosition.startedAt   && <Row label="Started"   value={new Date(d.departmentPosition.startedAt).toLocaleString()} />}
                  {d.departmentPosition.pausedAt    && <Row label="Paused"    value={new Date(d.departmentPosition.pausedAt).toLocaleString()} />}
                  {d.departmentPosition.resumedAt   && <Row label="Resumed"   value={new Date(d.departmentPosition.resumedAt).toLocaleString()} />}
                  {d.departmentPosition.completedAt && <Row label="Completed" value={new Date(d.departmentPosition.completedAt).toLocaleString()} />}
                  {d.departmentPosition.supervisors?.length > 0 && (
                    <div className="pt-1 border-t border-custom-200">
                      <p className="text-custom-700 mb-1">Supervisors</p>
                      <div className="space-y-1">
                        {d.departmentPosition.supervisors.map((s) => (
                          <div key={s.id} className="flex items-center justify-between">
                            <span className="font-semibold text-secondary-100">{s.name}</span>
                            <span className="text-xs text-custom-700">{s.phone}</span>
                          </div>
                        ))}
                      </div>
                    </div>
                  )}
                </>
              )}
            </Section>

            {/* Assigned workers */}
            <Section title="Assigned Workers">
              {!d.assignedWorkers?.length ? (
                <p className="text-custom-700 italic">No workers assigned.</p>
              ) : (
                d.assignedWorkers.map((w) => (
                  <div key={w.id} className="flex items-center justify-between">
                    <div>
                      <p className="font-semibold text-secondary-100">{w.fullName}</p>
                      <p className="text-xs text-custom-700">{w.department?.name ?? "—"} · {w.phoneNumber}</p>
                    </div>
                    <p className="text-xs text-custom-700">{new Date(w.EmployeeJobAssignment.assignedAt).toLocaleDateString()}</p>
                  </div>
                ))
              )}
            </Section>

          </div>
        )}

        <button
          onClick={onClose}
          className="mt-5 w-full px-4 py-2 rounded-xl bg-blue-500 text-white hover:bg-blue-600 transition-colors text-sm font-semibold"
        >
          Close
        </button>
      </Card>
    </div>
  );
}

type ModalMode = "approve" | "reject" | "assign";

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

  const { data: pendingData,   isLoading: loadingPending } = useGetJobsQuery({ status: "pending",   limit: 100 });
  const { data: confirmedData }                            = useGetJobsQuery({ status: "confirmed", limit: 100 });
  const { data: rejectedData }                             = useGetJobsQuery({ status: "rejected",  limit: 100 });
  const { data: completedData }                            = useGetJobsQuery({ status: "completed", limit: 100 });
  const { data: departments = [] }                         = useGetDepartmentsQuery();

  const [approveJob, { isLoading: approving }] = useApproveJobMutation();
  const [rejectJob,  { isLoading: rejecting }] = useRejectJobMutation();
  const [assignJob,  { isLoading: assigning }] = useAssignJobMutation();

  const pendingJobs   = pendingData?.jobs   ?? [];
  const approvedJobs  = confirmedData?.jobs ?? [];
  const rejectedJobs  = rejectedData?.jobs  ?? [];
  const completedJobs = completedData?.jobs ?? [];
  const allJobs       = [...pendingJobs, ...approvedJobs, ...rejectedJobs, ...completedJobs];

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

  const totalPendingValue = pendingJobs.reduce((sum, j) => sum + (Number(j.amount) || 0), 0);

  return (
    <DashboardLayout>
      <div className="space-y-6 font-[family-name:var(--font-family-primary)]">

        {/* Header */}
        <div>
          <h1 className="text-2xl md:text-3xl font-bold text-secondary-100">Job Financial Approval</h1>
          <p className="text-sm text-custom-700 mt-1">Review and confirm pending jobs before production</p>
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
                          <div
                            className="flex items-center justify-end gap-1"
                            ref={openMenuId === job.id ? menuRef : undefined}
                          >
                            <button
                              onClick={() => setDetailsJobId(job.id)}
                              className="p-2 rounded-lg hover:bg-custom-100 transition-colors"
                              title="View details"
                            >
                              <HiOutlineEye className="w-5 h-5 text-custom-700" />
                            </button>
                            {isPending && (
                            <button
                              onClick={(e) => { e.stopPropagation(); setOpenMenuId(openMenuId === job.id ? null : job.id); }}
                              className="p-2 rounded-lg hover:bg-custom-100 transition-colors"
                            >
                              <HiOutlineDotsVertical className="w-5 h-5 text-custom-700" />
                            </button>
                            )}
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
