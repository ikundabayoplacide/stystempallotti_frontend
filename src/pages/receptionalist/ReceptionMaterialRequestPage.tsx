import { useState, useEffect, useRef, useCallback } from "react";
import ReactDOM from "react-dom";
import {
  HiOutlineClipboardList,
  HiOutlineCheckCircle,
  HiOutlineClock,
  HiOutlineXCircle,
  HiOutlinePlus,
  HiOutlineTrash,
  HiOutlinePencil,
  HiOutlineEye,
  HiOutlineRefresh,
  HiOutlineSearch,
  HiOutlineX,
  HiOutlineDotsVertical,
  HiOutlineDocumentText,
  HiOutlineCurrencyDollar,
} from "react-icons/hi";
import { DashboardLayout } from "../../components";
import { Card } from "../../components/ui";
import { useAppSelector } from "../../store/hooks";
import {
  useCreateReceptionRequestMutation,
  useGetMyReceptionRequestsQuery,
  useGetAllReceptionRequestsQuery,
  useUpdateReceptionRequestMutation,
  useDeleteReceptionRequestMutation,
  useApproveReceptionRequestMutation,
  useRejectReceptionRequestMutation,
  type ReceptionRequest,
  type ReceptionRequestStatus,
  type ReceptionRequestItemInput,
} from "../../store/services/receptionRequestsService";

// ─── Helpers ─────────────────────────────────────────────────────────────────

const statusConfig: Record<
  ReceptionRequestStatus,
  { label: string; bg: string; color: string; icon: React.ElementType }
> = {
  pending:  { label: "Pending",  bg: "bg-yellow-100", color: "text-yellow-700", icon: HiOutlineClock },
  approved: { label: "Approved", bg: "bg-green-100",  color: "text-green-700",  icon: HiOutlineCheckCircle },
  rejected: { label: "Rejected", bg: "bg-red-100",    color: "text-red-700",    icon: HiOutlineXCircle },
};

function fmt(n: string | number) {
  return Number(n).toLocaleString();
}

function emptyItem(): ReceptionRequestItemInput {
  return { itemName: "", description: "", quantity: 1, unit: "", unitPrice: 0 };
}

// ─── Status Badge ─────────────────────────────────────────────────────────────

function StatusBadge({ status }: { status: ReceptionRequestStatus }) {
  const cfg = statusConfig[status];
  const Icon = cfg.icon;
  return (
    <span className={`inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-xs font-semibold ${cfg.bg} ${cfg.color}`}>
      <Icon className="w-3.5 h-3.5" />
      {cfg.label}
    </span>
  );
}

// ─── Item Row ─────────────────────────────────────────────────────────────────

interface ItemRowProps {
  item: ReceptionRequestItemInput;
  index: number;
  onChange: (index: number, field: keyof ReceptionRequestItemInput, value: string | number) => void;
  onRemove: (index: number) => void;
  canRemove: boolean;
}

