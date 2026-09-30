import jsPDF from "jspdf";
import autoTable from "jspdf-autotable";
import { useMemo, useState } from "react";
import {
  HiOutlineArchive,
  HiOutlineCalendar,
  HiOutlineChartBar,
  HiOutlineDocumentDownload,
  HiOutlineDocumentText,
  HiOutlineRefresh,
  HiOutlineShoppingBag,
} from "react-icons/hi";
import { DashboardLayout, GenerateReportModal } from "../../components";
import { Card } from "../../components/ui";
import { useAuth } from "../../context/AuthContext";
import {
  useGetBoutiqueStockEntriesQuery,
  useGetBoutiqueStockItemsQuery,
  useGetBoutiqueStockSortiesQuery,
} from "../../store/services/boutiqueStockService";
import {
  useGetGeneralStockEntriesQuery,
  useGetGeneralStockItemsQuery,
  useGetGeneralStockSortiesQuery,
} from "../../store/services/generalStockService";
import { useGetUnreadCountQuery } from "../../store/services/notificationsService";
import {
  useGetBoutiqueStockReportQuery,
  useGetGeneralStockReportQuery,
  type ReportInterval,
} from "../../store/services/stockReportsService";

// ─── PDF helpers ───────────────────────────────────────────────────────────────

const COMPANY = {
  address: "B.P. 863 Kigali - Rwanda",
  tin: "TIN / T.V.A.: NO 100021520",
  tel: "Tel: Reception (+250) 788 313 617 / (+250) 788 304 549",
  rc: "No. RC: 536 / 09 / NYR",
  email: "E-mail: Santrackpresse@yahoo.com",
  compte: "Compte: BK: 10000017 4372",
  motto: "Rapidite - Qualite - Innovation - Esprit d'Equipe",
};

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

const HEADER_H = 35,
  FOOTER_TOP = 26,
  TABLE_START_Y = HEADER_H + 23,
  BOTTOM_MARGIN = FOOTER_TOP + 6;

function drawLetterhead(
  pdf: any,
  hdr: string | null,
  title: string,
  sub: string,
) {
  const pw = pdf.internal.pageSize.getWidth();
  if (hdr) pdf.addImage(hdr, "PNG", 0, 0, pw, HEADER_H);
  pdf.setFont("helvetica", "bold");
  pdf.setFontSize(12);
  pdf.setTextColor(25, 25, 25);
  pdf.text(title, pw / 2, HEADER_H + 10, { align: "center" });
  if (sub) {
    pdf.setFont("helvetica", "normal");
    pdf.setFontSize(7.5);
    pdf.setTextColor(110, 110, 110);
    pdf.text(sub, pw / 2, HEADER_H + 16, { align: "center" });
  }
}

function drawFooter(pdf: any, pageNum: number, total: number) {
  const pw = pdf.internal.pageSize.getWidth(),
    ph = pdf.internal.pageSize.getHeight(),
    fy = ph - FOOTER_TOP;
  pdf.setDrawColor(200, 200, 200);
  pdf.setLineWidth(0.3);
  pdf.line(10, fy, pw - 10, fy);
  pdf.setFont("helvetica", "normal");
  pdf.setFontSize(6.5);
  pdf.setTextColor(60, 60, 60);
  const c1 = 12,
    c2 = pw / 2,
    c3 = pw - 12,
    r1 = fy + 5,
    r2 = fy + 10;
  pdf.text(COMPANY.address, c1, r1);
  pdf.text(COMPANY.tin, c1, r2);
  pdf.text(COMPANY.tel, c2, r1, { align: "center" });
  pdf.text(COMPANY.rc, c2, r2, { align: "center" });
  pdf.text(COMPANY.email, c3, r1, { align: "right" });
  pdf.text(COMPANY.compte, c3, r2, { align: "right" });
  pdf.setFont("helvetica", "bolditalic");
  pdf.setFontSize(7);
  pdf.setTextColor(0, 160, 210);
  pdf.text(COMPANY.motto, c2, fy + 16, { align: "center" });
  pdf.setFont("helvetica", "normal");
  pdf.setFontSize(6.5);
  pdf.setTextColor(150, 150, 150);
  pdf.text("Page " + pageNum + " of " + total, pw - 10, fy + 16, {
    align: "right",
  });
}

type SummaryRow = { label: string; value: string; bold?: boolean };

async function buildPdf(
  title: string,
  headers: string[],
  rows: string[][],
  summary: SummaryRow[],
) {
  const hdr = await loadImageAsBase64("/header.png").catch(() => null);
  const subtitle = "Generated: " + new Date().toLocaleString("en-RW");
  const pdf = new jsPDF({ orientation: "portrait", unit: "mm", format: "a4" });
  const pw = pdf.internal.pageSize.getWidth();
  drawLetterhead(pdf, hdr, title, subtitle);
  autoTable(pdf, {
    head: [headers],
    body: rows,
    startY: TABLE_START_Y,
    margin: { left: 10, right: 10, bottom: BOTTOM_MARGIN },
    styles: { fontSize: 7, cellPadding: 2 },
    headStyles: { fillColor: [0, 160, 210], textColor: 255, fontStyle: "bold" },
    alternateRowStyles: { fillColor: [245, 251, 255] },
    didDrawPage: (data: { pageNumber: number }) => {
      if (data.pageNumber > 1) drawLetterhead(pdf, hdr, title, subtitle);
      drawFooter(
        pdf,
        data.pageNumber,
        (pdf as any).internal.getNumberOfPages(),
      );
    },
  });
  if (summary.length > 0) {
    const ay = (pdf as any).lastAutoTable.finalY + 8,
      c1 = pw - 90,
      c2 = pw - 12;
    pdf.setDrawColor(0, 160, 210);
    pdf.setLineWidth(0.4);
    pdf.line(c1, ay - 3, c2, ay - 3);
    let sy = ay;
    summary.forEach(({ label, value, bold }) => {
      pdf.setFont("helvetica", bold ? "bold" : "normal");
      pdf.setFontSize(8);
      pdf.setTextColor(40, 40, 40);
      pdf.text(label, c1, sy);
      pdf.text(value, c2, sy, { align: "right" });
      sy += 6;
    });
    pdf.line(c1, sy, c2, sy);
  }
  const tp = (pdf as any).internal.getNumberOfPages();
  for (let i = 1; i <= tp; i++) {
    pdf.setPage(i);
    drawFooter(pdf, i, tp);
  }
  pdf.save(
    title.replace(/\s+/g, "_") +
      "_" +
      new Date().toISOString().split("T")[0] +
      ".pdf",
  );
}

// ─── Shared UI ─────────────────────────────────────────────────────────────────

const PAGE_SIZE = 10;

// Helper function to get date range based on interval
function getDateRangeForInterval(
  interval: ReportInterval,
  customFrom?: string,
  customTo?: string,
): { from: Date; to: Date } {
  const now = new Date();
  let from: Date;
  let to: Date = new Date(
    now.getFullYear(),
    now.getMonth(),
    now.getDate(),
    23,
    59,
    59,
    999,
  );

  switch (interval) {
    case "daily":
      from = new Date(
        now.getFullYear(),
        now.getMonth(),
        now.getDate(),
        0,
        0,
        0,
        0,
      );
      break;
    case "weekly":
      from = new Date(
        now.getFullYear(),
        now.getMonth(),
        now.getDate() - 6,
        0,
        0,
        0,
        0,
      );
      break;
    case "monthly":
      from = new Date(now.getFullYear(), now.getMonth(), 1, 0, 0, 0, 0);
      to = new Date(now.getFullYear(), now.getMonth() + 1, 0, 23, 59, 59, 999);
      break;
    case "annual":
      if (customFrom && customTo) {
        from = new Date(customFrom + "T00:00:00");
        to = new Date(customTo + "T23:59:59");
      } else {
        from = new Date(now.getFullYear(), 0, 1, 0, 0, 0, 0);
        to = new Date(now.getFullYear(), 11, 31, 23, 59, 59, 999);
      }
      break;
    default:
      from = new Date(now.getFullYear(), now.getMonth(), 1, 0, 0, 0, 0);
      break;
  }

  return { from, to };
}

function dateKey(d: Date): string {
  return `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, "0")}-${String(d.getDate()).padStart(2, "0")}`;
}

function fmtDate(d: Date | string): string {
  return new Date(d).toLocaleDateString("en-RW", {
    day: "2-digit",
    month: "short",
    year: "numeric",
  });
}

function periodLabel(
  interval: ReportInterval,
  from: string,
  to: string,
  range: { from: Date; to: Date },
): string {
  if (interval === "annual" && from && to)
    return (
      "Custom: " +
      fmtDate(from + "T00:00:00") +
      " \u2013 " +
      fmtDate(to + "T23:59:59")
    );
  const name = interval.charAt(0).toUpperCase() + interval.slice(1);
  return name + ": " + fmtDate(range.from) + " \u2013 " + fmtDate(range.to);
}

function PdfButtons({
  title,
  getExportData,
}: {
  title: string;
  getExportData: () => {
    headers: string[];
    rows: string[][];
    summary: SummaryRow[];
  };
}) {
  const [showModal, setShowModal] = useState(false);
  const handle = () => {
    const { headers, rows, summary } = getExportData();
    buildPdf(title, headers, rows, summary).catch((e) =>
      alert("PDF error: " + (e as Error).message),
    );
  };
  return (
    <>
      <button
        onClick={handle}
        className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-red-500 text-white text-xs font-semibold hover:bg-red-600 transition-colors"
      >
        <HiOutlineDocumentDownload className="w-4 h-4" /> PDF
      </button>
      <button
        onClick={() => setShowModal(true)}
        className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-primary-500 text-white text-xs font-semibold hover:bg-primary-600 transition-colors"
      >
        <HiOutlineDocumentText className="w-4 h-4" /> Generate Report
      </button>
      {showModal && (
        <GenerateReportModal
          title={title}
          onClose={() => setShowModal(false)}
        />
      )}
    </>
  );
}

function StatCard({
  label,
  value,
  sub,
  color = "text-secondary-100",
}: {
  label: string;
  value: string | number;
  sub?: string;
  color?: string;
}) {
  return (
    <Card className="!p-4">
      <p className="text-xs text-custom-700 mb-1">{label}</p>
      <p className={"text-2xl font-bold " + color}>{value}</p>
      {sub && <p className="text-xs text-custom-700 mt-0.5">{sub}</p>}
    </Card>
  );
}

function Section({
  icon: Icon,
  title,
  color,
  children,
}: {
  icon: React.ElementType;
  title: string;
  color: string;
  children: React.ReactNode;
}) {
  return (
    <div className="space-y-4">
      <div className="flex items-center gap-2">
        <div
          className={
            "w-8 h-8 rounded-lg flex items-center justify-center " + color
          }
        >
          <Icon className="w-4 h-4" />
        </div>
        <h2 className="text-base font-bold text-secondary-100">{title}</h2>
      </div>
      {children}
    </div>
  );
}

