/**
 * Unit tests for RuleService
 */

import { RuleService } from './rule-service';
import type { Question } from '@awell-health/navi-core';
import type { QuestionResponse, Rule } from '../types/rule-types';

// Mock fetch globally
global.fetch = jest.fn();

describe('RuleService', () => {
  let ruleService: RuleService;

  beforeEach(() => {
    ruleService = new RuleService();
    jest.clearAllMocks();
  });

  describe('createQuestionResponses', () => {
    const mockQuestions: Question[] = [
      {
        id: 'q1',
        questionType: 'SHORT_TEXT',
        dataPointValueType: 'STRING',
      } as Question,
      {
        id: 'q2',
        questionType: 'TELEPHONE',
        dataPointValueType: 'STRING',
      } as Question,
      {
        id: 'q3',
        questionType: 'EMAIL',
        dataPointValueType: 'STRING',
      } as Question,
    ];

    it('should filter out empty values', () => {
      const formData = {
        q1: 'Valid answer',
        q2: '',
        q3: null,
      };

      const responses = ruleService.createQuestionResponses(formData, mockQuestions);

      expect(responses).toHaveLength(1);
      expect(responses[0]).toEqual({
        question_id: 'q1',
        value: 'Valid answer',
        value_type: 'STRING',
      });
    });

    it('should filter out invalid phone numbers', () => {
      const formData = {
        q1: 'Valid answer',
        q2: '123', // Too short phone number
      };

      const responses = ruleService.createQuestionResponses(formData, mockQuestions);

      expect(responses).toHaveLength(1);
      expect(responses[0].question_id).toBe('q1');
    });

    it('should include valid phone numbers', () => {
      const formData = {
        q1: 'Valid answer',
        q2: '1234567890', // Valid phone number
      };

      const responses = ruleService.createQuestionResponses(formData, mockQuestions);

      expect(responses).toHaveLength(2);
      expect(responses.find(r => r.question_id === 'q2')).toEqual({
        question_id: 'q2',
        value: '1234567890',
        value_type: 'STRING',
      });
    });

    it('should filter out invalid emails', () => {
      const formData = {
        q1: 'Valid answer',
        q3: 'invalid-email', // Invalid email
      };

      const responses = ruleService.createQuestionResponses(formData, mockQuestions);

      expect(responses).toHaveLength(1);
      expect(responses[0].question_id).toBe('q1');
    });

    it('should include valid emails', () => {
      const formData = {
        q1: 'Valid answer',
        q3: 'test@example.com', // Valid email
      };

      const responses = ruleService.createQuestionResponses(formData, mockQuestions);

      expect(responses).toHaveLength(2);
      expect(responses.find(r => r.question_id === 'q3')).toEqual({
        question_id: 'q3',
        value: 'test@example.com',
        value_type: 'STRING',
      });
    });
  });

  describe('getAffectedQuestions', () => {
    const mockQuestions: Question[] = [
      {
        id: 'q1',
        rule: null,
      } as Question,
      {
        id: 'q2',
        rule: {
          id: 'rule1',
          boolean_operator: 'and',
          conditions: [
            {
              id: 'cond1',
              reference: 'q1',
              operator: 'eq',
              operand: { value: 'yes', type: 'string' },
            },
          ],
        },
      } as Question,
      {
        id: 'q3',
        rule: {
          id: 'rule2',
          boolean_operator: 'and',
          conditions: [
            {
              id: 'cond2',
              reference: 'q2',
              operator: 'eq',
              operand: { value: 'true', type: 'boolean' },
            },
          ],
        },
      } as Question,
    ];

    it('should return questions that reference the changed question', () => {
      const affected = ruleService.getAffectedQuestions('q1', mockQuestions);

      expect(affected).toHaveLength(1);
      expect(affected[0].id).toBe('q2');
    });

    it('should only return questions that come after the changed question (DAG property)', () => {
      const affected = ruleService.getAffectedQuestions('q2', mockQuestions);

      expect(affected).toHaveLength(1);
      expect(affected[0].id).toBe('q3');
    });

    it('should return empty array for questions with no dependents', () => {
      const affected = ruleService.getAffectedQuestions('q3', mockQuestions);

      expect(affected).toHaveLength(0);
    });

    it('should return empty array for non-existent questions', () => {
      const affected = ruleService.getAffectedQuestions('nonexistent', mockQuestions);

      expect(affected).toHaveLength(0);
    });
  });

  describe('evaluateRules', () => {
    it('should return empty array for no rules', async () => {
      const results = await ruleService.evaluateRules([], []);

      expect(results).toEqual([]);
    });

    it('should handle GraphQL success response', async () => {
      const mockResponse = {
        ok: true,
        json: async () => ({
          data: {
            evaluateFormRules: {
              success: true,
              code: 'SUCCESS',
              results: [true, false, null],
            },
          },
        }),
      };

      (global.fetch as jest.Mock).mockResolvedValueOnce(mockResponse);

      const questionResponses: QuestionResponse[] = [
        { question_id: 'q1', value: 'yes', value_type: 'STRING' },
      ];

      const rules: Rule[] = [
        {
          id: 'rule1',
          boolean_operator: 'and',
          conditions: [
            {
              id: 'cond1',
              reference: 'q1',
              operator: 'eq',
              operand: { value: 'yes', type: 'string' },
            },
          ],
        },
      ];

      const results = await ruleService.evaluateRules(questionResponses, rules);

      expect(results).toEqual([true, false, null]);
      expect(fetch).toHaveBeenCalledWith('/api/graphql', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          query: expect.stringContaining('mutation EvaluateFormRules'),
          variables: {
            input: {
              question_responses: questionResponses,
              rules: rules,
            },
          },
        }),
      });
    });

    it('should return null array on evaluation failure', async () => {
      const mockResponse = {
        ok: true,
        json: async () => ({
          data: {
            evaluateFormRules: {
              success: false,
              code: 'ERROR',
              message: 'Evaluation failed',
            },
          },
        }),
      };

      (global.fetch as jest.Mock).mockResolvedValueOnce(mockResponse);

      const rules: Rule[] = [{ id: 'rule1', boolean_operator: 'and', conditions: [] }];
      const results = await ruleService.evaluateRules([], rules);

      expect(results).toEqual([null]);
    });

    it('should return null array on network error', async () => {
      (global.fetch as jest.Mock).mockRejectedValueOnce(new Error('Network error'));

      const rules: Rule[] = [{ id: 'rule1', boolean_operator: 'and', conditions: [] }];
      const results = await ruleService.evaluateRules([], rules);

      expect(results).toEqual([null]);
    });
  });
});