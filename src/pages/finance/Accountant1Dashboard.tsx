import { useState } from "react";
import {
    HiOutlineCheckCircle,
    HiOutlineClock,
    HiOutlineCurrencyDollar,
    HiOutlineDocumentText,
    HiOutlineRefresh,
    HiOutlineSearch,
    HiOutlineCash,
    HiOutlineTrendingUp,
} from "react-icons/hi";
import { useNavigate } from "react-router-dom";
import { Card } from "../../components/ui";
import { useGetInvoicesQuery } from "../../store/services/invoicesService";
import { useGetPaymentsQuery } from "../../store/services/paymentsService";
import { useGetOutstandsQuery } from "../../store/services/outstandsService";
import { useGetWithdrawalsQuery } from "../../store/services/withdrawalsService";

const statusColor: Record<string, string> = {
  paid:      "bg-green-100 text-green-700",
  cancelled: "bg-red-100 text-red-700",
  pending:   "bg-yellow-100 text-yellow-700",
};

export default function Accountant1Dashboard() {
  const _now = new Date();
  const today = `${_now.getFullYear()}-${String(_now.getMonth() + 1).padStart(2, "0")}-${String(_now.getDate()).padStart(2, "0")}`;
  const navigate = useNavigate();

  const [page, setPage] = useState(1);
  const [search, setSearch] = useState("");
  const PAGE_SIZE = 10;
  const { data: invoicesData, isLoading: loadingInvoices } = useGetInvoicesQuery({ page, limit: PAGE_SIZE, search: search || undefined });
  const { data: paymentsData, isLoading: loadingPayments } = useGetPaymentsQuery(
    { from: today, to: today + "T23:59:59.000Z", limit: 500 }
  );

  const { data: outstandsData } = useGetOutstandsQuery({ limit: 1000 });
  const { data: withdrawalsData } = useGetWithdrawalsQuery({ limit: 1000 });

  const totalExpenses   = (outstandsData?.outstands ?? []).reduce((s, r) => s + Number(r.totalAmount), 0);
  const totalWithdrawals = (withdrawalsData?.withdrawals ?? []).reduce((s, r) => s + Number(r.amount), 0);

  const invoices   = invoicesData?.invoices ?? [];
  const total      = invoicesData?.total ?? 0;
  const totalPages = invoicesData?.totalPages ?? 1;
  const payments   = paymentsData?.payments ?? [];

  const paidCount    = invoices.filter((i) => i.status === "paid").length;
  const pendingCount = invoices.filter((i) => i.status !== "paid" && i.status !== "cancelled").length;
  const todayAmount  = payments.reduce((s, p) => s + Number(p.amountPaid), 0);

  const kpis = [
    { label: "Total Invoices",        value: total,                        icon: HiOutlineDocumentText,   color: "text-primary-500",  bg: "bg-primary-100",  ring: "hover:ring-primary-400",  path: "/finance/accountant1/invoices" },
    { label: "Paid",                  value: paidCount,                    icon: HiOutlineCheckCircle,    color: "text-green-600",    bg: "bg-green-100",    ring: "hover:ring-green-400",    path: "/finance/accountant1/invoices" },
    { label: "Pending",               value: pendingCount,                 icon: HiOutlineClock,          color: "text-yellow-600",   bg: "bg-yellow-100",   ring: "hover:ring-yellow-400",   path: "/finance/accountant1/invoices" },
    { label: "Collected Today (RWF)", value: todayAmount.toLocaleString(),  icon: HiOutlineCurrencyDollar, color: "text-green-600",    bg: "bg-green-100",    ring: "hover:ring-green-400",    path: "/finance/accountant1/payments" },
    { label: "Total Expenses (RWF)",  value: totalExpenses.toLocaleString(), icon: HiOutlineCash,          color: "text-red-500",      bg: "bg-red-100",      ring: "hover:ring-red-400",      path: "/finance/accountant1/expenses" },
    { label: "Total Withdrawals (RWF)", value: totalWithdrawals.toLocaleString(), icon: HiOutlineTrendingUp, color: "text-blue-600",  bg: "bg-blue-100",     ring: "hover:ring-blue-400",     path: "/finance/accountant1/withdrawals" },
  ];

  const filtered = invoices;

  const isLoading = loadingInvoices || loadingPayments;

  return (
    <div className="space-y-8 font-[family-name:var(--font-family-primary)]">
      {/* Header */}
      <div>
        <h1 className="text-2xl md:text-3xl font-bold text-secondary-100">Accountant Dashboard</h1>
        <p className="text-sm text-custom-700 mt-1">Invoice Management & Payment Confirmation</p>
      </div>

      {/* KPI Grid */}
      <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-3">
        {kpis.map(({ label, value, icon: Icon, color, bg, ring, path }) => (
          <Card
            key={label}
            className={`!p-3 flex flex-col gap-1 cursor-pointer hover:ring-2 transition-all ${ring}`}
            onClick={() => navigate(path)}
          >
            <div className="flex items-center gap-2">
              <div className={`w-7 h-7 rounded-lg flex items-center justify-center shrink-0 ${bg}`}>
                <Icon className={`w-4 h-4 ${color}`} />
              </div>
              <p className="text-sm font-bold text-secondary-100 leading-tight truncate">
                {isLoading ? "—" : value}
              </p>
            </div>
            <p className="text-xs text-custom-700 leading-tight">{label}</p>
          </Card>
        ))}
      </div>

      {/* Invoices Table */}
      <Card>
        <div className="flex flex-col xs:flex-row xs:items-center justify-between gap-3 mb-5">
          <div className="flex items-center gap-2">
            <HiOutlineDocumentText className="w-5 h-5 text-primary-500" />
            <h2 className="font-bold text-secondary-100">Recent Invoices</h2>
            <span className="text-xs text-custom-500">({total} total)</span>
          </div>
          <div className="flex items-center gap-3">
            <div className="relative w-full xs:w-64">
              <HiOutlineSearch className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-custom-700" />
              <input
                type="text"
                placeholder="Search invoices..."
                value={search}
                onChange={(e) => { setSearch(e.target.value); setPage(1); }}
                className="w-full pl-9 pr-4 py-2 rounded-xl border border-custom-300 bg-style-500 text-secondary-100 text-sm placeholder:text-custom-700 focus:outline-none focus:border-primary-400 transition-colors"
              />
            </div>
            <button
              onClick={() => navigate("/finance/accountant1/invoices")}
              className="text-xs font-semibold text-primary-500 hover:underline whitespace-nowrap"
            >
              View all →
            </button>
          </div>
        </div>

        <div className="overflow-x-auto">
          {isLoading ? (
            <div className="flex items-center justify-center py-12 gap-2 text-custom-500">
              <HiOutlineRefresh className="w-5 h-5 animate-spin" /> Loading…
            </div>
          ) : filtered.length === 0 ? (
            <div className="py-12 text-center text-sm text-custom-400">No invoices found.</div>
          ) : (
            <table className="w-full text-sm">
              <thead>
                <tr className="border-b border-custom-300">
                  {["Invoice", "Job", "Client", "Amount (RWF)", "Due Date", "Status"].map((h) => (
                    <th key={h} className="text-left py-2 px-3 text-xs font-semibold text-custom-700 uppercase tracking-wide whitespace-nowrap">{h}</th>
                  ))}
                </tr>
              </thead>
              <tbody>
                {filtered.map((inv) => {
                  const client = inv.job?.customer?.name ?? inv.customer?.name ?? "—";
                  const amount = Number(inv.totalAmount).toLocaleString();
                  const due    = inv.dueDate ? new Date(inv.dueDate).toLocaleDateString("en-RW", { day: "2-digit", month: "short", year: "numeric" }) : "—";
                  return (
                    <tr key={inv.id} className="border-b border-custom-200 hover:bg-custom-50 transition-colors">
                      <td className="py-3 px-3 font-semibold text-primary-500 whitespace-nowrap">{inv.invoiceNo}</td>
                      <td className="py-3 px-3 text-custom-700 whitespace-nowrap">#{inv.job?.jobNumber ?? inv.jobId?.slice(0, 8)}</td>
                      <td className="py-3 px-3 text-secondary-100 whitespace-nowrap">{client}</td>
                      <td className="py-3 px-3 font-semibold text-secondary-100 whitespace-nowrap">{amount}</td>
                      <td className="py-3 px-3 text-custom-700 whitespace-nowrap">{due}</td>
                      <td className="py-3 px-3">
                        <span className={`text-xs font-semibold px-2 py-0.5 rounded-full whitespace-nowrap ${statusColor[inv.status] ?? "bg-gray-100 text-gray-600"}`}>
                          {inv.status}
                        </span>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          )}
        </div>

        {/* Pagination */}
        {totalPages > 1 && (
          <div className="flex items-center justify-between mt-4 pt-4 border-t border-custom-300">
            <p className="text-xs text-custom-700">
              Page {page} of {totalPages} &mdash; {total} invoices
            </p>
            <div className="flex items-center gap-1">
              <button
                onClick={() => setPage(1)}
                disabled={page === 1}
                className="px-2 py-1 text-xs rounded-lg border border-custom-300 text-custom-700 disabled:opacity-40 hover:bg-custom-100 transition-colors"
              >«</button>
              <button
                onClick={() => setPage((p) => Math.max(1, p - 1))}
                disabled={page === 1}
                className="px-2 py-1 text-xs rounded-lg border border-custom-300 text-custom-700 disabled:opacity-40 hover:bg-custom-100 transition-colors"
              >‹</button>
              {Array.from({ length: Math.min(5, totalPages) }, (_, i) => {
                const start = Math.max(1, Math.min(page - 2, totalPages - 4));
                const p = start + i;
                return (
                  <button
                    key={p}
                    onClick={() => setPage(p)}
                    className={`px-2.5 py-1 text-xs rounded-lg border transition-colors ${
                      p === page
                        ? "bg-primary-500 text-white border-primary-500"
                        : "border-custom-300 text-custom-700 hover:bg-custom-100"
                    }`}
                  >{p}</button>
                );
              })}
              <button
                onClick={() => setPage((p) => Math.min(totalPages, p + 1))}
                disabled={page === totalPages}
                className="px-2 py-1 text-xs rounded-lg border border-custom-300 text-custom-700 disabled:opacity-40 hover:bg-custom-100 transition-colors"
              >›</button>
              <button
                onClick={() => setPage(totalPages)}
                disabled={page === totalPages}
                className="px-2 py-1 text-xs rounded-lg border border-custom-300 text-custom-700 disabled:opacity-40 hover:bg-custom-100 transition-colors"
              >»</button>
            </div>
          </div>
        )}
      </Card>
    </div>
  );
}
