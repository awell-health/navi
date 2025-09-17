"use client";

import { useState, useEffect } from "react";
import { useActivityContext } from "@/lib/activity-context-provider";

interface RecentActivityEvents {
  recentSubmission: number | null;
  isAwaitingSubscription: boolean;
  timeSinceSubmission: number | null;
}

/**
 * Hook to track recent activity events for temporal UI state
 * 
 * Tracks:
 * - Recent activity submissions (just completed)
 * - Whether we're awaiting subscription updates
 * - Time elapsed since last submission
 * 
 * Used to distinguish between different "empty" states:
 * - Just submitted, awaiting subscription (loading state)
 * - Been empty for a while (truly empty state)
 */
export function useRecentActivityEvents(): RecentActivityEvents {
  const [recentSubmission, setRecentSubmission] = useState<number | null>(null);
  const { coordinator } = useActivityContext();

  useEffect(() => {
    // Listen to activity completion events
    const unsubscribe = coordinator.on("activity.completed", (data) => {
      console.log("🎉 Recent activity completed", data);
      setRecentSubmission(Date.now());
    });

    return unsubscribe;
  }, [coordinator]);

  // Calculate derived values
  const timeSinceSubmission = recentSubmission ? Date.now() - recentSubmission : null;
  const isAwaitingSubscription = Boolean(
    recentSubmission && timeSinceSubmission && timeSinceSubmission < 2000 // 2 seconds
  );

  // Clear recent submission after 10 seconds to avoid memory leaks
  useEffect(() => {
    if (!recentSubmission) return;

    const timeout = setTimeout(() => {
      setRecentSubmission(null);
    }, 10000); // 10 seconds

    return () => clearTimeout(timeout);
  }, [recentSubmission]);

  return {
    recentSubmission,
    isAwaitingSubscription,
    timeSinceSubmission,
  };
}