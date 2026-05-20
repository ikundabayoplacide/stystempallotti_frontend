import { useState } from "react";
import {
  HiOutlineSearch,
  HiOutlineCube,
  HiOutlineExclamationCircle,
  HiOutlineCheckCircle,
  HiOutlineFilter,
  HiOutlineX,
  HiOutlineRefresh,
} from "react-icons/hi";
import { DashboardLayout } from "../../components";
import { Card } from "../../components/ui";
import {
  useGetCategoriesQuery,
  useGetProductsQuery,
  type BoutiqueProduct,
  type StockStatus,
} from "../../store/services/boutiqueService";

// ─── Status config ────────────────────────────────────────────────────────────

const statusConfig: Record<StockStatus, { label: string; color: string; icon: React.ReactNode }> = {
  "in-stock":     { label: "In Stock",     color: "bg-emerald-100 text-emerald-700", icon: <HiOutlineCheckCircle className="w-3.5 h-3.5" /> },
  "low-stock":    { label: "Low Stock",    color: "bg-yellow-100 text-yellow-700",   icon: <HiOutlineExclamationCircle className="w-3.5 h-3.5" /> },
  "out-of-stock": { label: "Out of Stock", color: "bg-red-100 text-red-600",         icon: <HiOutlineExclamationCircle className="w-3.5 h-3.5" /> },
};

// Cycle through a set of colors by index so each category gets a distinct badge
const CATEGORY_COLORS = [
  "bg-blue-100 text-blue-700",
  "bg-purple-100 text-purple-700",
  "bg-orange-100 text-orange-700",
  "bg-teal-100 text-teal-700",
  "bg-indigo-100 text-indigo-700",
  "bg-pink-100 text-pink-700",
  "bg-green-100 text-green-700",
  "bg-rose-100 text-rose-700",
];

// ─── Component ────────────────────────────────────────────────────────────────

