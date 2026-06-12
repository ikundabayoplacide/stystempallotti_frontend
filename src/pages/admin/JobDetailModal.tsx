import { useState } from "react";
import {
  HiOutlineBriefcase,
  HiOutlineCalendar,
  HiOutlineCheckCircle,
  HiOutlineClipboardList,
  HiOutlineClock,
  HiOutlineColorSwatch,
  HiOutlineCurrencyDollar,
  HiOutlineDocumentText,
  HiOutlineExclamationCircle,
  HiOutlineOfficeBuilding,
  HiOutlinePaperClip,
  HiOutlineTag,
  HiOutlineTemplate,
  HiOutlineX,
} from "react-icons/hi";
import { Button, Card } from "../../components/ui";
import {
  useGetJobByIdQuery,
  useAssignJobMutation,
} from "../../store/services/jobsService";
import type { Job } from "../../store/services/jobsService";
import { useGetDepartmentsQuery } from "../../store/services/departmentsService";

// ─── Helpers ──────────────────────────────────────────────────────────────────

const statusColors: Record<string, string> = {
  pending:              "bg-gray-100 text-gray-700 border-gray-200",
  confirmed:            "bg-blue-100 text-blue-700 border-blue-200",
  "in-composition":     "bg-purple-100 text-purple-700 border-purple-200",
  "in-montage":         "bg-indigo-100 text-indigo-700 border-indigo-200",
  "in-printing":        "bg-cyan-100 text-cyan-700 border-cyan-200",
  "in-binding":         "bg-teal-100 text-teal-700 border-teal-200",
  "in-packaging":       "bg-green-100 text-green-700 border-green-200",
  "quality-check":      "bg-yellow-100 text-yellow-700 border-yellow-200",
  "ready-for-delivery": "bg-orange-100 text-orange-700 border-orange-200",
  delivered:            "bg-pink-100 text-pink-700 border-pink-200",
  completed:            "bg-emerald-100 text-emerald-700 border-emerald-200",
};

const priorityColors: Record<string, string> = {
  low:    "bg-green-100 text-green-700",
  normal: "bg-yellow-100 text-yellow-700",
  high:   "bg-orange-100 text-orange-700",
  urgent: "bg-red-100 text-red-700",
};

const STATUS_FLOW = [
  "pending",
  "confirmed",
  "in-composition",
  "in-montage",
  "in-printing",
  "in-binding",
  "in-packaging",
  "quality-check",
  "ready-for-delivery",
  "delivered",
  "completed",
];

function formatDate(iso?: string) {
  if (!iso) return "—";
  return new Date(iso).toLocaleDateString("en-US", {
    year: "numeric", month: "short", day: "numeric",
  });
}

function DeadlineBadge({ dueDate }: { dueDate?: string }) {
  if (!dueDate) return <span className="text-xs text-custom-700">No deadline set</span>;
  const now = new Date();
  const due = new Date(dueDate);
  const diffMs = due.getTime() - now.getTime();
  const diffDays = Math.floor(diffMs / (1000 * 60 * 60 * 24));
  const diffHours = Math.floor(diffMs / (1000 * 60 * 60));

  let text: string;
  let cls: string;

  if (diffMs < 0) {
    text = `${Math.abs(diffDays)}d overdue`;
    cls = "bg-red-100 text-red-700";
  } else if (diffHours < 24) {
    text = `${diffHours}h left`;
    cls = "bg-orange-100 text-orange-700";
  } else if (diffDays <= 3) {
    text = `${diffDays}d left`;
    cls = "bg-yellow-100 text-yellow-700";
  } else {
    text = `${diffDays}d left`;
    cls = "bg-green-100 text-green-700";
  }

  return (
    <span className={`inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-xs font-semibold ${cls}`}>
      {diffMs < 0 && <HiOutlineExclamationCircle className="w-3 h-3" />}
      {text}
    </span>
  );
}

// ─── Info row ─────────────────────────────────────────────────────────────────

function InfoRow({ icon, label, value }: { icon: React.ReactNode; label: string; value?: string | number }) {
  if (!value && value !== 0) return null;
  return (
    <div className="flex items-start gap-3">
      <div className="mt-0.5 text-custom-700 shrink-0">{icon}</div>
      <div>
        <p className="text-xs text-custom-700">{label}</p>
        <p className="text-sm font-semibold text-secondary-100">{value}</p>
      </div>
    </div>
  );
}

// ─── Status timeline ──────────────────────────────────────────────────────────

