import { useState } from "react";
import {
  HiOutlineRefresh, HiOutlineShoppingCart, HiOutlineCurrencyDollar,
  HiOutlineExclamationCircle, HiOutlinePencil, HiOutlineTrash,
  HiOutlineX, HiOutlineCash, HiOutlineCollection,
} from "react-icons/hi";
import { toast } from "react-toastify";
import { Card } from "../../components/ui";
import {
  useGetBoutiqueSalesQuery,
  useGetBoutiqueStockItemsQuery,
  useUpdateBoutiqueSaleMutation,
  useDeleteBoutiqueSaleMutation,
  useCollectBoutiqueSalePaymentMutation,
  type BoutiqueSale,
  type PaymentStatus,
  type PaymentMethod,
} from "../../store/services/boutiqueStockService";

const paymentStatusColors: Record<string, string> = {
  paid:     "bg-emerald-100 text-emerald-700",
  partial:  "bg-yellow-100 text-yellow-700",
  oncredit: "bg-red-100 text-red-700",
  overpaid: "bg-blue-100 text-blue-700",
};

const paymentMethodLabels: Record<string, string> = {
  cash:     "Cash",
  mobile:   "MoMo",
  bank:     "Bank",
  oncredit: "On Credit",
};

const PAGE_SIZE = 10;
const inputCls = "w-full px-3 py-2 rounded-xl border border-custom-300 bg-style-500 text-secondary-100 text-sm focus:outline-none focus:border-primary-400 transition-colors";

function Pagination({ page, total, onChange }: { page: number; total: number; onChange: (p: number) => void }) {
  const pages = Math.ceil(total / PAGE_SIZE);
  if (pages <= 1) return null;
  return (
    <div className="flex items-center justify-end gap-1 pt-2 pb-1">
      <button disabled={page === 1} onClick={() => onChange(page - 1)}
        className="px-3 py-1.5 rounded-lg border border-custom-300 text-xs font-semibold text-secondary-100 hover:bg-custom-100 disabled:opacity-40 transition-colors">
        Prev
      </button>
      {Array.from({ length: pages }, (_, i) => i + 1).map((p) => (
        <button key={p} onClick={() => onChange(p)}
          className={`w-8 h-8 rounded-lg text-xs font-semibold transition-colors ${p === page ? "bg-primary-500 text-white" : "border border-custom-300 text-secondary-100 hover:bg-custom-100"}`}>
          {p}
        </button>
      ))}
      <button disabled={page === pages} onClick={() => onChange(page + 1)}
        className="px-3 py-1.5 rounded-lg border border-custom-300 text-xs font-semibold text-secondary-100 hover:bg-custom-100 disabled:opacity-40 transition-colors">
        Next
      </button>
    </div>
  );
}

// ─── Collect Payment Modal ────────────────────────────────────────────────────

