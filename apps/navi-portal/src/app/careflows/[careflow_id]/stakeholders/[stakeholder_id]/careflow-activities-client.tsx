"use client";

import React, {
  useEffect,
  useLayoutEffect,
  useState,
  useCallback,
} from "react";
import { useSearchParams } from "next/navigation";
import { Activities } from "@/components/activities/index";
import { ActivityProvider } from "@/lib/activity-provider";
import {
  ActivityType,
  ChecklistActivity,
  FormActivity,
  MessageActivity,
  type ActivityEventHandlers,
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

  // Handle activity activation for event forwarding
  const handleActivityActivate = useCallback(
    (activityId: string, activity: ActivityFragment) => {
      console.log("🎯 Activity activated:", activityId);

      // Forward activate event to parent window via postMessage
      if (instanceId) {
        window.parent.postMessage(
          {
            source: "navi",
            instance_id: instanceId,
            type: "navi.activity.activate",
            activity_id: activityId,
            activity_type: activity.object.type,
            data: {
              activityId,
              activityType: activity.object.type,
              activityName: activity.object.name,
              status: activity.status,
            },
            timestamp: Date.now(),
          },
          "*"
        );
      }
    },
    [instanceId]
  );

  return (
    <ActivityProvider
      careflowId={careflowId}
      stakeholderId={stakeholderId}
      onActivityActivate={handleActivityActivate}
    >
      <CareflowActivitiesContent instanceId={instanceId} />
    </ActivityProvider>
  );
}

