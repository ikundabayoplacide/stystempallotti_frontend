import {
    HiOutlineCheckCircle,
    HiOutlineClipboardList,
    HiOutlineClock,
    HiOutlineExclamationCircle,
} from "react-icons/hi";
import { Card } from "../../components/ui";

const kpis = [
  {
    label: "Jobs in Production",
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
    label: "Pending Assignment",
    value: "5",
    icon: HiOutlineClock,
    color: "text-yellow-600",
    bg: "bg-yellow-100",
  },
  {
    label: "Delayed Jobs",
    value: "2",
    icon: HiOutlineExclamationCircle,
    color: "text-red-500",
    bg: "bg-red-100",
  },
];

const departments = [
  { name: "Composition", active: 4, completed: 12, capacity: "75%" },
  { name: "Montage", active: 3, completed: 8, capacity: "60%" },
  { name: "Printing", active: 6, completed: 15, capacity: "85%" },
  { name: "Binding", active: 3, completed: 10, capacity: "50%" },
  { name: "Packaging", active: 2, completed: 7, capacity: "40%" },
];

export default function ProductionManagerDashboard() {
  return (
    <div className="space-y-8 font-[family-name:var(--font-family-primary)]">
      <div>
        <h1 className="text-2xl md:text-3xl font-bold text-secondary-100">
          Production Manager Dashboard
        </h1>
        <p className="text-sm text-custom-700 mt-1">
          Plan and assign jobs to production units — Monday, May 4, 2026
        </p>
      </div>

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

      <Card>
        <h2 className="font-bold text-secondary-100 mb-5">Production Departments Status</h2>
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-5 gap-4">
          {departments.map((dept) => (
            <div key={dept.name} className="p-4 rounded-xl bg-custom-50 border border-custom-200">
              <h3 className="font-bold text-secondary-100 mb-3">{dept.name}</h3>
              <div className="space-y-2 text-sm">
                <p className="text-custom-700">Active: <span className="font-bold text-primary-500">{dept.active}</span></p>
                <p className="text-custom-700">Completed: <span className="font-bold text-green-600">{dept.completed}</span></p>
                <p className="text-custom-700">Capacity: <span className="font-bold text-secondary-100">{dept.capacity}</span></p>
              </div>
            </div>
          ))}
        </div>
      </Card>
    </div>
  );
}
