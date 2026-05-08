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
import { Button, Card, Input } from "../../components/ui";

interface User {
  id: string;
  username: string;
  fullName: string;
  email: string;
  role: string;
  department?: string;
  isActive: boolean;
  createdAt: string;
  lastLogin?: string;
}

const mockUsers: User[] = [
  {
    id: "1",
    username: "admin",
    fullName: "System Administrator",
    email: "admin@jts.com",
    role: "admin",
    department: "management",
    isActive: true,
    createdAt: "2026-01-01",
    lastLogin: "2026-05-06 08:30",
  },
  {
    id: "2",
    username: "worker-printing",
    fullName: "John Worker",
    email: "john@jts.com",
    role: "worker",
    department: "printing",
    isActive: true,
    createdAt: "2026-02-15",
    lastLogin: "2026-05-06 07:45",
  },
  {
    id: "3",
    username: "supervisor",
    fullName: "Jane Supervisor",
    email: "jane@jts.com",
    role: "supervisor",
    department: "management",
    isActive: true,
    createdAt: "2026-01-10",
    lastLogin: "2026-05-05 18:20",
  },
  {
    id: "4",
    username: "reception",
    fullName: "Mary Receptionist",
    email: "mary@jts.com",
    role: "receptionist",
    department: "reception",
    isActive: true,
    createdAt: "2026-01-05",
    lastLogin: "2026-05-06 08:00",
  },
  {
    id: "5",
    username: "old_worker",
    fullName: "Old Worker",
    email: "old@jts.com",
    role: "worker",
    department: "binding",
    isActive: false,
    createdAt: "2025-06-01",
    lastLogin: "2026-03-15 16:30",
  },
];

