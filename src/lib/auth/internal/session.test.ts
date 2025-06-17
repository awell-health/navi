import { describe, it, expect } from 'vitest';
import { 
  createSessionToken, 
  decryptSessionToken, 
  isValidSessionToken,
  encryptToken,
  decryptToken 
} from './session';
import type { SessionTokenData } from './types';

describe('Session Token Encryption/Decryption', () => {
  const testSessionTokenData: SessionTokenData = {
    patientId: 'test-patient-123',
    careflowId: 'test-careflow-456',
    orgId: 'test-org-789',
    tenantId: 'test-tenant-123',
    environment: 'test',
    exp: Date.now() + 60000, // 1 minute from now
  };

  describe('New Session Token API', () => {
    it('should create and decrypt a session token successfully', async () => {
      // Create the session token
      const sessionToken = await createSessionToken(testSessionTokenData);
      expect(sessionToken).toBeDefined();
      expect(typeof sessionToken).toBe('string');
      expect(sessionToken.length).toBeGreaterThan(0);

      // Decrypt the session token
      const decryptedToken = await decryptSessionToken(sessionToken);
      expect(decryptedToken).toBeDefined();
      expect(decryptedToken).toEqual(testSessionTokenData);
    });

    it('should return null for invalid encrypted session token', async () => {
      const result = await decryptSessionToken('invalid-token');
      expect(result).toBeNull();
    });

    it('should return null for malformed base64 session token', async () => {
      const result = await decryptSessionToken('not-valid-base64!@#');
      expect(result).toBeNull();
    });

    it('should return null for session token with insufficient data', async () => {
      // Create a token that's too short (less than IV + minimal ciphertext)
      const shortToken = btoa('short');
      const result = await decryptSessionToken(shortToken);
      expect(result).toBeNull();
    });

    it('should validate session token data structure correctly', () => {
      // Valid session token data
      expect(isValidSessionToken(testSessionTokenData)).toBe(true);

      // Missing required fields
      expect(isValidSessionToken({ patientId: 'test' })).toBe(false);
      expect(isValidSessionToken({})).toBe(false);
      expect(isValidSessionToken(null)).toBe(false);
      expect(isValidSessionToken(undefined)).toBe(false);

      // Invalid types
      expect(isValidSessionToken('string')).toBe(false);
      expect(isValidSessionToken(123)).toBe(false);
    });

    it('should handle different session token data correctly', async () => {
      const differentSessionTokenData: SessionTokenData = {
        patientId: 'different-patient',
        careflowId: 'different-careflow',
        orgId: 'different-org',
        tenantId: 'different-tenant',
        environment: 'production-us',
        exp: Date.now() + 300000, // 5 minutes from now
      };

      const sessionToken = await createSessionToken(differentSessionTokenData);
      const decryptedToken = await decryptSessionToken(sessionToken);
      
      expect(decryptedToken).toEqual(differentSessionTokenData);
    });

    it('should generate different encrypted session tokens for same data', async () => {
      // Create the same data multiple times
      const token1 = await createSessionToken(testSessionTokenData);
      const token2 = await createSessionToken(testSessionTokenData);
      
      // Should be different due to random IV
      expect(token1).not.toEqual(token2);
      
      // But should decrypt to the same data
      const decrypted1 = await decryptSessionToken(token1);
      const decrypted2 = await decryptSessionToken(token2);
      
      expect(decrypted1).toEqual(testSessionTokenData);
      expect(decrypted2).toEqual(testSessionTokenData);
      expect(decrypted1).toEqual(decrypted2);
    });
  });

  describe('Legacy Token API (Backward Compatibility)', () => {
    it('should encrypt and decrypt a token successfully (legacy)', async () => {
      // Encrypt the token
      const encryptedToken = await encryptToken(testSessionTokenData);
      expect(encryptedToken).toBeDefined();
      expect(typeof encryptedToken).toBe('string');
      expect(encryptedToken.length).toBeGreaterThan(0);

      // Decrypt the token
      const decryptedToken = await decryptToken(encryptedToken);
      expect(decryptedToken).toBeDefined();
      expect(decryptedToken).toEqual(testSessionTokenData);
    });

    it('should return null for invalid encrypted token (legacy)', async () => {
      const result = await decryptToken('invalid-token');
      expect(result).toBeNull();
    });
  });
});
