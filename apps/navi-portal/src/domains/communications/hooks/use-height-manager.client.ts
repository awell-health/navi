"use client";

import { useCallback, useLayoutEffect, useEffect } from "react";

interface UseHeightManagerProps {
  instanceId: string | null;
  activeActivityId?: string;
  onHeightChange: (height: number, source: string, activityId?: string) => void;
}

/**
 * Manages iframe height calculation and automatic resize detection
 *
 * Extracted from careflow-activities-client.tsx to handle:
 * - Accurate height calculation
 * - ResizeObserver with debouncing
 * - Initial height measurement after activity changes
 */
export function useHeightManager({
  instanceId,
  activeActivityId,
  onHeightChange,
}: UseHeightManagerProps) {
  // Height calculation utilities (extracted from original)
  const calculateHeight = useCallback(() => {
    // Force DOM reflow to ensure accurate measurements after content changes
    document.body.style.height = "auto";
    document.documentElement.style.height = "auto";

    const body = document.body;
    const html = document.documentElement;

    // Use offsetHeight instead of scrollHeight to handle shrinking content better
    const bodyHeight = body.offsetHeight;
    const htmlHeight = html.offsetHeight;

    // Take the larger of the two, but don't include clientHeight which can be stale
    const finalHeight = Math.max(bodyHeight, htmlHeight);

    console.debug("📏 Height calculation details:", {
      bodyScrollHeight: body.scrollHeight,
      bodyOffsetHeight: body.offsetHeight,
      htmlScrollHeight: html.scrollHeight,
      htmlOffsetHeight: html.offsetHeight,
      htmlClientHeight: html.clientHeight,
      bodyHeight,
      htmlHeight,
      finalHeight: finalHeight + 20,
    });

    return finalHeight + 20; // Add padding to prevent scrollbars
  }, []);

  const emitHeightChange = useCallback(
    (source: string, activityId?: string) => {
      if (!instanceId) return;

      const currentHeight = calculateHeight();
      console.debug(`📏 ${source} height:`, currentHeight);

      onHeightChange(currentHeight, source, activityId);
    },
    [instanceId, calculateHeight, onHeightChange]
  );

  // 1. Measure height after activity renders (useLayoutEffect = after DOM updates, before paint)
  useLayoutEffect(() => {
    if (instanceId && activeActivityId) {
      emitHeightChange("Activity change", activeActivityId);
    }
  }, [instanceId, activeActivityId, emitHeightChange]);

  // 2. Set up ResizeObserver for ongoing content changes (debounced)
  useEffect(() => {
    if (!instanceId || typeof window === "undefined") return;

    let resizeTimeout: NodeJS.Timeout;
    let lastHeight = 0;

    const resizeObserver = new ResizeObserver(() => {
      clearTimeout(resizeTimeout);
      resizeTimeout = setTimeout(() => {
        const currentHeight = calculateHeight();

        // Only emit if height changed significantly (>5px)
        if (Math.abs(currentHeight - lastHeight) > 5) {
          console.log(
            "📏 ResizeObserver height change:",
            lastHeight,
            "→",
            currentHeight
          );
          lastHeight = currentHeight;
          emitHeightChange("ResizeObserver");
        }
      }, 50);
    });

    resizeObserver.observe(document.body);

    return () => {
      clearTimeout(resizeTimeout);
      resizeObserver.disconnect();
    };
  }, [instanceId, calculateHeight, emitHeightChange]);

  return {
    calculateHeight,
    emitHeightChange,
  };
}
