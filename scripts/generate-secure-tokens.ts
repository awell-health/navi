#!/usr/bin/env tsx

import { encryptToken, type TokenData } from '../src/lib/token';

/**
 * Generate test tokens using secure AES-GCM encryption
 * This script uses the same encryption as the production system
 */

async function generateSecureTokens() {
  console.log('🔐 Secure Magic Link Test Tokens (AES-GCM 256)\n');

  try {
    // Valid token (expires in 5 minutes)
    const validPayload: TokenData = {
      patientId: 'patient123',
      careflowId: 'careflow456',
      orgId: 'org123',
      tenantId: 'tenant123',
      environment: 'test',
      exp: Date.now() + (5 * 60 * 1000) // 5 minutes from now
    };
    
    const validToken = await encryptToken(validPayload);
    console.log('✅ Valid Token (expires in 5 minutes):');
    console.log(`   http://localhost:3000/magic/${validToken}`);
    console.log(`   Token: ${validToken}\n`);

    // Expired token
    const expiredPayload: TokenData = {
      patientId: 'patient456',
      careflowId: 'careflow789',
      orgId: 'org123',
      tenantId: 'tenant123',
      environment: 'test',
      exp: Date.now() - 1000 // 1 second ago
    };
    
    const expiredToken = await encryptToken(expiredPayload);
    console.log('❌ Expired Token (should return 400):');
    console.log(`   http://localhost:3000/magic/${expiredToken}`);
    console.log(`   Token: ${expiredToken}\n`);

    console.log('🧪 Test invalid token:');
    console.log('   http://localhost:3000/magic/invalid-token-here\n');

    console.log('📝 Usage:');
    console.log('   1. Start the dev server: pnpm dev');
    console.log('   2. Visit the valid token URL above');
    console.log('   3. Check browser cookies and network tab');
    console.log('   4. Try the expired/invalid tokens to see 400 responses');
    console.log('\n🔐 Security Features:');
    console.log('   ✓ AES-GCM 256 encryption');
    console.log('   ✓ Random 96-bit IVs');
    console.log('   ✓ Authenticated encryption');
    console.log('   ✓ Same encryption as production');
    
  } catch (error) {
    console.error('❌ Failed to generate secure tokens:', error);
    console.error('\n💡 Make sure you have the required environment variables:');
    console.error('   JWT_SIGNING_KEY and TOKEN_ENCRYPTION_KEY');
    console.error('   Run: node scripts/generate-keys.js to create them');
    console.error('\n📋 Current environment check:');
    console.error('   NODE_ENV:', process.env.NODE_ENV || 'undefined');
    console.error('   TOKEN_ENCRYPTION_KEY:', process.env.TOKEN_ENCRYPTION_KEY ? 'SET' : 'MISSING');
    console.error('   JWT_SIGNING_KEY:', process.env.JWT_SIGNING_KEY ? 'SET' : 'MISSING');
    process.exit(1);
  }
}

// Run the script
generateSecureTokens(); 