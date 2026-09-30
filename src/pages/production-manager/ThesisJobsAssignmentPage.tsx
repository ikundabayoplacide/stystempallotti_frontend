import { useState } from "react";
import {
  HiOutlineCalendar,
  HiOutlineCheckCircle,
  HiOutlineDocumentText,
  HiOutlineDownload,
  HiOutlineOfficeBuilding,
  HiOutlinePhone,
  HiOutlineUser,
} from "react-icons/hi";
import { Button, Card } from "../../components/ui";
import { useGetDepartmentsQuery } from "../../store/services/departmentsService";
import {
  useAssignJobMutation,
  useGetJobsQuery,
} from "../../store/services/jobsService";

// ─── Component ────────────────────────────────────────────────────────────────

export default function ThesisJobsAssignmentPage() {
  const [selectedJob, setSelectedJob] = useState<string | null>(null);
  const [selectedDepartment, setSelectedDepartment] = useState("");
  const [showAssignModal, setShowAssignModal] = useState(false);

  // Fetch confirmed thesis jobs
  const { data, isLoading, refetch } = useGetJobsQuery({
    isThesisJob: true,
    status: "confirmed",
    limit: 100,
  });

  const { data: departmentsData, isLoading: loadingDepts } =
    useGetDepartmentsQuery();
  const [assignJob, { isLoading: isAssigning }] = useAssignJobMutation();

  const thesisJobs = data?.jobs ?? [];
  const departments = departmentsData ?? [];

  // ─── Handlers ─────────────────────────────────────────────────────────────────

  const handleAssignClick = (jobId: string) => {
    setSelectedJob(jobId);
    setShowAssignModal(true);
  };

  const handleAssignSubmit = async () => {
    if (!selectedJob || !selectedDepartment) {
      alert("Please select a department");
      return;
    }

    try {
      await assignJob({
        id: selectedJob,
        departmentAssignedToId: selectedDepartment,
      }).unwrap();
      setShowAssignModal(false);
      setSelectedDepartment("");
      setSelectedJob(null);
      refetch();
    } catch (error) {
      console.error("Failed to assign thesis job:", error);
      alert("Failed to assign job. Please try again.");
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
            Thesis Jobs - Ready for Assignment
          </h1>
          <p className="text-sm text-secondary-300 mt-1">
            Assign approved thesis jobs to production departments
          </p>
        </div>
        <div className="flex items-center gap-2">
          <div className="px-4 py-2 rounded-lg bg-blue-100 text-blue-700">
            <span className="text-2xl font-bold">{thesisJobs.length}</span>
            <span className="text-xs ml-2">Ready</span>
          </div>
        </div>
      </div>

      {/* Jobs List */}
      {thesisJobs.length === 0 ? (
        <Card className="py-12 text-center">
          <HiOutlineCheckCircle className="w-16 h-16 text-success-400 mx-auto mb-4" />
          <h3 className="text-xl font-semibold text-secondary-100 mb-2">
            All Assigned!
          </h3>
          <p className="text-secondary-300">
            There are no thesis jobs waiting for assignment at the moment.
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
                    <span className="px-3 py-1 rounded-full bg-blue-100 text-blue-700 text-xs font-semibold">
                      Approved
                    </span>
                  </div>
                  <p className="text-sm text-secondary-300 flex items-center gap-2">
                    <HiOutlineCalendar className="w-4 h-4" />
                    Approved:{" "}
                    {new Date(job.updatedAt).toLocaleDateString("en-RW", {
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
                  <p className="text-xs text-secondary-300 mb-1">Approved By</p>
                  <p className="text-sm font-medium text-secondary-100">DAF</p>
                </div>
              </div>

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
                              {doc.mimeType}
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
                  variant="primary"
                  onClick={() => handleAssignClick(job.id)}
                  disabled={isAssigning}
                  className="flex items-center gap-2"
                >
                  <HiOutlineOfficeBuilding className="w-5 h-5" />
                  Assign to Department
                </Button>
              </div>
            </Card>
          ))}
        </div>
      )}

      {/* Assignment Modal */}
      {showAssignModal && (
        <div className="fixed inset-0 bg-black/60 backdrop-blur-sm z-50 flex items-center justify-center p-4">
          <Card className="w-full max-w-md">
            <div className="flex items-center gap-3 mb-4 pb-4 border-b border-custom-400">
              <div className="p-2 rounded-lg bg-primary-100">
                <HiOutlineOfficeBuilding className="w-6 h-6 text-primary-600" />
              </div>
              <div>
                <h3 className="text-lg font-semibold text-secondary-100">
                  Assign Thesis Job
                </h3>
                <p className="text-sm text-secondary-300">
                  Select department to handle this job
                </p>
              </div>
            </div>

            <div className="mb-6">
              <label className="block text-sm font-medium text-secondary-200 mb-2">
                Department <span className="text-danger-400">*</span>
              </label>
              {loadingDepts ? (
                <div className="h-10 bg-custom-200 rounded-xl animate-pulse"></div>
              ) : (
                <select
                  value={selectedDepartment}
                  onChange={(e) => setSelectedDepartment(e.target.value)}
                  className="w-full px-4 py-2.5 rounded-xl border border-custom-400 bg-style-500 text-secondary-100 focus:outline-none focus:border-primary-400 focus:ring-2 focus:ring-primary-200 transition-colors duration-200"
                  disabled={isAssigning}
                >
                  <option value="">Select a department</option>
                  {departments.map((dept: any) => (
                    <option key={dept.id} value={dept.id}>
                      {dept.name}
                    </option>
                  ))}
                </select>
              )}
            </div>

            <div className="flex items-center justify-end gap-3">
              <Button
                variant="outline"
                onClick={() => {
                  setShowAssignModal(false);
                  setSelectedDepartment("");
                  setSelectedJob(null);
                }}
                disabled={isAssigning}
              >
                Cancel
              </Button>
              <Button
                variant="primary"
                onClick={handleAssignSubmit}
                disabled={isAssigning || !selectedDepartment}
              >
                {isAssigning ? "Assigning..." : "Confirm Assignment"}
              </Button>
            </div>
          </Card>
        </div>
      )}
    </div>
  );
}
