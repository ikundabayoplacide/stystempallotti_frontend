import { useMemo } from "react";
import {
  HiOutlineCash,
  HiOutlineCheckCircle,
  HiOutlineClock,
  HiOutlineCurrencyDollar,
  HiOutlineRefresh,
  HiOutlineTrendingDown,
  HiOutlineTrendingUp,
} from "react-icons/hi";
import { useNavigate } from "react-router-dom";
import { DashboardLayout } from "../../components";
import { Card } from "../../components/ui";
import { useGetOutstandsQuery } from "../../store/services/outstandsService";
import { useGetPaymentsQuery } from "../../store/services/paymentsService";
import { useGetWithdrawalBalanceQuery } from "../../store/services/withdrawalsService";

function fmt(n: number) {
  return n.toLocaleString();
}

export default function CashierDashboard() {
  const navigate = useNavigate();

  const { data: allOutstands, isLoading: loadingOutstands, refetch: refetchOutstands } =
    useGetOutstandsQuery({ limit: 1000 });

  const { data: paymentsData, isLoading: loadingPayments, refetch: refetchPayments } =
    useGetPaymentsQuery({ limit: 1000, paymentMethod: "CASH" });

  const { data: balanceData } = useGetWithdrawalBalanceQuery();
  const fundBalance = balanceData?.totalBalance ?? 0;

  // ── Derived values ──────────────────────────────────────────────────────────
  const outstands     = allOutstands?.outstands ?? [];
  const payments      = paymentsData?.payments ?? [];
  const totalReceived = useMemo(
    () => payments.reduce((s, p) => s + (Number(p.amountPaid) || 0), 0),
    [payments]
  );

  const totalExpenses = useMemo(
    () => outstands
      .filter(o => o.status === "approved" || o.status === "paid")
      .reduce((s, o) => s + (Number(o.totalAmount) || 0), 0),
    [outstands]
  );

  const pendingApprovalCount = outstands.filter(o => o.status === "pending").length;
  const approvedPendingPay   = outstands.filter(o => o.status === "approved").length;

  const recentPayments = useMemo(
    () =>
      [...payments]
        .sort((a, b) => new Date(b.paidAt).getTime() - new Date(a.paidAt).getTime())
        .slice(0, 5),
    [payments]
  );

  const recentExpenses = useMemo(
    () =>
      [...outstands]
        .sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime())
        .slice(0, 5),
    [outstands]
  );

  return (
    <DashboardLayout>
    <div className="space-y-8 font-[family-name:var(--font-family-primary)]">
      {/* Header */}
      <div className="flex flex-col xs:flex-row xs:items-center justify-between gap-3">
        <div>
          <h1 className="text-2xl md:text-3xl font-bold text-secondary-100">Cashier Dashboard</h1>
          <p className="text-sm text-custom-700 mt-1">
            Cash Management ·{" "}
            {new Date().toLocaleDateString("en-US", {
              weekday: "long", year: "numeric", month: "long", day: "numeric",
            })}
          </p>
        </div>
        <button
          onClick={() => { refetchOutstands(); refetchPayments(); }}
          className="flex items-center gap-2 px-3 py-2 rounded-xl border border-custom-300 hover:bg-custom-100 transition-colors text-custom-700 text-sm w-fit self-start xs:self-auto"
        >
          <HiOutlineRefresh className="w-4 h-4" />
          <span className="font-semibold">Refresh</span>
        </button>
      </div>

      {/* KPI Grid */}
      <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-4">
        {/* Total Received */}
        <Card
          className="!p-4 overflow-hidden cursor-pointer hover:ring-2 hover:ring-green-400 transition-all"
          onClick={() => navigate("/cashier/payments")}
        >
          <div className="flex items-start gap-3">
            <div className="w-9 h-9 rounded-xl flex items-center justify-center bg-green-100 shrink-0">
              <HiOutlineTrendingUp className="w-5 h-5 text-green-600" />
            </div>
            <div className="min-w-0 flex-1">
              <p className="text-xs text-custom-700 truncate">Amount Received</p>
              {loadingPayments ? (
                <div className="h-6 w-20 bg-custom-200 rounded animate-pulse mt-1" />
              ) : (
                <>
                  <p className="text-xl font-bold text-green-600 leading-tight truncate">
                    {fmt(totalReceived)}
                  </p>
                  <p className="text-xs text-custom-700">RWF</p>
                </>
              )}
            </div>
          </div>
        </Card>

        {/* Total Expenses */}
        <Card
          className="!p-4 overflow-hidden cursor-pointer hover:ring-2 hover:ring-red-400 transition-all"
          onClick={() => navigate("/cashier/expenses")}
        >
          <div className="flex items-start gap-3">
            <div className="w-9 h-9 rounded-xl flex items-center justify-center bg-red-100 shrink-0">
              <HiOutlineTrendingDown className="w-5 h-5 text-red-500" />
            </div>
            <div className="min-w-0 flex-1">
              <p className="text-xs text-custom-700 truncate">Total Expenses</p>
              {loadingOutstands ? (
                <div className="h-6 w-20 bg-custom-200 rounded animate-pulse mt-1" />
              ) : (
                <>
                  <p className="text-xl font-bold text-red-500 leading-tight truncate">
                    {fmt(totalExpenses)}
                  </p>
                  <p className="text-xs text-custom-700">RWF total</p>
                </>
              )}
            </div>
          </div>
        </Card>
          <Card
          className="!p-4 overflow-hidden cursor-pointer hover:ring-2 hover:ring-orange-400 transition-all"
          onClick={() => navigate("/cashier/withdrows")}
        >
          <div className="flex items-start gap-3">
            <div className="w-9 h-9 rounded-xl flex items-center justify-center bg-orange-100 shrink-0">
              <HiOutlineTrendingDown className="w-5 h-5 text-orange-500" />
            </div>
            <div className="min-w-0 flex-1">
              <p className="text-xs text-custom-700 truncate">Total Withdrawals</p>
              <p className="text-xl font-bold text-orange-500 leading-tight truncate">
                {fmt(balanceData?.totalWithdrawalsIn ?? 0)}
              </p>
              <p className="text-xs text-custom-700">RWF</p>
            </div>
          </div>
        </Card>

        {/* Pending Expenses */}
        <Card
          className="!p-4 overflow-hidden cursor-pointer hover:ring-2 hover:ring-yellow-400 transition-all"
          onClick={() => navigate("/cashier/expenses")}
        >
          <div className="flex items-start gap-3">
            <div className="w-9 h-9 rounded-xl flex items-center justify-center bg-yellow-100 shrink-0">
              <HiOutlineClock className="w-5 h-5 text-yellow-600" />
            </div>
            <div className="min-w-0 flex-1">
              <p className="text-xs text-custom-700 truncate">Pending</p>
              {loadingOutstands ? (
                <div className="h-6 w-10 bg-custom-200 rounded animate-pulse mt-1" />
              ) : (
                <>
                  <p className="text-xl font-bold text-yellow-600 leading-tight">{pendingApprovalCount}</p>
                  <p className="text-xs text-custom-700">expenses</p>
                </>
              )}
            </div>
          </div>
        </Card>

        {/* Approved Expenses */}
        <Card
          className="!p-4 overflow-hidden cursor-pointer hover:ring-2 hover:ring-blue-400 transition-all"
          onClick={() => navigate("/cashier/expenses")}
        >
          <div className="flex items-start gap-3">
            <div className="w-9 h-9 rounded-xl flex items-center justify-center bg-blue-100 shrink-0">
              <HiOutlineCheckCircle className="w-5 h-5 text-blue-600" />
            </div>
            <div className="min-w-0 flex-1">
              <p className="text-xs text-custom-700 truncate">Approved</p>
              {loadingOutstands ? (
                <div className="h-6 w-10 bg-custom-200 rounded animate-pulse mt-1" />
              ) : (
                <>
                  <p className="text-xl font-bold text-blue-600 leading-tight">{approvedPendingPay}</p>
                  <p className="text-xs text-custom-700">expenses</p>
                </>
              )}
            </div>
          </div>
        </Card>

        {/* Fund Balance */}
        <Card
          className={`!p-4 overflow-hidden cursor-pointer transition-all ${
            fundBalance >= 0
              ? "hover:ring-2 hover:ring-emerald-400 bg-emerald-50 border-emerald-200"
              : "hover:ring-2 hover:ring-orange-400 bg-orange-50 border-orange-200"
          }`}
          onClick={() => navigate("/cashier/withdraws")}
        >
          <div className="flex items-start gap-3">
            <div className={`w-9 h-9 rounded-xl flex items-center justify-center shrink-0 ${
              fundBalance >= 0 ? "bg-emerald-100" : "bg-orange-100"
            }`}>
              <HiOutlineCurrencyDollar className={`w-5 h-5 ${fundBalance >= 0 ? "text-emerald-600" : "text-orange-600"}`} />
            </div>
            <div className="min-w-0 flex-1">
              <p className="text-xs text-custom-700 truncate">Fund Balance</p>
              <p className={`text-xl font-bold leading-tight truncate ${
                fundBalance >= 0 ? "text-emerald-700" : "text-orange-700"
              }`}>
                {fmt(fundBalance)}
              </p>
              <p className="text-xs text-custom-700">RWF</p>
            </div>
          </div>
        </Card>

        {/* Total Withdrawals */}
      

      </div>

      {/* Cash Flow Summary */}
      <Card className="!p-5">
        <div className="flex items-center gap-2 mb-4">
          <HiOutlineCurrencyDollar className="w-5 h-5 text-primary-500" />
          <h2 className="font-bold text-secondary-100">Cash Flow Summary</h2>
        </div>
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
          <div className="p-4 rounded-xl bg-green-50 border border-green-200">
            <p className="text-xs font-semibold text-green-700">Total Inflow (Received)</p>
            <p className="text-2xl font-bold text-green-700 mt-1">{fmt(totalReceived)}</p>
            <p className="text-xs text-green-600">RWF from all payments done by cash</p>
          </div>
          <div className="p-4 rounded-xl bg-red-50 border border-red-200">
            <p className="text-xs font-semibold text-red-700">Total Outflow (Paid)</p>
            <p className="text-2xl font-bold text-red-700 mt-1">{fmt(totalExpenses)}</p>
            <p className="text-xs text-red-600">RWF in expenses</p>
          </div>
          <div className={`p-4 rounded-xl border ${totalReceived - totalExpenses >= 0 ? "bg-blue-50 border-blue-200" : "bg-orange-50 border-orange-200"}`}>
            <p className={`text-xs font-semibold ${totalReceived - totalExpenses >= 0 ? "text-blue-700" : "text-orange-700"}`}>
              Net Balance
            </p>
            <p className={`text-2xl font-bold mt-1 ${totalReceived - totalExpenses >= 0 ? "text-blue-700" : "text-orange-700"}`}>
              {fmt(totalReceived - totalExpenses)}
            </p>
            <p className={`text-xs ${totalReceived - totalExpenses >= 0 ? "text-blue-600" : "text-orange-600"}`}>
              RWF net cash position
            </p>
          </div>
        </div>
        {pendingApprovalCount > 0 && (
          <div className="mt-4 px-4 py-3 rounded-xl bg-yellow-50 border border-yellow-200 flex items-center gap-3">
            <HiOutlineClock className="w-5 h-5 text-yellow-600 shrink-0" />
            <p className="text-sm text-yellow-700">
              <span className="font-bold">{pendingApprovalCount}</span> expense{pendingApprovalCount !== 1 ? "s" : ""} pending approval —{" "}
              <button onClick={() => navigate("/cashier/expenses")} className="underline font-semibold">review now</button>
            </p>
          </div>
        )}
      </Card>

      {/* Recent Activity */}
      <div className="grid grid-cols-1 xl:grid-cols-2 gap-6">
        {/* Recent Payments Received */}
        <Card className="!p-5">
          <div className="flex items-center justify-between mb-4">
            <div className="flex items-center gap-2">
              <HiOutlineCash className="w-5 h-5 text-green-600" />
              <h2 className="font-bold text-secondary-100">Recent Payments Received</h2>
            </div>
            <button
              onClick={() => navigate("/cashier/payments")}
              className="text-xs font-semibold text-primary-500 hover:underline"
            >
              View all →
            </button>
          </div>

          {loadingPayments ? (
            <div className="space-y-3">
              {[1, 2, 3].map((i) => <div key={i} className="h-14 bg-custom-100 rounded-xl animate-pulse" />)}
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
                      <p className="text-sm font-bold text-green-600">{Number(p.amountPaid).toLocaleString()}</p>
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

        {/* Recent Expenses */}
        <Card className="!p-5">
          <div className="flex items-center justify-between mb-4">
            <div className="flex items-center gap-2">
              <HiOutlineTrendingDown className="w-5 h-5 text-red-500" />
              <h2 className="font-bold text-secondary-100">Recent Expenses</h2>
            </div>
            <button
              onClick={() => navigate("/cashier/expenses")}
              className="text-xs font-semibold text-primary-500 hover:underline"
            >
              View all →
            </button>
          </div>

          {loadingOutstands ? (
            <div className="space-y-3">
              {[1, 2, 3].map((i) => <div key={i} className="h-14 bg-custom-100 rounded-xl animate-pulse" />)}
            </div>
          ) : recentExpenses.length === 0 ? (
            <div className="py-8 text-center text-custom-700 text-sm">No expenses recorded yet</div>
          ) : (
            <div className="space-y-3">
              {recentExpenses.map((e) => {
                const statusColor: Record<string, string> = {
                  pending:  "bg-yellow-100 text-yellow-700",
                  approved: "bg-blue-100 text-blue-700",
                  paid:     "bg-emerald-100 text-emerald-700",
                  rejected: "bg-red-100 text-red-700",
                };
                return (
                  <div key={e.id} className="p-3 rounded-xl bg-custom-50 border border-custom-200">
                    <div className="flex items-start justify-between gap-2">
                      <div className="min-w-0 flex-1">
                        <p className="text-xs font-bold text-primary-500">{e.ref}</p>
                        <p className="text-xs text-secondary-100 font-semibold truncate">{e.description}</p>
                        <p className="text-xs text-custom-700">{e.recipientName} · {e.category}</p>
                      </div>
                      <div className="shrink-0 text-right">
                        <p className="text-sm font-bold text-red-500">{Number(e.totalAmount).toLocaleString()}</p>
                        <p className="text-xs text-custom-700">RWF</p>
                        <span className={`text-[10px] font-bold px-1.5 py-0.5 rounded-full mt-1 inline-block ${statusColor[e.status] ?? ""}`}>
                          {e.status}
                        </span>
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </Card>
      </div>


    </div>
    </DashboardLayout>
  );
}
