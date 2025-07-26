import { useState } from "react";
import type { UseFormTrigger } from "react-hook-form";
import type { FormNavigationState, FormPage } from "../types";

interface UseFormNavigationProps {
  pages: FormPage[];
  trigger: UseFormTrigger<Record<string, unknown>>;
}

export function useFormNavigation({ pages, trigger }: UseFormNavigationProps) {
  const [currentPageIndex, setCurrentPageIndex] = useState(0);

  const currentPage = pages[currentPageIndex];

  const navigationState: FormNavigationState = {
    currentPageIndex,
    totalPages: pages.length,
    isFirstPage: currentPageIndex === 0,
    isLastPage: currentPageIndex === pages.length - 1,
    canProceed: true, // Will be determined by validation
  };

  const handleNext = async () => {
    const currentPageQuestionKeys = currentPage.questions
      .filter((q) => q.user_question_type !== "DESCRIPTION")
      .map((q) => q.key);

    const isValid = await trigger(currentPageQuestionKeys);

    if (isValid && !navigationState.isLastPage) {
      setCurrentPageIndex((prev) => prev + 1);
    }
  };

  const handlePrevious = () => {
    if (!navigationState.isFirstPage) {
      setCurrentPageIndex((prev) => prev - 1);
    }
  };

  const getProgressText = (
    mode: "conversational" | "traditional" | "custom" // UFR: there should only be one place this type is defined. where is it?
  ) => {
    if (mode === "conversational") {
      return `Question ${currentPageIndex + 1} of ${pages.length}`;
    } else {
      return `Step ${currentPageIndex + 1} of ${pages.length}`;
    }
  };

  const progressPercentage = ((currentPageIndex + 1) / pages.length) * 100;

  return {
    currentPage,
    currentPageIndex,
    navigationState,
    handleNext,
    handlePrevious,
    getProgressText,
    progressPercentage,
  };
}
