import { useState } from "react";
import { HiOutlineRefresh, HiOutlineChartBar, HiOutlineLibrary } from "react-icons/hi";
import { Card } from "../../components/ui";
import { useGetSalesQuery } from "../../store/services/boutiqueService";
import { useGetHobeSalesQuery } from "../../store/services/hobeService";

type Period = "day" | "week" | "month" | "year";
const PAGE_SIZE = 8;

function toLocalDateStr(d: Date) {
  const y = d.getFullYear();
  const m = String(d.getMonth() + 1).padStart(2, "0");
  const day = String(d.getDate()).padStart(2, "0");
  return `${y}-${m}-${day}`;
}

function getDateRange(period: Period) {
  const now = new Date();
  const to = `${toLocalDateStr(now)}T23:59:59`;
  let from: Date;
  switch (period) {
    case "day": from = new Date(now.getFullYear(), now.getMonth(), now.getDate()); break;
    case "week": from = new Date(now.getFullYear(), now.getMonth(), now.getDate() - 6); break;
    case "month": from = new Date(now.getFullYear(), now.getMonth(), 1); break;
    default: from = new Date(now.getFullYear(), 0, 1); break;
  }
  return { from: toLocalDateStr(from), to };
}

const PERIODS: { value: Period; label: string }[] = [
  { value: "day", label: "Today" },
  { value: "week", label: "This Week" },
  { value: "month", label: "This Month" },
  { value: "year", label: "This Year" },
];

function PeriodTabs({ value, onChange }: { value: Period; onChange: (p: Period) => void }) {
  return (
    <div className="flex gap-1 bg-custom-100 p-1 rounded-xl w-fit">
      {PERIODS.map((p) => (
        <button key={p.value} onClick={() => onChange(p.value)}
          className={`px-3 py-1.5 rounded-lg text-xs font-semibold transition-colors ${
            value === p.value ? "bg-primary-500 text-white shadow-sm" : "text-custom-700 hover:text-secondary-100"
          }`}>{p.label}</button>
      ))}
    </div>
  );
}

function StatCard({ label, value, sub, color = "text-secondary-100" }: { label: string; value: string | number; sub?: string; color?: string; }) {
  return (
    <Card className="!p-4">
      <p className="text-xs text-custom-700 mb-1">{label}</p>
      <p className={`text-2xl font-bold ${color}`}>{value}</p>
      {sub && <p className="text-xs text-custom-700 mt-0.5">{sub}</p>}
    </Card>
  );
}

function Pagination({ page, totalPages, total, onPage }: { page: number; totalPages: number; total: number; onPage: (n: number) => void; }) {
  if (total <= PAGE_SIZE) return null;
  return (
    <div className="flex items-center justify-between mt-1">
      <p className="text-xs text-custom-700">Showing {(page - 1) * PAGE_SIZE + 1}–{Math.min(page * PAGE_SIZE, total)} of {total}</p>
      <div className="flex items-center gap-1">
        <button onClick={() => onPage(Math.max(1, page - 1))} disabled={page === 1}
          className="px-3 py-1.5 rounded-lg border border-custom-300 text-xs font-semibold text-secondary-100 hover:bg-custom-100 disabled:opacity-40 transition-colors">Prev</button>
        {Array.from({ length: totalPages }, (_, i) => i + 1).map((n) => (
          <button key={n} onClick={() => onPage(n)}
            className={`w-8 h-8 rounded-lg text-xs font-bold transition-colors ${n === page ? "bg-primary-500 text-white" : "border border-custom-300 text-secondary-100 hover:bg-custom-100"}`}>{n}</button>
        ))}
        <button onClick={() => onPage(Math.min(totalPages, page + 1))} disabled={page === totalPages}
          className="px-3 py-1.5 rounded-lg border border-custom-300 text-xs font-semibold text-secondary-100 hover:bg-custom-100 disabled:opacity-40 transition-colors">Next</button>
      </div>
    </div>
  );
}

