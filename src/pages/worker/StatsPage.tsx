import {
  HiOutlineChartBar,
  HiOutlineCheckCircle,
  HiOutlineClock,
  HiOutlineTrendingUp,
} from "react-icons/hi";
import { DashboardLayout } from "../../components";
import { Card } from "../../components/ui";

const stats = [
  {
    label: "Total Jobs Completed",
    value: "127",
    icon: HiOutlineCheckCircle,
    color: "text-green-600",
    bg: "bg-green-100",
    change: "+12% from last month",
  },
  {
    label: "Average Completion Time",
    value: "2.5h",
    icon: HiOutlineClock,
    color: "text-primary-500",
    bg: "bg-primary-100",
    change: "-15% improvement",
  },
  {
    label: "Efficiency Rating",
    value: "94%",
    icon: HiOutlineTrendingUp,
    color: "text-yellow-600",
    bg: "bg-yellow-100",
    change: "+3% from last month",
  },
  {
    label: "Total Hours Worked",
    value: "168h",
    icon: HiOutlineChartBar,
    color: "text-primary-600",
    bg: "bg-primary-100",
    change: "This month",
  },
];

const monthlyPerformance = [
  { month: "January", jobs: 28, hours: 160, efficiency: 89 },
  { month: "February", jobs: 32, hours: 168, efficiency: 91 },
  { month: "March", jobs: 35, hours: 172, efficiency: 93 },
  { month: "April", jobs: 32, hours: 168, efficiency: 94 },
];

const jobsByType = [
  { type: "Offset Printing", count: 45, percentage: 35 },
  { type: "Digital Printing", count: 32, percentage: 25 },
  { type: "Binding", count: 28, percentage: 22 },
  { type: "Composition", count: 22, percentage: 18 },
];

export default function StatsPage() {
  return (
    <DashboardLayout
      userRole="worker"
      userName="John Worker"
      notificationCount={2}
    >
      <div className="space-y-8 font-[family-name:var(--font-family-primary)]">
        {/* Header */}
        <div>
          <h1 className="text-2xl md:text-3xl font-bold text-secondary-100">
            My Statistics
          </h1>
          <p className="text-sm text-custom-700 mt-1">
            Track your performance and productivity metrics
          </p>
        </div>

        {/* Stats Grid */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
          {stats.map((stat) => (
            <Card key={stat.label} className="!p-4">
              <div className={`w-10 h-10 rounded-xl flex items-center justify-center ${stat.bg} mb-3`}>
                <stat.icon className={`w-5 h-5 ${stat.color}`} />
              </div>
              <p className="text-xs text-custom-700 mb-1">{stat.label}</p>
              <p className="text-2xl font-bold text-secondary-100 mb-1">{stat.value}</p>
              <p className="text-xs text-green-600">{stat.change}</p>
            </Card>
          ))}
        </div>

        {/* Monthly Performance */}
        <Card>
          <div className="flex items-center gap-2 mb-5">
            <HiOutlineChartBar className="w-5 h-5 text-primary-500" />
            <h2 className="font-bold text-secondary-100">Monthly Performance</h2>
          </div>
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead>
                <tr className="border-b border-custom-300">
                  {["Month", "Jobs Completed", "Hours Worked", "Efficiency"].map((h) => (
                    <th key={h} className="text-left py-2 px-3 text-xs font-semibold text-custom-700 uppercase tracking-wide whitespace-nowrap">
                      {h}
                    </th>
                  ))}
                </tr>
              </thead>
              <tbody>
                {monthlyPerformance.map((perf, idx) => (
                  <tr key={idx} className="border-b border-custom-200 hover:bg-custom-50 transition-colors">
                    <td className="py-3 px-3 font-semibold text-secondary-100 whitespace-nowrap">{perf.month}</td>
                    <td className="py-3 px-3 text-custom-700">{perf.jobs}</td>
                    <td className="py-3 px-3 text-custom-700">{perf.hours}h</td>
                    <td className="py-3 px-3">
                      <span className={`text-xs font-semibold px-2 py-0.5 rounded-full ${
                        perf.efficiency >= 93 ? "bg-green-100 text-green-700" :
                        perf.efficiency >= 90 ? "bg-yellow-100 text-yellow-700" :
                        "bg-red-100 text-red-700"
                      }`}>
                        {perf.efficiency}%
                      </span>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </Card>

        {/* Jobs by Type */}
        <Card>
          <div className="flex items-center gap-2 mb-5">
            <HiOutlineTrendingUp className="w-5 h-5 text-primary-500" />
            <h2 className="font-bold text-secondary-100">Jobs by Type (This Month)</h2>
          </div>
          <div className="space-y-4">
            {jobsByType.map((job) => (
              <div key={job.type}>
                <div className="flex items-center justify-between mb-2">
                  <span className="text-sm text-secondary-100 font-semibold">{job.type}</span>
                  <div className="flex items-center gap-3">
                    <span className="text-sm font-bold text-primary-500">{job.count} jobs</span>
                    <span className="text-xs text-custom-700">{job.percentage}%</span>
                  </div>
                </div>
                <div className="w-full bg-custom-200 rounded-full h-2">
                  <div
                    className="h-2 rounded-full bg-primary-500"
                    style={{ width: `${job.percentage}%` }}
                  />
                </div>
              </div>
            ))}
          </div>
        </Card>
      </div>
    </DashboardLayout>
  );
}
