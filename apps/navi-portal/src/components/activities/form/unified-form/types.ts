import type { Question } from "@/lib/awell-client/generated/graphql";
import type {
  BaseActivityProps,
  FormActivityData,
  isFormActivity,
  assertFormActivity,
} from "@awell-health/navi-core";

// Re-export for convenience
export { isFormActivity, assertFormActivity };
export type FormActivity = FormActivityData;

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
export interface UnifiedFormRendererProps
  extends Omit<BaseActivityProps, "activity"> {
  /** The form activity containing the form data */
  activity: FormActivity;
  /** Configuration for how to render the form */
  config: UnifiedFormConfig;
  /** Callback when form is submitted */
  onSubmit?: (
    activityId: string,
    data: Record<string, unknown>
  ) => void | Promise<void>;
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
