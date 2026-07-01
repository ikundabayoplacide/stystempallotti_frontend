import { useMemo, useState } from "react";
import {
  HiOutlineArchive,
  HiOutlineExclamationCircle,
  HiOutlineRefresh,
  HiOutlineSearch,
} from "react-icons/hi";
import { DashboardLayout } from "../../components";
import { Card } from "../../components/ui";
import { useGetBindingStockItemsQuery } from "../../store/services/bindingStockService";

// ─── Helpers ──────────────────────────────────────────────────────────────────

const statusColors: Record<string, string> = {
  available:      "bg-emerald-100 text-emerald-700",
  low:            "bg-yellow-100 text-yellow-700",
  "out-of-stock": "bg-red-100 text-red-700",
};


const PAGE_SIZE = 10;

// ─── Main Page ────────────────────────────────────────────────────────────────

export default function PMBindingStockPage() {
  const [search, setSearch]             = useState("");
  const [statusFilter, setStatusFilter] = useState("");
  const [page, setPage]                 = useState(1);

  const { data, isLoading, refetch } = useGetBindingStockItemsQuery({ limit: 500 });
  const allItems = data?.data ?? [];

  // Client-side filter
  const filtered = useMemo(() => {
    const q = search.trim().toLowerCase();
    return allItems.filter((i) => {
      if (statusFilter && i.stockStatus !== statusFilter) return false;
      if (q && !i.itemName.toLowerCase().includes(q) && !i.category.toLowerCase().includes(q)) return false;
      return true;
    });
  }, [allItems, search, statusFilter]);

  const totalPages = Math.max(1, Math.ceil(filtered.length / PAGE_SIZE));
  const paginated  = filtered.slice((page - 1) * PAGE_SIZE, page * PAGE_SIZE);

  const available  = allItems.filter((i) => i.stockStatus === "available").length;
  const low        = allItems.filter((i) => i.stockStatus === "low").length;
  const outOfStock = allItems.filter((i) => i.stockStatus === "out-of-stock").length;

  return (
    <DashboardLayout>
      <div className="space-y-6 font-[family-name:var(--font-family-primary)]">

        {/* Header */}
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-xl bg-purple-100 flex items-center justify-center">
            <HiOutlineArchive className="w-5 h-5 text-purple-600" />
          </div>
          <div>
            <h1 className="text-2xl md:text-3xl font-bold text-secondary-100">Binding Stock</h1>
            <p className="text-sm text-custom-700 mt-0.5">View available binding stock items</p>
          </div>
        </div>

        {/* Summary cards */}
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
          {[
            { label: "Total Items",  value: allItems.length,  color: "text-secondary-100" },
            { label: "Available",    value: available,        color: "text-emerald-600"   },
            { label: "Low Stock",    value: low,              color: "text-yellow-600"    },
            { label: "Out of Stock", value: outOfStock,       color: "text-red-600"       },
          ].map(({ label, value, color }) => (
            <Card key={label} className="!p-4 text-center">
              <p className="text-xs text-custom-700 mb-1">{label}</p>
              <p className={`text-2xl font-bold ${color}`}>{isLoading ? "—" : value}</p>
            </Card>
          ))}
        </div>

        {/* Low/out-of-stock alert */}
        {!isLoading && (low > 0 || outOfStock > 0) && (
          <div className="flex items-center gap-2 px-4 py-2.5 rounded-xl bg-yellow-50 border border-yellow-200 text-yellow-700 text-xs font-semibold">
            <HiOutlineExclamationCircle className="w-4 h-4 flex-shrink-0" />
            {outOfStock > 0 && <span>{outOfStock} item{outOfStock > 1 ? "s" : ""} out of stock.</span>}
            {low > 0 && <span>{low} item{low > 1 ? "s" : ""} running low.</span>}
          </div>
        )}

        {/* Search + filter bar */}
        <div className="flex flex-wrap items-center gap-3">
          <div className="relative flex-1 min-w-48">
            <HiOutlineSearch className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-custom-700" />
            <input
              value={search}
              onChange={(e) => { setSearch(e.target.value); setPage(1); }}
              placeholder="Search by name or category…"
              className="w-full pl-9 pr-4 py-2 rounded-xl border border-custom-300 bg-style-500 text-secondary-100 text-sm placeholder:text-custom-400 focus:outline-none focus:border-primary-400 transition-colors"
            />
          </div>
          <select
            value={statusFilter}
            onChange={(e) => { setStatusFilter(e.target.value); setPage(1); }}
            className="px-3 py-2 rounded-xl border border-custom-300 bg-style-500 text-secondary-100 text-sm focus:outline-none focus:border-primary-400 transition-colors"
          >
            <option value="">All statuses</option>
            <option value="available">Available</option>
            <option value="low">Low Stock</option>
            <option value="out-of-stock">Out of Stock</option>
          </select>
          <button
            onClick={() => refetch()}
            className="p-2 rounded-xl border border-custom-300 hover:bg-custom-100 transition-colors text-custom-700"
          >
            <HiOutlineRefresh className={`w-4 h-4 ${isLoading ? "animate-spin" : ""}`} />
          </button>
        </div>

        {/* Table */}
        <Card className="!p-0 overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead className="bg-custom-100 border-b border-custom-300">
                <tr>
                  {["Item Name", "Category", "Unit", "Current Stock", "Alarm Level", "Status"].map((h) => (
                    <th key={h} className="px-3 py-2.5 text-left text-xs font-bold text-secondary-100 uppercase tracking-wide">
                      {h}
                    </th>
                  ))}
                </tr>
              </thead>
              <tbody className="divide-y divide-custom-200">
                {isLoading ? (
                  <tr>
                    <td colSpan={6} className="px-4 py-8 text-center text-custom-700 text-sm">Loading…</td>
                  </tr>
                ) : filtered.length === 0 ? (
                  <tr>
                    <td colSpan={6} className="px-4 py-10 text-center">
                      <HiOutlineArchive className="w-8 h-8 text-custom-400 mx-auto mb-2" />
                      <p className="text-sm text-secondary-100 font-semibold">No items found</p>
                      <p className="text-xs text-custom-700 mt-1">
                        {search || statusFilter ? "Try adjusting the search or filter." : "No binding stock items yet."}
                      </p>
                    </td>
                  </tr>
                ) : paginated.map((item) => (
                  <tr key={item.id} className="hover:bg-custom-50 transition-colors">
                    <td className="px-3 py-3">
                      <p className="text-sm font-semibold text-secondary-100">{item.itemName}</p>
                      {item.description && (
                        <p className="text-xs text-custom-700 truncate max-w-[180px]">{item.description}</p>
                      )}
                    </td>
                    <td className="px-3 py-3 text-sm text-secondary-100">{item.category}</td>
                    <td className="px-3 py-3 text-sm text-secondary-100">{item.unit}</td>
                    <td className="px-3 py-3">
                      <span className={`text-sm font-bold ${
                        item.stockStatus === "out-of-stock" ? "text-red-600" :
                        item.stockStatus === "low"          ? "text-yellow-600" : "text-secondary-100"
                      }`}>
                        {item.currentStock}
                      </span>
                    </td>
                    <td className="px-3 py-3 text-sm text-custom-700">{item.alarmStock}</td>
                    <td className="px-3 py-3">
                      <span className={`text-xs font-semibold px-2 py-0.5 rounded-full capitalize ${statusColors[item.stockStatus] ?? "bg-gray-100 text-gray-600"}`}>
                        {item.stockStatus.replace("-", " ")}
                      </span>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>

          {/* Pagination */}
          {!isLoading && filtered.length > 0 && (
            <div className="flex items-center justify-between px-4 py-3 border-t border-custom-300">
              <p className="text-xs text-custom-700">
                Showing{" "}
                <span className="font-semibold text-secondary-100">
                  {(page - 1) * PAGE_SIZE + 1}–{Math.min(page * PAGE_SIZE, filtered.length)}
                </span>{" "}
                of <span className="font-semibold text-secondary-100">{filtered.length}</span> items
                {filtered.length !== allItems.length && (
                  <span className="text-custom-400"> (filtered from {allItems.length})</span>
                )}
              </p>
              <div className="flex items-center gap-1">
                <button
                  onClick={() => setPage((p) => Math.max(1, p - 1))}
                  disabled={page === 1}
                  className="px-3 py-1.5 rounded-lg border border-custom-300 text-xs font-semibold text-secondary-100 hover:bg-custom-100 disabled:opacity-40 transition-colors"
                >
                  Prev
                </button>
                {Array.from({ length: totalPages }, (_, i) => i + 1).map((n) => (
                  <button
                    key={n}
                    onClick={() => setPage(n)}
                    className={`w-8 h-8 rounded-lg text-xs font-bold transition-colors ${
                      n === page
                        ? "bg-primary-500 text-white"
                        : "border border-custom-300 text-secondary-100 hover:bg-custom-100"
                    }`}
                  >
                    {n}
                  </button>
                ))}
                <button
                  onClick={() => setPage((p) => Math.min(totalPages, p + 1))}
                  disabled={page === totalPages}
                  className="px-3 py-1.5 rounded-lg border border-custom-300 text-xs font-semibold text-secondary-100 hover:bg-custom-100 disabled:opacity-40 transition-colors"
                >
                  Next
                </button>
              </div>
            </div>
          )}
        </Card>

      </div>
    </DashboardLayout>
  );
}
