import { useState } from "react";
import {
    HiOutlineChartBar,
    HiOutlineCheckCircle,
    HiOutlineClipboardList,
    HiOutlineClock,
    HiOutlineExclamationCircle,
    HiOutlineTrendingUp,
    HiOutlineUsers,
} from "react-icons/hi";
import { Badge, Button, Card } from "../../components/ui";

const kpis = [
  {
    label: "Active Jobs",
    value: "18",
    icon: HiOutlineClipboardList,
    color: "text-primary-500",
    bg: "bg-primary-100",
  },
  {
    label: "Completed Today",
    value: "7",
    icon: HiOutlineCheckCircle,
    color: "text-green-600",
    bg: "bg-green-100",
  },
  {
    label: "At Risk",
    value: "2",
    icon: HiOutlineExclamationCircle,
    color: "text-red-500",
    bg: "bg-red-100",
  },
  {
    label: "On Schedule",
    value: "16",
    icon: HiOutlineClock,
    color: "text-primary-600",
    bg: "bg-primary-100",
  },
];

const productionUnits = [
  { name: "Composition", active: 5, capacity: 8, efficiency: 85, status: "normal" },
  { name: "Montage", active: 3, capacity: 5, efficiency: 92, status: "normal" },
  { name: "Offset Printing", active: 7, capacity: 8, efficiency: 78, status: "busy" },
  { name: "Digital Printing", active: 4, capacity: 6, efficiency: 88, status: "normal" },
  { name: "Binding", active: 3, capacity: 5, efficiency: 95, status: "normal" },
  { name: "Packaging", active: 3, capacity: 4, efficiency: 90, status: "normal" },
];

const activeJobs = [
  {
    id: "JOB-001",
    client: "ABC Corp",
    service: "Offset Printing",
    currentStage: "Printing",
    progress: 65,
    deadline: "2026-05-02",
    priority: "High",
    assignedTo: "Team A",
  },
  {
    id: "JOB-002",
    client: "XYZ Ltd",
    service: "Binding",
    currentStage: "Binding",
    progress: 80,
    deadline: "2026-05-01",
    priority: "Medium",
    assignedTo: "Team B",
  },
  {
    id: "JOB-005",
    client: "NGO B",
    service: "Composition",
    currentStage: "Composition",
    progress: 45,
    deadline: "2026-05-03",
    priority: "Low",
    assignedTo: "Team C",
  },
  {
    id: "JOB-007",
    client: "Bank D",
    service: "Digital Printing",
    currentStage: "Montage",
    progress: 30,
    deadline: "2026-05-04",
    priority: "High",
    assignedTo: "Team D",
  },
];

const staffPerformance = [
  { name: "John Doe", role: "Printer", jobsCompleted: 12, efficiency: 94 },
  { name: "Jane Smith", role: "Binder", jobsCompleted: 15, efficiency: 98 },
  { name: "Mike Johnson", role: "Designer", jobsCompleted: 8, efficiency: 87 },
  { name: "Sarah Williams", role: "Montage", jobsCompleted: 10, efficiency: 91 },
];

const priorityColor: Record<string, string> = {
  High: "bg-red-100 text-red-700",
  Medium: "bg-yellow-100 text-yellow-700",
  Low: "bg-green-100 text-green-700",
};

