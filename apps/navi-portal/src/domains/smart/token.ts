import { z } from "zod";

// Parsed SMART token response returned by the authorization server
// Note: Additional properties are allowed (e.g., patient, encounter, fhirUser)
export const TokenResponseSchema = z
  .object({
    access_token: z.string(),
    token_type: z.string(),
    scope: z.string(),
    expires_in: z.number().optional(),
    id_token: z.string(),
    sim_error: z.string().optional(),
    // Optional extras seen in some SMART servers or simulators
    patient: z.string().optional(),
    encounter: z.string().optional(),
    fhirUser: z.string().optional(),
  })
  .passthrough();

export type TokenResponse = z.infer<typeof TokenResponseSchema>;

export function parseTokenResponse(input: unknown): TokenResponse {
  return TokenResponseSchema.parse(input);
}

export function safeDecodeJwtPayload<T>(jwt?: string): T | null {
  if (!jwt || typeof jwt !== "string") return null;
  try {
    const parts = jwt.split(".");
    if (parts.length !== 3) return null;
    const [, payloadB64] = parts;
    const base64 = payloadB64.replace(/-/g, "+").replace(/_/g, "/");
    const pad = base64.length % 4 === 0 ? 0 : 4 - (base64.length % 4);
    const decoded = atob(base64 + "=".repeat(pad));
    return JSON.parse(decoded) as T;
  } catch {
    return null;
  }
}

export type DecodedIdToken = {
  sub?: string;
  fhirUser?: string;
  profile?: string;
};

export function decodeIdToken(idToken?: string): DecodedIdToken | null {
  const claims = safeDecodeJwtPayload<DecodedIdToken>(idToken);
  if (!claims) return null;
  return {
    sub: claims.sub,
    fhirUser: claims.fhirUser,
    profile: claims.profile,
  };
}

export function normalizeErrorCode(code: string | undefined | null): string {
  if (!code) return "simulated_error";
  return code
    .trim()
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, "_")
    .replace(/^_+|_+$/g, "");
}

export function detectSimulatorError(token: TokenResponse): string | null {
  if (typeof token.sim_error === "string" && token.sim_error.length > 0) {
    return normalizeErrorCode(token.sim_error);
  }
  const embedded = safeDecodeJwtPayload<{
    auth_error?: string;
    sim_error?: string;
    error?: string;
  }>(token.access_token);
  const candidate =
    embedded?.auth_error || embedded?.sim_error || embedded?.error;
  return candidate ? normalizeErrorCode(candidate) : null;
}

export function isExpiredToken(token: TokenResponse): boolean {
  const nowSeconds = Math.floor(Date.now() / 1000);
  const idClaims = safeDecodeJwtPayload<{ exp?: number }>(token.id_token);
  const idTokenExpired =
    typeof idClaims?.exp === "number" && idClaims.exp <= nowSeconds;
  const accessExpired =
    typeof token.expires_in === "number" && token.expires_in <= 0;
  return Boolean(accessExpired || idTokenExpired);
}

export function getClinicianFhirUser(token: TokenResponse): string | null {
  if (typeof token.fhirUser === "string" && token.fhirUser.length > 0) {
    return token.fhirUser;
  }
  const decoded = decodeIdToken(token.id_token);
  const fhirUser = decoded?.fhirUser || decoded?.profile;
  return fhirUser ?? null;
}

export async function exchangeAuthorizationCode(params: {
  tokenEndpoint: string;
  clientId: string;
  code: string;
  redirectUri: string;
  codeVerifier: string;
  clientSecret?: string;
}): Promise<TokenResponse> {
  const body = new URLSearchParams();
  body.set("grant_type", "authorization_code");
  body.set("code", params.code);
  body.set("redirect_uri", params.redirectUri);
  body.set("client_id", params.clientId);
  body.set("code_verifier", params.codeVerifier);

  const headers: Record<string, string> = {
    "content-type": "application/x-www-form-urlencoded",
    accept: "application/json",
  };
  if (params.clientSecret) {
    headers.authorization = `Basic ${Buffer.from(
      `${params.clientId}:${params.clientSecret}`
    ).toString("base64")}`;
  }

  const res = await fetch(params.tokenEndpoint, {
    method: "POST",
    headers,
    body,
  });
  let payload: unknown;
  try {
    payload = await res.json();
  } catch {
    payload = await res.text();
  }
  if (!res.ok) {
    const message =
      typeof payload === "string" ? payload : JSON.stringify(payload);
    throw Object.assign(new Error("token_exchange_failed"), {
      status: res.status,
      message,
    });
  }
  return parseTokenResponse(payload);
}
