import { useState } from "react";
import {
    HiOutlineDocumentText,
    HiOutlineDownload,
    HiOutlineEye,
    HiOutlineSearch,
    HiOutlineUpload
} from "react-icons/hi";
import { DashboardLayout } from "../../components";
import { Button, Card } from "../../components/ui";

interface Document {
  id: string;
  name: string;
  type: string;
  size: string;
  uploadedBy: string;
  uploadDate: string;
  category: string;
}

const initialDocuments: Document[] = [
  {
    id: "DOC-001",
    name: "Invoice_INV-001.pdf",
    type: "Invoice",
    size: "245 KB",
    uploadedBy: "Accountant 1",
    uploadDate: "2026-04-28",
    category: "Invoices",
  },
  {
    id: "DOC-002",
    name: "Payment_Receipt_PAY-001.pdf",
    type: "Receipt",
    size: "89 KB",
    uploadedBy: "Accountant 1",
    uploadDate: "2026-05-02",
    category: "Payments",
  },
  {
    id: "DOC-003",
    name: "Tax_Report_Q1_2026.pdf",
    type: "Tax Report",
    size: "1.2 MB",
    uploadedBy: "Accountant 2",
    uploadDate: "2026-04-30",
    category: "Tax",
  },
];

export default function Accountant1DocumentsPage() {
  const [documents] = useState<Document[]>(initialDocuments);
  const [search, setSearch] = useState("");

  const filtered = documents.filter((doc) =>
    doc.name.toLowerCase().includes(search.toLowerCase()) ||
    doc.type.toLowerCase().includes(search.toLowerCase())
  );

  return (
    <DashboardLayout userRole="accountant" userName="Accountant" notificationCount={3}>
      <div className="space-y-6 font-[family-name:var(--font-family-primary)]">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
          <div>
            <h1 className="text-2xl md:text-3xl font-bold text-secondary-100">Documents</h1>
            <p className="text-sm text-custom-700 mt-1">Manage financial documents and records</p>
          </div>
          <Button className="!bg-primary-500 hover:!bg-primary-600 !text-white">
            <HiOutlineUpload className="w-4 h-4 mr-2" />
            Upload Document
          </Button>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
          <Card className="!p-4">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-xl bg-primary-100 flex items-center justify-center">
                <HiOutlineDocumentText className="w-5 h-5 text-primary-600" />
              </div>
              <div>
                <p className="text-xs text-custom-700">Total Documents</p>
                <p className="text-xl font-bold text-secondary-100">{documents.length}</p>
              </div>
            </div>
          </Card>
          <Card className="!p-4">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-xl bg-green-100 flex items-center justify-center">
                <HiOutlineDocumentText className="w-5 h-5 text-green-600" />
              </div>
              <div>
                <p className="text-xs text-custom-700">Invoices</p>
                <p className="text-xl font-bold text-green-600">
                  {documents.filter((d) => d.category === "Invoices").length}
                </p>
              </div>
            </div>
          </Card>
          <Card className="!p-4">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-xl bg-yellow-100 flex items-center justify-center">
                <HiOutlineDocumentText className="w-5 h-5 text-yellow-600" />
              </div>
              <div>
                <p className="text-xs text-custom-700">Receipts</p>
                <p className="text-xl font-bold text-yellow-600">
                  {documents.filter((d) => d.category === "Payments").length}
                </p>
              </div>
            </div>
          </Card>
        </div>

        <Card className="!p-0 overflow-hidden">
          <div className="p-4 bg-custom-100 border-b border-custom-300">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
              <h2 className="text-lg font-bold text-secondary-100">All Documents</h2>
              <div className="relative w-full sm:w-64">
                <HiOutlineSearch className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-custom-700" />
                <input
                  type="text"
                  placeholder="Search documents..."
                  value={search}
                  onChange={(e) => setSearch(e.target.value)}
                  className="w-full pl-9 pr-4 py-2 rounded-xl border border-custom-300 bg-style-500 text-secondary-100 text-sm placeholder:text-custom-700 focus:outline-none focus:border-primary-400 focus:ring-2 focus:ring-primary-200"
                />
              </div>
            </div>
          </div>
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead className="bg-custom-50 border-b border-custom-300">
                <tr>
                  <th className="px-4 py-3 text-left text-xs font-bold text-secondary-100 uppercase">Document Name</th>
                  <th className="px-4 py-3 text-left text-xs font-bold text-secondary-100 uppercase">Type</th>
                  <th className="px-4 py-3 text-left text-xs font-bold text-secondary-100 uppercase">Category</th>
                  <th className="px-4 py-3 text-left text-xs font-bold text-secondary-100 uppercase">Size</th>
                  <th className="px-4 py-3 text-left text-xs font-bold text-secondary-100 uppercase">Uploaded By</th>
                  <th className="px-4 py-3 text-left text-xs font-bold text-secondary-100 uppercase">Upload Date</th>
                  <th className="px-4 py-3 text-right text-xs font-bold text-secondary-100 uppercase">Actions</th>
                </tr>
              </thead>
              <tbody className="bg-white divide-y divide-custom-200">
                {filtered.map((doc) => (
                  <tr key={doc.id} className="hover:bg-custom-50 transition-colors">
                    <td className="px-4 py-4">
                      <div className="flex items-center gap-3">
                        <div className="w-10 h-10 rounded-lg bg-primary-100 flex items-center justify-center">
                          <HiOutlineDocumentText className="w-5 h-5 text-primary-600" />
                        </div>
                        <span className="text-sm font-semibold text-secondary-100">{doc.name}</span>
                      </div>
                    </td>
                    <td className="px-4 py-4">
                      <span className="text-sm text-secondary-100">{doc.type}</span>
                    </td>
                    <td className="px-4 py-4">
                      <span className="text-xs font-bold px-3 py-1 rounded-full bg-primary-100 text-primary-700">
                        {doc.category}
                      </span>
                    </td>
                    <td className="px-4 py-4">
                      <span className="text-sm text-custom-700">{doc.size}</span>
                    </td>
                    <td className="px-4 py-4">
                      <span className="text-sm text-secondary-100">{doc.uploadedBy}</span>
                    </td>
                    <td className="px-4 py-4">
                      <span className="text-sm text-custom-700">{doc.uploadDate}</span>
                    </td>
                    <td className="px-4 py-4">
                      <div className="flex items-center justify-end gap-2">
                        <button className="p-2 rounded-lg hover:bg-primary-100 transition-colors">
                          <HiOutlineEye className="w-4 h-4 text-primary-500" />
                        </button>
                        <button className="p-2 rounded-lg hover:bg-primary-100 transition-colors">
                          <HiOutlineDownload className="w-4 h-4 text-primary-500" />
                        </button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </Card>
      </div>
    </DashboardLayout>
  );
}
