import React from "react";
import { ControlledQuestionProps } from "./types";
import type { Question } from "@/lib/awell-client/generated/graphql";
import { Input, Label, Typography } from "@/components/ui";
import { cn } from "@/lib/utils";

/**
 * Short text validation utility function for ShortTextQuestion
 * Can be used by parent forms with react-hook-form validation rules
 */
export function createShortTextValidationRules(question: Question) {
  const rules: any = {};

  // Required validation
  if (question.is_required) {
    rules.required = "This field is required";
  }

  // Pattern validation from input_validation config
  const inputValidation = question.config?.input_validation;
  if (inputValidation?.pattern) {
    rules.pattern = {
      value: new RegExp(inputValidation.pattern),
      message: inputValidation.helper_text || "Please enter a valid value",
    };
  }

  return rules;
}

/**
 * ShortTextQuestion component - single line text input with helper text support
 * This is the ONLY component that should display helper text
 * Designed to work with react-hook-form Controller
 */
export function ShortTextQuestion({
  question,
  field,
  fieldState,
  disabled = false,
  className = "",
}: ControlledQuestionProps) {
  const inputValidation = question.config?.input_validation;
  const helperText = inputValidation?.helper_text;
  const hasError = fieldState.invalid && fieldState.error;
  const errorMessage = fieldState.error?.message;

  return (
    <div className={cn("space-y-2", className)}>
      <Label htmlFor={field.name} className="block">
        {question.title.replace(/<[^>]*>/g, "")}
        {question.is_required && (
          <span className="text-destructive ml-1" aria-label="required">
            *
          </span>
        )}
      </Label>

      <Input
        {...field}
        id={field.name}
        type="text"
        autoComplete="off"
        disabled={disabled}
        className={cn(
          "font-[var(--font-family-body,inherit)]",
          "text-[var(--font-size-base,1rem)]",
          "leading-[var(--line-height-normal,1.5)]",
          hasError && "border-destructive focus-visible:ring-destructive"
        )}
        aria-describedby={cn(
          helperText && !hasError && `${field.name}-helper`,
          hasError && `${field.name}-error`
        )}
        aria-invalid={!!hasError}
      />

      {/* Error message - show when there's an error */}
      {hasError && (
        <Typography.Small
          id={`${field.name}-error`}
          className="text-destructive"
          role="alert"
        >
          {errorMessage}
        </Typography.Small>
      )}
    </div>
  );
}
