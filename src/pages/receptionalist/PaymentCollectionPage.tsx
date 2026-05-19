import { useState } from "react";
import { toast } from "react-toastify";
import {
  HiOutlineBadgeCheck,
  HiOutlineBriefcase,
  HiOutlineCash,
  HiOutlineChevronDoubleLeft,
  HiOutlineChevronDoubleRight,
  HiOutlineChevronLeft,
  HiOutlineChevronRight,
  HiOutlineCreditCard,
  HiOutlinePhone,
  HiOutlineRefresh,
  HiOutlineSearch,
  HiOutlineUser,
  HiOutlineX,
} from "react-icons/hi";
import { DashboardLayout } from "../../components";
import { Button, Card } from "../../components/ui";
import {
  useGetJobsQuery,
  useRecordJobPaymentMutation,
  type Job,
  type PaymentMethod,
} from "../../store/services/jobsService";

// ─── Constants ────────────────────────────────────────────────────────────────

const PAYMENT_METHODS: {
  value: PaymentMethod;
  label: string;
  icon: React.ReactNode;
  color: string;
}[] = [
  {
    value: "CASH",
    label: "Cash",
    icon: <HiOutlineCash className="w-6 h-6" />,
    color: "border-green-400 bg-green-50 text-green-700",
  },
  {
    value: "MOBILE_MONEY",
    label: "Mobile Money",
    icon: <HiOutlinePhone className="w-6 h-6" />,
    color: "border-yellow-400 bg-yellow-50 text-yellow-700",
  },
  {
    value: "BANK_TRANSFER",
    label: "Bank Transfer",
    icon: <HiOutlineCreditCard className="w-6 h-6" />,
    color: "border-blue-400 bg-blue-50 text-blue-700",
  },
  {
    value: "CARD",
    label: "Card",
    icon: <HiOutlineBriefcase className="w-6 h-6" />,
    color: "border-purple-400 bg-purple-50 text-purple-700",
  },
];

const statusColors: Record<string, string> = {
  pending: "bg-gray-100 text-gray-700",
  confirmed: "bg-blue-100 text-blue-700",
  "in-composition": "bg-purple-100 text-purple-700",
  "in-montage": "bg-indigo-100 text-indigo-700",
  "in-printing": "bg-cyan-100 text-cyan-700",
  "in-binding": "bg-teal-100 text-teal-700",
  "in-packaging": "bg-green-100 text-green-700",
  "quality-check": "bg-yellow-100 text-yellow-700",
  "ready-for-delivery": "bg-orange-100 text-orange-700",
  delivered: "bg-pink-100 text-pink-700",
  completed: "bg-emerald-100 text-emerald-700",
};

const PAGE_SIZE_OPTIONS = [5, 10, 20];

// ─── Pagination ───────────────────────────────────────────────────────────────

interface PaginationProps {
  page: number;
  totalPages: number;
  total: number;
  pageSize: number;
  onPageChange: (p: number) => void;
  onPageSizeChange: (s: number) => void;
}

