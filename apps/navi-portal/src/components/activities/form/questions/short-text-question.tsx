import React, { useState, useEffect } from "react";
import { BaseQuestionProps } from "../types";
import { Input } from "@/components/ui";
import { cn } from "@/lib/utils";

export interface ShortTextQuestionProps extends Omit<BaseQuestionProps, "onChange"> {
  value?: string;
  onChange?: (value: string) => void;
}

/**
 * ShortTextQuestion component - single line text input with validation
 * Supports regex pattern validation from config.input_validation
 */
export function ShortTextQuestion({
  question,
  value = "",
  onChange,
  onFocus,
  onBlur,
  disabled = false,
  error,
  className = "",
}: ShortTextQuestionProps) {
  const [internalValue, setInternalValue] = useState(value);
  const [validationError, setValidationError] = useState<string | null>(null);
  const [isTouched, setIsTouched] = useState(false);

  const inputValidation = question.config?.input_validation;
  const pattern = inputValidation?.pattern;
  const helperText = inputValidation?.helper_text;

  // Update internal value when external value changes
  useEffect(() => {
    setInternalValue(value);
  }, [value]);

  // Validate input against pattern
  const validateInput = (inputValue: string) => {
    if (!pattern || !inputValue) {
      setValidationError(null);
      return true;
    }

    try {
      const regex = new RegExp(pattern);
      const isValid = regex.test(inputValue);
      setValidationError(isValid ? null : helperText || "Invalid input");
      return isValid;
    } catch (e) {
      // Invalid regex pattern
      setValidationError(null);
      return true;
    }
  };

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const newValue = e.target.value;
    setInternalValue(newValue);
    
    if (onChange) {
      onChange(newValue);
    }

    // Only validate if touched to avoid immediate errors
    if (isTouched) {
      validateInput(newValue);
    }
  };

  const handleFocus = () => {
    if (!disabled && onFocus) {
      onFocus();
    }
  };

  const handleBlur = () => {
    setIsTouched(true);
    
    // Validate on blur
    if (internalValue) {
      validateInput(internalValue);
    }

    if (!disabled && onBlur) {
      onBlur();
    }
  };

  const hasError = error || validationError;
  const isRequired = question.is_required || question.config?.mandatory;

  return (
    <div className={cn("space-y-2", className)}>
      <Input
        type="text"
        value={internalValue}
        placeholder={helperText || "Enter text..."}
        onChange={handleChange}
        onFocus={handleFocus}
        onBlur={handleBlur}
        disabled={disabled}
        required={isRequired}
        aria-invalid={hasError ? "true" : "false"}
        aria-describedby={hasError ? `${question.key}-error` : undefined}
        className={cn(
          hasError && "border-destructive focus:border-destructive",
        )}
      />
      
      {hasError && (
        <div 
          id={`${question.key}-error`}
          className="text-sm text-destructive"
          role="alert"
          aria-live="polite"
        >
          {hasError}
        </div>
      )}
    </div>
  );
}