export default function SalesDashboard() {
  const [active, setActive] = useState<"boutique" | "hobe">("boutique");

  return (
    <div className="space-y-6 font-[family-name:var(--font-family-primary)]">
      <div>
        <div className="flex items-center gap-2 mb-1">
          <HiOutlineChartBar className="w-6 h-6 text-primary-500" />
          <h1 className="text-2xl md:text-3xl font-bold text-secondary-100">Sales</h1>
        </div>
        <p className="text-sm text-custom-700">Admin view Boutique and Hobe sales overview</p>
      </div>

      <div className="flex gap-2 flex-wrap border-b border-custom-200 pb-1">
        <button onClick={() => setActive("boutique")}
          className={`flex items-center gap-2 px-4 py-2 rounded-t-xl text-sm font-semibold transition-colors border-b-2 ${active === "boutique" ? "border-primary-500 text-primary-500 bg-primary-50" : "border-transparent text-custom-700 hover:text-secondary-100 hover:bg-custom-50"}`}>
          <HiOutlineLibrary className={`w-4 h-4 ${active === "boutique" ? "text-primary-500" : "text-pink-500"}`} /> Boutique
        </button>
        <button onClick={() => setActive("hobe")}
          className={`flex items-center gap-2 px-4 py-2 rounded-t-xl text-sm font-semibold transition-colors border-b-2 ${active === "hobe" ? "border-primary-500 text-primary-500 bg-primary-50" : "border-transparent text-custom-700 hover:text-secondary-100 hover:bg-custom-50"}`}>
          <HiOutlineLibrary className={`w-4 h-4 ${active === "hobe" ? "text-primary-500" : "text-blue-500"}`} /> Hobe
        </button>
      </div>

      <div>
        {active === "boutique" ? <BoutiqueTab /> : <HobeTab />}
      </div>
    </div>
  );
}

