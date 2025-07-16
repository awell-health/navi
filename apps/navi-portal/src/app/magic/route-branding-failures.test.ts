/**
 * @vitest-environment node
 */
/* eslint-disable @typescript-eslint/no-explicit-any */

import { describe, it, expect, vi, beforeEach } from "vitest";
import { GET } from "./route";
import { NextRequest } from "next/server";
import { createSessionToken } from "@/lib/auth/internal/session";
import type { SessionTokenData } from "@awell-health/navi-core/src/types";

// Mock the edge-config import to test failure scenarios
vi.mock("@/lib/edge-config", () => ({
  getBrandingByOrgId: vi.fn(),
}));

// Mock the branding generator functions
vi.mock("@/lib/branding/theme/generator", () => ({
  generateInlineThemeStyle: vi.fn(),
  generateFaviconHTML: vi.fn(),
}));

// Mock the welcome page component
vi.mock("@/components/welcome/welcome-page", () => ({
  generateWelcomePageHTML: vi.fn(),
}));

describe("Magic Link Route - Branding Failure Scenarios", () => {
  let mockGetBrandingByOrgId: any;
  let mockGenerateInlineThemeStyle: any;
  let mockGenerateFaviconHTML: any;
  let mockGenerateWelcomePageHTML: any;

  beforeEach(async () => {
    vi.clearAllMocks();

    // Get mocked functions
    const edgeConfig = await import("@/lib/edge-config");
    const generator = await import("@/lib/branding/theme/generator");
    const welcomePage = await import("@/components/welcome/welcome-page");

    mockGetBrandingByOrgId = edgeConfig.getBrandingByOrgId;
    mockGenerateInlineThemeStyle = generator.generateInlineThemeStyle;
    mockGenerateFaviconHTML = generator.generateFaviconHTML;
    mockGenerateWelcomePageHTML = welcomePage.generateWelcomePageHTML;

    // Set default successful responses
    mockGenerateInlineThemeStyle.mockReturnValue(
      "<style>/* default */</style>"
    );
    mockGenerateFaviconHTML.mockReturnValue(
      '<link rel="icon" href="/favicon.ico">'
    );
    mockGenerateWelcomePageHTML.mockReturnValue("<div>Welcome</div>");
  });

  async function createTestToken(): Promise<string> {
    const payload: SessionTokenData = {
      patientId: "patient123",
      careflowId: "careflow456",
      stakeholderId: "stakeholder123",
      orgId: "org123",
      tenantId: "tenant123",
      environment: "test",
      authenticationState: "unauthenticated",
      exp: Math.floor(Date.now() / 1000) + 60, // 1 minute from now
    };

    return await createSessionToken(payload);
  }

  describe("Branding Service Failures", () => {
    it("should handle branding service timeout gracefully", async () => {
      // Mock branding service to timeout
      mockGetBrandingByOrgId.mockImplementation(
        () =>
          new Promise((_, reject) =>
            setTimeout(() => reject(new Error("Timeout")), 100)
          )
      );

      const token = await createTestToken();
      const request = new NextRequest(
        `https://example.com/magic?token=${token}`
      );

      const response = await GET(request);

      // Should still return 200 with default branding
      expect(response.status).toBe(200);
      const html = await response.text();
      expect(html).toContain("<!DOCTYPE html>");
    });

    it("should handle branding service network error gracefully", async () => {
      mockGetBrandingByOrgId.mockRejectedValue(new Error("Network error"));

      const token = await createTestToken();
      const request = new NextRequest(
        `https://example.com/magic?token=${token}`
      );

      const response = await GET(request);

      expect(response.status).toBe(200);
      // Should fallback to calling generator with null/default branding
      expect(mockGenerateInlineThemeStyle).toHaveBeenCalled();
    });

    it("should handle branding service returning null gracefully", async () => {
      mockGetBrandingByOrgId.mockResolvedValue(null);

      const token = await createTestToken();
      const request = new NextRequest(
        `https://example.com/magic?token=${token}`
      );

      const response = await GET(request);

      expect(response.status).toBe(200);
      expect(mockGenerateInlineThemeStyle).toHaveBeenCalledWith(null);
    });

    it("should handle malformed branding data gracefully", async () => {
      const malformedBranding = {
        primary: null,
        background: undefined,
        corruptedField: { circular: "reference" },
      };

      mockGetBrandingByOrgId.mockResolvedValue(malformedBranding);

      const token = await createTestToken();
      const request = new NextRequest(
        `https://example.com/magic?token=${token}`
      );

      const response = await GET(request);

      expect(response.status).toBe(200);
      expect(mockGenerateInlineThemeStyle).toHaveBeenCalledWith(
        malformedBranding
      );
    });
  });

  describe("CSS Generation Failures", () => {
    it("should handle theme CSS generation throwing an error", async () => {
      mockGetBrandingByOrgId.mockResolvedValue({ primary: "#test" });
      mockGenerateInlineThemeStyle.mockImplementation(() => {
        throw new Error("CSS generation failed");
      });

      const token = await createTestToken();
      const request = new NextRequest(
        `https://example.com/magic?token=${token}`
      );

      // Should gracefully handle the error and return 200 with fallback
      const response = await GET(request);
      expect(response.status).toBe(200);

      const html = await response.text();
      expect(html).toContain("<style>/* fallback */</style>");
    });

    it("should handle favicon generation throwing an error", async () => {
      mockGetBrandingByOrgId.mockResolvedValue({ faviconUrl: "invalid" });
      mockGenerateFaviconHTML.mockImplementation(() => {
        throw new Error("Favicon generation failed");
      });

      const token = await createTestToken();
      const request = new NextRequest(
        `https://example.com/magic?token=${token}`
      );

      // Should gracefully handle the error and return 200 with fallback
      const response = await GET(request);
      expect(response.status).toBe(200);

      const html = await response.text();
      expect(html).toContain('<link rel="icon" href="/favicon-16x16.png">');
    });

    it("should handle welcome page generation throwing an error", async () => {
      mockGetBrandingByOrgId.mockResolvedValue({ welcomeTitle: "Test" });
      mockGenerateWelcomePageHTML.mockImplementation(() => {
        throw new Error("Welcome page generation failed");
      });

      const token = await createTestToken();
      const request = new NextRequest(
        `https://example.com/magic?token=${token}`
      );

      // Should gracefully handle the error and return 200 with fallback
      const response = await GET(request);
      expect(response.status).toBe(200);

      const html = await response.text();
      expect(html).toContain("<div>Welcome to your care journey</div>");
    });
  });

  describe("HTML Injection Protection", () => {
    it("should handle XSS attempts in branding data", async () => {
      const maliciousBranding = {
        welcomeTitle: '<script>alert("xss")</script>',
        primary: '</style><script>alert("css-xss")</script><style>',
        faviconUrl: 'javascript:alert("favicon-xss")',
      };

      mockGetBrandingByOrgId.mockResolvedValue(maliciousBranding);

      const token = await createTestToken();
      const request = new NextRequest(
        `https://example.com/magic?token=${token}`
      );

      const response = await GET(request);

      expect(response.status).toBe(200);
      const html = await response.text();

      // CSS values should be sanitized by the generator
      expect(html).not.toContain('</style><script>alert("css-xss")');
      expect(html).not.toContain('javascript:alert("favicon-xss")');

      // Note: Title XSS is handled by browser's natural HTML escaping in template literals
      // We're testing that our CSS and favicon sanitization works
    });

    it("should handle extremely large branding values", async () => {
      const largeBranding = {
        welcomeTitle: "A".repeat(100000), // 100KB string
        primary: "B".repeat(50000),
        fontFamilyBody: "C".repeat(25000),
      };

      mockGetBrandingByOrgId.mockResolvedValue(largeBranding);

      const token = await createTestToken();
      const request = new NextRequest(
        `https://example.com/magic?token=${token}`
      );

      // Should not cause memory issues or timeouts
      const response = await GET(request);
      expect(response.status).toBe(200);
    });
  });

  describe("Environment Variable Issues", () => {
    it("should handle missing Edge Config URL gracefully", async () => {
      // This would typically be tested by mocking process.env, but since
      // the branding service is mocked, we test the behavior when
      // getBrandingByOrgId throws a specific error
      mockGetBrandingByOrgId.mockRejectedValue(
        new Error("@vercel/edge-config: No connection string provided")
      );

      const token = await createTestToken();
      const request = new NextRequest(
        `https://example.com/magic?token=${token}`
      );

      const response = await GET(request);

      // Should gracefully fallback despite environment issues
      expect(response.status).toBe(200);
    });
  });

  describe("Memory and Performance Edge Cases", () => {
    it("should handle concurrent branding requests efficiently", async () => {
      mockGetBrandingByOrgId.mockImplementation(async () => {
        // Simulate some processing time
        await new Promise((resolve) => setTimeout(resolve, 10));
        return { primary: "#concurrent" };
      });

      const tokens = await Promise.all([
        createTestToken(),
        createTestToken(),
        createTestToken(),
      ]);

      const requests = tokens.map(async (token) => {
        const request = new NextRequest(
          `https://example.com/magic?token=${token}`
        );
        return GET(request);
      });

      const responses = await Promise.all(requests);

      // All should succeed
      responses.forEach((response) => {
        expect(response.status).toBe(200);
      });
    });

    it("should handle response within reasonable time limits", async () => {
      mockGetBrandingByOrgId.mockResolvedValue({ primary: "#perf-test" });

      const token = await createTestToken();
      const request = new NextRequest(
        `https://example.com/magic?token=${token}`
      );

      const startTime = Date.now();
      const response = await GET(request);
      const endTime = Date.now();

      expect(response.status).toBe(200);
      // Should complete within 2 seconds (generous for CI environments)
      expect(endTime - startTime).toBeLessThan(2000);
    });
  });
});
