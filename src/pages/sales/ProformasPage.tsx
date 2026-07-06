import { useState } from "react";
import jsPDF from "jspdf";
import autoTable from "jspdf-autotable";
import {
  HiOutlineCheckCircle,
  HiOutlineClock,
  HiOutlineDocumentText,
  HiOutlineDownload,
  HiOutlineExclamationCircle,
  HiOutlineEye,
  HiOutlinePencil,
  HiOutlinePrinter,
  HiOutlineRefresh,
  HiOutlineSearch,
  HiOutlineX,
  HiOutlineXCircle,
} from "react-icons/hi";
import { DashboardLayout } from "../../components";
import { Button, Card } from "../../components/ui";
import type { Proforma, ProformaStatus } from "../../store/services/proformasService";
import {
  useGetProformasQuery,
  useUpdateProformaMutation,
  useUpdateProformaStatusMutation,
} from "../../store/services/proformasService";

// ─── Status config ────────────────────────────────────────────────────────────

const statusConfig: Record<ProformaStatus, { label: string; color: string; bg: string; icon: React.ElementType }> = {
  draft:    { label: "Draft",    color: "text-gray-600",   bg: "bg-gray-100",   icon: HiOutlineDocumentText },
  sent:     { label: "Sent",     color: "text-blue-600",   bg: "bg-blue-100",   icon: HiOutlineClock },
  accepted: { label: "Accepted", color: "text-green-600",  bg: "bg-green-100",  icon: HiOutlineCheckCircle },
  rejected: { label: "Rejected", color: "text-red-600",    bg: "bg-red-100",    icon: HiOutlineXCircle },
  expired:  { label: "Expired",  color: "text-orange-600", bg: "bg-orange-100", icon: HiOutlineClock },
};

const selectCls =
  "w-full px-3 py-2 rounded-xl border border-custom-400 bg-style-500 text-secondary-100 " +
  "focus:outline-none focus:border-primary-400 focus:ring-2 focus:ring-primary-200 " +
  "transition-colors text-sm font-[family-name:var(--font-family-primary)]";

// Resolve customer from top-level or nested in job
function getCustomer(q: Proforma) {
  return q.customer ?? q.job?.customer ?? null;
}

function getItems(q: Proforma) {
  return q.job?.jobItems ?? q.job?.items ?? [];
}

// ─── Print quotation ──────────────────────────────────────────────────────────
// A quotation is a proposal for negotiation — it shows items and an estimated
// amount. Tax is NOT shown here; it will be applied at invoice stage.

function printProforma(q: Proforma) {
  const customer = getCustomer(q);
  const items = getItems(q);
  const html = `
    <html><head><title>${q.proformaNo}</title>
    <style>
      body { font-family: Arial, sans-serif; padding: 32px; color: #111; }
      h1 { font-size: 22px; margin-bottom: 4px; }
      .meta { color: #555; font-size: 13px; margin-bottom: 24px; }
      .note { font-size: 11px; color: #888; font-style: italic; margin-bottom: 16px; }
      table { width: 100%; border-collapse: collapse; margin-bottom: 20px; }
      th { background: #f3f4f6; text-align: left; padding: 8px 12px; font-size: 12px; text-transform: uppercase; }
      td { padding: 8px 12px; border-bottom: 1px solid #e5e7eb; font-size: 13px; }
      .totals td { border: none; }
      .total-row td { font-weight: bold; font-size: 15px; border-top: 2px solid #111; }
      .badge { display: inline-block; padding: 2px 10px; border-radius: 999px; font-size: 11px; font-weight: bold; background: #dbeafe; color: #1d4ed8; }
    </style></head><body>
    <h1>${q.proformaNo}</h1>
    <p class="note">This is a performa / proposal. Prices are estimates subject to negotiation. Tax will be applied on final invoice.</p>
    <div class="meta">
      ${customer ? `<strong>${customer.name}</strong>${customer.company ? ` · ${customer.company}` : ""}${customer.phone ? ` · ${customer.phone}` : ""}<br/>` : ""}
      ${q.job ? `Job: ${q.job.jobNumber} — ${q.job.title}<br/>` : ""}
      Status: <span class="badge">${q.status.toUpperCase()}</span>
      ${q.validUntil ? ` · Valid until: ${q.validUntil.slice(0, 10)}` : ""}
    </div>
    ${items.length > 0 ? `
    <table>
      <thead><tr><th>Item</th><th>Qty</th><th>Unit</th><th>Notes</th></tr></thead>
      <tbody>${items.map((i) => `<tr><td>${i.itemName ?? i.stockItem?.name ?? '—'}</td><td>${i.quantityNeeded}</td><td>${i.unit ?? i.stockItem?.unit ?? ''}</td><td>${i.notes ?? ''}</td></tr>`).join("")}</tbody>
    </table>` : ""}
    <table class="totals">
      <tr class="total-row"><td>Estimated Amount</td><td style="text-align:right">${(q.totalAmount ?? q.subtotal ?? 0).toLocaleString()} RWF</td></tr>
    </table>
    ${q.terms ? `<p><strong>Terms:</strong> ${q.terms}</p>` : ""}
    ${q.notes ? `<p><strong>Notes:</strong> ${q.notes}</p>` : ""}
    </body></html>`;
  const win = window.open("", "_blank");
  if (win) { win.document.write(html); win.document.close(); win.print(); }
}

