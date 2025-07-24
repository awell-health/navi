import React from "react";
import { ControlledQuestionProps } from "./types";
import { Input, Label, Typography } from "@/components/ui";
import { cn } from "@/lib/utils";

/**
 * EmailQuestion component - email input with very loose validation
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
        aria-describedby={cn(
          !hasError && `${field.name}-helper`,
          hasError && `${field.name}-error`
        )}
        aria-invalid={!!hasError}
      />

      {/* Helper text */}
      {!hasError && (
        <Typography.Small
          id={`${field.name}-helper`}
          className="text-muted-foreground"
        >
          Enter a valid email address
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