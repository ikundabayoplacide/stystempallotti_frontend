import {
  HiOutlineHome,
  HiOutlineCube,
  HiOutlineCurrencyDollar,
  HiOutlineExclamationCircle,
  HiOutlineCheckCircle,
  HiOutlineClipboardList,
  HiOutlineRefresh,
  HiOutlineCash,
} from "react-icons/hi";
import { DashboardLayout } from "../../components";
import { Card } from "../../components/ui";
import { useGetHobesQuery, useGetHobeSalesQuery } from "../../store/services/hobeService";
import { useNavigate } from "react-router-dom";

const statusConfig: Record<string, { label: string; color: string; icon: React.ReactNode }> = {
  active:    { label: "Active",    color: "bg-emerald-100 text-emerald-700", icon: <HiOutlineCheckCircle className="w-3.5 h-3.5" /> },
  expired:   { label: "Expired",   color: "bg-red-100 text-red-600",         icon: <HiOutlineExclamationCircle className="w-3.5 h-3.5" /> },
  "sold-out":{ label: "Sold Out",  color: "bg-gray-100 text-gray-500",       icon: <HiOutlineCube className="w-3.5 h-3.5" /> },
};

function StatCard({ label, value, sub, color = "text-secondary-100", icon: Icon }: {
  label: string; value: string | number; sub?: string; color?: string;
  icon: React.ElementType;
}) {
  return (
    <Card className="!p-5">
      <div className="flex items-start justify-between">
        <div>
          <p className="text-xs text-custom-700 mb-1">{label}</p>
          <p className={`text-2xl font-bold ${color}`}>{value}</p>
          {sub && <p className="text-xs text-custom-700 mt-1">{sub}</p>}
        </div>
        <div className="w-10 h-10 rounded-xl bg-custom-100 flex items-center justify-center flex-shrink-0">
          <Icon className="w-5 h-5 text-custom-700" />
        </div>
      </div>
    </Card>
  );
}

