import type { OrgBranding, ThemeTokens } from "./types";

export const awellDefaultTheme: ThemeTokens = {
  // Primary palette
  "--primary": "#1d4ed8",
  "--primary-foreground": "#ffffff",

  // Secondary palette
  "--secondary": "#ffffff",
  "--secondary-foreground": "#475569",

  // Background & surface
  "--background": "#ffffff",
  "--foreground": "#475569",
  "--card": "#ffffff",
  "--card-foreground": "#475569",
  "--popover": "#ffffff",
  "--popover-foreground": "#475569",

  // Muted (surface variants)
  "--muted": "#f1f5f9",
  "--muted-foreground": "#475569",

  // Accent (secondary surface)
  "--accent": "#f1f5f9",
  "--accent-foreground": "#475569",

  // Destructive (error)
  "--destructive": "#dc2626",
  "--destructive-foreground": "#ffffff",

  // Borders & inputs
  "--border": "#cbd5e1",
  "--input": "#cbd5e1",
  "--ring": "#1d4ed8",

  // Border radius
  "--radius": "0.5rem",

  // Custom tokens
  "--primary-hover": "#1e40af",
  "--shadow-sm": "0 1px 2px rgba(0,0,0,0.04)",
  "--shadow-md": "0 4px 6px rgba(0,0,0,0.08)",
  "--nav-height": "56px",
};

/**
 * Awell's default branding configuration
 * Used as a fallback when no custom branding is available
 */
export const awellDefaultBranding: OrgBranding = {
  orgId: "awell-dev",
  branding: {
    // Core palette
    primary: "#1d4ed8",
    onPrimary: "#ffffff",
    primaryHover: "#1e40af",

    secondary: "#ffffff",
    onSecondary: "#475569",

    background: "#ffffff",
    surface: "#f1f5f9",
    onSurface: "#475569",
    border: "#cbd5e1",

    success: "#16a34a",
    onSuccess: "#ffffff",
    error: "#dc2626",
    onError: "#ffffff",

    // Typography - Font families
    fontFamilyBody: "system-ui, sans-serif",
    fontFamilyHeading: "system-ui, sans-serif",
    fontFamilyMono: "ui-monospace, monospace",
    
    // Typography - Font sizes
    fontSizeXs: "0.75rem",
    fontSizeSm: "0.875rem",
    fontSizeBase: "1rem",
    fontSizeLg: "1.125rem",
    fontSizeXl: "1.25rem",
    fontSize2xl: "1.5rem",
    fontSize3xl: "1.875rem",
    fontSize4xl: "2.25rem",
    
    // Typography - Line heights
    lineHeightTight: "1.25",
    lineHeightNormal: "1.5",
    lineHeightRelaxed: "1.625",
    
    // Typography - Font weights
    fontWeightNormal: "400",
    fontWeightMedium: "500",
    fontWeightSemibold: "600",
    fontWeightBold: "700",
    fontWeightExtrabold: "800",

    // Radii
    radiusSm: "0.5rem",
    radiusMd: "1rem",
    radiusLg: "1.5rem",

    // Spacing
    stackSpacing: "sm",

    // Welcome page defaults
    welcomeTitle: "Welcome to your care journey",
    welcomeSubtitle: "Let's get started with your next steps",
    faviconUrl: "/favicon-16x16.png", // Default Awell favicon
    logoUrl: undefined, // No default logo
    logoWidth: "200px",
    logoHeight: "80px",
  },
};
