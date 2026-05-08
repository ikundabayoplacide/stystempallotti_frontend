import { useState } from "react";
import { HiOutlineChartPie, HiOutlineChevronDown, HiOutlineChevronUp } from "react-icons/hi";
import { Card } from "./ui";

interface DepartmentStats {
  name: string;
  completedJobs: number;
  revenue: number;
  efficiency: number;
  color: string;
}

const departments: DepartmentStats[] = [
  { name: "Printing", completedJobs: 45, revenue: 12500000, efficiency: 92, color: "bg-blue-500" },
  { name: "Binding", completedJobs: 32, revenue: 4800000, efficiency: 88, color: "bg-green-500" },
  { name: "Composition", completedJobs: 28, revenue: 8200000, efficiency: 85, color: "bg-purple-500" },

];

export default function DepartmentBreakdown() {
  const [showAll, setShowAll] = useState(false);
  const totalRevenue = departments.reduce((sum, dept) => sum + dept.revenue, 0);
  const totalJobs = departments.reduce((sum, dept) => sum + dept.completedJobs, 0);

  const displayedDepartments = showAll ? departments : departments.slice(0, 3);
  const hasMore = departments.length > 3;

  return (
    <Card className="h-fit">
      <div className="flex items-center gap-2 mb-4">
        <HiOutlineChartPie className="w-5 h-5 text-primary-500" />
        <h2 className="font-bold text-secondary-100">Department Performance</h2>
      </div>

      {/* Summary */}
      <div className="grid grid-cols-2 gap-3 mb-4 p-3 rounded-xl bg-custom-50 border border-custom-200">
        <div>
          <p className="text-xs text-custom-700">Total Jobs</p>
          <p className="text-xl font-bold text-secondary-100">{totalJobs}</p>
        </div>
        <div>
          <p className="text-xs text-custom-700">Total Revenue</p>
          <p className="text-xl font-bold text-primary-600">
            {(totalRevenue / 1000000).toFixed(1)}M RWF
          </p>
        </div>
      </div>

      {/* Department List */}
      <div className="space-y-2">
        {displayedDepartments.map((dept) => {
          const revenuePercentage = (dept.revenue / totalRevenue) * 100;
          return (
            <div key={dept.name} className="space-y-1">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <div className={`w-3 h-3 rounded-full ${dept.color}`} />
                  <span className="text-sm font-semibold text-secondary-100">{dept.name}</span>
                </div>
                <span className="text-xs font-bold text-custom-700">
                  {revenuePercentage.toFixed(1)}%
                </span>
              </div>
              <div className="w-full bg-custom-200 rounded-full h-2">
                <div
                  className={`h-2 rounded-full ${dept.color}`}
                  style={{ width: `${revenuePercentage}%` }}
                />
              </div>
              <div className="grid grid-cols-3 gap-2 text-xs">
                <div>
                  <span className="text-custom-700">Jobs:</span>
                  <span className="ml-1 font-bold text-secondary-100">{dept.completedJobs}</span>
                </div>
                <div>
                  <span className="text-custom-700">Revenue:</span>
                  <span className="ml-1 font-bold text-primary-600">
                    {(dept.revenue / 1000000).toFixed(1)}M
                  </span>
                </div>
                <div>
                  <span className="text-custom-700">Efficiency:</span>
                  <span
                    className={`ml-1 font-bold ${
                      dept.efficiency >= 90
                        ? "text-green-600"
                        : dept.efficiency >= 80
                        ? "text-yellow-600"
                        : "text-red-600"
                    }`}
                  >
                    {dept.efficiency}%
                  </span>
                </div>
              </div>
            </div>
          );
        })}
      </div>

      {/* Show More/Less Button */}
      {hasMore && (
        <button
          onClick={() => setShowAll(!showAll)}
          className="w-full mt-3 px-4 py-2 rounded-xl border border-custom-300 hover:bg-custom-100 transition-colors text-sm font-semibold text-custom-700 flex items-center justify-center gap-2"
        >
          {showAll ? (
            <>
              Show Less
              <HiOutlineChevronUp className="w-4 h-4" />
            </>
          ) : (
            <>
              Show More ({departments.length - 4} more)
              <HiOutlineChevronDown className="w-4 h-4" />
            </>
          )}
        </button>
      )}
    </Card>
  );
}
