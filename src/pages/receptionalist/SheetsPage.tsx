import { useState } from "react";
import {
  HiOutlineSearch,
  HiOutlineRefresh,
  HiOutlinePlus,
  HiOutlineX,
  HiOutlinePencil,
  HiOutlineTrash,
  HiOutlineDocumentText,
  HiOutlineCube,
  HiOutlineEye,
} from "react-icons/hi";
import { toast } from "react-toastify";
import DashboardLayout from "../../components/DashboardLayout";
import { Card } from "../../components/ui";
import PhoneInput from "../../components/ui/PhoneInput";
import {
  useGetSheetsQuery,
  useCreateSheetMutation,
  useUpdateSheetMutation,
  useDeleteSheetMutation,
  type Sheet,
} from "../../store/services/sheetsService";

const PAGE_SIZE = 15;
const inputCls =
  "w-full px-3 py-2 rounded-xl border border-custom-300 bg-style-500 text-secondary-100 text-sm focus:outline-none focus:border-primary-400 transition-colors";

// ─── Add/Edit Modal ──────────────────────────────────────────────────────────
interface SheetModalProps {
  sheet?: Sheet;
  onClose: () => void;
}

function SheetModal({ sheet, onClose }: SheetModalProps) {
  const [form, setForm] = useState({
    name: sheet?.name ?? "",
    description: sheet?.description ?? "",
    qty: sheet?.qty?.toString() ?? "",
    unitPrice: sheet?.unitPrice?.toString() ?? "",
    customerName: sheet?.customerName ?? "",
    customerPhone: sheet?.customerPhone ?? "",
  });
  const [phoneError, setPhoneError] = useState("");

  const [createSheet, { isLoading: isCreating }] = useCreateSheetMutation();
  const [updateSheet, { isLoading: isUpdating }] = useUpdateSheetMutation();
  const isLoading = isCreating || isUpdating;

  const set =
    (key: string) =>
    (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
      setForm((prev) => ({ ...prev, [key]: e.target.value }));
    };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (
      form.customerPhone &&
      form.customerPhone.replace(/\D/g, "").length < 9
    ) {
      setPhoneError("Enter a valid phone number.");
      return;
    }
    setPhoneError("");

    const payload = {
      name: form.name,
      description: form.description || undefined,
      qty: Number(form.qty),
      unitPrice: Number(form.unitPrice),
      customerName: form.customerName || undefined,
      customerPhone: form.customerPhone || undefined,
    };

    try {
      if (sheet) {
        await updateSheet({ id: sheet.id, ...payload }).unwrap();
        toast.success("Sheet updated successfully");
      } else {
        await createSheet(payload).unwrap();
        toast.success("Sheet recorded successfully");
      }
      onClose();
    } catch (err: any) {
      toast.error(err?.data?.message ?? "Failed to save sheet record");
    }
  };

  return (
    <div className="fixed inset-0 bg-secondary-100/50 z-50 flex items-start justify-center p-4 overflow-y-auto">
      <Card className="!p-6 max-w-3xl w-full my-8">
        <div className="flex items-center justify-between mb-5">
          <div>
            <h3 className="text-xl font-bold text-secondary-100">
              {sheet ? "Edit Sheet Record" : "Add New Sheet Sale"}
            </h3>
            <p className="text-sm text-custom-700 mt-0.5">
              Record sheet sales for the company
            </p>
          </div>
          <button
            onClick={onClose}
            className="text-custom-700 hover:text-secondary-100"
          >
            <HiOutlineX className="w-6 h-6" />
          </button>
        </div>

        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
            <div>
              <label className="block text-sm font-semibold text-secondary-100 mb-1">
                Sheet Name *
              </label>
              <input
                value={form.name}
                onChange={set("name")}
                placeholder="e.g. A4 Sheets, Letter Sheets"
                className={inputCls}
                required
              />
            </div>

            <div>
              <label className="block text-sm font-semibold text-secondary-100 mb-1">
                Quantity *
              </label>
              <input
                type="number"
                min="1"
                step="1"
                value={form.qty}
                onChange={set("qty")}
                placeholder="0"
                className={inputCls}
                required
              />
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
            <div>
              <label className="block text-sm font-semibold text-secondary-100 mb-1">
                Unit Price (RWF) *
              </label>
              <input
                type="number"
                min="0"
                step="0.01"
                value={form.unitPrice}
                onChange={set("unitPrice")}
                placeholder="0.00"
                className={inputCls}
                required
              />
            </div>

            <div>
              <label className="block text-sm font-semibold text-secondary-100 mb-1">
                Total Amount (RWF)
              </label>
              <input
                type="text"
                value={
                  form.qty && form.unitPrice
                    ? (Number(form.qty) * Number(form.unitPrice)).toLocaleString()
                    : "0"
                }
                disabled
                className={`${inputCls} bg-custom-100 text-custom-700 cursor-not-allowed`}
              />
            </div>
          </div>

          <div>
            <label className="block text-sm font-semibold text-secondary-100 mb-1">
              Description{" "}
              <span className="font-normal text-custom-700">(optional)</span>
            </label>
            <textarea
              value={form.description}
              onChange={set("description")}
              rows={2}
              placeholder="Additional details about the item"
              className="w-full px-3 py-2 rounded-xl border border-custom-300 bg-style-500 text-secondary-100 text-sm focus:outline-none focus:border-primary-400 transition-colors resize-none"
            />
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
            <div>
              <label className="block text-sm font-semibold text-secondary-100 mb-1">
                Customer Name{" "}
                <span className="font-normal text-custom-700">(optional)</span>
              </label>
              <input
                value={form.customerName}
                onChange={set("customerName")}
                placeholder="Full name"
                className={inputCls}
              />
            </div>

            <div>
              <label className="block text-sm font-semibold text-secondary-100 mb-1">
                Customer Phone{" "}
                <span className="font-normal text-custom-700">(optional)</span>
              </label>
              <PhoneInput
                value={form.customerPhone}
                onChange={(val) => {
                  setForm((prev) => ({ ...prev, customerPhone: val }));
                  setPhoneError("");
                }}
                error={phoneError}
              />
            </div>
          </div>

          <div className="flex gap-3 justify-end pt-2 border-t border-custom-300">
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2 rounded-xl border border-custom-300 text-sm font-semibold text-secondary-100 hover:bg-custom-100 transition-colors"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={isLoading}
              className="px-4 py-2 rounded-xl bg-primary-500 text-white text-sm font-semibold hover:bg-primary-600 transition-colors disabled:opacity-40"
            >
              {isLoading
                ? sheet
                  ? "Updating..."
                  : "Recording..."
                : sheet
                ? "Update Sheet"
                : "Record Sheet"}
            </button>
          </div>
        </form>
      </Card>
    </div>
  );
}

