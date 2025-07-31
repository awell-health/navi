import { BrandingConfig } from "@awell-health/navi-core";

/**
 * Internal Organization Branding Interface
 *
 * Uses the shared BrandingConfig from navi-core as the single source of truth.
 * This wrapper adds the orgId for internal portal organization.
 */
export interface OrgBranding {
  orgId: string;
  branding: BrandingConfig;
}

export interface ThemeTokens {
  // shadcn/ui compatible tokens
  "--radius": string;
  "--background": string;
  "--foreground": string;
  "--card": string;
  "--card-foreground": string;
  "--popover": string;
  "--popover-foreground": string;
  "--primary": string;
  "--primary-foreground": string;
  "--secondary": string;
  "--secondary-foreground": string;
  "--muted": string;
  "--muted-foreground": string;
  "--accent": string;
  "--accent-foreground": string;
  "--destructive": string;
  "--destructive-foreground": string;
  "--border": string;
  "--input": string;
  "--ring": string;

  // Custom tokens
  "--primary-dark"?: string;
  "--primary-disabled"?: string;
  "--shadow-sm"?: string;
  "--shadow-md"?: string;
  "--nav-height"?: string;
}
