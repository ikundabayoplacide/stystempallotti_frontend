import { useState } from "react";
import {
    HiOutlineCheckCircle,
    HiOutlineClock,
    HiOutlineDocumentText,
    HiOutlineEye,
    HiOutlinePlus,
    HiOutlineSearch,
    HiOutlineX,
    HiOutlineXCircle,
} from "react-icons/hi";
import { DashboardLayout } from "../../components";
import { Button, Card } from "../../components/ui";

type QuotationStatus = "draft" | "sent" | "accepted" | "rejected" | "expired";

interface QuotationItem {
  description: string;
  quantity: number;
  unitPrice: number;
  total: number;
}

interface Quotation {
  id: string;
  clientName: string;
  clientCompany: string;
  items: QuotationItem[];
  subtotal: number;
  tax: number;
  total: number;
  validUntil: string;
  createdDate: string;
  status: QuotationStatus;
  notes?: string;
}

const initialQuotations: Quotation[] = [
  {
    id: "QUO-001",
    clientName: "John Mugisha",
    clientCompany: "ABC Corporation",
    items: [
      { description: "Brochure Printing (A4, Full Color)", quantity: 500, unitPrice: 1500, total: 750000 },
      { description: "Business Cards (Premium)", quantity: 1000, unitPrice: 500, total: 500000 },
    ],
    subtotal: 1250000,
    tax: 225000,
    total: 1475000,
    validUntil: "2026-05-15",
    createdDate: "2026-05-01",
    status: "sent",
  },
  {
    id: "QUO-002",
    clientName: "Sarah Uwase",
    clientCompany: "Tech Startup Ltd",
    items: [
      { description: "Poster Printing (A3, Glossy)", quantity: 200, unitPrice: 2000, total: 400000 },
    ],
    subtotal: 400000,
    tax: 72000,
    total: 472000,
    validUntil: "2026-05-10",
    createdDate: "2026-04-28",
    status: "accepted",
  },
  {
    id: "QUO-003",
    clientName: "David Nkusi",
    clientCompany: "Personal",
    items: [
      { description: "Flyer Printing (A5, Color)", quantity: 1000, unitPrice: 300, total: 300000 },
      { description: "Binding Service", quantity: 50, unitPrice: 1000, total: 50000 },
    ],
    subtotal: 350000,
    tax: 63000,
    total: 413000,
    validUntil: "2026-05-08",
    createdDate: "2026-04-25",
    status: "draft",
  },
];

const statusConfig: Record<
  QuotationStatus,
  { label: string; color: string; icon: any; bgColor: string }
> = {
  draft: {
    label: "Draft",
    color: "text-gray-600",
    icon: HiOutlineDocumentText,
    bgColor: "bg-gray-100",
  },
  sent: {
    label: "Sent",
    color: "text-blue-600",
    icon: HiOutlineClock,
    bgColor: "bg-blue-100",
  },
  accepted: {
    label: "Accepted",
    color: "text-green-600",
    icon: HiOutlineCheckCircle,
    bgColor: "bg-green-100",
  },
  rejected: {
    label: "Rejected",
    color: "text-red-600",
    icon: HiOutlineXCircle,
    bgColor: "bg-red-100",
  },
  expired: {
    label: "Expired",
    color: "text-orange-600",
    icon: HiOutlineClock,
    bgColor: "bg-orange-100",
  },
};

