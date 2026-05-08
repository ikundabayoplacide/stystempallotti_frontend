import { useState } from "react";
import {
    HiOutlineCheckCircle,
    HiOutlineClipboardList,
    HiOutlineClock,
    HiOutlineCurrencyDollar,
    HiOutlineDocumentText,
    HiOutlinePlusCircle,
    HiOutlineSearch,
    HiOutlineX,
} from "react-icons/hi";
import { Button, Card } from "../../components/ui";

type QuotationStatus = "draft" | "sent" | "awaiting-client" | "approved" | "rejected";

interface Quotation {
  id: string;
  jobId: string;
  client: string;
  clientPhone: string;
  clientEmail?: string;
  service: string;
  quantity: number;
  quotationAmount: string;
  status: QuotationStatus;
  createdAt: string;
  deadline: string;
  specifications?: string;
}

const kpis = [
  {
    label: "Pending Quotations",
    value: "8",
    icon: HiOutlineDocumentText,
    color: "text-yellow-600",
    bg: "bg-yellow-100",
  },
  {
    label: "Approved Today",
    value: "5",
    icon: HiOutlineCheckCircle,
    color: "text-green-600",
    bg: "bg-green-100",
  },
  {
    label: "Awaiting Client",
    value: "12",
    icon: HiOutlineClock,
    color: "text-primary-500",
    bg: "bg-primary-100",
  },
  {
    label: "Total Value (RWF)",
    value: "3,500,000",
    icon: HiOutlineCurrencyDollar,
    color: "text-primary-600",
    bg: "bg-primary-100",
  },
];

const initialQuotations: Quotation[] = [
  {
    id: "QUOT-001",
    jobId: "JOB-001",
    client: "ABC Corp",
    clientPhone: "+250 788 123 456",
    clientEmail: "contact@abccorp.rw",
    service: "Offset Printing",
    quantity: 500,
    quotationAmount: "850,000",
    status: "approved",
    createdAt: "2026-04-28",
    deadline: "2026-05-02",
  },
  {
    id: "QUOT-002",
    jobId: "JOB-002",
    client: "XYZ Ltd",
    clientPhone: "+250 788 234 567",
    service: "Binding",
    quantity: 200,
    quotationAmount: "120,000",
    status: "awaiting-client",
    createdAt: "2026-04-29",
    deadline: "2026-05-01",
  },
  {
    id: "QUOT-003",
    jobId: "JOB-008",
    client: "Tech Startup",
    clientPhone: "+250 788 345 678",
    clientEmail: "info@techstartup.rw",
    service: "Digital Printing",
    quantity: 1000,
    quotationAmount: "450,000",
    status: "sent",
    createdAt: "2026-04-30",
    deadline: "2026-05-05",
  },
];

const statusConfig: Record<QuotationStatus, { label: string; color: string }> = {
  draft: { label: "Draft", color: "bg-gray-100 text-gray-700" },
  sent: { label: "Quotation Sent", color: "bg-yellow-100 text-yellow-700" },
  "awaiting-client": { label: "Awaiting Client", color: "bg-primary-100 text-primary-700" },
  approved: { label: "Approved", color: "bg-green-100 text-green-700" },
  rejected: { label: "Rejected", color: "bg-red-100 text-red-700" },
};

