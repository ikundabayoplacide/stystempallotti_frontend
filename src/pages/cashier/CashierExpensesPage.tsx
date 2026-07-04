import { useState, useRef, useEffect, useCallback } from "react";
import ReactDOM from "react-dom";
import {
  HiOutlinePlus, HiOutlineX, HiOutlineCash, HiOutlineShoppingCart,
  HiOutlineCog, HiOutlineLightBulb, HiOutlineOfficeBuilding,
  HiOutlineClipboardList, HiOutlineCheckCircle, HiOutlineClock,
  HiOutlineExclamationCircle, HiOutlineSearch, HiOutlineRefresh,
  HiOutlinePencil, HiOutlineThumbUp, HiOutlineDotsHorizontal,
  HiOutlineBan, HiOutlineCurrencyDollar,
} from "react-icons/hi";
import { toast } from "react-toastify";
import DashboardLayout from "../../components/DashboardLayout";
import { Card } from "../../components/ui";
import PhoneInput from "../../components/ui/PhoneInput";
import {
  useGetOutstandsQuery, useCreateOutstandMutation,
  useUpdateOutstandMutation, useApproveOutstandMutation,
  useRejectOutstandMutation, usePayOutstandMutation,
  type Outstand, type OutstandCategory, type OutstandStatus,
  type GetOutstandsParams,
} from "../../store/services/outstandsService";
import { useGetWithdrawalBalanceQuery } from "../../store/services/withdrawalsService";

const categoryConfig: Record<string, { label: string; icon: React.ReactNode; color: string }> = {
  purchase:    { label: "Purchase",    icon: <HiOutlineShoppingCart className="w-4 h-4" />, color: "bg-blue-100 text-blue-700" },
  utility:     { label: "Utility",     icon: <HiOutlineLightBulb className="w-4 h-4" />,   color: "bg-yellow-100 text-yellow-700" },
  maintenance: { label: "Maintenance", icon: <HiOutlineCog className="w-4 h-4" />,          color: "bg-orange-100 text-orange-700" },
  supplier:    { label: "Supplier",    icon: <HiOutlineOfficeBuilding className="w-4 h-4" />,color: "bg-purple-100 text-purple-700" },
  other:       { label: "Other",       icon: <HiOutlineClipboardList className="w-4 h-4" />,color: "bg-gray-100 text-gray-700" },
};

const statusConfig: Record<OutstandStatus, { label: string; color: string; icon: React.ReactNode }> = {
  pending:  { label: "Pending",  color: "bg-yellow-100 text-yellow-700",   icon: <HiOutlineClock className="w-3.5 h-3.5" /> },
  approved: { label: "Approved", color: "bg-blue-100 text-blue-700",       icon: <HiOutlineCheckCircle className="w-3.5 h-3.5" /> },
  paid:     { label: "Paid",     color: "bg-emerald-100 text-emerald-700", icon: <HiOutlineCash className="w-3.5 h-3.5" /> },
  rejected: { label: "Rejected", color: "bg-red-100 text-red-700",         icon: <HiOutlineExclamationCircle className="w-3.5 h-3.5" /> },
};

const TABS: { key: OutstandStatus | "all"; label: string }[] = [
  { key: "all",      label: "All" },
  { key: "pending",  label: "Pending" },
  { key: "approved", label: "Approved" },
  { key: "paid",     label: "Paid" },
  { key: "rejected", label: "Rejected" },
];

const DEFAULT_CATEGORIES: OutstandCategory[] = ["purchase", "utility", "maintenance", "supplier", "other"];
const PAGE_SIZE = 10;
const inputCls = "w-full px-3 py-2 rounded-xl border border-custom-300 bg-style-500 text-secondary-100 text-sm focus:outline-none focus:border-primary-400 transition-colors";

