import React, { useState, useMemo } from "react";
import { ControlledQuestionProps } from "./types";
import type { Question } from "@/lib/awell-client/generated/graphql";
import { Slider, Label, Typography, Button } from "@/components/ui";
import { cn } from "@/lib/utils";
import { X } from "lucide-react";

/**
 * Slider validation utility function for SliderQuestion
 * Can be used by parent forms with react-hook-form validation rules
 * Similar to NumberQuestion but reads from slider config
 */
export function createSliderValidationRules(question: Question) {
  const rules: Record<string, unknown> = {};

  // Required validation
  if (question.is_required) {
    rules.required = "This field is required";
  }

  // Range validation from slider config
  const sliderConfig = question.config?.slider;

  if (sliderConfig) {
    if (sliderConfig.min !== null && sliderConfig.min !== undefined) {
      rules.min = {
        value: sliderConfig.min,
        message: `Must be at least ${sliderConfig.min}`,
      };
    }
    if (sliderConfig.max !== null && sliderConfig.max !== undefined) {
      rules.max = {
        value: sliderConfig.max,
        message: `Must be at most ${sliderConfig.max}`,
      };
    }
  }

  return rules;
}

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
  const [isActivated, setIsActivated] = useState(false);

  const hasError = fieldState.invalid && fieldState.error;
  const errorMessage = fieldState.error?.message;
  const sliderConfig = question.config?.slider;

  const min = sliderConfig?.min ?? 0;
  const max = sliderConfig?.max ?? 100;
  const step = sliderConfig?.step_value ?? 1;

  // Only use an actual value if one exists or if the field has been touched
  const hasValue =
    field.value !== null && field.value !== undefined && field.value !== "";
  const currentValue = hasValue
    ? (field.value as number)
    : fieldState.isTouched
    ? min
    : undefined;

  // For the slider component, we need a number array
  // When no value is set, position slider at min but with visual indication it's inactive
  // Use useMemo to prevent array recreation on every render (fixes max update depth error)
  const sliderValue = useMemo(() => {
    const value = currentValue !== undefined ? [currentValue] : [min];
    return value;
  }, [currentValue, min]);

  const handleActivate = () => {
    if (!isActivated) {
      setIsActivated(true);
    }
  };

  const handleValueChange = (values: number[]) => {
    field.onChange(values[0]);
  };

  const handleValueCommit = () => {
    // Only call onBlur if we have a value (user has interacted)
    if (currentValue !== undefined) {
      field.onBlur();
    }
  };

  const handleClear = () => {
    field.onChange(undefined);
    setIsActivated(false); // Reset activation state when cleared
  };

  return (
    <div className={cn("space-y-4", className)}>
      <div className="flex items-center justify-between min-h-[2rem]">
        <Label className="block">
          {question.title.replace(/<[^>]*>/g, "")}
          {question.is_required && (
            <span className="text-destructive ml-1" aria-label="required">
              *
            </span>
          )}
        </Label>

        {/* Clear button area - always reserve space */}
        <div className="w-8 h-8 flex items-center justify-center">
          {hasValue && !disabled && (
            <Button
              type="button"
              variant="ghost"
              size="sm"
              onClick={handleClear}
              className="h-auto p-1 text-muted-foreground hover:text-foreground"
              title="Clear selection"
            >
              <X className="h-4 w-4" />
            </Button>
          )}
        </div>
      </div>

      <div className="space-y-3">
        {/* Value display or placeholder */}
        {sliderConfig?.is_value_tooltip_on && (
          <div className="text-center">
            <Typography.Small className="font-medium">
              {hasValue ? (
                currentValue
              ) : (
                <span className="text-muted-foreground italic">
                  No value selected
                </span>
              )}
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

        {/* Slider component with hover tooltip */}
        <div className="px-2 relative group">
          <Slider
            value={sliderValue}
            onValueChange={handleValueChange}
            onValueCommit={handleValueCommit}
            onTouchStart={handleActivate}
            onMouseDown={handleActivate}
            min={min}
            max={max}
            step={step}
            disabled={disabled}
            className={cn(
              "w-full py-8 z-20", // Add significant vertical padding for larger touch area
              hasError && "data-[disabled]:opacity-50",
              // Visual indication that no value is selected
              !hasValue && !isActivated && "opacity-50"
            )}
            aria-describedby={hasError ? `${field.name}-error` : undefined}
            aria-invalid={!!hasError}
          />

          {/* Tick marks for display - positioned right under the slider */}
          {sliderConfig?.display_marks && (
            <div className="flex justify-between px-2 -mt-4 z-10">
              {Array.from(
                { length: Math.floor((max - min) / step) + 1 },
                (_, i) => {
                  const value = min + i * step;
                  return (
                    <div
                      key={value}
                      className="w-px h-2 bg-muted-foreground/50"
                      title={value.toString()}
                    />
                  );
                }
              )}
            </div>
          )}

          {/* Hover tooltip for inactive state */}
          {!hasValue && !isActivated && (
            <div className="absolute -top-8 left-1/2 transform -translate-x-1/2 bg-popover text-popover-foreground px-2 py-1 rounded text-xs opacity-0 group-hover:opacity-100 transition-opacity pointer-events-none whitespace-nowrap border shadow-sm">
              Touch to activate
            </div>
          )}
        </div>
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
