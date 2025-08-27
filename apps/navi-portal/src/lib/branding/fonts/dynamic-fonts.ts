
import { BrandingStore } from "../storage/kv-store";
import {
  validateFontConfig,
  getGoogleFontsCount,
} from "./google-fonts-validator";

let fs: any;
let path: any;
let FontConfig: any;

try {
  fs = await import("fs/promises");
  path = await import("path");
  const naviCore = await import("@awell-health/navi-core");
  FontConfig = naviCore.FontConfig;
} catch (error) {
  // Fallback for build environments where these modules aren't available
  console.warn("Some modules not available, using fallbacks:", error);
}

/**
 * Build-time dynamic font generation system
 * Scans all branding configs from KV store and generates font imports
 */

const GENERATED_FONTS_DIR = path?.join?.(
  (globalThis as any).process?.cwd?.() || ".",
  "src/lib/branding/fonts/generated"
) || "src/lib/branding/fonts/generated";
const GENERATED_INDEX_FILE = path?.join?.(GENERATED_FONTS_DIR, "index.ts") || `${GENERATED_FONTS_DIR}/index.ts`;
const GENERATED_FALLBACK_FILE = path.join(GENERATED_FONTS_DIR, "fallback.ts");

// Font validation is now handled by the Google Fonts API validator module
// This provides access to all 1,800+ Google Fonts with complete metadata

interface UniqueFontInstance {
  fontFamily: string;
  weight: string[] | string;
  style: string[];
  importName: string;
  varName: string;
  cssVariable: string;
}

/**
 * Extract unique font configurations from all branding configs
 */
function extractUniqueFontConfigs(brandingConfigs: Record<string, unknown>): {
  uniqueFonts: UniqueFontInstance[];
  orgFontMap: Record<
    string,
    { body?: string; heading?: string; mono?: string }
  >;
} {
  const uniqueFontMap = new Map<string, UniqueFontInstance>();
  const orgFontMap: Record<
    string,
    { body?: string; heading?: string; mono?: string }
  > = {};

  Object.entries(brandingConfigs).forEach(([orgId, branding]) => {
    try {
      if (!branding) return;

      const orgFonts: { body?: string; heading?: string; mono?: string } = {};

      // Process each font type
      ["fontFamilyBody", "fontFamilyHeading", "fontFamilyMono"].forEach(
        (key: string) => {
          try {
            const fontConfig: FontConfig =
              branding[key as keyof typeof branding];
            if (!fontConfig || !fontConfig.fontFamily) return;

            // Use comprehensive validation from Google Fonts API
            const validation = validateFontConfig(
              fontConfig.fontFamily,
              fontConfig.weight,
              fontConfig.style
            );

            if (!validation.isValid) {
              console.error(
                `❌ [${orgId}] Font validation failed for ${key}:`,
                validation.errors
              );
              return;
            }

            // Log warnings for fallbacks
            if (validation.warnings.length > 0) {
              validation.warnings.forEach((warning) =>
                console.log(`⚠️ [${orgId}] ${warning}`)
              );
            }

            const { normalizedFontFamily, validatedWeights, validatedStyles } =
              validation;

            // Create unique key for this font configuration
            const weightKey = Array.isArray(validatedWeights)
              ? validatedWeights.join("-")
              : validatedWeights;
            const styleKey = validatedStyles.join("-");
            const uniqueKey = `${normalizedFontFamily}-${weightKey}-${styleKey}`;

            if (!uniqueFontMap.has(uniqueKey)) {
              const cleanName = normalizedFontFamily
                .replace(/\s+/g, "")
                .toLowerCase();
              const weightSuffix =
                weightKey === "variable"
                  ? "Variable"
                  : weightKey.replace(/[^a-zA-Z0-9]/g, "");

              uniqueFontMap.set(uniqueKey, {
                fontFamily: normalizedFontFamily,
                weight: validatedWeights,
                style: validatedStyles,
                importName: normalizedFontFamily.replace(/\s+/g, "_"),
                varName: `${cleanName}${weightSuffix}Font`,
                cssVariable: `--font-${cleanName}-${weightKey.replace(
                  /[^a-zA-Z0-9]/g,
                  "-"
                )}`,
              });
            }

            // Map org to this font for the appropriate type
            const fontType =
              key === "fontFamilyBody"
                ? "body"
                : key === "fontFamilyHeading"
                ? "heading"
                : "mono";
            orgFonts[fontType] = uniqueFontMap.get(uniqueKey)!.cssVariable;
          } catch (fontError) {
            console.error(
              `❌ [${orgId}] Error processing font ${key}:`,
              fontError
            );
            // Continue processing other fonts for this org
          }
        }
      );

      if (Object.keys(orgFonts).length > 0) {
        orgFontMap[orgId] = orgFonts;
        console.log(
          `✅ [${orgId}] Successfully processed ${
            Object.keys(orgFonts).length
          } font(s)`
        );
      } else {
        console.log(`⚠️ [${orgId}] No valid fonts found, skipping org`);
      }
    } catch (orgError) {
      console.error(`❌ [${orgId}] Error processing org branding:`, orgError);
      // Continue with next org
    }
  });

  return {
    uniqueFonts: Array.from(uniqueFontMap.values()),
    orgFontMap,
  };
}

