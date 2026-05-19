import { useNavigate } from "react-router-dom";
import {
  HiOutlineBadgeCheck,
  HiOutlineBriefcase,
  HiOutlineCash,
  HiOutlineChevronRight,
  HiOutlineClipboardList,
  HiOutlineClock,
  HiOutlineTruck,
  HiOutlineUsers,
} from "react-icons/hi";
import { Card } from "../../components/ui";
import {
  useGetJobsQuery,
  useGetCompletedAndPaidJobsQuery,
} from "../../store/services/jobsService";
import { useGetCustomersQuery } from "../../store/services/customersService";

// ─── Helpers ──────────────────────────────────────────────────────────────────

const fmt = (d: string) =>
  new Date(d).toLocaleDateString("en-RW", {
    day: "2-digit",
    month: "short",
  });

const priorityDot: Record<string, string> = {
  low: "bg-gray-400",
  normal: "bg-blue-400",
  high: "bg-orange-400",
  urgent: "bg-red-500",
};

const statusColors: Record<string, string> = {
  pending: "bg-gray-100 text-gray-600",
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

// ─── Pipeline step card ───────────────────────────────────────────────────────

interface PipelineStepProps {
  label: string;
  count: number;
  icon: React.ElementType;
  iconBg: string;
  iconColor: string;
  accent: string;
  path: string;
}

function PipelineStep({ label, count, icon: Icon, iconBg, iconColor, accent, path }: PipelineStepProps) {
  const navigate = useNavigate();
  return (
    <button
      onClick={() => navigate(path)}
      className="flex-1 min-w-[120px] group relative overflow-hidden rounded-2xl border border-custom-200 bg-style-500 p-4 text-left hover:border-primary-300 hover:shadow-md transition-all"
    >
      <div className={`absolute top-0 left-0 w-1 h-full ${accent} rounded-l-2xl`} />
      <div className={`w-9 h-9 rounded-xl flex items-center justify-center mb-3 ${iconBg}`}>
        <Icon className={`w-5 h-5 ${iconColor}`} />
      </div>
      <p className="text-2xl font-bold text-secondary-100">{count}</p>
      <p className="text-xs text-custom-700 mt-0.5 leading-tight">{label}</p>
      <HiOutlineChevronRight className="absolute bottom-3 right-3 w-4 h-4 text-custom-400 group-hover:text-primary-500 transition-colors" />
    </button>
  );
}

// ─── Job row card ─────────────────────────────────────────────────────────────

function JobCard({ job, onClick }: { job: any; onClick: () => void }) {
  return (
    <button
      onClick={onClick}
      className="w-full text-left flex items-center gap-3 px-4 py-3 hover:bg-custom-50 transition-colors border-b border-custom-100 last:border-0"
    >
      <span className={`w-2 h-2 rounded-full flex-shrink-0 ${priorityDot[job.priority] ?? "bg-gray-400"}`} />
      <div className="flex-1 min-w-0">
        <div className="flex items-center gap-2">
          <span className="text-xs font-mono font-bold text-primary-500">#{job.jobNumber}</span>
          <span className="text-sm font-semibold text-secondary-100 truncate">{job.title}</span>
        </div>
        <p className="text-xs text-custom-700 truncate">{job.customer?.name ?? "—"}</p>
      </div>
      <div className="flex flex-col items-end gap-1 flex-shrink-0">
        <span className={`text-xs font-bold px-2 py-0.5 rounded-full ${statusColors[job.status] ?? "bg-gray-100 text-gray-600"}`}>
          {job.status.replace(/-/g, " ")}
        </span>
        {job.dueDate && (
          <span className="text-xs text-custom-700">{fmt(job.dueDate)}</span>
        )}
      </div>
    </button>
  );
}

// ─── Section header ───────────────────────────────────────────────────────────

function SectionHeader({ icon: Icon, title, linkLabel, onLink }: {
  icon: React.ElementType;
  title: string;
  linkLabel: string;
  onLink: () => void;
}) {
  return (
    <div className="flex items-center justify-between mb-3">
      <div className="flex items-center gap-2">
        <Icon className="w-4 h-4 text-primary-500" />
        <h2 className="text-sm font-bold text-secondary-100">{title}</h2>
      </div>
      <button onClick={onLink} className="text-xs text-primary-500 hover:text-primary-600 font-semibold transition-colors flex items-center gap-0.5">
        {linkLabel} <HiOutlineChevronRight className="w-3 h-3" />
      </button>
    </div>
  );
}

// ─── Main ─────────────────────────────────────────────────────────────────────

export default function ReceptionDashboardV2() {
  const navigate = useNavigate();

  const { data: allJobsData } = useGetJobsQuery({ limit: 6, page: 1 });
  const { data: pendingData } = useGetJobsQuery({ status: "pending", limit: 5 });
  const { data: readyForDelivData } = useGetJobsQuery({ status: "ready-for-delivery", limit: 1 });
  const { data: deliveredData } = useGetJobsQuery({ status: "delivered", limit: 5 });
  const { data: completedPaidData } = useGetCompletedAndPaidJobsQuery({ limit: 1 });
  const { data: customersData } = useGetCustomersQuery({ limit: 1 });

  const recentJobs = allJobsData?.jobs ?? [];
  const totalJobs = allJobsData?.total ?? 0;
  const pendingJobs = pendingData?.jobs ?? [];
  const pendingCount = pendingData?.total ?? 0;
  const deliveredJobs = deliveredData?.jobs ?? [];
  const deliveredCount = deliveredData?.total ?? 0;
  const readyForDelivCount = readyForDelivData?.total ?? 0;
  const readyToDeliverCount = completedPaidData?.total ?? 0;
  const totalCustomers = customersData?.total ?? 0;

  return (
    <div className="space-y-6 font-[family-name:var(--font-family-primary)]">

      {/* ── Greeting ──────────────────────────────────────────────────────── */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
        <div>
          <h1 className="text-2xl md:text-3xl font-bold text-secondary-100">
            Good day 👋
          </h1>
          <p className="text-sm text-custom-700 mt-1">
            Here's what's happening at the front desk today
          </p>
        </div>
        <button
          onClick={() => navigate("/reception")}
          className="inline-flex items-center gap-2 px-4 py-2.5 rounded-xl bg-primary-500 text-white text-sm font-semibold hover:bg-primary-600 transition-colors self-start sm:self-auto"
        >
          <HiOutlineClipboardList className="w-4 h-4" />
          New Job
        </button>
      </div>

      {/* ── Pipeline strip ────────────────────────────────────────────────── */}
      <div>
        <p className="text-xs font-bold text-custom-700 uppercase tracking-wider mb-3">Job Pipeline</p>
        <div className="flex gap-3 overflow-x-auto pb-1">
          <PipelineStep label="Total Jobs" count={totalJobs} icon={HiOutlineClipboardList}
            iconBg="bg-primary-100" iconColor="text-primary-500" accent="bg-primary-400"
            path="/reception" />
          <PipelineStep label="Pending" count={pendingCount} icon={HiOutlineClock}
            iconBg="bg-gray-100" iconColor="text-gray-500" accent="bg-gray-400"
            path="/reception" />
          <PipelineStep label="Ready to Deliver" count={readyToDeliverCount} icon={HiOutlineCash}
            iconBg="bg-emerald-100" iconColor="text-emerald-600" accent="bg-emerald-400"
            path="/reception/payments" />
          <PipelineStep label="For Delivery" count={readyForDelivCount} icon={HiOutlineTruck}
            iconBg="bg-orange-100" iconColor="text-orange-500" accent="bg-orange-400"
            path="/reception/deliveries" />
          <PipelineStep label="Delivered" count={deliveredCount} icon={HiOutlineBadgeCheck}
            iconBg="bg-pink-100" iconColor="text-pink-500" accent="bg-pink-400"
            path="/reception/deliveries" />
          <PipelineStep label="Customers" count={totalCustomers} icon={HiOutlineUsers}
            iconBg="bg-blue-100" iconColor="text-blue-500" accent="bg-blue-400"
            path="/reception/visitor" />
        </div>
      </div>

      {/* ── Two-column content ─────────────────────────────────────────────── */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">

        {/* Left — recent jobs (2/3 width) */}
        <div className="lg:col-span-2 space-y-4">
          <Card className="!p-0 overflow-hidden">
            <div className="px-4 pt-4 pb-3">
              <SectionHeader
                icon={HiOutlineClipboardList}
                title="Recent Jobs"
                linkLabel="All jobs"
                onLink={() => navigate("/reception")}
              />
            </div>
            {recentJobs.length === 0 ? (
              <p className="px-4 pb-4 text-sm text-custom-700">No jobs yet.</p>
            ) : (
              recentJobs.map((job) => (
                <JobCard key={job.id} job={job} onClick={() => navigate("/reception")} />
              ))
            )}
          </Card>
        </div>

        {/* Right — two stacked panels (1/3 width) */}
        <div className="space-y-4">

          {/* Pending jobs */}
          <Card className="!p-0 overflow-hidden">
            <div className="px-4 pt-4 pb-3">
              <SectionHeader
                icon={HiOutlineClock}
                title="Pending Jobs"
                linkLabel="View"
                onLink={() => navigate("/reception")}
              />
            </div>
            {pendingJobs.length === 0 ? (
              <p className="px-4 pb-4 text-sm text-custom-700">No pending jobs.</p>
            ) : (
              pendingJobs.map((job) => (
                <div key={job.id} className="flex items-center gap-3 px-4 py-2.5 border-b border-custom-100 last:border-0 hover:bg-custom-50 transition-colors">
                  <div className="flex-1 min-w-0">
                    <p className="text-xs font-mono font-bold text-primary-500">#{job.jobNumber}</p>
                    <p className="text-sm font-semibold text-secondary-100 truncate">{job.title}</p>
                    <p className="text-xs text-custom-700 truncate">{job.customer?.name ?? "—"}</p>
                  </div>
                  {job.amount != null && (
                    <span className="text-xs font-bold text-secondary-100 flex-shrink-0">
                      {job.amount.toLocaleString()} <span className="font-normal text-custom-700">RWF</span>
                    </span>
                  )}
                </div>
              ))
            )}
          </Card>

          {/* Delivered — awaiting completion */}
          <Card className="!p-0 overflow-hidden">
            <div className="px-4 pt-4 pb-3">
              <SectionHeader
                icon={HiOutlineBriefcase}
                title="Delivered Jobs"
                linkLabel="View"
                onLink={() => navigate("/reception/deliveries")}
              />
            </div>
            {deliveredJobs.length === 0 ? (
              <p className="px-4 pb-4 text-sm text-custom-700">No delivered jobs.</p>
            ) : (
              deliveredJobs.map((job) => (
                <div key={job.id} className="flex items-center gap-3 px-4 py-2.5 border-b border-custom-100 last:border-0 hover:bg-custom-50 transition-colors">
                  <div className="flex-1 min-w-0">
                    <p className="text-xs font-mono font-bold text-primary-500">#{job.jobNumber}</p>
                    <p className="text-sm font-semibold text-secondary-100 truncate">{job.title}</p>
                    <p className="text-xs text-custom-700 truncate">{job.customer?.name ?? "—"}</p>
                  </div>
                  {job.paidAt ? (
                    <span className="inline-flex items-center gap-1 text-xs font-bold px-2 py-0.5 rounded-full bg-emerald-100 text-emerald-700 flex-shrink-0">
                      <HiOutlineBadgeCheck className="w-3 h-3" /> Paid
                    </span>
                  ) : (
                    <span className="text-xs font-bold px-2 py-0.5 rounded-full bg-red-100 text-red-600 flex-shrink-0">
                      Unpaid
                    </span>
                  )}
                </div>
              ))
            )}
          </Card>
        </div>
      </div>
    </div>
  );
}
