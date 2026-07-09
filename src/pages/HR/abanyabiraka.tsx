import { useState } from "react";
import {
  HiOutlinePlus,
  HiOutlineSearch,
  HiOutlinePencil,
  HiOutlineTrash,
  HiOutlineRefresh,
  HiOutlineX,
  HiOutlineEye,
} from "react-icons/hi";
import { DashboardLayout } from "../../components";
import { Button, Card } from "../../components/ui";
import PhoneInput from "../../components/ui/PhoneInput";
import {
  useGetCasualWorkersQuery,
  useCreateCasualWorkerMutation,
  useUpdateCasualWorkerMutation,
  useDeleteCasualWorkerMutation,
  type CasualWorker,
  type CasualWorkerPayload,
} from "../../store/services/casualWorkersService";

const inputCls =
  "w-full px-3 py-2 rounded-lg border border-custom-300 bg-white text-sm placeholder:text-custom-300 focus:outline-none focus:ring-2 focus:ring-primary-500";
const labelCls = "block text-xs font-semibold text-secondary-100 mb-1";

export default function Abanyabiraka() {
  const [search, setSearch] = useState("");
  const [page, setPage] = useState(1);
  const [showCreate, setShowCreate] = useState(false);
  const [editWorker, setEditWorker] = useState<CasualWorker | null>(null);
  const [deleteWorker, setDeleteWorker] = useState<CasualWorker | null>(null);
  const [viewWorker, setViewWorker] = useState<CasualWorker | null>(null);

  const { data, isLoading } = useGetCasualWorkersQuery({ page, limit: 10, search: search || undefined });
  const workers = data?.data ?? [];
  const total = data?.total ?? 0;
  const totalPages = Math.ceil(total / 10);

  return (
    <DashboardLayout>
      <div className="space-y-6">
        <div className="flex items-center justify-between flex-wrap gap-4">
          <div>
            <h1 className="text-3xl font-bold text-secondary-100">Casual Workers</h1>
            <p className="mt-1 text-sm text-custom-700">{total} total records</p>
          </div>
          <Button onClick={() => setShowCreate(true)} className="flex items-center gap-2 text-sm">
            <HiOutlinePlus className="h-4 w-4" /> Add Worker
          </Button>
        </div>

        <div className="relative max-w-sm">
          <HiOutlineSearch className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-custom-400" />
          <input
            type="text"
            value={search}
            onChange={(e) => { setSearch(e.target.value); setPage(1); }}
            placeholder="Search name or job…"
            className="w-full pl-9 pr-3 py-2 rounded-lg border border-custom-300 bg-white text-sm focus:outline-none focus:ring-2 focus:ring-primary-500"
          />
        </div>

        <Card className="!p-0 overflow-hidden">
          {isLoading ? (
            <div className="flex items-center justify-center py-16 gap-2 text-custom-500">
              <HiOutlineRefresh className="h-5 w-5 animate-spin" /> Loading…
            </div>
          ) : workers.length === 0 ? (
            <div className="py-16 text-center text-sm text-custom-400">No records found.</div>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full text-sm">
                <thead className="bg-custom-50 border-b border-custom-200">
                  <tr>
                    {["Full Name", "Phone", "Job Done", "Start Date", "End Date", "Days", "Daily Rate (RWF)", "Total (RWF)", "Actions"].map((h) => (
                      <th key={h} className="px-4 py-3 text-left text-xs font-bold text-custom-500 uppercase tracking-wider whitespace-nowrap">{h}</th>
                    ))}
                  </tr>
                </thead>
                <tbody className="divide-y divide-custom-100">
                  {workers.map((w) => (
                    <tr key={w.id} className="hover:bg-custom-50 transition-colors">
                      <td className="px-4 py-3 font-semibold text-secondary-100 whitespace-nowrap">{w.fullName}</td>
                      <td className="px-4 py-3 text-custom-700">{w.phoneNumber ?? "—"}</td>
                      <td className="px-4 py-3 text-custom-700">{w.jobDone}</td>
                      <td className="px-4 py-3 text-custom-700 whitespace-nowrap">{w.startDate?.slice(0, 10)}</td>
                      <td className="px-4 py-3 text-custom-700 whitespace-nowrap">{w.endDate?.slice(0, 10)}</td>
                      <td className="px-4 py-3 text-center text-custom-700">{w.daysWorked}</td>
                      <td className="px-4 py-3 text-custom-700">{w.dailyRate.toLocaleString()}</td>
                      <td className="px-4 py-3 font-semibold text-green-700">{w.totalAmount.toLocaleString()}</td>
                      <td className="px-4 py-3">
                        <div className="flex items-center gap-1">
                          <button
                            onClick={() => setViewWorker(w)}
                            className="p-1.5 rounded hover:bg-blue-50 text-custom-400 hover:text-blue-600 transition-colors"
                            title="View Details"
                          >
                            <HiOutlineEye className="h-4 w-4" />
                          </button>
                          <button
                            onClick={() => setEditWorker(w)}
                            className="p-1.5 rounded hover:bg-primary-50 text-custom-400 hover:text-primary-600 transition-colors"
                            title="Edit"
                          >
                            <HiOutlinePencil className="h-4 w-4" />
                          </button>
                          <button
                            onClick={() => setDeleteWorker(w)}
                            className="p-1.5 rounded hover:bg-red-50 text-custom-400 hover:text-red-600 transition-colors"
                            title="Delete"
                          >
                            <HiOutlineTrash className="h-4 w-4" />
                          </button>
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </Card>

        {totalPages > 1 && (
          <div className="flex items-center justify-between text-sm text-custom-500">
            <span>Page {page} of {totalPages}</span>
            <div className="flex gap-2">
              <Button variant="outline" onClick={() => setPage((p) => Math.max(1, p - 1))} disabled={page === 1} className="text-xs">Previous</Button>
              <Button variant="outline" onClick={() => setPage((p) => Math.min(totalPages, p + 1))} disabled={page === totalPages} className="text-xs">Next</Button>
            </div>
          </div>
        )}
      </div>

      {showCreate && <WorkerFormModal onClose={() => setShowCreate(false)} />}
      {editWorker && <WorkerFormModal worker={editWorker} onClose={() => setEditWorker(null)} />}
      {deleteWorker && <DeleteWorkerModal worker={deleteWorker} onClose={() => setDeleteWorker(null)} />}
      {viewWorker && <ViewWorkerModal worker={viewWorker} onClose={() => setViewWorker(null)} onEdit={() => { setViewWorker(null); setEditWorker(viewWorker); }} />}
    </DashboardLayout>
  );
}

// ─── Form Modal ───────────────────────────────────────────────────────────────

function WorkerFormModal({ worker, onClose }: { worker?: CasualWorker; onClose: () => void }) {
  const isEdit = !!worker;
  const [create, { isLoading: creating, error: createErr }] = useCreateCasualWorkerMutation();
  const [update, { isLoading: updating, error: updateErr }] = useUpdateCasualWorkerMutation();
  const isLoading = creating || updating;
  const error = createErr || updateErr;

  const [form, setForm] = useState({
    fullName: worker?.fullName ?? "",
    phoneNumber: worker?.phoneNumber ?? "",
    jobDone: worker?.jobDone ?? "",
    startDate: worker?.startDate?.slice(0, 10) ?? "",
    endDate: worker?.endDate?.slice(0, 10) ?? "",
    daysWorked: worker?.daysWorked ?? 1,
    dailyRate: worker?.dailyRate != null ? String(worker.dailyRate) : "",
    notes: worker?.notes ?? "",
  });

  // When editing, if daysWorked differs from what dates would compute → start with override ON
  const computedFromDates = (s: string, e: string) => {
    const start = new Date(s);
    const end = new Date(e);
    if (!isNaN(start.getTime()) && !isNaN(end.getTime()) && end >= start)
      return Math.round((end.getTime() - start.getTime()) / (1000 * 60 * 60 * 24)) + 1;
    return 1;
  };

  const [overrideDays, setOverrideDays] = useState(
    isEdit ? worker.daysWorked !== computedFromDates(worker.startDate, worker.endDate) : false
  );

  const set = (k: keyof typeof form, v: string | number) =>
    setForm((f) => ({ ...f, [k]: v }));

  function handleDateChange(k: "startDate" | "endDate", v: string) {
    setForm((f) => {
      const updated = { ...f, [k]: v };
      if (!overrideDays) {
        updated.daysWorked = computedFromDates(
          k === "startDate" ? v : f.startDate,
          k === "endDate" ? v : f.endDate,
        );
      }
      return updated;
    });
  }

  function handleOverrideToggle() {
    setOverrideDays((prev) => {
      if (prev) {
        // turning OFF override → re-compute from current dates
        setForm((f) => ({ ...f, daysWorked: computedFromDates(f.startDate, f.endDate) }));
      }
      return !prev;
    });
  }

  const totalAmount = (form.daysWorked || 0) * (parseFloat(String(form.dailyRate)) || 0);

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    const body: CasualWorkerPayload = {
      fullName: form.fullName,
      phoneNumber: form.phoneNumber || undefined,
      jobDone: form.jobDone,
      startDate: form.startDate,
      endDate: form.endDate,
      dailyRate: parseFloat(form.dailyRate) || 0,
      notes: form.notes || undefined,
      // only send daysWorked when user has manually overridden it
      ...(overrideDays ? { daysWorked: form.daysWorked } : {}),
    };
    try {
      if (isEdit) {
        await update({ id: worker.id, ...body }).unwrap();
      } else {
        await create(body).unwrap();
      }
      onClose();
    } catch { /* shown below */ }
  }

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 backdrop-blur-sm p-4">
      <div className="bg-white rounded-2xl shadow-2xl w-full max-w-lg max-h-[90vh] overflow-y-auto">
        <div className="flex items-center justify-between px-6 py-4 border-b border-custom-200 sticky top-0 bg-white z-10">
          <h2 className="text-lg font-bold text-secondary-100">{isEdit ? "Edit Worker" : "Add Casual Worker"}</h2>
          <button onClick={onClose} className="text-custom-400 hover:text-custom-700">
            <HiOutlineX className="h-5 w-5" />
          </button>
        </div>

        <form onSubmit={handleSubmit} className="p-6 space-y-4">
          <div className="grid grid-cols-2 gap-4">

            <div className="col-span-2">
              <label className={labelCls}>Full Name <span className="text-red-500">*</span></label>
              <input type="text" required value={form.fullName} onChange={(e) => set("fullName", e.target.value)}
                placeholder="e.g. Jean Claude Ndayishimiye" className={inputCls} />
            </div>

            <div className="col-span-2">
              <label className={labelCls}>Phone Number</label>
              <PhoneInput value={form.phoneNumber ?? ""} onChange={(val) => set("phoneNumber", val)} />
            </div>

            <div className="col-span-2">
              <label className={labelCls}>Job <span className="text-red-500">*</span></label>
              <input type="text" required value={form.jobDone} onChange={(e) => set("jobDone", e.target.value)}
                placeholder="e.g. Painting, Loading, Cleaning…" className={inputCls} />
            </div>

            <div>
              <label className={labelCls}>Start Date <span className="text-red-500">*</span></label>
              <input type="date" required value={form.startDate}
                onChange={(e) => handleDateChange("startDate", e.target.value)} className={inputCls} />
            </div>

            <div>
              <label className={labelCls}>End Date <span className="text-red-500">*</span></label>
              <input type="date" required value={form.endDate} min={form.startDate}
                onChange={(e) => handleDateChange("endDate", e.target.value)} className={inputCls} />
            </div>

            {/* Days worked row */}
            <div className="col-span-2">
              <div className="flex items-center justify-between mb-1">
                <label className={`${labelCls} !mb-0`}>Days Worked</label>
                <button type="button" onClick={handleOverrideToggle}
                  className={`text-xs font-semibold px-2 py-0.5 rounded-full border transition-colors ${
                    overrideDays
                      ? "border-orange-300 bg-orange-50 text-orange-600 hover:bg-orange-100"
                      : "border-custom-300 bg-custom-50 text-custom-500 hover:bg-custom-100"
                  }`}>
                  {overrideDays ? "Override ON — click to reset" : "Auto from dates — click to override"}
                </button>
              </div>
              <input
                type="number" min={0.5} step={0.5}
                value={form.daysWorked}
                onChange={(e) => set("daysWorked", parseFloat(e.target.value) || 1)}
                disabled={!overrideDays}
                className={inputCls + (!overrideDays ? " opacity-60 cursor-not-allowed bg-custom-50" : " border-orange-400 ring-1 ring-orange-300")}
              />
              {!overrideDays && (
                <p className="mt-1 text-xs text-custom-400">Auto-computed: {form.daysWorked} day{form.daysWorked !== 1 ? "s" : ""} (inclusive)</p>
              )}
            </div>

            <div>
              <label className={labelCls}>Daily Rate (RWF) <span className="text-red-500">*</span></label>
              <input type="number" required min={0} value={form.dailyRate}
                placeholder="e.g. 8000"
                onChange={(e) => set("dailyRate", e.target.value === "" ? "" : e.target.value.replace(/^0+(?=\d)/, ""))} className={inputCls} />
            </div>

            <div className="flex items-end">
              <div className="w-full rounded-lg bg-green-50 border border-green-200 px-4 py-3">
                <p className="text-xs text-custom-500 font-semibold">Total Amount</p>
                <p className="text-lg font-bold text-green-700 mt-0.5">
                  {totalAmount > 0 ? `${totalAmount.toLocaleString("en-RW")} RWF` : <span className="text-custom-400 text-sm font-normal">—</span>}
                </p>
              </div>
            </div>

            <div className="col-span-2">
              <label className={labelCls}>Notes</label>
              <textarea value={form.notes} onChange={(e) => set("notes", e.target.value)}
                rows={2} placeholder="Optional remarks…" className={inputCls + " resize-none"} />
            </div>

          </div>

          {error && (
            <div className="rounded-lg border border-red-300 bg-red-50 px-3 py-2 text-sm text-red-700">
              {(error as any)?.data?.message ?? "An error occurred."}
            </div>
          )}

          <div className="flex justify-end gap-2 pt-2 border-t border-custom-100">
            <Button variant="outline" type="button" onClick={onClose} className="text-sm">Cancel</Button>
            <Button type="submit" disabled={isLoading} className="text-sm">
              {isLoading ? "Saving…" : isEdit ? "Save Changes" : "Add Worker"}
            </Button>
          </div>
        </form>
      </div>
    </div>
  );
}

// ─── View Modal ───────────────────────────────────────────────────────────────

function ViewWorkerModal({ worker, onClose, onEdit }: { worker: CasualWorker; onClose: () => void; onEdit: () => void }) {
  const fmt = (d?: string) => d ? new Date(d).toLocaleDateString("en-GB", { day: "2-digit", month: "short", year: "numeric" }) : "—";

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 backdrop-blur-sm p-4">
      <div className="bg-white rounded-2xl shadow-2xl w-full max-w-md">

        {/* Header */}
        <div className="flex items-center justify-between px-6 py-4 border-b border-custom-200">
          <h2 className="text-lg font-bold text-secondary-100">Worker Details</h2>
          <button onClick={onClose} className="text-custom-400 hover:text-custom-700">
            <HiOutlineX className="h-5 w-5" />
          </button>
        </div>

        {/* Body */}
        <div className="px-6 py-5 space-y-4">

          {/* Name + job */}
          <div className="flex items-start gap-3">
            <div className="w-11 h-11 rounded-full bg-primary-100 flex items-center justify-center shrink-0 text-primary-600 font-bold text-lg">
              {worker.fullName.charAt(0).toUpperCase()}
            </div>
            <div>
              <p className="text-base font-bold text-secondary-100">{worker.fullName}</p>
              <p className="text-sm text-custom-700">{worker.jobDone}</p>
              {worker.phoneNumber && <p className="text-xs text-custom-500 mt-0.5">{worker.phoneNumber}</p>}
            </div>
          </div>

          <hr className="border-custom-100" />

          {/* Work period */}
          <div className="grid grid-cols-3 gap-3 text-center">
            <div className="rounded-lg bg-custom-50 border border-custom-200 py-3 px-2">
              <p className="text-xs text-custom-500 mb-1">Start Date</p>
              <p className="text-sm font-semibold text-secondary-100">{fmt(worker.startDate)}</p>
            </div>
            <div className="rounded-lg bg-custom-50 border border-custom-200 py-3 px-2">
              <p className="text-xs text-custom-500 mb-1">End Date</p>
              <p className="text-sm font-semibold text-secondary-100">{fmt(worker.endDate)}</p>
            </div>
            <div className="rounded-lg bg-blue-50 border border-blue-200 py-3 px-2">
              <p className="text-xs text-blue-500 mb-1">Days</p>
              <p className="text-sm font-bold text-blue-700">{worker.daysWorked}</p>
            </div>
          </div>

          {/* Financials */}
          <div className="grid grid-cols-2 gap-3">
            <div className="rounded-lg bg-custom-50 border border-custom-200 p-3">
              <p className="text-xs text-custom-500 mb-0.5">Daily Rate</p>
              <p className="text-sm font-semibold text-secondary-100">{worker.dailyRate.toLocaleString()} RWF</p>
            </div>
            <div className="rounded-lg bg-green-50 border border-green-200 p-3">
              <p className="text-xs text-green-600 mb-0.5">Total Amount</p>
              <p className="text-base font-bold text-green-700">{worker.totalAmount.toLocaleString()} RWF</p>
            </div>
          </div>

          {/* Notes */}
          {worker.notes && (
            <div className="rounded-lg bg-yellow-50 border border-yellow-200 px-4 py-3">
              <p className="text-xs font-semibold text-yellow-700 mb-1">Notes</p>
              <p className="text-sm text-custom-700">{worker.notes}</p>
            </div>
          )}

          {/* Created at */}
          {worker.createdAt && (
            <p className="text-xs text-custom-400 text-right">Added on {fmt(worker.createdAt)}</p>
          )}
        </div>

        {/* Footer */}
        <div className="px-6 py-4 border-t border-custom-200 flex gap-3">
          <Button variant="outline" fullWidth onClick={onClose} className="text-sm">Close</Button>
          <Button fullWidth onClick={onEdit} className="text-sm flex items-center justify-center gap-1.5">
            <HiOutlinePencil className="h-4 w-4" /> Edit
          </Button>
        </div>

      </div>
    </div>
  );
}

// ─── Delete Modal ─────────────────────────────────────────────────────────────

function DeleteWorkerModal({ worker, onClose }: { worker: CasualWorker; onClose: () => void }) {
  const [deleteWorker, { isLoading, error }] = useDeleteCasualWorkerMutation();

  async function handleDelete() {
    try {
      await deleteWorker(worker.id).unwrap();
      onClose();
    } catch { /* shown below */ }
  }

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 backdrop-blur-sm p-4">
      <div className="bg-white rounded-2xl shadow-2xl w-full max-w-sm">
        <div className="px-6 py-4 border-b border-custom-200">
          <h2 className="text-lg font-bold text-secondary-100">Delete Worker</h2>
        </div>
        <div className="p-6 space-y-4">
          <p className="text-sm text-custom-700">
            Delete <span className="font-bold text-secondary-100">{worker.fullName}</span>? This cannot be undone.
          </p>
          {error && (
            <div className="rounded-lg border border-red-300 bg-red-50 px-3 py-2 text-sm text-red-700">
              {(error as any)?.data?.message ?? "Failed to delete."}
            </div>
          )}
          <div className="flex justify-end gap-2">
            <Button variant="outline" onClick={onClose} className="text-sm">Cancel</Button>
            <button onClick={handleDelete} disabled={isLoading}
              className="px-4 py-2 rounded-lg bg-red-600 hover:bg-red-700 text-white text-sm font-semibold disabled:opacity-50">
              {isLoading ? "Deleting…" : "Delete"}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
