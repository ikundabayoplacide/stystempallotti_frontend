import { useState } from "react";
import {
  HiOutlineSearch,
  HiOutlineCube,
  HiOutlineExclamationCircle,
  HiOutlineCheckCircle,
  HiOutlineFilter,
  HiOutlineX,
  HiOutlineRefresh,
  HiOutlineShoppingCart,
  HiOutlinePlus,
  HiOutlineTrash,
  HiOutlineClipboardList,
  HiOutlineCash,
  HiOutlinePencil,
} from "react-icons/hi";
import { toast } from "react-toastify";
import { DashboardLayout } from "../../components";
import { useGetUnreadCountQuery } from "../../store/services/notificationsService";
import { Card } from "../../components/ui";
import {
  useGetCategoriesQuery,
  useGetProductsQuery,
  useCreateProductMutation,
  useCreateCategoryMutation,
  useUpdateProductMutation,
  useRecordSaleMutation,
  useUpdateSaleMutation,
  useUpdateStockMutation,
  useGetSalesQuery,
  type BoutiqueProduct,
  type BoutiqueSale,
  type StockStatus,
  type PaymentMethod,
} from "../../store/services/boutiqueService";

import {
  useCreateStockSortieMutation,
  useGetMySortiesQuery,
  useGetStockItemsQuery,
  type StockSortie,
  type StockItem,
} from "../../store/services/stockService";
import { useGetCustomersQuery } from "../../store/services/customersService";

// ─── Status config ────────────────────────────────────────────────────────────

const statusConfig: Record<StockStatus, { label: string; color: string; icon: React.ReactNode }> = {
  "in-stock":     { label: "In Stock",     color: "bg-emerald-100 text-emerald-700", icon: <HiOutlineCheckCircle className="w-3.5 h-3.5" /> },
  "low-stock":    { label: "Low Stock",    color: "bg-yellow-100 text-yellow-700",   icon: <HiOutlineExclamationCircle className="w-3.5 h-3.5" /> },
  "out-of-stock": { label: "Out of Stock", color: "bg-red-100 text-red-600",         icon: <HiOutlineExclamationCircle className="w-3.5 h-3.5" /> },
};

// Cycle through a set of colors by index so each category gets a distinct badge
const CATEGORY_COLORS = [
  "bg-blue-100 text-blue-700",
  "bg-purple-100 text-purple-700",
  "bg-orange-100 text-orange-700",
  "bg-teal-100 text-teal-700",
  "bg-indigo-100 text-indigo-700",
  "bg-pink-100 text-pink-700",
  "bg-green-100 text-green-700",
  "bg-rose-100 text-rose-700",
];

// ─── Edit Product Modal ──────────────────────────────────────────────────────

function EditProductModal({ product, categories: _categories, onClose, onSuccess }: {
  product: BoutiqueProduct;
  categories: { id: string; name: string }[];
  onClose: () => void;
  onSuccess: () => void;
}) {
  const [form, setForm] = useState({
    name:        product.name,
    description: product.description ?? "",
    unit:        product.unit,
    price:       String(product.price),
    minStock:    String(product.minStock),
    isActive:    product.isActive,
  });
  const [updateProduct, { isLoading }] = useUpdateProductMutation();

  const set = (key: string) => (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) =>
    setForm((prev) => ({ ...prev, [key]: e.target.value }));

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!form.name.trim() || !form.unit.trim() || !form.price || !form.minStock) {
      toast.error("Please fill in all required fields"); return;
    }
    try {
      await updateProduct({
        id: product.id,
        name:        form.name.trim(),
        description: form.description.trim(),
        unit:        form.unit.trim(),
        price:       Number(form.price),
        minStock:    Number(form.minStock),
      }).unwrap();
      toast.success("Product updated");
      onSuccess();
    } catch (err: any) {
      toast.error(err?.data?.message ?? "Failed to update product");
    }
  };

  const inputClass = "w-full px-3 py-2 rounded-xl border border-custom-300 bg-style-500 text-secondary-100 text-sm focus:outline-none focus:border-primary-400 transition-colors";

  return (
    <div className="fixed inset-0 bg-secondary-100/50 z-50 flex items-start justify-center p-4 overflow-y-auto">
      <Card className="!p-6 max-w-lg w-full my-8">
        <div className="flex items-center justify-between mb-5">
          <div>
            <h3 className="text-xl font-bold text-secondary-100">Edit Product</h3>
            <p className="text-xs font-mono text-custom-700 mt-0.5">SKU: {product.sku}</p>
          </div>
          <button onClick={onClose} className="text-custom-700 hover:text-secondary-100"><HiOutlineX className="w-6 h-6" /></button>
        </div>
        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="grid grid-cols-2 gap-3">
            <div className="col-span-2">
              <label className="block text-sm font-semibold text-secondary-100 mb-1">Name *</label>
              <input value={form.name} onChange={set("name")} className={inputClass} />
            </div>
            <div className="col-span-2">
              <label className="block text-sm font-semibold text-secondary-100 mb-1">Description</label>
              <textarea value={form.description} onChange={set("description")} rows={2}
                className="w-full px-3 py-2 rounded-xl border border-custom-300 bg-style-500 text-secondary-100 text-sm focus:outline-none focus:border-primary-400 transition-colors resize-none" />
            </div>
            <div>
              <label className="block text-sm font-semibold text-secondary-100 mb-1">Unit *</label>
              <input value={form.unit} onChange={set("unit")} className={inputClass} />
            </div>
            <div>
              <label className="block text-sm font-semibold text-secondary-100 mb-1">Price (RWF) *</label>
              <input type="number" min={0} value={form.price} onChange={set("price")} className={inputClass} />
            </div>
            <div>
              <label className="block text-sm font-semibold text-secondary-100 mb-1">Min Stock *</label>
              <input type="number" min={0} value={form.minStock} onChange={set("minStock")} className={inputClass} />
            </div>
            <div className="flex items-center gap-2 pt-5">
              <input type="checkbox" id="isActive" checked={form.isActive}
                onChange={(e) => setForm((p) => ({ ...p, isActive: e.target.checked }))}
                className="w-4 h-4 rounded accent-primary-500" />
              <label htmlFor="isActive" className="text-sm font-semibold text-secondary-100">Active</label>
            </div>
          </div>
          <div className="flex gap-3 justify-end pt-2 border-t border-custom-300">
            <button type="button" onClick={onClose}
              className="px-4 py-2 rounded-xl border border-custom-300 text-sm font-semibold text-secondary-100 hover:bg-custom-100 transition-colors">Cancel</button>
            <button type="submit" disabled={isLoading}
              className="px-4 py-2 rounded-xl bg-primary-500 text-white text-sm font-semibold hover:bg-primary-600 transition-colors disabled:opacity-40">
              {isLoading ? "Saving..." : "Save Changes"}
            </button>
          </div>
        </form>
      </Card>
    </div>
  );
}

// ─── Restock Modal ───────────────────────────────────────────────────────────

