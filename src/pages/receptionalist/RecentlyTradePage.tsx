import { useState, useMemo } from "react";
import {
  HiOutlineEye,
  HiOutlinePencil,
  HiOutlineTrash,
  HiOutlineX,
  HiOutlineRefresh,
  HiOutlineFilter,
  HiOutlineCash,
  HiOutlineSearch,
} from "react-icons/hi";
import { toast } from "react-toastify";
import { DashboardLayout } from "../../components";
import { useGetUnreadCountQuery } from "../../store/services/notificationsService";
import {
  useGetSalesQuery,
  useUpdateSaleMutation,
  useDeleteSaleMutation,
  type BoutiqueSale,
  type PaymentMethod,
} from "../../store/services/boutiqueService";

// ─── Helpers ──────────────────────────────────────────────────────────────────

function fmt(amount: string | number) {
  const n = typeof amount === "string" ? parseFloat(amount) : amount;
  return isNaN(n) ? "0" : n.toLocaleString("en-RW");
}

function toDateStr(d: Date) {
  // Use local date (not UTC) to avoid timezone offset causing wrong day
  const y = d.getFullYear();
  const m = String(d.getMonth() + 1).padStart(2, "0");
  const day = String(d.getDate()).padStart(2, "0");
  return `${y}-${m}-${day}`;
}

type FilterPeriod = "day" | "week" | "month";

function getRangeForPeriod(period: FilterPeriod) {
  const now = new Date();
  if (period === "day") {
    const s = toDateStr(now);
    return { from: s, to: s };
  }
  if (period === "week") {
    const day = now.getDay(); // 0=Sun
    const diffToMon = (day === 0 ? -6 : 1 - day);
    const mon = new Date(now);
    mon.setDate(now.getDate() + diffToMon);
    const sun = new Date(mon);
    sun.setDate(mon.getDate() + 6);
    return { from: toDateStr(mon), to: toDateStr(sun) };
  }
  // month
  const first = new Date(now.getFullYear(), now.getMonth(), 1);
  const last  = new Date(now.getFullYear(), now.getMonth() + 1, 0);
  return { from: toDateStr(first), to: toDateStr(last) };
}

const paymentStatusColor: Record<string, string> = {
  paid:      "bg-emerald-100 text-emerald-700",
  partial:   "bg-yellow-100  text-yellow-700",
  overpaid:  "bg-blue-100    text-blue-700",
};

const methodLabel: Record<PaymentMethod, string> = {
  cash:     "Cash",
  mobile:   "Mobile",
  card:     "Card",
  bank:     "Bank",
  oncredit: "On Credit",
};

// ─── View Modal ───────────────────────────────────────────────────────────────

function ViewSaleModal({ sale, onClose }: { sale: BoutiqueSale; onClose: () => void }) {
  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 p-4">
      <div className="bg-white rounded-2xl shadow-xl w-full max-w-md">
        <div className="flex items-center justify-between p-5 border-b">
          <h3 className="font-bold text-gray-800 text-lg">Sale Details</h3>
          <button onClick={onClose} className="p-1.5 rounded-lg hover:bg-gray-100 text-gray-500">
            <HiOutlineX className="w-5 h-5" />
          </button>
        </div>
        <div className="p-5 space-y-3 text-sm text-gray-700">
          <Row label="Product"        value={sale.product?.name ?? "—"} />
          <Row label="SKU"            value={sale.product?.sku  ?? "—"} />
          <Row label="Quantity"       value={`${sale.quantity} ${sale.product?.unit ?? ""}`} />
          <Row label="Unit Price"     value={`${fmt(sale.unitPrice)} RWF`} />
          <Row label="Total"          value={`${fmt(sale.totalPrice)} RWF`} />
          <Row label="Amount Paid"    value={`${fmt(sale.amountPaid)} RWF`} />
          <Row label="Balance Due"    value={`${fmt(sale.balanceDue)} RWF`} />
          <Row label="Payment"        value={methodLabel[sale.paymentMethod] ?? sale.paymentMethod} />
          <Row label="Status">
            <span className={`px-2 py-0.5 rounded-full text-xs font-semibold ${paymentStatusColor[sale.paymentStatus] ?? ""}`}>
              {sale.paymentStatus}
            </span>
          </Row>
          {sale.customer && (
            <>
              <Row label="Customer"  value={sale.customer.name} />
              <Row label="Phone"     value={sale.customer.phone} />
            </>
          )}
          {sale.note && <Row label="Note" value={sale.note} />}
          <Row label="Sold By"  value={sale.soldBy?.name ?? "—"} />
          <Row label="Date"     value={new Date(sale.createdAt).toLocaleString()} />
        </div>
        <div className="p-4 border-t flex justify-end">
          <button onClick={onClose} className="px-5 py-2 rounded-xl bg-gray-100 text-gray-700 font-semibold hover:bg-gray-200 text-sm">
            Close
          </button>
        </div>
      </div>
    </div>
  );
}

