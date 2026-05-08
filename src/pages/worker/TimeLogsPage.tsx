import {
  HiOutlineCalendar,
  HiOutlineCheckCircle,
  HiOutlineClock,
} from "react-icons/hi";
import { DashboardLayout } from "../../components";
import { Card } from "../../components/ui";

const todayLogs = [
  { job: "JOB-001", task: "Offset Printing", startTime: "08:00 AM", endTime: "10:30 AM", duration: "2h 30m", status: "Completed" },
  { job: "JOB-002", task: "Binding", startTime: "10:45 AM", endTime: "12:15 PM", duration: "1h 30m", status: "Completed" },
  { job: "JOB-005", task: "Composition", startTime: "01:00 PM", endTime: "In Progress", duration: "2h 15m", status: "In Progress" },
];

const weeklyStats = [
  { day: "Monday", hours: 8, jobs: 5 },
  { day: "Tuesday", hours: 7.5, jobs: 4 },
  { day: "Wednesday", hours: 8, jobs: 6 },
  { day: "Thursday", hours: 6.5, jobs: 3 },
  { day: "Friday", hours: 0, jobs: 0 },
];

export default function TimeLogsPage() {
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
            Time Logs
          </h1>
          <p className="text-sm text-custom-700 mt-1">
            Track your work hours and job completion times
          </p>
        </div>

        {/* Today's Summary */}
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
          <Card className="!p-4">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-xl bg-primary-100 flex items-center justify-center">
                <HiOutlineClock className="w-5 h-5 text-primary-500" />
              </div>
              <div>
                <p className="text-xs text-custom-700">Hours Today</p>
                <p className="text-2xl font-bold text-secondary-100">6.25</p>
              </div>
            </div>
          </Card>
          <Card className="!p-4">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-xl bg-green-100 flex items-center justify-center">
                <HiOutlineCheckCircle className="w-5 h-5 text-green-600" />
              </div>
              <div>
                <p className="text-xs text-custom-700">Jobs Completed</p>
                <p className="text-2xl font-bold text-secondary-100">2</p>
              </div>
            </div>
          </Card>
          <Card className="!p-4">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-xl bg-yellow-100 flex items-center justify-center">
                <HiOutlineCalendar className="w-5 h-5 text-yellow-600" />
              </div>
              <div>
                <p className="text-xs text-custom-700">This Week</p>
                <p className="text-2xl font-bold text-secondary-100">30h</p>
              </div>
            </div>
          </Card>
        </div>

        {/* Today's Time Logs */}
        <Card>
          <div className="flex items-center gap-2 mb-5">
            <HiOutlineClock className="w-5 h-5 text-primary-500" />
            <h2 className="font-bold text-secondary-100">Today's Time Logs</h2>
          </div>
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead>
                <tr className="border-b border-custom-300">
                  {["Job ID", "Task", "Start Time", "End Time", "Duration", "Status"].map((h) => (
                    <th key={h} className="text-left py-2 px-3 text-xs font-semibold text-custom-700 uppercase tracking-wide whitespace-nowrap">
                      {h}
                    </th>
                  ))}
                </tr>
              </thead>
              <tbody>
                {todayLogs.map((log, idx) => (
                  <tr key={idx} className="border-b border-custom-200 hover:bg-custom-50 transition-colors">
                    <td className="py-3 px-3 font-semibold text-primary-500 whitespace-nowrap">{log.job}</td>
                    <td className="py-3 px-3 text-secondary-100 whitespace-nowrap">{log.task}</td>
                    <td className="py-3 px-3 text-custom-700 whitespace-nowrap">{log.startTime}</td>
                    <td className="py-3 px-3 text-custom-700 whitespace-nowrap">{log.endTime}</td>
                    <td className="py-3 px-3 text-secondary-100 font-semibold whitespace-nowrap">{log.duration}</td>
                    <td className="py-3 px-3">
                      <span className={`text-xs font-semibold px-2 py-0.5 rounded-full whitespace-nowrap ${
                        log.status === "Completed" ? "bg-green-100 text-green-700" : "bg-primary-100 text-primary-700"
                      }`}>
                        {log.status}
                      </span>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </Card>

        {/* Weekly Overview */}
        <Card>
          <div className="flex items-center gap-2 mb-5">
            <HiOutlineCalendar className="w-5 h-5 text-primary-500" />
            <h2 className="font-bold text-secondary-100">This Week</h2>
          </div>
          <div className="space-y-3">
            {weeklyStats.map((stat) => (
              <div key={stat.day} className="flex items-center gap-4">
                <span className="text-sm text-secondary-100 w-24 font-semibold">{stat.day}</span>
                <div className="flex-1 bg-custom-200 rounded-full h-2">
                  <div
                    className="h-2 rounded-full bg-primary-500"
                    style={{ width: `${(stat.hours / 8) * 100}%` }}
                  />
                </div>
                <span className="text-sm text-custom-700 w-16">{stat.hours}h</span>
                <span className="text-sm text-custom-700 w-16">{stat.jobs} jobs</span>
              </div>
            ))}
          </div>
        </Card>
      </div>
    </DashboardLayout>
  );
}