function Paginator({
  page,
  totalPages,
  total,
  onPage,
}: {
  page: number;
  totalPages: number;
  total: number;
  onPage: (n: number) => void;
}) {
  if (total <= PAGE_SIZE) return null;
  const pages: (number | "...")[] = [];
  const add = (n: number) => {
    if (!pages.includes(n)) pages.push(n);
  };
  add(1);
  if (page - 2 > 2) pages.push("...");
  for (
    let i = Math.max(2, page - 1);
    i <= Math.min(totalPages - 1, page + 1);
    i++
  )
    add(i);
  if (page + 2 < totalPages - 1) pages.push("...");
  if (totalPages > 1) add(totalPages);
  return (
    <div className="flex items-center justify-between mt-1">
      <p className="text-xs text-custom-700">
        Showing {(page - 1) * PAGE_SIZE + 1}–{Math.min(page * PAGE_SIZE, total)}{" "}
        of {total}
      </p>
      <div className="flex items-center gap-1">
        <button
          onClick={() => onPage(Math.max(1, page - 1))}
          disabled={page === 1}
          className="px-3 py-1.5 rounded-lg border border-custom-300 text-xs font-semibold text-secondary-100 hover:bg-custom-100 disabled:opacity-40 transition-colors"
        >
          Prev
        </button>
        {pages.map((n, i) =>
          n === "..." ? (
            <span key={"e-" + i} className="px-1 text-xs text-custom-700">
              …
            </span>
          ) : (
            <button
              key={n}
              onClick={() => onPage(n as number)}
              className={
                "w-8 h-8 rounded-lg text-xs font-bold transition-colors " +
                (n === page
                  ? "bg-primary-500 text-white"
                  : "border border-custom-300 text-secondary-100 hover:bg-custom-100")
              }
            >
              {n}
            </button>
          ),
        )}
        <button
          onClick={() => onPage(Math.min(totalPages, page + 1))}
          disabled={page === totalPages}
          className="px-3 py-1.5 rounded-lg border border-custom-300 text-xs font-semibold text-secondary-100 hover:bg-custom-100 disabled:opacity-40 transition-colors"
        >
          Next
        </button>
      </div>
    </div>
  );
}

const sortieStatusColors: Record<string, string> = {
  pending: "bg-yellow-100 text-yellow-700",
  approved: "bg-emerald-100 text-emerald-700",
  rejected: "bg-red-100 text-red-700",
};

const stockStatusBadge: Record<string, string> = {
  available: "bg-emerald-100 text-emerald-700",
  low: "bg-yellow-100 text-yellow-700",
  "out-of-stock": "bg-red-100 text-red-700",
};

function boutiqueNormStatus(s: string): string {
  if (s === "in-stock") return "available";
  if (s === "low-stock") return "low";
  return "out-of-stock";
}

// ─── Boutique Stock Report ────────────────────────────────────────────────────

