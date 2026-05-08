import { useState } from "react";
import {
    HiOutlineChartBar,
    HiOutlineCheckCircle,
    HiOutlineClipboardList,
    HiOutlineClock,
    HiOutlineExclamationCircle,
    HiOutlineTrendingUp,
} from "react-icons/hi";
import { Badge, Card } from "../../components/ui";

const kpis = [
  {
    label: "Jobs in Queue",
    value: "12",
    icon: HiOutlineClipboardList,
    color: "text-primary-500",
    bg: "bg-primary-100",
  },
  {
    label: "In Production",
    value: "18",
    icon: HiOutlineClock,
    color: "text-yellow-600",
    bg: "bg-yellow-100",
  },
  {
    label: "Completed Today",
    value: "7",
    icon: HiOutlineCheckCircle,
    color: "text-green-600",
    bg: "bg-green-100",
  },
  {
    label: "Urgent Jobs",
    value: "3",
    icon: HiOutlineExclamationCircle,
    color: "text-red-500",
    bg: "bg-red-100",
  },
];

const productionQueue = [
  {
    id: "JOB-001",
    client: "ABC Corp",
    service: "Offset Printing",
    qty: 500,
    priority: "High",
    deadline: "2026-05-02",
    currentStage: "Printing",
    nextStage: "Binding",
    assignedTo: "Team A",
    progress: 65,
  },
  {
    id: "JOB-002",
    client: "XYZ Ltd",
    service: "Binding",
    qty: 200,
    priority: "Medium",
    deadline: "2026-05-01",
    currentStage: "Binding",
    nextStage: "Packaging",
    assignedTo: "Team B",
    progress: 80,
  },
  {
    id: "JOB-005",
    client: "NGO B",
    service: "Composition",
    qty: 50,
    priority: "Low",
    deadline: "2026-05-03",
    currentStage: "Composition",
    nextStage: "Montage",
    assignedTo: "Team C",
    progress: 45,
  },
  {
    id: "JOB-007",
    client: "Bank D",
    service: "Digital Printing",
    qty: 300,
    priority: "High",
    deadline: "2026-05-04",
    currentStage: "Montage",
    nextStage: "Digital Printing",
    assignedTo: "Team D",
    progress: 30,
  },
];

const departmentStatus = [
  { dept: "Composition", active: 5, capacity: 8, utilization: 63 },
  { dept: "Montage", active: 3, capacity: 5, utilization: 60 },
  { dept: "Offset Printing", active: 7, capacity: 8, utilization: 88 },
  { dept: "Digital Printing", active: 4, capacity: 6, utilization: 67 },
  { dept: "Binding", active: 3, capacity: 5, utilization: 60 },
  { dept: "Packaging", active: 3, capacity: 4, utilization: 75 },
];

const priorityColor: Record<string, string> = {
  High: "bg-red-100 text-red-700",
  Medium: "bg-yellow-100 text-yellow-700",
  Low: "bg-green-100 text-green-700",
};

const completedJobs = [
  { id: "JOB-003", client: "Gov Office", service: "Digital Printing", completedAt: "09:30 AM" },
  { id: "JOB-004", client: "School A", service: "Packaging", completedAt: "11:15 AM" },
  { id: "JOB-006", client: "Hotel C", service: "Offset Printing", completedAt: "02:45 PM" },
];

