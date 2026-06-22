import { useEffect, useRef, useState } from "react";
import {
  HiOutlineBriefcase,
  HiOutlineCheckCircle,
  HiOutlineCube,
  HiOutlineDocumentText,
  HiOutlineExclamationCircle,
  HiOutlineMail,
  HiOutlineOfficeBuilding,
  HiOutlinePhone,
  HiOutlineSearch,
  HiOutlineTrash,
  HiOutlineUser,
  HiOutlineX,
} from "react-icons/hi";
import { Button, Card, Input } from "../../components/ui";
import type { Customer } from "../../store/services/customersService";
import { useGetCustomersQuery } from "../../store/services/customersService";
import type { JobPriority } from "../../store/services/jobsService";
import { useCreateJobMutation } from "../../store/services/jobsService";
import type { StockItem } from "../../store/services/stockService";
import { useGetStockItemsQuery } from "../../store/services/stockService";

// ─── Types ────────────────────────────────────────────────────────────────────

interface Props {
  onClose: () => void;
  onCreated: () => void;
}

interface SelectedItem {
  stockItem: StockItem;
  quantityNeeded: number;
  notes: string;
}

const selectCls =
  "w-full px-4 py-2.5 rounded-xl border border-custom-400 bg-style-500 text-secondary-100 " +
  "focus:outline-none focus:border-primary-400 focus:ring-2 focus:ring-primary-200 " +
  "transition-colors duration-200 font-[family-name:var(--font-family-primary)] text-sm";

// ─── Step indicator ───────────────────────────────────────────────────────────

function StepIndicator({ step }: { step: 1 | 2 | 3 | 4 }) {
  const labels = ["Customer & Details", "Stock Items", "Documents", "Review & Amount"];
  return (
    <div className="flex items-center gap-2">
      {([1, 2, 3, 4] as const).map((s) => (
        <div key={s} className="flex items-center gap-2">
          <div className={`w-7 h-7 rounded-full flex items-center justify-center text-xs font-bold transition-colors ${
            step === s
              ? "bg-primary-500 text-white"
              : step > s
              ? "bg-emerald-500 text-white"
              : "bg-custom-200 text-custom-700"
          }`}>
            {step > s ? <HiOutlineCheckCircle className="w-4 h-4" /> : s}
          </div>
          <span className={`text-xs font-semibold hidden sm:inline ${
            step === s ? "text-secondary-100" : "text-custom-700"
          }`}>
            {labels[s - 1]}
          </span>
          {s < 4 && <div className="w-8 h-px bg-custom-300 mx-1" />}
        </div>
      ))}
    </div>
  );
}

// ─── SelectOrCustom ──────────────────────────────────────────────────────────

interface SelectOrCustomProps {
  name: string;
  value: string;
  onChange: (val: string) => void;
  options: { value: string; label: string }[];
  placeholder?: string;
}

function SelectOrCustom({ name, value, onChange, options, placeholder }: SelectOrCustomProps) {
  const isCustom = value !== "" && !options.some((o) => o.value === value);
  const [custom, setCustom] = useState(false);

  // Sync: if parent value is a known option → show select; if unknown → show input
  useEffect(() => {
    setCustom(isCustom);
  }, [isCustom]);

  if (custom) {
    return (
      <div className="flex gap-1.5">
        <input
          type="text"
          value={value}
          onChange={(e) => onChange(e.target.value)}
          placeholder={`Type custom ${name}…`}
          autoFocus
          className={selectCls + " flex-1"}
        />
        <button
          type="button"
          title="Back to list"
          onClick={() => { setCustom(false); onChange(""); }}
          className="px-2.5 rounded-xl border border-custom-400 text-custom-700 hover:bg-custom-100 transition-colors text-xs font-semibold shrink-0"
        >
          ✕
        </button>
      </div>
    );
  }

  return (
    <select
      name={name}
      value={value}
      onChange={(e) => {
        if (e.target.value === "__custom__") {
          setCustom(true);
          onChange("");
        } else {
          onChange(e.target.value);
        }
      }}
      className={selectCls}
    >
      <option value="">{placeholder ?? "Select…"}</option>
      {options.map((o) => (
        <option key={o.value} value={o.value}>{o.label}</option>
      ))}
      <option value="__custom__">＋ Other (type your own)</option>
    </select>
  );
}

// ─── Component ────────────────────────────────────────────────────────────────

