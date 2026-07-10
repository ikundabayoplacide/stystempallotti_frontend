import { useMemo, useState } from "react";
import {
  HiOutlineChartBar,
  HiOutlineCheckCircle,
  HiOutlineChevronDown,
  HiOutlineChevronUp,
  HiOutlineClipboardList,
  HiOutlineClock,
  HiOutlineCurrencyDollar,
  HiOutlineExclamationCircle,
  HiOutlineTrendingUp,
  HiOutlineUsers,
  HiOutlineRefresh,
  HiOutlineBriefcase,
  HiOutlineDocumentText,
} from "react-icons/hi";
import BottleneckDetection from "../../components/BottleneckDetection";
import DelayedJobsTracker from "../../components/DelayedJobsTracker";
import LowStockAlerts from "../../components/LowStockAlerts";
import OutstandingBalances from "../../components/OutstandingBalances";
import { Card } from "../../components/ui";
import { useGetJobsQuery } from "../../store/services/jobsService";
import { useGetCustomersQuery } from "../../store/services/customersService";
import { useGetAllEmployeesQuery } from "../../store/services/employeesService";
import { useGetWithdrawalBalanceQuery } from "../../store/services/withdrawalsService";
import { useGetOutstandsQuery } from "../../store/services/outstandsService";
import { useGetAllLeavesQuery } from "../../store/services/leaveService";
import { useGetUsersQuery } from "../../store/services/usersService";

const statusColor: Record<string, string> = {
  "in-printing":        "bg-primary-100 text-primary-700",
  "in-binding":         "bg-primary-100 text-primary-700",
  "in-composition":     "bg-primary-100 text-primary-700",
  "in-montage":         "bg-primary-100 text-primary-700",
  "in-packaging":       "bg-primary-100 text-primary-700",
  "quality-check":      "bg-blue-100 text-blue-700",
  "ready-for-delivery": "bg-purple-100 text-purple-700",
  completed:            "bg-green-100 text-green-700",
  delivered:            "bg-green-100 text-green-700",
  confirmed:            "bg-yellow-100 text-yellow-700",
  pending:              "bg-orange-100 text-orange-700",
  rejected:             "bg-red-100 text-red-700",
};

function fmt(n: number) {
  return Math.round(n).toLocaleString("en-US");
}

function statusLabel(s: string) {
  return s.split("-").map((w) => w.charAt(0).toUpperCase() + w.slice(1)).join(" ");
}

