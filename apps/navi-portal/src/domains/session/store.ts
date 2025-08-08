"use server";

import { kv } from "@vercel/kv";
import type {
  SessionData,
  EmbedSessionData,
  ActiveSessionTokenData,
} from "@awell-health/navi-core";

type AnySession = SessionData | EmbedSessionData | ActiveSessionTokenData;
const keyFor = (id: string) => `session:${id}`;

export async function setSession(sessionId: string, data: AnySession) {
  await kv.set(keyFor(sessionId), data, { ex: 86400 });
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
