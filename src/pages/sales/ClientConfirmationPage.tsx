import { useState } from "react";
import {
    HiOutlineCheckCircle,
    HiOutlineClock,
    HiOutlinePhone,
    HiOutlineSearch,
    HiOutlineX,
    HiOutlineXCircle,
} from "react-icons/hi";
import { DashboardLayout } from "../../components";
import { Card } from "../../components/ui";

type ConfirmationStatus = "pending" | "approved" | "rejected" | "revision-requested";

interface ClientConfirmation {
  id: string;
  quotationId: string;
  jobId: string;
  client: string;
  clientPhone: string;
  clientEmail?: string;
  quotationAmount: string;
  sentDate: string;
  status: ConfirmationStatus;
  responseDate?: string;
  responseNotes?: string;
  followUpCount: number;
}

const initialConfirmations: ClientConfirmation[] = [
  {
    id: "CONF-001",
    quotationId: "QUOT-001",
    jobId: "JOB-001",
    client: "ABC Corp",
    clientPhone: "+250 788 123 456",
    clientEmail: "contact@abccorp.rw",
    quotationAmount: "1,003,000",
    sentDate: "2026-04-28",
    status: "approved",
    responseDate: "2026-04-29",
    responseNotes: "Approved via phone call",
    followUpCount: 0,
  },
  {
    id: "CONF-002",
    quotationId: "QUOT-002",
    jobId: "JOB-002",
    client: "XYZ Ltd",
    clientPhone: "+250 788 234 567",
    quotationAmount: "141,600",
    sentDate: "2026-04-29",
    status: "pending",
    followUpCount: 2,
  },
  {
    id: "CONF-003",
    quotationId: "QUOT-003",
    jobId: "JOB-008",
    client: "Tech Startup",
    clientPhone: "+250 788 345 678",
    clientEmail: "info@techstartup.rw",
    quotationAmount: "531,000",
    sentDate: "2026-04-30",
    status: "revision-requested",
    responseDate: "2026-05-01",
    responseNotes: "Client wants to reduce quantity to lower cost",
    followUpCount: 1,
  },
];

const statusConfig: Record<
  ConfirmationStatus,
  { label: string; color: string; icon: any }
> = {
  pending: {
    label: "Awaiting Response",
    color: "bg-yellow-100 text-yellow-700",
    icon: HiOutlineClock,
  },
  approved: {
    label: "Approved",
    color: "bg-green-100 text-green-700",
    icon: HiOutlineCheckCircle,
  },
  rejected: {
    label: "Rejected",
    color: "bg-red-100 text-red-700",
    icon: HiOutlineXCircle,
  },
  "revision-requested": {
    label: "Revision Requested",
    color: "bg-orange-100 text-orange-700",
    icon: HiOutlineClock,
  },
};

