import { useState } from "react";
import {
  HiOutlineCheck,
  HiOutlineChevronLeft,
  HiOutlineChevronRight,
  HiOutlinePencil,
  HiOutlinePlus,
  HiOutlineSearch,
  HiOutlineTrash,
  HiOutlineX,
} from "react-icons/hi";
import { toast } from "react-toastify";
import { DashboardLayout } from "../../components";
import { Button, Card, Input, PasswordInput, PhoneInput } from "../../components/ui";
import { useGetDepartmentsQuery } from "../../store/services/departmentsService";
import {
  useCreateUserMutation,
  useDeleteUserMutation,
  useGetUsersQuery,
  useUpdateUserMutation,
  type CreateUserPayload,
  type User,
} from "../../store/services/usersService";

// ─── Form types ───────────────────────────────────────────────────────────────

interface CreateUserForm {
  name: string;
  email: string;
  password: string;
  confirmPassword: string;
  phone: string;
  gender: string;
  role: string;
  department: string;
}

interface FormErrors {
  name?: string;
  email?: string;
  password?: string;
  confirmPassword?: string;
  phone?: string;
  gender?: string;
  role?: string;
}

const EMPTY_FORM: CreateUserForm = {
  name: "",
  email: "",
  password: "",
  confirmPassword: "",
  phone: "",
  gender: "",
  role: "",
  department: "",
};

// ─── Validation ───────────────────────────────────────────────────────────────

function validate(form: CreateUserForm): FormErrors {
  const errors: FormErrors = {};

  if (!form.name.trim()) {
    errors.name = "Full name is required.";
  } else if (form.name.trim().length < 3) {
    errors.name = "Full name must be at least 3 characters.";
  }

  if (!form.email.trim()) {
    errors.email = "Email is required.";
  } else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(form.email)) {
    errors.email = "Enter a valid email address.";
  }

  if (!form.password) {
    errors.password = "Password is required.";
  } else if (form.password.length < 5) {
    errors.password = "Password must be at least 5 characters.";
  }

  if (!form.confirmPassword) {
    errors.confirmPassword = "Please confirm your password.";
  } else if (form.password !== form.confirmPassword) {
    errors.confirmPassword = "Passwords do not match.";
  }

  if (!form.phone) {
    errors.phone = "Phone number is required.";
  } else if (form.phone.replace(/\D/g, "").length < 9) {
    errors.phone = "Enter a valid phone number.";
  }

  if (!form.gender) {
    errors.gender = "Please select a gender.";
  }

  if (!form.role) {
    errors.role = "Please select a role.";
  }

  return errors;
}

// ─── Display helpers ──────────────────────────────────────────────────────────

const roleColors: Record<string, string> = {
  ADMIN: "bg-red-100 text-red-700",
  SUPERVISOR: "bg-purple-100 text-purple-700",
  PRODUCTION_MANAGER: "bg-blue-100 text-blue-700",
  WORKER: "bg-green-100 text-green-700",
  RECEPTIONIST: "bg-yellow-100 text-yellow-700",
  SALES: "bg-pink-100 text-pink-700",
  STOCK: "bg-orange-100 text-orange-700",
  DAF: "bg-indigo-100 text-indigo-700",
  ACCOUNTANT: "bg-cyan-100 text-cyan-700",
  HR: "bg-teal-100 text-teal-700",
  HOBE: "bg-lime-100 text-lime-700",
};

// ADMIN excluded — admins are not created from this form
const roleLabels: Record<string, string> = {
  RECEPTIONIST: "Receptionist",
  SALES: "Sales",
  DAF: "DAF",
  ACCOUNTANT: "Accountant",
  PRODUCTION_MANAGER: "Production Manager",
  STOCK: "Stock",
  SUPERVISOR: "Supervisor",
  WORKER: "Worker",
  HR: "HR",
  HOBE: "Hobe",
};

// ─── Component ────────────────────────────────────────────────────────────────

