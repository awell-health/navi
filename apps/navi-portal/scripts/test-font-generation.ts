#!/usr/bin/env tsx

/**
 * Test script for font generation
 * Tests the dynamic font system with existing branding data
 */

import {
  generateDynamicFonts,
  loadGeneratedFonts,
} from "../src/lib/branding/fonts/dynamic-fonts";
import { BrandingStore } from "../src/lib/branding/storage/kv-store";

async function main() {
  console.log("🧪 Testing font generation with existing branding data...");
  try {
    // First, let's see what branding data we have
    const brandingStore = new BrandingStore();
    const allBranding = await brandingStore.getAllBranding();

    console.log(
      `📊 Found ${Object.keys(allBranding).length} branding configurations:`
    );
    Object.entries(allBranding).forEach(([orgId, branding]) => {
      const fonts = {
        body: branding.fontFamilyBody,
        heading: branding.fontFamilyHeading,
        mono: branding.fontFamilyMono,
      };
      console.log(`  - ${orgId}:`, fonts);
    });

    // Generate fonts
    console.log("\n🔤 Generating dynamic fonts...");
    await generateDynamicFonts();

    // Test loading generated fonts
    console.log("\n📦 Testing font loading...");
    const generatedFonts = await loadGeneratedFonts();
    console.log("Font map keys:", Object.keys(generatedFonts));

    // Show font registry in KV
    const fontRegistry = await brandingStore.getFontRegistry();
    console.log("\n📝 Font registry in KV store:", fontRegistry);

    console.log("\n✅ Font generation test completed successfully!");
  } catch (error) {
    console.error("❌ Font generation test failed:", error);
    process.exit(1);
  }
}

if (require.main === module) {
  main();
}
