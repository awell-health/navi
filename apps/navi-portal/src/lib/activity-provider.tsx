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
  useOnActivityCreatedSubscription,
  useOnActivityUpdatedSubscription,
  useOnActivityCompletedSubscription,
  useOnActivityExpiredSubscription,
  useCompleteActivityMutation,
} from "@/lib/awell-client/generated/graphql";

// =================== SERVICE LAYER ===================

/**
 * ActivityService - Business logic and event coordination
 * Leverages Apollo's cache instead of maintaining its own
 */
class ActivityService {
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

  // Pure business logic methods (no caching needed)
  filterUserActivities(
    activities: ActivityFragment[],
    stakeholderId?: string
  ): ActivityFragment[] {
    const userActivities = activities.filter((a) => a.is_user_activity);

    if (stakeholderId) {
      return userActivities.filter(
        (activity) =>
          activity.indirect_object?.id === stakeholderId ||
          activity.object?.id === stakeholderId
      );
    }

    return userActivities;
  }

  findFirstActiveActivity(
    activities: ActivityFragment[]
  ): ActivityFragment | null {
    return activities.find((a) => a.status === "ACTIVE") || null;
  }

  findFirstCompletableActivity(
    activities: ActivityFragment[]
  ): ActivityFragment | null {
    // Find first activity that needs user action (ACTIVE and not completed)
    const completableActivities = this.getCompletableActivities(activities);
    return completableActivities[0] || null;
  }

  getNextCompletableActivity(
    currentActivityId: string,
    activities: ActivityFragment[]
  ): ActivityFragment | null {
    // Get all completable activities (order-agnostic)
    const completableActivities = this.getCompletableActivities(activities);
    console.log(
      "✅ Completable activities:",
      completableActivities.map((a) => ({
        id: a.id,
        name: a.object.name,
        status: a.status,
        type: a.object.type,
      }))
    );

    // Simply return the first completable activity (order doesn't matter)
    const nextActivity = completableActivities[0] || null;
    console.log(
      "🎯 Next activity to advance to:",
      nextActivity ? nextActivity.object.name : "none"
    );

    return nextActivity;
  }

  // Activity completion business logic
  isActivityCompleted(activity: ActivityFragment): boolean {
    // Message activities: check resolution instead of just status
    if (activity.object.type === "MESSAGE") {
      // Messages don't block orchestration, so status is always "DONE"
      // We need to check resolution to see if user actually completed it
      return activity.resolution === "SUCCESS";
    }

    // Other activity types: status "DONE" means completed
    // (FORM, CHECKLIST, etc. that do block orchestration)
    return activity.status === "DONE";
  }

  getCompletableActivities(activities: ActivityFragment[]): ActivityFragment[] {
    // Filter for activities that still need user action
    return activities.filter((activity) => {
      // Skip if already completed
      if (this.isActivityCompleted(activity)) {
        return false;
      }

      // Only include ACTIVE activities (user can act on them)
      return activity.status === "ACTIVE";
    });
  }

  getActivitiesRequiringCompletion(
    activities: ActivityFragment[]
  ): ActivityFragment[] {
    // Activities that are not yet completed (regardless of ACTIVE status)
    return activities.filter((activity) => !this.isActivityCompleted(activity));
  }

  // Computed properties that might not exist in GraphQL
  calculateProgress(activities: ActivityFragment[]): {
    completed: number;
    total: number;
    percentage: number;
  } {
    // Use proper completion logic instead of just counting status === "DONE"
    const completed = activities.filter((a) =>
      this.isActivityCompleted(a)
    ).length;
    const total = activities.length;
    const percentage = total > 0 ? Math.round((completed / total) * 100) : 0;

    return { completed, total, percentage };
  }

