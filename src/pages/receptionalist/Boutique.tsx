import { useState } from "react";
import {
  HiOutlineSearch,
  HiOutlineCube,
  HiOutlineExclamationCircle,
  HiOutlineCheckCircle,
  HiOutlineFilter,
  HiOutlineX,
} from "react-icons/hi";
import { DashboardLayout } from "../../components";
import { Card } from "../../components/ui";
import { useAuth } from "../../context/AuthContext";

// ─── Mock Data ────────────────────────────────────────────────────────────────

type ProductCategory =
  | "Printing"
  | "Binding"
  | "Packaging"
  | "Stationery"
  | "Signage"
  | "Promotional";

type StockStatus = "in-stock" | "low-stock" | "out-of-stock";

interface BoutiqueProduct {
  id: string;
  name: string;
  category: ProductCategory;
  description: string;
  unit: string;
  price: number;
  stock: number;
  minStock: number;
  status: StockStatus;
  sku: string;
}

const MOCK_PRODUCTS: BoutiqueProduct[] = [
  { id: "1",  name: "A4 Flyers (Full Color)",       category: "Printing",     description: "Full color double-sided A4 flyers, glossy finish",         unit: "per 100",  price: 8000,   stock: 500,  minStock: 100, status: "in-stock",      sku: "PRN-001" },
  { id: "2",  name: "Business Cards",                category: "Printing",     description: "Standard 85×55mm business cards, matte or glossy",         unit: "per 100",  price: 5000,   stock: 1200, minStock: 200, status: "in-stock",      sku: "PRN-002" },
  { id: "3",  name: "A3 Posters",                    category: "Printing",     description: "High-resolution A3 posters, full color",                   unit: "per 50",   price: 12000,  stock: 80,   minStock: 50,  status: "low-stock",     sku: "PRN-003" },
  { id: "4",  name: "Letterheads",                   category: "Printing",     description: "Custom branded letterheads, A4 size",                      unit: "per 100",  price: 6000,   stock: 300,  minStock: 100, status: "in-stock",      sku: "PRN-004" },
  { id: "5",  name: "Brochures (Tri-fold)",          category: "Printing",     description: "Tri-fold brochures, full color, A4 folded to A5",          unit: "per 100",  price: 15000,  stock: 0,    minStock: 50,  status: "out-of-stock",  sku: "PRN-005" },
  { id: "6",  name: "Spiral Binding",                category: "Binding",      description: "Spiral binding for documents up to 200 pages",             unit: "per item", price: 1500,   stock: 200,  minStock: 50,  status: "in-stock",      sku: "BND-001" },
  { id: "7",  name: "Hard Cover Binding",            category: "Binding",      description: "Hard cover binding with custom title printing",            unit: "per item", price: 4500,   stock: 40,   minStock: 30,  status: "low-stock",     sku: "BND-002" },
  { id: "8",  name: "Soft Cover Binding",            category: "Binding",      description: "Soft cover binding, laminated front cover",               unit: "per item", price: 2500,   stock: 150,  minStock: 50,  status: "in-stock",      sku: "BND-003" },
  { id: "9",  name: "Gift Boxes (Small)",            category: "Packaging",    description: "Custom printed small gift boxes, 15×10×8 cm",             unit: "per 10",   price: 7000,   stock: 60,   minStock: 20,  status: "in-stock",      sku: "PKG-001" },
  { id: "10", name: "Gift Boxes (Large)",            category: "Packaging",    description: "Custom printed large gift boxes, 30×20×15 cm",            unit: "per 10",   price: 14000,  stock: 0,    minStock: 20,  status: "out-of-stock",  sku: "PKG-002" },
  { id: "11", name: "Branded Paper Bags",            category: "Packaging",    description: "Kraft paper bags with custom logo printing",              unit: "per 50",   price: 18000,  stock: 120,  minStock: 50,  status: "in-stock",      sku: "PKG-003" },
  { id: "12", name: "Notebooks (A5)",                category: "Stationery",   description: "Custom branded A5 notebooks, 100 pages",                  unit: "per item", price: 3500,   stock: 85,   minStock: 30,  status: "in-stock",      sku: "STA-001" },
  { id: "13", name: "Pens (Branded)",                category: "Stationery",   description: "Ballpoint pens with custom logo engraving",               unit: "per 10",   price: 8000,   stock: 20,   minStock: 30,  status: "low-stock",     sku: "STA-002" },
  { id: "14", name: "Sticky Notes (Custom)",         category: "Stationery",   description: "Custom printed sticky note pads, 75×75mm",               unit: "per pad",  price: 2000,   stock: 200,  minStock: 50,  status: "in-stock",      sku: "STA-003" },
  { id: "15", name: "Roll-Up Banner (85×200cm)",     category: "Signage",      description: "Pull-up roll banner with full color print and stand",     unit: "per item", price: 45000,  stock: 15,   minStock: 5,   status: "in-stock",      sku: "SGN-001" },
  { id: "16", name: "Vinyl Banner (1×2m)",           category: "Signage",      description: "Outdoor vinyl banner, weatherproof, with eyelets",        unit: "per item", price: 25000,  stock: 0,    minStock: 5,   status: "out-of-stock",  sku: "SGN-002" },
  { id: "17", name: "Foam Board Mounting",           category: "Signage",      description: "Foam board mounting for posters and displays, A2 size",   unit: "per item", price: 8000,   stock: 30,   minStock: 10,  status: "in-stock",      sku: "SGN-003" },
  { id: "18", name: "T-Shirts (Branded)",            category: "Promotional",  description: "Custom printed T-shirts, available in all sizes",         unit: "per item", price: 12000,  stock: 50,   minStock: 20,  status: "in-stock",      sku: "PRO-001" },
  { id: "19", name: "Caps (Branded)",                category: "Promotional",  description: "Embroidered caps with custom logo",                       unit: "per item", price: 9000,   stock: 25,   minStock: 20,  status: "low-stock",     sku: "PRO-002" },
  { id: "20", name: "Tote Bags (Branded)",           category: "Promotional",  description: "Canvas tote bags with custom screen printing",            unit: "per item", price: 6500,   stock: 0,    minStock: 20,  status: "out-of-stock",  sku: "PRO-003" },
];