function Pagination({
  page,
  totalPages,
  total,
  pageSize,
  onPageChange,
  onPageSizeChange,
}: PaginationProps) {
  const from = total === 0 ? 0 : (page - 1) * pageSize + 1;
  const to = Math.min(page * pageSize, total);

  const pages: (number | "...")[] = [];
  const addPage = (n: number) => {
    if (!pages.includes(n)) pages.push(n);
  };
  addPage(1);
  if (page - 2 > 2) pages.push("...");
  for (
    let i = Math.max(2, page - 1);
    i <= Math.min(totalPages - 1, page + 1);
    i++
  )
    addPage(i);
  if (page + 2 < totalPages - 1) pages.push("...");
  if (totalPages > 1) addPage(totalPages);

  return (
    <div className="flex flex-col sm:flex-row items-center justify-between gap-3 px-4 py-3 border-t border-custom-200">
      <div className="flex items-center gap-3 text-xs text-custom-700">
        <span>{total === 0 ? "No records" : `${from}-${to} of ${total}`}</span>
        <span className="hidden sm:inline">|</span>
        <label className="hidden sm:flex items-center gap-1.5">
          Rows:
          <select
            value={pageSize}
            onChange={(e) => onPageSizeChange(Number(e.target.value))}
            className="px-2 py-1 rounded-lg border border-custom-300 bg-style-500 text-secondary-100 focus:outline-none focus:border-primary-400 transition-colors"
          >
            {PAGE_SIZE_OPTIONS.map((s) => (
              <option key={s} value={s}>
                {s}
              </option>
            ))}
          </select>
        </label>
      </div>
      <div className="flex items-center gap-1">
        <button
          onClick={() => onPageChange(1)}
          disabled={page <= 1}
          className="p-1.5 rounded-lg border border-custom-300 text-secondary-100 disabled:opacity-40 hover:bg-custom-100 transition-colors"
          title="First"
        >
          <HiOutlineChevronDoubleLeft className="w-4 h-4" />
        </button>
        <button
          onClick={() => onPageChange(page - 1)}
          disabled={page <= 1}
          className="p-1.5 rounded-lg border border-custom-300 text-secondary-100 disabled:opacity-40 hover:bg-custom-100 transition-colors"
          title="Previous"
        >
          <HiOutlineChevronLeft className="w-4 h-4" />
        </button>
        {pages.map((p, i) =>
          p === "..." ? (
            <span
              key={`e-${i}`}
              className="px-2 text-custom-700 text-sm select-none"
            >
              ...
            </span>
          ) : (
            <button
              key={p}
              onClick={() => onPageChange(p as number)}
              className={`min-w-[32px] h-8 px-2 rounded-lg border text-sm font-semibold transition-colors ${
                p === page
                  ? "bg-primary-500 border-primary-500 text-white"
                  : "border-custom-300 text-secondary-100 hover:bg-custom-100"
              }`}
            >
              {p}
            </button>
          )
        )}
        <button
          onClick={() => onPageChange(page + 1)}
          disabled={page >= totalPages}
          className="p-1.5 rounded-lg border border-custom-300 text-secondary-100 disabled:opacity-40 hover:bg-custom-100 transition-colors"
          title="Next"
        >
          <HiOutlineChevronRight className="w-4 h-4" />
        </button>
        <button
          onClick={() => onPageChange(totalPages)}
          disabled={page >= totalPages}
          className="p-1.5 rounded-lg border border-custom-300 text-secondary-100 disabled:opacity-40 hover:bg-custom-100 transition-colors"
          title="Last"
        >
          <HiOutlineChevronDoubleRight className="w-4 h-4" />
        </button>
      </div>
    </div>
  );
}

// ─── Payment Modal ────────────────────────────────────────────────────────────

interface PaymentModalProps {
  job: Job;
  onClose: () => void;
  onSuccess: () => void;
}

