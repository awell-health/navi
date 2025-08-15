"use server";

import { kv } from "@vercel/kv";
import { NaviSession } from "@/domains/session/navi-session";
import type {
  SessionData,
  EmbedSessionData,
  ActiveSessionTokenData,
} from "@awell-health/navi-core";
import { shortDeterministicId } from "@awell-health/navi-core/helpers";

type AnySession = SessionData | EmbedSessionData | ActiveSessionTokenData;
const keyFor = (id: string) => `session:${id}`;

export async function setSession(sessionId: string, data: AnySession) {
  // Respect the session exp if provided; otherwise apply default 30-day TTL
  const nowSeconds = Math.floor(Date.now() / 1000);
  const ttlFromExp = (data as Pick<AnySession, "exp">).exp
    ? Math.max(1, (data as { exp: number }).exp - nowSeconds)
    : NaviSession.DEFAULT_SESSION_TTL_SECONDS;
  await kv.set(keyFor(sessionId), data, { ex: ttlFromExp });
}

export async function getSession(
  sessionId: string
): Promise<AnySession | null> {
  const data = (await kv.get(keyFor(sessionId))) as AnySession | null;
  if (!data) return null;
  if (data.exp * 1000 < Date.now()) {
    await deleteSession(sessionId);
    return null;
  }
  return data;
}

export async function deleteSession(sessionId: string) {
  await kv.del(keyFor(sessionId));
}

// OTC (one-time code) challenge storage, scoped by session
interface OtcChallenge {
  // Stytch login_or_create returns a channel-specific method id: phone_id or email_id
  methodId: string;
  method: "sms" | "email";
  // Do not log destination; treat as PHI/PII
  destination: string; // phone number in E.164 or email
  attempts: number;
  maxAttempts: number;
  expiresAt: number; // epoch seconds
  // Optional durable identifiers for debugging and linking
  stytchUserId?: string;
  lastRequestId?: string;
}

const otcKeyFor = (sessionId: string) => `session:${sessionId}:otc`;

export async function setOtcChallenge(
  sessionId: string,
  challenge: OtcChallenge
) {
  const ttlSeconds = Math.max(
    1,
    challenge.expiresAt - Math.floor(Date.now() / 1000)
  );
  await kv.set(otcKeyFor(sessionId), challenge, { ex: ttlSeconds });
}

export async function getOtcChallenge(
  sessionId: string
): Promise<OtcChallenge | null> {
  const data = (await kv.get(otcKeyFor(sessionId))) as OtcChallenge | null;
  if (!data) return null;
  if (data.expiresAt * 1000 < Date.now()) {
    await deleteOtcChallenge(sessionId);
    return null;
  }
  return data;
}

export async function incrementOtcAttempts(
  sessionId: string
): Promise<OtcChallenge | null> {
  const challenge = await getOtcChallenge(sessionId);
  if (!challenge) return null;
  const updated: OtcChallenge = {
    ...challenge,
    attempts: challenge.attempts + 1,
  };
  await setOtcChallenge(sessionId, updated);
  return updated;
}

export async function deleteOtcChallenge(sessionId: string) {
  await kv.del(otcKeyFor(sessionId));
}
