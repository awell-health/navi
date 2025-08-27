#!/usr/bin/env tsx

/**
 * Build-time font generation script
 * Called during Vercel build to generate dynamic font imports
 */

import { generateDynamicFonts } from "../src/lib/branding/fonts/dynamic-fonts";

async function main() {
  console.log("Running in NODE_ENV:", (globalThis as any).process?.env?.NODE_ENV);
  if (!(globalThis as any).process?.env?.NODE_ENV) {
    try {
      const { config } = await import("dotenv");
      config({ path: ".env.local" });
    } catch {
    }
  }
  console.log("🚀 Starting font generation script...");

  // Vercel automatically provides KV environment variables during build/runtime
  // No need to validate env here - the @vercel/kv package handles it automatically

  try {
    await generateDynamicFonts();
    console.log("✅ Font generation completed successfully!");
    (globalThis as any).process?.exit?.(0);
  } catch (error: any) {
    console.error("❌ Font generation failed:", error);

    // Don't fail the build if it's just a missing dependency or workspace resolution issue
    const isProduction = (globalThis as any).process?.env?.NODE_ENV === "production";
    const hasKvUrl = !!(globalThis as any).process?.env?.KV_REST_API_URL;
    const isModuleError = error?.message?.includes?.("Cannot find module");
    
    if (!isProduction && (!hasKvUrl || isModuleError)) {
      console.log("🔄 Generating fallback font file for development...");
      (globalThis as any).process?.exit?.(0);
      return;
    }

    (globalThis as any).process?.exit?.(1);
  }
}

if (typeof require !== "undefined" && (require as any).main === module) {
  main();
} else if (typeof import.meta !== "undefined" && import.meta.url === `file://${(globalThis as any).process?.argv?.[1]}`)) {
  main();
}