export default function BoutiquePage() {
  const [search, setSearch] = useState("");
  const [selectedCategoryId, setSelectedCategoryId] = useState<string | "all">("all");
  const [selectedStatus, setSelectedStatus] = useState<StockStatus | "all">("all");
  const [showFilters, setShowFilters] = useState(false);
  const [selectedProduct, setSelectedProduct] = useState<BoutiqueProduct | null>(null);

  // ── Data fetching ──────────────────────────────────────────────────────────
  const {
    data: categories = [],
    isLoading: categoriesLoading,
  } = useGetCategoriesQuery();

  const {
    data,
    isLoading: productsLoading,
    isError: productsError,
    refetch,
  } = useGetProductsQuery({
    categoryId: selectedCategoryId !== "all" ? selectedCategoryId : undefined,
    status: selectedStatus !== "all" ? selectedStatus : undefined,
    search: search.trim() || undefined,
  });

  const products = data?.products ?? [];

  const isLoading = categoriesLoading || productsLoading;

  // ── Derived counts ─────────────────────────────────────────────────────────
  const inStockCount    = products.filter((p) => p.status === "in-stock").length;
  const lowStockCount   = products.filter((p) => p.status === "low-stock").length;
  const outOfStockCount = products.filter((p) => p.status === "out-of-stock").length;

  const activeFilters =
    (selectedCategoryId !== "all" ? 1 : 0) + (selectedStatus !== "all" ? 1 : 0);

  // Map category id → color class by index
  const categoryColorMap: Record<string, string> = Object.fromEntries(
    categories.map((cat, i) => [cat.id, CATEGORY_COLORS[i % CATEGORY_COLORS.length]])
  );

  return (
    <DashboardLayout notificationCount={0}>
      <div className="space-y-6 font-[family-name:var(--font-family-primary)]">

        {/* ── Header ──────────────────────────────────────────────────────── */}
        <div className="flex items-start justify-between gap-4">
          <div>
            <h1 className="text-2xl md:text-3xl font-bold text-secondary-100">Boutique</h1>
            <p className="text-sm text-custom-700 mt-1">
              Browse available products and check stock before confirming a customer order
            </p>
          </div>
          <button
            onClick={() => refetch()}
            className="flex items-center gap-2 px-3 py-2 rounded-xl border border-custom-300 hover:bg-custom-100 transition-colors text-custom-700 hover:text-secondary-100 text-sm"
            title="Refresh"
          >
            <HiOutlineRefresh className="w-4 h-4" />
            <span className="hidden sm:inline font-semibold">Refresh</span>
          </button>
        </div>

        {/* ── Summary Cards ───────────────────────────────────────────────── */}
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
          <Card className="!p-4">
            <p className="text-xs text-custom-700 mb-1">Total Products</p>
            <p className="text-2xl font-bold text-secondary-100">
              {isLoading ? "—" : products.length}
            </p>
          </Card>
          <Card className="!p-4">
            <p className="text-xs text-custom-700 mb-1">In Stock</p>
            <p className="text-2xl font-bold text-emerald-600">
              {isLoading ? "—" : inStockCount}
            </p>
          </Card>
          <Card className="!p-4">
            <p className="text-xs text-custom-700 mb-1">Low Stock</p>
            <p className="text-2xl font-bold text-yellow-600">
              {isLoading ? "—" : lowStockCount}
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
              placeholder="Search by name, SKU, or description..."
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
        {!categoriesLoading && categories.length > 0 && (
          <div className="flex flex-wrap gap-2">
            <button
              onClick={() => setSelectedCategoryId("all")}
              className={`px-3 py-1.5 rounded-full text-xs font-semibold transition-colors ${
                selectedCategoryId === "all"
                  ? "bg-primary-500 text-white"
                  : "bg-custom-100 text-custom-700 hover:bg-custom-200"
              }`}
            >
              All Categories
            </button>
            {categories.map((cat) => (
              <button
                key={cat.id}
                onClick={() =>
                  setSelectedCategoryId(cat.id === selectedCategoryId ? "all" : cat.id)
                }
                className={`px-3 py-1.5 rounded-full text-xs font-semibold transition-colors ${
                  selectedCategoryId === cat.id
                    ? "bg-primary-500 text-white"
                    : "bg-custom-100 text-custom-700 hover:bg-custom-200"
                }`}
              >
                {cat.name}
              </button>
            ))}
          </div>
        )}

        {/* ── Product Grid ─────────────────────────────────────────────────── */}
        {isLoading ? (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
            {Array.from({ length: 8 }).map((_, i) => (
              <Card key={i} className="!p-4 animate-pulse">
                <div className="flex justify-between mb-3">
                  <div className="h-5 w-20 bg-custom-200 rounded-full" />
                  <div className="h-5 w-20 bg-custom-200 rounded-full" />
                </div>
                <div className="w-full h-24 rounded-xl bg-custom-200 mb-3" />
                <div className="h-4 w-3/4 bg-custom-200 rounded mb-2" />
                <div className="h-3 w-full bg-custom-200 rounded mb-1" />
                <div className="h-3 w-2/3 bg-custom-200 rounded" />
              </Card>
            ))}
          </div>
        ) : productsError ? (
          <Card className="!p-12 text-center">
            <HiOutlineExclamationCircle className="w-10 h-10 text-red-400 mx-auto mb-3" />
            <p className="text-secondary-100 font-semibold">Failed to load products</p>
            <p className="text-sm text-custom-700 mt-1 mb-4">Check your connection and try again</p>
            <button
              onClick={() => refetch()}
              className="px-4 py-2 rounded-xl bg-primary-500 text-white text-sm font-semibold hover:bg-primary-600 transition-colors"
            >
              Retry
            </button>
          </Card>
        ) : products.length === 0 ? (
          <Card className="!p-12 text-center">
            <HiOutlineCube className="w-10 h-10 text-custom-700 mx-auto mb-3" />
            <p className="text-secondary-100 font-semibold">No products found</p>
            <p className="text-sm text-custom-700 mt-1">Try adjusting your search or filters</p>
          </Card>
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
            {products.map((product) => {
              const status = statusConfig[product.status];
              const catColor = categoryColorMap[product.categoryId] ?? CATEGORY_COLORS[0];
              return (
                <Card
                  key={product.id}
                  className="!p-4 cursor-pointer hover:shadow-md hover:border-primary-300 transition-all"
                  onClick={() => setSelectedProduct(product)}
                >
                  {/* Category + Status */}
                  <div className="flex items-center justify-between mb-3">
                    <span className={`text-xs font-semibold px-2.5 py-1 rounded-full ${catColor}`}>
                      {product.category?.name ?? "—"}
                    </span>
                    <span className={`inline-flex items-center gap-1 text-xs font-bold px-2.5 py-1 rounded-full ${status.color}`}>
                      {status.icon}
                      {status.label}
                    </span>
                  </div>

                  {/* Product icon placeholder */}
                  <div className="w-full h-24 rounded-xl bg-custom-100 flex items-center justify-center mb-3">
                    <HiOutlineCube className="w-10 h-10 text-custom-400" />
                  </div>

                  {/* Info */}
                  <h3 className="font-bold text-secondary-100 text-sm leading-snug mb-1">
                    {product.name}
                  </h3>
                  <p className="text-xs text-custom-700 line-clamp-2 mb-3">
                    {product.description}
                  </p>

                  <div className="flex items-center justify-between pt-2 border-t border-custom-200">
                    <div>
                      <p className="text-xs text-custom-700">Price</p>
                      <p className="text-sm font-bold text-secondary-100">
                        {product.price.toLocaleString()}{" "}
                        <span className="text-xs font-normal text-custom-700">RWF</span>
                      </p>
                      <p className="text-xs text-custom-700">{product.unit}</p>
                    </div>
                    <div className="text-right">
                      <p className="text-xs text-custom-700">Stock</p>
                      <p
                        className={`text-sm font-bold ${
                          product.status === "out-of-stock"
                            ? "text-red-600"
                            : product.status === "low-stock"
                            ? "text-yellow-600"
                            : "text-emerald-600"
                        }`}
                      >
                        {product.stock}
                      </p>
                      <p className="text-xs text-custom-700">units</p>
                    </div>
                  </div>

                  <div className="mt-2">
                    <p className="text-xs text-custom-400 font-mono">SKU: {product.sku}</p>
                  </div>
                </Card>
              );
            })}
          </div>
        )}
      </div>

      {/* ── Filter Modal ─────────────────────────────────────────────────────── */}
      {showFilters && (
        <div className="fixed inset-0 bg-secondary-100/50 z-50 flex items-center justify-center p-4">
          <Card className="!p-6 max-w-sm w-full">
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-lg font-bold text-secondary-100">Filter Products</h3>
              <button
                onClick={() => setShowFilters(false)}
                className="text-custom-700 hover:text-secondary-100"
              >
                <HiOutlineX className="w-5 h-5" />
              </button>
            </div>
            <div className="space-y-4">
              <div>
                <label className="block text-sm font-semibold text-secondary-100 mb-2">
                  Category
                </label>
                <select
                  value={selectedCategoryId}
                  onChange={(e) => setSelectedCategoryId(e.target.value)}
                  className="w-full px-3 py-2 rounded-xl border border-custom-300 bg-style-500 text-secondary-100 focus:outline-none focus:border-primary-400"
                >
                  <option value="all">All Categories</option>
                  {categories.map((c) => (
                    <option key={c.id} value={c.id}>
                      {c.name}
                    </option>
                  ))}
                </select>
              </div>
              <div>
                <label className="block text-sm font-semibold text-secondary-100 mb-2">
                  Stock Status
                </label>
                <select
                  value={selectedStatus}
                  onChange={(e) =>
                    setSelectedStatus(e.target.value as StockStatus | "all")
                  }
                  className="w-full px-3 py-2 rounded-xl border border-custom-300 bg-style-500 text-secondary-100 focus:outline-none focus:border-primary-400"
                >
                  <option value="all">All Statuses</option>
                  <option value="in-stock">In Stock</option>
                  <option value="low-stock">Low Stock</option>
                  <option value="out-of-stock">Out of Stock</option>
                </select>
              </div>
            </div>
            <div className="flex gap-3 mt-5">
              <button
                onClick={() => {
                  setSelectedCategoryId("all");
                  setSelectedStatus("all");
                }}
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

      {/* ── Product Detail Modal ──────────────────────────────────────────────── */}
      {selectedProduct && (
        <div className="fixed inset-0 bg-secondary-100/50 z-50 flex items-center justify-center p-4">
          <Card className="!p-6 max-w-md w-full">
            <div className="flex items-center justify-between mb-4">
              <div>
                <h3 className="text-lg font-bold text-secondary-100">
                  {selectedProduct.name}
                </h3>
                <p className="text-xs font-mono text-custom-700 mt-0.5">
                  SKU: {selectedProduct.sku}
                </p>
              </div>
              <button
                onClick={() => setSelectedProduct(null)}
                className="text-custom-700 hover:text-secondary-100"
              >
                <HiOutlineX className="w-5 h-5" />
              </button>
            </div>

            <div className="flex gap-2 mb-4">
              <span
                className={`text-xs font-semibold px-2.5 py-1 rounded-full ${
                  categoryColorMap[selectedProduct.categoryId] ?? CATEGORY_COLORS[0]
                }`}
              >
                {selectedProduct.category?.name ?? "—"}
              </span>
              <span
                className={`inline-flex items-center gap-1 text-xs font-bold px-2.5 py-1 rounded-full ${
                  statusConfig[selectedProduct.status].color
                }`}
              >
                {statusConfig[selectedProduct.status].icon}
                {statusConfig[selectedProduct.status].label}
              </span>
            </div>

            <p className="text-sm text-custom-700 mb-4">{selectedProduct.description}</p>

            <div className="rounded-xl bg-custom-100 border border-custom-300 p-4 space-y-3">
              <div className="flex justify-between text-sm">
                <span className="text-custom-700">Price</span>
                <span className="font-bold text-secondary-100">
                  {selectedProduct.price.toLocaleString()} RWF{" "}
                  <span className="font-normal text-custom-700 text-xs">
                    / {selectedProduct.unit}
                  </span>
                </span>
              </div>
              <div className="flex justify-between text-sm">
                <span className="text-custom-700">Current Stock</span>
                <span
                  className={`font-bold ${
                    selectedProduct.status === "out-of-stock"
                      ? "text-red-600"
                      : selectedProduct.status === "low-stock"
                      ? "text-yellow-600"
                      : "text-emerald-600"
                  }`}
                >
                  {selectedProduct.stock} units
                </span>
              </div>
              <div className="flex justify-between text-sm">
                <span className="text-custom-700">Minimum Stock</span>
                <span className="font-semibold text-secondary-100">
                  {selectedProduct.minStock} units
                </span>
              </div>
            </div>

            {selectedProduct.status === "out-of-stock" && (
              <div className="mt-4 flex items-start gap-2 px-4 py-3 rounded-xl bg-red-50 border border-red-200 text-red-700 text-sm">
                <HiOutlineExclamationCircle className="w-5 h-5 flex-shrink-0 mt-0.5" />
                <span>
                  This product is currently out of stock. Inform the customer and check back
                  later.
                </span>
              </div>
            )}
            {selectedProduct.status === "low-stock" && (
              <div className="mt-4 flex items-start gap-2 px-4 py-3 rounded-xl bg-yellow-50 border border-yellow-200 text-yellow-700 text-sm">
                <HiOutlineExclamationCircle className="w-5 h-5 flex-shrink-0 mt-0.5" />
                <span>
                  Stock is running low. Confirm availability with the stock team before
                  committing to the customer.
                </span>
              </div>
            )}

            <button
              onClick={() => setSelectedProduct(null)}
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
