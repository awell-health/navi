import { NextRequest, NextResponse } from "next/server";
import { env } from "@/env";
import {
  buildStytchCookieOptions,
  attestTrustedToken,
  fetchStytchMemberByExternalId,
  getTenantIdForEnvironment,
  mintAwellJwt,
  type SmartSessionData,
  createSmartTicket,
} from "@/domains/smart";
import { initializeStatsig, Statsig } from "@/lib/statsig.edge";
import { TokenEnvironment } from "@awell-health/navi-core";

export const runtime = "edge";

export async function GET(request: NextRequest) {
  await initializeStatsig().catch((e) => {
    console.error("Error initializing Statsig", e);
  });

  const { searchParams } = new URL(request.url);
  const patientIdentifier = searchParams.get("patient_identifier");
  const token = searchParams.get("token");
  const organizationId = searchParams.get("organization_id");
  const profileId = searchParams.get("trusted_token_profile_id") ?? undefined;
  const environment = searchParams.get("environment") ?? "sandbox";

  if (!patientIdentifier || !token || !organizationId) {
    return NextResponse.json(
      {
        error: "Missing required params",
        missing: {
          patient_identifier: !patientIdentifier,
          token: !token,
          organization_id: !organizationId,
        },
      },
      { status: 400 }
    );
  }

  // Parse identifier of form `${system}|${value}`
  const [iss, patient] = patientIdentifier.split("|");
  if (!iss || !patient) {
    return NextResponse.json(
      { error: "Invalid patient_identifier format. Expected system|value" },
      { status: 400 }
    );
  }

  try {
    // Attest the provided trusted token and set session cookie
    const attest = await attestTrustedToken({
      token,
      organizationId,
      profileId,
    });

    let cookieOptions = await buildStytchCookieOptions({
      sessionToken: attest.session_token,
      httpOnly: false,
    });

    const gate = Statsig.checkGateSync(
      {
        userID: patient,
        customIDs: { org_id: organizationId },
      },
      "http_only_cookies"
    );

    if (gate) {
      cookieOptions = await buildStytchCookieOptions({
        sessionToken: attest.session_token,
        httpOnly: true,
        domain: env.HTTP_COOKIE_DOMAIN,
      });
    }

    // Determine tenant/environment for awell.jwt
    const tenantId = await getTenantIdForEnvironment({
      organization_id: organizationId,
      environment: environment as TokenEnvironment,
    });

    // Construct minimal SMART session compatible object for /smart/home
    const sessionData: SmartSessionData = {
      sid: crypto.randomUUID(),
      iss,
      tokenEndpoint: `${iss}/token`,
      accessToken: "",
      idToken: undefined,
      patient,
      encounter: undefined,
      fhirUser: patient,
      expiresIn: 5 * 60,
      tokenType: "Bearer",
      stytchOrganizationId: organizationId,
    };

    const ticket = await createSmartTicket(sessionData);

    // Build redirect to /smart/home with ticket
    const forwardedProto = request.headers.get("x-forwarded-proto") ?? "https";
    const forwardedHost =
      request.headers.get("x-forwarded-host") ?? request.headers.get("host");
    const origin = forwardedHost
      ? `${forwardedProto}://${forwardedHost}`
      : new URL(request.url).origin;
    const redirectUrl = new URL("/smart/home", origin);
    redirectUrl.searchParams.set("ticket", ticket);

    const resp = NextResponse.redirect(redirectUrl.toString(), 302);
    resp.cookies.set(cookieOptions);

    // Issue awell.jwt for authenticated user
    const jwt = await mintAwellJwt({
      sub: sessionData.sid,
      orgId: organizationId,
      tenantId: tenantId ?? "",
      environment:
        env.NODE_ENV === "production" ? "production-us" : "development",
      authenticationState: "authenticated",
    });
    resp.cookies.set("awell.jwt", jwt, {
      httpOnly: true,
      sameSite: process.env.NODE_ENV === "production" ? "none" : "lax",
      secure: process.env.NODE_ENV === "production",
      maxAge: 15 * 60,
      path: "/",
    });

    return resp;
  } catch (err) {
    console.error(err);
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
      ? "A user for this application was not found."
      : unknown.error_message ?? unknown.message ?? "Unknown error";
    return NextResponse.json({ error: code, message }, { status: 400 });
  }
}
