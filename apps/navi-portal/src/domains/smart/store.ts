"use server";

import { kv } from "@vercel/kv";
import type { SmartSessionData } from "./types";

export type SmartClientConfig = {
  client_id: string;
  stytch_organization_id?: string;
};

const CLIENT_PREFIX = "smart:client:";
const LEGACY_CLIENT_ID_PREFIX = "smart:client-id:";
const TICKET_PREFIX = "smart:ticket:";

function clientKey(host: string): string {
  return `${CLIENT_PREFIX}${host}`;
}

function legacyClientIdKey(host: string): string {
  return `${LEGACY_CLIENT_ID_PREFIX}${host}`;
}

function ticketKey(id: string): string {
  return `${TICKET_PREFIX}${id}`;
}

// Client config mapping (issuer host -> { client_id, stytch_organization_id })
export async function setClientConfigForHost(
  host: string,
  config: SmartClientConfig
) {
  if (!host || !config?.client_id)
    throw new Error("host and config.client_id are required");
  const normalized = normalizeHost(host);
  await kv.set(clientKey(normalized), config);
}

export async function getClientConfigForHost(
  host: string
): Promise<SmartClientConfig | null> {
  if (!host) return null;
  const normalized = normalizeHost(host);
  const value = (await kv.get(
    clientKey(normalized)
  )) as SmartClientConfig | null;
  if (value?.client_id) return value;
  // Backward compatibility: read legacy client-id string
  const legacy = (await kv.get(legacyClientIdKey(normalized))) as string | null;
  if (legacy && typeof legacy === "string" && legacy.length > 0) {
    return { client_id: legacy };
  }
  return null;
}

export async function deleteClientConfigForHost(host: string) {
  if (!host) return;
  const normalized = normalizeHost(host);
  await kv.del(clientKey(normalized));
}

// One-time SMART ticket storage
export async function createSmartTicket(
  data: SmartSessionData,
  ttlSeconds: number = 120
): Promise<string> {
  const id = crypto.randomUUID();
  await kv.set(ticketKey(id), data, { ex: Math.max(1, ttlSeconds) });
  return id;
}

export async function getSmartTicket(
  id: string
): Promise<SmartSessionData | null> {
  if (!id) return null;
  return (await kv.get(ticketKey(id))) as SmartSessionData | null;
}

export async function consumeSmartTicket(
  id: string
): Promise<SmartSessionData | null> {
  const data = await getSmartTicket(id);
  if (!data) return null;
  await kv.del(ticketKey(id));
  return data;
}

function normalizeHost(input: string): string {
  try {
    return new URL(input).host;
  } catch {
    return input.replace(/^https?:\/\//, "").replace(/\/+$/, "");
  }
}
