import { NextRequest, NextResponse } from "next/server";
import { AuthService, SessionTokenDataSchema } from "@awell-health/navi-core";
import { env } from "@/env";
import { getSession, setSession } from "@/domains/session/store";
import { NaviSession } from "@/domains/session/navi-session";

export const runtime = "edge";

/**
 * POST /api/session/refresh
 *
 * Refreshes the JWT token for the current session and extends session expiry.
 * This is called automatically by the client before token expiration.
 */
export async function POST(request: NextRequest) {
  try {
    // Extract session ID from cookie
    const sessionCookie = request.cookies.get("awell.sid");
    if (!sessionCookie) {
      return NextResponse.json({ error: "No session found" }, { status: 401 });
    }

    const sessionId = sessionCookie.value;

    // Get session data from KV store
    const session = await getSession(sessionId);
    if (!session) {
      console.log("🔍 Session not found for refresh:", sessionId);
      return NextResponse.json({ error: "Session expired" }, { status: 401 });
    }

    // Extend session expiry (30 days from now) and persist
    const updatedSession = NaviSession.extendSessionExpiration(session);
    await setSession(sessionId, updatedSession);

    // Generate fresh JWT using AuthService, preserving current auth state from existing jwt
    const authService = new AuthService();
    await authService.initialize(env.JWT_SIGNING_KEY);
    const existingJwtCookie = request.cookies.get("awell.jwt");

    const { authenticationState } = await NaviSession.extractAuthContextFromJwt(
      authService,
      existingJwtCookie?.value
    );

    // Create fresh token data from session and renew token exp (15 minutes)
    const tokenData = NaviSession.renewJwtExpiration(
      SessionTokenDataSchema.parse(updatedSession)
    );

    const jwt = await authService.createJWTFromSession(
      tokenData,
      sessionId,
      env.JWT_KEY_ID,
      { authenticationState }
    );

    console.log("🔄 Session refreshed:", {
      sessionId,
      careflowId: (updatedSession as { careflowId?: string }).careflowId,
      newExpiresAt: new Date(
        (updatedSession as { exp: number }).exp * 1000
      ).toISOString(),
    });

    // Return new JWT and update cookies
    const response = NextResponse.json({
      jwt,
      expiresAt: Math.floor(Date.now() / 1000) + 15 * 60, // 15 minutes from now
      sessionExpiresAt: new Date(
        (updatedSession as { exp: number }).exp * 1000
      ).toISOString(),
    });

    // Refresh session cookie (30 days)
    response.cookies.set("awell.sid", sessionId, {
      httpOnly: true,
      sameSite: process.env.NODE_ENV === "production" ? "none" : "lax",
      secure: process.env.NODE_ENV === "production",
      maxAge: 30 * 24 * 60 * 60, // 30 days
      path: "/",
    });

    // Refresh JWT cookie (15 minutes)
    response.cookies.set("awell.jwt", jwt, {
      httpOnly: true,
      sameSite: process.env.NODE_ENV === "production" ? "none" : "lax",
      secure: process.env.NODE_ENV === "production",
      maxAge: 15 * 60, // 15 minutes
      path: "/",
    });

    return response;
  } catch (error) {
    console.error("Session refresh error:", error);
    return NextResponse.json(
      { error: "Failed to refresh session" },
      { status: 500 }
    );
  }
}
