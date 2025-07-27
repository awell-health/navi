import { BrandingConfig } from "@awell-health/navi-core";

export interface NaviEmbedInstance {
  instanceId: string; // Add instanceId property
  destroy: () => void;
  iframe: HTMLIFrameElement;
  on: (event: string, callback: (data: any) => void) => void;
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

export interface RenderOptions {
  // Use Case 1: Start new careflow
  careflowDefinitionId?: string;
  patientIdentifier?: {
    system: string;
    value: string;
  };
  awellPatientId?: string;

  // Use Case 2: Resume existing careflow
  careflowId?: string;
  careflowToken?: string; // Alternative to session creation
  trackId?: string;
  activityId?: string;

  // Common options
  stakeholderId?: string;
  branding?: BrandingConfig;

  // Iframe styling
  width?: string;

  // Custom embed URL override (for testing)
  embedUrl?: string;
}
