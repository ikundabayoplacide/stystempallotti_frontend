import {
  HiOutlineCheckCircle,
  HiOutlineClipboardList,
  HiOutlineClock,
  HiOutlineExclamationCircle,
  HiOutlineRefresh,
  HiOutlineChevronDown,
  HiOutlineChevronUp,
} from "react-icons/hi";
import { useState } from "react";
import { Card } from "../../components/ui";
import {
  useGetMyEmployeeProfileQuery,
  useGetEmployeeJobsQuery,
} from "../../store/services/employeesService";
import { jobStatusConfig } from "../../types/JobStatus";

const priorityColor: Record<string, string> = {
  urgent: "bg-red-500 text-white",
  high:   "bg-orange-100 text-orange-700",
  normal: "bg-blue-100 text-blue-700",
  low:    "bg-green-100 text-green-700",
};

const STATE_LABELS: Record<string, string> = {
  "in-composition":    "In Composition",
  "in-montage":        "In Montage",
  "in-printing":       "In Printing",
  "in-binding":        "In Binding",
  "in-packaging":      "In Packaging",
  "quality-check":     "Quality Check",
  "composition-done":  "Composition Done",
  "montage-done":      "Montage Done",
  "printing-done":     "Printing Done",
  "binding-done":      "Binding Done",
  "packaging-done":    "Packaging Done",
  "qualitycheck-done": "Quality Check Done",
};

