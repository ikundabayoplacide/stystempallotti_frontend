import { useState } from "react";
import { toast } from "react-toastify";
import { useAuth } from "../../context/AuthContext";
import {
  HiOutlineBadgeCheck,
  HiOutlineClock,
  HiOutlineCurrencyDollar,
  HiOutlineRefresh,
  HiOutlineSearch,
  HiOutlineTruck,
  HiOutlineUser,
  HiOutlinePhone,
  HiOutlineX,
  HiOutlineExclamationCircle,
} from "react-icons/hi";
import { DashboardLayout } from "../../components";
import { Button, Card, PhoneInput } from "../../components/ui";
import {
  useGetJobsQuery,
  useDeliverJobMutation,
  type Job,
} from "../../store/services/jobsService";
import { useGetPaymentsQuery } from "../../store/services/paymentsService";
import { useGetUnreadCountQuery } from "../../store/services/notificationsService";

// ─── Constants ────────────────────────────────────────────────────────────────

const priorityColors: Record<string, string> = {
  low: "bg-gray-100 text-gray-600",
  normal: "bg-blue-100 text-blue-600",
  high: "bg-orange-100 text-orange-600",
  urgent: "bg-red-100 text-red-600",
};

// ─── Mark Delivered Confirm Modal ─────────────────────────────────────────────

interface MarkDeliveredModalProps {
  job: Job;
  onClose: () => void;
  onSuccess: () => void;
}