function StatusTimeline({ current }: { current: string }) {
  const currentIdx = STATUS_FLOW.indexOf(current);
  return (
    <div className="flex items-center gap-1 flex-wrap">
      {STATUS_FLOW.map((s, i) => {
        const done   = i < currentIdx;
        const active = i === currentIdx;
        return (
          <div key={s} className="flex items-center gap-1">
            <div
              className={`flex items-center gap-1 px-2 py-1 rounded-lg text-xs font-semibold border transition-all ${
                active  ? `${statusColors[s]} border font-bold ring-2 ring-offset-1 ring-primary-400` :
                done    ? "bg-emerald-50 text-emerald-600 border-emerald-200" :
                          "bg-custom-100 text-custom-600 border-custom-200"
              }`}
            >
              {done && <HiOutlineCheckCircle className="w-3 h-3" />}
              {active && <HiOutlineClock className="w-3 h-3" />}
              <span className="capitalize">{s.replace(/-/g, " ")}</span>
            </div>
            {i < STATUS_FLOW.length - 1 && (
              <div className={`w-3 h-0.5 ${i < currentIdx ? "bg-emerald-400" : "bg-custom-300"}`} />
            )}
          </div>
        );
      })}
    </div>
  );
}

// ─── Props ────────────────────────────────────────────────────────────────────

interface Props {
  jobId: string;
  onClose: () => void;
  onAssigned: () => void;
}

// ─── Component ────────────────────────────────────────────────────────────────

export default function JobDetailModal({ jobId, onClose, onAssigned }: Props) {
  const [selectedDeptId, setSelectedDeptId] = useState("");
  const [assignError, setAssignError]       = useState("");

  const { data: job, isLoading, isError } = useGetJobByIdQuery(jobId);
  const { data: departments = [] }        = useGetDepartmentsQuery();
  const [assignJob, { isLoading: assigning }] = useAssignJobMutation();

  const handleAssign = async () => {
    if (!selectedDeptId) {
      setAssignError("Please select a department first.");
      return;
    }
    setAssignError("");
    try {
      await assignJob({ id: jobId, departmentAssignedToId: selectedDeptId }).unwrap();
      onAssigned();
    } catch (err: unknown) {
      const e = err as { data?: { message?: string } };
      setAssignError(e?.data?.message ?? "Failed to assign. Please try again.");
    }
  };

  // ── Loading / error states ─────────────────────────────────────────────────

  const renderBody = () => {
    if (isLoading) {
      return (
        <div className="flex items-center justify-center py-20 text-custom-700 text-sm gap-2">
          <HiOutlineClock className="w-5 h-5 animate-spin" />
          Loading job details…
        </div>
      );
    }
    if (isError || !job) {
      return (
        <div className="flex items-center justify-center py-20 text-red-600 text-sm">
          Failed to load job details.
        </div>
      );
    }
    return <JobBody job={job} departments={departments} selectedDeptId={selectedDeptId} setSelectedDeptId={setSelectedDeptId} assignError={assignError} assigning={assigning} onAssign={handleAssign} />;
  };

  return (
    <div className="fixed inset-0 bg-secondary-100/60 z-50 flex items-center justify-center p-4">
      <div className="w-full max-w-4xl flex flex-col" style={{ height: "min(92vh, 820px)" }}>
        <Card className="!p-0 overflow-hidden flex flex-col h-full">

          {/* Header */}
          <div className="flex items-center justify-between px-6 py-4 border-b border-custom-300 shrink-0">
            <div className="flex items-center gap-3">
              <HiOutlineBriefcase className="w-5 h-5 text-primary-500" />
              <div>
                <h3 className="text-lg font-bold text-secondary-100">Job Details</h3>
                {job && (
                  <p className="text-xs text-primary-600 font-semibold">{job.jobNumber}</p>
                )}
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
          <div className="flex-1 overflow-y-auto min-h-0">
            {renderBody()}
          </div>
        </Card>
      </div>
    </div>
  );
}

// ─── Job body (separated for clarity) ────────────────────────────────────────

