import { NextRequest, NextResponse } from "next/server";
import { SessionService } from "@/domains/session/service";

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
    const { sessionId } = await SessionService.createEmbedSession(body);
    return NextResponse.json({ session_id: sessionId }, { status: 201 });
  } catch (error) {
    return NextResponse.json(
      { error: "Invalid session data" },
      { status: 400 }
    );
  }
}
