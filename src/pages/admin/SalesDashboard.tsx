import { useState } from "react";
import {
    HiOutlineCheckCircle,
    HiOutlineClipboardList,
    HiOutlineClock,
    HiOutlineCurrencyDollar,
    HiOutlineDocumentText,
    HiOutlinePlusCircle,
    HiOutlineSearch,
} from "react-icons/hi";
import { Button, Card } from "../../components/ui";

const kpis = [
  {
    label: "Pending Quotations",
    value: "8",
    icon: HiOutlineDocumentText,
    color: "text-yellow-600",
    bg: "bg-yellow-100",
  },
  {
    label: "Approved Today",
    value: "5",
    icon: HiOutlineCheckCircle,
    color: "text-green-600",
    bg: "bg-green-100",
  },
  {
    label: "Awaiting Client",
    value: "12",
    icon: HiOutlineClock,
    color: "text-primary-500",
    bg: "bg-primary-100",
  },
  {
    label: "Total Value (RWF)",
    value: "3,500,000",
    icon: HiOutlineCurrencyDollar,
    color: "text-primary-600",
    bg: "bg-primary-100",
  },
];

const jobs = [
  {
    id: "JOB-001",
    client: "ABC Corp",
    service: "Offset Printing",
    qty: 500,
    quotation: "850,000",
    status: "Approved",
    createdAt: "2026-04-28",
    deadline: "2026-05-02",
  },
  {
    id: "JOB-002",
    client: "XYZ Ltd",
    service: "Binding",
    qty: 200,
    quotation: "120,000",
    status: "Awaiting Client",
    createdAt: "2026-04-29",
    deadline: "2026-05-01",
  },
  {
    id: "JOB-008",
    client: "Tech Startup",
    service: "Digital Printing",
    qty: 1000,
    quotation: "450,000",
    status: "Quotation Sent",
    createdAt: "2026-04-30",
    deadline: "2026-05-05",
  },
  {
    id: "JOB-009",
    client: "Restaurant Chain",
    service: "Packaging",
    qty: 300,
    quotation: "180,000",
    status: "Draft",
    createdAt: "2026-04-30",
    deadline: "2026-05-06",
  },
  {
    id: "JOB-010",
    client: "Law Firm",
    service: "Composition",
    qty: 50,
    quotation: "95,000",
    status: "Approved",
    createdAt: "2026-04-29",
    deadline: "2026-05-03",
  },
];

const statusColor: Record<string, string> = {
  Draft: "bg-custom-100 text-custom-800",
  "Quotation Sent": "bg-yellow-100 text-yellow-700",
  "Awaiting Client": "bg-primary-100 text-primary-700",
  Approved: "bg-green-100 text-green-700",
  Rejected: "bg-red-100 text-red-700",
};

const recentActivities = [
  { action: "Quotation approved", job: "JOB-001", client: "ABC Corp", time: "10 mins ago" },
  { action: "Quotation sent", job: "JOB-008", client: "Tech Startup", time: "1 hour ago" },
  { action: "Job registered", job: "JOB-009", client: "Restaurant Chain", time: "2 hours ago" },
  { action: "Client follow-up", job: "JOB-002", client: "XYZ Ltd", time: "3 hours ago" },
];

export default function SalesDashboard() {
  const [search, setSearch] = useState("");

  const filtered = jobs.filter(
    (j) =>
      j.id.toLowerCase().includes(search.toLowerCase()) ||
      j.client.toLowerCase().includes(search.toLowerCase())
  );

  return (
    <div className="space-y-8 font-[family-name:var(--font-family-primary)]">
      {/* Header */}
      <div className="flex flex-col xs:flex-row xs:items-center justify-between gap-3">
        <div>
          <h1 className="text-2xl md:text-3xl font-bold text-secondary-100">
            Sales Officer Dashboard
          </h1>
          <p className="text-sm text-custom-700 mt-1">
            Manage quotations, job registration, and client communication
          </p>
        </div>
        <Button size="sm" className="flex items-center gap-2 self-start xs:self-auto">
          <HiOutlinePlusCircle className="w-4 h-4" />
          Register New Job
        </Button>
      </div>

      {/* KPI Grid */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
        {kpis.map(({ label, value, icon: Icon, color, bg }) => (
          <Card key={label} className="!p-4 flex flex-col gap-3">
            <div className={`w-10 h-10 rounded-xl flex items-center justify-center ${bg}`}>
              <Icon className={`w-5 h-5 ${color}`} />
            </div>
            <div>
              <p className="text-xs text-custom-700">{label}</p>
              <p className="text-xl font-bold text-secondary-100 leading-tight">{value}</p>
            </div>
          </Card>
        ))}
      </div>

      {/* Main Content Grid */}
      <div className="grid grid-cols-1 xl:grid-cols-3 gap-6">
        {/* Jobs List */}
        <Card className="xl:col-span-2">
          <div className="flex flex-col xs:flex-row xs:items-center justify-between gap-3 mb-5">
            <div className="flex items-center gap-2">
              <HiOutlineClipboardList className="w-5 h-5 text-primary-500" />
              <h2 className="font-bold text-secondary-100">Job Quotations</h2>
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
                  {["Job ID", "Client", "Service", "Qty", "Quotation", "Status", "Action"].map((h) => (
                    <th key={h} className="text-left py-2 px-3 text-xs font-semibold text-custom-700 uppercase tracking-wide whitespace-nowrap">
                      {h}
                    </th>
                  ))}
                </tr>
              </thead>
              <tbody>
                {filtered.map((job) => (
                  <tr key={job.id} className="border-b border-custom-200 hover:bg-custom-50 transition-colors">
                    <td className="py-3 px-3 font-semibold text-primary-500 whitespace-nowrap">{job.id}</td>
                    <td className="py-3 px-3 text-secondary-100 whitespace-nowrap">{job.client}</td>
                    <td className="py-3 px-3 text-custom-700 whitespace-nowrap">{job.service}</td>
                    <td className="py-3 px-3 text-custom-700">{job.qty}</td>
                    <td className="py-3 px-3 text-secondary-100 font-semibold whitespace-nowrap">{job.quotation} RWF</td>
                    <td className="py-3 px-3">
                      <span className={`text-xs font-semibold px-2 py-0.5 rounded-full whitespace-nowrap ${statusColor[job.status] ?? "bg-custom-100 text-custom-800"}`}>
                        {job.status}
                      </span>
                    </td>
                    <td className="py-3 px-3">
                      <button className="text-xs text-primary-500 hover:text-primary-600 font-semibold transition-colors whitespace-nowrap">
                        View Details
                      </button>
                    </td>
                  </tr>
                ))}
                {filtered.length === 0 && (
                  <tr>
                    <td colSpan={7} className="py-8 text-center text-custom-700 text-sm">
                      No jobs found.
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>
        </Card>

        {/* Recent Activities */}
        <Card>
          <div className="flex items-center gap-2 mb-5">
            <HiOutlineClock className="w-5 h-5 text-primary-500" />
            <h2 className="font-bold text-secondary-100">Recent Activities</h2>
          </div>
          <div className="space-y-3">
            {recentActivities.map((activity, idx) => (
              <div key={idx} className="p-3 rounded-xl bg-custom-50 border border-custom-200">
                <p className="text-sm font-semibold text-secondary-100 mb-1">{activity.action}</p>
                <p className="text-xs text-custom-700">
                  {activity.job} - {activity.client}
                </p>
                <p className="text-xs text-custom-700 mt-1">{activity.time}</p>
              </div>
            ))}
          </div>
        </Card>
      </div>
      
    </div>
  );
}
