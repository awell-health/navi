import { NextRequest, NextResponse } from "next/server";
import { AuthService } from "@awell-health/navi-core";

export type SessionStrategyKind = "direct" | "embed";

export interface SessionStrategy {
  kind: SessionStrategyKind;
  detectMismatch: (
    request: NextRequest,
    urlSessionId: string,
    authService: AuthService
  ) => Promise<boolean>;
  applyCookies: (
    response: NextResponse,
    sessionId: string,
    jwt: string
  ) => NextResponse;
  renderSwitchNotice: (switched: boolean) => string;
}

async function detectCookieAndJwtMismatch(
  request: NextRequest,
  urlSessionId: string,
  authService: AuthService
): Promise<boolean> {
  // URL is the source of truth. We only detect and report mismatches.
  try {
    const sidCookie = request.cookies.get("awell.sid");
    if (sidCookie?.value && sidCookie.value !== urlSessionId) {
      return true;
    }
    const jwtCookie = request.cookies.get("awell.jwt");
    if (jwtCookie?.value) {
      const payload = await authService.verifyToken(jwtCookie.value);
      if (payload.sub && payload.sub !== urlSessionId) {
        return true;
      }
    }
  } catch {
    // ignore and treat as no mismatch
  }
  return false;
}

function setStandardCookies(
  response: NextResponse,
  sessionId: string,
  jwt: string
): NextResponse {
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
    maxAge: 15 * 60,
    path: "/",
  });
  return response;
}

export const EmbedSessionStrategy: SessionStrategy = {
  kind: "embed",
  detectMismatch: detectCookieAndJwtMismatch,
  applyCookies: setStandardCookies,
  renderSwitchNotice: (switched: boolean) =>
    switched
      ? "<script>console.warn('[Navi] Using existing session from JWT or cookie; URL session is the source of truth and will be used.')</script>"
      : "",
};

export const DirectSessionStrategy: SessionStrategy = {
  kind: "direct",
  detectMismatch: detectCookieAndJwtMismatch,
  applyCookies: setStandardCookies,
  renderSwitchNotice: () => "", // No client console in direct SSR by default
};
