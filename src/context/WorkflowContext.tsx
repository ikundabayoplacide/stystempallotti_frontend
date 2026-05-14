import { createContext, type ReactNode, useContext, useEffect, useState } from "react";
import { DEFAULT_WORKFLOW, type WorkflowConfiguration } from "../types/Workflow";

interface WorkflowContextType {
  workflowConfig: WorkflowConfiguration;
  updateWorkflowConfig: (config: WorkflowConfiguration) => void;
  resetToDefault: () => void;
  isLoading: boolean;
}

const WorkflowContext = createContext<WorkflowContextType | undefined>(undefined);

export function WorkflowProvider({ children }: { children: ReactNode }) {
  const [workflowConfig, setWorkflowConfig] = useState<WorkflowConfiguration>(DEFAULT_WORKFLOW);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    // Load workflow configuration from localStorage or API
    const loadWorkflowConfig = () => {
      try {
        const savedConfig = localStorage.getItem("jts-workflow-config");
        if (savedConfig) {
          setWorkflowConfig(JSON.parse(savedConfig));
        } else {
          setWorkflowConfig(DEFAULT_WORKFLOW);
        }
      } catch (error) {
        console.error("Error loading workflow config:", error);
        setWorkflowConfig(DEFAULT_WORKFLOW);
      } finally {
        setIsLoading(false);
      }
    };

    loadWorkflowConfig();
  }, []);

  const updateWorkflowConfig = (config: WorkflowConfiguration) => {
    const updatedConfig = {
      ...config,
      updatedAt: new Date().toISOString(),
    };
    setWorkflowConfig(updatedConfig);
    // Save to localStorage (in production, this would be an API call)
    localStorage.setItem("jts-workflow-config", JSON.stringify(updatedConfig));
  };

  const resetToDefault = () => {
    setWorkflowConfig(DEFAULT_WORKFLOW);
    localStorage.setItem("jts-workflow-config", JSON.stringify(DEFAULT_WORKFLOW));
  };

  return (
    <WorkflowContext.Provider
      value={{
        workflowConfig,
        updateWorkflowConfig,
        resetToDefault,
        isLoading,
      }}
    >
      {children}
    </WorkflowContext.Provider>
  );
}

export function useWorkflow() {
  const context = useContext(WorkflowContext);
  if (context === undefined) {
    throw new Error("useWorkflow must be used within a WorkflowProvider");
  }
  return context;
}
