/**
 * @vitest-environment node
 */
import { describe, it, expect, beforeEach, vi } from 'vitest';
import { GET } from './route';
import { NextRequest } from 'next/server';
import { createSessionToken } from '@/lib/auth/internal/session';
import type { SessionTokenData } from '@/lib/auth/internal/types';

describe('Magic Link Authentication', () => {
  beforeEach(() => {
    vi.clearAllMocks();
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
    const token = await createSessionToken(incompletePayload as SessionTokenData);
    
    const request = new NextRequest(`https://example.com/magic/${token}`);
    const params = Promise.resolve({ token });
    
    const response = await GET(request, { params });
    
    expect(response.status).toBe(400);
    expect(await response.text()).toBe('Invalid token');
  });

  it('should return 400 for expired token', async () => {
    const expiredPayload = {
      patientId: 'patient123',
      careflowId: 'careflow456',
      orgId: 'org123',
      tenantId: 'tenant123',
      environment: 'test',
      exp: Math.floor(Date.now() / 1000) - 60 // Expired 1 minute ago
    };
    const token = await createSessionToken(expiredPayload as SessionTokenData);
    
    const request = new NextRequest(`https://example.com/magic/${token}`);
    const params = Promise.resolve({ token });
    
    const response = await GET(request, { params });
    
    expect(response.status).toBe(400);
    expect(await response.text()).toBe('Token expired');
  });

  it('should return 200 and HTML for valid token', async () => {
    // Create a valid token
    const validPayload: SessionTokenData = {
      patientId: 'patient123',
      careflowId: 'careflow456',
      orgId: 'org123',
      tenantId: 'tenant123',
      environment: 'test',
      exp: Math.floor(Date.now() / 1000) + 60 // 1 minute from now
    };
    const token = await createSessionToken(validPayload);
    
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
    const validPayload: SessionTokenData = {
      patientId: 'patient123',
      careflowId: 'careflow456',
      orgId: 'org123',
      tenantId: 'tenant123',
      environment: 'test',
      exp: Math.floor(Date.now() / 1000) + 60 // 1 minute from now
    };
    const token = await createSessionToken(validPayload);
    
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
    const validPayload: SessionTokenData = {
      patientId: 'patient123',
      careflowId: 'careflow456',
      orgId: 'org123',
      tenantId: 'tenant123',
      environment: 'test',
      exp: Math.floor(Date.now() / 1000) + 60
    };
    const token = await createSessionToken(validPayload);
    
    const request = new NextRequest(`https://example.com/magic/${token}`);
    const params = Promise.resolve({ token });
    
    const response = await GET(request, { params });
    
    expect(response.headers.get('referrer-policy')).toBe('strict-origin');
  });

  describe('Error handling', () => {
    it('should return 400 for incomplete token payload', async () => {
      const incompletePayload = {
        careflowId: 'test-careflow-id',
        patientId: 'test-patient-id',
        // Missing required fields
      };
      
      const token = await createSessionToken(incompletePayload as SessionTokenData);
      const request = new NextRequest(`http://localhost:3000/magic/${token}`);
      const params = Promise.resolve({ token });
      
      const response = await GET(request, { params });
      
      expect(response.status).toBe(400);
    });

    it('should return 400 for expired token', async () => {
      const expiredPayload = {
        careflowId: 'test-careflow-id',
        patientId: 'test-patient-id',
        tenantId: 'test-tenant-id',
        orgId: 'test-org-id',
        environment: 'test' as const,
        exp: Math.floor(Date.now() / 1000) - 60, // Expired 1 minute ago
      };
      
      const token = await createSessionToken(expiredPayload as SessionTokenData);
      const request = new NextRequest(`http://localhost:3000/magic/${token}`);
      const params = Promise.resolve({ token });
      
      const response = await GET(request, { params });
      
      expect(response.status).toBe(400);
    });
  });

  describe('Success cases', () => {
    it('should return HTML for valid token', async () => {
      const validPayload: SessionTokenData = {
        careflowId: 'test-careflow-id',
        patientId: 'test-patient-id',
        tenantId: 'test-tenant-id',
        orgId: 'test-org-id',
        environment: 'test',
        exp: Math.floor(Date.now() / 1000) + 60, // Expires in 1 minute
      };
      
      const token = await createSessionToken(validPayload);
      const request = new NextRequest(`http://localhost:3000/magic/${token}`);
      const params = Promise.resolve({ token });
      
      const response = await GET(request, { params });
      
      expect(response.status).toBe(200);
      expect(response.headers.get('content-type')).toBe('text/html');
      
      const html = await response.text();
      expect(html).toContain('<!DOCTYPE html>');
      expect(html).toContain('test-careflow-id');
      expect(html).toContain('test-patient-id');
    });

    it('should set session and JWT cookies', async () => {
      const validPayload: SessionTokenData = {
        careflowId: 'test-careflow-id',
        patientId: 'test-patient-id',
        tenantId: 'test-tenant-id',
        orgId: 'test-org-id',
        environment: 'test',
        exp: Math.floor(Date.now() / 1000) + 60,
      };
      
      const token = await createSessionToken(validPayload);
      const request = new NextRequest(`http://localhost:3000/magic/${token}`);
      const params = Promise.resolve({ token });
      
      const response = await GET(request, { params });
      
      expect(response.status).toBe(200);
      
      const cookies = response.cookies;
      const sidCookie = cookies.get('awell.sid');
      const jwtCookie = cookies.get('awell.jwt');
      
      expect(sidCookie).toBeDefined();
      expect(jwtCookie).toBeDefined();
      expect(sidCookie?.httpOnly).toBe(true);
      expect(jwtCookie?.httpOnly).toBe(true);
    });

    it('should handle branding parameters in query string', async () => {
      const validPayload: SessionTokenData = {
        careflowId: 'test-careflow-id',
        patientId: 'test-patient-id',
        tenantId: 'test-tenant-id',
        orgId: 'test-org-id',
        environment: 'test',
        exp: Math.floor(Date.now() / 1000) + 60,
      };
      
      const token = await createSessionToken(validPayload);
      const request = new NextRequest(`http://localhost:3000/magic/${token}?accent_color=%23ff0000&logo_url=https%3A%2F%2Fexample.com%2Flogo.png`);
      const params = Promise.resolve({ token });
      
      const response = await GET(request, { params });
      
      expect(response.status).toBe(200);
      expect(response.headers.get('content-type')).toBe('text/html');
      
      // The branding parameters are handled by the branding service
      // We just verify the response is successful
      const html = await response.text();
      expect(html).toContain('<!DOCTYPE html>');
    });
  });
}); 