/**
 * Rule Service for Question Visibility
 * Handles GraphQL calls and rule evaluation logic
 */

import type { Question, DataPointValueType } from "@awell-health/navi-core";
import type { 
  QuestionResponse, 
  Rule, 
  RuleEvaluationRequest, 
  RuleEvaluationResult 
} from "../types/rule-types";

const EVALUATE_FORM_RULES_MUTATION = `
  mutation EvaluateFormRules($input: EvaluateFormRulesInput!) {
    evaluateFormRules(input: $input) {
      success
      code
      message
      results
    }
  }
`;

export class RuleService {
  private readonly graphqlEndpoint: string;

  constructor(graphqlEndpoint?: string) {
    // Default to the API endpoint if not provided
    this.graphqlEndpoint = graphqlEndpoint || '/api/graphql';
  }

  /**
   * Evaluate rules against current form data
   */
  async evaluateRules(
    questionResponses: QuestionResponse[],
    rules: Rule[]
  ): Promise<(boolean | null)[]> {
    if (rules.length === 0) {
      return [];
    }

    try {
      const request: RuleEvaluationRequest = {
        question_responses: questionResponses,
        rules
      };

      const response = await fetch(this.graphqlEndpoint, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          query: EVALUATE_FORM_RULES_MUTATION,
          variables: { input: request }
        })
      });

      if (!response.ok) {
        throw new Error(`GraphQL request failed: ${response.statusText}`);
      }

      const data = await response.json();
      
      if (data.errors) {
        throw new Error(`GraphQL errors: ${JSON.stringify(data.errors)}`);
      }

      const result: RuleEvaluationResult = data.data.evaluateFormRules;
      
      if (!result.success) {
        throw new Error(`Rule evaluation failed: ${result.message}`);
      }

      return result.results || [];
    } catch (error) {
      console.error('Rule evaluation failed:', error);
      // Return null for all rules to indicate evaluation failure
      return rules.map(() => null);
    }
  }

  /**
   * Convert form data to question responses, filtering out invalid values
   */
  createQuestionResponses(
    formData: Record<string, any>,
    questions: Question[]
  ): QuestionResponse[] {
    const responses: QuestionResponse[] = [];

    for (const question of questions) {
      const value = formData[question.id];
      
      // Skip if no value or value is empty
      if (value === undefined || value === null || value === '') {
        continue;
      }

      // Validate value before including it
      if (!this.isValidValue(value, question)) {
        continue; // Skip invalid values (e.g., partial phone numbers)
      }

      responses.push({
        question_id: question.id,
        value: String(value),
        value_type: question.dataPointValueType || 'STRING'
      });
    }

    return responses;
  }

  /**
   * Check if a value is valid for the given question type
   * Only send answers that pass validation
   */
  private isValidValue(value: any, question: Question): boolean {
    // For now, implement basic validation
    // This can be expanded based on question types and validation rules
    
    // String values should not be empty after trimming
    if (typeof value === 'string' && value.trim().length === 0) {
      return false;
    }

    // For phone numbers, ensure we have a complete number
    if (question.questionType === 'TELEPHONE') {
      // Basic phone validation - should have at least 10 digits
      const digits = String(value).replace(/\D/g, '');
      return digits.length >= 10;
    }

    // For email, basic format check
    if (question.questionType === 'EMAIL') {
      const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
      return emailRegex.test(String(value));
    }

    // For numbers, ensure they're valid
    if (question.dataPointValueType === 'NUMBER') {
      const num = Number(value);
      return !isNaN(num) && isFinite(num);
    }

    return true;
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
    const changedIndex = questions.findIndex(q => q.id === changedQuestionId);
    
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
  private questionReferencesQuestion(question: Question, referencedQuestionId: string): boolean {
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
  extractRulesFromQuestions(questions: Question[]): { question: Question; rule: Rule }[] {
    return questions
      .filter(question => question.rule)
      .map(question => ({
        question,
        rule: question.rule as Rule
      }));
  }
}