function CollectPaymentModal({ sale, onClose, onSuccess }: { sale: BoutiqueSale; onClose: () => void; onSuccess: () => void }) {
  const [collect, { isLoading }] = useCollectBoutiqueSalePaymentMutation();
  const [amount, setAmount] = useState("");
  const [method, setMethod] = useState<PaymentMethod>("cash");

  const balanceDue     = Number(sale.balanceDue);
  const amountEntered  = Number(amount) || 0;
  const changeToGive   = amountEntered > balanceDue ? amountEntered - balanceDue : 0;
  const stillRemaining = amountEntered < balanceDue && amountEntered > 0 ? balanceDue - amountEntered : 0;

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!amountEntered || amountEntered <= 0) { toast.error("Enter a valid amount"); return; }
    try {
      await collect({ id: sale.id, amountCollected: amountEntered, paymentMethod: method }).unwrap();
      if (changeToGive > 0) {
        toast.success(`Payment collected — give back ${changeToGive.toLocaleString()} RWF change`, { autoClose: 6000 });
      } else {
        toast.success("Payment collected successfully");
      }
      onSuccess();
    } catch (err: any) {
      toast.error(err?.data?.message ?? "Failed to collect payment");
    }
  };

  return (
    <div className="fixed inset-0 bg-secondary-100/50 z-50 flex items-start justify-center p-4 overflow-y-auto">
      <Card className="!p-6 max-w-md w-full my-8">
        <div className="flex items-center justify-between mb-5">
          <div className="flex items-center gap-2">
            <div className="w-9 h-9 rounded-xl bg-emerald-100 flex items-center justify-center">
              <HiOutlineCollection className="w-5 h-5 text-emerald-600" />
            </div>
            <h3 className="text-lg font-bold text-secondary-100">Collect Payment</h3>
          </div>
          <button onClick={onClose} className="text-custom-700 hover:text-secondary-100">
            <HiOutlineX className="w-6 h-6" />
          </button>
        </div>

        {/* Sale summary */}
        <div className="rounded-xl bg-custom-50 border border-custom-200 p-4 mb-4 space-y-2">
          <p className="text-sm font-semibold text-secondary-100">{sale.stockItem?.itemName ?? "—"}</p>
          <div className="flex items-center justify-between text-xs text-custom-700">
            <span>Total Price</span>
            <span className="font-bold text-secondary-100">{Number(sale.totalPrice).toLocaleString()} RWF</span>
          </div>
          <div className="flex items-center justify-between text-xs text-custom-700">
            <span>Already Paid</span>
            <span className="font-bold text-emerald-600">{Number(sale.amountPaid).toLocaleString()} RWF</span>
          </div>
          <div className="flex items-center justify-between text-xs border-t border-custom-200 pt-2">
            <span className="font-semibold text-red-600">Balance Due</span>
            <span className="font-extrabold text-red-600 text-sm">{balanceDue.toLocaleString()} RWF</span>
          </div>
        </div>

        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label className="block text-xs font-semibold text-secondary-100 mb-1">Amount Received (RWF) *</label>
            <input
              type="number"
              min={1}
              value={amount}
              onChange={(e) => setAmount(e.target.value)}
              placeholder={`e.g. ${balanceDue.toLocaleString()}`}
              className={inputCls}
              autoFocus
            />
          </div>

          <div>
            <label className="block text-xs font-semibold text-secondary-100 mb-1">Payment Method</label>
            <select value={method} onChange={(e) => setMethod(e.target.value as PaymentMethod)} className={inputCls}>
              <option value="cash">Cash</option>
              <option value="mobile">MoMo</option>
              <option value="bank">Bank</option>
            </select>
          </div>

          {/* Live feedback */}
          {stillRemaining > 0 && (
            <div className="flex items-center justify-between px-4 py-2.5 rounded-xl bg-yellow-50 border border-yellow-200">
              <span className="text-xs font-semibold text-yellow-700">Still remaining after this</span>
              <span className="text-sm font-bold text-yellow-700">{stillRemaining.toLocaleString()} RWF</span>
            </div>
          )}
          {amountEntered === balanceDue && amountEntered > 0 && (
            <div className="flex items-center justify-between px-4 py-2.5 rounded-xl bg-emerald-50 border border-emerald-200">
              <span className="text-xs font-semibold text-emerald-700">Exact amount — fully cleared</span>
              <span className="text-sm font-bold text-emerald-600">✓</span>
            </div>
          )}
          {changeToGive > 0 && (
            <div className="flex items-center justify-between px-4 py-3 rounded-xl bg-blue-50 border-2 border-blue-400">
              <span className="text-sm font-bold text-blue-700">💵 Change to give back</span>
              <span className="text-xl font-extrabold text-blue-600">{changeToGive.toLocaleString()} RWF</span>
            </div>
          )}

          <div className="flex gap-3 justify-end pt-2 border-t border-custom-300">
            <button type="button" onClick={onClose}
              className="px-4 py-2 rounded-xl border border-custom-300 text-sm font-semibold text-secondary-100 hover:bg-custom-100 transition-colors">
              Cancel
            </button>
            <button type="submit" disabled={isLoading}
              className="px-4 py-2 rounded-xl bg-emerald-500 text-white text-sm font-semibold hover:bg-emerald-600 disabled:opacity-40 transition-colors">
              {isLoading ? "Processing..." : "Collect Payment"}
            </button>
          </div>
        </form>
      </Card>
    </div>
  );
}

// ─── Edit Sale Modal ──────────────────────────────────────────────────────────

