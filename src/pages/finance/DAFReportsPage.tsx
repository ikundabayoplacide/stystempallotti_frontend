import { useState } from "react";
import { toast } from "react-toastify";
import {
  HiOutlineBriefcase,
  HiOutlineCash,
  HiOutlineChartBar,
  HiOutlineDocumentDownload,
  HiOutlineDocumentText,
  HiOutlineRefresh,
  HiOutlineUsers,
  HiOutlineX,
} from "react-icons/hi";
import jsPDF from "jspdf";
import autoTable from "jspdf-autotable";
import { DashboardLayout } from "../../components";
import { Card } from "../../components/ui";
import { useGetJobsQuery } from "../../store/services/jobsService";
import { useGetPaymentsQuery } from "../../store/services/paymentsService";
import { useGetAllEmployeesQuery } from "../../store/services/employeesService";
import { useCreateReportMutation } from "../../store/services/reportsService";

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

// ─── Generate Report Modal ────────────────────────────────────────────────────

type ReportItem = { record: string; quantity: string; amount: string };

function GenerateReportModal({ title, onClose }: { title: string; onClose: () => void }) {
  const [purpose, setPurpose]   = useState("");
  const [items, setItems]       = useState<ReportItem[]>([{ record: "", quantity: "", amount: "" }]);
  const [pdfFile, setPdfFile]   = useState<File | null>(null);
  const [notes, setNotes]       = useState("");
  const [submitting, setSubmitting] = useState(false);
  const [createReport] = useCreateReportMutation();

  const addItem    = () => setItems((p) => [...p, { record: "", quantity: "", amount: "" }]);
  const removeItem = (i: number) => setItems((p) => p.filter((_, idx) => idx !== i));
  const updateItem = (i: number, field: keyof ReportItem, value: string) =>
    setItems((p) => p.map((item, idx) => idx === i ? { ...item, [field]: value } : item));

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setSubmitting(true);
    const filledItems = items.filter((it) => it.record.trim());
    try {
      await createReport({ title, purpose, items: filledItems, notes: notes.trim() || undefined, attachment: pdfFile ?? undefined }).unwrap();
      toast.success("Report submitted successfully");
      onClose();
    } catch { toast.error("Failed to submit report"); }
    finally { setSubmitting(false); }
  };

  const inputCls = "w-full px-3 py-2 rounded-xl border border-custom-300 bg-style-500 text-secondary-100 text-sm focus:outline-none focus:border-primary-400 transition-colors";

  return (
    <div className="fixed inset-0 bg-black/40 z-50 flex items-start justify-center p-4 overflow-y-auto">
      <div className="bg-style-500 rounded-2xl shadow-xl max-w-lg w-full my-8 p-6">
        <div className="flex items-center justify-between mb-5">
          <div>
            <h3 className="text-lg font-bold text-secondary-100">Generate Report</h3>
            <p className="text-sm text-custom-700 mt-0.5">{title}</p>
          </div>
          <button onClick={onClose} className="text-custom-700 hover:text-secondary-100"><HiOutlineX className="w-5 h-5" /></button>
        </div>
        <form onSubmit={handleSubmit} className="space-y-5">
          <div>
            <label className="block text-xs font-semibold text-secondary-100 mb-1">Purpose / Subject *</label>
            <input required value={purpose} onChange={(e) => setPurpose(e.target.value)}
              placeholder="e.g. Monthly revenue summary for management" className={inputCls} />
          </div>
          <div>
            <div className="flex items-center justify-between mb-2">
              <label className="text-xs font-semibold text-secondary-100">Records</label>
              <button type="button" onClick={addItem}
                className="text-xs font-semibold text-primary-500 hover:text-primary-600">+ Add Row</button>
            </div>
            <div className="space-y-2">
              {items.map((item, i) => (
                <div key={i} className="flex gap-2 items-center">
                  <input value={item.record} onChange={(e) => updateItem(i, "record", e.target.value)}
                    placeholder="Record / Item *"
                    className="flex-1 px-3 py-2 rounded-xl border border-custom-300 bg-style-500 text-secondary-100 text-xs focus:outline-none focus:border-primary-400 transition-colors" />
                  <input type="number" min="0" value={item.quantity} onChange={(e) => updateItem(i, "quantity", e.target.value)}
                    placeholder="Qty"
                    className="w-20 px-3 py-2 rounded-xl border border-custom-300 bg-style-500 text-secondary-100 text-xs focus:outline-none focus:border-primary-400 transition-colors" />
                  <input type="number" min="0" value={item.amount} onChange={(e) => updateItem(i, "amount", e.target.value)}
                    placeholder="Amount"
                    className="w-28 px-3 py-2 rounded-xl border border-custom-300 bg-style-500 text-secondary-100 text-xs focus:outline-none focus:border-primary-400 transition-colors" />
                  {items.length > 1 && (
                    <button type="button" onClick={() => removeItem(i)} className="text-red-400 hover:text-red-600">
                      <HiOutlineX className="w-4 h-4" />
                    </button>
                  )}
                </div>
              ))}
            </div>
          </div>
          <div>
            <label className="block text-xs font-semibold text-secondary-100 mb-1">Attach File <span className="text-custom-700 font-normal">(optional)</span></label>
            <input type="file" accept=".pdf,.doc,.docx,.xls,.xlsx,.png,.jpg"
              onChange={(e) => setPdfFile(e.target.files?.[0] ?? null)}
              className="w-full text-xs text-custom-700 file:mr-3 file:py-2 file:px-4 file:rounded-xl file:border-0 file:text-xs file:font-semibold file:bg-primary-500 file:text-white hover:file:bg-primary-600" />
            {pdfFile && <p className="text-xs text-emerald-600 mt-1">✓ {pdfFile.name}</p>}
          </div>
          <div>
            <label className="block text-xs font-semibold text-secondary-100 mb-1">Notes <span className="text-custom-700 font-normal">(optional)</span></label>
            <textarea value={notes} onChange={(e) => setNotes(e.target.value)} rows={3}
              placeholder="Optional remarks..."
              className="w-full px-3 py-2 rounded-xl border border-custom-300 bg-style-500 text-secondary-100 text-sm focus:outline-none focus:border-primary-400 transition-colors resize-none" />
          </div>
          <div className="flex gap-3 justify-end pt-2 border-t border-custom-300">
            <button type="button" onClick={onClose}
              className="px-4 py-2 rounded-xl border border-custom-300 text-sm font-semibold text-secondary-100 hover:bg-custom-100 transition-colors">Cancel</button>
            <button type="submit" disabled={submitting}
              className="px-4 py-2 rounded-xl bg-primary-500 text-white text-sm font-semibold hover:bg-primary-600 transition-colors disabled:opacity-40">
              {submitting ? "Submitting…" : "Submit Report"}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}

