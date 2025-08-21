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
  fhirUser?: string;
  expiresIn?: number;
  tokenType?: string;
}
