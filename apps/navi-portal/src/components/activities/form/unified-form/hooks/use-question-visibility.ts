/**
 * Question Visibility Hook
 * Manages question visibility state based on rule evaluation
 */

import { useState, useCallback, useMemo, useEffect } from "react";
import type { FieldErrors, UseFormWatch } from "react-hook-form";
import type { Question } from "@/lib/awell-client/generated/graphql";
import { RuleService } from "../services/rule-service";
import { useRuleEvaluation } from "./use-rule-evaluation";
import type { VisibilityState } from "../types/rule-types";
import { useDebouncedCallback } from "use-debounce";

export interface UseQuestionVisibilityProps {
  questions: Question[];
  fieldErrors?: FieldErrors<Record<string, unknown>>;
  ruleService?: RuleService;
  watch: UseFormWatch<Record<string, unknown>>;
}

export interface UseQuestionVisibilityReturn {
  visibilityState: VisibilityState;
  isQuestionVisible: (questionId: string) => boolean;
  refreshVisibility: () => void;
  loading: boolean;
  error: unknown;
}

export function useQuestionVisibility({
  questions,
  fieldErrors,
  ruleService: passedRuleService,
  watch,
}: UseQuestionVisibilityProps): UseQuestionVisibilityReturn {
  const ruleService = useMemo(
    () => passedRuleService || new RuleService(),
    [passedRuleService]
  );

  // Use Apollo-powered rule evaluation
  const { evaluateRules, loading, error } = useRuleEvaluation({
    ruleService,
    onError: (error) => {
      console.error("Question visibility rule evaluation failed:", error);
    },
  });

  // Initialize all questions as visible by default
  const [visibilityState, setVisibilityState] = useState<VisibilityState>(
    () => {
      const questionIds = new Set(questions.map((q) => q.id));
      return {
        visible: questionIds,
        hidden: new Set(),
      };
    }
  );

  // Get questions with rules for efficient processing
  const questionsWithRules = useMemo(() => {
    return ruleService.extractRulesFromQuestions(questions);
  }, [questions, ruleService]);

  // Get fields that are referenced in rules (for targeted watching)
  const referencedFields = useMemo(() => {
    const fields = new Set<string>();
    questionsWithRules.forEach(({ rule }) => {
      rule.conditions.forEach((condition) => {
        fields.add(condition.reference);
      });
    });
    return Array.from(fields);
  }, [questionsWithRules]);

  /**
   * Evaluate visibility for all questions with rules
   */
  const evaluateVisibility = useCallback(async () => {
    if (questionsWithRules.length === 0) {
      return;
    }

    try {
      const formData = watch();
      const questionResponses = ruleService.createQuestionResponses(
        formData,
        questions,
        fieldErrors
      );
      const rules = questionsWithRules.map((q) => q.rule);
      const results = await evaluateRules(questionResponses, rules);
      const newVisible = new Set<string>();
      const newHidden = new Set<string>();

      questions.forEach((question) => {
        const hasRule = questionsWithRules.some(
          (q) => q.question.id === question.id
        );
        if (!hasRule) {
          newVisible.add(question.id);
        }
      });

      // Apply rule results
      questionsWithRules.forEach((questionWithRule, index) => {
        const result = results[index];
        const questionId = questionWithRule.question.id;

        // If result is null (evaluation failed), keep question visible as fallback
        const shouldBeVisible = result === null ? true : result;

        if (shouldBeVisible) {
          newVisible.add(questionId);
        } else {
          newHidden.add(questionId);
        }
      });

      setVisibilityState({
        visible: newVisible,
        hidden: newHidden,
      });
    } catch (error) {
      console.error("Failed to evaluate question visibility:", error);

      // On error, make all questions visible as fallback
      const allQuestionIds = new Set(questions.map((q) => q.id));
      setVisibilityState({
        visible: allQuestionIds,
        hidden: new Set(),
      });
    }
  }, [questionsWithRules, questions, fieldErrors, ruleService, evaluateRules]);

  // Watch for changes in referenced fields and refresh visibility with a debounce
  useEffect(() => {
    const subscription = watch((value, { name, type }) => {
      const questionDefinitionId = questions.find(
        (q) => q.id === name
      )?.definition_id;
      if (
        name &&
        questionDefinitionId &&
        referencedFields.includes(questionDefinitionId)
      ) {
        refreshVisibility();
      }
    });

    // Initial evaluation
    void evaluateVisibility();

    return () => subscription.unsubscribe();
  }, [referencedFields]);

  const isQuestionVisible = useCallback(
    (questionId: string) => visibilityState.visible.has(questionId),
    [visibilityState]
  );

  const refreshVisibility = useDebouncedCallback((): void => {
    void evaluateVisibility();
  }, 300);

  return {
    visibilityState,
    isQuestionVisible,
    // getVisibleQuestions,
    // getVisibilityMap,
    refreshVisibility,
    loading,
    error,
  };
}
