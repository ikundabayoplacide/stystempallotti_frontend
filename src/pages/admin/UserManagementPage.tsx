import { useState } from "react";
import {
  HiOutlineCheck,
  HiOutlinePencil,
  HiOutlinePlus,
  HiOutlineSearch,
  HiOutlineTrash,
  HiOutlineX,
} from "react-icons/hi";
import { DashboardLayout } from "../../components";
import { Button, Card, Input, PasswordInput, PhoneInput } from "../../components/ui";

// ─── Types ────────────────────────────────────────────────────────────────────

interface User {
  id: string;
  fullName: string;
  email: string;
  role: string;
  department?: string;
  isActive: boolean;
  createdAt: string;
  lastLogin?: string;
}

interface CreateUserForm {
  fullName: string;
  email: string;
  password: string;
  confirmPassword: string;
  phone: string;
  gender: string;
  role: string;
  department: string;
}

interface FormErrors {
  fullName?: string;
  email?: string;
  password?: string;
  confirmPassword?: string;
  phone?: string;
  gender?: string;
  role?: string;
}

// ─── Mock data ────────────────────────────────────────────────────────────────

const mockUsers: User[] = [
  {
    id: "1",
    fullName: "System Administrator",
    email: "admin@jts.com",
    role: "ADMIN",
    department: "management",
    isActive: true,
    createdAt: "2026-01-01",
    lastLogin: "2026-05-06 08:30",
  },
  {
    id: "2",
    fullName: "John Worker",
    email: "john@jts.com",
    role: "WORKER",
    department: "printing",
    isActive: true,
    createdAt: "2026-02-15",
    lastLogin: "2026-05-06 07:45",
  },
  {
    id: "3",
    fullName: "Jane Supervisor",
    email: "jane@jts.com",
    role: "SUPERVISOR",
    department: "management",
    isActive: true,
    createdAt: "2026-01-10",
    lastLogin: "2026-05-05 18:20",
  },
  {
    id: "4",
    fullName: "Mary Receptionist",
    email: "mary@jts.com",
    role: "RECEPTIONIST",
    department: "reception",
    isActive: true,
    createdAt: "2026-01-05",
    lastLogin: "2026-05-06 08:00",
  },
  {
    id: "5",
    fullName: "Old Worker",
    email: "old@jts.com",
    role: "WORKER",
    department: "binding",
    isActive: false,
    createdAt: "2025-06-01",
    lastLogin: "2026-03-15 16:30",
  },
];

const EMPTY_FORM: CreateUserForm = {
  fullName: "",
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

  if (!form.fullName.trim()) {
    errors.fullName = "Full name is required.";
  } else if (form.fullName.trim().length < 3) {
    errors.fullName = "Full name must be at least 3 characters.";
  }

  if (!form.email.trim()) {
    errors.email = "Email is required.";
  } else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(form.email)) {
    errors.email = "Enter a valid email address.";
  }

  if (!form.password) {
    errors.password = "Password is required.";
  } else if (form.password.length < 8) {
    errors.password = "Password must be at least 8 characters.";
  } else if (!/[A-Z]/.test(form.password)) {
    errors.password = "Password must contain at least one uppercase letter.";
  } else if (!/[0-9]/.test(form.password)) {
    errors.password = "Password must contain at least one number.";
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

// ─── Role display helpers ─────────────────────────────────────────────────────

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
};

const roleLabels: Record<string, string> = {
  ADMIN: "Admin",
  SUPERVISOR: "Supervisor",
  PRODUCTION_MANAGER: "Production Manager",
  WORKER: "Worker",
  RECEPTIONIST: "Receptionist",
  SALES: "Sales",
  STOCK: "Stock",
  DAF: "DAF",
  ACCOUNTANT: "Accountant",
};

// ─── Component ────────────────────────────────────────────────────────────────

