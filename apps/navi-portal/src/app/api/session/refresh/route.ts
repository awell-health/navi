import { NextRequest, NextResponse } from "next/server";
import { SessionService } from "@/domains/session/service";
import { AuthService } from "@awell-health/navi-core";
import { env } from "@/env";

export const runtime = "edge";

/**
 * POST /api/session/refresh
 *
 * Refreshes the JWT token for the current session and extends session expiry.
 * This is called automatically by the client before token expiration.
 */
export async function POST(request: NextRequest) {
  try {
    // If there is a valid awell.jwt already, refresh it without requiring a session
    const existingJwtCookie = request.cookies.get("awell.jwt")?.value;
    if (existingJwtCookie) {
      try {
        const auth = new AuthService();
        await auth.initialize(env.JWT_SIGNING_KEY);
        const payload = await auth.verifyToken(existingJwtCookie);
        // Keep same sub; extend exp to 15 minutes from now
        const now = Math.floor(Date.now() / 1000);
        const tokenData = {
          orgId: payload.org_id,
          tenantId: payload.tenant_id,
          environment: payload.environment,
          exp: now + 15 * 60,
          naviStytchUserId: payload.navi_stytch_user_id,
          stakeholderId: payload.stakeholder_id,
        } as const;
        const refreshed = await auth.createJWTFromSession(
          tokenData,
          payload.sub,
          env.JWT_KEY_ID,
          { authenticationState: payload.authentication_state }
        );
        const response = NextResponse.json({
          jwt: refreshed,
          expiresAt: now + 15 * 60,
          sessionExpiresAt: null,
        });
        response.cookies.set("awell.jwt", refreshed, {
          httpOnly: true,
          sameSite: process.env.NODE_ENV === "production" ? "none" : "lax",
          secure: process.env.NODE_ENV === "production",
          maxAge: 15 * 60,
          path: "/",
        });
        return response;
      } catch {
        // fall through to session-based refresh
      }
    }

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
