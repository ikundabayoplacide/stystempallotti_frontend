import { useEffect, useState } from "react";
import {
  HiOutlineBriefcase,
  HiOutlineExclamationCircle,
  HiOutlineRefresh,
  HiOutlineX,
} from "react-icons/hi";
import { Button, Input } from "../../components/ui";
import Card from "../../components/ui/Card";
import {
  useGetJobByIdQuery,
  useUpdateJobMutation,
} from "../../store/services/jobsService";
import type { JobPriority } from "../../store/services/jobsService";

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
  const [updateJob, { isLoading: saving }] = useUpdateJobMutation();

  const [form, setForm] = useState({
    title:       "",
    jobType:     "",
    quantity:    "",
    size:        "",
    colorMode:   "",
    bindingType: "",
    priority:    "normal" as JobPriority,
    dueDate:     "",
    description: "",
    notes:       "",
    amount:      "",
  });

  const [serverError, setServerError] = useState("");

  // Populate form once job data arrives
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
  ) => {
    setForm((prev) => ({ ...prev, [e.target.name]: e.target.value }));
  };

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

  // ── Render ────────────────────────────────────────────────────────────────

  return (
    <div className="fixed inset-0 bg-secondary-100/60 z-50 flex items-center justify-center p-4">
      <div className="w-full max-w-2xl flex flex-col" style={{ height: "min(92vh, 780px)" }}>
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
            <form onSubmit={handleSubmit} className="flex flex-col flex-1 min-h-0">

              {/* Scrollable fields */}
              <div className="flex-1 overflow-y-auto px-6 py-5 space-y-5 min-h-0">

                {/* Title */}
                <div>
                  <label className="block text-sm font-semibold text-secondary-100 mb-1.5">
                    Job Title <span className="text-red-500">*</span>
                  </label>
                  <Input
                    name="title"
                    type="text"
                    value={form.title}
                    onChange={handleChange}
                    required
                    fullWidth
                  />
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
                    <Input
                      name="quantity"
                      type="number"
                      min="1"
                      value={form.quantity}
                      onChange={handleChange}
                      fullWidth
                    />
                  </div>
                </div>

                {/* Amount */}
                <div>
                  <label className="block text-sm font-semibold text-secondary-100 mb-1.5">
                    Amount (RWF)
                  </label>
                  <Input
                    name="amount"
                    type="number"
                    min="0"
                    step="any"
                    placeholder="e.g. 25000"
                    value={form.amount}
                    onChange={handleChange}
                    fullWidth
                  />
                </div>

                {/* Size + Color Mode */}
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-semibold text-secondary-100 mb-1.5">Size</label>
                    <select name="size" value={form.size} onChange={handleChange} className={selectCls}>
                      <option value="">Select size</option>
                      <option value="A3">A3</option>
                      <option value="A4">A4</option>
                      <option value="A5">A5</option>
                      <option value="A6">A6</option>
                      <option value="Letter">Letter</option>
                      <option value="Custom">Custom</option>
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
                      <option value="none">None</option>
                      <option value="staple">Staple</option>
                      <option value="spiral">Spiral</option>
                      <option value="perfect">Perfect Bind</option>
                      <option value="hardcover">Hardcover</option>
                    </select>
                  </div>
                  <div>
                    <label className="block text-sm font-semibold text-secondary-100 mb-1.5">Priority</label>
                    <select name="priority" value={form.priority} onChange={handleChange} className={selectCls}>
                      <option value="low">Low</option>
                      <option value="normal">Normal</option>
                      <option value="high">High</option>
                      <option value="urgent">Urgent</option>
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
                  <textarea
                    name="description"
                    value={form.description}
                    onChange={handleChange}
                    rows={3}
                    className={`${selectCls} resize-none`}
                    placeholder="Brief description of the job…"
                  />
                </div>

                {/* Notes */}
                <div>
                  <label className="block text-sm font-semibold text-secondary-100 mb-1.5">Notes</label>
                  <textarea
                    name="notes"
                    value={form.notes}
                    onChange={handleChange}
                    rows={3}
                    className={`${selectCls} resize-none`}
                    placeholder="Any special instructions or requirements…"
                  />
                </div>

                {/* Server error */}
                {serverError && (
                  <div className="flex items-center gap-2 px-3 py-2 rounded-xl bg-red-50 border border-red-200 text-red-700 text-sm">
                    <HiOutlineExclamationCircle className="w-4 h-4 shrink-0" />
                    {serverError}
                  </div>
                )}
              </div>

              {/* Footer */}
              <div className="px-6 py-4 border-t border-custom-300 flex justify-end gap-3 shrink-0">
                <Button type="button" variant="outline" onClick={onClose}>
                  Cancel
                </Button>
                <Button type="submit" disabled={saving || !form.title.trim()}>
                  {saving ? "Saving…" : "Save Changes"}
                </Button>
              </div>
            </form>
          )}
        </Card>
      </div>
    </div>
  );
}
