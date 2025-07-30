import { jwtVerify, SignJWT } from "jose";
import { z } from "zod/v4";
import { NaviAuthError, JWTPayload, SessionTokenData } from "./types";

/**
 * Zod schema for validating SessionTokenData structure at runtime
 */
const SessionTokenDataSchema = z.object({
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
  authenticationState: z.enum(["unauthenticated", "verified", "authenticated"]),
  exp: z.number().positive("Expiration must be a positive number"),
});

/**
 * Zod schema for validating JWT payload structure at runtime
 */
const JWTPayloadSchema = z.object({
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
  iss: z.string().min(1, "Issuer is required"),
  exp: z.number().positive("Expiration must be a positive number"),
  iat: z.number().positive("Issued at must be a positive number"),
});

/**
 * JWT-based authentication service for Navi care flow integration.
 *
 * Handles the two-phase authentication flow:
 * 1. Session management for navi-portal backend (SessionTokenData)
 * 2. JWT generation for module-navi GraphQL API authentication (JWTPayload)
 *
 * @example Basic Session Flow
 * ```typescript
 * import { AuthService } from '@awell-health/navi-core';
 *
 * // Initialize the service
 * const authService = new AuthService();
 * await authService.initialize(process.env.JWT_SECRET);
 *
 * // Phase 1: Create session data for KV storage
 * const sessionData: SessionTokenData = {
 *   patientId: "mrn_12345",
 *   careflowId: "diabetes_management_v2",
 *   stakeholderId: "patient_john_doe",
 *   orgId: "healthcare_network_west",
 *   tenantId: "st_marys_hospital",
 *   environment: "production-us",
 *   authenticationState: "verified",
 *   exp: Math.floor(Date.now() / 1000) + (24 * 60 * 60)
 * };
 *
 * // Phase 2: Convert session to JWT for GraphQL API
 * const jwt = await authService.createJWTFromSession(
 *   sessionData,
 *   "sess_unique_identifier",
 *   "navi-portal.awellhealth.com"
 * );
 *
 * // Frontend can now use JWT to call module-navi GraphQL API
 * ```
 *
 * @example Full Authentication Flow
 * ```typescript
 * // 1. Browser requests care flow access
 * // 2. navi-portal backend creates and stores session
 * const sessionData = await kvStore.get(sessionId);
 *
 * // 3. Convert session to JWT for GraphQL API access
 * const authService = new AuthService();
 * await authService.initialize(process.env.JWT_SECRET);
 *
 * const jwt = await authService.createJWTFromSession(
 *   sessionData,
 *   sessionId,
 *   "navi-portal.awellhealth.com"
 * );
 *
 * // 4. Verify JWT when GraphQL API receives requests
 * try {
 *   const payload = await authService.verifyToken(jwt);
 *   console.log('Authenticated user:', payload.stakeholder_id);
 *   console.log('Careflow access:', payload.careflow_id);
 * } catch (error) {
 *   console.error('Authentication failed:', error.message);
 * }
 * ```
 *
 * @example Error Handling
 * ```typescript
 * try {
 *   const payload = await authService.verifyToken(suspiciousToken);
 * } catch (error) {
 *   if (error instanceof NaviAuthError) {
 *     // Log security event (HIPAA-compliant - no PHI)
 *     logger.warn('Authentication failed', {
 *       error: error.message,
 *       timestamp: new Date().toISOString(),
 *       ip: request.ip
 *     });
 *
 *     // Return generic error to client
 *     res.status(401).json({ error: 'Invalid authentication' });
 *   }
 * }
 * ```
 */
export class AuthService {
  private secretKey: Uint8Array | null = null;

  constructor(private readonly secret?: string) {}

  /**
   * Initialize the auth service with a secret key
   */
  async initialize(secret?: string): Promise<void> {
    const secretToUse = secret || this.secret;

    if (!secretToUse) {
      throw NaviAuthError.notInitialized(
        "Secret key is required for JWT operations"
      );
    }

    try {
      // Use Uint8Array directly for better Edge Runtime compatibility
      this.secretKey = new TextEncoder().encode(secretToUse);
    } catch (error) {
      throw NaviAuthError.initializationFailed(error);
    }
  }

  /**
   * Convert SessionTokenData to JWTPayload structure
   *
   * Handles the camelCase → snake_case field mapping and adds JWT-specific claims.
   *
   * @param sessionData - Session data from KV store
   * @param sessionId - Unique session identifier
   * @param issuer - JWT issuer (e.g., "navi-portal.awellhealth.com")
   * @returns JWTPayload - Converted payload ready for JWT signing
   */
  convertSessionToJWTPayload(
    sessionData: SessionTokenData,
    sessionId: string,
    issuer: string
  ): JWTPayload {
    try {
      // Parse and validate session data
      const validatedSession = SessionTokenDataSchema.parse(sessionData);

      const now = Math.floor(Date.now() / 1000);

      // Convert camelCase to snake_case and add JWT claims
      const jwtPayload: JWTPayload = {
        sub: sessionId,
        careflow_id: validatedSession.careflowId,
        stakeholder_id: validatedSession.stakeholderId,
        patient_id: validatedSession.patientId,
        tenant_id: validatedSession.tenantId,
        org_id: validatedSession.orgId,
        environment: validatedSession.environment,
        authentication_state: validatedSession.authenticationState,
        iss: issuer,
        exp: validatedSession.exp,
        iat: now,
      };

      // Parse and validate the converted payload
      return JWTPayloadSchema.parse(jwtPayload);
    } catch (error) {
      if (error instanceof z.ZodError) {
        throw NaviAuthError.sessionConversionFailed(error.issues);
      }
      throw NaviAuthError.sessionConversionFailed();
    }
  }

