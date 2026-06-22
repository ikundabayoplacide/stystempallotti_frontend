import { useState } from "react";
import {
  HiOutlineCheckCircle,
  HiOutlineClock,
  HiOutlineCurrencyDollar,
  HiOutlineDocumentText,
  HiOutlineExclamationCircle,
  // HiOutlineRefresh,
  HiOutlineSearch,
  HiOutlineX,
} from "react-icons/hi";
import { Button, Card, Input } from "../../components/ui";
import { useGetInvoicesQuery, useCreateInvoiceMutation } from "../../store/services/invoicesService";
import { useGetPaymentsQuery, useRecordPaymentMutation } from "../../store/services/paymentsService";
import { useGetJobsQuery } from "../../store/services/jobsService";
import type { Invoice } from "../../store/services/invoicesService";

const statusColor: Record<string, string> = {
  paid: "bg-green-100 text-green-700",
  cancelled: "bg-custom-100 text-custom-800",
};

function getStatusLabel(inv: Invoice) {
  if (inv.status === "paid") return "Paid";
  if (inv.dueDate && new Date(inv.dueDate) < new Date()) return "Overdue";
  return "Pending";
}

function getStatusStyle(inv: Invoice) {
  if (inv.status === "paid") return statusColor.paid;
  if (inv.dueDate && new Date(inv.dueDate) < new Date()) return "bg-red-100 text-red-700";
  return "bg-yellow-100 text-yellow-700";
}

