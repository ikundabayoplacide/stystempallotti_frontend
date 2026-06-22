import { useMemo, useState } from "react";
import { HiOutlineChevronDown, HiOutlineChevronUp, HiOutlineCurrencyDollar, HiOutlineExclamation } from "react-icons/hi";
import { Card } from "./ui";
import { useGetJobsQuery } from "../store/services/jobsService";
import { useGetPaymentsQuery } from "../store/services/paymentsService";

export default function OutstandingBalances() {
  const [showAll, setShowAll] = useState(false);
  const { data: jobsData } = useGetJobsQuery({ limit: 500 });
  const { data: paymentsData } = useGetPaymentsQuery({ limit: 500 });

  const jobs = jobsData?.jobs ?? [];
  const payments = paymentsData?.payments ?? [];

  const balances = useMemo(() => {
    const paidByJob: Record<string, number> = {};
    payments.forEach((p) => { paidByJob[p.jobId] = (paidByJob[p.jobId] ?? 0) + (parseFloat(String(p.amountPaid ?? 0)) || 0); });

    return jobs
      .filter((j) => j.status !== "rejected")
      .map((j) => {
        const paid = paidByJob[j.id] ?? 0;
        const balance = Math.max(0, (parseFloat(String(j.amount ?? 0)) || 0) - paid);
        const daysOverdue = j.dueDate
          ? Math.max(0, Math.floor((Date.now() - new Date(j.dueDate).getTime()) / 86400000))
          : 0;
        return { jobId: j.jobNumber, client: j.customer?.name ?? "—", totalAmount: j.amount ?? 0, paidAmount: paid, balance, dueDate: j.dueDate ?? "", daysOverdue };
      })
      .filter((b) => b.balance > 0)
      .sort((a, b) => b.balance - a.balance);
  }, [jobs, payments]);

  const totalOutstanding = balances.reduce((s, b) => s + b.balance, 0);
  const displayed = showAll ? balances : balances.slice(0, 1);

  return (
    <Card className="h-fit">
      <div className="flex items-center gap-2 mb-4">
        <HiOutlineCurrencyDollar className="w-5 h-5 text-orange-500" />
        <h2 className="font-bold text-secondary-100">Outstanding Balances</h2>
        <span className="ml-auto text-xs font-bold px-2 py-1 rounded-full bg-orange-100 text-orange-700">
          {balances.length} Clients
        </span>
      </div>
      <div className="mb-4 p-3 rounded-xl bg-orange-50 border border-orange-200">
        <p className="text-xs text-custom-700">Total Outstanding</p>
        <p className="text-2xl font-bold text-orange-600">{totalOutstanding.toLocaleString()} RWF</p>
      </div>
      <div className="space-y-3">
        {balances.length === 0 && <p className="text-sm text-custom-700 text-center py-4">No outstanding balances</p>}
        {displayed.map((item) => (
          <div key={item.jobId} className="p-3 rounded-xl border-2 border-orange-300 bg-orange-50 hover:shadow-md transition-all cursor-pointer">
            <div className="flex items-start justify-between gap-2 mb-2">
              <div className="flex items-center gap-2">
                <HiOutlineExclamation className="w-4 h-4 text-orange-600 flex-shrink-0" />
                <span className="text-sm font-bold text-secondary-100">{item.client}</span>
              </div>
              {item.daysOverdue > 0 && (
                <span className="text-xs font-bold px-2 py-1 rounded-full bg-red-100 text-red-700">{item.daysOverdue} days overdue</span>
              )}
            </div>
            <div className="grid grid-cols-2 gap-2 text-xs mb-2">
              <div><span className="text-custom-700">Job:</span><span className="ml-1 font-semibold text-primary-500">{item.jobId}</span></div>
              {item.dueDate && <div><span className="text-custom-700">Due:</span><span className="ml-1 font-semibold text-red-600">{item.dueDate.slice(0, 10)}</span></div>}
            </div>
            <div className="space-y-1 text-xs">
              <div className="flex justify-between"><span className="text-custom-700">Total:</span><span className="font-semibold text-secondary-100">{item.totalAmount.toLocaleString()} RWF</span></div>
              <div className="flex justify-between"><span className="text-custom-700">Paid:</span><span className="font-semibold text-green-600">{item.paidAmount.toLocaleString()} RWF</span></div>
              <div className="flex justify-between pt-1 border-t border-orange-200"><span className="font-bold text-custom-700">Balance:</span><span className="font-bold text-orange-600">{item.balance.toLocaleString()} RWF</span></div>
            </div>
          </div>
        ))}
      </div>
      {balances.length > 1 && (
        <button
          onClick={() => setShowAll(!showAll)}
          className="w-full mt-3 px-4 py-2 rounded-xl border border-custom-300 hover:bg-custom-100 transition-colors text-sm font-semibold text-custom-700 flex items-center justify-center gap-2"
        >
          {showAll ? <><span>Show Less</span><HiOutlineChevronUp className="w-4 h-4" /></> : <><span>Show More ({balances.length - 1} more)</span><HiOutlineChevronDown className="w-4 h-4" /></>}
        </button>
      )}
    </Card>
  );
}
