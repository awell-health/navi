// Utility module: do not use "use server" here so it can be imported by edge routes

import type {
  ActiveSessionTokenData,
  AuthenticationState,
  EmbedSessionData,
  SessionData,
  SessionTokenData,
} from "@awell-health/navi-core";
import { AuthService } from "@awell-health/navi-core";

type AnySession = SessionData | EmbedSessionData | ActiveSessionTokenData;

export class NaviSession {
  // Centralized TTL policy
  static readonly DEFAULT_SESSION_TTL_SECONDS = 30 * 24 * 60 * 60; // 30 days
  static readonly DEFAULT_JWT_TTL_SECONDS = 15 * 60; // 15 minutes

  static renewJwtExpiration(
    tokenData: SessionTokenData,
    ttlSeconds = NaviSession.DEFAULT_JWT_TTL_SECONDS
  ): SessionTokenData {
    const exp = Math.floor(Date.now() / 1000) + ttlSeconds;
    // eslint-disable-next-line no-console
    console.log("[NaviSession] renewing JWT exp", { exp });
    return { ...tokenData, exp };
  }

  static extendSessionExpiration<T extends AnySession = AnySession>(
    session: T,
    ttlSeconds: number = NaviSession.DEFAULT_SESSION_TTL_SECONDS
  ): T {
    const exp = Math.floor(Date.now() / 1000) + ttlSeconds;
    // eslint-disable-next-line no-console
    console.log("[NaviSession] extending session exp", {
      sessionId: (session as { sessionId?: string }).sessionId,
      exp,
    });
    return { ...session, exp } as T;
  }

  static attachStytchUserIdToSession<T extends AnySession = AnySession>(
    session: T,
    stytchUserId: string
  ): T {
    // eslint-disable-next-line no-console
    console.log("[NaviSession] attaching Stytch user id to session", {
      sessionId: (session as { sessionId?: string }).sessionId,
    });
    return { ...session, naviStytchUserId: stytchUserId } as T;
  }

  static attachStytchUserIdToToken(
    tokenData: SessionTokenData,
    stytchUserId: string
  ): SessionTokenData {
    // eslint-disable-next-line no-console
    console.log("[NaviSession] attaching Stytch user id to token data");
    return { ...tokenData, naviStytchUserId: stytchUserId };
  }

  static async extractAuthContextFromJwt(
    authService: AuthService,
    existingJwt?: string
  ): Promise<{
    authenticationState: AuthenticationState;
    naviStytchUserId?: string;
  }> {
    let authenticationState: AuthenticationState = "unauthenticated";
    let naviStytchUserId: string | undefined;
    if (!existingJwt) return { authenticationState, naviStytchUserId };
    try {
      const payload = await authService.verifyToken(existingJwt);
      authenticationState = payload.authentication_state;
      naviStytchUserId = payload.navi_stytch_user_id;
    } catch {
      // ignore, keep defaults
    }
    return { authenticationState, naviStytchUserId };
  }
}