// ─── Tab 1: Payments Report ───────────────────────────────────────────────────

const pmColors: Record<string, string> = {
  CASH: "bg-emerald-100 text-emerald-700", MOBILE_MONEY: "bg-yellow-100 text-yellow-700",
  BANK_TRANSFER: "bg-blue-100 text-blue-700", CARD: "bg-purple-100 text-purple-700",
};

function PaymentsReport() {
  const [period, setPeriod]         = useState<Period>("month");
  const [page, setPage]             = useState(1);
  const [customFrom, setCustomFrom] = useState("");
  const [customTo, setCustomTo]     = useState("");
  const [useCustom, setUseCustom]   = useState(false);

  const range = useCustom && customFrom && customTo
    ? { from: customFrom, to: customTo + "T23:59:59.000Z" }
    : getDateRange(period);

  const { data, isLoading, refetch } = useGetPaymentsQuery({ limit: 500, from: range.from, to: range.to });
  const payments = (data?.payments ?? []).filter((p) => p.paymentMethod !== null);
  const totalPages     = Math.max(1, Math.ceil(payments.length / PAGE_SIZE));
  const paginated      = payments.slice((page - 1) * PAGE_SIZE, page * PAGE_SIZE);
  const totalCollected = payments.reduce((s, p) => s + (Number(p.amountPaid) || 0), 0);
  const fullCount      = payments.filter((p) => p.paymentState === "FULL").length;
  const partialCount   = payments.filter((p) => p.paymentState === "PARTIAL").length;
  const byMethod: Record<string, number> = {};
  payments.forEach((p) => { byMethod[p.paymentMethod] = (byMethod[p.paymentMethod] ?? 0) + (Number(p.amountPaid) || 0); });

  const getExportData = () => ({
    headers: ["Receipt", "Job #", "Customer", "Phone", "Amount (RWF)", "Method", "Type", "Date"],
    rows: payments.map((p) => [
      p.receiptNo ?? "",
      p.job?.jobNumber ? `#${p.job.jobNumber}` : `#${p.jobId?.slice(0, 8) ?? ""}`,
      p.job?.customer?.name ?? "",
      p.job?.customer?.phone ?? "",
      (Number(p.amountPaid) || 0).toLocaleString(),
      p.paymentMethod.replace(/_/g, " "),
      p.paymentState === "FULL" ? "Full" : "Partial",
      new Date(p.paidAt).toLocaleDateString("en-RW", { day: "2-digit", month: "short", year: "numeric" }),
    ]),
    summary: [
      { label: "Total Payments",   value: String(payments.length) },
      { label: "Full Payments",    value: String(fullCount) },
      { label: "Partial Payments", value: String(partialCount) },
      { label: "TOTAL COLLECTED",  value: `${totalCollected.toLocaleString()} RWF`, bold: true },
    ] as SummaryRow[],
  });

  return (
    <Section icon={HiOutlineCash} title="Payments Collected" color="bg-emerald-100 text-emerald-600">
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
          <button onClick={() => refetch()} className="p-1.5 rounded-lg border border-custom-300 hover:bg-custom-100">
            <HiOutlineRefresh className={`w-4 h-4 text-custom-700 ${isLoading ? "animate-spin" : ""}`} />
          </button>
          <PdfButtons title="Finance Payments Report" getExportData={getExportData} />
        </div>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
        <StatCard label="Total Payments"   value={payments.length} />
        <StatCard label="Total Collected"  value={`${totalCollected.toLocaleString()} RWF`} color="text-emerald-600" />
        <StatCard label="Full Payments"    value={fullCount}    color="text-emerald-600" />
        <StatCard label="Partial Payments" value={partialCount} color="text-orange-600" />
      </div>

      {/* By method */}
      {Object.keys(byMethod).length > 0 && (
        <div className="flex flex-wrap gap-2">
          {Object.entries(byMethod).map(([m, amt]) => (
            <div key={m} className={`px-3 py-1.5 rounded-xl text-xs font-semibold ${pmColors[m] ?? "bg-gray-100 text-gray-700"}`}>
              {m.replace(/_/g, " ")}: {amt.toLocaleString()} RWF
            </div>
          ))}
        </div>
      )}

      {/* Table */}
      <Card className="!p-0 overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead className="bg-custom-100 border-b border-custom-300">
              <tr>
                {["Receipt", "Job", "Customer", "Amount", "Method", "Type", "Date"].map((h) => (
                  <th key={h} className="px-3 py-2 text-left text-xs font-bold text-secondary-100 uppercase">{h}</th>
                ))}
              </tr>
            </thead>
            <tbody className="divide-y divide-custom-200">
              {isLoading ? (
                <tr><td colSpan={7} className="px-4 py-8 text-center text-custom-700 text-sm">Loading…</td></tr>
              ) : payments.length === 0 ? (
                <tr><td colSpan={7} className="px-4 py-8 text-center text-custom-700 text-sm">No payments in this period</td></tr>
              ) : paginated.map((p) => (
                <tr key={p.id} className="hover:bg-custom-50 transition-colors">
                  <td className="px-3 py-2.5 text-xs font-mono font-bold text-primary-500">{p.receiptNo}</td>
                  <td className="px-3 py-2.5 text-xs font-mono text-primary-500">
                    {p.job?.jobNumber ? `#${p.job.jobNumber}` : `#${p.jobId?.slice(0, 8)}`}
                  </td>
                  <td className="px-3 py-2.5">
                    <p className="text-sm text-secondary-100">{p.job?.customer?.name ?? <span className="text-custom-400">—</span>}</p>
                    {p.job?.customer?.phone && <p className="text-xs text-custom-700">{p.job.customer.phone}</p>}
                  </td>
                  <td className="px-3 py-2.5 text-sm font-bold text-emerald-600">{(Number(p.amountPaid) || 0).toLocaleString()} RWF</td>
                  <td className="px-3 py-2.5">
                    <span className={`text-xs font-bold px-2 py-0.5 rounded-full ${pmColors[p.paymentMethod] ?? "bg-gray-100 text-gray-700"}`}>
                      {p.paymentMethod.replace(/_/g, " ")}
                    </span>
                  </td>
                  <td className="px-3 py-2.5">
                    <span className={`text-xs font-bold px-2 py-0.5 rounded-full ${p.paymentState === "FULL" ? "bg-emerald-100 text-emerald-700" : "bg-orange-100 text-orange-700"}`}>
                      {p.paymentState === "FULL" ? "Full" : "Partial"}
                    </span>
                  </td>
                  <td className="px-3 py-2.5 text-xs text-custom-700">
                    {new Date(p.paidAt).toLocaleDateString("en-RW", { day: "2-digit", month: "short", year: "numeric" })}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </Card>

      {/* Summary */}
      {payments.length > 0 && (
        <div className="flex justify-end">
          <div className="border border-custom-300 rounded-xl overflow-hidden text-sm w-72">
            <div className="bg-custom-100 px-4 py-2 font-bold text-secondary-100 text-xs uppercase">Summary</div>
            {[
              { label: "Total Payments",   value: String(payments.length),                   cls: "text-secondary-100" },
              { label: "Full Payments",    value: String(fullCount),                         cls: "text-emerald-600" },
              { label: "Partial Payments", value: String(partialCount),                      cls: "text-orange-600" },
              { label: "Total Collected",  value: `${totalCollected.toLocaleString()} RWF`,  cls: "text-emerald-600 font-bold" },
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
      {payments.length > PAGE_SIZE && (
        <div className="flex items-center justify-between">
          <p className="text-xs text-custom-700">
            Showing {(page - 1) * PAGE_SIZE + 1}–{Math.min(page * PAGE_SIZE, payments.length)} of {payments.length}
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

// ─── Tab 2: Jobs Financial Summary ────────────────────────────────────────────

const jobStatusColor: Record<string, string> = {
  pending:   "bg-yellow-100 text-yellow-700",
  confirmed: "bg-blue-100 text-blue-700",
  rejected:  "bg-red-100 text-red-700",
  delivered: "bg-emerald-100 text-emerald-700",
  completed: "bg-green-100 text-green-700",
};

function JobsReport() {
  const [period, setPeriod]         = useState<Period>("month");
  const [page, setPage]             = useState(1);
  const [customFrom, setCustomFrom] = useState("");
  const [customTo, setCustomTo]     = useState("");
  const [useCustom, setUseCustom]   = useState(false);

  const range = useCustom && customFrom && customTo
    ? { from: customFrom, to: customTo + "T23:59:59.000Z" }
    : getDateRange(period);

  const { data, isLoading, refetch } = useGetJobsQuery({ limit: 500 });
  const allJobs = data?.jobs ?? [];

  const jobs = allJobs.filter((j) => {
    const d = new Date(j.createdAt);
    return d >= new Date(range.from) && d <= new Date(range.to);
  });

  const totalPages    = Math.max(1, Math.ceil(jobs.length / PAGE_SIZE));
  const paginated     = jobs.slice((page - 1) * PAGE_SIZE, page * PAGE_SIZE);
  const totalValue    = jobs.reduce((s, j) => s + (Number(j.amount) || 0), 0);
  const paidJobs      = jobs.filter((j) => j.paymentStatus === "paid");
  const unpaidJobs    = jobs.filter((j) => j.paymentStatus !== "paid");
  const confirmedJobs = jobs.filter((j) => j.status === "confirmed").length;
  const pendingJobs   = jobs.filter((j) => j.status === "pending").length;

  const getExportData = () => ({
    headers: ["Job #", "Title", "Customer", "Type", "Amount (RWF)", "Status", "Payment", "Created"],
    rows: jobs.map((j) => [
      `#${j.jobNumber}`,
      j.title,
      j.customer?.name ?? "",
      j.jobType ?? "",
      (Number(j.amount) || 0).toLocaleString(),
      j.status,
      j.paymentStatus === "paid" ? "Paid" : "Unpaid",
      new Date(j.createdAt).toLocaleDateString("en-RW", { day: "2-digit", month: "short", year: "numeric" }),
    ]),
    summary: [
      { label: "Total Jobs",      value: String(jobs.length) },
      { label: "Confirmed",       value: String(confirmedJobs) },
      { label: "Pending",         value: String(pendingJobs) },
      { label: "Paid Jobs",       value: String(paidJobs.length) },
      { label: "TOTAL VALUE",     value: `${totalValue.toLocaleString()} RWF`, bold: true },
    ] as SummaryRow[],
  });

  return (
    <Section icon={HiOutlineBriefcase} title="Jobs Financial Overview" color="bg-blue-100 text-blue-600">
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
          <button onClick={() => refetch()} className="p-1.5 rounded-lg border border-custom-300 hover:bg-custom-100">
            <HiOutlineRefresh className={`w-4 h-4 text-custom-700 ${isLoading ? "animate-spin" : ""}`} />
          </button>
          <PdfButtons title="Finance Jobs Report" getExportData={getExportData} />
        </div>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-2 sm:grid-cols-5 gap-4">
        <StatCard label="Total Jobs"   value={jobs.length} />
        <StatCard label="Total Value"  value={`${totalValue.toLocaleString()} RWF`} color="text-primary-500" />
        <StatCard label="Confirmed"    value={confirmedJobs} color="text-blue-600" />
        <StatCard label="Pending"      value={pendingJobs}   color="text-yellow-600" />
        <StatCard label="Paid"         value={paidJobs.length}
          sub={unpaidJobs.length > 0 ? `${unpaidJobs.length} unpaid` : undefined}
          color="text-emerald-600" />
      </div>

      {/* Table */}
      <Card className="!p-0 overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead className="bg-custom-100 border-b border-custom-300">
              <tr>
                {["Job #", "Title & Client", "Type", "Amount", "Status", "Payment", "Created"].map((h) => (
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
                  <td className="px-3 py-2.5 text-xs text-custom-700">{j.jobType ?? "—"}</td>
                  <td className="px-3 py-2.5 text-sm font-bold text-secondary-100">
                    {j.amount != null ? `${(Number(j.amount) || 0).toLocaleString()} RWF` : "—"}
                  </td>
                  <td className="px-3 py-2.5">
                    <span className={`text-xs font-bold px-2 py-0.5 rounded-full ${jobStatusColor[j.status] ?? "bg-gray-100 text-gray-700"}`}>
                      {j.status}
                    </span>
                  </td>
                  <td className="px-3 py-2.5">
                    <span className={`text-xs font-bold px-2 py-0.5 rounded-full ${j.paymentStatus === "paid" ? "bg-emerald-100 text-emerald-700" : "bg-red-100 text-red-600"}`}>
                      {j.paymentStatus === "paid" ? "Paid" : "Unpaid"}
                    </span>
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

      {/* Pagination */}
      {jobs.length > PAGE_SIZE && (
        <div className="flex items-center justify-between">
          <p className="text-xs text-custom-700">Showing {(page - 1) * PAGE_SIZE + 1}–{Math.min(page * PAGE_SIZE, jobs.length)} of {jobs.length}</p>
          <div className="flex items-center gap-1">
            <button onClick={() => setPage((p) => Math.max(1, p - 1))} disabled={page === 1}
              className="px-3 py-1.5 rounded-lg border border-custom-300 text-xs font-semibold hover:bg-custom-100 disabled:opacity-40">Prev</button>
            {Array.from({ length: totalPages }, (_, i) => i + 1).map((n) => (
              <button key={n} onClick={() => setPage(n)}
                className={`w-8 h-8 rounded-lg text-xs font-bold ${n === page ? "bg-primary-500 text-white" : "border border-custom-300 hover:bg-custom-100"}`}>{n}</button>
            ))}
            <button onClick={() => setPage((p) => Math.min(totalPages, p + 1))} disabled={page === totalPages}
              className="px-3 py-1.5 rounded-lg border border-custom-300 text-xs font-semibold hover:bg-custom-100 disabled:opacity-40">Next</button>
          </div>
        </div>
      )}
    </Section>
  );
}

// ─── Tab 3: Payroll / Employees ───────────────────────────────────────────────

function PayrollReport() {
  const [page, setPage] = useState(1);
  const { data, isLoading, refetch } = useGetAllEmployeesQuery({ limit: 500 });
  const employees  = data?.data ?? [];
  const active     = employees.filter((e) => e.isActive);
  const inactive   = employees.filter((e) => !e.isActive);
  const totalPages = Math.max(1, Math.ceil(active.length / PAGE_SIZE));
  const paginated  = active.slice((page - 1) * PAGE_SIZE, page * PAGE_SIZE);
  const totalPayroll = active.reduce((s, e) => s + (Number(e.contractSalary) || 0), 0);

  const getExportData = () => ({
    headers: ["Full Name", "Phone", "Contract Type", "Salary (RWF)", "Status", "Hired"],
    rows: employees.map((e) => [
      e.fullName,
      e.phoneNumber,
      e.contractType ?? "",
      (Number(e.contractSalary) || 0).toLocaleString(),
      e.isActive ? "Active" : "Inactive",
      e.hiredAt ? new Date(e.hiredAt).toLocaleDateString("en-RW", { day: "2-digit", month: "short", year: "numeric" }) : "",
    ]),
    summary: [
      { label: "Total Employees",  value: String(employees.length) },
      { label: "Active",           value: String(active.length) },
      { label: "Inactive",         value: String(inactive.length) },
      { label: "MONTHLY PAYROLL",  value: `${totalPayroll.toLocaleString()} RWF`, bold: true },
    ] as SummaryRow[],
  });

  return (
    <Section icon={HiOutlineUsers} title="Payroll & Employees" color="bg-indigo-100 text-indigo-600">
      <div className="flex items-center gap-3 flex-wrap">
        <div className="flex-1" />
        <button onClick={() => refetch()} className="p-1.5 rounded-lg border border-custom-300 hover:bg-custom-100">
          <HiOutlineRefresh className={`w-4 h-4 text-custom-700 ${isLoading ? "animate-spin" : ""}`} />
        </button>
        <PdfButtons title="Payroll Report" getExportData={getExportData} />
      </div>

      {/* Stats */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
        <StatCard label="Total Employees" value={employees.length} />
        <StatCard label="Active"          value={active.length}   color="text-emerald-600" />
        <StatCard label="Inactive"        value={inactive.length} color={inactive.length > 0 ? "text-red-600" : "text-secondary-100"} />
        <StatCard label="Monthly Payroll" value={`${totalPayroll.toLocaleString()} RWF`} color="text-indigo-600"
          sub="Active employees only" />
      </div>

      {/* Table */}
      <Card className="!p-0 overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead className="bg-custom-100 border-b border-custom-300">
              <tr>
                {["Name", "Phone", "Contract Type", "Salary (RWF)", "Status", "Hired"].map((h) => (
                  <th key={h} className="px-3 py-2 text-left text-xs font-bold text-secondary-100 uppercase">{h}</th>
                ))}
              </tr>
            </thead>
            <tbody className="divide-y divide-custom-200">
              {isLoading ? (
                <tr><td colSpan={6} className="px-4 py-8 text-center text-custom-700 text-sm">Loading…</td></tr>
              ) : employees.length === 0 ? (
                <tr><td colSpan={6} className="px-4 py-8 text-center text-custom-700 text-sm">No employees found</td></tr>
              ) : paginated.map((e) => (
                <tr key={e.id} className="hover:bg-custom-50 transition-colors">
                  <td className="px-3 py-2.5">
                    <p className="text-sm font-semibold text-secondary-100">{e.fullName}</p>
                    {e.email && <p className="text-xs text-custom-700">{e.email}</p>}
                  </td>
                  <td className="px-3 py-2.5 text-sm text-secondary-100">{e.phoneNumber}</td>
                  <td className="px-3 py-2.5">
                    <span className="text-xs font-semibold px-2 py-0.5 rounded-full bg-custom-100 text-custom-700">
                      {e.contractType ?? "—"}
                    </span>
                  </td>
                  <td className="px-3 py-2.5 text-sm font-bold text-indigo-600">
                    {(Number(e.contractSalary) || 0).toLocaleString()} RWF
                  </td>
                  <td className="px-3 py-2.5">
                    <span className={`text-xs font-bold px-2 py-0.5 rounded-full ${e.isActive ? "bg-emerald-100 text-emerald-700" : "bg-red-100 text-red-600"}`}>
                      {e.isActive ? "Active" : "Inactive"}
                    </span>
                  </td>
                  <td className="px-3 py-2.5 text-xs text-custom-700">
                    {e.hiredAt ? new Date(e.hiredAt).toLocaleDateString("en-RW", { day: "2-digit", month: "short", year: "numeric" }) : "—"}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </Card>

      {/* Summary */}
      {employees.length > 0 && (
        <div className="flex justify-end">
          <div className="border border-custom-300 rounded-xl overflow-hidden text-sm w-72">
            <div className="bg-custom-100 px-4 py-2 font-bold text-secondary-100 text-xs uppercase">Payroll Summary</div>
            {[
              { label: "Active Employees",  value: String(active.length),                    cls: "text-emerald-600" },
              { label: "Monthly Payroll",   value: `${totalPayroll.toLocaleString()} RWF`,   cls: "text-indigo-600 font-bold" },
            ].map(({ label, value, cls }) => (
              <div key={label} className="flex justify-between px-4 py-2 border-t border-custom-200">
                <span className="text-custom-700 text-xs">{label}</span>
                <span className={`text-xs ${cls}`}>{value}</span>
              </div>
            ))}
          </div>
        </div>
      )}

      {active.length > PAGE_SIZE && (
        <div className="flex items-center justify-between">
          <p className="text-xs text-custom-700">Showing {(page - 1) * PAGE_SIZE + 1}–{Math.min(page * PAGE_SIZE, active.length)} of {active.length}</p>
          <div className="flex items-center gap-1">
            <button onClick={() => setPage((p) => Math.max(1, p - 1))} disabled={page === 1}
              className="px-3 py-1.5 rounded-lg border border-custom-300 text-xs font-semibold hover:bg-custom-100 disabled:opacity-40">Prev</button>
            {Array.from({ length: totalPages }, (_, i) => i + 1).map((n) => (
              <button key={n} onClick={() => setPage(n)}
                className={`w-8 h-8 rounded-lg text-xs font-bold ${n === page ? "bg-primary-500 text-white" : "border border-custom-300 hover:bg-custom-100"}`}>{n}</button>
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

type Tab = "payments" | "jobs" | "payroll" | "submitted";

const TABS: { value: Tab; label: string; icon: React.ElementType }[] = [
  { value: "payments",  label: "Payments",       icon: HiOutlineCash },
  { value: "jobs",      label: "Jobs",            icon: HiOutlineBriefcase },
  { value: "payroll",   label: "Payroll",         icon: HiOutlineUsers },
];

export default function DAFReportsPage() {
  const [activeTab, setActiveTab] = useState<Tab>("payments");

  return (
    <DashboardLayout userRole="daf" userName="DAF">
      <div className="space-y-6 font-[family-name:var(--font-family-primary)]">

        {/* Header */}
        <div>
          <div className="flex items-center gap-2 mb-1">
            <HiOutlineChartBar className="w-6 h-6 text-primary-500" />
            <h1 className="text-2xl md:text-3xl font-bold text-secondary-100">Financial Reports</h1>
          </div>
          <p className="text-sm text-custom-700">
            Analyse payments, jobs, payroll and generate reports  filter by day, week, month or year
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
        {activeTab === "payments"  && <PaymentsReport />}
        {activeTab === "jobs"      && <JobsReport />}
        {activeTab === "payroll"   && <PayrollReport />}
      

      </div>
    </DashboardLayout>
  );
}
