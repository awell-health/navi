import React from "react";
import { Button } from "@/components/ui/button";
import { ChevronLeft, ChevronRight } from "lucide-react";
import type { FormNavigationState } from "../types";

interface FormNavigationProps {
  navigationState: FormNavigationState;
  totalPages: number;
  disabled: boolean;
  isSubmitting: boolean;
  navigationText?: {
    previous?: string;
    next?: string;
    submit?: string;
  };
  onPrevious: () => void;
  onNext: () => void;
  onSubmit: () => void;
}

export function FormNavigation({
  navigationState,
  totalPages,
  disabled,
  isSubmitting,
  navigationText,
  onPrevious,
  onNext,
  onSubmit,
}: FormNavigationProps) {
  if (totalPages === 1) {
    // Single page - just show submit button
    return (
      <div className="flex justify-end pt-6">
        <Button
          type="submit"
          disabled={disabled || isSubmitting}
          size="lg"
          onClick={onSubmit}
        >
          {isSubmitting
            ? "Submitting..."
            : navigationText?.submit || "Complete Form"}
        </Button>
      </div>
    );
  }

  // Multi-page - show navigation
  return (
    <div className="flex justify-between items-center pt-6">
      <Button
        type="button"
        variant="outline"
        onClick={onPrevious}
        disabled={navigationState.isFirstPage || disabled}
        className={navigationState.isFirstPage ? "invisible" : ""}
      >
        <ChevronLeft className="w-4 h-4 mr-2" />
        {navigationText?.previous || "Previous"}
      </Button>

      {navigationState.isLastPage ? (
        <Button
          type="submit"
          disabled={disabled || isSubmitting}
          size="lg"
          onClick={onSubmit}
        >
          {isSubmitting
            ? "Submitting..."
            : navigationText?.submit || "Complete Form"}
        </Button>
      ) : (
        <Button
          type="button"
          onClick={(e) => {
            e.preventDefault(); // Prevent any form submission
            onNext();
          }}
          disabled={disabled}
          size="lg"
        >
          {navigationText?.next || "Next"}
          <ChevronRight className="w-4 h-4 ml-2" />
        </Button>
      )}
    </div>
  );
}
