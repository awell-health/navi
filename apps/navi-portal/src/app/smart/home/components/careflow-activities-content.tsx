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
import { useActivityContext } from "@/lib/activity-context-provider";
import { ActivityFlowRenderer } from "@/components/activity-flow-renderer";
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
    coordinator,
  } = useActivityContext();

  useEffect(() => {
    if (activityId) {
      setActiveActivity(activityId);
    }
  }, [activityId, setActiveActivity]);

  // Activity handlers
  const { handleFormSubmit, handleMessageMarkAsRead, handleChecklistComplete, handleExtensionSubmit } =
    useActivityHandlers({ completeActivity });

  const flow = (
    <ActivityFlowRenderer
      careflowId={activities[0]?.careflow_id ?? ""}
      waitingDuration={20}
      renderActivities={() => renderActiveActivity()}
    />
  );

  // Mark the active activity as viewed when it changes
  useEffect(() => {
    if (activeActivity) {
      markActivityAsViewed(activeActivity.id);
    }
  }, [activeActivity, markActivityAsViewed]);

  // When an activity is completed: notify parent (TaskView) to go back
  useEffect(() => {
    const unsubscribe = coordinator.on("activity.completed", async (data) => {
      console.log("🎉 Activity completed", data);
      onCompleted?.();
    });
    return () => {
      unsubscribe();
    };
  }, [coordinator, onCompleted]);

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
                handleExtensionSubmit(activeActivity.id, data)
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
      <div className="flex-1 overflow-y-auto w-full">{flow}</div>
    </div>
  );
}
