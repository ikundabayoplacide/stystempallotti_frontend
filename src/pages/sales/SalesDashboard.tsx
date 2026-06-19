import {
  HiOutlineBriefcase,
  HiOutlineCheckCircle,
  HiOutlineClock,
  HiOutlineCurrencyDollar,
  HiOutlineDocumentText,
  HiOutlineExclamationCircle,
  HiOutlineRefresh,
} from "react-icons/hi";
import { Card } from "../../components/ui";
import { useGetJobsQuery } from "../../store/services/jobsService";
import { useGetProformasQuery } from "../../store/services/proformasService";

// ─── Status badge ─────────────────────────────────────────────────────────────

const quotationStatusColors: Record<string, string> = {
  draft:    "bg-gray-100 text-gray-600",
  sent:     "bg-blue-100 text-blue-700",
  accepted: "bg-green-100 text-green-700",
  rejected: "bg-red-100 text-red-600",
  expired:  "bg-orange-100 text-orange-700",
};

const jobStatusColors: Record<string, string> = {
  pending:             "bg-gray-100 text-gray-600",
  confirmed:           "bg-blue-100 text-blue-700",
  "in-composition":    "bg-purple-100 text-purple-700",
  "in-printing":       "bg-indigo-100 text-indigo-700",
  "ready-for-delivery":"bg-emerald-100 text-emerald-700",
  delivered:           "bg-green-100 text-green-700",
  completed:           "bg-teal-100 text-teal-700",
};

// ─── Component ────────────────────────────────────────────────────────────────

