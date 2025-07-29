import { NextRequest, NextResponse } from "next/server";
import { createSessionToken } from "@/lib/auth/internal/session";
import { validatePublishableKey } from "@/lib/auth/publishable-keys";
import type {
  CreateCareFlowSessionRequest,
  CreateCareFlowSessionResponse,
} from "@awell-health/navi-core/src/types";

export const runtime = "edge";

export async function POST(request: NextRequest) {
  try {
    const body: CreateCareFlowSessionRequest = await request.json();
    console.log("🔍 POST /api/create-careflow-session", body);
    // Validate required fields
    if (!body.publishableKey || !body.careflowId) {
      return NextResponse.json(
        {
          success: false,
          error: "Missing required fields: publishableKey and careflowId",
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

    // Validate publishable key against organization
    const origin = request.headers.get("origin");
    const keyValidation = validatePublishableKey(
      body.publishableKey,
      origin || undefined
    );

    if (!keyValidation) {
      return NextResponse.json(
        {
          success: false,
          error: "Invalid publishable key or unauthorized origin",
        },
        {
          status: 401,
          headers: {
            "Access-Control-Allow-Origin": "*",
            "Access-Control-Allow-Methods": "POST, OPTIONS",
            "Access-Control-Allow-Headers": "Content-Type, Authorization",
          },
        }
      );
    }
    // Create session token for the existing care flow
    const sessionTokenData = {
      patientId: body.stakeholderId!,
      careflowId: body.careflowId,
      stakeholderId: body.stakeholderId!,
      orgId: keyValidation.orgId,
      tenantId: keyValidation.tenantId,
      environment: keyValidation.environment,
      authenticationState: "unauthenticated" as const,
      exp: Math.floor(Date.now() / 1000) + 30 * 24 * 60 * 60, // 30 days
    };

    const sessionToken = await createSessionToken(sessionTokenData);

    // Generate redirect URL for the embed route with optional navigation parameters
    let redirectUrl = `/embed/${body.careflowId}?token=${sessionToken}`;

    if (body.trackId) {
      redirectUrl += `&track_id=${body.trackId}`;
    }

    if (body.activityId) {
      redirectUrl += `&activity_id=${body.activityId}`;
    }

    if (body.stakeholderId) {
      redirectUrl += `&stakeholder_id=${body.stakeholderId}`;
    }

    const response: CreateCareFlowSessionResponse = {
      success: true,
      careflowId: body.careflowId,
      patientId: body.stakeholderId!,
      sessionToken,
      redirectUrl,
      stakeholderId: body.stakeholderId!,
    };

    return NextResponse.json(response, {
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
