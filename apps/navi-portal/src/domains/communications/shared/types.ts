import type { ActivityEvent, UserActivityType } from "@awell-health/navi-core";

/**
 * Communications Domain Types
 *
 * Handles iframe-to-parent communication via PostMessage
 * Builds on top of navi-core ActivityEvent for consistency
 */

/**
 * Base PostMessage event structure for iframe-to-parent communication
 */
export interface PostMessageEvent {
  source: "navi";
  instance_id: string;
  timestamp: number;
}

/**
 * Height change event - unique to iframe communication
 */
export interface HeightChangeEvent extends PostMessageEvent {
  type: "navi.height.changed";
  height: number;
  activity_id?: string;
}

/**
 * Activity events that wrap navi-core ActivityEvent for PostMessage
 * These transform component-level events to iframe-to-parent events
 */
export interface PostMessageActivityEvent extends PostMessageEvent {
  type:
    | "navi.activity.ready"
    | "navi.activity.activate"
    | "navi.activity.progress"
    | "navi.activity.data-change"
    | "navi.activity.completed"
    | "navi.activity.error"
    | "navi.activity.focus"
    | "navi.activity.blur";
  activity_id: string;
  activity_type: UserActivityType;
  // Wraps the original navi-core ActivityEvent
  original_event: ActivityEvent;
}

/**
 * Special activity activation event with additional context
 */
export interface ActivityActivateEvent extends PostMessageEvent {
  type: "navi.activity.activate";
  activity_id: string;
  activity_type: UserActivityType;
  data: {
    activityId: string;
    activityType: string;
    activityName: string;
    status: string;
  };
}

export type AllPostMessageEvents =
  | HeightChangeEvent
  | PostMessageActivityEvent
  | ActivityActivateEvent;
