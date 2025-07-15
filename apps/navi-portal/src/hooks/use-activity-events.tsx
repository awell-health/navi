import { useCallback, useRef } from "react";
import type {
  ActivityEvent,
  ActivityEventHandlers,
  FormFieldEvent,
  UntypedData,
} from "@awell-health/navi-core";

type DataChangeEventData = {
  field?: string;
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  value: any;
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  currentData: any;
};

/**
 * Type guards for activity events
 */
export function isActivityReadyEvent(
  event: ActivityEvent
): event is ActivityEvent<void> {
  return event.type === "activity-ready";
}

export function isActivityActivateEvent(
  event: ActivityEvent
): event is ActivityEvent<void> {
  return event.type === "activity-activate";
}

export function isActivityProgressEvent(
  event: ActivityEvent
): event is ActivityEvent<{ progress: number; total: number }> {
  return event.type === "activity-progress";
}

export function isActivityDataChangeEvent(
  event: ActivityEvent
): event is ActivityEvent<DataChangeEventData> {
  return event.type === "activity-data-change";
}

export function isActivityCompleteEvent(
  event: ActivityEvent
): event is ActivityEvent<{ submissionData: UntypedData }> {
  return event.type === "activity-complete";
}

export function isActivityErrorEvent(
  event: ActivityEvent
): event is ActivityEvent<{ error: string; field?: string }> {
  return event.type === "activity-error";
}

export function isActivityFocusEvent(
  event: ActivityEvent
): event is ActivityEvent<void> {
  return event.type === "activity-focus";
}

export function isActivityBlurEvent(
  event: ActivityEvent
): event is ActivityEvent<void> {
  return event.type === "activity-blur";
}

/**
 * Utility to create properly typed activity events
 */
export function createTypedActivityEvent<T = void>(
  type: ActivityEvent<T>["type"],
  activityId: string,
  activityType: "FORM" | "MESSAGE" | "CHECKLIST",
  data?: T
): ActivityEvent<T> {
  return {
    type,
    activityId,
    activityType,
    data,
    timestamp: Date.now(),
  };
}

/**
 * Hook for managing activity-level events
 * Provides utilities to emit events and aggregate field events
 */
export function useActivityEvents(
  activityId: string,
  activityType: "FORM" | "MESSAGE" | "CHECKLIST",
  eventHandlers?: ActivityEventHandlers
) {
  const handlersRef = useRef(eventHandlers);

  // Update handlers ref when they change
  handlersRef.current = eventHandlers;

  /**
   * Emit an activity event with proper typing using type guards
   */
  const emitActivityEvent = useCallback(
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    (type: ActivityEvent["type"], data?: any) => {
      const event = createTypedActivityEvent(
        type,
        activityId,
        activityType,
        data
      );

      // Use type guards instead of casting
      if (isActivityReadyEvent(event)) {
        handlersRef.current?.onActivityReady?.(event);
      } else if (isActivityActivateEvent(event)) {
        handlersRef.current?.onActivityActivate?.(event);
      } else if (isActivityProgressEvent(event)) {
        handlersRef.current?.onActivityProgress?.(event);
      } else if (isActivityDataChangeEvent(event)) {
        handlersRef.current?.onActivityDataChange?.(event);
      } else if (isActivityCompleteEvent(event)) {
        handlersRef.current?.onActivityComplete?.(event);
      } else if (isActivityErrorEvent(event)) {
        handlersRef.current?.onActivityError?.(event);
      } else if (isActivityFocusEvent(event)) {
        handlersRef.current?.onActivityFocus?.(event);
      } else if (isActivityBlurEvent(event)) {
        handlersRef.current?.onActivityBlur?.(event);
      }
    },
    [activityId, activityType]
  );

  /**
   * Handle field events and aggregate them to activity events
   * This is used by form activities to convert field-level events to activity-level events
   */
  const handleFieldEvent = useCallback(
    (fieldEvent: FormFieldEvent) => {
      // For now, we'll implement basic aggregation logic
      // More sophisticated logic will be added as we implement form components

      switch (fieldEvent.type) {
        case "field-change":
          // Could aggregate field changes into progress events
          // Will implement this when we have form state management
          break;
        case "field-validation":
          // Could emit activity errors if validation fails
          if (fieldEvent.data?.isValid === false) {
            emitActivityEvent("activity-error", {
              error: fieldEvent.data.error || "Validation error",
              field: fieldEvent.questionKey,
            });
          }
          break;
        case "field-focus":
          // Could emit activity focus if no field is currently focused
          break;
        case "field-blur":
          // Could emit activity blur if all fields lose focus
          break;
      }
    },
    [emitActivityEvent]
  );

  return {
    emitActivityEvent,
    handleFieldEvent,
    createTypedEvent: (type: ActivityEvent["type"], data?: unknown) =>
      createTypedActivityEvent(type, activityId, activityType, data),
  };
}
