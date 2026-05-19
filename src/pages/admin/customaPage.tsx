import { useState } from "react";
import { toast } from "react-toastify";
import {
  HiOutlineLocationMarker,
  HiOutlineMail,
  HiOutlineOfficeBuilding,
  HiOutlinePencil,
  HiOutlinePhone,
  HiOutlinePlus,
  HiOutlineSearch,
  HiOutlineTrash,
  HiOutlineUsers,
  HiOutlineX,
} from "react-icons/hi";
import { DashboardLayout } from "../../components";
import { Button, Card, Input } from "../../components/ui";
import {
  useGetCustomersQuery,
  useCreateCustomerMutation,
  useUpdateCustomerMutation,
  useDeleteCustomerMutation,
  type CustomerType,
  type Customer,
  type CreateCustomerPayload,
} from "../../store/services/customersService";

// ─── Notes cell with expand/collapse ─────────────────────────────────────────

const MAX_NOTE_LENGTH = 60;

function NoteCell({ text }: { text: string }) {
  const [expanded, setExpanded] = useState(false);
  if (!text) return <span className="text-custom-400 text-xs">—</span>;

  const isLong = text.length > MAX_NOTE_LENGTH;
  const displayed = expanded || !isLong ? text : text.slice(0, MAX_NOTE_LENGTH) + "…";

  return (
    <div className="text-xs text-custom-700 max-w-[180px]">
      <span className="whitespace-pre-wrap break-words">{displayed}</span>
      {isLong && (
        <button
          onClick={() => setExpanded((v) => !v)}
          className="ml-1 text-primary-500 hover:underline font-semibold whitespace-nowrap"
        >
          {expanded ? "less" : "more"}
        </button>
      )}
    </div>
  );
}

// ─── Constants ────────────────────────────────────────────────────────────────

const typeColor: Record<CustomerType, string> = {
  BUSINESS: "bg-blue-100 text-blue-700",
  VISITOR: "bg-purple-100 text-purple-700",
};

const typeLabel: Record<CustomerType, string> = {
  BUSINESS: "Business",
  VISITOR: "Visitor",
};

const PAGE_SIZE = 10;

// ─── Form state shape ─────────────────────────────────────────────────────────

interface FormData {
  name: string;
  email: string;
  phone: string;
  company: string;
  address: string;
  notes: string;
  type: CustomerType;
}

const emptyForm: FormData = {
  name: "",
  email: "",
  phone: "",
  company: "",
  address: "",
  notes: "",
  type: "VISITOR",
};

// ─── Component ────────────────────────────────────────────────────────────────

