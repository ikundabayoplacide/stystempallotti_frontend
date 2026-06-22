import { useState, useRef, useEffect, useCallback } from "react";
import ReactDOM from "react-dom";
import {
  HiOutlinePlus,
  HiOutlineX,
  HiOutlineCash,
  HiOutlineShoppingCart,
  HiOutlineCog,
  HiOutlineLightBulb,
  HiOutlineOfficeBuilding,
  HiOutlineClipboardList,
  HiOutlineCheckCircle,
  HiOutlineClock,
  HiOutlineExclamationCircle,
  HiOutlineSearch,
  HiOutlineRefresh,
  HiOutlinePencil,
  HiOutlineEye,
  HiOutlineThumbUp,
  HiOutlineDotsHorizontal,
} from "react-icons/hi";
import { /* useSelector */ } from "react-redux";
import { toast } from "react-toastify";
import { DashboardLayout } from "../../components";
import { Card } from "../../components/ui";
import PhoneInput from "../../components/ui/PhoneInput";
import { useGetUnreadCountQuery } from "../../store/services/notificationsService";
import {
  useGetOutstandsQuery,
  useCreateOutstandMutation,
  useUpdateOutstandMutation,
  useApproveOutstandMutation,
  type Outstand,
  type OutstandCategory,
  type OutstandStatus,
  type GetOutstandsParams,
} from "../../store/services/outstandsService";
import { useAuth } from "../../context/AuthContext";

// ─── Config ───────────────────────────────────────────────────────────────────

