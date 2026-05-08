import { useState } from "react";
import {
    HiOutlineCheckCircle,
    HiOutlineClipboardList,
    HiOutlineClock,
    HiOutlinePlusCircle,
    HiOutlineSearch,
    HiOutlineTruck,
} from "react-icons/hi";
import { Button, Card } from "../../components/ui";

const jobs = [
  { id: "JOB-001", client: "ABC Corp", service: "Offset Printing", qty: 500, deadline: "2026-05-02", status: "In Printing" },
  { id: "JOB-002", client: "XYZ Ltd", service: "Binding", qty: 200, deadline: "2026-05-01", status: "In Binding" },
  { id: "JOB-003", client: "Gov Office", service: "Digital Printing", qty: 100, deadline: "2026-04-30", status: "Completed" },
  { id: "JOB-004", client: "School A", service: "Packaging", qty: 300, deadline: "2026-04-29", status: "Delayed" },
  { id: "JOB-005", client: "NGO B", service: "Composition", qty: 50, deadline: "2026-05-03", status: "Received" },
  { id: "JOB-006", client: "Hotel C", service: "Offset Printing", qty: 1000, deadline: "2026-05-05", status: "Quotation Completed" },
];

const statusColor: Record<string, string> = {
  "Received": "bg-custom-100 text-custom-800",
  "Quotation Completed": "bg-yellow-100 text-yellow-700",
  "Approved": "bg-primary-100 text-primary-700",
  "Paid": "bg-green-100 text-green-700",
  "In Printing": "bg-primary-100 text-primary-600",
  "In Binding": "bg-primary-100 text-primary-600",
  "In Composition": "bg-primary-100 text-primary-600",
  "Completed": "bg-green-100 text-green-700",
  "Delayed": "bg-red-100 text-red-700",
  "Delivered": "bg-custom-200 text-custom-900",
};

const kpis = [
  { label: "Total Jobs Today", value: "6", icon: HiOutlineClipboardList, color: "text-primary-500", bg: "bg-primary-100" },
  { label: "Pending Delivery", value: "2", icon: HiOutlineTruck, color: "text-yellow-600", bg: "bg-yellow-100" },
  { label: "Completed", value: "1", icon: HiOutlineCheckCircle, color: "text-green-600", bg: "bg-green-100" },
  { label: "Delayed", value: "1", icon: HiOutlineClock, color: "text-red-500", bg: "bg-red-100" },
];

export default function ReceptionDashboard() {
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
          <h1 className="text-2xl md:text-3xl font-bold text-secondary-100">Reception Dashboard</h1>
          <p className="text-sm text-custom-700 mt-1">Manage incoming jobs and client communication</p>
        </div>
        <Button size="sm" className="flex items-center gap-2 self-start xs:self-auto">
          <HiOutlinePlusCircle className="w-4 h-4" />
          New Job
        </Button>
      </div>

      {/* KPIs */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
        {kpis.map(({ label, value, icon: Icon, color, bg }) => (
          <Card key={label} className="!p-4 flex flex-col gap-3">
            <div className={`w-10 h-10 rounded-xl flex items-center justify-center ${bg}`}>
              <Icon className={`w-5 h-5 ${color}`} />
            </div>
            <div>
              <p className="text-xs text-custom-700">{label}</p>
              <p className="text-2xl font-bold text-secondary-100">{value}</p>
            </div>
          </Card>
        ))}
      </div>

      {/* Job List */}
      <Card>
        <div className="flex flex-col xs:flex-row xs:items-center justify-between gap-3 mb-5">
          <div className="flex items-center gap-2">
            <HiOutlineClipboardList className="w-5 h-5 text-primary-500" />
            <h2 className="font-bold text-secondary-100">Job Register</h2>
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
                {["Job ID", "Client", "Service", "Qty", "Deadline", "Status", "Action"].map((h) => (
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
                  <td className="py-3 px-3 text-custom-700 whitespace-nowrap">{job.deadline}</td>
                  <td className="py-3 px-3">
                    <span className={`text-xs font-semibold px-2 py-0.5 rounded-full whitespace-nowrap ${statusColor[job.status] ?? "bg-custom-100 text-custom-800"}`}>
                      {job.status}
                    </span>
                  </td>
                  <td className="py-3 px-3">
                    <button className="text-xs text-primary-500 hover:text-primary-600 font-semibold transition-colors">
                      View
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

      {/* Status Flow Guide */}
      <Card>
        <h2 className="font-bold text-secondary-100 mb-4">Job Status Flow</h2>
        <div className="flex flex-wrap gap-2 items-center">
          {[
            "Received", "Quotation Completed", "Approved", "Paid",
            "In Production", "Completed", "Delivered",
          ].map((s, i, arr) => (
            <div key={s} className="flex items-center gap-2">
              <span className={`text-xs font-semibold px-3 py-1 rounded-full ${statusColor[s] ?? "bg-primary-100 text-primary-700"}`}>
                {s}
              </span>
              {i < arr.length - 1 && (
                <span className="text-custom-400 text-xs">→</span>
              )}
            </div>
          ))}
        </div>
      </Card>
    </div>
  );
}
