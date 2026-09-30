import { useState } from "react";
import {
  HiOutlineCalendar,
  HiOutlineCheckCircle,
  HiOutlineDocumentText,
  HiOutlineDownload,
  HiOutlineMail,
  HiOutlinePhone,
  HiOutlineUser,
  HiOutlineXCircle,
} from "react-icons/hi";
import { Button, Card } from "../../components/ui";
import {
  useApproveJobMutation,
  useGetJobsQuery,
  useRejectJobMutation,
} from "../../store/services/jobsService";

// ─── Component ────────────────────────────────────────────────────────────────

export default function ThesisJobsPage() {
  const [selectedJob, setSelectedJob] = useState<string | null>(null);
  const [rejectReason, setRejectReason] = useState("");
  const [showRejectModal, setShowRejectModal] = useState(false);

  // Fetch pending thesis jobs
  const { data, isLoading, refetch } = useGetJobsQuery({
    isThesisJob: true,
    status: "pending",
    limit: 100,
  });

  const [approveJob, { isLoading: isApproving }] = useApproveJobMutation();
  const [rejectJob, { isLoading: isRejecting }] = useRejectJobMutation();

  const thesisJobs = data?.jobs ?? [];

  // ─── Handlers ─────────────────────────────────────────────────────────────────

  const handleApprove = async (jobId: string) => {
    try {
      await approveJob(jobId).unwrap();
      refetch();
    } catch (error) {
      console.error("Failed to approve thesis job:", error);
      alert("Failed to approve job. Please try again.");
    }
  };

  const handleRejectClick = (jobId: string) => {
    setSelectedJob(jobId);
    setShowRejectModal(true);
  };

  const handleRejectSubmit = async () => {
    if (!selectedJob || !rejectReason.trim()) {
      alert("Please provide a reason for rejection");
      return;
    }

    try {
      await rejectJob({ id: selectedJob, rejectReason: rejectReason }).unwrap();
      setShowRejectModal(false);
      setRejectReason("");
      setSelectedJob(null);
      refetch();
    } catch (error) {
      console.error("Failed to reject thesis job:", error);
      alert("Failed to reject job. Please try again.");
    }
  };

  const handleDownloadDocument = (fileUrl: string, fileName: string) => {
    const link = document.createElement("a");
    link.href = fileUrl;
    link.download = fileName;
    link.click();
  };

  // ─── Render ───────────────────────────────────────────────────────────────────

  if (isLoading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary-500 mx-auto mb-4"></div>
          <p className="text-secondary-200">Loading thesis jobs...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6 font-[family-name:var(--font-family-primary)]">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl md:text-3xl font-bold text-secondary-100">
            Thesis Jobs - Pending Approval
          </h1>
          <p className="text-sm text-secondary-300 mt-1">
            Review and approve thesis print & binding jobs
          </p>
        </div>
        <div className="flex items-center gap-2">
          <div className="px-4 py-2 rounded-lg bg-primary-100 text-primary-700">
            <span className="text-2xl font-bold">{thesisJobs.length}</span>
            <span className="text-xs ml-2">Pending</span>
          </div>
        </div>
      </div>

      {/* Jobs List */}
      {thesisJobs.length === 0 ? (
        <Card className="py-12 text-center">
          <HiOutlineCheckCircle className="w-16 h-16 text-success-400 mx-auto mb-4" />
          <h3 className="text-xl font-semibold text-secondary-100 mb-2">
            All Caught Up!
          </h3>
          <p className="text-secondary-300">
            There are no thesis jobs pending approval at the moment.
          </p>
        </Card>
      ) : (
        <div className="grid grid-cols-1 gap-6">
          {thesisJobs.map((job) => (
            <Card key={job.id} className="overflow-hidden">
              {/* Job Header */}
              <div className="flex items-start justify-between mb-4 pb-4 border-b border-custom-400">
                <div>
                  <div className="flex items-center gap-3 mb-2">
                    <h3 className="text-xl font-semibold text-secondary-100">
                      {job.jobNumber}
                    </h3>
                    <span className="px-3 py-1 rounded-full bg-yellow-100 text-yellow-700 text-xs font-semibold">
                      Pending Approval
                    </span>
                  </div>
                  <p className="text-sm text-secondary-300 flex items-center gap-2">
                    <HiOutlineCalendar className="w-4 h-4" />
                    Created:{" "}
                    {new Date(job.createdAt).toLocaleDateString("en-RW", {
                      year: "numeric",
                      month: "short",
                      day: "numeric",
                      hour: "2-digit",
                      minute: "2-digit",
                    })}
                  </p>
                </div>
                <div className="text-right">
                  <p className="text-2xl font-bold text-primary-500">
                    {Number(job.amount).toLocaleString()} RWF
                  </p>
                  <p className="text-xs text-secondary-300">
                    {job.quantity} {job.quantity === 1 ? "copy" : "copies"}
                  </p>
                </div>
              </div>

              {/* Thesis Owner Information */}
              {job.thesisOwner && (
                <div className="mb-4 p-4 rounded-lg bg-custom-400/30">
                  <h4 className="text-sm font-semibold text-secondary-100 mb-3 flex items-center gap-2">
                    <HiOutlineUser className="w-4 h-4" />
                    Student/Owner Information
                  </h4>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                    <div>
                      <p className="text-xs text-secondary-300 mb-1">
                        Full Name
                      </p>
                      <p className="text-sm font-medium text-secondary-100">
                        {job.thesisOwner.fullName}
                      </p>
                    </div>
                    <div>
                      <p className="text-xs text-secondary-300 mb-1">
                        Phone Number
                      </p>
                      <p className="text-sm font-medium text-secondary-100 flex items-center gap-2">
                        <HiOutlinePhone className="w-4 h-4" />
                        {job.thesisOwner.phone}
                      </p>
                    </div>
                    {job.thesisOwner.email && (
                      <div>
                        <p className="text-xs text-secondary-300 mb-1">Email</p>
                        <p className="text-sm font-medium text-secondary-100 flex items-center gap-2">
                          <HiOutlineMail className="w-4 h-4" />
                          {job.thesisOwner.email}
                        </p>
                      </div>
                    )}
                    <div className="md:col-span-2">
                      <p className="text-xs text-secondary-300 mb-1">
                        Description
                      </p>
                      <p className="text-sm text-secondary-200 leading-relaxed">
                        {job.thesisOwner.description}
                      </p>
                    </div>
                  </div>
                </div>
              )}

              {/* Job Details */}
              <div className="mb-4 grid grid-cols-2 md:grid-cols-4 gap-4">
                <div>
                  <p className="text-xs text-secondary-300 mb-1">
                    Binding Type
                  </p>
                  <p className="text-sm font-medium text-secondary-100">
                    {job.bindingType || "—"}
                  </p>
                </div>
                <div>
                  <p className="text-xs text-secondary-300 mb-1">Priority</p>
                  <span
                    className={`inline-block px-2 py-1 rounded text-xs font-semibold ${
                      job.priority === "urgent"
                        ? "bg-red-100 text-red-700"
                        : job.priority === "high"
                          ? "bg-orange-100 text-orange-700"
                          : job.priority === "normal"
                            ? "bg-blue-100 text-blue-700"
                            : "bg-gray-100 text-gray-700"
                    }`}
                  >
                    {job.priority.toUpperCase()}
                  </span>
                </div>
                {job.dueDate && (
                  <div>
                    <p className="text-xs text-secondary-300 mb-1">Due Date</p>
                    <p className="text-sm font-medium text-secondary-100">
                      {new Date(job.dueDate).toLocaleDateString("en-RW")}
                    </p>
                  </div>
                )}
                <div>
                  <p className="text-xs text-secondary-300 mb-1">Created By</p>
                  <p className="text-sm font-medium text-secondary-100">
                    {job.createdById || "—"}
                  </p>
                </div>
              </div>

              {/* Additional Notes */}
              {job.notes && (
                <div className="mb-4 p-3 rounded-lg bg-blue-50 border border-blue-200">
                  <p className="text-xs font-semibold text-blue-700 mb-1">
                    Additional Notes
                  </p>
                  <p className="text-sm text-blue-900">{job.notes}</p>
                </div>
              )}

              {/* Documents */}
              {job.documents && job.documents.length > 0 && (
                <div className="mb-4">
                  <p className="text-sm font-semibold text-secondary-100 mb-2 flex items-center gap-2">
                    <HiOutlineDocumentText className="w-4 h-4" />
                    Attached Documents ({job.documents.length})
                  </p>
                  <div className="space-y-2">
                    {job.documents.map((doc) => (
                      <div
                        key={doc.id}
                        className="flex items-center justify-between p-3 bg-custom-400/50 rounded-lg hover:bg-custom-400 transition-colors"
                      >
                        <div className="flex items-center gap-3 flex-1 min-w-0">
                          <HiOutlineDocumentText className="w-5 h-5 text-primary-400 flex-shrink-0" />
                          <div className="min-w-0 flex-1">
                            <p className="text-sm font-medium text-secondary-100 truncate">
                              {doc.fileName}
                            </p>
                            <p className="text-xs text-secondary-300">
                              {doc.mimeType} •{" "}
                              {new Date(doc.createdAt).toLocaleDateString()}
                            </p>
                          </div>
                        </div>
                        <button
                          onClick={() =>
                            handleDownloadDocument(doc.fileUrl, doc.fileName)
                          }
                          className="flex items-center gap-2 px-3 py-1.5 rounded-lg bg-primary-500 text-white hover:bg-primary-600 transition-colors text-sm font-medium flex-shrink-0"
                        >
                          <HiOutlineDownload className="w-4 h-4" />
                          Download
                        </button>
                      </div>
                    ))}
                  </div>
                </div>
              )}

              {/* Action Buttons */}
              <div className="flex items-center justify-end gap-3 pt-4 border-t border-custom-400">
                <Button
                  variant="outline"
                  onClick={() => handleRejectClick(job.id)}
                  disabled={isApproving || isRejecting}
                  className="flex items-center gap-2 border-danger-400 text-danger-600 hover:bg-danger-50"
                >
                  <HiOutlineXCircle className="w-5 h-5" />
                  Reject
                </Button>
                <Button
                  variant="primary"
                  onClick={() => handleApprove(job.id)}
                  disabled={isApproving || isRejecting}
                  className="flex items-center gap-2"
                >
                  <HiOutlineCheckCircle className="w-5 h-5" />
                  {isApproving ? "Approving..." : "Approve Job"}
                </Button>
              </div>
            </Card>
          ))}
        </div>
      )}

      {/* Reject Modal */}
      {showRejectModal && (
        <div className="fixed inset-0 bg-black/60 backdrop-blur-sm z-50 flex items-center justify-center p-4">
          <Card className="w-full max-w-md">
            <div className="flex items-center gap-3 mb-4 pb-4 border-b border-custom-400">
              <div className="p-2 rounded-lg bg-danger-100">
                <HiOutlineXCircle className="w-6 h-6 text-danger-600" />
              </div>
              <div>
                <h3 className="text-lg font-semibold text-secondary-100">
                  Reject Thesis Job
                </h3>
                <p className="text-sm text-secondary-300">
                  Please provide a reason for rejection
                </p>
              </div>
            </div>

            <div className="mb-6">
              <label className="block text-sm font-medium text-secondary-200 mb-2">
                Rejection Reason <span className="text-danger-400">*</span>
              </label>
              <textarea
                value={rejectReason}
                onChange={(e) => setRejectReason(e.target.value)}
                placeholder="E.g., Incomplete information, insufficient documentation, etc."
                rows={4}
                className="w-full px-4 py-2.5 rounded-xl border border-custom-400 bg-style-500 text-secondary-100 focus:outline-none focus:border-danger-400 focus:ring-2 focus:ring-danger-200 transition-colors duration-200 resize-none"
                disabled={isRejecting}
              />
            </div>

            <div className="flex items-center justify-end gap-3">
              <Button
                variant="outline"
                onClick={() => {
                  setShowRejectModal(false);
                  setRejectReason("");
                  setSelectedJob(null);
                }}
                disabled={isRejecting}
              >
                Cancel
              </Button>
              <Button
                variant="outline"
                onClick={handleRejectSubmit}
                disabled={isRejecting || !rejectReason.trim()}
                className="border-red-500 text-red-600 hover:bg-red-50"
              >
                {isRejecting ? "Rejecting..." : "Confirm Rejection"}
              </Button>
            </div>
          </Card>
        </div>
      )}
    </div>
  );
}
