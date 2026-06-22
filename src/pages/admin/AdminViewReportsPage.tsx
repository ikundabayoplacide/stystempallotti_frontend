import { useState } from "react";
import {
  HiOutlineDocumentText,
  HiOutlineChevronDown,
  HiOutlineChevronUp,
  HiOutlinePaperClip,
  HiOutlineInbox,
  HiOutlineRefresh,
} from "react-icons/hi";
import { DashboardLayout } from "../../components";
import { Card } from "../../components/ui";
import {
  useGetAssignedReportsQuery,
  useGetReportsQuery,
} from "../../store/services/reportsService";

const PAGE_SIZE = 10;

// ─── Report Card (expand/collapse) ───────────────────────────────────────────

function ReportCard({
  report,
  expanded,
  onToggle,
  showSender = false,
}: {
  report: any;
  expanded: boolean;
  onToggle: () => void;
  showSender?: boolean;
}) {
  return (
    <Card className="!p-0 overflow-hidden">
      <button
        onClick={onToggle}
        className="w-full flex items-center justify-between px-5 py-4 hover:bg-custom-50 transition-colors text-left"
      >
        <div className="flex items-start gap-4 min-w-0">
          <div className="w-9 h-9 rounded-lg bg-primary-100 flex items-center justify-center shrink-0 mt-0.5">
            <HiOutlineDocumentText className="w-4 h-4 text-primary-600" />
          </div>
          <div className="min-w-0">
            <p className="text-sm font-bold text-secondary-100 truncate">{report.title}</p>
            <p className="text-xs text-custom-700 mt-0.5 truncate">{report.purpose}</p>
            {showSender && report.createdBy && (
              <p className="text-xs text-primary-500 mt-0.5 font-semibold">
                From: {report.createdBy.name}
                <span className="text-custom-700 font-normal ml-1">({report.createdBy.role})</span>
              </p>
            )}
          </div>
        </div>
        <div className="flex items-center gap-4 shrink-0 ml-4">
          <div className="text-right hidden sm:block">
            <p className="text-xs text-custom-700">Submitted</p>
            <p className="text-xs font-semibold text-secondary-100">
              {new Date(report.createdAt).toLocaleDateString("en-RW", {
                day: "2-digit", month: "short", year: "numeric",
              })}
            </p>
            <p className="text-xs text-custom-500">
              {new Date(report.createdAt).toLocaleTimeString("en-RW", {
                hour: "2-digit", minute: "2-digit",
              })}
            </p>
          </div>
          {expanded
            ? <HiOutlineChevronUp className="w-4 h-4 text-custom-700" />
            : <HiOutlineChevronDown className="w-4 h-4 text-custom-700" />}
        </div>
      </button>

      {expanded && (
        <div className="border-t border-custom-200 px-5 py-4 space-y-4 bg-custom-50">
          {/* Date on mobile */}
          <p className="text-xs text-custom-700 sm:hidden">
            Submitted:{" "}
            <span className="font-semibold text-secondary-100">
              {new Date(report.createdAt).toLocaleString("en-RW")}
            </span>
          </p>

          {/* Visible To */}
          {report.visibleTo && report.visibleTo.length > 0 && (
            <div>
              <p className="text-xs font-bold text-secondary-100 uppercase mb-1.5">Visible To</p>
              <div className="flex flex-wrap gap-1.5">
                {report.visibleTo.map((role: string) => (
                  <span key={role} className="px-2 py-0.5 rounded-full bg-primary-100 text-primary-700 text-xs font-semibold">
                    {role}
                  </span>
                ))}
              </div>
            </div>
          )}

          {/* Items table */}
          {report.items?.length > 0 && (
            <div>
              <p className="text-xs font-bold text-secondary-100 uppercase mb-2">Records</p>
              <div className="rounded-xl overflow-hidden border border-custom-200">
                <table className="w-full text-xs">
                  <thead className="bg-custom-100">
                    <tr>
                      {["#", "Record / Item", "Qty", "Amount (RWF)"].map((h) => (
                        <th key={h} className="px-3 py-2 text-left font-bold text-secondary-100">{h}</th>
                      ))}
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-custom-200 bg-white">
                    {report.items.map((item: any, i: number) => (
                      <tr key={i}>
                        <td className="px-3 py-2 text-custom-700">{i + 1}</td>
                        <td className="px-3 py-2 text-secondary-100">{item.record}</td>
                        <td className="px-3 py-2 text-custom-700">{item.quantity || "—"}</td>
                        <td className="px-3 py-2 text-custom-700">
                          {item.amount ? Number(item.amount).toLocaleString() : "—"}
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          )}

          {/* Notes */}
          {report.notes && (
            <div>
              <p className="text-xs font-bold text-secondary-100 uppercase mb-1">Notes</p>
              <p className="text-sm text-custom-700 whitespace-pre-wrap">{report.notes}</p>
            </div>
          )}

          {/* Attachment */}
          {report.attachmentUrl && (
            <a
              href={report.attachmentUrl}
              download
              className="inline-flex items-center gap-1.5 text-xs font-semibold text-primary-500 hover:text-primary-600 transition-colors"
            >
              <HiOutlinePaperClip className="w-4 h-4" /> View Attachment
            </a>
          )}
        </div>
      )}
    </Card>
  );
}

// ─── Tab: Assigned to Admin ───────────────────────────────────────────────────

function AssignedReports() {
  const [page, setPage] = useState(1);
  const [expanded, setExpanded] = useState<string | null>(null);

  const { data, isLoading, refetch } = useGetAssignedReportsQuery({ page, limit: PAGE_SIZE });
  const reports    = data?.reports    ?? [];
  const total      = data?.total      ?? 0;
  const totalPages = data?.totalPages ?? 1;

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <p className="text-xs text-custom-700">
          <span className="font-semibold text-secondary-100">{total}</span> report{total !== 1 ? "s" : ""} assigned to you
        </p>
        <button onClick={() => refetch()} className="p-1.5 rounded-lg border border-custom-300 hover:bg-custom-100">
          <HiOutlineRefresh className={`w-4 h-4 text-custom-700 ${isLoading ? "animate-spin" : ""}`} />
        </button>
      </div>

      {isLoading ? (
        <Card className="!p-6 text-center text-custom-700 text-sm">Loading…</Card>
      ) : reports.length === 0 ? (
        <Card className="!p-10 text-center">
          <HiOutlineInbox className="w-10 h-10 text-custom-400 mx-auto mb-3" />
          <p className="text-secondary-100 font-semibold">No assigned reports</p>
          <p className="text-sm text-custom-700 mt-1">Reports shared with your role will appear here.</p>
        </Card>
      ) : (
        <div className="space-y-3">
          {reports.map((r) => (
            <ReportCard
              key={r.id}
              report={r}
              expanded={expanded === r.id}
              onToggle={() => setExpanded(expanded === r.id ? null : r.id)}
              showSender
            />
          ))}
        </div>
      )}

      {totalPages > 1 && (
        <div className="flex items-center justify-between">
          <p className="text-xs text-custom-700">Page {page} of {totalPages}</p>
          <div className="flex gap-2">
            <button onClick={() => setPage((p) => Math.max(1, p - 1))} disabled={page === 1}
              className="px-3 py-1.5 rounded-lg border border-custom-300 text-xs font-semibold text-secondary-100 hover:bg-custom-100 disabled:opacity-40 transition-colors">
              Prev
            </button>
            <button onClick={() => setPage((p) => Math.min(totalPages, p + 1))} disabled={page === totalPages}
              className="px-3 py-1.5 rounded-lg border border-custom-300 text-xs font-semibold text-secondary-100 hover:bg-custom-100 disabled:opacity-40 transition-colors">
              Next
            </button>
          </div>
        </div>
      )}
    </div>
  );
}

// ─── Tab: All Reports (admin can see everything) ──────────────────────────────

function AllReports() {
  const [page, setPage] = useState(1);
  const [expanded, setExpanded] = useState<string | null>(null);

  const { data, isLoading, refetch } = useGetReportsQuery({ page, limit: 5 });
  const reports    = data?.reports    ?? [];
  const total      = data?.total      ?? 0;
  const totalPages = data?.totalPages ?? 1;

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <p className="text-xs text-custom-700">
          <span className="font-semibold text-secondary-100">{total}</span> total report{total !== 1 ? "s" : ""} in the system
        </p>
        <button onClick={() => refetch()} className="p-1.5 rounded-lg border border-custom-300 hover:bg-custom-100">
          <HiOutlineRefresh className={`w-4 h-4 text-custom-700 ${isLoading ? "animate-spin" : ""}`} />
        </button>
      </div>

      {isLoading ? (
        <Card className="!p-6 text-center text-custom-700 text-sm">Loading…</Card>
      ) : reports.length === 0 ? (
        <Card className="!p-10 text-center">
          <HiOutlineDocumentText className="w-10 h-10 text-custom-400 mx-auto mb-3" />
          <p className="text-secondary-100 font-semibold">No reports found</p>
          <p className="text-sm text-custom-700 mt-1">No reports have been submitted yet.</p>
        </Card>
      ) : (
        <div className="space-y-3">
          {reports.map((r) => (
            <ReportCard
              key={r.id}
              report={r}
              expanded={expanded === r.id}
              onToggle={() => setExpanded(expanded === r.id ? null : r.id)}
              showSender
            />
          ))}
        </div>
      )}

      {totalPages > 1 && (
        <div className="flex items-center justify-between">
          <p className="text-xs text-custom-700">Page {page} of {totalPages}</p>
          <div className="flex gap-2">
            <button onClick={() => setPage((p) => Math.max(1, p - 1))} disabled={page === 1}
              className="px-3 py-1.5 rounded-lg border border-custom-300 text-xs font-semibold text-secondary-100 hover:bg-custom-100 disabled:opacity-40 transition-colors">
              Prev
            </button>
            <button onClick={() => setPage((p) => Math.min(totalPages, p + 1))} disabled={page === totalPages}
              className="px-3 py-1.5 rounded-lg border border-custom-300 text-xs font-semibold text-secondary-100 hover:bg-custom-100 disabled:opacity-40 transition-colors">
              Next
            </button>
          </div>
        </div>
      )}
    </div>
  );
}

// ─── Main Page ────────────────────────────────────────────────────────────────

type Tab = "assigned" | "all";

export default function AdminViewReportsPage() {
  const [activeTab, setActiveTab] = useState<Tab>("assigned");

  const { data: assignedData } = useGetAssignedReportsQuery({ page: 1, limit: 1 });
  const assignedCount = assignedData?.total ?? 0;

  return (
    <DashboardLayout userRole="admin" userName="Admin" notificationCount={0}>
      <div className="space-y-6 font-[family-name:var(--font-family-primary)]">

        {/* Header */}
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-xl bg-primary-100 flex items-center justify-center">
            <HiOutlineDocumentText className="w-5 h-5 text-primary-600" />
          </div>
          <div>
            <h1 className="text-2xl font-bold text-secondary-100">Worker Reports</h1>
            <p className="text-sm text-custom-700">View reports assigned to you and all system reports</p>
          </div>
        </div>

        {/* Tabs */}
        <div className="flex gap-2 border-b border-custom-200 pb-1">
          <button
            onClick={() => setActiveTab("assigned")}
            className={`flex items-center gap-2 px-4 py-2 rounded-t-xl text-sm font-semibold transition-colors border-b-2 ${
              activeTab === "assigned"
                ? "border-primary-500 text-primary-500 bg-primary-50"
                : "border-transparent text-custom-700 hover:text-secondary-100 hover:bg-custom-50"
            }`}
          >
            <HiOutlineInbox className="w-4 h-4" />
            Assigned to Me
            {assignedCount > 0 && (
              <span className="ml-1 px-2 py-0.5 rounded-full bg-primary-500 text-white text-xs font-bold">
                {assignedCount}
              </span>
            )}
          </button>
          <button
            onClick={() => setActiveTab("all")}
            className={`flex items-center gap-2 px-4 py-2 rounded-t-xl text-sm font-semibold transition-colors border-b-2 ${
              activeTab === "all"
                ? "border-primary-500 text-primary-500 bg-primary-50"
                : "border-transparent text-custom-700 hover:text-secondary-100 hover:bg-custom-50"
            }`}
          >
            <HiOutlineDocumentText className="w-4 h-4" />
            All Reports
          </button>
        </div>

        {/* Tab content */}
        {activeTab === "assigned" && <AssignedReports />}
        {activeTab === "all"      && <AllReports />}

      </div>
    </DashboardLayout>
  );
}
