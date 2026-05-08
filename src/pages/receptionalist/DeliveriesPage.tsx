import { useState } from "react";
import {
  HiOutlineCheckCircle,
  HiOutlineClock,
  HiOutlineSearch,
  HiOutlineTruck,
} from "react-icons/hi";
import { DashboardLayout } from "../../components";
import { Card } from "../../components/ui";

const deliveries = [
  {
    id: "JOB-003",
    client: "Gov Office",
    service: "Digital Printing",
    qty: 100,
    completedDate: "2026-04-30",
    status: "Ready for Delivery",
    contactPerson: "John Doe",
    phone: "+250 788 123 456",
  },
  {
    id: "JOB-006",
    client: "Hotel C",
    service: "Offset Printing",
    qty: 1000,
    completedDate: "2026-04-29",
    status: "Delivered",
    contactPerson: "Jane Smith",
    phone: "+250 788 234 567",
    deliveredAt: "2026-04-30 10:30 AM",
  },
  {
    id: "JOB-008",
    client: "Tech Startup",
    service: "Binding",
    qty: 500,
    completedDate: "2026-04-30",
    status: "Ready for Delivery",
    contactPerson: "Mike Johnson",
    phone: "+250 788 345 678",
  },
  {
    id: "JOB-010",
    client: "Law Firm",
    service: "Composition",
    qty: 50,
    completedDate: "2026-04-28",
    status: "Delivered",
    contactPerson: "Sarah Williams",
    phone: "+250 788 456 789",
    deliveredAt: "2026-04-29 02:15 PM",
  },
];

const statusColor: Record<string, string> = {
  "Ready for Delivery": "bg-yellow-100 text-yellow-700",
  "Delivered": "bg-green-100 text-green-700",
  "Pending Pickup": "bg-primary-100 text-primary-700",
};

const kpis = [
  {
    label: "Ready for Delivery",
    value: "2",
    icon: HiOutlineClock,
    color: "text-yellow-600",
    bg: "bg-yellow-100",
  },
  {
    label: "Delivered Today",
    value: "1",
    icon: HiOutlineCheckCircle,
    color: "text-green-600",
    bg: "bg-green-100",
  },
  {
    label: "Total This Week",
    value: "8",
    icon: HiOutlineTruck,
    color: "text-primary-500",
    bg: "bg-primary-100",
  },
];

export default function DeliveriesPage() {
  const [search, setSearch] = useState("");

  const filtered = deliveries.filter(
    (d) =>
      d.id.toLowerCase().includes(search.toLowerCase()) ||
      d.client.toLowerCase().includes(search.toLowerCase())
  );

  return (
    <DashboardLayout
      userRole="receptionist"
      userName="Reception Desk"
      notificationCount={6}
    >
      <div className="space-y-8 font-[family-name:var(--font-family-primary)]">
        {/* Header */}
        <div>
          <h1 className="text-2xl md:text-3xl font-bold text-secondary-100">
            Deliveries
          </h1>
          <p className="text-sm text-custom-700 mt-1">
            Manage job deliveries and client pickups
          </p>
        </div>

        {/* KPIs */}
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
          {kpis.map((kpi) => (
            <Card key={kpi.label} className="!p-4">
              <div className="flex items-center gap-3">
                <div className={`w-10 h-10 rounded-xl flex items-center justify-center ${kpi.bg}`}>
                  <kpi.icon className={`w-5 h-5 ${kpi.color}`} />
                </div>
                <div>
                  <p className="text-xs text-custom-700">{kpi.label}</p>
                  <p className="text-2xl font-bold text-secondary-100">{kpi.value}</p>
                </div>
              </div>
            </Card>
          ))}
        </div>

        {/* Deliveries List */}
        <Card>
          <div className="flex flex-col xs:flex-row xs:items-center justify-between gap-3 mb-5">
            <div className="flex items-center gap-2">
              <HiOutlineTruck className="w-5 h-5 text-primary-500" />
              <h2 className="font-bold text-secondary-100">Delivery Status</h2>
            </div>
            {/* Search */}
            <div className="relative w-full xs:w-64">
              <HiOutlineSearch className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-custom-700" />
              <input
                type="text"
                placeholder="Search job or client..."
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                className="
                  w-full pl-9 pr-4 py-2 rounded-xl border border-custom-300
                  bg-style-500 text-secondary-100 text-sm
                  placeholder:text-custom-700
                  focus:outline-none focus:border-primary-400 focus:ring-2 focus:ring-primary-200
                  transition-colors duration-200
                  font-[family-name:var(--font-family-primary)]
                "
              />
            </div>
          </div>

          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead>
                <tr className="border-b border-custom-300">
                  {["Job ID", "Client", "Service", "Qty", "Completed", "Contact", "Status", "Action"].map((h) => (
                    <th key={h} className="text-left py-2 px-3 text-xs font-semibold text-custom-700 uppercase tracking-wide whitespace-nowrap">
                      {h}
                    </th>
                  ))}
                </tr>
              </thead>
              <tbody>
                {filtered.map((delivery) => (
                  <tr key={delivery.id} className="border-b border-custom-200 hover:bg-custom-50 transition-colors">
                    <td className="py-3 px-3 font-semibold text-primary-500 whitespace-nowrap">{delivery.id}</td>
                    <td className="py-3 px-3 text-secondary-100 whitespace-nowrap">{delivery.client}</td>
                    <td className="py-3 px-3 text-custom-700 whitespace-nowrap">{delivery.service}</td>
                    <td className="py-3 px-3 text-custom-700">{delivery.qty}</td>
                    <td className="py-3 px-3 text-custom-700 whitespace-nowrap">{delivery.completedDate}</td>
                    <td className="py-3 px-3 text-custom-700 whitespace-nowrap">
                      <div>
                        <p className="text-xs font-semibold">{delivery.contactPerson}</p>
                        <p className="text-xs">{delivery.phone}</p>
                      </div>
                    </td>
                    <td className="py-3 px-3">
                      <span className={`text-xs font-semibold px-2 py-0.5 rounded-full whitespace-nowrap ${statusColor[delivery.status]}`}>
                        {delivery.status}
                      </span>
                      {delivery.deliveredAt && (
                        <p className="text-xs text-custom-700 mt-1">{delivery.deliveredAt}</p>
                      )}
                    </td>
                    <td className="py-3 px-3">
                      {delivery.status === "Ready for Delivery" && (
                        <button className="text-xs text-primary-500 hover:text-primary-600 font-semibold transition-colors whitespace-nowrap">
                          Mark Delivered
                        </button>
                      )}
                    </td>
                  </tr>
                ))}
                {filtered.length === 0 && (
                  <tr>
                    <td colSpan={8} className="py-8 text-center text-custom-700 text-sm">
                      No deliveries found.
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>
        </Card>
      </div>
    </DashboardLayout>
  );
}
