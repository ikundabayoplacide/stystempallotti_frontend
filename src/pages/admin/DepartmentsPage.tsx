import { useEffect, useRef, useState } from "react";
import {
  HiOutlineBriefcase,
  HiOutlineExclamationCircle,
  HiOutlinePencil,
  HiOutlinePlus,
  HiOutlineRefresh,
  HiOutlineTrash,
  HiOutlineUsers,
  HiOutlineX,
} from "react-icons/hi";
import { DashboardLayout } from "../../components";
import { Button, Card } from "../../components/ui";
import type { Department } from "../../store/services/departmentsService";
import {
  useCreateDepartmentMutation,
  useDeleteDepartmentMutation,
  useGetDepartmentByIdQuery,
  useGetDepartmentsQuery,
  useUpdateDepartmentMutation,
} from "../../store/services/departmentsService";
import { useGetJobsQuery } from "../../store/services/jobsService";
import type { JobState } from "../../store/services/jobsService";

const STATE_LABELS: Record<NonNullable<JobState>, string> = {
  "in-composition":    "In Composition",
  "in-montage":        "In Montage",
  "in-printing":       "In Printing",
  "in-binding":        "In Binding",
  "in-packaging":      "In Packaging",
  "quality-check":     "Quality Check",
  "composition-done":  "Composition Done",
  "montage-done":      "Montage Done",
  "printing-done":     "Printing Done",
  "binding-done":      "Binding Done",
  "packaging-done":    "Packaging Done",
  "qualitycheck-done": "Quality Check Done",
};

const STATE_COLORS: Record<NonNullable<JobState>, { bg: string; text: string }> = {
  "in-composition":    { bg: "bg-orange-100",  text: "text-orange-700" },
  "in-montage":        { bg: "bg-amber-100",   text: "text-amber-700" },
  "in-printing":       { bg: "bg-pink-100",    text: "text-pink-700" },
  "in-binding":        { bg: "bg-teal-100",    text: "text-teal-700" },
  "in-packaging":      { bg: "bg-cyan-100",    text: "text-cyan-700" },
  "quality-check":     { bg: "bg-purple-100",  text: "text-purple-700" },
  "composition-done":  { bg: "bg-green-100",   text: "text-green-700" },
  "montage-done":      { bg: "bg-green-100",   text: "text-green-700" },
  "printing-done":     { bg: "bg-green-100",   text: "text-green-700" },
  "binding-done":      { bg: "bg-green-100",   text: "text-green-700" },
  "packaging-done":    { bg: "bg-green-100",   text: "text-green-700" },
  "qualitycheck-done": { bg: "bg-green-100",   text: "text-green-700" },
};

function StateBadge({ state }: { state: JobState }) {
  if (!state) return <span className="text-xs text-custom-500 italic">—</span>;
  const label  = STATE_LABELS[state] ?? state;
  const colors = STATE_COLORS[state] ?? { bg: "bg-gray-100", text: "text-gray-700" };
  return (
    <span className={`px-2 py-0.5 rounded-full text-xs font-semibold ${colors.bg} ${colors.text}`}>
      {label}
    </span>
  );
}

// ─── Jobs Drawer ──────────────────────────────────────────────────────────────

const statusColor: Record<string, string> = {
  confirmed: "bg-yellow-100 text-yellow-700",
  "in-composition": "bg-blue-100 text-blue-700",
  "in-montage": "bg-blue-100 text-blue-700",
  "in-printing": "bg-primary-100 text-primary-700",
  "in-binding": "bg-primary-100 text-primary-700",
  "in-packaging": "bg-purple-100 text-purple-700",
  "quality-check": "bg-indigo-100 text-indigo-700",
  "ready-for-delivery": "bg-green-100 text-green-700",
  completed: "bg-green-100 text-green-700",
  delivered: "bg-green-100 text-green-700",
};

