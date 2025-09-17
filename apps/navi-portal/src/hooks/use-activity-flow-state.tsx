"use client";

import { useMemo } from "react";
import { ActivityFragment } from "@/lib/awell-client/generated/graphql";
import { useActivityCounts } from "@/lib/activities/use-activity-counts";
import { useSessionCompletionTimer } from "./use-session-completion-timer";
import { useRecentActivityEvents } from "./use-recent-activity-events";

export type ActivityFlowState = 
  | { type: 'awaiting_subscription'; timeRemaining: number }
  | { type: 'truly_empty'; duration: number }
  | { type: 'completion_countdown'; countdown: number | null }
  | { type: 'has_activities'; count: number }
  | { type: 'loading' }
  | { type: 'error'; message: string };

interface UseActivityFlowStateOptions {
  activities?: ActivityFragment[];
  onSessionCompleted?: () => void;
  onIframeClose?: () => void;
  waitingDuration?: number;
}

/**
 * Hook that combines multiple data sources to determine the current UI state
 * 
 * This is the UI controller layer that decides what should be rendered based on:
 * - Activity counts from cache
 * - Session completion timer state  
 * - Recent activity events (temporal context)
 * 
 * Returns a single discriminated union that components can switch on
 */
export function useActivityFlowState(
  careflowId: string,
  options: UseActivityFlowStateOptions = {}
): ActivityFlowState {
  const { activities = [], onSessionCompleted, onIframeClose, waitingDuration = 5 } = options;

  // Data layer hooks
  const { pendingCount, totalCount, lastChangeAt, isLoading } = useActivityCounts(careflowId);
  const { completionState, waitingCountdown } = useSessionCompletionTimer(activities, {
    onSessionCompleted,
    onIframeClose, 
    waitingDuration,
    careflowId,
  });
  const { isAwaitingSubscription, timeSinceSubmission } = useRecentActivityEvents();

  return useMemo(() => {
    // Loading state
    if (isLoading) {
      return { type: 'loading' };
    }

    // Session completion countdown active
    if (completionState === 'waiting') {
      return { type: 'completion_countdown', countdown: waitingCountdown };
    }

    // Session completed
    if (completionState === 'completed') {
      return { type: 'completion_countdown', countdown: 0 };
    }

    // Recently submitted - awaiting subscription update (show loading/saving state)
    if (pendingCount === 0 && isAwaitingSubscription && timeSinceSubmission) {
      const timeRemaining = Math.max(0, 2000 - timeSinceSubmission);
      return { type: 'awaiting_subscription', timeRemaining };
    }
    
    // Been empty for a while (show empty state)
    if (pendingCount === 0 && Date.now() - lastChangeAt > 5000) {
      const duration = Date.now() - lastChangeAt;
      return { type: 'truly_empty', duration };
    }
    
    // Has active work
    if (pendingCount > 0) {
      return { type: 'has_activities', count: pendingCount };
    }

    // Default: has activities (even if pending count is 0, there might be completed ones)
    return { type: 'has_activities', count: totalCount };

  }, [
    isLoading,
    completionState, 
    waitingCountdown,
    pendingCount,
    totalCount,
    lastChangeAt,
    isAwaitingSubscription,
    timeSinceSubmission,
  ]);
}