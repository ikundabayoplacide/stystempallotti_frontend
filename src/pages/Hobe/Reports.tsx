import { useState } from "react";
import {
  HiOutlineChartBar,
  HiOutlineRefresh,
  HiOutlineDocumentDownload,
  HiOutlineDocumentText,
  HiOutlineX,
  HiOutlineCube,
  HiOutlineClipboardList,
} from "react-icons/hi";
import jsPDF from "jspdf";
import autoTable from "jspdf-autotable";
import { toast } from "react-toastify";
import { DashboardLayout } from "../../components";
import { Card } from "../../components/ui";
import {
  useGetHobeSalesQuery,
  useGetHobesQuery,
} from "../../store/services/hobeService";
import {
  useCreateReportMutation,
} from "../../store/services/reportsService";
import { useGetStockSortiesQuery } from "../../store/services/stockService";
import { useAuth } from "../../context/AuthContext";
import { useLocation } from "react-router-dom";

// ─── Types ────────────────────────────────────────────────────────────────────

type Period = "day" | "week" | "month" | "year";

// ─── Helpers ──────────────────────────────────────────────────────────────────

function getDateRange(period: Period): { from: string; to: string } {
  const now = new Date();
  const to = `${now.toISOString().split("T")[0]}T23:59:59.000Z`;
  let from: Date;
  switch (period) {
    case "day":   from = new Date(now.getFullYear(), now.getMonth(), now.getDate()); break;
    case "week":  from = new Date(now.getFullYear(), now.getMonth(), now.getDate() - 6); break;
    case "month": from = new Date(now.getFullYear(), now.getMonth(), 1); break;
    case "year":  from = new Date(now.getFullYear(), 0, 1); break;
  }
  return { from: from.toISOString().split("T")[0], to };
}

const PERIODS: { value: Period; label: string }[] = [
  { value: "day",   label: "Today" },
  { value: "week",  label: "This Week" },
  { value: "month", label: "This Month" },
  { value: "year",  label: "This Year" },
];

const PAGE_SIZE = 10;

// ─── PDF helpers ──────────────────────────────────────────────────────────────

const COMPANY = {
  name:    "PALLOTTI PRESSE LTD",
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
  const row1 = fy + 5, row2 = fy + 10;
  pdf.text(COMPANY.address, col1, row1); pdf.text(COMPANY.tin, col1, row2);
  pdf.text(COMPANY.tel, col2, row1, { align: "center" }); pdf.text(COMPANY.rc, col2, row2, { align: "center" });
  pdf.text(COMPANY.email, col3, row1, { align: "right" }); pdf.text(COMPANY.compte, col3, row2, { align: "right" });
  pdf.setFont("helvetica", "bolditalic"); pdf.setFontSize(7); pdf.setTextColor(0, 160, 210);
  pdf.text(COMPANY.motto, col2, fy + 16, { align: "center" });
  pdf.setFont("helvetica", "normal"); pdf.setFontSize(6.5); pdf.setTextColor(150, 150, 150);
  pdf.text(`Page ${pageNum} of ${totalPages}`, pw - 10, fy + 16, { align: "right" });
}

type SummaryRow = { label: string; value: string; bold?: boolean };