function AddRecordModal({ onClose }: { onClose: () => void }) {
  const [form, setForm] = useState({
    description: "", category: "purchase" as OutstandCategory,
    amount: "", recipient: "", recipientPhone: "",
    recipientRole: "", purpose: "", notes: "",
  });
  const [categories, setCategories] = useState<OutstandCategory[]>(DEFAULT_CATEGORIES);
  const [addingCategory, setAddingCategory] = useState(false);
  const [newCategory, setNewCategory] = useState("");
  const [phoneError, setPhoneError] = useState("");
  const [createOutstand, { isLoading }] = useCreateOutstandMutation();

  const set = (key: string) => (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement>) => {
    if (key === "category" && e.target.value === "__add_new__") { setAddingCategory(true); return; }
    setForm(prev => ({ ...prev, [key]: e.target.value }));
  };

  const confirmNewCategory = () => {
    const trimmed = newCategory.trim().toLowerCase().replace(/\s+/g, "-") as OutstandCategory;
    if (!trimmed) return;
    if (!categories.includes(trimmed)) setCategories(prev => [...prev, trimmed]);
    setForm(prev => ({ ...prev, category: trimmed }));
    setAddingCategory(false); setNewCategory("");
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!form.recipientPhone || form.recipientPhone.replace(/\D/g, "").length < 9) {
      setPhoneError("Enter a valid phone number."); return;
    }
    setPhoneError("");
    try {
      await createOutstand({
        description: form.description, category: form.category,
        amount: Number(form.amount),
        recipientName: form.recipient, recipientPhone: form.recipientPhone,
        recipientRole: form.recipientRole, purpose: form.purpose,
        notes: form.notes || undefined,
      }).unwrap();
      toast.success("Expense recorded successfully");
      onClose();
    } catch (err: any) { toast.error(err?.data?.message ?? "Failed to record expense"); }
  };

  return (
    <div className="fixed inset-0 bg-secondary-100/50 z-50 flex items-start justify-center p-4 overflow-y-auto">
      <Card className="!p-6 max-w-3xl w-full my-8">
        <div className="flex items-center justify-between mb-5">
          <div>
            <h3 className="text-xl font-bold text-secondary-100">Record Expense</h3>
            <p className="text-sm text-custom-700 mt-0.5">Record money going out of the company</p>
          </div>
          <button onClick={onClose} className="text-custom-700 hover:text-secondary-100"><HiOutlineX className="w-6 h-6" /></button>
        </div>
        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label className="block text-sm font-semibold text-secondary-100 mb-1">Description *</label>
            <textarea value={form.description} onChange={set("description")} rows={3} placeholder="What is this payment for?" className="w-full px-3 py-2 rounded-xl border border-custom-300 bg-style-500 text-secondary-100 text-sm focus:outline-none focus:border-primary-400 transition-colors resize-none" required />
          </div>
          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="block text-sm font-semibold text-secondary-100 mb-1">Category *</label>
              {addingCategory ? (
                <div className="flex gap-1">
                  <input autoFocus value={newCategory} onChange={e => setNewCategory(e.target.value)}
                    onKeyDown={e => { if (e.key === "Enter") { e.preventDefault(); confirmNewCategory(); } if (e.key === "Escape") { setAddingCategory(false); setNewCategory(""); } }}
                    placeholder="New category name" className={inputCls} />
                  <button type="button" onClick={confirmNewCategory} className="px-3 py-2 rounded-xl bg-primary-500 text-white text-xs font-semibold hover:bg-primary-600 transition-colors whitespace-nowrap">Add</button>
                  <button type="button" onClick={() => { setAddingCategory(false); setNewCategory(""); }} className="px-2 py-2 rounded-xl border border-custom-300 text-custom-700 hover:bg-custom-100 transition-colors"><HiOutlineX className="w-4 h-4" /></button>
                </div>
              ) : (
                <select value={form.category} onChange={set("category")} className={inputCls}>
                  {categories.map(c => <option key={c} value={c}>{categoryConfig[c]?.label ?? c}</option>)}
                  <option value="__add_new__">+ Add new category</option>
                </select>
              )}
            </div>
            <div>
              <label className="block text-sm font-semibold text-secondary-100 mb-1">Recipient Name *</label>
              <input value={form.recipient} onChange={set("recipient")} placeholder="Full name" className={inputCls} required />
            </div>
          </div>
          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="block text-sm font-semibold text-secondary-100 mb-1">Recipient Phone *</label>
              <PhoneInput value={form.recipientPhone} onChange={val => { setForm(prev => ({ ...prev, recipientPhone: val })); setPhoneError(""); }} error={phoneError} />
            </div>
            <div>
              <label className="block text-sm font-semibold text-secondary-100 mb-1">Recipient Role *</label>
              <input value={form.recipientRole} onChange={set("recipientRole")} placeholder="e.g. Supplier, Staff" className={inputCls} required />
            </div>
          </div>
          <div>
            <label className="block text-sm font-semibold text-secondary-100 mb-1">Amount (RWF) *</label>
            <input type="number" min="0" value={form.amount} onChange={set("amount")} placeholder="0" className={inputCls} required />
          </div>
          <div>
            <label className="block text-sm font-semibold text-secondary-100 mb-1">Purpose *</label>
            <textarea value={form.purpose} onChange={set("purpose")} rows={2} placeholder="Why is this payment being made?" className="w-full px-3 py-2 rounded-xl border border-custom-300 bg-style-500 text-secondary-100 text-sm focus:outline-none focus:border-primary-400 transition-colors resize-none" required />
          </div>
          <div>
            <label className="block text-sm font-semibold text-secondary-100 mb-1">Notes <span className="font-normal text-custom-700">(optional)</span></label>
            <textarea value={form.notes} onChange={set("notes")} rows={2} placeholder="Additional notes..." className="w-full px-3 py-2 rounded-xl border border-custom-300 bg-style-500 text-secondary-100 text-sm focus:outline-none focus:border-primary-400 transition-colors resize-none" />
          </div>
          <div className="flex gap-3 justify-end pt-2 border-t border-custom-300">
            <button type="button" onClick={onClose} className="px-4 py-2 rounded-xl border border-custom-300 text-sm font-semibold text-secondary-100 hover:bg-custom-100 transition-colors">Cancel</button>
            <button type="submit" disabled={isLoading} className="px-4 py-2 rounded-xl bg-primary-500 text-white text-sm font-semibold hover:bg-primary-600 transition-colors disabled:opacity-40">
              {isLoading ? "Recording..." : "Record Expense"}
            </button>
          </div>
        </form>
      </Card>
    </div>
  );
}

