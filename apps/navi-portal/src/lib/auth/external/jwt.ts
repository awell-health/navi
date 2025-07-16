import { SignJWT, jwtVerify } from "jose";
import { env } from "@/env";
import type {
  JWTPayload,
  SessionTokenData,
} from "@awell-health/navi-core/src/types";

// Create the signing secret as Uint8Array (required by jose)
function getJWTSecret(): Uint8Array {
  return new TextEncoder().encode(env.JWT_SIGNING_KEY);
}

// Create a properly signed JWT using jose
export async function createJWT(
  sessionTokenData: SessionTokenData,
  expiresInMinutes: number = 15
): Promise<string> {
  try {
    const secret = getJWTSecret();

    const jwt = await new SignJWT({
      sub: sessionTokenData.careflowId,
      stakeholder_id: sessionTokenData.stakeholderId, // Use the actual stakeholder, not just patient
      patient_id: sessionTokenData.patientId,
      tenant_id: sessionTokenData.tenantId,
      org_id: sessionTokenData.orgId,
      environment: sessionTokenData.environment,
      authentication_state: sessionTokenData.authenticationState,
      iss: env.JWT_KEY_ID, // Kong uses this to lookup the consumer/credential
    })
      .setProtectedHeader({ alg: "HS256" })
      .setExpirationTime(`${expiresInMinutes}m`)
      .setIssuedAt()
      .sign(secret);

    return jwt;
  } catch (error) {
    console.error("JWT creation failed:", error);
    throw new Error("Failed to create JWT");
  }
}

// Verify and decode a JWT using jose
export async function verifyJWT(jwt: string): Promise<JWTPayload | null> {
  try {
    const secret = getJWTSecret();

    const { payload } = await jwtVerify(jwt, secret, {
      issuer: env.JWT_KEY_ID, // Validate issuer
      algorithms: ["HS256"], // Only allow HMAC-SHA256
    });

    // Validate that the payload has our expected structure
    if (
      typeof payload.sub === "string" &&
      typeof payload.stakeholder_id === "string" &&
      typeof payload.patient_id === "string" &&
      typeof payload.tenant_id === "string" &&
      typeof payload.org_id === "string" &&
      typeof payload.environment === "string" &&
      typeof payload.authentication_state === "string" &&
      typeof payload.iss === "string" &&
      typeof payload.exp === "number" &&
      typeof payload.iat === "number"
    ) {
      return payload as unknown as JWTPayload;
    }

    console.error("JWT payload missing required fields");
    return null;
  } catch (error) {
    console.error("JWT verification failed:", error);
    return null;
  }
}
