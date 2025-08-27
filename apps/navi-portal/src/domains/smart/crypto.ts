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
  try {
    const bytes = fromBase64Url(trimmed);
    if (bytes.length === 32) return bytes;
  } catch {}
  if (/^[0-9a-fA-F]{64}$/.test(trimmed)) {
    const out = new Uint8Array(32);
    for (let i = 0; i < 64; i += 2)
      out[i / 2] = parseInt(trimmed.slice(i, i + 2), 16);
    return out;
  }
  if (trimmed.length === 32) {
    const encoder = new TextEncoder();
    const bytes = encoder.encode(trimmed);
    if (bytes.length === 32) return bytes;
  }
  throw new Error(
    "TOKEN_ENCRYPTION_KEY must be 32 bytes (base64/base64url, 64-hex, or 32-char raw)"
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