function PaymentModal({ job, onClose, onSuccess }: PaymentModalProps) {
  const [method, setMethod] = useState<PaymentMethod | null>(null);
  const [paymentNote, setPaymentNote] = useState("");

  const [recordPayment, { isLoading }] = useRecordJobPaymentMutation();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!method) {
      toast.error("Please select a payment method");
      return;
    }

    try {
      await recordPayment({
        id: job.id,
        paymentMethod: method,
        paymentNote: paymentNote.trim() || undefined,
      }).unwrap();
      toast.success(`Payment recorded for job #${job.jobNumber}`);
      onSuccess();
    } catch (err: any) {
      const msg = err?.data?.message ?? "Failed to record payment. Please try again.";
      toast.error(msg);
    }
  };

  const customerName = job.customer?.name ?? "Unknown";
  const customerPhone = job.customer?.phone ?? "";

  return (
    <div className="fixed inset-0 bg-secondary-100/50 z-50 flex items-start justify-center p-4 overflow-y-auto">
      <Card className="!p-6 max-w-lg w-full my-8">
        {/* Header */}
        <div className="flex items-center justify-between mb-5">
          <div>
            <h3 className="text-xl font-bold text-secondary-100">
              Record Payment
            </h3>
            <p className="text-sm text-custom-700 mt-0.5">
              Job #{job.jobNumber}
            </p>
          </div>
          <button
            onClick={onClose}
            className="text-custom-700 hover:text-secondary-100 transition-colors"
          >
            <HiOutlineX className="w-6 h-6" />
          </button>
        </div>

        {/* Job summary */}
        <div className="rounded-xl bg-custom-100 border border-custom-300 p-4 mb-5 space-y-2">
          <div className="flex items-center gap-2 text-sm">
            <HiOutlineUser className="w-4 h-4 text-custom-700 flex-shrink-0" />
            <span className="font-semibold text-secondary-100">
              {customerName}
            </span>
            {customerPhone && (
              <span className="text-custom-700">· {customerPhone}</span>
            )}
          </div>
          <div className="flex items-center gap-2 text-sm">
            <HiOutlineBriefcase className="w-4 h-4 text-custom-700 flex-shrink-0" />
            <span className="text-secondary-100">{job.title}</span>
          </div>
          <div className="flex items-center gap-2">
            <span
              className={`text-xs font-bold px-2.5 py-1 rounded-full ${
                statusColors[job.status] ?? "bg-gray-100 text-gray-700"
              }`}
            >
              {job.status.replace(/-/g, " ")}
            </span>
            {job.jobType && (
              <span className="text-xs text-custom-700 bg-custom-200 px-2.5 py-1 rounded-full">
                {job.jobType}
              </span>
            )}
          </div>
          {job.amount != null && (
            <div className="pt-1 border-t border-custom-200">
              <span className="text-sm font-bold text-secondary-100">
                {job.amount.toLocaleString()}{" "}
                <span className="text-xs font-normal text-custom-700">RWF</span>
              </span>
            </div>
          )}
        </div>

        {/* Already paid notice */}
        {job.paidAt && (
          <div className="mb-5 px-4 py-3 rounded-xl bg-emerald-50 border border-emerald-200 text-emerald-700 text-sm font-semibold flex items-center gap-2">
            <HiOutlineBadgeCheck className="w-5 h-5 flex-shrink-0" />
            This job is already marked as paid.
          </div>
        )}

        <form onSubmit={handleSubmit} className="space-y-5">
          {/* Payment method */}
          <div>
            <label className="block text-sm font-semibold text-secondary-100 mb-3">
              Payment Method <span className="text-red-500">*</span>
            </label>
            <div className="grid grid-cols-2 gap-3">
              {PAYMENT_METHODS.map((m) => (
                <button
                  key={m.value}
                  type="button"
                  onClick={() => setMethod(m.value)}
                  className={`flex items-center gap-3 p-3 rounded-xl border-2 transition-all font-semibold text-sm ${
                    method === m.value
                      ? m.color + " border-current shadow-sm scale-[1.02]"
                      : "border-custom-300 text-custom-700 hover:border-primary-300 hover:bg-custom-100"
                  }`}
                >
                  {m.icon}
                  {m.label}
                </button>
              ))}
            </div>
          </div>

          {/* Payment note */}
          <div>
            <label className="block text-sm font-semibold text-secondary-100 mb-2">
              Payment Note
            </label>
            <textarea
              placeholder="e.g. Client paid in full, partial deposit, MoMo ref 12345..."
              value={paymentNote}
              onChange={(e) => setPaymentNote(e.target.value)}
              rows={3}
              className="w-full px-4 py-2.5 rounded-xl border border-custom-300 bg-style-500 text-secondary-100 text-sm placeholder:text-custom-700 focus:outline-none focus:border-primary-400 focus:ring-2 focus:ring-primary-200 transition-colors resize-none"
            />
          </div>

          <div className="flex gap-3 justify-end pt-2 border-t border-custom-300">
            <Button type="button" variant="outline" onClick={onClose}>
              Cancel
            </Button>
            <Button
              type="submit"
              disabled={isLoading || !method || !!job.paidAt}
            >
              {isLoading ? "Saving..." : "Mark as Paid"}
            </Button>
          </div>
        </form>
      </Card>
    </div>
  );
}