function EditSaleModal({ sale, onClose, onSuccess }: { sale: BoutiqueSale; onClose: () => void; onSuccess: () => void }) {
  const [updateSale, { isLoading }] = useUpdateBoutiqueSaleMutation();
  const [form, setForm] = useState({
    quantity:      String(sale.quantity),
    unitPrice:     String(Number(sale.unitPrice)),
    amountPaid:    String(Number(sale.amountPaid)),
    paymentMethod: sale.paymentMethod as PaymentMethod,
    note:          "",
  });
  const qty        = Number(form.quantity)  || 0;
  const unitPrice  = Number(form.unitPrice) || 0;
  const totalPrice = qty * unitPrice;
  const isOnCredit = form.paymentMethod === "oncredit";

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      await updateSale({
        id: sale.id,
        quantity:      qty       || undefined,
        unitPrice:     unitPrice || undefined,
        amountPaid:    isOnCredit ? 0 : (Number(form.amountPaid) || undefined),
        paymentMethod: form.paymentMethod,
        note:          form.note.trim() || undefined,
      }).unwrap();
      toast.success("Sale updated");
      onSuccess();
    } catch (err: any) {
      toast.error(err?.data?.message ?? "Failed to update sale");
    }
  };

  return (
    <div className="fixed inset-0 bg-secondary-100/50 z-50 flex items-start justify-center p-4 overflow-y-auto">
      <Card className="!p-6 max-w-lg w-full my-8">
        <div className="flex items-center justify-between mb-5">
          <h3 className="text-xl font-bold text-secondary-100">Edit Sale</h3>
          <button onClick={onClose} className="text-custom-700 hover:text-secondary-100"><HiOutlineX className="w-6 h-6" /></button>
        </div>
        <p className="text-xs text-custom-700 mb-4">
          Product: <span className="font-semibold text-secondary-100">{sale.stockItem?.itemName ?? "—"}</span>
        </p>
        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-xs font-semibold text-secondary-100 mb-1">Quantity</label>
              <input type="number" min={1} value={form.quantity}
                onChange={(e) => setForm((p) => ({ ...p, quantity: e.target.value }))} className={inputCls} />
            </div>
            <div>
              <label className="block text-xs font-semibold text-secondary-100 mb-1">Unit Price (RWF)</label>
              <input type="number" min={0} step="0.01" value={form.unitPrice}
                onChange={(e) => setForm((p) => ({ ...p, unitPrice: e.target.value }))} className={inputCls} />
            </div>
          </div>
          {totalPrice > 0 && (
            <div className="flex items-center justify-between px-4 py-2.5 rounded-xl bg-primary-50 border border-primary-200">
              <span className="text-xs font-semibold text-primary-700">Total Price</span>
              <span className="text-sm font-bold text-primary-600">{totalPrice.toLocaleString()} RWF</span>
            </div>
          )}
          <div>
            <label className="block text-xs font-semibold text-secondary-100 mb-1">Payment Method</label>
            <select value={form.paymentMethod}
              onChange={(e) => setForm((p) => ({ ...p, paymentMethod: e.target.value as PaymentMethod, amountPaid: e.target.value === "oncredit" ? "0" : p.amountPaid }))}
              className={inputCls}>
              <option value="cash">Cash</option>
              <option value="mobile">MoMo</option>
              <option value="bank">Bank</option>
              <option value="oncredit">On Credit</option>
            </select>
          </div>
          {!isOnCredit && (
            <div>
              <label className="block text-xs font-semibold text-secondary-100 mb-1">Amount Paid (RWF)</label>
              <input type="number" min={0} value={form.amountPaid}
                onChange={(e) => setForm((p) => ({ ...p, amountPaid: e.target.value }))} className={inputCls} />
            </div>
          )}
          <div>
            <label className="block text-xs font-semibold text-secondary-100 mb-1">Note (optional)</label>
            <input value={form.note} onChange={(e) => setForm((p) => ({ ...p, note: e.target.value }))}
              placeholder="e.g. corrected qty" className={inputCls} />
          </div>
          <div className="flex gap-3 justify-end pt-2 border-t border-custom-300">
            <button type="button" onClick={onClose}
              className="px-4 py-2 rounded-xl border border-custom-300 text-sm font-semibold text-secondary-100 hover:bg-custom-100 transition-colors">Cancel</button>
            <button type="submit" disabled={isLoading}
              className="px-4 py-2 rounded-xl bg-primary-500 text-white text-sm font-semibold hover:bg-primary-600 disabled:opacity-40 transition-colors">
              {isLoading ? "Saving..." : "Save Changes"}
            </button>
          </div>
        </form>
      </Card>
    </div>
  );
}

// ─── Delete Sale Modal ────────────────────────────────────────────────────────

