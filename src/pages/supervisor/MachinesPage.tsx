import { useMemo, useState } from "react";
import {
  HiOutlineCog,
  HiOutlinePencil,
  HiOutlinePlus,
  HiOutlineRefresh,
  HiOutlineSearch,
  HiOutlineSwitchHorizontal,
  HiOutlineTrash,
  HiOutlineUserAdd,
  HiOutlineUsers,
  HiOutlineX,
} from "react-icons/hi";
import { useSelector } from "react-redux";
import { toast } from "react-toastify";
import { DashboardLayout } from "../../components";
import { Card } from "../../components/ui";
import { useGetAllEmployeesQuery } from "../../store/services/employeesService";
import {
  useAssignWorkerMutation,
  useCreateMachineMutation,
  useGetMachineAssignmentsQuery,
  useGetMachinesQuery,
  useReassignWorkerMutation,
  useRemoveWorkerMutation,
  useUpdateMachineMutation,
  type Machine,
  type MachineAssignment,
  type MachineStatus,
} from "../../store/services/machinesService";
import { useGetDepartmentsQuery } from "../../store/services/departmentsService";
import type { RootState } from "../../store";

// ─── Constants ────────────────────────────────────────────────────────────────

const PAGE_SIZE = 6;

const STATUS_COLORS: Record<MachineStatus, string> = {
  active:      "bg-emerald-100 text-emerald-700",
  maintenance: "bg-yellow-100 text-yellow-700",
  inactive:    "bg-red-100 text-red-700",
};

const STATUS_LABELS: Record<MachineStatus, string> = {
  active:      "Active",
  maintenance: "Maintenance",
  inactive:    "Inactive",
};

const cls = "w-full px-3 py-2 rounded-xl border border-custom-300 bg-style-500 text-secondary-100 text-sm focus:outline-none focus:border-primary-400 transition-colors";

// ─── Machine Form Modal ───────────────────────────────────────────────────────

function MachineFormModal({
  machine,
  departmentId,
  onClose,
  onSuccess,
}: {
  machine?: Machine;
  departmentId?: string;
  onClose: () => void;
  onSuccess: () => void;
}) {
  const isEdit = !!machine;
  const [create, { isLoading: creating }] = useCreateMachineMutation();
  const [update, { isLoading: updating }] = useUpdateMachineMutation();

  const [form, setForm] = useState({
    name:        machine?.name        ?? "",
    description: machine?.description ?? "",
    status:      (machine?.status     ?? "active") as MachineStatus,
    note:        machine?.note        ?? "",
  });

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!form.name.trim()) { toast.error("Machine name is required"); return; }
    try {
      if (isEdit) {
        await update({ id: machine!.id, ...form }).unwrap();
        toast.success("Machine updated");
      } else {
        await create({ ...form, departmentId }).unwrap();
        toast.success("Machine created");
      }
      onSuccess();
    } catch (err: any) {
      toast.error(err?.data?.message ?? "Failed to save machine");
    }
  };

  return (
    <div className="fixed inset-0 bg-secondary-100/50 z-50 flex items-start justify-center p-4 overflow-y-auto">
      <Card className="!p-6 max-w-md w-full my-8">
        <div className="flex items-center justify-between mb-5">
          <h3 className="text-xl font-bold text-secondary-100">
            {isEdit ? "Edit Machine" : "Add Machine"}
          </h3>
          <button onClick={onClose} className="text-custom-700 hover:text-secondary-100">
            <HiOutlineX className="w-6 h-6" />
          </button>
        </div>
        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label className="block text-xs font-semibold text-secondary-100 mb-1">Name *</label>
            <input
              value={form.name}
              onChange={(e) => setForm((p) => ({ ...p, name: e.target.value }))}
              placeholder="e.g. GTO, KORS…"
              className={cls}
            />
          </div>
          <div>
            <label className="block text-xs font-semibold text-secondary-100 mb-1">Status</label>
            <select
              value={form.status}
              onChange={(e) => setForm((p) => ({ ...p, status: e.target.value as MachineStatus }))}
              className={cls}
            >
              <option value="active">Active</option>
              <option value="maintenance">Maintenance</option>
              <option value="inactive">Inactive</option>
            </select>
          </div>
          <div>
            <label className="block text-xs font-semibold text-secondary-100 mb-1">Description</label>
            <input
              value={form.description}
              onChange={(e) => setForm((p) => ({ ...p, description: e.target.value }))}
              placeholder="Optional description"
              className={cls}
            />
          </div>
          <div>
            <label className="block text-xs font-semibold text-secondary-100 mb-1">Note</label>
            <textarea
              value={form.note}
              onChange={(e) => setForm((p) => ({ ...p, note: e.target.value }))}
              rows={2}
              placeholder="Optional note…"
              className="w-full px-3 py-2 rounded-xl border border-custom-300 bg-style-500 text-secondary-100 text-sm focus:outline-none focus:border-primary-400 transition-colors resize-none"
            />
          </div>
          <div className="flex gap-3 justify-end pt-2 border-t border-custom-300">
            <button type="button" onClick={onClose}
              className="px-4 py-2 rounded-xl border border-custom-300 text-sm font-semibold text-secondary-100 hover:bg-custom-100 transition-colors">
              Cancel
            </button>
            <button type="submit" disabled={creating || updating}
              className="px-4 py-2 rounded-xl bg-primary-500 text-white text-sm font-semibold hover:bg-primary-600 disabled:opacity-40 transition-colors">
              {creating || updating ? "Saving…" : isEdit ? "Save Changes" : "Create"}
            </button>
          </div>
        </form>
      </Card>
    </div>
  );
}

