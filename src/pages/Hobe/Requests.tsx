import { useState } from "react";
import {
  HiOutlineClipboardList,
  HiOutlinePlus,
  HiOutlineTrash,
  HiOutlineRefresh,
  HiOutlineArchive,
  HiOutlineExclamationCircle,
  HiOutlineCheckCircle,
  HiOutlineSearch,
  HiOutlineX,
} from "react-icons/hi";
import { toast } from "react-toastify";
import { DashboardLayout } from "../../components";
import { Card } from "../../components/ui";
import {
  useGetStockItemsQuery,
  useCreateStockSortieMutation,
  useGetStockSortiesQuery,
  type StockItem,
} from "../../store/services/stockService";

// ─── Status config ────────────────────────────────────────────────────────────

const sortieStatusColors: Record<string, string> = {
  pending:  "bg-yellow-100 text-yellow-700",
  approved: "bg-emerald-100 text-emerald-700",
  rejected: "bg-red-100 text-red-700",
};

// ─── Request Modal ────────────────────────────────────────────────────────────

interface RequestItem { stockItem: StockItem; quantity: number }

function RequestModal({ hobeItems, onClose, onSuccess }: {
  hobeItems: StockItem[];
  onClose: () => void;
  onSuccess: () => void;
}) {
  const [items, setItems]           = useState<RequestItem[]>([]);
  const [selectedId, setSelectedId] = useState("");
  const [qty, setQty]               = useState("1");
  const [reason, setReason]         = useState("");
  const [createSortie, { isLoading }] = useCreateStockSortieMutation();

  const availableToAdd = hobeItems.filter((h) => !items.find((i) => i.stockItem.id === h.id));

  const addItem = () => {
    const stockItem = hobeItems.find((h) => h.id === selectedId);
    if (!stockItem) return;
    const q = parseInt(qty);
    if (!q || q <= 0) { toast.error("Enter a valid quantity"); return; }
    setItems((prev) => [...prev, { stockItem, quantity: q }]);
    setSelectedId(""); setQty("1");
  };

  const removeItem = (id: string) =>
    setItems((prev) => prev.filter((i) => i.stockItem.id !== id));

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (items.length === 0) { toast.error("Add at least one item"); return; }
    if (!reason.trim())     { toast.error("Please provide a reason"); return; }

    // Submit one sortie per item
    try {
      await Promise.all(
        items.map((i) =>
          createSortie({
            stockItemId: i.stockItem.id,
            quantityOut: i.quantity,
            reason: reason.trim(),
          }).unwrap()
        )
      );
      toast.success(`${items.length} request${items.length > 1 ? "s" : ""} submitted to stock`);
      onSuccess();
    } catch (err: any) {
      toast.error(err?.data?.message ?? "Failed to submit request");
    }
  };

  return (
    <div className="fixed inset-0 bg-secondary-100/50 z-50 flex items-start justify-center p-4 overflow-y-auto">
      <Card className="!p-6 max-w-xl w-full my-8">
        <div className="flex items-center justify-between mb-5">
          <div>
            <h3 className="text-xl font-bold text-secondary-100">Request Stock</h3>
            <p className="text-sm text-custom-700 mt-0.5">Select hobe items and quantities to request</p>
          </div>
          <button onClick={onClose} className="text-custom-700 hover:text-secondary-100">
            <HiOutlineX className="w-6 h-6" />
          </button>
        </div>

        <form onSubmit={handleSubmit} className="space-y-5">
          {/* Add item row */}
          <div className="rounded-xl border border-custom-300 bg-custom-50 p-4 space-y-3">
            <p className="text-sm font-semibold text-secondary-100">Add Item</p>
            <div className="flex gap-2">
              <select
                value={selectedId}
                onChange={(e) => setSelectedId(e.target.value)}
                className="flex-1 px-3 py-2 rounded-xl border border-custom-300 bg-style-500 text-secondary-100 text-sm focus:outline-none focus:border-primary-400 transition-colors"
              >
                <option value="">Select a stock item...</option>
                {availableToAdd.map((h) => (
                  <option key={h.id} value={h.id}>
                    {h.itemName} — {h.currentStock} {h.unit} available
                  </option>
                ))}
              </select>
              <input
                type="number" min={1} value={qty}
                onChange={(e) => setQty(e.target.value)}
                placeholder="Qty"
                className="w-20 px-3 py-2 rounded-xl border border-custom-300 bg-style-500 text-secondary-100 text-sm focus:outline-none focus:border-primary-400 transition-colors"
              />
              <button
                type="button" onClick={addItem} disabled={!selectedId}
                className="px-3 py-2 rounded-xl bg-primary-500 text-white hover:bg-primary-600 transition-colors disabled:opacity-40"
              >
                <HiOutlinePlus className="w-4 h-4" />
              </button>
            </div>
          </div>

          {/* Selected items */}
          {items.length > 0 && (
            <div className="rounded-xl border border-custom-300 overflow-hidden">
              <div className="px-4 py-2 bg-custom-100 border-b border-custom-200">
                <p className="text-xs font-bold text-secondary-100 uppercase tracking-wide">
                  Items to Request ({items.length})
                </p>
              </div>
              {items.map((item) => (
                <div key={item.stockItem.id} className="flex items-center gap-3 px-4 py-3 border-b border-custom-100 last:border-0">
                  <div className="flex-1 min-w-0">
                    <p className="text-sm font-semibold text-secondary-100 truncate">{item.stockItem.itemName}</p>
                    <p className="text-xs text-custom-700">{item.stockItem.category} · {item.stockItem.unit}</p>
                  </div>
                  <span className="text-sm font-bold text-primary-500 flex-shrink-0">× {item.quantity}</span>
                  <button
                    type="button" onClick={() => removeItem(item.stockItem.id)}
                    className="p-1 rounded-lg text-red-500 hover:bg-red-50 transition-colors flex-shrink-0"
                  >
                    <HiOutlineTrash className="w-4 h-4" />
                  </button>
                </div>
              ))}
            </div>
          )}

          {/* Reason */}
          <div>
            <label className="block text-sm font-semibold text-secondary-100 mb-2">
              Reason *
            </label>
            <textarea
              value={reason} onChange={(e) => setReason(e.target.value)}
              placeholder="e.g. Running low on stock, need replenishment..."
              rows={2}
              className="w-full px-4 py-2.5 rounded-xl border border-custom-300 bg-style-500 text-secondary-100 text-sm placeholder:text-custom-700 focus:outline-none focus:border-primary-400 transition-colors resize-none"
            />
          </div>

          <div className="flex gap-3 justify-end pt-2 border-t border-custom-300">
            <button type="button" onClick={onClose}
              className="px-4 py-2 rounded-xl border border-custom-300 text-sm font-semibold text-secondary-100 hover:bg-custom-100 transition-colors"
            >Cancel</button>
            <button type="submit" disabled={isLoading || items.length === 0}
              className="px-4 py-2 rounded-xl bg-primary-500 text-white text-sm font-semibold hover:bg-primary-600 disabled:opacity-40 transition-colors"
            >{isLoading ? "Submitting..." : "Submit Request"}</button>
          </div>
        </form>
      </Card>
    </div>
  );
}

