"use client";

import React, { useState, useEffect } from "react";
import { FormActivityComponent } from "@/components/activities/form-activity";
import {
  ActivityFragment,
  FormActivityInput,
  useOnActivityCompletedSubscription,
  useOnActivityCreatedSubscription,
  useOnActivityUpdatedSubscription,
  useOnActivityExpiredSubscription,
  usePathwayActivitiesQuery,
} from "@/lib/awell-client/generated/graphql";

interface ActivityEvent {
  id: string;
  type: "created" | "updated" | "completed" | "expired";
  activity: ActivityFragment;
  timestamp: Date;
}

interface CareflowActivitiesClientProps {
  initialActivities?: ActivityFragment[];
  careflowId: string;
}

// Helper function to check if activity has form input
function getFormFromActivity(
  activity: ActivityFragment
): FormActivityInput["form"] | null {
  if (activity.inputs?.__typename === "FormActivityInput") {
    return activity.inputs.form || null;
  }
  return null;
}

// Helper function to get form title
function getActivityTitle(activity: ActivityFragment): string {
  const form = getFormFromActivity(activity);
  if (form) {
    return form.title;
  }
  return `${activity.object.type} Activity`;
}

export default function CareflowActivitiesClient({
  initialActivities,
  careflowId,
}: CareflowActivitiesClientProps) {
  const [activities, setActivities] = useState<ActivityFragment[]>(
    initialActivities || []
  );
  const [events, setEvents] = useState<ActivityEvent[]>([]);

  // Fetch activities if not provided initially
  const {
    data: activitiesData,
    loading: activitiesLoading,
    error: activitiesError,
  } = usePathwayActivitiesQuery({
    variables: {
      pathway_id: careflowId,
    },
    skip: !!initialActivities, // Skip query if we have initial activities
  });

  // Update activities when query data is received
  useEffect(() => {
    console.log(
      "🔍 Activities data:",
      activitiesData,
      `activitiesLoading: ${activitiesLoading}`
    );
    if (activitiesData?.pathwayActivities?.activities) {
      console.log(
        "📋 Activities loaded from GraphQL:",
        activitiesData.pathwayActivities.activities.length
      );
      setActivities(activitiesData.pathwayActivities.activities);
    }
  }, [activitiesData, activitiesLoading]);

  // Subscribe to activity events for this careflow
  const { data: completedData } = useOnActivityCompletedSubscription({
    variables: { careflow_id: careflowId },
  });

  const { data: createdData } = useOnActivityCreatedSubscription({
    variables: { careflow_id: careflowId },
  });

  const { data: updatedData } = useOnActivityUpdatedSubscription({
    variables: { careflow_id: careflowId },
  });

  const { data: expiredData } = useOnActivityExpiredSubscription({
    variables: { careflow_id: careflowId },
  });

  // Handle subscription events
  useEffect(() => {
    if (completedData?.activityCompleted) {
      const activity = completedData.activityCompleted;
      console.log("🎉 Activity completed:", activity.id);

      // Update activities list
      setActivities((prev) =>
        prev.map((a) => (a.id === activity.id ? activity : a))
      );

      // Add to events
      setEvents((prev) =>
        [
          {
            id: activity.id,
            type: "completed" as const,
            activity,
            timestamp: new Date(),
          },
          ...prev,
        ].slice(0, 10)
      ); // Keep only last 10 events
    }
  }, [completedData]);

  useEffect(() => {
    if (createdData?.activityCreated) {
      const activity = createdData.activityCreated;
      console.log("🆕 Activity created:", activity.id);

      // Add to activities list if not already present
      setActivities((prev) => {
        const exists = prev.some((a) => a.id === activity.id);
        return exists ? prev : [activity, ...prev];
      });

      // Add to events
      setEvents((prev) =>
        [
          {
            id: activity.id,
            type: "created" as const,
            activity,
            timestamp: new Date(),
          },
          ...prev,
        ].slice(0, 10)
      );
    }
  }, [createdData]);

  useEffect(() => {
    if (updatedData?.activityUpdated) {
      const activity = updatedData.activityUpdated;
      console.log("📝 Activity updated:", activity.id);

      // Update activities list
      setActivities((prev) =>
        prev.map((a) => (a.id === activity.id ? activity : a))
      );

      // Add to events
      setEvents((prev) =>
        [
          {
            id: activity.id,
            type: "updated" as const,
            activity,
            timestamp: new Date(),
          },
          ...prev,
        ].slice(0, 10)
      );
    }
  }, [updatedData]);

  useEffect(() => {
    if (expiredData?.activityExpired) {
      const activity = expiredData.activityExpired;
      console.log("⏰ Activity expired:", activity.id);

      // Update activities list
      setActivities((prev) =>
        prev.map((a) => (a.id === activity.id ? activity : a))
      );

      // Add to events
      setEvents((prev) =>
        [
          {
            id: activity.id,
            type: "expired" as const,
            activity,
            timestamp: new Date(),
          },
          ...prev,
        ].slice(0, 10)
      );
    }
  }, [expiredData]);

  // Find the first active form activity to display by default
  const activeFormActivity = activities.find(
    (activity) =>
      activity.object.type === "FORM" &&
      activity.status === "ACTIVE" &&
      getFormFromActivity(activity)
  );

  console.log(
    "🎯 Active form activity:",
    activeFormActivity
      ? {
          id: activeFormActivity.id,
          form_title: getActivityTitle(activeFormActivity),
          question_count:
            getFormFromActivity(activeFormActivity)?.questions?.length,
        }
      : "None found"
  );

  const handleFormSubmit = async (data: Record<string, unknown>) => {
    console.log("📝 Form submitted with data:", data);
    console.log("📋 Activity ID:", activeFormActivity?.id);

    // For prototype, just log the submission
    console.log("✅ Form submission logged (prototype mode)");
  };

  const getEventIcon = (type: ActivityEvent["type"]) => {
    switch (type) {
      case "created":
        return "🆕";
      case "updated":
        return "📝";
      case "completed":
        return "🎉";
      case "expired":
        return "⏰";
      default:
        return "📋";
    }
  };

  const getEventColor = (type: ActivityEvent["type"]) => {
    switch (type) {
      case "created":
        return "text-blue-600 bg-blue-50";
      case "updated":
        return "text-yellow-600 bg-yellow-50";
      case "completed":
        return "text-green-600 bg-green-50";
      case "expired":
        return "text-red-600 bg-red-50";
      default:
        return "text-gray-600 bg-gray-50";
    }
  };

  // Show loading state
  if (activitiesLoading) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary mx-auto mb-4"></div>
          <p className="text-muted-foreground">Loading activities...</p>
        </div>
      </div>
    );
  }

  // Show error state
  if (activitiesError) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <div className="text-center">
          <p className="text-destructive mb-4">Failed to load activities</p>
          <p className="text-sm text-muted-foreground">
            {activitiesError.message}
          </p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background flex">
      {/* Activities Drawer */}
      <aside className="w-80 bg-card border-r border-border p-6 overflow-y-auto">
        <div className="mb-6">
          <h2 className="text-lg font-semibold text-foreground mb-2">
            Activities
          </h2>
          <p className="text-sm text-muted-foreground">
            Your assigned tasks and forms
          </p>
        </div>

        <div className="space-y-3">
          {activities.length === 0 ? (
            <div className="text-center py-8">
              <p className="text-sm text-muted-foreground mb-2">
                No activities found
              </p>
              <p className="text-xs text-muted-foreground">
                This careflow may not have started yet or all activities are
                complete.
              </p>
            </div>
          ) : (
            activities.map((activity) => (
              <div
                key={activity.id}
                className={`p-4 rounded-lg border cursor-pointer transition-colors ${
                  activity.status === "ACTIVE"
                    ? "border-primary bg-primary/5 hover:bg-primary/10"
                    : "border-border bg-muted/50 hover:bg-muted"
                }`}
              >
                <div className="flex items-start justify-between mb-2">
                  <h3 className="font-medium text-sm text-foreground">
                    {getActivityTitle(activity)}
                  </h3>
                  <span
                    className={`text-xs px-2 py-1 rounded-full ${
                      activity.status === "ACTIVE"
                        ? "bg-green-100 text-green-800"
                        : "bg-gray-100 text-gray-600"
                    }`}
                  >
                    {activity.status}
                  </span>
                </div>

                <p className="text-xs text-muted-foreground mb-2">
                  Type: {activity.object.type}
                </p>

                <p className="text-xs text-muted-foreground">
                  {new Date(activity.date).toLocaleDateString()}
                </p>

                {activity.status === "ACTIVE" && (
                  <div className="mt-3 pt-3 border-t border-border">
                    <span className="text-xs font-medium text-primary">
                      Click to complete →
                    </span>
                  </div>
                )}
              </div>
            ))
          )}
        </div>
      </aside>

      {/* Main Content Area */}
      <main className="flex-1 flex">
        {/* Form Content */}
        <div className="flex-1 overflow-y-auto">
          {activeFormActivity && getFormFromActivity(activeFormActivity) ? (
            <FormActivityComponent
              formActivity={
                {
                  ...activeFormActivity,
                  form: getFormFromActivity(activeFormActivity)!,
                } as any // eslint-disable-line @typescript-eslint/no-explicit-any
              }
              onSubmit={handleFormSubmit}
            />
          ) : (
            <div className="h-full flex items-center justify-center p-8">
              <div className="text-center">
                <h2 className="text-xl font-semibold text-foreground mb-2">
                  No Active Activities
                </h2>
                <p className="text-muted-foreground">
                  There are no active activities that require your attention at
                  this time.
                </p>
              </div>
            </div>
          )}
        </div>

        {/* Live Events Panel */}
        <aside className="w-80 bg-muted/30 border-l border-border p-4 overflow-y-auto">
          <div className="mb-4">
            <h3 className="text-lg font-semibold text-foreground mb-2">
              Live Events
            </h3>
            <p className="text-sm text-muted-foreground">
              Real-time activity updates
            </p>
          </div>

          {events.length === 0 ? (
            <div className="text-center py-8">
              <p className="text-sm text-muted-foreground">No events yet...</p>
              <p className="text-xs text-muted-foreground mt-1">
                Events will appear here in real-time
              </p>
            </div>
          ) : (
            <div className="space-y-3">
              {events.map((event, index) => (
                <div
                  key={`${event.id}-${event.timestamp.getTime()}-${index}`}
                  className={`p-3 rounded-lg border ${getEventColor(
                    event.type
                  )}`}
                >
                  <div className="flex items-start gap-2">
                    <span className="text-lg">{getEventIcon(event.type)}</span>
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center gap-2 mb-1">
                        <span className="text-xs font-medium uppercase tracking-wide">
                          {event.type}
                        </span>
                        <span className="text-xs text-muted-foreground">
                          {event.timestamp.toLocaleTimeString()}
                        </span>
                      </div>
                      <p className="text-sm font-medium truncate">
                        {getActivityTitle(event.activity)}
                      </p>
                      <p className="text-xs text-muted-foreground">
                        {event.activity.object.type} • {event.activity.status}
                      </p>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}

          {events.length > 0 && (
            <div className="mt-4 pt-4 border-t border-border">
              <p className="text-xs text-muted-foreground text-center">
                Showing last {events.length} events
              </p>
            </div>
          )}
        </aside>
      </main>
    </div>
  );
}
