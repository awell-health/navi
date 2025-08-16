// Centralized session service
// WHY: Unify resolution, refresh/mint, cookie handling, and persistence so
// all routes follow one policy (TTL, auth state propagation, schema safety).

import type { NextRequest, NextResponse } from "next/server";
import {
  AuthenticationState,
  AuthService,
  ParsedSessionValue,
  SessionTokenDataSchema,
} from "@awell-health/navi-core";
import { SessionValueSchema } from "@awell-health/navi-core";
import { shortDeterministicId } from "@awell-health/navi-core/helpers";
import { env } from "@/env";
import { getSession, setSession, deleteSession } from "./store";
import { NaviSession } from "./navi-session";
import { SessionError, SessionErrorCode } from "./error";

export interface ResolvedSessionContext {
  sessionId: string | null;
  authenticationState: AuthenticationState;
  naviStytchUserId?: string;
}

export const SessionService = {
  /**
   * Resolve session identity and current auth context from request
   *
   * Resolution order:
   * 1. awell.sid cookie
   * 2. Authorization header
   * 3. awell.jwt cookie
   *
   * TODO: Discuss the resolution order.
   *
   * @param request
   * @returns
   */
  async resolveSessionFromRequest(
    request: NextRequest
  ): Promise<ResolvedSessionContext> {
    const authService = new AuthService();
    await authService.initialize(env.JWT_SIGNING_KEY);

    let sessionId: string | null =
      request.cookies.get("awell.sid")?.value ?? null;

    let authenticationState: AuthenticationState = "unauthenticated";
    let naviStytchUserId: string | undefined;

    if (!sessionId) {
      const authHeader = request.headers.get("authorization");
      const bearer = authHeader?.match(/^Bearer\s+(.+)$/i)?.[1];
      if (bearer) {
        try {
          const payload = await authService.verifyToken(bearer);
          sessionId = (payload.sub as string) ?? null;
          authenticationState = payload.authentication_state;
          naviStytchUserId = payload.navi_stytch_user_id;
        } catch {
          // ignore invalid header token; remain unauthenticated
        }
      }
    }

    // If we still don't have explicit auth header context, try cookie JWT
    if (!naviStytchUserId) {
      const jwtCookie = request.cookies.get("awell.jwt")?.value;
      if (jwtCookie) {
        try {
          const payload = await authService.verifyToken(jwtCookie);
          authenticationState = payload.authentication_state;
          naviStytchUserId = payload.navi_stytch_user_id;
        } catch {
          // ignore
        }
      }
    }

    return { sessionId, authenticationState, naviStytchUserId };
  },

  /**
   * Resolve and normalize session for a URL-bound request
   *
   * WHY: On routes like /embed/[session_id], the URL is the source of truth.
   * If cookies/JWT reference a different session (e.g., another tab), we
   * return the previous session id so the caller can log and overwrite cookies
   * with the URL session id for consistency.
   */
  async resolveAndNormalizeSessionForUrl(
    request: NextRequest,
    urlSessionId: string
  ): Promise<ResolvedSessionContext & { previousSession?: string }> {
    const { sessionId, authenticationState, naviStytchUserId } =
      await this.resolveSessionFromRequest(request);

    const previousSession =
      sessionId && sessionId !== urlSessionId ? sessionId : undefined;

    return {
      sessionId: urlSessionId,
      authenticationState,
      naviStytchUserId,
      previousSession,
    };
  },

  // Extend session TTL and mint fresh JWT, preserving authentication_state
  // WHY: Keep TTL policy centralized (30d session, 15m JWT) and consistent
  // auth context propagation regardless of route.
  async refreshSessionAndMintJwt(request: NextRequest): Promise<{
    jwt: string;
    sessionId: string;
    sessionExpiresAtIso: string;
  }> {
    const { sessionId, authenticationState } =
      await this.resolveSessionFromRequest(request);
    if (!sessionId) {
      throw new SessionError(SessionErrorCode.NO_SESSION_FOUND);
    }

    const session = await getSession(sessionId);
    if (!session) {
      throw new SessionError(SessionErrorCode.SESSION_EXPIRED);
    }

    const updatedSession = NaviSession.extendSessionExpiration(session);
    await setSession(sessionId, updatedSession);

    const authService = new AuthService();
    await authService.initialize(env.JWT_SIGNING_KEY);

    const tokenData = NaviSession.renewJwtExpiration(
      SessionTokenDataSchema.parse(updatedSession)
    );

    const jwt = await authService.createJWTFromSession(
      tokenData,
      sessionId,
      env.JWT_KEY_ID,
      { authenticationState }
    );

    const sessionExpiresAtIso = new Date(
      (updatedSession as { exp: number }).exp * 1000
    ).toISOString();

    return { jwt, sessionId, sessionExpiresAtIso };
  },

  // Set auth cookies with consistent attributes
  // WHY: Avoid cookie policy drift across routes and keep TTLs uniform.
  setAuthCookies(
    response: NextResponse,
    args: { sessionId: string; jwt: string }
  ) {
    const isProd = process.env.NODE_ENV === "production";

    response.cookies.set("awell.sid", args.sessionId, {
      httpOnly: true,
      sameSite: isProd ? "none" : "lax",
      secure: isProd,
      maxAge: NaviSession.DEFAULT_SESSION_TTL_SECONDS, // 30 days
      path: "/",
    });

    response.cookies.set("awell.jwt", args.jwt, {
      httpOnly: true,
      sameSite: isProd ? "none" : "lax",
      secure: isProd,
      maxAge: NaviSession.DEFAULT_JWT_TTL_SECONDS, // 15 minutes
      path: "/",
    });
  },

  clearAuthCookies(response: NextResponse) {
    const isProd = process.env.NODE_ENV === "production";
    response.cookies.set("awell.sid", "", {
      httpOnly: true,
      sameSite: isProd ? "none" : "lax",
      secure: isProd,
      maxAge: 0,
      path: "/",
    });
    response.cookies.set("awell.jwt", "", {
      httpOnly: true,
      sameSite: isProd ? "none" : "lax",
      secure: isProd,
      maxAge: 0,
      path: "/",
    });
  },

  // Mint a short-lived JWT from a stored session
  // WHY: Centralize token minting so all routes follow the same schema
  // conversion (camelCase → snake_case), default auth state, and issuer.
  async mintJwtFromStoredSession(
    sessionId: string,
    options?: {
      authenticationState?: AuthenticationState;
      naviStytchUserId?: string;
    }
  ): Promise<string> {
    const session = await getSession(sessionId);
    if (!session) {
      throw new SessionError(SessionErrorCode.SESSION_EXPIRED);
    }

    const authService = new AuthService();
    await authService.initialize(env.JWT_SIGNING_KEY);

    // Renew token exp (15 minutes) while leaving session TTL unchanged
    const tokenData = NaviSession.renewJwtExpiration(
      SessionTokenDataSchema.parse(session)
    );

    return authService.createJWTFromSession(
      tokenData,
      sessionId,
      env.JWT_KEY_ID,
      {
        authenticationState: options?.authenticationState ?? "unauthenticated",
        naviStytchUserId: options?.naviStytchUserId,
      }
    );
  },

  // Fetch, validate, mint, and return both values in one call
  // WHY: Keep the invariant (mint from store) while minimizing roundtrips.
  async getEmbedSessionAndMintJwt(
    sessionId: string,
    options?: {
      authenticationState?: AuthenticationState;
      naviStytchUserId?: string;
    }
  ): Promise<{ jwt: string; session: ParsedSessionValue }> {
    const stored = await getSession(sessionId);
    if (!stored) {
      throw new SessionError(SessionErrorCode.NO_SESSION_FOUND);
    }

    // Validate against the union to ensure a recognized session shape
    const parsedSession = SessionValueSchema.safeParse(stored);
    if (!parsedSession.success) {
      throw new SessionError(SessionErrorCode.INVALID_SESSION_TYPE);
    }
    const validated = parsedSession.data;

    if (validated.state === "error") {
      const msg = validated.errorMessage;
      throw new SessionError(
        SessionErrorCode.SESSION_IN_ERROR_STATE,
        msg || "Session in error state"
      );
    }

    const authService = new AuthService();
    await authService.initialize(env.JWT_SIGNING_KEY);

    const parsedToken = SessionTokenDataSchema.safeParse(validated);
    if (!parsedToken.success) {
      throw new SessionError(SessionErrorCode.INVALID_SESSION_TYPE);
    }
    const tokenData = NaviSession.renewJwtExpiration(parsedToken.data);

    const jwt = await authService.createJWTFromSession(
      tokenData,
      sessionId,
      env.JWT_KEY_ID,
      {
        authenticationState: options?.authenticationState ?? "unauthenticated",
        naviStytchUserId: options?.naviStytchUserId,
      }
    );

    return { jwt, session: validated };
  },

  // Create a created/ready embed session and persist it
  // WHY: Fully-validated creation path that preserves caller intent and
  // avoids field loss by parsing the entire input against the embed schema.
  async createEmbedSession(
    input: Record<string, unknown>
  ): Promise<{ sessionId: string }> {
    const base = SessionTokenDataSchema.parse({
      createdAt: Date.now(),
      ...input,
    });
    const sessionId = await shortDeterministicId(base);
    const embed = SessionValueSchema.parse({
      ...input,
      ...base,
      sessionId,
      state: "created",
    });
    await setSession(sessionId, embed);
    return { sessionId };
  },

  // Upgrade a created/ready session to active with required identifiers
  // WHY: Enforce the active schema centrally and preserve prior context.
  async upgradeToActive(args: {
    sessionId: string;
    careflowId: string;
    stakeholderId: string;
    patientId: string;
    careflowData?: { id: string; releaseId: string };
  }): Promise<void> {
    const existing = await getSession(args.sessionId);
    if (!existing) {
      throw new SessionError(SessionErrorCode.SESSION_EXPIRED);
    }
    const active = SessionValueSchema.parse({
      ...existing,
      sessionId: args.sessionId,
      state: "active",
      careflowId: args.careflowId,
      stakeholderId: args.stakeholderId,
      patientId: args.patientId,
      careflowData: args.careflowData,
    });
    await setSession(args.sessionId, active);
  },

  // Re-export low-level persistence for completeness (prefer high-level APIs)
  get: getSession,
  set: setSession,
  delete: deleteSession,
};

export type SessionServiceType = typeof SessionService;
