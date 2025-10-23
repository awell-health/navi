"use client";

import { useState, useEffect, useRef } from "react";
import { ActivityFragment } from "@/lib/awell-client/generated/graphql";
import { useActivityCounts } from "@/lib/activities/use-activity-counts";
import { logout } from "@/lib/awell-client/client";
import {
  createCompletionController,
  type CompletionEvent,
} from "@/lib/completion/completion-controller";
import type { CompletionLifecycleName } from "@/lib/completion/completion-controller";
import type { ActivityEventCoordinator } from "@/lib/activity-context-provider";

// Completion flow states
type CompletionState = "active" | "waiting" | "completed";

interface UseSessionCompletionTimerOptions {
  waitingDuration?: number; // Countdown duration in seconds
  onSessionCompleted?: () => void; // Callback when session completion is triggered
  onIframeClose?: () => void; // Callback when iframe should close
  isSingleActivityMode?: boolean; // Whether we're in single activity mode
  allowCompletedActivitiesInSingleMode?: boolean; // Whether to allow completed activities in single mode without logout
  careflowId?: string; // Optional override to derive pending state without relying on activities array
  coordinator?: ActivityEventCoordinator; // To reset countdown on any lifecycle event
}

interface UseSessionCompletionTimerResult {
  completionState: CompletionState;
  waitingCountdown: number | null;
  waitingTotal: number | null;
}

/**
 * Custom hook to manage session completion timer
 *
 * Handles:
 * - Detecting when all activities are complete
 * - Managing countdown timer
 * - Triggering session cleanup and logout
 * - Coordinating with parent window via postMessage
 */
export function useSessionCompletionTimer(
  activities: ActivityFragment[],
  options: UseSessionCompletionTimerOptions = {}
): UseSessionCompletionTimerResult {
  const { waitingDuration = 20, onSessionCompleted, onIframeClose, isSingleActivityMode = false, allowCompletedActivitiesInSingleMode = true, careflowId, coordinator } = options;

  const [completionState, setCompletionState] = useState<CompletionState>("active");
  const [waitingCountdown, setWaitingCountdown] = useState<number | null>(null);
  const [waitingTotal, setWaitingTotal] = useState<number | null>(null);
  const timerRef = useRef<ReturnType<typeof setTimeout> | null>(null);
  const controllerRef = useRef(createCompletionController("active"));

  // Drive from cache-derived pending state
  const careflowIdEffective = careflowId ?? activities[0]?.careflow_id ?? "";
  const { pendingCount } = useActivityCounts(careflowIdEffective);

  useEffect(() => {
    if (!careflowIdEffective) return;
    const event: CompletionEvent = {
      type: "activitiesChanged",
      total: activities.length,
      completable: pendingCount,
    };
    const { state, actions } = controllerRef.current.transition(event);
    setCompletionState(state);
    const debug = process.env.NEXT_PUBLIC_DEBUG_NAVI === "true";
    if (debug) {
      // eslint-disable-next-line no-console
      console.debug("[Completion] activitiesChanged", { total: activities.length, pendingCount, state, actions });
    }
    if (actions.includes("start_timer")) {
      if (timerRef.current) clearTimeout(timerRef.current);
      setWaitingCountdown(waitingDuration);
      setWaitingTotal(waitingDuration);
    }
    if (actions.includes("stop_timer")) {
      if (timerRef.current) clearTimeout(timerRef.current);
      setWaitingCountdown(null);
      setWaitingTotal(null);
    }
  }, [activities.length, pendingCount, careflowIdEffective, waitingDuration]);

  // Reset countdown if ANY activity lifecycle event comes in via coordinator
  useEffect(() => {
    if (!coordinator) return;
    const names: CompletionLifecycleName[] = [
      "activity.ready",
      "activity.updated",
      "activity.completed",
      "activity.expired",
    ];
    const unsubs = names.map((name) =>
      coordinator.on(name, () => {
        const { state, actions } = controllerRef.current.transition({ type: "lifecycle", name });
        setCompletionState(state);
        const debug = process.env.NEXT_PUBLIC_DEBUG_NAVI === "true";
        if (debug) {
          // eslint-disable-next-line no-console
          console.debug("[Completion] lifecycle", { name, state, actions });
        }
        if (actions.includes("stop_timer")) {
          if (timerRef.current) clearTimeout(timerRef.current);
          setWaitingCountdown(null);
          setWaitingTotal(null);
        }
      })
    );
    return () => {
      unsubs.forEach((u) => u && u());
    };
  }, [coordinator]);

  // Handle countdown timer and session cleanup
  useEffect(() => {
    if (waitingCountdown !== null && waitingCountdown > 0) {
      if (timerRef.current) clearTimeout(timerRef.current);
      const timer = setTimeout(() => {
        setWaitingCountdown(waitingCountdown - 1);
      }, 1000);
      timerRef.current = timer;
      return () => clearTimeout(timer);
    } else if (waitingCountdown === 0) {
      // Countdown finished, perform cleanup and move to completed state
      const { state } = controllerRef.current.transition({ type: "timeout" });
      setCompletionState(state);
      const debug = process.env.NEXT_PUBLIC_DEBUG_NAVI === "true";
      if (debug) {
        // eslint-disable-next-line no-console
        console.debug("[Completion] timeout reached, cleaning up");
      }
      const performSessionCleanup = async () => {
        try {
          // Complete logout: clear JWT, session cookies, and KV store
          await logout();

          // Notify parent window that session is completed
          onSessionCompleted?.();

          // Move to completed state
          setCompletionState("completed");
          setWaitingCountdown(null);

          // Send iframe close event after a brief delay to let parent process completion
          setTimeout(() => {
            onIframeClose?.();
          }, 2000); // 2 second delay
        } catch (error) {
          console.error("❌ Session cleanup failed:", error);
          // Still move to completed state even if cleanup fails
          setCompletionState("completed");
          setWaitingCountdown(null);
          onSessionCompleted?.();

          // Send close event even if logout fails
          setTimeout(() => {
            onIframeClose?.();
          }, 2000);
        }
      };

      performSessionCleanup();
    }
  }, [waitingCountdown, onSessionCompleted, onIframeClose]);

  return {
    completionState,
    waitingCountdown,
    waitingTotal,
  };
}
