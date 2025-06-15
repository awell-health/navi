#!/usr/bin/env node

const crypto = require('crypto');

/**
 * Generate cryptographically secure 256-bit keys for JWT signing and token encryption.
 * These keys should be stored securely in your environment variables.
 */

function generateKey() {
  // Generate 32 bytes (256 bits) of random data
  const key = crypto.randomBytes(32);
  return key.toString('base64');
}

console.log('🔐 Generating secure 256-bit keys for production use...\n');

const jwtSigningKey = generateKey();
const tokenEncryptionKey = generateKey();

console.log('Add these environment variables to your .env file:');
console.log('');
console.log(`JWT_SIGNING_KEY="${jwtSigningKey}"`);
console.log(`TOKEN_ENCRYPTION_KEY="${tokenEncryptionKey}"`);
console.log('');
console.log('⚠️  Important Security Notes:');
console.log('1. Keep these keys secret and secure');
console.log('2. Use different keys for different environments (dev/staging/prod)');
console.log('3. Rotate keys quarterly as mentioned in requirements/08-deployment.md');
console.log('4. Never commit these keys to version control');
console.log('5. Store in secure environment variable management (e.g., Vercel secrets)');
console.log('');
console.log('🔄 Key rotation: Generate new keys and deploy with zero downtime by:');
console.log('   1. Deploy new keys alongside old ones');
console.log('   2. Update token generation to use new keys');
console.log('   3. After TTL expires, remove old keys'); 