export default function SupervisorDashboard() {
  const [selectedUnit, setSelectedUnit] = useState<string | null>(null);

  return (
    <div className="space-y-8 font-[family-name:var(--font-family-primary)]">
      {/* Header */}
      <div className="flex flex-col xs:flex-row xs:items-center justify-between gap-3">
        <div>
          <h1 className="text-2xl md:text-3xl font-bold text-secondary-100">
            Production Supervisor Dashboard
          </h1>
          <p className="text-sm text-custom-700 mt-1">
            Monitor production units and manage workflow — Thursday, April 30, 2026
          </p>
        </div>
        <Button size="sm" className="flex items-center gap-2 self-start xs:self-auto">
          <HiOutlineTrendingUp className="w-4 h-4" />
          View Reports
        </Button>
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

      {/* Production Units Overview */}
      <Card>
        <div className="flex items-center gap-2 mb-5">
          <HiOutlineChartBar className="w-5 h-5 text-primary-500" />
          <h2 className="font-bold text-secondary-100">Production Units Status</h2>
        </div>
        <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-4">
          {productionUnits.map((unit) => (
            <div
              key={unit.name}
              onClick={() => setSelectedUnit(unit.name)}
              className={`
                p-4 rounded-xl border-2 transition-all cursor-pointer
                ${selectedUnit === unit.name
                  ? "border-primary-500 bg-primary-50"
                  : "border-custom-300 bg-style-500 hover:border-primary-300"
                }
              `}
            >
              <div className="flex items-center justify-between mb-3">
                <h3 className="font-bold text-secondary-100">{unit.name}</h3>
                {unit.status === "busy" && (
                  <Badge variant="danger" className="text-[10px]">Busy</Badge>
                )}
              </div>
              <div className="space-y-2">
                <div className="flex justify-between text-sm">
                  <span className="text-custom-700">Active Workers</span>
                  <span className="font-semibold text-secondary-100">
                    {unit.active}/{unit.capacity}
                  </span>
                </div>
                <div className="flex justify-between text-sm">
                  <span className="text-custom-700">Efficiency</span>
                  <span className={`font-semibold ${unit.efficiency >= 90 ? "text-green-600" : unit.efficiency >= 80 ? "text-yellow-600" : "text-red-600"}`}>
                    {unit.efficiency}%
                  </span>
                </div>
                <div className="w-full bg-custom-200 rounded-full h-2 mt-2">
                  <div
                    className={`h-2 rounded-full ${unit.efficiency >= 90 ? "bg-green-500" : unit.efficiency >= 80 ? "bg-yellow-500" : "bg-red-500"}`}
                    style={{ width: `${unit.efficiency}%` }}
                  />
                </div>
              </div>
            </div>
          ))}
        </div>
      </Card>

      {/* Active Jobs */}
      <Card>
        <div className="flex items-center gap-2 mb-5">
          <HiOutlineClipboardList className="w-5 h-5 text-primary-500" />
          <h2 className="font-bold text-secondary-100">Active Jobs in Production</h2>
        </div>
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead>
              <tr className="border-b border-custom-300">
                {["Job ID", "Client", "Service", "Stage", "Progress", "Deadline", "Priority", "Team"].map((h) => (
                  <th key={h} className="text-left py-2 px-3 text-xs font-semibold text-custom-700 uppercase tracking-wide whitespace-nowrap">
                    {h}
                  </th>
                ))}
              </tr>
            </thead>
            <tbody>
              {activeJobs.map((job) => (
                <tr key={job.id} className="border-b border-custom-200 hover:bg-custom-50 transition-colors">
                  <td className="py-3 px-3 font-semibold text-primary-500 whitespace-nowrap">{job.id}</td>
                  <td className="py-3 px-3 text-secondary-100 whitespace-nowrap">{job.client}</td>
                  <td className="py-3 px-3 text-custom-700 whitespace-nowrap">{job.service}</td>
                  <td className="py-3 px-3 text-custom-700 whitespace-nowrap">{job.currentStage}</td>
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
                  <td className="py-3 px-3 text-custom-700 whitespace-nowrap">{job.deadline}</td>
                  <td className="py-3 px-3">
                    <span className={`text-xs font-semibold px-2 py-0.5 rounded-full whitespace-nowrap ${priorityColor[job.priority]}`}>
                      {job.priority}
                    </span>
                  </td>
                  <td className="py-3 px-3 text-custom-700 whitespace-nowrap">{job.assignedTo}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </Card>

      {/* Staff Performance */}
      <Card>
        <div className="flex items-center gap-2 mb-5">
          <HiOutlineUsers className="w-5 h-5 text-primary-500" />
          <h2 className="font-bold text-secondary-100">Top Performers This Week</h2>
        </div>
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
          {staffPerformance.map((staff) => (
            <div key={staff.name} className="p-4 rounded-xl bg-custom-50 border border-custom-200">
              <h3 className="font-bold text-secondary-100 mb-1">{staff.name}</h3>
              <p className="text-xs text-custom-700 mb-3">{staff.role}</p>
              <div className="space-y-2">
                <div className="flex justify-between text-sm">
                  <span className="text-custom-700">Jobs Done</span>
                  <span className="font-semibold text-primary-500">{staff.jobsCompleted}</span>
                </div>
                <div className="flex justify-between text-sm">
                  <span className="text-custom-700">Efficiency</span>
                  <span className={`font-semibold ${staff.efficiency >= 95 ? "text-green-600" : staff.efficiency >= 85 ? "text-yellow-600" : "text-red-600"}`}>
                    {staff.efficiency}%
                  </span>
                </div>
              </div>
            </div>
          ))}
        </div>
      </Card>
    </div>
  );
}
