import { NextRequest, NextResponse } from "next/server";
import { createSessionToken } from "@/lib/auth/internal/session";
import { validatePublishableKey } from "@/lib/auth/publishable-keys";
import type {
  StartCareFlowRequest,
  StartCareFlowResponse,
} from "@awell-health/navi-core/src/types";

export const runtime = "edge";

export async function POST(request: NextRequest) {
  try {
    const body: StartCareFlowRequest = await request.json();

    // Validate required fields
    if (!body.publishableKey || !body.careflowDefinitionId) {
      return NextResponse.json(
        {
          success: false,
          error:
            "Missing required fields: publishableKey and careflowDefinitionId",
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

    console.log("🚀 Starting new care flow:", {
      careflowDefinitionId: body.careflowDefinitionId,
      hasPatientIdentifier: !!body.patientIdentifier,
      hasAwellPatientId: !!body.awellPatientId,
      stakeholderId: body.stakeholderId,
      orgId: keyValidation.orgId,
      tenantId: keyValidation.tenantId,
    });

    // TODO: Implement actual Awell API integration to start care flow

    // For now, create mock response until Awell integration is ready
    const mockCareflowId = `cf_${Date.now()}_${Math.random()
      .toString(36)
      .substr(2, 9)}`;
    const mockPatientId =
      body.awellPatientId ||
      `patient_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
    const stakeholderId = body.stakeholderId || mockPatientId;

    // Create session token for the new care flow
    const sessionTokenData = {
      patientId: mockPatientId,
      careflowId: mockCareflowId,
      stakeholderId: stakeholderId, // Include the stakeholder for activity filtering
      orgId: keyValidation.orgId,
      tenantId: keyValidation.tenantId,
      environment: keyValidation.environment,
      authenticationState: "unauthenticated" as const, // Anonymous request
      exp: Math.floor(Date.now() / 1000) + 15 * 60, // 15 minutes
    };

    const sessionToken = await createSessionToken(sessionTokenData);

    // Generate redirect URL for the embed route
    const redirectUrl = `/embed/start?token=${sessionToken}`;

    const response: StartCareFlowResponse = {
      success: true,
      careflowId: mockCareflowId,
      patientId: mockPatientId,
      sessionToken,
      redirectUrl,
      stakeholderId,
    };

    console.log("✅ Care flow started successfully:", {
      careflowId: mockCareflowId,
      patientId: mockPatientId,
      redirectUrl,
    });

    return NextResponse.json(response, {
      headers: {
        "Access-Control-Allow-Origin": "*",
        "Access-Control-Allow-Methods": "POST, OPTIONS",
        "Access-Control-Allow-Headers": "Content-Type, Authorization",
      },
    });
  } catch (error) {
    console.error("❌ Error starting care flow:", error);
    return NextResponse.json(
      {
        success: false,
        error: "Failed to start care flow",
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
