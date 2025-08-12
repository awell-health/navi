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
 * Event Data Types
 * Named types for event payloads - can be imported and used by consumers
 */
export interface ActivityProgressData {
  progress: number;
  total: number;
}

export interface ActivityDataChangeData {
  field: string;
  fieldType?: "text" | "number" | "select" | "checkbox" | "date" | "textarea" | "file";
  hasValue: boolean;
  isRequired?: boolean;
  validationState?: "valid" | "invalid" | "pending";
}

export interface ActivityCompleteData {
  submissionData: UntypedData;
}

export interface ActivityErrorData {
  error: string;
  field?: string;
}

export interface SessionReadyData {
  sessionId: string;
  environment: string;
}

export interface SessionErrorData {
  error: string;
}

export interface HeightChangeData {
  height: number;
  activityId?: string;
}

export interface WidthChangeData {
  width: number;
}

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
 * Specific Activity Event Types
 * Strongly typed events for each activity event type
 */
export interface ActivityReadyEvent extends ActivityEvent<void> {
  type: "activity-ready";
}

export interface ActivityActivateEvent extends ActivityEvent<void> {
  type: "activity-activate";
}

export interface ActivityProgressEvent extends ActivityEvent<ActivityProgressData> {
  type: "activity-progress";
  data: ActivityProgressData;
}

export interface ActivityDataChangeEvent extends ActivityEvent<ActivityDataChangeData> {
  type: "activity-data-change";
  data: ActivityDataChangeData;
}

export interface ActivityCompleteEvent extends ActivityEvent<ActivityCompleteData> {
  type: "activity-complete";
  data: ActivityCompleteData;
}

export interface ActivityErrorEvent extends ActivityEvent<ActivityErrorData> {
  type: "activity-error";
  data: ActivityErrorData;
}

export interface ActivityFocusEvent extends ActivityEvent<void> {
  type: "activity-focus";
}

export interface ActivityBlurEvent extends ActivityEvent<void> {
  type: "activity-blur";
}

/**
 * Specific Session Event Types
 * Strongly typed events for each session event type
 */
export interface SessionReadyEvent extends SessionEvent<SessionReadyData> {
  type: "navi.session.ready";
  data: SessionReadyData;
}

export interface SessionCompletedEvent extends SessionEvent<void> {
  type: "navi.session.completed";
}

export interface SessionErrorEvent extends SessionEvent<SessionErrorData> {
  type: "navi.session.error";
  data: SessionErrorData;
}

export interface IframeCloseEvent extends SessionEvent<void> {
  type: "navi.iframe.close";
}

export interface HeightChangeEvent extends SessionEvent<HeightChangeData> {
  type: "navi.height.changed";
  data: HeightChangeData;
}

export interface WidthChangeEvent extends SessionEvent<WidthChangeData> {
  type: "navi.width.changed";
  data: WidthChangeData;
}

/**
 * Activity Event Handlers (Similar to Stripe Elements API)
 * Using strongly typed event interfaces
 */
export interface ActivityEventHandlers {
  onActivityReady?: (event: ActivityReadyEvent) => void;
  onActivityActivate?: (event: ActivityActivateEvent) => void;
  onActivityProgress?: (event: ActivityProgressEvent) => void;
  onActivityDataChange?: (event: ActivityDataChangeEvent) => void;
  onActivityComplete?: (event: ActivityCompleteEvent) => void;
  onActivityError?: (event: ActivityErrorEvent) => void;
  onActivityFocus?: (event: ActivityFocusEvent) => void;
  onActivityBlur?: (event: ActivityBlurEvent) => void;
}

/**
 * Session Event Handlers
 * Handlers for session-level events (iframe lifecycle, completion, etc.)
 * Using strongly typed event interfaces
 */
export interface SessionEventHandlers {
  onSessionReady?: (event: SessionReadyEvent) => void;
  onSessionCompleted?: (event: SessionCompletedEvent) => void;
  onSessionError?: (event: SessionErrorEvent) => void;
  onIframeClose?: (event: IframeCloseEvent) => void;
  onHeightChange?: (event: HeightChangeEvent) => void;
  onWidthChange?: (event: WidthChangeEvent) => void;
}

/**
 * Complete Navi Event Handlers
 * Union of all possible event handlers
 */
export interface NaviEventHandlers
  extends ActivityEventHandlers,
    SessionEventHandlers {}
