import { useState } from "react";
import {
    HiOutlineCheckCircle,
    HiOutlineClock,
    HiOutlinePlusCircle,
    HiOutlineSearch,
    HiOutlineUser,
    HiOutlineX,
} from "react-icons/hi";
import { DashboardLayout } from "../../components";
import { Card } from "../../components/ui";

type OrientationStatus = "scheduled" | "in-progress" | "completed" | "cancelled";

interface OrientationSession {
  id: string;
  employeeName: string;
  employeeId: string;
  department: string;
  role: string;
  startDate: string;
  endDate?: string;
  status: OrientationStatus;
  mentor?: string;
  completedModules: string[];
  totalModules: number;
  notes?: string;
}

const orientationModules = [
  "Company Overview & Culture",
  "Safety & Security Procedures",
  "Department Introduction",
  "Equipment & Tools Training",
  "Quality Standards",
  "Reporting & Documentation",
  "Team Integration",
];

const initialSessions: OrientationSession[] = [
  {
    id: "ORI-001",
    employeeName: "Jean Uwimana",
    employeeId: "EMP-2026-001",
    department: "Printing",
    role: "Printing Operator",
    startDate: "2026-05-01",
    status: "in-progress",
    mentor: "Senior Operator - Paul",
    completedModules: [
      "Company Overview & Culture",
      "Safety & Security Procedures",
      "Department Introduction",
    ],
    totalModules: 7,
  },
  {
    id: "ORI-002",
    employeeName: "Marie Mukamana",
    employeeId: "EMP-2026-002",
    department: "Binding",
    role: "Binding Technician",
    startDate: "2026-05-03",
    status: "scheduled",
    mentor: "Supervisor - Alice",
    completedModules: [],
    totalModules: 7,
  },
  {
    id: "ORI-003",
    employeeName: "David Nkurunziza",
    employeeId: "EMP-2026-003",
    department: "Stock",
    role: "Stock Assistant",
    startDate: "2026-04-25",
    endDate: "2026-04-30",
    status: "completed",
    mentor: "Stock Manager - John",
    completedModules: orientationModules,
    totalModules: 7,
    notes: "Excellent performance during orientation",
  },
];

const statusConfig: Record<OrientationStatus, { label: string; color: string; icon: any }> = {
  scheduled: {
    label: "Scheduled",
    color: "bg-blue-100 text-blue-700",
    icon: HiOutlineClock,
  },
  "in-progress": {
    label: "In Progress",
    color: "bg-yellow-100 text-yellow-700",
    icon: HiOutlineClock,
  },
  completed: {
    label: "Completed",
    color: "bg-green-100 text-green-700",
    icon: HiOutlineCheckCircle,
  },
  cancelled: {
    label: "Cancelled",
    color: "bg-red-100 text-red-700",
    icon: HiOutlineX,
  },
};