export default function HobeDashboard() {
  const navigate = useNavigate();
  const { data: hobesData, isLoading: hobesLoading, refetch } = useGetHobesQuery();
  const { data: salesData, isLoading: salesLoading } = useGetHobeSalesQuery({ limit: 5 });

  const hobes = hobesData?.hobes ?? [];
  const recentSales = salesData?.sales ?? [];
  const isLoading = hobesLoading || salesLoading;

  // ── Derived stats ──────────────────────────────────────────────────────────
  const totalQtyInShop  = hobes.reduce((s, h) => s + h.qtyRemains, 0);
  const totalQtySold    = hobes.reduce((s, h) => s + h.qtySold, 0);
  const totalBatches    = hobes.length;
  const activeBatches   = hobes.filter((h) => h.status === "active").length;
  const expiredBatches  = hobes.filter((h) => h.status === "expired").length;
  const soldOutBatches  = hobes.filter((h) => h.status === "sold-out").length;

  const totalRevenue = recentSales.reduce((s, r) => s + Number(r.amountPaid), 0);

  return (
    <DashboardLayout userRole="hobe">
      <div className="space-y-6 font-[family-name:var(--font-family-primary)]">

        {/* ── Header ──────────────────────────────────────────────────────── */}
        <div className="flex items-start justify-between gap-4">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-primary-100 flex items-center justify-center">
              <HiOutlineHome className="w-5 h-5 text-primary-600" />
            </div>
            <div>
              <h1 className="text-2xl md:text-3xl font-bold text-secondary-100">Hobe Dashboard</h1>
              <p className="text-sm text-custom-700 mt-0.5">
                Overview of hobe stock, sales and activity
              </p>
            </div>
          </div>
          <button
            onClick={() => refetch()}
            className="flex items-center gap-2 px-3 py-2 rounded-xl border border-custom-300 hover:bg-custom-100 transition-colors text-custom-700 text-sm"
            title="Refresh"
          >
            <HiOutlineRefresh className={`w-4 h-4 ${isLoading ? "animate-spin" : ""}`} />
          </button>
        </div>

        {/* ── Summary Cards ───────────────────────────────────────────────── */}
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
          <StatCard
            label="Total Batches"
            value={isLoading ? "—" : totalBatches}
            icon={HiOutlineClipboardList}
          />
          <StatCard
            label="Qty in Shop"
            value={isLoading ? "—" : totalQtyInShop.toLocaleString()}
            sub="units remaining"
            color="text-primary-500"
            icon={HiOutlineCube}
          />
          <StatCard
            label="Total Sold"
            value={isLoading ? "—" : totalQtySold.toLocaleString()}
            sub="units across all batches"
            color="text-emerald-600"
            icon={HiOutlineCash}
          />
          <StatCard
            label="Revenue Collected"
            value={isLoading ? "—" : `${totalRevenue.toLocaleString()} RWF`}
            sub="from recent sales"
            color="text-emerald-600"
            icon={HiOutlineCurrencyDollar}
          />
        </div>

        {/* ── Batch Status Breakdown ───────────────────────────────────────── */}
        <div className="grid grid-cols-3 gap-4">
          <Card className="!p-4 text-center">
            <p className="text-xs text-custom-700 mb-1">Active Batches</p>
            <p className="text-2xl font-bold text-emerald-600">{isLoading ? "—" : activeBatches}</p>
          </Card>
          <Card className="!p-4 text-center">
            <p className="text-xs text-custom-700 mb-1">Expired Batches</p>
            <p className="text-2xl font-bold text-red-500">{isLoading ? "—" : expiredBatches}</p>
          </Card>
          <Card className="!p-4 text-center">
            <p className="text-xs text-custom-700 mb-1">Sold Out</p>
            <p className="text-2xl font-bold text-gray-500">{isLoading ? "—" : soldOutBatches}</p>
          </Card>
        </div>

        {/* ── Quick Actions ─────────────────────────────────────────────────── */}
        <div>
          <h2 className="text-base font-bold text-secondary-100 mb-3">Quick Actions</h2>
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
            <button
              onClick={() => navigate("/hobe/trade")}
              className="flex items-center gap-3 p-4 rounded-xl border-2 border-primary-300 bg-primary-50 hover:bg-primary-100 transition-colors text-left"
            >
              <div className="w-10 h-10 rounded-xl bg-primary-500 flex items-center justify-center flex-shrink-0">
                <HiOutlineCube className="w-5 h-5 text-white" />
              </div>
              <div>
                <p className="font-bold text-primary-700 text-sm">Sell Hobe</p>
                <p className="text-xs text-primary-600">Record a new sale</p>
              </div>
            </button>
            <button
              onClick={() => navigate("/hobe/requests")}
              className="flex items-center gap-3 p-4 rounded-xl border-2 border-orange-200 bg-orange-50 hover:bg-orange-100 transition-colors text-left"
            >
              <div className="w-10 h-10 rounded-xl bg-orange-500 flex items-center justify-center flex-shrink-0">
                <HiOutlineClipboardList className="w-5 h-5 text-white" />
              </div>
              <div>
                <p className="font-bold text-orange-700 text-sm">Request Stock</p>
                <p className="text-xs text-orange-600">Submit a stock request</p>
              </div>
            </button>
            <button
              onClick={() => navigate("/hobe/report")}
              className="flex items-center gap-3 p-4 rounded-xl border-2 border-emerald-200 bg-emerald-50 hover:bg-emerald-100 transition-colors text-left"
            >
              <div className="w-10 h-10 rounded-xl bg-emerald-500 flex items-center justify-center flex-shrink-0">
                <HiOutlineCurrencyDollar className="w-5 h-5 text-white" />
              </div>
              <div>
                <p className="font-bold text-emerald-700 text-sm">View Reports</p>
                <p className="text-xs text-emerald-600">Sales & activity reports</p>
              </div>
            </button>
          </div>
        </div>

        {/* ── Hobe Batches Table ───────────────────────────────────────────── */}
        <div>
          <div className="flex items-center justify-between mb-3">
            <h2 className="text-base font-bold text-secondary-100">All Hobe Batches</h2>
            <button
              onClick={() => navigate("/hobe/trade")}
              className="text-xs font-semibold text-primary-500 hover:text-primary-600 transition-colors"
            >
              Sell →
            </button>
          </div>
          <Card className="!p-0 overflow-hidden">
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead className="bg-custom-100 border-b border-custom-300">
                  <tr>
                    {["Batch #", "Name", "Done At", "Expires", "Qty", "Remaining", "Sold", "Price/Item", "Status"].map((h) => (
                      <th key={h} className="px-3 py-2.5 text-left text-xs font-bold text-secondary-100 uppercase">{h}</th>
                    ))}
                  </tr>
                </thead>
                <tbody className="divide-y divide-custom-200">
                  {isLoading ? (
                    <tr><td colSpan={9} className="px-4 py-8 text-center text-custom-700 text-sm">Loading...</td></tr>
                  ) : hobes.length === 0 ? (
                    <tr>
                      <td colSpan={9} className="px-4 py-12 text-center">
                        <HiOutlineCube className="w-8 h-8 text-custom-400 mx-auto mb-2" />
                        <p className="text-sm text-custom-700">No hobe batches yet</p>
                      </td>
                    </tr>
                  ) : hobes.map((h) => {
                    const sc = statusConfig[h.status] ?? statusConfig.active;
                    const fillPct = h.qty > 0 ? Math.round(((h.qty - h.qtyRemains) / h.qty) * 100) : 0;
                    return (
                      <tr key={h.id} className="hover:bg-custom-50 transition-colors">
                        <td className="px-3 py-2.5 text-xs font-mono font-bold text-primary-500">
                          {h.hobeNo}
                        </td>
                        <td className="px-3 py-2.5">
                          <p className="text-sm font-semibold text-secondary-100">{h.nameOfHobe}</p>
                          {h.note && <p className="text-xs text-custom-700 truncate max-w-[140px]">{h.note}</p>}
                        </td>
                        <td className="px-3 py-2.5 text-xs text-custom-700">
                          {new Date(h.doneAt).toLocaleDateString("en-RW", { day: "2-digit", month: "short", year: "numeric" })}
                        </td>
                        <td className="px-3 py-2.5 text-xs text-custom-700">
                          {new Date(h.expiredAt).toLocaleDateString("en-RW", { day: "2-digit", month: "short", year: "numeric" })}
                        </td>
                        <td className="px-3 py-2.5 text-sm text-secondary-100 font-semibold">{h.qty.toLocaleString()}</td>
                        <td className="px-3 py-2.5">
                          <p className={`text-sm font-bold ${h.qtyRemains === 0 ? "text-red-500" : h.qtyRemains < h.qty * 0.2 ? "text-yellow-600" : "text-emerald-600"}`}>
                            {h.qtyRemains.toLocaleString()}
                          </p>
                          <div className="w-16 h-1.5 bg-custom-200 rounded-full mt-1">
                            <div
                              className="h-1.5 bg-primary-500 rounded-full"
                              style={{ width: `${fillPct}%` }}
                            />
                          </div>
                        </td>
                        <td className="px-3 py-2.5 text-sm text-secondary-100">{h.qtySold.toLocaleString()}</td>
                        <td className="px-3 py-2.5 text-sm font-semibold text-secondary-100">
                          {h.pricePerItem.toLocaleString()} <span className="text-xs font-normal text-custom-700">RWF</span>
                        </td>
                        <td className="px-3 py-2.5">
                          <span className={`inline-flex items-center gap-1 text-xs font-bold px-2.5 py-1 rounded-full ${sc.color}`}>
                            {sc.icon} {sc.label}
                          </span>
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>
          </Card>
        </div>

        {/* ── Recent Sales ─────────────────────────────────────────────────── */}
        {recentSales.length > 0 && (
          <div>
            <div className="flex items-center justify-between mb-3">
              <h2 className="text-base font-bold text-secondary-100">Recent Sales</h2>
              <button
                onClick={() => navigate("/hobe/report")}
                className="text-xs font-semibold text-primary-500 hover:text-primary-600 transition-colors"
              >
                All Reports →
              </button>
            </div>
            <Card className="!p-0 overflow-hidden">
              <div className="overflow-x-auto">
                <table className="w-full">
                  <thead className="bg-custom-100 border-b border-custom-300">
                    <tr>
                      {["Hobe", "Qty", "Total", "Paid", "Status", "Method", "Date"].map((h) => (
                        <th key={h} className="px-3 py-2 text-left text-xs font-bold text-secondary-100 uppercase">{h}</th>
                      ))}
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-custom-200">
                    {recentSales.map((s) => (
                      <tr key={s.id} className="hover:bg-custom-50 transition-colors">
                        <td className="px-3 py-2.5">
                          <p className="text-sm font-semibold text-secondary-100">{s.hobe.nameOfHobe}</p>
                          <p className="text-xs font-mono text-custom-700">{s.hobe.hobeNo}</p>
                        </td>
                        <td className="px-3 py-2.5 text-sm text-secondary-100">{s.quantity}</td>
                        <td className="px-3 py-2.5 text-sm text-secondary-100">{Number(s.totalPrice).toLocaleString()} RWF</td>
                        <td className="px-3 py-2.5">
                          <p className="text-sm font-bold text-emerald-600">{Number(s.amountPaid).toLocaleString()} RWF</p>
                          {Number(s.balanceDue) > 0 && <p className="text-xs text-red-500">Due: {Number(s.balanceDue).toLocaleString()} RWF</p>}
                        </td>
                        <td className="px-3 py-2.5">
                          <span className={`text-xs font-bold px-2 py-0.5 rounded-full ${
                            s.paymentStatus === "paid" ? "bg-emerald-100 text-emerald-700"
                            : s.paymentStatus === "overpaid" ? "bg-blue-100 text-blue-700"
                            : "bg-orange-100 text-orange-700"
                          }`}>{s.paymentStatus}</span>
                        </td>
                        <td className="px-3 py-2.5">
                          <span className="text-xs font-semibold capitalize text-custom-700">{s.paymentMethod}</span>
                        </td>
                        <td className="px-3 py-2.5 text-xs text-custom-700">
                          {new Date(s.createdAt).toLocaleDateString("en-RW", { day: "2-digit", month: "short", year: "numeric" })}
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </Card>
          </div>
        )}
      </div>
    </DashboardLayout>
  );
}
