import { useState } from "react";
import {
  HiOutlineSearch,
  HiOutlineCube,
  HiOutlineExclamationCircle,
  HiOutlineCheckCircle,
  HiOutlineRefresh,
  HiOutlineShoppingCart,
  HiOutlineX,
  HiOutlineCash,
  HiOutlineFilter,
  HiOutlinePlus,
} from "react-icons/hi";
import { toast } from "react-toastify";
import { DashboardLayout } from "../../components";
import { Card } from "../../components/ui";
import {
  useGetHobesQuery,
  useGetHobeSalesQuery,
  useSellHobeMutation,
  useUpdateHobeSaleMutation,
  useCreateHobeMutation,
  type Hobe,
  type HobeSale,
  type HobePaymentMethod,
} from "../../store/services/hobeService";
import { useGetCustomersQuery } from "../../store/services/customersService";

// ─── Add Hobe Modal ───────────────────────────────────────────────────────────

function AddHobeModal({ onClose, onSuccess }: { onClose: () => void; onSuccess: () => void }) {
  const [form, setForm] = useState({
    nameOfHobe: "", doneAt: "", expiredAt: "", qty: "", pricePerItem: "", ob: "", note: "",
  });
  const [createHobe, { isLoading }] = useCreateHobeMutation();

  const set = (key: string) => (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) =>
    setForm((prev) => ({ ...prev, [key]: e.target.value }));

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!form.nameOfHobe || !form.doneAt || !form.expiredAt || !form.qty || !form.pricePerItem) {
      toast.error("Please fill in all required fields"); return;
    }
    try {
      await createHobe({
        nameOfHobe:   form.nameOfHobe.trim(),
        doneAt:       form.doneAt,
        expiredAt:    form.expiredAt,
        qty:          Number(form.qty),
        pricePerItem: Number(form.pricePerItem),
        ob:           form.ob ? Number(form.ob) : undefined,
        note:         form.note.trim() || undefined,
      }).unwrap();
      toast.success("Hobe batch added successfully");
      onSuccess();
    } catch (err: any) {
      toast.error(err?.data?.message ?? "Failed to add hobe");
    }
  };

  const inputClass = "w-full px-3 py-2 rounded-xl border border-custom-300 bg-style-500 text-secondary-100 text-sm focus:outline-none focus:border-primary-400 transition-colors";

  return (
    <div className="fixed inset-0 bg-secondary-100/50 z-50 flex items-start justify-center p-4 overflow-y-auto">
      <div className="bg-white rounded-2xl shadow-xl !p-6 max-w-lg w-full my-8 p-6">
        <div className="flex items-center justify-between mb-5">
          <div>
            <h3 className="text-xl font-bold text-secondary-100">Add Hobe Batch</h3>
            <p className="text-sm text-custom-700 mt-0.5">Register a new hobe batch for trade</p>
          </div>
          <button onClick={onClose} className="text-custom-700 hover:text-secondary-100"><HiOutlineX className="w-6 h-6" /></button>
        </div>

        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="grid grid-cols-2 gap-3">
            <div className="col-span-2">
              <label className="block text-sm font-semibold text-secondary-100 mb-1">Name *</label>
              <input value={form.nameOfHobe} onChange={set("nameOfHobe")} placeholder="e.g. Inkjet Paper A4" className={inputClass} />
            </div>
            <div>
              <label className="block text-sm font-semibold text-secondary-100 mb-1">Done At *</label>
              <input type="date" value={form.doneAt} onChange={set("doneAt")} className={inputClass} />
            </div>
            <div>
              <label className="block text-sm font-semibold text-secondary-100 mb-1">Expires At *</label>
              <input type="date" value={form.expiredAt} onChange={set("expiredAt")} className={inputClass} />
            </div>
            <div>
              <label className="block text-sm font-semibold text-secondary-100 mb-1">Quantity *</label>
              <input type="number" min={1} value={form.qty} onChange={set("qty")} placeholder="0" className={inputClass} />
            </div>
            <div>
              <label className="block text-sm font-semibold text-secondary-100 mb-1">Price per Item (RWF) *</label>
              <input type="number" min={0} value={form.pricePerItem} onChange={set("pricePerItem")} placeholder="0" className={inputClass} />
            </div>
            <div>
              <label className="block text-sm font-semibold text-secondary-100 mb-1">OB <span className="font-normal text-custom-700">(optional)</span></label>
              <input type="number" min={0} value={form.ob} onChange={set("ob")} placeholder="0" className={inputClass} />
            </div>
            <div>
              <label className="block text-sm font-semibold text-secondary-100 mb-1">Note <span className="font-normal text-custom-700">(optional)</span></label>
              <input value={form.note} onChange={set("note")} placeholder="Any remarks..." className={inputClass} />
            </div>
          </div>

          <div className="flex gap-3 justify-end pt-2 border-t border-custom-300">
            <button type="button" onClick={onClose}
              className="px-4 py-2 rounded-xl border border-custom-300 text-sm font-semibold text-secondary-100 hover:bg-custom-100 transition-colors"
            >Cancel</button>
            <button type="submit" disabled={isLoading}
              className="px-4 py-2 rounded-xl bg-primary-500 text-white text-sm font-semibold hover:bg-primary-600 transition-colors disabled:opacity-40"
            >{isLoading ? "Saving..." : "Add Batch"}</button>
          </div>
        </form>
      </div>
    </div>
  );
}

