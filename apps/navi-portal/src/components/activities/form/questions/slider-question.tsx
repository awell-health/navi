import React from "react";
import { ControlledQuestionProps } from "./types";
import { Slider, Label, Typography } from "@/components/ui";
import { cn } from "@/lib/utils";

/**
 * SliderQuestion component - range slider input
 * Designed to work with react-hook-form Controller
 */
export function SliderQuestion({
  question,
  field,
  fieldState,
  disabled = false,
  className = "",
}: ControlledQuestionProps) {
  const hasError = fieldState.invalid && fieldState.error;
  const errorMessage = fieldState.error?.message;
  const sliderConfig = question.config?.slider;

  const min = sliderConfig?.min ?? 0;
  const max = sliderConfig?.max ?? 100;
  const step = sliderConfig?.step_value ?? 1;
  const currentValue = field.value ?? min;

  const handleValueChange = (values: number[]) => {
    field.onChange(values[0]);
  };

  return (
    <div className={cn("space-y-4", className)}>
      <Label className="block">
        {question.title.replace(/<[^>]*>/g, "")}
        {question.is_required && (
          <span className="text-destructive ml-1" aria-label="required">
            *
          </span>
        )}
      </Label>
      
      <div className="space-y-3">
        {/* Value display */}
        {sliderConfig?.is_value_tooltip_on && (
          <div className="text-center">
            <Typography.Small className="font-medium">
              {currentValue}
            </Typography.Small>
          </div>
        )}

        {/* Min/Max labels */}
        {sliderConfig?.show_min_max_values && (
          <div className="flex justify-between text-sm text-muted-foreground">
            <span>{sliderConfig?.min_label || min}</span>
            <span>{sliderConfig?.max_label || max}</span>
          </div>
        )}

        {/* Slider component */}
        <div className="px-2">
          <Slider
            value={[currentValue]}
            onValueChange={handleValueChange}
            onValueCommit={() => field.onBlur()}
            min={min}
            max={max}
            step={step}
            disabled={disabled}
            className={cn(
              "w-full",
              hasError && "data-[disabled]:opacity-50"
            )}
            aria-describedby={hasError ? `${field.name}-error` : undefined}
            aria-invalid={!!hasError}
          />
        </div>

        {/* Min/Max values for display marks */}
        {sliderConfig?.display_marks && (
          <div className="flex justify-between text-xs text-muted-foreground px-2">
            {Array.from({ length: Math.floor((max - min) / step) + 1 }, (_, i) => {
              const value = min + (i * step);
              return (
                <span key={value} className="text-center">
                  {value}
                </span>
              );
            })}
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