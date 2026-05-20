import { useState } from "react";
import { toast } from "react-toastify";
import {
  HiOutlineChevronDoubleLeft,
  HiOutlineChevronDoubleRight,
  HiOutlineChevronLeft,
  HiOutlineChevronRight,
  HiOutlineLocationMarker,
  HiOutlineLogin,
  HiOutlineLogout,
  HiOutlineMail,
  HiOutlineOfficeBuilding,
  HiOutlinePencil,
  HiOutlinePhone,
  HiOutlinePlus,
  HiOutlineSearch,
  HiOutlineUsers,
  HiOutlineX,
} from "react-icons/hi";
import { DashboardLayout } from "../../components";
import { Button, Card, Input, PhoneInput } from "../../components/ui";
import {
  useGetCustomersQuery,
  useCreateCustomerMutation,
  useUpdateCustomerMutation,
  type CustomerType,
  type Customer,
  type CreateCustomerPayload,
} from "../../store/services/customersService";
import {
  useGetVisitsQuery,
  useCheckInMutation,
  useCheckOutMutation,
  type Visit,
  type VisitType,
} from "../../store/services/visitsService";

// ─── Notes cell ───────────────────────────────────────────────────────────────

const MAX_NOTE_LENGTH = 60;

function NoteCell({ text }: { text: string }) {
  const [expanded, setExpanded] = useState(false);
  if (!text) return <span className="text-custom-400 text-xs">—</span>;
  const isLong = text.length > MAX_NOTE_LENGTH;
  const displayed = expanded || !isLong ? text : text.slice(0, MAX_NOTE_LENGTH) + "…";
  return (
    <div className="text-xs text-custom-700 max-w-[180px]">
      <span className="whitespace-pre-wrap break-words">{displayed}</span>
      {isLong && (
        <button onClick={() => setExpanded((v) => !v)}
          className="ml-1 text-primary-500 hover:underline font-semibold whitespace-nowrap">
          {expanded ? "less" : "more"}
        </button>
      )}
    </div>
  );
}

// ─── Constants ────────────────────────────────────────────────────────────────

const typeColor: Record<CustomerType, string> = {
  BUSINESS: "bg-blue-100 text-blue-700",
  VISITOR:  "bg-purple-100 text-purple-700",
  BOUTIQUE: "bg-pink-100 text-pink-700",
};
const typeLabel: Record<CustomerType, string> = {
  BUSINESS: "Business",
  VISITOR:  "Visit",
  BOUTIQUE: "Boutique",
};
const PAGE_SIZE_OPTIONS = [5, 10, 20, 50];
const DEFAULT_PAGE_SIZE = 10;

const selectCls =
  "w-full px-4 py-2.5 rounded-xl border border-custom-300 bg-style-500 text-secondary-100 " +
  "focus:outline-none focus:border-primary-400 focus:ring-2 focus:ring-primary-200 transition-colors duration-200";

// ─── Pagination ───────────────────────────────────────────────────────────────