function JobsDrawer({ dept, jobs, onClose }: { dept: Department; jobs: any[]; onClose: () => void }) {
  return (
    <>
      <div className="fixed inset-0 bg-black/30 z-40" onClick={onClose} />
      <div className="fixed right-0 top-0 h-full w-full max-w-sm bg-white shadow-2xl z-50 flex flex-col font-[family-name:var(--font-family-primary)]">
        <div className="flex items-center justify-between px-6 py-4 border-b border-custom-200">
          <div>
            <h2 className="text-lg font-bold text-secondary-100">{dept.name}</h2>
            <p className="text-xs text-custom-500 mt-0.5">{jobs.length} active job{jobs.length !== 1 ? "s" : ""}</p>
          </div>
          <button onClick={onClose} className="text-custom-400 hover:text-custom-700 transition-colors">
            <HiOutlineX className="h-5 w-5" />
          </button>
        </div>
        <div className="flex-1 overflow-y-auto px-6 py-4">
          {jobs.length === 0 ? (
            <div className="text-center py-12">
              <HiOutlineBriefcase className="h-10 w-10 text-custom-300 mx-auto mb-2" />
              <p className="text-sm text-custom-500">No active jobs in this department.</p>
            </div>
          ) : (
            <ul className="space-y-2">
              {jobs.map((j) => (
                <li key={j.id} className="px-4 py-3 rounded-xl border border-custom-200 hover:bg-custom-50 transition-colors">
                  <div className="flex items-center justify-between mb-1">
                    <span className="text-sm font-bold text-primary-500">{j.jobNumber}</span>
                    <span className={`px-2 py-0.5 rounded-full text-xs font-semibold ${statusColor[j.status] ?? "bg-gray-100 text-gray-600"}`}>
                      {j.status.replace(/-/g, " ")}
                    </span>
                  </div>
                  <p className="text-sm text-secondary-100 font-medium">{j.title}</p>
                  <p className="text-xs text-custom-500 mt-0.5">{j.customer?.name ?? "—"}</p>
                  <div className="flex items-center justify-between mt-1.5">
                    {j.dueDate && <p className="text-xs text-custom-400">Due: {j.dueDate.slice(0, 10)}</p>}
                    <StateBadge state={j.state ?? null} />
                  </div>
                </li>
              ))}
            </ul>
          )}
        </div>
      </div>
    </>
  );
}

// ─── Worker Count Cell ───────────────────────────────────────────────────────

function WorkerCountCell({ deptId, onClick }: { deptId: string; onClick: () => void }) {
  const { data, isLoading } = useGetDepartmentByIdQuery(deptId);
  const count = data?.employees?.length ?? 0;
  return (
    <button
      onClick={onClick}
      className="flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-bold bg-green-100 text-green-700 hover:bg-green-200 transition-colors"
    >
      <HiOutlineUsers className="h-3.5 w-3.5" />
      {isLoading ? <HiOutlineRefresh className="h-3 w-3 animate-spin" /> : `${count} worker${count !== 1 ? "s" : ""}`}
    </button>
  );
}

function UserCountCell({ deptId, onClick }: { deptId: string; onClick: () => void }) {
  const { data, isLoading } = useGetDepartmentByIdQuery(deptId);
  const count = data?.users?.length ?? 0;
  return (
    <button
      onClick={onClick}
      className="flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-bold bg-blue-100 text-blue-700 hover:bg-blue-200 transition-colors"
    >
      <HiOutlineUsers className="h-3.5 w-3.5" />
      {isLoading ? <HiOutlineRefresh className="h-3 w-3 animate-spin" /> : `${count} user${count !== 1 ? "s" : ""}`}
    </button>
  );
}

// ─── Workers Drawer ───────────────────────────────────────────────────────────

