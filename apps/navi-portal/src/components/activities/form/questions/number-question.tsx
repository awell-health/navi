import React from "react";
import { ControlledQuestionProps } from "./types";
import type { Question } from "@/lib/awell-client/generated/graphql";
import { Input, Label, Typography } from "@/components/ui";
import { cn } from "@/lib/utils";

/**
 * Number validation utility function for NumberQuestion
 * Can be used by parent forms with react-hook-form validation rules
 */
export function createNumberValidationRules(question: Question) {
  const rules: any = {};

  // Required validation
  if (question.is_required) {
    rules.required = "This field is required";
  }

  // Range validation from number config
  const numberConfig = question.config?.number;
  const range = numberConfig?.range;

  if (range?.enabled) {
    if (range.min !== null && range.min !== undefined) {
      rules.min = {
        value: range.min,
        message: `Must be at least ${range.min}`,
      };
    }
    if (range.max !== null && range.max !== undefined) {
      rules.max = {
        value: range.max,
        message: `Must be at most ${range.max}`,
      };
    }
  }

  return rules;
}

/**
 * NumberQuestion component - numeric input with range validation
 * Designed to work with react-hook-form Controller
 */
export function NumberQuestion({
  question,
  field,
  fieldState,
  disabled = false,
  className = "",
}: ControlledQuestionProps) {
  const hasError = fieldState.invalid && fieldState.error;
  const errorMessage = fieldState.error?.message;
  const numberConfig = question.config?.number;
  const range = numberConfig?.range;

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
        type="number"
        min={range?.enabled ? range.min ?? undefined : undefined}
        max={range?.enabled ? range.max ?? undefined : undefined}
        step="any"
        disabled={disabled}
        className={cn(
          "font-[var(--font-family-body,inherit)]",
          "text-[var(--font-size-base,1rem)]",
          "leading-[var(--line-height-normal,1.5)]",
          hasError && "border-destructive focus-visible:ring-destructive"
        )}
        aria-describedby={cn(hasError && `${field.name}-error`)}
        aria-invalid={!!hasError}
        onChange={(e) => {
          const value = e.target.value;
          // Convert to number if not empty, otherwise pass empty string
          // This supports negative numbers, decimals, etc.
          field.onChange(value === "" ? "" : Number(value));
        }}
        value={field.value ?? ""}
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