const categoryConfig: Record<OutstandCategory, { label: string; icon: React.ReactNode; color: string }> = {
  purchase:    { label: "Purchase",    icon: <HiOutlineShoppingCart className="w-4 h-4" />,   color: "bg-blue-100 text-blue-700" },
  utility:     { label: "Utility",     icon: <HiOutlineLightBulb className="w-4 h-4" />,      color: "bg-yellow-100 text-yellow-700" },
  maintenance: { label: "Maintenance", icon: <HiOutlineCog className="w-4 h-4" />,            color: "bg-orange-100 text-orange-700" },
  supplier:    { label: "Supplier",    icon: <HiOutlineOfficeBuilding className="w-4 h-4" />, color: "bg-purple-100 text-purple-700" },
  other:       { label: "Other",       icon: <HiOutlineClipboardList className="w-4 h-4" />,  color: "bg-gray-100 text-gray-700" },
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

// ─── Add Record Modal ─────────────────────────────────────────────────────────

function AddRecordModal({ onClose }: { onClose: () => void }) {
  const [form, setForm] = useState({
    description: "", category: "purchase" as OutstandCategory,
    quantity: "1", unitCost: "", recipient: "", recipientPhone: "", recipientRole: "", purpose: "", notes: "",
  });
  const [categories, setCategories] = useState<OutstandCategory[]>(DEFAULT_CATEGORIES);
  const [addingCategory, setAddingCategory] = useState(false);
  const [newCategory, setNewCategory] = useState("");
  const [phoneError, setPhoneError] = useState("");
  const [createOutstand, { isLoading }] = useCreateOutstandMutation();

  const set = (key: string) => (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement>) => {
    if (key === "category" && e.target.value === "__add_new__") {
      setAddingCategory(true);
      return;
    }
    setForm(prev => ({ ...prev, [key]: e.target.value }));
  };

  const confirmNewCategory = () => {
    const trimmed = newCategory.trim().toLowerCase().replace(/\s+/g, "-") as OutstandCategory;
    if (!trimmed) return;
    if (!categories.includes(trimmed)) setCategories(prev => [...prev, trimmed]);
    setForm(prev => ({ ...prev, category: trimmed }));
    setAddingCategory(false);
    setNewCategory("");
  };

  const total = (Number(form.quantity) || 0) * (Number(form.unitCost) || 0);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!form.recipientPhone || form.recipientPhone.replace(/\D/g, "").length < 9) {
      setPhoneError("Enter a valid phone number.");
      return;
    }
    setPhoneError("");
    try {
      await createOutstand({
        description: form.description,
        category: form.category,
        quantity: Number(form.quantity) || 1,
        unitCost: Number(form.unitCost),
        recipientName: form.recipient,
        recipientPhone: form.recipientPhone,
        recipientRole: form.recipientRole,
        purpose: form.purpose,
        notes: form.notes || undefined,
      }).unwrap();
      toast.success("Cash outflow recorded successfully");
      onClose();
    } catch (err: any) {
      toast.error(err?.data?.message ?? "Failed to record cash outflow");
    }
  };

  const inputCls = "w-full px-3 py-2 rounded-xl border border-custom-300 bg-style-500 text-secondary-100 text-sm focus:outline-none focus:border-primary-400 transition-colors";

  return (
    <div className="fixed inset-0 bg-secondary-100/50 z-50 flex items-start justify-center p-4 overflow-y-auto">
      <Card className="!p-6 max-w-3xl w-full my-8">
        <div className="flex items-center justify-between mb-5">
          <div>
            <h3 className="text-xl font-bold text-secondary-100">Record Cash Outflow</h3>
            <p className="text-sm text-custom-700 mt-0.5">Record money going out of the company</p>
          </div>
          <button onClick={onClose} className="text-custom-700 hover:text-secondary-100"><HiOutlineX className="w-6 h-6" /></button>
        </div>

        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label className="block text-sm font-semibold text-secondary-100 mb-1">Description *</label>
            <input value={form.description} onChange={set("description")} placeholder="What is this payment for?" className={inputCls} required />
          </div>

          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="block text-sm font-semibold text-secondary-100 mb-1">Category *</label>
              {addingCategory ? (
                <div className="flex gap-1">
                  <input
                    autoFocus
                    value={newCategory}
                    onChange={e => setNewCategory(e.target.value)}
                    onKeyDown={e => { if (e.key === "Enter") { e.preventDefault(); confirmNewCategory(); } if (e.key === "Escape") { setAddingCategory(false); setNewCategory(""); } }}
                    placeholder="New category name"
                    className={inputCls}
                  />
                  <button type="button" onClick={confirmNewCategory}
                    className="px-3 py-2 rounded-xl bg-primary-500 text-white text-xs font-semibold hover:bg-primary-600 transition-colors whitespace-nowrap">
                    Add
                  </button>
                  <button type="button" onClick={() => { setAddingCategory(false); setNewCategory(""); }}
                    className="px-2 py-2 rounded-xl border border-custom-300 text-custom-700 hover:bg-custom-100 transition-colors">
                    <HiOutlineX className="w-4 h-4" />
                  </button>
                </div>
              ) : (
                <select value={form.category} onChange={set("category")} className={inputCls}>
                  {categories.map(c => (
                    <option key={c} value={c}>
                      {categoryConfig[c as keyof typeof categoryConfig]?.label ?? c.charAt(0).toUpperCase() + c.slice(1)}
                    </option>
                  ))}
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
              <PhoneInput
                value={form.recipientPhone}
                onChange={val => { setForm(prev => ({ ...prev, recipientPhone: val })); setPhoneError(""); }}
                error={phoneError}
              />
            </div>
            <div>
              <label className="block text-sm font-semibold text-secondary-100 mb-1">Recipient Role *</label>
              <input value={form.recipientRole} onChange={set("recipientRole")} placeholder="e.g. Supplier, Staff" className={inputCls} required />
            </div>
          </div>

          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="block text-sm font-semibold text-secondary-100 mb-1">Quantity *</label>
              <input type="number" min="1" value={form.quantity} onChange={set("quantity")} className={inputCls} required />
            </div>
            <div>
              <label className="block text-sm font-semibold text-secondary-100 mb-1">Unit Cost (RWF) *</label>
              <input type="number" min="0" value={form.unitCost} onChange={set("unitCost")} placeholder="0" className={inputCls} required />
            </div>
          </div>

          <div className="flex items-center justify-between px-4 py-3 rounded-xl bg-custom-50 border border-custom-200">
            <span className="text-sm text-custom-700">Total Amount</span>
            <span className="text-lg font-bold text-secondary-100">{total.toLocaleString()} RWF</span>
          </div>

          <div>
            <label className="block text-sm font-semibold text-secondary-100 mb-1">Purpose *</label>
            <textarea value={form.purpose} onChange={set("purpose")} rows={2}
              placeholder="Why is this payment being made?"
              className="w-full px-3 py-2 rounded-xl border border-custom-300 bg-style-500 text-secondary-100 text-sm focus:outline-none focus:border-primary-400 transition-colors resize-none" required />
          </div>

          <div>
            <label className="block text-sm font-semibold text-secondary-100 mb-1">Notes <span className="font-normal text-custom-700">(optional)</span></label>
            <input value={form.notes} onChange={set("notes")} placeholder="Additional notes..." className={inputCls} />
          </div>

          <div className="flex gap-3 justify-end pt-2 border-t border-custom-300">
            <button type="button" onClick={onClose}
              className="px-4 py-2 rounded-xl border border-custom-300 text-sm font-semibold text-secondary-100 hover:bg-custom-100 transition-colors">
              Cancel
            </button>
            <button type="submit" disabled={isLoading}
              className="px-4 py-2 rounded-xl bg-primary-500 text-white text-sm font-semibold hover:bg-primary-600 transition-colors disabled:opacity-40">
              {isLoading ? "Recording..." : "Record Cash Outflow"}
            </button>
          </div>
        </form>
      </Card>
    </div>
  );
}

// ─── Edit Modal ───────────────────────────────────────────────────────────────

function EditModal({ record, onClose }: { record: Outstand; onClose: () => void }) {
  const [form, setForm] = useState({
    description: record.description,
    category: record.category,
    quantity: String(record.quantity),
    unitCost: String(record.unitCost),
    recipient: record.recipientName ?? "",
    recipientPhone: record.recipientPhone ?? "",
    recipientRole: record.recipientRole ?? "",
    purpose: record.purpose,
    notes: record.notes ?? "",
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
    setAddingCategory(false);
    setNewCategory("");
  };

  const total = (Number(form.quantity) || 0) * (Number(form.unitCost) || 0);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!form.recipientPhone || form.recipientPhone.replace(/\D/g, "").length < 9) {
      setPhoneError("Enter a valid phone number.");
      return;
    }
    setPhoneError("");
    try {
      await updateOutstand({
        id: record.id,
        data: {
          description: form.description,
          category: form.category,
          quantity: Number(form.quantity) || 1,
          unitCost: Number(form.unitCost),
          recipientName: form.recipient,
          recipientPhone: form.recipientPhone,
          recipientRole: form.recipientRole,
          purpose: form.purpose,
          notes: form.notes || undefined,
        },
      }).unwrap();
      toast.success("Record updated successfully");
      onClose();
    } catch (err: any) {
      toast.error(err?.data?.message ?? "Failed to update record");
    }
  };

  const inputCls = "w-full px-3 py-2 rounded-xl border border-custom-300 bg-style-500 text-secondary-100 text-sm focus:outline-none focus:border-primary-400 transition-colors";

  return (
    <div className="fixed inset-0 bg-secondary-100/50 z-50 flex items-start justify-center p-4 overflow-y-auto">
      <Card className="!p-6 max-w-3xl w-full my-8">
        <div className="flex items-center justify-between mb-5">
          <div>
            <h3 className="text-xl font-bold text-secondary-100">Edit Record <span className="text-primary-500">{record.ref}</span></h3>
            <p className="text-sm text-custom-700 mt-0.5">Update cash outflow details</p>
          </div>
          <button onClick={onClose} className="text-custom-700 hover:text-secondary-100"><HiOutlineX className="w-6 h-6" /></button>
        </div>

        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label className="block text-sm font-semibold text-secondary-100 mb-1">Description *</label>
            <input value={form.description} onChange={set("description")} className={inputCls} required />
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
                  {categories.map(c => <option key={c} value={c}>{categoryConfig[c as keyof typeof categoryConfig]?.label ?? c.charAt(0).toUpperCase() + c.slice(1)}</option>)}
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
              <PhoneInput
                value={form.recipientPhone}
                onChange={val => { setForm(prev => ({ ...prev, recipientPhone: val })); setPhoneError(""); }}
                error={phoneError}
              />
            </div>
            <div>
              <label className="block text-sm font-semibold text-secondary-100 mb-1">Recipient Role *</label>
              <input value={form.recipientRole} onChange={set("recipientRole")} className={inputCls} required />
            </div>
          </div>

          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="block text-sm font-semibold text-secondary-100 mb-1">Quantity *</label>
              <input type="number" min="1" value={form.quantity} onChange={set("quantity")} className={inputCls} required />
            </div>
            <div>
              <label className="block text-sm font-semibold text-secondary-100 mb-1">Unit Cost (RWF) *</label>
              <input type="number" min="0" value={form.unitCost} onChange={set("unitCost")} className={inputCls} required />
            </div>
          </div>

          <div className="flex items-center justify-between px-4 py-3 rounded-xl bg-custom-50 border border-custom-200">
            <span className="text-sm text-custom-700">Total Amount</span>
            <span className="text-lg font-bold text-secondary-100">{total.toLocaleString()} RWF</span>
          </div>

          <div>
            <label className="block text-sm font-semibold text-secondary-100 mb-1">Purpose *</label>
            <textarea value={form.purpose} onChange={set("purpose")} rows={2}
              className="w-full px-3 py-2 rounded-xl border border-custom-300 bg-style-500 text-secondary-100 text-sm focus:outline-none focus:border-primary-400 transition-colors resize-none" required />
          </div>

          <div>
            <label className="block text-sm font-semibold text-secondary-100 mb-1">Notes <span className="font-normal text-custom-700">(optional)</span></label>
            <input value={form.notes} onChange={set("notes")} className={inputCls} />
          </div>

          <div className="flex gap-3 justify-end pt-2 border-t border-custom-300">
            <button type="button" onClick={onClose}
              className="px-4 py-2 rounded-xl border border-custom-300 text-sm font-semibold text-secondary-100 hover:bg-custom-100 transition-colors">Cancel</button>
            <button type="submit" disabled={isLoading}
              className="px-4 py-2 rounded-xl bg-primary-500 text-white text-sm font-semibold hover:bg-primary-600 transition-colors disabled:opacity-40">
              {isLoading ? "Saving..." : "Save Changes"}
            </button>
          </div>
        </form>
      </Card>
    </div>
  );
}

