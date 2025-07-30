import type {
  SessionTokenData,
  PatientIdentifier,
} from "@awell-health/navi-core/src/types";
import { env } from "@/env";

/**
 * Modern Embed Token Data Structure
 *
 * Used internally by navi-portal for route-to-route communication.
 * Supports both existing and new careflow creation workflows.
 *
 * This is the NEW approach - clean separation from legacy session tokens.
 */
export interface EmbedTokenData extends SessionTokenData {
  // Additional fields for new careflow creation
  careflowDefinitionId?: string;
  patientIdentifier?: PatientIdentifier;
  track_id?: string;
  activity_id?: string;
  stakeholder_id?: string;
}

// Utility functions for base64url encoding (AES-GCM compatible)
function uint8ArrayToBase64Url(uint8Array: Uint8Array): string {
  const base64 = btoa(String.fromCharCode(...uint8Array));
  return base64.replace(/\+/g, "-").replace(/\//g, "_").replace(/=/g, "");
}

function base64UrlToUint8Array(base64Url: string): Uint8Array {
  const base64 = base64Url
    .replace(/-/g, "+")
    .replace(/_/g, "/")
    .padEnd(base64Url.length + ((4 - (base64Url.length % 4)) % 4), "=");

  const binaryString = atob(base64);
  return new Uint8Array(binaryString.length).map((_, i) =>
    binaryString.charCodeAt(i)
  );
}

// Import encryption key for AES-GCM
async function getEncryptionKey(): Promise<CryptoKey> {
  const keyData = base64UrlToUint8Array(env.TOKEN_ENCRYPTION_KEY);
  return await crypto.subtle.importKey(
    "raw",
    keyData,
    { name: "AES-GCM", length: 256 },
    false,
    ["encrypt", "decrypt"]
  );
}

/**
 * Creates an encrypted embed token from embed data (modern approach)
 * Supports both existing and new careflow workflows
 */
export async function createEmbedToken(
  payload: EmbedTokenData
): Promise<string> {
  try {
    const key = await getEncryptionKey();
    const jsonPayload = JSON.stringify(payload);
    const plaintext = new TextEncoder().encode(jsonPayload);

    // Generate random IV (96 bits for GCM)
    const iv = crypto.getRandomValues(new Uint8Array(12));

    // Encrypt with AES-GCM
    const ciphertext = await crypto.subtle.encrypt(
      { name: "AES-GCM", iv },
      key,
      plaintext
    );

    // Combine IV + ciphertext and encode as base64
    const combined = new Uint8Array(iv.length + ciphertext.byteLength);
    combined.set(iv, 0);
    combined.set(new Uint8Array(ciphertext), iv.length);

    return uint8ArrayToBase64Url(combined);
  } catch (error) {
    console.error("Embed token encryption failed:", error);
    throw new Error("Failed to create embed token");
  }
}

/**
 * Decrypts an embed token and returns the embed data (modern approach)
 * Supports both existing and new careflow workflows
 */
export async function decryptEmbedToken(
  token: string
): Promise<EmbedTokenData | null> {
  try {
    const key = await getEncryptionKey();
    const combined = base64UrlToUint8Array(token);

    // Extract IV (first 12 bytes) and ciphertext
    const iv = combined.slice(0, 12);
    const ciphertext = combined.slice(12);

    // Decrypt with AES-GCM
    const plaintext = await crypto.subtle.decrypt(
      { name: "AES-GCM", iv },
      key,
      ciphertext
    );

    // Parse JSON payload
    const decryptedText = new TextDecoder().decode(plaintext);
    const payload = JSON.parse(decryptedText);

    // Basic validation - ensure required fields exist
    if (!payload.orgId || !payload.tenantId || !payload.environment) {
      return null;
    }

    // Return as EmbedTokenData (includes optional careflowDefinitionId, etc.)
    return payload as EmbedTokenData;
  } catch (error) {
    console.error("Embed token decryption failed:", error);
    return null;
  }
}
