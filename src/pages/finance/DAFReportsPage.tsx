import {
  HiOutlineChartBar,
  HiOutlineDocumentReport,
  HiOutlineDownload,
  HiOutlinePlus,
  HiOutlineTrendingUp,
  HiOutlineX
} from "react-icons/hi";
import { DashboardLayout } from "../../components";
import { Button, Card } from "../../components/ui";
import { useState } from "react";

const reportTypes = [
  {
    title: "Financial Report",
    description: "Income, expenses, and profit analysis",
    icon: HiOutlineChartBar,
    color: "text-primary-600",
    bg: "bg-primary-100",
  },
  {
    title: "Payroll Report",
    description: "Employee salaries and benefits breakdown",
    icon: HiOutlineTrendingUp,
    color: "text-green-600",
    bg: "bg-green-100",
  },
  {
    title: "Tax Report",
    description: "Tax obligations and compliance status",
    icon: HiOutlineDocumentReport,
    color: "text-yellow-600",
    bg: "bg-yellow-100",
  },
];

const recentReports = [
  { name: "Monthly Financial Report - April", date: "2026-05-01", size: "2.3 MB" },
  { name: "Payroll Report - April 2026", date: "2026-05-01", size: "1.8 MB" },
  { name: "Tax Compliance Report Q1", date: "2026-04-28", size: "1.2 MB" },
  { name: "Budget vs Actual - April", date: "2026-05-02", size: "1.5 MB" },
];

