import { useState } from "react";
import {
  HiOutlineCheckCircle,
  HiOutlineClock,
  HiOutlineDocumentReport,
  HiOutlineExclamationCircle,
  HiOutlineTrendingUp,
  HiOutlineUsers,
  HiOutlineX
} from "react-icons/hi";
import { DashboardLayout } from "../../components";
import { Button, Card } from "../../components/ui";

const departmentStats = [
  {
    name: "Composition",
    activeJobs: 8,
    completedToday: 3,
    workers: 5,
    efficiency: 85,
    color: "purple",
  },
  {
    name: "Montage",
    activeJobs: 6,
    completedToday: 4,
    workers: 4,
    efficiency: 92,
    color: "indigo",
  },
  {
    name: "Printing",
    activeJobs: 12,
    completedToday: 7,
    workers: 8,
    efficiency: 78,
    color: "cyan",
  },
  {
    name: "Binding",
    activeJobs: 10,
    completedToday: 5,
    workers: 6,
    efficiency: 88,
    color: "teal",
  },
  {
    name: "Packaging",
    activeJobs: 7,
    completedToday: 6,
    workers: 5,
    efficiency: 95,
    color: "green",
  },
];

const bottlenecks = [
  {
    department: "Printing",
    issue: "High workload - 12 active jobs",
    severity: "high",
    recommendation: "Assign additional workers or redistribute jobs",
  },
  {
    department: "Composition",
    issue: "2 jobs delayed by 1 day",
    severity: "medium",
    recommendation: "Review job priorities and deadlines",
  },
];

const recentActivity = [
  {
    time: "10 mins ago",
    action: "JOB-2026-045 moved to Binding",
    user: "Printing Worker",
  },
  {
    time: "25 mins ago",
    action: "JOB-2026-044 completed in Packaging",
    user: "Packaging Worker",
  },
  {
    time: "1 hour ago",
    action: "JOB-2026-043 started in Printing",
    user: "Printing Worker",
  },
  {
    time: "2 hours ago",
    action: "JOB-2026-042 moved to Montage",
    user: "Composition Worker",
  },
];

