import { useEffect, useMemo, useState } from "react";
import {
  HiOutlineArchive,
  HiOutlineCheckCircle,
  HiOutlineExclamationCircle,
  HiOutlinePlus,
  HiOutlineRefresh,
  HiOutlineSearch,
  HiOutlineTrendingDown,
  HiOutlineTrendingUp,
  HiOutlineX,
} from "react-icons/hi";
import { Button, Card, Input } from "../../components/ui";
import {
  useGetStockItemsQuery,
  useGetStockEntriesQuery,
  useGetStockSortiesQuery,
  useCreateStockItemMutation,
  useCreateStockEntryMutation,
  useCreateStockSortieMutation,
  useApproveSortieMutation,
  useRejectSortieMutation,
  type StockItem,
} from "../../store/services/stockService";

// ─── Helpers ──────────────────────────────────────────────────────────────────

function stockStatusLabel(item: StockItem): string {
  if (item.stockStatus === "out-of-stock" || item.currentStock === 0) return "Out of Stock";
  if (item.stockStatus === "low" || item.currentStock <= item.alarmStock) return "Low";
  return "Good";
}

const statusColor: Record<string, string> = {
  Good: "bg-green-100 text-green-700",
  Low: "bg-yellow-100 text-yellow-700",
  "Out of Stock": "bg-red-100 text-red-700",
};

function timeAgo(dateStr: string): string {
  const diff = Date.now() - new Date(dateStr).getTime();
  const mins = Math.floor(diff / 60000);
  if (mins < 1) return "just now";
  if (mins < 60) return `${mins}m ago`;
  if (mins < 1440) return `${Math.floor(mins / 60)}h ago`;
  return `${Math.floor(mins / 1440)}d ago`;
}

// ─── Component ────────────────────────────────────────────────────────────────

