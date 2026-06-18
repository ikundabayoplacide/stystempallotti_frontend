import { useState } from "react";
import {
  HiOutlineCheckCircle,
  HiOutlineClock,
  HiOutlineX,
  HiOutlineXCircle,
} from "react-icons/hi";
import { toast } from "react-toastify";
import { DashboardLayout } from "../../components";
import { Card } from "../../components/ui";
import {
  useGetStockSortiesQuery,
  useApproveSortieMutation,
  useRejectSortieMutation,
  type SortieStatus,
  type StockSortie,
} from "../../store/services/stockService";

type RoleFilter = "all" | "RECEPTIONIST" | "HOBE";

const statusConfig: Record<SortieStatus, { label: string; color: string; icon: any; bgColor: string }> = {
  pending:  { label: "Pending",  color: "text-yellow-600", icon: HiOutlineClock,       bgColor: "bg-yellow-100" },
  approved: { label: "Approved", color: "text-green-600",  icon: HiOutlineCheckCircle, bgColor: "bg-green-100"  },
  rejected: { label: "Rejected", color: "text-red-600",    icon: HiOutlineXCircle,     bgColor: "bg-red-100"    },
};

export default function MaterialRequestsPage() {
  const [statusFilter, setStatusFilter] = useState<"all" | SortieStatus>("all");
  const [roleFilter, setRoleFilter]     = useState<RoleFilter>("all");
  const [selected, setSelected]         = useState<StockSortie | null>(null);
  const [rejectNotes, setRejectNotes]   = useState("");
  const [actingId, setActingId]         = useState<string | null>(null);

  const queryParams = {
    limit: 200,
    ...(roleFilter !== "all" ? { requesterRole: roleFilter } : {}),
  };

  const { data: sortiesData, isLoading, error, isFetching } = useGetStockSortiesQuery(queryParams);
  const all = sortiesData?.data ?? [];

  console.log("[MaterialRequestsPage] queryParams →", queryParams);
  console.log("[MaterialRequestsPage] raw sortiesData →", sortiesData);
  console.log("[MaterialRequestsPage] all sorties count →", all.length);
  console.log("[MaterialRequestsPage] isLoading:", isLoading, "| isFetching:", isFetching, "| error:", error);
  console.log("[MaterialRequestsPage] sorties detail →", all.map((s) => ({
    id: s.id,
    item: s.stockItem?.itemName ?? s.stockItemId,
    status: s.status,
    requester: s.requester,
    quantityOut: s.quantityOut,
    reason: s.reason,
  })));

  const pendingCount = all.filter((s) => s.status === "pending").length;
  const filtered = statusFilter === "all" ? all : all.filter((s) => s.status === statusFilter);
  console.log("[MaterialRequestsPage] statusFilter:", statusFilter, "| roleFilter:", roleFilter, "| filtered count:", filtered.length);

  const [approve] = useApproveSortieMutation();
  const [reject]  = useRejectSortieMutation();

  const handleApprove = async (id: string) => {
    setActingId(id);
    try {
      await approve(id).unwrap();
      toast.success("Request approved.");
      setSelected(null);
    } catch (err: any) {
      toast.error(err?.data?.message ?? "Failed to approve.");
    } finally {
      setActingId(null);
    }
  };

  const handleReject = async (id: string) => {
    if (!rejectNotes.trim()) { toast.error("Rejection reason is required."); return; }
    setActingId(id);
    try {
      await reject(id).unwrap();
      toast.success("Request rejected.");
      setSelected(null);
      setRejectNotes("");
    } catch (err: any) {
      toast.error(err?.data?.message ?? "Failed to reject.");
    } finally {
      setActingId(null);
    }
  };

  return (
    <DashboardLayout userRole="stock" userName="Stock Manager" notificationCount={pendingCount}>
      <div className="space-y-6 font-[family-name:var(--font-family-primary)]">

        {/* Header */}
        <div>
          <h1 className="text-2xl md:text-3xl font-bold text-secondary-100">Stock Requests</h1>
          <p className="text-sm text-custom-700 mt-1">
            {pendingCount > 0 ? `${pendingCount} request${pendingCount > 1 ? "s" : ""} pending approval` : "All requests processed"}
          </p>
        </div>

        {/* Role Filter */}
        <div className="flex gap-2">
          {(["all", "RECEPTIONIST", "HOBE"] as const).map((r) => (
            <button
              key={r}
              onClick={() => setRoleFilter(r)}
              className={`px-4 py-2 rounded-xl text-sm font-semibold transition-colors ${
                roleFilter === r ? "bg-secondary-100 text-white" : "border border-custom-300 text-custom-700 hover:bg-custom-100"
              }`}
            >
              {r === "all" ? "All Roles" : r.charAt(0) + r.slice(1).toLowerCase()}
            </button>
          ))}
        </div>

        {/* Status Filter Tabs */}
        <div className="flex gap-2 overflow-x-auto">
          {(["all", "pending", "approved", "rejected"] as const).map((f) => (
            <button
              key={f}
              onClick={() => setStatusFilter(f)}
              className={`px-4 py-2 rounded-xl transition-colors text-sm font-semibold whitespace-nowrap ${
                statusFilter === f ? "bg-primary-500 text-white" : "border border-custom-300 text-custom-700 hover:bg-custom-100"
              }`}
            >
              {f.charAt(0).toUpperCase() + f.slice(1)}
              {f === "pending" && pendingCount > 0 && ` (${pendingCount})`}
            </button>
          ))}
        </div>

        {/* Table */}
        <Card className="!p-0 overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead className="bg-custom-100 border-b border-custom-300">
                <tr>
                  <th className="px-4 py-3 text-left text-xs font-bold text-secondary-100 uppercase">Item</th>
                  <th className="px-4 py-3 text-left text-xs font-bold text-secondary-100 uppercase">Requested By</th>
                  <th className="px-4 py-3 text-left text-xs font-bold text-secondary-100 uppercase">Role</th>
                  <th className="px-4 py-3 text-left text-xs font-bold text-secondary-100 uppercase">Qty</th>
                  <th className="px-4 py-3 text-left text-xs font-bold text-secondary-100 uppercase">Reason</th>
                  <th className="px-4 py-3 text-left text-xs font-bold text-secondary-100 uppercase">Status</th>
                  <th className="px-4 py-3 text-left text-xs font-bold text-secondary-100 uppercase">Date</th>
                  <th className="px-4 py-3 text-right text-xs font-bold text-secondary-100 uppercase">Actions</th>
                </tr>
              </thead>
              <tbody className="bg-white divide-y divide-custom-200">
                {isLoading ? (
                  <tr><td colSpan={8} className="px-4 py-8 text-center text-custom-700">Loading...</td></tr>
                ) : filtered.length === 0 ? (
                  <tr><td colSpan={8} className="px-4 py-8 text-center text-custom-700">No requests found.</td></tr>
                ) : filtered.map((req) => {
                  const cfg = statusConfig[req.status];
                  const Icon = cfg.icon;
                  return (
                    <tr key={req.id} className="hover:bg-custom-50 transition-colors">
                      <td className="px-4 py-4 text-sm font-bold text-primary-600">
                        {req.stockItem?.itemName ?? req.stockItemId}
                      </td>
                      <td className="px-4 py-4 text-sm text-secondary-100">
                        {req.requester?.name ?? req.requestedBy?.name ?? "—"}
                      </td>
                      <td className="px-4 py-4">
                        {(() => {
                          const role = req.requester?.role ?? req.requestedBy?.role;
                          if (!role) return <span className="text-xs text-custom-400">—</span>;
                          const isHobe = role.toUpperCase() === "HOBE";
                          return (
                            <span className={`text-xs font-bold px-2 py-0.5 rounded-full ${
                              isHobe ? "bg-orange-100 text-orange-700" : "bg-blue-100 text-blue-700"
                            }`}>
                              {isHobe ? "Hobe" : "Receptionist"}
                            </span>
                          );
                        })()}
                      </td>
                      <td className="px-4 py-4 text-sm text-secondary-100">
                        {parseFloat(req.quantityOut)} {req.stockItem?.unit}
                      </td>
                      <td className="px-4 py-4 text-xs text-custom-700 max-w-[140px] truncate">{req.reason ?? req.notes ?? "—"}</td>
                      <td className="px-4 py-4">
                        <div className="flex items-center gap-1">
                          <Icon className={`w-4 h-4 ${cfg.color}`} />
                          <span className={`text-xs font-bold px-2 py-0.5 rounded-full ${cfg.bgColor} ${cfg.color}`}>{cfg.label}</span>
                        </div>
                      </td>
                      <td className="px-4 py-4 text-sm text-custom-700">{new Date(req.createdAt).toLocaleDateString()}</td>
                      <td className="px-4 py-4">
                        <div className="flex items-center justify-end gap-2">
                          {req.status === "pending" ? (
                            <>
                              <button
                                onClick={() => handleApprove(req.id)}
                                disabled={actingId === req.id}
                                className="px-3 py-1.5 rounded-lg bg-green-500 text-white hover:bg-green-600 text-xs font-semibold disabled:opacity-50"
                              >
                                {actingId === req.id ? "..." : "Approve"}
                              </button>
                              <button
                                onClick={() => { setSelected(req); setRejectNotes(""); }}
                                disabled={actingId === req.id}
                                className="px-3 py-1.5 rounded-lg border border-red-300 text-red-600 hover:bg-red-50 text-xs font-semibold disabled:opacity-40"
                              >
                                Reject
                              </button>
                            </>
                          ) : (
                            <button
                              onClick={() => setSelected(req)}
                              className="px-3 py-1.5 rounded-lg border border-custom-300 text-custom-700 hover:bg-custom-100 text-xs font-semibold"
                            >
                              Details
                            </button>
                          )}
                        </div>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        </Card>

        {/* Detail / Reject Modal */}
        {selected && (
          <div className="fixed inset-0 bg-black/40 z-50 flex items-center justify-center p-4">
            <Card className="!p-6 w-full max-w-md max-h-[90vh] overflow-y-auto">
              <div className="flex items-center justify-between mb-4">
                <div>
                  <h3 className="text-lg font-bold text-secondary-100">
                    {selected.stockItem?.itemName ?? selected.stockItemId}
                  </h3>
                  <span className={`text-xs font-bold px-2 py-0.5 rounded-full ${statusConfig[selected.status].bgColor} ${statusConfig[selected.status].color}`}>
                    {statusConfig[selected.status].label}
                  </span>
                </div>
                <button onClick={() => setSelected(null)} className="text-custom-700 hover:text-secondary-100">
                  <HiOutlineX className="w-5 h-5" />
                </button>
              </div>

              <div className="space-y-3 text-sm mb-4">
                <div className="flex justify-between">
                  <span className="text-custom-700">Requested By</span>
                  <span className="font-semibold">{selected.requester?.name ?? selected.requestedBy?.name ?? "—"}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-custom-700">Role</span>
                  <span className="font-semibold">
                    {(() => {
                      const role = selected.requester?.role ?? selected.requestedBy?.role;
                      if (!role) return "—";
                      const isHobe = role.toUpperCase() === "HOBE";
                      return isHobe ? "Hobe" : "Receptionist";
                    })()}
                  </span>
                </div>
                <div className="flex justify-between">
                  <span className="text-custom-700">Quantity</span>
                  <span className="font-semibold">{parseFloat(selected.quantityOut)} {selected.stockItem?.unit}</span>
                </div>
                {selected.reason && (
                  <div><p className="text-custom-700 mb-1">Reason</p><p>{selected.reason}</p></div>
                )}
                {selected.notes && (
                  <div><p className="text-custom-700 mb-1">Notes</p><p>{selected.notes}</p></div>
                )}
              </div>

              {selected.status === "pending" && (
                <>
                  <div className="mb-4">
                    <label className="block text-sm font-semibold text-custom-700 mb-1">Rejection Reason</label>
                    <textarea
                      value={rejectNotes}
                      onChange={(e) => setRejectNotes(e.target.value)}
                      rows={3}
                      placeholder="Required for rejection..."
                      className="w-full px-3 py-2 rounded-xl border border-custom-300 focus:outline-none focus:border-primary-500 resize-none text-sm"
                    />
                  </div>
                  <div className="flex gap-3">
                    <button
                      onClick={() => handleApprove(selected.id)}
                      disabled={actingId === selected.id}
                      className="flex-1 py-2 rounded-xl bg-green-500 text-white hover:bg-green-600 text-sm font-semibold disabled:opacity-40"
                    >
                      {actingId === selected.id ? "Approving..." : "Approve"}
                    </button>
                    <button
                      onClick={() => handleReject(selected.id)}
                      disabled={actingId === selected.id || !rejectNotes.trim()}
                      className="flex-1 py-2 rounded-xl border border-red-300 text-red-600 hover:bg-red-50 text-sm font-semibold disabled:opacity-40"
                    >
                      {actingId === selected.id ? "Rejecting..." : "Reject"}
                    </button>
                  </div>
                </>
              )}
            </Card>
          </div>
        )}
      </div>
    </DashboardLayout>
  );
}
