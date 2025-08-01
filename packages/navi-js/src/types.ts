import type { BrandingConfig, RenderOptions } from "@awell-health/navi-core";

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

// Re-export RenderOptions from navi-core for consistency
export type { RenderOptions };

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
