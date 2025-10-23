import { describe, it, expect, beforeEach, vi, afterEach } from "vitest";
import { NextRequest } from "next/server";
import { GET } from "./route";
import * as SmartDomain from "@/domains/smart";

// Hoist mocks so they're available in the mock factory
const { mockInitializeStatsig, mockCheckGateSync } = vi.hoisted(() => ({
  mockInitializeStatsig: vi.fn(() => Promise.resolve(undefined)),
  mockCheckGateSync: vi.fn(() => false),
}));

// Mock environment variables
vi.mock("@/env", () => ({
  env: {
    BASE_URL: "https://navi-portal.awellhealth.com",
    STYTCH_TRUSTED_TOKEN_PROFILE_ID: "test-profile-id",
    STYTCH_B2B_PROJECT_ID: "test-project-id",
    STYTCH_B2B_SECRET: "test-secret",
    JWT_SIGNING_KEY: "test-signing-key",
    JWT_KEY_ID: "test-key-id",
    NODE_ENV: "test",
    HTTP_COOKIE_DOMAIN: undefined,
  },
}));

// Mock Statsig
vi.mock("@/lib/statsig.edge", () => {
  return {
    initializeStatsig: mockInitializeStatsig,
    Statsig: {
      checkGateSync: mockCheckGateSync,
    },
  };
});

