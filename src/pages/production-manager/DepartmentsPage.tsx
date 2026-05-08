import { useState } from "react";
import {
  HiOutlineCheckCircle,
  HiOutlineClock,
  HiOutlineEye,
  HiOutlinePlus,
  HiOutlineSearch,
  HiOutlineUserAdd,
  HiOutlineUsers,
  HiOutlineX
} from "react-icons/hi";
import { DashboardLayout } from "../../components";
import { Button, Card, Input } from "../../components/ui";

interface Department {
  id: string;
  name: string;
  supervisor: string;
  workers: number;
  activeJobs: number;
  completedToday: number;
  efficiency: number;
  status: "operational" | "busy" | "maintenance";
  equipment: string[];
}

const initialDepartments: Department[] = [
  {
    id: "DEPT-001",
    name: "Printing",
    supervisor: "John Supervisor",
    workers: 8,
    activeJobs: 5,
    completedToday: 3,
    efficiency: 92,
    status: "operational",
    equipment: ["Offset Press A", "Offset Press B", "Digital Printer"],
  },
  {
    id: "DEPT-002",
    name: "Binding",
    supervisor: "Jane Manager",
    workers: 6,
    activeJobs: 4,
    completedToday: 2,
    efficiency: 88,
    status: "busy",
    equipment: ["Binding Machine A", "Binding Machine B", "Cutting Machine"],
  },
  {
    id: "DEPT-003",
    name: "Composition",
    supervisor: "Mike Lead",
    workers: 5,
    activeJobs: 3,
    completedToday: 4,
    efficiency: 95,
    status: "operational",
    equipment: ["Computer Station A", "Computer Station B", "Design Workstation"],
  },
  {
    id: "DEPT-004",
    name: "Montage",
    supervisor: "Sarah Chief",
    workers: 4,
    activeJobs: 2,
    completedToday: 1,
    efficiency: 75,
    status: "maintenance",
    equipment: ["Montage Table A", "Montage Table B"],
  },
  {
    id: "DEPT-005",
    name: "Packaging",
    supervisor: "Tom Supervisor",
    workers: 7,
    activeJobs: 6,
    completedToday: 5,
    efficiency: 90,
    status: "busy",
    equipment: ["Packaging Station A", "Packaging Station B", "Sealing Machine"],
  },
];

