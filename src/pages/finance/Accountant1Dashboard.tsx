import { useState } from "react";
import {
    HiOutlineCheckCircle,
    HiOutlineClock,
    HiOutlineCurrencyDollar,
    HiOutlineDocumentText,
    HiOutlinePlusCircle,
    HiOutlineSearch,
} from "react-icons/hi";
import { Button, Card } from "../../components/ui";

const kpis = [
  {
    label: "Invoices Issued Today",
    value: "12",
    icon: HiOutlineDocumentText,
    color: "text-primary-500",
    bg: "bg-primary-100",
  },
  {
    label: "Payments Confirmed",
    value: "8",
    icon: HiOutlineCheckCircle,
    color: "text-green-600",
    bg: "bg-green-100",
  },
  {
    label: "Pending Payments",
    value: "15",
    icon: HiOutlineClock,
    color: "text-yellow-600",
    bg: "bg-yellow-100",
  },
  {
    label: "Total Amount (Today)",
    value: "3,200,000",
    icon: HiOutlineCurrencyDollar,
    color: "text-green-600",
    bg: "bg-green-100",
    suffix: "RWF",
  },
];

const invoices = [
  {
    id: "INV-051",
    jobId: "JOB-045",
    client: "Tech Solutions Ltd",
    amount: "950,000",
    issued: "2026-05-04",
    due: "2026-05-18",
    status: "Pending Payment",
  },
  {
    id: "INV-052",
    jobId: "JOB-046",
    client: "ABC Manufacturing",
    amount: "450,000",
    issued: "2026-05-04",
    due: "2026-05-18",
    status: "Paid",
  },
  {
    id: "INV-053",
    jobId: "JOB-047",
    client: "Green Energy Co",
    amount: "1,200,000",
    issued: "2026-05-04",
    due: "2026-05-18",
    status: "Pending Payment",
  },
];

const statusColor: Record<string, string> = {
  "Paid": "bg-green-100 text-green-700",
  "Pending Payment": "bg-yellow-100 text-yellow-700",
  "Overdue": "bg-red-100 text-red-700",
};

export default function Accountant1Dashboard() {
  const [search, setSearch] = useState("");

  const filtered = invoices.filter(
    (inv) =>
      inv.id.toLowerCase().includes(search.toLowerCase()) ||
      inv.client.toLowerCase().includes(search.toLowerCase())
  );

  return (
    <div className="space-y-8 font-[family-name:var(--font-family-primary)]">
      {/* Header */}
      <div className="flex flex-col xs:flex-row xs:items-center justify-between gap-3">
        <div>
          <h1 className="text-2xl md:text-3xl font-bold text-secondary-100">
            Accountant 1 Dashboard
          </h1>
          <p className="text-sm text-custom-700 mt-1">
            Invoice Management & Payment Confirmation — Monday, May 4, 2026
          </p>
        </div>
        <Button size="sm" className="flex items-center gap-2 self-start xs:self-auto">
          <HiOutlinePlusCircle className="w-4 h-4" />
          Issue New Invoice
        </Button>
      </div>

      {/* KPI Grid */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
        {kpis.map(({ label, value, icon: Icon, color, bg, suffix }) => (
          <Card key={label} className="!p-4 flex flex-col gap-3">
            <div className={`w-10 h-10 rounded-xl flex items-center justify-center ${bg}`}>
              <Icon className={`w-5 h-5 ${color}`} />
            </div>
            <div>
              <p className="text-xs text-custom-700">{label}</p>
              <p className="text-xl font-bold text-secondary-100 leading-tight">
                {value} {suffix && <span className="text-sm font-normal text-custom-700">{suffix}</span>}
              </p>
            </div>
          </Card>
        ))}
      </div>

      {/* Invoices Table */}
      <Card>
        <div className="flex flex-col xs:flex-row xs:items-center justify-between gap-3 mb-5">
          <div className="flex items-center gap-2">
            <HiOutlineDocumentText className="w-5 h-5 text-primary-500" />
            <h2 className="font-bold text-secondary-100">Recent Invoices</h2>
          </div>
          <div className="relative w-full xs:w-64">
            <HiOutlineSearch className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-custom-700" />
            <input
              type="text"
              placeholder="Search invoices..."
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
                {["Invoice", "Job ID", "Client", "Amount", "Due Date", "Status", "Action"].map((h) => (
                  <th key={h} className="text-left py-2 px-3 text-xs font-semibold text-custom-700 uppercase tracking-wide whitespace-nowrap">
                    {h}
                  </th>
                ))}
              </tr>
            </thead>
            <tbody>
              {filtered.map((inv) => (
                <tr key={inv.id} className="border-b border-custom-200 hover:bg-custom-50 transition-colors">
                  <td className="py-3 px-3 font-semibold text-primary-500 whitespace-nowrap">{inv.id}</td>
                  <td className="py-3 px-3 text-custom-700 whitespace-nowrap">{inv.jobId}</td>
                  <td className="py-3 px-3 text-secondary-100 whitespace-nowrap">{inv.client}</td>
                  <td className="py-3 px-3 text-secondary-100 font-semibold whitespace-nowrap">{inv.amount} RWF</td>
                  <td className="py-3 px-3 text-custom-700 whitespace-nowrap">{inv.due}</td>
                  <td className="py-3 px-3">
                    <span className={`text-xs font-semibold px-2 py-0.5 rounded-full whitespace-nowrap ${statusColor[inv.status]}`}>
                      {inv.status}
                    </span>
                  </td>
                  <td className="py-3 px-3">
                    <button className="text-xs text-primary-500 hover:text-primary-600 font-semibold transition-colors whitespace-nowrap">
                      Confirm Payment
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </Card>
    </div>
  );
}
