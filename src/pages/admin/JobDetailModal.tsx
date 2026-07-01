import { useState } from "react";
import {
  HiOutlineBriefcase,
  HiOutlineCalendar,
  HiOutlineExclamationCircle,
  HiOutlineRefresh,
  HiOutlineX,
} from "react-icons/hi";
import { Button } from "../../components/ui";
import Card from "../../components/ui/Card";
import { useSelector } from "react-redux";
import type { RootState } from "../../store";
import {
  useGetJobByIdQuery,
  useAssignJobMutation,
  useReassignJobMutation,
  useVerifyJobMutation,
} from "../../store/services/jobsService";
import { useGetDepartmentsQuery } from "../../store/services/departmentsService";

interface Props {
  jobId: string;
  onClose: () => void;
  onAssigned: () => void;
}

const selectCls =
  "w-full px-4 py-2.5 rounded-xl border border-custom-400 bg-style-500 text-secondary-100 " +
  "focus:outline-none focus:border-primary-400 focus:ring-2 focus:ring-primary-200 " +
  "transition-colors duration-200 text-sm";

const statusColors: Record<string, string> = {
  pending: "bg-gray-100 text-gray-700",
  confirmed: "bg-blue-100 text-blue-700",
  "in-composition": "bg-purple-100 text-purple-700",
  "in-montage": "bg-indigo-100 text-indigo-700",
  "in-printing": "bg-cyan-100 text-cyan-700",
  "in-binding": "bg-teal-100 text-teal-700",
  "in-packaging": "bg-green-100 text-green-700",
  "quality-check": "bg-yellow-100 text-yellow-700",
  "ready-for-delivery": "bg-orange-100 text-orange-700",
  delivered: "bg-pink-100 text-pink-700",
  completed: "bg-emerald-100 text-emerald-700",
};

const priorityColors: Record<string, string> = {
  low: "bg-green-500 text-white",
  normal: "bg-yellow-500 text-white",
  high: "bg-orange-500 text-white",
  urgent: "bg-red-500 text-white",
};

