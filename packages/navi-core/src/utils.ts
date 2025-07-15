import type { BrandingConfig } from "./types";

// Branding utilities
export function generateCSSCustomProperties(
  branding: BrandingConfig
): Record<string, string> {
  return {
    "--navi-primary": branding.primary || "#3b82f6",
    "--navi-secondary": branding.secondary || "#64748b",
    "--navi-font-family": branding.fontFamily || "Inter, sans-serif",
    "--navi-logo-url": branding.logoUrl ? `url(${branding.logoUrl})` : "none",
  };
}
