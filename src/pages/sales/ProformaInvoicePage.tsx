import { useState } from "react";
import {
    HiOutlineCheckCircle,
    HiOutlineClock,
    HiOutlineDocumentText,
    HiOutlineDownload,
    HiOutlinePlusCircle,
    HiOutlineSearch,
    HiOutlineX,
} from "react-icons/hi";
import { DashboardLayout } from "../../components";
import { Card } from "../../components/ui";

type InvoiceStatus = "draft" | "sent" | "paid" | "overdue";

interface ProformaInvoice {
  id: string;
  quotationId: string;
  jobId: string;
  client: string;
  clientPhone: string;
  clientEmail?: string;
  amount: string;
  tax: string;
  totalAmount: string;
  status: InvoiceStatus;
  createdAt: string;
  dueDate: string;
  paidAt?: string;
  paymentMethod?: string;
  notes?: string;
}

const initialInvoices: ProformaInvoice[] = [
  {
    id: "PI-001",
    quotationId: "QUOT-001",
    jobId: "JOB-001",
    client: "ABC Corp",
    clientPhone: "+250 788 123 456",
    clientEmail: "contact@abccorp.rw",
    amount: "850,000",
    tax: "153,000",
    totalAmount: "1,003,000",
    status: "paid",
    createdAt: "2026-04-28",
    dueDate: "2026-05-05",
    paidAt: "2026-04-30",
    paymentMethod: "Bank Transfer",
  },
  {
    id: "PI-002",
    quotationId: "QUOT-002",
    jobId: "JOB-002",
    client: "XYZ Ltd",
    clientPhone: "+250 788 234 567",
    amount: "120,000",
    tax: "21,600",
    totalAmount: "141,600",
    status: "sent",
    createdAt: "2026-04-29",
    dueDate: "2026-05-06",
  },
  {
    id: "PI-003",
    quotationId: "QUOT-003",
    jobId: "JOB-008",
    client: "Tech Startup",
    clientPhone: "+250 788 345 678",
    clientEmail: "info@techstartup.rw",
    amount: "450,000",
    tax: "81,000",
    totalAmount: "531,000",
    status: "overdue",
    createdAt: "2026-04-20",
    dueDate: "2026-04-30",
  },
];

const statusConfig: Record<InvoiceStatus, { label: string; color: string; icon: any }> = {
  draft: { label: "Draft", color: "bg-gray-100 text-gray-700", icon: HiOutlineDocumentText },
  sent: { label: "Sent", color: "bg-yellow-100 text-yellow-700", icon: HiOutlineClock },
  paid: { label: "Paid", color: "bg-green-100 text-green-700", icon: HiOutlineCheckCircle },
  overdue: { label: "Overdue", color: "bg-red-100 text-red-700", icon: HiOutlineClock },
};

