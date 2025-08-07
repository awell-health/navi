import { sessionStore } from "@/lib/session-store";
import { NextRequest, NextResponse } from "next/server";
import { getBrandingByOrgId } from "@/lib/edge-config";
import { generateInlineThemeStyle } from "@/lib/branding/theme/generator";
import { generateFaviconHTML } from "@/lib/branding/theme/generator";
import { AuthService, BrandingConfig } from "@awell-health/navi-core";
import { EmbedSessionData, ActiveSessionTokenData } from "@awell-health/navi-core";
import { cookies } from "next/headers";
import { redirect } from "next/navigation";
import { env } from "../../../env";

export default async function Page({
  params,
  searchParams,
}: {
  params: Promise<{ session_id: string }>;
  searchParams: Promise<{ branding: string; instance_id: string }>;
}) {
  
    const { session_id: sessionId } = await params;
    const brandingOverride = (await searchParams).branding;
    const instanceId = (await searchParams).instance_id;
    console.log("🔍 GET /embed/[session_id]", { sessionId, instanceId });

    // Check for existing session cookie (same-domain persistence)
    const existingSessionCookie = (await cookies()).get("awell.sid");
    if (existingSessionCookie && existingSessionCookie.value !== sessionId) {
      const existingSessionData = await sessionStore.get(
        existingSessionCookie.value
      );
      if (existingSessionData && "state" in existingSessionData) {
        // Validate existing session is not expired
        const now = Math.floor(Date.now() / 1000);
        if (existingSessionData.exp && existingSessionData.exp > now) {
          console.log(
            "🔄 Found valid existing session, checking org compatibility"
          );

          // Get new session to compare organizations
          const newSessionData = await sessionStore.get(sessionId);
          if (
            newSessionData &&
            "orgId" in newSessionData &&
            "orgId" in existingSessionData
          ) {
            if (existingSessionData.orgId === newSessionData.orgId) {
              console.log(
                "✅ Reusing existing session:",
                existingSessionCookie.value
              );
              await sessionStore.delete(sessionId);
              // Redirect to existing session instead
              return redirect(`/embed/${existingSessionCookie.value}`)
            } else {
              console.log(
                "⚠️ Existing session for different org, proceeding with new session"
              );
            }
          }
        } else {
          console.log(
            "⏰ Existing session expired, proceeding with new session"
          );
        }
      }
    }

    // Retrieve session data from KV store
    const sessionData = await sessionStore.get(sessionId);

    if (!sessionData) {
      console.error("❌ Session not found:", sessionId);
      return new NextResponse("Session not found", { status: 404 });
    }

    // Check if this is an EmbedSessionData or ActiveSessionTokenData (has state field)
    if (!("state" in sessionData)) {
      console.error("❌ Not an embed session:", sessionId);
      return new NextResponse("Invalid session type", { status: 400 });
    }

    const embedSession = sessionData as
      | EmbedSessionData
      | ActiveSessionTokenData;
    console.log("✅ Session retrieved:", {
      sessionId,
      state: embedSession.state,
    });

    // Check session state
    if (embedSession.state === "error") {
      console.error("❌ Session is in error state:", embedSession.errorMessage);
      return new NextResponse(
        `Session error: ${embedSession.errorMessage || "Unknown error"}`,
        { status: 400 }
      );
    }

    // Get organization branding
    let branding: BrandingConfig = {};
    try {
      branding = await getBrandingByOrgId(embedSession.orgId);
    } catch (error) {
      console.warn("⚠️ Branding fetch failed, using defaults:", error);
    }

    if (brandingOverride) {
      branding = {
        ...branding,
        ...JSON.parse(brandingOverride),
      };
    }

    // Generate JWT for the session
    const authService = new AuthService();
    await authService.initialize(env.JWT_SIGNING_KEY);

    // Convert to SessionTokenData format for JWT creation
    const sessionTokenData = {
      patientId: embedSession.patientId,
      careflowId: embedSession.careflowId,
      stakeholderId: embedSession.stakeholderId,
      orgId: embedSession.orgId,
      tenantId: embedSession.tenantId,
      environment: embedSession.environment,
      authenticationState: embedSession.authenticationState,
      exp: embedSession.exp,
    };

    const jwt = await authService.createJWTFromSession(
      sessionTokenData,
      sessionId,
      env.JWT_KEY_ID
    );

    // Generate theme and favicon
    const themeStyle = generateInlineThemeStyle(branding as BrandingConfig);
    const faviconHTML = generateFaviconHTML(branding as BrandingConfig);

    // Determine if this is a new careflow or existing careflow
    const isNewCareflow =
      !embedSession.careflowId && embedSession.careflowDefinitionId;
    const isActiveCareflow =
      embedSession.state === "active" && embedSession.careflowId;

    let html: string;

    // if (isNewCareflow) {
    //   // New careflow creation flow
    //   html = renderNewCareflowPage({
    //     sessionData: embedSession,
    //     sessionId,
    //     branding: branding,
    //     themeStyle,
    //     faviconHTML,
    //     instanceId,
    //   });
    // } else if (isActiveCareflow) {
    //   // Active careflow (redirect to existing careflow activities)
    //   html = renderActiveCareflowPage({
    //     sessionData: embedSession as ActiveSessionTokenData,
    //     sessionId,
    //     branding: branding,
    //     themeStyle,
    //     faviconHTML,
    //     instanceId,
    //   });
    // } else {
    //   // Session in created state - show loading/preparation
    //   html = renderPreparationPage({
    //     sessionData: embedSession,
    //     sessionId,
    //     branding: branding,
    //     themeStyle,
    //     faviconHTML,
    //     instanceId,
    //   });
    // }

    // const response = new NextResponse(html, {
    //   status: 200,
    //   headers: {
    //     "Content-Type": "text/html",
    //     "Referrer-Policy": "strict-origin-when-cross-origin",
    //     "Cache-Control": "no-store",
    //     "Content-Security-Policy": "frame-ancestors *",
    //   },
    // });

    // Set cookies
    // (await cookies()).set("awell.sid", sessionId, {
    //   httpOnly: true,
    //   sameSite: process.env.NODE_ENV === "production" ? "none" : "lax",
    //   secure: process.env.NODE_ENV === "production",
    //   maxAge: 30 * 24 * 60 * 60, // 30 days
    //   path: "/",
    // });

    // (await cookies()).set("awell.jwt", jwt, {
    //   httpOnly: true,
    //   sameSite: process.env.NODE_ENV === "production" ? "none" : "lax",
    //   secure: process.env.NODE_ENV === "production",
    //   maxAge: 30 * 24 * 60 * 60, // 30 days
    //   path: "/",
    // });



    return <div>Hello World {sessionId}</div>
}