export default function QuotationsPage() {
  const [quotations] = useState<Quotation[]>(initialQuotations);
  const [search, setSearch] = useState("");
  const [filter, setFilter] = useState<"all" | QuotationStatus>("all");
  const [selectedQuotation, setSelectedQuotation] = useState<Quotation | null>(null);
  const [showDetailsModal, setShowDetailsModal] = useState(false);

  const filteredQuotations =
    filter === "all" ? quotations : quotations.filter((q) => q.status === filter);

  const searchedQuotations = filteredQuotations.filter(
    (q) =>
      q.id.toLowerCase().includes(search.toLowerCase()) ||
      q.clientName.toLowerCase().includes(search.toLowerCase()) ||
      q.clientCompany.toLowerCase().includes(search.toLowerCase())
  );

  const draftCount = quotations.filter((q) => q.status === "draft").length;
  const sentCount = quotations.filter((q) => q.status === "sent").length;
  const acceptedCount = quotations.filter((q) => q.status === "accepted").length;
  const totalValue = quotations
    .filter((q) => q.status === "accepted")
    .reduce((sum, q) => sum + q.total, 0);

  return (
    <DashboardLayout userRole="sales" userName="Sales Officer" notificationCount={sentCount}>
      <div className="space-y-6 font-[family-name:var(--font-family-primary)]">
        {/* Header */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
          <div>
            <h1 className="text-2xl md:text-3xl font-bold text-secondary-100">
              Quotations
            </h1>
            <p className="text-sm text-custom-700 mt-1">
              Create and manage client quotations
            </p>
          </div>
          <button
            onClick={() => alert("Create new quotation functionality")}
            className="px-4 py-2 rounded-xl bg-primary-500 text-white font-semibold hover:bg-primary-600 transition-colors text-sm flex items-center gap-2 w-fit"
          >
            <HiOutlinePlus className="w-4 h-4" />
            New Quotation
          </button>
        </div>

        {/* KPI Cards */}
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
          <Card className="!p-4">
            <div className="flex items-center gap-3 mb-2">
              <div className="w-10 h-10 rounded-xl bg-primary-100 flex items-center justify-center">
                <HiOutlineDocumentText className="w-5 h-5 text-primary-600" />
              </div>
            </div>
            <p className="text-2xl font-bold text-secondary-100">{quotations.length}</p>
            <p className="text-xs text-custom-700">Total Quotations</p>
          </Card>
          <Card className="!p-4">
            <div className="flex items-center gap-3 mb-2">
              <div className="w-10 h-10 rounded-xl bg-blue-100 flex items-center justify-center">
                <HiOutlineClock className="w-5 h-5 text-blue-600" />
              </div>
            </div>
            <p className="text-2xl font-bold text-secondary-100">{sentCount}</p>
            <p className="text-xs text-custom-700">Pending</p>
          </Card>
          <Card className="!p-4">
            <div className="flex items-center gap-3 mb-2">
              <div className="w-10 h-10 rounded-xl bg-green-100 flex items-center justify-center">
                <HiOutlineCheckCircle className="w-5 h-5 text-green-600" />
              </div>
            </div>
            <p className="text-2xl font-bold text-secondary-100">{acceptedCount}</p>
            <p className="text-xs text-custom-700">Accepted</p>
          </Card>
          <Card className="!p-4">
            <div className="flex items-center gap-3 mb-2">
              <div className="w-10 h-10 rounded-xl bg-yellow-100 flex items-center justify-center">
                <HiOutlineDocumentText className="w-5 h-5 text-yellow-600" />
              </div>
            </div>
            <p className="text-2xl font-bold text-secondary-100">
              {(totalValue / 1000000).toFixed(1)}M
            </p>
            <p className="text-xs text-custom-700">Accepted Value</p>
          </Card>
        </div>

        {/* Filters */}
        <Card className="!p-4">
          <div className="flex flex-col md:flex-row gap-3">
            <div className="relative flex-1">
              <HiOutlineSearch className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-custom-700" />
              <input
                type="text"
                placeholder="Search by ID, client name, or company..."
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                className="w-full pl-9 pr-4 py-2 rounded-xl border border-custom-300 bg-style-500 text-secondary-100 text-sm placeholder:text-custom-700 focus:outline-none focus:border-primary-400 focus:ring-2 focus:ring-primary-200 transition-colors duration-200"
              />
            </div>
            <div className="flex gap-2 overflow-x-auto">
              <button
                onClick={() => setFilter("all")}
                className={`px-4 py-2 rounded-xl transition-colors text-sm font-semibold whitespace-nowrap ${
                  filter === "all"
                    ? "bg-primary-500 text-white"
                    : "border border-custom-300 text-custom-700 hover:bg-custom-100"
                }`}
              >
                All ({quotations.length})
              </button>
              <button
                onClick={() => setFilter("draft")}
                className={`px-4 py-2 rounded-xl transition-colors text-sm font-semibold whitespace-nowrap ${
                  filter === "draft"
                    ? "bg-primary-500 text-white"
                    : "border border-custom-300 text-custom-700 hover:bg-custom-100"
                }`}
              >
                Draft ({draftCount})
              </button>
              <button
                onClick={() => setFilter("sent")}
                className={`px-4 py-2 rounded-xl transition-colors text-sm font-semibold whitespace-nowrap ${
                  filter === "sent"
                    ? "bg-primary-500 text-white"
                    : "border border-custom-300 text-custom-700 hover:bg-custom-100"
                }`}
              >
                Sent ({sentCount})
              </button>
              <button
                onClick={() => setFilter("accepted")}
                className={`px-4 py-2 rounded-xl transition-colors text-sm font-semibold whitespace-nowrap ${
                  filter === "accepted"
                    ? "bg-primary-500 text-white"
                    : "border border-custom-300 text-custom-700 hover:bg-custom-100"
                }`}
              >
                Accepted ({acceptedCount})
              </button>
            </div>
          </div>
        </Card>

        {/* Quotations Table */}
        <Card className="!p-0 overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead className="bg-custom-100 border-b border-custom-300">
                <tr>
                  <th className="px-4 py-3 text-left text-xs font-bold text-secondary-100 uppercase">
                    Quotation ID
                  </th>
                  <th className="px-4 py-3 text-left text-xs font-bold text-secondary-100 uppercase">
                    Client
                  </th>
                  <th className="px-4 py-3 text-left text-xs font-bold text-secondary-100 uppercase">
                    Items
                  </th>
                  <th className="px-4 py-3 text-left text-xs font-bold text-secondary-100 uppercase">
                    Total Amount
                  </th>
                  <th className="px-4 py-3 text-left text-xs font-bold text-secondary-100 uppercase">
                    Status
                  </th>
                  <th className="px-4 py-3 text-left text-xs font-bold text-secondary-100 uppercase">
                    Valid Until
                  </th>
                  <th className="px-4 py-3 text-left text-xs font-bold text-secondary-100 uppercase">
                    Created
                  </th>
                  <th className="px-4 py-3 text-right text-xs font-bold text-secondary-100 uppercase">
                    Actions
                  </th>
                </tr>
              </thead>
              <tbody className="bg-white divide-y divide-custom-200">
                {searchedQuotations.length === 0 ? (
                  <tr>
                    <td colSpan={8} className="px-4 py-8 text-center text-custom-700">
                      No quotations found
                    </td>
                  </tr>
                ) : (
                  searchedQuotations.map((quotation) => {
                    const config = statusConfig[quotation.status];
                    const Icon = config.icon;

                    return (
                      <tr key={quotation.id} className="hover:bg-custom-50 transition-colors">
                        <td className="px-4 py-4">
                          <span className="text-sm font-bold text-primary-600">
                            {quotation.id}
                          </span>
                        </td>
                        <td className="px-4 py-4">
                          <div>
                            <p className="text-sm font-semibold text-secondary-100">
                              {quotation.clientName}
                            </p>
                            <p className="text-xs text-custom-700">{quotation.clientCompany}</p>
                          </div>
                        </td>
                        <td className="px-4 py-4">
                          <span className="text-sm text-secondary-100">
                            {quotation.items.length} item{quotation.items.length > 1 ? "s" : ""}
                          </span>
                        </td>
                        <td className="px-4 py-4">
                          <span className="text-sm font-bold text-secondary-100">
                            {quotation.total.toLocaleString()} RWF
                          </span>
                        </td>
                        <td className="px-4 py-4">
                          <div className="flex items-center gap-2">
                            <Icon className={`w-4 h-4 ${config.color}`} />
                            <span
                              className={`text-xs font-bold px-3 py-1 rounded-full ${config.bgColor} ${config.color}`}
                            >
                              {config.label}
                            </span>
                          </div>
                        </td>
                        <td className="px-4 py-4">
                          <span className="text-sm text-custom-700">
                            {quotation.validUntil}
                          </span>
                        </td>
                        <td className="px-4 py-4">
                          <span className="text-sm text-custom-700">
                            {quotation.createdDate}
                          </span>
                        </td>
                        <td className="px-4 py-4">
                          <div className="flex items-center justify-end">
                            <button
                              onClick={() => {
                                setSelectedQuotation(quotation);
                                setShowDetailsModal(true);
                              }}
                              className="px-3 py-1.5 rounded-lg border border-custom-300 text-custom-700 hover:bg-custom-100 transition-colors text-xs font-semibold flex items-center gap-1"
                            >
                              <HiOutlineEye className="w-4 h-4" />
                              View
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

        {/* Details Modal */}
        {showDetailsModal && selectedQuotation && (
          <div className="fixed inset-0 bg-secondary-100/50 z-50 flex items-center justify-center p-4">
            <Card className="!p-6 max-w-3xl w-full max-h-[90vh] overflow-y-auto">
              <div className="flex items-start justify-between mb-6">
                <div>
                  <h3 className="text-2xl font-bold text-secondary-100">
                    {selectedQuotation.id}
                  </h3>
                  <p className="text-sm text-custom-700 mt-1">
                    {selectedQuotation.clientName} • {selectedQuotation.clientCompany}
                  </p>
                  <span
                    className={`inline-block mt-2 text-xs font-bold px-3 py-1 rounded-full ${
                      statusConfig[selectedQuotation.status].bgColor
                    } ${statusConfig[selectedQuotation.status].color}`}
                  >
                    {statusConfig[selectedQuotation.status].label}
                  </span>
                </div>
                <button
                  onClick={() => {
                    setShowDetailsModal(false);
                    setSelectedQuotation(null);
                  }}
                  className="text-custom-700 hover:text-secondary-100"
                >
                  <HiOutlineX className="w-6 h-6" />
                </button>
              </div>

              <div className="space-y-6">
                {/* Items */}
                <div>
                  <h4 className="text-sm font-bold text-secondary-100 mb-3">Items</h4>
                  <div className="border border-custom-300 rounded-xl overflow-hidden">
                    <table className="w-full">
                      <thead className="bg-custom-100">
                        <tr>
                          <th className="px-4 py-2 text-left text-xs font-semibold text-custom-700">
                            Description
                          </th>
                          <th className="px-4 py-2 text-right text-xs font-semibold text-custom-700">
                            Qty
                          </th>
                          <th className="px-4 py-2 text-right text-xs font-semibold text-custom-700">
                            Unit Price
                          </th>
                          <th className="px-4 py-2 text-right text-xs font-semibold text-custom-700">
                            Total
                          </th>
                        </tr>
                      </thead>
                      <tbody className="divide-y divide-custom-200">
                        {selectedQuotation.items.map((item, idx) => (
                          <tr key={idx}>
                            <td className="px-4 py-3 text-sm text-secondary-100">
                              {item.description}
                            </td>
                            <td className="px-4 py-3 text-sm text-right text-secondary-100">
                              {item.quantity}
                            </td>
                            <td className="px-4 py-3 text-sm text-right text-secondary-100">
                              {item.unitPrice.toLocaleString()} RWF
                            </td>
                            <td className="px-4 py-3 text-sm text-right font-semibold text-secondary-100">
                              {item.total.toLocaleString()} RWF
                            </td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                </div>

                {/* Totals */}
                <div className="border-t border-custom-300 pt-4">
                  <div className="space-y-2">
                    <div className="flex justify-between text-sm">
                      <span className="text-custom-700">Subtotal:</span>
                      <span className="font-semibold text-secondary-100">
                        {selectedQuotation.subtotal.toLocaleString()} RWF
                      </span>
                    </div>
                    <div className="flex justify-between text-sm">
                      <span className="text-custom-700">Tax (18%):</span>
                      <span className="font-semibold text-secondary-100">
                        {selectedQuotation.tax.toLocaleString()} RWF
                      </span>
                    </div>
                    <div className="flex justify-between text-lg font-bold border-t border-custom-300 pt-2">
                      <span className="text-secondary-100">Total:</span>
                      <span className="text-primary-600">
                        {selectedQuotation.total.toLocaleString()} RWF
                      </span>
                    </div>
                  </div>
                </div>

                {/* Dates */}
                <div className="grid grid-cols-2 gap-4 text-sm">
                  <div>
                    <p className="text-custom-700 mb-1">Created Date:</p>
                    <p className="font-semibold text-secondary-100">
                      {selectedQuotation.createdDate}
                    </p>
                  </div>
                  <div>
                    <p className="text-custom-700 mb-1">Valid Until:</p>
                    <p className="font-semibold text-secondary-100">
                      {selectedQuotation.validUntil}
                    </p>
                  </div>
                </div>
              </div>

              <div className="flex gap-3 justify-end mt-6 pt-4 border-t border-custom-300">
                <Button
                  variant="outline"
                  onClick={() => {
                    setShowDetailsModal(false);
                    setSelectedQuotation(null);
                  }}
                >
                  Close
                </Button>
                {selectedQuotation.status === "draft" && (
                  <Button onClick={() => alert("Send quotation functionality")}>
                    Send to Client
                  </Button>
                )}
              </div>
            </Card>
          </div>
        )}
      </div>
    </DashboardLayout>
  );
}
