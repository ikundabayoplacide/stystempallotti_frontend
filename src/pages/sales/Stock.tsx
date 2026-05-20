import { useState } from "react";
import {
  HiOutlineSearch,
  HiOutlineArchive,
  HiOutlineExclamationCircle,
  HiOutlineCheckCircle,
  HiOutlineFilter,
  HiOutlineX,
  HiOutlineRefresh,
  HiOutlineInformationCircle,
} from "react-icons/hi";
import { DashboardLayout } from "../../components";
import { Card } from "../../components/ui";
import {
  useGetStockItemsQuery,
  type StockItem,
} from "../../store/services/stockService";

// ─── Status config ────────────────────────────────────────────────────────────

const statusConfig: Record<string, { label: string; color: string; icon: React.ReactNode }> = {
  // backend may return any of these variants
  available:      { label: "Available",     color: "bg-emerald-100 text-emerald-700", icon: <HiOutlineCheckCircle className="w-3.5 h-3.5" /> },
  "in-stock":     { label: "Available",     color: "bg-emerald-100 text-emerald-700", icon: <HiOutlineCheckCircle className="w-3.5 h-3.5" /> },
  IN_STOCK:       { label: "Available",     color: "bg-emerald-100 text-emerald-700", icon: <HiOutlineCheckCircle className="w-3.5 h-3.5" /> },
  AVAILABLE:      { label: "Available",     color: "bg-emerald-100 text-emerald-700", icon: <HiOutlineCheckCircle className="w-3.5 h-3.5" /> },
  low:            { label: "Low Stock",     color: "bg-yellow-100 text-yellow-700",   icon: <HiOutlineExclamationCircle className="w-3.5 h-3.5" /> },
  "low-stock":    { label: "Low Stock",     color: "bg-yellow-100 text-yellow-700",   icon: <HiOutlineExclamationCircle className="w-3.5 h-3.5" /> },
  LOW_STOCK:      { label: "Low Stock",     color: "bg-yellow-100 text-yellow-700",   icon: <HiOutlineExclamationCircle className="w-3.5 h-3.5" /> },
  LOW:            { label: "Low Stock",     color: "bg-yellow-100 text-yellow-700",   icon: <HiOutlineExclamationCircle className="w-3.5 h-3.5" /> },
  "out-of-stock": { label: "Out of Stock",  color: "bg-red-100 text-red-600",         icon: <HiOutlineExclamationCircle className="w-3.5 h-3.5" /> },
  OUT_OF_STOCK:   { label: "Out of Stock",  color: "bg-red-100 text-red-600",         icon: <HiOutlineExclamationCircle className="w-3.5 h-3.5" /> },
  out:            { label: "Out of Stock",  color: "bg-red-100 text-red-600",         icon: <HiOutlineExclamationCircle className="w-3.5 h-3.5" /> },
};

const fallbackStatus = { label: "Unknown", color: "bg-custom-100 text-custom-700", icon: <HiOutlineExclamationCircle className="w-3.5 h-3.5" /> };

function getStatus(stockStatus: string) {
  return statusConfig[stockStatus] ?? statusConfig[stockStatus?.toLowerCase()] ?? fallbackStatus;
}

// Normalize to our internal StockStatus for conditional logic
function isOutOfStock(s: string) {
  return ["out-of-stock", "OUT_OF_STOCK", "out"].includes(s);
}
function isLow(s: string) {
  return ["low", "low-stock", "LOW_STOCK", "LOW"].includes(s);
}

// ─── Component ────────────────────────────────────────────────────────────────

