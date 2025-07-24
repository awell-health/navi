import React, { useState } from "react";
import { format, isValid, parseISO } from "date-fns";
import { ControlledQuestionProps } from "./types";
import { Button, Calendar, Label, Popover, PopoverContent, PopoverTrigger, Typography } from "@/components/ui";
import { cn } from "@/lib/utils";

/**
 * DateQuestion component - date picker with validation
 * Designed to work with react-hook-form Controller
 */
export function DateQuestion({
  question,
  field,
  fieldState,
  disabled = false,
  className = "",
}: ControlledQuestionProps) {
  const [isOpen, setIsOpen] = useState(false);
  const hasError = fieldState.invalid && fieldState.error;
  const errorMessage = fieldState.error?.message;
  const dateConfig = question.config?.date_validation;

  // Parse the current value
  const currentDate = field.value ? 
    (typeof field.value === 'string' ? parseISO(field.value) : field.value) : 
    undefined;

  const displayValue = currentDate && isValid(currentDate) ? 
    format(currentDate, "PPP") : 
    "Pick a date";

  const handleDateSelect = (date: Date | undefined) => {
    if (date) {
      // Convert to ISO string for consistent handling
      field.onChange(format(date, "yyyy-MM-dd"));
    } else {
      field.onChange("");
    }
    setIsOpen(false);
  };

  // Date constraints based on configuration
  const getDateConstraints = () => {
    const today = new Date();
    const constraints: any = {};

    if (dateConfig?.allowed_dates === "FUTURE") {
      constraints.disabled = (date: Date) => {
        if (dateConfig.include_date_of_response) {
          return date < today;
        } else {
          return date <= today;
        }
      };
    } else if (dateConfig?.allowed_dates === "PAST") {
      constraints.disabled = (date: Date) => {
        if (dateConfig.include_date_of_response) {
          return date > today;
        } else {
          return date >= today;
        }
      };
    }

    return constraints;
  };

  const dateConstraints = getDateConstraints();
  const helperText = dateConfig?.allowed_dates === "FUTURE" ? 
    "Select a future date" : 
    dateConfig?.allowed_dates === "PAST" ? 
    "Select a past date" : 
    undefined;

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
      
      <Popover open={isOpen} onOpenChange={setIsOpen}>
        <PopoverTrigger asChild>
          <Button
            id={field.name}
            variant="outline"
            disabled={disabled}
            className={cn(
              "w-full justify-start text-left font-normal",
              "font-[var(--font-family-body,inherit)]",
              "text-[var(--font-size-base,1rem)]",
              !currentDate && "text-muted-foreground",
              hasError && "border-destructive focus-visible:ring-destructive"
            )}
            aria-describedby={cn(
              helperText && !hasError && `${field.name}-helper`,
              hasError && `${field.name}-error`
            )}
            aria-invalid={!!hasError}
            onBlur={field.onBlur}
          >
            {displayValue}
          </Button>
        </PopoverTrigger>
        <PopoverContent className="w-auto p-0" align="start">
          <Calendar
            mode="single"
            selected={currentDate}
            onSelect={handleDateSelect}
            initialFocus
            {...dateConstraints}
          />
        </PopoverContent>
      </Popover>

      {/* Helper text */}
      {helperText && !hasError && (
        <Typography.Small
          id={`${field.name}-helper`}
          className="text-muted-foreground"
        >
          {helperText}
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