import { useState, useMemo } from "react";
import {
  HiOutlineShoppingBag,
  HiOutlineSearch,
  HiOutlineRefresh,
  HiOutlineDocumentText,
  HiOutlineX,
  HiOutlineFilter,
} from "react-icons/hi";
import DashboardLayout from "../../components/DashboardLayout";
import { Card } from "../../components/ui";
import {
  useGetSalesQuery,
  type BoutiqueSale,
} from "../../store/services/boutiqueService";

// ─── Helpers ──────────────────────────────────────────────────────────────────

function fmt(amount: string | number) {
  const n = typeof amount === "string" ? parseFloat(amount) : amount;
  return isNaN(n) ? "0" : n.toLocaleString("en-RW");
}

function toDateStr(d: Date) {
  const y = d.getFullYear();
  const m = String(d.getMonth() + 1).padStart(2, "0");
  const day = String(d.getDate()).padStart(2, "0");
  return `${y}-${m}-${day}`;
}

type FilterPeriod = "day" | "week" | "month" | "all";

function getRangeForPeriod(period: FilterPeriod): { from?: string; to?: string } {
  const now = new Date();
  if (period === "all") return {};
  if (period === "day") {
    const s = toDateStr(now);
    return { from: s, to: s };
  }
  if (period === "week") {
    const day = now.getDay();
    const diffToMon = day === 0 ? -6 : 1 - day;
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
  paid:     "bg-emerald-100 text-emerald-700",
  partial:  "bg-yellow-100  text-yellow-700",
  overpaid: "bg-blue-100    text-blue-700",
};

// ─── View Detail Modal ────────────────────────────────────────────────────────

function ViewModal({ sale, onClose }: { sale: BoutiqueSale; onClose: () => void }) {
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
          {[
            ["Product",     sale.product?.name ?? "—"],
            ["SKU",         sale.product?.sku  ?? "—"],
            ["Quantity",    `${sale.quantity} ${sale.product?.unit ?? ""}`],
            ["Unit Price",  `${fmt(sale.unitPrice)} RWF`],
            ["Total",       `${fmt(sale.totalPrice)} RWF`],
            ["Amount Paid", `${fmt(sale.amountPaid)} RWF`],
            ["Balance Due", `${fmt(sale.balanceDue)} RWF`],
            ["Payment",     "Cash"],
            ["Sold By",     sale.soldBy?.name ?? "—"],
            ["Date",        new Date(sale.createdAt).toLocaleString()],
          ].map(([label, value]) => (
            <div key={label} className="flex justify-between gap-4">
              <span className="text-gray-500 font-medium">{label}</span>
              <span className="text-gray-800 font-semibold text-right">{value}</span>
            </div>
          ))}
          {sale.customer && (
            <>
              <div className="flex justify-between gap-4">
                <span className="text-gray-500 font-medium">Customer</span>
                <span className="text-gray-800 font-semibold text-right">{sale.customer.name}</span>
              </div>
              <div className="flex justify-between gap-4">
                <span className="text-gray-500 font-medium">Phone</span>
                <span className="text-gray-800 font-semibold text-right">{sale.customer.phone}</span>
              </div>
            </>
          )}
          {sale.note && (
            <div className="flex justify-between gap-4">
              <span className="text-gray-500 font-medium">Note</span>
              <span className="text-gray-800 font-semibold text-right">{sale.note}</span>
            </div>
          )}
          <div className="flex justify-between gap-4">
            <span className="text-gray-500 font-medium">Status</span>
            <span className={`px-2 py-0.5 rounded-full text-xs font-semibold ${paymentStatusColor[sale.paymentStatus] ?? "bg-gray-100 text-gray-600"}`}>
              {sale.paymentStatus}
            </span>
          </div>
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

// ─── Main Page ────────────────────────────────────────────────────────────────

export default function CashierBoutiquePaymentsPage() {
  const [period, setPeriod] = useState<FilterPeriod>("day");
  const [search, setSearch] = useState("");
  const [viewing, setViewing] = useState<BoutiqueSale | null>(null);

  const { from, to } = getRangeForPeriod(period);

  const { data, isLoading, isFetching, refetch } = useGetSalesQuery(
    { from, to },
    { refetchOnMountOrArgChange: true }
  );

  // Filter to cash-only client-side
  const cashSales = useMemo(() => {
    const all = data?.sales ?? [];
    return all.filter((s) => s.paymentMethod === "cash");
  }, [data]);

  const filtered = useMemo(() => {
    if (!search.trim()) return cashSales;
    const q = search.toLowerCase();
    return cashSales.filter(
      (s) =>
        s.product?.name?.toLowerCase().includes(q) ||
        s.product?.sku?.toLowerCase().includes(q) ||
        s.customer?.name?.toLowerCase().includes(q)
    );
  }, [cashSales, search]);

  const totalCollected  = filtered.reduce((sum, s) => sum + parseFloat(String(s.amountPaid)), 0);
  const totalRevenue    = filtered.reduce((sum, s) => sum + parseFloat(String(s.totalPrice)),  0);
  const totalBalance    = filtered.reduce((sum, s) => sum + parseFloat(String(s.balanceDue)),  0);

  const periodButtons: { label: string; value: FilterPeriod }[] = [
    { label: "Today", value: "day"   },
    { label: "Week",  value: "week"  },
    { label: "Month", value: "month" },
    { label: "All",   value: "all"   },
  ];

  return (
    <DashboardLayout>
      <div className="space-y-6 font-[family-name:var(--font-family-primary)]">

        {/* Header */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
          <div>
            <div className="flex items-center gap-2 mb-1">
              <HiOutlineShoppingBag className="w-6 h-6 text-emerald-500" />
              <h1 className="text-2xl md:text-3xl font-bold text-secondary-100">
                Boutique Cash Payments
              </h1>
            </div>
            <p className="text-sm text-custom-700">
              Boutique product trades paid via cash — {filtered.length} record{filtered.length !== 1 ? "s" : ""}
            </p>
          </div>
          <button
            onClick={() => refetch()}
            className="p-2 rounded-xl border border-custom-300 hover:bg-custom-100 transition-colors self-start sm:self-auto"
          >
            <HiOutlineRefresh className={`w-4 h-4 text-custom-700 ${isFetching ? "animate-spin" : ""}`} />
          </button>
        </div>

        {/* KPIs */}
        <div className="grid grid-cols-2 sm:grid-cols-3 gap-3">
          <Card className="!p-4">
            <p className="text-xs text-custom-700">Total Collected</p>
            <p className="text-xl font-bold text-green-600">{fmt(totalCollected)}</p>
            <p className="text-xs text-custom-700">RWF</p>
          </Card>
          <Card className="!p-4">
            <p className="text-xs text-custom-700">Total Expected Revenue</p>
            <p className="text-xl font-bold text-secondary-100">{fmt(totalRevenue)}</p>
            <p className="text-xs text-custom-700">RWF</p>
          </Card>
          <Card className="!p-4 col-span-2 sm:col-span-1">
            <p className="text-xs text-custom-700">Outstanding Balance</p>
            <p className="text-xl font-bold text-red-500">{fmt(totalBalance)}</p>
            <p className="text-xs text-custom-700">RWF</p>
          </Card>
        </div>

        {/* Filters */}
        <div className="flex flex-col sm:flex-row gap-3 items-start sm:items-center">
          <div className="flex items-center gap-2">
            <HiOutlineFilter className="w-4 h-4 text-custom-400" />
            {periodButtons.map((btn) => (
              <button
                key={btn.value}
                onClick={() => setPeriod(btn.value)}
                className={`px-3 py-1.5 rounded-xl text-sm font-semibold transition-colors ${
                  period === btn.value
                    ? "bg-primary-500 text-secondary-200"
                    : "bg-custom-100 text-custom-700 hover:bg-custom-200"
                }`}
              >
                {btn.label}
              </button>
            ))}
          </div>
          <div className="relative max-w-xs w-full sm:w-auto">
            <HiOutlineSearch className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-custom-400" />
            <input
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              placeholder="Search product or customer…"
              className="w-full pl-9 pr-8 py-2 rounded-xl border border-custom-300 bg-style-500 text-secondary-100 text-sm focus:outline-none focus:border-primary-400 transition-colors"
            />
            {search && (
              <button
                onClick={() => setSearch("")}
                className="absolute right-2 top-1/2 -translate-y-1/2"
              >
                <HiOutlineX className="w-4 h-4 text-custom-400" />
              </button>
            )}
          </div>
        </div>

        {/* Table */}
        <Card className="!p-0 overflow-hidden">
          {isLoading ? (
            <div className="space-y-3 p-4">
              {[1, 2, 3, 4, 5].map((i) => (
                <div key={i} className="h-14 bg-custom-100 rounded-xl animate-pulse" />
              ))}
            </div>
          ) : filtered.length === 0 ? (
            <div className="py-16 text-center">
              <HiOutlineDocumentText className="w-10 h-10 text-custom-300 mx-auto mb-2" />
              <p className="text-sm text-custom-700">No cash boutique payments found</p>
            </div>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full text-sm">
                <thead className="bg-custom-50 border-b border-custom-200">
                  <tr>
                    {["Product", "SKU", "Qty", "Total (RWF)", "Paid (RWF)", "Balance (RWF)", "Status", "Customer", "Date", ""].map((h) => (
                      <th
                        key={h}
                        className="px-4 py-3 text-left text-xs font-bold text-custom-500 uppercase tracking-wider whitespace-nowrap"
                      >
                        {h}
                      </th>
                    ))}
                  </tr>
                </thead>
                <tbody className="divide-y divide-custom-100">
                  {filtered.map((sale) => (
                    <tr key={sale.id} className="hover:bg-custom-50 transition-colors">
                      <td className="px-4 py-3 font-semibold text-secondary-100 whitespace-nowrap">
                        {sale.product?.name ?? "—"}
                      </td>
                      <td className="px-4 py-3 text-custom-700 whitespace-nowrap">
                        {sale.product?.sku ?? "—"}
                      </td>
                      <td className="px-4 py-3 text-secondary-100 whitespace-nowrap">
                        {sale.quantity}{" "}
                        <span className="text-custom-500 text-xs">{sale.product?.unit}</span>
                      </td>
                      <td className="px-4 py-3 font-medium text-secondary-100 whitespace-nowrap">
                        {fmt(sale.totalPrice)}
                      </td>
                      <td className="px-4 py-3 font-bold text-green-600 whitespace-nowrap">
                        {fmt(sale.amountPaid)}
                      </td>
                      <td className="px-4 py-3 whitespace-nowrap">
                        {parseFloat(String(sale.balanceDue)) > 0 ? (
                          <span className="font-bold text-red-500">{fmt(sale.balanceDue)}</span>
                        ) : (
                          <span className="text-emerald-600 font-semibold">Cleared</span>
                        )}
                      </td>
                      <td className="px-4 py-3">
                        <span
                          className={`text-xs font-bold px-2.5 py-1 rounded-full ${
                            paymentStatusColor[sale.paymentStatus] ?? "bg-gray-100 text-gray-600"
                          }`}
                        >
                          {sale.paymentStatus}
                        </span>
                      </td>
                      <td className="px-4 py-3 text-custom-700 whitespace-nowrap">
                        {sale.customer?.name ?? "—"}
                      </td>
                      <td className="px-4 py-3 text-custom-700 whitespace-nowrap">
                        {new Date(sale.createdAt).toLocaleDateString()}
                      </td>
                      <td className="px-4 py-3">
                        <button
                          onClick={() => setViewing(sale)}
                          className="text-xs font-semibold text-primary-500 hover:underline whitespace-nowrap"
                        >
                          View
                        </button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </Card>
      </div>

      {viewing && <ViewModal sale={viewing} onClose={() => setViewing(null)} />}
    </DashboardLayout>
  );
}
