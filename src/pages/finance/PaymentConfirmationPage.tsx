import { useState } from "react";
import {
    HiOutlineCheckCircle,
    HiOutlineClock,
    HiOutlineCurrencyDollar,
    HiOutlineDocumentText,
    HiOutlineSearch,
    HiOutlineX,
} from "react-icons/hi";
import { DashboardLayout } from "../../components";
import { Card } from "../../components/ui";

type PaymentStatus = "pending" | "confirmed" | "partial" | "failed";

interface PaymentConfirmation {
  id: string;
  invoiceId: string;
  jobId: string;
  client: string;
  totalAmount: string;
  paidAmount?: string;
  paymentMethod?: string;
  transactionRef?: string;
  status: PaymentStatus;
  dueDate: string;
  confirmedDate?: string;
  confirmedBy?: string;
  notes?: string;
}

const initialPayments: PaymentConfirmation[] = [
  {
    id: "PAY-001",
    invoiceId: "PI-001",
    jobId: "JOB-001",
    client: "ABC Corp",
    totalAmount: "1,003,000",
    paidAmount: "1,003,000",
    paymentMethod: "Bank Transfer",
    transactionRef: "TXN-20260430-001",
    status: "confirmed",
    dueDate: "2026-05-05",
    confirmedDate: "2026-04-30",
    confirmedBy: "DAF",
  },
  {
    id: "PAY-002",
    invoiceId: "PI-002",
    jobId: "JOB-002",
    client: "XYZ Ltd",
    totalAmount: "141,600",
    status: "pending",
    dueDate: "2026-05-06",
  },
  {
    id: "PAY-003",
    invoiceId: "PI-003",
    jobId: "JOB-008",
    client: "Tech Startup",
    totalAmount: "531,000",
    paidAmount: "300,000",
    paymentMethod: "Mobile Money",
    transactionRef: "MTN-20260502-045",
    status: "partial",
    dueDate: "2026-04-30",
    notes: "Client paid 300k, balance of 231k pending",
  },
];

const statusConfig: Record<PaymentStatus, { label: string; color: string; icon: any }> = {
  pending: {
    label: "Awaiting Payment",
    color: "bg-yellow-100 text-yellow-700",
    icon: HiOutlineClock,
  },
  confirmed: {
    label: "Payment Confirmed",
    color: "bg-green-100 text-green-700",
    icon: HiOutlineCheckCircle,
  },
  partial: {
    label: "Partial Payment",
    color: "bg-orange-100 text-orange-700",
    icon: HiOutlineCurrencyDollar,
  },
  failed: {
    label: "Payment Failed",
    color: "bg-red-100 text-red-700",
    icon: HiOutlineX,
  },
};

