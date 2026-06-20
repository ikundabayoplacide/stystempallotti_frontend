import { useState } from "react";
import {
  HiOutlineCheckCircle,
  HiOutlineClock,
  HiOutlineCurrencyDollar,
  HiOutlineRefresh,
  HiOutlineSearch,
  HiOutlineX,
  HiOutlineCash,
  HiOutlinePlus,
} from "react-icons/hi";
import { toast } from "react-toastify";
import { DashboardLayout } from "../../components";
import { Card } from "../../components/ui";
import {
  useGetDebtsQuery,
  useGetRecoveryRecordsQuery,
  useRecordRecoveryMutation,
  type DebtItem,
  type PaymentMethod,
} from "../../store/services/recoveryService";
import { useAuth } from "../../context/AuthContext";

// ─── Helpers ──────────────────────────────────────────────────────────────────

const PAYMENT_METHODS: { value: PaymentMethod; label: string }[] = [
  { value: "CASH",          label: "Cash" },
  { value: "MOBILE_MONEY",  label: "Mobile Money" },
  { value: "BANK_TRANSFER", label: "Bank Transfer" },
  { value: "CARD",          label: "Card" },
];

const pmColor: Record<string, string> = {
  CASH:          "bg-emerald-100 text-emerald-700",
  MOBILE_MONEY:  "bg-yellow-100 text-yellow-700",
  BANK_TRANSFER: "bg-blue-100 text-blue-700",
  CARD:          "bg-purple-100 text-purple-700",
};

// ─── Record Recovery Modal ────────────────────────────────────────────────────

