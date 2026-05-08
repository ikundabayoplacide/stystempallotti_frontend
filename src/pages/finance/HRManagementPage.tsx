import { useState } from "react";
import {
    HiOutlineCheckCircle,
    HiOutlineClock,
    HiOutlineCurrencyDollar,
    HiOutlineEye,
    HiOutlinePlus,
    HiOutlineSearch,
    HiOutlineUserGroup,
    HiOutlineX,
} from "react-icons/hi";
import { DashboardLayout } from "../../components";
import { Button, Card, Input } from "../../components/ui";

interface Employee {
  id: string;
  name: string;
  department: string;
  position: string;
  salary: string;
  status: "active" | "on-leave" | "inactive";
  joinDate: string;
  email: string;
  phone: string;
}

const initialEmployees: Employee[] = [
  {
    id: "EMP-001",
    name: "John Doe",
    department: "Production",
    position: "Production Manager",
    salary: "800,000",
    status: "active",
    joinDate: "2024-01-15",
    email: "john.doe@jts.com",
    phone: "+250 788 123 456",
  },
  {
    id: "EMP-002",
    name: "Jane Smith",
    department: "Sales",
    position: "Sales Officer",
    salary: "650,000",
    status: "active",
    joinDate: "2024-03-20",
    email: "jane.smith@jts.com",
    phone: "+250 788 234 567",
  },
  {
    id: "EMP-003",
    name: "Mike Johnson",
    department: "Finance",
    position: "Accountant",
    salary: "700,000",
    status: "on-leave",
    joinDate: "2023-11-10",
    email: "mike.johnson@jts.com",
    phone: "+250 788 345 678",
  },
  {
    id: "EMP-004",
    name: "Sarah Williams",
    department: "Stock",
    position: "Stock Manager",
    salary: "600,000",
    status: "active",
    joinDate: "2024-02-05",
    email: "sarah.williams@jts.com",
    phone: "+250 788 456 789",
  },
];

