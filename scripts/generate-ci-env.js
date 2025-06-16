#!/usr/bin/env node

const crypto = require('crypto');
const fs = require('fs');
const path = require('path');

/**
 * Generate fake environment variables for CI/CD testing
 * These are NOT production keys - only for automated testing
 */

function generateCIKey() {
  // Generate 32 bytes (256 bits) of deterministic data for CI
  // Using a fixed seed so builds are reproducible
  const key = 'abcdefghijklmnopqrstuvwxyz012345'
}

function generateEnvFile() {
  const envContent = `# Generated environment variables for CI/CD testing
# These are NOT production keys - only for automated testing
NODE_ENV=production
JWT_KEY_ID=abcdefghijklm012345nopqrstuvwxyz
JWT_SIGNING_KEY=abcdefghijklmnopqrstuvwxyz012345
TOKEN_ENCRYPTION_KEY=012345abcdefghijklmnopqrstuvwxyz
`;

  const envPath = path.join(process.cwd(), '.env.test');
  fs.writeFileSync(envPath, envContent);
  
  console.log('✅ Generated .env.test file for CI/CD testing');
  console.log('📋 Environment variables:');
  console.log('   NODE_ENV=production');
  console.log('   JWT_KEY_ID=abcdefghijklm012345nopqrstuvwxyz');
  console.log('   JWT_SIGNING_KEY=abcdefghijklmnopqrstuvwxyz012345');
  console.log('   TOKEN_ENCRYPTION_KEY=012345abcdefghijklmnopqrstuvwxyz');
  console.log('');
  console.log('⚠️  These are test keys only - NOT for production use');
}

// Generate the .env file
generateEnvFile(); 