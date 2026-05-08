import { useState } from "react";
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

interface Client {
  id: string;
  name: string;
  company: string;
  email: string;
  phone: string;
  address: string;
  type: "Individual" | "Corporate";
  status: "Active" | "Inactive";
  totalOrders: number;
  totalValue: number;
  lastOrder: string;
}

const initialClients: Client[] = [
  {
    id: "CLT-001",
    name: "John Mugisha",
    company: "ABC Corporation",
    email: "john@abccorp.rw",
    phone: "+250 788 123 456",
    address: "KN 5 Ave, Kigali",
    type: "Corporate",
    status: "Active",
    totalOrders: 15,
    totalValue: 4500000,
    lastOrder: "2026-04-28",
  },
  {
    id: "CLT-002",
    name: "Sarah Uwase",
    company: "Tech Startup Ltd",
    email: "sarah@techstartup.rw",
    phone: "+250 788 234 567",
    address: "KG 11 Ave, Kigali",
    type: "Corporate",
    status: "Active",
    totalOrders: 8,
    totalValue: 2300000,
    lastOrder: "2026-04-25",
  },
  {
    id: "CLT-003",
    name: "David Nkusi",
    company: "Personal",
    email: "david.nkusi@gmail.com",
    phone: "+250 788 345 678",
    address: "KK 15 St, Kigali",
    type: "Individual",
    status: "Active",
    totalOrders: 3,
    totalValue: 450000,
    lastOrder: "2026-04-20",
  },
  {
    id: "CLT-004",
    name: "Grace Mutesi",
    company: "Event Masters",
    email: "grace@eventmasters.rw",
    phone: "+250 788 456 789",
    address: "KN 20 Ave, Kigali",
    type: "Corporate",
    status: "Active",
    totalOrders: 12,
    totalValue: 3800000,
    lastOrder: "2026-04-26",
  },
  {
    id: "CLT-005",
    name: "Eric Habimana",
    company: "Personal",
    email: "eric.h@yahoo.com",
    phone: "+250 788 567 890",
    address: "KG 7 Ave, Kigali",
    type: "Individual",
    status: "Inactive",
    totalOrders: 1,
    totalValue: 120000,
    lastOrder: "2026-02-15",
  },
];

const statusColor: Record<string, string> = {
  Active: "bg-green-100 text-green-700",
  Inactive: "bg-gray-100 text-gray-700",
};

const typeColor: Record<string, string> = {
  Corporate: "bg-blue-100 text-blue-700",
  Individual: "bg-purple-100 text-purple-700",
};