// ─── PDF helpers (same letterhead as ReceptionReportsPage) ───────────────────

const COMPANY = {
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

function loadImageAsBase64(url: string): Promise<string> {
  return new Promise((resolve, reject) => {
    const img = new Image();
    img.crossOrigin = "anonymous";
    img.onload = () => {
      const canvas = document.createElement("canvas");
      canvas.width = img.width;
      canvas.height = img.height;
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
  pdf.setFont("helvetica", "bold");
  pdf.setFontSize(12);
  pdf.setTextColor(25, 25, 25);
  pdf.text(title, pw / 2, HEADER_H + 10, { align: "center" });
  if (subtitle) {
    pdf.setFont("helvetica", "normal");
    pdf.setFontSize(7.5);
    pdf.setTextColor(110, 110, 110);
    pdf.text(subtitle, pw / 2, HEADER_H + 16, { align: "center" });
  }
}

function drawFooter(pdf: any, pageNum: number, totalPages: number) {
  const pw = pdf.internal.pageSize.getWidth();
  const ph = pdf.internal.pageSize.getHeight();
  const fy = ph - FOOTER_TOP;
  pdf.setDrawColor(200, 200, 200);
  pdf.setLineWidth(0.3);
  pdf.line(10, fy, pw - 10, fy);
  pdf.setFont("helvetica", "normal");
  pdf.setFontSize(6.5);
  pdf.setTextColor(60, 60, 60);
  const col1 = 12, col2 = pw / 2, col3 = pw - 12;
  const row1 = fy + 5, row2 = fy + 10;
  pdf.text(COMPANY.address, col1, row1);
  pdf.text(COMPANY.tin,     col1, row2);
  pdf.text(COMPANY.tel,     col2, row1, { align: "center" });
  pdf.text(COMPANY.rc,      col2, row2, { align: "center" });
  pdf.text(COMPANY.email,   col3, row1, { align: "right" });
  pdf.text(COMPANY.compte,  col3, row2, { align: "right" });
  pdf.setFont("helvetica", "bolditalic");
  pdf.setFontSize(7);
  pdf.setTextColor(0, 160, 210);
  pdf.text(COMPANY.motto, col2, fy + 16, { align: "center" });
  pdf.setFont("helvetica", "normal");
  pdf.setFontSize(6.5);
  pdf.setTextColor(150, 150, 150);
  pdf.text(`Page ${pageNum} of ${totalPages}`, pw - 10, fy + 16, { align: "right" });
}

// ─── Download proforma as PDF ─────────────────────────────────────────────────

async function downloadProforma(q: Proforma) {
  const headerBase64 = await loadImageAsBase64("/header.png").catch(() => null);
  const customer = getCustomer(q);
  const items = getItems(q);
  const estimatedAmount = q.totalAmount ?? q.subtotal ?? 0;

  const pdf = new jsPDF({ orientation: "portrait", unit: "mm", format: "a4" });
  const pw = pdf.internal.pageSize.getWidth();
  const margin = 10;

  const title    = `PROFORMA INVOICE — ${q.proformaNo}`;
  const subtitle = `Date: ${new Date(q.createdAt).toLocaleDateString("en-RW")}${q.validUntil ? `   |   Valid until: ${q.validUntil.slice(0, 10)}` : ""}   |   Status: ${q.status.toUpperCase()}`;

  drawLetterhead(pdf, headerBase64, title, subtitle);

  // ── Customer + Job info block ─────────────────────────────────────────────
  let y = HEADER_H + 22;

  if (customer || q.job) {
    pdf.setDrawColor(0, 160, 210);
    pdf.setLineWidth(0.4);
    pdf.line(margin, y, pw - margin, y);
    y += 5;

    if (customer) {
      pdf.setFont("helvetica", "bold");
      pdf.setFontSize(8);
      pdf.setTextColor(80, 80, 80);
      pdf.text("CLIENT", margin, y); y += 4;
      pdf.setFont("helvetica", "normal");
      pdf.setFontSize(9);
      pdf.setTextColor(25, 25, 25);
      pdf.text(customer.name, margin, y); y += 4;
      if (customer.company) { pdf.text(customer.company, margin, y); y += 4; }
      if (customer.phone)   { pdf.text(customer.phone,   margin, y); y += 4; }
      if (customer.email)   { pdf.text(customer.email,   margin, y); y += 4; }
    }

    if (q.job) {
      pdf.setFont("helvetica", "bold");
      pdf.setFontSize(8);
      pdf.setTextColor(80, 80, 80);
      pdf.text(`Job: ${q.job.jobNumber} — ${q.job.title}`, pw / 2, HEADER_H + 27, { align: "center" });
    }

    pdf.setDrawColor(0, 160, 210);
    pdf.line(margin, y + 2, pw - margin, y + 2);
    y += 8;
  }

  // ── Items table ───────────────────────────────────────────────────────────
  if (items.length > 0) {
    autoTable(pdf, {
      head: [["Item", "Qty", "Unit", "Notes"]],
      body: items.map((i) => [i.itemName ?? i.stockItem?.name ?? '—', String(i.quantityNeeded), i.unit ?? i.stockItem?.unit ?? '', i.notes ?? ""]),
      startY: y,
      margin: { left: margin, right: margin, bottom: FOOTER_TOP + 6 },
      styles: { fontSize: 8, cellPadding: 2 },
      headStyles: { fillColor: [0, 160, 210], textColor: 255, fontStyle: "bold" },
      alternateRowStyles: { fillColor: [245, 251, 255] },
      didDrawPage: (data: { pageNumber: number }) => {
        if (data.pageNumber > 1) drawLetterhead(pdf, headerBase64, title, subtitle);
        drawFooter(pdf, data.pageNumber, (pdf as any).internal.getNumberOfPages());
      },
    });
    y = (pdf as any).lastAutoTable.finalY + 8;
  }

  // ── Estimated amount summary ──────────────────────────────────────────────
  const col1 = pw - 90, col2 = pw - margin;
  pdf.setDrawColor(0, 160, 210);
  pdf.setLineWidth(0.4);
  pdf.line(col1, y - 2, col2, y - 2);
  pdf.setFont("helvetica", "bold");
  pdf.setFontSize(9);
  pdf.setTextColor(40, 40, 40);
  pdf.text("ESTIMATED AMOUNT:", col1, y + 4);
  pdf.text(`${estimatedAmount.toLocaleString()} RWF`, col2, y + 4, { align: "right" });
  pdf.setFont("helvetica", "italic");
  pdf.setFontSize(7);
  pdf.setTextColor(130, 130, 130);
  pdf.text("* Tax and final adjustments applied at invoice stage.", col2, y + 9, { align: "right" });
  pdf.line(col1, y + 12, col2, y + 12);
  y += 18;

  // ── Terms / Notes ─────────────────────────────────────────────────────────
  if (q.terms) {
    pdf.setFont("helvetica", "bold"); pdf.setFontSize(8); pdf.setTextColor(80, 80, 80);
    pdf.text("Terms & Conditions", margin, y); y += 5;
    pdf.setFont("helvetica", "normal"); pdf.setFontSize(8); pdf.setTextColor(60, 60, 60);
    const lines = pdf.splitTextToSize(q.terms, pw - margin * 2);
    pdf.text(lines, margin, y); y += lines.length * 4.5 + 4;
  }
  if (q.notes) {
    pdf.setFont("helvetica", "bold"); pdf.setFontSize(8); pdf.setTextColor(80, 80, 80);
    pdf.text("Notes", margin, y); y += 5;
    pdf.setFont("helvetica", "normal"); pdf.setFontSize(8); pdf.setTextColor(60, 60, 60);
    const lines = pdf.splitTextToSize(q.notes, pw - margin * 2);
    pdf.text(lines, margin, y);
  }

  // ── Re-draw footers with final page count ────────────────────────────────
  const totalPages = (pdf as any).internal.getNumberOfPages();
  for (let i = 1; i <= totalPages; i++) {
    pdf.setPage(i);
    drawFooter(pdf, i, totalPages);
  }

  pdf.save(`${q.proformaNo}.pdf`);
}

// ─── Edit Modal ───────────────────────────────────────────────────────────────
// Only editable fields for a quotation proposal: negotiated amount, validity,
// terms and notes. Tax is NOT part of a quotation — it goes on the invoice.

function EditProformaModal({
  quotation,
  onClose,
}: {
  quotation: Proforma;
  onClose: () => void;
}) {
  const [form, setForm] = useState({
    amount:     String(quotation.totalAmount ?? quotation.subtotal ?? 0),
    terms:      quotation.terms ?? "",
    notes:      quotation.notes ?? "",
    validUntil: quotation.validUntil ? quotation.validUntil.slice(0, 10) : "",
  });
  const [updateProforma, { isLoading }] = useUpdateProformaMutation();
  const [error, setError] = useState<string | null>(null);

  const items = getItems(quotation);

  const handleSave = async () => {
    setError(null);
    try {
      await updateProforma({
        id:         quotation.id,
        // send taxRate=0 and discount=0 to keep backend happy; amount drives totalAmount
        taxRate:    0,
        discount:   0,
        terms:      form.terms      || undefined,
        notes:      form.notes      || undefined,
        validUntil: form.validUntil || undefined,
      }).unwrap();
      onClose();
    } catch (e: unknown) {
      const err = e as { data?: { message?: string } };
      setError(err?.data?.message ?? "Failed to update performa.");
    }
  };

  return (
    <div className="fixed inset-0 bg-secondary-100/60 z-50 flex items-center justify-center p-4">
      <Card className="!p-6 max-w-lg w-full max-h-[90vh] overflow-y-auto">
        <div className="flex items-center justify-between mb-5">
          <div>
            <h3 className="text-lg font-bold text-secondary-100">Edit Proforma</h3>
            <p className="text-xs text-custom-700 mt-0.5">{quotation.proformaNo}</p>
          </div>
          <button onClick={onClose} className="text-custom-700 hover:text-secondary-100">
            <HiOutlineX className="w-5 h-5" />
          </button>
        </div>

        <div className="space-y-4">

          {/* Items summary (read-only) */}
          {items.length > 0 && (
            <div className="rounded-xl bg-custom-100 border border-custom-300 p-4">
              <p className="text-xs font-bold text-custom-700 uppercase tracking-wide mb-2">Items</p>
              <div className="space-y-1">
                {items.map((item) => (
                  <div key={item.id} className="flex justify-between text-sm">
                    <span className="text-custom-700 truncate">{item.itemName ?? item.stockItem?.name ?? "—"}</span>
                    <span className="font-semibold text-secondary-100 shrink-0 ml-4">
                      {item.quantityNeeded} {item.unit ?? item.stockItem?.unit ?? ""}
                    </span>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Estimated amount — this is what appears on the quotation */}
          <div className="rounded-xl bg-custom-100 border border-custom-300 p-4">
            <div className="flex justify-between items-center">
              <span className="text-sm font-bold text-secondary-100">Estimated Amount</span>
              <span className="text-lg font-bold text-primary-500">
                {parseFloat(form.amount || "0").toLocaleString()} RWF
              </span>
            </div>
            <p className="text-xs text-custom-700 mt-1">
              Tax and final adjustments will be applied at invoice stage, not here.
            </p>
          </div>

          <div>
            <label className="block text-sm font-semibold text-secondary-100 mb-1.5">Valid Until</label>
            <input type="date" value={form.validUntil}
              onChange={(e) => setForm((p) => ({ ...p, validUntil: e.target.value }))}
              className={selectCls} />
          </div>

          <div>
            <label className="block text-sm font-semibold text-secondary-100 mb-1.5">Terms & Conditions</label>
            <textarea rows={3} value={form.terms}
              onChange={(e) => setForm((p) => ({ ...p, terms: e.target.value }))}
              placeholder="Payment terms, delivery conditions…"
              className={`${selectCls} resize-none`} />
          </div>

          <div>
            <label className="block text-sm font-semibold text-secondary-100 mb-1.5">Notes</label>
            <textarea rows={2} value={form.notes}
              onChange={(e) => setForm((p) => ({ ...p, notes: e.target.value }))}
              placeholder="Additional notes for the client…"
              className={`${selectCls} resize-none`} />
          </div>

          {error && (
            <div className="flex items-center gap-2 px-4 py-3 rounded-xl bg-red-50 border border-red-200 text-red-700 text-sm">
              <HiOutlineExclamationCircle className="w-4 h-4 shrink-0" />
              {error}
            </div>
          )}
        </div>

        <div className="flex gap-3 justify-end mt-5 pt-4 border-t border-custom-300">
          <Button variant="outline" onClick={onClose}>Cancel</Button>
          <Button onClick={handleSave} disabled={isLoading}>
            {isLoading ? "Saving…" : "Save Changes"}
          </Button>
        </div>
      </Card>
    </div>
  );
}

// ─── Detail Modal ─────────────────────────────────────────────────────────────

function DetailModal({
  quotation,
  onClose,
  onEdit,
}: {
  quotation: Proforma;
  onClose: () => void;
  onEdit: () => void;
}) {
  const [updateStatus, { isLoading: updatingStatus }] = useUpdateProformaStatusMutation();
  const [error, setError] = useState<string | null>(null);

  const cfg = statusConfig[quotation.status];
  const Icon = cfg.icon;

  const handleStatus = async (status: ProformaStatus) => {
    setError(null);
    try {
      await updateStatus({ id: quotation.id, status }).unwrap();
      onClose();
    } catch (e: unknown) {
      const err = e as { data?: { message?: string } };
      setError(err?.data?.message ?? "Failed to update status.");
    }
  };

  const customer = getCustomer(quotation);
  const items = getItems(quotation);
  const estimatedAmount = quotation.totalAmount ?? quotation.subtotal ?? 0;

  return (
    <div className="fixed inset-0 bg-secondary-100/60 z-50 flex items-center justify-center p-4">
      <Card className="!p-6 max-w-2xl w-full max-h-[90vh] overflow-y-auto">
        {/* Header */}
        <div className="flex items-start justify-between mb-5">
          <div>
            <h3 className="text-xl font-bold text-secondary-100">{quotation.proformaNo}</h3>
            {customer && (
              <p className="text-sm text-custom-700 mt-0.5">
                {customer.name}{customer.phone ? ` · ${customer.phone}` : ""}{customer.company ? ` · ${customer.company}` : ""}
              </p>
            )}
            <span className={`inline-flex items-center gap-1.5 mt-2 text-xs font-bold px-3 py-1 rounded-full ${cfg.bg} ${cfg.color}`}>
              <Icon className="w-3.5 h-3.5" />
              {cfg.label}
            </span>
          </div>
          <button onClick={onClose} className="text-custom-700 hover:text-secondary-100">
            <HiOutlineX className="w-5 h-5" />
          </button>
        </div>

        {/* Proposal notice */}
        <div className="mb-4 px-4 py-2.5 rounded-xl bg-blue-50 border border-blue-200 text-blue-700 text-xs">
          This is a <strong>performa / proposal</strong> for negotiation and client approval.
          Tax and final charges will be applied at the invoice stage.
        </div>

        <div className="space-y-5">
          {/* Job info */}
          {quotation.job && (
            <div className="rounded-xl bg-custom-50 border border-custom-300 p-4 text-sm">
              <p className="text-xs font-bold text-custom-700 uppercase tracking-wide mb-2">Job</p>
              <div className="flex justify-between">
                <span className="text-custom-700">Job #</span>
                <span className="font-semibold text-primary-500">{quotation.job.jobNumber}</span>
              </div>
              <div className="flex justify-between mt-1">
                <span className="text-custom-700">Title</span>
                <span className="font-semibold text-secondary-100">{quotation.job.title}</span>
              </div>
            </div>
          )}

          {/* Stock items */}
          {items.length > 0 && (
            <div>
              <p className="text-xs font-bold text-custom-700 uppercase tracking-wide mb-2">Products / Services</p>
              <div className="rounded-xl border border-custom-300 overflow-hidden">
                <table className="w-full text-sm">
                  <thead className="bg-custom-100">
                    <tr>
                      <th className="px-4 py-2 text-left text-xs font-semibold text-custom-700">Item</th>
                      <th className="px-4 py-2 text-right text-xs font-semibold text-custom-700">Qty</th>
                      <th className="px-4 py-2 text-left text-xs font-semibold text-custom-700">Notes</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-custom-200">
                    {items.map((item) => (
                      <tr key={item.id}>
                        <td className="px-4 py-2.5 text-secondary-100 font-medium">{item.itemName ?? item.stockItem?.name ?? "—"}</td>
                        <td className="px-4 py-2.5 text-right text-secondary-100">{item.quantityNeeded} {item.unit ?? item.stockItem?.unit ?? ""}</td>
                        <td className="px-4 py-2.5 text-custom-700 text-xs">{item.notes ?? "—"}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          )}

          {/* Estimated amount — no tax breakdown */}
          <div className="rounded-xl bg-custom-50 border border-custom-300 p-4 text-sm">
            <p className="text-xs font-bold text-custom-700 uppercase tracking-wide mb-3">Estimated Amount</p>
            <div className="flex justify-between items-center">
              <span className="text-custom-700">Total (excl. tax)</span>
              <span className="text-xl font-bold text-primary-500">{estimatedAmount.toLocaleString()} RWF</span>
            </div>
            <p className="text-xs text-custom-600 mt-2 italic">
              * Tax will be calculated and added at the invoice / payment stage.
            </p>
          </div>

          {/* Terms / Notes / Validity */}
          {(quotation.terms || quotation.notes || quotation.validUntil) && (
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 text-sm">
              {quotation.validUntil && (
                <div>
                  <p className="text-xs text-custom-700 mb-1">Valid Until</p>
                  <p className="font-semibold text-secondary-100">{quotation.validUntil.slice(0, 10)}</p>
                </div>
              )}
              {quotation.terms && (
                <div className="sm:col-span-2">
                  <p className="text-xs text-custom-700 mb-1">Terms</p>
                  <p className="text-secondary-100">{quotation.terms}</p>
                </div>
              )}
              {quotation.notes && (
                <div className="sm:col-span-2">
                  <p className="text-xs text-custom-700 mb-1">Notes</p>
                  <p className="text-secondary-100">{quotation.notes}</p>
                </div>
              )}
            </div>
          )}

          {error && (
            <div className="flex items-center gap-2 px-4 py-3 rounded-xl bg-red-50 border border-red-200 text-red-700 text-sm">
              <HiOutlineExclamationCircle className="w-4 h-4 shrink-0" />
              {error}
            </div>
          )}
        </div>

        {/* Footer actions */}
        <div className="flex flex-wrap items-center justify-between gap-3 mt-6 pt-4 border-t border-custom-300">
          <div className="flex gap-2 flex-wrap">
            {quotation.status === "draft" && (
              <>
                <Button onClick={onEdit} variant="outline">
                  <HiOutlinePencil className="w-4 h-4 mr-1" /> Edit
                </Button>
                <Button onClick={() => handleStatus("sent")} disabled={updatingStatus}>
                  {updatingStatus ? "Sending…" : "Send to Client"}
                </Button>
              </>
            )}
            {quotation.status === "sent" && (
              <>
                <Button onClick={() => handleStatus("accepted")} disabled={updatingStatus}
                  className="bg-green-500 hover:bg-green-600">
                  Mark Accepted
                </Button>
                <Button onClick={() => handleStatus("rejected")} disabled={updatingStatus}
                  variant="outline">
                  Mark Rejected
                </Button>
              </>
            )}
          </div>
          <div className="flex gap-2">
            <button
              onClick={() => printProforma(quotation)}
              className="flex items-center gap-1.5 px-3 py-2 rounded-xl border border-custom-300 text-custom-700 hover:bg-custom-100 transition-colors text-sm font-semibold"
            >
              <HiOutlinePrinter className="w-4 h-4" /> Print
            </button>
            <button
              onClick={() => downloadProforma(quotation).catch(console.error)}
              className="flex items-center gap-1.5 px-3 py-2 rounded-xl border border-custom-300 text-custom-700 hover:bg-custom-100 transition-colors text-sm font-semibold"
            >
              <HiOutlineDownload className="w-4 h-4" /> Save
            </button>
            <Button variant="outline" onClick={onClose}>Close</Button>
          </div>
        </div>
      </Card>
    </div>
  );
}

// ─── Main Page ────────────────────────────────────────────────────────────────

export default function ProformasPage() {
  const [search, setSearch]             = useState("");
  const [statusFilter, setStatusFilter] = useState<ProformaStatus | "all">("all");
  const [page, setPage]                 = useState(1);
  const [selected, setSelected]         = useState<Proforma | null>(null);
  const [editing, setEditing]           = useState<Proforma | null>(null);

  const { data, isLoading, isError, refetch } = useGetProformasQuery({
    status: statusFilter !== "all" ? statusFilter : undefined,
    search: search.trim() || undefined,
    page,
    limit: 20,
  });

  const quotations = data?.proformas ?? [];
  const pagination = data?.pagination;

  const draftCount    = quotations.filter((q) => q.status === "draft").length;
  const sentCount     = quotations.filter((q) => q.status === "sent").length;
  const acceptedValue = quotations
    .filter((q) => q.status === "accepted")
    .reduce((s, q) => s + (q.totalAmount ?? q.subtotal ?? 0), 0);

  return (
    <DashboardLayout notificationCount={sentCount}>
      <div className="space-y-6 font-[family-name:var(--font-family-primary)]">

        {/* Header */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
          <div>
            <h1 className="text-2xl md:text-3xl font-bold text-secondary-100">PROFORMA</h1>
            <p className="text-sm text-custom-700 mt-1">
              Proposals sent to clients for negotiation and approval tax applied at invoice stage
            </p>
          </div>
          <button
            onClick={() => refetch()}
            className="flex items-center gap-2 px-3 py-2 rounded-xl border border-custom-300 hover:bg-custom-100 transition-colors text-custom-700 text-sm w-fit"
          >
            <HiOutlineRefresh className="w-4 h-4" />
            <span className="font-semibold">Refresh</span>
          </button>
        </div>

        {/* KPI Cards */}
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
          <Card className="!p-4">
            <p className="text-xs text-custom-700 mb-1">Total</p>
            <p className="text-2xl font-bold text-secondary-100">{isLoading ? "—" : quotations.length}</p>
          </Card>
          <Card className="!p-4">
            <p className="text-xs text-custom-700 mb-1">Draft</p>
            <p className="text-2xl font-bold text-gray-500">{isLoading ? "—" : draftCount}</p>
          </Card>
          <Card className="!p-4">
            <p className="text-xs text-custom-700 mb-1">Sent</p>
            <p className="text-2xl font-bold text-blue-500">{isLoading ? "—" : sentCount}</p>
          </Card>
          <Card className="!p-4">
            <p className="text-xs text-custom-700 mb-1">Accepted Value</p>
            <p className="text-2xl font-bold text-emerald-600">
              {isLoading ? "—" : acceptedValue >= 1_000_000
                ? `${(acceptedValue / 1_000_000).toFixed(1)}M`
                : `${acceptedValue.toLocaleString()}`}
            </p>
          </Card>
        </div>

        {/* Search + Status filters */}
        <Card className="!p-4">
          <div className="flex flex-col md:flex-row gap-3">
            <div className="relative flex-1">
              <HiOutlineSearch className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-custom-700" />
              <input
                type="text"
                placeholder="Search by performa #, job title, or customer…"
                value={search}
                onChange={(e) => { setSearch(e.target.value); setPage(1); }}
                className="w-full pl-9 pr-4 py-2 rounded-xl border border-custom-300 bg-style-500 text-secondary-100 text-sm placeholder:text-custom-700 focus:outline-none focus:border-primary-400 focus:ring-2 focus:ring-primary-200 transition-colors"
              />
            </div>
            <div className="flex gap-2 overflow-x-auto">
              {(["all", "draft", "sent", "accepted", "rejected", "expired"] as const).map((s) => (
                <button
                  key={s}
                  onClick={() => { setStatusFilter(s); setPage(1); }}
                  className={`px-3 py-2 rounded-xl text-xs font-semibold whitespace-nowrap transition-colors ${
                    statusFilter === s
                      ? "bg-primary-500 text-white"
                      : "border border-custom-300 text-custom-700 hover:bg-custom-100"
                  }`}
                >
                  {s === "all" ? "All" : statusConfig[s].label}
                </button>
              ))}
            </div>
          </div>
        </Card>

        {/* Table */}
        {isLoading ? (
          <Card className="!p-0 overflow-hidden">
            {Array.from({ length: 5 }).map((_, i) => (
              <div key={i} className="flex items-center gap-4 px-6 py-4 border-b border-custom-200 animate-pulse">
                <div className="h-4 w-28 bg-custom-200 rounded" />
                <div className="h-4 w-40 bg-custom-200 rounded" />
                <div className="ml-auto h-6 w-20 bg-custom-200 rounded-full" />
              </div>
            ))}
          </Card>
        ) : isError ? (
          <Card className="!p-12 text-center">
            <HiOutlineExclamationCircle className="w-10 h-10 text-red-400 mx-auto mb-3" />
            <p className="text-secondary-100 font-semibold">Failed to load PROFORMA</p>
            <button onClick={() => refetch()} className="mt-4 px-4 py-2 rounded-xl bg-primary-500 text-white text-sm font-semibold">Retry</button>
          </Card>
        ) : quotations.length === 0 ? (
          <Card className="!p-12 text-center">
            <HiOutlineDocumentText className="w-10 h-10 text-custom-400 mx-auto mb-3" />
            <p className="text-secondary-100 font-semibold">No PROFORMA found</p>
            <p className="text-sm text-custom-700 mt-1">PROFORMA are auto-created when a job is created</p>
          </Card>
        ) : (
          <Card className="!p-0 overflow-hidden">
            <div className="overflow-x-auto">
              <table className="w-full text-sm">
                <thead className="bg-custom-100 border-b border-custom-300">
                  <tr>
                    <th className="px-4 py-3 text-left text-xs font-bold text-custom-700 uppercase">Performa #</th>
                    <th className="px-4 py-3 text-left text-xs font-bold text-custom-700 uppercase">Customer</th>
                    <th className="px-4 py-3 text-left text-xs font-bold text-custom-700 uppercase">Job</th>
                    <th className="px-4 py-3 text-right text-xs font-bold text-custom-700 uppercase">Est. Amount</th>
                    <th className="px-4 py-3 text-center text-xs font-bold text-custom-700 uppercase">Status</th>
                    <th className="px-4 py-3 text-left text-xs font-bold text-custom-700 uppercase">Valid Until</th>
                    <th className="px-4 py-3 text-left text-xs font-bold text-custom-700 uppercase">Created</th>
                    <th className="px-4 py-3" />
                  </tr>
                </thead>
                <tbody className="divide-y divide-custom-200">
                  {quotations.map((q) => {
                    const cfg = statusConfig[q.status] ?? statusConfig.draft;
                    const Icon = cfg.icon;
                    const customer = getCustomer(q);
                    const estimatedAmount = q.totalAmount ?? q.subtotal ?? 0;
                    return (
                      <tr key={q.id} className="hover:bg-custom-50 transition-colors">
                        <td className="px-4 py-3">
                          <span className="font-bold text-primary-500">{q.proformaNo}</span>
                        </td>
                        <td className="px-4 py-3">
                          {customer ? (
                            <div>
                              <p className="font-semibold text-secondary-100">{customer.name}</p>
                              {customer.phone && <p className="text-xs text-custom-700">{customer.phone}</p>}
                              {customer.company && <p className="text-xs text-custom-600">{customer.company}</p>}
                            </div>
                          ) : <span className="text-custom-700">—</span>}
                        </td>
                        <td className="px-4 py-3">
                          {q.job ? (
                            <div>
                              <p className="font-semibold text-secondary-100 text-xs">{q.job.jobNumber}</p>
                              <p className="text-xs text-custom-700 truncate max-w-[140px]">{q.job.title}</p>
                            </div>
                          ) : <span className="text-custom-700">—</span>}
                        </td>
                        <td className="px-4 py-3 text-right font-bold text-secondary-100">
                          {estimatedAmount.toLocaleString()} RWF
                        </td>
                        <td className="px-4 py-3 text-center">
                          <span className={`inline-flex items-center gap-1 text-xs font-bold px-2.5 py-1 rounded-full ${cfg.bg} ${cfg.color}`}>
                            <Icon className="w-3.5 h-3.5" />
                            {cfg.label}
                          </span>
                        </td>
                        <td className="px-4 py-3 text-custom-700 text-xs">
                          {q.validUntil ? q.validUntil.slice(0, 10) : "—"}
                        </td>
                        <td className="px-4 py-3 text-custom-700 text-xs">
                          {new Date(q.createdAt).toLocaleDateString()}
                        </td>
                        <td className="px-4 py-3">
                          <div className="flex items-center justify-end gap-1">
                            {q.status === "draft" && (
                              <button
                                onClick={() => setEditing(q)}
                                className="p-1.5 rounded-lg hover:bg-custom-100 text-custom-700 hover:text-secondary-100 transition-colors"
                                title="Edit"
                              >
                                <HiOutlinePencil className="w-4 h-4" />
                              </button>
                            )}
                            <button
                              onClick={() => printProforma(q)}
                              className="p-1.5 rounded-lg hover:bg-custom-100 text-custom-700 hover:text-secondary-100 transition-colors"
                              title="Print"
                            >
                              <HiOutlinePrinter className="w-4 h-4" />
                            </button>
                            <button
                              onClick={() => downloadProforma(q).catch(console.error)}
                              className="p-1.5 rounded-lg hover:bg-custom-100 text-custom-700 hover:text-secondary-100 transition-colors"
                              title="Download PDF"
                            >
                              <HiOutlineDownload className="w-4 h-4" />
                            </button>
                            <button
                              onClick={() => setSelected(q)}
                              className="p-1.5 rounded-lg hover:bg-custom-100 text-custom-700 hover:text-secondary-100 transition-colors"
                              title="View"
                            >
                              <HiOutlineEye className="w-4 h-4" />
                            </button>
                          </div>
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>

            {/* Pagination */}
            {pagination && pagination.totalPages > 1 && (
              <div className="flex items-center justify-between px-6 py-3 border-t border-custom-300 text-sm">
                <span className="text-custom-700">
                  {pagination.total} total · page {pagination.page} of {pagination.totalPages}
                </span>
                <div className="flex gap-2">
                  <button
                    disabled={page <= 1}
                    onClick={() => setPage((p) => p - 1)}
                    className="px-3 py-1.5 rounded-lg border border-custom-300 text-custom-700 hover:bg-custom-100 disabled:opacity-40 disabled:cursor-not-allowed text-xs font-semibold"
                  >
                    ← Prev
                  </button>
                  <button
                    disabled={page >= pagination.totalPages}
                    onClick={() => setPage((p) => p + 1)}
                    className="px-3 py-1.5 rounded-lg border border-custom-300 text-custom-700 hover:bg-custom-100 disabled:opacity-40 disabled:cursor-not-allowed text-xs font-semibold"
                  >
                    Next →
                  </button>
                </div>
              </div>
            )}
          </Card>
        )}
      </div>

      {/* Detail modal */}
      {selected && (
        <DetailModal
          quotation={selected}
          onClose={() => setSelected(null)}
          onEdit={() => { setEditing(selected); setSelected(null); }}
        />
      )}

      {/* Edit modal */}
      {editing && (
        <EditProformaModal
          quotation={editing}
          onClose={() => setEditing(null)}
        />
      )}
    </DashboardLayout>
  );
}
