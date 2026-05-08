import { useState } from "react";
import {
  HiOutlineChartBar,
  HiOutlineCheckCircle,
  HiOutlineChevronDown,
  HiOutlineChevronUp,
  HiOutlineClipboardList,
  HiOutlineClock,
  HiOutlineCurrencyDollar,
  HiOutlineExclamationCircle,
  HiOutlineTrendingUp,
  HiOutlineUsers
} from "react-icons/hi";
import BottleneckDetection from "../../components/BottleneckDetection";
import DelayedJobsTracker from "../../components/DelayedJobsTracker";
import DepartmentBreakdown from "../../components/DepartmentBreakdown";
import LowStockAlerts from "../../components/LowStockAlerts";
import OutstandingBalances from "../../components/OutstandingBalances";
import { Card } from "../../components/ui";

const kpis = [
  {
    label: "Jobs In Progress",
    value: "25",
    icon: HiOutlineClipboardList,
    color: "text-primary-500",
    bg: "bg-primary-100",
  },
  {
    label: "Completed Today",
    value: "10",
    icon: HiOutlineCheckCircle,
    color: "text-green-600",
    bg: "bg-green-100",
  },
  {
    label: "Delayed Jobs",
    value: "3",
    icon: HiOutlineExclamationCircle,
    color: "text-red-500",
    bg: "bg-red-100",
  },
  {
    label: "Revenue (RWF)",
    value: "2,000,000",
    icon: HiOutlineCurrencyDollar,
    color: "text-yellow-600",
    bg: "bg-yellow-100",
  },
  {
    label: "Payments Received",
    value: "1,750,000",
    icon: HiOutlineTrendingUp,
    color: "text-primary-600",
    bg: "bg-primary-100",
  },
  {
    label: "Outstanding",
    value: "250,000",
    icon: HiOutlineClock,
    color: "text-orange-500",
    bg: "bg-orange-100",
  },
];

const recentJobs = [
  { id: "JOB-001", client: "ABC Corp", service: "Offset Printing", status: "In Printing", deadline: "2026-05-02" },
  { id: "JOB-002", client: "XYZ Ltd", service: "Binding", status: "In Binding", deadline: "2026-05-01" },
  { id: "JOB-003", client: "Gov Office", service: "Digital Printing", status: "Completed", deadline: "2026-04-30" },
  { id: "JOB-004", client: "School A", service: "Packaging", status: "Delayed", deadline: "2026-04-29" },
  { id: "JOB-005", client: "NGO B", service: "Composition", status: "In Composition", deadline: "2026-05-03" },
];

const statusColor: Record<string, string> = {
  "In Printing": "bg-primary-100 text-primary-700",
  "In Binding": "bg-primary-100 text-primary-700",
  "In Composition": "bg-primary-100 text-primary-700",
  "Completed": "bg-green-100 text-green-700",
  "Delayed": "bg-red-100 text-red-700",
  "Paid": "bg-yellow-100 text-yellow-700",
};

