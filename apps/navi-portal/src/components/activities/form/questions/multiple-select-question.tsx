import React from "react";
import { ControlledQuestionProps } from "./types";
import { Checkbox, Label, Typography } from "@/components/ui";
import { cn } from "@/lib/utils";

/**
 * MultipleSelectQuestion component - checkbox selection for multiple values
 * Designed to work with react-hook-form Controller
 */
export function MultipleSelectQuestion({
  question,
  field,
  fieldState,
  disabled = false,
  className = "",
}: ControlledQuestionProps) {
  const hasError = fieldState.invalid && fieldState.error;
  const errorMessage = fieldState.error?.message;
  const currentValues = field.value || [];

  const handleValueChange = (optionValue: string, checked: boolean) => {
    let newValues: string[];
    
    if (checked) {
      // Add value if not already present
      newValues = currentValues.includes(optionValue) 
        ? currentValues 
        : [...currentValues, optionValue];
    } else {
      // Remove value
      newValues = currentValues.filter((value: string) => value !== optionValue);
    }
    
    field.onChange(newValues);
  };

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
      
      <div
        className={cn("space-y-2")}
        role="group"
        aria-labelledby={`${field.name}-label`}
        aria-describedby={hasError ? `${field.name}-error` : undefined}
        aria-invalid={!!hasError}
      >
        {question.options?.map((option) => {
          const isChecked = currentValues.includes(option.value);
          
          return (
            <div key={option.id} className="flex items-center space-x-2">
              <Checkbox
                id={`${field.name}-${option.id}`}
                checked={isChecked}
                onCheckedChange={(checked) => 
                  handleValueChange(option.value, !!checked)
                }
                disabled={disabled}
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
          );
        })}
      </div>

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