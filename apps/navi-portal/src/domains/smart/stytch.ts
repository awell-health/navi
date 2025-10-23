"use server";

import { env } from "@/env";
import { SignJWT, importPKCS8 } from "jose";
import { B2BClient, B2BOrganizationsMembersGetRequest } from "stytch";
import { cookies } from "next/headers";
import type { ResponseCookie } from "next/dist/compiled/@edge-runtime/cookies";
import { TokenEnvironment } from "@awell-health/navi-core";

const TRUSTED_ISS = env.BASE_URL ?? "https://navi-portal.awellhealth.com";
const TRUSTED_AUD = "navi-stytch-attest";

export async function mintTrustedTokenForStytch(params: {
  organizationId: string;
  practitionerUuid: string;
  email: string; // temporary mock is fine
}): Promise<string | null> {
  if (
    !env.STYTCH_TRUSTED_TOKEN_PRIVATE_KEY_B64 ||
    !env.STYTCH_TRUSTED_TOKEN_KID
  )
    return null;
  const pem = Buffer.from(
    env.STYTCH_TRUSTED_TOKEN_PRIVATE_KEY_B64,
    "base64"
  ).toString("utf8");
  const privateKey = await importPKCS8(pem, "RS256");
  const now = Math.floor(Date.now() / 1000);
  return await new SignJWT({
    sub: params.practitionerUuid,
    custom_email_claim: params.email,
    organization_id: params.organizationId,
    iss: TRUSTED_ISS,
    aud: TRUSTED_AUD,
    iat: now,
    exp: now + 5 * 60,
  })
    .setProtectedHeader({ alg: "RS256", kid: env.STYTCH_TRUSTED_TOKEN_KID })
    .sign(privateKey);
}

let stytch: B2BClient | null = null;

const loadStytch = async () => {
  if (stytch) return stytch;
  stytch = new B2BClient({
    project_id: env.STYTCH_B2B_PROJECT_ID,
    secret: env.STYTCH_B2B_SECRET,
    custom_base_url: env.STYTCH_B2B_BASE_URL,
  });
  return stytch;
};

export async function attestTrustedToken(params: {
  token: string;
  organizationId: string;
  /** Optional override for the trusted token profile ID */
  profileId?: string;
}) {
  const stytch = await loadStytch();
  return await stytch.sessions.attest({
    profile_id: params.profileId ?? env.STYTCH_TRUSTED_TOKEN_PROFILE_ID,
    token: params.token,
    organization_id: params.organizationId,
  });
}

export async function requireStytchSession() {
  const cookieStore = await cookies();
  const sessionToken = cookieStore.get("stytch_session")?.value;
  if (!sessionToken) {
    throw new Error("Not authenticated");
  }
  const stytch = await loadStytch();
  try {
    await stytch.sessions.authenticate({ session_token: sessionToken });
  } catch (err) {
    throw new Error("Invalid session");
  }
  return { sessionToken };
}

export async function buildStytchCookieOptions(params: {
  sessionToken: string;
  httpOnly: boolean;
  domain?: string;
}): Promise<ResponseCookie> {
  return {
    name: "stytch_session",
    value: params.sessionToken,
    maxAge: 60 * 60 * 24 * 30,
    path: "/",
    sameSite: "none",
    httpOnly: params.httpOnly,
    secure: true,
    domain: params.domain,
  };
}

export type StytchMember = {
  member_id: string;
  email_address: string;
  name?: string | null;
  status?: string | null;
  external_id?: string | null;
};

export async function fetchStytchMemberByExternalId(params: {
  organization_id: string;
  externalId?: string | null;
}): Promise<StytchMember | null> {
  if (!params.externalId) return null;
  const stytch = await loadStytch();
  const request: B2BOrganizationsMembersGetRequest = {
    organization_id: params.organization_id,
    member_id: String(params.externalId),
  };
  try {
    console.log("Fetching Stytch member by external ID", request);
    const res = await stytch.organizations.members.get(request);
    console.log("Stytch member response", res);
    const member = (res?.member ?? null) as StytchMember | null;
    console.log("Stytch member", member);
    return member;
  } catch (err) {
    console.error(
      "Error in fetchStytchMemberByExternalId",
      JSON.stringify(err)
    );
    return null;
  }
}

export async function getTenantIdForEnvironment(params: {
  organization_id: string;
  environment: TokenEnvironment;
}): Promise<string | null> {
  const stytch = await loadStytch();
  try {
    const org = await stytch.organizations.get({
      organization_id: params.organization_id,
    });
    const trusted = org?.organization?.trusted_metadata as
      | { tenant_ids?: Record<string, string> }
      | undefined;
    const map = trusted?.tenant_ids ?? {};
    const tenantId = map[params.environment] ?? null;
    return tenantId ?? null;
  } catch (err) {
    console.error("Error fetching Stytch organization", err);
    return null;
  }
}