// ─── Payment methods ─────────────────────────────────────────────────────────

const PAYMENT_METHODS: { value: HobePaymentMethod; label: string }[] = [
  { value: "cash",   label: "Cash" },
  { value: "mobile", label: "Mobile Money" },
  { value: "card",   label: "Card" },
  { value: "bank",   label: "Bank Transfer" },
];

// ─── Sell Modal ───────────────────────────────────────────────────────────────

function SellModal({ hobe, onClose, onSold }: {
  hobe: Hobe;
  onClose: () => void;
  onSold: () => void;
}) {
  const [qty, setQty]                     = useState("1");
  const [amountPaid, setAmountPaid]       = useState("");
  const [paymentMethod, setPaymentMethod] = useState<HobePaymentMethod>("cash");
  const [customerId, setCustomerId]       = useState("");
  const [note, setNote]                   = useState("");
  const [receipt, setReceipt]             = useState<HobeSale | null>(null);
  const [sellHobe, { isLoading }]         = useSellHobeMutation();
  const { data: customersData }           = useGetCustomersQuery({ limit: 200, type: "HOBE" });
  const customers                         = customersData?.customers ?? [];

  const totalExpected = (parseInt(qty) || 1) * hobe.pricePerItem;
  const isUnavailable = hobe.qtyRemains === 0 || hobe.status !== "active";

  const handleSell = async (e: React.FormEvent) => {
    e.preventDefault();
    const q    = parseInt(qty);
    const paid = parseFloat(amountPaid);
    if (!q || q <= 0)           { toast.error("Enter a valid quantity"); return; }
    if (q > hobe.qtyRemains)    { toast.error(`Only ${hobe.qtyRemains} units available`); return; }
    if (!paid || paid <= 0)     { toast.error("Enter amount paid"); return; }
    try {
      const result = await sellHobe({
        id: hobe.id,
        quantity: q,
        amountPaid: paid,
        paymentMethod,
        customerId: customerId || undefined,
        note: note.trim() || undefined,
      }).unwrap();
      setReceipt(result);
      onSold();
    } catch (err: any) {
      toast.error(err?.data?.message ?? "Sale failed");
    }
  };

  const inputCls = "w-full px-3 py-2 rounded-xl border border-custom-300 bg-style-500 text-secondary-100 text-sm focus:outline-none focus:border-primary-400 transition-colors";

  if (receipt) {
    const sConf: Record<string, { label: string; color: string }> = {
      paid:     { label: "Paid",     color: "bg-emerald-100 text-emerald-700" },
      partial:  { label: "Partial",  color: "bg-orange-100 text-orange-700" },
      overpaid: { label: "Overpaid", color: "bg-blue-100 text-blue-700" },
    };
    const sc = sConf[receipt.paymentStatus] ?? sConf.paid;
    return (
      <div className="fixed inset-0 bg-secondary-100/50 z-50 flex items-center justify-center p-4">
        <Card className="!p-6 max-w-sm w-full text-center">
          <h3 className="text-xl font-bold text-secondary-100 mb-2">Sale Recorded</h3>
          <span className={`text-xs font-bold px-3 py-1 rounded-full ${sc.color}`}>{sc.label}</span>
          <div className="mt-4 rounded-xl bg-custom-100 border border-custom-300 p-4 space-y-2.5 text-left">
            {[
              ["Hobe", hobe.nameOfHobe],
              ["Batch #", receipt.hobeNo],
              ["Quantity", String(receipt.quantity)],
              ["Total Price", `${Number(receipt.totalPrice).toLocaleString()} RWF`],
              ["Amount Paid", `${Number(receipt.amountPaid).toLocaleString()} RWF`],
            ].map(([l, v]) => (
              <div key={l} className="flex justify-between text-sm">
                <span className="text-custom-700">{l}</span>
                <span className="font-semibold text-secondary-100">{v}</span>
              </div>
            ))}
            {Number(receipt.balanceDue) > 0 && (
              <div className="flex justify-between text-sm">
                <span className="text-custom-700">Balance Due</span>
                <span className="font-bold text-red-600">{Number(receipt.balanceDue).toLocaleString()} RWF</span>
              </div>
            )}
            {Number(receipt.changeGiven) > 0 && (
              <div className="flex justify-between text-sm">
                <span className="text-custom-700">Change to Give</span>
                <span className="font-bold text-blue-600">{Number(receipt.changeGiven).toLocaleString()} RWF</span>
              </div>
            )}
            <div className="flex justify-between text-sm pt-2 border-t border-custom-200">
              <span className="text-custom-700">Method</span>
              <span className="font-semibold text-secondary-100 capitalize">{receipt.paymentMethod}</span>
            </div>
            <div className="flex justify-between text-sm">
              <span className="text-custom-700">Remaining in Batch</span>
              <span className="font-bold text-primary-500">{receipt.qtyRemains}</span>
            </div>
          </div>
          {receipt.paymentStatus === "overpaid" && (
            <div className="mt-3 px-4 py-3 rounded-xl bg-blue-50 border border-blue-200 text-blue-700 text-sm font-semibold">
              Return {Number(receipt.changeGiven).toLocaleString()} RWF to customer
            </div>
          )}
          {receipt.paymentStatus === "partial" && (
            <div className="mt-3 px-4 py-3 rounded-xl bg-orange-50 border border-orange-200 text-orange-700 text-sm font-semibold">
              Customer owes {Number(receipt.balanceDue).toLocaleString()} RWF
            </div>
          )}
          <button onClick={onClose}
            className="mt-4 w-full px-4 py-2 rounded-xl bg-primary-500 text-white text-sm font-semibold hover:bg-primary-600 transition-colors"
          >Done</button>
        </Card>
      </div>
    );
  }

  return (
    <div className="fixed inset-0 bg-secondary-100/50 z-50 flex items-start justify-center p-4 overflow-y-auto">
      <Card className="!p-6 max-w-md w-full my-8">
        <div className="flex items-center justify-between mb-4">
          <div>
            <h3 className="text-lg font-bold text-secondary-100">{hobe.nameOfHobe}</h3>
            <p className="text-xs font-mono text-custom-700 mt-0.5">Batch: {hobe.hobeNo}</p>
          </div>
          <button onClick={onClose} className="text-custom-700 hover:text-secondary-100">
            <HiOutlineX className="w-5 h-5" />
          </button>
        </div>

        {/* Stock info */}
        <div className="rounded-xl bg-custom-100 border border-custom-300 p-4 space-y-2 mb-4">
          <div className="flex justify-between text-sm">
            <span className="text-custom-700">Price per item</span>
            <span className="font-bold text-secondary-100">{hobe.pricePerItem.toLocaleString()} RWF</span>
          </div>
          <div className="flex justify-between text-sm">
            <span className="text-custom-700">Available</span>
            <span className="font-bold text-emerald-600">{hobe.qtyRemains.toLocaleString()} units</span>
          </div>
          <div className="flex justify-between text-sm">
            <span className="text-custom-700">Total batch qty</span>
            <span className="font-semibold text-secondary-100">{hobe.qty.toLocaleString()}</span>
          </div>
        </div>

        {isUnavailable ? (
          <div className="flex items-start gap-2 px-4 py-3 rounded-xl bg-red-50 border border-red-200 text-red-700 text-sm mb-4">
            <HiOutlineExclamationCircle className="w-5 h-5 flex-shrink-0 mt-0.5" />
            <span>
              {hobe.status !== "active"
                ? `This batch is ${hobe.status}.`
                : "No units remaining in this batch."}
            </span>
          </div>
        ) : (
          <form onSubmit={handleSell} className="space-y-4">
            <div className="grid grid-cols-2 gap-3">
              <div>
                <label className="block text-xs font-semibold text-secondary-100 mb-1">Quantity *</label>
                <input
                  type="number" min={1} max={hobe.qtyRemains} value={qty}
                  onChange={(e) => {
                    setQty(e.target.value);
                    if (!amountPaid) setAmountPaid(String((parseInt(e.target.value) || 1) * hobe.pricePerItem));
                  }}
                  className={inputCls}
                />
              </div>
              <div>
                <label className="block text-xs font-semibold text-secondary-100 mb-1">Amount Paid (RWF) *</label>
                <input
                  type="number" min={1} value={amountPaid}
                  onChange={(e) => setAmountPaid(e.target.value)}
                  placeholder={totalExpected.toLocaleString()}
                  className={inputCls}
                />
              </div>
            </div>

            <div className="flex justify-between text-xs px-1">
              <span className="text-custom-700">Expected: <span className="font-bold text-secondary-100">{totalExpected.toLocaleString()} RWF</span></span>
              {amountPaid && parseFloat(amountPaid) < totalExpected && (
                <span className="text-orange-600 font-bold">Underpaid by {(totalExpected - parseFloat(amountPaid)).toLocaleString()} RWF</span>
              )}
              {amountPaid && parseFloat(amountPaid) > totalExpected && (
                <span className="text-blue-600 font-bold">Change: {(parseFloat(amountPaid) - totalExpected).toLocaleString()} RWF</span>
              )}
            </div>

            <div>
              <label className="block text-xs font-semibold text-secondary-100 mb-2">Payment Method *</label>
              <div className="grid grid-cols-2 gap-2">
                {PAYMENT_METHODS.map((m) => (
                  <button
                    key={m.value} type="button"
                    onClick={() => setPaymentMethod(m.value)}
                    className={`py-2 px-3 rounded-xl border-2 text-xs font-semibold transition-all ${
                      paymentMethod === m.value
                        ? "border-primary-500 bg-primary-50 text-primary-700"
                        : "border-custom-300 text-custom-700 hover:border-primary-300"
                    }`}
                  >{m.label}</button>
                ))}
              </div>
            </div>

            <div>
              <label className="block text-xs font-semibold text-secondary-100 mb-1">
                Customer <span className="font-normal text-custom-700">(optional)</span>
              </label>
              <select value={customerId} onChange={(e) => setCustomerId(e.target.value)} className={inputCls}>
                <option value="">Walk-in customer</option>
                {customers.map((c) => (
                  <option key={c.id} value={c.id}>{c.name}{c.phone ? ` — ${c.phone}` : ""}</option>
                ))}
              </select>
            </div>

            <div>
              <label className="block text-xs font-semibold text-secondary-100 mb-1">Note <span className="font-normal text-custom-700">(optional)</span></label>
              <input value={note} onChange={(e) => setNote(e.target.value)} placeholder="e.g. paid via MTN" className={inputCls} />
            </div>

            <div className="flex gap-3 pt-2 border-t border-custom-300">
              <button type="button" onClick={onClose}
                className="flex-1 px-4 py-2 rounded-xl border border-custom-300 text-sm font-semibold text-secondary-100 hover:bg-custom-100 transition-colors"
              >Cancel</button>
              <button type="submit" disabled={isLoading}
                className="flex-1 flex items-center justify-center gap-2 px-4 py-2 rounded-xl bg-primary-500 text-white text-sm font-semibold hover:bg-primary-600 transition-colors disabled:opacity-40"
              >
                <HiOutlineShoppingCart className="w-4 h-4" />
                {isLoading ? "Processing..." : "Confirm Sale"}
              </button>
            </div>
          </form>
        )}
      </Card>
    </div>
  );
}

