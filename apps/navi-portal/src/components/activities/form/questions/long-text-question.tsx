import React from "react";
import { ControlledQuestionProps } from "./types";
import type { Question } from "@/lib/awell-client/generated/graphql";
import { Textarea, Label, Typography } from "@/components/ui";
import { cn } from "@/lib/utils";

/**
 * Long text validation utility function for LongTextQuestion
 * Can be used by parent forms with react-hook-form validation rules
 */
export function createLongTextValidationRules(question: Question) {
  const rules: Record<string, unknown> = {};

  // Required validation
  if (question.is_required) {
    rules.required = "This field is required";
  }

  // Optional: Add common text length validations
  // These could be configured via question.config in the future
  // For now, we'll keep it simple with just required validation

  return rules;
}

/**
 * LongTextQuestion component - multi-line text input (textarea)
 * Designed to work with react-hook-form Controller
 */
export function LongTextQuestion({
  question,
  field,
  fieldState,
  disabled = false,
  className = "",
}: ControlledQuestionProps) {
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

      <Textarea
        {...field}
        value={(field.value as string) || ""}
        id={field.name}
        rows={4}
        disabled={disabled}
        placeholder="Enter your response here..."
        className={cn(
          "resize-vertical min-h-[100px]",
          "font-[var(--font-family-body,inherit)]",
          "text-[var(--font-size-base,1rem)]",
          "leading-[var(--line-height-normal,1.5)]",
          hasError && "border-destructive focus-visible:ring-destructive"
        )}
        aria-describedby={hasError ? `${field.name}-error` : undefined}
        aria-invalid={!!hasError}
      />

      {/* Error message */}
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
