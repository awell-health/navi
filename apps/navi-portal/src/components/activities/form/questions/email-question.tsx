import React from "react";
import { ControlledQuestionProps } from "./types";
import type { Question } from "@/lib/awell-client/generated/graphql";
import { Input, Label, Typography } from "@/components/ui";
import { cn } from "@/lib/utils";

/**
 * Email validation utility function for EmailQuestion
 * Can be used by parent forms with react-hook-form validation rules
 */
export function createEmailValidationRules(question: Question) {
  const rules: Record<string, unknown> = {};

  // Required validation
  if (question.is_required) {
    rules.required = "This field is required";
  }

  // Email format validation
  rules.pattern = {
    value: /^[^\s@]+@[^\s@]+\.[^\s@]+$/,
    message: "Please enter a valid email address",
  };

  return rules;
}

/**
 * EmailQuestion component - email input with validation
 * Designed to work with react-hook-form Controller
 */
export function EmailQuestion({
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

      <Input
        {...field}
        value={(field.value as string) || ""}
        id={field.name}
        type="email"
        autoComplete="email"
        placeholder="your.email@example.com"
        disabled={disabled}
        className={cn(
          "font-[var(--font-family-body,inherit)]",
          "text-[var(--font-size-base,1rem)]",
          "leading-[var(--line-height-normal,1.5)]",
          hasError && "border-destructive focus-visible:ring-destructive"
        )}
        aria-describedby={cn(hasError && `${field.name}-error`)}
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
