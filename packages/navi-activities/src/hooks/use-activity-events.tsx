import { useCallback, useRef } from 'react';
import type { 
  ActivityEvent, 
  ActivityEventHandlers,
  FormFieldEvent 
} from '@awell-health/navi-core';

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
   * Emit an activity event
   */
  const emitActivityEvent = useCallback(<T = any>(
    type: ActivityEvent<T>['type'],
    data?: T
  ) => {
    const event: ActivityEvent<T> = {
      type,
      activityId,
      activityType,
      data,
      timestamp: Date.now(),
    };

    // Call the appropriate handler
    switch (type) {
      case 'activity-ready':
        handlersRef.current?.onActivityReady?.(event);
        break;
      case 'activity-progress':
        handlersRef.current?.onActivityProgress?.(event);
        break;
      case 'activity-complete':
        handlersRef.current?.onActivityComplete?.(event);
        break;
      case 'activity-error':
        handlersRef.current?.onActivityError?.(event);
        break;
      case 'activity-focus':
        handlersRef.current?.onActivityFocus?.(event);
        break;
      case 'activity-blur':
        handlersRef.current?.onActivityBlur?.(event);
        break;
    }
  }, [activityId, activityType]);

  /**
   * Handle field events and aggregate them to activity events
   * This is used by form activities to convert field-level events to activity-level events
   */
  const handleFieldEvent = useCallback((fieldEvent: FormFieldEvent) => {
    // For now, we'll implement basic aggregation logic
    // More sophisticated logic will be added as we implement form components
    
    switch (fieldEvent.type) {
      case 'field-change':
        // Could aggregate field changes into progress events
        // Will implement this when we have form state management
        break;
      case 'field-validation':
        // Could emit activity errors if validation fails
        if (fieldEvent.data?.isValid === false) {
          emitActivityEvent('activity-error', {
            error: fieldEvent.data.error || 'Validation error',
            field: fieldEvent.questionKey
          });
        }
        break;
      case 'field-focus':
        // Could emit activity focus if no field is currently focused
        break;
      case 'field-blur':
        // Could emit activity blur if all fields lose focus
        break;
    }
  }, [emitActivityEvent]);

  return {
    emitActivityEvent,
    handleFieldEvent,
  };
}