// ─── Assign Worker Modal ──────────────────────────────────────────────────────

function AssignWorkerModal({
  machine,
  onClose,
}: {
  machine: Machine;
  onClose: () => void;
}) {
  const [employeeId, setEmployeeId] = useState("");
  const [note, setNote]             = useState("");
  const [confirmRemove, setConfirmRemove] = useState<{ assignmentId: string; name: string } | null>(null);
  const [removing, setRemoving]     = useState(false);
  // reassign state: which assignment row is open + selected new employee
  const [reassignRow, setReassignRow] = useState<string | null>(null); // assignmentId
  const [newEmployeeId, setNewEmployeeId] = useState("");
  const [reassigning, setReassigning]    = useState(false);

  const { data: assignments = [], isLoading: loadingAssignments, refetch } =
    useGetMachineAssignmentsQuery(machine.id);

  const { data: empRes } = useGetAllEmployeesQuery({ isActive: true, limit: 500 });
  const allEmployees = empRes?.data ?? [];

  // Employees not yet assigned to this machine
  const assignedIds = new Set(assignments.map((a) => a.employeeId));
  const available   = allEmployees.filter((e) => !assignedIds.has(e.id));

  const [assign,   { isLoading: assigning }] = useAssignWorkerMutation();
  const [remove]                             = useRemoveWorkerMutation();
  const [reassign]                           = useReassignWorkerMutation();

  const handleAssign = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!employeeId) { toast.error("Select an employee"); return; }
    try {
      await assign({ machineId: machine.id, employeeId, note: note.trim() || undefined }).unwrap();
      toast.success("Worker assigned");
      setEmployeeId(""); setNote("");
      refetch();
    } catch (err: any) {
      toast.error(err?.data?.message ?? "Failed to assign worker");
    }
  };

  const handleConfirmRemove = async () => {
    if (!confirmRemove) return;
    setRemoving(true);
    try {
      await remove({ assignmentId: confirmRemove.assignmentId, machineId: machine.id }).unwrap();
      toast.success("Worker removed");
      setConfirmRemove(null);
      refetch();
    } catch (err: any) {
      toast.error(err?.data?.message ?? "Failed to remove worker");
    } finally {
      setRemoving(false);
    }
  };

  const handleReassign = async (assignmentId: string) => {
    if (!newEmployeeId) { toast.error("Select a replacement employee"); return; }
    setReassigning(true);
    try {
      await reassign({ assignmentId, machineId: machine.id, newEmployeeId }).unwrap();
      toast.success("Worker reassigned");
      setReassignRow(null);
      setNewEmployeeId("");
      refetch();
    } catch (err: any) {
      toast.error(err?.data?.message ?? "Failed to reassign worker");
    } finally {
      setReassigning(false);
    }
  };

  // For a given assignment row, employees available as replacements = everyone except
  // the current worker AND everyone else already assigned to this machine
  const reassignOptions = (currentEmployeeId: string) =>
    allEmployees.filter((e) => e.id !== currentEmployeeId && !assignedIds.has(e.id));

  return (
    <div className="fixed inset-0 bg-secondary-100/50 z-50 flex items-start justify-center p-4 overflow-y-auto">
      <Card className="!p-6 max-w-lg w-full my-8">
        <div className="flex items-center justify-between mb-5">
          <div>
            <h3 className="text-xl font-bold text-secondary-100">Manage Workers</h3>
            <p className="text-sm text-custom-700 mt-0.5">{machine.name}</p>
          </div>
          <button onClick={onClose} className="text-custom-700 hover:text-secondary-100">
            <HiOutlineX className="w-6 h-6" />
          </button>
        </div>

        {/* Assign form */}
        <form onSubmit={handleAssign} className="space-y-3 mb-6">
          <p className="text-xs font-bold text-secondary-100 uppercase tracking-wide">Assign New Worker</p>
          {available.length === 0 && !loadingAssignments ? (
            <p className="text-xs text-custom-700 py-2">All active employees are already assigned to this machine.</p>
          ) : (
            <>
              <div className="flex gap-2">
                <select
                  value={employeeId}
                  onChange={(e) => setEmployeeId(e.target.value)}
                  className="flex-1 px-3 py-2 rounded-xl border border-custom-300 bg-style-500 text-secondary-100 text-sm focus:outline-none focus:border-primary-400 transition-colors"
                >
                  <option value="">Select employee…</option>
                  {available.map((emp) => (
                    <option key={emp.id} value={emp.id}>
                      {emp.fullName}{emp.department ? ` — ${emp.department.name}` : ""}
                    </option>
                  ))}
                </select>
                <button
                  type="submit"
                  disabled={!employeeId || assigning}
                  className="flex items-center gap-1.5 px-4 py-2 rounded-xl bg-primary-500 text-white text-sm font-semibold hover:bg-primary-600 disabled:opacity-40 transition-colors"
                >
                  <HiOutlineUserAdd className="w-4 h-4" />
                  {assigning ? "…" : "Assign"}
                </button>
              </div>
              <input
                value={note}
                onChange={(e) => setNote(e.target.value)}
                placeholder="Optional note"
                className={cls}
              />
            </>
          )}
        </form>

        {/* Current workers */}
        <div className="space-y-2">
          <p className="text-xs font-bold text-secondary-100 uppercase tracking-wide">
            Assigned Workers ({assignments.length})
          </p>
          {loadingAssignments ? (
            <p className="text-sm text-custom-700 py-4 text-center">Loading…</p>
          ) : assignments.length === 0 ? (
            <div className="py-6 text-center">
              <HiOutlineUsers className="w-8 h-8 text-custom-400 mx-auto mb-2" />
              <p className="text-sm text-secondary-100 font-semibold">No workers assigned</p>
            </div>
          ) : (
            assignments.map((a: MachineAssignment) => {
              const isReassigning = reassignRow === a.id;
              const options = reassignOptions(a.employeeId);
              return (
                <div key={a.id} className="rounded-xl border border-custom-200 bg-custom-50 overflow-hidden">
                  {/* Worker row */}
                  <div className="flex items-center justify-between px-4 py-3">
                    <div>
                      <p className="text-sm font-semibold text-secondary-100">
                        {a.employee?.fullName ?? "—"}
                      </p>
                      <p className="text-xs text-custom-700">
                        {a.employee?.department?.name ?? a.employee?.phoneNumber ?? "—"}
                        {a.employee?.department?.name && a.employee?.phoneNumber ? ` · ${a.employee.phoneNumber}` : ""}
                      </p>
                      {a.note && <p className="text-xs text-custom-500 italic mt-0.5">"{a.note}"</p>}
                      <p className="text-xs text-custom-400 mt-0.5">
                        Assigned {new Date(a.assignedAt).toLocaleDateString("en-RW", { day: "2-digit", month: "short", year: "numeric" })}
                      </p>
                    </div>
                    <div className="flex items-center gap-1.5 shrink-0">
                      {/* Reassign toggle */}
                      <button
                        onClick={() => {
                          setReassignRow(isReassigning ? null : a.id);
                          setNewEmployeeId("");
                        }}
                        title="Reassign to different worker"
                        className={`p-1.5 rounded-lg transition-colors ${
                          isReassigning
                            ? "bg-amber-100 text-amber-600 hover:bg-amber-200"
                            : "bg-blue-50 text-blue-600 hover:bg-blue-100"
                        }`}
                      >
                        <HiOutlineSwitchHorizontal className="w-4 h-4" />
                      </button>
                      {/* Remove */}
                      <button
                        onClick={() => setConfirmRemove({ assignmentId: a.id, name: a.employee?.fullName ?? "this worker" })}
                        disabled={removing}
                        className="p-1.5 rounded-lg bg-red-50 text-red-500 hover:bg-red-100 transition-colors disabled:opacity-40"
                        title="Remove"
                      >
                        <HiOutlineTrash className="w-4 h-4" />
                      </button>
                    </div>
                  </div>

                  {/* Inline reassign panel */}
                  {isReassigning && (
                    <div className="px-4 pb-3 pt-0 border-t border-custom-200 bg-style-500 space-y-2">
                      <p className="text-xs font-semibold text-secondary-100 pt-2">
                        Replace <span className="text-primary-500">{a.employee?.fullName}</span> with:
                      </p>
                      <div className="flex gap-2">
                        <select
                          value={newEmployeeId}
                          onChange={(e) => setNewEmployeeId(e.target.value)}
                          className="flex-1 px-3 py-2 rounded-xl border border-custom-300 bg-style-500 text-secondary-100 text-sm focus:outline-none focus:border-primary-400 transition-colors"
                        >
                          <option value="">Select replacement…</option>
                          {options.map((emp) => (
                            <option key={emp.id} value={emp.id}>
                              {emp.fullName}{emp.department ? ` — ${emp.department.name}` : ""}
                            </option>
                          ))}
                        </select>
                        <button
                          onClick={() => handleReassign(a.id)}
                          disabled={!newEmployeeId || reassigning}
                          className="flex items-center gap-1.5 px-4 py-2 rounded-xl bg-amber-500 text-white text-sm font-semibold hover:bg-amber-600 disabled:opacity-40 transition-colors"
                        >
                          {reassigning
                            ? <HiOutlineRefresh className="w-4 h-4 animate-spin" />
                            : <HiOutlineSwitchHorizontal className="w-4 h-4" />}
                          {reassigning ? "…" : "Reassign"}
                        </button>
                      </div>
                      {options.length === 0 && (
                        <p className="text-xs text-custom-700">No other employees available for reassignment.</p>
                      )}
                    </div>
                  )}
                </div>
              );
            })
          )}
        </div>

        <button
          onClick={onClose}
          className="mt-5 w-full px-4 py-2 rounded-xl border border-custom-300 text-sm font-semibold text-secondary-100 hover:bg-custom-100 transition-colors"
        >
          Close
        </button>
      </Card>

      {/* Remove confirmation modal */}
      {confirmRemove && (
        <div className="fixed inset-0 bg-secondary-100/60 z-60 flex items-center justify-center p-4">
          <Card className="!p-6 max-w-sm w-full">
            <div className="flex items-start gap-3 mb-4">
              <div className="w-10 h-10 rounded-xl bg-red-100 flex items-center justify-center shrink-0">
                <HiOutlineTrash className="w-5 h-5 text-red-500" />
              </div>
              <div>
                <h3 className="text-base font-bold text-secondary-100">Remove Worker</h3>
                <p className="text-sm text-custom-700 mt-1">
                  Remove <span className="font-semibold text-secondary-100">{confirmRemove.name}</span> from <span className="font-semibold text-secondary-100">{machine.name}</span>?
                </p>
              </div>
            </div>
            <div className="flex gap-3 justify-end">
              <button
                onClick={() => setConfirmRemove(null)}
                disabled={removing}
                className="px-4 py-2 rounded-xl border border-custom-300 text-sm font-semibold text-secondary-100 hover:bg-custom-100 transition-colors disabled:opacity-40"
              >
                Cancel
              </button>
              <button
                onClick={handleConfirmRemove}
                disabled={removing}
                className="flex items-center gap-2 px-4 py-2 rounded-xl bg-red-500 text-white text-sm font-semibold hover:bg-red-600 disabled:opacity-40 transition-colors"
              >
                {removing ? <HiOutlineRefresh className="w-4 h-4 animate-spin" /> : <HiOutlineTrash className="w-4 h-4" />}
                {removing ? "Removing…" : "Yes, Remove"}
              </button>
            </div>
          </Card>
        </div>
      )}
    </div>
  );
}

