import { useState } from "react";
import {
  HiOutlineBriefcase,
  HiOutlineChartBar,
  HiOutlineCheckCircle,
  HiOutlineDocumentDownload,
  HiOutlineDocumentText,
  HiOutlineExclamationCircle,
  HiOutlineRefresh,
  HiOutlineXCircle,
} from "react-icons/hi";
import jsPDF from "jspdf";
import autoTable from "jspdf-autotable";
import { DashboardLayout, GenerateReportModal } from "../../components";
import { Card } from "../../components/ui";
import { useGetJobsQuery } from "../../store/services/jobsService";
import {
  useGetProcurementStatsQuery,
  useGetLeadsQuery,
} from "../../store/services/procurementService";

// ─── Types ────────────────────────────────────────────────────────────────────

type Period = "day" | "week" | "month" | "year";

// ─── Helpers ──────────────────────────────────────────────────────────────────

function getDateRange(period: Period): { from: string; to: string } {
  const now = new Date();
  let from: Date;
  switch (period) {
    case "day":   from = new Date(now.getFullYear(), now.getMonth(), now.getDate()); break;
    case "week":  from = new Date(now.getFullYear(), now.getMonth(), now.getDate() - 6); break;
    case "month": from = new Date(now.getFullYear(), now.getMonth(), 1); break;
    case "year":  from = new Date(now.getFullYear(), 0, 1); break;
  }
  return {
    from: from.toISOString().split("T")[0],
    to:   new Date(now.getFullYear(), now.getMonth(), now.getDate(), 23, 59, 59).toISOString().split("T")[0] + "T23:59:59.000Z",
  };
}

const PERIODS: { value: Period; label: string }[] = [
  { value: "day",   label: "Today" },
  { value: "week",  label: "This Week" },
  { value: "month", label: "This Month" },
  { value: "year",  label: "This Year" },
];

const PAGE_SIZE = 8;

// ─── Letterhead + PDF helpers (shared with Reception) ────────────────────────

const COMPANY = {
  name:    "PALLOTTI PRESSE LTD",
  society: "SOCIETE DE L'APOSTOLAT CATHOLIQUE",
  tagline: "Editions - Imprimerie",
  address: "B.P. 863 Kigali - Rwanda",
  tin:     "TIN / T.V.A.: NO 100021520",
  tel:     "Tel: Reception (+250) 788 313 617 / (+250) 788 304 549",
  rc:      "No. RC: 536 / 09 / NYR",
  email:   "E-mail: pallottipresse@yahoo.com",
  compte:  "Compte: BK: 10000017 4372",
  motto:   "Rapidite - Qualite - Innovation - Esprit d'Equipe",
};

const HEADER_H   = 35;
const FOOTER_TOP = 26;
const TABLE_START_Y = HEADER_H + 23;
const BOTTOM_MARGIN = FOOTER_TOP + 6;

function loadImageAsBase64(url: string): Promise<string> {
  return new Promise((resolve, reject) => {
    const img = new Image();
    img.crossOrigin = "anonymous";
    img.onload = () => {
      const canvas = document.createElement("canvas");
      canvas.width = img.width; canvas.height = img.height;
      canvas.getContext("2d")!.drawImage(img, 0, 0);
      resolve(canvas.toDataURL("image/png"));
    };
    img.onerror = reject;
    img.src = url;
  });
}

function drawLetterhead(pdf: any, headerBase64: string | null, title: string, subtitle: string) {
  const pw = pdf.internal.pageSize.getWidth();
  if (headerBase64) pdf.addImage(headerBase64, "PNG", 0, 0, pw, HEADER_H);
  pdf.setFont("helvetica", "bold"); pdf.setFontSize(12); pdf.setTextColor(25, 25, 25);
  pdf.text(title, pw / 2, HEADER_H + 10, { align: "center" });
  if (subtitle) {
    pdf.setFont("helvetica", "normal"); pdf.setFontSize(7.5); pdf.setTextColor(110, 110, 110);
    pdf.text(subtitle, pw / 2, HEADER_H + 16, { align: "center" });
  }
}

