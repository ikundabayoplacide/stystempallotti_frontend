import { type ReactNode, useEffect, useState } from "react";
import { HiOutlineExclamationCircle } from "react-icons/hi";
import { useWorkflowValidation } from "../hooks/useWorkflowValidation";
import { Card } from "./ui";

interface WorkflowValidatorProps {
  stepId: string;
  data: Record<string, any>;
  onValidationChange?: (isValid: boolean, errors: string[]) => void;
  showErrors?: boolean;
  children?: ReactNode;
}

/**
 * Component that validates workflow step data and shows errors
 * 
 * Example:
 * <WorkflowValidator 
 *   stepId="step-1-receptionist" 
 *   data={formData}
 *   onValidationChange={(valid, errors) => setIsValid(valid)}
 *   showErrors
 * />
 */
export function WorkflowValidator({
  stepId,
  data,
  onValidationChange,
  showErrors = true,
  children,
}: WorkflowValidatorProps) {
  const { validateRequiredFields, getStep } = useWorkflowValidation();
  const [errors, setErrors] = useState<string[]>([]);
  const step = getStep(stepId);

  useEffect(() => {
    if (!step) {
      setErrors([]);
      onValidationChange?.(true, []);
      return;
    }

    const validation = validateRequiredFields(stepId, data);
    const errorMessages = validation.missingFields.map(
      field => `${field.replace(/([A-Z])/g, ' $1').trim()} is required`
    );

    setErrors(errorMessages);
    onValidationChange?.(validation.valid, errorMessages);
  }, [stepId, data, step, onValidationChange]);

  if (!showErrors || errors.length === 0) {
    return <>{children}</>;
  }

  return (
    <>
      {children}
      <Card className="!bg-red-50 !border-red-300 !p-4 mt-4">
        <div className="flex items-start gap-3">
          <HiOutlineExclamationCircle className="w-5 h-5 text-red-600 flex-shrink-0 mt-0.5" />
          <div className="flex-1">
            <h3 className="font-semibold text-red-900 mb-2">Required Fields Missing</h3>
            <ul className="list-disc list-inside space-y-1">
              {errors.map((error, index) => (
                <li key={index} className="text-sm text-red-700">{error}</li>
              ))}
            </ul>
          </div>
        </div>
      </Card>
    </>
  );
}

export default WorkflowValidator;
