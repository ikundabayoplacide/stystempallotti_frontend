import { useState } from "react";
import { useSelector } from "react-redux";
import {
  HiOutlineBadgeCheck,
  HiOutlineBriefcase,
  HiOutlineCash,
  HiOutlineCheckCircle,
  HiOutlineCreditCard,
  HiOutlineEye,
  HiOutlineExclamationCircle,
  HiOutlinePencil,
  HiOutlinePhone,
  HiOutlinePlus,
  HiOutlineRefresh,
  HiOutlineSearch,
  HiOutlineX,
  HiOutlineXCircle,
} from "react-icons/hi";
import { toast } from "react-toastify";
import { DashboardLayout } from "../../components";
import { Card } from "../../components/ui";
import {
  useCreateJobMutation,
  useGetJobsQuery,
  useUpdateJobMutation,
  useCompleteJobMutation,
  type Job,
  type JobPriority,
  type JobStatus,
  type PaymentMethod,
} from "../../store/services/jobsService";
import {
  useRecordPaymentMutation,
  type PaymentState,
} from "../../store/services/paymentsService";
import type { RootState } from "../../store";

// ─── Constants ────────────────────────────────────────────────────────────────

const PAGE_SIZE = 10;

const STATUS_STEPS: JobStatus[] = [
  "pending", "confirmed", "ready-for-delivery", "delivered", "completed",
];

const STATUS_LABEL: Record<string, string> = {
  pending: "Pending", confirmed: "Confirmed",
  "in-composition": "In Composition", "in-montage": "In Montage",
  "in-printing": "In Printing", "in-binding": "In Binding",
  "in-packaging": "In Packaging", "quality-check": "Quality Check",
  "ready-for-delivery": "Ready", delivered: "Delivered",
  completed: "Completed", rejected: "Rejected",
};

const STATUS_COLOR: Record<string, string> = {
  pending: "bg-yellow-100 text-yellow-700",
  confirmed: "bg-blue-100 text-blue-700",
  "in-composition": "bg-orange-100 text-orange-700",
  "in-montage": "bg-amber-100 text-amber-700",
  "in-printing": "bg-pink-100 text-pink-700",
  "in-binding": "bg-teal-100 text-teal-700",
  "in-packaging": "bg-cyan-100 text-cyan-700",
  "quality-check": "bg-purple-100 text-purple-700",
  "ready-for-delivery": "bg-emerald-100 text-emerald-700",
  delivered: "bg-green-100 text-green-700",
  completed: "bg-gray-100 text-gray-700",
  rejected: "bg-red-100 text-red-700",
};

const PAYMENT_METHODS: { value: PaymentMethod; label: string; icon: React.ReactNode; color: string }[] = [
  { value: "CASH",          label: "Cash",          icon: <HiOutlineCash className="w-5 h-5" />,        color: "border-green-400 bg-green-50 text-green-700" },
  { value: "MOBILE_MONEY",  label: "Mobile Money",  icon: <HiOutlinePhone className="w-5 h-5" />,       color: "border-yellow-400 bg-yellow-50 text-yellow-700" },
  { value: "BANK_TRANSFER", label: "Bank Transfer",  icon: <HiOutlineCreditCard className="w-5 h-5" />,  color: "border-blue-400 bg-blue-50 text-blue-700" },
  { value: "CARD",          label: "Card",           icon: <HiOutlineBriefcase className="w-5 h-5" />,   color: "border-purple-400 bg-purple-50 text-purple-700" },
];

const STATUS_FILTER_OPTIONS = [
  { value: "",                   label: "All Statuses" },
  { value: "pending",            label: "Pending" },
  { value: "confirmed",          label: "Confirmed" },
  { value: "ready-for-delivery", label: "Ready for Delivery" },
  { value: "delivered",          label: "Delivered" },
  { value: "completed",          label: "Completed" },
  { value: "rejected",           label: "Rejected" },
];

const cls = "w-full px-3 py-2 rounded-xl border border-custom-300 bg-style-500 text-secondary-100 text-sm focus:outline-none focus:border-primary-400 transition-colors";


// ─── Status Progress ──────────────────────────────────────────────────────────

function StatusProgress({ status }: { status: string }) {
  const currentIdx = STATUS_STEPS.indexOf(status as JobStatus);
  if (status === "rejected") {
    return (
      <div className="flex items-center gap-2">
        <HiOutlineXCircle className="w-4 h-4 text-red-500" />
        <span className="text-xs font-semibold text-red-600">Job Rejected</span>
      </div>
    );
  }
  return (
    <div className="flex items-center gap-1 flex-wrap">
      {STATUS_STEPS.map((step, i) => {
        const isDone = currentIdx > i;
        const isCurrent = currentIdx === i;
        return (
          <div key={step} className="flex items-center gap-1">
            <div className={`flex items-center gap-1 px-2 py-0.5 rounded-full text-xs font-semibold ${
              isDone ? "bg-emerald-100 text-emerald-700" :
              isCurrent ? "bg-primary-500 text-white" : "bg-custom-100 text-custom-400"
            }`}>
              {isDone && <HiOutlineCheckCircle className="w-3 h-3" />}
              {STATUS_LABEL[step] ?? step}
            </div>
            {i < STATUS_STEPS.length - 1 && (
              <div className={`w-4 h-0.5 ${isDone ? "bg-emerald-400" : "bg-custom-200"}`} />
            )}
          </div>
        );
      })}
    </div>
  );
}

// ─── View Modal ───────────────────────────────────────────────────────────────

