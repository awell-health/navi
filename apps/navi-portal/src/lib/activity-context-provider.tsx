"use client";

import React, {
  createContext,
  useContext,
  useState,
  useEffect,
  useCallback,
  useMemo,
} from "react";
import { useSessionId } from "@/hooks/use-session-id";
import {
  ActivityFragment,
  usePathwayActivitiesQuery,
  useGetActivityQuery,
  useOnActivityUpdatedSubscription,
  useOnActivityCompletedSubscription,
  useOnActivityExpiredSubscription,
  useOnActivityReadySubscription,
  useCompleteActivityMutation,
} from "@/lib/awell-client/generated/graphql";
import { upsertActivityInCache } from "@/lib/awell-client/cache-policies";
import { UserActivityType } from "@awell-health/navi-core";
import {
  filterUserActivities,
  findFirstActiveActivity,
  findFirstCompletableActivity,
  getNextCompletableActivity,
  getActivitiesRequiringCompletion,
  calculateProgress,
  canTransitionTo,
  isActivityCompleted,
  getCompletableActivities,
} from "./activities/helpers";

// =================== SERVICE LAYER ===================

/**
 * ActivityEventCoordinator - Event coordination and communication
 * Manages cross-component event coordination via event bus
 */
class ActivityEventCoordinator {
  private listeners: Map<string, Set<(data: unknown) => void>> = new Map();

  // Event bus for cross-service communication
  emit(event: string, data: unknown) {
    console.log("🔔 Emitting event:", event);
    const handlers = this.listeners.get(event);
    if (handlers) {
      handlers.forEach((handler) => {
        console.log("🔔 Calling handler for event:", event);
        handler(data);
      });
    }
  }

  on(event: string, handler: (data: unknown) => void) {
    if (!this.listeners.has(event)) {
      this.listeners.set(event, new Set());
    }
    this.listeners.get(event)!.add(handler);

    // Return unsubscribe function
    return () => {
      this.listeners.get(event)?.delete(handler);
    };
  }
}

// =================== REACT ADAPTER LAYER ===================

interface ActivityContextType {
  // Data (from Apollo cache)
  activities: ActivityFragment[];
  activeActivity: ActivityFragment | null;

  // State
  isLoading: boolean;
  error: string | null;

  // UI-specific state (not in GraphQL)
  visitedActivities: Set<string>;
  newActivities: Set<string>;

  // Actions
  setActiveActivity: (activityId: string) => void;
  clearActiveActivity: () => void;
  markActivityAsViewed: (activityId: string) => void;
  refetchActivities: () => Promise<void>;
  completeActivity: (
    activityId: string,
    data: Record<string, unknown>,
    activityType: UserActivityType
  ) => Promise<void>;

  // Event coordinator instance (for advanced use cases)
  coordinator: ActivityEventCoordinator;

  // Computed values
  progress: { completed: number; total: number; percentage: number };
}

const ActivityContext = createContext<ActivityContextType | null>(null);

interface ActivityContextProviderProps {
  children: React.ReactNode;
  careflowId: string;
  stakeholderId?: string;
  onActivityActivate?: (activityId: string, activity: ActivityFragment) => void;
  coordinator?: ActivityEventCoordinator; // Allow injection for testing
  autoAdvanceOnComplete?: boolean; // If true, move to next task; otherwise clear selection
  activityId?: string; // Optional: if provided, fetch only this activity
}

/**
 * ActivityContextProvider - Manages activity state and lifecycle for careflows
 *
 * @param careflowId - The ID of the careflow to fetch activities for
 * @param stakeholderId - Optional stakeholder ID to filter activities by ownership
 * @param activityId - Optional activity ID to fetch only a single activity instead of all careflow activities
 * @param autoAdvanceOnComplete - Whether to automatically advance to the next activity on completion
 * @param coordinator - Optional injected coordinator instance for testing
 * @param onActivityActivate - Optional callback when an activity is activated
 *
 * When activityId is provided, the provider will:
 * - Skip fetching all careflow activities
 * - Fetch only the specified activity
 * - Maintain the same subscription-based updates for that activity
 * - Apply the same stakeholder filtering and business logic
 */
