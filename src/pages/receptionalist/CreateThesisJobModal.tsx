import { useState } from "react";
import {
  HiOutlineDocumentText,
  HiOutlineMail,
  HiOutlinePhone,
  HiOutlineTrash,
  HiOutlineUpload,
  HiOutlineUser,
  HiOutlineX,
} from "react-icons/hi";
import { Button, Card } from "../../components/ui";
import type { JobPriority } from "../../store/services/jobsService";
import { useCreateJobMutation } from "../../store/services/jobsService";

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

const inputCls =
  "w-full px-4 py-2.5 rounded-xl border border-custom-400 bg-style-500 text-secondary-100 " +
  "focus:outline-none focus:border-primary-400 focus:ring-2 focus:ring-primary-200 " +
  "transition-colors duration-200 font-[family-name:var(--font-family-primary)] text-sm";

// ─── Component ────────────────────────────────────────────────────────────────

export default function CreateThesisJobModal({ onClose, onCreated }: Props) {
  const [createJob, { isLoading }] = useCreateJobMutation();

  // Thesis owner form
  const [thesisOwner, setThesisOwner] = useState({
    fullName: "",
    phone: "",
    email: "",
    description: "",
  });

  // Job details form
  const [form, setForm] = useState({
    quantity: "",
    bindingType: "",
    customBindingType: "",
    amount: "",
    priority: "normal" as JobPriority,
    dueDate: "",
    notes: "",
  });

  // File uploads
  const [files, setFiles] = useState<File[]>([]);
  const [fileError, setFileError] = useState("");

  // Validation errors
  const [errors, setErrors] = useState<Record<string, string>>({});

  // ─── Handlers ─────────────────────────────────────────────────────────────────

  const handleThesisOwnerChange = (field: string, value: string) => {
    setThesisOwner((prev) => ({ ...prev, [field]: value }));
    if (errors[field]) {
      setErrors((prev) => ({ ...prev, [field]: "" }));
    }
  };

  const handleFormChange = (field: string, value: string) => {
    setForm((prev) => ({ ...prev, [field]: value }));
    if (errors[field]) {
      setErrors((prev) => ({ ...prev, [field]: "" }));
    }
  };

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const selectedFiles = Array.from(e.target.files || []);

    // Validate file count
    if (files.length + selectedFiles.length > 10) {
      setFileError("Maximum 10 files allowed");
      return;
    }

    // Validate file types
    const allowedTypes = [
      "application/pdf",
      "application/msword",
      "application/vnd.openxmlformats-officedocument.wordprocessingml.document",
    ];

    const invalidFiles = selectedFiles.filter(
      (file) => !allowedTypes.includes(file.type),
    );

    if (invalidFiles.length > 0) {
      setFileError("Only PDF, DOC, and DOCX files are allowed");
      return;
    }

    setFiles((prev) => [...prev, ...selectedFiles]);
    setFileError("");
    e.target.value = ""; // Reset input
  };

  const handleRemoveFile = (index: number) => {
    setFiles((prev) => prev.filter((_, i) => i !== index));
    setFileError("");
  };

  const validate = (): boolean => {
    const newErrors: Record<string, string> = {};

    // Thesis owner validation
    if (!thesisOwner.fullName.trim()) {
      newErrors.fullName = "Full name is required";
    }

    if (!thesisOwner.phone.trim()) {
      newErrors.phone = "Phone number is required";
    } else if (
      !/^(\+250|0)?[7][0-9]{8}$/.test(thesisOwner.phone.replace(/\s/g, ""))
    ) {
      newErrors.phone =
        "Invalid phone format (e.g., +250788123456 or 0788123456)";
    }

    if (thesisOwner.email && !/^\S+@\S+\.\S+$/.test(thesisOwner.email)) {
      newErrors.email = "Invalid email format";
    }

    if (!thesisOwner.description.trim()) {
      newErrors.description = "Description is required";
    } else if (thesisOwner.description.trim().length < 10) {
      newErrors.description = "Description must be at least 10 characters";
    } else if (thesisOwner.description.trim().length > 1000) {
      newErrors.description = "Description must not exceed 1000 characters";
    }

    // Job details validation
    if (!form.quantity || Number(form.quantity) < 1) {
      newErrors.quantity = "Quantity is required and must be at least 1";
    }

    if (!form.bindingType.trim()) {
      newErrors.bindingType = "Binding type is required";
    } else if (form.bindingType === "Other" && !form.customBindingType.trim()) {
      newErrors.customBindingType = "Please specify the binding type";
    }

    if (!form.amount || Number(form.amount) < 0) {
      newErrors.amount = "Amount is required";
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = async () => {
    console.log("Submit clicked - starting validation");
    if (!validate()) {
      console.log("Validation failed, errors:", errors);
      return;
    }

    console.log("Validation passed, creating payload");
    try {
      // If no files, send as JSON
      if (files.length === 0) {
        const payload = {
          title: "Print & Binding of Thesis",
          isThesisJob: true,
          thesisOwner: {
            fullName: thesisOwner.fullName.trim(),
            phone: thesisOwner.phone.trim(),
            email: thesisOwner.email.trim() || undefined,
            description: thesisOwner.description.trim(),
          },
          quantity: Number(form.quantity),
          bindingType:
            form.bindingType === "Other"
              ? form.customBindingType
              : form.bindingType,
          amount: Number(form.amount),
          priority: form.priority,
          dueDate: form.dueDate
            ? new Date(form.dueDate).toISOString()
            : undefined,
          notes: form.notes.trim() || undefined,
        };

        console.log("Sending JSON payload:", JSON.stringify(payload, null, 2));
        const result = await createJob(payload as any).unwrap();
        console.log("Job created successfully:", result);
        onCreated();
        return;
      }

      // If files exist, send as FormData
      const formData = new FormData();

      // Mark as thesis job
      formData.append("title", "Print & Binding of Thesis");
      formData.append("isThesisJob", "true");

      // Thesis owner info - send as nested JSON string
      formData.append(
        "thesisOwner",
        JSON.stringify({
          fullName: thesisOwner.fullName.trim(),
          phone: thesisOwner.phone.trim(),
          email: thesisOwner.email.trim() || undefined,
          description: thesisOwner.description.trim(),
        }),
      );

      // Job details
      formData.append("quantity", form.quantity);
      formData.append(
        "bindingType",
        form.bindingType === "Other"
          ? form.customBindingType
          : form.bindingType,
      );
      formData.append("amount", form.amount);
      formData.append("priority", form.priority);

      if (form.dueDate) {
        formData.append("dueDate", new Date(form.dueDate).toISOString());
      }

      if (form.notes.trim()) {
        formData.append("notes", form.notes.trim());
      }

      // Upload files
      files.forEach((file) => {
        formData.append("documents", file);
      });

      console.log("FormData prepared, sending request...");
      console.log("FormData contents:");
      // @ts-ignore - FormData.entries() exists in modern browsers
      for (let pair of formData.entries()) {
        console.log(
          pair[0] +
            ": " +
            (pair[1] instanceof File ? `File: ${pair[1].name}` : pair[1]),
        );
      }

      const result = await createJob(formData).unwrap();
      console.log("Job created successfully:", result);
      onCreated();
    } catch (error: any) {
      console.error("Failed to create thesis job:", error);
      console.error("Error details:", JSON.stringify(error, null, 2));

      // Handle backend validation errors
      if (error?.data?.errors) {
        const backendErrors: Record<string, string> = {};
        error.data.errors.forEach((err: any) => {
          backendErrors[err.field] = err.message;
        });
        setErrors(backendErrors);
      } else if (error?.data?.message) {
        alert(`Error: ${error.data.message}`);
      } else if (error?.message) {
        alert(`Error: ${error.message}`);
      } else {
        alert(
          "Failed to create thesis job. Please check the console for details.",
        );
      }
    }
  };

  return (
    <div className="fixed inset-0 bg-secondary-100/60 backdrop-blur-sm z-50 flex items-start justify-center p-4 overflow-y-auto">
      <div className="w-full max-w-4xl my-8">
        <Card className="shadow-2xl">
          {/* Header */}
          <div className="flex items-center justify-between mb-6 pb-4 border-b border-custom-400">
            <h2 className="text-2xl font-semibold text-secondary-100">
              Create Thesis Job
            </h2>
            <button
              onClick={onClose}
              className="p-2 rounded-lg hover:bg-custom-400 transition-colors"
              disabled={isLoading}
            >
              <HiOutlineX className="w-6 h-6 text-secondary-200" />
            </button>
          </div>

          <div className="space-y-6 pb-4">
            {/* Thesis Owner Section */}
            <section className="space-y-4">
              <h3 className="text-lg font-medium text-secondary-100 flex items-center gap-2">
                <HiOutlineUser className="w-5 h-5" />
                Student/Owner Information
              </h3>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-secondary-100 mb-2">
                    Full Name <span className="text-danger-400">*</span>
                  </label>
                  <div className="relative">
                    <HiOutlineUser className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-secondary-300" />
                    <input
                      type="text"
                      value={thesisOwner.fullName}
                      onChange={(e) =>
                        handleThesisOwnerChange("fullName", e.target.value)
                      }
                      placeholder="Enter student full name"
                      className={`${inputCls} pl-11 ${errors.fullName ? "border-danger-400" : ""}`}
                      disabled={isLoading}
                    />
                  </div>
                  {errors.fullName && (
                    <p className="mt-1 text-sm text-danger-400">
                      {errors.fullName}
                    </p>
                  )}
                </div>

                <div>
                  <label className="block text-sm font-medium text-secondary-100 mb-2">
                    Phone Number <span className="text-danger-400">*</span>
                  </label>
                  <div className="relative">
                    <HiOutlinePhone className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-secondary-300" />
                    <input
                      type="tel"
                      value={thesisOwner.phone}
                      onChange={(e) =>
                        handleThesisOwnerChange("phone", e.target.value)
                      }
                      placeholder="+250788123456 or 0788123456"
                      maxLength={13}
                      className={`${inputCls} pl-11 ${errors.phone ? "border-danger-400" : ""}`}
                      disabled={isLoading}
                    />
                  </div>
                  {errors.phone && (
                    <p className="mt-1 text-sm text-danger-400">
                      {errors.phone}
                    </p>
                  )}
                </div>

                <div>
                  <label className="block text-sm font-medium text-secondary-100 mb-2">
                    Email (Optional)
                  </label>
                  <div className="relative">
                    <HiOutlineMail className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-secondary-300" />
                    <input
                      type="email"
                      value={thesisOwner.email}
                      onChange={(e) =>
                        handleThesisOwnerChange("email", e.target.value)
                      }
                      placeholder="student@example.com"
                      className={`${inputCls} pl-11 ${errors.email ? "border-danger-400" : ""}`}
                      disabled={isLoading}
                    />
                  </div>
                  {errors.email && (
                    <p className="mt-1 text-sm text-danger-400">
                      {errors.email}
                    </p>
                  )}
                </div>
              </div>

              <div>
                <label className="block text-sm font-medium text-secondary-100 mb-2">
                  Thesis Description <span className="text-danger-400">*</span>
                </label>
                <textarea
                  value={thesisOwner.description}
                  onChange={(e) =>
                    handleThesisOwnerChange("description", e.target.value)
                  }
                  placeholder="E.g., Master's thesis on AI - 150 pages, soft binding required"
                  rows={4}
                  minLength={10}
                  maxLength={1000}
                  className={`${inputCls} resize-none ${errors.description ? "border-danger-400" : ""}`}
                  disabled={isLoading}
                />
                <div className="flex justify-between items-center mt-1">
                  {errors.description ? (
                    <p className="text-sm text-danger-400">
                      {errors.description}
                    </p>
                  ) : (
                    <p className="text-sm text-secondary-300">
                      Minimum 10 characters
                    </p>
                  )}
                  <p className="text-sm text-secondary-300">
                    {thesisOwner.description.length}/1000
                  </p>
                </div>
              </div>
            </section>

            {/* File Upload Section */}
            <section className="space-y-4">
              <h3 className="text-lg font-medium text-secondary-100 flex items-center gap-2">
                <HiOutlineDocumentText className="w-5 h-5" />
                Upload Thesis Documents (Optional)
              </h3>

              <div className="border-2 border-dashed border-custom-400 rounded-xl p-6 text-center">
                <HiOutlineUpload className="w-12 h-12 mx-auto text-secondary-300 mb-3" />
                <p className="text-secondary-100 mb-2">
                  Drag and drop files here, or click to select
                </p>
                <p className="text-sm text-secondary-300 mb-4">
                  PDF, DOC, DOCX up to 10 files
                </p>
                <input
                  type="file"
                  accept=".pdf,.doc,.docx"
                  multiple
                  onChange={handleFileChange}
                  className="hidden"
                  id="file-upload"
                  disabled={isLoading || files.length >= 10}
                />
                <label htmlFor="file-upload">
                  <span
                    className={`inline-flex items-center justify-center gap-2 px-3 py-1.5 text-sm rounded-xl font-semibold border border-primary-500 text-primary-500 hover:bg-primary-50 active:bg-primary-100 transition-colors duration-200 cursor-pointer ${
                      isLoading || files.length >= 10
                        ? "opacity-50 cursor-not-allowed"
                        : ""
                    }`}
                  >
                    Select Files
                  </span>
                </label>
                {fileError && (
                  <p className="mt-2 text-sm text-danger-400">{fileError}</p>
                )}
              </div>

              {/* File List */}
              {files.length > 0 && (
                <div className="space-y-2">
                  <p className="text-sm font-medium text-secondary-100">
                    Selected Files ({files.length}/10)
                  </p>
                  {files.map((file, index) => (
                    <div
                      key={index}
                      className="flex items-center justify-between p-3 bg-custom-400/50 rounded-lg"
                    >
                      <div className="flex items-center gap-3 flex-1 min-w-0">
                        <HiOutlineDocumentText className="w-5 h-5 text-primary-400 flex-shrink-0" />
                        <div className="min-w-0 flex-1">
                          <p className="text-sm text-secondary-100 truncate">
                            {file.name}
                          </p>
                          <p className="text-xs text-secondary-300">
                            {(file.size / 1024).toFixed(1)} KB
                          </p>
                        </div>
                      </div>
                      <button
                        onClick={() => handleRemoveFile(index)}
                        className="p-1.5 rounded-lg hover:bg-danger-400/20 transition-colors flex-shrink-0"
                        disabled={isLoading}
                      >
                        <HiOutlineTrash className="w-4 h-4 text-danger-400" />
                      </button>
                    </div>
                  ))}
                </div>
              )}
            </section>

            {/* Job Details Section */}
            <section className="space-y-4">
              <h3 className="text-lg font-medium text-secondary-100">
                Job Details
              </h3>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-secondary-100 mb-2">
                    Number of Copies <span className="text-danger-400">*</span>
                  </label>
                  <input
                    type="number"
                    min="1"
                    value={form.quantity}
                    onChange={(e) =>
                      handleFormChange("quantity", e.target.value)
                    }
                    placeholder="Enter quantity"
                    className={`${inputCls} ${errors.quantity ? "border-danger-400" : ""}`}
                    disabled={isLoading}
                  />
                  {errors.quantity && (
                    <p className="mt-1 text-sm text-danger-400">
                      {errors.quantity}
                    </p>
                  )}
                </div>

                <div>
                  <label className="block text-sm font-medium text-secondary-100 mb-2">
                    Binding Type <span className="text-danger-400">*</span>
                  </label>
                  <select
                    value={form.bindingType}
                    onChange={(e) =>
                      handleFormChange("bindingType", e.target.value)
                    }
                    className={`${selectCls} ${errors.bindingType ? "border-danger-400" : ""}`}
                    disabled={isLoading}
                  >
                    <option value="">Select binding type</option>
                    <option value="Soft Cover">Soft Cover</option>
                    <option value="Hard Cover">Hard Cover</option>
                    <option value="Spiral">Spiral Binding</option>
                    <option value="Comb">Comb Binding</option>
                    <option value="Other">Other (Specify)</option>
                  </select>
                  {errors.bindingType && (
                    <p className="mt-1 text-sm text-danger-400">
                      {errors.bindingType}
                    </p>
                  )}
                </div>

                {form.bindingType === "Other" && (
                  <div className="md:col-span-2">
                    <label className="block text-sm font-medium text-secondary-100 mb-2">
                      Specify Binding Type{" "}
                      <span className="text-danger-400">*</span>
                    </label>
                    <input
                      type="text"
                      value={form.customBindingType}
                      onChange={(e) =>
                        handleFormChange("customBindingType", e.target.value)
                      }
                      placeholder="Enter custom binding type"
                      className={`${inputCls} ${errors.customBindingType ? "border-danger-400" : ""}`}
                      disabled={isLoading}
                    />
                    {errors.customBindingType && (
                      <p className="mt-1 text-sm text-danger-400">
                        {errors.customBindingType}
                      </p>
                    )}
                  </div>
                )}

                <div>
                  <label className="block text-sm font-medium text-secondary-100 mb-2">
                    Amount (RWF) <span className="text-danger-400">*</span>
                  </label>
                  <input
                    type="number"
                    min="0"
                    value={form.amount}
                    onChange={(e) => handleFormChange("amount", e.target.value)}
                    placeholder="Enter amount"
                    className={`${inputCls} ${errors.amount ? "border-danger-400" : ""}`}
                    disabled={isLoading}
                  />
                  {errors.amount && (
                    <p className="mt-1 text-sm text-danger-400">
                      {errors.amount}
                    </p>
                  )}
                </div>

                <div>
                  <label className="block text-sm font-medium text-secondary-100 mb-2">
                    Priority
                  </label>
                  <select
                    value={form.priority}
                    onChange={(e) =>
                      handleFormChange(
                        "priority",
                        e.target.value as JobPriority,
                      )
                    }
                    className={selectCls}
                    disabled={isLoading}
                  >
                    <option value="low">Low</option>
                    <option value="normal">Normal</option>
                    <option value="high">High</option>
                    <option value="urgent">Urgent</option>
                  </select>
                </div>

                <div>
                  <label className="block text-sm font-medium text-secondary-100 mb-2">
                    Due Date (Optional)
                  </label>
                  <input
                    type="date"
                    value={form.dueDate}
                    onChange={(e) =>
                      handleFormChange("dueDate", e.target.value)
                    }
                    min={new Date().toISOString().split("T")[0]}
                    className={inputCls}
                    disabled={isLoading}
                  />
                </div>
              </div>

              <div>
                <label className="block text-sm font-medium text-secondary-100 mb-2">
                  Additional Notes (Optional)
                </label>
                <textarea
                  value={form.notes}
                  onChange={(e) => handleFormChange("notes", e.target.value)}
                  placeholder="Any additional instructions or notes"
                  rows={3}
                  className={`${inputCls} resize-none`}
                  disabled={isLoading}
                />
              </div>
            </section>
          </div>

          {/* Footer Actions */}
          <div className="flex items-center justify-end gap-3 mt-6 pt-4 border-t border-custom-400">
            <Button variant="outline" onClick={onClose} disabled={isLoading}>
              Cancel
            </Button>
            <Button
              variant="primary"
              onClick={handleSubmit}
              disabled={isLoading}
            >
              {isLoading ? "Creating..." : "Create Thesis Job"}
            </Button>
          </div>
        </Card>
      </div>
    </div>
  );
}
