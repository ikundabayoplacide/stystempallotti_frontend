import {
    HiOutlineChartBar,
    HiOutlineDocumentReport,
    HiOutlineDownload,
    HiOutlineTrendingUp,
} from "react-icons/hi";
import { DashboardLayout } from "../../components";
import { Card } from "../../components/ui";

const reportTypes = [
  {
    title: "Production Report",
    description: "Job completion rates and efficiency metrics",
    icon: HiOutlineChartBar,
    color: "text-primary-600",
    bg: "bg-primary-100",
  },
  {
    title: "Team Performance",
    description: "Individual and team productivity analysis",
    icon: HiOutlineTrendingUp,
    color: "text-green-600",
    bg: "bg-green-100",
  },
  {
    title: "Department Utilization",
    description: "Resource usage and capacity planning",
    icon: HiOutlineDocumentReport,
    color: "text-yellow-600",
    bg: "bg-yellow-100",
  },
];

const recentReports = [
  { name: "Weekly Production Report", date: "2026-04-30", size: "1.8 MB" },
  { name: "Team Performance - April", date: "2026-04-28", size: "2.1 MB" },
  { name: "Department Efficiency Report", date: "2026-04-25", size: "1.5 MB" },
];

export default function ReportsPage() {
  return (
    <DashboardLayout
      userRole="supervisor"
      userName="Production Supervisor"
      notificationCount={4}
    >
      <div className="space-y-8 font-[family-name:var(--font-family-primary)]">
        {/* Header */}
        <div>
          <h1 className="text-2xl md:text-3xl font-bold text-secondary-100">
            Production Reports
          </h1>
          <p className="text-sm text-custom-700 mt-1">
            Generate and analyze production performance reports
          </p>
        </div>

        {/* Report Types */}
        <Card className="!p-0 overflow-hidden">
          <div className="p-4 bg-custom-100 border-b border-custom-300">
            <h2 className="font-bold text-secondary-100">Available Report Types</h2>
          </div>
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead className="bg-custom-50 border-b border-custom-300">
                <tr>
                  <th className="px-4 py-3 text-left text-xs font-bold text-secondary-100 uppercase">
                    Report Type
                  </th>
                  <th className="px-4 py-3 text-left text-xs font-bold text-secondary-100 uppercase">
                    Description
                  </th>
                  <th className="px-4 py-3 text-right text-xs font-bold text-secondary-100 uppercase">
                    Actions
                  </th>
                </tr>
              </thead>
              <tbody className="bg-white divide-y divide-custom-200">
                {reportTypes.map((report) => (
                  <tr key={report.title} className="hover:bg-custom-50 transition-colors">
                    <td className="px-4 py-4">
                      <div className="flex items-center gap-3">
                        <div className={`w-10 h-10 rounded-xl flex items-center justify-center ${report.bg} flex-shrink-0`}>
                          <report.icon className={`w-5 h-5 ${report.color}`} />
                        </div>
                        <span className="text-sm font-bold text-secondary-100">
                          {report.title}
                        </span>
                      </div>
                    </td>
                    <td className="px-4 py-4">
                      <span className="text-sm text-custom-700">{report.description}</span>
                    </td>
                    <td className="px-4 py-4">
                      <div className="flex items-center justify-end">
                        <button className="px-4 py-2 rounded-lg bg-primary-500 text-white hover:bg-primary-600 transition-colors text-sm font-semibold">
                          Generate Report
                        </button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </Card>

        {/* Recent Reports */}
        <Card className="!p-0 overflow-hidden">
          <div className="p-4 bg-custom-100 border-b border-custom-300">
            <div className="flex items-center gap-2">
              <HiOutlineDocumentReport className="w-5 h-5 text-primary-500" />
              <h2 className="font-bold text-secondary-100">Recent Reports</h2>
            </div>
          </div>
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead className="bg-custom-50 border-b border-custom-300">
                <tr>
                  <th className="px-4 py-3 text-left text-xs font-bold text-secondary-100 uppercase">
                    Report Name
                  </th>
                  <th className="px-4 py-3 text-left text-xs font-bold text-secondary-100 uppercase">
                    Date Generated
                  </th>
                  <th className="px-4 py-3 text-left text-xs font-bold text-secondary-100 uppercase">
                    File Size
                  </th>
                  <th className="px-4 py-3 text-right text-xs font-bold text-secondary-100 uppercase">
                    Actions
                  </th>
                </tr>
              </thead>
              <tbody className="bg-white divide-y divide-custom-200">
                {recentReports.map((report, idx) => (
                  <tr key={idx} className="hover:bg-custom-50 transition-colors">
                    <td className="px-4 py-4">
                      <div className="flex items-center gap-3">
                        <div className="w-10 h-10 rounded-lg bg-primary-100 flex items-center justify-center flex-shrink-0">
                          <HiOutlineDocumentReport className="w-5 h-5 text-primary-600" />
                        </div>
                        <span className="text-sm font-semibold text-secondary-100">
                          {report.name}
                        </span>
                      </div>
                    </td>
                    <td className="px-4 py-4">
                      <span className="text-sm text-custom-700">{report.date}</span>
                    </td>
                    <td className="px-4 py-4">
                      <span className="text-sm text-custom-700">{report.size}</span>
                    </td>
                    <td className="px-4 py-4">
                      <div className="flex items-center justify-end">
                        <button className="p-2 rounded-lg hover:bg-primary-100 transition-colors">
                          <HiOutlineDownload className="w-5 h-5 text-primary-500" />
                        </button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </Card>
      </div>
    </DashboardLayout>
  );
}
