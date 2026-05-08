import { useEffect, useState } from "react";
import {
  HiOutlineCalendar,
  HiOutlineClipboardList,
  HiOutlineExclamationCircle,
  HiOutlineEye,
  HiOutlineFilter,
  HiOutlinePencil,
  HiOutlineSearch,
  HiOutlineTrash,
  HiOutlineUser,
  HiOutlineX
} from "react-icons/hi";
import { DashboardLayout } from "../../components";
import { Button, Card, Input } from "../../components/ui";

interface Job {
  id: string;
  jobNumber: string;
  title: string;
  clientName: string;
  status: string;
  priority: string;
  currentDepartment: string;
  assignedTo: string;
  deadline: string;
  createdAt: string;
  estimatedCost: number;
}

const mockJobs: Job[] = [
  {
    id: "1",
    jobNumber: "JOB-2026-001",
    title: "Business Cards Printing",
    clientName: "ABC Corp",
    status: "in-printing",
    priority: "High",
    currentDepartment: "printing",
    assignedTo: "John Worker",
    deadline: "2026-05-10",
    createdAt: "2026-05-01",
    estimatedCost: 250.0,
  },
  {
    id: "2",
    jobNumber: "JOB-2026-002",
    title: "Brochure Design & Print",
    clientName: "XYZ Ltd",
    status: "in-composition",
    priority: "Medium",
    currentDepartment: "composition",
    assignedTo: "Jane Designer",
    deadline: "2026-05-15",
    createdAt: "2026-05-02",
    estimatedCost: 500.0,
  },
  {
    id: "3",
    jobNumber: "JOB-2026-003",
    title: "Annual Report Binding",
    clientName: "Gov Office",
    status: "in-binding",
    priority: "Urgent",
    currentDepartment: "binding",
    assignedTo: "Mike Binder",
    deadline: "2026-05-08",
    createdAt: "2026-04-28",
    estimatedCost: 1200.0,
  },
  {
    id: "4",
    jobNumber: "JOB-2026-004",
    title: "Flyers Printing",
    clientName: "School A",
    status: "completed",
    priority: "Low",
    currentDepartment: "packaging",
    assignedTo: "Sarah Packager",
    deadline: "2026-05-05",
    createdAt: "2026-04-25",
    estimatedCost: 150.0,
  },
  {
    id: "5",
    jobNumber: "JOB-2026-005",
    title: "Banner Production",
    clientName: "Hotel C",
    status: "pending",
    priority: "Medium",
    currentDepartment: "",
    assignedTo: "",
    deadline: "2026-05-20",
    createdAt: "2026-05-05",
    estimatedCost: 800.0,
  },
];

// Auto-generate job number
const generateJobNumber = () => {
  const date = new Date();
  const year = date.getFullYear();
  const month = String(date.getMonth() + 1).padStart(2, "0");
  const day = String(date.getDate()).padStart(2, "0");
  const random = Math.floor(Math.random() * 1000).toString().padStart(3, "0");
  return `JOB-${year}${month}${day}-${random}`;
};

// Calculate time remaining until deadline
const getDeadlineInfo = (deadline: string) => {
  const now = new Date();
  const deadlineDate = new Date(deadline);
  const diffMs = deadlineDate.getTime() - now.getTime();
  const diffHours = Math.floor(diffMs / (1000 * 60 * 60));
  const diffDays = Math.floor(diffHours / 24);

  if (diffMs < 0) {
    // Overdue
    const overdueDays = Math.abs(diffDays);
    const overdueHours = Math.abs(diffHours) % 24;
    return {
      text: overdueDays > 0 
        ? `${overdueDays}d overdue` 
        : `${overdueHours}h overdue`,
      color: "text-red-600",
      bgColor: "bg-red-50",
      isOverdue: true,
    };
  } else if (diffHours < 24) {
    // Less than 24 hours
    return {
      text: `${diffHours}h left`,
      color: "text-orange-600",
      bgColor: "bg-orange-50",
      isOverdue: false,
    };
  } else if (diffDays <= 3) {
    // 1-3 days
    return {
      text: `${diffDays}d left`,
      color: "text-yellow-600",
      bgColor: "bg-yellow-50",
      isOverdue: false,
    };
  } else {
    // More than 3 days
    return {
      text: `${diffDays}d left`,
      color: "text-green-600",
      bgColor: "bg-green-50",
      isOverdue: false,
    };
  }
};

