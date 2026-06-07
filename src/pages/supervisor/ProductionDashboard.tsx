import { useSelector } from "react-redux";
import {
  HiOutlineCheckCircle,
  HiOutlineClipboardList,
  HiOutlineClock,
  HiOutlineExclamationCircle,
  HiOutlineRefresh,
} from "react-icons/hi";
import { Card } from "../../components/ui";
import { useGetDepartmentsQuery } from "../../store/services/departmentsService";
import { useGetJobsQuery } from "../../store/services/jobsService";
import { jobStatusConfig } from "../../types/JobStatus";
import type { RootState } from "../../store";

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
  low: "bg-green-100 text-green-700",
  normal: "bg-blue-100 text-blue-700",
  high: "bg-orange-100 text-orange-700",
  urgent: "bg-red-500 text-white",
};

export default function ProductionDashboard() {
  const currentUser = useSelector((state: RootState) => state.auth.user);
  const myDeptId = currentUser?.departmentId;

  const { data, isLoading, isFetching, refetch } = useGetJobsQuery(
    { limit: 200, departmentAssignedToId: myDeptId ?? undefined },
    { skip: !myDeptId }
  );
  const { data: departments = [] } = useGetDepartmentsQuery();

  const myDept = departments.find((d) => d.id === myDeptId);
  const jobs = data?.jobs ?? [];

  const inProductionJobs = jobs.filter((j) =>
    (PRODUCTION_STAGES as readonly string[]).includes(j.status)
  );
  const confirmedJobs = jobs.filter((j) => j.status === "confirmed");
  const urgentJobs = jobs.filter(
    (j) => j.priority === "urgent" && j.status !== "completed" && j.status !== "delivered"
  );
  const completedToday = jobs.filter((j) => {
    if (j.status !== "completed" && j.status !== "delivered") return false;
    return new Date(j.updatedAt).toDateString() === new Date().toDateString();
  });

  const kpis = [
    { label: "Confirmed", value: confirmedJobs.length, icon: HiOutlineClipboardList, color: "text-primary-500", bg: "bg-primary-100" },
    { label: "In Production", value: inProductionJobs.length, icon: HiOutlineClock, color: "text-yellow-600", bg: "bg-yellow-100" },
    { label: "Completed Today", value: completedToday.length, icon: HiOutlineCheckCircle, color: "text-green-600", bg: "bg-green-100" },
    { label: "Urgent", value: urgentJobs.length, icon: HiOutlineExclamationCircle, color: "text-red-500", bg: "bg-red-100" },
  ];

  if (!myDeptId) {
    return (
      <div className="space-y-6">
        <Card className="!p-8 text-center">
          <p className="text-custom-700 text-sm">Your account is not assigned to a department.</p>
        </Card>
      </div>
    );
  }

  return (
    <div className="space-y-8 font-[family-name:var(--font-family-primary)]">
      {/* Header */}
      <div className="flex flex-col xs:flex-row xs:items-center justify-between gap-3">
        <div>
          <h1 className="text-2xl md:text-3xl font-bold text-secondary-100">Production Dashboard</h1>
          <p className="text-sm text-custom-700 mt-1">
            Department: <span className="font-semibold text-primary-600">{myDept?.name ?? myDeptId}</span>
          </p>
        </div>
        <button
          onClick={() => refetch()}
          className="self-start p-2 rounded-xl border border-custom-300 hover:bg-custom-100 transition-colors"
          title="Refresh"
        >
          <HiOutlineRefresh className={`w-5 h-5 text-custom-700 ${isFetching ? "animate-spin" : ""}`} />
        </button>
      </div>

      {/* KPIs */}
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
        ) : jobs.length === 0 ? (
          <p className="text-sm text-custom-700 py-4 text-center">No jobs assigned to your department</p>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead>
                <tr className="border-b border-custom-300">
                  {["Job", "Client", "Status", "Priority", "Due Date"].map((h) => (
                    <th key={h} className="text-left py-2 px-3 text-xs font-semibold text-custom-700 uppercase tracking-wide whitespace-nowrap">
                      {h}
                    </th>
                  ))}
                </tr>
              </thead>
              <tbody>
                {jobs.map((job) => {
                  const statusCfg = jobStatusConfig[job.status] ?? {
                    label: job.status,
                    bgColor: "bg-gray-100",
                    color: "text-gray-700",
                  };
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
          <div className="flex items-center gap-2 mb-4">
            <HiOutlineCheckCircle className="w-5 h-5 text-green-600" />
            <h2 className="font-bold text-secondary-100">Completed Today</h2>
          </div>
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
            {completedToday.map((job) => (
              <div key={job.id} className="p-4 rounded-xl bg-green-50 border border-green-200">
                <span className="font-bold text-primary-500">{job.jobNumber}</span>
                <p className="text-sm font-semibold text-secondary-100 mt-1">{job.customer?.name ?? "—"}</p>
                <p className="text-xs text-custom-700">{job.title}</p>
              </div>
            ))}
          </div>
        </Card>
      )}
    </div>
  );
}
