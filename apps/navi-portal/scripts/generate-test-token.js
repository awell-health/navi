#!/usr/bin/env node

// Helper script to generate test tokens for the magic link functionality
// ⚠️  NOTE: This script still uses stub encryption because it's a plain JS script
// For production token generation, use the secure TypeScript functions in src/lib/token
// Or create tokens via the test-magic-link page which uses real encryption

console.log(
  "⚠️  WARNING: This script uses legacy stub encryption for compatibility"
);
console.log(
  "   For production-grade tokens, use the test-magic-link page instead"
);
console.log("   Visit: http://localhost:3000/test-magic-link\n");

const STUB_SECRET = "magic-link-secret-key-256bit-stub";

function createStubToken(payload) {
  try {
    const jsonPayload = JSON.stringify(payload);

    // Simple XOR encrypt with secret (same as route implementation)
    let encrypted = "";
    for (let i = 0; i < jsonPayload.length; i++) {
      encrypted += String.fromCharCode(
        jsonPayload.charCodeAt(i) ^
          STUB_SECRET.charCodeAt(i % STUB_SECRET.length)
      );
    }

    // Encode as base64
    return Buffer.from(encrypted, "binary").toString("base64");
  } catch (error) {
    throw new Error("Failed to create test token");
  }
}

// Generate test tokens
console.log("🔗 Magic Link Test Tokens\n");

// Valid token (expires in 5 minutes)
const validPayload = {
  patientId: "patient123",
  careflowId: "careflow456",
  orgId: "org123",
  tenantId: "tenant123",
  environment: "test",
  exp: Date.now() + 5 * 60 * 1000, // 5 minutes from now
};
const validToken = createStubToken(validPayload);
console.log("✅ Valid Token (expires in 5 minutes):");
console.log(`   http://localhost:3000/magic?token=${validToken}`);
console.log(`   Token: ${validToken}\n`);

// Expired token
const expiredPayload = {
  patientId: "patient456",
  careflowId: "careflow789",
  orgId: "org123",
  tenantId: "tenant123",
  environment: "test",
  exp: Date.now() - 1000, // 1 second ago
};
const expiredToken = createStubToken(expiredPayload);
console.log("❌ Expired Token (should return 400):");
console.log(`   http://localhost:3000/magic?token=${expiredToken}`);
console.log(`   Token: ${expiredToken}\n`);

console.log("🧪 Test invalid token:");
console.log("   http://localhost:3000/magic?token=invalid-token-here\n");

console.log("📝 Usage:");
console.log("   1. Start the dev server: pnpm dev");
console.log("   2. Visit the valid token URL above");
console.log("   3. Check browser cookies and network tab");
console.log("   4. Try the expired/invalid tokens to see 400 responses");
