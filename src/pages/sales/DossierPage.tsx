import { useState } from "react";
import {
  HiOutlineCheckCircle,
  HiOutlineClipboardList,
  HiOutlineDocumentText,
  HiOutlineDownload,
  HiOutlineEye,
  HiOutlinePlus,
  HiOutlineSearch,
  HiOutlineUpload,
  HiOutlineX
} from "react-icons/hi";
import { DashboardLayout } from "../../components";
import { Button, Card, Input } from "../../components/ui";
import type { JobStatus } from "../../types/JobStatus";
import { jobStatusConfig } from "../../types/JobStatus";

interface DossierDocument {
  name: string;
  type: string;
  uploadedAt: string;
  size: string;
}

interface Dossier {
  id: string;
  jobId: string;
  client: string;
  service: string;
  status: JobStatus;
  createdAt: string;
  completedAt?: string;
  documents: DossierDocument[];
  quotationId: string;
  invoiceId: string;
  totalAmount: string;
  notes?: string;
}

const initialDossiers: Dossier[] = [
  {
    id: "DOS-001",
    jobId: "JOB-001",
    client: "ABC Corp",
    service: "Offset Printing",
    status: "completed",
    createdAt: "2026-04-28",
    completedAt: "2026-05-02",
    quotationId: "QUOT-001",
    invoiceId: "PI-001",
    totalAmount: "1,003,000",
    documents: [
      { name: "Quotation.pdf", type: "Quotation", uploadedAt: "2026-04-28", size: "245 KB" },
      { name: "Proforma_Invoice.pdf", type: "Invoice", uploadedAt: "2026-04-29", size: "198 KB" },
      { name: "Job_Specifications.pdf", type: "Specifications", uploadedAt: "2026-04-28", size: "512 KB" },
      { name: "Client_Approval.pdf", type: "Approval", uploadedAt: "2026-04-29", size: "156 KB" },
      { name: "Payment_Receipt.pdf", type: "Payment", uploadedAt: "2026-04-30", size: "89 KB" },
      { name: "Delivery_Note.pdf", type: "Delivery", uploadedAt: "2026-05-02", size: "124 KB" },
    ],
    notes: "Rush order - completed ahead of schedule",
  },
  {
    id: "DOS-002",
    jobId: "JOB-002",
    client: "XYZ Ltd",
    service: "Binding",
    status: "in-binding",
    createdAt: "2026-04-29",
    quotationId: "QUOT-002",
    invoiceId: "PI-002",
    totalAmount: "141,600",
    documents: [
      { name: "Quotation.pdf", type: "Quotation", uploadedAt: "2026-04-29", size: "198 KB" },
      { name: "Proforma_Invoice.pdf", type: "Invoice", uploadedAt: "2026-04-30", size: "176 KB" },
      { name: "Job_Specifications.pdf", type: "Specifications", uploadedAt: "2026-04-29", size: "423 KB" },
    ],
  },
  {
    id: "DOS-003",
    jobId: "JOB-008",
    client: "Tech Startup",
    service: "Digital Printing",
    status: "paid",
    createdAt: "2026-04-30",
    quotationId: "QUOT-003",
    invoiceId: "PI-003",
    totalAmount: "531,000",
    documents: [
      { name: "Quotation.pdf", type: "Quotation", uploadedAt: "2026-04-30", size: "234 KB" },
      { name: "Proforma_Invoice.pdf", type: "Invoice", uploadedAt: "2026-05-01", size: "187 KB" },
      { name: "Job_Specifications.pdf", type: "Specifications", uploadedAt: "2026-04-30", size: "678 KB" },
      { name: "Client_Approval.pdf", type: "Approval", uploadedAt: "2026-05-01", size: "145 KB" },
      { name: "Payment_Receipt.pdf", type: "Payment", uploadedAt: "2026-05-02", size: "92 KB" },
    ],
  },
];

