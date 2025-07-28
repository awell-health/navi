import React from "react";
import { Controller, Control, FieldErrors } from "react-hook-form";
import type {
  Question,
  UserQuestionType,
} from "@/lib/awell-client/generated/graphql";
import { ControlledQuestionProps } from "../questions/types";

// Import all the question components
import { DescriptionQuestion } from "../questions/description-question";
import {
  ShortTextQuestion,
  createShortTextValidationRules,
} from "../questions/short-text-question";
import {
  EmailQuestion,
  createEmailValidationRules,
} from "../questions/email-question";
import {
  NumberQuestion,
  createNumberValidationRules,
} from "../questions/number-question";
import {
  DateQuestion,
  createDateValidationRules,
} from "../questions/date-question";
import {
  YesNoQuestion,
  createYesNoValidationRules,
} from "../questions/yes-no-question";
import {
  MultipleChoiceQuestion,
  createMultipleChoiceValidationRules,
} from "../questions/multiple-choice-question";
import {
  TelephoneQuestion,
  createTelephoneValidationRules,
} from "../questions/telephone-question";
import {
  FileQuestion,
  createFileValidationRules,
} from "../questions/file-question";
import {
  ICD10Question,
  createICD10ValidationRules,
} from "../questions/icd10-question";
import {
  SliderQuestion,
  createSliderValidationRules,
} from "../questions/slider-question";
import {
  ImageQuestion,
  createImageValidationRules,
} from "../questions/image-question";
import {
  createMultipleSelectValidationRules,
  MultipleSelectQuestion,
} from "../questions/multiple-select-question";
import {
  createLongTextValidationRules,
  LongTextQuestion,
} from "../questions/long-text-question";

interface QuestionRendererProps {
  question: Question;
  control: Control<Record<string, unknown>>;
  errors: FieldErrors;
  disabled?: boolean;
  isVisible?: boolean; // New prop for visibility
}

// Map of question types to their validation rule creators
const validationRuleCreators: Record<
  UserQuestionType,
  (question: Question) => Record<string, unknown>
> = {
  SHORT_TEXT: createShortTextValidationRules,
  LONG_TEXT: createLongTextValidationRules,
  EMAIL: createEmailValidationRules,
  NUMBER: createNumberValidationRules,
  DATE: createDateValidationRules,
  YES_NO: createYesNoValidationRules,
  MULTIPLE_CHOICE: createMultipleChoiceValidationRules,
  MULTIPLE_SELECT: createMultipleSelectValidationRules,
  TELEPHONE: createTelephoneValidationRules,
  FILE: createFileValidationRules,
  ICD10_CLASSIFICATION: createICD10ValidationRules,
  SLIDER: createSliderValidationRules,
  IMAGE: createImageValidationRules,
  DESCRIPTION: () => ({}),
  MULTIPLE_CHOICE_GRID: () => ({}),
  SIGNATURE: () => ({}),
} as const;

export function QuestionRenderer({
  question,
  control,
  disabled = false,
  isVisible = true,
}: QuestionRendererProps) {
  // Skip rendering non-data questions (descriptions are handled separately)
  if (question.user_question_type === "DESCRIPTION") {
    return (
      <div
        className={
          isVisible
            ? "opacity-100 transition-opacity duration-200"
            : "opacity-0 pointer-events-none transition-opacity duration-200"
        }
        style={{ display: isVisible ? "block" : "none" }}
      >
        <DescriptionQuestion question={question} disabled={disabled} />
      </div>
    );
  }

  // Get validation rules for this question type
  const createValidationRules =
    validationRuleCreators[question.user_question_type];
  const validationRules = createValidationRules(question);

  return (
    <div
      className={
        isVisible
          ? "opacity-100 transition-opacity duration-200"
          : "opacity-0 pointer-events-none transition-opacity duration-200"
      }
      style={{ display: isVisible ? "block" : "none" }}
    >
      <Controller
        key={question.id} // Keep key for React rendering
        name={question.id} // Use question.id as the field name for react-hook-form
        control={control}
        rules={isVisible ? validationRules : {}} // Skip validation for hidden questions
        render={({ field, fieldState }) => {
          const componentProps: ControlledQuestionProps = {
            question,
            field,
            fieldState,
            disabled,
          };

          switch (question.user_question_type) {
            case "SHORT_TEXT":
              return <ShortTextQuestion {...componentProps} />;

            case "LONG_TEXT":
              return <LongTextQuestion {...componentProps} />;

            case "EMAIL":
              return <EmailQuestion {...componentProps} />;

            case "NUMBER":
              return <NumberQuestion {...componentProps} />;

            case "DATE":
              return <DateQuestion {...componentProps} />;

            case "YES_NO":
              return <YesNoQuestion {...componentProps} />;

            case "MULTIPLE_CHOICE":
              return <MultipleChoiceQuestion {...componentProps} />;

            case "MULTIPLE_SELECT":
              return <MultipleSelectQuestion {...componentProps} />;

            case "TELEPHONE":
              return <TelephoneQuestion {...componentProps} />;

            case "FILE":
              return <FileQuestion {...componentProps} />;

            case "ICD10_CLASSIFICATION":
              return <ICD10Question {...componentProps} />;

            case "SLIDER":
              return <SliderQuestion {...componentProps} />;

            case "IMAGE":
              return <ImageQuestion {...componentProps} />;

            // Add more question types as they're implemented
            default:
              return (
                <div className="p-4 text-muted-foreground">
                  Unsupported question type: {question.user_question_type}
                </div>
              );
          }
        }}
      />
    </div>
  );
}

/**
 * Get all question keys from a list of questions (for form initialization)
 */
export function getQuestionKeys(questions: Question[]): string[] {
  return questions
    .filter((q) => q.user_question_type !== "DESCRIPTION") // Skip description questions
    .map((q) => q.key);
}

/**
 * Create default values object for react-hook-form
 */
export function createDefaultValues(
  questions: Question[]
): Record<string, unknown> {
  const defaults: Record<string, unknown> = {};

  questions.forEach((question) => {
    // Skip description questions
    if (question.user_question_type === "DESCRIPTION") {
      return;
    }

    // Set appropriate default values based on question type
    switch (question.user_question_type) {
      case "YES_NO":
        defaults[question.id] = undefined; // Boolean questions need undefined as default
        break;
      case "MULTIPLE_SELECT":
        defaults[question.id] = []; // Array for multiple select
        break;
      case "NUMBER":
      case "SLIDER":
        defaults[question.id] = ""; // Empty string for numbers and sliders
        break;
      default:
        defaults[question.id] = ""; // String default for most types
        break;
    }
  });

  return defaults;
}
