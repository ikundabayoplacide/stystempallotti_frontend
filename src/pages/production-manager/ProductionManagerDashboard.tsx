import { useMemo } from "react";
import {
  HiOutlineCheckCircle,
  HiOutlineClipboardList,
  HiOutlineClock,
  HiOutlineExclamationCircle,
  HiOutlineRefresh,
  HiOutlineViewGrid,
  HiOutlineUsers,
} from "react-icons/hi";
import { useNavigate } from "react-router-dom";
import { Card } from "../../components/ui";
import { useGetJobsQuery } from "../../store/services/jobsService";
import { useGetDepartmentsQuery } from "../../store/services/departmentsService";
import { useGetAllEmployeesQuery } from "../../store/services/employeesService";

export default function ProductionManagerDashboard() {
  const navigate = useNavigate();

  // ── Data ──────────────────────────────────────────────────────────────────
  const { data: confirmedData, isLoading: loadingConfirmed, refetch: r1 } =
    useGetJobsQuery({ status: "confirmed", limit: 500 });

  const { data: inProgressStatuses, isLoading: loadingInProgress, refetch: r2 } =
    useGetJobsQuery({ limit: 500 });

  const { data: completedData, isLoading: loadingCompleted, refetch: r3 } =
    useGetJobsQuery({ status: "completed", limit: 500 });

  const { data: departments = [], isLoading: loadingDepts, refetch: r4 } =
    useGetDepartmentsQuery();

  const { data: empData, isLoading: loadingEmp } =
    useGetAllEmployeesQuery({ limit: 500 });

  const refetch = () => { r1(); r2(); r3(); r4(); };

  // ── Derived ───────────────────────────────────────────────────────────────
  const allJobs = inProgressStatuses?.jobs ?? [];
  const confirmedJobs = confirmedData?.jobs ?? [];
  const completedJobs = completedData?.jobs ?? [];
  const employees = empData?.data ?? [];

  const productionStatuses = [
    "in-composition", "in-montage", "in-printing",
    "in-binding", "in-packaging", "quality-check",
  ];

  const jobsInProduction = useMemo(
    () => allJobs.filter((j) => productionStatuses.includes(j.status)),
    [allJobs]
  );

  // Today's completed
  const _now = new Date();
  const completedToday = useMemo(
    () => completedJobs.filter((j) => {
      const d = j.completedAt ?? j.updatedAt;
      return !!d && new Date(d).toLocaleDateString() === _now.toLocaleDateString();
    }),
    [completedJobs]
  );

  // Delayed = past due date, still in production
  const delayed = useMemo(
    () => jobsInProduction.filter(
      (j) => j.dueDate && new Date(j.dueDate) < new Date()
    ),
    [jobsInProduction]
  );

  // Jobs per department (from status field like "in-printing" → "Printing")
  const statusToDept: Record<string, string> = {
    "in-composition":  "Composition",
    "in-montage":      "Montage",
    "in-printing":     "Printing",
    "in-binding":      "Binding",
    "in-packaging":    "Packaging",
    "quality-check":   "Quality Check",
  };

  const jobsByDept = useMemo(() => {
    const map: Record<string, number> = {};
    jobsInProduction.forEach((j) => {
      const dept = statusToDept[j.status] ?? "Other";
      map[dept] = (map[dept] ?? 0) + 1;
    });
    return map;
  }, [jobsInProduction]);

  const activeEmployees = employees.filter((e) => e.isActive).length;

  const isLoading = loadingConfirmed || loadingInProgress || loadingCompleted || loadingDepts;

  // ── KPI cards ─────────────────────────────────────────────────────────────
  const kpis = [
    {
      label:    "Jobs in Production",
      value:    jobsInProduction.length,
      icon:     HiOutlineClipboardList,
      color:    "text-primary-500",
      bg:       "bg-primary-100",
      ring:     "hover:ring-primary-400",
      path:     "/production-manager/planning",
      loading:  loadingInProgress,
    },
    {
      label:    "Pending Assignment",
      value:    confirmedJobs.length,
      icon:     HiOutlineClock,
      color:    "text-yellow-600",
      bg:       "bg-yellow-100",
      ring:     "hover:ring-yellow-400",
      path:     "/production-manager/planning",
      loading:  loadingConfirmed,
    },
    {
      label:    "Completed Today",
      value:    completedToday.length,
      icon:     HiOutlineCheckCircle,
      color:    "text-green-600",
      bg:       "bg-green-100",
      ring:     "hover:ring-green-400",
      path:     "/production-manager/planning",
      loading:  loadingCompleted,
    },
    {
      label:    "Delayed Jobs",
      value:    delayed.length,
      icon:     HiOutlineExclamationCircle,
      color:    "text-red-500",
      bg:       "bg-red-100",
      ring:     "hover:ring-red-400",
      path:     "/production-manager/planning",
      loading:  loadingInProgress,
    },
  ];

  return (
    <div className="space-y-8 font-[family-name:var(--font-family-primary)]">

      {/* Header */}
      <div className="flex items-center justify-between flex-wrap gap-3">
        <div>
          <h1 className="text-2xl md:text-3xl font-bold text-secondary-100">
            Production Manager Dashboard
          </h1>
          <p className="text-sm text-custom-700 mt-1">
            {new Date().toLocaleDateString("en-US", { weekday: "long", year: "numeric", month: "long", day: "numeric" })}
          </p>
        </div>
        <button
          onClick={refetch}
          className="flex items-center gap-2 px-3 py-2 rounded-xl border border-custom-300 hover:bg-custom-100 transition-colors text-custom-700 text-sm"
        >
          <HiOutlineRefresh className={`w-4 h-4 ${isLoading ? "animate-spin" : ""}`} />
          <span className="font-semibold">Refresh</span>
        </button>
      </div>

      {/* KPI Cards */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
        {kpis.map(({ label, value, icon: Icon, color, bg, ring, path, loading }) => (
          <Card
            key={label}
            className={`!p-4 flex flex-col gap-3 cursor-pointer hover:ring-2 transition-all ${ring}`}
            onClick={() => navigate(path)}
          >
            <div className={`w-10 h-10 rounded-xl flex items-center justify-center ${bg}`}>
              <Icon className={`w-5 h-5 ${color}`} />
            </div>
            <div>
              <p className="text-xs text-custom-700">{label}</p>
              {loading ? (
                <div className="h-7 w-12 bg-custom-200 rounded animate-pulse mt-1" />
              ) : (
                <p className={`text-2xl font-bold ${color}`}>{value}</p>
              )}
            </div>
          </Card>
        ))}
      </div>

      {/* Departments + Employees row */}
      <div className="grid grid-cols-1 xl:grid-cols-3 gap-6">

        {/* Departments Status */}
        <Card
          className="xl:col-span-2 cursor-pointer hover:ring-2 hover:ring-primary-400 transition-all"
          onClick={() => navigate("/production-manager/departments")}
        >
          <div className="flex items-center justify-between mb-5">
            <div className="flex items-center gap-2">
              <HiOutlineViewGrid className="w-5 h-5 text-primary-500" />
              <h2 className="font-bold text-secondary-100">Production Departments</h2>
            </div>
            <span className="text-xs font-semibold text-primary-500">View all →</span>
          </div>

          {loadingDepts || loadingInProgress ? (
            <div className="grid grid-cols-2 sm:grid-cols-3 gap-3">
              {[1, 2, 3, 4, 5, 6].map((i) => (
                <div key={i} className="h-24 bg-custom-100 rounded-xl animate-pulse" />
              ))}
            </div>
          ) : departments.length === 0 ? (
            <p className="text-sm text-custom-700 py-6 text-center">No departments found.</p>
          ) : (
            <div className="grid grid-cols-2 sm:grid-cols-3 gap-3">
              {departments.map((dept) => {
                const activeCount = jobsByDept[dept.name] ?? 0;
                return (
                  <div
                    key={dept.id}
                    className="p-4 rounded-xl bg-custom-50 border border-custom-200 hover:border-primary-400 transition-colors"
                  >
                    <h3 className="font-bold text-secondary-100 text-sm mb-2 truncate">{dept.name}</h3>
                    <p className="text-custom-700 text-xs">
                      Active jobs:{" "}
                      <span className="font-bold text-primary-500">{activeCount}</span>
                    </p>
                    {dept.description && (
                      <p className="text-xs text-custom-500 mt-1 truncate">{dept.description}</p>
                    )}
                  </div>
                );
              })}
            </div>
          )}
        </Card>

        {/* Employees quick stat */}
        <Card
          className="cursor-pointer hover:ring-2 hover:ring-primary-400 transition-all"
          onClick={() => navigate("/production-manager/planning")}
        >
          <div className="flex items-center justify-between mb-5">
            <div className="flex items-center gap-2">
              <HiOutlineUsers className="w-5 h-5 text-primary-500" />
              <h2 className="font-bold text-secondary-100">Workforce</h2>
            </div>
            <span className="text-xs font-semibold text-primary-500">Job Planning →</span>
          </div>

          {loadingEmp ? (
            <div className="space-y-3">
              {[1, 2, 3].map((i) => <div key={i} className="h-12 bg-custom-100 rounded-xl animate-pulse" />)}
            </div>
          ) : (
            <div className="space-y-3">
              {[
                { label: "Total Employees", value: employees.length,   cls: "text-secondary-100" },
                { label: "Active",          value: activeEmployees,     cls: "text-green-600" },
                { label: "Inactive",        value: employees.length - activeEmployees, cls: "text-red-500" },
              ].map(({ label, value, cls }) => (
                <div key={label} className="flex justify-between items-center px-4 py-3 rounded-xl bg-custom-50 border border-custom-200">
                  <span className="text-sm text-custom-700">{label}</span>
                  <span className={`text-xl font-bold ${cls}`}>{value}</span>
                </div>
              ))}

              {/* Jobs summary */}
              <div className="pt-3 border-t border-custom-200 space-y-2">
                {[
                  { label: "In Production", value: jobsInProduction.length, cls: "text-primary-500" },
                  { label: "Pending",        value: confirmedJobs.length,    cls: "text-yellow-600" },
                  { label: "Delayed",        value: delayed.length,          cls: "text-red-500" },
                ].map(({ label, value, cls }) => (
                  <div key={label} className="flex justify-between items-center">
                    <span className="text-xs text-custom-700">{label}</span>
                    <span className={`text-sm font-bold ${cls}`}>{value}</span>
                  </div>
                ))}
              </div>
            </div>
          )}
        </Card>
      </div>

      {/* Jobs in production breakdown by status */}
      {!loadingInProgress && jobsInProduction.length > 0 && (
        <Card
          className="cursor-pointer hover:ring-2 hover:ring-primary-400 transition-all"
          onClick={() => navigate("/production-manager/planning")}
        >
          <div className="flex items-center justify-between mb-5">
            <div className="flex items-center gap-2">
              <HiOutlineClipboardList className="w-5 h-5 text-primary-500" />
              <h2 className="font-bold text-secondary-100">Jobs by Stage</h2>
            </div>
            <span className="text-xs font-semibold text-primary-500">View all jobs →</span>
          </div>
          <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-3">
            {Object.entries(statusToDept).map(([status, deptLabel]) => {
              const count = jobsInProduction.filter((j) => j.status === status).length;
              if (count === 0) return null;
              return (
                <div key={status} className="p-3 rounded-xl bg-primary-50 border border-primary-200 text-center">
                  <p className="text-xs text-primary-700 font-semibold">{deptLabel}</p>
                  <p className="text-2xl font-bold text-primary-500 mt-1">{count}</p>
                </div>
              );
            })}
          </div>
        </Card>
      )}

    </div>
  );
}
