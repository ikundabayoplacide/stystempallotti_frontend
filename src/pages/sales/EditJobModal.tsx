import { useEffect, useRef, useState } from "react";
import {
  HiOutlineBriefcase,
  HiOutlineCube,
  HiOutlineDocumentText,
  HiOutlineDownload,
  HiOutlineExclamationCircle,
  HiOutlinePaperClip,
  HiOutlineRefresh,
  HiOutlineSearch,
  HiOutlineTrash,
  HiOutlineUpload,
  HiOutlineX,
} from "react-icons/hi";
import { Button, Input } from "../../components/ui";
import Card from "../../components/ui/Card";
import {
  useGetJobByIdQuery,
  useGetJobDetailsQuery,
  useUpdateJobMutation,
  useAddJobItemMutation,
  useRemoveJobItemMutation,
  useUpdateJobItemMutation,
} from "../../store/services/jobsService";
import type { JobPriority } from "../../store/services/jobsService";
import { useGetStockItemsQuery } from "../../store/services/stockService";
import {
  useGetJobDocumentsQuery,
  useUploadJobDocumentsMutation,
  useDeleteJobDocumentMutation,
} from "../../store/services/jobDocumentsService";

// ─── Shared select style ──────────────────────────────────────────────────────

const selectCls =
  "w-full px-4 py-2.5 rounded-xl border border-custom-400 bg-style-500 text-secondary-100 " +
  "focus:outline-none focus:border-primary-400 focus:ring-2 focus:ring-primary-200 " +
  "transition-colors duration-200 font-[family-name:var(--font-family-primary)] text-sm";

// ─── Props ────────────────────────────────────────────────────────────────────

interface Props {
  jobId: string;
  onClose: () => void;
  onUpdated: () => void;
}

// ─── Component ────────────────────────────────────────────────────────────────

