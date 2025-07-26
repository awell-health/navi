/**
 * Rule evaluation types matching GraphQL schema
 * Used for question visibility rules in forms
 * Note: Questions form a DAG - can only reference preceding questions
 */

import type { DataPointValueType } from "@awell-health/navi-core";

export interface QuestionResponse {
  question_id: string;
  value: string;
  value_type: string; // DataPointValueType as string
}

export interface ConditionOperand {
  value: string;
  type: string;
  __typename?: string;
}

export interface Condition {
  id: string;
  reference: string; // Question ID being referenced
  operator: string; // eq, gt, lt, contains, etc.
  operand: ConditionOperand;
  __typename?: string;
}

export interface Rule {
  id: string;
  boolean_operator: string; // "and" | "or"
  conditions: Condition[];
}

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

/**
 * Visibility state for questions
 */
export interface VisibilityState {
  visible: Set<string>; // Question IDs that are visible
  hidden: Set<string>; // Question IDs that are hidden
  evaluating: Set<string>; // Question IDs currently being evaluated
}

/**
 * Question visibility change event
 */
export interface VisibilityChangeEvent {
  questionId: string;
  visible: boolean;
  reason: 'rule_evaluation' | 'initial_load' | 'dependency_change';
}