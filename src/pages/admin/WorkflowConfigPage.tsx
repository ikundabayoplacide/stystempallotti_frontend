import { useState } from "react";
import {
    HiOutlineAdjustments,
    HiOutlineCheckCircle,
    HiOutlineChevronDown,
    HiOutlineChevronUp,
    HiOutlineCog,
    HiOutlineExclamationCircle,
    HiOutlinePlus,
    HiOutlineRefresh,
    HiOutlineSave,
    HiOutlineTrash,
} from "react-icons/hi";
import { DashboardLayout } from "../../components";
import { Button, Card } from "../../components/ui";
import { useWorkflow } from "../../context/WorkflowContext";
import { type WorkflowStepConfig } from "../../types/Workflow";

export default function WorkflowConfigPage() {
  const { workflowConfig, updateWorkflowConfig, resetToDefault } = useWorkflow();
  const [expandedStep, setExpandedStep] = useState<string | null>(null);
  const [hasChanges, setHasChanges] = useState(false);

  const toggleStep = (stepId: string) => {
    setExpandedStep(expandedStep === stepId ? null : stepId);
  };

  const toggleStepEnabled = (stepId: string) => {
    const updatedSteps = workflowConfig.steps.map((step) =>
      step.id === stepId ? { ...step, enabled: !step.enabled } : step
    );
    updateWorkflowConfig({ ...workflowConfig, steps: updatedSteps });
    setHasChanges(true);
  };

  const handleSave = () => {
    // In production, this would call an API
    alert("Workflow configuration saved successfully!");
    setHasChanges(false);
  };

  const handleReset = () => {
    if (confirm("Are you sure you want to reset to default workflow? This cannot be undone.")) {
      resetToDefault();
      setHasChanges(false);
    }
  };

  const getStepIcon = (type: string) => {
    switch (type) {
      case "receptionist":
        return "👋";
      case "sales":
        return "💼";
      case "production-manager":
        return "📋";
      case "stock-manager":
        return "📦";
      case "department":
        return "🏭";
      case "worker":
        return "👷";
      case "supervisor":
        return "👨‍💼";
      case "daf":
        return "💰";
      case "accountant":
        return "🧾";
      case "delivery":
        return "🚚";
      default:
        return "⚙️";
    }
  };

  return (
    <DashboardLayout userRole="admin" userName="Admin" notificationCount={3}>
      <div className="space-y-6 font-[family-name:var(--font-family-primary)]">
        {/* Header */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
          <div>
            <h1 className="text-2xl md:text-3xl font-bold text-secondary-100">
              Workflow Configuration
            </h1>
            <p className="text-sm text-custom-700 mt-1">
              Configure the job processing workflow and business rules
            </p>
          </div>
          <div className="flex items-center gap-2">
            <Button
              onClick={handleReset}
              variant="outline"
              className="flex items-center gap-2"
            >
              <HiOutlineRefresh className="w-4 h-4" />
              Reset to Default
            </Button>
            <Button
              onClick={handleSave}
              disabled={!hasChanges}
              className="flex items-center gap-2 !bg-primary-500 hover:!bg-primary-600"
            >
              <HiOutlineSave className="w-4 h-4" />
              Save Changes
            </Button>
          </div>
        </div>

        {/* Changes Alert */}
        {hasChanges && (
          <Card className="!p-4 !bg-yellow-50 !border-yellow-300">
            <div className="flex items-center gap-3">
              <HiOutlineExclamationCircle className="w-5 h-5 text-yellow-600 flex-shrink-0" />
              <div className="flex-1">
                <p className="text-sm font-semibold text-yellow-900">Unsaved Changes</p>
                <p className="text-xs text-yellow-700">
                  You have unsaved changes. Click "Save Changes" to apply them.
                </p>
              </div>
            </div>
          </Card>
        )}

        {/* Workflow Info */}
        <Card>
          <div className="flex items-center gap-2 mb-4">
            <HiOutlineCog className="w-5 h-5 text-primary-500" />
            <h2 className="font-bold text-secondary-100">Workflow Information</h2>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div>
              <p className="text-xs text-custom-700">Workflow Name</p>
              <p className="text-sm font-semibold text-secondary-100">
                {workflowConfig.name}
              </p>
            </div>
            <div>
              <p className="text-xs text-custom-700">Version</p>
              <p className="text-sm font-semibold text-secondary-100">
                {workflowConfig.version}
              </p>
            </div>
            <div>
              <p className="text-xs text-custom-700">Last Updated</p>
              <p className="text-sm font-semibold text-secondary-100">
                {new Date(workflowConfig.updatedAt).toLocaleDateString()}
              </p>
            </div>
          </div>
        </Card>

        {/* Workflow Steps */}
        <Card>
          <div className="flex items-center justify-between mb-4">
            <div className="flex items-center gap-2">
              <HiOutlineAdjustments className="w-5 h-5 text-primary-500" />
              <h2 className="font-bold text-secondary-100">Workflow Steps</h2>
            </div>
            <span className="text-xs text-custom-700">
              {workflowConfig.steps.filter((s) => s.enabled).length} of{" "}
              {workflowConfig.steps.length} enabled
            </span>
          </div>

          <div className="space-y-3">
            {workflowConfig.steps
              .sort((a, b) => a.order - b.order)
              .map((step, index) => (
                <WorkflowStepCard
                  key={step.id}
                  step={step}
                  index={index}
                  isExpanded={expandedStep === step.id}
                  onToggle={() => toggleStep(step.id)}
                  onToggleEnabled={() => toggleStepEnabled(step.id)}
                  getStepIcon={getStepIcon}
                />
              ))}
          </div>

          <button className="w-full mt-4 px-4 py-3 rounded-xl border-2 border-dashed border-custom-300 hover:border-primary-300 hover:bg-primary-50 transition-colors text-sm font-semibold text-custom-700 hover:text-primary-600 flex items-center justify-center gap-2">
            <HiOutlinePlus className="w-5 h-5" />
            Add Custom Step
          </button>
        </Card>

        {/* Department Configuration */}
        <Card>
          <div className="flex items-center gap-2 mb-4">
            <HiOutlineCog className="w-5 h-5 text-primary-500" />
            <h2 className="font-bold text-secondary-100">Department Configuration</h2>
          </div>
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead className="bg-custom-50 border-b border-custom-300">
                <tr>
                  <th className="px-4 py-3 text-left text-xs font-bold text-secondary-100 uppercase">
                    Department
                  </th>
                  <th className="px-4 py-3 text-center text-xs font-bold text-secondary-100 uppercase">
                    Supervisor Required
                  </th>
                  <th className="px-4 py-3 text-center text-xs font-bold text-secondary-100 uppercase">
                    Worker Assignment
                  </th>
                  <th className="px-4 py-3 text-center text-xs font-bold text-secondary-100 uppercase">
                    Quality Check
                  </th>
                  <th className="px-4 py-3 text-center text-xs font-bold text-secondary-100 uppercase">
                    Material Requests
                  </th>
                  <th className="px-4 py-3 text-center text-xs font-bold text-secondary-100 uppercase">
                    Time Tracking
                  </th>
                </tr>
              </thead>
              <tbody className="divide-y divide-custom-200">
                {workflowConfig.departmentConfigs.map((dept) => (
                  <tr key={dept.departmentId} className="hover:bg-custom-50">
                    <td className="px-4 py-3 font-semibold text-secondary-100">
                      {dept.departmentName}
                    </td>
                    <td className="px-4 py-3 text-center">
                      {dept.supervisorRequired ? (
                        <HiOutlineCheckCircle className="w-5 h-5 text-green-600 mx-auto" />
                      ) : (
                        <span className="text-custom-400">—</span>
                      )}
                    </td>
                    <td className="px-4 py-3 text-center">
                      {dept.workerAssignmentRequired ? (
                        <HiOutlineCheckCircle className="w-5 h-5 text-green-600 mx-auto" />
                      ) : (
                        <span className="text-custom-400">—</span>
                      )}
                    </td>
                    <td className="px-4 py-3 text-center">
                      {dept.qualityCheckRequired ? (
                        <HiOutlineCheckCircle className="w-5 h-5 text-green-600 mx-auto" />
                      ) : (
                        <span className="text-custom-400">—</span>
                      )}
                    </td>
                    <td className="px-4 py-3 text-center">
                      {dept.materialRequestEnabled ? (
                        <HiOutlineCheckCircle className="w-5 h-5 text-green-600 mx-auto" />
                      ) : (
                        <span className="text-custom-400">—</span>
                      )}
                    </td>
                    <td className="px-4 py-3 text-center">
                      {dept.timeTrackingRequired ? (
                        <HiOutlineCheckCircle className="w-5 h-5 text-green-600 mx-auto" />
                      ) : (
                        <span className="text-custom-400">—</span>
                      )}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </Card>

        {/* Business Rules */}
        <Card>
          <div className="flex items-center justify-between mb-4">
            <div className="flex items-center gap-2">
              <HiOutlineAdjustments className="w-5 h-5 text-primary-500" />
              <h2 className="font-bold text-secondary-100">Global Business Rules</h2>
            </div>
            <Button variant="outline" className="!text-xs !py-1 !px-3">
              <HiOutlinePlus className="w-4 h-4 mr-1" />
              Add Rule
            </Button>
          </div>
          <div className="space-y-3">
            {workflowConfig.globalRules.map((rule) => (
              <div
                key={rule.id}
                className="p-4 rounded-xl border border-custom-300 bg-custom-50"
              >
                <div className="flex items-start justify-between gap-3">
                  <div className="flex-1">
                    <div className="flex items-center gap-2 mb-1">
                      <h3 className="text-sm font-bold text-secondary-100">{rule.name}</h3>
                      <span
                        className={`text-xs px-2 py-0.5 rounded-full ${
                          rule.enabled
                            ? "bg-green-100 text-green-700"
                            : "bg-custom-200 text-custom-700"
                        }`}
                      >
                        {rule.enabled ? "Enabled" : "Disabled"}
                      </span>
                    </div>
                    <p className="text-xs text-custom-700 mb-2">{rule.description}</p>
                    <div className="flex items-center gap-2 text-xs">
                      <span className="text-custom-600">
                        {rule.conditions.length} condition(s)
                      </span>
                      <span className="text-custom-400">•</span>
                      <span className="text-custom-600">{rule.actions.length} action(s)</span>
                    </div>
                  </div>
                  <button className="p-2 rounded-lg hover:bg-red-100 transition-colors">
                    <HiOutlineTrash className="w-4 h-4 text-red-500" />
                  </button>
                </div>
              </div>
            ))}
          </div>
        </Card>
      </div>
    </DashboardLayout>
  );
}

// Workflow Step Card Component
function WorkflowStepCard({
  step,
  index,
  isExpanded,
  onToggle,
  onToggleEnabled,
  getStepIcon,
}: {
  step: WorkflowStepConfig;
  index: number;
  isExpanded: boolean;
  onToggle: () => void;
  onToggleEnabled: () => void;
  getStepIcon: (type: string) => string;
}) {
  return (
    <div
      className={`rounded-xl border-2 transition-all ${
        step.enabled
          ? "border-primary-300 bg-primary-50"
          : "border-custom-300 bg-custom-100 opacity-60"
      }`}
    >
      <div className="p-4">
        <div className="flex items-center justify-between gap-3">
          <div className="flex items-center gap-3 flex-1">
            <div className="flex items-center gap-2">
              <span className="text-2xl">{getStepIcon(step.type)}</span>
              <div className="w-8 h-8 rounded-full bg-primary-500 text-white flex items-center justify-center text-sm font-bold">
                {index + 1}
              </div>
            </div>
            <div className="flex-1">
              <div className="flex items-center gap-2 mb-1">
                <h3 className="text-sm font-bold text-secondary-100">{step.name}</h3>
                {step.required && (
                  <span className="text-xs px-2 py-0.5 rounded-full bg-red-100 text-red-700">
                    Required
                  </span>
                )}
                {step.canSkip && (
                  <span className="text-xs px-2 py-0.5 rounded-full bg-yellow-100 text-yellow-700">
                    Conditional
                  </span>
                )}
              </div>
              <p className="text-xs text-custom-700">{step.description}</p>
              <div className="flex items-center gap-2 mt-1 text-xs text-custom-600">
                <span>Roles: {step.roles.join(", ")}</span>
              </div>
            </div>
          </div>
          <div className="flex items-center gap-2">
            <label className="relative inline-flex items-center cursor-pointer">
              <input
                type="checkbox"
                checked={step.enabled}
                onChange={onToggleEnabled}
                className="sr-only peer"
              />
              <div className="w-11 h-6 bg-custom-300 peer-focus:outline-none peer-focus:ring-4 peer-focus:ring-primary-300 rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-custom-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-primary-500"></div>
            </label>
            <button
              onClick={onToggle}
              className="p-2 rounded-lg hover:bg-white transition-colors"
            >
              {isExpanded ? (
                <HiOutlineChevronUp className="w-5 h-5 text-custom-700" />
              ) : (
                <HiOutlineChevronDown className="w-5 h-5 text-custom-700" />
              )}
            </button>
          </div>
        </div>

        {/* Expanded Details */}
        {isExpanded && (
          <div className="mt-4 pt-4 border-t border-custom-300 space-y-3">
            <div>
              <p className="text-xs font-bold text-secondary-100 mb-2">Required Fields:</p>
              <div className="flex flex-wrap gap-2">
                {step.requiredFields.map((field) => (
                  <span
                    key={field}
                    className="text-xs px-2 py-1 rounded-lg bg-white border border-custom-300 text-custom-700"
                  >
                    {field}
                  </span>
                ))}
              </div>
            </div>
            <div>
              <p className="text-xs font-bold text-secondary-100 mb-2">Available Actions:</p>
              <div className="flex flex-wrap gap-2">
                {step.availableActions.map((action) => (
                  <span
                    key={action}
                    className="text-xs px-2 py-1 rounded-lg bg-primary-100 text-primary-700"
                  >
                    {action}
                  </span>
                ))}
              </div>
            </div>
            {step.rules && step.rules.length > 0 && (
              <div>
                <p className="text-xs font-bold text-secondary-100 mb-2">Business Rules:</p>
                <div className="space-y-2">
                  {step.rules.map((rule) => (
                    <div
                      key={rule.id}
                      className="text-xs p-2 rounded-lg bg-white border border-custom-300"
                    >
                      <p className="font-semibold text-secondary-100">{rule.name}</p>
                      <p className="text-custom-700">{rule.description}</p>
                    </div>
                  ))}
                </div>
              </div>
            )}
          </div>
        )}
      </div>
    </div>
  );
}