function DeleteSaleModal({ sale, onClose, onSuccess }: { sale: BoutiqueSale; onClose: () => void; onSuccess: () => void }) {
  const [deleteSaleMutation, { isLoading }] = useDeleteBoutiqueSaleMutation();

  const handleDelete = async () => {
    try {
      await deleteSaleMutation(sale.id).unwrap();
      toast.success("Sale deleted — stock restored");
      onSuccess();
    } catch (err: any) {
      toast.error(err?.data?.message ?? "Failed to delete sale");
    }
  };

  return (
    <div className="fixed inset-0 bg-secondary-100/50 z-50 flex items-center justify-center p-4">
      <Card className="!p-6 max-w-sm w-full">
        <div className="flex items-center gap-3 mb-4">
          <div className="w-10 h-10 rounded-xl bg-red-100 flex items-center justify-center flex-shrink-0">
            <HiOutlineTrash className="w-5 h-5 text-red-500" />
          </div>
          <div>
            <h3 className="text-base font-bold text-secondary-100">Delete Sale</h3>
            <p className="text-xs text-custom-700 mt-0.5">Stock will be restored automatically</p>
          </div>
        </div>
        <p className="text-sm text-secondary-100 mb-1">
          Delete sale of <span className="font-semibold">{sale.quantity} {sale.stockItem?.unit ?? ""}</span> of{" "}
          <span className="font-semibold">"{sale.stockItem?.itemName ?? "this item"}"</span>?
        </p>
        <p className="text-xs text-custom-700 mb-5">This cannot be undone.</p>
        <div className="flex gap-3 justify-end">
          <button onClick={onClose}
            className="px-4 py-2 rounded-xl border border-custom-300 text-sm font-semibold text-secondary-100 hover:bg-custom-100 transition-colors">Cancel</button>
          <button onClick={handleDelete} disabled={isLoading}
            className="px-4 py-2 rounded-xl bg-red-500 text-white text-sm font-semibold hover:bg-red-600 disabled:opacity-40 transition-colors">
            {isLoading ? "Deleting..." : "Delete"}
          </button>
        </div>
      </Card>
    </div>
  );
}

// ─── Main Tab ─────────────────────────────────────────────────────────────────

