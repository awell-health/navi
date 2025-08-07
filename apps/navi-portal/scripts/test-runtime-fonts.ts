/**
 * Test script for runtime font assignment
 */

import { BrandingStore } from "../src/lib/branding/storage/kv-store";
import { getOrgFontSetup } from "../src/lib/branding/fonts/runtime-fonts";

async function testRuntimeFonts() {
  console.log("🧪 Testing runtime font assignment...");

  try {
    // Get some branding configurations to test with
    const brandingStore = new BrandingStore();
    const allBranding = await brandingStore.getAllBranding();

    // Test with actual org IDs from branding store
    const orgIds = Object.keys(allBranding);

    for (const orgId of orgIds) {
      console.log(`\n📋 Testing org: ${orgId}`);

      const result = await getOrgFontSetup(orgId);

      console.log("CSS class names:", result.classNames);
      console.log("CSS assignments:", result.cssAssignments);
      console.log("Has font setup:", !!result.classNames);
    }

    // Test with missing org (fallback)
    console.log("\n📋 Testing with missing org (fallback)");
    const fallbackResult = await getOrgFontSetup("non-existent-org");
    console.log("Fallback assignments:", fallbackResult.cssAssignments);
    console.log("Fallback class names:", fallbackResult.classNames);

    console.log("\n✅ Runtime font test completed successfully!");
  } catch (error) {
    console.error("❌ Runtime font test failed:", error);
    process.exit(1);
  }
}

// Run the test
testRuntimeFonts();
