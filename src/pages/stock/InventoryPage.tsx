import { useState } from "react";
import {
  HiOutlineArchive,
  HiOutlineCheckCircle,
  HiOutlineExclamationCircle,
  HiOutlinePencil,
  HiOutlinePlus,
  HiOutlineRefresh,
  HiOutlineSearch,
  HiOutlineTrash,
  HiOutlineTrendingDown,
  HiOutlineX,
} from "react-icons/hi";
import { toast } from "react-toastify";
import { DashboardLayout } from "../../components";
import { Card } from "../../components/ui";
import {
  useGetStockItemsQuery,
  useCreateStockItemMutation,
  useUpdateStockItemMutation,
  useDeleteStockItemMutation,
  type StockItem,
  type StockItemType,
} from "../../store/services/stockService";

// ─── Config ───────────────────────────────────────────────────────────────────

const TYPE_OPTIONS: { value: StockItemType; label: string; color: string }[] = [
  { value: "general",  label: "General",  color: "bg-gray-100 text-gray-600" },
  { value: "boutique", label: "Boutique", color: "bg-pink-100 text-pink-700" },
  { value: "hobe",     label: "Hobe",     color: "bg-lime-100 text-lime-700" },
];

const STATUS_COLOR: Record<string, string> = {
  available:    "bg-emerald-100 text-emerald-700",
  low:          "bg-yellow-100 text-yellow-700",
  "out-of-stock": "bg-red-100 text-red-600",
};

const STATUS_LABEL: Record<string, string> = {
  available:    "Available",
  low:          "Low Stock",
  "out-of-stock": "Out of Stock",
};

// ─── Add / Edit Modal ─────────────────────────────────────────────────────────

