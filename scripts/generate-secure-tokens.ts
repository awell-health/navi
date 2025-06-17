#!/usr/bin/env tsx

import { encryptToken } from '../src/lib/auth/internal/session';
import type { TokenEnvironment, TokenData } from '../src/lib/auth/internal/types';

/**
 * Generate test tokens using secure AES-GCM encryption
 * This script uses the same encryption as the production system
 */

async function generateSecureTokens(environment: TokenEnvironment = 'test') {
  console.log('🎨 Branding & Theming Test Tokens (AES-GCM 256)\n');

  try {
    // Sunrise Health - Bright, friendly healthcare
    const sunrisePayload: TokenData = {
      patientId: 'YVXkfvky9cNg84_LK0Cyt',
      careflowId: 'B1G1unpxkSEA',
      orgId: 'sunrise-health',
      tenantId: '_v0nvLX5zCNd',
      environment: 'development',
      exp: Date.now() + (5 * 60 * 1000) // 5 minutes from now
    };
    
    const sunriseToken = await encryptToken(sunrisePayload);
    console.log('🌅 SUNRISE HEALTH - Bright & Friendly Theme');
    console.log('   Colors: Orange primary, light backgrounds');
    console.log('   Fonts: Inter + Poppins (web fonts)');
    console.log('   Style: Warm, approachable healthcare');
    console.log(`   🔗 http://localhost:3000/magic/${sunriseToken}`);
    console.log(`   Token: ${sunriseToken}\n`);

    // TechCorp - Dark, professional tech
    const techCorpPayload: TokenData = {
      patientId: 'YVXkfvky9cNg84_LK0Cyt',
      careflowId: 'B1G1unpxkSEA',
      orgId: 'techcorp',
      tenantId: '_v0nvLX5zCNd',
      environment: 'development',
      exp: Date.now() + (5 * 60 * 1000) // 5 minutes from now
    };
    
    const techCorpToken = await encryptToken(techCorpPayload);
    console.log('🏢 TECHCORP SYSTEMS - Dark & Professional Theme');
    console.log('   Colors: Dark navy/slate, indigo accents');
    console.log('   Fonts: JetBrains Mono + Inter (monospace body)');
    console.log('   Style: Technical, modern, enterprise');
    console.log(`   🔗 http://localhost:3000/magic/${techCorpToken}`);
    console.log(`   Token: ${techCorpToken}\n`);

    // Default/Unknown org for fallback testing
    const defaultPayload: TokenData = {
      patientId: 'YVXkfvky9cNg84_LK0Cyt',
      careflowId: 'B1G1unpxkSEA',
      orgId: 'unknown-org-123',
      tenantId: '_v0nvLX5zCNd',
      environment: 'development',
      exp: Date.now() + (5 * 60 * 1000) // 5 minutes from now
    };
    
    const defaultToken = await encryptToken(defaultPayload);
    console.log('🔧 DEFAULT FALLBACK - Awell Default Theme');
    console.log('   Colors: Blue primary, clean neutrals');
    console.log('   Fonts: System fonts');
    console.log('   Style: Default when org branding not found');
    console.log(`   🔗 http://localhost:3000/magic/${defaultToken}`);
    console.log(`   Token: ${defaultToken}\n`);

    // Expired token for error testing
    const expiredPayload: TokenData = {
      patientId: 'patient_expired',
      careflowId: 'flow_expired',
      orgId: 'sunrise-health',
      tenantId: 'expired_tenant',
      environment,
      exp: Date.now() - 1000 // 1 second ago
    };
    
    const expiredToken = await encryptToken(expiredPayload);
    console.log('❌ EXPIRED TOKEN (should return 400):');
    console.log(`   http://localhost:3000/magic/${expiredToken}`);
    console.log(`   Token: ${expiredToken}\n`);

    console.log('🧪 INVALID TOKEN TEST:');
    console.log('   http://localhost:3000/magic/invalid-token-here\n');

    console.log('📝 TESTING GUIDE:');
    console.log('   1. Start dev server: pnpm dev');
    console.log('   2. Visit each themed URL above to see dramatic differences');
    console.log('   3. Compare: Orange vs Dark themes, different fonts');
    console.log('   4. Check DevTools for inlined CSS variables');
    console.log('   5. Try expired/invalid tokens for error handling');
    console.log('\n🎨 THEME COMPARISON:');
    console.log('   Sunrise: Bright orange, Inter/Poppins fonts, friendly');
    console.log('   TechCorp: Dark navy, JetBrains Mono, professional');
    console.log('   Default: Clean blue, system fonts, neutral');
    console.log('\n🔐 SECURITY FEATURES:');
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