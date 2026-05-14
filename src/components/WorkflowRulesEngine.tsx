import { useEffect } from "react";
import { useWorkflowValidation } from "../hooks/useWorkflowValidation";
import { type WorkflowAction } from "../types/Workflow";

interface WorkflowRulesEngineProps {
  stepId?: string;
  data: Record<string, any>;
  onRuleTriggered?: (action: WorkflowAction, ruleName: string) => void;
  checkGlobalRules?: boolean;
}

/**
 * Component that evaluates workflow rules and triggers actions
 * Runs in the background to enforce business logic
 * 
 * Example:
 * <WorkflowRulesEngine 
 *   stepId="step-2-sales"
 *   data={jobData}
 *   onRuleTriggered={(action, ruleName) => handleAction(action)}
 *   checkGlobalRules
 * />
 */
export function WorkflowRulesEngine({
  stepId,
  data,
  onRuleTriggered,
  checkGlobalRules = true,
}: WorkflowRulesEngineProps) {
  const { getApplicableRules, getApplicableGlobalRules } = useWorkflowValidation();

  useEffect(() => {
    // Check step-specific rules
    if (stepId) {
      const applicableRules = getApplicableRules(stepId, data);
      
      applicableRules.forEach(rule => {
        console.log(`🔔 Workflow Rule Triggered: ${rule.name}`, rule);
        
        rule.actions.forEach(action => {
          onRuleTriggered?.(action, rule.name);
          
          // Execute action based on type
          switch (action.type) {
            case "send_notification":
              console.log(`📧 Send notification to ${action.target}:`, action.params);
              // In production, this would call a notification service
              break;
              
            case "generate_invoice":
              console.log(`📄 Generate invoice:`, action.params);
              // In production, this would call invoice generation service
              break;
              
            case "authorize_delivery":
              console.log(`✅ Authorize delivery`);
              // In production, this would update delivery status
              break;
              
            case "send_reminder":
              console.log(`⏰ Send reminder to ${action.target}`);
              // In production, this would call reminder service
              break;
              
            case "assign_task":
              console.log(`📋 Assign task to ${action.target}:`, action.params);
              // In production, this would call task assignment service
              break;
              
            case "custom":
              console.log(`⚙️ Custom action:`, action.params);
              // In production, this would call custom action handler
              break;
          }
        });
      });
    }

    // Check global rules
    if (checkGlobalRules) {
      const globalRules = getApplicableGlobalRules(data);
      
      globalRules.forEach(rule => {
        console.log(`🌐 Global Rule Triggered: ${rule.name}`, rule);
        
        rule.actions.forEach(action => {
          onRuleTriggered?.(action, rule.name);
          
          // Execute global action
          console.log(`🔔 Global Action: ${action.type}`, action);
        });
      });
    }
  }, [stepId, data, checkGlobalRules, getApplicableRules, getApplicableGlobalRules, onRuleTriggered]);

  // This component doesn't render anything
  return null;
}

export default WorkflowRulesEngine;