export default function StockDashboard() {
  const [search, setSearch] = useState("");
  const [filterStatus, setFilterStatus] = useState("All");

  // Pagination
  const STOCK_PAGE_SIZE = 10;
  const PENDING_PAGE_SIZE = 5;
  const [stockPage, setStockPage] = useState(1);
  const [pendingPage, setPendingPage] = useState(1);
  const [usagePage, setUsagePage] = useState(1);
  const [sideTab, setSideTab] = useState<"usage" | "pending">("usage");

  // Modals
  const [showAddModal, setShowAddModal] = useState(false);
  const [showRestockModal, setShowRestockModal] = useState(false);
  const [showSortieModal, setShowSortieModal] = useState(false);

  // Forms
  const [addForm, setAddForm] = useState({
    itemName: "", category: "", type: "general" as "general" | "boutique" | "hobe",
    unit: "", currentStock: "", alarmStock: "", description: "",
  });
  const [restockForm, setRestockForm] = useState({ stockItemId: "", quantity: "", note: "" });
  const [sortieForm, setSortieForm] = useState({ stockItemId: "", quantityOut: "", reason: "", notes: "" });

  // API
  const { data: itemsData, isLoading: itemsLoading, refetch: refetchItems } =
    useGetStockItemsQuery({ limit: 500 });
  const { data: entriesData, isLoading: entriesLoading, refetch: refetchEntries } =
    useGetStockEntriesQuery({ limit: 20 });
  const { data: sortiesData, isLoading: sortiesLoading, refetch: refetchSorties } =
    useGetStockSortiesQuery({ limit: 20 });

  const [createStockItem, { isLoading: creating }] = useCreateStockItemMutation();
  const [createEntry, { isLoading: restocking }] = useCreateStockEntryMutation();
  const [createSortie, { isLoading: sortieSubmitting }] = useCreateStockSortieMutation();
  const [approveSortie] = useApproveSortieMutation();
  const [rejectSortie] = useRejectSortieMutation();

  const allItems = itemsData?.data ?? [];
  const allEntries = entriesData?.data ?? [];
  const allSorties = sortiesData?.data ?? [];
  const isLoading = itemsLoading || entriesLoading || sortiesLoading;

  const refetchAll = () => { refetchItems(); refetchEntries(); refetchSorties(); };

  // ── KPIs ──────────────────────────────────────────────────────────────────
  const kpis = useMemo(() => {
    const total = allItems.length;
    const outOfStock = allItems.filter((i) => i.currentStock === 0).length;
    const low = allItems.filter((i) => i.currentStock > 0 && i.currentStock <= i.alarmStock).length;
    const good = total - outOfStock - low;
    return { total, outOfStock, low, good };
  }, [allItems]);

  // ── Category stats ────────────────────────────────────────────────────────
  const categoryStats = useMemo(() => {
    const map = new Map<string, { items: number; total: number; current: number }>();
    allItems.forEach((item) => {
      const cat = item.category || "Other";
      const prev = map.get(cat) ?? { items: 0, total: 0, current: 0 };
      map.set(cat, {
        items: prev.items + 1,
        total: prev.total + item.alarmStock,
        current: prev.current + item.currentStock,
      });
    });
    return Array.from(map.entries()).map(([category, v]) => ({
      category,
      items: v.items,
      pct: v.total > 0 ? Math.min(100, Math.round((v.current / (v.total * 3)) * 100)) : 0,
    }));
  }, [allItems]);

  // ── Filtered table ────────────────────────────────────────────────────────
  const filtered = useMemo(() => {
    return allItems.filter((item) => {
      const label = stockStatusLabel(item);
      const matchSearch =
        (item.itemName ?? "").toLowerCase().includes(search.toLowerCase()) ||
        (item.category ?? "").toLowerCase().includes(search.toLowerCase());
      const matchFilter = filterStatus === "All" || label === filterStatus;
      return matchSearch && matchFilter;
    });
  }, [allItems, search, filterStatus]);

  // Reset to page 1 whenever filters change
  useEffect(() => {
    setStockPage(1);
  }, [search, filterStatus]);

  // Paginated slices
  const stockTotalPages = Math.max(1, Math.ceil(filtered.length / STOCK_PAGE_SIZE));
  const pagedItems = filtered.slice((stockPage - 1) * STOCK_PAGE_SIZE, stockPage * STOCK_PAGE_SIZE);

  const pendingSorties = allSorties.filter((s) => s.status === "pending");
  const pendingTotalPages = Math.max(1, Math.ceil(pendingSorties.length / PENDING_PAGE_SIZE));
  const pagedPending = pendingSorties.slice((pendingPage - 1) * PENDING_PAGE_SIZE, pendingPage * PENDING_PAGE_SIZE);

  const USAGE_PAGE_SIZE = 5;
  const usageTotalPages = Math.max(1, Math.ceil(allSorties.length / USAGE_PAGE_SIZE));
  const pagedSorties = allSorties.slice((usagePage - 1) * USAGE_PAGE_SIZE, usagePage * USAGE_PAGE_SIZE);

  // ── Handlers ─────────────────────────────────────────────────────────────
  async function handleAddItem(e: React.FormEvent) {
    e.preventDefault();
    try {
      await createStockItem({
        itemName: addForm.itemName,
        category: addForm.category,
        type: addForm.type,
        unit: addForm.unit,
        currentStock: Number(addForm.currentStock),
        alarmStock: Number(addForm.alarmStock),
        description: addForm.description || undefined,
      }).unwrap();
      setAddForm({ itemName: "", category: "", type: "general", unit: "", currentStock: "", alarmStock: "", description: "" });
      setShowAddModal(false);
      refetchItems();
    } catch (err: any) {
      alert(err?.data?.message ?? "Failed to add stock item");
    }
  }

  async function handleRestock(e: React.FormEvent) {
    e.preventDefault();
    try {
      await createEntry({
        stockItemId: restockForm.stockItemId,
        quantity: Number(restockForm.quantity),
        note: restockForm.note || undefined,
      }).unwrap();
      setRestockForm({ stockItemId: "", quantity: "", note: "" });
      setShowRestockModal(false);
      refetchItems(); refetchEntries();
    } catch (err: any) {
      alert(err?.data?.message ?? "Failed to restock");
    }
  }

  async function handleSortie(e: React.FormEvent) {
    e.preventDefault();
    try {
      await createSortie({
        stockItemId: sortieForm.stockItemId,
        quantityOut: Number(sortieForm.quantityOut),
        reason: sortieForm.reason,
        notes: sortieForm.notes || undefined,
      }).unwrap();
      setSortieForm({ stockItemId: "", quantityOut: "", reason: "", notes: "" });
      setShowSortieModal(false);
      refetchSorties();
    } catch (err: any) {
      alert(err?.data?.message ?? "Failed to create sortie");
    }
  }

  return (
    <div className="space-y-8 font-[family-name:var(--font-family-primary)]">

      {/* Header */}
      <div className="flex flex-col xs:flex-row xs:items-center justify-between gap-3">
        <div>
          <h1 className="text-2xl md:text-3xl font-bold text-secondary-100">Stock Management</h1>
          <p className="text-sm text-custom-700 mt-1">Monitor inventory levels and material usage</p>
        </div>
        <div className="flex gap-2 flex-wrap items-center">
          <button
            onClick={refetchAll}
            className="flex items-center gap-2 px-3 py-2 rounded-xl border border-custom-300 hover:bg-custom-100 transition-colors text-sm font-semibold text-custom-700"
          >
            <HiOutlineRefresh className={`w-4 h-4 ${isLoading ? "animate-spin" : ""}`} />
            Refresh
          </button>
          <button
            onClick={() => setShowAddModal(true)}
            className="px-4 py-2 rounded-xl bg-primary-500 text-white font-semibold hover:bg-primary-600 transition-colors text-sm flex items-center gap-2"
          >
            <HiOutlinePlus className="w-4 h-4" />
            New Item
          </button>
          <button
            onClick={() => setShowRestockModal(true)}
            className="px-4 py-2 rounded-xl bg-green-600 text-white font-semibold hover:bg-green-700 transition-colors text-sm"
          >
            Restock
          </button>
          <button
            onClick={() => setShowSortieModal(true)}
            className="px-4 py-2 rounded-xl bg-orange-600 text-white font-semibold hover:bg-orange-700 transition-colors text-sm"
          >
            Record Usage
          </button>
        </div>
      </div>

      {/* KPI Grid */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
        {[
          { label: "Total Items", value: kpis.total, icon: HiOutlineArchive, color: "text-primary-500", bg: "bg-primary-100" },
          { label: "Low Stock", value: kpis.low, icon: HiOutlineExclamationCircle, color: "text-yellow-600", bg: "bg-yellow-100" },
          { label: "Out of Stock", value: kpis.outOfStock, icon: HiOutlineTrendingDown, color: "text-red-500", bg: "bg-red-100" },
          { label: "Well Stocked", value: kpis.good, icon: HiOutlineCheckCircle, color: "text-green-600", bg: "bg-green-100" },
        ].map(({ label, value, icon: Icon, color, bg }) => (
          <Card key={label} className="!p-4 flex flex-col gap-3">
            <div className={`w-10 h-10 rounded-xl flex items-center justify-center ${bg}`}>
              <Icon className={`w-5 h-5 ${color}`} />
            </div>
            <div>
              <p className="text-xs text-custom-700">{label}</p>
              <p className="text-2xl font-bold text-secondary-100">{isLoading ? "—" : value}</p>
            </div>
          </Card>
        ))}
      </div>

      {/* Main Grid */}
      <div className="grid grid-cols-1 xl:grid-cols-3 gap-6">

        {/* Stock Table */}
        <Card className="xl:col-span-2">
          <div className="flex flex-col gap-3 mb-5">
            <div className="flex items-center gap-2">
              <HiOutlineArchive className="w-5 h-5 text-primary-500" />
              <h2 className="font-bold text-secondary-100">Stock Inventory</h2>
              <span className="text-xs text-custom-700 ml-auto">{filtered.length} item{filtered.length !== 1 ? "s" : ""}</span>
            </div>
            <div className="flex flex-col xs:flex-row gap-3">
              <div className="relative flex-1">
                <HiOutlineSearch className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-custom-700" />
                <input
                  type="text"
                  placeholder="Search by name or category..."
                  value={search}
                  onChange={(e) => setSearch(e.target.value)}
                  className="w-full pl-9 pr-4 py-2 rounded-xl border border-custom-300 bg-style-500 text-secondary-100 text-sm placeholder:text-custom-700 focus:outline-none focus:border-primary-400 focus:ring-2 focus:ring-primary-200 transition-colors font-[family-name:var(--font-family-primary)]"
                />
              </div>
              <select
                value={filterStatus}
                onChange={(e) => setFilterStatus(e.target.value)}
                className="px-4 py-2 rounded-xl border border-custom-300 bg-style-500 text-secondary-100 text-sm focus:outline-none focus:border-primary-400 focus:ring-2 focus:ring-primary-200 transition-colors font-[family-name:var(--font-family-primary)]"
              >
                <option value="All">All Status</option>
                <option value="Good">Good</option>
                <option value="Low">Low</option>
                <option value="Out of Stock">Out of Stock</option>
              </select>
            </div>
          </div>

          {itemsLoading ? (
            <div className="space-y-3">
              {Array.from({ length: 5 }).map((_, i) => (
                <div key={i} className="h-10 bg-custom-100 rounded-xl animate-pulse" />
              ))}
            </div>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full text-sm">
                <thead>
                  <tr className="border-b border-custom-300">
                    {["Name", "Category", "Type", "Current Stock", "Alarm Level", "Status"].map((h) => (
                      <th key={h} className="text-left py-2 px-3 text-xs font-semibold text-custom-700 uppercase tracking-wide whitespace-nowrap">{h}</th>
                    ))}
                  </tr>
                </thead>
                <tbody>
                  {pagedItems.map((item) => {
                    const label = stockStatusLabel(item);
                    return (
                      <tr key={item.id} className="border-b border-custom-200 hover:bg-custom-50 transition-colors">
                        <td className="py-3 px-3 font-semibold text-secondary-100 whitespace-nowrap">{item.itemName}</td>
                        <td className="py-3 px-3 text-custom-700 whitespace-nowrap">{item.category}</td>
                        <td className="py-3 px-3 text-custom-700 whitespace-nowrap capitalize">{item.type}</td>
                        <td className="py-3 px-3 font-semibold text-secondary-100 whitespace-nowrap">
                          {item.currentStock} {item.unit}
                        </td>
                        <td className="py-3 px-3 text-custom-700 whitespace-nowrap">
                          {item.alarmStock} {item.unit}
                        </td>
                        <td className="py-3 px-3">
                          <span className={`text-xs font-semibold px-2 py-0.5 rounded-full whitespace-nowrap ${statusColor[label] ?? "bg-custom-100 text-custom-700"}`}>
                            {label}
                          </span>
                        </td>
                      </tr>
                    );
                  })}
                  {pagedItems.length === 0 && (
                    <tr>
                      <td colSpan={6} className="py-8 text-center text-custom-700 text-sm">
                        {allItems.length === 0 ? "No stock items found." : "No items match your filter."}
                      </td>
                    </tr>
                  )}
                </tbody>
              </table>
            </div>
          )}

          {/* Stock pagination */}
          {filtered.length > STOCK_PAGE_SIZE && (
            <div className="flex items-center justify-between mt-4 pt-4 border-t border-custom-200">
              <p className="text-xs text-custom-700">
                Page {stockPage} of {stockTotalPages} &nbsp;·&nbsp; {filtered.length} items
              </p>
              <div className="flex gap-2">
                <button
                  onClick={() => setStockPage((p) => Math.max(1, p - 1))}
                  disabled={stockPage === 1}
                  className="px-3 py-1 rounded-lg border border-custom-300 text-xs font-semibold text-custom-700 hover:bg-custom-100 disabled:opacity-40 disabled:cursor-not-allowed transition-colors"
                >
                  Prev
                </button>
                {Array.from({ length: stockTotalPages }, (_, i) => i + 1)
                  .filter((p) => p === 1 || p === stockTotalPages || Math.abs(p - stockPage) <= 1)
                  .reduce<(number | "…")[]>((acc, p, i, arr) => {
                    if (i > 0 && p - (arr[i - 1] as number) > 1) acc.push("…");
                    acc.push(p);
                    return acc;
                  }, [])
                  .map((p, i) =>
                    p === "…" ? (
                      <span key={`e${i}`} className="px-2 py-1 text-xs text-custom-700">…</span>
                    ) : (
                      <button
                        key={p}
                        onClick={() => setStockPage(p as number)}
                        className={`px-3 py-1 rounded-lg border text-xs font-semibold transition-colors ${
                          stockPage === p
                            ? "bg-primary-500 text-white border-primary-500"
                            : "border-custom-300 text-custom-700 hover:bg-custom-100"
                        }`}
                      >
                        {p}
                      </button>
                    )
                  )}
                <button
                  onClick={() => setStockPage((p) => Math.min(stockTotalPages, p + 1))}
                  disabled={stockPage === stockTotalPages}
                  className="px-3 py-1 rounded-lg border border-custom-300 text-xs font-semibold text-custom-700 hover:bg-custom-100 disabled:opacity-40 disabled:cursor-not-allowed transition-colors"
                >
                  Next
                </button>
              </div>
            </div>
          )}
        </Card>

        {/* Right column */}
        <div className="space-y-6">

          {/* Tabbed: Recent Usage + Pending Approvals */}
          <Card>
            {/* Tab headers */}
            <div className="flex border-b border-custom-200 mb-4 -mx-4 px-4" style={{marginTop: "-1px"}}>
              <button
                onClick={() => { setSideTab("usage"); setUsagePage(1); }}
                className={`pb-2 px-1 mr-5 text-sm font-semibold border-b-2 transition-colors ${
                  sideTab === "usage"
                    ? "border-primary-500 text-primary-500"
                    : "border-transparent text-custom-700 hover:text-secondary-100"
                }`}
              >
                Recent Usage
              </button>
              <button
                onClick={() => { setSideTab("pending"); setPendingPage(1); }}
                className={`pb-2 px-1 text-sm font-semibold border-b-2 transition-colors flex items-center gap-1.5 ${
                  sideTab === "pending"
                    ? "border-yellow-500 text-yellow-600"
                    : "border-transparent text-custom-700 hover:text-secondary-100"
                }`}
              >
                Pending Approvals
                {pendingSorties.length > 0 && (
                  <span className="text-xs bg-yellow-100 text-yellow-700 font-bold px-1.5 py-0.5 rounded-full">
                    {pendingSorties.length}
                  </span>
                )}
              </button>
            </div>

            {/* Recent Usage tab */}
            {sideTab === "usage" && (
              sortiesLoading ? (
                <div className="space-y-3">{Array.from({ length: 5 }).map((_, i) => <div key={i} className="h-14 bg-custom-100 rounded-xl animate-pulse" />)}</div>
              ) : allSorties.length === 0 ? (
                <p className="text-sm text-custom-700 text-center py-4">No usage records yet.</p>
              ) : (
                <>
                  <div className="space-y-3">
                    {pagedSorties.map((s) => (
                      <div key={s.id} className="p-3 rounded-xl bg-custom-50 border border-custom-200">
                        <div className="flex items-center justify-between mb-1">
                          <span className="text-xs font-semibold text-primary-500 capitalize">{s.status}</span>
                          <span className="text-xs text-custom-700">{timeAgo(s.createdAt)}</span>
                        </div>
                        <p className="text-sm text-secondary-100 font-semibold">{s.stockItem?.itemName ?? "—"}</p>
                        <p className="text-xs text-custom-700 mt-0.5">
                          Used: {s.quantityOut} {s.stockItem?.unit ?? ""}
                          {s.reason ? ` — ${s.reason}` : ""}
                        </p>
                      </div>
                    ))}
                  </div>
                  {usageTotalPages > 1 && (
                    <div className="flex items-center justify-between mt-4 pt-3 border-t border-custom-200">
                      <p className="text-xs text-custom-700">{usagePage} / {usageTotalPages}</p>
                      <div className="flex gap-2">
                        <button onClick={() => setUsagePage((p) => Math.max(1, p - 1))} disabled={usagePage === 1}
                          className="px-3 py-1 rounded-lg border border-custom-300 text-xs font-semibold text-custom-700 hover:bg-custom-100 disabled:opacity-40 disabled:cursor-not-allowed transition-colors">
                          Prev
                        </button>
                        <button onClick={() => setUsagePage((p) => Math.min(usageTotalPages, p + 1))} disabled={usagePage === usageTotalPages}
                          className="px-3 py-1 rounded-lg border border-custom-300 text-xs font-semibold text-custom-700 hover:bg-custom-100 disabled:opacity-40 disabled:cursor-not-allowed transition-colors">
                          Next
                        </button>
                      </div>
                    </div>
                  )}
                </>
              )
            )}

            {/* Pending Approvals tab */}
            {sideTab === "pending" && (
              sortiesLoading ? (
                <div className="space-y-3">{Array.from({ length: 3 }).map((_, i) => <div key={i} className="h-20 bg-custom-100 rounded-xl animate-pulse" />)}</div>
              ) : pendingSorties.length === 0 ? (
                <p className="text-sm text-custom-700 text-center py-4">No pending approvals.</p>
              ) : (
                <>
                  <div className="space-y-3">
                    {pagedPending.map((s) => (
                      <div key={s.id} className="p-3 rounded-xl bg-yellow-50 border border-yellow-200">
                        <p className="text-sm font-semibold text-secondary-100">{s.stockItem?.itemName ?? "—"}</p>
                        <p className="text-xs text-custom-700 mb-2">
                          Qty: {s.quantityOut} {s.stockItem?.unit ?? ""}
                          {s.reason ? ` — ${s.reason}` : ""}
                        </p>
                        <div className="flex gap-2">
                          <button onClick={() => approveSortie(s.id).then(() => refetchSorties())}
                            className="flex-1 py-1 rounded-lg bg-green-600 text-white text-xs font-semibold hover:bg-green-700 transition-colors">
                            Approve
                          </button>
                          <button onClick={() => rejectSortie(s.id).then(() => refetchSorties())}
                            className="flex-1 py-1 rounded-lg bg-red-500 text-white text-xs font-semibold hover:bg-red-600 transition-colors">
                            Reject
                          </button>
                        </div>
                      </div>
                    ))}
                  </div>
                  {pendingTotalPages > 1 && (
                    <div className="flex items-center justify-between mt-4 pt-3 border-t border-yellow-200">
                      <p className="text-xs text-yellow-800">{pendingPage} / {pendingTotalPages}</p>
                      <div className="flex gap-2">
                        <button onClick={() => setPendingPage((p) => Math.max(1, p - 1))} disabled={pendingPage === 1}
                          className="px-3 py-1 rounded-lg border border-yellow-300 text-xs font-semibold text-yellow-800 hover:bg-yellow-100 disabled:opacity-40 disabled:cursor-not-allowed transition-colors">
                          Prev
                        </button>
                        <button onClick={() => setPendingPage((p) => Math.min(pendingTotalPages, p + 1))} disabled={pendingPage === pendingTotalPages}
                          className="px-3 py-1 rounded-lg border border-yellow-300 text-xs font-semibold text-yellow-800 hover:bg-yellow-100 disabled:opacity-40 disabled:cursor-not-allowed transition-colors">
                          Next
                        </button>
                      </div>
                    </div>
                  )}
                </>
              )
            )}
          </Card>
        </div>
      </div>

      {/* Category Stats */}
      {categoryStats.length > 0 && (
        <Card>
          <div className="flex items-center gap-2 mb-5">
            <HiOutlineTrendingUp className="w-5 h-5 text-primary-500" />
            <h2 className="font-bold text-secondary-100">Stock by Category</h2>
          </div>
          <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-5 gap-4">
            {categoryStats.map((cat) => (
              <div key={cat.category} className="p-4 rounded-xl bg-custom-50 border border-custom-200">
                <h3 className="font-bold text-secondary-100 mb-1 truncate">{cat.category}</h3>
                <p className="text-xs text-custom-700 mb-3">{cat.items} item{cat.items !== 1 ? "s" : ""}</p>
                <div className="w-full bg-custom-200 rounded-full h-2">
                  <div
                    className={`h-2 rounded-full ${cat.pct >= 70 ? "bg-green-500" : cat.pct >= 40 ? "bg-yellow-500" : "bg-red-500"}`}
                    style={{ width: `${cat.pct}%` }}
                  />
                </div>
                <p className="text-xs text-custom-700 mt-2">~{cat.pct}% stocked</p>
              </div>
            ))}
          </div>
        </Card>
      )}

      {/* Recent Restocks (entries) */}
      {allEntries.length > 0 && (
        <Card>
          <div className="flex items-center gap-2 mb-4">
            <HiOutlineTrendingUp className="w-5 h-5 text-green-600" />
            <h2 className="font-bold text-secondary-100">Recent Restocks</h2>
          </div>
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead>
                <tr className="border-b border-custom-300">
                  {["Item", "Quantity Added", "Note", "Date"].map((h) => (
                    <th key={h} className="text-left py-2 px-3 text-xs font-semibold text-custom-700 uppercase tracking-wide whitespace-nowrap">{h}</th>
                  ))}
                </tr>
              </thead>
              <tbody>
                {allEntries.slice(0, 10).map((entry) => (
                  <tr key={entry.id} className="border-b border-custom-200 hover:bg-custom-50 transition-colors">
                    <td className="py-3 px-3 font-semibold text-secondary-100">{entry.stockItem?.itemName ?? "—"}</td>
                    <td className="py-3 px-3 text-green-600 font-semibold">+{entry.quantity} {entry.stockItem?.unit ?? ""}</td>
                    <td className="py-3 px-3 text-custom-700">{entry.note ?? "—"}</td>
                    <td className="py-3 px-3 text-custom-700 whitespace-nowrap">{timeAgo(entry.createdAt)}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </Card>
      )}


      {/* ── Add New Stock Item Modal ── */}
      {showAddModal && (
        <div className="fixed inset-0 bg-secondary-100/50 z-50 flex items-start justify-center p-4 overflow-y-auto">
          <Card className="!p-6 max-w-2xl w-full my-8">
            <div className="flex items-center justify-between mb-6">
              <h3 className="text-xl font-bold text-secondary-100">Add New Stock Item</h3>
              <button onClick={() => setShowAddModal(false)} className="text-custom-700 hover:text-secondary-100">
                <HiOutlineX className="w-6 h-6" />
              </button>
            </div>
            <form onSubmit={handleAddItem} className="space-y-4">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-semibold text-secondary-100 mb-1">Item Name *</label>
                  <Input name="itemName" type="text" placeholder="e.g., A4 Paper (80gsm)" value={addForm.itemName}
                    onChange={(e) => setAddForm({ ...addForm, itemName: e.target.value })} required fullWidth />
                </div>
                <div>
                  <label className="block text-sm font-semibold text-secondary-100 mb-1">Category *</label>
                  <Input name="category" type="text" placeholder="e.g., Paper, Ink, Binding" value={addForm.category}
                    onChange={(e) => setAddForm({ ...addForm, category: e.target.value })} required fullWidth />
                </div>
                <div>
                  <label className="block text-sm font-semibold text-secondary-100 mb-1">Type *</label>
                  <select value={addForm.type} onChange={(e) => setAddForm({ ...addForm, type: e.target.value as any })}
                    className="w-full px-4 py-2.5 rounded-xl border border-custom-300 bg-style-500 text-secondary-100 focus:outline-none focus:border-primary-400 focus:ring-2 focus:ring-primary-200 transition-colors font-[family-name:var(--font-family-primary)]">
                    <option value="general">General</option>
                    <option value="boutique">Boutique</option>
                    <option value="hobe">Hobe</option>
                  </select>
                </div>
                <div>
                  <label className="block text-sm font-semibold text-secondary-100 mb-1">Unit *</label>
                  <Input name="unit" type="text" placeholder="e.g., reams, units, rolls" value={addForm.unit}
                    onChange={(e) => setAddForm({ ...addForm, unit: e.target.value })} required fullWidth />
                </div>
                <div>
                  <label className="block text-sm font-semibold text-secondary-100 mb-1">Current Stock *</label>
                  <Input name="currentStock" type="number" placeholder="Initial quantity" value={addForm.currentStock}
                    onChange={(e) => setAddForm({ ...addForm, currentStock: e.target.value })} required fullWidth />
                </div>
                <div>
                  <label className="block text-sm font-semibold text-secondary-100 mb-1">Alarm Level *</label>
                  <Input name="alarmStock" type="number" placeholder="Alert threshold" value={addForm.alarmStock}
                    onChange={(e) => setAddForm({ ...addForm, alarmStock: e.target.value })} required fullWidth />
                </div>
                <div className="md:col-span-2">
                  <label className="block text-sm font-semibold text-secondary-100 mb-1">Description</label>
                  <textarea value={addForm.description} onChange={(e) => setAddForm({ ...addForm, description: e.target.value })}
                    rows={2} placeholder="Optional description..."
                    className="w-full px-4 py-2.5 rounded-xl border border-custom-300 bg-style-500 text-secondary-100 focus:outline-none focus:border-primary-400 focus:ring-2 focus:ring-primary-200 transition-colors font-[family-name:var(--font-family-primary)] resize-none" />
                </div>
              </div>
              <div className="flex gap-3 justify-end pt-4 border-t border-custom-300">
                <Button type="button" variant="outline" onClick={() => setShowAddModal(false)}>Cancel</Button>
                <Button type="submit" disabled={creating}>{creating ? "Adding..." : "Add Item"}</Button>
              </div>
            </form>
          </Card>
        </div>
      )}

      {/* ── Restock Modal ── */}
      {showRestockModal && (
        <div className="fixed inset-0 bg-secondary-100/50 z-50 flex items-start justify-center p-4 overflow-y-auto">
          <Card className="!p-6 max-w-lg w-full my-8">
            <div className="flex items-center justify-between mb-6">
              <h3 className="text-xl font-bold text-secondary-100">Restock Item</h3>
              <button onClick={() => setShowRestockModal(false)} className="text-custom-700 hover:text-secondary-100">
                <HiOutlineX className="w-6 h-6" />
              </button>
            </div>
            <form onSubmit={handleRestock} className="space-y-4">
              <div>
                <label className="block text-sm font-semibold text-secondary-100 mb-1">Stock Item *</label>
                <select value={restockForm.stockItemId} onChange={(e) => setRestockForm({ ...restockForm, stockItemId: e.target.value })} required
                  className="w-full px-4 py-2.5 rounded-xl border border-custom-300 bg-style-500 text-secondary-100 focus:outline-none focus:border-primary-400 focus:ring-2 focus:ring-primary-200 transition-colors font-[family-name:var(--font-family-primary)]">
                  <option value="">Select item</option>
                  {allItems.map((item) => (
                    <option key={item.id} value={item.id}>
                      {item.itemName} — {item.currentStock} {item.unit} in stock
                    </option>
                  ))}
                </select>
              </div>
              <div>
                <label className="block text-sm font-semibold text-secondary-100 mb-1">Quantity to Add *</label>
                <Input name="quantity" type="number" placeholder="Enter quantity" value={restockForm.quantity}
                  onChange={(e) => setRestockForm({ ...restockForm, quantity: e.target.value })} required fullWidth />
              </div>
              <div>
                <label className="block text-sm font-semibold text-secondary-100 mb-1">Note</label>
                <Input name="note" type="text" placeholder="e.g., Supplier delivery" value={restockForm.note}
                  onChange={(e) => setRestockForm({ ...restockForm, note: e.target.value })} fullWidth />
              </div>
              <div className="flex gap-3 justify-end pt-4 border-t border-custom-300">
                <Button type="button" variant="outline" onClick={() => setShowRestockModal(false)}>Cancel</Button>
                <Button type="submit" disabled={restocking} className="bg-green-600 hover:bg-green-700">
                  {restocking ? "Restocking..." : "Confirm Restock"}
                </Button>
              </div>
            </form>
          </Card>
        </div>
      )}

      {/* ── Record Usage (Sortie) Modal ── */}
      {showSortieModal && (
        <div className="fixed inset-0 bg-secondary-100/50 z-50 flex items-start justify-center p-4 overflow-y-auto">
          <Card className="!p-6 max-w-lg w-full my-8">
            <div className="flex items-center justify-between mb-6">
              <h3 className="text-xl font-bold text-secondary-100">Record Stock Usage</h3>
              <button onClick={() => setShowSortieModal(false)} className="text-custom-700 hover:text-secondary-100">
                <HiOutlineX className="w-6 h-6" />
              </button>
            </div>
            <form onSubmit={handleSortie} className="space-y-4">
              <div>
                <label className="block text-sm font-semibold text-secondary-100 mb-1">Stock Item *</label>
                <select value={sortieForm.stockItemId} onChange={(e) => setSortieForm({ ...sortieForm, stockItemId: e.target.value })} required
                  className="w-full px-4 py-2.5 rounded-xl border border-custom-300 bg-style-500 text-secondary-100 focus:outline-none focus:border-primary-400 focus:ring-2 focus:ring-primary-200 transition-colors font-[family-name:var(--font-family-primary)]">
                  <option value="">Select item</option>
                  {allItems.map((item) => (
                    <option key={item.id} value={item.id}>
                      {item.itemName} — {item.currentStock} {item.unit} available
                    </option>
                  ))}
                </select>
              </div>
              <div>
                <label className="block text-sm font-semibold text-secondary-100 mb-1">Quantity Used *</label>
                <Input name="quantityOut" type="number" placeholder="Enter quantity" value={sortieForm.quantityOut}
                  onChange={(e) => setSortieForm({ ...sortieForm, quantityOut: e.target.value })} required fullWidth />
              </div>
              <div>
                <label className="block text-sm font-semibold text-secondary-100 mb-1">Reason *</label>
                <Input name="reason" type="text" placeholder="e.g., Used for job JOB-045" value={sortieForm.reason}
                  onChange={(e) => setSortieForm({ ...sortieForm, reason: e.target.value })} required fullWidth />
              </div>
              <div>
                <label className="block text-sm font-semibold text-secondary-100 mb-1">Notes</label>
                <textarea value={sortieForm.notes} onChange={(e) => setSortieForm({ ...sortieForm, notes: e.target.value })}
                  rows={2} placeholder="Additional notes..."
                  className="w-full px-4 py-2.5 rounded-xl border border-custom-300 bg-style-500 text-secondary-100 focus:outline-none focus:border-primary-400 focus:ring-2 focus:ring-primary-200 transition-colors font-[family-name:var(--font-family-primary)] resize-none" />
              </div>
              <div className="flex gap-3 justify-end pt-4 border-t border-custom-300">
                <Button type="button" variant="outline" onClick={() => setShowSortieModal(false)}>Cancel</Button>
                <Button type="submit" disabled={sortieSubmitting} className="bg-orange-600 hover:bg-orange-700">
                  {sortieSubmitting ? "Submitting..." : "Record Usage"}
                </Button>
              </div>
            </form>
          </Card>
        </div>
      )}

    </div>
  );
}
