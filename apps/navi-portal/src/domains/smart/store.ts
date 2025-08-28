"use server";

import { kv } from "@vercel/kv";
import type { SmartSessionData } from "./types";

export type SmartClientConfig = {
  client_id: string;
  client_secret?: string;
  stytch_organization_id?: string;
};

const CLIENT_PREFIX = "smart:client:";
const TICKET_PREFIX = "smart:ticket:";

function clientKey(host: string): string {
  return `${CLIENT_PREFIX}${host}`;
}

function ticketKey(id: string): string {
  return `${TICKET_PREFIX}${id}`;
}

// Client config mapping (issuer host -> { client_id, stytch_organization_id })
export async function setClientConfigForHost(
  host: string,
  config: SmartClientConfig
) {
  await kv.set(clientKey(host), config);
}

export async function getClientConfigForHost(
  host: string
): Promise<SmartClientConfig | null> {
  if (!host) return null;
  const value = (await kv.get(clientKey(host))) as SmartClientConfig | null;
  if (value?.client_id) return value;
  return null;
}

export async function deleteClientConfigForHost(host: string) {
  await kv.del(clientKey(host));
}

/**
 * Create a one-time SMART ticket
 * @param data - The session data to store
 * @param ttlSeconds - The time to live for the ticket in seconds (default: 120)
 * @returns The ticket ID
 */
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
  id?: string
): Promise<SmartSessionData | null> {
  if (!id) return null;
  const data = await getSmartTicket(id);
  if (!data) return null;
  await kv.del(ticketKey(id));
  return data;
}