function drawFooter(pdf: any, pageNum: number, totalPages: number) {
  const pw = pdf.internal.pageSize.getWidth();
  const ph = pdf.internal.pageSize.getHeight();
  const fy = ph - FOOTER_TOP;
  pdf.setDrawColor(200, 200, 200); pdf.setLineWidth(0.3);
  pdf.line(10, fy, pw - 10, fy);
  pdf.setFont("helvetica", "normal"); pdf.setFontSize(6.5); pdf.setTextColor(60, 60, 60);
  const col1 = 12, col2 = pw / 2, col3 = pw - 12;
  pdf.text(COMPANY.address, col1, fy + 5);  pdf.text(COMPANY.tin,   col1, fy + 10);
  pdf.text(COMPANY.tel,     col2, fy + 5,  { align: "center" }); pdf.text(COMPANY.rc, col2, fy + 10, { align: "center" });
  pdf.text(COMPANY.email,   col3, fy + 5,  { align: "right" });  pdf.text(COMPANY.compte, col3, fy + 10, { align: "right" });
  pdf.setFont("helvetica", "bolditalic"); pdf.setFontSize(7); pdf.setTextColor(0, 160, 210);
  pdf.text(COMPANY.motto, col2, fy + 16, { align: "center" });
  pdf.setFont("helvetica", "normal"); pdf.setFontSize(6.5); pdf.setTextColor(150, 150, 150);
  pdf.text(`Page ${pageNum} of ${totalPages}`, pw - 10, fy + 16, { align: "right" });
}

type SummaryRow = { label: string; value: string; bold?: boolean };

async function buildPdf(title: string, headers: string[], rows: string[][], summary: SummaryRow[]) {
  const headerBase64 = await loadImageAsBase64("/header.png").catch(() => null);
  const subtitle     = `Generated: ${new Date().toLocaleString("en-RW")}`;
  const pdf = new jsPDF({ orientation: "portrait", unit: "mm", format: "a4" });
  const pw  = pdf.internal.pageSize.getWidth();
  drawLetterhead(pdf, headerBase64, title, subtitle);
  autoTable(pdf, {
    head: [headers], body: rows,
    startY: TABLE_START_Y,
    margin: { left: 10, right: 10, bottom: BOTTOM_MARGIN },
    styles: { fontSize: 7, cellPadding: 2 },
    headStyles: { fillColor: [0, 160, 210], textColor: 255, fontStyle: "bold" },
    alternateRowStyles: { fillColor: [245, 251, 255] },
    didDrawPage: (data: { pageNumber: number }) => {
      if (data.pageNumber > 1) drawLetterhead(pdf, headerBase64, title, subtitle);
      drawFooter(pdf, data.pageNumber, (pdf as any).internal.getNumberOfPages());
    },
  });
  if (summary.length > 0) {
    const afterTable = (pdf as any).lastAutoTable.finalY + 8;
    const col1 = pw - 90, col2 = pw - 12;
    pdf.setDrawColor(0, 160, 210); pdf.setLineWidth(0.4);
    pdf.line(col1, afterTable - 3, col2, afterTable - 3);
    let sy = afterTable;
    summary.forEach(({ label, value, bold }) => {
      pdf.setFont("helvetica", bold ? "bold" : "normal"); pdf.setFontSize(8); pdf.setTextColor(40, 40, 40);
      pdf.text(label, col1, sy); pdf.text(value, col2, sy, { align: "right" }); sy += 6;
    });
    pdf.setDrawColor(0, 160, 210); pdf.line(col1, sy, col2, sy);
  }
  const totalPages = (pdf as any).internal.getNumberOfPages();
  for (let i = 1; i <= totalPages; i++) { pdf.setPage(i); drawFooter(pdf, i, totalPages); }
  pdf.save(`${title.replace(/\s+/g, "_")}_${new Date().toISOString().split("T")[0]}.pdf`);
}

// ─── Sub-components ───────────────────────────────────────────────────────────

const stageConfig: Record<string, { label: string; color: string; bg: string }> = {
  prospect:    { label: "Prospect",    color: "text-gray-700",    bg: "bg-gray-100"    },
  contacted:   { label: "Contacted",   color: "text-blue-700",    bg: "bg-blue-100"    },
  negotiating: { label: "Negotiating", color: "text-yellow-700",  bg: "bg-yellow-100"  },
  won:         { label: "Won",         color: "text-emerald-700", bg: "bg-emerald-100" },
  lost:        { label: "Lost",        color: "text-red-700",     bg: "bg-red-100"     },
};

