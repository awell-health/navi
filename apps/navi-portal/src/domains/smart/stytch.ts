"use server";

import { env } from "@/env";
import { SignJWT, importPKCS8 } from "jose";
import { B2BClient, StytchError } from "stytch";
import { cookies } from "next/headers";

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


  const signObject = {
    sub: params.practitionerUuid,
    // custom_email_claim: 'pawel@awellhealth.com',
    custom_email_claim: 'pawel@awellhealth.com', // params.email,
    organization_id: params.organizationId,
    iss: TRUSTED_ISS,
    aud: TRUSTED_AUD,
    iat: now,
    exp: now + 5 * 60,
  }

  console.log("----------------------> signObject", signObject);


  return await new SignJWT(signObject)
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
}) {
  const stytch = await loadStytch();

  const attest = await stytch.sessions.attest({
    profile_id: env.STYTCH_TRUSTED_TOKEN_PROFILE_ID,
    token: params.token,
    organization_id: params.organizationId,
  });

  return attest;

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
