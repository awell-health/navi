import { z } from "zod/v4";

/**
 * Zod schema for validating SessionTokenData structure at runtime
 */
export const SessionTokenDataSchema = z.object({
  patientId: z.string().min(1, "Patient ID is required").optional(),
  careflowId: z.string().min(1, "Careflow ID is required").optional(),
  stakeholderId: z.string().min(1, "Stakeholder ID is required").optional(),
  orgId: z.string().min(1, "Organization ID is required"),
  tenantId: z.string().min(1, "Tenant ID is required"),
  environment: z.enum([
    "local",
    "test",
    "development",
    "staging",
    "sandbox",
    "production-eu",
    "production-us",
    "production-uk",
  ]),
  naviStytchUserId: z
    .string()
    .min(1, "Navi Stytch User ID is required")
    .optional(),
  exp: z.number().positive("Expiration must be a positive number"),
});

/**
 * Zod schema for validating JWT payload structure at runtime
 */
export const JWTPayloadSchema = z.object({
  sub: z.string().min(1, "Session ID is required"),
  careflow_id: z.string().min(1, "Careflow ID is required").optional(),
  stakeholder_id: z.string().min(1, "Stakeholder ID is required").optional(),
  patient_id: z.string().min(1, "Patient ID is required").optional(),
  tenant_id: z.string().min(1, "Tenant ID is required"),
  org_id: z.string().min(1, "Organization ID is required"),
  environment: z.enum([
    "local",
    "test",
    "development",
    "staging",
    "sandbox",
    "production-eu",
    "production-us",
    "production-uk",
  ]),
  authentication_state: z.enum([
    "unauthenticated",
    "verified",
    "authenticated",
  ]),
  navi_stytch_user_id: z.string().min(1).optional(),
  iss: z.string().min(1, "Issuer is required"),
  exp: z.number().positive("Expiration must be a positive number"),
  iat: z.number().positive("Issued at must be a positive number"),
});
