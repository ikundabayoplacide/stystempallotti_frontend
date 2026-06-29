import { useState } from "react";
import {
  HiOutlineBriefcase,
  HiOutlineClipboardList,
  HiOutlineMail,
  HiOutlineOfficeBuilding,
  HiOutlinePhone,
  HiOutlineSearch,
  HiOutlineUser,
  HiOutlineX,
} from "react-icons/hi";
import { Button, Card, Input } from "../../components/ui";
import { useGetCustomersQuery } from "../../store/services/customersService";
import type { Customer } from "../../store/services/customersService";
import { useCreateJobMutation } from "../../store/services/jobsService";
import type { JobPriority } from "../../store/services/jobsService";

// ─── Types ────────────────────────────────────────────────────────────────────

interface Props {
  onClose: () => void;
  onCreated: () => void;
}

// ─── Select style shared ──────────────────────────────────────────────────────

const selectCls =
  "w-full px-4 py-2.5 rounded-xl border border-custom-400 bg-style-500 text-secondary-100 " +
  "focus:outline-none focus:border-primary-400 focus:ring-2 focus:ring-primary-200 " +
  "transition-colors duration-200 font-[family-name:var(--font-family-primary)] text-sm";

// ─── Component ────────────────────────────────────────────────────────────────

export default function CreateJobModal({ onClose, onCreated }: Props) {
  // Customer search
  const [customerSearch, setCustomerSearch] = useState("");
  const [selectedCustomer, setSelectedCustomer] = useState<Customer | null>(null);

  // Job form
  const [form, setForm] = useState({
    title: "",
    jobType: "",
    quantity: "",
    size: "",
    colorMode: "",
    bindingType: "",
    priority: "normal" as JobPriority,
    dueDate: "",
    notes: "",
    description: "",
    amount: "",
  });

  // RTK Query
  const { data: customersData, isFetching: loadingCustomers } = useGetCustomersQuery(
    customerSearch.trim()
      ? { search: customerSearch, type: "BUSINESS", limit: 20 }
      : { type: "BUSINESS", limit: 20 }
  );
  const [createJob, { isLoading: submitting }] = useCreateJobMutation();

  const customers = customersData?.customers ?? [];

  // ── Handlers ────────────────────────────────────────────────────────────────

  const handleFieldChange = (
    e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement>
  ) => {
    setForm((prev) => ({ ...prev, [e.target.name]: e.target.value }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedCustomer) return;

    const payload = {
      title: form.title,
      customerId: selectedCustomer.id,
      ...(form.description && { description: form.description }),
      ...(form.jobType     && { jobType: form.jobType }),
      ...(form.quantity    && { quantity: parseInt(form.quantity, 10) }),
      ...(form.size        && { size: form.size }),
      ...(form.colorMode   && { colorMode: form.colorMode }),
      ...(form.bindingType && { bindingType: form.bindingType }),
      priority: form.priority,
      ...(form.amount      && { amount: parseFloat(form.amount) }),
      ...(form.dueDate     && { dueDate: new Date(form.dueDate).toISOString() }),
      ...(form.notes       && { notes: form.notes }),
    };

    console.log("📤 Creating job with payload:", payload);

    try {
      await createJob(payload).unwrap();
      onCreated();
    } catch (err: unknown) {
      const error = err as { status?: number; data?: unknown };
      console.error("❌ Failed to create job — status:", error.status);
      console.error("❌ Server response body:", JSON.stringify(error.data, null, 2));
    }
  };

  const canSubmit = !!selectedCustomer && form.title.trim() !== "" && !submitting;

  // ── Render ──────────────────────────────────────────────────────────────────

  return (
    <div className="fixed inset-0 bg-secondary-100/60 z-50 flex items-center justify-center p-4">
      {/* Modal container — fixed height so inner panels can scroll */}
      <div className="w-full max-w-5xl flex flex-col" style={{ height: "min(90vh, 780px)" }}>
        <Card className="!p-0 overflow-hidden flex flex-col h-full">

          {/* ── Header (fixed) ─────────────────────────────────────────── */}
          <div className="flex items-center justify-between px-6 py-4 border-b border-custom-300 shrink-0">
            <div className="flex items-center gap-2">
              <HiOutlineBriefcase className="w-5 h-5 text-primary-500" />
              <h3 className="text-xl font-bold text-secondary-100">Create New Job</h3>
            </div>
            <button
              onClick={onClose}
              className="p-1.5 rounded-lg hover:bg-custom-100 transition-colors text-custom-700 hover:text-secondary-100"
            >
              <HiOutlineX className="w-5 h-5" />
            </button>
          </div>

          {/* ── Body (fills remaining height) ──────────────────────────── */}
          <form onSubmit={handleSubmit} className="flex flex-col lg:flex-row flex-1 min-h-0">

            {/* ── LEFT: Customer selection ──────────────────────────────── */}
            <div className={`lg:w-2/5 border-b lg:border-b-0 lg:border-r border-custom-300 flex flex-col min-h-0 ${
              selectedCustomer ? "hidden lg:flex" : "flex"
            }`}>

              {/* Search bar (fixed inside left panel) */}
              <div className="px-6 py-4 border-b border-custom-200 shrink-0">
                <p className="text-xs font-bold text-custom-700 uppercase tracking-wide mb-3">
                  Step 1 — Select Customer
                </p>
                <div className="relative">
                  <HiOutlineSearch className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-custom-700" />
                  <input
                    type="text"
                    value={customerSearch}
                    onChange={(e) => {
                      setCustomerSearch(e.target.value);
                      setSelectedCustomer(null);
                    }}
                    placeholder="Search by name, email, company…"
                    className="w-full pl-9 pr-4 py-2 rounded-xl border border-custom-400 bg-style-500 text-secondary-100 text-sm focus:outline-none focus:border-primary-400 focus:ring-2 focus:ring-primary-200 transition-colors"
                  />
                </div>
              </div>

              {/* Scrollable customer list */}
              <div className="flex-1 overflow-y-auto px-3 py-2 min-h-0">
                {loadingCustomers ? (
                  <div className="flex items-center justify-center py-8 text-custom-700 text-sm">
                    Loading customers…
                  </div>
                ) : customers.length === 0 ? (
                  <div className="flex items-center justify-center py-8 text-custom-700 text-sm">
                    No customers found
                  </div>
                ) : (
                  customers.map((c) => (
                    <button
                      key={c.id}
                      type="button"
                      onClick={() => setSelectedCustomer(c)}
                      className={`w-full text-left px-3 py-3 rounded-xl mb-1 transition-colors ${
                        selectedCustomer?.id === c.id
                          ? "bg-primary-100 border border-primary-400"
                          : "hover:bg-custom-100 border border-transparent"
                      }`}
                    >
                      <p className="text-sm font-semibold text-secondary-100 truncate">{c.name}</p>
                      <p className="text-xs text-custom-700 truncate">{c.email}</p>
                      {c.company && (
                        <p className="text-xs text-custom-600 truncate">{c.company}</p>
                      )}
                    </button>
                  ))
                )}
              </div>

              {/* Selected customer summary (fixed at bottom of left panel) */}
              {selectedCustomer && (
                <div className="hidden sm:block px-6 py-4 border-t border-custom-300 bg-primary-50 shrink-0">
                  <p className="text-xs font-bold text-primary-600 uppercase tracking-wide mb-3">
                    Selected Customer
                  </p>
                  <div className="space-y-2">
                    <div className="flex items-center gap-2">
                      <HiOutlineUser className="w-4 h-4 text-primary-500 shrink-0" />
                      <span className="text-sm font-semibold text-secondary-100 truncate">
                        {selectedCustomer.name}
                      </span>
                    </div>
                    <div className="flex items-center gap-2">
                      <HiOutlineMail className="w-4 h-4 text-custom-700 shrink-0" />
                      <span className="text-xs text-custom-700 truncate">{selectedCustomer.email}</span>
                    </div>
                    {selectedCustomer.phone && (
                      <div className="flex items-center gap-2">
                        <HiOutlinePhone className="w-4 h-4 text-custom-700 shrink-0" />
                        <span className="text-xs text-custom-700">{selectedCustomer.phone}</span>
                      </div>
                    )}
                    {selectedCustomer.company && (
                      <div className="flex items-center gap-2">
                        <HiOutlineOfficeBuilding className="w-4 h-4 text-custom-700 shrink-0" />
                        <span className="text-xs text-custom-700 truncate">{selectedCustomer.company}</span>
                      </div>
                    )}
                    <div className="pt-1">
                      <span className="inline-block px-2 py-0.5 rounded-full text-xs font-semibold bg-blue-100 text-blue-700">
                        BUSINESS
                      </span>
                    </div>
                  </div>
                </div>
              )}
            </div>

            {/* ── RIGHT: Job details ────────────────────────────────────── */}
            <div className={`lg:w-3/5 flex flex-col min-h-0 ${
              selectedCustomer ? "flex" : "hidden lg:flex"
            }`}>

              {/* Step label (fixed) */}
              <div className="px-6 py-4 border-b border-custom-200 shrink-0">
                <div className="flex items-center justify-between">
                  <p className="text-xs font-bold text-custom-700 uppercase tracking-wide">
                    Step 2 — Job Details
                  </p>
                  {selectedCustomer && (
                    <button
                      type="button"
                      onClick={() => setSelectedCustomer(null)}
                      className="lg:hidden text-xs font-semibold text-primary-500 hover:text-primary-600 transition-colors"
                    >
                      ← Change customer
                    </button>
                  )}
                </div>
                {selectedCustomer && (
                  <p className="text-xs text-custom-700 mt-0.5 truncate">
                    {selectedCustomer.name}{selectedCustomer.company ? ` · ${selectedCustomer.company}` : ""}
                  </p>
                )}
                {!selectedCustomer && (
                  <p className="text-xs text-custom-600 mt-1">
                    Select a customer on the left to enable this form
                  </p>
                )}
              </div>

              {/* Scrollable form fields */}
              <div
                className={`flex-1 overflow-y-auto px-6 py-5 space-y-5 min-h-0 transition-opacity ${
                  selectedCustomer ? "opacity-100" : "opacity-40 pointer-events-none"
                }`}
              >
                {/* Title */}
                <div>
                  <label className="block text-sm font-semibold text-secondary-100 mb-1.5">
                    Job Title <span className="text-red-500">*</span>
                  </label>
                  <Input
                    name="title"
                    type="text"
                    placeholder="e.g. Business Cards for Acme Corp"
                    value={form.title}
                    onChange={handleFieldChange}
                    required
                    fullWidth
                  />
                </div>

                {/* Job Type + Quantity */}
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-semibold text-secondary-100 mb-1.5">
                      Job Type
                    </label>
                    <select name="jobType" value={form.jobType} onChange={handleFieldChange} className={selectCls}>
                      <option value="">Select type</option>
                      <option value="business-card">Business Card</option>
                      <option value="brochure">Brochure</option>
                      <option value="flyer">Flyer</option>
                      <option value="banner">Banner</option>
                      <option value="booklet">Booklet</option>
                      <option value="poster">Poster</option>
                      <option value="envelope">Envelope</option>
                      <option value="other">Other</option>
                    </select>
                  </div>
                  <div>
                    <label className="block text-sm font-semibold text-secondary-100 mb-1.5">
                      Quantity
                    </label>
                    <Input
                      name="quantity"
                      type="number"
                      min="1"
                      placeholder="e.g. 500"
                      value={form.quantity}
                      onChange={handleFieldChange}
                      fullWidth
                    />
                  </div>
                </div>

                {/* Amount */}
                <div>
                  <label className="block text-sm font-semibold text-secondary-100 mb-1.5">
                    Amount (RWF)
                  </label>
                  <Input
                    name="amount"
                    type="number"
                    min="0"
                    step="any"
                    placeholder="e.g. 25000"
                    value={form.amount}
                    onChange={handleFieldChange}
                    fullWidth
                  />
                </div>

                {/* Size + Color Mode */}
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-semibold text-secondary-100 mb-1.5">Size</label>
                    <select name="size" value={form.size} onChange={handleFieldChange} className={selectCls}>
                      <option value="">Select size</option>
                      <option value="A3">A3</option>
                      <option value="A4">A4</option>
                      <option value="A5">A5</option>
                      <option value="A6">A6</option>
                      <option value="Letter">Letter</option>
                      <option value="Custom">Custom</option>
                    </select>
                  </div>
                  <div>
                    <label className="block text-sm font-semibold text-secondary-100 mb-1.5">Color Mode</label>
                    <select name="colorMode" value={form.colorMode} onChange={handleFieldChange} className={selectCls}>
                      <option value="">Select color mode</option>
                      <option value="full-color">Full Color</option>
                      <option value="black-and-white">Black & White</option>
                      <option value="spot-color">Spot Color</option>
                    </select>
                  </div>
                </div>

                {/* Binding + Priority */}
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-semibold text-secondary-100 mb-1.5">Binding Type</label>
                    <select name="bindingType" value={form.bindingType} onChange={handleFieldChange} className={selectCls}>
                      <option value="">Select binding</option>
                      <option value="none">None</option>
                      <option value="staple">Staple</option>
                      <option value="spiral">Spiral</option>
                      <option value="perfect">Perfect Bind</option>
                      <option value="hardcover">Hardcover</option>
                    </select>
                  </div>
                  <div>
                    <label className="block text-sm font-semibold text-secondary-100 mb-1.5">Priority</label>
                    <select name="priority" value={form.priority} onChange={handleFieldChange} className={selectCls}>
                      <option value="low">Low</option>
                      <option value="normal">Normal</option>
                      <option value="high">High</option>
                      <option value="urgent">Urgent</option>
                    </select>
                  </div>
                </div>

                {/* Due Date */}
                <div>
                  <label className="block text-sm font-semibold text-secondary-100 mb-1.5">Due Date</label>
                  <Input name="dueDate" type="date" min={new Date().toISOString().split("T")[0]} value={form.dueDate} onChange={handleFieldChange} fullWidth />
                </div>

                {/* Description */}
                <div>
                  <label className="block text-sm font-semibold text-secondary-100 mb-1.5">Description</label>
                  <textarea
                    name="description"
                    value={form.description}
                    onChange={handleFieldChange}
                    rows={2}
                    placeholder="Brief description of the job…"
                    className={`${selectCls} resize-none`}
                  />
                </div>

                {/* Notes */}
                <div>
                  <label className="block text-sm font-semibold text-secondary-100 mb-1.5">Notes</label>
                  <textarea
                    name="notes"
                    value={form.notes}
                    onChange={handleFieldChange}
                    rows={2}
                    placeholder="Any special instructions or requirements…"
                    className={`${selectCls} resize-none`}
                  />
                </div>
              </div>

              {/* Footer (fixed at bottom of right panel) */}
              <div className="px-6 py-4 border-t border-custom-300 flex items-center justify-between gap-3 shrink-0">
                <div className="flex items-center gap-1.5 text-xs text-custom-700">
                  <HiOutlineClipboardList className="w-4 h-4 shrink-0" />
                  <span>
                    {selectedCustomer
                      ? `Customer: ${selectedCustomer.name}`
                      : "No customer selected"}
                  </span>
                </div>
                <div className="flex gap-3">
                  <Button type="button" variant="outline" onClick={onClose}>
                    Cancel
                  </Button>
                  <Button type="submit" disabled={!canSubmit}>
                    {submitting ? "Creating…" : "Create Job"}
                  </Button>
                </div>
              </div>
            </div>
          </form>
        </Card>
      </div>
    </div>
  );
}
