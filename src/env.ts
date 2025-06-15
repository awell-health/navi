import { createEnv } from "@t3-oss/env-nextjs";
import { z } from "zod/v4";

export const env = createEnv({
  server: {
    NODE_ENV: z.enum(["development", "production"]),
    JWT_SIGNING_KEY: z.string().min(32).describe("256-bit secret for JWT signing"),
    TOKEN_ENCRYPTION_KEY: z.string().min(32).describe("256-bit key for AES-GCM token encryption"),
  },
  client: {},
  experimental__runtimeEnv: {},
});