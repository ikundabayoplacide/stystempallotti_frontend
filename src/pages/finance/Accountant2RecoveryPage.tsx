import { useState } from "react";
import {
    HiOutlineCheckCircle,
    HiOutlineClock,
    HiOutlineCurrencyDollar,
    HiOutlineEye,
    HiOutlinePlus,
    HiOutlineSearch,
    HiOutlineX,
} from "react-icons/hi";
import { DashboardLayout } from "../../components";
import { Button, Card } from "../../components/ui";

interface RecoveryCase {
  id: string;
  client: string;
  invoiceId: string;
  amount: string;
  daysOverdue: number;
  status: "pending" | "in-progress" | "recovered" | "written-off";
  assignedTo: string;
  lastContact: string;
}

const initialCases: RecoveryCase[] = [
  {
    id: "REC-001",
    client: "Tech Solutions",
    invoiceId: "INV-003",
    amount: "531,000",
    daysOverdue: 15,
    status: "in-progress",
    assignedTo: "Accountant 2",
    lastContact: "2026-05-02",
  },
  {
    id: "REC-002",
    client: "Design Studio",
    invoiceId: "INV-007",
    amount: "280,000",
    daysOverdue: 30,
    status: "pending",
    assignedTo: "Accountant 2",
    lastContact: "2026-04-28",
  },
  {
    id: "REC-003",
    client: "Marketing Ltd",
    invoiceId: "INV-005",
    amount: "450,000",
    daysOverdue: 5,
    status: "recovered",
    assignedTo: "Accountant 2",
    lastContact: "2026-05-01",
  },
];

