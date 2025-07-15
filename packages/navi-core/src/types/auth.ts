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
 * Session Token Data Structure (Encrypted)
 */
export interface SessionTokenData {
  patientId: string;
  careflowId: string;
  stakeholderId: string;
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
 * JWT Payload Structure
 */
export interface JWTPayload {
  sub: string; // careflow_id
  stakeholder_id: string; // stakeholder performing actions (patient, care coordinator, etc.)
  patient_id: string; // patient the care flow belongs to
  tenant_id: string;
  org_id: string;
  environment: string;
  authentication_state: string; // unauthenticated, verified, authenticated
  iss: string; // issuer - Kong uses this to lookup the consumer
  exp: number; // expiration timestamp
  iat: number; // issued at timestamp
}
