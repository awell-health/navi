import { useCallback } from "react";
import { useEvaluateFormRulesMutation } from "@/lib/awell-client/generated/graphql";
import type { RuleService } from "../services/rule-service";
import type { QuestionResponse, Rule } from "../types/rule-types";

export interface UseRuleEvaluationOptions {
  ruleService: RuleService;
  onError?: (error: Error) => void;
}

export function useRuleEvaluation({
  ruleService,
  onError,
}: UseRuleEvaluationOptions) {
  const [evaluateFormRulesMutation, { loading, error }] =
    useEvaluateFormRulesMutation();

  const evaluateRules = useCallback(
    async (
      questionResponses: QuestionResponse[],
      rules: Rule[]
    ): Promise<(boolean | null)[]> => {
      if (rules.length === 0) {
        return [];
      }

      try {
        // Convert local Rule types to GraphQL RuleInput types using the service
        const graphqlRules = ruleService.convertRulesToGraphQLInput(rules);

        const result = await evaluateFormRulesMutation({
          variables: {
            input: {
              question_responses: questionResponses,
              rules: graphqlRules,
            },
          },
        });

        if (result.errors?.length) {
          const errorMessage = `GraphQL errors: ${JSON.stringify(
            result.errors
          )}`;
          const error = new Error(errorMessage);
          onError?.(error);
          console.error("Rule evaluation failed:", error);
          return rules.map(() => null);
        }

        const data = result.data?.evaluateFormRules;
        if (!data?.success) {
          const error = new Error(`Rule evaluation failed: ${data?.message}`);
          onError?.(error);
          console.error("Rule evaluation failed:", error);
          return rules.map(() => null);
        }

        return data.results || [];
      } catch (err) {
        const error =
          err instanceof Error
            ? err
            : new Error("Unknown error during rule evaluation");
        onError?.(error);
        console.error("Rule evaluation failed:", error);
        // Return null for all rules to indicate evaluation failure
        return rules.map(() => null);
      }
    },
    [evaluateFormRulesMutation, ruleService, onError]
  );

  return {
    evaluateRules,
    loading,
    error,
  };
}