export default function AdminDashboard() {
  const [showMore, setShowMore] = useState(false);

  const { data: jobsData, isLoading: jobsLoading, refetch: refetchJobs } = useGetJobsQuery({ limit: 500 });
  const { data: recentJobsData }   = useGetJobsQuery({ limit: 5 });
  const { data: customersData }    = useGetCustomersQuery({ limit: 1 });
  const { data: employeesData }    = useGetAllEmployeesQuery({ limit: 200 });
  const { data: balanceData }      = useGetWithdrawalBalanceQuery();
  const { data: expensesData }     = useGetOutstandsQuery({ limit: 5, status: undefined });
  const { data: leavesData }       = useGetAllLeavesQuery({ status: "PENDING", limit: 100 });
  const { data: usersData }        = useGetUsersQuery({ limit: 1 });

  const jobs       = jobsData?.jobs ?? [];
  const recentJobs = recentJobsData?.jobs ?? [];
  const totalCustomers = customersData?.total ?? 0;
  const totalUsers     = usersData?.total ?? 0;
  const pendingLeaves  = leavesData?.total ?? 0;

  const balance        = balanceData ?? { initialAmount: 0, totalPaymentsIn: 0, totalWithdrawalsIn: 0, totalExpensesOut: 0, totalBalance: 0 };
  const recentExpenses = expensesData?.outstands ?? [];

  const inProgressStatuses = ["confirmed","in-composition","in-montage","in-printing","in-binding","in-packaging","quality-check","ready-for-delivery"];
  const now = new Date();
  const todayStr = now.toDateString();
  const oneWeekLater = new Date(now); oneWeekLater.setDate(now.getDate() + 7);

  // ── Computed stats from jobs data ────────────────────────────────────────
  const jobsInProgress = useMemo(() => jobs.filter((j) => inProgressStatuses.includes(j.status)).length, [jobs]);
  const pendingJobs    = useMemo(() => jobs.filter((j) => j.status === "pending").length, [jobs]);
  const completedToday = useMemo(() => jobs.filter((j) => (j.status === "completed" || j.status === "delivered") && j.completedAt && new Date(j.completedAt).toDateString() === todayStr).length, [jobs]);
  const totalRevenue   = useMemo(() => jobs.reduce((s, j) => s + (Number(j.amount) || 0), 0), [jobs]);
  const totalPaid      = useMemo(() => jobs.reduce((s, j) => s + (j.payments ?? []).reduce((ps, p) => ps + (Number(p.amountPaid) || 0), 0), 0), [jobs]);
  const outstanding    = useMemo(() => totalRevenue - totalPaid, [totalRevenue, totalPaid]);
  const totalJobs      = jobs.length;

  const overdueJobs  = useMemo(() => jobs.filter((j) => j.dueDate && new Date(j.dueDate) < now && j.status !== "completed" && j.status !== "delivered"), [jobs]);
  const dueTodayJobs = useMemo(() => jobs.filter((j) => j.dueDate && new Date(j.dueDate).toDateString() === todayStr && j.status !== "completed" && j.status !== "delivered"), [jobs]);
  const thisWeekJobs = useMemo(() => jobs.filter((j) => j.dueDate && new Date(j.dueDate) > now && new Date(j.dueDate) <= oneWeekLater && j.status !== "completed" && j.status !== "delivered"), [jobs]);
  const onTrackJobs  = useMemo(() => jobs.filter((j) => inProgressStatuses.includes(j.status) && (!j.dueDate || new Date(j.dueDate) > oneWeekLater)), [jobs]);
  const delayedJobs  = overdueJobs.length;

  const activeEmployees = (employeesData?.data ?? []).filter((e) => e.isActive).length;
  const totalEmployees  = employeesData?.total ?? 0;

  const isLoading = jobsLoading;
  const dateLabel = new Date().toLocaleDateString("en-US", { weekday: "long", year: "numeric", month: "long", day: "numeric" });

  const kpis = [
    { label: "Jobs In Progress",  value: isLoading ? "…" : String(jobsInProgress),      icon: HiOutlineClipboardList,     color: "text-primary-500",  bg: "bg-primary-50",  border: "border-primary-200" },
    { label: "Pending Approval",  value: isLoading ? "…" : String(pendingJobs),          icon: HiOutlineClock,             color: "text-orange-500",   bg: "bg-orange-50",   border: "border-orange-200" },
    { label: "Completed Today",   value: isLoading ? "…" : String(completedToday),       icon: HiOutlineCheckCircle,       color: "text-green-600",    bg: "bg-green-50",    border: "border-green-200" },
    { label: "Delayed / Overdue", value: isLoading ? "…" : String(delayedJobs),          icon: HiOutlineExclamationCircle, color: "text-red-500",      bg: "bg-red-50",      border: "border-red-200" },
    { label: "Total Revenue",     value: isLoading ? "…" : `${fmt(totalRevenue)} RWF`,   icon: HiOutlineCurrencyDollar,    color: "text-yellow-600",   bg: "bg-yellow-50",   border: "border-yellow-200" },
    { label: "Collected",         value: isLoading ? "…" : `${fmt(totalPaid)} RWF`,      icon: HiOutlineTrendingUp,        color: "text-emerald-600",  bg: "bg-emerald-50",  border: "border-emerald-200" },
    { label: "Outstanding",       value: isLoading ? "…" : `${fmt(outstanding)} RWF`,    icon: HiOutlineExclamationCircle, color: "text-rose-500",     bg: "bg-rose-50",     border: "border-rose-200" },
    { label: "Fund Balance",      value: `${fmt(balance.totalBalance)} RWF`,             icon: HiOutlineBriefcase,         color: "text-blue-600",     bg: "bg-blue-50",     border: "border-blue-200" },
    { label: "Total Jobs",        value: isLoading ? "…" : String(totalJobs),            icon: HiOutlineDocumentText,      color: "text-violet-600",   bg: "bg-violet-50",   border: "border-violet-200" },
    { label: "Total Clients",     value: String(totalCustomers),                         icon: HiOutlineUsers,             color: "text-indigo-600",   bg: "bg-indigo-50",   border: "border-indigo-200" },
    { label: "System Users",      value: String(totalUsers),                             icon: HiOutlineUsers,             color: "text-violet-600",   bg: "bg-violet-50",   border: "border-violet-200" },
    { label: "Leave Requests",    value: String(pendingLeaves),                          icon: HiOutlineChartBar,          color: "text-amber-600",    bg: "bg-amber-50",    border: "border-amber-200",  sub: "pending" },
  ];

  return (
    <div className="space-y-6 font-[family-name:var(--font-family-primary)]">

      {/* Header */}
      <div className="flex flex-col xs:flex-row xs:items-center justify-between gap-3">
        <div>
          <h1 className="text-2xl md:text-3xl font-bold text-secondary-100">Director Dashboard</h1>
          <p className="text-sm text-custom-700 mt-1">Real-time overview — {dateLabel}</p>
        </div>
        <div className="flex items-center gap-3">
          <span className="inline-flex items-center gap-2 px-3 py-1.5 rounded-full bg-green-100 text-green-700 text-xs font-semibold">
            <span className="w-2 h-2 rounded-full bg-green-500 animate-pulse" />
            Live
          </span>
          <button
            onClick={() => { refetchJobs(); }}
            className="p-2 rounded-xl border border-custom-300 hover:bg-custom-100 transition-colors"
            title="Refresh"
          >
            <HiOutlineRefresh className="w-4 h-4 text-custom-700" />
          </button>
        </div>
      </div>

      {/* KPI Grid — 2 cols mobile, 3 tablet, 4 desktop, 6 xl */}
      <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 xl:grid-cols-6 gap-3">
        {kpis.map(({ label, value, sub, icon: Icon, color, bg, border }) => (
          <Card key={label} className={`!p-4 border ${border} ${bg} flex flex-col gap-1.5`}>
            <div className="flex items-center justify-between">
              <p className="text-xs text-custom-700 leading-tight font-medium">{label}</p>
              <Icon className={`w-4 h-4 ${color} shrink-0`} />
            </div>
            <p className={`text-lg font-bold text-secondary-100 leading-tight`}>{value}</p>
            {sub && <p className="text-xs text-custom-500">{sub}</p>}
          </Card>
        ))}
      </div>

      {/* Deadline snapshot */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
        {[
          { label: "Overdue",    count: overdueJobs.length,  bg: "bg-red-50 border-red-200",    text: "text-red-700",    dot: "bg-red-500" },
          { label: "Due Today",  count: dueTodayJobs.length, bg: "bg-orange-50 border-orange-200", text: "text-orange-700", dot: "bg-orange-500" },
          { label: "This Week",  count: thisWeekJobs.length, bg: "bg-yellow-50 border-yellow-200", text: "text-yellow-700", dot: "bg-yellow-500" },
          { label: "On Track",   count: onTrackJobs.length,  bg: "bg-green-50 border-green-200",  text: "text-green-700",  dot: "bg-green-500" },
        ].map(({ label, count, bg, text, dot }) => (
          <div key={label} className={`rounded-xl border p-3 flex items-center gap-3 ${bg}`}>
            <span className={`w-2.5 h-2.5 rounded-full shrink-0 ${dot}`} />
            <div>
              <p className={`text-xs font-bold uppercase tracking-wide ${text}`}>{label}</p>
              <p className={`text-xl font-bold ${text}`}>{count}</p>
            </div>
          </div>
        ))}
      </div>

      {/* Finance + Expenses */}
      <div className="grid grid-cols-1 xl:grid-cols-2 gap-6">
        <Card>
          <div className="flex items-center justify-between mb-4">
            <div className="flex items-center gap-2">
              <HiOutlineCurrencyDollar className="w-5 h-5 text-primary-500" />
              <h2 className="font-bold text-secondary-100">Fund Balance</h2>
            </div>
            <a href="/admin/withdrawals" className="text-xs text-primary-500 hover:underline font-semibold">View all →</a>
          </div>
          <div className="space-y-2">
            {([
              { label: "Initial Amount",  value: balance.initialAmount,     color: "text-secondary-100" },
              { label: "Payments In",     value: balance.totalPaymentsIn,   color: "text-green-600",  prefix: "+" },
              { label: "Withdrawals In",  value: balance.totalWithdrawalsIn, color: "text-blue-600",  prefix: "+" },
              { label: "Expenses Out",    value: balance.totalExpensesOut,  color: "text-red-500",    prefix: "-" },
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

        <Card>
          <div className="flex items-center justify-between mb-4">
            <div className="flex items-center gap-2">
              <HiOutlineDocumentText className="w-5 h-5 text-primary-500" />
              <h2 className="font-bold text-secondary-100">Recent Expenses</h2>
            </div>
            <a href="/admin/expenses" className="text-xs text-primary-500 hover:underline font-semibold">View all →</a>
          </div>
          {recentExpenses.length === 0 ? (
            <p className="text-sm text-custom-700 text-center py-6">No expenses recorded</p>
          ) : (
            <div className="space-y-2">
              {recentExpenses.map((e) => {
                const sc: Record<string, string> = { pending: "bg-yellow-100 text-yellow-700", approved: "bg-blue-100 text-blue-700", paid: "bg-emerald-100 text-emerald-700", rejected: "bg-red-100 text-red-700" };
                return (
                  <div key={e.id} className="flex items-center justify-between py-2 border-b border-custom-100 last:border-0">
                    <div className="min-w-0">
                      <p className="text-sm font-semibold text-secondary-100 truncate">{e.description}</p>
                      <p className="text-xs text-custom-700">{e.ref} · {new Date(e.createdAt).toLocaleDateString()}</p>
                    </div>
                    <div className="flex items-center gap-2 ml-3 shrink-0">
                      <span className={`text-xs font-bold px-2 py-0.5 rounded-full ${sc[e.status] ?? ""}`}>{e.status}</span>
                      <span className="text-sm font-bold text-secondary-100">{Number(e.totalAmount).toLocaleString()} RWF</span>
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </Card>
      </div>

    

      {/* Delayed + Bottleneck */}
      <div className="grid grid-cols-1 xl:grid-cols-2 gap-6">
        <DelayedJobsTracker />
        <BottleneckDetection />
      </div>
        {/* Department / Stock / Balances */}
      <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-2 gap-6">
        <LowStockAlerts />
        <OutstandingBalances />
      </div>

      {/* Show More */}
      <button
        onClick={() => setShowMore(!showMore)}
        className="w-full px-6 py-3 rounded-xl border-2 border-primary-300 hover:bg-primary-50 transition-colors text-sm font-semibold text-primary-600 flex items-center justify-center gap-2"
      >
        {showMore ? <><HiOutlineChevronUp className="w-5 h-5" /> Show Less</> : <><HiOutlineChevronDown className="w-5 h-5" /> Show More Details</>}
      </button>

      {showMore && (
        <>
          <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-6">
            {/* Performance */}
            <Card>
              <div className="flex items-center gap-2 mb-5">
                <HiOutlineChartBar className="w-5 h-5 text-primary-500" />
                <h2 className="font-bold text-secondary-100">Performance Metrics</h2>
              </div>
              <div className="space-y-4">
                {(() => {
                  const finished = jobs.filter((j) => j.status === "completed" || j.status === "delivered");
                  const onTime = finished.filter((j) => !j.dueDate || (j.completedAt && new Date(j.completedAt) <= new Date(j.dueDate!))).length;
                  const pct = finished.length > 0 ? Math.round((onTime / finished.length) * 100) : 0;
                  return (
                    <div>
                      <div className="flex items-center justify-between mb-1.5">
                        <span className="text-sm text-custom-700">On-Time Delivery</span>
                        <span className="text-sm font-bold text-green-600">{pct}%</span>
                      </div>
                      <div className="w-full bg-custom-200 rounded-full h-2"><div className="bg-green-500 h-2 rounded-full" style={{ width: `${pct}%` }} /></div>
                    </div>
                  );
                })()}
                {(() => {
                  const active = jobs.filter((j) => inProgressStatuses.includes(j.status)).length;
                  const pct = totalJobs > 0 ? Math.round((active / totalJobs) * 100) : 0;
                  return (
                    <div>
                      <div className="flex items-center justify-between mb-1.5">
                        <span className="text-sm text-custom-700">Active Job Rate</span>
                        <span className="text-sm font-bold text-primary-600">{pct}%</span>
                      </div>
                      <div className="w-full bg-custom-200 rounded-full h-2"><div className="bg-primary-500 h-2 rounded-full" style={{ width: `${pct}%` }} /></div>
                    </div>
                  );
                })()}
                {(() => {
                  const pct = totalRevenue > 0 ? Math.round((totalPaid / totalRevenue) * 100) : 0;
                  return (
                    <div>
                      <div className="flex items-center justify-between mb-1.5">
                        <span className="text-sm text-custom-700">Payment Collection</span>
                        <span className="text-sm font-bold text-blue-600">{pct}%</span>
                      </div>
                      <div className="w-full bg-custom-200 rounded-full h-2"><div className="bg-blue-500 h-2 rounded-full" style={{ width: `${pct}%` }} /></div>
                    </div>
                  );
                })()}
              </div>
            </Card>

            {/* Staff Overview */}
            <Card>
              <div className="flex items-center gap-2 mb-5">
                <HiOutlineUsers className="w-5 h-5 text-primary-500" />
                <h2 className="font-bold text-secondary-100">Staff Overview</h2>
              </div>
              {employeesData ? (
                <div className="space-y-2">
                  {(() => {
                    const employees = employeesData.data ?? [];
                    const byDept: Record<string, { total: number; active: number }> = {};
                    employees.forEach((emp) => {
                      const dept = (emp as any).department?.name ?? "Unassigned";
                      if (!byDept[dept]) byDept[dept] = { total: 0, active: 0 };
                      byDept[dept].total++;
                      if (emp.isActive) byDept[dept].active++;
                    });
                    return Object.entries(byDept).slice(0, 8).map(([dept, { total, active }]) => (
                      <div key={dept} className="flex items-center justify-between py-1">
                        <span className="text-sm text-secondary-100">{dept}</span>
                        <span className="text-xs text-custom-700"><span className="font-bold text-primary-500">{active}</span>/{total} active</span>
                      </div>
                    ));
                  })()}
                  <div className="pt-2 border-t border-custom-200 flex justify-between text-sm">
                    <span className="font-semibold text-secondary-100">Total Employees</span>
                    <span className="font-bold text-primary-500">{activeEmployees}/{totalEmployees}</span>
                  </div>
                </div>
              ) : (
                <p className="text-sm text-custom-700">Loading…</p>
              )}
            </Card>

            {/* Recent Jobs */}
            <Card>
              <div className="flex items-center gap-2 mb-5">
                <HiOutlineClipboardList className="w-5 h-5 text-primary-500" />
                <h2 className="font-bold text-secondary-100">Recent Jobs</h2>
              </div>
              <div className="space-y-2">
                {recentJobs.map((job) => (
                  <div key={job.id} className="flex items-center justify-between py-2 border-b border-custom-100 last:border-0">
                    <div className="min-w-0">
                      <p className="text-sm font-semibold text-primary-500">{job.jobNumber}</p>
                      <p className="text-xs text-custom-700 truncate">{job.customer?.name ?? "—"}</p>
                    </div>
                    <div className="flex flex-col items-end gap-1 ml-3 shrink-0">
                      <span className={`text-xs font-semibold px-2 py-0.5 rounded-full ${statusColor[job.status] ?? "bg-custom-100 text-custom-800"}`}>
                        {statusLabel(job.status)}
                      </span>
                      <span className="text-xs text-custom-700">{job.dueDate ? new Date(job.dueDate).toLocaleDateString() : "—"}</span>
                    </div>
                  </div>
                ))}
                {recentJobs.length === 0 && <p className="text-sm text-custom-700 text-center py-4">No jobs found</p>}
              </div>
            </Card>
          </div>
        </>
      )}
    </div>
  );
}
