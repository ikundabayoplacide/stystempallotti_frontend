import { useState } from "react";
import { HiOutlineX, HiOutlineSearch, HiOutlineRefresh,
  HiOutlineUsers, HiOutlineCash, HiOutlinePencil, HiOutlineTrash,
  HiOutlineEye,
} from "react-icons/hi";
import { toast } from "react-toastify";
import DashboardLayout from "../../components/DashboardLayout";
import { Card } from "../../components/ui";
import PhoneInput from "../../components/ui/PhoneInput";
import {
  useGetCasualWorkersQuery,
  useCreateCasualWorkerMutation,
  useUpdateCasualWorkerMutation,
  useDeleteCasualWorkerMutation,
  type CasualWorker, type CasualWorkerPayload,
} from "../../store/services/casualWorkersService";

const inputCls = "w-full px-3 py-2 rounded-xl border border-custom-300 bg-style-500 text-secondary-100 text-sm focus:outline-none focus:border-primary-400 transition-colors";
const labelCls = "block text-sm font-semibold text-secondary-100 mb-1";

// ─── Add / Edit Modal ─────────────────────────────────────────────────────────
function WorkerModal({ worker, onClose }: { worker?: CasualWorker; onClose: () => void }) {
  const isEdit = !!worker;
  const [form, setForm] = useState({
    fullName:    worker?.fullName    ?? "",
    phoneNumber: worker?.phoneNumber ?? "",
    jobDone:     worker?.jobDone     ?? "",
    startDate:   worker?.startDate?.split("T")[0] ?? "",
    endDate:     worker?.endDate?.split("T")[0]   ?? "",
    dailyRate:   String(worker?.dailyRate ?? ""),
    notes:       worker?.notes ?? "",
  });
  const [phoneError, setPhoneError] = useState("");
  const [createWorker, { isLoading: creating }] = useCreateCasualWorkerMutation();
  const [updateWorker, { isLoading: updating }] = useUpdateCasualWorkerMutation();
  const isLoading = creating || updating;

  const set = (key: string) => (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) =>
    setForm(prev => ({ ...prev, [key]: e.target.value }));

  const days = (() => {
    if (!form.startDate || !form.endDate) return 0;
    const diff = new Date(form.endDate).getTime() - new Date(form.startDate).getTime();
    return Math.max(0, Math.ceil(diff / 86400000) + 1);
  })();
  const total = days * (Number(form.dailyRate) || 0);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (form.phoneNumber && form.phoneNumber.replace(/\D/g, "").length < 9) {
      setPhoneError("Enter a valid phone number."); return;
    }
    setPhoneError("");
    const payload: CasualWorkerPayload = {
      fullName: form.fullName, phoneNumber: form.phoneNumber || undefined,
      jobDone: form.jobDone, startDate: form.startDate, endDate: form.endDate,
      dailyRate: Number(form.dailyRate), notes: form.notes || undefined,
    };
    try {
      if (isEdit) {
        await updateWorker({ id: worker!.id, ...payload }).unwrap();
        toast.success("Worker updated");
      } else {
        await createWorker(payload).unwrap();
        toast.success("Worker added");
      }
      onClose();
    } catch (err: any) { toast.error(err?.data?.message ?? "Failed"); }
  };

  return (
    <div className="fixed inset-0 bg-secondary-100/50 z-50 flex items-start justify-center p-4 overflow-y-auto">
      <Card className="!p-6 max-w-2xl w-full my-8">
        <div className="flex items-center justify-between mb-5">
          <div>
            <h3 className="text-xl font-bold text-secondary-100">{isEdit ? "Edit Worker" : "Add Casual Worker"}</h3>
            <p className="text-sm text-custom-700 mt-0.5">Abanyabiraka payment record</p>
          </div>
          <button onClick={onClose} className="text-custom-700 hover:text-secondary-100"><HiOutlineX className="w-6 h-6" /></button>
        </div>
        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className={labelCls}>Full Name *</label>
              <input value={form.fullName} onChange={set("fullName")} placeholder="Full name" className={inputCls} required />
            </div>
            <div>
              <label className={labelCls}>Phone Number</label>
              <PhoneInput value={form.phoneNumber} onChange={val => { setForm(prev => ({ ...prev, phoneNumber: val })); setPhoneError(""); }} error={phoneError} />
            </div>
          </div>
          <div>
            <label className={labelCls}>Job Done *</label>
            <input value={form.jobDone} onChange={set("jobDone")} placeholder="e.g. Cleaning, Loading, Packaging" className={inputCls} required />
          </div>
          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className={labelCls}>Start Date *</label>
              <input type="date" value={form.startDate} onChange={set("startDate")} className={inputCls} required />
            </div>
            <div>
              <label className={labelCls}>End Date *</label>
              <input type="date" value={form.endDate} onChange={set("endDate")} className={inputCls} required />
            </div>
          </div>
          <div>
            <label className={labelCls}>Daily Rate (RWF) *</label>
            <input type="number" min="0" value={form.dailyRate} onChange={set("dailyRate")} placeholder="0" className={inputCls} required />
          </div>

          {/* Auto-calculated summary */}
          {days > 0 && Number(form.dailyRate) > 0 && (
            <div className="grid grid-cols-2 gap-3">
              <div className="px-4 py-3 rounded-xl bg-custom-50 border border-custom-200 text-center">
                <p className="text-xs text-custom-700">Days Worked</p>
                <p className="text-2xl font-bold text-secondary-100">{days}</p>
              </div>
              <div className="px-4 py-3 rounded-xl bg-primary-50 border border-primary-200 text-center">
                <p className="text-xs text-primary-700">Total to Pay</p>
                <p className="text-2xl font-bold text-primary-600">{total.toLocaleString()} <span className="text-sm font-normal">RWF</span></p>
              </div>
            </div>
          )}

          <div>
            <label className={labelCls}>Notes <span className="font-normal text-custom-700">(optional)</span></label>
            <textarea value={form.notes} onChange={set("notes")} rows={2} placeholder="Any additional notes..."
              className="w-full px-3 py-2 rounded-xl border border-custom-300 bg-style-500 text-secondary-100 text-sm focus:outline-none focus:border-primary-400 transition-colors resize-none" />
          </div>

          <div className="flex gap-3 justify-end pt-2 border-t border-custom-300">
            <button type="button" onClick={onClose} className="px-4 py-2 rounded-xl border border-custom-300 text-sm font-semibold text-secondary-100 hover:bg-custom-100 transition-colors">Cancel</button>
            <button type="submit" disabled={isLoading} className="px-4 py-2 rounded-xl bg-primary-500 text-white text-sm font-semibold hover:bg-primary-600 transition-colors disabled:opacity-40">
              {isLoading ? "Saving..." : isEdit ? "Save Changes" : "Add Worker"}
            </button>
          </div>
        </form>
      </Card>
    </div>
  );
}

