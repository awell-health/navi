/**
 * Rule-related types for question visibility
 */

// Core rule types
export interface ConditionOperand {
  value: string;
  type: string;
}

export interface Condition {
  id: string;
  reference: string;
  operator: string;
  operand: ConditionOperand;
}

export interface Rule {
  id: string;
  boolean_operator: string;
  conditions: Condition[];
}

// Request/response types for the service
export interface QuestionResponse {
  question_id: string;
  value: string;
  value_type: string;
}

// Legacy request/response types for backward compatibility
export interface RuleEvaluationRequest {
  question_responses: QuestionResponse[];
  rules: Rule[];
}

export interface RuleEvaluationResult {
  success: boolean;
  code: string;
  message?: string;
  results?: (boolean | null)[];
}

// Evaluation state management
export interface EvaluationState {
  visibility: Map<string, boolean | null>; // Question ID -> visibility state
  evaluating: Set<string>; // Question IDs currently being evaluated
}

// Legacy alias for backward compatibility
export interface VisibilityState {
  visible: Set<string>; // Question IDs that are visible
  hidden: Set<string>; // Question IDs that are hidden
}
