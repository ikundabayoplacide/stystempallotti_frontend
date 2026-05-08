import { useState } from "react";
import {
  HiOutlineArchive,
  HiOutlineCheckCircle,
  HiOutlineExclamationCircle,
  HiOutlinePlus,
  HiOutlineSearch,
  HiOutlineTrendingDown,
  HiOutlineTrendingUp,
  HiOutlineX,
} from "react-icons/hi";
import { Button, Card, Input } from "../../components/ui";

const kpis = [
  {
    label: "Total Items",
    value: "156",
    icon: HiOutlineArchive,
    color: "text-primary-500",
    bg: "bg-primary-100",
  },
  {
    label: "Low Stock",
    value: "12",
    icon: HiOutlineExclamationCircle,
    color: "text-yellow-600",
    bg: "bg-yellow-100",
  },
  {
    label: "Out of Stock",
    value: "3",
    icon: HiOutlineTrendingDown,
    color: "text-red-500",
    bg: "bg-red-100",
  },
  {
    label: "Well Stocked",
    value: "141",
    icon: HiOutlineCheckCircle,
    color: "text-green-600",
    bg: "bg-green-100",
  },
];

const stockItems = [
  {
    id: "STK-001",
    name: "A4 Paper (80gsm)",
    category: "Paper",
    qty: 2,
    unit: "reams",
    minLevel: 10,
    status: "Low",
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
    lastUsed: "2026-04-29",
  },
];

const statusColor: Record<string, string> = {
  Good: "bg-green-100 text-green-700",
  Low: "bg-yellow-100 text-yellow-700",
  Critical: "bg-orange-100 text-orange-700",
  "Out of Stock": "bg-red-100 text-red-700",
};

const recentUsage = [
  { job: "JOB-001", item: "A4 Paper (80gsm)", qty: "5 reams", time: "30 mins ago" },
  { job: "JOB-002", item: "Binding Wire", qty: "2 rolls", time: "1 hour ago" },
  { job: "JOB-003", item: "Black Ink Cartridge", qty: "1 unit", time: "2 hours ago" },
  { job: "JOB-005", item: "Glossy Paper (A4)", qty: "3 reams", time: "3 hours ago" },
];

const categoryStats = [
  { category: "Paper", items: 45, value: 65 },
  { category: "Ink", items: 28, value: 85 },
  { category: "Binding", items: 18, value: 45 },
  { category: "Packaging", items: 12, value: 70 },
  { category: "Other", items: 53, value: 80 },
];