export default function DossierPage() {
  const [dossiers] = useState<Dossier[]>(initialDossiers);
  const [search, setSearch] = useState("");
  const [selectedDossier, setSelectedDossier] = useState<Dossier | null>(null);
  const [showDossierModal, setShowDossierModal] = useState(false);
  const [showCreateModal, setShowCreateModal] = useState(false);
  const [showUploadModal, setShowUploadModal] = useState(false);

  // Create Dossier Form State
  const [newDossier, setNewDossier] = useState({
    jobId: "",
    quotationId: "",
    invoiceId: "",
    notes: "",
  });

  // Upload Document Form State
  const [uploadForm, setUploadForm] = useState({
    dossierId: "",
    documentType: "",
    file: null as File | null,
  });

  const handleCreateDossier = () => {
    console.log("Creating dossier:", newDossier);
    alert("Dossier created successfully!");
    setShowCreateModal(false);
    setNewDossier({ jobId: "", quotationId: "", invoiceId: "", notes: "" });
  };

  const handleUploadDocument = () => {
    console.log("Uploading document:", uploadForm);
    alert("Document uploaded successfully!");
    setShowUploadModal(false);
    setUploadForm({ dossierId: "", documentType: "", file: null });
  };

  const filtered = dossiers.filter(
    (dos) =>
      dos.id.toLowerCase().includes(search.toLowerCase()) ||
      dos.jobId.toLowerCase().includes(search.toLowerCase()) ||
      dos.client.toLowerCase().includes(search.toLowerCase())
  );

  const getDocumentIcon = (type: string) => {
    switch (type.toLowerCase()) {
      case "quotation":
      case "invoice":
      case "payment":
        return "💰";
      case "specifications":
        return "📋";
      case "approval":
        return "✅";
      case "delivery":
        return "📦";
      default:
        return "📄";
    }
  };

  return (
    <DashboardLayout userRole="sales" userName="Sales Officer" notificationCount={3}>
      <div className="space-y-6 font-[family-name:var(--font-family-primary)]">
        {/* Header */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
          <div>
            <h1 className="text-2xl md:text-3xl font-bold text-secondary-100">
              Job Dossiers
            </h1>
            <p className="text-sm text-custom-700 mt-1">
              Complete documentation for all jobs
            </p>
          </div>
          <div className="flex gap-2">
            <Button
              onClick={() => setShowUploadModal(true)}
              className="!bg-blue-500 hover:!bg-blue-600 !text-white"
            >
              <HiOutlineUpload className="w-4 h-4 mr-2" />
              Upload Document
            </Button>
            <Button
              onClick={() => setShowCreateModal(true)}
              className="!bg-primary-500 hover:!bg-primary-600 !text-white"
            >
              <HiOutlinePlus className="w-4 h-4 mr-2" />
              Create Dossier
            </Button>
          </div>
        </div>

        {/* Summary Cards */}
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
          <Card className="!p-4">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-xl bg-primary-100 flex items-center justify-center">
                <HiOutlineClipboardList className="w-5 h-5 text-primary-600" />
              </div>
              <div>
                <p className="text-xs text-custom-700">Total Dossiers</p>
                <p className="text-xl font-bold text-secondary-100">{dossiers.length}</p>
              </div>
            </div>
          </Card>
          <Card className="!p-4">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-xl bg-green-100 flex items-center justify-center">
                <HiOutlineCheckCircle className="w-5 h-5 text-green-600" />
              </div>
              <div>
                <p className="text-xs text-custom-700">Completed</p>
                <p className="text-xl font-bold text-secondary-100">
                  {dossiers.filter((d) => d.status === "completed" || d.status === "delivered").length}
                </p>
              </div>
            </div>
          </Card>
          <Card className="!p-4">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-xl bg-yellow-100 flex items-center justify-center">
                <HiOutlineDocumentText className="w-5 h-5 text-yellow-600" />
              </div>
              <div>
                <p className="text-xs text-custom-700">Total Documents</p>
                <p className="text-xl font-bold text-secondary-100">
                  {dossiers.reduce((sum, d) => sum + d.documents.length, 0)}
                </p>
              </div>
            </div>
          </Card>
        </div>

        {/* Dossiers List */}
        <Card className="!p-0 overflow-hidden">
          <div className="p-4 bg-custom-100 border-b border-custom-300">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
              <h2 className="text-lg font-bold text-secondary-100">All Dossiers</h2>
              <div className="relative w-full sm:w-64">
                <HiOutlineSearch className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-custom-700" />
                <input
                  type="text"
                  placeholder="Search dossiers..."
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
                    Dossier ID
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
                    Documents
                  </th>
                  <th className="px-4 py-3 text-left text-xs font-bold text-secondary-100 uppercase">
                    Total Amount
                  </th>
                  <th className="px-4 py-3 text-left text-xs font-bold text-secondary-100 uppercase">
                    Status
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
                {filtered.length === 0 ? (
                  <tr>
                    <td colSpan={9} className="px-4 py-8 text-center text-custom-700">
                      No dossiers found
                    </td>
                  </tr>
                ) : (
                  filtered.map((dossier) => {
                    const statusConfig = jobStatusConfig[dossier.status];

                    return (
                      <tr key={dossier.id} className="hover:bg-custom-50 transition-colors">
                        <td className="px-4 py-4">
                          <span className="text-sm font-bold text-primary-600">{dossier.id}</span>
                        </td>
                        <td className="px-4 py-4">
                          <span className="text-sm font-bold text-secondary-100">{dossier.jobId}</span>
                        </td>
                        <td className="px-4 py-4">
                          <span className="text-sm font-semibold text-secondary-100">{dossier.client}</span>
                        </td>
                        <td className="px-4 py-4">
                          <span className="text-sm text-secondary-100">{dossier.service}</span>
                        </td>
                        <td className="px-4 py-4">
                          <span className="text-sm text-secondary-100">{dossier.documents.length} files</span>
                        </td>
                        <td className="px-4 py-4">
                          <span className="text-sm font-bold text-primary-600">
                            {dossier.totalAmount} RWF
                          </span>
                        </td>
                        <td className="px-4 py-4">
                          <span className={`text-xs font-bold px-3 py-1 rounded-full ${statusConfig.bgColor} ${statusConfig.color}`}>
                            {statusConfig.label}
                          </span>
                        </td>
                        <td className="px-4 py-4">
                          <span className="text-sm text-custom-700">{dossier.createdAt}</span>
                        </td>
                        <td className="px-4 py-4">
                          <div className="flex items-center justify-end gap-2">
                            <button
                              onClick={() => {
                                setSelectedDossier(dossier);
                                setShowDossierModal(true);
                              }}
                              className="px-3 py-1.5 rounded-lg bg-primary-500 text-white hover:bg-primary-600 transition-colors text-xs font-semibold flex items-center gap-1"
                            >
                              <HiOutlineEye className="w-3 h-3" />
                              View
                            </button>
                            <button
                              onClick={(e) => {
                                e.stopPropagation();
                                alert("Download complete dossier functionality coming soon");
                              }}
                              className="p-2 rounded-lg hover:bg-primary-100 transition-colors"
                              title="Download All"
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

        {/* Create Dossier Modal */}
        {showCreateModal && (
          <div className="fixed inset-0 bg-secondary-100/50 z-50 flex items-center justify-center p-4">
            <Card className="!p-6 max-w-2xl w-full max-h-[90vh] overflow-y-auto">
              <div className="flex items-start justify-between mb-4">
                <div>
                  <h3 className="text-xl font-bold text-secondary-100">Create New Dossier</h3>
                  <p className="text-sm text-custom-700 mt-1">
                    Create a complete documentation package for a job
                  </p>
                </div>
                <button
                  onClick={() => setShowCreateModal(false)}
                  className="text-custom-700 hover:text-secondary-100 text-2xl"
                >
                  <HiOutlineX className="w-6 h-6" />
                </button>
              </div>

              <div className="space-y-4">
                {/* Job ID */}
                <div>
                  <label className="block text-sm font-semibold text-secondary-100 mb-2">
                    Job ID <span className="text-red-500">*</span>
                  </label>
                  <select
                    value={newDossier.jobId}
                    onChange={(e) => {
                      const jobId = e.target.value;
                      setNewDossier({ ...newDossier, jobId });
                      // Auto-fill related data based on job
                      if (jobId === "JOB-004") {
                        setNewDossier({
                          ...newDossier,
                          jobId,
                          quotationId: "QUOT-004",
                          invoiceId: "PI-004",
                        });
                      }
                    }}
                    className="w-full px-4 py-2 rounded-xl border border-custom-300 bg-style-500 text-secondary-100 focus:outline-none focus:border-primary-400 focus:ring-2 focus:ring-primary-200"
                  >
                    <option value="">Select Job</option>
                    <option value="JOB-004">JOB-004 - Digital Printing (Tech Solutions)</option>
                    <option value="JOB-005">JOB-005 - Binding (Education Corp)</option>
                    <option value="JOB-006">JOB-006 - Offset Printing (Marketing Ltd)</option>
                    <option value="JOB-007">JOB-007 - Lamination (Design Studio)</option>
                  </select>
                </div>

                {/* Quotation ID */}
                <div>
                  <label className="block text-sm font-semibold text-secondary-100 mb-2">
                    Quotation ID <span className="text-red-500">*</span>
                  </label>
                  <Input
                    value={newDossier.quotationId}
                    onChange={(e) => setNewDossier({ ...newDossier, quotationId: e.target.value })}
                    placeholder="e.g., QUOT-004"
                  />
                </div>

                {/* Invoice ID */}
                <div>
                  <label className="block text-sm font-semibold text-secondary-100 mb-2">
                    Invoice ID <span className="text-red-500">*</span>
                  </label>
                  <Input
                    value={newDossier.invoiceId}
                    onChange={(e) => setNewDossier({ ...newDossier, invoiceId: e.target.value })}
                    placeholder="e.g., PI-004"
                  />
                </div>

                {/* Notes */}
                <div>
                  <label className="block text-sm font-semibold text-secondary-100 mb-2">
                    Notes (Optional)
                  </label>
                  <textarea
                    value={newDossier.notes}
                    onChange={(e) => setNewDossier({ ...newDossier, notes: e.target.value })}
                    placeholder="Add any additional notes or special instructions..."
                    rows={3}
                    className="w-full px-4 py-2 rounded-xl border border-custom-300 bg-style-500 text-secondary-100 focus:outline-none focus:border-primary-400 focus:ring-2 focus:ring-primary-200 resize-none"
                  />
                </div>
              </div>

              <div className="flex gap-3 mt-6">
                <button
                  onClick={() => setShowCreateModal(false)}
                  className="flex-1 px-4 py-2 rounded-xl border border-custom-300 hover:bg-custom-100 transition-colors text-sm font-semibold text-custom-700"
                >
                  Cancel
                </button>
                <button
                  onClick={handleCreateDossier}
                  disabled={!newDossier.jobId || !newDossier.quotationId || !newDossier.invoiceId}
                  className="flex-1 px-4 py-2 rounded-xl bg-primary-500 text-white hover:bg-primary-600 transition-colors text-sm font-semibold disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  Create Dossier
                </button>
              </div>
            </Card>
          </div>
        )}

        {/* Upload Document Modal */}
        {showUploadModal && (
          <div className="fixed inset-0 bg-secondary-100/50 z-50 flex items-center justify-center p-4">
            <Card className="!p-6 max-w-2xl w-full">
              <div className="flex items-start justify-between mb-4">
                <div>
                  <h3 className="text-xl font-bold text-secondary-100">Upload Document</h3>
                  <p className="text-sm text-custom-700 mt-1">
                    Add a document to an existing dossier
                  </p>
                </div>
                <button
                  onClick={() => setShowUploadModal(false)}
                  className="text-custom-700 hover:text-secondary-100 text-2xl"
                >
                  <HiOutlineX className="w-6 h-6" />
                </button>
              </div>

              <div className="space-y-4">
                {/* Dossier ID */}
                <div>
                  <label className="block text-sm font-semibold text-secondary-100 mb-2">
                    Dossier ID <span className="text-red-500">*</span>
                  </label>
                  <select
                    value={uploadForm.dossierId}
                    onChange={(e) => setUploadForm({ ...uploadForm, dossierId: e.target.value })}
                    className="w-full px-4 py-2 rounded-xl border border-custom-300 bg-style-500 text-secondary-100 focus:outline-none focus:border-primary-400 focus:ring-2 focus:ring-primary-200"
                  >
                    <option value="">Select Dossier</option>
                    {dossiers.map((dossier) => (
                      <option key={dossier.id} value={dossier.id}>
                        {dossier.id} - {dossier.jobId} ({dossier.client})
                      </option>
                    ))}
                  </select>
                </div>

                {/* Document Type */}
                <div>
                  <label className="block text-sm font-semibold text-secondary-100 mb-2">
                    Document Type <span className="text-red-500">*</span>
                  </label>
                  <select
                    value={uploadForm.documentType}
                    onChange={(e) => setUploadForm({ ...uploadForm, documentType: e.target.value })}
                    className="w-full px-4 py-2 rounded-xl border border-custom-300 bg-style-500 text-secondary-100 focus:outline-none focus:border-primary-400 focus:ring-2 focus:ring-primary-200"
                  >
                    <option value="">Select Type</option>
                    <option value="Quotation">Quotation</option>
                    <option value="Invoice">Proforma Invoice</option>
                    <option value="Specifications">Job Specifications</option>
                    <option value="Approval">Client Approval</option>
                    <option value="Payment">Payment Receipt</option>
                    <option value="Delivery">Delivery Note</option>
                    <option value="Other">Other</option>
                  </select>
                </div>

                {/* File Upload */}
                <div>
                  <label className="block text-sm font-semibold text-secondary-100 mb-2">
                    Document File <span className="text-red-500">*</span>
                  </label>
                  <div className="border-2 border-dashed border-custom-300 rounded-xl p-6 text-center hover:border-primary-400 transition-colors">
                    <HiOutlineUpload className="w-12 h-12 text-custom-700 mx-auto mb-3" />
                    <p className="text-sm text-secondary-100 font-semibold mb-1">
                      Click to upload or drag and drop
                    </p>
                    <p className="text-xs text-custom-700">PDF, DOC, DOCX (max. 10MB)</p>
                    <input
                      type="file"
                      accept=".pdf,.doc,.docx"
                      onChange={(e) => setUploadForm({ ...uploadForm, file: e.target.files?.[0] || null })}
                      className="hidden"
                      id="file-upload"
                    />
                    <label
                      htmlFor="file-upload"
                      className="inline-block mt-3 px-4 py-2 rounded-lg bg-primary-100 text-primary-600 hover:bg-primary-200 transition-colors cursor-pointer text-sm font-semibold"
                    >
                      Choose File
                    </label>
                    {uploadForm.file && (
                      <p className="text-sm text-primary-600 font-semibold mt-2">
                        Selected: {uploadForm.file.name}
                      </p>
                    )}
                  </div>
                </div>
              </div>

              <div className="flex gap-3 mt-6">
                <button
                  onClick={() => setShowUploadModal(false)}
                  className="flex-1 px-4 py-2 rounded-xl border border-custom-300 hover:bg-custom-100 transition-colors text-sm font-semibold text-custom-700"
                >
                  Cancel
                </button>
                <button
                  onClick={handleUploadDocument}
                  disabled={!uploadForm.dossierId || !uploadForm.documentType || !uploadForm.file}
                  className="flex-1 px-4 py-2 rounded-xl bg-blue-500 text-white hover:bg-blue-600 transition-colors text-sm font-semibold disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  <HiOutlineUpload className="w-4 h-4 inline mr-2" />
                  Upload Document
                </button>
              </div>
            </Card>
          </div>
        )}

        {/* View Dossier Modal */}
        {showDossierModal && selectedDossier && (
          <div className="fixed inset-0 bg-secondary-100/50 z-50 flex items-center justify-center p-4">
            <Card className="!p-6 max-w-4xl w-full max-h-[90vh] overflow-y-auto">
              <div className="flex items-start justify-between mb-4">
                <div>
                  <h3 className="text-xl font-bold text-secondary-100">
                    {selectedDossier.id}
                  </h3>
                  <p className="text-sm text-custom-700 mt-1">
                    Job: {selectedDossier.jobId} | Client: {selectedDossier.client}
                  </p>
                  <span
                    className={`inline-block mt-2 text-xs font-bold px-3 py-1 rounded-full ${
                      jobStatusConfig[selectedDossier.status].bgColor
                    } ${jobStatusConfig[selectedDossier.status].color}`}
                  >
                    {jobStatusConfig[selectedDossier.status].label}
                  </span>
                </div>
                <button
                  onClick={() => setShowDossierModal(false)}
                  className="text-custom-700 hover:text-secondary-100 text-2xl"
                >
                  <HiOutlineX className="w-6 h-6" />
                </button>
              </div>

              <div className="space-y-6">
                {/* Job Summary */}
                <div className="p-4 rounded-xl bg-custom-50 border border-custom-200">
                  <h4 className="text-sm font-bold text-secondary-100 uppercase tracking-wide mb-3">
                    Job Summary
                  </h4>
                  <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                    <div>
                      <p className="text-xs text-custom-700 mb-1">Service</p>
                      <p className="text-sm font-semibold text-secondary-100">{selectedDossier.service}</p>
                    </div>
                    <div>
                      <p className="text-xs text-custom-700 mb-1">Total Amount</p>
                      <p className="text-sm font-semibold text-primary-600">{selectedDossier.totalAmount} RWF</p>
                    </div>
                    <div>
                      <p className="text-xs text-custom-700 mb-1">Created</p>
                      <p className="text-sm font-semibold text-secondary-100">{selectedDossier.createdAt}</p>
                    </div>
                    <div>
                      <p className="text-xs text-custom-700 mb-1">Completed</p>
                      <p className="text-sm font-semibold text-secondary-100">
                        {selectedDossier.completedAt || "In Progress"}
                      </p>
                    </div>
                  </div>
                  <div className="mt-3 grid grid-cols-2 gap-4">
                    <div>
                      <p className="text-xs text-custom-700 mb-1">Quotation ID</p>
                      <p className="text-sm font-semibold text-secondary-100">{selectedDossier.quotationId}</p>
                    </div>
                    <div>
                      <p className="text-xs text-custom-700 mb-1">Invoice ID</p>
                      <p className="text-sm font-semibold text-secondary-100">{selectedDossier.invoiceId}</p>
                    </div>
                  </div>
                  {selectedDossier.notes && (
                    <div className="mt-3">
                      <p className="text-xs text-custom-700 mb-1">Notes</p>
                      <p className="text-sm text-secondary-100">{selectedDossier.notes}</p>
                    </div>
                  )}
                </div>

                {/* Documents */}
                <div>
                  <div className="flex items-center justify-between mb-3">
                    <h4 className="text-sm font-bold text-secondary-100 uppercase tracking-wide">
                      Documents ({selectedDossier.documents.length})
                    </h4>
                    <button
                      onClick={() => alert("Download all documents functionality coming soon")}
                      className="text-xs font-semibold text-primary-500 hover:text-primary-600 transition-colors"
                    >
                      <HiOutlineDownload className="w-3 h-3 inline mr-1" />
                      Download All
                    </button>
                  </div>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                    {selectedDossier.documents.map((doc, idx) => (
                      <div
                        key={idx}
                        className="p-3 rounded-xl border border-custom-300 hover:border-primary-400 hover:bg-custom-50 transition-all cursor-pointer"
                        onClick={() => alert(`View ${doc.name} functionality coming soon`)}
                      >
                        <div className="flex items-start gap-3">
                          <div className="text-2xl">{getDocumentIcon(doc.type)}</div>
                          <div className="flex-1 min-w-0">
                            <p className="text-sm font-semibold text-secondary-100 truncate">
                              {doc.name}
                            </p>
                            <p className="text-xs text-custom-700">{doc.type}</p>
                            <div className="flex items-center gap-2 mt-1 text-xs text-custom-700">
                              <span>{doc.size}</span>
                              <span>•</span>
                              <span>{doc.uploadedAt}</span>
                            </div>
                          </div>
                          <button
                            onClick={(e) => {
                              e.stopPropagation();
                              alert(`Download ${doc.name} functionality coming soon`);
                            }}
                            className="p-1.5 rounded-lg hover:bg-custom-100 transition-colors"
                          >
                            <HiOutlineDownload className="w-4 h-4 text-custom-700" />
                          </button>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              </div>

              <div className="flex gap-3 mt-6">
                <button
                  onClick={() => setShowDossierModal(false)}
                  className="flex-1 px-4 py-2 rounded-xl border border-custom-300 hover:bg-custom-100 transition-colors text-sm font-semibold text-custom-700"
                >
                  Close
                </button>
                <button
                  onClick={() => alert("Download complete dossier functionality coming soon")}
                  className="flex-1 px-4 py-2 rounded-xl bg-primary-500 text-white hover:bg-primary-600 transition-colors text-sm font-semibold"
                >
                  <HiOutlineDownload className="w-4 h-4 inline mr-2" />
                  Download Complete Dossier
                </button>
              </div>
            </Card>
          </div>
        )}
      </div>
    </DashboardLayout>
  );
}