/**
 * Generate Google Fonts URL for the given fonts
 */
function generateGoogleFontsUrl(fonts: UniqueFontInstance[]): string {
  if (fonts.length === 0) return "";

  const fontSpecs = fonts.map((font) => {
    const family = font.fontFamily.replace(/\s+/g, "+");

    // Handle weights - convert to Google Fonts format
    let weights = "";
    if (Array.isArray(font.weight)) {
      // Check if the array contains "variable"
      if (font.weight.includes("variable")) {
        // For variable fonts, use the typical range most variable fonts support
        weights = "100..900";
      } else {
        weights = font.weight.join(";");
      }
    } else if (font.weight === "variable") {
      // For variable fonts, use the typical range most variable fonts support
      weights = "100..900";
    } else {
      weights = font.weight;
    }

    // Handle styles
    const styles = font.style.join(",");
    const hasItalic = font.style.includes("italic");

    if (hasItalic && weights) {
      return `family=${family}:ital,wght@0,${weights};1,${weights}`;
    } else if (weights) {
      return `family=${family}:wght@${weights}`;
    } else {
      return `family=${family}`;
    }
  });

  return `https://fonts.googleapis.com/css2?${fontSpecs.join(
    "&"
  )}&display=swap`;
}

/**
 * Generate TypeScript code for a single organization's fonts (CSS-only approach)
 */
function generateOrgFontFile(
  orgId: string,
  orgFonts: { body?: string; heading?: string; mono?: string },
  orgUniqueFonts: UniqueFontInstance[]
): string {
  if (orgUniqueFonts.length === 0) {
    return [
      "/**",
      ` * AUTO-GENERATED ORG FONT FILE - ${orgId}`,
      " * No fonts configured for this organization",
      ` * Generated on: ${new Date().toISOString()}`,
      " */",
      "",
      "export const orgFontConfig = {",
      "  googleFontsUrl: '',",
      "  variables: '',",
      "  cssAssignments: {",
      "    '--font-body': 'system-ui, sans-serif',",
      "    '--font-heading': 'system-ui, sans-serif',",
      "    '--font-mono': 'ui-monospace, monospace',",
      "  },",
      "};",
      "",
      "export default orgFontConfig;",
    ].join("\n");
  }

  // Generate Google Fonts URL
  const googleFontsUrl = generateGoogleFontsUrl(orgUniqueFonts);

  // Generate CSS font-family values (no CSS variables, direct font names)
  const cssAssignments = {
    "--font-body": orgFonts.body
      ? `"${
          orgUniqueFonts.find((f) => f.cssVariable === orgFonts.body)
            ?.fontFamily || "system-ui"
        }", system-ui, sans-serif`
      : "system-ui, sans-serif",
    "--font-heading": orgFonts.heading
      ? `"${
          orgUniqueFonts.find((f) => f.cssVariable === orgFonts.heading)
            ?.fontFamily || "system-ui"
        }", system-ui, sans-serif`
      : "system-ui, sans-serif",
    "--font-mono": orgFonts.mono
      ? `"${
          orgUniqueFonts.find((f) => f.cssVariable === orgFonts.mono)
            ?.fontFamily || "ui-monospace"
        }", ui-monospace, monospace`
      : "ui-monospace, monospace",
  };

  return [
    "/**",
    ` * AUTO-GENERATED ORG FONT FILE - ${orgId}`,
    " * Contains only fonts used by this specific organization",
    " * Uses CSS-only Google Fonts loading to avoid Next.js preloading",
    ` * Generated on: ${new Date().toISOString()}`,
    ` * Fonts: ${orgUniqueFonts.map((f) => f.fontFamily).join(", ")}`,
    " */",
    "",
    "export const orgFontConfig = {",
    `  googleFontsUrl: '${googleFontsUrl}',`,
    "  variables: '',", // No CSS variables needed with this approach
    `  cssAssignments: ${JSON.stringify(cssAssignments, null, 2)},`,
    "};",
    "",
    "export default orgFontConfig;",
  ].join("\n");
}

