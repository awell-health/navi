import { useEffect, useCallback } from "react";
import type { UseFormWatch } from "react-hook-form";
import type { Question } from "@/lib/awell-client/generated/graphql";
import type { ActivityEvent } from "@awell-health/navi-core";
import { useActivityEvents } from "@/domains/communications";
import { ActivityEventHandlers } from "@awell-health/navi-core";

interface UseFormEventsProps {
  activityId: string;
  allQuestions: Question[];
  watch: UseFormWatch<Record<string, unknown>>;
  eventHandlers?: ActivityEventHandlers;
}

export function useFormEvents({
  activityId,
  allQuestions,
  watch,
  eventHandlers,
}: UseFormEventsProps) {
  // Activity events
  const { emitActivityEvent } = useActivityEvents(
    activityId,
    "FORM",
    eventHandlers
  );

  // Wrapper function to log all activity events
  const loggedEmitActivityEvent = useCallback(
    (type: ActivityEvent["type"], data?: Record<string, unknown>) => {
      emitActivityEvent(type, data);
    },
    [emitActivityEvent]
  );

  // Emit ready event when component mounts
  useEffect(() => {
    loggedEmitActivityEvent("activity-ready");
  }, [loggedEmitActivityEvent]);

  // Watch for form changes and emit activity events
  useEffect(() => {
    const subscription = watch((data, { name, type }) => {
      if (name && type === "change") {
        loggedEmitActivityEvent("activity-data-change", {
          field: name,
          value: data[name],
          currentData: data,
        });

        // Calculate progress across all questions
        const answeredFields = Object.entries(data).filter(
          ([fieldName, value]) => {
            // Skip description questions and check if field has meaningful value
            // Since we use question.id as field names, search by ID instead of key
            const question = allQuestions.find((q) => q.id === fieldName);
            if (!question || question.user_question_type === "DESCRIPTION")
              return false;

            const hasValue =
              value !== undefined && value !== null && value !== "";
            return hasValue;
          }
        ).length;

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
  }, [watch, allQuestions, loggedEmitActivityEvent]);

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

  const handleFormSubmit = async (
    activityId: string,
    data: Record<string, unknown>,
    onSubmit?: (
      activityId: string,
      data: Record<string, unknown>
    ) => Promise<void>
  ) => {
    console.log(`📝 Form submission for activity: ${activityId}`);
    console.log(`📊 Total fields in form data: ${Object.keys(data).length}`);
    console.log(`📋 Form data keys:`, Object.keys(data));
    console.log(
      `🎯 Form data with values:`,
      Object.entries(data).filter(
        ([, value]) => value !== "" && value !== undefined && value !== null
      )
    );

    try {
      if (onSubmit) {
        await onSubmit(activityId, data);
      }

      loggedEmitActivityEvent("activity-complete", {
        submissionData: {
          activityId,
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

  return {
    handleFormFocus,
    handleFormBlur,
    handleFormSubmit,
  };
}
