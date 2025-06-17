import type { SessionTokenData } from "./types";
import { env } from "@/env";

export function isValidSessionToken(obj: unknown): obj is SessionTokenData {
  return typeof obj === 'object' && obj !== null && 'patientId' in obj && 'careflowId' in obj && 'orgId' in obj && 'environment' in obj && 'exp' in obj;
}

// Convert base64url string to Uint8Array
function base64UrlToUint8Array(base64url: string): Uint8Array {
  // Convert base64url to base64
  let base64 = base64url.replace(/-/g, '+').replace(/_/g, '/');
  // Add padding if needed
  while (base64.length % 4) {
    base64 += '=';
  }
  
  const binaryString = atob(base64);
  const bytes = new Uint8Array(binaryString.length);
  for (let i = 0; i < binaryString.length; i++) {
    bytes[i] = binaryString.charCodeAt(i);
  }
  return bytes;
}

// Convert Uint8Array to base64url string (URL-safe)
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

// Import encryption key for AES-GCM
async function getEncryptionKey(): Promise<CryptoKey> {
  const keyData = base64UrlToUint8Array(env.TOKEN_ENCRYPTION_KEY);
  return await crypto.subtle.importKey(
    'raw',
    keyData,
    { name: 'AES-GCM', length: 256 },
    false,
    ['encrypt', 'decrypt']
  );
}

// AES-GCM 256 encryption for session tokens
export async function createSessionToken(payload: SessionTokenData): Promise<string> {
  try {
    const key = await getEncryptionKey();
    const jsonPayload = JSON.stringify(payload);
    const plaintext = new TextEncoder().encode(jsonPayload);
    
    // Generate random IV (96 bits for GCM)
    const iv = crypto.getRandomValues(new Uint8Array(12));
    
    // Encrypt with AES-GCM
    const ciphertext = await crypto.subtle.encrypt(
      { name: 'AES-GCM', iv },
      key,
      plaintext
    );
    
    // Combine IV + ciphertext and encode as base64
    const combined = new Uint8Array(iv.length + ciphertext.byteLength);
    combined.set(iv, 0);
    combined.set(new Uint8Array(ciphertext), iv.length);
    
    return uint8ArrayToBase64Url(combined);
  } catch (error) {
    console.error('Session token encryption failed:', error);
    throw new Error('Failed to create session token');
  }
}

// AES-GCM 256 decryption for session tokens
export async function decryptSessionToken(token: string): Promise<SessionTokenData | null> {
  try {
    const key = await getEncryptionKey();
    const combined = base64UrlToUint8Array(token);
    
    // Extract IV (first 12 bytes) and ciphertext
    const iv = combined.slice(0, 12);
    const ciphertext = combined.slice(12);
    
    // Decrypt with AES-GCM
    const plaintext = await crypto.subtle.decrypt(
      { name: 'AES-GCM', iv },
      key,
      ciphertext
    );
    
    // Parse JSON payload
    const decryptedText = new TextDecoder().decode(plaintext);
    const payload = JSON.parse(decryptedText);
    
    // Validate required fields
    if (!isValidSessionToken(payload)) {
      return null;
    }
    
    return payload;
  } catch (error) {
    console.error('Session token decryption failed:', error);
    return null;
  }
}

// Legacy functions for backward compatibility during transition
// TODO: Remove these once all references are updated

// Legacy alias for createSessionToken
export function encryptToken(payload: SessionTokenData): Promise<string> {
  console.warn('Using deprecated encryptToken(). Please use createSessionToken() instead.');
  return createSessionToken(payload);
}

// Legacy alias for decryptSessionToken  
export function decryptToken(token: string): Promise<SessionTokenData | null> {
  console.warn('Using deprecated decryptToken(). Please use decryptSessionToken() instead.');
  return decryptSessionToken(token);
}

// Legacy validation function alias
export function isValidToken(obj: unknown): obj is SessionTokenData {
  console.warn('Using deprecated isValidToken(). Please use isValidSessionToken() instead.');
  return isValidSessionToken(obj);
}

export function decryptStubToken(token: string): SessionTokenData | null {
  console.warn('Using deprecated stub token decryption. Please use decryptSessionToken() instead.');
  
  try {
    const STUB_SECRET = 'legacy-secret-for-stub-functions';
    // Decode base64
    const decoded = atob(token);
    
    // Simple XOR decrypt with secret (stub implementation)
    let decrypted = '';
    for (let i = 0; i < decoded.length; i++) {
      decrypted += String.fromCharCode(
        decoded.charCodeAt(i) ^ STUB_SECRET.charCodeAt(i % STUB_SECRET.length)
      );
    }
    
    // Parse JSON payload
    const payload = JSON.parse(decrypted);
    
    // Validate required fields
    if (!isValidSessionToken(payload)) {
      return null;
    }
    
    return payload;
  } catch (error) {
    console.error('Token decryption failed:', error);
    return null;
  }
}

export function createStubToken(payload: SessionTokenData): string {
  console.warn('Using deprecated stub token creation. Please use createSessionToken() instead.');
  
  try {
    const STUB_SECRET = 'legacy-secret-for-stub-functions';
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