function ViewModal({ job, onClose }: { job: Job; onClose: () => void }) {
  return (
    <div className="fixed inset-0 bg-secondary-100/50 z-50 flex items-start justify-center p-4 overflow-y-auto">
      <Card className="!p-6 max-w-2xl w-full my-8">
        <div className="flex items-center justify-between mb-5">
          <div>
            <h3 className="text-xl font-bold text-secondary-100">Job Details</h3>
            <p className="text-xs text-custom-700 mt-0.5 font-mono">{job.jobNumber}</p>
          </div>
          <button onClick={onClose} className="text-custom-700 hover:text-secondary-100">
            <HiOutlineX className="w-6 h-6" />
          </button>
        </div>

        <div className="space-y-5">
          {/* Progress */}
          <div className="p-3 rounded-xl bg-custom-50 border border-custom-200">
            <p className="text-xs font-bold text-custom-700 uppercase tracking-wide mb-2">Progress</p>
            <StatusProgress status={job.status} />
          </div>

          {/* Customer */}
          <div>
            <p className="text-xs font-bold text-custom-700 uppercase tracking-wide mb-2">Customer / Owner</p>
            <div className="p-3 rounded-xl bg-custom-50 border border-custom-200 space-y-1.5 text-sm">
              {job.customer?.name && <div className="flex justify-between"><span className="text-custom-700">Name</span><span className="font-semibold text-secondary-100">{job.customer.name}</span></div>}
              {job.customer?.phone && <div className="flex justify-between"><span className="text-custom-700">Phone</span><span className="font-semibold text-secondary-100">{job.customer.phone}</span></div>}
              {job.customer?.email && <div className="flex justify-between"><span className="text-custom-700">Email</span><span className="font-semibold text-secondary-100">{job.customer.email}</span></div>}
            </div>
          </div>

          {/* Job info */}
          <div>
            <p className="text-xs font-bold text-custom-700 uppercase tracking-wide mb-2">Job Information</p>
            <div className="p-3 rounded-xl bg-custom-50 border border-custom-200 space-y-1.5 text-sm">
              {[
                ["Title",       job.title],
                ["Job Type",    job.jobType],
                ["Quantity",    job.quantity?.toString()],
                ["Size",        job.size],
                ["Color Mode",  job.colorMode],
                ["Binding",     job.bindingType],
                ["Priority",    job.priority],
                ["Due Date",    job.dueDate?.split("T")[0]],
                ["Created",     new Date(job.createdAt).toLocaleDateString("en-RW", { day: "2-digit", month: "short", year: "numeric" })],
              ].filter(([, v]) => v).map(([label, value]) => (
                <div key={label as string} className="flex justify-between">
                  <span className="text-custom-700">{label}</span>
                  <span className="font-semibold text-secondary-100 capitalize">{value}</span>
                </div>
              ))}
              {job.description && (
                <div className="pt-1 border-t border-custom-200">
                  <p className="text-custom-700 mb-0.5">Description</p>
                  <p className="text-secondary-100">{job.description}</p>
                </div>
              )}
              {job.notes && (
                <div className="pt-1 border-t border-custom-200">
                  <p className="text-custom-700 mb-0.5">Notes</p>
                  <p className="text-secondary-100">{job.notes}</p>
                </div>
              )}
              {job.rejectReason && (
                <div className="pt-1 border-t border-red-200 bg-red-50 rounded-lg p-2 mt-1">
                  <p className="text-xs font-bold text-red-700 mb-0.5">Rejection Reason</p>
                  <p className="text-sm text-red-600">{job.rejectReason}</p>
                </div>
              )}
            </div>
          </div>

          {/* Financial */}
          <div>
            <p className="text-xs font-bold text-custom-700 uppercase tracking-wide mb-2">Financial</p>
            <div className="p-3 rounded-xl bg-custom-50 border border-custom-200 space-y-1.5 text-sm">
              <div className="flex justify-between">
                <span className="text-custom-700">Amount</span>
                <span className="font-bold text-secondary-100">{job.amount != null ? `${Math.round(Number(job.amount)).toLocaleString()} RWF` : "—"}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-custom-700">Payment Status</span>
                <span className={`font-bold ${job.paymentStatus === "paid" ? "text-emerald-600" : "text-red-600"}`}>
                  {job.paymentStatus === "paid" ? "Paid" : "Unpaid"}
                </span>
              </div>
              {job.payments && job.payments.length > 0 && (
                <div className="pt-1 border-t border-custom-200 space-y-1">
                  {job.payments.map((p) => (
                    <div key={p.id} className="flex justify-between text-xs">
                      <span className="text-custom-700">{(p.paymentMethod ?? "").replace(/_/g, " ")} ({(p.paymentState ?? "FULL") === "PARTIAL" ? "Partial" : "Full"})</span>
                      <span className="font-semibold text-secondary-100">{Number(p.amountPaid).toLocaleString()} RWF</span>
                    </div>
                  ))}
                </div>
              )}
            </div>
          </div>
        </div>

        <button onClick={onClose}
          className="mt-5 w-full px-4 py-2 rounded-xl bg-primary-500 text-white text-sm font-semibold hover:bg-primary-600 transition-colors">
          Close
        </button>
      </Card>
    </div>
  );
}


// ─── Edit Modal ───────────────────────────────────────────────────────────────

