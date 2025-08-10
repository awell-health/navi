import { NextRequest, NextResponse } from "next/server";
import { AuthService } from "@awell-health/navi-core";
import { env } from "@/env";
import { getSession } from "@/domains/session/store";
import { NaviSession } from "@/domains/session/navi-session";

export const runtime = "edge";

/**
 * GET /api/session/jwt
 *
 * Returns the JWT token for the current session for client-side use.
 * This allows Apollo client to access the JWT token since it can't read HttpOnly cookies.
 */
export async function GET(request: NextRequest) {
  try {
    // Extract session ID from cookie
    const sessionCookie = request.cookies.get("awell.sid");
    if (!sessionCookie) {
      return NextResponse.json({ error: "No session found" }, { status: 401 });
    }

    const sessionId = sessionCookie.value;

    // Get session data from KV store via helper (applies expiration semantics)
    const session = await getSession(sessionId);
    if (!session) {
      console.log("🔍 Session not found:", sessionId);
      return NextResponse.json({ error: "Session expired" }, { status: 401 });
    }

    const existingJwtCookie = request.cookies.get("awell.jwt");
    const authService = new AuthService();
    await authService.initialize(env.JWT_SIGNING_KEY);

    // Derive current auth context from existing JWT
    const { authenticationState } = await NaviSession.extractAuthContextFromJwt(
      authService,
      existingJwtCookie?.value
    );

    // Create fresh token data from session
    const tokenData = NaviSession.renewJwtExpiration(
      NaviSession.deriveTokenDataFromSession(
        session as Parameters<typeof NaviSession.deriveTokenDataFromSession>[0]
      ),
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
