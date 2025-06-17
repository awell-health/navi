import { describe, it, expect, beforeEach } from 'vitest';
import { GET } from './route';
import { NextRequest } from 'next/server';
import { encryptToken } from '@/lib/auth/internal/session';
import type { TokenData } from '@/lib/auth/internal/types';

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
    const token = await encryptToken(incompletePayload as TokenData);
    
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
      orgId: 'org123',
      tenantId: 'tenant123',
      environment: 'test',
      exp: Date.now() - 1000 // 1 second ago
    };
    const token = await encryptToken(expiredPayload as TokenData);
    
    const request = new NextRequest(`https://example.com/magic/${token}`);
    const params = Promise.resolve({ token });
    
    const response = await GET(request, { params });
    
    expect(response.status).toBe(400);
    expect(await response.text()).toBe('Token expired');
  });

  it('should return 200 and HTML for valid token', async () => {
    // Create a valid token
    const validPayload: TokenData = {
      patientId: 'patient123',
      careflowId: 'careflow456',
      orgId: 'org123',
      tenantId: 'tenant123',
      environment: 'test',
      exp: Date.now() + 60000 // 1 minute from now
    };
    const token = await encryptToken(validPayload);
    
    const request = new NextRequest(`https://example.com/magic/${token}`);
    const params = Promise.resolve({ token });
    
    const response = await GET(request, { params });
    
    expect(response.status).toBe(200);
    expect(response.headers.get('content-type')).toBe('text/html');
    
    const html = await response.text();
    expect(html).toContain('Welcome to your care journey');
    expect(html).toContain('patient123');
    expect(html).toContain('careflow456');
  });

  it('should set correct cookies for valid token', async () => {
    // Create a valid token
    const validPayload: TokenData = {
      patientId: 'patient123',
      careflowId: 'careflow456',
      orgId: 'org123',
      tenantId: 'tenant123',
      environment: 'test',
      exp: Date.now() + 60000 // 1 minute from now
    };
    const token = await encryptToken(validPayload);
    
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
    expect(jwtCookie?.path).toBe('/api/graphql');
  });

  it('should set referrer policy header', async () => {
    // Create a valid token
    const validPayload: TokenData = {
      patientId: 'patient123',
      careflowId: 'careflow456',
      orgId: 'org123',
      tenantId: 'tenant123',
      environment: 'test',
      exp: Date.now() + 60000
    };
    const token = await encryptToken(validPayload);
    
    const request = new NextRequest(`https://example.com/magic/${token}`);
    const params = Promise.resolve({ token });
    
    const response = await GET(request, { params });
    
    expect(response.headers.get('referrer-policy')).toBe('strict-origin');
  });
}); 