import { describe, it, expect } from "vitest";
import {
  generateThemeCSS,
  brandingToTokens,
  getFaviconUrl,
  getFaviconType,
  generateFaviconHTML,
} from "./generator";
import { awellDefaultTheme } from "../defaults";

describe("Theme Generator", () => {
  it("should generate default theme CSS when no branding provided", () => {
    const css = generateThemeCSS(null);

    expect(css).toContain(":root {");
    expect(css).toContain("--primary: #1d4ed8");
    expect(css).toContain("--background: #ffffff");
    expect(css).toContain("}");
  });

  it("should apply custom branding over defaults", () => {
    const customBranding = {
      primary: "#FF6C4C",
      primaryForeground: "#FFFFFF",
      background: "#FAFAFA",
    };

    const tokens = brandingToTokens(customBranding);

    expect(tokens["--primary"]).toBe("#FF6C4C");
    expect(tokens["--primary-foreground"]).toBe("#FFFFFF");
    expect(tokens["--background"]).toBe("#FAFAFA");

    // Should keep default values for non-specified tokens
    expect(tokens["--secondary"]).toBe(awellDefaultTheme["--secondary"]);
  });

  it("should handle variable references in radius values", () => {
    const customBranding = {
      radius: "6px", // Simple value
    };

    const tokens = brandingToTokens(customBranding);
    expect(tokens["--radius"]).toBe("6px");
  });

  it("should generate sample org branding correctly", () => {
    const sampleBranding = {
      primary: "#FF6C4C",
      primaryForeground: "#FFFFFF",
      background: "#FAFAFA",
      foreground: "#1F1F1F",
      border: "#E0E0E0",
      logoUrl: "https://cdn.awellhealth.com/sunrise-health/logo.svg",
      faviconUrl: "https://cdn.awellhealth.com/sunrise-health/favicon.ico",
      welcomeTitle: "Welcome to Sunrise Health",
    };

    const css = generateThemeCSS(sampleBranding);

    expect(css).toContain("--primary: #FF6C4C");
    expect(css).toContain("--background: #FAFAFA");
    expect(css).toContain("--border: #E0E0E0");
  });

  it("should handle favicon branding property", () => {
    const brandingWithFavicon = {
      primary: "#1d4ed8",
      faviconUrl: "https://example.com/favicon.ico",
    };

    // Favicon doesn't affect CSS generation, but should be valid in branding object
    const css = generateThemeCSS(brandingWithFavicon);
    expect(css).toContain("--primary: #1d4ed8");
  });
});

describe("Favicon Utilities", () => {
  it("should return custom favicon URL when provided", () => {
    const branding = { faviconUrl: "https://example.com/custom.ico" };
    const url = getFaviconUrl(branding);
    expect(url).toBe("https://example.com/custom.ico");
  });

  it("should fallback to default favicon when no branding provided", () => {
    const url = getFaviconUrl(null);
    expect(url).toBe("/favicon-16x16.png");
  });

  it("should fallback to default favicon when branding has no faviconUrl", () => {
    const branding = { primary: "#1d4ed8" };
    const url = getFaviconUrl(branding);
    expect(url).toBe("/favicon-16x16.png");
  });

  it("should detect favicon types correctly", () => {
    expect(getFaviconType("favicon.ico")).toBe("image/x-icon");
    expect(getFaviconType("favicon.png")).toBe("image/png");
    expect(getFaviconType("favicon.svg")).toBe("image/svg+xml");
    expect(getFaviconType("favicon.jpg")).toBe("image/jpeg");
    expect(getFaviconType("favicon.jpeg")).toBe("image/jpeg");
    expect(getFaviconType("favicon.gif")).toBe("image/gif");
    expect(getFaviconType("favicon.unknown")).toBe("image/x-icon"); // Default fallback
  });

  it("should handle URLs with query params and fragments", () => {
    expect(
      getFaviconType("https://cdn.awellhealth.com/favicon.png?v=1#hash")
    ).toBe("image/png");
    expect(getFaviconType("/assets/favicon.svg?cache=123")).toBe(
      "image/svg+xml"
    );
  });

  it("should generate complete favicon HTML", () => {
    const branding = { faviconUrl: "https://example.com/favicon.png" };
    const html = generateFaviconHTML(branding);
    expect(html).toBe(
      '<link rel="icon" type="image/png" href="https://example.com/favicon.png">'
    );
  });

  it("should generate default favicon HTML when no branding", () => {
    const html = generateFaviconHTML(null);
    expect(html).toBe(
      '<link rel="icon" type="image/png" href="/favicon-16x16.png">'
    );
  });
});