export default function ClientConfirmationPage() {
  const [confirmations, setConfirmations] = useState<ClientConfirmation[]>(
    initialConfirmations
  );
  const [search, setSearch] = useState("");
  const [selectedConfirmation, setSelectedConfirmation] =
    useState<ClientConfirmation | null>(null);
  const [showModal, setShowModal] = useState(false);
  const [responseNotes, setResponseNotes] = useState("");

  const filtered = confirmations.filter(
    (conf) =>
      conf.id.toLowerCase().includes(search.toLowerCase()) ||
      conf.client.toLowerCase().includes(search.toLowerCase()) ||
      conf.jobId.toLowerCase().includes(search.toLowerCase())
  );

  const handleApprove = (confId: string) => {
    setConfirmations(
      confirmations.map((conf) =>
        conf.id === confId
          ? {
              ...conf,
              status: "approved" as ConfirmationStatus,
              responseDate: new Date().toISOString().split("T")[0],
              responseNotes: responseNotes || "Client approved quotation",
            }
          : conf
      )
    );
    setShowModal(false);
    setSelectedConfirmation(null);
    setResponseNotes("");
  };

  const handleReject = (confId: string) => {
    if (!responseNotes.trim()) {
      alert("Please provide rejection reason");
      return;
    }

    setConfirmations(
      confirmations.map((conf) =>
        conf.id === confId
          ? {
              ...conf,
              status: "rejected" as ConfirmationStatus,
              responseDate: new Date().toISOString().split("T")[0],
              responseNotes: responseNotes,
            }
          : conf
      )
    );
    setShowModal(false);
    setSelectedConfirmation(null);
    setResponseNotes("");
  };

  const handleRevisionRequest = (confId: string) => {
    if (!responseNotes.trim()) {
      alert("Please provide revision details");
      return;
    }

    setConfirmations(
      confirmations.map((conf) =>
        conf.id === confId
          ? {
              ...conf,
              status: "revision-requested" as ConfirmationStatus,
              responseDate: new Date().toISOString().split("T")[0],
              responseNotes: responseNotes,
            }
          : conf
      )
    );
    setShowModal(false);
    setSelectedConfirmation(null);
    setResponseNotes("");
  };

  const handleFollowUp = (confId: string) => {
    setConfirmations(
      confirmations.map((conf) =>
        conf.id === confId ? { ...conf, followUpCount: conf.followUpCount + 1 } : conf
      )
    );
    alert("Follow-up call logged. Client will be contacted.");
  };

  const pendingCount = confirmations.filter((c) => c.status === "pending").length;

  return (
    <DashboardLayout userRole="sales" userName="Sales Officer" notificationCount={pendingCount}>
      <div className="space-y-6 font-[family-name:var(--font-family-primary)]">
        {/* Header */}
        <div>
          <h1 className="text-2xl md:text-3xl font-bold text-secondary-100">
            Client Confirmations
          </h1>
          <p className="text-sm text-custom-700 mt-1">
            Track client responses to quotations
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
                <p className="text-xs text-custom-700">Approved</p>
                <p className="text-2xl font-bold text-secondary-100">
                  {confirmations.filter((c) => c.status === "approved").length}
                </p>
              </div>
            </div>
          </Card>
          <Card className="!p-4">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-xl bg-orange-100 flex items-center justify-center">
                <HiOutlineClock className="w-5 h-5 text-orange-600" />
              </div>
              <div>
                <p className="text-xs text-custom-700">Revisions</p>
                <p className="text-2xl font-bold text-secondary-100">
                  {confirmations.filter((c) => c.status === "revision-requested").length}
                </p>
              </div>
            </div>
          </Card>
          <Card className="!p-4">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-xl bg-red-100 flex items-center justify-center">
                <HiOutlineXCircle className="w-5 h-5 text-red-600" />
              </div>
              <div>
                <p className="text-xs text-custom-700">Rejected</p>
                <p className="text-2xl font-bold text-secondary-100">
                  {confirmations.filter((c) => c.status === "rejected").length}
                </p>
              </div>
            </div>
          </Card>
        </div>

        {/* Confirmations List */}
        <Card className="!p-6">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 mb-5">
            <h2 className="text-lg font-bold text-secondary-100">All Confirmations</h2>
            <div className="relative w-full sm:w-64">
              <HiOutlineSearch className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-custom-700" />
              <input
                type="text"
                placeholder="Search confirmations..."
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                className="w-full pl-9 pr-4 py-2 rounded-xl border border-custom-300 bg-style-500 text-secondary-100 text-sm placeholder:text-custom-700 focus:outline-none focus:border-primary-400 focus:ring-2 focus:ring-primary-200 transition-colors duration-200"
              />
            </div>
          </div>

          <div className="space-y-3">
            {filtered.map((confirmation) => {
              const config = statusConfig[confirmation.status];
              const Icon = config.icon;

              return (
                <div
                  key={confirmation.id}
                  className="p-4 rounded-xl border-2 border-custom-300 hover:border-primary-400 hover:shadow-md transition-all"
                >
                  <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-4">
                    <div className="flex-1 space-y-2">
                      <div className="flex flex-wrap items-center gap-2">
                        <span className="text-base font-bold text-primary-500">
                          {confirmation.id}
                        </span>
                        <span className="text-sm text-custom-700">•</span>
                        <span className="text-sm font-bold text-secondary-100">
                          {confirmation.jobId}
                        </span>
                        <span
                          className={`text-xs font-semibold px-3 py-1 rounded-full ${config.color} flex items-center gap-1`}
                        >
                          <Icon className="w-3 h-3" />
                          {config.label}
                        </span>
                        {confirmation.followUpCount > 0 && (
                          <span className="text-xs font-semibold px-2 py-1 rounded-full bg-blue-100 text-blue-700">
                            {confirmation.followUpCount} follow-ups
                          </span>
                        )}
                      </div>
                      <p className="text-sm font-semibold text-secondary-100">
                        {confirmation.client}
                      </p>
                      <div className="flex flex-wrap gap-4 text-xs text-custom-700">
                        <span>Amount: {confirmation.quotationAmount} RWF</span>
                        <span>•</span>
                        <span>Sent: {confirmation.sentDate}</span>
                        {confirmation.responseDate && (
                          <>
                            <span>•</span>
                            <span>Responded: {confirmation.responseDate}</span>
                          </>
                        )}
                      </div>
                      {confirmation.responseNotes && (
                        <div className="text-xs bg-custom-50 p-2 rounded-lg">
                          <strong>Notes:</strong> {confirmation.responseNotes}
                        </div>
                      )}
                    </div>
                    <div className="flex gap-2">
                      {confirmation.status === "pending" && (
                        <>
                          <button
                            onClick={() => handleFollowUp(confirmation.id)}
                            className="px-3 py-2 rounded-xl border border-primary-300 text-primary-600 hover:bg-primary-50 transition-colors text-sm font-semibold flex items-center gap-1"
                          >
                            <HiOutlinePhone className="w-4 h-4" />
                            Follow Up
                          </button>
                          <button
                            onClick={() => {
                              setSelectedConfirmation(confirmation);
                              setShowModal(true);
                            }}
                            className="px-4 py-2 rounded-xl bg-primary-500 text-white hover:bg-primary-600 transition-colors text-sm font-semibold"
                          >
                            Update Status
                          </button>
                        </>
                      )}
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        </Card>

        {/* Update Status Modal */}
        {showModal && selectedConfirmation && (
          <div className="fixed inset-0 bg-secondary-100/50 z-50 flex items-center justify-center p-4">
            <Card className="!p-6 max-w-2xl w-full max-h-[90vh] overflow-y-auto">
              <div className="flex items-start justify-between mb-4">
                <div>
                  <h3 className="text-xl font-bold text-secondary-100">
                    Update Client Response
                  </h3>
                  <p className="text-sm text-custom-700 mt-1">
                    {selectedConfirmation.id} - {selectedConfirmation.client}
                  </p>
                </div>
                <button
                  onClick={() => {
                    setShowModal(false);
                    setResponseNotes("");
                  }}
                  className="text-custom-700 hover:text-secondary-100 text-2xl"
                >
                  <HiOutlineX className="w-6 h-6" />
                </button>
              </div>

              <div className="space-y-4">
                <div>
                  <label className="block text-sm font-semibold text-custom-700 mb-2">
                    Response Notes
                  </label>
                  <textarea
                    value={responseNotes}
                    onChange={(e) => setResponseNotes(e.target.value)}
                    placeholder="Enter client feedback, concerns, or approval details..."
                    rows={4}
                    className="w-full px-4 py-2 rounded-xl border border-custom-300 focus:outline-none focus:border-primary-500 resize-none"
                  />
                </div>
              </div>

              <div className="grid grid-cols-3 gap-3 mt-6">
                <button
                  onClick={() => handleApprove(selectedConfirmation.id)}
                  className="px-4 py-2 rounded-xl bg-green-500 text-white hover:bg-green-600 transition-colors text-sm font-semibold"
                >
                  <HiOutlineCheckCircle className="w-4 h-4 inline mr-1" />
                  Approve
                </button>
                <button
                  onClick={() => handleRevisionRequest(selectedConfirmation.id)}
                  className="px-4 py-2 rounded-xl bg-orange-500 text-white hover:bg-orange-600 transition-colors text-sm font-semibold"
                >
                  Revision
                </button>
                <button
                  onClick={() => handleReject(selectedConfirmation.id)}
                  className="px-4 py-2 rounded-xl bg-red-500 text-white hover:bg-red-600 transition-colors text-sm font-semibold"
                >
                  <HiOutlineXCircle className="w-4 h-4 inline mr-1" />
                  Reject
                </button>
              </div>
            </Card>
          </div>
        )}
      </div>
    </DashboardLayout>
  );
}
