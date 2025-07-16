/**
 * @vitest-environment node
 */
import { describe, it, expect } from "vitest";
import { createJWT, verifyJWT } from "./jwt";
import type { SessionTokenData } from "@awell-health/navi-core/src/types";

describe("JWT Utils (jose implementation)", () => {
  const sessionTokenData: SessionTokenData = {
    patientId: "patient123",
    careflowId: "careflow456",
    stakeholderId: "stakeholder123",
    orgId: "org123",
    tenantId: "tenant123",
    environment: "test",
    authenticationState: "unauthenticated",
    exp: Date.now() + 60000,
  };

  it("should create and verify a valid JWT", async () => {
    const expiresInMinutes = 15;

    // Create JWT using jose
    const jwt = await createJWT(sessionTokenData, expiresInMinutes);

    expect(jwt).toBeDefined();
    expect(typeof jwt).toBe("string");
    expect(jwt.split(".").length).toBe(3); // header.payload.signature

    // Verify JWT using jose
    const payload = await verifyJWT(jwt);

    expect(payload).toBeDefined();
    expect(payload?.sub).toBe(sessionTokenData.careflowId);
    expect(payload?.stakeholder_id).toBe(sessionTokenData.stakeholderId);
    expect(payload?.patient_id).toBe(sessionTokenData.patientId);
    expect(payload?.tenant_id).toBe(sessionTokenData.tenantId);
    expect(payload?.org_id).toBe(sessionTokenData.orgId);
    expect(payload?.environment).toBe(sessionTokenData.environment);
    expect(payload?.authentication_state).toBe(
      sessionTokenData.authenticationState
    );
    expect(payload?.iss).toBeDefined();
    expect(payload?.exp).toBeGreaterThan(Math.floor(Date.now() / 1000));
    expect(payload?.iat).toBeLessThanOrEqual(Math.floor(Date.now() / 1000));
  });

  it("should handle invalid JWT gracefully", async () => {
    const invalidJwt = "invalid.jwt.token";
    const payload = await verifyJWT(invalidJwt);

    expect(payload).toBeNull();
  });

  it("should handle malformed JWT gracefully", async () => {
    const malformedJwt = "not-a-jwt";
    const payload = await verifyJWT(malformedJwt);

    expect(payload).toBeNull();
  });

  it("should reject expired JWT", async () => {
    // Create a JWT that expires immediately
    const jwt = await createJWT(sessionTokenData, 0.001); // 0.001 minutes = 0.06 seconds

    // Wait for it to expire
    await new Promise((resolve) => setTimeout(resolve, 100));

    const payload = await verifyJWT(jwt);
    expect(payload).toBeNull();
  });

  it("should create JWT with correct issuer", async () => {
    const jwt = await createJWT(sessionTokenData, 15);
    const payload = await verifyJWT(jwt);

    expect(payload?.iss).toBeDefined();
    expect(typeof payload?.iss).toBe("string");
  });

  it("should handle different session token data", async () => {
    const differentSessionData: SessionTokenData = {
      patientId: "different-patient",
      careflowId: "different-careflow",
      stakeholderId: "different-stakeholder",
      orgId: "different-org",
      tenantId: "different-tenant",
      environment: "production-us",
      authenticationState: "authenticated",
      exp: Date.now() + 300000,
    };

    const jwt = await createJWT(differentSessionData, 30);
    const payload = await verifyJWT(jwt);

    expect(payload?.sub).toBe(differentSessionData.careflowId);
    expect(payload?.stakeholder_id).toBe(differentSessionData.stakeholderId);
    expect(payload?.patient_id).toBe(differentSessionData.patientId);
    expect(payload?.environment).toBe(differentSessionData.environment);
    expect(payload?.authentication_state).toBe(
      differentSessionData.authenticationState
    );
  });
});
