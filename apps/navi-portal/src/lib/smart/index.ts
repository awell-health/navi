import { env } from "@/env";

function toBase64Url(input: ArrayBuffer | Uint8Array): string {
  const bytes = input instanceof Uint8Array ? input : new Uint8Array(input);
  let binary = "";
  for (let i = 0; i < bytes.length; i += 1) {
    binary += String.fromCharCode(bytes[i] as number);
  }
  const base64 = btoa(binary);
  return base64.replace(/\+/g, "-").replace(/\//g, "_").replace(/=+$/g, "");
}

function fromBase64Url(input: string): Uint8Array {
  const base64 = input.replace(/-/g, "+").replace(/_/g, "/");
  const pad = base64.length % 4 === 0 ? 0 : 4 - (base64.length % 4);
  const base64Padded = base64 + "=".repeat(pad);
  const binary = atob(base64Padded);
  const bytes = new Uint8Array(binary.length);
  for (let i = 0; i < binary.length; i += 1) {
    bytes[i] = binary.charCodeAt(i);
  }
  return bytes;
}

export async function sha256(value: string): Promise<string> {
  const encoder = new TextEncoder();
  const data = encoder.encode(value);
  const digest = await crypto.subtle.digest("SHA-256", data);
  return toBase64Url(digest);
}

export function randomString(bytes: number = 32): string {
  const random = crypto.getRandomValues(new Uint8Array(bytes));
  return toBase64Url(random);
}

export async function generatePKCE(): Promise<{
  codeVerifier: string;
  codeChallenge: string;
}> {
  const codeVerifier = randomString(32);
  const codeChallenge = await sha256(codeVerifier);
  return { codeVerifier, codeChallenge };
}

async function getAesGcmKey(): Promise<CryptoKey> {
  const keyBytes = normalizeKeyToBytes(env.TOKEN_ENCRYPTION_KEY);
  return crypto.subtle.importKey(
    "raw",
    keyBytes,
    { name: "AES-GCM", length: 256 },
    false,
    ["encrypt", "decrypt"]
  );
}

function normalizeKeyToBytes(key: string): Uint8Array {
  const trimmed = key.trim();

  // Try base64/base64url first (44 chars typical for 32 bytes)
  try {
    const bytes = fromBase64Url(trimmed);
    if (bytes.length === 32) return bytes;
  } catch {
    // ignore
  }

  // Try hex (64 hex chars → 32 bytes)
  if (/^[0-9a-fA-F]{64}$/.test(trimmed)) {
    const out = new Uint8Array(32);
    for (let i = 0; i < 64; i += 2) {
      out[i / 2] = parseInt(trimmed.slice(i, i + 2), 16);
    }
    return out;
  }

  // Fallback: interpret as 32 ASCII/UTF-8 bytes
  if (trimmed.length === 32) {
    const encoder = new TextEncoder();
    const bytes = encoder.encode(trimmed);
    if (bytes.length === 32) return bytes;
  }

  throw new Error(
    "TOKEN_ENCRYPTION_KEY must be 32 bytes (provide as base64/base64url, 64-char hex, or 32-char raw)."
  );
}

export async function encryptObject(obj: unknown): Promise<string> {
  const json = JSON.stringify(obj);
  const encoder = new TextEncoder();
  const data = encoder.encode(json);
  const iv = crypto.getRandomValues(new Uint8Array(12));
  const key = await getAesGcmKey();
  const ciphertext = await crypto.subtle.encrypt(
    { name: "AES-GCM", iv },
    key,
    data
  );
  const combined = new Uint8Array(
    iv.length + (ciphertext as ArrayBuffer).byteLength
  );
  combined.set(iv, 0);
  combined.set(new Uint8Array(ciphertext as ArrayBuffer), iv.length);
  return toBase64Url(combined);
}

export async function decryptObject<T>(token: string): Promise<T> {
  const raw = fromBase64Url(token);
  const iv = raw.slice(0, 12);
  const data = raw.slice(12);
  const key = await getAesGcmKey();
  const plaintext = await crypto.subtle.decrypt(
    { name: "AES-GCM", iv },
    key,
    data
  );
  const decoder = new TextDecoder();
  const json = decoder.decode(plaintext);
  return JSON.parse(json) as T;
}

export interface SmartPreAuth {
  iss: string;
  authorizationEndpoint: string;
  tokenEndpoint: string;
  codeVerifier: string;
  state: string;
  scopes: string;
  launch?: string;
}

export interface SmartSessionData {
  sid: string;
  iss: string;
  tokenEndpoint: string;
  accessToken: string;
  idToken?: string;
  scope?: string;
  patient?: string;
  encounter?: string;
  fhirUser?: string;
  expiresIn?: number;
  tokenType?: string;
}

export async function discoverSmartConfiguration(iss: string): Promise<{
  authorization_endpoint: string;
  token_endpoint: string;
}> {
  const wellKnownUrls = [
    `${iss.replace(/\/$/, "")}/.well-known/smart-configuration`,
    `${iss.replace(/\/$/, "")}/.well-known/oauth-authorization-server`,
  ];
  let lastError: unknown;
  for (const url of wellKnownUrls) {
    try {
      const res = await fetch(url, { headers: { accept: "application/json" } });
      if (res.ok) {
        const json = (await res.json()) as {
          authorization_endpoint?: string;
          token_endpoint?: string;
        };
        if (json.authorization_endpoint && json.token_endpoint) {
          return {
            authorization_endpoint: json.authorization_endpoint,
            token_endpoint: json.token_endpoint,
          };
        }
      }
    } catch (err) {
      lastError = err;
    }
  }
  throw new Error(
    `Unable to discover SMART configuration for issuer: ${iss}${
      lastError ? " (" + String(lastError) + ")" : ""
    }`
  );
}
