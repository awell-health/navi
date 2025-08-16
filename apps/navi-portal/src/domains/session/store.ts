"use server";

import { kv } from "@vercel/kv";
import type {
  SessionData,
  EmbedSessionData,
  ActiveSessionTokenData,
  ParsedSessionValue,
} from "@awell-health/navi-core";
import { SessionValueSchema } from "@awell-health/navi-core";

type AnySession = SessionData | EmbedSessionData | ActiveSessionTokenData;
const keyFor = (id: string) => `session:${id}`;

export async function setSession(sessionId: string, data: AnySession) {
  const sessionData = SessionValueSchema.parse(data);
  console.log("🔍 setSession", {
    sessionId,
    data,
    sessionData,
    exp: new Date(sessionData.exp * 1000).toISOString(),
  });
  await kv.set(keyFor(sessionId), sessionData, { exat: sessionData.exp });
}

export async function getSession(
  sessionId: string
): Promise<ParsedSessionValue | null> {
  const rawData = await kv.get(keyFor(sessionId));
  if (!rawData) return null;
  const parsed = SessionValueSchema.safeParse(rawData);
  if (!parsed.success) {
    console.warn("🔍 getSession: invalid session data", rawData, parsed.error);
    return null;
  }
  const data = parsed.data;
  if (data.exp * 1000 < Date.now()) {
    console.warn("🔍 getSession: session expired", {
      sessionId,
      data,
      exp: new Date(data.exp * 1000).toISOString(),
      now: new Date().toISOString(),
    });
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
