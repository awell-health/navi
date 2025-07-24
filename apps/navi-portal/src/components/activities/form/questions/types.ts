import type {
  Question,
  UserQuestionType,
} from "@/lib/awell-client/generated/graphql";
import type {
  ControllerRenderProps,
  ControllerFieldState,
} from "react-hook-form";

export interface BaseQuestionProps {
  question: Question;
  disabled?: boolean;
  className?: string;
}

// Props for Controller render function with proper error support
export interface ControlledQuestionProps extends BaseQuestionProps {
  field: ControllerRenderProps<any, string>;
  fieldState: ControllerFieldState; // Includes error, invalid, isDirty, etc.
}

// Re-export the UserQuestionType for convenience
export type { UserQuestionType };
