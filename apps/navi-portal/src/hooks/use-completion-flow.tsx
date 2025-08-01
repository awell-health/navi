"use client";

import { useState, useEffect } from "react";
import { ActivityFragment } from "@/lib/awell-client/generated/graphql";
import { ActivityService } from "@/lib/activity-provider";
import { logout } from "@/lib/awell-client/client";

// Completion flow states
type CompletionState = "active" | "waiting" | "completed";

interface UseCompletionFlowOptions {
  waitingDuration?: number; // Countdown duration in seconds
  onSessionCompleted?: () => void; // Callback when session completion is triggered
  onIframeClose?: () => void; // Callback when iframe should close
}

interface UseCompletionFlowResult {
  completionState: CompletionState;
  waitingCountdown: number | null;
}

/**
 * Custom hook to manage activity completion flow
 *
 * Handles:
 * - Detecting when all activities are complete
 * - Managing countdown timer
 * - Triggering session cleanup and logout
 * - Coordinating with parent window via postMessage
 */
export function useCompletionFlow(
  activities: ActivityFragment[],
  service: ActivityService,
  isLoading: boolean,
  options: UseCompletionFlowOptions = {}
): UseCompletionFlowResult {
  const { waitingDuration = 5, onSessionCompleted, onIframeClose } = options;

  const [completionState, setCompletionState] =
    useState<CompletionState>("active");
  const [waitingCountdown, setWaitingCountdown] = useState<number | null>(null);

  // Check for completion state when activities change
  useEffect(() => {
    if (!isLoading && activities.length > 0) {
      const completableActivities =
        service.getCompletableActivities(activities);

      if (completableActivities.length === 0 && completionState === "active") {
        console.log(
          "🏁 No more completable activities - starting waiting period"
        );
        setCompletionState("waiting");
        setWaitingCountdown(waitingDuration);
      } else if (
        completableActivities.length > 0 &&
        completionState !== "active"
      ) {
        // New activities came in, reset to active state
        console.log("🔄 New activities available - returning to active state");
        setCompletionState("active");
        setWaitingCountdown(null);
      }
    }
  }, [activities, isLoading, service, completionState, waitingDuration]);

  // Handle countdown timer and session cleanup
  useEffect(() => {
    if (waitingCountdown !== null && waitingCountdown > 0) {
      const timer = setTimeout(() => {
        setWaitingCountdown(waitingCountdown - 1);
      }, 1000);
      return () => clearTimeout(timer);
    } else if (waitingCountdown === 0) {
      // Countdown finished, perform cleanup and move to completed state
      console.log("✅ Countdown finished - performing session cleanup");

      const performSessionCleanup = async () => {
        try {
          // Complete logout: clear JWT, session cookies, and KV store
          await logout();
          console.log("🧹 Session logout completed");

          // Notify parent window that session is completed
          onSessionCompleted?.();
          console.log("📡 Session completed event sent to parent");

          // Move to completed state
          setCompletionState("completed");
          setWaitingCountdown(null);

          // Send iframe close event after a brief delay to let parent process completion
          setTimeout(() => {
            onIframeClose?.();
            console.log("🔒 Iframe close event sent to parent");
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
            console.log("🔒 Iframe close event sent to parent (after error)");
          }, 2000);
        }
      };

      performSessionCleanup();
    }
  }, [waitingCountdown, onSessionCompleted, onIframeClose]);

  return {
    completionState,
    waitingCountdown,
  };
}
