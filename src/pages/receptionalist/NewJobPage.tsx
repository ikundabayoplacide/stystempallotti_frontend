import { useEffect, useState } from "react";
import {
    HiOutlineClipboardList,
    HiOutlineUser
} from "react-icons/hi";
import { DashboardLayout } from "../../components";
import { Button, Card, Input } from "../../components/ui";

// Auto-generate job number
const generateJobNumber = () => {
  const date = new Date();
  const year = date.getFullYear();
  const month = String(date.getMonth() + 1).padStart(2, "0");
  const day = String(date.getDate()).padStart(2, "0");
  const random = Math.floor(Math.random() * 1000).toString().padStart(3, "0");
  return `JOB-${year}${month}${day}-${random}`;
};

export default function NewJobPage() {
  const [jobNumber, setJobNumber] = useState("");
  const [formData, setFormData] = useState({
    clientName: "",
    clientPhone: "",
    clientEmail: "",
    serviceType: "",
    quantity: "",
    deadline: "",
    paperType: "",
    paperSize: "",
    colors: "",
    specifications: "",
  });

  useEffect(() => {
    // Generate job number on component mount
    setJobNumber(generateJobNumber());
  }, []);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    console.log("New job submitted:", { jobNumber, ...formData });
    // TODO: Handle job creation
    alert(`Job ${jobNumber} created successfully!`);
    // Reset form and generate new job number
    setFormData({
      clientName: "",
      clientPhone: "",
      clientEmail: "",
      serviceType: "",
      quantity: "",
      deadline: "",
      paperType: "",
      paperSize: "",
      colors: "",
      specifications: "",
    });
    setJobNumber(generateJobNumber());
  };

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement>) => {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value,
    });
  };

  return (
    <DashboardLayout
      userRole="receptionist"
      userName="Reception Desk"
      notificationCount={6}
    >
      <div className="space-y-8 font-[family-name:var(--font-family-primary)]">
        {/* Header */}
        <div>
          <h1 className="text-2xl md:text-3xl font-bold text-secondary-100">
            Register New Job
          </h1>
          <p className="text-sm text-custom-700 mt-1">
            Create a new job card for customer order
          </p>
        </div>

        {/* Auto-generated Job Number */}
        <Card className="!p-4 bg-primary-50 border-2 border-primary-300">
          <div className="flex items-center gap-3">
            <HiOutlineClipboardList className="w-6 h-6 text-primary-600" />
            <div>
              <p className="text-xs font-semibold text-custom-700">Auto-Generated Job Number</p>
              <p className="text-2xl font-bold text-primary-600">{jobNumber}</p>
            </div>
          </div>
        </Card>

        <form onSubmit={handleSubmit} className="space-y-6">
          {/* Client Information */}
          <Card>
            <div className="flex items-center gap-2 mb-5">
              <HiOutlineUser className="w-5 h-5 text-primary-500" />
              <h2 className="font-bold text-secondary-100">Client Information</h2>
            </div>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-semibold text-secondary-100 mb-2">
                  Client Name *
                </label>
                <Input
                  name="clientName"
                  type="text"
                  placeholder="Enter client name"
                  value={formData.clientName}
                  onChange={handleChange}
                  required
                  fullWidth
                />
              </div>
              <div>
                <label className="block text-sm font-semibold text-secondary-100 mb-2">
                  Phone Number *
                </label>
                <Input
                  name="clientPhone"
                  type="tel"
                  placeholder="Enter phone number"
                  value={formData.clientPhone}
                  onChange={handleChange}
                  required
                  fullWidth
                />
              </div>
              <div className="md:col-span-2">
                <label className="block text-sm font-semibold text-secondary-100 mb-2">
                  Email Address
                </label>
                <Input
                  name="clientEmail"
                  type="email"
                  placeholder="Enter email address"
                  value={formData.clientEmail}
                  onChange={handleChange}
                  fullWidth
                />
              </div>
            </div>
          </Card>

          {/* Job Details */}
          <Card>
            <div className="flex items-center gap-2 mb-5">
              <HiOutlineClipboardList className="w-5 h-5 text-primary-500" />
              <h2 className="font-bold text-secondary-100">Job Details</h2>
            </div>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-semibold text-secondary-100 mb-2">
                  Service Type *
                </label>
                <select
                  name="serviceType"
                  value={formData.serviceType}
                  onChange={handleChange}
                  required
                  className="
                    w-full px-4 py-2.5 rounded-xl border border-custom-300
                    bg-style-500 text-secondary-100
                    focus:outline-none focus:border-primary-400 focus:ring-2 focus:ring-primary-200
                    transition-colors duration-200
                    font-[family-name:var(--font-family-primary)]
                  "
                >
                  <option value="">Select service</option>
                  <option value="offset-printing">Offset Printing</option>
                  <option value="digital-printing">Digital Printing</option>
                  <option value="binding">Binding</option>
                  <option value="composition">Composition</option>
                  <option value="packaging">Packaging</option>
                </select>
              </div>
              <div>
                <label className="block text-sm font-semibold text-secondary-100 mb-2">
                  Quantity *
                </label>
                <Input
                  name="quantity"
                  type="number"
                  placeholder="Enter quantity"
                  value={formData.quantity}
                  onChange={handleChange}
                  required
                  fullWidth
                />
              </div>
              <div>
                <label className="block text-sm font-semibold text-secondary-100 mb-2">
                  Deadline *
                </label>
                <Input
                  name="deadline"
                  type="date"
                  value={formData.deadline}
                  onChange={handleChange}
                  required
                  fullWidth
                />
              </div>
              <div>
                <label className="block text-sm font-semibold text-secondary-100 mb-2">
                  Paper Type
                </label>
                <Input
                  name="paperType"
                  type="text"
                  placeholder="e.g., 80gsm, Glossy"
                  value={formData.paperType}
                  onChange={handleChange}
                  fullWidth
                />
              </div>
              <div>
                <label className="block text-sm font-semibold text-secondary-100 mb-2">
                  Paper Size
                </label>
                <select
                  name="paperSize"
                  value={formData.paperSize}
                  onChange={handleChange}
                  className="
                    w-full px-4 py-2.5 rounded-xl border border-custom-300
                    bg-style-500 text-secondary-100
                    focus:outline-none focus:border-primary-400 focus:ring-2 focus:ring-primary-200
                    transition-colors duration-200
                    font-[family-name:var(--font-family-primary)]
                  "
                >
                  <option value="">Select size</option>
                  <option value="A4">A4</option>
                  <option value="A3">A3</option>
                  <option value="A5">A5</option>
                  <option value="Letter">Letter</option>
                  <option value="Custom">Custom</option>
                </select>
              </div>
              <div>
                <label className="block text-sm font-semibold text-secondary-100 mb-2">
                  Colors
                </label>
                <Input
                  name="colors"
                  type="text"
                  placeholder="e.g., Full Color, Black & White"
                  value={formData.colors}
                  onChange={handleChange}
                  fullWidth
                />
              </div>
              <div className="md:col-span-2">
                <label className="block text-sm font-semibold text-secondary-100 mb-2">
                  Additional Specifications
                </label>
                <textarea
                  name="specifications"
                  value={formData.specifications}
                  onChange={handleChange}
                  rows={4}
                  placeholder="Enter any additional requirements or notes..."
                  className="
                    w-full px-4 py-2.5 rounded-xl border border-custom-300
                    bg-style-500 text-secondary-100
                    focus:outline-none focus:border-primary-400 focus:ring-2 focus:ring-primary-200
                    transition-colors duration-200
                    font-[family-name:var(--font-family-primary)]
                    resize-none
                  "
                />
              </div>
            </div>
          </Card>

          {/* Action Buttons */}
          <div className="flex gap-3 justify-end">
            <Button type="button" variant="outline">
              Cancel
            </Button>
            <Button type="submit">
              Create Job
            </Button>
          </div>
        </form>
      </div>
    </DashboardLayout>
  );
}
