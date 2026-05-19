import { useState } from "react";
import { toast } from "react-toastify";
import {
  HiOutlineBadgeCheck,
  HiOutlineBriefcase,
  HiOutlineCalendar,
  HiOutlineChevronDoubleLeft,
  HiOutlineChevronDoubleRight,
  HiOutlineChevronLeft,
  HiOutlineChevronRight,
  HiOutlineClock,
  HiOutlineCurrencyDollar,
  HiOutlineRefresh,
  HiOutlineSearch,
  HiOutlineTag,
  HiOutlineTruck,
  HiOutlineUser,
  HiOutlineX,
} from "react-icons/hi";
import { DashboardLayout } from "../../components";
import { Button, Card } from "../../components/ui";
import {
  useGetJobsQuery,
  useGetCompletedAndPaidJobsQuery,
  useDeliverJobMutation,
  useCompleteJobMutation,
  type Job,
} from "../../store/services/jobsService";

// ─── Constants ────────────────────────────────────────────────────────────────

const PAGE_SIZE_OPTIONS = [5, 10, 20];

const priorityColors: Record<string, string> = {
  low: "bg-gray-100 text-gray-600",
  normal: "bg-blue-100 text-blue-600",
  high: "bg-orange-100 text-orange-600",
  urgent: "bg-red-100 text-red-600",
};

// ─── Pagination ───────────────────────────────────────────────────────────────

interface PaginationProps {
  page: number;
  totalPages: number;
  total: number;
  pageSize: number;
  onPageChange: (p: number) => void;
  onPageSizeChange: (s: number) => void;
}

function Pagination({ page, totalPages, total, pageSize, onPageChange, onPageSizeChange }: PaginationProps) {
  const from = total === 0 ? 0 : (page - 1) * pageSize + 1;
  const to = Math.min(page * pageSize, total);
  const pages: (number | "...")[] = [];
  const addPage = (n: number) => { if (!pages.includes(n)) pages.push(n); };
  addPage(1);
  if (page - 2 > 2) pages.push("...");
  for (let i = Math.max(2, page - 1); i <= Math.min(totalPages - 1, page + 1); i++) addPage(i);
  if (page + 2 < totalPages - 1) pages.push("...");
  if (totalPages > 1) addPage(totalPages);

  return (
    <div className="flex flex-col sm:flex-row items-center justify-between gap-3 px-4 py-3 border-t border-custom-200">
      <div className="flex items-center gap-3 text-xs text-custom-700">
        <span>{total === 0 ? "No records" : `${from}–${to} of ${total}`}</span>
        <span className="hidden sm:inline">|</span>
        <label className="hidden sm:flex items-center gap-1.5">
          Rows:
          <select
            value={pageSize}
            onChange={(e) => onPageSizeChange(Number(e.target.value))}
            className="px-2 py-1 rounded-lg border border-custom-300 bg-style-500 text-secondary-100 focus:outline-none focus:border-primary-400 transition-colors"
          >
            {PAGE_SIZE_OPTIONS.map((s) => <option key={s} value={s}>{s}</option>)}
          </select>
        </label>
      </div>
      <div className="flex items-center gap-1">
        <button onClick={() => onPageChange(1)} disabled={page <= 1} className="p-1.5 rounded-lg border border-custom-300 text-secondary-100 disabled:opacity-40 hover:bg-custom-100 transition-colors" title="First"><HiOutlineChevronDoubleLeft className="w-4 h-4" /></button>
        <button onClick={() => onPageChange(page - 1)} disabled={page <= 1} className="p-1.5 rounded-lg border border-custom-300 text-secondary-100 disabled:opacity-40 hover:bg-custom-100 transition-colors" title="Previous"><HiOutlineChevronLeft className="w-4 h-4" /></button>
        {pages.map((p, i) =>
          p === "..." ? (
            <span key={`e-${i}`} className="px-2 text-custom-700 text-sm select-none">...</span>
          ) : (
            <button key={p} onClick={() => onPageChange(p as number)}
              className={`min-w-[32px] h-8 px-2 rounded-lg border text-sm font-semibold transition-colors ${p === page ? "bg-primary-500 border-primary-500 text-white" : "border-custom-300 text-secondary-100 hover:bg-custom-100"}`}>
              {p}
            </button>
          )
        )}
        <button onClick={() => onPageChange(page + 1)} disabled={page >= totalPages} className="p-1.5 rounded-lg border border-custom-300 text-secondary-100 disabled:opacity-40 hover:bg-custom-100 transition-colors" title="Next"><HiOutlineChevronRight className="w-4 h-4" /></button>
        <button onClick={() => onPageChange(totalPages)} disabled={page >= totalPages} className="p-1.5 rounded-lg border border-custom-300 text-secondary-100 disabled:opacity-40 hover:bg-custom-100 transition-colors" title="Last"><HiOutlineChevronDoubleRight className="w-4 h-4" /></button>
      </div>
    </div>
  );
}

