import { useState } from "react";
import {
  HiOutlineDocumentText, HiOutlineChevronDown, HiOutlineChevronUp,
  HiOutlinePaperClip,
} from "react-icons/hi";
import { DashboardLayout } from "../../components";
import { Card } from "../../components/ui";
import { useGetMyReportsQuery } from "../../store/services/reportsService";
import { useAuth } from "../../context/AuthContext";

const PAGE_SIZE = 10;

export default function MyReportsPage() {
  const { userRole, userName } = useAuth();
  const [page, setPage] = useState(1);
  const [expanded, setExpanded] = useState<string | null>(null);

  const { data, isLoading } = useGetMyReportsQuery({ page, limit: PAGE_SIZE });
  const reports = data?.reports ?? [];
  const totalPages = data?.totalPages ?? 1;
  const total = data?.total ?? 0;

  return (
    <DashboardLayout userRole={userRole ?? "receptionist"} userName={userName ?? ""} notificationCount={0}>
      <div className="space-y-6 font-[family-name:var(--font-family-primary)]">

        {/* Header */}
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-xl bg-primary-100 flex items-center justify-center">
            <HiOutlineDocumentText className="w-5 h-5 text-primary-600" />
          </div>
          <div>
            <h1 className="text-2xl font-bold text-secondary-100">My Reports</h1>
            <p className="text-sm text-custom-700">Reports you have submitted <span className="font-semibold text-black">{total}</span> total</p>
          </div>
        </div>

        {/* List */}
        <div className="space-y-3">
          {isLoading ? (
            <Card className="!p-6 text-center text-custom-700 text-sm">Loading your reports…</Card>
          ) : reports.length === 0 ? (
            <Card className="!p-10 text-center">
              <HiOutlineDocumentText className="w-10 h-10 text-custom-400 mx-auto mb-3" />
              <p className="text-secondary-100 font-semibold">No reports yet</p>
              <p className="text-sm text-custom-700 mt-1">Reports you submit will appear here.</p>
            </Card>
          ) : reports.map((report) => {
            const isOpen = expanded === report.id;
            return (
              <Card key={report.id} className="!p-0 overflow-hidden">
                {/* Row */}
                <button
                  onClick={() => setExpanded(isOpen ? null : report.id)}
                  className="w-full flex items-center justify-between px-5 py-4 hover:bg-custom-50 transition-colors text-left"
                >
                  <div className="flex items-start gap-4 min-w-0">
                    <div className="w-9 h-9 rounded-lg bg-primary-100 flex items-center justify-center shrink-0 mt-0.5">
                      <HiOutlineDocumentText className="w-4 h-4 text-primary-600" />
                    </div>
                    <div className="min-w-0">
                      <p className="text-sm font-bold text-secondary-100 truncate">{report.title}</p>
                      <p className="text-xs text-custom-700 mt-0.5 truncate">{report.purpose}</p>
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
                    {isOpen
                      ? <HiOutlineChevronUp className="w-4 h-4 text-custom-700" />
                      : <HiOutlineChevronDown className="w-4 h-4 text-custom-700" />}
                  </div>
                </button>

                {/* Expanded detail */}
                {isOpen && (
                  <div className="border-t border-custom-200 px-5 py-4 space-y-4 bg-custom-50">
                    {/* Date on mobile */}
                    <p className="text-xs text-custom-700 sm:hidden">
                      Submitted: <span className="font-semibold text-secondary-100">
                        {new Date(report.createdAt).toLocaleString("en-RW")}
                      </span>
                    </p>

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
                              {report.items.map((item, i) => (
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
          })}
        </div>

        {/* Pagination */}
        {totalPages > 1 && (
          <div className="flex items-center justify-between">
            <p className="text-xs text-custom-700">
              Page {page} of {totalPages} — {total} reports
            </p>
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
    </DashboardLayout>
  );
}
