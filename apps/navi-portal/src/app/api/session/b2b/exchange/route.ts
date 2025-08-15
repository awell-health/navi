import { NextRequest, NextResponse } from "next/server";
import { AuthService, SessionTokenDataSchema } from "@awell-health/navi-core";
import { env } from "@/env";
import { getSession, setSession } from "@/domains/session/store";
import { NaviSession } from "@/domains/session/navi-session";

export const runtime = "edge";

/**
 * POST /api/session/b2b/exchange
 *
 * Server-verifies a platform B2B session/token (implementation-specific),
 * then mints a JWT with authenticationState "authenticated".
 *
 * Optional: Attach durable platform user id to session for auditing.
 */
export async function POST(request: NextRequest) {
  try {
    const sessionCookie = request.cookies.get("awell.sid");
    if (!sessionCookie) {
      return NextResponse.json({ error: "No session" }, { status: 401 });
    }
    const sessionId = sessionCookie.value;

    const session = await getSession(sessionId);
    if (!session) {
      return NextResponse.json({ error: "Session expired" }, { status: 401 });
    }

    // Minimal placeholder verification: require header to match env key
    const platformKeyHeader = request.headers.get("x-platform-b2b-key");
    const platformKeyEnv = (env as unknown as { B2B_EXCHANGE_KEY?: string })
      .B2B_EXCHANGE_KEY;
    if (!platformKeyEnv) {
      return NextResponse.json(
        { error: "B2B exchange not configured" },
        { status: 501 }
      );
    }
    if (platformKeyHeader !== platformKeyEnv) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    // Optional platform user id propagation
    const body = (await request.json().catch(() => ({}))) as {
      platformUserId?: string;
    };
    if (body.platformUserId) {
      const updated = {
        ...(session as object),
        platformUserId: body.platformUserId,
      } as unknown as Parameters<typeof setSession>[1];
      await setSession(sessionId, updated);
    }

    const authService = new AuthService();
    await authService.initialize(env.JWT_SIGNING_KEY);

    // Derive token data and renew token expiry (15 min)
    const tokenData = NaviSession.renewJwtExpiration(
      SessionTokenDataSchema.parse(await getSession(sessionId)),
      15 * 60
    );

    const jwt = await authService.createJWTFromSession(
      tokenData,
      sessionId,
      env.JWT_KEY_ID,
      { authenticationState: "authenticated" }
    );

    console.log(
      JSON.stringify({
        event: "b2b_exchange",
        sessionId,
      })
    );

    const response = NextResponse.json({ success: true, jwt });
    response.cookies.set("awell.jwt", jwt, {
      httpOnly: true,
      sameSite: process.env.NODE_ENV === "production" ? "none" : "lax",
      secure: process.env.NODE_ENV === "production",
      maxAge: 15 * 60,
      path: "/",
    });
    return response;
  } catch (error) {
    console.error("/api/session/b2b/exchange error", error);
    return NextResponse.json(
      { error: "Failed to exchange B2B session" },
      { status: 500 }
    );
  }
}