function PeriodTabs({ value, onChange }: { value: Period; onChange: (p: Period) => void }) {
  return (
    <div className="flex gap-1 bg-custom-100 p-1 rounded-xl w-fit">
      {PERIODS.map((p) => (
        <button key={p.value} onClick={() => onChange(p.value)}
          className={`px-3 py-1.5 rounded-lg text-xs font-semibold transition-colors ${
            value === p.value ? "bg-primary-500 text-white shadow-sm" : "text-custom-700 hover:text-secondary-100"
          }`}>{p.label}</button>
      ))}
    </div>
  );
}

function StatCard({ label, value, sub, color = "text-secondary-100" }: {
  label: string; value: string | number; sub?: string; color?: string;
}) {
  return (
    <Card className="!p-4">
      <p className="text-xs text-custom-700 mb-1">{label}</p>
      <p className={`text-2xl font-bold ${color}`}>{value}</p>
      {sub && <p className="text-xs text-custom-700 mt-0.5">{sub}</p>}
    </Card>
  );
}

function Section({ icon: Icon, title, color, children }: {
  icon: React.ElementType; title: string; color: string; children: React.ReactNode;
}) {
  return (
    <div className="space-y-4">
      <div className="flex items-center gap-2">
        <div className={`w-8 h-8 rounded-lg flex items-center justify-center ${color}`}>
          <Icon className="w-4 h-4" />
        </div>
        <h2 className="text-base font-bold text-secondary-100">{title}</h2>
      </div>
      {children}
    </div>
  );
}

function PdfButtons({ title, getExportData }: {
  title: string;
  getExportData: () => { headers: string[]; rows: string[][]; summary: SummaryRow[] };
}) {
  const [showModal, setShowModal] = useState(false);
  const handlePdf = () => {
    const { headers, rows, summary } = getExportData();
    buildPdf(title, headers, rows, summary).catch((err) => alert("PDF error: " + (err as Error).message));
  };
  return (
    <>
      <button onClick={handlePdf}
        className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-red-500 text-white text-xs font-semibold hover:bg-red-600 transition-colors">
        <HiOutlineDocumentDownload className="w-4 h-4" /> PDF
      </button>
      <button onClick={() => setShowModal(true)}
        className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-primary-500 text-white text-xs font-semibold hover:bg-primary-600 transition-colors">
        <HiOutlineDocumentText className="w-4 h-4" /> Generate Report
      </button>
      {showModal && <GenerateReportModal title={title} onClose={() => setShowModal(false)} />}
    </>
  );
}

// ─── Tab 1: Job Approval Report ───────────────────────────────────────────────

const jobStatusColor: Record<string, string> = {
  pending:   "bg-yellow-100 text-yellow-700",
  confirmed: "bg-blue-100 text-blue-700",
  rejected:  "bg-red-100 text-red-700",
  delivered: "bg-emerald-100 text-emerald-700",
  completed: "bg-green-100 text-green-700",
};

