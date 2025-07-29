import { NextRequest, NextResponse } from "next/server";
import { AuthService, SessionTokenData } from "@awell-health/navi-core";
import { env } from "@/env";
import { kv } from "@vercel/kv";

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

    // Get session data from KV store
    const sessionData = await kv.get<SessionTokenData>(`session:${sessionId}`);
    if (!sessionData) {
      console.log("🔍 Session not found:", sessionId);
      return NextResponse.json({ error: "Session expired" }, { status: 401 });
    }

    // Generate fresh JWT using AuthService
    const authService = new AuthService();
    await authService.initialize(env.JWT_SIGNING_KEY);

    const jwt = await authService.createJWTFromSession(
      sessionData,
      sessionId,
      env.JWT_KEY_ID
    );

    // Update the JWT cookie as well
    const response = NextResponse.json({
      jwt,
      expiresAt: Math.floor(Date.now() / 1000) + 15 * 60, // 15 minutes from now
    });

    // Refresh the JWT cookie
    response.cookies.set("awell.jwt", jwt, {
      httpOnly: true,
      sameSite: "lax",
      secure: process.env.NODE_ENV === "production",
      maxAge: 15 * 60, // 15 minutes
      path: "/api/graphql",
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