function MarkDeliveredModal({ job, onClose, onSuccess }: MarkDeliveredModalProps) {
  const [deliveryType, setDeliveryType] = useState<"own" | "shipper">("own");
  const [shipperName, setShipperName] = useState("");
  const [shipperContact, setShipperContact] = useState("");
  const [quantityInput, setQuantityInput] = useState("");
  const [deliverJob, { isLoading }] = useDeliverJobMutation();

  const totalQty       = job.quantity ?? 0;
  const alreadyDelivered = job.quantityDelivered ?? 0;
  const remaining      = job.quantityRemaining ?? (totalQty - alreadyDelivered);
  const qtyNum         = parseInt(quantityInput, 10);
  const qtyValid       = !isNaN(qtyNum) && qtyNum > 0 && qtyNum <= remaining;

  const handleConfirm = async () => {
    if (!qtyValid) return;
    const isOwn = deliveryType === "own";
    try {
      await deliverJob({
        id: job.id,
        quantityDelivered: qtyNum,
        deliveredByName:    isOwn ? (job.customer?.name    ?? undefined) : shipperName.trim()    || undefined,
        deliveredByContact: isOwn ? (job.customer?.phone   ?? undefined) : shipperContact.trim() || undefined,
      }).unwrap();
      toast.success(`Delivered ${qtyNum} of job #${job.jobNumber}`);
      onSuccess();
    } catch (err: any) {
      toast.error(err?.data?.message ?? "Failed to update delivery. Please try again.");
    }
  };

  return (
    <div className="fixed inset-0 bg-secondary-100/50 z-50 flex items-center justify-center p-4">
      <Card className="!p-6 max-w-md w-full">
        <div className="flex items-center justify-between mb-4">
          <h3 className="text-lg font-bold text-secondary-100">Mark as Delivered</h3>
          <button onClick={onClose} className="text-custom-700 hover:text-secondary-100 transition-colors">
            <HiOutlineX className="w-5 h-5" />
          </button>
        </div>

        {/* Job summary */}
        <div className="rounded-xl bg-custom-100 border border-custom-300 p-4 mb-4 space-y-1.5">
          <div className="flex items-center gap-2 text-sm">
            <span className="font-mono font-bold text-primary-500">#{job.jobNumber}</span>
            <span className="text-secondary-100 font-semibold">{job.title}</span>
          </div>
          <div className="flex items-center gap-2 text-sm text-custom-700">
            <HiOutlineUser className="w-4 h-4 flex-shrink-0" />
            <span>{job.customer?.name ?? "—"}</span>
            {job.customer?.phone && <span>· {job.customer.phone}</span>}
          </div>
          {job.amount != null && (
            <div className="flex items-center gap-2 text-sm text-custom-700">
              <HiOutlineCurrencyDollar className="w-4 h-4 flex-shrink-0" />
              <span className="font-bold text-secondary-100">{job.amount.toLocaleString()} RWF</span>
            </div>
          )}
        </div>

        {/* Quantity info */}
        {totalQty > 0 && (
          <div className="grid grid-cols-3 gap-2 mb-4">
            <div className="rounded-xl bg-blue-50 border border-blue-200 p-3 text-center">
              <p className="text-xs text-blue-600 font-semibold">Total Qty</p>
              <p className="text-lg font-bold text-blue-700">{totalQty}</p>
            </div>
            <div className="rounded-xl bg-emerald-50 border border-emerald-200 p-3 text-center">
              <p className="text-xs text-emerald-600 font-semibold">Delivered</p>
              <p className="text-lg font-bold text-emerald-700">{alreadyDelivered}</p>
            </div>
            <div className="rounded-xl bg-orange-50 border border-orange-200 p-3 text-center">
              <p className="text-xs text-orange-600 font-semibold">Remaining</p>
              <p className="text-lg font-bold text-orange-700">{remaining}</p>
            </div>
          </div>
        )}

        {/* Quantity to deliver */}
        <div className="mb-4">
          <label className="block text-sm font-semibold text-secondary-100 mb-1.5">
            Quantity to Deliver <span className="text-red-500">*</span>
            {totalQty > 0 && <span className="text-xs font-normal text-custom-600 ml-1">(max {remaining})</span>}
          </label>
          <input
            type="number"
            min="1"
            max={remaining > 0 ? remaining : undefined}
            value={quantityInput}
            onChange={(e) => setQuantityInput(e.target.value)}
            placeholder={`e.g. ${remaining > 0 ? remaining : 1}`}
            className={`w-full px-3 py-2 rounded-xl border text-secondary-100 text-sm bg-style-500 focus:outline-none focus:ring-2 transition-colors ${
              quantityInput && !qtyValid
                ? "border-red-400 focus:ring-red-200"
                : "border-custom-300 focus:border-primary-400 focus:ring-primary-200"
            }`}
          />
          {quantityInput && !qtyValid && (
            <p className="text-xs text-red-500 mt-1">
              {qtyNum <= 0 ? "Must be greater than 0" : `Cannot exceed remaining quantity (${remaining})`}
            </p>
          )}
          {quantityInput && qtyValid && (
            <p className="text-xs text-emerald-600 mt-1">
              After delivery: <strong>{remaining - qtyNum}</strong> remaining
              {remaining - qtyNum === 0 && " — fully delivered ✓"}
            </p>
          )}
        </div>

        {/* Own / Shipper toggle */}
        <div className="mb-4">
          <label className="block text-sm font-semibold text-secondary-100 mb-2">Received by</label>
          <div className="flex gap-3">
            {(["own", "shipper"] as const).map((t) => (
              <button key={t} type="button" onClick={() => setDeliveryType(t)}
                className={`flex-1 py-2 rounded-xl border text-sm font-semibold transition-colors ${
                  deliveryType === t
                    ? "bg-primary-500 text-white border-primary-500"
                    : "border-custom-300 text-custom-700 hover:bg-custom-100"
                }`}>
                {t === "own" ? "Owner" : "Shipper"}
              </button>
            ))}
          </div>
        </div>

        {/* Own — pre-filled */}
        {deliveryType === "own" && (
          <div className="rounded-xl bg-custom-50 border border-custom-200 p-3 mb-5 space-y-1">
            <div className="flex items-center gap-2 text-sm text-custom-700">
              <HiOutlineUser className="w-4 h-4 shrink-0" />
              <span>{job.customer?.name ?? "—"}</span>
            </div>
            <div className="flex items-center gap-2 text-sm text-custom-700">
              <HiOutlinePhone className="w-4 h-4 shrink-0" />
              <span>{job.customer?.phone ?? "—"}</span>
            </div>
          </div>
        )}

        {/* Shipper — input fields */}
        {deliveryType === "shipper" && (
          <div className="space-y-3 mb-5">
            <div>
              <label className="block text-sm font-semibold text-secondary-100 mb-1.5">Shipper Name</label>
              <input type="text" value={shipperName} onChange={(e) => setShipperName(e.target.value)}
                placeholder="e.g. John Doe"
                className="w-full px-3 py-2 rounded-xl border border-custom-300 bg-style-500 text-secondary-100 text-sm focus:outline-none focus:border-primary-400 focus:ring-2 focus:ring-primary-200 transition-colors" />
            </div>
            <div>
              <label className="block text-sm font-semibold text-secondary-100 mb-1.5">Shipper Contact</label>
              <PhoneInput value={shipperContact} onChange={setShipperContact} />
            </div>
          </div>
        )}

        <div className="flex gap-3 justify-end">
          <Button type="button" variant="outline" onClick={onClose}>Cancel</Button>
          <Button type="button" onClick={handleConfirm} disabled={isLoading || !qtyValid}>
            {isLoading ? "Updating…" : "Confirm Delivery"}
          </Button>
        </div>
      </Card>
    </div>
  );
}