export default function PaymentConfirmationPage() {
  const [payments, setPayments] = useState<PaymentConfirmation[]>(initialPayments);
  const [search, setSearch] = useState("");
  const [selectedPayment, setSelectedPayment] = useState<PaymentConfirmation | null>(null);
  const [showModal, setShowModal] = useState(false);
  const [confirmForm, setConfirmForm] = useState({
    paidAmount: "",
    paymentMethod: "",
    transactionRef: "",
    notes: "",
  });

  const filtered = payments.filter(
    (pay) =>
      pay.id.toLowerCase().includes(search.toLowerCase()) ||
      pay.client.toLowerCase().includes(search.toLowerCase()) ||
      pay.jobId.toLowerCase().includes(search.toLowerCase())
  );

  const handleConfirmPayment = (payId: string) => {
    if (!confirmForm.paidAmount || !confirmForm.paymentMethod || !confirmForm.transactionRef) {
      alert("Please fill in all required fields");
      return;
    }

    const payment = payments.find((p) => p.id === payId);
    if (!payment) return;

    const paidAmount = parseFloat(confirmForm.paidAmount.replace(/,/g, ""));
    const totalAmount = parseFloat(payment.totalAmount.replace(/,/g, ""));
    const status: PaymentStatus = paidAmount >= totalAmount ? "confirmed" : "partial";

    setPayments(
      payments.map((pay) =>
        pay.id === payId
          ? {
              ...pay,
              paidAmount: confirmForm.paidAmount,
              paymentMethod: confirmForm.paymentMethod,
              transactionRef: confirmForm.transactionRef,
              status: status,
              confirmedDate: new Date().toISOString().split("T")[0],
              confirmedBy: "Finance Officer",
              notes: confirmForm.notes || undefined,
            }
          : pay
      )
    );

    setShowModal(false);
    setSelectedPayment(null);
    setConfirmForm({
      paidAmount: "",
      paymentMethod: "",
      transactionRef: "",
      notes: "",
    });
  };

  const pendingCount = payments.filter((p) => p.status === "pending").length;
  const totalPending = payments
    .filter((p) => p.status === "pending")
    .reduce((sum, p) => sum + parseFloat(p.totalAmount.replace(/,/g, "")), 0);

  return (
    <DashboardLayout userRole="daf" userName="DAF" notificationCount={pendingCount}>
      <div className="space-y-6 font-[family-name:var(--font-family-primary)]">
        {/* Header */}
        <div>
          <h1 className="text-2xl md:text-3xl font-bold text-secondary-100">
            Payment Confirmations
          </h1>
          <p className="text-sm text-custom-700 mt-1">
            Verify and confirm client payments before production starts
          </p>
        </div>

        {/* Summary Cards */}
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
          <Card className="!p-4">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-xl bg-yellow-100 flex items-center justify-center">
                <HiOutlineClock className="w-5 h-5 text-yellow-600" />
              </div>
              <div>
                <p className="text-xs text-custom-700">Pending</p>
                <p className="text-2xl font-bold text-secondary-100">{pendingCount}</p>
              </div>
            </div>
          </Card>
          <Card className="!p-4">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-xl bg-green-100 flex items-center justify-center">
                <HiOutlineCheckCircle className="w-5 h-5 text-green-600" />
              </div>
              <div>
                <p className="text-xs text-custom-700">Confirmed</p>
                <p className="text-2xl font-bold text-secondary-100">
                  {payments.filter((p) => p.status === "confirmed").length}
                </p>
              </div>
            </div>
          </Card>
          <Card className="!p-4">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-xl bg-orange-100 flex items-center justify-center">
                <HiOutlineCurrencyDollar className="w-5 h-5 text-orange-600" />
              </div>
              <div>
                <p className="text-xs text-custom-700">Partial</p>
                <p className="text-2xl font-bold text-secondary-100">
                  {payments.filter((p) => p.status === "partial").length}
                </p>
              </div>
            </div>
          </Card>
          <Card className="!p-4">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-xl bg-primary-100 flex items-center justify-center">
                <HiOutlineCurrencyDollar className="w-5 h-5 text-primary-600" />
              </div>
              <div>
                <p className="text-xs text-custom-700">Pending Amount</p>
                <p className="text-lg font-bold text-secondary-100">
                  {totalPending.toLocaleString()} RWF
                </p>
              </div>
            </div>
          </Card>
        </div>

        {/* Payments List */}
        <Card className="!p-6">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 mb-5">
            <h2 className="text-lg font-bold text-secondary-100">All Payments</h2>
            <div className="relative w-full sm:w-64">
              <HiOutlineSearch className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-custom-700" />
              <input
                type="text"
                placeholder="Search payments..."
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                className="w-full pl-9 pr-4 py-2 rounded-xl border border-custom-300 bg-style-500 text-secondary-100 text-sm placeholder:text-custom-700 focus:outline-none focus:border-primary-400 focus:ring-2 focus:ring-primary-200 transition-colors duration-200"
              />
            </div>
          </div>

          <div className="space-y-3">
            {filtered.map((payment) => {
              const config = statusConfig[payment.status];
              const Icon = config.icon;

              return (
                <div
                  key={payment.id}
                  className="p-4 rounded-xl border-2 border-custom-300 hover:border-primary-400 hover:shadow-md transition-all"
                >
                  <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-4">
                    <div className="flex-1 space-y-2">
                      <div className="flex flex-wrap items-center gap-2">
                        <span className="text-base font-bold text-primary-500">{payment.id}</span>
                        <span className="text-sm text-custom-700">•</span>
                        <span className="text-sm font-bold text-secondary-100">{payment.jobId}</span>
                        <span
                          className={`text-xs font-semibold px-3 py-1 rounded-full ${config.color} flex items-center gap-1`}
                        >
                          <Icon className="w-3 h-3" />
                          {config.label}
                        </span>
                      </div>
                      <p className="text-sm font-semibold text-secondary-100">{payment.client}</p>
                      <div className="flex flex-wrap gap-4 text-xs text-custom-700">
                        <span className="font-bold text-primary-600">
                          Total: {payment.totalAmount} RWF
                        </span>
                        {payment.paidAmount && (
                          <>
                            <span>•</span>
                            <span>Paid: {payment.paidAmount} RWF</span>
                          </>
                        )}
                        <span>•</span>
                        <span>Due: {payment.dueDate}</span>
                        {payment.paymentMethod && (
                          <>
                            <span>•</span>
                            <span>Method: {payment.paymentMethod}</span>
                          </>
                        )}
                      </div>
                      {payment.transactionRef && (
                        <div className="text-xs bg-custom-50 p-2 rounded-lg">
                          <strong>Transaction Ref:</strong> {payment.transactionRef}
                        </div>
                      )}
                      {payment.notes && (
                        <div className="text-xs bg-yellow-50 p-2 rounded-lg border border-yellow-200">
                          <strong>Notes:</strong> {payment.notes}
                        </div>
                      )}
                    </div>
                    <div className="flex gap-2">
                      {payment.status === "pending" && (
                        <button
                          onClick={() => {
                            setSelectedPayment(payment);
                            setShowModal(true);
                          }}
                          className="px-4 py-2 rounded-xl bg-green-500 text-white hover:bg-green-600 transition-colors text-sm font-semibold"
                        >
                          Confirm Payment
                        </button>
                      )}
                      {payment.status === "confirmed" && (
                        <button
                          className="px-4 py-2 rounded-xl border border-custom-300 text-custom-700 hover:bg-custom-100 transition-colors text-sm font-semibold flex items-center gap-1"
                        >
                          <HiOutlineDocumentText className="w-4 h-4" />
                          View Receipt
                        </button>
                      )}
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        </Card>

        {/* Confirm Payment Modal */}
        {showModal && selectedPayment && (
          <div className="fixed inset-0 bg-secondary-100/50 z-50 flex items-center justify-center p-4">
            <Card className="!p-6 max-w-2xl w-full max-h-[90vh] overflow-y-auto">
              <div className="flex items-start justify-between mb-4">
                <div>
                  <h3 className="text-xl font-bold text-secondary-100">Confirm Payment</h3>
                  <p className="text-sm text-custom-700 mt-1">
                    {selectedPayment.id} - {selectedPayment.client}
                  </p>
                  <p className="text-lg font-bold text-primary-600 mt-2">
                    Total Amount: {selectedPayment.totalAmount} RWF
                  </p>
                </div>
                <button
                  onClick={() => {
                    setShowModal(false);
                    setConfirmForm({
                      paidAmount: "",
                      paymentMethod: "",
                      transactionRef: "",
                      notes: "",
                    });
                  }}
                  className="text-custom-700 hover:text-secondary-100 text-2xl"
                >
                  <HiOutlineX className="w-6 h-6" />
                </button>
              </div>

              <div className="space-y-4">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-semibold text-custom-700 mb-2">
                      Paid Amount (RWF) *
                    </label>
                    <input
                      type="text"
                      value={confirmForm.paidAmount}
                      onChange={(e) =>
                        setConfirmForm({ ...confirmForm, paidAmount: e.target.value })
                      }
                      placeholder="1,003,000"
                      className="w-full px-4 py-2 rounded-xl border border-custom-300 focus:outline-none focus:border-primary-500"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-semibold text-custom-700 mb-2">
                      Payment Method *
                    </label>
                    <select
                      value={confirmForm.paymentMethod}
                      onChange={(e) =>
                        setConfirmForm({ ...confirmForm, paymentMethod: e.target.value })
                      }
                      className="w-full px-4 py-2 rounded-xl border border-custom-300 focus:outline-none focus:border-primary-500"
                    >
                      <option value="">Select method...</option>
                      <option value="Bank Transfer">Bank Transfer</option>
                      <option value="Mobile Money">Mobile Money</option>
                      <option value="Cash">Cash</option>
                      <option value="Cheque">Cheque</option>
                    </select>
                  </div>
                </div>

                <div>
                  <label className="block text-sm font-semibold text-custom-700 mb-2">
                    Transaction Reference *
                  </label>
                  <input
                    type="text"
                    value={confirmForm.transactionRef}
                    onChange={(e) =>
                      setConfirmForm({ ...confirmForm, transactionRef: e.target.value })
                    }
                    placeholder="TXN-20260430-001"
                    className="w-full px-4 py-2 rounded-xl border border-custom-300 focus:outline-none focus:border-primary-500"
                  />
                </div>

                <div>
                  <label className="block text-sm font-semibold text-custom-700 mb-2">
                    Notes (Optional)
                  </label>
                  <textarea
                    value={confirmForm.notes}
                    onChange={(e) => setConfirmForm({ ...confirmForm, notes: e.target.value })}
                    placeholder="Additional payment details or notes..."
                    rows={3}
                    className="w-full px-4 py-2 rounded-xl border border-custom-300 focus:outline-none focus:border-primary-500 resize-none"
                  />
                </div>
              </div>

              <div className="flex gap-3 mt-6">
                <button
                  onClick={() => {
                    setShowModal(false);
                    setConfirmForm({
                      paidAmount: "",
                      paymentMethod: "",
                      transactionRef: "",
                      notes: "",
                    });
                  }}
                  className="flex-1 px-4 py-2 rounded-xl border border-custom-300 hover:bg-custom-100 transition-colors text-sm font-semibold text-custom-700"
                >
                  Cancel
                </button>
                <button
                  onClick={() => handleConfirmPayment(selectedPayment.id)}
                  className="flex-1 px-4 py-2 rounded-xl bg-green-500 text-white hover:bg-green-600 transition-colors text-sm font-semibold"
                >
                  <HiOutlineCheckCircle className="w-4 h-4 inline mr-2" />
                  Confirm Payment
                </button>
              </div>
            </Card>
          </div>
        )}
      </div>
    </DashboardLayout>
  );
}