// ─── View Modal ──────────────────────────────────────────────────────────────
function ViewModal({ sheet, onClose }: { sheet: Sheet; onClose: () => void }) {
  const fmt = (d: string) =>
    new Date(d).toLocaleDateString("en-RW", {
      day: "2-digit",
      month: "short",
      year: "numeric",
      hour: "2-digit",
      minute: "2-digit",
    });

  const row = (label: string, value: React.ReactNode) => (
    <div className="flex justify-between items-start py-2.5 border-b border-custom-200 last:border-0">
      <span className="text-sm text-custom-700 font-medium w-40 shrink-0">{label}</span>
      <span className="text-sm text-secondary-100 text-right">{value ?? "—"}</span>
    </div>
  );

  return (
    <div className="fixed inset-0 bg-secondary-100/50 z-50 flex items-center justify-center p-4">
      <Card className="!p-6 max-w-lg w-full">
        <div className="flex items-center justify-between mb-5">
          <div>
            <h3 className="text-xl font-bold text-secondary-100">Sheet Details</h3>
            {sheet.ref && (
              <p className="text-sm text-custom-700 mt-0.5">Ref: {sheet.ref}</p>
            )}
          </div>
          <button onClick={onClose} className="text-custom-700 hover:text-secondary-100">
            <HiOutlineX className="w-6 h-6" />
          </button>
        </div>

        <div className="space-y-0">
          {row("Sheet Name", <span className="font-semibold">{sheet.name}</span>)}
          {row("Description", sheet.description)}
          {row("Quantity", sheet.qty?.toLocaleString())}
          {row("Unit Price", `${Number(sheet.unitPrice).toLocaleString()} RWF`)}
          {row("Total Amount", <span className="font-bold text-emerald-600">{Number(sheet.totalAmount).toLocaleString()} RWF</span>)}
          {row("Customer Name", sheet.customerName)}
          {row("Customer Phone", sheet.customerPhone)}
          {row("Date", fmt(sheet.createdAt))}
        </div>

        <div className="flex justify-end mt-5 pt-4 border-t border-custom-300">
          <button
            onClick={onClose}
            className="px-4 py-2 rounded-xl border border-custom-300 text-sm font-semibold text-secondary-100 hover:bg-custom-100 transition-colors"
          >
            Close
          </button>
        </div>
      </Card>
    </div>
  );
}

