import { useMemo, useState } from "react";
import {
  HiOutlineCheckCircle,
  HiOutlineClock,
  HiOutlineCurrencyDollar,
  HiOutlineDocumentText,
  HiOutlineExclamationCircle,
  HiOutlineSearch,
  HiOutlineTrendingUp,
  HiOutlineRefresh,
} from "react-icons/hi";
import { Card } from "../../components/ui";
import { useGetJobsQuery } from "../../store/services/jobsService";
import { useGetPaymentsQuery } from "../../store/services/paymentsService";
import { useGetWithdrawalBalanceQuery } from "../../store/services/withdrawalsService";
import { useGetOutstandsQuery } from "../../store/services/outstandsService";

function fmt(n: number) {
  return Math.round(n).toLocaleString("en-US");
}

export default function FinanceDashboard() {
  const [search, setSearch] = useState("");
  const [page, setPage] = useState(1);
  const PAGE_SIZE = 10;

  const { data: jobsData,    isLoading: jobsLoading,    refetch: refetchJobs    } = useGetJobsQuery({ limit: 500 });
  const { data: paymentsData, isLoading: paymentsLoading, refetch: refetchPayments } = useGetPaymentsQuery({ limit: 20 });
  const { data: balanceData,  refetch: refetchBalance  } = useGetWithdrawalBalanceQuery();
  const { data: expensesData, refetch: refetchExpenses } = useGetOutstandsQuery({ limit: 200 });

  const jobs     = jobsData?.jobs ?? [];
  const payments = paymentsData?.payments ?? [];
  const balance  = balanceData ?? { initialAmount: 0, totalPaymentsIn: 0, totalWithdrawalsIn: 0, totalExpensesOut: 0, totalBalance: 0 };
  const expenses = expensesData?.outstands ?? [];

  // ── Revenue & payment stats from jobs (same source as admin dashboard) ──
  const totalRevenue  = useMemo(() => jobs.reduce((s, j) => s + (Number(j.amount) || 0), 0), [jobs]);
  const totalCollected = useMemo(() => jobs.reduce((s, j) => s + (j.payments ?? []).reduce((ps, p) => ps + (Number(p.amountPaid) || 0), 0), 0), [jobs]);
  const outstanding   = useMemo(() => totalRevenue - totalCollected, [totalRevenue, totalCollected]);
  const overdueAmount = useMemo(() => jobs
    .filter(j => j.dueDate && new Date(j.dueDate) < new Date() && j.status !== "completed" && j.status !== "delivered")
    .reduce((s, j) => s + (Number(j.amount) || 0) - (j.payments ?? []).reduce((ps, p) => ps + (Number(p.amountPaid) || 0), 0), 0), [jobs]);

  const totalExpenses = useMemo(() => expenses.filter(e => e.status === "paid").reduce((s, e) => s + Number(e.totalAmount), 0), [expenses]);
  const pendingExpenses = useMemo(() => expenses.filter(e => e.status === "pending" || e.status === "approved").reduce((s, e) => s + Number(e.totalAmount), 0), [expenses]);

  const collectionRate = totalRevenue > 0 ? Math.round((totalCollected / totalRevenue) * 100) : 0;

  const kpis = [
    { label: "Total Revenue",    value: `${fmt(totalRevenue)} RWF`,   icon: HiOutlineCurrencyDollar, color: "text-green-600",  bg: "bg-green-50",  border: "border-green-200" },
    { label: "Collected",        value: `${fmt(totalCollected)} RWF`, icon: HiOutlineCheckCircle,   color: "text-primary-500", bg: "bg-primary-50", border: "border-primary-200" },
    { label: "Outstanding",      value: `${fmt(outstanding)} RWF`,    icon: HiOutlineClock,         color: "text-yellow-600", bg: "bg-yellow-50", border: "border-yellow-200" },
    { label: "Overdue Amount",   value: `${fmt(overdueAmount)} RWF`,  icon: HiOutlineExclamationCircle, color: "text-red-500", bg: "bg-red-50",  border: "border-red-200" },
    { label: "Fund Balance",     value: `${fmt(balance.totalBalance)} RWF`, icon: HiOutlineTrendingUp, color: "text-blue-600", bg: "bg-blue-50", border: "border-blue-200" },
    { label: "Expenses Paid",    value: `${fmt(totalExpenses)} RWF`,  icon: HiOutlineDocumentText,  color: "text-rose-500",  bg: "bg-rose-50",  border: "border-rose-200" },
  ];

  // ── Jobs table (filtered by search) ──
  const filtered = useMemo(() => jobs.filter(j =>
    (j.jobNumber ?? "").toLowerCase().includes(search.toLowerCase()) ||
    (j.customer?.name ?? "").toLowerCase().includes(search.toLowerCase()) ||
    (j.title ?? "").toLowerCase().includes(search.toLowerCase())
  ), [jobs, search]);

  const totalPages = Math.max(1, Math.ceil(filtered.length / PAGE_SIZE));
  const paginated  = filtered.slice((page - 1) * PAGE_SIZE, page * PAGE_SIZE);

  const statusStyle: Record<string, string> = {
    completed:  "bg-green-100 text-green-700",
    delivered:  "bg-green-100 text-green-700",
    pending:    "bg-orange-100 text-orange-700",
    confirmed:  "bg-yellow-100 text-yellow-700",
    rejected:   "bg-red-100 text-red-700",
  };

  const expenseStatusStyle: Record<string, string> = {
    pending:  "bg-yellow-100 text-yellow-700",
    approved: "bg-blue-100 text-blue-700",
    paid:     "bg-green-100 text-green-700",
    rejected: "bg-red-100 text-red-700",
  };

  const refetchAll = () => { refetchJobs(); refetchPayments(); refetchBalance(); refetchExpenses(); };

  return (
    <div className="space-y-8 font-[family-name:var(--font-family-primary)]">

      {/* Header */}
      <div className="flex flex-col xs:flex-row xs:items-center justify-between gap-3">
        <div>
          <h1 className="text-2xl md:text-3xl font-bold text-secondary-100">Finance Dashboard All Times</h1>
          <p className="text-sm text-custom-700 mt-1">Revenue, payments, fund balance & expenses</p>
        </div>
        <button onClick={refetchAll} className="p-2 rounded-xl border border-custom-300 hover:bg-custom-100 transition-colors self-start" title="Refresh">
          <HiOutlineRefresh className={`w-4 h-4 text-custom-700 ${jobsLoading || paymentsLoading ? "animate-spin" : ""}`} />
        </button>
      </div>

      {/* KPI Grid */}
      <div className="grid grid-cols-2 sm:grid-cols-3 xl:grid-cols-6 gap-3">
        {kpis.map(({ label, value, icon: Icon, color, bg, border }) => (
          <Card key={label} className={`!p-4 border ${border} ${bg} flex flex-col gap-1.5`}>
            <div className="flex items-center justify-between">
              <p className="text-xs text-custom-700 leading-tight font-medium">{label}</p>
              <Icon className={`w-4 h-4 ${color} shrink-0`} />
            </div>
            <p className="text-base font-bold text-secondary-100 leading-tight">{value}</p>
          </Card>
        ))}
      </div>

      {/* Collection rate + Fund breakdown */}
      <div className="grid grid-cols-1 xl:grid-cols-2 gap-6">
        {/* Fund Balance breakdown */}
        <Card>
          <div className="flex items-center gap-2 mb-4">
            <HiOutlineTrendingUp className="w-5 h-5 text-primary-500" />
            <h2 className="font-bold text-secondary-100">Fund Balance</h2>
            <a href="/admin/withdrawals" className="ml-auto text-xs text-primary-500 hover:underline font-semibold">View all →</a>
          </div>
          <div className="space-y-2">
            {([
              { label: "Initial Amount",  value: balance.initialAmount,      color: "text-secondary-100" },
              { label: "Payments In",     value: balance.totalPaymentsIn,    color: "text-green-600",  prefix: "+" },
              { label: "Withdrawals In",  value: balance.totalWithdrawalsIn, color: "text-blue-600",   prefix: "+" },
              { label: "Expenses Out",    value: balance.totalExpensesOut,   color: "text-red-500",    prefix: "-" },
            ] as { label: string; value: number; color: string; prefix?: string }[]).map(({ label, value, color, prefix }) => (
              <div key={label} className="flex items-center justify-between py-2 border-b border-custom-100">
                <span className="text-sm text-custom-700">{label}</span>
                <span className={`text-sm font-bold ${color}`}>{prefix}{fmt(value)} RWF</span>
              </div>
            ))}
            <div className={`flex items-center justify-between pt-3 rounded-xl px-3 py-2 mt-1 ${balance.totalBalance >= 0 ? "bg-emerald-50" : "bg-orange-50"}`}>
              <span className="text-sm font-bold text-secondary-100">Total Balance</span>
              <span className={`text-lg font-bold ${balance.totalBalance >= 0 ? "text-emerald-700" : "text-orange-700"}`}>{fmt(balance.totalBalance)} RWF</span>
            </div>
          </div>
        </Card>

        {/* Collection rate + recent payments */}
        <Card>
          <div className="flex items-center gap-2 mb-4">
            <HiOutlineCheckCircle className="w-5 h-5 text-green-600" />
            <h2 className="font-bold text-secondary-100">Payment Collection</h2>
          </div>
          {/* Progress bar */}
          <div className="mb-5">
            <div className="flex items-center justify-between mb-1.5">
              <span className="text-sm text-custom-700">Collection Rate</span>
              <span className="text-sm font-bold text-green-600">{collectionRate}%</span>
            </div>
            <div className="w-full bg-custom-200 rounded-full h-2.5">
              <div className="bg-green-500 h-2.5 rounded-full transition-all" style={{ width: `${collectionRate}%` }} />
            </div>
            <div className="flex justify-between mt-2 text-xs text-custom-700">
              <span>Collected: {fmt(totalCollected)} RWF</span>
              <span>Remaining: {fmt(outstanding)} RWF</span>
            </div>
          </div>
          {/* Recent payments */}
          <p className="text-xs font-semibold text-custom-700 uppercase tracking-wide mb-2">Recent Payments</p>
          {paymentsLoading ? (
            <p className="text-sm text-custom-700">Loading...</p>
          ) : payments.length === 0 ? (
            <p className="text-sm text-custom-700">No payments yet.</p>
          ) : (
            <div className="space-y-2">
              {payments.slice(0, 5).map((p) => (
                <div key={p.id} className="flex items-center justify-between py-2 border-b border-custom-100 last:border-0">
                  <div>
                    <p className="text-sm font-semibold text-secondary-100">{p.receiptNo}</p>
                    <p className="text-xs text-custom-700">{p.job?.customer?.name ?? "—"} · {new Date(p.paidAt).toLocaleDateString()}</p>
                  </div>
                  <span className="text-sm font-bold text-green-600">{fmt(Number(p.amountPaid))} RWF</span>
                </div>
              ))}
            </div>
          )}
        </Card>
      </div>

      {/* Jobs Revenue Table */}
      <Card>
        <div className="flex flex-col xs:flex-row xs:items-center justify-between gap-3 mb-5">
          <div className="flex items-center gap-2">
            <HiOutlineDocumentText className="w-5 h-5 text-primary-500" />
            <h2 className="font-bold text-secondary-100">Jobs — Revenue Breakdown</h2>
            {jobsLoading && <span className="text-xs text-custom-700">Loading...</span>}
          </div>
          <div className="relative w-full xs:w-64">
            <HiOutlineSearch className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-custom-700" />
            <input
              type="text" placeholder="Search job, client..." value={search}
              onChange={(e) => { setSearch(e.target.value); setPage(1); }}
              className="w-full pl-9 pr-4 py-2 rounded-xl border border-custom-300 bg-style-500 text-secondary-100 text-sm placeholder:text-custom-700 focus:outline-none focus:border-primary-400 focus:ring-2 focus:ring-primary-200 transition-colors font-[family-name:var(--font-family-primary)]"
            />
          </div>
        </div>
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead>
              <tr className="border-b border-custom-300">
                {["Job #", "Client", "Title", "Amount", "Collected", "Balance", "Status"].map(h => (
                  <th key={h} className="text-left py-2 px-3 text-xs font-semibold text-custom-700 uppercase tracking-wide whitespace-nowrap">{h}</th>
                ))}
              </tr>
            </thead>
            <tbody>
              {jobsLoading ? (
                <tr><td colSpan={7} className="py-8 text-center text-custom-700 text-sm">Loading...</td></tr>
              ) : paginated.length === 0 ? (
                <tr><td colSpan={7} className="py-8 text-center text-custom-700 text-sm">No jobs found.</td></tr>
              ) : paginated.map((job) => {
                const jobAmount    = Number(job.amount) || 0;
                const jobCollected = (job.payments ?? []).reduce((s, p) => s + (Number(p.amountPaid) || 0), 0);
                const jobBalance   = jobAmount - jobCollected;
                const isOverdue    = job.dueDate && new Date(job.dueDate) < new Date() && job.status !== "completed" && job.status !== "delivered";
                return (
                  <tr key={job.id} className="border-b border-custom-200 hover:bg-custom-50 transition-colors">
                    <td className="py-3 px-3 font-semibold text-primary-500 whitespace-nowrap">{job.jobNumber}</td>
                    <td className="py-3 px-3 text-secondary-100 whitespace-nowrap">{job.customer?.name ?? "—"}</td>
                    <td className="py-3 px-3 text-custom-700 max-w-[160px] truncate">{job.title}</td>
                    <td className="py-3 px-3 font-semibold text-secondary-100 whitespace-nowrap">{fmt(jobAmount)} RWF</td>
                    <td className="py-3 px-3 text-green-600 font-semibold whitespace-nowrap">{fmt(jobCollected)} RWF</td>
                    <td className={`py-3 px-3 font-semibold whitespace-nowrap ${jobBalance > 0 ? (isOverdue ? "text-red-500" : "text-yellow-600") : "text-green-600"}`}>
                      {fmt(jobBalance)} RWF
                    </td>
                    <td className="py-3 px-3">
                      <span className={`text-xs font-semibold px-2 py-0.5 rounded-full whitespace-nowrap ${statusStyle[job.status] ?? "bg-custom-100 text-custom-700"}`}>
                        {job.status.split("-").map(w => w.charAt(0).toUpperCase() + w.slice(1)).join(" ")}
                      </span>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
        {filtered.length > PAGE_SIZE && (
          <div className="flex items-center justify-between mt-3 pt-3 border-t border-custom-200">
            <p className="text-xs text-custom-700">
              {(page - 1) * PAGE_SIZE + 1}–{Math.min(page * PAGE_SIZE, filtered.length)} of {filtered.length}
            </p>
            <div className="flex items-center gap-1">
              <button onClick={() => setPage(p => Math.max(1, p - 1))} disabled={page === 1}
                className="px-3 py-1.5 rounded-lg border border-custom-300 text-xs font-semibold text-secondary-100 hover:bg-custom-100 disabled:opacity-40">Prev</button>
              <span className="text-xs text-custom-700 px-2">{page}/{totalPages}</span>
              <button onClick={() => setPage(p => Math.min(totalPages, p + 1))} disabled={page === totalPages}
                className="px-3 py-1.5 rounded-lg border border-custom-300 text-xs font-semibold text-secondary-100 hover:bg-custom-100 disabled:opacity-40">Next</button>
            </div>
          </div>
        )}
      </Card>

      {/* Expenses */}
      <Card>
        <div className="flex items-center gap-2 mb-4">
          <HiOutlineCurrencyDollar className="w-5 h-5 text-rose-500" />
          <h2 className="font-bold text-secondary-100">Expenses</h2>
          <a href="/admin/expenses" className="ml-auto text-xs text-primary-500 hover:underline font-semibold">View all →</a>
        </div>
        <div className="flex gap-4 mb-4">
          <div className="px-3 py-2 rounded-xl bg-rose-50 border border-rose-200">
            <p className="text-xs text-custom-700">Paid</p>
            <p className="text-sm font-bold text-rose-600">{fmt(totalExpenses)} RWF</p>
          </div>
          <div className="px-3 py-2 rounded-xl bg-yellow-50 border border-yellow-200">
            <p className="text-xs text-custom-700">Pending / Approved</p>
            <p className="text-sm font-bold text-yellow-600">{fmt(pendingExpenses)} RWF</p>
          </div>
        </div>
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead>
              <tr className="border-b border-custom-300">
                {["Ref", "Description", "Category", "Amount", "Status", "Date"].map(h => (
                  <th key={h} className="text-left py-2 px-3 text-xs font-semibold text-custom-700 uppercase tracking-wide whitespace-nowrap">{h}</th>
                ))}
              </tr>
            </thead>
            <tbody>
              {expenses.length === 0 ? (
                <tr><td colSpan={6} className="py-6 text-center text-custom-700 text-sm">No expenses found.</td></tr>
              ) : expenses.slice(0, 10).map((e) => (
                <tr key={e.id} className="border-b border-custom-200 hover:bg-custom-50 transition-colors">
                  <td className="py-3 px-3 font-semibold text-primary-500 whitespace-nowrap">{e.ref}</td>
                  <td className="py-3 px-3 text-secondary-100 max-w-[200px] truncate">{e.description}</td>
                  <td className="py-3 px-3 text-custom-700 capitalize whitespace-nowrap">{e.category}</td>
                  <td className="py-3 px-3 font-semibold text-secondary-100 whitespace-nowrap">{fmt(Number(e.totalAmount))} RWF</td>
                  <td className="py-3 px-3">
                    <span className={`text-xs font-semibold px-2 py-0.5 rounded-full ${expenseStatusStyle[e.status] ?? ""}`}>{e.status}</span>
                  </td>
                  <td className="py-3 px-3 text-custom-700 whitespace-nowrap">{new Date(e.createdAt).toLocaleDateString()}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </Card>
    </div>
  );
}