function RejectModal({ record, onClose }: { record: Outstand; onClose: () => void }) {
  const [note, setNote] = useState("");
  const [rejectOutstand, { isLoading }] = useRejectOutstandMutation();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!note.trim()) { toast.error("Please provide a rejection reason"); return; }
    try {
      await rejectOutstand({ id: record.id, rejectionNote: note }).unwrap();
      toast.success("Expense rejected");
      onClose();
    } catch (err: any) { toast.error(err?.data?.message ?? "Failed to reject"); }
  };

  return (
    <div className="fixed inset-0 bg-secondary-100/50 z-50 flex items-center justify-center p-4">
      <Card className="!p-6 max-w-md w-full">
        <div className="flex items-center justify-between mb-4">
          <h3 className="text-lg font-bold text-secondary-100">Reject Expense</h3>
          <button onClick={onClose} className="text-custom-700 hover:text-secondary-100"><HiOutlineX className="w-5 h-5" /></button>
        </div>
        <p className="text-sm text-custom-700 mb-4">You are rejecting <span className="font-bold text-secondary-100">{record.ref}</span>. Please provide a reason.</p>
        <form onSubmit={handleSubmit} className="space-y-4">
          <textarea value={note} onChange={e => setNote(e.target.value)} rows={3}
            placeholder="Reason for rejection..."
            className="w-full px-3 py-2 rounded-xl border border-custom-300 bg-style-500 text-secondary-100 text-sm focus:outline-none focus:border-red-400 transition-colors resize-none" required />
          <div className="flex gap-3 justify-end">
            <button type="button" onClick={onClose} className="px-4 py-2 rounded-xl border border-custom-300 text-sm font-semibold text-secondary-100 hover:bg-custom-100 transition-colors">Cancel</button>
            <button type="submit" disabled={isLoading} className="px-4 py-2 rounded-xl bg-red-500 text-white text-sm font-semibold hover:bg-red-600 transition-colors disabled:opacity-40">
              {isLoading ? "Rejecting..." : "Reject"}
            </button>
          </div>
        </form>
      </Card>
    </div>
  );
}