function WorkersDrawer({ dept, onClose }: { dept: Department; onClose: () => void }) {
  const { data, isLoading } = useGetDepartmentByIdQuery(dept.id);
  const workers = data?.employees ?? [];
  const users = data?.users ?? [];

  return (
    <>
      <div className="fixed inset-0 bg-black/30 z-40" onClick={onClose} />
      <div className="fixed right-0 top-0 h-full w-full max-w-sm bg-white shadow-2xl z-50 flex flex-col font-[family-name:var(--font-family-primary)]">
        <div className="flex items-center justify-between px-6 py-4 border-b border-custom-200">
          <div>
            <h2 className="text-lg font-bold text-secondary-100">{dept.name}</h2>
            <p className="text-xs text-custom-500 mt-0.5">{workers.length} employee{workers.length !== 1 ? "s" : ""} · {users.length} user{users.length !== 1 ? "s" : ""}</p>
          </div>
          <button onClick={onClose} className="text-custom-400 hover:text-custom-700 transition-colors">
            <HiOutlineX className="h-5 w-5" />
          </button>
        </div>

        <div className="flex-1 overflow-y-auto px-6 py-4 space-y-6">
          {isLoading ? (
            <div className="flex items-center justify-center gap-2 py-12 text-custom-500">
              <HiOutlineRefresh className="h-5 w-5 animate-spin" />
              <span className="text-sm">Loading…</span>
            </div>
          ) : (
            <>
              {/* Employees */}
              <div>
                <p className="text-xs font-bold text-custom-500 uppercase tracking-wider mb-3">Employees ({workers.length})</p>
                {workers.length === 0 ? (
                  <p className="text-sm text-custom-400 italic">No employees assigned.</p>
                ) : (
                  <ul className="space-y-2">
                    {workers.map((w: any) => (
                      <li key={w.id} className="flex items-center justify-between px-4 py-3 rounded-xl border border-custom-200 hover:bg-custom-50 transition-colors">
                        <div className="flex items-center gap-3">
                          <div className="w-9 h-9 rounded-full bg-primary-100 flex items-center justify-center shrink-0">
                            <span className="text-sm font-bold text-primary-600">{w.fullName?.charAt(0).toUpperCase()}</span>
                          </div>
                          <div>
                            <p className="text-sm font-semibold text-secondary-100">{w.fullName}</p>
                            <p className="text-xs text-custom-500">{w.phoneNumber}</p>
                          </div>
                        </div>
                        <div className="flex flex-col items-end gap-1">
                          <span className={`px-2 py-0.5 rounded-full text-xs font-semibold ${
                            w.isActive ? "bg-green-100 text-green-700" : "bg-gray-100 text-gray-500"
                          }`}>
                            {w.isActive ? "Active" : "Inactive"}
                          </span>
                          <span className="text-xs text-custom-400">{w.contractType?.replace("_", " ") ?? "—"}</span>
                        </div>
                      </li>
                    ))}
                  </ul>
                )}
              </div>

              {/* Users */}
              <div>
                <p className="text-xs font-bold text-custom-500 uppercase tracking-wider mb-3">Users ({users.length})</p>
                {users.length === 0 ? (
                  <p className="text-sm text-custom-400 italic">No users assigned.</p>
                ) : (
                  <ul className="space-y-2">
                    {users.map((u: any) => (
                      <li key={u.id} className="flex items-center justify-between px-4 py-3 rounded-xl border border-custom-200 hover:bg-custom-50 transition-colors">
                        <div className="flex items-center gap-3">
                          <div className="w-9 h-9 rounded-full bg-blue-100 flex items-center justify-center shrink-0">
                            <span className="text-sm font-bold text-blue-600">{u.name?.charAt(0).toUpperCase()}</span>
                          </div>
                          <div>
                            <p className="text-sm font-semibold text-secondary-100">{u.name}</p>
                            <p className="text-xs text-custom-500">{u.email}</p>
                          </div>
                        </div>
                        <div className="flex flex-col items-end gap-1">
                          <span className={`px-2 py-0.5 rounded-full text-xs font-semibold ${
                            u.isActive ? "bg-green-100 text-green-700" : "bg-gray-100 text-gray-500"
                          }`}>
                            {u.isActive ? "Active" : "Inactive"}
                          </span>
                          <span className="text-xs text-custom-400">{u.role}</span>
                        </div>
                      </li>
                    ))}
                  </ul>
                )}
              </div>
            </>
          )}
        </div>
      </div>
    </>
  );
}

// ─── Modal ────────────────────────────────────────────────────────────────────