export default function CustomerPage() {
  const [search, setSearch] = useState("");
  const [filterType, setFilterType] = useState<CustomerType | "">("");
  const [page, setPage] = useState(1);

  const [showAddModal, setShowAddModal] = useState(false);
  const [showEditModal, setShowEditModal] = useState(false);
  const [selectedCustomer, setSelectedCustomer] = useState<Customer | null>(null);
  const [formData, setFormData] = useState<FormData>(emptyForm);

  // delete confirmation modal
  const [deleteTarget, setDeleteTarget] = useState<Customer | null>(null);
  const [deleteConfirmName, setDeleteConfirmName] = useState("");

  // ── RTK Query hooks ──────────────────────────────────────────────────────────

  const { data, isLoading, isError } = useGetCustomersQuery({
    page,
    limit: PAGE_SIZE,
    search: search || undefined,
    type: filterType || undefined,
  });

  const [createCustomer, { isLoading: isCreating }] = useCreateCustomerMutation();
  const [updateCustomer, { isLoading: isUpdating }] = useUpdateCustomerMutation();
  const [deleteCustomer, { isLoading: isDeleting }] = useDeleteCustomerMutation();

  const customers = data?.customers ?? [];
  const totalPages = data?.totalPages ?? 1;
  const total = data?.total ?? 0;

  // ── Handlers ─────────────────────────────────────────────────────────────────

  const handleAdd = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    const payload: CreateCustomerPayload = {
      name: formData.name,
      email: formData.email.toLowerCase(),
      phone: formData.phone || undefined,
      company: formData.company || undefined,
      address: formData.address || undefined,
      notes: formData.notes || undefined,
      type: formData.type,
    };
    try {
      await createCustomer(payload).unwrap();
      toast.success("Customer created successfully");
      closeModal();
    } catch {
      toast.error("Failed to create customer. Please try again.");
    }
  };

  const handleEdit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    if (!selectedCustomer) return;
    try {
      await updateCustomer({
        id: selectedCustomer.id,
        name: formData.name,
        email: formData.email.toLowerCase(),
        phone: formData.phone || undefined,
        company: formData.company || undefined,
        address: formData.address || undefined,
        notes: formData.notes || undefined,
        type: formData.type,
      }).unwrap();
      toast.success("Customer updated successfully");
      closeModal();
    } catch {
      toast.error("Failed to update customer. Please try again.");
    }
  };

  const openDeleteModal = (customer: Customer) => {
    setDeleteTarget(customer);
    setDeleteConfirmName("");
  };

  const closeDeleteModal = () => {
    setDeleteTarget(null);
    setDeleteConfirmName("");
  };

  const handleDelete = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    if (!deleteTarget) return;
    try {
      await deleteCustomer(deleteTarget.id).unwrap();
      toast.success(`"${deleteTarget.name}" has been deleted`);
      closeDeleteModal();
    } catch {
      toast.error("Failed to delete customer. Please try again.");
    }
  };

  const openEditModal = (customer: Customer) => {
    setSelectedCustomer(customer);
    setFormData({
      name: customer.name,
      email: customer.email,
      phone: customer.phone ?? "",
      company: customer.company ?? "",
      address: customer.address ?? "",
      notes: customer.notes ?? "",
      type: customer.type,
    });
    setShowEditModal(true);
  };

  const closeModal = () => {
    setShowAddModal(false);
    setShowEditModal(false);
    setSelectedCustomer(null);
    setFormData(emptyForm);
  };

  const handleSearchChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setSearch(e.target.value);
    setPage(1);
  };

  const handleTypeFilter = (e: React.ChangeEvent<HTMLSelectElement>) => {
    setFilterType(e.target.value as CustomerType | "");
    setPage(1);
  };

  // ── Render ───────────────────────────────────────────────────────────────────

  return (
    <DashboardLayout userRole="sales" userName="Sales Officer" notificationCount={0}>
      <div className="space-y-6 font-[family-name:var(--font-family-primary)]">

        {/* Header */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
          <div>
            <h1 className="text-2xl md:text-3xl font-bold text-secondary-100">
              Customer Management
            </h1>
            <p className="text-sm text-custom-700 mt-1">
              Manage customer information and relationships
            </p>
          </div>
          <button
            onClick={() => setShowAddModal(true)}
            className="px-4 py-2 rounded-xl bg-primary-500 text-white font-semibold hover:bg-primary-600 transition-colors text-sm flex items-center gap-2 w-fit"
          >
            <HiOutlinePlus className="w-4 h-4" />
            Add New Customer
          </button>
        </div>

        {/* KPI Cards */}
        <div className="grid grid-cols-2 sm:grid-cols-3 gap-4">
          <Card className="!p-4">
            <div className="flex items-center gap-3 mb-2">
              <div className="w-10 h-10 rounded-xl bg-primary-100 flex items-center justify-center">
                <HiOutlineUsers className="w-5 h-5 text-primary-600" />
              </div>
            </div>
            <p className="text-2xl font-bold text-secondary-100">{total}</p>
            <p className="text-xs text-custom-700">Total Customers</p>
          </Card>
          <Card className="!p-4">
            <div className="flex items-center gap-3 mb-2">
              <div className="w-10 h-10 rounded-xl bg-blue-100 flex items-center justify-center">
                <HiOutlineOfficeBuilding className="w-5 h-5 text-blue-600" />
              </div>
            </div>
            <p className="text-2xl font-bold text-secondary-100">
              {customers.filter((c) => c.type === "BUSINESS").length}
            </p>
            <p className="text-xs text-custom-700">Business</p>
          </Card>
          <Card className="!p-4">
            <div className="flex items-center gap-3 mb-2">
              <div className="w-10 h-10 rounded-xl bg-purple-100 flex items-center justify-center">
                <HiOutlineUsers className="w-5 h-5 text-purple-600" />
              </div>
            </div>
            <p className="text-2xl font-bold text-secondary-100">
              {customers.filter((c) => c.type === "VISITOR").length}
            </p>
            <p className="text-xs text-custom-700">Visitors</p>
          </Card>
        </div>

        {/* Filters */}
        <Card className="!p-4">
          <div className="flex flex-col md:flex-row gap-3">
            <div className="relative flex-1">
              <HiOutlineSearch className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-custom-700" />
              <input
                type="text"
                placeholder="Search by name, email, company, or phone..."
                value={search}
                onChange={handleSearchChange}
                className="w-full pl-9 pr-4 py-2 rounded-xl border border-custom-300 bg-style-500 text-secondary-100 text-sm placeholder:text-custom-700 focus:outline-none focus:border-primary-400 focus:ring-2 focus:ring-primary-200 transition-colors duration-200"
              />
            </div>
            <select
              value={filterType}
              onChange={handleTypeFilter}
              className="px-4 py-2 rounded-xl border border-custom-300 bg-style-500 text-secondary-100 text-sm focus:outline-none focus:border-primary-400 focus:ring-2 focus:ring-primary-200 transition-colors duration-200"
            >
              <option value="">All Types</option>
              <option value="BUSINESS">Business</option>
              <option value="VISITOR">Visitor</option>
            </select>
          </div>
        </Card>

        {/* Table */}
        <Card className="!p-0 overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead className="bg-custom-100 border-b border-custom-300">
                <tr>
                  <th className="px-4 py-3 text-left text-xs font-bold text-secondary-100 uppercase">Name</th>
                  <th className="px-4 py-3 text-left text-xs font-bold text-secondary-100 uppercase">Company</th>
                  <th className="px-4 py-3 text-left text-xs font-bold text-secondary-100 uppercase">Contact</th>
                  <th className="px-4 py-3 text-left text-xs font-bold text-secondary-100 uppercase">Location</th>
                  <th className="px-4 py-3 text-left text-xs font-bold text-secondary-100 uppercase">Type</th>
                  <th className="px-4 py-3 text-left text-xs font-bold text-secondary-100 uppercase">Status</th>
                  <th className="px-4 py-3 text-right text-xs font-bold text-secondary-100 uppercase">Actions</th>
                </tr>
              </thead>
              <tbody className="bg-white divide-y divide-custom-200">
                {isLoading ? (
                  <tr>
                    <td colSpan={7} className="px-4 py-8 text-center text-custom-700">
                      Loading customers…
                    </td>
                  </tr>
                ) : isError ? (
                  <tr>
                    <td colSpan={7} className="px-4 py-8 text-center text-red-500">
                      Failed to load customers. Please try again.
                    </td>
                  </tr>
                ) : customers.length === 0 ? (
                  <tr>
                    <td colSpan={7} className="px-4 py-8 text-center text-custom-700">
                      No customers found
                    </td>
                  </tr>
                ) : (
                  customers.map((customer) => (
                    <tr key={customer.id} className="hover:bg-custom-50 transition-colors">
                      <td className="px-4 py-4">
                        <p className="text-sm font-semibold text-secondary-100">{customer.name}</p>
                        <NoteCell text={customer.notes ?? ""} />
                      </td>
                      <td className="px-4 py-4">
                        <span className="text-sm text-custom-700">{customer.company ?? "—"}</span>
                      </td>
                      <td className="px-4 py-4">
                        <div className="space-y-1">
                          <div className="flex items-center gap-1 text-xs text-custom-700">
                            <HiOutlineMail className="w-3 h-3" />
                            {customer.email}
                          </div>
                          {customer.phone && (
                            <div className="flex items-center gap-1 text-xs text-custom-700">
                              <HiOutlinePhone className="w-3 h-3" />
                              {customer.phone}
                            </div>
                          )}
                        </div>
                      </td>
                      <td className="px-4 py-4">
                        {(customer.address || customer.city || customer.country) ? (
                          <div className="flex items-start gap-1 text-xs text-custom-700">
                            <HiOutlineLocationMarker className="w-3 h-3 mt-0.5 flex-shrink-0" />
                            <span>
                              {[customer.address, customer.city, customer.country]
                                .filter(Boolean)
                                .join(", ")}
                            </span>
                          </div>
                        ) : (
                          <span className="text-xs text-custom-400">—</span>
                        )}
                      </td>
                      <td className="px-4 py-4">
                        <span className={`text-xs font-bold px-3 py-1 rounded-full ${typeColor[customer.type]}`}>
                          {typeLabel[customer.type]}
                        </span>
                      </td>
                      <td className="px-4 py-4">
                        <span
                          className={`text-xs font-bold px-3 py-1 rounded-full ${
                            customer.isActive
                              ? "bg-green-100 text-green-700"
                              : "bg-gray-100 text-gray-700"
                          }`}
                        >
                          {customer.isActive ? "Active" : "Inactive"}
                        </span>
                      </td>
                      <td className="px-4 py-4">
                        <div className="flex items-center justify-end gap-2">
                          <button
                            onClick={() => openEditModal(customer)}
                            className="p-2 rounded-lg hover:bg-primary-100 transition-colors"
                            title="Edit"
                          >
                            <HiOutlinePencil className="w-4 h-4 text-primary-500" />
                          </button>
                          <button
                            onClick={() => openDeleteModal(customer)}
                            className="p-2 rounded-lg hover:bg-red-100 transition-colors"
                            title="Delete"
                          >
                            <HiOutlineTrash className="w-4 h-4 text-red-500" />
                          </button>
                        </div>
                      </td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>

          {/* Pagination */}
          {totalPages > 1 && (
            <div className="flex items-center justify-between px-4 py-3 border-t border-custom-200">
              <p className="text-xs text-custom-700">
                Page {page} of {totalPages}
              </p>
              <div className="flex gap-2">
                <button
                  disabled={page <= 1}
                  onClick={() => setPage((p) => p - 1)}
                  className="px-3 py-1 rounded-lg border border-custom-300 text-sm text-secondary-100 disabled:opacity-40 hover:bg-custom-100 transition-colors"
                >
                  Previous
                </button>
                <button
                  disabled={page >= totalPages}
                  onClick={() => setPage((p) => p + 1)}
                  className="px-3 py-1 rounded-lg border border-custom-300 text-sm text-secondary-100 disabled:opacity-40 hover:bg-custom-100 transition-colors"
                >
                  Next
                </button>
              </div>
            </div>
          )}
        </Card>

        {/* Add / Edit Modal */}
        {(showAddModal || showEditModal) && (
          <div className="fixed inset-0 bg-secondary-100/50 z-50 flex items-start justify-center p-4 overflow-y-auto">
            <Card className="!p-6 max-w-2xl w-full my-8">
              <div className="flex items-center justify-between mb-6">
                <h3 className="text-xl font-bold text-secondary-100">
                  {showAddModal ? "Add New Customer" : "Edit Customer"}
                </h3>
                <button onClick={closeModal} className="text-custom-700 hover:text-secondary-100">
                  <HiOutlineX className="w-6 h-6" />
                </button>
              </div>

              <form onSubmit={showAddModal ? handleAdd : handleEdit} className="space-y-4">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">

                  {/* Name */}
                  <div>
                    <label className="block text-sm font-semibold text-secondary-100 mb-2">
                      Full Name <span className="text-red-500">*</span>
                    </label>
                    <Input
                      type="text"
                      placeholder="e.g., John Mugisha"
                      value={formData.name}
                      onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                      required
                      fullWidth
                    />
                  </div>

                  {/* Email */}
                  <div>
                    <label className="block text-sm font-semibold text-secondary-100 mb-2">
                      Email <span className="text-red-500">*</span>
                    </label>
                    <Input
                      type="email"
                      placeholder="email@example.com"
                      value={formData.email}
                      onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                      required
                      fullWidth
                    />
                  </div>

                  {/* Phone */}
                  <div>
                    <label className="block text-sm font-semibold text-secondary-100 mb-2">
                      Phone
                    </label>
                    <Input
                      type="tel"
                      placeholder="+250 788 123 456"
                      value={formData.phone}
                      onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
                      fullWidth
                    />
                  </div>

                  {/* Company */}
                  <div>
                    <label className="block text-sm font-semibold text-secondary-100 mb-2">
                      Company
                    </label>
                    <Input
                      type="text"
                      placeholder="e.g., ABC Corporation"
                      value={formData.company}
                      onChange={(e) => setFormData({ ...formData, company: e.target.value })}
                      fullWidth
                    />
                  </div>

                  {/* Type */}
                  <div>
                    <label className="block text-sm font-semibold text-secondary-100 mb-2">
                      Type <span className="text-red-500">*</span>
                    </label>
                    <select
                      value={formData.type}
                      onChange={(e) =>
                        setFormData({ ...formData, type: e.target.value as CustomerType })
                      }
                      required
                      className="w-full px-4 py-2.5 rounded-xl border border-custom-300 bg-style-500 text-secondary-100 focus:outline-none focus:border-primary-400 focus:ring-2 focus:ring-primary-200 transition-colors duration-200"
                    >
                      <option value="BUSINESS">Business</option>
                      <option value="VISITOR">Visitor</option>

                    </select>
                  </div>

                  {/* Address */}
                  <div>
                    <label className="block text-sm font-semibold text-secondary-100 mb-2">
                      Address
                    </label>
                    <Input
                      type="text"
                      placeholder="e.g., KN 5 Ave"
                      value={formData.address}
                      onChange={(e) => setFormData({ ...formData, address: e.target.value })}
                      fullWidth
                    />
                  </div>

                  {/* Notes */}
                  <div className="md:col-span-2">
                    <label className="block text-sm font-semibold text-secondary-100 mb-2">
                      Notes
                    </label>
                    <textarea
                      placeholder="Any additional notes about this customer…"
                      value={formData.notes}
                      onChange={(e) => setFormData({ ...formData, notes: e.target.value })}
                      rows={3}
                      className="w-full px-4 py-2.5 rounded-xl border border-custom-300 bg-style-500 text-secondary-100 text-sm placeholder:text-custom-700 focus:outline-none focus:border-primary-400 focus:ring-2 focus:ring-primary-200 transition-colors duration-200 resize-none"
                    />
                  </div>
                </div>

                <div className="flex gap-3 justify-end pt-4 border-t border-custom-300">
                  <Button type="button" variant="outline" onClick={closeModal}>
                    Cancel
                  </Button>
                  <Button type="submit" disabled={isCreating || isUpdating}>
                    {isCreating || isUpdating
                      ? "Saving…"
                      : showAddModal
                      ? "Add Customer"
                      : "Save Changes"}
                  </Button>
                </div>
              </form>
            </Card>
          </div>
        )}
        {/* Delete Confirmation Modal */}
        {deleteTarget && (
          <div className="fixed inset-0 bg-secondary-100/50 z-50 flex items-center justify-center p-4">
            <Card className="!p-6 max-w-md w-full">
              {/* Header */}
              <div className="flex items-start justify-between mb-4">
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 rounded-xl bg-red-100 flex items-center justify-center flex-shrink-0">
                    <HiOutlineTrash className="w-5 h-5 text-red-600" />
                  </div>
                  <div>
                    <h3 className="text-lg font-bold text-secondary-100">Delete Customer</h3>
                    <p className="text-xs text-custom-700">This action cannot be undone</p>
                  </div>
                </div>
                <button onClick={closeDeleteModal} className="text-custom-700 hover:text-secondary-100 ml-4">
                  <HiOutlineX className="w-5 h-5" />
                </button>
              </div>

              {/* Body */}
              <p className="text-sm text-custom-700 mb-1">
                To confirm, type{" "}
                <span className="font-bold text-secondary-100">{deleteTarget.name}</span>{" "}
                below:
              </p>

              <form onSubmit={handleDelete} className="space-y-4 mt-3">
                <Input
                  type="text"
                  placeholder={deleteTarget.name}
                  value={deleteConfirmName}
                  onChange={(e) => setDeleteConfirmName(e.target.value)}
                  fullWidth
                  autoFocus
                />

                <div className="flex gap-3 justify-end pt-2 border-t border-custom-300">
                  <Button type="button" variant="outline" onClick={closeDeleteModal}>
                    Cancel
                  </Button>
                  <button
                    type="submit"
                    disabled={deleteConfirmName !== deleteTarget.name || isDeleting}
                    className="px-4 py-2 rounded-xl bg-red-500 text-white font-semibold text-sm hover:bg-red-600 transition-colors disabled:opacity-40 disabled:cursor-not-allowed"
                  >
                    {isDeleting ? "Deleting…" : "Delete Customer"}
                  </button>
                </div>
              </form>
            </Card>
          </div>
        )}
      </div>
    </DashboardLayout>
  );
}
