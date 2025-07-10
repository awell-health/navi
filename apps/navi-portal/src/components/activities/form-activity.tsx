"use client";

import { ConversationalForm } from "@/components/ui/conversational-form";
import type {
  ActivityFragment,
  ActivityForm,
} from "@/lib/awell-client/generated/graphql";
import { mapFormActivityToSteps } from "@/lib/activities/form-mapper";

interface FormActivityProps {
  formActivity: ActivityFragment & { form: ActivityForm };
  className?: string;
  onSubmit?: (data: Record<string, unknown>) => void | Promise<void>;
}

export function FormActivityComponent({
  formActivity,
  className,
  onSubmit,
}: FormActivityProps) {
  // Convert Awell form activity to conversational form steps
  const steps = mapFormActivityToSteps(formActivity);
  console.log("Steps:", steps);

  const handleFormSubmit = async (data: Record<string, unknown>) => {
    console.log("Form submitted with data:", data);
    console.log("Form activity ID:", formActivity.id);

    // For now, just log the submission - in production this would submit to Awell API
    if (onSubmit) {
      await onSubmit(data);
    } else {
      // Mock success feedback
      alert(
        "Form submitted successfully! (This is a prototype - data was logged to console)"
      );
    }
  };

  const handleStepChange = (currentStep: number, totalSteps: number) => {
    console.log(`Form progress: Step ${currentStep} of ${totalSteps}`);
  };

  return (
    <div className="min-h-screen bg-background flex items-center justify-center p-4">
      <div className="max-w-2xl w-full">
        <ConversationalForm
          steps={steps}
          onSubmit={handleFormSubmit}
          onStepChange={handleStepChange}
          showProgress={true}
          submitButtonText="Submit Form"
          nextButtonText="Continue"
          previousButtonText="Back"
          className={className}
        />
      </div>
    </div>
  );
}
