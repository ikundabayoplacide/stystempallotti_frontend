import { useMemo, useState } from "react";
import {
  HiOutlineCheckCircle,
  HiOutlineClock,
  HiOutlineExclamationCircle,
  HiOutlineTrendingUp,
  HiOutlineUsers,
  HiOutlineX,
  HiOutlineRefresh,
} from "react-icons/hi";
import { DashboardLayout } from "../../components";
import { Card } from "../../components/ui";
import { useGetJobsQuery, type Job } from "../../store/services/jobsService";
import { useGetDepartmentsQuery } from "../../store/services/departmentsService";
import { useGetAllEmployeesQuery } from "../../store/services/employeesService";

// ─── Helpers ──────────────────────────────────────────────────────────────────

const IN_PRODUCTION_STATUSES = [
  "in-composition",
  "in-montage",
  "in-printing",
  "in-binding",
  "in-packaging",
  "quality-check",
];

const DONE_STATUSES = ["ready-for-delivery", "delivered", "completed"];

function isCompleted(job: Job): boolean {
  return DONE_STATUSES.includes(job.status);
}

const DEPT_COLORS = ["purple", "indigo", "cyan", "teal", "green", "blue", "orange", "pink"];

// ─── Page ─────────────────────────────────────────────────────────────────────

export default function ProductionOverviewPage() {
  const [showDetailsModal, setShowDetailsModal] = useState(false);
  const [selectedDeptId, setSelectedDeptId] = useState<string | null>(null);

  const { data: jobsData, isLoading: jobsLoading, refetch: refetchJobs } =
    useGetJobsQuery({ limit: 1000 });

  const { data: departments = [], isLoading: deptsLoading, refetch: refetchDepts } =
    useGetDepartmentsQuery();

  const { data: employeesData, isLoading: empsLoading, refetch: refetchEmps } =
    useGetAllEmployeesQuery({ limit: 2000 });

  const allJobs: Job[] = jobsData?.jobs ?? [];
  const allEmployees = employeesData?.data ?? [];
  const isLoading = jobsLoading || deptsLoading || empsLoading;

  const refetchAll = () => { refetchJobs(); refetchDepts(); refetchEmps(); };

  // Per-department stats derived from real data
  const deptStats = useMemo(() =>
    departments.map((dept, idx) => {
      const deptJobs = allJobs.filter((j) => j.departmentAssignedToId === dept.id);
      const activeJobs = deptJobs.filter((j) => IN_PRODUCTION_STATUSES.includes(j.status)).length;
      const completedJobs = deptJobs.filter(isCompleted).length;
      const workers = allEmployees.filter((e) => e.departmentId === dept.id && e.isActive).length;
      const total = deptJobs.length;
      const efficiency = total > 0 ? Math.round((completedJobs / total) * 100) : 0;
      return {
        id: dept.id,
        name: dept.name,
        activeJobs,
        completedJobs,
        workers,
        efficiency,
        color: DEPT_COLORS[idx % DEPT_COLORS.length],
        totalJobs: total,
      };
    }),
    [departments, allJobs, allEmployees]
  );

  const overallStats = useMemo(() => {
    const activeJobs = allJobs.filter((j) => IN_PRODUCTION_STATUSES.includes(j.status)).length;
    const completedJobs = allJobs.filter(isCompleted).length;
    const activeWorkers = allEmployees.filter((e) => e.isActive).length;
    const total = allJobs.length;
    const avgEfficiency = total > 0 ? Math.round((completedJobs / total) * 100) : 0;
    return { activeJobs, completedJobs, activeWorkers, avgEfficiency };
  }, [allJobs, allEmployees]);

  // Bottlenecks: departments queued with many active jobs
  const bottlenecks = useMemo(() =>
    deptStats
      .filter((d) => d.activeJobs >= 5)
      .sort((a, b) => b.activeJobs - a.activeJobs)
      .slice(0, 3)
      .map((d) => ({
        department: d.name,
        issue: `${d.activeJobs} active job${d.activeJobs !== 1 ? "s" : ""} in queue`,
        recommendation:
          d.activeJobs >= 10
            ? "Assign additional workers or redistribute jobs"
            : "Monitor progress and prioritize urgent jobs",
      })),
    [deptStats]
  );

  // Recent activity: last 6 jobs touched in production
  const recentActivity = useMemo(() =>
    [...allJobs]
      .filter((j) => IN_PRODUCTION_STATUSES.includes(j.status) || DONE_STATUSES.includes(j.status))
      .sort((a, b) => new Date(b.updatedAt).getTime() - new Date(a.updatedAt).getTime())
      .slice(0, 6)
      .map((j) => {
        const deptName = departments.find((d) => d.id === j.departmentAssignedToId)?.name ?? "Production";
        const diff = Date.now() - new Date(j.updatedAt).getTime();
        const mins = Math.floor(diff / 60000);
        const timeAgo = mins < 1 ? "just now" : mins < 60 ? `${mins}m ago` : mins < 1440 ? `${Math.floor(mins / 60)}h ago` : `${Math.floor(mins / 1440)}d ago`;
        return {
          time: timeAgo,
          action: `${j.jobNumber} — ${j.title} (${j.status.replace(/-/g, " ")})`,
          dept: deptName,
        };
      }),
    [allJobs, departments]
  );

  const selectedDept = deptStats.find((d) => d.id === selectedDeptId) ?? null;

  return (
    <DashboardLayout userRole="admin" userName="Admin" notificationCount={0}>
      <div className="space-y-6 font-[family-name:var(--font-family-primary)]">

        {/* Header */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
          <div>
            <h1 className="text-2xl md:text-3xl font-bold text-secondary-100">Production Overview</h1>
            <p className="text-sm text-custom-700 mt-1">Real-time monitoring of all production departments</p>
          </div>
          <button
            onClick={refetchAll}
            className="flex items-center gap-2 px-4 py-2 rounded-xl border border-custom-300 hover:bg-custom-100 transition-colors text-sm font-semibold text-custom-700 w-fit"
          >
            <HiOutlineRefresh className={`w-4 h-4 ${isLoading ? "animate-spin" : ""}`} />
            Refresh
          </button>
        </div>

        {/* Overall Stats */}
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
          {[
            { label: "Active Jobs", value: overallStats.activeJobs, icon: HiOutlineClock, bg: "bg-blue-100", fg: "text-blue-600" },
            { label: "Completed (All-Time)", value: overallStats.completedJobs, icon: HiOutlineCheckCircle, bg: "bg-green-100", fg: "text-green-600" },
            { label: "Active Workers", value: overallStats.activeWorkers, icon: HiOutlineUsers, bg: "bg-purple-100", fg: "text-purple-600" },
            { label: "Completion Rate", value: `${overallStats.avgEfficiency}%`, icon: HiOutlineTrendingUp, bg: "bg-yellow-100", fg: "text-yellow-600" },
          ].map(({ label, value, icon: Icon, bg, fg }) => (
            <Card key={label} className="!p-4">
              <div className="flex items-center gap-3 mb-2">
                <div className={`w-10 h-10 rounded-xl ${bg} flex items-center justify-center`}>
                  <Icon className={`w-5 h-5 ${fg}`} />
                </div>
              </div>
              <p className="text-2xl font-bold text-secondary-100">{isLoading ? "—" : value}</p>
              <p className="text-xs text-custom-700">{label}</p>
            </Card>
          ))}
        </div>

        {/* Bottlenecks */}
        {!isLoading && bottlenecks.length > 0 && (
          <Card className="!p-4 !bg-red-50 border-2 border-red-200">
            <div className="flex items-start gap-3">
              <div className="w-10 h-10 rounded-xl bg-red-500 flex items-center justify-center flex-shrink-0">
                <HiOutlineExclamationCircle className="w-6 h-6 text-white" />
              </div>
              <div className="flex-1">
                <h3 className="text-sm font-bold text-red-900 mb-2">
                  {bottlenecks.length} High-Load Department{bottlenecks.length > 1 ? "s" : ""} Detected
                </h3>
                <div className="space-y-2">
                  {bottlenecks.map((b, idx) => (
                    <div key={idx} className="text-xs text-red-700">
                      <p className="font-semibold">{b.department}: {b.issue}</p>
                      <p className="text-red-600">→ {b.recommendation}</p>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          </Card>
        )}

        {/* Department Table */}
        {isLoading ? (
          <Card className="!p-6 space-y-3">
            {Array.from({ length: 5 }).map((_, i) => (
              <div key={i} className="h-10 bg-custom-100 rounded-xl animate-pulse" />
            ))}
          </Card>
        ) : departments.length === 0 ? (
          <Card className="!p-10 text-center">
            <p className="text-secondary-100 font-semibold">No departments found</p>
            <p className="text-sm text-custom-700 mt-1">Create departments to see production stats here.</p>
          </Card>
        ) : (
          <Card className="!p-0 overflow-hidden">
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead className="bg-custom-100 border-b border-custom-300">
                  <tr>
                    {["Department", "Active Jobs", "Completed", "Workers", "Completion Rate", "Actions"].map((h) => (
                      <th key={h} className={`px-4 py-3 text-xs font-bold text-secondary-100 uppercase ${h === "Actions" ? "text-right" : "text-left"}`}>{h}</th>
                    ))}
                  </tr>
                </thead>
                <tbody className="bg-white divide-y divide-custom-200">
                  {deptStats.map((dept) => (
                    <tr key={dept.id} className="hover:bg-custom-50 transition-colors">
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
                        <span className="text-sm font-semibold text-green-600">{dept.completedJobs}</span>
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
                              <div className={`h-2 rounded-full bg-${dept.color}-500`} style={{ width: `${dept.efficiency}%` }} />
                            </div>
                          </div>
                          <span className="text-sm font-bold text-primary-600 min-w-[40px]">{dept.efficiency}%</span>
                        </div>
                      </td>
                      <td className="px-4 py-4 text-right">
                        <button
                          onClick={() => { setSelectedDeptId(dept.id); setShowDetailsModal(true); }}
                          className="px-4 py-2 rounded-lg border border-custom-300 hover:bg-custom-100 transition-colors text-sm font-semibold text-custom-700"
                        >
                          View Details
                        </button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </Card>
        )}

        {/* Recent Activity */}
        <Card className="!p-6">
          <h2 className="text-lg font-bold text-secondary-100 mb-4">Recent Activity</h2>
          {isLoading ? (
            <div className="space-y-3">
              {Array.from({ length: 4 }).map((_, i) => (
                <div key={i} className="h-12 bg-custom-100 rounded-xl animate-pulse" />
              ))}
            </div>
          ) : recentActivity.length === 0 ? (
            <p className="text-sm text-custom-700 text-center py-6">No recent production activity.</p>
          ) : (
            <div className="space-y-3">
              {recentActivity.map((a, idx) => (
                <div key={idx} className="flex items-start gap-3 p-3 rounded-xl bg-custom-50 border border-custom-200">
                  <div className="w-2 h-2 rounded-full bg-primary-500 mt-2 flex-shrink-0" />
                  <div className="flex-1 min-w-0">
                    <p className="text-sm font-semibold text-secondary-100 truncate">{a.action}</p>
                    <p className="text-xs text-custom-700">{a.dept} • {a.time}</p>
                  </div>
                </div>
              ))}
            </div>
          )}
        </Card>

        {/* Department Details Modal */}
        {showDetailsModal && selectedDept && (
          <div className="fixed inset-0 bg-secondary-100/50 z-50 flex items-center justify-center p-4">
            <Card className="!p-6 max-w-2xl w-full">
              <div className="flex items-start justify-between mb-4">
                <div>
                  <h3 className="text-xl font-bold text-secondary-100">{selectedDept.name} Department</h3>
                  <p className="text-sm text-custom-700 mt-1">Live performance metrics</p>
                </div>
                <button onClick={() => setShowDetailsModal(false)} className="text-custom-700 hover:text-secondary-100">
                  <HiOutlineX className="w-6 h-6" />
                </button>
              </div>

              <div className="space-y-4">
                <div className="p-4 rounded-xl bg-custom-50 border border-custom-200">
                  <h4 className="text-sm font-bold text-secondary-100 uppercase tracking-wide mb-3">Performance Overview</h4>
                  <div className="grid grid-cols-2 gap-4">
                    {[
                      { label: "Active Jobs", value: selectedDept.activeJobs, color: "text-blue-600" },
                      { label: "Completed (All-Time)", value: selectedDept.completedJobs, color: "text-green-600" },
                      { label: "Active Workers", value: selectedDept.workers, color: "text-purple-600" },
                      { label: "Total Jobs Assigned", value: selectedDept.totalJobs, color: "text-secondary-100" },
                    ].map(({ label, value, color }) => (
                      <div key={label}>
                        <p className="text-xs text-custom-700 mb-1">{label}</p>
                        <p className={`text-2xl font-bold ${color}`}>{value}</p>
                      </div>
                    ))}
                  </div>
                </div>

                <div>
                  <h4 className="text-sm font-bold text-secondary-100 uppercase tracking-wide mb-3">Completion Analysis</h4>
                  <div className="space-y-3">
                    <div>
                      <div className="flex items-center justify-between mb-1">
                        <span className="text-sm text-secondary-100">Completion Rate (all-time)</span>
                        <span className="text-sm font-bold text-primary-600">{selectedDept.efficiency}%</span>
                      </div>
                      <div className="w-full bg-custom-200 rounded-full h-3">
                        <div className={`h-3 rounded-full bg-${selectedDept.color}-500`} style={{ width: `${selectedDept.efficiency}%` }} />
                      </div>
                    </div>
                    {selectedDept.workers > 0 && (
                      <div className="flex items-center justify-between">
                        <span className="text-sm text-secondary-100">Active Jobs per Worker</span>
                        <span className="text-sm font-bold text-secondary-100">
                          {(selectedDept.activeJobs / selectedDept.workers).toFixed(1)}
                        </span>
                      </div>
                    )}
                  </div>
                </div>

                <div className={`p-4 rounded-xl border ${selectedDept.efficiency >= 50 ? "bg-blue-50 border-blue-200" : "bg-yellow-50 border-yellow-200"}`}>
                  <div className="flex items-center gap-2">
                    <HiOutlineCheckCircle className={`w-5 h-5 ${selectedDept.efficiency >= 50 ? "text-blue-600" : "text-yellow-600"}`} />
                    <div>
                      <p className={`text-sm font-bold ${selectedDept.efficiency >= 50 ? "text-blue-900" : "text-yellow-900"}`}>Department Status</p>
                      <p className={`text-xs ${selectedDept.efficiency >= 50 ? "text-blue-700" : "text-yellow-700"}`}>
                        {selectedDept.efficiency >= 75
                          ? "High throughput — department is completing jobs efficiently"
                          : selectedDept.efficiency >= 40
                          ? "Normal operation — steady progress on active jobs"
                          : selectedDept.activeJobs > 0
                          ? "Jobs in progress — completions pending today"
                          : "No active jobs assigned to this department"}
                      </p>
                    </div>
                  </div>
                </div>
              </div>

              <div className="mt-6">
                <button
                  onClick={() => setShowDetailsModal(false)}
                  className="w-full px-4 py-2 rounded-xl border border-custom-300 hover:bg-custom-100 transition-colors text-sm font-semibold text-custom-700"
                >
                  Close
                </button>
              </div>
            </Card>
          </div>
        )}

      </div>
    </DashboardLayout>
  );
}
