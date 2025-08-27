import { createEnv } from "@t3-oss/env-nextjs";
import { vercel } from "@t3-oss/env-core/presets-zod";
import { z } from "zod/v4";

export const env = createEnv({
  server: {
    NODE_ENV: z.enum(["development", "production"]).default("development"),
    BASE_URL: z
      .url()
      .optional()
      .describe(
        "Base URL for the application (optional, defaults to https://navi-portal.awellhealth.com)"
      ),
    EDGE_CONFIG_URL: z
      .url()
      .optional()
      .describe("Vercel edge config URL for branding and other cache"),
    JWT_SIGNING_KEY: z
      .string()
      .min(32)
      .max(32)
      .describe("256-bit secret for JWT signing"),
    JWT_KEY_ID: z.string().min(1).describe("JWT key ID"),
    TOKEN_ENCRYPTION_KEY: z
      .string()
      .min(32)
      .describe("256-bit key for AES-GCM token encryption"),
    BRANDING_API_URL: z.url().optional().describe("URL for the branding API"),
    BRANDING_API_TOKEN: z
      .string()
      .optional()
      .describe("Token for the branding API"),
    VERCEL_API_TOKEN: z
      .string()
      .optional()
      .describe("Vercel API token for Edge Config updates"),
    VERCEL_TEAM_ID: z
      .string()
      .optional()
      .describe("Vercel team ID (optional, for team-scoped configs)"),
    STYTCH_PROJECT_ID: z
      .string()
      .optional()
      .describe("Stytch Project ID (optional for OTC POC)"),
    STYTCH_SECRET: z
      .string()
      .optional()
      .describe("Stytch Project Secret (optional for OTC POC)"),
    STYTCH_ENV: z
      .enum(["test", "live"])
      .optional()
      .default("test")
      .describe(
        "Stytch environment: test or live (optional, defaults to test)"
      ),
    STYTCH_B2B_PROJECT_ID: z.string().describe("Stytch B2B Project ID"),
    STYTCH_B2B_PUBLIC_TOKEN: z
      .string()
      .describe("Stytch B2B Project Public Token"),
    STYTCH_B2B_SECRET: z.string().describe("Stytch B2B Project Secret"),
    STYTCH_B2B_BASE_URL: z
      .string()
      .default("https://test-api.stytch.awellhealth.com")
      .describe("Stytch B2B Base URL"),
    STYTCH_TRUSTED_TOKEN_PROFILE_ID: z
      .string()
      .optional()
      .default(
        "trusted-token-profile-test-bec7f137-9b3d-4148-a0b6-279a3f539432"
      )
      .describe("Stytch B2B Trusted Token Profile ID"),
    STYTCH_TRUSTED_TOKEN_PRIVATE_KEY_B64: z
      .string()
      .optional()
      .describe(
        "Stytch Trusted Token Private Key (optional for OTC POC, base64 encoded)"
      ),
    STYTCH_TRUSTED_TOKEN_KID: z
      .string()
      .optional()
      .describe("Stytch Trusted Token KID (optional for OTC POC)"),
    SMART_REDIRECT_URI: z
      .url()
      .optional()
      .describe(
        "Redirect URI for SMART callback (e.g. https://app.example.com/smart/callback)"
      ),
  },
  experimental__runtimeEnv: {},
  extends: [vercel()],
});
