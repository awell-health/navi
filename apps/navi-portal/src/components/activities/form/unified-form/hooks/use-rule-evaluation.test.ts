/* eslint-disable @typescript-eslint/no-explicit-any */

/**
 * Unit tests for useRuleEvaluation hook
 */

import { describe, it, expect, vi, beforeEach } from "vitest";
import { renderHook } from "@testing-library/react";
import { useRuleEvaluation } from "./use-rule-evaluation";
import { RuleService } from "../services/rule-service";
import type { QuestionResponse, Rule } from "../types/rule-types";

// Mock the Apollo mutation hook
vi.mock("@/lib/awell-client/generated/graphql", () => ({
  useEvaluateFormRulesMutation: vi.fn(),
}));

import { useEvaluateFormRulesMutation } from "@/lib/awell-client/generated/graphql";

describe("useRuleEvaluation", () => {
  let mockMutationFn: ReturnType<typeof vi.fn>;
  let mockRuleService: RuleService;

  beforeEach(() => {
    mockMutationFn = vi.fn();
    (useEvaluateFormRulesMutation as any).mockReturnValue([
      mockMutationFn,
      { loading: false, error: null },
    ]);

    mockRuleService = new RuleService();
    vi.clearAllMocks();
  });

  it("should return empty array for no rules", async () => {
    const { result } = renderHook(() =>
      useRuleEvaluation({ ruleService: mockRuleService })
    );

    const results = await result.current.evaluateRules([], []);
    expect(results).toEqual([]);
    expect(mockMutationFn).not.toHaveBeenCalled();
  });

  it("should handle successful rule evaluation", async () => {
    const mockResponse = {
      data: {
        evaluateFormRules: {
          success: true,
          code: "SUCCESS",
          message: "Rules evaluated successfully",
          results: [true, false],
        },
      },
      errors: null,
    };

    mockMutationFn.mockResolvedValue(mockResponse);

    const { result } = renderHook(() =>
      useRuleEvaluation({ ruleService: mockRuleService })
    );

    const questionResponses: QuestionResponse[] = [
      { question_id: "q1", value: "yes", value_type: "STRING" },
    ];

    const rules: Rule[] = [
      {
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
    ];

    const results = await result.current.evaluateRules(
      questionResponses,
      rules
    );

    expect(results).toEqual([true, false]);
    expect(mockMutationFn).toHaveBeenCalledWith({
      variables: {
        input: {
          question_responses: questionResponses,
          rules: [
            {
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
          ],
        },
      },
    });
  });

  it("should handle GraphQL errors", async () => {
    const mockResponse = {
      data: null,
      errors: [{ message: "Some GraphQL error" }],
    };

    mockMutationFn.mockResolvedValue(mockResponse);

    const mockOnError = vi.fn();
    const { result } = renderHook(() =>
      useRuleEvaluation({
        ruleService: mockRuleService,
        onError: mockOnError,
      })
    );

    const rules: Rule[] = [
      { id: "rule1", boolean_operator: "AND", conditions: [] },
    ];

    const results = await result.current.evaluateRules([], rules);

    expect(results).toEqual([null]);
    expect(mockOnError).toHaveBeenCalledWith(
      expect.objectContaining({
        message: expect.stringContaining("GraphQL errors"),
      })
    );
  });

  it("should handle evaluation failure", async () => {
    const mockResponse = {
      data: {
        evaluateFormRules: {
          success: false,
          code: "ERROR",
          message: "Evaluation failed",
          results: null,
        },
      },
      errors: null,
    };

    mockMutationFn.mockResolvedValue(mockResponse);

    const mockOnError = vi.fn();
    const { result } = renderHook(() =>
      useRuleEvaluation({
        ruleService: mockRuleService,
        onError: mockOnError,
      })
    );

    const rules: Rule[] = [
      { id: "rule1", boolean_operator: "AND", conditions: [] },
    ];

    const results = await result.current.evaluateRules([], rules);

    expect(results).toEqual([null]);
    expect(mockOnError).toHaveBeenCalledWith(
      expect.objectContaining({
        message: expect.stringContaining("Rule evaluation failed"),
      })
    );
  });

  it("should handle mutation errors", async () => {
    const mockError = new Error("Network error");
    mockMutationFn.mockRejectedValue(mockError);

    const mockOnError = vi.fn();
    const { result } = renderHook(() =>
      useRuleEvaluation({
        ruleService: mockRuleService,
        onError: mockOnError,
      })
    );

    const rules: Rule[] = [
      { id: "rule1", boolean_operator: "AND", conditions: [] },
    ];

    const results = await result.current.evaluateRules([], rules);

    expect(results).toEqual([null]);
    expect(mockOnError).toHaveBeenCalledWith(mockError);
  });

  it("should provide loading and error states", () => {
    (useEvaluateFormRulesMutation as any).mockReturnValue([
      mockMutationFn,
      { loading: true, error: new Error("Test error") },
    ]);

    const { result } = renderHook(() =>
      useRuleEvaluation({ ruleService: mockRuleService })
    );

    expect(result.current.loading).toBe(true);
    expect(result.current.error).toEqual(new Error("Test error"));
  });
});
