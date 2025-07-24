import React from "react";
import { ControlledQuestionProps } from "./types";
import { Input, Label, Typography } from "@/components/ui";
import { cn } from "@/lib/utils";

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
        min={range?.enabled ? (range.min ?? undefined) : undefined}
        max={range?.enabled ? (range.max ?? undefined) : undefined}
        step="any"
        disabled={disabled}
        className={cn(
          "font-[var(--font-family-body,inherit)]",
          "text-[var(--font-size-base,1rem)]",
          "leading-[var(--line-height-normal,1.5)]",
          hasError && "border-destructive focus-visible:ring-destructive"
        )}
        aria-describedby={cn(
          range?.enabled && `${field.name}-helper`,
          hasError && `${field.name}-error`
        )}
        aria-invalid={!!hasError}
        onChange={(e) => {
          const value = e.target.value;
          // Convert to number if not empty, otherwise pass empty string
          field.onChange(value === "" ? "" : Number(value));
        }}
        value={field.value ?? ""}
      />

      {/* Helper text for range */}
      {range?.enabled && !hasError && (
        <Typography.Small
          id={`${field.name}-helper`}
          className="text-muted-foreground"
        >
          Enter a number between {range.min} and {range.max}
        </Typography.Small>
      )}

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