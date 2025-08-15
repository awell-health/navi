"use server";

import { NextResponse } from "next/server";
import { getSession, setSession } from "./store";
import { validateKey } from "@/domains/auth/publishable-key-store";
import { getBrandingByOrgId } from "@/lib/edge-config";
import { AuthService, SessionTokenDataSchema } from "@awell-health/navi-core";
import { NaviSession } from "@/domains/session/navi-session";
import type {
  BrandingConfig,
  CreateCareFlowSessionRequest,
  CreateCareFlowSessionResponse,
  EmbedSessionData,
  ActiveSessionTokenData,
  SessionData,
  CreateCareFlowSessionResponseError,
} from "@awell-health/navi-core";
import { env } from "@/env";

export type CreateSessionInput = CreateCareFlowSessionRequest & {
  origin?: string | null;
};

export async function createSession(
  input: CreateSessionInput
): Promise<CreateCareFlowSessionResponse> {
  const keyValidation = await validateKey(
    input.publishableKey,
    input.origin || undefined
  );
  if (!keyValidation) {
    return {
      success: false,
      error: "Invalid publishable key or unauthorized origin",
    } as CreateCareFlowSessionResponseError;
  }

  const branding = await safeGetBranding(keyValidation.orgId, input.branding);

  if (input.sessionId) {
    return { success: true, embedUrl: `/embed/${input.sessionId}`, branding };
  }

  const sessionId = crypto.randomUUID();
  const embedSessionData: EmbedSessionData = {
    sessionId,
    patientId: input.awellPatientId,
    careflowId: input.careflowId,
    careflowDefinitionId: input.careflowDefinitionId,
    orgId: keyValidation.orgId,
    tenantId: keyValidation.tenantId,
    environment: keyValidation.environment,
    exp: Math.floor(Date.now() / 1000) + 30 * 24 * 60 * 60,
    state: "created",
    patientIdentifier: input.patientIdentifier,
    track_id: input.trackId,
    activity_id: input.activityId,
    stakeholder_id: input.stakeholderId,
  };
  await setSession(sessionId, embedSessionData);

  return { success: true, embedUrl: `/embed/${sessionId}`, branding };
}

export async function initializeCookies(sessionId: string) {
  const session = (await getSession(sessionId)) as
    | SessionData
    | EmbedSessionData
    | ActiveSessionTokenData
    | null;
  if (!session)
    return NextResponse.json({ error: "Session not found" }, { status: 404 });
  if (session.exp && session.exp <= Math.floor(Date.now() / 1000)) {
    return NextResponse.json({ error: "Session expired" }, { status: 401 });
  }

  const authService = new AuthService();
  await authService.initialize(env.JWT_SIGNING_KEY);
  const tokenData = NaviSession.renewJwtExpiration(
    SessionTokenDataSchema.parse(session),
    NaviSession.DEFAULT_JWT_TTL_SECONDS
  );
  const jwt = await authService.createJWTFromSession(
    tokenData,
    sessionId,
    env.JWT_KEY_ID,
    { authenticationState: "unauthenticated" }
  );

  const response = new NextResponse(null, { status: 204 });
  const isProd = process.env.NODE_ENV === "production";
  response.cookies.set("awell.sid", sessionId, {
    httpOnly: true,
    sameSite: isProd ? "none" : "lax",
    secure: isProd,
    maxAge: 60 * 15,
    path: "/",
  });
  response.cookies.set("awell.jwt", jwt, {
    httpOnly: true,
    sameSite: isProd ? "none" : "lax",
    secure: isProd,
    maxAge: 60 * 15,
    path: "/",
  });
  return response;
}

export async function refreshJwt(sessionId: string) {
  const session = (await getSession(sessionId)) as SessionData | null;
  if (!session)
    return NextResponse.json({ error: "Session not found" }, { status: 401 });

  const authService = new AuthService();
  await authService.initialize(env.JWT_SIGNING_KEY);
  const jwt = await authService.createJWTFromSession(
    session,
    sessionId,
    env.JWT_KEY_ID
  );
  const response = NextResponse.json({ jwt });
  const isProd = process.env.NODE_ENV === "production";
  response.cookies.set("awell.jwt", jwt, {
    httpOnly: true,
    sameSite: isProd ? "none" : "lax",
    secure: isProd,
    maxAge: 60 * 15,
    path: "/",
  });
  return response;
}

async function safeGetBranding(orgId: string, branding?: BrandingConfig) {
  try {
    const stored = await getBrandingByOrgId(orgId);
    return { ...stored, ...branding } as BrandingConfig;
  } catch {
    return branding ?? {};
  }
}

// Stubs for OTC for follow-up (REV-431)
export async function startOtc() {
  throw new Error("Not implemented");
}
export async function verifyOtc() {
  throw new Error("Not implemented");
}
