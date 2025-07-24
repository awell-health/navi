import type {
  Question,
  UserQuestionType,
} from "@/lib/awell-client/generated/graphql";

export interface BaseQuestionProps {
  question: Question;
  value?: unknown;
  onChange?: (value: unknown) => void;
  onFocus?: () => void;
  onBlur?: () => void;
  disabled?: boolean;
  error?: string;
  className?: string;
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
