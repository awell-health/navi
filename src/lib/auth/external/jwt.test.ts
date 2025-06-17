import { describe, it, expect } from 'vitest';
import { createJWT, verifyJWT } from './jwt';
import type { SessionTokenData } from '../internal/types';

describe('JWT Utils', () => {
  const sessionTokenData: SessionTokenData = {
    patientId: 'patient123',
    careflowId: 'careflow456',
    orgId: 'org123',
    tenantId: 'tenant123',
    environment: 'test',
    exp: Date.now() + 60000
  };
  
  it('should create and verify a valid JWT', async () => {
    const expiresInMinutes = 15;
    
    // Create JWT
    const jwt = await createJWT(sessionTokenData, expiresInMinutes);
    
    expect(jwt).toBeDefined();
    expect(typeof jwt).toBe('string');
    expect(jwt.split('.').length).toBe(3); // header.payload.signature
    
    // Verify JWT
    const payload = await verifyJWT(jwt);
    
    expect(payload).toBeDefined();
    expect(payload?.sub).toBe(sessionTokenData.careflowId);
    expect(payload?.exp).toBeGreaterThan(Math.floor(Date.now() / 1000));
    expect(payload?.iat).toBeLessThanOrEqual(Math.floor(Date.now() / 1000));
  });

  it('should return null for invalid JWT format', async () => {
    const result = await verifyJWT('invalid-jwt');
    expect(result).toBeNull();
  });

  it('should return null for JWT with invalid signature', async () => {
    const validJWT = await createJWT(sessionTokenData);
    // Tamper with the signature
    const tamperedJWT = validJWT.slice(0, -10) + 'tamperedsig';
    
    const result = await verifyJWT(tamperedJWT);
    expect(result).toBeNull();
  });

  it('should return null for expired JWT', async () => {
    // Create a JWT that expires immediately (0 minutes)
    const jwt = await createJWT(sessionTokenData, 0);
    
    // Wait a tiny bit for it to expire
    await new Promise(resolve => setTimeout(resolve, 1100));
    
    const result = await verifyJWT(jwt);
    expect(result).toBeNull();
  });

  it('should create different JWTs for different sessions', async () => {
    const jwt1 = await createJWT(sessionTokenData);
    const sessionTokenData2: SessionTokenData = {
      ...sessionTokenData,
      careflowId: 'careflow789',
    };
    const jwt2 = await createJWT(sessionTokenData2);
    
    expect(jwt1).not.toEqual(jwt2);
    
    const payload1 = await verifyJWT(jwt1);
    const payload2 = await verifyJWT(jwt2);
    
    expect(payload1?.sub).toBe(sessionTokenData.careflowId);
    expect(payload2?.sub).toBe(sessionTokenData2.careflowId);
  });

  it('should have correct JWT structure', async () => {
    const jwt = await createJWT(sessionTokenData);
    const [headerPart, payloadPart] = jwt.split('.');
    
    // Decode header
    const header = JSON.parse(atob(headerPart.replace(/-/g, '+').replace(/_/g, '/')));
    expect(header.alg).toBe('HS256');
    expect(header.typ).toBe('JWT');
    
    // Decode payload
    const payload = JSON.parse(atob(payloadPart.replace(/-/g, '+').replace(/_/g, '/')));
    expect(payload.sub).toBe(sessionTokenData.careflowId);
    expect(payload.exp).toBeDefined();
    expect(payload.iat).toBeDefined();
  });
});