/**
 * Generate the index file that exports the org registry
 */
function generateIndexFile(orgIds: string[]): string {
  return [
    "/**",
    " * AUTO-GENERATED FONT INDEX - DO NOT EDIT MANUALLY",
    " * Registry of available organization font files",
    ` * Generated on: ${new Date().toISOString()}`,
    ` * Organizations: ${orgIds.length}`,
    " */",
    "",
    "export interface OrgFontConfig {",
    "  googleFontsUrl: string;",
    "  variables: string;",
    "  cssAssignments: Record<string, string>;",
    "}",
    "",
    "// Available organization font files",
    "export const availableOrgs = new Set([",
    ...orgIds.map((orgId) => `  '${orgId}',`),
    "]);",
    "",
    "/**",
    " * Dynamically import font configuration for an organization",
    " */",
    "export async function loadOrgFonts(orgId: string): Promise<OrgFontConfig | null> {",
    "  if (!availableOrgs.has(orgId)) {",
    "    console.warn(`No font configuration found for organization: ${orgId}`);",
    "    return null;",
    "  }",
    "",
    "  try {",
    `    const fontModule = await import(\`./org-\${orgId}\`);`,
    "    return fontModule.orgFontConfig;",
    "  } catch (error) {",
    "    console.error(`Failed to load fonts for organization ${orgId}:`, error);",
    "    return null;",
    "  }",
    "}",
    "",
    "/**",
    " * Load fallback fonts for unknown organizations",
    " */",
    "export async function loadFallbackFonts(): Promise<OrgFontConfig> {",
    "  try {",
    "    const fallbackModule = await import('./fallback');",
    "    return fallbackModule.orgFontConfig;",
    "  } catch (error) {",
    "    console.error('Failed to load fallback fonts:', error);",
    "    return {",
    "      googleFontsUrl: '',",
    "      variables: '',",
    "      cssAssignments: {",
    "        '--font-body': 'system-ui, sans-serif',",
    "        '--font-heading': 'system-ui, sans-serif',",
    "        '--font-mono': 'ui-monospace, monospace',",
    "      },",
    "    };",
    "  }",
    "}",
  ].join("\n");
}

/**
 * Generate fallback font file
 */
function generateFallbackFile(): string {
  return [
    "/**",
    " * AUTO-GENERATED FALLBACK FONT FILE",
    " * Used when no organization-specific fonts are found",
    ` * Generated on: ${new Date().toISOString()}`,
    " */",
    "",
    "export const orgFontConfig = {",
    "  googleFontsUrl: '',",
    "  variables: '',",
    "  cssAssignments: {",
    "    '--font-body': 'system-ui, sans-serif',",
    "    '--font-heading': 'system-ui, sans-serif',",
    "    '--font-mono': 'ui-monospace, monospace',",
    "  },",
    "};",
    "",
    "export default orgFontConfig;",
  ].join("\n");
}

