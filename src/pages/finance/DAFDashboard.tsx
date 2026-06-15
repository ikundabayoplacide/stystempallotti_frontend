import { useMemo } from "react";
import {
  HiOutlineBriefcase,
  HiOutlineCheckCircle,
  HiOutlineClock,
  HiOutlineCurrencyDollar,
  HiOutlineExclamationCircle,
  HiOutlineRefresh,
  HiOutlineUsers,
  HiOutlineXCircle,
} from "react-icons/hi";
import { useNavigate } from "react-router-dom";
import { Card } from "../../components/ui";
import { useGetAllEmployeesQuery } from "../../store/services/employeesService";
import { useGetJobsQuery } from "../../store/services/jobsService";
import { useGetPaymentsQuery } from "../../store/services/paymentsService";

// ─── Helpers ──────────────────────────────────────────────────────────────────

const priorityColor: Record<string, string> = {
  high:   "bg-red-100 text-red-700",
  urgent: "bg-red-200 text-red-800",
  normal: "bg-yellow-100 text-yellow-700",
  low:    "bg-green-100 text-green-700",
};

function fmt(n: number) {
  return n.toLocaleString();
}

// ─── Dashboard ────────────────────────────────────────────────────────────────

export default function DAFDashboard() {
  const navigate = useNavigate();

  // ── Real data queries ──────────────────────────────────────────────────────
  const { data: pendingData, isLoading: loadingPending, refetch: refetchPending } =
    useGetJobsQuery({ status: "pending", limit: 100 });

  const { data: confirmedData, isLoading: loadingConfirmed } =
    useGetJobsQuery({ status: "confirmed", limit: 100 });

  const { data: rejectedData } =
    useGetJobsQuery({ status: "rejected", limit: 100 });

  const { data: paymentsData, isLoading: loadingPayments, refetch: refetchPayments } =
    useGetPaymentsQuery({ limit: 100 });

  const { data: employeesData, isLoading: loadingEmployees } =
    useGetAllEmployeesQuery({ limit: 500 });

  // ── Derived values ─────────────────────────────────────────────────────────
  const pendingJobs   = pendingData?.jobs   ?? [];
  const confirmedJobs = confirmedData?.jobs ?? [];
  const rejectedJobs  = rejectedData?.jobs  ?? [];
  const payments      = paymentsData?.payments ?? [];
  const employees     = employeesData?.data ?? [];

  // Total revenue = sum of all recorded payments
  // amountPaid can be string from the API, so always coerce with Number()
  const totalRevenue = useMemo(
    () => payments.reduce((sum, p) => sum + (Number(p.amountPaid) || 0), 0),
    [payments]
  );

  // Active employees
  const activeEmployees = useMemo(
    () => employees.filter((e) => e.isActive).length,
    [employees]
  );

  // Employees per department
  const deptMap = useMemo(() => {
    const map: Record<string, { total: number; active: number }> = {};
    employees.forEach((e) => {
      const dept = (e as any).department?.name ?? "Unassigned";
      if (!map[dept]) map[dept] = { total: 0, active: 0 };
      map[dept].total += 1;
      if (e.isActive) map[dept].active += 1;
    });
    return map;
  }, [employees]);

  // Recent payments as activity feed (last 5)
  const recentPayments = useMemo(
    () =>
      [...payments]
        .sort((a, b) => new Date(b.paidAt).getTime() - new Date(a.paidAt).getTime())
        .slice(0, 5),
    [payments]
  );

  const isLoading = loadingPending || loadingConfirmed || loadingPayments || loadingEmployees;

  return (
    <div className="space-y-8 font-[family-name:var(--font-family-primary)]">
      {/* Header */}
      <div className="flex flex-col xs:flex-row xs:items-center justify-between gap-3">
        <div>
          <h1 className="text-2xl md:text-3xl font-bold text-secondary-100">DAF Dashboard</h1>
          <p className="text-sm text-custom-700 mt-1">
            Finance Controller & Human Resource Manager ·{" "}
            {new Date().toLocaleDateString("en-US", { weekday: "long", year: "numeric", month: "long", day: "numeric" })}
          </p>
        </div>
        <button
          onClick={() => { refetchPending(); refetchPayments(); }}
          className="flex items-center gap-2 px-3 py-2 rounded-xl border border-custom-300 hover:bg-custom-100 transition-colors text-custom-700 text-sm w-fit self-start xs:self-auto"
        >
          <HiOutlineRefresh className="w-4 h-4" />
          <span className="font-semibold">Refresh</span>
        </button>
      </div>

      {/* KPI Grid */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
        {/* Total Revenue */}
        <Card className="!p-4 overflow-hidden">
          <div className="flex items-start gap-3">
            <div className="w-9 h-9 rounded-xl flex items-center justify-center bg-green-100 shrink-0">
              <HiOutlineCurrencyDollar className="w-4.5 h-4.5 text-green-600" />
            </div>
            <div className="min-w-0 flex-1">
              <p className="text-xs text-custom-700 truncate">Total Revenue</p>
              {loadingPayments ? (
                <div className="h-6 w-20 bg-custom-200 rounded animate-pulse mt-1" />
              ) : (
                <>
                  <p className="text-xl font-bold text-secondary-100 leading-tight truncate">
                    {fmt(totalRevenue)}
                  </p>
                  <p className="text-xs text-custom-700">RWF</p>
                </>
              )}
            </div>
          </div>
        </Card>

        {/* Pending Approvals */}
        <Card className="!p-4 overflow-hidden">
          <div className="flex items-start gap-3">
            <div className="w-9 h-9 rounded-xl flex items-center justify-center bg-yellow-100 shrink-0">
              <HiOutlineClock className="w-4.5 h-4.5 text-yellow-600" />
            </div>
            <div className="min-w-0 flex-1">
              <p className="text-xs text-custom-700 truncate">Pending Approvals</p>
              {loadingPending ? (
                <div className="h-6 w-10 bg-custom-200 rounded animate-pulse mt-1" />
              ) : (
                <>
                  <p className="text-xl font-bold text-yellow-600 leading-tight">{pendingJobs.length}</p>
                  <p className="text-xs text-custom-700">jobs</p>
                </>
              )}
            </div>
          </div>
        </Card>

        {/* Active Employees */}
        <Card className="!p-4 overflow-hidden">
          <div className="flex items-start gap-3">
            <div className="w-9 h-9 rounded-xl flex items-center justify-center bg-primary-100 shrink-0">
              <HiOutlineUsers className="w-4.5 h-4.5 text-primary-500" />
            </div>
            <div className="min-w-0 flex-1">
              <p className="text-xs text-custom-700 truncate">Active Employees</p>
              {loadingEmployees ? (
                <div className="h-6 w-10 bg-custom-200 rounded animate-pulse mt-1" />
              ) : (
                <>
                  <p className="text-xl font-bold text-primary-500 leading-tight">{activeEmployees}</p>
                  <p className="text-xs text-custom-700">of {employees.length} total</p>
                </>
              )}
            </div>
          </div>
        </Card>

        {/* Confirmed Jobs */}
        <Card className="!p-4 overflow-hidden">
          <div className="flex items-start gap-3">
            <div className="w-9 h-9 rounded-xl flex items-center justify-center bg-blue-100 shrink-0">
              <HiOutlineBriefcase className="w-4.5 h-4.5 text-blue-500" />
            </div>
            <div className="min-w-0 flex-1">
              <p className="text-xs text-custom-700 truncate">Confirmed Jobs</p>
              {loadingConfirmed ? (
                <div className="h-6 w-10 bg-custom-200 rounded animate-pulse mt-1" />
              ) : (
                <>
                  <p className="text-xl font-bold text-blue-500 leading-tight">{confirmedJobs.length}</p>
                  <p className="text-xs text-custom-700">in production</p>
                </>
              )}
            </div>
          </div>
        </Card>
      </div>

      {/* Main content: Pending jobs + Recent payments */}
      <div className="grid grid-cols-1 xl:grid-cols-3 gap-6">

        {/* Pending Jobs Approval */}
        <Card className="xl:col-span-2 !p-5">
          <div className="flex items-center justify-between mb-4">
            <div className="flex items-center gap-2">
              <HiOutlineClock className="w-5 h-5 text-yellow-600" />
              <h2 className="font-bold text-secondary-100">
                Pending Job Approvals
                {!loadingPending && (
                  <span className="ml-2 text-sm font-normal text-custom-700">
                    ({pendingJobs.length})
                  </span>
                )}
              </h2>
            </div>
            <button
              onClick={() => navigate("/finance/daf/approvals")}
              className="text-xs font-semibold text-primary-500 hover:underline"
            >
              View all →
            </button>
          </div>

          {loadingPending ? (
            <div className="space-y-3">
              {[1, 2, 3].map((i) => (
                <div key={i} className="h-16 bg-custom-100 rounded-xl animate-pulse" />
              ))}
            </div>
          ) : pendingJobs.length === 0 ? (
            <div className="py-10 text-center">
              <HiOutlineCheckCircle className="w-10 h-10 text-green-400 mx-auto mb-2" />
              <p className="text-sm font-semibold text-secondary-100">All caught up!</p>
              <p className="text-xs text-custom-700 mt-1">No jobs waiting for approval</p>
            </div>
          ) : (
            <div className="space-y-3">
              {pendingJobs.slice(0, 6).map((job) => (
                <div
                  key={job.id}
                  className="p-3 rounded-xl border border-custom-300 hover:border-primary-400 transition-colors"
                >
                  <div className="flex items-start justify-between gap-2">
                    <div className="min-w-0 flex-1">
                      <div className="flex items-center gap-2 flex-wrap">
                        <span className="text-sm font-bold text-primary-500">{job.jobNumber}</span>
                        <span className={`text-xs font-bold px-2 py-0.5 rounded-full ${priorityColor[job.priority] ?? "bg-gray-100 text-gray-700"}`}>
                          {job.priority}
                        </span>
                      </div>
                      <p className="text-sm font-semibold text-secondary-100 truncate mt-0.5">{job.title}</p>
                      <p className="text-xs text-custom-700">
                        {job.customer?.name ?? "—"} ·{" "}
                        {job.dueDate ? job.dueDate.split("T")[0] : "No deadline"}
                      </p>
                    </div>
                    <div className="text-right shrink-0">
                      <p className="text-sm font-bold text-secondary-100">
                        {job.amount != null ? `${Number(job.amount).toLocaleString()} RWF` : "—"}
                      </p>
                    </div>
                  </div>
                </div>
              ))}
              {pendingJobs.length > 6 && (
                <button
                  onClick={() => navigate("/finance/daf/approvals")}
                  className="w-full py-2 text-xs font-semibold text-primary-500 hover:bg-primary-50 rounded-xl transition-colors border border-dashed border-primary-300"
                >
                  + {pendingJobs.length - 6} more pending jobs
                </button>
              )}
            </div>
          )}
        </Card>

        {/* Recent Payments */}
        <Card className="!p-5">
          <div className="flex items-center gap-2 mb-4">
            <HiOutlineCurrencyDollar className="w-5 h-5 text-green-600" />
            <h2 className="font-bold text-secondary-100">Recent Payments</h2>
          </div>

          {loadingPayments ? (
            <div className="space-y-3">
              {[1, 2, 3, 4].map((i) => (
                <div key={i} className="h-14 bg-custom-100 rounded-xl animate-pulse" />
              ))}
            </div>
          ) : recentPayments.length === 0 ? (
            <div className="py-8 text-center text-custom-700 text-sm">No payments recorded yet</div>
          ) : (
            <div className="space-y-3">
              {recentPayments.map((p) => (
                <div key={p.id} className="p-3 rounded-xl bg-custom-50 border border-custom-200">
                  <div className="flex items-start justify-between gap-2">
                    <div className="min-w-0">
                      <p className="text-xs font-bold text-primary-500">{p.receiptNo}</p>
                      <p className="text-xs text-secondary-100 font-semibold truncate">
                        {p.job?.customer?.name ?? p.job?.title ?? "—"}
                      </p>
                      <p className="text-xs text-custom-700">
                        {new Date(p.paidAt).toLocaleDateString()} · {p.paymentMethod}
                      </p>
                    </div>
                    <div className="shrink-0 text-right">
                      <p className="text-sm font-bold text-green-600">
                        {Number(p.amountPaid).toLocaleString()}
                      </p>
                      <p className="text-xs text-custom-700">RWF</p>
                    </div>
                  </div>
                  {Number(p.balance) > 0 && (
                    <p className="text-xs text-red-500 mt-1 font-semibold">
                      Balance: {Number(p.balance).toLocaleString()} RWF
                    </p>
                  )}
                </div>
              ))}
            </div>
          )}
        </Card>
      </div>

      {/* Job Status Overview */}
      <Card className="!p-5">
        <div className="flex items-center gap-2 mb-4">
          <HiOutlineBriefcase className="w-5 h-5 text-primary-500" />
          <h2 className="font-bold text-secondary-100">Job Status Overview</h2>
        </div>
        {isLoading ? (
          <div className="grid grid-cols-3 gap-4">
            {[1, 2, 3].map((i) => (
              <div key={i} className="h-20 bg-custom-100 rounded-xl animate-pulse" />
            ))}
          </div>
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
            <div className="p-4 rounded-xl bg-yellow-50 border border-yellow-200 flex items-center gap-4">
              <div className="w-10 h-10 rounded-xl bg-yellow-100 flex items-center justify-center shrink-0">
                <HiOutlineClock className="w-5 h-5 text-yellow-600" />
              </div>
              <div>
                <p className="text-xs text-yellow-700 font-semibold">Pending</p>
                <p className="text-2xl font-bold text-yellow-700">{pendingJobs.length}</p>
                <p className="text-xs text-yellow-600">
                  {pendingJobs.length > 0
                    ? `${fmt(pendingJobs.reduce((s, j) => s + (Number(j.amount) || 0), 0))} RWF value`
                    : "None waiting"}
                </p>
              </div>
            </div>

            <div className="p-4 rounded-xl bg-green-50 border border-green-200 flex items-center gap-4">
              <div className="w-10 h-10 rounded-xl bg-green-100 flex items-center justify-center shrink-0">
                <HiOutlineCheckCircle className="w-5 h-5 text-green-600" />
              </div>
              <div>
                <p className="text-xs text-green-700 font-semibold">Confirmed</p>
                <p className="text-2xl font-bold text-green-700">{confirmedJobs.length}</p>
                <p className="text-xs text-green-600">
                  {confirmedJobs.length > 0
                    ? `${fmt(confirmedJobs.reduce((s, j) => s + (Number(j.amount) || 0), 0))} RWF value`
                    : "None confirmed"}
                </p>
              </div>
            </div>

            <div className="p-4 rounded-xl bg-red-50 border border-red-200 flex items-center gap-4">
              <div className="w-10 h-10 rounded-xl bg-red-100 flex items-center justify-center shrink-0">
                <HiOutlineXCircle className="w-5 h-5 text-red-500" />
              </div>
              <div>
                <p className="text-xs text-red-700 font-semibold">Rejected</p>
                <p className="text-2xl font-bold text-red-700">{rejectedJobs.length}</p>
                <p className="text-xs text-red-600">
                  {rejectedJobs.length > 0 ? "Review rejection reasons" : "None rejected"}
                </p>
              </div>
            </div>
          </div>
        )}
      </Card>

      {/* HR Summary by Department */}
      <Card className="!p-5">
        <div className="flex items-center justify-between mb-4">
          <div className="flex items-center gap-2">
            <HiOutlineUsers className="w-5 h-5 text-primary-500" />
            <h2 className="font-bold text-secondary-100">HR Summary by Department</h2>
          </div>
          <button
            onClick={() => navigate("/finance/daf/hr")}
            className="text-xs font-semibold text-primary-500 hover:underline"
          >
            Manage HR →
          </button>
        </div>

        {loadingEmployees ? (
          <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-4">
            {[1, 2, 3, 4, 5, 6].map((i) => (
              <div key={i} className="h-24 bg-custom-100 rounded-xl animate-pulse" />
            ))}
          </div>
        ) : Object.keys(deptMap).length === 0 ? (
          <div className="py-8 text-center">
            <HiOutlineExclamationCircle className="w-8 h-8 text-custom-400 mx-auto mb-2" />
            <p className="text-sm text-custom-700">No employee data available</p>
          </div>
        ) : (
          <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-4">
            {Object.entries(deptMap).map(([dept, stats]) => (
              <div key={dept} className="p-4 rounded-xl bg-custom-50 border border-custom-200">
                <h3 className="font-bold text-secondary-100 mb-2 text-xs truncate" title={dept}>
                  {dept}
                </h3>
                <p className="text-2xl font-bold text-primary-500 mb-1">{stats.total}</p>
                <p className="text-xs text-custom-700">
                  {stats.active} active
                </p>
                <div className="mt-2 h-1.5 rounded-full bg-custom-200">
                  <div
                    className="h-1.5 rounded-full bg-primary-400 transition-all"
                    style={{ width: `${stats.total > 0 ? (stats.active / stats.total) * 100 : 0}%` }}
                  />
                </div>
              </div>
            ))}
          </div>
        )}

        {/* Totals */}
        {!loadingEmployees && employees.length > 0 && (
          <div className="mt-4 pt-4 border-t border-custom-200 flex flex-wrap gap-6 text-sm">
            <div>
              <span className="text-custom-700">Total Employees: </span>
              <span className="font-bold text-secondary-100">{employees.length}</span>
            </div>
            <div>
              <span className="text-custom-700">Active: </span>
              <span className="font-bold text-green-600">{activeEmployees}</span>
            </div>
            <div>
              <span className="text-custom-700">Inactive: </span>
              <span className="font-bold text-red-500">{employees.length - activeEmployees}</span>
            </div>
          </div>
        )}
      </Card>
    </div>
  );
}
