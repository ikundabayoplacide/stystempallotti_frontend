import { useState } from "react";
import {
  HiOutlineArchive,
  HiOutlinePlus,
  HiOutlineTrash,
  HiOutlinePencil,
  HiOutlineRefresh,
  HiOutlineX,
  HiOutlineCheckCircle,
  HiOutlineExclamationCircle,
  HiOutlineCheck,
  HiOutlineClipboardList,
} from "react-icons/hi";
import { toast } from "react-toastify";
import { DashboardLayout } from "../../components";
import { Card } from "../../components/ui";
import {
  useGetBoutiqueStockItemsQuery,
  useCreateBoutiqueStockItemMutation,
  useUpdateBoutiqueStockItemMutation,
  useDeleteBoutiqueStockItemMutation,
  useCreateBoutiqueStockEntryMutation,
  useGetBoutiqueStockSortiesQuery,
  useTakeBoutiqueStockSortieMutation,
  type BoutiqueStockItem,
  type BoutiqueStockSortie,
  type SortieStatus,
} from "../../store/services/boutiqueStockService";

// ─── Helpers ──────────────────────────────────────────────────────────────────

const statusColors: Record<string, string> = {
  available:    "bg-emerald-100 text-emerald-700",
  low:          "bg-yellow-100 text-yellow-700",
  "out-of-stock": "bg-red-100 text-red-700",
};

function getStockStatus(currentStock: number, alarmStock: number): string {
  if (currentStock <= 0) return "out-of-stock";
  if (currentStock > alarmStock) return "low";
  return "available";
}

const cls = "w-full px-3 py-2 rounded-xl border border-custom-300 bg-style-500 text-secondary-100 text-sm focus:outline-none focus:border-primary-400 transition-colors";

// ─── Item Form Modal ──────────────────────────────────────────────────────────

interface ItemFormProps {
  item?: BoutiqueStockItem;
  onClose: () => void;
  onSuccess: () => void;
}

