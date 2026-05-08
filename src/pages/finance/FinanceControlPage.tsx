import { useState } from "react";
import {
    HiOutlineCheckCircle,
    HiOutlineClock,
    HiOutlineCurrencyDollar,
    HiOutlineEye,
    HiOutlineSearch,
    HiOutlineX,
    HiOutlineXCircle
} from "react-icons/hi";
import { DashboardLayout } from "../../components";
import { Card } from "../../components/ui";

interface Transaction {
  id: string;
  type: "income" | "expense";
  category: string;
  amount: string;
  description: string;
  date: string;
  status: "approved" | "pending" | "rejected";
  requestedBy: string;
  approvedBy?: string;
}

const initialTransactions: Transaction[] = [
  {
    id: "TXN-001",
    type: "income",
    category: "Client Payment",
    amount: "1,003,000",
    description: "Payment for JOB-001 - ABC Corp",
    date: "2026-05-02",
    status: "approved",
    requestedBy: "Accountant 1",
    approvedBy: "DAF",
  },
  {
    id: "TXN-002",
    type: "expense",
    category: "Material Purchase",
    amount: "450,000",
    description: "Paper stock purchase from Supplier A",
    date: "2026-05-03",
    status: "pending",
    requestedBy: "Stock Manager",
  },
  {
    id: "TXN-003",
    type: "expense",
    category: "Salary",
    amount: "2,500,000",
    description: "Monthly salary payment - April 2026",
    date: "2026-05-01",
    status: "approved",
    requestedBy: "HR Manager",
    approvedBy: "DAF",
  },
  {
    id: "TXN-004",
    type: "expense",
    category: "Equipment Maintenance",
    amount: "180,000",
    description: "Printing machine maintenance",
    date: "2026-05-04",
    status: "pending",
    requestedBy: "Production Manager",
  },
];

