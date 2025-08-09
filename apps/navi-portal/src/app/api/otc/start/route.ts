import { NextRequest, NextResponse } from "next/server";
import {
  getSession,
  setOtcChallenge,
  deleteOtcChallenge,
} from "@/domains/session/store";
import { createStytchClient } from "@/lib/stytch";

export const runtime = "edge";

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

    const { method, phoneNumber, email } = (await request
      .json()
      .catch(() => ({}))) as {
      method?: "sms" | "email";
      phoneNumber?: string;
      email?: string;
    };

    let chosen: { method: "sms" | "email"; destination: string } | null = null;
    if (method === "sms" && phoneNumber)
      chosen = { method: "sms", destination: phoneNumber };
    if (method === "email" && email)
      chosen = { method: "email", destination: email };
    if (!chosen) {
      if (phoneNumber) chosen = { method: "sms", destination: phoneNumber };
      else if (email) chosen = { method: "email", destination: email };
    }

    if (!chosen) {
      return NextResponse.json({ error: "Missing contact" }, { status: 400 });
    }

    // Clear any existing challenge
    await deleteOtcChallenge(sessionId);

    const sendResult =
      chosen.method === "sms"
        ? await stytch.loginOrCreateSms(chosen.destination)
        : await stytch.loginOrCreateEmail(chosen.destination);

    const expiresAt = Math.floor(Date.now() / 1000) + 10 * 60; // default 10m

    await setOtcChallenge(sessionId, {
      methodId:
        chosen.method === "sms"
          ? (sendResult as { phone_id: string }).phone_id
          : (sendResult as { email_id: string }).email_id,
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
