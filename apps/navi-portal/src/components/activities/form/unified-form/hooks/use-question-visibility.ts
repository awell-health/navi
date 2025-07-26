/**
 * Question Visibility Hook
 * Manages question visibility state based on rule evaluation
 */

import { useState, useEffect, useCallback, useMemo } from "react";
import { UseFormWatch } from "react-hook-form";
import type { Question } from "@awell-health/navi-core";

import { RuleService } from "../services/rule-service";
import type { 
  VisibilityState, 
  VisibilityChangeEvent,
  QuestionResponse,
  Rule 
} from "../types/rule-types";

interface UseQuestionVisibilityProps {
  questions: Question[];
  watch: UseFormWatch<any>;
  ruleService: RuleService;
  onVisibilityChange?: (event: VisibilityChangeEvent) => void;
}

export interface UseQuestionVisibilityReturn {
  visibilityState: VisibilityState;
  isQuestionVisible: (questionId: string) => boolean;
  getVisibleQuestions: () => Question[];
  getVisibilityMap: () => Record<string, boolean>;
  refreshVisibility: () => Promise<void>;
}

export function useQuestionVisibility({
  questions,
  watch,
  ruleService,
  onVisibilityChange
}: UseQuestionVisibilityProps): UseQuestionVisibilityReturn {
  
  // Initialize all questions as visible by default
  const [visibilityState, setVisibilityState] = useState<VisibilityState>(() => {
    const questionIds = new Set(questions.map(q => q.id));
    return {
      visible: questionIds,
      hidden: new Set(),
      evaluating: new Set()
    };
  });

  // Memoize questions with rules for performance
  const questionsWithRules = useMemo(() => {
    return ruleService.extractRulesFromQuestions(questions);
  }, [questions, ruleService]);

  // Get current form data
  const formData = watch();

  /**
   * Evaluate visibility for all questions with rules
   */
  const evaluateVisibility = useCallback(async () => {
    if (questionsWithRules.length === 0) {
      return;
    }

    // Mark questions as evaluating
    const evaluatingIds = new Set(questionsWithRules.map(q => q.question.id));
    setVisibilityState(prev => ({
      ...prev,
      evaluating: evaluatingIds
    }));

    try {
      // Create question responses from current form data
      const questionResponses = ruleService.createQuestionResponses(formData, questions);
      
      // Extract rules for evaluation
      const rules = questionsWithRules.map(q => q.rule);
      
      // Evaluate rules
      const results = await ruleService.evaluateRules(questionResponses, rules);
      
      // Update visibility state based on results
      const newVisible = new Set<string>();
      const newHidden = new Set<string>();
      
      // Start with all questions without rules as visible
      questions.forEach(question => {
        const hasRule = questionsWithRules.some(q => q.question.id === question.id);
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
          // Emit visibility change event if state changed
          if (visibilityState.hidden.has(questionId)) {
            onVisibilityChange?.({
              questionId,
              visible: true,
              reason: 'rule_evaluation'
            });
          }
        } else {
          newHidden.add(questionId);
          // Emit visibility change event if state changed
          if (visibilityState.visible.has(questionId)) {
            onVisibilityChange?.({
              questionId,
              visible: false,
              reason: 'rule_evaluation'
            });
          }
        }
      });
      
      setVisibilityState({
        visible: newVisible,
        hidden: newHidden,
        evaluating: new Set()
      });
      
    } catch (error) {
      console.error('Failed to evaluate question visibility:', error);
      
      // On error, make all questions visible as fallback
      const allQuestionIds = new Set(questions.map(q => q.id));
      setVisibilityState({
        visible: allQuestionIds,
        hidden: new Set(),
        evaluating: new Set()
      });
    }
  }, [questionsWithRules, formData, questions, ruleService, visibilityState, onVisibilityChange]);

  /**
   * Efficient re-evaluation when specific questions change
   */
  const evaluateAffectedQuestions = useCallback(async (changedQuestionId: string) => {
    const affectedQuestions = ruleService.getAffectedQuestions(changedQuestionId, questions);
    
    if (affectedQuestions.length === 0) {
      return;
    }

    // For now, re-evaluate all questions
    // TODO: Optimize to only evaluate affected questions
    await evaluateVisibility();
  }, [questions, ruleService, evaluateVisibility]);

  // Watch for form data changes and re-evaluate visibility
  useEffect(() => {
    // Debounce evaluation to avoid excessive API calls
    const timeoutId = setTimeout(() => {
      evaluateVisibility();
    }, 150); // 150ms debounce

    return () => clearTimeout(timeoutId);
  }, [formData]); // Re-run when form data changes

  // Initial evaluation on mount
  useEffect(() => {
    evaluateVisibility();
  }, []); // Only run once on mount

  /**
   * Check if a specific question is visible
   */
  const isQuestionVisible = useCallback((questionId: string): boolean => {
    // If currently evaluating, show as visible to avoid layout shifts
    if (visibilityState.evaluating.has(questionId)) {
      return true;
    }
    
    return visibilityState.visible.has(questionId);
  }, [visibilityState]);

  /**
   * Get all visible questions in order
   */
  const getVisibleQuestions = useCallback((): Question[] => {
    return questions.filter(question => isQuestionVisible(question.id));
  }, [questions, isQuestionVisible]);

  /**
   * Get visibility map for all questions
   */
  const getVisibilityMap = useCallback((): Record<string, boolean> => {
    const map: Record<string, boolean> = {};
    
    questions.forEach(question => {
      map[question.id] = isQuestionVisible(question.id);
    });
    
    return map;
  }, [questions, isQuestionVisible]);

  /**
   * Manual refresh of visibility state
   */
  const refreshVisibility = useCallback(async (): Promise<void> => {
    await evaluateVisibility();
  }, [evaluateVisibility]);

  return {
    visibilityState,
    isQuestionVisible,
    getVisibleQuestions,
    getVisibilityMap,
    refreshVisibility
  };
}