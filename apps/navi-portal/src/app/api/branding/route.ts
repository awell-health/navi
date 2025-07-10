import { NextResponse } from "next/server";
import { cookies } from "next/headers";
import { sessionStore } from "@/lib/session-store";
import { generateInlineThemeStyle } from "@/lib/branding/theme/generator";
import { awellDefaultBranding } from "@/lib/branding/defaults";
import { getBrandingByOrgId } from "@/lib/edge-config";

export async function GET() {
  console.log("🎨 Branding API endpoint called");

  try {
    // Get session from cookie
    const cookieStore = await cookies();
    const sessionCookie = cookieStore.get("awell.sid");

    let themeCSS = null;
    let orgId = "awell-dev";
    let hasCustomBranding = false;

    if (sessionCookie) {
      console.log("🔍 Looking up session:", sessionCookie.value);

      // Get session data
      const session = await sessionStore.get(sessionCookie.value);

      if (session) {
        console.log("✅ Session found, using branding for org:", session.orgId);
        const branding = await getBrandingByOrgId(session.orgId);
        themeCSS = generateInlineThemeStyle(branding);
        orgId = session.orgId;
        hasCustomBranding = !!branding;
      } else {
        console.log("⚠️  Session not found in store, using default branding");
      }
    } else {
      console.log("⚠️  No session cookie found, using default branding");
    }

    // If no custom branding, generate default theme CSS
    if (!themeCSS) {
      console.log("🎨 Generating default theme CSS from awellDefaultBranding");
      themeCSS = generateInlineThemeStyle(awellDefaultBranding.branding);
      hasCustomBranding = false;
      orgId = awellDefaultBranding.orgId;
    }

    // Return branding data
    const brandingData = {
      themeCSS,
      orgId,
      hasCustomBranding,
    };

    console.log("📤 Returning branding data:", {
      orgId,
      hasCustomBranding,
      cssLength: themeCSS?.length || 0,
    });

    return NextResponse.json(brandingData, {
      headers: {
        // Cache for 15 minutes (session duration)
        "Cache-Control": "private, max-age=900, stale-while-revalidate=60",
      },
    });
  } catch (error) {
    console.error("❌ Error in branding API:", error);

    // Even on error, return default branding
    const defaultThemeCSS = generateInlineThemeStyle(
      awellDefaultBranding.branding
    );

    return NextResponse.json(
      {
        themeCSS: defaultThemeCSS,
        orgId: awellDefaultBranding.orgId,
        hasCustomBranding: false,
      },
      {
        status: 200, // Return 200 with defaults instead of error
        headers: {
          "Cache-Control": "private, max-age=300", // Shorter cache on fallback
        },
      }
    );
  }
}

// Export the runtime configuration
export const runtime = "nodejs";
