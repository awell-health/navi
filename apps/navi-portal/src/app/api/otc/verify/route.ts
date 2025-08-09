import { NextRequest, NextResponse } from "next/server";
import {
  getOtcChallenge,
  incrementOtcAttempts,
  deleteOtcChallenge,
  getSession,
} from "@/domains/session/store";
import { createStytchClient } from "@/lib/stytch";
import { AuthService } from "@awell-health/navi-core";
import { env } from "@/env";
import type { SessionTokenData } from "@awell-health/navi-core";
import { NaviSession } from "@/domains/session/navi-session";

export const runtime = "edge";

/**
 * POST /api/otc/verify
 * Body: { code: string }
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

    const challenge = await getOtcChallenge(sessionId);
    if (!challenge) {
      return NextResponse.json(
        { error: "No active challenge" },
        { status: 400 }
      );
    }
    if (challenge.attempts >= challenge.maxAttempts) {
      return NextResponse.json({ error: "Too many attempts" }, { status: 429 });
    }

    const { code } = (await request.json()) as { code: string };
    if (!code || code.length < 4) {
      await incrementOtcAttempts(sessionId);
      return NextResponse.json({ error: "Invalid code" }, { status: 400 });
    }

    const stytch = createStytchClient();
    if (!stytch) {
      return NextResponse.json(
        { error: "Stytch not configured" },
        { status: 500 }
      );
    }

    try {
      const verifyResult = await stytch.authenticateOtp(
        challenge.methodId,
        code
      );
      console.log(
        JSON.stringify({
          event: "otc_verify_success",
          sessionId,
          method: challenge.method,
          requestId: verifyResult.request_id,
          stytchUserId: challenge.stytchUserId,
        })
      );
    } catch (_e) {
      const updated = await incrementOtcAttempts(sessionId);
      const remaining = updated
        ? Math.max(0, updated.maxAttempts - updated.attempts)
        : 0;
      return NextResponse.json(
        { error: "Incorrect code", remainingAttempts: remaining },
        { status: 401 }
      );
    }

    // Success: delete challenge, mint fresh JWT with upgraded auth state
    await deleteOtcChallenge(sessionId);
    // Persist durable Stytch user id on session if missing
    if (
      !(session as { naviStytchUserId?: string }).naviStytchUserId &&
      challenge.stytchUserId
    ) {
      const { setSession, getSession } = await import(
        "@/domains/session/store"
      );
      const latest = await getSession(sessionId);
      if (latest) {
        const updated = NaviSession.attachStytchUserIdToSession(
          latest,
          challenge.stytchUserId
        );
        await setSession(sessionId, updated as never);
      }
    }

    // Do not persist authentication state to KV; JWT carries authority.

    const authService = new AuthService();
    await authService.initialize(env.JWT_SIGNING_KEY);
    // Derive token data from session and ensure stytch user id exists, then renew exp
    let tokenData: SessionTokenData = NaviSession.deriveTokenDataFromSession(
      session as unknown as Parameters<
        typeof NaviSession.deriveTokenDataFromSession
      >[0]
    );
    if (!tokenData.naviStytchUserId && challenge.stytchUserId) {
      tokenData = NaviSession.attachStytchUserIdToToken(
        tokenData,
        challenge.stytchUserId
      );
    }
    tokenData = NaviSession.renewJwtExpiration(tokenData, 15 * 60);

    const jwt = await authService.createJWTFromSession(
      tokenData,
      sessionId,
      env.JWT_KEY_ID,
      {
        authenticationState: "verified",
      }
    );

    const response = NextResponse.json({ success: true });
    response.cookies.set("awell.jwt", jwt, {
      httpOnly: true,
      sameSite: process.env.NODE_ENV === "production" ? "none" : "lax",
      secure: process.env.NODE_ENV === "production",
      maxAge: 15 * 60,
      path: "/",
    });
    return response;
  } catch (err) {
    console.error("/api/otc/verify error", err);
    return NextResponse.json(
      { error: "Failed to verify OTC" },
      { status: 500 }
    );
  }
}