function ItemRow({ item, index, onChange, onRemove, canRemove }: ItemRowProps) {
  const total = (item.quantity || 0) * (item.unitPrice || 0);
  return (
    <div className="rounded-xl border border-custom-200 bg-custom-50 p-4 space-y-3">
      <div className="flex items-center justify-between mb-1">
        <span className="text-xs font-bold text-custom-500 uppercase tracking-wide">Item #{index + 1}</span>
        {canRemove && (
          <button
            type="button"
            onClick={() => onRemove(index)}
            className="p-1 rounded-lg text-red-400 hover:bg-red-50 hover:text-red-600 transition-colors"
          >
            <HiOutlineTrash className="w-4 h-4" />
          </button>
        )}
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
        <div>
          <label className="block text-xs font-semibold text-custom-700 mb-1">Item Name *</label>
          <input
            type="text"
            required
            value={item.itemName}
            onChange={(e) => onChange(index, "itemName", e.target.value)}
            placeholder="e.g. A4 Paper"
            className="w-full px-3 py-2 rounded-xl border border-custom-300 bg-style-500 text-secondary-100 text-sm placeholder:text-custom-500 focus:outline-none focus:border-primary-400 focus:ring-2 focus:ring-primary-200"
          />
        </div>
        <div>
          <label className="block text-xs font-semibold text-custom-700 mb-1">Unit *</label>
          <input
            type="text"
            required
            value={item.unit}
            onChange={(e) => onChange(index, "unit", e.target.value)}
            placeholder="e.g. reams, boxes"
            className="w-full px-3 py-2 rounded-xl border border-custom-300 bg-style-500 text-secondary-100 text-sm placeholder:text-custom-500 focus:outline-none focus:border-primary-400 focus:ring-2 focus:ring-primary-200"
          />
        </div>
        <div>
          <label className="block text-xs font-semibold text-custom-700 mb-1">Quantity *</label>
          <input
            type="number"
            required
            min={1}
            value={item.quantity}
            onChange={(e) => onChange(index, "quantity", Number(e.target.value))}
            className="w-full px-3 py-2 rounded-xl border border-custom-300 bg-style-500 text-secondary-100 text-sm focus:outline-none focus:border-primary-400 focus:ring-2 focus:ring-primary-200"
          />
        </div>
        <div>
          <label className="block text-xs font-semibold text-custom-700 mb-1">Unit Price (RWF) *</label>
          <input
            type="number"
            required
            min={0}
            value={item.unitPrice}
            onChange={(e) => onChange(index, "unitPrice", Number(e.target.value))}
            className="w-full px-3 py-2 rounded-xl border border-custom-300 bg-style-500 text-secondary-100 text-sm focus:outline-none focus:border-primary-400 focus:ring-2 focus:ring-primary-200"
          />
        </div>
        <div className="sm:col-span-2">
          <label className="block text-xs font-semibold text-custom-700 mb-1">Description (optional)</label>
          <input
            type="text"
            value={item.description ?? ""}
            onChange={(e) => onChange(index, "description", e.target.value)}
            placeholder="Optional details"
            className="w-full px-3 py-2 rounded-xl border border-custom-300 bg-style-500 text-secondary-100 text-sm placeholder:text-custom-500 focus:outline-none focus:border-primary-400 focus:ring-2 focus:ring-primary-200"
          />
        </div>
      </div>

      <div className="flex items-center justify-end gap-2 pt-1 border-t border-custom-200">
        <span className="text-xs text-custom-700">Total:</span>
        <span className="text-sm font-bold text-primary-600">{fmt(total)} RWF</span>
      </div>
    </div>
  );
}

// ─── Create / Edit Modal ──────────────────────────────────────────────────────

interface RequestFormModalProps {
  existing?: ReceptionRequest | null;
  onClose: () => void;
  onSaved: () => void;
}

