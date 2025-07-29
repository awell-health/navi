// Session management
export {
  createSessionToken,
  decryptSessionToken,
  isValidSessionToken,
} from "./internal/session";

// Types (re-exported from navi-core)
export type {
  SessionTokenData,
  SessionData,
  TokenEnvironment,
  AuthenticationState,
  JWTPayload,
} from "@awell-health/navi-core/src/types";