function DepartmentModal({
  dept,
  onClose,
}: {
  dept: Department | null; // null = create mode
  onClose: () => void;
}) {
  const [name, setName] = useState(dept?.name ?? "");
  const [description, setDescription] = useState(dept?.description ?? "");
  const [createDept, { isLoading: isCreating, error: createErr }] = useCreateDepartmentMutation();
  const [updateDept, { isLoading: isUpdating, error: updateErr }] = useUpdateDepartmentMutation();

  const isLoading = isCreating || isUpdating;
  const apiError = (createErr || updateErr) as any;

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (!name.trim()) return;
    try {
      if (dept) {
        await updateDept({ id: dept.id, name: name.trim(), description: description.trim() || undefined }).unwrap();
      } else {
        await createDept({ name: name.trim(), description: description.trim() || undefined }).unwrap();
      }
      onClose();
    } catch {
      // error shown below
    }
  }

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 backdrop-blur-sm p-4">
      <div className="bg-white rounded-2xl shadow-2xl w-full max-w-md">
        <div className="flex items-center justify-between px-6 py-4 border-b border-custom-200">
          <h2 className="text-lg font-bold text-secondary-100">
            {dept ? "Edit Department" : "New Department"}
          </h2>
          <button onClick={onClose} className="text-custom-400 hover:text-custom-700 transition-colors">
            <HiOutlineX className="h-5 w-5" />
          </button>
        </div>

        <form onSubmit={handleSubmit} className="p-6 space-y-4">
          <div>
            <label className="block text-sm font-semibold text-secondary-100 mb-1">
              Name <span className="text-red-500">*</span>
            </label>
            <input
              type="text"
              value={name}
              onChange={(e) => setName(e.target.value)}
              placeholder="e.g. Printing"
              required
              className="w-full px-3 py-2 rounded-lg border border-custom-300 bg-white text-sm focus:outline-none focus:ring-2 focus:ring-primary-500 transition-colors"
            />
          </div>

          <div>
            <label className="block text-sm font-semibold text-secondary-100 mb-1">Description</label>
            <textarea
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              rows={3}
              placeholder="Optional description…"
              className="w-full px-3 py-2 rounded-lg border border-custom-300 bg-white text-sm focus:outline-none focus:ring-2 focus:ring-primary-500 transition-colors resize-none"
            />
          </div>

          {apiError && (
            <div className="flex items-center gap-2 rounded-lg border border-red-300 bg-red-50 px-3 py-2 text-sm text-red-700">
              <HiOutlineExclamationCircle className="h-4 w-4 shrink-0" />
              {apiError?.data?.message ?? "Something went wrong. Please try again."}
            </div>
          )}

          <div className="flex justify-end gap-2 pt-1">
            <Button variant="outline" type="button" onClick={onClose} className="text-sm">
              Cancel
            </Button>
            <Button
              type="submit"
              disabled={!name.trim() || isLoading}
              className="flex items-center gap-2 text-sm"
            >
              {isLoading && <HiOutlineRefresh className="h-4 w-4 animate-spin" />}
              {dept ? "Save Changes" : "Create"}
            </Button>
          </div>
        </form>
      </div>
    </div>
  );
}

// ─── Delete Confirm ───────────────────────────────────────────────────────────

function DeleteModal({ dept, onClose }: { dept: Department; onClose: () => void }) {
  const [deleteDept, { isLoading, error }] = useDeleteDepartmentMutation();

  async function handleDelete() {
    try {
      await deleteDept(dept.id).unwrap();
      onClose();
    } catch {
      // error shown below
    }
  }

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 backdrop-blur-sm p-4">
      <div className="bg-white rounded-2xl shadow-2xl w-full max-w-sm">
        <div className="flex items-center justify-between px-6 py-4 border-b border-custom-200">
          <h2 className="text-lg font-bold text-secondary-100">Delete Department</h2>
          <button onClick={onClose} className="text-custom-400 hover:text-custom-700 transition-colors">
            <HiOutlineX className="h-5 w-5" />
          </button>
        </div>
        <div className="p-6 space-y-4">
          <p className="text-sm text-custom-700">
            Delete <span className="font-bold text-secondary-100">{dept.name}</span>? This cannot be undone.
            Jobs currently assigned to this department will become unassigned.
          </p>
          {error && (
            <div className="flex items-center gap-2 rounded-lg border border-red-300 bg-red-50 px-3 py-2 text-sm text-red-700">
              <HiOutlineExclamationCircle className="h-4 w-4 shrink-0" />
              {(error as any)?.data?.message ?? "Failed to delete department."}
            </div>
          )}
          <div className="flex justify-end gap-2">
            <Button variant="outline" onClick={onClose} className="text-sm">Cancel</Button>
            <button
              onClick={handleDelete}
              disabled={isLoading}
              className="flex items-center gap-2 px-4 py-2 rounded-lg bg-red-600 hover:bg-red-700 text-white text-sm font-semibold transition-colors disabled:opacity-50"
            >
              {isLoading ? <HiOutlineRefresh className="h-4 w-4 animate-spin" /> : <HiOutlineTrash className="h-4 w-4" />}
              {isLoading ? "Deleting…" : "Delete"}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}

