import { useState } from "react";
import {
    HiOutlineCheckCircle,
    HiOutlineClock,
    HiOutlineCurrencyDollar,
    HiOutlineEye,
    HiOutlinePlus,
    HiOutlineSearch,
} from "react-icons/hi";
import { DashboardLayout } from "../../components";
import { Button, Card } from "../../components/ui";

interface Payment {
  id: string;
  invoiceId: string;
  client: string;
  amount: string;
  method: string;
  status: "completed" | "pending" | "failed";
  date: string;
}

const initialPayments: Payment[] = [
  {
    id: "PAY-001",
    invoiceId: "INV-001",
    client: "ABC Corp",
    amount: "1,003,000",
    method: "Bank Transfer",
    status: "completed",
    date: "2026-05-02",
  },
  {
    id: "PAY-002",
    invoiceId: "INV-002",
    client: "XYZ Ltd",
    amount: "141,600",
    method: "Mobile Money",
    status: "pending",
    date: "2026-05-03",
  },
];

export default function Accountant1PaymentsPage() {
  const [payments] = useState<Payment[]>(initialPayments);
  const [search, setSearch] = useState("");

  const filtered = payments.filter((pay) =>
    pay.id.toLowerCase().includes(search.toLowerCase()) ||
    pay.client.toLowerCase().includes(search.toLowerCase())
  );

  return (
    <DashboardLayout userRole="accountant" userName="Accountant" notificationCount={3}>
      <div className="space-y-6 font-[family-name:var(--font-family-primary)]">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
          <div>
            <h1 className="text-2xl md:text-3xl font-bold text-secondary-100">Payments</h1>
            <p className="text-sm text-custom-700 mt-1">Track all payment transactions</p>
          </div>
          <Button className="!bg-primary-500 hover:!bg-primary-600 !text-white">
            <HiOutlinePlus className="w-4 h-4 mr-2" />
            Record Payment
          </Button>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
          <Card className="!p-4">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-xl bg-primary-100 flex items-center justify-center">
                <HiOutlineCurrencyDollar className="w-5 h-5 text-primary-600" />
              </div>
              <div>
                <p className="text-xs text-custom-700">Total Payments</p>
                <p className="text-xl font-bold text-secondary-100">{payments.length}</p>
              </div>
            </div>
          </Card>
          <Card className="!p-4">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-xl bg-green-100 flex items-center justify-center">
                <HiOutlineCheckCircle className="w-5 h-5 text-green-600" />
              </div>
              <div>
                <p className="text-xs text-custom-700">Completed</p>
                <p className="text-xl font-bold text-green-600">
                  {payments.filter((p) => p.status === "completed").length}
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
                <p className="text-xs text-custom-700">Pending</p>
                <p className="text-xl font-bold text-yellow-600">
                  {payments.filter((p) => p.status === "pending").length}
                </p>
              </div>
            </div>
          </Card>
        </div>

        <Card className="!p-0 overflow-hidden">
          <div className="p-4 bg-custom-100 border-b border-custom-300">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
              <h2 className="text-lg font-bold text-secondary-100">All Payments</h2>
              <div className="relative w-full sm:w-64">
                <HiOutlineSearch className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-custom-700" />
                <input
                  type="text"
                  placeholder="Search payments..."
                  value={search}
                  onChange={(e) => setSearch(e.target.value)}
                  className="w-full pl-9 pr-4 py-2 rounded-xl border border-custom-300 bg-style-500 text-secondary-100 text-sm placeholder:text-custom-700 focus:outline-none focus:border-primary-400 focus:ring-2 focus:ring-primary-200"
                />
              </div>
            </div>
          </div>
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead className="bg-custom-50 border-b border-custom-300">
                <tr>
                  <th className="px-4 py-3 text-left text-xs font-bold text-secondary-100 uppercase">Payment ID</th>
                  <th className="px-4 py-3 text-left text-xs font-bold text-secondary-100 uppercase">Invoice ID</th>
                  <th className="px-4 py-3 text-left text-xs font-bold text-secondary-100 uppercase">Client</th>
                  <th className="px-4 py-3 text-left text-xs font-bold text-secondary-100 uppercase">Amount</th>
                  <th className="px-4 py-3 text-left text-xs font-bold text-secondary-100 uppercase">Method</th>
                  <th className="px-4 py-3 text-left text-xs font-bold text-secondary-100 uppercase">Status</th>
                  <th className="px-4 py-3 text-left text-xs font-bold text-secondary-100 uppercase">Date</th>
                  <th className="px-4 py-3 text-right text-xs font-bold text-secondary-100 uppercase">Actions</th>
                </tr>
              </thead>
              <tbody className="bg-white divide-y divide-custom-200">
                {filtered.map((payment) => (
                  <tr key={payment.id} className="hover:bg-custom-50 transition-colors">
                    <td className="px-4 py-4">
                      <span className="text-sm font-bold text-primary-600">{payment.id}</span>
                    </td>
                    <td className="px-4 py-4">
                      <span className="text-sm font-bold text-secondary-100">{payment.invoiceId}</span>
                    </td>
                    <td className="px-4 py-4">
                      <span className="text-sm font-semibold text-secondary-100">{payment.client}</span>
                    </td>
                    <td className="px-4 py-4">
                      <span className="text-sm font-bold text-primary-600">{payment.amount} RWF</span>
                    </td>
                    <td className="px-4 py-4">
                      <span className="text-sm text-secondary-100">{payment.method}</span>
                    </td>
                    <td className="px-4 py-4">
                      <span
                        className={`text-xs font-bold px-3 py-1 rounded-full ${
                          payment.status === "completed"
                            ? "bg-green-100 text-green-700"
                            : payment.status === "pending"
                            ? "bg-yellow-100 text-yellow-700"
                            : "bg-red-100 text-red-700"
                        }`}
                      >
                        {payment.status.toUpperCase()}
                      </span>
                    </td>
                    <td className="px-4 py-4">
                      <span className="text-sm text-custom-700">{payment.date}</span>
                    </td>
                    <td className="px-4 py-4">
                      <div className="flex items-center justify-end">
                        <button className="px-3 py-1.5 rounded-lg bg-primary-500 text-white hover:bg-primary-600 transition-colors text-xs font-semibold">
                          <HiOutlineEye className="w-3 h-3 inline mr-1" />
                          View
                        </button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </Card>
      </div>
    </DashboardLayout>
  );
}
