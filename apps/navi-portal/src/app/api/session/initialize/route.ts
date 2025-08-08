import { NextRequest, NextResponse } from "next/server";
import { sessionStore } from "@/lib/session-store";
import { AuthService } from "@awell-health/navi-core";
import type {
  SessionData,
  EmbedSessionData,
  ActiveSessionTokenData,
} from "@awell-health/navi-core";
import { env } from "@/env";

export const runtime = "edge";

/**
 * Initializes HttpOnly cookies (awell.sid, awell.jwt) for a given session.
 * Security notes:
 * - Only accepts a valid existing session_id stored in KV
 * - Optional: add an HMAC signature in the future if hardening is needed
 */
export async function GET(request: NextRequest) {
  const sessionId = request.nextUrl.searchParams.get("session_id");
  if (!sessionId) {
    return NextResponse.json({ error: "Missing session_id" }, { status: 400 });
  }

  const session = (await sessionStore.get(sessionId)) as
    | SessionData
    | EmbedSessionData
    | ActiveSessionTokenData
    | null;

  if (!session) {
    return NextResponse.json({ error: "Session not found" }, { status: 404 });
  }

  // Check expiry if present
  if (session.exp && session.exp <= Math.floor(Date.now() / 1000)) {
    return NextResponse.json({ error: "Session expired" }, { status: 401 });
  }

  // Create JWT for this session
  const authService = new AuthService();
  await authService.initialize(env.JWT_SIGNING_KEY);

  const tokenPayload = {
    patientId: session.patientId,
    careflowId: (session as ActiveSessionTokenData).careflowId,
    stakeholderId: session.stakeholderId,
    orgId: session.orgId,
    tenantId: session.tenantId,
    environment: session.environment,
    authenticationState: session.authenticationState,
    exp: session.exp,
  };

  const jwt = await authService.createJWTFromSession(
    tokenPayload,
    sessionId,
    env.JWT_KEY_ID
  );

  const response = new NextResponse(null, { status: 204 });
  const isProd = process.env.NODE_ENV === "production";

  response.cookies.set("awell.sid", sessionId, {
    httpOnly: true,
    sameSite: isProd ? "none" : "lax",
    secure: isProd,
    maxAge: 30 * 24 * 60 * 60,
    path: "/",
  });

  response.cookies.set("awell.jwt", jwt, {
    httpOnly: true,
    sameSite: isProd ? "none" : "lax",
    secure: isProd,
    maxAge: 60 * 15, // 15 minutes
    path: "/",
  });

  return response;
}