function EditModal({ job, onClose, onSuccess }: { job: Job; onClose: () => void; onSuccess: () => void }) {
  const [form, setForm] = useState({
    title:       job.title ?? "",
    amount:      job.amount != null ? String(job.amount) : "",
    priority:    (job.priority ?? "normal") as JobPriority,
    dueDate:     job.dueDate?.split("T")[0] ?? "",
    jobType:     job.jobType ?? "",
    quantity:    job.quantity != null ? String(job.quantity) : "",
    size:        job.size ?? "",
    colorMode:   job.colorMode ?? "",
    bindingType: job.bindingType ?? "",
    notes:       job.notes ?? "",
    description: job.description ?? "",
  });

  const [updateJob, { isLoading }] = useUpdateJobMutation();

  const set = (k: keyof typeof form) =>
    (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement>) =>
      setForm((p) => ({ ...p, [k]: e.target.value }));

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!form.title.trim()) { toast.error("Title is required"); return; }
    try {
      await updateJob({
        id:          job.id,
        title:       form.title.trim(),
        amount:      form.amount      ? Number(form.amount)   : undefined,
        priority:    form.priority,
        dueDate:     form.dueDate     || undefined,
        jobType:     form.jobType.trim()     || undefined,
        quantity:    form.quantity    ? Number(form.quantity) : undefined,
        size:        form.size.trim()        || undefined,
        colorMode:   form.colorMode.trim()   || undefined,
        bindingType: form.bindingType.trim() || undefined,
        notes:       form.notes.trim()       || undefined,
        description: form.description.trim() || undefined,
      }).unwrap();
      toast.success("Job updated");
      onSuccess();
    } catch (err: any) {
      toast.error(err?.data?.message ?? "Failed to update job");
    }
  };

  return (
    <div className="fixed inset-0 bg-secondary-100/50 z-50 flex items-start justify-center p-4 overflow-y-auto">
      <Card className="!p-6 max-w-xl w-full my-8">
        <div className="flex items-center justify-between mb-5">
          <div>
            <h3 className="text-xl font-bold text-secondary-100">Edit Job</h3>
            <p className="text-xs text-custom-700 mt-0.5 font-mono">{job.jobNumber}</p>
          </div>
          <button onClick={onClose} className="text-custom-700 hover:text-secondary-100">
            <HiOutlineX className="w-6 h-6" />
          </button>
        </div>

        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label className="block text-xs font-semibold text-secondary-100 mb-1">Title *</label>
            <input value={form.title} onChange={set("title")} placeholder="Job title" className={cls} />
          </div>
          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="block text-xs font-semibold text-secondary-100 mb-1">Amount (RWF)</label>
              <input type="number" min={0} value={form.amount} onChange={set("amount")} placeholder="0" className={cls} />
            </div>
            <div>
              <label className="block text-xs font-semibold text-secondary-100 mb-1">Priority</label>
              <select value={form.priority} onChange={set("priority")} className={cls}>
                <option value="low">Low</option>
                <option value="normal">Normal</option>
                <option value="high">High</option>
                <option value="urgent">Urgent</option>
              </select>
            </div>
            <div>
              <label className="block text-xs font-semibold text-secondary-100 mb-1">Quantity</label>
              <input type="number" min={1} value={form.quantity} onChange={set("quantity")} placeholder="e.g. 500" className={cls} />
            </div>
            <div>
              <label className="block text-xs font-semibold text-secondary-100 mb-1">Due Date</label>
              <input type="date" value={form.dueDate} onChange={set("dueDate")} className={cls} />
            </div>
            <div>
              <label className="block text-xs font-semibold text-secondary-100 mb-1">Size</label>
              <input value={form.size} onChange={set("size")} placeholder="e.g. A4" className={cls} />
            </div>
            <div>
              <label className="block text-xs font-semibold text-secondary-100 mb-1">Color Mode</label>
              <input value={form.colorMode} onChange={set("colorMode")} placeholder="e.g. full-color" className={cls} />
            </div>
            <div>
              <label className="block text-xs font-semibold text-secondary-100 mb-1">Job Type</label>
              <input value={form.jobType} onChange={set("jobType")} placeholder="e.g. printing" className={cls} />
            </div>
            <div>
              <label className="block text-xs font-semibold text-secondary-100 mb-1">Binding Type</label>
              <input value={form.bindingType} onChange={set("bindingType")} placeholder="e.g. spiral" className={cls} />
            </div>
          </div>
          <div>
            <label className="block text-xs font-semibold text-secondary-100 mb-1">Description</label>
            <textarea value={form.description} onChange={set("description")} rows={2}
              className="w-full px-3 py-2 rounded-xl border border-custom-300 bg-style-500 text-secondary-100 text-sm focus:outline-none focus:border-primary-400 transition-colors resize-none" />
          </div>
          <div>
            <label className="block text-xs font-semibold text-secondary-100 mb-1">Notes</label>
            <textarea value={form.notes} onChange={set("notes")} rows={2}
              className="w-full px-3 py-2 rounded-xl border border-custom-300 bg-style-500 text-secondary-100 text-sm focus:outline-none focus:border-primary-400 transition-colors resize-none" />
          </div>
          <div className="flex gap-3 justify-end pt-2 border-t border-custom-300">
            <button type="button" onClick={onClose}
              className="px-4 py-2 rounded-xl border border-custom-300 text-sm font-semibold text-secondary-100 hover:bg-custom-100 transition-colors">
              Cancel
            </button>
            <button type="submit" disabled={isLoading}
              className="px-4 py-2 rounded-xl bg-primary-500 text-white text-sm font-semibold hover:bg-primary-600 disabled:opacity-40 transition-colors">
              {isLoading ? "Saving…" : "Save Changes"}
            </button>
          </div>
        </form>
      </Card>
    </div>
  );
}


// ─── Pay Modal ────────────────────────────────────────────────────────────────

