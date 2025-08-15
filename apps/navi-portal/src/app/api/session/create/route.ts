import { NextRequest, NextResponse } from "next/server";
import { SessionTokenDataSchema } from "@awell-health/navi-core";
import { shortDeterministicId } from "@awell-health/navi-core/helpers";
import { setSession } from "@/domains/session/store";

export const runtime = "edge";

/**
 * POST /api/session/create
 *
 * Accepts a SessionTokenData JSON body, generates a deterministic session_id
 * using shortDeterministicId, stores the session in KV, and returns { session_id }.
 *
 * Authentication is intentionally not enforced here per request.
 */
export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const sessionData = SessionTokenDataSchema.parse(body);

    // Deterministic, order-insensitive session id based on payload
    const sessionId = await shortDeterministicId(sessionData);

    // Persist session (respecting TTL from exp inside setSession)
    await setSession(sessionId, { ...sessionData, sessionId });

    return NextResponse.json({ session_id: sessionId }, { status: 201 });
  } catch (error) {
    return NextResponse.json(
      { error: "Invalid session data" },
      { status: 400 }
    );
  }
}
