import { NextRequest, NextResponse } from "next/server";

export const runtime = "edge";

/**
 * POST /api/session/clear-jwt
 *
 * Clears the JWT cookie when a care flow is completed.
 * Keeps the session cookie so the patient can return later.
 */
// eslint-disable-next-line @typescript-eslint/no-unused-vars
export async function POST(request: NextRequest) {
  try {
    console.log("🧹 Clearing JWT cookie for care flow completion");

    const response = NextResponse.json({
      message: "JWT cleared successfully",
    });

    // Clear JWT cookie by setting it to expire immediately
    response.cookies.set("awell.jwt", "", {
      httpOnly: true,
      sameSite: process.env.NODE_ENV === "production" ? "none" : "lax",
      secure: process.env.NODE_ENV === "production",
      maxAge: 0, // Expire immediately
      path: "/",
    });

    // Note: We intentionally leave awell.sid cookie alone
    // so the 30-day session persists in case the patient returns

    return response;
  } catch (error) {
    console.error("Clear JWT error:", error);
    return NextResponse.json({ error: "Failed to clear JWT" }, { status: 500 });
  }
}
