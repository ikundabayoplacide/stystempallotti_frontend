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

// ─── Shared HTML proforma layout (print + PDF source) ────────────────────────

function buildProformaHtml(q: Proforma): string {
  const customer = getCustomer(q);
  const items = getItems(q);
  const date = new Date(q.createdAt).toLocaleDateString("en-GB").replace(/\//g, "/");
  // Format: N°181/2026 — extract numeric part from proformaNo
  const proformaLabel = q.proformaNo;

  const itemRows = items.map((item, i) => {
    const desc = item.itemName ?? item.stockItem?.name ?? "—";
    const qty  = item.quantityNeeded;
    const up   = item.unitCost != null ? Number(item.unitCost).toLocaleString() : "—";
    const tp   = item.totalCost != null ? Number(item.totalCost).toLocaleString() : "—";
    return `<tr>
      <td style="text-align:center">${i + 1}.</td>
      <td><em>${desc}</em></td>
      <td style="text-align:center">${qty}</td>
      <td style="text-align:center">${up}</td>
      <td style="text-align:center">${tp}</td>
    </tr>`;
  }).join("");

  return `<!DOCTYPE html><html><head><meta charset="utf-8"/><title>${proformaLabel}</title>
  <style>
    *{margin:0;padding:0;box-sizing:border-box}
    body{font-family:Arial,sans-serif;font-size:12px;color:#111}
    @page{margin-bottom:60px}
    .page{width:210mm;margin:0 auto}
    .body{flex:1;padding:20px 28px}
    .top-info{display:flex;justify-content:space-between;margin-bottom:16px;font-size:12px}
    .doc-title{text-align:center;font-size:17px;font-weight:bold;text-transform:uppercase;letter-spacing:2px;margin-bottom:14px}
    table{width:100%;border-collapse:collapse;margin-bottom:0}
    th{background:#fff;border:1px solid #333;padding:7px 8px;text-align:center;font-size:11px;font-weight:bold;text-transform:uppercase}
    td{border:1px solid #333;padding:7px 8px;font-size:11px;vertical-align:top}
    .totals-section{display:flex;justify-content:flex-end;margin-top:0}
    .totals-box{border:1px solid #333;border-top:none;min-width:200px}
    .totals-box .trow{display:flex;justify-content:space-between;gap:24px;padding:5px 10px;border-bottom:1px solid #ddd;font-size:11px;font-weight:bold}
    .totals-box .trow:last-child{border-bottom:none}
    .footer{position:fixed;bottom:0;left:0;right:0;border-top:1px solid #ddd;padding:8px 28px 6px;font-size:9.5px;color:#444;background:#fff}
    .footer-cols{display:flex;justify-content:space-between;margin-bottom:4px}
    .footer-tagline{text-align:center;font-weight:bold;color:#00aeef;font-style:italic;font-size:11px;letter-spacing:1px}
    @media print{body{-webkit-print-color-adjust:exact;print-color-adjust:exact}.page{width:100%}}
  </style></head><body>
  <div class="page">
    <div class="header">
      <img src="/header.png" alt="Pallotti Presse" style="width:100%;display:block"/>
    </div>
    <div class="body">
      <div class="top-info">
        <div>
          <strong>CLIENT NAME:</strong> ${customer?.name ?? "—"}
          ${customer?.phone ? `<br/><strong>TEL:</strong> ${customer.phone}` : ""}
          ${customer?.email ? `<br/><strong>EMAIL:</strong> ${customer.email}` : ""}
        </div>
        <div><strong>Kigali,</strong> ${date}</div>
      </div>
      <div class="doc-title">PROFORMA INVOICE N°${proformaLabel}</div>
      <table>
        <thead><tr><th style="width:40px">No.</th><th>DESCRIPTION</th><th style="width:60px">QTY</th><th style="width:90px">U.P (RWF)</th><th style="width:90px">T.P (RWF)</th></tr></thead>
        <tbody>${itemRows || '<tr><td colspan="5" style="text-align:center;color:#888">No items</td></tr>'}</tbody>
      </table>
      <div class="totals-section">
        <div class="totals-box">
          <div class="trow"><span>SUB-TOTAL</span><span>${(q.subtotal ?? 0).toLocaleString()}</span></div>
          <div class="trow"><span>VAT</span><span>${(q.taxAmount ?? 0).toLocaleString()}</span></div>
          <div class="trow"><span>TOTAL TAXES INCLUSIVE</span><span>${(q.totalAmount ?? 0).toLocaleString()}</span></div>
        </div>
      </div>
      ${q.terms ? `<p style="margin-top:14px;font-size:11px"><strong>Terms:</strong> ${q.terms}</p>` : ""}
      ${q.notes ? `<p style="margin-top:8px;font-size:11px"><strong>Notes:</strong> ${q.notes}</p>` : ""}
    </div>
    <div class="footer">
      <div class="footer-cols">
        <div><div>B.P. 863 Kigali - Rwanda</div><div>TIN / <strong>T.V.A. N° 100021520</strong></div></div>
        <div><div>Tél: Reception (+250) 788 313 617 / (+250) 788 304 549</div><div>No. RC: 536 / 09 / NYR</div></div>
        <div><div>E-mail: pallottipresse@yahoo.com</div><div>Compte : BK : <strong>100000174372</strong></div></div>
      </div>
      <div class="footer-tagline">Rapidité · Qualité · Innovation · Esprit d'Equipe</div>
    </div>
  </div>
  </body></html>`;
}

function printProforma(q: Proforma) {
  const win = window.open("", "_blank");
  if (!win) return;
  win.document.write(buildProformaHtml(q));
  win.document.close();
  win.focus();
  setTimeout(() => win.print(), 400);
}

// ─── Download proforma as PDF (print the HTML layout) ────────────────────────

function downloadProforma(q: Proforma): Promise<void> {
  return new Promise((resolve) => {
    const win = window.open("", "_blank");
    if (!win) { resolve(); return; }
    win.document.write(buildProformaHtml(q));
    win.document.close();
    win.focus();
    setTimeout(() => { win.print(); resolve(); }, 400);
  });
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
