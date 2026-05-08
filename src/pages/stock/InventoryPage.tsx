import { useState } from "react";
import {
    HiOutlineArchive,
    HiOutlineCheckCircle,
    HiOutlineExclamationCircle,
    HiOutlinePencil,
    HiOutlinePlus,
    HiOutlineSearch,
    HiOutlineTrash,
    HiOutlineTrendingDown,
    HiOutlineX,
} from "react-icons/hi";
import { DashboardLayout } from "../../components";
import { Button, Card, Input } from "../../components/ui";

interface StockItem {
  id: string;
  name: string;
  category: string;
  qty: number;
  unit: string;
  minLevel: number;
  status: string;
  supplier: string;
  cost: number;
  lastRestocked: string;
  lastUsed: string;
}

const initialStockItems: StockItem[] = [
  {
    id: "STK-001",
    name: "A4 Paper (80gsm)",
    category: "Paper",
    qty: 2,
    unit: "reams",
    minLevel: 10,
    status: "Low",
    supplier: "Paper Plus Ltd",
    cost: 15000,
    lastRestocked: "2026-04-25",
    lastUsed: "2026-04-30",
  },
  {
    id: "STK-002",
    name: "Black Ink Cartridge",
    category: "Ink",
    qty: 1,
    unit: "units",
    minLevel: 5,
    status: "Critical",
    supplier: "Ink Solutions",
    cost: 45000,
    lastRestocked: "2026-04-20",
    lastUsed: "2026-04-30",
  },
  {
    id: "STK-003",
    name: "Binding Wire",
    category: "Binding",
    qty: 5,
    unit: "rolls",
    minLevel: 10,
    status: "Low",
    supplier: "Binding Supplies Co",
    cost: 8000,
    lastRestocked: "2026-04-22",
    lastUsed: "2026-04-29",
  },
  {
    id: "STK-004",
    name: "A3 Paper (100gsm)",
    category: "Paper",
    qty: 25,
    unit: "reams",
    minLevel: 15,
    status: "Good",
    supplier: "Paper Plus Ltd",
    cost: 22000,
    lastRestocked: "2026-04-28",
    lastUsed: "2026-04-28",
  },
  {
    id: "STK-005",
    name: "Cyan Ink Cartridge",
    category: "Ink",
    qty: 8,
    unit: "units",
    minLevel: 5,
    status: "Good",
    supplier: "Ink Solutions",
    cost: 45000,
    lastRestocked: "2026-04-26",
    lastUsed: "2026-04-30",
  },
  {
    id: "STK-006",
    name: "Spiral Binding Coils",
    category: "Binding",
    qty: 0,
    unit: "boxes",
    minLevel: 5,
    status: "Out of Stock",
    supplier: "Binding Supplies Co",
    cost: 12000,
    lastRestocked: "2026-04-15",
    lastUsed: "2026-04-27",
  },
  {
    id: "STK-007",
    name: "Glossy Paper (A4)",
    category: "Paper",
    qty: 15,
    unit: "reams",
    minLevel: 10,
    status: "Good",
    supplier: "Paper Plus Ltd",
    cost: 18000,
    lastRestocked: "2026-04-27",
    lastUsed: "2026-04-29",
  },
];

const statusColor: Record<string, string> = {
  Good: "bg-green-100 text-green-700",
  Low: "bg-yellow-100 text-yellow-700",
  Critical: "bg-orange-100 text-orange-700",
  "Out of Stock": "bg-red-100 text-red-700",
};