interface PaginationProps {
  page: number; totalPages: number; total: number; pageSize: number;
  onPageChange: (p: number) => void; onPageSizeChange: (s: number) => void;
}
function Pagination({ page, totalPages, total, pageSize, onPageChange, onPageSizeChange }: PaginationProps) {
  const from = total === 0 ? 0 : (page - 1) * pageSize + 1;
  const to = Math.min(page * pageSize, total);
  const pages: (number | "…")[] = [];
  const addPage = (n: number) => { if (!pages.includes(n)) pages.push(n); };
  addPage(1);
  if (page - 2 > 2) pages.push("…");
  for (let i = Math.max(2, page - 1); i <= Math.min(totalPages - 1, page + 1); i++) addPage(i);
  if (page + 2 < totalPages - 1) pages.push("…");
  if (totalPages > 1) addPage(totalPages);
  return (
    <div className="flex flex-col sm:flex-row items-center justify-between gap-3 px-4 py-3 border-t border-custom-200">
      <div className="flex items-center gap-3 text-xs text-custom-700">
        <span>{total === 0 ? "No records" : `${from}–${to} of ${total}`}</span>
        <label className="hidden sm:flex items-center gap-1.5">Rows:
          <select value={pageSize} onChange={(e) => onPageSizeChange(Number(e.target.value))}
            className="px-2 py-1 rounded-lg border border-custom-300 bg-style-500 text-secondary-100 focus:outline-none">
            {PAGE_SIZE_OPTIONS.map((s) => <option key={s} value={s}>{s}</option>)}
          </select>
        </label>
      </div>
      <div className="flex items-center gap-1">
        <button onClick={() => onPageChange(1)} disabled={page <= 1}
          className="p-1.5 rounded-lg border border-custom-300 disabled:opacity-40 hover:bg-custom-100 transition-colors">
          <HiOutlineChevronDoubleLeft className="w-4 h-4" />
        </button>
        <button onClick={() => onPageChange(page - 1)} disabled={page <= 1}
          className="p-1.5 rounded-lg border border-custom-300 disabled:opacity-40 hover:bg-custom-100 transition-colors">
          <HiOutlineChevronLeft className="w-4 h-4" />
        </button>
        {pages.map((p, i) =>
          p === "…" ? <span key={`e-${i}`} className="px-2 text-custom-700 text-sm">…</span> : (
            <button key={p} onClick={() => onPageChange(p as number)}
              className={`min-w-[32px] h-8 px-2 rounded-lg border text-sm font-semibold transition-colors ${
                p === page ? "bg-primary-500 border-primary-500 text-white" : "border-custom-300 text-secondary-100 hover:bg-custom-100"
              }`}>{p}</button>
          )
        )}
        <button onClick={() => onPageChange(page + 1)} disabled={page >= totalPages}
          className="p-1.5 rounded-lg border border-custom-300 disabled:opacity-40 hover:bg-custom-100 transition-colors">
          <HiOutlineChevronRight className="w-4 h-4" />
        </button>
        <button onClick={() => onPageChange(totalPages)} disabled={page >= totalPages}
          className="p-1.5 rounded-lg border border-custom-300 disabled:opacity-40 hover:bg-custom-100 transition-colors">
          <HiOutlineChevronDoubleRight className="w-4 h-4" />
        </button>
      </div>
    </div>
  );
}

// ─── Visit Modal ──────────────────────────────────────────────────────────────

