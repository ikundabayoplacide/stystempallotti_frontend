import { useState } from "react";
import {
    HiOutlineCheckCircle,
    HiOutlineClock,
    HiOutlineX,
    HiOutlineXCircle
} from "react-icons/hi";
import { DashboardLayout } from "../../components";
import { Card } from "../../components/ui";

type RequestStatus = "pending" | "approved" | "rejected";

interface MaterialRequest {
  id: string;
  jobId: string;
  jobTitle: string;
  requestedBy: string;
  department: string;
  materials: { name: string; quantity: string; unit: string }[];
  requestDate: string;
  status: RequestStatus;
  notes?: string;
  responseNotes?: string;
  respondedAt?: string;
}

const initialRequests: MaterialRequest[] = [
  {
    id: "MR-001",
    jobId: "JOB-001",
    jobTitle: "Print 500 brochures",
    requestedBy: "John Worker",
    department: "Printing",
    materials: [
      { name: "Glossy Paper A4", quantity: "1000", unit: "sheets" },
      { name: "Ink Cartridge (Color)", quantity: "2", unit: "units" },
    ],
    requestDate: "2026-05-04T09:00:00",
    status: "pending",
    notes: "Urgent - deadline is tomorrow",
  },
  {
    id: "MR-002",
    jobId: "JOB-005",
    jobTitle: "Bind 200 booklets",
    requestedBy: "Jane Smith",
    department: "Binding",
    materials: [
      { name: "Binding Wire", quantity: "5", unit: "rolls" },
      { name: "Cover Stock", quantity: "200", unit: "sheets" },
    ],
    requestDate: "2026-05-04T10:30:00",
    status: "pending",
  },
  {
    id: "MR-003",
    jobId: "JOB-003",
    jobTitle: "Business Cards",
    requestedBy: "Mike Johnson",
    department: "Printing",
    materials: [
      { name: "Cardstock Paper", quantity: "500", unit: "sheets" },
      { name: "Laminating Film", quantity: "50", unit: "meters" },
    ],
    requestDate: "2026-05-03T14:00:00",
    status: "approved",
    responseNotes: "Materials supplied from warehouse A",
    respondedAt: "2026-05-03T14:30:00",
  },
];

const statusConfig: Record<
  RequestStatus,
  { label: string; color: string; icon: any; bgColor: string }
