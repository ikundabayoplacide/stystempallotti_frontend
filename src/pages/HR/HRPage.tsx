import { useMemo } from "react";
import {
  HiOutlineUsers,
  HiOutlineUserAdd,
  HiOutlineBan,
  HiOutlineCheckCircle,
  HiOutlineClock,
  HiOutlineOfficeBuilding,
  HiOutlineArrowRight,
} from "react-icons/hi";
import { useNavigate } from "react-router-dom";
import { DashboardLayout } from "../../components";
import { Card } from "../../components/ui";
import { useAuth } from "../../context/AuthContext";
import { useGetAllEmployeesQuery } from "../../store/services/employeesService";

export default function HRPage() {
  const { userName } = useAuth();
  const navigate = useNavigate();

  const { data, isLoading } = useGetAllEmployeesQuery({ limit: 1000 });
  const employees = data?.data ?? [];

  const stats = useMemo(() => {
    const active = employees.filter((e) => e.isActive).length;
    const inactive = employees.filter((e) => !e.isActive).length;
    const fullTime = employees.filter((e) => e.contractType === "FULL_TIME").length;
    const partTime = employees.filter((e) => e.contractType === "PART_TIME").length;
    const contract = employees.filter((e) => e.contractType === "CONTRACT").length;
    const intern = employees.filter((e) => e.contractType === "INTERN").length;
    const male = employees.filter((e) => e.gender === "MALE").length;
    const female = employees.filter((e) => e.gender === "FEMALE").length;
    return { total: employees.length, active, inactive, fullTime, partTime, contract, intern, male, female };
  }, [employees]);

  // 5 most recently hired
  const recentEmployees = useMemo(() =>
    [...employees]
      .sort((a, b) => new Date(b.hiredAt ?? b.createdAt ?? 0).getTime() - new Date(a.hiredAt ?? a.createdAt ?? 0).getTime())
      .slice(0, 5),
    [employees]
  );

  return (
    <DashboardLayout userRole="hr" userName={userName ?? "HR"} notificationCount={0}>
      <div className="space-y-6 font-[family-name:var(--font-family-primary)]">

        {/* Header */}
        <div className="flex items-center justify-between flex-wrap gap-3">
          <div>
            <h1 className="text-3xl font-bold text-secondary-100">HR Dashboard</h1>
            <p className="mt-1 text-sm text-custom-700">Welcome back, {userName}. Here's your workforce overview.</p>
          </div>
          <button
            onClick={() => navigate("/hr/employees")}
            className="flex items-center gap-2 px-4 py-2 rounded-lg bg-primary-500 text-white text-sm font-semibold hover:bg-primary-600 transition-colors"
          >
            <HiOutlineUsers className="h-4 w-4" /> Manage Employees
          </button>
        </div>

        {/* Stat Cards */}
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
          {[
            { label: "Total Employees", value: stats.total, icon: HiOutlineUsers, color: "bg-blue-50 text-blue-600" },
            { label: "Active", value: stats.active, icon: HiOutlineCheckCircle, color: "bg-green-50 text-green-600" },
            { label: "Inactive", value: stats.inactive, icon: HiOutlineBan, color: "bg-red-50 text-red-600" },
            { label: "New / Interns", value: stats.intern, icon: HiOutlineUserAdd, color: "bg-purple-50 text-purple-600" },
          ].map(({ label, value, icon: Icon, color }) => (
            <Card key={label} className="!p-5 flex items-center gap-4">
              <div className={`w-12 h-12 rounded-xl flex items-center justify-center shrink-0 ${color}`}>
                <Icon className="h-6 w-6" />
              </div>
              <div>
                <p className="text-xs text-custom-500 font-medium">{label}</p>
                <p className="text-2xl font-bold text-secondary-100">
                  {isLoading ? "—" : value}
                </p>
              </div>
            </Card>
          ))}
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">

          {/* Contract Breakdown */}
          <Card>
            <div className="flex items-center gap-2 mb-4">
              <HiOutlineClock className="h-5 w-5 text-primary-500" />
              <h2 className="font-bold text-secondary-100">Contract Types</h2>
            </div>
            <div className="space-y-3">
              {[
                { label: "Full Time", value: stats.fullTime, color: "bg-blue-500" },
                { label: "Part Time", value: stats.partTime, color: "bg-yellow-500" },
                { label: "Contract", value: stats.contract, color: "bg-orange-500" },
                { label: "Intern", value: stats.intern, color: "bg-purple-500" },
              ].map(({ label, value, color }) => {
                const pct = stats.total > 0 ? Math.round((value / stats.total) * 100) : 0;
                return (
                  <div key={label}>
                    <div className="flex justify-between text-sm mb-1">
                      <span className="text-custom-700 font-medium">{label}</span>
                      <span className="font-bold text-secondary-100">{isLoading ? "—" : `${value} (${pct}%)`}</span>
                    </div>
                    <div className="h-2 bg-custom-100 rounded-full overflow-hidden">
                      <div className={`h-full ${color} rounded-full transition-all`} style={{ width: `${pct}%` }} />
                    </div>
                  </div>
                );
              })}
            </div>
          </Card>

          {/* Gender Breakdown */}
          <Card>
            <div className="flex items-center gap-2 mb-4">
              <HiOutlineOfficeBuilding className="h-5 w-5 text-primary-500" />
              <h2 className="font-bold text-secondary-100">Gender Distribution</h2>
            </div>
            <div className="space-y-3">
              {[
                { label: "Male", value: stats.male, color: "bg-blue-500" },
                { label: "Female", value: stats.female, color: "bg-pink-500" },
              ].map(({ label, value, color }) => {
                const pct = stats.total > 0 ? Math.round((value / stats.total) * 100) : 0;
                return (
                  <div key={label}>
                    <div className="flex justify-between text-sm mb-1">
                      <span className="text-custom-700 font-medium">{label}</span>
                      <span className="font-bold text-secondary-100">{isLoading ? "—" : `${value} (${pct}%)`}</span>
                    </div>
                    <div className="h-2 bg-custom-100 rounded-full overflow-hidden">
                      <div className={`h-full ${color} rounded-full transition-all`} style={{ width: `${pct}%` }} />
                    </div>
                  </div>
                );
              })}
            </div>

            {/* Active vs Inactive */}
            <div className="mt-6 pt-4 border-t border-custom-200">
              <p className="text-xs font-bold text-custom-500 uppercase tracking-wider mb-3">Active vs Inactive</p>
              <div className="flex gap-4">
                <div className="flex-1 rounded-xl bg-green-50 border border-green-200 px-4 py-3 text-center">
                  <p className="text-2xl font-bold text-green-600">{isLoading ? "—" : stats.active}</p>
                  <p className="text-xs text-green-700 font-medium mt-0.5">Active</p>
                </div>
                <div className="flex-1 rounded-xl bg-red-50 border border-red-200 px-4 py-3 text-center">
                  <p className="text-2xl font-bold text-red-600">{isLoading ? "—" : stats.inactive}</p>
                  <p className="text-xs text-red-700 font-medium mt-0.5">Inactive</p>
                </div>
              </div>
            </div>
          </Card>
        </div>

        {/* Recent Employees */}
        <Card className="!p-0 overflow-hidden">
          <div className="flex items-center justify-between px-5 py-4 border-b border-custom-200">
            <h2 className="font-bold text-secondary-100">Recently Hired</h2>
            <button
              onClick={() => navigate("/hr/employees")}
              className="flex items-center gap-1 text-xs font-semibold text-primary-600 hover:underline"
            >
              View all <HiOutlineArrowRight className="h-3.5 w-3.5" />
            </button>
          </div>
          {isLoading ? (
            <div className="py-10 text-center text-sm text-custom-400">Loading…</div>
          ) : recentEmployees.length === 0 ? (
            <div className="py-10 text-center text-sm text-custom-400">No employees yet.</div>
          ) : (
            <table className="w-full text-sm">
              <thead className="bg-custom-50">
                <tr>
                  {["Name", "Phone", "Contract", "Status", "Hired"].map((h) => (
                    <th key={h} className="px-5 py-3 text-left text-xs font-bold text-custom-500 uppercase tracking-wider">{h}</th>
                  ))}
                </tr>
              </thead>
              <tbody className="divide-y divide-custom-100">
                {recentEmployees.map((emp) => (
                  <tr key={emp.id} className="hover:bg-custom-50 transition-colors">
                    <td className="px-5 py-3 font-semibold text-secondary-100">{emp.fullName}</td>
                    <td className="px-5 py-3 text-custom-700">{emp.phoneNumber}</td>
                    <td className="px-5 py-3 text-custom-700">{emp.contractType?.replace("_", " ") ?? "—"}</td>
                    <td className="px-5 py-3">
                      <span className={`px-2 py-0.5 rounded-full text-xs font-semibold ${emp.isActive ? "bg-green-100 text-green-700" : "bg-gray-100 text-gray-500"}`}>
                        {emp.isActive ? "Active" : "Inactive"}
                      </span>
                    </td>
                    <td className="px-5 py-3 text-custom-700">
                      {emp.hiredAt ? new Date(emp.hiredAt).toLocaleDateString() : "—"}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          )}
        </Card>

      </div>
    </DashboardLayout>
  );
}
