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
  detectSimulatorError,
  isExpiredToken,
  getClinicianFhirUser,
  decodeIdToken,
  getRequestOrigin,
  buildStytchCookieOptions,
  exchangeAuthorizationCode,
  fetchStytchMemberByExternalId,
  getTenantIdForEnvironment,
  mintAwellJwt,
} from "@/domains/smart";
import { initializeStatsig, Statsig } from "@/lib/statsig.edge";

export async function GET(request: NextRequest) {
  await initializeStatsig()
    .then(() => {
      console.log("Statsig initialized");
    })
    .catch((e) => {
      console.error("Error initializing Statsig", e);
    });
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
  let tokenJson;
  try {
    tokenJson = await exchangeAuthorizationCode({
      tokenEndpoint: pre.tokenEndpoint,
      clientId,
      code,
      redirectUri: env.SMART_REDIRECT_URI,
      codeVerifier: pre.codeVerifier,
      clientSecret: clientConfig?.client_secret,
    });
  } catch (err) {
    const status = (err as { status?: number }).status;
    const message = (err as { message?: string }).message;
    return errorRedirect(request, {
      code: "token_exchange_failed",
      status: status ? String(status) : undefined,
      message,
      iss: pre?.iss ?? "",
    });
  }
  console.log("TokenResponse", tokenJson);

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

  // Resolve clinician identity from token or id_token
  const clinicianFhirUser = getClinicianFhirUser(tokenJson);
  console.log("fhirUser", clinicianFhirUser);
  if (!clinicianFhirUser) {
    return errorRedirect(request, {
      code: "missing_fhir_user",
      message:
        "Authorization did not include clinician identity (fhirUser/profile). Please contact your EHR admin to include fhirUser in the SMART launch.",
      iss: pre.iss,
      status: 200,
    });
  }

  const subject = decodeIdToken(tokenJson.id_token)?.sub;
  console.log("subject", subject);
  const organizationId = clientConfig?.stytch_organization_id;
  const stytchMember = await fetchStytchMemberByExternalId({
    organization_id: organizationId,
    externalId: subject,
  });
  if (!stytchMember) {
    return errorRedirect(request, {
      code: "email_not_found",
      message:
        "A user for this application was not found. Please contact your EHR admin to ensure your user is able to use this application.",
      iss: pre.iss,
      status: 404,
    });
  }

  // Resolve tenant_id from Stytch organization metadata for the given environment
  const tenantId = await getTenantIdForEnvironment({
    organization_id: organizationId,
    environment: clientConfig.environment ?? "development",
  });

  const sessionData: SmartSessionData = {
    sid: pre.state,
    iss: pre.iss,
    tokenEndpoint: pre.tokenEndpoint,
    accessToken: tokenJson.access_token,
    idToken: tokenJson.id_token,
    scope: tokenJson.scope,
    patient: tokenJson.patient,
    encounter: tokenJson.encounter,
    fhirUser: clinicianFhirUser,
    expiresIn: tokenJson.expires_in,
    tokenType: tokenJson.token_type,
    stytchOrganizationId: clientConfig?.stytch_organization_id,
  };
  console.log("Minting trusted token for Stytch");
  const token = await mintTrustedTokenForStytch({
    organizationId,
    practitionerUuid: clinicianFhirUser,
    email: stytchMember.email_address,
  });

  const ticket = await createSmartTicket(sessionData);
  // Build absolute redirect URL that respects reverse proxy / ngrok headers
  const origin = await getRequestOrigin(request);
  const smartHomeUrl = new URL("/smart/home", origin);
  smartHomeUrl.searchParams.set("ticket", ticket);
  const resp = NextResponse.redirect(smartHomeUrl.toString(), 302);
  if (token) {
    try {
      const attest = await attestTrustedToken({ token, organizationId });
      console.log("Attest", attest);
      let cookieOptions = await buildStytchCookieOptions({
        sessionToken: attest.session_token,
        httpOnly: false,
      });
      const gate = Statsig.checkGateSync(
        {
          userID: clinicianFhirUser,
          customIDs: {
            org_id: clientConfig?.stytch_organization_id,
          },
        },
        "http_only_cookies"
      );
      console.log("Gate", gate);

      if (gate) {
        console.log("Setting HTTP-only cookie");
        cookieOptions = await buildStytchCookieOptions({
          sessionToken: attest.session_token,
          httpOnly: true,
          domain: env.HTTP_COOKIE_DOMAIN,
        });
      }
      resp.cookies.set(cookieOptions);

      // Issue awell.jwt for authenticated user (no awell.sid dependency)
      const jwt = await mintAwellJwt({
        sub: pre.state,
        orgId: organizationId,
        tenantId: tenantId ?? "",
        environment: clientConfig.environment ?? "development",
        authenticationState: "authenticated",
      });
      resp.cookies.set("awell.jwt", jwt, {
        httpOnly: true,
        sameSite: process.env.NODE_ENV === "production" ? "none" : "lax",
        secure: process.env.NODE_ENV === "production",
        maxAge: 15 * 60,
        path: "/",
      });
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
