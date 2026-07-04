import { useState, useRef, useEffect, useCallback } from "react";
import ReactDOM from "react-dom";
import {
  HiOutlinePlus, HiOutlineX, HiOutlineCash, HiOutlineRefresh,
  HiOutlineSearch, HiOutlinePencil, HiOutlineTrash,
  HiOutlineClipboardList, HiOutlineDotsHorizontal,
  HiOutlineTrendingUp, HiOutlineCurrencyDollar,
  HiOutlineLibrary, HiOutlineExclamationCircle,
} from "react-icons/hi";
import { toast } from "react-toastify";
import DashboardLayout from "../../components/DashboardLayout";
import { Card } from "../../components/ui";
import PhoneInput from "../../components/ui/PhoneInput";
import {
  useGetWithdrawalBalanceQuery,
  useGetWithdrawalsQuery,
  useCreateWithdrawalMutation,
  useUpdateWithdrawalMutation,
  useDeleteWithdrawalMutation,
  useGetWithdrawalConfigQuery,
  useSetInitialAmountMutation,
  type Withdrawal,
  type GetWithdrawalsParams,
} from "../../store/services/withdrawalsService";

const PAGE_SIZE = 5;
const inputCls = "w-full px-3 py-2 rounded-xl border border-custom-300 bg-style-500 text-secondary-100 text-sm focus:outline-none focus:border-primary-400 transition-colors";
const fmt = (n: number | undefined | null) => (n ?? 0).toLocaleString();

// ─── Initial Amount Modal ─────────────────────────────────────────────────────

function InitialAmountModal({ current, onClose }: { current: number; onClose: () => void }) {
  const [value, setValue] = useState(String(current || ""));
  const [setInitialAmount, { isLoading }] = useSetInitialAmountMutation();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    const amount = Number(value);
    if (!amount || amount < 0) { toast.error("Enter a valid amount"); return; }
    try {
      await setInitialAmount(amount).unwrap();
      toast.success("Initial amount updated");
      onClose();
    } catch (err: any) {
      toast.error(err?.data?.message ?? "Failed to update initial amount");
    }
  };

  return (
    <div className="fixed inset-0 bg-secondary-100/50 z-50 flex items-center justify-center p-4">
      <Card className="!p-6 max-w-sm w-full">
        <div className="flex items-center justify-between mb-4">
          <div>
            <h3 className="text-lg font-bold text-secondary-100">Initial Amount</h3>
            <p className="text-sm text-custom-700 mt-0.5">Set the starting fund balance</p>
          </div>
          <button onClick={onClose} className="text-custom-700 hover:text-secondary-100">
            <HiOutlineX className="w-5 h-5" />
          </button>
        </div>
        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label className="block text-sm font-semibold text-secondary-100 mb-1">Amount (RWF) *</label>
            <input
              type="number" min="0" value={value}
              onChange={e => setValue(e.target.value)}
              placeholder="e.g. 500000"
              className={inputCls}
              autoFocus required
            />
            {current > 0 && (
              <p className="text-xs text-custom-700 mt-1">Current: {current.toLocaleString()} RWF</p>
            )}
          </div>
          <div className="flex gap-3 justify-end pt-2 border-t border-custom-300">
            <button type="button" onClick={onClose}
              className="px-4 py-2 rounded-xl border border-custom-300 text-sm font-semibold text-secondary-100 hover:bg-custom-100 transition-colors">
              Cancel
            </button>
            <button type="submit" disabled={isLoading}
              className="px-4 py-2 rounded-xl bg-primary-500 text-white text-sm font-semibold hover:bg-primary-600 transition-colors disabled:opacity-40">
              {isLoading ? "Saving..." : "Save"}
            </button>
          </div>
        </form>
      </Card>
    </div>
  );
}

// ─── Add / Edit Modal ─────────────────────────────────────────────────────────