export function ActivityContextProvider({
  children,
  careflowId,
  stakeholderId,
  coordinator: injectedCoordinator,
  autoAdvanceOnComplete = true,
  activityId,
}: ActivityContextProviderProps) {
  // Create coordinator instance only once
  const [coordinator] = useState(() => injectedCoordinator || new ActivityEventCoordinator());
  const sessionId = useSessionId();

  // State (UI only)
  const [activeActivity, setActiveActivityState] =
    useState<ActivityFragment | null>(null);
  const [visitedActivities, setVisitedActivities] = useState<Set<string>>(
    new Set()
  );
  const [newActivities, setNewActivities] = useState<Set<string>>(new Set());

  // GraphQL query for initial activities
  const {
    data: activitiesData,
    loading: isPathwayActivitiesLoading,
    error: gqlError,
    refetch,
  } = usePathwayActivitiesQuery({
    variables: {
      careflow_id: careflowId,
      // WHY: trackId narrows the activities universe server-side. If present
      // in session, we pass it to GraphQL so only the relevant track's
      // activities are returned. This prevents leaking unrelated tasks.
      // Note: activityId is a client-side focus filter, not a server filter.
      // It can be used to select a single activity in the UI.
      // We read both from session cookies via a tiny helper to avoid plumbing.
      // For now, only server-side track filtering is applied here.
    },
    skip: !!activityId, // Skip fetching all activities if we're fetching a single one
  });

  // GraphQL query for a single activity if activityId is provided
  const {
    data: singleActivityData,
    loading: isSingleActivityLoading,
    error: singleActivityError,
    refetch: refetchSingleActivity,
  } = useGetActivityQuery({
    variables: { id: activityId || "" },
    skip: !activityId, // Skip if no activityId is provided
  });

  // GraphQL mutation for completing activities
  const [completeActivityMutation] = useCompleteActivityMutation();

  // =================== SUBSCRIPTION HANDLERS ===================

  useOnActivityReadySubscription({
    variables: { careflow_id: careflowId },
    onData: ({ data, client }) => {
      const ready = data.data?.activityReady;
      if (!ready) return;
      const readyId = ready.id;
      if (ready.is_user_activity === false) return;
      upsertActivityInCache(client.cache, {
        careflowId,
        activity: ready as unknown as { __typename: "Activity"; id: string } & Record<string, unknown>,
      });
      console.log("🔍 Activity ready. Emitting event", ready);
      coordinator.emit("activity.ready", { activity: ready });
      if (readyId) setNewActivities((prev) => new Set([...prev, readyId]));
      // If nothing is active, immediately activate the newly ready activity
      if (!activeActivity && ready.status === "ACTIVE") {
        setActiveActivityState(ready as ActivityFragment);
        coordinator.emit("activity.activated", { activity: ready });
      }
    },
    onError: (error) => {
      console.error("❌ Activity ready subscription error:", error);
    },
  });

  useOnActivityUpdatedSubscription({
    variables: { careflow_id: careflowId },
    onData: ({ data, client }) => {
      const updatedActivity = data.data?.activityUpdated;
      if (!updatedActivity) return;
      console.log("🔄 Activity updated:", updatedActivity.id);
      upsertActivityInCache(client.cache, {
        careflowId,
        activity: updatedActivity as unknown as { __typename: "Activity"; id: string } & Record<string, unknown>,
      });
      coordinator.emit("activity.updated", { activity: updatedActivity });
      if (activeActivity?.id === updatedActivity.id) {
        setActiveActivityState(updatedActivity as ActivityFragment);
      }
    },
    onError: (error) => {
      console.error("❌ Activity updated subscription error:", error);
    },
  });

  useOnActivityCompletedSubscription({
    variables: { careflow_id: careflowId },
    onData: ({ data, client }) => {
      const completedActivity = data.data?.activityCompleted;
      if (!completedActivity) return;
      console.log("✅ Activity completed:", completedActivity.id);
      upsertActivityInCache(client.cache, {
        careflowId,
        activity: completedActivity as unknown as { __typename: "Activity"; id: string } & Record<string, unknown>,
      });

      coordinator.emit("activity.completed", {
        activity: completedActivity,
        timestamp: Date.now(),
      });

      // Clear active activity - let activity.ready subscription handle advancement
      if (activeActivity?.id === completedActivity.id) {
        setActiveActivityState(null);
        coordinator.emit("activity.cleared", {});
      }
    },
    onError: (error) => {
      console.error("❌ Activity completed subscription error:", error);
    },
  });

  useOnActivityExpiredSubscription({
    variables: { careflow_id: careflowId },
    onData: ({ data, client }) => {
      if (data.data?.activityExpired) {
        const expiredActivity = data.data.activityExpired;
        console.log("⏰ Activity expired:", expiredActivity.id);
        upsertActivityInCache(client.cache, {
          careflowId,
          activity: expiredActivity as unknown as { __typename: "Activity"; id: string } & Record<string, unknown>,
        });
        coordinator.emit("activity.expired", { activity: expiredActivity });
        if (activeActivity?.id === expiredActivity.id) {
          setActiveActivityState(expiredActivity);
        }
      }
    },
    onError: (error) => {
      console.error("❌ Activity expired subscription error:", error);
      // Don't reset state on subscription errors - preserve form data
    },
  });

  // =================== DERIVED ACTIVITIES FROM CACHE/QUERY ===================
  const activities: ActivityFragment[] = useMemo(() => {
    if (activityId && singleActivityData?.activity?.activity) {
      const single = singleActivityData.activity.activity as ActivityFragment;
      if (single.careflow_id !== careflowId) return [];
      const filtered = filterUserActivities([single], stakeholderId);
      return filtered;
    }
    const list: ActivityFragment[] = activitiesData?.pathwayActivities?.activities ?? [];
    const filtered = filterUserActivities(list, stakeholderId);
    // Do not narrow by URL params here; the provider manages focus internally.
    return filtered;
  }, [activityId, singleActivityData, activitiesData, stakeholderId, careflowId]);

  // Fallback auto-select for initial render: pick first completable when none selected
  useEffect(() => {
    if (!activeActivity && activities.length > 0) {
      const firstCompletable = findFirstCompletableActivity(activities);
      if (firstCompletable) {
        setActiveActivityState(firstCompletable);
        coordinator.emit("activity.activated", { activity: firstCompletable });
      }
    }
  }, [activities, activeActivity, coordinator]);

  // =================== ACTION HANDLERS ===================

  const setActiveActivity = useCallback(
    (activityId: string) => {
      const activity = activities.find((a) => a.id === activityId);
      if (activity) {
        setActiveActivityState(activity);
        coordinator.emit("activity.activated", { activity });
        console.log("🎯 Active activity set to:", activityId);
      } else {
        console.warn("⚠️ Activity not found:", activityId);
      }
    },
    [activities, coordinator]
  );

  const clearActiveActivity = useCallback(() => {
    setActiveActivityState(null);
    coordinator.emit("activity.cleared", {});
    console.log("↩️ Cleared active activity (return to list)");
  }, [coordinator]);

  const markActivityAsViewed = useCallback(
    (activityId: string) => {
      setVisitedActivities((prev) => new Set([...prev, activityId]));
      setNewActivities((prev) => {
        const newSet = new Set(prev);
        newSet.delete(activityId);
        return newSet;
      });
      coordinator.emit("activity.viewed", { activityId });
      console.log("👁️ Activity marked as viewed:", activityId);
    },
    [coordinator]
  );

  const refetchActivities = useCallback(async () => {
    console.log("🔄 Refetching activities...");
    if (activityId) {
      await refetchSingleActivity();
    } else {
      await refetch();
    }
  }, [refetch, refetchSingleActivity, activityId]);

  const completeActivity = useCallback(
    async (
      activityId: string,
      data: Record<string, unknown>,
      activityType: UserActivityType
    ) => {
      console.log("🔄 Completing activity:", activityId, activityType, data);

      try {
        // Ensure we have a session ID for completion tracking
        if (!sessionId) {
          console.error("❌ No session ID available for activity completion");
          return;
        }

        // Prepare completion context
        const completionContext = {
          completed_at: new Date().toISOString(),
          user_type: "PATIENT" as const, // Use string literal instead of enum
          user_id: stakeholderId,
          navi_session_id: sessionId,
        };

        let input;

        switch (activityType) {
          case "FORM": {
            // For forms, convert form data to question responses
            const formResponse = data.formData
              ? Object.entries(data.formData).map(([questionId, value]) => {
                  // Convert Date objects to ISO8601 format
                  let formattedValue: string;
                  if (value instanceof Date) {
                    formattedValue = value.toISOString(); // Full ISO8601 datetime format
                  } else {
                    formattedValue = String(value || "");
                  }

                  return {
                    question_id: questionId,
                    value: formattedValue,
                  };
                })
              : [];

            input = {
              activity_id: activityId,
              input_type: "FORM" as const,
              form_response: formResponse,
              completion_context: completionContext,
            };
            break;
          }

          case "EXTENSION": {
            input = {
              activity_id: activityId,
              input_type: "EXTENSION" as const,
              input_data: data,
              completion_context: completionContext,
            };
            break;
          }

          case "CHECKLIST": {
            input = {
              activity_id: activityId,
              input_type: "CHECKLIST" as const,
              input_data: data,
              completion_context: completionContext,
            };
            break;
          }

          case "MESSAGE": {
            input = {
              activity_id: activityId,
              input_type: "MESSAGE" as const,
              input_data: {
                read_at: new Date().toISOString(),
                ...data,
              },
              completion_context: completionContext,
            };
            break;
          }

          default:
            console.error("❌ Unsupported activity type for completion:", activityType);
            return;
        }

        console.log("📤 Sending completion request:", input);

        const result = await completeActivityMutation({
          variables: { input },
          update: (cache, { data }) => {
            const a = data?.completeActivity?.activity as
              | ({ __typename: "Activity"; id: string } & Record<string, unknown>)
              | undefined;
            if (a) {
              upsertActivityInCache(cache, { careflowId, activity: a });
            }
          },
        });

        if (
          result.data?.completeActivity.success &&
          result.data.completeActivity.activity
        ) {
          console.log("✅ Activity completed successfully:", activityId);

          const completedActivity = result.data.completeActivity.activity as ActivityFragment;
          coordinator.emit("activity.completed", {
            activityId,
            activity: completedActivity,
            timestamp: Date.now(),
          });
        } else {
          console.error(
            "❌ Activity completion failed:",
            result.data?.completeActivity.message
          );
        }
      } catch (error) {
        console.error("❌ Error completing activity:", error);
        coordinator.emit("activity.error", {
          activityId,
          error: error instanceof Error ? error.message : "Unknown error",
          timestamp: Date.now(),
        });
      }
    },
    [activities, stakeholderId, completeActivityMutation, coordinator]
  );

  // =================== CONTEXT VALUE ===================

  // Combine loading states from both queries
  const isLoading = activityId
    ? isSingleActivityLoading
    : isPathwayActivitiesLoading;

  // Combine error states from both queries
  const error =
    (activityId ? singleActivityError?.message : gqlError?.message) || null;

  const contextValue: ActivityContextType = useMemo(
    () => ({
      // Data (from Apollo cache)
      activities,
      activeActivity,

      // State
      isLoading,
      error,

      // UI-specific state (not in GraphQL)
      visitedActivities,
      newActivities,

      // Actions
      setActiveActivity,
      markActivityAsViewed,
      refetchActivities,
      completeActivity,
      clearActiveActivity,

      // Event coordinator instance
      coordinator,

      // Computed values
      progress: calculateProgress(activities),
    }),
    [
      activities,
      activeActivity,
      isLoading,
      error,
      visitedActivities,
      newActivities,
      setActiveActivity,
      clearActiveActivity,
      markActivityAsViewed,
      refetchActivities,
      completeActivity,
      coordinator,
    ]
  );

  return (
    <ActivityContext.Provider value={contextValue}>
      {children}
    </ActivityContext.Provider>
  );
}

export function useActivityContext() {
  const context = useContext(ActivityContext);
  if (!context) {
    throw new Error("useActivityContext must be used within an ActivityContextProvider");
  }
  return context;
}

// Backward compatibility
export const useActivity = useActivityContext;
export const ActivityProvider = ActivityContextProvider;

// Export coordinator class for testing or external use
export { ActivityEventCoordinator };
