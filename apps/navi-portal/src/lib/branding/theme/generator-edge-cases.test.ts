/* eslint-disable @typescript-eslint/no-explicit-any */

import { describe, it, expect } from "vitest";
import {
  generateThemeCSS,
  generateInlineThemeStyle,
  generateFaviconHTML,
  getFaviconType,
} from "./generator";

describe("Theme Generator Edge Cases", () => {
  describe("Malformed Branding Data", () => {
    it("should handle null values in branding object gracefully", () => {
      const malformedBranding = {
        primary: null,
        background: null,
        radiusMd: null,
      };

      expect(() => generateThemeCSS(malformedBranding as any)).not.toThrow();
      const css = generateThemeCSS(malformedBranding as any);
      expect(css).toContain(":root {");
      expect(css).toContain("}");
    });

    it("should handle undefined values in branding object gracefully", () => {
      const malformedBranding = {
        primary: undefined,
        background: undefined,
        fontFamilyBody: undefined,
      };

      expect(() => generateThemeCSS(malformedBranding as any)).not.toThrow();
      const css = generateThemeCSS(malformedBranding as any);
      expect(css).toContain(":root {");
    });

    it("should handle non-string values gracefully", () => {
      const malformedBranding = {
        primary: 123,
        background: true,
        radiusMd: [],
        fontFamilyBody: {},
      };

      expect(() => generateThemeCSS(malformedBranding as any)).not.toThrow();
    });

    it("should handle branding object with circular references", () => {
      const circularBranding: any = {
        primary: "#test",
      };
      circularBranding.self = circularBranding;

      expect(() => generateThemeCSS(circularBranding)).not.toThrow();
    });

    it("should handle extremely long string values", () => {
      const longString = "a".repeat(10000);
      const malformedBranding = {
        primary: longString,
        fontFamilyBody: longString,
        welcomeTitle: longString,
      };

      expect(() => generateThemeCSS(malformedBranding)).not.toThrow();
    });

    it("should handle special characters in CSS values", () => {
      const specialCharBranding = {
        primary: '#ff0000;"><script>alert("xss")</script>',
        fontFamilyBody: "Arial; font-weight: bold; color: red;",
        welcomeTitle: '<img src="x" onerror="alert(1)">',
      };

      expect(() => generateThemeCSS(specialCharBranding)).not.toThrow();
      const css = generateThemeCSS(specialCharBranding);
      // Should sanitize and remove dangerous content
      expect(css).not.toContain("<script>");
      expect(css).not.toContain('alert("xss")');
      // Should still contain the safe color part
      expect(css).toContain("#ff0000");
    });
  });

  describe("generateInlineThemeStyle Edge Cases", () => {
    it("should handle null branding in inline style generation", () => {
      expect(() => generateInlineThemeStyle(null)).not.toThrow();
      const style = generateInlineThemeStyle(null);
      expect(style).toContain('<style id="awell-theme">');
      expect(style).toContain("</style>");
    });

    it("should handle undefined branding in inline style generation", () => {
      expect(() => generateInlineThemeStyle(undefined as any)).not.toThrow();
    });

    it("should escape HTML in style tags", () => {
      const maliciousBranding = {
        primary: '</style><script>alert("xss")</script><style>',
      };

      const style = generateInlineThemeStyle(maliciousBranding);
      // Should sanitize dangerous content
      expect(style).not.toContain("<script>");
      expect(style).not.toContain('alert("xss")');
      // Should maintain proper style structure
      expect(style).toContain('<style id="awell-theme">');
      expect(style).toContain("</style>");
      // Should have clean CSS variable
      expect(style).toContain("--primary:");
    });
  });

  describe("Favicon Handling Edge Cases", () => {
    it("should handle malformed favicon URLs gracefully", () => {
      const malformedBranding = {
        faviconUrl: "not-a-url",
      };

      expect(() => generateFaviconHTML(malformedBranding)).not.toThrow();
      const html = generateFaviconHTML(malformedBranding);
      expect(html).toContain('rel="icon"');
    });

    it("should handle empty favicon URL", () => {
      const emptyFaviconBranding = {
        faviconUrl: "",
      };

      expect(() => generateFaviconHTML(emptyFaviconBranding)).not.toThrow();
      const html = generateFaviconHTML(emptyFaviconBranding);
      expect(html).toContain("/favicon-16x16.png"); // Should fallback
    });

    it("should handle favicon URL with special characters", () => {
      const specialCharBranding = {
        faviconUrl: "https://example.com/favicon with spaces.ico",
      };

      expect(() => generateFaviconHTML(specialCharBranding)).not.toThrow();
    });

    it("should handle extremely long favicon URLs", () => {
      const longUrlBranding = {
        faviconUrl: "https://example.com/" + "a".repeat(2000) + ".ico",
      };

      expect(() => generateFaviconHTML(longUrlBranding)).not.toThrow();
    });

    it("should handle null favicon URL", () => {
      const nullFaviconBranding = {
        faviconUrl: null,
      };

      expect(() =>
        generateFaviconHTML(nullFaviconBranding as any)
      ).not.toThrow();
    });

    it("should handle favicon type detection for edge cases", () => {
      expect(() => getFaviconType("")).not.toThrow();
      expect(() => getFaviconType("no-extension")).not.toThrow();
      expect(() =>
        getFaviconType("multiple.dots.in.filename.ico")
      ).not.toThrow();
      expect(() => getFaviconType("UPPERCASE.ICO")).not.toThrow();

      expect(getFaviconType("UPPERCASE.ICO")).toBe("image/x-icon");
      expect(getFaviconType("no-extension")).toBe("image/x-icon");
    });
  });

  describe("Memory and Performance Edge Cases", () => {
    it("should handle processing large branding objects efficiently", () => {
      const largeBranding: any = {};

      // Create a large branding object with many properties
      for (let i = 0; i < 1000; i++) {
        largeBranding[`property${i}`] = `value${i}`;
      }

      const startTime = Date.now();
      expect(() => generateThemeCSS(largeBranding)).not.toThrow();
      const endTime = Date.now();

      // Should complete within reasonable time (< 100ms)
      expect(endTime - startTime).toBeLessThan(100);
    });

    it("should handle deeply nested object properties gracefully", () => {
      const deeplyNested: any = {
        primary: "#test",
      };

      // Create deep nesting
      let current = deeplyNested;
      for (let i = 0; i < 100; i++) {
        current.nested = { value: `level${i}` };
        current = current.nested;
      }

      expect(() => generateThemeCSS(deeplyNested)).not.toThrow();
    });
  });

  describe("CSS Variable Edge Cases", () => {
    it("should handle invalid CSS variable names", () => {
      const invalidCSSBranding = {
        "invalid-key-with-spaces": "#test",
        "123numeric-start": "#test",
        "special!@#$%chars": "#test",
      };

      expect(() => generateThemeCSS(invalidCSSBranding as any)).not.toThrow();
    });

    it("should handle radius values with complex expressions", () => {
      const complexRadiusBranding = {
        radius: "calc(var(--base-radius) + 2px)",
      };

      expect(() => generateThemeCSS(complexRadiusBranding)).not.toThrow();
      const css = generateThemeCSS(complexRadiusBranding);
      expect(css).toContain("calc(var(--base-radius) + 2px)");
    });

    it("should handle radius values with var() references correctly", () => {
      const varRadiusBranding = {
        radius: "var(--base-radius, 8px)",
      };

      const css = generateThemeCSS(varRadiusBranding);
      expect(css).toContain("--radius: var(--base-radius, 8px)"); // Should preserve the var() syntax
    });
  });
});
