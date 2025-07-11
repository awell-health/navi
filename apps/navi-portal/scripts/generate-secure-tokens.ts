#!/usr/bin/env tsx

import { createSessionToken } from "../src/lib/auth/internal/session";
import type {
  TokenEnvironment,
  SessionTokenData,
} from "../src/lib/auth/internal/types";

/**
 * Generate test tokens using secure AES-GCM encryption
 * This script uses the same encryption as the production system
 */

async function generateSecureTokens(environment: TokenEnvironment = "test") {
  console.log("🎨 Branding & Theming Test Tokens (AES-GCM 256)\n");
  const thirtyDaysFromNow = Date.now() + 30 * 24 * 60 * 60 * 1000;
  try {
    // Sunrise Health - Bright, friendly healthcare
    const sunrisePayload: SessionTokenData = {
      patientId: "Eh4UQbKZKBk6hKd0M7wKk",
      careflowId: "GeDg7fJmddZi",
      orgId: "sunrise-health",
      tenantId: "_v0nvLX5zCNd",
      environment: "development",
      exp: thirtyDaysFromNow,
    };

    const sunriseToken = await createSessionToken(sunrisePayload);
    console.log("🌅 SUNRISE HEALTH - Bright & Friendly Theme");
    console.log("   Colors: Orange primary, light backgrounds");
    console.log("   Fonts: Inter + Poppins (web fonts)");
    console.log("   Style: Warm, approachable healthcare");
    console.log(`   🔗 http://localhost:3000/magic?token=${sunriseToken}`);
    console.log(`   Token: ${sunriseToken}\n`);

    // TechCorp - Dark, professional tech
    const techCorpPayload: SessionTokenData = {
      patientId: "Eh4UQbKZKBk6hKd0M7wKk",
      careflowId: "NX9Hw12TBclt",
      orgId: "techcorp",
      tenantId: "_v0nvLX5zCNd",
      environment: "development",
      exp: thirtyDaysFromNow,
    };

    const techCorpToken = await createSessionToken(techCorpPayload);
    console.log("🏢 TECHCORP SYSTEMS - Dark & Professional Theme");
    console.log("   Colors: Dark navy/slate, indigo accents");
    console.log("   Fonts: JetBrains Mono + Inter (monospace body)");
    console.log("   Style: Technical, modern, enterprise");
    console.log(`   🔗 http://localhost:3000/magic?token=${techCorpToken}`);
    console.log(`   Token: ${techCorpToken}\n`);

    // Default/ baker-pro-local org
    const defaultPayload: SessionTokenData = {
      patientId: "TEYwU35Vr08pZx2IghLjR",
      careflowId: "Nsfa0TYNqgDG",
      orgId: "baker-pro-local",
      tenantId: "h1TcvWEcVCU7",
      environment: "development",
      exp: thirtyDaysFromNow, // 5 minutes from now
    };

    const defaultToken = await createSessionToken(defaultPayload);
    console.log("🔧 DEFAULT FALLBACK - Awell Default Theme");
    console.log("   Colors: Blue primary, clean neutrals");
    console.log("   Fonts: System fonts");
    console.log("   Style: Default when org branding not found");
    console.log(`   🔗 http://localhost:3000/magic?token=${defaultToken}`);
    console.log(`   Token: ${defaultToken}\n`);

    // Expired token for error testing
    const expiredPayload: SessionTokenData = {
      patientId: "patient_expired",
      careflowId: "flow_expired",
      orgId: "sunrise-health",
      tenantId: "expired_tenant",
      environment,
      exp: Date.now() - 1000, // 1 second ago
    };

    const expiredToken = await createSessionToken(expiredPayload);
    console.log("❌ EXPIRED TOKEN (should return 400):");
    console.log(`   http://localhost:3000/magic?token=${expiredToken}`);
    console.log(`   Token: ${expiredToken}\n`);

    console.log("🧪 INVALID TOKEN TEST:");
    console.log("   http://localhost:3000/magic?token=invalid-token-here\n");

    console.log("📝 TESTING GUIDE:");
    console.log("   1. Start dev server: pnpm dev");
    console.log(
      "   2. Visit each themed URL above to see dramatic differences"
    );
    console.log("   3. Compare: Orange vs Dark themes, different fonts");
    console.log("   4. Check DevTools for inlined CSS variables");
    console.log("   5. Try expired/invalid tokens for error handling");
    console.log("\n🎨 THEME COMPARISON:");
    console.log("   Sunrise: Bright orange, Inter/Poppins fonts, friendly");
    console.log("   TechCorp: Dark navy, JetBrains Mono, professional");
    console.log("   Default: Clean blue, system fonts, neutral");
    console.log("\n🔐 SECURITY FEATURES:");
    console.log("   ✓ AES-GCM 256 encryption");
    console.log("   ✓ Random 96-bit IVs");
    console.log("   ✓ Authenticated encryption");
    console.log("   ✓ Same encryption as production");
  } catch (error) {
    console.error("❌ Failed to generate secure tokens:", error);
    console.error(
      "\n💡 Make sure you have the required environment variables:"
    );
    console.error("   JWT_SIGNING_KEY and TOKEN_ENCRYPTION_KEY");
    console.error("   Run: node scripts/generate-keys.js to create them");
    console.error("\n📋 Current environment check:");
    console.error("   NODE_ENV:", process.env.NODE_ENV || "undefined");
    console.error(
      "   TOKEN_ENCRYPTION_KEY:",
      process.env.TOKEN_ENCRYPTION_KEY ? "SET" : "MISSING"
    );
    console.error(
      "   JWT_SIGNING_KEY:",
      process.env.JWT_SIGNING_KEY ? "SET" : "MISSING"
    );
    process.exit(1);
  }
}

// Run the script
generateSecureTokens();
