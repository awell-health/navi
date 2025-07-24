import React from "react";
import { ControlledQuestionProps } from "./types";
import { Input, Label, Typography } from "@/components/ui";
import { cn } from "@/lib/utils";

/**
 * TelephoneQuestion component - phone number input with country support
 * Designed to work with react-hook-form Controller
 * Uses basic HTML input with pattern validation for simplicity
 */
export function TelephoneQuestion({
  question,
  field,
  fieldState,
  disabled = false,
  className = "",
}: ControlledQuestionProps) {
  const hasError = fieldState.invalid && fieldState.error;
  const errorMessage = fieldState.error?.message;
  const phoneConfig = question.config?.phone;
  
  // Get default country or available countries info
  const defaultCountry = phoneConfig?.default_country || "US";
  const availableCountries = phoneConfig?.available_countries || [];
  
  // Create helper text based on configuration
  const getHelperText = () => {
    if (availableCountries.length > 0) {
      if (availableCountries.length === 1) {
        return `Enter a ${defaultCountry} phone number`;
      } else {
        return `Enter a phone number (${availableCountries.join(", ")})`;
      }
    }
    return "Enter a valid phone number";
  };

  const helperText = getHelperText();

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
        type="tel"
        autoComplete="tel"
        placeholder={defaultCountry === "US" ? "+1 (555) 123-4567" : "+44 20 7946 0958"}
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