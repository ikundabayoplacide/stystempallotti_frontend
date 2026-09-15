import { useMemo, useState } from "react";
import {
  HiOutlineArchive,
  HiOutlineBan,
  HiOutlineCheck,
  HiOutlineCheckCircle,
  HiOutlineExclamationCircle,
  HiOutlineRefresh,
  HiOutlineSearch,
} from "react-icons/hi";
import { toast } from "react-toastify";
import { DashboardLayout } from "../../components";
import { Card } from "../../components/ui";
import {
  useApproveGeneralStockSortieMutation,
  useGetGeneralStockItemsQuery,
  useGetGeneralStockSortiesQuery,
  useRejectGeneralStockSortieMutation,
  type GeneralStockSortie,
  type SortieStatus,
} from "../../store/services/generalStockService";

// ─── Helpers ──────────────────────────────────────────────────────────────────

const statusColors: Record<string, string> = {
  available:      "bg-emerald-100 text-emerald-700",
  low:            "bg-yellow-100 text-yellow-700",
  "out-of-stock": "bg-red-100 text-red-700",
};

const sortieStatusColors: Record<string, string> = {
  pending:  "bg-yellow-100 text-yellow-700",
  approved: "bg-emerald-100 text-emerald-700",
  taken:    "bg-blue-100 text-blue-700",
  rejected: "bg-red-100 text-red-700",
};

const ITEMS_PAGE_SIZE    = 10;
const SORTIES_PAGE_SIZE  = 10;

// ─── Items Tab ────────────────────────────────────────────────────────────────

