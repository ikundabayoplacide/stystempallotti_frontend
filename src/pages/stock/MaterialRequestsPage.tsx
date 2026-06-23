import { useState } from "react";
import {
  HiOutlineCheckCircle,
  HiOutlineClock,
  HiOutlineEye,
  HiOutlineThumbDown,
  HiOutlineThumbUp,
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

// ─── Status config ─────────────────────────────────────────────────────────

const statusConfig: Record<SortieStatus, { label: string; color: string; bg: string; icon: React.ElementType }> = {
  pending:  { label: "Pending",  color: "text-yellow-600", bg: "bg-yellow-100", icon: HiOutlineClock       },
  approved: { label: "Approved", color: "text-green-600",  bg: "bg-green-100",  icon: HiOutlineCheckCircle },
  rejected: { label: "Rejected", color: "text-red-600",    bg: "bg-red-100",    icon: HiOutlineXCircle     },
};

// ─── Shared detail block ───────────────────────────────────────────────────

function SortieDetail({ req }: { req: StockSortie }) {
  const cfg = statusConfig[req.status];
  const Icon = cfg.icon;
  const role = req.requester?.role ?? req.requestedBy?.role ?? "";
  const isHobe = role.toUpperCase() === "HOBE";

  return (
    <div className="space-y-4 text-sm">
      {/* Status + date */}
      <div className="flex items-center gap-2">
        <Icon className={`w-4 h-4 ${cfg.color}`} />
        <span className={`text-xs font-bold px-2.5 py-1 rounded-full ${cfg.bg} ${cfg.color}`}>{cfg.label}</span>
        <span className="text-xs text-custom-500 ml-auto">
          {new Date(req.createdAt).toLocaleDateString("en-RW", { day: "2-digit", month: "short", year: "numeric" })}
        </span>
      </div>

      {/* Item info */}
      <div className="rounded-xl bg-custom-50 border border-custom-300 p-3 space-y-1">
        <p className="text-xs font-bold text-custom-700 uppercase tracking-wide mb-1">Item</p>
        <div className="flex justify-between">
          <span className="text-custom-700">Name</span>
          <span className="font-semibold text-secondary-100">{req.stockItem?.itemName ?? req.stockItemId}</span>
        </div>
        <div className="flex justify-between">
          <span className="text-custom-700">Quantity</span>
          <span className="font-bold text-primary-500">{parseFloat(req.quantityOut)} <span className="text-xs font-normal text-custom-700">{req.stockItem?.unit}</span></span>
        </div>
        {req.stockItem?.category && (
          <div className="flex justify-between">
            <span className="text-custom-700">Category</span>
            <span className="font-semibold text-secondary-100">{req.stockItem.category}</span>
          </div>
        )}
      </div>

      {/* Requester */}
      <div className="rounded-xl bg-custom-50 border border-custom-300 p-3 space-y-1">
        <p className="text-xs font-bold text-custom-700 uppercase tracking-wide mb-1">Requested By</p>
        <div className="flex justify-between">
          <span className="text-custom-700">Name</span>
          <span className="font-semibold text-secondary-100">{req.requester?.name ?? req.requestedBy?.name ?? "—"}</span>
        </div>
        <div className="flex justify-between">
          <span className="text-custom-700">Role</span>
          <span className={`text-xs font-bold px-2 py-0.5 rounded-full ${isHobe ? "bg-orange-100 text-orange-700" : "bg-blue-100 text-blue-700"}`}>
            {isHobe ? "Hobe" : "Receptionist"}
          </span>
        </div>
      </div>

      {/* Job */}
      {req.job && (
        <div className="rounded-xl bg-custom-50 border border-custom-300 p-3 space-y-1">
          <p className="text-xs font-bold text-custom-700 uppercase tracking-wide mb-1">Job</p>
          <div className="flex justify-between">
            <span className="text-custom-700">Job #</span>
            <span className="font-semibold text-primary-500">{req.job.jobNumber}</span>
          </div>
          <div className="flex justify-between">
            <span className="text-custom-700">Title</span>
            <span className="font-semibold text-secondary-100">{req.job.title}</span>
          </div>
        </div>
      )}

      {/* Reason / Notes */}
      {(req.reason || req.notes) && (
        <div>
          <p className="text-xs font-bold text-custom-700 uppercase tracking-wide mb-1">Reason</p>
          <p className="text-secondary-100">{req.reason ?? req.notes}</p>
        </div>
      )}

      {/* Responder */}
      {req.approvedBy && (
        <div className="rounded-xl bg-custom-50 border border-custom-300 p-3 space-y-1">
          <p className="text-xs font-bold text-custom-700 uppercase tracking-wide mb-1">
            {req.status === "approved" ? "Approved" : "Rejected"} By
          </p>
          <div className="flex justify-between">
            <span className="text-custom-700">Name</span>
            <span className="font-semibold text-secondary-100">{req.approvedBy.name}</span>
          </div>
        </div>
      )}
    </div>
  );
}

// ─── View Modal ────────────────────────────────────────────────────────────

function ViewModal({ req, onClose }: { req: StockSortie; onClose: () => void }) {
  return (
    <div className="fixed inset-0 bg-black/40 z-50 flex items-center justify-center p-4">
      <div className="w-full max-w-lg max-h-[90vh] overflow-y-auto">
        <Card className="!p-6">
          <div className="flex items-center justify-between mb-5">
            <h3 className="text-lg font-bold text-secondary-100">Request Details</h3>
            <button onClick={onClose} className="text-custom-700 hover:text-secondary-100"><HiOutlineX className="w-5 h-5" /></button>
          </div>
          <SortieDetail req={req} />
          <div className="mt-5 flex justify-end">
            <button onClick={onClose} className="px-4 py-2 rounded-xl border border-custom-300 text-sm font-semibold text-custom-700 hover:bg-custom-100 transition-colors">
              Close
            </button>
          </div>
        </Card>
      </div>
    </div>
  );
}

// ─── Approve Modal ─────────────────────────────────────────────────────────

function ApproveModal({ req, onClose }: { req: StockSortie; onClose: () => void }) {
  const [approve, { isLoading }] = useApproveSortieMutation();

  const handle = async () => {
    try {
      await approve(req.id).unwrap();
      toast.success("Request approved.");
      onClose();
    } catch (err: any) {
      toast.error(err?.data?.message ?? "Failed to approve.");
    }
  };

  return (
    <div className="fixed inset-0 bg-black/40 z-50 flex items-center justify-center p-4">
      <div className="w-full max-w-lg max-h-[90vh] overflow-y-auto">
        <Card className="!p-6">
          <div className="flex items-center justify-between mb-5">
            <h3 className="text-lg font-bold text-secondary-100">Approve Request</h3>
            <button onClick={onClose} className="text-custom-700 hover:text-secondary-100"><HiOutlineX className="w-5 h-5" /></button>
          </div>
          <SortieDetail req={req} />
          <div className="mt-5 flex gap-3">
            <button onClick={onClose} className="flex-1 px-4 py-2 rounded-xl border border-custom-300 text-sm font-semibold text-custom-700 hover:bg-custom-100 transition-colors">
              Cancel
            </button>
            <button
              onClick={handle} disabled={isLoading}
              className="flex-1 flex items-center justify-center gap-2 px-4 py-2 rounded-xl bg-emerald-500 text-white text-sm font-semibold hover:bg-emerald-600 disabled:opacity-40 transition-colors"
            >
              <HiOutlineThumbUp className="w-4 h-4" />
              {isLoading ? "Approving..." : "Approve"}
            </button>
          </div>
        </Card>
      </div>
    </div>
  );
}

// ─── Reject Modal ──────────────────────────────────────────────────────────

function RejectModal({ req, onClose }: { req: StockSortie; onClose: () => void }) {
  const [notes, setNotes] = useState("");
  const [reject, { isLoading }] = useRejectSortieMutation();

  const handle = async () => {
    if (!notes.trim()) { toast.error("Rejection reason is required."); return; }
    try {
      await reject(req.id).unwrap();
      toast.success("Request rejected.");
      onClose();
    } catch (err: any) {
      toast.error(err?.data?.message ?? "Failed to reject.");
    }
  };

  return (
    <div className="fixed inset-0 bg-black/40 z-50 flex items-center justify-center p-4">
      <div className="w-full max-w-lg max-h-[90vh] overflow-y-auto">
        <Card className="!p-6">
          <div className="flex items-center justify-between mb-5">
            <h3 className="text-lg font-bold text-secondary-100">Reject Request</h3>
            <button onClick={onClose} className="text-custom-700 hover:text-secondary-100"><HiOutlineX className="w-5 h-5" /></button>
          </div>
          <SortieDetail req={req} />
          <div className="mt-4">
            <label className="block text-sm font-semibold text-secondary-100 mb-1.5">
              Rejection Reason <span className="text-red-500">*</span>
            </label>
            <textarea
              value={notes} onChange={(e) => setNotes(e.target.value)} rows={3}
              placeholder="Explain why this request is being rejected..."
              className="w-full px-3 py-2 rounded-xl border border-custom-300 bg-style-500 text-secondary-100 text-sm focus:outline-none focus:border-red-400 transition-colors resize-none"
            />
          </div>
          <div className="mt-4 flex gap-3">
            <button onClick={onClose} className="flex-1 px-4 py-2 rounded-xl border border-custom-300 text-sm font-semibold text-custom-700 hover:bg-custom-100 transition-colors">
              Cancel
            </button>
            <button
              onClick={handle} disabled={isLoading || !notes.trim()}
              className="flex-1 flex items-center justify-center gap-2 px-4 py-2 rounded-xl bg-red-500 text-white text-sm font-semibold hover:bg-red-600 disabled:opacity-40 transition-colors"
            >
              <HiOutlineThumbDown className="w-4 h-4" />
              {isLoading ? "Rejecting..." : "Reject"}
            </button>
          </div>
        </Card>
      </div>
    </div>
  );
}

// ─── Main Page ─────────────────────────────────────────────────────────────

type ModalState = { type: "view" | "approve" | "reject"; req: StockSortie } | null;
type RoleFilter = "all" | "RECEPTIONIST" | "HOBE";

export default function MaterialRequestsPage() {
  const [statusFilter, setStatusFilter] = useState<"all" | SortieStatus>("all");
  const [roleFilter, setRoleFilter]     = useState<RoleFilter>("all");
  const [modal, setModal]               = useState<ModalState>(null);

  const { data: sortiesData, isLoading } = useGetStockSortiesQuery({
    limit: 200,
    ...(roleFilter !== "all" ? { requesterRole: roleFilter } : {}),
  });

  const all = sortiesData?.data ?? [];
  const pendingCount = all.filter((s) => s.status === "pending").length;
  const filtered = statusFilter === "all" ? all : all.filter((s) => s.status === statusFilter);

  return (
    <DashboardLayout userRole="stock" userName="Stock Manager">
      <div className="space-y-6 font-[family-name:var(--font-family-primary)]">

        {/* Header */}
        <div>
          <h1 className="text-2xl md:text-3xl font-bold text-secondary-100">Stock Requests</h1>
          <p className="text-sm text-custom-700 mt-1">
            {pendingCount > 0 ? `${pendingCount} request${pendingCount > 1 ? "s" : ""} pending approval` : "All requests processed"}
          </p>
        </div>

        {/* Status Tabs + Role Filter on same line */}
        <div className="flex items-center justify-between gap-3">
          <div className="flex gap-2 overflow-x-auto">
            {(["all", "pending", "approved", "rejected"] as const).map((f) => (
              <button key={f} onClick={() => setStatusFilter(f)}
                className={`px-4 py-2 rounded-xl transition-colors text-sm font-semibold whitespace-nowrap ${
                  statusFilter === f ? "bg-primary-500 text-white" : "border border-custom-300 text-custom-700 hover:bg-custom-100"
                }`}
              >
                {f.charAt(0).toUpperCase() + f.slice(1)}
                {f === "pending" && pendingCount > 0 && ` (${pendingCount})`}
              </button>
            ))}
          </div>

          <div className="flex gap-2 flex-shrink-0">
            {(["all", "RECEPTIONIST", "HOBE"] as const).map((r) => (
              <button key={r} onClick={() => setRoleFilter(r)}
                className={`px-4 py-2 rounded-xl text-sm font-semibold transition-colors ${
                  roleFilter === r ? "bg-secondary-100 text-white" : "border border-custom-300 text-custom-700 hover:bg-custom-100"
                }`}
              >
                {r === "all" ? "All Roles" : r === "HOBE" ? "Hobe" : "Receptionist"}
              </button>
            ))}
          </div>
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
                  <th className="px-4 py-3 text-left text-xs font-bold text-secondary-100 uppercase">Status</th>
                  <th className="px-4 py-3 text-left text-xs font-bold text-secondary-100 uppercase">Date</th>
                  <th className="px-4 py-3 text-right text-xs font-bold text-secondary-100 uppercase">Actions</th>
                </tr>
              </thead>
              <tbody className="bg-white divide-y divide-custom-200">
                {isLoading ? (
                  <tr><td colSpan={7} className="px-4 py-8 text-center text-custom-700">Loading...</td></tr>
                ) : filtered.length === 0 ? (
                  <tr><td colSpan={7} className="px-4 py-8 text-center text-custom-700">No requests found.</td></tr>
                ) : filtered.map((req) => {
                  const cfg = statusConfig[req.status];
                  const Icon = cfg.icon;
                  const role = req.requester?.role ?? req.requestedBy?.role ?? "";
                  const isHobe = role.toUpperCase() === "HOBE";
                  return (
                    <tr key={req.id} className="hover:bg-custom-50 transition-colors">
                      <td className="px-4 py-3 text-sm font-bold text-primary-600">
                        {req.stockItem?.itemName ?? req.stockItemId}
                      </td>
                      <td className="px-4 py-3 text-sm text-secondary-100">
                        {req.requester?.name ?? req.requestedBy?.name ?? "—"}
                      </td>
                      <td className="px-4 py-3">
                        <span className={`text-xs font-bold px-2 py-0.5 rounded-full ${isHobe ? "bg-orange-100 text-orange-700" : "bg-blue-100 text-blue-700"}`}>
                          {isHobe ? "Hobe" : "Receptionist"}
                        </span>
                      </td>
                      <td className="px-4 py-3 text-sm text-secondary-100">
                        {parseFloat(req.quantityOut)} {req.stockItem?.unit}
                      </td>
                      <td className="px-4 py-3">
                        <span className={`inline-flex items-center gap-1 text-xs font-bold px-2.5 py-1 rounded-full ${cfg.bg} ${cfg.color}`}>
                          <Icon className="w-3.5 h-3.5" />{cfg.label}
                        </span>
                      </td>
                      <td className="px-4 py-3 text-sm text-custom-700">
                        {new Date(req.createdAt).toLocaleDateString("en-RW", { day: "2-digit", month: "short", year: "numeric" })}
                      </td>
                      <td className="px-4 py-3">
                        <div className="flex items-center justify-end gap-2">
                          <button
                            onClick={() => setModal({ type: "view", req })}
                            title="View details"
                            className="p-1.5 rounded-lg border border-custom-300 text-custom-700 hover:bg-custom-100 transition-colors"
                          >
                            <HiOutlineEye className="w-4 h-4" />
                          </button>
                          {req.status === "pending" && (
                            <>
                              <button
                                onClick={() => setModal({ type: "approve", req })}
                                title="Approve"
                                className="p-1.5 rounded-lg border border-emerald-300 text-emerald-600 hover:bg-emerald-50 transition-colors"
                              >
                                <HiOutlineThumbUp className="w-4 h-4" />
                              </button>
                              <button
                                onClick={() => setModal({ type: "reject", req })}
                                title="Reject"
                                className="p-1.5 rounded-lg border border-red-300 text-red-500 hover:bg-red-50 transition-colors"
                              >
                                <HiOutlineThumbDown className="w-4 h-4" />
                              </button>
                            </>
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
      </div>

      {modal?.type === "view"    && <ViewModal    req={modal.req} onClose={() => setModal(null)} />}
      {modal?.type === "approve" && <ApproveModal req={modal.req} onClose={() => setModal(null)} />}
      {modal?.type === "reject"  && <RejectModal  req={modal.req} onClose={() => setModal(null)} />}
    </DashboardLayout>
  );
}
