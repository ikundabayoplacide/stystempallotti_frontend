import {
    HiOutlineClipboardList,
    HiOutlineCube,
    HiOutlineCurrencyDollar,
    HiOutlineDocumentText,
} from "react-icons/hi";
import { Card } from "../../components/ui";

const kpis = [
  {
    label: "Procurement Requests",
    value: "6",
    icon: HiOutlineCube,
    color: "text-primary-500",
    bg: "bg-primary-100",
  },
  {
    label: "Tax Submissions",
    value: "3",
    icon: HiOutlineDocumentText,
    color: "text-green-600",
    bg: "bg-green-100",
  },
  {
    label: "Recovery Cases",
    value: "4",
    icon: HiOutlineCurrencyDollar,
    color: "text-yellow-600",
    bg: "bg-yellow-100",
  },
  {
    label: "Total Recovery",
    value: "1,850,000",
    icon: HiOutlineCurrencyDollar,
    color: "text-green-600",
    bg: "bg-green-100",
    suffix: "RWF",
  },
];

export default function Accountant2Dashboard() {
  return (
    <div className="space-y-8 font-[family-name:var(--font-family-primary)]">
      <div>
        <h1 className="text-2xl md:text-3xl font-bold text-secondary-100">
          Accountant 2 Dashboard
        </h1>
        <p className="text-sm text-custom-700 mt-1">
          E-Procurement, Taxes & Recovery — Monday, May 4, 2026
        </p>
      </div>

      <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
        {kpis.map(({ label, value, icon: Icon, color, bg, suffix }) => (
          <Card key={label} className="!p-4 flex flex-col gap-3">
            <div className={`w-10 h-10 rounded-xl flex items-center justify-center ${bg}`}>
              <Icon className={`w-5 h-5 ${color}`} />
            </div>
            <div>
              <p className="text-xs text-custom-700">{label}</p>
              <p className="text-xl font-bold text-secondary-100 leading-tight">
                {value} {suffix && <span className="text-sm font-normal text-custom-700">{suffix}</span>}
              </p>
            </div>
          </Card>
        ))}
      </div>

      <Card>
        <div className="flex items-center gap-2 mb-5">
          <HiOutlineClipboardList className="w-5 h-5 text-primary-500" />
          <h2 className="font-bold text-secondary-100">E-Procurement & Tax Management</h2>
        </div>
        <p className="text-sm text-custom-700">Procurement requests, tax submissions, and recovery tracking.</p>
      </Card>
    </div>
  );
}
