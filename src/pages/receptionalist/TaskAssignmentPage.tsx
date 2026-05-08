import { useState } from "react";
import {
  HiOutlineCheckCircle,
  HiOutlineClipboardList,
  HiOutlineClock,
  HiOutlinePlus,
  HiOutlineUsers
} from "react-icons/hi";
import { DashboardLayout } from "../../components";
import { Card } from "../../components/ui";
import type { JobStatus } from "../../types/JobStatus";
import { jobStatusConfig } from "../../types/JobStatus";

interface Task {
  id: string;
  title: string;
  client: string;
  service: string;
  deadline: string;
  priority: "High" | "Medium" | "Low";
  assignedTo?: string;
  department?: string;
  status: JobStatus;
}

const initialTasks: Task[] = [
  {
    id: "JOB-001",
    title: "Print 500 brochures",
    client: "ABC Corp",
    service: "Offset Printing",
    deadline: "2026-05-02",
    priority: "High",
    status: "received",
  },
  {
    id: "JOB-002",
    title: "Bind 200 booklets",
    client: "XYZ Ltd",
    service: "Binding",
    deadline: "2026-05-01",
    priority: "Medium",
    status: "received",
  },
  {
    id: "JOB-003",
    title: "Design 50-page report",
    client: "NGO B",
    service: "Composition",
    deadline: "2026-05-03",
    priority: "Low",
    status: "quotation-completed",
  },
  {
    id: "JOB-005",
    title: "Print 300 flyers",
    client: "Bank D",
    service: "Digital Printing",
    deadline: "2026-05-04",
    priority: "High",
    department: "Digital Printing",
    status: "in-printing",
  },
  {
    id: "JOB-006",
    title: "Package 1000 items",
    client: "Hotel C",
    service: "Packaging",
    deadline: "2026-05-05",
    priority: "Medium",
    department: "Packaging",
    assignedTo: "Team D",
    status: "in-packaging",
  },
  {
    id: "JOB-007",
    title: "Print business cards",
    client: "Tech Startup",
    service: "Digital Printing",
    deadline: "2026-04-30",
    priority: "High",
    department: "Digital Printing",
    assignedTo: "Team B",
    status: "completed",
  },
  {
    id: "JOB-008",
    title: "Annual report binding",
    client: "Finance Corp",
    service: "Binding",
    deadline: "2026-05-06",
    priority: "Medium",
    status: "approved",
  },
  {
    id: "JOB-009",
    title: "Marketing materials",
    client: "Startup Inc",
    service: "Composition",
    deadline: "2026-05-07",
    priority: "High",
    status: "paid",
  },
];

const departments = [
  { name: "Composition", activeJobs: 5, capacity: 8, workers: 3 },
  { name: "Montage", activeJobs: 3, capacity: 5, workers: 2 },
  { name: "Offset Printing", activeJobs: 7, capacity: 8, workers: 5 },
  { name: "Digital Printing", activeJobs: 4, capacity: 6, workers: 4 },
  { name: "Binding", activeJobs: 3, capacity: 5, workers: 3 },
  { name: "Packaging", activeJobs: 3, capacity: 4, workers: 2 },
];

const priorityColor: Record<string, string> = {
  High: "bg-red-500 text-white",
  Medium: "bg-yellow-500 text-white",
  Low: "bg-green-500 text-white",
};

// Group statuses for kanban view
type KanbanColumn = "received" | "in-progress" | "in-production" | "completed";

const kanbanConfig: Record<KanbanColumn, { label: string; color: string; icon: any; statuses: JobStatus[] }> = {
  received: { 
    label: "Received", 
    color: "bg-blue-500", 
    icon: HiOutlineClipboardList,
    statuses: ["received", "quotation-completed", "approved"]
  },
  "in-progress": { 
    label: "Payment & Planning", 
    color: "bg-purple-500", 
    icon: HiOutlineClock,
    statuses: ["paid", "in-production"]
  },
  "in-production": { 
    label: "In Production", 
    color: "bg-yellow-500", 
    icon: HiOutlineUsers,
    statuses: ["in-composition", "in-printing", "in-binding", "in-packaging"]
  },
  completed: { 
    label: "Done", 
    color: "bg-green-500", 
    icon: HiOutlineCheckCircle,
    statuses: ["completed", "delivered"]
  },
};