function ItemModal({ item, onClose }: {
  item: StockItem | null;   // null = add mode
  onClose: () => void;
}) {
  const isEdit = !!item;
  const [form, setForm] = useState(
    item
      ? {
          name: item.itemName,
          description: item.description ?? "",
          category: item.category,
          type: item.type,
          unit: item.unit,
          currentStock: String(item.currentStock),
          alarmStock: String(item.alarmStock ?? item.minStock),
        }
      : {
          name: "",
          description: "",
          category: "",
          type: "general" as StockItemType,
          unit: "units",
          currentStock: "",
          alarmStock: "",
        }
  );

  const [createItem, { isLoading: creating }] = useCreateStockItemMutation();
  const [updateItem, { isLoading: updating }] = useUpdateStockItemMutation();
  const isLoading = creating || updating;

  const set = (key: string) =>
    (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement>) =>
      setForm((prev) => ({ ...prev, [key]: e.target.value }));

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!form.name.trim() || !form.category.trim() || !form.unit.trim()) {
      toast.error("Name, category, and unit are required"); return;
    }
    try {
      if (isEdit) {
        await updateItem({
          id: item!.id,
          itemName: form.name.trim(),
          description: form.description.trim() || undefined,
          category: form.category.trim(),
          type: form.type,
          unit: form.unit.trim(),
          alarmStock: Number(form.alarmStock),
        }).unwrap();
        toast.success("Item updated");
      } else {
        await createItem({
          itemName: form.name.trim(),
          description: form.description.trim() || undefined,
          category: form.category.trim(),
          type: form.type,
          unit: form.unit.trim(),
          currentStock: Number(form.currentStock),
          alarmStock: Number(form.alarmStock),
        }).unwrap();
        toast.success("Item added to stock");
      }
      onClose();
    } catch (err: any) {
      toast.error(err?.data?.message ?? "Failed to save item");
    }
  };

  const inputCls = "w-full px-3 py-2 rounded-xl border border-custom-300 bg-style-500 text-secondary-100 text-sm focus:outline-none focus:border-primary-400 transition-colors";

  return (
    <div className="fixed inset-0 bg-secondary-100/50 z-50 flex items-start justify-center p-4 overflow-y-auto">
      <Card className="!p-6 max-w-lg w-full my-8">
        <div className="flex items-center justify-between mb-5">
          <h3 className="text-xl font-bold text-secondary-100">
            {isEdit ? "Edit Stock Item" : "Add New Stock Item"}
          </h3>
          <button onClick={onClose} className="text-custom-700 hover:text-secondary-100">
            <HiOutlineX className="w-6 h-6" />
          </button>
        </div>

        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="grid grid-cols-2 gap-3">
            {/* Name */}
            <div className="col-span-2">
              <label className="block text-xs font-semibold text-secondary-100 mb-1">Name *</label>
              <input value={form.name} onChange={set("name")} placeholder="e.g. A4 Paper Ream" className={inputCls} />
            </div>

            {/* Description */}
            <div className="col-span-2">
              <label className="block text-xs font-semibold text-secondary-100 mb-1">
                Description <span className="font-normal text-custom-700">(optional)</span>
              </label>
              <textarea value={form.description} onChange={set("description")} rows={2}
                placeholder="Optional description..."
                className="w-full px-3 py-2 rounded-xl border border-custom-300 bg-style-500 text-secondary-100 text-sm focus:outline-none focus:border-primary-400 transition-colors resize-none"
              />
            </div>

            {/* Category */}
            <div>
              <label className="block text-xs font-semibold text-secondary-100 mb-1">Category *</label>
              <input value={form.category} onChange={set("category")} placeholder="e.g. Paper" className={inputCls} />
            </div>

            {/* Type */}
            <div>
              <label className="block text-xs font-semibold text-secondary-100 mb-1">Type *</label>
              <select value={form.type} onChange={set("type")} className={inputCls}>
                {TYPE_OPTIONS.map((t) => (
                  <option key={t.value} value={t.value}>{t.label}</option>
                ))}
              </select>
            </div>

            {/* Unit */}
            <div>
              <label className="block text-xs font-semibold text-secondary-100 mb-1">Unit *</label>
              <input value={form.unit} onChange={set("unit")} placeholder="e.g. reams, units, kg" className={inputCls} />
            </div>

            {/* Min Stock */}
            <div>
              <label className="block text-xs font-semibold text-secondary-100 mb-1">Alarm Stock *</label>
              <input type="number" min={0} value={form.alarmStock} onChange={set("alarmStock")} placeholder="0" className={inputCls} />
            </div>

            {/* Initial stock — only on create */}
            {!isEdit && (
              <div>
                <label className="block text-xs font-semibold text-secondary-100 mb-1">Initial Stock *</label>
                <input type="number" min={0} value={form.currentStock} onChange={set("currentStock")} placeholder="0" className={inputCls} />
              </div>
            )}
          </div>

          {/* Type hint */}
          <div className={`px-3 py-2 rounded-xl text-xs font-semibold ${TYPE_OPTIONS.find((t) => t.value === form.type)?.color ?? "bg-gray-100 text-gray-600"}`}>
            {form.type === "hobe"     && "This item will only be visible to the Hobe manager for stock requests."}
            {form.type === "boutique" && "This item will be used for Boutique stock management."}
            {form.type === "general"  && "General purpose item — visible to production and other departments."}
          </div>

          <div className="flex gap-3 justify-end pt-2 border-t border-custom-300">
            <button type="button" onClick={onClose}
              className="px-4 py-2 rounded-xl border border-custom-300 text-sm font-semibold text-secondary-100 hover:bg-custom-100 transition-colors"
            >Cancel</button>
            <button type="submit" disabled={isLoading}
              className="px-4 py-2 rounded-xl bg-primary-500 text-white text-sm font-semibold hover:bg-primary-600 disabled:opacity-40 transition-colors"
            >{isLoading ? "Saving..." : isEdit ? "Save Changes" : "Add Item"}</button>
          </div>
        </form>
      </Card>
    </div>
  );
}

// ─── Main Page ────────────────────────────────────────────────────────────────

const PAGE_SIZE = 7;

type TypeFilter = "all" | StockItemType;