// ─── Main Page ────────────────────────────────────────────────────────────────

export default function PaymentCollectionPage() {
  const [jobSearch, setJobSearch] = useState("");
  const [jobPage, setJobPage] = useState(1);
  const [jobPageSize, setJobPageSize] = useState(10);
  const [selectedJob, setSelectedJob] = useState<Job | null>(null);

  const {
    data: jobsData,
    isLoading: jobsLoading,
    isFetching: jobsFetching,
    refetch: refetchJobs,
  } = useGetJobsQuery({
    page: jobPage,
    limit: jobPageSize,
    ...(jobSearch.trim() && { search: jobSearch.trim() }),
  });

  const jobs = jobsData?.jobs ?? [];
  const jobTotal = jobsData?.total ?? 0;
  const jobTotalPages = jobsData?.totalPages ?? 1;

  const handlePaymentSuccess = () => {
    setSelectedJob(null);
    refetchJobs();
  };

  return (
    <DashboardLayout
      userRole="receptionist"
      userName="Reception Desk"
      notificationCount={0}
    >
      <div className="space-y-6 font-[family-name:var(--font-family-primary)]">

        {/* ── Header ──────────────────────────────────────────────────────── */}
        <div>
          <h1 className="text-2xl md:text-3xl font-bold text-secondary-100">
            Payment Collection
          </h1>
          <p className="text-sm text-custom-700 mt-1">
            Find the customer's job, select how they paid, and mark it as paid
          </p>
        </div>

        {/* ── Job Lookup ──────────────────────────────────────────────────── */}
        <Card className="!p-0 overflow-hidden">
          <div className="px-4 py-3 border-b border-custom-200 flex flex-col sm:flex-row sm:items-center justify-between gap-3">
            <h2 className="text-base font-bold text-secondary-100">
              Find Job
            </h2>
            <div className="flex gap-2">
              <div className="relative flex-1 sm:w-72">
                <HiOutlineSearch className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-custom-700" />
                <input
                  type="text"
                  placeholder="Search by job #, title, or customer..."
                  value={jobSearch}
                  onChange={(e) => {
                    setJobSearch(e.target.value);
                    setJobPage(1);
                  }}
                  className="w-full pl-9 pr-4 py-2 rounded-xl border border-custom-300 bg-style-500 text-secondary-100 text-sm placeholder:text-custom-700 focus:outline-none focus:border-primary-400 focus:ring-2 focus:ring-primary-200 transition-colors"
                />
              </div>
              <button
                onClick={() => refetchJobs()}
                className="p-2 rounded-xl border border-custom-300 hover:bg-custom-100 transition-colors"
                title="Refresh"
              >
                <HiOutlineRefresh
                  className={`w-4 h-4 text-custom-700 ${
                    jobsFetching ? "animate-spin" : ""
                  }`}
                />
              </button>
            </div>
          </div>

          <div className="overflow-x-auto">
            <table className="w-full">
              <thead className="bg-custom-100 border-b border-custom-300">
                <tr>
                  <th className="px-4 py-3 text-left text-xs font-bold text-secondary-100 uppercase">
                    Job #
                  </th>
                  <th className="px-4 py-3 text-left text-xs font-bold text-secondary-100 uppercase">
                    Title
                  </th>
                  <th className="px-4 py-3 text-left text-xs font-bold text-secondary-100 uppercase">
                    Customer
                  </th>
                  <th className="px-4 py-3 text-left text-xs font-bold text-secondary-100 uppercase">
                    Amount
                  </th>
                  <th className="px-4 py-3 text-left text-xs font-bold text-secondary-100 uppercase">
                    Status
                  </th>
                  <th className="px-4 py-3 text-left text-xs font-bold text-secondary-100 uppercase">
                    Payment
                  </th>
                  <th className="px-4 py-3 text-right text-xs font-bold text-secondary-100 uppercase">
                    Action
                  </th>
                </tr>
              </thead>
              <tbody className="divide-y divide-custom-200">
                {jobsLoading ? (
                  <tr>
                    <td
                      colSpan={7}
                      className="px-4 py-8 text-center text-custom-700"
                    >
                      Loading jobs...
                    </td>
                  </tr>
                ) : jobs.length === 0 ? (
                  <tr>
                    <td
                      colSpan={7}
                      className="px-4 py-8 text-center text-custom-700"
                    >
                      No jobs found
                    </td>
                  </tr>
                ) : (
                  jobs.map((job) => (
                    <tr
                      key={job.id}
                      className="hover:bg-custom-50 transition-colors"
                    >
                      <td className="px-4 py-3">
                        <span className="text-sm font-mono font-semibold text-primary-500">
                          #{job.jobNumber}
                        </span>
                      </td>
                      <td className="px-4 py-3">
                        <p className="text-sm font-semibold text-secondary-100">
                          {job.title}
                        </p>
                        {job.jobType && (
                          <p className="text-xs text-custom-700">
                            {job.jobType}
                          </p>
                        )}
                      </td>
                      <td className="px-4 py-3">
                        <p className="text-sm text-secondary-100">
                          {job.customer?.name ?? "—"}
                        </p>
                        {job.customer?.phone && (
                          <p className="text-xs text-custom-700">
                            {job.customer.phone}
                          </p>
                        )}
                      </td>
                      <td className="px-4 py-3">
                        {job.amount != null ? (
                          <span className="text-sm font-bold text-secondary-100">
                            {job.amount.toLocaleString()}{" "}
                            <span className="text-xs font-normal text-custom-700">
                              RWF
                            </span>
                          </span>
                        ) : (
                          <span className="text-xs text-custom-400">
                            Not set
                          </span>
                        )}
                      </td>
                      <td className="px-4 py-3">
                        <span
                          className={`text-xs font-bold px-2.5 py-1 rounded-full ${
                            statusColors[job.status] ??
                            "bg-gray-100 text-gray-700"
                          }`}
                        >
                          {job.status.replace(/-/g, " ")}
                        </span>
                      </td>
                      <td className="px-4 py-3">
                        {job.paidAt ? (
                          <span className="inline-flex items-center gap-1 text-xs font-bold px-2.5 py-1 rounded-full bg-emerald-100 text-emerald-700">
                            <HiOutlineBadgeCheck className="w-3.5 h-3.5" />
                            Paid
                          </span>
                        ) : (
                          <span className="text-xs font-bold px-2.5 py-1 rounded-full bg-red-100 text-red-600">
                            Unpaid
                          </span>
                        )}
                      </td>
                      <td className="px-4 py-3 text-right">
                        <button
                          onClick={() => setSelectedJob(job)}
                          disabled={!!job.paidAt}
                          className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-primary-500 text-white text-xs font-semibold hover:bg-primary-600 transition-colors disabled:opacity-40 disabled:cursor-not-allowed"
                        >
                          <HiOutlineBadgeCheck className="w-4 h-4" />
                          {job.paidAt ? "Paid" : "Collect Payment"}
                        </button>
                      </td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>

          <Pagination
            page={jobPage}
            totalPages={jobTotalPages}
            total={jobTotal}
            pageSize={jobPageSize}
            onPageChange={setJobPage}
            onPageSizeChange={(s) => {
              setJobPageSize(s);
              setJobPage(1);
            }}
          />
        </Card>
      </div>

      {/* ── Payment Modal ────────────────────────────────────────────────── */}
      {selectedJob && (
        <PaymentModal
          job={selectedJob}
          onClose={() => setSelectedJob(null)}
          onSuccess={handlePaymentSuccess}
        />
      )}
    </DashboardLayout>
  );
}
