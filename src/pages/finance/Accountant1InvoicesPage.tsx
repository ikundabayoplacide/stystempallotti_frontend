import { useState } from "react";
import {
    HiOutlineCheckCircle,
    HiOutlineClock,
    HiOutlineDocumentText,
    HiOutlineEye,
    HiOutlinePlus,
    HiOutlineSearch,
    HiOutlineX,
} from "react-icons/hi";
import { DashboardLayout } from "../../components";
import { Button, Card } from "../../components/ui";

interface Invoice {
  id: string;
  jobId: string;
  client: string;
  amount: string;
  tax: string;
  total: string;
  status: "draft" | "sent" | "paid" | "overdue";
  dueDate: string;
  issueDate: string;
}

const initialInvoices: Invoice[] = [
  {
    id: "INV-001",
    jobId: "JOB-001",
    client: "ABC Corp",
    amount: "850,000",
    tax: "153,000",
    total: "1,003,000",
    status: "paid",
    dueDate: "2026-05-15",
    issueDate: "2026-04-28",
  },
  {
    id: "INV-002",
    jobId: "JOB-002",
    client: "XYZ Ltd",
    amount: "120,000",
    tax: "21,600",
    total: "141,600",
    status: "sent",
    dueDate: "2026-05-20",
    issueDate: "2026-05-01",
  },
  {
    id: "INV-003",
    jobId: "JOB-003",
    client: "Tech Solutions",
    amount: "450,000",
    tax: "81,000",
    total: "531,000",
    status: "overdue",
    dueDate: "2026-05-05",
    issueDate: "2026-04-20",
  },
];

