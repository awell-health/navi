/**
 * @vitest-environment node
 */
import { describe, it, expect, beforeEach, vi } from "vitest";
import { GET } from "./route";
import { NextRequest } from "next/server";
import { createSessionToken } from "@/lib/auth/internal/session";
import type { SessionTokenData } from "@awell-health/navi-core/src/types";

describe("Magic Link Authentication", () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it("should return 400 for invalid token format", async () => {
    const request = new NextRequest(
      "https://example.com/magic?token=invalid-token"
    );

    const response = await GET(request);

    expect(response.status).toBe(400);
    expect(await response.text()).toBe("Invalid token");
  });

  it("should return 400 for malformed token data", async () => {
    // Create a token with invalid JSON
    const invalidToken = btoa("not-json");
    const request = new NextRequest(
      `https://example.com/magic?token=${invalidToken}`
    );

    const response = await GET(request);

    expect(response.status).toBe(400);
    expect(await response.text()).toBe("Invalid token");
  });

  it("should return 400 for token missing required fields", async () => {
    // Create a token with missing required fields
    const incompletePayload = { patientId: "patient123" }; // missing careflowId, stakeholderId and exp
    const token = await createSessionToken(
      incompletePayload as SessionTokenData
    );

    const request = new NextRequest(`https://example.com/magic?token=${token}`);

    const response = await GET(request);

    expect(response.status).toBe(400);
    expect(await response.text()).toBe("Invalid token");
  });

  it("should return 400 for expired token", async () => {
    const expiredPayload: SessionTokenData = {
      patientId: "patient123",
      careflowId: "careflow456",
      stakeholderId: "stakeholder123",
      orgId: "org123",
      tenantId: "tenant123",
      environment: "test",
      authenticationState: "unauthenticated",
      exp: Math.floor(Date.now() / 1000) - 60, // Expired 1 minute ago
    };
    const token = await createSessionToken(expiredPayload);

    const request = new NextRequest(`https://example.com/magic?token=${token}`);

    const response = await GET(request);

    expect(response.status).toBe(400);
    expect(await response.text()).toBe("Token expired");
  });

  it("should return 200 and HTML for valid token", async () => {
    // Create a valid token
    const validPayload: SessionTokenData = {
      patientId: "patient123",
      careflowId: "careflow456",
      stakeholderId: "stakeholder123",
      orgId: "org123",
      tenantId: "tenant123",
      environment: "test",
      authenticationState: "unauthenticated",
      exp: Math.floor(Date.now() / 1000) + 60, // 1 minute from now
    };
    const token = await createSessionToken(validPayload);

    const request = new NextRequest(`https://example.com/magic?token=${token}`);

    const response = await GET(request);

    expect(response.status).toBe(200);
    expect(response.headers.get("content-type")).toBe("text/html");

    const html = await response.text();
    expect(html).toContain("Welcome to your care journey");
    expect(html).toContain("patient123");
    expect(html).toContain("careflow456");
  });

  it("should set correct cookies for valid token", async () => {
    // Create a valid token
    const validPayload: SessionTokenData = {
      patientId: "patient123",
      careflowId: "careflow456",
      stakeholderId: "stakeholder123",
      orgId: "org123",
      tenantId: "tenant123",
      environment: "test",
      authenticationState: "unauthenticated",
      exp: Math.floor(Date.now() / 1000) + 60, // 1 minute from now
    };
    const token = await createSessionToken(validPayload);

    const request = new NextRequest(`https://example.com/magic?token=${token}`);

    const response = await GET(request);

    expect(response.status).toBe(200);

    // Check cookies are set
    const cookies = response.cookies;
    const sidCookie = cookies.get("awell.sid");
    const jwtCookie = cookies.get("awell.jwt");

    expect(sidCookie).toBeDefined();
    expect(jwtCookie).toBeDefined();
    expect(sidCookie?.httpOnly).toBe(true);
    expect(jwtCookie?.httpOnly).toBe(true);
    expect(sidCookie?.sameSite).toBe("lax");
    expect(jwtCookie?.sameSite).toBe("lax");
    expect(jwtCookie?.path).toBe("/api/graphql");
  });

  it("should set referrer policy header", async () => {
    // Create a valid token
    const validPayload: SessionTokenData = {
      patientId: "patient123",
      careflowId: "careflow456",
      stakeholderId: "stakeholder123",
      orgId: "org123",
      tenantId: "tenant123",
      environment: "test",
      authenticationState: "unauthenticated",
      exp: Math.floor(Date.now() / 1000) + 60,
    };
    const token = await createSessionToken(validPayload);

    const request = new NextRequest(`https://example.com/magic?token=${token}`);

    const response = await GET(request);

    expect(response.headers.get("referrer-policy")).toBe("strict-origin");
  });

  it("should return 400 for missing token", async () => {
    const request = new NextRequest("https://example.com/magic");

    const response = await GET(request);

    expect(response.status).toBe(400);
    expect(await response.text()).toBe("No token provided");
  });

  describe("Error handling", () => {
    it("should return 400 for incomplete token payload", async () => {
      // Create a token with incomplete data
      const incompletePayload = {
        patientId: "patient123",
        stakeholderId: "stakeholder123",
        // Missing careflowId, orgId, tenantId, environment, exp
      };
      const token = await createSessionToken(
        incompletePayload as SessionTokenData
      );

      const request = new NextRequest(
        `https://example.com/magic?token=${token}`
      );

      const response = await GET(request);

      expect(response.status).toBe(400);
      expect(await response.text()).toBe("Invalid token");
    });

    it("should return 400 for expired token", async () => {
      const expiredPayload: SessionTokenData = {
        patientId: "patient123",
        careflowId: "careflow456",
        stakeholderId: "stakeholder123",
        orgId: "org123",
        tenantId: "tenant123",
        environment: "test",
        authenticationState: "unauthenticated",
        exp: Math.floor(Date.now() / 1000) - 10, // Expired 10 seconds ago
      };
      const token = await createSessionToken(expiredPayload);

      const request = new NextRequest(
        `https://example.com/magic?token=${token}`
      );

      const response = await GET(request);

      expect(response.status).toBe(400);
      expect(await response.text()).toBe("Token expired");
    });
  });

  describe("Success cases", () => {
    it("should return HTML for valid token", async () => {
      const validPayload: SessionTokenData = {
        patientId: "patient123",
        careflowId: "careflow456",
        stakeholderId: "stakeholder123",
        orgId: "org123",
        tenantId: "tenant123",
        environment: "test",
        authenticationState: "unauthenticated",
        exp: Math.floor(Date.now() / 1000) + 3600, // 1 hour from now
      };
      const token = await createSessionToken(validPayload);

      const request = new NextRequest(
        `https://example.com/magic?token=${token}`
      );

      const response = await GET(request);

      expect(response.status).toBe(200);
      expect(response.headers.get("content-type")).toBe("text/html");

      const html = await response.text();
      expect(html).toContain("<!DOCTYPE html>");
      expect(html).toContain("patient123");
      expect(html).toContain("careflow456");
    });

    it("should set session and JWT cookies", async () => {
      const validPayload: SessionTokenData = {
        patientId: "patient123",
        careflowId: "careflow456",
        stakeholderId: "stakeholder123",
        orgId: "org123",
        tenantId: "tenant123",
        environment: "test",
        authenticationState: "unauthenticated",
        exp: Math.floor(Date.now() / 1000) + 3600,
      };
      const token = await createSessionToken(validPayload);

      const request = new NextRequest(
        `https://example.com/magic?token=${token}`
      );

      const response = await GET(request);

      expect(response.status).toBe(200);

      const cookies = response.cookies;
      expect(cookies.get("awell.sid")).toBeDefined();
      expect(cookies.get("awell.jwt")).toBeDefined();
    });

    it("should handle branding parameters in query string", async () => {
      const validPayload: SessionTokenData = {
        patientId: "patient123",
        careflowId: "careflow456",
        stakeholderId: "stakeholder123",
        orgId: "test-org",
        tenantId: "tenant123",
        environment: "test",
        authenticationState: "unauthenticated",
        exp: Math.floor(Date.now() / 1000) + 3600,
      };
      const token = await createSessionToken(validPayload);

      const request = new NextRequest(
        `https://example.com/magic?token=${token}&primary_color=%2300bcd4&welcome_title=Custom%20Portal`
      );

      const response = await GET(request);

      expect(response.status).toBe(200);
      expect(response.headers.get("content-type")).toBe("text/html");

      const html = await response.text();
      expect(html).toContain("<!DOCTYPE html>");
    });
  });
});