function RequestFormModal({ existing, onClose, onSaved }: RequestFormModalProps) {
  const [notes, setNotes] = useState(existing?.notes ?? "");
  const [items, setItems] = useState<ReceptionRequestItemInput[]>(
    existing?.items.length
      ? existing.items.map((it) => ({
          itemName:    it.itemName,
          description: it.description ?? "",
          quantity:    Number(it.quantity),
          unit:        it.unit,
          unitPrice:   Number(it.unitPrice),
        }))
      : [emptyItem()]
  );

  const [createRequest, { isLoading: creating }] = useCreateReceptionRequestMutation();
  const [updateRequest, { isLoading: updating }] = useUpdateReceptionRequestMutation();
  const isLoading = creating || updating;

  const handleItemChange = useCallback(
    (index: number, field: keyof ReceptionRequestItemInput, value: string | number) => {
      setItems((prev) => prev.map((it, i) => (i === index ? { ...it, [field]: value } : it)));
    },
    []
  );

  const handleRemoveItem = useCallback((index: number) => {
    setItems((prev) => prev.filter((_, i) => i !== index));
  }, []);

  const grandTotal = items.reduce((sum, it) => sum + (it.quantity || 0) * (it.unitPrice || 0), 0);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    const payload = { notes: notes.trim() || undefined, items };
    try {
      if (existing) {
        await updateRequest({ id: existing.id, ...payload }).unwrap();
      } else {
        await createRequest(payload).unwrap();
      }
      onSaved();
      onClose();
    } catch {
      alert(existing ? "Failed to update request." : "Failed to submit request.");
    }
  };

  return (
    <div className="fixed inset-0 bg-secondary-100/50 z-50 flex items-center justify-center p-4">
      <div className="w-full max-w-2xl flex flex-col" style={{ maxHeight: "92vh" }}>
        <Card className="!p-0 overflow-hidden flex flex-col h-full">
          <div className="flex items-center justify-between px-6 py-4 border-b border-custom-300 shrink-0">
            <div className="flex items-center gap-3">
              <HiOutlineClipboardList className="w-5 h-5 text-primary-500" />
              <h3 className="text-lg font-bold text-secondary-100">
                {existing ? "Edit Request" : "New Material Request"}
              </h3>
            </div>
            <button
              type="button"
              onClick={onClose}
              className="p-1.5 rounded-lg hover:bg-custom-100 text-custom-700 hover:text-secondary-100 transition-colors"
            >
              <HiOutlineX className="w-5 h-5" />
            </button>
          </div>

          <form id="reception-request-form" onSubmit={handleSubmit} className="flex-1 overflow-y-auto min-h-0">
            <div className="px-6 py-5 space-y-5">
              <div>
                <label className="block text-xs font-semibold text-custom-700 mb-1">General Notes (optional)</label>
                <textarea
                  rows={2}
                  value={notes}
                  onChange={(e) => setNotes(e.target.value)}
                  placeholder="Any additional context for this request..."
                  className="w-full px-3 py-2 rounded-xl border border-custom-300 bg-style-500 text-secondary-100 text-sm placeholder:text-custom-500 focus:outline-none focus:border-primary-400 focus:ring-2 focus:ring-primary-200 resize-none"
                />
              </div>

              <div>
                <div className="flex items-center justify-between mb-3">
                  <span className="text-sm font-bold text-secondary-100">Items</span>
                  <button
                    type="button"
                    onClick={() => setItems((prev) => [...prev, emptyItem()])}
                    className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-primary-50 border border-primary-200 text-primary-600 hover:bg-primary-100 transition-colors text-xs font-semibold"
                  >
                    <HiOutlinePlus className="w-3.5 h-3.5" />
                    Add Item
                  </button>
                </div>
                <div className="space-y-3">
                  {items.map((item, i) => (
                    <ItemRow
                      key={i}
                      index={i}
                      item={item}
                      onChange={handleItemChange}
                      onRemove={handleRemoveItem}
                      canRemove={items.length > 1}
                    />
                  ))}
                </div>
              </div>

              <div className="flex items-center justify-end gap-3 p-3 rounded-xl bg-primary-50 border border-primary-200">
                <HiOutlineCurrencyDollar className="w-5 h-5 text-primary-600" />
                <span className="text-sm font-semibold text-custom-700">Grand Total:</span>
                <span className="text-lg font-bold text-primary-600">{fmt(grandTotal)} RWF</span>
              </div>
            </div>
          </form>

          <div className="px-6 py-4 border-t border-custom-300 shrink-0 flex gap-3">
            <button
              type="submit"
              form="reception-request-form"
              disabled={isLoading}
              className="flex-1 px-4 py-2 rounded-xl bg-primary-500 text-white hover:bg-primary-600 disabled:opacity-60 transition-colors text-sm font-semibold"
            >
              {isLoading ? "Saving…" : existing ? "Save Changes" : "Submit Request"}
            </button>
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2 rounded-xl bg-custom-100 text-secondary-100 hover:bg-custom-200 transition-colors text-sm font-semibold"
            >
              Cancel
            </button>
          </div>
        </Card>
      </div>
    </div>
  );
}

// ─── Details Modal ────────────────────────────────────────────────────────────

