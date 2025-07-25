import React, { useMemo, useCallback } from "react";
import { ControlledQuestionProps } from "./types";
import type { Question } from "@/lib/awell-client/generated/graphql";
import { PhoneInput, Label, Typography } from "@/components/ui";
import { cn } from "@/lib/utils";
import { isValidPhoneNumber, parsePhoneNumber } from "react-phone-number-input";
import type { Country, Value as PhoneValue } from "react-phone-number-input";

/**
 * Telephone validation utility function for TelephoneQuestion
 * Uses react-phone-number-input for proper phone validation
 */
export function createTelephoneValidationRules(question: Question) {
  const rules: Record<string, unknown> = {};

  // Required validation
  if (question.is_required) {
    rules.required = "This field is required";
  }

  // Phone number validation using react-phone-number-input
  rules.validate = (value: string | undefined) => {
    if (!value) return true; // Let required handle empty values

    try {
      // Check if it's a valid phone number (with type assertion since we checked above)
      const isValid = isValidPhoneNumber(value as string);
      if (!isValid) {
        return "Please enter a valid phone number";
      }

      // Additional validation: check if country is allowed
      const phoneConfig = question.config?.phone;
      if (
        phoneConfig?.available_countries &&
        phoneConfig.available_countries.length > 0
      ) {
        const parsed = parsePhoneNumber(value as string);
        if (
          parsed &&
          parsed.country &&
          !phoneConfig.available_countries.includes(parsed.country)
        ) {
          return "This country is not allowed for this field";
        }
      }

      return true;
    } catch {
      return "Please enter a valid phone number";
    }
  };

  return rules;
}

/**
 * TelephoneQuestion component - international phone input with country selection
 * Uses shadcn PhoneInput component with react-phone-number-input
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

  // Process country configuration
  const { defaultCountry, allowedCountries } = useMemo(() => {
    const defaultCountry = (phoneConfig?.default_country as Country) || "US";
    let allowedCountries =
      (phoneConfig?.available_countries as Country[]) || [];

    // If no allowed countries specified, allow all countries (empty array means all allowed)
    if (!allowedCountries || allowedCountries.length === 0) {
      allowedCountries = []; // Empty array means all countries allowed in react-phone-number-input
    } else {
      // Ensure default country is always included in allowed countries
      if (!allowedCountries.includes(defaultCountry)) {
        allowedCountries = [defaultCountry, ...allowedCountries];
      }
    }

    return { defaultCountry, allowedCountries };
  }, [phoneConfig]);

  // Custom onChange handler to better handle pasted international numbers
  const handlePhoneChange = useCallback(
    (value: PhoneValue) => {
      // When a value is pasted/entered, parse it to detect country automatically
      if (value && typeof value === "string" && value.startsWith("+")) {
        try {
          const parsed = parsePhoneNumber(value);
          if (parsed && parsed.country) {
            // Check if the detected country is allowed
            if (
              !allowedCountries.length ||
              allowedCountries.includes(parsed.country)
            ) {
              // Let the component handle the country detection naturally
              field.onChange(value);
              return;
            }
          }
        } catch {
          // If parsing fails, continue with normal flow
        }
      }

      // Default behavior
      field.onChange(value);
    },
    [field, allowedCountries]
  );

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

      <PhoneInput
        value={field.value as PhoneValue}
        onChange={handlePhoneChange}
        onBlur={field.onBlur}
        name={field.name}
        id={field.name}
        autoComplete="tel"
        defaultCountry={defaultCountry}
        countries={allowedCountries.length > 0 ? allowedCountries : undefined}
        international={true} // Allow international format for auto-detection
        countryCallingCodeEditable={true} // Allow country code editing for auto-detection
        addInternationalOption={true} // Add "International" option to country list
        initialValueFormat="national" // But start with national format when no value
        disabled={disabled}
        className={cn(
          "font-[var(--font-family-body,inherit)]",
          "text-[var(--font-size-base,1rem)]",
          "leading-[var(--line-height-normal,1.5)]",
          hasError &&
            "[&_input]:border-destructive [&_input]:focus-visible:ring-destructive [&_button]:border-destructive"
        )}
        aria-describedby={hasError ? `${field.name}-error` : undefined}
        aria-invalid={!!hasError}
      />

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