describe("/smart/direct GET handler", () => {
  const mockPatientIdentifier = "https://ehr.example.com|patient-123";
  const mockToken = "mock-trusted-token";
  const mockOrgId = "org-123";
  const mockSessionToken = "mock-session-token";
  const mockTicket = "ticket-123";
  const mockJwt = "mock.jwt.token";

  beforeEach(() => {
    vi.restoreAllMocks();
  });

  afterEach(() => {
    vi.clearAllMocks();
  });

  const createRequest = (params: Record<string, string>): NextRequest => {
    const url = new URL("https://test.com/smart/direct");
    Object.entries(params).forEach(([key, value]) => {
      url.searchParams.set(key, value);
    });
    return new NextRequest(url);
  };

  describe("parameter validation", () => {
    it("returns 400 when patient_identifier is missing", async () => {
      const request = createRequest({
        token: mockToken,
        organization_id: mockOrgId,
      });

      const response = await GET(request);
      const json = await response.json();

      expect(response.status).toBe(400);
      expect(json.error).toBe("Missing required params");
      expect(json.missing.patient_identifier).toBe(true);
    });

    it("returns 400 when token is missing", async () => {
      const request = createRequest({
        patient_identifier: mockPatientIdentifier,
        organization_id: mockOrgId,
      });

      const response = await GET(request);
      const json = await response.json();

      expect(response.status).toBe(400);
      expect(json.error).toBe("Missing required params");
      expect(json.missing.token).toBe(true);
    });

    it("returns 400 when organization_id is missing", async () => {
      const request = createRequest({
        patient_identifier: mockPatientIdentifier,
        token: mockToken,
      });

      const response = await GET(request);
      const json = await response.json();

      expect(response.status).toBe(400);
      expect(json.error).toBe("Missing required params");
      expect(json.missing.organization_id).toBe(true);
    });

    it("returns 400 when patient_identifier has invalid format", async () => {
      const request = createRequest({
        patient_identifier: "invalid-format",
        token: mockToken,
        organization_id: mockOrgId,
      });

      const response = await GET(request);
      const json = await response.json();

      expect(response.status).toBe(400);
      expect(json.error).toBe(
        "Invalid patient_identifier format. Expected system|value"
      );
    });

    it("returns 400 when patient_identifier missing system part", async () => {
      const request = createRequest({
        patient_identifier: "|patient-123",
        token: mockToken,
        organization_id: mockOrgId,
      });

      const response = await GET(request);
      const json = await response.json();

      expect(response.status).toBe(400);
      expect(json.error).toBe(
        "Invalid patient_identifier format. Expected system|value"
      );
    });

    it("returns 400 when patient_identifier missing patient part", async () => {
      const request = createRequest({
        patient_identifier: "https://ehr.example.com|",
        token: mockToken,
        organization_id: mockOrgId,
      });

      const response = await GET(request);
      const json = await response.json();

      expect(response.status).toBe(400);
      expect(json.error).toBe(
        "Invalid patient_identifier format. Expected system|value"
      );
    });
  });

  describe("successful flow", () => {
    beforeEach(() => {
      // Mock all domain functions
      vi.spyOn(SmartDomain, "fetchStytchMemberByExternalId").mockResolvedValue({
        member_id: "member-123",
        email_address: "patient@example.com",
        external_id: "patient-123",
      });

      vi.spyOn(SmartDomain, "attestTrustedToken").mockResolvedValue({
        session_token: mockSessionToken,
        session: {} as any,
      } as any);

      vi.spyOn(SmartDomain, "buildStytchCookieOptions").mockResolvedValue({
        name: "stytch_session",
        value: mockSessionToken,
        maxAge: 60 * 60 * 24 * 30,
        path: "/",
        sameSite: "none",
        httpOnly: false,
        secure: true,
      });

      vi.spyOn(SmartDomain, "getTenantIdForEnvironment").mockResolvedValue(
        "tenant-123"
      );

      vi.spyOn(SmartDomain, "createSmartTicket").mockResolvedValue(mockTicket);

      vi.spyOn(SmartDomain, "mintAwellJwt").mockResolvedValue(mockJwt);
    });

    it("successfully creates session and redirects to /smart/home", async () => {
      const request = createRequest({
        patient_identifier: mockPatientIdentifier,
        token: mockToken,
        organization_id: mockOrgId,
      });

      const response = await GET(request);

      expect(response.status).toBe(302);
      expect(response.headers.get("location")).toContain("/smart/home");
      expect(response.headers.get("location")).toContain(
        `ticket=${mockTicket}`
      );
    });

    // Note: fetchStytchMemberByExternalId was removed from the route in recent changes
    // This test is commented out but kept for reference in case it's re-added
    // it("fetches Stytch member by external ID", async () => {
    //   const request = createRequest({
    //     patient_identifier: mockPatientIdentifier,
    //     token: mockToken,
    //     organization_id: mockOrgId,
    //   });

    //   await GET(request);

    //   expect(SmartDomain.fetchStytchMemberByExternalId).toHaveBeenCalledWith({
    //     organization_id: mockOrgId,
    //     externalId: "patient-123",
    //   });
    // });

    it("attests trusted token", async () => {
      const request = createRequest({
        patient_identifier: mockPatientIdentifier,
        token: mockToken,
        organization_id: mockOrgId,
      });

      await GET(request);

      expect(SmartDomain.attestTrustedToken).toHaveBeenCalledWith({
        token: mockToken,
        organizationId: mockOrgId,
        profileId: undefined,
      });
    });

    it("attests trusted token with custom profile ID when provided", async () => {
      const customProfileId = "custom-profile-123";
      const request = createRequest({
        patient_identifier: mockPatientIdentifier,
        token: mockToken,
        organization_id: mockOrgId,
        trusted_token_profile_id: customProfileId,
      });

      await GET(request);

      expect(SmartDomain.attestTrustedToken).toHaveBeenCalledWith({
        token: mockToken,
        organizationId: mockOrgId,
        profileId: customProfileId,
      });
    });

    it("sets non-httpOnly cookie by default", async () => {
      const request = createRequest({
        patient_identifier: mockPatientIdentifier,
        token: mockToken,
        organization_id: mockOrgId,
      });

      await GET(request);

      expect(SmartDomain.buildStytchCookieOptions).toHaveBeenCalledWith({
        sessionToken: mockSessionToken,
        httpOnly: false,
      });
    });

    it("sets httpOnly cookie when Statsig gate is enabled", async () => {
      mockCheckGateSync.mockReturnValueOnce(true);

      const request = createRequest({
        patient_identifier: mockPatientIdentifier,
        token: mockToken,
        organization_id: mockOrgId,
      });

      await GET(request);

      // Should call buildStytchCookieOptions twice: first with httpOnly: false, then with httpOnly: true
      expect(SmartDomain.buildStytchCookieOptions).toHaveBeenLastCalledWith({
        sessionToken: mockSessionToken,
        httpOnly: true,
        domain: undefined,
      });
    });

    it("creates SMART ticket with correct session data", async () => {
      const request = createRequest({
        patient_identifier: mockPatientIdentifier,
        token: mockToken,
        organization_id: mockOrgId,
      });

      await GET(request);

      expect(SmartDomain.createSmartTicket).toHaveBeenCalledWith(
        expect.objectContaining({
          iss: "https://ehr.example.com",
          tokenEndpoint: "https://ehr.example.com/token",
          accessToken: "",
          scope: "patient/*.read",
          patient: "patient-123",
          fhirUser: "patient-123",
          stytchOrganizationId: mockOrgId,
        })
      );
    });

    it("mints Awell JWT with correct parameters", async () => {
      const request = createRequest({
        patient_identifier: mockPatientIdentifier,
        token: mockToken,
        organization_id: mockOrgId,
      });

      await GET(request);

      expect(SmartDomain.mintAwellJwt).toHaveBeenCalledWith(
        expect.objectContaining({
          orgId: mockOrgId,
          tenantId: "tenant-123",
          environment: "development",
          authenticationState: "authenticated",
        })
      );
    });

    it("sets both stytch_session and awell.jwt cookies", async () => {
      const request = createRequest({
        patient_identifier: mockPatientIdentifier,
        token: mockToken,
        organization_id: mockOrgId,
      });

      const response = await GET(request);

      const cookies = response.headers.getSetCookie();
      expect(cookies.length).toBeGreaterThanOrEqual(2);
      expect(cookies.some((c) => c.includes("stytch_session"))).toBe(true);
      expect(cookies.some((c) => c.includes("awell.jwt"))).toBe(true);
    });

    it("respects x-forwarded-proto and x-forwarded-host headers", async () => {
      const request = createRequest({
        patient_identifier: mockPatientIdentifier,
        token: mockToken,
        organization_id: mockOrgId,
      });

      // Add forwarded headers
      request.headers.set("x-forwarded-proto", "https");
      request.headers.set("x-forwarded-host", "custom.example.com");

      const response = await GET(request);

      expect(response.headers.get("location")).toContain(
        "https://custom.example.com/smart/home"
      );
    });
  });

  describe("error handling", () => {
    it("returns 400 when attestTrustedToken fails", async () => {
      vi.spyOn(SmartDomain, "fetchStytchMemberByExternalId").mockResolvedValue(
        null
      );
      vi.spyOn(SmartDomain, "attestTrustedToken").mockRejectedValue({
        status_code: 400,
        error_type: "invalid_token",
        error_message: "Invalid trusted token",
      });

      const request = createRequest({
        patient_identifier: mockPatientIdentifier,
        token: "invalid-token",
        organization_id: mockOrgId,
      });

      const response = await GET(request);
      const json = await response.json();

      expect(response.status).toBe(400);
      expect(json.error).toBe("stytch_attest_failed");
      expect(json.message).toBe("Invalid trusted token");
    });

    it("returns email_not_found error when Stytch member not found", async () => {
      vi.spyOn(SmartDomain, "fetchStytchMemberByExternalId").mockResolvedValue(
        null
      );
      vi.spyOn(SmartDomain, "attestTrustedToken").mockRejectedValue({
        status_code: 404,
        error_type: "not_found",
        error_message: "Member not found",
      });

      const request = createRequest({
        patient_identifier: mockPatientIdentifier,
        token: mockToken,
        organization_id: mockOrgId,
      });

      const response = await GET(request);
      const json = await response.json();

      expect(response.status).toBe(400);
      expect(json.error).toBe("email_not_found");
      expect(json.message).toBe("A user for this application was not found.");
    });

    it("returns generic error when error has no specific details", async () => {
      vi.spyOn(SmartDomain, "fetchStytchMemberByExternalId").mockResolvedValue(
        null
      );
      vi.spyOn(SmartDomain, "attestTrustedToken").mockRejectedValue(
        new Error("Generic error")
      );

      const request = createRequest({
        patient_identifier: mockPatientIdentifier,
        token: mockToken,
        organization_id: mockOrgId,
      });

      const response = await GET(request);
      const json = await response.json();

      expect(response.status).toBe(400);
      expect(json.error).toBe("stytch_attest_failed");
      expect(json.message).toBe("Generic error");
    });

    it("handles error when getTenantIdForEnvironment returns null", async () => {
      vi.spyOn(SmartDomain, "fetchStytchMemberByExternalId").mockResolvedValue(
        null
      );
      vi.spyOn(SmartDomain, "attestTrustedToken").mockResolvedValue({
        session_token: mockSessionToken,
        session: {} as any,
      } as any);
      vi.spyOn(SmartDomain, "buildStytchCookieOptions").mockResolvedValue({
        name: "stytch_session",
        value: mockSessionToken,
        maxAge: 60 * 60 * 24 * 30,
        path: "/",
        sameSite: "none",
        httpOnly: false,
        secure: true,
      });
      vi.spyOn(SmartDomain, "getTenantIdForEnvironment").mockResolvedValue(
        null
      );
      vi.spyOn(SmartDomain, "createSmartTicket").mockResolvedValue(mockTicket);
      vi.spyOn(SmartDomain, "mintAwellJwt").mockResolvedValue(mockJwt);

      const request = createRequest({
        patient_identifier: mockPatientIdentifier,
        token: mockToken,
        organization_id: mockOrgId,
      });

      const response = await GET(request);

      // Should succeed but mint JWT with empty tenantId
      expect(response.status).toBe(302);
      expect(SmartDomain.mintAwellJwt).toHaveBeenCalledWith(
        expect.objectContaining({
          tenantId: "",
        })
      );
    });

    it("handles Statsig initialization failure gracefully", async () => {
      mockInitializeStatsig.mockRejectedValueOnce(
        new Error("Statsig init failed")
      );

      vi.spyOn(SmartDomain, "fetchStytchMemberByExternalId").mockResolvedValue(
        null
      );
      vi.spyOn(SmartDomain, "attestTrustedToken").mockResolvedValue({
        session_token: mockSessionToken,
        session: {} as any,
      } as any);
      vi.spyOn(SmartDomain, "buildStytchCookieOptions").mockResolvedValue({
        name: "stytch_session",
        value: mockSessionToken,
        maxAge: 60 * 60 * 24 * 30,
        path: "/",
        sameSite: "none",
        httpOnly: false,
        secure: true,
      });
      vi.spyOn(SmartDomain, "getTenantIdForEnvironment").mockResolvedValue(
        "tenant-123"
      );
      vi.spyOn(SmartDomain, "createSmartTicket").mockResolvedValue(mockTicket);
      vi.spyOn(SmartDomain, "mintAwellJwt").mockResolvedValue(mockJwt);

      const request = createRequest({
        patient_identifier: mockPatientIdentifier,
        token: mockToken,
        organization_id: mockOrgId,
      });

      // Should still succeed even if Statsig fails to initialize
      const response = await GET(request);
      expect(response.status).toBe(302);
    });
  });

  describe("edge cases", () => {
    beforeEach(() => {
      vi.spyOn(SmartDomain, "fetchStytchMemberByExternalId").mockResolvedValue(
        null
      );
      vi.spyOn(SmartDomain, "attestTrustedToken").mockResolvedValue({
        session_token: mockSessionToken,
        session: {} as any,
      } as any);
      vi.spyOn(SmartDomain, "buildStytchCookieOptions").mockResolvedValue({
        name: "stytch_session",
        value: mockSessionToken,
        maxAge: 60 * 60 * 24 * 30,
        path: "/",
        sameSite: "none",
        httpOnly: false,
        secure: true,
      });
      vi.spyOn(SmartDomain, "getTenantIdForEnvironment").mockResolvedValue(
        "tenant-123"
      );
      vi.spyOn(SmartDomain, "createSmartTicket").mockResolvedValue(mockTicket);
      vi.spyOn(SmartDomain, "mintAwellJwt").mockResolvedValue(mockJwt);
    });

    it("handles patient_identifier with multiple pipe characters", async () => {
      const request = createRequest({
        patient_identifier: "https://ehr.example.com|patient|123",
        token: mockToken,
        organization_id: mockOrgId,
      });

      const response = await GET(request);

      // split("|") only splits on first occurrence, so second part becomes "patient"
      // and the "|123" is lost (split with limit=1 would preserve it, but default split doesn't)
      expect(response.status).toBe(302);
      expect(SmartDomain.createSmartTicket).toHaveBeenCalledWith(
        expect.objectContaining({
          iss: "https://ehr.example.com",
          patient: "patient",  // Note: Only gets first element after first pipe
        })
      );
    });

    it("handles very long patient identifiers", async () => {
      const longPatient = "p".repeat(1000);
      const request = createRequest({
        patient_identifier: `https://ehr.example.com|${longPatient}`,
        token: mockToken,
        organization_id: mockOrgId,
      });

      const response = await GET(request);

      expect(response.status).toBe(302);
      expect(SmartDomain.createSmartTicket).toHaveBeenCalledWith(
        expect.objectContaining({
          patient: longPatient,
        })
      );
    });

    it("handles special characters in patient identifier", async () => {
      const specialPatient = "patient+123@test.com";
      const request = createRequest({
        patient_identifier: `https://ehr.example.com|${specialPatient}`,
        token: mockToken,
        organization_id: mockOrgId,
      });

      const response = await GET(request);

      expect(response.status).toBe(302);
      expect(SmartDomain.createSmartTicket).toHaveBeenCalledWith(
        expect.objectContaining({
          patient: specialPatient,
        })
      );
    });
  });
});
