import { useMemo, useState } from "react";
import { HiOutlineChartPie, HiOutlineChevronDown, HiOutlineChevronUp } from "react-icons/hi";
import { Card } from "./ui";
import { useGetDepartmentsQuery } from "../store/services/departmentsService";
import { useGetJobsQuery } from "../store/services/jobsService";

const COLORS = ["bg-blue-500", "bg-green-500", "bg-purple-500", "bg-yellow-500", "bg-red-500", "bg-pink-500", "bg-indigo-500", "bg-teal-500"];

export default function DepartmentBreakdown() {
  const [showAll, setShowAll] = useState(false);
  const { data: departments = [] } = useGetDepartmentsQuery();
  const { data: jobsData } = useGetJobsQuery({ limit: 500 });
  const jobs = jobsData?.jobs ?? [];

  const deptStats = useMemo(() => {
    return departments.map((dept, i) => {
      const deptJobs = jobs.filter((j) => j.department?.id === dept.id || j.departmentAssignedToId === dept.id);
      const completed = deptJobs.filter((j) => j.status === "completed" || j.status === "delivered");
      const revenue = completed.reduce((s, j) => s + (parseFloat(String(j.amount ?? 0)) || 0), 0);
      const total = deptJobs.length;
      const efficiency = total > 0 ? Math.round((completed.length / total) * 100) : 0;
      return { name: dept.name, completedJobs: completed.length, revenue, efficiency, color: COLORS[i % COLORS.length] };
    }).filter((d) => d.completedJobs > 0 || departments.length <= 5);
  }, [departments, jobs]);

  const totalRevenue = deptStats.reduce((s, d) => s + d.revenue, 0);
  const totalJobs = deptStats.reduce((s, d) => s + d.completedJobs, 0);
  const displayed = showAll ? deptStats : deptStats.slice(0, 3);

  return (
    <Card className="h-fit">
      <div className="flex items-center gap-2 mb-4">
        <HiOutlineChartPie className="w-5 h-5 text-primary-500" />
        <h2 className="font-bold text-secondary-100">Department Performance</h2>
      </div>
      <div className="grid grid-cols-2 gap-3 mb-4 p-3 rounded-xl bg-custom-50 border border-custom-200">
        <div>
          <p className="text-xs text-custom-700">Total Jobs</p>
          <p className="text-xl font-bold text-secondary-100">{totalJobs}</p>
        </div>
        <div>
          <p className="text-xs text-custom-700">Total Revenue</p>
          <p className="text-xl font-bold text-primary-600">{totalRevenue.toLocaleString()} RWF</p>
        </div>
      </div>
      <div className="space-y-2">
        {displayed.length === 0 && <p className="text-sm text-custom-700 text-center py-4">No data yet</p>}
        {displayed.map((dept) => {
          const pct = totalRevenue > 0 ? (dept.revenue / totalRevenue) * 100 : 0;
          return (
            <div key={dept.name} className="space-y-1">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <div className={`w-3 h-3 rounded-full ${dept.color}`} />
                  <span className="text-sm font-semibold text-secondary-100">{dept.name}</span>
                </div>
                <span className="text-xs font-bold text-custom-700">{pct.toFixed(1)}%</span>
              </div>
              <div className="w-full bg-custom-200 rounded-full h-2">
                <div className={`h-2 rounded-full ${dept.color}`} style={{ width: `${pct}%` }} />
              </div>
              <div className="grid grid-cols-3 gap-2 text-xs">
                <div><span className="text-custom-700">Jobs:</span><span className="ml-1 font-bold text-secondary-100">{dept.completedJobs}</span></div>
                <div><span className="text-custom-700">Revenue:</span><span className="ml-1 font-bold text-primary-600">{dept.revenue.toLocaleString()} RWF</span></div>
                <div>
                  <span className="text-custom-700">Efficiency:</span>
                  <span className={`ml-1 font-bold ${dept.efficiency >= 90 ? "text-green-600" : dept.efficiency >= 80 ? "text-yellow-600" : "text-red-600"}`}>
                    {dept.efficiency}%
                  </span>
                </div>
              </div>
            </div>
          );
        })}
      </div>
      {deptStats.length > 3 && (
        <button
          onClick={() => setShowAll(!showAll)}
          className="w-full mt-3 px-4 py-2 rounded-xl border border-custom-300 hover:bg-custom-100 transition-colors text-sm font-semibold text-custom-700 flex items-center justify-center gap-2"
        >
          {showAll ? <><span>Show Less</span><HiOutlineChevronUp className="w-4 h-4" /></> : <><span>Show More ({deptStats.length - 3} more)</span><HiOutlineChevronDown className="w-4 h-4" /></>}
        </button>
      )}
    </Card>
  );
}