function WithdrawalFormModal({
  record,
  onClose,
}: {
  record?: Withdrawal;
  onClose: () => void;
}) {
  const isEdit = !!record;
  const [form, setForm] = useState({
    title:          record?.title          ?? "",
    description:    record?.description    ?? "",
    amount:         record ? String(record.amount) : "",
    withdrawnAt:    record?.withdrawnAt    ? record.withdrawnAt.slice(0, 10) : new Date().toISOString().slice(0, 10),
    takenByName:    record?.takenByName    ?? "",
    takenByContact: record?.takenByContact ?? "",
    source:         record?.source         ?? "",
    notes:          record?.notes          ?? "",
  });
  const [phoneError, setPhoneError] = useState("");
  const [createWithdrawal, { isLoading: creating }] = useCreateWithdrawalMutation();
  const [updateWithdrawal, { isLoading: updating }]  = useUpdateWithdrawalMutation();
  const isLoading = creating || updating;

  const set = (key: string) =>
    (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) =>
      setForm(prev => ({ ...prev, [key]: e.target.value }));

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!form.takenByContact || form.takenByContact.replace(/\D/g, "").length < 9) {
      setPhoneError("Enter a valid phone number."); return;
    }
    setPhoneError("");
    const payload = {
      title:          form.title,
      description:    form.description,
      amount:         Number(form.amount),
      withdrawnAt:    form.withdrawnAt,
      takenByName:    form.takenByName,
      takenByContact: form.takenByContact,
      source:         form.source,
      notes:          form.notes || undefined,
    };
    try {
      if (isEdit) {
        await updateWithdrawal({ id: record!.id, data: payload }).unwrap();
        toast.success("Withdrawal updated");
      } else {
        await createWithdrawal(payload).unwrap();
        toast.success("Withdrawal recorded");
      }
      onClose();
    } catch (err: any) {
      toast.error(err?.data?.message ?? "Failed to save withdrawal");
    }
  };

  return (
    <div className="fixed inset-0 bg-secondary-100/50 z-50 flex items-start justify-center p-4 overflow-y-auto">
      <Card className="!p-6 max-w-2xl w-full my-8">
        <div className="flex items-center justify-between mb-5">
          <div>
            <h3 className="text-xl font-bold text-secondary-100">
              {isEdit ? "Edit Withdrawal" : "Record Withdrawal"}
            </h3>
            <p className="text-sm text-custom-700 mt-0.5">
              {isEdit ? "Update withdrawal details" : "Record money brought in from bank or outside"}
            </p>
          </div>
          <button onClick={onClose} className="text-custom-700 hover:text-secondary-100">
            <HiOutlineX className="w-6 h-6" />
          </button>
        </div>

        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="block text-sm font-semibold text-secondary-100 mb-1">Title *</label>
              <input value={form.title} onChange={set("title")} placeholder="e.g. Bank Withdrawal" className={inputCls} required />
            </div>
            <div>
              <label className="block text-sm font-semibold text-secondary-100 mb-1">Amount (RWF) *</label>
              <input type="number" min="0" value={form.amount} onChange={set("amount")} placeholder="0" className={inputCls} required />
            </div>
          </div>

          <div>
            <label className="block text-sm font-semibold text-secondary-100 mb-1">Description *</label>
            <textarea value={form.description} onChange={set("description")} rows={3}
              placeholder="e.g. Monthly operating cash"
              className="w-full px-3 py-2 rounded-xl border border-custom-300 bg-style-500 text-secondary-100 text-sm focus:outline-none focus:border-primary-400 transition-colors resize-none"
              required />
          </div>

          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="block text-sm font-semibold text-secondary-100 mb-1">Source *</label>
              <input value={form.source} onChange={set("source")} placeholder="e.g. BK Bank - Account 001" className={inputCls} required />
            </div>
            <div>
              <label className="block text-sm font-semibold text-secondary-100 mb-1">Date</label>
              <input type="date" value={form.withdrawnAt} readOnly className={`${inputCls} bg-custom-100 cursor-not-allowed text-custom-700`} />
            </div>
          </div>

          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="block text-sm font-semibold text-secondary-100 mb-1">Taken By (Name) *</label>
              <input value={form.takenByName} onChange={set("takenByName")} placeholder="Full name" className={inputCls} required />
            </div>
            <div>
              <label className="block text-sm font-semibold text-secondary-100 mb-1">Contact *</label>
              <PhoneInput
                value={form.takenByContact}
                onChange={val => { setForm(prev => ({ ...prev, takenByContact: val })); setPhoneError(""); }}
                error={phoneError}
              />
            </div>
          </div>

          <div>
            <label className="block text-sm font-semibold text-secondary-100 mb-1">
              Notes <span className="font-normal text-custom-700">(optional)</span>
            </label>
            <textarea value={form.notes} onChange={set("notes")} rows={2}
              placeholder="e.g. For payroll preparation"
              className="w-full px-3 py-2 rounded-xl border border-custom-300 bg-style-500 text-secondary-100 text-sm focus:outline-none focus:border-primary-400 transition-colors resize-none" />
          </div>

          <div className="flex gap-3 justify-end pt-2 border-t border-custom-300">
            <button type="button" onClick={onClose}
              className="px-4 py-2 rounded-xl border border-custom-300 text-sm font-semibold text-secondary-100 hover:bg-custom-100 transition-colors">
              Cancel
            </button>
            <button type="submit" disabled={isLoading}
              className="px-4 py-2 rounded-xl bg-primary-500 text-white text-sm font-semibold hover:bg-primary-600 transition-colors disabled:opacity-40">
              {isLoading ? (isEdit ? "Saving..." : "Recording...") : (isEdit ? "Save Changes" : "Record Withdrawal")}
            </button>
          </div>
        </form>
      </Card>
    </div>
  );
}

