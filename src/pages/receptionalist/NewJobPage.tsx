import { useEffect, useState } from "react";
import {
  HiOutlineClipboardList,
  HiOutlineUser
} from "react-icons/hi";
import { DashboardLayout, WorkflowRulesEngine, WorkflowValidator } from "../../components";
import { Button, Card, Input } from "../../components/ui";
import { useWorkflowValidation } from "../../hooks/useWorkflowValidation";

// Auto-generate client ID
const generateClientId = () => {
  const date = new Date();
  const year = date.getFullYear();
  const month = String(date.getMonth() + 1).padStart(2, "0");
  const day = String(date.getDate()).padStart(2, "0");
  const random = Math.floor(Math.random() * 1000).toString().padStart(3, "0");
  return `CLT-${year}${month}${day}-${random}`;
};

export default function NewJobPage() {
  const [generatedId, setGeneratedId] = useState("");
  const [formData, setFormData] = useState({
    clientName: "",
    clientPhone: "",
    clientEmail: "",
    visitType: "", // business, visit, delivery, payment
  });
  
  const { getStepByType, validateRequiredFields } = useWorkflowValidation();
  const receptionistStep = getStepByType("receptionist");

  // Generate appropriate ID when visit type changes
  useEffect(() => {
    if (formData.visitType === "business" || formData.visitType === "visit") {
      // Both business and visit clients get Client IDs and go to Sales/Marketing
      setGeneratedId(generateClientId());
    } else if (formData.visitType === "delivery") {
      setGeneratedId(`DEL-${new Date().getFullYear()}${String(new Date().getMonth() + 1).padStart(2, "0")}${String(new Date().getDate()).padStart(2, "0")}-${Math.floor(Math.random() * 1000).toString().padStart(3, "0")}`);
    } else if (formData.visitType === "payment") {
      setGeneratedId(`PAY-${new Date().getFullYear()}${String(new Date().getMonth() + 1).padStart(2, "0")}${String(new Date().getDate()).padStart(2, "0")}-${Math.floor(Math.random() * 1000).toString().padStart(3, "0")}`);
    } else {
      setGeneratedId("");
    }
  }, [formData.visitType]);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    
    // Validate workflow requirements
    if (receptionistStep) {
      const validation = validateRequiredFields(receptionistStep.id, {
        customerName: formData.clientName,
        contactInfo: formData.clientPhone,
        serviceType: formData.visitType,
      });
      
      if (!validation.valid) {
        alert(`Missing required fields: ${validation.missingFields.join(", ")}`);
        return;
      }
    }
    
    console.log("New client/job submitted:", { generatedId, ...formData });
    
    // Handle different visit types
    if (formData.visitType === "visit") {
      // Visit client - Auto-assign to Sales/Marketing for consultation
      alert(`Client ${formData.clientName} (ID: ${generatedId}) registered and assigned to Sales/Marketing for consultation!`);
      console.log("Visit client assigned to Sales/Marketing");
    } else if (formData.visitType === "business") {
      // Business client - Auto-assign to Sales/Marketing to create job details
      alert(`Client ${formData.clientName} (ID: ${generatedId}) registered and assigned to Sales/Marketing! Sales will create job details and assign to Production Manager.`);
      console.log("Business client assigned to Sales/Marketing for job creation");
    } else if (formData.visitType === "delivery") {
      alert(`Delivery ${generatedId} recorded for ${formData.clientName}!`);
      console.log("Delivery recorded");
    } else if (formData.visitType === "payment") {
      alert(`Payment ${generatedId} recorded for ${formData.clientName}!`);
      console.log("Payment recorded");
    }
    
    // Reset form
    setFormData({
      clientName: "",
      clientPhone: "",
      clientEmail: "",
      visitType: "",
    });
    setGeneratedId("");
  };

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement>) => {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value,
    });
  };

  // Prepare data for workflow validation
  const workflowData = {
    customerName: formData.clientName,
    contactInfo: formData.clientPhone,
    serviceType: formData.visitType,
    urgency: "normal",
  };

  return (
    <DashboardLayout
      userRole="receptionist"
      userName="Reception Desk"
      notificationCount={6}
    >
      {/* Workflow Rules Engine - runs in background */}
      {receptionistStep && (
        <WorkflowRulesEngine
          stepId={receptionistStep.id}
          data={workflowData}
          onRuleTriggered={(action, ruleName) => {
            console.log(`Rule triggered: ${ruleName}`, action);
          }}
          checkGlobalRules
        />
      )}
      
      <div className="space-y-8 font-[family-name:var(--font-family-primary)]">
        {/* Header */}
        <div>
          <h1 className="text-2xl md:text-3xl font-bold text-secondary-100">
            Register Client Visit
          </h1>
          <p className="text-sm text-custom-700 mt-1">
            Record client information and visit type
          </p>
          {receptionistStep && (
            <p className="text-xs text-custom-600 mt-1">
              Workflow Step: {receptionistStep.name} • Required fields: {receptionistStep.requiredFields.join(", ")}
            </p>
          )}
        </div>

        {/* Auto-generated ID - Only show when visit type is selected */}
        {generatedId && (
          <Card className="!p-4 bg-primary-50 border-2 border-primary-300">
            <div className="flex items-center gap-3">
              <HiOutlineClipboardList className="w-6 h-6 text-primary-600" />
              <div>
                <p className="text-xs font-semibold text-custom-700">
                  {(formData.visitType === "business" || formData.visitType === "visit") && "Auto-Generated Client ID"}
                  {formData.visitType === "delivery" && "Auto-Generated Delivery ID"}
                  {formData.visitType === "payment" && "Auto-Generated Payment ID"}
                </p>
                <p className="text-2xl font-bold text-primary-600">{generatedId}</p>
                <p className="text-xs text-custom-600 mt-1">
                  {formData.visitType === "business" && "Client will be assigned to Sales/Marketing → Sales creates job details → Assigns to Production Manager"}
                  {formData.visitType === "visit" && "Client will be assigned to Sales/Marketing for consultation"}
                  {formData.visitType === "delivery" && "Delivery tracking number"}
                  {formData.visitType === "payment" && "Payment reference number"}
                </p>
              </div>
            </div>
          </Card>
        )}

        <form onSubmit={handleSubmit} className="space-y-6">
          {/* Client Information */}
          <Card>
            <div className="flex items-center gap-2 mb-5">
              <HiOutlineUser className="w-5 h-5 text-primary-500" />
              <h2 className="font-bold text-secondary-100">Client Information</h2>
            </div>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="md:col-span-2">
                <label className="block text-sm font-semibold text-secondary-100 mb-2">
                  Visit Type *
                </label>
                <select
                  name="visitType"
                  value={formData.visitType}
                  onChange={handleChange}
                  required
                  className="
                    w-full px-4 py-2.5 rounded-xl border-2 border-primary-300
                    bg-style-500 text-secondary-100
                    focus:outline-none focus:border-primary-500 focus:ring-2 focus:ring-primary-200
                    transition-colors duration-200
                    font-[family-name:var(--font-family-primary)]
                    font-semibold
                  "
                >
                  <option value="">Select visit type</option>
                  <option value="business">Business (New Job/Order)</option>
                  <option value="visit">Visit (Inquiry/Consultation)</option>
                  <option value="delivery">Delivery</option>
                  <option value="payment">Payment</option>
                </select>
                <p className="text-xs text-custom-600 mt-1">
                  {formData.visitType === "business" && "✓ Client will be assigned to Sales/Marketing to create job details"}
                  {formData.visitType === "visit" && "⚠️ Client will be assigned to Sales/Marketing for consultation"}
                  {formData.visitType === "delivery" && "✓ Delivery will be recorded"}
                  {formData.visitType === "payment" && "✓ Payment will be recorded"}
                </p>
              </div>
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

          {/* Workflow Validation */}
          {receptionistStep && (
            <WorkflowValidator
              stepId={receptionistStep.id}
              data={workflowData}
              showErrors={false}
            />
          )}

          {/* Action Buttons */}
          <div className="flex gap-3 justify-end">
            <Button type="button" variant="outline">
              Cancel
            </Button>
            <Button 
              type="submit"
              disabled={!formData.visitType || !formData.clientName || !formData.clientPhone}
            >
              {formData.visitType === "visit" ? "Register & Assign to Sales" : 
               formData.visitType === "business" ? "Register & Assign to Sales" :
               formData.visitType === "delivery" ? "Record Delivery" :
               formData.visitType === "payment" ? "Record Payment" : "Submit"}
            </Button>
          </div>
        </form>
      </div>
    </DashboardLayout>
  );
}
