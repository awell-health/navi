import React from "react";
import { ControlledQuestionProps } from "./types";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue, Label, Typography } from "@/components/ui";
import { cn } from "@/lib/utils";

/**
 * ICD10Question component - special select for ICD-10 classification codes
 * Designed to work with react-hook-form Controller
 * Note: This is a placeholder implementation. In a real application,
 * you would integrate with an ICD-10 API or database for code lookup.
 */
export function ICD10Question({
  question,
  field,
  fieldState,
  disabled = false,
  className = "",
}: ControlledQuestionProps) {
  const hasError = fieldState.invalid && fieldState.error;
  const errorMessage = fieldState.error?.message;

  // Placeholder ICD-10 codes - in a real app, this would come from an API
  const commonICD10Codes = [
    { code: "Z00.00", description: "Encounter for general adult medical examination without abnormal findings" },
    { code: "Z51.11", description: "Encounter for antineoplastic chemotherapy" },
    { code: "I10", description: "Essential (primary) hypertension" },
    { code: "E11.9", description: "Type 2 diabetes mellitus without complications" },
    { code: "J45.9", description: "Asthma, unspecified" },
    { code: "M79.3", description: "Panniculitis, unspecified" },
    { code: "R06.02", description: "Shortness of breath" },
    { code: "R50.9", description: "Fever, unspecified" },
    { code: "K59.00", description: "Constipation, unspecified" },
    { code: "R68.84", description: "Jaw pain" },
  ];

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
      
      <Select
        value={field.value || ""}
        onValueChange={field.onChange}
        disabled={disabled}
      >
        <SelectTrigger 
          className={cn(
            "w-full",
            "font-[var(--font-family-body,inherit)]",
            "text-[var(--font-size-base,1rem)]",
            hasError && "border-destructive focus:ring-destructive"
          )}
          aria-describedby={cn(
            !hasError && `${field.name}-helper`,
            hasError && `${field.name}-error`
          )}
          aria-invalid={!!hasError}
          onBlur={field.onBlur}
        >
          <SelectValue placeholder="Select an ICD-10 code..." />
        </SelectTrigger>
        <SelectContent>
          {commonICD10Codes.map((item) => (
            <SelectItem key={item.code} value={item.code}>
              <div className="flex flex-col items-start">
                <span className="font-medium">{item.code}</span>
                <span className="text-sm text-muted-foreground">{item.description}</span>
              </div>
            </SelectItem>
          ))}
        </SelectContent>
      </Select>

      {/* Helper text */}
      {!hasError && (
        <Typography.Small
          id={`${field.name}-helper`}
          className="text-muted-foreground"
        >
          Search and select the appropriate ICD-10 classification code
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