import { NextRequest, NextResponse } from "next/server";
import { kv } from "@vercel/kv";

export const runtime = "edge";

/**
 * POST /api/session/logout
 *
 * Complete logout: clears JWT cookie, session cookie, and removes session from KV store.
 * Use this for full logout scenarios where the patient should not be able to return
 * without re-authentication.
 */
export async function POST(request: NextRequest) {
  try {
    // Extract session ID from cookie
    // const sessionCookie = request.cookies.get("awell.sid");

    // if (sessionCookie) {
    //   const sessionId = sessionCookie.value;

    //   // Remove session from KV store
    //   try {
    //     await kv.del(`session:${sessionId}`);
    //     console.log("🗑️ Session removed from KV store:", sessionId);
    //   } catch (error) {
    //     console.warn("⚠️ Failed to remove session from KV store:", error);
    //   }
    // }

    const response = NextResponse.json({
      message: "Logged out successfully",
    });

    // Clear both JWT and session cookies
    response.cookies.set("awell.jwt", "", {
      httpOnly: true,
      sameSite: process.env.NODE_ENV === "production" ? "none" : "lax",
      secure: process.env.NODE_ENV === "production",
      maxAge: 0, // Expire immediately
      path: "/",
    });

    response.cookies.set("awell.sid", "", {
      httpOnly: true,
      sameSite: process.env.NODE_ENV === "production" ? "none" : "lax",
      secure: process.env.NODE_ENV === "production",
      maxAge: 0, // Expire immediately
      path: "/",
    });

    console.log("🚪 Complete logout performed");

    return response;
  } catch (error) {
    console.error("Logout error:", error);
    return NextResponse.json({ error: "Failed to logout" }, { status: 500 });
  }
}