export default function UserManagementPage() {
  const [users, setUsers] = useState<User[]>(mockUsers);
  const [searchQuery, setSearchQuery] = useState("");
  const [filterRole, setFilterRole] = useState("all");
  const [filterStatus, setFilterStatus] = useState("all");
  const [showCreateModal, setShowCreateModal] = useState(false);

  const filteredUsers = users.filter((user) => {
    const matchesSearch =
      searchQuery === "" ||
      user.fullName.toLowerCase().includes(searchQuery.toLowerCase()) ||
      user.username.toLowerCase().includes(searchQuery.toLowerCase()) ||
      user.email.toLowerCase().includes(searchQuery.toLowerCase());

    const matchesRole = filterRole === "all" || user.role === filterRole;
    const matchesStatus =
      filterStatus === "all" ||
      (filterStatus === "active" && user.isActive) ||
      (filterStatus === "inactive" && !user.isActive);

    return matchesSearch && matchesRole && matchesStatus;
  });

  const handleDeactivate = (userId: string) => {
    if (confirm("Are you sure you want to deactivate this user?")) {
      setUsers(users.map((u) => (u.id === userId ? { ...u, isActive: false } : u)));
    }
  };

  const handleActivate = (userId: string) => {
    setUsers(users.map((u) => (u.id === userId ? { ...u, isActive: true } : u)));
  };

  const handleEdit = (user: User) => {
    // TODO: Implement edit functionality
    alert(`Edit user: ${user.fullName}`);
  };

  const roleColors: Record<string, string> = {
    admin: "bg-red-100 text-red-700",
    supervisor: "bg-purple-100 text-purple-700",
    "production-manager": "bg-blue-100 text-blue-700",
    worker: "bg-green-100 text-green-700",
    receptionist: "bg-yellow-100 text-yellow-700",
    sales: "bg-pink-100 text-pink-700",
    stock: "bg-orange-100 text-orange-700",
    daf: "bg-indigo-100 text-indigo-700",
    accountant1: "bg-cyan-100 text-cyan-700",
    accountant2: "bg-teal-100 text-teal-700",
  };

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
              <option value="admin">Admin</option>
              <option value="supervisor">Supervisor</option>
              <option value="production-manager">Production Manager</option>
              <option value="worker">Worker</option>
              <option value="receptionist">Receptionist</option>
              <option value="sales">Sales</option>
              <option value="stock">Stock</option>
              <option value="daf">DAF</option>
              <option value="accountant1">Accountant 1</option>
              <option value="accountant2">Accountant 2</option>
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
              {users.filter((u) => u.role === "worker").length}
            </p>
          </Card>
        </div>

        {/* Users Table */}
        <Card className="!p-0 overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead className="bg-custom-100 border-b border-custom-300">
                <tr>
                  <th className="px-4 py-3 text-left text-xs font-bold text-secondary-100 uppercase">
                    User
                  </th>
                  <th className="px-4 py-3 text-left text-xs font-bold text-secondary-100 uppercase">
                    Role
                  </th>
                  <th className="px-4 py-3 text-left text-xs font-bold text-secondary-100 uppercase">
                    Department
                  </th>
                  <th className="px-4 py-3 text-left text-xs font-bold text-secondary-100 uppercase">
                    Status
                  </th>
                  <th className="px-4 py-3 text-left text-xs font-bold text-secondary-100 uppercase">
                    Last Login
                  </th>
                  <th className="px-4 py-3 text-right text-xs font-bold text-secondary-100 uppercase">
                    Actions
                  </th>
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
                          <p className="text-sm font-bold text-secondary-100">
                            {user.fullName}
                          </p>
                          <p className="text-xs text-custom-700">{user.username}</p>
                          <p className="text-xs text-custom-700">{user.email}</p>
                        </div>
                      </td>
                      <td className="px-4 py-4">
                        <span
                          className={`px-3 py-1 rounded-full text-xs font-semibold ${
                            roleColors[user.role] || "bg-gray-100 text-gray-700"
                          }`}
                        >
                          {user.role}
                        </span>
                      </td>
                      <td className="px-4 py-4">
                        <span className="text-sm text-secondary-100">
                          {user.department || "-"}
                        </span>
                      </td>
                      <td className="px-4 py-4">
                        {user.isActive ? (
                          <span className="flex items-center gap-1 text-green-600 text-sm font-semibold">
                            <HiOutlineCheck className="w-4 h-4" />
                            Active
                          </span>
                        ) : (
                          <span className="flex items-center gap-1 text-red-600 text-sm font-semibold">
                            <HiOutlineX className="w-4 h-4" />
                            Inactive
                          </span>
                        )}
                      </td>
                      <td className="px-4 py-4">
                        <span className="text-sm text-custom-700">
                          {user.lastLogin || "Never"}
                        </span>
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

        {/* Create User Modal */}
        {showCreateModal && (
          <div className="fixed inset-0 bg-secondary-100/50 z-50 flex items-center justify-center p-4">
            <Card className="!p-6 max-w-md w-full">
              <div className="flex items-center justify-between mb-4">
                <h3 className="text-xl font-bold text-secondary-100">Create New User</h3>
                <button
                  onClick={() => setShowCreateModal(false)}
                  className="text-custom-700 hover:text-secondary-100"
                >
                  <HiOutlineX className="w-6 h-6" />
                </button>
              </div>

              <div className="space-y-4">
                <div>
                  <label className="block text-sm font-semibold text-custom-700 mb-2">
                    Full Name
                  </label>
                  <Input type="text" placeholder="John Doe" fullWidth />
                </div>
                <div>
                  <label className="block text-sm font-semibold text-custom-700 mb-2">
                    Username
                  </label>
                  <Input type="text" placeholder="john_doe" fullWidth />
                </div>
                <div>
                  <label className="block text-sm font-semibold text-custom-700 mb-2">
                    Email
                  </label>
                  <Input type="email" placeholder="john@jts.com" fullWidth />
                </div>
                <div>
                  <label className="block text-sm font-semibold text-custom-700 mb-2">
                    Password
                  </label>
                  <Input type="password" placeholder="••••••••" fullWidth />
                </div>
                <div>
                  <label className="block text-sm font-semibold text-custom-700 mb-2">
                    Role
                  </label>
                  <select className="w-full px-4 py-2 rounded-xl border border-custom-300 focus:outline-none focus:border-primary-500">
                    <option value="">Select Role</option>
                    <option value="admin">Admin</option>
                    <option value="supervisor">Supervisor</option>
                    <option value="production-manager">Production Manager</option>
                    <option value="worker">Worker</option>
                    <option value="receptionist">Receptionist</option>
                    <option value="sales">Sales</option>
                    <option value="stock">Stock</option>
                    <option value="daf">DAF</option>
                    <option value="accountant1">Accountant 1</option>
                    <option value="accountant2">Accountant 2</option>
                  </select>
                </div>
                <div>
                  <label className="block text-sm font-semibold text-custom-700 mb-2">
                    Department
                  </label>
                  <select className="w-full px-4 py-2 rounded-xl border border-custom-300 focus:outline-none focus:border-primary-500">
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

              <div className="flex gap-3 mt-6">
                <Button
                  variant="outline"
                  onClick={() => setShowCreateModal(false)}
                  fullWidth
                >
                  Cancel
                </Button>
                <Button onClick={() => setShowCreateModal(false)} fullWidth>
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
