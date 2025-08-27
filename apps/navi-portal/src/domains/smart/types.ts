export interface SmartPreAuth {
  iss: string;
  authorizationEndpoint: string;
  tokenEndpoint: string;
  codeVerifier: string;
  state: string;
  scopes: string;
  launch?: string;
}

export interface SmartSessionData {
  sid: string;
  iss: string;
  tokenEndpoint: string;
  accessToken: string;
  idToken?: string;
  scope?: string;
  patient?: string;
  encounter?: string;
  fhirUser: string;
  expiresIn?: number;
  tokenType?: string;
  stytchOrganizationId: string;
}

export type SmartErrorCode =
  | "discovery_failed"
  | "missing_client_id"
  | "token_request_failed"
  | "token_exchange_failed"
  | "simulated_error"
  | "expired_token"
  | "invalid_state"
  | "missing_fhir_user"
  | "missing_stytch_organization_id";
