import React from "react";
import { ControlledQuestionProps } from "../types";
import { Input } from "@/components/ui";
import { cn } from "@/lib/utils";

export interface ShortTextQuestionProps extends ControlledQuestionProps {}

/**
 * ShortTextQuestion component - single line text input with validation
 * Uses react-hook-form for controlled input and validation
 * Supports regex pattern validation from config.input_validation
 */
export function ShortTextQuestion({
  question,
  field,
  disabled = false,
  error,
  className = "",
}: ShortTextQuestionProps) {
  const inputValidation = question.config?.input_validation;
  const helperText = inputValidation?.helper_text;
  const isRequired = question.is_required || question.config?.mandatory;

  // Create validation rules for react-hook-form
  const validationRules = {
    required: isRequired ? "This field is required" : false,
    ...(inputValidation?.pattern && {
      pattern: {
        value: new RegExp(inputValidation.pattern),
        message: helperText || "Invalid input format",
      },
    }),
  };

  return (
    <div className={cn("space-y-2", className)}>
      <Input
        {...field}
        type="text"
        placeholder={helperText || "Enter text..."}
        disabled={disabled}
        aria-invalid={error ? "true" : "false"}
        aria-describedby={error ? `${question.key}-error` : undefined}
        className={cn(
          error && "border-destructive focus:border-destructive",
        )}
      />
      
      {error && (
        <div 
          id={`${question.key}-error`}
          className="text-sm text-destructive"
          role="alert"
          aria-live="polite"
        >
          {error.message}
        </div>
      )}
    </div>
  );
}

// Export validation rules for use with react-hook-form
export function getShortTextValidationRules(question: any) {
  const inputValidation = question.config?.input_validation;
  const isRequired = question.is_required || question.config?.mandatory;
  
  return {
    required: isRequired ? "This field is required" : false,
    ...(inputValidation?.pattern && {
      pattern: {
        value: new RegExp(inputValidation.pattern),
        message: inputValidation.helper_text || "Invalid input format",
      },
    }),
  };
}