export default function AdminDashboard() {
  const [showMore, setShowMore] = useState(false);

  return (
    <div className="space-y-8 font-[family-name:var(--font-family-primary)]">
      {/* Header */}
      <div className="flex flex-col xs:flex-row xs:items-center justify-between gap-3">
        <div>
          <h1 className="text-2xl md:text-3xl font-bold text-secondary-100">
            Director Dashboard
          </h1>
          <p className="text-sm text-custom-700 mt-1">
            Real-time overview of all operations — Thursday, April 30, 2026
          </p>
        </div>
        <span className="inline-flex items-center gap-2 px-3 py-1.5 rounded-full bg-green-100 text-green-700 text-xs font-semibold">
          <span className="w-2 h-2 rounded-full bg-green-500 animate-pulse" />
          Live
        </span>
      </div>

      {/* Quick Actions */}
      {/* <Card className="!p-6">
        <h2 className="text-lg font-bold text-secondary-100 mb-4">Quick Actions</h2>
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
          <Button
            onClick={() => navigate("/admin/jobs")}
            className="flex items-center justify-center gap-2 !py-3"
          >
            <HiOutlinePlus className="w-4 h-4" />
            New Job
          </Button>
          <Button
            onClick={() => navigate("/admin/users")}
            variant="outline"
            className="flex items-center justify-center gap-2 !py-3"
          >
            <HiOutlineUserAdd className="w-4 h-4" />
            Add User
          </Button>
          <Button
            onClick={() => navigate("/admin/reports")}
            variant="outline"
            className="flex items-center justify-center gap-2 !py-3"
          >
            <HiOutlineDocumentReport className="w-4 h-4" />
            Reports
          </Button>
          <Button
            onClick={() => navigate("/admin/settings")}
            variant="outline"
            className="flex items-center justify-center gap-2 !py-3"
          >
            <HiOutlineChartBar className="w-4 h-4" />
            Analytics
          </Button>
        </div>
      </Card> */}

      {/* KPI Grid */}
      <div className="grid grid-cols-2 sm:grid-cols-3 xl:grid-cols-6 gap-4">
        {kpis.map(({ label, value, icon: Icon, color, bg }) => (
          <Card key={label} className="!p-4 flex flex-col gap-3">
            <div
              className={`w-10 h-10 rounded-xl flex items-center justify-center ${bg}`}
            >
              <Icon className={`w-5 h-5 ${color}`} />
            </div>
            <div>
              <p className="text-xs text-custom-700">{label}</p>
              <p className="text-xl font-bold text-secondary-100 leading-tight">
                {value}
              </p>
            </div>
          </Card>
        ))}
      </div>

      {/* Middle row - Enhanced with new components */}
      <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-6">
        {/* Department Breakdown */}
        <DepartmentBreakdown />

        {/* Low Stock Alerts */}
        <LowStockAlerts />

        {/* Outstanding Balances */}
        <OutstandingBalances />
      </div>

      {/* Second row */}
      <div className="grid grid-cols-1 xl:grid-cols-2 gap-6">
        {/* Delayed Jobs Tracker */}
        <DelayedJobsTracker />

        {/* Bottleneck Detection */}
        <BottleneckDetection />
      </div>

      {/* Show More/Less Button */}
      <button
        onClick={() => setShowMore(!showMore)}
        className="w-full px-6 py-3 rounded-xl border-2 border-primary-300 hover:bg-primary-50 transition-colors text-sm font-semibold text-primary-600 flex items-center justify-center gap-2"
      >
        {showMore ? (
          <>
            Show Less
            <HiOutlineChevronUp className="w-5 h-5" />
          </>
        ) : (
          <>
            Show More Details
            <HiOutlineChevronDown className="w-5 h-5" />
          </>
        )}
      </button>

      {/* Collapsible sections */}
      {showMore && (
        <>
          {/* Third row - Performance & Client Metrics */}
      <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-6">
        {/* Performance Metrics */}
        <Card>
          <div className="flex items-center gap-2 mb-5">
            <HiOutlineChartBar className="w-5 h-5 text-primary-500" />
            <h2 className="font-bold text-secondary-100">
              Performance Metrics
            </h2>
          </div>
          <div className="space-y-4">
            <div>
              <div className="flex items-center justify-between mb-2">
                <span className="text-sm text-custom-700">
                  On-Time Delivery
                </span>
                <span className="text-sm font-bold text-green-600">92%</span>
              </div>
              <div className="w-full bg-custom-200 rounded-full h-2">
                <div
                  className="bg-green-500 h-2 rounded-full"
                  style={{ width: "92%" }}
                />
              </div>
            </div>
            <div>
              <div className="flex items-center justify-between mb-2">
                <span className="text-sm text-custom-700">
                  Avg Completion Time
                </span>
                <span className="text-sm font-bold text-primary-600">
                  3.2 days
                </span>
              </div>
              <div className="w-full bg-custom-200 rounded-full h-2">
                <div
                  className="bg-primary-500 h-2 rounded-full"
                  style={{ width: "75%" }}
                />
              </div>
            </div>
            <div>
              <div className="flex items-center justify-between mb-2">
                <span className="text-sm text-custom-700">
                  Worker Efficiency
                </span>
                <span className="text-sm font-bold text-blue-600">87%</span>
              </div>
              <div className="w-full bg-custom-200 rounded-full h-2">
                <div
                  className="bg-blue-500 h-2 rounded-full"
                  style={{ width: "87%" }}
                />
              </div>
            </div>
            <div>
              <div className="flex items-center justify-between mb-2">
                <span className="text-sm text-custom-700">
                  Customer Satisfaction
                </span>
                <span className="text-sm font-bold text-yellow-600">
                  4.5/5.0
                </span>
              </div>
              <div className="w-full bg-custom-200 rounded-full h-2">
                <div
                  className="bg-yellow-500 h-2 rounded-full"
                  style={{ width: "90%" }}
                />
              </div>
            </div>
          </div>
        </Card>

        {/* Client Overview */}
        <Card>
          <div className="flex items-center gap-2 mb-5">
            <HiOutlineUsers className="w-5 h-5 text-primary-500" />
            <h2 className="font-bold text-secondary-100">Client Overview</h2>
          </div>
          <div className="space-y-4">
            <div className="flex items-center justify-between p-3 rounded-xl bg-primary-50">
              <div>
                <p className="text-xs text-custom-700">Total Clients</p>
                <p className="text-2xl font-bold text-secondary-100">156</p>
              </div>
              <div className="w-12 h-12 rounded-xl bg-primary-500 flex items-center justify-center">
                <HiOutlineUsers className="w-6 h-6 text-white" />
              </div>
            </div>
            <div className="flex items-center justify-between p-3 rounded-xl bg-green-50">
              <div>
                <p className="text-xs text-custom-700">New This Month</p>
                <p className="text-2xl font-bold text-secondary-100">12</p>
              </div>
              <div className="w-12 h-12 rounded-xl bg-green-500 flex items-center justify-center">
                <HiOutlineTrendingUp className="w-6 h-6 text-white" />
              </div>
            </div>
            <div>
              <p className="text-xs text-custom-700 mb-2">
                Top Clients by Revenue
              </p>
              <div className="space-y-2">
                {[
                  { name: "ABC Corp", revenue: "450,000" },
                  { name: "XYZ Ltd", revenue: "320,000" },
                  { name: "Gov Office", revenue: "280,000" },
                ].map((client) => (
                  <div
                    key={client.name}
                    className="flex items-center justify-between text-sm"
                  >
                    <span className="text-secondary-100">{client.name}</span>
                    <span className="font-bold text-primary-600">
                      {client.revenue} RWF
                    </span>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </Card>

        {/* Upcoming Deadlines */}
        <Card>
          <div className="flex items-center gap-2 mb-5">
            <HiOutlineClock className="w-5 h-5 text-primary-500" />
            <h2 className="font-bold text-secondary-100">Upcoming Deadlines</h2>
          </div>
          <div className="space-y-3">
            <div className="p-3 rounded-xl bg-red-50 border border-red-200">
              <div className="flex items-center justify-between mb-1">
                <span className="text-xs font-bold text-red-700">OVERDUE</span>
                <span className="text-xs font-bold text-red-600">2 jobs</span>
              </div>
              <p className="text-xs text-red-600">JOB-2026-015, JOB-2026-018</p>
            </div>
            <div className="p-3 rounded-xl bg-orange-50 border border-orange-200">
              <div className="flex items-center justify-between mb-1">
                <span className="text-xs font-bold text-orange-700">
                  DUE TODAY
                </span>
                <span className="text-xs font-bold text-orange-600">
                  5 jobs
                </span>
              </div>
              <p className="text-xs text-orange-600">
                Must be completed by end of day
              </p>
            </div>
            <div className="p-3 rounded-xl bg-yellow-50 border border-yellow-200">
              <div className="flex items-center justify-between mb-1">
                <span className="text-xs font-bold text-yellow-700">
                  THIS WEEK
                </span>
                <span className="text-xs font-bold text-yellow-600">
                  18 jobs
                </span>
              </div>
              <p className="text-xs text-yellow-600">Due within next 7 days</p>
            </div>
            <div className="p-3 rounded-xl bg-green-50 border border-green-200">
              <div className="flex items-center justify-between mb-1">
                <span className="text-xs font-bold text-green-700">
                  ON TRACK
                </span>
                <span className="text-xs font-bold text-green-600">
                  43 jobs
                </span>
              </div>
              <p className="text-xs text-green-600">Progressing as scheduled</p>
            </div>
          </div>
        </Card>
      </div>

      {/* Fourth row */}
      <div className="grid grid-cols-1 xl:grid-cols-2 gap-6">
        {/* Recent Activity Log */}
        <Card>
          <div className="flex items-center gap-2 mb-5">
            <HiOutlineClock className="w-5 h-5 text-primary-500" />
            <h2 className="font-bold text-secondary-100">Recent Activity</h2>
          </div>
          <div className="space-y-3 max-h-80 overflow-y-auto">
            {[
              {
                time: "2 mins ago",
                action: "New job created",
                user: "Receptionist",
                detail: "JOB-2026-045",
              },
              {
                time: "15 mins ago",
                action: "Payment confirmed",
                user: "Accountant 1",
                detail: "INV-2026-032 - 150,000 RWF",
              },
              {
                time: "32 mins ago",
                action: "Job completed",
                user: "Packaging Worker",
                detail: "JOB-2026-041",
              },
              {
                time: "1 hour ago",
                action: "User created",
                user: "Admin",
                detail: "New worker added to Printing",
              },
              {
                time: "1 hour ago",
                action: "Report submitted",
                user: "Worker",
                detail: "Daily report for 2026-05-06",
              },
              {
                time: "2 hours ago",
                action: "Material request approved",
                user: "Stock Manager",
                detail: "REQ-2026-028",
              },
              {
                time: "3 hours ago",
                action: "Job assigned",
                user: "Production Manager",
                detail: "JOB-2026-044 → Binding",
              },
            ].map((activity, idx) => (
              <div
                key={idx}
                className="flex items-start gap-3 p-3 rounded-xl bg-custom-50 hover:bg-custom-100 transition-colors"
              >
                <div className="w-2 h-2 rounded-full bg-primary-500 mt-2 flex-shrink-0" />
                <div className="flex-1 min-w-0">
                  <p className="text-sm font-semibold text-secondary-100">
                    {activity.action}
                  </p>
                  <p className="text-xs text-custom-700">{activity.detail}</p>
                  <p className="text-xs text-custom-600 mt-1">
                    {activity.user} • {activity.time}
                  </p>
                </div>
              </div>
            ))}
          </div>
        </Card>

        {/* Staff Overview */}
        <Card>
          <div className="flex items-center gap-2 mb-5">
            <HiOutlineUsers className="w-5 h-5 text-primary-500" />
            <h2 className="font-bold text-secondary-100">Active Staff</h2>
          </div>
          <div className="space-y-3">
            {[
              { role: "Receptionists", count: 3, active: 3 },
              { role: "Sales Officers", count: 4, active: 3 },
              { role: "Accountants", count: 3, active: 3 },
              { role: "Production Staff", count: 12, active: 10 },
              { role: "Stock Officers", count: 2, active: 2 },
            ].map(({ role, count, active }) => (
              <div key={role} className="flex items-center justify-between">
                <span className="text-sm text-secondary-100">{role}</span>
                <span className="text-xs text-custom-700">
                  <span className="font-bold text-primary-500">{active}</span>/
                  {count} active
                </span>
              </div>
            ))}
          </div>
        </Card>
      </div>

      {/* Recent Jobs Table */}
      <Card>
        <div className="flex items-center gap-2 mb-5">
          <HiOutlineClipboardList className="w-5 h-5 text-primary-500" />
          <h2 className="font-bold text-secondary-100">Recent Jobs</h2>
        </div>
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead>
              <tr className="border-b border-custom-300">
                <th className="text-left py-2 px-3 text-xs font-semibold text-custom-700 uppercase tracking-wide">
                  Job ID
                </th>
                <th className="text-left py-2 px-3 text-xs font-semibold text-custom-700 uppercase tracking-wide">
                  Client
                </th>
                <th className="text-left py-2 px-3 text-xs font-semibold text-custom-700 uppercase tracking-wide">
                  Service
                </th>
                <th className="text-left py-2 px-3 text-xs font-semibold text-custom-700 uppercase tracking-wide">
                  Status
                </th>
                <th className="text-left py-2 px-3 text-xs font-semibold text-custom-700 uppercase tracking-wide">
                  Deadline
                </th>
              </tr>
            </thead>
            <tbody>
              {recentJobs.map((job) => (
                <tr
                  key={job.id}
                  className="border-b border-custom-200 hover:bg-custom-50 transition-colors"
                >
                  <td className="py-3 px-3 font-semibold text-primary-500">
                    {job.id}
                  </td>
                  <td className="py-3 px-3 text-secondary-100">{job.client}</td>
                  <td className="py-3 px-3 text-custom-700">{job.service}</td>
                  <td className="py-3 px-3">
                    <span
                      className={`text-xs font-semibold px-2 py-0.5 rounded-full ${statusColor[job.status] ?? "bg-custom-100 text-custom-800"}`}
                    >
                      {job.status}
                    </span>
                  </td>
                  <td className="py-3 px-3 text-custom-700">{job.deadline}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </Card>
        </>
      )}
    </div>
  );
}
