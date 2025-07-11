import React, { useEffect, useState } from 'react';
import type { BaseActivityProps, ChecklistActivityData } from '@awell-health/navi-core';
import { useActivityEvents } from '../../hooks/use-activity-events';
import { Button, Checkbox, Label } from '../../components/ui';
import { cn } from '../../lib/utils';

export interface ChecklistActivityProps extends BaseActivityProps {
  activity: BaseActivityProps['activity'] & {
    inputs?: {
      checklist?: ChecklistActivityData;
    };
  };
  onComplete?: (activityId: string, data: Record<string, unknown>) => void | Promise<void>;
}

/**
 * ChecklistActivity component - manages checklist completion with progress tracking
 * Uses shadcn/ui components following the Form Components Plan
 */
export function ChecklistActivity({
  activity,
  disabled = false,
  className = '',
  eventHandlers,
  onComplete,
}: ChecklistActivityProps) {
  const { emitActivityEvent } = useActivityEvents(
    activity.id,
    'CHECKLIST',
    eventHandlers
  );

  const [checkedItems, setCheckedItems] = useState<Record<string, boolean>>({});
  
  const checklist = activity.inputs?.checklist;
  const items = checklist?.items || [];

  // Emit ready event when component mounts
  useEffect(() => {
    emitActivityEvent('activity-ready');
  }, [emitActivityEvent]);

  // Emit progress events when items are checked/unchecked
  useEffect(() => {
    const completedCount = Object.values(checkedItems).filter(Boolean).length;
    emitActivityEvent('activity-progress', {
      progress: completedCount,
      total: items.length
    });
  }, [checkedItems, items.length, emitActivityEvent]);

  const handleItemChange = (index: number, checked: boolean) => {
    setCheckedItems((prev) => ({
      ...prev,
      [index]: checked,
    }));
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
      emitActivityEvent('activity-complete', {
        submissionData: completedData
      });
    } catch (error) {
      emitActivityEvent('activity-error', {
        error: error instanceof Error ? error.message : 'Failed to complete checklist'
      });
    }
  };

  const completedCount = Object.values(checkedItems).filter(Boolean).length;
  const totalCount = items.length;
  const progressPercentage = totalCount > 0 ? (completedCount / totalCount) * 100 : 0;
  const isComplete = completedCount === totalCount && totalCount > 0;

  if (!checklist || items.length === 0) {
    return (
      <div className={cn("navi-checklist-activity", className)}>
        <div>No checklist items available</div>
      </div>
    );
  }

  return (
    <div 
      className={cn("navi-checklist-activity", className)}
      onFocus={() => emitActivityEvent('activity-focus')}
      onBlur={() => emitActivityEvent('activity-blur')}
    >
      {/* Header */}
      <div className="mb-6">
        <div className="flex items-center justify-between mb-4">
          <div>
            <h1 className="text-2xl font-bold text-foreground mb-2">
              {checklist.title || 'Checklist Activity'}
            </h1>
            <div className="flex gap-4 text-sm text-muted-foreground">
              <span>Checklist • {activity.status}</span>
              <span>{new Date(activity.date).toLocaleString()}</span>
            </div>
          </div>
          {activity.status === 'ACTIVE' && isComplete && !disabled && (
            <Button onClick={handleCompleteChecklist} variant="default">
              Complete Checklist
            </Button>
          )}
        </div>

        {/* Progress Bar */}
        <div className="mb-4">
          <div className="flex items-center justify-between text-sm text-muted-foreground mb-2">
            <span>Progress</span>
            <span>{completedCount} of {totalCount} items completed</span>
          </div>
          <div className="w-full bg-muted rounded-full h-2 overflow-hidden">
            <div
              className="bg-primary h-full rounded-full transition-all duration-300"
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
          {items.map((item, idx) => (
            <div
              key={idx}
              className={cn(
                "flex items-center gap-3 p-3 rounded-lg border transition-all duration-200",
                checkedItems[idx] 
                  ? "bg-primary/5 border-primary/20" 
                  : "bg-background border-border hover:bg-muted/50"
              )}
            >
              <Checkbox
                id={`checklist-item-${idx}`}
                checked={checkedItems[idx] || false}
                onCheckedChange={(checked) => handleItemChange(idx, checked as boolean)}
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

        {!isComplete && (
          <div className="mt-6 p-4 bg-muted/50 rounded-lg border border-border">
            <p className="text-sm text-muted-foreground">
              Complete all items to finish this checklist activity.
            </p>
          </div>
        )}
      </div>
    </div>
  );
}