function DetailModal({ record, onClose, onEdit }: { record: Outstand; onClose: () => void; onEdit: () => void }) {
  const cat = categoryConfig[record.category] ?? categoryConfig.other;
  const st  = statusConfig[record.status];
  const [approvingConfirm, setApprovingConfirm] = useState(false);
  const [payingConfirm, setPayingConfirm] = useState(false);
  const [showReject, setShowReject] = useState(false);
  const [approveOutstand, { isLoading: approving }] = useApproveOutstandMutation();
  const [payOutstand,     { isLoading: paying }]    = usePayOutstandMutation();

  if (showReject) return <RejectModal record={record} onClose={() => { setShowReject(false); onClose(); }} />;

  return (
    <div className="fixed inset-0 bg-secondary-100/50 z-50 flex items-center justify-center p-4">
      <Card className="!p-6 max-w-3xl w-full max-h-[90vh] overflow-y-auto">
        <div className="flex items-center justify-between mb-5">
          <div>
            <h3 className="text-lg font-bold text-secondary-100">{record.ref}</h3>
            <p className="text-sm text-custom-700 mt-0.5">{record.description}</p>
          </div>
          <button onClick={onClose} className="text-custom-700 hover:text-secondary-100"><HiOutlineX className="w-5 h-5" /></button>
        </div>

        <div className="flex gap-2 mb-4">
          <span className={`inline-flex items-center gap-1 text-xs font-semibold px-2.5 py-1 rounded-full ${cat.color}`}>{cat.icon}{cat.label}</span>
          <span className={`inline-flex items-center gap-1 text-xs font-bold px-2.5 py-1 rounded-full ${st.color}`}>{st.icon}{st.label}</span>
        </div>

        <div className="rounded-xl bg-custom-50 border border-custom-200 divide-y divide-custom-200 mb-4">
          {([
            ["Recipient",   record.recipientName],
            ["Phone",       record.recipientPhone],
            ["Role",        record.recipientRole],
            ["Amount",      `${Number(record.totalAmount).toLocaleString()} RWF`],
            ["Recorded by", record.recordedBy?.name ?? "—"],
            ["Date",        new Date(record.createdAt).toLocaleString("en-RW", { dateStyle: "medium", timeStyle: "short" })],
            ...(record.approvedBy ? [["Approved by", record.approvedBy.name]] : []),
            ...(record.paidAt     ? [["Paid at",     new Date(record.paidAt).toLocaleDateString()]] : []),
          ] as [string, string][]).map(([label, value]) => (
            <div key={label} className="flex justify-between px-4 py-2.5 text-sm">
              <span className="text-custom-700">{label}</span>
              <span className="font-semibold text-secondary-100 text-right max-w-[60%]">{value}</span>
            </div>
          ))}
        </div>

        <div className="mb-4">
          <p className="text-xs font-semibold text-custom-700 mb-1 uppercase tracking-wide">Purpose</p>
          <p className="text-sm text-secondary-100">{record.purpose}</p>
        </div>

        {record.notes && <div className="px-4 py-3 rounded-xl bg-yellow-50 border border-yellow-200 text-yellow-700 text-sm mb-4">{record.notes}</div>}
        {record.rejectionNote && <div className="px-4 py-3 rounded-xl bg-red-50 border border-red-200 text-red-700 text-sm mb-4">Rejected: {record.rejectionNote}</div>}

        <div className="flex flex-wrap gap-2 mt-4 pt-4 border-t border-custom-200">
          {record.status === "pending" && (
            <button onClick={onEdit} className="flex items-center gap-2 px-4 py-2 rounded-xl border border-custom-300 text-sm font-semibold text-secondary-100 hover:bg-custom-100 transition-colors">
              <HiOutlinePencil className="w-4 h-4" /> Edit
            </button>
          )}

          {record.status === "pending" && (
            approvingConfirm ? (
              <div className="flex items-center gap-2 px-4 py-2 rounded-xl bg-emerald-50 border border-emerald-300">
                <span className="text-sm text-emerald-700 font-semibold">Approve this?</span>
                <button onClick={async () => { try { await approveOutstand(record.id).unwrap(); toast.success("Approved"); onClose(); } catch { toast.error("Failed"); } setApprovingConfirm(false); }}
                  disabled={approving} className="px-3 py-1 rounded-lg bg-emerald-500 text-white text-xs font-bold hover:bg-emerald-600 transition-colors disabled:opacity-40">Yes</button>
                <button onClick={() => setApprovingConfirm(false)} className="px-3 py-1 rounded-lg border border-custom-300 text-xs font-semibold text-custom-700 hover:bg-custom-100 transition-colors">No</button>
              </div>
            ) : (
              <button onClick={() => setApprovingConfirm(true)} className="flex items-center gap-2 px-4 py-2 rounded-xl bg-emerald-500 text-white text-sm font-semibold hover:bg-emerald-600 transition-colors">
                <HiOutlineThumbUp className="w-4 h-4" /> Approve
              </button>
            )
          )}

          {record.status === "pending" && (
            <button onClick={() => setShowReject(true)} className="flex items-center gap-2 px-4 py-2 rounded-xl bg-red-500 text-white text-sm font-semibold hover:bg-red-600 transition-colors">
              <HiOutlineBan className="w-4 h-4" /> Reject
            </button>
          )}

          {record.status === "approved" && (
            payingConfirm ? (
              <div className="flex items-center gap-2 px-4 py-2 rounded-xl bg-blue-50 border border-blue-300">
                <span className="text-sm text-blue-700 font-semibold">Mark as Paid?</span>
                <button onClick={async () => { try { await payOutstand(record.id).unwrap(); toast.success("Marked as paid"); onClose(); } catch { toast.error("Failed"); } setPayingConfirm(false); }}
                  disabled={paying} className="px-3 py-1 rounded-lg bg-blue-500 text-white text-xs font-bold hover:bg-blue-600 transition-colors disabled:opacity-40">Yes, Pay</button>
                <button onClick={() => setPayingConfirm(false)} className="px-3 py-1 rounded-lg border border-custom-300 text-xs font-semibold text-custom-700 hover:bg-custom-100 transition-colors">Cancel</button>
              </div>
            ) : (
              <button onClick={() => setPayingConfirm(true)} className="flex items-center gap-2 px-4 py-2 rounded-xl bg-blue-500 text-white text-sm font-semibold hover:bg-blue-600 transition-colors">
                <HiOutlineCash className="w-4 h-4" /> Mark as Paid
              </button>
            )
          )}

          <button onClick={onClose} className="ml-auto px-4 py-2 rounded-xl border border-custom-300 text-sm font-semibold text-secondary-100 hover:bg-custom-100 transition-colors">Close</button>
        </div>
      </Card>
    </div>
  );
}