// ─── Pending Balances Modal ───────────────────────────────────────────────────

function PendingBalancesModal({ onClose }: { onClose: () => void }) {
  const [activeTab, setActiveTab]   = useState<"partial" | "overpaid">("partial");
  const [payingId, setPayingId]     = useState<string | null>(null);
  const [payAmount, setPayAmount]   = useState("");

  const { data: partialData, isLoading: pLoading, refetch: refetchPartial } =
    useGetHobeSalesQuery({ paymentStatus: "partial", limit: 100 });
  const { data: overpaidData, isLoading: oLoading, refetch: refetchOverpaid } =
    useGetHobeSalesQuery({ paymentStatus: "overpaid", limit: 100 });
  const [updateSale, { isLoading: updating }] = useUpdateHobeSaleMutation();

  const partials  = partialData?.sales  ?? [];
  const overpaid  = overpaidData?.sales ?? [];

  const inputCls = "w-full px-3 py-2 rounded-xl border border-custom-300 bg-style-500 text-secondary-100 text-sm focus:outline-none focus:border-primary-400 transition-colors";

  const handlePayBalance = async (sale: HobeSale) => {
    const amt = parseFloat(payAmount);
    if (!amt || amt <= 0) { toast.error("Enter a valid amount"); return; }
    try {
      await updateSale({ saleId: sale.id, amountPaid: Number(sale.amountPaid) + amt }).unwrap();
      toast.success("Payment updated");
      setPayingId(null); setPayAmount("");
      refetchPartial();
    } catch (err: any) {
      toast.error(err?.data?.message ?? "Failed to update payment");
    }
  };

  const handleConfirmChange = async (sale: HobeSale) => {
    try {
      await updateSale({ saleId: sale.id, amountPaid: Number(sale.totalPrice) }).unwrap();
      toast.success("Sale marked as paid");
      refetchOverpaid();
    } catch (err: any) {
      toast.error(err?.data?.message ?? "Failed to confirm");
    }
  };

  return (
    <div className="fixed inset-0 bg-secondary-100/50 z-50 flex items-start justify-center p-4 overflow-y-auto">
      <Card className="!p-6 max-w-2xl w-full my-8">
        <div className="flex items-center justify-between mb-5">
          <div>
            <h3 className="text-xl font-bold text-secondary-100">Pending Balances</h3>
            <p className="text-sm text-custom-700 mt-0.5">Collect remaining dues or confirm change returned</p>
          </div>
          <button onClick={onClose} className="text-custom-700 hover:text-secondary-100"><HiOutlineX className="w-6 h-6" /></button>
        </div>

        <div className="flex gap-2 mb-5">
          {(["partial", "overpaid"] as const).map((tab) => {
            const count = tab === "partial" ? partials.length : overpaid.length;
            return (
              <button key={tab} onClick={() => setActiveTab(tab)}
                className={`flex items-center gap-2 px-4 py-2 rounded-xl text-sm font-semibold transition-colors ${
                  activeTab === tab
                    ? tab === "partial" ? "bg-orange-500 text-white" : "bg-blue-500 text-white"
                    : "bg-custom-100 text-custom-700 hover:bg-custom-200"
                }`}
              >
                {tab === "partial" ? "Balance Due" : "Change to Give"}
                {count > 0 && <span className="w-5 h-5 rounded-full bg-white/30 text-xs flex items-center justify-center font-bold">{count}</span>}
              </button>
            );
          })}
        </div>

        {pLoading || oLoading ? (
          <div className="py-12 text-center text-custom-700 text-sm">Loading...</div>
        ) : activeTab === "partial" ? (
          partials.length === 0 ? (
            <div className="py-12 text-center">
              <HiOutlineCheckCircle className="w-10 h-10 text-emerald-500 mx-auto mb-3" />
              <p className="text-sm text-custom-700">No pending balances</p>
            </div>
          ) : (
            <div className="space-y-3">
              {partials.map((sale) => (
                <div key={sale.id} className="rounded-xl border border-orange-200 bg-orange-50 p-4">
                  <div className="flex items-start justify-between gap-3">
                    <div className="flex-1 min-w-0">
                      <p className="text-sm font-bold text-secondary-100">{sale.hobe.nameOfHobe}</p>
                      <p className="text-xs font-mono text-custom-700">{sale.hobe.hobeNo}</p>
                      {sale.customer && <p className="text-xs text-custom-700 mt-0.5">{sale.customer.name}{sale.customer.phone && ` · ${sale.customer.phone}`}</p>}
                      <div className="flex gap-4 mt-2 text-xs">
                        <span className="text-custom-700">Total: <span className="font-bold text-secondary-100">{Number(sale.totalPrice).toLocaleString()} RWF</span></span>
                        <span className="text-custom-700">Paid: <span className="font-bold text-emerald-600">{Number(sale.amountPaid).toLocaleString()} RWF</span></span>
                        <span className="text-custom-700">Owes: <span className="font-bold text-red-600">{Number(sale.balanceDue).toLocaleString()} RWF</span></span>
                      </div>
                      <p className="text-xs text-custom-400 mt-1">{new Date(sale.createdAt).toLocaleDateString("en-RW", { day: "2-digit", month: "short", year: "numeric" })}</p>
                    </div>
                    <button
                      onClick={() => { setPayingId(payingId === sale.id ? null : sale.id); setPayAmount(String(Number(sale.balanceDue))); }}
                      className="px-3 py-1.5 rounded-lg bg-orange-500 text-white text-xs font-semibold hover:bg-orange-600 transition-colors flex-shrink-0"
                    >Collect</button>
                  </div>
                  {payingId === sale.id && (
                    <div className="mt-3 pt-3 border-t border-orange-200 flex gap-2 items-end">
                      <div className="flex-1">
                        <label className="block text-xs font-semibold text-secondary-100 mb-1">Amount Received (RWF)</label>
                        <input type="number" min={1} value={payAmount} onChange={(e) => setPayAmount(e.target.value)} className={inputCls} />
                      </div>
                      <button onClick={() => handlePayBalance(sale)} disabled={updating}
                        className="px-4 py-2 rounded-xl bg-emerald-500 text-white text-sm font-semibold hover:bg-emerald-600 disabled:opacity-40 transition-colors"
                      >{updating ? "Saving..." : "Confirm"}</button>
                      <button onClick={() => setPayingId(null)}
                        className="px-3 py-2 rounded-xl border border-custom-300 text-sm text-custom-700 hover:bg-custom-100 transition-colors"
                      >Cancel</button>
                    </div>
                  )}
                </div>
              ))}
            </div>
          )
        ) : (
          overpaid.length === 0 ? (
            <div className="py-12 text-center">
              <HiOutlineCheckCircle className="w-10 h-10 text-emerald-500 mx-auto mb-3" />
              <p className="text-sm text-custom-700">No change to return</p>
            </div>
          ) : (
            <div className="space-y-3">
              {overpaid.map((sale) => (
                <div key={sale.id} className="rounded-xl border border-blue-200 bg-blue-50 p-4">
                  <div className="flex items-start justify-between gap-3">
                    <div className="flex-1 min-w-0">
                      <p className="text-sm font-bold text-secondary-100">{sale.hobe.nameOfHobe}</p>
                      {sale.customer && <p className="text-xs text-custom-700 mt-0.5">{sale.customer.name}</p>}
                      <div className="flex gap-4 mt-2 text-xs">
                        <span className="text-custom-700">Total: <span className="font-bold text-secondary-100">{Number(sale.totalPrice).toLocaleString()} RWF</span></span>
                        <span className="font-bold text-blue-600">Return: {Number(sale.changeGiven).toLocaleString()} RWF</span>
                      </div>
                    </div>
                    <button onClick={() => handleConfirmChange(sale)} disabled={updating}
                      className="px-3 py-1.5 rounded-lg bg-blue-500 text-white text-xs font-semibold hover:bg-blue-600 disabled:opacity-40 transition-colors flex-shrink-0"
                    >Mark Returned</button>
                  </div>
                </div>
              ))}
            </div>
          )
        )}

        <div className="mt-5 flex justify-end">
          <button onClick={onClose}
            className="px-4 py-2 rounded-xl bg-primary-500 text-white text-sm font-semibold hover:bg-primary-600 transition-colors"
          >Close</button>
        </div>
      </Card>
    </div>
  );
}

