import { NextRequest, NextResponse } from "next/server";
import {
  getSession,
  setOtcChallenge,
  deleteOtcChallenge,
} from "@/domains/session/store";
import { createStytchClient } from "@/lib/stytch";
import { z } from "zod";
import { OTCStartFactory } from "@/domains/auth/otc/strategy";

export const runtime = "edge";

// Strategies extracted to domain module

/**
 * POST /api/otc/start
 * Body: { method?: "sms" | "email", phoneNumber?: string, email?: string }
 * - If method is omitted, picks based on provided contact.
 * - Associates an OTC challenge with the current session (from awell.sid cookie).
 */
export async function POST(request: NextRequest) {
  try {
    const sessionCookie = request.cookies.get("awell.sid");
    if (!sessionCookie) {
      return NextResponse.json({ error: "No session" }, { status: 401 });
    }
    const sessionId = sessionCookie.value;

    const session = await getSession(sessionId);
    if (!session) {
      return NextResponse.json({ error: "Session expired" }, { status: 401 });
    }

    const stytch = createStytchClient();
    if (!stytch) {
      return NextResponse.json(
        { error: "Stytch not configured" },
        { status: 500 }
      );
    }

    const BodySchema = z
      .discriminatedUnion("method", [
        z.object({
          method: z.literal("sms"),
          phoneNumber: z.string().min(5),
        }),
        z.object({
          method: z.literal("email"),
          email: z.string().email(),
        }),
      ])
      .transform((v) => {
        return {
          method: v.method,
          destination: "phoneNumber" in v ? v.phoneNumber : v.email,
        };
      });
    const body = await request.json().catch(() => ({}));

    const parseResult = BodySchema.safeParse(body);
    if (!parseResult.success) {
      return NextResponse.json(
        { error: parseResult.error.message },
        { status: 400 }
      );
    }
    const chosen = parseResult.data;

    // Clear any existing challenge
    await deleteOtcChallenge(sessionId);

    const otcStartFactory = new OTCStartFactory(stytch);
    const sendResult = await otcStartFactory.start(sessionId, chosen);

    const expiresAt = Math.floor(Date.now() / 1000) + 10 * 60; // default 10m

    await setOtcChallenge(sessionId, {
      methodId: sendResult.method_id,
      method: chosen.method,
      destination: chosen.destination,
      attempts: 0,
      maxAttempts: 5,
      expiresAt,
      stytchUserId: sendResult.user_id,
      lastRequestId: sendResult.request_id,
    });

    console.log(
      JSON.stringify({
        event: "otc_start",
        sessionId,
        method: chosen.method,
        stytchUserId: sendResult.user_id,
        requestId: sendResult.request_id,
      })
    );

    return NextResponse.json({ method: chosen.method, expiresAt });
  } catch (err) {
    console.error("/api/otc/start error", err);
    return NextResponse.json({ error: "Failed to start OTC" }, { status: 500 });
  }
}