export default function WorkerDashboard() {
  const [showAllJobs, setShowAllJobs] = useState(false);
  // Step 1 — get own employee profile
  const {
    data: me,
    isLoading: loadingMe,
    isError: errorMe,
    refetch: refetchMe,
  } = useGetMyEmployeeProfileQuery();

  const employeeId = me?.id;

  // Step 2 — get all assigned jobs
  const {
    data: allJobs = [],
    isLoading: loadingJobs,
    refetch: refetchJobs,
  } = useGetEmployeeJobsQuery(
    { employeeId: employeeId! },
    { skip: !employeeId, refetchOnMountOrArgChange: true }
  );

  // Step 3 — get completed today
  const {
    data: completedToday = [],
    isLoading: loadingCompleted,
  } = useGetEmployeeJobsQuery(
    { employeeId: employeeId!, status: "done", date: "today" },
    { skip: !employeeId, refetchOnMountOrArgChange: true }
  );

  const isLoading = loadingMe || loadingJobs || loadingCompleted;

  const activeJobs  = allJobs.filter((j) => j.status !== "cancelled");
  const urgentJobs  = activeJobs.filter((j) => j.priority === "urgent");

  const refetchAll = () => { refetchMe(); refetchJobs(); };

  // ── No employee profile linked ──
  if (!loadingMe && (errorMe || !me)) {
    return (
      <div className="space-y-6 font-[family-name:var(--font-family-primary)]">
        <Card className="!p-8 text-center">
          <HiOutlineExclamationCircle className="w-12 h-12 text-red-400 mx-auto mb-3" />
          <p className="text-secondary-100 font-bold text-sm">Employee profile not linked</p>
          <p className="text-custom-700 text-xs mt-1">
            Ask an administrator to link your account to an employee record.
          </p>
        </Card>
      </div>
    );
  }

  return (
    <div className="space-y-6 font-[family-name:var(--font-family-primary)]">

      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
        <div>
          <h1 className="text-2xl md:text-3xl font-bold text-secondary-100">My Work Dashboard</h1>
          <p className="text-sm text-custom-700 mt-1">
            {me ? (
              <>Welcome, <span className="font-semibold text-primary-600">{me.fullName}</span></>
            ) : "Loading…"}
          </p>
        </div>
        <button
          onClick={refetchAll}
          disabled={isLoading}
          className="self-start p-2 rounded-xl border border-custom-300 hover:bg-custom-100 transition-colors disabled:opacity-50"
          title="Refresh"
        >
          <HiOutlineRefresh className={`w-5 h-5 text-custom-700 ${isLoading ? "animate-spin" : ""}`} />
        </button>
      </div>

      {/* Urgent alert */}
      {urgentJobs.length > 0 && (
        <Card className="!p-4 !bg-red-50 border-2 border-red-200">
          <div className="flex items-center gap-3">
            <div className="w-9 h-9 rounded-xl bg-red-500 flex items-center justify-center flex-shrink-0">
              <HiOutlineExclamationCircle className="w-5 h-5 text-white" />
            </div>
            <div>
              <p className="text-sm font-bold text-red-900">
                {urgentJobs.length} Urgent Job{urgentJobs.length > 1 ? "s" : ""} Assigned
              </p>
              <p className="text-xs text-red-700">
                {urgentJobs.map((j) => j.jobNumber).join(", ")} — requires immediate attention
              </p>
            </div>
          </div>
        </Card>
      )}

      {/* KPIs */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        {[
          { label: "Assigned Jobs",   value: activeJobs.length,      icon: HiOutlineClipboardList, color: "text-primary-500", bg: "bg-primary-100" },
          { label: "Urgent",          value: urgentJobs.length,       icon: HiOutlineExclamationCircle, color: "text-red-500",   bg: "bg-red-100"     },
          { label: "Completed Today", value: completedToday.length,   icon: HiOutlineCheckCircle,   color: "text-green-600",  bg: "bg-green-100"   },
        ].map(({ label, value, icon: Icon, color, bg }) => (
          <Card key={label} className="!p-5">
            <div className={`w-10 h-10 rounded-xl flex items-center justify-center ${bg} mb-3`}>
              <Icon className={`w-5 h-5 ${color}`} />
            </div>
            <p className="text-2xl font-bold text-secondary-100">{isLoading ? "—" : value}</p>
            <p className="text-sm text-custom-700 mt-1">{label}</p>
          </Card>
        ))}
      </div>

      {/* Assigned Jobs */}
      <Card className="!p-0 overflow-hidden">
        <div className="flex items-center gap-2 px-4 py-3 border-b border-custom-200">
          <HiOutlineClipboardList className="w-5 h-5 text-primary-500" />
          <h2 className="font-bold text-secondary-100">My Assigned Jobs</h2>
          <span className="text-xs text-custom-500">({activeJobs.length})</span>
        </div>

        {isLoading ? (
          <div className="flex items-center justify-center gap-2 py-10 text-custom-700">
            <HiOutlineRefresh className="w-4 h-4 animate-spin" />
            <span className="text-sm">Loading…</span>
          </div>
        ) : activeJobs.length === 0 ? (
          <div className="py-10 text-center">
            <HiOutlineClipboardList className="w-10 h-10 text-custom-300 mx-auto mb-2" />
            <p className="text-sm font-semibold text-secondary-100">No jobs assigned</p>
            <p className="text-xs text-custom-700 mt-1">Your supervisor hasn't assigned any jobs yet</p>
          </div>
        ) : (
          <div className="divide-y divide-custom-200">
            {activeJobs.slice(0, showAllJobs ? activeJobs.length : 2).map((job) => {
              const statusCfg = jobStatusConfig[job.status] ?? { label: job.status, bgColor: "bg-gray-100", color: "text-gray-700" };
              return (
                <div key={job.id} className={`px-4 py-4 hover:bg-custom-50 transition-colors ${job.priority === "urgent" ? "bg-red-50" : ""}`}>
                  <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
                    <div className="flex-1 min-w-0 space-y-1.5">
                      <div className="flex flex-wrap items-center gap-2">
                        <span className="text-sm font-bold text-primary-600">{job.jobNumber}</span>
                        <span className={`text-xs font-bold px-2 py-0.5 rounded-full ${priorityColor[job.priority] ?? "bg-gray-100 text-gray-700"}`}>
                          {job.priority}
                        </span>
                        <span className={`text-xs font-semibold px-2 py-0.5 rounded-full ${statusCfg.bgColor} ${statusCfg.color}`}>
                          {statusCfg.label}
                        </span>
                        {job.state && (
                          <span className="text-xs font-semibold px-2 py-0.5 rounded-full bg-purple-100 text-purple-700">
                            {STATE_LABELS[job.state] ?? job.state}
                          </span>
                        )}
                      </div>
                      <p className="text-sm text-secondary-100 font-medium truncate">{job.title}</p>
                      {job.dueDate && (
                        <p className="text-xs text-custom-700 flex items-center gap-1">
                          <HiOutlineClock className="w-3.5 h-3.5" />
                          Due: {job.dueDate.split("T")[0]}
                        </p>
                      )}
                    </div>
                  </div>
                </div>
              );
            })}
            {activeJobs.length > 2 && (
              <button
                onClick={() => setShowAllJobs((v) => !v)}
                className="w-full flex items-center justify-center gap-2 py-3 text-sm font-semibold text-primary-600 hover:bg-custom-50 transition-colors border-t border-custom-200"
              >
                {showAllJobs ? (
                  <><HiOutlineChevronUp className="w-4 h-4" /> See less</>
                ) : (
                  <><HiOutlineChevronDown className="w-4 h-4" /> See {activeJobs.length - 2} more job{activeJobs.length - 2 > 1 ? "s" : ""}</>
                )}
              </button>
            )}
          </div>
        )}
      </Card>

      {/* Completed Today */}
      {completedToday.length > 0 && (
        <Card>
          <div className="flex items-center gap-2 mb-4">
            <HiOutlineCheckCircle className="w-5 h-5 text-green-600" />
            <h2 className="font-bold text-secondary-100">Completed Today ({completedToday.length})</h2>
          </div>
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
            {completedToday.map((job) => (
              <div key={job.id} className="p-3 rounded-xl bg-green-50 border border-green-200">
                <span className="font-bold text-primary-500 text-sm">{job.jobNumber}</span>
                <p className="text-sm font-semibold text-secondary-100 mt-0.5">{job.title}</p>
              </div>
            ))}
          </div>
        </Card>
      )}
    </div>
  );
}
