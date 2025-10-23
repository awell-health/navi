import { NextRequest, NextResponse } from "next/server";
import { AuthService, SessionTokenDataSchema } from "@awell-health/navi-core";
import { env } from "@/env";
import { NaviSession } from "@/domains/session/navi-session";
import { SessionService } from "@/domains/session/service";

export const runtime = "edge";

/**
 * GET /api/session/jwt
 *
 * Returns the JWT token for the current session for client-side use.
 * This allows Apollo client to access the JWT token since it can't read HttpOnly cookies.
 */
export async function GET(request: NextRequest) {
  try {
    const existingJwtCookie = request.cookies.get("awell.jwt");
    const authService = new AuthService();
    await authService.initialize(env.JWT_SIGNING_KEY);

    // Fast-path 1: Authorization header bearer token (works if cookies blocked in iframes)
    const authHeader = request.headers.get("authorization");
    const bearer = authHeader?.match(/^Bearer\s+(.+)$/i)?.[1];
    if (bearer) {
      try {
        const payload = await authService.verifyToken(bearer);
        const sessionIdFromJwt = payload.sub;
        if (sessionIdFromJwt) {
          const session = await SessionService.get(sessionIdFromJwt);
          if (session) {
            const tokenData = NaviSession.renewJwtExpiration(
              SessionTokenDataSchema.parse(session),
              NaviSession.DEFAULT_JWT_TTL_SECONDS
            );
            const jwt = await authService.createJWTFromSession(
              tokenData,
              sessionIdFromJwt,
              env.JWT_KEY_ID,
              { authenticationState: payload.authentication_state }
            );
            const response = NextResponse.json({
              jwt,
              expiresAt: Math.floor(Date.now() / 1000) + 15 * 60,
              environment: tokenData.environment,
            });
            // Best-effort cookie refresh
            response.cookies.set("awell.jwt", jwt, {
              httpOnly: true,
              sameSite: process.env.NODE_ENV === "production" ? "none" : "lax",
              secure: process.env.NODE_ENV === "production",
              maxAge: 15 * 60,
              path: "/",
            });
            return response;
          }
        }
      } catch {
        // ignore and continue
      }
    }

    // Fast-path 2: If a valid JWT cookie is present, verify and re-mint from stored session
    if (existingJwtCookie?.value) {
      try {
        const payload = await authService.verifyToken(existingJwtCookie.value);
        const sessionIdFromJwt = payload.sub;
        if (sessionIdFromJwt) {
          const session = await SessionService.get(sessionIdFromJwt);
          if (session) {
            const tokenData = NaviSession.renewJwtExpiration(
              SessionTokenDataSchema.parse(session),
              NaviSession.DEFAULT_JWT_TTL_SECONDS
            );
            const jwt = await authService.createJWTFromSession(
              tokenData,
              sessionIdFromJwt,
              env.JWT_KEY_ID,
              { authenticationState: payload.authentication_state }
            );
            const response = NextResponse.json({
              jwt,
              expiresAt: Math.floor(Date.now() / 1000) + 15 * 60,
              environment: tokenData.environment,
            });
            // Refresh cookie with freshly minted token (captures latest session claims like careflow_id)
            response.cookies.set("awell.jwt", jwt, {
              httpOnly: true,
              sameSite: process.env.NODE_ENV === "production" ? "none" : "lax",
              secure: process.env.NODE_ENV === "production",
              maxAge: 15 * 60,
              path: "/",
            });
            return response;
          }
        }
      } catch {
        // fall through to session-based issuance
      }
    }

    // Extract session ID from cookie (fallback if no valid JWT)
    const sessionCookie = request.cookies.get("awell.sid");
    if (!sessionCookie) {
      return NextResponse.json({ error: "No session found" }, { status: 401 });
    }

    const sessionId = sessionCookie.value;

    // Get session data from KV store via helper (applies expiration semantics)
    const session = await SessionService.get(sessionId);
    if (!session) {
      console.log("🔍 Session not found:", sessionId);
      return NextResponse.json({ error: "Session expired" }, { status: 401 });
    }

    // Preserve auth context from any (possibly invalid) prior JWT if available
    const { authenticationState } = await NaviSession.extractAuthContextFromJwt(
      authService,
      existingJwtCookie?.value
    );

    // Create fresh token data from session
    const tokenData = NaviSession.renewJwtExpiration(
      SessionTokenDataSchema.parse(session),
      NaviSession.DEFAULT_JWT_TTL_SECONDS
    );

    const jwt = await authService.createJWTFromSession(
      tokenData,
      sessionId,
      env.JWT_KEY_ID,
      { authenticationState }
    );

    // Update the JWT cookie as well
    const response = NextResponse.json({
      jwt,
      expiresAt: Math.floor(Date.now() / 1000) + 15 * 60, // 15 minutes from now
      environment: tokenData.environment,
    });

    // Refresh the JWT cookie
    response.cookies.set("awell.jwt", jwt, {
      httpOnly: true,
      sameSite: process.env.NODE_ENV === "production" ? "none" : "lax",
      secure: process.env.NODE_ENV === "production",
      maxAge: 15 * 60, // 15 minutes
      path: "/",
    });

    return response;
  } catch (error) {
    console.error("JWT endpoint error:", error);
    return NextResponse.json(
      { error: "Failed to generate JWT" },
      { status: 500 }
    );
  }
}