export default function UserManagementPage() {
  const [users, setUsers] = useState<User[]>(mockUsers);
  const [searchQuery, setSearchQuery] = useState("");
  const [filterRole, setFilterRole] = useState("all");
  const [filterStatus, setFilterStatus] = useState("all");

  // Modal state
  const [showCreateModal, setShowCreateModal] = useState(false);
  const [form, setForm] = useState<CreateUserForm>(EMPTY_FORM);
  const [errors, setErrors] = useState<FormErrors>({});

  // ── Filtering ──────────────────────────────────────────────────────────────

  const filteredUsers = users.filter((user) => {
    const matchesSearch =
      searchQuery === "" ||
      user.fullName.toLowerCase().includes(searchQuery.toLowerCase()) ||
      user.email.toLowerCase().includes(searchQuery.toLowerCase());

    const matchesRole = filterRole === "all" || user.role === filterRole;
    const matchesStatus =
      filterStatus === "all" ||
      (filterStatus === "active" && user.isActive) ||
      (filterStatus === "inactive" && !user.isActive);

    return matchesSearch && matchesRole && matchesStatus;
  });

  // ── Handlers ───────────────────────────────────────────────────────────────

  const handleField = (field: keyof CreateUserForm, value: string) => {
    setForm((prev) => ({ ...prev, [field]: value }));
    // Clear the error for this field as the user types
    if (errors[field as keyof FormErrors]) {
      setErrors((prev) => ({ ...prev, [field]: undefined }));
    }
  };

  const handleCloseModal = () => {
    setShowCreateModal(false);
    setForm(EMPTY_FORM);
    setErrors({});
  };

  const handleCreate = () => {
    const validationErrors = validate(form);
    if (Object.keys(validationErrors).length > 0) {
      setErrors(validationErrors);
      return;
    }

    // TODO: dispatch createUser API call here
    const newUser: User = {
      id: String(Date.now()),
      fullName: form.fullName.trim(),
      email: form.email.trim(),
      role: form.role,
      department: form.department || undefined,
      isActive: true,
      createdAt: new Date().toISOString().split("T")[0],
    };
    setUsers((prev) => [newUser, ...prev]);
    handleCloseModal();
  };

  const handleDeactivate = (userId: string) => {
    if (confirm("Are you sure you want to deactivate this user?")) {
      setUsers(users.map((u) => (u.id === userId ? { ...u, isActive: false } : u)));
    }
  };

  const handleActivate = (userId: string) => {
    setUsers(users.map((u) => (u.id === userId ? { ...u, isActive: true } : u)));
  };

  const handleEdit = (user: User) => {
    // TODO: open edit modal
    alert(`Edit user: ${user.fullName}`);
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
            <p className="text-2xl font-bold text-secondary-100">{users.length}</p>
          </Card>
          <Card className="!p-4">
            <p className="text-xs text-custom-700 mb-1">Active Users</p>
            <p className="text-2xl font-bold text-green-600">
              {users.filter((u) => u.isActive).length}
            </p>
          </Card>
          <Card className="!p-4">
            <p className="text-xs text-custom-700 mb-1">Inactive Users</p>
            <p className="text-2xl font-bold text-red-600">
              {users.filter((u) => !u.isActive).length}
            </p>
          </Card>
          <Card className="!p-4">
            <p className="text-xs text-custom-700 mb-1">Workers</p>
            <p className="text-2xl font-bold text-secondary-100">
              {users.filter((u) => u.role === "WORKER").length}
            </p>
          </Card>
        </div>

        {/* Users Table */}
        <Card className="!p-0 overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead className="bg-custom-100 border-b border-custom-300">
                <tr>
                  <th className="px-4 py-3 text-left text-xs font-bold text-secondary-100 uppercase">User</th>
                  <th className="px-4 py-3 text-left text-xs font-bold text-secondary-100 uppercase">Role</th>
                  <th className="px-4 py-3 text-left text-xs font-bold text-secondary-100 uppercase">Department</th>
                  <th className="px-4 py-3 text-left text-xs font-bold text-secondary-100 uppercase">Status</th>
                  <th className="px-4 py-3 text-left text-xs font-bold text-secondary-100 uppercase">Last Login</th>
                  <th className="px-4 py-3 text-right text-xs font-bold text-secondary-100 uppercase">Actions</th>
                </tr>
              </thead>
              <tbody className="bg-white divide-y divide-custom-200">
                {filteredUsers.length === 0 ? (
                  <tr>
                    <td colSpan={6} className="px-4 py-8 text-center text-custom-700">
                      No users found
                    </td>
                  </tr>
                ) : (
                  filteredUsers.map((user) => (
                    <tr key={user.id} className="hover:bg-custom-50 transition-colors">
                      <td className="px-4 py-4">
                        <div>
                          <p className="text-sm font-bold text-secondary-100">{user.fullName}</p>
                          <p className="text-xs text-custom-700">{user.email}</p>
                        </div>
                      </td>
                      <td className="px-4 py-4">
                        <span className={`px-3 py-1 rounded-full text-xs font-semibold ${roleColors[user.role] ?? "bg-gray-100 text-gray-700"}`}>
                          {roleLabels[user.role] ?? user.role}
                        </span>
                      </td>
                      <td className="px-4 py-4">
                        <span className="text-sm text-secondary-100">{user.department ?? "-"}</span>
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
                        <span className="text-sm text-custom-700">{user.lastLogin ?? "Never"}</span>
                      </td>
                      <td className="px-4 py-4">
                        <div className="flex items-center justify-end gap-2">
                          <button
                            onClick={() => handleEdit(user)}
                            className="p-2 rounded-lg border border-custom-300 hover:bg-custom-100 transition-colors"
                            title="Edit User"
                          >
                            <HiOutlinePencil className="w-4 h-4 text-custom-700" />
                          </button>
                          {user.isActive ? (
                            <button
                              onClick={() => handleDeactivate(user.id)}
                              className="p-2 rounded-lg border border-red-300 hover:bg-red-50 transition-colors"
                              title="Deactivate User"
                            >
                              <HiOutlineTrash className="w-4 h-4 text-red-600" />
                            </button>
                          ) : (
                            <button
                              onClick={() => handleActivate(user.id)}
                              className="p-2 rounded-lg border border-green-300 hover:bg-green-50 transition-colors"
                              title="Activate User"
                            >
                              <HiOutlineCheck className="w-4 h-4 text-green-600" />
                            </button>
                          )}
                        </div>
                      </td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>
        </Card>

        {/* ── Create User Modal ─────────────────────────────────────────────── */}
        {showCreateModal && (
          <div className="fixed inset-0 bg-black/40 z-50 flex items-center justify-center p-4">
            <Card className="!p-6 w-full max-w-lg max-h-[90vh] overflow-y-auto">

              {/* Modal header */}
              <div className="flex items-center justify-between mb-5">
                <h3 className="text-xl font-bold text-secondary-100">Create New User</h3>
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
                    value={form.fullName}
                    onChange={(e) => handleField("fullName", e.target.value)}
                    fullWidth
                    className={errors.fullName ? "!border-red-400" : ""}
                  />
                  {errors.fullName && <p className="mt-1 text-xs text-red-500">{errors.fullName}</p>}
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

                {/* Password */}
                <div>
                  <label className="block text-sm font-semibold text-custom-700 mb-1">
                    Password <span className="text-red-500">*</span>
                  </label>
                  <PasswordInput
                    value={form.password}
                    onChange={(e) => handleField("password", e.target.value)}
                    placeholder="Min. 8 chars, 1 uppercase, 1 number"
                    autoComplete="new-password"
                    error={errors.password}
                  />
                </div>

                {/* Confirm Password */}
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
                      <option value="male">Male</option>
                      <option value="female">Female</option>
                      <option value="other">Other</option>
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
                      className="w-full px-3 py-2 rounded-xl border border-custom-300 focus:border-primary-500 text-sm outline-none bg-white text-secondary-100"
                    >
                      <option value="">Select Department</option>
                      <option value="composition">Composition</option>
                      <option value="montage">Montage</option>
                      <option value="printing">Printing</option>
                      <option value="binding">Binding</option>
                      <option value="packaging">Packaging</option>
                      <option value="stock">Stock</option>
                      <option value="sales">Sales</option>
                      <option value="finance">Finance</option>
                      <option value="reception">Reception</option>
                      <option value="management">Management</option>
                    </select>
                  </div>
                </div>

              </div>

              {/* Actions */}
              <div className="flex gap-3 mt-6">
                <Button variant="outline" onClick={handleCloseModal} fullWidth>
                  Cancel
                </Button>
                <Button onClick={handleCreate} fullWidth>
                  Create User
                </Button>
              </div>

            </Card>
          </div>
        )}

      </div>
    </DashboardLayout>
  );
}
