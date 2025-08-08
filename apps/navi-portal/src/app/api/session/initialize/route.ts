import { NextRequest } from "next/server";
import { initializeCookies } from "@/domains/session";

export const runtime = "edge";

/**
 * Initializes HttpOnly cookies (awell.sid, awell.jwt) for a given session.
 * Security notes:
 * - Only accepts a valid existing session_id stored in KV
 * - Optional: add an HMAC signature in the future if hardening is needed
 */
export async function GET(request: NextRequest) {
  const sessionId = request.nextUrl.searchParams.get("session_id");
  if (!sessionId) {
    return new Response(JSON.stringify({ error: "Missing session_id" }), {
      status: 400,
      headers: { "Content-Type": "application/json" },
    });
  }
  return initializeCookies(sessionId);
}
