"use server";

import { NextRequest } from "next/server";
import { headers } from "next/headers";

export async function getRequestOrigin(request: NextRequest): Promise<string> {
  const forwardedProto = request.headers.get("x-forwarded-proto") ?? "https";
  const forwardedHost =
    request.headers.get("x-forwarded-host") ?? request.headers.get("host");
  return forwardedHost
    ? `${forwardedProto}://${forwardedHost}`
    : new URL(request.url).origin;
}

export async function getServerOrigin(): Promise<string> {
  const h = await headers();
  const proto = h.get("x-forwarded-proto") ?? "https";
  const host = h.get("x-forwarded-host") ?? h.get("host");
  if (host) return `${proto}://${host}`;
  // Fallbacks for local/dev
  const base = process.env.NEXT_PUBLIC_BASE_URL || process.env.BASE_URL;
  return base || "http://localhost:3000";
}