// ─── View Modal ───────────────────────────────────────────────────────────────
function ViewModal({ worker, onClose }: { worker: CasualWorker; onClose: () => void }) {
  return (
    <div className="fixed inset-0 bg-secondary-100/50 z-50 flex items-center justify-center p-4">
      <Card className="!p-6 max-w-md w-full">
        <div className="flex items-center justify-between mb-5">
          <h3 className="text-lg font-bold text-secondary-100">{worker.fullName}</h3>
          <button onClick={onClose} className="text-custom-700 hover:text-secondary-100"><HiOutlineX className="w-5 h-5" /></button>
        </div>
        <div className="rounded-xl bg-custom-50 border border-custom-200 divide-y divide-custom-200 mb-4">
          {([
            ["Job Done",      worker.jobDone],
            ["Phone",         worker.phoneNumber ?? "—"],
            ["Start Date",    worker.startDate?.split("T")[0] ?? "—"],
            ["End Date",      worker.endDate?.split("T")[0]   ?? "—"],
            ["Days Worked",   String(worker.daysWorked)],
            ["Daily Rate",    `${Number(worker.dailyRate).toLocaleString()} RWF`],
            ["Total Amount",  `${Number(worker.totalAmount).toLocaleString()} RWF`],
            ...(worker.notes ? [["Notes", worker.notes]] : []),
          ] as [string, string][]).map(([label, value]) => (
            <div key={label} className="flex justify-between px-4 py-2.5 text-sm">
              <span className="text-custom-700">{label}</span>
              <span className="font-semibold text-secondary-100 text-right max-w-[60%]">{value}</span>
            </div>
          ))}
        </div>
        <button onClick={onClose} className="w-full px-4 py-2 rounded-xl border border-custom-300 text-sm font-semibold text-secondary-100 hover:bg-custom-100 transition-colors">Close</button>
      </Card>
    </div>
  );
}

