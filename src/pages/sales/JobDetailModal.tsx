import { useRef, useState } from "react";
import {
  HiOutlineBriefcase,
  HiOutlineCalendar,
  HiOutlineCheckCircle,
  HiOutlineClipboardList,
  HiOutlineClock,
  HiOutlineColorSwatch,
  HiOutlineCurrencyDollar,
  HiOutlineDocumentText,
  HiOutlineDownload,
  HiOutlineExclamationCircle,
  HiOutlinePaperClip,
  HiOutlineTag,
  HiOutlineTemplate,
  HiOutlineTrash,
  HiOutlineUpload,
  HiOutlineX,
  HiOutlineCube,
} from "react-icons/hi";
import { Card } from "../../components/ui";
import {
  useGetJobDetailsQuery,
} from "../../store/services/jobsService";
import type { JobDetails } from "../../store/services/jobsService";
import {
  useGetJobDocumentsQuery,
  useUploadJobDocumentsMutation,
  useDeleteJobDocumentMutation,
} from "../../store/services/jobDocumentsService";
import { useGetJobSpecsQuery } from "../../store/services/jobSpecsService";

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
        const done    = i < currentIdx;
        const active  = i === currentIdx;
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

export default function JobDetailModal({ jobId, onClose }: Props) {
  const [tab, setTab] = useState<"overview" | "specs">("overview");
  const { data: job, isLoading, isError } = useGetJobDetailsQuery(jobId);
  const { data: specs = [], isLoading: loadingSpecs } = useGetJobSpecsQuery(jobId);

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
    return <JobBody job={job} />;
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

          {/* Tabs */}
          <div className="flex gap-1 px-6 pt-3 border-b border-custom-200 shrink-0">
            {(["overview", "specs"] as const).map((t) => (
              <button key={t} onClick={() => setTab(t)}
                className={`px-4 py-1.5 rounded-t-lg text-sm font-semibold capitalize transition-colors ${
                  tab === t ? "bg-primary-500 text-white" : "text-custom-700 hover:text-secondary-100 hover:bg-custom-100"
                }`}>
                {t === "specs" ? `Specs (${specs.length})` : "Overview"}
              </button>
            ))}
          </div>

          {/* Body */}
          <div className="flex-1 overflow-y-auto min-h-0">
            {tab === "overview" ? renderBody() : <SpecsTab jobId={jobId} specs={specs} isLoading={loadingSpecs} />}
          </div>
        </Card>
      </div>
    </div>
  );
}

// ─── Specs Tab ───────────────────────────────────────────────────────────────

import type { JobSpec } from "../../store/services/jobSpecsService";

function SpecsTab({ specs, isLoading }: { jobId: string; specs: JobSpec[]; isLoading: boolean }) {
  if (isLoading) return <div className="space-y-3 p-6">{[1,2].map(i => <div key={i} className="h-20 bg-custom-100 rounded-xl animate-pulse" />)}</div>;
  if (!specs.length) return (
    <div className="py-16 text-center">
      <p className="text-sm text-custom-700">No specs added yet for this job.</p>
    </div>
  );
  return (
    <div className="px-6 py-5 space-y-4">
      {specs.map((spec, i) => (
        <div key={spec.id} className="rounded-xl border border-custom-200 overflow-hidden">
          <div className="flex items-center justify-between px-4 py-2.5 bg-custom-50 border-b border-custom-200">
            <span className="text-xs font-bold text-custom-500 uppercase tracking-wide">Spec #{i + 1}</span>
            <span className="text-xs text-custom-500">{new Date(spec.createdAt).toLocaleDateString()}</span>
          </div>
          <div className="p-4 space-y-3">
            <p className="text-sm text-secondary-100">{spec.description}</p>
            <div className="grid grid-cols-2 sm:grid-cols-3 gap-2">
              {([
                ["Paper Type",   spec.paperType],
                ["Paper Weight", spec.paperWeight],
                ["Size",         spec.size],
                ["Colors",       spec.colors],
                ["Finish Type",  spec.finishType],
                ["Materials",    spec.materials],
                ["Quantity",     spec.quantity ? String(spec.quantity) : undefined],
              ] as [string, string | undefined][]).filter(([, v]) => v).map(([label, value]) => (
                <div key={label} className="px-3 py-2 rounded-lg bg-custom-50 border border-custom-100">
                  <p className="text-[10px] text-custom-500 uppercase tracking-wide">{label}</p>
                  <p className="text-sm font-semibold text-secondary-100">{value}</p>
                </div>
              ))}
            </div>
            {spec.notes && <p className="text-xs text-custom-700 italic border-t border-custom-100 pt-2">{spec.notes}</p>}
            {spec.documents && spec.documents.length > 0 && (
              <div className="border-t border-custom-100 pt-2">
                <p className="text-xs font-semibold text-custom-700 mb-1.5">Attachments</p>
                <div className="flex flex-wrap gap-2">
                  {spec.documents.map(doc => (
                    <a key={doc.id} href={doc.fileUrl} download={doc.fileName}
                      className="flex items-center gap-1.5 px-2.5 py-1 rounded-lg bg-primary-50 border border-primary-200 text-xs font-semibold text-primary-600 hover:bg-primary-100 transition-colors">
                      📎 {doc.fileName}
                    </a>
                  ))}
                </div>
              </div>
            )}
          </div>
        </div>
      ))}
    </div>
  );
}

