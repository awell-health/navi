import React from "react";
import { ControlledQuestionProps } from "./types";
import { RadioGroup, RadioGroupItem, Label, Typography } from "@/components/ui";
import { cn } from "@/lib/utils";

/**
 * YesNoQuestion component - boolean choice using radio buttons
 * Designed to work with react-hook-form Controller
 */
export function YesNoQuestion({
  question,
  field,
  fieldState,
  disabled = false,
  className = "",
}: ControlledQuestionProps) {
  const hasError = fieldState.invalid && fieldState.error;
  const errorMessage = fieldState.error?.message;

  const handleValueChange = (value: string) => {
    // Convert string to boolean
    field.onChange(value === "true");
  };

  const currentValue = field.value === true ? "true" : field.value === false ? "false" : "";

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
        value={currentValue}
        onValueChange={handleValueChange}
        onBlur={field.onBlur}
        disabled={disabled}
        className={cn(
          "space-y-2",
          hasError && "border-destructive"
        )}
        aria-describedby={hasError ? `${field.name}-error` : undefined}
        aria-invalid={!!hasError}
      >
        <div className="flex items-center space-x-2">
          <RadioGroupItem
            value="true"
            id={`${field.name}-yes`}
            className={cn(
              "font-[var(--font-family-body,inherit)]",
              hasError && "border-destructive"
            )}
          />
          <Label
            htmlFor={`${field.name}-yes`}
            className={cn(
              "text-sm font-normal cursor-pointer",
              "font-[var(--font-family-body,inherit)]",
              "text-[var(--font-size-base,1rem)]",
              disabled && "opacity-50 cursor-not-allowed"
            )}
          >
            Yes
          </Label>
        </div>
        
        <div className="flex items-center space-x-2">
          <RadioGroupItem
            value="false"
            id={`${field.name}-no`}
            className={cn(
              "font-[var(--font-family-body,inherit)]",
              hasError && "border-destructive"
            )}
          />
          <Label
            htmlFor={`${field.name}-no`}
            className={cn(
              "text-sm font-normal cursor-pointer",
              "font-[var(--font-family-body,inherit)]",
              "text-[var(--font-size-base,1rem)]",
              disabled && "opacity-50 cursor-not-allowed"
            )}
          >
            No
          </Label>
        </div>
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