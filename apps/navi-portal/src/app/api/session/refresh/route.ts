import { NextRequest, NextResponse } from "next/server";
import { AuthService, SessionTokenData } from "@awell-health/navi-core";
import { env } from "@/env";
import { kv } from "@vercel/kv";

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
    const sessionData = await kv.get<SessionTokenData>(`session:${sessionId}`);
    if (!sessionData) {
      console.log("🔍 Session not found for refresh:", sessionId);
      return NextResponse.json({ error: "Session expired" }, { status: 401 });
    }

    // Check if session is still valid (not expired)
    if (new Date(sessionData.exp * 1000).getTime() < Date.now()) {
      console.log("🔍 Session expired during refresh:", sessionId);
      await kv.del(`session:${sessionId}`); // Clean up expired session
      return NextResponse.json({ error: "Session expired" }, { status: 401 });
    }

    // Extend session expiry (30 days from now)
    const newExp = Math.floor(Date.now() / 1000) + 30 * 24 * 60 * 60;
    const updatedSessionData = {
      ...sessionData,
      exp: newExp,
    };

    // Update session in KV store
    await kv.set(`session:${sessionId}`, updatedSessionData, {
      ex: 30 * 24 * 60 * 60,
    }); // 30 days TTL

    // Generate fresh JWT using AuthService
    const authService = new AuthService();
    await authService.initialize(env.JWT_SIGNING_KEY);

    const jwt = await authService.createJWTFromSession(
      updatedSessionData,
      sessionId,
      env.JWT_KEY_ID
    );

    console.log("🔄 Session refreshed:", {
      sessionId,
      careflowId: updatedSessionData.careflowId,
      newExpiresAt: new Date(newExp * 1000).toISOString(),
    });

    // Return new JWT and update cookies
    const response = NextResponse.json({
      jwt,
      expiresAt: Math.floor(Date.now() / 1000) + 15 * 60, // 15 minutes from now
      sessionExpiresAt: new Date(newExp * 1000).toISOString(),
    });

    // Refresh session cookie (30 days)
    response.cookies.set("awell.sid", sessionId, {
      httpOnly: true,
      sameSite: "lax",
      secure: process.env.NODE_ENV === "production",
      maxAge: 30 * 24 * 60 * 60, // 30 days
      path: "/",
    });

    // Refresh JWT cookie (15 minutes)
    response.cookies.set("awell.jwt", jwt, {
      httpOnly: true,
      sameSite: "lax",
      secure: process.env.NODE_ENV === "production",
      maxAge: 15 * 60, // 15 minutes
      path: "/api/graphql",
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
