"use server";

import { kv } from "@vercel/kv";
import type { SmartSessionData } from "./types";

const CLIENT_ID_PREFIX = "smart:client-id:";
const TICKET_PREFIX = "smart:ticket:";

function clientIdKey(host: string): string {
  return `${CLIENT_ID_PREFIX}${host}`;
}

function ticketKey(id: string): string {
  return `${TICKET_PREFIX}${id}`;
}

// Client ID mapping (issuer host -> client_id)
export async function setClientIdForHost(host: string, clientId: string) {
  if (!host || !clientId) throw new Error("host and clientId are required");
  await kv.set(clientIdKey(host), clientId);
}

export async function getClientIdForHost(host: string): Promise<string | null> {
  if (!host) return null;
  return (await kv.get(clientIdKey(host))) as string | null;
}

export async function deleteClientIdForHost(host: string) {
  if (!host) return;
  await kv.del(clientIdKey(host));
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