function BoutiqueStockReport() {
  const [tab, setTab] = useState<"items" | "sorties">("items");
  const [page, setPage] = useState(1);
  const [statusFilter, setStatusFilter] = useState("");
  const [sortieStatusFilter, setSortieStatusFilter] = useState("");
  const [interval, setInterval] = useState<ReportInterval>("monthly");
  const [customFromDate, setCustomFromDate] = useState("");
  const [customToDate, setCustomToDate] = useState("");

  // Server-side date range filter for sorties based on interval
  const dateRange = useMemo(
    () => getDateRangeForInterval(interval, customFromDate, customToDate),
    [interval, customFromDate, customToDate],
  );
  const sortieParams = useMemo(
    () => ({
      limit: 500,
      from:
        interval === "annual" && customFromDate
          ? customFromDate
          : dateKey(dateRange.from),
      to:
        interval === "annual" && customToDate
          ? customToDate
          : dateKey(dateRange.to),
    }),
    [interval, customFromDate, customToDate, dateRange],
  );

  const {
    data: itemsData,
    isLoading: loadingItems,
    refetch: refetchItems,
  } = useGetBoutiqueStockItemsQuery({ limit: 500 });
  const { data: entriesData } = useGetBoutiqueStockEntriesQuery(sortieParams);
  const {
    data: sortiesData,
    isLoading: loadingSorties,
    refetch: refetchSorties,
  } = useGetBoutiqueStockSortiesQuery(sortieParams);

  const allItems = itemsData?.data ?? [];
  const allEntries = entriesData?.data ?? [];
  const allSorties = sortiesData?.data ?? [];

  // Period-level stock movement per item (received via entries, issued via sorties)
  const entriesById = useMemo(() => {
    const m: Record<string, number> = {};
    for (const e of allEntries) {
      const d = new Date(e.entryDate ?? e.createdAt);
      if (d >= dateRange.from && d <= dateRange.to) {
        const id = e.stockItemId;
        m[id] =
          (m[id] ?? 0) + parseFloat(String(e.quantityIn ?? e.quantity ?? 0));
      }
    }
    return m;
  }, [allEntries, dateRange]);

  const sortiesById = useMemo(() => {
    const m: Record<string, number> = {};
    for (const s of allSorties) {
      const d = new Date(s.sortieDate ?? s.createdAt);
      if (d >= dateRange.from && d <= dateRange.to) {
        const id = s.stockItemId;
        m[id] = (m[id] ?? 0) + parseFloat(s.quantityOut || "0");
      }
    }
    return m;
  }, [allSorties, dateRange]);

  const filteredSortiesByDate = useMemo(
    () =>
      allSorties.filter((s) => {
        const sortieDate = new Date(s.sortieDate ?? s.createdAt);
        return sortieDate >= dateRange.from && sortieDate <= dateRange.to;
      }),
    [allSorties, dateRange],
  );

  const activeItemIds = useMemo(() => {
    const ids = new Set<string>([
      ...Object.keys(entriesById),
      ...Object.keys(sortiesById),
    ]);
    for (const i of allItems) {
      const d = new Date(i.createdAt);
      if (d >= dateRange.from && d <= dateRange.to) ids.add(i.id);
    }
    return ids;
  }, [entriesById, sortiesById, allItems, dateRange]);

  const items = allItems.filter(
    (i) =>
      activeItemIds.has(i.id) &&
      (!statusFilter || boutiqueNormStatus(i.stockStatus) === statusFilter),
  );
  const sorties = filteredSortiesByDate.filter(
    (s) => !sortieStatusFilter || s.status === sortieStatusFilter,
  );

  const isLoading = tab === "items" ? loadingItems : loadingSorties;
  const refetch = tab === "items" ? refetchItems : refetchSorties;

  const available = items.filter(
    (i) => boutiqueNormStatus(i.stockStatus) === "available",
  ).length;
  const low = items.filter(
    (i) => boutiqueNormStatus(i.stockStatus) === "low",
  ).length;
  const outOfStock = items.filter(
    (i) => boutiqueNormStatus(i.stockStatus) === "out-of-stock",
  ).length;
  const totalValue = items.reduce(
    (s, i) => s + Number(i.currentStock) * Number(i.unitCost ?? 0),
    0,
  );

  const pendingCount = filteredSortiesByDate.filter(
    (s) => s.status === "pending",
  ).length;
  const approvedCount = filteredSortiesByDate.filter(
    (s) => s.status === "approved",
  ).length;
  const rejectedCount = filteredSortiesByDate.filter(
    (s) => s.status === "rejected",
  ).length;
  const totalUnitsOut = filteredSortiesByDate
    .filter((s) => s.status === "approved")
    .reduce((acc, s) => acc + parseFloat(s.quantityOut), 0);

  const itemsTotalPages = Math.max(1, Math.ceil(items.length / PAGE_SIZE));
  const itemsPaginated = items.slice((page - 1) * PAGE_SIZE, page * PAGE_SIZE);
  const sortiesTotalPages = Math.max(1, Math.ceil(sorties.length / PAGE_SIZE));
  const sortiesPaginated = sorties.slice(
    (page - 1) * PAGE_SIZE,
    page * PAGE_SIZE,
  );

  const getItemsExport = () => ({
    headers: [
      "Item Name",
      "Category",
      "Unit",
      "Current Stock",
      "In (period)",
      "Out (period)",
      "Alarm Level",
      "Unit Cost (RWF)",
      "Total Value (RWF)",
      "Status",
    ],
    rows: items.map((i) => [
      i.itemName,
      i.category,
      i.unit,
      String(i.currentStock),
      String(entriesById[i.id] ?? 0),
      String(sortiesById[i.id] ?? 0),
      String(i.alarmStock),
      Number(i.unitCost ?? 0).toLocaleString(),
      (Number(i.unitCost ?? 0) * i.currentStock).toLocaleString(),
      boutiqueNormStatus(i.stockStatus).replace("-", " "),
    ]),
    summary: [
      { label: "Total Items: " + items.length, value: "" },
      { label: "Available", value: String(available) },
      { label: "Low Stock", value: String(low) },
      { label: "Out of Stock", value: String(outOfStock) },
      {
        label: "Period In",
        value: String(Object.values(entriesById).reduce((a, b) => a + b, 0)),
      },
      {
        label: "Period Out",
        value: String(Object.values(sortiesById).reduce((a, b) => a + b, 0)),
      },
      {
        label: "STOCK VALUE",
        value: totalValue.toLocaleString() + " RWF",
        bold: true,
      },
    ] as SummaryRow[],
  });

  const getSortiesExport = () => ({
    headers: [
      "Item",
      "Qty Out",
      "Reason",
      "Requested By",
      "Approved By",
      "Status",
      "Date",
    ],
    rows: sorties.map((s) => [
      s.stockItem?.itemName ?? "—",
      parseFloat(s.quantityOut).toString(),
      s.reason ?? "—",
      s.requester?.name ?? "—",
      s.approvedBy?.name ?? "—",
      s.status,
      new Date(s.createdAt).toLocaleDateString("en-RW", {
        day: "2-digit",
        month: "short",
        year: "numeric",
      }),
    ]),
    summary: [
      { label: "Total Requests", value: String(filteredSortiesByDate.length) },
      { label: "Pending", value: String(pendingCount) },
      { label: "Approved", value: String(approvedCount) },
      { label: "Rejected", value: String(rejectedCount) },
      {
        label: "TOTAL UNITS OUT (approved)",
        value: totalUnitsOut.toFixed(0),
        bold: true,
      },
    ] as SummaryRow[],
  });

  return (
    <Section
      icon={HiOutlineShoppingBag}
      title="Boutique Stock"
      color="bg-pink-100 text-pink-600"
    >
      {/* Interval Filter */}
      <div className="flex items-center gap-2 flex-wrap">
        <HiOutlineCalendar className="w-5 h-5 text-custom-700" />
        {(["daily", "weekly", "monthly", "annual"] as ReportInterval[]).map(
          (int) => (
            <button
              key={int}
              onClick={() => setInterval(int)}
              className={`px-3 py-1.5 rounded-lg text-sm font-medium transition-colors ${
                interval === int
                  ? "bg-primary-100 text-primary-700 border border-primary-400"
                  : "bg-white text-custom-700 border border-custom-300 hover:bg-custom-50"
              }`}
            >
              {int.charAt(0).toUpperCase() + int.slice(1)}
            </button>
          ),
        )}

        {/* Custom Date Range (only when annual is selected) */}
        {interval === "annual" && (
          <>
            <input
              type="date"
              value={customFromDate}
              onChange={(e) => setCustomFromDate(e.target.value)}
              className="px-2 py-1.5 rounded-lg border border-custom-300 bg-style-500 text-secondary-100 text-xs focus:outline-none focus:border-primary-400"
            />
            <span className="text-xs text-custom-700">to</span>
            <input
              type="date"
              value={customToDate}
              min={customFromDate}
              onChange={(e) => setCustomToDate(e.target.value)}
              className="px-2 py-1.5 rounded-lg border border-custom-300 bg-style-500 text-secondary-100 text-xs focus:outline-none focus:border-primary-400"
            />
            {(customFromDate || customToDate) && (
              <button
                onClick={() => {
                  setCustomFromDate("");
                  setCustomToDate("");
                }}
                className="px-2.5 py-1.5 rounded-lg text-xs font-semibold text-red-600 bg-red-50 border border-red-200 hover:bg-red-100 transition-colors"
              >
                Clear
              </button>
            )}
          </>
        )}
        <span className="ml-auto text-[11px] font-semibold text-primary-700 bg-primary-50 border border-primary-200 rounded-lg px-2.5 py-1 whitespace-nowrap">
          {periodLabel(interval, customFromDate, customToDate, dateRange)}
        </span>
      </div>

      {/* Summary stats */}
      <div className="grid grid-cols-2 sm:grid-cols-5 gap-4">
        <StatCard label="Total Items" value={items.length} />
        <StatCard
          label="Available"
          value={available}
          color="text-emerald-600"
        />
        <StatCard label="Low Stock" value={low} color="text-yellow-600" />
        <StatCard
          label="Out of Stock"
          value={outOfStock}
          color="text-red-600"
          sub={
            totalValue > 0
              ? "Value: " + totalValue.toLocaleString() + " RWF"
              : undefined
          }
        />
        <StatCard
          label="Pending Requests"
          value={pendingCount}
          color="text-orange-600"
          sub={"Approved: " + approvedCount}
        />
      </div>

      {/* Sub-tabs */}
      <div className="flex gap-1 p-1 bg-custom-100 rounded-xl w-fit">
        {(["items", "sorties"] as const).map((t) => (
          <button
            key={t}
            onClick={() => {
              setTab(t);
              setPage(1);
            }}
            className={
              "px-4 py-1.5 rounded-lg text-xs font-semibold transition-colors " +
              (tab === t
                ? "bg-primary-500 text-white shadow-sm"
                : "text-custom-700 hover:text-secondary-100")
            }
          >
            {t === "items" ? "Items" : "Stock Requests"}
            {t === "sorties" && pendingCount > 0 && (
              <span className="ml-1.5 inline-flex items-center justify-center w-4 h-4 bg-yellow-500 text-white text-[9px] font-bold rounded-full">
                {pendingCount > 9 ? "9+" : pendingCount}
              </span>
            )}
          </button>
        ))}
      </div>

      {/* Items tab */}
      {tab === "items" && (
        <>
          <div className="flex flex-wrap items-center gap-2 justify-end">
            <select
              value={statusFilter}
              onChange={(e) => {
                setStatusFilter(e.target.value);
                setPage(1);
              }}
              className="px-2 py-1.5 rounded-lg border border-custom-300 bg-style-500 text-secondary-100 text-xs focus:outline-none focus:border-primary-400 transition-colors"
            >
              <option value="">All statuses</option>
              <option value="available">Available</option>
              <option value="low">Low Stock</option>
              <option value="out-of-stock">Out of Stock</option>
            </select>
            <button
              onClick={() => refetch()}
              className="p-1.5 rounded-lg border border-custom-300 hover:bg-custom-100 transition-colors"
            >
              <HiOutlineRefresh
                className={
                  "w-4 h-4 text-custom-700 " + (isLoading ? "animate-spin" : "")
                }
              />
            </button>
            <PdfButtons
              title="Boutique Stock Items Report"
              getExportData={getItemsExport}
            />
          </div>

          <Card className="!p-0 overflow-hidden">
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead className="bg-custom-100 border-b border-custom-300">
                  <tr>
                    {[
                      "Item Name",
                      "Category",
                      "Unit",
                      "Stock",
                      "In (period)",
                      "Out (period)",
                      "Unit Cost",
                      "Total Value",
                      "Status",
                    ].map((h) => (
                      <th
                        key={h}
                        className="px-3 py-2 text-left text-xs font-bold text-secondary-100 uppercase"
                      >
                        {h}
                      </th>
                    ))}
                  </tr>
                </thead>
                <tbody className="divide-y divide-custom-200">
                  {loadingItems ? (
                    <tr>
                      <td
                        colSpan={10}
                        className="px-4 py-8 text-center text-custom-700 text-sm"
                      >
                        Loading...
                      </td>
                    </tr>
                  ) : items.length === 0 ? (
                    <tr>
                      <td
                        colSpan={10}
                        className="px-4 py-8 text-center text-custom-700 text-sm"
                      >
                        No items had movement in this period
                      </td>
                    </tr>
                  ) : (
                    itemsPaginated.map((i) => (
                      <tr
                        key={i.id}
                        className="hover:bg-custom-50 transition-colors"
                      >
                        <td className="px-3 py-2.5">
                          <p className="text-sm font-semibold text-secondary-100">
                            {i.itemName}
                          </p>
                          {i.description && (
                            <p className="text-xs text-custom-700 truncate max-w-[140px]">
                              {i.description}
                            </p>
                          )}
                        </td>
                        <td className="px-3 py-2.5 text-sm text-secondary-100">
                          {i.category}
                        </td>
                        <td className="px-3 py-2.5 text-sm text-secondary-100">
                          {i.unit}
                        </td>
                        <td className="px-3 py-2.5 text-sm font-bold text-secondary-100">
                          {i.currentStock}
                        </td>
                        <td className="px-3 py-2.5 text-sm font-semibold text-emerald-600">
                          {entriesById[i.id] ?? 0}
                        </td>
                        <td className="px-3 py-2.5 text-sm font-semibold text-red-600">
                          {sortiesById[i.id] ?? 0}
                        </td>
                        <td className="px-3 py-2.5 text-sm text-secondary-100">
                          {i.unitCost != null ? (
                            Number(i.unitCost).toLocaleString() + " RWF"
                          ) : (
                            <span className="text-custom-400">—</span>
                          )}
                        </td>
                        <td className="px-3 py-2.5 text-sm font-semibold text-primary-600">
                          {i.unitCost != null ? (
                            (
                              Number(i.unitCost) * i.currentStock
                            ).toLocaleString() + " RWF"
                          ) : (
                            <span className="text-custom-400">—</span>
                          )}
                        </td>
                        <td className="px-3 py-2.5">
                          <span
                            className={
                              "text-xs font-semibold px-2 py-0.5 rounded-full capitalize " +
                              (stockStatusBadge[
                                boutiqueNormStatus(i.stockStatus)
                              ] ?? "bg-gray-100 text-gray-600")
                            }
                          >
                            {boutiqueNormStatus(i.stockStatus).replace(
                              "-",
                              " ",
                            )}
                          </span>
                        </td>
                      </tr>
                    ))
                  )}
                </tbody>
              </table>
            </div>
          </Card>

          {items.length > 0 && (
            <div className="flex justify-end mt-1">
              <div className="border border-custom-300 rounded-xl overflow-hidden w-72">
                <div className="bg-custom-100 px-4 py-2 font-bold text-secondary-100 text-xs uppercase">
                  Summary
                </div>
                {[
                  {
                    label: "Total Items",
                    value: String(items.length),
                    cls: "text-secondary-100",
                  },
                  {
                    label: "Available",
                    value: String(available),
                    cls: "text-emerald-600",
                  },
                  {
                    label: "Low Stock",
                    value: String(low),
                    cls: "text-yellow-600",
                  },
                  {
                    label: "Out of Stock",
                    value: String(outOfStock),
                    cls: "text-red-500",
                  },
                  {
                    label: "In (period)",
                    value: String(
                      Object.values(entriesById).reduce((a, b) => a + b, 0),
                    ),
                    cls: "text-emerald-600",
                  },
                  {
                    label: "Out (period)",
                    value: String(
                      Object.values(sortiesById).reduce((a, b) => a + b, 0),
                    ),
                    cls: "text-red-600",
                  },
                  {
                    label: "Stock Value",
                    value: totalValue.toLocaleString() + " RWF",
                    cls: "text-primary-600",
                  },
                ].map(({ label, value, cls }) => (
                  <div
                    key={label}
                    className="flex justify-between px-4 py-2 border-t border-custom-200"
                  >
                    <span className="text-custom-700 text-xs">{label}</span>
                    <span className={"font-bold text-xs " + cls}>{value}</span>
                  </div>
                ))}
              </div>
            </div>
          )}
          <Paginator
            page={page}
            totalPages={itemsTotalPages}
            total={items.length}
            onPage={setPage}
          />
        </>
      )}

      {/* Sorties tab */}
      {tab === "sorties" && (
        <>
          <div className="flex flex-wrap items-center gap-2 justify-end">
            <select
              value={sortieStatusFilter}
              onChange={(e) => {
                setSortieStatusFilter(e.target.value);
                setPage(1);
              }}
              className="px-2 py-1.5 rounded-lg border border-custom-300 bg-style-500 text-secondary-100 text-xs focus:outline-none focus:border-primary-400 transition-colors"
            >
              <option value="">All statuses</option>
              <option value="pending">Pending</option>
              <option value="approved">Approved</option>
              <option value="rejected">Rejected</option>
            </select>
            <button
              onClick={() => refetch()}
              className="p-1.5 rounded-lg border border-custom-300 hover:bg-custom-100 transition-colors"
            >
              <HiOutlineRefresh
                className={
                  "w-4 h-4 text-custom-700 " + (isLoading ? "animate-spin" : "")
                }
              />
            </button>
            <PdfButtons
              title="Boutique Stock Requests Report"
              getExportData={getSortiesExport}
            />
          </div>

          <Card className="!p-0 overflow-hidden">
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead className="bg-custom-100 border-b border-custom-300">
                  <tr>
                    {[
                      "Item",
                      "Qty Out",
                      "Reason",
                      "Requested By",
                      "Approved By",
                      "Status",
                      "Date",
                    ].map((h) => (
                      <th
                        key={h}
                        className="px-3 py-2 text-left text-xs font-bold text-secondary-100 uppercase"
                      >
                        {h}
                      </th>
                    ))}
                  </tr>
                </thead>
                <tbody className="divide-y divide-custom-200">
                  {loadingSorties ? (
                    <tr>
                      <td
                        colSpan={7}
                        className="px-4 py-8 text-center text-custom-700 text-sm"
                      >
                        Loading...
                      </td>
                    </tr>
                  ) : sorties.length === 0 ? (
                    <tr>
                      <td
                        colSpan={7}
                        className="px-4 py-8 text-center text-custom-700 text-sm"
                      >
                        No boutique stock requests found
                      </td>
                    </tr>
                  ) : (
                    sortiesPaginated.map((s) => (
                      <tr
                        key={s.id}
                        className="hover:bg-custom-50 transition-colors"
                      >
                        <td className="px-3 py-2.5">
                          <p className="text-sm font-semibold text-secondary-100">
                            {s.stockItem?.itemName ?? "—"}
                          </p>
                          <p className="text-xs text-custom-700">
                            {s.stockItem?.unit}
                          </p>
                        </td>
                        <td className="px-3 py-2.5 text-sm font-bold text-red-600">
                          -{parseFloat(s.quantityOut)}
                        </td>
                        <td className="px-3 py-2.5 text-xs text-custom-700">
                          {s.reason ?? (
                            <span className="text-custom-400">—</span>
                          )}
                        </td>
                        <td className="px-3 py-2.5 text-sm text-secondary-100">
                          {s.requester?.name ?? (
                            <span className="text-custom-400">—</span>
                          )}
                        </td>
                        <td className="px-3 py-2.5 text-sm text-secondary-100">
                          {s.approvedBy?.name ?? (
                            <span className="text-custom-400">—</span>
                          )}
                        </td>
                        <td className="px-3 py-2.5">
                          <span
                            className={
                              "text-xs font-bold px-2 py-0.5 rounded-full " +
                              (sortieStatusColors[s.status] ??
                                "bg-gray-100 text-gray-600")
                            }
                          >
                            {s.status}
                          </span>
                        </td>
                        <td className="px-3 py-2.5 text-xs text-custom-700">
                          {new Date(s.createdAt).toLocaleDateString("en-RW", {
                            day: "2-digit",
                            month: "short",
                            year: "numeric",
                          })}
                        </td>
                      </tr>
                    ))
                  )}
                </tbody>
              </table>
            </div>
          </Card>

          {sorties.length > 0 && (
            <div className="flex justify-end mt-1">
              <div className="border border-custom-300 rounded-xl overflow-hidden w-72">
                <div className="bg-custom-100 px-4 py-2 font-bold text-secondary-100 text-xs uppercase">
                  Summary
                </div>
                {[
                  {
                    label: "Total Requests",
                    value: String(filteredSortiesByDate.length),
                    cls: "text-secondary-100",
                  },
                  {
                    label: "Pending",
                    value: String(pendingCount),
                    cls: "text-yellow-600",
                  },
                  {
                    label: "Approved",
                    value: String(approvedCount),
                    cls: "text-emerald-600",
                  },
                  {
                    label: "Rejected",
                    value: String(rejectedCount),
                    cls: "text-red-500",
                  },
                  {
                    label: "Total Units Out (approved)",
                    value: totalUnitsOut.toFixed(0),
                    cls: "text-red-600",
                  },
                ].map(({ label, value, cls }) => (
                  <div
                    key={label}
                    className="flex justify-between px-4 py-2 border-t border-custom-200"
                  >
                    <span className="text-custom-700 text-xs">{label}</span>
                    <span className={"font-bold text-xs " + cls}>{value}</span>
                  </div>
                ))}
              </div>
            </div>
          )}
          <Paginator
            page={page}
            totalPages={sortiesTotalPages}
            total={sorties.length}
            onPage={setPage}
          />
        </>
      )}
    </Section>
  );
}

