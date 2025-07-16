"use client";

import React, {
  createContext,
  useContext,
  useState,
  useEffect,
  useCallback,
} from "react";
import {
  ActivityFragment,
  usePathwayActivitiesQuery,
  useOnActivityCreatedSubscription,
  useOnActivityUpdatedSubscription,
  useOnActivityCompletedSubscription,
  useOnActivityExpiredSubscription,
} from "@/lib/awell-client/generated/graphql";

interface ActivityContextType {
  // Data
  activities: ActivityFragment[];
  activeActivity: ActivityFragment | null;

  // State
  isLoading: boolean;
  error: string | null;

  // Activity Status Tracking
  visitedActivities: Set<string>;
  newActivities: Set<string>;

  // Actions
  setActiveActivity: (activityId: string) => void;
  markActivityAsViewed: (activityId: string) => void;
  refetchActivities: () => Promise<void>;
}

const ActivityContext = createContext<ActivityContextType | null>(null);

interface ActivityProviderProps {
  children: React.ReactNode;
  careflowId: string;
  stakeholderId?: string;
  onActivityActivate?: (activityId: string, activity: ActivityFragment) => void;
}

export function ActivityProvider({
  children,
  careflowId,
  stakeholderId,
  onActivityActivate,
}: ActivityProviderProps) {
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
      pathway_id: careflowId,
    },
  });

  // Subscriptions for real-time updates
  useOnActivityCreatedSubscription({
    variables: { careflow_id: careflowId },
    onData: ({ data }) => {
      if (data.data?.activityCreated) {
        const newActivity = data.data.activityCreated;
        console.log("🆕 New activity created:", newActivity.id);

        setActivities((prev) => {
          // Avoid duplicates
          if (prev.find((a) => a.id === newActivity.id)) {
            return prev;
          }
          return [newActivity, ...prev];
        });

        // Mark as new
        setNewActivities((prev) => new Set([...prev, newActivity.id]));
      }
    },
  });

  useOnActivityUpdatedSubscription({
    variables: { careflow_id: careflowId },
    onData: ({ data }) => {
      if (data.data?.activityUpdated) {
        const updatedActivity = data.data.activityUpdated;
        console.log("🔄 Activity updated:", updatedActivity.id);

        setActivities((prev) =>
          prev.map((activity) =>
            activity.id === updatedActivity.id ? updatedActivity : activity
          )
        );

        // Update active activity if it's the one that changed
        if (activeActivity?.id === updatedActivity.id) {
          setActiveActivityState(updatedActivity);
        }
      }
    },
  });

  useOnActivityCompletedSubscription({
    variables: { careflow_id: careflowId },
    onData: ({ data }) => {
      if (data.data?.activityCompleted) {
        const completedActivity = data.data.activityCompleted;
        console.log("✅ Activity completed:", completedActivity.id);

        setActivities((prev) =>
          prev.map((activity) =>
            activity.id === completedActivity.id ? completedActivity : activity
          )
        );

        // Update active activity if it's the one that was completed
        if (activeActivity?.id === completedActivity.id) {
          setActiveActivityState(completedActivity);
        }
      }
    },
  });

  useOnActivityExpiredSubscription({
    variables: { careflow_id: careflowId },
    onData: ({ data }) => {
      if (data.data?.activityExpired) {
        const expiredActivity = data.data.activityExpired;
        console.log("⏰ Activity expired:", expiredActivity.id);

        setActivities((prev) =>
          prev.map((activity) =>
            activity.id === expiredActivity.id ? expiredActivity : activity
          )
        );

        // Update active activity if it's the one that expired
        if (activeActivity?.id === expiredActivity.id) {
          setActiveActivityState(expiredActivity);
        }
      }
    },
  });

  // Update activities when query data is received
  useEffect(() => {
    if (activitiesData?.pathwayActivities?.activities) {
      const allActivities = activitiesData.pathwayActivities.activities;
      console.log("📋 Activities loaded from GraphQL:", allActivities.length);

      // Filter to user activities only
      const userActivities = allActivities.filter((a) => a.is_user_activity);

      // If stakeholderId is provided, filter further
      const filteredActivities = stakeholderId
        ? userActivities.filter(
            (activity) =>
              activity.indirect_object?.id === stakeholderId ||
              activity.object?.id === stakeholderId
          )
        : userActivities;

      console.log(
        "👤 User activities for stakeholder:",
        filteredActivities.length
      );
      setActivities(filteredActivities);

      // Auto-select the first active activity if none is selected
      if (!activeActivity) {
        const firstActiveActivity = filteredActivities.find(
          (a) => a.status === "ACTIVE"
        );
        if (firstActiveActivity) {
          setActiveActivityState(firstActiveActivity);
          onActivityActivate?.(firstActiveActivity.id, firstActiveActivity);
          console.log(
            "🎯 Auto-selected first active activity:",
            firstActiveActivity.id
          );
        }
      }
    }
  }, [activitiesData, stakeholderId, activeActivity, onActivityActivate]);

  // Actions
  const setActiveActivity = useCallback(
    (activityId: string) => {
      const activity = activities.find((a) => a.id === activityId);
      if (activity) {
        setActiveActivityState(activity);
        onActivityActivate?.(activity.id, activity);
        console.log("🎯 Active activity set to:", activityId);
      } else {
        console.warn("⚠️ Activity not found:", activityId);
      }
    },
    [activities, onActivityActivate]
  );

  const markActivityAsViewed = useCallback((activityId: string) => {
    setVisitedActivities((prev) => new Set([...prev, activityId]));
    setNewActivities((prev) => {
      const newSet = new Set(prev);
      newSet.delete(activityId);
      return newSet;
    });
    console.log("👁️ Activity marked as viewed:", activityId);
  }, []);

  const refetchActivities = useCallback(async () => {
    console.log("🔄 Refetching activities...");
    await refetch();
  }, [refetch]);

  // Derived state
  const error = gqlError?.message || null;

  const contextValue: ActivityContextType = {
    // Data
    activities,
    activeActivity,

    // State
    isLoading,
    error,

    // Activity Status Tracking
    visitedActivities,
    newActivities,

    // Actions
    setActiveActivity,
    markActivityAsViewed,
    refetchActivities,
  };

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
