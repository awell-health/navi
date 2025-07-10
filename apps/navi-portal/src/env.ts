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
    PROTOTYPE_API_KEY: z
      .string()
      .min(1)
      .describe("API key for the prototype API"),
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
    ORCHESTRATION_URL: z
      .url()
      .default("https://api.development.awellhealth.com/orchestration/graphql")
      .describe("URL for the orchestration service"),
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
