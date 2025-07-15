import React, { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Checkbox } from "@/components/ui/checkbox";
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";
import { Label } from "@/components/ui/label";
import { FormField } from "@/components/ui/form";
import { cn } from "@/lib/utils";

type FormFieldValue = string | number | readonly string[] | undefined;

// Types for form configuration
interface FormField {
  id: string;
  type:
    | "text"
    | "email"
    | "number"
    | "textarea"
    | "select"
    | "checkbox"
    | "radio"
    | "date";
  label: string;
  description?: string;
  required?: boolean;
  options?: { value: string; label: string }[];
  validation?: {
    min?: number;
    max?: number;
    pattern?: string;
    message?: string;
  };
}

interface ConversationalFormStep {
  id: string;
  title: string;
  fields: FormField[];
}

interface ConversationalFormProps {
  steps: ConversationalFormStep[];
  onSubmit: (data: Record<string, FormFieldValue>) => void | Promise<void>;
  onStepChange?: (currentStep: number, totalSteps: number) => void;
  className?: string;
  showProgress?: boolean;
  submitButtonText?: string;
  nextButtonText?: string;
  previousButtonText?: string;
}

export function ConversationalForm({
  steps,
  onSubmit,
  onStepChange,
  className,
  showProgress = true,
  submitButtonText = "Submit",
  nextButtonText = "Continue",
  previousButtonText = "Back",
}: ConversationalFormProps) {
  const [currentStepIndex, setCurrentStepIndex] = useState(0);
  const [formData, setFormData] = useState<Record<string, FormFieldValue>>({});
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [errors, setErrors] = useState<Record<string, string>>({});

  const currentStep = steps[currentStepIndex];
  const isLastStep = currentStepIndex === steps.length - 1;
  const isFirstStep = currentStepIndex === 0;

  useEffect(() => {
    onStepChange?.(currentStepIndex + 1, steps.length);
  }, [currentStepIndex, steps.length, onStepChange]);

  const validateField = (
    field: FormField,
    value: string | number | readonly string[] | undefined
  ): string | null => {
    if (field.required && (!value || value === "")) {
      return `${field.label} is required`;
    }

    if (field.validation) {
      const { min, max, pattern, message } = field.validation;
      switch (typeof value) {
        case "number":
          if (min && value < min) {
            return message || `${field.label} must be at least ${min}`;
          }
          if (max && value > max) {
            return message || `${field.label} must be no more than ${max}`;
          }
          return null;
        case "string":
          if (min && value.length < min) {
            return (
              message || `${field.label} must be at least ${min} characters`
            );
          }
          if (max && value.length > max) {
            return (
              message || `${field.label} must be no more than ${max} characters`
            );
          }
          if (pattern && !new RegExp(pattern).test(value)) {
            return message || `${field.label} format is invalid`;
          }
          return null;
        default:
          return null;
      }
    }

    return null;
  };

  const validateCurrentStep = (): boolean => {
    const stepErrors: Record<string, string> = {};
    let isValid = true;

    currentStep.fields.forEach((field) => {
      const error = validateField(field, formData[field.id]);
      if (error) {
        stepErrors[field.id] = error;
        isValid = false;
      }
    });

    setErrors(stepErrors);
    return isValid;
  };

  const handleFieldChange = (fieldId: string, value: FormFieldValue) => {
    setFormData((prev) => ({
      ...prev,
      [fieldId]: value,
    }));

    // Clear error when field is changed
    if (errors[fieldId]) {
      setErrors((prev) => ({
        ...prev,
        [fieldId]: "",
      }));
    }
  };

  const handleNext = () => {
    if (validateCurrentStep()) {
      setCurrentStepIndex((prev) => prev + 1);
    }
  };

  const handlePrevious = () => {
    setCurrentStepIndex((prev) => prev - 1);
  };

  const handleSubmit = async () => {
    if (!validateCurrentStep()) return;

    setIsSubmitting(true);
    try {
      await onSubmit(formData);
    } catch (error) {
      console.error("Form submission error:", error);
    } finally {
      setIsSubmitting(false);
    }
  };

  const renderField = (field: FormField) => {
    console.log("Rendering field:", field);
    const value = formData[field.id] || "";
    const error = errors[field.id];

    const commonProps = {
      id: field.id,
      "aria-invalid": !!error,
      "aria-describedby": error ? `${field.id}-error` : undefined,
    };

    switch (field.type) {
      case "text":
      case "email":
      case "number":
      case "date":
        return (
          <Input
            {...commonProps}
            type={field.type}
            value={value}
            onChange={(e) => handleFieldChange(field.id, e.target.value)}
            placeholder={field.description}
          />
        );

      case "textarea":
        return (
          <Textarea
            {...commonProps}
            value={value}
            onChange={(e) => handleFieldChange(field.id, e.target.value)}
            placeholder={field.description}
            rows={4}
          />
        );

      case "select":
        return (
          <Select
            value={value as string}
            onValueChange={(val) => handleFieldChange(field.id, val)}
          >
            <SelectTrigger {...commonProps}>
              <SelectValue
                placeholder={field.description || "Select an option"}
              />
            </SelectTrigger>
            <SelectContent>
              {field.options?.map((option) => (
                <SelectItem key={option.value} value={option.value}>
                  {option.label}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        );

      case "checkbox":
        return (
          <div className="flex items-center space-x-2">
            <Checkbox
              {...commonProps}
              checked={value === "true"}
              onCheckedChange={(checked) =>
                handleFieldChange(field.id, checked ? "true" : "false")
              }
            />
            <label
              htmlFor={field.id}
              className="text-sm font-medium leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70"
            >
              {field.description || field.label}
            </label>
          </div>
        );

      case "radio":
        return (
          <RadioGroup
            value={value as string}
            onValueChange={(val) => handleFieldChange(field.id, val)}
            className="space-y-2"
          >
            {field.options?.map((option) => (
              <div key={option.value} className="flex items-center space-x-2">
                <RadioGroupItem
                  value={option.value}
                  id={`${field.id}-${option.value}`}
                />
                <Label htmlFor={`${field.id}-${option.value}`}>
                  {option.label}
                </Label>
              </div>
            ))}
          </RadioGroup>
        );
      default:
        return null;
    }
  };

  return (
    <div className={cn("max-w-2xl mx-auto space-y-8", className)}>
      {/* Progress Indicator */}
      {showProgress && (
        <div className="space-y-2">
          <div className="flex justify-between text-sm text-muted-foreground">
            <span>
              Step {currentStepIndex + 1} of {steps.length}
            </span>
            <span>
              {Math.round(((currentStepIndex + 1) / steps.length) * 100)}%
              complete
            </span>
          </div>
          <div className="h-2 bg-muted rounded-full overflow-hidden">
            <div
              className="h-full bg-primary transition-all duration-300 ease-out rounded-full"
              style={{
                width: `${((currentStepIndex + 1) / steps.length) * 100}%`,
              }}
            />
          </div>
        </div>
      )}

      {/* Step Content */}
      <div className="space-y-6">
        {/* Step Header */}
        <div className="text-center space-y-2">
          <h2 className="text-2xl font-bold text-foreground">
            {currentStep.title}
          </h2>
        </div>

        {/* Form Fields */}
        <div className="space-y-6">
          {currentStep.fields.map((field) => (
            <div key={field.id} className="space-y-2">
              {field.type !== "checkbox" && (
                <Label htmlFor={field.id} className="text-sm font-medium">
                  {field.label}
                  {field.required && (
                    <span className="text-destructive ml-1">*</span>
                  )}
                </Label>
              )}

              {renderField(field)}

              {errors[field.id] && (
                <p
                  id={`${field.id}-error`}
                  className="text-sm text-destructive"
                >
                  {errors[field.id]}
                </p>
              )}
            </div>
          ))}
        </div>
      </div>

      {/* Navigation Buttons */}
      <div className="flex justify-between pt-6">
        <Button
          type="button"
          variant="outline"
          onClick={handlePrevious}
          disabled={isFirstStep}
          className={isFirstStep ? "invisible" : ""}
        >
          {previousButtonText}
        </Button>

        {isLastStep ? (
          <Button
            type="button"
            onClick={handleSubmit}
            disabled={isSubmitting}
            className="min-w-24"
          >
            {isSubmitting ? "Submitting..." : submitButtonText}
          </Button>
        ) : (
          <Button type="button" onClick={handleNext} className="min-w-24">
            {nextButtonText}
          </Button>
        )}
      </div>
    </div>
  );
}

export type { ConversationalFormProps, ConversationalFormStep, FormField };