export default function ProductionOverviewPage() {
  const [showExportModal, setShowExportModal] = useState(false);
  const [showDetailsModal, setShowDetailsModal] = useState(false);
  const [selectedDepartment, setSelectedDepartment] = useState<typeof departmentStats[0] | null>(null);
  const [exportForm, setExportForm] = useState({
    reportType: "",
    period: "",
    format: "PDF",
  });

  const handleExportReport = () => {
    console.log("Exporting report:", exportForm);
    alert(`Generating ${exportForm.reportType} report for ${exportForm.period}...`);
    setShowExportModal(false);
    setExportForm({ reportType: "", period: "", format: "PDF" });
  };

  return (
    <DashboardLayout userRole="admin" userName="Admin" notificationCount={0}>
      <div className="space-y-6 font-[family-name:var(--font-family-primary)]">
        {/* Header */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
          <div>
            <h1 className="text-2xl md:text-3xl font-bold text-secondary-100">
              Production Overview
            </h1>
            <p className="text-sm text-custom-700 mt-1">
              Real-time monitoring of all production departments
            </p>
          </div>
          <Button
            onClick={() => setShowExportModal(true)}
            className="!bg-primary-500 hover:!bg-primary-600 !text-white"
          >
            <HiOutlineDocumentReport className="w-4 h-4 mr-2" />
            Export Report
          </Button>
        </div>

        {/* Overall Stats */}
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
          <Card className="!p-4">
            <div className="flex items-center gap-3 mb-2">
              <div className="w-10 h-10 rounded-xl bg-blue-100 flex items-center justify-center">
                <HiOutlineClock className="w-5 h-5 text-blue-600" />
              </div>
            </div>
            <p className="text-2xl font-bold text-secondary-100">43</p>
            <p className="text-xs text-custom-700">Active Jobs</p>
          </Card>
          <Card className="!p-4">
            <div className="flex items-center gap-3 mb-2">
              <div className="w-10 h-10 rounded-xl bg-green-100 flex items-center justify-center">
                <HiOutlineCheckCircle className="w-5 h-5 text-green-600" />
              </div>
            </div>
            <p className="text-2xl font-bold text-secondary-100">25</p>
            <p className="text-xs text-custom-700">Completed Today</p>
          </Card>
          <Card className="!p-4">
            <div className="flex items-center gap-3 mb-2">
              <div className="w-10 h-10 rounded-xl bg-purple-100 flex items-center justify-center">
                <HiOutlineUsers className="w-5 h-5 text-purple-600" />
              </div>
            </div>
            <p className="text-2xl font-bold text-secondary-100">28</p>
            <p className="text-xs text-custom-700">Active Workers</p>
          </Card>
          <Card className="!p-4">
            <div className="flex items-center gap-3 mb-2">
              <div className="w-10 h-10 rounded-xl bg-yellow-100 flex items-center justify-center">
                <HiOutlineTrendingUp className="w-5 h-5 text-yellow-600" />
              </div>
            </div>
            <p className="text-2xl font-bold text-secondary-100">87%</p>
            <p className="text-xs text-custom-700">Avg Efficiency</p>
          </Card>
        </div>

        {/* Bottlenecks Alert */}
        {bottlenecks.length > 0 && (
          <Card className="!p-4 !bg-red-50 border-2 border-red-200">
            <div className="flex items-start gap-3">
              <div className="w-10 h-10 rounded-xl bg-red-500 flex items-center justify-center flex-shrink-0">
                <HiOutlineExclamationCircle className="w-6 h-6 text-white" />
              </div>
              <div className="flex-1">
                <h3 className="text-sm font-bold text-red-900 mb-2">
                  {bottlenecks.length} Bottleneck{bottlenecks.length > 1 ? "s" : ""} Detected
                </h3>
                <div className="space-y-2">
                  {bottlenecks.map((bottleneck, idx) => (
                    <div key={idx} className="text-xs text-red-700">
                      <p className="font-semibold">{bottleneck.department}: {bottleneck.issue}</p>
                      <p className="text-red-600">→ {bottleneck.recommendation}</p>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          </Card>
        )}

        {/* Department Table */}
        <Card className="!p-0 overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead className="bg-custom-100 border-b border-custom-300">
                <tr>
                  <th className="px-4 py-3 text-left text-xs font-bold text-secondary-100 uppercase">
                    Department
                  </th>
                  <th className="px-4 py-3 text-left text-xs font-bold text-secondary-100 uppercase">
                    Active Jobs
                  </th>
                  <th className="px-4 py-3 text-left text-xs font-bold text-secondary-100 uppercase">
                    Completed Today
                  </th>
                  <th className="px-4 py-3 text-left text-xs font-bold text-secondary-100 uppercase">
                    Workers
                  </th>
                  <th className="px-4 py-3 text-left text-xs font-bold text-secondary-100 uppercase">
                    Efficiency
                  </th>
                  <th className="px-4 py-3 text-right text-xs font-bold text-secondary-100 uppercase">
                    Actions
                  </th>
                </tr>
              </thead>
              <tbody className="bg-white divide-y divide-custom-200">
                {departmentStats.map((dept) => (
                  <tr key={dept.name} className="hover:bg-custom-50 transition-colors">
                    <td className="px-4 py-4">
                      <div className="flex items-center gap-3">
                        <div className={`w-3 h-3 rounded-full bg-${dept.color}-500`} />
                        <span className="text-sm font-bold text-secondary-100">{dept.name}</span>
                      </div>
                    </td>
                    <td className="px-4 py-4">
                      <span className="text-sm font-semibold text-blue-600">{dept.activeJobs}</span>
                    </td>
                    <td className="px-4 py-4">
                      <span className="text-sm font-semibold text-green-600">{dept.completedToday}</span>
                    </td>
                    <td className="px-4 py-4">
                      <div className="flex items-center gap-2">
                        <HiOutlineUsers className="w-4 h-4 text-custom-700" />
                        <span className="text-sm text-secondary-100">{dept.workers}</span>
                      </div>
                    </td>
                    <td className="px-4 py-4">
                      <div className="flex items-center gap-3">
                        <div className="flex-1 max-w-[120px]">
                          <div className="w-full bg-custom-200 rounded-full h-2">
                            <div
                              className={`h-2 rounded-full bg-${dept.color}-500`}
                              style={{ width: `${dept.efficiency}%` }}
                            />
                          </div>
                        </div>
                        <span className="text-sm font-bold text-primary-600 min-w-[40px]">
                          {dept.efficiency}%
                        </span>
                      </div>
                    </td>
                    <td className="px-4 py-4">
                      <div className="flex items-center justify-end">
                        <button
                          onClick={() => {
                            setSelectedDepartment(dept);
                            setShowDetailsModal(true);
                          }}
                          className="px-4 py-2 rounded-lg border border-custom-300 hover:bg-custom-100 transition-colors text-sm font-semibold text-custom-700"
                        >
                          View Details
                        </button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </Card>

        {/* Recent Activity */}
        <Card className="!p-6">
          <h2 className="text-lg font-bold text-secondary-100 mb-4">Recent Activity</h2>
          <div className="space-y-3">
            {recentActivity.map((activity, idx) => (
              <div
                key={idx}
                className="flex items-start gap-3 p-3 rounded-xl bg-custom-50 border border-custom-200"
              >
                <div className="w-2 h-2 rounded-full bg-primary-500 mt-2 flex-shrink-0" />
                <div className="flex-1">
                  <p className="text-sm font-semibold text-secondary-100">{activity.action}</p>
                  <p className="text-xs text-custom-700">
                    {activity.user} • {activity.time}
                  </p>
                </div>
              </div>
            ))}
          </div>
        </Card>

        {/* Department Details Modal */}
        {showDetailsModal && selectedDepartment && (
          <div className="fixed inset-0 bg-secondary-100/50 z-50 flex items-center justify-center p-4">
            <Card className="!p-6 max-w-2xl w-full">
              <div className="flex items-start justify-between mb-4">
                <div>
                  <h3 className="text-xl font-bold text-secondary-100">
                    {selectedDepartment.name} Department
                  </h3>
                  <p className="text-sm text-custom-700 mt-1">Detailed performance metrics</p>
                </div>
                <button
                  onClick={() => setShowDetailsModal(false)}
                  className="text-custom-700 hover:text-secondary-100"
                >
                  <HiOutlineX className="w-6 h-6" />
                </button>
              </div>

              <div className="space-y-4">
                {/* Performance Overview */}
                <div className="p-4 rounded-xl bg-custom-50 border border-custom-200">
                  <h4 className="text-sm font-bold text-secondary-100 uppercase tracking-wide mb-3">
                    Performance Overview
                  </h4>
                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <p className="text-xs text-custom-700 mb-1">Active Jobs</p>
                      <p className="text-2xl font-bold text-blue-600">{selectedDepartment.activeJobs}</p>
                    </div>
                    <div>
                      <p className="text-xs text-custom-700 mb-1">Completed Today</p>
                      <p className="text-2xl font-bold text-green-600">{selectedDepartment.completedToday}</p>
                    </div>
                    <div>
                      <p className="text-xs text-custom-700 mb-1">Total Workers</p>
                      <p className="text-2xl font-bold text-purple-600">{selectedDepartment.workers}</p>
                    </div>
                    <div>
                      <p className="text-xs text-custom-700 mb-1">Efficiency</p>
                      <p className="text-2xl font-bold text-primary-600">{selectedDepartment.efficiency}%</p>
                    </div>
                  </div>
                </div>

                {/* Efficiency Breakdown */}
                <div>
                  <h4 className="text-sm font-bold text-secondary-100 uppercase tracking-wide mb-3">
                    Efficiency Analysis
                  </h4>
                  <div className="space-y-3">
                    <div>
                      <div className="flex items-center justify-between mb-1">
                        <span className="text-sm text-secondary-100">Overall Efficiency</span>
                        <span className="text-sm font-bold text-primary-600">
                          {selectedDepartment.efficiency}%
                        </span>
                      </div>
                      <div className="w-full bg-custom-200 rounded-full h-3">
                        <div
                          className={`h-3 rounded-full bg-${selectedDepartment.color}-500`}
                          style={{ width: `${selectedDepartment.efficiency}%` }}
                        />
                      </div>
                    </div>
                    <div>
                      <div className="flex items-center justify-between mb-1">
                        <span className="text-sm text-secondary-100">Jobs per Worker</span>
                        <span className="text-sm font-bold text-secondary-100">
                          {(selectedDepartment.activeJobs / selectedDepartment.workers).toFixed(1)}
                        </span>
                      </div>
                    </div>
                    <div>
                      <div className="flex items-center justify-between mb-1">
                        <span className="text-sm text-secondary-100">Completion Rate</span>
                        <span className="text-sm font-bold text-green-600">
                          {((selectedDepartment.completedToday / selectedDepartment.activeJobs) * 100).toFixed(0)}%
                        </span>
                      </div>
                    </div>
                  </div>
                </div>

                {/* Status */}
                <div className="p-4 rounded-xl bg-blue-50 border border-blue-200">
                  <div className="flex items-center gap-2">
                    <HiOutlineCheckCircle className="w-5 h-5 text-blue-600" />
                    <div>
                      <p className="text-sm font-bold text-blue-900">Department Status</p>
                      <p className="text-xs text-blue-700">
                        {selectedDepartment.efficiency >= 90
                          ? "Excellent performance - Operating at peak efficiency"
                          : selectedDepartment.efficiency >= 75
                          ? "Good performance - Operating within normal parameters"
                          : "Needs attention - Consider workload redistribution"}
                      </p>
                    </div>
                  </div>
                </div>
              </div>

              <div className="flex gap-3 mt-6">
                <button
                  onClick={() => setShowDetailsModal(false)}
                  className="flex-1 px-4 py-2 rounded-xl border border-custom-300 hover:bg-custom-100 transition-colors text-sm font-semibold text-custom-700"
                >
                  Close
                </button>
                <button
                  onClick={() => {
                    alert(`Exporting ${selectedDepartment.name} department report...`);
                  }}
                  className="flex-1 px-4 py-2 rounded-xl bg-primary-500 text-white hover:bg-primary-600 transition-colors text-sm font-semibold"
                >
                  <HiOutlineDocumentReport className="w-4 h-4 inline mr-2" />
                  Export Department Report
                </button>
              </div>
            </Card>
          </div>
        )}

        {/* Export Report Modal */}
        {showExportModal && (
          <div className="fixed inset-0 bg-secondary-100/50 z-50 flex items-center justify-center p-4">
            <Card className="!p-6 max-w-2xl w-full">
              <div className="flex items-start justify-between mb-4">
                <div>
                  <h3 className="text-xl font-bold text-secondary-100">Export Production Report</h3>
                  <p className="text-sm text-custom-700 mt-1">
                    Generate a comprehensive production report
                  </p>
                </div>
                <button
                  onClick={() => setShowExportModal(false)}
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
                    value={exportForm.reportType}
                    onChange={(e) => setExportForm({ ...exportForm, reportType: e.target.value })}
                    className="w-full px-4 py-2 rounded-xl border border-custom-300 bg-style-500 text-secondary-100 focus:outline-none focus:border-primary-400 focus:ring-2 focus:ring-primary-200"
                  >
                    <option value="">Select Report Type</option>
                    <option value="Production Summary">Production Summary</option>
                    <option value="Department Performance">Department Performance</option>
                    <option value="Efficiency Analysis">Efficiency Analysis</option>
                    <option value="Bottleneck Report">Bottleneck Report</option>
                    <option value="Worker Productivity">Worker Productivity</option>
                    <option value="Complete Overview">Complete Overview</option>
                  </select>
                </div>

                {/* Period */}
                <div>
                  <label className="block text-sm font-semibold text-secondary-100 mb-2">
                    Period <span className="text-red-500">*</span>
                  </label>
                  <select
                    value={exportForm.period}
                    onChange={(e) => setExportForm({ ...exportForm, period: e.target.value })}
                    className="w-full px-4 py-2 rounded-xl border border-custom-300 bg-style-500 text-secondary-100 focus:outline-none focus:border-primary-400 focus:ring-2 focus:ring-primary-200"
                  >
                    <option value="">Select Period</option>
                    <option value="Today">Today</option>
                    <option value="Yesterday">Yesterday</option>
                    <option value="This Week">This Week</option>
                    <option value="Last Week">Last Week</option>
                    <option value="This Month">This Month</option>
                    <option value="Last Month">Last Month</option>
                    <option value="This Quarter">This Quarter</option>
                    <option value="This Year">This Year</option>
                    <option value="Custom Range">Custom Range</option>
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
                        onClick={() => setExportForm({ ...exportForm, format })}
                        className={`flex-1 px-4 py-2 rounded-xl text-sm font-semibold transition-colors ${
                          exportForm.format === format
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
                  <h4 className="text-sm font-bold text-secondary-100 mb-3">Include in Report</h4>
                  <div className="space-y-2">
                    <label className="flex items-center gap-2 cursor-pointer">
                      <input
                        type="checkbox"
                        defaultChecked
                        className="w-4 h-4 rounded border-custom-300 text-primary-500 focus:ring-primary-200"
                      />
                      <span className="text-sm text-secondary-100">Department statistics</span>
                    </label>
                    <label className="flex items-center gap-2 cursor-pointer">
                      <input
                        type="checkbox"
                        defaultChecked
                        className="w-4 h-4 rounded border-custom-300 text-primary-500 focus:ring-primary-200"
                      />
                      <span className="text-sm text-secondary-100">Efficiency metrics</span>
                    </label>
                    <label className="flex items-center gap-2 cursor-pointer">
                      <input
                        type="checkbox"
                        defaultChecked
                        className="w-4 h-4 rounded border-custom-300 text-primary-500 focus:ring-primary-200"
                      />
                      <span className="text-sm text-secondary-100">Bottleneck analysis</span>
                    </label>
                    <label className="flex items-center gap-2 cursor-pointer">
                      <input
                        type="checkbox"
                        className="w-4 h-4 rounded border-custom-300 text-primary-500 focus:ring-primary-200"
                      />
                      <span className="text-sm text-secondary-100">Worker details</span>
                    </label>
                    <label className="flex items-center gap-2 cursor-pointer">
                      <input
                        type="checkbox"
                        className="w-4 h-4 rounded border-custom-300 text-primary-500 focus:ring-primary-200"
                      />
                      <span className="text-sm text-secondary-100">Charts and graphs</span>
                    </label>
                  </div>
                </div>
              </div>

              <div className="flex gap-3 mt-6">
                <button
                  onClick={() => setShowExportModal(false)}
                  className="flex-1 px-4 py-2 rounded-xl border border-custom-300 hover:bg-custom-100 transition-colors text-sm font-semibold text-custom-700"
                >
                  Cancel
                </button>
                <button
                  onClick={handleExportReport}
                  disabled={!exportForm.reportType || !exportForm.period}
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