interface VisitModalProps {
  customer: Customer;
  activeVisit: Visit | null;
  onClose: () => void;
  onDone: (checkedOutCustomerId?: string) => void;
}
function VisitModal({ customer, activeVisit, onClose, onDone }: VisitModalProps) {
  const [purpose, setPurpose] = useState("");
  const [notes, setNotes] = useState("");
  const [checkIn, { isLoading: checkingIn }] = useCheckInMutation();
  const [checkOut, { isLoading: checkingOut }] = useCheckOutMutation();
  const isLoading = checkingIn || checkingOut;
  const isCheckOut = !!activeVisit;

  const handleCheckIn = async () => {
    try {
      await checkIn({ customerId: customer.id, purpose: purpose.trim() || undefined, notes: notes.trim() || undefined }).unwrap();
      toast.success(`${customer.name} checked in`);
      onDone();
    } catch (e: unknown) {
      const err = e as { data?: { message?: string } };
      toast.error(err?.data?.message ?? "Check-in failed");
    }
  };

  const handleCheckOut = async () => {
    if (!activeVisit) return;
    try {
      await checkOut(activeVisit.id).unwrap();
      toast.success(`${customer.name} checked out`);
      onDone(customer.id);
    } catch (e: unknown) {
      const err = e as { data?: { message?: string } };
      toast.error(err?.data?.message ?? "Check-out failed");
    }
  };

  return (
    <div className="fixed inset-0 bg-secondary-100/60 z-50 flex items-center justify-center p-4">
      <Card className="!p-6 max-w-sm w-full">
        <div className="flex items-center justify-between mb-5">
          <div className="flex items-center gap-3">
            <div className={`w-10 h-10 rounded-xl flex items-center justify-center ${isCheckOut ? "bg-orange-100" : "bg-emerald-100"}`}>
              {isCheckOut
                ? <HiOutlineLogout className="w-5 h-5 text-orange-600" />
                : <HiOutlineLogin className="w-5 h-5 text-emerald-600" />}
            </div>
            <div>
              <h3 className="text-base font-bold text-secondary-100">{isCheckOut ? "Check Out" : "Check In"}</h3>
              <p className="text-xs text-custom-700">{customer.name}</p>
            </div>
          </div>
          <button onClick={onClose} className="text-custom-700 hover:text-secondary-100"><HiOutlineX className="w-5 h-5" /></button>
        </div>

        {/* Customer info */}
        <div className="rounded-xl bg-custom-50 border border-custom-300 p-3 mb-4 space-y-1 text-sm">
          {customer.phone && (
            <div className="flex items-center gap-2 text-custom-700">
              <HiOutlinePhone className="w-3.5 h-3.5 shrink-0" />{customer.phone}
            </div>
          )}
          {customer.company && (
            <div className="flex items-center gap-2 text-custom-700">
              <HiOutlineOfficeBuilding className="w-3.5 h-3.5 shrink-0" />{customer.company}
            </div>
          )}
          {isCheckOut && activeVisit && (
            <div className="text-xs text-custom-600 pt-1 border-t border-custom-200 mt-1">
              Checked in: {new Date(activeVisit.checkinAt).toLocaleTimeString()}
              {activeVisit.purpose && <span className="ml-2">· {activeVisit.purpose}</span>}
            </div>
          )}
        </div>

        {/* Check-in fields */}
        {!isCheckOut && (
          <div className="space-y-3 mb-5">
            <div>
              <label className="block text-sm font-semibold text-secondary-100 mb-1.5">
                Purpose <span className="text-xs text-custom-600 font-normal">(optional)</span>
              </label>
              <input type="text" value={purpose} onChange={(e) => setPurpose(e.target.value)}
                placeholder="e.g. Job pickup, Meeting, Inquiry…"
                className="w-full px-3 py-2 rounded-xl border border-custom-300 bg-style-500 text-secondary-100 text-sm focus:outline-none focus:border-primary-400 focus:ring-2 focus:ring-primary-200 transition-colors" />
            </div>
            <div>
              <label className="block text-sm font-semibold text-secondary-100 mb-1.5">
                Notes <span className="text-xs text-custom-600 font-normal">(optional)</span>
              </label>
              <textarea value={notes} onChange={(e) => setNotes(e.target.value)} rows={2}
                placeholder="Any additional notes…"
                className="w-full px-3 py-2 rounded-xl border border-custom-300 bg-style-500 text-secondary-100 text-sm focus:outline-none focus:border-primary-400 focus:ring-2 focus:ring-primary-200 transition-colors resize-none" />
            </div>
          </div>
        )}

        {isCheckOut && (
          <p className="text-sm text-custom-700 mb-5">
            Confirm check-out for <span className="font-semibold text-secondary-100">{customer.name}</span>?
          </p>
        )}

        <div className="flex gap-3">
          <Button variant="outline" onClick={onClose} fullWidth>Cancel</Button>
          <Button onClick={isCheckOut ? handleCheckOut : handleCheckIn} disabled={isLoading} fullWidth
            className={isCheckOut ? "!bg-orange-500 hover:!bg-orange-600" : ""}>
            {isLoading ? (isCheckOut ? "Checking out…" : "Checking in…") : (isCheckOut ? "Check Out" : "Check In")}
          </Button>
        </div>
      </Card>
    </div>
  );
}

// ─── Form state ───────────────────────────────────────────────────────────────

interface FormData {
  name: string; email: string; phone: string;
  clientType: "individual" | "company"; company: string; tin: string;
  address: string; notes: string; type: CustomerType;
}
const emptyForm: FormData = {
  name: "", email: "", phone: "",
  clientType: "individual", company: "", tin: "",
  address: "", notes: "", type: "VISITOR",
};

// ─── Component ────────────────────────────────────────────────────────────────

