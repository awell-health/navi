/**
 * Form Activity Data Structure
 */
export interface FormActivityData {
  id: string;
  title: string;
  questions: QuestionField[];
}

/**
 * Question Field Configuration
 */
export interface QuestionField {
  id: string;
  key: string;
  title: string;
  questionType: string;
  userQuestionType: string;
  required?: boolean;
  placeholder?: string;
  options?: Array<{
    id: string;
    label: string;
    value: string;
  }>;
  // Additional question config will be added as we implement question types
}

/**
 * Internal Field Events (used within navi-activities only)
 * These aggregate up to activity events
 */
export interface FormFieldEvent<T = any> {
  type:
    | "field-ready" // Field is ready for interaction
    | "field-focus" // Field gained focus
    | "field-blur" // Field lost focus
    | "field-change" // Field value changed
    | "field-validation"; // Field validation state changed
  fieldId: string;
  questionKey: string;
  data?: T;
  timestamp: number;
}

/**
 * Internal Field Event Handlers
 */
export interface FormFieldEventHandlers {
  onFieldEvent?: (event: FormFieldEvent) => void;
}

/**
 * Validation Result
 */
export interface ValidationResult {
  isValid: boolean;
  error?: string;
}

/**
 * Form Validation State
 */
export interface FormValidationState {
  [fieldId: string]: ValidationResult;
}
