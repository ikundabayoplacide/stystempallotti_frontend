import { useState } from "react";
import {
    HiOutlineCheckCircle,
    HiOutlineClipboardList,
    HiOutlineClock,
    HiOutlinePlus,
    HiOutlineX,
    HiOutlineXCircle,
} from "react-icons/hi";
import { DashboardLayout } from "../../components";
import { Button, Card, Input } from "../../components/ui";

type RequestStatus = "pending" | "approved" | "rejected";

interface MaterialRequest {
  id: string;
  jobId: string;
  jobTitle: string;
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
    jobId: "JOB-003",
    jobTitle: "Business Cards",
    materials: [
      { name: "Cardstock Paper", quantity: "500", unit: "sheets" },
      { name: "Laminating Film", quantity: "50", unit: "meters" },
    ],
    requestDate: "2026-05-03T14:00:00",
    status: "approved",
    responseNotes: "Materials supplied from warehouse A",
    respondedAt: "2026-05-03T14:30:00",
  },
  {
    id: "MR-003",
    jobId: "JOB-010",
    jobTitle: "Packaging Materials",
    materials: [
      { name: "Corrugated Board", quantity: "100", unit: "sheets" },
    ],
    requestDate: "2026-05-02T10:00:00",
    status: "rejected",
    responseNotes: "Item out of stock. Please use alternative material.",
    respondedAt: "2026-05-02T11:00:00",
  },
];

