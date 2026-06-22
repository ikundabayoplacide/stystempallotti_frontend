import { useMemo } from "react";
import { HiOutlineExclamation, HiOutlineTrendingDown } from "react-icons/hi";
import { Card } from "./ui";
import { useGetJobsQuery } from "../store/services/jobsService";
import { useGetDepartmentsQuery } from "../store/services/departmentsService";

const IN_PROGRESS = ["confirmed", "in-composition", "in-montage", "in-printing", "in-binding", "in-packaging", "quality-check", "ready-for-delivery"];

export default function BottleneckDetection() {
  const { data: jobsData } = useGetJobsQuery({ limit: 500 });
  const { data: departments = [] } = useGetDepartmentsQuery();
  const jobs = jobsData?.jobs ?? [];

  const bottlenecks = useMemo(() => {
    const totalActive = jobs.filter((j) => IN_PROGRESS.includes(j.status)).length || 1;
    return departments
      .map((dept) => {
        const deptJobs = jobs.filter(
          (j) => (j.department?.id === dept.id || j.departmentAssignedToId === dept.id) && IN_PROGRESS.includes(j.status)
        );
        const utilization = Math.round((deptJobs.length / totalActive) * 100);
        const severity: "high" | "medium" | "low" = utilization >= 30 ? "high" : utilization >= 15 ? "medium" : "low";
        return { department: dept.name, queuedJobs: deptJobs.length, utilization, severity };
      })
      .filter((b) => b.queuedJobs > 0)
      .sort((a, b) => b.queuedJobs - a.queuedJobs);
  }, [departments, jobs]);

  const criticalCount = bottlenecks.filter((b) => b.severity === "high").length;

  return (
    <Card>
      <div className="flex items-center gap-2 mb-4">
        <HiOutlineTrendingDown className="w-5 h-5 text-orange-500" />
        <h2 className="font-bold text-secondary-100">Bottleneck Detection</h2>
        <span className="ml-auto text-xs font-bold px-2 py-1 rounded-full bg-orange-100 text-orange-700">
          {criticalCount} Critical
        </span>
      </div>
      <div className="space-y-3">
        {bottlenecks.length === 0 && <p className="text-sm text-custom-700 text-center py-4">No active bottlenecks</p>}
        {bottlenecks.map((b) => (
          <div
            key={b.department}
            className={`p-3 rounded-xl border-2 transition-all ${b.severity === "high" ? "border-red-300 bg-red-50" : "border-orange-300 bg-orange-50"}`}
          >
            <div className="flex items-start justify-between gap-2 mb-2">
              <div className="flex items-center gap-2">
                <HiOutlineExclamation className={`w-4 h-4 flex-shrink-0 ${b.severity === "high" ? "text-red-600" : "text-orange-600"}`} />
                <h3 className="text-sm font-bold text-secondary-100">{b.department}</h3>
              </div>
              <span className={`text-xs font-bold px-2 py-1 rounded-full ${b.severity === "high" ? "bg-red-100 text-red-700" : "bg-orange-100 text-orange-700"}`}>
                {b.utilization}% Load
              </span>
            </div>
            <div className="mb-2 text-xs">
              <span className="text-custom-700">Queued Jobs:</span>
              <span className="ml-1 font-bold text-secondary-100">{b.queuedJobs}</span>
            </div>
            <div className="w-full bg-custom-200 rounded-full h-2">
              <div
                className={`h-2 rounded-full ${b.severity === "high" ? "bg-red-500" : "bg-orange-500"}`}
                style={{ width: `${Math.min(100, b.utilization)}%` }}
              />
            </div>
          </div>
        ))}
      </div>
    </Card>
  );
}