// ─── Main Page ────────────────────────────────────────────────────────────────

export default function RequestsPage() {
  const [showModal, setShowModal] = useState(false);
  const [search, setSearch]       = useState("");

  // Only fetch hobe-type items from stock — backend auto-filters for HOBE role too
  const { data: stockData, isLoading: stockLoading, refetch: refetchStock } =
    useGetStockItemsQuery({ type: "hobe", limit: 200 });

  const { data: sortiesData, isLoading: sortiesLoading, refetch: refetchSorties } =
    useGetStockSortiesQuery({ limit: 100 });

  const hobeItems = (stockData?.data ?? []).filter((item) => {
    const q = search.trim().toLowerCase();
    return !q || (item.itemName ?? "").toLowerCase().includes(q) || item.category.toLowerCase().includes(q);
  });

  const mySorties = sortiesData?.data ?? [];
  const pendingCount  = mySorties.filter((s) => s.status === "pending").length;
  const approvedCount = mySorties.filter((s) => s.status === "approved").length;
  const rejectedCount = mySorties.filter((s) => s.status === "rejected").length;

  return (
    <DashboardLayout notificationCount={pendingCount}>
      <div className="space-y-6 font-[family-name:var(--font-family-primary)]">

        {/* ── Header ──────────────────────────────────────────────────────── */}
        <div className="flex items-start justify-between gap-4">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-orange-100 flex items-center justify-center">
              <HiOutlineClipboardList className="w-5 h-5 text-orange-600" />
            </div>
            <div>
              <h1 className="text-2xl md:text-3xl font-bold text-secondary-100">Stock Requests</h1>
              <p className="text-sm text-custom-700 mt-0.5">Request hobe products from stock management</p>
            </div>
          </div>
          <div className="flex items-center gap-2">
            <button
              onClick={() => { refetchStock(); refetchSorties(); }}
              className="p-2 rounded-xl border border-custom-300 hover:bg-custom-100 transition-colors text-custom-700"
            >
              <HiOutlineRefresh className={`w-4 h-4 ${stockLoading || sortiesLoading ? "animate-spin" : ""}`} />
            </button>
            <button
              onClick={() => setShowModal(true)}
              disabled={hobeItems.length === 0}
              className="flex items-center gap-2 px-4 py-2 rounded-xl bg-primary-500 text-white text-sm font-semibold hover:bg-primary-600 disabled:opacity-40 transition-colors"
            >
              <HiOutlinePlus className="w-4 h-4" />
              New Request
            </button>
          </div>
        </div>

        {/* ── Summary ─────────────────────────────────────────────────────── */}
        <div className="grid grid-cols-3 gap-4">
          <Card className="!p-4 text-center">
            <p className="text-xs text-custom-700 mb-1">Pending</p>
            <p className="text-2xl font-bold text-yellow-600">{sortiesLoading ? "—" : pendingCount}</p>
          </Card>
          <Card className="!p-4 text-center">
            <p className="text-xs text-custom-700 mb-1">Approved</p>
            <p className="text-2xl font-bold text-emerald-600">{sortiesLoading ? "—" : approvedCount}</p>
          </Card>
          <Card className="!p-4 text-center">
            <p className="text-xs text-custom-700 mb-1">Rejected</p>
            <p className="text-2xl font-bold text-red-600">{sortiesLoading ? "—" : rejectedCount}</p>
          </Card>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">

          {/* ── Left — available hobe stock items ───────────────────────── */}
          <div className="space-y-3">
            <div className="flex items-center justify-between">
              <h2 className="text-sm font-bold text-secondary-100 uppercase tracking-wide">
                Available Hobe Items in Stock
              </h2>
              <span className="text-xs text-custom-700">{hobeItems.length} items</span>
            </div>

            <div className="relative">
              <HiOutlineSearch className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-custom-700" />
              <input
                type="text" value={search}
                onChange={(e) => setSearch(e.target.value)}
                placeholder="Search items..."
                className="w-full pl-9 pr-4 py-2 rounded-xl border border-custom-300 bg-style-500 text-secondary-100 text-sm placeholder:text-custom-700 focus:outline-none focus:border-primary-400 transition-colors"
              />
            </div>

            {stockLoading ? (
              <div className="space-y-2">
                {Array.from({ length: 4 }).map((_, i) => (
                  <Card key={i} className="!p-3 animate-pulse">
                    <div className="h-4 w-1/2 bg-custom-200 rounded mb-2" />
                    <div className="h-3 w-full bg-custom-200 rounded" />
                  </Card>
                ))}
              </div>
            ) : hobeItems.length === 0 ? (
              <Card className="!p-8 text-center">
                <HiOutlineArchive className="w-8 h-8 text-custom-400 mx-auto mb-2" />
                <p className="text-sm text-secondary-100 font-semibold">No hobe items in stock</p>
                <p className="text-xs text-custom-700 mt-1">
                  Ask the stock manager to add items with type "hobe"
                </p>
              </Card>
            ) : (
              <div className="space-y-2 max-h-[60vh] overflow-y-auto pr-1">
                {hobeItems.map((item) => {
                  const isOut = item.stockStatus === "out-of-stock";
                  const isLow = item.stockStatus === "low";
                  return (
                    <Card key={item.id} className="!p-3">
                      <div className="flex items-center justify-between gap-3">
                        <div className="flex-1 min-w-0">
                          <p className="text-sm font-semibold text-secondary-100 truncate">{item.itemName}</p>
                          <p className="text-xs text-custom-700">{item.category}</p>
                          <div className="flex items-center gap-2 mt-1.5">
                            <div className="flex-1 h-1.5 bg-custom-200 rounded-full">
                              <div
                                className={`h-1.5 rounded-full ${isOut ? "bg-red-400" : isLow ? "bg-yellow-400" : "bg-emerald-400"}`}
                                style={{ width: item.minStock > 0 ? `${Math.min(100, Math.round((item.currentStock / (item.minStock * 3)) * 100))}%` : item.currentStock > 0 ? "100%" : "0%" }}
                              />
                            </div>
                            <span className={`text-xs font-bold flex-shrink-0 ${isOut ? "text-red-500" : isLow ? "text-yellow-600" : "text-emerald-600"}`}>
                              {item.currentStock} {item.unit}
                            </span>
                          </div>
                        </div>
                        <div>
                          {isOut ? (
                            <span className="inline-flex items-center gap-1 text-xs font-bold px-2 py-0.5 rounded-full bg-red-100 text-red-600">
                              <HiOutlineExclamationCircle className="w-3 h-3" /> Out
                            </span>
                          ) : isLow ? (
                            <span className="inline-flex items-center gap-1 text-xs font-bold px-2 py-0.5 rounded-full bg-yellow-100 text-yellow-700">
                              <HiOutlineExclamationCircle className="w-3 h-3" /> Low
                            </span>
                          ) : (
                            <span className="inline-flex items-center gap-1 text-xs font-bold px-2 py-0.5 rounded-full bg-emerald-100 text-emerald-700">
                              <HiOutlineCheckCircle className="w-3 h-3" /> OK
                            </span>
                          )}
                        </div>
                      </div>
                    </Card>
                  );
                })}
              </div>
            )}
          </div>

          {/* ── Right — my sorties / requests ───────────────────────────── */}
          <div className="space-y-3">
            <h2 className="text-sm font-bold text-secondary-100 uppercase tracking-wide">
              My Requests
            </h2>

            {sortiesLoading ? (
              <div className="space-y-2">
                {Array.from({ length: 3 }).map((_, i) => (
                  <Card key={i} className="!p-3 animate-pulse">
                    <div className="h-4 w-1/3 bg-custom-200 rounded mb-2" />
                    <div className="h-3 w-full bg-custom-200 rounded" />
                  </Card>
                ))}
              </div>
            ) : mySorties.length === 0 ? (
              <Card className="!p-8 text-center">
                <HiOutlineClipboardList className="w-8 h-8 text-custom-400 mx-auto mb-2" />
                <p className="text-sm text-secondary-100 font-semibold">No requests yet</p>
                <p className="text-xs text-custom-700 mt-1 mb-4">Submit your first request using the button above</p>
                <button
                  onClick={() => setShowModal(true)}
                  disabled={hobeItems.length === 0}
                  className="px-4 py-2 rounded-xl bg-primary-500 text-white text-sm font-semibold hover:bg-primary-600 disabled:opacity-40 transition-colors"
                >
                  New Request
                </button>
              </Card>
            ) : (
              <div className="space-y-3 max-h-[60vh] overflow-y-auto pr-1">
                {mySorties.map((sortie) => (
                  <div key={sortie.id} className="rounded-xl border border-custom-300 overflow-hidden">
                    <div className="flex items-center justify-between px-4 py-2.5 bg-custom-50 border-b border-custom-200">
                      <div className="flex items-center gap-2">
                        <p className="text-sm font-semibold text-secondary-100">
                          {sortie.stockItem?.itemName ?? sortie.stockItem?.name ?? "Stock Item"}
                        </p>
                        <span className={`text-xs font-bold px-2 py-0.5 rounded-full ${sortieStatusColors[sortie.status] ?? "bg-gray-100 text-gray-600"}`}>
                          {sortie.status}
                        </span>
                      </div>
                      <span className="text-xs text-custom-700">
                        {new Date(sortie.createdAt).toLocaleDateString("en-RW", { day: "2-digit", month: "short" })}
                      </span>
                    </div>
                    <div className="px-4 py-2.5 flex items-center gap-4 text-sm">
                      <span className="text-custom-700">Qty: <span className="font-bold text-secondary-100">{sortie.quantity}</span></span>
                      {sortie.stockItem?.unit && <span className="text-custom-700 text-xs">{sortie.stockItem.unit}</span>}
                      {sortie.reason && <span className="text-xs text-custom-700 truncate flex-1">"{sortie.reason}"</span>}
                    </div>
                    {sortie.status === "approved" && (
                      <div className="px-4 py-2 bg-emerald-50 border-t border-emerald-100 flex items-center gap-2">
                        <HiOutlineCheckCircle className="w-4 h-4 text-emerald-600 flex-shrink-0" />
                        <p className="text-xs font-semibold text-emerald-700">Approved — stock has been allocated</p>
                      </div>
                    )}
                    {sortie.status === "rejected" && (
                      <div className="px-4 py-2 bg-red-50 border-t border-red-100">
                        <p className="text-xs font-semibold text-red-700">Request was rejected</p>
                      </div>
                    )}
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>
      </div>

      {showModal && (
        <RequestModal
          hobeItems={stockData?.data ?? []}
          onClose={() => setShowModal(false)}
          onSuccess={() => { setShowModal(false); refetchSorties(); }}
        />
      )}
    </DashboardLayout>
  );
}
