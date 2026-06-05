import { useState } from "react";
import {
  HiOutlinePlus,
  HiOutlineSearch,
  HiOutlinePencil,
  HiOutlineTrash,
  HiOutlineRefresh,
  HiOutlineOfficeBuilding,
  HiOutlineX,
} from "react-icons/hi";
import { DashboardLayout } from "../../components";
import { Button, Card } from "../../components/ui";
import { useAuth } from "../../context/AuthContext";
import {
  useGetAllEmployeesQuery,
  useCreateEmployeeMutation,
  useUpdateEmployeeMutation,
  useDeleteEmployeeMutation,
  useToggleEmployeeActiveMutation,
  useAssignDepartmentMutation,
} from "../../store/services/employeesService";
import { useGetDepartmentsQuery } from "../../store/services/departmentsService";

export default function EmployeesPage() {
  const { userName } = useAuth();
  const [search, setSearch] = useState("");
  const [page, setPage] = useState(1);
  const [showCreate, setShowCreate] = useState(false);
  const [editEmployee, setEditEmployee] = useState<any>(null);
  const [deleteEmployee, setDeleteEmployee] = useState<any>(null);
  const [assignEmployee, setAssignEmployee] = useState<any>(null);

  const { data, isLoading } = useGetAllEmployeesQuery({ page, limit: 10, search: search || undefined });
  const [toggleActive] = useToggleEmployeeActiveMutation();

  const employees = data?.data ?? [];
  const total = data?.total ?? 0;
  const totalPages = Math.ceil(total / 10);

  return (
    <DashboardLayout userRole="hr" userName={userName ?? "HR"} notificationCount={0}>
      <div className="space-y-6">
        <div className="flex items-center justify-between flex-wrap gap-4">
          <div>
            <h1 className="text-3xl font-bold text-secondary-100">Employees</h1>
            <p className="mt-1 text-sm text-custom-700">{total} total employees</p>
          </div>
          <Button onClick={() => setShowCreate(true)} className="flex items-center gap-2 text-sm">
            <HiOutlinePlus className="h-4 w-4" /> Add Employee
          </Button>
        </div>

        {/* Search */}
        <div className="relative max-w-sm">
          <HiOutlineSearch className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-custom-400" />
          <input
            type="text"
            value={search}
            onChange={(e) => { setSearch(e.target.value); setPage(1); }}
            placeholder="Search name, phone, email…"
            className="w-full pl-9 pr-3 py-2 rounded-lg border border-custom-300 bg-white text-sm focus:outline-none focus:ring-2 focus:ring-primary-500"
          />
        </div>

        <Card className="!p-0 overflow-hidden">
          {isLoading ? (
            <div className="flex items-center justify-center py-16 gap-2 text-custom-500">
              <HiOutlineRefresh className="h-5 w-5 animate-spin" /> Loading…
            </div>
          ) : employees.length === 0 ? (
            <div className="py-16 text-center text-sm text-custom-400">No employees found.</div>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full text-sm">
                <thead className="bg-custom-50 border-b border-custom-200">
                  <tr>
                    {["Full Name", "Phone", "Email", "Contract", "Salary", "Department", "Status", "Actions"].map((h) => (
                      <th key={h} className="px-4 py-3 text-left text-xs font-bold text-custom-500 uppercase tracking-wider">{h}</th>
                    ))}
                  </tr>
                </thead>
                <tbody className="divide-y divide-custom-100">
                  {employees.map((emp: any) => (
                    <tr key={emp.id} className="hover:bg-custom-50 transition-colors">
                      <td className="px-4 py-3 font-semibold text-secondary-100">{emp.fullName}</td>
                      <td className="px-4 py-3 text-custom-700">{emp.phoneNumber}</td>
                      <td className="px-4 py-3 text-custom-700">{emp.email ?? "—"}</td>
                      <td className="px-4 py-3 text-custom-700">{emp.contractType?.replace("_", " ") ?? "—"}</td>
                      <td className="px-4 py-3 text-custom-700 font-medium">{emp.contractSalary != null ? emp.contractSalary.toLocaleString() : "—"}</td>
                      <td className="px-4 py-3">
                        {emp.department?.name ? (
                          <span className="px-2 py-0.5 rounded-full text-xs font-semibold bg-blue-100 text-blue-700">
                            {emp.department.name}
                          </span>
                        ) : (
                          <span className="text-xs text-custom-400 italic">Unassigned</span>
                        )}
                      </td>
                      <td className="px-4 py-3">
                        <button
                          onClick={() => toggleActive(emp.id)}
                          className={`px-2 py-0.5 rounded-full text-xs font-semibold ${emp.isActive ? "bg-green-100 text-green-700" : "bg-gray-100 text-gray-500"}`}
                        >
                          {emp.isActive ? "Active" : "Inactive"}
                        </button>
                      </td>
                      <td className="px-4 py-3">
                        <div className="flex items-center gap-1">
                          {/* Assign Department */}
                          <button
                            onClick={() => setAssignEmployee(emp)}
                            className="flex items-center gap-1 px-2 py-1 rounded-lg border border-blue-200 bg-blue-50 hover:bg-blue-100 text-blue-600 text-xs font-semibold transition-colors"
                            title="Assign Department"
                          >
                            <HiOutlineOfficeBuilding className="h-3.5 w-3.5" />
                            Assign
                          </button>
                          {/* Edit */}
                          <button
                            onClick={() => setEditEmployee(emp)}
                            className="p-1.5 rounded hover:bg-primary-50 text-custom-400 hover:text-primary-600 transition-colors"
                            title="Edit"
                          >
                            <HiOutlinePencil className="h-4 w-4" />
                          </button>
                          {/* Delete */}
                          <button
                            onClick={() => setDeleteEmployee(emp)}
                            className="p-1.5 rounded hover:bg-red-50 text-custom-400 hover:text-red-600 transition-colors"
                            title="Delete"
                          >
                            <HiOutlineTrash className="h-4 w-4" />
                          </button>
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </Card>

        {/* Pagination */}
        {totalPages > 1 && (
          <div className="flex items-center justify-between text-sm text-custom-500">
            <span>Page {page} of {totalPages}</span>
            <div className="flex gap-2">
              <Button variant="outline" onClick={() => setPage((p) => Math.max(1, p - 1))} disabled={page === 1} className="text-xs">Previous</Button>
              <Button variant="outline" onClick={() => setPage((p) => Math.min(totalPages, p + 1))} disabled={page === totalPages} className="text-xs">Next</Button>
            </div>
          </div>
        )}
      </div>

      {showCreate && <EmployeeFormModal onClose={() => setShowCreate(false)} />}
      {editEmployee && <EmployeeFormModal employee={editEmployee} onClose={() => setEditEmployee(null)} />}
      {deleteEmployee && <DeleteEmployeeModal employee={deleteEmployee} onClose={() => setDeleteEmployee(null)} />}
      {assignEmployee && <AssignDepartmentModal employee={assignEmployee} onClose={() => setAssignEmployee(null)} />}
    </DashboardLayout>
  );
}

// ─── Assign Department Modal ──────────────────────────────────────────────────

function AssignDepartmentModal({ employee, onClose }: { employee: any; onClose: () => void }) {
  const { data: departments = [], isLoading: loadingDepts } = useGetDepartmentsQuery();
  const [assignDepartment, { isLoading, error }] = useAssignDepartmentMutation();
  const [selectedId, setSelectedId] = useState<string>(employee.department?.id ?? employee.departmentId ?? "");

  async function handleSave() {
    try {
      await assignDepartment({ id: employee.id, departmentId: selectedId || null }).unwrap();
      onClose();
    } catch { /* error shown below */ }
  }

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 backdrop-blur-sm p-4">
      <div className="bg-white rounded-2xl shadow-2xl w-full max-w-sm">
        <div className="flex items-center justify-between px-6 py-4 border-b border-custom-200">
          <div>
            <h2 className="text-lg font-bold text-secondary-100">Assign Department</h2>
            <p className="text-xs text-custom-500 mt-0.5">{employee.fullName}</p>
          </div>
          <button onClick={onClose} className="text-custom-400 hover:text-custom-700 transition-colors">
            <HiOutlineX className="h-5 w-5" />
          </button>
        </div>

        <div className="p-6 space-y-4">
          <div>
            <label className="block text-xs font-semibold text-secondary-100 mb-1">Department</label>
            {loadingDepts ? (
              <div className="flex items-center gap-2 text-sm text-custom-400">
                <HiOutlineRefresh className="h-4 w-4 animate-spin" /> Loading departments…
              </div>
            ) : (
              <select
                value={selectedId}
                onChange={(e) => setSelectedId(e.target.value)}
                className="w-full px-3 py-2 rounded-lg border border-custom-300 bg-white text-sm focus:outline-none focus:ring-2 focus:ring-primary-500"
              >
                <option value="">— Unassign —</option>
                {departments.map((d) => (
                  <option key={d.id} value={d.id}>{d.name}</option>
                ))}
              </select>
            )}
          </div>

          {/* Current department indicator */}
          {employee.department?.name && (
            <p className="text-xs text-custom-500">
              Currently in: <span className="font-semibold text-secondary-100">{employee.department.name}</span>
            </p>
          )}

          {error && (
            <div className="rounded-lg border border-red-300 bg-red-50 px-3 py-2 text-sm text-red-700">
              {(error as any)?.data?.message ?? "Failed to assign department."}
            </div>
          )}

          <div className="flex justify-end gap-2 pt-1">
            <Button variant="outline" onClick={onClose} className="text-sm">Cancel</Button>
            <Button onClick={handleSave} disabled={isLoading || loadingDepts} className="flex items-center gap-2 text-sm">
              {isLoading ? <HiOutlineRefresh className="h-4 w-4 animate-spin" /> : <HiOutlineOfficeBuilding className="h-4 w-4" />}
              {isLoading ? "Saving…" : "Assign"}
            </Button>
          </div>
        </div>
      </div>
    </div>
  );
}

// ─── Form Modal ───────────────────────────────────────────────────────────────

function EmployeeFormModal({ employee, onClose }: { employee?: any; onClose: () => void }) {
  const isEdit = !!employee;
  const [createEmployee, { isLoading: creating, error: createError }] = useCreateEmployeeMutation();
  const [updateEmployee, { isLoading: updating, error: updateError }] = useUpdateEmployeeMutation();
  const isLoading = creating || updating;
  const error = createError || updateError;

  const [form, setForm] = useState({
    fullName: employee?.fullName ?? "",
    phoneNumber: employee?.phoneNumber ?? "",
    gender: employee?.gender ?? "MALE",
    dateOfBirth: employee?.dateOfBirth?.slice(0, 10) ?? "",
    address: employee?.address ?? "",
    contractSalary: employee?.contractSalary ?? "",
    contractType: employee?.contractType ?? "FULL_TIME",
    email: employee?.email ?? "",
    nid: employee?.nid ?? "",
    hiredAt: employee?.hiredAt?.slice(0, 10) ?? "",
  });

  const set = (k: string, v: string) => setForm((f) => ({ ...f, [k]: v }));

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    const body = {
      ...form,
      contractSalary: Number(form.contractSalary),
      email: form.email || undefined,
      nid: form.nid || undefined,
      hiredAt: form.hiredAt || undefined,
    };
    try {
      if (isEdit) {
        await updateEmployee({ id: employee.id, ...body }).unwrap();
      } else {
        await createEmployee(body as any).unwrap();
      }
      onClose();
    } catch { /* error shown below */ }
  }

  const field = (label: string, key: string, type = "text", required = false) => (
    <div>
      <label className="block text-xs font-semibold text-secondary-100 mb-1">
        {label}{required && <span className="text-red-500 ml-0.5">*</span>}
      </label>
      <input
        type={type}
        value={(form as any)[key]}
        onChange={(e) => set(key, e.target.value)}
        required={required}
        className="w-full px-3 py-2 rounded-lg border border-custom-300 bg-white text-sm focus:outline-none focus:ring-2 focus:ring-primary-500"
      />
    </div>
  );

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 backdrop-blur-sm p-4">
      <div className="bg-white rounded-2xl shadow-2xl w-full max-w-lg max-h-[90vh] overflow-y-auto">
        <div className="flex items-center justify-between px-6 py-4 border-b border-custom-200 sticky top-0 bg-white">
          <h2 className="text-lg font-bold text-secondary-100">{isEdit ? "Edit Employee" : "Add Employee"}</h2>
          <button onClick={onClose} className="text-custom-400 hover:text-custom-700"><HiOutlineX className="h-5 w-5" /></button>
        </div>
        <form onSubmit={handleSubmit} className="p-6 space-y-4">
          <div className="grid grid-cols-2 gap-4">
            {field("Full Name", "fullName", "text", true)}
            {field("Phone Number", "phoneNumber", "text", true)}
            {field("Date of Birth", "dateOfBirth", "date", true)}
            {field("Address", "address", "text", true)}
            {field("Contract Salary", "contractSalary", "number", true)}
            {field("Email", "email", "email")}
            {field("NID", "nid")}
            {field("Hired At", "hiredAt", "date")}
          </div>

          <div>
            <label className="block text-xs font-semibold text-secondary-100 mb-1">Gender <span className="text-red-500">*</span></label>
            <select value={form.gender} onChange={(e) => set("gender", e.target.value)} className="w-full px-3 py-2 rounded-lg border border-custom-300 bg-white text-sm focus:outline-none focus:ring-2 focus:ring-primary-500">
              <option value="MALE">Male</option>
              <option value="FEMALE">Female</option>
              <option value="OTHER">Other</option>
            </select>
          </div>

          <div>
            <label className="block text-xs font-semibold text-secondary-100 mb-1">Contract Type</label>
            <select value={form.contractType} onChange={(e) => set("contractType", e.target.value)} className="w-full px-3 py-2 rounded-lg border border-custom-300 bg-white text-sm focus:outline-none focus:ring-2 focus:ring-primary-500">
              <option value="FULL_TIME">Full Time</option>
              <option value="PART_TIME">Part Time</option>
              <option value="CONTRACT">Contract</option>
              <option value="INTERN">Intern</option>
            </select>
          </div>

          {error && (
            <div className="rounded-lg border border-red-300 bg-red-50 px-3 py-2 text-sm text-red-700">
              {(error as any)?.data?.message ?? "An error occurred."}
            </div>
          )}

          <div className="flex justify-end gap-2 pt-2">
            <Button variant="outline" type="button" onClick={onClose} className="text-sm">Cancel</Button>
            <Button type="submit" disabled={isLoading} className="text-sm">
              {isLoading ? "Saving…" : isEdit ? "Save Changes" : "Add Employee"}
            </Button>
          </div>
        </form>
      </div>
    </div>
  );
}

// ─── Delete Modal ─────────────────────────────────────────────────────────────

function DeleteEmployeeModal({ employee, onClose }: { employee: any; onClose: () => void }) {
  const [deleteEmployee, { isLoading, error }] = useDeleteEmployeeMutation();

  async function handleDelete() {
    try {
      await deleteEmployee(employee.id).unwrap();
      onClose();
    } catch { /* error shown below */ }
  }

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 backdrop-blur-sm p-4">
      <div className="bg-white rounded-2xl shadow-2xl w-full max-w-sm">
        <div className="px-6 py-4 border-b border-custom-200">
          <h2 className="text-lg font-bold text-secondary-100">Delete Employee</h2>
        </div>
        <div className="p-6 space-y-4">
          <p className="text-sm text-custom-700">
            Delete <span className="font-bold text-secondary-100">{employee.fullName}</span>? This cannot be undone.
          </p>
          {error && (
            <div className="rounded-lg border border-red-300 bg-red-50 px-3 py-2 text-sm text-red-700">
              {(error as any)?.data?.message ?? "Failed to delete."}
            </div>
          )}
          <div className="flex justify-end gap-2">
            <Button variant="outline" onClick={onClose} className="text-sm">Cancel</Button>
            <button onClick={handleDelete} disabled={isLoading} className="px-4 py-2 rounded-lg bg-red-600 hover:bg-red-700 text-white text-sm font-semibold disabled:opacity-50">
              {isLoading ? "Deleting…" : "Delete"}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