// Inner component that uses the useActivity hook
function CareflowActivitiesContent({
  instanceId,
}: {
  instanceId: string | null;
}) {
  const {
    activeActivity,
    isLoading,
    error,
    setActiveActivity,
    markActivityAsViewed,
  } = useActivity();
  const { getStackSpacing } = useBranding();

  // State for activity drawer
  const [isActivityDrawerOpen, setIsActivityDrawerOpen] = useState(false);

  // Mark the active activity as viewed when it changes
  useEffect(() => {
    if (activeActivity) {
      markActivityAsViewed(activeActivity.id);
    }
  }, [activeActivity, markActivityAsViewed]);

  // Height calculation utilities
  const calculateHeight = useCallback(() => {
    // Force DOM reflow to ensure accurate measurements after content changes
    document.body.style.height = "auto";
    document.documentElement.style.height = "auto";

    // Force reflow
    document.body.offsetHeight;

    const body = document.body;
    const html = document.documentElement;

    // Use offsetHeight instead of scrollHeight to handle shrinking content better
    const bodyHeight = body.offsetHeight;
    const htmlHeight = html.offsetHeight;

    // Take the larger of the two, but don't include clientHeight which can be stale
    const finalHeight = Math.max(bodyHeight, htmlHeight);

    console.debug("📏 Height calculation details:", {
      bodyScrollHeight: body.scrollHeight,
      bodyOffsetHeight: body.offsetHeight,
      htmlScrollHeight: html.scrollHeight,
      htmlOffsetHeight: html.offsetHeight,
      htmlClientHeight: html.clientHeight,
      bodyHeight,
      htmlHeight,
      finalHeight: finalHeight + 20,
    });

    return finalHeight + 20; // Add padding to prevent scrollbars
  }, []);

  const emitHeightChange = useCallback(
    (source: string, activityId?: string) => {
      if (!instanceId) return;

      const currentHeight = calculateHeight();

      console.log(`📏 ${source} height:`, currentHeight);

      window.parent.postMessage(
        {
          source: "navi",
          instance_id: instanceId,
          type: "navi.height.changed",
          height: currentHeight,
          activity_id: activityId || activeActivity?.id,
          timestamp: Date.now(),
        },
        "*"
      );
    },
    [instanceId, calculateHeight, activeActivity?.id]
  );

  // 1. Measure height after activity renders (useLayoutEffect = after DOM updates, before paint)
  useLayoutEffect(() => {
    if (instanceId && activeActivity?.id) {
      emitHeightChange("Activity change", activeActivity.id);
    }
  }, [instanceId, activeActivity?.id, emitHeightChange]);

  // 2. Set up ResizeObserver for ongoing content changes (debounced)
  useEffect(() => {
    if (!instanceId || typeof window === "undefined") return;

    let resizeTimeout: NodeJS.Timeout;
    let lastHeight = 0;

    const resizeObserver = new ResizeObserver(() => {
      clearTimeout(resizeTimeout);
      resizeTimeout = setTimeout(() => {
        const currentHeight = calculateHeight();

        // Only emit if height changed significantly (>5px)
        if (Math.abs(currentHeight - lastHeight) > 5) {
          console.log(
            "📏 ResizeObserver height change:",
            lastHeight,
            "→",
            currentHeight
          );
          lastHeight = currentHeight;
          emitHeightChange("ResizeObserver");
        }
      }, 50);
    });

    resizeObserver.observe(document.body);

    return () => {
      clearTimeout(resizeTimeout);
      resizeObserver.disconnect();
    };
  }, [instanceId, calculateHeight, emitHeightChange]);

  const handleFormSubmit = async (
    activityId: string,
    data: Record<string, unknown>
  ) => {
    console.log("📝 Form submitted with data:", data);
    console.log("📋 Activity ID:", activityId);

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

  // Handle activity list icon click
  const handleActivityListClick = () => {
    console.log("📋 Activity list clicked");
    setIsActivityDrawerOpen(true);
  };

  // Create unified event handlers for activity events with postMessage forwarding
  const createActivityEventHandlers = (
    activityId: string
  ): ActivityEventHandlers => ({
    onActivityReady: (event) => {
      console.log("🎯 Activity ready:", activityId, event);
      console.log(
        "🔍 Debug - instanceId:",
        instanceId,
        "typeof:",
        typeof instanceId
      );

      // Forward to parent window via postMessage
      if (instanceId) {
        const message = {
          source: "navi",
          instance_id: instanceId,
          type: "navi.activity.ready",
          activity_id: activityId,
          activity_type: event.activityType,
          data: event.data,
          timestamp: event.timestamp,
        };
        console.log("📤 Sending postMessage:", message);
        window.parent.postMessage(message, "*");
      } else {
        console.warn(
          "⚠️ Not sending postMessage - instanceId is null/undefined"
        );
      }
    },
    onActivityActivate: (event) => {
      console.log("🎯 Activity activated:", activityId, event);

      // Forward to parent window via postMessage
      if (instanceId) {
        window.parent.postMessage(
          {
            source: "navi",
            instance_id: instanceId,
            type: "navi.activity.activate",
            activity_id: activityId,
            activity_type: event.activityType,
            data: event.data,
            timestamp: event.timestamp,
          },
          "*"
        );
      }
    },
    onActivityProgress: (event) => {
      console.log("📊 Activity progress:", activityId, event.data);

      // Forward to parent window via postMessage
      if (instanceId) {
        window.parent.postMessage(
          {
            source: "navi",
            instance_id: instanceId,
            type: "navi.activity.progress",
            activity_id: activityId,
            activity_type: event.activityType,
            data: event.data,
            timestamp: event.timestamp,
          },
          "*"
        );
      }
    },
    onActivityDataChange: (event) => {
      console.log("📝 Activity data change:", activityId, event.data);

      // Forward to parent window via postMessage
      if (instanceId) {
        window.parent.postMessage(
          {
            source: "navi",
            instance_id: instanceId,
            type: "navi.activity.data-change",
            activity_id: activityId,
            activity_type: event.activityType,
            data: event.data,
            timestamp: event.timestamp,
          },
          "*"
        );
      }
    },
    onActivityComplete: (event) => {
      console.log("🎉 Activity completed:", activityId, event.data);

      // Forward to parent window via postMessage
      if (instanceId) {
        window.parent.postMessage(
          {
            source: "navi",
            instance_id: instanceId,
            type: "navi.activity.completed",
            activity_id: activityId,
            activity_type: event.activityType,
            data: event.data,
            timestamp: event.timestamp,
          },
          "*"
        );
      }
    },
    onActivityError: (event) => {
      console.error("❌ Activity error:", activityId, event.data);

      // Forward to parent window via postMessage
      if (instanceId) {
        window.parent.postMessage(
          {
            source: "navi",
            instance_id: instanceId,
            type: "navi.activity.error",
            activity_id: activityId,
            activity_type: event.activityType,
            data: event.data,
            timestamp: event.timestamp,
          },
          "*"
        );
      }
    },
    onActivityFocus: (event) => {
      console.log("👁️ Activity focused:", activityId, event);

      // Forward to parent window via postMessage
      if (instanceId) {
        window.parent.postMessage(
          {
            source: "navi",
            instance_id: instanceId,
            type: "navi.activity.focus",
            activity_id: activityId,
            activity_type: event.activityType,
            data: event.data,
            timestamp: event.timestamp,
          },
          "*"
        );
      }
    },
    onActivityBlur: (event) => {
      console.log("👀 Activity blurred:", activityId, event);

      // Forward to parent window via postMessage
      if (instanceId) {
        window.parent.postMessage(
          {
            source: "navi",
            instance_id: instanceId,
            type: "navi.activity.blur",
            activity_id: activityId,
            activity_type: event.activityType,
            data: event.data,
            timestamp: event.timestamp,
          },
          "*"
        );
      }
    },
  });

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
          const formActivity = new FormActivity(activeActivity as ActivityType);
          return (
            <Activities.Form
              activity={formActivity}
              eventHandlers={createActivityEventHandlers(activeActivity.id)}
              onSubmit={handleFormSubmit}
            />
          );
        }
        break;
      }
      case "MESSAGE": {
        const message = getMessageFromActivity(activeActivity);
        if (message) {
          const messageActivity = new MessageActivity(
            activeActivity as ActivityType
          );

          return (
            <Activities.Message
              activity={messageActivity}
              eventHandlers={createActivityEventHandlers(activeActivity.id)}
              onMarkAsRead={handleMessageMarkAsRead}
            />
          );
        }
        break;
      }
      case "CHECKLIST": {
        const checklistActivity = new ChecklistActivity(
          activeActivity as ActivityType
        );
        return (
          <Activities.Checklist
            activity={checklistActivity}
            eventHandlers={createActivityEventHandlers(activeActivity.id)}
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
