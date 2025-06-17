// External API authentication (JWT for GraphQL API)
export { createJWT, verifyJWT, generateStubJWT } from './external/jwt';
export type { JWTPayload } from './external/types';

// Internal session management (AES-GCM encrypted session tokens for magic links)
export { 
  createSessionToken, 
  decryptSessionToken, 
  isValidSessionToken 
} from './internal/session';
export type { 
  SessionTokenData, 
  SessionData, 
  TokenEnvironment 
} from './internal/types';

// Legacy exports for backward compatibility during transition
// TODO: Remove these once all references are updated
export { 
  encryptToken, 
  decryptToken, 
  isValidToken,
  decryptStubToken,
  createStubToken 
} from './internal/session';
export type { TokenData } from './internal/types';
