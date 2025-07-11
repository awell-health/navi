"use client";

import React, { useState, useEffect } from "react";
import { FormActivityComponent } from "@/components/activities/form-activity";
import { MessageActivityComponent } from "@/components/activities/message-activity";
import { ChecklistActivityComponent } from "@/components/activities/checklist-activity";
import {
  ActivityFragment,
  FormActivityInput,
  MessageActivityInput,
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

// Helper function to check if activity has message input
function getMessageFromActivity(
  activity: ActivityFragment
): MessageActivityInput["message"] | null {
  if (activity.inputs?.__typename === "MessageActivityInput") {
    return activity.inputs.message || null;
  }
  return null;
}

// Helper function to get activity title
function getActivityTitle(activity: ActivityFragment): string {
  const form = getFormFromActivity(activity);
  if (form) {
    return form.title;
  }

  const message = getMessageFromActivity(activity);
  if (message) {
    return message.subject;
  }

  return activity.object.name || `${activity.object.type} Activity`;
}

// Helper function to check if activity can be displayed
function canDisplayActivity(activity: ActivityFragment): boolean {
  // Can display if it's a form with form data
  if (activity.object.type === "FORM" && getFormFromActivity(activity)) {
    return true;
  }

  // Can display if it's a message with message data
  if (activity.object.type === "MESSAGE" && getMessageFromActivity(activity)) {
    return true;
  }

  // Can display checklist activities (even without specific input data)
  if (activity.object.type === "CHECKLIST") {
    return true;
  }

  return false;
}

export default function CareflowActivitiesClient({
  initialActivities,
  careflowId,
}: CareflowActivitiesClientProps) {
  const [activities, setActivities] = useState<ActivityFragment[]>(
    initialActivities || []
  );
  const [events, setEvents] = useState<ActivityEvent[]>([]);
  const [activeActivity, setActiveActivity] = useState<ActivityFragment | null>(
    null
  );

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

  // Set default active activity when activities change
  useEffect(() => {
    if (activities.length > 0 && !activeActivity) {
      // Find the first active activity that can be displayed
      const defaultActivity = activities.find(
        (activity) =>
          activity.status === "ACTIVE" && canDisplayActivity(activity)
      );

      if (defaultActivity) {
        console.log("🎯 Setting default active activity:", defaultActivity.id);
        setActiveActivity(defaultActivity);
      } else {
        // If no active displayable activities, just pick the first one that can be displayed
        const firstDisplayableActivity = activities.find(canDisplayActivity);
        if (firstDisplayableActivity) {
          console.log(
            "🎯 Setting first displayable activity:",
            firstDisplayableActivity.id
          );
          setActiveActivity(firstDisplayableActivity);
        }
      }
    }
  }, [activities, activeActivity]);

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

  const handleFormSubmit = async (data: Record<string, unknown>) => {
    console.log("📝 Form submitted with data:", data);
    console.log("📋 Activity ID:", activeActivity?.id);

    // For prototype, just log the submission
    console.log("✅ Form submission logged (prototype mode)");
  };

  const handleMessageMarkAsRead = async (activityId: string) => {
    console.log("📧 Message marked as read:", activityId);

    // For prototype, just log the action
    console.log("✅ Message marked as read (prototype mode)");
  };

  const handleChecklistComplete = async (
    activityId: string,
    data: Record<string, unknown>
  ) => {
    console.log("☑️ Checklist completed:", activityId, data);

    // For prototype, just log the action
    console.log("✅ Checklist completion logged (prototype mode)");
  };

  const handleActivityClick = (activity: ActivityFragment) => {
    console.log("🔍 Activity clicked:", activity);
    if (canDisplayActivity(activity)) {
      setActiveActivity(activity);
    } else {
      console.warn("⚠️ Cannot display activity type:", activity.object.type);
    }
  };

  // Render the appropriate activity component based on the active activity type
  const renderActiveActivity = () => {
    if (!activeActivity) {
      return (
        <div className="h-full flex items-center justify-center p-8">
          <div className="text-center">
            <h2 className="text-xl font-semibold text-foreground mb-2">
              No Activity Selected
            </h2>
            <p className="text-muted-foreground">
              Select an activity from the list to view its details.
            </p>
          </div>
        </div>
      );
    }

    switch (activeActivity.object.type) {
      case "FORM": {
        const form = getFormFromActivity(activeActivity);
        if (form) {
          return (
            <FormActivityComponent
              formActivity={
                {
                  ...activeActivity,
                  form,
                } as any
              } // eslint-disable-line @typescript-eslint/no-explicit-any
              onSubmit={handleFormSubmit}
            />
          );
        }
        break;
      }
      case "MESSAGE": {
        const message = getMessageFromActivity(activeActivity);
        if (message) {
          return (
            <MessageActivityComponent
              messageActivity={
                {
                  ...activeActivity,
                  message,
                } as any
              } // eslint-disable-line @typescript-eslint/no-explicit-any
              onMarkAsRead={handleMessageMarkAsRead}
            />
          );
        }
        break;
      }
      case "CHECKLIST": {
        return (
          <ChecklistActivityComponent
            checklistActivity={activeActivity as any}
            onComplete={handleChecklistComplete}
          />
        );
      }
      default:
        return (
          <div className="h-full flex items-center justify-center p-8">
            <div className="text-center">
              <h2 className="text-xl font-semibold text-foreground mb-2">
                Unsupported Activity Type
              </h2>
              <p className="text-muted-foreground mb-4">
                Activity type "{activeActivity.object.type}" is not yet
                supported.
              </p>
              <div className="text-sm text-muted-foreground bg-muted p-4 rounded-lg">
                <strong>Activity Details:</strong>
                <br />
                ID: {activeActivity.id}
                <br />
                Type: {activeActivity.object.type}
                <br />
                Status: {activeActivity.status}
                <br />
                Name: {activeActivity.object.name}
              </div>
            </div>
          </div>
        );
    }

    return (
      <div className="h-full flex items-center justify-center p-8">
        <div className="text-center">
          <h2 className="text-xl font-semibold text-foreground mb-2">
            Activity Data Missing
          </h2>
          <p className="text-muted-foreground">
            This activity doesn't have the required data to be displayed.
          </p>
        </div>
      </div>
    );
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
      <aside className="w-80 bg-card border-r border-customborder p-6 overflow-y-auto">
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
            activities.map((activity) => {
              const isSelected = activeActivity?.id === activity.id;
              const canDisplay = canDisplayActivity(activity);

              return (
                <div
                  key={activity.id}
                  className={`p-4 rounded-lg border cursor-pointer transition-colors ${
                    isSelected
                      ? "border-primary bg-primary/10"
                      : activity.status === "ACTIVE"
                      ? "border-primary bg-primary/5 hover:bg-primary/10"
                      : "border-customborder bg-muted/50 hover:bg-muted"
                  } ${!canDisplay ? "opacity-60" : ""}`}
                  onClick={() => handleActivityClick(activity)}
                >
                  <div className="flex items-start justify-between mb-2">
                    <h3 className="font-medium text-sm text-foreground">
                      {getActivityTitle(activity)}
                    </h3>
                    <div className="flex items-center gap-2">
                      {isSelected && (
                        <span className="text-xs px-2 py-1 rounded-full bg-primary text-primary-foreground">
                          Selected
                        </span>
                      )}
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
                  </div>

                  <p className="text-xs text-muted-foreground mb-2">
                    Type: {activity.object.type}
                    {!canDisplay && " (Preview not available)"}
                  </p>

                  <p className="text-xs text-muted-foreground">
                    {new Date(activity.date).toLocaleDateString()}
                  </p>

                  {activity.status === "ACTIVE" && canDisplay && (
                    <div className="mt-3 pt-3 border-t border-customborder">
                      <span className="text-xs font-medium text-primary">
                        Click to view →
                      </span>
                    </div>
                  )}
                </div>
              );
            })
          )}
        </div>
      </aside>

      {/* Main Content Area */}
      <main className="flex-1 flex">
        {/* Activity Content */}
        <div className="flex-1 overflow-y-auto">{renderActiveActivity()}</div>

        {/* Live Events Panel */}
        <aside className="w-80 bg-muted/30 border-l border-customborder p-4 overflow-y-auto">
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
            <div className="mt-4 pt-4 border-t border-customborder">
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
