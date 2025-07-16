import React, { useEffect, useState } from "react";
import type {
  BaseActivityProps,
  ChecklistActivity,
} from "@awell-health/navi-core";
import { useActivityEvents } from "@/hooks/use-activity-events";
import { Button, Checkbox, Label, Progress, Typography } from "@/components/ui";
import { Stack } from "@/components/ui/stack";
import { cn } from "@/lib/utils";

export interface ChecklistActivityProps extends BaseActivityProps {
  activity: ChecklistActivity;
  onComplete?: (
    activityId: string,
    data: Record<string, unknown>
  ) => void | Promise<void>;
}

/**
 * ChecklistActivity component - manages checklist completion with progress tracking
 * Uses shadcn/ui components following the Form Components Plan
 */
export function Checklist({
  activity,
  disabled = false,
  className = "",
  eventHandlers,
  onComplete,
}: ChecklistActivityProps) {
  const { emitActivityEvent } = useActivityEvents(
    activity.id,
    "CHECKLIST",
    eventHandlers
  );

  const [checkedItems, setCheckedItems] = useState<Record<string, boolean>>({});

  const { checklist } = activity.inputs;
  const items = checklist?.items || [];

  // Emit ready event when component mounts
  useEffect(() => {
    emitActivityEvent("activity-ready");
  }, [emitActivityEvent]);

  // Emit progress events when items are checked/unchecked
  useEffect(() => {
    const completedCount = Object.values(checkedItems).filter(Boolean).length;
    emitActivityEvent("activity-progress", {
      progress: completedCount,
      total: items.length,
    });
  }, [checkedItems, items.length, emitActivityEvent]);

  const handleItemChange = (index: number, checked: boolean) => {
    setCheckedItems((prev) => {
      const newCheckedItems = {
        ...prev,
        [index]: checked,
      };

      // Emit data change event with current checklist state
      emitActivityEvent("activity-data-change", {
        field: `item_${index}`,
        value: checked,
        currentData: {
          checkedItems: newCheckedItems,
          completedCount: Object.values(newCheckedItems).filter(Boolean).length,
          totalItems: items.length,
        },
      });

      return newCheckedItems;
    });
  };

  const handleCompleteChecklist = async () => {
    const completedData = {
      checklist_items: items.map((item, idx) => ({
        id: idx,
        text: item,
        completed: checkedItems[idx] || false,
      })),
      total_items: items.length,
      completed_items: Object.values(checkedItems).filter(Boolean).length,
    };

    try {
      if (onComplete) {
        await onComplete(activity.id, completedData);
      }

      // Emit completion event
      emitActivityEvent("activity-complete", {
        submissionData: completedData,
      });
    } catch (error) {
      emitActivityEvent("activity-error", {
        error:
          error instanceof Error
            ? error.message
            : "Failed to complete checklist",
      });
    }
  };

  const completedCount = Object.values(checkedItems).filter(Boolean).length;
  const totalCount = items.length;
  const isComplete = completedCount === totalCount && totalCount > 0;

  if (!checklist || items.length === 0) {
    return (
      <div
        className={cn("navi-checklist-activity", className)}
        onFocus={() => emitActivityEvent("activity-focus")}
        onBlur={() => emitActivityEvent("activity-blur")}
      >
        <div>No checklist items available</div>
      </div>
    );
  }

  const calculateProgressPercentage = (
    completedCount: number,
    totalCount: number
  ) => {
    return totalCount > 0 ? (completedCount / totalCount) * 100 : 0;
  };

  return (
    <div
      className={cn("navi-checklist-activity", className)}
      onFocus={() => emitActivityEvent("activity-focus")}
      onBlur={() => emitActivityEvent("activity-blur")}
    >
      <Stack spacing="sm">
        {/* Header */}
        <div>
          <Stack spacing="sm">
            <div className="flex">
              <Stack
                spacing="xs"
                className="border-b border-border pb-2 w-full"
              >
                <Typography.H1>
                  {checklist.title || "Checklist Activity"}
                </Typography.H1>
              </Stack>
            </div>

            {/* Progress Bar */}
            <Progress
              value={calculateProgressPercentage(completedCount, totalCount)}
            />
          </Stack>
        </div>

        {/* Checklist Items */}
        <div className="bg-card rounded-lg p-6">
          <Stack spacing="sm">
            <h3 className="text-lg font-semibold text-foreground">
              Checklist Items
            </h3>
            <div className="space-y-4">
              {items.map((item, idx) => (
                <div
                  key={idx}
                  className={cn(
                    "flex items-center gap-3 p-3 rounded-lg transition-all duration-200",
                    checkedItems[idx]
                      ? "bg-primary/5 border-primary/20"
                      : "bg-background hover:bg-muted/50"
                  )}
                >
                  <Checkbox
                    id={`checklist-item-${idx}`}
                    checked={checkedItems[idx] || false}
                    onCheckedChange={(checked) =>
                      handleItemChange(idx, checked as boolean)
                    }
                    disabled={disabled}
                    className="h-5 w-5"
                  />
                  <Label
                    htmlFor={`checklist-item-${idx}`}
                    className={cn(
                      "flex-1 text-sm font-medium cursor-pointer transition-all",
                      checkedItems[idx]
                        ? "line-through text-muted-foreground"
                        : "text-foreground hover:text-foreground/80"
                    )}
                  >
                    {item}
                  </Label>
                </div>
              ))}
            </div>
          </Stack>
        </div>

        <div className="flex justify-end">
          <Button
            onClick={handleCompleteChecklist}
            variant="default"
            disabled={disabled || !isComplete}
          >
            Complete Checklist
          </Button>
        </div>
      </Stack>
    </div>
  );
}
