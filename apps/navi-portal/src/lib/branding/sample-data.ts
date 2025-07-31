import type { OrgBranding } from "./types";

/**
 * Sample branding configurations for development and testing
 */

export const sunriseHealthBranding: OrgBranding["branding"] = {
  // Warm, healthcare-focused branding
  primary: "#FF6C4C",
  primaryForeground: "#FFFFFF",
  secondary: "#004E7C",
  secondaryForeground: "#FFFFFF",
  background: "#FAFAFA",
  foreground: "#1F1F1F",
  border: "#E0E0E0",
  destructive: "#D32F2F",
  destructiveForeground: "#FFFFFF",

  // Typography
  fontFamily: '"Inter", system-ui, sans-serif',
  fontFamilyHeading: '"Poppins", system-ui, sans-serif',
  radius: "6px",

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
  primaryForeground: "#F8FAFC", // Nearly white text
  secondary: "#6366F1", // Bright indigo secondary
  secondaryForeground: "#FFFFFF", // White text
  background: "#020617", // Very dark navy background
  foreground: "#E2E8F0", // Light gray text
  border: "#334155", // Medium gray border
  destructive: "#EF4444", // Bright red
  destructiveForeground: "#FFFFFF",
  radius: "4px",

  // Typography - Modern tech fonts
  fontFamily: '"JetBrains Mono", "SF Mono", "Monaco", "Consolas", monospace',
  fontFamilyHeading: '"Inter", -apple-system, BlinkMacSystemFont, sans-serif',

  // Welcome page customization
  logoUrl: "https://cdn.awellhealth.com/techcorp/logo-white.svg",
  faviconUrl: "https://cdn.awellhealth.com/techcorp/favicon.ico",
  welcomeTitle: "Welcome to TechCorp Systems",
  welcomeSubtitle: "Advanced healthcare technology platform",
};

export const bakerProBranding: OrgBranding["branding"] = {
  // Baker Pro local development branding
  primary: "#2563EB", // Professional blue
  primaryForeground: "#FFFFFF",
  secondary: "#059669", // Healthcare green
  secondaryForeground: "#FFFFFF",
  background: "#F8FAFC", // Light gray background
  foreground: "#1F2937",
  border: "#D1D5DB",
  destructive: "#DC2626",
  destructiveForeground: "#FFFFFF",

  // Typography
  fontFamily: '"Inter", system-ui, sans-serif',
  fontFamilyHeading: '"Inter", system-ui, sans-serif',
  radius: "8px",

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