function PayModal({ job, receivedById, onClose, onSuccess }: {
  job: Job; receivedById: string; onClose: () => void; onSuccess: () => void;
}) {
  const [method, setMethod]             = useState<PaymentMethod | null>(null);
  const [paymentState, setPaymentState] = useState<PaymentState>("FULL");
  const [partialAmount, setPartialAmount] = useState("");
  const [paymentNote, setPaymentNote]   = useState("");
  const [receipt, setReceipt]           = useState<{ receiptNo: string; amountPaid: number; balance: number } | null>(null);
  const [recordPayment, { isLoading }]  = useRecordPaymentMutation();

  const totalAmount = job.amount ?? 0;
  const amountPaid  = paymentState === "FULL" ? totalAmount : Number(partialAmount) || 0;
  const balance     = totalAmount - amountPaid;
  const canSubmit   = !!method && (paymentState === "FULL" || (amountPaid > 0 && amountPaid < totalAmount));

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!method) { toast.error("Select a payment method"); return; }
    if (paymentState === "PARTIAL" && amountPaid <= 0) { toast.error("Enter a valid partial amount"); return; }
    if (paymentState === "PARTIAL" && amountPaid >= totalAmount) { toast.error("Partial amount must be less than the total"); return; }
    try {
      const result = await recordPayment({
        jobId: job.id, receivedById, amountPaid,
        paymentMethod: method, paymentState,
        paymentNote: paymentNote.trim() || undefined,
      }).unwrap();
      setReceipt({ receiptNo: result.receiptNo, amountPaid: result.payment.amountPaid, balance: result.payment.balance });
      toast.success(`Payment recorded for job #${job.jobNumber}`);
    } catch (err: any) {
      toast.error(err?.data?.message ?? "Failed to record payment");
    }
  };

  // Receipt confirmation
  if (receipt) {
    return (
      <div className="fixed inset-0 bg-secondary-100/50 z-50 flex items-start justify-center p-4 overflow-y-auto">
        <Card className="!p-8 max-w-md w-full my-8 text-center">
          <div className="w-16 h-16 rounded-full bg-emerald-100 flex items-center justify-center mx-auto mb-4">
            <HiOutlineBadgeCheck className="w-9 h-9 text-emerald-600" />
          </div>
          <h3 className="text-xl font-bold text-secondary-100 mb-1">Payment Recorded</h3>
          <p className="text-sm text-custom-700 mb-4">Job #{job.jobNumber}</p>
          <div className="rounded-xl bg-custom-100 border border-custom-300 p-4 space-y-2.5 text-left mb-5">
            {[
              ["Customer",      job.customer?.name ?? "—"],
              ["Total Amount",  `${Math.round(totalAmount).toLocaleString()} RWF`],
              ["Amount Paid",   `${Math.round(receipt.amountPaid).toLocaleString()} RWF`],
              ...(receipt.balance > 0 ? [["Remaining",  `${receipt.balance.toLocaleString()} RWF`]] : []),
              ["Method",        PAYMENT_METHODS.find((m) => m.value === method)?.label ?? method],
              ["Type",          paymentState === "FULL" ? "Full Payment" : "Partial Payment"],
            ].map(([label, value]) => (
              <div key={label as string} className="flex justify-between text-sm">
                <span className="text-custom-700">{label}</span>
                <span className="font-semibold text-secondary-100">{value}</span>
              </div>
            ))}
            <div className="pt-2 border-t border-custom-300 flex justify-between items-center">
              <span className="text-sm text-custom-700">Receipt No.</span>
              <span className="font-mono font-bold text-primary-600 text-base">{receipt.receiptNo}</span>
            </div>
          </div>
          <button onClick={() => { onSuccess(); onClose(); }}
            className="w-full px-4 py-2 rounded-xl bg-primary-500 text-white text-sm font-semibold hover:bg-primary-600 transition-colors">
            Done
          </button>
        </Card>
      </div>
    );
  }

  return (
    <div className="fixed inset-0 bg-secondary-100/50 z-50 flex items-start justify-center p-4 overflow-y-auto">
      <Card className="!p-6 max-w-lg w-full my-8">
        <div className="flex items-center justify-between mb-5">
          <div>
            <h3 className="text-xl font-bold text-secondary-100">Record Payment</h3>
            <p className="text-sm text-custom-700 mt-0.5">Job #{job.jobNumber}</p>
          </div>
          <button onClick={onClose} className="text-custom-700 hover:text-secondary-100">
            <HiOutlineX className="w-6 h-6" />
          </button>
        </div>

        {/* Job summary */}
        <div className="rounded-xl bg-custom-100 border border-custom-300 p-4 mb-5 space-y-2 text-sm">
          <div className="flex items-center justify-between">
            <span className="font-semibold text-secondary-100">{job.customer?.name ?? "—"}</span>
            {job.customer?.phone && <span className="text-custom-700">{job.customer.phone}</span>}
          </div>
          <p className="text-custom-700">{job.title}</p>
          {job.amount != null && (
            <div className="pt-2 border-t border-custom-200 flex justify-between">
              <span className="text-custom-700">Total Amount</span>
              <span className="font-bold text-secondary-100">{Math.round(Number(job.amount)).toLocaleString()} RWF</span>
            </div>
          )}
        </div>

        <form onSubmit={handleSubmit} className="space-y-5">
          {/* Payment type */}
          <div>
            <label className="block text-sm font-semibold text-secondary-100 mb-2">Payment Type *</label>
            <div className="grid grid-cols-2 gap-3">
              {(["FULL", "PARTIAL"] as PaymentState[]).map((type) => (
                <button key={type} type="button"
                  onClick={() => { setPaymentState(type); setPartialAmount(""); }}
                  className={`py-2.5 px-4 rounded-xl border-2 font-semibold text-sm transition-all ${
                    paymentState === type
                      ? type === "FULL" ? "border-emerald-500 bg-emerald-50 text-emerald-700" : "border-orange-400 bg-orange-50 text-orange-700"
                      : "border-custom-300 text-custom-700 hover:border-primary-300 hover:bg-custom-100"
                  }`}>
                  {type === "FULL" ? "Full Payment" : "Partial Payment"}
                </button>
              ))}
            </div>
          </div>

          {paymentState === "PARTIAL" && (
            <div className="rounded-xl border border-orange-200 bg-orange-50 p-4 space-y-2">
              <label className="block text-sm font-semibold text-secondary-100 mb-1">Amount to Pay (RWF) *</label>
              <input type="number" min={1} max={totalAmount - 1}
                placeholder={`Max ${(totalAmount - 1).toLocaleString()} RWF`}
                value={partialAmount} onChange={(e) => setPartialAmount(e.target.value)}
                className="w-full px-3 py-2 rounded-xl border border-custom-300 bg-white text-secondary-100 text-sm focus:outline-none focus:border-primary-400 transition-colors"
              />
              {amountPaid > 0 && amountPaid < totalAmount && (
                <div className="flex justify-between text-sm pt-1 border-t border-orange-200">
                  <span className="text-orange-700 font-semibold">Remaining balance</span>
                  <span className="font-bold text-orange-700">{balance.toLocaleString()} RWF</span>
                </div>
              )}
            </div>
          )}

          {/* Payment method */}
          <div>
            <label className="block text-sm font-semibold text-secondary-100 mb-2">Payment Method *</label>
            <div className="grid grid-cols-2 gap-3">
              {PAYMENT_METHODS.map((m) => (
                <button key={m.value} type="button" onClick={() => setMethod(m.value)}
                  className={`flex items-center gap-2 p-3 rounded-xl border-2 transition-all font-semibold text-sm ${
                    method === m.value ? m.color + " border-current shadow-sm" : "border-custom-300 text-custom-700 hover:border-primary-300 hover:bg-custom-100"
                  }`}>
                  {m.icon}{m.label}
                </button>
              ))}
            </div>
          </div>

          {/* Note */}
          <div>
            <label className="block text-sm font-semibold text-secondary-100 mb-1">
              Note <span className="font-normal text-custom-400">(optional)</span>
            </label>
            <textarea value={paymentNote} onChange={(e) => setPaymentNote(e.target.value)} rows={2}
              placeholder="e.g. MoMo ref 12345..."
              className="w-full px-3 py-2 rounded-xl border border-custom-300 bg-style-500 text-secondary-100 text-sm focus:outline-none focus:border-primary-400 transition-colors resize-none"
            />
          </div>

          <div className="flex gap-3 justify-end pt-2 border-t border-custom-300">
            <button type="button" onClick={onClose}
              className="px-4 py-2 rounded-xl border border-custom-300 text-sm font-semibold text-secondary-100 hover:bg-custom-100 transition-colors">
              Cancel
            </button>
            <button type="submit" disabled={isLoading || !canSubmit}
              className="px-4 py-2 rounded-xl bg-primary-500 text-white text-sm font-semibold hover:bg-primary-600 disabled:opacity-40 transition-colors">
              {isLoading ? "Saving…" : "Confirm Payment"}
            </button>
          </div>
        </form>
      </Card>
    </div>
  );
}