export default function EditJobModal({ jobId, onClose, onUpdated }: Props) {
  const { data: job, isLoading, isError } = useGetJobByIdQuery(jobId);

  // Use details query to get jobItems with populated stockItem names
  const { data: jobDetails, refetch: refetchDetails } = useGetJobDetailsQuery(jobId);
  const jobItems = jobDetails?.jobItems ?? [];

  const [updateJob, { isLoading: saving }] = useUpdateJobMutation();

  // ── Materials ──────────────────────────────────────────────────────────────
  const [addJobItem,    { isLoading: addingItem }]   = useAddJobItemMutation();
  const [removeJobItem, { isLoading: removingItem }] = useRemoveJobItemMutation();
  const [updateJobItem]                               = useUpdateJobItemMutation();
  const { data: stockData }                           = useGetStockItemsQuery();
  const [itemSearch, setItemSearch]                   = useState("");
  const [showItemDropdown, setShowItemDropdown]       = useState(false);
  const [itemError, setItemError]                     = useState("");
  const [confirmDeleteItemId, setConfirmDeleteItemId] = useState<string | null>(null);
  const dropdownRef                                   = useRef<HTMLDivElement>(null);
  const [showCustomForm, setShowCustomForm]           = useState(false);
  const [customName, setCustomName]                   = useState("");
  const [customUnit, setCustomUnit]                   = useState("");
  const [customUnitCost, setCustomUnitCost]           = useState("");

  const addedStockIds = new Set(
    jobItems.filter((ji) => ji.stockItemId).map((ji) => ji.stockItemId!)
  );
  const filteredStock = (stockData?.data ?? []).filter((si) => {
    if (addedStockIds.has(si.id)) return false;
    if (!itemSearch.trim()) return true;
    return (si.name ?? "").toLowerCase().includes(itemSearch.toLowerCase()) ||
           (si.category ?? "").toLowerCase().includes(itemSearch.toLowerCase());
  });

  const handleAddItem = async (stockItemId: string) => {
    setItemError("");
    try {
      await addJobItem({ jobId, stockItemId, quantityNeeded: 1 }).unwrap();
      refetchDetails();
      setItemSearch("");
      setShowItemDropdown(false);
    } catch {
      setItemError("Failed to add item.");
    }
  };

  const handleAddCustomItem = async () => {
    if (!customName.trim()) return;
    setItemError("");
    try {
      await addJobItem({
        jobId,
        itemName: customName.trim(),
        unit: customUnit.trim() || undefined,
        ...(customUnitCost && parseFloat(customUnitCost) > 0 && { unitCost: parseFloat(customUnitCost) }),
        quantityNeeded: 1,
      }).unwrap();
      refetchDetails();
      setCustomName("");
      setCustomUnit("");
      setCustomUnitCost("");
      setShowCustomForm(false);
    } catch {
      setItemError("Failed to add custom item.");
    }
  };

  const handleRemoveItem = async (itemId: string) => {
    try {
      await removeJobItem({ jobId, itemId }).unwrap();
      refetchDetails();
      setConfirmDeleteItemId(null);
    } catch {
      setItemError("Failed to remove item.");
    }
  };

  const handleQtyChange = async (itemId: string, qty: string) => {
    const n = parseFloat(qty);
    if (!n || n <= 0) return;
    try {
      await updateJobItem({ jobId, itemId, quantityNeeded: n }).unwrap();
      refetchDetails();
    } catch { /* silently ignore */ }
  };

  // ── Documents ──────────────────────────────────────────────────────────────
  const fileInputRef = useRef<HTMLInputElement>(null);
  const { data: docs = [], isLoading: loadingDocs, refetch: refetchDocs } = useGetJobDocumentsQuery(jobId);
  const [uploadDocs, { isLoading: uploading }]      = useUploadJobDocumentsMutation();
  const [deleteDoc,  { isLoading: deletingDoc }]    = useDeleteJobDocumentMutation();
  const [deletingDocId, setDeletingDocId]            = useState<string | null>(null);
  const [confirmDeleteDocId, setConfirmDeleteDocId]  = useState<string | null>(null);
  const [docError, setDocError]                      = useState<string | null>(null);

  const handleFileUpload = async (files: FileList | null) => {
    if (!files || files.length === 0) return;
    setDocError(null);
    try {
      await uploadDocs({ jobId, files: Array.from(files) }).unwrap();
      refetchDocs();
    } catch {
      setDocError("Failed to upload. Please try again.");
    }
  };

  const handleDeleteDoc = async (docId: string) => {
    setDeletingDocId(docId);
    try {
      await deleteDoc({ jobId, docId }).unwrap();
      refetchDocs();
    } catch { /* silently ignore */ }
    finally { setDeletingDocId(null); setConfirmDeleteDocId(null); }
  };

  const getFileIcon = (mimeType: string) => {
    if (mimeType?.startsWith("image/"))  return "text-blue-500";
    if (mimeType === "application/pdf")  return "text-red-500";
    if (mimeType?.includes("sheet") || mimeType?.includes("excel")) return "text-green-600";
    if (mimeType?.includes("word")  || mimeType?.includes("document")) return "text-blue-600";
    return "text-custom-700";
  };

  // ── Job form ───────────────────────────────────────────────────────────────
  const [form, setForm] = useState({
    title: "", jobType: "", quantity: "", size: "", colorMode: "",
    bindingType: "", priority: "normal" as JobPriority,
    dueDate: "", description: "", notes: "", amount: "",
  });
  const [serverError, setServerError] = useState("");

  useEffect(() => {
    if (!job) return;
    setForm({
      title:       job.title       ?? "",
      jobType:     job.jobType     ?? "",
      quantity:    job.quantity    != null ? String(job.quantity) : "",
      size:        job.size        ?? "",
      colorMode:   job.colorMode   ?? "",
      bindingType: job.bindingType ?? "",
      priority:    job.priority    ?? "normal",
      dueDate:     job.dueDate     ? job.dueDate.split("T")[0] : "",
      description: job.description ?? "",
      notes:       job.notes       ?? "",
      amount:      job.amount      != null ? String(job.amount) : "",
    });
  }, [job]);

  const handleChange = (
    e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement>
  ) => setForm((prev) => ({ ...prev, [e.target.name]: e.target.value }));

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setServerError("");
    try {
      await updateJob({
        id: jobId,
        title:       form.title       || undefined,
        jobType:     form.jobType     || undefined,
        quantity:    form.quantity    ? parseInt(form.quantity, 10) : undefined,
        size:        form.size        || undefined,
        colorMode:   form.colorMode   || undefined,
        bindingType: form.bindingType || undefined,
        priority:    form.priority,
        amount:      form.amount      ? parseFloat(form.amount) : undefined,
        dueDate:     form.dueDate     ? new Date(form.dueDate).toISOString() : undefined,
        description: form.description || undefined,
        notes:       form.notes       || undefined,
      }).unwrap();
      onUpdated();
    } catch (err: unknown) {
      const e = err as { data?: { message?: string } };
      setServerError(e?.data?.message ?? "Failed to update job. Please try again.");
    }
  };

  // ── Render ─────────────────────────────────────────────────────────────────

  return (
    <div className="fixed inset-0 bg-secondary-100/60 z-50 flex items-center justify-center p-4">
      <div className="w-full max-w-2xl flex flex-col" style={{ height: "min(92vh, 860px)" }}>
        <Card className="!p-0 overflow-hidden flex flex-col h-full">

          {/* Header */}
          <div className="flex items-center justify-between px-6 py-4 border-b border-custom-300 shrink-0">
            <div className="flex items-center gap-2">
              <HiOutlineBriefcase className="w-5 h-5 text-primary-500" />
              <div>
                <h3 className="text-lg font-bold text-secondary-100">Edit Job</h3>
                {job && <p className="text-xs text-primary-600 font-semibold">{job.jobNumber}</p>}
              </div>
            </div>
            <button onClick={onClose}
              className="p-1.5 rounded-lg hover:bg-custom-100 transition-colors text-custom-700 hover:text-secondary-100">
              <HiOutlineX className="w-5 h-5" />
            </button>
          </div>

          {/* Body */}
          {isLoading ? (
            <div className="flex-1 flex items-center justify-center text-custom-700 text-sm gap-2">
              <HiOutlineRefresh className="w-5 h-5 animate-spin" /> Loading…
            </div>
          ) : isError || !job ? (
            <div className="flex-1 flex items-center justify-center text-red-600 text-sm">
              Failed to load job.
            </div>
          ) : (
            <form onSubmit={handleSubmit} className="flex flex-col flex-1 min-h-0">
              <div className="flex-1 overflow-y-auto px-6 py-5 space-y-5 min-h-0">

                {/* Title */}
                <div>
                  <label className="block text-sm font-semibold text-secondary-100 mb-1.5">
                    Job Title <span className="text-red-500">*</span>
                  </label>
                  <Input name="title" type="text" value={form.title} onChange={handleChange} required fullWidth />
                </div>

                {/* Job Type + Quantity */}
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-semibold text-secondary-100 mb-1.5">Job Type</label>
                    <select name="jobType" value={form.jobType} onChange={handleChange} className={selectCls}>
                      <option value="">Select type</option>
                      <option value="business-card">Business Card</option>
                      <option value="brochure">Brochure</option>
                      <option value="flyer">Flyer</option>
                      <option value="banner">Banner</option>
                      <option value="booklet">Booklet</option>
                      <option value="poster">Poster</option>
                      <option value="envelope">Envelope</option>
                      <option value="other">Other</option>
                    </select>
                  </div>
                  <div>
                    <label className="block text-sm font-semibold text-secondary-100 mb-1.5">Quantity</label>
                    <Input name="quantity" type="number" min="1" value={form.quantity} onChange={handleChange} fullWidth />
                  </div>
                </div>

                {/* Amount */}
                <div>
                  <label className="block text-sm font-semibold text-secondary-100 mb-1.5">Amount (RWF)</label>
                  <Input name="amount" type="number" min="0" step="any" placeholder="e.g. 25000"
                    value={form.amount} onChange={handleChange} fullWidth />
                </div>

                {/* Size + Color Mode */}
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-semibold text-secondary-100 mb-1.5">Size</label>
                    <select name="size" value={form.size} onChange={handleChange} className={selectCls}>
                      <option value="">Select size</option>
                      <option value="A3">A3</option><option value="A4">A4</option>
                      <option value="A5">A5</option><option value="A6">A6</option>
                      <option value="Letter">Letter</option><option value="Custom">Custom</option>
                    </select>
                  </div>
                  <div>
                    <label className="block text-sm font-semibold text-secondary-100 mb-1.5">Color Mode</label>
                    <select name="colorMode" value={form.colorMode} onChange={handleChange} className={selectCls}>
                      <option value="">Select color mode</option>
                      <option value="full-color">Full Color</option>
                      <option value="black-and-white">Black & White</option>
                      <option value="spot-color">Spot Color</option>
                    </select>
                  </div>
                </div>

                {/* Binding + Priority */}
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-semibold text-secondary-100 mb-1.5">Binding Type</label>
                    <select name="bindingType" value={form.bindingType} onChange={handleChange} className={selectCls}>
                      <option value="">Select binding</option>
                      <option value="none">None</option><option value="staple">Staple</option>
                      <option value="spiral">Spiral</option><option value="perfect">Perfect Bind</option>
                      <option value="hardcover">Hardcover</option>
                    </select>
                  </div>
                  <div>
                    <label className="block text-sm font-semibold text-secondary-100 mb-1.5">Priority</label>
                    <select name="priority" value={form.priority} onChange={handleChange} className={selectCls}>
                      <option value="low">Low</option><option value="normal">Normal</option>
                      <option value="high">High</option><option value="urgent">Urgent</option>
                    </select>
                  </div>
                </div>

                {/* Due Date */}
                <div>
                  <label className="block text-sm font-semibold text-secondary-100 mb-1.5">Due Date</label>
                  <Input name="dueDate" type="date" value={form.dueDate} onChange={handleChange} fullWidth />
                </div>

                {/* Description */}
                <div>
                  <label className="block text-sm font-semibold text-secondary-100 mb-1.5">Description</label>
                  <textarea name="description" value={form.description} onChange={handleChange}
                    rows={3} className={`${selectCls} resize-none`} placeholder="Brief description…" />
                </div>

                {/* Notes */}
                <div>
                  <label className="block text-sm font-semibold text-secondary-100 mb-1.5">Notes</label>
                  <textarea name="notes" value={form.notes} onChange={handleChange}
                    rows={3} className={`${selectCls} resize-none`} placeholder="Special instructions…" />
                </div>

                {/* ── Materials ── */}
                <div className="border-t border-custom-300 pt-5">
                  <div className="flex items-center gap-2 mb-3">
                    <HiOutlineCube className="w-4 h-4 text-custom-700" />
                    <p className="text-sm font-bold text-secondary-100">Materials / Stock Items</p>
                    <span className="text-xs text-custom-700 ml-1">({jobItems.length})</span>
                  </div>

                  {/* Search + add stock item */}
                  <div className="relative mb-2" ref={dropdownRef}>
                    <HiOutlineSearch className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-custom-700 z-10" />
                    <input type="text" value={itemSearch}
                      onChange={(e) => { setItemSearch(e.target.value); setShowItemDropdown(true); }}
                      onFocus={() => setShowItemDropdown(true)}
                      onBlur={() => setTimeout(() => setShowItemDropdown(false), 150)}
                      placeholder="Search to add a stock item…"
                      className="w-full pl-9 pr-4 py-2 rounded-xl border border-custom-400 bg-style-500 text-secondary-100 text-sm focus:outline-none focus:border-primary-400 transition-colors" />
                    {showItemDropdown && (
                      <div className="absolute z-20 top-full left-0 right-0 mt-1 rounded-xl border border-custom-300 bg-style-500 shadow-lg max-h-48 overflow-y-auto">
                        {filteredStock.length === 0 ? (
                          <div className="px-4 py-3 text-sm text-custom-700">No items found</div>
                        ) : filteredStock.map((si) => (
                          <button key={si.id} type="button"
                            onMouseDown={() => handleAddItem(si.id)}
                            disabled={addingItem}
                            className="w-full text-left px-4 py-2.5 hover:bg-custom-100 transition-colors">
                            <div className="flex items-center justify-between gap-2">
                              <div className="min-w-0">
                                <p className="text-sm font-semibold text-secondary-100 truncate">{si.name}</p>
                                <p className="text-xs text-custom-700">{si.category} · {si.unit}</p>
                              </div>
                              <span className={`text-xs font-bold shrink-0 ${
                                si.stockStatus === "out-of-stock" || (si.stockStatus as string) === "OUT_OF_STOCK"
                                  ? "text-red-500" : "text-emerald-600"
                              }`}>{si.currentStock} {si.unit}</span>
                            </div>
                          </button>
                        ))}
                      </div>
                    )}
                  </div>

                  {/* Add custom material */}
                  {!showCustomForm ? (
                    <button
                      type="button"
                      onClick={() => { setShowCustomForm(true); setShowItemDropdown(false); }}
                      className="mb-3 w-full flex items-center gap-2 px-3 py-2 rounded-xl border border-dashed border-custom-400 text-custom-700 hover:border-primary-400 hover:text-primary-600 hover:bg-primary-50 transition-colors text-xs font-semibold"
                    >
                      <span className="text-base leading-none">＋</span>
                      Add material not in stock
                    </button>
                  ) : (
                    <div className="mb-3 p-3 rounded-xl border border-primary-300 bg-primary-50 space-y-2">
                      <p className="text-xs font-bold text-primary-600">Custom material</p>
                      <input
                        type="text"
                        value={customName}
                        onChange={(e) => setCustomName(e.target.value)}
                        placeholder="Material name *"
                        autoFocus
                        className="w-full px-3 py-2 rounded-xl border border-custom-400 bg-style-500 text-secondary-100 text-sm focus:outline-none focus:border-primary-400 transition-colors"
                      />
                      <div className="flex gap-2">
                        <input
                          type="text"
                          value={customUnit}
                          onChange={(e) => setCustomUnit(e.target.value)}
                          placeholder="Unit (sheets, kg…)"
                          className="flex-1 px-2 py-2 rounded-xl border border-custom-400 bg-style-500 text-secondary-100 text-sm focus:outline-none focus:border-primary-400 transition-colors"
                        />
                        <input
                          type="number"
                          min="0"
                          value={customUnitCost}
                          onChange={(e) => setCustomUnitCost(e.target.value)}
                          placeholder="Unit cost (RWF)"
                          className="flex-1 px-2 py-2 rounded-xl border border-custom-400 bg-style-500 text-secondary-100 text-sm focus:outline-none focus:border-primary-400 transition-colors"
                        />
                      </div>
                      <div className="flex gap-2">
                        <button
                          type="button"
                          onClick={handleAddCustomItem}
                          disabled={!customName.trim() || addingItem}
                          className="flex-1 px-3 py-1.5 rounded-xl bg-primary-500 text-white text-xs font-semibold hover:bg-primary-600 disabled:opacity-40 transition-colors"
                        >
                          {addingItem ? "Adding…" : "Add"}
                        </button>
                        <button
                          type="button"
                          onClick={() => { setShowCustomForm(false); setCustomName(""); setCustomUnit(""); setCustomUnitCost(""); }}
                          className="px-3 py-1.5 rounded-xl border border-custom-300 text-custom-700 text-xs font-semibold hover:bg-custom-100 transition-colors"
                        >
                          Cancel
                        </button>
                      </div>
                    </div>
                  )}

                  {itemError && (
                    <p className="text-xs text-red-600 mb-2 flex items-center gap-1">
                      <HiOutlineExclamationCircle className="w-3.5 h-3.5" /> {itemError}
                    </p>
                  )}

                  {jobItems.length === 0 ? (
                    <div className="py-4 text-center rounded-xl border-2 border-dashed border-custom-200">
                      <HiOutlineCube className="w-7 h-7 text-custom-400 mx-auto mb-1" />
                      <p className="text-xs text-custom-700">No materials added. Search above to add.</p>
                    </div>
                  ) : (
                    <div className="space-y-2">
                      {jobItems.map((ji) => {
                        // Resolve display name: stock item name → custom itemName → id fallback
                        const displayName = ji.stockItem?.itemName ?? ji.stockItem?.name ?? ji.itemName ?? ji.stockItemId ?? "—";
                        const displayUnit = ji.stockItem?.unit ?? ji.unit ?? "";
                        const isCustom    = !ji.stockItemId;
                        return (
                          <div key={ji.id}
                            className={`flex items-center gap-3 px-3 py-2.5 rounded-xl border bg-custom-50 ${
                              isCustom ? "border-yellow-200" : "border-custom-200"
                            }`}>
                            <div className="min-w-0 flex-1">
                              <div className="flex items-center gap-2">
                                <p className="text-sm font-semibold text-secondary-100 truncate">{displayName}</p>
                                {isCustom && (
                                  <span className="text-[10px] font-bold px-1.5 py-0.5 rounded-full bg-yellow-100 text-yellow-700 shrink-0">custom</span>
                                )}
                              </div>
                              <p className="text-xs text-custom-700">
                                {ji.stockItem?.category ?? ""}
                                {displayUnit ? ` · ${displayUnit}` : ""}
                                {ji.unitCost ? ` · ${Number(ji.unitCost).toLocaleString()} RWF/unit` : ""}
                              </p>
                            </div>
                            <input type="number" min="0.01" step="any"
                              defaultValue={ji.quantityNeeded}
                              onBlur={(e) => handleQtyChange(ji.id, e.target.value)}
                              className="w-20 px-2 py-1 rounded-lg border border-custom-300 bg-style-500 text-secondary-100 text-sm text-center focus:outline-none focus:border-primary-400 transition-colors" />
                            <span className="text-xs text-custom-700 shrink-0 w-8">{displayUnit}</span>
                            <button type="button"
                              onClick={() => setConfirmDeleteItemId(ji.id)}
                              className="p-1.5 rounded-lg hover:bg-red-100 text-custom-700 hover:text-red-600 transition-colors shrink-0">
                              <HiOutlineTrash className="w-4 h-4" />
                            </button>
                          </div>
                        );
                      })}
                    </div>
                  )}
                </div>

                {/* ── Documents ── */}
                <div className="border-t border-custom-300 pt-5">
                  <div className="flex items-center justify-between mb-3">
                    <div className="flex items-center gap-2">
                      <HiOutlinePaperClip className="w-4 h-4 text-custom-700" />
                      <p className="text-sm font-bold text-secondary-100">
                        Documents {!loadingDocs && `(${docs.length})`}
                      </p>
                    </div>
                    <button type="button" onClick={() => fileInputRef.current?.click()}
                      disabled={uploading}
                      className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-primary-500 text-white text-xs font-semibold hover:bg-primary-600 transition-colors disabled:opacity-50">
                      <HiOutlineUpload className="w-3.5 h-3.5" />
                      {uploading ? "Uploading…" : "Upload"}
                    </button>
                    <input ref={fileInputRef} type="file" multiple className="hidden"
                      accept=".pdf,.doc,.docx,.xls,.xlsx,.png,.jpg,.jpeg,.gif,.webp"
                      onChange={(e) => handleFileUpload(e.target.files)} />
                  </div>

                  {docError && (
                    <div className="flex items-center gap-2 px-3 py-2 mb-3 rounded-xl bg-red-50 border border-red-200 text-red-700 text-xs">
                      <HiOutlineExclamationCircle className="w-4 h-4 shrink-0" /> {docError}
                    </div>
                  )}

                  {loadingDocs ? (
                    <p className="text-xs text-custom-700 py-2">Loading documents…</p>
                  ) : docs.length === 0 ? (
                    <div className="py-4 text-center rounded-xl border-2 border-dashed border-custom-200">
                      <HiOutlinePaperClip className="w-7 h-7 text-custom-400 mx-auto mb-1" />
                      <p className="text-xs text-custom-700">No documents. Click Upload to add.</p>
                    </div>
                  ) : (
                    <div className="space-y-2">
                      {docs.map((doc) => (
                        <div key={doc.id}
                          className="flex items-center gap-3 p-3 rounded-xl border border-custom-200 bg-custom-50">
                          <div className="w-8 h-8 rounded-lg bg-white border border-custom-200 flex items-center justify-center shrink-0">
                            <HiOutlineDocumentText className={`w-4 h-4 ${getFileIcon(doc.mimeType)}`} />
                          </div>
                          <div className="min-w-0 flex-1">
                            <p className="text-sm font-semibold text-secondary-100 truncate">{doc.fileName}</p>
                            <p className="text-xs text-custom-700">{doc.mimeType}</p>
                          </div>
                          <a href={doc.fileUrl} download={doc.fileName}
                            className="p-1.5 rounded-lg hover:bg-primary-100 text-custom-700 hover:text-primary-600 transition-colors" title="Download">
                            <HiOutlineDownload className="w-4 h-4" />
                          </a>
                          <button type="button" onClick={() => setConfirmDeleteDocId(doc.id)}
                            className="p-1.5 rounded-lg hover:bg-red-100 text-custom-700 hover:text-red-600 transition-colors" title="Delete">
                            <HiOutlineTrash className="w-4 h-4" />
                          </button>
                        </div>
                      ))}
                    </div>
                  )}
                </div>

                {/* Server error */}
                {serverError && (
                  <div className="flex items-center gap-2 px-3 py-2 rounded-xl bg-red-50 border border-red-200 text-red-700 text-sm">
                    <HiOutlineExclamationCircle className="w-4 h-4 shrink-0" /> {serverError}
                  </div>
                )}
              </div>

              {/* Footer */}
              <div className="px-6 py-4 border-t border-custom-300 flex justify-end gap-3 shrink-0">
                <Button type="button" variant="outline" onClick={onClose}>Cancel</Button>
                <Button type="submit" disabled={saving || !form.title.trim()}>
                  {saving ? "Saving…" : "Save Changes"}
                </Button>
              </div>
            </form>
          )}
        </Card>
      </div>

      {/* ── Confirm delete item modal ── */}
      {confirmDeleteItemId && (
        <div className="fixed inset-0 bg-secondary-100/60 z-[60] flex items-center justify-center p-4">
          <div className="bg-white rounded-2xl shadow-xl p-6 max-w-sm w-full">
            <div className="flex items-start gap-4 mb-5">
              <div className="w-10 h-10 rounded-full bg-red-100 flex items-center justify-center shrink-0">
                <HiOutlineTrash className="w-5 h-5 text-red-600" />
              </div>
              <div>
                <h3 className="text-base font-bold text-secondary-100">Remove Material</h3>
                <p className="text-sm text-custom-700 mt-1">
                  {(() => {
                    const ji = jobItems.find((i) => i.id === confirmDeleteItemId);
                    const name = ji?.stockItem?.name ?? ji?.itemName ?? "this item";
                    return <>Are you sure you want to remove <span className="font-semibold text-secondary-100">"{name}"</span> from this job?</>;
                  })()}
                </p>
              </div>
            </div>
            <div className="flex gap-3">
              <button type="button" onClick={() => setConfirmDeleteItemId(null)}
                className="flex-1 px-4 py-2 rounded-xl border border-custom-300 text-sm font-semibold text-secondary-100 hover:bg-custom-100 transition-colors">
                Cancel
              </button>
              <button type="button" onClick={() => handleRemoveItem(confirmDeleteItemId)}
                disabled={removingItem}
                className="flex-1 px-4 py-2 rounded-xl bg-red-500 text-white text-sm font-semibold hover:bg-red-600 transition-colors disabled:opacity-50">
                {removingItem ? "Removing…" : "Remove"}
              </button>
            </div>
          </div>
        </div>
      )}

      {/* ── Confirm delete document modal ── */}
      {confirmDeleteDocId && (
        <div className="fixed inset-0 bg-secondary-100/60 z-[60] flex items-center justify-center p-4">
          <Card className="!p-6 max-w-sm w-full">
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
              <Button type="button" variant="outline" className="flex-1"
                onClick={() => setConfirmDeleteDocId(null)}>
                Cancel
              </Button>
              <button type="button"
                disabled={deletingDoc && deletingDocId === confirmDeleteDocId}
                onClick={() => handleDeleteDoc(confirmDeleteDocId)}
                className="flex-1 px-4 py-2 rounded-xl bg-red-500 text-white text-sm font-semibold hover:bg-red-600 transition-colors disabled:opacity-50">
                {deletingDoc && deletingDocId === confirmDeleteDocId ? "Deleting…" : "Delete"}
              </button>
            </div>
          </Card>
        </div>
      )}
    </div>
  );
}