export default function OrientationPage() {
  const [sessions, setSessions] = useState<OrientationSession[]>(initialSessions);
  const [search, setSearch] = useState("");
  const [selectedSession, setSelectedSession] = useState<OrientationSession | null>(null);
  const [showModal, setShowModal] = useState(false);
  const [showNewModal, setShowNewModal] = useState(false);
  const [newSessionForm, setNewSessionForm] = useState({
    employeeName: "",
    employeeId: "",
    department: "",
    role: "",
    startDate: "",
    mentor: "",
  });

  const filtered = sessions.filter(
    (session) =>
      session.employeeName.toLowerCase().includes(search.toLowerCase()) ||
      session.employeeId.toLowerCase().includes(search.toLowerCase()) ||
      session.department.toLowerCase().includes(search.toLowerCase())
  );

  const handleCreateSession = () => {
    if (
      !newSessionForm.employeeName ||
      !newSessionForm.employeeId ||
      !newSessionForm.department ||
      !newSessionForm.role ||
      !newSessionForm.startDate
    ) {
      alert("Please fill in all required fields");
      return;
    }

    const newSession: OrientationSession = {
      id: `ORI-${String(sessions.length + 1).padStart(3, "0")}`,
      employeeName: newSessionForm.employeeName,
      employeeId: newSessionForm.employeeId,
      department: newSessionForm.department,
      role: newSessionForm.role,
      startDate: newSessionForm.startDate,
      status: "scheduled",
      mentor: newSessionForm.mentor || undefined,
      completedModules: [],
      totalModules: 7,
    };

    setSessions([newSession, ...sessions]);
    setShowNewModal(false);
    setNewSessionForm({
      employeeName: "",
      employeeId: "",
      department: "",
      role: "",
      startDate: "",
      mentor: "",
    });
  };

  const handleCompleteModule = (sessionId: string, module: string) => {
    setSessions(
      sessions.map((session) => {
        if (session.id === sessionId) {
          const updatedModules = [...session.completedModules, module];
          const status: OrientationStatus =
            updatedModules.length === session.totalModules ? "completed" : "in-progress";
          return {
            ...session,
            completedModules: updatedModules,
            status: status,
            endDate: status === "completed" ? new Date().toISOString().split("T")[0] : undefined,
          };
        }
        return session;
      })
    );
  };

  const inProgressCount = sessions.filter((s) => s.status === "in-progress").length;

  return (
    <DashboardLayout userRole="admin" userName="Admin" notificationCount={inProgressCount}>
      <div className="space-y-6 font-[family-name:var(--font-family-primary)]">
        {/* Header */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
          <div>
            <h1 className="text-2xl md:text-3xl font-bold text-secondary-100">
              Employee Orientation
            </h1>
            <p className="text-sm text-custom-700 mt-1">
              Track new employee onboarding and training
            </p>
          </div>
          <button
            onClick={() => setShowNewModal(true)}
            className="flex items-center gap-2 px-4 py-2 rounded-xl bg-primary-500 text-white hover:bg-primary-600 transition-colors self-start sm:self-auto text-sm font-semibold"
          >
            <HiOutlinePlusCircle className="w-4 h-4" />
            New Orientation
          </button>
        </div>

        {/* Summary Cards */}
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
          <Card className="!p-4">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-xl bg-blue-100 flex items-center justify-center">
                <HiOutlineClock className="w-5 h-5 text-blue-600" />
              </div>
              <div>
                <p className="text-xs text-custom-700">Scheduled</p>
                <p className="text-2xl font-bold text-secondary-100">
                  {sessions.filter((s) => s.status === "scheduled").length}
                </p>
              </div>
            </div>
          </Card>
          <Card className="!p-4">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-xl bg-yellow-100 flex items-center justify-center">
                <HiOutlineClock className="w-5 h-5 text-yellow-600" />
              </div>
              <div>
                <p className="text-xs text-custom-700">In Progress</p>
                <p className="text-2xl font-bold text-secondary-100">{inProgressCount}</p>
              </div>
            </div>
          </Card>
          <Card className="!p-4">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-xl bg-green-100 flex items-center justify-center">
                <HiOutlineCheckCircle className="w-5 h-5 text-green-600" />
              </div>
              <div>
                <p className="text-xs text-custom-700">Completed</p>
                <p className="text-2xl font-bold text-secondary-100">
                  {sessions.filter((s) => s.status === "completed").length}
                </p>
              </div>
            </div>
          </Card>
          <Card className="!p-4">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-xl bg-primary-100 flex items-center justify-center">
                <HiOutlineUser className="w-5 h-5 text-primary-600" />
              </div>
              <div>
                <p className="text-xs text-custom-700">Total</p>
                <p className="text-2xl font-bold text-secondary-100">{sessions.length}</p>
              </div>
            </div>
          </Card>
        </div>

        {/* Sessions List */}
        <Card className="!p-6">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 mb-5">
            <h2 className="text-lg font-bold text-secondary-100">All Orientation Sessions</h2>
            <div className="relative w-full sm:w-64">
              <HiOutlineSearch className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-custom-700" />
              <input
                type="text"
                placeholder="Search sessions..."
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                className="w-full pl-9 pr-4 py-2 rounded-xl border border-custom-300 bg-style-500 text-secondary-100 text-sm placeholder:text-custom-700 focus:outline-none focus:border-primary-400 focus:ring-2 focus:ring-primary-200 transition-colors duration-200"
              />
            </div>
          </div>

          <div className="space-y-3">
            {filtered.map((session) => {
              const config = statusConfig[session.status];
              const Icon = config.icon;
              const progress = (session.completedModules.length / session.totalModules) * 100;

              return (
                <div
                  key={session.id}
                  className="p-4 rounded-xl border-2 border-custom-300 hover:border-primary-400 hover:shadow-md transition-all cursor-pointer"
                  onClick={() => {
                    setSelectedSession(session);
                    setShowModal(true);
                  }}
                >
                  <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-4">
                    <div className="flex-1 space-y-2">
                      <div className="flex flex-wrap items-center gap-2">
                        <span className="text-base font-bold text-primary-500">{session.id}</span>
                        <span
                          className={`text-xs font-semibold px-3 py-1 rounded-full ${config.color} flex items-center gap-1`}
                        >
                          <Icon className="w-3 h-3" />
                          {config.label}
                        </span>
                      </div>
                      <div className="flex items-center gap-2">
                        <HiOutlineUser className="w-4 h-4 text-custom-700" />
                        <p className="text-sm font-bold text-secondary-100">
                          {session.employeeName}
                        </p>
                        <span className="text-xs text-custom-700">({session.employeeId})</span>
                      </div>
                      <div className="flex flex-wrap gap-4 text-xs text-custom-700">
                        <span>Department: {session.department}</span>
                        <span>•</span>
                        <span>Role: {session.role}</span>
                        <span>•</span>
                        <span>Start: {session.startDate}</span>
                        {session.mentor && (
                          <>
                            <span>•</span>
                            <span>Mentor: {session.mentor}</span>
                          </>
                        )}
                      </div>
                      <div className="space-y-1">
                        <div className="flex justify-between text-xs">
                          <span className="text-custom-700">Progress</span>
                          <span className="font-semibold text-secondary-100">
                            {session.completedModules.length}/{session.totalModules} modules
                          </span>
                        </div>
                        <div className="w-full bg-custom-200 rounded-full h-2">
                          <div
                            className={`h-2 rounded-full ${
                              progress === 100
                                ? "bg-green-500"
                                : progress > 0
                                ? "bg-yellow-500"
                                : "bg-blue-500"
                            }`}
                            style={{ width: `${progress}%` }}
                          />
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        </Card>

        {/* View Session Modal */}
        {showModal && selectedSession && (
          <div className="fixed inset-0 bg-secondary-100/50 z-50 flex items-center justify-center p-4">
            <Card className="!p-6 max-w-3xl w-full max-h-[90vh] overflow-y-auto">
              <div className="flex items-start justify-between mb-4">
                <div>
                  <h3 className="text-xl font-bold text-secondary-100">{selectedSession.id}</h3>
                  <p className="text-sm text-custom-700 mt-1">
                    {selectedSession.employeeName} - {selectedSession.department}
                  </p>
                </div>
                <button
                  onClick={() => setShowModal(false)}
                  className="text-custom-700 hover:text-secondary-100 text-2xl"
                >
                  <HiOutlineX className="w-6 h-6" />
                </button>
              </div>

              <div className="space-y-4">
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <p className="text-sm font-semibold text-custom-700 mb-1">Employee ID</p>
                    <p className="text-base text-secondary-100">{selectedSession.employeeId}</p>
                  </div>
                  <div>
                    <p className="text-sm font-semibold text-custom-700 mb-1">Role</p>
                    <p className="text-base text-secondary-100">{selectedSession.role}</p>
                  </div>
                </div>

                <div>
                  <p className="text-sm font-semibold text-custom-700 mb-3">Training Modules</p>
                  <div className="space-y-2">
                    {orientationModules.map((module) => {
                      const isCompleted = selectedSession.completedModules.includes(module);
                      return (
                        <div
                          key={module}
                          className={`p-3 rounded-xl border-2 transition-all ${
                            isCompleted
                              ? "border-green-300 bg-green-50"
                              : "border-custom-300 bg-custom-50"
                          }`}
                        >
                          <div className="flex items-center justify-between">
                            <div className="flex items-center gap-2">
                              {isCompleted ? (
                                <HiOutlineCheckCircle className="w-5 h-5 text-green-600" />
                              ) : (
                                <HiOutlineClock className="w-5 h-5 text-custom-700" />
                              )}
                              <span className="text-sm font-semibold text-secondary-100">
                                {module}
                              </span>
                            </div>
                            {!isCompleted && selectedSession.status === "in-progress" && (
                              <button
                                onClick={() => handleCompleteModule(selectedSession.id, module)}
                                className="px-3 py-1 rounded-lg bg-green-500 text-white hover:bg-green-600 transition-colors text-xs font-semibold"
                              >
                                Mark Complete
                              </button>
                            )}
                          </div>
                        </div>
                      );
                    })}
                  </div>
                </div>

                {selectedSession.notes && (
                  <div>
                    <p className="text-sm font-semibold text-custom-700 mb-1">Notes</p>
                    <p className="text-base text-secondary-100">{selectedSession.notes}</p>
                  </div>
                )}
              </div>

              <button
                onClick={() => setShowModal(false)}
                className="w-full mt-6 px-4 py-2 rounded-xl border border-custom-300 hover:bg-custom-100 transition-colors text-sm font-semibold text-custom-700"
              >
                Close
              </button>
            </Card>
          </div>
        )}

        {/* New Session Modal */}
        {showNewModal && (
          <div className="fixed inset-0 bg-secondary-100/50 z-50 flex items-center justify-center p-4">
            <Card className="!p-6 max-w-2xl w-full max-h-[90vh] overflow-y-auto">
              <div className="flex items-center justify-between mb-6">
                <h3 className="text-2xl font-bold text-secondary-100">Schedule New Orientation</h3>
                <button
                  onClick={() => setShowNewModal(false)}
                  className="text-custom-700 hover:text-secondary-100 text-2xl"
                >
                  <HiOutlineX className="w-6 h-6" />
                </button>
              </div>

              <div className="space-y-4">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-semibold text-custom-700 mb-2">
                      Employee Name *
                    </label>
                    <input
                      type="text"
                      value={newSessionForm.employeeName}
                      onChange={(e) =>
                        setNewSessionForm({ ...newSessionForm, employeeName: e.target.value })
                      }
                      placeholder="Jean Uwimana"
                      className="w-full px-4 py-2 rounded-xl border border-custom-300 focus:outline-none focus:border-primary-500"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-semibold text-custom-700 mb-2">
                      Employee ID *
                    </label>
                    <input
                      type="text"
                      value={newSessionForm.employeeId}
                      onChange={(e) =>
                        setNewSessionForm({ ...newSessionForm, employeeId: e.target.value })
                      }
                      placeholder="EMP-2026-001"
                      className="w-full px-4 py-2 rounded-xl border border-custom-300 focus:outline-none focus:border-primary-500"
                    />
                  </div>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-semibold text-custom-700 mb-2">
                      Department *
                    </label>
                    <select
                      value={newSessionForm.department}
                      onChange={(e) =>
                        setNewSessionForm({ ...newSessionForm, department: e.target.value })
                      }
                      className="w-full px-4 py-2 rounded-xl border border-custom-300 focus:outline-none focus:border-primary-500"
                    >
                      <option value="">Select department...</option>
                      <option value="Composition">Composition</option>
                      <option value="Montage">Montage</option>
                      <option value="Printing">Printing</option>
                      <option value="Binding">Binding</option>
                      <option value="Packaging">Packaging</option>
                      <option value="Stock">Stock</option>
                      <option value="Sales">Sales</option>
                      <option value="Finance">Finance</option>
                    </select>
                  </div>
                  <div>
                    <label className="block text-sm font-semibold text-custom-700 mb-2">
                      Role *
                    </label>
                    <input
                      type="text"
                      value={newSessionForm.role}
                      onChange={(e) =>
                        setNewSessionForm({ ...newSessionForm, role: e.target.value })
                      }
                      placeholder="Printing Operator"
                      className="w-full px-4 py-2 rounded-xl border border-custom-300 focus:outline-none focus:border-primary-500"
                    />
                  </div>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-semibold text-custom-700 mb-2">
                      Start Date *
                    </label>
                    <input
                      type="date"
                      value={newSessionForm.startDate}
                      onChange={(e) =>
                        setNewSessionForm({ ...newSessionForm, startDate: e.target.value })
                      }
                      className="w-full px-4 py-2 rounded-xl border border-custom-300 focus:outline-none focus:border-primary-500"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-semibold text-custom-700 mb-2">
                      Mentor (Optional)
                    </label>
                    <input
                      type="text"
                      value={newSessionForm.mentor}
                      onChange={(e) =>
                        setNewSessionForm({ ...newSessionForm, mentor: e.target.value })
                      }
                      placeholder="Senior Operator - Paul"
                      className="w-full px-4 py-2 rounded-xl border border-custom-300 focus:outline-none focus:border-primary-500"
                    />
                  </div>
                </div>
              </div>

              <div className="flex gap-3 mt-6">
                <button
                  onClick={() => setShowNewModal(false)}
                  className="flex-1 px-4 py-2 rounded-xl border border-custom-300 hover:bg-custom-100 transition-colors text-sm font-semibold text-custom-700"
                >
                  Cancel
                </button>
                <button
                  onClick={handleCreateSession}
                  className="flex-1 px-4 py-2 rounded-xl bg-primary-500 text-white hover:bg-primary-600 transition-colors text-sm font-semibold"
                >
                  Schedule Orientation
                </button>
              </div>
            </Card>
          </div>
        )}
      </div>
    </DashboardLayout>
  );
}