export default function Accountant1InvoicesPage() {
  const [invoices] = useState<Invoice[]>(initialInvoices);
  const [search, setSearch] = useState("");
  const [filterStatus, setFilterStatus] = useState<"all" | "draft" | "sent" | "paid" | "overdue">("all");
  const [showCreateModal, setShowCreateModal] = useState(false);

  const filtered = invoices.filter((inv) => {
    const matchesSearch =
      inv.id.toLowerCase().includes(search.toLowerCase()) ||
      inv.client.toLowerCase().includes(search.toLowerCase()) ||
      inv.jobId.toLowerCase().includes(search.toLowerCase());
    const matchesStatus = filterStatus === "all" || inv.status === filterStatus;
    return matchesSearch && matchesStatus;
  });

  const getStatusConfig = (status: string) => {
    switch (status) {
      case "paid":
        return { color: "text-green-700", bg: "bg-green-100", icon: HiOutlineCheckCircle };
      case "sent":
        return { color: "text-blue-700", bg: "bg-blue-100", icon: HiOutlineClock };
      case "draft":
        return { color: "text-custom-700", bg: "bg-custom-100", icon: HiOutlineDocumentText };
      case "overdue":
        return { color: "text-red-700", bg: "bg-red-100", icon: HiOutlineX };
      default:
        return { color: "text-custom-700", bg: "bg-custom-100", icon: HiOutlineClock };
    }
  };

  return (
    <DashboardLayout userRole="accountant1" userName="Accountant 1" notificationCount={3}>
      <div className="space-y-6 font-[family-name:var(--font-family-primary)]">
        {/* Header */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
          <div>
            <h1 className="text-2xl md:text-3xl font-bold text-secondary-100">Invoices</h1>
            <p className="text-sm text-custom-700 mt-1">Manage and track all invoices</p>
          </div>
          <Button
            onClick={() => setShowCreateModal(true)}
            className="!bg-primary-500 hover:!bg-primary-600 !text-white"
          >
            <HiOutlinePlus className="w-4 h-4 mr-2" />
            Create Invoice
          </Button>
        </div>

        {/* Summary Cards */}
        <div className="grid grid-cols-1 sm:grid-cols-4 gap-4">
          <Card className="!p-4">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-xl bg-primary-100 flex items-center justify-center">
                <HiOutlineDocumentText className="w-5 h-5 text-primary-600" />
              </div>
              <div>
                <p className="text-xs text-custom-700">Total Invoices</p>
                <p className="text-xl font-bold text-secondary-100">{invoices.length}</p>
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
                  {invoices.filter((i) => i.status === "paid").length}
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
                <p className="text-xs text-custom-700">Sent</p>
                <p className="text-xl font-bold text-blue-600">
                  {invoices.filter((i) => i.status === "sent").length}
                </p>
              </div>
            </div>
          </Card>
          <Card className="!p-4">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-xl bg-red-100 flex items-center justify-center">
                <HiOutlineX className="w-5 h-5 text-red-600" />
              </div>
              <div>
                <p className="text-xs text-custom-700">Overdue</p>
                <p className="text-xl font-bold text-red-600">
                  {invoices.filter((i) => i.status === "overdue").length}
                </p>
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
                placeholder="Search invoices..."
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                className="w-full pl-9 pr-4 py-2 rounded-xl border border-custom-300 bg-style-500 text-secondary-100 text-sm placeholder:text-custom-700 focus:outline-none focus:border-primary-400 focus:ring-2 focus:ring-primary-200"
              />
            </div>
            <div className="flex gap-2">
              {(["all", "draft", "sent", "paid", "overdue"] as const).map((status) => (
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

        {/* Invoices Table */}
        <Card className="!p-0 overflow-hidden">
          <div className="p-4 bg-custom-100 border-b border-custom-300">
            <h2 className="text-lg font-bold text-secondary-100">All Invoices</h2>
          </div>
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead className="bg-custom-50 border-b border-custom-300">
                <tr>
                  <th className="px-4 py-3 text-left text-xs font-bold text-secondary-100 uppercase">
                    Invoice ID
                  </th>
                  <th className="px-4 py-3 text-left text-xs font-bold text-secondary-100 uppercase">
                    Job ID
                  </th>
                  <th className="px-4 py-3 text-left text-xs font-bold text-secondary-100 uppercase">
                    Client
                  </th>
                  <th className="px-4 py-3 text-left text-xs font-bold text-secondary-100 uppercase">
                    Amount
                  </th>
                  <th className="px-4 py-3 text-left text-xs font-bold text-secondary-100 uppercase">
                    Tax
                  </th>
                  <th className="px-4 py-3 text-left text-xs font-bold text-secondary-100 uppercase">
                    Total
                  </th>
                  <th className="px-4 py-3 text-left text-xs font-bold text-secondary-100 uppercase">
                    Status
                  </th>
                  <th className="px-4 py-3 text-left text-xs font-bold text-secondary-100 uppercase">
                    Due Date
                  </th>
                  <th className="px-4 py-3 text-right text-xs font-bold text-secondary-100 uppercase">
                    Actions
                  </th>
                </tr>
              </thead>
              <tbody className="bg-white divide-y divide-custom-200">
                {filtered.length === 0 ? (
                  <tr>
                    <td colSpan={9} className="px-4 py-8 text-center text-custom-700">
                      No invoices found
                    </td>
                  </tr>
                ) : (
                  filtered.map((invoice) => {
                    const statusConfig = getStatusConfig(invoice.status);
                    return (
                      <tr key={invoice.id} className="hover:bg-custom-50 transition-colors">
                        <td className="px-4 py-4">
                          <span className="text-sm font-bold text-primary-600">{invoice.id}</span>
                        </td>
                        <td className="px-4 py-4">
                          <span className="text-sm font-bold text-secondary-100">{invoice.jobId}</span>
                        </td>
                        <td className="px-4 py-4">
                          <span className="text-sm font-semibold text-secondary-100">{invoice.client}</span>
                        </td>
                        <td className="px-4 py-4">
                          <span className="text-sm text-secondary-100">{invoice.amount} RWF</span>
                        </td>
                        <td className="px-4 py-4">
                          <span className="text-sm text-custom-700">{invoice.tax} RWF</span>
                        </td>
                        <td className="px-4 py-4">
                          <span className="text-sm font-bold text-primary-600">{invoice.total} RWF</span>
                        </td>
                        <td className="px-4 py-4">
                          <span
                            className={`text-xs font-bold px-3 py-1 rounded-full ${statusConfig.bg} ${statusConfig.color} flex items-center gap-1 w-fit`}
                          >
                            <statusConfig.icon className="w-3 h-3" />
                            {invoice.status.toUpperCase()}
                          </span>
                        </td>
                        <td className="px-4 py-4">
                          <span className="text-sm text-custom-700">{invoice.dueDate}</span>
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
                    );
                  })
                )}
              </tbody>
            </table>
          </div>
        </Card>
      </div>
    </DashboardLayout>
  );
}