// ─── Main Page ────────────────────────────────────────────────────────────────

export default function DeliveriesPage() {
  const { userRole, userName: authUserName } = useAuth();
  const { data: unreadCount = 0 } = useGetUnreadCountQuery();
  const [search, setSearch] = useState("");
  const [deliverJob, setDeliverJob] = useState<Job | null>(null);

  const { data: confirmedData, isLoading: confirmedLoading, isFetching, refetch: refetchConfirmed } =
    useGetJobsQuery({ status: "confirmed", limit: 200, ...(search.trim() && { search: search.trim() }) });

  const { data: completedAllData, isLoading: completedAllLoading, refetch: refetchCompletedAll } =
    useGetJobsQuery({ status: "completed", limit: 200, ...(search.trim() && { search: search.trim() }) });

  const { data: partialDelivData, isLoading: partialDelivLoading, refetch: refetchPartialDeliv } =
    useGetJobsQuery({ status: "partial-delivered", limit: 200, ...(search.trim() && { search: search.trim() }) });

  const { data: readyForDelivData, isLoading: readyForDelivLoading, refetch: refetchReadyForDeliv } =
    useGetJobsQuery({ status: "ready-for-delivery", limit: 200, ...(search.trim() && { search: search.trim() }) });

  const { data: delivData, isLoading: delivLoading, refetch: refetchDeliv } =
    useGetJobsQuery({ status: "delivered", limit: 200 });

  const { data: paymentsData, refetch: refetchPayments } =
    useGetPaymentsQuery({ limit: 500 });

  const isLoading = confirmedLoading || completedAllLoading || partialDelivLoading || readyForDelivLoading || delivLoading;

  const allConfirmedCompleted = [
    ...(confirmedData?.jobs ?? []),
    ...(completedAllData?.jobs ?? []),
    ...(partialDelivData?.jobs ?? []),
    ...(readyForDelivData?.jobs ?? []),
  ];

  // 1. Ready for Delivery: confirmed|completed|partial-delivered + paid|oncredit|partial
  const readyJobs = allConfirmedCompleted.filter((j) =>
    j.paymentStatus === "paid" || j.paymentStatus === "oncredit" || j.paymentStatus === "partial"
  );

  // 2. Pending Balance: unique jobs from ONCREDIT payment records with balance > 0
  const oncreditJobIds = new Set(
    (paymentsData?.payments ?? [])
      .filter((p) => (p.paymentState === "ONCREDIT") && Number(p.balance) > 0)
      .map((p) => p.jobId)
  );
  const pendingBalanceJobs = allConfirmedCompleted.filter((j) => oncreditJobIds.has(j.id));

  // 3. Already Delivered: partial-delivered (has some qty delivered) + delivered + completed
  const delivJobs = [
    ...(partialDelivData?.jobs ?? []),
    ...(delivData?.jobs ?? []),
    ...(completedAllData?.jobs ?? []),
  ];

  const delivTotal = delivJobs.length;

  const handleDeliveredSuccess = () => {
    setDeliverJob(null);
    refetchConfirmed();
    refetchCompletedAll();
    refetchPartialDeliv();
    refetchReadyForDeliv();
    refetchDeliv();
    refetchPayments();
  };

  return (
    <DashboardLayout userRole={userRole ?? "receptionist"} userName={authUserName ?? "Reception Desk"} notificationCount={unreadCount}>
      <div className="space-y-6 font-[family-name:var(--font-family-primary)]">

        {/* ── Header ──────────────────────────────────────────────────────── */}
        <div>
          <h1 className="text-2xl md:text-3xl font-bold text-secondary-100">Deliveries</h1>
          <p className="text-sm text-custom-700 mt-1">
            Track jobs ready for handoff and confirm deliveries to clients
          </p>
        </div>

        {/* ── KPI strip ───────────────────────────────────────────────────── */}
        <div className="grid grid-cols-2 sm:grid-cols-3 gap-4">
          <Card className="!p-4">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-xl flex items-center justify-center bg-emerald-100">
                <HiOutlineTruck className="w-5 h-5 text-emerald-600" />
              </div>
              <div>
                <p className="text-xs text-custom-700">Ready for Delivery</p>
                <p className="text-2xl font-bold text-secondary-100">{readyJobs.length}</p>
              </div>
            </div>
          </Card>
          <Card className="!p-4">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-xl flex items-center justify-center bg-orange-100">
                <HiOutlineClock className="w-5 h-5 text-orange-600" />
              </div>
              <div>
                <p className="text-xs text-custom-700">Already Delivered</p>
                <p className="text-2xl font-bold text-secondary-100">{delivTotal}</p>
              </div>
            </div>
          </Card>
          <Card className="!p-4">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-xl flex items-center justify-center bg-red-100">
                <HiOutlineExclamationCircle className="w-5 h-5 text-red-500" />
              </div>
              <div>
                <p className="text-xs text-custom-700">Pending Balance</p>
                <p className="text-2xl font-bold text-secondary-100">{pendingBalanceJobs.length}</p>
              </div>
            </div>
          </Card>
        </div>

        {/* ── Ready for Delivery ───────────────────────────────────────────── */}
        <Card className="!p-0 overflow-hidden">
          <div className="px-4 py-3 border-b border-custom-200 flex flex-col sm:flex-row sm:items-center justify-between gap-3">
            <div className="flex items-center gap-2">
              <HiOutlineTruck className="w-5 h-5 text-emerald-500" />
              <h2 className="text-base font-bold text-secondary-100">Ready for Delivery</h2>
              <span className="text-xs bg-emerald-100 text-emerald-700 px-2 py-0.5 rounded-full font-semibold">
                Paid · Partial · On Credit
              </span>
            </div>
            <div className="flex gap-2">
              <div className="relative flex-1 sm:w-64">
                <HiOutlineSearch className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-custom-700" />
                <input
                  type="text"
                  placeholder="Search job # or title..."
                  value={search}
                  onChange={(e) => setSearch(e.target.value)}
                  className="w-full pl-9 pr-4 py-2 rounded-xl border border-custom-300 bg-style-500 text-secondary-100 text-sm placeholder:text-custom-700 focus:outline-none focus:border-primary-400 focus:ring-2 focus:ring-primary-200 transition-colors"
                />
              </div>
              <button onClick={() => { refetchConfirmed(); refetchCompletedAll(); refetchPartialDeliv(); refetchReadyForDeliv(); refetchDeliv(); refetchPayments(); }} className="p-2 rounded-xl border border-custom-300 hover:bg-custom-100 transition-colors" title="Refresh">
                <HiOutlineRefresh className={`w-4 h-4 text-custom-700 ${isFetching ? "animate-spin" : ""}`} />
              </button>
            </div>
          </div>

          <div className="overflow-x-auto">
            <table className="w-full">
              <thead className="bg-custom-100 border-b border-custom-300">
                <tr>
                  <th className="px-4 py-3 text-left text-xs font-bold text-secondary-100 uppercase">Job #</th>
                  <th className="px-4 py-3 text-left text-xs font-bold text-secondary-100 uppercase">Title</th>
                  <th className="px-4 py-3 text-left text-xs font-bold text-secondary-100 uppercase">Customer</th>
                  <th className="px-4 py-3 text-left text-xs font-bold text-secondary-100 uppercase">Qty</th>
                  <th className="px-4 py-3 text-left text-xs font-bold text-secondary-100 uppercase">Delivered</th>
                  <th className="px-4 py-3 text-left text-xs font-bold text-secondary-100 uppercase">Remaining</th>
                  <th className="px-4 py-3 text-left text-xs font-bold text-secondary-100 uppercase">Amount</th>
                  <th className="px-4 py-3 text-left text-xs font-bold text-secondary-100 uppercase">Payment</th>
                  <th className="px-4 py-3 text-left text-xs font-bold text-secondary-100 uppercase">Due Date</th>
                  <th className="px-4 py-3 text-right text-xs font-bold text-secondary-100 uppercase">Action</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-custom-200">
                {isLoading ? (
                  <tr><td colSpan={10} className="px-4 py-8 text-center text-custom-700">Loading...</td></tr>
                ) : readyJobs.length === 0 ? (
                  <tr><td colSpan={10} className="px-4 py-8 text-center text-custom-700">No jobs ready for delivery</td></tr>
                ) : (
                  readyJobs.map((job) => (
                    <tr key={job.id} className="hover:bg-custom-50 transition-colors">
                      <td className="px-4 py-3">
                        <span className="text-sm font-mono font-semibold text-primary-500">#{job.jobNumber}</span>
                      </td>
                      <td className="px-4 py-3">
                        <p className="text-sm font-semibold text-secondary-100">{job.title}</p>
                        {job.jobType && <p className="text-xs text-custom-700">{job.jobType}</p>}
                      </td>
                      <td className="px-4 py-3">
                        <p className="text-sm text-secondary-100">{job.customer?.name ?? "—"}</p>
                        {job.customer?.phone && <p className="text-xs text-custom-700">{job.customer.phone}</p>}
                      </td>
                      <td className="px-4 py-3">
                        <span className="text-sm font-bold text-secondary-100">
                          {job.quantity != null ? job.quantity : <span className="text-custom-400">—</span>}
                        </span>
                      </td>
                      <td className="px-4 py-3">
                        <span className="text-sm font-bold text-emerald-600">
                          {job.quantityDelivered != null ? job.quantityDelivered : <span className="text-custom-400">—</span>}
                        </span>
                      </td>
                      <td className="px-4 py-3">
                        {job.quantity != null ? (
                          <span className={`text-sm font-bold ${
                            (job.quantityRemaining ?? (job.quantity - (job.quantityDelivered ?? 0))) === 0
                              ? "text-emerald-600" : "text-orange-600"
                          }`}>
                            {job.quantityRemaining ?? (job.quantity - (job.quantityDelivered ?? 0))}
                          </span>
                        ) : <span className="text-custom-400 text-xs">—</span>}
                      </td>
                      <td className="px-4 py-3">
                        {job.amount != null ? (
                          <div className="flex flex-col gap-0.5">
                            <span className="text-sm font-bold text-secondary-100">
                              {job.amount.toLocaleString()} <span className="text-xs font-normal text-custom-700">RWF</span>
                            </span>
                            {job.paymentMethod && (
                              <span className="text-xs text-custom-700">({job.paymentMethod.replace(/_/g, " ")})</span>
                            )}
                          </div>
                        ) : (
                          <span className="text-xs text-custom-400">Not set</span>
                        )}
                      </td>
                      <td className="px-4 py-3">
                        {job.paymentStatus === "paid" && (
                          <div className="flex flex-col gap-0.5">
                            <span className="inline-flex items-center gap-1 text-xs font-bold px-2.5 py-1 rounded-full bg-emerald-100 text-emerald-700">
                              <HiOutlineBadgeCheck className="w-3.5 h-3.5" /> Paid
                            </span>
                            {job.payments?.map((p) => (
                              <span key={p.id} className="text-xs text-custom-700">
                                {p.paymentMethod.replace(/_/g, " ")}
                              </span>
                            ))}
                          </div>
                        )}
                        {job.paymentStatus === "partial" && (
                          <div className="flex flex-col gap-0.5">
                            <span className="inline-flex items-center gap-1 text-xs font-bold px-2.5 py-1 rounded-full bg-yellow-100 text-yellow-700">
                              <HiOutlineCurrencyDollar className="w-3.5 h-3.5" /> Partial
                            </span>
                            {job.payments?.map((p) => (
                              <span key={p.id} className="text-xs text-custom-700">
                                Paid: {Number(p.amountPaid ?? 0).toLocaleString()} RWF
                              </span>
                            ))}
                            <span className="text-xs font-semibold text-red-500">
                              Balance: {Number(job.payments?.find((p) => p.paymentState === "PARTIAL")?.balance ?? 0).toLocaleString()} RWF
                            </span>
                          </div>
                        )}
                        {job.paymentStatus === "oncredit" && (
                          <div className="flex flex-col gap-0.5">
                            <span className="inline-flex items-center gap-1 text-xs font-bold px-2.5 py-1 rounded-full bg-purple-100 text-purple-700">
                              <HiOutlineClock className="w-3.5 h-3.5" /> On Credit
                            </span>
                            <span className="text-xs font-semibold text-red-500">
                              Owes: {Number(job.amount ?? 0).toLocaleString()} RWF
                            </span>
                          </div>
                        )}
                      </td>
                      <td className="px-4 py-3">
                        <span className="text-xs text-custom-700">
                          {job.dueDate
                            ? new Date(job.dueDate).toLocaleDateString("en-RW", { day: "2-digit", month: "short", year: "numeric" })
                            : "—"}
                        </span>
                      </td>
                      <td className="px-4 py-3 text-right">
                        <button
                          onClick={() => setDeliverJob(job)}
                          className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-emerald-500 text-white text-xs font-semibold hover:bg-emerald-600 transition-colors"
                        >
                          <HiOutlineTruck className="w-4 h-4" />
                          Mark Delivered
                        </button>
                      </td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>


        </Card>

        {/* ── Pending Balance ──────────────────────────────────────────────── */}
        <Card className="!p-0 overflow-hidden">
          <div className="px-4 py-3 border-b border-custom-200 flex items-center gap-2">
            <HiOutlineExclamationCircle className="w-5 h-5 text-red-500" />
            <h2 className="text-base font-bold text-secondary-100">Pending Balance</h2>
            <span className="text-xs bg-red-100 text-red-700 px-2 py-0.5 rounded-full font-semibold">
              Production done · Unpaid
            </span>
          </div>
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead className="bg-custom-100 border-b border-custom-300">
                <tr>
                  <th className="px-4 py-3 text-left text-xs font-bold text-secondary-100 uppercase">Job #</th>
                  <th className="px-4 py-3 text-left text-xs font-bold text-secondary-100 uppercase">Title</th>
                  <th className="px-4 py-3 text-left text-xs font-bold text-secondary-100 uppercase">Customer</th>
                  <th className="px-4 py-3 text-left text-xs font-bold text-secondary-100 uppercase">Status</th>
                  <th className="px-4 py-3 text-left text-xs font-bold text-secondary-100 uppercase">Amount</th>
                  <th className="px-4 py-3 text-left text-xs font-bold text-secondary-100 uppercase">Due Date</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-custom-200">
                {isLoading ? (
                  <tr><td colSpan={6} className="px-4 py-8 text-center text-custom-700">Loading...</td></tr>
                ) : pendingBalanceJobs.length === 0 ? (
                  <tr><td colSpan={6} className="px-4 py-8 text-center text-custom-700">No unpaid jobs pending</td></tr>
                ) : (
                  pendingBalanceJobs.map((job) => (
                    <tr key={job.id} className="hover:bg-custom-50 transition-colors">
                      <td className="px-4 py-3">
                        <span className="text-sm font-mono font-semibold text-primary-500">#{job.jobNumber}</span>
                      </td>
                      <td className="px-4 py-3">
                        <p className="text-sm font-semibold text-secondary-100">{job.title}</p>
                        {job.jobType && <p className="text-xs text-custom-700">{job.jobType}</p>}
                      </td>
                      <td className="px-4 py-3">
                        <p className="text-sm text-secondary-100">{job.customer?.name ?? "—"}</p>
                        {job.customer?.phone && <p className="text-xs text-custom-700">{job.customer.phone}</p>}
                      </td>
                      <td className="px-4 py-3">
                        <span className="text-xs font-bold px-2.5 py-1 rounded-full bg-gray-100 text-gray-600">
                          {job.status.replace(/-/g, " ")}
                        </span>
                      </td>
                      <td className="px-4 py-3">
                        {job.amount != null ? (
                          <span className="text-sm font-bold text-red-600">
                            {job.amount.toLocaleString()} RWF
                          </span>
                        ) : <span className="text-xs text-custom-400">Not set</span>}
                      </td>
                      <td className="px-4 py-3">
                        <span className="text-xs text-custom-700">
                          {job.dueDate
                            ? new Date(job.dueDate).toLocaleDateString("en-RW", { day: "2-digit", month: "short", year: "numeric" })
                            : "—"}
                        </span>
                      </td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>
        </Card>

        {/* ── Already Delivered ────────────────────────────────────────────── */}
        <Card className="!p-0 overflow-hidden">
          <div className="px-4 py-3 border-b border-custom-200 flex flex-col sm:flex-row sm:items-center justify-between gap-3">
            <div className="flex items-center gap-2">
              <HiOutlineClock className="w-5 h-5 text-orange-500" />
              <h2 className="text-base font-bold text-secondary-100">Already Delivered</h2>
              <span className="text-xs bg-orange-100 text-orange-700 px-2 py-0.5 rounded-full font-semibold">
                delivered
              </span>
            </div>
          </div>

          <div className="overflow-x-auto">
            <table className="w-full">
              <thead className="bg-custom-100 border-b border-custom-300">
                <tr>
                  <th className="px-4 py-3 text-left text-xs font-bold text-secondary-100 uppercase">Job #</th>
                  <th className="px-4 py-3 text-left text-xs font-bold text-secondary-100 uppercase">Title</th>
                  <th className="px-4 py-3 text-left text-xs font-bold text-secondary-100 uppercase">Customer</th>
                  <th className="px-4 py-3 text-left text-xs font-bold text-secondary-100 uppercase">Status</th>
                  <th className="px-4 py-3 text-left text-xs font-bold text-secondary-100 uppercase">Received By</th>
                  <th className="px-4 py-3 text-left text-xs font-bold text-secondary-100 uppercase">Qty</th>
                  <th className="px-4 py-3 text-left text-xs font-bold text-secondary-100 uppercase">Delivered</th>
                  <th className="px-4 py-3 text-left text-xs font-bold text-secondary-100 uppercase">Remaining</th>
                  <th className="px-4 py-3 text-left text-xs font-bold text-secondary-100 uppercase">Payment</th>
                  <th className="px-4 py-3 text-left text-xs font-bold text-secondary-100 uppercase">Priority</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-custom-200">
                {isLoading ? (
                  <tr><td colSpan={10} className="px-4 py-8 text-center text-custom-700">Loading...</td></tr>
                ) : delivJobs.length === 0 ? (
                  <tr><td colSpan={10} className="px-4 py-8 text-center text-custom-700">No delivered jobs yet</td></tr>
                ) : (
                  delivJobs.map((job) => (
                    <tr key={job.id} className="hover:bg-custom-50 transition-colors">
                      <td className="px-4 py-3">
                        <span className="text-sm font-mono font-semibold text-primary-500">#{job.jobNumber}</span>
                      </td>
                      <td className="px-4 py-3">
                        <p className="text-sm font-semibold text-secondary-100">{job.title}</p>
                        {job.jobType && <p className="text-xs text-custom-700">{job.jobType}</p>}
                      </td>
                      <td className="px-4 py-3">
                        <p className="text-sm text-secondary-100">{job.customer?.name ?? "—"}</p>
                        {job.customer?.phone && <p className="text-xs text-custom-700">{job.customer.phone}</p>}
                      </td>
                      <td className="px-4 py-3">
                        {job.status === "partial-delivered" ? (
                          <span className="inline-flex items-center gap-1 text-xs font-bold px-2.5 py-1 rounded-full bg-orange-100 text-orange-700">
                            <HiOutlineTruck className="w-3.5 h-3.5" /> Partial
                          </span>
                        ) : (
                          <span className="inline-flex items-center gap-1 text-xs font-bold px-2.5 py-1 rounded-full bg-green-100 text-green-700">
                            <HiOutlineBadgeCheck className="w-3.5 h-3.5" /> Delivered
                          </span>
                        )}
                      </td>
                      <td className="px-4 py-3">
                        {job.deliveredByName ? (
                          <div>
                            <p className="text-sm text-secondary-100">{job.deliveredByName}</p>
                            {job.deliveredByContact && <p className="text-xs text-custom-700">{job.deliveredByContact}</p>}
                          </div>
                        ) : <span className="text-xs text-custom-400">—</span>}
                      </td>
                      <td className="px-4 py-3">
                        <span className="text-sm font-bold text-secondary-100">
                          {job.quantity ?? <span className="text-custom-400">—</span>}
                        </span>
                      </td>
                      <td className="px-4 py-3">
                        <span className="text-sm font-bold text-emerald-600">
                          {job.quantityDelivered ?? <span className="text-custom-400">—</span>}
                        </span>
                      </td>
                      <td className="px-4 py-3">
                        {job.quantity != null ? (
                          <span className={`text-sm font-bold ${
                            (job.quantityRemaining ?? 0) === 0 ? "text-emerald-600" : "text-orange-600"
                          }`}>
                            {job.quantityRemaining ?? (job.quantity - (job.quantityDelivered ?? 0))}
                            {(job.quantityRemaining ?? 0) === 0 && (
                              <span className="ml-1 text-xs  font-normal"></span>
                            )}
                          </span>
                        ) : <span className="text-custom-400 text-xs">—</span>}
                      </td>
                      <td className="px-4 py-3">
                        {job.paymentStatus === "paid" ? (
                          <div className="flex flex-col gap-0.5">
                            <span className="inline-flex items-center gap-1 text-xs font-bold px-2.5 py-1 rounded-full bg-emerald-100 text-emerald-700">
                              <HiOutlineBadgeCheck className="w-3.5 h-3.5" /> Paid
                            </span>
                            {job.payments?.map((p) => (
                              <span key={p.id} className="text-xs text-custom-700">
                                {p.paymentMethod.replace(/_/g, " ")} ({p.paymentState === "PARTIAL" ? "Partial" : "Full"})
                              </span>
                            ))}
                            {job.payments?.some((p) => p.paymentState === "PARTIAL") && (
                              <span className="text-xs font-semibold text-red-500">
                                Balance: {Number(job.payments.find((p) => p.paymentState === "PARTIAL")?.balance ?? 0).toLocaleString()} RWF
                              </span>
                            )}
                          </div>
                        ) : (
                          <span className="text-xs font-bold px-2.5 py-1 rounded-full bg-red-100 text-red-600">Unpaid</span>
                        )}
                      </td>
                      <td className="px-4 py-3">
                        <span className={`text-xs font-bold px-2.5 py-1 rounded-full ${priorityColors[job.priority] ?? "bg-gray-100 text-gray-600"}`}>
                          {job.priority}
                        </span>
                      </td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>


        </Card>
      </div>

      {/* ── Modals ───────────────────────────────────────────────────────── */}
      {deliverJob && (
        <MarkDeliveredModal
          job={deliverJob}
          onClose={() => setDeliverJob(null)}
          onSuccess={handleDeliveredSuccess}
        />
      )}
    </DashboardLayout>
  );
}