// ─── General Stock Report ─────────────────────────────────────────────────────

function GeneralStockReport() {
  const [tab, setTab] = useState<"items" | "sorties">("items");
  const [page, setPage] = useState(1);
  const [statusFilter, setStatusFilter] = useState("");
  const [sortieStatusFilter, setSortieStatusFilter] = useState("");
  const [interval, setInterval] = useState<ReportInterval>("monthly");
  const [customFromDate, setCustomFromDate] = useState("");
  const [customToDate, setCustomToDate] = useState("");

  // Server-side date range filter for sorties based on interval
  const dateRange = useMemo(
    () => getDateRangeForInterval(interval, customFromDate, customToDate),
    [interval, customFromDate, customToDate],
  );
  const sortieParams = useMemo(
    () => ({
      limit: 500,
      from:
        interval === "annual" && customFromDate
          ? customFromDate
          : dateKey(dateRange.from),
      to:
        interval === "annual" && customToDate
          ? customToDate
          : dateKey(dateRange.to),
    }),
    [interval, customFromDate, customToDate, dateRange],
  );

  const {
    data: itemsData,
    isLoading: loadingItems,
    refetch: refetchItems,
  } = useGetGeneralStockItemsQuery({ limit: 500 });
  const { data: entriesData } = useGetGeneralStockEntriesQuery(sortieParams);
  const {
    data: sortiesData,
    isLoading: loadingSorties,
    refetch: refetchSorties,
  } = useGetGeneralStockSortiesQuery(sortieParams);

  const allItems = itemsData?.data ?? [];
  const allEntries = entriesData?.data ?? [];
  const allSorties = sortiesData?.data ?? [];

  // Period-level stock movement per item (received via entries, issued via sorties)
  const entriesById = useMemo(() => {
    const m: Record<string, number> = {};
    for (const e of allEntries) {
      const d = new Date(e.entryDate ?? e.createdAt);
      if (d >= dateRange.from && d <= dateRange.to) {
        const id = e.stockItemId;
        m[id] =
          (m[id] ?? 0) + parseFloat(String(e.quantityIn ?? e.quantity ?? 0));
      }
    }
    return m;
  }, [allEntries, dateRange]);

  const sortiesById = useMemo(() => {
    const m: Record<string, number> = {};
    for (const s of allSorties) {
      const d = new Date(s.sortieDate ?? s.createdAt);
      if (d >= dateRange.from && d <= dateRange.to) {
        const id = s.stockItemId;
        m[id] = (m[id] ?? 0) + parseFloat(s.quantityOut || "0");
      }
    }
    return m;
  }, [allSorties, dateRange]);

  const filteredSortiesByDate = useMemo(
    () =>
      allSorties.filter((s) => {
        const sortieDate = new Date(s.sortieDate ?? s.createdAt);
        return sortieDate >= dateRange.from && sortieDate <= dateRange.to;
      }),
    [allSorties, dateRange],
  );

  const activeItemIds = useMemo(() => {
    const ids = new Set<string>([
      ...Object.keys(entriesById),
      ...Object.keys(sortiesById),
    ]);
    for (const i of allItems) {
      const d = new Date(i.createdAt);
      if (d >= dateRange.from && d <= dateRange.to) ids.add(i.id);
    }
    return ids;
  }, [entriesById, sortiesById, allItems, dateRange]);

  const items = allItems.filter(
    (i) =>
      activeItemIds.has(i.id) &&
      (!statusFilter || i.stockStatus === statusFilter),
  );
  const sorties = filteredSortiesByDate.filter(
    (s) => !sortieStatusFilter || s.status === sortieStatusFilter,
  );

  const isLoading = tab === "items" ? loadingItems : loadingSorties;
  const refetch = tab === "items" ? refetchItems : refetchSorties;

  const available = items.filter((i) => i.stockStatus === "available").length;
  const low = items.filter((i) => i.stockStatus === "low").length;
  const outOfStock = items.filter(
    (i) => i.stockStatus === "out-of-stock",
  ).length;

  const pendingCount = filteredSortiesByDate.filter(
    (s) => s.status === "pending",
  ).length;
  const approvedCount = filteredSortiesByDate.filter(
    (s) => s.status === "approved",
  ).length;
  const rejectedCount = filteredSortiesByDate.filter(
    (s) => s.status === "rejected",
  ).length;
  const totalUnitsOut = filteredSortiesByDate
    .filter((s) => s.status === "approved")
    .reduce((acc, s) => acc + parseFloat(s.quantityOut), 0);

  const itemsTotalPages = Math.max(1, Math.ceil(items.length / PAGE_SIZE));
  const itemsPaginated = items.slice((page - 1) * PAGE_SIZE, page * PAGE_SIZE);
  const sortiesTotalPages = Math.max(1, Math.ceil(sorties.length / PAGE_SIZE));
  const sortiesPaginated = sorties.slice(
    (page - 1) * PAGE_SIZE,
    page * PAGE_SIZE,
  );

  const getItemsExport = () => ({
    headers: [
      "Item Name",
      "Category",
      "Unit",
      "Current Stock",
      "In (period)",
      "Out (period)",
      "Alarm Level",
      "Status",
    ],
    rows: items.map((i) => [
      i.itemName,
      i.category,
      i.unit,
      String(i.currentStock),
      String(entriesById[i.id] ?? 0),
      String(sortiesById[i.id] ?? 0),
      String(i.alarmStock),
      i.stockStatus.replace("-", " "),
    ]),
    summary: [
      { label: "Total Items: " + items.length, value: "" },
      { label: "Available", value: String(available) },
      { label: "Low Stock", value: String(low) },
      { label: "Out of Stock", value: String(outOfStock) },
      {
        label: "Period In",
        value: String(Object.values(entriesById).reduce((a, b) => a + b, 0)),
      },
      {
        label: "Period Out",
        value: String(Object.values(sortiesById).reduce((a, b) => a + b, 0)),
      },
      { label: "TOTAL OUT OF STOCK", value: String(outOfStock), bold: true },
    ] as SummaryRow[],
  });

  const getSortiesExport = () => ({
    headers: [
      "Item",
      "Qty Out",
      "Reason",
      "Requested By",
      "Approved By",
      "Status",
      "Date",
    ],
    rows: sorties.map((s) => [
      s.stockItem?.itemName ?? "—",
      parseFloat(s.quantityOut).toString(),
      s.reason ?? "—",
      s.requester?.name ?? "—",
      s.approvedBy?.name ?? "—",
      s.status,
      new Date(s.createdAt).toLocaleDateString("en-RW", {
        day: "2-digit",
        month: "short",
        year: "numeric",
      }),
    ]),
    summary: [
      { label: "Total Requests", value: String(filteredSortiesByDate.length) },
      { label: "Pending", value: String(pendingCount) },
      { label: "Approved", value: String(approvedCount) },
      { label: "Rejected", value: String(rejectedCount) },
      {
        label: "TOTAL UNITS OUT (approved)",
        value: totalUnitsOut.toFixed(0),
        bold: true,
      },
    ] as SummaryRow[],
  });

  return (
    <Section
      icon={HiOutlineArchive}
      title="General Stock"
      color="bg-orange-100 text-orange-600"
    >
      {/* Interval Filter */}
      <div className="flex items-center gap-2 flex-wrap">
        <HiOutlineCalendar className="w-5 h-5 text-custom-700" />
        {(["daily", "weekly", "monthly", "annual"] as ReportInterval[]).map(
          (int) => (
            <button
              key={int}
              onClick={() => setInterval(int)}
              className={`px-3 py-1.5 rounded-lg text-sm font-medium transition-colors ${
                interval === int
                  ? "bg-primary-100 text-primary-700 border border-primary-400"
                  : "bg-white text-custom-700 border border-custom-300 hover:bg-custom-50"
              }`}
            >
              {int.charAt(0).toUpperCase() + int.slice(1)}
            </button>
          ),
        )}

        {/* Custom Date Range (only when annual is selected) */}
        {interval === "annual" && (
          <>
            <input
              type="date"
              value={customFromDate}
              onChange={(e) => setCustomFromDate(e.target.value)}
              className="px-2 py-1.5 rounded-lg border border-custom-300 bg-style-500 text-secondary-100 text-xs focus:outline-none focus:border-primary-400"
            />
            <span className="text-xs text-custom-700">to</span>
            <input
              type="date"
              value={customToDate}
              min={customFromDate}
              onChange={(e) => setCustomToDate(e.target.value)}
              className="px-2 py-1.5 rounded-lg border border-custom-300 bg-style-500 text-secondary-100 text-xs focus:outline-none focus:border-primary-400"
            />
            {(customFromDate || customToDate) && (
              <button
                onClick={() => {
                  setCustomFromDate("");
                  setCustomToDate("");
                }}
                className="px-2.5 py-1.5 rounded-lg text-xs font-semibold text-red-600 bg-red-50 border border-red-200 hover:bg-red-100 transition-colors"
              >
                Clear
              </button>
            )}
          </>
        )}
        <span className="ml-auto text-[11px] font-semibold text-primary-700 bg-primary-50 border border-primary-200 rounded-lg px-2.5 py-1 whitespace-nowrap">
          {periodLabel(interval, customFromDate, customToDate, dateRange)}
        </span>
      </div>

      {/* Summary stats */}
      <div className="grid grid-cols-2 sm:grid-cols-5 gap-4">
        <StatCard label="Total Items" value={items.length} />
        <StatCard
          label="Available"
          value={available}
          color="text-emerald-600"
        />
        <StatCard label="Low Stock" value={low} color="text-yellow-600" />
        <StatCard
          label="Out of Stock"
          value={outOfStock}
          color="text-red-600"
        />
        <StatCard
          label="Pending Requests"
          value={pendingCount}
          color="text-orange-600"
          sub={"Approved: " + approvedCount}
        />
      </div>

      {/* Sub-tabs */}
      <div className="flex gap-1 p-1 bg-custom-100 rounded-xl w-fit">
        {(["items", "sorties"] as const).map((t) => (
          <button
            key={t}
            onClick={() => {
              setTab(t);
              setPage(1);
            }}
            className={
              "px-4 py-1.5 rounded-lg text-xs font-semibold transition-colors " +
              (tab === t
                ? "bg-primary-500 text-white shadow-sm"
                : "text-custom-700 hover:text-secondary-100")
            }
          >
            {t === "items" ? "Items" : "Stock Requests"}
            {t === "sorties" && pendingCount > 0 && (
              <span className="ml-1.5 inline-flex items-center justify-center w-4 h-4 bg-yellow-500 text-white text-[9px] font-bold rounded-full">
                {pendingCount > 9 ? "9+" : pendingCount}
              </span>
            )}
          </button>
        ))}
      </div>

      {/* Items tab */}
      {tab === "items" && (
        <>
          <div className="flex flex-wrap items-center gap-2 justify-end">
            <select
              value={statusFilter}
              onChange={(e) => {
                setStatusFilter(e.target.value);
                setPage(1);
              }}
              className="px-2 py-1.5 rounded-lg border border-custom-300 bg-style-500 text-secondary-100 text-xs focus:outline-none focus:border-primary-400 transition-colors"
            >
              <option value="">All statuses</option>
              <option value="available">Available</option>
              <option value="low">Low Stock</option>
              <option value="out-of-stock">Out of Stock</option>
            </select>
            <button
              onClick={() => refetch()}
              className="p-1.5 rounded-lg border border-custom-300 hover:bg-custom-100 transition-colors"
            >
              <HiOutlineRefresh
                className={
                  "w-4 h-4 text-custom-700 " + (isLoading ? "animate-spin" : "")
                }
              />
            </button>
            <PdfButtons
              title="General Stock Items Report"
              getExportData={getItemsExport}
            />
          </div>

          <Card className="!p-0 overflow-hidden">
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead className="bg-custom-100 border-b border-custom-300">
                  <tr>
                    {[
                      "Item Name",
                      "Category",
                      "Unit",
                      "Stock",
                      "In (period)",
                      "Out (period)",
                      "Alarm Level",
                      "Status",
                    ].map((h) => (
                      <th
                        key={h}
                        className="px-3 py-2 text-left text-xs font-bold text-secondary-100 uppercase"
                      >
                        {h}
                      </th>
                    ))}
                  </tr>
                </thead>
                <tbody className="divide-y divide-custom-200">
                  {loadingItems ? (
                    <tr>
                      <td
                        colSpan={8}
                        className="px-4 py-8 text-center text-custom-700 text-sm"
                      >
                        Loading...
                      </td>
                    </tr>
                  ) : items.length === 0 ? (
                    <tr>
                      <td
                        colSpan={8}
                        className="px-4 py-8 text-center text-custom-700 text-sm"
                      >
                        No items had movement in this period
                      </td>
                    </tr>
                  ) : (
                    itemsPaginated.map((i) => (
                      <tr
                        key={i.id}
                        className="hover:bg-custom-50 transition-colors"
                      >
                        <td className="px-3 py-2.5">
                          <p className="text-sm font-semibold text-secondary-100">
                            {i.itemName}
                          </p>
                          {i.description && (
                            <p className="text-xs text-custom-700 truncate max-w-[140px]">
                              {i.description}
                            </p>
                          )}
                        </td>
                        <td className="px-3 py-2.5 text-sm text-secondary-100">
                          {i.category}
                        </td>
                        <td className="px-3 py-2.5 text-sm text-secondary-100">
                          {i.unit}
                        </td>
                        <td className="px-3 py-2.5 text-sm font-bold text-secondary-100">
                          {i.currentStock}
                        </td>
                        <td className="px-3 py-2.5 text-sm font-semibold text-emerald-600">
                          {entriesById[i.id] ?? 0}
                        </td>
                        <td className="px-3 py-2.5 text-sm font-semibold text-red-600">
                          {sortiesById[i.id] ?? 0}
                        </td>
                        <td className="px-3 py-2.5 text-sm text-custom-700">
                          {i.alarmStock}
                        </td>
                        <td className="px-3 py-2.5">
                          <span
                            className={
                              "text-xs font-semibold px-2 py-0.5 rounded-full capitalize " +
                              (stockStatusBadge[i.stockStatus] ??
                                "bg-gray-100 text-gray-600")
                            }
                          >
                            {i.stockStatus.replace("-", " ")}
                          </span>
                        </td>
                      </tr>
                    ))
                  )}
                </tbody>
              </table>
            </div>
          </Card>

          {items.length > 0 && (
            <div className="flex justify-end mt-1">
              <div className="border border-custom-300 rounded-xl overflow-hidden w-72">
                <div className="bg-custom-100 px-4 py-2 font-bold text-secondary-100 text-xs uppercase">
                  Summary
                </div>
                {[
                  {
                    label: "Total Items",
                    value: String(items.length),
                    cls: "text-secondary-100",
                  },
                  {
                    label: "Available",
                    value: String(available),
                    cls: "text-emerald-600",
                  },
                  {
                    label: "Low Stock",
                    value: String(low),
                    cls: "text-yellow-600",
                  },
                  {
                    label: "Out of Stock",
                    value: String(outOfStock),
                    cls: "text-red-500",
                  },
                  {
                    label: "In (period)",
                    value: String(
                      Object.values(entriesById).reduce((a, b) => a + b, 0),
                    ),
                    cls: "text-emerald-600",
                  },
                  {
                    label: "Out (period)",
                    value: String(
                      Object.values(sortiesById).reduce((a, b) => a + b, 0),
                    ),
                    cls: "text-red-600",
                  },
                ].map(({ label, value, cls }) => (
                  <div
                    key={label}
                    className="flex justify-between px-4 py-2 border-t border-custom-200"
                  >
                    <span className="text-custom-700 text-xs">{label}</span>
                    <span className={"font-bold text-xs " + cls}>{value}</span>
                  </div>
                ))}
              </div>
            </div>
          )}
          <Paginator
            page={page}
            totalPages={itemsTotalPages}
            total={items.length}
            onPage={setPage}
          />
        </>
      )}

      {/* Sorties tab */}
      {tab === "sorties" && (
        <>
          <div className="flex flex-wrap items-center gap-2 justify-end">
            <select
              value={sortieStatusFilter}
              onChange={(e) => {
                setSortieStatusFilter(e.target.value);
                setPage(1);
              }}
              className="px-2 py-1.5 rounded-lg border border-custom-300 bg-style-500 text-secondary-100 text-xs focus:outline-none focus:border-primary-400 transition-colors"
            >
              <option value="">All statuses</option>
              <option value="pending">Pending</option>
              <option value="approved">Approved</option>
              <option value="rejected">Rejected</option>
            </select>
            <button
              onClick={() => refetch()}
              className="p-1.5 rounded-lg border border-custom-300 hover:bg-custom-100 transition-colors"
            >
              <HiOutlineRefresh
                className={
                  "w-4 h-4 text-custom-700 " + (isLoading ? "animate-spin" : "")
                }
              />
            </button>
            <PdfButtons
              title="General Stock Requests Report"
              getExportData={getSortiesExport}
            />
          </div>

          <Card className="!p-0 overflow-hidden">
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead className="bg-custom-100 border-b border-custom-300">
                  <tr>
                    {[
                      "Item",
                      "Qty Out",
                      "Reason",
                      "Requested By",
                      "Approved By",
                      "Status",
                      "Date",
                    ].map((h) => (
                      <th
                        key={h}
                        className="px-3 py-2 text-left text-xs font-bold text-secondary-100 uppercase"
                      >
                        {h}
                      </th>
                    ))}
                  </tr>
                </thead>
                <tbody className="divide-y divide-custom-200">
                  {loadingSorties ? (
                    <tr>
                      <td
                        colSpan={7}
                        className="px-4 py-8 text-center text-custom-700 text-sm"
                      >
                        Loading...
                      </td>
                    </tr>
                  ) : sorties.length === 0 ? (
                    <tr>
                      <td
                        colSpan={7}
                        className="px-4 py-8 text-center text-custom-700 text-sm"
                      >
                        No general stock requests found
                      </td>
                    </tr>
                  ) : (
                    sortiesPaginated.map((s) => (
                      <tr
                        key={s.id}
                        className="hover:bg-custom-50 transition-colors"
                      >
                        <td className="px-3 py-2.5">
                          <p className="text-sm font-semibold text-secondary-100">
                            {s.stockItem?.itemName ?? "—"}
                          </p>
                          <p className="text-xs text-custom-700">
                            {s.stockItem?.unit}
                          </p>
                        </td>
                        <td className="px-3 py-2.5 text-sm font-bold text-red-600">
                          -{parseFloat(s.quantityOut)}
                        </td>
                        <td className="px-3 py-2.5 text-xs text-custom-700">
                          {s.reason ?? (
                            <span className="text-custom-400">—</span>
                          )}
                        </td>
                        <td className="px-3 py-2.5 text-sm text-secondary-100">
                          {s.requester?.name ?? (
                            <span className="text-custom-400">—</span>
                          )}
                        </td>
                        <td className="px-3 py-2.5 text-sm text-secondary-100">
                          {s.approvedBy?.name ?? (
                            <span className="text-custom-400">—</span>
                          )}
                        </td>
                        <td className="px-3 py-2.5">
                          <span
                            className={
                              "text-xs font-bold px-2 py-0.5 rounded-full " +
                              (sortieStatusColors[s.status] ??
                                "bg-gray-100 text-gray-600")
                            }
                          >
                            {s.status}
                          </span>
                        </td>
                        <td className="px-3 py-2.5 text-xs text-custom-700">
                          {new Date(s.createdAt).toLocaleDateString("en-RW", {
                            day: "2-digit",
                            month: "short",
                            year: "numeric",
                          })}
                        </td>
                      </tr>
                    ))
                  )}
                </tbody>
              </table>
            </div>
          </Card>

          {sorties.length > 0 && (
            <div className="flex justify-end mt-1">
              <div className="border border-custom-300 rounded-xl overflow-hidden w-72">
                <div className="bg-custom-100 px-4 py-2 font-bold text-secondary-100 text-xs uppercase">
                  Summary
                </div>
                {[
                  {
                    label: "Total Requests",
                    value: String(filteredSortiesByDate.length),
                    cls: "text-secondary-100",
                  },
                  {
                    label: "Pending",
                    value: String(pendingCount),
                    cls: "text-yellow-600",
                  },
                  {
                    label: "Approved",
                    value: String(approvedCount),
                    cls: "text-emerald-600",
                  },
                  {
                    label: "Rejected",
                    value: String(rejectedCount),
                    cls: "text-red-500",
                  },
                  {
                    label: "Total Units Out (approved)",
                    value: totalUnitsOut.toFixed(0),
                    cls: "text-red-600",
                  },
                ].map(({ label, value, cls }) => (
                  <div
                    key={label}
                    className="flex justify-between px-4 py-2 border-t border-custom-200"
                  >
                    <span className="text-custom-700 text-xs">{label}</span>
                    <span className={"font-bold text-xs " + cls}>{value}</span>
                  </div>
                ))}
              </div>
            </div>
          )}
          <Paginator
            page={page}
            totalPages={sortiesTotalPages}
            total={sorties.length}
            onPage={setPage}
          />
        </>
      )}
    </Section>
  );
}

