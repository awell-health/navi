"use client";

import React, { useEffect, useMemo, useState } from "react";
import {
  Sheet,
  SheetHeader,
  SheetTitle,
  SheetDescription,
} from "@/components/ui/sheet";
import * as SheetPrimitive from "@radix-ui/react-dialog";
import { ArrowLeftToLine } from "lucide-react";
import { cn } from "@/lib/utils";
import { useActivity } from "@/lib/activity-context-provider";
import {
  clearAuthenticationCache,
  apolloClient,
} from "@/lib/awell-client/client";
import { ActivityFragment } from "@/lib/awell-client/generated/graphql";
import { OtcVerificationCard } from "./auth/otc-verification";
import { useCommunications } from "@/domains/communications/components/iframe-communicator.client";
import { useAuthState } from "@/domains/session/hooks/use-auth-state";

interface ActivityDrawerProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onActivityClick: (activity: ActivityFragment) => void;
}

// Custom SheetContent without overlay to prevent layout interference
function CustomSheetContent({
  className,
  children,
  side = "left",
  ...props
}: React.ComponentProps<typeof SheetPrimitive.Content> & {
  side?: "top" | "right" | "bottom" | "left";
}) {
  return (
    <SheetPrimitive.Portal data-slot="sheet-portal">
      {/* No SheetOverlay here */}
      <SheetPrimitive.Content
        data-slot="sheet-content"
        className={cn(
          "bg-background data-[state=open]:animate-in data-[state=closed]:animate-out fixed z-50 flex flex-col gap-4 shadow-lg transition ease-in-out data-[state=closed]:duration-300 data-[state=open]:duration-500",
          side === "left" &&
            "data-[state=closed]:slide-out-to-left data-[state=open]:slide-in-from-left inset-y-0 left-0 h-full w-full border-r sm:w-96 sm:max-w-sm",
          className
        )}
        {...props}
      >
        {children}
        <SheetPrimitive.Close className="ring-offset-background focus:ring-ring data-[state=open]:bg-secondary absolute top-4 right-4 rounded-xs opacity-70 transition-opacity hover:opacity-100 focus:ring-2 focus:ring-offset-2 focus:outline-hidden disabled:pointer-events-none cursor-pointer">
          <ArrowLeftToLine className="size-6" />
          <span className="sr-only">Close</span>
        </SheetPrimitive.Close>
      </SheetPrimitive.Content>
    </SheetPrimitive.Portal>
  );
}

export function ActivityDrawer({
  open,
  onOpenChange,
  onActivityClick,
}: ActivityDrawerProps) {
  const {
    activities,
    newActivities,
    setActiveActivity,
    activeActivity,
    refetchActivities,
  } = useActivity();
  const { requestHeightUpdate } = useCommunications();

  const { authState, isLoadingAuth, refreshAuth } = useAuthState();
  // OTC UI moved to OtcVerificationCard
  const isVerified = useMemo(
    () => authState === "verified" || authState === "authenticated",
    [authState]
  );

  useEffect(() => {
    // initial auth fetch
    void refreshAuth();
  }, [refreshAuth]);

  async function handleVerified() {
    // Use the freshly minted JWT (set by /api/otc/verify) immediately
    await clearAuthenticationCache(false);
    await apolloClient.resetStore(); // re-run queries and re-establish subscriptions with new token
    // Refresh auth state so UI reflects updated token
    await refreshAuth();
    await refetchActivities();
  }

  const handleActivityClick = (activityId: string) => {
    setActiveActivity(activityId);
    const clickedActivity = activities.find(
      (activity) => activity.id === activityId
    );
    if (clickedActivity) {
      onActivityClick(clickedActivity);
    }
    onOpenChange(false); // Close the sheet
    // After the drawer closes, request a height update (allow animation to finish)
    setTimeout(() => requestHeightUpdate(), 350);
  };

  // When drawer opens/closes, recalculate height after transition ends
  useEffect(() => {
    const delay = open ? 550 : 350; // match Sheet transition durations
    const id = setTimeout(() => requestHeightUpdate(), delay);
    return () => clearTimeout(id);
  }, [open, requestHeightUpdate]);
  return (
    <Sheet open={open} onOpenChange={onOpenChange}>
      <CustomSheetContent side="left" className="p-0">
        <SheetHeader className="px-4 py-6">
          <div className="flex items-center gap-2">
            <SheetTitle>Activities</SheetTitle>
            {!isLoadingAuth && (
              <span
                className={cn(
                  "text-xs px-2 py-0.5 rounded-full",
                  isVerified
                    ? "bg-green-500 text-white"
                    : "bg-amber-500 text-white"
                )}
              >
                {isVerified ? "Verified" : "Unverified"}
              </span>
            )}
          </div>
          <SheetDescription>
            {activities.length}{" "}
            {activities.length === 1 ? "activity" : "activities"}
            {newActivities.size > 0 && (
              <span className="ml-2 text-primary font-medium">
                ({newActivities.size} new)
              </span>
            )}
          </SheetDescription>
        </SheetHeader>

        <div className="flex-1 overflow-y-auto px-4 pb-4">
          {!isVerified && !isLoadingAuth && (
            <OtcVerificationCard onVerified={handleVerified} />
          )}
          {activities.length === 0 ? (
            <div className="text-center py-8">
              <p className="text-muted-foreground text-sm">
                No activities available
              </p>
            </div>
          ) : (
            <div className="divide-y divide-border">
              {activities.map((activity) => {
                const isActive = activeActivity?.id === activity.id;
                const isNew = newActivities.has(activity.id);

                return (
                  <div
                    key={activity.id}
                    onClick={() => handleActivityClick(activity.id)}
                    className={cn(
                      "px-6 py-4 cursor-pointer transition-colors",
                      isActive ? "bg-primary/10" : "hover:bg-muted/50"
                    )}
                  >
                    <div className="flex items-center gap-2 mb-1">
                      <h3 className="font-medium text-sm truncate">
                        {activity.object.name ||
                          `${activity.object.type} Activity`}
                      </h3>
                      {isNew && (
                        <span className="h-2 w-2 bg-primary rounded-full flex-shrink-0" />
                      )}
                      {isActive && (
                        <span className="text-xs px-2 py-0.5 bg-primary text-primary-foreground rounded-full">
                          Active
                        </span>
                      )}
                    </div>
                    <p className="text-xs text-muted-foreground">
                      {activity.object.type} • {activity.status}
                    </p>
                    <p className="text-xs text-muted-foreground">
                      {new Date(activity.date).toLocaleDateString()}
                    </p>
                  </div>
                );
              })}
            </div>
          )}
        </div>
      </CustomSheetContent>
    </Sheet>
  );
}