// ─── Mark Delivered Confirm Modal ─────────────────────────────────────────────

interface MarkDeliveredModalProps {
  job: Job;
  onClose: () => void;
  onSuccess: () => void;
}

function MarkDeliveredModal({ job, onClose, onSuccess }: MarkDeliveredModalProps) {
  const [deliverJob, { isLoading }] = useDeliverJobMutation();

  const handleConfirm = async () => {
    try {
      await deliverJob(job.id).unwrap();
      toast.success(`Job #${job.jobNumber} marked as delivered`);
      onSuccess();
    } catch (err: any) {
      toast.error(err?.data?.message ?? "Failed to update status. Please try again.");
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

        <div className="rounded-xl bg-custom-100 border border-custom-300 p-4 mb-5 space-y-1.5">
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

        <p className="text-sm text-custom-700 mb-5">
          Confirm that this job has been physically handed over to the client. This will update the status to <span className="font-semibold text-secondary-100">delivered</span>.
        </p>

        <div className="flex gap-3 justify-end">
          <Button type="button" variant="outline" onClick={onClose}>Cancel</Button>
          <Button type="button" onClick={handleConfirm} disabled={isLoading}>
            {isLoading ? "Updating..." : "Confirm Delivery"}
          </Button>
        </div>
      </Card>
    </div>
  );
}

// ─── Job Detail Modal ─────────────────────────────────────────────────────────

interface JobDetailModalProps {
  job: Job;
  onClose: () => void;
  onComplete: () => void;
}

function JobDetailModal({ job, onClose, onComplete }: JobDetailModalProps) {
  const [completeJob, { isLoading }] = useCompleteJobMutation();

  const handleComplete = async () => {
    try {
      await completeJob(job.id).unwrap();
      toast.success(`Job #${job.jobNumber} marked as completed`);
      onComplete();
    } catch (err: any) {
      toast.error(err?.data?.message ?? "Failed to complete job. Please try again.");
    }
  };

  const fmt = (d?: string) =>
    d ? new Date(d).toLocaleDateString("en-RW", { day: "2-digit", month: "short", year: "numeric" }) : "—";

  return (
    <div className="fixed inset-0 bg-secondary-100/50 z-50 flex items-start justify-center p-4 overflow-y-auto">
      <Card className="!p-6 max-w-lg w-full my-8">
        {/* Header */}
        <div className="flex items-center justify-between mb-5">
          <div>
            <h3 className="text-xl font-bold text-secondary-100">Job Details</h3>
            <p className="text-sm text-custom-700 mt-0.5 font-mono">#{job.jobNumber}</p>
          </div>
          <button onClick={onClose} className="text-custom-700 hover:text-secondary-100 transition-colors">
            <HiOutlineX className="w-6 h-6" />
          </button>
        </div>

        {/* Details grid */}
        <div className="space-y-3 mb-6">
          {/* Title & type */}
          <div className="flex items-start gap-3 p-3 rounded-xl bg-custom-100 border border-custom-200">
            <HiOutlineBriefcase className="w-4 h-4 text-custom-700 mt-0.5 flex-shrink-0" />
            <div>
              <p className="text-sm font-bold text-secondary-100">{job.title}</p>
              {job.jobType && <p className="text-xs text-custom-700 mt-0.5">{job.jobType}</p>}
              {job.description && <p className="text-xs text-custom-700 mt-1">{job.description}</p>}
            </div>
          </div>

          {/* Customer */}
          <div className="flex items-center gap-3 p-3 rounded-xl bg-custom-100 border border-custom-200">
            <HiOutlineUser className="w-4 h-4 text-custom-700 flex-shrink-0" />
            <div>
              <p className="text-sm font-semibold text-secondary-100">{job.customer?.name ?? "—"}</p>
              {job.customer?.phone && <p className="text-xs text-custom-700">{job.customer.phone}</p>}
              {job.customer?.email && <p className="text-xs text-custom-700">{job.customer.email}</p>}
            </div>
          </div>

          {/* Amount & payment */}
          <div className="flex items-center gap-3 p-3 rounded-xl bg-custom-100 border border-custom-200">
            <HiOutlineCurrencyDollar className="w-4 h-4 text-custom-700 flex-shrink-0" />
            <div className="flex flex-wrap gap-3">
              <div>
                <p className="text-xs text-custom-700">Amount</p>
                <p className="text-sm font-bold text-secondary-100">
                  {job.amount != null ? `${job.amount.toLocaleString()} RWF` : "Not set"}
                </p>
              </div>
              <div>
                <p className="text-xs text-custom-700">Payment</p>
                {job.paidAt ? (
                  <span className="inline-flex items-center gap-1 text-xs font-bold px-2 py-0.5 rounded-full bg-emerald-100 text-emerald-700">
                    <HiOutlineBadgeCheck className="w-3 h-3" /> Paid
                  </span>
                ) : (
                  <span className="text-xs font-bold px-2 py-0.5 rounded-full bg-red-100 text-red-600">Unpaid</span>
                )}
              </div>
              {job.paymentMethod && (
                <div>
                  <p className="text-xs text-custom-700">Method</p>
                  <p className="text-xs font-semibold text-secondary-100">{job.paymentMethod.replace(/_/g, " ")}</p>
                </div>
              )}
            </div>
          </div>

          {/* Priority & dates */}
          <div className="flex items-center gap-3 p-3 rounded-xl bg-custom-100 border border-custom-200">
            <HiOutlineCalendar className="w-4 h-4 text-custom-700 flex-shrink-0" />
            <div className="flex flex-wrap gap-4">
              <div>
                <p className="text-xs text-custom-700">Priority</p>
                <span className={`text-xs font-bold px-2 py-0.5 rounded-full ${priorityColors[job.priority] ?? "bg-gray-100 text-gray-600"}`}>
                  {job.priority}
                </span>
              </div>
              <div>
                <p className="text-xs text-custom-700">Due Date</p>
                <p className="text-xs font-semibold text-secondary-100">{fmt(job.dueDate)}</p>
              </div>
              <div>
                <p className="text-xs text-custom-700">Created</p>
                <p className="text-xs font-semibold text-secondary-100">{fmt(job.createdAt)}</p>
              </div>
            </div>
          </div>

          {/* Specs */}
          {(job.quantity || job.size || job.colorMode || job.bindingType) && (
            <div className="flex items-start gap-3 p-3 rounded-xl bg-custom-100 border border-custom-200">
              <HiOutlineTag className="w-4 h-4 text-custom-700 mt-0.5 flex-shrink-0" />
              <div className="flex flex-wrap gap-4">
                {job.quantity && <div><p className="text-xs text-custom-700">Qty</p><p className="text-xs font-semibold text-secondary-100">{job.quantity}</p></div>}
                {job.size && <div><p className="text-xs text-custom-700">Size</p><p className="text-xs font-semibold text-secondary-100">{job.size}</p></div>}
                {job.colorMode && <div><p className="text-xs text-custom-700">Color</p><p className="text-xs font-semibold text-secondary-100">{job.colorMode}</p></div>}
                {job.bindingType && <div><p className="text-xs text-custom-700">Binding</p><p className="text-xs font-semibold text-secondary-100">{job.bindingType}</p></div>}
              </div>
            </div>
          )}

          {/* Notes */}
          {job.notes && (
            <div className="p-3 rounded-xl bg-custom-100 border border-custom-200">
              <p className="text-xs text-custom-700 mb-1">Notes</p>
              <p className="text-sm text-secondary-100">{job.notes}</p>
            </div>
          )}
        </div>

        <div className="flex gap-3 justify-end pt-2 border-t border-custom-300">
          <Button type="button" variant="outline" onClick={onClose}>Close</Button>
          <Button type="button" onClick={handleComplete} disabled={isLoading}>
            {isLoading ? "Completing..." : "Mark as Completed"}
          </Button>
        </div>
      </Card>
    </div>
  );
}

// ─── Main Page ────────────────────────────────────────────────────────────────

export default function DeliveriesPage() {
  // ── Ready for delivery (completed + paid) ────────────────────────────────
  const [readyPage, setReadyPage] = useState(1);
  const [readyPageSize, setReadyPageSize] = useState(10);
  const [readySearch, setReadySearch] = useState("");

  // ── Already delivered (status = delivered) ────────────────────────────────
  const [delivPage, setDelivPage] = useState(1);
  const [delivPageSize, setDelivPageSize] = useState(10);
  const [delivSearch, setDelivSearch] = useState("");

  const [deliverJob, setDeliverJob] = useState<Job | null>(null);   // for mark-delivered modal
  const [detailJob, setDetailJob] = useState<Job | null>(null);     // for job detail modal

  const {
    data: readyData,
    isLoading: readyLoading,
    isFetching: readyFetching,
    refetch: refetchReady,
  } = useGetCompletedAndPaidJobsQuery({
    page: readyPage,
    limit: readyPageSize,
    ...(readySearch.trim() && { search: readySearch.trim() }),
  });

  const {
    data: delivData,
    isLoading: delivLoading,
    isFetching: delivFetching,
    refetch: refetchDeliv,
  } = useGetJobsQuery({
    page: delivPage,
    limit: delivPageSize,
    status: "delivered",
    ...(delivSearch.trim() && { search: delivSearch.trim() }),
  });

  const readyJobs = readyData?.jobs ?? [];
  const readyTotal = readyData?.total ?? 0;
  const readyTotalPages = readyData?.totalPages ?? 1;

  const delivJobs = delivData?.jobs ?? [];
  const delivTotal = delivData?.total ?? 0;
  const delivTotalPages = delivData?.totalPages ?? 1;

  const handleDeliveredSuccess = () => {
    setDeliverJob(null);
    refetchReady();
    refetchDeliv();
  };

  const handleCompleteSuccess = () => {
    setDetailJob(null);
    refetchDeliv();
  };

  return (
    <DashboardLayout userRole="receptionist" userName="Reception Desk" notificationCount={0}>
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
                <p className="text-2xl font-bold text-secondary-100">{readyTotal}</p>
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
              <div className="w-10 h-10 rounded-xl flex items-center justify-center bg-primary-100">
                <HiOutlineBadgeCheck className="w-5 h-5 text-primary-500" />
              </div>
              <div>
                <p className="text-xs text-custom-700">Total in Pipeline</p>
                <p className="text-2xl font-bold text-secondary-100">{readyTotal + delivTotal}</p>
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
                Completed & Paid
              </span>
            </div>
            <div className="flex gap-2">
              <div className="relative flex-1 sm:w-64">
                <HiOutlineSearch className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-custom-700" />
                <input
                  type="text"
                  placeholder="Search job # or title..."
                  value={readySearch}
                  onChange={(e) => { setReadySearch(e.target.value); setReadyPage(1); }}
                  className="w-full pl-9 pr-4 py-2 rounded-xl border border-custom-300 bg-style-500 text-secondary-100 text-sm placeholder:text-custom-700 focus:outline-none focus:border-primary-400 focus:ring-2 focus:ring-primary-200 transition-colors"
                />
              </div>
              <button onClick={() => refetchReady()} className="p-2 rounded-xl border border-custom-300 hover:bg-custom-100 transition-colors" title="Refresh">
                <HiOutlineRefresh className={`w-4 h-4 text-custom-700 ${readyFetching ? "animate-spin" : ""}`} />
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
                  <th className="px-4 py-3 text-left text-xs font-bold text-secondary-100 uppercase">Amount</th>
                  <th className="px-4 py-3 text-left text-xs font-bold text-secondary-100 uppercase">Payment</th>
                  <th className="px-4 py-3 text-left text-xs font-bold text-secondary-100 uppercase">Due Date</th>
                  <th className="px-4 py-3 text-right text-xs font-bold text-secondary-100 uppercase">Action</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-custom-200">
                {readyLoading ? (
                  <tr><td colSpan={7} className="px-4 py-8 text-center text-custom-700">Loading...</td></tr>
                ) : readyJobs.length === 0 ? (
                  <tr><td colSpan={7} className="px-4 py-8 text-center text-custom-700">No jobs ready for delivery</td></tr>
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
                        {job.paidAt ? (
                          <span className="inline-flex items-center gap-1 text-xs font-bold px-2.5 py-1 rounded-full bg-emerald-100 text-emerald-700">
                            <HiOutlineBadgeCheck className="w-3.5 h-3.5" /> Paid
                          </span>
                        ) : (
                          <span className="text-xs font-bold px-2.5 py-1 rounded-full bg-red-100 text-red-600">Unpaid</span>
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

          <Pagination
            page={readyPage} totalPages={readyTotalPages} total={readyTotal} pageSize={readyPageSize}
            onPageChange={setReadyPage}
            onPageSizeChange={(s) => { setReadyPageSize(s); setReadyPage(1); }}
          />
        </Card>

        {/* ── Awaiting Completion (delivered) ─────────────────────────────── */}
        <Card className="!p-0 overflow-hidden">
          <div className="px-4 py-3 border-b border-custom-200 flex flex-col sm:flex-row sm:items-center justify-between gap-3">
            <div className="flex items-center gap-2">
              <HiOutlineClock className="w-5 h-5 text-orange-500" />
              <h2 className="text-base font-bold text-secondary-100">Already Delivered</h2>
              <span className="text-xs bg-orange-100 text-orange-700 px-2 py-0.5 rounded-full font-semibold">
                delivered
              </span>
            </div>
            <div className="flex gap-2">
              <div className="relative flex-1 sm:w-64">
                <HiOutlineSearch className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-custom-700" />
                <input
                  type="text"
                  placeholder="Search job # or title..."
                  value={delivSearch}
                  onChange={(e) => { setDelivSearch(e.target.value); setDelivPage(1); }}
                  className="w-full pl-9 pr-4 py-2 rounded-xl border border-custom-300 bg-style-500 text-secondary-100 text-sm placeholder:text-custom-700 focus:outline-none focus:border-primary-400 focus:ring-2 focus:ring-primary-200 transition-colors"
                />
              </div>
              <button onClick={() => refetchDeliv()} className="p-2 rounded-xl border border-custom-300 hover:bg-custom-100 transition-colors" title="Refresh">
                <HiOutlineRefresh className={`w-4 h-4 text-custom-700 ${delivFetching ? "animate-spin" : ""}`} />
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
                  <th className="px-4 py-3 text-left text-xs font-bold text-secondary-100 uppercase">Amount</th>
                  <th className="px-4 py-3 text-left text-xs font-bold text-secondary-100 uppercase">Payment</th>
                  <th className="px-4 py-3 text-left text-xs font-bold text-secondary-100 uppercase">Priority</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-custom-200">
                {delivLoading ? (
                  <tr><td colSpan={6} className="px-4 py-8 text-center text-custom-700">Loading...</td></tr>
                ) : delivJobs.length === 0 ? (
                  <tr><td colSpan={6} className="px-4 py-8 text-center text-custom-700">No delivered jobs awaiting completion</td></tr>
                ) : (
                  delivJobs.map((job) => (
                    <tr
                      key={job.id}
                      onClick={() => setDetailJob(job)}
                      className="hover:bg-custom-50 transition-colors cursor-pointer"
                      title="Click to view details"
                    >
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
                        {job.paidAt ? (
                          <span className="inline-flex items-center gap-1 text-xs font-bold px-2.5 py-1 rounded-full bg-emerald-100 text-emerald-700">
                            <HiOutlineBadgeCheck className="w-3.5 h-3.5" /> Paid
                          </span>
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

          <Pagination
            page={delivPage} totalPages={delivTotalPages} total={delivTotal} pageSize={delivPageSize}
            onPageChange={setDelivPage}
            onPageSizeChange={(s) => { setDelivPageSize(s); setDelivPage(1); }}
          />
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
      {detailJob && (
        <JobDetailModal
          job={detailJob}
          onClose={() => setDetailJob(null)}
          onComplete={handleCompleteSuccess}
        />
      )}
    </DashboardLayout>
  );
}