// ─── Machine Card ─────────────────────────────────────────────────────────────

function MachineCard({
  machine,
  onEdit,
  onManageWorkers,
}: {
  machine: Machine;
  onEdit: (m: Machine) => void;
  onManageWorkers: (m: Machine) => void;
}) {
  const { data: assignments = [], isLoading: loadingAssignments } =
    useGetMachineAssignmentsQuery(machine.id);

  const workerCount = loadingAssignments ? (machine.workers?.length ?? 0) : assignments.length;

  return (
    <Card className="!p-5 flex flex-col gap-4">
      <div className="flex items-start justify-between gap-2">
        <div className="flex items-center gap-3 min-w-0">
          <div className="w-10 h-10 rounded-xl bg-primary-100 flex items-center justify-center shrink-0">
            <HiOutlineCog className="w-5 h-5 text-primary-600" />
          </div>
          <div className="min-w-0">
            <p className="text-base font-bold text-secondary-100 truncate">{machine.name}</p>
            {machine.description && (
              <p className="text-xs text-custom-700 truncate">{machine.description}</p>
            )}
          </div>
        </div>
        <span className={`text-xs font-semibold px-2 py-0.5 rounded-full shrink-0 ${STATUS_COLORS[machine.status]}`}>
          {STATUS_LABELS[machine.status]}
        </span>
      </div>

      {machine.note && (
        <p className="text-xs text-custom-500 italic border-l-2 border-custom-200 pl-2">
          {machine.note}
        </p>
      )}

      {/* Assigned workers list */}
      {!loadingAssignments && assignments.length > 0 && (
        <div className="space-y-1">
          {assignments.map((a) => (
            <div key={a.id} className="flex items-center gap-2 px-2 py-1 rounded-lg bg-custom-50 text-xs">
              <div className="w-5 h-5 rounded-full bg-primary-100 flex items-center justify-center shrink-0">
                <span className="text-primary-600 font-bold text-[10px]">
                  {(a.employee?.fullName ?? "?").charAt(0).toUpperCase()}
                </span>
              </div>
              <span className="font-semibold text-secondary-100 truncate">{a.employee?.fullName ?? "—"}</span>
              {a.employee?.department?.name && (
                <span className="text-custom-500 truncate">{a.employee.department.name}</span>
              )}
            </div>
          ))}
        </div>
      )}

      <div className="flex items-center justify-between text-xs text-custom-700">
        <span className="flex items-center gap-1">
          <HiOutlineUsers className="w-3.5 h-3.5" />
          {workerCount} worker{workerCount !== 1 ? "s" : ""} assigned
        </span>
        <span>{new Date(machine.createdAt).toLocaleDateString("en-RW", { day: "2-digit", month: "short", year: "numeric" })}</span>
      </div>

      <div className="flex gap-2 pt-1 border-t border-custom-200">
        <button
          onClick={() => onManageWorkers(machine)}
          className="flex-1 flex items-center justify-center gap-1.5 px-3 py-2 rounded-xl bg-primary-50 text-primary-600 text-xs font-semibold hover:bg-primary-100 transition-colors"
        >
          <HiOutlineUsers className="w-4 h-4" /> Workers
        </button>
        <button
          onClick={() => onEdit(machine)}
          className="flex items-center justify-center gap-1.5 px-3 py-2 rounded-xl bg-custom-100 text-secondary-100 text-xs font-semibold hover:bg-custom-200 transition-colors"
        >
          <HiOutlinePencil className="w-4 h-4" /> Edit
        </button>
      </div>
    </Card>
  );
}

