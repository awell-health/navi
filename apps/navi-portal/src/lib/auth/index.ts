// Modern embed tokens (for internal route communication)
export {
  createEmbedToken,
  decryptEmbedToken,
  type EmbedTokenData,
} from "./internal/embed-tokens";

// Legacy session management (for GraphQL API compatibility)
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
} from "@awell-health/navi-core";