export default function JobManagementPage() {
  const [jobs, setJobs] = useState<Job[]>(mockJobs);
  const [searchQuery, setSearchQuery] = useState("");
  const [filterStatus, setFilterStatus] = useState("all");
  const [filterPriority, setFilterPriority] = useState("all");
  const [filterDepartment, setFilterDepartment] = useState("all");
  const [showFilterModal, setShowFilterModal] = useState(false);
  const [showCreateModal, setShowCreateModal] = useState(false);
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
    priority: "Medium",
    estimatedCost: "",
  });

  useEffect(() => {
    if (showCreateModal) {
      setJobNumber(generateJobNumber());
    }
  }, [showCreateModal]);

  const handleCreateJob = (e: React.FormEvent) => {
    e.preventDefault();
    
    // Create new job object
    const newJob: Job = {
      id: String(jobs.length + 1),
      jobNumber: jobNumber,
      title: `${formData.serviceType} - ${formData.clientName}`,
      clientName: formData.clientName,
      status: "pending",
      priority: formData.priority,
      currentDepartment: "",
      assignedTo: "",
      deadline: formData.deadline,
      createdAt: new Date().toISOString().split('T')[0],
      estimatedCost: parseFloat(formData.estimatedCost) || 0,
    };

    // Add to jobs list
    setJobs([newJob, ...jobs]);

    // Show success message
    alert(`Job ${jobNumber} created successfully!`);

    // Reset form and close modal
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
      priority: "Medium",
      estimatedCost: "",
    });
    setShowCreateModal(false);
  };

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement>) => {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value,
    });
  };

  const filteredJobs = jobs.filter((job) => {
    const matchesSearch =
      searchQuery === "" ||
      job.jobNumber.toLowerCase().includes(searchQuery.toLowerCase()) ||
      job.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
      job.clientName.toLowerCase().includes(searchQuery.toLowerCase());

    const matchesStatus = filterStatus === "all" || job.status === filterStatus;
    const matchesPriority = filterPriority === "all" || job.priority === filterPriority;
    const matchesDepartment =
      filterDepartment === "all" || job.currentDepartment === filterDepartment;

    return matchesSearch && matchesStatus && matchesPriority && matchesDepartment;
  });

  const statusColors: Record<string, string> = {
    pending: "bg-gray-100 text-gray-700",
    confirmed: "bg-blue-100 text-blue-700",
    "in-composition": "bg-purple-100 text-purple-700",
    "in-montage": "bg-indigo-100 text-indigo-700",
    "in-printing": "bg-cyan-100 text-cyan-700",
    "in-binding": "bg-teal-100 text-teal-700",
    "in-packaging": "bg-green-100 text-green-700",
    "quality-check": "bg-yellow-100 text-yellow-700",
    "ready-for-delivery": "bg-orange-100 text-orange-700",
    delivered: "bg-pink-100 text-pink-700",
    completed: "bg-green-100 text-green-700",
  };

  const priorityColors: Record<string, string> = {
    Low: "bg-green-500 text-white",
    Medium: "bg-yellow-500 text-white",
    High: "bg-orange-500 text-white",
    Urgent: "bg-red-500 text-white",
  };

  const activeFilterCount =
    (filterStatus !== "all" ? 1 : 0) +
    (filterPriority !== "all" ? 1 : 0) +
    (filterDepartment !== "all" ? 1 : 0);

  return (
    <DashboardLayout userRole="admin" userName="Admin" notificationCount={0}>
      <div className="space-y-6 font-[family-name:var(--font-family-primary)]">
        {/* Header */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
          <div>
            <h1 className="text-2xl md:text-3xl font-bold text-secondary-100">
              Job Management
            </h1>
            <p className="text-sm text-custom-700 mt-1">
              View and manage all jobs across the system
            </p>
          </div>
          <Button 
            onClick={() => setShowCreateModal(true)}
            className="self-start sm:self-auto"
          >
            Create New Job
          </Button>
        </div>

        {/* Search and Filters */}
        <div className="flex flex-col sm:flex-row gap-3">
          <div className="flex-1 relative">
            <HiOutlineSearch className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-custom-700" />
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="Search by job number, title, or client..."
              className="w-full pl-10 pr-4 py-2 rounded-xl border border-custom-300 focus:outline-none focus:border-primary-500"
            />
          </div>
          <button
            onClick={() => setShowFilterModal(true)}
            className="flex items-center gap-2 px-4 py-2 rounded-xl border border-custom-300 hover:bg-custom-100 transition-colors relative"
          >
            <HiOutlineFilter className="w-4 h-4" />
            <span className="text-sm font-semibold">Filters</span>
            {activeFilterCount > 0 && (
              <span className="absolute -top-1 -right-1 w-5 h-5 rounded-full bg-primary-500 text-white text-xs flex items-center justify-center font-bold">
                {activeFilterCount}
              </span>
            )}
          </button>
        </div>

        {/* Stats */}
        <div className="grid grid-cols-2 sm:grid-cols-5 gap-4">
          <Card className="!p-4">
            <p className="text-xs text-custom-700 mb-1">Total Jobs</p>
            <p className="text-2xl font-bold text-secondary-100">{jobs.length}</p>
          </Card>
          <Card className="!p-4">
            <p className="text-xs text-custom-700 mb-1">Active</p>
            <p className="text-2xl font-bold text-blue-600">
              {jobs.filter((j) => !["completed", "delivered"].includes(j.status)).length}
            </p>
          </Card>
          <Card className="!p-4">
            <p className="text-xs text-custom-700 mb-1">Delayed</p>
            <p className="text-2xl font-bold text-red-600">
              {jobs.filter((j) => {
                const deadlineInfo = getDeadlineInfo(j.deadline);
                return deadlineInfo.isOverdue && !["completed", "delivered"].includes(j.status);
              }).length}
            </p>
          </Card>
          <Card className="!p-4">
            <p className="text-xs text-custom-700 mb-1">Urgent</p>
            <p className="text-2xl font-bold text-orange-600">
              {jobs.filter((j) => j.priority === "Urgent").length}
            </p>
          </Card>
          <Card className="!p-4">
            <p className="text-xs text-custom-700 mb-1">Completed</p>
            <p className="text-2xl font-bold text-green-600">
              {jobs.filter((j) => j.status === "completed").length}
            </p>
          </Card>
        </div>

        {/* Jobs Table */}
        <Card className="!p-0 overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead className="bg-custom-100 border-b border-custom-300">
                <tr>
                  <th className="px-4 py-3 text-left text-xs font-bold text-secondary-100 uppercase">
                    Job Number
                  </th>
                  <th className="px-4 py-3 text-left text-xs font-bold text-secondary-100 uppercase">
                    Title & Client
                  </th>
                  <th className="px-4 py-3 text-left text-xs font-bold text-secondary-100 uppercase">
                    Status
                  </th>
                  <th className="px-4 py-3 text-left text-xs font-bold text-secondary-100 uppercase">
                    Priority
                  </th>
                  <th className="px-4 py-3 text-left text-xs font-bold text-secondary-100 uppercase">
                    Department
                  </th>
                  <th className="px-4 py-3 text-left text-xs font-bold text-secondary-100 uppercase">
                    Assigned To
                  </th>
                  <th className="px-4 py-3 text-left text-xs font-bold text-secondary-100 uppercase">
                    Deadline
                  </th>
                  <th className="px-4 py-3 text-right text-xs font-bold text-secondary-100 uppercase">
                    Actions
                  </th>
                </tr>
              </thead>
              <tbody className="bg-white divide-y divide-custom-200">
                {filteredJobs.length === 0 ? (
                  <tr>
                    <td colSpan={8} className="px-4 py-8 text-center text-custom-700">
                      No jobs found
                    </td>
                  </tr>
                ) : (
                  filteredJobs.map((job) => (
                    <tr key={job.id} className="hover:bg-custom-50 transition-colors">
                      <td className="px-4 py-4">
                        <span className="text-sm font-bold text-primary-600">
                          {job.jobNumber}
                        </span>
                      </td>
                      <td className="px-4 py-4">
                        <div>
                          <p className="text-sm font-semibold text-secondary-100">
                            {job.title}
                          </p>
                          <p className="text-xs text-custom-700">{job.clientName}</p>
                        </div>
                      </td>
                      <td className="px-4 py-4">
                        <span
                          className={`px-3 py-1 rounded-full text-xs font-semibold ${
                            statusColors[job.status] || "bg-gray-100 text-gray-700"
                          }`}
                        >
                          {job.status}
                        </span>
                      </td>
                      <td className="px-4 py-4">
                        <span
                          className={`px-3 py-1 rounded-full text-xs font-bold ${
                            priorityColors[job.priority] || "bg-gray-500 text-white"
                          }`}
                        >
                          {job.priority}
                        </span>
                      </td>
                      <td className="px-4 py-4">
                        <span className="text-sm text-secondary-100">
                          {job.currentDepartment || "-"}
                        </span>
                      </td>
                      <td className="px-4 py-4">
                        <span className="text-sm text-secondary-100">
                          {job.assignedTo || "Unassigned"}
                        </span>
                      </td>
                      <td className="px-4 py-4">
                        <div className="space-y-1">
                          <div className="flex items-center gap-1 text-sm text-custom-700">
                            <HiOutlineCalendar className="w-4 h-4" />
                            {job.deadline}
                          </div>
                          {(() => {
                            const deadlineInfo = getDeadlineInfo(job.deadline);
                            return (
                              <div className={`inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-xs font-semibold ${deadlineInfo.color} ${deadlineInfo.bgColor}`}>
                                {deadlineInfo.isOverdue && (
                                  <HiOutlineExclamationCircle className="w-3 h-3" />
                                )}
                                {deadlineInfo.text}
                              </div>
                            );
                          })()}
                        </div>
                      </td>
                      <td className="px-4 py-4">
                        <div className="flex items-center justify-end gap-2">
                          <button
                            className="p-2 rounded-lg border border-custom-300 hover:bg-custom-100 transition-colors"
                            title="View Details"
                          >
                            <HiOutlineEye className="w-4 h-4 text-custom-700" />
                          </button>
                          <button
                            className="p-2 rounded-lg border border-custom-300 hover:bg-custom-100 transition-colors"
                            title="Edit Job"
                          >
                            <HiOutlinePencil className="w-4 h-4 text-custom-700" />
                          </button>
                          <button
                            className="p-2 rounded-lg border border-red-300 hover:bg-red-50 transition-colors"
                            title="Delete Job"
                          >
                            <HiOutlineTrash className="w-4 h-4 text-red-600" />
                          </button>
                        </div>
                      </td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>
        </Card>

        {/* Filter Modal */}
        {showFilterModal && (
          <div className="fixed inset-0 bg-secondary-100/50 z-50 flex items-center justify-center p-4">
            <Card className="!p-6 max-w-md w-full">
              <div className="flex items-center justify-between mb-4">
                <h3 className="text-xl font-bold text-secondary-100">Filter Jobs</h3>
                <button
                  onClick={() => setShowFilterModal(false)}
                  className="text-custom-700 hover:text-secondary-100"
                >
                  <HiOutlineX className="w-6 h-6" />
                </button>
              </div>

              <div className="space-y-4">
                <div>
                  <label className="block text-sm font-semibold text-custom-700 mb-2">
                    Status
                  </label>
                  <select
                    value={filterStatus}
                    onChange={(e) => setFilterStatus(e.target.value)}
                    className="w-full px-4 py-2 rounded-xl border border-custom-300 focus:outline-none focus:border-primary-500"
                  >
                    <option value="all">All Statuses</option>
                    <option value="pending">Pending</option>
                    <option value="confirmed">Confirmed</option>
                    <option value="in-composition">In Composition</option>
                    <option value="in-montage">In Montage</option>
                    <option value="in-printing">In Printing</option>
                    <option value="in-binding">In Binding</option>
                    <option value="in-packaging">In Packaging</option>
                    <option value="quality-check">Quality Check</option>
                    <option value="ready-for-delivery">Ready for Delivery</option>
                    <option value="delivered">Delivered</option>
                    <option value="completed">Completed</option>
                  </select>
                </div>

                <div>
                  <label className="block text-sm font-semibold text-custom-700 mb-2">
                    Priority
                  </label>
                  <select
                    value={filterPriority}
                    onChange={(e) => setFilterPriority(e.target.value)}
                    className="w-full px-4 py-2 rounded-xl border border-custom-300 focus:outline-none focus:border-primary-500"
                  >
                    <option value="all">All Priorities</option>
                    <option value="Low">Low</option>
                    <option value="Medium">Medium</option>
                    <option value="High">High</option>
                    <option value="Urgent">Urgent</option>
                  </select>
                </div>

                <div>
                  <label className="block text-sm font-semibold text-custom-700 mb-2">
                    Department
                  </label>
                  <select
                    value={filterDepartment}
                    onChange={(e) => setFilterDepartment(e.target.value)}
                    className="w-full px-4 py-2 rounded-xl border border-custom-300 focus:outline-none focus:border-primary-500"
                  >
                    <option value="all">All Departments</option>
                    <option value="composition">Composition</option>
                    <option value="montage">Montage</option>
                    <option value="printing">Printing</option>
                    <option value="binding">Binding</option>
                    <option value="packaging">Packaging</option>
                  </select>
                </div>
              </div>

              <div className="flex gap-3 mt-6">
                <Button
                  variant="outline"
                  onClick={() => {
                    setFilterStatus("all");
                    setFilterPriority("all");
                    setFilterDepartment("all");
                  }}
                  fullWidth
                >
                  Reset
                </Button>
                <Button onClick={() => setShowFilterModal(false)} fullWidth>
                  Apply Filters
                </Button>
              </div>
            </Card>
          </div>
        )}

        {/* Create Job Modal */}
        {showCreateModal && (
          <div className="fixed inset-0 bg-secondary-100/50 z-50 flex items-start justify-center p-4 overflow-y-auto">
            <Card className="!p-6 max-w-3xl w-full my-8 max-h-[90vh] overflow-y-auto">
              <div className="flex items-center justify-between mb-6">
                <h3 className="text-xl font-bold text-secondary-100">Create New Job</h3>
                <button
                  onClick={() => setShowCreateModal(false)}
                  className="text-custom-700 hover:text-secondary-100"
                >
                  <HiOutlineX className="w-6 h-6" />
                </button>
              </div>

              {/* Auto-generated Job Number */}
              <div className="mb-6 p-4 bg-primary-50 border-2 border-primary-300 rounded-xl">
                <div className="flex items-center gap-3">
                  <HiOutlineClipboardList className="w-6 h-6 text-primary-600" />
                  <div>
                    <p className="text-xs font-semibold text-custom-700">Auto-Generated Job Number</p>
                    <p className="text-2xl font-bold text-primary-600">{jobNumber}</p>
                  </div>
                </div>
              </div>

              <form onSubmit={handleCreateJob} className="space-y-6">
                {/* Client Information */}
                <div>
                  <div className="flex items-center gap-2 mb-4">
                    <HiOutlineUser className="w-5 h-5 text-primary-500" />
                    <h4 className="font-bold text-secondary-100">Client Information</h4>
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
                </div>

                {/* Job Details */}
                <div>
                  <div className="flex items-center gap-2 mb-4">
                    <HiOutlineClipboardList className="w-5 h-5 text-primary-500" />
                    <h4 className="font-bold text-secondary-100">Job Details</h4>
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
                        className="w-full px-4 py-2.5 rounded-xl border border-custom-300 bg-style-500 text-secondary-100 focus:outline-none focus:border-primary-400 focus:ring-2 focus:ring-primary-200 transition-colors duration-200 font-[family-name:var(--font-family-primary)]"
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
                        Priority *
                      </label>
                      <select
                        name="priority"
                        value={formData.priority}
                        onChange={handleChange}
                        required
                        className="w-full px-4 py-2.5 rounded-xl border border-custom-300 bg-style-500 text-secondary-100 focus:outline-none focus:border-primary-400 focus:ring-2 focus:ring-primary-200 transition-colors duration-200 font-[family-name:var(--font-family-primary)]"
                      >
                        <option value="Low">Low</option>
                        <option value="Medium">Medium</option>
                        <option value="High">High</option>
                        <option value="Urgent">Urgent</option>
                      </select>
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
                        className="w-full px-4 py-2.5 rounded-xl border border-custom-300 bg-style-500 text-secondary-100 focus:outline-none focus:border-primary-400 focus:ring-2 focus:ring-primary-200 transition-colors duration-200 font-[family-name:var(--font-family-primary)]"
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
                    <div>
                      <label className="block text-sm font-semibold text-secondary-100 mb-2">
                        Estimated Cost (RWF) *
                      </label>
                      <Input
                        name="estimatedCost"
                        type="number"
                        placeholder="Enter estimated cost"
                        value={formData.estimatedCost}
                        onChange={handleChange}
                        required
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
                        className="w-full px-4 py-2.5 rounded-xl border border-custom-300 bg-style-500 text-secondary-100 focus:outline-none focus:border-primary-400 focus:ring-2 focus:ring-primary-200 transition-colors duration-200 font-[family-name:var(--font-family-primary)] resize-none"
                      />
                    </div>
                  </div>
                </div>

                {/* Action Buttons */}
                <div className="flex gap-3 justify-end pt-4 border-t border-custom-300">
                  <Button 
                    type="button" 
                    variant="outline"
                    onClick={() => setShowCreateModal(false)}
                  >
                    Cancel
                  </Button>
                  <Button type="submit">
                    Create Job
                  </Button>
                </div>
              </form>
            </Card>
          </div>
        )}
      </div>
    </DashboardLayout>
  );
}
