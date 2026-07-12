import { useState } from "react";
import {
  HiOutlineClipboardList,
  HiOutlinePlus,
  HiOutlineTrash,
  HiOutlinePencil,
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
  useGetBoutiqueStockItemsQuery,
  useCreateBoutiqueStockSortieMutation,
  useGetMyBoutiqueStockSortiesQuery,
  useUpdateBoutiqueStockSortieMutation,
  useDeleteBoutiqueStockSortieMutation,
  type BoutiqueStockItem,
  type BoutiqueStockSortie,
} from "../../store/services/boutiqueStockService";

const sortieStatusColors: Record<string, string> = {
  pending:  "bg-yellow-100 text-yellow-700",
  approved: "bg-emerald-100 text-emerald-700",
  taken:    "bg-blue-100 text-blue-700",
  rejected: "bg-red-100 text-red-700",
};

interface RequestItem { stockItem: BoutiqueStockItem; quantity: number }

function RequestModal({ items: stockItems, onClose, onSuccess, editTarget }: {
  items: BoutiqueStockItem[];
  onClose: () => void;
  onSuccess: () => void;
  editTarget?: BoutiqueStockSortie;
}) {
  const isEdit = !!editTarget;

  const [items, setItems] = useState<RequestItem[]>(() => {
    if (!editTarget) return [];
    // new grouped API: items array
    if (editTarget.items && editTarget.items.length > 0) {
      return editTarget.items.map((si) => ({
        stockItem: si.stockItem ?? stockItems.find((h) => h.id === si.productId) ?? { id: si.productId, itemName: si.productId } as BoutiqueStockItem,
        quantity: si.quantity,
      }));
    }
    // old API: single stockItem + quantityOut on the sortie itself
    if (editTarget.stockItem) {
      return [{ stockItem: editTarget.stockItem, quantity: parseFloat(editTarget.quantityOut) || 1 }];
    }
    return [];
  });
  const [selectedId, setSelectedId] = useState("");
  const [qty, setQty]               = useState("1");
  const [reason, setReason]         = useState(editTarget?.reason ?? editTarget?.notes ?? "");
  const [createSortie, { isLoading: creating }] = useCreateBoutiqueStockSortieMutation();
  const [updateSortie, { isLoading: updating }] = useUpdateBoutiqueStockSortieMutation();
  const isLoading = creating || updating;

  const available = stockItems.filter((h) => !items.find((i) => i.stockItem.id === h.id));

  const addItem = () => {
    const stockItem = stockItems.find((h) => h.id === selectedId);
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
    try {
      if (isEdit && editTarget) {
        await updateSortie({
          id: editTarget.id,
          quantityOut: items[0]?.quantity,
          reason: reason.trim() || undefined,
        }).unwrap();
        toast.success("Request updated");
      } else {
        if (!reason.trim()) { toast.error("Please provide a reason"); return; }
        await Promise.all(
          items.map((i) =>
            createSortie({ stockItemId: i.stockItem.id, quantityOut: i.quantity, reason: reason.trim() }).unwrap()
          )
        );
        toast.success(`${items.length} request${items.length > 1 ? "s" : ""} submitted`);
      }
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
            <h3 className="text-xl font-bold text-secondary-100">{isEdit ? "Edit Request" : "Request Boutique Stock"}</h3>
            <p className="text-sm text-custom-700 mt-0.5">{isEdit ? "Update items and notes for this request" : "Select items and quantities to request from boutique stock"}</p>
          </div>
          <button onClick={onClose} className="text-custom-700 hover:text-secondary-100">
            <HiOutlineX className="w-6 h-6" />
          </button>
        </div>

        <form onSubmit={handleSubmit} className="space-y-5">
          <div className="rounded-xl border border-custom-300 bg-custom-50 p-4 space-y-3">
            <p className="text-sm font-semibold text-secondary-100">Add Item</p>
            <div className="flex gap-2">
              <select value={selectedId} onChange={(e) => setSelectedId(e.target.value)}
                className="flex-1 px-3 py-2 rounded-xl border border-custom-300 bg-style-500 text-secondary-100 text-sm focus:outline-none focus:border-primary-400 transition-colors"
              >
                <option value="">Select a stock item...</option>
                {available.map((h) => (
                  <option key={h.id} value={h.id}>
                    {h.itemName} — {h.currentStock} {h.unit} available
                  </option>
                ))}
              </select>
              <input type="number" min={1} value={qty} onChange={(e) => setQty(e.target.value)} placeholder="Qty"
                className="w-20 px-3 py-2 rounded-xl border border-custom-300 bg-style-500 text-secondary-100 text-sm focus:outline-none focus:border-primary-400 transition-colors"
              />
              <button type="button" onClick={addItem} disabled={!selectedId}
                className="px-3 py-2 rounded-xl bg-primary-500 text-white hover:bg-primary-600 transition-colors disabled:opacity-40"
              >
                <HiOutlinePlus className="w-4 h-4" />
              </button>
            </div>
          </div>

          {items.length > 0 && (
            <div className="rounded-xl border border-custom-300 overflow-hidden">
              <div className="px-4 py-2 bg-custom-100 border-b border-custom-200">
                <p className="text-xs font-bold text-secondary-100 uppercase tracking-wide">Items to Request ({items.length})</p>
              </div>
              {items.map((item) => (
                <div key={item.stockItem.id} className="flex items-center gap-3 px-4 py-3 border-b border-custom-100 last:border-0">
                  <div className="flex-1 min-w-0">
                    <p className="text-sm font-semibold text-secondary-100 truncate">{item.stockItem.itemName}</p>
                    <p className="text-xs text-custom-700">{item.stockItem.category} · {item.stockItem.unit}</p>
                  </div>
                  <span className="text-sm font-bold text-primary-500 flex-shrink-0">× {item.quantity}</span>
                  <button type="button" onClick={() => removeItem(item.stockItem.id)}
                    className="p-1 rounded-lg text-red-500 hover:bg-red-50 transition-colors flex-shrink-0"
                  >
                    <HiOutlineTrash className="w-4 h-4" />
                  </button>
                </div>
              ))}
            </div>
          )}

          <div>
            <label className="block text-sm font-semibold text-secondary-100 mb-2">Reason *</label>
            <textarea value={reason} onChange={(e) => setReason(e.target.value)}
              placeholder="e.g. Need items for boutique restocking..." rows={2}
              className="w-full px-4 py-2.5 rounded-xl border border-custom-300 bg-style-500 text-secondary-100 text-sm placeholder:text-custom-700 focus:outline-none focus:border-primary-400 transition-colors resize-none"
            />
          </div>

          <div className="flex gap-3 justify-end pt-2 border-t border-custom-300">
            <button type="button" onClick={onClose}
              className="px-4 py-2 rounded-xl border border-custom-300 text-sm font-semibold text-secondary-100 hover:bg-custom-100 transition-colors"
            >Cancel</button>
            <button type="submit" disabled={isLoading || items.length === 0}
              className="px-4 py-2 rounded-xl bg-primary-500 text-white text-sm font-semibold hover:bg-primary-600 disabled:opacity-40 transition-colors"
            >{isLoading ? (isEdit ? "Saving..." : "Submitting...") : (isEdit ? "Save Changes" : "Submit Request")}</button>
          </div>
        </form>
      </Card>
    </div>
  );
}

// ─── Main Page ────────────────────────────────────────────────────────────────

export default function BoutiqueStockRequestsPage() {
  const [showModal, setShowModal]         = useState(false);
  const [editTarget, setEditTarget]       = useState<BoutiqueStockSortie | undefined>(undefined);
  const [deleteTarget, setDeleteTarget]   = useState<BoutiqueStockSortie | undefined>(undefined);
  const [search, setSearch]               = useState("");
  const [deleteSortie, { isLoading: deleting }] = useDeleteBoutiqueStockSortieMutation();

  const handleDelete = async () => {
    if (!deleteTarget) return;
    try {
      await deleteSortie(deleteTarget.id).unwrap();
      toast.success("Request deleted");
      setDeleteTarget(undefined);
      refetchSorties();
    } catch (err: any) {
      toast.error(err?.data?.message ?? "Failed to delete request");
    }
  };

  const { data: stockData, isLoading: stockLoading, refetch: refetchStock } =
    useGetBoutiqueStockItemsQuery({ limit: 200 });

  const { data: sortiesData, isLoading: sortiesLoading, refetch: refetchSorties } =
    useGetMyBoutiqueStockSortiesQuery({ limit: 100 });

  const allItems = stockData?.data ?? [];
  const filteredItems = allItems.filter((item) => {
    const q = search.trim().toLowerCase();
    return !q || item.itemName.toLowerCase().includes(q) || item.category.toLowerCase().includes(q);
  });

  const mySorties     = sortiesData?.data ?? [];
  console.log("[MySorties] rejected →", mySorties.filter(s => s.status === "rejected").map(s => ({ id: s.id, notes: s.notes, reason: s.reason })));
  const [requestSearch, setRequestSearch] = useState("");
  const filteredSorties = mySorties.filter((s) => {
    const q = requestSearch.trim().toLowerCase();
    if (!q) return true;
    return (
      s.stockItem?.itemName?.toLowerCase().includes(q) ||
      s.reason?.toLowerCase().includes(q) ||
      s.notes?.toLowerCase().includes(q)
    );
  });
  const pendingCount  = mySorties.filter((s) => s.status === "pending").length;
  const approvedCount = mySorties.filter((s) => s.status === "approved").length;
  const rejectedCount = mySorties.filter((s) => s.status === "rejected").length;

  return (
    <DashboardLayout notificationCount={pendingCount}>
      <div className="space-y-6 font-[family-name:var(--font-family-primary)]">

        {/* Header */}
        <div className="flex items-start justify-between gap-4">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-pink-100 flex items-center justify-center">
              <HiOutlineClipboardList className="w-5 h-5 text-pink-600" />
            </div>
            <div>
              <h1 className="text-2xl md:text-3xl font-bold text-secondary-100">Boutique Stock Requests</h1>
              <p className="text-sm text-custom-700 mt-0.5">Request items from boutique stock management</p>
            </div>
          </div>
          <div className="flex items-center gap-2">
            <button onClick={() => { refetchStock(); refetchSorties(); }}
              className="p-2 rounded-xl border border-custom-300 hover:bg-custom-100 transition-colors text-custom-700"
            >
              <HiOutlineRefresh className={`w-4 h-4 ${stockLoading || sortiesLoading ? "animate-spin" : ""}`} />
            </button>
            <button onClick={() => { setEditTarget(undefined); setShowModal(true); }} disabled={allItems.length === 0}
              className="flex items-center gap-2 px-4 py-2 rounded-xl bg-primary-500 text-white text-sm font-semibold hover:bg-primary-600 disabled:opacity-40 transition-colors"
            >
              <HiOutlinePlus className="w-4 h-4" />
              New Request
            </button>
          </div>
        </div>

        {/* Summary */}
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

          {/* Available boutique stock items */}
          <div className="space-y-3">
            <div className="flex items-center justify-between">
              <h2 className="text-sm font-bold text-secondary-100 uppercase tracking-wide">Available Boutique Stock Items</h2>
              <span className="text-xs text-custom-700">{filteredItems.length} items</span>
            </div>
            <div className="relative">
              <HiOutlineSearch className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-custom-700" />
              <input type="text" value={search} onChange={(e) => setSearch(e.target.value)} placeholder="Search items..."
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
            ) : filteredItems.length === 0 ? (
              <Card className="!p-8 text-center">
                <HiOutlineArchive className="w-8 h-8 text-custom-400 mx-auto mb-2" />
                <p className="text-sm text-secondary-100 font-semibold">No boutique stock items available</p>
                <p className="text-xs text-custom-700 mt-1">Ask the stock manager to add boutique items</p>
              </Card>
            ) : (
              <div className="space-y-2 max-h-[60vh] overflow-y-auto pr-1">
                {filteredItems.map((item) => {
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
                              <div className={`h-1.5 rounded-full ${isOut ? "bg-red-400" : isLow ? "bg-yellow-400" : "bg-emerald-400"}`}
                                style={{ width: item.alarmStock > 0 ? `${Math.min(100, Math.round((item.currentStock / (item.alarmStock * 3)) * 100))}%` : item.currentStock > 0 ? "100%" : "0%" }}
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

          {/* My requests */}
          <div className="space-y-3">
            <div className="flex items-center justify-between gap-3">
              <h2 className="text-sm font-bold text-secondary-100 uppercase tracking-wide">My Requests</h2>
              <input
                value={requestSearch}
                onChange={(e) => setRequestSearch(e.target.value)}
                placeholder="Search..."
                className="w-40 px-3 py-1.5 rounded-xl border border-custom-300 bg-style-500 text-secondary-100 text-xs focus:outline-none focus:border-primary-400 transition-colors"
              />
            </div>

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
                <button onClick={() => { setEditTarget(undefined); setShowModal(true); }} disabled={allItems.length === 0}
                  className="px-4 py-2 rounded-xl bg-primary-500 text-white text-sm font-semibold hover:bg-primary-600 disabled:opacity-40 transition-colors"
                >
                  New Request
                </button>
              </Card>
            ) : (
              <div className="space-y-3 max-h-[60vh] overflow-y-auto pr-1">
                {filteredSorties.map((sortie) => (
                  <div key={sortie.id} className="rounded-xl border border-custom-300 overflow-hidden">
                    <div className="flex items-center justify-between px-4 py-2.5 bg-custom-50 border-b border-custom-200">
                      <div className="flex items-center gap-2">
                        <p className="text-sm font-semibold text-secondary-100">
                          {sortie.stockItem?.itemName ?? "Stock Item"}
                        </p>
                        <span className={`text-xs font-bold px-2 py-0.5 rounded-full ${sortieStatusColors[sortie.status] ?? "bg-gray-100 text-gray-600"}`}>
                          {sortie.status}
                        </span>
                      </div>
                      <div className="flex items-center gap-2">
                        <span className="text-xs text-custom-700">
                          {new Date(sortie.createdAt).toLocaleDateString("en-RW", { day: "2-digit", month: "short" })}
                        </span>
                        {sortie.status === "pending" && (
                          <>
                            <button
                              onClick={() => { setEditTarget(sortie); setShowModal(true); }}
                              className="p-1 rounded-lg text-primary-500 hover:bg-primary-50 transition-colors"
                              title="Edit request"
                            >
                              <HiOutlinePencil className="w-4 h-4" />
                            </button>
                            <button
                              onClick={() => setDeleteTarget(sortie)}
                              className="p-1 rounded-lg text-red-500 hover:bg-red-50 transition-colors"
                              title="Delete request"
                            >
                              <HiOutlineTrash className="w-4 h-4" />
                            </button>
                          </>
                        )}
                      </div>
                    </div>
                    <div className="px-4 py-2.5 flex items-center gap-4 text-sm">
                      <span className="text-custom-700">Qty: <span className="font-bold text-secondary-100">{parseFloat(sortie.quantityOut)}</span></span>
                      {sortie.stockItem?.unit && <span className="text-custom-700 text-xs">{sortie.stockItem.unit}</span>}
                      {sortie.reason && <span className="text-xs text-custom-700 truncate flex-1">"{sortie.reason}"</span>}
                    </div>
                    {sortie.status === "approved" && (
                      <div className="px-4 py-2 bg-emerald-50 border-t border-emerald-100 flex items-center gap-2">
                        <HiOutlineCheckCircle className="w-4 h-4 text-emerald-600 flex-shrink-0" />
                        <p className="text-xs font-semibold text-emerald-700">Approved — waiting for stock manager to hand out</p>
                      </div>
                    )}
                    {sortie.status === "taken" && (
                      <div className="px-4 py-2 bg-blue-50 border-t border-blue-100 flex items-center gap-2">
                        <HiOutlineCheckCircle className="w-4 h-4 text-blue-600 flex-shrink-0" />
                        <p className="text-xs font-semibold text-blue-700">Collected — items have been given to you from stock</p>
                      </div>
                    )}
                    {sortie.status === "rejected" && (
                      <div className="px-4 py-2 bg-red-50 border-t border-red-100">
                        <p className="text-xs font-semibold text-red-700">Request was rejected</p>
                        {sortie.notes && (
                          <p className="text-xs text-red-600 mt-0.5 italic">"{sortie.notes}"</p>
                        )}
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
          items={stockData?.data ?? []}
          onClose={() => { setShowModal(false); setEditTarget(undefined); }}
          onSuccess={() => { setShowModal(false); setEditTarget(undefined); refetchSorties(); }}
          editTarget={editTarget}
        />
      )}

      {deleteTarget && (
        <div className="fixed inset-0 bg-secondary-100/50 z-50 flex items-center justify-center p-4">
          <Card className="!p-6 max-w-sm w-full">
            <div className="flex items-center gap-3 mb-4">
              <div className="w-10 h-10 rounded-xl bg-red-100 flex items-center justify-center flex-shrink-0">
                <HiOutlineTrash className="w-5 h-5 text-red-600" />
              </div>
              <div>
                <h3 className="text-base font-bold text-secondary-100">Delete Request</h3>
                <p className="text-xs text-custom-700 mt-0.5">This action cannot be undone</p>
              </div>
            </div>
            <p className="text-sm text-secondary-100 mb-6">
              Are you sure you want to delete the request for{" "}
              <span className="font-semibold">{deleteTarget.stockItem?.itemName ?? "this item"}</span>?
            </p>
            <div className="flex gap-3 justify-end">
              <button
                onClick={() => setDeleteTarget(undefined)}
                className="px-4 py-2 rounded-xl border border-custom-300 text-sm font-semibold text-secondary-100 hover:bg-custom-100 transition-colors"
              >Cancel</button>
              <button
                onClick={handleDelete}
                disabled={deleting}
                className="px-4 py-2 rounded-xl bg-red-500 text-white text-sm font-semibold hover:bg-red-600 disabled:opacity-40 transition-colors"
              >{deleting ? "Deleting..." : "Delete"}</button>
            </div>
          </Card>
        </div>
      )}
    </DashboardLayout>
  );
}