function ItemFormModal({ item, onClose, onSuccess }: ItemFormProps) {
  const isEdit = !!item;
  const [createItem, { isLoading: creating }] = useCreateBoutiqueStockItemMutation();
  const [updateItem, { isLoading: updating }]  = useUpdateBoutiqueStockItemMutation();

  const [form, setForm] = useState({
    itemName:     item?.itemName     ?? "",
    description:  item?.description  ?? "",
    category:     item?.category     ?? "",
    unit:         item?.unit         ?? "",
    currentStock: item?.currentStock?.toString() ?? "",
    alarmStock:   item?.alarmStock   ?? 0,
    unitCost:     item?.unitCost?.toString() ?? "",
  });

  const set = (k: keyof typeof form) => (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) =>
    setForm((p) => ({ ...p, [k]: k === "alarmStock" ? Number(e.target.value) : e.target.value }));

  const totalValue = Number(form.unitCost || 0) * Number(form.currentStock || 0);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!form.itemName.trim() || !form.category.trim()) {
      toast.error("Item name and category are required"); return;
    }
    if (!isEdit && !String(form.currentStock).trim()) {
      toast.error("Initial stock is required"); return;
    }
    try {
      if (isEdit) {
        await updateItem({ id: item!.id, ...form, unitCost: form.unitCost !== "" ? Number(form.unitCost) : undefined }).unwrap();
        toast.success("Item updated");
      } else {
        await createItem({ ...form, currentStock: Number(form.currentStock), unitCost: form.unitCost !== "" ? Number(form.unitCost) : undefined }).unwrap();
        toast.success("Item created");
      }
      onSuccess();
    } catch (err: any) {
      toast.error(err?.data?.message ?? "Failed to save item");
    }
  };

  return (
    <div className="fixed inset-0 bg-secondary-100/50 z-50 flex items-start justify-center p-4 overflow-y-auto">
      <Card className="!p-6 max-w-lg w-full my-8">
        <div className="flex items-center justify-between mb-5">
          <h3 className="text-xl font-bold text-secondary-100">{isEdit ? "Edit Item" : "Add Boutique Stock Item"}</h3>
          <button onClick={onClose} className="text-custom-700 hover:text-secondary-100"><HiOutlineX className="w-6 h-6" /></button>
        </div>
        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className="block text-xs font-semibold text-secondary-100 mb-1">Item Name *</label>
              <input value={form.itemName} onChange={set("itemName")} placeholder="e.g. Gift Bags" className={cls} />
            </div>
            <div>
              <label className="block text-xs font-semibold text-secondary-100 mb-1">Category *</label>
              <input value={form.category} onChange={set("category")} placeholder="e.g. Packaging" className={cls} />
            </div>
            <div>
              <label className="block text-xs font-semibold text-secondary-100 mb-1">Unit</label>
              <input value={form.unit} onChange={set("unit")} placeholder="e.g. pcs, kg, box" className={cls} />
            </div>
            <div>
              <label className="block text-xs font-semibold text-secondary-100 mb-1">Unit Cost (RWF)</label>
              <input type="number" min={0} step="0.01" value={form.unitCost} onChange={set("unitCost")} placeholder="e.g. 500" className={cls} />
            </div>
            <div>
              <label className="block text-xs font-semibold text-secondary-100 mb-1">Alarm Stock Level</label>
              <input type="number" min={0} value={form.alarmStock} onChange={set("alarmStock")} className={cls} />
            </div>
            {!isEdit && (
              <div>
                <label className="block text-xs font-semibold text-secondary-100 mb-1">Initial Stock *</label>
                <input type="text" value={form.currentStock} onChange={set("currentStock")} placeholder="e.g. 100" required className={cls} />
              </div>
            )}
          </div>
          {form.unitCost && form.currentStock && (
            <div className="flex items-center justify-between px-4 py-2.5 rounded-xl bg-primary-50 border border-primary-200">
              <span className="text-xs font-semibold text-primary-700">Total Stock Value</span>
              <span className="text-sm font-bold text-primary-600">{totalValue.toLocaleString()} RWF</span>
            </div>
          )}
          <div>
            <label className="block text-xs font-semibold text-secondary-100 mb-1">Description</label>
            <textarea value={form.description} onChange={set("description")} rows={2} placeholder="Optional description..."
              className="w-full px-3 py-2 rounded-xl border border-custom-300 bg-style-500 text-secondary-100 text-sm focus:outline-none focus:border-primary-400 transition-colors resize-none"
            />
          </div>
          <div className="flex gap-3 justify-end pt-2 border-t border-custom-300">
            <button type="button" onClick={onClose} className="px-4 py-2 rounded-xl border border-custom-300 text-sm font-semibold text-secondary-100 hover:bg-custom-100 transition-colors">Cancel</button>
            <button type="submit" disabled={creating || updating}
              className="px-4 py-2 rounded-xl bg-primary-500 text-white text-sm font-semibold hover:bg-primary-600 disabled:opacity-40 transition-colors">
              {creating || updating ? "Saving..." : isEdit ? "Save Changes" : "Create Item"}
            </button>
          </div>
        </form>
      </Card>
    </div>
  );
}

// ─── Delete Confirm Modal ────────────────────────────────────────────────────

function DeleteModal({ item, onClose, onSuccess }: { item: BoutiqueStockItem; onClose: () => void; onSuccess: () => void }) {
  const [deleteItem, { isLoading }] = useDeleteBoutiqueStockItemMutation();

  const handleDelete = async () => {
    try {
      await deleteItem(item.id).unwrap();
      toast.success("Item deleted");
      onSuccess();
    } catch (err: any) {
      toast.error(err?.data?.message ?? "Failed to delete");
    }
  };

  return (
    <div className="fixed inset-0 bg-secondary-100/50 z-50 flex items-center justify-center p-4">
      <Card className="!p-6 max-w-sm w-full">
        <div className="flex items-center gap-3 mb-4">
          <div className="w-10 h-10 rounded-xl bg-red-100 flex items-center justify-center flex-shrink-0">
            <HiOutlineTrash className="w-5 h-5 text-red-500" />
          </div>
          <div>
            <h3 className="text-base font-bold text-secondary-100">Delete Item</h3>
            <p className="text-xs text-custom-700 mt-0.5">This action cannot be undone</p>
          </div>
        </div>
        <p className="text-sm text-secondary-100 mb-5">
          Are you sure you want to delete <span className="font-semibold">"{item.itemName}"</span>?
        </p>
        <div className="flex gap-3 justify-end">
          <button onClick={onClose} className="px-4 py-2 rounded-xl border border-custom-300 text-sm font-semibold text-secondary-100 hover:bg-custom-100 transition-colors">Cancel</button>
          <button onClick={handleDelete} disabled={isLoading}
            className="px-4 py-2 rounded-xl bg-red-500 text-white text-sm font-semibold hover:bg-red-600 disabled:opacity-40 transition-colors">
            {isLoading ? "Deleting..." : "Delete"}
          </button>
        </div>
      </Card>
    </div>
  );
}

