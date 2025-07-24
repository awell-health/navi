import React from "react";
import { BaseQuestionProps } from "../types";
import { cn } from "@/lib/utils";

export interface DescriptionQuestionProps extends BaseQuestionProps {}

/**
 * DescriptionQuestion component - displays read-only HTML content
 * Used for showing information or instructions without collecting data
 * This component doesn't participate in form validation as it's read-only
 */
export function DescriptionQuestion({
  question,
  disabled = false,
  className = "",
}: DescriptionQuestionProps) {
  return (
    <div 
      className={cn(
        "prose prose-sm max-w-none",
        "text-foreground",
        disabled && "opacity-50",
        className
      )}
      tabIndex={disabled ? -1 : 0}
      role="region"
      aria-label={`Description: ${question.title}`}
      dangerouslySetInnerHTML={{ __html: question.title }}
    />
  );
}