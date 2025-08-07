import { ActivityInputType } from "./activity";

/**
 * @description UntypedData is a type that represents any JSON object.
 * It is used to represent the data field of an activity or event.
 * It is not typed because the data field is not always known at compile time.
 * @example
 * const data: UntypedData = {
 *   name: "John Doe",
 *   age: 30,
 *   isAdmin: true,
 * };
 */
// eslint-disable-next-line @typescript-eslint/no-explicit-any
export type UntypedData = Record<string, any>;

/**
 * User-facing Activity Types
 * These are the activity input types that patients/clinicians interact with directly in navi-portal
 * Excludes system-only types like CLINICAL_NOTE and CALCULATION
 */
export type UserActivityType = Extract<
  ActivityInputType,
  "FORM" | "DYNAMIC_FORM" | "MESSAGE" | "CHECKLIST" | "EXTENSION"
>;

/**
 * Activity-level Event Types
 * These are events emitted by individual activities within a care flow
 */
export type ActivityEventType =
  | "activity-ready" // Activity is mounted and ready for interaction
  | "activity-activate" // Activity has become the active/selected activity
  | "activity-progress" // Progress has changed (forms/checklists)
  | "activity-data-change" // Real-time data value changes (form fields, checklist items)
  | "activity-complete" // Activity has been completed/submitted
  | "activity-error" // An error occurred at the activity level
  | "activity-focus" // Activity gained focus
  | "activity-blur"; // Activity lost focus

/**
 * Session-level Event Types
 * These are events emitted by the overall care flow session
 */
export type SessionEventType =
  | "navi.session.ready" // Care flow session is ready
  | "navi.session.completed" // All activities completed, session finished
  | "navi.session.error" // Session-level error occurred
  | "navi.iframe.close" // Iframe should be closed/removed
  | "navi.height.changed" // Iframe height changed (for dynamic sizing)
  | "navi.width.changed"; // Iframe width changed (for dynamic sizing)

/**
 * All Navi Event Types
 * Union of all possible event types that can be emitted
 */
export type NaviEventType = ActivityEventType | SessionEventType;

/**
 * Activity-level Events (External API - Stripe Elements pattern)
 * These are the events that consumers (navi-portal, navi.js, navi-react) will handle
 */
export interface ActivityEvent<T = UntypedData | void> {
  type: ActivityEventType;
  activityId: string;
  activityType: UserActivityType;
  data?: T;
  timestamp: number;
}

/**
 * Session-level Events
 * These are emitted by the care flow session itself
 */
export interface SessionEvent<T = UntypedData | void> {
  type: SessionEventType;
  instanceId: string;
  data?: T;
  timestamp: number;
}

/**
 * Generic Navi Event
 * Union type for all possible events
 */
export type NaviEvent<T = UntypedData | void> =
  | ActivityEvent<T>
  | SessionEvent<T>;

/**
 * Activity Event Handlers (Similar to Stripe Elements API)
 */
export interface ActivityEventHandlers {
  onActivityReady?: (event: ActivityEvent) => void;
  onActivityActivate?: (event: ActivityEvent) => void;
  onActivityProgress?: (
    event: ActivityEvent<{ progress: number; total: number }>
  ) => void;
  onActivityDataChange?: (
    event: ActivityEvent<{
      field?: string;
      value: UntypedData;
      currentData: UntypedData;
    }>
  ) => void;
  onActivityComplete?: (
    event: ActivityEvent<{ submissionData: UntypedData }>
  ) => void;
  onActivityError?: (
    event: ActivityEvent<{ error: string; field?: string }>
  ) => void;
  onActivityFocus?: (event: ActivityEvent) => void;
  onActivityBlur?: (event: ActivityEvent) => void;
}

/**
 * Session Event Handlers
 * Handlers for session-level events (iframe lifecycle, completion, etc.)
 */
export interface SessionEventHandlers {
  onSessionReady?: (
    event: SessionEvent<{ sessionId: string; environment: string }>
  ) => void;
  onSessionCompleted?: (event: SessionEvent) => void;
  onSessionError?: (event: SessionEvent<{ error: string }>) => void;
  onIframeClose?: (event: SessionEvent) => void;
  onHeightChange?: (
    event: SessionEvent<{ height: number; activityId?: string }>
  ) => void;
}

/**
 * Complete Navi Event Handlers
 * Union of all possible event handlers
 */
export interface NaviEventHandlers
  extends ActivityEventHandlers,
    SessionEventHandlers {}