async function buildPdf(title: string, headers: string[], rows: string[][], summary: SummaryRow[]) {
  const headerBase64 = await loadImageAsBase64("/header.png").catch(() => null);
  const subtitle = `Generated: ${new Date().toLocaleString("en-RW")}`;
  const pdf = new jsPDF({ orientation: "portrait", unit: "mm", format: "a4" });
  const pw = pdf.internal.pageSize.getWidth();
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

// ─── Generate Report Modal ─────────────────────────────────────────────────────

type ReportItem = { record: string; quantity: string; amount: string };

function GenerateReportModal({ title, onClose }: { title: string; onClose: () => void }) {
  const [purpose, setPurpose]   = useState("");
  const [items, setItems]       = useState<ReportItem[]>([{ record: "", quantity: "", amount: "" }]);
  const [pdfFile, setPdfFile]   = useState<File | null>(null);
  const [notes, setNotes]       = useState("");
  const [submitting, setSubmitting] = useState(false);
  const [createReport] = useCreateReportMutation();

  const addItem = () => setItems((prev) => [...prev, { record: "", quantity: "", amount: "" }]);
  const removeItem = (i: number) => setItems((prev) => prev.filter((_, idx) => idx !== i));
  const updateItem = (i: number, field: keyof ReportItem, value: string) =>
    setItems((prev) => prev.map((item, idx) => idx === i ? { ...item, [field]: value } : item));

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setSubmitting(true);
    const filledItems = items.filter((it) => it.record.trim());
    try {
      await createReport({
        title, purpose,
        items: filledItems,
        notes: notes.trim() || undefined,
        attachment: pdfFile ?? undefined,
      }).unwrap();
      toast.success("Report submitted successfully");
    } catch (err) {
      console.error("Failed to save report:", err);
      toast.error("Failed to submit report");
    }
    setSubmitting(false);
    onClose();
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
          <button onClick={onClose} className="text-custom-700 hover:text-secondary-100">
            <HiOutlineX className="w-5 h-5" />
          </button>
        </div>
        <form onSubmit={handleSubmit} className="space-y-5">
          <div>
            <label className="block text-xs font-semibold text-secondary-100 mb-1">Purpose / Subject *</label>
            <input required value={purpose} onChange={(e) => setPurpose(e.target.value)}
              placeholder="e.g. Monthly hobe sales summary" className={inputCls} />
          </div>
          <div>
            <div className="flex items-center justify-between mb-2">
              <label className="text-xs font-semibold text-secondary-100">Records</label>
              <button type="button" onClick={addItem}
                className="flex items-center gap-1 text-xs font-semibold text-primary-500 hover:text-primary-600">
                <span className="text-base leading-none">+</span> Add Row
              </button>
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
                    <button type="button" onClick={() => removeItem(i)} className="text-red-400 hover:text-red-600 flex-shrink-0">
                      <HiOutlineX className="w-4 h-4" />
                    </button>
                  )}
                </div>
              ))}
            </div>
          </div>
          <div>
            <label className="block text-xs font-semibold text-secondary-100 mb-1">Attach File <span className="font-normal text-custom-700">(optional)</span></label>
            <input type="file" accept=".pdf,.doc,.docx,.xls,.xlsx,.png,.jpg"
              onChange={(e) => setPdfFile(e.target.files?.[0] ?? null)}
              className="w-full text-xs text-custom-700 file:mr-3 file:py-2 file:px-4 file:rounded-xl file:border-0 file:text-xs file:font-semibold file:bg-primary-500 file:text-white hover:file:bg-primary-600" />
            {pdfFile && <p className="text-xs text-emerald-600 mt-1">✓ {pdfFile.name}</p>}
          </div>
          <div>
            <label className="block text-xs font-semibold text-secondary-100 mb-1">Additional Notes <span className="font-normal text-custom-700">(optional)</span></label>
            <textarea value={notes} onChange={(e) => setNotes(e.target.value)} rows={3}
              placeholder="Optional remarks..."
              className="w-full px-3 py-2 rounded-xl border border-custom-300 bg-style-500 text-secondary-100 text-sm focus:outline-none focus:border-primary-400 transition-colors resize-none" />
          </div>
          <div className="flex gap-3 justify-end pt-2 border-t border-custom-300">
            <button type="button" onClick={onClose}
              className="px-4 py-2 rounded-xl border border-custom-300 text-sm font-semibold text-secondary-100 hover:bg-custom-100 transition-colors">Cancel</button>
            <button type="submit" disabled={submitting}
              className="px-4 py-2 rounded-xl bg-primary-500 text-white text-sm font-semibold hover:bg-primary-600 disabled:opacity-40 transition-colors">
              {submitting ? "Submitting..." : "Submit"}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}

// ─── Shared sub-components ────────────────────────────────────────────────────

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

