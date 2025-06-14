#!/usr/bin/env node

// Helper script to generate test tokens for the magic link functionality
const STUB_SECRET = 'magic-link-secret-key-256bit-stub';

function createStubToken(payload) {
  try {
    const jsonPayload = JSON.stringify(payload);
    
    // Simple XOR encrypt with secret (same as route implementation)
    let encrypted = '';
    for (let i = 0; i < jsonPayload.length; i++) {
      encrypted += String.fromCharCode(
        jsonPayload.charCodeAt(i) ^ STUB_SECRET.charCodeAt(i % STUB_SECRET.length)
      );
    }
    
    // Encode as base64
    return Buffer.from(encrypted, 'binary').toString('base64');
  } catch (error) {
    throw new Error('Failed to create test token');
  }
}

// Generate test tokens
console.log('🔗 Magic Link Test Tokens\n');

// Valid token (expires in 5 minutes)
const validPayload = {
  patientId: 'patient123',
  careflowId: 'careflow456',
  exp: Date.now() + (5 * 60 * 1000) // 5 minutes from now
};
const validToken = createStubToken(validPayload);
console.log('✅ Valid Token (expires in 5 minutes):');
console.log(`   http://localhost:3000/magic/${validToken}`);
console.log(`   Token: ${validToken}\n`);

// Expired token
const expiredPayload = {
  patientId: 'patient456',
  careflowId: 'careflow789',
  exp: Date.now() - 1000 // 1 second ago
};
const expiredToken = createStubToken(expiredPayload);
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