function EditModal({ record, onClose }: { record: Outstand; onClose: () => void }) {
  const [form, setForm] = useState({
    description: record.description, category: record.category,
    amount: String(record.totalAmount),
    recipient: record.recipientName ?? "", recipientPhone: record.recipientPhone ?? "",
    recipientRole: record.recipientRole ?? "", purpose: record.purpose, notes: record.notes ?? "",
  });
  const [categories, setCategories] = useState<OutstandCategory[]>(DEFAULT_CATEGORIES);
  const [addingCategory, setAddingCategory] = useState(false);
  const [newCategory, setNewCategory] = useState("");
  const [phoneError, setPhoneError] = useState("");
  const [updateOutstand, { isLoading }] = useUpdateOutstandMutation();

  const set = (key: string) => (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement>) => {
    if (key === "category" && e.target.value === "__add_new__") { setAddingCategory(true); return; }
    setForm(prev => ({ ...prev, [key]: e.target.value }));
  };

  const confirmNewCategory = () => {
    const trimmed = newCategory.trim().toLowerCase().replace(/\s+/g, "-") as OutstandCategory;
    if (!trimmed) return;
    if (!categories.includes(trimmed)) setCategories(prev => [...prev, trimmed]);
    setForm(prev => ({ ...prev, category: trimmed }));
    setAddingCategory(false); setNewCategory("");
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!form.recipientPhone || form.recipientPhone.replace(/\D/g, "").length < 9) {
      setPhoneError("Enter a valid phone number."); return;
    }
    setPhoneError("");
    try {
      await updateOutstand({
        id: record.id,
        data: {
          description: form.description, category: form.category,
          amount: Number(form.amount),
          recipientName: form.recipient, recipientPhone: form.recipientPhone,
          recipientRole: form.recipientRole, purpose: form.purpose,
          notes: form.notes || undefined,
        },
      }).unwrap();
      toast.success("Expense updated");
      onClose();
    } catch (err: any) { toast.error(err?.data?.message ?? "Failed to update"); }
  };

  return (
    <div className="fixed inset-0 bg-secondary-100/50 z-50 flex items-start justify-center p-4 overflow-y-auto">
      <Card className="!p-6 max-w-3xl w-full my-8">
        <div className="flex items-center justify-between mb-5">
          <div>
            <h3 className="text-xl font-bold text-secondary-100">Edit Expense <span className="text-primary-500">{record.ref}</span></h3>
            <p className="text-sm text-custom-700 mt-0.5">Update expense details</p>
          </div>
          <button onClick={onClose} className="text-custom-700 hover:text-secondary-100"><HiOutlineX className="w-6 h-6" /></button>
        </div>
        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label className="block text-sm font-semibold text-secondary-100 mb-1">Description *</label>
            <textarea value={form.description} onChange={set("description")} rows={3} className="w-full px-3 py-2 rounded-xl border border-custom-300 bg-style-500 text-secondary-100 text-sm focus:outline-none focus:border-primary-400 transition-colors resize-none" required />
          </div>
          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="block text-sm font-semibold text-secondary-100 mb-1">Category *</label>
              {addingCategory ? (
                <div className="flex gap-1">
                  <input autoFocus value={newCategory} onChange={e => setNewCategory(e.target.value)}
                    onKeyDown={e => { if (e.key === "Enter") { e.preventDefault(); confirmNewCategory(); } if (e.key === "Escape") { setAddingCategory(false); setNewCategory(""); } }}
                    className={inputCls} placeholder="New category" />
                  <button type="button" onClick={confirmNewCategory} className="px-3 py-2 rounded-xl bg-primary-500 text-white text-xs font-semibold whitespace-nowrap">Add</button>
                  <button type="button" onClick={() => { setAddingCategory(false); setNewCategory(""); }} className="px-2 py-2 rounded-xl border border-custom-300 text-custom-700"><HiOutlineX className="w-4 h-4" /></button>
                </div>
              ) : (
                <select value={form.category} onChange={set("category")} className={inputCls}>
                  {categories.map(c => <option key={c} value={c}>{categoryConfig[c]?.label ?? c}</option>)}
                  <option value="__add_new__">+ Add new category</option>
                </select>
              )}
            </div>
            <div>
              <label className="block text-sm font-semibold text-secondary-100 mb-1">Recipient Name *</label>
              <input value={form.recipient} onChange={set("recipient")} className={inputCls} required />
            </div>
          </div>
          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="block text-sm font-semibold text-secondary-100 mb-1">Recipient Phone *</label>
              <PhoneInput value={form.recipientPhone} onChange={val => { setForm(prev => ({ ...prev, recipientPhone: val })); setPhoneError(""); }} error={phoneError} />
            </div>
            <div>
              <label className="block text-sm font-semibold text-secondary-100 mb-1">Recipient Role *</label>
              <input value={form.recipientRole} onChange={set("recipientRole")} className={inputCls} required />
            </div>
          </div>
          <div>
            <label className="block text-sm font-semibold text-secondary-100 mb-1">Amount (RWF) *</label>
            <input type="number" min="0" value={form.amount} onChange={set("amount")} className={inputCls} required />
          </div>
          <div>
            <label className="block text-sm font-semibold text-secondary-100 mb-1">Purpose *</label>
            <textarea value={form.purpose} onChange={set("purpose")} rows={2} className="w-full px-3 py-2 rounded-xl border border-custom-300 bg-style-500 text-secondary-100 text-sm focus:outline-none focus:border-primary-400 transition-colors resize-none" required />
          </div>
          <div>
            <label className="block text-sm font-semibold text-secondary-100 mb-1">Notes <span className="font-normal text-custom-700">(optional)</span></label>
            <textarea value={form.notes} onChange={set("notes")} rows={2} className="w-full px-3 py-2 rounded-xl border border-custom-300 bg-style-500 text-secondary-100 text-sm focus:outline-none focus:border-primary-400 transition-colors resize-none" />
          </div>
          <div className="flex gap-3 justify-end pt-2 border-t border-custom-300">
            <button type="button" onClick={onClose} className="px-4 py-2 rounded-xl border border-custom-300 text-sm font-semibold text-secondary-100 hover:bg-custom-100 transition-colors">Cancel</button>
            <button type="submit" disabled={isLoading} className="px-4 py-2 rounded-xl bg-primary-500 text-white text-sm font-semibold hover:bg-primary-600 transition-colors disabled:opacity-40">
              {isLoading ? "Saving..." : "Save Changes"}
            </button>
          </div>
        </form>
      </Card>
    </div>
  );
}

