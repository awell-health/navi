import type { Question } from "@/lib/awell-client/generated/graphql";
import type { FormActivityData } from "@awell-health/navi-core";

export type FormActivity = FormActivityData;

export { 
  isFormActivity, 
  assertFormActivity,
  type FormActivityData 
} from "@awell-health/navi-core";

// Re-export rule types
export type {
  QuestionResponse,
  ConditionOperand,
  Condition,
  Rule,
  RuleEvaluationRequest,
  RuleEvaluationResult,
  VisibilityState,
  VisibilityChangeEvent,
} from "./types/rule-types";

/**
 * Represents a page within a form - contains questions that should be displayed together
 */
export interface FormPage {
  id: string;
  title?: string;
  questions: Question[];
}

/**
 * Configuration for how a form should be rendered
 */
export interface FormRenderConfig {
  /** How to split questions into pages */
  mode: "traditional" | "conversational" | "custom";
  /** For custom mode: specify which questions should start new pages */
  pageBreakAfterQuestions?: string[]; // question IDs
  /** Whether to show progress indicator */
  showProgress?: boolean;
  /** Custom navigation button text */
  navigationText?: {
    next?: string;
    previous?: string;
    submit?: string;
  };
}

/**
 * Type alias for form configuration
 */
export type UnifiedFormConfig = FormRenderConfig;

/**
 * Form data structure that matches Awell's form activity input
 */
export interface FormData {
  id: string;
  title: string;
  questions: Question[];
}

/**
 * Props for the unified form renderer
 */
export interface UnifiedFormRendererProps {
  activity: FormActivityData;
  config: UnifiedFormConfig;
  disabled?: boolean;
  className?: string;
  eventHandlers?: Record<string, (event: any) => void>;
  onSubmit?: (activityId: string, data: Record<string, unknown>) => void | Promise<void>;
}

/**
 * Internal state for form navigation
 */
export interface FormNavigationState {
  currentPageIndex: number;
  totalPages: number;
  isFirstPage: boolean;
  isLastPage: boolean;
  canProceed: boolean; // Based on validation of current page
}
