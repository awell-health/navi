import { NextRequest, NextResponse } from "next/server";
import type { CreateCareFlowSessionRequest } from "@awell-health/navi-core";
import { createSession } from "@/domains/session";
import { isSessionResponseSuccess } from "@awell-health/navi-core/helpers";

export const runtime = "edge";

// (branding resolution is handled in the session domain)

/**
 * This API is used to create a careflow session.
 * It is called by the HOST SITE (using navi.js script) when a user clicks on a careflow in the portal.
 */
export async function POST(request: NextRequest) {
  try {
    const body: CreateCareFlowSessionRequest = await request.json();
    console.debug("🔍 POST /api/create-careflow-session", body);
    // Validate required fields
    if (
      !body.publishableKey ||
      (!body.careflowId && !body.careflowDefinitionId && !body.sessionId)
    ) {
      return NextResponse.json(
        {
          success: false,
          error:
            "Missing required fields: publishableKey and (careflowId or careflowDefinitionId or sessionId)",
        },
        {
          status: 400,
          headers: {
            "Access-Control-Allow-Origin": "*",
            "Access-Control-Allow-Methods": "POST, OPTIONS",
            "Access-Control-Allow-Headers": "Content-Type, Authorization",
          },
        }
      );
    }

    const origin = request.headers.get("origin");
    const response = await createSession({ ...body, origin });
    const status = isSessionResponseSuccess(response) ? 200 : 401;
    return NextResponse.json(response, {
      status,
      headers: {
        "Access-Control-Allow-Origin": "*",
        "Access-Control-Allow-Methods": "POST, OPTIONS",
        "Access-Control-Allow-Headers": "Content-Type, Authorization",
      },
    });
  } catch (error) {
    console.error("❌ Error creating care flow session:", error);
    return NextResponse.json(
      {
        success: false,
        error: "Failed to create care flow session",
      },
      {
        status: 500,
        headers: {
          "Access-Control-Allow-Origin": "*",
          "Access-Control-Allow-Methods": "POST, OPTIONS",
          "Access-Control-Allow-Headers": "Content-Type, Authorization",
        },
      }
    );
  }
}

// Handle preflight requests for CORS
export async function OPTIONS() {
  return new NextResponse(null, {
    status: 200,
    headers: {
      "Access-Control-Allow-Origin": "*",
      "Access-Control-Allow-Methods": "POST, OPTIONS",
      "Access-Control-Allow-Headers": "Content-Type, Authorization",
    },
  });
}