export default function DepartmentsPage() {
  const [departments, setDepartments] = useState<Department[]>(initialDepartments);
  const [search, setSearch] = useState("");
  const [filterStatus, setFilterStatus] = useState<"all" | "operational" | "busy" | "maintenance">("all");
  const [selectedDepartment, setSelectedDepartment] = useState<Department | null>(null);
  const [showDetailsModal, setShowDetailsModal] = useState(false);
  const [showAddDepartmentModal, setShowAddDepartmentModal] = useState(false);
  const [showAddWorkerModal, setShowAddWorkerModal] = useState(false);

  const [newDepartment, setNewDepartment] = useState({
    name: "",
    supervisor: "",
    workers: "",
  });

  const [newWorker, setNewWorker] = useState({
    departmentId: "",
    workerName: "",
    position: "",
  });

  const handleAddDepartment = () => {
    const dept: Department = {
      id: `DEPT-${String(departments.length + 1).padStart(3, "0")}`,
      name: newDepartment.name,
      supervisor: newDepartment.supervisor,
      workers: parseInt(newDepartment.workers) || 0,
      activeJobs: 0,
      completedToday: 0,
      efficiency: 0,
      status: "operational",
      equipment: [],
    };
    setDepartments([...departments, dept]);
    setShowAddDepartmentModal(false);
    setNewDepartment({ name: "", supervisor: "", workers: "" });
    alert("Department added successfully!");
  };

  const handleAddWorker = () => {
    setDepartments(
      departments.map((dept) =>
        dept.id === newWorker.departmentId
          ? { ...dept, workers: dept.workers + 1 }
          : dept
      )
    );
    setShowAddWorkerModal(false);
    setNewWorker({ departmentId: "", workerName: "", position: "" });
    alert(`Worker ${newWorker.workerName} added successfully!`);
  };

  const filtered = departments.filter((dept) => {
    const matchesSearch =
      dept.name.toLowerCase().includes(search.toLowerCase()) ||
      dept.supervisor.toLowerCase().includes(search.toLowerCase());
    const matchesStatus = filterStatus === "all" || dept.status === filterStatus;
    return matchesSearch && matchesStatus;
  });

  const getStatusConfig = (status: string) => {
    switch (status) {
      case "operational":
        return { color: "text-green-700", bg: "bg-green-100", icon: HiOutlineCheckCircle };
      case "busy":
        return { color: "text-yellow-700", bg: "bg-yellow-100", icon: HiOutlineClock };
      case "maintenance":
        return { color: "text-red-700", bg: "bg-red-100", icon: HiOutlineX };
      default:
        return { color: "text-custom-700", bg: "bg-custom-100", icon: HiOutlineClock };
    }
  };

  const totalWorkers = departments.reduce((sum, d) => sum + d.workers, 0);
  const totalActiveJobs = departments.reduce((sum, d) => sum + d.activeJobs, 0);
  const avgEfficiency = Math.round(
    departments.reduce((sum, d) => sum + d.efficiency, 0) / departments.length
  );

  return (
    <DashboardLayout
      userRole="production-manager"
      userName="Production Manager"
      notificationCount={6}
    >
      <div className="space-y-6 font-[family-name:var(--font-family-primary)]">
        {/* Header */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
          <div>
            <h1 className="text-2xl md:text-3xl font-bold text-secondary-100">
              Department Management
            </h1>
            <p className="text-sm text-custom-700 mt-1">
              Monitor and manage production departments
            </p>
          </div>
          <div className="flex gap-2">
            <Button
              onClick={() => setShowAddWorkerModal(true)}
              className="!bg-blue-500 hover:!bg-blue-600 !text-white"
            >
              <HiOutlineUserAdd className="w-4 h-4 mr-2" />
              Add Worker
            </Button>
            <Button
              onClick={() => setShowAddDepartmentModal(true)}
              className="!bg-primary-500 hover:!bg-primary-600 !text-white"
            >
              <HiOutlinePlus className="w-4 h-4 mr-2" />
              Add Department
            </Button>
          </div>
        </div>

        {/* Summary Cards */}
        <div className="grid grid-cols-1 sm:grid-cols-4 gap-4">
          <Card className="!p-4">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-xl bg-primary-100 flex items-center justify-center">
                <HiOutlineUsers className="w-5 h-5 text-primary-600" />
              </div>
              <div>
                <p className="text-xs text-custom-700">Total Departments</p>
                <p className="text-xl font-bold text-secondary-100">{departments.length}</p>
              </div>
            </div>
          </Card>
          <Card className="!p-4">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-xl bg-blue-100 flex items-center justify-center">
                <HiOutlineUsers className="w-5 h-5 text-blue-600" />
              </div>
              <div>
                <p className="text-xs text-custom-700">Total Workers</p>
                <p className="text-xl font-bold text-blue-600">{totalWorkers}</p>
              </div>
            </div>
          </Card>
          <Card className="!p-4">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-xl bg-yellow-100 flex items-center justify-center">
                <HiOutlineClock className="w-5 h-5 text-yellow-600" />
              </div>
              <div>
                <p className="text-xs text-custom-700">Active Jobs</p>
                <p className="text-xl font-bold text-yellow-600">{totalActiveJobs}</p>
              </div>
            </div>
          </Card>
          <Card className="!p-4">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-xl bg-green-100 flex items-center justify-center">
                <HiOutlineCheckCircle className="w-5 h-5 text-green-600" />
              </div>
              <div>
                <p className="text-xs text-custom-700">Avg Efficiency</p>
                <p className="text-xl font-bold text-green-600">{avgEfficiency}%</p>
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
                placeholder="Search departments..."
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                className="w-full pl-9 pr-4 py-2 rounded-xl border border-custom-300 bg-style-500 text-secondary-100 text-sm placeholder:text-custom-700 focus:outline-none focus:border-primary-400 focus:ring-2 focus:ring-primary-200"
              />
            </div>
            <div className="flex gap-2">
              {(["all", "operational", "busy", "maintenance"] as const).map((status) => (
                <button
                  key={status}
                  onClick={() => setFilterStatus(status)}
                  className={`px-4 py-2 rounded-xl text-sm font-semibold transition-colors ${
                    filterStatus === status
                      ? "bg-primary-500 text-white"
                      : "bg-custom-100 text-custom-700 hover:bg-custom-200"
                  }`}
                >
                  {status.charAt(0).toUpperCase() + status.slice(1)}
                </button>
              ))}
            </div>
          </div>
        </Card>

        {/* Departments Table */}
        <Card className="!p-0 overflow-hidden">
          <div className="p-4 bg-custom-100 border-b border-custom-300">
            <h2 className="text-lg font-bold text-secondary-100">All Departments</h2>
          </div>
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead className="bg-custom-50 border-b border-custom-300">
                <tr>
                  <th className="px-4 py-3 text-left text-xs font-bold text-secondary-100 uppercase">
                    Department
                  </th>
                  <th className="px-4 py-3 text-left text-xs font-bold text-secondary-100 uppercase">
                    Supervisor
                  </th>
                  <th className="px-4 py-3 text-left text-xs font-bold text-secondary-100 uppercase">
                    Workers
                  </th>
                  <th className="px-4 py-3 text-left text-xs font-bold text-secondary-100 uppercase">
                    Active Jobs
                  </th>
                  <th className="px-4 py-3 text-left text-xs font-bold text-secondary-100 uppercase">
                    Completed Today
                  </th>
                  <th className="px-4 py-3 text-left text-xs font-bold text-secondary-100 uppercase">
                    Efficiency
                  </th>
                  <th className="px-4 py-3 text-left text-xs font-bold text-secondary-100 uppercase">
                    Status
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
                      No departments found
                    </td>
                  </tr>
                ) : (
                  filtered.map((dept) => {
                    const statusConfig = getStatusConfig(dept.status);
                    return (
                      <tr key={dept.id} className="hover:bg-custom-50 transition-colors">
                        <td className="px-4 py-4">
                          <div>
                            <span className="text-sm font-bold text-secondary-100 block">
                              {dept.name}
                            </span>
                            <span className="text-xs text-custom-700">{dept.id}</span>
                          </div>
                        </td>
                        <td className="px-4 py-4">
                          <span className="text-sm text-secondary-100">{dept.supervisor}</span>
                        </td>
                        <td className="px-4 py-4">
                          <span className="text-sm font-bold text-secondary-100">{dept.workers}</span>
                        </td>
                        <td className="px-4 py-4">
                          <span className="text-sm font-bold text-yellow-600">{dept.activeJobs}</span>
                        </td>
                        <td className="px-4 py-4">
                          <span className="text-sm font-bold text-green-600">{dept.completedToday}</span>
                        </td>
                        <td className="px-4 py-4">
                          <div className="flex items-center gap-2">
                            <div className="flex-1 h-2 bg-custom-200 rounded-full overflow-hidden">
                              <div
                                className={`h-full ${
                                  dept.efficiency >= 90
                                    ? "bg-green-500"
                                    : dept.efficiency >= 75
                                    ? "bg-yellow-500"
                                    : "bg-red-500"
                                }`}
                                style={{ width: `${dept.efficiency}%` }}
                              />
                            </div>
                            <span className="text-sm font-bold text-secondary-100 w-10">
                              {dept.efficiency}%
                            </span>
                          </div>
                        </td>
                        <td className="px-4 py-4">
                          <span
                            className={`text-xs font-bold px-3 py-1 rounded-full ${statusConfig.bg} ${statusConfig.color} flex items-center gap-1 w-fit`}
                          >
                            <statusConfig.icon className="w-3 h-3" />
                            {dept.status.toUpperCase()}
                          </span>
                        </td>
                        <td className="px-4 py-4">
                          <div className="flex items-center justify-end">
                            <button
                              onClick={() => {
                                setSelectedDepartment(dept);
                                setShowDetailsModal(true);
                              }}
                              className="px-3 py-1.5 rounded-lg bg-primary-500 text-white hover:bg-primary-600 transition-colors text-xs font-semibold"
                            >
                              <HiOutlineEye className="w-3 h-3 inline mr-1" />
                              View Details
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

        {/* Add Department Modal */}
        {showAddDepartmentModal && (
          <div className="fixed inset-0 bg-secondary-100/50 z-50 flex items-center justify-center p-4">
            <Card className="!p-6 max-w-2xl w-full">
              <div className="flex items-start justify-between mb-4">
                <div>
                  <h3 className="text-xl font-bold text-secondary-100">Add New Department</h3>
                  <p className="text-sm text-custom-700 mt-1">Create a new production department</p>
                </div>
                <button
                  onClick={() => setShowAddDepartmentModal(false)}
                  className="text-custom-700 hover:text-secondary-100"
                >
                  <HiOutlineX className="w-6 h-6" />
                </button>
              </div>

              <div className="space-y-4">
                <div>
                  <label className="block text-sm font-semibold text-secondary-100 mb-2">
                    Department Name <span className="text-red-500">*</span>
                  </label>
                  <Input
                    value={newDepartment.name}
                    onChange={(e) => setNewDepartment({ ...newDepartment, name: e.target.value })}
                    placeholder="e.g., Printing, Binding, Composition"
                  />
                </div>

                <div>
                  <label className="block text-sm font-semibold text-secondary-100 mb-2">
                    Supervisor Name <span className="text-red-500">*</span>
                  </label>
                  <Input
                    value={newDepartment.supervisor}
                    onChange={(e) => setNewDepartment({ ...newDepartment, supervisor: e.target.value })}
                    placeholder="e.g., John Supervisor"
                  />
                </div>

                <div>
                  <label className="block text-sm font-semibold text-secondary-100 mb-2">
                    Number of Workers <span className="text-red-500">*</span>
                  </label>
                  <Input
                    type="number"
                    value={newDepartment.workers}
                    onChange={(e) => setNewDepartment({ ...newDepartment, workers: e.target.value })}
                    placeholder="e.g., 5"
                  />
                </div>
              </div>

              <div className="flex gap-3 mt-6">
                <button
                  onClick={() => setShowAddDepartmentModal(false)}
                  className="flex-1 px-4 py-2 rounded-xl border border-custom-300 hover:bg-custom-100 transition-colors text-sm font-semibold text-custom-700"
                >
                  Cancel
                </button>
                <button
                  onClick={handleAddDepartment}
                  disabled={!newDepartment.name || !newDepartment.supervisor || !newDepartment.workers}
                  className="flex-1 px-4 py-2 rounded-xl bg-primary-500 text-white hover:bg-primary-600 transition-colors text-sm font-semibold disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  Add Department
                </button>
              </div>
            </Card>
          </div>
        )}

        {/* Add Worker Modal */}
        {showAddWorkerModal && (
          <div className="fixed inset-0 bg-secondary-100/50 z-50 flex items-center justify-center p-4">
            <Card className="!p-6 max-w-2xl w-full">
              <div className="flex items-start justify-between mb-4">
                <div>
                  <h3 className="text-xl font-bold text-secondary-100">Add Worker to Department</h3>
                  <p className="text-sm text-custom-700 mt-1">Assign a new worker to a department</p>
                </div>
                <button
                  onClick={() => setShowAddWorkerModal(false)}
                  className="text-custom-700 hover:text-secondary-100"
                >
                  <HiOutlineX className="w-6 h-6" />
                </button>
              </div>

              <div className="space-y-4">
                <div>
                  <label className="block text-sm font-semibold text-secondary-100 mb-2">
                    Department <span className="text-red-500">*</span>
                  </label>
                  <select
                    value={newWorker.departmentId}
                    onChange={(e) => setNewWorker({ ...newWorker, departmentId: e.target.value })}
                    className="w-full px-4 py-2 rounded-xl border border-custom-300 bg-style-500 text-secondary-100 focus:outline-none focus:border-primary-400 focus:ring-2 focus:ring-primary-200"
                  >
                    <option value="">Select Department</option>
                    {departments.map((dept) => (
                      <option key={dept.id} value={dept.id}>
                        {dept.name} - {dept.supervisor}
                      </option>
                    ))}
                  </select>
                </div>

                <div>
                  <label className="block text-sm font-semibold text-secondary-100 mb-2">
                    Worker Name <span className="text-red-500">*</span>
                  </label>
                  <Input
                    value={newWorker.workerName}
                    onChange={(e) => setNewWorker({ ...newWorker, workerName: e.target.value })}
                    placeholder="e.g., John Doe"
                  />
                </div>

                <div>
                  <label className="block text-sm font-semibold text-secondary-100 mb-2">
                    Position <span className="text-red-500">*</span>
                  </label>
                  <select
                    value={newWorker.position}
                    onChange={(e) => setNewWorker({ ...newWorker, position: e.target.value })}
                    className="w-full px-4 py-2 rounded-xl border border-custom-300 bg-style-500 text-secondary-100 focus:outline-none focus:border-primary-400 focus:ring-2 focus:ring-primary-200"
                  >
                    <option value="">Select Position</option>
                    <option value="Operator">Operator</option>
                    <option value="Technician">Technician</option>
                    <option value="Assistant">Assistant</option>
                    <option value="Specialist">Specialist</option>
                    <option value="Lead">Lead</option>
                  </select>
                </div>
              </div>

              <div className="flex gap-3 mt-6">
                <button
                  onClick={() => setShowAddWorkerModal(false)}
                  className="flex-1 px-4 py-2 rounded-xl border border-custom-300 hover:bg-custom-100 transition-colors text-sm font-semibold text-custom-700"
                >
                  Cancel
                </button>
                <button
                  onClick={handleAddWorker}
                  disabled={!newWorker.departmentId || !newWorker.workerName || !newWorker.position}
                  className="flex-1 px-4 py-2 rounded-xl bg-blue-500 text-white hover:bg-blue-600 transition-colors text-sm font-semibold disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  <HiOutlineUserAdd className="w-4 h-4 inline mr-2" />
                  Add Worker
                </button>
              </div>
            </Card>
          </div>
        )}

        {/* Details Modal */}
        {showDetailsModal && selectedDepartment && (
          <div className="fixed inset-0 bg-secondary-100/50 z-50 flex items-center justify-center p-4">
            <Card className="!p-6 max-w-2xl w-full">
              <div className="flex items-start justify-between mb-4">
                <div>
                  <h3 className="text-xl font-bold text-secondary-100">
                    {selectedDepartment.name} Department
                  </h3>
                  <p className="text-sm text-custom-700 mt-1">{selectedDepartment.id}</p>
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
                    <p className="text-xs text-custom-700 mb-1">Supervisor</p>
                    <p className="text-sm font-semibold text-secondary-100">
                      {selectedDepartment.supervisor}
                    </p>
                  </div>
                  <div>
                    <p className="text-xs text-custom-700 mb-1">Total Workers</p>
                    <p className="text-sm font-semibold text-secondary-100">
                      {selectedDepartment.workers}
                    </p>
                  </div>
                  <div>
                    <p className="text-xs text-custom-700 mb-1">Active Jobs</p>
                    <p className="text-sm font-semibold text-yellow-600">
                      {selectedDepartment.activeJobs}
                    </p>
                  </div>
                  <div>
                    <p className="text-xs text-custom-700 mb-1">Completed Today</p>
                    <p className="text-sm font-semibold text-green-600">
                      {selectedDepartment.completedToday}
                    </p>
                  </div>
                  <div>
                    <p className="text-xs text-custom-700 mb-1">Efficiency</p>
                    <p className="text-sm font-semibold text-primary-600">
                      {selectedDepartment.efficiency}%
                    </p>
                  </div>
                  <div>
                    <p className="text-xs text-custom-700 mb-1">Status</p>
                    <p className="text-sm font-semibold text-secondary-100">
                      {selectedDepartment.status.toUpperCase()}
                    </p>
                  </div>
                </div>

                <div>
                  <p className="text-xs text-custom-700 mb-2">Equipment</p>
                  <div className="flex flex-wrap gap-2">
                    {selectedDepartment.equipment.map((eq, idx) => (
                      <span
                        key={idx}
                        className="text-xs font-semibold px-3 py-1 rounded-full bg-primary-100 text-primary-700"
                      >
                        {eq}
                      </span>
                    ))}
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
