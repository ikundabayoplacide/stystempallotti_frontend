import { useState } from "react";
import {
  HiOutlineCheck,
  HiOutlineCheckCircle,
  HiOutlineClipboardList,
  HiOutlineClock,
  HiOutlinePause,
  HiOutlinePlay
} from "react-icons/hi";
import { DashboardLayout } from "../../components";
import { Card } from "../../components/ui";

type TaskStatus = "pending" | "in-progress" | "paused" | "completed";

interface SubTask {
  id: string;
  title: string;
  completed: boolean;
}

interface Task {
  id: string;
  title: string;
  client: string;
  service: string;
  description: string;
  deadline: string;
  priority: "High" | "Medium" | "Low";
  estimatedTime: string;
  progress: number;
  status: TaskStatus;
  startedAt?: string;
  pausedAt?: string;
  completedAt?: string;
  notes?: string;
  subtasks: SubTask[];
}

const initialTasks: Task[] = [
  {
    id: "JOB-001",
    title: "Print 500 brochures",
    client: "ABC Corp",
    service: "Offset Printing",
    description: "Print 500 A4 brochures on 80gsm paper, full color",
    deadline: "2026-05-02 14:00",
    priority: "High",
    estimatedTime: "2h 30m",
    progress: 60,
    status: "in-progress",
    startedAt: "2026-05-01 08:00",
    subtasks: [
      { id: "ST-001-1", title: "Prepare printing plates", completed: true },
      { id: "ST-001-2", title: "Load paper into machine", completed: true },
      { id: "ST-001-3", title: "Print first 250 brochures", completed: true },
      { id: "ST-001-4", title: "Print remaining 250 brochures", completed: false },
      { id: "ST-001-5", title: "Quality check and packaging", completed: false },
    ],
  },
  {
    id: "JOB-002",
    title: "Bind 200 booklets",
    client: "XYZ Ltd",
    service: "Binding",
    description: "Spiral binding for 200 booklets, 50 pages each",
    deadline: "2026-05-01 16:00",
    priority: "Medium",
    estimatedTime: "1h 30m",
    progress: 75,
    status: "in-progress",
    startedAt: "2026-05-01 10:00",
    subtasks: [
      { id: "ST-002-1", title: "Organize pages for binding", completed: true },
      { id: "ST-002-2", title: "Punch holes in booklets", completed: true },
      { id: "ST-002-3", title: "Bind first 100 booklets", completed: true },
      { id: "ST-002-4", title: "Bind remaining 100 booklets", completed: false },
    ],
  },
  {
    id: "JOB-005",
    title: "Design 50-page report",
    client: "NGO B",
    service: "Composition",
    description: "Layout design for annual report with images and charts",
    deadline: "2026-05-03 10:00",
    priority: "Low",
    estimatedTime: "4h 00m",
    progress: 0,
    status: "pending",
    subtasks: [
      { id: "ST-005-1", title: "Review content and requirements", completed: false },
      { id: "ST-005-2", title: "Design cover page", completed: false },
      { id: "ST-005-3", title: "Layout pages 1-25", completed: false },
      { id: "ST-005-4", title: "Layout pages 26-50", completed: false },
      { id: "ST-005-5", title: "Insert images and charts", completed: false },
      { id: "ST-005-6", title: "Final review and adjustments", completed: false },
    ],
  },
  {
    id: "JOB-007",
    title: "Print 300 flyers",
    client: "Bank D",
    service: "Digital Printing",
    description: "A5 flyers on glossy paper, double-sided",
    deadline: "2026-05-04 12:00",
    priority: "High",
    estimatedTime: "1h 45m",
    progress: 0,
    status: "pending",
    subtasks: [
      { id: "ST-007-1", title: "Load design file", completed: false },
      { id: "ST-007-2", title: "Set up printer settings", completed: false },
      { id: "ST-007-3", title: "Print all flyers", completed: false },
      { id: "ST-007-4", title: "Quality check", completed: false },
    ],
  },
  {
    id: "JOB-003",
    title: "Print business cards",
    client: "Tech Startup",
    service: "Digital Printing",
    description: "500 business cards, premium cardstock",
    deadline: "2026-04-30 17:00",
    priority: "High",
    estimatedTime: "1h 00m",
    progress: 100,
    status: "completed",
    startedAt: "2026-04-30 08:00",
    completedAt: "2026-04-30 09:30",
    subtasks: [
      { id: "ST-003-1", title: "Prepare design file", completed: true },
      { id: "ST-003-2", title: "Load cardstock", completed: true },
      { id: "ST-003-3", title: "Print business cards", completed: true },
      { id: "ST-003-4", title: "Cut to size", completed: true },
    ],
  },
  {
    id: "JOB-004",
    title: "Package materials",
    client: "School A",
    service: "Packaging",
    description: "Package 300 printed materials for delivery",
    deadline: "2026-04-29 15:00",
    priority: "Medium",
    estimatedTime: "45m",
    progress: 100,
    status: "completed",
    startedAt: "2026-04-29 13:00",
    completedAt: "2026-04-29 14:15",
    subtasks: [
      { id: "ST-004-1", title: "Sort materials", completed: true },
      { id: "ST-004-2", title: "Package in boxes", completed: true },
      { id: "ST-004-3", title: "Label boxes", completed: true },
    ],
  },
];

