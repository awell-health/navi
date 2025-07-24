import React from "react";
import { ControlledQuestionProps } from "./types";
import { Input, Label, Typography } from "@/components/ui";
import { cn } from "@/lib/utils";

/**
 * ShortTextQuestion component - single line text input
 * Designed to work with react-hook-form Controller
 * Now includes proper error handling via fieldState
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
        {...field} // Contains value, onChange, onBlur, name from Controller
        id={field.name}
        type="text"
        autoComplete="off"
        disabled={disabled}
        className={cn(
          // Use CSS variables for branding integration
          "font-[var(--font-family-body,inherit)]",
          "text-[var(--font-size-base,1rem)]",
          "leading-[var(--line-height-normal,1.5)]",
          // Error styling
          hasError && "border-destructive focus-visible:ring-destructive"
        )}
        aria-describedby={cn(
          helperText && `${field.name}-helper`,
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
          {fieldState.invalid && helperText ? helperText : errorMessage}
        </Typography.Small>
      )}
    </div>
  );
}
