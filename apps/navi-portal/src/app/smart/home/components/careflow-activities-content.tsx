"use client";

import React, { useEffect, useState } from "react";
import { Activities } from "@/components/activities/index";
import {
  assertFormActivity,
  assertMessageActivity,
  assertChecklistActivity,
  assertExtensionActivity,
} from "@awell-health/navi-core";
import {
  ActivityFragment,
  FormActivityInput,
  MessageActivityInput,
} from "@/lib/awell-client/generated/graphql";
import { useActivity } from "@/lib/activity-provider";
// import { ActivityDrawer } from "@/components/activity-drawer";
// import { ActivityHeader } from "@/components/activity-header";
import { CompletionStateRenderer } from "@/components/completion-state-renderer";
import { useCompletionFlow } from "@/hooks/use-completion-flow";
import { useActivityHandlers } from "@/hooks/use-activity-handlers";

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

export function CareflowActivitiesContent({
  activityId,
  onCompleted,
}: {
  activityId: string | null;
  onCompleted?: () => void;
}) {
  const {
    activeActivity,
    activities,
    isLoading,
    error,
    setActiveActivity,
    markActivityAsViewed,
    completeActivity,
    service,
  } = useActivity();

  useEffect(() => {
    if (activityId) {
      setActiveActivity(activityId);
    }
  }, [activityId, setActiveActivity]);

  // Activity handlers
  const { handleFormSubmit, handleMessageMarkAsRead, handleChecklistComplete } =
    useActivityHandlers({ completeActivity });

  // Completion flow management
  const { completionState, waitingCountdown } = useCompletionFlow(
    activities,
    service,
    isLoading,
    {
      waitingDuration: 5,
      onSessionCompleted: () => {
        console.log("Session completed");
      },
      onIframeClose: () => {
        console.log("Iframe close requested");
      },
      isSingleActivityMode: !!activityId, // Enable single activity mode when activityId is provided
      allowCompletedActivitiesInSingleMode: !!activityId, // Allow completed activities in single mode
    }
  );

  // Mark the active activity as viewed when it changes
  useEffect(() => {
    if (activeActivity) {
      markActivityAsViewed(activeActivity.id);
    }
  }, [activeActivity, markActivityAsViewed]);

  // When an activity is completed: notify parent (TaskView) to go back
  useEffect(() => {
    const unsubscribe = service.on("activity.completed", async (data) => {
      console.log("🎉 Activity completed", data);
      onCompleted?.();
    });
    return () => {
      unsubscribe();
    };
  }, [service, onCompleted]);

  // Render the appropriate activity component based on the active activity type
  const renderActiveActivity = () => {
    if (!activeActivity) {
      return (
        <div className="flex items-center justify-center h-64">
          <div className="text-center">
            <p className="text-muted-foreground mb-2">No activity selected</p>
            <p className="text-sm text-muted-foreground">
              Select an activity from the list to get started
            </p>
          </div>
        </div>
      );
    }

    // Render based on activity type
    switch (activeActivity.object.type) {
      case "FORM": {
        const formActivity = assertFormActivity(activeActivity);
        return (
          <Activities.Form
            activity={formActivity}
            onSubmit={handleFormSubmit}
          />
        );
      }

      case "MESSAGE": {
        const messageActivity = assertMessageActivity(activeActivity);
        return (
          <Activities.Message
            activity={messageActivity}
            onMarkAsRead={handleMessageMarkAsRead}
          />
        );
      }

      case "CHECKLIST": {
        const checklistActivity = assertChecklistActivity(activeActivity);
        return (
          <Activities.Checklist
            activity={checklistActivity}
            onComplete={handleChecklistComplete}
          />
        );
      }
      case "PLUGIN_ACTION": {
        const extensionActivity = assertExtensionActivity(activeActivity);
        if (extensionActivity) {
          return (
            <Activities.Extension
              activity={extensionActivity}
              onSubmit={(data) =>
                completeActivity(activeActivity.id, data, "EXTENSION")
              }
            />
          );
        }
        break;
      }
      default:
        return (
          <div className="flex items-center justify-center h-64">
            <div className="text-center">
              <p className="text-muted-foreground mb-2">
                Unsupported activity type
              </p>
              <p className="text-sm text-muted-foreground">
                Activity type {activeActivity.object.type} is not supported
              </p>
            </div>
          </div>
        );
    }
  };

  // Show completion state if session is completed
  if (completionState === "completed") {
    return (
      <CompletionStateRenderer
        waitingCountdown={waitingCountdown || 0}
        completionState={completionState}
      />
    );
  }

  // Show loading state
  if (isLoading) {
    return (
      <div className="min-h-0 bg-background flex items-center justify-center">
        <div className="text-center">
          <p className="text-muted-foreground">Loading activities...</p>
        </div>
      </div>
    );
  }

  // Show error state
  if (error) {
    return (
      <div className="min-h-0 bg-background flex items-center justify-center">
        <div className="text-center">
          <p className="text-destructive mb-4">Failed to load activities</p>
          <p className="text-sm text-muted-foreground">{error}</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-0 bg-background flex">
      <div className="flex-1 overflow-y-auto w-full">
        {renderActiveActivity()}
      </div>
    </div>
  );
}
