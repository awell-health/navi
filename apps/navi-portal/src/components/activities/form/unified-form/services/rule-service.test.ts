/* eslint-disable @typescript-eslint/no-explicit-any */

/**
 * Unit tests for RuleService
 */

import { describe, it, expect, vi, beforeEach } from "vitest";
import { RuleService } from "./rule-service";
import type { Question } from "@/lib/awell-client/generated/graphql";

// Mock fetch globally
global.fetch = vi.fn();

describe("RuleService", () => {
  let ruleService: RuleService;

  beforeEach(() => {
    ruleService = new RuleService();
    vi.clearAllMocks();
  });

  describe("createQuestionResponses", () => {
    const mockQuestions: Question[] = [
      {
        id: "q1",
        key: "q1_key",
        title: "Question 1",
        definition_id: "def1",
        question_type: "INPUT",
        data_point_value_type: "STRING",
        is_required: false,
      } as Question,
      {
        id: "q2",
        key: "q2_key",
        title: "Question 2",
        definition_id: "def2",
        question_type: "INPUT",
        data_point_value_type: "STRING",
        is_required: false,
      } as Question,
      {
        id: "q3",
        key: "q3_key",
        title: "Question 3",
        definition_id: "def3",
        question_type: "INPUT",
        data_point_value_type: "STRING",
        is_required: false,
      } as Question,
    ];

    it("should include all values as strings", () => {
      const formData = {
        q1: "Valid answer",
        q2: "1234567890",
        q3: "test@example.com",
      };

      const responses = ruleService.createQuestionResponses(
        formData,
        mockQuestions
      );

      expect(responses).toHaveLength(3);
      expect(responses).toEqual([
        {
          question_id: "def1",
          value: "Valid answer",
          value_type: "string",
        },
        {
          question_id: "def2",
          value: "1234567890",
          value_type: "string",
        },
        {
          question_id: "def3",
          value: "test@example.com",
          value_type: "string",
        },
      ]);
    });

    it("should handle empty and null values", () => {
      const formData = {
        q1: "Valid answer",
        q2: "",
        q3: null,
      };

      const responses = ruleService.createQuestionResponses(
        formData,
        mockQuestions
      );

      expect(responses).toHaveLength(3);
      expect(responses).toEqual([
        {
          question_id: "def1",
          value: "Valid answer",
          value_type: "string",
        },
        {
          question_id: "def2",
          value: "",
          value_type: "string",
        },
        {
          question_id: "def3",
          value: "",
          value_type: "string",
        },
      ]);
    });

    it("should handle field errors by sending empty strings", () => {
      const formData = {
        q1: "Valid answer",
        q2: "partial-phone",
        q3: "invalid-email",
      };

      const fieldErrors = {
        q2: { type: "invalid", message: "Invalid phone number" },
        q3: { type: "invalid", message: "Invalid email" },
      };

      const responses = ruleService.createQuestionResponses(
        formData,
        mockQuestions,
        fieldErrors
      );

      expect(responses).toHaveLength(3);
      expect(responses).toEqual([
        {
          question_id: "def1",
          value: "Valid answer",
          value_type: "string",
        },
        {
          question_id: "def2",
          value: "", // Error case sends empty string
          value_type: "string",
        },
        {
          question_id: "def3",
          value: "", // Error case sends empty string
          value_type: "string",
        },
      ]);
    });
  });

  describe("getAffectedQuestions", () => {
    const mockQuestions: Question[] = [
      {
        id: "q1",
        key: "q1_key",
        title: "Question 1",
        definition_id: "def1",
        is_required: false,
        rule: null,
      } as Question,
      {
        id: "q2",
        key: "q2_key",
        title: "Question 2",
        definition_id: "def2",
        is_required: false,
        rule: {
          id: "rule1",
          boolean_operator: "AND",
          conditions: [
            {
              id: "cond1",
              reference: "q1",
              operator: "IS_EQUAL_TO",
              operand: { value: "yes", type: "STRING" },
            },
          ],
        },
      } as Question,
      {
        id: "q3",
        key: "q3_key",
        title: "Question 3",
        definition_id: "def3",
        is_required: false,
        rule: {
          id: "rule2",
          boolean_operator: "AND",
          conditions: [
            {
              id: "cond2",
              reference: "q2",
              operator: "IS_TRUE",
              operand: { value: "true", type: "BOOLEAN" },
            },
          ],
        },
      } as Question,
    ];

    it("should return questions that reference the changed question", () => {
      const affected = ruleService.getAffectedQuestions("q1", mockQuestions);

      expect(affected).toHaveLength(1);
      expect(affected[0].id).toBe("q2");
    });

    it("should only return questions that come after the changed question (DAG property)", () => {
      const affected = ruleService.getAffectedQuestions("q2", mockQuestions);

      expect(affected).toHaveLength(1);
      expect(affected[0].id).toBe("q3");
    });

    it("should return empty array for questions with no dependents", () => {
      const affected = ruleService.getAffectedQuestions("q3", mockQuestions);

      expect(affected).toHaveLength(0);
    });

    it("should return empty array for non-existent questions", () => {
      const affected = ruleService.getAffectedQuestions(
        "nonexistent",
        mockQuestions
      );

      expect(affected).toHaveLength(0);
    });
  });

  describe("extractRulesFromQuestions", () => {
    it("should extract rules from questions that have them", () => {
      const mockQuestions: Question[] = [
        {
          id: "q1",
          key: "q1_key",
          title: "Question 1",
          definition_id: "def1",
          is_required: false,
          rule: null,
        } as Question,
        {
          id: "q2",
          key: "q2_key",
          title: "Question 2",
          definition_id: "def2",
          is_required: false,
          user_question_type: "SHORT_TEXT",
          rule: {
            id: "rule1",
            boolean_operator: "AND",
            conditions: [],
          },
        } as Question,
        {
          id: "q3",
          key: "q3_key",
          title: "Question 3",
          definition_id: "def3",
          is_required: false,
          user_question_type: "LONG_TEXT",
          rule: {
            id: "rule2",
            boolean_operator: "OR",
            conditions: [],
          },
        } as Question,
      ];

      const result = ruleService.extractRulesFromQuestions(mockQuestions);

      expect(result).toHaveLength(2);
      expect(result[0].question.id).toBe("q2");
      expect(result[0].rule.id).toBe("rule1");
      expect(result[1].question.id).toBe("q3");
      expect(result[1].rule.id).toBe("rule2");
    });

    it("should return empty array when no questions have rules", () => {
      const mockQuestions: Question[] = [
        {
          id: "q1",
          key: "q1_key",
          title: "Question 1",
          definition_id: "def1",
          is_required: false,
          rule: null,
        } as Question,
        {
          id: "q2",
          key: "q2_key",
          title: "Question 2",
          definition_id: "def2",
          is_required: false,
          rule: null,
        } as Question,
      ];

      const result = ruleService.extractRulesFromQuestions(mockQuestions);

      expect(result).toHaveLength(0);
    });
  });
});
