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
    title: "Sales Report",
    description: "Quotations, approvals, and revenue analysis",
    icon: HiOutlineTrendingUp,
    color: "text-green-600",
    bg: "bg-green-100",
  },
  {
    title: "Financial Report",
    description: "Income, expenses, and profit margins",
    icon: HiOutlineChartBar,
    color: "text-primary-600",
    bg: "bg-primary-100",
  },
  {
    title: "Production Report",
    description: "Job completion rates and efficiency",
    icon: HiOutlineDocumentReport,
    color: "text-yellow-600",
    bg: "bg-yellow-100",
  },
  {
    title: "Stock Report",
    description: "Inventory levels and usage patterns",
    icon: HiOutlineDownload,
    color: "text-red-600",
    bg: "bg-red-100",
  },
];

const recentReports = [
  { name: "Monthly Sales Report - April 2026", date: "2026-04-30", size: "2.4 MB" },
  { name: "Financial Summary Q1 2026", date: "2026-03-31", size: "1.8 MB" },
  { name: "Production Efficiency Report", date: "2026-04-15", size: "3.1 MB" },
  { name: "Stock Movement Report", date: "2026-04-20", size: "1.2 MB" },
];

export default function ReportsPage() {
  return (
    <DashboardLayout
      userRole="admin"
      userName="Director"
      notificationCount={5}
    >
      <div className="space-y-8 font-[family-name:var(--font-family-primary)]">
        {/* Header */}
        <div>
          <h1 className="text-2xl md:text-3xl font-bold text-secondary-100">
            Reports & Analytics
          </h1>
          <p className="text-sm text-custom-700 mt-1">
            Generate and download business reports
          </p>
        </div>

        {/* Report Types */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
          {reportTypes.map((report) => (
            <Card
              key={report.title}
              hoverable
              className="!p-6 cursor-pointer"
            >
              <div className={`w-12 h-12 rounded-xl flex items-center justify-center ${report.bg} mb-4`}>
                <report.icon className={`w-6 h-6 ${report.color}`} />
              </div>
              <h3 className="font-bold text-secondary-100 mb-2">{report.title}</h3>
              <p className="text-xs text-custom-700">{report.description}</p>
            </Card>
          ))}
        </div>

        {/* Recent Reports */}
        <Card>
          <div className="flex items-center gap-2 mb-5">
            <HiOutlineDocumentReport className="w-5 h-5 text-primary-500" />
            <h2 className="font-bold text-secondary-100">Recent Reports</h2>
          </div>
          <div className="space-y-3">
            {recentReports.map((report, idx) => (
              <div
                key={idx}
                className="flex items-center justify-between p-4 rounded-xl bg-custom-50 border border-custom-200 hover:border-primary-300 transition-colors cursor-pointer"
              >
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 rounded-lg bg-primary-100 flex items-center justify-center">
                    <HiOutlineDocumentReport className="w-5 h-5 text-primary-600" />
                  </div>
                  <div>
                    <p className="text-sm font-semibold text-secondary-100">{report.name}</p>
                    <p className="text-xs text-custom-700">
                      {report.date} • {report.size}
                    </p>
                  </div>
                </div>
                <button className="p-2 rounded-lg hover:bg-primary-100 transition-colors">
                  <HiOutlineDownload className="w-5 h-5 text-primary-500" />
                </button>
              </div>
            ))}
          </div>
        </Card>
      </div>
    </DashboardLayout>
  );
}
