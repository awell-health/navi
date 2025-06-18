import { createEnv } from "@t3-oss/env-nextjs";
import { z } from "zod/v4";

export const env = createEnv({
  server: {
    NODE_ENV: z.enum(["development", "production"]).default("development"),
    PROTOTYPE_API_KEY: z.string().min(1).describe("API key for the prototype API"),
    JWT_SIGNING_KEY: z.string().min(32).max(32).describe("256-bit secret for JWT signing"),
    JWT_KEY_ID: z.string().min(1).describe("JWT key ID"),
    TOKEN_ENCRYPTION_KEY: z.string().min(32).describe("256-bit key for AES-GCM token encryption")
  },
  client: {},
  experimental__runtimeEnv: {},
});