export default function HRManagementPage() {
  const [employees, setEmployees] = useState<Employee[]>(initialEmployees);
  const [search, setSearch] = useState("");
  const [filterStatus, setFilterStatus] = useState<"all" | "active" | "on-leave" | "inactive">("all");
  const [selectedEmployee, setSelectedEmployee] = useState<Employee | null>(null);
  const [showDetailsModal, setShowDetailsModal] = useState(false);
  const [showAddModal, setShowAddModal] = useState(false);

  const [newEmployee, setNewEmployee] = useState({
    name: "",
    department: "",
    position: "",
    salary: "",
    email: "",
    phone: "",
  });

  const filtered = employees.filter((emp) => {
    const matchesSearch =
      emp.name.toLowerCase().includes(search.toLowerCase()) ||
      emp.id.toLowerCase().includes(search.toLowerCase()) ||
      emp.department.toLowerCase().includes(search.toLowerCase());
    const matchesStatus = filterStatus === "all" || emp.status === filterStatus;
    return matchesSearch && matchesStatus;
  });

  const totalEmployees = employees.length;
  const activeEmployees = employees.filter((e) => e.status === "active").length;
  const totalPayroll = employees
    .filter((e) => e.status === "active")
    .reduce((sum, e) => sum + parseFloat(e.salary.replace(/,/g, "")), 0);

  const handleAddEmployee = () => {
    const empId = `EMP-${String(employees.length + 1).padStart(3, "0")}`;
    const employee: Employee = {
      id: empId,
      name: newEmployee.name,
      department: newEmployee.department,
      position: newEmployee.position,
      salary: newEmployee.salary,
      status: "active",
      joinDate: new Date().toISOString().split("T")[0],
      email: newEmployee.email,
      phone: newEmployee.phone,
    };
    setEmployees([...employees, employee]);
    setShowAddModal(false);
    setNewEmployee({ name: "", department: "", position: "", salary: "", email: "", phone: "" });
    alert("Employee added successfully!");
  };

  const getStatusConfig = (status: string) => {
    switch (status) {
      case "active":
        return { color: "text-green-700", bg: "bg-green-100", icon: HiOutlineCheckCircle };
      case "on-leave":
        return { color: "text-yellow-700", bg: "bg-yellow-100", icon: HiOutlineClock };
      case "inactive":
        return { color: "text-red-700", bg: "bg-red-100", icon: HiOutlineX };
      default:
        return { color: "text-custom-700", bg: "bg-custom-100", icon: HiOutlineClock };
    }
  };

  return (
    <DashboardLayout userRole="daf" userName="DAF" notificationCount={5}>
      <div className="space-y-6 font-[family-name:var(--font-family-primary)]">
        {/* Header */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
          <div>
            <h1 className="text-2xl md:text-3xl font-bold text-secondary-100">HR Management</h1>
            <p className="text-sm text-custom-700 mt-1">
              Manage employees, payroll, and HR operations
            </p>
          </div>
          <Button
            onClick={() => setShowAddModal(true)}
            className="!bg-primary-500 hover:!bg-primary-600 !text-white"
          >
            <HiOutlinePlus className="w-4 h-4 mr-2" />
            Add Employee
          </Button>
        </div>

        {/* Summary Cards */}
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
          <Card className="!p-4">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-xl bg-primary-100 flex items-center justify-center">
                <HiOutlineUserGroup className="w-5 h-5 text-primary-600" />
              </div>
              <div>
                <p className="text-xs text-custom-700">Total Employees</p>
                <p className="text-xl font-bold text-secondary-100">{totalEmployees}</p>
              </div>
            </div>
          </Card>
          <Card className="!p-4">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-xl bg-green-100 flex items-center justify-center">
                <HiOutlineCheckCircle className="w-5 h-5 text-green-600" />
              </div>
              <div>
                <p className="text-xs text-custom-700">Active Employees</p>
                <p className="text-xl font-bold text-green-600">{activeEmployees}</p>
              </div>
            </div>
          </Card>
          <Card className="!p-4">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-xl bg-yellow-100 flex items-center justify-center">
                <HiOutlineCurrencyDollar className="w-5 h-5 text-yellow-600" />
              </div>
              <div>
                <p className="text-xs text-custom-700">Monthly Payroll</p>
                <p className="text-xl font-bold text-yellow-600">
                  {totalPayroll.toLocaleString()} RWF
                </p>
              </div>
            </div>
          </Card>
        </div>

        {/* Filters */}
        <Card className="!p-4">
          <div className="flex flex-col sm:flex-row gap-3">
            <div className="relative flex-1">
              <HiOutlineSearch className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-custom-700" />
              <input
                type="text"
                placeholder="Search employees..."
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                className="w-full pl-9 pr-4 py-2 rounded-xl border border-custom-300 bg-style-500 text-secondary-100 text-sm placeholder:text-custom-700 focus:outline-none focus:border-primary-400 focus:ring-2 focus:ring-primary-200"
              />
            </div>
            <div className="flex gap-2">
              {(["all", "active", "on-leave", "inactive"] as const).map((status) => (
                <button
                  key={status}
                  onClick={() => setFilterStatus(status)}
                  className={`px-4 py-2 rounded-xl text-sm font-semibold transition-colors ${
                    filterStatus === status
                      ? "bg-primary-500 text-white"
                      : "bg-custom-100 text-custom-700 hover:bg-custom-200"
                  }`}
                >
                  {status === "all" ? "All" : status === "on-leave" ? "On Leave" : status.charAt(0).toUpperCase() + status.slice(1)}
                </button>
              ))}
            </div>
          </div>
        </Card>

        {/* Employees Table */}
        <Card className="!p-0 overflow-hidden">
          <div className="p-4 bg-custom-100 border-b border-custom-300">
            <h2 className="text-lg font-bold text-secondary-100">All Employees</h2>
          </div>
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead className="bg-custom-50 border-b border-custom-300">
                <tr>
                  <th className="px-4 py-3 text-left text-xs font-bold text-secondary-100 uppercase">
                    Employee ID
                  </th>
                  <th className="px-4 py-3 text-left text-xs font-bold text-secondary-100 uppercase">
                    Name
                  </th>
                  <th className="px-4 py-3 text-left text-xs font-bold text-secondary-100 uppercase">
                    Department
                  </th>
                  <th className="px-4 py-3 text-left text-xs font-bold text-secondary-100 uppercase">
                    Position
                  </th>
                  <th className="px-4 py-3 text-left text-xs font-bold text-secondary-100 uppercase">
                    Salary
                  </th>
                  <th className="px-4 py-3 text-left text-xs font-bold text-secondary-100 uppercase">
                    Status
                  </th>
                  <th className="px-4 py-3 text-left text-xs font-bold text-secondary-100 uppercase">
                    Join Date
                  </th>
                  <th className="px-4 py-3 text-right text-xs font-bold text-secondary-100 uppercase">
                    Actions
                  </th>
                </tr>
              </thead>
              <tbody className="bg-white divide-y divide-custom-200">
                {filtered.length === 0 ? (
                  <tr>
                    <td colSpan={8} className="px-4 py-8 text-center text-custom-700">
                      No employees found
                    </td>
                  </tr>
                ) : (
                  filtered.map((emp) => {
                    const statusConfig = getStatusConfig(emp.status);
                    return (
                      <tr key={emp.id} className="hover:bg-custom-50 transition-colors">
                        <td className="px-4 py-4">
                          <span className="text-sm font-bold text-primary-600">{emp.id}</span>
                        </td>
                        <td className="px-4 py-4">
                          <span className="text-sm font-semibold text-secondary-100">{emp.name}</span>
                        </td>
                        <td className="px-4 py-4">
                          <span className="text-sm text-secondary-100">{emp.department}</span>
                        </td>
                        <td className="px-4 py-4">
                          <span className="text-sm text-custom-700">{emp.position}</span>
                        </td>
                        <td className="px-4 py-4">
                          <span className="text-sm font-bold text-secondary-100">
                            {emp.salary} RWF
                          </span>
                        </td>
                        <td className="px-4 py-4">
                          <span
                            className={`text-xs font-bold px-3 py-1 rounded-full ${statusConfig.bg} ${statusConfig.color} flex items-center gap-1 w-fit`}
                          >
                            <statusConfig.icon className="w-3 h-3" />
                            {emp.status === "on-leave" ? "ON LEAVE" : emp.status.toUpperCase()}
                          </span>
                        </td>
                        <td className="px-4 py-4">
                          <span className="text-sm text-custom-700">{emp.joinDate}</span>
                        </td>
                        <td className="px-4 py-4">
                          <div className="flex items-center justify-end">
                            <button
                              onClick={() => {
                                setSelectedEmployee(emp);
                                setShowDetailsModal(true);
                              }}
                              className="px-3 py-1.5 rounded-lg bg-primary-500 text-white hover:bg-primary-600 transition-colors text-xs font-semibold"
                            >
                              <HiOutlineEye className="w-3 h-3 inline mr-1" />
                              View
                            </button>
                          </div>
                        </td>
                      </tr>
                    );
                  })
                )}
              </tbody>
            </table>
          </div>
        </Card>

        {/* Add Employee Modal */}
        {showAddModal && (
          <div className="fixed inset-0 bg-secondary-100/50 z-50 flex items-center justify-center p-4">
            <Card className="!p-6 max-w-2xl w-full max-h-[90vh] overflow-y-auto">
              <div className="flex items-start justify-between mb-4">
                <div>
                  <h3 className="text-xl font-bold text-secondary-100">Add New Employee</h3>
                  <p className="text-sm text-custom-700 mt-1">Enter employee information</p>
                </div>
                <button
                  onClick={() => setShowAddModal(false)}
                  className="text-custom-700 hover:text-secondary-100"
                >
                  <HiOutlineX className="w-6 h-6" />
                </button>
              </div>

              <div className="space-y-4">
                <div>
                  <label className="block text-sm font-semibold text-secondary-100 mb-2">
                    Full Name <span className="text-red-500">*</span>
                  </label>
                  <Input
                    value={newEmployee.name}
                    onChange={(e) => setNewEmployee({ ...newEmployee, name: e.target.value })}
                    placeholder="e.g., John Doe"
                  />
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-semibold text-secondary-100 mb-2">
                      Department <span className="text-red-500">*</span>
                    </label>
                    <select
                      value={newEmployee.department}
                      onChange={(e) => setNewEmployee({ ...newEmployee, department: e.target.value })}
                      className="w-full px-4 py-2 rounded-xl border border-custom-300 bg-style-500 text-secondary-100 focus:outline-none focus:border-primary-400 focus:ring-2 focus:ring-primary-200"
                    >
                      <option value="">Select Department</option>
                      <option value="Production">Production</option>
                      <option value="Sales">Sales</option>
                      <option value="Finance">Finance</option>
                      <option value="Stock">Stock</option>
                      <option value="Reception">Reception</option>
                      <option value="HR">HR</option>
                    </select>
                  </div>

                  <div>
                    <label className="block text-sm font-semibold text-secondary-100 mb-2">
                      Position <span className="text-red-500">*</span>
                    </label>
                    <Input
                      value={newEmployee.position}
                      onChange={(e) => setNewEmployee({ ...newEmployee, position: e.target.value })}
                      placeholder="e.g., Manager"
                    />
                  </div>
                </div>

                <div>
                  <label className="block text-sm font-semibold text-secondary-100 mb-2">
                    Monthly Salary (RWF) <span className="text-red-500">*</span>
                  </label>
                  <Input
                    value={newEmployee.salary}
                    onChange={(e) => setNewEmployee({ ...newEmployee, salary: e.target.value })}
                    placeholder="e.g., 800000"
                  />
                </div>

                <div>
                  <label className="block text-sm font-semibold text-secondary-100 mb-2">
                    Email <span className="text-red-500">*</span>
                  </label>
                  <Input
                    type="email"
                    value={newEmployee.email}
                    onChange={(e) => setNewEmployee({ ...newEmployee, email: e.target.value })}
                    placeholder="e.g., john.doe@jts.com"
                  />
                </div>

                <div>
                  <label className="block text-sm font-semibold text-secondary-100 mb-2">
                    Phone <span className="text-red-500">*</span>
                  </label>
                  <Input
                    value={newEmployee.phone}
                    onChange={(e) => setNewEmployee({ ...newEmployee, phone: e.target.value })}
                    placeholder="e.g., +250 788 123 456"
                  />
                </div>
              </div>

              <div className="flex gap-3 mt-6">
                <button
                  onClick={() => setShowAddModal(false)}
                  className="flex-1 px-4 py-2 rounded-xl border border-custom-300 hover:bg-custom-100 transition-colors text-sm font-semibold text-custom-700"
                >
                  Cancel
                </button>
                <button
                  onClick={handleAddEmployee}
                  disabled={
                    !newEmployee.name ||
                    !newEmployee.department ||
                    !newEmployee.position ||
                    !newEmployee.salary ||
                    !newEmployee.email ||
                    !newEmployee.phone
                  }
                  className="flex-1 px-4 py-2 rounded-xl bg-primary-500 text-white hover:bg-primary-600 transition-colors text-sm font-semibold disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  Add Employee
                </button>
              </div>
            </Card>
          </div>
        )}

        {/* Details Modal */}
        {showDetailsModal && selectedEmployee && (
          <div className="fixed inset-0 bg-secondary-100/50 z-50 flex items-center justify-center p-4">
            <Card className="!p-6 max-w-2xl w-full">
              <div className="flex items-start justify-between mb-4">
                <div>
                  <h3 className="text-xl font-bold text-secondary-100">Employee Details</h3>
                  <p className="text-sm text-custom-700 mt-1">{selectedEmployee.id}</p>
                </div>
                <button
                  onClick={() => setShowDetailsModal(false)}
                  className="text-custom-700 hover:text-secondary-100"
                >
                  <HiOutlineX className="w-6 h-6" />
                </button>
              </div>

              <div className="space-y-4">
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <p className="text-xs text-custom-700 mb-1">Full Name</p>
                    <p className="text-sm font-semibold text-secondary-100">
                      {selectedEmployee.name}
                    </p>
                  </div>
                  <div>
                    <p className="text-xs text-custom-700 mb-1">Department</p>
                    <p className="text-sm font-semibold text-secondary-100">
                      {selectedEmployee.department}
                    </p>
                  </div>
                  <div>
                    <p className="text-xs text-custom-700 mb-1">Position</p>
                    <p className="text-sm font-semibold text-secondary-100">
                      {selectedEmployee.position}
                    </p>
                  </div>
                  <div>
                    <p className="text-xs text-custom-700 mb-1">Monthly Salary</p>
                    <p className="text-sm font-semibold text-primary-600">
                      {selectedEmployee.salary} RWF
                    </p>
                  </div>
                  <div>
                    <p className="text-xs text-custom-700 mb-1">Email</p>
                    <p className="text-sm font-semibold text-secondary-100">
                      {selectedEmployee.email}
                    </p>
                  </div>
                  <div>
                    <p className="text-xs text-custom-700 mb-1">Phone</p>
                    <p className="text-sm font-semibold text-secondary-100">
                      {selectedEmployee.phone}
                    </p>
                  </div>
                  <div>
                    <p className="text-xs text-custom-700 mb-1">Join Date</p>
                    <p className="text-sm font-semibold text-secondary-100">
                      {selectedEmployee.joinDate}
                    </p>
                  </div>
                  <div>
                    <p className="text-xs text-custom-700 mb-1">Status</p>
                    <p className="text-sm font-semibold text-secondary-100">
                      {selectedEmployee.status.toUpperCase()}
                    </p>
                  </div>
                </div>
              </div>

              <div className="flex gap-3 mt-6">
                <button
                  onClick={() => setShowDetailsModal(false)}
                  className="flex-1 px-4 py-2 rounded-xl border border-custom-300 hover:bg-custom-100 transition-colors text-sm font-semibold text-custom-700"
                >
                  Close
                </button>
              </div>
            </Card>
          </div>
        )}
      </div>
    </DashboardLayout>
  );
}
