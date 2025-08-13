"use client";

import { useCallback, useLayoutEffect, useEffect } from "react";

interface UseHeightManagerProps {
  instanceId: string | null;
  activeActivityId?: string;
  onHeightChange: (height: number, source: string, activityId?: string) => void;
  onWidthChange: (width: number, source: string, activityId?: string) => void;
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
  onWidthChange,
}: UseHeightManagerProps) {
  // Height calculation utilities (extracted from original)
  const calculateHeight = useCallback(() => {
    // Force DOM reflow to ensure accurate measurements after content changes
    document.body.style.height = "auto";
    document.documentElement.style.height = "auto";

    const body = document.body;
    const html = document.documentElement;

    // Collect multiple height sources. Avoid using viewport height to prevent
    // feedback loops with the parent-managed iframe height.
    const bodyOffsetHeight = body.offsetHeight;
    const bodyScrollHeight = body.scrollHeight;

    // Measure the left drawer (Radix Sheet) if present. It's positioned fixed
    // and therefore not part of document scroll metrics. We want the TOTAL
    // height of the sheet content (header + scrollable list), not just its
    // visible height. This lets the iframe grow to avoid inner scrolling if
    // the list of activities is long.
    const sheetContent = document.querySelector(
      '[data-slot="sheet-content"]'
    ) as HTMLElement | null;
    let sheetHeight = 0;
    if (sheetContent) {
      const sheetHeader = sheetContent.querySelector(
        '[data-slot="sheet-header"]'
      ) as HTMLElement | null;
      const sheetScrollArea = sheetContent.querySelector(
        ".overflow-y-auto"
      ) as HTMLElement | null;
      const headerHeight = sheetHeader?.getBoundingClientRect().height ?? 0;
      const scrollContentHeight = sheetScrollArea?.scrollHeight ?? 0;
      sheetHeight = headerHeight + scrollContentHeight + 20;
    }

    // Prefer measuring our main layout container so we include the scrollable
    // activity area instead of creating internal scrollbars.
    const mainEl = document.querySelector("main");
    const mainScrollHeight = (mainEl as HTMLElement | null)?.scrollHeight ?? 0;

    // Final height must accommodate whichever is tallest.
    // To avoid feedback loops, do NOT consider html heights (they reflect the
    // current iframe size). Prefer the content container height, then fall back
    // to body scroll/offset. Drawer height is only relevant if it's taller than
    // the content (e.g., during animations), but it will usually equal the
    // viewport which is the current iframe height, so it won't force growth.
    const finalHeight = Math.max(
      mainScrollHeight,
      bodyScrollHeight,
      bodyOffsetHeight,
      sheetHeight
    );
    return finalHeight;
  }, []);

  const calculateWidth = useCallback(() => {
    const body = document.body;
    const html = document.documentElement;
    const bodyWidth = body.offsetWidth;
    const htmlWidth = html.offsetWidth;
    return Math.max(bodyWidth, htmlWidth);
  }, []);

  const emitHeightChange = useCallback(
    (source: string, activityId?: string) => {
      if (!instanceId) return;

      const currentHeight = calculateHeight();
      console.log(`📏 ${source} height:`, currentHeight);

      onHeightChange(currentHeight, source, activityId);
    },
    [instanceId, calculateHeight, onHeightChange]
  );

  const emitWidthChange = useCallback(
    (source: string, activityId?: string) => {
      if (!instanceId) return;
      const currentWidth = calculateWidth();
      console.log(`📏 ${source} width:`, currentWidth);
      onWidthChange(currentWidth, source, activityId);
    },
    [instanceId, calculateWidth, onWidthChange]
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
        if (Math.abs(currentHeight - lastHeight) > 5) {
          lastHeight = currentHeight;
          emitHeightChange("ResizeObserver");
        }
      }, 50);
    });

    // Observe the main content area primarily; fall back to body.
    const mainEl = document.querySelector("main") as HTMLElement | null;
    if (mainEl) resizeObserver.observe(mainEl);
    else resizeObserver.observe(document.body);

    // Also observe the drawer content when it exists (header + scroll area).
    const sheetContent = document.querySelector(
      '[data-slot="sheet-content"]'
    ) as HTMLElement | null;
    if (sheetContent) {
      resizeObserver.observe(sheetContent);
      const sheetHeader = sheetContent.querySelector(
        '[data-slot="sheet-header"]'
      ) as HTMLElement | null;
      const sheetScrollArea = sheetContent.querySelector(
        ".overflow-y-auto"
      ) as HTMLElement | null;
      if (sheetHeader) resizeObserver.observe(sheetHeader);
      if (sheetScrollArea) resizeObserver.observe(sheetScrollArea);
    }

    return () => {
      clearTimeout(resizeTimeout);
      resizeObserver.disconnect();
    };
  }, [instanceId, calculateHeight, emitHeightChange]);

  return {
    calculateHeight,
    calculateWidth,
    emitHeightChange,
    emitWidthChange,
  };
}
