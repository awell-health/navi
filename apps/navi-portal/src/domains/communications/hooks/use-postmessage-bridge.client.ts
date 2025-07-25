"use client";

import { useCallback } from "react";
import type { ActivityEvent, UserActivityType } from "@awell-health/navi-core";
import type {
  HeightChangeEvent,
  ActivityActivateEvent,
  PostMessageActivityEvent,
  AllPostMessageEvents,
} from "../shared/types";

interface UsePostMessageBridgeProps {
  instanceId: string | null;
}

/**
 * Handles PostMessage communication with parent window
 *
 * Extracted from careflow-activities-client.tsx to handle:
 * - Sending events to parent window via postMessage
 * - Type-safe event creation and sending
 * - Instance ID validation and logging
 */
export function usePostMessageBridge({
  instanceId,
}: UsePostMessageBridgeProps) {
  const sendMessage = useCallback(
    (event: AllPostMessageEvents) => {
      if (!instanceId) {
        console.warn(
          "⚠️ Not sending postMessage - instanceId is null/undefined"
        );
        return;
      }

      console.log("📤 Sending postMessage:", event);
      window.parent.postMessage(event, "*");
    },
    [instanceId]
  );

  const sendHeightChange = useCallback(
    (height: number, source: string, activityId?: string) => {
      const event: HeightChangeEvent = {
        source: "navi",
        instance_id: instanceId!,
        type: "navi.height.changed",
        height,
        activity_id: activityId,
        timestamp: Date.now(),
      };

      sendMessage(event);
    },
    [instanceId, sendMessage]
  );

  const sendActivityActivate = useCallback(
    (
      activityId: string,
      activityType: UserActivityType,
      data: {
        activityId: string;
        activityType: string;
        activityName: string;
        status: string;
      }
    ) => {
      const event: ActivityActivateEvent = {
        source: "navi",
        instance_id: instanceId!,
        type: "navi.activity.activate",
        activity_id: activityId,
        activity_type: activityType,
        data,
        timestamp: Date.now(),
      };

      sendMessage(event);
    },
    [instanceId, sendMessage]
  );

  const sendActivityEvent = useCallback(
    (
      originalEvent: ActivityEvent,
      activityId: string,
      activityType: UserActivityType
    ) => {
      // Convert navi-core event type to PostMessage event type
      // Need proper mapping since navi.js expects different naming
      const eventTypeMap: Record<string, PostMessageActivityEvent["type"]> = {
        "activity-ready": "navi.activity.ready",
        "activity-activate": "navi.activity.activate",
        "activity-progress": "navi.activity.progress",
        "activity-data-change": "navi.activity.data-change",
        "activity-complete": "navi.activity.completed", // ✅ Fix: complete → completed
        "activity-error": "navi.activity.error",
        "activity-focus": "navi.activity.focus",
        "activity-blur": "navi.activity.blur",
      };

      const postMessageType = eventTypeMap[originalEvent.type];
      if (!postMessageType) {
        console.warn(`Unknown activity event type: ${originalEvent.type}`);
        return;
      }

      const event: PostMessageActivityEvent = {
        source: "navi",
        instance_id: instanceId!,
        type: postMessageType,
        activity_id: activityId,
        activity_type: activityType,
        original_event: originalEvent,
        timestamp: Date.now(),
      };

      sendMessage(event);
    },
    [instanceId, sendMessage]
  );

  return {
    sendMessage,
    sendHeightChange,
    sendActivityActivate,
    sendActivityEvent,
    isReady: !!instanceId,
  };
}