// Available jobs for the worker
const availableJobs = [
  { id: "JOB-001", title: "Print 500 brochures", status: "In Progress" },
  { id: "JOB-003", title: "Business Cards", status: "In Progress" },
  { id: "JOB-008", title: "Print 1000 posters", status: "In Progress" },
  { id: "JOB-009", title: "Print 300 flyers", status: "In Progress" },
  { id: "JOB-010", title: "Packaging Materials", status: "Assigned" },
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

export default function MaterialRequestPage() {
  const [requests, setRequests] = useState<MaterialRequest[]>(initialRequests);
  const [showRequestModal, setShowRequestModal] = useState(false);
  const [selectedRequest, setSelectedRequest] = useState<MaterialRequest | null>(null);
  const [showDetailsModal, setShowDetailsModal] = useState(false);
  const [filter, setFilter] = useState<"all" | RequestStatus>("all");

  const [materials, setMaterials] = useState<{ name: string; quantity: string; unit: string }[]>([
    { name: "", quantity: "", unit: "sheets" },
  ]);
  const [requestData, setRequestData] = useState({
    jobId: "",
    jobTitle: "",
    notes: "",
  });

  const pendingCount = requests.filter((r) => r.status === "pending").length;

  const filteredRequests =
    filter === "all" ? requests : requests.filter((r) => r.status === filter);

  const addMaterialField = () => {
    setMaterials([...materials, { name: "", quantity: "", unit: "sheets" }]);
  };

  const removeMaterialField = (index: number) => {
    setMaterials(materials.filter((_, i) => i !== index));
  };

  const updateMaterial = (index: number, field: string, value: string) => {
    const updated = [...materials];
    updated[index] = { ...updated[index], [field]: value };
    setMaterials(updated);
  };

  const handleSubmitRequest = (e: React.FormEvent) => {
    e.preventDefault();
    
    const validMaterials = materials.filter((m) => m.name && m.quantity);
    if (validMaterials.length === 0) {
      alert("Please add at least one material");
      return;
    }

    const newRequest: MaterialRequest = {
      id: `MR-${String(requests.length + 1).padStart(3, "0")}`,
      jobId: requestData.jobId,
      jobTitle: requestData.jobTitle,
      materials: validMaterials,
      requestDate: new Date().toISOString(),
      status: "pending",
      notes: requestData.notes,
    };

    setRequests([newRequest, ...requests]);
    setShowRequestModal(false);
    setRequestData({ jobId: "", jobTitle: "", notes: "" });
    setMaterials([{ name: "", quantity: "", unit: "sheets" }]);
  };

  const handleJobSelect = (jobId: string) => {
    const selectedJob = availableJobs.find((job) => job.id === jobId);
    if (selectedJob) {
      setRequestData({
        ...requestData,
        jobId: selectedJob.id,
        jobTitle: selectedJob.title,
      });
    }
  };

  return (
    <DashboardLayout userRole="worker" userName="Worker" notificationCount={0}>
      <div className="space-y-6 font-[family-name:var(--font-family-primary)]">
        {/* Header */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
          <div>
            <h1 className="text-2xl md:text-3xl font-bold text-secondary-100">
              Material Requests
            </h1>
            <p className="text-sm text-custom-700 mt-1">
              Request materials from stock for your jobs
            </p>
          </div>
          <button
            onClick={() => setShowRequestModal(true)}
            className="px-4 py-2 rounded-xl bg-primary-500 text-white font-semibold hover:bg-primary-600 transition-colors text-sm flex items-center gap-2 w-fit"
          >
            <HiOutlinePlus className="w-4 h-4" />
            New Request
          </button>
        </div>

        {/* Stats Cards */}
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
          <Card className="!p-4">
            <div className="flex items-center gap-3 mb-2">
              <div className="w-10 h-10 rounded-xl bg-primary-100 flex items-center justify-center">
                <HiOutlineClipboardList className="w-5 h-5 text-primary-600" />
              </div>
            </div>
            <p className="text-2xl font-bold text-secondary-100">{requests.length}</p>
            <p className="text-xs text-custom-700">Total Requests</p>
          </Card>
          <Card className="!p-4">
            <div className="flex items-center gap-3 mb-2">
              <div className="w-10 h-10 rounded-xl bg-yellow-100 flex items-center justify-center">
                <HiOutlineClock className="w-5 h-5 text-yellow-600" />
              </div>
            </div>
            <p className="text-2xl font-bold text-secondary-100">{pendingCount}</p>
            <p className="text-xs text-custom-700">Pending</p>
          </Card>
          <Card className="!p-4">
            <div className="flex items-center gap-3 mb-2">
              <div className="w-10 h-10 rounded-xl bg-green-100 flex items-center justify-center">
                <HiOutlineCheckCircle className="w-5 h-5 text-green-600" />
              </div>
            </div>
            <p className="text-2xl font-bold text-secondary-100">
              {requests.filter((r) => r.status === "approved").length}
            </p>
            <p className="text-xs text-custom-700">Approved</p>
          </Card>
          <Card className="!p-4">
            <div className="flex items-center gap-3 mb-2">
              <div className="w-10 h-10 rounded-xl bg-red-100 flex items-center justify-center">
                <HiOutlineXCircle className="w-5 h-5 text-red-600" />
              </div>
            </div>
            <p className="text-2xl font-bold text-secondary-100">
              {requests.filter((r) => r.status === "rejected").length}
            </p>
            <p className="text-xs text-custom-700">Rejected</p>
          </Card>
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
          <button
            onClick={() => setFilter("rejected")}
            className={`px-4 py-2 rounded-xl transition-colors text-sm font-semibold whitespace-nowrap ${
              filter === "rejected"
                ? "bg-primary-500 text-white"
                : "border border-custom-300 text-custom-700 hover:bg-custom-100"
            }`}
          >
            Rejected ({requests.filter((r) => r.status === "rejected").length})
          </button>
        </div>

        {/* Requests Table */}
        <Card className="!p-0 overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead className="bg-custom-100 border-b border-custom-300">
                <tr>
                  <th className="px-4 py-3 text-left text-xs font-bold text-secondary-100 uppercase">
                    Request ID
                  </th>
                  <th className="px-4 py-3 text-left text-xs font-bold text-secondary-100 uppercase">
                    Job
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
                    <td colSpan={6} className="px-4 py-8 text-center text-custom-700">
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
                            <p className="text-xs text-custom-700">{request.jobId}</p>
                          </div>
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
                          <div className="flex items-center justify-end">
                            <button
                              onClick={() => {
                                setSelectedRequest(request);
                                setShowDetailsModal(true);
                              }}
                              className="px-3 py-1.5 rounded-lg border border-custom-300 text-custom-700 hover:bg-custom-100 transition-colors text-xs font-semibold"
                            >
                              View Details
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

        {/* New Request Modal */}
        {showRequestModal && (
          <div className="fixed inset-0 bg-secondary-100/50 z-50 flex items-start justify-center p-4 overflow-y-auto">
            <Card className="!p-6 max-w-2xl w-full my-8">
              <div className="flex items-center justify-between mb-6">
                <h3 className="text-xl font-bold text-secondary-100">New Material Request</h3>
                <button
                  onClick={() => {
                    setShowRequestModal(false);
                    setRequestData({ jobId: "", jobTitle: "", notes: "" });
                    setMaterials([{ name: "", quantity: "", unit: "sheets" }]);
                  }}
                  className="text-custom-700 hover:text-secondary-100"
                >
                  <HiOutlineX className="w-6 h-6" />
                </button>
              </div>

              <form onSubmit={handleSubmitRequest} className="space-y-6">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-semibold text-secondary-100 mb-2">
                      Job ID *
                    </label>
                    <select
                      value={requestData.jobId}
                      onChange={(e) => handleJobSelect(e.target.value)}
                      required
                      className="w-full px-4 py-2.5 rounded-xl border border-custom-300 bg-style-500 text-secondary-100 focus:outline-none focus:border-primary-400 focus:ring-2 focus:ring-primary-200 transition-colors duration-200 font-[family-name:var(--font-family-primary)]"
                    >
                      <option value="">Select a job</option>
                      {availableJobs.map((job) => (
                        <option key={job.id} value={job.id}>
                          {job.id} - {job.title} ({job.status})
                        </option>
                      ))}
                    </select>
                  </div>
                  <div>
                    <label className="block text-sm font-semibold text-secondary-100 mb-2">
                      Job Title *
                    </label>
                    <Input
                      type="text"
                      placeholder="Auto-filled from job selection"
                      value={requestData.jobTitle}
                      onChange={(e) => setRequestData({ ...requestData, jobTitle: e.target.value })}
                      required
                      fullWidth
                      disabled
                      className="bg-custom-100"
                    />
                  </div>
                </div>

                <div>
                  <div className="flex items-center justify-between mb-3">
                    <label className="block text-sm font-semibold text-secondary-100">
                      Materials Needed *
                    </label>
                    <button
                      type="button"
                      onClick={addMaterialField}
                      className="text-sm text-primary-500 hover:text-primary-600 font-semibold flex items-center gap-1"
                    >
                      <HiOutlinePlus className="w-4 h-4" />
                      Add Material
                    </button>
                  </div>
                  <div className="space-y-3">
                    {materials.map((material, index) => (
                      <div key={index} className="flex gap-2">
                        <Input
                          type="text"
                          placeholder="Material name"
                          value={material.name}
                          onChange={(e) => updateMaterial(index, "name", e.target.value)}
                          required
                          fullWidth
                        />
                        <Input
                          type="number"
                          placeholder="Qty"
                          value={material.quantity}
                          onChange={(e) => updateMaterial(index, "quantity", e.target.value)}
                          required
                          className="w-24"
                        />
                        <select
                          value={material.unit}
                          onChange={(e) => updateMaterial(index, "unit", e.target.value)}
                          className="px-3 py-2 rounded-xl border border-custom-300 bg-style-500 text-secondary-100 focus:outline-none focus:border-primary-400 focus:ring-2 focus:ring-primary-200 transition-colors duration-200"
                        >
                          <option value="sheets">Sheets</option>
                          <option value="units">Units</option>
                          <option value="rolls">Rolls</option>
                          <option value="boxes">Boxes</option>
                          <option value="kg">Kg</option>
                          <option value="liters">Liters</option>
                          <option value="meters">Meters</option>
                        </select>
                        {materials.length > 1 && (
                          <button
                            type="button"
                            onClick={() => removeMaterialField(index)}
                            className="p-2 rounded-lg hover:bg-red-100 transition-colors"
                          >
                            <HiOutlineX className="w-5 h-5 text-red-500" />
                          </button>
                        )}
                      </div>
                    ))}
                  </div>
                </div>

                <div>
                  <label className="block text-sm font-semibold text-secondary-100 mb-2">
                    Notes
                  </label>
                  <textarea
                    value={requestData.notes}
                    onChange={(e) => setRequestData({ ...requestData, notes: e.target.value })}
                    rows={3}
                    placeholder="Add any additional notes or urgency information..."
                    className="w-full px-4 py-2.5 rounded-xl border border-custom-300 bg-style-500 text-secondary-100 focus:outline-none focus:border-primary-400 focus:ring-2 focus:ring-primary-200 transition-colors duration-200 resize-none"
                  />
                </div>

                <div className="flex gap-3 justify-end pt-4 border-t border-custom-300">
                  <Button
                    type="button"
                    variant="outline"
                    onClick={() => {
                      setShowRequestModal(false);
                      setRequestData({ jobId: "", jobTitle: "", notes: "" });
                      setMaterials([{ name: "", quantity: "", unit: "sheets" }]);
                    }}
                  >
                    Cancel
                  </Button>
                  <Button type="submit">Submit Request</Button>
                </div>
              </form>
            </Card>
          </div>
        )}

        {/* Details Modal */}
        {showDetailsModal && selectedRequest && (
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
                    setShowDetailsModal(false);
                    setSelectedRequest(null);
                  }}
                  className="text-custom-700 hover:text-secondary-100"
                >
                  <HiOutlineX className="w-6 h-6" />
                </button>
              </div>

              <div className="space-y-4">
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
                    <p className="text-sm font-semibold text-custom-700 mb-1">Request Notes</p>
                    <p className="text-base text-secondary-100">{selectedRequest.notes}</p>
                  </div>
                )}

                {selectedRequest.responseNotes && (
                  <div className={`p-4 rounded-xl ${
                    selectedRequest.status === "approved" 
                      ? "bg-green-50 border border-green-200" 
                      : "bg-red-50 border border-red-200"
                  }`}>
                    <p className={`text-sm font-semibold mb-1 ${
                      selectedRequest.status === "approved" ? "text-green-900" : "text-red-900"
                    }`}>
                      Stock Response
                    </p>
                    <p className={`text-sm ${
                      selectedRequest.status === "approved" ? "text-green-800" : "text-red-800"
                    }`}>
                      {selectedRequest.responseNotes}
                    </p>
                  </div>
                )}

                <div className="text-xs text-custom-700">
                  <p>Requested: {new Date(selectedRequest.requestDate).toLocaleString()}</p>
                  {selectedRequest.respondedAt && (
                    <p>Responded: {new Date(selectedRequest.respondedAt).toLocaleString()}</p>
                  )}
                </div>
              </div>

              <div className="flex justify-end mt-6 pt-4 border-t border-custom-300">
                <Button
                  variant="outline"
                  onClick={() => {
                    setShowDetailsModal(false);
                    setSelectedRequest(null);
                  }}
                >
                  Close
                </Button>
              </div>
            </Card>
          </div>
        )}
      </div>
    </DashboardLayout>
  );
}
