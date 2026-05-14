import { useState } from "react";
import {
    HiOutlineCheckCircle,
    HiOutlineClock,
    HiOutlineCube,
    HiOutlineEye,
    HiOutlinePlus,
    HiOutlineSearch,
    HiOutlineX,
} from "react-icons/hi";
import { DashboardLayout } from "../../components";
import { Button, Card } from "../../components/ui";

interface ProcurementRequest {
  id: string;
  item: string;
  quantity: string;
  supplier: string;
  amount: string;
  status: "pending" | "approved" | "rejected" | "completed";
  requestDate: string;
  requestedBy: string;
}

const initialRequests: ProcurementRequest[] = [
  {
    id: "PROC-001",
    item: "A4 Paper - 500 reams",
    quantity: "500",
    supplier: "Paper Supplies Ltd",
    amount: "450,000",
    status: "completed",
    requestDate: "2026-04-25",
    requestedBy: "Stock Manager",
  },
  {
    id: "PROC-002",
    item: "Printing Ink - CMYK Set",
    quantity: "20",
    supplier: "Ink Solutions",
    amount: "280,000",
    status: "approved",
    requestDate: "2026-05-01",
    requestedBy: "Production Manager",
  },
  {
    id: "PROC-003",
    item: "Binding Wire - 100kg",
    quantity: "100",
    supplier: "Metal Works Co",
    amount: "150,000",
    status: "pending",
    requestDate: "2026-05-03",
    requestedBy: "Stock Manager",
  },
];