export default function InventoryPage() {
  const [stockItems, setStockItems] = useState<StockItem[]>(initialStockItems);
  const [search, setSearch] = useState("");
  const [filterStatus, setFilterStatus] = useState<string>("All");
  const [filterCategory, setFilterCategory] = useState<string>("All");
  const [showAddModal, setShowAddModal] = useState(false);
  const [showEditModal, setShowEditModal] = useState(false);
  const [selectedItem, setSelectedItem] = useState<StockItem | null>(null);

  const [formData, setFormData] = useState({
    itemName: "",
    category: "Paper",
    quantity: "",
    unit: "reams",
    minLevel: "",
    supplier: "",
    cost: "",
  });

  const handleAdd = (e: React.FormEvent) => {
    e.preventDefault();
    const newItem: StockItem = {
      id: `STK-${String(stockItems.length + 1).padStart(3, "0")}`,
      name: formData.itemName,
      category: formData.category,
      qty: Number(formData.quantity),
      unit: formData.unit,
      minLevel: Number(formData.minLevel),
      status: Number(formData.quantity) === 0 ? "Out of Stock" : Number(formData.quantity) < Number(formData.minLevel) ? "Low" : "Good",
      supplier: formData.supplier,
      cost: Number(formData.cost),
      lastRestocked: new Date().toISOString().split("T")[0],
      lastUsed: "-",
    };
    setStockItems([...stockItems, newItem]);
    setFormData({
      itemName: "",
      category: "Paper",
      quantity: "",
      unit: "reams",
      minLevel: "",
      supplier: "",
      cost: "",
    });
    setShowAddModal(false);
  };

  const handleEdit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedItem) return;
    
    setStockItems(
      stockItems.map((item) =>
        item.id === selectedItem.id
          ? {
              ...item,
              name: formData.itemName,
              category: formData.category,
              qty: Number(formData.quantity),
              unit: formData.unit,
              minLevel: Number(formData.minLevel),
              status: Number(formData.quantity) === 0 ? "Out of Stock" : Number(formData.quantity) < Number(formData.minLevel) ? "Low" : "Good",
              supplier: formData.supplier,
              cost: Number(formData.cost),
            }
          : item
      )
    );
    setShowEditModal(false);
    setSelectedItem(null);
    setFormData({
      itemName: "",
      category: "Paper",
      quantity: "",
      unit: "reams",
      minLevel: "",
      supplier: "",
      cost: "",
    });
  };

  const handleDelete = (id: string) => {
    if (confirm("Are you sure you want to delete this item?")) {
      setStockItems(stockItems.filter((item) => item.id !== id));
    }
  };

  const openEditModal = (item: StockItem) => {
    setSelectedItem(item);
    setFormData({
      itemName: item.name,
      category: item.category,
      quantity: String(item.qty),
      unit: item.unit,
      minLevel: String(item.minLevel),
      supplier: item.supplier,
      cost: String(item.cost),
    });
    setShowEditModal(true);
  };

  const filtered = stockItems.filter((item) => {
    const matchesSearch =
      item.name.toLowerCase().includes(search.toLowerCase()) ||
      item.id.toLowerCase().includes(search.toLowerCase());
    const matchesStatus = filterStatus === "All" || item.status === filterStatus;
    const matchesCategory = filterCategory === "All" || item.category === filterCategory;
    return matchesSearch && matchesStatus && matchesCategory;
  });

  const totalItems = stockItems.length;
  const lowStock = stockItems.filter((i) => i.status === "Low" || i.status === "Critical").length;
  const outOfStock = stockItems.filter((i) => i.status === "Out of Stock").length;
  const wellStocked = stockItems.filter((i) => i.status === "Good").length;

  return (
    <DashboardLayout userRole="stock" userName="Stock Manager" notificationCount={lowStock + outOfStock}>
      <div className="space-y-6 font-[family-name:var(--font-family-primary)]">
        {/* Header */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
          <div>
            <h1 className="text-2xl md:text-3xl font-bold text-secondary-100">
              Inventory Management
            </h1>
            <p className="text-sm text-custom-700 mt-1">
              Complete inventory list with stock levels and details
            </p>
          </div>
          <button
            onClick={() => setShowAddModal(true)}
            className="px-4 py-2 rounded-xl bg-primary-500 text-white font-semibold hover:bg-primary-600 transition-colors text-sm flex items-center gap-2 w-fit"
          >
            <HiOutlinePlus className="w-4 h-4" />
            Add New Item
          </button>
        </div>

        {/* KPI Cards */}
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
          <Card className="!p-4">
            <div className="flex items-center gap-3 mb-2">
              <div className="w-10 h-10 rounded-xl bg-primary-100 flex items-center justify-center">
                <HiOutlineArchive className="w-5 h-5 text-primary-600" />
              </div>
            </div>
            <p className="text-2xl font-bold text-secondary-100">{totalItems}</p>
            <p className="text-xs text-custom-700">Total Items</p>
          </Card>
          <Card className="!p-4">
            <div className="flex items-center gap-3 mb-2">
              <div className="w-10 h-10 rounded-xl bg-yellow-100 flex items-center justify-center">
                <HiOutlineExclamationCircle className="w-5 h-5 text-yellow-600" />
              </div>
            </div>
            <p className="text-2xl font-bold text-secondary-100">{lowStock}</p>
            <p className="text-xs text-custom-700">Low Stock</p>
          </Card>
          <Card className="!p-4">
            <div className="flex items-center gap-3 mb-2">
              <div className="w-10 h-10 rounded-xl bg-red-100 flex items-center justify-center">
                <HiOutlineTrendingDown className="w-5 h-5 text-red-600" />
              </div>
            </div>
            <p className="text-2xl font-bold text-secondary-100">{outOfStock}</p>
            <p className="text-xs text-custom-700">Out of Stock</p>
          </Card>
          <Card className="!p-4">
            <div className="flex items-center gap-3 mb-2">
              <div className="w-10 h-10 rounded-xl bg-green-100 flex items-center justify-center">
                <HiOutlineCheckCircle className="w-5 h-5 text-green-600" />
              </div>
            </div>
            <p className="text-2xl font-bold text-secondary-100">{wellStocked}</p>
            <p className="text-xs text-custom-700">Well Stocked</p>
          </Card>
        </div>

        {/* Filters */}
        <Card className="!p-4">
          <div className="flex flex-col md:flex-row gap-3">
            <div className="relative flex-1">
              <HiOutlineSearch className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-custom-700" />
              <input
                type="text"
                placeholder="Search by name or ID..."
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
              <option value="Good">Good</option>
              <option value="Low">Low</option>
              <option value="Critical">Critical</option>
              <option value="Out of Stock">Out of Stock</option>
            </select>
          </div>
        </Card>

        {/* Inventory Table */}
        <Card className="!p-0 overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead className="bg-custom-100 border-b border-custom-300">
                <tr>
                  <th className="px-4 py-3 text-left text-xs font-bold text-secondary-100 uppercase">Item ID</th>
                  <th className="px-4 py-3 text-left text-xs font-bold text-secondary-100 uppercase">Name</th>
                  <th className="px-4 py-3 text-left text-xs font-bold text-secondary-100 uppercase">Category</th>
                  <th className="px-4 py-3 text-left text-xs font-bold text-secondary-100 uppercase">Quantity</th>
                  <th className="px-4 py-3 text-left text-xs font-bold text-secondary-100 uppercase">Min Level</th>
                  <th className="px-4 py-3 text-left text-xs font-bold text-secondary-100 uppercase">Status</th>
                  <th className="px-4 py-3 text-left text-xs font-bold text-secondary-100 uppercase">Supplier</th>
                  <th className="px-4 py-3 text-left text-xs font-bold text-secondary-100 uppercase">Cost (RWF)</th>
                  <th className="px-4 py-3 text-left text-xs font-bold text-secondary-100 uppercase">Last Restocked</th>
                  <th className="px-4 py-3 text-right text-xs font-bold text-secondary-100 uppercase">Actions</th>
                </tr>
              </thead>
              <tbody className="bg-white divide-y divide-custom-200">
                {filtered.length === 0 ? (
                  <tr>
                    <td colSpan={10} className="px-4 py-8 text-center text-custom-700">
                      No items found
                    </td>
                  </tr>
                ) : (
                  filtered.map((item) => (
                    <tr key={item.id} className="hover:bg-custom-50 transition-colors">
                      <td className="px-4 py-4">
                        <span className="text-sm font-bold text-primary-600">{item.id}</span>
                      </td>
                      <td className="px-4 py-4">
                        <span className="text-sm font-semibold text-secondary-100">{item.name}</span>
                      </td>
                      <td className="px-4 py-4">
                        <span className="text-sm text-custom-700">{item.category}</span>
                      </td>
                      <td className="px-4 py-4">
                        <span className="text-sm font-bold text-secondary-100">
                          {item.qty} {item.unit}
                        </span>
                      </td>
                      <td className="px-4 py-4">
                        <span className="text-sm text-custom-700">
                          {item.minLevel} {item.unit}
                        </span>
                      </td>
                      <td className="px-4 py-4">
                        <span className={`text-xs font-bold px-3 py-1 rounded-full ${statusColor[item.status]}`}>
                          {item.status}
                        </span>
                      </td>
                      <td className="px-4 py-4">
                        <span className="text-sm text-custom-700">{item.supplier}</span>
                      </td>
                      <td className="px-4 py-4">
                        <span className="text-sm text-secondary-100">{item.cost.toLocaleString()}</span>
                      </td>
                      <td className="px-4 py-4">
                        <span className="text-sm text-custom-700">{item.lastRestocked}</span>
                      </td>
                      <td className="px-4 py-4">
                        <div className="flex items-center justify-end gap-2">
                          <button
                            onClick={() => openEditModal(item)}
                            className="p-2 rounded-lg hover:bg-primary-100 transition-colors"
                            title="Edit"
                          >
                            <HiOutlinePencil className="w-4 h-4 text-primary-500" />
                          </button>
                          <button
                            onClick={() => handleDelete(item.id)}
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
                  {showAddModal ? "Add New Stock Item" : "Edit Stock Item"}
                </h3>
                <button
                  onClick={() => {
                    setShowAddModal(false);
                    setShowEditModal(false);
                    setSelectedItem(null);
                    setFormData({
                      itemName: "",
                      category: "Paper",
                      quantity: "",
                      unit: "reams",
                      minLevel: "",
                      supplier: "",
                      cost: "",
                    });
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
                      Item Name *
                    </label>
                    <Input
                      type="text"
                      placeholder="e.g., A4 Paper (80gsm)"
                      value={formData.itemName}
                      onChange={(e) => setFormData({ ...formData, itemName: e.target.value })}
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
                      Quantity *
                    </label>
                    <Input
                      type="number"
                      placeholder="Enter quantity"
                      value={formData.quantity}
                      onChange={(e) => setFormData({ ...formData, quantity: e.target.value })}
                      required
                      fullWidth
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-semibold text-secondary-100 mb-2">
                      Unit *
                    </label>
                    <select
                      value={formData.unit}
                      onChange={(e) => setFormData({ ...formData, unit: e.target.value })}
                      required
                      className="w-full px-4 py-2.5 rounded-xl border border-custom-300 bg-style-500 text-secondary-100 focus:outline-none focus:border-primary-400 focus:ring-2 focus:ring-primary-200 transition-colors duration-200"
                    >
                      <option value="reams">Reams</option>
                      <option value="units">Units</option>
                      <option value="rolls">Rolls</option>
                      <option value="boxes">Boxes</option>
                      <option value="kg">Kilograms</option>
                      <option value="liters">Liters</option>
                    </select>
                  </div>
                  <div>
                    <label className="block text-sm font-semibold text-secondary-100 mb-2">
                      Minimum Level *
                    </label>
                    <Input
                      type="number"
                      placeholder="Alert threshold"
                      value={formData.minLevel}
                      onChange={(e) => setFormData({ ...formData, minLevel: e.target.value })}
                      required
                      fullWidth
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-semibold text-secondary-100 mb-2">
                      Supplier *
                    </label>
                    <Input
                      type="text"
                      placeholder="Supplier name"
                      value={formData.supplier}
                      onChange={(e) => setFormData({ ...formData, supplier: e.target.value })}
                      required
                      fullWidth
                    />
                  </div>
                  <div className="md:col-span-2">
                    <label className="block text-sm font-semibold text-secondary-100 mb-2">
                      Cost (RWF) *
                    </label>
                    <Input
                      type="number"
                      placeholder="Unit cost"
                      value={formData.cost}
                      onChange={(e) => setFormData({ ...formData, cost: e.target.value })}
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
                      setSelectedItem(null);
                      setFormData({
                        itemName: "",
                        category: "Paper",
                        quantity: "",
                        unit: "reams",
                        minLevel: "",
                        supplier: "",
                        cost: "",
                      });
                    }}
                  >
                    Cancel
                  </Button>
                  <Button type="submit">
                    {showAddModal ? "Add Item" : "Save Changes"}
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