export default function FinanceControlPage() {
  const [transactions, setTransactions] = useState<Transaction[]>(initialTransactions);
  const [search, setSearch] = useState("");
  const [filterStatus, setFilterStatus] = useState<"all" | "approved" | "pending" | "rejected">("all");
  const [selectedTransaction, setSelectedTransaction] = useState<Transaction | null>(null);
  const [showDetailsModal, setShowDetailsModal] = useState(false);
  const [showApproveModal, setShowApproveModal] = useState(false);

  const filtered = transactions.filter((txn) => {
    const matchesSearch =
      txn.id.toLowerCase().includes(search.toLowerCase()) ||
      txn.description.toLowerCase().includes(search.toLowerCase()) ||
      txn.category.toLowerCase().includes(search.toLowerCase());
    const matchesStatus = filterStatus === "all" || txn.status === filterStatus;
    return matchesSearch && matchesStatus;
  });

  const totalIncome = transactions
    .filter((t) => t.type === "income" && t.status === "approved")
    .reduce((sum, t) => sum + parseFloat(t.amount.replace(/,/g, "")), 0);

  const totalExpense = transactions
    .filter((t) => t.type === "expense" && t.status === "approved")
    .reduce((sum, t) => sum + parseFloat(t.amount.replace(/,/g, "")), 0);

  const pendingApprovals = transactions.filter((t) => t.status === "pending").length;

  const handleApprove = (txnId: string) => {
    setTransactions(
      transactions.map((t) =>
        t.id === txnId ? { ...t, status: "approved" as const, approvedBy: "DAF" } : t
      )
    );
    setShowApproveModal(false);
    setSelectedTransaction(null);
    alert("Transaction approved successfully!");
  };

  const handleReject = (txnId: string) => {
    setTransactions(
      transactions.map((t) => (t.id === txnId ? { ...t, status: "rejected" as const } : t))
    );
    setShowApproveModal(false);
    setSelectedTransaction(null);
    alert("Transaction rejected!");
  };

  const getStatusConfig = (status: string) => {
    switch (status) {
      case "approved":
        return { color: "text-green-700", bg: "bg-green-100", icon: HiOutlineCheckCircle };
      case "pending":
        return { color: "text-yellow-700", bg: "bg-yellow-100", icon: HiOutlineClock };
      case "rejected":
        return { color: "text-red-700", bg: "bg-red-100", icon: HiOutlineXCircle };
      default:
        return { color: "text-custom-700", bg: "bg-custom-100", icon: HiOutlineClock };
    }
  };

  return (
    <DashboardLayout userRole="daf" userName="DAF" notificationCount={5}>
      <div className="space-y-6 font-[family-name:var(--font-family-primary)]">
        {/* Header */}
        <div>
          <h1 className="text-2xl md:text-3xl font-bold text-secondary-100">Finance Control</h1>
          <p className="text-sm text-custom-700 mt-1">
            Monitor and approve all financial transactions
          </p>
        </div>

        {/* Summary Cards */}
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
          <Card className="!p-4">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-xl bg-green-100 flex items-center justify-center">
                <HiOutlineCurrencyDollar className="w-5 h-5 text-green-600" />
              </div>
              <div>
                <p className="text-xs text-custom-700">Total Income</p>
                <p className="text-xl font-bold text-green-600">
                  {totalIncome.toLocaleString()} RWF
                </p>
              </div>
            </div>
          </Card>
          <Card className="!p-4">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-xl bg-red-100 flex items-center justify-center">
                <HiOutlineCurrencyDollar className="w-5 h-5 text-red-600" />
              </div>
              <div>
                <p className="text-xs text-custom-700">Total Expenses</p>
                <p className="text-xl font-bold text-red-600">
                  {totalExpense.toLocaleString()} RWF
                </p>
              </div>
            </div>
          </Card>
          <Card className="!p-4">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-xl bg-yellow-100 flex items-center justify-center">
                <HiOutlineClock className="w-5 h-5 text-yellow-600" />
              </div>
              <div>
                <p className="text-xs text-custom-700">Pending Approvals</p>
                <p className="text-xl font-bold text-yellow-600">{pendingApprovals}</p>
              </div>
            </div>
          </Card>
        </div>

        {/* Filters */}
        <Card className="!p-4">
          <div className="flex flex-col sm:flex-row gap-3">
            <div className="relative flex-1">
              <HiOutlineSearch className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-custom-700" />
              <input
                type="text"
                placeholder="Search transactions..."
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                className="w-full pl-9 pr-4 py-2 rounded-xl border border-custom-300 bg-style-500 text-secondary-100 text-sm placeholder:text-custom-700 focus:outline-none focus:border-primary-400 focus:ring-2 focus:ring-primary-200"
              />
            </div>
            <div className="flex gap-2">
              {(["all", "pending", "approved", "rejected"] as const).map((status) => (
                <button
                  key={status}
                  onClick={() => setFilterStatus(status)}
                  className={`px-4 py-2 rounded-xl text-sm font-semibold transition-colors ${
                    filterStatus === status
                      ? "bg-primary-500 text-white"
                      : "bg-custom-100 text-custom-700 hover:bg-custom-200"
                  }`}
                >
                  {status.charAt(0).toUpperCase() + status.slice(1)}
                </button>
              ))}
            </div>
          </div>
        </Card>

        {/* Transactions Table */}
        <Card className="!p-0 overflow-hidden">
          <div className="p-4 bg-custom-100 border-b border-custom-300">
            <h2 className="text-lg font-bold text-secondary-100">All Transactions</h2>
          </div>
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead className="bg-custom-50 border-b border-custom-300">
                <tr>
                  <th className="px-4 py-3 text-left text-xs font-bold text-secondary-100 uppercase">
                    Transaction ID
                  </th>
                  <th className="px-4 py-3 text-left text-xs font-bold text-secondary-100 uppercase">
                    Type
                  </th>
                  <th className="px-4 py-3 text-left text-xs font-bold text-secondary-100 uppercase">
                    Category
                  </th>
                  <th className="px-4 py-3 text-left text-xs font-bold text-secondary-100 uppercase">
                    Description
                  </th>
                  <th className="px-4 py-3 text-left text-xs font-bold text-secondary-100 uppercase">
                    Amount
                  </th>
                  <th className="px-4 py-3 text-left text-xs font-bold text-secondary-100 uppercase">
                    Status
                  </th>
                  <th className="px-4 py-3 text-left text-xs font-bold text-secondary-100 uppercase">
                    Date
                  </th>
                  <th className="px-4 py-3 text-right text-xs font-bold text-secondary-100 uppercase">
                    Actions
                  </th>
                </tr>
              </thead>
              <tbody className="bg-white divide-y divide-custom-200">
                {filtered.length === 0 ? (
                  <tr>
                    <td colSpan={8} className="px-4 py-8 text-center text-custom-700">
                      No transactions found
                    </td>
                  </tr>
                ) : (
                  filtered.map((txn) => {
                    const statusConfig = getStatusConfig(txn.status);
                    return (
                      <tr key={txn.id} className="hover:bg-custom-50 transition-colors">
                        <td className="px-4 py-4">
                          <span className="text-sm font-bold text-primary-600">{txn.id}</span>
                        </td>
                        <td className="px-4 py-4">
                          <span
                            className={`text-xs font-bold px-3 py-1 rounded-full ${
                              txn.type === "income"
                                ? "bg-green-100 text-green-700"
                                : "bg-red-100 text-red-700"
                            }`}
                          >
                            {txn.type.toUpperCase()}
                          </span>
                        </td>
                        <td className="px-4 py-4">
                          <span className="text-sm text-secondary-100">{txn.category}</span>
                        </td>
                        <td className="px-4 py-4">
                          <span className="text-sm text-custom-700">{txn.description}</span>
                        </td>
                        <td className="px-4 py-4">
                          <span className="text-sm font-bold text-secondary-100">
                            {txn.amount} RWF
                          </span>
                        </td>
                        <td className="px-4 py-4">
                          <span
                            className={`text-xs font-bold px-3 py-1 rounded-full ${statusConfig.bg} ${statusConfig.color} flex items-center gap-1 w-fit`}
                          >
                            <statusConfig.icon className="w-3 h-3" />
                            {txn.status.toUpperCase()}
                          </span>
                        </td>
                        <td className="px-4 py-4">
                          <span className="text-sm text-custom-700">{txn.date}</span>
                        </td>
                        <td className="px-4 py-4">
                          <div className="flex items-center justify-end gap-2">
                            <button
                              onClick={() => {
                                setSelectedTransaction(txn);
                                setShowDetailsModal(true);
                              }}
                              className="px-3 py-1.5 rounded-lg bg-custom-100 text-custom-700 hover:bg-custom-200 transition-colors text-xs font-semibold"
                            >
                              <HiOutlineEye className="w-3 h-3 inline mr-1" />
                              View
                            </button>
                            {txn.status === "pending" && (
                              <button
                                onClick={() => {
                                  setSelectedTransaction(txn);
                                  setShowApproveModal(true);
                                }}
                                className="px-3 py-1.5 rounded-lg bg-primary-500 text-white hover:bg-primary-600 transition-colors text-xs font-semibold"
                              >
                                Review
                              </button>
                            )}
                          </div>
                        </td>
                      </tr>
                    );
                  })
                )}
              </tbody>
            </table>
          </div>
        </Card>

        {/* Details Modal */}
        {showDetailsModal && selectedTransaction && (
          <div className="fixed inset-0 bg-secondary-100/50 z-50 flex items-center justify-center p-4">
            <Card className="!p-6 max-w-2xl w-full">
              <div className="flex items-start justify-between mb-4">
                <div>
                  <h3 className="text-xl font-bold text-secondary-100">
                    Transaction Details
                  </h3>
                  <p className="text-sm text-custom-700 mt-1">{selectedTransaction.id}</p>
                </div>
                <button
                  onClick={() => setShowDetailsModal(false)}
                  className="text-custom-700 hover:text-secondary-100"
                >
                  <HiOutlineX className="w-6 h-6" />
                </button>
              </div>

              <div className="space-y-4">
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <p className="text-xs text-custom-700 mb-1">Type</p>
                    <p className="text-sm font-semibold text-secondary-100">
                      {selectedTransaction.type.toUpperCase()}
                    </p>
                  </div>
                  <div>
                    <p className="text-xs text-custom-700 mb-1">Category</p>
                    <p className="text-sm font-semibold text-secondary-100">
                      {selectedTransaction.category}
                    </p>
                  </div>
                  <div>
                    <p className="text-xs text-custom-700 mb-1">Amount</p>
                    <p className="text-sm font-semibold text-primary-600">
                      {selectedTransaction.amount} RWF
                    </p>
                  </div>
                  <div>
                    <p className="text-xs text-custom-700 mb-1">Date</p>
                    <p className="text-sm font-semibold text-secondary-100">
                      {selectedTransaction.date}
                    </p>
                  </div>
                  <div>
                    <p className="text-xs text-custom-700 mb-1">Requested By</p>
                    <p className="text-sm font-semibold text-secondary-100">
                      {selectedTransaction.requestedBy}
                    </p>
                  </div>
                  <div>
                    <p className="text-xs text-custom-700 mb-1">Status</p>
                    <p className="text-sm font-semibold text-secondary-100">
                      {selectedTransaction.status.toUpperCase()}
                    </p>
                  </div>
                </div>
                <div>
                  <p className="text-xs text-custom-700 mb-1">Description</p>
                  <p className="text-sm text-secondary-100">
                    {selectedTransaction.description}
                  </p>
                </div>
                {selectedTransaction.approvedBy && (
                  <div>
                    <p className="text-xs text-custom-700 mb-1">Approved By</p>
                    <p className="text-sm font-semibold text-secondary-100">
                      {selectedTransaction.approvedBy}
                    </p>
                  </div>
                )}
              </div>

              <div className="flex gap-3 mt-6">
                <button
                  onClick={() => setShowDetailsModal(false)}
                  className="flex-1 px-4 py-2 rounded-xl border border-custom-300 hover:bg-custom-100 transition-colors text-sm font-semibold text-custom-700"
                >
                  Close
                </button>
              </div>
            </Card>
          </div>
        )}

        {/* Approve/Reject Modal */}
        {showApproveModal && selectedTransaction && (
          <div className="fixed inset-0 bg-secondary-100/50 z-50 flex items-center justify-center p-4">
            <Card className="!p-6 max-w-md w-full">
              <div className="flex items-start justify-between mb-4">
                <div>
                  <h3 className="text-xl font-bold text-secondary-100">Review Transaction</h3>
                  <p className="text-sm text-custom-700 mt-1">{selectedTransaction.id}</p>
                </div>
                <button
                  onClick={() => setShowApproveModal(false)}
                  className="text-custom-700 hover:text-secondary-100"
                >
                  <HiOutlineX className="w-6 h-6" />
                </button>
              </div>

              <div className="space-y-3 mb-6">
                <div>
                  <p className="text-xs text-custom-700">Amount</p>
                  <p className="text-lg font-bold text-primary-600">
                    {selectedTransaction.amount} RWF
                  </p>
                </div>
                <div>
                  <p className="text-xs text-custom-700">Description</p>
                  <p className="text-sm text-secondary-100">{selectedTransaction.description}</p>
                </div>
              </div>

              <div className="flex gap-3">
                <button
                  onClick={() => handleReject(selectedTransaction.id)}
                  className="flex-1 px-4 py-2 rounded-xl bg-red-500 text-white hover:bg-red-600 transition-colors text-sm font-semibold"
                >
                  Reject
                </button>
                <button
                  onClick={() => handleApprove(selectedTransaction.id)}
                  className="flex-1 px-4 py-2 rounded-xl bg-green-500 text-white hover:bg-green-600 transition-colors text-sm font-semibold"
                >
                  Approve
                </button>
              </div>
            </Card>
          </div>
        )}
      </div>
    </DashboardLayout>
  );
}
