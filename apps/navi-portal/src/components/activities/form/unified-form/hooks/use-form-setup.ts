import { useMemo, useEffect } from "react";
import { useForm } from "react-hook-form";
import type { FormData, UnifiedFormConfig, FormActivity } from "../types";
import { generateFormPages, getAllQuestionsFromPages } from "../page-generator";
import { createDefaultValues } from "../question-renderer";

interface UseFormSetupProps {
  activity: FormActivity;
  config: UnifiedFormConfig;
}

export function useFormSetup({ activity, config }: UseFormSetupProps) {
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
    const values = createDefaultValues(allQuestions);
    console.log(
      `🔍 Form initialized with ${allQuestions.length} questions for activity: ${activity.id}`
    );
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
  }, [allQuestions, activity.id]);

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