export default function InventoryPage() {
  const [search, setSearch]             = useState("");
  const [typeFilter, setTypeFilter]     = useState<TypeFilter>("all");
  const [statusFilter, setStatusFilter] = useState("all");
  const [page, setPage]                 = useState(1);
  const [showModal, setShowModal]       = useState(false);
  const [editItem, setEditItem]         = useState<StockItem | null>(null);

  const { data, isLoading, isError, refetch } = useGetStockItemsQuery({
    search: search.trim() || undefined,
    type: typeFilter !== "all" ? typeFilter : undefined,
    stockStatus: statusFilter !== "all" ? statusFilter : undefined,
    limit: 200,
  });

  const [deleteItem] = useDeleteStockItemMutation();

  const items = data?.data ?? [];

  // ── Stats ──────────────────────────────────────────────────────────────────
  const totalItems    = items.length;
  const lowCount      = items.filter((i) => i.stockStatus === "low").length;
  const outCount      = items.filter((i) => i.stockStatus === "out-of-stock").length;
  const okCount       = items.filter((i) => i.stockStatus === "available").length;
  const hobeCount     = items.filter((i) => i.type === "hobe").length;
  const boutiqueCount = items.filter((i) => i.type === "boutique").length;

  // ── Pagination ─────────────────────────────────────────────────────────────
  const totalPages = Math.max(1, Math.ceil(items.length / PAGE_SIZE));
  const paginated  = items.slice((page - 1) * PAGE_SIZE, page * PAGE_SIZE);

  // Reset to page 1 whenever filters change
  const handleSearch      = (v: string) => { setSearch(v);      setPage(1); };
  const handleTypeFilter  = (v: TypeFilter) => { setTypeFilter(v);  setPage(1); };
  const handleStatusFilter = (v: string) => { setStatusFilter(v); setPage(1); };

  const handleDelete = async (item: StockItem) => {
    if (!confirm(`Delete "${item.itemName}"? This cannot be undone.`)) return;
    try {
      await deleteItem(item.id).unwrap();
      toast.success("Item deleted");
    } catch (err: any) {
      toast.error(err?.data?.message ?? "Failed to delete item");
    }
  };

  return (
    <DashboardLayout userRole="stock" userName="Stock Manager" notificationCount={lowCount + outCount}>
      <div className="space-y-6 font-[family-name:var(--font-family-primary)]">

        {/* ── Header ──────────────────────────────────────────────────────── */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
          <div>
            <h1 className="text-2xl md:text-3xl font-bold text-secondary-100">Inventory Management</h1>
            <p className="text-sm text-custom-700 mt-1">
              Manage all stock items — general, boutique, and hobe
            </p>
          </div>
          <div className="flex items-center gap-2">
            <button onClick={() => refetch()}
              className="p-2 rounded-xl border border-custom-300 hover:bg-custom-100 transition-colors text-custom-700"
              title="Refresh"
            >
              <HiOutlineRefresh className={`w-4 h-4 ${isLoading ? "animate-spin" : ""}`} />
            </button>
            <button
              onClick={() => { setEditItem(null); setShowModal(true); }}
              className="flex items-center gap-2 px-4 py-2 rounded-xl bg-primary-500 text-white text-sm font-semibold hover:bg-primary-600 transition-colors"
            >
              <HiOutlinePlus className="w-4 h-4" />
              Add Item
            </button>
          </div>
        </div>

        {/* ── KPI Cards ───────────────────────────────────────────────────── */}
        <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-3">
          {[
            { label: "Total Items",   value: totalItems,    color: "text-secondary-100", icon: HiOutlineArchive,          bg: "bg-primary-100",  iconColor: "text-primary-600" },
            { label: "Available",     value: okCount,       color: "text-emerald-600",   icon: HiOutlineCheckCircle,      bg: "bg-emerald-100",  iconColor: "text-emerald-600" },
            { label: "Low Stock",     value: lowCount,      color: "text-yellow-600",    icon: HiOutlineExclamationCircle,bg: "bg-yellow-100",   iconColor: "text-yellow-600" },
            { label: "Out of Stock",  value: outCount,      color: "text-red-600",       icon: HiOutlineTrendingDown,     bg: "bg-red-100",      iconColor: "text-red-600" },
            { label: "Hobe Items",    value: hobeCount,     color: "text-lime-600",      icon: HiOutlineArchive,          bg: "bg-lime-100",     iconColor: "text-lime-600" },
            { label: "Boutique Items",value: boutiqueCount, color: "text-pink-600",      icon: HiOutlineArchive,          bg: "bg-pink-100",     iconColor: "text-pink-600" },
          ].map(({ label, value, color, icon: Icon, bg, iconColor }) => (
            <Card key={label} className="!p-4">
              <div className={`w-8 h-8 rounded-lg ${bg} flex items-center justify-center mb-2`}>
                <Icon className={`w-4 h-4 ${iconColor}`} />
              </div>
              <p className={`text-2xl font-bold ${color}`}>{isLoading ? "—" : value}</p>
              <p className="text-xs text-custom-700 mt-0.5">{label}</p>
            </Card>
          ))}
        </div>

        {/* ── Filters ─────────────────────────────────────────────────────── */}
        <div className="flex flex-col sm:flex-row gap-3">
          <div className="flex-1 relative">
            <HiOutlineSearch className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-custom-700" />
            <input
              type="text" value={search}
              onChange={(e) => handleSearch(e.target.value)}
              placeholder="Search by name or category..."
              className="w-full pl-9 pr-4 py-2 rounded-xl border border-custom-300 bg-style-500 text-secondary-100 placeholder:text-custom-700 text-sm focus:outline-none focus:border-primary-400 transition-colors"
            />
          </div>
          {/* Type filter pills */}
          <div className="flex gap-1 bg-custom-100 p-1 rounded-xl">
            {([
              { value: "all",      label: "All Types" },
              { value: "general",  label: "General" },
              { value: "hobe",     label: "Hobe" },
              { value: "boutique", label: "Boutique" },
            ] as { value: TypeFilter; label: string }[]).map((opt) => (
              <button key={opt.value} onClick={() => handleTypeFilter(opt.value)}
                className={`px-3 py-1.5 rounded-lg text-xs font-semibold transition-colors ${
                  typeFilter === opt.value ? "bg-primary-500 text-white shadow-sm" : "text-custom-700 hover:text-secondary-100"
                }`}
              >{opt.label}</button>
            ))}
          </div>
          {/* Status filter */}
          <select
            value={statusFilter}
            onChange={(e) => handleStatusFilter(e.target.value)}
            className="px-3 py-2 rounded-xl border border-custom-300 bg-style-500 text-secondary-100 text-sm focus:outline-none focus:border-primary-400 transition-colors"
          >
            <option value="all">All Status</option>
            <option value="available">Available</option>
            <option value="low">Low Stock</option>
            <option value="out-of-stock">Out of Stock</option>
          </select>
        </div>

        {/* ── Table ───────────────────────────────────────────────────────── */}
        <Card className="!p-0 overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead className="bg-custom-100 border-b border-custom-300">
                <tr>
                  {["Name", "Category", "Type", "Stock", "Alarm", "Status", "Unit", "Added"].map((h) => (
                    <th key={h} className="px-3 py-2.5 text-left text-xs font-bold text-secondary-100 uppercase">{h}</th>
                  ))}
                  <th className="px-3 py-2.5 text-right text-xs font-bold text-secondary-100 uppercase">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-custom-200">
                {isLoading ? (
                  <tr><td colSpan={9} className="px-4 py-10 text-center text-custom-700 text-sm">Loading...</td></tr>
                ) : isError ? (
                  <tr>
                    <td colSpan={9} className="px-4 py-10 text-center">
                      <p className="text-secondary-100 font-semibold mb-2">Failed to load inventory</p>
                      <button onClick={() => refetch()} className="text-xs text-primary-500 hover:underline">Retry</button>
                    </td>
                  </tr>
                ) : items.length === 0 ? (
                  <tr>
                    <td colSpan={9} className="px-4 py-10 text-center">
                      <HiOutlineArchive className="w-8 h-8 text-custom-400 mx-auto mb-2" />
                      <p className="text-sm text-custom-700">No items found</p>
                    </td>
                  </tr>
                ) : paginated.map((item) => {
                  const typeOpt = TYPE_OPTIONS.find((t) => t.value === item.type);
                  const fillPct = item.minStock > 0
                    ? Math.min(100, Math.round((item.currentStock / (item.minStock * 3)) * 100))
                    : item.currentStock > 0 ? 100 : 0;
                  return (
                    <tr key={item.id} className="hover:bg-custom-50 transition-colors">
                      <td className="px-3 py-2.5">
                        <p className="text-sm font-semibold text-secondary-100">{item.itemName}</p>
                        {item.description && <p className="text-xs text-custom-700 truncate max-w-[160px]">{item.description}</p>}
                      </td>
                      <td className="px-3 py-2.5 text-sm text-custom-700">{item.category}</td>
                      <td className="px-3 py-2.5">
                        <span className={`text-xs font-bold px-2.5 py-1 rounded-full ${typeOpt?.color ?? "bg-gray-100 text-gray-600"}`}>
                          {typeOpt?.label ?? item.type}
                        </span>
                      </td>
                      <td className="px-3 py-2.5">
                        <p className={`text-sm font-bold ${
                          item.stockStatus === "out-of-stock" ? "text-red-600"
                          : item.stockStatus === "low" ? "text-yellow-600"
                          : "text-emerald-600"
                        }`}>{item.currentStock.toLocaleString()}</p>
                        <div className="w-16 h-1 bg-custom-200 rounded-full mt-1">
                          <div className={`h-1 rounded-full ${
                            item.stockStatus === "out-of-stock" ? "bg-red-400"
                            : item.stockStatus === "low" ? "bg-yellow-400"
                            : "bg-emerald-400"
                          }`} style={{ width: `${fillPct}%` }} />
                        </div>
                      </td>
                      <td className="px-3 py-2.5 text-sm text-custom-700">{item.alarmStock ?? item.minStock}</td>
                      <td className="px-3 py-2.5">
                        <span className={`text-xs font-bold px-2 py-0.5 rounded-full ${STATUS_COLOR[item.stockStatus] ?? "bg-gray-100 text-gray-600"}`}>
                          {STATUS_LABEL[item.stockStatus] ?? item.stockStatus}
                        </span>
                      </td>
                      <td className="px-3 py-2.5 text-sm text-custom-700">{item.unit}</td>
                      <td className="px-3 py-2.5 text-xs text-custom-700">
                        {new Date(item.createdAt).toLocaleDateString("en-RW", { day: "2-digit", month: "short", year: "numeric" })}
                      </td>
                      <td className="px-3 py-2.5">
                        <div className="flex items-center justify-end gap-1">
                          <button
                            onClick={() => { setEditItem(item); setShowModal(true); }}
                            className="p-1.5 rounded-lg hover:bg-primary-100 transition-colors"
                            title="Edit"
                          >
                            <HiOutlinePencil className="w-4 h-4 text-primary-500" />
                          </button>
                          <button
                            onClick={() => handleDelete(item)}
                            className="p-1.5 rounded-lg hover:bg-red-100 transition-colors"
                            title="Delete"
                          >
                            <HiOutlineTrash className="w-4 h-4 text-red-500" />
                          </button>
                        </div>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        </Card>

        {/* ── Pagination ──────────────────────────────────────────────────── */}
        {items.length > PAGE_SIZE && (
          <div className="flex items-center justify-between">
            <p className="text-xs text-custom-700">
              Showing {(page - 1) * PAGE_SIZE + 1}–{Math.min(page * PAGE_SIZE, items.length)} of {items.length} items
            </p>
            <div className="flex items-center gap-1">
              <button
                onClick={() => setPage((p) => Math.max(1, p - 1))}
                disabled={page === 1}
                className="px-3 py-1.5 rounded-lg border border-custom-300 text-xs font-semibold text-secondary-100 hover:bg-custom-100 disabled:opacity-40 transition-colors"
              >Prev</button>
              {Array.from({ length: totalPages }, (_, i) => i + 1).map((n) => (
                <button
                  key={n}
                  onClick={() => setPage(n)}
                  className={`w-8 h-8 rounded-lg text-xs font-bold transition-colors ${
                    n === page
                      ? "bg-primary-500 text-white"
                      : "border border-custom-300 text-secondary-100 hover:bg-custom-100"
                  }`}
                >{n}</button>
              ))}
              <button
                onClick={() => setPage((p) => Math.min(totalPages, p + 1))}
                disabled={page === totalPages}
                className="px-3 py-1.5 rounded-lg border border-custom-300 text-xs font-semibold text-secondary-100 hover:bg-custom-100 disabled:opacity-40 transition-colors"
              >Next</button>
            </div>
          </div>
        )}
      </div>

      {showModal && (
        <ItemModal
          item={editItem}
          onClose={() => { setShowModal(false); setEditItem(null); }}
        />
      )}
    </DashboardLayout>
  );
}