/**
 * Main build-time font generation function
 * Called during Vercel build process
 */
export async function generateDynamicFonts(): Promise<void> {
  console.log("🔤 Starting dynamic font generation...");

  let allBrandingConfigs = {};

  try {
    // Try to get all branding configurations from KV store
    console.log("🔍 Connecting to KV store...");
    const brandingStore = new BrandingStore();
    console.log("📡 Scanning for branding configurations...");
    allBrandingConfigs = await brandingStore.getAllBranding();
    console.log("✅ KV scan completed");

    if (Object.keys(allBrandingConfigs).length === 0) {
      console.log(
        "⚠️ No branding configurations found, generating empty font file"
      );
    }
  } catch {
    console.log(
      "⚠️ Unable to access KV store, generating empty font file for development"
    );
    console.log(
      "   This is normal for local development without KV credentials"
    );
  }

  try {
    // Extract unique font configurations and org mapping
    const { uniqueFonts, orgFontMap } =
      extractUniqueFontConfigs(allBrandingConfigs);

    console.log(`📝 Found ${uniqueFonts.length} unique font configurations`);
    console.log(`🏢 Mapped ${Object.keys(orgFontMap).length} organizations`);
    console.log(
      `🎨 Validated against ${getGoogleFontsCount()} available Google Fonts`
    );

    // Ensure directory exists
    await fs.mkdir(GENERATED_FONTS_DIR, { recursive: true });

    // Clean up old generated files
    try {
      const existingFiles = await fs.readdir(GENERATED_FONTS_DIR);
      const filesToDelete = existingFiles.filter(
        (file: string) => file.startsWith("org-") && file.endsWith(".ts")
      );
      await Promise.all(
        filesToDelete.map((file: string) =>
          fs?.unlink?.(path?.join?.(GENERATED_FONTS_DIR, file) || `${GENERATED_FONTS_DIR}/${file}`)?.catch?.(() => {})
        )
      );
    } catch {
      // Directory might not exist yet, that's okay
    }

    // Create a map from unique font key to font instance for lookup
    const uniqueFontLookup = new Map<string, UniqueFontInstance>();
    uniqueFonts.forEach((font) => {
      const key = `${font.fontFamily}-${
        Array.isArray(font.weight) ? font.weight.join("-") : font.weight
      }-${font.style.join("-")}`;
      uniqueFontLookup.set(key, font);
    });

    // Generate individual files for each organization
    const orgIds = Object.keys(orgFontMap);
    const fileGenerationPromises = orgIds.map(async (orgId) => {
      try {
        const orgFonts = orgFontMap[orgId];

        // Find the unique font instances used by this org
        const orgUniqueFonts: UniqueFontInstance[] = [];
        Object.values(orgFonts).forEach((cssVar) => {
          const matchingFont = uniqueFonts.find(
            (font) => font.cssVariable === cssVar
          );
          if (
            matchingFont &&
            !orgUniqueFonts.some(
              (f) => f.cssVariable === matchingFont.cssVariable
            )
          ) {
            orgUniqueFonts.push(matchingFont);
          }
        });

        const orgFontCode = generateOrgFontFile(
          orgId,
          orgFonts,
          orgUniqueFonts
        );
        const orgFilePath = path.join(GENERATED_FONTS_DIR, `org-${orgId}.ts`);

        await fs.writeFile(orgFilePath, orgFontCode, "utf-8");
        console.log(
          `✅ Generated font file for org: ${orgId} (${orgUniqueFonts.length} fonts)`
        );

        return orgId;
      } catch (error) {
        console.error(
          `❌ Failed to generate font file for org ${orgId}:`,
          error
        );
        return null;
      }
    });

    const generatedOrgIds = (await Promise.all(fileGenerationPromises)).filter(
      (orgId): orgId is string => orgId !== null
    );

    // Generate index file with registry
    const indexCode = generateIndexFile(generatedOrgIds);
    await fs.writeFile(GENERATED_INDEX_FILE, indexCode, "utf-8");

    // Generate fallback file
    const fallbackCode = generateFallbackFile();
    await fs.writeFile(GENERATED_FALLBACK_FILE, fallbackCode, "utf-8");

    console.log("✅ Dynamic font system generated successfully!");
    console.log(`📁 Generated files:`);
    console.log(`   - Index: ${GENERATED_INDEX_FILE}`);
    console.log(`   - Fallback: ${GENERATED_FALLBACK_FILE}`);
    console.log(`   - Organizations: ${generatedOrgIds.length} files`);
    console.log(
      `🔤 Unique fonts: ${uniqueFonts.map((f) => f.fontFamily).join(", ")}`
    );

    // Update font registry in KV store (skip if no KV access)
    try {
      const brandingStore = new BrandingStore();
      const fontNames = uniqueFonts.map((f) => f.fontFamily);
      await brandingStore.updateFontRegistry(fontNames);
      console.log(`💾 Updated font registry with ${fontNames.length} fonts`);
    } catch {
      console.log("⚠️ Skipping font registry update (no KV access)");
    }
  } catch (error) {
    console.error("❌ Failed to generate dynamic fonts:", error);

    // Ensure directory exists for fallback
    await fs.mkdir(GENERATED_FONTS_DIR, { recursive: true });

    // Generate minimal fallback files to prevent build failures
    const fallbackIndexContent = [
      "/**",
      " * FALLBACK FONT INDEX - Generated due to error",
      ` * Error: ${error instanceof Error ? error.message : "Unknown error"}`,
      ` * Generated on: ${new Date().toISOString()}`,
      " */",
      "",
      "export interface OrgFontConfig {",
      "  googleFontsUrl: string;",
      "  variables: string;",
      "  cssAssignments: Record<string, string>;",
      "}",
      "",
      "export const availableOrgs = new Set<string>();",
      "",
      "export async function loadOrgFonts(): Promise<OrgFontConfig | null> {",
      "  return null;",
      "}",
      "",
      "export async function loadFallbackFonts(): Promise<OrgFontConfig> {",
      "  return {",
      "    googleFontsUrl: '',",
      "    variables: '',",
      "    cssAssignments: {",
      "      '--font-body': 'system-ui, sans-serif',",
      "      '--font-heading': 'system-ui, sans-serif',",
      "      '--font-mono': 'ui-monospace, monospace',",
      "    },",
      "  };",
      "}",
    ].join("\n");

    const fallbackOrgContent = generateFallbackFile();

    await fs.writeFile(GENERATED_INDEX_FILE, fallbackIndexContent, "utf-8");
    await fs.writeFile(GENERATED_FALLBACK_FILE, fallbackOrgContent, "utf-8");

    console.log("🔄 Generated fallback font files");
  }
}

/**
 * Load font configuration for a specific organization
 */
export async function loadOrgFontConfig(orgId: string): Promise<{
  googleFontsUrl: string;
  variables: string;
  cssAssignments: Record<string, string>;
} | null> {
  try {
    const generatedModule = await import("./generated/index").catch(() => null);
    if (!generatedModule) {
      return null;
    }
    const { loadOrgFonts, loadFallbackFonts } = generatedModule;

    // Try to load org-specific fonts first
    const orgFonts = await loadOrgFonts(orgId);
    if (orgFonts) {
      return orgFonts;
    }

    // Fallback to default fonts
    console.warn(
      `No fonts found for organization ${orgId}, using fallback fonts`
    );
    return await loadFallbackFonts();
  } catch (error) {
    console.warn(
      "⚠️ Failed to load font system, using system defaults:",
      error
    );
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
}

/**
 * @deprecated Use loadOrgFontConfig instead
 * Legacy function for backward compatibility
 */
export async function loadGeneratedFonts(): Promise<
  Record<string, { variables: string; cssAssignments: Record<string, string> }>
> {
  console.warn(
    "loadGeneratedFonts is deprecated, use loadOrgFontConfig instead"
  );
  return {};
}