function PdfButtons({ title, getExportData }: {
  title: string;
  getExportData: () => { headers: string[]; rows: string[][]; summary: SummaryRow[] };
}) {
  const [showModal, setShowModal] = useState(false);
  const handlePdf = () => {
    const { headers, rows, summary } = getExportData();
    buildPdf(title, headers, rows, summary).catch((err) => {
      console.error(err); alert("Failed to generate PDF");
    });
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

const pmColors: Record<string, string> = {
  cash:   "bg-emerald-100 text-emerald-700",
  mobile: "bg-yellow-100 text-yellow-700",
  bank:   "bg-blue-100 text-blue-700",
  card:   "bg-purple-100 text-purple-700",
};

// ─── Hobe Sales Report ────────────────────────────────────────────────────────

function HobeSalesReport() {
  const [period, setPeriod]         = useState<Period>("month");
  const [page, setPage]             = useState(1);
  const [customFrom, setCustomFrom] = useState("");
  const [customTo, setCustomTo]     = useState("");
  const [useCustom, setUseCustom]   = useState(false);

  const range = useCustom && customFrom && customTo
    ? { from: customFrom, to: customTo + "T23:59:59.000Z" }
    : getDateRange(period);

  const { data, isLoading, refetch } = useGetHobeSalesQuery({ from: range.from, to: range.to, limit: 200 });
  const sales = data?.sales ?? [];

  const totalPages = Math.max(1, Math.ceil(sales.length / PAGE_SIZE));
  const paginated  = sales.slice((page - 1) * PAGE_SIZE, page * PAGE_SIZE);

  const totalQty      = sales.reduce((s, r) => s + r.quantity, 0);
  const totalPaid     = sales.reduce((s, r) => s + Number(r.amountPaid), 0);
  const totalExpected = sales.reduce((s, r) => s + Number(r.totalPrice), 0);
  const totalBalance  = sales.reduce((s, r) => s + Number(r.balanceDue ?? 0), 0);
  const totalReturns  = sales.reduce((s, r) => s + Number(r.changeGiven ?? 0), 0);
  const partialCount  = sales.filter((r) => r.paymentStatus === "partial").length;
  const overpaidCount = sales.filter((r) => r.paymentStatus === "overpaid").length;

  const byMethod: Record<string, number> = {};
  sales.forEach((s) => { byMethod[s.paymentMethod] = (byMethod[s.paymentMethod] ?? 0) + Number(s.amountPaid); });

  const getExportData = () => ({
    headers: ["Hobe", "Batch #", "Qty", "Total (RWF)", "Paid (RWF)", "Due (RWF)", "Return (RWF)", "Status", "Method", "Customer", "Date"],
    rows: sales.map((s) => [
      s.hobe.nameOfHobe,
      s.hobe.hobeNo,
      String(s.quantity),
      Number(s.totalPrice).toLocaleString(),
      Number(s.amountPaid).toLocaleString(),
      Number(s.balanceDue ?? 0).toLocaleString(),
      Number(s.changeGiven ?? 0).toLocaleString(),
      s.paymentStatus ?? "paid",
      s.paymentMethod,
      s.customer?.name ?? "Walk-in",
      new Date(s.createdAt).toLocaleDateString("en-RW", { day: "2-digit", month: "short", year: "numeric" }),
    ]),
    summary: [
      { label: `Total Transactions: ${sales.length}   |   Units Sold: ${totalQty}`, value: "" },
      { label: "Total Expected",  value: `${totalExpected.toLocaleString()} RWF` },
      { label: "Total Paid",      value: `${totalPaid.toLocaleString()} RWF` },
      { label: "Total Balance Due",value: `${totalBalance.toLocaleString()} RWF` },
      { label: "Change Given",    value: `${totalReturns.toLocaleString()} RWF` },
      { label: "NET COLLECTED",   value: `${totalPaid.toLocaleString()} RWF`, bold: true },
    ] as SummaryRow[],
  });

  return (
    <div className="space-y-4">
      <div className="flex items-center gap-2 mb-1">
        <div className="w-8 h-8 rounded-lg flex items-center justify-center bg-pink-100 text-pink-600">
          <HiOutlineCube className="w-4 h-4" />
        </div>
        <h2 className="text-base font-bold text-secondary-100">Hobe Sales</h2>
      </div>

      {/* Controls */}
      <div className="flex flex-wrap items-center gap-3">
        <PeriodTabs value={period} onChange={(p) => { setPeriod(p); setUseCustom(false); setPage(1); }} />
        <div className="flex items-center gap-2 ml-auto">
          <input type="date" value={customFrom}
            onChange={(e) => { setCustomFrom(e.target.value); setUseCustom(true); setPage(1); }}
            className="px-2 py-1.5 rounded-lg border border-custom-300 bg-style-500 text-secondary-100 text-xs focus:outline-none focus:border-primary-400 transition-colors" />
          <span className="text-xs text-custom-700">to</span>
          <input type="date" value={customTo} min={customFrom}
            onChange={(e) => { setCustomTo(e.target.value); setUseCustom(true); setPage(1); }}
            className="px-2 py-1.5 rounded-lg border border-custom-300 bg-style-500 text-secondary-100 text-xs focus:outline-none focus:border-primary-400 transition-colors" />
          {useCustom && (
            <button onClick={() => { setCustomFrom(""); setCustomTo(""); setUseCustom(false); setPage(1); }}
              className="px-2 py-1.5 rounded-lg border border-custom-300 text-xs text-custom-700 hover:bg-custom-100 transition-colors">Clear</button>
          )}
          <button onClick={() => refetch()}
            className="p-1.5 rounded-lg border border-custom-300 hover:bg-custom-100 transition-colors">
            <HiOutlineRefresh className={`w-4 h-4 text-custom-700 ${isLoading ? "animate-spin" : ""}`} />
          </button>
          <PdfButtons title="Hobe Sales Report" getExportData={getExportData} />
        </div>
      </div>

      {/* Stats — all on one row */}
      <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-4">
        <StatCard label="Transactions"     value={sales.length} />
        <StatCard label="Units Sold"       value={totalQty} />
        <StatCard label="Amount Collected" value={`${totalPaid.toLocaleString()} RWF`} color="text-emerald-600" />
        <StatCard label="Expected Revenue"
          value={`${totalExpected.toLocaleString()} RWF`}
          sub={totalPaid < totalExpected ? `Gap: ${(totalExpected - totalPaid).toLocaleString()} RWF` : undefined}
          color={totalPaid < totalExpected ? "text-orange-600" : "text-emerald-600"} />
        <StatCard label="Partial Payments" value={partialCount}
          sub={partialCount > 0 ? `Due: ${totalBalance.toLocaleString()} RWF` : undefined}
          color={partialCount > 0 ? "text-orange-600" : "text-secondary-100"} />
        <StatCard label="Overpaid"         value={overpaidCount}
          sub={overpaidCount > 0 ? `${totalReturns.toLocaleString()} RWF to return` : undefined}
          color={overpaidCount > 0 ? "text-blue-600" : "text-secondary-100"} />
      </div>

      {/* By method */}
      {Object.keys(byMethod).length > 0 && (
        <div className="flex flex-wrap gap-2">
          {Object.entries(byMethod).map(([method, amount]) => (
            <div key={method} className={`px-3 py-1.5 rounded-xl text-xs font-semibold ${pmColors[method] ?? "bg-gray-100 text-gray-700"}`}>
              {method}: {amount.toLocaleString()} RWF
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
                {["Hobe", "Batch #", "Qty", "Total", "Paid", "Status", "Method", "Customer", "Date"].map((h) => (
                  <th key={h} className="px-3 py-2 text-left text-xs font-bold text-secondary-100 uppercase">{h}</th>
                ))}
              </tr>
            </thead>
            <tbody className="divide-y divide-custom-200">
              {isLoading ? (
                <tr><td colSpan={9} className="px-4 py-8 text-center text-custom-700 text-sm">Loading...</td></tr>
              ) : sales.length === 0 ? (
                <tr><td colSpan={9} className="px-4 py-8 text-center text-custom-700 text-sm">No sales in this period</td></tr>
              ) : paginated.map((s) => (
                <tr key={s.id} className="hover:bg-custom-50 transition-colors">
                  <td className="px-3 py-2.5">
                    <p className="text-sm font-semibold text-secondary-100">{s.hobe.nameOfHobe}</p>
                  </td>
                  <td className="px-3 py-2.5 text-xs font-mono text-primary-500">{s.hobe.hobeNo}</td>
                  <td className="px-3 py-2.5 text-sm text-secondary-100">{s.quantity}</td>
                  <td className="px-3 py-2.5 text-sm text-secondary-100">{Number(s.totalPrice).toLocaleString()} RWF</td>
                  <td className="px-3 py-2.5">
                    <p className="text-sm font-bold text-emerald-600">{Number(s.amountPaid).toLocaleString()} RWF</p>
                    {Number(s.balanceDue ?? 0) > 0 && <p className="text-xs text-red-600">Due: {Number(s.balanceDue).toLocaleString()} RWF</p>}
                    {Number(s.changeGiven ?? 0) > 0 && <p className="text-xs text-blue-600">Change: {Number(s.changeGiven).toLocaleString()} RWF</p>}
                  </td>
                  <td className="px-3 py-2.5">
                    <span className={`text-xs font-bold px-2 py-0.5 rounded-full ${
                      s.paymentStatus === "paid" ? "bg-emerald-100 text-emerald-700"
                      : s.paymentStatus === "overpaid" ? "bg-blue-100 text-blue-700"
                      : "bg-orange-100 text-orange-700"
                    }`}>{s.paymentStatus ?? "paid"}</span>
                  </td>
                  <td className="px-3 py-2.5">
                    <span className={`text-xs font-bold px-2 py-0.5 rounded-full ${pmColors[s.paymentMethod] ?? "bg-gray-100 text-gray-700"}`}>
                      {s.paymentMethod}
                    </span>
                  </td>
                  <td className="px-3 py-2.5 text-sm text-secondary-100">{s.customer?.name ?? <span className="text-xs text-custom-400">Walk-in</span>}</td>
                  <td className="px-3 py-2.5 text-xs text-custom-700">
                    {new Date(s.createdAt).toLocaleDateString("en-RW", { day: "2-digit", month: "short", year: "numeric" })}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </Card>

      {/* Summary totals */}
      {sales.length > 0 && (
        <div className="flex justify-end">
          <div className="border border-custom-300 rounded-xl overflow-hidden text-sm w-80">
            <div className="bg-custom-100 px-4 py-2 font-bold text-secondary-100 text-xs uppercase">Summary</div>
            {[
              { label: "Total Expected",   value: `${totalExpected.toLocaleString()} RWF`, cls: "text-secondary-100" },
              { label: "Total Paid",       value: `${totalPaid.toLocaleString()} RWF`,     cls: "text-emerald-600" },
              { label: "Balance Due",      value: `${totalBalance.toLocaleString()} RWF`,  cls: totalBalance > 0 ? "text-red-500" : "text-secondary-100" },
              { label: "Change Given",     value: `${totalReturns.toLocaleString()} RWF`,  cls: "text-blue-500" },
            ].map(({ label, value, cls }) => (
              <div key={label} className="flex justify-between px-4 py-2 border-t border-custom-200">
                <span className="text-custom-700 text-xs">{label}</span>
                <span className={`font-bold text-xs ${cls}`}>{value}</span>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Pagination */}
      {sales.length > PAGE_SIZE && (
        <div className="flex items-center justify-between">
          <p className="text-xs text-custom-700">
            Showing {(page - 1) * PAGE_SIZE + 1}–{Math.min(page * PAGE_SIZE, sales.length)} of {sales.length}
          </p>
          <div className="flex items-center gap-1">
            <button onClick={() => setPage((p) => Math.max(1, p - 1))} disabled={page === 1}
              className="px-3 py-1.5 rounded-lg border border-custom-300 text-xs font-semibold text-secondary-100 hover:bg-custom-100 disabled:opacity-40 transition-colors">Prev</button>
            {Array.from({ length: totalPages }, (_, i) => i + 1).map((n) => (
              <button key={n} onClick={() => setPage(n)}
                className={`w-8 h-8 rounded-lg text-xs font-bold transition-colors ${
                  n === page ? "bg-primary-500 text-white" : "border border-custom-300 text-secondary-100 hover:bg-custom-100"
                }`}>{n}</button>
            ))}
            <button onClick={() => setPage((p) => Math.min(totalPages, p + 1))} disabled={page === totalPages}
              className="px-3 py-1.5 rounded-lg border border-custom-300 text-xs font-semibold text-secondary-100 hover:bg-custom-100 disabled:opacity-40 transition-colors">Next</button>
          </div>
        </div>
      )}
    </div>
  );
}

// ─── Batch Overview Report ─────────────────────────────────────────────────────

function BatchOverviewReport() {
  const { data, isLoading, refetch } = useGetHobesQuery();
  const hobes = data?.hobes ?? [];

  const getExportData = () => ({
    headers: ["Batch #", "Name", "Done At", "Expires", "Total Qty", "Sold", "Remaining", "Price/Item", "OB", "Status"],
    rows: hobes.map((h) => [
      h.hobeNo, h.nameOfHobe,
      new Date(h.doneAt).toLocaleDateString("en-RW", { day: "2-digit", month: "short", year: "numeric" }),
      new Date(h.expiredAt).toLocaleDateString("en-RW", { day: "2-digit", month: "short", year: "numeric" }),
      String(h.qty),
      String(h.qtySold),
      String(h.qtyRemains),
      `${h.pricePerItem.toLocaleString()} RWF`,
      String(h.ob),
      h.status,
    ]),
    summary: [
      { label: "Total Batches",    value: String(hobes.length) },
      { label: "Active",           value: String(hobes.filter((h) => h.status === "active").length) },
      { label: "Total Qty in Shop",value: `${hobes.reduce((s, h) => s + h.qtyRemains, 0).toLocaleString()} units`, bold: true },
    ] as SummaryRow[],
  });

  return (
    <div className="space-y-4">
      <div className="flex items-center gap-2 mb-1">
        <div className="w-8 h-8 rounded-lg flex items-center justify-center bg-blue-100 text-blue-600">
          <HiOutlineCube className="w-4 h-4" />
        </div>
        <h2 className="text-base font-bold text-secondary-100">Batch Overview</h2>
      </div>
      <div className="flex items-center gap-2 justify-end">
        <button onClick={() => refetch()}
          className="p-1.5 rounded-lg border border-custom-300 hover:bg-custom-100 transition-colors">
          <HiOutlineRefresh className={`w-4 h-4 text-custom-700 ${isLoading ? "animate-spin" : ""}`} />
        </button>
        <PdfButtons title="Hobe Batch Overview" getExportData={getExportData} />
      </div>

      <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
        <StatCard label="Total Batches"  value={hobes.length} />
        <StatCard label="Active"         value={hobes.filter((h) => h.status === "active").length}    color="text-emerald-600" />
        <StatCard label="Expired"        value={hobes.filter((h) => h.status === "expired").length}   color="text-red-500" />
        <StatCard label="Units in Shop"  value={hobes.reduce((s, h) => s + h.qtyRemains, 0).toLocaleString()} color="text-primary-500" />
      </div>

      <Card className="!p-0 overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead className="bg-custom-100 border-b border-custom-300">
              <tr>
                {["Batch #", "Name", "Done", "Expires", "Total", "Sold", "Remaining", "Price", "Status"].map((h) => (
                  <th key={h} className="px-3 py-2 text-left text-xs font-bold text-secondary-100 uppercase">{h}</th>
                ))}
              </tr>
            </thead>
            <tbody className="divide-y divide-custom-200">
              {isLoading ? (
                <tr><td colSpan={9} className="px-4 py-8 text-center text-custom-700 text-sm">Loading...</td></tr>
              ) : hobes.length === 0 ? (
                <tr><td colSpan={9} className="px-4 py-8 text-center text-custom-700 text-sm">No batches found</td></tr>
              ) : hobes.map((h) => {
                const soldPct = h.qty > 0 ? Math.round((h.qtySold / h.qty) * 100) : 0;
                return (
                  <tr key={h.id} className="hover:bg-custom-50 transition-colors">
                    <td className="px-3 py-2.5 text-xs font-mono font-bold text-primary-500">{h.hobeNo}</td>
                    <td className="px-3 py-2.5">
                      <p className="text-sm font-semibold text-secondary-100">{h.nameOfHobe}</p>
                      {h.note && <p className="text-xs text-custom-700 truncate max-w-[120px]">{h.note}</p>}
                    </td>
                    <td className="px-3 py-2.5 text-xs text-custom-700">{new Date(h.doneAt).toLocaleDateString("en-RW", { day: "2-digit", month: "short", year: "numeric" })}</td>
                    <td className="px-3 py-2.5 text-xs text-custom-700">{new Date(h.expiredAt).toLocaleDateString("en-RW", { day: "2-digit", month: "short", year: "numeric" })}</td>
                    <td className="px-3 py-2.5 text-sm font-semibold text-secondary-100">{h.qty.toLocaleString()}</td>
                    <td className="px-3 py-2.5 text-sm text-secondary-100">{h.qtySold.toLocaleString()}</td>
                    <td className="px-3 py-2.5">
                      <p className={`text-sm font-bold ${h.qtyRemains === 0 ? "text-red-500" : h.qtyRemains < h.qty * 0.2 ? "text-yellow-600" : "text-emerald-600"}`}>
                        {h.qtyRemains.toLocaleString()}
                      </p>
                      <div className="w-16 h-1 bg-custom-200 rounded-full mt-1">
                        <div className="h-1 bg-primary-500 rounded-full" style={{ width: `${soldPct}%` }} />
                      </div>
                    </td>
                    <td className="px-3 py-2.5 text-sm font-semibold text-secondary-100">{h.pricePerItem.toLocaleString()} RWF</td>
                    <td className="px-3 py-2.5">
                      <span className={`text-xs font-bold px-2 py-0.5 rounded-full ${
                        h.status === "active"    ? "bg-emerald-100 text-emerald-700"
                        : h.status === "expired" ? "bg-red-100 text-red-600"
                        : "bg-gray-100 text-gray-500"
                      }`}>{h.status}</span>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      </Card>
    </div>
  );
}

// ─── Requests Report (stock sorties) ─────────────────────────────────────────

function RequestsReport() {
  const { data, isLoading, refetch } = useGetStockSortiesQuery({ limit: 100 });
  const sorties = data?.data ?? [];

  const pendingCount  = sorties.filter((s) => s.status === "pending").length;
  const approvedCount = sorties.filter((s) => s.status === "approved").length;
  const rejectedCount = sorties.filter((s) => s.status === "rejected").length;

  const statusColors: Record<string, string> = {
    pending:  "bg-yellow-100 text-yellow-700",
    approved: "bg-emerald-100 text-emerald-700",
    rejected: "bg-red-100 text-red-700",
  };

  const getExportData = () => ({
    headers: ["Item", "Category", "Qty", "Unit", "Status", "Reason", "Date"],
    rows: sorties.map((s) => [
      (s.stockItem as any)?.itemName ?? s.stockItem?.name ?? "—",
      s.stockItem?.category ?? "—",
      String(s.quantity),
      s.stockItem?.unit ?? "—",
      s.status,
      s.reason ?? "—",
      new Date(s.createdAt).toLocaleDateString("en-RW", { day: "2-digit", month: "short", year: "numeric" }),
    ]),
    summary: [
      { label: "Total Requests", value: String(sorties.length) },
      { label: "Pending",        value: String(pendingCount) },
      { label: "Approved",       value: String(approvedCount) },
      { label: "Rejected",       value: String(rejectedCount), bold: true },
    ] as SummaryRow[],
  });

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2">
          <div className="w-8 h-8 rounded-lg flex items-center justify-center bg-orange-100 text-orange-600">
            <HiOutlineClipboardList className="w-4 h-4" />
          </div>
          <h2 className="text-base font-bold text-secondary-100">Stock Requests</h2>
        </div>
        <div className="flex items-center gap-2">
          <button onClick={() => refetch()}
            className="p-1.5 rounded-lg border border-custom-300 hover:bg-custom-100 transition-colors">
            <HiOutlineRefresh className={`w-4 h-4 text-custom-700 ${isLoading ? "animate-spin" : ""}`} />
          </button>
          <PdfButtons title="Hobe Stock Requests Report" getExportData={getExportData} />
        </div>
      </div>

      <div className="grid grid-cols-3 gap-4">
        <StatCard label="Pending"  value={pendingCount}  color="text-yellow-600" />
        <StatCard label="Approved" value={approvedCount} color="text-emerald-600" />
        <StatCard label="Rejected" value={rejectedCount} color="text-red-600" />
      </div>

      <Card className="!p-0 overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead className="bg-custom-100 border-b border-custom-300">
              <tr>
                {["Item", "Qty", "Status", "Reason", "Date"].map((h) => (
                  <th key={h} className="px-3 py-2.5 text-left text-xs font-bold text-secondary-100 uppercase">{h}</th>
                ))}
              </tr>
            </thead>
            <tbody className="divide-y divide-custom-200">
              {isLoading ? (
                <tr><td colSpan={5} className="px-4 py-8 text-center text-custom-700 text-sm">Loading...</td></tr>
              ) : sorties.length === 0 ? (
                <tr><td colSpan={5} className="px-4 py-8 text-center text-custom-700 text-sm">No requests yet</td></tr>
              ) : sorties.map((s) => (
                <tr key={s.id} className="hover:bg-custom-50 transition-colors">
                  <td className="px-3 py-2.5">
                    <p className="text-sm font-semibold text-secondary-100">
                      {(s.stockItem as any)?.itemName ?? s.stockItem?.name ?? "—"}
                    </p>
                    {s.stockItem?.category && <p className="text-xs text-custom-700">{s.stockItem.category}</p>}
                  </td>
                  <td className="px-3 py-2.5 text-sm text-secondary-100 font-semibold">
                    {s.quantity} {s.stockItem?.unit ?? ""}
                  </td>
                  <td className="px-3 py-2.5">
                    <span className={`text-xs font-bold px-2 py-0.5 rounded-full ${statusColors[s.status] ?? "bg-gray-100 text-gray-600"}`}>
                      {s.status}
                    </span>
                  </td>
                  <td className="px-3 py-2.5 text-xs text-custom-700 max-w-[180px] truncate">{s.reason ?? "—"}</td>
                  <td className="px-3 py-2.5 text-xs text-custom-700">
                    {new Date(s.createdAt).toLocaleDateString("en-RW", { day: "2-digit", month: "short", year: "numeric" })}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </Card>
    </div>
  );
}
// ─── Main Page ────────────────────────────────────────────────────────────────

type Tab = "sales" | "batches" | "requests" | "my-reports";

const TABS: { value: Tab; label: string; icon: React.ElementType }[] = [
  { value: "sales",      label: "Sales Report",  icon: HiOutlineCube },
  { value: "batches",    label: "Batch Overview", icon: HiOutlineChartBar },
  { value: "requests",   label: "Requests",       icon: HiOutlineClipboardList },
];

export default function ReportsPage({ initialTab = "sales" }: { initialTab?: Tab }) {
  const { userRole, userName } = useAuth();
  const { pathname } = useLocation();

  // Derive active tab from URL so sidebar links always work
  const activeTab: Tab = pathname.endsWith("/my-reports") ? "my-reports" : initialTab;
  const [localTab, setLocalTab] = useState<Tab>(activeTab);

  return (
    <DashboardLayout userRole={userRole ?? "hobe"} userName={userName ?? "Hobe"} notificationCount={0}>
      <div className="space-y-6 font-[family-name:var(--font-family-primary)]">

        {/* Header */}
        <div>
          <div className="flex items-center gap-2 mb-1">
            <HiOutlineChartBar className="w-6 h-6 text-primary-500" />
            <h1 className="text-2xl md:text-3xl font-bold text-secondary-100">Hobe Reports</h1>
          </div>
          <p className="text-sm text-custom-700">Track sales, batch inventory, stock requests and your submitted reports</p>
        </div>

        {/* Tab bar */}
        <div className="flex gap-2 flex-wrap border-b border-custom-200 pb-1">
          {TABS.map((t) => (
            <button key={t.value} onClick={() => setLocalTab(t.value)}
              className={`flex items-center gap-2 px-4 py-2 rounded-t-xl text-sm font-semibold transition-colors border-b-2 ${
                (localTab || activeTab) === t.value
                  ? "border-primary-500 text-primary-500 bg-primary-50"
                  : "border-transparent text-custom-700 hover:text-secondary-100 hover:bg-custom-50"
              }`}
            >
              <t.icon className="w-4 h-4" />
              {t.label}
            </button>
          ))}
        </div>

        {(localTab || activeTab) === "sales"      && <HobeSalesReport />}
        {(localTab || activeTab) === "batches"    && <BatchOverviewReport />}
        {(localTab || activeTab) === "requests"   && <RequestsReport />}
      </div>
    </DashboardLayout>
  );
}
