// Session management
export {
  createSessionToken,
  decryptSessionToken,
  isValidSessionToken,
} from "./internal/session";

// JWT management
export { createJWT, verifyJWT } from "./external/jwt";

// Types (re-exported from navi-core)
export type {
  SessionTokenData,
  SessionData,
  TokenEnvironment,
  AuthenticationState,
  JWTPayload,
} from "@awell-health/navi-core/src/types";