export default function SalesCustomerPage() {
  const [search, setSearch] = useState("");
  const [filterType, setFilterType] = useState<CustomerType | "">("");
  const [page, setPage] = useState(1);
  const [pageSize, setPageSize] = useState(DEFAULT_PAGE_SIZE);
  const [showAddModal, setShowAddModal] = useState(false);
  const [showEditModal, setShowEditModal] = useState(false);
  const [selectedCustomer, setSelectedCustomer] = useState<Customer | null>(null);
  const [formData, setFormData] = useState<FormData>(emptyForm);
  const [visitCustomer, setVisitCustomer] = useState<Customer | null>(null);

  // ── Data ────────────────────────────────────────────────────────────────────
  const { data, isLoading, isError } = useGetCustomersQuery({
    page, limit: pageSize,
    search: search || undefined,
    type: filterType || undefined,
  });

  // Fetch all currently checked-in visits — used to determine button state per customer
  const { data: activeVisitsList = [], refetch: refetchVisits } = useGetVisitsQuery({
    type: "IN" as VisitType,
    limit: 500,
  });

  // Local override: track checked-out customer IDs until next refetch resolves
  const [checkedOutIds, setCheckedOutIds] = useState<Set<string>>(new Set());

  // customerId → Visit map — only IN visits, excluding locally checked-out ones
  const activeVisitsMap: Record<string, Visit> = Object.fromEntries(
    activeVisitsList
      .filter((v) => v.type === "IN" && !checkedOutIds.has(v.customerId))
      .map((v) => [v.customerId, v])
  );

  const [createCustomer, { isLoading: isCreating }] = useCreateCustomerMutation();
  const [updateCustomer, { isLoading: isUpdating }] = useUpdateCustomerMutation();

  const customers = data?.customers ?? [];
  const totalPages = data?.totalPages ?? 1;
  const total = data?.total ?? 0;

  // ── Handlers ────────────────────────────────────────────────────────────────

  const handleAdd = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    if (!formData.phone.trim()) { toast.error("Phone number is required."); return; }
    if (formData.clientType === "company" && !formData.company.trim()) { toast.error("Company name is required."); return; }
    const payload: CreateCustomerPayload & { tin?: string } = {
      name: formData.name,
      ...(formData.email.trim() && { email: formData.email.toLowerCase() }),
      phone: formData.phone,
      company: formData.clientType === "company" ? formData.company || undefined : undefined,
      ...(formData.clientType === "company" && formData.tin.trim() && { tin: formData.tin }),
      address: formData.address || undefined,
      notes: formData.notes || undefined,
      type: formData.type,
    };
    try {
      await createCustomer(payload as CreateCustomerPayload).unwrap();
      toast.success("Customer created successfully");
      closeModal();
    } catch { toast.error("Failed to create customer."); }
  };

  const handleEdit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    if (!formData.phone.trim()) { toast.error("Phone number is required."); return; }
    if (formData.clientType === "company" && !formData.company.trim()) { toast.error("Company name is required."); return; }
    if (!selectedCustomer) return;
    try {
      await updateCustomer({
        id: selectedCustomer.id,
        name: formData.name,
        ...(formData.email.trim() && { email: formData.email.toLowerCase() }),
        phone: formData.phone,
        company: formData.clientType === "company" ? formData.company || undefined : undefined,
        address: formData.address || undefined,
        notes: formData.notes || undefined,
        type: formData.type,
      }).unwrap();
      toast.success("Customer updated successfully");
      closeModal();
    } catch { toast.error("Failed to update customer."); }
  };

  const openEditModal = (customer: Customer) => {
    setSelectedCustomer(customer);
    setFormData({
      name: customer.name, email: customer.email ?? "", phone: customer.phone ?? "",
      clientType: customer.company ? "company" : "individual",
      company: customer.company ?? "", tin: (customer as any).tin ?? "",
      address: customer.address ?? "", notes: customer.notes ?? "", type: customer.type,
    });
    setShowEditModal(true);
  };

  const closeModal = () => {
    setShowAddModal(false); setShowEditModal(false);
    setSelectedCustomer(null); setFormData(emptyForm);
  };

  const set = (field: keyof FormData, value: string) =>
    setFormData((p) => ({ ...p, [field]: value }));

  // ── Render ──────────────────────────────────────────────────────────────────

  return (
    <DashboardLayout notificationCount={0}>
      <div className="space-y-6 font-[family-name:var(--font-family-primary)]">

        {/* Header */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
          <div>
            <h1 className="text-2xl md:text-3xl font-bold text-secondary-100">Customer Management</h1>
            <p className="text-sm text-custom-700 mt-1">Manage customer information and relationships</p>
          </div>
          <button onClick={() => setShowAddModal(true)}
            className="px-4 py-2 rounded-xl bg-primary-500 text-white font-semibold hover:bg-primary-600 transition-colors text-sm flex items-center gap-2 w-fit">
            <HiOutlinePlus className="w-4 h-4" /> Add New Customer
          </button>
        </div>

        {/* KPI Cards */}
        <div className="grid grid-cols-2 sm:grid-cols-3 gap-4">
          <Card className="!p-4">
            <div className="w-10 h-10 rounded-xl bg-primary-100 flex items-center justify-center mb-2">
              <HiOutlineUsers className="w-5 h-5 text-primary-600" />
            </div>
            <p className="text-2xl font-bold text-secondary-100">{total}</p>
            <p className="text-xs text-custom-700">Total Customers</p>
          </Card>
          <Card className="!p-4">
            <div className="w-10 h-10 rounded-xl bg-blue-100 flex items-center justify-center mb-2">
              <HiOutlineOfficeBuilding className="w-5 h-5 text-blue-600" />
            </div>
            <p className="text-2xl font-bold text-secondary-100">{customers.filter((c) => c.type === "BUSINESS").length}</p>
            <p className="text-xs text-custom-700">Business</p>
          </Card>
          <Card className="!p-4">
            <div className="w-10 h-10 rounded-xl bg-emerald-100 flex items-center justify-center mb-2">
              <HiOutlineLogin className="w-5 h-5 text-emerald-600" />
            </div>
            <p className="text-2xl font-bold text-secondary-100">{activeVisitsList.length}</p>
            <p className="text-xs text-custom-700">Currently In</p>
          </Card>
        </div>

        {/* Filters */}
        <Card className="!p-4">
          <div className="flex flex-col md:flex-row gap-3">
            <div className="relative flex-1">
              <HiOutlineSearch className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-custom-700" />
              <input type="text" placeholder="Search by name, email, company, or phone..."
                value={search} onChange={(e) => { setSearch(e.target.value); setPage(1); }}
                className="w-full pl-9 pr-4 py-2 rounded-xl border border-custom-300 bg-style-500 text-secondary-100 text-sm placeholder:text-custom-700 focus:outline-none focus:border-primary-400 focus:ring-2 focus:ring-primary-200 transition-colors" />
            </div>
            <select value={filterType} onChange={(e) => { setFilterType(e.target.value as CustomerType | ""); setPage(1); }}
              className="px-4 py-2 rounded-xl border border-custom-300 bg-style-500 text-secondary-100 text-sm focus:outline-none focus:border-primary-400">
              <option value="">All Categories</option>
              <option value="BUSINESS">Business</option>
              <option value="VISITOR">Visit</option>
              <option value="BOUTIQUE">Boutique</option>
            </select>
          </div>
        </Card>

        {/* Table */}
        <Card className="!p-0 overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead className="bg-custom-100 border-b border-custom-300">
                <tr>
                  <th className="px-4 py-3 text-left text-xs font-bold text-secondary-100 uppercase">Name</th>
                  <th className="px-4 py-3 text-left text-xs font-bold text-secondary-100 uppercase">Company / TIN</th>
                  <th className="px-4 py-3 text-left text-xs font-bold text-secondary-100 uppercase">Contact</th>
                  <th className="px-4 py-3 text-left text-xs font-bold text-secondary-100 uppercase">Location</th>
                  <th className="px-4 py-3 text-left text-xs font-bold text-secondary-100 uppercase">Category</th>
                  <th className="px-4 py-3 text-left text-xs font-bold text-secondary-100 uppercase">Status</th>
                  <th className="px-4 py-3 text-right text-xs font-bold text-secondary-100 uppercase">Actions</th>
                </tr>
              </thead>
              <tbody className="bg-white divide-y divide-custom-200">
                {isLoading ? (
                  <tr><td colSpan={7} className="px-4 py-8 text-center text-custom-700">Loading customers…</td></tr>
                ) : isError ? (
                  <tr><td colSpan={7} className="px-4 py-8 text-center text-red-500">Failed to load customers.</td></tr>
                ) : customers.length === 0 ? (
                  <tr><td colSpan={7} className="px-4 py-8 text-center text-custom-700">No customers found</td></tr>
                ) : (
                  customers.map((customer) => {
                    const visit = activeVisitsMap[customer.id];
                    const isCheckedIn = !!visit;
                    return (
                      <tr key={customer.id} className="hover:bg-custom-50 transition-colors">
                        <td className="px-4 py-4">
                          <p className="text-sm font-semibold text-secondary-100">{customer.name}</p>
                          <NoteCell text={customer.notes ?? ""} />
                        </td>
                        <td className="px-4 py-4">
                          <div>
                            <span className="text-sm text-custom-700">{customer.company ?? "—"}</span>
                            {(customer as any).tin && (
                              <p className="text-xs text-custom-600 mt-0.5">TIN: {(customer as any).tin}</p>
                            )}
                          </div>
                        </td>
                        <td className="px-4 py-4">
                          <div className="space-y-1">
                            {customer.email && (
                              <div className="flex items-center gap-1 text-xs text-custom-700">
                                <HiOutlineMail className="w-3 h-3" />{customer.email}
                              </div>
                            )}
                            {customer.phone && (
                              <div className="flex items-center gap-1 text-xs text-custom-700">
                                <HiOutlinePhone className="w-3 h-3" />{customer.phone}
                              </div>
                            )}
                          </div>
                        </td>
                        <td className="px-4 py-4">
                          {(customer.address || customer.city || customer.country) ? (
                            <div className="flex items-start gap-1 text-xs text-custom-700">
                              <HiOutlineLocationMarker className="w-3 h-3 mt-0.5 shrink-0" />
                              <span>{[customer.address, customer.city, customer.country].filter(Boolean).join(", ")}</span>
                            </div>
                          ) : <span className="text-xs text-custom-400">—</span>}
                        </td>
                        <td className="px-4 py-4">
                          <span className={`text-xs font-bold px-3 py-1 rounded-full ${typeColor[customer.type]}`}>
                            {typeLabel[customer.type]}
                          </span>
                        </td>
                        <td className="px-4 py-4">
                          <span className={`text-xs font-bold px-3 py-1 rounded-full ${customer.isActive ? "bg-green-100 text-green-700" : "bg-gray-100 text-gray-700"}`}>
                            {customer.isActive ? "Active" : "Inactive"}
                          </span>
                        </td>
                        <td className="px-4 py-4">
                          <div className="flex items-center justify-end gap-2">
                            {/* Check In / Check Out button */}
                            <button
                              onClick={() => setVisitCustomer(customer)}
                              className={`flex items-center gap-1.5 px-3 py-1.5 rounded-xl text-xs font-semibold transition-colors ${
                                isCheckedIn
                                  ? "bg-orange-100 text-orange-700 hover:bg-orange-200"
                                  : "bg-emerald-100 text-emerald-700 hover:bg-emerald-200"
                              }`}
                              title={isCheckedIn ? "Check Out" : "Check In"}
                            >
                              {isCheckedIn
                                ? <><HiOutlineLogout className="w-3.5 h-3.5" /></>
                                : <><HiOutlineLogin className="w-3.5 h-3.5" /></>}
                            </button>
                            <button onClick={() => openEditModal(customer)}
                              className="p-2 rounded-lg hover:bg-primary-100 transition-colors" title="Edit">
                              <HiOutlinePencil className="w-4 h-4 text-primary-500" />
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
          <Pagination page={page} totalPages={totalPages} total={total} pageSize={pageSize}
            onPageChange={setPage} onPageSizeChange={(s) => { setPageSize(s); setPage(1); }} />
        </Card>
      </div>

      {/* Visit Modal */}
      {visitCustomer && (
        <VisitModal
          customer={visitCustomer}
          activeVisit={activeVisitsMap[visitCustomer.id] ?? null}
          onClose={() => setVisitCustomer(null)}
          onDone={async (checkedOutCustomerId?: string) => {
            if (checkedOutCustomerId) setCheckedOutIds((prev) => new Set(prev).add(checkedOutCustomerId));
            setVisitCustomer(null);
            await refetchVisits();
            if (checkedOutCustomerId) setCheckedOutIds((prev) => { const s = new Set(prev); s.delete(checkedOutCustomerId); return s; });
          }}
        />
      )}

      {/* Add / Edit Modal */}
      {(showAddModal || showEditModal) && (
        <div className="fixed inset-0 bg-secondary-100/50 z-50 flex items-start justify-center p-4 overflow-y-auto">
          <Card className="!p-6 max-w-2xl w-full my-8">
            <div className="flex items-center justify-between mb-6">
              <h3 className="text-xl font-bold text-secondary-100">
                {showAddModal ? "Add New Customer" : "Edit Customer"}
              </h3>
              <button onClick={closeModal} className="text-custom-700 hover:text-secondary-100">
                <HiOutlineX className="w-6 h-6" />
              </button>
            </div>
            <form onSubmit={showAddModal ? handleAdd : handleEdit} className="space-y-4">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-semibold text-secondary-100 mb-2">Full Name <span className="text-red-500">*</span></label>
                  <Input type="text" placeholder="e.g., John Mugisha" value={formData.name}
                    onChange={(e) => set("name", e.target.value)} required fullWidth />
                </div>
                <div>
                  <label className="block text-sm font-semibold text-secondary-100 mb-2">
                    Email <span className="text-xs text-custom-600 font-normal">(optional)</span>
                  </label>
                  <Input type="email" placeholder="email@example.com" value={formData.email}
                    onChange={(e) => set("email", e.target.value)} fullWidth />
                </div>
                <div>
                  <label className="block text-sm font-semibold text-secondary-100 mb-2">Phone <span className="text-red-500">*</span></label>
                  <PhoneInput value={formData.phone} onChange={(val) => set("phone", val)} />
                </div>
                <div>
                  <label className="block text-sm font-semibold text-secondary-100 mb-2">Category <span className="text-red-500">*</span></label>
                  <select value={formData.type} onChange={(e) => set("type", e.target.value)} required className={selectCls}>
                    <option value="BUSINESS">Business</option>
                    <option value="VISITOR">Visit</option>
                    <option value="BOUTIQUE">Boutique</option>
                  </select>
                </div>
                <div className="md:col-span-2">
                  <label className="block text-sm font-semibold text-secondary-100 mb-2">Client Type</label>
                  <div className="flex gap-3">
                    {(["individual", "company"] as const).map((ct) => (
                      <button key={ct} type="button"
                        onClick={() => setFormData((p) => ({ ...p, clientType: ct, ...(ct === "individual" && { company: "", tin: "" }) }))}
                        className={`flex-1 py-2.5 rounded-xl border text-sm font-semibold transition-colors capitalize ${
                          formData.clientType === ct ? "bg-primary-500 text-white border-primary-500" : "border-custom-300 text-custom-700 hover:bg-custom-100"
                        }`}>{ct}</button>
                    ))}
                  </div>
                </div>
                {formData.clientType === "company" && (
                  <>
                    <div>
                      <label className="block text-sm font-semibold text-secondary-100 mb-2">Company Name <span className="text-red-500">*</span></label>
                      <Input type="text" placeholder="e.g., ABC Corporation" value={formData.company}
                        onChange={(e) => set("company", e.target.value)} required fullWidth />
                    </div>
                    <div>
                      <label className="block text-sm font-semibold text-secondary-100 mb-2">
                        TIN Number <span className="text-xs text-custom-600 font-normal">(Tax ID)</span>
                      </label>
                      <Input type="text" placeholder="e.g., 102345678" value={formData.tin}
                        onChange={(e) => set("tin", e.target.value)} fullWidth />
                    </div>
                  </>
                )}
                <div className={formData.clientType === "company" ? "md:col-span-2" : ""}>
                  <label className="block text-sm font-semibold text-secondary-100 mb-2">Address</label>
                  <Input type="text" placeholder="e.g., KN 5 Ave" value={formData.address}
                    onChange={(e) => set("address", e.target.value)} fullWidth />
                </div>
                <div className="md:col-span-2">
                  <label className="block text-sm font-semibold text-secondary-100 mb-2">Notes</label>
                  <textarea placeholder="Any additional notes…" value={formData.notes}
                    onChange={(e) => set("notes", e.target.value)} rows={3}
                    className="w-full px-4 py-2.5 rounded-xl border border-custom-300 bg-style-500 text-secondary-100 text-sm placeholder:text-custom-700 focus:outline-none focus:border-primary-400 focus:ring-2 focus:ring-primary-200 transition-colors resize-none" />
                </div>
              </div>
              <div className="flex gap-3 justify-end pt-4 border-t border-custom-300">
                <Button type="button" variant="outline" onClick={closeModal}>Cancel</Button>
                <Button type="submit" disabled={isCreating || isUpdating}>
                  {isCreating || isUpdating ? "Saving…" : showAddModal ? "Add Customer" : "Save Changes"}
                </Button>
              </div>
            </form>
          </Card>
        </div>
      )}
    </DashboardLayout>
  );
}
