import { useState } from "react";
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
import type { Quotation, QuotationStatus } from "../../store/services/quotationsService";
import {
  useGetQuotationsQuery,
  useUpdateQuotationMutation,
  useUpdateQuotationStatusMutation,
} from "../../store/services/quotationsService";

// ─── Status config ────────────────────────────────────────────────────────────

const statusConfig: Record<QuotationStatus, { label: string; color: string; bg: string; icon: React.ElementType }> = {
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
function getCustomer(q: Quotation) {
  return q.customer ?? q.job?.customer ?? null;
}

// Print quotation using browser print dialog
function printQuotation(q: Quotation) {
  const customer = getCustomer(q);
  const items = q.job?.items ?? [];
  const html = `
    <html><head><title>${q.quotationNo}</title>
    <style>
      body { font-family: Arial, sans-serif; padding: 32px; color: #111; }
      h1 { font-size: 22px; margin-bottom: 4px; }
      .meta { color: #555; font-size: 13px; margin-bottom: 24px; }
      table { width: 100%; border-collapse: collapse; margin-bottom: 20px; }
      th { background: #f3f4f6; text-align: left; padding: 8px 12px; font-size: 12px; text-transform: uppercase; }
      td { padding: 8px 12px; border-bottom: 1px solid #e5e7eb; font-size: 13px; }
      .totals td { border: none; }
      .total-row td { font-weight: bold; font-size: 15px; border-top: 2px solid #111; }
      .badge { display: inline-block; padding: 2px 10px; border-radius: 999px; font-size: 11px; font-weight: bold; background: #dbeafe; color: #1d4ed8; }
    </style></head><body>
    <h1>${q.quotationNo}</h1>
    <div class="meta">
      ${customer ? `<strong>${customer.name}</strong>${customer.company ? ` · ${customer.company}` : ""}${customer.phone ? ` · ${customer.phone}` : ""}<br/>` : ""}
      ${q.job ? `Job: ${q.job.jobNumber} — ${q.job.title}<br/>` : ""}
      Status: <span class="badge">${q.status.toUpperCase()}</span>
      ${q.validUntil ? ` · Valid until: ${q.validUntil.slice(0, 10)}` : ""}
    </div>
    ${items.length > 0 ? `
    <table>
      <thead><tr><th>Item</th><th>Qty</th><th>Unit</th><th>Notes</th></tr></thead>
      <tbody>${items.map((i) => `<tr><td>${i.stockItem.name}</td><td>${i.quantityNeeded}</td><td>${i.stockItem.unit}</td><td>${i.notes ?? ""}</td></tr>`).join("")}</tbody>
    </table>` : ""}
    <table class="totals">
      <tr><td>Subtotal</td><td style="text-align:right">${(q.subtotal ?? 0).toLocaleString()} RWF</td></tr>
      <tr><td>Tax (${q.taxRate ?? 0}%)</td><td style="text-align:right">${(q.taxAmount ?? 0).toLocaleString()} RWF</td></tr>
      ${(q.discount ?? 0) > 0 ? `<tr><td>Discount</td><td style="text-align:right">- ${q.discount!.toLocaleString()} RWF</td></tr>` : ""}
      <tr class="total-row"><td>Total</td><td style="text-align:right">${(q.totalAmount ?? 0).toLocaleString()} RWF</td></tr>
    </table>
    ${q.terms ? `<p><strong>Terms:</strong> ${q.terms}</p>` : ""}
    ${q.notes ? `<p><strong>Notes:</strong> ${q.notes}</p>` : ""}
    </body></html>`;
  const win = window.open("", "_blank");
  if (win) { win.document.write(html); win.document.close(); win.print(); }
}

// Download quotation as PDF
function downloadQuotation(q: Quotation) {
  // dynamic import so jspdf is only loaded when needed
  import("jspdf").then(({ jsPDF }) => {
    const customer = getCustomer(q);
    const items = q.job?.items ?? [];
    const doc = new jsPDF({ orientation: "portrait", unit: "mm", format: "a4" });

    const pageW = doc.internal.pageSize.getWidth();
    const margin = 18;
    const contentW = pageW - margin * 2;
    let y = 20;

    // ── Header bar ──────────────────────────────────────────────────────────
    doc.setFillColor(37, 99, 235); // primary blue
    doc.rect(0, 0, pageW, 14, "F");
    doc.setTextColor(255, 255, 255);
    doc.setFontSize(11);
    doc.setFont("helvetica", "bold");
    doc.text("SAN Track", margin, 9.5);
    doc.setFont("helvetica", "normal");
    doc.setFontSize(9);
    doc.text("Quotation Document", pageW - margin, 9.5, { align: "right" });

    y = 24;

    // ── Quotation number + status ────────────────────────────────────────────
    doc.setTextColor(30, 30, 30);
    doc.setFontSize(18);
    doc.setFont("helvetica", "bold");
    doc.text(q.quotationNo, margin, y);

    doc.setFontSize(9);
    doc.setFont("helvetica", "normal");
    doc.setTextColor(100, 100, 100);
    doc.text(`Status: ${q.status.toUpperCase()}`, pageW - margin, y, { align: "right" });
    y += 7;

    if (q.validUntil) {
      doc.text(`Valid until: ${q.validUntil.slice(0, 10)}`, pageW - margin, y, { align: "right" });
    }
    doc.text(`Date: ${new Date(q.createdAt).toLocaleDateString()}`, margin, y);
    y += 10;

    // ── Divider ──────────────────────────────────────────────────────────────
    doc.setDrawColor(220, 220, 220);
    doc.line(margin, y, pageW - margin, y);
    y += 8;

    // ── Customer info ────────────────────────────────────────────────────────
    if (customer) {
      doc.setFontSize(9);
      doc.setFont("helvetica", "bold");
      doc.setTextColor(30, 30, 30);
      doc.text("BILL TO", margin, y);
      y += 5;
      doc.setFont("helvetica", "normal");
      doc.setFontSize(10);
      doc.text(customer.name, margin, y); y += 5;
      if (customer.company) { doc.text(customer.company, margin, y); y += 5; }
      if (customer.phone)   { doc.text(customer.phone,   margin, y); y += 5; }
      if (customer.email)   { doc.text(customer.email,   margin, y); y += 5; }
      y += 4;
    }

    // ── Job info ─────────────────────────────────────────────────────────────
    if (q.job) {
      doc.setFontSize(9);
      doc.setFont("helvetica", "bold");
      doc.setTextColor(80, 80, 80);
      doc.text(`Job: ${q.job.jobNumber} — ${q.job.title}`, margin, y);
      y += 8;
    }

    // ── Items table ──────────────────────────────────────────────────────────
    if (items.length > 0) {
      // Table header
      doc.setFillColor(243, 244, 246);
      doc.rect(margin, y, contentW, 7, "F");
      doc.setFontSize(8);
      doc.setFont("helvetica", "bold");
      doc.setTextColor(80, 80, 80);
      doc.text("ITEM",     margin + 2,          y + 5);
      doc.text("QTY",      margin + contentW * 0.6, y + 5, { align: "right" });
      doc.text("UNIT",     margin + contentW * 0.75, y + 5, { align: "right" });
      doc.text("NOTES",    margin + contentW,    y + 5, { align: "right" });
      y += 7;

      doc.setFont("helvetica", "normal");
      doc.setTextColor(30, 30, 30);
      items.forEach((item, idx) => {
        if (idx % 2 === 0) {
          doc.setFillColor(249, 250, 251);
          doc.rect(margin, y, contentW, 6.5, "F");
        }
        doc.setFontSize(9);
        doc.text(item.stockItem.name,              margin + 2,          y + 4.5);
        doc.text(String(item.quantityNeeded),       margin + contentW * 0.6, y + 4.5, { align: "right" });
        doc.text(item.stockItem.unit,               margin + contentW * 0.75, y + 4.5, { align: "right" });
        doc.text(item.notes ?? "",                  margin + contentW,    y + 4.5, { align: "right" });
        y += 6.5;
      });

      doc.setDrawColor(220, 220, 220);
      doc.line(margin, y, pageW - margin, y);
      y += 8;
    }

    // ── Financials ───────────────────────────────────────────────────────────
    const col1 = pageW - margin - 60;
    const col2 = pageW - margin;

    const addFinRow = (label: string, value: string, bold = false) => {
      doc.setFontSize(9);
      doc.setFont("helvetica", bold ? "bold" : "normal");
      doc.setTextColor(bold ? 30 : 80, bold ? 30 : 80, bold ? 30 : 80);
      doc.text(label, col1, y, { align: "right" });
      doc.setTextColor(30, 30, 30);
      doc.text(value, col2, y, { align: "right" });
      y += 6;
    };

    addFinRow("Subtotal:", `${(q.subtotal ?? 0).toLocaleString()} RWF`);
    addFinRow(`Tax (${q.taxRate ?? 0}%):`, `${(q.taxAmount ?? 0).toLocaleString()} RWF`);
    if ((q.discount ?? 0) > 0) {
      addFinRow("Discount:", `- ${q.discount!.toLocaleString()} RWF`);
    }
    doc.setDrawColor(37, 99, 235);
    doc.line(col1 - 10, y - 1, col2, y - 1);
    y += 2;
    addFinRow("TOTAL:", `${(q.totalAmount ?? 0).toLocaleString()} RWF`, true);
    y += 6;

    // ── Terms / Notes ────────────────────────────────────────────────────────
    if (q.terms) {
      doc.setFontSize(8);
      doc.setFont("helvetica", "bold");
      doc.setTextColor(80, 80, 80);
      doc.text("Terms & Conditions", margin, y); y += 5;
      doc.setFont("helvetica", "normal");
      doc.setTextColor(100, 100, 100);
      const lines = doc.splitTextToSize(q.terms, contentW);
      doc.text(lines, margin, y);
      y += lines.length * 4.5 + 4;
    }
    if (q.notes) {
      doc.setFontSize(8);
      doc.setFont("helvetica", "bold");
      doc.setTextColor(80, 80, 80);
      doc.text("Notes", margin, y); y += 5;
      doc.setFont("helvetica", "normal");
      doc.setTextColor(100, 100, 100);
      const lines = doc.splitTextToSize(q.notes, contentW);
      doc.text(lines, margin, y);
    }

    // ── Footer ───────────────────────────────────────────────────────────────
    const pageH = doc.internal.pageSize.getHeight();
    doc.setFillColor(37, 99, 235);
    doc.rect(0, pageH - 10, pageW, 10, "F");
    doc.setTextColor(255, 255, 255);
    doc.setFontSize(7);
    doc.setFont("helvetica", "normal");
    doc.text("Generated by SAN Track", pageW / 2, pageH - 4, { align: "center" });

    doc.save(`${q.quotationNo}.pdf`);
  });
}

// ─── Edit Modal ───────────────────────────────────────────────────────────────

function EditQuotationModal({
  quotation,
  onClose,
}: {
  quotation: Quotation;
  onClose: () => void;
}) {
  const [form, setForm] = useState({
    taxRate:    String(quotation.taxRate ?? 0),
    discount:   String(quotation.discount ?? 0),
    terms:      quotation.terms ?? "",
    notes:      quotation.notes ?? "",
    validUntil: quotation.validUntil ? quotation.validUntil.slice(0, 10) : "",
  });
  const [updateQuotation, { isLoading }] = useUpdateQuotationMutation();
  const [error, setError] = useState<string | null>(null);

  const subtotal   = quotation.subtotal ?? 0;
  const taxRate    = parseFloat(form.taxRate) || 0;
  const discount   = parseFloat(form.discount) || 0;
  const taxAmount  = subtotal * taxRate / 100;
  const total      = subtotal + taxAmount - discount;

  const handleSave = async () => {
    setError(null);
    try {
      await updateQuotation({
        id: quotation.id,
        taxRate:    taxRate,
        discount:   discount,
        terms:      form.terms || undefined,
        notes:      form.notes || undefined,
        validUntil: form.validUntil || undefined,
      }).unwrap();
      onClose();
    } catch (e: unknown) {
      const err = e as { data?: { message?: string } };
      setError(err?.data?.message ?? "Failed to update quotation.");
    }
  };

  return (
    <div className="fixed inset-0 bg-secondary-100/60 z-50 flex items-center justify-center p-4">
      <Card className="!p-6 max-w-lg w-full max-h-[90vh] overflow-y-auto">
        <div className="flex items-center justify-between mb-5">
          <div>
            <h3 className="text-lg font-bold text-secondary-100">Edit Quotation</h3>
            <p className="text-xs text-custom-700 mt-0.5">{quotation.quotationNo}</p>
          </div>
          <button onClick={onClose} className="text-custom-700 hover:text-secondary-100">
            <HiOutlineX className="w-5 h-5" />
          </button>
        </div>

        <div className="space-y-4">
          {/* Subtotal (read-only) */}
          <div className="rounded-xl bg-custom-100 border border-custom-300 p-4 space-y-2 text-sm">
            <div className="flex justify-between">
              <span className="text-custom-700">Subtotal</span>
              <span className="font-semibold text-secondary-100">{subtotal.toLocaleString()} RWF</span>
            </div>
            <div className="flex justify-between">
              <span className="text-custom-700">Tax ({taxRate}%)</span>
              <span className="font-semibold text-secondary-100">{taxAmount.toLocaleString()} RWF</span>
            </div>
            <div className="flex justify-between">
              <span className="text-custom-700">Discount</span>
              <span className="font-semibold text-red-500">- {discount.toLocaleString()} RWF</span>
            </div>
            <div className="flex justify-between font-bold text-base border-t border-custom-300 pt-2">
              <span className="text-secondary-100">Total</span>
              <span className="text-primary-500">{total.toLocaleString()} RWF</span>
            </div>
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-semibold text-secondary-100 mb-1.5">Tax Rate (%)</label>
              <input type="number" min="0" max="100" step="0.1"
                value={form.taxRate}
                onChange={(e) => setForm((p) => ({ ...p, taxRate: e.target.value }))}
                className={selectCls} />
            </div>
            <div>
              <label className="block text-sm font-semibold text-secondary-100 mb-1.5">Discount (RWF)</label>
              <input type="number" min="0"
                value={form.discount}
                onChange={(e) => setForm((p) => ({ ...p, discount: e.target.value }))}
                className={selectCls} />
            </div>
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
  quotation: Quotation;
  onClose: () => void;
  onEdit: () => void;
}) {
  const [updateStatus, { isLoading: updatingStatus }] = useUpdateQuotationStatusMutation();
  const [error, setError] = useState<string | null>(null);

  const cfg = statusConfig[quotation.status];
  const Icon = cfg.icon;

  const handleStatus = async (status: QuotationStatus) => {
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
  const items = quotation.job?.items ?? [];

  return (
    <div className="fixed inset-0 bg-secondary-100/60 z-50 flex items-center justify-center p-4">
      <Card className="!p-6 max-w-2xl w-full max-h-[90vh] overflow-y-auto">
        {/* Header */}
        <div className="flex items-start justify-between mb-5">
          <div>
            <h3 className="text-xl font-bold text-secondary-100">{quotation.quotationNo}</h3>
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
              <p className="text-xs font-bold text-custom-700 uppercase tracking-wide mb-2">Stock Items</p>
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
                        <td className="px-4 py-2.5 text-secondary-100 font-medium">{item.stockItem.name}</td>
                        <td className="px-4 py-2.5 text-right text-secondary-100">{item.quantityNeeded} {item.stockItem.unit}</td>
                        <td className="px-4 py-2.5 text-custom-700 text-xs">{item.notes ?? "—"}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          )}

          {/* Financials */}
          <div className="rounded-xl bg-custom-50 border border-custom-300 p-4 space-y-2 text-sm">
            <p className="text-xs font-bold text-custom-700 uppercase tracking-wide mb-2">Financials</p>
            <div className="flex justify-between">
              <span className="text-custom-700">Subtotal</span>
              <span className="font-semibold text-secondary-100">{(quotation.subtotal ?? 0).toLocaleString()} RWF</span>
            </div>
            <div className="flex justify-between">
              <span className="text-custom-700">Tax ({quotation.taxRate ?? 0}%)</span>
              <span className="font-semibold text-secondary-100">{(quotation.taxAmount ?? 0).toLocaleString()} RWF</span>
            </div>
            {(quotation.discount ?? 0) > 0 && (
              <div className="flex justify-between">
                <span className="text-custom-700">Discount</span>
                <span className="font-semibold text-red-500">- {quotation.discount!.toLocaleString()} RWF</span>
              </div>
            )}
            <div className="flex justify-between font-bold text-base border-t border-custom-300 pt-2">
              <span className="text-secondary-100">Total</span>
              <span className="text-primary-500">{(quotation.totalAmount ?? 0).toLocaleString()} RWF</span>
            </div>
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
              onClick={() => printQuotation(quotation)}
              className="flex items-center gap-1.5 px-3 py-2 rounded-xl border border-custom-300 text-custom-700 hover:bg-custom-100 transition-colors text-sm font-semibold"
            >
              <HiOutlinePrinter className="w-4 h-4" /> Print
            </button>
            <button
              onClick={() => downloadQuotation(quotation)}
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

export default function QuotationsPage() {
  const [search, setSearch]           = useState("");
  const [statusFilter, setStatusFilter] = useState<QuotationStatus | "all">("all");
  const [page, setPage]               = useState(1);
  const [selected, setSelected]       = useState<Quotation | null>(null);
  const [editing, setEditing]         = useState<Quotation | null>(null);

  const { data, isLoading, isError, refetch } = useGetQuotationsQuery({
    status: statusFilter !== "all" ? statusFilter : undefined,
    search: search.trim() || undefined,
    page,
    limit: 20,
  });

  const quotations  = data?.quotations ?? [];
  const pagination  = data?.pagination;

  // KPI counts from current page — ideally backend returns totals per status
  const draftCount    = quotations.filter((q) => q.status === "draft").length;
  const sentCount     = quotations.filter((q) => q.status === "sent").length;
  const acceptedValue = quotations
    .filter((q) => q.status === "accepted")
    .reduce((s, q) => s + (q.totalAmount ?? 0), 0);

  return (
    <DashboardLayout notificationCount={sentCount}>
      <div className="space-y-6 font-[family-name:var(--font-family-primary)]">

        {/* Header */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
          <div>
            <h1 className="text-2xl md:text-3xl font-bold text-secondary-100">Quotations</h1>
            <p className="text-sm text-custom-700 mt-1">Manage client quotations linked to jobs</p>
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
                placeholder="Search by quotation #, job title, or customer…"
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
            <p className="text-secondary-100 font-semibold">Failed to load quotations</p>
            <button onClick={() => refetch()} className="mt-4 px-4 py-2 rounded-xl bg-primary-500 text-white text-sm font-semibold">Retry</button>
          </Card>
        ) : quotations.length === 0 ? (
          <Card className="!p-12 text-center">
            <HiOutlineDocumentText className="w-10 h-10 text-custom-400 mx-auto mb-3" />
            <p className="text-secondary-100 font-semibold">No quotations found</p>
            <p className="text-sm text-custom-700 mt-1">Quotations are auto-created when a job is created</p>
          </Card>
        ) : (
          <Card className="!p-0 overflow-hidden">
            <div className="overflow-x-auto">
              <table className="w-full text-sm">
                <thead className="bg-custom-100 border-b border-custom-300">
                  <tr>
                    <th className="px-4 py-3 text-left text-xs font-bold text-custom-700 uppercase">Quotation #</th>
                    <th className="px-4 py-3 text-left text-xs font-bold text-custom-700 uppercase">Customer</th>
                    <th className="px-4 py-3 text-left text-xs font-bold text-custom-700 uppercase">Job</th>
                    <th className="px-4 py-3 text-right text-xs font-bold text-custom-700 uppercase">Total</th>
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
                    return (
                      <tr key={q.id} className="hover:bg-custom-50 transition-colors">
                        <td className="px-4 py-3">
                          <span className="font-bold text-primary-500">{q.quotationNo}</span>
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
                          {(q.totalAmount ?? 0).toLocaleString()} RWF
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
                              onClick={() => printQuotation(q)}
                              className="p-1.5 rounded-lg hover:bg-custom-100 text-custom-700 hover:text-secondary-100 transition-colors"
                              title="Print"
                            >
                              <HiOutlinePrinter className="w-4 h-4" />
                            </button>
                            <button
                              onClick={() => downloadQuotation(q)}
                              className="p-1.5 rounded-lg hover:bg-custom-100 text-custom-700 hover:text-secondary-100 transition-colors"
                              title="Download"
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
        <EditQuotationModal
          quotation={editing}
          onClose={() => setEditing(null)}
        />
      )}
    </DashboardLayout>
  );
}
