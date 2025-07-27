/**
 * Rule Service for Question Visibility
 * Handles GraphQL calls and rule evaluation logic
 */

import type {
  RuleInput,
  ConditionOperator,
} from "@/lib/awell-client/generated/graphql";
import type { QuestionResponse, Rule } from "../types/rule-types";
import type { Question } from "@/lib/awell-client/generated/graphql";

export class RuleService {
  constructor() {
    // RuleService now provides utility methods only
    // GraphQL requests are handled by useRuleEvaluation hook
  }

  /**
   * Convert local Rule type to GraphQL RuleInput type
   */
  convertRulesToGraphQLInput(rules: Rule[]): RuleInput[] {
    return rules.map((rule) => ({
      id: rule.id,
      boolean_operator: rule.boolean_operator.toLowerCase(),
      conditions: rule.conditions.map((condition) => ({
        id: condition.id,
        reference: condition.reference,
        operator: condition.operator as ConditionOperator,
        operand: {
          value: condition.operand.value,
          type: condition.operand.type.toLowerCase(),
        },
      })),
    }));
  }

  /**
   * Convert form data to question responses
   * Only includes values that pass react-hook-form validation
   */
  createQuestionResponses(
    formData: Record<string, unknown>,
    questions: Question[],
    fieldErrors?: Record<string, unknown>
  ): QuestionResponse[] {
    const responses: QuestionResponse[] = [];

    for (const question of questions) {
      const value = formData[question.id];
      const hasError = fieldErrors && fieldErrors[question.id];

      // Only include values that don't have validation errors
      // If a field has an error (e.g., partial phone number), send empty string
      const stringValue =
        hasError || value === undefined || value === null ? "" : String(value);

      responses.push({
        question_id: question.definition_id,
        value: stringValue,
        value_type: question.data_point_value_type?.toLowerCase() || "string",
      });
    }

    return responses;
  }

  /**
   * Get questions that are affected by changes to a specific question
   * Used for efficient re-evaluation (DAG traversal)
   */
  getAffectedQuestions(
    changedQuestionId: string,
    questions: Question[]
  ): Question[] {
    const affected: Question[] = [];

    // Since questions form a DAG with forward-only references,
    // we only need to check questions that come after the changed question
    const changedIndex = questions.findIndex((q) => q.id === changedQuestionId);

    if (changedIndex === -1) {
      return affected;
    }

    // Check all subsequent questions for rules that reference the changed question
    for (let i = changedIndex + 1; i < questions.length; i++) {
      const question = questions[i];

      if (this.questionReferencesQuestion(question, changedQuestionId)) {
        affected.push(question);
      }
    }

    return affected;
  }

  /**
   * Check if a question has rules that reference another question
   */
  private questionReferencesQuestion(
    question: Question,
    referencedQuestionId: string
  ): boolean {
    if (!question.rule) {
      return false;
    }

    // Check all conditions in the rule
    for (const condition of question.rule.conditions) {
      if (condition.reference === referencedQuestionId) {
        return true;
      }
    }

    return false;
  }

  /**
   * Extract rules from questions that have them
   */
  extractRulesFromQuestions(
    questions: Question[]
  ): { question: Question; rule: Rule }[] {
    return questions
      .filter((question) => question.rule)
      .map((question) => ({
        question,
        rule: question.rule as Rule,
      }));
  }

  extractReferencedQuestions(questions: Question[]): Question[] {
    const referencedQuestions = new Set<Question>();
    for (const question of questions) {
      if (question.rule) {
        for (const condition of question.rule.conditions) {
          if (condition.reference) {
            const referencedQuestion = questions.find(
              (q) => q.definition_id === condition.reference
            );
            if (referencedQuestion) {
              referencedQuestions.add(referencedQuestion);
            }
          }
        }
      }
    }
    console.log("👁️ referencedQuestions", referencedQuestions);
    return Array.from(referencedQuestions);
  }
}