// ─── Complete Confirm Modal ───────────────────────────────────────────────────

function CompleteModal({ job, onClose, onSuccess }: { job: Job; onClose: () => void; onSuccess: () => void }) {
  const [completeJob, { isLoading }] = useCompleteJobMutation();

  const handleConfirm = async () => {
    try {
      await completeJob(job.id).unwrap();
      toast.success(`Job #${job.jobNumber} marked as completed`);
      onSuccess();
    } catch (err: any) {
      toast.error(err?.data?.message ?? "Failed to complete job");
    }
  };

  return (
    <div className="fixed inset-0 bg-secondary-100/50 z-50 flex items-center justify-center p-4">
      <Card className="!p-6 max-w-sm w-full">
        <div className="flex items-center justify-between mb-4">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-emerald-100 flex items-center justify-center">
              <HiOutlineCheckCircle className="w-5 h-5 text-emerald-600" />
            </div>
            <div>
              <h3 className="text-base font-bold text-secondary-100">Complete Job</h3>
              <p className="text-xs text-custom-700 font-mono">{job.jobNumber}</p>
            </div>
          </div>
          <button onClick={onClose} className="text-custom-700 hover:text-secondary-100">
            <HiOutlineX className="w-5 h-5" />
          </button>
        </div>

        <div className="rounded-xl bg-custom-50 border border-custom-200 p-4 space-y-2 text-sm mb-5">
          <div className="flex justify-between">
            <span className="text-custom-700">Title</span>
            <span className="font-semibold text-secondary-100 text-right max-w-[60%] truncate">{job.title}</span>
          </div>
          <div className="flex justify-between">
            <span className="text-custom-700">Customer</span>
            <span className="font-semibold text-secondary-100">{job.customer?.name ?? "—"}</span>
          </div>
          <div className="flex justify-between">
            <span className="text-custom-700">Amount</span>
            <span className="font-semibold text-secondary-100">
              {job.amount != null ? `${Math.round(Number(job.amount)).toLocaleString()} RWF` : "—"}
            </span>
          </div>
          <div className="flex justify-between">
            <span className="text-custom-700">Payment</span>
            <span className={`font-bold ${job.paymentStatus === "paid" ? "text-emerald-600" : "text-red-600"}`}>
              {job.paymentStatus === "paid" ? "Paid" : "Unpaid"}
            </span>
          </div>
        </div>

        <p className="text-sm text-custom-700 mb-5">
          Are you sure you want to mark this job as <span className="font-bold text-emerald-600">Completed</span>? This action cannot be undone.
        </p>

        <div className="flex gap-3">
          <button type="button" onClick={onClose}
            className="flex-1 px-4 py-2 rounded-xl border border-custom-300 text-sm font-semibold text-secondary-100 hover:bg-custom-100 transition-colors">
            Cancel
          </button>
          <button onClick={handleConfirm} disabled={isLoading}
            className="flex-1 px-4 py-2 rounded-xl bg-emerald-500 text-white text-sm font-semibold hover:bg-emerald-600 disabled:opacity-40 transition-colors">
            {isLoading ? "Completing…" : "Yes, Complete"}
          </button>
        </div>
      </Card>
    </div>
  );
}

// ─── Create Job Modal ─────────────────────────────────────────────────────────