export default function ProformaInvoicePage() {
  const [invoices, setInvoices] = useState<ProformaInvoice[]>(initialInvoices);
  const [search, setSearch] = useState("");
  const [selectedInvoice, setSelectedInvoice] = useState<ProformaInvoice | null>(null);
  const [showInvoiceModal, setShowInvoiceModal] = useState(false);
  const [showNewInvoiceModal, setShowNewInvoiceModal] = useState(false);
  const [newInvoiceForm, setNewInvoiceForm] = useState({
    quotationId: "",
    jobId: "",
    client: "",
    clientPhone: "",
    clientEmail: "",
    amount: "",
    tax: "",
    dueDate: "",
    notes: "",
  });

  const filtered = invoices.filter(
    (inv) =>
      inv.id.toLowerCase().includes(search.toLowerCase()) ||
      inv.client.toLowerCase().includes(search.toLowerCase()) ||
      inv.jobId.toLowerCase().includes(search.toLowerCase())
  );

  const handleCreateInvoice = () => {
    if (!newInvoiceForm.client || !newInvoiceForm.amount || !newInvoiceForm.dueDate) {
      alert("Please fill in all required fields");
      return;
    }

    const amount = parseFloat(newInvoiceForm.amount.replace(/,/g, ""));
    const taxRate = 0.18; // 18% VAT
    const tax = Math.round(amount * taxRate);
    const total = amount + tax;

    const newInvoice: ProformaInvoice = {
      id: `PI-${String(invoices.length + 1).padStart(3, "0")}`,
      quotationId: newInvoiceForm.quotationId || `QUOT-${String(invoices.length + 1).padStart(3, "0")}`,
      jobId: newInvoiceForm.jobId || `JOB-${String(invoices.length + 1).padStart(3, "0")}`,
      client: newInvoiceForm.client,
      clientPhone: newInvoiceForm.clientPhone,
      clientEmail: newInvoiceForm.clientEmail || undefined,
      amount: amount.toLocaleString(),
      tax: tax.toLocaleString(),
      totalAmount: total.toLocaleString(),
      status: "draft",
      createdAt: new Date().toISOString().split("T")[0],
      dueDate: newInvoiceForm.dueDate,
      notes: newInvoiceForm.notes || undefined,
    };

    setInvoices([newInvoice, ...invoices]);
    setShowNewInvoiceModal(false);
    setNewInvoiceForm({
      quotationId: "",
      jobId: "",
      client: "",
      clientPhone: "",
      clientEmail: "",
      amount: "",
      tax: "",
      dueDate: "",
      notes: "",
    });
  };

  const handleStatusChange = (invId: string, newStatus: InvoiceStatus) => {
    setInvoices(
      invoices.map((inv) =>
        inv.id === invId
          ? {
              ...inv,
              status: newStatus,
              paidAt: newStatus === "paid" ? new Date().toISOString().split("T")[0] : undefined,
            }
          : inv
      )
    );
  };

  const totalPaid = invoices
    .filter((inv) => inv.status === "paid")
    .reduce((sum, inv) => sum + parseFloat(inv.totalAmount.replace(/,/g, "")), 0);

  const totalPending = invoices
    .filter((inv) => inv.status === "sent" || inv.status === "overdue")
    .reduce((sum, inv) => sum + parseFloat(inv.totalAmount.replace(/,/g, "")), 0);

  return (
    <DashboardLayout userRole="sales" userName="Sales Officer" notificationCount={3}>
      <div className="space-y-6 font-[family-name:var(--font-family-primary)]">
        {/* Header */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
          <div>
            <h1 className="text-2xl md:text-3xl font-bold text-secondary-100">
              Proforma Invoices
            </h1>
            <p className="text-sm text-custom-700 mt-1">
              Manage proforma invoices and track payments
            </p>
          </div>
          <button
            onClick={() => setShowNewInvoiceModal(true)}
            className="flex items-center gap-2 px-4 py-2 rounded-xl bg-primary-500 text-white hover:bg-primary-600 transition-colors self-start sm:self-auto text-sm font-semibold"
          >
            <HiOutlinePlusCircle className="w-4 h-4" />
            New Invoice
          </button>
        </div>

        {/* Summary Cards */}
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
          <Card className="!p-4">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-xl bg-green-100 flex items-center justify-center">
                <HiOutlineCheckCircle className="w-5 h-5 text-green-600" />
              </div>
              <div>
                <p className="text-xs text-custom-700">Total Paid</p>
                <p className="text-xl font-bold text-secondary-100">
                  {totalPaid.toLocaleString()} RWF
                </p>
              </div>
            </div>
          </Card>
          <Card className="!p-4">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-xl bg-yellow-100 flex items-center justify-center">
                <HiOutlineClock className="w-5 h-5 text-yellow-600" />
              </div>
              <div>
                <p className="text-xs text-custom-700">Pending Payment</p>
                <p className="text-xl font-bold text-secondary-100">
                  {totalPending.toLocaleString()} RWF
                </p>
              </div>
            </div>
          </Card>
          <Card className="!p-4">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-xl bg-primary-100 flex items-center justify-center">
                <HiOutlineDocumentText className="w-5 h-5 text-primary-600" />
              </div>
              <div>
                <p className="text-xs text-custom-700">Total Invoices</p>
                <p className="text-xl font-bold text-secondary-100">{invoices.length}</p>
              </div>
            </div>
          </Card>
        </div>

        {/* Invoices List */}
        <Card className="!p-0 overflow-hidden">
          <div className="p-4 bg-custom-100 border-b border-custom-300">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
              <h2 className="text-lg font-bold text-secondary-100">All Invoices</h2>
              <div className="relative w-full sm:w-64">
                <HiOutlineSearch className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-custom-700" />
                <input
                  type="text"
                  placeholder="Search invoices..."
                  value={search}
                  onChange={(e) => setSearch(e.target.value)}
                  className="w-full pl-9 pr-4 py-2 rounded-xl border border-custom-300 bg-style-500 text-secondary-100 text-sm placeholder:text-custom-700 focus:outline-none focus:border-primary-400 focus:ring-2 focus:ring-primary-200 transition-colors duration-200"
                />
              </div>
            </div>
          </div>

          <div className="overflow-x-auto">
            <table className="w-full">
              <thead className="bg-custom-50 border-b border-custom-300">
                <tr>
                  <th className="px-4 py-3 text-left text-xs font-bold text-secondary-100 uppercase">
                    Invoice ID
                  </th>
                  <th className="px-4 py-3 text-left text-xs font-bold text-secondary-100 uppercase">
                    Job ID
                  </th>
                  <th className="px-4 py-3 text-left text-xs font-bold text-secondary-100 uppercase">
                    Client
                  </th>
                  <th className="px-4 py-3 text-left text-xs font-bold text-secondary-100 uppercase">
                    Amount
                  </th>
                  <th className="px-4 py-3 text-left text-xs font-bold text-secondary-100 uppercase">
                    Tax
                  </th>
                  <th className="px-4 py-3 text-left text-xs font-bold text-secondary-100 uppercase">
                    Total
                  </th>
                  <th className="px-4 py-3 text-left text-xs font-bold text-secondary-100 uppercase">
                    Status
                  </th>
                  <th className="px-4 py-3 text-left text-xs font-bold text-secondary-100 uppercase">
                    Due Date
                  </th>
                  <th className="px-4 py-3 text-right text-xs font-bold text-secondary-100 uppercase">
                    Actions
                  </th>
                </tr>
              </thead>
              <tbody className="bg-white divide-y divide-custom-200">
                {filtered.length === 0 ? (
                  <tr>
                    <td colSpan={9} className="px-4 py-8 text-center text-custom-700">
                      No invoices found
                    </td>
                  </tr>
                ) : (
                  filtered.map((invoice) => {
                    const config = statusConfig[invoice.status];
                    const Icon = config.icon;

                    return (
                      <tr key={invoice.id} className="hover:bg-custom-50 transition-colors">
                        <td className="px-4 py-4">
                          <span className="text-sm font-bold text-primary-600">{invoice.id}</span>
                        </td>
                        <td className="px-4 py-4">
                          <span className="text-sm font-bold text-secondary-100">{invoice.jobId}</span>
                        </td>
                        <td className="px-4 py-4">
                          <div>
                            <p className="text-sm font-semibold text-secondary-100">{invoice.client}</p>
                            <p className="text-xs text-custom-700">{invoice.clientPhone}</p>
                          </div>
                        </td>
                        <td className="px-4 py-4">
                          <span className="text-sm text-secondary-100">{invoice.amount} RWF</span>
                        </td>
                        <td className="px-4 py-4">
                          <span className="text-sm text-custom-700">{invoice.tax} RWF</span>
                        </td>
                        <td className="px-4 py-4">
                          <span className="text-sm font-bold text-primary-600">
                            {invoice.totalAmount} RWF
                          </span>
                        </td>
                        <td className="px-4 py-4">
                          <span className={`text-xs font-bold px-3 py-1 rounded-full ${config.color} flex items-center gap-1 w-fit`}>
                            <Icon className="w-3 h-3" />
                            {config.label}
                          </span>
                        </td>
                        <td className="px-4 py-4">
                          <span className="text-sm text-custom-700">{invoice.dueDate}</span>
                        </td>
                        <td className="px-4 py-4">
                          <div className="flex items-center justify-end gap-2">
                            <button
                              onClick={() => {
                                setSelectedInvoice(invoice);
                                setShowInvoiceModal(true);
                              }}
                              className="px-3 py-1.5 rounded-lg border border-custom-300 text-custom-700 hover:bg-custom-100 transition-colors text-xs font-semibold"
                            >
                              View
                            </button>
                            {invoice.status === "draft" && (
                              <button
                                onClick={(e) => {
                                  e.stopPropagation();
                                  handleStatusChange(invoice.id, "sent");
                                }}
                                className="px-3 py-1.5 rounded-lg bg-primary-500 text-white hover:bg-primary-600 transition-colors text-xs font-semibold"
                              >
                                Send
                              </button>
                            )}
                            {(invoice.status === "sent" || invoice.status === "overdue") && (
                              <button
                                onClick={(e) => {
                                  e.stopPropagation();
                                  handleStatusChange(invoice.id, "paid");
                                }}
                                className="px-3 py-1.5 rounded-lg bg-green-500 text-white hover:bg-green-600 transition-colors text-xs font-semibold"
                              >
                                Mark Paid
                              </button>
                            )}
                            <button
                              onClick={(e) => {
                                e.stopPropagation();
                                alert("Download PDF functionality coming soon");
                              }}
                              className="p-2 rounded-lg hover:bg-primary-100 transition-colors"
                              title="Download PDF"
                            >
                              <HiOutlineDownload className="w-4 h-4 text-primary-500" />
                            </button>
                          </div>
                        </td>
                      </tr>
                    );
                  })
                )}
              </tbody>
            </table>
          </div>
        </Card>

        {/* New Invoice Modal */}
        {showNewInvoiceModal && (
          <div className="fixed inset-0 bg-secondary-100/50 z-50 flex items-center justify-center p-4">
            <Card className="!p-6 max-w-2xl w-full max-h-[90vh] overflow-y-auto">
              <div className="flex items-center justify-between mb-6">
                <div>
                  <h3 className="text-2xl font-bold text-secondary-100">
                    Create Proforma Invoice
                  </h3>
                  <p className="text-sm text-custom-700 mt-1">
                    Generate invoice from approved quotation
                  </p>
                </div>
                <button
                  onClick={() => setShowNewInvoiceModal(false)}
                  className="text-custom-700 hover:text-secondary-100 text-2xl"
                >
                  <HiOutlineX className="w-6 h-6" />
                </button>
              </div>

              <div className="space-y-4">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-semibold text-custom-700 mb-2">
                      Quotation ID (Optional)
                    </label>
                    <input
                      type="text"
                      value={newInvoiceForm.quotationId}
                      onChange={(e) =>
                        setNewInvoiceForm({ ...newInvoiceForm, quotationId: e.target.value })
                      }
                      placeholder="QUOT-001"
                      className="w-full px-4 py-2 rounded-xl border border-custom-300 focus:outline-none focus:border-primary-500"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-semibold text-custom-700 mb-2">
                      Job ID (Optional)
                    </label>
                    <input
                      type="text"
                      value={newInvoiceForm.jobId}
                      onChange={(e) =>
                        setNewInvoiceForm({ ...newInvoiceForm, jobId: e.target.value })
                      }
                      placeholder="JOB-001"
                      className="w-full px-4 py-2 rounded-xl border border-custom-300 focus:outline-none focus:border-primary-500"
                    />
                  </div>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div className="md:col-span-2">
                    <label className="block text-sm font-semibold text-custom-700 mb-2">
                      Client Name *
                    </label>
                    <input
                      type="text"
                      value={newInvoiceForm.client}
                      onChange={(e) =>
                        setNewInvoiceForm({ ...newInvoiceForm, client: e.target.value })
                      }
                      placeholder="Enter client name"
                      className="w-full px-4 py-2 rounded-xl border border-custom-300 focus:outline-none focus:border-primary-500"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-semibold text-custom-700 mb-2">
                      Phone Number *
                    </label>
                    <input
                      type="tel"
                      value={newInvoiceForm.clientPhone}
                      onChange={(e) =>
                        setNewInvoiceForm({ ...newInvoiceForm, clientPhone: e.target.value })
                      }
                      placeholder="+250 788 123 456"
                      className="w-full px-4 py-2 rounded-xl border border-custom-300 focus:outline-none focus:border-primary-500"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-semibold text-custom-700 mb-2">
                      Email (Optional)
                    </label>
                    <input
                      type="email"
                      value={newInvoiceForm.clientEmail}
                      onChange={(e) =>
                        setNewInvoiceForm({ ...newInvoiceForm, clientEmail: e.target.value })
                      }
                      placeholder="client@example.com"
                      className="w-full px-4 py-2 rounded-xl border border-custom-300 focus:outline-none focus:border-primary-500"
                    />
                  </div>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-semibold text-custom-700 mb-2">
                      Amount (RWF) *
                    </label>
                    <input
                      type="text"
                      value={newInvoiceForm.amount}
                      onChange={(e) =>
                        setNewInvoiceForm({ ...newInvoiceForm, amount: e.target.value })
                      }
                      placeholder="850,000"
                      className="w-full px-4 py-2 rounded-xl border border-custom-300 focus:outline-none focus:border-primary-500"
                    />
                    <p className="text-xs text-custom-700 mt-1">Tax (18%) will be calculated automatically</p>
                  </div>
                  <div>
                    <label className="block text-sm font-semibold text-custom-700 mb-2">
                      Due Date *
                    </label>
                    <input
                      type="date"
                      value={newInvoiceForm.dueDate}
                      onChange={(e) =>
                        setNewInvoiceForm({ ...newInvoiceForm, dueDate: e.target.value })
                      }
                      className="w-full px-4 py-2 rounded-xl border border-custom-300 focus:outline-none focus:border-primary-500"
                    />
                  </div>
                </div>

                <div>
                  <label className="block text-sm font-semibold text-custom-700 mb-2">
                    Notes (Optional)
                  </label>
                  <textarea
                    value={newInvoiceForm.notes}
                    onChange={(e) =>
                      setNewInvoiceForm({ ...newInvoiceForm, notes: e.target.value })
                    }
                    placeholder="Additional notes or payment terms..."
                    rows={3}
                    className="w-full px-4 py-2 rounded-xl border border-custom-300 focus:outline-none focus:border-primary-500 resize-none"
                  />
                </div>
              </div>

              <div className="flex gap-3 mt-6">
                <button
                  onClick={() => setShowNewInvoiceModal(false)}
                  className="flex-1 px-4 py-2 rounded-xl border border-custom-300 hover:bg-custom-100 transition-colors text-sm font-semibold text-custom-700"
                >
                  Cancel
                </button>
                <button
                  onClick={handleCreateInvoice}
                  className="flex-1 px-4 py-2 rounded-xl bg-primary-500 text-white hover:bg-primary-600 transition-colors text-sm font-semibold"
                >
                  Create Invoice
                </button>
              </div>
            </Card>
          </div>
        )}

        {/* View Invoice Modal */}
        {showInvoiceModal && selectedInvoice && (
          <div className="fixed inset-0 bg-secondary-100/50 z-50 flex items-center justify-center p-4">
            <Card className="!p-6 max-w-2xl w-full max-h-[90vh] overflow-y-auto">
              <div className="flex items-start justify-between mb-4">
                <div>
                  <h3 className="text-xl font-bold text-secondary-100">
                    {selectedInvoice.id}
                  </h3>
                  <p className="text-sm text-custom-700 mt-1">
                    Job: {selectedInvoice.jobId} | Quotation: {selectedInvoice.quotationId}
                  </p>
                  <span
                    className={`inline-block mt-2 text-xs font-bold px-3 py-1 rounded-full ${
                      statusConfig[selectedInvoice.status].color
                    }`}
                  >
                    {statusConfig[selectedInvoice.status].label}
                  </span>
                </div>
                <button
                  onClick={() => setShowInvoiceModal(false)}
                  className="text-custom-700 hover:text-secondary-100 text-2xl"
                >
                  <HiOutlineX className="w-6 h-6" />
                </button>
              </div>

              <div className="space-y-4">
                <div>
                  <p className="text-sm font-semibold text-custom-700 mb-1">Client</p>
                  <p className="text-base text-secondary-100 font-bold">{selectedInvoice.client}</p>
                  <p className="text-sm text-custom-700">{selectedInvoice.clientPhone}</p>
                  {selectedInvoice.clientEmail && (
                    <p className="text-sm text-custom-700">{selectedInvoice.clientEmail}</p>
                  )}
                </div>

                <div className="p-4 rounded-xl bg-custom-50 border border-custom-200">
                  <div className="space-y-2">
                    <div className="flex justify-between">
                      <span className="text-sm text-custom-700">Amount</span>
                      <span className="text-sm font-semibold text-secondary-100">
                        {selectedInvoice.amount} RWF
                      </span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-sm text-custom-700">Tax (18%)</span>
                      <span className="text-sm font-semibold text-secondary-100">
                        {selectedInvoice.tax} RWF
                      </span>
                    </div>
                    <div className="border-t border-custom-300 pt-2 flex justify-between">
                      <span className="text-base font-bold text-secondary-100">Total Amount</span>
                      <span className="text-xl font-bold text-primary-600">
                        {selectedInvoice.totalAmount} RWF
                      </span>
                    </div>
                  </div>
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <p className="text-sm font-semibold text-custom-700 mb-1">Created</p>
                    <p className="text-base text-secondary-100">{selectedInvoice.createdAt}</p>
                  </div>
                  <div>
                    <p className="text-sm font-semibold text-custom-700 mb-1">Due Date</p>
                    <p className="text-base text-secondary-100">{selectedInvoice.dueDate}</p>
                  </div>
                </div>

                {selectedInvoice.paidAt && (
                  <div>
                    <p className="text-sm font-semibold text-custom-700 mb-1">Paid On</p>
                    <p className="text-base text-secondary-100">{selectedInvoice.paidAt}</p>
                    {selectedInvoice.paymentMethod && (
                      <p className="text-sm text-custom-700">via {selectedInvoice.paymentMethod}</p>
                    )}
                  </div>
                )}

                {selectedInvoice.notes && (
                  <div>
                    <p className="text-sm font-semibold text-custom-700 mb-1">Notes</p>
                    <p className="text-base text-secondary-100">{selectedInvoice.notes}</p>
                  </div>
                )}
              </div>

              <div className="flex gap-3 mt-6">
                <button
                  onClick={() => setShowInvoiceModal(false)}
                  className="flex-1 px-4 py-2 rounded-xl border border-custom-300 hover:bg-custom-100 transition-colors text-sm font-semibold text-custom-700"
                >
                  Close
                </button>
                <button
                  onClick={() => alert("Download PDF functionality coming soon")}
                  className="flex-1 px-4 py-2 rounded-xl bg-primary-500 text-white hover:bg-primary-600 transition-colors text-sm font-semibold"
                >
                  <HiOutlineDownload className="w-4 h-4 inline mr-2" />
                  Download PDF
                </button>
              </div>
            </Card>
          </div>
        )}
      </div>
    </DashboardLayout>
  );
}
