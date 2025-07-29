/**
 * Token Environment Types
 */
export type TokenEnvironment =
  | "local"
  | "test"
  | "development"
  | "staging"
  | "sandbox"
  | "production-eu"
  | "production-us"
  | "production-uk";

/**
 * Authentication State Types
 */
export type AuthenticationState =
  | "unauthenticated"
  | "verified"
  | "authenticated";

/**
 * Session Token Data Structure (Internal - navi-portal backend)
 *
 * Used by navi-portal backend for internal session management.
 * Stored in KV store to track user sessions and care flow access.
 *
 * Flow:
 * 1. Browser requests care flow access
 * 2. navi-portal backend creates SessionTokenData
 * 3. Session stored in KV store for internal tracking
 * 4. SessionTokenData converted to JWTPayload for GraphQL API calls
 *
 * @example
 * ```typescript
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
 * ```
 */
export interface SessionTokenData {
  patientId?: string;
  careflowId?: string;
  stakeholderId?: string;
  orgId: string;
  tenantId: string;
  environment: TokenEnvironment;
  authenticationState: AuthenticationState;
  exp: number;
}

/**
 * Session Data Structure (In Memory)
 */
export interface SessionData extends Omit<SessionTokenData, "exp"> {
  sessionId: string;
  expiresAt: Date;
}

/**
 * JWT Payload Structure (External - module-navi GraphQL API)
 *
 * Used for authenticating requests to the module-navi GraphQL API.
 * Generated from SessionTokenData and signed into a JWT token.
 *
 * Flow:
 * 1. navi-portal backend has SessionTokenData from KV store
 * 2. SessionTokenData converted to JWTPayload (camelCase → snake_case)
 * 3. JWTPayload signed into JWT for GraphQL API authentication
 * 4. Frontend uses JWT to call module-navi GraphQL endpoints
 *
 * @example
 * ```typescript
 * const jwtPayload: JWTPayload = {
 *   sub: "sess_unique_identifier",        // session_id
 *   careflow_id: "diabetes_management_v2", // unique identifier for the careflow
 *   stakeholder_id: "patient_john_doe",    // stakeholder performing actions
 *   patient_id: "mrn_12345",              // patient the care flow belongs to
 *   tenant_id: "st_marys_hospital",
 *   org_id: "healthcare_network_west",
 *   environment: "production-us",
 *   authentication_state: "verified",     // unauthenticated, verified, authenticated
 *   iss: "navi-portal.awellhealth.com",  // issuer - GraphQL API uses this to lookup consumer
 *   exp: 1640995200,                     // expiration timestamp
 *   iat: 1640908800                      // issued at timestamp
 * };
 * ```
 */
export interface JWTPayload {
  sub: string; // session_id
  careflow_id?: string; // unique identifier for the careflow
  stakeholder_id?: string; // stakeholder performing actions (patient, care coordinator, etc.)
  patient_id?: string; // patient the care flow belongs to
  tenant_id: string;
  org_id: string;
  environment: TokenEnvironment;
  authentication_state: string; // unauthenticated, verified, authenticated
  iss: string; // issuer - Navi's GraphQL API uses this to lookup the consumer
  exp: number; // expiration timestamp
  iat: number; // issued at timestamp
}
