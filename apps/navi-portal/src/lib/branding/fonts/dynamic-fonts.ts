/**
 * Font generation system is disabled to prevent Vercel build failures
 * This module provides minimal fallback implementations
 */

console.log("⚠️ Font generation system is disabled to prevent build failures");

/**
 * Disabled font generation function - provides no-op implementation
 */
export async function generateDynamicFonts(): Promise<void> {
  console.log("🚫 Font generation is disabled to prevent build failures");
  return;
}

/**
 * Load font configuration for a specific organization - disabled implementation
 */
export async function loadOrgFontConfig(orgId: string): Promise<{
  googleFontsUrl: string;
  variables: string;
  cssAssignments: Record<string, string>;
} | null> {
  console.log(`Loading fallback fonts for org: ${orgId} (font generation disabled)`);
  return {
    googleFontsUrl: "",
    variables: "",
    cssAssignments: {
      "--font-body": "system-ui, sans-serif",
      "--font-heading": "system-ui, sans-serif",
      "--font-mono": "ui-monospace, monospace",
    },
  };
}

/**
 * @deprecated Use loadOrgFontConfig instead
 * Legacy function for backward compatibility - disabled implementation
 */
export async function loadGeneratedFonts(): Promise<
  Record<string, { variables: string; cssAssignments: Record<string, string> }>
> {
  console.warn(
    "loadGeneratedFonts is deprecated, use loadOrgFontConfig instead (font generation disabled)"
  );
  return {};
}
