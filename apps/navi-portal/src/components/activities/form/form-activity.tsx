import React, { useEffect, useState } from "react";
import type {
  BaseActivityProps,
  FormActivity,
  FormFieldEvent,
} from "@awell-health/navi-core";
import { useActivityEvents } from "../../../hooks/use-activity-events";
import {
  Input,
  Textarea,
  RadioGroup,
  RadioGroupItem,
  Checkbox,
  Label,
  Button,
} from "@/components/ui";
import { cn } from "@/lib/utils";
import { Question, QuestionOption } from "@/lib/awell-client/generated/graphql";

export interface FormActivityProps extends BaseActivityProps {
  activity: FormActivity;
  onSubmit?: (
    activityId: string,
    data: Record<string, unknown>
  ) => void | Promise<void>;
}

/**
 * FormActivity component - manages form lifecycle and aggregates field events
 * Uses shadcn/ui components following the Form Components Plan
 */
export function Form({
  activity,
  disabled = false,
  className = "",
  eventHandlers,
  onSubmit,
}: FormActivityProps) {
  const { emitActivityEvent, handleFieldEvent } = useActivityEvents(
    activity.id,
    "FORM",
    eventHandlers
  );

  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const [formData, setFormData] = useState<Record<string, any>>({});
  const [focusedField, setFocusedField] = useState<string | null>(null);

  const form = activity.inputs?.form;
  const questions = form?.questions || [];

  // Emit ready event when component mounts
  useEffect(() => {
    emitActivityEvent("activity-ready");
  }, [emitActivityEvent]);

  // Calculate and emit progress when form data changes
  useEffect(() => {
    const answeredCount = Object.keys(formData).filter((key) => {
      const value = formData[key];
      return value !== undefined && value !== null && value !== "";
    }).length;

    emitActivityEvent("activity-progress", {
      progress: answeredCount,
      total: questions.length,
    });
  }, [formData, questions.length, emitActivityEvent]);

  /**
   * @param questionKey - The key of the question that was changed
   * @param value - The value of the question that was changed
   */
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const handleFieldChange = (questionKey: string, value: any) => {
    // Update form data
    setFormData((prev) => {
      const newData = { ...prev, [questionKey]: value };

      // Emit data change event with current form state
      emitActivityEvent("activity-data-change", {
        field: questionKey,
        value: value,
        currentData: newData,
      });

      return newData;
    });

    // Create field event
    const fieldEvent: FormFieldEvent = {
      type: "field-change",
      fieldId: questionKey,
      questionKey,
      data: { value },
      timestamp: Date.now(),
    };

    // Let the activity hook handle the field event
    handleFieldEvent(fieldEvent);
  };

  const handleFieldFocus = (questionKey: string) => {
    setFocusedField(questionKey);

    const fieldEvent: FormFieldEvent = {
      type: "field-focus",
      fieldId: questionKey,
      questionKey,
      timestamp: Date.now(),
    };

    handleFieldEvent(fieldEvent);
    emitActivityEvent("activity-focus");
  };

  const handleFieldBlur = (questionKey: string) => {
    setFocusedField(null);

    const fieldEvent: FormFieldEvent = {
      type: "field-blur",
      fieldId: questionKey,
      questionKey,
      timestamp: Date.now(),
    };

    handleFieldEvent(fieldEvent);
    emitActivityEvent("activity-blur");
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    try {
      if (onSubmit) {
        await onSubmit(activity.id, formData);
      }

      // Emit completion event
      emitActivityEvent("activity-complete", {
        submissionData: {
          activityId: activity.id,
          formData,
          timestamp: Date.now(),
        },
      });
    } catch (error) {
      emitActivityEvent("activity-error", {
        error: error instanceof Error ? error.message : "Failed to submit form",
      });
    }
  };

  const renderQuestionField = (question: Question) => {
    const value = formData[question.key] || "";
    const isFocused = focusedField === question.key;

    switch (question.user_question_type) {
      case "SHORT_TEXT":
        return (
          <Input
            type="text"
            value={value}
            placeholder={question.config?.input_validation?.helper_text || ""}
            onChange={(e) => handleFieldChange(question.key, e.target.value)}
            onFocus={() => handleFieldFocus(question.key)}
            onBlur={() => handleFieldBlur(question.key)}
            disabled={disabled}
            className={cn(isFocused && "ring-2 ring-primary/20")}
          />
        );

      case "LONG_TEXT":
        return (
          <Textarea
            value={value}
            placeholder={question.config?.input_validation?.helper_text || ""}
            onChange={(e) => handleFieldChange(question.key, e.target.value)}
            onFocus={() => handleFieldFocus(question.key)}
            onBlur={() => handleFieldBlur(question.key)}
            disabled={disabled}
            rows={4}
            className={cn(isFocused && "ring-2 ring-primary/20")}
          />
        );

      case "NUMBER":
        return (
          <Input
            type="number"
            value={value}
            onChange={(e) => handleFieldChange(question.key, e.target.value)}
            onFocus={() => handleFieldFocus(question.key)}
            onBlur={() => handleFieldBlur(question.key)}
            disabled={disabled}
            className={cn(isFocused && "ring-2 ring-primary/20")}
          />
        );

      case "EMAIL":
        return (
          <Input
            type="email"
            value={value}
            onChange={(e) => handleFieldChange(question.key, e.target.value)}
            onFocus={() => handleFieldFocus(question.key)}
            onBlur={() => handleFieldBlur(question.key)}
            disabled={disabled}
            className={cn(isFocused && "ring-2 ring-primary/20")}
          />
        );

      case "YES_NO":
        return (
          <RadioGroup
            value={value}
            onValueChange={(newValue) =>
              handleFieldChange(question.key, newValue)
            }
            onFocus={() => handleFieldFocus(question.key)}
            onBlur={() => handleFieldBlur(question.key)}
            disabled={disabled}
            className="flex flex-row gap-6"
          >
            <div className="flex items-center space-x-2">
              <RadioGroupItem value="yes" id={`${question.key}-yes`} />
              <Label htmlFor={`${question.key}-yes`}>Yes</Label>
            </div>
            <div className="flex items-center space-x-2">
              <RadioGroupItem value="no" id={`${question.key}-no`} />
              <Label htmlFor={`${question.key}-no`}>No</Label>
            </div>
          </RadioGroup>
        );

      case "MULTIPLE_CHOICE":
        return (
          <RadioGroup
            value={value}
            onValueChange={(newValue) =>
              handleFieldChange(question.key, newValue)
            }
            onFocus={() => handleFieldFocus(question.key)}
            onBlur={() => handleFieldBlur(question.key)}
            disabled={disabled}
          >
            {question.options?.map((option: QuestionOption) => (
              <div key={option.id} className="flex items-center space-x-2">
                <RadioGroupItem
                  value={option.value || ""}
                  id={`${question.key}-${option.id}`}
                />
                <Label htmlFor={`${question.key}-${option.id}`}>
                  {option.label}
                </Label>
              </div>
            ))}
          </RadioGroup>
        );

      case "MULTIPLE_SELECT":
        const selectedValues = Array.isArray(value) ? value : [];
        return (
          <div className="space-y-3">
            {question.options?.map((option: QuestionOption) => (
              <div key={option.id} className="flex items-center space-x-2">
                <Checkbox
                  id={`${question.key}-${option.id}`}
                  checked={selectedValues.includes(option.value)}
                  onCheckedChange={(checked) => {
                    const newValues = checked
                      ? [...selectedValues, option.value]
                      : selectedValues.filter(
                          (v: string) => v !== option.value
                        );
                    handleFieldChange(question.key, newValues);
                  }}
                  onFocus={() => handleFieldFocus(question.key)}
                  onBlur={() => handleFieldBlur(question.key)}
                  disabled={disabled}
                />
                <Label htmlFor={`${question.key}-${option.id}`}>
                  {option.label}
                </Label>
              </div>
            ))}
          </div>
        );

      default:
        return (
          <Input
            type="text"
            value={value}
            placeholder={question.config?.input_validation?.helper_text || ""}
            onChange={(e) => handleFieldChange(question.key, e.target.value)}
            onFocus={() => handleFieldFocus(question.key)}
            onBlur={() => handleFieldBlur(question.key)}
            disabled={disabled}
            className={cn(isFocused && "ring-2 ring-primary/20")}
          />
        );
    }
  };

  if (!form) {
    return (
      <div className={cn("navi-form-activity", className)}>
        <div>No form data available</div>
      </div>
    );
  }

  const answeredCount = Object.keys(formData).filter((key) => {
    const value = formData[key];
    return value !== undefined && value !== null && value !== "";
  }).length;

  return (
    <div className={cn("navi-form-activity", className)}>
      {/* Header */}
      <div className="mb-8">
        <h1 className="text-2xl font-bold text-foreground mb-2">
          {form.title}
        </h1>
        <div className="flex gap-4 text-sm text-muted-foreground">
          <span>Form • {activity.status}</span>
          <span>
            {answeredCount} of {questions.length} questions answered
          </span>
        </div>
      </div>

      {/* Form */}
      <form onSubmit={handleSubmit} className="space-y-6">
        {questions.map((question) => (
          <div
            key={question.id}
            className="space-y-3 p-6 bg-card border border-customborder rounded-lg"
          >
            <Label
              htmlFor={question.key}
              className="text-base font-medium text-foreground"
            >
              {question.title}
              {question.is_required && (
                <span className="text-destructive ml-1">*</span>
              )}
            </Label>
            <div id={question.key}>{renderQuestionField(question)}</div>
          </div>
        ))}

        {/* Submit Button */}
        <div className="flex justify-end pt-4">
          <Button type="submit" disabled={disabled} size="lg">
            Submit Form
          </Button>
        </div>
      </form>
    </div>
  );
}