// ─── Detail Modal ─────────────────────────────────────────────────────────────

function DetailModal({
  record,
  onClose,
  onEdit,
}: {
  record: Withdrawal;
  onClose: () => void;
  onEdit: () => void;
}) {
  const [deleteWithdrawal, { isLoading: deleting }] = useDeleteWithdrawalMutation();
  const [confirmDelete, setConfirmDelete] = useState(false);

  const handleDelete = async () => {
    try {
      await deleteWithdrawal(record.id).unwrap();
      toast.success("Withdrawal deleted");
      onClose();
    } catch (err: any) {
      toast.error(err?.data?.message ?? "Failed to delete");
    }
  };

  return (
    <div className="fixed inset-0 bg-secondary-100/50 z-50 flex items-center justify-center p-4">
      <Card className="!p-6 max-w-lg w-full max-h-[90vh] overflow-y-auto">
        <div className="flex items-center justify-between mb-5">
          <div>
            <h3 className="text-lg font-bold text-secondary-100">{record.title}</h3>
            <p className="text-sm text-custom-700 mt-0.5">{record.description}</p>
          </div>
          <button onClick={onClose} className="text-custom-700 hover:text-secondary-100">
            <HiOutlineX className="w-5 h-5" />
          </button>
        </div>

        <div className="mb-4 px-4 py-3 rounded-xl bg-green-50 border border-green-200 flex items-center justify-between">
          <span className="text-sm font-semibold text-green-700">Amount</span>
          <span className="text-2xl font-bold text-green-700">{fmt(Number(record.amount))} RWF</span>
        </div>

        <div className="rounded-xl bg-custom-50 border border-custom-200 divide-y divide-custom-200 mb-4">
          {([
            ["Source",      record.source],
            ["Date",        new Date(record.withdrawnAt).toLocaleDateString("en-RW", { dateStyle: "medium" })],
            ["Taken By",    record.takenByName],
            ["Contact",     record.takenByContact],
            ["Recorded By", record.recordedBy?.name ?? "—"],
            ["Created At",  new Date(record.createdAt).toLocaleString("en-RW", { dateStyle: "medium", timeStyle: "short" })],
          ] as [string, string][]).map(([label, value]) => (
            <div key={label} className="flex justify-between px-4 py-2.5 text-sm">
              <span className="text-custom-700">{label}</span>
              <span className="font-semibold text-secondary-100 text-right max-w-[60%]">{value}</span>
            </div>
          ))}
        </div>

        {record.notes && (
          <div className="px-4 py-3 rounded-xl bg-yellow-50 border border-yellow-200 text-yellow-700 text-sm mb-4">
            {record.notes}
          </div>
        )}

        <div className="flex flex-wrap gap-2 pt-4 border-t border-custom-200">
          <button onClick={onEdit}
            className="flex items-center gap-2 px-4 py-2 rounded-xl border border-custom-300 text-sm font-semibold text-secondary-100 hover:bg-custom-100 transition-colors">
            <HiOutlinePencil className="w-4 h-4" /> Edit
          </button>

          {confirmDelete ? (
            <div className="flex items-center gap-2 px-4 py-2 rounded-xl bg-red-50 border border-red-300">
              <span className="text-sm text-red-700 font-semibold">Delete this?</span>
              <button onClick={handleDelete} disabled={deleting}
                className="px-3 py-1 rounded-lg bg-red-500 text-white text-xs font-bold hover:bg-red-600 disabled:opacity-40 transition-colors">
                Yes
              </button>
              <button onClick={() => setConfirmDelete(false)}
                className="px-3 py-1 rounded-lg border border-custom-300 text-xs font-semibold text-custom-700 hover:bg-custom-100 transition-colors">
                No
              </button>
            </div>
          ) : (
            <button onClick={() => setConfirmDelete(true)}
              className="flex items-center gap-2 px-4 py-2 rounded-xl bg-red-500 text-white text-sm font-semibold hover:bg-red-600 transition-colors">
              <HiOutlineTrash className="w-4 h-4" /> Delete
            </button>
          )}

          <button onClick={onClose}
            className="ml-auto px-4 py-2 rounded-xl border border-custom-300 text-sm font-semibold text-secondary-100 hover:bg-custom-100 transition-colors">
            Close
          </button>
        </div>
      </Card>
    </div>
  );
}

