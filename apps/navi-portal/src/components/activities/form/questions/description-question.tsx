import React from "react";
import { BaseQuestionProps } from "./types";
import { SlateViewer } from "@/components/ui/slate-viewer";
import { cn } from "@/lib/utils";

/**
 * DescriptionQuestion component - displays rich content from Awell platform
 * Prioritizes Slate JSON (with perfect branding) over HTML fallback
 * Read-only component that doesn't participate in form validation
 */
export function DescriptionQuestion({
  question,
  disabled = false,
  className = "",
}: BaseQuestionProps) {
  // Enhanced JSON detection - try to parse as Slate JSON first
  const parseSlateJSON = (content: string) => {
    // Skip obvious HTML content
    if (content.trim().startsWith("<")) {
      return null;
    }

    try {
      const parsed = JSON.parse(content);

      // Validate it looks like Slate content structure
      if (Array.isArray(parsed) && parsed.length > 0) {
        // Basic validation - Slate nodes should have a 'type' or 'text' property
        const hasSlateStructure = parsed.some(
          (node) =>
            node &&
            typeof node === "object" &&
            (node.type || typeof node.text === "string" || node.children)
        );

        if (hasSlateStructure) {
          return parsed;
        }
      }
    } catch {
      // Not valid JSON, fall back to HTML
    }

    return null;
  };

  const slateContent = parseSlateJSON(question.title);

  // Prefer SlateViewer for JSON content (perfect branding integration)
  if (slateContent) {
    return (
      <div
        className={cn(
          "prose prose-sm max-w-none",
          "text-foreground bg-background",
          disabled && "opacity-50",
          className
        )}
        role="region"
        aria-label={`Description: ${JSON.stringify(slateContent)
          .replace(/[{}"]/g, "")
          .slice(0, 100)}`}
      >
        <SlateViewer value={slateContent} />
      </div>
    );
  }

  // Simple HTML fallback - relies on existing prose styles
  return (
    <div
      className={cn(
        "prose prose-sm max-w-none",
        "text-foreground bg-background",
        // Basic styling for HTML content - let prose handle most of it
        "[&_h1]:text-3xl [&_h1]:font-bold [&_h1]:leading-tight [&_h1]:mb-4",
        "[&_h2]:text-2xl [&_h2]:font-semibold [&_h2]:leading-tight [&_h2]:mb-3",
        "[&_h3]:text-xl [&_h3]:font-medium [&_h3]:leading-tight [&_h3]:mb-2",
        "[&_p]:leading-relaxed [&_p]:mb-6",
        "[&_a]:text-primary [&_a]:underline hover:[&_a]:text-primary/80",
        disabled && "opacity-50",
        className
      )}
      role="region"
      aria-label={`Description: ${question.title
        .replace(/<[^>]*>/g, "")
        .slice(0, 100)}`}
      dangerouslySetInnerHTML={{ __html: question.title }}
    />
  );
}
