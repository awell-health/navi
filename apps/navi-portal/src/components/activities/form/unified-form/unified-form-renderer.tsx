import React, { useEffect, useMemo } from "react";
import { cn } from "@/lib/utils";

import type { UnifiedFormRendererProps } from "./types";
import { QuestionRenderer } from "./question-renderer";
import { useFormSetup } from "./hooks/use-form-setup";
import { useFormNavigation } from "./hooks/use-form-navigation";
import { useFormEvents } from "./hooks/use-form-events";
import { useQuestionVisibility } from "./hooks/use-question-visibility";
import { RuleService } from "./services/rule-service";
import { FormProgress } from "./components/form-progress";
import { FormNavigation } from "./components/form-navigation";

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
  // Setup form data and initialization
  const { pages, allQuestions, formMethods } = useFormSetup({
    activity,
    config,
  });

  const { control, handleSubmit, formState, trigger, watch } = formMethods;

  // Initialize rule service
  const ruleService = useMemo(() => new RuleService(), []);

  // Question visibility management
  const { isQuestionVisible, visibilityState } = useQuestionVisibility({
    questions: allQuestions,
    fieldErrors: formState.errors,
    ruleService,
    watch,
  });

  const visiblePages = useMemo(() => {
    return pages
      .map((page) => ({
        ...page,
        questions: page.questions.filter((question) =>
          isQuestionVisible(question.id)
        ),
      }))
      .filter((page) => page.questions.length > 0); // Remove empty pages
  }, [pages, visibilityState]);

  // Navigation state and handlers
  const {
    currentPage,
    navigationState,
    handleNext,
    handlePrevious,
    getProgressText,
    progressPercentage,
  } = useFormNavigation({
    pages: visiblePages,
    trigger,
  });

  // Activity events and form submission
  const { handleFormFocus, handleFormBlur, handleFormSubmit } = useFormEvents({
    activityId: activity.id,
    allQuestions,
    watch,
    eventHandlers,
  });

  // Form submission handler
  const onFormSubmit = async (data: Record<string, unknown>) => {
    // Prevent submission if not on last page
    if (!navigationState.isLastPage) {
      return;
    }

    const filteredData = Object.fromEntries(
      Object.entries(data).filter(([questionId]) =>
        isQuestionVisible(questionId)
      )
    );

    const wrappedOnSubmit = onSubmit
      ? async (id: string, data: Record<string, unknown>) => {
          const result = onSubmit(id, data);
          if (result instanceof Promise) {
            await result;
          }
        }
      : undefined;

    await handleFormSubmit(activity.id, filteredData, wrappedOnSubmit);
  };

  return (
    <div className={cn("max-w-4xl mx-auto space-y-6", className)}>
      {/* Progress indicator */}
      <FormProgress
        progressPercentage={progressPercentage}
        progressText={getProgressText(config.mode)}
        showProgress={config.showProgress}
        totalPages={visiblePages.length}
      />

      {/* Form content */}
      <form
        onSubmit={handleSubmit(onFormSubmit)}
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
                isVisible={isQuestionVisible(question.id)}
              />
            </div>
          ))}
        </div>

        {/* Navigation */}
        <FormNavigation
          navigationState={navigationState}
          totalPages={visiblePages.length}
          disabled={disabled}
          isSubmitting={formState.isSubmitting}
          navigationText={config.navigationText}
          onPrevious={handlePrevious}
          onNext={handleNext}
          onSubmit={() => {
            /* Submit is handled by form onSubmit */
          }}
        />
      </form>
    </div>
  );
}
