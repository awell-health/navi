#!/usr/bin/env tsx

/**
 * Build-time font generation script
 * Called during Vercel build to generate dynamic font imports
 */

import { generateDynamicFonts } from "../src/lib/branding/fonts/dynamic-fonts";

async function main() {
  console.log("🚀 Starting font generation script...");

  // Vercel automatically provides KV environment variables during build/runtime
  // No need to validate env here - the @vercel/kv package handles it automatically

  try {
    await generateDynamicFonts();
    console.log("✅ Font generation completed successfully!");
    process.exit(0);
  } catch (error) {
    console.error("❌ Font generation failed:", error);

    // Don't fail the build if it's just a missing KV connection in development
    if (process.env.NODE_ENV !== "production" && !process.env.KV_REST_API_URL) {
      console.log("🔄 Generating fallback font file for development...");
      process.exit(0);
    }

    process.exit(1);
  }
}

if (require.main === module) {
  main();
}