const CATEGORIES: ProductCategory[] = [
  "Printing", "Binding", "Packaging", "Stationery", "Signage", "Promotional",
];

const statusConfig: Record<StockStatus, { label: string; color: string; icon: React.ReactNode }> = {
  "in-stock":      { label: "In Stock",      color: "bg-emerald-100 text-emerald-700", icon: <HiOutlineCheckCircle className="w-3.5 h-3.5" /> },
  "low-stock":     { label: "Low Stock",     color: "bg-yellow-100 text-yellow-700",   icon: <HiOutlineExclamationCircle className="w-3.5 h-3.5" /> },
  "out-of-stock":  { label: "Out of Stock",  color: "bg-red-100 text-red-600",         icon: <HiOutlineExclamationCircle className="w-3.5 h-3.5" /> },
};

const categoryColors: Record<ProductCategory, string> = {
  Printing:    "bg-blue-100 text-blue-700",
  Binding:     "bg-purple-100 text-purple-700",
  Packaging:   "bg-orange-100 text-orange-700",
  Stationery:  "bg-teal-100 text-teal-700",
  Signage:     "bg-indigo-100 text-indigo-700",
  Promotional: "bg-pink-100 text-pink-700",
};

// ─── Component ────────────────────────────────────────────────────────────────

export default function BoutiquePage() {
  const { userRole, userName } = useAuth();
  const [search, setSearch] = useState("");
  const [selectedCategory, setSelectedCategory] = useState<ProductCategory | "all">("all");
  const [selectedStatus, setSelectedStatus] = useState<StockStatus | "all">("all");
  const [showFilters, setShowFilters] = useState(false);
  const [selectedProduct, setSelectedProduct] = useState<BoutiqueProduct | null>(null);

  const filtered = MOCK_PRODUCTS.filter((p) => {
    const matchesSearch =
      p.name.toLowerCase().includes(search.toLowerCase()) ||
      p.sku.toLowerCase().includes(search.toLowerCase()) ||
      p.description.toLowerCase().includes(search.toLowerCase());
    const matchesCategory = selectedCategory === "all" || p.category === selectedCategory;
    const matchesStatus = selectedStatus === "all" || p.status === selectedStatus;
    return matchesSearch && matchesCategory && matchesStatus;
  });

  const activeFilters =
    (selectedCategory !== "all" ? 1 : 0) + (selectedStatus !== "all" ? 1 : 0);

  const inStockCount    = MOCK_PRODUCTS.filter((p) => p.status === "in-stock").length;
  const lowStockCount   = MOCK_PRODUCTS.filter((p) => p.status === "low-stock").length;
  const outOfStockCount = MOCK_PRODUCTS.filter((p) => p.status === "out-of-stock").length;

  return (
    <DashboardLayout
      userRole={userRole ?? "receptionist"}
      userName={userName ?? "Reception Desk"}
      notificationCount={0}
    >
      <div className="space-y-6 font-[family-name:var(--font-family-primary)]">

        {/* ── Header ──────────────────────────────────────────────────────── */}
        <div>
          <h1 className="text-2xl md:text-3xl font-bold text-secondary-100">Boutique</h1>
          <p className="text-sm text-custom-700 mt-1">
            Browse available products and check stock before confirming a customer order
          </p>
        </div>

        {/* ── Summary Cards ───────────────────────────────────────────────── */}
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
          <Card className="!p-4">
            <p className="text-xs text-custom-700 mb-1">Total Products</p>
            <p className="text-2xl font-bold text-secondary-100">{MOCK_PRODUCTS.length}</p>
          </Card>
          <Card className="!p-4">
            <p className="text-xs text-custom-700 mb-1">In Stock</p>
            <p className="text-2xl font-bold text-emerald-600">{inStockCount}</p>
          </Card>
          <Card className="!p-4">
            <p className="text-xs text-custom-700 mb-1">Low Stock</p>
            <p className="text-2xl font-bold text-yellow-600">{lowStockCount}</p>
          </Card>
          <Card className="!p-4">
            <p className="text-xs text-custom-700 mb-1">Out of Stock</p>
            <p className="text-2xl font-bold text-red-600">{outOfStockCount}</p>
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
          {CATEGORIES.map((cat) => (
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

        {/* ── Product Grid ─────────────────────────────────────────────────── */}
        {filtered.length === 0 ? (
          <Card className="!p-12 text-center">
            <HiOutlineCube className="w-10 h-10 text-custom-700 mx-auto mb-3" />
            <p className="text-secondary-100 font-semibold">No products found</p>
            <p className="text-sm text-custom-700 mt-1">Try adjusting your search or filters</p>
          </Card>
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
            {filtered.map((product) => {
              const status = statusConfig[product.status];
              return (
                <Card
                  key={product.id}
                  className="!p-4 cursor-pointer hover:shadow-md hover:border-primary-300 transition-all"
                  onClick={() => setSelectedProduct(product)}
                >
                  {/* Category + Status */}
                  <div className="flex items-center justify-between mb-3">
                    <span className={`text-xs font-semibold px-2.5 py-1 rounded-full ${categoryColors[product.category]}`}>
                      {product.category}
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
                  <h3 className="font-bold text-secondary-100 text-sm leading-snug mb-1">{product.name}</h3>
                  <p className="text-xs text-custom-700 line-clamp-2 mb-3">{product.description}</p>

                  <div className="flex items-center justify-between pt-2 border-t border-custom-200">
                    <div>
                      <p className="text-xs text-custom-700">Price</p>
                      <p className="text-sm font-bold text-secondary-100">
                        {product.price.toLocaleString()} <span className="text-xs font-normal text-custom-700">RWF</span>
                      </p>
                      <p className="text-xs text-custom-700">{product.unit}</p>
                    </div>
                    <div className="text-right">
                      <p className="text-xs text-custom-700">Stock</p>
                      <p className={`text-sm font-bold ${
                        product.status === "out-of-stock" ? "text-red-600" :
                        product.status === "low-stock"    ? "text-yellow-600" : "text-emerald-600"
                      }`}>
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
              <button onClick={() => setShowFilters(false)} className="text-custom-700 hover:text-secondary-100">
                <HiOutlineX className="w-5 h-5" />
              </button>
            </div>
            <div className="space-y-4">
              <div>
                <label className="block text-sm font-semibold text-secondary-100 mb-2">Category</label>
                <select
                  value={selectedCategory}
                  onChange={(e) => setSelectedCategory(e.target.value as ProductCategory | "all")}
                  className="w-full px-3 py-2 rounded-xl border border-custom-300 bg-style-500 text-secondary-100 focus:outline-none focus:border-primary-400"
                >
                  <option value="all">All Categories</option>
                  {CATEGORIES.map((c) => <option key={c} value={c}>{c}</option>)}
                </select>
              </div>
              <div>
                <label className="block text-sm font-semibold text-secondary-100 mb-2">Stock Status</label>
                <select
                  value={selectedStatus}
                  onChange={(e) => setSelectedStatus(e.target.value as StockStatus | "all")}
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

      {/* ── Product Detail Modal ──────────────────────────────────────────────── */}
      {selectedProduct && (
        <div className="fixed inset-0 bg-secondary-100/50 z-50 flex items-center justify-center p-4">
          <Card className="!p-6 max-w-md w-full">
            <div className="flex items-center justify-between mb-4">
              <div>
                <h3 className="text-lg font-bold text-secondary-100">{selectedProduct.name}</h3>
                <p className="text-xs font-mono text-custom-700 mt-0.5">SKU: {selectedProduct.sku}</p>
              </div>
              <button onClick={() => setSelectedProduct(null)} className="text-custom-700 hover:text-secondary-100">
                <HiOutlineX className="w-5 h-5" />
              </button>
            </div>

            <div className="flex gap-2 mb-4">
              <span className={`text-xs font-semibold px-2.5 py-1 rounded-full ${categoryColors[selectedProduct.category]}`}>
                {selectedProduct.category}
              </span>
              <span className={`inline-flex items-center gap-1 text-xs font-bold px-2.5 py-1 rounded-full ${statusConfig[selectedProduct.status].color}`}>
                {statusConfig[selectedProduct.status].icon}
                {statusConfig[selectedProduct.status].label}
              </span>
            </div>

            <p className="text-sm text-custom-700 mb-4">{selectedProduct.description}</p>

            <div className="rounded-xl bg-custom-100 border border-custom-300 p-4 space-y-3">
              <div className="flex justify-between text-sm">
                <span className="text-custom-700">Price</span>
                <span className="font-bold text-secondary-100">
                  {selectedProduct.price.toLocaleString()} RWF <span className="font-normal text-custom-700 text-xs">/ {selectedProduct.unit}</span>
                </span>
              </div>
              <div className="flex justify-between text-sm">
                <span className="text-custom-700">Current Stock</span>
                <span className={`font-bold ${
                  selectedProduct.status === "out-of-stock" ? "text-red-600" :
                  selectedProduct.status === "low-stock"    ? "text-yellow-600" : "text-emerald-600"
                }`}>
                  {selectedProduct.stock} units
                </span>
              </div>
              <div className="flex justify-between text-sm">
                <span className="text-custom-700">Minimum Stock</span>
                <span className="font-semibold text-secondary-100">{selectedProduct.minStock} units</span>
              </div>
            </div>

            {selectedProduct.status === "out-of-stock" && (
              <div className="mt-4 flex items-start gap-2 px-4 py-3 rounded-xl bg-red-50 border border-red-200 text-red-700 text-sm">
                <HiOutlineExclamationCircle className="w-5 h-5 flex-shrink-0 mt-0.5" />
                <span>This product is currently out of stock. Inform the customer and check back later.</span>
              </div>
            )}
            {selectedProduct.status === "low-stock" && (
              <div className="mt-4 flex items-start gap-2 px-4 py-3 rounded-xl bg-yellow-50 border border-yellow-200 text-yellow-700 text-sm">
                <HiOutlineExclamationCircle className="w-5 h-5 flex-shrink-0 mt-0.5" />
                <span>Stock is running low. Confirm availability with the stock team before committing to the customer.</span>
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
