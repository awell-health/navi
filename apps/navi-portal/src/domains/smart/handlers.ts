import { NextRequest, NextResponse } from "next/server";
import { decryptObject } from "./crypto";
import type { SmartPreAuth } from "./types";
import { getClientIdForHost } from "@/domains/smart/store";

export function getIssuerHost(iss: string): string {
  try {
    return new URL(iss).host;
  } catch {
    return iss.replace(/^https?:\/\//, "").replace(/\/+$/, "");
  }
}

export function buildOrigin(request: NextRequest): string {
  const proto = request.headers.get("x-forwarded-proto") ?? "https";
  const host =
    request.headers.get("x-forwarded-host") ?? request.headers.get("host");
  return host ? `${proto}://${host}` : new URL(request.url).origin;
}

export function errorRedirect(
  request: NextRequest,
  params: {
    code: string;
    message?: string;
    status?: number | string;
    iss?: string;
  }
): NextResponse {
  const origin = buildOrigin(request);
  const url = new URL("/smart/error", origin);
  url.searchParams.set("code", params.code);
  if (params.message) url.searchParams.set("message", params.message);
  if (params.status !== undefined)
    url.searchParams.set("status", String(params.status));
  if (params.iss) url.searchParams.set("iss", params.iss);
  return NextResponse.redirect(url.toString(), 302);
}

export async function resolveClientId(iss: string): Promise<string | null> {
  const host = getIssuerHost(iss);
  const fromKv = await getClientIdForHost(host);
  return fromKv ?? null;
}

export async function decodeState(
  state?: string | null
): Promise<SmartPreAuth | null> {
  if (!state) return null;
  try {
    return await decryptObject<SmartPreAuth>(state);
  } catch {
    return null;
  }
}
