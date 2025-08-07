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
  "--primary-dark": "#1e40af",
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
    // === Core shadcn/ui Theme Tokens ===
    primary: "#1d4ed8",
    primaryForeground: "#ffffff",
    secondary: "#ffffff",
    secondaryForeground: "#475569",
    background: "#ffffff",
    foreground: "#475569",
    card: "#ffffff",
    cardForeground: "#475569",
    muted: "#f1f5f9",
    mutedForeground: "#475569",
    destructive: "#dc2626",
    destructiveForeground: "#ffffff",
    border: "#cbd5e1",
    input: "#cbd5e1",
    ring: "#1d4ed8",
    radius: "0.5rem",

    // === Typography ===
    fontFamilyBody: {
      fontFamily: "system-ui, sans-serif",
      weight: ["400", "700"],
      style: ["normal"],
    },
    fontFamilyHeading: {
      fontFamily: "system-ui, sans-serif",
      weight: ["400", "700"],
      style: ["normal"],
    },
    fontFamilyMono: {
      fontFamily: "ui-monospace, monospace",
      weight: ["400", "700"],
      style: ["normal"],
    },

    // === Brand Assets ===
    faviconUrl: "/favicon-16x16.png",
    logoWidth: "200px",
    logoHeight: "80px",

    // === Welcome Page ===
    welcomeTitle: "Welcome to your care journey",
    welcomeSubtitle: "Let's get started with your next steps",

    // === Layout ===
    navHeight: "56px",
  },
};
