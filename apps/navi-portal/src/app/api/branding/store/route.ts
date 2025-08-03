import { NextRequest, NextResponse } from "next/server";
import { BrandingService } from "@/lib/branding/branding-service";
import type { OrgBranding } from "@/lib/branding/types";

// Use edge runtime for faster response times
export const runtime = "edge";

// CORS headers for cross-origin requests
const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Methods": "GET, POST, DELETE, OPTIONS",
  "Access-Control-Allow-Headers": "Content-Type",
};

interface StoreBrandingRequest {
  orgId: string;
  branding: OrgBranding["branding"];
}

export async function POST(request: NextRequest) {
  console.log("🎨 Store Branding API: Request received");

  try {
    // Parse the request body
    const body: StoreBrandingRequest = await request.json();

    // Validate required fields
    if (!body.orgId) {
      console.error("❌ Store Branding API: Missing orgId");
      return NextResponse.json(
        { error: "Organization ID is required" },
        { status: 400, headers: corsHeaders }
      );
    }

    if (!body.branding) {
      console.error("❌ Store Branding API: Missing branding data");
      return NextResponse.json(
        { error: "Branding data is required" },
        { status: 400, headers: corsHeaders }
      );
    }

    console.log("🔍 Store Branding API: Storing branding for org:", body.orgId);

    // Initialize branding service and store the data
    const brandingService = new BrandingService();
    await brandingService.setBrandingForOrg(body.orgId, body.branding);

    console.log(
      "✅ Store Branding API: Successfully stored branding for:",
      body.orgId
    );

    // Return success response
    return NextResponse.json(
      {
        success: true,
        message: `Branding stored successfully for organization: ${body.orgId}`,
        orgId: body.orgId,
      },
      { status: 201, headers: corsHeaders }
    );
  } catch (error) {
    console.error("❌ Store Branding API: Error storing branding:", error);

    // Handle specific error types
    if (error instanceof SyntaxError) {
      return NextResponse.json(
        { error: "Invalid JSON in request body" },
        { status: 400, headers: corsHeaders }
      );
    }

    // Generic error response
    return NextResponse.json(
      {
        error: "Failed to store branding data",
        details: error instanceof Error ? error.message : "Unknown error",
      },
      { status: 500, headers: corsHeaders }
    );
  }
}

export async function GET(request: NextRequest) {
  console.log("🎨 Get Branding API: Request received");

  try {
    // Get org ID from query parameters
    const { searchParams } = new URL(request.url);
    const orgId = searchParams.get("orgId");

    if (!orgId) {
      console.error("❌ Get Branding API: Missing orgId parameter");
      return NextResponse.json(
        {
          error: "Organization ID is required as query parameter (?orgId=...)",
        },
        { status: 400, headers: corsHeaders }
      );
    }

    console.log("🔍 Get Branding API: Fetching branding for org:", orgId);

    // Initialize branding service and fetch the data
    const brandingService = new BrandingService();
    const { branding, hasCustomBranding } =
      await brandingService.getBrandingInfo(orgId);

    console.log(
      "✅ Get Branding API: Successfully retrieved branding for:",
      orgId,
      "Custom:",
      hasCustomBranding
    );

    // Return the branding data
    return NextResponse.json(
      {
        success: true,
        orgId,
        hasCustomBranding,
        branding,
      },
      { status: 200, headers: corsHeaders }
    );
  } catch (error) {
    console.error("❌ Get Branding API: Error fetching branding:", error);

    // Generic error response
    return NextResponse.json(
      {
        error: "Failed to fetch branding data",
        details: error instanceof Error ? error.message : "Unknown error",
      },
      { status: 500, headers: corsHeaders }
    );
  }
}

export async function PUT() {
  return NextResponse.json(
    { error: "Method not allowed. Use POST to store branding data." },
    { status: 405, headers: corsHeaders }
  );
}

export async function DELETE(request: NextRequest) {
  console.log("🗑️ Delete Branding API: Request received");

  try {
    // Get org ID from query parameters
    const { searchParams } = new URL(request.url);
    const orgId = searchParams.get("orgId");

    if (!orgId) {
      console.error("❌ Delete Branding API: Missing orgId parameter");
      return NextResponse.json(
        {
          error: "Organization ID is required as query parameter (?orgId=...)",
        },
        { status: 400, headers: corsHeaders }
      );
    }

    console.log("🔍 Delete Branding API: Deleting branding for org:", orgId);

    // Initialize branding service and delete the data
    const brandingService = new BrandingService();
    await brandingService.deleteBrandingForOrg(orgId);

    console.log(
      "✅ Delete Branding API: Successfully deleted branding for:",
      orgId
    );

    // Return success response
    return NextResponse.json(
      {
        success: true,
        message: `Branding deleted successfully for organization: ${orgId}`,
        orgId,
      },
      { status: 200, headers: corsHeaders }
    );
  } catch (error) {
    console.error("❌ Delete Branding API: Error deleting branding:", error);

    // Generic error response
    return NextResponse.json(
      {
        error: "Failed to delete branding data",
        details: error instanceof Error ? error.message : "Unknown error",
      },
      { status: 500, headers: corsHeaders }
    );
  }
}

// Handle preflight OPTIONS requests for CORS
export async function OPTIONS() {
  return new Response(null, {
    status: 200,
    headers: corsHeaders,
  });
}
