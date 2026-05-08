import { useState } from "react";
import {
  HiOutlineCheckCircle,
  HiOutlineClock,
  HiOutlineCurrencyDollar,
  HiOutlineDocumentText,
  HiOutlineExclamationCircle,
  HiOutlineSearch,
  HiOutlineTrendingUp,
  HiOutlineX,
} from "react-icons/hi";
import { Button, Card, Input } from "../../components/ui";

const kpis = [
  {
    label: "Revenue Today",
    value: "2,000,000",
    icon: HiOutlineCurrencyDollar,
    color: "text-green-600",
    bg: "bg-green-100",
    suffix: "RWF",
  },
  {
    label: "Payments Received",
    value: "1,750,000",
    icon: HiOutlineCheckCircle,
    color: "text-primary-500",
    bg: "bg-primary-100",
    suffix: "RWF",
  },
  {
    label: "Outstanding",
    value: "250,000",
    icon: HiOutlineClock,
    color: "text-yellow-600",
    bg: "bg-yellow-100",
    suffix: "RWF",
  },
  {
    label: "Overdue",
    value: "85,000",
    icon: HiOutlineExclamationCircle,
    color: "text-red-500",
    bg: "bg-red-100",
    suffix: "RWF",
  },
];

const invoices = [
  {
    id: "INV-001",
    jobId: "JOB-001",
    client: "ABC Corp",
    amount: "850,000",
    issued: "2026-04-28",
    due: "2026-05-12",
    status: "Paid",
    paymentDate: "2026-04-29",
  },
  {
    id: "INV-002",
    jobId: "JOB-002",
    client: "XYZ Ltd",
    amount: "120,000",
    issued: "2026-04-29",
    due: "2026-05-13",
    status: "Pending",
    paymentDate: null,
  },
  {
    id: "INV-003",
    jobId: "JOB-003",
    client: "Gov Office",
    amount: "350,000",
    issued: "2026-04-25",
    due: "2026-05-09",
    status: "Paid",
    paymentDate: "2026-04-30",
  },
  {
    id: "INV-004",
    jobId: "JOB-004",
    client: "School A",
    amount: "180,000",
    issued: "2026-04-20",
    due: "2026-05-04",
    status: "Overdue",
    paymentDate: null,
  },
  {
    id: "INV-005",
    jobId: "JOB-010",
    client: "Law Firm",
    amount: "95,000",
    issued: "2026-04-29",
    due: "2026-05-13",
    status: "Pending",
    paymentDate: null,
  },
];

// Mock jobs data for dropdown
const mockJobs = [
  { id: "JOB-001", client: "ABC Corp", title: "Business Cards Printing" },
  { id: "JOB-002", client: "XYZ Ltd", title: "Brochure Design & Print" },
  { id: "JOB-003", client: "Gov Office", title: "Annual Report Binding" },
  { id: "JOB-004", client: "School A", title: "Flyers Printing" },
  { id: "JOB-005", client: "Hotel C", title: "Banner Production" },
  { id: "JOB-010", client: "Law Firm", title: "Legal Documents Binding" },
];

const statusColor: Record<string, string> = {
  Paid: "bg-green-100 text-green-700",
  Pending: "bg-yellow-100 text-yellow-700",
  Overdue: "bg-red-100 text-red-700",
  Cancelled: "bg-custom-100 text-custom-800",
};

const revenueByService = [
  { service: "Offset Printing", revenue: 1200000, percentage: 40 },
  { service: "Digital Printing", revenue: 750000, percentage: 25 },
  { service: "Binding", revenue: 450000, percentage: 15 },
  { service: "Composition", revenue: 360000, percentage: 12 },
  { service: "Packaging", revenue: 240000, percentage: 8 },
];

const recentPayments = [
  { invoice: "INV-003", client: "Gov Office", amount: "350,000", time: "30 mins ago" },
  { invoice: "INV-001", client: "ABC Corp", amount: "850,000", time: "1 day ago" },
  { invoice: "INV-007", client: "Hotel C", amount: "220,000", time: "2 days ago" },
];

