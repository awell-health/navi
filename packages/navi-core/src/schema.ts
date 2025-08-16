import { z } from "zod/v4";

/**
 * Navi Core Session Schemas
 *
 * Purpose
 * - Single source of runtime validation for all auth/session shapes used by navi-portal.
 * - Encodes lifecycle rules and the minimal JWT minting payload.
 *
 * Public API (exports)
 * - SessionValueSchema: discriminated union of stored sessions (created | error | active)
 * - SessionTokenDataSchema: minimal, state-free payload used to mint JWTs (camelCase)
 * - SessionTokenDataWithIdSchema: convenience variant that includes sessionId
 * - JWTPayloadSchema: runtime validator for decoded JWT claims (snake_case)
 * - Types inferred from the above
 *
 * Internal (not exported)
 * - EmbedSessionCreatedSchema, EmbedSessionErrorSchema: stored embed shapes before activation
 * - EmbedSessionCreatedIntentSchema: strict classifier for start-new vs continue-existing
 */

const PatientIdentifierSchema = z.object({
  system: z.string().min(1, "System is required"),
  value: z.string().min(1, "Value is required"),
});

/**
 * Base session token schema used for JWT minting (no embed-specific fields)
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
  createdAt: z
    .number()
    .positive("Created at must be a positive number")
    .default(Date.now())
    .describe("Created at (epoch in milliseconds)"),
  exp: z.number().positive("Expiration must be a positive number"),
});

export type ParsedSessionTokenData = z.infer<typeof SessionTokenDataSchema>;

/**
 * Convenience schema for contexts that require `sessionId` together with token fields
 */
export const SessionTokenDataWithIdSchema = SessionTokenDataSchema.extend({
  sessionId: z.string().min(1, "Session ID is required"),
});

export type ParsedSessionTokenDataWithId = z.infer<
  typeof SessionTokenDataWithIdSchema
>;

// Stored embed session shape (pre-activation) with intent enforced via refinement
const EmbedSessionCreatedSchema = SessionTokenDataSchema.extend({
  sessionId: z.string().min(1, "Session ID is required"),
  state: z.literal("created"),
  // Explicitly disallow errorMessage in created state
  errorMessage: z.undefined().optional(),
  // Intent fields
  careflowDefinitionId: z
    .string()
    .min(1, "Careflow Definition ID is required")
    .optional(),
  patientIdentifier: PatientIdentifierSchema.optional(),
}).superRefine((data, ctx) => {
  const hasDefinitionId = Boolean(data.careflowDefinitionId);
  const hasCareflowId = Boolean(data.careflowId);

  if (!hasDefinitionId && !hasCareflowId) {
    ctx.addIssue({
      code: z.ZodIssueCode.custom,
      message:
        "Either careflowDefinitionId (start-new) or careflowId (continue-existing) is required",
      path: ["careflowDefinitionId"],
    });
  }

  if (hasDefinitionId && hasCareflowId) {
    ctx.addIssue({
      code: z.ZodIssueCode.custom,
      message: "Provide only one of careflowDefinitionId or careflowId",
      path: ["careflowDefinitionId"],
    });
  }
});

// Strict intent helpers for created state (not used in the top-level discriminated union)
export const EmbedSessionCreatedStartSchema = EmbedSessionCreatedSchema.extend({
  careflowDefinitionId: z.string().min(1, "Careflow Definition ID is required"),
  careflowId: z.undefined().optional(),
}).strict();

export const EmbedSessionCreatedContinueSchema =
  EmbedSessionCreatedSchema.extend({
    careflowId: z.string().min(1, "Careflow ID is required"),
    careflowDefinitionId: z.undefined().optional(),
  }).strict();

export const EmbedSessionCreatedIntentSchema = z.union([
  EmbedSessionCreatedStartSchema,
  EmbedSessionCreatedContinueSchema,
]);

const EmbedSessionErrorSchema = SessionTokenDataSchema.extend({
  sessionId: z.string().min(1, "Session ID is required"),
  state: z.literal("error"),
  errorMessage: z.string().min(1, "Error message is required in error state"),
  // Optional context; if present we enforce the same mutual-exclusion rules
  careflowDefinitionId: z
    .string()
    .min(1, "Careflow Definition ID is required")
    .optional(),
  patientIdentifier: PatientIdentifierSchema.optional(),
}).superRefine((data, ctx) => {
  const hasDefinitionId = Boolean(data.careflowDefinitionId);
  const hasCareflowId = Boolean(data.careflowId);

  if (hasDefinitionId && hasCareflowId) {
    ctx.addIssue({
      code: z.ZodIssueCode.custom,
      message: "Provide only one of careflowDefinitionId or careflowId",
      path: ["careflowDefinitionId"],
    });
  }
});

/**
 * Active session schema (stored in KV) – state must be "active" and has required IDs
 */
export const ActiveSessionTokenDataSchema = SessionTokenDataSchema.extend({
  sessionId: z.string().min(1, "Session ID is required"),
  state: z.literal("active"),
  careflowId: z.string().min(1, "Careflow ID is required"),
  stakeholderId: z.string().min(1, "Stakeholder ID is required"),
  patientId: z.string().min(1, "Patient ID is required").optional(),
  patientIdentifier: PatientIdentifierSchema.optional(),
  // Optional scoping
  trackId: z.string().optional(),
  activityId: z.string().optional(),
  // Careflow data populated after activation
  careflowData: z
    .object({
      id: z.string().min(1, "Careflow ID is required"),
      releaseId: z.string().min(1, "Release ID is required"),
    })
    .optional(),
});

// Intentional: not exporting ParsedActiveSessionTokenData; callers should use ParsedSessionValue

/**
 * Union schema for any stored session value in KV
 */
// Discriminated union for any stored session value in KV
export const SessionValueSchema = z.discriminatedUnion("state", [
  ActiveSessionTokenDataSchema,
  EmbedSessionCreatedSchema,
  EmbedSessionErrorSchema,
]);

export type ParsedSessionValue = z.infer<typeof SessionValueSchema>;

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
  createdAt: z
    .number()
    .positive("Created at must be a positive number")
    .default(Date.now())
    .describe("Created at (epoch in milliseconds)"),
  exp: z
    .number()
    .describe("Expiration (epoch in seconds)")
    .positive("Expiration must be a positive number"),
  iat: z.number().positive("Issued at must be a positive number"),
});

export type ParsedJWTPayload = z.infer<typeof JWTPayloadSchema>;