// ─── Detail Modal ─────────────────────────────────────────────────────────────

function DetailModal({ record, onClose, onEdit, onApprove }: { record: Outstand; onClose: () => void; onEdit: () => void; onApprove: () => void }) {
  const cat = categoryConfig[record.category];
  const st  = statusConfig[record.status];
  const [confirming, setConfirming] = useState(false);
  return (
    <div className="fixed inset-0 bg-secondary-100/50 z-50 flex items-center justify-center p-4">
      <Card className="!p-6 max-w-3xl w-full">
        <div className="flex items-center justify-between mb-5">
          <div>
            <h3 className="text-lg font-bold text-secondary-100">{record.ref}</h3>
            <p className="text-sm text-custom-700 mt-0.5">{record.description}</p>
          </div>
          <button onClick={onClose} className="text-custom-700 hover:text-secondary-100"><HiOutlineX className="w-5 h-5" /></button>
        </div>

        <div className="flex gap-2 mb-4">
          <span className={`inline-flex items-center gap-1 text-xs font-semibold px-2.5 py-1 rounded-full ${cat.color}`}>
            {cat.icon} {cat.label}
          </span>
          <span className={`inline-flex items-center gap-1 text-xs font-bold px-2.5 py-1 rounded-full ${st.color}`}>
            {st.icon} {st.label}
          </span>
        </div>

        <div className="rounded-xl bg-custom-50 border border-custom-200 divide-y divide-custom-200 mb-4">
          {([
            ["Recipient",   record.recipientName],
            ["Phone",       record.recipientPhone],
            ["Role",        record.recipientRole],
            ["Quantity",    `${record.quantity} unit${record.quantity !== 1 ? "s" : ""}`],
            ["Unit Cost",   `${Number(record.unitCost).toLocaleString()} RWF`],
            ["Total",       `${Number(record.totalAmount).toLocaleString()} RWF`],
            ["Recorded by", record.recordedBy?.name ?? "—"],
            ["Date",        new Date(record.createdAt).toLocaleString("en-RW", { dateStyle: "medium", timeStyle: "short" })],
            ...(record.approvedBy ? [["Approved by", record.approvedBy.name]] : []),
            ...(record.paidAt ? [["Paid at", new Date(record.paidAt).toLocaleDateString()]] : []),
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

        {record.notes && (
          <div className="px-4 py-3 rounded-xl bg-yellow-50 border border-yellow-200 text-yellow-700 text-sm mb-4">
            {record.notes}
          </div>
        )}

        {record.rejectionNote && (
          <div className="px-4 py-3 rounded-xl bg-red-50 border border-red-200 text-red-700 text-sm mb-4">
            Rejected: {record.rejectionNote}
          </div>
        )}

        <div className="flex gap-2 mt-4">
          <button onClick={onEdit} disabled={record.status !== "pending"}
            className="flex items-center justify-center gap-2 px-4 py-2 rounded-xl border border-custom-300 text-sm font-semibold text-secondary-100 hover:bg-custom-100 transition-colors disabled:opacity-30 disabled:cursor-not-allowed">
            <HiOutlinePencil className="w-4 h-4" /> Edit
          </button>
          {record.status === "pending" && (
            confirming ? (
              <div className="flex-1 flex items-center gap-2 px-4 py-2 rounded-xl bg-emerald-50 border border-emerald-300">
                <span className="text-sm text-emerald-700 font-semibold flex-1">Approve this record?</span>
                <button onClick={() => { onApprove(); setConfirming(false); }}
                  className="px-3 py-1 rounded-lg bg-emerald-500 text-white text-xs font-bold hover:bg-emerald-600 transition-colors">Yes, Approve</button>
                <button onClick={() => setConfirming(false)}
                  className="px-3 py-1 rounded-lg border border-custom-300 text-xs font-semibold text-custom-700 hover:bg-custom-100 transition-colors">Cancel</button>
              </div>
            ) : (
              <button onClick={() => setConfirming(true)}
                className="flex-1 flex items-center justify-center gap-2 px-4 py-2 rounded-xl bg-emerald-500 text-white text-sm font-semibold hover:bg-emerald-600 transition-colors">
                <HiOutlineThumbUp className="w-4 h-4" /> Approve
              </button>
            )
          )}
          <button onClick={onClose}
            className="px-4 py-2 rounded-xl border border-custom-300 text-sm font-semibold text-secondary-100 hover:bg-custom-100 transition-colors">
            Close
          </button>
        </div>
      </Card>
    </div>
  );
}

// ─── Main Page ────────────────────────────────────────────────────────────────

export default function Outstands() {
  const { data: unreadCount = 0 } = useGetUnreadCountQuery();

  const [activeTab, setActiveTab]   = useState<OutstandStatus | "all">("all");
  const [search, setSearch]         = useState("");
  const [page, setPage]             = useState(1);
  const [showAdd, setShowAdd]       = useState(false);
  const [selected, setSelected]     = useState<Outstand | null>(null);
  const [editing, setEditing]       = useState<Outstand | null>(null);
  const [openMenuId, setOpenMenuId] = useState<string | null>(null);
  const [menuPos, setMenuPos] = useState<{ top: number; right: number } | null>(null);
  const menuDropdownRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (!openMenuId) return;
    const handler = (e: MouseEvent) => {
      if (menuDropdownRef.current && !menuDropdownRef.current.contains(e.target as Node)) {
        setOpenMenuId(null);
      }
    };
    document.addEventListener("mousedown", handler);
    return () => document.removeEventListener("mousedown", handler);
  }, [openMenuId]);

  const openMenu = useCallback((e: React.MouseEvent<HTMLButtonElement>, id: string) => {
    e.stopPropagation();
    if (openMenuId === id) { setOpenMenuId(null); return; }
    const rect = e.currentTarget.getBoundingClientRect();
    setMenuPos({ top: rect.bottom + 4, right: window.innerWidth - rect.right });
    setOpenMenuId(id);
  }, [openMenuId]);

  const { userRole } = useAuth();
  const canApprove = ["admin", "daf", "receptionist", "accountant"].includes(userRole ?? "");

  const [approveOutstand] = useApproveOutstandMutation();
  const [confirmTarget, setConfirmTarget] = useState<Outstand | null>(null);

  const queryParams: GetOutstandsParams = {
    page,
    limit: PAGE_SIZE,
    ...(activeTab !== "all" && { status: activeTab }),
  };

  const { data, isLoading, isFetching, refetch } = useGetOutstandsQuery(queryParams);

  const outstands   = data?.outstands ?? [];
  const totalPages  = data?.totalPages ?? 1;
  const totalCount  = data?.total ?? 0;

  // client-side search filter (on current page)
  const filtered = outstands.filter(r => {
    const q = search.toLowerCase();
    return !q ||
      r.ref.toLowerCase().includes(q) ||
      r.description.toLowerCase().includes(q) ||
      r.recipient.toLowerCase().includes(q) ||
      r.purpose.toLowerCase().includes(q);
  });

  // KPI totals from current full result
  const totalAmount   = outstands.reduce((s, r) => s + Number(r.totalAmount), 0);
  const pendingAmt    = outstands.filter(r => r.status === "pending").reduce((s, r) => s + Number(r.totalAmount), 0);
  const approvedAmt   = outstands.filter(r => r.status === "approved").reduce((s, r) => s + Number(r.totalAmount), 0);
  const paidAmt       = outstands.filter(r => r.status === "paid").reduce((s, r) => s + Number(r.totalAmount), 0);

  const handleApprove = async (id: string) => {
    try {
      await approveOutstand(id).unwrap();
      toast.success("Record approved successfully");
      setSelected(null);
      setConfirmTarget(null);
    } catch (err: any) {
      toast.error(err?.data?.message ?? "Failed to approve record");
    }
  };

  const handleTabChange = (tab: OutstandStatus | "all") => {
    setActiveTab(tab);
    setPage(1);
    setSearch("");
  };

  return (
    <DashboardLayout notificationCount={unreadCount}>
      <div className="space-y-6 font-[family-name:var(--font-family-primary)]">

        {/* Header */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
          <div>
            <div className="flex items-center gap-2 mb-1">
              <HiOutlineCash className="w-6 h-6 text-primary-500" />
              <h1 className="text-2xl md:text-3xl font-bold text-secondary-100">Cash Outflows</h1>
            </div>
            <p className="text-sm text-custom-700">Record and track all money going out of the company</p>
          </div>
          <div className="flex items-center gap-2 self-start sm:self-auto">
            <button onClick={() => refetch()}
              className="p-2 rounded-xl border border-custom-300 hover:bg-custom-100 transition-colors">
              <HiOutlineRefresh className={`w-4 h-4 text-custom-700 ${isFetching ? "animate-spin" : ""}`} />
            </button>
            <button onClick={() => setShowAdd(true)}
              className="flex items-center gap-2 px-4 py-2 rounded-xl bg-primary-500 text-white text-sm font-semibold hover:bg-primary-600 transition-colors">
              <HiOutlinePlus className="w-4 h-4" />
              New Record
            </button>
          </div>
        </div>

        {/* KPI Cards */}
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
          {[
            { label: "Total Recorded",  value: totalAmount,  color: "text-secondary-100" },
            { label: "Pending",         value: pendingAmt,   color: "text-yellow-600" },
            { label: "Approved",        value: approvedAmt,  color: "text-blue-600" },
            { label: "Paid Out",        value: paidAmt,      color: "text-emerald-600" },
          ].map(({ label, value, color }) => (
            <Card key={label} className="!p-4">
              <p className="text-xs text-custom-700 mb-1">{label}</p>
              <p className={`text-xl font-bold ${color}`}>{value.toLocaleString()}</p>
              <p className="text-xs text-custom-700">RWF</p>
            </Card>
          ))}
        </div>

        {/* Tabs + Search */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
          <div className="flex gap-1 bg-custom-100 p-1 rounded-xl w-fit flex-wrap">
            {TABS.map(t => (
              <button key={t.key} onClick={() => handleTabChange(t.key)}
                className={`px-3 py-1.5 rounded-lg text-xs font-semibold transition-colors ${
                  activeTab === t.key ? "bg-primary-500 text-white shadow-sm" : "text-custom-700 hover:text-secondary-100"
                }`}>
                {t.label}
              </button>
            ))}
          </div>

          <div className="relative w-full sm:w-64">
            <HiOutlineSearch className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-custom-700" />
            <input type="text" placeholder="Search records..." value={search}
              onChange={e => setSearch(e.target.value)}
              className="w-full pl-9 pr-4 py-2 rounded-xl border border-custom-300 bg-style-500 text-secondary-100 text-sm placeholder:text-custom-700 focus:outline-none focus:border-primary-400 transition-colors" />
          </div>
        </div>

        {/* Table */}
        <Card className="!p-0 overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead className="bg-custom-100 border-b border-custom-300">
                <tr>
                  {["Ref", "Description", "Category", "Qty", "Unit Cost", "Total", "Recipient", "Purpose", "Status", "Date", ""].map(h => (
                    <th key={h} className="px-3 py-2.5 text-left text-xs font-bold text-secondary-100 uppercase tracking-wide whitespace-nowrap">{h}</th>
                  ))}
                </tr>
              </thead>
              <tbody className="divide-y divide-custom-200">
                {isLoading ? (
                  <tr><td colSpan={11} className="px-4 py-10 text-center text-custom-700 text-sm">Loading...</td></tr>
                ) : filtered.length === 0 ? (
                  <tr><td colSpan={11} className="px-4 py-10 text-center text-custom-700 text-sm">No records found.</td></tr>
                ) : filtered.map(r => {
                  const cat = categoryConfig[r.category];
                  const st  = statusConfig[r.status];
                  return (
                    <tr key={r.id} className="hover:bg-custom-50 transition-colors">
                      <td className="px-3 py-2.5 font-semibold text-primary-500 whitespace-nowrap">{r.ref}</td>
                      <td className="px-3 py-2.5 text-secondary-100 font-semibold whitespace-nowrap max-w-[160px] truncate">{r.description}</td>
                      <td className="px-3 py-2.5 relative overflow-visible">
                        <span className={`inline-flex items-center gap-1 text-xs font-semibold px-2 py-0.5 rounded-full ${cat.color}`}>
                          {cat.icon} {cat.label}
                        </span>
                      </td>
                      <td className="px-3 py-2.5 text-secondary-100 text-center">{r.quantity}</td>
                      <td className="px-3 py-2.5 text-secondary-100 whitespace-nowrap">{Number(r.unitCost).toLocaleString()} RWF</td>
                      <td className="px-3 py-2.5 font-bold text-secondary-100 whitespace-nowrap">{Number(r.totalAmount).toLocaleString()} RWF</td>
                      <td className="px-3 py-2.5 text-custom-700 whitespace-nowrap">
                        <p className="font-semibold text-secondary-100">{r.recipientName}</p>
                        <p className="text-xs">{r.recipientPhone}</p>
                        <p className="text-xs">{r.recipientRole}</p>
                      </td>
                      <td className="px-3 py-2.5 text-custom-700 max-w-[180px] truncate">{r.purpose}</td>
                      <td className="px-3 py-2.5">
                        <span className={`inline-flex items-center gap-1 text-xs font-bold px-2 py-0.5 rounded-full ${st.color}`}>
                          {st.icon} {st.label}
                        </span>
                      </td>
                      <td className="px-3 py-2.5 text-custom-700 whitespace-nowrap text-xs">
                        {new Date(r.createdAt).toLocaleDateString("en-RW", { day: "2-digit", month: "short", year: "numeric" })}
                      </td>
                      <td className="px-3 py-2.5">
                        <button title="Actions" aria-label="Actions" onClick={(e) => openMenu(e, r.id)}
                          className="px-2 py-1 rounded-lg border border-custom-300 text-xs font-semibold text-custom-700 hover:bg-custom-100 transition-colors">
                          <HiOutlineDotsHorizontal className="w-4 h-4" />
                        </button>
                        {openMenuId === r.id && menuPos && ReactDOM.createPortal(
                          <div ref={menuDropdownRef} className="fixed w-44 bg-style-500 rounded-xl shadow-lg border border-custom-200 z-[9999]" style={{ top: menuPos.top, right: menuPos.right }}>
                            <button onClick={() => { setSelected(r); setOpenMenuId(null); }}
                              className="w-full text-left px-4 py-2 text-sm text-secondary-100 hover:bg-custom-100 flex items-center gap-2">
                              <HiOutlineEye className="w-4 h-4" /> View
                            </button>
                            <button onClick={() => { setEditing(r); setOpenMenuId(null); }} disabled={r.status !== "pending"}
                              className="w-full text-left px-4 py-2 text-sm text-secondary-100 hover:bg-custom-100 flex items-center gap-2 disabled:opacity-30 disabled:cursor-not-allowed">
                              <HiOutlinePencil className="w-4 h-4" /> Edit
                            </button>
                            {canApprove && r.status === "pending" && (
                              <button onClick={() => { setConfirmTarget(r); setOpenMenuId(null); }}
                                className="w-full text-left px-4 py-2 text-sm text-emerald-600 hover:bg-custom-100 flex items-center gap-2">
                                <HiOutlineThumbUp className="w-4 h-4" /> Approve
                              </button>
                            )}
                          </div>,
                          document.body
                        )}
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>

          {/* Footer: count + pagination */}
          <div className="flex items-center justify-between px-4 py-3 border-t border-custom-200 bg-custom-50">
            <p className="text-xs text-custom-700">
              {totalCount > 0 ? `${(page - 1) * PAGE_SIZE + 1}–${Math.min(page * PAGE_SIZE, totalCount)} of ${totalCount}` : "0 records"}
            </p>
            {totalPages > 1 && (
              <div className="flex items-center gap-1">
                <button onClick={() => setPage(p => Math.max(1, p - 1))} disabled={page === 1}
                  className="px-3 py-1.5 rounded-lg border border-custom-300 text-xs font-semibold text-secondary-100 hover:bg-custom-100 disabled:opacity-40 transition-colors">Prev</button>
                {Array.from({ length: totalPages }, (_, i) => i + 1).map(n => (
                  <button key={n} onClick={() => setPage(n)}
                    className={`w-7 h-7 rounded-lg text-xs font-bold transition-colors ${n === page ? "bg-primary-500 text-white" : "border border-custom-300 text-secondary-100 hover:bg-custom-100"}`}>{n}</button>
                ))}
                <button onClick={() => setPage(p => Math.min(totalPages, p + 1))} disabled={page === totalPages}
                  className="px-3 py-1.5 rounded-lg border border-custom-300 text-xs font-semibold text-secondary-100 hover:bg-custom-100 disabled:opacity-40 transition-colors">Next</button>
              </div>
            )}
          </div>
        </Card>
      </div>

      {showAdd && <AddRecordModal onClose={() => setShowAdd(false)} />}
      {selected && <DetailModal record={selected} onClose={() => setSelected(null)} onEdit={() => { setEditing(selected); setSelected(null); }} onApprove={() => { setConfirmTarget(selected); setSelected(null); }} />}
      {confirmTarget && (
        <ConfirmApproveModal
          record={confirmTarget}
          onCancel={() => setConfirmTarget(null)}
          onConfirm={(id) => handleApprove(id)}
        />
      )}
      {editing && <EditModal record={editing} onClose={() => setEditing(null)} />}
    </DashboardLayout>
  );
}

function ConfirmApproveModal({ record, onCancel, onConfirm }: { record: Outstand; onCancel: () => void; onConfirm: (id: string) => void }) {
  return (
    <div className="fixed inset-0 bg-secondary-100/50 z-50 flex items-center justify-center p-4">
      <Card className="!p-6 w-full max-w-md">
        <div className="flex items-start justify-between mb-4">
          <div>
            <h3 className="text-lg font-bold text-secondary-100">Approve Record</h3>
            <p className="text-sm text-custom-700 mt-0.5">You're about to approve this cash outflow.</p>
          </div>
          <button onClick={onCancel} className="text-custom-700 hover:text-secondary-100"><HiOutlineX className="w-5 h-5" /></button>
        </div>

        <div className="rounded-xl bg-custom-50 border border-custom-200 mb-4 p-4">
          <div className="flex justify-between text-sm mb-2">
            <span className="text-custom-700">Ref</span>
            <span className="font-semibold text-secondary-100">{record.ref}</span>
          </div>
          <div className="flex justify-between text-sm mb-2">
            <span className="text-custom-700">Recipient</span>
            <span className="font-semibold text-secondary-100">{record.recipientName}</span>
          </div>
          <div className="flex justify-between text-sm">
            <span className="text-custom-700">Total</span>
            <span className="font-semibold text-secondary-100">{Number(record.totalAmount).toLocaleString()} RWF</span>
          </div>
        </div>

        <div className="flex gap-3 justify-end">
          <button onClick={onCancel}
            className="px-4 py-2 rounded-xl border border-custom-300 text-sm font-semibold text-secondary-100 hover:bg-custom-100 transition-colors">Cancel</button>
          <button onClick={() => onConfirm(record.id)}
            className="px-4 py-2 rounded-xl bg-emerald-500 text-white text-sm font-semibold hover:bg-emerald-600 transition-colors">Yes, Approve</button>
        </div>
      </Card>
    </div>
  );
}
