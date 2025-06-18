export type TokenEnvironment = 'local' | 'test' | 'development' | 'staging' | 'sandbox' | 'production-eu' | 'production-us' | 'production-uk'

export type SessionTokenData = {
  patientId: string;
  careflowId: string;
  orgId: string;
  tenantId: string;
  environment: TokenEnvironment;
  exp: number;
}

export type SessionData = Omit<SessionTokenData, 'exp'> & {
  sessionId: string;
  expiresAt: Date;
}