export default function Accountant2ProcurementPage() {
  const [requests] = useState<ProcurementRequest[]>(initialRequests);
  const [search, setSearch] = useState("");
  const [filterStatus, setFilterStatus] = useState<"all" | "pending" | "approved" | "rejected" | "completed">("all");

  const filtered = requests.filter((req) => {
    const matchesSearch =
      req.id.toLowerCase().includes(search.toLowerCase()) ||
      req.item.toLowerCase().includes(search.toLowerCase());
    const matchesStatus = filterStatus === "all" || req.status === filterStatus;
    return matchesSearch && matchesStatus;
  });

  const getStatusConfig = (status: string) => {
    switch (status) {
      case "completed":
        return { color: "text-green-700", bg: "bg-green-100", icon: HiOutlineCheckCircle };
      case "approved":
        return { color: "text-blue-700", bg: "bg-blue-100", icon: HiOutlineCheckCircle };
      case "pending":
        return { color: "text-yellow-700", bg: "bg-yellow-100", icon: HiOutlineClock };
      case "rejected":
        return { color: "text-red-700", bg: "bg-red-100", icon: HiOutlineX };
      default:
        return { color: "text-custom-700", bg: "bg-custom-100", icon: HiOutlineClock };
    }
  };

  return (
    <DashboardLayout userRole="accountant" userName="Accountant" notificationCount={4}>
      <div className="space-y-6 font-[family-name:var(--font-family-primary)]">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
          <div>
            <h1 className="text-2xl md:text-3xl font-bold text-secondary-100">E-Procurement</h1>
            <p className="text-sm text-custom-700 mt-1">Manage procurement requests and orders</p>
          </div>
          <Button className="!bg-primary-500 hover:!bg-primary-600 !text-white">
            <HiOutlinePlus className="w-4 h-4 mr-2" />
            New Request
          </Button>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-4 gap-4">
          <Card className="!p-4">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-xl bg-primary-100 flex items-center justify-center">
                <HiOutlineCube className="w-5 h-5 text-primary-600" />
              </div>
              <div>
                <p className="text-xs text-custom-700">Total Requests</p>
                <p className="text-xl font-bold text-secondary-100">{requests.length}</p>
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
                  {requests.filter((r) => r.status === "pending").length}
                </p>
              </div>
            </div>
          </Card>
          <Card className="!p-4">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-xl bg-blue-100 flex items-center justify-center">
                <HiOutlineCheckCircle className="w-5 h-5 text-blue-600" />
              </div>
              <div>
                <p className="text-xs text-custom-700">Approved</p>
                <p className="text-xl font-bold text-blue-600">
                  {requests.filter((r) => r.status === "approved").length}
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
                <p className="text-xs text-custom-700">Completed</p>
                <p className="text-xl font-bold text-green-600">
                  {requests.filter((r) => r.status === "completed").length}
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
                placeholder="Search requests..."
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                className="w-full pl-9 pr-4 py-2 rounded-xl border border-custom-300 bg-style-500 text-secondary-100 text-sm placeholder:text-custom-700 focus:outline-none focus:border-primary-400 focus:ring-2 focus:ring-primary-200"
              />
            </div>
            <div className="flex gap-2">
              {(["all", "pending", "approved", "completed", "rejected"] as const).map((status) => (
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

        <Card className="!p-0 overflow-hidden">
          <div className="p-4 bg-custom-100 border-b border-custom-300">
            <h2 className="text-lg font-bold text-secondary-100">Procurement Requests</h2>
          </div>
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead className="bg-custom-50 border-b border-custom-300">
                <tr>
                  <th className="px-4 py-3 text-left text-xs font-bold text-secondary-100 uppercase">Request ID</th>
                  <th className="px-4 py-3 text-left text-xs font-bold text-secondary-100 uppercase">Item</th>
                  <th className="px-4 py-3 text-left text-xs font-bold text-secondary-100 uppercase">Quantity</th>
                  <th className="px-4 py-3 text-left text-xs font-bold text-secondary-100 uppercase">Supplier</th>
                  <th className="px-4 py-3 text-left text-xs font-bold text-secondary-100 uppercase">Amount</th>
                  <th className="px-4 py-3 text-left text-xs font-bold text-secondary-100 uppercase">Status</th>
                  <th className="px-4 py-3 text-left text-xs font-bold text-secondary-100 uppercase">Request Date</th>
                  <th className="px-4 py-3 text-right text-xs font-bold text-secondary-100 uppercase">Actions</th>
                </tr>
              </thead>
              <tbody className="bg-white divide-y divide-custom-200">
                {filtered.map((req) => {
                  const statusConfig = getStatusConfig(req.status);
                  return (
                    <tr key={req.id} className="hover:bg-custom-50 transition-colors">
                      <td className="px-4 py-4">
                        <span className="text-sm font-bold text-primary-600">{req.id}</span>
                      </td>
                      <td className="px-4 py-4">
                        <span className="text-sm font-semibold text-secondary-100">{req.item}</span>
                      </td>
                      <td className="px-4 py-4">
                        <span className="text-sm text-secondary-100">{req.quantity}</span>
                      </td>
                      <td className="px-4 py-4">
                        <span className="text-sm text-secondary-100">{req.supplier}</span>
                      </td>
                      <td className="px-4 py-4">
                        <span className="text-sm font-bold text-primary-600">{req.amount} RWF</span>
                      </td>
                      <td className="px-4 py-4">
                        <span
                          className={`text-xs font-bold px-3 py-1 rounded-full ${statusConfig.bg} ${statusConfig.color} flex items-center gap-1 w-fit`}
                        >
                          <statusConfig.icon className="w-3 h-3" />
                          {req.status.toUpperCase()}
                        </span>
                      </td>
                      <td className="px-4 py-4">
                        <span className="text-sm text-custom-700">{req.requestDate}</span>
                      </td>
                      <td className="px-4 py-4">
                        <div className="flex items-center justify-end gap-2">
                          <button className="px-3 py-1.5 rounded-lg bg-primary-500 text-white hover:bg-primary-600 transition-colors text-xs font-semibold">
                            <HiOutlineEye className="w-3 h-3 inline mr-1" />
                            View
                          </button>
                          {req.status === "pending" && (
                            <button className="px-3 py-1.5 rounded-lg bg-green-500 text-white hover:bg-green-600 transition-colors text-xs font-semibold">
                              Approve
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