// ─── Row action menu ──────────────────────────────────────────────────────────

function RowActions({
  dept,
  onEdit,
  onDelete,
}: {
  dept: Department;
  onEdit: (d: Department) => void;
  onDelete: (d: Department) => void;
}) {
  const [open, setOpen] = useState(false);
  const ref = useRef<HTMLDivElement>(null);

  useEffect(() => {
    function handler(e: MouseEvent) {
      if (ref.current && !ref.current.contains(e.target as Node)) setOpen(false);
    }
    document.addEventListener("mousedown", handler);
    return () => document.removeEventListener("mousedown", handler);
  }, []);

  return (
    <div ref={ref} className="relative inline-block">
      <button
        onClick={() => setOpen((v) => !v)}
        className="p-1.5 rounded-lg hover:bg-custom-100 text-custom-500 hover:text-secondary-100 transition-colors"
      >
        <svg className="h-5 w-5" fill="currentColor" viewBox="0 0 20 20">
          <circle cx="10" cy="4" r="1.5" /><circle cx="10" cy="10" r="1.5" /><circle cx="10" cy="16" r="1.5" />
        </svg>
      </button>
      {open && (
        <div className="absolute right-0 top-8 z-30 w-36 bg-white rounded-xl shadow-lg border border-custom-200 py-1 overflow-hidden">
          <button
            onClick={() => { setOpen(false); onEdit(dept); }}
            className="w-full flex items-center gap-2.5 px-4 py-2.5 text-sm font-semibold text-secondary-100 hover:bg-custom-50 transition-colors"
          >
            <HiOutlinePencil className="h-4 w-4" /> Edit
          </button>
          <button
            onClick={() => { setOpen(false); onDelete(dept); }}
            className="w-full flex items-center gap-2.5 px-4 py-2.5 text-sm font-semibold text-red-600 hover:bg-red-50 transition-colors"
          >
            <HiOutlineTrash className="h-4 w-4" /> Delete
          </button>
        </div>
      )}
    </div>
  );
}

// ─── Page ─────────────────────────────────────────────────────────────────────

