import type { BrandingConfig } from "@awell-health/navi-core";
import type { OrgBranding } from "@/lib/branding/types";

/**
 * Extract font family name from CSS font-family declaration
 * Handles cases like "Inter, sans-serif" or "Inter"
 */
function extractFontFamily(fontFamily: string): string | null {
  if (!fontFamily) return null;

  // Remove quotes and get the first font family
  const cleanFont = fontFamily
    .replace(/['"]/g, "") // Remove quotes
    .split(",")[0] // Get first font family
    .trim()
    .replace(/[\s_]+/g, "+"); // Convert spaces to plus signs for Google Fonts URL

  return cleanFont;
}

/**
 * Collect unique Google Fonts from branding properties
 * Supports both BrandingConfig (simplified) and OrgBranding (comprehensive)
 */
function collectGoogleFonts(
  branding: BrandingConfig | OrgBranding["branding"]
): string[] {
  const fonts = new Set<string>();

  if ("fontFamilyBody" in branding && branding.fontFamilyBody) {
    const googleFont = extractFontFamily(
      branding.fontFamilyBody?.fontFamily ?? ""
    );
    if (googleFont) fonts.add(googleFont);
  }

  if ("fontFamilyHeading" in branding && branding.fontFamilyHeading) {
    const googleFont = extractFontFamily(
      branding.fontFamilyHeading?.fontFamily ?? ""
    );
    if (googleFont) fonts.add(googleFont);
  }

  if ("fontFamilyMono" in branding && branding.fontFamilyMono) {
    const googleFont = extractFontFamily(
      branding.fontFamilyMono?.fontFamily ?? ""
    );
    if (googleFont) fonts.add(googleFont);
  }

  return Array.from(fonts);
}

/**
 * Render Google Fonts link tags based on branding properties
 * @param branding The branding configuration (supports both BrandingConfig and OrgBranding)
 * @returns HTML string with Google Fonts link tags, or empty string if no Google Fonts needed
 */
export function renderGoogleFontLinks(
  branding: BrandingConfig | OrgBranding["branding"]
): string {
  if (!branding) return "";

  const googleFonts = collectGoogleFonts(branding);

  if (googleFonts.length === 0) {
    return "";
  }

  // Build the Google Fonts URL
  const fontFamilies = googleFonts.join("&family=");
  const googleFontsUrl = `https://fonts.googleapis.com/css2?family=${fontFamilies}:wght@400..700&display=swap`;

  return `
  <!-- Google Fonts - non-blocking load -->
  <link rel="preconnect" href="https://fonts.googleapis.com">
  <link rel="preconnect" href="https://fonts.gstatic.com" crossorigin>
  <link href="${googleFontsUrl}" rel="stylesheet" media="print" onload="this.media='all'">
  <noscript><link href="${googleFontsUrl}" rel="stylesheet"></noscript>`;
}