// ─── Main Page ────────────────────────────────────────────────────────────────

export default function MachinesPage() {
  const currentUser = useSelector((state: RootState) => state.auth.user);
  const myDeptId    = currentUser?.departmentId;
  const { data: departments = [] } = useGetDepartmentsQuery();
  const myDept = departments.find((d) => d.id === myDeptId);

  return <MachinesContent departmentId={myDeptId ?? undefined} deptName={myDept?.name} />;
}

export function MachinesContent({ departmentId, deptName }: { departmentId?: string; deptName?: string }) {
  const [search, setSearch]           = useState("");
  const [statusFilter, setStatusFilter] = useState<MachineStatus | "">("");
  const [page, setPage]               = useState(1);
  const [showForm, setShowForm]       = useState(false);
  const [editMachine, setEditMachine] = useState<Machine | null>(null);
  const [workersMachine, setWorkersMachine] = useState<Machine | null>(null);

  const { data: machines = [], isLoading, refetch } = useGetMachinesQuery(
    departmentId ? { departmentId } : undefined
  );

  const filtered = useMemo(() => {
    const q = search.trim().toLowerCase();
    return machines.filter((m) => {
      if (statusFilter && m.status !== statusFilter) return false;
      if (q && !m.name.toLowerCase().includes(q) && !(m.description ?? "").toLowerCase().includes(q)) return false;
      return true;
    });
  }, [machines, search, statusFilter]);

  const totalPages = Math.max(1, Math.ceil(filtered.length / PAGE_SIZE));
  const paginated  = filtered.slice((page - 1) * PAGE_SIZE, page * PAGE_SIZE);

  const activeCount      = machines.filter((m) => m.status === "active").length;
  const maintenanceCount = machines.filter((m) => m.status === "maintenance").length;
  const inactiveCount    = machines.filter((m) => m.status === "inactive").length;

  const openEdit = (m: Machine) => { setEditMachine(m); setShowForm(true); };

  return (
    <DashboardLayout>
      <div className="space-y-6 font-[family-name:var(--font-family-primary)]">

        {/* Header */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-primary-100 flex items-center justify-center">
              <HiOutlineCog className="w-5 h-5 text-primary-600" />
            </div>
            <div>
              <h1 className="text-2xl md:text-3xl font-bold text-secondary-100">Machines</h1>
              <p className="text-sm text-custom-700 mt-0.5">Manage machines{deptName ? ` for ${deptName}` : ""} and worker assignments</p>
            </div>
          </div>
          <div className="flex items-center gap-2">
            <button onClick={() => refetch()}
              className="p-2 rounded-xl border border-custom-300 hover:bg-custom-100 transition-colors text-custom-700">
              <HiOutlineRefresh className={`w-4 h-4 ${isLoading ? "animate-spin" : ""}`} />
            </button>
            <button
              onClick={() => { setEditMachine(null); setShowForm(true); }}
              className="flex items-center gap-2 px-4 py-2 rounded-xl bg-primary-500 text-white text-sm font-semibold hover:bg-primary-600 transition-colors"
            >
              <HiOutlinePlus className="w-4 h-4" /> Add Machine
            </button>
          </div>
        </div>

        {/* Summary cards */}
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
          {[
            { label: "Total",       value: machines.length,   color: "text-secondary-100" },
            { label: "Active",      value: activeCount,       color: "text-emerald-600"   },
            { label: "Maintenance", value: maintenanceCount,  color: "text-yellow-600"    },
            { label: "Inactive",    value: inactiveCount,     color: "text-red-600"       },
          ].map(({ label, value, color }) => (
            <Card key={label} className="!p-4 text-center">
              <p className="text-xs text-custom-700 mb-1">{label}</p>
              <p className={`text-2xl font-bold ${color}`}>{isLoading ? "—" : value}</p>
            </Card>
          ))}
        </div>

        {/* Search + filter */}
        <div className="flex flex-wrap items-center gap-3">
          <div className="relative flex-1 min-w-48">
            <HiOutlineSearch className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-custom-700" />
            <input
              value={search}
              onChange={(e) => { setSearch(e.target.value); setPage(1); }}
              placeholder="Search machines…"
              className="w-full pl-9 pr-4 py-2 rounded-xl border border-custom-300 bg-style-500 text-secondary-100 text-sm placeholder:text-custom-400 focus:outline-none focus:border-primary-400 transition-colors"
            />
          </div>
          <select
            value={statusFilter}
            onChange={(e) => { setStatusFilter(e.target.value as MachineStatus | ""); setPage(1); }}
            className="px-3 py-2 rounded-xl border border-custom-300 bg-style-500 text-secondary-100 text-sm focus:outline-none focus:border-primary-400 transition-colors"
          >
            <option value="">All statuses</option>
            <option value="active">Active</option>
            <option value="maintenance">Maintenance</option>
            <option value="inactive">Inactive</option>
          </select>
        </div>

        {/* Grid */}
        {isLoading ? (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
            {Array.from({ length: 6 }).map((_, i) => (
              <Card key={i} className="!p-5 animate-pulse h-44">
                <div className="h-4 w-1/2 bg-custom-200 rounded mb-3" />
                <div className="h-3 w-3/4 bg-custom-200 rounded mb-2" />
                <div className="h-3 w-1/3 bg-custom-200 rounded" />
              </Card>
            ))}
          </div>
        ) : filtered.length === 0 ? (
          <Card className="!p-12 text-center">
            <HiOutlineCog className="w-10 h-10 text-custom-400 mx-auto mb-3" />
            <p className="text-secondary-100 font-semibold">
              {search || statusFilter ? "No machines match the filters" : "No machines yet"}
            </p>
            <p className="text-sm text-custom-700 mt-1">
              {search || statusFilter
                ? "Try adjusting the search or status filter."
                : 'Click "Add Machine" to register the first machine.'}
            </p>
          </Card>
        ) : (
          <>
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
              {paginated.map((m) => (
                <MachineCard
                  key={m.id}
                  machine={m}
                  onEdit={openEdit}
                  onManageWorkers={setWorkersMachine}
                />
              ))}
            </div>

            {/* Pagination */}
            {filtered.length > PAGE_SIZE && (
              <div className="flex items-center justify-between">
                <p className="text-xs text-custom-700">
                  Showing{" "}
                  <span className="font-semibold text-secondary-100">
                    {(page - 1) * PAGE_SIZE + 1}–{Math.min(page * PAGE_SIZE, filtered.length)}
                  </span>{" "}
                  of <span className="font-semibold text-secondary-100">{filtered.length}</span> machines
                </p>
                <div className="flex items-center gap-1">
                  <button onClick={() => setPage((p) => Math.max(1, p - 1))} disabled={page === 1}
                    className="px-3 py-1.5 rounded-lg border border-custom-300 text-xs font-semibold text-secondary-100 hover:bg-custom-100 disabled:opacity-40 transition-colors">
                    Prev
                  </button>
                  {Array.from({ length: totalPages }, (_, i) => i + 1).map((n) => (
                    <button key={n} onClick={() => setPage(n)}
                      className={`w-8 h-8 rounded-lg text-xs font-bold transition-colors ${
                        n === page ? "bg-primary-500 text-white" : "border border-custom-300 text-secondary-100 hover:bg-custom-100"
                      }`}>
                      {n}
                    </button>
                  ))}
                  <button onClick={() => setPage((p) => Math.min(totalPages, p + 1))} disabled={page === totalPages}
                    className="px-3 py-1.5 rounded-lg border border-custom-300 text-xs font-semibold text-secondary-100 hover:bg-custom-100 disabled:opacity-40 transition-colors">
                    Next
                  </button>
                </div>
              </div>
            )}
          </>
        )}
      </div>

      {/* Modals */}
      {showForm && (
        <MachineFormModal
          machine={editMachine ?? undefined}
          departmentId={departmentId}
          onClose={() => { setShowForm(false); setEditMachine(null); }}
          onSuccess={() => { setShowForm(false); setEditMachine(null); refetch(); }}
        />
      )}
      {workersMachine && (
        <AssignWorkerModal
          machine={workersMachine}
          onClose={() => setWorkersMachine(null)}
        />
      )}
    </DashboardLayout>
  );
}