function RestockModal({ product, onClose, onSuccess }: {
  product: BoutiqueProduct;
  onClose: () => void;
  onSuccess: () => void;
}) {
  const [qty, setQty]   = useState("");
  const [note, setNote] = useState("");
  const [updateStock, { isLoading }] = useUpdateStockMutation();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    const n = Number(qty);
    if (!n || n <= 0) { toast.error("Enter a valid quantity"); return; }
    try {
      await updateStock({ id: product.id, change: n, reason: note.trim() || "Manual restock" }).unwrap();
      toast.success(`Added ${n} units to ${product.name}`);
      onSuccess();
    } catch (err: any) {
      toast.error(err?.data?.message ?? "Failed to update stock");
    }
  };

  const inputClass = "w-full px-3 py-2 rounded-xl border border-custom-300 bg-style-500 text-secondary-100 text-sm focus:outline-none focus:border-primary-400 transition-colors";

  return (
    <div className="fixed inset-0 bg-secondary-100/50 z-50 flex items-center justify-center p-4">
      <div className="bg-style-500 rounded-2xl shadow-xl max-w-sm w-full p-6" onClick={(e) => e.stopPropagation()}>
        <div className="flex items-center justify-between mb-4">
          <div>
            <h3 className="text-base font-bold text-secondary-100">Add Stock</h3>
            <p className="text-xs text-custom-700 mt-0.5 truncate max-w-[220px]">{product.name}</p>
          </div>
          <button onClick={onClose} className="text-custom-700 hover:text-secondary-100"><HiOutlineX className="w-5 h-5" /></button>
        </div>
        <form onSubmit={handleSubmit} className="space-y-3">
          <div>
            <label className="block text-xs font-semibold text-secondary-100 mb-1">Quantity to Add *</label>
            <input autoFocus type="number" min={1} value={qty} onChange={(e) => setQty(e.target.value)} placeholder="e.g. 10" className={inputClass} />
            <p className="text-xs text-custom-700 mt-1">Current stock: <span className="font-bold text-secondary-100">{product.stock} {product.unit}</span></p>
          </div>
          <div>
            <label className="block text-xs font-semibold text-secondary-100 mb-1">Note <span className="font-normal text-custom-700">(optional)</span></label>
            <input value={note} onChange={(e) => setNote(e.target.value)} placeholder="e.g. New delivery" className={inputClass} />
          </div>
          <div className="flex gap-3 justify-end pt-2 border-t border-custom-300">
            <button type="button" onClick={onClose} className="px-4 py-2 rounded-xl border border-custom-300 text-sm font-semibold text-secondary-100 hover:bg-custom-100 transition-colors">Cancel</button>
            <button type="submit" disabled={isLoading}
              className="px-4 py-2 rounded-xl bg-emerald-500 text-white text-sm font-semibold hover:bg-emerald-600 disabled:opacity-40 transition-colors">
              {isLoading ? "Adding..." : "Add Stock"}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}

// ─── Add Product Modal ───────────────────────────────────────────────────────

function AddProductModal({ categories, onClose, onSuccess }: {
  categories: { id: string; name: string }[];
  onClose: () => void;
  onSuccess: () => void;
}) {
  const [form, setForm] = useState({
    name: "", description: "", categoryId: "", unit: "",
    price: "", stock: "", minStock: "",
  });
  const [newCategoryName, setNewCategoryName] = useState("");
  const [createProduct, { isLoading }] = useCreateProductMutation();
  const [createCategory, { isLoading: creatingCat }] = useCreateCategoryMutation();

  const isAddNew = form.categoryId === "__new__";

  const set = (key: string) => (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement>) =>
    setForm((prev) => ({ ...prev, [key]: e.target.value }));

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    let categoryId = form.categoryId;
    if (isAddNew) {
      if (!newCategoryName.trim()) { toast.error("Please enter a category name"); return; }
      try {
        const cat = await createCategory({ name: newCategoryName.trim(), skuPrefix: newCategoryName.trim().slice(0, 3).toUpperCase() }).unwrap();
        categoryId = cat.id;
      } catch (err: any) {
        toast.error(err?.data?.message ?? "Failed to create category"); return;
      }
    }
    if (!form.name || !categoryId || !form.unit || !form.price || !form.stock || !form.minStock) {
      toast.error("Please fill in all required fields"); return;
    }
    try {
      await createProduct({
        name: form.name.trim(),
        description: form.description.trim() || "",
        categoryId,
        unit: form.unit.trim(),
        price: Number(form.price),
        stock: Number(form.stock),
        minStock: Number(form.minStock),
      }).unwrap();
      toast.success("Product added successfully");
      onSuccess();
    } catch (err: any) {
      toast.error(err?.data?.message ?? "Failed to add product");
    }
  };

  const inputClass = "w-full px-3 py-2 rounded-xl border border-custom-300 bg-style-500 text-secondary-100 text-sm focus:outline-none focus:border-primary-400 transition-colors";

  return (
    <div className="fixed inset-0 bg-secondary-100/50 z-50 flex items-start justify-center p-4 overflow-y-auto">
      <Card className="!p-6 max-w-lg w-full my-8">
        <div className="flex items-center justify-between mb-5">
          <div>
            <h3 className="text-xl font-bold text-secondary-100">Add Product</h3>
            <p className="text-sm text-custom-700 mt-0.5">Add a new product to the boutique</p>
          </div>
          <button onClick={onClose} className="text-custom-700 hover:text-secondary-100"><HiOutlineX className="w-6 h-6" /></button>
        </div>

        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="grid grid-cols-2 gap-3">
            <div className="col-span-2">
              <label className="block text-sm font-semibold text-secondary-100 mb-1">Name *</label>
              <input value={form.name} onChange={set("name")} placeholder="e.g. A4 Paper Ream" className={inputClass} />
            </div>
            <div className="col-span-2">
              <label className="block text-sm font-semibold text-secondary-100 mb-1">Description</label>
              <textarea value={form.description} onChange={set("description")} rows={2} placeholder="Optional description..."
                className="w-full px-3 py-2 rounded-xl border border-custom-300 bg-style-500 text-secondary-100 text-sm focus:outline-none focus:border-primary-400 transition-colors resize-none" />
            </div>
            <div>
              <label className="block text-sm font-semibold text-secondary-100 mb-1">Category *</label>
              <select value={form.categoryId} onChange={set("categoryId")} className={inputClass}>
                <option value="">Select category...</option>
                {categories.map((c) => <option key={c.id} value={c.id}>{c.name}</option>)}
                <option value="__new__">+ Add new category</option>
              </select>
              {isAddNew && (
                <input
                  autoFocus
                  value={newCategoryName}
                  onChange={(e) => setNewCategoryName(e.target.value)}
                  placeholder="New category name..."
                  className={`${inputClass} mt-2`}
                />
              )}
            </div>
            <div>
              <label className="block text-sm font-semibold text-secondary-100 mb-1">Unit *</label>
              <input value={form.unit} onChange={set("unit")} placeholder="e.g. per item" className={inputClass} />
            </div>
            <div>
              <label className="block text-sm font-semibold text-secondary-100 mb-1">Price (RWF) *</label>
              <input type="number" min={0} value={form.price} onChange={set("price")} placeholder="0" className={inputClass} />
            </div>
            <div>
              <label className="block text-sm font-semibold text-secondary-100 mb-1">Initial Stock *</label>
              <input type="number" min={0} value={form.stock} onChange={set("stock")} placeholder="0" className={inputClass} />
            </div>
            <div>
              <label className="block text-sm font-semibold text-secondary-100 mb-1">Min Stock *</label>
              <input type="number" min={0} value={form.minStock} onChange={set("minStock")} placeholder="0" className={inputClass} />
            </div>
          </div>

          <div className="flex gap-3 justify-end pt-2 border-t border-custom-300">
            <button type="button" onClick={onClose}
              className="px-4 py-2 rounded-xl border border-custom-300 text-sm font-semibold text-secondary-100 hover:bg-custom-100 transition-colors"
            >Cancel</button>
            <button type="submit" disabled={isLoading || creatingCat}
              className="px-4 py-2 rounded-xl bg-primary-500 text-white text-sm font-semibold hover:bg-primary-600 transition-colors disabled:opacity-40"
            >{isLoading || creatingCat ? "Saving..." : "Add Product"}</button>
          </div>
        </form>
      </Card>
    </div>
  );
}

// ─── Product Detail / Sell Modal ─────────────────────────────────────────────

const PAYMENT_METHODS: { value: PaymentMethod; label: string }[] = [
  { value: "cash",     label: "Cash" },
  { value: "mobile",   label: "Mobile Money" },
  { value: "card",     label: "Card" },
  { value: "bank",     label: "Bank Transfer" },
  { value: "oncredit", label: "On Credit" },
];