export default function StockDashboard() {
  const [search, setSearch] = useState("");
  const [filterStatus, setFilterStatus] = useState<string>("All");
  const [showAddStockModal, setShowAddStockModal] = useState(false);
  const [showRecordUsageModal, setShowRecordUsageModal] = useState(false);
  const [showRequestModal, setShowRequestModal] = useState(false);

  const [addStockData, setAddStockData] = useState({
    itemName: "",
    category: "Paper",
    quantity: "",
    unit: "reams",
    minLevel: "",
    supplier: "",
    cost: "",
    notes: "",
  });

  const [usageData, setUsageData] = useState({
    itemId: "",
    jobId: "",
    quantity: "",
    usedBy: "",
    notes: "",
  });

  const [requestData, setRequestData] = useState({
    itemName: "",
    category: "Paper",
    quantity: "",
    unit: "reams",
    urgency: "Normal",
    reason: "",
  });

  const handleAddStock = (e: React.FormEvent) => {
    e.preventDefault();
    alert(`Stock item "${addStockData.itemName}" added successfully!`);
    setAddStockData({
      itemName: "",
      category: "Paper",
      quantity: "",
      unit: "reams",
      minLevel: "",
      supplier: "",
      cost: "",
      notes: "",
    });
    setShowAddStockModal(false);
  };

  const handleRecordUsage = (e: React.FormEvent) => {
    e.preventDefault();
    alert(`Stock usage recorded for ${usageData.itemId}`);
    setUsageData({
      itemId: "",
      jobId: "",
      quantity: "",
      usedBy: "",
      notes: "",
    });
    setShowRecordUsageModal(false);
  };

  const handleRequest = (e: React.FormEvent) => {
    e.preventDefault();
    alert(`Material request submitted for ${requestData.itemName}`);
    setRequestData({
      itemName: "",
      category: "Paper",
      quantity: "",
      unit: "reams",
      urgency: "Normal",
      reason: "",
    });
    setShowRequestModal(false);
  };

  const filtered = stockItems.filter((item) => {
    const matchesSearch =
      item.name.toLowerCase().includes(search.toLowerCase()) ||
      item.id.toLowerCase().includes(search.toLowerCase());
    const matchesFilter = filterStatus === "All" || item.status === filterStatus;
    return matchesSearch && matchesFilter;
  });

  return (
    <div className="space-y-8 font-[family-name:var(--font-family-primary)]">
      {/* Header */}
      <div className="flex flex-col xs:flex-row xs:items-center justify-between gap-3">
        <div>
          <h1 className="text-2xl md:text-3xl font-bold text-secondary-100">
            Stock Management Dashboard
          </h1>
          <p className="text-sm text-custom-700 mt-1">
            Monitor inventory levels and material usage — Thursday, April 30, 2026
          </p>
        </div>
        <div className="flex gap-2 flex-wrap">
          <button
            onClick={() => setShowAddStockModal(true)}
            className="px-4 py-2 rounded-xl bg-primary-500 text-white font-semibold hover:bg-primary-600 transition-colors text-sm flex items-center gap-2"
          >
            <HiOutlinePlus className="w-4 h-4" />
            Add Stock
          </button>
          <button
            onClick={() => setShowRecordUsageModal(true)}
            className="px-4 py-2 rounded-xl bg-orange-600 text-white font-semibold hover:bg-orange-700 transition-colors text-sm"
          >
            Record Usage
          </button>
          <button
            onClick={() => setShowRequestModal(true)}
            className="px-4 py-2 rounded-xl bg-green-600 text-white font-semibold hover:bg-green-700 transition-colors text-sm"
          >
            Request Material
          </button>
        </div>
      </div>

      {/* KPI Grid */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
        {kpis.map(({ label, value, icon: Icon, color, bg }) => (
          <Card key={label} className="!p-4 flex flex-col gap-3">
            <div className={`w-10 h-10 rounded-xl flex items-center justify-center ${bg}`}>
              <Icon className={`w-5 h-5 ${color}`} />
            </div>
            <div>
              <p className="text-xs text-custom-700">{label}</p>
              <p className="text-2xl font-bold text-secondary-100">{value}</p>
            </div>
          </Card>
        ))}
      </div>

      {/* Main Content Grid */}
      <div className="grid grid-cols-1 xl:grid-cols-3 gap-6">
        {/* Stock Items Table */}
        <Card className="xl:col-span-2">
          <div className="flex flex-col gap-3 mb-5">
            <div className="flex items-center gap-2">
              <HiOutlineArchive className="w-5 h-5 text-primary-500" />
              <h2 className="font-bold text-secondary-100">Stock Inventory</h2>
            </div>
            <div className="flex flex-col xs:flex-row gap-3">
              {/* Search */}
              <div className="relative flex-1">
                <HiOutlineSearch className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-custom-700" />
                <input
                  type="text"
                  placeholder="Search items..."
                  value={search}
                  onChange={(e) => setSearch(e.target.value)}
                  className="
                    w-full pl-9 pr-4 py-2 rounded-xl border border-custom-300
                    bg-style-500 text-secondary-100 text-sm
                    placeholder:text-custom-700
                    focus:outline-none focus:border-primary-400 focus:ring-2 focus:ring-primary-200
                    transition-colors duration-200
                    font-[family-name:var(--font-family-primary)]
                  "
                />
              </div>
              {/* Filter */}
              <select
                value={filterStatus}
                onChange={(e) => setFilterStatus(e.target.value)}
                className="
                  px-4 py-2 rounded-xl border border-custom-300
                  bg-style-500 text-secondary-100 text-sm
                  focus:outline-none focus:border-primary-400 focus:ring-2 focus:ring-primary-200
                  transition-colors duration-200
                  font-[family-name:var(--font-family-primary)]
                "
              >
                <option value="All">All Status</option>
                <option value="Good">Good</option>
                <option value="Low">Low</option>
                <option value="Critical">Critical</option>
                <option value="Out of Stock">Out of Stock</option>
              </select>
            </div>
          </div>

          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead>
                <tr className="border-b border-custom-300">
                  {["Item ID", "Name", "Category", "Quantity", "Min Level", "Status"].map((h) => (
                    <th key={h} className="text-left py-2 px-3 text-xs font-semibold text-custom-700 uppercase tracking-wide whitespace-nowrap">
                      {h}
                    </th>
                  ))}
                </tr>
              </thead>
              <tbody>
                {filtered.map((item) => (
                  <tr key={item.id} className="border-b border-custom-200 hover:bg-custom-50 transition-colors">
                    <td className="py-3 px-3 font-semibold text-primary-500 whitespace-nowrap">{item.id}</td>
                    <td className="py-3 px-3 text-secondary-100 whitespace-nowrap">{item.name}</td>
                    <td className="py-3 px-3 text-custom-700 whitespace-nowrap">{item.category}</td>
                    <td className="py-3 px-3 text-secondary-100 font-semibold whitespace-nowrap">
                      {item.qty} {item.unit}
                    </td>
                    <td className="py-3 px-3 text-custom-700 whitespace-nowrap">
                      {item.minLevel} {item.unit}
                    </td>
                    <td className="py-3 px-3">
                      <span className={`text-xs font-semibold px-2 py-0.5 rounded-full whitespace-nowrap ${statusColor[item.status] ?? "bg-custom-100 text-custom-800"}`}>
                        {item.status}
                      </span>
                    </td>
                  </tr>
                ))}
                {filtered.length === 0 && (
                  <tr>
                    <td colSpan={6} className="py-8 text-center text-custom-700 text-sm">
                      No items found.
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>
        </Card>

        {/* Recent Usage */}
        <Card>
          <div className="flex items-center gap-2 mb-5">
            <HiOutlineTrendingDown className="w-5 h-5 text-primary-500" />
            <h2 className="font-bold text-secondary-100">Recent Usage</h2>
          </div>
          <div className="space-y-3">
            {recentUsage.map((usage, idx) => (
              <div key={idx} className="p-3 rounded-xl bg-custom-50 border border-custom-200">
                <div className="flex items-center justify-between mb-1">
                  <span className="text-sm font-semibold text-primary-500">{usage.job}</span>
                  <span className="text-xs text-custom-700">{usage.time}</span>
                </div>
                <p className="text-sm text-secondary-100">{usage.item}</p>
                <p className="text-xs text-custom-700 mt-1">Used: {usage.qty}</p>
              </div>
            ))}
          </div>
        </Card>
      </div>

      {/* Category Statistics */}
      <Card>
        <div className="flex items-center gap-2 mb-5">
          <HiOutlineTrendingUp className="w-5 h-5 text-primary-500" />
          <h2 className="font-bold text-secondary-100">Stock by Category</h2>
        </div>
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-5 gap-4">
          {categoryStats.map((cat) => (
            <div key={cat.category} className="p-4 rounded-xl bg-custom-50 border border-custom-200">
              <h3 className="font-bold text-secondary-100 mb-2">{cat.category}</h3>
              <p className="text-sm text-custom-700 mb-3">{cat.items} items</p>
              <div className="w-full bg-custom-200 rounded-full h-2">
                <div
                  className={`h-2 rounded-full ${cat.value >= 70 ? "bg-green-500" : cat.value >= 50 ? "bg-yellow-500" : "bg-red-500"}`}
                  style={{ width: `${cat.value}%` }}
                />
              </div>
              <p className="text-xs text-custom-700 mt-2">Stock Level: {cat.value}%</p>
            </div>
          ))}
        </div>
      </Card>

      {/* Add Stock Modal */}
      {showAddStockModal && (
        <div className="fixed inset-0 bg-secondary-100/50 z-50 flex items-start justify-center p-4 overflow-y-auto">
          <Card className="!p-6 max-w-2xl w-full my-8 max-h-[90vh] overflow-y-auto">
            <div className="flex items-center justify-between mb-6">
              <h3 className="text-xl font-bold text-secondary-100">Add New Stock Item</h3>
              <button
                onClick={() => setShowAddStockModal(false)}
                className="text-custom-700 hover:text-secondary-100"
              >
                <HiOutlineX className="w-6 h-6" />
              </button>
            </div>

            <form onSubmit={handleAddStock} className="space-y-6">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-semibold text-secondary-100 mb-2">
                    Item Name *
                  </label>
                  <Input
                    name="itemName"
                    type="text"
                    placeholder="e.g., A4 Paper (80gsm)"
                    value={addStockData.itemName}
                    onChange={(e) => setAddStockData({ ...addStockData, itemName: e.target.value })}
                    required
                    fullWidth
                  />
                </div>
                <div>
                  <label className="block text-sm font-semibold text-secondary-100 mb-2">
                    Category *
                  </label>
                  <select
                    name="category"
                    value={addStockData.category}
                    onChange={(e) => setAddStockData({ ...addStockData, category: e.target.value })}
                    required
                    className="w-full px-4 py-2.5 rounded-xl border border-custom-300 bg-style-500 text-secondary-100 focus:outline-none focus:border-primary-400 focus:ring-2 focus:ring-primary-200 transition-colors duration-200 font-[family-name:var(--font-family-primary)]"
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
                    name="quantity"
                    type="number"
                    placeholder="Enter quantity"
                    value={addStockData.quantity}
                    onChange={(e) => setAddStockData({ ...addStockData, quantity: e.target.value })}
                    required
                    fullWidth
                  />
                </div>
                <div>
                  <label className="block text-sm font-semibold text-secondary-100 mb-2">
                    Unit *
                  </label>
                  <select
                    name="unit"
                    value={addStockData.unit}
                    onChange={(e) => setAddStockData({ ...addStockData, unit: e.target.value })}
                    required
                    className="w-full px-4 py-2.5 rounded-xl border border-custom-300 bg-style-500 text-secondary-100 focus:outline-none focus:border-primary-400 focus:ring-2 focus:ring-primary-200 transition-colors duration-200 font-[family-name:var(--font-family-primary)]"
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
                    name="minLevel"
                    type="number"
                    placeholder="Alert threshold"
                    value={addStockData.minLevel}
                    onChange={(e) => setAddStockData({ ...addStockData, minLevel: e.target.value })}
                    required
                    fullWidth
                  />
                </div>
                <div>
                  <label className="block text-sm font-semibold text-secondary-100 mb-2">
                    Supplier
                  </label>
                  <Input
                    name="supplier"
                    type="text"
                    placeholder="Supplier name"
                    value={addStockData.supplier}
                    onChange={(e) => setAddStockData({ ...addStockData, supplier: e.target.value })}
                    fullWidth
                  />
                </div>
                <div>
                  <label className="block text-sm font-semibold text-secondary-100 mb-2">
                    Cost (RWF)
                  </label>
                  <Input
                    name="cost"
                    type="number"
                    placeholder="Unit cost"
                    value={addStockData.cost}
                    onChange={(e) => setAddStockData({ ...addStockData, cost: e.target.value })}
                    fullWidth
                  />
                </div>
                <div className="md:col-span-2">
                  <label className="block text-sm font-semibold text-secondary-100 mb-2">
                    Notes
                  </label>
                  <textarea
                    name="notes"
                    value={addStockData.notes}
                    onChange={(e) => setAddStockData({ ...addStockData, notes: e.target.value })}
                    rows={3}
                    placeholder="Additional notes..."
                    className="w-full px-4 py-2.5 rounded-xl border border-custom-300 bg-style-500 text-secondary-100 focus:outline-none focus:border-primary-400 focus:ring-2 focus:ring-primary-200 transition-colors duration-200 font-[family-name:var(--font-family-primary)] resize-none"
                  />
                </div>
              </div>

              <div className="flex gap-3 justify-end pt-4 border-t border-custom-300">
                <Button 
                  type="button" 
                  variant="outline"
                  onClick={() => setShowAddStockModal(false)}
                >
                  Cancel
                </Button>
                <Button type="submit">
                  Add Stock Item
                </Button>
              </div>
            </form>
          </Card>
        </div>
      )}

      {/* Record Usage Modal */}
      {showRecordUsageModal && (
        <div className="fixed inset-0 bg-secondary-100/50 z-50 flex items-start justify-center p-4 overflow-y-auto">
          <Card className="!p-6 max-w-2xl w-full my-8 max-h-[90vh] overflow-y-auto">
            <div className="flex items-center justify-between mb-6">
              <h3 className="text-xl font-bold text-secondary-100">Record Stock Usage</h3>
              <button
                onClick={() => setShowRecordUsageModal(false)}
                className="text-custom-700 hover:text-secondary-100"
              >
                <HiOutlineX className="w-6 h-6" />
              </button>
            </div>

            <form onSubmit={handleRecordUsage} className="space-y-6">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-semibold text-secondary-100 mb-2">
                    Stock Item *
                  </label>
                  <select
                    name="itemId"
                    value={usageData.itemId}
                    onChange={(e) => setUsageData({ ...usageData, itemId: e.target.value })}
                    required
                    className="w-full px-4 py-2.5 rounded-xl border border-custom-300 bg-style-500 text-secondary-100 focus:outline-none focus:border-primary-400 focus:ring-2 focus:ring-primary-200 transition-colors duration-200 font-[family-name:var(--font-family-primary)]"
                  >
                    <option value="">Select item</option>
                    {stockItems.map((item) => (
                      <option key={item.id} value={item.id}>
                        {item.id} - {item.name} ({item.qty} {item.unit} available)
                      </option>
                    ))}
                  </select>
                </div>
                <div>
                  <label className="block text-sm font-semibold text-secondary-100 mb-2">
                    Job ID *
                  </label>
                  <Input
                    name="jobId"
                    type="text"
                    placeholder="e.g., JOB-001"
                    value={usageData.jobId}
                    onChange={(e) => setUsageData({ ...usageData, jobId: e.target.value })}
                    required
                    fullWidth
                  />
                </div>
                <div>
                  <label className="block text-sm font-semibold text-secondary-100 mb-2">
                    Quantity Used *
                  </label>
                  <Input
                    name="quantity"
                    type="number"
                    placeholder="Enter quantity"
                    value={usageData.quantity}
                    onChange={(e) => setUsageData({ ...usageData, quantity: e.target.value })}
                    required
                    fullWidth
                  />
                </div>
                <div>
                  <label className="block text-sm font-semibold text-secondary-100 mb-2">
                    Used By *
                  </label>
                  <Input
                    name="usedBy"
                    type="text"
                    placeholder="Worker name"
                    value={usageData.usedBy}
                    onChange={(e) => setUsageData({ ...usageData, usedBy: e.target.value })}
                    required
                    fullWidth
                  />
                </div>
                <div className="md:col-span-2">
                  <label className="block text-sm font-semibold text-secondary-100 mb-2">
                    Notes
                  </label>
                  <textarea
                    name="notes"
                    value={usageData.notes}
                    onChange={(e) => setUsageData({ ...usageData, notes: e.target.value })}
                    rows={3}
                    placeholder="Additional notes about usage..."
                    className="w-full px-4 py-2.5 rounded-xl border border-custom-300 bg-style-500 text-secondary-100 focus:outline-none focus:border-primary-400 focus:ring-2 focus:ring-primary-200 transition-colors duration-200 font-[family-name:var(--font-family-primary)] resize-none"
                  />
                </div>
              </div>

              <div className="flex gap-3 justify-end pt-4 border-t border-custom-300">
                <Button 
                  type="button" 
                  variant="outline"
                  onClick={() => setShowRecordUsageModal(false)}
                >
                  Cancel
                </Button>
                <Button type="submit" className="bg-orange-600 hover:bg-orange-700">
                  Record Usage
                </Button>
              </div>
            </form>
          </Card>
        </div>
      )}

      {/* Request Material Modal */}
      {showRequestModal && (
        <div className="fixed inset-0 bg-secondary-100/50 z-50 flex items-start justify-center p-4 overflow-y-auto">
          <Card className="!p-6 max-w-2xl w-full my-8 max-h-[90vh] overflow-y-auto">
            <div className="flex items-center justify-between mb-6">
              <h3 className="text-xl font-bold text-secondary-100">Request Material</h3>
              <button
                onClick={() => setShowRequestModal(false)}
                className="text-custom-700 hover:text-secondary-100"
              >
                <HiOutlineX className="w-6 h-6" />
              </button>
            </div>

            <form onSubmit={handleRequest} className="space-y-6">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-semibold text-secondary-100 mb-2">
                    Item Name *
                  </label>
                  <Input
                    name="itemName"
                    type="text"
                    placeholder="e.g., A4 Paper (80gsm)"
                    value={requestData.itemName}
                    onChange={(e) => setRequestData({ ...requestData, itemName: e.target.value })}
                    required
                    fullWidth
                  />
                </div>
                <div>
                  <label className="block text-sm font-semibold text-secondary-100 mb-2">
                    Category *
                  </label>
                  <select
                    name="category"
                    value={requestData.category}
                    onChange={(e) => setRequestData({ ...requestData, category: e.target.value })}
                    required
                    className="w-full px-4 py-2.5 rounded-xl border border-custom-300 bg-style-500 text-secondary-100 focus:outline-none focus:border-primary-400 focus:ring-2 focus:ring-primary-200 transition-colors duration-200 font-[family-name:var(--font-family-primary)]"
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
                    Quantity Needed *
                  </label>
                  <Input
                    name="quantity"
                    type="number"
                    placeholder="Enter quantity"
                    value={requestData.quantity}
                    onChange={(e) => setRequestData({ ...requestData, quantity: e.target.value })}
                    required
                    fullWidth
                  />
                </div>
                <div>
                  <label className="block text-sm font-semibold text-secondary-100 mb-2">
                    Unit *
                  </label>
                  <select
                    name="unit"
                    value={requestData.unit}
                    onChange={(e) => setRequestData({ ...requestData, unit: e.target.value })}
                    required
                    className="w-full px-4 py-2.5 rounded-xl border border-custom-300 bg-style-500 text-secondary-100 focus:outline-none focus:border-primary-400 focus:ring-2 focus:ring-primary-200 transition-colors duration-200 font-[family-name:var(--font-family-primary)]"
                  >
                    <option value="reams">Reams</option>
                    <option value="units">Units</option>
                    <option value="rolls">Rolls</option>
                    <option value="boxes">Boxes</option>
                    <option value="kg">Kilograms</option>
                    <option value="liters">Liters</option>
                  </select>
                </div>
                <div className="md:col-span-2">
                  <label className="block text-sm font-semibold text-secondary-100 mb-2">
                    Urgency *
                  </label>
                  <select
                    name="urgency"
                    value={requestData.urgency}
                    onChange={(e) => setRequestData({ ...requestData, urgency: e.target.value })}
                    required
                    className="w-full px-4 py-2.5 rounded-xl border border-custom-300 bg-style-500 text-secondary-100 focus:outline-none focus:border-primary-400 focus:ring-2 focus:ring-primary-200 transition-colors duration-200 font-[family-name:var(--font-family-primary)]"
                  >
                    <option value="Low">Low - Can wait 1-2 weeks</option>
                    <option value="Normal">Normal - Needed within a week</option>
                    <option value="High">High - Needed within 2-3 days</option>
                    <option value="Urgent">Urgent - Needed immediately</option>
                  </select>
                </div>
                <div className="md:col-span-2">
                  <label className="block text-sm font-semibold text-secondary-100 mb-2">
                    Reason for Request *
                  </label>
                  <textarea
                    name="reason"
                    value={requestData.reason}
                    onChange={(e) => setRequestData({ ...requestData, reason: e.target.value })}
                    rows={3}
                    placeholder="Explain why this material is needed..."
                    required
                    className="w-full px-4 py-2.5 rounded-xl border border-custom-300 bg-style-500 text-secondary-100 focus:outline-none focus:border-primary-400 focus:ring-2 focus:ring-primary-200 transition-colors duration-200 font-[family-name:var(--font-family-primary)] resize-none"
                  />
                </div>
              </div>

              <div className="flex gap-3 justify-end pt-4 border-t border-custom-300">
                <Button 
                  type="button" 
                  variant="outline"
                  onClick={() => setShowRequestModal(false)}
                >
                  Cancel
                </Button>
                <Button type="submit" className="bg-green-600 hover:bg-green-700">
                  Submit Request
                </Button>
              </div>
            </form>
          </Card>
        </div>
      )}
    </div>
  );
}