export default function CashierExpensesPage() {
  const [activeTab, setActiveTab]   = useState<OutstandStatus | "all">("all");
  const [search, setSearch]         = useState("");
  const [page, setPage]             = useState(1);
  const [showAdd, setShowAdd]       = useState(false);
  const [selected, setSelected]     = useState<Outstand | null>(null);
  const [editing, setEditing]       = useState<Outstand | null>(null);
  const [openMenuId, setOpenMenuId] = useState<string | null>(null);
  const [menuPos, setMenuPos]       = useState<{ top: number; right: number } | null>(null);
  const [confirmAction, setConfirmAction] = useState<{ id: string; type: "approve" | "pay" } | null>(null);
  const [rejectTarget, setRejectTarget]   = useState<Outstand | null>(null);
  const menuRef = useRef<HTMLDivElement>(null);
  const triggerRef = useRef<HTMLButtonElement | null>(null);

  useEffect(() => {
    if (!openMenuId) return;
    const handler = (e: MouseEvent) => {
      if (triggerRef.current?.contains(e.target as Node)) return;
      if (menuRef.current && !menuRef.current.contains(e.target as Node)) { setOpenMenuId(null); setConfirmAction(null); }
    };
    document.addEventListener("mousedown", handler);
    return () => document.removeEventListener("mousedown", handler);
  }, [openMenuId]);

  const openMenu = useCallback((e: React.MouseEvent<HTMLButtonElement>, id: string) => {
    e.stopPropagation();
    triggerRef.current = e.currentTarget;
    if (openMenuId === id) { setOpenMenuId(null); setConfirmAction(null); return; }
    const rect = e.currentTarget.getBoundingClientRect();
    setMenuPos({ top: rect.bottom + 4, right: window.innerWidth - rect.right });
    setOpenMenuId(id);
  }, [openMenuId]);

  const [approveOutstand] = useApproveOutstandMutation();
  const [payOutstand]     = usePayOutstandMutation();

  const queryParams: GetOutstandsParams = {
    page, limit: PAGE_SIZE,
    ...(activeTab !== "all" && { status: activeTab }),
  };

  const { data, isLoading, isFetching, refetch } = useGetOutstandsQuery(queryParams);
  const { data: balanceData } = useGetWithdrawalBalanceQuery();
  const fundBalance = balanceData?.totalBalance ?? 0;
  const outstands  = data?.outstands ?? [];
  const totalPages = data?.totalPages ?? 1;

  const filtered = outstands.filter(r => {
    const q = search.toLowerCase();
    return !q || r.ref.toLowerCase().includes(q) || r.description.toLowerCase().includes(q) || (r.recipientName ?? "").toLowerCase().includes(q);
  });

  const totalAmt    = outstands.reduce((s, r) => s + Number(r.totalAmount), 0);
  const pendingAmt  = outstands.filter(r => r.status === "pending").reduce((s, r) => s + Number(r.totalAmount), 0);
  const approvedAmt = outstands.filter(r => r.status === "approved").reduce((s, r) => s + Number(r.totalAmount), 0);
  const paidAmt     = outstands.filter(r => r.status === "paid").reduce((s, r) => s + Number(r.totalAmount), 0);

  return (
    <DashboardLayout>
      <div className="space-y-6 font-[family-name:var(--font-family-primary)]">

        {/* Header */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
          <div>
            <div className="flex items-center gap-2 mb-1">
              <HiOutlineCash className="w-6 h-6 text-primary-500" />
              <h1 className="text-2xl md:text-3xl font-bold text-secondary-100">Expenses</h1>
            </div>
            <p className="text-sm text-custom-700">Record, approve and pay all company expenses</p>
          </div>
          <div className="flex items-center gap-2 self-start sm:self-auto">
            <button onClick={() => refetch()} className="p-2 rounded-xl border border-custom-300 hover:bg-custom-100 transition-colors">
              <HiOutlineRefresh className={`w-4 h-4 text-custom-700 ${isFetching ? "animate-spin" : ""}`} />
            </button>
            <button onClick={() => setShowAdd(true)} className="flex items-center gap-2 px-4 py-2 rounded-xl bg-primary-500 text-white text-sm font-semibold hover:bg-primary-600 transition-colors">
              <HiOutlinePlus className="w-4 h-4" /> New Expense
            </button>
          </div>
        </div>

        {/* KPI row */}
        <div className="grid grid-cols-2 sm:grid-cols-5 gap-3">
          {[
            { label: "Total",    value: totalAmt,    color: "text-secondary-100" },
            { label: "Pending",  value: pendingAmt,  color: "text-yellow-600" },
            { label: "Approved", value: approvedAmt, color: "text-blue-600" },
            { label: "Paid Out", value: paidAmt,     color: "text-emerald-600" },
          ].map(kpi => (
            <Card key={kpi.label} className="!p-4">
              <p className="text-xs text-custom-700">{kpi.label}</p>
              <p className={`text-xl font-bold ${kpi.color}`}>{kpi.value.toLocaleString()}</p>
              <p className="text-xs text-custom-700">RWF</p>
            </Card>
          ))}
          <Card className={`!p-4 col-span-2 sm:col-span-1 ${fundBalance >= 0 ? "bg-emerald-50 border-emerald-200" : "bg-orange-50 border-orange-200"}`}>
            <div className="flex items-center gap-1 mb-1">
              <HiOutlineCurrencyDollar className={`w-3.5 h-3.5 ${fundBalance >= 0 ? "text-emerald-600" : "text-orange-600"}`} />
              <p className="text-xs text-custom-700">Fund Balance</p>
            </div>
            <p className={`text-xl font-bold ${fundBalance >= 0 ? "text-emerald-700" : "text-orange-700"}`}>{fundBalance.toLocaleString()}</p>
            <p className="text-xs text-custom-700">RWF</p>
          </Card>
        </div>

        {/* Tabs */}
        <div className="flex gap-1 p-1 bg-custom-100 rounded-xl w-fit">
          {TABS.map(t => (
            <button key={t.key} onClick={() => { setActiveTab(t.key); setPage(1); setSearch(""); }}
              className={`px-4 py-1.5 rounded-lg text-sm font-semibold transition-colors ${activeTab === t.key ? "bg-primary-500 text-white shadow-sm" : "text-custom-700 hover:text-secondary-100"}`}>
              {t.label}
            </button>
          ))}
        </div>

        {/* Search */}
        <div className="relative max-w-sm">
          <HiOutlineSearch className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-custom-400" />
          <input value={search} onChange={e => setSearch(e.target.value)} placeholder="Search ref, description, recipient…"
            className="w-full pl-9 pr-3 py-2 rounded-xl border border-custom-300 bg-style-500 text-secondary-100 text-sm focus:outline-none focus:border-primary-400 transition-colors" />
        </div>

        {/* Table */}
        <Card className="!p-0 overflow-hidden">
          {isLoading ? (
            <div className="space-y-3 p-4">{[1,2,3,4].map(i => <div key={i} className="h-14 bg-custom-100 rounded-xl animate-pulse" />)}</div>
          ) : filtered.length === 0 ? (
            <div className="py-16 text-center">
              <HiOutlineClipboardList className="w-10 h-10 text-custom-300 mx-auto mb-2" />
              <p className="text-sm text-custom-700">No expenses found</p>
            </div>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full text-sm">
                <thead className="bg-custom-50 border-b border-custom-200">
                  <tr>
                    {["Ref", "Description", "Category", "Recipient", "Amount (RWF)", "Status", "Date", ""].map(h => (
                      <th key={h} className="px-4 py-3 text-left text-xs font-bold text-custom-500 uppercase tracking-wider whitespace-nowrap">{h}</th>
                    ))}
                  </tr>
                </thead>
                <tbody className="divide-y divide-custom-100">
                  {filtered.map(r => {
                    const cat = categoryConfig[r.category] ?? categoryConfig.other;
                    const st  = statusConfig[r.status];
                    return (
                      <tr key={r.id} onClick={() => setSelected(r)} className="hover:bg-custom-50 cursor-pointer transition-colors">
                        <td className="px-4 py-3 font-bold text-primary-500 whitespace-nowrap">{r.ref}</td>
                        <td className="px-4 py-3 text-secondary-100 max-w-[180px] truncate">{r.description}</td>
                        <td className="px-4 py-3">
                          <span className={`inline-flex items-center gap-1 text-xs font-semibold px-2 py-0.5 rounded-full ${cat.color}`}>{cat.icon}{cat.label}</span>
                        </td>
                        <td className="px-4 py-3 text-secondary-100 whitespace-nowrap">{r.recipientName}</td>
                        <td className="px-4 py-3 font-bold text-secondary-100 whitespace-nowrap">{Number(r.totalAmount).toLocaleString()}</td>
                        <td className="px-4 py-3">
                          <span className={`inline-flex items-center gap-1 text-xs font-bold px-2.5 py-1 rounded-full ${st.color}`}>{st.icon}{st.label}</span>
                        </td>
                        <td className="px-4 py-3 text-custom-700 whitespace-nowrap">{new Date(r.createdAt).toLocaleDateString()}</td>
                        <td className="px-4 py-3" onClick={e => e.stopPropagation()}>
                          <button onClick={e => openMenu(e, r.id)} className="p-1.5 rounded-lg hover:bg-custom-100 transition-colors text-custom-700">
                            <HiOutlineDotsHorizontal className="w-4 h-4" />
                          </button>
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>
          )}
        </Card>

        {/* Pagination */}
        {totalPages > 1 && (
          <div className="flex items-center justify-center gap-2">
            <button onClick={() => setPage(p => Math.max(1, p - 1))} disabled={page === 1}
              className="px-3 py-1.5 rounded-lg border border-custom-300 text-sm font-semibold text-secondary-100 hover:bg-custom-100 disabled:opacity-40 transition-colors">← Prev</button>
            <span className="text-sm text-custom-700">Page {page} of {totalPages}</span>
            <button onClick={() => setPage(p => Math.min(totalPages, p + 1))} disabled={page === totalPages}
              className="px-3 py-1.5 rounded-lg border border-custom-300 text-sm font-semibold text-secondary-100 hover:bg-custom-100 disabled:opacity-40 transition-colors">Next →</button>
          </div>
        )}

        {/* Context menu portal */}
        {openMenuId && menuPos && ReactDOM.createPortal(
          <div ref={menuRef} style={{ position: "fixed", top: menuPos.top, right: menuPos.right, zIndex: 9999 }}
            className="w-44 bg-style-600 border border-custom-300 rounded-2xl shadow-xl p-1.5 space-y-0.5">
            {(() => {
              const r = outstands.find(x => x.id === openMenuId);
              if (!r) return null;
              return (
                <>
                  <button onClick={() => { setSelected(r); setOpenMenuId(null); }} className="w-full flex items-center gap-2 px-3 py-2 rounded-xl text-sm text-secondary-100 hover:bg-custom-100 transition-colors">View Details</button>
                  {r.status === "pending" && <button onClick={() => { setEditing(r); setOpenMenuId(null); }} className="w-full flex items-center gap-2 px-3 py-2 rounded-xl text-sm text-secondary-100 hover:bg-custom-100 transition-colors"><HiOutlinePencil className="w-4 h-4" /> Edit</button>}
                  {r.status === "pending" && (
                    confirmAction?.id === r.id && confirmAction.type === "approve" ? (
                      <div className="px-3 py-2 space-y-1.5">
                        <p className="text-xs font-semibold text-emerald-700">Approve this expense?</p>
                        <div className="flex gap-1.5">
                          <button onClick={async () => { try { await approveOutstand(r.id).unwrap(); toast.success("Approved"); } catch { toast.error("Failed"); } setConfirmAction(null); setOpenMenuId(null); }} className="flex-1 px-2 py-1 rounded-lg bg-emerald-500 text-white text-xs font-bold hover:bg-emerald-600 transition-colors">Yes</button>
                          <button onClick={() => setConfirmAction(null)} className="flex-1 px-2 py-1 rounded-lg border border-custom-300 text-xs font-semibold text-custom-700 hover:bg-custom-100 transition-colors">No</button>
                        </div>
                      </div>
                    ) : (
                      <button onClick={() => setConfirmAction({ id: r.id, type: "approve" })} className="w-full flex items-center gap-2 px-3 py-2 rounded-xl text-sm text-emerald-600 hover:bg-emerald-50 transition-colors"><HiOutlineThumbUp className="w-4 h-4" /> Approve</button>
                    )
                  )}
                  {r.status === "pending" && (
                    <button onClick={() => { setRejectTarget(r); setOpenMenuId(null); }} className="w-full flex items-center gap-2 px-3 py-2 rounded-xl text-sm text-red-500 hover:bg-red-50 transition-colors"><HiOutlineBan className="w-4 h-4" /> Reject</button>
                  )}
                  {r.status === "approved" && (
                    confirmAction?.id === r.id && confirmAction.type === "pay" ? (
                      <div className="px-3 py-2 space-y-1.5">
                        <p className="text-xs font-semibold text-blue-700">Mark as paid?</p>
                        <div className="flex gap-1.5">
                          <button onClick={async () => { try { await payOutstand(r.id).unwrap(); toast.success("Marked paid"); } catch { toast.error("Failed"); } setConfirmAction(null); setOpenMenuId(null); }} className="flex-1 px-2 py-1 rounded-lg bg-blue-500 text-white text-xs font-bold hover:bg-blue-600 transition-colors">Yes</button>
                          <button onClick={() => setConfirmAction(null)} className="flex-1 px-2 py-1 rounded-lg border border-custom-300 text-xs font-semibold text-custom-700 hover:bg-custom-100 transition-colors">No</button>
                        </div>
                      </div>
                    ) : (
                      <button onClick={() => setConfirmAction({ id: r.id, type: "pay" })} className="w-full flex items-center gap-2 px-3 py-2 rounded-xl text-sm text-blue-600 hover:bg-blue-50 transition-colors"><HiOutlineCash className="w-4 h-4" /> Mark Paid</button>
                    )
                  )}
                </>
              );
            })()}
          </div>,
          document.body
        )}

        {/* Modals */}
        {showAdd       && <AddRecordModal onClose={() => setShowAdd(false)} />}
        {editing       && <EditModal record={editing} onClose={() => setEditing(null)} />}
        {rejectTarget  && <RejectModal record={rejectTarget} onClose={() => setRejectTarget(null)} />}
        {selected      && <DetailModal record={selected} onClose={() => setSelected(null)} onEdit={() => { setEditing(selected); setSelected(null); }} />}
      </div>
    </DashboardLayout>
  );
}
