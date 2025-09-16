"use client";

import React, { useEffect, useState } from "react";
import { useSearchParams } from "next/navigation";
import { Activities } from "@/components/activities/index";
import { ActivityProvider } from "@/lib/activity-provider";
import {
  ActivityData,
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
import { ActivityDrawer } from "@/components/activity-drawer";
import {
  IframeCommunicator,
  useCommunications,
} from "@/domains/communications";
import { ActivityHeader } from "@/components/activity-header";
import { CompletionStateRenderer } from "@/components/completion-state-renderer";
import { useCompletionFlow } from "@/hooks/use-completion-flow";
import { useActivityHandlers } from "@/hooks/use-activity-handlers";

interface CareflowActivitiesClientProps {
  careflowId: string;
  stakeholderId: string;
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

  // Can display extension activities (PLUGIN or PLUGIN_ACTION)
  if (
    activity.object.type === "PLUGIN" ||
    activity.object.type === "PLUGIN_ACTION"
  ) {
    return true;
  }

  return false;
}

export default function CareflowActivitiesClient({
  careflowId,
  stakeholderId,
}: CareflowActivitiesClientProps) {
  // Get instanceId from URL params for event forwarding
  const searchParams = useSearchParams();
  const instanceId = searchParams.get("instance_id");

  // If the session was switched upstream to honor an existing valid JWT, surface a notification
  useEffect(() => {
    if (searchParams.get("session_switched") === "1") {
      // eslint-disable-next-line no-console
      console.warn(
        "[Navi] Using existing session from JWT; switched sessions to keep you signed in."
      );
    }
  }, [searchParams]);

  console.debug("🔍 CareflowActivitiesClient Debug:", {
    careflowId,
    stakeholderId,
    instanceId,
    searchParams: Object.fromEntries(searchParams.entries()),
    url: typeof window !== "undefined" ? window.location.href : "SSR",
  });

  return (
    <ActivityProvider careflowId={careflowId} stakeholderId={stakeholderId}>
      <IframeCommunicator instanceId={instanceId}>
        <CareflowActivitiesContent />
      </IframeCommunicator>
    </ActivityProvider>
  );
}

// Inner component that uses the useActivity hook
function CareflowActivitiesContent() {
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
  const { createActivityEventHandlers, sendSessionCompleted, sendIframeClose } =
    useCommunications();

  // State for activity drawer
  const [isActivityDrawerOpen, setIsActivityDrawerOpen] = useState(false);

  // Activity handlers
  const { handleFormSubmit, handleMessageMarkAsRead, handleChecklistComplete } =
    useActivityHandlers({ completeActivity });

  // Completion flow management
  // Derive careflowId from list when invoking useCompletionFlow
  const { completionState, waitingCountdown } = useCompletionFlow(activities, {
    waitingDuration: 5,
    onSessionCompleted: sendSessionCompleted,
    onIframeClose: sendIframeClose,
  });

  // Mark the active activity as viewed when it changes
  useEffect(() => {
    if (activeActivity) {
      markActivityAsViewed(activeActivity.id);
    }
  }, [activeActivity, markActivityAsViewed]);

  // Handle activity list icon click
  const handleActivityListClick = () => {
    console.log("📋 Activity list clicked");
    setIsActivityDrawerOpen(true);
  };

  // Event handlers are now provided by the communications context

  const handleActivityClick = (activity: ActivityFragment) => {
    console.log("🔍 Activity clicked:", activity);
    if (canDisplayActivity(activity)) {
      setActiveActivity(activity.id);
    } else {
      console.warn("⚠️ Cannot display activity type:", activity.object.type);
    }
  };

  // Render the appropriate activity component based on the active activity type
  const renderActiveActivity = () => {
    // Handle completion flow states first
    const completionUI = (
      <CompletionStateRenderer
        completionState={completionState}
        waitingCountdown={waitingCountdown}
      />
    );
    if (completionState !== "active") {
      return completionUI;
    }

    if (!activeActivity) {
      return (
        <div className="min-h-[500px] h-full flex items-center justify-center p-8">
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

    // Check if activity is completed
    const isCompleted = activeActivity.status === "DONE";

    switch (activeActivity.object.type) {
      case "FORM": {
        const form = getFormFromActivity(activeActivity);
        if (form) {
          const formActivity = assertFormActivity(
            activeActivity as ActivityData
          );
          return (
            <Activities.Form
              activity={formActivity}
              disabled={isCompleted}
              eventHandlers={createActivityEventHandlers(
                activeActivity.id,
                activeActivity.object.type
              )}
              onSubmit={handleFormSubmit}
            />
          );
        }
        break;
      }
      case "MESSAGE": {
        const message = getMessageFromActivity(activeActivity);
        if (message) {
          const messageActivity = assertMessageActivity(
            activeActivity as ActivityData
          );

          return (
            <Activities.Message
              activity={messageActivity}
              eventHandlers={createActivityEventHandlers(
                activeActivity.id,
                activeActivity.object.type
              )}
              onMarkAsRead={handleMessageMarkAsRead}
            />
          );
        }
        break;
      }
      case "CHECKLIST": {
        const checklistActivity = assertChecklistActivity(
          activeActivity as ActivityData
        );
        return (
          <Activities.Checklist
            activity={checklistActivity}
            disabled={isCompleted}
            eventHandlers={createActivityEventHandlers(
              activeActivity.id,
              activeActivity.object.type
            )}
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
              disabled={isCompleted}
              onSubmit={(data) =>
                completeActivity(activeActivity.id, data, "EXTENSION")
              }
            />
          );
        }
        break;
      }
      // duplicate case removed
      default:
        return (
          <div className="h-full flex items-center justify-center p-8">
            <div className="text-center">
              <h2 className="text-xl font-semibold text-foreground mb-2">
                Unsupported Activity Type
              </h2>
              <p className="text-muted-foreground mb-4">
                Activity type {activeActivity.object.type} is not yet supported.
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
            This activity doesn&apos;t have the required data to be displayed.
          </p>
        </div>
      </div>
    );
  };

  // Show loading state
  if (isLoading) {
    return (
      <div className="min-h-0 bg-background flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary mx-auto mb-4"></div>
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
      <main className="flex-1 flex flex-col gap-6">
        {/* Header */}
        <ActivityHeader onActivityListClick={handleActivityListClick} />

        {/* Activity Content */}
        <div className="flex-1 overflow-y-auto w-full">
          {renderActiveActivity()}
        </div>
      </main>

      {/* Activity Drawer */}
      <ActivityDrawer
        open={isActivityDrawerOpen}
        onOpenChange={setIsActivityDrawerOpen}
        onActivityClick={handleActivityClick}
      />
    </div>
  );
}
