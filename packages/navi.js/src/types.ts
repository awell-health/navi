import type { RenderOptions } from "@awell-health/navi-core";

export type NaviActivityEvent =
  | "activity-ready" // Activity is mounted and ready for interaction
  | "activity-activate" // Activity has become the active/selected activity
  | "activity-progress" // Progress has changed (forms/checklists)
  | "activity-data-change" // Real-time data value changes (form fields, checklist items)
  | "activity-complete" // Activity has been completed/submitted
  | "activity-error" // An error occurred at the activity level
  | "activity-focus" // Activity gained focus
  | "activity-blur"; // Activity lost focus

export interface NaviEmbedInstance {
  instanceId: string; // Add instanceId property
  destroy: () => void;
  iframe: HTMLIFrameElement;
  on: (event: NaviActivityEvent, callback: (data: any) => void) => void;
}

export interface NaviLoadOptions {
  /** Override the CDN origin for loading navi.js script */
  origin?: string;
  /** Override the embed origin for iframe destinations */
  embedOrigin?: string;

  verbose?: boolean;
}

export interface NaviInstance {
  render: (
    containerId: string,
    options: RenderOptions
  ) => Promise<NaviEmbedInstance>;
}
