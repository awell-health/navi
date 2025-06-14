import { describe, it, expect, beforeEach } from 'vitest';
import { GET } from './route';
import { NextRequest } from 'next/server';

// Helper function to create test tokens using the same method as the route handler
const STUB_SECRET = 'magic-link-secret-key-256bit-stub';

function createStubToken(payload: { patientId: string; careflowId: string; exp: number }): string {
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
    return btoa(encrypted);
  } catch {
    throw new Error('Failed to create test token');
  }
}

describe('Magic Link Authentication', () => {
  beforeEach(() => {
    // Reset any global state if needed
  });

  it('should return 400 for invalid token format', async () => {
    const request = new NextRequest('https://example.com/magic/invalid-token');
    const params = Promise.resolve({ token: 'invalid-token' });
    
    const response = await GET(request, { params });
    
    expect(response.status).toBe(400);
    expect(await response.text()).toBe('Invalid token');
  });

  it('should return 400 for malformed token data', async () => {
    // Create a token with invalid JSON
    const invalidToken = btoa('not-json');
    const request = new NextRequest(`https://example.com/magic/${invalidToken}`);
    const params = Promise.resolve({ token: invalidToken });
    
    const response = await GET(request, { params });
    
    expect(response.status).toBe(400);
    expect(await response.text()).toBe('Invalid token');
  });

  it('should return 400 for token missing required fields', async () => {
    // Create a token with missing required fields
    const incompletePayload = { patientId: 'patient123' }; // missing careflowId and exp
    const token = createStubToken(incompletePayload as { patientId: string; careflowId: string; exp: number });
    
    const request = new NextRequest(`https://example.com/magic/${token}`);
    const params = Promise.resolve({ token });
    
    const response = await GET(request, { params });
    
    expect(response.status).toBe(400);
    expect(await response.text()).toBe('Invalid token');
  });

  it('should return 400 for expired token', async () => {
    // Create an expired token
    const expiredPayload = {
      patientId: 'patient123',
      careflowId: 'careflow456',
      exp: Date.now() - 1000 // 1 second ago
    };
    const token = createStubToken(expiredPayload);
    
    const request = new NextRequest(`https://example.com/magic/${token}`);
    const params = Promise.resolve({ token });
    
    const response = await GET(request, { params });
    
    expect(response.status).toBe(400);
    expect(await response.text()).toBe('Token expired');
  });

  it('should return 200 and HTML for valid token', async () => {
    // Create a valid token
    const validPayload = {
      patientId: 'patient123',
      careflowId: 'careflow456',
      exp: Date.now() + 60000 // 1 minute from now
    };
    const token = createStubToken(validPayload);
    
    const request = new NextRequest(`https://example.com/magic/${token}`);
    const params = Promise.resolve({ token });
    
    const response = await GET(request, { params });
    
    expect(response.status).toBe(200);
    expect(response.headers.get('content-type')).toBe('text/html');
    
    const html = await response.text();
    expect(html).toContain('Hello, Patient! 👋');
    expect(html).toContain('patient123');
    expect(html).toContain('careflow456');
  });

  it('should set correct cookies for valid token', async () => {
    // Create a valid token
    const validPayload = {
      patientId: 'patient123',
      careflowId: 'careflow456',
      exp: Date.now() + 60000 // 1 minute from now
    };
    const token = createStubToken(validPayload);
    
    const request = new NextRequest(`https://example.com/magic/${token}`);
    const params = Promise.resolve({ token });
    
    const response = await GET(request, { params });
    
    expect(response.status).toBe(200);
    
    // Check cookies are set
    const cookies = response.cookies;
    const sidCookie = cookies.get('awell.sid');
    const jwtCookie = cookies.get('awell.jwt');
    
    expect(sidCookie).toBeDefined();
    expect(jwtCookie).toBeDefined();
    expect(sidCookie?.httpOnly).toBe(true);
    expect(jwtCookie?.httpOnly).toBe(true);
    expect(sidCookie?.sameSite).toBe('lax');
    expect(jwtCookie?.sameSite).toBe('lax');
    expect(jwtCookie?.path).toBe('/graphql');
  });

  it('should set referrer policy header', async () => {
    // Create a valid token
    const validPayload = {
      patientId: 'patient123',
      careflowId: 'careflow456',
      exp: Date.now() + 60000
    };
    const token = createStubToken(validPayload);
    
    const request = new NextRequest(`https://example.com/magic/${token}`);
    const params = Promise.resolve({ token });
    
    const response = await GET(request, { params });
    
    expect(response.headers.get('referrer-policy')).toBe('strict-origin');
  });
}); 