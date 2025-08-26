import { NextRequest, NextResponse } from "next/server";
import { env } from "@/env";
import {
  encryptObject,
  generatePKCE,
  type SmartPreAuth,
  discoverSmartConfiguration,
  errorRedirect,
  getIssuerHost,
  getClientConfigForHost,
} from "@/domains/smart";

export const runtime = "edge";

export async function GET(request: NextRequest) {
  const { searchParams } = new URL(request.url);
  const iss = searchParams.get("iss");
  const launch = searchParams.get("launch") ?? undefined;

  if (!iss) {
    return NextResponse.json(
      { error: "Missing iss parameter" },
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

  let authorization_endpoint: string;
  let token_endpoint: string;
  try {
    const discovered = await discoverSmartConfiguration(iss);
    authorization_endpoint = discovered.authorization_endpoint;
    token_endpoint = discovered.token_endpoint;
  } catch (err) {
    const forwardedProto = request.headers.get("x-forwarded-proto") ?? "https";
    const forwardedHost =
      request.headers.get("x-forwarded-host") ?? request.headers.get("host");
    const origin = forwardedHost
      ? `${forwardedProto}://${forwardedHost}`
      : new URL(request.url).origin;
    const errorUrl = new URL("/smart/error", origin);
    errorUrl.searchParams.set("code", "discovery_failed");
    errorUrl.searchParams.set("message", "Failed to load SMART configuration");
    errorUrl.searchParams.set("iss", iss);
    return NextResponse.redirect(errorUrl.toString(), 302);
  }

  const scopes = [
    "launch",
    "openid",
    "fhirUser",
    "launch/patient",
    "launch/encounter",
    "patient/*.read",
  ].join(" ");

  const { codeVerifier, codeChallenge } = await generatePKCE();
  const state = crypto.randomUUID();

  const preAuth: SmartPreAuth = {
    iss,
    authorizationEndpoint: authorization_endpoint,
    tokenEndpoint: token_endpoint,
    codeVerifier,
    state,
    scopes,
    launch,
  };

  // Encode pre-auth into state to avoid third-party cookies
  const encryptedState = await encryptObject(preAuth);

  // Resolve client_id from KV mapping (fallback to env)
  const issuerKey = getIssuerHost(iss);
  const clientConfig = await getClientConfigForHost(issuerKey);
  const clientId = clientConfig?.client_id ?? null;
  if (!clientId) {
    return errorRedirect(request, {
      code: "missing_client_id",
      message: `No client_id configured for issuer host: ${issuerKey}`,
      iss,
    });
  }

  const redirectUrl = new URL(authorization_endpoint);
  redirectUrl.searchParams.set("response_type", "code");
  redirectUrl.searchParams.set("client_id", clientId);
  redirectUrl.searchParams.set("redirect_uri", env.SMART_REDIRECT_URI);
  redirectUrl.searchParams.set("scope", scopes);
  redirectUrl.searchParams.set("state", encryptedState);
  redirectUrl.searchParams.set("aud", iss);
  redirectUrl.searchParams.set("code_challenge", codeChallenge);
  redirectUrl.searchParams.set("code_challenge_method", "S256");
  if (launch) redirectUrl.searchParams.set("launch", launch);

  return NextResponse.redirect(redirectUrl.toString(), 302);
}