// ─── Restock Modal ────────────────────────────────────────────────────────────

function RestockModal({ item, onClose, onSuccess }: { item: BoutiqueStockItem; onClose: () => void; onSuccess: () => void }) {
  const [qty, setQty]   = useState("1");
  const [note, setNote] = useState("");
  const [createEntry, { isLoading }] = useCreateBoutiqueStockEntryMutation();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    const q = parseInt(qty);
    if (!q || q <= 0) { toast.error("Enter a valid quantity"); return; }
    try {
      await createEntry({ stockItemId: item.id, quantity: q, note: note.trim() || undefined }).unwrap();
      toast.success(`Added ${q} ${item.unit} to ${item.itemName}`);
      onSuccess();
    } catch (err: any) {
      toast.error(err?.data?.message ?? "Failed to restock");
    }
  };

  return (
    <div className="fixed inset-0 bg-secondary-100/50 z-50 flex items-start justify-center p-4 overflow-y-auto">
      <Card className="!p-6 max-w-sm w-full my-8">
        <div className="flex items-center justify-between mb-5">
          <h3 className="text-xl font-bold text-secondary-100">Restock: {item.itemName}</h3>
          <button onClick={onClose} className="text-custom-700 hover:text-secondary-100"><HiOutlineX className="w-6 h-6" /></button>
        </div>
        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label className="block text-xs font-semibold text-secondary-100 mb-1">Quantity to Add *</label>
            <input type="number" min={1} value={qty} onChange={(e) => setQty(e.target.value)} className={cls} />
            <p className="text-xs text-custom-700 mt-1">Current stock: <span className="font-bold text-secondary-100">{item.currentStock} {item.unit}</span></p>
          </div>
          <div>
            <label className="block text-xs font-semibold text-secondary-100 mb-1">Note</label>
            <input value={note} onChange={(e) => setNote(e.target.value)} placeholder="Optional note..." className={cls} />
          </div>
          <div className="flex gap-3 justify-end pt-2 border-t border-custom-300">
            <button type="button" onClick={onClose} className="px-4 py-2 rounded-xl border border-custom-300 text-sm font-semibold text-secondary-100 hover:bg-custom-100 transition-colors">Cancel</button>
            <button type="submit" disabled={isLoading}
              className="px-4 py-2 rounded-xl bg-emerald-500 text-white text-sm font-semibold hover:bg-emerald-600 disabled:opacity-40 transition-colors">
              {isLoading ? "Adding..." : "Add Stock"}
            </button>
          </div>
        </form>
      </Card>
    </div>
  );
}

// ─── Items Tab ────────────────────────────────────────────────────────────────

const PAGE_SIZE = 7;

function Pagination({ page, total, onChange }: { page: number; total: number; onChange: (p: number) => void }) {
  const pages = Math.ceil(total / PAGE_SIZE);
  if (pages <= 1) return null;
  return (
    <div className="flex items-center justify-end gap-1 pt-2">
      <button disabled={page === 1} onClick={() => onChange(page - 1)}
        className="px-3 py-1.5 rounded-lg border border-custom-300 text-xs font-semibold text-secondary-100 hover:bg-custom-100 disabled:opacity-40 transition-colors">
        Prev
      </button>
      {Array.from({ length: pages }, (_, i) => i + 1).map((p) => (
        <button key={p} onClick={() => onChange(p)}
          className={`w-8 h-8 rounded-lg text-xs font-semibold transition-colors ${
            p === page ? "bg-primary-500 text-white" : "border border-custom-300 text-secondary-100 hover:bg-custom-100"
          }`}>
          {p}
        </button>
      ))}
      <button disabled={page === pages} onClick={() => onChange(page + 1)}
        className="px-3 py-1.5 rounded-lg border border-custom-300 text-xs font-semibold text-secondary-100 hover:bg-custom-100 disabled:opacity-40 transition-colors">
        Next
      </button>
    </div>
  );
}

