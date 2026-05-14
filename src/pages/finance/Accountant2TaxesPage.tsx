import { useState } from "react";
import {
    HiOutlineCheckCircle,
    HiOutlineClock,
    HiOutlineDocumentText,
    HiOutlineEye,
    HiOutlinePlus,
    HiOutlineSearch,
} from "react-icons/hi";
import { DashboardLayout } from "../../components";
import { Button, Card } from "../../components/ui";

interface TaxRecord {
  id: string;
  period: string;
  type: string;
  amount: string;
  status: "paid" | "pending" | "overdue";
  dueDate: string;
  paidDate?: string;
}

const initialTaxRecords: TaxRecord[] = [
  {
    id: "TAX-001",
    period: "Q1 2026",
    type: "VAT",
    amount: "1,250,000",
    status: "paid",
    dueDate: "2026-04-30",
    paidDate: "2026-04-28",
  },
  {
    id: "TAX-002",
    period: "April 2026",
    type: "PAYE",
    amount: "850,000",
    status: "pending",
    dueDate: "2026-05-15",
  },
  {
    id: "TAX-003",
    period: "Q1 2026",
    type: "Corporate Tax",
    amount: "2,100,000",
    status: "paid",
    dueDate: "2026-04-30",
    paidDate: "2026-04-29",
  },
];

export default function Accountant2TaxesPage() {
  const [taxRecords] = useState<TaxRecord[]>(initialTaxRecords);
  const [search, setSearch] = useState("");

  const filtered = taxRecords.filter((tax) =>
    tax.id.toLowerCase().includes(search.toLowerCase()) ||
    tax.type.toLowerCase().includes(search.toLowerCase())
  );

  const getStatusConfig = (status: string) => {
    switch (status) {
      case "paid":
        return { color: "text-green-700", bg: "bg-green-100", icon: HiOutlineCheckCircle };
      case "pending":
        return { color: "text-yellow-700", bg: "bg-yellow-100", icon: HiOutlineClock };
      case "overdue":
        return { color: "text-red-700", bg: "bg-red-100", icon: HiOutlineClock };
      default:
        return { color: "text-custom-700", bg: "bg-custom-100", icon: HiOutlineClock };
    }
  };

  return (
    <DashboardLayout userRole="accountant" userName="Accountant" notificationCount={4}>
      <div className="space-y-6 font-[family-name:var(--font-family-primary)]">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
          <div>
            <h1 className="text-2xl md:text-3xl font-bold text-secondary-100">Tax Management</h1>
            <p className="text-sm text-custom-700 mt-1">Track and manage tax obligations</p>
          </div>
          <Button className="!bg-primary-500 hover:!bg-primary-600 !text-white">
            <HiOutlinePlus className="w-4 h-4 mr-2" />
            Record Tax Payment
          </Button>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
          <Card className="!p-4">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-xl bg-primary-100 flex items-center justify-center">
                <HiOutlineDocumentText className="w-5 h-5 text-primary-600" />
              </div>
              <div>
                <p className="text-xs text-custom-700">Total Tax Records</p>
                <p className="text-xl font-bold text-secondary-100">{taxRecords.length}</p>
              </div>
            </div>
          </Card>
          <Card className="!p-4">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-xl bg-green-100 flex items-center justify-center">
                <HiOutlineCheckCircle className="w-5 h-5 text-green-600" />
              </div>
              <div>
                <p className="text-xs text-custom-700">Paid</p>
                <p className="text-xl font-bold text-green-600">
                  {taxRecords.filter((t) => t.status === "paid").length}
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
                  {taxRecords.filter((t) => t.status === "pending").length}
                </p>
              </div>
            </div>
          </Card>
        </div>

        <Card className="!p-0 overflow-hidden">
          <div className="p-4 bg-custom-100 border-b border-custom-300">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
              <h2 className="text-lg font-bold text-secondary-100">Tax Records</h2>
              <div className="relative w-full sm:w-64">
                <HiOutlineSearch className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-custom-700" />
                <input
                  type="text"
                  placeholder="Search tax records..."
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
                  <th className="px-4 py-3 text-left text-xs font-bold text-secondary-100 uppercase">Tax ID</th>
                  <th className="px-4 py-3 text-left text-xs font-bold text-secondary-100 uppercase">Period</th>
                  <th className="px-4 py-3 text-left text-xs font-bold text-secondary-100 uppercase">Type</th>
                  <th className="px-4 py-3 text-left text-xs font-bold text-secondary-100 uppercase">Amount</th>
                  <th className="px-4 py-3 text-left text-xs font-bold text-secondary-100 uppercase">Status</th>
                  <th className="px-4 py-3 text-left text-xs font-bold text-secondary-100 uppercase">Due Date</th>
                  <th className="px-4 py-3 text-left text-xs font-bold text-secondary-100 uppercase">Paid Date</th>
                  <th className="px-4 py-3 text-right text-xs font-bold text-secondary-100 uppercase">Actions</th>
                </tr>
              </thead>
              <tbody className="bg-white divide-y divide-custom-200">
                {filtered.map((tax) => {
                  const statusConfig = getStatusConfig(tax.status);
                  return (
                    <tr key={tax.id} className="hover:bg-custom-50 transition-colors">
                      <td className="px-4 py-4">
                        <span className="text-sm font-bold text-primary-600">{tax.id}</span>
                      </td>
                      <td className="px-4 py-4">
                        <span className="text-sm font-semibold text-secondary-100">{tax.period}</span>
                      </td>
                      <td className="px-4 py-4">
                        <span className="text-sm text-secondary-100">{tax.type}</span>
                      </td>
                      <td className="px-4 py-4">
                        <span className="text-sm font-bold text-primary-600">{tax.amount} RWF</span>
                      </td>
                      <td className="px-4 py-4">
                        <span
                          className={`text-xs font-bold px-3 py-1 rounded-full ${statusConfig.bg} ${statusConfig.color} flex items-center gap-1 w-fit`}
                        >
                          <statusConfig.icon className="w-3 h-3" />
                          {tax.status.toUpperCase()}
                        </span>
                      </td>
                      <td className="px-4 py-4">
                        <span className="text-sm text-custom-700">{tax.dueDate}</span>
                      </td>
                      <td className="px-4 py-4">
                        <span className="text-sm text-custom-700">{tax.paidDate || "-"}</span>
                      </td>
                      <td className="px-4 py-4">
                        <div className="flex items-center justify-end gap-2">
                          <button className="px-3 py-1.5 rounded-lg bg-primary-500 text-white hover:bg-primary-600 transition-colors text-xs font-semibold">
                            <HiOutlineEye className="w-3 h-3 inline mr-1" />
                            View
                          </button>
                          {tax.status === "pending" && (
                            <button className="px-3 py-1.5 rounded-lg bg-green-500 text-white hover:bg-green-600 transition-colors text-xs font-semibold">
                              Mark Paid
                            </button>
                          )}
                        </div>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        </Card>
      </div>
    </DashboardLayout>
  );
}