export default function FinanceDashboard() {
  const [search, setSearch] = useState("");
  const [showPaymentModal, setShowPaymentModal] = useState(false);
  const [showInvoiceModal, setShowInvoiceModal] = useState(false);
  
  const [paymentData, setPaymentData] = useState({
    invoiceId: "",
    amount: "",
    paymentMethod: "cash",
    paymentDate: new Date().toISOString().split('T')[0],
    reference: "",
    notes: "",
  });

  const [invoiceData, setInvoiceData] = useState({
    jobId: "",
    clientName: "",
    amount: "",
    dueDate: "",
    description: "",
    taxRate: "18",
  });

  const handlePaymentSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    alert(`Payment recorded for ${paymentData.invoiceId}: ${paymentData.amount} RWF`);
    setPaymentData({
      invoiceId: "",
      amount: "",
      paymentMethod: "cash",
      paymentDate: new Date().toISOString().split('T')[0],
      reference: "",
      notes: "",
    });
    setShowPaymentModal(false);
  };

  const handleInvoiceSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    const invoiceNumber = `INV-${Date.now().toString().slice(-6)}`;
    alert(`Invoice ${invoiceNumber} created for ${invoiceData.clientName}`);
    setInvoiceData({
      jobId: "",
      clientName: "",
      amount: "",
      dueDate: "",
      description: "",
      taxRate: "18",
    });
    setShowInvoiceModal(false);
  };

  const openPaymentModal = (invoiceId?: string) => {
    if (invoiceId) {
      const invoice = invoices.find(inv => inv.id === invoiceId);
      if (invoice) {
        setPaymentData(prev => ({
          ...prev,
          invoiceId: invoice.id,
          amount: invoice.amount,
        }));
      }
    }
    setShowPaymentModal(true);
  };

  const filtered = invoices.filter(
    (inv) =>
      inv.id.toLowerCase().includes(search.toLowerCase()) ||
      inv.client.toLowerCase().includes(search.toLowerCase()) ||
      inv.jobId.toLowerCase().includes(search.toLowerCase())
  );

  return (
    <div className="space-y-8 font-[family-name:var(--font-family-primary)]">
      {/* Header */}
      <div className="flex flex-col xs:flex-row xs:items-center justify-between gap-3">
        <div>
          <h1 className="text-2xl md:text-3xl font-bold text-secondary-100">
            Finance Dashboard
          </h1>
          <p className="text-sm text-custom-700 mt-1">
            Manage invoices, payments, and financial tracking — Thursday, April 30, 2026
          </p>
        </div>
        <div className="flex gap-2">
          <button 
            onClick={() => openPaymentModal()}
            className="px-4 py-2 rounded-xl bg-green-600 text-white font-semibold hover:bg-green-700 transition-colors text-sm"
          >
            Record Payment
          </button>
          <button 
            onClick={() => setShowInvoiceModal(true)}
            className="px-4 py-2 rounded-xl bg-primary-500 text-white font-semibold hover:bg-primary-600 transition-colors text-sm"
          >
            Create Invoice
          </button>
        </div>
      </div>

      {/* KPI Grid */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
        {kpis.map(({ label, value, icon: Icon, color, bg, suffix }) => (
          <Card key={label} className="!p-4 flex flex-col gap-3">
            <div className={`w-10 h-10 rounded-xl flex items-center justify-center ${bg}`}>
              <Icon className={`w-5 h-5 ${color}`} />
            </div>
            <div>
              <p className="text-xs text-custom-700">{label}</p>
              <p className="text-xl font-bold text-secondary-100 leading-tight">
                {value} <span className="text-sm font-normal text-custom-700">{suffix}</span>
              </p>
            </div>
          </Card>
        ))}
      </div>

      {/* Main Content Grid */}
      <div className="grid grid-cols-1 xl:grid-cols-3 gap-6">
        {/* Invoices Table */}
        <Card className="xl:col-span-2">
          <div className="flex flex-col xs:flex-row xs:items-center justify-between gap-3 mb-5">
            <div className="flex items-center gap-2">
              <HiOutlineDocumentText className="w-5 h-5 text-primary-500" />
              <h2 className="font-bold text-secondary-100">Invoices</h2>
            </div>
            {/* Search */}
            <div className="relative w-full xs:w-64">
              <HiOutlineSearch className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-custom-700" />
              <input
                type="text"
                placeholder="Search invoice..."
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                className="
                  w-full pl-9 pr-4 py-2 rounded-xl border border-custom-300
                  bg-style-500 text-secondary-100 text-sm
                  placeholder:text-custom-700
                  focus:outline-none focus:border-primary-400 focus:ring-2 focus:ring-primary-200
                  transition-colors duration-200
                  font-[family-name:var(--font-family-primary)]
                "
              />
            </div>
          </div>

          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead>
                <tr className="border-b border-custom-300">
                  {["Invoice", "Job ID", "Client", "Amount", "Due Date", "Status", "Actions"].map((h) => (
                    <th key={h} className="text-left py-2 px-3 text-xs font-semibold text-custom-700 uppercase tracking-wide whitespace-nowrap">
                      {h}
                    </th>
                  ))}
                </tr>
              </thead>
              <tbody>
                {filtered.map((inv) => (
                  <tr key={inv.id} className="border-b border-custom-200 hover:bg-custom-50 transition-colors">
                    <td className="py-3 px-3 font-semibold text-primary-500 whitespace-nowrap">{inv.id}</td>
                    <td className="py-3 px-3 text-custom-700 whitespace-nowrap">{inv.jobId}</td>
                    <td className="py-3 px-3 text-secondary-100 whitespace-nowrap">{inv.client}</td>
                    <td className="py-3 px-3 text-secondary-100 font-semibold whitespace-nowrap">{inv.amount} RWF</td>
                    <td className="py-3 px-3 text-custom-700 whitespace-nowrap">{inv.due}</td>
                    <td className="py-3 px-3">
                      <span className={`text-xs font-semibold px-2 py-0.5 rounded-full whitespace-nowrap ${statusColor[inv.status] ?? "bg-custom-100 text-custom-800"}`}>
                        {inv.status}
                      </span>
                    </td>
                    <td className="py-3 px-3">
                      <div className="flex items-center gap-2">
                        <button
                          className="px-3 py-1 rounded-lg border border-custom-300 hover:bg-custom-100 transition-colors text-xs font-semibold text-custom-700"
                          title="View Details"
                        >
                          View
                        </button>
                        {inv.status !== "Paid" && (
                          <button
                            onClick={() => openPaymentModal(inv.id)}
                            className="px-3 py-1 rounded-lg bg-green-600 text-white hover:bg-green-700 transition-colors text-xs font-semibold"
                            title="Record Payment"
                          >
                            Pay
                          </button>
                        )}
                      </div>
                    </td>
                  </tr>
                ))}
                {filtered.length === 0 && (
                  <tr>
                    <td colSpan={7} className="py-8 text-center text-custom-700 text-sm">
                      No invoices found.
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>
        </Card>

        {/* Recent Payments */}
        <Card>
          <div className="flex items-center gap-2 mb-5">
            <HiOutlineCheckCircle className="w-5 h-5 text-green-600" />
            <h2 className="font-bold text-secondary-100">Recent Payments</h2>
          </div>
          <div className="space-y-3">
            {recentPayments.map((payment, idx) => (
              <div key={idx} className="p-3 rounded-xl bg-green-50 border border-green-200">
                <div className="flex items-center justify-between mb-1">
                  <span className="text-sm font-semibold text-secondary-100">{payment.invoice}</span>
                  <span className="text-sm font-bold text-green-600">{payment.amount} RWF</span>
                </div>
                <p className="text-xs text-custom-700">{payment.client}</p>
                <p className="text-xs text-custom-700 mt-1">{payment.time}</p>
              </div>
            ))}
          </div>
        </Card>
      </div>

      {/* Revenue by Service */}
      <Card>
        <div className="flex items-center gap-2 mb-5">
          <HiOutlineTrendingUp className="w-5 h-5 text-primary-500" />
          <h2 className="font-bold text-secondary-100">Revenue by Service (This Month)</h2>
        </div>
        <div className="space-y-4">
          {revenueByService.map((item) => (
            <div key={item.service}>
              <div className="flex items-center justify-between mb-2">
                <span className="text-sm text-secondary-100 font-semibold">{item.service}</span>
                <div className="flex items-center gap-3">
                  <span className="text-sm font-bold text-primary-500">{item.revenue.toLocaleString()} RWF</span>
                  <span className="text-xs text-custom-700">{item.percentage}%</span>
                </div>
              </div>
              <div className="w-full bg-custom-200 rounded-full h-2">
                <div
                  className="h-2 rounded-full bg-primary-500"
                  style={{ width: `${item.percentage}%` }}
                />
              </div>
            </div>
          ))}
        </div>
      </Card>

      {/* Record Payment Modal */}
      {showPaymentModal && (
        <div className="fixed inset-0 bg-secondary-100/50 z-50 flex items-start justify-center p-4 overflow-y-auto">
          <Card className="!p-6 max-w-2xl w-full my-8 max-h-[90vh] overflow-y-auto">
            <div className="flex items-center justify-between mb-6">
              <h3 className="text-xl font-bold text-secondary-100">Record Payment</h3>
              <button
                onClick={() => {
                  setShowPaymentModal(false);
                }}
                className="text-custom-700 hover:text-secondary-100"
              >
                <HiOutlineX className="w-6 h-6" />
              </button>
            </div>

            <form onSubmit={handlePaymentSubmit} className="space-y-6">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-semibold text-secondary-100 mb-2">
                    Invoice ID *
                  </label>
                  <select
                    name="invoiceId"
                    value={paymentData.invoiceId}
                    onChange={(e) => {
                      const selectedInv = invoices.find(inv => inv.id === e.target.value);
                      setPaymentData({ 
                        ...paymentData, 
                        invoiceId: e.target.value,
                        amount: selectedInv ? selectedInv.amount : ""
                      });
                    }}
                    required
                    className="w-full px-4 py-2.5 rounded-xl border border-custom-300 bg-style-500 text-secondary-100 focus:outline-none focus:border-primary-400 focus:ring-2 focus:ring-primary-200 transition-colors duration-200 font-[family-name:var(--font-family-primary)]"
                  >
                    <option value="">Select invoice</option>
                    {invoices.filter(inv => inv.status !== "Paid").map((inv) => (
                      <option key={inv.id} value={inv.id}>
                        {inv.id} - {inv.client} ({inv.amount} RWF)
                      </option>
                    ))}
                  </select>
                </div>
                <div>
                  <label className="block text-sm font-semibold text-secondary-100 mb-2">
                    Amount (RWF) *
                  </label>
                  <Input
                    name="amount"
                    type="number"
                    placeholder="Enter amount"
                    value={paymentData.amount}
                    onChange={(e) => setPaymentData({ ...paymentData, amount: e.target.value })}
                    required
                    fullWidth
                  />
                </div>
                <div>
                  <label className="block text-sm font-semibold text-secondary-100 mb-2">
                    Payment Method *
                  </label>
                  <select
                    name="paymentMethod"
                    value={paymentData.paymentMethod}
                    onChange={(e) => setPaymentData({ ...paymentData, paymentMethod: e.target.value })}
                    required
                    className="w-full px-4 py-2.5 rounded-xl border border-custom-300 bg-style-500 text-secondary-100 focus:outline-none focus:border-primary-400 focus:ring-2 focus:ring-primary-200 transition-colors duration-200 font-[family-name:var(--font-family-primary)]"
                  >
                    <option value="cash">Cash</option>
                    <option value="bank-transfer">Bank Transfer</option>
                    <option value="mobile-money">Mobile Money</option>
                    <option value="check">Check</option>
                    <option value="card">Card</option>
                  </select>
                </div>
                <div>
                  <label className="block text-sm font-semibold text-secondary-100 mb-2">
                    Payment Date *
                  </label>
                  <Input
                    name="paymentDate"
                    type="date"
                    value={paymentData.paymentDate}
                    onChange={(e) => setPaymentData({ ...paymentData, paymentDate: e.target.value })}
                    required
                    fullWidth
                  />
                </div>
                <div className="md:col-span-2">
                  <label className="block text-sm font-semibold text-secondary-100 mb-2">
                    Reference Number
                  </label>
                  <Input
                    name="reference"
                    type="text"
                    placeholder="Transaction reference or receipt number"
                    value={paymentData.reference}
                    onChange={(e) => setPaymentData({ ...paymentData, reference: e.target.value })}
                    fullWidth
                  />
                </div>
                <div className="md:col-span-2">
                  <label className="block text-sm font-semibold text-secondary-100 mb-2">
                    Notes
                  </label>
                  <textarea
                    name="notes"
                    value={paymentData.notes}
                    onChange={(e) => setPaymentData({ ...paymentData, notes: e.target.value })}
                    rows={3}
                    placeholder="Additional notes about this payment..."
                    className="w-full px-4 py-2.5 rounded-xl border border-custom-300 bg-style-500 text-secondary-100 focus:outline-none focus:border-primary-400 focus:ring-2 focus:ring-primary-200 transition-colors duration-200 font-[family-name:var(--font-family-primary)] resize-none"
                  />
                </div>
              </div>

              <div className="flex gap-3 justify-end pt-4 border-t border-custom-300">
                <Button 
                  type="button" 
                  variant="outline"
                  onClick={() => {
                    setShowPaymentModal(false);
                  }}
                >
                  Cancel
                </Button>
                <Button type="submit" className="bg-green-600 hover:bg-green-700">
                  Record Payment
                </Button>
              </div>
            </form>
          </Card>
        </div>
      )}

      {/* Create Invoice Modal */}
      {showInvoiceModal && (
        <div className="fixed inset-0 bg-secondary-100/50 z-50 flex items-start justify-center p-4 overflow-y-auto">
          <Card className="!p-6 max-w-2xl w-full my-8 max-h-[90vh] overflow-y-auto">
            <div className="flex items-center justify-between mb-6">
              <h3 className="text-xl font-bold text-secondary-100">Create Invoice</h3>
              <button
                onClick={() => setShowInvoiceModal(false)}
                className="text-custom-700 hover:text-secondary-100"
              >
                <HiOutlineX className="w-6 h-6" />
              </button>
            </div>

            <form onSubmit={handleInvoiceSubmit} className="space-y-6">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-semibold text-secondary-100 mb-2">
                    Job ID *
                  </label>
                  <select
                    name="jobId"
                    value={invoiceData.jobId}
                    onChange={(e) => {
                      const selectedJob = mockJobs.find(job => job.id === e.target.value);
                      setInvoiceData({ 
                        ...invoiceData, 
                        jobId: e.target.value,
                        clientName: selectedJob ? selectedJob.client : ""
                      });
                    }}
                    required
                    className="w-full px-4 py-2.5 rounded-xl border border-custom-300 bg-style-500 text-secondary-100 focus:outline-none focus:border-primary-400 focus:ring-2 focus:ring-primary-200 transition-colors duration-200 font-[family-name:var(--font-family-primary)]"
                  >
                    <option value="">Select job</option>
                    {mockJobs.map((job) => (
                      <option key={job.id} value={job.id}>
                        {job.id} - {job.client} - {job.title}
                      </option>
                    ))}
                  </select>
                </div>
                <div>
                  <label className="block text-sm font-semibold text-secondary-100 mb-2">
                    Client Name *
                  </label>
                  <Input
                    name="clientName"
                    type="text"
                    placeholder="Enter client name"
                    value={invoiceData.clientName}
                    onChange={(e) => setInvoiceData({ ...invoiceData, clientName: e.target.value })}
                    required
                    fullWidth
                  />
                </div>
                <div>
                  <label className="block text-sm font-semibold text-secondary-100 mb-2">
                    Amount (RWF) *
                  </label>
                  <Input
                    name="amount"
                    type="number"
                    placeholder="Enter amount"
                    value={invoiceData.amount}
                    onChange={(e) => setInvoiceData({ ...invoiceData, amount: e.target.value })}
                    required
                    fullWidth
                  />
                </div>
                <div>
                  <label className="block text-sm font-semibold text-secondary-100 mb-2">
                    Tax Rate (%) *
                  </label>
                  <Input
                    name="taxRate"
                    type="number"
                    placeholder="18"
                    value={invoiceData.taxRate}
                    onChange={(e) => setInvoiceData({ ...invoiceData, taxRate: e.target.value })}
                    required
                    fullWidth
                  />
                </div>
                <div>
                  <label className="block text-sm font-semibold text-secondary-100 mb-2">
                    Due Date *
                  </label>
                  <Input
                    name="dueDate"
                    type="date"
                    value={invoiceData.dueDate}
                    onChange={(e) => setInvoiceData({ ...invoiceData, dueDate: e.target.value })}
                    required
                    fullWidth
                  />
                </div>
                <div>
                  <label className="block text-sm font-semibold text-secondary-100 mb-2">
                    Total with Tax
                  </label>
                  <div className="px-4 py-2.5 rounded-xl border border-custom-300 bg-custom-50 text-secondary-100 font-bold">
                    {invoiceData.amount && invoiceData.taxRate
                      ? (parseFloat(invoiceData.amount) * (1 + parseFloat(invoiceData.taxRate) / 100)).toLocaleString()
                      : "0"} RWF
                  </div>
                </div>
                <div className="md:col-span-2">
                  <label className="block text-sm font-semibold text-secondary-100 mb-2">
                    Description
                  </label>
                  <textarea
                    name="description"
                    value={invoiceData.description}
                    onChange={(e) => setInvoiceData({ ...invoiceData, description: e.target.value })}
                    rows={3}
                    placeholder="Invoice description or itemized list..."
                    className="w-full px-4 py-2.5 rounded-xl border border-custom-300 bg-style-500 text-secondary-100 focus:outline-none focus:border-primary-400 focus:ring-2 focus:ring-primary-200 transition-colors duration-200 font-[family-name:var(--font-family-primary)] resize-none"
                  />
                </div>
              </div>

              <div className="flex gap-3 justify-end pt-4 border-t border-custom-300">
                <Button 
                  type="button" 
                  variant="outline"
                  onClick={() => setShowInvoiceModal(false)}
                >
                  Cancel
                </Button>
                <Button type="submit">
                  Create Invoice
                </Button>
              </div>
            </form>
          </Card>
        </div>
      )}
    </div>
  );
}
