export type TokenEnvironment = 'local' | 'test' | 'development' | 'staging' | 'sandbox' | 'production-eu' | 'production-us' | 'production-uk'

export type TokenData = {
  patientId: string;
  careflowId: string;
  orgId: string;
  tenantId: string;
  environment: TokenEnvironment;
  exp: number;
}

export type SessionData = Omit<TokenData, 'exp'> & {
  sessionId: string;
  expiresAt: Date;
}

