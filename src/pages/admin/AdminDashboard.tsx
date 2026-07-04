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
    HiOutlineUsers
} from "react-icons/hi";
import BottleneckDetection from "../../components/BottleneckDetection";
import DelayedJobsTracker from "../../components/DelayedJobsTracker";
import DepartmentBreakdown from "../../components/DepartmentBreakdown";
import LowStockAlerts from "../../components/LowStockAlerts";
import OutstandingBalances from "../../components/OutstandingBalances";
import { Card } from "../../components/ui";
import { useGetJobStatsQuery, useGetJobsQuery } from "../../store/services/jobsService";
import { useGetCustomersQuery } from "../../store/services/customersService";
import { useGetAllEmployeesQuery } from "../../store/services/employeesService";
import { useGetWithdrawalBalanceQuery } from "../../store/services/withdrawalsService";
import { useGetOutstandsQuery } from "../../store/services/outstandsService";

const statusColor: Record<string, string> = {
  "in-printing": "bg-primary-100 text-primary-700",
  "in-binding": "bg-primary-100 text-primary-700",
  "in-composition": "bg-primary-100 text-primary-700",
  "in-montage": "bg-primary-100 text-primary-700",
  "in-packaging": "bg-primary-100 text-primary-700",
  "quality-check": "bg-blue-100 text-blue-700",
  "ready-for-delivery": "bg-purple-100 text-purple-700",
  completed: "bg-green-100 text-green-700",
  delivered: "bg-green-100 text-green-700",
  confirmed: "bg-yellow-100 text-yellow-700",
  pending: "bg-orange-100 text-orange-700",
  rejected: "bg-red-100 text-red-700",
};

function fmt(n: number) {
  return n.toLocaleString("en-RW");
}

function statusLabel(s: string) {
  return s
    .split("-")
    .map((w) => w.charAt(0).toUpperCase() + w.slice(1))
    .join(" ");
}

