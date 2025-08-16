import { NextRequest, NextResponse } from "next/server";
import { SessionService } from "@/domains/session/service";

export const runtime = "edge";

/**
 * POST /api/session/refresh
 *
 * Refreshes the JWT token for the current session and extends session expiry.
 * This is called automatically by the client before token expiration.
 */
export async function POST(request: NextRequest) {
  try {
    const { jwt, sessionId, sessionExpiresAtIso } =
      await SessionService.refreshSessionAndMintJwt(request);

    const response = NextResponse.json({
      jwt,
      expiresAt: Math.floor(Date.now() / 1000) + 15 * 60,
      sessionExpiresAt: sessionExpiresAtIso,
    });
    SessionService.setAuthCookies(response, { sessionId, jwt });
    return response;
  } catch (error) {
    console.error("Session refresh error:", error);
    return NextResponse.json(
      { error: "Failed to refresh session" },
      { status: 500 }
    );
  }
}
