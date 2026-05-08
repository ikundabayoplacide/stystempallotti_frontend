import {
    HiOutlineArchive,
    HiOutlineCheckCircle,
    HiOutlineClipboardList,
    HiOutlineExclamationCircle,
} from "react-icons/hi";
import { Card } from "../../components/ui";

const kpis = [
  {
    label: "Total Items",
    value: "156",
    icon: HiOutlineArchive,
    color: "text-primary-500",
    bg: "bg-primary-100",
  },
  {
    label: "Material Requests",
    value: "8",
    icon: HiOutlineClipboardList,
    color: "text-yellow-600",
    bg: "bg-yellow-100",
  },
  {
    label: "Low Stock Alerts",
    value: "12",
    icon: HiOutlineExclamationCircle,
    color: "text-red-500",
    bg: "bg-red-100",
  },
  {
    label: "Supplied Today",
    value: "15",
    icon: HiOutlineCheckCircle,
    color: "text-green-600",
    bg: "bg-green-100",
  },
];

export default function StockDashboard() {
  return (
    <div className="space-y-8 font-[family-name:var(--font-family-primary)]">
      <div>
        <h1 className="text-2xl md:text-3xl font-bold text-secondary-100">
          Stock Department Dashboard
        </h1>
        <p className="text-sm text-custom-700 mt-1">
          Manage materials, supplies, and automatic stock updates — Monday, May 4, 2026
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
        <h2 className="font-bold text-secondary-100 mb-3">Stock Management</h2>
        <p className="text-sm text-custom-700">
          Supply materials to production, track usage, and manage inventory levels with automatic deduction.
        </p>
      </Card>
    </div>
  );
}
