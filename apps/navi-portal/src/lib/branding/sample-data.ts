import type { OrgBranding } from "./types";

/**
 * Sample branding configurations for development and testing
 */

export const sunriseHealthBranding: OrgBranding["branding"] = {
  // Warm, healthcare-focused branding
  primary: "#FF6C4C",
  onPrimary: "#FFFFFF",
  primaryHover: "#E95A3C",
  primaryDisabled: "#FFCFC4",

  secondary: "#004E7C",
  onSecondary: "#FFFFFF",

  background: "#FAFAFA",
  surface: "#FFFFFF",
  onSurface: "#1F1F1F",
  border: "#E0E0E0",

  error: "#D32F2F",
  onError: "#FFFFFF",
  success: "#1E8E3E",
  onSuccess: "#FFFFFF",

  // Typography
  fontFamilyBody: '"Inter", system-ui, sans-serif',
  fontFamilyHeading: '"Poppins", system-ui, sans-serif',
  fontWeightBold: "600",
  fontSizeBase: "16px",

  // Radii
  radiusSm: "4px",
  radiusMd: "6px",
  radiusLg: "12px",

  // Input tokens
  inputBackground: "#FFFFFF",
  inputText: "#1F1F1F",
  inputBorder: "#B5B5B5",
  inputBorderHover: "#8A8A8A",
  inputBorderFocus: "#FF6C4C",
  inputRadius: "6px",

  // Button tokens
  buttonPaddingY: "0.75rem",
  buttonPaddingX: "1.25rem",
  buttonRadius: "6px",

  // Shadow tokens
  shadowSm: "0 1px 2px rgba(0,0,0,0.04)",
  shadowMd: "0 4px 6px rgba(0,0,0,0.08)",

  stackSpacing: "sm",

  // Welcome page customization
  logoUrl: "https://cdn.awellhealth.com/sunrise-health/logo.svg",
  logoWidth: "200px",
  logoHeight: "100px",
  faviconUrl: "https://cdn.awellhealth.com/sunrise-health/favicon.ico",
  welcomeTitle: "Welcome to Sunrise Health",
  welcomeSubtitle: "Your personalized care journey starts here",
};

export const techCorpBranding: OrgBranding["branding"] = {
  // Dark, professional tech company theme
  primary: "#0F172A", // Dark slate primary
  onPrimary: "#F8FAFC", // Nearly white text
  primaryHover: "#1E293B", // Slightly lighter dark
  primaryDisabled: "#64748B", // Muted gray

  secondary: "#6366F1", // Bright indigo secondary
  onSecondary: "#FFFFFF", // White text

  background: "#020617", // Very dark navy background
  surface: "#0F172A", // Dark surface
  onSurface: "#E2E8F0", // Light gray text
  border: "#334155", // Medium gray border

  error: "#EF4444", // Bright red
  onError: "#FFFFFF",
  success: "#10B981", // Emerald green
  onSuccess: "#FFFFFF",

  // Typography - Modern tech fonts
  fontFamilyBody:
    '"JetBrains Mono", "SF Mono", "Monaco", "Consolas", monospace',
  fontFamilyHeading: '"Inter", -apple-system, BlinkMacSystemFont, sans-serif',
  fontWeightBold: "700",
  fontSizeBase: "14px",

  // Sharp, modern radii
  radiusSm: "2px",
  radiusMd: "4px",
  radiusLg: "8px",

  // Input styling
  inputBackground: "#1E293B",
  inputText: "#F8FAFC",
  inputBorder: "#475569",
  inputBorderHover: "#6366F1",
  inputBorderFocus: "#6366F1",
  inputRadius: "4px",

  // Button styling
  buttonPaddingY: "0.625rem",
  buttonPaddingX: "1rem",
  buttonRadius: "4px",

  // Subtle shadows for dark theme
  shadowSm: "0 1px 2px rgba(0,0,0,0.3)",
  shadowMd: "0 4px 6px rgba(0,0,0,0.4)",

  stackSpacing: "xs",

  // Welcome page customization
  logoUrl: "https://cdn.awellhealth.com/techcorp/logo-white.svg",
  faviconUrl: "https://cdn.awellhealth.com/techcorp/favicon.ico",
  welcomeTitle: "Welcome to TechCorp Systems",
  welcomeSubtitle: "Advanced healthcare technology platform",
};

export const bakerProBranding: OrgBranding["branding"] = {
  // Baker Pro local development branding
  primary: "#2563EB", // Professional blue
  onPrimary: "#FFFFFF",
  primaryHover: "#1D4ED8",
  primaryDisabled: "#93C5FD",

  secondary: "#059669", // Healthcare green
  onSecondary: "#FFFFFF",

  background: "#F8FAFC", // Light gray background
  surface: "#FFFFFF",
  onSurface: "#1F2937",
  border: "#D1D5DB",

  error: "#DC2626",
  onError: "#FFFFFF",
  success: "#059669",
  onSuccess: "#FFFFFF",

  // Typography
  fontFamilyBody: '"Inter", system-ui, sans-serif',
  fontFamilyHeading: '"Inter", system-ui, sans-serif',
  fontWeightBold: "600",
  fontSizeBase: "16px",

  // Radii
  radiusSm: "4px",
  radiusMd: "8px",
  radiusLg: "12px",

  // Input tokens
  inputBackground: "#FFFFFF",
  inputText: "#1F2937",
  inputBorder: "#D1D5DB",
  inputBorderHover: "#9CA3AF",
  inputBorderFocus: "#2563EB",
  inputRadius: "8px",

  // Button tokens
  buttonPaddingY: "0.75rem",
  buttonPaddingX: "1.5rem",
  buttonRadius: "8px",

  // Shadow tokens
  shadowSm: "0 1px 2px rgba(0,0,0,0.05)",
  shadowMd: "0 4px 6px rgba(0,0,0,0.1)",

  stackSpacing: "md",

  // Welcome page customization
  logoUrl: "https://cdn.awellhealth.com/baker-pro/logo.svg",
  faviconUrl: "https://cdn.awellhealth.com/baker-pro/favicon.ico",
  welcomeTitle: "Welcome to Baker Pro",
  welcomeSubtitle: "Your healthcare management platform",
};

/**
 * Map of sample organizations for development
 */
export const sampleBrandingData: Record<string, OrgBranding["branding"]> = {
  "organization-test-9dc35114-e414-4f27-8530-58eff7ed042c":
    sunriseHealthBranding,
  techcorp: techCorpBranding,
  "organization-test-8e708b30-8414-4cc2-a20b-b6a0c0b98ad4": bakerProBranding,
};

/**
 * Get sample branding by organization ID
 */
export function getSampleBranding(
  orgId: string
): OrgBranding["branding"] | null {
  return sampleBrandingData[orgId] || null;
}

/**
 * Check if an organization has sample branding available
 */
export function hasSampleBranding(orgId: string): boolean {
  return orgId in sampleBrandingData;
}

/**
 * Get all sample organization IDs
 */
export function getSampleOrgIds(): string[] {
  return Object.keys(sampleBrandingData);
}