function ItemsTab() {
  const [showForm, setShowForm]       = useState(false);
  const [editItem, setEditItem]       = useState<BoutiqueStockItem | null>(null);
  const [restockItem, setRestockItem] = useState<BoutiqueStockItem | null>(null);
  const [deleteTarget, setDeleteTarget] = useState<BoutiqueStockItem | null>(null);
  const [search, setSearch]           = useState("");
  const [page, setPage]               = useState(1);

  const { data, isLoading, refetch } = useGetBoutiqueStockItemsQuery({ limit: 200 });
  const { data: sortiesData } = useGetBoutiqueStockSortiesQuery({ status: "approved", limit: 1000 });
  const totalDeducted = (sortiesData?.data ?? []).reduce((sum, s) => sum + parseFloat(s.quantityOut), 0);

  const allItems = data?.data ?? [];
  const filtered = allItems.filter((i) => {
    const q = search.trim().toLowerCase();
    return !q || i.itemName.toLowerCase().includes(q) || i.category.toLowerCase().includes(q);
  });
  const items = filtered.slice((page - 1) * PAGE_SIZE, page * PAGE_SIZE);

  return (
    <div className="space-y-4">
      <div className="flex flex-wrap items-center gap-3">
        <input value={search} onChange={(e) => { setSearch(e.target.value); setPage(1); }} placeholder="Search items..."
          className="flex-1 min-w-48 px-3 py-2 rounded-xl border border-custom-300 bg-style-500 text-secondary-100 text-sm focus:outline-none focus:border-primary-400 transition-colors"
        />
        <button onClick={() => refetch()} className="p-2 rounded-xl border border-custom-300 hover:bg-custom-100 transition-colors text-custom-700">
          <HiOutlineRefresh className={`w-4 h-4 ${isLoading ? "animate-spin" : ""}`} />
        </button>
        <button onClick={() => { setEditItem(null); setShowForm(true); }}
          className="flex items-center gap-2 px-4 py-2 rounded-xl bg-primary-500 text-white text-sm font-semibold hover:bg-primary-600 transition-colors">
          <HiOutlinePlus className="w-4 h-4" /> Add Item
        </button>
      </div>

      <div className="grid grid-cols-2 sm:grid-cols-5 gap-4">
        {[
          { label: "Total Items",   value: allItems.length,                                                                               color: "text-secondary-100", sub: undefined },
          { label: "Available",     value: allItems.filter((i) => getStockStatus(i.currentStock, i.alarmStock) === "available").length,   color: "text-emerald-600",   sub: undefined },
          { label: "Low Stock",     value: allItems.filter((i) => getStockStatus(i.currentStock, i.alarmStock) === "low").length,         color: "text-yellow-600",   sub: undefined },
          { label: "Out of Stock",  value: allItems.filter((i) => getStockStatus(i.currentStock, i.alarmStock) === "out-of-stock").length, color: "text-red-600",       sub: undefined },
          { label: "Items Deducted", value: totalDeducted,                                                                                color: "text-red-500",       sub: "from approved requests" },
        ].map(({ label, value, color, sub }) => (
          <Card key={label} className="!p-4 text-center">
            <p className="text-xs text-custom-700 mb-1">{label}</p>
            <p className={`text-2xl font-bold ${color}`}>{isLoading ? "—" : value.toLocaleString()}</p>
            {sub && <p className="text-[10px] text-custom-400 mt-0.5">{sub}</p>}
          </Card>
        ))}
      </div>

      <Card className="!p-0 overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead className="bg-custom-100 border-b border-custom-300">
              <tr>
                {["Item Name", "Category", "Unit", "Stock", "Unit Cost", "Total Value", "Alarm", "Status", "Actions"].map((h) => (
                  <th key={h} className="px-3 py-2.5 text-left text-xs font-bold text-secondary-100 uppercase tracking-wide">{h}</th>
                ))}
              </tr>
            </thead>
            <tbody className="divide-y divide-custom-200">
              {isLoading ? (
                <tr><td colSpan={9} className="px-4 py-8 text-center text-custom-700 text-sm">Loading...</td></tr>
              ) : items.length === 0 ? (
                <tr><td colSpan={9} className="px-4 py-10 text-center">
                  <HiOutlineArchive className="w-8 h-8 text-custom-400 mx-auto mb-2" />
                  <p className="text-sm text-secondary-100 font-semibold">No boutique stock items</p>
                  <p className="text-xs text-custom-700 mt-1">Add the first item using the button above</p>
                </td></tr>
              ) : items.map((item) => (
                <tr key={item.id} className="hover:bg-custom-50 transition-colors">
                  <td className="px-3 py-2.5">
                    <p className="text-sm font-semibold text-secondary-100">{item.itemName}</p>
                    {item.description && <p className="text-xs text-custom-700 truncate max-w-[160px]">{item.description}</p>}
                  </td>
                  <td className="px-3 py-2.5 text-sm text-secondary-100">{item.category}</td>
                  <td className="px-3 py-2.5 text-sm text-secondary-100">{item.unit}</td>
                  <td className="px-3 py-2.5 text-sm font-bold text-secondary-100">{item.currentStock}</td>
                  <td className="px-3 py-2.5 text-sm text-secondary-100">
                    {item.unitCost != null ? `${Number(item.unitCost).toLocaleString()} RWF` : <span className="text-custom-400">—</span>}
                  </td>
                  <td className="px-3 py-2.5 text-sm font-semibold text-secondary-100">
                    {item.unitCost != null ? `${(Number(item.unitCost) * item.currentStock).toLocaleString()} RWF` : <span className="text-custom-400">—</span>}
                  </td>
                  <td className="px-3 py-2.5 text-sm text-custom-700">{item.alarmStock}</td>
                  <td className="px-3 py-2.5">
                    {(() => { const s = getStockStatus(item.currentStock, item.alarmStock); return (
                      <span className={`text-xs font-semibold px-2 py-0.5 rounded-full capitalize ${statusColors[s] ?? "bg-gray-100 text-gray-600"}`}>
                        {s.replace("-", " ")}
                      </span>
                    ); })()}
                  </td>
                  <td className="px-3 py-2.5">
                    <div className="flex items-center gap-1">
                      <button onClick={() => setRestockItem(item)} title="Restock"
                        className="p-1.5 rounded-lg bg-emerald-50 text-emerald-600 hover:bg-emerald-100 transition-colors">
                        <HiOutlinePlus className="w-3.5 h-3.5" />
                      </button>
                      <button onClick={() => { setEditItem(item); setShowForm(true); }} title="Edit"
                        className="p-1.5 rounded-lg bg-blue-50 text-blue-600 hover:bg-blue-100 transition-colors">
                        <HiOutlinePencil className="w-3.5 h-3.5" />
                      </button>
                      <button onClick={() => setDeleteTarget(item)} title="Delete"
                        className="p-1.5 rounded-lg bg-red-50 text-red-500 hover:bg-red-100 transition-colors">
                        <HiOutlineTrash className="w-3.5 h-3.5" />
                      </button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
        <Pagination page={page} total={filtered.length} onChange={setPage} />
      </Card>

      {showForm && (
        <ItemFormModal
          item={editItem ?? undefined}
          onClose={() => { setShowForm(false); setEditItem(null); }}
          onSuccess={() => { setShowForm(false); setEditItem(null); refetch(); }}
        />
      )}
      {restockItem && (
        <RestockModal
          item={restockItem}
          onClose={() => setRestockItem(null)}
          onSuccess={() => { setRestockItem(null); refetch(); }}
        />
      )}
      {deleteTarget && (
        <DeleteModal
          item={deleteTarget}
          onClose={() => setDeleteTarget(null)}
          onSuccess={() => { setDeleteTarget(null); refetch(); }}
        />
      )}
    </div>
  );
}

// ─── Sorties Tab (Stock role — mark approved sorties as taken) ───────────────

const sortieStatusColors: Record<string, string> = {
  pending:  "bg-yellow-100 text-yellow-700",
  approved: "bg-emerald-100 text-emerald-700",
  taken:    "bg-blue-100 text-blue-700",
  rejected: "bg-red-100 text-red-700",
};

function SortiesTab() {
  const [statusFilter, setStatusFilter] = useState<SortieStatus | "">("");
  const [search, setSearch]             = useState("");
  const [takeTarget, setTakeTarget]     = useState<BoutiqueStockSortie | null>(null);
  const [page, setPage]                 = useState(1);

  const { data, isLoading, refetch } = useGetBoutiqueStockSortiesQuery(
    statusFilter ? { status: statusFilter, limit: 200 } : { limit: 200 }
  );
  const [take, { isLoading: taking }] = useTakeBoutiqueStockSortieMutation();

  const allSorties: BoutiqueStockSortie[] = (data?.data ?? []).filter((s) => {
    const q = search.trim().toLowerCase();
    if (!q) return true;
    return (
      s.stockItem?.itemName?.toLowerCase().includes(q) ||
      s.requester?.name?.toLowerCase().includes(q) ||
      s.reason?.toLowerCase().includes(q) ||
      s.notes?.toLowerCase().includes(q)
    );
  });
  const approvedCount = allSorties.filter((s) => s.status === "approved").length;
  const takenCount    = allSorties.filter((s) => s.status === "taken").length;
  const sorties       = allSorties.slice((page - 1) * PAGE_SIZE, page * PAGE_SIZE);

  const handleTake = async () => {
    if (!takeTarget) return;
    try {
      await take(takeTarget.id).unwrap();
      toast.success("Marked as taken — stock deducted");
      setTakeTarget(null);
      refetch();
    } catch (err: any) {
      toast.error(err?.data?.message ?? "Failed to mark as taken");
    }
  };

  return (
    <div className="space-y-4">
      <div className="flex flex-wrap items-center gap-3">
        <input
          value={search}
          onChange={(e) => { setSearch(e.target.value); setPage(1); }}
          placeholder="Search item, requester..."
          className="flex-1 min-w-48 px-3 py-2 rounded-xl border border-custom-300 bg-style-500 text-secondary-100 text-sm focus:outline-none focus:border-primary-400 transition-colors"
        />
        <select
          value={statusFilter}
          onChange={(e) => { setStatusFilter(e.target.value as SortieStatus | ""); setPage(1); }}
          className="px-3 py-2 rounded-xl border border-custom-300 bg-style-500 text-secondary-100 text-sm focus:outline-none focus:border-primary-400 transition-colors"
        >
          <option value="">All Requests</option>
          <option value="pending">Pending</option>
          <option value="approved">Approved</option>
          <option value="taken">Taken</option>
          <option value="rejected">Rejected</option>
        </select>
        <button onClick={() => refetch()} className="p-2 rounded-xl border border-custom-300 hover:bg-custom-100 transition-colors text-custom-700">
          <HiOutlineRefresh className={`w-4 h-4 ${isLoading ? "animate-spin" : ""}`} />
        </button>
        {approvedCount > 0 && (
          <span className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-emerald-50 border border-emerald-200 text-emerald-700 text-xs font-bold">
            <HiOutlineClipboardList className="w-4 h-4" />
            {approvedCount} approved — ready to hand out
          </span>
        )}
      </div>

      <div className="grid grid-cols-2 sm:grid-cols-3 gap-4">
        <Card className="!p-4 text-center">
          <p className="text-xs text-custom-700 mb-1">Total Requests</p>
          <p className="text-2xl font-bold text-secondary-100">{isLoading ? "—" : allSorties.length}</p>
        </Card>
        <Card className="!p-4 text-center">
          <p className="text-xs text-custom-700 mb-1">Ready to Give</p>
          <p className="text-2xl font-bold text-emerald-600">{isLoading ? "—" : approvedCount}</p>
        </Card>
        <Card className="!p-4 text-center col-span-2 sm:col-span-1">
          <p className="text-xs text-custom-700 mb-1">Items Taken</p>
          <p className="text-2xl font-bold text-blue-600">{isLoading ? "—" : takenCount}</p>
          <p className="text-[10px] text-custom-400 mt-0.5">physically given to requester</p>
        </Card>
      </div>

      <div className="space-y-3">
        {isLoading ? (
          Array.from({ length: 3 }).map((_, i) => (
            <Card key={i} className="!p-4 animate-pulse">
              <div className="h-4 w-1/3 bg-custom-200 rounded mb-2" />
              <div className="h-3 w-full bg-custom-200 rounded" />
            </Card>
          ))
        ) : sorties.length === 0 ? (
          <Card className="!p-10 text-center">
            <HiOutlineCheckCircle className="w-8 h-8 text-custom-400 mx-auto mb-2" />
            <p className="text-sm text-secondary-100 font-semibold">No requests found</p>
            <p className="text-xs text-custom-700 mt-1">Approved requests ready for handout will appear here</p>
          </Card>
        ) : sorties.map((sortie) => (
          <Card key={sortie.id} className="!p-0 overflow-hidden">
            <div className="flex items-center justify-between px-4 py-3 bg-custom-50 border-b border-custom-200">
              <div className="flex items-center gap-3">
                <div>
                  <p className="text-sm font-semibold text-secondary-100">
                    {sortie.stockItem?.itemName ?? "Stock Item"}
                  </p>
                  <p className="text-xs text-custom-700">
                    Requested by: <span className="font-medium">{sortie.requester?.name ?? "—"}</span>
                    {" · "}{new Date(sortie.createdAt).toLocaleDateString("en-RW", { day: "2-digit", month: "short", year: "numeric" })}
                  </p>
                </div>
                <span className={`text-xs font-bold px-2 py-0.5 rounded-full ${sortieStatusColors[sortie.status] ?? "bg-gray-100 text-gray-600"}`}>
                  {sortie.status}
                </span>
              </div>
              {sortie.status === "approved" && (
                <button
                  onClick={() => setTakeTarget(sortie)}
                  className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-blue-500 text-white text-xs font-semibold hover:bg-blue-600 transition-colors"
                >
                  <HiOutlineCheck className="w-3.5 h-3.5" /> Mark as Taken
                </button>
              )}
            </div>
            <div className="px-4 py-3 flex flex-wrap items-center gap-4 text-sm">
              <span className="text-custom-700">
                Qty: <span className="font-bold text-secondary-100">{parseFloat(sortie.quantityOut)} {sortie.stockItem?.unit ?? ""}</span>
              </span>
              {(sortie.reason || (sortie.status !== "rejected" && sortie.notes)) && (
                <span className="text-xs text-custom-700">Reason: <em>"{sortie.reason ?? sortie.notes}"</em></span>
              )}
              {sortie.approvedBy && sortie.status !== "rejected" && (
                <span className="text-xs text-custom-700">
                  Approved by: <span className="font-medium">{sortie.approvedBy.name}</span>
                </span>
              )}
              {sortie.status === "rejected" && sortie.notes && (
                <span className="text-xs text-red-600">Rejection reason: <em>"{sortie.notes}"</em></span>
              )}
              {sortie.status === "rejected" && sortie.approvedBy && (
                <span className="text-xs text-custom-700">
                  Rejected by: <span className="font-medium">{sortie.approvedBy.name}</span>
                </span>
              )}
              {sortie.status === "taken" && sortie.takenBy && (
                <span className="text-xs text-custom-700">
                  Given by: <span className="font-medium">{sortie.takenBy.name}</span>
                  {sortie.takenAt && ` · ${new Date(sortie.takenAt).toLocaleDateString("en-RW", { day: "2-digit", month: "short" })}`}
                </span>
              )}
            </div>
            {sortie.status === "taken" && sortie.stockBefore != null && sortie.stockAfter != null && (
              <div className="px-4 py-2 bg-blue-50 border-t border-blue-100 flex items-center gap-4 text-xs">
                <span className="text-blue-700">Stock before: <span className="font-bold">{sortie.stockBefore}</span></span>
                <span className="text-blue-700">→ Stock after: <span className="font-bold">{sortie.stockAfter}</span></span>
                {sortie.stockAfter <= (sortie.stockItem?.alarmStock ?? 0) && (
                  <span className="inline-flex items-center gap-1 text-yellow-700 font-semibold">
                    <HiOutlineExclamationCircle className="w-3.5 h-3.5" /> Low stock
                  </span>
                )}
              </div>
            )}
          </Card>
        ))}
      </div>
      <Pagination page={page} total={allSorties.length} onChange={setPage} />

      {takeTarget && (
        <div className="fixed inset-0 bg-secondary-100/50 z-50 flex items-center justify-center p-4">
          <Card className="!p-6 max-w-sm w-full">
            <div className="flex items-center gap-3 mb-4">
              <div className="w-10 h-10 rounded-xl bg-blue-100 flex items-center justify-center flex-shrink-0">
                <HiOutlineCheck className="w-5 h-5 text-blue-600" />
              </div>
              <div>
                <h3 className="text-base font-bold text-secondary-100">Mark as Taken</h3>
                <p className="text-xs text-custom-700 mt-0.5 truncate max-w-[200px]">
                  {takeTarget.stockItem?.itemName ?? "Stock Item"}
                </p>
              </div>
            </div>
            <p className="text-sm text-secondary-100 mb-2">
              Confirm you have physically given{" "}
              <span className="font-bold">{parseFloat(takeTarget.quantityOut)} {takeTarget.stockItem?.unit ?? ""}</span>{" "}
              to <span className="font-bold">{takeTarget.requester?.name ?? "the requester"}</span>?
            </p>
            <p className="text-xs text-custom-700 mb-5">
              This will deduct the quantity from current stock and cannot be undone.
            </p>
            <div className="flex gap-3 justify-end">
              <button
                onClick={() => setTakeTarget(null)}
                className="px-4 py-2 rounded-xl border border-custom-300 text-sm font-semibold text-secondary-100 hover:bg-custom-100 transition-colors"
              >
                Cancel
              </button>
              <button
                onClick={handleTake}
                disabled={taking}
                className="px-4 py-2 rounded-xl bg-blue-500 text-white text-sm font-semibold hover:bg-blue-600 disabled:opacity-40 transition-colors"
              >
                {taking ? "Processing..." : "Yes, Mark Taken"}
              </button>
            </div>
          </Card>
        </div>
      )}

    </div>
  );
}

// ─── Main Page ────────────────────────────────────────────────────────────────

// ─── Main Page ────────────────────────────────────────────────────────────────

type Tab = "items" | "sorties";

export default function BoutiqueStockPage() {
  const [tab, setTab] = useState<Tab>("items");

  const { data: sortiesData } = useGetBoutiqueStockSortiesQuery({ status: "approved", limit: 200 });
  const approvedCount = sortiesData?.data?.length ?? 0;

  return (
    <DashboardLayout>
      <div className="space-y-6 font-[family-name:var(--font-family-primary)]">

        {/* Header */}
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-xl bg-pink-100 flex items-center justify-center">
            <HiOutlineArchive className="w-5 h-5 text-pink-600" />
          </div>
          <div>
            <h1 className="text-2xl md:text-3xl font-bold text-secondary-100">Boutique Stock</h1>
            <p className="text-sm text-custom-700 mt-0.5">Manage boutique stock items and process requests</p>
          </div>
        </div>

        {/* Tabs */}
        <div className="flex gap-1 p-1 bg-custom-100 rounded-xl w-fit">
          {([
            { id: "items",   label: "Items" },
            { id: "sorties", label: "Requests", badge: approvedCount },
          ] as { id: Tab; label: string; badge?: number }[]).map(({ id, label, badge }) => (
            <button key={id} onClick={() => setTab(id)}
              className={`relative flex items-center gap-2 px-5 py-2 rounded-lg text-sm font-semibold transition-all ${
                tab === id ? "bg-style-500 text-secondary-100 shadow-sm" : "text-custom-700 hover:text-secondary-100"
              }`}
            >
              {label}
              {badge != null && badge > 0 && (
                <span className="w-5 h-5 bg-yellow-500 text-white text-[10px] font-bold rounded-full flex items-center justify-center">
                  {badge > 9 ? "9+" : badge}
                </span>
              )}
            </button>
          ))}
        </div>

        {tab === "items"   && <ItemsTab />}
        {tab === "sorties" && <SortiesTab />}
      </div>
    </DashboardLayout>
  );
}
