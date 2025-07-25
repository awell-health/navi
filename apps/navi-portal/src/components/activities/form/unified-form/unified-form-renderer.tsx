import React, { useState, useEffect, useMemo, useCallback } from "react";
import { useForm } from "react-hook-form";
import { cn } from "@/lib/utils";
import { Button } from "@/components/ui/button";
import { Progress } from "@/components/ui/progress";
import { ChevronLeft, ChevronRight } from "lucide-react";
import type { ActivityEvent } from "@awell-health/navi-core";

import type {
  UnifiedFormRendererProps,
  FormNavigationState,
  FormData,
} from "./types";
import { generateFormPages, getAllQuestionsFromPages } from "./page-generator";
import { QuestionRenderer, createDefaultValues } from "./question-renderer";
import { useActivityEvents } from "@/domains/communications";

/**
 * Unified form renderer that supports traditional, conversational, and custom page breaks
 */
export function UnifiedFormRenderer({
  activity,
  config,
  disabled = false,
  className = "",
  eventHandlers,
  onSubmit,
}: UnifiedFormRendererProps) {
  // Extract form data from activity
  const activityForm = activity.inputs?.form;

  // Convert to FormData format (only if activityForm exists)
  const form: FormData | null = useMemo(
    () =>
      activityForm
        ? {
            id: activityForm.id,
            title: activityForm.title,
            questions: activityForm.questions || [],
          }
        : null,
    [activityForm]
  );

  // Generate pages based on configuration
  const pages = useMemo(
    () => (form ? generateFormPages(form, config) : []),
    [form, config]
  );

  const allQuestions = useMemo(() => getAllQuestionsFromPages(pages), [pages]);

  // Initialize react-hook-form with all questions
  const defaultValues = useMemo(
    () => createDefaultValues(allQuestions),
    [allQuestions]
  );

  const formMethods = useForm({
    defaultValues,
    mode: "onChange",
  });

  const { control, handleSubmit, formState, trigger, watch } = formMethods;

  // Activity events
  const { emitActivityEvent } = useActivityEvents(
    activity.id,
    "FORM",
    eventHandlers
  );

  // Navigation state
  const [currentPageIndex, setCurrentPageIndex] = useState(0);

  // Wrapper function to log all activity events with full structure
  const loggedEmitActivityEvent = useCallback(
    (type: ActivityEvent["type"], data?: Record<string, unknown>) => {
      emitActivityEvent(type, data);
    },
    [emitActivityEvent]
  );

  // Emit ready event when component mounts
  useEffect(() => {
    if (activityForm) {
      loggedEmitActivityEvent("activity-ready");
    }
  }, [activityForm, loggedEmitActivityEvent]);

  // Watch for form changes and emit activity events
  useEffect(() => {
    if (!activityForm) return;

    const subscription = watch((data, { name, type }) => {
      if (name && type === "change") {
        loggedEmitActivityEvent("activity-data-change", {
          field: name,
          value: data[name],
          currentData: data,
        });

        // Calculate progress across all questions
        const answeredFields = Object.entries(data).filter(([key, value]) => {
          // Skip description questions and check if field has meaningful value
          const question = allQuestions.find((q) => q.key === key);
          if (!question || question.user_question_type === "DESCRIPTION")
            return false;

          const hasValue =
            value !== undefined && value !== null && value !== "";
          return hasValue;
        }).length;

        const totalFields = allQuestions.filter(
          (q) => q.user_question_type !== "DESCRIPTION"
        ).length;

        loggedEmitActivityEvent("activity-progress", {
          progress: answeredFields,
          total: totalFields,
        });
      }
    });

    return () => subscription.unsubscribe();
  }, [watch, allQuestions, activityForm, loggedEmitActivityEvent]);

  // Early return for no form data - but after all hooks
  if (!activityForm || !form) {
    return (
      <div className={cn("navi-unified-form", className)}>
        <div className="p-6 text-center text-muted-foreground">
          No form data available
        </div>
      </div>
    );
  }

  // Now we can safely use form data
  const currentPage = pages[currentPageIndex];

  const navigationState: FormNavigationState = {
    currentPageIndex,
    totalPages: pages.length,
    isFirstPage: currentPageIndex === 0,
    isLastPage: currentPageIndex === pages.length - 1,
    canProceed: true, // Will be determined by validation
  };

  // Form focus/blur events - only emit when focus enters/leaves the form
  const handleFormFocus = (e: React.FocusEvent) => {
    // Only emit focus if focus is coming from outside the form
    if (!e.currentTarget.contains(e.relatedTarget as Node)) {
      loggedEmitActivityEvent("activity-focus");
    }
  };

  const handleFormBlur = (e: React.FocusEvent) => {
    // Only emit blur if focus is leaving the form entirely
    if (!e.currentTarget.contains(e.relatedTarget as Node)) {
      loggedEmitActivityEvent("activity-blur");
    }
  };

  // Navigation handlers
  const handleNext = async () => {
    const currentPageQuestionKeys = currentPage.questions
      .filter((q) => q.user_question_type !== "DESCRIPTION")
      .map((q) => q.key);

    const isValid = await trigger(currentPageQuestionKeys);

    if (isValid && !navigationState.isLastPage) {
      setCurrentPageIndex((prev) => prev + 1);
    }
  };

  const handlePrevious = () => {
    if (!navigationState.isFirstPage) {
      setCurrentPageIndex((prev) => prev - 1);
    }
  };

  const handleFormSubmit = async (data: Record<string, unknown>) => {
    // Prevent submission if not on last page
    if (!navigationState.isLastPage) {
      return;
    }

    try {
      if (onSubmit) {
        await onSubmit(activity.id, data);
      }

      loggedEmitActivityEvent("activity-complete", {
        submissionData: {
          activityId: activity.id,
          formData: data,
          timestamp: Date.now(),
        },
      });
    } catch (error) {
      loggedEmitActivityEvent("activity-error", {
        error: error instanceof Error ? error.message : "Failed to submit form",
      });
    }
  };

  // Calculate progress percentage based on pages for conversational forms
  const progressPercentage = ((currentPageIndex + 1) / pages.length) * 100;

  // Get display text for progress indicator
  const getProgressText = () => {
    if (config.mode === "conversational") {
      return `Question ${currentPageIndex + 1} of ${pages.length}`;
    } else {
      return `Step ${currentPageIndex + 1} of ${pages.length}`;
    }
  };

  return (
    <div className={cn("max-w-4xl mx-auto space-y-6", className)}>
      {/* Progress indicator */}
      {config.showProgress !== false && pages.length > 1 && (
        <div className="space-y-2">
          <div className="flex justify-between text-sm text-muted-foreground">
            <span>{getProgressText()}</span>
            <span>{Math.round(progressPercentage)}% complete</span>
          </div>
          <Progress value={progressPercentage} className="h-2" />
        </div>
      )}

      {/* Form content */}
      <form
        onSubmit={handleSubmit(handleFormSubmit)}
        onFocus={handleFormFocus}
        onBlur={handleFormBlur}
        className="space-y-8"
      >
        {/* Questions for current page */}
        <div className="space-y-6">
          {currentPage.questions.map((question) => (
            <div key={question.id} className="space-y-3">
              <QuestionRenderer
                question={question}
                control={control}
                errors={formState.errors}
                disabled={disabled}
              />
            </div>
          ))}
        </div>

        {/* Navigation */}
        {pages.length === 1 ? (
          // Single page - just show submit button
          <div className="flex justify-end pt-6">
            <Button
              type="submit"
              disabled={disabled || formState.isSubmitting}
              size="lg"
            >
              {formState.isSubmitting
                ? "Submitting..."
                : config.navigationText?.submit || "Complete Form"}
            </Button>
          </div>
        ) : (
          // Multi-page - show navigation
          <div className="flex justify-between items-center pt-6">
            <Button
              type="button"
              variant="outline"
              onClick={handlePrevious}
              disabled={navigationState.isFirstPage || disabled}
              className={navigationState.isFirstPage ? "invisible" : ""}
            >
              <ChevronLeft className="w-4 h-4 mr-2" />
              {config.navigationText?.previous || "Previous"}
            </Button>

            {navigationState.isLastPage ? (
              <Button
                type="submit"
                disabled={disabled || formState.isSubmitting}
                size="lg"
              >
                {formState.isSubmitting
                  ? "Submitting..."
                  : config.navigationText?.submit || "Complete Form"}
              </Button>
            ) : (
              <Button
                type="button"
                onClick={(e) => {
                  e.preventDefault(); // Prevent any form submission
                  handleNext();
                }}
                disabled={disabled}
                size="lg"
              >
                {config.navigationText?.next || "Next"}
                <ChevronRight className="w-4 h-4 ml-2" />
              </Button>
            )}
          </div>
        )}
      </form>
    </div>
  );
}