export default function DAFReportsPage() {
  const [showGenerateModal, setShowGenerateModal] = useState(false);
  const [reportForm, setReportForm] = useState({
    type: "",
    period: "",
    format: "PDF",
  });

  const handleGenerateReport = () => {
    console.log("Generating report:", reportForm);
    alert(`Generating ${reportForm.type} report for ${reportForm.period}...`);
    setShowGenerateModal(false);
    setReportForm({ type: "", period: "", format: "PDF" });
  };

  return (
    <DashboardLayout userRole="daf" userName="DAF" notificationCount={5}>
      <div className="space-y-8 font-[family-name:var(--font-family-primary)]">
        {/* Header */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
          <div>
            <h1 className="text-2xl md:text-3xl font-bold text-secondary-100">
              Financial Reports
            </h1>
            <p className="text-sm text-custom-700 mt-1">
              Generate and analyze financial performance reports
            </p>
          </div>
          <Button
            onClick={() => setShowGenerateModal(true)}
            className="!bg-primary-500 hover:!bg-primary-600 !text-white"
          >
            <HiOutlinePlus className="w-4 h-4 mr-2" />
            Generate Report
          </Button>
        </div>

        {/* Report Types */}
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
          {reportTypes.map((report) => (
            <Card key={report.title} hoverable className="!p-6 cursor-pointer">
              <div
                className={`w-12 h-12 rounded-xl flex items-center justify-center ${report.bg} mb-4`}
              >
                <report.icon className={`w-6 h-6 ${report.color}`} />
              </div>
              <h3 className="font-bold text-secondary-100 mb-2">{report.title}</h3>
              <p className="text-xs text-custom-700">{report.description}</p>
            </Card>
          ))}
        </div>

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

        {/* Generate Report Modal */}
        {showGenerateModal && (
          <div className="fixed inset-0 bg-secondary-100/50 z-50 flex items-center justify-center p-4">
            <Card className="!p-6 max-w-2xl w-full">
              <div className="flex items-start justify-between mb-4">
                <div>
                  <h3 className="text-xl font-bold text-secondary-100">Generate New Report</h3>
                  <p className="text-sm text-custom-700 mt-1">
                    Select report type and parameters
                  </p>
                </div>
                <button
                  onClick={() => setShowGenerateModal(false)}
                  className="text-custom-700 hover:text-secondary-100"
                >
                  <HiOutlineX className="w-6 h-6" />
                </button>
              </div>

              <div className="space-y-4">
                {/* Report Type */}
                <div>
                  <label className="block text-sm font-semibold text-secondary-100 mb-2">
                    Report Type <span className="text-red-500">*</span>
                  </label>
                  <select
                    value={reportForm.type}
                    onChange={(e) => setReportForm({ ...reportForm, type: e.target.value })}
                    className="w-full px-4 py-2 rounded-xl border border-custom-300 bg-style-500 text-secondary-100 focus:outline-none focus:border-primary-400 focus:ring-2 focus:ring-primary-200"
                  >
                    <option value="">Select Report Type</option>
                    <option value="Financial Report">Financial Report</option>
                    <option value="Payroll Report">Payroll Report</option>
                    <option value="Tax Report">Tax Report</option>
                    <option value="Budget vs Actual">Budget vs Actual</option>
                    <option value="Cash Flow">Cash Flow Report</option>
                    <option value="Profit & Loss">Profit & Loss Statement</option>
                  </select>
                </div>

                {/* Period */}
                <div>
                  <label className="block text-sm font-semibold text-secondary-100 mb-2">
                    Period <span className="text-red-500">*</span>
                  </label>
                  <select
                    value={reportForm.period}
                    onChange={(e) => setReportForm({ ...reportForm, period: e.target.value })}
                    className="w-full px-4 py-2 rounded-xl border border-custom-300 bg-style-500 text-secondary-100 focus:outline-none focus:border-primary-400 focus:ring-2 focus:ring-primary-200"
                  >
                    <option value="">Select Period</option>
                    <option value="May 2026">May 2026</option>
                    <option value="April 2026">April 2026</option>
                    <option value="March 2026">March 2026</option>
                    <option value="Q2 2026">Q2 2026</option>
                    <option value="Q1 2026">Q1 2026</option>
                    <option value="Year 2026">Year 2026</option>
                    <option value="Year 2025">Year 2025</option>
                  </select>
                </div>

                {/* Format */}
                <div>
                  <label className="block text-sm font-semibold text-secondary-100 mb-2">
                    Format <span className="text-red-500">*</span>
                  </label>
                  <div className="flex gap-3">
                    {["PDF", "Excel", "CSV"].map((format) => (
                      <button
                        key={format}
                        onClick={() => setReportForm({ ...reportForm, format })}
                        className={`flex-1 px-4 py-2 rounded-xl text-sm font-semibold transition-colors ${
                          reportForm.format === format
                            ? "bg-primary-500 text-white"
                            : "bg-custom-100 text-custom-700 hover:bg-custom-200"
                        }`}
                      >
                        {format}
                      </button>
                    ))}
                  </div>
                </div>

                {/* Additional Options */}
                <div className="p-4 rounded-xl bg-custom-50 border border-custom-200">
                  <h4 className="text-sm font-bold text-secondary-100 mb-3">Additional Options</h4>
                  <div className="space-y-2">
                    <label className="flex items-center gap-2 cursor-pointer">
                      <input
                        type="checkbox"
                        className="w-4 h-4 rounded border-custom-300 text-primary-500 focus:ring-primary-200"
                      />
                      <span className="text-sm text-secondary-100">Include detailed breakdown</span>
                    </label>
                    <label className="flex items-center gap-2 cursor-pointer">
                      <input
                        type="checkbox"
                        className="w-4 h-4 rounded border-custom-300 text-primary-500 focus:ring-primary-200"
                      />
                      <span className="text-sm text-secondary-100">Include charts and graphs</span>
                    </label>
                    <label className="flex items-center gap-2 cursor-pointer">
                      <input
                        type="checkbox"
                        className="w-4 h-4 rounded border-custom-300 text-primary-500 focus:ring-primary-200"
                      />
                      <span className="text-sm text-secondary-100">Compare with previous period</span>
                    </label>
                  </div>
                </div>
              </div>

              <div className="flex gap-3 mt-6">
                <button
                  onClick={() => setShowGenerateModal(false)}
                  className="flex-1 px-4 py-2 rounded-xl border border-custom-300 hover:bg-custom-100 transition-colors text-sm font-semibold text-custom-700"
                >
                  Cancel
                </button>
                <button
                  onClick={handleGenerateReport}
                  disabled={!reportForm.type || !reportForm.period}
                  className="flex-1 px-4 py-2 rounded-xl bg-primary-500 text-white hover:bg-primary-600 transition-colors text-sm font-semibold disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  <HiOutlineDocumentReport className="w-4 h-4 inline mr-2" />
                  Generate Report
                </button>
              </div>
            </Card>
          </div>
        )}
      </div>
    </DashboardLayout>
  );
}