// ─── Job body (separated for clarity) ────────────────────────────────────────

function JobBody({ job }: { job: JobDetails }) {
  const fileInputRef = useRef<HTMLInputElement>(null);

  const { data: docs = [], isLoading: loadingDocs } = useGetJobDocumentsQuery(job.id);
  const [uploadDocs, { isLoading: uploading }] = useUploadJobDocumentsMutation();
  const [deleteDoc, { isLoading: deleting }]   = useDeleteJobDocumentMutation();
  const [deletingId, setDeletingId]            = useState<string | null>(null);
  const [confirmDeleteDocId, setConfirmDeleteDocId] = useState<string | null>(null);
  const [uploadError, setUploadError]          = useState<string | null>(null);

  const handleFileUpload = async (files: FileList | null) => {
    if (!files || files.length === 0) return;
    setUploadError(null);
    try {
      await uploadDocs({ jobId: job.id, files: Array.from(files) }).unwrap();
    } catch {
      setUploadError("Failed to upload documents. Please try again.");
    }
  };

  const handleDelete = async (docId: string) => {
    setDeletingId(docId);
    try {
      await deleteDoc({ jobId: job.id, docId }).unwrap();
    } catch {
      // silently ignore
    } finally {
      setDeletingId(null);
      setConfirmDeleteDocId(null);
    }
  };

  const getFileIcon = (mimeType: string) => {
    if (mimeType?.startsWith("image/"))       return "text-blue-500";
    if (mimeType === "application/pdf")       return "text-red-500";
    if (mimeType?.includes("spreadsheet") || mimeType?.includes("excel")) return "text-green-600";
    if (mimeType?.includes("word") || mimeType?.includes("document"))     return "text-blue-600";
    return "text-custom-700";
  };

  const formatSize = (url: string) => {
    const approxBytes = Math.round((url?.length ?? 0) * 0.75);
    if (approxBytes < 1024) return `${approxBytes} B`;
    if (approxBytes < 1024 * 1024) return `${(approxBytes / 1024).toFixed(1)} KB`;
    return `${(approxBytes / (1024 * 1024)).toFixed(1)} MB`;
  };

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
        <div className="space-y-4">
          <p className="text-xs font-bold text-custom-700 uppercase tracking-wide">Job Info</p>
          <InfoRow icon={<HiOutlineTag className="w-4 h-4" />}          label="Job Type"   value={job.jobType} />
          <InfoRow icon={<HiOutlineClipboardList className="w-4 h-4" />} label="Quantity"   value={job.quantity} />
          <InfoRow icon={<HiOutlineTemplate className="w-4 h-4" />}     label="Size"       value={job.size} />
          <InfoRow icon={<HiOutlineColorSwatch className="w-4 h-4" />}  label="Color Mode" value={job.colorMode} />
          <InfoRow icon={<HiOutlinePaperClip className="w-4 h-4" />}    label="Binding"    value={job.bindingType} />
          {job.amount != null && (
            <InfoRow icon={<HiOutlineCurrencyDollar className="w-4 h-4" />} label="Amount"
              value={`${job.amount.toLocaleString()} RWF`} />
          )}
        </div>
        <div className="space-y-4">
          <p className="text-xs font-bold text-custom-700 uppercase tracking-wide">Dates & Customer</p>
          <InfoRow icon={<HiOutlineCalendar className="w-4 h-4" />}      label="Due Date" value={formatDate(job.dueDate)} />
          <InfoRow icon={<HiOutlineCalendar className="w-4 h-4" />}      label="Created"  value={formatDate(job.createdAt)} />
          <InfoRow icon={<HiOutlineClipboardList className="w-4 h-4" />} label="Customer" value={job.customer?.name} />
        </div>
      </div>

      {/* ── Materials / Stock Items ──────────────────────────────────────── */}
      {(job.jobItems ?? []).length > 0 && (
        <div className="border-t border-custom-300 pt-6">
          <div className="flex items-center gap-2 mb-3">
            <HiOutlineCube className="w-4 h-4 text-custom-700" />
            <p className="text-xs font-bold text-custom-700 uppercase tracking-wide">
              Materials / Stock Items ({job.jobItems!.length})
            </p>
          </div>
          <div className="space-y-2">
            {job.jobItems!.map((item, i) => (
              <div key={item.id ?? i}
                className="flex items-center justify-between px-4 py-3 rounded-xl border border-custom-200 bg-custom-50">
                <div className="min-w-0">
                  <div className="flex items-center gap-2">
                    <p className="text-sm font-semibold text-secondary-100 truncate">
                      {item.stockItem?.itemName ?? item.stockItem?.name ?? item.itemName ?? `Item ${i + 1}`}
                    </p>
                    {!item.stockItemId && (
                      <span className="text-[10px] font-bold px-1.5 py-0.5 rounded-full bg-yellow-100 text-yellow-700 shrink-0">custom</span>
                    )}
                  </div>
                  <p className="text-xs text-custom-700">
                    {item.stockItem?.category ?? ""}
                    {(item.stockItem?.unit ?? item.unit) ? ` · ${item.stockItem?.unit ?? item.unit}` : ""}
                    {item.unitCost ? ` · ${item.unitCost.toLocaleString()} RWF/unit` : ""}
                  </p>
                </div>
                <div className="text-right shrink-0 ml-4">
                  <p className="text-sm font-bold text-secondary-100">{item.quantityNeeded}</p>
                  {item.quantityUsed != null && (
                    <p className="text-xs text-custom-700">Used: {item.quantityUsed}</p>
                  )}
                  {item.notes && (
                    <p className="text-xs text-custom-500 italic">{item.notes}</p>
                  )}
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

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

      {/* ── Documents ───────────────────────────────────────────────────── */}
      <div className="border-t border-custom-300 pt-6">
        <div className="flex items-center justify-between mb-3">
          <p className="text-xs font-bold text-custom-700 uppercase tracking-wide">
            Documents {!loadingDocs && `(${docs.length})`}
          </p>
          <button
            onClick={() => fileInputRef.current?.click()}
            disabled={uploading}
            className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-primary-500 text-white text-xs font-semibold hover:bg-primary-600 transition-colors disabled:opacity-50"
          >
            <HiOutlineUpload className="w-3.5 h-3.5" />
            {uploading ? "Uploading…" : "Upload"}
          </button>
          <input
            ref={fileInputRef}
            type="file"
            multiple
            accept=".pdf,.doc,.docx,.xls,.xlsx,.png,.jpg,.jpeg,.gif,.webp"
            className="hidden"
            onChange={(e) => handleFileUpload(e.target.files)}
          />
        </div>

        {uploadError && (
          <div className="flex items-center gap-2 px-3 py-2 mb-3 rounded-xl bg-red-50 border border-red-200 text-red-700 text-xs">
            <HiOutlineExclamationCircle className="w-4 h-4 shrink-0" />
            {uploadError}
          </div>
        )}

        {loadingDocs ? (
          <div className="flex items-center gap-2 py-4 text-custom-700 text-sm">
            <HiOutlineClock className="w-4 h-4 animate-spin" /> Loading documents…
          </div>
        ) : docs.length === 0 ? (
          <div className="py-6 text-center rounded-xl border-2 border-dashed border-custom-200">
            <HiOutlinePaperClip className="w-8 h-8 text-custom-400 mx-auto mb-2" />
            <p className="text-sm text-custom-700">No documents attached yet</p>
            <button
              onClick={() => fileInputRef.current?.click()}
              className="mt-2 text-xs font-semibold text-primary-500 hover:underline"
            >
              Upload the first document
            </button>
          </div>
        ) : (
          <div className="space-y-2">
            {docs.map((doc) => (
              <div key={doc.id}
                className="flex items-center gap-3 p-3 rounded-xl border border-custom-300 bg-custom-50 group">
                <div className="w-9 h-9 rounded-lg bg-white border border-custom-200 flex items-center justify-center shrink-0">
                  <HiOutlineDocumentText className={`w-5 h-5 ${getFileIcon(doc.mimeType)}`} />
                </div>
                <div className="min-w-0 flex-1">
                  <p className="text-sm font-semibold text-secondary-100 truncate">{doc.fileName}</p>
                  <p className="text-xs text-custom-700">
                    {doc.mimeType} · {formatSize(doc.fileUrl)}
                    {doc.uploadedBy && ` · by ${doc.uploadedBy.name}`}
                  </p>
                </div>
                <div className="flex items-center gap-1 shrink-0">
                  <a href={doc.fileUrl} download={doc.fileName}
                    className="p-1.5 rounded-lg hover:bg-primary-100 text-custom-700 hover:text-primary-600 transition-colors"
                    title="Download">
                    <HiOutlineDownload className="w-4 h-4" />
                  </a>
                  <button onClick={() => setConfirmDeleteDocId(doc.id)}
                    className="p-1.5 rounded-lg hover:bg-red-100 text-custom-700 hover:text-red-600 transition-colors"
                    title="Delete">
                    <HiOutlineTrash className="w-4 h-4" />
                  </button>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* ── Confirm delete document ── */}
      {confirmDeleteDocId && (
        <div className="fixed inset-0 bg-secondary-100/60 z-[60] flex items-center justify-center p-4">
          <div className="bg-white rounded-2xl shadow-xl p-6 max-w-sm w-full">
            <div className="flex items-start gap-4 mb-5">
              <div className="w-10 h-10 rounded-full bg-red-100 flex items-center justify-center shrink-0">
                <HiOutlineTrash className="w-5 h-5 text-red-600" />
              </div>
              <div>
                <h3 className="text-base font-bold text-secondary-100">Delete Document</h3>
                <p className="text-sm text-custom-700 mt-1">
                  {(() => {
                    const doc = docs.find((d) => d.id === confirmDeleteDocId);
                    return doc
                      ? <>Are you sure you want to delete <span className="font-semibold text-secondary-100">"{doc.fileName}"</span>? This cannot be undone.</>
                      : "Are you sure you want to delete this document? This cannot be undone.";
                  })()}
                </p>
              </div>
            </div>
            <div className="flex gap-3">
              <button onClick={() => setConfirmDeleteDocId(null)}
                className="flex-1 px-4 py-2 rounded-xl border border-custom-300 text-sm font-semibold text-secondary-100 hover:bg-custom-100 transition-colors">
                Cancel
              </button>
              <button onClick={() => handleDelete(confirmDeleteDocId)}
                disabled={deleting && deletingId === confirmDeleteDocId}
                className="flex-1 px-4 py-2 rounded-xl bg-red-500 text-white text-sm font-semibold hover:bg-red-600 transition-colors disabled:opacity-50">
                {deleting && deletingId === confirmDeleteDocId ? "Deleting…" : "Delete"}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
