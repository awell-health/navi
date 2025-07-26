import React from "react";
import { Progress } from "@/components/ui/progress";

interface FormProgressProps {
  progressPercentage: number;
  progressText: string;
  showProgress?: boolean;
  totalPages: number;
}

export function FormProgress({
  progressPercentage,
  progressText,
  showProgress = true,
  totalPages,
}: FormProgressProps) {
  // Don't show progress for single page forms or when disabled
  if (!showProgress || totalPages <= 1) {
    return null;
  }

  return (
    <div className="space-y-2">
      <div className="flex justify-between text-sm text-muted-foreground">
        <span>{progressText}</span>
        <span>{Math.round(progressPercentage)}% complete</span>
      </div>
      <Progress value={progressPercentage} className="h-2" />
    </div>
  );
}
