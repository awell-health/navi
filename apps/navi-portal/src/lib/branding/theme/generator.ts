import { type BrandingConfig } from "@awell-health/navi-core";
import { type ThemeTokens } from "../types";
import { awellDefaultTheme } from "../defaults";

export function generateThemeCSS(branding: BrandingConfig | null): string {
  const tokens = brandingToTokens(branding);

  const cssVars = Object.entries(tokens)
    .map(([key, value]) => `  ${key}: ${value};`)
    .join("\n");

  const fontCSS = generateFontCSS(branding);

  return `:root {\n${cssVars}\n${fontCSS}}`;
}

// Simple CSS value sanitizer - removes dangerous characters without importing heavy libs
function sanitizeCSSValue(value: unknown): string {
  if (typeof value !== "string") {
    return "";
  }
  // Remove potentially dangerous CSS/HTML sequences
  return value
    .replace(/<\/style>/gi, "") // Remove closing style tags
    .replace(/<script/gi, "") // Remove script tag starts
    .replace(/javascript:/gi, "") // Remove javascript: URLs
    .replace(/expression\(/gi, "") // Remove CSS expressions
    .replace(/alert\(/gi, "") // Remove alert calls
    .replace(/['"<>]/g, "") // Remove quotes and angle brackets
    .replace(/[;}]/g, "") // Remove semicolons and closing braces that could break CSS
    .trim();
}

export function brandingToTokens(branding: BrandingConfig | null): ThemeTokens {
  // Start with Awell defaults
  const tokens: ThemeTokens = { ...awellDefaultTheme };

  if (!branding) {
    return tokens;
  }

  // Map branding JSON to shadcn/ui tokens
  if (branding.primary && typeof branding.primary === "string") {
    tokens["--primary"] = sanitizeCSSValue(branding.primary);
  }

  if (
    branding.primaryForeground &&
    typeof branding.primaryForeground === "string"
  ) {
    tokens["--primary-foreground"] = sanitizeCSSValue(
      branding.primaryForeground
    );
  }

  if (branding.secondary && typeof branding.secondary === "string") {
    tokens["--secondary"] = sanitizeCSSValue(branding.secondary);
  }

  if (
    branding.secondaryForeground &&
    typeof branding.secondaryForeground === "string"
  ) {
    tokens["--secondary-foreground"] = sanitizeCSSValue(
      branding.secondaryForeground
    );
  }

  if (branding.background && typeof branding.background === "string") {
    tokens["--background"] = sanitizeCSSValue(branding.background);
  }

  if (branding.foreground && typeof branding.foreground === "string") {
    tokens["--foreground"] = sanitizeCSSValue(branding.foreground);
  }

  if (branding.card && typeof branding.card === "string") {
    tokens["--card"] = sanitizeCSSValue(branding.card);
  }

  if (branding.cardForeground && typeof branding.cardForeground === "string") {
    tokens["--card-foreground"] = sanitizeCSSValue(branding.cardForeground);
  }

  if (branding.popover && typeof branding.popover === "string") {
    tokens["--popover"] = sanitizeCSSValue(branding.popover);
  }

  if (
    branding.popoverForeground &&
    typeof branding.popoverForeground === "string"
  ) {
    tokens["--popover-foreground"] = sanitizeCSSValue(
      branding.popoverForeground
    );
  }

  if (branding.muted && typeof branding.muted === "string") {
    tokens["--muted"] = sanitizeCSSValue(branding.muted);
  }

  if (
    branding.mutedForeground &&
    typeof branding.mutedForeground === "string"
  ) {
    tokens["--muted-foreground"] = sanitizeCSSValue(branding.mutedForeground);
  }

  if (branding.accent && typeof branding.accent === "string") {
    tokens["--accent"] = sanitizeCSSValue(branding.accent);
  }

  if (
    branding.accentForeground &&
    typeof branding.accentForeground === "string"
  ) {
    tokens["--accent-foreground"] = sanitizeCSSValue(branding.accentForeground);
  }

  if (branding.destructive && typeof branding.destructive === "string") {
    tokens["--destructive"] = sanitizeCSSValue(branding.destructive);
  }

  if (
    branding.destructiveForeground &&
    typeof branding.destructiveForeground === "string"
  ) {
    tokens["--destructive-foreground"] = sanitizeCSSValue(
      branding.destructiveForeground
    );
  }

  if (branding.border && typeof branding.border === "string") {
    tokens["--border"] = sanitizeCSSValue(branding.border);
  }

  if (branding.input && typeof branding.input === "string") {
    tokens["--input"] = sanitizeCSSValue(branding.input);
  }

  if (branding.ring && typeof branding.ring === "string") {
    tokens["--ring"] = sanitizeCSSValue(branding.ring);
  }

  if (branding.radius && typeof branding.radius === "string") {
    tokens["--radius"] = sanitizeCSSValue(branding.radius);
  }

  if (branding.navHeight && typeof branding.navHeight === "string") {
    tokens["--nav-height"] = sanitizeCSSValue(branding.navHeight);
  }

  return tokens;
}

export function generateFontCSS(branding: BrandingConfig | null): string {
  if (!branding) {
    return "";
  }

  let fontCSS = "";

  // Font families - map to variables expected by Tailwind config
  if (branding.fontFamilyBody && typeof branding.fontFamilyBody === "object") {
    const sanitizedFont = underscoresToSpaces(
      sanitizeCSSValue(branding.fontFamilyBody.fontFamily)
    );
    fontCSS += `  --font-family-body: ${sanitizedFont};\n`;
  }

  if (
    branding.fontFamilyHeading &&
    typeof branding.fontFamilyHeading === "object"
  ) {
    const sanitizedFont = underscoresToSpaces(
      sanitizeCSSValue(branding.fontFamilyHeading.fontFamily)
    );
    fontCSS += `  --font-family-heading: ${sanitizedFont};\n`;
  }

  if (branding.fontFamilyMono && typeof branding.fontFamilyMono === "object") {
    const sanitizedFont = underscoresToSpaces(
      sanitizeCSSValue(branding.fontFamilyMono.fontFamily)
    );
    fontCSS += `  --font-family-mono: ${sanitizedFont};\n`;
  }

  // Generate typography component classes
  fontCSS += generateTypographyClasses();

  return fontCSS;
}

function generateTypographyClasses(): string {
  return `
  
  /* Typography component classes */
  .navi-h1 {
    font-family: var(--font-family-heading);
    font-size: 2.25rem;
    line-height: 1.25;
    font-weight: 800;
  }
  
  .navi-h2 {
    font-family: var(--font-family-heading);
    font-size: 1.875rem;
    line-height: 1.25;
    font-weight: 600;
  }
  
  .navi-h3 {
    font-family: var(--font-family-heading);
    font-size: 1.5rem;
    line-height: 1.25;
    font-weight: 600;
  }
  
  .navi-h4 {
    font-family: var(--font-family-heading);
    font-size: 1.25rem;
    line-height: 1.25;
    font-weight: 500;
  }
  
  .navi-p {
    font-family: var(--font-family-body);
    font-size: 1rem;
    line-height: 1.625;
    font-weight: 400;
  }
  
  .navi-lead {
    font-family: var(--font-family-body);
    font-size: 1.25rem;
    line-height: 1.5;
    font-weight: 400;
  }
  
  .navi-large {
    font-family: var(--font-family-body);
    font-size: 1.125rem;
    line-height: 1.5;
    font-weight: 600;
  }
  
  .navi-small {
    font-family: var(--font-family-body);
    font-size: 0.875rem;
    line-height: 1.25;
    font-weight: 500;
  }
  
  .navi-muted {
    font-family: var(--font-family-body);
    font-size: 0.875rem;
    line-height: 1.5;
    font-weight: 400;
  }
  
  .navi-code {
    font-family: var(--font-family-mono);
    font-size: 0.875rem;
    line-height: 1.5;
    font-weight: 600;
  }
`;
}

export function generateInlineThemeStyle(
  branding: BrandingConfig | null
): string {
  const css = generateThemeCSS(branding);
  return `<style id="awell-theme">\n${css}\n</style>`;
}

/**
 * Get the favicon URL with proper fallback handling
 */
export function getFaviconUrl(branding: BrandingConfig | null): string {
  return branding?.faviconUrl || "/favicon-16x16.png";
}

/**
 * Detect favicon MIME type from URL extension
 */
export function getFaviconType(faviconUrl: string): string {
  // Extract pathname and remove query params/fragments
  const pathname = faviconUrl.split("?")[0].split("#")[0];
  const extension = pathname.split(".").pop()?.toLowerCase();

  switch (extension) {
    case "ico":
      return "image/x-icon";
    case "png":
      return "image/png";
    case "svg":
      return "image/svg+xml";
    case "jpg":
    case "jpeg":
      return "image/jpeg";
    case "gif":
      return "image/gif";
    default:
      return "image/x-icon"; // Default fallback
  }
}

/**
 * Generate favicon HTML link tag with proper type detection
 */
export function generateFaviconHTML(branding: BrandingConfig | null): string {
  const faviconUrl = getFaviconUrl(branding);
  const faviconType = getFaviconType(faviconUrl);

  return `<link rel="icon" type="${faviconType}" href="${faviconUrl}">`;
}

function underscoresToSpaces(fontFamily: string): string {
  return JSON.stringify(fontFamily.replace(/_/g, " "));
}
