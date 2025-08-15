import type {
  RenderOptions,
  NaviEventType,
  ActivityEventType,
  SessionEventType,
  NaviEvent,
  ActivityEvent,
  SessionEvent,
} from "@awell-health/navi-core";

// Re-export event types from navi-core for consistency
export type NaviActivityEvent = ActivityEventType;
export type NaviSessionEvent = SessionEventType;
export type NaviAllEvents = NaviEventType;

// Export the union type for internal use
export { NaviEventType };

// Re-export event types from navi-core for external use
export type { NaviEvent, ActivityEvent, SessionEvent };

export interface NaviEmbedInstance {
  instanceId: string;
  destroy: () => void;
  iframe: HTMLIFrameElement;
  on: (event: NaviEventType, callback: (data: any) => void) => void;
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
  /** Fully logs out: clears session cookie on parent domain and requests server-side logout (clears awell.sid and awell.jwt). */
  logout: () => Promise<void>;
  /** Clears only the JWT on the server, preserving the long-lived session cookie. */
  clearJwt: () => Promise<void>;
}
