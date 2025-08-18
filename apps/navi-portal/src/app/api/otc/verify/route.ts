import { NextRequest, NextResponse } from "next/server";
import { z } from "zod";
import { OTCVerifyFactory } from "@/domains/auth/otc/strategy";
import {
  getOtcChallenge,
  incrementOtcAttempts,
  deleteOtcChallenge,
} from "@/domains/session/store";
import { createStytchClient } from "@/lib/stytch";
import { AuthService, SessionTokenDataSchema } from "@awell-health/navi-core";
import { env } from "@/env";
import { NaviSession } from "@/domains/session/navi-session";
import { SessionService } from "@/domains/session/service";

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

    const session = await SessionService.get(sessionId);
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

    const CodeSchema = z
      .object({ code: z.string().min(4) })
      .transform((v) => v.code.trim());
    const parsed = CodeSchema.safeParse(await request.json());
    if (!parsed.success) {
      await incrementOtcAttempts(sessionId);
      return NextResponse.json({ error: "Invalid code" }, { status: 400 });
    }
    const code = parsed.data;

    const stytch = createStytchClient();
    if (!stytch) {
      return NextResponse.json(
        { error: "Stytch not configured" },
        { status: 500 }
      );
    }

    try {
      // Strategy selection based on method discriminator
      const verifyFactory = new OTCVerifyFactory(stytch);
      const verifyResult = await verifyFactory.verify(
        challenge.method,
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
    if (!session.naviStytchUserId && challenge.stytchUserId) {
      const latest = await SessionService.get(sessionId);
      if (latest) {
        const updated = NaviSession.attachStytchUserIdToSession(
          latest,
          challenge.stytchUserId
        );
        await SessionService.set(sessionId, updated);
      }
    }

    // Do not persist authentication state to KV; JWT carries authority.

    const authService = new AuthService();
    await authService.initialize(env.JWT_SIGNING_KEY);
    // Derive token data from session and ensure stytch user id exists, then renew exp
    let tokenData = SessionTokenDataSchema.parse(session);
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
