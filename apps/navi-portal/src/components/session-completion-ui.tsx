"use client";

import React from "react";

type CompletionState = "active" | "waiting" | "completed";

interface SessionCompletionUIProps {
  completionState: CompletionState;
  waitingCountdown: number | null;
}

/**
 * Renders UI for different session completion states
 *
 * - waiting: Shows countdown with "session will end in X seconds" message
 * - completed: Shows "session ended" message (parent handles redirects)
 * - active: Returns null (normal activity flow)
 */
export function SessionCompletionUI({
  completionState,
  waitingCountdown,
}: SessionCompletionUIProps) {
  if (completionState === "waiting") {
    const showFinalMessage = (waitingCountdown ?? 0) <= 3; // Show final copy only in last 3s
    return (
      <div className="min-h-[500px] h-full flex items-center justify-center p-8">
        <div className="text-center">
          {showFinalMessage ? (
            <>
              <div className="animate-pulse rounded-full h-16 w-16 bg-primary/20 mx-auto mb-4 flex items-center justify-center">
                <div className="text-2xl font-bold text-primary">
                  {waitingCountdown}
                </div>
              </div>
              <h2 className="text-xl font-semibold text-foreground mb-2">
                All done!
              </h2>
              <p className="text-muted-foreground">
                Your session will close in {waitingCountdown} second
                {waitingCountdown !== 1 ? "s" : ""}...
              </p>
            </>
          ) : (
            <>
              <div className="rounded-full h-16 w-16 bg-primary/10 mx-auto mb-4 flex items-center justify-center">
                <div className="h-6 w-6 border-2 border-primary border-t-transparent rounded-full animate-spin" />
              </div>
              <h2 className="text-xl font-semibold text-foreground mb-2">
                Finishing up
              </h2>
              <p className="text-muted-foreground">Preparing final state…</p>
            </>
          )}
        </div>
      </div>
    );
  }

  if (completionState === "completed") {
    return (
      <div className="min-h-[500px] h-full flex items-center justify-center p-8">
        <div className="text-center">
          <div className="rounded-full h-16 w-16 bg-green-100 mx-auto mb-4 flex items-center justify-center">
            <svg
              className="h-8 w-8 text-green-600"
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M5 13l4 4L19 7"
              />
            </svg>
          </div>
          <h2 className="text-xl font-semibold text-foreground mb-2">
            Session Complete
          </h2>
          <p className="text-muted-foreground mb-6">
            Thank you! Your session has been completed and securely closed.
          </p>
        </div>
      </div>
    );
  }

  return null; // Active state - no special UI
}

// Backward compatibility
export const CompletionStateRenderer = SessionCompletionUI;
