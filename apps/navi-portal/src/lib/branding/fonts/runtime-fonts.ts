/**
 * Runtime font assignment system
 * Takes branding configuration and assigns fonts to CSS custom properties
 */

import { orgFontMap } from "./generated/dynamic-fonts";

/**
 * Get font configuration for an organization
 */
export function getOrgFonts(orgId: string): {
  variables: string;
  cssAssignments: Record<string, string>;
} | null {
  return orgFontMap[orgId as keyof typeof orgFontMap] || null;
}

/**
 * Apply CSS custom properties for an organization
 */
export function applyOrgFonts(
  orgId: string,
  element: HTMLElement = document.documentElement
): boolean {
  const orgFonts = getOrgFonts(orgId);

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
 * Get CSS class names for an organization's fonts
 */
export function getOrgFontClassNames(orgId: string): string {
  const orgFonts = getOrgFonts(orgId);
  return orgFonts?.variables || "";
}

/**
 * Main function: Get complete font setup for an organization
 */
export function getOrgFontSetup(orgId: string): {
  classNames: string;
  cssAssignments: Record<string, string>;
  applyStyles: (element?: HTMLElement) => boolean;
} {
  const orgFonts = getOrgFonts(orgId);

  if (!orgFonts) {
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
    classNames: orgFonts.variables,
    cssAssignments: orgFonts.cssAssignments,
    applyStyles: (element?: HTMLElement) => applyOrgFonts(orgId, element),
  };
}