function RecordModal({ onClose }: { onClose: () => void }) {
  const { data: debts = [], isLoading: debtsLoading } = useGetDebtsQuery(undefined, { refetchOnMountOrArgChange: true });

  const [selectedDebt, setSelectedDebt] = useState<DebtItem | null>(null);
  const [debtSearch, setDebtSearch]     = useState("");
  const [debtTypeFilter, setDebtTypeFilter] = useState<"all" | "unpaid" | "partial">("all");
  const [amount, setAmount]             = useState("");
  const [method, setMethod]             = useState<PaymentMethod>("CASH");
  const [note, setNote]                 = useState("");
  const [contactedAt, setContactedAt]   = useState(new Date().toISOString().split("T")[0]);
  const [recordRecovery, { isLoading }] = useRecordRecoveryMutation();

  const filteredDebts = debts.filter((d) => {
    const q = debtSearch.trim().toLowerCase();
    const matchSearch = !q
      || d.jobNumber.toLowerCase().includes(q)
      || d.customer.name.toLowerCase().includes(q)
      || (d.customer.company ?? "").toLowerCase().includes(q);
    const matchType = debtTypeFilter === "all" || d.debtType === debtTypeFilter;
    return matchSearch && matchType;
  });

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedDebt) { toast.error("Select a job first"); return; }
    const amt = parseFloat(amount);
    if (!amt || amt <= 0) { toast.error("Enter a valid amount"); return; }
    if (amt > selectedDebt.balanceDue) {
      toast.error(`Cannot exceed balance: ${selectedDebt.balanceDue.toLocaleString()} RWF`);
      return;
    }
    try {
      await recordRecovery({
        jobId: selectedDebt.jobId,
        amountRecovered: amt,
        paymentMethod: method,
        note: note.trim() || undefined,
        contactedAt,
      }).unwrap();
      toast.success("Recovery recorded successfully");
      onClose();
    } catch (err: any) {
      toast.error(err?.data?.message ?? "Failed to record recovery");
    }
  };

  const inputCls = "w-full px-3 py-2 rounded-xl border border-custom-300 bg-style-500 text-secondary-100 text-sm focus:outline-none focus:border-primary-400 transition-colors";

  return (
    <div className="fixed inset-0 bg-secondary-100/50 z-50 flex items-start justify-center p-4 overflow-y-auto">
      <Card className="!p-6 max-w-lg w-full my-8">
        <div className="flex items-center justify-between mb-5">
          <div>
            <h3 className="text-lg font-bold text-secondary-100">Record Recovery</h3>
            <p className="text-xs text-custom-700 mt-0.5">Select a debtor and record the payment received</p>
          </div>
          <button onClick={onClose} className="text-custom-700 hover:text-secondary-100">
            <HiOutlineX className="w-5 h-5" />
          </button>
        </div>

        <form onSubmit={handleSubmit} className="space-y-4">

          {/* Step 1 — pick job */}
          <div>
            <label className="block text-xs font-semibold text-secondary-100 mb-1">
              Select Debtor / Job *
            </label>
            {selectedDebt ? (
              /* Selected — show summary card with clear button */
              <div className="flex items-start gap-3 px-3 py-3 rounded-xl bg-primary-50 border border-primary-300">
                <div className="flex-1 min-w-0">
                  <p className="text-sm font-bold text-secondary-100">
                    #{selectedDebt.jobNumber} — {selectedDebt.customer.name}
                  </p>
                  {selectedDebt.customer.phone && (
                    <p className="text-xs text-custom-700">{selectedDebt.customer.phone}</p>
                  )}
                  <div className="flex gap-3 mt-1 text-xs">
                    <span className="text-custom-700">Total: <span className="font-bold">{Number(selectedDebt.totalAmount).toLocaleString()} RWF</span></span>
                    <span className="text-custom-700">Paid: <span className="font-bold text-emerald-600">{Number(selectedDebt.amountPaid).toLocaleString()} RWF</span></span>
                    <span className="text-custom-700">Owes: <span className="font-bold text-red-600">{Number(selectedDebt.balanceDue).toLocaleString()} RWF</span></span>
                  </div>
                </div>
                <button type="button" onClick={() => { setSelectedDebt(null); setAmount(""); setDebtSearch(""); }}
                  className="text-custom-700 hover:text-secondary-100 flex-shrink-0">
                  <HiOutlineX className="w-4 h-4" />
                </button>
              </div>
            ) : (
              /* Not selected — search + list */
              <div className="space-y-2">
                {/* Type filter tabs */}
                <div className="flex gap-1 bg-custom-100 p-1 rounded-xl w-fit">
                  {(["all", "unpaid", "partial"] as const).map((f) => {
                    const count = f === "all" ? debts.length : debts.filter((d) => d.debtType === f).length;
                    return (
                      <button key={f} type="button" onClick={() => setDebtTypeFilter(f)}
                        className={`px-3 py-1 rounded-lg text-xs font-semibold transition-colors ${
                          debtTypeFilter === f ? "bg-primary-500 text-white shadow-sm" : "text-custom-700 hover:text-secondary-100"
                        }`}>
                        {f === "all" ? "All" : f === "unpaid" ? "Unpaid" : "Partial Paid"}
                        <span className="ml-1 opacity-70">({count})</span>
                      </button>
                    );
                  })}
                </div>
                <div className="relative">
                  <HiOutlineSearch className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-custom-700" />
                  <input
                    type="text" value={debtSearch}
                    onChange={(e) => setDebtSearch(e.target.value)}
                    placeholder="Search job #, customer name, company..."
                    className="w-full pl-9 pr-4 py-2 rounded-xl border border-custom-300 bg-style-500 text-secondary-100 text-sm focus:outline-none focus:border-primary-400 transition-colors"
                  />
                </div>
                <div className="max-h-48 overflow-y-auto rounded-xl border border-custom-300 divide-y divide-custom-200">
                  {debtsLoading ? (
                    <p className="px-4 py-3 text-xs text-custom-700">Loading...</p>
                  ) : filteredDebts.length === 0 ? (
                    <p className="px-4 py-3 text-xs text-custom-700">No outstanding debts found</p>
                  ) : filteredDebts.map((d) => (
                    <button
                      key={d.jobId} type="button"
                      onClick={() => { setSelectedDebt(d); setAmount(String(d.balanceDue)); }}
                      className="w-full flex items-start justify-between px-3 py-2.5 hover:bg-custom-50 transition-colors text-left"
                    >
                      <div>
                        <p className="text-xs font-bold text-primary-500">#{d.jobNumber}</p>
                        <p className="text-sm font-semibold text-secondary-100">{d.customer.name}</p>
                        {d.customer.company && <p className="text-xs text-custom-400">{d.customer.company}</p>}
                      </div>
                      <div className="text-right flex-shrink-0">
                        <p className="text-xs font-bold text-red-600">{Number(d.balanceDue).toLocaleString()} RWF</p>
                        <span className={`text-xs font-bold px-1.5 py-0.5 rounded-full ${d.debtType === "unpaid" ? "bg-red-100 text-red-700" : "bg-orange-100 text-orange-700"}`}>
                          {d.debtType}
                        </span>
                      </div>
                    </button>
                  ))}
                </div>
              </div>
            )}
          </div>

          {/* Step 2 — payment details (only when debt selected) */}
          {selectedDebt && (
            <>
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-semibold text-secondary-100 mb-1">Amount Recovered (RWF) *</label>
                  <input type="number" min={1} max={selectedDebt.balanceDue} value={amount}
                    onChange={(e) => setAmount(e.target.value)} className={inputCls} />
                </div>
                <div>
                  <label className="block text-xs font-semibold text-secondary-100 mb-1">Date Contacted *</label>
                  <input type="date" value={contactedAt}
                    onChange={(e) => setContactedAt(e.target.value)} className={inputCls} />
                </div>
              </div>

              <div>
                <label className="block text-xs font-semibold text-secondary-100 mb-2">Payment Method *</label>
                <div className="grid grid-cols-2 gap-2">
                  {PAYMENT_METHODS.map((m) => (
                    <button key={m.value} type="button" onClick={() => setMethod(m.value)}
                      className={`py-2 px-3 rounded-xl border-2 text-xs font-semibold transition-all ${
                        method === m.value
                          ? "border-primary-500 bg-primary-50 text-primary-700"
                          : "border-custom-300 text-custom-700 hover:border-primary-300"
                      }`}>{m.label}</button>
                  ))}
                </div>
              </div>

              <div>
                <label className="block text-xs font-semibold text-secondary-100 mb-1">
                  Note <span className="font-normal text-custom-700">(optional)</span>
                </label>
                <input value={note} onChange={(e) => setNote(e.target.value)}
                  placeholder="e.g. Customer came in person" className={inputCls} />
              </div>
            </>
          )}

          <div className="flex gap-3 pt-2 border-t border-custom-300">
            <button type="button" onClick={onClose}
              className="flex-1 px-4 py-2 rounded-xl border border-custom-300 text-sm font-semibold text-secondary-100 hover:bg-custom-100 transition-colors">
              Cancel
            </button>
            <button type="submit" disabled={isLoading || !selectedDebt}
              className="flex-1 flex items-center justify-center gap-2 px-4 py-2 rounded-xl bg-primary-500 text-white text-sm font-semibold hover:bg-primary-600 transition-colors disabled:opacity-40">
              <HiOutlineCash className="w-4 h-4" />
              {isLoading ? "Saving..." : "Record Recovery"}
            </button>
          </div>
        </form>
      </Card>
    </div>
  );
}