// ─── General Stock Summary Report ─────────────────────────────────────────────

function GeneralStockSummaryReport({
  interval,
  customFromDate,
  customToDate,
}: {
  interval: ReportInterval;
  customFromDate?: string;
  customToDate?: string;
}) {
  const queryParams =
    interval === "annual" && customFromDate && customToDate
      ? { interval, from: customFromDate, to: customToDate }
      : { interval };

  const {
    data: report,
    isLoading,
    refetch,
  } = useGetGeneralStockReportQuery(queryParams);

  if (isLoading) {
    return (
      <div className="flex items-center justify-center py-20">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary-500 mx-auto mb-4"></div>
          <p className="text-secondary-200">Loading report...</p>
        </div>
      </div>
    );
  }

  if (!report) {
    return (
      <Card className="p-8 text-center">
        <p className="text-secondary-300">No data available for this period</p>
      </Card>
    );
  }

  const {
    summary,
    stockStatus,
    topItems,
    recentEntries,
    recentSorties,
    period,
  } = report;

  return (
    <div className="space-y-6">
      {/* Period Info */}
      <Card className="!p-4 bg-primary-50 border border-primary-200">
        <div className="flex items-center justify-between">
          <div>
            <p className="text-sm font-semibold text-primary-700">
              Report Period
            </p>
            <p className="text-xs text-primary-600 mt-1">
              {new Date(period.startDate).toLocaleDateString("en-RW")} -{" "}
              {new Date(period.endDate).toLocaleDateString("en-RW")}
            </p>
          </div>
          <button
            onClick={() => refetch()}
            className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-primary-500 text-white text-xs font-semibold hover:bg-primary-600 transition-colors"
          >
            <HiOutlineRefresh className="w-4 h-4" /> Refresh
          </button>
        </div>
      </Card>

      {/* Summary Cards */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        <StatCard label="Total Items" value={summary.totalItems} />
        <StatCard
          label="Low Stock"
          value={summary.lowStockItems}
          color="text-yellow-600"
        />
        <StatCard
          label="Out of Stock"
          value={summary.outOfStockItems}
          color="text-red-600"
        />
        <StatCard
          label="Total Value"
          value={summary.totalStockValue.toLocaleString()}
          sub="RWF"
          color="text-green-600"
        />
      </div>

      {/* Entries & Sorties Summary */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <Card className="!p-5">
          <h3 className="text-base font-bold text-secondary-100 mb-4">
            Stock Entries
          </h3>
          <div className="space-y-3">
            <div className="flex justify-between items-center">
              <span className="text-sm text-custom-700">Count:</span>
              <span className="text-lg font-bold text-secondary-100">
                {summary.entries.count}
              </span>
            </div>
            <div className="flex justify-between items-center">
              <span className="text-sm text-custom-700">Total Quantity:</span>
              <span className="text-lg font-bold text-secondary-100">
                {summary.entries.totalQuantity}
              </span>
            </div>
            <div className="flex justify-between items-center">
              <span className="text-sm text-custom-700">Total Value:</span>
              <span className="text-lg font-bold text-green-600">
                {summary.entries.totalValue.toLocaleString()} RWF
              </span>
            </div>
          </div>
        </Card>

        <Card className="!p-5">
          <h3 className="text-base font-bold text-secondary-100 mb-4">
            Stock Requests
          </h3>
          <div className="space-y-3">
            <div className="flex justify-between items-center">
              <span className="text-sm text-custom-700">Total:</span>
              <span className="text-lg font-bold text-secondary-100">
                {summary.sorties.total}
              </span>
            </div>
            <div className="flex justify-between items-center">
              <span className="text-sm text-custom-700">Approved:</span>
              <span className="text-lg font-bold text-green-600">
                {summary.sorties.approved}
              </span>
            </div>
            <div className="flex justify-between items-center">
              <span className="text-sm text-custom-700">Pending:</span>
              <span className="text-lg font-bold text-yellow-600">
                {summary.sorties.pending}
              </span>
            </div>
            <div className="flex justify-between items-center">
              <span className="text-sm text-custom-700">Rejected:</span>
              <span className="text-lg font-bold text-red-600">
                {summary.sorties.rejected}
              </span>
            </div>
          </div>
        </Card>
      </div>

      {/* Stock Alerts */}
      {(stockStatus.lowStock.length > 0 ||
        stockStatus.outOfStock.length > 0) && (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {stockStatus.lowStock.length > 0 && (
            <Card className="!p-5 border-l-4 border-yellow-500">
              <h3 className="text-base font-bold text-yellow-700 mb-4">
                ⚠️ Low Stock Items
              </h3>
              <div className="space-y-2 max-h-60 overflow-y-auto">
                {stockStatus.lowStock.map((item) => (
                  <div
                    key={item.id}
                    className="flex justify-between items-center p-2 bg-yellow-50 rounded-lg"
                  >
                    <div>
                      <p className="text-sm font-medium text-secondary-100">
                        {item.itemName}
                      </p>
                      <p className="text-xs text-custom-700">{item.category}</p>
                    </div>
                    <div className="text-right">
                      <p className="text-sm font-bold text-yellow-700">
                        {item.currentStock} {item.unit}
                      </p>
                      <p className="text-xs text-custom-700">
                        Alarm: {item.alarmStock}
                      </p>
                    </div>
                  </div>
                ))}
              </div>
            </Card>
          )}

          {stockStatus.outOfStock.length > 0 && (
            <Card className="!p-5 border-l-4 border-red-500">
              <h3 className="text-base font-bold text-red-700 mb-4">
                🚫 Out of Stock
              </h3>
              <div className="space-y-2 max-h-60 overflow-y-auto">
                {stockStatus.outOfStock.map((item) => (
                  <div
                    key={item.id}
                    className="flex justify-between items-center p-2 bg-red-50 rounded-lg"
                  >
                    <div>
                      <p className="text-sm font-medium text-secondary-100">
                        {item.itemName}
                      </p>
                      <p className="text-xs text-custom-700">{item.category}</p>
                    </div>
                    <span className="px-2 py-1 rounded text-xs font-semibold bg-red-100 text-red-700">
                      0 {item.unit}
                    </span>
                  </div>
                ))}
              </div>
            </Card>
          )}
        </div>
      )}

      {/* Top Items */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {topItems.mostRequested.length > 0 && (
          <Card className="!p-5">
            <h3 className="text-base font-bold text-secondary-100 mb-4">
              📊 Most Requested Items
            </h3>
            <div className="space-y-2">
              {topItems.mostRequested.map((item, idx) => (
                <div
                  key={idx}
                  className="flex justify-between items-center p-2 bg-custom-50 rounded-lg"
                >
                  <span className="text-sm font-medium text-secondary-100">
                    {item.itemName}
                  </span>
                  <div className="text-right">
                    <p className="text-sm font-bold text-primary-600">
                      {item.totalQuantity} {item.unit}
                    </p>
                    <p className="text-xs text-custom-700">
                      {item.count} requests
                    </p>
                  </div>
                </div>
              ))}
            </div>
          </Card>
        )}

        {topItems.mostReceived.length > 0 && (
          <Card className="!p-5">
            <h3 className="text-base font-bold text-secondary-100 mb-4">
              📦 Most Received Items
            </h3>
            <div className="space-y-2">
              {topItems.mostReceived.map((item, idx) => (
                <div
                  key={idx}
                  className="flex justify-between items-center p-2 bg-custom-50 rounded-lg"
                >
                  <span className="text-sm font-medium text-secondary-100">
                    {item.itemName}
                  </span>
                  <div className="text-right">
                    <p className="text-sm font-bold text-green-600">
                      {item.totalQuantity} {item.unit}
                    </p>
                    <p className="text-xs text-custom-700">
                      {item.totalValue.toLocaleString()} RWF
                    </p>
                  </div>
                </div>
              ))}
            </div>
          </Card>
        )}
      </div>

      {/* Recent Entries */}
      {recentEntries.length > 0 && (
        <Card className="!p-5">
          <h3 className="text-base font-bold text-secondary-100 mb-4">
            Recent Stock Entries
          </h3>
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead>
                <tr className="border-b border-custom-200">
                  <th className="text-left py-2 px-2 text-custom-700 font-semibold">
                    Item
                  </th>
                  <th className="text-right py-2 px-2 text-custom-700 font-semibold">
                    Quantity
                  </th>
                  <th className="text-right py-2 px-2 text-custom-700 font-semibold">
                    Unit Cost
                  </th>
                  <th className="text-right py-2 px-2 text-custom-700 font-semibold">
                    Total Cost
                  </th>
                  <th className="text-left py-2 px-2 text-custom-700 font-semibold">
                    Received By
                  </th>
                  <th className="text-left py-2 px-2 text-custom-700 font-semibold">
                    Date
                  </th>
                </tr>
              </thead>
              <tbody>
                {recentEntries.map((entry) => (
                  <tr
                    key={entry.id}
                    className="border-b border-custom-100 hover:bg-custom-50"
                  >
                    <td className="py-2 px-2 text-secondary-100">
                      {entry.itemName}
                    </td>
                    <td className="py-2 px-2 text-right text-secondary-100">
                      {entry.quantity}
                    </td>
                    <td className="py-2 px-2 text-right text-secondary-100">
                      {entry.unitCost?.toLocaleString() || "0"}
                    </td>
                    <td className="py-2 px-2 text-right font-semibold text-green-600">
                      {entry.totalCost?.toLocaleString() || "0"}
                    </td>
                    <td className="py-2 px-2 text-secondary-100">
                      {entry.receivedBy}
                    </td>
                    <td className="py-2 px-2 text-custom-700 text-xs">
                      {new Date(entry.receivedAt).toLocaleDateString("en-RW")}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </Card>
      )}

      {/* Recent Sorties */}
      {recentSorties.length > 0 && (
        <Card className="!p-5">
          <h3 className="text-base font-bold text-secondary-100 mb-4">
            Recent Stock Requests
          </h3>
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead>
                <tr className="border-b border-custom-200">
                  <th className="text-left py-2 px-2 text-custom-700 font-semibold">
                    Item
                  </th>
                  <th className="text-right py-2 px-2 text-custom-700 font-semibold">
                    Quantity
                  </th>
                  <th className="text-left py-2 px-2 text-custom-700 font-semibold">
                    Requester
                  </th>
                  <th className="text-left py-2 px-2 text-custom-700 font-semibold">
                    Status
                  </th>
                  <th className="text-left py-2 px-2 text-custom-700 font-semibold">
                    Date
                  </th>
                </tr>
              </thead>
              <tbody>
                {recentSorties.map((sortie) => (
                  <tr
                    key={sortie.id}
                    className="border-b border-custom-100 hover:bg-custom-50"
                  >
                    <td className="py-2 px-2 text-secondary-100">
                      {sortie.itemName}
                    </td>
                    <td className="py-2 px-2 text-right text-secondary-100">
                      {sortie.quantityRequested}
                    </td>
                    <td className="py-2 px-2 text-secondary-100">
                      {sortie.requester}
                      <span className="text-xs text-custom-700 ml-1">
                        ({sortie.requesterRole})
                      </span>
                    </td>
                    <td className="py-2 px-2">
                      <span
                        className={`px-2 py-0.5 rounded text-xs font-semibold ${sortieStatusColors[sortie.status] || "bg-gray-100 text-gray-700"}`}
                      >
                        {sortie.status}
                      </span>
                    </td>
                    <td className="py-2 px-2 text-custom-700 text-xs">
                      {new Date(sortie.requestedAt).toLocaleDateString("en-RW")}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </Card>
      )}
    </div>
  );
}

// ─── Boutique Stock Summary Report ────────────────────────────────────────────

function BoutiqueStockSummaryReport({
  interval,
  customFromDate,
  customToDate,
}: {
  interval: ReportInterval;
  customFromDate?: string;
  customToDate?: string;
}) {
  const queryParams =
    interval === "annual" && customFromDate && customToDate
      ? { interval, from: customFromDate, to: customToDate }
      : { interval };

  const {
    data: report,
    isLoading,
    refetch,
  } = useGetBoutiqueStockReportQuery(queryParams);

  if (isLoading) {
    return (
      <div className="flex items-center justify-center py-20">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary-500 mx-auto mb-4"></div>
          <p className="text-secondary-200">Loading report...</p>
        </div>
      </div>
    );
  }

  if (!report) {
    return (
      <Card className="p-8 text-center">
        <p className="text-secondary-300">No data available for this period</p>
      </Card>
    );
  }

  const {
    summary,
    stockStatus,
    topItems,
    recentEntries,
    recentSorties,
    period,
  } = report;

  return (
    <div className="space-y-6">
      {/* Period Info */}
      <Card className="!p-4 bg-primary-50 border border-primary-200">
        <div className="flex items-center justify-between">
          <div>
            <p className="text-sm font-semibold text-primary-700">
              Report Period
            </p>
            <p className="text-xs text-primary-600 mt-1">
              {new Date(period.startDate).toLocaleDateString("en-RW")} -{" "}
              {new Date(period.endDate).toLocaleDateString("en-RW")}
            </p>
          </div>
          <button
            onClick={() => refetch()}
            className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-primary-500 text-white text-xs font-semibold hover:bg-primary-600 transition-colors"
          >
            <HiOutlineRefresh className="w-4 h-4" /> Refresh
          </button>
        </div>
      </Card>

      {/* Summary Cards */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        <StatCard label="Total Items" value={summary.totalItems} />
        <StatCard
          label="Low Stock"
          value={summary.lowStockItems}
          color="text-yellow-600"
        />
        <StatCard
          label="Out of Stock"
          value={summary.outOfStockItems}
          color="text-red-600"
        />
        <StatCard
          label="Total Value"
          value={summary.totalStockValue.toLocaleString()}
          sub="RWF"
          color="text-green-600"
        />
      </div>

      {/* Entries & Sorties Summary */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <Card className="!p-5">
          <h3 className="text-base font-bold text-secondary-100 mb-4">
            Stock Entries
          </h3>
          <div className="space-y-3">
            <div className="flex justify-between items-center">
              <span className="text-sm text-custom-700">Count:</span>
              <span className="text-lg font-bold text-secondary-100">
                {summary.entries.count}
              </span>
            </div>
            <div className="flex justify-between items-center">
              <span className="text-sm text-custom-700">Total Quantity:</span>
              <span className="text-lg font-bold text-secondary-100">
                {summary.entries.totalQuantity}
              </span>
            </div>
            <div className="flex justify-between items-center">
              <span className="text-sm text-custom-700">Total Value:</span>
              <span className="text-lg font-bold text-green-600">
                {summary.entries.totalValue.toLocaleString()} RWF
              </span>
            </div>
          </div>
        </Card>

        <Card className="!p-5">
          <h3 className="text-base font-bold text-secondary-100 mb-4">
            Stock Requests
          </h3>
          <div className="space-y-3">
            <div className="flex justify-between items-center">
              <span className="text-sm text-custom-700">Total:</span>
              <span className="text-lg font-bold text-secondary-100">
                {summary.sorties.total}
              </span>
            </div>
            <div className="flex justify-between items-center">
              <span className="text-sm text-custom-700">Approved:</span>
              <span className="text-lg font-bold text-green-600">
                {summary.sorties.approved}
              </span>
            </div>
            <div className="flex justify-between items-center">
              <span className="text-sm text-custom-700">Pending:</span>
              <span className="text-lg font-bold text-yellow-600">
                {summary.sorties.pending}
              </span>
            </div>
            <div className="flex justify-between items-center">
              <span className="text-sm text-custom-700">Rejected:</span>
              <span className="text-lg font-bold text-red-600">
                {summary.sorties.rejected}
              </span>
            </div>
          </div>
        </Card>
      </div>

      {/* Stock Alerts */}
      {(stockStatus.lowStock.length > 0 ||
        stockStatus.outOfStock.length > 0) && (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {stockStatus.lowStock.length > 0 && (
            <Card className="!p-5 border-l-4 border-yellow-500">
              <h3 className="text-base font-bold text-yellow-700 mb-4">
                ⚠️ Low Stock Items
              </h3>
              <div className="space-y-2 max-h-60 overflow-y-auto">
                {stockStatus.lowStock.map((item) => (
                  <div
                    key={item.id}
                    className="flex justify-between items-center p-2 bg-yellow-50 rounded-lg"
                  >
                    <div>
                      <p className="text-sm font-medium text-secondary-100">
                        {item.itemName}
                      </p>
                      <p className="text-xs text-custom-700">{item.category}</p>
                    </div>
                    <div className="text-right">
                      <p className="text-sm font-bold text-yellow-700">
                        {item.currentStock} {item.unit}
                      </p>
                      <p className="text-xs text-custom-700">
                        Alarm: {item.alarmStock}
                      </p>
                    </div>
                  </div>
                ))}
              </div>
            </Card>
          )}

          {stockStatus.outOfStock.length > 0 && (
            <Card className="!p-5 border-l-4 border-red-500">
              <h3 className="text-base font-bold text-red-700 mb-4">
                🚫 Out of Stock
              </h3>
              <div className="space-y-2 max-h-60 overflow-y-auto">
                {stockStatus.outOfStock.map((item) => (
                  <div
                    key={item.id}
                    className="flex justify-between items-center p-2 bg-red-50 rounded-lg"
                  >
                    <div>
                      <p className="text-sm font-medium text-secondary-100">
                        {item.itemName}
                      </p>
                      <p className="text-xs text-custom-700">{item.category}</p>
                    </div>
                    <span className="px-2 py-1 rounded text-xs font-semibold bg-red-100 text-red-700">
                      0 {item.unit}
                    </span>
                  </div>
                ))}
              </div>
            </Card>
          )}
        </div>
      )}

      {/* Top Items */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {topItems.mostRequested.length > 0 && (
          <Card className="!p-5">
            <h3 className="text-base font-bold text-secondary-100 mb-4">
              📊 Most Requested Items
            </h3>
            <div className="space-y-2">
              {topItems.mostRequested.map((item, idx) => (
                <div
                  key={idx}
                  className="flex justify-between items-center p-2 bg-custom-50 rounded-lg"
                >
                  <span className="text-sm font-medium text-secondary-100">
                    {item.itemName}
                  </span>
                  <div className="text-right">
                    <p className="text-sm font-bold text-primary-600">
                      {item.totalQuantity} {item.unit}
                    </p>
                    <p className="text-xs text-custom-700">
                      {item.count} requests
                    </p>
                  </div>
                </div>
              ))}
            </div>
          </Card>
        )}

        {topItems.mostReceived.length > 0 && (
          <Card className="!p-5">
            <h3 className="text-base font-bold text-secondary-100 mb-4">
              📦 Most Received Items
            </h3>
            <div className="space-y-2">
              {topItems.mostReceived.map((item, idx) => (
                <div
                  key={idx}
                  className="flex justify-between items-center p-2 bg-custom-50 rounded-lg"
                >
                  <span className="text-sm font-medium text-secondary-100">
                    {item.itemName}
                  </span>
                  <div className="text-right">
                    <p className="text-sm font-bold text-green-600">
                      {item.totalQuantity} {item.unit}
                    </p>
                    <p className="text-xs text-custom-700">
                      {item.totalValue.toLocaleString()} RWF
                    </p>
                  </div>
                </div>
              ))}
            </div>
          </Card>
        )}
      </div>

      {/* Recent Entries */}
      {recentEntries.length > 0 && (
        <Card className="!p-5">
          <h3 className="text-base font-bold text-secondary-100 mb-4">
            Recent Stock Entries
          </h3>
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead>
                <tr className="border-b border-custom-200">
                  <th className="text-left py-2 px-2 text-custom-700 font-semibold">
                    Item
                  </th>
                  <th className="text-right py-2 px-2 text-custom-700 font-semibold">
                    Quantity
                  </th>
                  <th className="text-right py-2 px-2 text-custom-700 font-semibold">
                    Unit Cost
                  </th>
                  <th className="text-right py-2 px-2 text-custom-700 font-semibold">
                    Total Cost
                  </th>
                  <th className="text-left py-2 px-2 text-custom-700 font-semibold">
                    Received By
                  </th>
                  <th className="text-left py-2 px-2 text-custom-700 font-semibold">
                    Date
                  </th>
                </tr>
              </thead>
              <tbody>
                {recentEntries.map((entry) => (
                  <tr
                    key={entry.id}
                    className="border-b border-custom-100 hover:bg-custom-50"
                  >
                    <td className="py-2 px-2 text-secondary-100">
                      {entry.itemName}
                    </td>
                    <td className="py-2 px-2 text-right text-secondary-100">
                      {entry.quantity}
                    </td>
                    <td className="py-2 px-2 text-right text-secondary-100">
                      {entry.unitCost?.toLocaleString() || "0"}
                    </td>
                    <td className="py-2 px-2 text-right font-semibold text-green-600">
                      {entry.totalCost?.toLocaleString() || "0"}
                    </td>
                    <td className="py-2 px-2 text-secondary-100">
                      {entry.receivedBy}
                    </td>
                    <td className="py-2 px-2 text-custom-700 text-xs">
                      {new Date(entry.receivedAt).toLocaleDateString("en-RW")}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </Card>
      )}

      {/* Recent Sorties */}
      {recentSorties.length > 0 && (
        <Card className="!p-5">
          <h3 className="text-base font-bold text-secondary-100 mb-4">
            Recent Stock Requests
          </h3>
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead>
                <tr className="border-b border-custom-200">
                  <th className="text-left py-2 px-2 text-custom-700 font-semibold">
                    Item
                  </th>
                  <th className="text-right py-2 px-2 text-custom-700 font-semibold">
                    Quantity
                  </th>
                  <th className="text-left py-2 px-2 text-custom-700 font-semibold">
                    Requester
                  </th>
                  <th className="text-left py-2 px-2 text-custom-700 font-semibold">
                    Status
                  </th>
                  <th className="text-left py-2 px-2 text-custom-700 font-semibold">
                    Date
                  </th>
                </tr>
              </thead>
              <tbody>
                {recentSorties.map((sortie) => (
                  <tr
                    key={sortie.id}
                    className="border-b border-custom-100 hover:bg-custom-50"
                  >
                    <td className="py-2 px-2 text-secondary-100">
                      {sortie.itemName}
                    </td>
                    <td className="py-2 px-2 text-right text-secondary-100">
                      {sortie.quantityRequested}
                    </td>
                    <td className="py-2 px-2 text-secondary-100">
                      {sortie.requester}
                      <span className="text-xs text-custom-700 ml-1">
                        ({sortie.requesterRole})
                      </span>
                    </td>
                    <td className="py-2 px-2">
                      <span
                        className={`px-2 py-0.5 rounded text-xs font-semibold ${sortieStatusColors[sortie.status] || "bg-gray-100 text-gray-700"}`}
                      >
                        {sortie.status}
                      </span>
                    </td>
                    <td className="py-2 px-2 text-custom-700 text-xs">
                      {new Date(sortie.requestedAt).toLocaleDateString("en-RW")}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </Card>
      )}
    </div>
  );
}

// ─── Main Page ────────────────────────────────────────────────────────────────

type Tab = "boutique" | "general";

const TABS: { value: Tab; label: string; icon: React.ElementType }[] = [
  { value: "boutique", label: "Boutique Stock", icon: HiOutlineShoppingBag },
  { value: "general", label: "General Stock", icon: HiOutlineArchive },
];

export default function StockReportsPage() {
  const { userRole, userName } = useAuth();
  const { data: unreadCount = 0 } = useGetUnreadCountQuery();
  const [activeTab, setActiveTab] = useState<Tab>("boutique");
  const [viewMode, setViewMode] = useState<"detailed" | "summary">("detailed");
  const [interval, setInterval] = useState<ReportInterval>("monthly");
  const [customFromDate, setCustomFromDate] = useState("");
  const [customToDate, setCustomToDate] = useState("");

  return (
    <DashboardLayout
      userRole={userRole ?? "stock"}
      userName={userName ?? "Stock Manager"}
      notificationCount={unreadCount}
    >
      <div className="space-y-6 font-[family-name:var(--font-family-primary)]">
        {/* Header */}
        <div>
          <div className="flex items-center gap-2 mb-1">
            <HiOutlineChartBar className="w-6 h-6 text-primary-500" />
            <h1 className="text-2xl md:text-3xl font-bold text-secondary-100">
              Stock Reports
            </h1>
          </div>
          <p className="text-sm text-custom-700">
            Boutique and general stock reports with interval-based analytics
          </p>
        </div>

        {/* View Mode Toggle */}
        <div className="flex items-center gap-3 flex-wrap">
          <div className="flex gap-2">
            <button
              onClick={() => setViewMode("detailed")}
              className={`px-4 py-2 rounded-lg text-sm font-semibold transition-colors ${
                viewMode === "detailed"
                  ? "bg-primary-500 text-white"
                  : "bg-custom-100 text-custom-700 hover:bg-custom-200"
              }`}
            >
              Detailed View
            </button>
            {/* <button
              onClick={() => setViewMode("summary")}
              className={`px-4 py-2 rounded-lg text-sm font-semibold transition-colors ${
                viewMode === "summary"
                  ? "bg-primary-500 text-white"
                  : "bg-custom-100 text-custom-700 hover:bg-custom-200"
              }`}
            >
              Summary Report
            </button> */}
          </div>

          {/* Interval Selector (only for summary mode) */}
          {viewMode === "summary" && (
            <div className="flex items-center gap-2">
              <HiOutlineCalendar className="w-5 h-5 text-custom-700" />
              {(
                ["daily", "weekly", "monthly", "annual"] as ReportInterval[]
              ).map((int) => (
                <button
                  key={int}
                  onClick={() => setInterval(int)}
                  className={`px-3 py-1.5 rounded-lg text-sm font-medium transition-colors ${
                    interval === int
                      ? "bg-primary-100 text-primary-700 border border-primary-400"
                      : "bg-white text-custom-700 border border-custom-300 hover:bg-custom-50"
                  }`}
                >
                  {int.charAt(0).toUpperCase() + int.slice(1)}
                </button>
              ))}
            </div>
          )}

          {/* Custom Date Range (only when annual is selected in summary mode) */}
          {viewMode === "summary" && interval === "annual" && (
            <div className="flex items-center gap-2">
              <input
                type="date"
                value={customFromDate}
                onChange={(e) => setCustomFromDate(e.target.value)}
                className="px-2 py-1.5 rounded-lg border border-custom-300 bg-style-500 text-secondary-100 text-xs focus:outline-none focus:border-primary-400"
              />
              <span className="text-xs text-custom-700">to</span>
              <input
                type="date"
                value={customToDate}
                min={customFromDate}
                onChange={(e) => setCustomToDate(e.target.value)}
                className="px-2 py-1.5 rounded-lg border border-custom-300 bg-style-500 text-secondary-100 text-xs focus:outline-none focus:border-primary-400"
              />
              {(customFromDate || customToDate) && (
                <button
                  onClick={() => {
                    setCustomFromDate("");
                    setCustomToDate("");
                  }}
                  className="px-2.5 py-1.5 rounded-lg text-xs font-semibold text-red-600 bg-red-50 border border-red-200 hover:bg-red-100 transition-colors"
                >
                  Clear
                </button>
              )}
            </div>
          )}
        </div>

        {/* Tab bar */}
        <div className="flex gap-2 flex-wrap border-b border-custom-200 pb-1">
          {TABS.map((t) => (
            <button
              key={t.value}
              onClick={() => setActiveTab(t.value)}
              className={
                "flex items-center gap-2 px-4 py-2 rounded-t-xl text-sm font-semibold transition-colors border-b-2 " +
                (activeTab === t.value
                  ? "border-primary-500 text-primary-500 bg-primary-50"
                  : "border-transparent text-custom-700 hover:text-secondary-100 hover:bg-custom-50")
              }
            >
              <t.icon className="w-4 h-4" />
              {t.label}
            </button>
          ))}
        </div>

        {/* Content */}
        {viewMode === "detailed" ? (
          <>
            {activeTab === "boutique" && <BoutiqueStockReport />}
            {activeTab === "general" && <GeneralStockReport />}
          </>
        ) : (
          <>
            {activeTab === "boutique" && (
              <BoutiqueStockSummaryReport
                interval={interval}
                customFromDate={customFromDate}
                customToDate={customToDate}
              />
            )}
            {activeTab === "general" && (
              <GeneralStockSummaryReport
                interval={interval}
                customFromDate={customFromDate}
                customToDate={customToDate}
              />
            )}
          </>
        )}
      </div>
    </DashboardLayout>
  );
}