// ─── Main Page ────────────────────────────────────────────────────────────────
export default function CashierCasualWorkersPage() {
  const [search, setSearch]           = useState("");
  const [page, setPage]               = useState(1);
  const [showCreate, setShowCreate]   = useState(false);
  const [editWorker, setEditWorker]   = useState<CasualWorker | null>(null);
  const [viewWorker, setViewWorker]   = useState<CasualWorker | null>(null);
  const [delTarget, setDelTarget]     = useState<CasualWorker | null>(null);
  const [deleteWorker, { isLoading: deleting }] = useDeleteCasualWorkerMutation();

  const { data, isLoading, isFetching, refetch } = useGetCasualWorkersQuery({ page, limit: 10, search: search || undefined });
  const workers    = data?.data ?? [];
  const total      = data?.total ?? 0;
  const totalPages = Math.ceil(total / 10) || 1;

  const totalOwed   = workers.reduce((s, w) => s + Number(w.totalAmount), 0);
  const totalDays   = workers.reduce((s, w) => s + w.daysWorked, 0);

  const handleDelete = async () => {
    if (!delTarget) return;
    try {
      await deleteWorker(delTarget.id).unwrap();
      toast.success("Worker removed");
      setDelTarget(null);
    } catch (err: any) { toast.error(err?.data?.message ?? "Failed to delete"); }
  };

  return (
    <DashboardLayout>
      <div className="space-y-6 font-[family-name:var(--font-family-primary)]">

        {/* Header */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
          <div>
            <div className="flex items-center gap-2 mb-1">
              <HiOutlineUsers className="w-6 h-6 text-primary-500" />
              <h1 className="text-2xl md:text-3xl font-bold text-secondary-100">Casual Workers</h1>
            </div>
            <p className="text-sm text-custom-700">Abanyabiraka — manage and pay casual worker records · {total} total</p>
          </div>
          <div className="flex items-center gap-2 self-start sm:self-auto">
            <button onClick={() => refetch()} className="p-2 rounded-xl border border-custom-300 hover:bg-custom-100 transition-colors">
              <HiOutlineRefresh className={`w-4 h-4 text-custom-700 ${isFetching ? "animate-spin" : ""}`} />
            </button>
           
          </div>
        </div>

        {/* KPIs */}
        <div className="grid grid-cols-2 sm:grid-cols-3 gap-3">
          <Card className="!p-4">
            <p className="text-xs text-custom-700">Total Workers</p>
            <p className="text-xl font-bold text-secondary-100">{total}</p>
            <p className="text-xs text-custom-700">on record</p>
          </Card>
          <Card className="!p-4">
            <p className="text-xs text-custom-700">Total Owed</p>
            <p className="text-xl font-bold text-primary-500">{totalOwed.toLocaleString()}</p>
            <p className="text-xs text-custom-700">RWF</p>
          </Card>
          <Card className="!p-4">
            <p className="text-xs text-custom-700">Total Days</p>
            <p className="text-xl font-bold text-secondary-100">{totalDays}</p>
            <p className="text-xs text-custom-700">days worked</p>
          </Card>
        </div>

        {/* Search */}
        <div className="relative max-w-sm">
          <HiOutlineSearch className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-custom-400" />
          <input value={search} onChange={e => { setSearch(e.target.value); setPage(1); }} placeholder="Search name or job…"
            className="w-full pl-9 pr-3 py-2 rounded-xl border border-custom-300 bg-style-500 text-secondary-100 text-sm focus:outline-none focus:border-primary-400 transition-colors" />
        </div>

        {/* Table */}
        <Card className="!p-0 overflow-hidden">
          {isLoading ? (
            <div className="space-y-3 p-4">{[1,2,3,4].map(i => <div key={i} className="h-14 bg-custom-100 rounded-xl animate-pulse" />)}</div>
          ) : workers.length === 0 ? (
            <div className="py-16 text-center">
              <HiOutlineUsers className="w-10 h-10 text-custom-300 mx-auto mb-2" />
              <p className="text-sm text-custom-700">No casual workers found</p>
            </div>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full text-sm">
                <thead className="bg-custom-50 border-b border-custom-200">
                  <tr>
                    {["Full Name", "Phone", "Job Done", "Start", "End", "Days", "Daily Rate", "Total (RWF)", "Actions"].map(h => (
                      <th key={h} className="px-4 py-3 text-left text-xs font-bold text-custom-500 uppercase tracking-wider whitespace-nowrap">{h}</th>
                    ))}
                  </tr>
                </thead>
                <tbody className="divide-y divide-custom-100">
                  {workers.map(w => (
                    <tr key={w.id} className="hover:bg-custom-50 transition-colors">
                      <td className="px-4 py-3 font-semibold text-secondary-100 whitespace-nowrap">{w.fullName}</td>
                      <td className="px-4 py-3 text-custom-700 whitespace-nowrap">{w.phoneNumber ?? "—"}</td>
                      <td className="px-4 py-3 text-secondary-100 max-w-[140px] truncate">{w.jobDone}</td>
                      <td className="px-4 py-3 text-custom-700 whitespace-nowrap">{w.startDate?.split("T")[0] ?? "—"}</td>
                      <td className="px-4 py-3 text-custom-700 whitespace-nowrap">{w.endDate?.split("T")[0] ?? "—"}</td>
                      <td className="px-4 py-3 font-bold text-secondary-100 text-center">{w.daysWorked}</td>
                      <td className="px-4 py-3 text-secondary-100 whitespace-nowrap">{Number(w.dailyRate).toLocaleString()}</td>
                      <td className="px-4 py-3">
                        <span className="font-bold text-primary-500">{Number(w.totalAmount).toLocaleString()}</span>
                      </td>
                      <td className="px-4 py-3">
                        <div className="flex items-center gap-1">
                          <button onClick={() => setViewWorker(w)} className="p-1.5 rounded-lg hover:bg-custom-100 transition-colors text-custom-700" title="View"><HiOutlineEye className="w-4 h-4" /></button>
                          <button onClick={() => setEditWorker(w)} className="p-1.5 rounded-lg hover:bg-custom-100 transition-colors text-custom-700" title="Edit"><HiOutlinePencil className="w-4 h-4" /></button>
                          <button onClick={() => setDelTarget(w)} className="p-1.5 rounded-lg hover:bg-red-50 transition-colors text-red-500" title="Delete"><HiOutlineTrash className="w-4 h-4" /></button>
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </Card>

        {/* Pay summary banner */}
        {totalOwed > 0 && (
          <div className="flex items-center justify-between px-5 py-4 rounded-xl bg-primary-50 border border-primary-200">
            <div className="flex items-center gap-3">
              <HiOutlineCash className="w-6 h-6 text-primary-500 shrink-0" />
              <div>
                <p className="text-sm font-bold text-primary-700">Total payable to casual workers</p>
                <p className="text-xs text-primary-600">{total} workers · {totalDays} total days worked</p>
              </div>
            </div>
            <p className="text-2xl font-bold text-primary-600">{totalOwed.toLocaleString()} <span className="text-sm font-normal">RWF</span></p>
          </div>
        )}

        {/* Pagination */}
        {totalPages > 1 && (
          <div className="flex items-center justify-center gap-2">
            <button onClick={() => setPage(p => Math.max(1, p - 1))} disabled={page === 1}
              className="px-3 py-1.5 rounded-lg border border-custom-300 text-sm font-semibold text-secondary-100 hover:bg-custom-100 disabled:opacity-40 transition-colors">← Prev</button>
            <span className="text-sm text-custom-700">Page {page} of {totalPages}</span>
            <button onClick={() => setPage(p => Math.min(totalPages, p + 1))} disabled={page === totalPages}
              className="px-3 py-1.5 rounded-lg border border-custom-300 text-sm font-semibold text-secondary-100 hover:bg-custom-100 disabled:opacity-40 transition-colors">Next →</button>
          </div>
        )}

        {/* Modals */}
        {showCreate  && <WorkerModal onClose={() => setShowCreate(false)} />}
        {editWorker  && <WorkerModal worker={editWorker} onClose={() => setEditWorker(null)} />}
        {viewWorker  && <ViewModal worker={viewWorker} onClose={() => setViewWorker(null)} />}

        {/* Delete confirm */}
        {delTarget && (
          <div className="fixed inset-0 bg-secondary-100/50 z-50 flex items-center justify-center p-4">
            <Card className="!p-6 max-w-sm w-full">
              <h3 className="text-lg font-bold text-secondary-100 mb-2">Remove Worker</h3>
              <p className="text-sm text-custom-700 mb-4">Remove <span className="font-bold text-secondary-100">{delTarget.fullName}</span> from records? This cannot be undone.</p>
              <div className="flex gap-3 justify-end">
                <button onClick={() => setDelTarget(null)} className="px-4 py-2 rounded-xl border border-custom-300 text-sm font-semibold text-secondary-100 hover:bg-custom-100 transition-colors">Cancel</button>
                <button onClick={handleDelete} disabled={deleting} className="px-4 py-2 rounded-xl bg-red-500 text-white text-sm font-semibold hover:bg-red-600 transition-colors disabled:opacity-40">
                  {deleting ? "Removing..." : "Remove"}
                </button>
              </div>
            </Card>
          </div>
        )}

      </div>
    </DashboardLayout>
  );
}