function JobBody({
  job,
  departments,
  selectedDeptId,
  setSelectedDeptId,
  assignError,
  assigning,
  onAssign,
}: {
  job: Job;
  departments: { id: string; name: string }[];
  selectedDeptId: string;
  setSelectedDeptId: (id: string) => void;
  assignError: string;
  assigning: boolean;
  onAssign: () => void;
}) {
  const selectCls =
    "w-full px-4 py-2.5 rounded-xl border border-custom-400 bg-style-500 text-secondary-100 " +
    "focus:outline-none focus:border-primary-400 focus:ring-2 focus:ring-primary-200 " +
    "transition-colors duration-200 font-[family-name:var(--font-family-primary)] text-sm";

  const alreadyAssigned = !!job.departmentAssignedToId;

  return (
    <div className="px-6 py-6 space-y-6">

      {/* ── Title + badges ──────────────────────────────────────────────── */}
      <div>
        <h2 className="text-xl font-bold text-secondary-100 mb-2">{job.title}</h2>
        <div className="flex flex-wrap items-center gap-2">
          <span className={`px-3 py-1 rounded-full text-xs font-semibold border ${statusColors[job.status] || "bg-gray-100 text-gray-700"}`}>
            {job.status.replace(/-/g, " ")}
          </span>
          <span className={`px-3 py-1 rounded-full text-xs font-semibold ${priorityColors[job.priority] || "bg-gray-100 text-gray-700"}`}>
            {job.priority} priority
          </span>
          {job.dueDate && <DeadlineBadge dueDate={job.dueDate} />}
        </div>
      </div>

      {/* ── Status timeline ─────────────────────────────────────────────── */}
      <div>
        <p className="text-xs font-bold text-custom-700 uppercase tracking-wide mb-3">Progress</p>
        <StatusTimeline current={job.status} />
      </div>

      {/* ── Two-column details ──────────────────────────────────────────── */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">

        {/* Left column */}
        <div className="space-y-4">
          <p className="text-xs font-bold text-custom-700 uppercase tracking-wide">Job Info</p>
          <InfoRow icon={<HiOutlineTag className="w-4 h-4" />}          label="Job Type"     value={job.jobType} />
          <InfoRow icon={<HiOutlineClipboardList className="w-4 h-4" />} label="Quantity"     value={job.quantity} />
          <InfoRow icon={<HiOutlineTemplate className="w-4 h-4" />}     label="Size"         value={job.size} />
          <InfoRow icon={<HiOutlineColorSwatch className="w-4 h-4" />}  label="Color Mode"   value={job.colorMode} />
          <InfoRow icon={<HiOutlinePaperClip className="w-4 h-4" />}    label="Binding"      value={job.bindingType} />
          {job.amount != null && (
            <InfoRow
              icon={<HiOutlineCurrencyDollar className="w-4 h-4" />}
              label="Amount"
              value={`${job.amount.toLocaleString()} RWF`}
            />
          )}
        </div>

        {/* Right column */}
        <div className="space-y-4">
          <p className="text-xs font-bold text-custom-700 uppercase tracking-wide">Dates & Assignment</p>
          <InfoRow icon={<HiOutlineCalendar className="w-4 h-4" />}     label="Due Date"     value={formatDate(job.dueDate)} />
          <InfoRow icon={<HiOutlineCalendar className="w-4 h-4" />}     label="Created"      value={formatDate(job.createdAt)} />
          <InfoRow
            icon={<HiOutlineOfficeBuilding className="w-4 h-4" />}
            label="Department"
            value={
              job.departmentAssignedToId
                ? (departments.find((d) => d.id === job.departmentAssignedToId)?.name ?? job.departmentAssignedToId)
                : "Not assigned yet"
            }
          />
          <InfoRow icon={<HiOutlineClipboardList className="w-4 h-4" />} label="Customer" value={job.customer?.name} />
        </div>
      </div>

      {/* ── Description ─────────────────────────────────────────────────── */}
      {job.description && (
        <div>
          <p className="text-xs font-bold text-custom-700 uppercase tracking-wide mb-2">Description</p>
          <div className="flex gap-3">
            <HiOutlineDocumentText className="w-4 h-4 text-custom-700 mt-0.5 shrink-0" />
            <p className="text-sm text-secondary-100 leading-relaxed">{job.description}</p>
          </div>
        </div>
      )}

      {/* ── Notes ───────────────────────────────────────────────────────── */}
      {job.notes && (
        <div>
          <p className="text-xs font-bold text-custom-700 uppercase tracking-wide mb-2">Notes</p>
          <div className="flex gap-3">
            <HiOutlineDocumentText className="w-4 h-4 text-custom-700 mt-0.5 shrink-0" />
            <p className="text-sm text-secondary-100 leading-relaxed">{job.notes}</p>
          </div>
        </div>
      )}

      {/* ── Assign to Department ────────────────────────────────────────── */}
      <div className="border-t border-custom-300 pt-6">
        <p className="text-xs font-bold text-custom-700 uppercase tracking-wide mb-3">
          Assign to Department
        </p>

        <div className="flex flex-col sm:flex-row gap-3">
          <div className="flex-1">
            <select
              value={selectedDeptId}
              onChange={(e) => setSelectedDeptId(e.target.value)}
              className={selectCls}
            >
              <option value="">Select a department…</option>
              {departments.map((d) => (
                <option key={d.id} value={d.id}>{d.name}</option>
              ))}
            </select>
            {assignError && (
              <p className="mt-1.5 text-xs text-red-600 flex items-center gap-1">
                <HiOutlineExclamationCircle className="w-3.5 h-3.5" />
                {assignError}
              </p>
            )}
          </div>
          <Button
            onClick={onAssign}
            disabled={!selectedDeptId || assigning}
            className="shrink-0"
          >
            <HiOutlineOfficeBuilding className="w-4 h-4" />
            {assigning ? "Assigning…" : alreadyAssigned ? "Reassign" : "Assign"}
          </Button>
        </div>
      </div>
    </div>
  );
}