export default function CreateJobModal({ onClose, onCreated }: Props) {
  const [step, setStep] = useState<1 | 2 | 3 | 4>(1);

  // ── Step 1 state ───────────────────────────────────────────────────────────
  const [customerSearch, setCustomerSearch] = useState("");
  const [selectedCustomer, setSelectedCustomer] = useState<Customer | null>(null);
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

  // ── Step 2 state ───────────────────────────────────────────────────────────
  const [itemSearch, setItemSearch] = useState("");
  const [showDropdown, setShowDropdown] = useState(false);
  const [selectedItems, setSelectedItems] = useState<SelectedItem[]>([]);
  const [submitError, setSubmitError] = useState<string | null>(null);
  const dropdownRef = useRef<HTMLDivElement>(null);

  // ── Step 3 state — documents ───────────────────────────────────────────────
  const [documents, setDocuments] = useState<File[]>([]);

  const addDocuments = (files: FileList | null) => {
    if (!files) return;
    const newFiles = Array.from(files).filter(
      (f) => !documents.some((d) => d.name === f.name && d.size === f.size)
    );
    setDocuments((prev) => [...prev, ...newFiles]);
  };

  const removeDocument = (index: number) =>
    setDocuments((prev) => prev.filter((_, i) => i !== index));

  const formatFileSize = (bytes: number) => {
    if (bytes < 1024) return `${bytes} B`;
    if (bytes < 1024 * 1024) return `${(bytes / 1024).toFixed(1)} KB`;
    return `${(bytes / (1024 * 1024)).toFixed(1)} MB`;
  };

  // Close dropdown on outside click
  useEffect(() => {
    function handleClickOutside(e: MouseEvent) {
      if (dropdownRef.current && !dropdownRef.current.contains(e.target as Node)) {
        setShowDropdown(false);
      }
    }
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  // ── Queries ────────────────────────────────────────────────────────────────
  const { data: customersData, isFetching: loadingCustomers } = useGetCustomersQuery(
    customerSearch.trim()
      ? { search: customerSearch, type: "BUSINESS", limit: 20 }
      : { type: "BUSINESS", limit: 20 }
  );

  const { data: stockData, isFetching: loadingStock } = useGetStockItemsQuery();

  const [createJob, { isLoading: submitting }] = useCreateJobMutation();

  const customers = customersData?.customers ?? [];

  // Filter client-side from all loaded items
  const addedIds = new Set(selectedItems.map((si) => si.stockItem.id));
  const filteredStockItems = (stockData?.data ?? []).filter((si) => {
    if (addedIds.has(si.id)) return false;
    if (!itemSearch.trim()) return true;
    return (si.name ?? "").toLowerCase().includes(itemSearch.toLowerCase()) ||
           (si.category ?? "").toLowerCase().includes(itemSearch.toLowerCase());
  });

  // ── Calculated total from items ────────────────────────────────────────────
  const itemsTotal = selectedItems.reduce((sum, si) => {
    const cost = si.stockItem.unitCost ?? 0;
    return sum + cost * si.quantityNeeded;
  }, 0);

  // Track whether user has manually edited the amount
  const [amountManuallyEdited, setAmountManuallyEdited] = useState(false);
  const [taxRate, setTaxRate]         = useState(18);  // %
  const [discountRate, setDiscountRate] = useState(0); // %

  // Derived: apply discount then tax on top of items total
  const discountAmt = Math.round((itemsTotal * discountRate) / 100);
  const afterDiscount = itemsTotal - discountAmt;
  const taxAmt = Math.round((afterDiscount * taxRate) / 100);
  const computedTotal = afterDiscount + taxAmt;

  // Auto-sync amount from computed total unless user has manually changed it
  useEffect(() => {
    if (!amountManuallyEdited) {
      setForm((prev) => ({
        ...prev,
        amount: computedTotal > 0 ? String(computedTotal) : "",
      }));
    }
  }, [computedTotal, amountManuallyEdited]);

  // ── Handlers ──────────────────────────────────────────────────────────────

  const handleFieldChange = (
    e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement>
  ) => setForm((prev) => ({ ...prev, [e.target.name]: e.target.value }));

  const addItem = (stockItem: StockItem) => {
    setSelectedItems((prev) => [
      ...prev,
      { stockItem, quantityNeeded: 1, notes: "" },
    ]);
    setItemSearch("");
  };

  const updateItemQty = (id: string, qty: number) => {
    setSelectedItems((prev) =>
      prev.map((si) =>
        si.stockItem.id === id ? { ...si, quantityNeeded: Math.max(1, qty) } : si
      )
    );
  };

  const updateItemNotes = (id: string, notes: string) => {
    setSelectedItems((prev) =>
      prev.map((si) => (si.stockItem.id === id ? { ...si, notes } : si))
    );
  };

  const removeItem = (id: string) => {
    setSelectedItems((prev) => prev.filter((si) => si.stockItem.id !== id));
  };

  const handleSubmit = async () => {
    if (!selectedCustomer || !form.title.trim()) return;
    setSubmitError(null);

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
      // use manually entered amount, or fall back to items total
      amount: form.amount ? parseFloat(form.amount) : itemsTotal > 0 ? itemsTotal : undefined,
      ...(form.dueDate     && { dueDate: new Date(form.dueDate).toISOString() }),
      ...(form.notes       && { notes: form.notes }),
      ...(selectedItems.length > 0 && {
        items: selectedItems.map((si) => ({
          stockItemId: si.stockItem.id,
          quantityNeeded: si.quantityNeeded,
          ...(si.notes.trim() && { notes: si.notes }),
        })),
      }),
      ...(documents.length > 0 && { documents }),
    };

    try {
      await createJob(payload).unwrap();
      onCreated();
    } catch (err: unknown) {
      const e = err as { status?: number; data?: { message?: string } };
      const msg = e?.data?.message ?? "Failed to create job. Please try again.";
      setSubmitError(msg);
    }
  };

  const step1Valid = !!selectedCustomer && form.title.trim() !== "";

  // ── Render ─────────────────────────────────────────────────────────────────

  return (
    <div className="fixed inset-0 bg-secondary-100/60 z-50 flex items-center justify-center p-4">
      <div className="w-full max-w-5xl flex flex-col" style={{ height: "min(92vh, 820px)" }}>
        <Card className="!p-0 overflow-hidden flex flex-col h-full">

          {/* ── Header ──────────────────────────────────────────────────── */}
          <div className="flex items-center justify-between px-6 py-4 border-b border-custom-300 shrink-0">
            <div className="flex items-center gap-4">
              <div className="flex items-center gap-2">
                <HiOutlineBriefcase className="w-5 h-5 text-primary-500" />
                <h3 className="text-xl font-bold text-secondary-100">Create New Job</h3>
              </div>
              <StepIndicator step={step} />
            </div>
            <button
              onClick={onClose}
              className="p-1.5 rounded-lg hover:bg-custom-100 transition-colors text-custom-700 hover:text-secondary-100"
            >
              <HiOutlineX className="w-5 h-5" />
            </button>
          </div>

          {/* ── Step 1: Customer + Job Details ──────────────────────────── */}
          {step === 1 && (
            <div className="flex flex-col lg:flex-row flex-1 min-h-0">

              {/* LEFT — Customer search */}
              <div className="lg:w-2/5 border-b lg:border-b-0 lg:border-r border-custom-300 flex flex-col min-h-0">
                <div className="px-6 py-4 border-b border-custom-200 shrink-0">
                  <p className="text-xs font-bold text-custom-700 uppercase tracking-wide mb-3">
                    Step 1 of 2 — Select Customer
                  </p>
                  <div className="relative">
                    <HiOutlineSearch className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-custom-700" />
                    <input
                      type="text"
                      value={customerSearch}
                      onChange={(e) => { setCustomerSearch(e.target.value); setSelectedCustomer(null); }}
                      placeholder="Search by name, email, company…"
                      className="w-full pl-9 pr-4 py-2 rounded-xl border border-custom-400 bg-style-500 text-secondary-100 text-sm focus:outline-none focus:border-primary-400 focus:ring-2 focus:ring-primary-200 transition-colors"
                    />
                  </div>
                </div>

                <div className="flex-1 overflow-y-auto px-3 py-2 min-h-0">
                  {loadingCustomers ? (
                    <div className="flex items-center justify-center py-8 text-custom-700 text-sm">Loading…</div>
                  ) : customers.length === 0 ? (
                    <div className="flex items-center justify-center py-8 text-custom-700 text-sm">No customers found</div>
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
                        <div className="flex items-start justify-between gap-2">
                          <div className="min-w-0">
                            <p className="text-sm font-semibold text-secondary-100 truncate">{c.name}</p>
                            <p className="text-xs text-custom-700 truncate">{c.email}</p>
                            {c.company && <p className="text-xs text-custom-600 truncate">{c.company}</p>}
                          </div>
                        </div>
                      </button>
                    ))
                  )}
                </div>

                {selectedCustomer && (
                  <div className="px-6 py-4 border-t border-custom-300 bg-primary-50 shrink-0">
                    <p className="text-xs font-bold text-primary-600 uppercase tracking-wide mb-2">Selected</p>
                    <div className="space-y-1.5">
                      <div className="flex items-center gap-2">
                        <HiOutlineUser className="w-4 h-4 text-primary-500 shrink-0" />
                        <span className="text-sm font-semibold text-secondary-100 truncate">{selectedCustomer.name}</span>
                      </div>
                      <div className="flex items-center gap-2">
                        <HiOutlineMail className="w-4 h-4 text-custom-700 shrink-0" />
                        <span className="text-xs text-custom-700 truncate">{selectedCustomer.email}</span>
                      </div>
                      {selectedCustomer.phone && (
                        <div className="flex items-center gap -2">
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
                    </div>
                  </div>
                )}
              </div>

              {/* RIGHT — Job details form */}
              <div className="lg:w-3/5 flex flex-col min-h-0">
                <div className="px-6 py-4 border-b border-custom-200 shrink-0">
                  <p className="text-xs font-bold text-custom-700 uppercase tracking-wide">Job Details</p>
                  {!selectedCustomer && (
                    <p className="text-xs text-custom-600 mt-1">Select a customer first</p>
                  )}
                </div>

                <div className={`flex-1 overflow-y-auto px-6 py-5 space-y-4 min-h-0 transition-opacity ${
                  selectedCustomer ? "opacity-100" : "opacity-40 pointer-events-none"
                }`}>
                  <div>
                    <label className="block text-sm font-semibold text-secondary-100 mb-1.5">
                      Job Title <span className="text-red-500">*</span>
                    </label>
                    <Input name="title" type="text" placeholder="e.g. Business Cards for Acme Corp"
                      value={form.title} onChange={handleFieldChange} required fullWidth />
                  </div>

                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <label className="block text-sm font-semibold text-secondary-100 mb-1.5">Job Type</label>
                      <SelectOrCustom
                        name="jobType"
                        value={form.jobType}
                        onChange={(val) => setForm((p) => ({ ...p, jobType: val }))}
                        placeholder="Select type"
                        options={[
                          { value: "business-card", label: "Business Card" },
                          { value: "brochure",      label: "Brochure" },
                          { value: "flyer",         label: "Flyer" },
                          { value: "banner",        label: "Banner" },
                          { value: "booklet",       label: "Booklet" },
                          { value: "poster",        label: "Poster" },
                          { value: "envelope",      label: "Envelope" },
                        ]}
                      />
                    </div>
                    <div>
                      <label className="block text-sm font-semibold text-secondary-100 mb-1.5">Quantity</label>
                      <Input name="quantity" type="number" min="1" placeholder="e.g. 500"
                        value={form.quantity} onChange={handleFieldChange} fullWidth />
                    </div>
                  </div>

                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <label className="block text-sm font-semibold text-secondary-100 mb-1.5">Size</label>
                      <SelectOrCustom
                        name="size"
                        value={form.size}
                        onChange={(val) => setForm((p) => ({ ...p, size: val }))}
                        placeholder="Select size"
                        options={[
                          { value: "A3",     label: "A3" },
                          { value: "A4",     label: "A4" },
                          { value: "A5",     label: "A5" },
                          { value: "A6",     label: "A6" },
                          { value: "Letter", label: "Letter" },
                        ]}
                      />
                    </div>
                    <div>
                      <label className="block text-sm font-semibold text-secondary-100 mb-1.5">Color Mode</label>
                      <SelectOrCustom
                        name="colorMode"
                        value={form.colorMode}
                        onChange={(val) => setForm((p) => ({ ...p, colorMode: val }))}
                        placeholder="Select color mode"
                        options={[
                          { value: "full-color",      label: "Full Color" },
                          { value: "black-and-white", label: "Black & White" },
                          { value: "spot-color",      label: "Spot Color" },
                        ]}
                      />
                    </div>
                  </div>

                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <label className="block text-sm font-semibold text-secondary-100 mb-1.5">Binding Type</label>
                      <SelectOrCustom
                        name="bindingType"
                        value={form.bindingType}
                        onChange={(val) => setForm((p) => ({ ...p, bindingType: val }))}
                        placeholder="Select binding"
                        options={[
                          { value: "none",      label: "None" },
                          { value: "staple",    label: "Staple" },
                          { value: "spiral",    label: "Spiral" },
                          { value: "perfect",   label: "Perfect Bind" },
                          { value: "hardcover", label: "Hardcover" },
                        ]}
                      />
                    </div>
                    <div>
                      <label className="block text-sm font-semibold text-secondary-100 mb-1.5">Priority</label>
                      <SelectOrCustom
                        name="priority"
                        value={form.priority}
                        onChange={(val) => setForm((p) => ({ ...p, priority: val as typeof form.priority }))}
                        placeholder="Select priority"
                        options={[
                          { value: "low",    label: "Low" },
                          { value: "normal", label: "Normal" },
                          { value: "high",   label: "High" },
                          { value: "urgent", label: "Urgent" },
                        ]}
                      />
                    </div>
                  </div>

                  <div>
                    <label className="block text-sm font-semibold text-secondary-100 mb-1.5">Due Date</label>
                    <Input name="dueDate" type="date" value={form.dueDate} onChange={handleFieldChange} fullWidth />
                  </div>

                  <div>
                    <label className="block text-sm font-semibold text-secondary-100 mb-1.5">Description</label>
                    <textarea name="description" value={form.description} onChange={handleFieldChange}
                      rows={2} placeholder="Brief description…" className={`${selectCls} resize-none`} />
                  </div>

                  <div>
                    <label className="block text-sm font-semibold text-secondary-100 mb-1.5">Notes</label>
                    <textarea name="notes" value={form.notes} onChange={handleFieldChange}
                      rows={2} placeholder="Special instructions…" className={`${selectCls} resize-none`} />
                  </div>
                </div>

                <div className="px-6 py-4 border-t border-custom-300 flex items-center justify-end gap-3 shrink-0">
                  <Button type="button" variant="outline" onClick={onClose}>Cancel</Button>
                  <Button
                    type="button"
                    disabled={!step1Valid}
                    onClick={() => setStep(2)}
                  >
                    Next: Stock Items →
                  </Button>
                </div>
              </div>
            </div>
          )}

          {/* ── Step 2: Stock Items ──────────────────────────────────────── */}
          {step === 2 && (
            <div className="flex flex-col lg:flex-row flex-1 min-h-0">

              {/* LEFT — Search & add stock items */}
              <div className="lg:w-2/5 border-b lg:border-b-0 lg:border-r border-custom-300 flex flex-col min-h-0">
                <div className="px-6 py-4 border-b border-custom-200 shrink-0">
                  <p className="text-xs font-bold text-custom-700 uppercase tracking-wide mb-1">
                    Step 2 of 3 — Add Stock Items
                  </p>
                  <p className="text-xs text-custom-600 mb-3">
                    Search raw materials needed for this job. Optional — can be added later.
                  </p>
                  <div className="relative" ref={dropdownRef}>
                    <HiOutlineSearch className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-custom-700 z-10" />
                    <input
                      type="text"
                      value={itemSearch}
                      onChange={(e) => { setItemSearch(e.target.value); setShowDropdown(true); }}
                      onFocus={() => setShowDropdown(true)}
                      placeholder="Search by material name…"
                      className="w-full pl-9 pr-4 py-2 rounded-xl border border-custom-400 bg-style-500 text-secondary-100 text-sm focus:outline-none focus:border-primary-400 focus:ring-2 focus:ring-primary-200 transition-colors"
                    />
                    {showDropdown && (
                      <div className="absolute z-20 top-full left-0 right-0 mt-1 rounded-xl border border-custom-300 bg-style-500 shadow-lg max-h-56 overflow-y-auto">
                        {loadingStock ? (
                          <div className="px-4 py-3 text-sm text-custom-700">Loading…</div>
                        ) : filteredStockItems.length === 0 ? (
                          <div className="px-4 py-3 text-sm text-custom-700">No items found</div>
                        ) : (
                          filteredStockItems.map((item) => {
                            const isOut = item.stockStatus === "out-of-stock" || (item.stockStatus as string) === "OUT_OF_STOCK";
                            return (
                              <button
                                key={item.id}
                                type="button"
                                onMouseDown={(e) => { e.preventDefault(); if (!isOut) { addItem(item); setShowDropdown(false); } }}
                                disabled={isOut}
                                className={`w-full text-left px-4 py-2.5 transition-colors ${
                                  isOut ? "opacity-50 cursor-not-allowed" : "hover:bg-custom-100"
                                }`}
                              >
                                <div className="flex items-center justify-between gap-2">
                                  <div className="min-w-0">
                                    <p className="text-sm font-semibold text-secondary-100 truncate">{item.name}</p>
                                    <p className="text-xs text-custom-700">{item.category} · {item.unit}</p>
                                  </div>
                                  <div className="text-right shrink-0">
                                    <p className={`text-xs font-bold ${
                                      isOut ? "text-red-500" :
                                      item.stockStatus === "low" || (item.stockStatus as string) === "LOW"
                                        ? "text-yellow-600" : "text-emerald-600"
                                    }`}>
                                      {isOut ? "Out of stock" : `${item.currentStock} ${item.unit}`}
                                    </p>
                                  </div>
                                </div>
                              </button>
                            );
                          })
                        )}
                      </div>
                    )}
                  </div>
                </div>

                {/* Added items summary in left panel */}
                <div className="flex-1 overflow-y-auto px-3 py-3 min-h-0">
                  {selectedItems.length === 0 ? (
                    <div className="flex flex-col items-center justify-center h-full text-custom-700 gap-2 py-8">
                      <HiOutlineCube className="w-8 h-8 text-custom-400" />
                      <span className="text-sm">No items added yet</span>
                      <span className="text-xs text-center">Click the search box above to browse</span>
                    </div>
                  ) : (
                    <div className="space-y-1">
                      <p className="text-xs font-bold text-custom-700 uppercase tracking-wide px-2 mb-2">
                        Added ({selectedItems.length})
                      </p>
                      {selectedItems.map((si) => (
                        <div key={si.stockItem.id} className="flex items-center justify-between px-2 py-1.5 rounded-lg hover:bg-custom-100">
                          <div className="min-w-0">
                            <p className="text-xs font-semibold text-secondary-100 truncate">{si.stockItem.name}</p>
                            <p className="text-xs text-custom-700">{si.quantityNeeded} {si.stockItem.unit}</p>
                          </div>
                          <button
                            type="button"
                            onClick={() => removeItem(si.stockItem.id)}
                            className="p-1 rounded hover:bg-red-100 text-custom-700 hover:text-red-600 transition-colors shrink-0 ml-2"
                          >
                            <HiOutlineX className="w-3.5 h-3.5" />
                          </button>
                        </div>
                      ))}

                      {/* Pricing Adjustments — below the added items list */}
                      {itemsTotal > 0 && (
                        <div className="mt-3 rounded-xl border border-custom-300 bg-custom-50 p-3 space-y-3">
                          <p className="text-xs font-bold text-custom-700 uppercase tracking-wide">Pricing Adjustments</p>

                          <div className="grid grid-cols-2 gap-2">
                            {/* Discount */}
                            <div>
                              <label className="block text-xs font-semibold text-secondary-100 mb-1">Discount (%)</label>
                              <div className="flex items-center gap-1">
                                <button type="button"
                                  onClick={() => { setDiscountRate((v) => Math.max(0, v - 1)); setAmountManuallyEdited(false); }}
                                  className="p-1.5 rounded-lg border border-custom-300 hover:bg-custom-100 transition-colors">
                                  <span className="text-xs font-bold leading-none">−</span>
                                </button>
                                <input type="number" min={0} max={100} value={discountRate}
                                  onChange={(e) => { setDiscountRate(Math.min(100, Math.max(0, Number(e.target.value)))); setAmountManuallyEdited(false); }}
                                  className="flex-1 px-2 py-1.5 rounded-lg border border-custom-300 bg-style-500 text-secondary-100 text-xs text-center focus:outline-none focus:border-primary-400 transition-colors"
                                />
                                <button type="button"
                                  onClick={() => { setDiscountRate((v) => Math.min(100, v + 1)); setAmountManuallyEdited(false); }}
                                  className="p-1.5 rounded-lg border border-custom-300 hover:bg-custom-100 transition-colors">
                                  <span className="text-xs font-bold leading-none">+</span>
                                </button>
                              </div>
                            </div>

                            {/* Tax */}
                            <div>
                              <label className="block text-xs font-semibold text-secondary-100 mb-1">Tax / VAT (%)</label>
                              <div className="flex items-center gap-1">
                                <button type="button"
                                  onClick={() => { setTaxRate((v) => Math.max(0, v - 1)); setAmountManuallyEdited(false); }}
                                  className="p-1.5 rounded-lg border border-custom-300 hover:bg-custom-100 transition-colors">
                                  <span className="text-xs font-bold leading-none">−</span>
                                </button>
                                <input type="number" min={0} max={100} value={taxRate}
                                  onChange={(e) => { setTaxRate(Math.min(100, Math.max(0, Number(e.target.value)))); setAmountManuallyEdited(false); }}
                                  className="flex-1 px-2 py-1.5 rounded-lg border border-custom-300 bg-style-500 text-secondary-100 text-xs text-center focus:outline-none focus:border-primary-400 transition-colors"
                                />
                                <button type="button"
                                  onClick={() => { setTaxRate((v) => Math.min(100, v + 1)); setAmountManuallyEdited(false); }}
                                  className="p-1.5 rounded-lg border border-custom-300 hover:bg-custom-100 transition-colors">
                                  <span className="text-xs font-bold leading-none">+</span>
                                </button>
                              </div>
                            </div>
                          </div>

                          {/* Mini breakdown */}
                          <div className="space-y-1 pt-2 border-t border-custom-200 text-xs">
                            <div className="flex justify-between text-custom-700">
                              <span>Subtotal</span>
                              <span className="font-semibold text-secondary-100">{itemsTotal.toLocaleString()} RWF</span>
                            </div>
                            {discountRate > 0 && (
                              <div className="flex justify-between text-custom-700">
                                <span>Discount ({discountRate}%)</span>
                                <span className="font-semibold text-orange-600">− {discountAmt.toLocaleString()} RWF</span>
                              </div>
                            )}
                            {taxRate > 0 && (
                              <div className="flex justify-between text-custom-700">
                                <span>Tax / VAT ({taxRate}%)</span>
                                <span className="font-semibold text-secondary-100">+ {taxAmt.toLocaleString()} RWF</span>
                              </div>
                            )}
                            <div className="flex justify-between font-bold text-secondary-100 pt-1 border-t border-custom-200">
                              <span>Total</span>
                              <span className="text-primary-500">{computedTotal.toLocaleString()} RWF</span>
                            </div>
                          </div>
                        </div>
                      )}
                    </div>
                  )}
                </div>
              </div>

              {/* RIGHT — Selected items list */}
              <div className="lg:w-3/5 flex flex-col min-h-0">
                <div className="px-6 py-4 border-b border-custom-200 shrink-0">
                  <div className="flex items-center justify-between">
                    <p className="text-xs font-bold text-custom-700 uppercase tracking-wide">
                      Selected Items ({selectedItems.length})
                    </p>
                    {itemsTotal > 0 && (
                      <p className="text-sm font-bold text-secondary-100">
                        Est. cost:{" "}
                        <span className="text-primary-500">{itemsTotal.toLocaleString()} RWF</span>
                      </p>
                    )}
                  </div>
                </div>

                <div className="flex-1 overflow-y-auto px-6 py-4 min-h-0">
                  {selectedItems.length === 0 ? (
                    <div className="flex flex-col items-center justify-center h-full text-custom-700 gap-3">
                      <HiOutlineCube className="w-10 h-10 text-custom-400" />
                      <p className="text-sm font-semibold">No items added yet</p>
                      <p className="text-xs text-center">
                        Search and add stock items on the left, or skip to create the job without items.
                      </p>
                    </div>
                  ) : (
                    <div className="space-y-3">
                      {selectedItems.map((si) => {
                        const isOverStock = si.quantityNeeded > si.stockItem.currentStock;
                        const lineTotal = (si.stockItem.unitCost ?? 0) * si.quantityNeeded;

                        return (
                          <div
                            key={si.stockItem.id}
                            className={`rounded-xl border p-4 ${
                              isOverStock ? "border-red-300 bg-red-50" : "border-custom-300 bg-custom-50"
                            }`}
                          >
                            <div className="flex items-start justify-between gap-3 mb-3">
                              <div className="min-w-0">
                                <p className="text-sm font-bold text-secondary-100 truncate">
                                  {si.stockItem.name}
                                </p>
                                <p className="text-xs text-custom-700">
                                  {si.stockItem.category} · Available: {si.stockItem.currentStock} {si.stockItem.unit}
                                </p>
                              </div>
                              <button
                                type="button"
                                onClick={() => removeItem(si.stockItem.id)}
                                className="p-1 rounded-lg hover:bg-red-100 text-custom-700 hover:text-red-600 transition-colors shrink-0"
                              >
                                <HiOutlineTrash className="w-4 h-4" />
                              </button>
                            </div>

                            {/* Quantity input */}
                            <div className="flex items-center gap-3 mb-2">
                              <div className="flex-1">
                                <label className="block text-xs font-semibold text-custom-700 mb-1">
                                  Quantity Needed ({si.stockItem.unit})
                                </label>
                                <input
                                  type="number"
                                  min="1"
                                  value={si.quantityNeeded}
                                  onChange={(e) =>
                                    updateItemQty(si.stockItem.id, parseInt(e.target.value, 10) || 1)
                                  }
                                  className={`w-full px-3 py-2 rounded-xl border text-sm font-semibold text-secondary-100 bg-style-500 focus:outline-none focus:ring-2 transition-colors ${
                                    isOverStock
                                      ? "border-red-400 focus:ring-red-200"
                                      : "border-custom-400 focus:border-primary-400 focus:ring-primary-200"
                                  }`}
                                />
                              </div>
                              {si.stockItem.unitCost != null && (
                                <div className="text-right shrink-0">
                                  <p className="text-xs text-custom-700 mb-1">Line total</p>
                                  <p className="text-sm font-bold text-secondary-100">
                                    {lineTotal.toLocaleString()} RWF
                                  </p>
                                </div>
                              )}
                            </div>

                            {/* Over-stock warning */}
                            {isOverStock && (
                              <div className="flex items-center gap-2 text-red-600 text-xs mb-2">
                                <HiOutlineExclamationCircle className="w-4 h-4 shrink-0" />
                                <span>
                                  Requested {si.quantityNeeded} but only {si.stockItem.currentStock}{" "}
                                  {si.stockItem.unit} available. The stock team will be notified.
                                </span>
                              </div>
                            )}

                            {/* Notes */}
                            <input
                              type="text"
                              value={si.notes}
                              onChange={(e) => updateItemNotes(si.stockItem.id, e.target.value)}
                              placeholder="Notes (optional, e.g. 80gsm)"
                              className="w-full px-3 py-1.5 rounded-xl border border-custom-300 bg-style-500 text-secondary-100 text-xs focus:outline-none focus:border-primary-400 transition-colors"
                            />
                          </div>
                        );
                      })}
                    </div>
                  )}

                </div>

                {/* Error — step 2 */}
                {submitError && (
                  <div className="mx-6 mb-2 flex items-start gap-2 px-4 py-3 rounded-xl bg-red-50 border border-red-200 text-red-700 text-sm">
                    <HiOutlineExclamationCircle className="w-5 h-5 shrink-0 mt-0.5" />
                    <span>{submitError}</span>
                  </div>
                )}

                {/* Footer */}
                <div className="px-6 py-4 border-t border-custom-300 flex items-center justify-between gap-3 shrink-0">
                  <button
                    type="button"
                    onClick={() => setStep(1)}
                    className="text-sm font-semibold text-custom-700 hover:text-secondary-100 transition-colors"
                  >
                    ← Back
                  </button>
                  <div className="flex gap-3">
                    <Button type="button" variant="outline" onClick={onClose}>Cancel</Button>
                    <Button
                      type="button"
                      onClick={() => setStep(3)}
                    >
                      Next: Documents →
                    </Button>
                  </div>
                </div>
              </div>
            </div>
          )}
          {step === 3 && (
            <div className="flex flex-col flex-1 min-h-0">
              <div className="px-6 py-4 border-b border-custom-200 shrink-0">
                <p className="text-xs font-bold text-custom-700 uppercase tracking-wide">
                  Step 3 of 4 — Attach Documents
                </p>
                <p className="text-xs text-custom-600 mt-1">
                  Upload any client documents related to this job (design files, briefs, references). Optional.
                </p>
              </div>

              <div className="flex-1 overflow-y-auto px-6 py-6 min-h-0">
                <div className="max-w-lg mx-auto space-y-5">

                  {/* Drop zone */}
                  <label
                    htmlFor="job-docs-input"
                    className="flex flex-col items-center justify-center gap-3 p-8 rounded-2xl border-2 border-dashed border-custom-300 hover:border-primary-400 hover:bg-primary-50 transition-colors cursor-pointer group"
                  >
                    <div className="w-12 h-12 rounded-xl bg-custom-100 group-hover:bg-primary-100 flex items-center justify-center transition-colors">
                      <HiOutlineDocumentText className="w-6 h-6 text-custom-700 group-hover:text-primary-500 transition-colors" />
                    </div>
                    <div className="text-center">
                      <p className="text-sm font-semibold text-secondary-100">Click to browse or drag files here</p>
                      <p className="text-xs text-custom-700 mt-1">
                        PDF, Word, Excel, images — up to 10 files
                      </p>
                    </div>
                    <input
                      id="job-docs-input"
                      type="file"
                      multiple
                      accept=".pdf,.doc,.docx,.xls,.xlsx,.png,.jpg,.jpeg,.gif,.webp"
                      className="hidden"
                      onChange={(e) => addDocuments(e.target.files)}
                    />
                  </label>

                  {/* File list */}
                  {documents.length > 0 && (
                    <div className="space-y-2">
                      <p className="text-xs font-bold text-custom-700 uppercase tracking-wide">
                        Selected ({documents.length})
                      </p>
                      {documents.map((file, idx) => {
                        const isImage = file.type.startsWith("image/");
                        const isPdf   = file.type === "application/pdf";
                        return (
                          <div
                            key={idx}
                            className="flex items-center gap-3 p-3 rounded-xl border border-custom-300 bg-custom-50 group"
                          >
                            <div className="w-9 h-9 rounded-lg flex items-center justify-center shrink-0 bg-white border border-custom-200">
                              <HiOutlineDocumentText className={`w-5 h-5 ${isPdf ? "text-red-500" : isImage ? "text-blue-500" : "text-custom-700"}`} />
                            </div>
                            <div className="min-w-0 flex-1">
                              <p className="text-sm font-semibold text-secondary-100 truncate">{file.name}</p>
                              <p className="text-xs text-custom-700">{formatFileSize(file.size)} · {file.type || "unknown"}</p>
                            </div>
                            <button
                              type="button"
                              onClick={() => removeDocument(idx)}
                              className="p-1.5 rounded-lg opacity-0 group-hover:opacity-100 hover:bg-red-100 text-custom-700 hover:text-red-600 transition-all shrink-0"
                              title="Remove"
                            >
                              <HiOutlineTrash className="w-4 h-4" />
                            </button>
                          </div>
                        );
                      })}
                    </div>
                  )}

                  {documents.length === 0 && (
                    <p className="text-center text-xs text-custom-700">
                      No documents selected — you can skip this step.
                    </p>
                  )}
                </div>
              </div>

              <div className="px-6 py-4 border-t border-custom-300 flex items-center justify-between gap-3 shrink-0">
                <button
                  type="button"
                  onClick={() => setStep(2)}
                  className="text-sm font-semibold text-custom-700 hover:text-secondary-100 transition-colors"
                >
                  ← Back
                </button>
                <div className="flex gap-3">
                  <Button type="button" variant="outline" onClick={onClose}>Cancel</Button>
                  <Button type="button" onClick={() => setStep(4)}>
                    Next: Review & Amount →
                  </Button>
                </div>
              </div>
            </div>
          )}

          {/* ── Step 4: Review & Amount ──────────────────────────────────── */}
          {step === 4 && (
            <div className="flex flex-col flex-1 min-h-0">
              <div className="px-6 py-4 border-b border-custom-200 shrink-0">
                <p className="text-xs font-bold text-custom-700 uppercase tracking-wide">
                  Step 4 of 4 — Review & Amount
                </p>
                <p className="text-xs text-custom-600 mt-1">
                  Amount is calculated from your stock items. You can adjust it before submitting.
                </p>
              </div>

              <div className="flex-1 overflow-y-auto px-6 py-6 min-h-0">
                <div className="max-w-lg mx-auto space-y-6">

                  {/* Job summary */}
                  <div className="rounded-xl border border-custom-300 bg-custom-50 p-4 space-y-2">
                    <p className="text-xs font-bold text-custom-700 uppercase tracking-wide mb-3">Job Summary</p>
                    <div className="flex justify-between text-sm">
                      <span className="text-custom-700">Customer</span>
                      <span className="font-semibold text-secondary-100">{selectedCustomer?.name}</span>
                    </div>
                    <div className="flex justify-between text-sm">
                      <span className="text-custom-700">Title</span>
                      <span className="font-semibold text-secondary-100 text-right max-w-[60%] truncate">{form.title}</span>
                    </div>
                    {form.jobType && (
                      <div className="flex justify-between text-sm">
                        <span className="text-custom-700">Type</span>
                        <span className="font-semibold text-secondary-100 capitalize">{form.jobType.replace("-", " ")}</span>
                      </div>
                    )}
                    <div className="flex justify-between text-sm">
                      <span className="text-custom-700">Priority</span>
                      <span className="font-semibold text-secondary-100 capitalize">{form.priority}</span>
                    </div>
                    {form.dueDate && (
                      <div className="flex justify-between text-sm">
                        <span className="text-custom-700">Due Date</span>
                        <span className="font-semibold text-secondary-100">{form.dueDate}</span>
                      </div>
                    )}
                    <div className="flex justify-between text-sm">
                      <span className="text-custom-700">Stock Items</span>
                      <span className="font-semibold text-secondary-100">{selectedItems.length} item{selectedItems.length !== 1 ? "s" : ""}</span>
                    </div>
                  </div>

                  {/* Items breakdown */}
                  {selectedItems.length > 0 && (
                    <div className="rounded-xl border border-custom-300 bg-custom-50 p-4">
                      <p className="text-xs font-bold text-custom-700 uppercase tracking-wide mb-3">Items Breakdown</p>
                      <div className="space-y-2">
                        {selectedItems.map((si) => {
                          const lineTotal = (si.stockItem.unitCost ?? 0) * si.quantityNeeded;
                          return (
                            <div key={si.stockItem.id} className="flex justify-between text-sm">
                              <span className="text-custom-700 truncate max-w-[60%]">
                                {si.stockItem.name} × {si.quantityNeeded} {si.stockItem.unit}
                              </span>
                              <span className="font-semibold text-secondary-100 shrink-0">
                                {lineTotal > 0 ? `${lineTotal.toLocaleString()} RWF` : "—"}
                              </span>
                            </div>
                          );
                        })}
                        {itemsTotal > 0 && (
                          <div className="space-y-1 pt-2 border-t border-custom-300 mt-2 text-sm">
                            <div className="flex justify-between">
                              <span className="text-custom-700">Subtotal</span>
                              <span className="font-semibold text-secondary-100">{itemsTotal.toLocaleString()} RWF</span>
                            </div>
                            {discountRate > 0 && (
                              <div className="flex justify-between">
                                <span className="text-custom-700">Discount ({discountRate}%)</span>
                                <span className="font-semibold text-orange-600">− {discountAmt.toLocaleString()} RWF</span>
                              </div>
                            )}
                            {taxRate > 0 && (
                              <div className="flex justify-between">
                                <span className="text-custom-700">Tax / VAT ({taxRate}%)</span>
                                <span className="font-semibold text-secondary-100">+ {taxAmt.toLocaleString()} RWF</span>
                              </div>
                            )}
                            <div className="flex justify-between font-bold pt-1 border-t border-custom-200">
                              <span className="text-secondary-100">Total</span>
                              <span className="text-primary-500">{computedTotal.toLocaleString()} RWF</span>
                            </div>
                          </div>
                        )}
                      </div>
                    </div>
                  )}

                  {/* Documents summary */}
                  {documents.length > 0 && (
                    <div className="rounded-xl border border-custom-300 bg-custom-50 p-4">
                      <p className="text-xs font-bold text-custom-700 uppercase tracking-wide mb-3">
                        Attached Documents ({documents.length})
                      </p>
                      <div className="space-y-1.5">
                        {documents.map((f, i) => (
                          <div key={i} className="flex items-center gap-2 text-sm">
                            <HiOutlineDocumentText className="w-4 h-4 text-primary-500 shrink-0" />
                            <span className="text-secondary-100 truncate">{f.name}</span>
                            <span className="text-custom-700 text-xs shrink-0">
                              {f.size < 1024 * 1024
                                ? `${(f.size / 1024).toFixed(1)} KB`
                                : `${(f.size / (1024 * 1024)).toFixed(1)} MB`}
                            </span>
                          </div>
                        ))}
                      </div>
                    </div>
                  )}

                  {/* Amount field — pre-filled, editable */}
                  <div>
                    <label className="block text-sm font-bold text-secondary-100 mb-1.5">
                      Job Amount (RWF) <span className="text-red-500">*</span>
                    </label>
                    <p className="text-xs text-custom-700 mb-2">
                      {itemsTotal > 0
                        ? "Pre-filled from items total. Adjust if needed."
                        : "Enter the job amount manually."}
                    </p>
                    <input
                      type="number"
                      min="0"
                      step="any"
                      name="amount"
                      value={form.amount}
                      onChange={(e) => {
                        setAmountManuallyEdited(true);
                        handleFieldChange(e);
                      }}
                      placeholder="e.g. 25000"
                      className={selectCls}
                    />
                    {itemsTotal > 0 && form.amount && parseFloat(form.amount) !== computedTotal && (
                      <div className="flex items-center justify-between mt-1">
                        <p className="text-xs text-yellow-600 flex items-center gap-1">
                          <HiOutlineExclamationCircle className="w-3.5 h-3.5" />
                          Differs from calculated total ({computedTotal.toLocaleString()} RWF)
                        </p>
                        <button
                          type="button"
                          onClick={() => {
                            setAmountManuallyEdited(false);
                            setForm((prev) => ({ ...prev, amount: String(computedTotal) }));
                          }}
                          className="text-xs text-primary-500 hover:text-primary-600 font-semibold"
                        >
                          Reset to calculated total
                        </button>
                      </div>
                    )}
                  </div>

                  {/* Error */}
                  {submitError && (
                    <div className="flex items-start gap-2 px-4 py-3 rounded-xl bg-red-50 border border-red-200 text-red-700 text-sm">
                      <HiOutlineExclamationCircle className="w-5 h-5 shrink-0 mt-0.5" />
                      <span>{submitError}</span>
                    </div>
                  )}
                </div>
              </div>

              {/* Footer */}
              <div className="px-6 py-4 border-t border-custom-300 flex items-center justify-between gap-3 shrink-0">
                <button
                  type="button"
                  onClick={() => setStep(3)}
                  className="text-sm font-semibold text-custom-700 hover:text-secondary-100 transition-colors"
                >
                  ← Back
                </button>
                <div className="flex gap-3">
                  <Button type="button" variant="outline" onClick={onClose}>Cancel</Button>
                  <Button
                    type="button"
                    disabled={submitting}
                    onClick={handleSubmit}
                  >
                    {submitting ? "Creating…" : "Create Job"}
                  </Button>
                </div>
              </div>
            </div>
          )}

        </Card>
      </div>
    </div>
  );
}
