import { env } from "@/env";
import { type TokenData } from "../token";

interface JWTPayload {
  sub: string; // careflow_id
  stakeholder_id: string; // patient_id or other stakeholder_id
  tenant_id: string; // tenant_id
  org_id: string; // org_id
  environment: string; // environment
  iss: string; // issuer - Kong uses this to lookup the consumer
  exp: number; // expiration timestamp
  iat: number; // issued at timestamp
}

// Convert base64 string to Uint8Array
function base64ToUint8Array(base64: string): Uint8Array {
  const binaryString = atob(base64);
  const bytes = new Uint8Array(binaryString.length);
  for (let i = 0; i < binaryString.length; i++) {
    bytes[i] = binaryString.charCodeAt(i);
  }
  return bytes;
}

// Convert Uint8Array to base64url string (JWT standard)
function uint8ArrayToBase64Url(bytes: Uint8Array): string {
  let binaryString = '';
  for (let i = 0; i < bytes.length; i++) {
    binaryString += String.fromCharCode(bytes[i]);
  }
  return btoa(binaryString)
    .replace(/\+/g, '-')
    .replace(/\//g, '_')
    .replace(/=/g, '');
}

// Convert base64url string to base64
function base64UrlToBase64(base64url: string): string {
  let base64 = base64url.replace(/-/g, '+').replace(/_/g, '/');
  // Add padding if needed
  while (base64.length % 4) {
    base64 += '=';
  }
  return base64;
}

// Convert string to base64url
function stringToBase64Url(str: string): string {
  return btoa(str)
    .replace(/\+/g, '-')
    .replace(/\//g, '_')
    .replace(/=/g, '');
}

// Import JWT signing key for HMAC-SHA256
async function getJWTSigningKey(): Promise<CryptoKey> {
  const keyData = new TextEncoder().encode(env.JWT_SIGNING_KEY);
  return await crypto.subtle.importKey(
    'raw',
    keyData,
    { name: 'HMAC', hash: 'SHA-256' },
    false,
    ['sign', 'verify']
  );
}

// Create a properly signed JWT
export async function createJWT(tokenData: TokenData, expiresInMinutes: number = 15): Promise<string> {
  try {
    const now = Math.floor(Date.now() / 1000);
    const exp = now + (expiresInMinutes * 60);
    
    // JWT Header
    const header = {
      alg: 'HS256',
      typ: 'JWT'
    };
    
    // JWT Payload
    const payload: JWTPayload = {
      sub: tokenData.careflowId,
      stakeholder_id: tokenData.patientId,
      tenant_id: tokenData.tenantId,
      org_id: tokenData.orgId,
      environment: tokenData.environment,
      iss: env.JWT_KEY_ID, // Kong uses this to lookup the consumer/credential
      exp,
      iat: now
    };
    
    // Encode header and payload
    const encodedHeader = stringToBase64Url(JSON.stringify(header));
    const encodedPayload = stringToBase64Url(JSON.stringify(payload));
    
    // Create signature base
    const signatureBase = `${encodedHeader}.${encodedPayload}`;
    
    // Sign with HMAC-SHA256
    const key = await getJWTSigningKey();
    const signature = await crypto.subtle.sign(
      'HMAC',
      key,
      new TextEncoder().encode(signatureBase)
    );
    
    // Encode signature
    const encodedSignature = uint8ArrayToBase64Url(new Uint8Array(signature));
    
    return `${signatureBase}.${encodedSignature}`;
  } catch (error) {
    console.error('JWT creation failed:', error);
    throw new Error('Failed to create JWT');
  }
}

// Verify and decode a JWT
export async function verifyJWT(jwt: string): Promise<JWTPayload | null> {
  try {
    const parts = jwt.split('.');
    if (parts.length !== 3) {
      return null;
    }
    
    const [encodedHeader, encodedPayload, encodedSignature] = parts;
    
    // Verify signature
    const signatureBase = `${encodedHeader}.${encodedPayload}`;
    const key = await getJWTSigningKey();
    
    const signature = base64ToUint8Array(base64UrlToBase64(encodedSignature));
    const isValid = await crypto.subtle.verify(
      'HMAC',
      key,
      signature,
      new TextEncoder().encode(signatureBase)
    );
    
    if (!isValid) {
      return null;
    }
    
    // Decode payload
    const payloadJson = atob(base64UrlToBase64(encodedPayload));
    const payload = JSON.parse(payloadJson) as JWTPayload;
    
        // Check expiration
    const now = Math.floor(Date.now() / 1000);
    if (payload.exp <= now) {
      return null;
    }

    // Validate issuer if needed
    if (payload.iss && payload.iss !== env.JWT_KEY_ID) {
      console.warn('JWT issuer mismatch:', payload.iss);
    }

    return payload;
  } catch (error) {
    console.error('JWT verification failed:', error);
    return null;
  }
}

// Legacy stub JWT generation for backward compatibility
// TODO: Remove this once all references are updated
export function generateStubJWT(sessionId: string): string {
  console.warn('Using deprecated stub JWT generation. Please use createJWT() instead.');
  
  // Stub JWT - in production would use proper JWT library with signing
  const header = btoa(JSON.stringify({ alg: 'HS256', typ: 'JWT' }));
  const payload = btoa(JSON.stringify({
    sub: sessionId,
    exp: Math.floor(Date.now() / 1000) + (15 * 60), // 15 minutes
    iat: Math.floor(Date.now() / 1000)
  }));
  const signature = btoa('stub-signature'); // In production: HMAC-SHA256
  
  return `${header}.${payload}.${signature}`;
} 