function BoutiqueTab() {
  const [period, setPeriod] = useState<Period>("day");
  const [page, setPage] = useState(1);
  const [customFrom, setCustomFrom] = useState("");
  const [customTo, setCustomTo] = useState("");
  const [useCustom, setUseCustom] = useState(false);

  const range = useCustom && customFrom && customTo ? { from: customFrom, to: customTo + "T23:59:59" } : getDateRange(period);
  const { data, isLoading, refetch } = useGetSalesQuery({ from: range.from, to: range.to, limit: 500 });
  const sales = data?.sales ?? [];

  const totalPages = Math.max(1, Math.ceil(sales.length / PAGE_SIZE));
  const paginated = sales.slice((page - 1) * PAGE_SIZE, page * PAGE_SIZE);
  const totalQty = sales.reduce((s, r) => s + r.quantity, 0);
  const totalPaid = sales.reduce((s, r) => s + Number(r.amountPaid), 0);
  const totalExpected = sales.reduce((s, r) => s + Number(r.totalPrice ?? r.quantity * Number(r.unitPrice)), 0);

  return (
    <div className="space-y-4">
      <div className="flex items-center gap-3">
        <PeriodTabs value={period} onChange={(p) => { setPeriod(p); setUseCustom(false); setPage(1); }} />
        <div className="flex items-center gap-2 ml-auto">
          <input type="date" value={customFrom} onChange={(e) => { setCustomFrom(e.target.value); setUseCustom(true); setPage(1); }} className="px-2 py-1.5 rounded-lg border border-custom-300 bg-style-500 text-secondary-100 text-xs" />
          <span className="text-xs text-custom-700">to</span>
          <input type="date" value={customTo} min={customFrom} onChange={(e) => { setCustomTo(e.target.value); setUseCustom(true); setPage(1); }} className="px-2 py-1.5 rounded-lg border border-custom-300 bg-style-500 text-secondary-100 text-xs" />
          {useCustom && <button onClick={() => { setCustomFrom(""); setCustomTo(""); setUseCustom(false); setPage(1); }} className="px-2 py-1.5 rounded-lg border border-custom-300 text-xs text-custom-700">Clear</button>}
          <button onClick={() => refetch()} className="p-1.5 rounded-lg border border-custom-300 hover:bg-custom-100">
            <HiOutlineRefresh className={`w-4 h-4 text-custom-700 ${isLoading ? "animate-spin" : ""}`} />
          </button>
        </div>
      </div>

      <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-4">
        <StatCard label="Transactions" value={sales.length} />
        <StatCard label="Units Sold" value={totalQty} />
        <StatCard label="Amount Collected" value={`${totalPaid.toLocaleString()} RWF`} color="text-emerald-600" />
        <StatCard label="Expected Revenue" value={`${totalExpected.toLocaleString()} RWF`} color="text-secondary-100" />
      </div>

      <Card className="!p-0 overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead className="bg-custom-100 border-b border-custom-300">
              <tr>
                {['Product', 'Qty', 'Total', 'Paid', 'Status', 'Method', 'Customer', 'Date'].map((h) => (
                  <th key={h} className="px-3 py-2 text-left text-xs font-bold text-secondary-100 uppercase">{h}</th>
                ))}
              </tr>
            </thead>
            <tbody className="divide-y divide-custom-200">
              {isLoading ? (
                <tr><td colSpan={8} className="px-4 py-8 text-center text-custom-700 text-sm">Loading...</td></tr>
              ) : sales.length === 0 ? (
                <tr><td colSpan={8} className="px-4 py-8 text-center text-custom-700 text-sm">No boutique sales in this period</td></tr>
              ) : paginated.map((s) => (
                <tr key={s.id} className="hover:bg-custom-50 transition-colors">
                  <td className="px-3 py-2.5">
                    <p className="text-sm font-semibold text-secondary-100">{s.product?.name}</p>
                    <p className="text-xs font-mono text-custom-700">{s.product?.sku}</p>
                  </td>
                  <td className="px-3 py-2.5 text-sm text-secondary-100">{s.quantity}</td>
                  <td className="px-3 py-2.5 text-sm text-secondary-100">{Number(s.totalPrice ?? s.quantity * Number(s.unitPrice)).toLocaleString()} RWF</td>
                  <td className="px-3 py-2.5 text-sm font-bold text-emerald-600">{Number(s.amountPaid).toLocaleString()} RWF</td>
                  <td className="px-3 py-2.5 text-xs">{s.paymentStatus ?? 'paid'}</td>
                  <td className="px-3 py-2.5 text-xs">{s.paymentMethod}</td>
                  <td className="px-3 py-2.5 text-sm text-secondary-100">{s.customer?.name ?? 'Walk-in'}</td>
                  <td className="px-3 py-2.5 text-xs text-custom-700">{new Date(s.createdAt).toLocaleDateString('en-RW', { day: '2-digit', month: 'short', year: 'numeric' })}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </Card>

      <Pagination page={page} totalPages={totalPages} total={sales.length} onPage={setPage} />
    </div>
  );
}

function HobeTab() {
  const [period, setPeriod] = useState<Period>("day");
  const [page, setPage] = useState(1);
  const [customFrom, setCustomFrom] = useState("");
  const [customTo, setCustomTo] = useState("");
  const [useCustom, setUseCustom] = useState(false);

  const range = useCustom && customFrom && customTo ? { from: customFrom, to: customTo + "T23:59:59" } : getDateRange(period);
  const { data, isLoading, refetch } = useGetHobeSalesQuery({ from: range.from, to: range.to, limit: 500 });
  const sales = data?.sales ?? [];

  const totalPages = Math.max(1, Math.ceil(sales.length / PAGE_SIZE));
  const paginated = sales.slice((page - 1) * PAGE_SIZE, page * PAGE_SIZE);
  const totalQty = sales.reduce((s, r) => s + r.quantity, 0);
  const totalPaid = sales.reduce((s, r) => s + Number(r.amountPaid), 0);
  const totalExpected = sales.reduce((s, r) => s + Number(r.totalPrice ?? 0), 0);

  return (
    <div className="space-y-4">
      <div className="flex items-center gap-3">
        <PeriodTabs value={period} onChange={(p) => { setPeriod(p); setUseCustom(false); setPage(1); }} />
        <div className="flex items-center gap-2 ml-auto">
          <input type="date" value={customFrom} onChange={(e) => { setCustomFrom(e.target.value); setUseCustom(true); setPage(1); }} className="px-2 py-1.5 rounded-lg border border-custom-300 bg-style-500 text-secondary-100 text-xs" />
          <span className="text-xs text-custom-700">to</span>
          <input type="date" value={customTo} min={customFrom} onChange={(e) => { setCustomTo(e.target.value); setUseCustom(true); setPage(1); }} className="px-2 py-1.5 rounded-lg border border-custom-300 bg-style-500 text-secondary-100 text-xs" />
          {useCustom && <button onClick={() => { setCustomFrom(""); setCustomTo(""); setUseCustom(false); setPage(1); }} className="px-2 py-1.5 rounded-lg border border-custom-300 text-xs text-custom-700">Clear</button>}
          <button onClick={() => refetch()} className="p-1.5 rounded-lg border border-custom-300 hover:bg-custom-100">
            <HiOutlineRefresh className={`w-4 h-4 text-custom-700 ${isLoading ? "animate-spin" : ""}`} />
          </button>
        </div>
      </div>

      <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-4">
        <StatCard label="Transactions" value={sales.length} />
        <StatCard label="Units Sold" value={totalQty} />
        <StatCard label="Amount Collected" value={`${totalPaid.toLocaleString()} RWF`} color="text-emerald-600" />
        <StatCard label="Expected Revenue" value={`${totalExpected.toLocaleString()} RWF`} color="text-secondary-100" />
      </div>

      <Card className="!p-0 overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead className="bg-custom-100 border-b border-custom-300">
              <tr>
                {['Hobe', 'Batch #', 'Qty', 'Total', 'Paid', 'Status', 'Method', 'Customer', 'Date'].map((h) => (
                  <th key={h} className="px-3 py-2 text-left text-xs font-bold text-secondary-100 uppercase">{h}</th>
                ))}
              </tr>
            </thead>
            <tbody className="divide-y divide-custom-200">
              {isLoading ? (
                <tr><td colSpan={9} className="px-4 py-8 text-center text-custom-700 text-sm">Loading...</td></tr>
              ) : sales.length === 0 ? (
                <tr><td colSpan={9} className="px-4 py-8 text-center text-custom-700 text-sm">No Hobe sales in this period</td></tr>
              ) : paginated.map((s) => (
                <tr key={s.id} className="hover:bg-custom-50 transition-colors">
                  <td className="px-3 py-2.5 text-sm font-semibold text-secondary-100">{s.hobe?.nameOfHobe}</td>
                  <td className="px-3 py-2.5 text-xs font-mono text-primary-500">{s.hobe?.hobeNo}</td>
                  <td className="px-3 py-2.5 text-sm text-secondary-100">{s.quantity}</td>
                  <td className="px-3 py-2.5 text-sm text-secondary-100">{Number(s.totalPrice ?? 0).toLocaleString()} RWF</td>
                  <td className="px-3 py-2.5 text-sm font-bold text-emerald-600">{Number(s.amountPaid).toLocaleString()} RWF</td>
                  <td className="px-3 py-2.5 text-xs">{s.paymentStatus ?? 'paid'}</td>
                  <td className="px-3 py-2.5 text-xs">{s.paymentMethod}</td>
                  <td className="px-3 py-2.5 text-sm text-secondary-100">{s.customer?.name ?? 'Walk-in'}</td>
                  <td className="px-3 py-2.5 text-xs text-custom-700">{new Date(s.createdAt).toLocaleDateString('en-RW', { day: '2-digit', month: 'short', year: 'numeric' })}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </Card>

      <Pagination page={page} totalPages={totalPages} total={sales.length} onPage={setPage} />
    </div>
  );
}