function CreateJobModal({ onClose, onSuccess }: { onClose: () => void; onSuccess: () => void }) {
  const [form, setForm] = useState({
    ownerName: "", ownerPhone: "", ownerEmail: "",
    title: "", amount: "", priority: "normal" as JobPriority,
    dueDate: "", jobType: "", quantity: "", size: "",
    colorMode: "", bindingType: "", notes: "", description: "",
  });
  const [createJob, { isLoading }] = useCreateJobMutation();
  const set = (k: keyof typeof form) =>
    (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement>) =>
      setForm((p) => ({ ...p, [k]: e.target.value }));

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!form.title.trim())      { toast.error("Title is required"); return; }
    if (!form.ownerName.trim())  { toast.error("Owner name is required"); return; }
    if (!form.ownerPhone.trim()) { toast.error("Owner phone is required"); return; }
    try {
      await createJob({
        title: form.title.trim(), jobFor: "hobe",
        owner: {
          fullName: form.ownerName.trim(), phone: form.ownerPhone.trim(),
          ...(form.ownerEmail.trim() ? { email: form.ownerEmail.trim() } : {}),
        },
        amount:      form.amount      ? Number(form.amount)   : undefined,
        quantity:    form.quantity    ? Number(form.quantity) : undefined,
        priority:    form.priority,
        dueDate:     form.dueDate     || undefined,
        jobType:     form.jobType.trim()     || undefined,
        size:        form.size.trim()        || undefined,
        colorMode:   form.colorMode.trim()   || undefined,
        bindingType: form.bindingType.trim() || undefined,
        notes:       form.notes.trim()       || undefined,
        description: form.description.trim() || undefined,
      }).unwrap();
      toast.success("Job created successfully");
      onSuccess();
    } catch (err: any) {
      toast.error(err?.data?.message ?? "Failed to create job");
    }
  };

  return (
    <div className="fixed inset-0 bg-secondary-100/50 z-50 flex items-start justify-center p-4 overflow-y-auto">
      <Card className="!p-6 max-w-4xl w-full my-8">
        <div className="flex items-center justify-between mb-5">
          <div>
            <h3 className="text-xl font-bold text-secondary-100">Create Hobe Job</h3>
            <p className="text-sm text-custom-700 mt-0.5">Register owner and job details</p>
          </div>
          <button onClick={onClose} className="text-custom-700 hover:text-secondary-100"><HiOutlineX className="w-6 h-6" /></button>
        </div>
        <form onSubmit={handleSubmit} className="space-y-5">
          <div className="rounded-xl border border-custom-300 bg-custom-50 p-4 space-y-3">
            <p className="text-xs font-bold text-secondary-100 uppercase tracking-wide">Owner / Customer</p>
            <p className="text-xs text-custom-700">If the phone already exists, the existing HOBE customer is used.</p>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              <div className="sm:col-span-2">
                <label className="block text-xs font-semibold text-secondary-100 mb-1">Full Name *</label>
                <input value={form.ownerName} onChange={set("ownerName")} placeholder="e.g. Jean Claude" className={cls} />
              </div>
              <div>
                <label className="block text-xs font-semibold text-secondary-100 mb-1">Phone *</label>
                <input value={form.ownerPhone} onChange={set("ownerPhone")} placeholder="0788123456" className={cls} />
              </div>
              <div>
                <label className="block text-xs font-semibold text-secondary-100 mb-1">Email <span className="text-custom-400 font-normal">(optional)</span></label>
                <input type="email" value={form.ownerEmail} onChange={set("ownerEmail")} placeholder="jean@example.com" className={cls} />
              </div>
            </div>
          </div>
          <div className="space-y-3">
            <p className="text-xs font-bold text-secondary-100 uppercase tracking-wide">Job Details</p>
            <div>
              <label className="block text-xs font-semibold text-secondary-100 mb-1">Title *</label>
              <input value={form.title} onChange={set("title")} placeholder="e.g. Brochure printing 500 pcs" className={cls} />
            </div>
            <div className="grid grid-cols-2 gap-3">
              <div><label className="block text-xs font-semibold text-secondary-100 mb-1">Amount (RWF)</label><input type="number" min={0} value={form.amount} onChange={set("amount")} placeholder="0" className={cls} /></div>
              <div><label className="block text-xs font-semibold text-secondary-100 mb-1">Priority</label><select value={form.priority} onChange={set("priority")} className={cls}><option value="low">Low</option><option value="normal">Normal</option><option value="high">High</option><option value="urgent">Urgent</option></select></div>
              <div><label className="block text-xs font-semibold text-secondary-100 mb-1">Quantity</label><input type="number" min={1} value={form.quantity} onChange={set("quantity")} placeholder="500" className={cls} /></div>
              <div><label className="block text-xs font-semibold text-secondary-100 mb-1">Due Date</label><input type="date" value={form.dueDate} onChange={set("dueDate")} className={cls} /></div>
              <div><label className="block text-xs font-semibold text-secondary-100 mb-1">Size</label><input value={form.size} onChange={set("size")} placeholder="A4" className={cls} /></div>
              <div><label className="block text-xs font-semibold text-secondary-100 mb-1">Color Mode</label><input value={form.colorMode} onChange={set("colorMode")} placeholder="full-color" className={cls} /></div>
              <div><label className="block text-xs font-semibold text-secondary-100 mb-1">Job Type</label><input value={form.jobType} onChange={set("jobType")} placeholder="printing" className={cls} /></div>
              <div><label className="block text-xs font-semibold text-secondary-100 mb-1">Binding Type</label><input value={form.bindingType} onChange={set("bindingType")} placeholder="spiral" className={cls} /></div>
            </div>
            <div><label className="block text-xs font-semibold text-secondary-100 mb-1">Description</label><textarea value={form.description} onChange={set("description")} rows={2} className="w-full px-3 py-2 rounded-xl border border-custom-300 bg-style-500 text-secondary-100 text-sm focus:outline-none focus:border-primary-400 transition-colors resize-none" /></div>
            <div><label className="block text-xs font-semibold text-secondary-100 mb-1">Notes</label><textarea value={form.notes} onChange={set("notes")} rows={2} className="w-full px-3 py-2 rounded-xl border border-custom-300 bg-style-500 text-secondary-100 text-sm focus:outline-none focus:border-primary-400 transition-colors resize-none" /></div>
          </div>
          <div className="flex gap-3 justify-end pt-2 border-t border-custom-300">
            <button type="button" onClick={onClose} className="px-4 py-2 rounded-xl border border-custom-300 text-sm font-semibold text-secondary-100 hover:bg-custom-100 transition-colors">Cancel</button>
            <button type="submit" disabled={isLoading} className="px-4 py-2 rounded-xl bg-primary-500 text-white text-sm font-semibold hover:bg-primary-600 disabled:opacity-40 transition-colors">{isLoading ? "Creating…" : "Create Job"}</button>
          </div>
        </form>
      </Card>
    </div>
  );
}


