/**
 * Runtime font assignment system
 * Takes branding configuration and assigns fonts to CSS custom properties
 * Now uses dynamic imports for per-organization font loading
 */

import { loadOrgFontConfig } from "./dynamic-fonts";

// Cache for loaded font configurations to avoid repeated imports
const fontCache = new Map<
  string,
  { variables: string; cssAssignments: Record<string, string> }
>();

/**
 * Get font configuration for an organization (async)
 */
export async function getOrgFonts(orgId: string): Promise<{
  variables: string;
  cssAssignments: Record<string, string>;
} | null> {
  // Check cache first
  if (fontCache.has(orgId)) {
    return fontCache.get(orgId)!;
  }

  // Load font configuration dynamically
  const fontConfig = await loadOrgFontConfig(orgId);

  if (fontConfig) {
    // Cache the result
    fontCache.set(orgId, fontConfig);
    return fontConfig;
  }

  return null;
}

/**
 * Synchronous version for backward compatibility (deprecated)
 * @deprecated Use getOrgFonts instead
 */
export function getOrgFontsSync(orgId: string): {
  variables: string;
  cssAssignments: Record<string, string>;
} | null {
  console.warn("getOrgFontsSync is deprecated and will not load dynamic fonts");
  return fontCache.get(orgId) || null;
}

/**
 * Apply CSS custom properties for an organization (async)
 */
export async function applyOrgFonts(
  orgId: string,
  element: HTMLElement = document.documentElement
): Promise<boolean> {
  const orgFonts = await getOrgFonts(orgId);

  if (!orgFonts) {
    console.warn(`No font configuration found for organization: ${orgId}`);
    return false;
  }

  // Apply CSS custom properties
  Object.entries(orgFonts.cssAssignments).forEach(([property, value]) => {
    element.style.setProperty(property, value);
  });

  return true;
}

/**
 * Get CSS class names for an organization's fonts (async)
 */
export async function getOrgFontClassNames(orgId: string): Promise<string> {
  const orgFonts = await getOrgFonts(orgId);
  return orgFonts?.variables || "";
}

/**
 * Get CSS class names synchronously (deprecated)
 * @deprecated Use getOrgFontClassNames instead
 */
export function getOrgFontClassNamesSync(orgId: string): string {
  console.warn(
    "getOrgFontClassNamesSync is deprecated and will not load dynamic fonts"
  );
  const cachedFonts = fontCache.get(orgId);
  return cachedFonts?.variables || "";
}

/**
 * Main function: Get complete font setup for an organization (async)
 */
export async function getOrgFontSetup(orgId: string): Promise<{
  classNames: string;
  cssAssignments: Record<string, string>;
  applyStyles: (element?: HTMLElement) => Promise<boolean>;
}> {
  const orgFonts = await getOrgFonts(orgId);

  if (!orgFonts) {
    return {
      classNames: "",
      cssAssignments: {
        "--font-body": "system-ui, sans-serif",
        "--font-heading": "system-ui, sans-serif",
        "--font-mono": "ui-monospace, monospace",
      },
      applyStyles: async () => false,
    };
  }

  return {
    classNames: orgFonts.variables,
    cssAssignments: orgFonts.cssAssignments,
    applyStyles: async (element?: HTMLElement) => applyOrgFonts(orgId, element),
  };
}

/**
 * Synchronous version for backward compatibility (deprecated)
 * @deprecated Use getOrgFontSetup instead
 */
export function getOrgFontSetupSync(orgId: string): {
  classNames: string;
  cssAssignments: Record<string, string>;
  applyStyles: (element?: HTMLElement) => boolean;
} {
  console.warn(
    "getOrgFontSetupSync is deprecated and will not load dynamic fonts"
  );
  const cachedFonts = fontCache.get(orgId);

  if (!cachedFonts) {
    return {
      classNames: "",
      cssAssignments: {
        "--font-body": "system-ui, sans-serif",
        "--font-heading": "system-ui, sans-serif",
        "--font-mono": "ui-monospace, monospace",
      },
      applyStyles: () => false,
    };
  }

  return {
    classNames: cachedFonts.variables,
    cssAssignments: cachedFonts.cssAssignments,
    applyStyles: (element?: HTMLElement) => {
      if (element) {
        Object.entries(cachedFonts.cssAssignments).forEach(
          ([property, value]) => {
            element.style.setProperty(property, value);
          }
        );
        return true;
      }
      return false;
    },
  };
}