function JobApprovalReport() {
  const [period, setPeriod]         = useState<Period>("month");
  const [page, setPage]             = useState(1);
  const [customFrom, setCustomFrom] = useState("");
  const [customTo, setCustomTo]     = useState("");
  const [useCustom, setUseCustom]   = useState(false);

  const range = useCustom && customFrom && customTo
    ? { from: customFrom, to: customTo + "T23:59:59.000Z" }
    : getDateRange(period);

  const { data: pendingData,   isLoading, refetch: r1 } = useGetJobsQuery({ status: "pending",   limit: 500 });
  const { data: confirmedData, refetch: r2 }            = useGetJobsQuery({ status: "confirmed", limit: 500 });
  const { data: rejectedData,  refetch: r3 }            = useGetJobsQuery({ status: "rejected",  limit: 500 });

  const refetch = () => { r1(); r2(); r3(); };

  const allJobs = [
    ...(pendingData?.jobs   ?? []),
    ...(confirmedData?.jobs ?? []),
    ...(rejectedData?.jobs  ?? []),
  ];

  const jobs = allJobs.filter((j) => {
    const d = new Date(j.createdAt);
    return d >= new Date(range.from) && d <= new Date(range.to);
  });

  const totalPages    = Math.max(1, Math.ceil(jobs.length / PAGE_SIZE));
  const paginated     = jobs.slice((page - 1) * PAGE_SIZE, page * PAGE_SIZE);
  const pending       = jobs.filter((j) => j.status === "pending");
  const confirmed     = jobs.filter((j) => j.status === "confirmed");
  const rejected      = jobs.filter((j) => j.status === "rejected");
  const totalValue    = confirmed.reduce((s, j) => s + (Number(j.amount) || 0), 0);
  const pendingValue  = pending.reduce((s, j) => s + (Number(j.amount) || 0), 0);

  const getExportData = () => ({
    headers: ["Job #", "Title", "Customer", "Amount (RWF)", "Status", "Payment", "Deadline", "Created"],
    rows: jobs.map((j) => [
      `#${j.jobNumber}`,
      j.title,
      j.customer?.name ?? "",
      (Number(j.amount) || 0).toLocaleString(),
      j.status,
      j.paymentStatus === "paid" ? "Paid" : "Unpaid",
      j.dueDate ? j.dueDate.split("T")[0] : "",
      new Date(j.createdAt).toLocaleDateString("en-RW", { day: "2-digit", month: "short", year: "numeric" }),
    ]),
    summary: [
      { label: "Total Jobs",       value: String(jobs.length) },
      { label: "Pending",          value: String(pending.length) },
      { label: "Confirmed",        value: String(confirmed.length) },
      { label: "Rejected",         value: String(rejected.length) },
      { label: "Pending Value",    value: `${pendingValue.toLocaleString()} RWF` },
      { label: "CONFIRMED VALUE",  value: `${totalValue.toLocaleString()} RWF`, bold: true },
    ] as SummaryRow[],
  });

  return (
    <Section icon={HiOutlineBriefcase} title="Job Approval Report" color="bg-blue-100 text-blue-600">
      {/* Controls */}
      <div className="flex flex-wrap items-center gap-3">
        <PeriodTabs value={period} onChange={(p) => { setPeriod(p); setUseCustom(false); setPage(1); }} />
        <div className="flex items-center gap-2 ml-auto flex-wrap">
          <input type="date" value={customFrom}
            onChange={(e) => { setCustomFrom(e.target.value); setUseCustom(true); setPage(1); }}
            className="px-2 py-1.5 rounded-lg border border-custom-300 bg-style-500 text-secondary-100 text-xs focus:outline-none focus:border-primary-400" />
          <span className="text-xs text-custom-700">to</span>
          <input type="date" value={customTo} min={customFrom}
            onChange={(e) => { setCustomTo(e.target.value); setUseCustom(true); setPage(1); }}
            className="px-2 py-1.5 rounded-lg border border-custom-300 bg-style-500 text-secondary-100 text-xs focus:outline-none focus:border-primary-400" />
          {useCustom && (
            <button onClick={() => { setCustomFrom(""); setCustomTo(""); setUseCustom(false); setPage(1); }}
              className="px-2 py-1.5 rounded-lg border border-custom-300 text-xs text-custom-700 hover:bg-custom-100">Clear</button>
          )}
          <button onClick={refetch} className="p-1.5 rounded-lg border border-custom-300 hover:bg-custom-100">
            <HiOutlineRefresh className={`w-4 h-4 text-custom-700 ${isLoading ? "animate-spin" : ""}`} />
          </button>
          <PdfButtons title="DAF Job Approval Report" getExportData={getExportData} />
        </div>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
        <StatCard label="Total Jobs"      value={jobs.length} />
        <StatCard label="Pending"         value={pending.length}   color="text-yellow-600"
          sub={`${pendingValue.toLocaleString()} RWF`} />
        <StatCard label="Confirmed"       value={confirmed.length} color="text-blue-600"
          sub={`${totalValue.toLocaleString()} RWF`} />
        <StatCard label="Rejected"        value={rejected.length}  color="text-red-600" />
      </div>

      {/* Table */}
      <Card className="!p-0 overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead className="bg-custom-100 border-b border-custom-300">
              <tr>
                {["Job #", "Title & Client", "Amount", "Status", "Payment", "Deadline", "Created"].map((h) => (
                  <th key={h} className="px-3 py-2 text-left text-xs font-bold text-secondary-100 uppercase">{h}</th>
                ))}
              </tr>
            </thead>
            <tbody className="divide-y divide-custom-200">
              {isLoading ? (
                <tr><td colSpan={7} className="px-4 py-8 text-center text-custom-700 text-sm">Loading…</td></tr>
              ) : jobs.length === 0 ? (
                <tr><td colSpan={7} className="px-4 py-8 text-center text-custom-700 text-sm">No jobs in this period</td></tr>
              ) : paginated.map((j) => (
                <tr key={j.id} className="hover:bg-custom-50 transition-colors">
                  <td className="px-3 py-2.5 text-xs font-mono font-bold text-primary-500">#{j.jobNumber}</td>
                  <td className="px-3 py-2.5">
                    <p className="text-sm font-semibold text-secondary-100">{j.title}</p>
                    <p className="text-xs text-custom-700">{j.customer?.name ?? "—"}</p>
                  </td>
                  <td className="px-3 py-2.5 text-sm font-bold text-secondary-100">
                    {j.amount != null ? `${(Number(j.amount) || 0).toLocaleString()} RWF` : "—"}
                  </td>
                  <td className="px-3 py-2.5">
                    <span className={`text-xs font-bold px-2 py-0.5 rounded-full ${jobStatusColor[j.status] ?? "bg-gray-100 text-gray-700"}`}>
                      {j.status === "pending"   && <HiOutlineExclamationCircle className="inline w-3 h-3 mr-1" />}
                      {j.status === "confirmed" && <HiOutlineCheckCircle       className="inline w-3 h-3 mr-1" />}
                      {j.status === "rejected"  && <HiOutlineXCircle           className="inline w-3 h-3 mr-1" />}
                      {j.status}
                    </span>
                  </td>
                  <td className="px-3 py-2.5">
                    <span className={`text-xs font-bold px-2 py-0.5 rounded-full ${j.paymentStatus === "paid" ? "bg-emerald-100 text-emerald-700" : "bg-red-100 text-red-600"}`}>
                      {j.paymentStatus === "paid" ? "Paid" : "Unpaid"}
                    </span>
                  </td>
                  <td className="px-3 py-2.5 text-xs text-custom-700">
                    {j.dueDate ? j.dueDate.split("T")[0] : "—"}
                  </td>
                  <td className="px-3 py-2.5 text-xs text-custom-700">
                    {new Date(j.createdAt).toLocaleDateString("en-RW", { day: "2-digit", month: "short", year: "numeric" })}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </Card>

      {/* Summary */}
      {jobs.length > 0 && (
        <div className="flex justify-end">
          <div className="border border-custom-300 rounded-xl overflow-hidden text-sm w-72">
            <div className="bg-custom-100 px-4 py-2 font-bold text-secondary-100 text-xs uppercase">Summary</div>
            {[
              { label: "Total Jobs",      value: String(jobs.length),                   cls: "text-secondary-100" },
              { label: "Pending",         value: String(pending.length),                cls: "text-yellow-600" },
              { label: "Confirmed",       value: String(confirmed.length),              cls: "text-blue-600" },
              { label: "Rejected",        value: String(rejected.length),               cls: "text-red-600" },
              { label: "Confirmed Value", value: `${totalValue.toLocaleString()} RWF`,  cls: "text-blue-600 font-bold" },
            ].map(({ label, value, cls }) => (
              <div key={label} className="flex justify-between px-4 py-2 border-t border-custom-200">
                <span className="text-custom-700 text-xs">{label}</span>
                <span className={`text-xs ${cls}`}>{value}</span>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Pagination */}
      {jobs.length > PAGE_SIZE && (
        <div className="flex items-center justify-between">
          <p className="text-xs text-custom-700">
            Showing {(page - 1) * PAGE_SIZE + 1}–{Math.min(page * PAGE_SIZE, jobs.length)} of {jobs.length}
          </p>
          <div className="flex items-center gap-1">
            <button onClick={() => setPage((p) => Math.max(1, p - 1))} disabled={page === 1}
              className="px-3 py-1.5 rounded-lg border border-custom-300 text-xs font-semibold hover:bg-custom-100 disabled:opacity-40">Prev</button>
            {Array.from({ length: totalPages }, (_, i) => i + 1).map((n) => (
              <button key={n} onClick={() => setPage(n)}
                className={`w-8 h-8 rounded-lg text-xs font-bold transition-colors ${n === page ? "bg-primary-500 text-white" : "border border-custom-300 hover:bg-custom-100"}`}>{n}</button>
            ))}
            <button onClick={() => setPage((p) => Math.min(totalPages, p + 1))} disabled={page === totalPages}
              className="px-3 py-1.5 rounded-lg border border-custom-300 text-xs font-semibold hover:bg-custom-100 disabled:opacity-40">Next</button>
          </div>
        </div>
      )}
    </Section>
  );
}

// ─── Tab 2: Procurement / Market Leads Report ────────────────────────────────

function ProcurementReport() {
  const [page, setPage]               = useState(1);
  const [stageFilter, setStageFilter] = useState<string>("all");

  const { data: statsData, isLoading: loadingStats, refetch: refetchStats } = useGetProcurementStatsQuery();
  const { data: leadsData, isLoading: loadingLeads, refetch: refetchLeads } = useGetLeadsQuery({
    stage: stageFilter !== "all" ? (stageFilter as any) : undefined,
    page,
    limit: 500,
  });

  const refetch = () => { refetchStats(); refetchLeads(); };

  const leads      = leadsData?.leads ?? [];
  const kpi        = statsData?.kpi;
  const pipeline   = statsData?.pipeline ?? [];
  const totalPages = Math.max(1, Math.ceil(leads.length / PAGE_SIZE));
  const paginated  = leads.slice((page - 1) * PAGE_SIZE, page * PAGE_SIZE);
  const isLoading  = loadingStats || loadingLeads;

  const wonValue   = kpi?.wonValue ?? 0;
  const totalValue = pipeline.reduce((s, p) => s + p.totalValue, 0);

  const getExportData = () => ({
    headers: ["Company", "Contact", "Phone", "Sector", "Stage", "Est. Value (RWF)", "Location", "Next Follow-up", "Added"],
    rows: leads.map((l) => [
      l.company,
      l.contactPerson,
      l.phone ?? "",
      l.sector,
      l.stage,
      (l.estimatedValue ?? 0).toLocaleString(),
      l.location ?? "",
      l.nextFollowUp ? l.nextFollowUp.slice(0, 10) : "",
      l.createdAt?.slice(0, 10) ?? "",
    ]),
    summary: [
      { label: "Total Leads",     value: String(kpi?.totalLeads ?? leads.length) },
      { label: "Won",             value: String(kpi?.wonCount ?? 0) },
      { label: "In Progress",     value: String(kpi?.inProgress ?? 0) },
      { label: "Overdue Follow-ups", value: String(kpi?.overdueFollowUps ?? 0) },
      { label: "WON VALUE",       value: `${wonValue.toLocaleString()} RWF`, bold: true },
    ] as SummaryRow[],
  });

  return (
    <Section icon={HiOutlineChartBar} title="Procurement / Market Leads" color="bg-purple-100 text-purple-600">
      {/* Controls */}
      <div className="flex flex-wrap items-center gap-3">
        {/* Stage filter pills */}
        <div className="flex gap-1 bg-custom-100 p-1 rounded-xl w-fit flex-wrap">
          {[{ value: "all", label: "All" }, ...Object.entries(stageConfig).map(([v, c]) => ({ value: v, label: c.label }))].map((s) => (
            <button key={s.value} onClick={() => { setStageFilter(s.value); setPage(1); }}
              className={`px-3 py-1.5 rounded-lg text-xs font-semibold transition-colors ${
                stageFilter === s.value ? "bg-primary-500 text-white shadow-sm" : "text-custom-700 hover:text-secondary-100"
              }`}>{s.label}</button>
          ))}
        </div>
        <div className="flex items-center gap-2 ml-auto">
          <button onClick={refetch} className="p-1.5 rounded-lg border border-custom-300 hover:bg-custom-100">
            <HiOutlineRefresh className={`w-4 h-4 text-custom-700 ${isLoading ? "animate-spin" : ""}`} />
          </button>
          <PdfButtons title="DAF Procurement Report" getExportData={getExportData} />
        </div>
      </div>

      {/* KPI Stats */}
      <div className="grid grid-cols-2 sm:grid-cols-5 gap-4">
        <StatCard label="Total Leads"       value={kpi?.totalLeads ?? 0} />
        <StatCard label="In Progress"       value={kpi?.inProgress ?? 0}        color="text-yellow-600" />
        <StatCard label="Won"               value={kpi?.wonCount ?? 0}           color="text-emerald-600" />
        <StatCard label="Overdue"           value={kpi?.overdueFollowUps ?? 0}   color="text-red-600" />
        <StatCard label="Won Value"         value={`${wonValue.toLocaleString()} RWF`} color="text-emerald-600"
          sub={`Total pipeline: ${totalValue.toLocaleString()} RWF`} />
      </div>

      {/* Pipeline overview */}
      {pipeline.length > 0 && (
        <div className="flex gap-2 flex-wrap">
          {pipeline.map(({ stage, count, totalValue: tv }) => {
            const cfg = stageConfig[stage] ?? { label: stage, color: "text-gray-700", bg: "bg-gray-100" };
            return (
              <div key={stage}
                onClick={() => setStageFilter(stageFilter === stage ? "all" : stage)}
                className={`flex-1 min-w-[90px] p-3 rounded-xl border-2 cursor-pointer transition-all ${
                  stageFilter === stage ? "border-primary-500 shadow-sm" : "border-transparent"
                } ${cfg.bg}`}>
                <p className={`text-xs font-bold ${cfg.color}`}>{cfg.label}</p>
                <p className={`text-2xl font-bold ${cfg.color} mt-1`}>{count}</p>
                {tv > 0 && (
                  <p className={`text-xs ${cfg.color} opacity-70`}>
                    {tv >= 1_000_000 ? `${(tv / 1_000_000).toFixed(1)}M` : tv.toLocaleString()} RWF
                  </p>
                )}
              </div>
            );
          })}
        </div>
      )}

      {/* Table */}
      <Card className="!p-0 overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead className="bg-custom-100 border-b border-custom-300">
              <tr>
                {["Company", "Contact", "Sector", "Stage", "Est. Value", "Location", "Next Follow-up", "Added"].map((h) => (
                  <th key={h} className="px-3 py-2 text-left text-xs font-bold text-secondary-100 uppercase">{h}</th>
                ))}
              </tr>
            </thead>
            <tbody className="divide-y divide-custom-200">
              {isLoading ? (
                <tr><td colSpan={8} className="px-4 py-8 text-center text-custom-700 text-sm">Loading…</td></tr>
              ) : leads.length === 0 ? (
                <tr><td colSpan={8} className="px-4 py-8 text-center text-custom-700 text-sm">No leads found</td></tr>
              ) : paginated.map((l) => {
                const stageCfg = stageConfig[l.stage] ?? { label: l.stage, color: "text-gray-700", bg: "bg-gray-100" };
                const isOverdue = l.nextFollowUp && new Date(l.nextFollowUp) < new Date() && l.stage !== "won" && l.stage !== "lost";
                return (
                  <tr key={l.id} className="hover:bg-custom-50 transition-colors">
                    <td className="px-3 py-2.5">
                      <p className="text-sm font-semibold text-secondary-100">{l.company}</p>
                    </td>
                    <td className="px-3 py-2.5">
                      <p className="text-sm text-secondary-100">{l.contactPerson}</p>
                      {l.phone && <p className="text-xs text-custom-700">{l.phone}</p>}
                    </td>
                    <td className="px-3 py-2.5 text-xs text-custom-700 capitalize">{l.sector}</td>
                    <td className="px-3 py-2.5">
                      <span className={`text-xs font-bold px-2 py-0.5 rounded-full ${stageCfg.bg} ${stageCfg.color}`}>
                        {stageCfg.label}
                      </span>
                    </td>
                    <td className="px-3 py-2.5 text-sm font-bold text-purple-600">
                      {(l.estimatedValue ?? 0) > 0 ? `${(l.estimatedValue!).toLocaleString()} RWF` : "—"}
                    </td>
                    <td className="px-3 py-2.5 text-xs text-custom-700">{l.location ?? "—"}</td>
                    <td className="px-3 py-2.5">
                      {l.nextFollowUp ? (
                        <span className={`text-xs font-semibold ${isOverdue ? "text-red-600" : "text-custom-700"}`}>
                          {l.nextFollowUp.slice(0, 10)}
                          {isOverdue && " ⚠"}
                        </span>
                      ) : <span className="text-xs text-custom-400">—</span>}
                    </td>
                    <td className="px-3 py-2.5 text-xs text-custom-700">{l.createdAt?.slice(0, 10) ?? "—"}</td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      </Card>

      {/* Summary */}
      {leads.length > 0 && (
        <div className="flex justify-end">
          <div className="border border-custom-300 rounded-xl overflow-hidden text-sm w-72">
            <div className="bg-custom-100 px-4 py-2 font-bold text-secondary-100 text-xs uppercase">Summary</div>
            {[
              { label: "Total Leads",   value: String(kpi?.totalLeads ?? leads.length), cls: "text-secondary-100" },
              { label: "Won",           value: String(kpi?.wonCount ?? 0),              cls: "text-emerald-600" },
              { label: "In Progress",   value: String(kpi?.inProgress ?? 0),            cls: "text-yellow-600" },
              { label: "Won Value",     value: `${wonValue.toLocaleString()} RWF`,       cls: "text-emerald-600 font-bold" },
              { label: "Pipeline Total",value: `${totalValue.toLocaleString()} RWF`,    cls: "text-purple-600 font-bold" },
            ].map(({ label, value, cls }) => (
              <div key={label} className="flex justify-between px-4 py-2 border-t border-custom-200">
                <span className="text-custom-700 text-xs">{label}</span>
                <span className={`text-xs ${cls}`}>{value}</span>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Pagination */}
      {leads.length > PAGE_SIZE && (
        <div className="flex items-center justify-between">
          <p className="text-xs text-custom-700">
            Showing {(page - 1) * PAGE_SIZE + 1}–{Math.min(page * PAGE_SIZE, leads.length)} of {leads.length}
          </p>
          <div className="flex items-center gap-1">
            <button onClick={() => setPage((p) => Math.max(1, p - 1))} disabled={page === 1}
              className="px-3 py-1.5 rounded-lg border border-custom-300 text-xs font-semibold hover:bg-custom-100 disabled:opacity-40">Prev</button>
            {Array.from({ length: totalPages }, (_, i) => i + 1).map((n) => (
              <button key={n} onClick={() => setPage(n)}
                className={`w-8 h-8 rounded-lg text-xs font-bold transition-colors ${n === page ? "bg-primary-500 text-white" : "border border-custom-300 hover:bg-custom-100"}`}>{n}</button>
            ))}
            <button onClick={() => setPage((p) => Math.min(totalPages, p + 1))} disabled={page === totalPages}
              className="px-3 py-1.5 rounded-lg border border-custom-300 text-xs font-semibold hover:bg-custom-100 disabled:opacity-40">Next</button>
          </div>
        </div>
      )}
    </Section>
  );
}

// ─── Main Page ────────────────────────────────────────────────────────────────

type Tab = "job-approval" | "procurement";

const TABS: { value: Tab; label: string; icon: React.ElementType }[] = [
  { value: "job-approval",  label: "Job Approval",  icon: HiOutlineBriefcase },
  { value: "procurement",   label: "Procurement",   icon: HiOutlineChartBar  },
];

export default function DAFReportsPage() {
  const [activeTab, setActiveTab] = useState<Tab>("job-approval");

  return (
    <DashboardLayout userRole="daf" userName="DAF">
      <div className="space-y-6 font-[family-name:var(--font-family-primary)]">

        {/* Header */}
        <div>
          <div className="flex items-center gap-2 mb-1">
            <HiOutlineChartBar className="w-6 h-6 text-primary-500" />
            <h1 className="text-2xl md:text-3xl font-bold text-secondary-100">DAF Reports</h1>
          </div>
          <p className="text-sm text-custom-700">
            Job approval status and procurement pipeline — filter by period or stage
          </p>
        </div>

        {/* Tab bar */}
        <div className="flex gap-2 flex-wrap border-b border-custom-200 pb-1">
          {TABS.map((t) => (
            <button key={t.value} onClick={() => setActiveTab(t.value)}
              className={`flex items-center gap-2 px-4 py-2 rounded-t-xl text-sm font-semibold transition-colors border-b-2 ${
                activeTab === t.value
                  ? "border-primary-500 text-primary-500 bg-primary-50"
                  : "border-transparent text-custom-700 hover:text-secondary-100 hover:bg-custom-50"
              }`}>
              <t.icon className="w-4 h-4" />
              {t.label}
            </button>
          ))}
        </div>

        {/* Tab content */}
        {activeTab === "job-approval" && <JobApprovalReport />}
        {activeTab === "procurement"  && <ProcurementReport />}

      </div>
    </DashboardLayout>
  );
}
