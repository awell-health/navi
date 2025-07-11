/**
 * Core Activity Interface
 */
export interface Activity {
  id: string;
  type: string;
  status: "active" | "completed" | "expired";
  data?: Record<string, any>;
}

/**
 * Flow Interface
 */
export interface Flow {
  id: string;
  title: string;
  description?: string;
  status: "active" | "completed" | "paused";
}

/**
 * Generic Event Interface
 */
export interface NaviEvent {
  type: string;
  data: Record<string, any>;
  timestamp: number;
}

/**
 * Activity-level Events (External API - Stripe Elements pattern)
 * These are the events that consumers (navi-portal, navi.js, navi-react) will handle
 */
export interface ActivityEvent<T = any> {
  type:
    | "activity-ready" // Activity is mounted and ready for interaction
    | "activity-progress" // Progress has changed (forms/checklists)
    | "activity-complete" // Activity has been completed/submitted
    | "activity-error" // An error occurred at the activity level
    | "activity-focus" // Activity gained focus
    | "activity-blur"; // Activity lost focus
  activityId: string;
  activityType: "FORM" | "MESSAGE" | "CHECKLIST";
  data?: T;
  timestamp: number;
}

/**
 * Activity Event Handlers (Similar to Stripe Elements API)
 */
export interface ActivityEventHandlers {
  onActivityReady?: (event: ActivityEvent) => void;
  onActivityProgress?: (
    event: ActivityEvent<{ progress: number; total: number }>
  ) => void;
  onActivityComplete?: (event: ActivityEvent<{ submissionData: any }>) => void;
  onActivityError?: (
    event: ActivityEvent<{ error: string; field?: string }>
  ) => void;
  onActivityFocus?: (event: ActivityEvent) => void;
  onActivityBlur?: (event: ActivityEvent) => void;
}

/**
 * Base Activity Component Props
 * All activity types extend this
 */
export interface BaseActivityProps {
  activity: {
    id: string;
    status: string;
    date: string;
    // Minimum required activity fields
  };
  disabled?: boolean;
  className?: string;
  eventHandlers?: ActivityEventHandlers;
}