export default function Accountant2RecoveryPage() {
  const [cases] = useState<RecoveryCase[]>(initialCases);
  const [search, setSearch] = useState("");
  const [filterStatus, setFilterStatus] = useState<"all" | "pending" | "in-progress" | "recovered" | "written-off">("all");

  const filtered = cases.filter((c) => {
    const matchesSearch =
      c.id.toLowerCase().includes(search.toLowerCase()) ||
      c.client.toLowerCase().includes(search.toLowerCase());
    const matchesStatus = filterStatus === "all" || c.status === filterStatus;
    return matchesSearch && matchesStatus;
  });

  const getStatusConfig = (status: string) => {
    switch (status) {
      case "recovered":
        return { color: "text-green-700", bg: "bg-green-100", icon: HiOutlineCheckCircle };
      case "in-progress":
        return { color: "text-blue-700", bg: "bg-blue-100", icon: HiOutlineClock };
      case "pending":
        return { color: "text-yellow-700", bg: "bg-yellow-100", icon: HiOutlineClock };
      case "written-off":
        return { color: "text-red-700", bg: "bg-red-100", icon: HiOutlineX };
      default:
        return { color: "text-custom-700", bg: "bg-custom-100", icon: HiOutlineClock };
    }
  };

  const totalOutstanding = cases
    .filter((c) => c.status !== "recovered" && c.status !== "written-off")
    .reduce((sum, c) => sum + parseFloat(c.amount.replace(/,/g, "")), 0);

  return (
    <DashboardLayout userRole="accountant" userName="Accountant" notificationCount={4}>
      <div className="space-y-6 font-[family-name:var(--font-family-primary)]">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
          <div>
            <h1 className="text-2xl md:text-3xl font-bold text-secondary-100">Debt Recovery</h1>
            <p className="text-sm text-custom-700 mt-1">Manage overdue payments and recovery cases</p>
          </div>
          <Button className="!bg-primary-500 hover:!bg-primary-600 !text-white">
            <HiOutlinePlus className="w-4 h-4 mr-2" />
            New Recovery Case
          </Button>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-4 gap-4">
          <Card className="!p-4">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-xl bg-primary-100 flex items-center justify-center">
                <HiOutlineCurrencyDollar className="w-5 h-5 text-primary-600" />
              </div>
              <div>
                <p className="text-xs text-custom-700">Total Cases</p>
                <p className="text-xl font-bold text-secondary-100">{cases.length}</p>
              </div>
            </div>
          </Card>
          <Card className="!p-4">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-xl bg-red-100 flex items-center justify-center">
                <HiOutlineCurrencyDollar className="w-5 h-5 text-red-600" />
              </div>
              <div>
                <p className="text-xs text-custom-700">Outstanding</p>
                <p className="text-xl font-bold text-red-600">
                  {totalOutstanding.toLocaleString()} RWF
                </p>
              </div>
            </div>
          </Card>
          <Card className="!p-4">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-xl bg-blue-100 flex items-center justify-center">
                <HiOutlineClock className="w-5 h-5 text-blue-600" />
              </div>
              <div>
                <p className="text-xs text-custom-700">In Progress</p>
                <p className="text-xl font-bold text-blue-600">
                  {cases.filter((c) => c.status === "in-progress").length}
                </p>
              </div>
            </div>
          </Card>
          <Card className="!p-4">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-xl bg-green-100 flex items-center justify-center">
                <HiOutlineCheckCircle className="w-5 h-5 text-green-600" />
              </div>
              <div>
                <p className="text-xs text-custom-700">Recovered</p>
                <p className="text-xl font-bold text-green-600">
                  {cases.filter((c) => c.status === "recovered").length}
                </p>
              </div>
            </div>
          </Card>
        </div>

        <Card className="!p-4">
          <div className="flex flex-col sm:flex-row gap-3">
            <div className="relative flex-1">
              <HiOutlineSearch className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-custom-700" />
              <input
                type="text"
                placeholder="Search recovery cases..."
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                className="w-full pl-9 pr-4 py-2 rounded-xl border border-custom-300 bg-style-500 text-secondary-100 text-sm placeholder:text-custom-700 focus:outline-none focus:border-primary-400 focus:ring-2 focus:ring-primary-200"
              />
            </div>
            <div className="flex gap-2">
              {(["all", "pending", "in-progress", "recovered", "written-off"] as const).map((status) => (
                <button
                  key={status}
                  onClick={() => setFilterStatus(status)}
                  className={`px-4 py-2 rounded-xl text-sm font-semibold transition-colors ${
                    filterStatus === status
                      ? "bg-primary-500 text-white"
                      : "bg-custom-100 text-custom-700 hover:bg-custom-200"
                  }`}
                >
                  {status === "in-progress" ? "In Progress" : status === "written-off" ? "Written Off" : status.charAt(0).toUpperCase() + status.slice(1)}
                </button>
              ))}
            </div>
          </div>
        </Card>

        <Card className="!p-0 overflow-hidden">
          <div className="p-4 bg-custom-100 border-b border-custom-300">
            <h2 className="text-lg font-bold text-secondary-100">Recovery Cases</h2>
          </div>
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead className="bg-custom-50 border-b border-custom-300">
                <tr>
                  <th className="px-4 py-3 text-left text-xs font-bold text-secondary-100 uppercase">Case ID</th>
                  <th className="px-4 py-3 text-left text-xs font-bold text-secondary-100 uppercase">Client</th>
                  <th className="px-4 py-3 text-left text-xs font-bold text-secondary-100 uppercase">Invoice ID</th>
                  <th className="px-4 py-3 text-left text-xs font-bold text-secondary-100 uppercase">Amount</th>
                  <th className="px-4 py-3 text-left text-xs font-bold text-secondary-100 uppercase">Days Overdue</th>
                  <th className="px-4 py-3 text-left text-xs font-bold text-secondary-100 uppercase">Status</th>
                  <th className="px-4 py-3 text-left text-xs font-bold text-secondary-100 uppercase">Last Contact</th>
                  <th className="px-4 py-3 text-right text-xs font-bold text-secondary-100 uppercase">Actions</th>
                </tr>
              </thead>
              <tbody className="bg-white divide-y divide-custom-200">
                {filtered.map((recoveryCase) => {
                  const statusConfig = getStatusConfig(recoveryCase.status);
                  return (
                    <tr key={recoveryCase.id} className="hover:bg-custom-50 transition-colors">
                      <td className="px-4 py-4">
                        <span className="text-sm font-bold text-primary-600">{recoveryCase.id}</span>
                      </td>
                      <td className="px-4 py-4">
                        <span className="text-sm font-semibold text-secondary-100">{recoveryCase.client}</span>
                      </td>
                      <td className="px-4 py-4">
                        <span className="text-sm font-bold text-secondary-100">{recoveryCase.invoiceId}</span>
                      </td>
                      <td className="px-4 py-4">
                        <span className="text-sm font-bold text-red-600">{recoveryCase.amount} RWF</span>
                      </td>
                      <td className="px-4 py-4">
                        <span
                          className={`text-sm font-bold ${
                            recoveryCase.daysOverdue > 30
                              ? "text-red-600"
                              : recoveryCase.daysOverdue > 15
                              ? "text-yellow-600"
                              : "text-custom-700"
                          }`}
                        >
                          {recoveryCase.daysOverdue} days
                        </span>
                      </td>
                      <td className="px-4 py-4">
                        <span
                          className={`text-xs font-bold px-3 py-1 rounded-full ${statusConfig.bg} ${statusConfig.color} flex items-center gap-1 w-fit`}
                        >
                          <statusConfig.icon className="w-3 h-3" />
                          {recoveryCase.status === "in-progress" ? "IN PROGRESS" : recoveryCase.status === "written-off" ? "WRITTEN OFF" : recoveryCase.status.toUpperCase()}
                        </span>
                      </td>
                      <td className="px-4 py-4">
                        <span className="text-sm text-custom-700">{recoveryCase.lastContact}</span>
                      </td>
                      <td className="px-4 py-4">
                        <div className="flex items-center justify-end gap-2">
                          <button className="px-3 py-1.5 rounded-lg bg-primary-500 text-white hover:bg-primary-600 transition-colors text-xs font-semibold">
                            <HiOutlineEye className="w-3 h-3 inline mr-1" />
                            View
                          </button>
                          {recoveryCase.status !== "recovered" && recoveryCase.status !== "written-off" && (
                            <button className="px-3 py-1.5 rounded-lg bg-green-500 text-white hover:bg-green-600 transition-colors text-xs font-semibold">
                              Contact
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