export default function SalesStockPage() {
  const [search, setSearch] = useState("");
  const [selectedCategory, setSelectedCategory] = useState<string | "all">("all");
  const [selectedStatus, setSelectedStatus] = useState<string>("all");
  const [showFilters, setShowFilters] = useState(false);
  const [selectedItem, setSelectedItem] = useState<StockItem | null>(null);

  // ── Data fetching ──────────────────────────────────────────────────────────
  const {
    data,
    isLoading,
    isError,
    refetch,
  } = useGetStockItemsQuery({
    category: selectedCategory !== "all" ? selectedCategory : undefined,
    stockStatus: selectedStatus !== "all" ? (selectedStatus as any) : undefined,
    search: search.trim() || undefined,
  });

  const items = data?.data ?? [];

  // ── Derived values ─────────────────────────────────────────────────────────
  const availableCount    = items.filter((i) => !isOutOfStock(i.stockStatus) && !isLow(i.stockStatus)).length;
  const lowCount          = items.filter((i) => isLow(i.stockStatus)).length;
  const outOfStockCount   = items.filter((i) => isOutOfStock(i.stockStatus)).length;

  // Unique categories from loaded items
  const categories = Array.from(new Set(items.map((i) => i.category))).sort();

  const activeFilters =
    (selectedCategory !== "all" ? 1 : 0) + (selectedStatus !== "all" ? 1 : 0);

  return (
    <DashboardLayout notificationCount={0}>
      <div className="space-y-6 font-[family-name:var(--font-family-primary)]">

        {/* ── Header ──────────────────────────────────────────────────────── */}
        <div className="flex items-start justify-between gap-4">
          <div>
            <h1 className="text-2xl md:text-3xl font-bold text-secondary-100">Stock</h1>
            <p className="text-sm text-custom-700 mt-1">
              View raw material availability — read-only reference for sales planning
            </p>
          </div>
          <button
            onClick={() => refetch()}
            className="flex items-center gap-2 px-3 py-2 rounded-xl border border-custom-300 hover:bg-custom-100 transition-colors text-custom-700 hover:text-secondary-100 text-sm"
          >
            <HiOutlineRefresh className="w-4 h-4" />
            <span className="hidden sm:inline font-semibold">Refresh</span>
          </button>
        </div>

        {/* ── Info banner ─────────────────────────────────────────────────── */}
        <div className="flex items-start gap-3 px-4 py-3 rounded-xl bg-blue-50 border border-blue-200 text-blue-700 text-sm">
          <HiOutlineInformationCircle className="w-5 h-5 flex-shrink-0 mt-0.5" />
          <span>
            This is a read-only view of raw materials and production supplies. For finished
            products available for customer orders, see the <strong>Boutique</strong> page.
          </span>
        </div>

        {/* ── Summary Cards ───────────────────────────────────────────────── */}
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
          <Card className="!p-4">
            <p className="text-xs text-custom-700 mb-1">Total Items</p>
            <p className="text-2xl font-bold text-secondary-100">
              {isLoading ? "—" : items.length}
            </p>
          </Card>
          <Card className="!p-4">
            <p className="text-xs text-custom-700 mb-1">Available</p>
            <p className="text-2xl font-bold text-emerald-600">
              {isLoading ? "—" : availableCount}
            </p>
          </Card>
          <Card className="!p-4">
            <p className="text-xs text-custom-700 mb-1">Low Stock</p>
            <p className="text-2xl font-bold text-yellow-600">
              {isLoading ? "—" : lowCount}
            </p>
          </Card>
          <Card className="!p-4">
            <p className="text-xs text-custom-700 mb-1">Out of Stock</p>
            <p className="text-2xl font-bold text-red-600">
              {isLoading ? "—" : outOfStockCount}
            </p>
          </Card>
        </div>

        {/* ── Search & Filters ────────────────────────────────────────────── */}
        <div className="flex flex-col sm:flex-row gap-3">
          <div className="flex-1 relative">
            <HiOutlineSearch className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-custom-700" />
            <input
              type="text"
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              placeholder="Search by name or category..."
              className="w-full pl-10 pr-4 py-2 rounded-xl border border-custom-300 bg-style-500 text-secondary-100 placeholder:text-custom-700 focus:outline-none focus:border-primary-400 focus:ring-2 focus:ring-primary-200 transition-colors"
            />
          </div>
          <button
            onClick={() => setShowFilters(true)}
            className="relative flex items-center gap-2 px-4 py-2 rounded-xl border border-custom-300 hover:bg-custom-100 transition-colors text-secondary-100"
          >
            <HiOutlineFilter className="w-4 h-4" />
            <span className="text-sm font-semibold">Filters</span>
            {activeFilters > 0 && (
              <span className="absolute -top-1 -right-1 w-5 h-5 rounded-full bg-primary-500 text-white text-xs flex items-center justify-center font-bold">
                {activeFilters}
              </span>
            )}
          </button>
        </div>

        {/* ── Category Pills ───────────────────────────────────────────────── */}
        {!isLoading && categories.length > 0 && (
          <div className="flex flex-wrap gap-2">
            <button
              onClick={() => setSelectedCategory("all")}
              className={`px-3 py-1.5 rounded-full text-xs font-semibold transition-colors ${
                selectedCategory === "all"
                  ? "bg-primary-500 text-white"
                  : "bg-custom-100 text-custom-700 hover:bg-custom-200"
              }`}
            >
              All Categories
            </button>
            {categories.map((cat) => (
              <button
                key={cat}
                onClick={() => setSelectedCategory(cat === selectedCategory ? "all" : cat)}
                className={`px-3 py-1.5 rounded-full text-xs font-semibold transition-colors ${
                  selectedCategory === cat
                    ? "bg-primary-500 text-white"
                    : "bg-custom-100 text-custom-700 hover:bg-custom-200"
                }`}
              >
                {cat}
              </button>
            ))}
          </div>
        )}

        {/* ── Items Table ──────────────────────────────────────────────────── */}
        {isLoading ? (
          <Card className="!p-0 overflow-hidden">
            <div className="animate-pulse">
              {Array.from({ length: 6 }).map((_, i) => (
                <div key={i} className="flex items-center gap-4 px-6 py-4 border-b border-custom-200 last:border-0">
                  <div className="h-4 w-48 bg-custom-200 rounded" />
                  <div className="h-4 w-24 bg-custom-200 rounded" />
                  <div className="ml-auto h-6 w-20 bg-custom-200 rounded-full" />
                </div>
              ))}
            </div>
          </Card>
        ) : isError ? (
          <Card className="!p-12 text-center">
            <HiOutlineExclamationCircle className="w-10 h-10 text-red-400 mx-auto mb-3" />
            <p className="text-secondary-100 font-semibold">Failed to load stock items</p>
            <p className="text-sm text-custom-700 mt-1 mb-4">Check your connection and try again</p>
            <button
              onClick={() => refetch()}
              className="px-4 py-2 rounded-xl bg-primary-500 text-white text-sm font-semibold hover:bg-primary-600 transition-colors"
            >
              Retry
            </button>
          </Card>
        ) : items.length === 0 ? (
          <Card className="!p-12 text-center">
            <HiOutlineArchive className="w-10 h-10 text-custom-700 mx-auto mb-3" />
            <p className="text-secondary-100 font-semibold">No stock items found</p>
            <p className="text-sm text-custom-700 mt-1">Try adjusting your search or filters</p>
          </Card>
        ) : (
          <Card className="!p-0 overflow-hidden">
            <div className="overflow-x-auto">
              <table className="w-full text-sm">
                <thead>
                  <tr className="border-b border-custom-300 bg-custom-50">
                    <th className="text-left px-6 py-3 text-xs font-semibold text-custom-700 uppercase tracking-wide">
                      Item
                    </th>
                    <th className="text-left px-4 py-3 text-xs font-semibold text-custom-700 uppercase tracking-wide">
                      Category
                    </th>
                    <th className="text-left px-4 py-3 text-xs font-semibold text-custom-700 uppercase tracking-wide">
                      Unit
                    </th>
                    <th className="text-right px-4 py-3 text-xs font-semibold text-custom-700 uppercase tracking-wide">
                      Current Stock
                    </th>
                    <th className="text-right px-4 py-3 text-xs font-semibold text-custom-700 uppercase tracking-wide">
                      Min Stock
                    </th>
                    <th className="text-center px-4 py-3 text-xs font-semibold text-custom-700 uppercase tracking-wide">
                      Status
                    </th>
                    <th className="px-4 py-3" />
                  </tr>
                </thead>
                <tbody className="divide-y divide-custom-200">
                  {items.map((item) => {
                    return (
                      <tr
                        key={item.id}
                        className="hover:bg-custom-50 transition-colors cursor-pointer"
                        onClick={() => setSelectedItem(item)}
                      >
                        <td className="px-6 py-4">
                          <p className="font-semibold text-secondary-100">{item.name}</p>
                          {item.description && (
                            <p className="text-xs text-custom-700 mt-0.5 line-clamp-1">
                              {item.description}
                            </p>
                          )}
                        </td>
                        <td className="px-4 py-4">
                          <span className="px-2.5 py-1 rounded-full text-xs font-semibold bg-custom-100 text-custom-700">
                            {item.category}
                          </span>
                        </td>
                        <td className="px-4 py-4 text-custom-700 text-xs">{item.unit}</td>
                        <td className="px-4 py-4 text-right">
                          <span className={`font-bold text-sm ${
                            isOutOfStock(item.stockStatus) ? "text-red-600" :
                            isLow(item.stockStatus)        ? "text-yellow-600" :
                                                             "text-emerald-600"
                          }`}>
                            {item.currentStock}
                          </span>
                        </td>
                        <td className="px-4 py-4 text-right text-secondary-100 text-sm font-medium">
                          {item.minStock}
                        </td>
                        <td className="px-4 py-4 text-center">
                          <span className={`inline-flex items-center gap-1 text-xs font-bold px-2.5 py-1 rounded-full ${getStatus(item.stockStatus).color}`}>
                            {getStatus(item.stockStatus).icon}
                            {getStatus(item.stockStatus).label}
                          </span>
                        </td>
                        <td className="px-4 py-4 text-right">
                          <button
                            onClick={(e) => { e.stopPropagation(); setSelectedItem(item); }}
                            className="text-xs text-primary-500 hover:text-primary-600 font-semibold"
                          >
                            Details
                          </button>
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>
          </Card>
        )}
      </div>

      {/* ── Filter Modal ─────────────────────────────────────────────────────── */}
      {showFilters && (
        <div className="fixed inset-0 bg-secondary-100/50 z-50 flex items-center justify-center p-4">
          <Card className="!p-6 max-w-sm w-full">
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-lg font-bold text-secondary-100">Filter Stock</h3>
              <button onClick={() => setShowFilters(false)} className="text-custom-700 hover:text-secondary-100">
                <HiOutlineX className="w-5 h-5" />
              </button>
            </div>
            <div className="space-y-4">
              <div>
                <label className="block text-sm font-semibold text-secondary-100 mb-2">Category</label>
                <select
                  value={selectedCategory}
                  onChange={(e) => setSelectedCategory(e.target.value)}
                  className="w-full px-3 py-2 rounded-xl border border-custom-300 bg-style-500 text-secondary-100 focus:outline-none focus:border-primary-400"
                >
                  <option value="all">All Categories</option>
                  {categories.map((c) => (
                    <option key={c} value={c}>{c}</option>
                  ))}
                </select>
              </div>
              <div>
                <label className="block text-sm font-semibold text-secondary-100 mb-2">Stock Status</label>
                <select
                  value={selectedStatus}
                  onChange={(e) => setSelectedStatus(e.target.value)}
                  className="w-full px-3 py-2 rounded-xl border border-custom-300 bg-style-500 text-secondary-100 focus:outline-none focus:border-primary-400"
                >
                  <option value="all">All Statuses</option>
                  <option value="available">Available</option>
                  <option value="low">Low Stock</option>
                  <option value="out-of-stock">Out of Stock</option>
                </select>
              </div>
            </div>
            <div className="flex gap-3 mt-5">
              <button
                onClick={() => { setSelectedCategory("all"); setSelectedStatus("all"); }}
                className="flex-1 px-4 py-2 rounded-xl border border-custom-300 text-sm font-semibold text-secondary-100 hover:bg-custom-100 transition-colors"
              >
                Reset
              </button>
              <button
                onClick={() => setShowFilters(false)}
                className="flex-1 px-4 py-2 rounded-xl bg-primary-500 text-white text-sm font-semibold hover:bg-primary-600 transition-colors"
              >
                Apply
              </button>
            </div>
          </Card>
        </div>
      )}

      {/* ── Item Detail Modal ─────────────────────────────────────────────────── */}
      {selectedItem && (
        <div className="fixed inset-0 bg-secondary-100/50 z-50 flex items-center justify-center p-4">
          <Card className="!p-6 max-w-md w-full">
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-lg font-bold text-secondary-100">{selectedItem.name}</h3>
              <button onClick={() => setSelectedItem(null)} className="text-custom-700 hover:text-secondary-100">
                <HiOutlineX className="w-5 h-5" />
              </button>
            </div>

            <div className="flex gap-2 mb-4">
              <span className="text-xs font-semibold px-2.5 py-1 rounded-full bg-custom-100 text-custom-700">
                {selectedItem.category}
              </span>
              <span className={`inline-flex items-center gap-1 text-xs font-bold px-2.5 py-1 rounded-full ${getStatus(selectedItem.stockStatus).color}`}>
                {getStatus(selectedItem.stockStatus).icon}
                {getStatus(selectedItem.stockStatus).label}
              </span>
            </div>

            {selectedItem.description && (
              <p className="text-sm text-custom-700 mb-4">{selectedItem.description}</p>
            )}

            <div className="rounded-xl bg-custom-100 border border-custom-300 p-4 space-y-3">
              <div className="flex justify-between text-sm">
                <span className="text-custom-700">Current Stock</span>
                <span className={`font-bold ${
                  isOutOfStock(selectedItem.stockStatus) ? "text-red-600" :
                  isLow(selectedItem.stockStatus)        ? "text-yellow-600" : "text-emerald-600"
                }`}>
                  {selectedItem.currentStock} {selectedItem.unit}
                </span>
              </div>
              <div className="flex justify-between text-sm">
                <span className="text-custom-700">Minimum Stock</span>
                <span className="font-semibold text-secondary-100">
                  {selectedItem.minStock} {selectedItem.unit}
                </span>
              </div>
              <div className="flex justify-between text-sm">
                <span className="text-custom-700">Unit</span>
                <span className="font-semibold text-secondary-100">{selectedItem.unit}</span>
              </div>
            </div>

            {isOutOfStock(selectedItem.stockStatus) && (
              <div className="mt-4 flex items-start gap-2 px-4 py-3 rounded-xl bg-red-50 border border-red-200 text-red-700 text-sm">
                <HiOutlineExclamationCircle className="w-5 h-5 flex-shrink-0 mt-0.5" />
                <span>This material is out of stock. Production may be affected — contact the stock team.</span>
              </div>
            )}
            {isLow(selectedItem.stockStatus) && (
              <div className="mt-4 flex items-start gap-2 px-4 py-3 rounded-xl bg-yellow-50 border border-yellow-200 text-yellow-700 text-sm">
                <HiOutlineExclamationCircle className="w-5 h-5 flex-shrink-0 mt-0.5" />
                <span>Stock is running low. Factor this in when committing delivery timelines to customers.</span>
              </div>
            )}

            <button
              onClick={() => setSelectedItem(null)}
              className="mt-4 w-full px-4 py-2 rounded-xl bg-primary-500 text-white text-sm font-semibold hover:bg-primary-600 transition-colors"
            >
              Close
            </button>
          </Card>
        </div>
      )}
    </DashboardLayout>
  );
}
