import React from "react";
import { BaseQuestionProps } from "../types";
import { cn } from "@/lib/utils";

export interface DescriptionQuestionProps extends Omit<BaseQuestionProps, "value" | "onChange"> {}

/**
 * DescriptionQuestion component - displays read-only HTML content
 * Used for showing information or instructions without collecting data
 */
export function DescriptionQuestion({
  question,
  onFocus,
  onBlur,
  disabled = false,
  className = "",
}: DescriptionQuestionProps) {
  const handleFocus = () => {
    if (!disabled && onFocus) {
      onFocus();
    }
  };

  const handleBlur = () => {
    if (!disabled && onBlur) {
      onBlur();
    }
  };

  return (
    <div 
      className={cn(
        "prose prose-sm max-w-none",
        "text-foreground",
        disabled && "opacity-50",
        className
      )}
      onFocus={handleFocus}
      onBlur={handleBlur}
      tabIndex={disabled ? -1 : 0}
      role="region"
      aria-label={`Description: ${question.title}`}
      dangerouslySetInnerHTML={{ __html: question.title }}
    />
  );
}