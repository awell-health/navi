import { BrandingStore } from "../storage/kv-store";
import fs from "fs/promises";
import path from "path";
import {
  validateFontConfig,
  getGoogleFontsCount,
} from "./google-fonts-validator";
import { FontConfig } from "@awell-health/navi-core";

/**
 * Build-time dynamic font generation system
 * Scans all branding configs from KV store and generates font imports
 */

const GENERATED_FONTS_DIR = path.join(
  process.cwd(),
  "src/lib/branding/fonts/generated"
);
const GENERATED_FONTS_FILE = path.join(GENERATED_FONTS_DIR, "dynamic-fonts.ts");

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
 * Generate TypeScript code for unique font instances and org mapping
 */
function generateFontCode(
  uniqueFonts: UniqueFontInstance[],
  orgFontMap: Record<string, { body?: string; heading?: string; mono?: string }>
): string {
  if (uniqueFonts.length === 0) {
    return [
      "/**",
      " * AUTO-GENERATED FILE - NO FONTS FOUND",
      ` * Generated on: ${new Date().toISOString()}`,
      " */",
      "",
      "export const orgFontMap = {};",
    ].join("\n");
  }

  // Generate imports
  const uniqueImports = new Set<string>();
  uniqueFonts.forEach((font) => {
    uniqueImports.add(`import { ${font.importName} } from 'next/font/google';`);
  });

  // Generate font declarations with error handling
  const fontDeclarations = uniqueFonts
    .map((font) => {
      try {
        // Handle weight parameter - 'variable' should be a string, arrays should stay as arrays
        let weightParam;
        if (
          Array.isArray(font.weight) &&
          font.weight.length === 1 &&
          font.weight[0] === "variable"
        ) {
          weightParam = '"variable"';
        } else {
          weightParam = JSON.stringify(font.weight);
        }

        // Validate font configuration before generating
        if (!font.varName || !font.importName || !font.cssVariable) {
          console.error(`❌ Invalid font configuration:`, font);
          return `// Error: Invalid font configuration for ${font.fontFamily}`;
        }

        return `// eslint-disable-next-line @typescript-eslint/no-unused-vars -- Used in orgFontMap
const ${font.varName} = ${font.importName}({
  subsets: ['latin'],
  weight: ${weightParam},
  style: ${JSON.stringify(font.style)},
  display: 'swap',
  variable: '${font.cssVariable}',
});`;
      } catch (error) {
        console.error(
          `❌ Error generating font declaration for ${font.fontFamily}:`,
          error
        );
        return `// Error generating font: ${font.fontFamily}`;
      }
    })
    .join("\n\n");

  // Generate org font map with CSS assignments and error handling
  const orgEntries = Object.entries(orgFontMap).map(([orgId, fonts]) => {
    try {
      const fontVars = Object.values(fonts).join(" ");
      const cssAssignments = {
        "--font-body": fonts.body
          ? `var(${fonts.body})`
          : "system-ui, sans-serif",
        "--font-heading": fonts.heading
          ? `var(${fonts.heading})`
          : "system-ui, sans-serif",
        "--font-mono": fonts.mono
          ? `var(${fonts.mono})`
          : "ui-monospace, monospace",
      };

      return `  '${orgId}': {
    variables: '${fontVars}',
    cssAssignments: ${JSON.stringify(cssAssignments, null, 2).replace(
      /^/gm,
      "    "
    )}
  },`;
    } catch (error) {
      console.error(
        `❌ Error generating font mapping for org ${orgId}:`,
        error
      );
      return `  // Error: Could not generate mapping for org ${orgId}`;
    }
  });

  return [
    "/**",
    " * AUTO-GENERATED FILE - DO NOT EDIT MANUALLY",
    " * Generated at build time based on all branding configurations",
    " * Each unique font configuration gets its own CSS variable",
    ` * Generated on: ${new Date().toISOString()}`,
    ` * Unique fonts: ${uniqueFonts.length}`,
    ` * Organizations: ${Object.keys(orgFontMap).length}`,
    " */",
    "",
    ...Array.from(uniqueImports),
    "",
    fontDeclarations,
    "",
    "// Organization-specific font mapping",
    "export const orgFontMap = {",
    ...orgEntries,
    "};",
    "",
    "export default orgFontMap;",
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

    // Generate TypeScript file with org-specific font mapping
    const fontCode = generateFontCode(uniqueFonts, orgFontMap);

    // Ensure directory exists
    await fs.mkdir(GENERATED_FONTS_DIR, { recursive: true });

    // Write generated file
    await fs.writeFile(GENERATED_FONTS_FILE, fontCode, "utf-8");

    console.log("✅ Dynamic fonts generated successfully!");
    console.log(`📁 Generated file: ${GENERATED_FONTS_FILE}`);
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

    // Generate fallback file to prevent build failures
    const fallbackContent = [
      "/**",
      " * FALLBACK FONT FILE - Generated due to error",
      ` * Error: ${error instanceof Error ? error.message : "Unknown error"}`,
      ` * Generated on: ${new Date().toISOString()}`,
      " */",
      "",
      "export const orgFontMap = {};",
    ].join("\n");

    await fs.mkdir(GENERATED_FONTS_DIR, { recursive: true });
    await fs.writeFile(GENERATED_FONTS_FILE, fallbackContent, "utf-8");

    console.log("🔄 Generated fallback font file");
  }
}

/**
 * Load generated font functions for runtime use
 */
export async function loadGeneratedFonts(): Promise<
  Record<string, { variables: string; cssAssignments: Record<string, string> }>
> {
  try {
    const fontModule = await import("./generated/dynamic-fonts");
    return fontModule.orgFontMap || {};
  } catch (error) {
    console.warn("⚠️ Failed to load generated fonts, using fallback:", error);
    return {};
  }
}
