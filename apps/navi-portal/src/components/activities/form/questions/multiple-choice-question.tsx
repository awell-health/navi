import React, { useState } from "react";
import { ControlledQuestionProps } from "./types";
import {
  RadioGroup,
  RadioGroupItem,
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
import { Check } from "lucide-react";
import type { Question } from "@/lib/awell-client/generated/graphql";
import { FieldValues } from "react-hook-form";

/**
 * Validation utility for MultipleChoiceQuestion
 * Co-located with component for maintainability
 */
export function createMultipleChoiceValidationRules(question: Question) {
  const rules: Record<string, unknown> = {};

  if (question.is_required) {
    rules.required = "This field is required";
  }

  // Validate that the selected value is one of the available options
  rules.validate = (value: string | undefined) => {
    if (!value && !question.is_required) return true;
    if (!value && question.is_required) return "This field is required";

    const validOptions = question.options?.map((option) => option.value) || [];
    if (validOptions.length > 0 && !validOptions.includes(value)) {
      return "Please select a valid option";
    }

    return true;
  };

  return rules;
}

interface OptionListProps {
  question: Question;
  field: FieldValues;
  setOpen: (open: boolean) => void;
}

function OptionList({ question, field, setOpen }: OptionListProps) {
  return (
    <Command>
      <CommandInput placeholder="Search options..." />
      <CommandList>
        <CommandEmpty>No options found.</CommandEmpty>
        <CommandGroup>
          {question.options?.map((option) => (
            <CommandItem
              key={option.id}
              value={option.value || ""}
              onSelect={(value) => {
                field.onChange(value);
                setOpen(false);
              }}
              className="flex items-center gap-2 p-3"
            >
              <Check
                className={cn(
                  "h-4 w-4",
                  field.value === option.value ? "opacity-100" : "opacity-0"
                )}
              />
              <span>{option.label}</span>
            </CommandItem>
          ))}
        </CommandGroup>
      </CommandList>
    </Command>
  );
}

/**
 * MultipleChoiceQuestion component - radio button selection or responsive select
 * Renders as responsive Select/Drawer when question.config.use_select is true
 * Designed to work with react-hook-form Controller
 */
export function MultipleChoiceQuestion({
  question,
  field,
  fieldState,
  disabled = false,
  className = "",
}: ControlledQuestionProps) {
  const [open, setOpen] = useState(false);
  const hasError = fieldState.invalid && fieldState.error;
  const errorMessage = fieldState.error?.message;
  const useSelect = question.config?.use_select === true;
  const isDesktop = useMediaQuery("(min-width: 768px)");

  const selectedOption = question.options?.find(
    (option) => option.value === field.value
  );

  if (useSelect) {
    const displayValue = selectedOption?.label || "";
    const placeholder = "Select an option...";

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

          <Popover open={open} onOpenChange={setOpen}>
            <PopoverTrigger asChild>
              <Button
                variant="outline"
                role="combobox"
                aria-expanded={open}
                className={cn(
                  "w-full justify-between",
                  hasError && "border-destructive focus:ring-destructive",
                  !selectedOption && "text-muted-foreground"
                )}
                disabled={disabled}
                onBlur={field.onBlur}
              >
                {displayValue || placeholder}
              </Button>
            </PopoverTrigger>
            <PopoverContent className="w-[400px] p-0" align="start">
              <OptionList question={question} field={field} setOpen={setOpen} />
            </PopoverContent>
          </Popover>

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

        <Drawer open={open} onOpenChange={setOpen}>
          <DrawerTrigger asChild>
            <Button
              variant="outline"
              className={cn(
                "w-full justify-start",
                hasError && "border-destructive focus:ring-destructive",
                !selectedOption && "text-muted-foreground"
              )}
              disabled={disabled}
              onBlur={field.onBlur}
            >
              {displayValue || placeholder}
            </Button>
          </DrawerTrigger>
          <DrawerContent>
            <DrawerHeader>
              <DrawerTitle>
                {question.title.replace(/<[^>]*>/g, "")}
              </DrawerTitle>
            </DrawerHeader>
            <div className="px-4 pb-4">
              <OptionList question={question} field={field} setOpen={setOpen} />
            </div>
          </DrawerContent>
        </Drawer>

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

  // Render as Radio buttons (default behavior)
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
        value={(field.value as string) || ""}
        onValueChange={field.onChange}
        onBlur={field.onBlur}
        disabled={disabled}
        className={cn(
          "space-y-2",
          hasError && "[&_[role=radio]]:border-destructive"
        )}
        aria-describedby={hasError ? `${field.name}-error` : undefined}
        aria-invalid={!!hasError}
      >
        {question.options?.map((option) => (
          <div key={option.id} className="flex items-center space-x-2">
            <RadioGroupItem
              value={option.value || ""}
              id={`${field.name}-${option.id}`}
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
