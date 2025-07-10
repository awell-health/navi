export interface JWTPayload {
  sub: string; // careflow_id
  stakeholder_id: string; // patient_id or other stakeholder_id
  tenant_id: string; // tenant_id
  org_id: string; // org_id
  environment: string; // environment
  iss: string; // issuer - Kong uses this to lookup the consumer
  exp: number; // expiration timestamp
  iat: number; // issued at timestamp
}
