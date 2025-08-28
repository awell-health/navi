#!/usr/bin/env node

const crypto = require("crypto");
const fs = require("fs");
const path = require("path");

/**
 * Generate fake environment variables for CI/CD testing
 * These are NOT production keys - only for automated testing
 */

function generateCIKey() {
  // Generate 32 bytes (256 bits) of deterministic data for CI
  // Using a fixed seed so builds are reproducible
  const key = "abcdefghijklmnopqrstuvwxyz012345";
}

function generateEnvFile() {
  const envContent = `# Generated environment variables for CI/CD testing
# These are NOT production keys - only for automated testing
NODE_ENV=production
JWT_KEY_ID=abcdefghijklm012345nopqrstuvwxyz
JWT_SIGNING_KEY=abcdefghijklmnopqrstuvwxyz012345
TOKEN_ENCRYPTION_KEY=012345abcdefghijklmnopqrstuvwxyz
STYTCH_B2B_PROJECT_ID=stytch-project-id
STYTCH_B2B_SECRET=stytch-secret
STYTCH_B2B_BASE_URL=https://api.stytch.com
STYTCH_B2B_PUBLIC_TOKEN=stytch-b2b-public-token
STYTCH_ENV=test
STYTCH_TRUSTED_TOKEN_PROFILE_ID=stytch-trusted-token-profile-id
STYTCH_TRUSTED_TOKEN_PRIVATE_KEY_B64=stytch-trusted-token-private-key-b64
STYTCH_TRUSTED_TOKEN_KID=stytch-trusted-token-kid
NEXT_PUBLIC_STATSIG_CLIENT_KEY=statsig-client-key
NEXT_PUBLIC_MEDPLUM_BASE_URL=https://api.medplum.com
NEXT_PUBLIC_MEDPLUM_WS_BASE_URL=ws://api.medplum.com
`;

  const envPath = path.join(process.cwd(), "apps", "navi-portal", ".env.test");
  fs.writeFileSync(envPath, envContent);

  console.log("✅ Generated .env.test file for CI/CD testing");
  console.log("📋 Environment variables:");
  console.log("   NODE_ENV=production");
  console.log("   JWT_KEY_ID=abcdefghijklm012345nopqrstuvwxyz");
  console.log("   JWT_SIGNING_KEY=abcdefghijklmnopqrstuvwxyz012345");
  console.log("   TOKEN_ENCRYPTION_KEY=012345abcdefghijklmnopqrstuvwxyz");
  console.log("   STYTCH_B2B_PROJECT_ID=stytch-project-id");
  console.log("   STYTCH_B2B_SECRET=stytch-secret");
  console.log("   STYTCH_B2B_BASE_URL=https://api.stytch.com");
  console.log("   STYTCH_B2B_PUBLIC_TOKEN=stytch-b2b-public-token");
  console.log("   STYTCH_ENV=test");
  console.log(
    "   STYTCH_TRUSTED_TOKEN_PROFILE_ID=stytch-trusted-token-profile-id"
  );
  console.log(
    "   STYTCH_TRUSTED_TOKEN_PRIVATE_KEY_B64=stytch-trusted-token-private-key-b64"
  );
  console.log("   STYTCH_TRUSTED_TOKEN_KID=stytch-trusted-token-kid");
  console.log("   NEXT_PUBLIC_STATSIG_CLIENT_KEY=statsig-client-key");
  console.log("   NEXT_PUBLIC_MEDPLUM_BASE_URL=https://api.medplum.com");
  console.log("   NEXT_PUBLIC_MEDPLUM_WS_BASE_URL=ws://api.medplum.com");
  console.log("");
  console.log("⚠️  These are test keys only - NOT for production use");
}

// Generate the .env file
generateEnvFile();
