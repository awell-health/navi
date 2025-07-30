import type { BrandingConfig } from "@awell-health/navi-core";

export interface NaviLoadOptions {
  /** Force local development mode (localhost:3000) instead of CDN */
  local?: boolean;
  /** Override the CDN origin for loading navi.js script */
  origin?: string;
  /** Override the embed origin for iframe destinations */
  embedOrigin?: string;

  /** Enable verbose logging */
  verbose?: boolean;
}

export interface NaviInstance {
  render: (
    containerId: string,
    options: RenderOptions
  ) => Promise<NaviEmbedInstance>;
}

export interface RenderOptions {
  // Use Case 1: Start new careflow
  careflowDefinitionId?: string;
  patientIdentifier?: {
    system: string;
    value: string;
  };
  awellPatientId?: string;
  sessionId?: string;

  // Use Case 2: Resume existing careflow
  careflowId?: string;
  careflowToken?: string; // Alternative to session creation
  trackId?: string;
  activityId?: string;

  // Common options
  stakeholderId?: string;
  branding?: BrandingConfig;

  // Iframe styling
  width?: string; // e.g., "100%", "800px", "50vw"

  // Custom embed URL override (for testing)
  embedUrl?: string;
}

export interface NaviEmbedInstance {
  instanceId: string;
  destroy: () => void;
  iframe: HTMLIFrameElement;
  on: (event: string, callback: (data: any) => void) => void;
}

export interface NaviConstructor {
  (publishableKey: string, options?: NaviLoadOptions): NaviInstance;
  version?: string;
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
