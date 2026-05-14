import { useWorkflow } from "../context/WorkflowContext";
import { type WorkflowCondition, type WorkflowStepConfig } from "../types/Workflow";

/**
 * Hook for workflow validation and enforcement
 */
export function useWorkflowValidation() {
  const { workflowConfig } = useWorkflow();

  /**
   * Get workflow step by ID
   */
  const getStep = (stepId: string): WorkflowStepConfig | undefined => {
    return workflowConfig.steps.find(s => s.id === stepId);
  };

  /**
   * Get workflow step by type
   */
  const getStepByType = (type: string): WorkflowStepConfig | undefined => {
    return workflowConfig.steps.find(s => s.type === type);
  };

  /**
   * Get all enabled steps in order
   */
  const getEnabledSteps = (): WorkflowStepConfig[] => {
    return workflowConfig.steps
      .filter(s => s.enabled)
      .sort((a, b) => a.order - b.order);
  };

  /**
   * Check if a step is required
   */
  const isStepRequired = (stepId: string): boolean => {
    const step = getStep(stepId);
    return step?.required ?? false;
  };

  /**
   * Validate required fields for a step
   */
  const validateRequiredFields = (
    stepId: string, 
    data: Record<string, any>
  ): { valid: boolean; missingFields: string[] } => {
    const step = getStep(stepId);
    if (!step) return { valid: true, missingFields: [] };

    const missingFields = step.requiredFields.filter(field => {
      const value = data[field];
      return value === undefined || value === null || value === '';
    });

    return {
      valid: missingFields.length === 0,
      missingFields,
    };
  };

  /**
   * Evaluate a condition
   */
  const evaluateCondition = (condition: WorkflowCondition, data: Record<string, any>): boolean => {
    const fieldValue = data[condition.field];
    const conditionValue = condition.value;

    switch (condition.operator) {
      case "equals":
        return fieldValue === conditionValue;
      case "not_equals":
        return fieldValue !== conditionValue;
      case "greater_than":
        return Number(fieldValue) > Number(conditionValue);
      case "less_than":
        return Number(fieldValue) < Number(conditionValue);
      case "contains":
        return String(fieldValue).includes(String(conditionValue));
      default:
        return false;
    }
  };

  /**
   * Check if a step can be skipped
   */
  const canSkipStep = (stepId: string, data: Record<string, any>): boolean => {
    const step = getStep(stepId);
    if (!step || !step.canSkip || !step.skipConditions) return false;

    return step.skipConditions.every(condition => 
      evaluateCondition(condition, data)
    );
  };

  /**
   * Get applicable rules for a step
   */
  const getApplicableRules = (stepId: string, data: Record<string, any>) => {
    const step = getStep(stepId);
    if (!step || !step.rules) return [];

    return step.rules.filter(rule => {
      if (!rule.enabled) return false;

      const conditionResults = rule.conditions.map(condition =>
        evaluateCondition(condition, data)
      );

      if (rule.conditionLogic === "AND") {
        return conditionResults.every(result => result);
      } else {
        return conditionResults.some(result => result);
      }
    });
  };

  /**
   * Get global rules that apply to current data
   */
  const getApplicableGlobalRules = (data: Record<string, any>) => {
    return workflowConfig.globalRules.filter(rule => {
      if (!rule.enabled) return false;

      const conditionResults = rule.conditions.map(condition =>
        evaluateCondition(condition, data)
      );

      if (rule.conditionLogic === "AND") {
        return conditionResults.every(result => result);
      } else {
        return conditionResults.some(result => result);
      }
    });
  };

  /**
   * Get department configuration
   */
  const getDepartmentConfig = (departmentId: string) => {
    return workflowConfig.departmentConfigs.find(
      d => d.departmentId === departmentId
    );
  };

  /**
   * Check if user role can perform a step
   */
  const canUserPerformStep = (stepId: string, userRole: string): boolean => {
    const step = getStep(stepId);
    if (!step) return false;
    return step.roles.includes(userRole);
  };

  /**
   * Get next step in workflow
   */
  const getNextStep = (currentStepId: string): WorkflowStepConfig | null => {
    const enabledSteps = getEnabledSteps();
    const currentIndex = enabledSteps.findIndex(s => s.id === currentStepId);
    
    if (currentIndex === -1 || currentIndex === enabledSteps.length - 1) {
      return null;
    }

    return enabledSteps[currentIndex + 1];
  };

  /**
   * Get previous step in workflow
   */
  const getPreviousStep = (currentStepId: string): WorkflowStepConfig | null => {
    const enabledSteps = getEnabledSteps();
    const currentIndex = enabledSteps.findIndex(s => s.id === currentStepId);
    
    if (currentIndex <= 0) {
      return null;
    }

    return enabledSteps[currentIndex - 1];
  };

  return {
    workflowConfig,
    getStep,
    getStepByType,
    getEnabledSteps,
    isStepRequired,
    validateRequiredFields,
    evaluateCondition,
    canSkipStep,
    getApplicableRules,
    getApplicableGlobalRules,
    getDepartmentConfig,
    canUserPerformStep,
    getNextStep,
    getPreviousStep,
  };
}