function DetailsModal({ request, onClose }: { request: ReceptionRequest; onClose: () => void }) {
  const grandTotal = request.items.reduce(
    (sum, it) => sum + Number(it.totalAmount ?? 0),
    0
  );

  return (
    <div className="fixed inset-0 bg-secondary-100/50 z-50 flex items-center justify-center p-4">
      <div className="w-full max-w-2xl flex flex-col" style={{ maxHeight: "92vh" }}>
        <Card className="!p-0 overflow-hidden flex flex-col h-full">
          <div className="flex items-center justify-between px-6 py-4 border-b border-custom-300 shrink-0">
            <div className="flex items-center gap-3">
              <HiOutlineDocumentText className="w-5 h-5 text-primary-500" />
              <div>
                <h3 className="text-lg font-bold text-secondary-100">Request Details</h3>
                <p className="text-xs text-primary-600 font-semibold">{request.requestNumber}</p>
              </div>
            </div>
            <button
              onClick={onClose}
              className="p-1.5 rounded-lg hover:bg-custom-100 text-custom-700 hover:text-secondary-100 transition-colors"
            >
              <HiOutlineX className="w-5 h-5" />
            </button>
          </div>

          <div className="flex-1 overflow-y-auto min-h-0 px-6 py-5 space-y-5">
            <div className="grid grid-cols-2 gap-4">
              <div>
                <p className="text-xs text-custom-700">Status</p>
                <StatusBadge status={request.status} />
              </div>
              <div>
                <p className="text-xs text-custom-700">Date</p>
                <p className="text-sm font-semibold text-secondary-100">
                  {new Date(request.createdAt).toLocaleDateString("en-RW", { day: "2-digit", month: "short", year: "numeric" })}
                </p>
              </div>
              <div>
                <p className="text-xs text-custom-700">Requested by</p>
                <p className="text-sm font-semibold text-secondary-100">{request.requestedBy.name}</p>
              </div>
              {request.responder && (
                <div>
                  <p className="text-xs text-custom-700">Reviewed by</p>
                  <p className="text-sm font-semibold text-secondary-100">{request.responder.name}</p>
                </div>
              )}
            </div>

            {request.notes && (
              <div>
                <p className="text-xs font-bold text-custom-700 uppercase tracking-wide mb-1">Notes</p>
                <p className="text-sm text-secondary-100">{request.notes}</p>
              </div>
            )}

            {request.responseNotes && (
              <div className={`p-3 rounded-xl border ${request.status === "approved" ? "bg-green-50 border-green-200" : "bg-red-50 border-red-200"}`}>
                <p className={`text-xs font-bold uppercase tracking-wide mb-1 ${request.status === "approved" ? "text-green-700" : "text-red-700"}`}>
                  {request.status === "approved" ? "Approval Note" : "Rejection Reason"}
                </p>
                <p className="text-sm text-secondary-100">{request.responseNotes}</p>
              </div>
            )}

            <div>
              <p className="text-xs font-bold text-custom-700 uppercase tracking-wide mb-2">Items ({request.items.length})</p>
              <div className="rounded-xl border border-custom-200 overflow-hidden">
                <table className="w-full text-sm">
                  <thead className="bg-custom-50 border-b border-custom-200">
                    <tr>
                      <th className="px-3 py-2 text-left text-xs font-bold text-secondary-100">Item</th>
                      <th className="px-3 py-2 text-right text-xs font-bold text-secondary-100">Qty</th>
                      <th className="px-3 py-2 text-right text-xs font-bold text-secondary-100">Unit Price</th>
                      <th className="px-3 py-2 text-right text-xs font-bold text-secondary-100">Total</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-custom-200">
                    {request.items.map((it) => (
                      <tr key={it.id} className="hover:bg-custom-50">
                        <td className="px-3 py-2.5">
                          <p className="font-semibold text-secondary-100">{it.itemName}</p>
                          {it.description && <p className="text-xs text-custom-700">{it.description}</p>}
                          <p className="text-xs text-custom-500">{it.unit}</p>
                        </td>
                        <td className="px-3 py-2.5 text-right text-secondary-100">{fmt(it.quantity)}</td>
                        <td className="px-3 py-2.5 text-right text-secondary-100">{fmt(it.unitPrice)}</td>
                        <td className="px-3 py-2.5 text-right font-bold text-primary-600">{fmt(it.totalAmount)}</td>
                      </tr>
                    ))}
                  </tbody>
                  <tfoot className="bg-custom-50 border-t border-custom-300">
                    <tr>
                      <td colSpan={3} className="px-3 py-2.5 text-right text-xs font-bold text-custom-700 uppercase">Grand Total</td>
                      <td className="px-3 py-2.5 text-right text-base font-bold text-primary-600">{fmt(grandTotal)} RWF</td>
                    </tr>
                  </tfoot>
                </table>
              </div>
            </div>
          </div>

          <div className="px-6 py-4 border-t border-custom-300 shrink-0">
            <button
              onClick={onClose}
              className="w-full px-4 py-2 rounded-xl bg-custom-100 text-secondary-100 hover:bg-custom-200 transition-colors text-sm font-semibold"
            >
              Close
            </button>
          </div>
        </Card>
      </div>
    </div>
  );
}

// ─── Approve / Reject Modal ───────────────────────────────────────────────────

interface ReviewModalProps {
  request: ReceptionRequest;
  mode: "approve" | "reject";
  onClose: () => void;
  onDone: () => void;
}

