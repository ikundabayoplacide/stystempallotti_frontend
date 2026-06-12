import { useState } from "react";
import {
  HiOutlineCheckCircle,
  HiOutlineClipboardList,
  HiOutlineClock,
  HiOutlinePlus,
  HiOutlineRefresh,
  HiOutlineX,
  HiOutlineXCircle,
} from "react-icons/hi";
import { DashboardLayout } from "../../components";
import { Button, Card, Input } from "../../components/ui";
import { useAuth } from "../../context/AuthContext";
import { useGetMyEmployeeProfileQuery, useGetEmployeeJobsQuery } from "../../store/services/employeesService";
import {
  useGetMyMaterialRequestsQuery,
  useCreateMaterialRequestMutation,
  type MaterialRequest,
} from "../../store/services/materialRequestsService";

type RequestStatus = "pending" | "approved" | "rejected";

const statusConfig: Record<RequestStatus, { label: string; color: string; icon: any; bgColor: string }> = {
  pending:  { label: "Pending",  color: "text-yellow-600", icon: HiOutlineClock,        bgColor: "bg-yellow-100" },
  approved: { label: "Approved", color: "text-green-600",  icon: HiOutlineCheckCircle,  bgColor: "bg-green-100"  },
  rejected: { label: "Rejected", color: "text-red-600",    icon: HiOutlineXCircle,      bgColor: "bg-red-100"    },
};