export default function ClientsPage() {
  const [clients, setClients] = useState<Client[]>(initialClients);
  const [search, setSearch] = useState("");
  const [filterStatus, setFilterStatus] = useState<string>("All");
  const [filterType, setFilterType] = useState<string>("All");
  const [showAddModal, setShowAddModal] = useState(false);
  const [showEditModal, setShowEditModal] = useState(false);
  const [selectedClient, setSelectedClient] = useState<Client | null>(null);

  const [formData, setFormData] = useState({
    name: "",
    company: "",
    email: "",
    phone: "",
    address: "",
    type: "Corporate" as "Corporate" | "Individual",
    status: "Active" as "Active" | "Inactive",
  });

  const handleAdd = (e: React.FormEvent) => {
    e.preventDefault();
    const newClient: Client = {
      id: `CLT-${String(clients.length + 1).padStart(3, "0")}`,
      name: formData.name,
      company: formData.company || "Personal",
      email: formData.email,
      phone: formData.phone,
      address: formData.address,
      type: formData.type,
      status: formData.status,
      totalOrders: 0,
      totalValue: 0,
      lastOrder: "-",
    };
    setClients([...clients, newClient]);
    resetForm();
    setShowAddModal(false);
  };

  const handleEdit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedClient) return;

    setClients(
      clients.map((client) =>
        client.id === selectedClient.id
          ? {
              ...client,
              name: formData.name,
              company: formData.company || "Personal",
              email: formData.email,
              phone: formData.phone,
              address: formData.address,
              type: formData.type,
              status: formData.status,
            }
          : client
      )
    );
    resetForm();
    setShowEditModal(false);
    setSelectedClient(null);
  };

  const handleDelete = (id: string) => {
    if (confirm("Are you sure you want to delete this client?")) {
      setClients(clients.filter((client) => client.id !== id));
    }
  };

  const openEditModal = (client: Client) => {
    setSelectedClient(client);
    setFormData({
      name: client.name,
      company: client.company,
      email: client.email,
      phone: client.phone,
      address: client.address,
      type: client.type,
      status: client.status,
    });
    setShowEditModal(true);
  };

  const resetForm = () => {
    setFormData({
      name: "",
      company: "",
      email: "",
      phone: "",
      address: "",
      type: "Corporate",
      status: "Active",
    });
  };

  const filtered = clients.filter((client) => {
    const matchesSearch =
      client.name.toLowerCase().includes(search.toLowerCase()) ||
      client.id.toLowerCase().includes(search.toLowerCase()) ||
      client.company.toLowerCase().includes(search.toLowerCase()) ||
      client.email.toLowerCase().includes(search.toLowerCase());
    const matchesStatus = filterStatus === "All" || client.status === filterStatus;
    const matchesType = filterType === "All" || client.type === filterType;
    return matchesSearch && matchesStatus && matchesType;
  });

  const activeClients = clients.filter((c) => c.status === "Active").length;
  const corporateClients = clients.filter((c) => c.type === "Corporate").length;
  const totalValue = clients.reduce((sum, c) => sum + c.totalValue, 0);

  return (
    <DashboardLayout userRole="sales" userName="Sales Officer" notificationCount={0}>
      <div className="space-y-6 font-[family-name:var(--font-family-primary)]">
        {/* Header */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
          <div>
            <h1 className="text-2xl md:text-3xl font-bold text-secondary-100">
              Client Management
            </h1>
            <p className="text-sm text-custom-700 mt-1">
              Manage client information and relationships
            </p>
          </div>
          <button
            onClick={() => setShowAddModal(true)}
            className="px-4 py-2 rounded-xl bg-primary-500 text-white font-semibold hover:bg-primary-600 transition-colors text-sm flex items-center gap-2 w-fit"
          >
            <HiOutlinePlus className="w-4 h-4" />
            Add New Client
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
            <p className="text-2xl font-bold text-secondary-100">{clients.length}</p>
            <p className="text-xs text-custom-700">Total Clients</p>
          </Card>
          <Card className="!p-4">
            <div className="flex items-center gap-3 mb-2">
              <div className="w-10 h-10 rounded-xl bg-green-100 flex items-center justify-center">
                <HiOutlineUsers className="w-5 h-5 text-green-600" />
              </div>
            </div>
            <p className="text-2xl font-bold text-secondary-100">{activeClients}</p>
            <p className="text-xs text-custom-700">Active Clients</p>
          </Card>
          <Card className="!p-4">
            <div className="flex items-center gap-3 mb-2">
              <div className="w-10 h-10 rounded-xl bg-blue-100 flex items-center justify-center">
                <HiOutlineOfficeBuilding className="w-5 h-5 text-blue-600" />
              </div>
            </div>
            <p className="text-2xl font-bold text-secondary-100">{corporateClients}</p>
            <p className="text-xs text-custom-700">Corporate</p>
          </Card>
          <Card className="!p-4">
            <div className="flex items-center gap-3 mb-2">
              <div className="w-10 h-10 rounded-xl bg-yellow-100 flex items-center justify-center">
                <HiOutlineUsers className="w-5 h-5 text-yellow-600" />
              </div>
            </div>
            <p className="text-2xl font-bold text-secondary-100">
              {(totalValue / 1000000).toFixed(1)}M
            </p>
            <p className="text-xs text-custom-700">Total Value (RWF)</p>
          </Card>
        </div>

        {/* Filters */}
        <Card className="!p-4">
          <div className="flex flex-col md:flex-row gap-3">
            <div className="relative flex-1">
              <HiOutlineSearch className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-custom-700" />
              <input
                type="text"
                placeholder="Search by name, ID, company, or email..."
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                className="w-full pl-9 pr-4 py-2 rounded-xl border border-custom-300 bg-style-500 text-secondary-100 text-sm placeholder:text-custom-700 focus:outline-none focus:border-primary-400 focus:ring-2 focus:ring-primary-200 transition-colors duration-200"
              />
            </div>
            <select
              value={filterType}
              onChange={(e) => setFilterType(e.target.value)}
              className="px-4 py-2 rounded-xl border border-custom-300 bg-style-500 text-secondary-100 text-sm focus:outline-none focus:border-primary-400 focus:ring-2 focus:ring-primary-200 transition-colors duration-200"
            >
              <option value="All">All Types</option>
              <option value="Corporate">Corporate</option>
              <option value="Individual">Individual</option>
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

        {/* Clients Table */}
        <Card className="!p-0 overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead className="bg-custom-100 border-b border-custom-300">
                <tr>
                  <th className="px-4 py-3 text-left text-xs font-bold text-secondary-100 uppercase">Client ID</th>
                  <th className="px-4 py-3 text-left text-xs font-bold text-secondary-100 uppercase">Name & Company</th>
                  <th className="px-4 py-3 text-left text-xs font-bold text-secondary-100 uppercase">Contact</th>
                  <th className="px-4 py-3 text-left text-xs font-bold text-secondary-100 uppercase">Address</th>
                  <th className="px-4 py-3 text-left text-xs font-bold text-secondary-100 uppercase">Type</th>
                  <th className="px-4 py-3 text-left text-xs font-bold text-secondary-100 uppercase">Status</th>
                  <th className="px-4 py-3 text-left text-xs font-bold text-secondary-100 uppercase">Orders</th>
                  <th className="px-4 py-3 text-left text-xs font-bold text-secondary-100 uppercase">Total Value</th>
                  <th className="px-4 py-3 text-right text-xs font-bold text-secondary-100 uppercase">Actions</th>
                </tr>
              </thead>
              <tbody className="bg-white divide-y divide-custom-200">
                {filtered.length === 0 ? (
                  <tr>
                    <td colSpan={9} className="px-4 py-8 text-center text-custom-700">
                      No clients found
                    </td>
                  </tr>
                ) : (
                  filtered.map((client) => (
                    <tr key={client.id} className="hover:bg-custom-50 transition-colors">
                      <td className="px-4 py-4">
                        <span className="text-sm font-bold text-primary-600">{client.id}</span>
                      </td>
                      <td className="px-4 py-4">
                        <div>
                          <p className="text-sm font-semibold text-secondary-100">{client.name}</p>
                          <p className="text-xs text-custom-700">{client.company}</p>
                        </div>
                      </td>
                      <td className="px-4 py-4">
                        <div className="space-y-1">
                          <div className="flex items-center gap-1 text-xs text-custom-700">
                            <HiOutlineMail className="w-3 h-3" />
                            {client.email}
                          </div>
                          <div className="flex items-center gap-1 text-xs text-custom-700">
                            <HiOutlinePhone className="w-3 h-3" />
                            {client.phone}
                          </div>
                        </div>
                      </td>
                      <td className="px-4 py-4">
                        <div className="flex items-center gap-1 text-sm text-custom-700">
                          <HiOutlineLocationMarker className="w-4 h-4 flex-shrink-0" />
                          <span>{client.address}</span>
                        </div>
                      </td>
                      <td className="px-4 py-4">
                        <span className={`text-xs font-bold px-3 py-1 rounded-full ${typeColor[client.type]}`}>
                          {client.type}
                        </span>
                      </td>
                      <td className="px-4 py-4">
                        <span className={`text-xs font-bold px-3 py-1 rounded-full ${statusColor[client.status]}`}>
                          {client.status}
                        </span>
                      </td>
                      <td className="px-4 py-4">
                        <span className="text-sm font-bold text-secondary-100">{client.totalOrders}</span>
                      </td>
                      <td className="px-4 py-4">
                        <span className="text-sm font-bold text-secondary-100">
                          {(client.totalValue / 1000).toLocaleString()}K
                        </span>
                      </td>
                      <td className="px-4 py-4">
                        <div className="flex items-center justify-end gap-2">
                          <button
                            onClick={() => openEditModal(client)}
                            className="p-2 rounded-lg hover:bg-primary-100 transition-colors"
                            title="Edit"
                          >
                            <HiOutlinePencil className="w-4 h-4 text-primary-500" />
                          </button>
                          <button
                            onClick={() => handleDelete(client.id)}
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
                  {showAddModal ? "Add New Client" : "Edit Client"}
                </h3>
                <button
                  onClick={() => {
                    setShowAddModal(false);
                    setShowEditModal(false);
                    setSelectedClient(null);
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
                      Client Name *
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
                  <div>
                    <label className="block text-sm font-semibold text-secondary-100 mb-2">
                      Company
                    </label>
                    <Input
                      type="text"
                      placeholder="e.g., ABC Corporation (optional)"
                      value={formData.company}
                      onChange={(e) => setFormData({ ...formData, company: e.target.value })}
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
                      Type *
                    </label>
                    <select
                      value={formData.type}
                      onChange={(e) => setFormData({ ...formData, type: e.target.value as "Corporate" | "Individual" })}
                      required
                      className="w-full px-4 py-2.5 rounded-xl border border-custom-300 bg-style-500 text-secondary-100 focus:outline-none focus:border-primary-400 focus:ring-2 focus:ring-primary-200 transition-colors duration-200"
                    >
                      <option value="Corporate">Corporate</option>
                      <option value="Individual">Individual</option>
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
                      setSelectedClient(null);
                      resetForm();
                    }}
                  >
                    Cancel
                  </Button>
                  <Button type="submit">
                    {showAddModal ? "Add Client" : "Save Changes"}
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