export default function JobDetailModal({ jobId, onClose, onAssigned }: Props) {
  const { data: job, isLoading, isError } = useGetJobByIdQuery(jobId);
  const { data: departments = [] } = useGetDepartmentsQuery();
  const [assignJob, { isLoading: assigning }] = useAssignJobMutation();
  const [reassignJob, { isLoading: reassigning }] = useReassignJobMutation();

  const currentUser = useSelector((s: RootState) => s.auth.user);
  const canVerify = currentUser?.role === "ADMIN" || currentUser?.role === "DAF";

  const [selectedDept, setSelectedDept] = useState("");
  const [error, setError] = useState("");

  const [verifyJob, { isLoading: verifying }] = useVerifyJobMutation();
  const [verifyError, setVerifyError] = useState("");

  const handleVerify = async () => {
    setVerifyError("");
    try {
      await verifyJob(jobId).unwrap();
      onAssigned();
    } catch (err: unknown) {
      const e = err as { data?: { message?: string } };
      setVerifyError(e?.data?.message ?? "Failed to verify job.");
    }
  };

  const handleAssign = async () => {
    if (!selectedDept) return;
    setError("");
    try {
      const isAlreadyAssigned = !!job?.departmentAssignedToId;
      if (isAlreadyAssigned) {
        await reassignJob({ id: jobId, departmentAssignedToId: selectedDept }).unwrap();
      } else {
        await assignJob({ id: jobId, departmentAssignedToId: selectedDept }).unwrap();
      }
      onAssigned();
    } catch (err: unknown) {
      const e = err as { data?: { message?: string } };
      setError(e?.data?.message ?? "Failed to assign job.");
    }
  };

  return (
    <div className="fixed inset-0 bg-secondary-100/60 z-50 flex items-center justify-center p-4">
      <div className="w-full max-w-2xl flex flex-col" style={{ height: "min(90vh, 700px)" }}>
        <Card className="!p-0 overflow-hidden flex flex-col h-full">

          {/* Header */}
          <div className="flex items-center justify-between px-6 py-4 border-b border-custom-300 shrink-0">
            <div className="flex items-center gap-2">
              <HiOutlineBriefcase className="w-5 h-5 text-primary-500" />
              <div>
                <h3 className="text-lg font-bold text-secondary-100">Job Details</h3>
                {job && <p className="text-xs text-primary-600 font-semibold">{job.jobNumber}</p>}
              </div>
            </div>
            <button
              onClick={onClose}
              className="p-1.5 rounded-lg hover:bg-custom-100 transition-colors text-custom-700 hover:text-secondary-100"
            >
              <HiOutlineX className="w-5 h-5" />
            </button>
          </div>

          {/* Body */}
          {isLoading ? (
            <div className="flex-1 flex items-center justify-center text-custom-700 text-sm gap-2">
              <HiOutlineRefresh className="w-5 h-5 animate-spin" />
              Loading…
            </div>
          ) : isError || !job ? (
            <div className="flex-1 flex items-center justify-center text-red-600 text-sm">
              Failed to load job.
            </div>
          ) : (
            <div className="flex-1 overflow-y-auto px-6 py-5 space-y-5 min-h-0">

              {/* Title + badges */}
              <div>
                <h4 className="text-xl font-bold text-secondary-100">{job.title}</h4>
                <div className="flex flex-wrap gap-2 mt-2">
                  <span className={`px-3 py-1 rounded-full text-xs font-semibold ${statusColors[job.status] ?? "bg-gray-100 text-gray-700"}`}>
                    {job.status}
                  </span>
                  <span className={`px-3 py-1 rounded-full text-xs font-bold ${priorityColors[job.priority] ?? "bg-gray-500 text-white"}`}>
                    {job.priority}
                  </span>
                </div>
              </div>

              {/* Info grid */}
              <div className="grid grid-cols-2 gap-4 text-sm">
                <div>
                  <p className="text-xs text-custom-700 font-semibold uppercase mb-0.5">Customer</p>
                  <p className="text-secondary-100 font-medium">{job.customer?.name ?? "—"}</p>
                </div>
                {job.jobType && (
                  <div>
                    <p className="text-xs text-custom-700 font-semibold uppercase mb-0.5">Job Type</p>
                    <p className="text-secondary-100">{job.jobType}</p>
                  </div>
                )}
                {job.quantity != null && (
                  <div>
                    <p className="text-xs text-custom-700 font-semibold uppercase mb-0.5">Quantity</p>
                    <p className="text-secondary-100">{job.quantity.toLocaleString()}</p>
                  </div>
                )}
                {job.amount != null && (
                  <div>
                    <p className="text-xs text-custom-700 font-semibold uppercase mb-0.5">Amount</p>
                    <p className="text-secondary-100 font-semibold">{job.amount.toLocaleString()} <span className="text-xs font-normal text-custom-700">RWF</span></p>
                  </div>
                )}
                {job.size && (
                  <div>
                    <p className="text-xs text-custom-700 font-semibold uppercase mb-0.5">Size</p>
                    <p className="text-secondary-100">{job.size}</p>
                  </div>
                )}
                {job.colorMode && (
                  <div>
                    <p className="text-xs text-custom-700 font-semibold uppercase mb-0.5">Color Mode</p>
                    <p className="text-secondary-100">{job.colorMode}</p>
                  </div>
                )}
                {job.bindingType && (
                  <div>
                    <p className="text-xs text-custom-700 font-semibold uppercase mb-0.5">Binding</p>
                    <p className="text-secondary-100">{job.bindingType}</p>
                  </div>
                )}
                {job.dueDate && (
                  <div>
                    <p className="text-xs text-custom-700 font-semibold uppercase mb-0.5">Due Date</p>
                    <div className="flex items-center gap-1 text-secondary-100">
                      <HiOutlineCalendar className="w-4 h-4 text-custom-700" />
                      {job.dueDate.split("T")[0]}
                    </div>
                  </div>
                )}
                <div>
                  <p className="text-xs text-custom-700 font-semibold uppercase mb-0.5">Created</p>
                  <p className="text-secondary-100">{new Date(job.createdAt).toLocaleDateString()}</p>
                </div>
              </div>

              {/* Description */}
              {job.description && (
                <div>
                  <p className="text-xs text-custom-700 font-semibold uppercase mb-1">Description</p>
                  <p className="text-sm text-secondary-100 bg-custom-50 rounded-xl px-4 py-3">{job.description}</p>
                </div>
              )}

              {/* Notes */}
              {job.notes && (
                <div>
                  <p className="text-xs text-custom-700 font-semibold uppercase mb-1">Notes</p>
                  <p className="text-sm text-secondary-100 bg-custom-50 rounded-xl px-4 py-3">{job.notes}</p>
                </div>
              )}

              {/* Verification */}
              {canVerify && job.status === "completed" && (
                <div className="border-t border-custom-300 pt-4 space-y-3">
                  <p className="text-xs text-custom-700 font-semibold uppercase">Verification</p>
                  {verifyError && (
                    <div className="flex items-center gap-2 px-3 py-2 rounded-xl bg-red-50 border border-red-200 text-red-700 text-sm">
                      <HiOutlineExclamationCircle className="w-4 h-4 shrink-0" />
                      {verifyError}
                    </div>
                  )}
                  <Button onClick={handleVerify} disabled={verifying}>
                    {verifying ? "Verifying…" : "Mark as Verified"}
                  </Button>
                </div>
              )}

              {/* Assign / Reassign department */}
              <div className="border-t border-custom-300 pt-4">
                <p className="text-xs text-custom-700 font-semibold uppercase mb-2">
                  {job.departmentAssignedToId ? "Reassign Department" : "Assign to Department"}
                </p>
                <div className="flex gap-3">
                  <select
                    value={selectedDept}
                    onChange={(e) => setSelectedDept(e.target.value)}
                    className={selectCls}
                  >
                    <option value="">Select department…</option>
                    {departments.map((d) => (
                      <option key={d.id} value={d.id}>{d.name}</option>
                    ))}
                  </select>
                  <Button
                    onClick={handleAssign}
                    disabled={!selectedDept || assigning || reassigning}
                  >
                    {assigning || reassigning ? "Saving…" : "Assign"}
                  </Button>
                </div>
                {error && (
                  <div className="flex items-center gap-2 mt-2 px-3 py-2 rounded-xl bg-red-50 border border-red-200 text-red-700 text-sm">
                    <HiOutlineExclamationCircle className="w-4 h-4 shrink-0" />
                    {error}
                  </div>
                )}
              </div>
            </div>
          )}

          {/* Footer */}
          <div className="px-6 py-4 border-t border-custom-300 flex justify-end shrink-0">
            <Button variant="outline" onClick={onClose}>Close</Button>
          </div>
        </Card>
      </div>
    </div>
  );
}