export default function TradedProductsTab() {
  const [statusFilter,   setStatusFilter]   = useState<PaymentStatus | "">("");
  const [itemFilter,     setItemFilter]     = useState("");
  const [from,           setFrom]           = useState("");
  const [to,             setTo]             = useState("");
  const [page,           setPage]           = useState(1);
  const [editTarget,     setEditTarget]     = useState<BoutiqueSale | null>(null);
  const [deleteTarget,   setDeleteTarget]   = useState<BoutiqueSale | null>(null);
  const [collectTarget,  setCollectTarget]  = useState<BoutiqueSale | null>(null);

  const { data: itemsData } = useGetBoutiqueStockItemsQuery({ limit: 200 });
  const stockItems = itemsData?.data ?? [];

  const queryParams = {
    ...(statusFilter ? { paymentStatus: statusFilter } : {}),
    ...(itemFilter   ? { stockItemId: itemFilter }     : {}),
    ...(from         ? { from }                         : {}),
    ...(to           ? { to }                           : {}),
    limit: 500,
  };

  const { data, isLoading, refetch } = useGetBoutiqueSalesQuery(queryParams);
  const allSales: BoutiqueSale[] = data?.data ?? [];
  const paginated = allSales.slice((page - 1) * PAGE_SIZE, page * PAGE_SIZE);

  const totalRevenue = allSales.reduce((s, r) => s + Number(r.amountPaid),  0);
  const totalPending = allSales.reduce((s, r) => s + Number(r.balanceDue),  0);
  const totalQty     = allSales.reduce((s, r) => s + Number(r.quantity),    0);
  const totalChange  = allSales.reduce((s, r) => s + Number(r.changeGiven), 0);

  const byProduct = allSales.reduce<Record<string, { name: string; unit: string; qty: number; revenue: number }>>((acc, sale) => {
    const id = sale.stockItemId;
    const name = sale.stockItem?.itemName ?? "Unknown";
    const unit = sale.stockItem?.unit ?? "";
    if (!acc[id]) acc[id] = { name, unit, qty: 0, revenue: 0 };
    acc[id].qty     += Number(sale.quantity);
    acc[id].revenue += Number(sale.amountPaid);
    return acc;
  }, {});

  const topProducts = Object.values(byProduct).sort((a, b) => b.qty - a.qty).slice(0, 5);
  const pendingCount = allSales.filter((s) => s.paymentStatus === "partial" || s.paymentStatus === "oncredit").length;

  const handleReset = () => { setStatusFilter(""); setItemFilter(""); setFrom(""); setTo(""); setPage(1); };

  return (
    <div className="space-y-5">

      {/* Outstanding balance alert */}
      {!isLoading && pendingCount > 0 && (
        <div className="flex items-center gap-3 px-4 py-3 rounded-xl bg-yellow-50 border border-yellow-300">
          <HiOutlineExclamationCircle className="w-5 h-5 text-yellow-600 flex-shrink-0" />
          <p className="text-sm font-semibold text-yellow-700">
            {pendingCount} sale{pendingCount > 1 ? "s" : ""} with outstanding balance — use the <span className="underline">Collect</span> button to record payment
          </p>
        </div>
      )}

      {/* Filters */}
      <div className="flex flex-wrap items-end gap-3">
        <div className="flex flex-col gap-1 min-w-[160px]">
          <label className="text-[11px] font-semibold text-custom-700 uppercase tracking-wide">Product</label>
          <select value={itemFilter} onChange={(e) => { setItemFilter(e.target.value); setPage(1); }}
            className="px-3 py-2 rounded-xl border border-custom-300 bg-style-500 text-secondary-100 text-sm focus:outline-none focus:border-primary-400 transition-colors">
            <option value="">All Products</option>
            {stockItems.map((i) => <option key={i.id} value={i.id}>{i.itemName}</option>)}
          </select>
        </div>
        <div className="flex flex-col gap-1 min-w-[140px]">
          <label className="text-[11px] font-semibold text-custom-700 uppercase tracking-wide">Payment Status</label>
          <select value={statusFilter} onChange={(e) => { setStatusFilter(e.target.value as PaymentStatus | ""); setPage(1); }}
            className="px-3 py-2 rounded-xl border border-custom-300 bg-style-500 text-secondary-100 text-sm focus:outline-none focus:border-primary-400 transition-colors">
            <option value="">All Statuses</option>
            <option value="paid">Paid</option>
            <option value="partial">Partial</option>
            <option value="oncredit">On Credit</option>
            <option value="overpaid">Overpaid</option>
          </select>
        </div>
        <div className="flex flex-col gap-1">
          <label className="text-[11px] font-semibold text-custom-700 uppercase tracking-wide">From</label>
          <input type="date" value={from} onChange={(e) => { setFrom(e.target.value); setPage(1); }}
            className="px-3 py-2 rounded-xl border border-custom-300 bg-style-500 text-secondary-100 text-sm focus:outline-none focus:border-primary-400 transition-colors" />
        </div>
        <div className="flex flex-col gap-1">
          <label className="text-[11px] font-semibold text-custom-700 uppercase tracking-wide">To</label>
          <input type="date" value={to} onChange={(e) => { setTo(e.target.value); setPage(1); }}
            className="px-3 py-2 rounded-xl border border-custom-300 bg-style-500 text-secondary-100 text-sm focus:outline-none focus:border-primary-400 transition-colors" />
        </div>
        <button onClick={() => refetch()}
          className="p-2 rounded-xl border border-custom-300 hover:bg-custom-100 transition-colors text-custom-700 self-end" title="Refresh">
          <HiOutlineRefresh className={`w-4 h-4 ${isLoading ? "animate-spin" : ""}`} />
        </button>
        {(statusFilter || itemFilter || from || to) && (
          <button onClick={handleReset}
            className="px-3 py-2 rounded-xl border border-custom-300 text-xs font-semibold text-custom-700 hover:bg-custom-100 transition-colors self-end">
            Reset
          </button>
        )}
      </div>

      {/* KPI Cards */}
      <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-5 gap-4">
        <Card className="!p-4 flex flex-col gap-2">
          <div className="flex items-center gap-2">
            <HiOutlineShoppingCart className="w-4 h-4 text-secondary-100" />
            <p className="text-xs text-custom-700">Total Sales</p>
          </div>
          {isLoading ? <div className="h-6 w-16 bg-custom-200 rounded animate-pulse" /> : <p className="text-xl font-bold text-secondary-100">{allSales.length}</p>}
        </Card>
        <Card className="!p-4 flex flex-col gap-2">
          <div className="flex items-center gap-2">
            <HiOutlineShoppingCart className="w-4 h-4 text-indigo-600" />
            <p className="text-xs text-custom-700">Total Qty Sold</p>
          </div>
          {isLoading ? <div className="h-6 w-16 bg-custom-200 rounded animate-pulse" /> : <p className="text-xl font-bold text-indigo-600">{totalQty.toLocaleString()}</p>}
        </Card>
        <Card className="!p-4 flex flex-col gap-2">
          <div className="flex items-center gap-2">
            <HiOutlineCurrencyDollar className="w-4 h-4 text-emerald-600" />
            <p className="text-xs text-custom-700">Revenue (Paid)</p>
          </div>
          {isLoading ? <div className="h-6 w-24 bg-custom-200 rounded animate-pulse" /> : <p className="text-xl font-bold text-emerald-600">{totalRevenue.toLocaleString()} RWF</p>}
        </Card>
        <Card className="!p-4 flex flex-col gap-2">
          <div className="flex items-center gap-2">
            <HiOutlineExclamationCircle className="w-4 h-4 text-red-500" />
            <p className="text-xs text-custom-700">Balance Due</p>
          </div>
          {isLoading ? <div className="h-6 w-24 bg-custom-200 rounded animate-pulse" /> : <p className="text-xl font-bold text-red-500">{totalPending.toLocaleString()} RWF</p>}
        </Card>
        <Card className="!p-4 flex flex-col gap-2 col-span-2 sm:col-span-1">
          <div className="flex items-center gap-2">
            <HiOutlineCash className="w-4 h-4 text-blue-600" />
            <p className="text-xs text-custom-700">Change Given</p>
          </div>
          {isLoading ? <div className="h-6 w-24 bg-custom-200 rounded animate-pulse" /> : <p className="text-xl font-bold text-blue-600">{totalChange.toLocaleString()} RWF</p>}
        </Card>
      </div>

      {/* Top Products */}
      {!isLoading && topProducts.length > 0 && (
        <Card className="!p-4">
          <p className="text-xs font-bold text-secondary-100 uppercase tracking-wide mb-3">Top Traded Products</p>
          <div className="flex flex-wrap gap-2">
            {topProducts.map((p) => (
              <div key={p.name} className="flex items-center gap-2 px-3 py-1.5 rounded-xl bg-indigo-50 border border-indigo-100">
                <span className="text-xs font-semibold text-indigo-800">{p.name}</span>
                <span className="text-xs text-indigo-600 font-bold">{p.qty.toLocaleString()} {p.unit}</span>
              </div>
            ))}
          </div>
        </Card>
      )}

      {/* Sales Table */}
      <Card className="!p-0 overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead className="bg-custom-100 border-b border-custom-300">
              <tr>
                {["Product", "Qty", "Unit Price", "Total", "Paid", "Balance / Change", "Status", "Method", "Sold By", "Date", "Actions"].map((h) => (
                  <th key={h} className="px-3 py-2.5 text-left text-xs font-bold text-secondary-100 uppercase tracking-wide whitespace-nowrap">{h}</th>
                ))}
              </tr>
            </thead>
            <tbody className="divide-y divide-custom-200">
              {isLoading ? (
                <tr><td colSpan={11} className="px-4 py-8 text-center text-custom-700 text-sm">Loading sales...</td></tr>
              ) : paginated.length === 0 ? (
                <tr>
                  <td colSpan={11} className="px-4 py-10 text-center">
                    <HiOutlineShoppingCart className="w-8 h-8 text-custom-400 mx-auto mb-2" />
                    <p className="text-sm text-secondary-100 font-semibold">No sales found</p>
                    <p className="text-xs text-custom-700 mt-1">
                      {statusFilter || itemFilter || from || to ? "Try adjusting the filters" : "Sales will appear here once items are traded"}
                    </p>
                  </td>
                </tr>
              ) : paginated.map((sale) => {
                const hasBalance = (sale.paymentStatus === "partial" || sale.paymentStatus === "oncredit") && Number(sale.balanceDue) > 0;
                const isOverpaid = Number(sale.changeGiven) > 0;
                return (
                  <tr key={sale.id} className="hover:bg-custom-50 transition-colors">
                    <td className="px-3 py-2.5">
                      <p className="text-sm font-semibold text-secondary-100 whitespace-nowrap">{sale.stockItem?.itemName ?? "—"}</p>
                      {sale.stockItem?.category && <p className="text-[10px] text-custom-700">{sale.stockItem.category}</p>}
                    </td>
                    <td className="px-3 py-2.5 text-sm font-bold text-secondary-100 whitespace-nowrap">
                      {sale.quantity} {sale.stockItem?.unit ?? ""}
                    </td>
                    <td className="px-3 py-2.5 text-sm text-secondary-100 whitespace-nowrap">
                      {Number(sale.unitPrice).toLocaleString()} RWF
                    </td>
                    <td className="px-3 py-2.5 text-sm font-semibold text-secondary-100 whitespace-nowrap">
                      {Number(sale.totalPrice).toLocaleString()} RWF
                    </td>
                    <td className="px-3 py-2.5 text-sm text-emerald-600 font-semibold whitespace-nowrap">
                      {Number(sale.amountPaid).toLocaleString()} RWF
                    </td>
                    <td className="px-3 py-2.5 text-sm whitespace-nowrap">
                      {isOverpaid ? (
                        <span className="font-bold text-blue-600">+{Number(sale.changeGiven).toLocaleString()} RWF </span>
                      ) : hasBalance ? (
                        <span className="font-bold text-red-500">{Number(sale.balanceDue).toLocaleString()} RWF</span>
                      ) : (
                        <span className="text-emerald-600 font-semibold text-xs">Cleared</span>
                      )}
                    </td>
                    <td className="px-3 py-2.5">
                      <span className={`text-xs font-semibold px-2 py-0.5 rounded-full capitalize whitespace-nowrap ${paymentStatusColors[sale.paymentStatus] ?? "bg-gray-100 text-gray-600"}`}>
                        {sale.paymentStatus}
                      </span>
                    </td>
                    <td className="px-3 py-2.5 text-xs text-secondary-100 whitespace-nowrap">
                      {paymentMethodLabels[sale.paymentMethod] ?? sale.paymentMethod}
                    </td>
                    <td className="px-3 py-2.5 text-xs text-secondary-100 whitespace-nowrap">
                      {sale.soldBy?.name ?? "—"}
                    </td>
                    <td className="px-3 py-2.5 text-xs text-custom-700 whitespace-nowrap">
                      {new Date(sale.createdAt).toLocaleDateString("en-RW", { day: "2-digit", month: "short", year: "numeric" })}
                    </td>
                    <td className="px-3 py-2.5">
                      <div className="flex items-center gap-1">
                        {/* Collect payment — only for partial/oncredit */}
                        {hasBalance && (
                          <button onClick={() => setCollectTarget(sale)} title="Collect payment"
                            className="p-1.5 rounded-lg bg-emerald-50 text-emerald-600 hover:bg-emerald-100 transition-colors">
                            <HiOutlineCollection className="w-3.5 h-3.5" />
                          </button>
                        )}
                        <button onClick={() => setEditTarget(sale)} title="Edit sale"
                          className="p-1.5 rounded-lg bg-yellow-50 text-yellow-600 hover:bg-yellow-100 transition-colors">
                          <HiOutlinePencil className="w-3.5 h-3.5" />
                        </button>
                        <button onClick={() => setDeleteTarget(sale)} title="Delete sale"
                          className="p-1.5 rounded-lg bg-red-50 text-red-500 hover:bg-red-100 transition-colors">
                          <HiOutlineTrash className="w-3.5 h-3.5" />
                        </button>
                      </div>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
        <div className="px-4 pb-2">
          <Pagination page={page} total={allSales.length} onChange={setPage} />
        </div>
      </Card>

      {collectTarget && (
        <CollectPaymentModal
          sale={collectTarget}
          onClose={() => setCollectTarget(null)}
          onSuccess={() => { setCollectTarget(null); refetch(); }}
        />
      )}
      {editTarget && (
        <EditSaleModal
          sale={editTarget}
          onClose={() => setEditTarget(null)}
          onSuccess={() => { setEditTarget(null); refetch(); }}
        />
      )}
      {deleteTarget && (
        <DeleteSaleModal
          sale={deleteTarget}
          onClose={() => setDeleteTarget(null)}
          onSuccess={() => { setDeleteTarget(null); refetch(); }}
        />
      )}
    </div>
  );
}
