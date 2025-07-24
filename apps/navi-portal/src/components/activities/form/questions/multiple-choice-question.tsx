import React from "react";
import { ControlledQuestionProps } from "./types";
import { RadioGroup, RadioGroupItem, Label, Typography } from "@/components/ui";
import { cn } from "@/lib/utils";

/**
 * MultipleChoiceQuestion component - radio button selection
 * Designed to work with react-hook-form Controller
 */
export function MultipleChoiceQuestion({
  question,
  field,
  fieldState,
  disabled = false,
  className = "",
}: ControlledQuestionProps) {
  const hasError = fieldState.invalid && fieldState.error;
  const errorMessage = fieldState.error?.message;

  return (
    <div className={cn("space-y-3", className)}>
      <Label className="block">
        {question.title.replace(/<[^>]*>/g, "")}
        {question.is_required && (
          <span className="text-destructive ml-1" aria-label="required">
            *
          </span>
        )}
      </Label>
      
      <RadioGroup
        value={field.value || ""}
        onValueChange={field.onChange}
        onBlur={field.onBlur}
        disabled={disabled}
        className={cn(
          "space-y-2",
          hasError && "border-destructive"
        )}
        aria-describedby={hasError ? `${field.name}-error` : undefined}
        aria-invalid={!!hasError}
      >
        {question.options?.map((option) => (
          <div key={option.id} className="flex items-center space-x-2">
            <RadioGroupItem
              value={option.value || ""}
              id={`${field.name}-${option.id}`}
              className={cn(
                "font-[var(--font-family-body,inherit)]",
                hasError && "border-destructive"
              )}
            />
            <Label
              htmlFor={`${field.name}-${option.id}`}
              className={cn(
                "text-sm font-normal cursor-pointer",
                "font-[var(--font-family-body,inherit)]",
                "text-[var(--font-size-base,1rem)]",
                disabled && "opacity-50 cursor-not-allowed"
              )}
            >
              {option.label}
            </Label>
          </div>
        ))}
      </RadioGroup>

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