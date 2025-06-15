import { describe, it, expect } from 'vitest';
import { encryptToken, decryptToken, isValidToken } from './tokenUtils';
import type { TokenData } from './types';

describe('Token Encryption/Decryption', () => {
  const testTokenData: TokenData = {
    patientId: 'test-patient-123',
    careflowId: 'test-careflow-456',
    orgId: 'test-org-789',
    tenantId: 'test-tenant-123',
    environment: 'test',
    exp: Date.now() + 60000, // 1 minute from now
  };

  it('should encrypt and decrypt a token successfully', async () => {
    // Encrypt the token
    const encryptedToken = await encryptToken(testTokenData);
    expect(encryptedToken).toBeDefined();
    expect(typeof encryptedToken).toBe('string');
    expect(encryptedToken.length).toBeGreaterThan(0);

    // Decrypt the token
    const decryptedToken = await decryptToken(encryptedToken);
    expect(decryptedToken).toBeDefined();
    expect(decryptedToken).toEqual(testTokenData);
  });

  it('should return null for invalid encrypted token', async () => {
    const result = await decryptToken('invalid-token');
    expect(result).toBeNull();
  });

  it('should return null for malformed base64 token', async () => {
    const result = await decryptToken('not-valid-base64!@#');
    expect(result).toBeNull();
  });

  it('should return null for token with insufficient data', async () => {
    // Create a token that's too short (less than IV + minimal ciphertext)
    const shortToken = btoa('short');
    const result = await decryptToken(shortToken);
    expect(result).toBeNull();
  });

  it('should validate token data structure correctly', () => {
    // Valid token data
    expect(isValidToken(testTokenData)).toBe(true);

    // Missing required fields
    expect(isValidToken({ patientId: 'test' })).toBe(false);
    expect(isValidToken({})).toBe(false);
    expect(isValidToken(null)).toBe(false);
    expect(isValidToken(undefined)).toBe(false);

    // Invalid types
    expect(isValidToken('string')).toBe(false);
    expect(isValidToken(123)).toBe(false);
  });

  it('should handle different token data correctly', async () => {
    const differentTokenData: TokenData = {
      patientId: 'different-patient',
      careflowId: 'different-careflow',
      orgId: 'different-org',
      tenantId: 'different-tenant',
      environment: 'production',
      exp: Date.now() + 300000, // 5 minutes from now
    };

    const encryptedToken = await encryptToken(differentTokenData);
    const decryptedToken = await decryptToken(encryptedToken);
    
    expect(decryptedToken).toEqual(differentTokenData);
  });

  it('should generate different encrypted tokens for same data', async () => {
    // Encrypt the same data multiple times
    const token1 = await encryptToken(testTokenData);
    const token2 = await encryptToken(testTokenData);
    
    // Should be different due to random IV
    expect(token1).not.toEqual(token2);
    
    // But should decrypt to the same data
    const decrypted1 = await decryptToken(token1);
    const decrypted2 = await decryptToken(token2);
    
    expect(decrypted1).toEqual(testTokenData);
    expect(decrypted2).toEqual(testTokenData);
    expect(decrypted1).toEqual(decrypted2);
  });
}); 