function ReviewModal({ request, mode, onClose, onDone }: ReviewModalProps) {
  const [responseNotes, setResponseNotes] = useState("");
  const [approve, { isLoading: approving }] = useApproveReceptionRequestMutation();
  const [reject,  { isLoading: rejecting }] = useRejectReceptionRequestMutation();
  const isLoading = approving || rejecting;

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    const payload = { id: request.id, responseNotes: responseNotes.trim() || undefined };
    try {
      if (mode === "approve") await approve(payload).unwrap();
      else                    await reject(payload).unwrap();
      onDone();
      onClose();
    } catch {
      alert(`Failed to ${mode} request.`);
    }
  };

  return (
    <div className="fixed inset-0 bg-secondary-100/50 z-50 flex items-center justify-center p-4">
      <div className="w-full max-w-md">
        <Card className="!p-0 overflow-hidden">
          <div className="flex items-center justify-between px-6 py-4 border-b border-custom-300">
            <div className="flex items-center gap-3">
              {mode === "approve"
                ? <HiOutlineCheckCircle className="w-5 h-5 text-green-600" />
                : <HiOutlineXCircle    className="w-5 h-5 text-red-600" />}
              <h3 className="text-lg font-bold text-secondary-100 capitalize">{mode} Request</h3>
            </div>
            <button onClick={onClose} className="p-1.5 rounded-lg hover:bg-custom-100 text-custom-700 transition-colors">
              <HiOutlineX className="w-5 h-5" />
            </button>
          </div>

          <form onSubmit={handleSubmit}>
            <div className="px-6 py-5 space-y-4">
              <p className="text-sm text-custom-700">
                You are about to <strong className="text-secondary-100">{mode}</strong> request{" "}
                <strong className="text-primary-600">{request.requestNumber}</strong>.
              </p>
              <div>
                <label className="block text-xs font-semibold text-custom-700 mb-1">
                  Response Notes (optional)
                </label>
                <textarea
                  rows={3}
                  value={responseNotes}
                  onChange={(e) => setResponseNotes(e.target.value)}
                  placeholder={mode === "approve" ? "e.g. Approved, proceed with purchase." : "e.g. Budget not available this month."}
                  className="w-full px-3 py-2 rounded-xl border border-custom-300 bg-style-500 text-secondary-100 text-sm placeholder:text-custom-500 focus:outline-none focus:border-primary-400 focus:ring-2 focus:ring-primary-200 resize-none"
                />
              </div>
            </div>

            <div className="px-6 py-4 border-t border-custom-300 flex gap-3">
              <button
                type="submit"
                disabled={isLoading}
                className={`flex-1 px-4 py-2 rounded-xl text-white text-sm font-semibold disabled:opacity-60 transition-colors ${
                  mode === "approve" ? "bg-green-500 hover:bg-green-600" : "bg-red-500 hover:bg-red-600"
                }`}
              >
                {isLoading ? "Processing…" : mode === "approve" ? "Approve" : "Reject"}
              </button>
              <button
                type="button"
                onClick={onClose}
                className="px-4 py-2 rounded-xl bg-custom-100 text-secondary-100 hover:bg-custom-200 transition-colors text-sm font-semibold"
              >
                Cancel
              </button>
            </div>
          </form>
        </Card>
      </div>
    </div>
  );
}

// ─── Main Page ────────────────────────────────────────────────────────────────

type ModalState =
  | { type: "create" }
  | { type: "edit";    request: ReceptionRequest }
  | { type: "details"; request: ReceptionRequest }
  | { type: "approve"; request: ReceptionRequest }
  | { type: "reject";  request: ReceptionRequest }
  | null;

