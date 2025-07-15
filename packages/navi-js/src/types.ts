import type { BrandingConfig } from "@awell-health/navi-core";

export interface NaviInstance {
  renderActivities: (
    containerId: string,
    options: RenderOptions
  ) => NaviEmbedInstance;
}

export interface RenderOptions {
  pathwayId: string;
  stakeholderId?: string;

  // For JWT creation - what we need from the customer
  organizationId?: string; // Customer's org ID (for JWT aud claim)
  userId?: string; // End user ID (for JWT sub claim)
  sessionId?: string; // Session tracking

  // UI customization
  branding?: BrandingConfig;

  // Iframe sizing
  size?: "compact" | "standard" | "full" | "custom";
  height?: number; // Custom height in pixels
  width?: string; // Custom width (e.g., '100%', '800px')
}

export interface NaviEmbedInstance {
  destroy: () => void;
  iframe: HTMLIFrameElement;
  on: (event: string, callback: (data: any) => void) => void;
}

export interface NaviConstructor {
  (publishableKey: string): NaviInstance;
  version?: string;
  _registerWrapper?: (details: {
    name: string;
    version: string;
    startTime: number;
  }) => void;
}

export interface Navi extends NaviInstance {
  version?: string;
}

// Global window interface
declare global {
  interface Window {
    Navi?: NaviConstructor;
  }
}