function ItemsTab() {
  const [search, setSearch]             = useState("");
  const [statusFilter, setStatusFilter] = useState("");
  const [page, setPage]                 = useState(1);

  const { data, isLoading, refetch } = useGetGeneralStockItemsQuery({ limit: 500 });
  const allItems = data?.data ?? [];

  const filtered = useMemo(() => {
    const q = search.trim().toLowerCase();
    return allItems.filter((i) => {
      if (statusFilter && i.stockStatus !== statusFilter) return false;
      if (q && !i.itemName.toLowerCase().includes(q) && !i.category.toLowerCase().includes(q)) return false;
      return true;
    });
  }, [allItems, search, statusFilter]);

  const totalPages = Math.max(1, Math.ceil(filtered.length / ITEMS_PAGE_SIZE));
  const paginated  = filtered.slice((page - 1) * ITEMS_PAGE_SIZE, page * ITEMS_PAGE_SIZE);

  const available  = allItems.filter((i) => i.stockStatus === "available").length;
  const low        = allItems.filter((i) => i.stockStatus === "low").length;
  const outOfStock = allItems.filter((i) => i.stockStatus === "out-of-stock").length;

  return (
    <div className="space-y-4">
      {/* Summary cards */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
        {[
          { label: "Total Items",  value: allItems.length, color: "text-secondary-100" },
          { label: "Available",    value: available,       color: "text-emerald-600"   },
          { label: "Low Stock",    value: low,             color: "text-yellow-600"    },
          { label: "Out of Stock", value: outOfStock,      color: "text-red-600"       },
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
                {["Item Name", "Category", "Unit", "Current Stock", "Amount/Unit", "Total Value", "Alarm Level", "Status"].map((h) => (
                  <th key={h} className="px-3 py-2.5 text-left text-xs font-bold text-secondary-100 uppercase tracking-wide">
                    {h}
                  </th>
                ))}
              </tr>
            </thead>
            <tbody className="divide-y divide-custom-200">
              {isLoading ? (
                <tr>
                  <td colSpan={8} className="px-4 py-8 text-center text-custom-700 text-sm">Loading…</td>
                </tr>
              ) : filtered.length === 0 ? (
                <tr>
                  <td colSpan={8} className="px-4 py-10 text-center">
                    <HiOutlineArchive className="w-8 h-8 text-custom-400 mx-auto mb-2" />
                    <p className="text-sm text-secondary-100 font-semibold">No items found</p>
                    <p className="text-xs text-custom-700 mt-1">
                      {search || statusFilter ? "Try adjusting the search or filter." : "No general stock items yet."}
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
                  <td className="px-3 py-3 text-sm text-secondary-100">
                    {item.amountPerUnit != null ? `${Number(item.amountPerUnit).toLocaleString()} RWF` : <span className="text-custom-400">—</span>}
                  </td>
                  <td className="px-3 py-3 text-sm font-semibold text-secondary-100">
                    {item.amountPerUnit != null ? `${(Number(item.amountPerUnit) * item.currentStock).toLocaleString()} RWF` : <span className="text-custom-400">—</span>}
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
                {(page - 1) * ITEMS_PAGE_SIZE + 1}–{Math.min(page * ITEMS_PAGE_SIZE, filtered.length)}
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
  );
}

// ─── Requests Tab ─────────────────────────────────────────────────────────────

function RequestsTab() {
  const [statusFilter, setStatusFilter] = useState<SortieStatus | "">("");
  const [search, setSearch]             = useState("");
  const [page, setPage]                 = useState(1);
  const [approveTarget, setApproveTarget] = useState<GeneralStockSortie | null>(null);
  const [rejectTarget,  setRejectTarget]  = useState<GeneralStockSortie | null>(null);
  const [rejectReason,  setRejectReason]  = useState("");

  const { data, isLoading, refetch } = useGetGeneralStockSortiesQuery(
    statusFilter ? { status: statusFilter, limit: 200 } : { limit: 200 }
  );
  const [approve, { isLoading: approving }] = useApproveGeneralStockSortieMutation();
  const [reject,  { isLoading: rejecting }] = useRejectGeneralStockSortieMutation();

  const handleApprove = async () => {
    if (!approveTarget) return;
    try {
      await approve(approveTarget.id).unwrap();
      toast.success("Request approved");
      setApproveTarget(null);
    } catch (err: any) {
      toast.error(err?.data?.message ?? "Failed to approve");
    }
  };

  const handleReject = async () => {
    if (!rejectTarget) return;
    if (!rejectReason.trim()) { toast.error("Please provide a reason"); return; }
    try {
      await reject(rejectTarget.id).unwrap();
      toast.success("Request rejected");
      setRejectTarget(null);
      setRejectReason("");
    } catch (err: any) {
      toast.error(err?.data?.message ?? "Failed to reject");
    }
  };

  const filtered: GeneralStockSortie[] = (data?.data ?? []).filter((s) => {
    const q = search.trim().toLowerCase();
    return !q || s.stockItem?.itemName.toLowerCase().includes(q) || s.requester?.name.toLowerCase().includes(q);
  });

  const pending    = filtered.filter((s) => s.status === "pending").length;
  const totalPages = Math.max(1, Math.ceil(filtered.length / SORTIES_PAGE_SIZE));
  const safePage   = Math.min(page, totalPages);
  const sorties    = filtered.slice((safePage - 1) * SORTIES_PAGE_SIZE, safePage * SORTIES_PAGE_SIZE);

  return (
    <div className="space-y-4">
      {/* Filters */}
      <div className="flex flex-wrap items-center gap-3">
        <input
          value={search}
          onChange={(e) => { setSearch(e.target.value); setPage(1); }}
          placeholder="Search by item or requester..."
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
        <button
          onClick={() => refetch()}
          className="p-2 rounded-xl border border-custom-300 hover:bg-custom-100 transition-colors text-custom-700"
        >
          <HiOutlineRefresh className={`w-4 h-4 ${isLoading ? "animate-spin" : ""}`} />
        </button>
        {pending > 0 && (
          <span className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-yellow-50 border border-yellow-200 text-yellow-700 text-xs font-bold">
            <HiOutlineExclamationCircle className="w-4 h-4" />
            {pending} pending request{pending > 1 ? "s" : ""} need review
          </span>
        )}
      </div>

      {/* Request cards */}
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
            <p className="text-sm text-secondary-100 font-semibold">No stock requests found</p>
          </Card>
        ) : sorties.map((sortie) => (
          <Card key={sortie.id} className="!p-0 overflow-hidden">
            <div className="flex items-center justify-between px-4 py-3 bg-custom-50 border-b border-custom-200">
              <div className="flex items-center gap-3">
                <div>
                  <p className="text-sm font-semibold text-secondary-100">{sortie.stockItem?.itemName ?? "Stock Item"}</p>
                  <p className="text-xs text-custom-700">
                    Requested by: <span className="font-medium">{sortie.requester?.name ?? "—"}</span>
                    {" · "}{new Date(sortie.createdAt).toLocaleDateString("en-RW", { day: "2-digit", month: "short", year: "numeric" })}
                  </p>
                </div>
                <span className={`text-xs font-bold px-2 py-0.5 rounded-full ${sortieStatusColors[sortie.status] ?? "bg-gray-100 text-gray-600"}`}>
                  {sortie.status}
                </span>
              </div>
              {sortie.status === "pending" && (
                <div className="flex items-center gap-2">
                  <button
                    onClick={() => setApproveTarget(sortie)}
                    className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-emerald-500 text-white text-xs font-semibold hover:bg-emerald-600 transition-colors"
                  >
                    <HiOutlineCheck className="w-3.5 h-3.5" /> Approve
                  </button>
                  <button
                    onClick={() => { setRejectTarget(sortie); setRejectReason(""); }}
                    className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-red-500 text-white text-xs font-semibold hover:bg-red-600 transition-colors"
                  >
                    <HiOutlineBan className="w-3.5 h-3.5" /> Reject
                  </button>
                </div>
              )}
            </div>
            <div className="px-4 py-3 flex flex-wrap items-center gap-4 text-sm">
              <span className="text-custom-700">
                Qty: <span className="font-bold text-secondary-100">{parseFloat(sortie.quantityOut)} {sortie.stockItem?.unit ?? ""}</span>
              </span>
              {sortie.reason && (
                <span className="text-xs text-custom-700">Reason: <em>"{sortie.reason}"</em></span>
              )}
              {sortie.approvedBy && (
                <span className="text-xs text-custom-700">
                  Approved by: <span className="font-medium">{sortie.approvedBy.name}</span>
                </span>
              )}
            </div>
          </Card>
        ))}
      </div>

      {/* Pagination */}
      {!isLoading && filtered.length > 0 && (
        <div className="flex items-center justify-between px-1 py-2">
          <p className="text-xs text-custom-700">
            Showing{" "}
            <span className="font-semibold text-secondary-100">
              {(safePage - 1) * SORTIES_PAGE_SIZE + 1}–{Math.min(safePage * SORTIES_PAGE_SIZE, filtered.length)}
            </span>{" "}
            of <span className="font-semibold text-secondary-100">{filtered.length}</span> requests
          </p>
          <div className="flex items-center gap-1">
            <button
              onClick={() => setPage(safePage - 1)}
              disabled={safePage === 1}
              className="px-3 py-1.5 rounded-lg border border-custom-300 text-xs font-semibold text-secondary-100 hover:bg-custom-100 disabled:opacity-40 transition-colors"
            >
              Prev
            </button>
            {Array.from({ length: totalPages }, (_, i) => i + 1).map((n) => (
              <button
                key={n}
                onClick={() => setPage(n)}
                className={`w-8 h-8 rounded-lg text-xs font-bold transition-colors ${
                  n === safePage
                    ? "bg-primary-500 text-white"
                    : "border border-custom-300 text-secondary-100 hover:bg-custom-100"
                }`}
              >
                {n}
              </button>
            ))}
            <button
              onClick={() => setPage(safePage + 1)}
              disabled={safePage === totalPages}
              className="px-3 py-1.5 rounded-lg border border-custom-300 text-xs font-semibold text-secondary-100 hover:bg-custom-100 disabled:opacity-40 transition-colors"
            >
              Next
            </button>
          </div>
        </div>
      )}

      {/* Approve confirm dialog */}
      {approveTarget && (
        <div className="fixed inset-0 bg-secondary-100/50 z-50 flex items-center justify-center p-4">
          <Card className="!p-6 max-w-sm w-full">
            <div className="flex items-center gap-3 mb-4">
              <div className="w-10 h-10 rounded-xl bg-emerald-100 flex items-center justify-center flex-shrink-0">
                <HiOutlineCheck className="w-5 h-5 text-emerald-600" />
              </div>
              <div>
                <h3 className="text-base font-bold text-secondary-100">Approve Request</h3>
                <p className="text-xs text-custom-700 mt-0.5">{approveTarget.stockItem?.itemName ?? "Stock Item"}</p>
              </div>
            </div>
            <p className="text-sm text-secondary-100 mb-5">
              Approve request for{" "}
              <span className="font-bold">{parseFloat(approveTarget.quantityOut)} {approveTarget.stockItem?.unit ?? ""}</span>{" "}
              by <span className="font-bold">{approveTarget.requester?.name ?? "requester"}</span>?
            </p>
            <div className="flex gap-3 justify-end">
              <button
                onClick={() => setApproveTarget(null)}
                className="px-4 py-2 rounded-xl border border-custom-300 text-sm font-semibold text-secondary-100 hover:bg-custom-100 transition-colors"
              >
                Cancel
              </button>
              <button
                onClick={handleApprove}
                disabled={approving}
                className="px-4 py-2 rounded-xl bg-emerald-500 text-white text-sm font-semibold hover:bg-emerald-600 disabled:opacity-40 transition-colors"
              >
                {approving ? "Approving..." : "Yes, Approve"}
              </button>
            </div>
          </Card>
        </div>
      )}

      {/* Reject dialog */}
      {rejectTarget && (
        <div className="fixed inset-0 bg-secondary-100/50 z-50 flex items-center justify-center p-4">
          <Card className="!p-6 max-w-sm w-full">
            <div className="flex items-center gap-3 mb-4">
              <div className="w-10 h-10 rounded-xl bg-red-100 flex items-center justify-center flex-shrink-0">
                <HiOutlineBan className="w-5 h-5 text-red-500" />
              </div>
              <div>
                <h3 className="text-base font-bold text-secondary-100">Reject Request</h3>
                <p className="text-xs text-custom-700 mt-0.5">{rejectTarget.stockItem?.itemName ?? "Stock Item"}</p>
              </div>
            </div>
            <div className="mb-4">
              <label className="block text-xs font-semibold text-secondary-100 mb-1">Reason *</label>
              <textarea
                autoFocus
                rows={3}
                value={rejectReason}
                onChange={(e) => setRejectReason(e.target.value)}
                placeholder="e.g. Insufficient stock available..."
                className="w-full px-3 py-2 rounded-xl border border-custom-300 bg-style-500 text-secondary-100 text-sm focus:outline-none focus:border-primary-400 transition-colors resize-none"
              />
            </div>
            <div className="flex gap-3 justify-end">
              <button
                onClick={() => { setRejectTarget(null); setRejectReason(""); }}
                className="px-4 py-2 rounded-xl border border-custom-300 text-sm font-semibold text-secondary-100 hover:bg-custom-100 transition-colors"
              >
                Cancel
              </button>
              <button
                onClick={handleReject}
                disabled={rejecting}
                className="px-4 py-2 rounded-xl bg-red-500 text-white text-sm font-semibold hover:bg-red-600 disabled:opacity-40 transition-colors"
              >
                {rejecting ? "Rejecting..." : "Reject"}
              </button>
            </div>
          </Card>
        </div>
      )}
    </div>
  );
}

// ─── Main Page ────────────────────────────────────────────────────────────────

type Tab = "items" | "requests";

export default function GeneralStockPageOnPm() {
  const [tab, setTab] = useState<Tab>("items");

  const { data: pendingSortiesData } = useGetGeneralStockSortiesQuery({ status: "pending", limit: 200 });
  const pendingCount = pendingSortiesData?.data?.length ?? 0;

  return (
    <DashboardLayout>
      <div className="space-y-6 font-[family-name:var(--font-family-primary)]">

        {/* Header */}
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-xl bg-orange-100 flex items-center justify-center">
            <HiOutlineArchive className="w-5 h-5 text-orange-600" />
          </div>
          <div>
            <h1 className="text-2xl md:text-3xl font-bold text-secondary-100">General Stock</h1>
            <p className="text-sm text-custom-700 mt-0.5">View stock items and manage requests</p>
          </div>
        </div>

        {/* Tabs */}
        <div className="flex gap-1 p-1 bg-custom-100 rounded-xl w-fit">
          {([
            { id: "items",    label: "Items" },
            { id: "requests", label: "Requests", badge: pendingCount },
          ] as { id: Tab; label: string; badge?: number }[]).map(({ id, label, badge }) => (
            <button
              key={id}
              onClick={() => setTab(id)}
              className={`relative flex items-center gap-2 px-5 py-2 rounded-lg text-sm font-semibold transition-all ${
                tab === id
                  ? "bg-style-500 text-secondary-100 shadow-sm"
                  : "text-custom-700 hover:text-secondary-100"
              }`}
            >
              {label}
              {badge != null && badge > 0 && (
                <span className="inline-flex items-center justify-center w-5 h-5 rounded-full bg-yellow-400 text-white text-[10px] font-bold">
                  {badge}
                </span>
              )}
            </button>
          ))}
        </div>

        {/* Tab content */}
        {tab === "items"    && <ItemsTab />}
        {tab === "requests" && <RequestsTab />}

      </div>
    </DashboardLayout>
  );
}