> = {
  pending: {
    label: "Pending",
    color: "text-yellow-600",
    icon: HiOutlineClock,
    bgColor: "bg-yellow-100",
  },
  approved: {
    label: "Approved",
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
};

export default function MaterialRequestsPage() {
  const [requests, setRequests] = useState<MaterialRequest[]>(initialRequests);
  const [selectedRequest, setSelectedRequest] = useState<MaterialRequest | null>(null);
  const [showReviewModal, setShowReviewModal] = useState(false);
  const [responseNotes, setResponseNotes] = useState("");
  const [filter, setFilter] = useState<"all" | RequestStatus>("all");

  const pendingCount = requests.filter((r) => r.status === "pending").length;

  const filteredRequests =
    filter === "all" ? requests : requests.filter((r) => r.status === filter);

  const handleApprove = (requestId: string) => {
    setRequests(
      requests.map((r) =>
        r.id === requestId
          ? {
              ...r,
              status: "approved" as RequestStatus,
              responseNotes: responseNotes || "Approved and materials supplied",
              respondedAt: new Date().toISOString(),
            }
          : r
      )
    );
    setShowReviewModal(false);
    setSelectedRequest(null);
    setResponseNotes("");
  };

  const handleReject = (requestId: string) => {
    if (!responseNotes.trim()) {
      alert("Please provide a reason for rejection");
      return;
    }

    setRequests(
      requests.map((r) =>
        r.id === requestId
          ? {
              ...r,
              status: "rejected" as RequestStatus,
              responseNotes: responseNotes,
              respondedAt: new Date().toISOString(),
            }
          : r
      )
    );
    setShowReviewModal(false);
    setSelectedRequest(null);
    setResponseNotes("");
  };

  return (
    <DashboardLayout
      userRole="stock"
      userName="Stock Manager"
      notificationCount={pendingCount}
    >
      <div className="space-y-6 font-[family-name:var(--font-family-primary)]">
        {/* Header */}
        <div>
          <h1 className="text-2xl md:text-3xl font-bold text-secondary-100">
            Material Requests
          </h1>
          <p className="text-sm text-custom-700 mt-1">
            {pendingCount > 0
              ? `${pendingCount} request${pendingCount > 1 ? "s" : ""} pending approval`
              : "All requests processed"}
          </p>
        </div>

        {/* Filter Tabs */}
        <div className="flex gap-2 overflow-x-auto">
          <button
            onClick={() => setFilter("all")}
            className={`px-4 py-2 rounded-xl transition-colors text-sm font-semibold whitespace-nowrap ${
              filter === "all"
                ? "bg-primary-500 text-white"
                : "border border-custom-300 text-custom-700 hover:bg-custom-100"
            }`}
          >
            All ({requests.length})
          </button>
          <button
            onClick={() => setFilter("pending")}
            className={`px-4 py-2 rounded-xl transition-colors text-sm font-semibold whitespace-nowrap ${
              filter === "pending"
                ? "bg-primary-500 text-white"
                : "border border-custom-300 text-custom-700 hover:bg-custom-100"
            }`}
          >
            Pending ({pendingCount})
          </button>
          <button
            onClick={() => setFilter("approved")}
            className={`px-4 py-2 rounded-xl transition-colors text-sm font-semibold whitespace-nowrap ${
              filter === "approved"
                ? "bg-primary-500 text-white"
                : "border border-custom-300 text-custom-700 hover:bg-custom-100"
            }`}
          >
            Approved ({requests.filter((r) => r.status === "approved").length})
          </button>
        </div>

        {/* Requests List */}
        <Card className="!p-0 overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead className="bg-custom-100 border-b border-custom-300">
                <tr>
                  <th className="px-4 py-3 text-left text-xs font-bold text-secondary-100 uppercase">
                    Request ID
                  </th>
                  <th className="px-4 py-3 text-left text-xs font-bold text-secondary-100 uppercase">
                    Job & Requester
                  </th>
                  <th className="px-4 py-3 text-left text-xs font-bold text-secondary-100 uppercase">
                    Department
                  </th>
                  <th className="px-4 py-3 text-left text-xs font-bold text-secondary-100 uppercase">
                    Materials
                  </th>
                  <th className="px-4 py-3 text-left text-xs font-bold text-secondary-100 uppercase">
                    Status
                  </th>
                  <th className="px-4 py-3 text-left text-xs font-bold text-secondary-100 uppercase">
                    Request Date
                  </th>
                  <th className="px-4 py-3 text-right text-xs font-bold text-secondary-100 uppercase">
                    Actions
                  </th>
                </tr>
              </thead>
              <tbody className="bg-white divide-y divide-custom-200">
                {filteredRequests.length === 0 ? (
                  <tr>
                    <td colSpan={7} className="px-4 py-8 text-center text-custom-700">
                      No requests found
                    </td>
                  </tr>
                ) : (
                  filteredRequests.map((request) => {
                    const config = statusConfig[request.status];
                    const Icon = config.icon;

                    return (
                      <tr key={request.id} className="hover:bg-custom-50 transition-colors">
                        <td className="px-4 py-4">
                          <span className="text-sm font-bold text-primary-600">
                            {request.id}
                          </span>
                        </td>
                        <td className="px-4 py-4">
                          <div>
                            <p className="text-sm font-semibold text-secondary-100">
                              {request.jobTitle}
                            </p>
                            <p className="text-xs text-custom-700">
                              {request.requestedBy} • {request.jobId}
                            </p>
                          </div>
                        </td>
                        <td className="px-4 py-4">
                          <span className="text-sm text-custom-700">{request.department}</span>
                        </td>
                        <td className="px-4 py-4">
                          <div className="space-y-1">
                            {request.materials.slice(0, 2).map((mat, idx) => (
                              <div key={idx} className="text-xs text-secondary-100">
                                • {mat.name}: {mat.quantity} {mat.unit}
                              </div>
                            ))}
                            {request.materials.length > 2 && (
                              <p className="text-xs text-custom-700">
                                +{request.materials.length - 2} more
                              </p>
                            )}
                          </div>
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
                            {new Date(request.requestDate).toLocaleDateString()}
                          </span>
                        </td>
                        <td className="px-4 py-4">
                          <div className="flex items-center justify-end gap-2">
                            {request.status === "pending" ? (
                              <>
                                <button
                                  onClick={(e) => {
                                    e.stopPropagation();
                                    handleApprove(request.id);
                                  }}
                                  className="px-3 py-1.5 rounded-lg bg-green-500 text-white hover:bg-green-600 transition-colors text-xs font-semibold"
                                >
                                  <HiOutlineCheckCircle className="w-3 h-3 inline mr-1" />
                                  Approve
                                </button>
                                <button
                                  onClick={(e) => {
                                    e.stopPropagation();
                                    setSelectedRequest(request);
                                    setShowReviewModal(true);
                                  }}
                                  className="px-3 py-1.5 rounded-lg border border-red-300 text-red-600 hover:bg-red-50 transition-colors text-xs font-semibold"
                                >
                                  <HiOutlineXCircle className="w-3 h-3 inline mr-1" />
                                  Reject
                                </button>
                              </>
                            ) : (
                              <button
                                onClick={() => {
                                  setSelectedRequest(request);
                                  setShowReviewModal(true);
                                }}
                                className="px-3 py-1.5 rounded-lg border border-custom-300 text-custom-700 hover:bg-custom-100 transition-colors text-xs font-semibold"
                              >
                                View Details
                              </button>
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

        {/* Review Modal */}
        {showReviewModal && selectedRequest && (
          <div className="fixed inset-0 bg-secondary-100/50 z-50 flex items-center justify-center p-4">
            <Card className="!p-6 max-w-2xl w-full max-h-[90vh] overflow-y-auto">
              <div className="flex items-start justify-between mb-4">
                <div>
                  <h3 className="text-xl font-bold text-secondary-100">
                    {selectedRequest.id}
                  </h3>
                  <p className="text-sm text-custom-700 mt-1">
                    {selectedRequest.jobTitle} ({selectedRequest.jobId})
                  </p>
                  <span
                    className={`inline-block mt-2 text-xs font-bold px-3 py-1 rounded-full ${
                      statusConfig[selectedRequest.status].bgColor
                    } ${statusConfig[selectedRequest.status].color}`}
                  >
                    {statusConfig[selectedRequest.status].label}
                  </span>
                </div>
                <button
                  onClick={() => {
                    setShowReviewModal(false);
                    setResponseNotes("");
                  }}
                  className="text-custom-700 hover:text-secondary-100 text-2xl"
                >
                  <HiOutlineX className="w-6 h-6" />
                </button>
              </div>

              <div className="space-y-4">
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <p className="text-sm font-semibold text-custom-700 mb-1">
                      Requested By
                    </p>
                    <p className="text-base text-secondary-100">
                      {selectedRequest.requestedBy}
                    </p>
                  </div>
                  <div>
                    <p className="text-sm font-semibold text-custom-700 mb-1">
                      Department
                    </p>
                    <p className="text-base text-secondary-100">
                      {selectedRequest.department}
                    </p>
                  </div>
                </div>

                <div>
                  <p className="text-sm font-semibold text-custom-700 mb-3">
                    Materials Requested
                  </p>
                  <div className="space-y-2">
                    {selectedRequest.materials.map((mat, idx) => (
                      <div
                        key={idx}
                        className="p-3 rounded-xl bg-custom-50 border border-custom-200 flex items-center justify-between"
                      >
                        <span className="text-sm font-semibold text-secondary-100">
                          {mat.name}
                        </span>
                        <span className="text-sm text-custom-700">
                          {mat.quantity} {mat.unit}
                        </span>
                      </div>
                    ))}
                  </div>
                </div>

                {selectedRequest.notes && (
                  <div>
                    <p className="text-sm font-semibold text-custom-700 mb-1">
                      Request Notes
                    </p>
                    <p className="text-base text-secondary-100">{selectedRequest.notes}</p>
                  </div>
                )}

                {selectedRequest.responseNotes && (
                  <div>
                    <p className="text-sm font-semibold text-custom-700 mb-1">
                      Response Notes
                    </p>
                    <p className="text-base text-secondary-100">
                      {selectedRequest.responseNotes}
                    </p>
                  </div>
                )}

                {selectedRequest.status === "pending" && (
                  <div>
                    <label className="block text-sm font-semibold text-custom-700 mb-2">
                      Response Notes
                    </label>
                    <textarea
                      value={responseNotes}
                      onChange={(e) => setResponseNotes(e.target.value)}
                      placeholder="Add notes about material supply or rejection reason..."
                      rows={3}
                      className="w-full px-4 py-2 rounded-xl border border-custom-300 focus:outline-none focus:border-primary-500 resize-none"
                    />
                  </div>
                )}
              </div>

              <div className="flex gap-3 mt-6">
                {selectedRequest.status === "pending" && (
                  <>
                    <button
                      onClick={() => handleReject(selectedRequest.id)}
                      className="flex-1 px-4 py-2 rounded-xl border border-red-300 text-red-600 hover:bg-red-50 transition-colors text-sm font-semibold"
                    >
                      <HiOutlineXCircle className="w-4 h-4 inline mr-2" />
                      Reject
                    </button>
                    <button
                      onClick={() => handleApprove(selectedRequest.id)}
                      className="flex-1 px-4 py-2 rounded-xl bg-green-500 text-white hover:bg-green-600 transition-colors text-sm font-semibold"
                    >
                      <HiOutlineCheckCircle className="w-4 h-4 inline mr-2" />
                      Approve & Supply
                    </button>
                  </>
                )}
                {selectedRequest.status !== "pending" && (
                  <button
                    onClick={() => {
                      setShowReviewModal(false);
                      setResponseNotes("");
                    }}
                    className="flex-1 px-4 py-2 rounded-xl border border-custom-300 hover:bg-custom-100 transition-colors text-sm font-semibold text-custom-700"
                  >
                    Close
                  </button>
                )}
              </div>
            </Card>
          </div>
        )}
      </div>
    </DashboardLayout>
  );
}