  // Business rules that don't belong in components
  canTransitionTo(
    currentActivity: ActivityFragment | null,
    targetActivity: ActivityFragment
  ): boolean {
    // Example business logic
    if (!currentActivity) return targetActivity.status === "ACTIVE";
    if (currentActivity.status !== "DONE") return false;
    if (targetActivity.status !== "ACTIVE") return false;

    // More complex rules could go here
    return true;
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
  markActivityAsViewed: (activityId: string) => void;
  refetchActivities: () => Promise<void>;
  completeActivity: (
    activityId: string,
    data: Record<string, unknown>,
    activityType?: string
  ) => Promise<void>;

  // Service instance (for advanced use cases)
  service: ActivityService;

  // Computed values
  progress: { completed: number; total: number; percentage: number };
}

const ActivityContext = createContext<ActivityContextType | null>(null);

interface ActivityProviderProps {
  children: React.ReactNode;
  careflowId: string;
  stakeholderId?: string;
  onActivityActivate?: (activityId: string, activity: ActivityFragment) => void;
  service?: ActivityService; // Allow injection for testing
}

export function ActivityProvider({
  children,
  careflowId,
  stakeholderId,
  service: injectedService,
}: ActivityProviderProps) {
  // Create service instance only once
  const [service] = useState(() => injectedService || new ActivityService());
  const sessionId = useSessionId();

  // State
  const [activities, setActivities] = useState<ActivityFragment[]>([]);
  const [activeActivity, setActiveActivityState] =
    useState<ActivityFragment | null>(null);
  const [visitedActivities, setVisitedActivities] = useState<Set<string>>(
    new Set()
  );
  const [newActivities, setNewActivities] = useState<Set<string>>(new Set());

  // GraphQL query for initial activities
  const {
    data: activitiesData,
    loading: isLoading,
    error: gqlError,
    refetch,
  } = usePathwayActivitiesQuery({
    variables: {
      careflow_id: careflowId,
    },
  });

  // GraphQL mutation for completing activities
  const [completeActivityMutation] = useCompleteActivityMutation();

  // =================== SUBSCRIPTION HANDLERS ===================

  // These could be extracted to a custom hook: useActivitySubscriptions
  function shouldReplaceActivity(
    existing: ActivityFragment,
    incoming: ActivityFragment
  ): boolean {
    // Compare only fields that affect rendering in our UI
    if (existing.status !== incoming.status) return true;
    if (existing.resolution !== incoming.resolution) return true;
    if (existing.date !== incoming.date) return true;
    if (existing.is_user_activity !== incoming.is_user_activity) return true;
    const exObj = existing.object;
    const inObj = incoming.object;
    if (exObj?.id !== inObj?.id) return true;
    if (exObj?.name !== inObj?.name) return true;
    if (exObj?.type !== inObj?.type) return true;
    // Default: keep existing reference
    return false;
  }
  useOnActivityCreatedSubscription({
    variables: { careflow_id: careflowId },
    onData: ({ data }) => {
      if (data.data?.activityCreated) {
        const newActivity = data.data.activityCreated;
        console.debug("🆕 New activity created:", newActivity.id);
        if (newActivity.is_user_activity) {
          service.emit("activity.created", { activity: newActivity });
          setActivities((prev) => {
            if (prev.find((a) => a.id === newActivity.id)) {
              return prev;
            }
            return [newActivity, ...prev];
          });
          setNewActivities((prev) => new Set([...prev, newActivity.id]));
        }
      }
    },
    onError: (error) => {
      console.error("❌ Activity created subscription error:", error);
      // Don't reset state on subscription errors - preserve form data
    },
  });

  useOnActivityUpdatedSubscription({
    variables: { careflow_id: careflowId },
    onData: ({ data }) => {
      if (data.data?.activityUpdated) {
        const updatedActivity = data.data.activityUpdated;
        console.log("🔄 Activity updated:", updatedActivity.id);

        // Update service cache
        // service.updateCache(updatedActivity); // No longer needed

        // Emit event
        service.emit("activity.updated", { activity: updatedActivity });

        setActivities((previousActivities) => {
          const index = previousActivities.findIndex(
            (a) => a.id === updatedActivity.id
          );
          if (index === -1) return previousActivities;
          const current = previousActivities[index];
          if (!shouldReplaceActivity(current, updatedActivity)) {
            return previousActivities; // no-op; preserve reference to avoid unnecessary re-renders
          }
          const next = previousActivities.slice();
          next[index] = updatedActivity;
          return next;
        });

        if (activeActivity?.id === updatedActivity.id) {
          setActiveActivityState(updatedActivity);
        }
      }
    },
    onError: (error) => {
      console.error("❌ Activity updated subscription error:", error);
      // Don't reset state on subscription errors - preserve form data
    },
  });

  useOnActivityCompletedSubscription({
    variables: { careflow_id: careflowId },
    onData: ({ data }) => {
      if (data.data?.activityCompleted) {
        const completedActivity = data.data.activityCompleted;
        console.log("✅ Activity completed:", completedActivity.id);

        // Emit event for other services (e.g., CommunicationService)
        service.emit("activity.completed", {
          activity: completedActivity,
          timestamp: Date.now(),
        });

        // Update activities state
        setActivities((previousActivities) => {
          const index = previousActivities.findIndex(
            (a) => a.id === completedActivity.id
          );
          if (index === -1) return previousActivities;
          const current = previousActivities[index];
          if (!shouldReplaceActivity(current, completedActivity)) {
            return previousActivities;
          }
          const next = previousActivities.slice();
          next[index] = completedActivity;
          return next;
        });

        // Auto-advance to next activity if the completed one was active
        if (activeActivity?.id === completedActivity.id) {
          console.log("🔄 Completed activity was active, checking for next...");
          console.log("✅ Completed activity details:", {
            id: completedActivity.id,
            name: completedActivity.object.name,
            status: completedActivity.status,
            resolution: completedActivity.resolution,
          });

          // Update current activity state first
          setActiveActivityState(completedActivity);

          // Find next completable activity using business logic
          const nextActivity = service.getNextCompletableActivity(
            completedActivity.id,
            // Use the latest activities list including the completed update
            activities.map((a) =>
              a.id === completedActivity.id ? completedActivity : a
            )
          );

          if (nextActivity) {
            console.log("🎯 Auto-advancing to next activity:", {
              id: nextActivity.id,
              name: nextActivity.object.name,
              type: nextActivity.object.type,
              status: nextActivity.status,
            });
            setActiveActivityState(nextActivity);
            service.emit("activity.activated", { activity: nextActivity });
          } else {
            console.log("🏁 No more activities to complete");
          }
        } else {
          console.log(
            "⏭️ Completed activity was not active, no auto-advance needed"
          );
        }
      }
    },
    onError: (error) => {
      console.error("❌ Activity completed subscription error:", error);
      // Don't reset state on subscription errors - preserve form data
    },
  });

  useOnActivityExpiredSubscription({
    variables: { careflow_id: careflowId },
    onData: ({ data }) => {
      if (data.data?.activityExpired) {
        const expiredActivity = data.data.activityExpired;
        console.log("⏰ Activity expired:", expiredActivity.id);

        // service.updateCache(expiredActivity); // No longer needed
        service.emit("activity.expired", { activity: expiredActivity });

        setActivities((previousActivities) => {
          const index = previousActivities.findIndex(
            (a) => a.id === expiredActivity.id
          );
          if (index === -1) return previousActivities;
          const current = previousActivities[index];
          if (!shouldReplaceActivity(current, expiredActivity)) {
            return previousActivities;
          }
          const next = previousActivities.slice();
          next[index] = expiredActivity;
          return next;
        });

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

  // =================== INITIAL DATA HANDLING ===================

  useEffect(() => {
    if (activitiesData?.pathwayActivities?.activities) {
      const allActivities = activitiesData.pathwayActivities.activities;
      console.log("📋 Activities loaded from GraphQL:", allActivities.length);

      // Use service for business logic
      const filteredActivities = service.filterUserActivities(
        allActivities,
        stakeholderId
      );

      console.log(
        "👤 User activities for stakeholder:",
        filteredActivities.length
      );
      setActivities(filteredActivities);

      // Auto-select first completable activity (respects completion business logic)
      if (!activeActivity) {
        const firstCompletable =
          service.findFirstCompletableActivity(filteredActivities);
        if (firstCompletable) {
          setActiveActivityState(firstCompletable);
          service.emit("activity.activated", { activity: firstCompletable });
          console.log(
            "🎯 Auto-selected first completable activity:",
            firstCompletable.id
          );
        }
      }
    }
  }, [activitiesData, stakeholderId, activeActivity, service]);

  // =================== ACTION HANDLERS ===================

  const setActiveActivity = useCallback(
    (activityId: string) => {
      const activity = activities.find((a) => a.id === activityId);
      if (activity) {
        setActiveActivityState(activity);
        service.emit("activity.activated", { activity });
        console.log("🎯 Active activity set to:", activityId);
      } else {
        console.warn("⚠️ Activity not found:", activityId);
      }
    },
    [activities, service]
  );

  const markActivityAsViewed = useCallback(
    (activityId: string) => {
      setVisitedActivities((prev) => new Set([...prev, activityId]));
      setNewActivities((prev) => {
        const newSet = new Set(prev);
        newSet.delete(activityId);
        return newSet;
      });
      service.emit("activity.viewed", { activityId });
      console.log("👁️ Activity marked as viewed:", activityId);
    },
    [service]
  );

  const refetchActivities = useCallback(async () => {
    console.log("🔄 Refetching activities...");
    await refetch();
  }, [refetch]);

  const completeActivity = useCallback(
    async (
      activityId: string,
      data: Record<string, unknown>,
      activityType?: string
    ) => {
      console.log("🔄 Completing activity:", activityId, activityType, data);

      try {
        // Find the activity to determine its type
        const activity = activities.find((a) => a.id === activityId);
        if (!activity) {
          console.error("❌ Activity not found:", activityId);
          return;
        }

        // Ensure we have a session ID for completion tracking
        if (!sessionId) {
          console.error("❌ No session ID available for activity completion");
          return;
        }

        const type = activityType || activity.object.type;

        // Prepare completion context
        const completionContext = {
          completed_at: new Date().toISOString(),
          user_type: "PATIENT" as const, // Use string literal instead of enum
          user_id: stakeholderId,
          navi_session_id: sessionId,
        };

        let input;

        switch (type) {
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
            console.error("❌ Unsupported activity type for completion:", type);
            return;
        }

        console.log("📤 Sending completion request:", input);

        const result = await completeActivityMutation({
          variables: { input },
        });

        if (
          result.data?.completeActivity.success &&
          result.data.completeActivity.activity
        ) {
          console.log("✅ Activity completed successfully:", activityId);

          // Immediately update local cache with completed activity
          const completedActivity = result.data.completeActivity.activity;
          setActivities((prev) =>
            prev.map((activity) => {
              if (activity.id === activityId) {
                return completedActivity;
              }
              return activity;
            })
          );

          service.emit("activity.completed", {
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
        service.emit("activity.error", {
          activityId,
          error: error instanceof Error ? error.message : "Unknown error",
          timestamp: Date.now(),
        });
      }
    },
    [activities, stakeholderId, completeActivityMutation, service]
  );

  // =================== CONTEXT VALUE ===================

  const error = gqlError?.message || null;

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

      // Service instance
      service,

      // Computed values
      progress: service.calculateProgress(activities),
    }),
    [
      activities,
      activeActivity,
      isLoading,
      error,
      visitedActivities,
      newActivities,
      setActiveActivity,
      markActivityAsViewed,
      refetchActivities,
      completeActivity,
      service,
    ]
  );

  return (
    <ActivityContext.Provider value={contextValue}>
      {children}
    </ActivityContext.Provider>
  );
}

export function useActivity() {
  const context = useContext(ActivityContext);
  if (!context) {
    throw new Error("useActivity must be used within an ActivityProvider");
  }
  return context;
}

// Export service class for testing or external use
export { ActivityService };
