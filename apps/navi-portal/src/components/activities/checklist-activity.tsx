"use client";

import type {
  ActivityFragment,
  ChecklistActivityInput,
} from "@/lib/awell-client/generated/graphql";
import { Button } from "@/components/ui/button";
import { Checkbox } from "@/components/ui/checkbox";
import { useState } from "react";

interface ChecklistActivityProps {
  checklistActivity: ActivityFragment & { inputs: ChecklistActivityInput };
  className?: string;
  onComplete?: (
    activityId: string,
    data: Record<string, unknown>
  ) => void | Promise<void>;
}

export function ChecklistActivityComponent({
  checklistActivity,
  className,
  onComplete,
}: ChecklistActivityProps) {
  const [checkedItems, setCheckedItems] = useState<Record<string, boolean>>({});

  const handleItemChange = (itemId: string, checked: boolean) => {
    setCheckedItems((prev) => ({
      ...prev,
      [itemId]: checked,
    }));
  };

  const handleCompleteChecklist = async () => {
    const completedData = {
      checklist_items: checklistActivity.inputs.checklist?.items.map(
        (item, idx) => ({
          id: idx,
          text: item,
          completed: checkedItems[idx] || false,
        })
      ),
      total_items: checklistActivity.inputs.checklist?.items.length || 0,
      completed_items: Object.values(checkedItems).filter(Boolean).length,
    };

    console.log("Completing checklist:", checklistActivity.id, completedData);

    if (onComplete) {
      await onComplete(checklistActivity.id, completedData);
    } else {
      // Mock success feedback
      alert(
        "Checklist completed! (This is a prototype - data was logged to console)"
      );
    }
  };

  const completedCount = Object.values(checkedItems).filter(Boolean).length;
  const totalCount = checklistActivity.inputs.checklist?.items.length || 0;
  const progressPercentage =
    totalCount > 0 ? (completedCount / totalCount) * 100 : 0;

  return (
    <div className={`min-h-screen bg-background p-6 ${className || ""}`}>
      <div className="max-w-4xl mx-auto">
        {/* Header */}
        <div className="mb-6">
          <div className="flex items-center justify-between mb-4">
            <div>
              <h1 className="text-2xl font-bold text-foreground mb-2">
                {checklistActivity.object.name || "Checklist Activity"}
              </h1>
              <div className="flex items-center gap-4 text-sm text-muted-foreground">
                <span>Checklist • {checklistActivity.status}</span>
                <span>{new Date(checklistActivity.date).toLocaleString()}</span>
              </div>
            </div>
            {checklistActivity.status === "ACTIVE" &&
              completedCount === totalCount && (
                <Button onClick={handleCompleteChecklist} variant="default">
                  Complete Checklist
                </Button>
              )}
          </div>

          {/* Progress Bar */}
          <div className="mb-4">
            <div className="flex items-center justify-between text-sm text-muted-foreground mb-2">
              <span>Progress</span>
              <span>
                {completedCount} of {totalCount} items completed
              </span>
            </div>
            <div className="w-full bg-muted rounded-full h-2">
              <div
                className="bg-primary h-2 rounded-full transition-all duration-300"
                style={{ width: `${progressPercentage}%` }}
              />
            </div>
          </div>
        </div>

        {/* Checklist Items */}
        <div className="bg-card border border-border rounded-lg p-6">
          <h3 className="text-lg font-semibold text-foreground mb-4">
            Checklist Items
          </h3>
          <div className="space-y-4">
            {checklistActivity.inputs.checklist?.items.map((item, idx) => (
              <div
                key={idx}
                className="flex items-center space-x-3 p-3 rounded-lg border border-border hover:bg-muted/50 transition-colors"
              >
                <Checkbox
                  id={`checklist-item-${idx}`}
                  checked={checkedItems[idx] || false}
                  onCheckedChange={(checked) =>
                    handleItemChange(idx.toString(), checked as boolean)
                  }
                  className="h-5 w-5"
                />
                <label
                  htmlFor={`checklist-item-${idx}`}
                  className={`flex-1 text-sm font-medium cursor-pointer ${
                    checkedItems[idx]
                      ? "line-through text-muted-foreground"
                      : "text-foreground"
                  }`}
                >
                  {item}
                </label>
              </div>
            ))}
          </div>

          {completedCount < totalCount && (
            <div className="mt-6 p-4 bg-muted/50 rounded-lg">
              <p className="text-sm text-muted-foreground">
                Complete all items to finish this checklist activity.
              </p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
