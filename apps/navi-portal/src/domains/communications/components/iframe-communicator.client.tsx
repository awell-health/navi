"use client";

import React from "react";
import { useHeightManager } from "../hooks/use-height-manager.client";
import { usePostMessageBridge } from "../hooks/use-postmessage-bridge.client";
import type { UserActivityType } from "@awell-health/navi-core";

interface IframeCommunicatorProps {
  instanceId: string | null;
  activeActivityId?: string;
  children: React.ReactNode;
}

/**
 * IframeCommunicator - Manages iframe-to-parent communication
 *
 * Combines height management and PostMessage bridge to provide:
 * - Automatic height calculation and resize detection
 * - PostMessage event forwarding to parent window
 * - Clean interface for activity event forwarding
 *
 * Extracted from careflow-activities-client.tsx monolith
 */
export function IframeCommunicator({
  instanceId,
  activeActivityId,
  children,
}: IframeCommunicatorProps) {
  const { sendHeightChange, sendActivityActivate, sendActivityEvent } =
    usePostMessageBridge({ instanceId });

  const { calculateHeight } = useHeightManager({
    instanceId,
    activeActivityId,
    onHeightChange: (height, source, activityId) => {
      sendHeightChange(height, source, activityId);
    },
  });

  // Create activity event handlers for activities to use
  const createActivityEventHandlers = (
    activityId: string,
    activityType: UserActivityType
  ) => ({
    onActivityReady: (event: any) => {
      console.log("🎯 Activity ready:", activityId, event);
      sendActivityEvent(event, activityId, activityType);
    },
    onActivityActivate: (event: any) => {
      console.log("🎯 Activity activated:", activityId, event);
      sendActivityEvent(event, activityId, activityType);
    },
    onActivityProgress: (event: any) => {
      console.log("📊 Activity progress:", activityId, event.data);
      sendActivityEvent(event, activityId, activityType);
    },
    onActivityDataChange: (event: any) => {
      console.log("📝 Activity data change:", activityId, event.data);
      sendActivityEvent(event, activityId, activityType);
    },
    onActivityComplete: (event: any) => {
      console.log("🎉 Activity completed:", activityId, event.data);
      sendActivityEvent(event, activityId, activityType);
    },
    onActivityError: (event: any) => {
      console.error("❌ Activity error:", activityId, event.data);
      sendActivityEvent(event, activityId, activityType);
    },
    onActivityFocus: (event: any) => {
      console.log("👁️ Activity focused:", activityId, event);
      sendActivityEvent(event, activityId, activityType);
    },
    onActivityBlur: (event: any) => {
      console.log("👀 Activity blurred:", activityId, event);
      sendActivityEvent(event, activityId, activityType);
    },
  });

  const handleActivityActivate = (
    activityId: string,
    activityType: UserActivityType,
    data: {
      activityId: string;
      activityType: string;
      activityName: string;
      status: string;
    }
  ) => {
    console.log("🎯 Activity activated:", activityId);
    sendActivityActivate(activityId, activityType, data);
  };

  // Provide communication functions to children via React context
  return (
    <CommunicationsContext.Provider
      value={{
        createActivityEventHandlers,
        handleActivityActivate,
        calculateHeight,
        isReady: !!instanceId,
      }}
    >
      {children}
    </CommunicationsContext.Provider>
  );
}

// Create context for child components to access communication functions
interface CommunicationsContextType {
  createActivityEventHandlers: (
    activityId: string,
    activityType: UserActivityType
  ) => any;
  handleActivityActivate: (
    activityId: string,
    activityType: UserActivityType,
    data: any
  ) => void;
  calculateHeight: () => number;
  isReady: boolean;
}

const CommunicationsContext =
  React.createContext<CommunicationsContextType | null>(null);

export function useCommunications() {
  const context = React.useContext(CommunicationsContext);
  if (!context) {
    throw new Error("useCommunications must be used within IframeCommunicator");
  }
  return context;
}