  /**
   * Create a signed JWT from SessionTokenData
   *
   * This is the primary method for navi-portal backend to generate
   * JWTs for frontend GraphQL API authentication.
   *
   * @param sessionData - Session data from KV store
   * @param sessionId - Unique session identifier
   * @param issuer - JWT issuer (e.g., "navi-portal.awellhealth.com")
   * @returns Promise<string> - Signed JWT token
   * @throws NaviAuthError - If conversion fails or token creation fails
   */
  async createJWTFromSession(
    sessionData: SessionTokenData,
    sessionId: string,
    issuer: string
  ): Promise<string> {
    if (!this.secretKey) {
      throw NaviAuthError.notInitialized();
    }

    try {
      // Convert session to JWT payload
      const jwtPayload = this.convertSessionToJWTPayload(
        sessionData,
        sessionId,
        issuer
      );

      // Convert to compatible jose payload format
      const josePayload = { ...jwtPayload } as Record<string, unknown>;

      const token = await new SignJWT(josePayload)
        .setProtectedHeader({ alg: "HS256" })
        .setIssuedAt()
        .sign(this.secretKey);

      return token;
    } catch (error) {
      if (error instanceof NaviAuthError) {
        throw error; // Re-throw NaviAuthError from convertSessionToJWTPayload
      }
      throw NaviAuthError.jwtCreationFailed(error);
    }
  }

  /**
   * Create a session token for internal navi-portal use
   *
   * @param sessionData - Session token data
   * @returns Promise<string> - Signed session token (for internal use)
   * @throws NaviAuthError - If validation fails or token creation fails
   */
  async createSessionToken(sessionData: SessionTokenData): Promise<string> {
    if (!this.secretKey) {
      throw NaviAuthError.notInitialized();
    }

    try {
      // Parse and validate session data
      const validatedSession = SessionTokenDataSchema.parse(sessionData);

      // Convert to compatible jose payload format
      const josePayload = { ...validatedSession } as Record<string, unknown>;

      const token = await new SignJWT(josePayload)
        .setProtectedHeader({ alg: "HS256" })
        .setIssuedAt()
        .sign(this.secretKey);

      return token;
    } catch (error) {
      if (error instanceof z.ZodError) {
        throw NaviAuthError.invalidSessionData(error.issues);
      }
      throw NaviAuthError.sessionTokenCreationFailed(error);
    }
  }

  /**
   * Verify a JWT token and return validated payload
   *
   * Used by module-navi GraphQL API to authenticate incoming requests.
   *
   * @param token - JWT token string to verify
   * @returns Promise<JWTPayload> - Verified and validated JWT payload
   * @throws NaviAuthError - If token is invalid, expired, or fails validation
   */
  async verifyToken(token: string): Promise<JWTPayload> {
    if (!this.secretKey) {
      throw NaviAuthError.notInitialized();
    }

    try {
      // Verify JWT signature and expiration
      const { payload } = await jwtVerify(token, this.secretKey);

      // Parse and validate payload structure
      const validatedPayload = JWTPayloadSchema.parse(payload);

      return validatedPayload;
    } catch (error) {
      if (error instanceof z.ZodError) {
        throw NaviAuthError.payloadValidationFailed(error.issues);
      }
      throw NaviAuthError.invalidToken("Invalid or expired token", error);
    }
  }

  /**
   * Verify a session token and return session data
   *
   * Used by navi-portal backend for internal session validation.
   *
   * @param token - Session token string to verify
   * @returns Promise<SessionTokenData> - Verified session data
   * @throws NaviAuthError - If token is invalid, expired, or fails validation
   */
  async verifySessionToken(token: string): Promise<SessionTokenData> {
    if (!this.secretKey) {
      throw NaviAuthError.notInitialized();
    }

    try {
      // Verify JWT signature and expiration
      const { payload } = await jwtVerify(token, this.secretKey);

      // Parse and validate session data structure
      const validatedSession = SessionTokenDataSchema.parse(payload);

      return validatedSession;
    } catch (error) {
      if (error instanceof z.ZodError) {
        throw NaviAuthError.sessionTokenValidationFailed(error.issues);
      }
      throw NaviAuthError.invalidToken(
        "Invalid or expired session token",
        error
      );
    }
  }

  /**
   * Validate publishable key format and extract metadata
   * NOTE: This is a STUB implementation for basic format validation only.
   * The real auth service will validate against a database.
   * @see NaviAuthService in auth-service-stub.ts for the real implementation
   */
  validatePublishableKey(key: string): {
    isValid: boolean;
    environment: "test" | "live" | "unknown";
    keyId?: string;
  } {
    const isValid = true;

    if (!isValid) {
      return { isValid: false, environment: "unknown" };
    }

    const environment = key.startsWith("pk_test_")
      ? "test"
      : key.startsWith("pk_live_")
      ? "live"
      : "unknown";

    const keyId = key.split("_").slice(2).join("_");

    return {
      isValid: true,
      environment,
      keyId,
    };
  }
}
