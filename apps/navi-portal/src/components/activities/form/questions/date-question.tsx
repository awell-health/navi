"use client";

import React, { useState } from "react";
import { format, isValid, parseISO } from "date-fns";
import { CalendarIcon } from "lucide-react";
import { ControlledQuestionProps } from "./types";
import type { Question } from "@/lib/awell-client/generated/graphql";
import {
  Button,
  Calendar,
  Label,
  Popover,
  PopoverContent,
  PopoverTrigger,
  Typography,
} from "@/components/ui";
import { cn } from "@/lib/utils";

/**
 * Date validation utility function for DateQuestion
 * Can be used by parent forms with react-hook-form validation rules
 */
export function createDateValidationRules(question: Question) {
  const rules: any = {};

  // Required validation
  if (question.is_required) {
    rules.required = "This field is required";
  }

  // Date constraint validation
  rules.validate = (value: Date | undefined) => {
    if (!value && !question.is_required) return true;
    if (!value && question.is_required) return "This field is required";
    if (!value) return true; // Additional safety check

    const today = new Date();
    today.setHours(0, 0, 0, 0);
    const selectedDate = new Date(value);
    selectedDate.setHours(0, 0, 0, 0);

    const dateConfig = question.config?.date_validation;

    if (dateConfig?.allowed_dates === "FUTURE") {
      if (dateConfig.include_date_of_response) {
        if (selectedDate < today) {
          return "Date must be today or in the future";
        }
      } else {
        if (selectedDate <= today) {
          return "Date must be in the future";
        }
      }
    } else if (dateConfig?.allowed_dates === "PAST") {
      if (dateConfig.include_date_of_response) {
        if (selectedDate > today) {
          return "Date must be today or in the past";
        }
      } else {
        if (selectedDate >= today) {
          return "Date must be in the past";
        }
      }
    }

    return true;
  };

  return rules;
}

/**
 * DateQuestion component - shadcn date picker with validation
 * Follows the exact shadcn date picker pattern
 */
export function DateQuestion({
  question,
  field,
  fieldState,
  disabled = false,
  className = "",
}: ControlledQuestionProps) {
  const [open, setOpen] = useState(false);
  const hasError = fieldState.invalid && fieldState.error;
  const errorMessage = fieldState.error?.message;
  const dateConfig = question.config?.date_validation;

  // Parse the current value - now expects Date objects directly
  const currentDate =
    field.value instanceof Date
      ? field.value
      : field.value && typeof field.value === "string" && field.value !== ""
      ? parseISO(field.value)
      : undefined;

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

      <Popover open={open} onOpenChange={setOpen}>
        <PopoverTrigger asChild>
          <Button
            id={field.name}
            variant="outline"
            disabled={disabled}
            data-empty={!currentDate}
            className={cn(
              "w-full justify-start text-left font-normal",
              "data-[empty=true]:text-muted-foreground",
              "font-[var(--font-family-body,inherit)]",
              "text-[var(--font-size-base,1rem)]",
              hasError && "border-destructive focus-visible:ring-destructive"
            )}
            aria-describedby={cn(hasError && `${field.name}-error`)}
            aria-invalid={!!hasError}
            onBlur={field.onBlur}
          >
            <CalendarIcon className="mr-2 h-4 w-4" />
            {currentDate && isValid(currentDate) ? (
              format(currentDate, "PPP")
            ) : (
              <span>Pick a date</span>
            )}
          </Button>
        </PopoverTrigger>
        <PopoverContent className="w-auto p-0">
          <Calendar
            mode="single"
            selected={currentDate}
            {...dateConstraints}
            onSelect={(date) => {
              field.onChange(date);
              setOpen(false);
            }}
          />
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
