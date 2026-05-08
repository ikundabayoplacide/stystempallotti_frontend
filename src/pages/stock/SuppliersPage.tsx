import { useState } from "react";
import {
    HiOutlineCheckCircle,
    HiOutlineExclamationCircle,
    HiOutlineLocationMarker,
    HiOutlineMail,
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

interface Supplier {
  id: string;
  name: string;
  contact: string;
  email: string;
  phone: string;
  address: string;
  category: string;
  status: "Active" | "Inactive";
  totalOrders: number;
  lastOrder: string;
  rating: number;
}

const initialSuppliers: Supplier[] = [
  {
    id: "SUP-001",
    name: "Paper Plus Ltd",
    contact: "John Mugisha",
    email: "info@paperplus.rw",
    phone: "+250 788 123 456",
    address: "KN 5 Ave, Kigali",
    category: "Paper",
    status: "Active",
    totalOrders: 45,
    lastOrder: "2026-04-28",
    rating: 4.5,
  },
  {
    id: "SUP-002",
    name: "Ink Solutions",
    contact: "Sarah Uwase",
    email: "sales@inksolutions.rw",
    phone: "+250 788 234 567",
    address: "KG 11 Ave, Kigali",
    category: "Ink",
    status: "Active",
    totalOrders: 32,
    lastOrder: "2026-04-26",
    rating: 4.8,
  },
  {
    id: "SUP-003",
    name: "Binding Supplies Co",
    contact: "David Nkusi",
    email: "contact@bindingsupplies.rw",
    phone: "+250 788 345 678",
    address: "KK 15 St, Kigali",
    category: "Binding",
    status: "Active",
    totalOrders: 28,
    lastOrder: "2026-04-22",
    rating: 4.2,
  },
  {
    id: "SUP-004",
    name: "Packaging Masters",
    contact: "Grace Mutesi",
    email: "info@packagingmasters.rw",
    phone: "+250 788 456 789",
    address: "KN 20 Ave, Kigali",
    category: "Packaging",
    status: "Active",
    totalOrders: 18,
    lastOrder: "2026-04-25",
    rating: 4.6,
  },
  {
    id: "SUP-005",
    name: "Office Supplies Rwanda",
    contact: "Eric Habimana",
    email: "sales@officesupplies.rw",
    phone: "+250 788 567 890",
    address: "KG 7 Ave, Kigali",
    category: "Other",
    status: "Inactive",
    totalOrders: 12,
    lastOrder: "2026-03-15",
    rating: 3.8,
  },
];

const statusColor: Record<string, string> = {
  Active: "bg-green-100 text-green-700",
  Inactive: "bg-gray-100 text-gray-700",
};

export default function SuppliersPage() {
  const [suppliers, setSuppliers] = useState<Supplier[]>(initialSuppliers);
  const [search, setSearch] = useState("");
  const [filterStatus, setFilterStatus] = useState<string>("All");
  const [filterCategory, setFilterCategory] = useState<string>("All");
  const [showAddModal, setShowAddModal] = useState(false);
  const [showEditModal, setShowEditModal] = useState(false);
  const [selectedSupplier, setSelectedSupplier] = useState<Supplier | null>(null);

  const [formData, setFormData] = useState({
    name: "",
    contact: "",
    email: "",
    phone: "",
    address: "",
    category: "Paper",
    status: "Active" as "Active" | "Inactive",
  });

  const handleAdd = (e: React.FormEvent) => {
    e.preventDefault();
    const newSupplier: Supplier = {
      id: `SUP-${String(suppliers.length + 1).padStart(3, "0")}`,
      name: formData.name,
      contact: formData.contact,
      email: formData.email,
      phone: formData.phone,
      address: formData.address,
      category: formData.category,
      status: formData.status,
      totalOrders: 0,
      lastOrder: "-",
      rating: 0,
    };
    setSuppliers([...suppliers, newSupplier]);
    resetForm();
    setShowAddModal(false);
  };

  const handleEdit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedSupplier) return;

    setSuppliers(
      suppliers.map((supplier) =>
        supplier.id === selectedSupplier.id
          ? {
              ...supplier,
              name: formData.name,
              contact: formData.contact,
              email: formData.email,
              phone: formData.phone,
              address: formData.address,
              category: formData.category,
              status: formData.status,
            }
          : supplier
      )
    );
    resetForm();
    setShowEditModal(false);
    setSelectedSupplier(null);
  };

  const handleDelete = (id: string) => {
    if (confirm("Are you sure you want to delete this supplier?")) {
      setSuppliers(suppliers.filter((supplier) => supplier.id !== id));
    }
  };

  const openEditModal = (supplier: Supplier) => {
    setSelectedSupplier(supplier);
    setFormData({
      name: supplier.name,
      contact: supplier.contact,
      email: supplier.email,
      phone: supplier.phone,
      address: supplier.address,
      category: supplier.category,
      status: supplier.status,
    });
    setShowEditModal(true);
  };

  const resetForm = () => {
    setFormData({
      name: "",
      contact: "",
      email: "",
      phone: "",
      address: "",
      category: "Paper",
      status: "Active",
    });
  };

  const filtered = suppliers.filter((supplier) => {
    const matchesSearch =
      supplier.name.toLowerCase().includes(search.toLowerCase()) ||
      supplier.id.toLowerCase().includes(search.toLowerCase()) ||
      supplier.contact.toLowerCase().includes(search.toLowerCase());
    const matchesStatus = filterStatus === "All" || supplier.status === filterStatus;
    const matchesCategory = filterCategory === "All" || supplier.category === filterCategory;
    return matchesSearch && matchesStatus && matchesCategory;
  });

  const activeSuppliers = suppliers.filter((s) => s.status === "Active").length;
  const inactiveSuppliers = suppliers.filter((s) => s.status === "Inactive").length;
  const totalOrders = suppliers.reduce((sum, s) => sum + s.totalOrders, 0);

  return (
    <DashboardLayout userRole="stock" userName="Stock Manager" notificationCount={0}>
      <div className="space-y-6 font-[family-name:var(--font-family-primary)]">
        {/* Header */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
          <div>
            <h1 className="text-2xl md:text-3xl font-bold text-secondary-100">
              Supplier Management
            </h1>
            <p className="text-sm text-custom-700 mt-1">
              Manage supplier information and relationships
            </p>
          </div>
          <button
            onClick={() => setShowAddModal(true)}
            className="px-4 py-2 rounded-xl bg-primary-500 text-white font-semibold hover:bg-primary-600 transition-colors text-sm flex items-center gap-2 w-fit"
          >
            <HiOutlinePlus className="w-4 h-4" />
            Add New Supplier
          </button>
        </div>

        {/* KPI Cards */}
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
          <Card className="!p-4">
            <div className="flex items-center gap-3 mb-2">
              <div className="w-10 h-10 rounded-xl bg-primary-100 flex items-center justify-center">
                <HiOutlineUsers className="w-5 h-5 text-primary-600" />
              </div>
            </div>
            <p className="text-2xl font-bold text-secondary-100">{suppliers.length}</p>
            <p className="text-xs text-custom-700">Total Suppliers</p>
          </Card>
          <Card className="!p-4">
            <div className="flex items-center gap-3 mb-2">
              <div className="w-10 h-10 rounded-xl bg-green-100 flex items-center justify-center">
                <HiOutlineCheckCircle className="w-5 h-5 text-green-600" />
              </div>
            </div>
            <p className="text-2xl font-bold text-secondary-100">{activeSuppliers}</p>
            <p className="text-xs text-custom-700">Active</p>
          </Card>
          <Card className="!p-4">
            <div className="flex items-center gap-3 mb-2">
              <div className="w-10 h-10 rounded-xl bg-gray-100 flex items-center justify-center">
                <HiOutlineExclamationCircle className="w-5 h-5 text-gray-600" />
              </div>
            </div>
            <p className="text-2xl font-bold text-secondary-100">{inactiveSuppliers}</p>
            <p className="text-xs text-custom-700">Inactive</p>
          </Card>
          <Card className="!p-4">
            <div className="flex items-center gap-3 mb-2">
              <div className="w-10 h-10 rounded-xl bg-blue-100 flex items-center justify-center">
                <HiOutlineCheckCircle className="w-5 h-5 text-blue-600" />
              </div>
            </div>
            <p className="text-2xl font-bold text-secondary-100">{totalOrders}</p>
            <p className="text-xs text-custom-700">Total Orders</p>
          </Card>
        </div>

        {/* Filters */}
        <Card className="!p-4">
          <div className="flex flex-col md:flex-row gap-3">
            <div className="relative flex-1">
              <HiOutlineSearch className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-custom-700" />
              <input
                type="text"
                placeholder="Search by name, ID, or contact..."
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                className="w-full pl-9 pr-4 py-2 rounded-xl border border-custom-300 bg-style-500 text-secondary-100 text-sm placeholder:text-custom-700 focus:outline-none focus:border-primary-400 focus:ring-2 focus:ring-primary-200 transition-colors duration-200"
              />
            </div>
            <select
              value={filterCategory}
              onChange={(e) => setFilterCategory(e.target.value)}
              className="px-4 py-2 rounded-xl border border-custom-300 bg-style-500 text-secondary-100 text-sm focus:outline-none focus:border-primary-400 focus:ring-2 focus:ring-primary-200 transition-colors duration-200"
            >
              <option value="All">All Categories</option>
              <option value="Paper">Paper</option>
              <option value="Ink">Ink</option>
              <option value="Binding">Binding</option>
              <option value="Packaging">Packaging</option>
              <option value="Other">Other</option>
            </select>
            <select
              value={filterStatus}
              onChange={(e) => setFilterStatus(e.target.value)}
              className="px-4 py-2 rounded-xl border border-custom-300 bg-style-500 text-secondary-100 text-sm focus:outline-none focus:border-primary-400 focus:ring-2 focus:ring-primary-200 transition-colors duration-200"
            >
              <option value="All">All Status</option>
              <option value="Active">Active</option>
              <option value="Inactive">Inactive</option>
            </select>
          </div>
        </Card>

        {/* Suppliers Table */}
        <Card className="!p-0 overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead className="bg-custom-100 border-b border-custom-300">
                <tr>
                  <th className="px-4 py-3 text-left text-xs font-bold text-secondary-100 uppercase">Supplier ID</th>
                  <th className="px-4 py-3 text-left text-xs font-bold text-secondary-100 uppercase">Name & Contact</th>
                  <th className="px-4 py-3 text-left text-xs font-bold text-secondary-100 uppercase">Email & Phone</th>
                  <th className="px-4 py-3 text-left text-xs font-bold text-secondary-100 uppercase">Address</th>
                  <th className="px-4 py-3 text-left text-xs font-bold text-secondary-100 uppercase">Category</th>
                  <th className="px-4 py-3 text-left text-xs font-bold text-secondary-100 uppercase">Status</th>
                  <th className="px-4 py-3 text-left text-xs font-bold text-secondary-100 uppercase">Orders</th>
                  <th className="px-4 py-3 text-left text-xs font-bold text-secondary-100 uppercase">Last Order</th>
                  <th className="px-4 py-3 text-right text-xs font-bold text-secondary-100 uppercase">Actions</th>
                </tr>
              </thead>
              <tbody className="bg-white divide-y divide-custom-200">
                {filtered.length === 0 ? (
                  <tr>
                    <td colSpan={9} className="px-4 py-8 text-center text-custom-700">
                      No suppliers found
                    </td>
                  </tr>
                ) : (
                  filtered.map((supplier) => (
                    <tr key={supplier.id} className="hover:bg-custom-50 transition-colors">
                      <td className="px-4 py-4">
                        <span className="text-sm font-bold text-primary-600">{supplier.id}</span>
                      </td>
                      <td className="px-4 py-4">
                        <div>
                          <p className="text-sm font-semibold text-secondary-100">{supplier.name}</p>
                          <p className="text-xs text-custom-700">{supplier.contact}</p>
                        </div>
                      </td>
                      <td className="px-4 py-4">
                        <div className="space-y-1">
                          <div className="flex items-center gap-1 text-xs text-custom-700">
                            <HiOutlineMail className="w-3 h-3" />
                            {supplier.email}
                          </div>
                          <div className="flex items-center gap-1 text-xs text-custom-700">
                            <HiOutlinePhone className="w-3 h-3" />
                            {supplier.phone}
                          </div>
                        </div>
                      </td>
                      <td className="px-4 py-4">
                        <div className="flex items-center gap-1 text-sm text-custom-700">
                          <HiOutlineLocationMarker className="w-4 h-4 flex-shrink-0" />
                          <span>{supplier.address}</span>
                        </div>
                      </td>
                      <td className="px-4 py-4">
                        <span className="text-sm text-secondary-100">{supplier.category}</span>
                      </td>
                      <td className="px-4 py-4">
                        <span className={`text-xs font-bold px-3 py-1 rounded-full ${statusColor[supplier.status]}`}>
                          {supplier.status}
                        </span>
                      </td>
                      <td className="px-4 py-4">
                        <span className="text-sm font-bold text-secondary-100">{supplier.totalOrders}</span>
                      </td>
                      <td className="px-4 py-4">
                        <span className="text-sm text-custom-700">{supplier.lastOrder}</span>
                      </td>
                      <td className="px-4 py-4">
                        <div className="flex items-center justify-end gap-2">
                          <button
                            onClick={() => openEditModal(supplier)}
                            className="p-2 rounded-lg hover:bg-primary-100 transition-colors"
                            title="Edit"
                          >
                            <HiOutlinePencil className="w-4 h-4 text-primary-500" />
                          </button>
                          <button
                            onClick={() => handleDelete(supplier.id)}
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
        </Card>

        {/* Add/Edit Modal */}
        {(showAddModal || showEditModal) && (
          <div className="fixed inset-0 bg-secondary-100/50 z-50 flex items-start justify-center p-4 overflow-y-auto">
            <Card className="!p-6 max-w-2xl w-full my-8">
              <div className="flex items-center justify-between mb-6">
                <h3 className="text-xl font-bold text-secondary-100">
                  {showAddModal ? "Add New Supplier" : "Edit Supplier"}
                </h3>
                <button
                  onClick={() => {
                    setShowAddModal(false);
                    setShowEditModal(false);
                    setSelectedSupplier(null);
                    resetForm();
                  }}
                  className="text-custom-700 hover:text-secondary-100"
                >
                  <HiOutlineX className="w-6 h-6" />
                </button>
              </div>

              <form onSubmit={showAddModal ? handleAdd : handleEdit} className="space-y-4">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-semibold text-secondary-100 mb-2">
                      Supplier Name *
                    </label>
                    <Input
                      type="text"
                      placeholder="e.g., Paper Plus Ltd"
                      value={formData.name}
                      onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                      required
                      fullWidth
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-semibold text-secondary-100 mb-2">
                      Contact Person *
                    </label>
                    <Input
                      type="text"
                      placeholder="e.g., John Mugisha"
                      value={formData.contact}
                      onChange={(e) => setFormData({ ...formData, contact: e.target.value })}
                      required
                      fullWidth
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-semibold text-secondary-100 mb-2">
                      Email *
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
                  <div>
                    <label className="block text-sm font-semibold text-secondary-100 mb-2">
                      Phone *
                    </label>
                    <Input
                      type="tel"
                      placeholder="+250 788 123 456"
                      value={formData.phone}
                      onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
                      required
                      fullWidth
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-semibold text-secondary-100 mb-2">
                      Category *
                    </label>
                    <select
                      value={formData.category}
                      onChange={(e) => setFormData({ ...formData, category: e.target.value })}
                      required
                      className="w-full px-4 py-2.5 rounded-xl border border-custom-300 bg-style-500 text-secondary-100 focus:outline-none focus:border-primary-400 focus:ring-2 focus:ring-primary-200 transition-colors duration-200"
                    >
                      <option value="Paper">Paper</option>
                      <option value="Ink">Ink</option>
                      <option value="Binding">Binding</option>
                      <option value="Packaging">Packaging</option>
                      <option value="Other">Other</option>
                    </select>
                  </div>
                  <div>
                    <label className="block text-sm font-semibold text-secondary-100 mb-2">
                      Status *
                    </label>
                    <select
                      value={formData.status}
                      onChange={(e) => setFormData({ ...formData, status: e.target.value as "Active" | "Inactive" })}
                      required
                      className="w-full px-4 py-2.5 rounded-xl border border-custom-300 bg-style-500 text-secondary-100 focus:outline-none focus:border-primary-400 focus:ring-2 focus:ring-primary-200 transition-colors duration-200"
                    >
                      <option value="Active">Active</option>
                      <option value="Inactive">Inactive</option>
                    </select>
                  </div>
                  <div className="md:col-span-2">
                    <label className="block text-sm font-semibold text-secondary-100 mb-2">
                      Address *
                    </label>
                    <Input
                      type="text"
                      placeholder="e.g., KN 5 Ave, Kigali"
                      value={formData.address}
                      onChange={(e) => setFormData({ ...formData, address: e.target.value })}
                      required
                      fullWidth
                    />
                  </div>
                </div>

                <div className="flex gap-3 justify-end pt-4 border-t border-custom-300">
                  <Button
                    type="button"
                    variant="outline"
                    onClick={() => {
                      setShowAddModal(false);
                      setShowEditModal(false);
                      setSelectedSupplier(null);
                      resetForm();
                    }}
                  >
                    Cancel
                  </Button>
                  <Button type="submit">
                    {showAddModal ? "Add Supplier" : "Save Changes"}
                  </Button>
                </div>
              </form>
            </Card>
          </div>
        )}
      </div>
    </DashboardLayout>
  );
}
