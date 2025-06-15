export type TokenData = {
  patientId: string;
  careflowId: string;
  orgId: string;
  tenantId: string;
  environment: string;
  exp: number;
}

export type SessionData = Omit<TokenData, 'exp'> & {
  sessionId: string;
  expiresAt: Date;
}

