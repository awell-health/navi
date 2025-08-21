import { createEnv } from "@t3-oss/env-nextjs";
import { vercel } from "@t3-oss/env-core/presets-zod";
import { z } from "zod/v4";

export const env = createEnv({
  server: {
    NODE_ENV: z.enum(["development", "production"]).default("development"),
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
      .describe(
        "Stytch environment: test or live (optional, defaults to test)"
      ),
    SMART_REDIRECT_URI: z
      .url()
      .optional()
      .describe(
        "Redirect URI for SMART callback (e.g. https://app.example.com/smart/callback)"
      ),
  },
  client: {
    NEXT_PUBLIC_GRAPHQL_ENDPOINT: z
      .url()
      .optional()
      .default("http://localhost:4000/graphql")
      .describe(
        "GraphQL API endpoint (defaults to http://localhost:4000/graphql)"
      ),
  },
  experimental__runtimeEnv: {
    NEXT_PUBLIC_GRAPHQL_ENDPOINT: process.env.NEXT_PUBLIC_GRAPHQL_ENDPOINT,
  },
  extends: [vercel()],
});