// ─── Main Page ────────────────────────────────────────────────────────────────

export default function JobPage() {
  const [search, setSearch]         = useState("");
  const [statusFilter, setStatusFilter] = useState("");
  const [page, setPage]             = useState(1);
  const [showCreate, setShowCreate] = useState(false);
  const [viewJob, setViewJob]       = useState<Job | null>(null);
  const [editJob, setEditJob]       = useState<Job | null>(null);
  const [payJob, setPayJob]         = useState<Job | null>(null);
  const [completeJob, setCompleteJob] = useState<Job | null>(null);

  const currentUser = useSelector((state: RootState) => state.auth.user);
  const myUserId    = currentUser?.id ?? "";

  const { data, isLoading, isFetching, refetch } = useGetJobsQuery({
    limit: 500,
    jobFor: "hobe",
    ...(statusFilter ? { status: statusFilter as JobStatus } : {}),
  });

  const allJobs = (data?.jobs ?? []).filter((j) => j.jobFor === "hobe");

  const filtered = allJobs.filter((j) => {
    const q = search.trim().toLowerCase();
    if (!q) return true;
    return (
      j.jobNumber?.toLowerCase().includes(q) ||
      j.title?.toLowerCase().includes(q) ||
      j.customer?.name?.toLowerCase().includes(q)
    );
  });

  const totalPages = Math.max(1, Math.ceil(filtered.length / PAGE_SIZE));
  const paginated  = filtered.slice((page - 1) * PAGE_SIZE, page * PAGE_SIZE);

  const pending   = allJobs.filter((j) => j.status === "pending").length;
  const ready      = allJobs.filter((j) => j.status === "ready-for-delivery").length;
  const delivered  = allJobs.filter((j) => j.status === "delivered").length;
  const completed  = allJobs.filter((j) => j.status === "completed").length;

  return (
    <DashboardLayout>
      <div className="space-y-6 font-[family-name:var(--font-family-primary)]">

        {/* Header */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-primary-100 flex items-center justify-center">
              <HiOutlineBriefcase className="w-5 h-5 text-primary-600" />
            </div>
            <div>
              <h1 className="text-2xl md:text-3xl font-bold text-secondary-100">Jobs</h1>
              <p className="text-sm text-custom-700 mt-0.5">Manage your Hobe job requests</p>
            </div>
          </div>
          <div className="flex items-center gap-2">
            <button onClick={() => refetch()} className="p-2 rounded-xl border border-custom-300 hover:bg-custom-100 transition-colors text-custom-700">
              <HiOutlineRefresh className={`w-4 h-4 ${isFetching ? "animate-spin" : ""}`} />
            </button>
            <button onClick={() => setShowCreate(true)}
              className="flex items-center gap-2 px-4 py-2 rounded-xl bg-primary-500 text-white text-sm font-semibold hover:bg-primary-600 transition-colors">
              <HiOutlinePlus className="w-4 h-4" /> Create Job
            </button>
          </div>
        </div>

        {/* Summary cards */}
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
          {[
            { label: "Pending",   value: pending,    color: "text-yellow-600" },
            { label: "Ready",     value: ready,      color: "text-emerald-600" },
            { label: "Delivered", value: delivered,  color: "text-blue-600" },
            { label: "Completed", value: completed,  color: "text-gray-700" },
          ].map(({ label, value, color }) => (
            <Card key={label} className="!p-4 text-center">
              <p className="text-xs text-custom-700 mb-1">{label}</p>
              <p className={`text-2xl font-bold ${color}`}>{isLoading ? "—" : value}</p>
            </Card>
          ))}
        </div>

        {!isLoading && pending > 0 && (
          <div className="flex items-center gap-2 px-4 py-2.5 rounded-xl bg-yellow-50 border border-yellow-200 text-yellow-700 text-xs font-semibold">
            <HiOutlineExclamationCircle className="w-4 h-4 shrink-0" />
            {pending} job{pending > 1 ? "s" : ""} awaiting confirmation.
          </div>
        )}

        {/* Search + filter */}
        <div className="flex flex-wrap items-center gap-3">
          <div className="relative flex-1 min-w-48">
            <HiOutlineSearch className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-custom-700" />
            <input value={search} onChange={(e) => { setSearch(e.target.value); setPage(1); }}
              placeholder="Search by job #, title, or customer…"
              className="w-full pl-9 pr-4 py-2 rounded-xl border border-custom-300 bg-style-500 text-secondary-100 text-sm placeholder:text-custom-400 focus:outline-none focus:border-primary-400 transition-colors"
            />
          </div>
          <select value={statusFilter} onChange={(e) => { setStatusFilter(e.target.value); setPage(1); }}
            className="px-3 py-2 rounded-xl border border-custom-300 bg-style-500 text-secondary-100 text-sm focus:outline-none focus:border-primary-400 transition-colors">
            {STATUS_FILTER_OPTIONS.map((o) => <option key={o.value} value={o.value}>{o.label}</option>)}
          </select>
        </div>

        {/* Table */}
        <Card className="!p-0 overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead className="bg-custom-100 border-b border-custom-300">
                <tr>
                  {["Job #", "Title & Customer", "Amount", "Status", "Payment", "Due Date", "Actions"].map((h) => (
                    <th key={h} className="px-4 py-3 text-left text-xs font-bold text-secondary-100 uppercase tracking-wide">{h}</th>
                  ))}
                </tr>
              </thead>
              <tbody className="divide-y divide-custom-200">
                {isLoading ? (
                  <tr><td colSpan={7} className="px-4 py-10 text-center text-custom-700 text-sm">
                    <HiOutlineRefresh className="w-5 h-5 animate-spin mx-auto mb-2" />Loading…
                  </td></tr>
                ) : filtered.length === 0 ? (
                  <tr><td colSpan={7} className="px-4 py-12 text-center">
                    <HiOutlineBriefcase className="w-10 h-10 text-custom-400 mx-auto mb-3" />
                    <p className="text-sm text-secondary-100 font-semibold">{search || statusFilter ? "No jobs match the filters" : "No jobs yet"}</p>
                    <p className="text-xs text-custom-700 mt-1">{search || statusFilter ? "Try adjusting the search or status filter." : 'Click "Create Job" to submit your first request.'}</p>
                  </td></tr>
                ) : paginated.map((job) => (
                  <tr key={job.id} className="hover:bg-custom-50 transition-colors">
                    <td className="px-4 py-3">
                      <span className="text-sm font-bold text-primary-600 font-mono">{job.jobNumber}</span>
                    </td>
                    <td className="px-4 py-3">
                      <p className="text-sm font-semibold text-secondary-100">{job.title}</p>
                      <p className="text-xs text-custom-700">{job.customer?.name ?? "—"}</p>
                      {job.customer?.phone && <p className="text-xs text-custom-500">{job.customer.phone}</p>}
                    </td>
                    <td className="px-4 py-3">
                      <span className="text-sm font-bold text-secondary-100">
                        {job.amount != null ? `${Math.round(Number(job.amount)).toLocaleString()} RWF` : "—"}
                      </span>
                    </td>
                    <td className="px-4 py-3">
                      <span className={`text-xs font-semibold px-2 py-0.5 rounded-full ${STATUS_COLOR[job.status] ?? "bg-gray-100 text-gray-600"}`}>
                        {STATUS_LABEL[job.status] ?? job.status}
                      </span>
                    </td>
                    <td className="px-4 py-3">
                      <span className={`text-xs font-bold px-2 py-0.5 rounded-full ${job.paymentStatus === "paid" ? "bg-emerald-100 text-emerald-700" : "bg-red-100 text-red-600"}`}>
                        {job.paymentStatus === "paid" ? "Paid" : "Unpaid"}
                      </span>
                    </td>
                    <td className="px-4 py-3 text-xs text-custom-700">
                      {job.dueDate ? job.dueDate.split("T")[0] : "—"}
                    </td>
                    <td className="px-4 py-3">
                      <div className="flex items-center gap-1">
                        {/* View */}
                        <button onClick={() => setViewJob(job)} title="View details"
                          className="p-1.5 rounded-lg bg-blue-50 text-blue-600 hover:bg-blue-100 transition-colors">
                          <HiOutlineEye className="w-4 h-4" />
                        </button>
                        {/* Edit — only editable statuses */}
                        {["pending", "confirmed"].includes(job.status) && (
                          <button onClick={() => setEditJob(job)} title="Edit job"
                            className="p-1.5 rounded-lg bg-custom-100 text-secondary-100 hover:bg-custom-200 transition-colors">
                            <HiOutlinePencil className="w-4 h-4" />
                          </button>
                        )}
                        {/* Pay — only if not already paid */}
                        {job.paymentStatus !== "paid" && job.status !== "rejected" && (
                          <button onClick={() => setPayJob(job)} title="Record payment"
                            className="p-1.5 rounded-lg bg-emerald-50 text-emerald-600 hover:bg-emerald-100 transition-colors">
                            <HiOutlineBadgeCheck className="w-4 h-4" />
                          </button>
                        )}
                        {/* Complete — shown only when pending */}
                        {job.status === "pending" && (
                          <button onClick={() => setCompleteJob(job)} title="Mark as completed"
                            className="p-1.5 rounded-lg bg-green-50 text-green-600 hover:bg-green-100 transition-colors">
                            <HiOutlineCheckCircle className="w-4 h-4" />
                          </button>
                        )}
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>

          {/* Pagination */}
          {!isLoading && filtered.length > 0 && (
            <div className="flex items-center justify-between px-4 py-3 border-t border-custom-300">
              <p className="text-xs text-custom-700">
                Showing <span className="font-semibold text-secondary-100">{(page - 1) * PAGE_SIZE + 1}–{Math.min(page * PAGE_SIZE, filtered.length)}</span>
                {" "}of <span className="font-semibold text-secondary-100">{filtered.length}</span> jobs
                {filtered.length !== allJobs.length && <span className="text-custom-400"> (filtered from {allJobs.length})</span>}
              </p>
              <div className="flex items-center gap-1">
                <button onClick={() => setPage((p) => Math.max(1, p - 1))} disabled={page === 1}
                  className="px-3 py-1.5 rounded-lg border border-custom-300 text-xs font-semibold text-secondary-100 hover:bg-custom-100 disabled:opacity-40 transition-colors">Prev</button>
                {Array.from({ length: totalPages }, (_, i) => i + 1).map((n) => (
                  <button key={n} onClick={() => setPage(n)}
                    className={`w-8 h-8 rounded-lg text-xs font-bold transition-colors ${n === page ? "bg-primary-500 text-white" : "border border-custom-300 text-secondary-100 hover:bg-custom-100"}`}>
                    {n}
                  </button>
                ))}
                <button onClick={() => setPage((p) => Math.min(totalPages, p + 1))} disabled={page === totalPages}
                  className="px-3 py-1.5 rounded-lg border border-custom-300 text-xs font-semibold text-secondary-100 hover:bg-custom-100 disabled:opacity-40 transition-colors">Next</button>
              </div>
            </div>
          )}
        </Card>
      </div>

      {/* Modals */}
      {showCreate && (
        <CreateJobModal onClose={() => setShowCreate(false)} onSuccess={() => { setShowCreate(false); refetch(); }} />
      )}
      {viewJob && (
        <ViewModal job={viewJob} onClose={() => setViewJob(null)} />
      )}
      {editJob && (
        <EditModal job={editJob} onClose={() => setEditJob(null)} onSuccess={() => { setEditJob(null); refetch(); }} />
      )}
      {payJob && (
        <PayModal job={payJob} receivedById={myUserId} onClose={() => setPayJob(null)} onSuccess={() => { setPayJob(null); refetch(); }} />
      )}
      {completeJob && (
        <CompleteModal job={completeJob} onClose={() => setCompleteJob(null)} onSuccess={() => { setCompleteJob(null); refetch(); }} />
      )}
    </DashboardLayout>
  );
}