export default function AdminDepartmentsPage({ userRole = "admin" }: { userRole?: string }) {
  const [showCreate, setShowCreate] = useState(false);
  const [editDept, setEditDept] = useState<Department | null>(null);
  const [deleteDept, setDeleteDept] = useState<Department | null>(null);
  const [workersDept, setWorkersDept] = useState<Department | null>(null);
  const [jobsDept, setJobsDept] = useState<Department | null>(null);

  const { data: departments = [], isLoading, isFetching } = useGetDepartmentsQuery();
  const { data: jobsData } = useGetJobsQuery({ limit: 500 });
  const allJobs = jobsData?.jobs ?? [];

  // Count active jobs per department
  const activeJobsMap: Record<string, number> = {};
  allJobs.forEach((j) => {
    if (j.departmentAssignedToId) {
      activeJobsMap[j.departmentAssignedToId] = (activeJobsMap[j.departmentAssignedToId] ?? 0) + 1;
    }
  });

  return (
    <DashboardLayout userRole={userRole as any} userName={userRole === "daf" ? "DAF" : "Admin"} notificationCount={0}>
      <div className="space-y-6 font-[family-name:var(--font-family-primary)]">
        {/* Header */}
        <div className="flex items-start justify-between gap-4 flex-wrap">
          <div>
            <h1 className="text-3xl font-bold text-secondary-100">Departments</h1>
            <p className="mt-1 text-sm text-custom-700">
              Manage production departments and their job assignments.
            </p>
          </div>
          <div className="flex items-center gap-3">
            {isFetching && (
              <HiOutlineRefresh className="h-4 w-4 text-custom-400 animate-spin" />
            )}
            <Button
              onClick={() => setShowCreate(true)}
              className="flex items-center gap-2 text-sm"
            >
              <HiOutlinePlus className="h-4 w-4" />
              New Department
            </Button>
          </div>
        </div>

        {/* Stats row */}
        <div className="grid grid-cols-2 sm:grid-cols-3 gap-4">
          <Card className="!p-4">
            <p className="text-xs text-custom-700">Total Departments</p>
            <p className="text-3xl font-bold text-secondary-100 mt-1">{departments.length}</p>
          </Card>
          <Card className="!p-4">
            <p className="text-xs text-custom-700">Total Active Jobs</p>
            <p className="text-3xl font-bold text-primary-500 mt-1">
              {Object.values(activeJobsMap).reduce((a, b) => a + b, 0)}
            </p>
          </Card>
          <Card className="!p-4">
            <p className="text-xs text-custom-700">Unassigned Jobs</p>
            <p className="text-3xl font-bold text-orange-500 mt-1">
              {allJobs.filter((j) => !j.departmentAssignedToId).length}
            </p>
          </Card>
        </div>

        {/* Departments table */}
        <Card className="!p-0 overflow-hidden">
          <div className="px-6 py-4 border-b border-custom-200 flex items-center justify-between">
            <h2 className="text-base font-bold text-secondary-100">All Departments</h2>
            <span className="text-xs text-custom-500">{departments.length} total</span>
          </div>

          {isLoading ? (
            <div className="flex items-center justify-center gap-2 py-16 text-custom-500">
              <HiOutlineRefresh className="h-5 w-5 animate-spin" />
              <span className="text-sm">Loading…</span>
            </div>
          ) : departments.length === 0 ? (
            <div className="py-16 text-center">
              <p className="text-sm font-semibold text-secondary-100">No departments yet</p>
              <p className="text-xs text-custom-500 mt-1">Click "New Department" to add one.</p>
            </div>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead className="bg-custom-50 border-b border-custom-200">
                  <tr>
                    {["Name", "Description", "Workers", "Users", "Active Jobs", "Actions"].map((h) => (
                      <th
                        key={h}
                        className={`px-6 py-3 text-xs font-bold text-secondary-100 uppercase tracking-wider ${h === "Actions" ? "text-right" : "text-left"}`}
                      >
                        {h}
                      </th>
                    ))}
                  </tr>
                </thead>
                <tbody className="bg-white divide-y divide-custom-200">
                  {departments.map((dept) => {
                    const active = activeJobsMap[dept.id] ?? 0;
                    return (
                      <tr key={dept.id} className="hover:bg-custom-50 transition-colors">
                        <td className="px-6 py-4">
                          <span className="text-sm font-bold text-secondary-100">{dept.name}</span>
                        </td>
                        <td className="px-6 py-4">
                          <span className="text-sm text-custom-700">
                            {dept.description ?? <span className="italic text-custom-400">—</span>}
                          </span>
                        </td>
                        <td className="px-6 py-4">
                          <WorkerCountCell deptId={dept.id} onClick={() => setWorkersDept(dept)} />
                        </td>
                        <td className="px-6 py-4">
                          <UserCountCell deptId={dept.id} onClick={() => setWorkersDept(dept)} />
                        </td>
                        <td className="px-6 py-4">
                          <button
                            onClick={() => setJobsDept(dept)}
                            className={`inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-bold transition-colors ${
                              active > 0 ? "bg-primary-100 text-primary-700 hover:bg-primary-200" : "bg-gray-100 text-gray-500 cursor-default"
                            }`}
                          >
                            <HiOutlineBriefcase className="h-3.5 w-3.5" />
                            {active} job{active !== 1 ? "s" : ""}
                          </button>
                        </td>
                        <td className="px-6 py-4 text-right">
                          <RowActions
                            dept={dept}
                            onEdit={(d) => setEditDept(d)}
                            onDelete={(d) => setDeleteDept(d)}
                          />
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>
          )}
        </Card>
      </div>

      {/* Modals */}
      {jobsDept && (
        <JobsDrawer
          dept={jobsDept}
          jobs={allJobs.filter((j) => j.departmentAssignedToId === jobsDept.id)}
          onClose={() => setJobsDept(null)}
        />
      )}
      {workersDept && (
        <WorkersDrawer dept={workersDept} onClose={() => setWorkersDept(null)} />
      )}
      {showCreate && (
        <DepartmentModal dept={null} onClose={() => setShowCreate(false)} />
      )}
      {editDept && (
        <DepartmentModal dept={editDept} onClose={() => setEditDept(null)} />
      )}
      {deleteDept && (
        <DeleteModal dept={deleteDept} onClose={() => setDeleteDept(null)} />
      )}
    </DashboardLayout>
  );
}
