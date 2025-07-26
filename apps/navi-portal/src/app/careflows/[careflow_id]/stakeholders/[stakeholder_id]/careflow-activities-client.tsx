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
} from "@awell-health/navi-core";
import {
  ActivityFragment,
  FormActivityInput,
  MessageActivityInput,
} from "@/lib/awell-client/generated/graphql";
import { useActivity } from "@/lib/activity-provider";
import { ActivityHeader } from "@/components/activity-header";
import { ActivityDrawer } from "@/components/activity-drawer";
import { cn } from "@/lib/utils";
import { useBranding } from "@/lib/branding-provider";
import {
  IframeCommunicator,
  useCommunications,
} from "@/domains/communications";

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

  return false;
}

export default function CareflowActivitiesClient({
  careflowId,
  stakeholderId,
}: CareflowActivitiesClientProps) {
  // Get instanceId from URL params for event forwarding
  const searchParams = useSearchParams();
  const instanceId = searchParams.get("instance_id");

  // Debug logging to see what's happening with instanceId
  console.log("🔍 CareflowActivitiesClient Debug:", {
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
    isLoading,
    error,
    setActiveActivity,
    markActivityAsViewed,
    completeActivity,
  } = useActivity();
  const { getStackSpacing } = useBranding();
  const { createActivityEventHandlers } = useCommunications();

  // State for activity drawer
  const [isActivityDrawerOpen, setIsActivityDrawerOpen] = useState(false);

  // Mark the active activity as viewed when it changes
  useEffect(() => {
    if (activeActivity) {
      markActivityAsViewed(activeActivity.id);
    }
  }, [activeActivity, markActivityAsViewed]);

  const handleFormSubmit = async (
    activityId: string,
    data: Record<string, unknown>
  ) => {
    console.log("📝 Form submitted with data:", data);
    console.log("📋 Activity ID:", activityId);

    try {
      await completeActivity(activityId, { formData: data }, "FORM");
      console.log("✅ Form completion successful");
    } catch (error) {
      console.error("❌ Form completion failed:", error);
    }
  };

  const handleMessageMarkAsRead = async (activityId: string) => {
    console.log("📧 Message marked as read:", activityId);

    try {
      await completeActivity(activityId, { action: "read" }, "MESSAGE");
      console.log("✅ Message completion successful");
    } catch (error) {
      console.error("❌ Message completion failed:", error);
    }
  };

  const handleChecklistComplete = async (
    activityId: string,
    data: Record<string, unknown>
  ) => {
    console.log("☑️ Checklist completed:", activityId, data);

    try {
      await completeActivity(activityId, data, "CHECKLIST");
      console.log("✅ Checklist completion successful");
    } catch (error) {
      console.error("❌ Checklist completion failed:", error);
    }
  };

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
          const formActivity = assertFormActivity(
            activeActivity as ActivityData
          );
          return (
            <Activities.Form
              activity={formActivity}
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
            eventHandlers={createActivityEventHandlers(
              activeActivity.id,
              activeActivity.object.type
            )}
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
      <main
        className={cn("flex-1 flex flex-col", {
          "gap-2": getStackSpacing() === "xs",
          "gap-4": getStackSpacing() === "sm",
          "gap-6": getStackSpacing() === "md" || !getStackSpacing(),
          "gap-8":
            getStackSpacing() === "lg" ||
            getStackSpacing() === "xl" ||
            getStackSpacing() === "2xl",
        })}
      >
        {/* Header */}
        <ActivityHeader onActivityListClick={handleActivityListClick} />

        {/* Activity Content */}
        <div className="flex-1 overflow-y-auto">{renderActiveActivity()}</div>
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