// ─── Delete Confirm Modal ────────────────────────────────────────────────────
function DeleteModal({ sheet, onClose }: { sheet: Sheet; onClose: () => void }) {
  const [deleteSheet, { isLoading }] = useDeleteSheetMutation();

  const handleDelete = async () => {
    try {
      await deleteSheet(sheet.id).unwrap();
      toast.success("Sheet record deleted");
      onClose();
    } catch (err: any) {
      toast.error(err?.data?.message ?? "Failed to delete");
    }
  };

  return (
    <div className="fixed inset-0 bg-secondary-100/50 z-50 flex items-center justify-center p-4">
      <Card className="!p-6 max-w-md w-full">
        <div className="flex items-center justify-between mb-4">
          <h3 className="text-lg font-bold text-secondary-100">
            Delete Sheet Record
          </h3>
          <button
            onClick={onClose}
            className="text-custom-700 hover:text-secondary-100"
          >
            <HiOutlineX className="w-5 h-5" />
          </button>
        </div>

        <p className="text-sm text-custom-700 mb-6">
          Are you sure you want to delete the record for{" "}
          <span className="font-bold text-secondary-100">
            {sheet.name}
          </span>
          ? This action cannot be undone.
        </p>

        <div className="flex gap-3 justify-end">
          <button
            onClick={onClose}
            disabled={isLoading}
            className="px-4 py-2 rounded-xl border border-custom-300 text-sm font-semibold text-secondary-100 hover:bg-custom-100 transition-colors"
          >
            Cancel
          </button>
          <button
            onClick={handleDelete}
            disabled={isLoading}
            className="px-4 py-2 rounded-xl bg-red-500 text-white text-sm font-semibold hover:bg-red-600 transition-colors disabled:opacity-40"
          >
            {isLoading ? "Deleting..." : "Delete"}
          </button>
        </div>
      </Card>
    </div>
  );
}