// ─── Main Page ────────────────────────────────────────────────────────────────

export default function Withdraws() {
  const [search, setSearch]         = useState("");
  const [page, setPage]             = useState(1);
  const [showAdd, setShowAdd]             = useState(false);
  const [showInitial, setShowInitial]      = useState(false);
  const [selected, setSelected]           = useState<Withdrawal | null>(null);
  const [editing, setEditing]       = useState<Withdrawal | null>(null);
  const [openMenuId, setOpenMenuId] = useState<string | null>(null);
  const [menuPos, setMenuPos]       = useState<{ top: number; right: number } | null>(null);
  const menuRef = useRef<HTMLDivElement>(null);
  const triggerRef = useRef<HTMLButtonElement | null>(null);

  useEffect(() => {
    if (!openMenuId) return;
    const handler = (e: MouseEvent) => {
      if (triggerRef.current?.contains(e.target as Node)) return;
      if (menuRef.current && !menuRef.current.contains(e.target as Node)) setOpenMenuId(null);
    };
    document.addEventListener("mousedown", handler);
    return () => document.removeEventListener("mousedown", handler);
  }, [openMenuId]);

  const openMenu = useCallback((e: React.MouseEvent<HTMLButtonElement>, id: string) => {
    e.stopPropagation();
    triggerRef.current = e.currentTarget;
    if (openMenuId === id) { setOpenMenuId(null); return; }
    const rect = e.currentTarget.getBoundingClientRect();
    setMenuPos({ top: rect.bottom + 4, right: window.innerWidth - rect.right });
    setOpenMenuId(id);
  }, [openMenuId]);

  const queryParams: GetWithdrawalsParams = { page, limit: PAGE_SIZE, ...(search ? { search } : {}) };

  const { data: balanceData, isLoading: loadingBalance, refetch: refetchBalance } = useGetWithdrawalBalanceQuery();
  const { data: configData } = useGetWithdrawalConfigQuery();
  const { data, isLoading, isFetching, refetch } = useGetWithdrawalsQuery(queryParams);

  const withdrawals = data?.withdrawals ?? [];
  const totalPages  = data?.totalPages ?? 1;

  const balance = balanceData ?? {
    initialAmount: 0, totalPaymentsIn: 0,
    totalWithdrawalsIn: 0, totalExpensesOut: 0, totalBalance: 0,
  };
  const currentInitial = configData?.initialAmount ?? balance.initialAmount;

  const handleRefetch = () => { refetch(); refetchBalance(); };

  return (
    <DashboardLayout>
      <div className="space-y-6 font-[family-name:var(--font-family-primary)]">

        {/* Header */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
          <div>
            <div className="flex items-center gap-2 mb-1">
              <HiOutlineLibrary className="w-6 h-6 text-primary-500" />
              <h1 className="text-2xl md:text-3xl font-bold text-secondary-100">Withdrawals</h1>
            </div>
            <p className="text-sm text-custom-700">Record and track money brought in from bank or outside sources</p>
          </div>
          <div className="flex items-center gap-2 self-start sm:self-auto">
            <button onClick={handleRefetch}
              className="p-2 rounded-xl border border-custom-300 hover:bg-custom-100 transition-colors">
              <HiOutlineRefresh className={`w-4 h-4 text-custom-700 ${isFetching ? "animate-spin" : ""}`} />
            </button>
            <button onClick={() => setShowInitial(true)}
              className="flex items-center gap-2 px-4 py-2 rounded-xl border border-custom-300 text-sm font-semibold text-secondary-100 hover:bg-custom-100 transition-colors">
              <HiOutlinePencil className="w-4 h-4" /> Initial Amount
            </button>
            <button onClick={() => setShowAdd(true)}
              className="flex items-center gap-2 px-4 py-2 rounded-xl bg-primary-500 text-white text-sm font-semibold hover:bg-primary-600 transition-colors">
              <HiOutlinePlus className="w-4 h-4" /> New Withdrawal
            </button>
          </div>
        </div>

        {/* Balance Summary */}
        {loadingBalance ? (
          <div className="grid grid-cols-2 sm:grid-cols-5 gap-3">
            {[1,2,3,4,5].map(i => <div key={i} className="h-20 bg-custom-100 rounded-xl animate-pulse" />)}
          </div>
        ) : (
          <div className="grid grid-cols-2 sm:grid-cols-5 gap-3">
            <Card className="!p-4">
              <p className="text-xs text-custom-700">Initial Amount</p>
              <p className="text-lg font-bold text-secondary-100">{fmt(balance.initialAmount)}</p>
              <p className="text-xs text-custom-700">RWF</p>
            </Card>
            <Card className="!p-4">
              <div className="flex items-center gap-1 mb-1">
                <HiOutlineCash className="w-3.5 h-3.5 text-green-600" />
                <p className="text-xs text-custom-700">Payments In</p>
              </div>
              <p className="text-lg font-bold text-green-600">+{fmt(balance.totalPaymentsIn)}</p>
              <p className="text-xs text-custom-700">RWF</p>
            </Card>
            <Card className="!p-4">
              <div className="flex items-center gap-1 mb-1">
                <HiOutlineTrendingUp className="w-3.5 h-3.5 text-blue-600" />
                <p className="text-xs text-custom-700">Withdrawals In</p>
              </div>
              <p className="text-lg font-bold text-blue-600">+{fmt(balance.totalWithdrawalsIn)}</p>
              <p className="text-xs text-custom-700">RWF</p>
            </Card>
            <Card className="!p-4">
              <div className="flex items-center gap-1 mb-1">
                <HiOutlineExclamationCircle className="w-3.5 h-3.5 text-red-500" />
                <p className="text-xs text-custom-700">Expenses Out</p>
              </div>
              <p className="text-lg font-bold text-red-500">-{fmt(balance.totalExpensesOut)}</p>
              <p className="text-xs text-custom-700">RWF</p>
            </Card>
            <Card className={`!p-4 col-span-2 sm:col-span-1 ${balance.totalBalance >= 0 ? "bg-emerald-50 border-emerald-200" : "bg-orange-50 border-orange-200"}`}>
              <div className="flex items-center gap-1 mb-1">
                <HiOutlineCurrencyDollar className={`w-3.5 h-3.5 ${balance.totalBalance >= 0 ? "text-emerald-600" : "text-orange-600"}`} />
                <p className="text-xs text-custom-700">Total Balance</p>
              </div>
              <p className={`text-xl font-bold ${balance.totalBalance >= 0 ? "text-emerald-700" : "text-orange-700"}`}>
                {fmt(balance.totalBalance)}
              </p>
              <p className="text-xs text-custom-700">RWF</p>
            </Card>
          </div>
        )}

        {/* Balance Formula hint */}
        <div className="px-4 py-3 rounded-xl bg-custom-50 border border-custom-200 text-xs text-custom-700">
          <span className="font-semibold text-secondary-100">Balance formula: </span>
          Initial + Payments In + Withdrawals In − Expenses (paid)
        </div>

        {/* Search */}
        <div className="relative max-w-sm">
          <HiOutlineSearch className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-custom-400" />
          <input value={search} onChange={e => { setSearch(e.target.value); setPage(1); }}
            placeholder="Search title, description, source…"
            className="w-full pl-9 pr-3 py-2 rounded-xl border border-custom-300 bg-style-500 text-secondary-100 text-sm focus:outline-none focus:border-primary-400 transition-colors" />
        </div>

        {/* Table */}
        <Card className="!p-0 overflow-hidden">
          {isLoading ? (
            <div className="space-y-3 p-4">
              {[1,2,3,4].map(i => <div key={i} className="h-14 bg-custom-100 rounded-xl animate-pulse" />)}
            </div>
          ) : withdrawals.length === 0 ? (
            <div className="py-16 text-center">
              <HiOutlineClipboardList className="w-10 h-10 text-custom-300 mx-auto mb-2" />
              <p className="text-sm text-custom-700">No withdrawals found</p>
            </div>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full text-sm">
                <thead className="bg-custom-50 border-b border-custom-200">
                  <tr>
                    {["#", "Title", "Description", "Source", "Taken By", "Amount (RWF)", "Date", ""].map(h => (
                      <th key={h} className="px-4 py-3 text-left text-xs font-bold text-custom-500 uppercase tracking-wider whitespace-nowrap">{h}</th>
                    ))}
                  </tr>
                </thead>
                <tbody className="divide-y divide-custom-100">
                  {withdrawals.map((w, idx) => (
                    <tr key={w.id} onClick={() => setSelected(w)} className="hover:bg-custom-50 cursor-pointer transition-colors">
                      <td className="px-4 py-3 text-xs font-bold text-custom-500 whitespace-nowrap">
                        {(page - 1) * PAGE_SIZE + idx + 1}
                      </td>
                      <td className="px-4 py-3 font-bold text-primary-500 whitespace-nowrap">{w.title}</td>
                      <td className="px-4 py-3 text-secondary-100 max-w-[180px] truncate">{w.description}</td>
                      <td className="px-4 py-3 text-secondary-100 whitespace-nowrap">{w.source}</td>
                      <td className="px-4 py-3 whitespace-nowrap">
                        <p className="text-sm font-semibold text-secondary-100">{w.takenByName}</p>
                        <p className="text-xs text-custom-700">{w.takenByContact}</p>
                      </td>
                      <td className="px-4 py-3 font-bold text-blue-600 whitespace-nowrap">{fmt(Number(w.amount))}</td>
                      <td className="px-4 py-3 text-custom-700 whitespace-nowrap">
                        {new Date(w.withdrawnAt).toLocaleDateString()}
                      </td>
                      <td className="px-4 py-3" onClick={e => e.stopPropagation()}>
                        <button onClick={e => openMenu(e, w.id)}
                          className="p-1.5 rounded-lg hover:bg-custom-100 transition-colors text-custom-700">
                          <HiOutlineDotsHorizontal className="w-4 h-4" />
                        </button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </Card>

        {/* Pagination */}
        {totalPages >= 1 && withdrawals.length > 0 && (
          <div className="flex items-center justify-center gap-2">
            <button onClick={() => setPage(p => Math.max(1, p - 1))} disabled={page === 1}
              className="px-3 py-1.5 rounded-lg border border-custom-300 text-sm font-semibold text-secondary-100 hover:bg-custom-100 disabled:opacity-40 transition-colors">
              ← Prev
            </button>
            <span className="text-sm text-custom-700">Page {page} of {totalPages}</span>
            <button onClick={() => setPage(p => Math.min(totalPages, p + 1))} disabled={page === totalPages}
              className="px-3 py-1.5 rounded-lg border border-custom-300 text-sm font-semibold text-secondary-100 hover:bg-custom-100 disabled:opacity-40 transition-colors">
              Next →
            </button>
          </div>
        )}

        {/* Context menu portal */}
        {openMenuId && menuPos && ReactDOM.createPortal(
          <div ref={menuRef}
            style={{ position: "fixed", top: menuPos.top, right: menuPos.right, zIndex: 9999 }}
            className="w-40 bg-style-600 border border-custom-300 rounded-2xl shadow-xl p-1.5 space-y-0.5">
            {(() => {
              const w = withdrawals.find(x => x.id === openMenuId);
              if (!w) return null;
              return (
                <>
                  <button onClick={() => { setSelected(w); setOpenMenuId(null); }}
                    className="w-full flex items-center gap-2 px-3 py-2 rounded-xl text-sm text-secondary-100 hover:bg-custom-100 transition-colors">
                    View Details
                  </button>
                  <button onClick={() => { setEditing(w); setOpenMenuId(null); }}
                    className="w-full flex items-center gap-2 px-3 py-2 rounded-xl text-sm text-secondary-100 hover:bg-custom-100 transition-colors">
                    <HiOutlinePencil className="w-4 h-4" /> Edit
                  </button>
                </>
              );
            })()}
          </div>,
          document.body
        )}

        {/* Modals */}
        {showInitial && <InitialAmountModal current={currentInitial} onClose={() => setShowInitial(false)} />}
        {showAdd  && <WithdrawalFormModal onClose={() => setShowAdd(false)} />}
        {editing  && <WithdrawalFormModal record={editing} onClose={() => setEditing(null)} />}
        {selected && (
          <DetailModal
            record={selected}
            onClose={() => setSelected(null)}
            onEdit={() => { setEditing(selected); setSelected(null); }}
          />
        )}
      </div>
    </DashboardLayout>
  );
}
