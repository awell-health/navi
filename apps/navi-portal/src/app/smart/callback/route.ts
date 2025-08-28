import { NextRequest, NextResponse } from "next/server";
import { env } from "@/env";
import {
  errorRedirect,
  decodeState,
  getClientConfigForHost,
  extractIssuerKey,
  type SmartSessionData,
  createSmartTicket,
  mintTrustedTokenForStytch,
  attestTrustedToken,
} from "@/domains/smart";
import { ResponseCookie } from "next/dist/compiled/@edge-runtime/cookies";
import { getStatsig, initializeStatsig } from "@/lib/statsig";

export const runtime = "nodejs";

type TokenResponse = {
  access_token: string;
  token_type?: string;
  scope?: string;
  expires_in?: number;
  id_token?: string;
  patient?: string;
  encounter?: string;
  fhirUser?: string;
  sim_error?: string;
};

function normalizeErrorCode(code: string | undefined | null): string {
  if (!code) return "simulated_error";
  return code
    .trim()
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, "_")
    .replace(/^_+|_+$/g, "");
}

function safeDecodeJwtPayload<T>(jwt?: string): T | null {
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

function detectSimulatorError(token: TokenResponse): string | null {
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

function isExpiredToken(token: TokenResponse): boolean {
  const nowSeconds = Math.floor(Date.now() / 1000);
  const idClaims = safeDecodeJwtPayload<{ exp?: number }>(token.id_token);
  const idTokenExpired =
    typeof idClaims?.exp === "number" && idClaims.exp <= nowSeconds;
  const accessExpired =
    typeof token.expires_in === "number" && token.expires_in <= 0;
  return Boolean(accessExpired || idTokenExpired);
}

export async function GET(request: NextRequest) {
  const { searchParams } = new URL(request.url);
  const code = searchParams.get("code");
  const state = searchParams.get("state");
  const oauthError = searchParams.get("error");
  const oauthErrorDescription = searchParams.get("error_description");

  if (oauthError) {
    const preTmp = await decodeState(state);
    return errorRedirect(request, {
      code: oauthError,
      message: oauthErrorDescription ?? undefined,
      iss: preTmp?.iss,
    });
  }
  if (!code || !state) {
    return NextResponse.json(
      { error: "Missing code or state" },
      { status: 400 }
    );
  }

  if (!env.SMART_REDIRECT_URI) {
    return NextResponse.json(
      {
        error: "SMART env not configured",
        missing: {
          SMART_REDIRECT_URI: !env.SMART_REDIRECT_URI,
        },
      },
      { status: 500 }
    );
  }

  // Decode pre-auth directly from encrypted state value
  const pre = await decodeState(state);
  if (!pre) {
    return errorRedirect(request, {
      code: "invalid_state",
      message: "Invalid or missing state payload",
    });
  }

  const body = new URLSearchParams();
  body.set("grant_type", "authorization_code");
  body.set("code", code);
  body.set("redirect_uri", env.SMART_REDIRECT_URI);
  // Resolve client_id using KV mapping
  const host = extractIssuerKey(pre.iss);
  const clientConfig = await getClientConfigForHost(host);
  const clientId = clientConfig?.client_id ?? null;
  if (!clientId) {
    return errorRedirect(request, {
      code: "missing_client_id",
      message: "No client_id configured for issuer",
      iss: pre.iss,
    });
  }
  if (!clientConfig?.stytch_organization_id) {
    return errorRedirect(request, {
      code: "missing_stytch_organization_id",
      message:
        "There is no organization associated with this SMART client. Please contact your EHR admin to include a stytch_organization_id in the Awell configuration.",
      iss: pre.iss,
    });
  }
  body.set("client_id", clientId);
  body.set("code_verifier", pre.codeVerifier);

  let tokenRes: Response;
  let details: unknown = null;
  try {
    console.log(
      "Pinging token endpoint",
      pre.tokenEndpoint,
      "with body",
      body.toString()
    );
    tokenRes = await fetch(pre.tokenEndpoint, {
      method: "POST",
      headers: {
        "content-type": "application/x-www-form-urlencoded",
        accept: "application/json",
        ...(clientConfig?.client_secret && {
          authorization: `Basic ${Buffer.from(
            `${clientId}:${clientConfig.client_secret}`
          ).toString("base64")}`,
        }),
      },
      body,
    });
    try {
      details = await tokenRes.json();
    } catch {
      details = await tokenRes.text();
    }
  } catch (err) {
    return errorRedirect(request, {
      code: "token_request_failed",
      message: "Network or CORS error while contacting token endpoint",
      iss: pre?.iss ?? "",
    });
  }

  if (!tokenRes.ok) {
    console.log("Token exchange failed", tokenRes.status, details);
    // 400 indicates invalid_client, invalid_grant, etc. Pass through status for clarity
    return errorRedirect(request, {
      code: "token_exchange_failed",
      status: String(tokenRes.status),
      message: typeof details === "string" ? details : JSON.stringify(details),
      iss: pre?.iss ?? "",
    });
  }

  const tokenJson = (await tokenRes.json()) as TokenResponse;

  // Some simulator scenarios embed an error marker inside the JWT claims
  // of the access_token instead of top-level fields. Detect and surface it.
  try {
    if (typeof tokenJson.access_token === "string") {
      const parts = tokenJson.access_token.split(".");
      if (parts.length === 3) {
        const [, payloadB64] = parts;
        const base64 = payloadB64.replace(/-/g, "+").replace(/_/g, "/");
        const pad = base64.length % 4 === 0 ? 0 : 4 - (base64.length % 4);
        const decoded = atob(base64 + "=".repeat(pad));
        const claims = JSON.parse(decoded) as Partial<{
          auth_error: string;
          sim_error: string;
          error: string;
        }>;

        const embedded = claims.auth_error || claims.sim_error || claims.error;
        if (typeof embedded === "string" && embedded.length > 0) {
          const normalized = embedded
            .trim()
            .toLowerCase()
            .replace(/[^a-z0-9]+/g, "_")
            .replace(/^_+|_+$/g, "");
          return errorRedirect(request, {
            code: normalized || "simulated_error",
            message: `SMART launcher embedded error in token: ${embedded}`,
            iss: pre.iss,
            status: 200,
          });
        }
      }
    }
  } catch {
    // ignore parse errors
  }

  // Use unified simulator detection (top-level sim_error or embedded claim)
  const simCode = detectSimulatorError(tokenJson);
  if (simCode) {
    return errorRedirect(request, {
      code: simCode,
      message: `SMART launcher simulated error: ${simCode}`,
      iss: pre.iss,
      status: 200,
    });
  }
  // Detect mocked/expired tokens from the test launcher
  // - expires_in <= 0 indicates an already expired access token
  // - id_token with past exp also indicates expiry
  if (isExpiredToken(tokenJson)) {
    return errorRedirect(request, {
      code: "expired_token",
      message:
        "Authorization server returned an expired token during exchange.",
      iss: pre.iss,
      status: 200,
    });
  }

  // Extract fhirUser/profile from id_token claims if present
  let fhirUserFromIdToken: string | undefined;
  if (tokenJson.id_token) {
    try {
      const [, payloadB64] = tokenJson.id_token.split(".");
      if (payloadB64) {
        const base64 = payloadB64.replace(/-/g, "+").replace(/_/g, "/");
        const pad = base64.length % 4 === 0 ? 0 : 4 - (base64.length % 4);
        const decoded = atob(base64 + "=".repeat(pad));
        const claims = JSON.parse(decoded) as Partial<{
          fhirUser: string;
          profile: string;
        }>;
        fhirUserFromIdToken = claims.fhirUser || claims.profile;
      }
    } catch {
      // ignore parse errors and continue
    }
  }

  const finalFhirUser = tokenJson.fhirUser ?? fhirUserFromIdToken;
  if (!finalFhirUser) {
    return errorRedirect(request, {
      code: "missing_fhir_user",
      message:
        "Authorization did not include clinician identity (fhirUser/profile). Please contact your EHR admin to include fhirUser in the SMART launch.",
      iss: pre.iss,
      status: 200,
    });
  }

  const sessionData: SmartSessionData = {
    sid: crypto.randomUUID(),
    iss: pre.iss,
    tokenEndpoint: pre.tokenEndpoint,
    accessToken: tokenJson.access_token,
    idToken: tokenJson.id_token,
    scope: tokenJson.scope,
    patient: tokenJson.patient,
    encounter: tokenJson.encounter,
    fhirUser: finalFhirUser,
    expiresIn: tokenJson.expires_in,
    tokenType: tokenJson.token_type,
    stytchOrganizationId: clientConfig?.stytch_organization_id,
  };

  const fhirUserUUID = finalFhirUser.replace("Practitioner/", "");
  const mockEmail = `${fhirUserUUID}@test.com`;
  const token = await mintTrustedTokenForStytch({
    organizationId: clientConfig?.stytch_organization_id,
    practitionerUuid: finalFhirUser,
    email: mockEmail,
  });

  // Store one-time ticket in KV (short TTL)
  const ticket = await createSmartTicket(sessionData);
  // Build absolute redirect URL that respects reverse proxy / ngrok headers
  const forwardedProto = request.headers.get("x-forwarded-proto") ?? "https";
  const forwardedHost =
    request.headers.get("x-forwarded-host") ?? request.headers.get("host");
  const origin = forwardedHost
    ? `${forwardedProto}://${forwardedHost}`
    : new URL(request.url).origin;
  const smartHomeUrl = new URL("/smart/home", origin);
  smartHomeUrl.searchParams.set("ticket", ticket);
  const resp = NextResponse.redirect(smartHomeUrl.toString(), 302);
  if (token) {
    try {
      const attest = await attestTrustedToken({
        token,
        organizationId: clientConfig?.stytch_organization_id,
      });
      const cookieOptions: ResponseCookie = {
        name: "stytch_session",
        value: attest.session_token,
        maxAge: 60 * 60 * 24 * 30, // 30 days
        path: "/",
        sameSite: "none",
        domain: "",
      };
      if (env.HTTP_ONLY_COOKIES) {
        console.log("Setting HTTP-only cookie");
        cookieOptions.httpOnly = true;
        cookieOptions.domain = new URL(request.url).hostname; // env.HTTP_COOKIE_DOMAIN;
        cookieOptions.secure = true;
        cookieOptions.sameSite = "none";
      }
      resp.cookies.set(cookieOptions);
    } catch (err) {
      console.error(err);
      // Handle cases where the Stytch user cannot be found or attest fails
      const unknown = err as {
        status_code?: number;
        error_type?: string;
        error_message?: string;
        message?: string;
      };
      const isNotFound =
        typeof unknown.status_code === "number" && unknown.status_code === 404;
      const code = isNotFound ? "email_not_found" : "stytch_attest_failed";
      const message = isNotFound
        ? "A user for this application was not found. Please contact your EHR admin to ensure your user is able to use this application."
        : unknown.error_message;

      return errorRedirect(request, {
        code,
        message,
        iss: pre.iss,
        status: unknown.status_code,
      });
    }
  }
  return resp;
}