function Row({ label, value, children }: { label: string; value?: string | number; children?: React.ReactNode }) {
  return (
    <div className="flex justify-between gap-4">
      <span className="text-gray-500 font-medium">{label}</span>
      <span className="text-gray-800 font-semibold text-right">{children ?? value}</span>
    </div>
  );
}

// ─── Edit Modal ───────────────────────────────────────────────────────────────

function EditSaleModal({ sale, onClose, onSuccess }: {
  sale: BoutiqueSale;
  onClose: () => void;
  onSuccess: () => void;
}) {
  const unitPrice = parseFloat(String(sale.unitPrice)) || 0;

  const [form, setForm] = useState({
    quantity:      String(sale.quantity),
    amountPaid:    String(sale.amountPaid),
    paymentMethod: sale.paymentMethod as PaymentMethod,
    note:          sale.note ?? "",
  });
  const [updateSale, { isLoading }] = useUpdateSaleMutation();

  const expectedTotal = (parseInt(form.quantity) || 0) * unitPrice;

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    const qty  = parseInt(form.quantity);
    const paid = parseFloat(form.amountPaid);
    if (!qty || qty <= 0)        { toast.error("Enter a valid quantity"); return; }
    if (isNaN(paid) || paid < 0) { toast.error("Enter a valid amount"); return; }
    try {
      await updateSale({
        id:            sale.id,
        quantity:      qty,
        amountPaid:    paid,
        paymentMethod: form.paymentMethod,
        note:          form.note.trim() || undefined,
      }).unwrap();
      toast.success("Sale updated");
      onSuccess();
    } catch {
      toast.error("Failed to update sale");
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 p-4">
      <div className="bg-white rounded-2xl shadow-xl w-full max-w-md">
        <div className="flex items-center justify-between p-5 border-b">
          <h3 className="font-bold text-gray-800 text-lg">Edit Sale</h3>
          <button onClick={onClose} className="p-1.5 rounded-lg hover:bg-gray-100 text-gray-500">
            <HiOutlineX className="w-5 h-5" />
          </button>
        </div>
        <form onSubmit={handleSubmit} className="p-5 space-y-4">
          <p className="text-sm text-gray-500">
            Product: <span className="font-semibold text-gray-800">{sale.product?.name}</span>
            &bull; Unit price: <span className="font-semibold">{fmt(unitPrice)} RWF</span>
          </p>

          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Quantity</label>
              <input
                type="number" min="1"
                value={form.quantity}
                onChange={e => setForm(p => ({ ...p, quantity: e.target.value }))}
                className="w-full border border-gray-300 rounded-xl px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Amount Paid (RWF)</label>
              <input
                type="number" min="0"
                value={form.amountPaid}
                onChange={e => setForm(p => ({ ...p, amountPaid: e.target.value }))}
                className="w-full border border-gray-300 rounded-xl px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
              />
            </div>
          </div>

          {/* Live total feedback */}
          {expectedTotal > 0 && (
            <div className="flex justify-between text-xs px-1">
              <span className="text-gray-500">
                Expected total: <span className="font-bold text-gray-800">{fmt(expectedTotal)} RWF</span>
              </span>
              {parseFloat(form.amountPaid) > 0 && parseFloat(form.amountPaid) < expectedTotal && (
                <span className="text-orange-600 font-semibold">
                  Underpaid by {fmt(expectedTotal - parseFloat(form.amountPaid))} RWF
                </span>
              )}
              {parseFloat(form.amountPaid) > expectedTotal && (
                <span className="text-blue-600 font-semibold">
                  Change: {fmt(parseFloat(form.amountPaid) - expectedTotal)} RWF
                </span>
              )}
            </div>
          )}

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Payment Method</label>
            <select
              value={form.paymentMethod}
              onChange={e => setForm(p => ({ ...p, paymentMethod: e.target.value as PaymentMethod }))}
              className="w-full border border-gray-300 rounded-xl px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
            >
              <option value="cash">Cash</option>
              <option value="mobile">Mobile</option>
              <option value="card">Card</option>
              <option value="bank">Bank</option>
            </select>
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Note (optional)</label>
            <textarea
              rows={2}
              value={form.note}
              onChange={e => setForm(p => ({ ...p, note: e.target.value }))}
              className="w-full border border-gray-300 rounded-xl px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 resize-none"
            />
          </div>
          <div className="flex gap-3 pt-1">
            <button type="button" onClick={onClose} className="flex-1 py-2.5 rounded-xl border border-gray-300 text-gray-700 font-semibold text-sm hover:bg-gray-50">
              Cancel
            </button>
            <button type="submit" disabled={isLoading} className="flex-1 py-2.5 rounded-xl bg-blue-600 text-white font-semibold text-sm hover:bg-blue-700 disabled:opacity-60">
              {isLoading ? "Saving…" : "Save Changes"}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}

// ─── Confirm Delete Modal ─────────────────────────────────────────────────────

function ConfirmDeleteModal({ sale, onClose, onSuccess }: {
  sale: BoutiqueSale;
  onClose: () => void;
  onSuccess: () => void;
}) {
  const [deleteSale, { isLoading }] = useDeleteSaleMutation();

  const handleDelete = async () => {
    try {
      await deleteSale(sale.id).unwrap();
      toast.success("Sale deleted and stock restored");
      onSuccess();
    } catch {
      toast.error("Failed to delete sale");
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 p-4">
      <div className="bg-white rounded-2xl shadow-xl w-full max-w-sm">
        <div className="p-6 text-center space-y-3">
          <div className="w-14 h-14 bg-red-100 rounded-full flex items-center justify-center mx-auto">
            <HiOutlineTrash className="w-7 h-7 text-red-500" />
          </div>
          <h3 className="font-bold text-gray-800 text-lg">Delete Sale?</h3>
          <p className="text-sm text-gray-500">
            This will permanently delete the sale of <span className="font-semibold text-gray-700">{sale.product?.name}</span> and automatically restore the stock.
          </p>
        </div>
        <div className="flex gap-3 p-5 border-t">
          <button onClick={onClose} className="flex-1 py-2.5 rounded-xl border border-gray-300 text-gray-700 font-semibold text-sm hover:bg-gray-50">
            Cancel
          </button>
          <button onClick={handleDelete} disabled={isLoading} className="flex-1 py-2.5 rounded-xl bg-red-600 text-white font-semibold text-sm hover:bg-red-700 disabled:opacity-60">
            {isLoading ? "Deleting…" : "Yes, Delete"}
          </button>
        </div>
      </div>
    </div>
  );
}

// ─── Main Page ────────────────────────────────────────────────────────────────

export default function RecentlyTradePage() {
  const { data: unreadCount = 0 } = useGetUnreadCountQuery();

  const [period, setPeriod] = useState<FilterPeriod>("day");
  const [search, setSearch] = useState("");

  const { from, to } = getRangeForPeriod(period);

  const { data, isLoading, isFetching, refetch } = useGetSalesQuery(
    { from, to },
    { refetchOnMountOrArgChange: true }
  );
  const sales = data?.sales ?? [];

  const filtered = useMemo(() => {
    if (!search.trim()) return sales;
    const q = search.toLowerCase();
    return sales.filter(s =>
      s.product?.name?.toLowerCase().includes(q) ||
      s.product?.sku?.toLowerCase().includes(q)  ||
      s.customer?.name?.toLowerCase().includes(q)
    );
  }, [sales, search]);

  const [viewing,  setViewing]  = useState<BoutiqueSale | null>(null);
  const [editing,  setEditing]  = useState<BoutiqueSale | null>(null);
  const [deleting, setDeleting] = useState<BoutiqueSale | null>(null);

  const periodButtons: { label: string; value: FilterPeriod }[] = [
    { label: "Today", value: "day"   },
    { label: "Week",  value: "week"  },
    { label: "Month", value: "month" },
  ];

  const totalRevenue = filtered.reduce((sum, s) => sum + parseFloat(String(s.amountPaid)), 0);

  return (
    <DashboardLayout userRole="receptionist" notificationCount={unreadCount}>
      <div className="p-4 md:p-6 space-y-5">
        {/* Header */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
          <div>
            <h1 className="text-2xl font-bold text-gray-800">Recently Traded</h1>
            <p className="text-sm text-gray-500 mt-0.5">View and manage your boutique sales</p>
          </div>
          <button
            onClick={() => refetch()}
            className="flex items-center gap-2 px-4 py-2 rounded-xl border border-gray-200 text-gray-600 hover:bg-gray-50 text-sm font-medium"
          >
            <HiOutlineRefresh className={`w-4 h-4 ${isFetching ? "animate-spin" : ""}`} />
            Refresh
          </button>
        </div>

        {/* Filter bar */}
        <div className="bg-white rounded-2xl border border-gray-200 p-4 space-y-3">
          <div className="flex items-center gap-2 flex-wrap">
            <HiOutlineFilter className="w-4 h-4 text-gray-400 flex-shrink-0" />
            <span className="text-sm font-medium text-gray-600">Filter by:</span>
            {periodButtons.map(btn => (
              <button
                key={btn.value}
                onClick={() => setPeriod(btn.value)}
                className={`px-3 py-1.5 rounded-xl text-sm font-semibold transition-colors ${
                  period === btn.value
                    ? "bg-blue-600 text-white"
                    : "bg-gray-100 text-gray-600 hover:bg-gray-200"
                }`}
              >
                {btn.label}
              </button>
            ))}
          </div>

          <div className="flex items-center gap-2 border border-gray-200 rounded-xl px-3 py-2 max-w-xs">
            <HiOutlineSearch className="w-4 h-4 text-gray-400 flex-shrink-0" />
            <input
              type="text"
              placeholder="Search product or customer…"
              value={search}
              onChange={e => setSearch(e.target.value)}
              className="flex-1 text-sm outline-none text-gray-700 placeholder-gray-400"
            />
            {search && (
              <button onClick={() => setSearch("")}><HiOutlineX className="w-4 h-4 text-gray-400" /></button>
            )}
          </div>
        </div>

        {/* Summary card */}
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
          <div className="bg-white rounded-2xl border border-gray-200 p-4">
            <p className="text-xs text-gray-500 font-medium uppercase tracking-wider">Transactions</p>
            <p className="text-2xl font-bold text-gray-800 mt-1">{filtered.length}</p>
          </div>
          <div className="bg-white rounded-2xl border border-gray-200 p-4">
            <p className="text-xs text-gray-500 font-medium uppercase tracking-wider">Total Collected</p>
            <p className="text-2xl font-bold text-emerald-600 mt-1">{fmt(totalRevenue)} RWF</p>
          </div>
          <div className="bg-white rounded-2xl border border-gray-200 p-4">
            <p className="text-xs text-gray-500 font-medium uppercase tracking-wider">Period</p>
            <p className="text-sm font-semibold text-gray-700 mt-1">
              {from === to ? from : `${from} → ${to}`}
            </p>
          </div>
        </div>

        {/* Table */}
        <div className="bg-white rounded-2xl border border-gray-200 overflow-hidden">
          {isLoading ? (
            <div className="flex items-center justify-center h-48 text-gray-500 text-sm">
              <HiOutlineRefresh className="animate-spin w-5 h-5 mr-2" /> Loading sales…
            </div>
          ) : filtered.length === 0 ? (
            <div className="flex flex-col items-center justify-center h-48 text-gray-400 gap-2">
              <HiOutlineCash className="w-10 h-10" />
              <p className="text-sm font-medium">No trades found for this period</p>
            </div>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full text-sm">
                <thead>
                  <tr className="bg-gray-50 text-xs text-gray-500 uppercase tracking-wider border-b border-gray-200">
                    <th className="text-left px-4 py-3 font-semibold">Product</th>
                    <th className="text-left px-4 py-3 font-semibold">Qty</th>
                    <th className="text-left px-4 py-3 font-semibold">Total</th>
                    <th className="text-left px-4 py-3 font-semibold">Paid</th>
                    <th className="text-left px-4 py-3 font-semibold">Method</th>
                    <th className="text-left px-4 py-3 font-semibold">Status</th>
                    <th className="text-left px-4 py-3 font-semibold">Customer</th>
                    <th className="text-left px-4 py-3 font-semibold">Date</th>
                    <th className="text-right px-4 py-3 font-semibold">Actions</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-100">
                  {filtered.map(sale => (
                    <tr key={sale.id} className="hover:bg-gray-50 transition-colors">
                      <td className="px-4 py-3">
                        <p className="font-semibold text-gray-800">{sale.product?.name ?? "—"}</p>
                        <p className="text-xs text-gray-400">{sale.product?.sku ?? ""}</p>
                      </td>
                      <td className="px-4 py-3 text-gray-700">
                        {sale.quantity} <span className="text-gray-400 text-xs">{sale.product?.unit}</span>
                      </td>
                      <td className="px-4 py-3 font-medium text-gray-800">{fmt(sale.totalPrice)} RWF</td>
                      <td className="px-4 py-3 font-medium text-emerald-600">{fmt(sale.amountPaid)} RWF</td>
                      <td className="px-4 py-3 text-gray-600">{methodLabel[sale.paymentMethod] ?? sale.paymentMethod}</td>
                      <td className="px-4 py-3">
                        <span className={`px-2.5 py-1 rounded-full text-xs font-semibold ${paymentStatusColor[sale.paymentStatus] ?? "bg-gray-100 text-gray-600"}`}>
                          {sale.paymentStatus}
                        </span>
                      </td>
                      <td className="px-4 py-3 text-gray-600">{sale.customer?.name ?? <span className="text-gray-300">—</span>}</td>
                      <td className="px-4 py-3 text-gray-500 whitespace-nowrap">
                        {new Date(sale.createdAt).toLocaleDateString()}
                      </td>
                      <td className="px-4 py-3">
                        <div className="flex items-center justify-end gap-1">
                          <button
                            onClick={() => setViewing(sale)}
                            title="View"
                            className="p-1.5 rounded-lg hover:bg-blue-50 text-blue-500 transition-colors"
                          >
                            <HiOutlineEye className="w-4 h-4" />
                          </button>
                          <button
                            onClick={() => setEditing(sale)}
                            title="Edit"
                            className="p-1.5 rounded-lg hover:bg-amber-50 text-amber-500 transition-colors"
                          >
                            <HiOutlinePencil className="w-4 h-4" />
                          </button>
                          <button
                            onClick={() => setDeleting(sale)}
                            title="Delete"
                            className="p-1.5 rounded-lg hover:bg-red-50 text-red-500 transition-colors"
                          >
                            <HiOutlineTrash className="w-4 h-4" />
                          </button>
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </div>
      </div>

      {/* Modals */}
      {viewing  && <ViewSaleModal    sale={viewing}  onClose={() => setViewing(null)} />}
      {editing  && <EditSaleModal    sale={editing}  onClose={() => setEditing(null)}  onSuccess={() => setEditing(null)} />}
      {deleting && <ConfirmDeleteModal sale={deleting} onClose={() => setDeleting(null)} onSuccess={() => setDeleting(null)} />}
    </DashboardLayout>
  );
}
