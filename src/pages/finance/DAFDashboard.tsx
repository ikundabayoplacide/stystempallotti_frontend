import { useState } from "react";
import {
    HiOutlineCheckCircle,
    HiOutlineClock,
    HiOutlineCurrencyDollar,
    HiOutlineExclamationCircle,
    HiOutlineSearch,
    HiOutlineUsers,
} from "react-icons/hi";
import { Button, Card } from "../../components/ui";

const kpis = [
  {
    label: "Total Revenue (Month)",
    value: "15,500,000",
    icon: HiOutlineCurrencyDollar,
    color: "text-green-600",
    bg: "bg-green-100",
    suffix: "RWF",
  },
  {
    label: "Pending Approvals",
    value: "8",
    icon: HiOutlineClock,
    color: "text-yellow-600",
    bg: "bg-yellow-100",
  },
  {
    label: "Active Employees",
    value: "45",
    icon: HiOutlineUsers,
    color: "text-primary-500",
    bg: "bg-primary-100",
  },
  {
    label: "Critical Issues",
    value: "2",
    icon: HiOutlineExclamationCircle,
    color: "text-red-500",
    bg: "bg-red-100",
  },
];

const pendingApprovals = [
  {
    id: "APP-001",
    type: "Payment",
    description: "Supplier payment for paper stock",
    amount: "850,000 RWF",
    requestedBy: "Accountant 1",
    date: "2026-05-04",
    priority: "High",
  },
  {
    id: "APP-002",
    type: "HR",
    description: "New employee onboarding - Production",
    amount: "-",
    requestedBy: "Production Manager",
    date: "2026-05-03",
    priority: "Medium",
  },
  {
    id: "APP-003",
    type: "Expense",
    description: "Equipment maintenance",
    amount: "320,000 RWF",
    requestedBy: "Accountant 2",
    date: "2026-05-04",
    priority: "High",
  },
];

const hrSummary = [
  { department: "Production", employees: 18, attendance: "95%" },
  { department: "Sales", employees: 5, attendance: "100%" },
  { department: "Finance", employees: 4, attendance: "100%" },
  { department: "Reception", employees: 3, attendance: "100%" },
  { department: "Stock", employees: 4, attendance: "92%" },
  { department: "Management", employees: 11, attendance: "98%" },
];

const recentActivities = [
  { action: "Approved payment", description: "INV-045 - ABC Corp", time: "30 mins ago" },
  { action: "HR Review", description: "Leave request approved", time: "1 hour ago" },
  { action: "Budget Review", description: "Q2 budget approved", time: "2 hours ago" },
  { action: "Expense Approved", description: "Office supplies", time: "3 hours ago" },
];

export default function DAFDashboard() {
  const [search, setSearch] = useState("");

  const filtered = pendingApprovals.filter(
    (item) =>
      item.id.toLowerCase().includes(search.toLowerCase()) ||
      item.description.toLowerCase().includes(search.toLowerCase())
  );

  return (
    <div className="space-y-8 font-[family-name:var(--font-family-primary)]">
      {/* Header */}
      <div className="flex flex-col xs:flex-row xs:items-center justify-between gap-3">
        <div>
          <h1 className="text-2xl md:text-3xl font-bold text-secondary-100">
            DAF Dashboard
          </h1>
          <p className="text-sm text-custom-700 mt-1">
            Finance Controller & Human Resource Manager — Monday, May 4, 2026
          </p>
        </div>
        <Button size="sm" className="flex items-center gap-2 self-start xs:self-auto">
          <HiOutlineCheckCircle className="w-4 h-4" />
          Review Approvals
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

      {/* Main Content Grid */}
      <div className="grid grid-cols-1 xl:grid-cols-3 gap-6">
        {/* Pending Approvals */}
        <Card className="xl:col-span-2">
          <div className="flex flex-col xs:flex-row xs:items-center justify-between gap-3 mb-5">
            <div className="flex items-center gap-2">
              <HiOutlineClock className="w-5 h-5 text-yellow-600" />
              <h2 className="font-bold text-secondary-100">Pending Approvals</h2>
            </div>
            {/* Search */}
            <div className="relative w-full xs:w-64">
              <HiOutlineSearch className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-custom-700" />
              <input
                type="text"
                placeholder="Search approvals..."
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

          <div className="space-y-3">
            {filtered.map((item) => (
              <div
                key={item.id}
                className="p-4 rounded-xl border border-custom-300 hover:border-primary-400 transition-colors"
              >
                <div className="flex items-start justify-between gap-3 mb-2">
                  <div className="flex-1">
                    <div className="flex items-center gap-2 mb-1">
                      <span className="font-bold text-primary-500">{item.id}</span>
                      <span className="text-xs font-semibold px-2 py-0.5 rounded-full bg-primary-100 text-primary-700">
                        {item.type}
                      </span>
                      <span
                        className={`text-xs font-semibold px-2 py-0.5 rounded-full ${
                          item.priority === "High"
                            ? "bg-red-100 text-red-700"
                            : "bg-yellow-100 text-yellow-700"
                        }`}
                      >
                        {item.priority}
                      </span>
                    </div>
                    <p className="text-sm text-secondary-100 mb-1">{item.description}</p>
                    <p className="text-xs text-custom-700">
                      Requested by {item.requestedBy} • {item.date}
                    </p>
                  </div>
                  {item.amount !== "-" && (
                    <div className="text-right">
                      <p className="text-sm font-bold text-secondary-100">{item.amount}</p>
                    </div>
                  )}
                </div>
                <div className="flex gap-2 mt-3">
                  <Button size="sm" variant="outline" className="flex-1">
                    Review
                  </Button>
                  <Button size="sm" className="flex-1 !bg-green-600 hover:!bg-green-700">
                    Approve
                  </Button>
                  <Button size="sm" className="flex-1 !bg-red-600 hover:!bg-red-700">
                    Reject
                  </Button>
                </div>
              </div>
            ))}
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
                <p className="text-xs text-custom-700 mb-1">{activity.description}</p>
                <p className="text-xs text-custom-700">{activity.time}</p>
              </div>
            ))}
          </div>
        </Card>
      </div>

      {/* HR Summary */}
      <Card>
        <div className="flex items-center gap-2 mb-5">
          <HiOutlineUsers className="w-5 h-5 text-primary-500" />
          <h2 className="font-bold text-secondary-100">HR Summary by Department</h2>
        </div>
        <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-4">
          {hrSummary.map((dept) => (
            <div key={dept.department} className="p-4 rounded-xl bg-custom-50 border border-custom-200">
              <h3 className="font-bold text-secondary-100 mb-2 text-sm">{dept.department}</h3>
              <p className="text-2xl font-bold text-primary-500 mb-1">{dept.employees}</p>
              <p className="text-xs text-custom-700">Attendance: {dept.attendance}</p>
            </div>
          ))}
        </div>
      </Card>
    </div>
  );
}