const priorityColor: Record<string, string> = {
  High: "bg-red-500 text-white",
  Medium: "bg-yellow-500 text-white",
  Low: "bg-green-500 text-white",
};

const statusConfig: Record<TaskStatus, { label: string; color: string; icon: any }> = {
  pending: { label: "To Do", color: "bg-blue-500", icon: HiOutlineClipboardList },
  "in-progress": { label: "In Progress", color: "bg-yellow-500", icon: HiOutlineClock },
  paused: { label: "Paused", color: "bg-orange-500", icon: HiOutlinePause },
  completed: { label: "Completed", color: "bg-green-500", icon: HiOutlineCheckCircle },
};

export default function TaskManagementPage() {
  const [tasks, setTasks] = useState<Task[]>(initialTasks);
  const [selectedTask, setSelectedTask] = useState<Task | null>(null);
  const [showDetailsModal, setShowDetailsModal] = useState(false);
  const [showSubtasksModal, setShowSubtasksModal] = useState(false);
  const [newSubtaskTitle, setNewSubtaskTitle] = useState("");
  const [isAddingSubtask, setIsAddingSubtask] = useState(false);

  // Calculate progress based on completed subtasks
  const calculateProgress = (subtasks: SubTask[]): number => {
    if (subtasks.length === 0) return 0;
    const completedCount = subtasks.filter((st) => st.completed).length;
    return Math.round((completedCount / subtasks.length) * 100);
  };

  const getTasksByStatus = (status: TaskStatus) => {
    return tasks.filter((task) => task.status === status);
  };

  const handleStartTask = (taskId: string) => {
    setTasks(
      tasks.map((task) =>
        task.id === taskId
          ? {
              ...task,
              status: "in-progress" as TaskStatus,
              startedAt: new Date().toISOString(),
            }
          : task
      )
    );
  };

  const handlePauseTask = (taskId: string) => {
    setTasks(
      tasks.map((task) =>
        task.id === taskId
          ? {
              ...task,
              status: "paused" as TaskStatus,
              pausedAt: new Date().toISOString(),
            }
          : task
      )
    );
  };

  const handleResumeTask = (taskId: string) => {
    setTasks(
      tasks.map((task) =>
        task.id === taskId
          ? { ...task, status: "in-progress" as TaskStatus }
          : task
      )
    );
  };

  const handleCompleteTask = (taskId: string) => {
    setTasks(
      tasks.map((task) =>
        task.id === taskId
          ? {
              ...task,
              status: "completed" as TaskStatus,
              progress: 100,
              completedAt: new Date().toISOString(),
            }
          : task
      )
    );
  };

  const handleToggleSubtask = (taskId: string, subtaskId: string) => {
    setTasks(
      tasks.map((task) => {
        if (task.id === taskId) {
          const updatedSubtasks = task.subtasks.map((st) =>
            st.id === subtaskId ? { ...st, completed: !st.completed } : st
          );
          const newProgress = calculateProgress(updatedSubtasks);
          
          // If all subtasks are completed (100%), automatically complete the job
          const updatedTask = newProgress === 100
            ? {
                ...task,
                subtasks: updatedSubtasks,
                progress: newProgress,
                status: "completed" as TaskStatus,
                completedAt: new Date().toISOString(),
              }
            : {
                ...task,
                subtasks: updatedSubtasks,
                progress: newProgress,
              };
          
          // Update selectedTask if it's the current task
          if (selectedTask && selectedTask.id === taskId) {
            setSelectedTask(updatedTask);
          }
          
          return updatedTask;
        }
        return task;
      })
    );
  };

  const openSubtasksModal = (task: Task) => {
    setSelectedTask(task);
    setShowSubtasksModal(true);
  };

  const handleAddSubtask = (taskId: string) => {
    if (!newSubtaskTitle.trim()) return;

    setTasks(
      tasks.map((task) => {
        if (task.id === taskId) {
          const newSubtask: SubTask = {
            id: `ST-${taskId}-${Date.now()}`,
            title: newSubtaskTitle.trim(),
            completed: false,
          };
          const updatedSubtasks = [...task.subtasks, newSubtask];
          const newProgress = calculateProgress(updatedSubtasks);

          const updatedTask = {
            ...task,
            subtasks: updatedSubtasks,
            progress: newProgress,
          };

          // Update selectedTask if it's the current task
          if (selectedTask && selectedTask.id === taskId) {
            setSelectedTask(updatedTask);
          }

          return updatedTask;
        }
        return task;
      })
    );

    setNewSubtaskTitle("");
    setIsAddingSubtask(false);
  };

  const columns: TaskStatus[] = ["pending", "in-progress", "paused", "completed"];

  return (
    <DashboardLayout
      userRole="worker"
      userName="John Worker"
      notificationCount={2}
    >
      <div className="space-y-6 font-[family-name:var(--font-family-primary)]">
        {/* Header */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
          <div>
            <h1 className="text-2xl md:text-3xl font-bold text-secondary-100">
              My Task Board
            </h1>
            <p className="text-sm text-custom-700 mt-1">
              Manage your assigned jobs and track progress
            </p>
          </div>
        </div>

        {/* Summary Stats */}
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
          {columns.map((status) => {
            const config = statusConfig[status];
            const count = getTasksByStatus(status).length;
            const Icon = config.icon;

            return (
              <Card key={status} className="!p-4">
                <div className="flex items-center gap-3">
                  <div className={`w-10 h-10 rounded-xl ${config.color} flex items-center justify-center`}>
                    <Icon className="w-5 h-5 text-white" />
                  </div>
                  <div>
                    <p className="text-xs text-custom-700">{config.label}</p>
                    <p className="text-2xl font-bold text-secondary-100">{count}</p>
                  </div>
                </div>
              </Card>
            );
          })}
        </div>

        {/* Kanban Board */}
        <div className="grid grid-cols-1 lg:grid-cols-4 gap-4">
          {columns.map((status) => {
            const config = statusConfig[status];
            const columnTasks = getTasksByStatus(status);
            const Icon = config.icon;

            return (
              <div key={status} className="flex flex-col">
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
                <div className="bg-custom-100 rounded-b-xl p-3 flex-1 space-y-3 min-h-[500px]">
                  {columnTasks.map((task) => (
                    <Card
                      key={task.id}
                      hoverable
                      className="!p-3 !bg-style-600 cursor-pointer"
                      onClick={() => {
                        setSelectedTask(task);
                        setShowDetailsModal(true);
                      }}
                    >
                      {/* Task Header */}
                      <div className="flex items-start justify-between gap-2 mb-2">
                        <span className="text-xs font-bold text-primary-500">
                          {task.id}
                        </span>
                        <span
                          className={`text-[10px] font-bold px-2 py-0.5 rounded-full ${priorityColor[task.priority]}`}
                        >
                          {task.priority}
                        </span>
                      </div>

                      {/* Task Title */}
                      <h3 className="text-sm font-bold text-secondary-100 mb-1">
                        {task.title}
                      </h3>
                      <p className="text-xs text-custom-700 mb-2">{task.client}</p>

                      {/* Task Details */}
                      <div className="space-y-2 mb-3">
                        <div className="flex items-center gap-2 text-xs text-custom-700">
                          <HiOutlineClock className="w-3 h-3" />
                          <span>Due: {task.deadline}</span>
                        </div>
                        {task.estimatedTime && (
                          <div className="text-xs text-custom-700">
                            Est: {task.estimatedTime}
                          </div>
                        )}
                      </div>

                      {/* Progress Bar */}
                      {task.progress > 0 && task.status !== "completed" && (
                        <div className="mb-3">
                          <div className="flex items-center justify-between mb-1">
                            <span className="text-xs text-custom-700">Progress</span>
                            <span className="text-xs font-semibold text-primary-500">
                              {task.progress}%
                            </span>
                          </div>
                          <div 
                            className="w-full bg-custom-200 rounded-full h-1.5 cursor-pointer hover:h-2 transition-all"
                            onClick={(e) => {
                              if (status === "in-progress") {
                                e.stopPropagation();
                                openSubtasksModal(task);
                              }
                            }}
                          >
                            <div
                              className="h-1.5 rounded-full bg-primary-500"
                              style={{ width: `${task.progress}%` }}
                            />
                          </div>
                          {status === "in-progress" && (
                            <p className="text-[10px] text-custom-700 mt-1">
                              Click to manage subtasks ({task.subtasks.filter(st => st.completed).length}/{task.subtasks.length})
                            </p>
                          )}
                        </div>
                      )}

                      {/* Action Buttons */}
                      <div className="flex gap-2">
                        {status === "pending" && (
                          <button
                            onClick={(e) => {
                              e.stopPropagation();
                              handleStartTask(task.id);
                            }}
                            className="flex-1 flex items-center justify-center gap-1 px-3 py-1.5 rounded-lg bg-primary-500 text-white hover:bg-primary-600 transition-colors text-xs font-semibold"
                          >
                            <HiOutlinePlay className="w-3 h-3" />
                            Start
                          </button>
                        )}
                        {status === "in-progress" && (
                          <>
                            <button
                              onClick={(e) => {
                                e.stopPropagation();
                                handlePauseTask(task.id);
                              }}
                              className="flex-1 flex items-center justify-center gap-1 px-3 py-1.5 rounded-lg border border-custom-300 text-custom-700 hover:bg-custom-100 transition-colors text-xs font-semibold"
                            >
                              <HiOutlinePause className="w-3 h-3" />
                              Pause
                            </button>
                            <button
                              onClick={(e) => {
                                e.stopPropagation();
                                handleCompleteTask(task.id);
                              }}
                              className="flex-1 flex items-center justify-center gap-1 px-3 py-1.5 rounded-lg bg-green-500 text-white hover:bg-green-600 transition-colors text-xs font-semibold"
                            >
                              <HiOutlineCheck className="w-3 h-3" />
                              Done
                            </button>
                          </>
                        )}
                        {status === "paused" && (
                          <button
                            onClick={(e) => {
                              e.stopPropagation();
                              handleResumeTask(task.id);
                            }}
                            className="flex-1 flex items-center justify-center gap-1 px-3 py-1.5 rounded-lg bg-primary-500 text-white hover:bg-primary-600 transition-colors text-xs font-semibold"
                          >
                            <HiOutlinePlay className="w-3 h-3" />
                            Resume
                          </button>
                        )}
                      </div>

                      {/* Timestamps */}
                      {task.startedAt && status !== "pending" && (
                        <div className="mt-2 text-xs text-custom-700">
                          Started: {new Date(task.startedAt).toLocaleTimeString()}
                        </div>
                      )}
                      {task.completedAt && (
                        <div className="mt-1 text-xs text-green-600">
                          Completed: {new Date(task.completedAt).toLocaleTimeString()}
                        </div>
                      )}
                    </Card>
                  ))}
                </div>
              </div>
            );
          })}
        </div>

        {/* Task Details Modal */}
        {showDetailsModal && selectedTask && (
          <div className="fixed inset-0 bg-secondary-100/50 z-50 flex items-center justify-center p-4">
            <Card className="!p-6 max-w-2xl w-full max-h-[90vh] overflow-y-auto">
              <div className="flex items-start justify-between mb-4">
                <div>
                  <div className="flex items-center gap-2 mb-2">
                    <span className="text-sm font-bold text-primary-500">
                      {selectedTask.id}
                    </span>
                    <span
                      className={`text-xs font-bold px-2 py-0.5 rounded-full ${priorityColor[selectedTask.priority]}`}
                    >
                      {selectedTask.priority}
                    </span>
                  </div>
                  <h3 className="text-xl font-bold text-secondary-100">
                    {selectedTask.title}
                  </h3>
                </div>
                <button
                  onClick={() => setShowDetailsModal(false)}
                  className="text-custom-700 hover:text-secondary-100 text-2xl"
                >
                  ×
                </button>
              </div>

              <div className="space-y-4">
                <div>
                  <p className="text-sm font-semibold text-custom-700 mb-1">Client</p>
                  <p className="text-base text-secondary-100">{selectedTask.client}</p>
                </div>

                <div>
                  <p className="text-sm font-semibold text-custom-700 mb-1">Service</p>
                  <p className="text-base text-secondary-100">{selectedTask.service}</p>
                </div>

                <div>
                  <p className="text-sm font-semibold text-custom-700 mb-1">Description</p>
                  <p className="text-base text-secondary-100">{selectedTask.description}</p>
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <p className="text-sm font-semibold text-custom-700 mb-1">Deadline</p>
                    <p className="text-base text-secondary-100">{selectedTask.deadline}</p>
                  </div>
                  <div>
                    <p className="text-sm font-semibold text-custom-700 mb-1">Estimated Time</p>
                    <p className="text-base text-secondary-100">{selectedTask.estimatedTime}</p>
                  </div>
                </div>

                {selectedTask.progress > 0 && (
                  <div>
                    <p className="text-sm font-semibold text-custom-700 mb-2">Progress</p>
                    <div className="flex items-center gap-3">
                      <div className="flex-1 bg-custom-200 rounded-full h-3">
                        <div
                          className="h-3 rounded-full bg-primary-500"
                          style={{ width: `${selectedTask.progress}%` }}
                        />
                      </div>
                      <span className="text-sm font-bold text-primary-500">
                        {selectedTask.progress}%
                      </span>
                    </div>
                  </div>
                )}

                {selectedTask.startedAt && (
                  <div>
                    <p className="text-sm font-semibold text-custom-700 mb-1">Started At</p>
                    <p className="text-base text-secondary-100">
                      {new Date(selectedTask.startedAt).toLocaleString()}
                    </p>
                  </div>
                )}

                {selectedTask.completedAt && (
                  <div>
                    <p className="text-sm font-semibold text-custom-700 mb-1">Completed At</p>
                    <p className="text-base text-green-600">
                      {new Date(selectedTask.completedAt).toLocaleString()}
                    </p>
                  </div>
                )}

                {/* Subtasks Section */}
                {selectedTask.subtasks && selectedTask.subtasks.length > 0 && (
                  <div>
                    <div className="flex items-center justify-between mb-3">
                      <p className="text-sm font-semibold text-custom-700">
                        Subtasks ({selectedTask.subtasks.filter(st => st.completed).length}/{selectedTask.subtasks.length} completed)
                      </p>
                      {selectedTask.status === "in-progress" && !isAddingSubtask && (
                        <button
                          onClick={() => setIsAddingSubtask(true)}
                          className="text-xs font-semibold text-primary-500 hover:text-primary-600 transition-colors flex items-center gap-1"
                        >
                          <span>+ Add Subtask</span>
                        </button>
                      )}
                    </div>

                    {/* Add Subtask Input */}
                    {isAddingSubtask && selectedTask.status === "in-progress" && (
                      <div className="mb-3 p-3 rounded-xl bg-primary-50 border border-primary-200">
                        <input
                          type="text"
                          value={newSubtaskTitle}
                          onChange={(e) => setNewSubtaskTitle(e.target.value)}
                          placeholder="Enter subtask title..."
                          className="w-full px-3 py-2 rounded-lg border border-custom-300 text-sm focus:outline-none focus:border-primary-500 mb-2"
                          autoFocus
                          onKeyPress={(e) => {
                            if (e.key === "Enter") {
                              handleAddSubtask(selectedTask.id);
                            }
                          }}
                        />
                        <div className="flex gap-2">
                          <button
                            onClick={() => handleAddSubtask(selectedTask.id)}
                            className="flex-1 px-3 py-1.5 rounded-lg bg-primary-500 text-white hover:bg-primary-600 transition-colors text-xs font-semibold"
                          >
                            Add
                          </button>
                          <button
                            onClick={() => {
                              setIsAddingSubtask(false);
                              setNewSubtaskTitle("");
                            }}
                            className="flex-1 px-3 py-1.5 rounded-lg border border-custom-300 hover:bg-custom-100 transition-colors text-xs font-semibold text-custom-700"
                          >
                            Cancel
                          </button>
                        </div>
                      </div>
                    )}

                    <div className="space-y-2">
                      {selectedTask.subtasks.map((subtask, index) => (
                        <div
                          key={subtask.id}
                          className={`p-3 rounded-xl border-2 transition-all ${
                            selectedTask.status === "in-progress"
                              ? "cursor-pointer hover:border-primary-400"
                              : "cursor-default"
                          } ${
                            subtask.completed
                              ? "bg-green-50 border-green-300"
                              : "bg-custom-50 border-custom-300"
                          }`}
                          onClick={() => {
                            if (selectedTask.status === "in-progress") {
                              handleToggleSubtask(selectedTask.id, subtask.id);
                            }
                          }}
                        >
                          <div className="flex items-center gap-3">
                            <div
                              className={`w-5 h-5 rounded-full border-2 flex items-center justify-center flex-shrink-0 transition-all ${
                                subtask.completed
                                  ? "bg-green-500 border-green-500"
                                  : "border-custom-400"
                              }`}
                            >
                              {subtask.completed && (
                                <HiOutlineCheck className="w-3 h-3 text-white" />
                              )}
                            </div>
                            <div className="flex-1">
                              <p
                                className={`text-sm ${
                                  subtask.completed
                                    ? "text-green-700 line-through"
                                    : "text-secondary-100"
                                }`}
                              >
                                {index + 1}. {subtask.title}
                              </p>
                            </div>
                            {subtask.completed && (
                              <HiOutlineCheckCircle className="w-4 h-4 text-green-500 flex-shrink-0" />
                            )}
                          </div>
                        </div>
                      ))}
                    </div>
                    {selectedTask.status === "in-progress" && (
                      <p className="text-xs text-custom-700 mt-2">
                        Click on a subtask to mark it as complete/incomplete
                      </p>
                    )}
                  </div>
                )}
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

        {/* Subtasks Management Modal */}
        {showSubtasksModal && selectedTask && (
          <div className="fixed inset-0 bg-secondary-100/50 z-50 flex items-center justify-center p-4">
            <Card className="!p-6 max-w-2xl w-full max-h-[90vh] overflow-y-auto">
              <div className="flex items-start justify-between mb-4">
                <div>
                  <div className="flex items-center gap-2 mb-2">
                    <span className="text-sm font-bold text-primary-500">
                      {selectedTask.id}
                    </span>
                    <span
                      className={`text-xs font-bold px-2 py-0.5 rounded-full ${priorityColor[selectedTask.priority]}`}
                    >
                      {selectedTask.priority}
                    </span>
                  </div>
                  <h3 className="text-xl font-bold text-secondary-100">
                    {selectedTask.title}
                  </h3>
                  <p className="text-sm text-custom-700 mt-1">{selectedTask.client}</p>
                </div>
                <button
                  onClick={() => {
                    setShowSubtasksModal(false);
                    setSelectedTask(null);
                  }}
                  className="text-custom-700 hover:text-secondary-100 text-2xl"
                >
                  ×
                </button>
              </div>

              {/* Progress Overview */}
              <div className="mb-6 p-4 rounded-xl bg-primary-50 border border-primary-200">
                <div className="flex items-center justify-between mb-2">
                  <span className="text-sm font-semibold text-secondary-100">Overall Progress</span>
                  <span className="text-2xl font-bold text-primary-500">
                    {selectedTask.progress}%
                  </span>
                </div>
                <div className="w-full bg-custom-200 rounded-full h-3">
                  <div
                    className="h-3 rounded-full bg-primary-500 transition-all duration-300"
                    style={{ width: `${selectedTask.progress}%` }}
                  />
                </div>
                <p className="text-xs text-custom-700 mt-2">
                  {selectedTask.subtasks.filter(st => st.completed).length} of {selectedTask.subtasks.length} subtasks completed
                </p>
                {selectedTask.progress === 100 && (
                  <div className="mt-3 p-2 rounded-lg bg-green-50 border border-green-200">
                    <p className="text-sm text-green-700 font-semibold">
                      ✓ All subtasks completed! Job will move to "Completed" column.
                    </p>
                  </div>
                )}
              </div>

              {/* Subtasks List */}
              <div className="space-y-2 mb-6">
                <h4 className="text-sm font-bold text-secondary-100 mb-3">Subtasks</h4>
                {selectedTask.subtasks.map((subtask, index) => (
                  <div
                    key={subtask.id}
                    className={`p-3 rounded-xl border-2 transition-all cursor-pointer ${
                      subtask.completed
                        ? "bg-green-50 border-green-300"
                        : "bg-style-600 border-custom-300 hover:border-primary-400"
                    }`}
                    onClick={() => handleToggleSubtask(selectedTask.id, subtask.id)}
                  >
                    <div className="flex items-center gap-3">
                      <div
                        className={`w-6 h-6 rounded-full border-2 flex items-center justify-center flex-shrink-0 transition-all ${
                          subtask.completed
                            ? "bg-green-500 border-green-500"
                            : "border-custom-400 hover:border-primary-500"
                        }`}
                      >
                        {subtask.completed && (
                          <HiOutlineCheck className="w-4 h-4 text-white" />
                        )}
                      </div>
                      <div className="flex-1">
                        <div className="flex items-center gap-2">
                          <span className="text-xs font-semibold text-custom-700">
                            Step {index + 1}
                          </span>
                        </div>
                        <p
                          className={`text-sm font-semibold ${
                            subtask.completed
                              ? "text-green-700 line-through"
                              : "text-secondary-100"
                          }`}
                        >
                          {subtask.title}
                        </p>
                      </div>
                      {subtask.completed && (
                        <HiOutlineCheckCircle className="w-5 h-5 text-green-500 flex-shrink-0" />
                      )}
                    </div>
                  </div>
                ))}
              </div>

              <div className="flex gap-3">
                <button
                  onClick={() => {
                    setShowSubtasksModal(false);
                    setSelectedTask(null);
                  }}
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