export default function ProductionDashboard() {
  const [selectedDept, setSelectedDept] = useState<string | null>(null);

  return (
    <div className="space-y-8 font-[family-name:var(--font-family-primary)]">
      {/* Header */}
      <div className="flex flex-col xs:flex-row xs:items-center justify-between gap-3">
        <div>
          <h1 className="text-2xl md:text-3xl font-bold text-secondary-100">
            Production Manager Dashboard
          </h1>
          <p className="text-sm text-custom-700 mt-1">
            Plan and assign jobs to production units — Thursday, April 30, 2026
          </p>
        </div>
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

      {/* Department Status */}
      <Card>
        <div className="flex items-center gap-2 mb-5">
          <HiOutlineChartBar className="w-5 h-5 text-primary-500" />
          <h2 className="font-bold text-secondary-100">Department Utilization</h2>
        </div>
        <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-4">
          {departmentStatus.map((dept) => (
            <div
              key={dept.dept}
              onClick={() => setSelectedDept(dept.dept)}
              className={`
                p-4 rounded-xl border-2 transition-all cursor-pointer
                ${selectedDept === dept.dept
                  ? "border-primary-500 bg-primary-50"
                  : "border-custom-300 bg-style-500 hover:border-primary-300"
                }
              `}
            >
              <div className="flex items-center justify-between mb-3">
                <h3 className="font-bold text-secondary-100">{dept.dept}</h3>
                {dept.utilization >= 80 && (
                  <Badge variant="danger" className="text-[10px]">High Load</Badge>
                )}
              </div>
              <div className="space-y-2">
                <div className="flex justify-between text-sm">
                  <span className="text-custom-700">Active Jobs</span>
                  <span className="font-semibold text-secondary-100">
                    {dept.active}/{dept.capacity}
                  </span>
                </div>
                <div className="flex justify-between text-sm">
                  <span className="text-custom-700">Utilization</span>
                  <span className={`font-semibold ${dept.utilization >= 80 ? "text-red-600" : dept.utilization >= 60 ? "text-yellow-600" : "text-green-600"}`}>
                    {dept.utilization}%
                  </span>
                </div>
                <div className="w-full bg-custom-200 rounded-full h-2 mt-2">
                  <div
                    className={`h-2 rounded-full ${dept.utilization >= 80 ? "bg-red-500" : dept.utilization >= 60 ? "bg-yellow-500" : "bg-green-500"}`}
                    style={{ width: `${dept.utilization}%` }}
                  />
                </div>
              </div>
            </div>
          ))}
        </div>
      </Card>

      {/* Production Queue */}
      <Card>
        <div className="flex items-center gap-2 mb-5">
          <HiOutlineClipboardList className="w-5 h-5 text-primary-500" />
          <h2 className="font-bold text-secondary-100">Production Queue</h2>
        </div>
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead>
              <tr className="border-b border-custom-300">
                {["Job ID", "Client", "Service", "Qty", "Current Stage", "Next Stage", "Progress", "Priority", "Deadline"].map((h) => (
                  <th key={h} className="text-left py-2 px-3 text-xs font-semibold text-custom-700 uppercase tracking-wide whitespace-nowrap">
                    {h}
                  </th>
                ))}
              </tr>
            </thead>
            <tbody>
              {productionQueue.map((job) => (
                <tr key={job.id} className="border-b border-custom-200 hover:bg-custom-50 transition-colors">
                  <td className="py-3 px-3 font-semibold text-primary-500 whitespace-nowrap">{job.id}</td>
                  <td className="py-3 px-3 text-secondary-100 whitespace-nowrap">{job.client}</td>
                  <td className="py-3 px-3 text-custom-700 whitespace-nowrap">{job.service}</td>
                  <td className="py-3 px-3 text-custom-700">{job.qty}</td>
                  <td className="py-3 px-3 text-custom-700 whitespace-nowrap">{job.currentStage}</td>
                  <td className="py-3 px-3 text-custom-700 whitespace-nowrap">{job.nextStage}</td>
                  <td className="py-3 px-3">
                    <div className="flex items-center gap-2">
                      <div className="w-16 bg-custom-200 rounded-full h-1.5">
                        <div
                          className="h-1.5 rounded-full bg-primary-500"
                          style={{ width: `${job.progress}%` }}
                        />
                      </div>
                      <span className="text-xs text-custom-700 whitespace-nowrap">{job.progress}%</span>
                    </div>
                  </td>
                  <td className="py-3 px-3">
                    <span className={`text-xs font-semibold px-2 py-0.5 rounded-full whitespace-nowrap ${priorityColor[job.priority]}`}>
                      {job.priority}
                    </span>
                  </td>
                  <td className="py-3 px-3 text-custom-700 whitespace-nowrap">{job.deadline}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </Card>

      {/* Completed Jobs Today */}
      <Card>
        <div className="flex items-center gap-2 mb-5">
          <HiOutlineCheckCircle className="w-5 h-5 text-green-600" />
          <h2 className="font-bold text-secondary-100">Completed Today</h2>
        </div>
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
          {completedJobs.map((job) => (
            <div
              key={job.id}
              className="p-4 rounded-xl bg-green-50 border border-green-200"
            >
              <div className="flex items-center gap-3 mb-2">
                <div className="w-8 h-8 rounded-full bg-green-100 flex items-center justify-center">
                  <HiOutlineCheckCircle className="w-5 h-5 text-green-600" />
                </div>
                <span className="font-bold text-primary-500">{job.id}</span>
              </div>
              <p className="text-sm font-semibold text-secondary-100">{job.client}</p>
              <p className="text-xs text-custom-700">{job.service}</p>
              <p className="text-xs text-custom-700 mt-2">Completed at {job.completedAt}</p>
            </div>
          ))}
        </div>
      </Card>

      {/* Production Flow */}
      <Card>
        <div className="flex items-center gap-2 mb-5">
          <HiOutlineTrendingUp className="w-5 h-5 text-primary-500" />
          <h2 className="font-bold text-secondary-100">Production Workflow</h2>
        </div>
        <div className="flex flex-wrap gap-2 items-center">
          {[
            "Composition",
            "Montage",
            "Printing (Offset/Digital)",
            "Binding",
            "Packaging",
            "Delivery",
          ].map((stage, i, arr) => (
            <div key={stage} className="flex items-center gap-2">
              <span className="text-xs font-semibold px-3 py-1.5 rounded-full bg-primary-100 text-primary-700">
                {stage}
              </span>
              {i < arr.length - 1 && (
                <span className="text-custom-400 text-xs">→</span>
              )}
            </div>
          ))}
        </div>
      </Card>
    </div>
  );
}