export default function SalesDashboard() {
  const {
    data: jobsData,
    isLoading: jobsLoading,
    refetch: refetchJobs,
  } = useGetJobsQuery({ limit: 5 });

  const {
    data: quotationsData,
    isLoading: quotationsLoading,
    refetch: refetchQuotations,
  } = useGetProformasQuery({ limit: 5 });

  const jobs       = jobsData?.jobs ?? [];
  const quotations = quotationsData?.proformas ?? [];
  const isLoading  = jobsLoading || quotationsLoading;

  // KPI derivations
  const totalJobs       = jobsData?.total ?? 0;
  const pendingJobs     = jobs.filter((j) => j.status === "pending").length;
  const draftQuotations = quotations.filter((q) => q.status === "draft").length;
  const sentQuotations  = quotations.filter((q) => q.status === "sent").length;
  const acceptedValue   = quotations
    .filter((q) => q.status === "accepted")
    .reduce((s, q) => s + (q.totalAmount ?? 0), 0);

  const handleRefresh = () => { refetchJobs(); refetchQuotations(); };

  return (
    <div className="space-y-6 font-[family-name:var(--font-family-primary)]">

      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl md:text-3xl font-bold text-secondary-100">Sales Dashboard</h1>
          <p className="text-sm text-custom-700 mt-1">Overview of jobs and quotations</p>
        </div>
        <button
          onClick={handleRefresh}
          className="flex items-center gap-2 px-3 py-2 rounded-xl border border-custom-300 hover:bg-custom-100 transition-colors text-custom-700 text-sm"
        >
          <HiOutlineRefresh className="w-4 h-4" />
          <span className="font-semibold hidden sm:inline">Refresh</span>
        </button>
      </div>

      {/* KPI Cards */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
        <Card className="!p-4">
          <div className="w-10 h-10 rounded-xl bg-primary-100 flex items-center justify-center mb-3">
            <HiOutlineBriefcase className="w-5 h-5 text-primary-600" />
          </div>
          <p className="text-2xl font-bold text-secondary-100">{isLoading ? "—" : totalJobs}</p>
          <p className="text-xs text-custom-700 mt-1">Total Jobs</p>
        </Card>
        <Card className="!p-4">
          <div className="w-10 h-10 rounded-xl bg-yellow-100 flex items-center justify-center mb-3">
            <HiOutlineClock className="w-5 h-5 text-yellow-600" />
          </div>
          <p className="text-2xl font-bold text-secondary-100">{isLoading ? "—" : pendingJobs}</p>
          <p className="text-xs text-custom-700 mt-1">Pending Jobs</p>
        </Card>
        <Card className="!p-4">
          <div className="w-10 h-10 rounded-xl bg-blue-100 flex items-center justify-center mb-3">
            <HiOutlineDocumentText className="w-5 h-5 text-blue-600" />
          </div>
          <p className="text-2xl font-bold text-secondary-100">{isLoading ? "—" : draftQuotations + sentQuotations}</p>
          <p className="text-xs text-custom-700 mt-1">Open Quotations</p>
        </Card>
        <Card className="!p-4">
          <div className="w-10 h-10 rounded-xl bg-emerald-100 flex items-center justify-center mb-3">
            <HiOutlineCurrencyDollar className="w-5 h-5 text-emerald-600" />
          </div>
          <p className="text-2xl font-bold text-secondary-100">
            {isLoading ? "—" : acceptedValue >= 1_000_000
              ? `${(acceptedValue / 1_000_000).toFixed(1)}M`
              : acceptedValue.toLocaleString()}
          </p>
          <p className="text-xs text-custom-700 mt-1">Accepted Value (RWF)</p>
        </Card>
      </div>

      {/* Two-column: Recent Jobs + Recent Quotations */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">

        {/* Recent Jobs */}
        <Card className="!p-0 overflow-hidden">
          <div className="px-5 py-4 border-b border-custom-300 flex items-center justify-between">
            <h2 className="text-sm font-bold text-secondary-100">Recent Jobs</h2>
            <span className="text-xs text-custom-700">{totalJobs} total</span>
          </div>
          {jobsLoading ? (
            <div className="p-6 space-y-3">
              {Array.from({ length: 4 }).map((_, i) => (
                <div key={i} className="h-10 bg-custom-200 rounded-xl animate-pulse" />
              ))}
            </div>
          ) : jobs.length === 0 ? (
            <div className="flex flex-col items-center justify-center py-10 text-custom-700 gap-2">
              <HiOutlineExclamationCircle className="w-8 h-8 text-custom-400" />
              <span className="text-sm">No jobs yet</span>
            </div>
          ) : (
            <div className="divide-y divide-custom-200">
              {jobs.map((job) => {
                const statusColor = jobStatusColors[job.status] ?? "bg-custom-100 text-custom-700";
                const customer = job.customer;
                return (
                  <div key={job.id} className="px-5 py-3 flex items-center justify-between gap-3 hover:bg-custom-50 transition-colors">
                    <div className="min-w-0">
                      <div className="flex items-center gap-2">
                        <span className="text-xs font-bold text-primary-500">{job.jobNumber}</span>
                        <span className={`text-xs font-semibold px-2 py-0.5 rounded-full ${statusColor}`}>
                          {job.status.replace(/-/g, " ")}
                        </span>
                      </div>
                      <p className="text-sm font-semibold text-secondary-100 truncate mt-0.5">{job.title}</p>
                      {customer && (
                        <p className="text-xs text-custom-700 truncate">{customer.name}</p>
                      )}
                    </div>
                    <div className="text-right shrink-0">
                      {job.amount != null && (
                        <p className="text-sm font-bold text-secondary-100">{job.amount.toLocaleString()} RWF</p>
                      )}
                      <p className="text-xs text-custom-700">{new Date(job.createdAt).toLocaleDateString()}</p>
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </Card>

        {/* Recent Quotations */}
        <Card className="!p-0 overflow-hidden">
          <div className="px-5 py-4 border-b border-custom-300 flex items-center justify-between">
            <h2 className="text-sm font-bold text-secondary-100">Recent Quotations</h2>
            <span className="text-xs text-custom-700">{quotationsData?.pagination?.total ?? 0} total</span>
          </div>
          {quotationsLoading ? (
            <div className="p-6 space-y-3">
              {Array.from({ length: 4 }).map((_, i) => (
                <div key={i} className="h-10 bg-custom-200 rounded-xl animate-pulse" />
              ))}
            </div>
          ) : quotations.length === 0 ? (
            <div className="flex flex-col items-center justify-center py-10 text-custom-700 gap-2">
              <HiOutlineCheckCircle className="w-8 h-8 text-custom-400" />
              <span className="text-sm">No quotations yet</span>
            </div>
          ) : (
            <div className="divide-y divide-custom-200">
              {quotations.map((q) => {
                const statusColor = quotationStatusColors[q.status] ?? "bg-custom-100 text-custom-700";
                const customer = q.customer ?? q.job?.customer;
                return (
                  <div key={q.id} className="px-5 py-3 flex items-center justify-between gap-3 hover:bg-custom-50 transition-colors">
                    <div className="min-w-0">
                      <div className="flex items-center gap-2">
                        <span className="text-xs font-bold text-primary-500">{q.proformaNo}</span>
                        <span className={`text-xs font-semibold px-2 py-0.5 rounded-full ${statusColor}`}>
                          {q.status}
                        </span>
                      </div>
                      {customer && (
                        <p className="text-sm font-semibold text-secondary-100 truncate mt-0.5">{customer.name}</p>
                      )}
                      {q.job && (
                        <p className="text-xs text-custom-700 truncate">{q.job.title}</p>
                      )}
                    </div>
                    <div className="text-right shrink-0">
                      <p className="text-sm font-bold text-secondary-100">{(q.totalAmount ?? 0).toLocaleString()} RWF</p>
                      <p className="text-xs text-custom-700">{new Date(q.createdAt).toLocaleDateString()}</p>
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </Card>
      </div>
    </div>
  );
}