// ─── Main Page ────────────────────────────────────────────────────────────────

const STATUS_FILTER_OPTIONS = [
  { value: "all",      label: "All" },
  { value: "active",   label: "Active" },
  { value: "expired",  label: "Expired" },
  { value: "sold-out", label: "Sold Out" },
] as const;

type StatusFilter = "all" | "active" | "expired" | "sold-out";

export default function HobeTrade() {
  const [search, setSearch]                     = useState("");
  const [statusFilter, setStatusFilter]         = useState<StatusFilter>("all");
  const [selectedHobe, setSelectedHobe]         = useState<Hobe | null>(null);
  const [showPendingBalances, setShowPendingBalances] = useState(false);
  const [showAddHobe, setShowAddHobe]           = useState(false);

  const { data, isLoading, isError, refetch } = useGetHobesQuery();
  const { data: partialData }  = useGetHobeSalesQuery({ paymentStatus: "partial",  limit: 100 });
  const { data: overpaidData } = useGetHobeSalesQuery({ paymentStatus: "overpaid", limit: 100 });
  const pendingCount = (partialData?.sales?.length ?? 0) + (overpaidData?.sales?.length ?? 0);

  const allHobes = data?.hobes ?? [];

  const hobes = allHobes.filter((h) => {
    const matchStatus = statusFilter === "all" || h.status === statusFilter;
    const q = search.trim().toLowerCase();
    const matchSearch = !q || h.nameOfHobe.toLowerCase().includes(q) || h.hobeNo.toLowerCase().includes(q);
    return matchStatus && matchSearch;
  });

  const totalInShop = hobes.filter((h) => h.status === "active").reduce((s, h) => s + h.qtyRemains, 0);

  const statusConfig: Record<string, { label: string; color: string }> = {
    active:    { label: "Active",    color: "bg-emerald-100 text-emerald-700" },
    expired:   { label: "Expired",   color: "bg-red-100 text-red-600" },
    "sold-out":{ label: "Sold Out",  color: "bg-gray-100 text-gray-500" },
  };

  return (
    <DashboardLayout notificationCount={0}>
      <div className="space-y-6 font-[family-name:var(--font-family-primary)]">

        {/* ── Header ──────────────────────────────────────────────────────── */}
        <div className="flex items-start justify-between gap-4">
          <div>
            <h1 className="text-2xl md:text-3xl font-bold text-secondary-100">Hobe Trade</h1>
            <p className="text-sm text-custom-700 mt-1">Select a batch to record a sale</p>
          </div>
          <div className="flex items-center gap-2">
            <button
              onClick={() => setShowAddHobe(true)}
              className="flex items-center gap-2 px-3 py-2 rounded-xl bg-primary-500 text-white hover:bg-primary-600 transition-colors text-sm font-semibold"
            >
              <HiOutlinePlus className="w-4 h-4" />
              <span className="hidden sm:inline">Add Batch</span>
            </button>
            <button
              onClick={() => setShowPendingBalances(true)}
              className="relative flex items-center gap-2 px-3 py-2 rounded-xl bg-orange-500 text-white hover:bg-orange-600 transition-colors text-sm font-semibold"
            >
              <HiOutlineCash className="w-4 h-4" />
              <span className="hidden sm:inline">Pending</span>
              {pendingCount > 0 && (
                <span className="absolute -top-1 -right-1 w-5 h-5 rounded-full bg-red-600 text-white text-xs flex items-center justify-center font-bold">
                  {pendingCount}
                </span>
              )}
            </button>
            <button onClick={() => refetch()}
              className="p-2 rounded-xl border border-custom-300 hover:bg-custom-100 transition-colors text-custom-700"
              title="Refresh"
            >
              <HiOutlineRefresh className={`w-4 h-4 ${isLoading ? "animate-spin" : ""}`} />
            </button>
          </div>
        </div>

        {/* ── Summary ─────────────────────────────────────────────────────── */}
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
          <Card className="!p-4">
            <p className="text-xs text-custom-700 mb-1">Total Batches</p>
            <p className="text-2xl font-bold text-secondary-100">{isLoading ? "—" : allHobes.length}</p>
          </Card>
          <Card className="!p-4">
            <p className="text-xs text-custom-700 mb-1">Active</p>
            <p className="text-2xl font-bold text-emerald-600">{isLoading ? "—" : allHobes.filter((h) => h.status === "active").length}</p>
          </Card>
          <Card className="!p-4">
            <p className="text-xs text-custom-700 mb-1">Units in Shop</p>
            <p className="text-2xl font-bold text-primary-500">{isLoading ? "—" : totalInShop.toLocaleString()}</p>
          </Card>
          <Card className="!p-4">
            <p className="text-xs text-custom-700 mb-1">Pending Payments</p>
            <p className="text-2xl font-bold text-orange-500">{pendingCount}</p>
          </Card>
        </div>

        {/* ── Search & Filter ──────────────────────────────────────────────── */}
        <div className="flex flex-col sm:flex-row gap-3">
          <div className="flex-1 relative">
            <HiOutlineSearch className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-custom-700" />
            <input
              type="text" value={search}
              onChange={(e) => setSearch(e.target.value)}
              placeholder="Search by name or batch number..."
              className="w-full pl-10 pr-4 py-2 rounded-xl border border-custom-300 bg-style-500 text-secondary-100 placeholder:text-custom-700 focus:outline-none focus:border-primary-400 transition-colors"
            />
          </div>
          <div className="flex items-center gap-2">
            <HiOutlineFilter className="w-4 h-4 text-custom-700" />
            <div className="flex gap-1 bg-custom-100 p-1 rounded-xl">
              {STATUS_FILTER_OPTIONS.map((opt) => (
                <button
                  key={opt.value}
                  onClick={() => setStatusFilter(opt.value)}
                  className={`px-3 py-1.5 rounded-lg text-xs font-semibold transition-colors ${
                    statusFilter === opt.value
                      ? "bg-primary-500 text-white shadow-sm"
                      : "text-custom-700 hover:text-secondary-100"
                  }`}
                >{opt.label}</button>
              ))}
            </div>
          </div>
        </div>

        {/* ── Hobe Grid ───────────────────────────────────────────────────── */}
        {isLoading ? (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
            {Array.from({ length: 6 }).map((_, i) => (
              <Card key={i} className="!p-4 animate-pulse">
                <div className="h-5 w-24 bg-custom-200 rounded-full mb-3" />
                <div className="h-4 w-3/4 bg-custom-200 rounded mb-2" />
                <div className="h-3 w-full bg-custom-200 rounded mb-1" />
                <div className="h-3 w-2/3 bg-custom-200 rounded" />
              </Card>
            ))}
          </div>
        ) : isError ? (
          <Card className="!p-12 text-center">
            <HiOutlineExclamationCircle className="w-10 h-10 text-red-400 mx-auto mb-3" />
            <p className="text-secondary-100 font-semibold">Failed to load hobes</p>
            <button onClick={() => refetch()} className="mt-4 px-4 py-2 rounded-xl bg-primary-500 text-white text-sm font-semibold">Retry</button>
          </Card>
        ) : hobes.length === 0 ? (
          <Card className="!p-12 text-center">
            <HiOutlineCube className="w-10 h-10 text-custom-700 mx-auto mb-3" />
            <p className="text-secondary-100 font-semibold">No hobes found</p>
            <p className="text-sm text-custom-700 mt-1">Try adjusting your search or filter</p>
          </Card>
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
            {hobes.map((h) => {
              const sc = statusConfig[h.status] ?? statusConfig.active;
              const soldPct = h.qty > 0 ? Math.round((h.qtySold / h.qty) * 100) : 0;
              const isAvailable = h.status === "active" && h.qtyRemains > 0;
              return (
                <Card
                  key={h.id}
                  className={`!p-4 transition-all ${isAvailable ? "cursor-pointer hover:shadow-md hover:border-primary-300" : "opacity-70 cursor-not-allowed"}`}
                  onClick={() => isAvailable && setSelectedHobe(h)}
                >
                  <div className="flex items-center justify-between mb-3">
                    <span className="text-xs font-mono font-bold text-primary-500">{h.hobeNo}</span>
                    <span className={`text-xs font-bold px-2.5 py-1 rounded-full ${sc.color}`}>{sc.label}</span>
                  </div>

                  <div className="w-full h-20 rounded-xl bg-custom-100 flex items-center justify-center mb-3">
                    <HiOutlineCube className="w-8 h-8 text-custom-400" />
                  </div>

                  <h3 className="font-bold text-secondary-100 text-sm leading-snug mb-3">{h.nameOfHobe}</h3>

                  <div className="space-y-2 mb-3">
                    <div className="flex justify-between text-xs">
                      <span className="text-custom-700">Price</span>
                      <span className="font-bold text-secondary-100">{h.pricePerItem.toLocaleString()} RWF</span>
                    </div>
                    <div className="flex justify-between text-xs">
                      <span className="text-custom-700">Available</span>
                      <span className={`font-bold ${h.qtyRemains === 0 ? "text-red-500" : h.qtyRemains < h.qty * 0.2 ? "text-yellow-600" : "text-emerald-600"}`}>
                        {h.qtyRemains.toLocaleString()} / {h.qty.toLocaleString()}
                      </span>
                    </div>
                  </div>

                  <div className="w-full h-1.5 bg-custom-200 rounded-full mb-3">
                    <div className="h-1.5 bg-primary-500 rounded-full" style={{ width: `${soldPct}%` }} />
                  </div>
                  <p className="text-xs text-custom-700">{soldPct}% sold ({h.qtySold.toLocaleString()} units)</p>

                  {isAvailable && (
                    <button
                      onClick={(e) => { e.stopPropagation(); setSelectedHobe(h); }}
                      className="mt-3 w-full flex items-center justify-center gap-2 py-2 rounded-xl bg-primary-500 text-white text-xs font-semibold hover:bg-primary-600 transition-colors"
                    >
                      <HiOutlineShoppingCart className="w-4 h-4" />
                      Sell
                    </button>
                  )}
                </Card>
              );
            })}
          </div>
        )}
      </div>

      {showAddHobe && (
        <AddHobeModal
          onClose={() => setShowAddHobe(false)}
          onSuccess={() => { setShowAddHobe(false); refetch(); }}
        />
      )}

      {selectedHobe && (
        <SellModal
          hobe={selectedHobe}
          onClose={() => setSelectedHobe(null)}
          onSold={() => { refetch(); }}
        />
      )}

      {showPendingBalances && (
        <PendingBalancesModal onClose={() => setShowPendingBalances(false)} />
      )}
    </DashboardLayout>
  );
}
