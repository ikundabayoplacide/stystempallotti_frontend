import {
  HiOutlineChartBar,
  HiOutlineCheckCircle,
  HiOutlineClipboardList,
  HiOutlineClock,
  HiOutlineExclamationCircle,
  HiOutlineRefresh,
  HiOutlineTrendingUp,
} from "react-icons/hi";
import { Badge, Card } from "../../components/ui";
import { useGetDepartmentsQuery } from "../../store/services/departmentsService";
import { useGetJobsQuery } from "../../store/services/jobsService";
import { jobStatusConfig } from "../../types/JobStatus";

const PRODUCTION_STAGES = [
  "in-composition",
  "in-montage",
  "in-printing",
  "in-binding",
  "in-packaging",
  "quality-check",
  "ready-for-delivery",
] as const;

const priorityColor: Record<string, string> = {
  low:    "bg-green-100 text-green-700",
  normal: "bg-blue-100 text-blue-700",
  high:   "bg-orange-100 text-orange-700",
  urgent: "bg-red-500 text-white",
};

export default function ProductionDashboard() {
  const { data, isLoading, isFetching, refetch } = useGetJobsQuery({ limit: 100 });
  const { data: departments = [] } = useGetDepartmentsQuery();

  const jobs = data?.jobs ?? [];

  const pendingJobs      = jobs.filter((j) => j.status === "pending");
  const inProductionJobs = jobs.filter((j) => (PRODUCTION_STAGES as readonly string[]).includes(j.status));
  const completedToday   = jobs.filter((j) => {
    if (j.status !== "completed" && j.status !== "delivered") return false;
    const updated = new Date(j.updatedAt);
    const today   = new Date();
    return updated.toDateString() === today.toDateString();
  });
  const urgentJobs = jobs.filter((j) => j.priority === "urgent" && j.status !== "completed" && j.status !== "delivered");

  // Department utilization: count jobs per assigned department
  const deptJobCount: Record<string, number> = {};
  jobs.forEach((j) => {
    if (j.departmentAssignedToId) {
      deptJobCount[j.departmentAssignedToId] = (deptJobCount[j.departmentAssignedToId] ?? 0) + 1;
    }
  });

  const kpis = [
    { label: "Pending Approval", value: pendingJobs.length,      icon: HiOutlineClipboardList,    color: "text-primary-500",  bg: "bg-primary-100" },
    { label: "In Production",    value: inProductionJobs.length,  icon: HiOutlineClock,            color: "text-yellow-600",   bg: "bg-yellow-100" },
    { label: "Completed Today",  value: completedToday.length,    icon: HiOutlineCheckCircle,      color: "text-green-600",    bg: "bg-green-100" },
    { label: "Urgent Jobs",      value: urgentJobs.length,        icon: HiOutlineExclamationCircle,color: "text-red-500",      bg: "bg-red-100" },
  ];

  return (
    <div className="space-y-8 font-[family-name:var(--font-family-primary)]">
      {/* Header */}
      <div className="flex flex-col xs:flex-row xs:items-center justify-between gap-3">
        <div>
          <h1 className="text-2xl md:text-3xl font-bold text-secondary-100">Production Dashboard</h1>
          <p className="text-sm text-custom-700 mt-1">Live production overview</p>
        </div>
        <button
          onClick={() => refetch()}
          className="self-start p-2 rounded-xl border border-custom-300 hover:bg-custom-100 transition-colors"
          title="Refresh"
        >
          <HiOutlineRefresh className={`w-5 h-5 text-custom-700 ${isFetching ? "animate-spin" : ""}`} />
        </button>
      </div>

      {/* KPI Grid */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
        {kpis.map(({ label, value, icon: Icon, color, bg }) => (
          <Card key={label} className="!p-4 flex flex-col gap-3">
            <div className={`w-10 h-10 rounded-xl flex items-center justify-center ${bg}`}>
              <Icon className={`w-5 h-5 ${color}`} />
            </div>
            <div>
              <p className="text-xs text-custom-700">{label}</p>
              <p className="text-2xl font-bold text-secondary-100">{value}</p>
            </div>
          </Card>
        ))}
      </div>

      {/* Department Utilization */}
      {departments.length > 0 && (
        <Card>
          <div className="flex items-center gap-2 mb-5">
            <HiOutlineChartBar className="w-5 h-5 text-primary-500" />
            <h2 className="font-bold text-secondary-100">Department Utilization</h2>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-4">
            {departments.map((dept) => {
              const active = deptJobCount[dept.id] ?? 0;
              return (
                <div key={dept.id} className="p-4 rounded-xl border-2 border-custom-300 bg-style-500">
                  <div className="flex items-center justify-between mb-3">
                    <h3 className="font-bold text-secondary-100">{dept.name}</h3>
                    {active >= 5 && <Badge variant="danger" className="text-[10px]">High Load</Badge>}
                  </div>
                  <div className="flex justify-between text-sm">
                    <span className="text-custom-700">Active Jobs</span>
                    <span className="font-semibold text-secondary-100">{active}</span>
                  </div>
                </div>
              );
            })}
          </div>
        </Card>
      )}

      {/* Production Queue */}
      <Card>
        <div className="flex items-center gap-2 mb-5">
          <HiOutlineClipboardList className="w-5 h-5 text-primary-500" />
          <h2 className="font-bold text-secondary-100">Production Queue</h2>
        </div>
        {isLoading ? (
          <div className="flex items-center justify-center gap-2 py-8 text-custom-700">
            <HiOutlineRefresh className="w-5 h-5 animate-spin" />
            <span className="text-sm">Loading…</span>
          </div>
        ) : inProductionJobs.length === 0 ? (
          <p className="text-sm text-custom-700 py-4 text-center">No jobs currently in production</p>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead>
                <tr className="border-b border-custom-300">
                  {["Job", "Client", "Status", "Priority", "Department", "Due Date"].map((h) => (
                    <th key={h} className="text-left py-2 px-3 text-xs font-semibold text-custom-700 uppercase tracking-wide whitespace-nowrap">
                      {h}
                    </th>
                  ))}
                </tr>
              </thead>
              <tbody>
                {inProductionJobs.map((job) => {
                  const statusCfg = jobStatusConfig[job.status] ?? { label: job.status, bgColor: "bg-gray-100", color: "text-gray-700" };
                  const deptName  = job.departmentAssignedToId
                    ? (departments.find((d) => d.id === job.departmentAssignedToId)?.name ?? "—")
                    : "—";
                  return (
                    <tr key={job.id} className="border-b border-custom-200 hover:bg-custom-50 transition-colors">
                      <td className="py-3 px-3">
                        <span className="font-semibold text-primary-500 whitespace-nowrap">{job.jobNumber}</span>
                        <p className="text-xs text-custom-700 max-w-[140px] truncate">{job.title}</p>
                      </td>
                      <td className="py-3 px-3 text-secondary-100 whitespace-nowrap">{job.customer?.name ?? "—"}</td>
                      <td className="py-3 px-3">
                        <span className={`text-xs font-semibold px-2 py-0.5 rounded-full whitespace-nowrap ${statusCfg.bgColor} ${statusCfg.color}`}>
                          {statusCfg.label}
                        </span>
                      </td>
                      <td className="py-3 px-3">
                        <span className={`text-xs font-semibold px-2 py-0.5 rounded-full whitespace-nowrap ${priorityColor[job.priority] ?? "bg-gray-100 text-gray-700"}`}>
                          {job.priority}
                        </span>
                      </td>
                      <td className="py-3 px-3 text-custom-700 whitespace-nowrap">{deptName}</td>
                      <td className="py-3 px-3 text-custom-700 whitespace-nowrap">
                        {job.dueDate ? job.dueDate.split("T")[0] : "—"}
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        )}
      </Card>

      {/* Completed Today */}
      {completedToday.length > 0 && (
        <Card>
          <div className="flex items-center gap-2 mb-5">
            <HiOutlineCheckCircle className="w-5 h-5 text-green-600" />
            <h2 className="font-bold text-secondary-100">Completed Today</h2>
          </div>
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
            {completedToday.map((job) => (
              <div key={job.id} className="p-4 rounded-xl bg-green-50 border border-green-200">
                <div className="flex items-center gap-3 mb-2">
                  <div className="w-8 h-8 rounded-full bg-green-100 flex items-center justify-center">
                    <HiOutlineCheckCircle className="w-5 h-5 text-green-600" />
                  </div>
                  <span className="font-bold text-primary-500">{job.jobNumber}</span>
                </div>
                <p className="text-sm font-semibold text-secondary-100">{job.customer?.name ?? "—"}</p>
                <p className="text-xs text-custom-700">{job.title}</p>
              </div>
            ))}
          </div>
        </Card>
      )}

      {/* Production Workflow */}
      <Card>
        <div className="flex items-center gap-2 mb-5">
          <HiOutlineTrendingUp className="w-5 h-5 text-primary-500" />
          <h2 className="font-bold text-secondary-100">Production Workflow</h2>
        </div>
        <div className="flex flex-wrap gap-2 items-center">
          {(["pending", "confirmed", "in-composition", "in-montage", "in-printing", "in-binding", "in-packaging", "quality-check", "ready-for-delivery", "delivered", "completed"] as const).map((stage, i, arr) => (
            <div key={stage} className="flex items-center gap-2">
              <span className={`text-xs font-semibold px-3 py-1.5 rounded-full ${jobStatusConfig[stage].bgColor} ${jobStatusConfig[stage].color}`}>
                {jobStatusConfig[stage].label}
              </span>
              {i < arr.length - 1 && <span className="text-custom-400 text-xs">→</span>}
            </div>
          ))}
        </div>
      </Card>
    </div>
  );
}