export default function AdminDashboard() {
  const [showMore, setShowMore] = useState(false);

  // ── Real data ────────────────────────────────────────────────────────────
  const { data: statsData, isLoading: statsLoading } = useGetJobStatsQuery();
  const { data: jobsData } = useGetJobsQuery({ limit: 100 });
  const { data: recentJobsData } = useGetJobsQuery({ limit: 5 });
  const { data: customersData } = useGetCustomersQuery({ limit: 1 });
  const { data: employeesData } = useGetAllEmployeesQuery({ limit: 200 });
  const { data: balanceData } = useGetWithdrawalBalanceQuery();
  const { data: expensesData } = useGetOutstandsQuery({ limit: 5, status: undefined });

  const jobs = jobsData?.jobs ?? [];
  const recentJobs = recentJobsData?.jobs ?? [];
  const totalCustomers = customersData?.total ?? 0;

  // KPI values from stats endpoint
  const jobsInProgress  = statsData?.inProgress ?? 0;
  const completedToday  = statsData?.completedToday ?? 0;
  const delayedJobs     = statsData?.delayed ?? 0;
  const totalRevenue    = statsData?.totalRevenue ?? 0;
  const totalPaid       = statsData?.totalPaid ?? 0;
  const outstanding     = statsData?.outstanding ?? 0;
  const expensesToday   = statsData?.expensesToday ?? 0;
  const withdrawalsToday = statsData?.withdrawalsToday ?? 0;

  const balance     = balanceData ?? { initialAmount: 0, totalPaymentsIn: 0, totalWithdrawalsIn: 0, totalExpensesOut: 0, totalBalance: 0 };
  const recentExpenses = expensesData?.outstands ?? [];

  // Deadline breakdown
  const inProgressStatuses = ["confirmed","in-composition","in-montage","in-printing","in-binding","in-packaging","quality-check","ready-for-delivery"];
  const now = new Date();
  const overdueJobs = useMemo(
    () =>
      jobs.filter(
        (j) =>
          j.dueDate &&
          new Date(j.dueDate) < now &&
          j.status !== "completed" &&
          j.status !== "delivered"
      ),
    [jobs]
  );
  const dueTodayJobs = useMemo(
    () =>
      jobs.filter(
        (j) =>
          j.dueDate &&
          new Date(j.dueDate).toDateString() === now.toDateString() &&
          j.status !== "completed" &&
          j.status !== "delivered"
      ),
    [jobs]
  );
  const oneWeekLater = new Date(now);
  oneWeekLater.setDate(now.getDate() + 7);
  const thisWeekJobs = useMemo(
    () =>
      jobs.filter(
        (j) =>
          j.dueDate &&
          new Date(j.dueDate) > now &&
          new Date(j.dueDate) <= oneWeekLater &&
          j.status !== "completed" &&
          j.status !== "delivered"
      ),
    [jobs]
  );
  const onTrackJobs = useMemo(
    () =>
      jobs.filter(
        (j) =>
          inProgressStatuses.includes(j.status) &&
          (!j.dueDate || new Date(j.dueDate) > oneWeekLater)
      ),
    [jobs]
  );

  const kpis = [
    {
      label: "Jobs In Progress",
      value: statsLoading ? "…" : String(jobsInProgress),
      icon: HiOutlineClipboardList,
      color: "text-primary-500",
      bg: "bg-primary-100",
    },
    {
      label: "Completed Today",
      value: statsLoading ? "…" : String(completedToday),
      icon: HiOutlineCheckCircle,
      color: "text-green-600",
      bg: "bg-green-100",
    },
    {
      label: "Delayed Jobs",
      value: statsLoading ? "…" : String(delayedJobs),
      icon: HiOutlineExclamationCircle,
      color: "text-red-500",
      bg: "bg-red-100",
    },
    {
      label: "Revenue (RWF)",
      value: statsLoading ? "…" : fmt(totalRevenue),
      icon: HiOutlineCurrencyDollar,
      color: "text-yellow-600",
      bg: "bg-yellow-100",
    },
    {
      label: "Payments Received",
      value: statsLoading ? "…" : fmt(totalPaid),
      icon: HiOutlineTrendingUp,
      color: "text-primary-600",
      bg: "bg-primary-100",
    },
    {
      label: "Outstanding",
      value: statsLoading ? "…" : fmt(outstanding),
      icon: HiOutlineClock,
      color: "text-orange-500",
      bg: "bg-orange-100",
    },
    {
      label: "Expenses Today",
      value: statsLoading ? "…" : fmt(expensesToday),
      sub: statsLoading ? "" : `${statsData?.expensesCountToday ?? 0} paid`,
      icon: HiOutlineExclamationCircle,
      color: "text-red-600",
      bg: "bg-red-100",
    },
    {
      label: "Withdrawals Today",
      value: statsLoading ? "…" : fmt(withdrawalsToday),
      sub: statsLoading ? "" : `${statsData?.withdrawalsCountToday ?? 0} records`,
      icon: HiOutlineTrendingUp,
      color: "text-blue-600",
      bg: "bg-blue-100",
    },
  ];

  const dateLabel = new Date().toLocaleDateString("en-US", {
    weekday: "long",
    year: "numeric",
    month: "long",
    day: "numeric",
  });

  return (
    <div className="space-y-8 font-[family-name:var(--font-family-primary)]">
      {/* Header */}
      <div className="flex flex-col xs:flex-row xs:items-center justify-between gap-3">
        <div>
          <h1 className="text-2xl md:text-3xl font-bold text-secondary-100">
            Director Dashboard
          </h1>
          <p className="text-sm text-custom-700 mt-1">
            Real-time overview of all operations — {dateLabel}
          </p>
        </div>
        <span className="inline-flex items-center gap-2 px-3 py-1.5 rounded-full bg-green-100 text-green-700 text-xs font-semibold">
          <span className="w-2 h-2 rounded-full bg-green-500 animate-pulse" />
          Live
        </span>
      </div>

      {/* KPI Grid */}
      <div className="grid grid-cols-2 sm:grid-cols-4 xl:grid-cols-8 gap-3">
        {kpis.map(({ label, value, sub, icon: Icon, color, bg }) => (
          <Card key={label} className="!p-3 flex flex-col gap-2">
            <div className={`w-8 h-8 rounded-lg flex items-center justify-center ${bg}`}>
              <Icon className={`w-4 h-4 ${color}`} />
            </div>
            <div>
              <p className="text-xs text-custom-700 leading-tight">{label}</p>
              <p className={`text-base font-bold text-secondary-100 leading-tight`}>{value}</p>
              {sub && <p className="text-xs text-custom-500 mt-0.5">{sub}</p>}
            </div>
          </Card>
        ))}
      </div>

      {/* Finance row */}
      <div className="grid grid-cols-1 xl:grid-cols-2 gap-6">

        {/* Fund Balance Summary */}
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
              { label: "Initial Amount",   value: balance.initialAmount,    color: "text-secondary-100" },
              { label: "Payments In",      value: balance.totalPaymentsIn,   color: "text-green-600",  prefix: "+" },
              { label: "Withdrawals In",   value: balance.totalWithdrawalsIn,color: "text-blue-600",   prefix: "+" },
              { label: "Expenses Out",     value: balance.totalExpensesOut,  color: "text-red-500",    prefix: "-" },
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

        {/* Recent Expenses */}
        <Card>
          <div className="flex items-center justify-between mb-4">
            <div className="flex items-center gap-2">
              <HiOutlineExclamationCircle className="w-5 h-5 text-primary-500" />
              <h2 className="font-bold text-secondary-100">Recent Expenses</h2>
            </div>
            <a href="/admin/expenses" className="text-xs text-primary-500 hover:underline font-semibold">View all →</a>
          </div>
          {recentExpenses.length === 0 ? (
            <p className="text-sm text-custom-700 text-center py-6">No expenses recorded</p>
          ) : (
            <div className="space-y-2">
              {recentExpenses.map(e => {
                const statusColor: Record<string, string> = {
                  pending:  "bg-yellow-100 text-yellow-700",
                  approved: "bg-blue-100 text-blue-700",
                  paid:     "bg-emerald-100 text-emerald-700",
                  rejected: "bg-red-100 text-red-700",
                };
                return (
                  <div key={e.id} className="flex items-center justify-between py-2 border-b border-custom-100 last:border-0">
                    <div className="min-w-0">
                      <p className="text-sm font-semibold text-secondary-100 truncate">{e.description}</p>
                      <p className="text-xs text-custom-700">{e.ref} · {new Date(e.createdAt).toLocaleDateString()}</p>
                    </div>
                    <div className="flex items-center gap-2 ml-3 shrink-0">
                      <span className={`text-xs font-bold px-2 py-0.5 rounded-full ${statusColor[e.status] ?? ""}`}>{e.status}</span>
                      <span className="text-sm font-bold text-secondary-100">{Number(e.totalAmount).toLocaleString()} RWF</span>
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </Card>
      </div>

      {/* Department / Stock / Balances row */}
      <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-6">
        <DepartmentBreakdown />
        <LowStockAlerts />
        <OutstandingBalances />
      </div>

      {/* Second row */}
      <div className="grid grid-cols-1 xl:grid-cols-2 gap-6">
        <DelayedJobsTracker />
        <BottleneckDetection />
      </div>

      {/* Show More/Less Button */}
      <button
        onClick={() => setShowMore(!showMore)}
        className="w-full px-6 py-3 rounded-xl border-2 border-primary-300 hover:bg-primary-50 transition-colors text-sm font-semibold text-primary-600 flex items-center justify-center gap-2"
      >
        {showMore ? (
          <>Show Less <HiOutlineChevronUp className="w-5 h-5" /></>
        ) : (
          <>Show More Details <HiOutlineChevronDown className="w-5 h-5" /></>
        )}
      </button>

      {/* Collapsible sections */}
      {showMore && (
        <>
          <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-6">
            {/* Performance Metrics */}
            <Card>
              <div className="flex items-center gap-2 mb-5">
                <HiOutlineChartBar className="w-5 h-5 text-primary-500" />
                <h2 className="font-bold text-secondary-100">Performance Metrics</h2>
              </div>
              <div className="space-y-4">
                {/* On-Time Delivery */}
                {(() => {
                  const finished = jobs.filter((j) => j.status === "completed" || j.status === "delivered");
                  const onTime = finished.filter(
                    (j) => !j.dueDate || (j.completedAt && new Date(j.completedAt) <= new Date(j.dueDate!))
                  ).length;
                  const pct = finished.length > 0 ? Math.round((onTime / finished.length) * 100) : 0;
                  return (
                    <div>
                      <div className="flex items-center justify-between mb-2">
                        <span className="text-sm text-custom-700">On-Time Delivery</span>
                        <span className="text-sm font-bold text-green-600">{pct}%</span>
                      </div>
                      <div className="w-full bg-custom-200 rounded-full h-2">
                        <div className="bg-green-500 h-2 rounded-full" style={{ width: `${pct}%` }} />
                      </div>
                    </div>
                  );
                })()}
                {/* Active vs total jobs */}
                {(() => {
                  const total = jobs.length;
                  const active = jobs.filter((j) => inProgressStatuses.includes(j.status)).length;
                  const pct = total > 0 ? Math.round((active / total) * 100) : 0;
                  return (
                    <div>
                      <div className="flex items-center justify-between mb-2">
                        <span className="text-sm text-custom-700">Active Job Rate</span>
                        <span className="text-sm font-bold text-primary-600">{pct}%</span>
                      </div>
                      <div className="w-full bg-custom-200 rounded-full h-2">
                        <div className="bg-primary-500 h-2 rounded-full" style={{ width: `${pct}%` }} />
                      </div>
                    </div>
                  );
                })()}
                {/* Payment collection rate */}
                {(() => {
                  const pct = totalRevenue > 0 ? Math.round((totalPaid / totalRevenue) * 100) : 0;
                  return (
                    <div>
                      <div className="flex items-center justify-between mb-2">
                        <span className="text-sm text-custom-700">Payment Collection</span>
                        <span className="text-sm font-bold text-blue-600">{pct}%</span>
                      </div>
                      <div className="w-full bg-custom-200 rounded-full h-2">
                        <div className="bg-blue-500 h-2 rounded-full" style={{ width: `${pct}%` }} />
                      </div>
                    </div>
                  );
                })()}
              </div>
            </Card>

            {/* Client Overview */}
            <Card>
              <div className="flex items-center gap-2 mb-5">
                <HiOutlineUsers className="w-5 h-5 text-primary-500" />
                <h2 className="font-bold text-secondary-100">Client Overview</h2>
              </div>
              <div className="space-y-4">
                <div className="flex items-center justify-between p-3 rounded-xl bg-primary-50">
                  <div>
                    <p className="text-xs text-custom-700">Total Clients</p>
                    <p className="text-2xl font-bold text-secondary-100">{totalCustomers}</p>
                  </div>
                  <div className="w-12 h-12 rounded-xl bg-primary-500 flex items-center justify-center">
                    <HiOutlineUsers className="w-6 h-6 text-white" />
                  </div>
                </div>
                {/* New clients this month */}
                {(() => {
                  const thisMonth = new Date();
                  const newThisMonth = jobs.filter((j) => {
                    const d = new Date(j.createdAt);
                    return d.getMonth() === thisMonth.getMonth() && d.getFullYear() === thisMonth.getFullYear();
                  });
                  // unique customers from this month's jobs
                  const uniqueNew = new Set(newThisMonth.map((j) => j.customerId)).size;
                  return (
                    <div className="flex items-center justify-between p-3 rounded-xl bg-green-50">
                      <div>
                        <p className="text-xs text-custom-700">Active Clients This Month</p>
                        <p className="text-2xl font-bold text-secondary-100">{uniqueNew}</p>
                      </div>
                      <div className="w-12 h-12 rounded-xl bg-green-500 flex items-center justify-center">
                        <HiOutlineTrendingUp className="w-6 h-6 text-white" />
                      </div>
                    </div>
                  );
                })()}
              </div>
            </Card>

            {/* Upcoming Deadlines */}
            <Card>
              <div className="flex items-center gap-2 mb-5">
                <HiOutlineClock className="w-5 h-5 text-primary-500" />
                <h2 className="font-bold text-secondary-100">Upcoming Deadlines</h2>
              </div>
              <div className="space-y-3">
                {overdueJobs.length > 0 && (
                  <div className="p-3 rounded-xl bg-red-50 border border-red-200">
                    <div className="flex items-center justify-between mb-1">
                      <span className="text-xs font-bold text-red-700">OVERDUE</span>
                      <span className="text-xs font-bold text-red-600">{overdueJobs.length} jobs</span>
                    </div>
                    <p className="text-xs text-red-600 truncate">
                      {overdueJobs.slice(0, 3).map((j) => j.jobNumber).join(", ")}
                      {overdueJobs.length > 3 ? ` +${overdueJobs.length - 3} more` : ""}
                    </p>
                  </div>
                )}
                {dueTodayJobs.length > 0 && (
                  <div className="p-3 rounded-xl bg-orange-50 border border-orange-200">
                    <div className="flex items-center justify-between mb-1">
                      <span className="text-xs font-bold text-orange-700">DUE TODAY</span>
                      <span className="text-xs font-bold text-orange-600">{dueTodayJobs.length} jobs</span>
                    </div>
                    <p className="text-xs text-orange-600">Must be completed by end of day</p>
                  </div>
                )}
                {thisWeekJobs.length > 0 && (
                  <div className="p-3 rounded-xl bg-yellow-50 border border-yellow-200">
                    <div className="flex items-center justify-between mb-1">
                      <span className="text-xs font-bold text-yellow-700">THIS WEEK</span>
                      <span className="text-xs font-bold text-yellow-600">{thisWeekJobs.length} jobs</span>
                    </div>
                    <p className="text-xs text-yellow-600">Due within next 7 days</p>
                  </div>
                )}
                <div className="p-3 rounded-xl bg-green-50 border border-green-200">
                  <div className="flex items-center justify-between mb-1">
                    <span className="text-xs font-bold text-green-700">ON TRACK</span>
                    <span className="text-xs font-bold text-green-600">{onTrackJobs.length} jobs</span>
                  </div>
                  <p className="text-xs text-green-600">Progressing as scheduled</p>
                </div>
                {overdueJobs.length === 0 && dueTodayJobs.length === 0 && thisWeekJobs.length === 0 && (
                  <p className="text-xs text-custom-700 text-center py-4">No upcoming deadlines</p>
                )}
              </div>
            </Card>
          </div>

          {/* Staff Overview */}
          <div className="grid grid-cols-1 xl:grid-cols-2 gap-6">
            <Card>
              <div className="flex items-center gap-2 mb-5">
                <HiOutlineUsers className="w-5 h-5 text-primary-500" />
                <h2 className="font-bold text-secondary-100">Staff Overview</h2>
              </div>
              {employeesData ? (
                <div className="space-y-3">
                  {(() => {
                    const employees = employeesData.data ?? [];
                    const byDept: Record<string, { total: number; active: number }> = {};
                    employees.forEach((emp) => {
                      const deptId = (emp as any).department?.name ?? "Unassigned";
                      if (!byDept[deptId]) byDept[deptId] = { total: 0, active: 0 };
                      byDept[deptId].total++;
                      if (emp.isActive) byDept[deptId].active++;
                    });
                    return Object.entries(byDept).slice(0, 8).map(([dept, { total, active }]) => (
                      <div key={dept} className="flex items-center justify-between">
                        <span className="text-sm text-secondary-100">{dept}</span>
                        <span className="text-xs text-custom-700">
                          <span className="font-bold text-primary-500">{active}</span>/{total} active
                        </span>
                      </div>
                    ));
                  })()}
                  <div className="pt-2 border-t border-custom-200 flex justify-between text-sm">
                    <span className="font-semibold text-secondary-100">Total</span>
                    <span className="font-bold text-primary-500">
                      {(employeesData.data ?? []).filter((e) => e.isActive).length}/
                      {employeesData.total ?? (employeesData.data ?? []).length}
                    </span>
                  </div>
                </div>
              ) : (
                <p className="text-sm text-custom-700">Loading staff data…</p>
              )}
            </Card>

            {/* Recent Jobs Table */}
            <Card>
              <div className="flex items-center gap-2 mb-5">
                <HiOutlineClipboardList className="w-5 h-5 text-primary-500" />
                <h2 className="font-bold text-secondary-100">Recent Jobs</h2>
              </div>
              <div className="overflow-x-auto">
                <table className="w-full text-sm">
                  <thead>
                    <tr className="border-b border-custom-300">
                      <th className="text-left py-2 px-3 text-xs font-semibold text-custom-700 uppercase tracking-wide">Job #</th>
                      <th className="text-left py-2 px-3 text-xs font-semibold text-custom-700 uppercase tracking-wide">Client</th>
                      <th className="text-left py-2 px-3 text-xs font-semibold text-custom-700 uppercase tracking-wide">Status</th>
                      <th className="text-left py-2 px-3 text-xs font-semibold text-custom-700 uppercase tracking-wide">Due</th>
                    </tr>
                  </thead>
                  <tbody>
                    {recentJobs.map((job) => (
                      <tr key={job.id} className="border-b border-custom-200 hover:bg-custom-50 transition-colors">
                        <td className="py-3 px-3 font-semibold text-primary-500">{job.jobNumber}</td>
                        <td className="py-3 px-3 text-secondary-100 max-w-[120px] truncate">
                          {job.customer?.name ?? "—"}
                        </td>
                        <td className="py-3 px-3">
                          <span className={`text-xs font-semibold px-2 py-0.5 rounded-full ${statusColor[job.status] ?? "bg-custom-100 text-custom-800"}`}>
                            {statusLabel(job.status)}
                          </span>
                        </td>
                        <td className="py-3 px-3 text-custom-700">
                          {job.dueDate ? new Date(job.dueDate).toLocaleDateString() : "—"}
                        </td>
                      </tr>
                    ))}
                    {recentJobs.length === 0 && (
                      <tr>
                        <td colSpan={4} className="py-6 text-center text-sm text-custom-700">No jobs found</td>
                      </tr>
                    )}
                  </tbody>
                </table>
              </div>
            </Card>
          </div>
        </>
      )}
    </div>
  );
}
