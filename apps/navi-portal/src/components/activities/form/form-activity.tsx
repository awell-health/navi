import React from "react";
import type { BaseActivityProps, FormActivity } from "@awell-health/navi-core";
import { cn } from "@/lib/utils";

import { UnifiedFormRenderer } from "./unified-form/unified-form-renderer";
import type { FormRenderConfig } from "./unified-form/types";

export interface FormActivityProps extends BaseActivityProps {
  activity: FormActivity;
  onSubmit?: (
    activityId: string,
    data: Record<string, unknown>
  ) => void | Promise<void>;
  /** Optional: Configure form rendering mode */
  renderMode?: "traditional" | "conversational" | "custom";
  /** Optional: For custom mode, specify page break locations */
  pageBreakAfterQuestions?: string[];
  /** Optional: Show progress indicator */
  showProgress?: boolean;
}

/**
 * FormActivity component - now powered by UnifiedFormRenderer
 * Maintains backward compatibility while adding support for conversational and custom forms
 */
export function Form({
  activity,
  disabled = false,
  className = "",
  eventHandlers,
  onSubmit,
  renderMode = "traditional", // Default to traditional mode for backward compatibility
  pageBreakAfterQuestions,
  showProgress = true,
}: FormActivityProps) {
  // Configure form rendering
  const config: FormRenderConfig = {
    mode: renderMode,
    pageBreakAfterQuestions,
    showProgress,
    navigationText: {
      next: "Next",
      previous: "Previous",
      submit: "Submit Form",
    },
  };

  return (
    <div className={cn("navi-form-activity", className)}>
      <UnifiedFormRenderer
        activity={activity}
        config={config}
        disabled={disabled}
        className={className}
        eventHandlers={eventHandlers}
        onSubmit={onSubmit}
      />
    </div>
  );
}
