import { useState } from "react";
import { toast } from "react-toastify";
import {
  HiOutlineBriefcase,
  HiOutlineEye,
  HiOutlinePencil,
  HiOutlinePlus,
  HiOutlineRefresh,
  HiOutlineTrash,
  HiOutlineUsers,
  HiOutlineX,
} from "react-icons/hi";
import { DashboardLayout } from "../../components";
import { Card } from "../../components/ui";
import {
  useGetDepartmentsQuery,
  useGetDepartmentJobsQuery,
  useCreateDepartmentMutation,
  useUpdateDepartmentMutation,
  useDeleteDepartmentMutation,
} from "../../store/services/departmentsService";
import type { Department } from "../../store/services/departmentsService";

type ModalMode = "create" | "edit" | "delete";

// ─── Drawer ───────────────────────────────────────────────────────────────────

function DepartmentDrawer({ dept, onClose }: { dept: Department; onClose: () => void }) {
  const { data: jobs = [], isLoading } = useGetDepartmentJobsQuery(dept.id);

  return (
    <>
      {/* Backdrop */}
      <div className="fixed inset-0 bg-secondary-100/40 z-40" onClick={onClose} />

      {/* Panel */}
      <div className="fixed right-0 top-0 h-full w-full max-w-md bg-white shadow-2xl z-50 flex flex-col font-[family-name:var(--font-family-primary)]">

        {/* Header */}
        <div className="flex items-center justify-between px-6 py-4 border-b border-custom-300">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-primary-100 flex items-center justify-center">
              <HiOutlineUsers className="w-5 h-5 text-primary-600" />
            </div>
            <div>
              <h2 className="text-lg font-bold text-secondary-100">{dept.name}</h2>
              {dept.description && (
                <p className="text-xs text-custom-700">{dept.description}</p>
              )}
            </div>
          </div>
          <button onClick={onClose} className="text-custom-700 hover:text-secondary-100">
            <HiOutlineX className="w-6 h-6" />
          </button>
        </div>

        {/* Stats strip */}
        <div className="grid grid-cols-2 gap-3 px-6 py-4 border-b border-custom-300">
          <div className="bg-blue-50 rounded-xl px-4 py-3">
            <p className="text-xs text-custom-700">Active Jobs</p>
            <p className="text-xl font-bold text-blue-600">{dept.activeJobs ?? 0}</p>
          </div>
          <div className="bg-green-50 rounded-xl px-4 py-3">
            <p className="text-xs text-custom-700">Workers</p>
            <p className="text-xl font-bold text-green-600">{dept.workers ?? 0}</p>
          </div>
        </div>

        {/* Jobs list */}
        <div className="flex-1 overflow-y-auto px-6 py-4">
          <h3 className="text-sm font-bold text-secondary-100 mb-3 flex items-center gap-2">
            <HiOutlineBriefcase className="w-4 h-4" /> Jobs in this department
          </h3>

          {isLoading ? (
            <div className="flex items-center gap-2 text-custom-700 py-8 justify-center">
              <HiOutlineRefresh className="w-5 h-5 animate-spin" />
              <span className="text-sm">Loading jobs…</span>
            </div>
          ) : jobs.length === 0 ? (
            <div className="text-center py-12">
              <HiOutlineBriefcase className="w-10 h-10 text-custom-300 mx-auto mb-2" />
              <p className="text-sm text-custom-700">No jobs assigned to this department.</p>
            </div>
          ) : (
            <ul className="space-y-2">
              {jobs.map((job) => (
                <li
                  key={job.id}
                  className="flex items-center gap-3 px-4 py-3 rounded-xl border border-custom-200 hover:bg-custom-50 transition-colors"
                >
                  <div className="w-8 h-8 rounded-lg bg-primary-50 flex items-center justify-center flex-shrink-0">
                    <HiOutlineBriefcase className="w-4 h-4 text-primary-500" />
                  </div>
                  <span className="text-sm font-semibold text-secondary-100">{job.title}</span>
                </li>
              ))}
            </ul>
          )}
        </div>
      </div>
    </>
  );
}

