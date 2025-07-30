import { useMemo, useEffect } from "react";
import { useForm } from "react-hook-form";
import type { FormData, UnifiedFormConfig, FormActivity } from "../types";
import { generateFormPages, getAllQuestionsFromPages } from "../page-generator";
import { createDefaultValues } from "../question-renderer";
import { FormActivityOutput } from "@/lib/awell-client/generated/graphql";

interface UseFormSetupProps {
  activity: FormActivity;
  config: UnifiedFormConfig;
  disabled?: boolean;
}

export function useFormSetup({
  activity,
  config,
  disabled = false,
}: UseFormSetupProps) {
  // Extract form data from activity (guaranteed to exist due to FormActivity type)
  const activityForm = activity.inputs.form;

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
  const defaultValues = useMemo(() => {
    let values: Record<string, unknown>;

    // For completed forms, use the response data as default values
    if (
      disabled &&
      activity.outputs &&
      (activity.outputs as FormActivityOutput).response
    ) {
      const response = (activity.outputs as FormActivityOutput).response;
      const completionData = response as Record<string, unknown>;
      values = createDefaultValues(allQuestions);

      // Populate with completion data
      Object.keys(completionData).forEach((key) => {
        if (values.hasOwnProperty(key)) {
          values[key] = completionData[key];
        }
      });

      console.log(
        `🔍 Completed form loaded with ${allQuestions.length} questions for activity: ${activity.id}`
      );
      console.log("📋 Completion data:", completionData);
    } else {
      // For active forms, use empty default values
      values = createDefaultValues(allQuestions);
      console.log(
        `🔍 Active form initialized with ${allQuestions.length} questions for activity: ${activity.id}`
      );
    }

    console.log(
      "📋 Questions:",
      allQuestions.map((q) => ({
        id: q.id,
        key: q.key,
        type: q.user_question_type,
      }))
    );
    console.log("🏗️ Default values:", values);
    return values;
  }, [allQuestions, activity.id, disabled, activity.outputs]);

  const formMethods = useForm({
    defaultValues,
    mode: "onChange",
  });

  const { reset, getValues } = formMethods;

  // Reset form when activity changes to prevent state contamination
  useEffect(() => {
    console.log(`🔄 Resetting form for activity: ${activity.id}`);
    console.log(`📊 Current form values before reset:`, getValues());
    reset(defaultValues);
    console.log(`✅ Form reset complete for activity: ${activity.id}`);
  }, [activity.id, defaultValues, reset, getValues]);

  return {
    form,
    pages,
    allQuestions,
    formMethods,
    isFormReady: true, // UFR: is this necessary?
  };
}
