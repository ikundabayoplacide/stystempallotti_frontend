import { HiOutlineChevronDown, HiOutlineChevronUp, HiOutlineCurrencyDollar, HiOutlineExclamation } from "react-icons/hi";
import { Card } from "./ui";
import { useState } from "react";

interface OutstandingBalance {
  client: string;
  jobId: string;
  invoiceId: string;
  totalAmount: number;
  paidAmount: number;
  balance: number;
  dueDate: string;
  daysOverdue: number;
}

const outstandingBalances: OutstandingBalance[] = [
  {
    client: "Tech Startup",
    jobId: "JOB-008",
    invoiceId: "PI-003",
    totalAmount: 531000,
    paidAmount: 300000,
    balance: 231000,
    dueDate: "2026-04-30",
    daysOverdue: 4,
  },
  {
    client: "Retail Store",
    jobId: "JOB-012",
    invoiceId: "PI-007",
    totalAmount: 450000,
    paidAmount: 0,
    balance: 450000,
    dueDate: "2026-05-01",
    daysOverdue: 3,
  },
  {
    client: "NGO Foundation",
    jobId: "JOB-015",
    invoiceId: "PI-009",
    totalAmount: 680000,
    paidAmount: 400000,
    balance: 280000,
    dueDate: "2026-05-02",
    daysOverdue: 2,
  },
];

export default function OutstandingBalances() {
  const [showAll, setShowAll] = useState(false);
  const totalOutstanding = outstandingBalances.reduce((sum, item) => sum + item.balance, 0);

  const displayedBalances = showAll ? outstandingBalances : outstandingBalances.slice(0, 1);
  const hasMore = outstandingBalances.length > 1;

  return (
    <Card className="h-fit">
      <div className="flex items-center gap-2 mb-4">
        <HiOutlineCurrencyDollar className="w-5 h-5 text-orange-500" />
        <h2 className="font-bold text-secondary-100">Outstanding Balances</h2>
        <span className="ml-auto text-xs font-bold px-2 py-1 rounded-full bg-orange-100 text-orange-700">
          {outstandingBalances.length} Clients
        </span>
      </div>

      <div className="mb-4 p-3 rounded-xl bg-orange-50 border border-orange-200">
        <p className="text-xs text-custom-700">Total Outstanding</p>
        <p className="text-2xl font-bold text-orange-600">
          {totalOutstanding.toLocaleString()} RWF
        </p>
      </div>

      <div className="space-y-3">
        {displayedBalances.map((item) => (
          <div
            key={item.invoiceId}
            className="p-3 rounded-xl border-2 border-orange-300 bg-orange-50 hover:shadow-md transition-all cursor-pointer"
          >
            <div className="flex items-start justify-between gap-2 mb-2">
              <div className="flex items-center gap-2">
                <HiOutlineExclamation className="w-4 h-4 text-orange-600 flex-shrink-0" />
                <span className="text-sm font-bold text-secondary-100">{item.client}</span>
              </div>
              <span className="text-xs font-bold px-2 py-1 rounded-full bg-red-100 text-red-700">
                {item.daysOverdue} days overdue
              </span>
            </div>

            <div className="grid grid-cols-2 gap-2 text-xs mb-2">
              <div>
                <span className="text-custom-700">Job:</span>
                <span className="ml-1 font-semibold text-primary-500">{item.jobId}</span>
              </div>
              <div>
                <span className="text-custom-700">Invoice:</span>
                <span className="ml-1 font-semibold text-secondary-100">{item.invoiceId}</span>
              </div>
            </div>

            <div className="space-y-1 text-xs">
              <div className="flex justify-between">
                <span className="text-custom-700">Total:</span>
                <span className="font-semibold text-secondary-100">
                  {item.totalAmount.toLocaleString()} RWF
                </span>
              </div>
              <div className="flex justify-between">
                <span className="text-custom-700">Paid:</span>
                <span className="font-semibold text-green-600">
                  {item.paidAmount.toLocaleString()} RWF
                </span>
              </div>
              <div className="flex justify-between pt-1 border-t border-orange-200">
                <span className="font-bold text-custom-700">Balance:</span>
                <span className="font-bold text-orange-600">
                  {item.balance.toLocaleString()} RWF
                </span>
              </div>
            </div>

            <div className="mt-2 text-xs text-custom-700">
              Due: <span className="font-semibold text-red-600">{item.dueDate}</span>
            </div>
          </div>
        ))}
      </div>

      {/* Show More/Less Button */}
      {hasMore && (
        <button
          onClick={() => setShowAll(!showAll)}
          className="w-full mt-3 px-4 py-2 rounded-xl border border-custom-300 hover:bg-custom-100 transition-colors text-sm font-semibold text-custom-700 flex items-center justify-center gap-2"
        >
          {showAll ? (
            <>
              Show Less
              <HiOutlineChevronUp className="w-4 h-4" />
            </>
          ) : (
            <>
              Show More ({outstandingBalances.length - 4} more)
              <HiOutlineChevronDown className="w-4 h-4" />
            </>
          )}
        </button>
      )}
    </Card>
  );
}