function ProductDetailModal({ product, categoryColor, onClose, onSold }: {
  product: BoutiqueProduct;
  categoryColor: string;
  onClose: () => void;
  onSold: () => void;
}) {
  const [qty, setQty]                     = useState("1");
  const [amountPaid, setAmountPaid]       = useState("");
  const [paymentMethod, setPaymentMethod] = useState<PaymentMethod>("cash");
  const [customerId, setCustomerId]       = useState("");
  const [note, setNote]                   = useState("");
  const [receipt, setReceipt]             = useState<BoutiqueSale | null>(null);
  const [recordSale, { isLoading }]       = useRecordSaleMutation();
  const { data: customersData }           = useGetCustomersQuery({ limit: 200, type: "BOUTIQUE" });
  const customers                         = customersData?.customers ?? [];

  const totalExpected = (parseInt(qty) || 1) * product.price;
  const isOutOfStock  = product.status === "out-of-stock";

  const handleSell = async (e: React.FormEvent) => {
    e.preventDefault();
    const q    = parseInt(qty);
    const paid = paymentMethod === "oncredit" ? 0 : parseFloat(amountPaid);
    if (!q || q <= 0)                              { toast.error("Enter a valid quantity"); return; }
    if (q > product.stock)                         { toast.error(`Only ${product.stock} units available`); return; }
    if (paymentMethod !== "oncredit" && (!paid || paid <= 0)) { toast.error("Enter amount paid"); return; }
    if (!customerId)                               { toast.error("Please select a customer"); return; }
    try {
      const result = await recordSale({
        id: product.id,
        quantity: q,
        unitPrice: product.price,
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

  // Receipt screen
  if (receipt) {
    const sConf: Record<string, { label: string; color: string }> = {
      paid:     { label: "Paid",      color: "bg-emerald-100 text-emerald-700" },
      partial:  { label: "Partial",   color: "bg-orange-100 text-orange-700" },
      overpaid: { label: "Overpaid",  color: "bg-blue-100 text-blue-700" },
      oncredit: { label: "On Credit", color: "bg-purple-100 text-purple-700" },
    };
    const sc = sConf[receipt.paymentStatus] ?? sConf.paid;
    return (
      <div className="fixed inset-0 bg-secondary-100/50 z-50 flex items-center justify-center p-4">
        <Card className="!p-6 max-w-sm w-full text-center">
          <h3 className="text-xl font-bold text-secondary-100 mb-2">Sale Recorded</h3>
          <span className={`text-xs font-bold px-3 py-1 rounded-full ${sc.color}`}>{sc.label}</span>
          <div className="mt-4 rounded-xl bg-custom-100 border border-custom-300 p-4 space-y-2.5 text-left">
            <div className="flex justify-between text-sm">
              <span className="text-custom-700">Product</span>
              <span className="font-semibold text-secondary-100">{product.name}</span>
            </div>
            <div className="flex justify-between text-sm">
              <span className="text-custom-700">Quantity</span>
              <span className="font-semibold text-secondary-100">{receipt.quantity}</span>
            </div>
            <div className="flex justify-between text-sm">
              <span className="text-custom-700">Total Price</span>
              <span className="font-semibold text-secondary-100">{Number(receipt.totalPrice).toLocaleString()} RWF</span>
            </div>
            <div className="flex justify-between text-sm">
              <span className="text-custom-700">Amount Paid</span>
              <span className="font-bold text-emerald-600">{Number(receipt.amountPaid).toLocaleString()} RWF</span>
            </div>
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
          {receipt.paymentStatus === "oncredit" && (
            <div className="mt-3 px-4 py-3 rounded-xl bg-purple-50 border border-purple-200 text-purple-700 text-sm font-semibold">
              Full amount of {Number(receipt.totalPrice).toLocaleString()} RWF on credit
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
      <Card className="!p-6 max-w-2xl w-full my-8">
        {/* Header */}
        <div className="flex items-center justify-between mb-4">
          <div>
            <h3 className="text-lg font-bold text-secondary-100">{product.name}</h3>
            <p className="text-xs font-mono text-custom-700 mt-0.5">SKU: {product.sku}</p>
          </div>
          <button onClick={onClose} className="text-custom-700 hover:text-secondary-100">
            <HiOutlineX className="w-5 h-5" />
          </button>
        </div>

        {/* Badges */}
        <div className="flex gap-2 mb-4">
          <span className={`text-xs font-semibold px-2.5 py-1 rounded-full ${categoryColor}`}>
            {product.category?.name ?? "—"}
          </span>
          <span className={`inline-flex items-center gap-1 text-xs font-bold px-2.5 py-1 rounded-full ${statusConfig[product.status].color}`}>
            {statusConfig[product.status].icon} {statusConfig[product.status].label}
          </span>
        </div>

        {/* Stock info */}
        <div className="rounded-xl bg-custom-100 border border-custom-300 p-4 space-y-2 mb-4">
          <div className="flex justify-between text-sm">
            <span className="text-custom-700">Price</span>
            <span className="font-bold text-secondary-100">{product.price.toLocaleString()} RWF <span className="font-normal text-xs text-custom-700">/ {product.unit}</span></span>
          </div>
          <div className="flex justify-between text-sm">
            <span className="text-custom-700">Current Stock</span>
            <span className={`font-bold ${ isOutOfStock ? "text-red-600" : product.status === "low-stock" ? "text-yellow-600" : "text-emerald-600" }`}>
              {product.stock} units
            </span>
          </div>
        </div>

        {isOutOfStock ? (
          <div className="flex items-start gap-2 px-4 py-3 rounded-xl bg-red-50 border border-red-200 text-red-700 text-sm mb-4">
            <HiOutlineExclamationCircle className="w-5 h-5 flex-shrink-0 mt-0.5" />
            <span>This product is currently out of stock.</span>
          </div>
        ) : (
          <form onSubmit={handleSell} className="space-y-4">
            {product.status === "low-stock" && (
              <div className="flex items-start gap-2 px-4 py-3 rounded-xl bg-yellow-50 border border-yellow-200 text-yellow-700 text-sm">
                <HiOutlineExclamationCircle className="w-5 h-5 flex-shrink-0 mt-0.5" />
                <span>Stock is running low.</span>
              </div>
            )}

            <div className="grid grid-cols-2 gap-3">
              <div>
                <label className="block text-xs font-semibold text-secondary-100 mb-1">Quantity *</label>
                <input type="number" min={1} max={product.stock} value={qty}
                  onChange={(e) => { setQty(e.target.value); if (!amountPaid) setAmountPaid(String((parseInt(e.target.value) || 1) * product.price)); }}
                  className={inputCls} />
              </div>
              <div>
                <label className="block text-xs font-semibold text-secondary-100 mb-1">Amount Paid (RWF) *</label>
                <input type="number" min={0} value={paymentMethod === "oncredit" ? "0" : amountPaid}
                  onChange={(e) => setAmountPaid(e.target.value)}
                  disabled={paymentMethod === "oncredit"}
                  placeholder={totalExpected.toLocaleString()} className={`${inputCls} disabled:opacity-50 disabled:cursor-not-allowed`} />
              </div>
            </div>

            {/* Expected vs paid */}
            <div className="flex justify-between text-xs px-1">
              <span className="text-custom-700">Expected: <span className="font-bold text-secondary-100">{totalExpected.toLocaleString()} RWF</span></span>
              {amountPaid && parseFloat(amountPaid) < totalExpected && (
                <span className="text-orange-600 font-bold">Underpaid by {(totalExpected - parseFloat(amountPaid)).toLocaleString()} RWF</span>
              )}
              {amountPaid && parseFloat(amountPaid) > totalExpected && (
                <span className="text-blue-600 font-bold">Change to give: {(parseFloat(amountPaid) - totalExpected).toLocaleString()} RWF</span>
              )}
            </div>

            {/* Payment method */}
            <div>
              <label className="block text-xs font-semibold text-secondary-100 mb-2">Payment Method *</label>
              <div className="grid grid-cols-2 gap-2">
                {PAYMENT_METHODS.map((m) => (
                  <button key={m.value} type="button" onClick={() => setPaymentMethod(m.value)}
                    className={`py-2 px-3 rounded-xl border-2 text-xs font-semibold transition-all ${
                      paymentMethod === m.value
                        ? "border-primary-500 bg-primary-50 text-primary-700"
                        : "border-custom-300 text-custom-700 hover:border-primary-300"
                    }`}
                  >{m.label}</button>
                ))}
              </div>
            </div>

            {/* Customer */}
            <div>
              <label className="block text-xs font-semibold text-secondary-100 mb-1">Customer *</label>
              <select value={customerId} onChange={(e) => setCustomerId(e.target.value)} className="w-full px-3 py-3 rounded-xl border border-custom-300 bg-style-500 text-secondary-100 text-sm focus:outline-none focus:border-primary-400 transition-colors">
                <option value="">Select customer...</option>
                {customers.map((c) => (
                  <option key={c.id} value={c.id}>{c.name}{c.phone ? ` — ${c.phone}` : ""}</option>
                ))}
              </select>
            </div>

            {/* Note */}
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

// ─── Pending Balances Modal ──────────────────────────────────────────────────

function PendingBalancesModal({ onClose }: { onClose: () => void }) {
  const [activeTab, setActiveTab] = useState<"partial" | "overpaid">("partial");
  const [payingId, setPayingId]   = useState<string | null>(null);
  const [payAmount, setPayAmount] = useState("");
  const [search, setSearch]       = useState("");

  const { data: partialData, isLoading: pLoading, refetch: refetchPartial } =
    useGetSalesQuery({ paymentStatus: "partial", limit: 100 });
  const { data: oncreditData, isLoading: ocLoading, refetch: refetchOncredit } =
    useGetSalesQuery({ paymentStatus: "oncredit", limit: 100 });
  const { data: overpaidData, isLoading: oLoading, refetch: refetchOverpaid } =
    useGetSalesQuery({ paymentStatus: "overpaid", limit: 100 });
  const [updateSale, { isLoading: updating }] = useUpdateSaleMutation();

  const allPartials = [...(partialData?.sales ?? []), ...(oncreditData?.sales ?? [])]
    .sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime());
  const allOverpaid = (overpaidData?.sales ?? [])
    .sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime());

  const q = search.trim().toLowerCase();
  const partials = q
    ? allPartials.filter((s) =>
        s.product.name.toLowerCase().includes(q) ||
        s.product.sku.toLowerCase().includes(q) ||
        s.customer?.name?.toLowerCase().includes(q) ||
        s.customer?.phone?.toLowerCase().includes(q)
      )
    : allPartials;
  const overpaid = q
    ? allOverpaid.filter((s) =>
        s.product.name.toLowerCase().includes(q) ||
        s.product.sku.toLowerCase().includes(q) ||
        s.customer?.name?.toLowerCase().includes(q) ||
        s.customer?.phone?.toLowerCase().includes(q)
      )
    : allOverpaid;
  const isLoading = pLoading || oLoading || ocLoading;

  const handlePayBalance = async (sale: BoutiqueSale) => {
    const amt = parseFloat(payAmount);
    if (!amt || amt <= 0) { toast.error("Enter a valid amount"); return; }
    const newTotal = Number(sale.amountPaid) + amt;
    const change   = newTotal - Number(sale.totalPrice);
    try {
      await updateSale({ id: sale.id, amountPaid: newTotal }).unwrap();
      if (change > 0) {
        toast.success(`Payment recorded — give back ${change.toLocaleString()} RWF change`, { autoClose: 6000 });
      } else {
        toast.success("Payment updated successfully");
      }
      setPayingId(null);
      setPayAmount("");
      refetchPartial();
      refetchOncredit();
      refetchOverpaid();
    } catch (err: any) {
      toast.error(err?.data?.message ?? "Failed to update payment");
    }
  };

  const handleConfirmChange = async (sale: BoutiqueSale) => {
    try {
      await updateSale({ id: sale.id, amountPaid: Number(sale.totalPrice) }).unwrap();
      toast.success("Change confirmed — sale marked as paid");
      refetchOverpaid();
    } catch (err: any) {
      toast.error(err?.data?.message ?? "Failed to confirm");
    }
  };

  const inputCls = "w-full px-3 py-2 rounded-xl border border-custom-300 bg-style-500 text-secondary-100 text-sm focus:outline-none focus:border-primary-400 transition-colors";

  return (
    <div className="fixed inset-0 bg-secondary-100/50 z-50 flex items-start justify-center p-4 overflow-y-auto">
      <Card className="!p-6 max-w-2xl w-full my-8">
        <div className="flex items-center justify-between mb-5">
          <div>
            <h3 className="text-xl font-bold text-secondary-100">Pending Balances</h3>
            <p className="text-sm text-custom-700 mt-0.5">Collect remaining dues or confirm change given</p>
          </div>
          <button onClick={onClose} className="text-custom-700 hover:text-secondary-100">
            <HiOutlineX className="w-6 h-6" />
          </button>
        </div>

        {/* Search */}
        <div className="relative mb-4">
          <HiOutlineSearch className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-custom-700" />
          <input
            type="text"
            placeholder="Search by product, SKU, or customer..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="w-full pl-9 pr-4 py-2 rounded-xl border border-custom-300 bg-style-500 text-secondary-100 text-sm placeholder:text-custom-700 focus:outline-none focus:border-primary-400 focus:ring-2 focus:ring-primary-200 transition-colors"
          />
        </div>

        {/* Tabs */}
        <div className="flex gap-2 mb-5">
          <button onClick={() => setActiveTab("partial")}
            className={`flex items-center gap-2 px-4 py-2 rounded-xl text-sm font-semibold transition-colors ${
              activeTab === "partial"
                ? "bg-orange-500 text-white"
                : "bg-custom-100 text-custom-700 hover:bg-custom-200"
            }`}
          >
            Balance Due
            {partials.length > 0 && (
              <span className="w-5 h-5 rounded-full bg-white/30 text-xs flex items-center justify-center font-bold">
                {partials.length}
              </span>
            )}
          </button>
          <button onClick={() => setActiveTab("overpaid")}
            className={`flex items-center gap-2 px-4 py-2 rounded-xl text-sm font-semibold transition-colors ${
              activeTab === "overpaid"
                ? "bg-blue-500 text-white"
                : "bg-custom-100 text-custom-700 hover:bg-custom-200"
            }`}
          >
            Change to Give
            {overpaid.length > 0 && (
              <span className="w-5 h-5 rounded-full bg-white/30 text-xs flex items-center justify-center font-bold">
                {overpaid.length}
              </span>
            )}
          </button>
        </div>

        {isLoading ? (
          <div className="py-12 text-center text-custom-700 text-sm">Loading...</div>
        ) : activeTab === "partial" ? (
          partials.length === 0 ? (
            <div className="py-12 text-center">
              <HiOutlineCheckCircle className="w-10 h-10 text-emerald-500 mx-auto mb-3" />
              <p className="text-sm text-custom-700">{q ? "No results found" : "No pending balances"}</p>
            </div>
          ) : (
            <div className="space-y-3 max-h-[420px] overflow-y-auto pr-1">
              {partials.map((sale) => (
                <div key={sale.id} className="rounded-xl border border-orange-200 bg-orange-50 p-4">
                  <div className="flex items-start justify-between gap-3">
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center gap-2 flex-wrap">
                        <p className="text-sm font-bold text-secondary-100">{sale.product.name}</p>
                        <span className="text-xs font-mono text-custom-700">{sale.product.sku}</span>
                      </div>
                      {sale.customer && (
                        <p className="text-xs text-custom-700 mt-0.5">{sale.customer.name} {sale.customer.phone && `· ${sale.customer.phone}`}</p>
                      )}
                      <div className="flex gap-4 mt-2 text-xs">
                        <span className="text-custom-700">Total: <span className="font-bold text-secondary-100">{Number(sale.totalPrice).toLocaleString()} RWF</span></span>
                        <span className="text-custom-700">Paid: <span className="font-bold text-emerald-600">{Number(sale.amountPaid).toLocaleString()} RWF</span></span>
                        <span className="text-custom-700">Still owes: <span className="font-bold text-red-600">{Number(sale.balanceDue).toLocaleString()} RWF</span></span>
                      </div>
                      <p className="text-xs text-custom-400 mt-1">{new Date(sale.createdAt).toLocaleDateString("en-RW", { day: "2-digit", month: "short", year: "numeric" })}</p>
                    </div>
                    <button
                      onClick={() => { setPayingId(payingId === sale.id ? null : sale.id); setPayAmount(String(Number(sale.balanceDue))); }}
                      className="px-3 py-1.5 rounded-lg bg-orange-500 text-white text-xs font-semibold hover:bg-orange-600 transition-colors flex-shrink-0"
                    >
                      Collect
                    </button>
                  </div>

                  {payingId === sale.id && (() => {
                    const received = parseFloat(payAmount) || 0;
                    const stillOwes = Number(sale.balanceDue) - received;
                    const changeBack = received - Number(sale.balanceDue);
                    return (
                      <div className="mt-3 pt-3 border-t border-orange-200 space-y-2">
                        <div className="flex gap-2 items-end">
                          <div className="flex-1">
                            <label className="block text-xs font-semibold text-secondary-100 mb-1">
                              Amount Received (RWF) — owes {Number(sale.balanceDue).toLocaleString()} RWF
                            </label>
                            <input
                              autoFocus
                              type="number" min={1}
                              value={payAmount} onChange={(e) => setPayAmount(e.target.value)}
                              className={inputCls}
                            />
                          </div>
                          <button
                            onClick={() => handlePayBalance(sale)}
                            disabled={updating || !payAmount}
                            className="px-4 py-2 rounded-xl bg-emerald-500 text-white text-sm font-semibold hover:bg-emerald-600 transition-colors disabled:opacity-40"
                          >
                            {updating ? "Saving..." : "Confirm"}
                          </button>
                          <button onClick={() => { setPayingId(null); setPayAmount(""); }}
                            className="px-3 py-2 rounded-xl border border-custom-300 text-sm text-custom-700 hover:bg-custom-100 transition-colors"
                          >Cancel</button>
                        </div>
                        {received > 0 && stillOwes > 0 && (
                          <div className="flex items-center justify-between px-3 py-2 rounded-lg bg-red-50 border border-red-200">
                            <span className="text-xs font-semibold text-red-700">Still owes after this payment</span>
                            <span className="text-sm font-bold text-red-600">{stillOwes.toLocaleString()} RWF</span>
                          </div>
                        )}
                        {received > 0 && changeBack > 0 && (
                          <div className="flex items-center justify-between px-3 py-2.5 rounded-lg bg-blue-50 border-2 border-blue-400">
                            <span className="text-sm font-bold text-blue-700">💵 Change to give back</span>
                            <span className="text-lg font-extrabold text-blue-600">{changeBack.toLocaleString()} RWF</span>
                          </div>
                        )}
                        {received > 0 && stillOwes === 0 && changeBack === 0 && (
                          <div className="flex items-center gap-2 px-3 py-2 rounded-lg bg-emerald-50 border border-emerald-200">
                            <HiOutlineCheckCircle className="w-4 h-4 text-emerald-600" />
                            <span className="text-xs font-semibold text-emerald-700">Exact amount — fully paid</span>
                          </div>
                        )}
                      </div>
                    );
                  })()}
                </div>
              ))}
            </div>
          )
        ) : (
          overpaid.length === 0 ? (
            <div className="py-12 text-center">
              <HiOutlineCheckCircle className="w-10 h-10 text-emerald-500 mx-auto mb-3" />
              <p className="text-sm text-custom-700">{q ? "No results found" : "No change to give back"}</p>
            </div>
          ) : (
            <div className="space-y-3 max-h-[420px] overflow-y-auto pr-1">
              {overpaid.map((sale) => (
                <div key={sale.id} className="rounded-xl border border-blue-200 bg-blue-50 p-4">
                  <div className="flex items-start justify-between gap-3">
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center gap-2 flex-wrap">
                        <p className="text-sm font-bold text-secondary-100">{sale.product.name}</p>
                        <span className="text-xs font-mono text-custom-700">{sale.product.sku}</span>
                      </div>
                      {sale.customer && (
                        <p className="text-xs text-custom-700 mt-0.5">{sale.customer.name} {sale.customer.phone && `· ${sale.customer.phone}`}</p>
                      )}
                      <div className="flex gap-4 mt-2 text-xs">
                        <span className="text-custom-700">Total: <span className="font-bold text-secondary-100">{Number(sale.totalPrice).toLocaleString()} RWF</span></span>
                        <span className="text-custom-700">Paid: <span className="font-bold text-emerald-600">{Number(sale.amountPaid).toLocaleString()} RWF</span></span>
                        <span className="font-bold text-blue-600">Return: {Number(sale.changeGiven).toLocaleString()} RWF</span>
                      </div>
                      <p className="text-xs text-custom-400 mt-1">{new Date(sale.createdAt).toLocaleDateString("en-RW", { day: "2-digit", month: "short", year: "numeric" })}</p>
                    </div>
                    <button
                      onClick={() => handleConfirmChange(sale)}
                      disabled={updating}
                      className="px-3 py-1.5 rounded-lg bg-blue-500 text-white text-xs font-semibold hover:bg-blue-600 transition-colors flex-shrink-0 disabled:opacity-40"
                    >
                      Mark Returned
                    </button>
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

// ─── Stock Request Modal ─────────────────────────────────────────────────────

interface RequestItem { stockItem: StockItem; quantity: number; }

function StockRequestModal({ onClose, onSuccess }: {
  onClose: () => void;
  onSuccess: () => void;
}) {
  const [items, setItems]             = useState<RequestItem[]>([]);
  const [selectedId, setSelectedId]   = useState("");
  const [qty, setQty]                 = useState("1");
  const [reason, setReason]           = useState("");
  const [createSortie, { isLoading }] = useCreateStockSortieMutation();

  // Fetch boutique-type stock items — backend filters by RECEPTIONIST role automatically
  const { data: stockData, isLoading: stockLoading } = useGetStockItemsQuery({ type: "boutique", limit: 200 });
  const stockItems = stockData?.data ?? [];
  console.log("[StockRequestModal] stockItems →", stockItems.length, stockItems.map((s) => ({ id: s.id, name: s.itemName, type: s.type, stock: s.currentStock })));

  const addItem = () => {
    const stockItem = stockItems.find((s) => s.id === selectedId);
    if (!stockItem) return;
    if (items.find((i) => i.stockItem.id === selectedId)) {
      toast.error("Item already added"); return;
    }
    const q = parseInt(qty);
    if (!q || q <= 0) { toast.error("Enter a valid quantity"); return; }
    setItems((prev) => [...prev, { stockItem, quantity: q }]);
    setSelectedId(""); setQty("1");
  };

  const removeItem = (id: string) => setItems((prev) => prev.filter((i) => i.stockItem.id !== id));

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (items.length === 0) { toast.error("Add at least one item"); return; }
    if (!reason.trim())     { toast.error("Please provide a reason"); return; }

    try {
      await Promise.all(
        items.map((i) =>
          createSortie({
            stockItemId: i.stockItem.id,
            quantityOut: i.quantity,
            reason: reason.trim(),
          }).unwrap()
        )
      );
      toast.success("Stock request submitted successfully");
      onSuccess();
    } catch (err: any) {
      toast.error(err?.data?.message ?? "Failed to submit request");
    }
  };

  const available = stockItems.filter((s) => !items.find((i) => i.stockItem.id === s.id));

  return (
    <div className="fixed inset-0 bg-secondary-100/50 z-50 flex items-start justify-center p-4 overflow-y-auto">
      <Card className="!p-6 max-w-lg w-full my-8">
        <div className="flex items-center justify-between mb-5">
          <div>
            <h3 className="text-xl font-bold text-secondary-100">Request Stock</h3>
            <p className="text-sm text-custom-700 mt-0.5">Select products and quantities to request from stock</p>
          </div>
          <button onClick={onClose} className="text-custom-700 hover:text-secondary-100"><HiOutlineX className="w-6 h-6" /></button>
        </div>

        <form onSubmit={handleSubmit} className="space-y-5">
          {/* Add product row */}
          <div className="rounded-xl border border-custom-300 bg-custom-50 p-4 space-y-3">
            <p className="text-sm font-semibold text-secondary-100">Add Product</p>
            <div className="flex gap-2">
              <select
                value={selectedId}
                onChange={(e) => setSelectedId(e.target.value)}
                className="flex-1 px-3 py-2 rounded-xl w-64 border border-custom-300 bg-style-500 text-secondary-100 text-sm focus:outline-none focus:border-primary-400 transition-colors"
              >
                <option value="">Select an item...</option>
                {stockLoading
                  ? <option disabled>Loading...</option>
                  : available.map((s) => (
                  <option key={s.id} value={s.id}>
                    {s.itemName} — {s.currentStock} {s.unit} available
                  </option>
                ))}
              </select>
              <input
                type="number" min={1} value={qty}
                onChange={(e) => setQty(e.target.value)}
                placeholder="Qty"
                className="w-20 px-3 py-2 rounded-xl border border-custom-300 bg-style-500 text-secondary-100 text-sm focus:outline-none focus:border-primary-400 transition-colors"
              />
              <button type="button" onClick={addItem}
                disabled={!selectedId}
                className="px-3 py-2 rounded-xl bg-primary-500 text-white hover:bg-primary-600 transition-colors disabled:opacity-40"
              >
                <HiOutlinePlus className="w-4 h-4" />
              </button>
            </div>
          </div>

          {/* Selected items list */}
          {items.length > 0 && (
            <div className="rounded-xl border border-custom-300 overflow-hidden">
              <div className="px-4 py-2 bg-custom-100 border-b border-custom-200">
                <p className="text-xs font-bold text-secondary-100 uppercase tracking-wide">Items to Request ({items.length})</p>
              </div>
              {items.map((item) => (
                <div key={item.stockItem.id} className="flex items-center gap-3 px-4 py-3 border-b border-custom-100 last:border-0">
                  <div className="flex-1 min-w-0">
                    <p className="text-sm font-semibold text-secondary-100 truncate">{item.stockItem.itemName}</p>
                    <p className="text-xs text-custom-700">{item.stockItem.category} · {item.stockItem.unit}</p>
                  </div>
                  <span className="text-sm font-bold text-primary-500 flex-shrink-0">× {item.quantity}</span>
                  <button type="button" onClick={() => removeItem(item.stockItem.id)}
                    className="p-1 rounded-lg text-red-500 hover:bg-red-50 transition-colors flex-shrink-0"
                  >
                    <HiOutlineTrash className="w-4 h-4" />
                  </button>
                </div>
              ))}
            </div>
          )}

          {/* Reason */}
          <div>
            <label className="block text-sm font-semibold text-secondary-100 mb-2">
              Reason *
            </label>
            <textarea
              value={reason} onChange={(e) => setReason(e.target.value)}
              placeholder="e.g. Running low on A4 pads..."
              rows={2}
              className="w-full px-4 py-2.5 rounded-xl border border-custom-300 bg-style-500 text-secondary-100 text-sm placeholder:text-custom-700 focus:outline-none focus:border-primary-400 focus:ring-2 focus:ring-primary-200 transition-colors resize-none"
            />
          </div>

          <div className="flex gap-3 justify-end pt-2 border-t border-custom-300">
            <button type="button" onClick={onClose}
              className="px-4 py-2 rounded-xl border border-custom-300 text-sm font-semibold text-secondary-100 hover:bg-custom-100 transition-colors"
            >Cancel</button>
            <button type="submit" disabled={isLoading || items.length === 0}
              className="px-4 py-2 rounded-xl bg-primary-500 text-white text-sm font-semibold hover:bg-primary-600 transition-colors disabled:opacity-40"
            >{isLoading ? "Submitting..." : "Submit Request"}</button>
          </div>
        </form>
      </Card>
    </div>
  );
}

// ─── My Requests Modal ────────────────────────────────────────────────────────

const sortieStatusColors: Record<string, string> = {
  pending:  "bg-yellow-100 text-yellow-700",
  approved: "bg-emerald-100 text-emerald-700",
  rejected: "bg-red-100 text-red-700",
};

function MyRequestsModal({ requests, onClose }: {
  requests: StockSortie[];
  onClose: () => void;
}) {
  return (
    <div className="fixed inset-0 bg-secondary-100/50 z-50 flex items-start justify-center p-4 overflow-y-auto">
      <Card className="!p-6 max-w-2xl w-full my-8">
        <div className="flex items-center justify-between mb-5">
          <div>
            <h3 className="text-xl font-bold text-secondary-100">My Stock Requests</h3>
            <p className="text-sm text-custom-700 mt-0.5">{requests.length} request{requests.length !== 1 ? "s" : ""} submitted</p>
          </div>
          <button onClick={onClose} className="text-custom-700 hover:text-secondary-100"><HiOutlineX className="w-6 h-6" /></button>
        </div>

        {requests.length === 0 ? (
          <div className="py-12 text-center">
            <HiOutlineClipboardList className="w-10 h-10 text-custom-400 mx-auto mb-3" />
            <p className="text-sm text-custom-700">No requests yet</p>
          </div>
        ) : (
          <div className="space-y-4">
            {requests.map((req) => (
              <div key={req.id} className="rounded-xl border border-custom-300 overflow-hidden">
                <div className="flex items-center justify-between px-4 py-3 bg-custom-50 border-b border-custom-200">
                  <div className="flex items-center gap-3">
                    <span className="text-sm font-semibold text-secondary-100">
                      {req.stockItem?.itemName ?? req.stockItemId}
                    </span>
                    <span className={`text-xs font-bold px-2.5 py-1 rounded-full ${sortieStatusColors[req.status] ?? "bg-gray-100 text-gray-600"}`}>
                      {req.status}
                    </span>
                  </div>
                  <span className="text-xs text-custom-700">
                    {new Date(req.createdAt).toLocaleDateString("en-RW", { day: "2-digit", month: "short", year: "numeric" })}
                  </span>
                </div>
                <div className="px-4 py-2.5 flex items-center gap-4 text-sm">
                  <span className="text-custom-700">Qty: <span className="font-bold text-secondary-100">{parseFloat(req.quantityOut)}</span> {req.stockItem?.unit}</span>
                  {req.reason && <span className="text-xs text-custom-700 truncate flex-1">"{req.reason}"</span>}
                </div>
              </div>
            ))}
          </div>
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

export default function BoutiquePage() {
  const [search, setSearch] = useState("");
  const [selectedCategoryId, setSelectedCategoryId] = useState<string | "all">("all");
  const [selectedStatus, setSelectedStatus] = useState<StockStatus | "all">("all");
  const [showFilters, setShowFilters] = useState(false);
  const [selectedProduct, setSelectedProduct] = useState<BoutiqueProduct | null>(null);
  const [restockProduct, setRestockProduct]   = useState<BoutiqueProduct | null>(null);
  const [showRequestModal, setShowRequestModal] = useState(false);
  const [showMyRequests, setShowMyRequests] = useState(false);
  const [showAddProduct, setShowAddProduct] = useState(false);
  const [showPendingBalances, setShowPendingBalances] = useState(false);
  const [editProduct, setEditProduct] = useState<BoutiqueProduct | null>(null);

  const { data: unreadCount = 0 } = useGetUnreadCountQuery();

  // ── Data fetching ──────────────────────────────────────────────────────────
  const {
    data: categories = [],
    isLoading: categoriesLoading,
  } = useGetCategoriesQuery();

  const {
    data,
    isLoading: productsLoading,
    isError: productsError,
    refetch,
  } = useGetProductsQuery({
    categoryId: selectedCategoryId !== "all" ? selectedCategoryId : undefined,
    status: selectedStatus !== "all" ? selectedStatus : undefined,
    search: search.trim() || undefined,
  });

  const { data: mySortiesData, refetch: refetchRequests } = useGetMySortiesQuery({ limit: 100 });
  const myRequests = mySortiesData?.data ?? [];
  const { data: partialData }  = useGetSalesQuery({ paymentStatus: "partial",  limit: 100 });
  const { data: oncreditData } = useGetSalesQuery({ paymentStatus: "oncredit", limit: 100 });
  const { data: overpaidData } = useGetSalesQuery({ paymentStatus: "overpaid", limit: 100 });
  const pendingCount = (partialData?.sales?.length ?? 0) + (oncreditData?.sales?.length ?? 0) + (overpaidData?.sales?.length ?? 0);

  const _now = new Date();
  const todayStr = `${_now.getFullYear()}-${String(_now.getMonth() + 1).padStart(2, "0")}-${String(_now.getDate()).padStart(2, "0")}`;
  const todayFrom = new Date(todayStr + "T00:00:00").toISOString();
  const todayTo   = new Date(todayStr + "T23:59:59.999").toISOString();
  const { data: todaySalesData } = useGetSalesQuery({ from: todayFrom, to: todayTo, limit: 500 });
  const todaySoldCount  = (todaySalesData?.sales ?? []).reduce((sum, s) => sum + Number(s.quantity), 0);
  const todaySoldAmount = (todaySalesData?.sales ?? []).reduce((sum, s) => sum + Number(s.amountPaid), 0);

  const products = data?.products ?? [];

  const isLoading = categoriesLoading || productsLoading;

  // ── Derived counts ─────────────────────────────────────────────────────────
  const inStockCount    = products.filter((p) => p.status === "in-stock").length;
  const lowStockCount   = products.filter((p) => p.status === "low-stock").length;
  const outOfStockCount = products.filter((p) => p.status === "out-of-stock").length;

  const activeFilters =
    (selectedCategoryId !== "all" ? 1 : 0) + (selectedStatus !== "all" ? 1 : 0);

  // Map category id → color class by index
  const categoryColorMap: Record<string, string> = Object.fromEntries(
    categories.map((cat, i) => [cat.id, CATEGORY_COLORS[i % CATEGORY_COLORS.length]])
  );

  return (
    <DashboardLayout notificationCount={unreadCount}>
      <div className="space-y-6 font-[family-name:var(--font-family-primary)]">

        {/* ── Header ──────────────────────────────────────────────────────── */}
        <div className="flex items-start justify-between gap-4">
          <div>
            <h1 className="text-2xl md:text-3xl font-bold text-secondary-100">Boutique</h1>
            <p className="text-sm text-custom-700 mt-1">
              Browse available products and check stock before confirming a customer order
            </p>
          </div>
          <div className="flex items-center gap-2">
            <button
              onClick={() => setShowPendingBalances(true)}
              className="relative flex items-center gap-2 px-3 py-2 rounded-xl bg-orange-500 text-white hover:bg-orange-600 transition-colors text-sm font-semibold"
            >
              <HiOutlineCash className="w-4 h-4" />
              <span className="hidden sm:inline">Pending Balances</span>
              {pendingCount > 0 && (
                <span className="absolute -top-1 -right-1 w-5 h-5 rounded-full bg-red-600 text-white text-xs flex items-center justify-center font-bold">
                  {pendingCount}
                </span>
              )}
            </button>
            <button
              onClick={() => setShowAddProduct(true)}
              className="flex items-center gap-2 px-3 py-2 rounded-xl bg-emerald-500 text-white hover:bg-emerald-600 transition-colors text-sm font-semibold"
            >
              <HiOutlinePlus className="w-4 h-4" />
              <span className="hidden sm:inline">Add Product</span>
            </button>
            {/* <button
              onClick={() => { setShowMyRequests(true); refetchRequests(); }}
              className="flex items-center gap-2 px-3 py-2 rounded-xl border border-custom-300 hover:bg-custom-100 transition-colors text-custom-700 hover:text-secondary-100 text-sm font-semibold"
            >
              <HiOutlineClipboardList className="w-4 h-4" />
              <span className="hidden sm:inline">My Requests</span>
              {myRequests.filter((r) => r.status === "pending").length > 0 && (
                <span className="w-5 h-5 rounded-full bg-primary-500 text-white text-xs flex items-center justify-center font-bold">
                  {myRequests.filter((r) => r.status === "pending").length}
                </span>
              )}

            </button> */}
            {/* <button
              onClick={() => setShowRequestModal(true)}
              className="flex items-center gap-2 px-3 py-2 rounded-xl bg-primary-500 text-white hover:bg-primary-600 transition-colors text-sm font-semibold"
            >
              <HiOutlineShoppingCart className="w-4 h-4" />
              <span className="hidden sm:inline">Request Stock</span>
            </button> */}
            <button
              onClick={() => refetch()}
              className="flex items-center gap-2 px-3 py-2 rounded-xl border border-custom-300 hover:bg-custom-100 transition-colors text-custom-700 hover:text-secondary-100 text-sm"
              title="Refresh"
            >
              <HiOutlineRefresh className="w-4 h-4" />
            </button>
          </div>
        </div>

        {/* ── Summary Cards ───────────────────────────────────────────────── */}
        <div className="grid grid-cols-2 sm:grid-cols-5 gap-4">
          <Card className="!p-4">
            <p className="text-xs text-custom-700 mb-1">Total Products</p>
            <p className="text-2xl font-bold text-secondary-100">
              {isLoading ? "—" : products.length}
            </p>
          </Card>
          <Card className="!p-4">
            <p className="text-xs text-custom-700 mb-1">In Stock</p>
            <p className="text-2xl font-bold text-emerald-600">
              {isLoading ? "—" : inStockCount}
            </p>
          </Card>
          <Card className="!p-4">
            <p className="text-xs text-custom-700 mb-1">Low Stock</p>
            <p className="text-2xl font-bold text-yellow-600">
              {isLoading ? "—" : lowStockCount}
            </p>
          </Card>
          <Card className="!p-4">
            <p className="text-xs text-custom-700 mb-1">Out of Stock</p>
            <p className="text-2xl font-bold text-red-600">
              {isLoading ? "—" : outOfStockCount}
            </p>
          </Card>
          <Card className="!p-4">
            <p className="text-xs text-custom-700 mb-1">Sold Today</p>
            <p className="text-2xl font-bold text-primary-500">{todaySoldCount} <span className="text-sm font-normal text-custom-700">units</span></p>
            <p className="text-xs font-semibold text-emerald-600 mt-0.5">{todaySoldAmount.toLocaleString()} RWF</p>
          </Card>
        </div>

        {/* ── Search & Filters ────────────────────────────────────────────── */}
        <div className="flex flex-col sm:flex-row gap-3">
          <div className="flex-1 relative">
            <HiOutlineSearch className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-custom-700" />
            <input
              type="text"
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              placeholder="Search by name, SKU, or description..."
              className="w-full pl-10 pr-4 py-2 rounded-xl border border-custom-300 bg-style-500 text-secondary-100 placeholder:text-custom-700 focus:outline-none focus:border-primary-400 focus:ring-2 focus:ring-primary-200 transition-colors"
            />
          </div>
          <button
            onClick={() => setShowFilters(true)}
            className="relative flex items-center gap-2 px-4 py-2 rounded-xl border border-custom-300 hover:bg-custom-100 transition-colors text-secondary-100"
          >
            <HiOutlineFilter className="w-4 h-4" />
            <span className="text-sm font-semibold">Filters</span>
            {activeFilters > 0 && (
              <span className="absolute -top-1 -right-1 w-5 h-5 rounded-full bg-primary-500 text-white text-xs flex items-center justify-center font-bold">
                {activeFilters}
              </span>
            )}
          </button>
        </div>

        {/* ── Category Pills ───────────────────────────────────────────────── */}
        {!categoriesLoading && categories.length > 0 && (
          <div className="flex flex-wrap gap-2">
            <button
              onClick={() => setSelectedCategoryId("all")}
              className={`px-3 py-1.5 rounded-full text-xs font-semibold transition-colors ${
                selectedCategoryId === "all"
                  ? "bg-primary-500 text-white"
                  : "bg-custom-100 text-custom-700 hover:bg-custom-200"
              }`}
            >
              All Categories
            </button>
            {categories.map((cat) => (
              <button
                key={cat.id}
                onClick={() =>
                  setSelectedCategoryId(cat.id === selectedCategoryId ? "all" : cat.id)
                }
                className={`px-3 py-1.5 rounded-full text-xs font-semibold transition-colors ${
                  selectedCategoryId === cat.id
                    ? "bg-primary-500 text-white"
                    : "bg-custom-100 text-custom-700 hover:bg-custom-200"
                }`}
              >
                {cat.name}
              </button>
            ))}
          </div>
        )}

        {/* ── Product Grid ─────────────────────────────────────────────────── */}
        {isLoading ? (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
            {Array.from({ length: 8 }).map((_, i) => (
              <Card key={i} className="!p-4 animate-pulse">
                <div className="flex justify-between mb-3">
                  <div className="h-5 w-20 bg-custom-200 rounded-full" />
                  <div className="h-5 w-20 bg-custom-200 rounded-full" />
                </div>
                <div className="w-full h-24 rounded-xl bg-custom-200 mb-3" />
                <div className="h-4 w-3/4 bg-custom-200 rounded mb-2" />
                <div className="h-3 w-full bg-custom-200 rounded mb-1" />
                <div className="h-3 w-2/3 bg-custom-200 rounded" />
              </Card>
            ))}
          </div>
        ) : productsError ? (
          <Card className="!p-12 text-center">
            <HiOutlineExclamationCircle className="w-10 h-10 text-red-400 mx-auto mb-3" />
            <p className="text-secondary-100 font-semibold">Failed to load products</p>
            <p className="text-sm text-custom-700 mt-1 mb-4">Check your connection and try again</p>
            <button
              onClick={() => refetch()}
              className="px-4 py-2 rounded-xl bg-primary-500 text-white text-sm font-semibold hover:bg-primary-600 transition-colors"
            >
              Retry
            </button>
          </Card>
        ) : products.length === 0 ? (
          <Card className="!p-12 text-center">
            <HiOutlineCube className="w-10 h-10 text-custom-700 mx-auto mb-3" />
            <p className="text-secondary-100 font-semibold">No products found</p>
            <p className="text-sm text-custom-700 mt-1">Try adjusting your search or filters</p>
          </Card>
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
            {products.map((product) => {
              const status = statusConfig[product.status];
              const catColor = categoryColorMap[product.categoryId] ?? CATEGORY_COLORS[0];
              return (
                <Card
                  key={product.id}
                  className="!p-4 cursor-pointer hover:shadow-md hover:border-primary-300 transition-all"
                  onClick={() => setSelectedProduct(product)}
                >
                  {/* Category + Status */}
                  <div className="flex items-center justify-between mb-3">
                    <span className={`text-xs font-semibold px-2.5 py-1 rounded-full ${catColor}`}>
                      {product.category?.name ?? "—"}
                    </span>
                    <span className={`inline-flex items-center gap-1 text-xs font-bold px-2.5 py-1 rounded-full ${status.color}`}>
                      {status.icon}
                      {status.label}
                    </span>
                  </div>

                  {/* Product icon placeholder */}
                  <div className="w-full h-24 rounded-xl bg-custom-100 flex items-center justify-center mb-3">
                    <HiOutlineCube className="w-10 h-10 text-custom-400" />
                  </div>

                  {/* Info */}
                  <h3 className="font-bold text-secondary-100 text-sm leading-snug mb-1">
                    {product.name}
                  </h3>
                  <p className="text-xs text-custom-700 line-clamp-2 mb-3">
                    {product.description}
                  </p>

                  <div className="flex items-center justify-between pt-2 border-t border-custom-200">
                    <div>
                      <p className="text-xs text-custom-700">Price</p>
                      <p className="text-sm font-bold text-secondary-100">
                        {product.price.toLocaleString()}{" "}
                        <span className="text-xs font-normal text-custom-700">RWF</span>
                      </p>
                      <p className="text-xs text-custom-700">{product.unit}</p>
                    </div>
                    <div className="text-right">
                      <p className="text-xs text-custom-700">Stock</p>
                      <p
                        className={`text-sm font-bold ${
                          product.status === "out-of-stock"
                            ? "text-red-600"
                            : product.status === "low-stock"
                            ? "text-yellow-600"
                            : "text-emerald-600"
                        }`}
                      >
                        {product.stock}
                      </p>
                      <p className="text-xs text-custom-700">units</p>
                    </div>
                  </div>

                  <div className="mt-2 flex items-center justify-between">
                    <p className="text-xs text-custom-400 font-mono">SKU: {product.sku}</p>
                    <div className="flex items-center gap-1">
                      <button
                        onClick={(e) => { e.stopPropagation(); setEditProduct(product); }}
                        className="flex items-center gap-1 px-2.5 py-1 rounded-lg bg-blue-50 text-blue-600 text-xs font-semibold hover:bg-blue-100 transition-colors"
                      >
                        <HiOutlinePencil className="w-3.5 h-3.5" /> Edit
                      </button>
                      <button
                        onClick={(e) => { e.stopPropagation(); setRestockProduct(product); }}
                        className="flex items-center gap-1 px-2.5 py-1 rounded-lg bg-emerald-50 text-emerald-600 text-xs font-semibold hover:bg-emerald-100 transition-colors"
                      >
                        <HiOutlinePlus className="w-3.5 h-3.5" /> Add Qty
                      </button>
                    </div>
                  </div>
                </Card>
              );
            })}
          </div>
        )}
      </div>

      {/* ── Filter Modal ─────────────────────────────────────────────────────── */}
      {showFilters && (
        <div className="fixed inset-0 bg-secondary-100/50 z-50 flex items-center justify-center p-4">
          <Card className="!p-6 max-w-sm w-full">
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-lg font-bold text-secondary-100">Filter Products</h3>
              <button
                onClick={() => setShowFilters(false)}
                className="text-custom-700 hover:text-secondary-100"
              >
                <HiOutlineX className="w-5 h-5" />
              </button>
            </div>
            <div className="space-y-4">
              <div>
                <label className="block text-sm font-semibold text-secondary-100 mb-2">
                  Category
                </label>
                <select
                  value={selectedCategoryId}
                  onChange={(e) => setSelectedCategoryId(e.target.value)}
                  className="w-full px-3 py-2 rounded-xl border border-custom-300 bg-style-500 text-secondary-100 focus:outline-none focus:border-primary-400"
                >
                  <option value="all">All Categories</option>
                  {categories.map((c) => (
                    <option key={c.id} value={c.id}>
                      {c.name}
                    </option>
                  ))}
                </select>
              </div>
              <div>
                <label className="block text-sm font-semibold text-secondary-100 mb-2">
                  Stock Status
                </label>
                <select
                  value={selectedStatus}
                  onChange={(e) =>
                    setSelectedStatus(e.target.value as StockStatus | "all")
                  }
                  className="w-full px-3 py-2 rounded-xl border border-custom-300 bg-style-500 text-secondary-100 focus:outline-none focus:border-primary-400"
                >
                  <option value="all">All Statuses</option>
                  <option value="in-stock">In Stock</option>
                  <option value="low-stock">Low Stock</option>
                  <option value="out-of-stock">Out of Stock</option>
                </select>
              </div>
            </div>
            <div className="flex gap-3 mt-5">
              <button
                onClick={() => {
                  setSelectedCategoryId("all");
                  setSelectedStatus("all");
                }}
                className="flex-1 px-4 py-2 rounded-xl border border-custom-300 text-sm font-semibold text-secondary-100 hover:bg-custom-100 transition-colors"
              >
                Reset
              </button>
              <button
                onClick={() => setShowFilters(false)}
                className="flex-1 px-4 py-2 rounded-xl bg-primary-500 text-white text-sm font-semibold hover:bg-primary-600 transition-colors"
              >
                Apply
              </button>
            </div>
          </Card>
        </div>
      )}

      {/* ── Product Detail Modal ──────────────────────────────────────────────── */}
      {selectedProduct && (
        <ProductDetailModal
          product={selectedProduct}
          categoryColor={categoryColorMap[selectedProduct.categoryId] ?? CATEGORY_COLORS[0]}
          onClose={() => setSelectedProduct(null)}
          onSold={() => { setSelectedProduct(null); refetch(); }}
        />
      )}

      {/* ── Stock Request Modal ───────────────────────────────────────────────── */}
      {showRequestModal && (
        <StockRequestModal
          onClose={() => setShowRequestModal(false)}
          onSuccess={() => { setShowRequestModal(false); refetchRequests(); refetch(); }}
        />
      )}

      {/* ── My Requests Modal ────────────────────────────────────────────────── */}
      {showMyRequests && (
        <MyRequestsModal
          requests={myRequests}
          onClose={() => setShowMyRequests(false)}
        />
      )}

      {/* ── Pending Balances Modal ──────────────────────────────────────────────── */}
      {showPendingBalances && (
        <PendingBalancesModal onClose={() => setShowPendingBalances(false)} />
      )}

      {/* ── Add Product Modal ─────────────────────────────────────────────────── */}
      {restockProduct && (
        <RestockModal
          product={restockProduct}
          onClose={() => setRestockProduct(null)}
          onSuccess={() => { setRestockProduct(null); refetch(); }}
        />
      )}

      {/* ── Add Product Modal ─────────────────────────────────────────────────── */}
      {showAddProduct && (
        <AddProductModal
          categories={categories}
          onClose={() => setShowAddProduct(false)}
          onSuccess={() => { setShowAddProduct(false); refetch(); }}
        />
      )}

      {/* ── Edit Product Modal ───────────────────────────────────────────────── */}
      {editProduct && (
        <EditProductModal
          product={editProduct}
          categories={categories}
          onClose={() => setEditProduct(null)}
          onSuccess={() => { setEditProduct(null); refetch(); }}
        />
      )}
    </DashboardLayout>
  );
}