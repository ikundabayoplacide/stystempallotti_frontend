import { useState } from "react";
import {
  HiOutlineCash, HiOutlineSearch, HiOutlineRefresh,
  HiOutlineDocumentText, HiOutlineCheckCircle,
} from "react-icons/hi";
import DashboardLayout from "../../components/DashboardLayout";
import { Card } from "../../components/ui";
import { useGetPaymentsQuery } from "../../store/services/paymentsService";

const PAGE_SIZE = 15;

export default function CashierPaymentsPage() {
  const [page, setPage]     = useState(1);
  const [search, setSearch] = useState("");

  const { data, isLoading, isFetching, refetch } = useGetPaymentsQuery({ page, limit: PAGE_SIZE });
  const payments   = data?.payments ?? [];
  const totalPages = data?.totalPages ?? 1;
  const total      = data?.total ?? 0;

  const filtered = payments.filter(p => {
    const q = search.toLowerCase();
    return !q ||
      p.receiptNo?.toLowerCase().includes(q) ||
      (p.job?.customer?.name ?? "").toLowerCase().includes(q) ||
      (p.job?.jobNumber ?? "").toLowerCase().includes(q);
  });

  const totalReceived = payments.reduce((s, p) => s + Number(p.amountPaid), 0);
  const totalBalance  = payments.reduce((s, p) => s + Number(p.balance),    0);
  const fullPay  = payments.filter(p => p.paymentState === "FULL").length;
  const partial  = payments.filter(p => p.paymentState === "PARTIAL").length;

  const methodColor: Record<string, string> = {
    CASH:         "bg-green-100 text-green-700",
    MOBILE_MONEY: "bg-blue-100 text-blue-700",
    BANK_TRANSFER:"bg-purple-100 text-purple-700",
    CHEQUE:       "bg-orange-100 text-orange-700",
  };

  return (
    <DashboardLayout>
      <div className="space-y-6 font-[family-name:var(--font-family-primary)]">

        {/* Header */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
          <div>
            <div className="flex items-center gap-2 mb-1">
              <HiOutlineCash className="w-6 h-6 text-green-500" />
              <h1 className="text-2xl md:text-3xl font-bold text-secondary-100">Payments Received</h1>
            </div>
            <p className="text-sm text-custom-700">All incoming payments collected — {total} records</p>
          </div>
          <button onClick={() => refetch()} className="p-2 rounded-xl border border-custom-300 hover:bg-custom-100 transition-colors self-start sm:self-auto">
            <HiOutlineRefresh className={`w-4 h-4 text-custom-700 ${isFetching ? "animate-spin" : ""}`} />
          </button>
        </div>

        {/* KPIs */}
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
          <Card className="!p-4">
            <p className="text-xs text-custom-700">Total Received</p>
            <p className="text-xl font-bold text-green-600">{totalReceived.toLocaleString()}</p>
            <p className="text-xs text-custom-700">RWF</p>
          </Card>
          <Card className="!p-4">
            <p className="text-xs text-custom-700">Outstanding Balance</p>
            <p className="text-xl font-bold text-red-500">{totalBalance.toLocaleString()}</p>
            <p className="text-xs text-custom-700">RWF</p>
          </Card>
          <Card className="!p-4">
            <p className="text-xs text-custom-700">Full Payments</p>
            <p className="text-xl font-bold text-secondary-100">{fullPay}</p>
            <p className="text-xs text-custom-700">transactions</p>
          </Card>
          <Card className="!p-4">
            <p className="text-xs text-custom-700">Partial Payments</p>
            <p className="text-xl font-bold text-yellow-600">{partial}</p>
            <p className="text-xs text-custom-700">transactions</p>
          </Card>
        </div>

        {/* Search */}
        <div className="relative max-w-sm">
          <HiOutlineSearch className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-custom-400" />
          <input value={search} onChange={e => setSearch(e.target.value)} placeholder="Search receipt, customer, job…"
            className="w-full pl-9 pr-3 py-2 rounded-xl border border-custom-300 bg-style-500 text-secondary-100 text-sm focus:outline-none focus:border-primary-400 transition-colors" />
        </div>

        {/* Table */}
        <Card className="!p-0 overflow-hidden">
          {isLoading ? (
            <div className="space-y-3 p-4">{[1,2,3,4,5].map(i => <div key={i} className="h-14 bg-custom-100 rounded-xl animate-pulse" />)}</div>
          ) : filtered.length === 0 ? (
            <div className="py-16 text-center">
              <HiOutlineDocumentText className="w-10 h-10 text-custom-300 mx-auto mb-2" />
              <p className="text-sm text-custom-700">No payments found</p>
            </div>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full text-sm">
                <thead className="bg-custom-50 border-b border-custom-200">
                  <tr>
                    {["Receipt No", "Customer", "Job", "Method", "Amount (RWF)", "Balance (RWF)", "State", "Date"].map(h => (
                      <th key={h} className="px-4 py-3 text-left text-xs font-bold text-custom-500 uppercase tracking-wider whitespace-nowrap">{h}</th>
                    ))}
                  </tr>
                </thead>
                <tbody className="divide-y divide-custom-100">
                  {filtered.map(p => (
                    <tr key={p.id} className="hover:bg-custom-50 transition-colors">
                      <td className="px-4 py-3 font-bold text-primary-500 whitespace-nowrap">{p.receiptNo}</td>
                      <td className="px-4 py-3 text-secondary-100 font-semibold whitespace-nowrap">{p.job?.customer?.name ?? "—"}</td>
                      <td className="px-4 py-3 text-secondary-100 whitespace-nowrap">{p.job?.jobNumber ?? "—"}</td>
                      <td className="px-4 py-3">
                        <span className={`text-xs font-bold px-2 py-0.5 rounded-full ${methodColor[p.paymentMethod ?? ""] ?? "bg-gray-100 text-gray-700"}`}>
                          {(p.paymentMethod ?? "—").replace("_", " ")}
                        </span>
                      </td>
                      <td className="px-4 py-3 font-bold text-green-600 whitespace-nowrap">{Number(p.amountPaid).toLocaleString()}</td>
                      <td className="px-4 py-3 whitespace-nowrap">
                        {Number(p.balance) > 0
                          ? <span className="font-bold text-red-500">{Number(p.balance).toLocaleString()}</span>
                          : <span className="flex items-center gap-1 text-emerald-600 font-semibold"><HiOutlineCheckCircle className="w-3.5 h-3.5" /> Cleared</span>
                        }
                      </td>
                      <td className="px-4 py-3">
                        <span className={`text-xs font-bold px-2.5 py-1 rounded-full ${p.paymentState === "FULL" ? "bg-emerald-100 text-emerald-700" : "bg-yellow-100 text-yellow-700"}`}>
                          {p.paymentState}
                        </span>
                      </td>
                      <td className="px-4 py-3 text-custom-700 whitespace-nowrap">{new Date(p.paidAt).toLocaleDateString()}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </Card>

        {/* Pagination */}
        {totalPages > 1 && (
          <div className="flex items-center justify-center gap-2">
            <button onClick={() => setPage(p => Math.max(1, p - 1))} disabled={page === 1}
              className="px-3 py-1.5 rounded-lg border border-custom-300 text-sm font-semibold text-secondary-100 hover:bg-custom-100 disabled:opacity-40 transition-colors">← Prev</button>
            <span className="text-sm text-custom-700">Page {page} of {totalPages}</span>
            <button onClick={() => setPage(p => Math.min(totalPages, p + 1))} disabled={page === totalPages}
              className="px-3 py-1.5 rounded-lg border border-custom-300 text-sm font-semibold text-secondary-100 hover:bg-custom-100 disabled:opacity-40 transition-colors">Next →</button>
          </div>
        )}

      </div>
    </DashboardLayout>
  );
}
