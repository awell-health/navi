import { describe, it, expect } from 'vitest';
import { createJWT, verifyJWT } from './jwtUtils';

describe('JWT Utils', () => {
  it('should create and verify a valid JWT', async () => {
    const sessionId = 'test-session-123';
    const expiresInMinutes = 15;
    
    // Create JWT
    const jwt = await createJWT(sessionId, expiresInMinutes);
    
    expect(jwt).toBeDefined();
    expect(typeof jwt).toBe('string');
    expect(jwt.split('.').length).toBe(3); // header.payload.signature
    
    // Verify JWT
    const payload = await verifyJWT(jwt);
    
    expect(payload).toBeDefined();
    expect(payload?.sub).toBe(sessionId);
    expect(payload?.exp).toBeGreaterThan(Math.floor(Date.now() / 1000));
    expect(payload?.iat).toBeLessThanOrEqual(Math.floor(Date.now() / 1000));
  });

  it('should return null for invalid JWT format', async () => {
    const result = await verifyJWT('invalid-jwt');
    expect(result).toBeNull();
  });

  it('should return null for JWT with invalid signature', async () => {
    const validJWT = await createJWT('test-session');
    // Tamper with the signature
    const tamperedJWT = validJWT.slice(0, -10) + 'tamperedsig';
    
    const result = await verifyJWT(tamperedJWT);
    expect(result).toBeNull();
  });

  it('should return null for expired JWT', async () => {
    // Create a JWT that expires immediately (0 minutes)
    const jwt = await createJWT('test-session', 0);
    
    // Wait a tiny bit for it to expire
    await new Promise(resolve => setTimeout(resolve, 1100));
    
    const result = await verifyJWT(jwt);
    expect(result).toBeNull();
  });

  it('should create different JWTs for different sessions', async () => {
    const jwt1 = await createJWT('session-1');
    const jwt2 = await createJWT('session-2');
    
    expect(jwt1).not.toEqual(jwt2);
    
    const payload1 = await verifyJWT(jwt1);
    const payload2 = await verifyJWT(jwt2);
    
    expect(payload1?.sub).toBe('session-1');
    expect(payload2?.sub).toBe('session-2');
  });

  it('should have correct JWT structure', async () => {
    const jwt = await createJWT('test-session');
    const [headerPart, payloadPart] = jwt.split('.');
    
    // Decode header
    const header = JSON.parse(atob(headerPart.replace(/-/g, '+').replace(/_/g, '/')));
    expect(header.alg).toBe('HS256');
    expect(header.typ).toBe('JWT');
    
    // Decode payload
    const payload = JSON.parse(atob(payloadPart.replace(/-/g, '+').replace(/_/g, '/')));
    expect(payload.sub).toBe('test-session');
    expect(payload.exp).toBeDefined();
    expect(payload.iat).toBeDefined();
  });
}); 