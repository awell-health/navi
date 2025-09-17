"use client";

import React from "react";
import { ActivityFragment } from "@/lib/awell-client/generated/graphql";
import { useActivityFlowState, type ActivityFlowState } from "@/hooks/use-activity-flow-state";
import { SessionCompletionUI } from "./session-completion-ui";

interface ActivityFlowRendererProps {
  careflowId: string;
  activities?: ActivityFragment[];
  onSessionCompleted?: () => void;
  onIframeClose?: () => void;
  waitingDuration?: number;
  
  // Render prop components for different states
  renderLoading?: () => React.ReactNode;
  renderEmpty?: (duration: number) => React.ReactNode;
  renderAwaitingSubscription?: (timeRemaining: number) => React.ReactNode;
  renderActivities?: (count: number) => React.ReactNode;
  renderError?: (message: string) => React.ReactNode;
}

/**
 * Orchestrates UI rendering based on activity flow state
 * 
 * This is the UI coordinator that:
 * - Uses useActivityFlowState to get the current state
 * - Delegates to appropriate UI components based on state
 * - Provides default implementations with render prop overrides
 */
export function ActivityFlowRenderer({
  careflowId,
  activities = [],
  onSessionCompleted,
  onIframeClose,
  waitingDuration = 5,
  renderLoading,
  renderEmpty,
  renderAwaitingSubscription,
  renderActivities,
  renderError,
}: ActivityFlowRendererProps) {
  const flowState = useActivityFlowState(careflowId, {
    activities,
    onSessionCompleted,
    onIframeClose,
    waitingDuration,
  });

  const renderStateContent = (state: ActivityFlowState): React.ReactNode => {
    switch (state.type) {
      case 'loading':
        return renderLoading?.() ?? (
          <div className="min-h-[400px] h-full flex items-center justify-center p-8">
            <div className="text-center">
              <div className="rounded-full h-8 w-8 bg-primary/10 mx-auto mb-4 flex items-center justify-center">
                <div className="h-4 w-4 border-2 border-primary border-t-transparent rounded-full animate-spin" />
              </div>
              <p className="text-muted-foreground">Loading activities...</p>
            </div>
          </div>
        );

      case 'awaiting_subscription':
        return renderAwaitingSubscription?.(state.timeRemaining) ?? (
          <div className="min-h-[400px] h-full flex items-center justify-center p-8">
            <div className="text-center">
              <div className="rounded-full h-8 w-8 bg-primary/10 mx-auto mb-4 flex items-center justify-center">
                <div className="h-4 w-4 border-2 border-primary border-t-transparent rounded-full animate-spin" />
              </div>
              <p className="text-muted-foreground">Saving your response...</p>
            </div>
          </div>
        );

      case 'truly_empty':
        return renderEmpty?.(state.duration) ?? (
          <div className="min-h-[400px] h-full flex items-center justify-center p-8">
            <div className="text-center">
              <div className="rounded-full h-16 w-16 bg-muted mx-auto mb-4 flex items-center justify-center">
                <svg
                  className="h-8 w-8 text-muted-foreground"
                  fill="none"
                  stroke="currentColor"
                  viewBox="0 0 24 24"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z"
                  />
                </svg>
              </div>
              <h3 className="text-lg font-semibold text-foreground mb-2">
                No activities available
              </h3>
              <p className="text-muted-foreground">
                There are currently no activities to complete.
              </p>
            </div>
          </div>
        );

      case 'completion_countdown':
        return (
          <SessionCompletionUI 
            completionState={state.countdown === 0 ? 'completed' : 'waiting'}
            waitingCountdown={state.countdown}
          />
        );

      case 'has_activities':
        return renderActivities?.(state.count) ?? (
          <div className="min-h-[400px] h-full flex items-center justify-center p-8">
            <div className="text-center">
              <h3 className="text-lg font-semibold text-foreground mb-2">
                {state.count} {state.count === 1 ? 'activity' : 'activities'} available
              </h3>
              <p className="text-muted-foreground">
                Please implement your activity list component.
              </p>
            </div>
          </div>
        );

      case 'error':
        return renderError?.(state.message) ?? (
          <div className="min-h-[400px] h-full flex items-center justify-center p-8">
            <div className="text-center">
              <div className="rounded-full h-16 w-16 bg-red-100 mx-auto mb-4 flex items-center justify-center">
                <svg
                  className="h-8 w-8 text-red-600"
                  fill="none"
                  stroke="currentColor"
                  viewBox="0 0 24 24"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-2.5L13.732 4c-.77-.833-1.964-.833-2.732 0L3.732 16.5c-.77.833.192 2.5 1.732 2.5z"
                  />
                </svg>
              </div>
              <h3 className="text-lg font-semibold text-foreground mb-2">
                Something went wrong
              </h3>
              <p className="text-muted-foreground">{state.message}</p>
            </div>
          </div>
        );

      default:
        return null;
    }
  };

  return <>{renderStateContent(flowState)}</>;
}