export default function FinanceDashboard() {
  const [search, setSearch] = useState("");
  const [invPage, setInvPage] = useState(1);
  const [payPage, setPayPage] = useState(1);
  const [showPaymentModal, setShowPaymentModal] = useState(false);
  const [showInvoiceModal, setShowInvoiceModal] = useState(false);
  const [selectedInvoiceId, setSelectedInvoiceId] = useState("");

  const INV_PAGE_SIZE = 10;
  const PAY_PAGE_SIZE = 5;

  const { data: invoicesData, isLoading: loadingInvoices, refetch: refetchInvoices } = useGetInvoicesQuery({ limit: 200 });
  const { data: paymentsData, isLoading: loadingPayments, refetch: refetchPayments } = useGetPaymentsQuery({ limit: 10 });
  const { data: jobsData } = useGetJobsQuery({ limit: 200 });

  const [createInvoice, { isLoading: creatingInvoice }] = useCreateInvoiceMutation();
  const [recordPayment, { isLoading: recordingPayment }] = useRecordPaymentMutation();

  const invoices = invoicesData?.invoices ?? [];
  const payments = paymentsData?.payments ?? [];
  const jobs = jobsData?.jobs ?? [];

  const totalPaid = invoices.filter(i => i.status === "paid").reduce((s, i) => s + Number(i.totalAmount), 0);
  const totalRevenue = invoices.reduce((s, i) => s + Number(i.totalAmount), 0);
  const outstanding = invoices.filter(i => i.status !== "paid" && i.dueDate && new Date(i.dueDate) >= new Date()).reduce((s, i) => s + Number(i.totalAmount), 0);
  const overdue = invoices.filter(i => i.status !== "paid" && i.dueDate && new Date(i.dueDate) < new Date()).reduce((s, i) => s + Number(i.totalAmount), 0);

  const kpis = [
    { label: "Total Revenue", value: totalRevenue.toLocaleString(), icon: HiOutlineCurrencyDollar, color: "text-green-600", bg: "bg-green-100" },
    { label: "Payments Received", value: totalPaid.toLocaleString(), icon: HiOutlineCheckCircle, color: "text-primary-500", bg: "bg-primary-100" },
    { label: "Outstanding", value: outstanding.toLocaleString(), icon: HiOutlineClock, color: "text-yellow-600", bg: "bg-yellow-100" },
    { label: "Overdue", value: overdue.toLocaleString(), icon: HiOutlineExclamationCircle, color: "text-red-500", bg: "bg-red-100" },
  ];

  const filtered = invoices.filter(inv =>
    inv.invoiceNo.toLowerCase().includes(search.toLowerCase()) ||
    (inv.job?.customer?.name ?? inv.customer?.name ?? "").toLowerCase().includes(search.toLowerCase()) ||
    (inv.job?.jobNumber ?? "").toLowerCase().includes(search.toLowerCase())
  );
  const invTotalPages = Math.max(1, Math.ceil(filtered.length / INV_PAGE_SIZE));
  const paginatedInvoices = filtered.slice((invPage - 1) * INV_PAGE_SIZE, invPage * INV_PAGE_SIZE);

  const payTotalPages = Math.max(1, Math.ceil(payments.length / PAY_PAGE_SIZE));
  const paginatedPayments = payments.slice((payPage - 1) * PAY_PAGE_SIZE, payPage * PAY_PAGE_SIZE);

  // ── Payment Modal ──────────────────────────────────────────────────────────
  const [paymentForm, setPaymentForm] = useState({
    jobId: "", receivedById: "", amountPaid: "", paymentMethod: "CASH" as const, paymentState: "FULL" as const, paymentNote: "",
  });

  const openPaymentModal = (invoiceId = "") => {
    setSelectedInvoiceId(invoiceId);
    void selectedInvoiceId;
    if (invoiceId) {
      const inv = invoices.find(i => i.id === invoiceId);
      if (inv) setPaymentForm(p => ({ ...p, jobId: inv.jobId, amountPaid: String(inv.totalAmount) }));
    }
    setShowPaymentModal(true);
  };

  const handlePaymentSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      await recordPayment({
        jobId: paymentForm.jobId,
        receivedById: paymentForm.receivedById,
        amountPaid: Number(paymentForm.amountPaid),
        paymentMethod: paymentForm.paymentMethod,
        paymentState: paymentForm.paymentState,
        paymentNote: paymentForm.paymentNote || undefined,
      }).unwrap();
      setShowPaymentModal(false);
      setPaymentForm({ jobId: "", receivedById: "", amountPaid: "", paymentMethod: "CASH", paymentState: "FULL", paymentNote: "" });
      refetchInvoices();
      refetchPayments();
    } catch { /* errors handled by RTK */ }
  };

  // ── Invoice Modal ──────────────────────────────────────────────────────────
  const [invoiceForm, setInvoiceForm] = useState({
    jobId: "", customerId: "", itemName: "", quantity: "1", unitPrice: "", taxRate: "18", dueDate: "", notes: "",
  });

  const handleInvoiceSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      await createInvoice({
        jobId: invoiceForm.jobId,
        customerId: invoiceForm.customerId,
        lineItems: [{ name: invoiceForm.itemName, quantity: Number(invoiceForm.quantity), unitPrice: Number(invoiceForm.unitPrice) }],
        taxRate: Number(invoiceForm.taxRate),
        dueDate: invoiceForm.dueDate || undefined,
        notes: invoiceForm.notes || undefined,
      }).unwrap();
      setShowInvoiceModal(false);
      setInvoiceForm({ jobId: "", customerId: "", itemName: "", quantity: "1", unitPrice: "", taxRate: "18", dueDate: "", notes: "" });
      refetchInvoices();
    } catch { /* errors handled by RTK */ }
  };

  const selectedJob = jobs.find(j => j.id === invoiceForm.jobId);

  return (
    <div className="space-y-8 font-[family-name:var(--font-family-primary)]">
      {/* Header */}
      <div className="flex flex-col xs:flex-row xs:items-center justify-between gap-3">
        <div>
          <h1 className="text-2xl md:text-3xl font-bold text-secondary-100">Finance Dashboard</h1>
          <p className="text-sm text-custom-700 mt-1">Manage invoices, payments, and financial tracking</p>
        </div>
        {/* <div className="flex gap-2">
          <button onClick={() => openPaymentModal()} className="px-4 py-2 rounded-xl bg-green-600 text-white font-semibold hover:bg-green-700 transition-colors text-sm">
            Record Payment
          </button>
          <button onClick={() => setShowInvoiceModal(true)} className="px-4 py-2 rounded-xl bg-primary-500 text-white font-semibold hover:bg-primary-600 transition-colors text-sm">
            Create Invoice
          </button>
          <button onClick={() => { refetchInvoices(); refetchPayments(); }} className="p-2 rounded-xl border border-custom-300 hover:bg-custom-100">
            <HiOutlineRefresh className={`w-5 h-5 text-custom-700 ${(loadingInvoices || loadingPayments) ? "animate-spin" : ""}`} />
          </button>
        </div> */}
      </div>

      {/* KPI Grid */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
        {kpis.map(({ label, value, icon: Icon, color, bg }) => (
          <Card key={label} className="!p-4 flex flex-col gap-3">
            <div className={`w-10 h-10 rounded-xl flex items-center justify-center ${bg}`}>
              <Icon className={`w-5 h-5 ${color}`} />
            </div>
            <div>
              <p className="text-xs text-custom-700">{label}</p>
              <p className="text-xl font-bold text-secondary-100 leading-tight">
                {value} <span className="text-sm font-normal text-custom-700">RWF</span>
              </p>
            </div>
          </Card>
        ))}
      </div>

      {/* Main Content */}
      <div className="grid grid-cols-1 xl:grid-cols-3 gap-6">
        {/* Invoices Table */}
        <Card className="xl:col-span-2">
          <div className="flex flex-col xs:flex-row xs:items-center justify-between gap-3 mb-5">
            <div className="flex items-center gap-2">
              <HiOutlineDocumentText className="w-5 h-5 text-primary-500" />
              <h2 className="font-bold text-secondary-100">Invoices</h2>
            </div>
            <div className="relative w-full xs:w-64">
              <HiOutlineSearch className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-custom-700" />
              <input type="text" placeholder="Search invoice..." value={search} onChange={(e) => { setSearch(e.target.value); setInvPage(1); }}
                className="w-full pl-9 pr-4 py-2 rounded-xl border border-custom-300 bg-style-500 text-secondary-100 text-sm placeholder:text-custom-700 focus:outline-none focus:border-primary-400 focus:ring-2 focus:ring-primary-200 transition-colors font-[family-name:var(--font-family-primary)]" />
            </div>
          </div>
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead>
                <tr className="border-b border-custom-300">
                  {["Invoice", "Job", "Client", "Amount", "Due Date", "Status", "Actions"].map((h) => (
                    <th key={h} className="text-left py-2 px-3 text-xs font-semibold text-custom-700 uppercase tracking-wide whitespace-nowrap">{h}</th>
                  ))}
                </tr>
              </thead>
              <tbody>
                {loadingInvoices ? (
                  <tr><td colSpan={7} className="py-8 text-center text-custom-700 text-sm">Loading...</td></tr>
                ) : filtered.length === 0 ? (
                  <tr><td colSpan={7} className="py-8 text-center text-custom-700 text-sm">No invoices found.</td></tr>
                ) : paginatedInvoices.map((inv) => {
                  const clientName = inv.job?.customer?.name ?? inv.customer?.name ?? "—";
                  const jobNo = inv.job?.jobNumber ?? "—";
                  return (
                    <tr key={inv.id} className="border-b border-custom-200 hover:bg-custom-50 transition-colors">
                      <td className="py-3 px-3 font-semibold text-primary-500 whitespace-nowrap">{inv.invoiceNo}</td>
                      <td className="py-3 px-3 text-custom-700 whitespace-nowrap">{jobNo}</td>
                      <td className="py-3 px-3 text-secondary-100 whitespace-nowrap">{clientName}</td>
                      <td className="py-3 px-3 text-secondary-100 font-semibold whitespace-nowrap">{Number(inv.totalAmount).toLocaleString()} RWF</td>
                      <td className="py-3 px-3 text-custom-700 whitespace-nowrap">{inv.dueDate ? new Date(inv.dueDate).toLocaleDateString() : "—"}</td>
                      <td className="py-3 px-3">
                        <span className={`text-xs font-semibold px-2 py-0.5 rounded-full whitespace-nowrap ${getStatusStyle(inv)}`}>{getStatusLabel(inv)}</span>
                      </td>
                      <td className="py-3 px-3">
                        <div className="flex items-center gap-2">
                          {inv.status !== "paid" && (
                            <button onClick={() => openPaymentModal(inv.id)} className="px-3 py-1 rounded-lg bg-green-600 text-white hover:bg-green-700 transition-colors text-xs font-semibold">
                              Pay
                            </button>
                          )}
                        </div>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
          {/* Invoice Pagination */}
          {filtered.length > INV_PAGE_SIZE && (
            <div className="flex items-center justify-between mt-3 pt-3 border-t border-custom-200">
              <p className="text-xs text-custom-700">
                {(invPage - 1) * INV_PAGE_SIZE + 1}–{Math.min(invPage * INV_PAGE_SIZE, filtered.length)} of {filtered.length}
              </p>
              <div className="flex items-center gap-1">
                <button onClick={() => setInvPage(p => Math.max(1, p - 1))} disabled={invPage === 1}
                  className="px-3 py-1.5 rounded-lg border border-custom-300 text-xs font-semibold text-secondary-100 hover:bg-custom-100 disabled:opacity-40">Prev</button>
                {Array.from({ length: invTotalPages }, (_, i) => i + 1).map(n => (
                  <button key={n} onClick={() => setInvPage(n)}
                    className={`w-7 h-7 rounded-lg text-xs font-bold transition-colors ${n === invPage ? "bg-primary-500 text-white" : "border border-custom-300 text-secondary-100 hover:bg-custom-100"}`}>{n}</button>
                ))}
                <button onClick={() => setInvPage(p => Math.min(invTotalPages, p + 1))} disabled={invPage === invTotalPages}
                  className="px-3 py-1.5 rounded-lg border border-custom-300 text-xs font-semibold text-secondary-100 hover:bg-custom-100 disabled:opacity-40">Next</button>
              </div>
            </div>
          )}
        </Card>

        {/* Recent Payments */}
        <Card>
          <div className="flex items-center gap-2 mb-5">
            <HiOutlineCheckCircle className="w-5 h-5 text-green-600" />
            <h2 className="font-bold text-secondary-100">Recent Payments</h2>
          </div>
          {loadingPayments ? (
            <p className="text-sm text-custom-700">Loading...</p>
          ) : payments.length === 0 ? (
            <p className="text-sm text-custom-700">No payments yet.</p>
          ) : (
            <div className="space-y-3">
              {paginatedPayments.map((p) => (
                <div key={p.id} className="p-3 rounded-xl bg-green-50 border border-green-200">
                  <div className="flex items-center justify-between mb-1">
                    <span className="text-sm font-semibold text-secondary-100">{p.receiptNo}</span>
                    <span className="text-sm font-bold text-green-600">{Number(p.amountPaid).toLocaleString()} RWF</span>
                  </div>
                  <p className="text-xs text-custom-700">{p.job?.customer?.name ?? "—"}</p>
                  <p className="text-xs text-custom-700 mt-1">{new Date(p.paidAt).toLocaleDateString()}</p>
                </div>
              ))}
            </div>
          )}
          {/* Payments Pagination */}
          {payments.length > PAY_PAGE_SIZE && (
            <div className="flex items-center justify-between mt-3 pt-3 border-t border-custom-200">
              <p className="text-xs text-custom-700">
                {(payPage - 1) * PAY_PAGE_SIZE + 1}–{Math.min(payPage * PAY_PAGE_SIZE, payments.length)} of {payments.length}
              </p>
              <div className="flex items-center gap-1">
                <button onClick={() => setPayPage(p => Math.max(1, p - 1))} disabled={payPage === 1}
                  className="px-2 py-1 rounded-lg border border-custom-300 text-xs font-semibold text-secondary-100 hover:bg-custom-100 disabled:opacity-40">‹</button>
                <span className="text-xs text-custom-700">{payPage}/{payTotalPages}</span>
                <button onClick={() => setPayPage(p => Math.min(payTotalPages, p + 1))} disabled={payPage === payTotalPages}
                  className="px-2 py-1 rounded-lg border border-custom-300 text-xs font-semibold text-secondary-100 hover:bg-custom-100 disabled:opacity-40">›</button>
              </div>
            </div>
          )}
        </Card>
      </div>

      {/* Record Payment Modal */}
      {showPaymentModal && (
        <div className="fixed inset-0 bg-secondary-100/50 z-50 flex items-start justify-center p-4 overflow-y-auto">
          <Card className="!p-6 max-w-lg w-full my-8">
            <div className="flex items-center justify-between mb-6">
              <h3 className="text-xl font-bold text-secondary-100">Record Payment</h3>
              <button onClick={() => setShowPaymentModal(false)} className="text-custom-700 hover:text-secondary-100"><HiOutlineX className="w-6 h-6" /></button>
            </div>
            <form onSubmit={handlePaymentSubmit} className="space-y-4">
              <div>
                <label className="block text-sm font-semibold text-secondary-100 mb-2">Job *</label>
                <select value={paymentForm.jobId} onChange={(e) => setPaymentForm(p => ({ ...p, jobId: e.target.value }))} required
                  className="w-full px-4 py-2.5 rounded-xl border border-custom-300 bg-style-500 text-secondary-100 focus:outline-none focus:border-primary-400 focus:ring-2 focus:ring-primary-200 transition-colors font-[family-name:var(--font-family-primary)]">
                  <option value="">Select job</option>
                  {jobs.filter(j => j.paymentStatus !== "paid").map(j => (
                    <option key={j.id} value={j.id}>{j.jobNumber} — {j.customer?.name} ({j.title})</option>
                  ))}
                </select>
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-semibold text-secondary-100 mb-2">Amount (RWF) *</label>
                  <Input type="number" placeholder="Amount" value={paymentForm.amountPaid}
                    onChange={(e) => setPaymentForm(p => ({ ...p, amountPaid: e.target.value }))} required fullWidth />
                </div>
                <div>
                  <label className="block text-sm font-semibold text-secondary-100 mb-2">Method *</label>
                  <select value={paymentForm.paymentMethod} onChange={(e) => setPaymentForm(p => ({ ...p, paymentMethod: e.target.value as any }))} required
                    className="w-full px-4 py-2.5 rounded-xl border border-custom-300 bg-style-500 text-secondary-100 focus:outline-none focus:border-primary-400 focus:ring-2 focus:ring-primary-200 transition-colors font-[family-name:var(--font-family-primary)]">
                    <option value="CASH">Cash</option>
                    <option value="MOBILE_MONEY">Mobile Money</option>
                    <option value="BANK_TRANSFER">Bank Transfer</option>
                    <option value="CARD">Card</option>
                  </select>
                </div>
              </div>
              <div>
                <label className="block text-sm font-semibold text-secondary-100 mb-2">Payment State</label>
                <select value={paymentForm.paymentState} onChange={(e) => setPaymentForm(p => ({ ...p, paymentState: e.target.value as any }))}
                  className="w-full px-4 py-2.5 rounded-xl border border-custom-300 bg-style-500 text-secondary-100 focus:outline-none focus:border-primary-400 focus:ring-2 focus:ring-primary-200 transition-colors font-[family-name:var(--font-family-primary)]">
                  <option value="FULL">Full</option>
                  <option value="PARTIAL">Partial</option>
                </select>
              </div>
              <div>
                <label className="block text-sm font-semibold text-secondary-100 mb-2">Note</label>
                <Input type="text" placeholder="Optional note" value={paymentForm.paymentNote}
                  onChange={(e) => setPaymentForm(p => ({ ...p, paymentNote: e.target.value }))} fullWidth />
              </div>
              <div className="flex gap-3 justify-end pt-4 border-t border-custom-300">
                <Button type="button" variant="outline" onClick={() => setShowPaymentModal(false)}>Cancel</Button>
                <Button type="submit" className="bg-green-600 hover:bg-green-700" disabled={recordingPayment}>
                  {recordingPayment ? "Recording..." : "Record Payment"}
                </Button>
              </div>
            </form>
          </Card>
        </div>
      )}

      {/* Create Invoice Modal */}
      {showInvoiceModal && (
        <div className="fixed inset-0 bg-secondary-100/50 z-50 flex items-start justify-center p-4 overflow-y-auto">
          <Card className="!p-6 max-w-lg w-full my-8">
            <div className="flex items-center justify-between mb-6">
              <h3 className="text-xl font-bold text-secondary-100">Create Invoice</h3>
              <button onClick={() => setShowInvoiceModal(false)} className="text-custom-700 hover:text-secondary-100"><HiOutlineX className="w-6 h-6" /></button>
            </div>
            <form onSubmit={handleInvoiceSubmit} className="space-y-4">
              <div>
                <label className="block text-sm font-semibold text-secondary-100 mb-2">Job *</label>
                <select value={invoiceForm.jobId} onChange={(e) => {
                  const job = jobs.find(j => j.id === e.target.value);
                  setInvoiceForm(f => ({ ...f, jobId: e.target.value, customerId: job?.customerId ?? "" }));
                }} required className="w-full px-4 py-2.5 rounded-xl border border-custom-300 bg-style-500 text-secondary-100 focus:outline-none focus:border-primary-400 focus:ring-2 focus:ring-primary-200 transition-colors font-[family-name:var(--font-family-primary)]">
                  <option value="">Select job</option>
                  {jobs.map(j => (
                    <option key={j.id} value={j.id}>{j.jobNumber} — {j.customer?.name} ({j.title})</option>
                  ))}
                </select>
              </div>
              {selectedJob && (
                <p className="text-xs text-custom-700">Customer: {selectedJob.customer?.name}</p>
              )}
              <div>
                <label className="block text-sm font-semibold text-secondary-100 mb-2">Item Description *</label>
                <Input type="text" placeholder="e.g. Business Cards Printing" value={invoiceForm.itemName}
                  onChange={(e) => setInvoiceForm(f => ({ ...f, itemName: e.target.value }))} required fullWidth />
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-semibold text-secondary-100 mb-2">Quantity *</label>
                  <Input type="number" placeholder="1" value={invoiceForm.quantity}
                    onChange={(e) => setInvoiceForm(f => ({ ...f, quantity: e.target.value }))} required fullWidth />
                </div>
                <div>
                  <label className="block text-sm font-semibold text-secondary-100 mb-2">Unit Price (RWF) *</label>
                  <Input type="number" placeholder="0" value={invoiceForm.unitPrice}
                    onChange={(e) => setInvoiceForm(f => ({ ...f, unitPrice: e.target.value }))} required fullWidth />
                </div>
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-semibold text-secondary-100 mb-2">Tax Rate (%)</label>
                  <Input type="number" placeholder="18" value={invoiceForm.taxRate}
                    onChange={(e) => setInvoiceForm(f => ({ ...f, taxRate: e.target.value }))} fullWidth />
                </div>
                <div>
                  <label className="block text-sm font-semibold text-secondary-100 mb-2">Total with Tax</label>
                  <div className="px-4 py-2.5 rounded-xl border border-custom-300 bg-custom-50 text-secondary-100 font-bold text-sm">
                    {invoiceForm.unitPrice && invoiceForm.quantity
                      ? (Number(invoiceForm.unitPrice) * Number(invoiceForm.quantity) * (1 + Number(invoiceForm.taxRate || 0) / 100)).toLocaleString()
                      : "0"} RWF
                  </div>
                </div>
              </div>
              <div>
                <label className="block text-sm font-semibold text-secondary-100 mb-2">Due Date</label>
                <Input type="date" value={invoiceForm.dueDate}
                  onChange={(e) => setInvoiceForm(f => ({ ...f, dueDate: e.target.value }))} fullWidth />
              </div>
              <div className="flex gap-3 justify-end pt-4 border-t border-custom-300">
                <Button type="button" variant="outline" onClick={() => setShowInvoiceModal(false)}>Cancel</Button>
                <Button type="submit" disabled={creatingInvoice}>
                  {creatingInvoice ? "Creating..." : "Create Invoice"}
                </Button>
              </div>
            </form>
          </Card>
        </div>
      )}
    </div>
  );
}
