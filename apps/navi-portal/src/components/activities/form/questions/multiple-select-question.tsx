import React, { useState } from "react";
import { ControlledQuestionProps } from "./types";
import {
  Checkbox,
  Label,
  Typography,
  Button,
  Drawer,
  DrawerContent,
  DrawerHeader,
  DrawerTitle,
  DrawerTrigger,
  Command,
  CommandEmpty,
  CommandGroup,
  CommandInput,
  CommandItem,
  CommandList,
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui";
import { cn } from "@/lib/utils";
import { useMediaQuery } from "@/hooks/use-media-query";
import { Check, X } from "lucide-react";
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

interface MultiSelectOptionListProps {
  question: Question;
  field: any;
  setOpen: (open: boolean) => void;
}

function MultiSelectOptionList({
  question,
  field,
  setOpen,
}: MultiSelectOptionListProps) {
  const currentValues = field.value || [];

  const handleValueToggle = (optionValue: string) => {
    const isSelected = currentValues.includes(optionValue);
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

    if (!isSelected) {
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
        newValues = [...withoutExclusive, optionValue];
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
    <Command>
      <CommandInput placeholder="Search options..." />
      <CommandList>
        <CommandEmpty>No options found.</CommandEmpty>
        <CommandGroup>
          {question.options?.map((option) => {
            const isSelected = currentValues.includes(option.value || "");

            return (
              <CommandItem
                key={option.id}
                value={option.value || ""}
                onSelect={() => handleValueToggle(option.value || "")}
                className="flex items-center gap-2 p-3"
              >
                <div className="flex items-center justify-center w-4 h-4 border border-gray-300 rounded-sm">
                  {isSelected && <Check className="h-3 w-3 text-primary" />}
                </div>
                <span>{option.label}</span>
              </CommandItem>
            );
          })}
        </CommandGroup>
      </CommandList>
    </Command>
  );
}

/**
 * MultipleSelectQuestion component - checkbox selection for multiple values or responsive select
 * Renders as responsive multi-select when question.config.use_select is true
 * Designed to work with react-hook-form Controller
 */
export function MultipleSelectQuestion({
  question,
  field,
  fieldState,
  disabled = false,
  className = "",
}: ControlledQuestionProps) {
  const [open, setOpen] = useState(false);
  const hasError = fieldState.invalid && fieldState.error;
  const errorMessage = fieldState.error?.message;
  const currentValues = field.value || [];
  const useSelect = question.config?.use_select === true;
  const isDesktop = useMediaQuery("(min-width: 768px)");

  const selectedOptions =
    question.options?.filter((option) =>
      currentValues.includes(option.value || "")
    ) || [];

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

  if (useSelect) {
    const displayText =
      selectedOptions.length > 0
        ? `${selectedOptions.length} selected`
        : "Select options...";

    // Desktop: Use Popover + Command
    if (isDesktop) {
      return (
        <div className={cn("space-y-2", className)}>
          <Label className="block">
            {question.title.replace(/<[^>]*>/g, "")}
            {question.is_required && (
              <span className="text-destructive ml-1" aria-label="required">
                *
              </span>
            )}
          </Label>

          <div className="space-y-2">
            <Popover open={open} onOpenChange={setOpen}>
              <PopoverTrigger asChild>
                <Button
                  variant="outline"
                  role="combobox"
                  aria-expanded={open}
                  className={cn(
                    "w-full justify-between",
                    hasError && "border-destructive focus:ring-destructive",
                    selectedOptions.length === 0 && "text-muted-foreground"
                  )}
                  disabled={disabled}
                  onBlur={field.onBlur}
                >
                  {displayText}
                </Button>
              </PopoverTrigger>
              <PopoverContent className="w-[400px] p-0" align="start">
                <MultiSelectOptionList
                  question={question}
                  field={field}
                  setOpen={setOpen}
                />
              </PopoverContent>
            </Popover>

            {/* Selected items display */}
            {selectedOptions.length > 0 && (
              <div className="flex flex-wrap gap-1">
                {selectedOptions.map((option) => (
                  <div
                    key={option.id}
                    className="inline-flex items-center gap-1 px-2 py-1 bg-secondary text-secondary-foreground rounded-md text-sm"
                  >
                    <span>{option.label}</span>
                    {!disabled && (
                      <button
                        type="button"
                        onClick={() =>
                          handleValueChange(option.value || "", false)
                        }
                        className="text-secondary-foreground hover:text-foreground"
                      >
                        <X className="h-3 w-3" />
                      </button>
                    )}
                  </div>
                ))}
              </div>
            )}
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

    // Mobile: Use Drawer
    return (
      <div className={cn("space-y-2", className)}>
        <Label className="block">
          {question.title.replace(/<[^>]*>/g, "")}
          {question.is_required && (
            <span className="text-destructive ml-1" aria-label="required">
              *
            </span>
          )}
        </Label>

        <div className="space-y-2">
          <Drawer open={open} onOpenChange={setOpen}>
            <DrawerTrigger asChild>
              <Button
                variant="outline"
                className={cn(
                  "w-full justify-start",
                  hasError && "border-destructive focus:ring-destructive",
                  selectedOptions.length === 0 && "text-muted-foreground"
                )}
                disabled={disabled}
                onBlur={field.onBlur}
              >
                {displayText}
              </Button>
            </DrawerTrigger>
            <DrawerContent>
              <DrawerHeader>
                <DrawerTitle>
                  {question.title.replace(/<[^>]*>/g, "")}
                </DrawerTitle>
              </DrawerHeader>
              <div className="px-4 pb-4">
                <MultiSelectOptionList
                  question={question}
                  field={field}
                  setOpen={setOpen}
                />
              </div>
            </DrawerContent>
          </Drawer>

          {/* Selected items display */}
          {selectedOptions.length > 0 && (
            <div className="flex flex-wrap gap-1">
              {selectedOptions.map((option) => (
                <div
                  key={option.id}
                  className="inline-flex items-center gap-1 px-2 py-1 bg-secondary text-secondary-foreground rounded-md text-sm"
                >
                  <span>{option.label}</span>
                  {!disabled && (
                    <button
                      type="button"
                      onClick={() =>
                        handleValueChange(option.value || "", false)
                      }
                      className="text-secondary-foreground hover:text-foreground"
                    >
                      <X className="h-3 w-3" />
                    </button>
                  )}
                </div>
              ))}
            </div>
          )}
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

  // Render as Checkboxes (default behavior)
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
                className={cn(hasError && "border-destructive")}
              />
              <Label
                htmlFor={`${field.name}-${option.id}`}
                className={cn(
                  "text-sm font-normal cursor-pointer",
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