// ─── Main Page ────────────────────────────────────────────────────────────────

export default function Accountant2RecoveryPage() {
  const { userRole, userName } = useAuth();
  const [showModal, setShowModal] = useState(false);
  const [search, setSearch]       = useState("");

  const { data: records = [], isLoading, refetch } = useGetRecoveryRecordsQuery(undefined, { refetchOnMountOrArgChange: true });
  const { data: debts = [] } = useGetDebtsQuery(undefined, { refetchOnMountOrArgChange: true });

  // Stats — partial count comes from outstanding debts (jobs with partial prior payment)
  const totalRecovered  = records.reduce((s, r) => s + Number(r.amountRecovered), 0);
  const partialDebtors = debts.filter((d) => d.debtType === "partial").length;
  const pendingCount   = records.filter((r) => r.status === "pending").length;

  const filtered = records.filter((r) => {
    const q = search.trim().toLowerCase();
    return !q
      || (r.job?.jobNumber ?? r.jobNumber ?? "").toLowerCase().includes(q)
      || (r.job?.customer?.name ?? "").toLowerCase().includes(q)
      || (r.note ?? "").toLowerCase().includes(q);
  });

  return (
    <DashboardLayout userRole={userRole ?? "accountant"} userName={userName ?? "Accountant"} notificationCount={0}>
      <div className="space-y-6 font-[family-name:var(--font-family-primary)]">

        {/* Header */}
        <div className="flex items-start justify-between gap-4">
          <div>
            <h1 className="text-2xl md:text-3xl font-bold text-secondary-100">Debt Recovery</h1>
            <p className="text-sm text-custom-700 mt-1">Track and record debt recovery payments</p>
          </div>
          <div className="flex items-center gap-2">
            <button onClick={() => refetch()}
              className="p-2 rounded-xl border border-custom-300 hover:bg-custom-100 transition-colors">
              <HiOutlineRefresh className={`w-5 h-5 text-custom-700 ${isLoading ? "animate-spin" : ""}`} />
            </button>
            <button onClick={() => setShowModal(true)}
              className="flex items-center gap-2 px-4 py-2 rounded-xl bg-primary-500 text-white text-sm font-semibold hover:bg-primary-600 transition-colors">
              <HiOutlinePlus className="w-4 h-4" />
              Record Recovery
            </button>
          </div>
        </div>

        {/* Stats */}
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
          <Card className="!p-4">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-xl bg-primary-100 flex items-center justify-center">
                <HiOutlineCurrencyDollar className="w-5 h-5 text-primary-600" />
              </div>
              <div>
                <p className="text-xs text-custom-700">Total Records</p>
                <p className="text-xl font-bold text-secondary-100">{records.length}</p>
              </div>
            </div>
          </Card>
          <Card className="!p-4">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-xl bg-emerald-100 flex items-center justify-center">
                <HiOutlineCheckCircle className="w-5 h-5 text-emerald-600" />
              </div>
              <div>
                <p className="text-xs text-custom-700">Total Recovered</p>
                <p className="text-lg font-bold text-emerald-600">{totalRecovered.toLocaleString()} RWF</p>
              </div>
            </div>
          </Card>
          <Card className="!p-4">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-xl bg-orange-100 flex items-center justify-center">
                <HiOutlineClock className="w-5 h-5 text-orange-600" />
              </div>
              <div>
                <p className="text-xs text-custom-700">Partial Paid (Outstanding)</p>
                <p className="text-xl font-bold text-orange-600">{partialDebtors}</p>
              </div>
            </div>
          </Card>
          <Card className="!p-4">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-xl bg-yellow-100 flex items-center justify-center">
                <HiOutlineClock className="w-5 h-5 text-yellow-600" />
              </div>
              <div>
                <p className="text-xs text-custom-700">Pending</p>
                <p className="text-xl font-bold text-yellow-600">{pendingCount}</p>
              </div>
            </div>
          </Card>
        </div>

        {/* Search */}
        <div className="relative max-w-sm">
          <HiOutlineSearch className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-custom-700" />
          <input
            type="text" value={search} onChange={(e) => setSearch(e.target.value)}
            placeholder="Search by job #, customer, note..."
            className="w-full pl-9 pr-4 py-2 rounded-xl border border-custom-300 bg-style-500 text-secondary-100 text-sm placeholder:text-custom-700 focus:outline-none focus:border-primary-400 transition-colors"
          />
        </div>

        {/* Records table */}
        <Card className="!p-0 overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead className="bg-custom-100 border-b border-custom-300">
                <tr>
                  {["Job #", "Customer", "Job Title", "Amount Recovered", "Method", "Note", "Contacted At", "Status"].map((h) => (
                    <th key={h} className="px-3 py-2.5 text-left text-xs font-bold text-secondary-100 uppercase whitespace-nowrap">{h}</th>
                  ))}
                </tr>
              </thead>
              <tbody className="divide-y divide-custom-200">
                {isLoading ? (
                  <tr><td colSpan={8} className="px-4 py-10 text-center text-custom-700 text-sm">Loading...</td></tr>
                ) : filtered.length === 0 ? (
                  <tr>
                    <td colSpan={8} className="px-4 py-12 text-center">
                      <HiOutlineCurrencyDollar className="w-10 h-10 text-custom-300 mx-auto mb-2" />
                      <p className="text-sm text-custom-700">No recovery records yet</p>
                      <button onClick={() => setShowModal(true)}
                        className="mt-3 px-4 py-2 rounded-xl bg-primary-500 text-white text-xs font-semibold hover:bg-primary-600 transition-colors">
                        Record First Recovery
                      </button>
                    </td>
                  </tr>
                ) : filtered.map((r) => (
                  <tr key={r.id} className="hover:bg-custom-50 transition-colors">
                    <td className="px-3 py-3 text-xs font-mono font-bold text-primary-500">
                      #{r.job?.jobNumber ?? r.jobNumber ?? "—"}
                    </td>
                    <td className="px-3 py-3">
                      <p className="text-sm font-semibold text-secondary-100">
                        {r.customer?.name ?? r.job?.customer?.name ?? "—"}
                      </p>
                      {(r.customer?.phone ?? r.job?.customer?.phone) && (
                        <p className="text-xs text-custom-700">
                          {r.customer?.phone ?? r.job?.customer?.phone}
                        </p>
                      )}
                    </td>
                    <td className="px-3 py-3 text-sm text-secondary-100 max-w-[160px] truncate">
                      {r.job?.title ?? "—"}
                    </td>
                    <td className="px-3 py-3 text-sm font-bold text-emerald-600 whitespace-nowrap">
                      {Number(r.amountRecovered).toLocaleString()} RWF
                    </td>
                    <td className="px-3 py-3">
                      <span className={`text-xs font-bold px-2 py-0.5 rounded-full ${pmColor[r.paymentMethod] ?? "bg-gray-100 text-gray-600"}`}>
                        {r.paymentMethod.replace(/_/g, " ")}
                      </span>
                    </td>
                    <td className="px-3 py-3 text-xs text-custom-700 max-w-[160px] truncate">
                      {r.note ?? <span className="text-custom-400">—</span>}
                    </td>
                    <td className="px-3 py-3 text-xs text-custom-700 whitespace-nowrap">
                      {new Date(r.contactedAt).toLocaleDateString("en-RW", { day: "2-digit", month: "short", year: "numeric" })}
                    </td>
                    <td className="px-3 py-3">
                      <span className={`text-xs font-bold px-2 py-0.5 rounded-full ${
                        r.status === "recovered"    ? "bg-emerald-100 text-emerald-700"
                        : r.status === "partial"    ? "bg-orange-100 text-orange-700"
                        : r.status === "written_off" ? "bg-red-100 text-red-700"
                        : "bg-yellow-100 text-yellow-700"
                      }`}>
                        {r.status === "written_off" ? "Written Off"
                          : r.status.charAt(0).toUpperCase() + r.status.slice(1)}
                      </span>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </Card>
      </div>

      {showModal && <RecordModal onClose={() => setShowModal(false)} />}
    </DashboardLayout>
  );
}