export default function UserManagementPage() {
  const [searchQuery, setSearchQuery] = useState("");
  const [filterRole, setFilterRole] = useState("all");
  const [filterStatus, setFilterStatus] = useState("all");
  const [page, setPage] = useState(1);
  const PAGE_SIZE = 10;

  // Modal state
  const [showCreateModal, setShowCreateModal] = useState(false);
  const [editingUser, setEditingUser] = useState<User | null>(null);
  const [form, setForm] = useState<CreateUserForm>(EMPTY_FORM);
  const [errors, setErrors] = useState<FormErrors>({});

  // Confirm modal state
  const [confirmModal, setConfirmModal] = useState<{
    user: User;
    action: "activate" | "deactivate" | "delete";
  } | null>(null);
  const [deleteConfirmName, setDeleteConfirmName] = useState("");

  // ── RTK Query hooks ────────────────────────────────────────────────────────
  const { data: activeData } = useGetUsersQuery({ limit: 1, isActive: true });
  const { data: inactiveData } = useGetUsersQuery({ limit: 1, isActive: false });
  const { data: workerData } = useGetUsersQuery({ limit: 1, role: "WORKER" });

  const { data, isLoading, isError } = useGetUsersQuery({
    page,
    limit: PAGE_SIZE,
    search: searchQuery || undefined,
    role: filterRole !== "all" ? filterRole : undefined,
    isActive: filterStatus === "active" ? true : filterStatus === "inactive" ? false : undefined,
  });
  const users: User[] = data?.users ?? [];
  const total = data?.total ?? 0;
  const totalPages = data?.totalPages ?? 1;
  const { data: departments = [], isLoading: isLoadingDepts } = useGetDepartmentsQuery();
  const [createUser, { isLoading: isCreating }] = useCreateUserMutation();
  const [updateUser, { isLoading: isUpdating }] = useUpdateUserMutation();
  const [deleteUser] = useDeleteUserMutation();

  const isSaving = isCreating || isUpdating;

  // Build a quick lookup map: departmentId → department name
  const departmentMap = Object.fromEntries(
    departments.map((d) => [d.id, d.name])
  );

  // ── Filtering ──────────────────────────────────────────────────────────────

  // Filtering is handled server-side
  const filteredUsers = users;

  // ── Handlers ───────────────────────────────────────────────────────────────

  const handleField = (field: keyof CreateUserForm, value: string) => {
    setForm((prev) => ({ ...prev, [field]: value }));
    if (errors[field as keyof FormErrors]) {
      setErrors((prev) => ({ ...prev, [field]: undefined }));
    }
  };

  const handleCloseModal = () => {
    setShowCreateModal(false);
    setEditingUser(null);
    setForm(EMPTY_FORM);
    setErrors({});
  };

  const handleOpenEdit = (user: User) => {
    setEditingUser(user);
    setForm({
      name: user.name,
      email: user.email,
      password: "",
      confirmPassword: "",
      // PhoneInput stores the full number (dial code + digits) — pass it as-is
      // The component will display it correctly since it just shows what's in value
      phone: user.phone ?? "",
      gender: user.gender ?? "",   // pre-fills if backend returns it, blank otherwise
      role: user.role,
      department: user.department?.id ?? user.departmentId ?? "",
    });
    setShowCreateModal(true);
  };

  const handleSave = async () => {
    const validationErrors = validate(
      editingUser
        ? { ...form, password: form.password || "xxxxx", confirmPassword: form.confirmPassword || "xxxxx" }
        : form
    );
    if (Object.keys(validationErrors).length > 0) {
      setErrors(validationErrors);
      return;
    }

    try {
      if (editingUser) {
        // ── Update ──────────────────────────────────────────────────────────
        await updateUser({
          id: editingUser.id,
          name: form.name,
          email: form.email,
          phone: form.phone,
          gender: form.gender,
          role: form.role,
          departmentId: form.department || undefined,
        }).unwrap();
        toast.success("User updated successfully.");
      } else {
        // ── Create ──────────────────────────────────────────────────────────
        const payload: CreateUserPayload = {
          name: form.name,
          email: form.email,
          password: form.password,
          phone: form.phone,
          gender: form.gender,
          role: form.role,
          departmentId: form.department || undefined,
        };
        await createUser(payload).unwrap();
        toast.success("User created successfully.");
      }
      handleCloseModal();
    } catch {
      toast.error(editingUser ? "Failed to update user." : "Failed to create user.");
    }
  };

  const handleToggleActive = async (user: User) => {
    setConfirmModal({ user, action: user.isActive ? "deactivate" : "activate" });
  };

  const handleDelete = (user: User) => {
    setDeleteConfirmName("");
    setConfirmModal({ user, action: "delete" });
  };

  const handleConfirm = async () => {
    if (!confirmModal) return;
    const { user, action } = confirmModal;
    setConfirmModal(null);
    setDeleteConfirmName("");
    try {
      if (action === "delete") {
        await deleteUser(user.id).unwrap();
        toast.success("User deleted.");
      } else {
        await updateUser({ id: user.id, isActive: action === "activate" }).unwrap();
        toast.success(`User ${action}d successfully.`);
      }
    } catch {
      toast.error(`Failed to ${action} user.`);
    }
  };

  // ── Render ─────────────────────────────────────────────────────────────────

  return (
    <DashboardLayout userRole="admin" userName="Admin" notificationCount={0}>
      <div className="space-y-6 font-[family-name:var(--font-family-primary)]">

        {/* Header */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
          <div>
            <h1 className="text-2xl md:text-3xl font-bold text-secondary-100">
              User Management
            </h1>
            <p className="text-sm text-custom-700 mt-1">
              Manage system users and permissions
            </p>
          </div>
          <Button
            onClick={() => setShowCreateModal(true)}
            className="flex items-center gap-2 self-start sm:self-auto"
          >
            <HiOutlinePlus className="w-4 h-4" />
            Create User
          </Button>
        </div>

        {/* Filters */}
        <Card className="!p-4">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div className="relative">
              <HiOutlineSearch className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-custom-700" />
              <input
                type="text"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                placeholder="Search users..."
                className="w-full pl-10 pr-4 py-2 rounded-xl border border-custom-300 focus:outline-none focus:border-primary-500"
              />
            </div>
            <select
              value={filterRole}
              onChange={(e) => setFilterRole(e.target.value)}
              className="px-4 py-2 rounded-xl border border-custom-300 focus:outline-none focus:border-primary-500"
            >
              <option value="all">All Roles</option>
              {Object.entries(roleLabels).map(([value, label]) => (
                <option key={value} value={value}>{label}</option>
              ))}
            </select>
            <select
              value={filterStatus}
              onChange={(e) => setFilterStatus(e.target.value)}
              className="px-4 py-2 rounded-xl border border-custom-300 focus:outline-none focus:border-primary-500"
            >
              <option value="all">All Status</option>
              <option value="active">Active</option>
              <option value="inactive">Inactive</option>
            </select>
          </div>
        </Card>

        {/* Stats */}
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
          <Card className="!p-4">
            <p className="text-xs text-custom-700 mb-1">Total Users</p>
            <p className="text-2xl font-bold text-secondary-100">{total}</p>
          </Card>
          <Card className="!p-4">
            <p className="text-xs text-custom-700 mb-1">Active Users</p>
            <p className="text-2xl font-bold text-green-600">
              {activeData?.total ?? 0}
            </p>
          </Card>
          <Card className="!p-4">
            <p className="text-xs text-custom-700 mb-1">Inactive Users</p>
            <p className="text-2xl font-bold text-red-600">
              {inactiveData?.total ?? 0}
            </p>
          </Card>
          <Card className="!p-4">
            <p className="text-xs text-custom-700 mb-1">Workers</p>
            <p className="text-2xl font-bold text-secondary-100">
              {workerData?.total ?? 0}
            </p>
          </Card>
        </div>

        {/* Users Table */}
        <Card className="!p-0 overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead className="bg-custom-100 border-b border-custom-300">
                <tr>
                  <th className="px-4 py-3 text-left text-xs font-bold text-secondary-100 uppercase">N0</th>
                  <th className="px-4 py-3 text-left text-xs font-bold text-secondary-100 uppercase">User</th>
                  <th className="px-4 py-3 text-left text-xs font-bold text-secondary-100 uppercase">phone</th>
                  <th className="px-4 py-3 text-left text-xs font-bold text-secondary-100 uppercase">Role</th>
                  <th className="px-4 py-3 text-left text-xs font-bold text-secondary-100 uppercase">Department</th>
                  <th className="px-4 py-3 text-left text-xs font-bold text-secondary-100 uppercase">Status</th>
                  <th className="px-4 py-3 text-right text-xs font-bold text-secondary-100 uppercase">Actions</th>
                </tr>
              </thead>
              <tbody className="bg-white divide-y divide-custom-200">
                {isLoading ? (
                  <tr>
                    <td colSpan={6} className="px-4 py-8 text-center text-custom-700">
                      Loading users...
                    </td>
                  </tr>
                ) : isError ? (
                  <tr>
                    <td colSpan={6} className="px-4 py-8 text-center text-red-500">
                      Failed to load users. Please try again.
                    </td>
                  </tr>
                ) : filteredUsers.length === 0 ? (
                  <tr>
                    <td colSpan={6} className="px-4 py-8 text-center text-custom-700">
                      No users found.
                    </td>
                  </tr>
                ) : (
                  filteredUsers.map((user, index) => (
                    <tr key={user.id} className="hover:bg-custom-50 transition-colors">
                      <td className="px-4">{(page - 1) * PAGE_SIZE + index + 1}</td>
                      <td className="px-4 py-4">
                        <div>
                          <p className="text-sm font-bold text-secondary-100">{user.name}</p>
                        </div>
                      </td>
                      <td><p className="text-xs text-gray-700">{user.phone}</p>
                        {user.email && <p className="text-xs text-custom-700">{user.email}</p>}</td>
                      <td className="px-4 py-4">
                        <span className={`px-3 py-1 rounded-full text-xs font-semibold ${roleColors[user.role] ?? "bg-gray-100 text-gray-700"}`}>
                          {roleLabels[user.role] ?? user.role}
                        </span>
                      </td>
                      <td className="px-4 py-4">
                        <span className="text-sm text-secondary-100">
                          {user.department?.name ?? departmentMap[user.departmentId ?? ""] ?? "-"}
                        </span>
                      </td>
                      <td className="px-4 py-4">
                        {user.isActive ? (
                          <span className="flex items-center gap-1 text-green-600 text-sm font-semibold">
                            <HiOutlineCheck className="w-4 h-4" /> Active
                          </span>
                        ) : (
                          <span className="flex items-center gap-1 text-red-600 text-sm font-semibold">
                            <HiOutlineX className="w-4 h-4" /> Inactive
                          </span>
                        )}
                      </td>
                      <td className="px-4 py-4">
                        <div className="flex items-center justify-end gap-2">
                          {/* Edit */}
                          <button
                            onClick={() => handleOpenEdit(user)}
                            className="p-2 rounded-lg border border-custom-300 hover:bg-custom-100 transition-colors"
                            title="Edit User"
                          >
                            <HiOutlinePencil className="w-4 h-4 text-custom-700" />
                          </button>
                          {/* Activate / Deactivate */}
                          {user.isActive ? (
                            <button
                              onClick={() => handleToggleActive(user)}
                              className="p-2 rounded-lg border border-yellow-300 hover:bg-yellow-50 transition-colors"
                              title="Deactivate User"
                            >
                              <HiOutlineX className="w-4 h-4 text-yellow-600" />
                            </button>
                          ) : (
                            <button
                              onClick={() => handleToggleActive(user)}
                              className="p-2 rounded-lg border border-green-300 hover:bg-green-50 transition-colors"
                              title="Activate User"
                            >
                              <HiOutlineCheck className="w-4 h-4 text-green-600" />
                            </button>
                          )}
                          {/* Delete */}
                          <button
                            onClick={() => handleDelete(user)}
                            className="p-2 rounded-lg border border-red-300 hover:bg-red-50 transition-colors"
                            title="Delete User"
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

        {/* Pagination */}
        {totalPages > 1 && (
          <div className="flex items-center justify-between">
            <p className="text-sm text-custom-700">
              Page {page} of {totalPages} &mdash; {total} users
            </p>
            <div className="flex items-center gap-2">
              <button
                onClick={() => setPage((p) => Math.max(1, p - 1))}
                disabled={page === 1}
                className="p-2 rounded-lg border border-custom-300 hover:bg-custom-100 disabled:opacity-40 disabled:cursor-not-allowed transition-colors"
              >
                <HiOutlineChevronLeft className="w-4 h-4" />
              </button>
              <button
                onClick={() => setPage((p) => Math.min(totalPages, p + 1))}
                disabled={page === totalPages}
                className="p-2 rounded-lg border border-custom-300 hover:bg-custom-100 disabled:opacity-40 disabled:cursor-not-allowed transition-colors"
              >
                <HiOutlineChevronRight className="w-4 h-4" />
              </button>
            </div>
          </div>
        )}

        {/* ── Create / Edit Modal ───────────────────────────────────────────── */}
        {showCreateModal && (
          <div className="fixed inset-0 bg-black/40 z-50 flex items-center justify-center p-4">
            <Card className="!p-6 w-full max-w-2xl max-h-[90vh] overflow-y-auto">

              {/* Modal header */}
              <div className="flex items-center justify-between mb-5">
                <h3 className="text-xl font-bold text-secondary-100">
                  {editingUser ? "Edit User" : "Create New User"}
                </h3>
                <button
                  onClick={handleCloseModal}
                  className="text-custom-700 hover:text-secondary-100 transition-colors"
                >
                  <HiOutlineX className="w-6 h-6" />
                </button>
              </div>

              <div className="space-y-4">

                {/* Full Name */}
                <div>
                  <label className="block text-sm font-semibold text-custom-700 mb-1">
                    Full Name <span className="text-red-500">*</span>
                  </label>
                  <Input
                    type="text"
                    placeholder="John Doe"
                    value={form.name}
                    onChange={(e) => handleField("name", e.target.value)}
                    fullWidth
                    className={errors.name ? "!border-red-400" : ""}
                  />
                  {errors.name && <p className="mt-1 text-xs text-red-500">{errors.name}</p>}
                </div>

                {/* Email */}
                <div>
                  <label className="block text-sm font-semibold text-custom-700 mb-1">
                    Email <span className="text-red-500">*</span>
                  </label>
                  <Input
                    type="email"
                    placeholder="john@example.com"
                    value={form.email}
                    onChange={(e) => handleField("email", e.target.value)}
                    fullWidth
                    className={errors.email ? "!border-red-400" : ""}
                  />
                  {errors.email && <p className="mt-1 text-xs text-red-500">{errors.email}</p>}
                </div>

                {/* Password — only required on create */}
                {!editingUser && (
                  <>
                    <div>
                      <label className="block text-sm font-semibold text-custom-700 mb-1">
                        Password <span className="text-red-500">*</span>
                      </label>
                      <PasswordInput
                        value={form.password}
                        onChange={(e) => handleField("password", e.target.value)}
                        placeholder="Min. 5 characters"
                        autoComplete="new-password"
                        error={errors.password}
                      />
                    </div>
                    <div>
                      <label className="block text-sm font-semibold text-custom-700 mb-1">
                        Confirm Password <span className="text-red-500">*</span>
                      </label>
                      <PasswordInput
                        value={form.confirmPassword}
                        onChange={(e) => handleField("confirmPassword", e.target.value)}
                        placeholder="Repeat password"
                        autoComplete="new-password"
                        error={errors.confirmPassword}
                      />
                    </div>
                  </>
                )}

                {/* Phone + Gender */}
                <div className="grid grid-cols-2 gap-3">
                  <div>
                    <label className="block text-sm font-semibold text-custom-700 mb-1">
                      Phone <span className="text-red-500">*</span>
                    </label>
                    <PhoneInput
                      value={form.phone}
                      onChange={(val) => handleField("phone", val)}
                      error={errors.phone}
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-semibold text-custom-700 mb-1">
                      Gender <span className="text-red-500">*</span>
                    </label>
                    <select
                      value={form.gender}
                      onChange={(e) => handleField("gender", e.target.value)}
                      className={`w-full px-3 py-2 rounded-xl border text-sm outline-none transition
                        ${errors.gender ? "border-red-400" : "border-custom-300 focus:border-primary-500"}
                        bg-white text-secondary-100`}
                    >
                      <option value="">Select</option>
                      <option value="MALE">Male</option>
                      <option value="FEMALE">Female</option>
                      <option value="OTHER">Other</option>
                    </select>
                    {errors.gender && <p className="mt-1 text-xs text-red-500">{errors.gender}</p>}
                  </div>
                </div>

                {/* Role + Department */}
                <div className="grid grid-cols-2 gap-3">
                  <div>
                    <label className="block text-sm font-semibold text-custom-700 mb-1">
                      Role <span className="text-red-500">*</span>
                    </label>
                    <select
                      value={form.role}
                      onChange={(e) => handleField("role", e.target.value)}
                      className={`w-full px-3 py-2 rounded-xl border text-sm outline-none transition
                        ${errors.role ? "border-red-400" : "border-custom-300 focus:border-primary-500"}
                        bg-white text-secondary-100`}
                    >
                      <option value="">Select Role</option>
                      {Object.entries(roleLabels).map(([value, label]) => (
                        <option key={value} value={value}>{label}</option>
                      ))}
                    </select>
                    {errors.role && <p className="mt-1 text-xs text-red-500">{errors.role}</p>}
                  </div>
                  <div>
                    <label className="block text-sm font-semibold text-custom-700 mb-1">
                      Department
                    </label>
                    <select
                      value={form.department}
                      onChange={(e) => handleField("department", e.target.value)}
                      disabled={isLoadingDepts}
                      className="w-full px-3 py-2 rounded-xl border border-custom-300 focus:border-primary-500 text-sm outline-none bg-white text-secondary-100 disabled:opacity-60"
                    >
                      <option value="">
                        {isLoadingDepts ? "Loading..." : "Select Department"}
                      </option>
                      {departments.map((dept) => (
                        <option key={dept.id} value={dept.id}>
                          {dept.name}
                        </option>
                      ))}
                    </select>
                  </div>
                </div>

              </div>

              {/* Actions */}
              <div className="flex gap-3 mt-6">
                <Button variant="outline" onClick={handleCloseModal} fullWidth>
                  Cancel
                </Button>
                <Button onClick={handleSave} fullWidth disabled={isSaving}>
                  {isSaving ? "Saving..." : editingUser ? "Save Changes" : "Create User"}
                </Button>
              </div>

            </Card>
          </div>
        )}

        {/* ── Confirm Modal ─────────────────────────────────────────────── */}
        {confirmModal && (
          <div className="fixed inset-0 bg-black/40 z-50 flex items-center justify-center p-4">
            <Card className="!p-6 w-full max-w-sm">
              {/* Icon */}
              <div className={`w-12 h-12 rounded-full flex items-center justify-center mx-auto mb-4 ${
                confirmModal.action === "delete"
                  ? "bg-red-100"
                  : confirmModal.action === "deactivate"
                  ? "bg-yellow-100"
                  : "bg-green-100"
              }`}>
                {confirmModal.action === "delete" ? (
                  <HiOutlineTrash className="w-6 h-6 text-red-600" />
                ) : confirmModal.action === "deactivate" ? (
                  <HiOutlineX className="w-6 h-6 text-yellow-600" />
                ) : (
                  <HiOutlineCheck className="w-6 h-6 text-green-600" />
                )}
              </div>

              {/* Title */}
              <h3 className="text-lg font-bold text-secondary-100 text-center mb-1">
                {confirmModal.action === "delete"
                  ? "Delete User"
                  : confirmModal.action === "deactivate"
                  ? "Deactivate User"
                  : "Activate User"}
              </h3>

              {/* Description */}
              <p className="text-sm text-custom-700 text-center mb-4">
                {confirmModal.action === "delete" ? (
                  <>
                    This will permanently remove{" "}
                    <span className="font-semibold text-secondary-100">{confirmModal.user.name}</span>.
                    This cannot be undone.
                  </>
                ) : confirmModal.action === "deactivate" ? (
                  <>Are you sure you want to deactivate <span className="font-semibold text-secondary-100">{confirmModal.user.name}</span>? They will lose access to the system.</>
                ) : (
                  <>Are you sure you want to activate <span className="font-semibold text-secondary-100">{confirmModal.user.name}</span>? They will regain access to the system.</>
                )}
              </p>

              {/* Name confirmation input — delete only */}
              {confirmModal.action === "delete" && (
                <div className="mb-5">
                  <label className="block text-xs text-custom-700 mb-1.5">
                    Type <span className="font-bold text-secondary-100">{confirmModal.user.name}</span> to confirm
                  </label>
                  <input
                    autoFocus
                    type="text"
                    value={deleteConfirmName}
                    onChange={(e) => setDeleteConfirmName(e.target.value)}
                    placeholder={confirmModal.user.name}
                    className="w-full px-3 py-2 rounded-xl border border-custom-300 focus:outline-none focus:border-red-400 text-sm text-secondary-100"
                  />
                </div>
              )}

              {/* Actions */}
              <div className="flex gap-3">
                <Button
                  variant="outline"
                  fullWidth
                  onClick={() => { setConfirmModal(null); setDeleteConfirmName(""); }}
                >
                  Cancel
                </Button>
                <Button
                  fullWidth
                  onClick={handleConfirm}
                  disabled={confirmModal.action === "delete" && deleteConfirmName !== confirmModal.user.name}
                  className={
                    confirmModal.action === "delete"
                      ? "!bg-red-600 hover:!bg-red-700 disabled:opacity-40 disabled:cursor-not-allowed"
                      : confirmModal.action === "deactivate"
                      ? "!bg-yellow-500 hover:!bg-yellow-600 !text-white"
                      : "!bg-green-600 hover:!bg-green-700"
                  }
                >
                  {confirmModal.action === "delete"
                    ? "Delete"
                    : confirmModal.action === "deactivate"
                    ? "Deactivate"
                    : "Activate"}
                </Button>
              </div>
            </Card>
          </div>
        )}

      </div>
    </DashboardLayout>
  );
}
