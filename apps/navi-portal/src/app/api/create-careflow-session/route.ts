import { NextRequest, NextResponse } from "next/server";
import { validatePublishableKey } from "@/lib/auth/publishable-keys";
import { getBrandingByOrgId } from "@/lib/edge-config";
import { sessionStore } from "@/lib/session-store";
import type {
  BrandingConfig,
  CreateCareFlowSessionRequest,
  CreateCareFlowSessionResponse,
  EmbedSessionData,
} from "@awell-health/navi-core";

export const runtime = "edge";

// Helper function to get branding configuration
async function getBranding(orgId: string, branding?: BrandingConfig) {
  try {
    const storedBranding = await getBrandingByOrgId(orgId);
    return {
      ...storedBranding,
      ...branding,
    };
  } catch (error) {
    console.warn("⚠️ Branding fetch failed, using defaults:", error);
    return branding ?? {};
  }
}

/**
 * This API is used to create a careflow session.
 * It is called by the HOST SITE (using navi.js script) when a user clicks on a careflow in the portal.
 */
export async function POST(request: NextRequest) {
  try {
    const body: CreateCareFlowSessionRequest = await request.json();
    console.log("🔍 POST /api/create-careflow-session", body);

    // Always validate the publishable key first for security
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

    // Note: Session persistence handled in iframe route (/embed/[session_id])
    // where cookies exist on the correct domain. This API runs cross-origin
    // and cannot access iframe cookies due to browser security policies.

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

    const branding = await getBranding(keyValidation.orgId, body.branding);

    if (body.sessionId) {
      return NextResponse.json(
        {
          success: true,
          embedUrl: `/embed/${body.sessionId}`,
          branding,
        },
        {
          headers: {
            "Access-Control-Allow-Origin": "*",
            "Access-Control-Allow-Methods": "POST, OPTIONS",
            "Access-Control-Allow-Headers": "Content-Type, Authorization",
          },
        }
      );
    }

    // Generate session ID
    const sessionId = crypto.randomUUID();

    // Create embed session data (supports both existing and new careflows)
    const embedSessionData: EmbedSessionData = {
      sessionId,
      patientId: body.awellPatientId, // May be undefined
      careflowId: body.careflowId, // May be undefined for new careflows
      careflowDefinitionId: body.careflowDefinitionId, // May be undefined for existing careflows
      orgId: keyValidation.orgId,
      tenantId: keyValidation.tenantId,
      environment: keyValidation.environment,
      authenticationState: "unauthenticated" as const,
      exp: Math.floor(Date.now() / 1000) + 30 * 24 * 60 * 60, // 30 days in seconds
      state: "created" as const,
      // Include additional fields for new careflow creation
      patientIdentifier: body.patientIdentifier,
      track_id: body.trackId,
      activity_id: body.activityId,
      stakeholder_id: body.stakeholderId, // If undefined, default to patient.
    };

    // Store the session data in KV
    await sessionStore.set(sessionId, embedSessionData);

    // Generate embedUrl using session-based approach
    const embedUrl = `/embed/${sessionId}`;

    const response: CreateCareFlowSessionResponse = {
      success: true,
      embedUrl,
      branding,
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