// ─── Main Page ───────────────────────────────────────────────────────────────
export default function SheetsPage() {
  const [search, setSearch] = useState("");
  const [page, setPage] = useState(1);
  const [addModalOpen, setAddModalOpen] = useState(false);
  const [editSheet, setEditSheet] = useState<Sheet | null>(null);
  const [deleteSheet, setDeleteSheet] = useState<Sheet | null>(null);
  const [viewSheet, setViewSheet] = useState<Sheet | null>(null);

  const { data, isLoading, isFetching, refetch } = useGetSheetsQuery({
    page,
    limit: PAGE_SIZE,
    search: search || undefined,
  });

  // Debug: Log the first sheet to see actual backend structure
  if (data?.sheets?.[0]) {
    console.log("First sheet from backend:", data.sheets[0]);
  }

  const sheets = data?.sheets ?? [];
  const total = data?.total ?? 0;
  const totalPages = data?.totalPages ?? 1;

  const filteredSheets = sheets.filter((sheet) =>
    search
      ? sheet.name.toLowerCase().includes(search.toLowerCase()) ||
        sheet.customerName?.toLowerCase().includes(search.toLowerCase()) ||
        sheet.ref?.toLowerCase().includes(search.toLowerCase())
      : true
  );


  const fmt = (d: string) =>
    new Date(d).toLocaleDateString("en-RW", {
      day: "2-digit",
      month: "short",
      year: "numeric",
    });

  return (
    <DashboardLayout userRole="receptionist" userName="Receptionist">
      <div className="space-y-6">
        {/* Header */}
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
          <div>
            <h1 className="text-3xl font-bold text-secondary-100">Sheets Sales</h1>
            <p className="text-sm text-custom-700 mt-1">
              Record and manage sheet sales
            </p>
          </div>
          <button
            onClick={() => setAddModalOpen(true)}
            className="flex items-center gap-2 px-4 py-2.5 bg-primary-500 text-white rounded-xl font-semibold hover:bg-primary-600 transition-colors"
          >
            <HiOutlinePlus className="w-5 h-5" />
            <span>Add Sheet Sale</span>
          </button>
        </div>

        {/* Stats Cards */}
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
          <Card className="!p-4">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-xl bg-blue-100 flex items-center justify-center">
                <HiOutlineDocumentText className="w-5 h-5 text-blue-600" />
              </div>
              <div>
                <p className="text-sm text-custom-700">Total Records</p>
                <p className="text-2xl font-bold text-secondary-100">{total}</p>
              </div>
            </div>
          </Card>

          <Card className="!p-4">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-xl bg-emerald-100 flex items-center justify-center">
                <HiOutlineCube className="w-5 h-5 text-emerald-600" />
              </div>
              <div>
                <p className="text-sm text-custom-700">Total Quantity</p>
                <p className="text-2xl font-bold text-secondary-100">
                  {sheets.reduce((sum, s) => sum + Number(s.qty), 0).toLocaleString()}
                </p>
              </div>
            </div>
          </Card>

          <Card className="!p-4">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-xl bg-purple-100 flex items-center justify-center">
                <HiOutlineCube className="w-5 h-5 text-purple-600" />
              </div>
              <div>
                <p className="text-sm text-custom-700">Total Revenue (RWF)</p>
                <p className="text-2xl font-bold text-secondary-100">
                  {sheets
                    .reduce((sum, s) => sum + Number(s.totalAmount), 0)
                    .toLocaleString()}
                </p>
              </div>
            </div>
          </Card>
        </div>

        {/* Search & Filters */}
        <Card className="!p-4">
          <div className="flex flex-col sm:flex-row gap-3">
            <div className="flex-1 relative">
              <HiOutlineSearch className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-custom-700" />
              <input
                type="text"
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                placeholder="Search by item name, customer, or ref..."
                className="w-full pl-10 pr-4 py-2.5 rounded-xl border border-custom-300 bg-style-500 text-secondary-100 text-sm focus:outline-none focus:border-primary-400 transition-colors"
              />
            </div>
            <button
              onClick={() => refetch()}
              disabled={isFetching}
              className="flex items-center gap-2 px-4 py-2.5 border border-custom-300 text-secondary-100 rounded-xl font-semibold hover:bg-custom-100 transition-colors disabled:opacity-40"
            >
              <HiOutlineRefresh
                className={`w-5 h-5 ${isFetching ? "animate-spin" : ""}`}
              />
              <span className="hidden sm:inline">Refresh</span>
            </button>
          </div>
        </Card>

        {/* Table */}
        <Card className="!p-0 overflow-hidden">
          {isLoading ? (
            <div className="p-12 text-center text-custom-700">
              Loading sheets...
            </div>
          ) : filteredSheets.length === 0 ? (
            <div className="p-12 text-center">
              <HiOutlineDocumentText className="w-12 h-12 text-custom-400 mx-auto mb-3" />
              <p className="text-custom-700">
                {search
                  ? "No sheets found matching your search"
                  : "No sheet records yet. Add your first one!"}
              </p>
            </div>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead className="bg-custom-100 border-b border-custom-200">
                  <tr>
                    <th className="text-left px-4 py-3 text-xs font-semibold text-custom-700 uppercase tracking-wider">
                      Ref
                    </th>
                    <th className="text-left px-4 py-3 text-xs font-semibold text-custom-700 uppercase tracking-wider">
                      Item Name
                    </th>
                    <th className="text-left px-4 py-3 text-xs font-semibold text-custom-700 uppercase tracking-wider">
                      Qty
                    </th>
                    <th className="text-left px-4 py-3 text-xs font-semibold text-custom-700 uppercase tracking-wider">
                      Unit Price
                    </th>
                    <th className="text-left px-4 py-3 text-xs font-semibold text-custom-700 uppercase tracking-wider">
                      Total
                    </th>
                    <th className="text-left px-4 py-3 text-xs font-semibold text-custom-700 uppercase tracking-wider">
                      Customer
                    </th>
                    <th className="text-left px-4 py-3 text-xs font-semibold text-custom-700 uppercase tracking-wider">
                      Date
                    </th>
                    <th className="text-left px-4 py-3 text-xs font-semibold text-custom-700 uppercase tracking-wider">
                      Actions
                    </th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-custom-200">
                  {filteredSheets.map((sheet, idx) => (
                    <tr
                      key={sheet.id}
                      className="hover:bg-custom-50 transition-colors"
                    >
                      <td className="px-4 py-3 text-sm text-custom-700">
                        {(page - 1) * PAGE_SIZE + idx + 1}
                      </td>
                      <td className="px-4 py-3">
                        <div>
                          <p className="text-sm font-semibold text-secondary-100">
                            {sheet.name}
                          </p>
                          {sheet.description && (
                            <p className="text-xs text-custom-700 mt-0.5">
                              {sheet.description}
                            </p>
                          )}
                        </div>
                      </td>
                      <td className="px-4 py-3 text-sm text-secondary-100">
                        {sheet.qty.toLocaleString()}
                      </td>
                      <td className="px-4 py-3 text-sm text-secondary-100">
                        {Number(sheet.unitPrice).toLocaleString()} RWF
                      </td>
                      <td className="px-4 py-3 text-sm font-semibold text-secondary-100">
                        {Number(sheet.totalAmount).toLocaleString()} RWF
                      </td>
                      <td className="px-4 py-3">
                        {sheet.customerName ? (
                          <div>
                            <p className="text-sm text-secondary-100">
                              {sheet.customerName}
                            </p>
                            {sheet.customerPhone && (
                              <p className="text-xs text-custom-700">
                                {sheet.customerPhone}
                              </p>
                            )}
                          </div>
                        ) : (
                          <span className="text-sm text-custom-700">—</span>
                        )}
                      </td>
                      <td className="px-4 py-3 text-sm text-custom-700">
                        {fmt(sheet.createdAt)}
                      </td>
                      <td className="px-4 py-3">
                        <div className="flex items-center gap-2">
                          <button
                            onClick={() => setViewSheet(sheet)}
                            className="p-1.5 rounded-lg text-custom-700 hover:bg-custom-100 transition-colors"
                            title="View"
                          >
                            <HiOutlineEye className="w-4 h-4" />
                          </button>
                          <button
                            onClick={() => setEditSheet(sheet)}
                            className="p-1.5 rounded-lg text-blue-600 hover:bg-blue-50 transition-colors"
                            title="Edit"
                          >
                            <HiOutlinePencil className="w-4 h-4" />
                          </button>
                          <button
                            onClick={() => setDeleteSheet(sheet)}
                            className="p-1.5 rounded-lg text-red-600 hover:bg-red-50 transition-colors"
                            title="Delete"
                          >
                            <HiOutlineTrash className="w-4 h-4" />
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

        {/* Pagination */}
        {totalPages > 1 && (
          <div className="flex items-center justify-between">
            <p className="text-sm text-custom-700">
              Page {page} of {totalPages}
            </p>
            <div className="flex gap-2">
              <button
                onClick={() => setPage((p) => Math.max(1, p - 1))}
                disabled={page === 1}
                className="px-3 py-1.5 rounded-lg border border-custom-300 text-sm font-semibold text-secondary-100 hover:bg-custom-100 transition-colors disabled:opacity-40 disabled:cursor-not-allowed"
              >
                Previous
              </button>
              <button
                onClick={() => setPage((p) => Math.min(totalPages, p + 1))}
                disabled={page === totalPages}
                className="px-3 py-1.5 rounded-lg border border-custom-300 text-sm font-semibold text-secondary-100 hover:bg-custom-100 transition-colors disabled:opacity-40 disabled:cursor-not-allowed"
              >
                Next
              </button>
            </div>
          </div>
        )}
      </div>

      {/* Modals */}
      {addModalOpen && <SheetModal onClose={() => setAddModalOpen(false)} />}
      {editSheet && (
        <SheetModal sheet={editSheet} onClose={() => setEditSheet(null)} />
      )}
      {viewSheet && (
        <ViewModal sheet={viewSheet} onClose={() => setViewSheet(null)} />
      )}
      {deleteSheet && (
        <DeleteModal sheet={deleteSheet} onClose={() => setDeleteSheet(null)} />
      )}
    </DashboardLayout>
  );
}
