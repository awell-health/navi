import { NextRequest, NextResponse } from "next/server";
import { SessionService } from "@/domains/session/service";

export const runtime = "edge";

export async function GET(request: NextRequest) {
  try {
    const urlSessionId = request.nextUrl.searchParams.get("session_id");

    let sessionId = urlSessionId;
    if (!sessionId) {
      const resolved = await SessionService.resolveSessionFromRequest(request);
      sessionId = resolved.sessionId;
    }

    if (!sessionId) {
      return NextResponse.json(
        { error: "No session found" },
        { status: 401 }
      );
    }

    const session = await SessionService.get(sessionId);
    if (!session) {
      return NextResponse.json(
        { error: "Session not found", sessionId },
        { status: 404 }
      );
    }

    return NextResponse.json({ sessionId, session });
  } catch (error) {
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    );
  }
}