export default function ReceptionMaterialRequestPage() {
  const role = useAppSelector((s) => s.auth.user?.role);
  // receptionist submits; DAF or ADMIN reviews
  const isReceptionist = role === "RECEPTIONIST";
  const isReviewer     = role === "DAF" || role === "ADMIN";

  const [statusFilter, setStatusFilter] = useState<ReceptionRequestStatus | "">("");
  const [search, setSearch]             = useState("");
  const [page, setPage]                 = useState(1);
  const [modal, setModal]               = useState<ModalState>(null);

  const [openMenuId, setOpenMenuId] = useState<string | null>(null);
  const [menuPos, setMenuPos]       = useState<{ top: number; right: number } | null>(null);
  const menuRef    = useRef<HTMLDivElement>(null);
  const triggerRef = useRef<HTMLButtonElement | null>(null);

  useEffect(() => {
    if (!openMenuId) return;
    const handler = (e: MouseEvent) => {
      if (triggerRef.current?.contains(e.target as Node)) return;
      if (menuRef.current && !menuRef.current.contains(e.target as Node)) setOpenMenuId(null);
    };
    document.addEventListener("mousedown", handler);
    return () => document.removeEventListener("mousedown", handler);
  }, [openMenuId]);

  const openMenu = useCallback((e: React.MouseEvent<HTMLButtonElement>, id: string) => {
    e.stopPropagation();
    triggerRef.current = e.currentTarget;
    if (openMenuId === id) { setOpenMenuId(null); return; }
    const rect = e.currentTarget.getBoundingClientRect();
    setMenuPos({ top: rect.bottom + 4, right: window.innerWidth - rect.right });
    setOpenMenuId(id);
  }, [openMenuId]);

  const LIMIT = 10;
  const queryParams = { status: statusFilter || undefined, page, limit: LIMIT };

  const myQuery  = useGetMyReceptionRequestsQuery(queryParams,  { skip: !isReceptionist });
  const allQuery = useGetAllReceptionRequestsQuery(queryParams, { skip: !isReviewer });

  const activeQuery = isReviewer ? allQuery : myQuery;
  const requests    = activeQuery.data?.data ?? [];
  const pagination  = activeQuery.data?.pagination;
  const isLoading   = activeQuery.isLoading;
  const isFetching  = activeQuery.isFetching;
  const refetch     = () => { try { activeQuery.refetch(); } catch { /* skipped query */ } };

  const [deleteRequest, { isLoading: deleting }] = useDeleteReceptionRequestMutation();

  const handleDelete = async (req: ReceptionRequest) => {
    if (!confirm(`Delete request ${req.requestNumber}? This cannot be undone.`)) return;
    try {
      await deleteRequest(req.id).unwrap();
      setOpenMenuId(null);
    } catch {
      alert("Failed to delete request.");
    }
  };

  const filtered = requests.filter(
    (r) =>
      r.requestNumber.toLowerCase().includes(search.toLowerCase()) ||
      r.requestedBy.name.toLowerCase().includes(search.toLowerCase()) ||
      r.items.some((it) => it.itemName.toLowerCase().includes(search.toLowerCase()))
  );

  const pending  = requests.filter((r) => r.status === "pending").length;
  const approved = requests.filter((r) => r.status === "approved").length;
  const rejected = requests.filter((r) => r.status === "rejected").length;
  const totalPages = pagination?.totalPages ?? 1;
  const closeModal = () => setModal(null);

  return (
    <DashboardLayout>
      <div className="space-y-6 font-[family-name:var(--font-family-primary)]">

        {/* Header */}
        <div className="flex items-center justify-between flex-wrap gap-3">
          <div>
            <h1 className="text-2xl md:text-3xl font-bold text-secondary-100">Material Requests</h1>
            <p className="text-sm text-custom-700 mt-1">
              {isReceptionist
                ? "Submit and track your material requests to DAF"
                : "Review and action incoming material requests from reception"}
            </p>
          </div>
          <div className="flex items-center gap-2">
            <button
              onClick={() => refetch()}
              className="flex items-center gap-2 px-3 py-2 rounded-xl border border-custom-300 hover:bg-custom-100 transition-colors text-custom-700 text-sm"
            >
              <HiOutlineRefresh className={`w-4 h-4 ${isFetching ? "animate-spin" : ""}`} />
            </button>
            {isReceptionist && (
              <button
                onClick={() => setModal({ type: "create" })}
                className="flex items-center gap-2 px-4 py-2 rounded-xl bg-primary-500 text-white hover:bg-primary-600 transition-colors text-sm font-semibold"
              >
                <HiOutlinePlus className="w-4 h-4" />
                New Request
              </button>
            )}
          </div>
        </div>

        {/* KPI Cards */}
        <div className="grid grid-cols-3 gap-4">
          {(
            [
              { label: "Pending",  count: pending,  icon: HiOutlineClock,       bg: "bg-yellow-100", color: "text-yellow-600", filter: "pending"  },
              { label: "Approved", count: approved, icon: HiOutlineCheckCircle, bg: "bg-green-100",  color: "text-green-600",  filter: "approved" },
              { label: "Rejected", count: rejected, icon: HiOutlineXCircle,     bg: "bg-red-100",    color: "text-red-600",    filter: "rejected" },
            ] as const
          ).map(({ label, count, icon: Icon, bg, color, filter }) => (
            <Card
              key={label}
              className={`!p-4 cursor-pointer hover:ring-2 transition-all ${statusFilter === filter ? "ring-2 ring-primary-400" : "hover:ring-primary-300"}`}
              onClick={() => { setStatusFilter(statusFilter === filter ? "" : filter); setPage(1); }}
            >
              <div className="flex items-center gap-3">
                <div className={`w-10 h-10 rounded-xl flex items-center justify-center ${bg}`}>
                  <Icon className={`w-5 h-5 ${color}`} />
                </div>
                <div>
                  <p className="text-xs text-custom-700">{label}</p>
                  {isLoading ? (
                    <div className="h-6 w-8 bg-custom-200 rounded animate-pulse mt-1" />
                  ) : (
                    <p className={`text-2xl font-bold ${color}`}>{count}</p>
                  )}
                </div>
              </div>
            </Card>
          ))}
        </div>

        {/* Table */}
        <Card className="!p-0 overflow-hidden">
          <div className="p-4 bg-custom-100 border-b border-custom-300 flex flex-col sm:flex-row sm:items-center justify-between gap-3">
            <div className="flex items-center gap-2">
              <h2 className="text-lg font-bold text-secondary-100">Requests</h2>
              {statusFilter && (
                <button
                  onClick={() => { setStatusFilter(""); setPage(1); }}
                  className="flex items-center gap-1 px-2 py-0.5 rounded-full bg-primary-100 text-primary-700 text-xs font-semibold hover:bg-primary-200 transition-colors"
                >
                  {statusFilter} <HiOutlineX className="w-3 h-3" />
                </button>
              )}
            </div>
            <div className="relative w-full sm:w-64">
              <HiOutlineSearch className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-custom-700" />
              <input
                type="text"
                placeholder="Search by number, name, or item…"
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                className="w-full pl-9 pr-4 py-2 rounded-xl border border-custom-300 bg-style-500 text-secondary-100 text-sm placeholder:text-custom-700 focus:outline-none focus:border-primary-400 focus:ring-2 focus:ring-primary-200"
              />
            </div>
          </div>

          <div className="overflow-x-auto">
            <table className="w-full">
              <thead className="bg-custom-50 border-b border-custom-300">
                <tr>
                  <th className="px-4 py-3 text-left text-xs font-bold text-secondary-100 uppercase">Request #</th>
                  {isReviewer && (
                    <th className="px-4 py-3 text-left text-xs font-bold text-secondary-100 uppercase">Requested by</th>
                  )}
                  <th className="px-4 py-3 text-left text-xs font-bold text-secondary-100 uppercase">Items</th>
                  <th className="px-4 py-3 text-right text-xs font-bold text-secondary-100 uppercase">Total (RWF)</th>
                  <th className="px-4 py-3 text-left text-xs font-bold text-secondary-100 uppercase">Status</th>
                  <th className="px-4 py-3 text-left text-xs font-bold text-secondary-100 uppercase">Date</th>
                  <th className="px-4 py-3 text-right text-xs font-bold text-secondary-100 uppercase">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-custom-200">
                {isLoading ? (
                  Array.from({ length: 4 }).map((_, i) => (
                    <tr key={i}>
                      <td colSpan={isReviewer ? 7 : 6} className="px-4 py-4">
                        <div className="h-5 bg-custom-100 rounded animate-pulse" />
                      </td>
                    </tr>
                  ))
                ) : filtered.length === 0 ? (
                  <tr>
                    <td colSpan={isReviewer ? 7 : 6} className="px-4 py-10 text-center text-custom-700">
                      <HiOutlineClipboardList className="w-10 h-10 mx-auto mb-2 text-custom-400" />
                      No requests found
                    </td>
                  </tr>
                ) : (
                  filtered.map((req) => {
                    const grandTotal = req.items.reduce((s, it) => s + Number(it.totalAmount ?? 0), 0);
                    const isPending  = req.status === "pending";
                    return (
                      <tr key={req.id} className="hover:bg-custom-50 transition-colors">
                        <td className="px-4 py-4">
                          <span className="text-sm font-bold text-primary-600">{req.requestNumber}</span>
                        </td>
                        {isReviewer && (
                          <td className="px-4 py-4">
                            <span className="text-sm font-semibold text-secondary-100">{req.requestedBy.name}</span>
                            <span className="block text-xs text-custom-700">{req.requestedBy.role}</span>
                          </td>
                        )}
                        <td className="px-4 py-4">
                          <span className="text-sm text-secondary-100">{req.items.length} item{req.items.length !== 1 ? "s" : ""}</span>
                          <span className="block text-xs text-custom-700 truncate max-w-[160px]">
                            {req.items.map((it) => it.itemName).join(", ")}
                          </span>
                        </td>
                        <td className="px-4 py-4 text-right font-bold text-secondary-100">
                          {fmt(grandTotal)}
                        </td>
                        <td className="px-4 py-4">
                          <StatusBadge status={req.status} />
                        </td>
                        <td className="px-4 py-4 text-sm text-custom-700">
                          {new Date(req.createdAt).toLocaleDateString("en-RW", { day: "2-digit", month: "short", year: "numeric" })}
                        </td>
                        <td className="px-4 py-4 text-right relative">
                          <button
                            onClick={(e) => openMenu(e, req.id)}
                            className="p-1.5 rounded-lg hover:bg-custom-100 text-custom-700 hover:text-secondary-100 transition-colors"
                          >
                            <HiOutlineDotsVertical className="w-4 h-4" />
                          </button>

                          {openMenuId === req.id && menuPos && ReactDOM.createPortal(
                            <div
                              ref={menuRef}
                              style={{ position: "fixed", top: menuPos.top, right: menuPos.right, zIndex: 9999 }}
                              className="w-44 rounded-xl border border-custom-300 bg-style-500 shadow-lg py-1"
                            >
                              <button
                                onClick={() => { setModal({ type: "details", request: req }); setOpenMenuId(null); }}
                                className="w-full flex items-center gap-2 px-4 py-2 text-sm text-secondary-100 hover:bg-custom-100 transition-colors"
                              >
                                <HiOutlineEye className="w-4 h-4 text-custom-700" />
                                View Details
                              </button>

                              {isReceptionist && isPending && (
                                <>
                                  <button
                                    onClick={() => { setModal({ type: "edit", request: req }); setOpenMenuId(null); }}
                                    className="w-full flex items-center gap-2 px-4 py-2 text-sm text-secondary-100 hover:bg-custom-100 transition-colors"
                                  >
                                    <HiOutlinePencil className="w-4 h-4 text-custom-700" />
                                    Edit
                                  </button>
                                  <button
                                    onClick={() => handleDelete(req)}
                                    disabled={deleting}
                                    className="w-full flex items-center gap-2 px-4 py-2 text-sm text-red-600 hover:bg-red-50 transition-colors disabled:opacity-50"
                                  >
                                    <HiOutlineTrash className="w-4 h-4" />
                                    Delete
                                  </button>
                                </>
                              )}

                              {isReviewer && isPending && (
                                <>
                                  <div className="border-t border-custom-200 my-1" />
                                  <button
                                    onClick={() => { setModal({ type: "approve", request: req }); setOpenMenuId(null); }}
                                    className="w-full flex items-center gap-2 px-4 py-2 text-sm text-green-600 hover:bg-green-50 transition-colors"
                                  >
                                    <HiOutlineCheckCircle className="w-4 h-4" />
                                    Approve
                                  </button>
                                  <button
                                    onClick={() => { setModal({ type: "reject", request: req }); setOpenMenuId(null); }}
                                    className="w-full flex items-center gap-2 px-4 py-2 text-sm text-red-600 hover:bg-red-50 transition-colors"
                                  >
                                    <HiOutlineXCircle className="w-4 h-4" />
                                    Reject
                                  </button>
                                </>
                              )}
                            </div>,
                            document.body
                          )}
                        </td>
                      </tr>
                    );
                  })
                )}
              </tbody>
            </table>
          </div>

          {totalPages > 1 && (
            <div className="p-4 border-t border-custom-200 flex items-center justify-between">
              <p className="text-xs text-custom-700">
                Page {page} of {totalPages}
                {pagination && ` · ${pagination.total} total`}
              </p>
              <div className="flex gap-2">
                <button
                  onClick={() => setPage((p) => Math.max(1, p - 1))}
                  disabled={page === 1}
                  className="px-3 py-1.5 rounded-lg border border-custom-300 text-sm text-secondary-100 disabled:opacity-40 hover:bg-custom-100 transition-colors"
                >
                  Previous
                </button>
                <button
                  onClick={() => setPage((p) => Math.min(totalPages, p + 1))}
                  disabled={page === totalPages}
                  className="px-3 py-1.5 rounded-lg border border-custom-300 text-sm text-secondary-100 disabled:opacity-40 hover:bg-custom-100 transition-colors"
                >
                  Next
                </button>
              </div>
            </div>
          )}
        </Card>

      </div>

      {/* Modals */}
      {modal?.type === "create" && (
        <RequestFormModal onClose={closeModal} onSaved={refetch} />
      )}
      {modal?.type === "edit" && (
        <RequestFormModal existing={modal.request} onClose={closeModal} onSaved={refetch} />
      )}
      {modal?.type === "details" && (
        <DetailsModal request={modal.request} onClose={closeModal} />
      )}
      {modal?.type === "approve" && (
        <ReviewModal request={modal.request} mode="approve" onClose={closeModal} onDone={refetch} />
      )}
      {modal?.type === "reject" && (
        <ReviewModal request={modal.request} mode="reject" onClose={closeModal} onDone={refetch} />
      )}
    </DashboardLayout>
  );
}
