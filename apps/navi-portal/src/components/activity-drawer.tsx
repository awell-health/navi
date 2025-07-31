"use client";

import React from "react";
import {
  Sheet,
  SheetHeader,
  SheetTitle,
  SheetDescription,
} from "@/components/ui/sheet";
import * as SheetPrimitive from "@radix-ui/react-dialog";
import { ArrowLeftToLine } from "lucide-react";
import { cn } from "@/lib/utils";
import { useActivity } from "@/lib/activity-provider";
import { ActivityFragment } from "@/lib/awell-client/generated/graphql";

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
  const { activities, newActivities, setActiveActivity, activeActivity } =
    useActivity();

  const handleActivityClick = (activityId: string) => {
    setActiveActivity(activityId);
    const clickedActivity = activities.find(
      (activity) => activity.id === activityId
    );
    if (clickedActivity) {
      onActivityClick(clickedActivity);
    }
    onOpenChange(false); // Close the sheet
  };
  return (
    <Sheet open={open} onOpenChange={onOpenChange}>
      <CustomSheetContent side="left" className="p-0">
        <SheetHeader className="px-4 py-6">
          <SheetTitle>Activities</SheetTitle>
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
          {activities.length === 0 ? (
            <div className="text-center py-8">
              <p className="text-muted-foreground text-sm">
                No activities available
              </p>
            </div>
          ) : (
            <div className="space-y-2">
              {activities.map((activity) => {
                const isActive = activeActivity?.id === activity.id;
                const isNew = newActivities.has(activity.id);

                return (
                  <div
                    key={activity.id}
                    onClick={() => handleActivityClick(activity.id)}
                    className={`px-6 py-4 rounded-lg border transition-colors cursor-pointer ${
                      isActive
                        ? "border-primary bg-primary/10"
                        : "border-border hover:bg-muted/50"
                    }`}
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