export default function AdminDepartmentsPage() {
  const { data: departments = [], isLoading, isFetching, refetch } = useGetDepartmentsQuery();
  const [createDepartment, { isLoading: isCreating }] = useCreateDepartmentMutation();
  const [updateDepartment, { isLoading: isUpdating }] = useUpdateDepartmentMutation();
  const [deleteDepartment, { isLoading: isDeleting }] = useDeleteDepartmentMutation();

  const [modalMode, setModalMode] = useState<ModalMode | null>(null);
  const [selected, setSelected] = useState<Department | null>(null);
  const [name, setName] = useState("");
  const [description, setDescription] = useState("");
  const [drawerDept, setDrawerDept] = useState<Department | null>(null);

  const openCreate = () => {
    setName("");
    setDescription("");
    setSelected(null);
    setModalMode("create");
  };

  const openEdit = (dept: Department) => {
    setSelected(dept);
    setName(dept.name);
    setDescription(dept.description ?? "");
    setModalMode("edit");
  };

  const openDelete = (dept: Department) => {
    setSelected(dept);
    setModalMode("delete");
  };

  const closeModal = () => {
    setModalMode(null);
    setSelected(null);
  };

  const handleCreate = async () => {
    if (!name.trim()) { toast.error("Name is required"); return; }
    try {
      await createDepartment({ name: name.trim(), description: description.trim() || undefined }).unwrap();
      toast.success("Department created");
      closeModal();
    } catch (err: any) {
      toast.error(err?.data?.message ?? "Failed to create department");
    }
  };

  const handleUpdate = async () => {
    if (!selected || !name.trim()) { toast.error("Name is required"); return; }
    try {
      await updateDepartment({ id: selected.id, name: name.trim(), description: description.trim() || undefined }).unwrap();
      toast.success("Department updated");
      closeModal();
    } catch (err: any) {
      toast.error(err?.data?.message ?? "Failed to update department");
    }
  };

  const handleDelete = async () => {
    if (!selected) return;
    try {
      await deleteDepartment(selected.id).unwrap();
      toast.success("Department deleted");
      closeModal();
    } catch (err: any) {
      toast.error(err?.data?.message ?? "Failed to delete department");
    }
  };

  return (
    <DashboardLayout userRole="admin" userName="Admin" notificationCount={0}>
      <div className="space-y-6 font-[family-name:var(--font-family-primary)]">

        {/* Header */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
          <div>
            <h1 className="text-2xl md:text-3xl font-bold text-secondary-100">Departments</h1>
            <p className="text-sm text-custom-700 mt-1">Manage production departments</p>
          </div>
          <div className="flex gap-2">
            <button
              onClick={() => refetch()}
              className="p-2 rounded-xl border border-custom-300 hover:bg-custom-100 transition-colors"
              title="Refresh"
            >
              <HiOutlineRefresh className={`w-5 h-5 text-custom-700 ${isFetching ? "animate-spin" : ""}`} />
            </button>
            <button
              onClick={openCreate}
              className="flex items-center gap-2 px-4 py-2 rounded-xl bg-primary-500 text-white hover:bg-primary-600 transition-colors text-sm font-semibold"
            >
              <HiOutlinePlus className="w-4 h-4" /> Add Department
            </button>
          </div>
        </div>

        {/* Stats */}
        <div className="grid grid-cols-2 sm:grid-cols-3 gap-4">
          <Card className="!p-4">
            <p className="text-xs text-custom-700 mb-1">Total Departments</p>
            <p className="text-2xl font-bold text-secondary-100">{departments.length}</p>
          </Card>
          <Card className="!p-4">
            <p className="text-xs text-custom-700 mb-1">Active Jobs</p>
            <p className="text-2xl font-bold text-blue-600">
              {departments.reduce((s, d) => s + (d.activeJobs ?? 0), 0)}
            </p>
          </Card>
          <Card className="!p-4">
            <p className="text-xs text-custom-700 mb-1">Total Workers</p>
            <p className="text-2xl font-bold text-green-600">
              {departments.reduce((s, d) => s + (d.workers ?? 0), 0)}
            </p>
          </Card>
        </div>

        {/* Table */}
        <Card className="!p-0 overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead className="bg-custom-100 border-b border-custom-300">
                <tr>
                  {["Department", "Description", "Active Jobs", "Workers", "Actions"].map((h) => (
                    <th
                      key={h}
                      className={`px-4 py-3 text-xs font-bold text-secondary-100 uppercase ${h === "Actions" ? "text-right" : "text-left"}`}
                    >
                      {h}
                    </th>
                  ))}
                </tr>
              </thead>
              <tbody className="bg-white divide-y divide-custom-200">
                {isLoading ? (
                  <tr>
                    <td colSpan={5} className="px-4 py-12 text-center">
                      <div className="flex items-center justify-center gap-2 text-custom-700">
                        <HiOutlineRefresh className="w-5 h-5 animate-spin" />
                        <span className="text-sm">Loading departments…</span>
                      </div>
                    </td>
                  </tr>
                ) : departments.length === 0 ? (
                  <tr>
                    <td colSpan={5} className="px-4 py-12 text-center text-custom-700 text-sm">
                      No departments found. Create one to get started.
                    </td>
                  </tr>
                ) : (
                  departments.map((dept) => (
                    <tr key={dept.id} className="hover:bg-custom-50 transition-colors">
                      <td className="px-4 py-4">
                        <div className="flex items-center gap-3">
                          <div className="w-9 h-9 rounded-xl bg-primary-100 flex items-center justify-center flex-shrink-0">
                            <HiOutlineUsers className="w-4 h-4 text-primary-600" />
                          </div>
                          <span className="text-sm font-semibold text-secondary-100">{dept.name}</span>
                        </div>
                      </td>
                      <td className="px-4 py-4">
                        <span className="text-sm text-custom-700">{dept.description ?? "—"}</span>
                      </td>
                      <td className="px-4 py-4">
                        <span className="text-sm font-semibold text-blue-600">{dept.activeJobs ?? 0}</span>
                      </td>
                      <td className="px-4 py-4">
                        <span className="text-sm font-semibold text-green-600">{dept.workers ?? 0}</span>
                      </td>
                      <td className="px-4 py-4">
                        <div className="flex items-center justify-end gap-2">
                          <button
                            onClick={() => setDrawerDept(dept)}
                            className="p-2 rounded-lg border border-blue-200 hover:bg-blue-50 transition-colors"
                            title="View Jobs"
                          >
                            <HiOutlineEye className="w-4 h-4 text-blue-600" />
                          </button>
                          <button
                            onClick={() => openEdit(dept)}
                            className="p-2 rounded-lg border border-custom-300 hover:bg-custom-100 transition-colors"
                            title="Edit"
                          >
                            <HiOutlinePencil className="w-4 h-4 text-custom-700" />
                          </button>
                          <button
                            onClick={() => openDelete(dept)}
                            className="p-2 rounded-lg border border-red-300 hover:bg-red-50 transition-colors"
                            title="Delete"
                          >
                            <HiOutlineTrash className="w-4 h-4 text-red-600" />
                          </button>
                        </div>
                      </td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>
        </Card>

        {/* Create / Edit Modal */}
        {(modalMode === "create" || modalMode === "edit") && (
          <div className="fixed inset-0 bg-secondary-100/50 z-50 flex items-center justify-center p-4">
            <Card className="!p-6 max-w-md w-full">
              <div className="flex items-center justify-between mb-4">
                <h3 className="text-xl font-bold text-secondary-100">
                  {modalMode === "create" ? "Add Department" : "Edit Department"}
                </h3>
                <button onClick={closeModal} className="text-custom-700 hover:text-secondary-100">
                  <HiOutlineX className="w-6 h-6" />
                </button>
              </div>
              <div className="space-y-4">
                <div>
                  <label className="block text-sm font-semibold text-custom-700 mb-1">
                    Name <span className="text-red-500">*</span>
                  </label>
                  <input
                    type="text"
                    value={name}
                    onChange={(e) => setName(e.target.value)}
                    placeholder="e.g., Printing"
                    className="w-full px-4 py-2 rounded-xl border border-custom-300 focus:outline-none focus:border-primary-500"
                  />
                </div>
                <div>
                  <label className="block text-sm font-semibold text-custom-700 mb-1">Description</label>
                  <textarea
                    value={description}
                    onChange={(e) => setDescription(e.target.value)}
                    placeholder="Optional description..."
                    rows={3}
                    className="w-full px-4 py-2 rounded-xl border border-custom-300 focus:outline-none focus:border-primary-500 resize-none"
                  />
                </div>
              </div>
              <div className="flex gap-3 mt-6">
                <button
                  onClick={closeModal}
                  className="flex-1 px-4 py-2 rounded-xl border border-custom-300 text-sm font-semibold text-secondary-100 hover:bg-custom-100 transition-colors"
                >
                  Cancel
                </button>
                <button
                  onClick={modalMode === "create" ? handleCreate : handleUpdate}
                  disabled={isCreating || isUpdating}
                  className="flex-1 px-4 py-2 rounded-xl bg-primary-500 text-white hover:bg-primary-600 transition-colors text-sm font-semibold disabled:opacity-50"
                >
                  {isCreating || isUpdating ? "Saving…" : modalMode === "create" ? "Create" : "Save Changes"}
                </button>
              </div>
            </Card>
          </div>
        )}

        {/* Detail Drawer */}
        {drawerDept && (
          <DepartmentDrawer dept={drawerDept} onClose={() => setDrawerDept(null)} />
        )}

        {/* Delete Confirm Modal */}
        {modalMode === "delete" && selected && (
          <div className="fixed inset-0 bg-secondary-100/50 z-50 flex items-center justify-center p-4">
            <div className="bg-white rounded-2xl shadow-xl p-6 max-w-sm w-full">
              <div className="flex items-center gap-3 mb-4">
                <div className="w-10 h-10 rounded-full bg-red-100 flex items-center justify-center flex-shrink-0">
                  <HiOutlineTrash className="w-5 h-5 text-red-600" />
                </div>
                <div>
                  <h3 className="text-base font-bold text-secondary-100">Delete Department</h3>
                  <p className="text-sm text-custom-700">This action cannot be undone.</p>
                </div>
              </div>
              <p className="text-sm text-custom-700 mb-5">
                Are you sure you want to delete <span className="font-semibold text-secondary-100">{selected.name}</span>?
              </p>
              <div className="flex gap-3">
                <button
                  onClick={closeModal}
                  className="flex-1 px-4 py-2 rounded-xl border border-custom-300 text-sm font-semibold text-secondary-100 hover:bg-custom-100 transition-colors"
                >
                  Cancel
                </button>
                <button
                  onClick={handleDelete}
                  disabled={isDeleting}
                  className="flex-1 px-4 py-2 rounded-xl bg-red-600 text-white text-sm font-semibold hover:bg-red-700 transition-colors disabled:opacity-50"
                >
                  {isDeleting ? "Deleting…" : "Delete"}
                </button>
              </div>
            </div>
          </div>
        )}
      </div>
    </DashboardLayout>
  );
}
