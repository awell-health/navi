/**
 * Authentication Configuration
 */
export interface AuthConfig {
  publishableKey: string;
  apiUrl?: string;
}

/**
 * Authentication Token
 */
export interface AuthToken {
  token: string;
  expiresAt: number;
}

/**
 * JWT Payload Structure
 */
export interface JWTPayload {
  sub: string; // careflow_id
  stakeholder_id: string; // patient_id
  tenant_id: string;
  org_id: string;
  environment: string;
  iss: string; // issuer
  exp: number; // expiration timestamp
  iat: number; // issued at timestamp
}

/**
 * Authentication Result
 */
export interface AuthResult {
  jwt: string;
  payload: JWTPayload;
}