export default function SalesDashboard() {
  const [quotations, setQuotations] = useState<Quotation[]>(initialQuotations);
  const [search, setSearch] = useState("");
  const [showQuotationModal, setShowQuotationModal] = useState(false);
  const [selectedQuotation, setSelectedQuotation] = useState<Quotation | null>(null);
  const [showNewQuotationModal, setShowNewQuotationModal] = useState(false);
  const [newQuotationForm, setNewQuotationForm] = useState({
    client: "",
    clientPhone: "",
    clientEmail: "",
    service: "",
    quantity: "",
    quotationAmount: "",
    deadline: "",
    specifications: "",
  });

  const filtered = quotations.filter(
    (q) =>
      q.jobId.toLowerCase().includes(search.toLowerCase()) ||
      q.client.toLowerCase().includes(search.toLowerCase()) ||
      q.id.toLowerCase().includes(search.toLowerCase())
  );

  const handleCreateQuotation = () => {
    if (!newQuotationForm.client || !newQuotationForm.clientPhone || !newQuotationForm.service || !newQuotationForm.quantity || !newQuotationForm.quotationAmount || !newQuotationForm.deadline) {
      alert("Please fill in all required fields");
      return;
    }

    const newQuotation: Quotation = {
      id: `QUOT-${String(quotations.length + 1).padStart(3, "0")}`,
      jobId: `JOB-${String(quotations.length + 1).padStart(3, "0")}`,
      client: newQuotationForm.client,
      clientPhone: newQuotationForm.clientPhone,
      clientEmail: newQuotationForm.clientEmail || undefined,
      service: newQuotationForm.service,
      quantity: Number(newQuotationForm.quantity),
      quotationAmount: newQuotationForm.quotationAmount,
      status: "draft",
      createdAt: new Date().toISOString().split("T")[0],
      deadline: newQuotationForm.deadline,
      specifications: newQuotationForm.specifications || undefined,
    };

    setQuotations([newQuotation, ...quotations]);
    setShowNewQuotationModal(false);
    setNewQuotationForm({
      client: "",
      clientPhone: "",
      clientEmail: "",
      service: "",
      quantity: "",
      quotationAmount: "",
      deadline: "",
      specifications: "",
    });
  };

  const handleStatusChange = (quotId: string, newStatus: QuotationStatus) => {
    setQuotations(
      quotations.map((q) =>
        q.id === quotId ? { ...q, status: newStatus } : q
      )
    );
  };

  return (
    <div className="space-y-6 font-[family-name:var(--font-family-primary)]">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
        <div>
          <h1 className="text-3xl md:text-4xl font-bold text-secondary-100">
            Sales Officer Dashboard
          </h1>
          <p className="text-sm text-custom-700 mt-1">
            Manage quotations, job registration, and client communication
          </p>
        </div>
        <Button
          size="sm"
          onClick={() => setShowNewQuotationModal(true)}
          className="flex items-center gap-2 self-start sm:self-auto"
        >
          <HiOutlinePlusCircle className="w-4 h-4" />
          New Quotation
        </Button>
      </div>

      {/* KPI Grid */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
        {kpis.map(({ label, value, icon: Icon, color, bg }) => (
          <Card key={label} hoverable className="!p-5 transition-all hover:shadow-lg">
            <div className={`w-12 h-12 rounded-xl flex items-center justify-center ${bg} shadow-sm mb-3`}>
              <Icon className={`w-6 h-6 ${color}`} />
            </div>
            <div>
              <p className="text-3xl font-bold text-secondary-100 mb-1">{value}</p>
              <p className="text-xs text-custom-700 font-semibold">{label}</p>
            </div>
          </Card>
        ))}
      </div>

      {/* Quotations List */}
      <Card className="!p-0 overflow-hidden">
        <div className="p-4 bg-custom-100 border-b border-custom-300">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-xl bg-primary-100 flex items-center justify-center">
                <HiOutlineClipboardList className="w-5 h-5 text-primary-500" />
              </div>
              <div>
                <h2 className="text-lg font-bold text-secondary-100">Job Quotations</h2>
                <p className="text-xs text-custom-700">{quotations.length} total quotations</p>
              </div>
            </div>
            {/* Search */}
            <div className="relative w-full sm:w-64">
              <HiOutlineSearch className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-custom-700" />
              <input
                type="text"
                placeholder="Search job or client..."
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
                  Quotation ID
                </th>
                <th className="px-4 py-3 text-left text-xs font-bold text-secondary-100 uppercase">
                  Job ID
                </th>
                <th className="px-4 py-3 text-left text-xs font-bold text-secondary-100 uppercase">
                  Client
                </th>
                <th className="px-4 py-3 text-left text-xs font-bold text-secondary-100 uppercase">
                  Service
                </th>
                <th className="px-4 py-3 text-left text-xs font-bold text-secondary-100 uppercase">
                  Quantity
                </th>
                <th className="px-4 py-3 text-left text-xs font-bold text-secondary-100 uppercase">
                  Amount
                </th>
                <th className="px-4 py-3 text-left text-xs font-bold text-secondary-100 uppercase">
                  Status
                </th>
                <th className="px-4 py-3 text-left text-xs font-bold text-secondary-100 uppercase">
                  Deadline
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
                    No quotations found
                  </td>
                </tr>
              ) : (
                filtered.map((quot) => {
                  const config = statusConfig[quot.status];
                  return (
                    <tr key={quot.id} className="hover:bg-custom-50 transition-colors">
                      <td className="px-4 py-4">
                        <span className="text-sm font-bold text-primary-600">{quot.id}</span>
                      </td>
                      <td className="px-4 py-4">
                        <span className="text-sm font-bold text-secondary-100">{quot.jobId}</span>
                      </td>
                      <td className="px-4 py-4">
                        <div>
                          <p className="text-sm font-semibold text-secondary-100">{quot.client}</p>
                          <p className="text-xs text-custom-700">{quot.clientPhone}</p>
                        </div>
                      </td>
                      <td className="px-4 py-4">
                        <span className="text-sm text-secondary-100">{quot.service}</span>
                      </td>
                      <td className="px-4 py-4">
                        <span className="text-sm text-secondary-100">{quot.quantity}</span>
                      </td>
                      <td className="px-4 py-4">
                        <span className="text-sm font-bold text-primary-600">
                          {quot.quotationAmount} RWF
                        </span>
                      </td>
                      <td className="px-4 py-4">
                        <span className={`text-xs font-bold px-3 py-1 rounded-full ${config.color}`}>
                          {config.label}
                        </span>
                      </td>
                      <td className="px-4 py-4">
                        <span className="text-sm text-custom-700">{quot.deadline}</span>
                      </td>
                      <td className="px-4 py-4">
                        <div className="flex items-center justify-end gap-2">
                          <button
                            onClick={() => {
                              setSelectedQuotation(quot);
                              setShowQuotationModal(true);
                            }}
                            className="px-3 py-1.5 rounded-lg border border-custom-300 text-custom-700 hover:bg-custom-100 transition-colors text-xs font-semibold"
                          >
                            View
                          </button>
                          {quot.status === "draft" && (
                            <button
                              onClick={(e) => {
                                e.stopPropagation();
                                handleStatusChange(quot.id, "sent");
                              }}
                              className="px-3 py-1.5 rounded-lg bg-primary-500 text-white hover:bg-primary-600 transition-colors text-xs font-semibold"
                            >
                              Send
                            </button>
                          )}
                          {(quot.status === "sent" || quot.status === "awaiting-client") && (
                            <>
                              <button
                                onClick={(e) => {
                                  e.stopPropagation();
                                  handleStatusChange(quot.id, "approved");
                                }}
                                className="px-3 py-1.5 rounded-lg bg-green-500 text-white hover:bg-green-600 transition-colors text-xs font-semibold"
                              >
                                Approve
                              </button>
                              <button
                                onClick={(e) => {
                                  e.stopPropagation();
                                  handleStatusChange(quot.id, "rejected");
                                }}
                                className="px-3 py-1.5 rounded-lg border border-red-300 text-red-600 hover:bg-red-50 transition-colors text-xs font-semibold"
                              >
                                Reject
                              </button>
                            </>
                          )}
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

      {/* New Quotation Modal */}
      {showNewQuotationModal && (
        <div className="fixed inset-0 bg-secondary-100/50 z-50 flex items-center justify-center p-4">
          <Card className="!p-6 max-w-3xl w-full max-h-[90vh] overflow-y-auto">
            <div className="flex items-center justify-between mb-6">
              <div>
                <h3 className="text-2xl font-bold text-secondary-100">
                  Create New Quotation
                </h3>
                <p className="text-sm text-custom-700 mt-1">
                  Generate quotation for client order
                </p>
              </div>
              <button
                onClick={() => setShowNewQuotationModal(false)}
                className="text-custom-700 hover:text-secondary-100 text-2xl"
              >
                <HiOutlineX className="w-6 h-6" />
              </button>
            </div>

            <div className="space-y-6">
              {/* Client Information */}
              <div className="p-4 rounded-xl bg-custom-50 border border-custom-200">
                <h4 className="text-sm font-bold text-secondary-100 uppercase tracking-wide mb-4">
                  Client Information
                </h4>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div className="md:col-span-2">
                    <label className="block text-sm font-semibold text-custom-700 mb-2">
                      Client Name *
                    </label>
                    <input
                      type="text"
                      value={newQuotationForm.client}
                      onChange={(e) =>
                        setNewQuotationForm({ ...newQuotationForm, client: e.target.value })
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
                      value={newQuotationForm.clientPhone}
                      onChange={(e) =>
                        setNewQuotationForm({ ...newQuotationForm, clientPhone: e.target.value })
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
                      value={newQuotationForm.clientEmail}
                      onChange={(e) =>
                        setNewQuotationForm({ ...newQuotationForm, clientEmail: e.target.value })
                      }
                      placeholder="client@example.com"
                      className="w-full px-4 py-2 rounded-xl border border-custom-300 focus:outline-none focus:border-primary-500"
                    />
                  </div>
                </div>
              </div>

              {/* Job Details */}
              <div className="p-4 rounded-xl bg-custom-50 border border-custom-200">
                <h4 className="text-sm font-bold text-secondary-100 uppercase tracking-wide mb-4">
                  Job & Quotation Details
                </h4>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-semibold text-custom-700 mb-2">
                      Service Type *
                    </label>
                    <select
                      value={newQuotationForm.service}
                      onChange={(e) =>
                        setNewQuotationForm({ ...newQuotationForm, service: e.target.value })
                      }
                      className="w-full px-4 py-2 rounded-xl border border-custom-300 focus:outline-none focus:border-primary-500"
                    >
                      <option value="">Select service...</option>
                      <option value="Composition">Composition</option>
                      <option value="Montage">Montage</option>
                      <option value="Offset Printing">Offset Printing</option>
                      <option value="Digital Printing">Digital Printing</option>
                      <option value="Binding">Binding</option>
                      <option value="Packaging">Packaging</option>
                    </select>
                  </div>
                  <div>
                    <label className="block text-sm font-semibold text-custom-700 mb-2">
                      Quantity *
                    </label>
                    <input
                      type="number"
                      value={newQuotationForm.quantity}
                      onChange={(e) =>
                        setNewQuotationForm({ ...newQuotationForm, quantity: e.target.value })
                      }
                      placeholder="Enter quantity"
                      min="1"
                      className="w-full px-4 py-2 rounded-xl border border-custom-300 focus:outline-none focus:border-primary-500"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-semibold text-custom-700 mb-2">
                      Quotation Amount (RWF) *
                    </label>
                    <input
                      type="text"
                      value={newQuotationForm.quotationAmount}
                      onChange={(e) =>
                        setNewQuotationForm({ ...newQuotationForm, quotationAmount: e.target.value })
                      }
                      placeholder="e.g., 850,000"
                      className="w-full px-4 py-2 rounded-xl border border-custom-300 focus:outline-none focus:border-primary-500"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-semibold text-custom-700 mb-2">
                      Deadline *
                    </label>
                    <input
                      type="date"
                      value={newQuotationForm.deadline}
                      onChange={(e) =>
                        setNewQuotationForm({ ...newQuotationForm, deadline: e.target.value })
                      }
                      className="w-full px-4 py-2 rounded-xl border border-custom-300 focus:outline-none focus:border-primary-500"
                    />
                  </div>
                  <div className="md:col-span-2">
                    <label className="block text-sm font-semibold text-custom-700 mb-2">
                      Specifications (Optional)
                    </label>
                    <textarea
                      value={newQuotationForm.specifications}
                      onChange={(e) =>
                        setNewQuotationForm({ ...newQuotationForm, specifications: e.target.value })
                      }
                      placeholder="Enter job specifications..."
                      rows={3}
                      className="w-full px-4 py-2 rounded-xl border border-custom-300 focus:outline-none focus:border-primary-500 resize-none"
                    />
                  </div>
                </div>
              </div>
            </div>

            <div className="flex gap-3 mt-6">
              <button
                onClick={() => setShowNewQuotationModal(false)}
                className="flex-1 px-4 py-2 rounded-xl border border-custom-300 hover:bg-custom-100 transition-colors text-sm font-semibold text-custom-700"
              >
                Cancel
              </button>
              <button
                onClick={handleCreateQuotation}
                className="flex-1 px-4 py-2 rounded-xl bg-primary-500 text-white hover:bg-primary-600 transition-colors text-sm font-semibold"
              >
                Create Quotation
              </button>
            </div>
          </Card>
        </div>
      )}

      {/* View Quotation Modal */}
      {showQuotationModal && selectedQuotation && (
        <div className="fixed inset-0 bg-secondary-100/50 z-50 flex items-center justify-center p-4">
          <Card className="!p-6 max-w-2xl w-full max-h-[90vh] overflow-y-auto">
            <div className="flex items-start justify-between mb-4">
              <div>
                <h3 className="text-xl font-bold text-secondary-100">
                  {selectedQuotation.id}
                </h3>
                <p className="text-sm text-custom-700 mt-1">Job ID: {selectedQuotation.jobId}</p>
                <span
                  className={`inline-block mt-2 text-xs font-bold px-3 py-1 rounded-full ${
                    statusConfig[selectedQuotation.status].color
                  }`}
                >
                  {statusConfig[selectedQuotation.status].label}
                </span>
              </div>
              <button
                onClick={() => setShowQuotationModal(false)}
                className="text-custom-700 hover:text-secondary-100 text-2xl"
              >
                <HiOutlineX className="w-6 h-6" />
              </button>
            </div>

            <div className="space-y-4">
              <div>
                <p className="text-sm font-semibold text-custom-700 mb-1">Client</p>
                <p className="text-base text-secondary-100 font-bold">{selectedQuotation.client}</p>
                <p className="text-sm text-custom-700">{selectedQuotation.clientPhone}</p>
                {selectedQuotation.clientEmail && (
                  <p className="text-sm text-custom-700">{selectedQuotation.clientEmail}</p>
                )}
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <p className="text-sm font-semibold text-custom-700 mb-1">Service</p>
                  <p className="text-base text-secondary-100">{selectedQuotation.service}</p>
                </div>
                <div>
                  <p className="text-sm font-semibold text-custom-700 mb-1">Quantity</p>
                  <p className="text-base text-secondary-100">{selectedQuotation.quantity}</p>
                </div>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <p className="text-sm font-semibold text-custom-700 mb-1">Quotation Amount</p>
                  <p className="text-xl font-bold text-primary-600">{selectedQuotation.quotationAmount} RWF</p>
                </div>
                <div>
                  <p className="text-sm font-semibold text-custom-700 mb-1">Deadline</p>
                  <p className="text-base text-secondary-100">{selectedQuotation.deadline}</p>
                </div>
              </div>

              {selectedQuotation.specifications && (
                <div>
                  <p className="text-sm font-semibold text-custom-700 mb-1">Specifications</p>
                  <p className="text-base text-secondary-100">{selectedQuotation.specifications}</p>
                </div>
              )}

              <div>
                <p className="text-sm font-semibold text-custom-700 mb-1">Created</p>
                <p className="text-base text-secondary-100">{selectedQuotation.createdAt}</p>
              </div>
            </div>

            <div className="flex gap-3 mt-6">
              <button
                onClick={() => setShowQuotationModal(false)}
                className="flex-1 px-4 py-2 rounded-xl border border-custom-300 hover:bg-custom-100 transition-colors text-sm font-semibold text-custom-700"
              >
                Close
              </button>
              <button
                onClick={() => alert("Print/Download functionality coming soon")}
                className="flex-1 px-4 py-2 rounded-xl bg-primary-500 text-white hover:bg-primary-600 transition-colors text-sm font-semibold"
              >
                <HiOutlineDocumentText className="w-4 h-4 inline mr-2" />
                Generate PDF
              </button>
            </div>
          </Card>
        </div>
      )}
    </div>
  );
}
