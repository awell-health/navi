import React from "react";
import { ControlledQuestionProps } from "./types";
import { Checkbox, Label, Typography } from "@/components/ui";
import { cn } from "@/lib/utils";
import type { Question } from "@/lib/awell-client/generated/graphql";

/**
 * Validation utility for MultipleSelectQuestion
 * Co-located with component for maintainability
 */
export function createMultipleSelectValidationRules(question: Question) {
  const rules: any = {};

  if (question.is_required) {
    rules.required = "Please select at least one option";
  }

  // Validate array length and range constraints
  rules.validate = (value: string[] | undefined) => {
    const selectedValues = value || [];

    // Required validation
    if (selectedValues.length === 0 && question.is_required) {
      return "Please select at least one option";
    }

    // Range validation from MultipleSelectConfig
    const multipleSelectConfig = question.config?.multiple_select;
    const range = multipleSelectConfig?.range;

    if (range?.enabled) {
      if (
        range.min !== null &&
        range.min !== undefined &&
        selectedValues.length < range.min
      ) {
        return `Please select at least ${range.min} option${
          range.min === 1 ? "" : "s"
        }`;
      }
      if (
        range.max !== null &&
        range.max !== undefined &&
        selectedValues.length > range.max
      ) {
        return `Please select no more than ${range.max} option${
          range.max === 1 ? "" : "s"
        }`;
      }
    }

    // Note: Exclusive option behavior is handled automatically in the UI
    // When exclusive option is selected, all others are deselected
    // When any other option is selected, exclusive option is deselected

    // Validate that all selected values are valid options
    const validOptions = question.options?.map((option) => option.value) || [];
    const invalidSelections = selectedValues.filter(
      (val) => !validOptions.includes(val)
    );
    if (invalidSelections.length > 0) {
      return "Please select only valid options";
    }

    return true;
  };

  return rules;
}

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

    // Get exclusive option configuration
    const exclusiveOption = question.config?.multiple_select?.exclusive_option;
    const exclusiveOptionConfig =
      exclusiveOption?.enabled && exclusiveOption?.option_id
        ? question.options?.find(
            (option) => option.id === exclusiveOption.option_id
          )
        : null;
    const exclusiveOptionValue = exclusiveOptionConfig?.value || "";

    if (checked) {
      if (optionValue === exclusiveOptionValue) {
        // If selecting the exclusive option, clear all others and select only this
        newValues = [optionValue];
      } else {
        // If selecting a non-exclusive option, remove exclusive option if present and add this option
        const withoutExclusive = exclusiveOptionValue
          ? currentValues.filter(
              (value: string) => value !== exclusiveOptionValue
            )
          : currentValues;
        newValues = withoutExclusive.includes(optionValue)
          ? withoutExclusive
          : [...withoutExclusive, optionValue];
      }
    } else {
      // Remove value (works for both exclusive and non-exclusive)
      newValues = currentValues.filter(
        (value: string) => value !== optionValue
      );
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
          const isChecked = currentValues.includes(option.value || "");

          return (
            <div key={option.id} className="flex items-center space-x-2">
              <Checkbox
                id={`${field.name}-${option.id}`}
                checked={isChecked}
                onCheckedChange={(checked) =>
                  handleValueChange(option.value || "", !!checked)
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