export default function MaterialRequestPage() {
  const { userName } = useAuth();

  const { data: me } = useGetMyEmployeeProfileQuery();
  const employeeId = me?.id;

  const { data: myJobs = [] } = useGetEmployeeJobsQuery(
    { employeeId: employeeId! },
    { skip: !employeeId }
  );

  const { data: requests = [], isLoading, refetch } = useGetMyMaterialRequestsQuery();
  const [createRequest, { isLoading: isSubmitting }] = useCreateMaterialRequestMutation();

  const [showRequestModal, setShowRequestModal] = useState(false);
  const [selectedRequest, setSelectedRequest] = useState<MaterialRequest | null>(null);
  const [filter, setFilter] = useState<"all" | RequestStatus>("all");

  const [jobId, setJobId] = useState("");
  const [notes, setNotes] = useState("");
  const [materials, setMaterials] = useState([{ name: "", quantity: "", unit: "sheets" }]);

  const filteredRequests = filter === "all" ? requests : requests.filter((r) => r.status === filter);

  const addMaterialField = () => setMaterials([...materials, { name: "", quantity: "", unit: "sheets" }]);
  const removeMaterialField = (i: number) => setMaterials(materials.filter((_, idx) => idx !== i));
  const updateMaterial = (i: number, field: string, value: string) => {
    const updated = [...materials];
    updated[i] = { ...updated[i], [field]: value };
    setMaterials(updated);
  };

  const resetForm = () => {
    setJobId("");
    setNotes("");
    setMaterials([{ name: "", quantity: "", unit: "sheets" }]);
    setShowRequestModal(false);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    const validItems = materials.filter((m) => m.name && m.quantity);
    if (!validItems.length) return alert("Please add at least one material");
    await createRequest({
      jobId,
      notes,
      items: validItems.map((m) => ({ name: m.name, quantity: Number(m.quantity), unit: m.unit })),
    });
    resetForm();
    refetch();
  };

  return (
    <DashboardLayout userRole="worker" userName={userName ?? "Worker"} notificationCount={0}>
      <div className="space-y-6 font-[family-name:var(--font-family-primary)]">

        {/* Header */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
          <div>
            <h1 className="text-2xl md:text-3xl font-bold text-secondary-100">Material Requests</h1>
            <p className="text-sm text-custom-700 mt-1">Request materials from stock for your jobs</p>
          </div>
          <div className="flex items-center gap-2">
            <button
              onClick={refetch}
              disabled={isLoading}
              className="p-2 rounded-xl border border-custom-300 hover:bg-custom-100 transition-colors disabled:opacity-50"
            >
              <HiOutlineRefresh className={`w-5 h-5 text-custom-700 ${isLoading ? "animate-spin" : ""}`} />
            </button>
            <button
              onClick={() => setShowRequestModal(true)}
              className="px-4 py-2 rounded-xl bg-primary-500 text-white font-semibold hover:bg-primary-600 transition-colors text-sm flex items-center gap-2"
            >
              <HiOutlinePlus className="w-4 h-4" /> New Request
            </button>
          </div>
        </div>

        {/* Stats */}
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
          {(["all", "pending", "approved", "rejected"] as const).map((s) => {
            const count = s === "all" ? requests.length : requests.filter((r) => r.status === s).length;
            const cfg = s === "all" ? null : statusConfig[s];
            return (
              <Card key={s} className="!p-4">
                <div className="flex items-center gap-3 mb-2">
                  <div className={`w-10 h-10 rounded-xl flex items-center justify-center ${cfg ? cfg.bgColor : "bg-primary-100"}`}>
                    {s === "all"
                      ? <HiOutlineClipboardList className="w-5 h-5 text-primary-600" />
                      : cfg ? <cfg.icon className={`w-5 h-5 ${cfg.color}`} /> : null
                    }
                  </div>
                </div>
                <p className="text-2xl font-bold text-secondary-100">{isLoading ? "—" : count}</p>
                <p className="text-xs text-custom-700 capitalize">{s === "all" ? "Total Requests" : cfg!.label}</p>
              </Card>
            );
          })}
        </div>

        {/* Filter Tabs */}
        <div className="flex gap-2 overflow-x-auto">
          {(["all", "pending", "approved", "rejected"] as const).map((s) => {
            const count = s === "all" ? requests.length : requests.filter((r) => r.status === s).length;
            return (
              <button
                key={s}
                onClick={() => setFilter(s)}
                className={`px-4 py-2 rounded-xl transition-colors text-sm font-semibold whitespace-nowrap ${
                  filter === s ? "bg-primary-500 text-white" : "border border-custom-300 text-custom-700 hover:bg-custom-100"
                }`}
              >
                {s === "all" ? "All" : statusConfig[s].label} ({count})
              </button>
            );
          })}
        </div>

        {/* Table */}
        <Card className="!p-0 overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead className="bg-custom-100 border-b border-custom-300">
                <tr>
                  {["Request ID", "Job", "Materials", "Status", "Request Date", "Actions"].map((h) => (
                    <th key={h} className={`px-4 py-3 text-xs font-bold text-secondary-100 uppercase ${h === "Actions" ? "text-right" : "text-left"}`}>{h}</th>
                  ))}
                </tr>
              </thead>
              <tbody className="bg-white divide-y divide-custom-200">
                {isLoading ? (
                  <tr><td colSpan={6} className="px-4 py-8 text-center text-custom-700">Loading…</td></tr>
                ) : filteredRequests.length === 0 ? (
                  <tr><td colSpan={6} className="px-4 py-8 text-center text-custom-700">No requests found</td></tr>
                ) : filteredRequests.map((req) => {
                  const cfg = statusConfig[req.status];
                  const Icon = cfg.icon;
                  return (
                    <tr key={req.id} className="hover:bg-custom-50 transition-colors">
                      <td className="px-4 py-4"><span className="text-sm font-bold text-primary-600">{req.requestNumber}</span></td>
                      <td className="px-4 py-4">
                        <p className="text-sm font-semibold text-secondary-100">{req.job?.title ?? "—"}</p>
                        <p className="text-xs text-custom-700">{req.job?.jobNumber ?? req.jobId}</p>
                      </td>
                      <td className="px-4 py-4">
                        <div className="space-y-1">
                          {req.items.slice(0, 2).map((item, i) => (
                            <div key={i} className="text-xs text-secondary-100">• {item.name}: {item.quantity} {item.unit}</div>
                          ))}
                          {req.items.length > 2 && <p className="text-xs text-custom-700">+{req.items.length - 2} more</p>}
                        </div>
                      </td>
                      <td className="px-4 py-4">
                        <div className="flex items-center gap-2">
                          <Icon className={`w-4 h-4 ${cfg.color}`} />
                          <span className={`text-xs font-bold px-3 py-1 rounded-full ${cfg.bgColor} ${cfg.color}`}>{cfg.label}</span>
                        </div>
                      </td>
                      <td className="px-4 py-4"><span className="text-sm text-custom-700">{new Date(req.createdAt).toLocaleDateString()}</span></td>
                      <td className="px-4 py-4 text-right">
                        <button
                          onClick={() => setSelectedRequest(req)}
                          className="px-3 py-1.5 rounded-lg border border-custom-300 text-custom-700 hover:bg-custom-100 transition-colors text-xs font-semibold"
                        >
                          View Details
                        </button>
                      </td>
                    </tr>
                  );
                })}
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
                <button onClick={resetForm} className="text-custom-700 hover:text-secondary-100">
                  <HiOutlineX className="w-6 h-6" />
                </button>
              </div>

              <form onSubmit={handleSubmit} className="space-y-6">
                <div>
                  <label className="block text-sm font-semibold text-secondary-100 mb-2">Job *</label>
                  <select
                    value={jobId}
                    onChange={(e) => setJobId(e.target.value)}
                    required
                    className="w-full px-4 py-2.5 rounded-xl border border-custom-300 bg-style-500 text-secondary-100 focus:outline-none focus:border-primary-400 focus:ring-2 focus:ring-primary-200 transition-colors"
                  >
                    <option value="">Select a job</option>
                    {myJobs.map((job) => (
                      <option key={job.id} value={job.id}>
                        {job.jobNumber} — {job.title}
                      </option>
                    ))}
                  </select>
                </div>

                <div>
                  <div className="flex items-center justify-between mb-3">
                    <label className="block text-sm font-semibold text-secondary-100">Materials Needed *</label>
                    <button type="button" onClick={addMaterialField} className="text-sm text-primary-500 hover:text-primary-600 font-semibold flex items-center gap-1">
                      <HiOutlinePlus className="w-4 h-4" /> Add Material
                    </button>
                  </div>
                  <div className="space-y-3">
                    {materials.map((mat, i) => (
                      <div key={i} className="flex gap-2">
                        <Input type="text" placeholder="Material name" value={mat.name} onChange={(e) => updateMaterial(i, "name", e.target.value)} required fullWidth />
                        <Input type="number" placeholder="Qty" value={mat.quantity} onChange={(e) => updateMaterial(i, "quantity", e.target.value)} required className="w-24" />
                        <select
                          value={mat.unit}
                          onChange={(e) => updateMaterial(i, "unit", e.target.value)}
                          className="px-3 py-2 rounded-xl border border-custom-300 bg-style-500 text-secondary-100 focus:outline-none focus:border-primary-400"
                        >
                          {["sheets", "units", "rolls", "boxes", "kg", "liters", "meters"].map((u) => (
                            <option key={u} value={u}>{u.charAt(0).toUpperCase() + u.slice(1)}</option>
                          ))}
                        </select>
                        {materials.length > 1 && (
                          <button type="button" onClick={() => removeMaterialField(i)} className="p-2 rounded-lg hover:bg-red-100 transition-colors">
                            <HiOutlineX className="w-5 h-5 text-red-500" />
                          </button>
                        )}
                      </div>
                    ))}
                  </div>
                </div>

                <div>
                  <label className="block text-sm font-semibold text-secondary-100 mb-2">Notes</label>
                  <textarea
                    value={notes}
                    onChange={(e) => setNotes(e.target.value)}
                    rows={3}
                    placeholder="Add any additional notes or urgency information..."
                    className="w-full px-4 py-2.5 rounded-xl border border-custom-300 bg-style-500 text-secondary-100 focus:outline-none focus:border-primary-400 focus:ring-2 focus:ring-primary-200 transition-colors resize-none"
                  />
                </div>

                <div className="flex gap-3 justify-end pt-4 border-t border-custom-300">
                  <Button type="button" variant="outline" onClick={resetForm}>Cancel</Button>
                  <Button type="submit" disabled={isSubmitting}>{isSubmitting ? "Submitting…" : "Submit Request"}</Button>
                </div>
              </form>
            </Card>
          </div>
        )}

        {/* Details Modal */}
        {selectedRequest && (
          <div className="fixed inset-0 bg-secondary-100/50 z-50 flex items-center justify-center p-4">
            <Card className="!p-6 max-w-2xl w-full max-h-[90vh] overflow-y-auto">
              <div className="flex items-start justify-between mb-4">
                <div>
                  <h3 className="text-xl font-bold text-secondary-100">{selectedRequest.requestNumber}</h3>
                  <p className="text-sm text-custom-700 mt-1">
                    {selectedRequest.job?.title ?? "—"} ({selectedRequest.job?.jobNumber ?? selectedRequest.jobId})
                  </p>
                  <span className={`inline-block mt-2 text-xs font-bold px-3 py-1 rounded-full ${statusConfig[selectedRequest.status].bgColor} ${statusConfig[selectedRequest.status].color}`}>
                    {statusConfig[selectedRequest.status].label}
                  </span>
                </div>
                <button onClick={() => setSelectedRequest(null)} className="text-custom-700 hover:text-secondary-100">
                  <HiOutlineX className="w-6 h-6" />
                </button>
              </div>

              <div className="space-y-4">
                <div>
                  <p className="text-sm font-semibold text-custom-700 mb-3">Materials Requested</p>
                  <div className="space-y-2">
                    {selectedRequest.items.map((item, i) => (
                      <div key={i} className="p-3 rounded-xl bg-custom-50 border border-custom-200 flex items-center justify-between">
                        <span className="text-sm font-semibold text-secondary-100">{item.name}</span>
                        <span className="text-sm text-custom-700">{item.quantity} {item.unit}</span>
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
                  <div className={`p-4 rounded-xl ${selectedRequest.status === "approved" ? "bg-green-50 border border-green-200" : "bg-red-50 border border-red-200"}`}>
                    <p className={`text-sm font-semibold mb-1 ${selectedRequest.status === "approved" ? "text-green-900" : "text-red-900"}`}>Stock Response</p>
                    <p className={`text-sm ${selectedRequest.status === "approved" ? "text-green-800" : "text-red-800"}`}>{selectedRequest.responseNotes}</p>
                  </div>
                )}

                <div className="text-xs text-custom-700">
                  <p>Requested: {new Date(selectedRequest.createdAt).toLocaleString()}</p>
                  {selectedRequest.respondedAt && <p>Responded: {new Date(selectedRequest.respondedAt).toLocaleString()}</p>}
                </div>
              </div>

              <div className="flex justify-end mt-6 pt-4 border-t border-custom-300">
                <Button variant="outline" onClick={() => setSelectedRequest(null)}>Close</Button>
              </div>
            </Card>
          </div>
        )}
      </div>
    </DashboardLayout>
  );
}
