import type { Question, UserQuestionType } from "@/lib/awell-client/generated/graphql";
import type { ControllerRenderProps, FieldError } from "react-hook-form";

export interface BaseQuestionProps {
  question: Question;
  disabled?: boolean;
  error?: FieldError;
  className?: string;
}

export interface ControlledQuestionProps extends BaseQuestionProps {
  field: ControllerRenderProps<any, string>;
}

export interface QuestionFieldEvent {
  type: "field-change" | "field-focus" | "field-blur";
  fieldId: string;
  questionKey: string;
  data?: { value?: unknown };
  timestamp: number;
}

// Re-export the UserQuestionType for convenience
export type { UserQuestionType };