export default function TaskAssignmentPage() {
  const [tasks, setTasks] = useState<Task[]>(initialTasks);
  const [selectedTask, setSelectedTask] = useState<Task | null>(null);
  const [showAssignModal, setShowAssignModal] = useState(false);
  const [showNewTaskModal, setShowNewTaskModal] = useState(false);
  const [newTaskForm, setNewTaskForm] = useState({
    title: "",
    client: "",
    clientPhone: "",
    clientEmail: "",
    service: "",
    quantity: "",
    deadline: "",
    priority: "Medium" as "High" | "Medium" | "Low",
    paperType: "",
    paperSize: "",
    colors: "",
    specifications: "",
  });

  const getTasksByColumn = (column: KanbanColumn) => {
    const config = kanbanConfig[column];
    return tasks.filter((task) => config.statuses.includes(task.status));
  };

  const handleAssignToDepartment = (taskId: string, department: string) => {
    setTasks(
      tasks.map((task) =>
        task.id === taskId
          ? { ...task, department, status: "quotation-completed" as JobStatus }
          : task
      )
    );
    setShowAssignModal(false);
    setSelectedTask(null);
  };

  const handleCreateNewTask = () => {
    if (!newTaskForm.title || !newTaskForm.client || !newTaskForm.service || !newTaskForm.deadline || !newTaskForm.quantity) {
      alert("Please fill in all required fields");
      return;
    }

    const newTask: Task = {
      id: `JOB-${String(tasks.length + 1).padStart(3, "0")}`,
      title: newTaskForm.title,
      client: newTaskForm.client,
      service: newTaskForm.service,
      deadline: newTaskForm.deadline,
      priority: newTaskForm.priority,
      status: "received",
    };

    setTasks([newTask, ...tasks]);
    setShowNewTaskModal(false);
    setNewTaskForm({
      title: "",
      client: "",
      clientPhone: "",
      clientEmail: "",
      service: "",
      quantity: "",
      deadline: "",
      priority: "Medium",
      paperType: "",
      paperSize: "",
      colors: "",
      specifications: "",
    });
  };

  const columns: KanbanColumn[] = ["received", "in-progress", "in-production", "completed"];

  return (
    <DashboardLayout
      userRole="receptionist"
      userName="Reception Desk"
      notificationCount={6}
    >
      <div className="space-y-6 font-[family-name:var(--font-family-primary)]">
        {/* Header */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
          <div>
            <h1 className="text-2xl md:text-3xl font-bold text-secondary-100">
              Task Assignment Board
            </h1>
            <p className="text-sm text-custom-700 mt-1">
              Assign jobs to departments based on workload
            </p>
          </div>
          <button 
            onClick={() => setShowNewTaskModal(true)}
            className="flex items-center gap-2 px-4 py-2 rounded-xl bg-primary-500 text-secondary-200 hover:bg-primary-600 transition-colors self-start sm:self-auto"
          >
            <HiOutlinePlus className="w-4 h-4" />
            <span className="text-sm font-semibold">New Task</span>
          </button>
        </div>

        {/* Department Workload Overview */}
        <Card>
          <div className="flex items-center gap-2 mb-4">
            <HiOutlineUsers className="w-5 h-5 text-primary-500" />
            <h2 className="font-bold text-secondary-100">Department Workload</h2>
          </div>
          <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-3">
            {departments.map((dept) => {
              const utilization = (dept.activeJobs / dept.capacity) * 100;
              return (
                <div
                  key={dept.name}
                  className="p-3 rounded-xl bg-custom-50 border border-custom-200"
                >
                  <p className="text-xs font-bold text-secondary-100 mb-2 truncate">
                    {dept.name}
                  </p>
                  <div className="flex items-center justify-between mb-2">
                    <span className="text-xs text-custom-700">
                      {dept.activeJobs}/{dept.capacity}
                    </span>
                    <span
                      className={`text-xs font-semibold ${
                        utilization >= 80
                          ? "text-red-600"
                          : utilization >= 60
                          ? "text-yellow-600"
                          : "text-green-600"
                      }`}
                    >
                      {Math.round(utilization)}%
                    </span>
                  </div>
                  <div className="w-full bg-custom-200 rounded-full h-1.5">
                    <div
                      className={`h-1.5 rounded-full ${
                        utilization >= 80
                          ? "bg-red-500"
                          : utilization >= 60
                          ? "bg-yellow-500"
                          : "bg-green-500"
                      }`}
                      style={{ width: `${utilization}%` }}
                    />
                  </div>
                  <p className="text-xs text-custom-700 mt-2">
                    {dept.workers} workers
                  </p>
                </div>
              );
            })}
          </div>
        </Card>

        {/* Kanban Board */}
        <div className="grid grid-cols-1 lg:grid-cols-4 gap-4">
          {columns.map((column) => {
            const config = kanbanConfig[column];
            const columnTasks = getTasksByColumn(column);
            const Icon = config.icon;

            return (
              <div key={column} className="flex flex-col">
                {/* Column Header */}
                <div
                  className={`${config.color} text-white rounded-t-xl p-3 flex items-center justify-between`}
                >
                  <div className="flex items-center gap-2">
                    <Icon className="w-4 h-4" />
                    <span className="font-bold text-sm">{config.label}</span>
                  </div>
                  <span className="text-xs font-bold bg-white/20 px-2 py-0.5 rounded-full">
                    {columnTasks.length}
                  </span>
                </div>

                {/* Column Content */}
                <div className="bg-custom-100 rounded-b-xl p-3 flex-1 space-y-3 min-h-[400px]">
                  {columnTasks.map((task) => {
                    const taskStatus = jobStatusConfig[task.status];
                    return (
                    <Card
                      key={task.id}
                      hoverable
                      className="!p-3 !bg-style-600 cursor-pointer"
                      onClick={() => {
                        setSelectedTask(task);
                        if (column === "received") {
                          setShowAssignModal(true);
                        }
                      }}
                    >
                      {/* Task Header */}
                      <div className="flex items-start justify-between gap-2 mb-2">
                        <div className="flex items-center gap-2">
                          <div className="w-6 h-6 rounded-full bg-primary-100 flex items-center justify-center flex-shrink-0">
                            <span className="text-primary-600 text-xs font-bold">
                              {task.client.charAt(0)}
                            </span>
                          </div>
                          <span className="text-xs font-bold text-primary-500">
                            {task.id}
                          </span>
                        </div>
                        <div className="flex flex-col items-end gap-1">
                          <span
                            className={`text-[10px] font-bold px-2 py-0.5 rounded-full ${priorityColor[task.priority]}`}
                          >
                            {task.priority}
                          </span>
                          <span
                            className={`text-[9px] font-semibold px-2 py-0.5 rounded-full ${taskStatus.bgColor} ${taskStatus.color}`}
                          >
                            {taskStatus.label}
                          </span>
                        </div>
                      </div>

                      {/* Task Title */}
                      <h3 className="text-sm font-bold text-secondary-100 mb-1">
                        {task.title}
                      </h3>
                      <p className="text-xs text-custom-700 mb-2">{task.client}</p>

                      {/* Task Details */}
                      <div className="flex items-center gap-2 text-xs text-custom-700 mb-2">
                        <HiOutlineClock className="w-3 h-3" />
                        <span>{task.deadline}</span>
                      </div>

                      {/* Assignment Info */}
                      {task.department && (
                        <div className="text-xs bg-primary-50 text-primary-700 px-2 py-1 rounded-lg">
                          📍 {task.department}
                          {task.assignedTo && ` → ${task.assignedTo}`}
                        </div>
                      )}

                      {/* Action Button */}
                      {column === "received" && task.status === "received" && (
                        <button
                          className="w-full mt-2 text-xs font-semibold text-primary-500 hover:text-primary-600 transition-colors"
                          onClick={(e) => {
                            e.stopPropagation();
                            setSelectedTask(task);
                            setShowAssignModal(true);
                          }}
                        >
                          Send to Sales →
                        </button>
                      )}
                    </Card>
                  );
                  })}

                  {/* Add Task Button */}
                  {column === "received" && (
                    <button 
                      onClick={() => setShowNewTaskModal(true)}
                      className="w-full p-3 border-2 border-dashed border-custom-300 rounded-xl hover:border-primary-400 hover:bg-primary-50 transition-colors flex items-center justify-center gap-2 text-custom-700 hover:text-primary-600"
                    >
                      <HiOutlinePlus className="w-4 h-4" />
                      <span className="text-sm font-semibold">Add Task</span>
                    </button>
                  )}
                </div>
              </div>
            );
          })}
        </div>

        {/* Assignment Modal */}
        {showAssignModal && selectedTask && (
          <div className="fixed inset-0 bg-secondary-100/50 z-50 flex items-center justify-center p-4">
            <Card className="!p-6 max-w-md w-full max-h-[90vh] overflow-y-auto">
              <h3 className="text-lg font-bold text-secondary-100 mb-4">
                Assign Task to Department
              </h3>
              <div className="mb-4">
                <p className="text-sm text-custom-700 mb-1">Task: {selectedTask.id}</p>
                <p className="text-sm font-semibold text-secondary-100">
                  {selectedTask.title}
                </p>
              </div>
              <div className="space-y-2 mb-6">
                {departments.map((dept) => {
                  const utilization = (dept.activeJobs / dept.capacity) * 100;
                  return (
                    <button
                      key={dept.name}
                      onClick={() => handleAssignToDepartment(selectedTask.id, dept.name)}
                      className="w-full p-3 rounded-xl border-2 border-custom-300 hover:border-primary-400 hover:bg-primary-50 transition-colors text-left"
                    >
                      <div className="flex items-center justify-between mb-2">
                        <span className="font-semibold text-secondary-100">
                          {dept.name}
                        </span>
                        <span
                          className={`text-xs font-semibold ${
                            utilization >= 80
                              ? "text-red-600"
                              : utilization >= 60
                              ? "text-yellow-600"
                              : "text-green-600"
                          }`}
                        >
                          {Math.round(utilization)}% Load
                        </span>
                      </div>
                      <div className="flex items-center justify-between text-xs text-custom-700">
                        <span>
                          {dept.activeJobs}/{dept.capacity} jobs
                        </span>
                        <span>{dept.workers} workers</span>
                      </div>
                    </button>
                  );
                })}
              </div>
              <button
                onClick={() => {
                  setShowAssignModal(false);
                  setSelectedTask(null);
                }}
                className="w-full px-4 py-2 rounded-xl border border-custom-300 hover:bg-custom-100 transition-colors text-sm font-semibold text-custom-700"
              >
                Cancel
              </button>
            </Card>
          </div>
        )}

        {/* New Task Modal */}
        {showNewTaskModal && (
          <div className="fixed inset-0 bg-secondary-100/50 z-50 flex items-center justify-center p-4">
            <Card className="!p-6 max-w-3xl w-full max-h-[90vh] overflow-y-auto">
              <div className="flex items-center justify-between mb-6">
                <div>
                  <h3 className="text-2xl font-bold text-secondary-100">
                    Register New Job
                  </h3>
                  <p className="text-sm text-custom-700 mt-1">
                    Create a new job card for customer order
                  </p>
                </div>
                <button
                  onClick={() => setShowNewTaskModal(false)}
                  className="text-custom-700 hover:text-secondary-100 text-2xl"
                >
                  ×
                </button>
              </div>

              <div className="space-y-6">
                {/* Client Information Section */}
                <div className="p-4 rounded-xl bg-custom-50 border border-custom-200">
                  <div className="flex items-center gap-2 mb-4">
                    <HiOutlineUsers className="w-5 h-5 text-primary-500" />
                    <h4 className="text-sm font-bold text-secondary-100 uppercase tracking-wide">
                      Client Information
                    </h4>
                  </div>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div>
                      <label className="block text-sm font-semibold text-custom-700 mb-2">
                        Client Name *
                      </label>
                      <input
                        type="text"
                        value={newTaskForm.client}
                        onChange={(e) =>
                          setNewTaskForm({ ...newTaskForm, client: e.target.value })
                        }
                        placeholder="Enter client name"
                        className="w-full px-4 py-2 rounded-xl border border-custom-300 focus:outline-none focus:border-primary-500"
                      />
                    </div>
                    <div>
                      <label className="block text-sm font-semibold text-custom-700 mb-2">
                        Phone Number *
                      </label>
                      <input
                        type="tel"
                        value={newTaskForm.clientPhone}
                        onChange={(e) =>
                          setNewTaskForm({ ...newTaskForm, clientPhone: e.target.value })
                        }
                        placeholder="Enter phone number"
                        className="w-full px-4 py-2 rounded-xl border border-custom-300 focus:outline-none focus:border-primary-500"
                      />
                    </div>
                    <div className="md:col-span-2">
                      <label className="block text-sm font-semibold text-custom-700 mb-2">
                        Email Address (Optional)
                      </label>
                      <input
                        type="email"
                        value={newTaskForm.clientEmail}
                        onChange={(e) =>
                          setNewTaskForm({ ...newTaskForm, clientEmail: e.target.value })
                        }
                        placeholder="Enter email address"
                        className="w-full px-4 py-2 rounded-xl border border-custom-300 focus:outline-none focus:border-primary-500"
                      />
                    </div>
                  </div>
                </div>

                {/* Job Details Section */}
                <div className="p-4 rounded-xl bg-custom-50 border border-custom-200">
                  <div className="flex items-center gap-2 mb-4">
                    <HiOutlineClipboardList className="w-5 h-5 text-primary-500" />
                    <h4 className="text-sm font-bold text-secondary-100 uppercase tracking-wide">
                      Job Details
                    </h4>
                  </div>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div className="md:col-span-2">
                      <label className="block text-sm font-semibold text-custom-700 mb-2">
                        Job Title/Description *
                      </label>
                      <input
                        type="text"
                        value={newTaskForm.title}
                        onChange={(e) =>
                          setNewTaskForm({ ...newTaskForm, title: e.target.value })
                        }
                        placeholder="e.g., Print 500 brochures"
                        className="w-full px-4 py-2 rounded-xl border border-custom-300 focus:outline-none focus:border-primary-500"
                      />
                    </div>

                    <div>
                      <label className="block text-sm font-semibold text-custom-700 mb-2">
                        Service Type *
                      </label>
                      <select
                        value={newTaskForm.service}
                        onChange={(e) =>
                          setNewTaskForm({ ...newTaskForm, service: e.target.value })
                        }
                        className="w-full px-4 py-2 rounded-xl border border-custom-300 focus:outline-none focus:border-primary-500"
                      >
                        <option value="">Select service...</option>
                        <option value="Composition">Composition</option>
                        <option value="Montage">Montage</option>
                        <option value="Offset Printing">Offset Printing</option>
                        <option value="Digital Printing">Digital Printing</option>
                        <option value="Binding">Binding</option>
                        <option value="Packaging">Packaging</option>
                      </select>
                    </div>

                    <div>
                      <label className="block text-sm font-semibold text-custom-700 mb-2">
                        Quantity *
                      </label>
                      <input
                        type="number"
                        value={newTaskForm.quantity}
                        onChange={(e) =>
                          setNewTaskForm({ ...newTaskForm, quantity: e.target.value })
                        }
                        placeholder="Enter quantity"
                        min="1"
                        className="w-full px-4 py-2 rounded-xl border border-custom-300 focus:outline-none focus:border-primary-500"
                      />
                    </div>

                    <div>
                      <label className="block text-sm font-semibold text-custom-700 mb-2">
                        Deadline *
                      </label>
                      <input
                        type="date"
                        value={newTaskForm.deadline}
                        onChange={(e) =>
                          setNewTaskForm({ ...newTaskForm, deadline: e.target.value })
                        }
                        className="w-full px-4 py-2 rounded-xl border border-custom-300 focus:outline-none focus:border-primary-500"
                      />
                    </div>

                    <div>
                      <label className="block text-sm font-semibold text-custom-700 mb-2">
                        Priority *
                      </label>
                      <select
                        value={newTaskForm.priority}
                        onChange={(e) =>
                          setNewTaskForm({
                            ...newTaskForm,
                            priority: e.target.value as "High" | "Medium" | "Low",
                          })
                        }
                        className="w-full px-4 py-2 rounded-xl border border-custom-300 focus:outline-none focus:border-primary-500"
                      >
                        <option value="Low">Low</option>
                        <option value="Medium">Medium</option>
                        <option value="High">High</option>
                      </select>
                    </div>

                    <div>
                      <label className="block text-sm font-semibold text-custom-700 mb-2">
                        Paper Type (Optional)
                      </label>
                      <input
                        type="text"
                        value={newTaskForm.paperType}
                        onChange={(e) =>
                          setNewTaskForm({ ...newTaskForm, paperType: e.target.value })
                        }
                        placeholder="e.g., 80gsm, Glossy"
                        className="w-full px-4 py-2 rounded-xl border border-custom-300 focus:outline-none focus:border-primary-500"
                      />
                    </div>

                    <div>
                      <label className="block text-sm font-semibold text-custom-700 mb-2">
                        Paper Size (Optional)
                      </label>
                      <select
                        value={newTaskForm.paperSize}
                        onChange={(e) =>
                          setNewTaskForm({ ...newTaskForm, paperSize: e.target.value })
                        }
                        className="w-full px-4 py-2 rounded-xl border border-custom-300 focus:outline-none focus:border-primary-500"
                      >
                        <option value="">Select size...</option>
                        <option value="A4">A4</option>
                        <option value="A3">A3</option>
                        <option value="A5">A5</option>
                        <option value="Letter">Letter</option>
                        <option value="Custom">Custom</option>
                      </select>
                    </div>

                    <div>
                      <label className="block text-sm font-semibold text-custom-700 mb-2">
                        Colors (Optional)
                      </label>
                      <input
                        type="text"
                        value={newTaskForm.colors}
                        onChange={(e) =>
                          setNewTaskForm({ ...newTaskForm, colors: e.target.value })
                        }
                        placeholder="e.g., Full Color, B&W"
                        className="w-full px-4 py-2 rounded-xl border border-custom-300 focus:outline-none focus:border-primary-500"
                      />
                    </div>

                    <div className="md:col-span-2">
                      <label className="block text-sm font-semibold text-custom-700 mb-2">
                        Additional Specifications (Optional)
                      </label>
                      <textarea
                        value={newTaskForm.specifications}
                        onChange={(e) =>
                          setNewTaskForm({
                            ...newTaskForm,
                            specifications: e.target.value,
                          })
                        }
                        placeholder="Enter any additional requirements or notes..."
                        rows={3}
                        className="w-full px-4 py-2 rounded-xl border border-custom-300 focus:outline-none focus:border-primary-500 resize-none"
                      />
                    </div>
                  </div>
                </div>
              </div>

              <div className="flex gap-3 mt-6">
                <button
                  onClick={() => setShowNewTaskModal(false)}
                  className="flex-1 px-4 py-2 rounded-xl border border-custom-300 hover:bg-custom-100 transition-colors text-sm font-semibold text-custom-700"
                >
                  Cancel
                </button>
                <button
                  onClick={handleCreateNewTask}
                  className="flex-1 px-4 py-2 rounded-xl bg-primary-500 text-white hover:bg-primary-600 transition-colors text-sm font-semibold"
                >
                  Create Job
                </button>
              </div>
            </Card>
          </div>
        )}
      </div>
    </DashboardLayout>
  );
}
