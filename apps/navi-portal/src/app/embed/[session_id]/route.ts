import { NextRequest, NextResponse } from "next/server";
import { getSession, deleteSession } from "@/domains/session/store";
import {
  EmbedSessionData,
  ActiveSessionTokenData,
  AuthService,
} from "@awell-health/navi-core";
import { getBrandingByOrgId } from "@/lib/edge-config";
import {
  generateInlineThemeStyle,
  generateFaviconHTML,
} from "@/lib/branding/theme/generator";
import { renderGoogleFontLinks } from "./fonts";
import { env } from "@/env";
import { BrandingConfig } from "@awell-health/navi-core";

export const runtime = "edge";

export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ session_id: string }> }
) {
  try {
    const { session_id: sessionId } = await params;
    const brandingOverride = request.nextUrl.searchParams.get("branding");
    const instanceId = request.nextUrl.searchParams.get("instance_id");
    console.debug("🔍 GET /embed/[session_id]", { sessionId, instanceId });

    // Check for existing session cookie (same-domain persistence)
    const existingSessionCookie = request.cookies.get("awell.sid");
    if (existingSessionCookie && existingSessionCookie.value !== sessionId) {
      const existingSessionData = await getSession(existingSessionCookie.value);
      if (existingSessionData && "state" in existingSessionData) {
        // Validate existing session is not expired
        const now = Math.floor(Date.now() / 1000);
        if (existingSessionData.exp && existingSessionData.exp > now) {
          console.log(
            "🔄 Found valid existing session, checking org compatibility"
          );

          // Get new session to compare organizations
          const newSessionData = await getSession(sessionId);
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
              await deleteSession(sessionId);
              // Redirect to existing session instead
              const url = new URL(request.url);
              url.pathname = `/embed/${existingSessionCookie.value}`;

              // Ensure we maintain the correct hostname for mobile devices
              const host = request.headers.get("host");
              if (host) {
                url.host = host;
              }

              return NextResponse.redirect(url, 302);
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
    const sessionData = await getSession(sessionId);

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

    if (isNewCareflow) {
      // New careflow creation flow
      html = renderNewCareflowPage({
        sessionData: embedSession,
        sessionId,
        branding: branding,
        themeStyle,
        faviconHTML,
        instanceId,
      });
    } else if (isActiveCareflow) {
      // Active careflow (redirect to existing careflow activities)
      html = renderActiveCareflowPage({
        sessionData: embedSession as ActiveSessionTokenData,
        sessionId,
        branding: branding,
        themeStyle,
        faviconHTML,
        instanceId,
      });
    } else {
      // Session in created state - show loading/preparation
      html = renderPreparationPage({
        sessionData: embedSession,
        sessionId,
        branding: branding,
        themeStyle,
        faviconHTML,
        instanceId,
      });
    }

    const response = new NextResponse(html, {
      status: 200,
      headers: {
        "Content-Type": "text/html",
        "Referrer-Policy": "strict-origin-when-cross-origin",
        "Cache-Control": "no-store",
        "Content-Security-Policy": "frame-ancestors *",
      },
    });

    // Set cookies
    response.cookies.set("awell.sid", sessionId, {
      httpOnly: true,
      sameSite: process.env.NODE_ENV === "production" ? "none" : "lax",
      secure: process.env.NODE_ENV === "production",
      maxAge: 30 * 24 * 60 * 60, // 30 days
      path: "/",
    });

    response.cookies.set("awell.jwt", jwt, {
      httpOnly: true,
      sameSite: process.env.NODE_ENV === "production" ? "none" : "lax",
      secure: process.env.NODE_ENV === "production",
      maxAge: 30 * 24 * 60 * 60, // 30 days
      path: "/",
    });

    return response;
  } catch (error) {
    console.error("❌ Error in /embed/[session_id]:", error);
    return new NextResponse("Internal server error", { status: 500 });
  }
}

// Common styles used by all pages
function renderCommonStyles() {
  return `<link rel="stylesheet" href="/scripts/embed-styles.css">`;
}

// Page for new careflow creation (session in created state with careflowDefinitionId)
function renderNewCareflowPage({
  sessionData,
  sessionId,
  branding,
  themeStyle,
  faviconHTML,
  instanceId,
}: {
  sessionData: EmbedSessionData;
  sessionId: string;
  branding: BrandingConfig;
  themeStyle: string;
  faviconHTML: string;
  instanceId: string | null;
}) {
  return `<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>${branding?.welcomeTitle || "Start Your Care Journey"}</title>
  
  <!-- Favicon -->
  ${faviconHTML}
  
  ${renderGoogleFontLinks(branding)}
  
  ${themeStyle}
  ${renderCommonStyles()}
</head>
<body>
  ${renderNewCareflowBody(branding)}
  ${renderNewCareflowScript(sessionData, sessionId, instanceId)}
</body>
</html>`;
}

// Page for active careflow (session in active state)
function renderActiveCareflowPage({
  sessionData,
  sessionId,
  branding,
  themeStyle,
  faviconHTML,
  instanceId,
}: {
  sessionData: ActiveSessionTokenData;
  sessionId: string;
  branding: BrandingConfig;
  themeStyle: string;
  faviconHTML: string;
  instanceId: string | null;
}) {
  return `<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>${branding?.welcomeTitle || "Continue Your Care Journey"}</title>
  
  <!-- Favicon -->
  ${faviconHTML}
  
  ${renderGoogleFontLinks(branding)}
  

  ${themeStyle}
  ${renderCommonStyles()}
</head>
<body>
  ${renderActiveCareflowBody(branding)}
  ${renderActiveCareflowScript(sessionData, sessionId, instanceId)}
</body>
</html>`;
}

// Page for preparation state (session created but not yet active)
function renderPreparationPage({
  sessionData,
  sessionId,
  branding,
  themeStyle,
  faviconHTML,
  instanceId,
}: {
  sessionData: EmbedSessionData;
  sessionId: string;
  branding: BrandingConfig;
  themeStyle: string;
  faviconHTML: string;
  instanceId: string | null;
}) {
  return `<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>${branding?.welcomeTitle || "Preparing Your Care Journey"}</title>
  
  <!-- Favicon -->
  ${faviconHTML}
  
  ${renderGoogleFontLinks(branding)}
  
  ${themeStyle}
  ${renderCommonStyles()}
</head>
<body>
  ${renderPreparationBody(branding)}
  ${renderPreparationScript(sessionData, sessionId, instanceId)}
</body>
</html>`;
}

// Body for new careflow creation
function renderNewCareflowBody(branding: BrandingConfig) {
  return `<div class="embed-container">
    <div class="activity-container">
      <div class="welcome-message">
        <h1 class="welcome-title">${
          branding?.welcomeTitle || "Welcome to Your Care Journey"
        }</h1>
        <p class="welcome-subtitle">We're preparing your personalized care activities</p>
      </div>
      
      <div id="welcome-state" class="welcome-message">
        <button id="start-button" class="action-button">Start Your Care Journey</button>
      </div>
      
      <div id="loading-state" class="loading-state" style="display: none;">
        <div class="loading-spinner"></div>
        <p id="loading-message">Starting your care journey...</p>
        <div id="progress-bar" style="width: 200px; height: 4px; background: #e5e7eb; border-radius: 2px; margin-top: 1rem; overflow: hidden;">
          <div id="progress-fill" style="width: 0%; height: 100%; background: var(--primary, #667eea); border-radius: 2px; transition: width 0.3s ease;"></div>
        </div>
        <p id="progress-text" style="font-size: 0.75rem; color: var(--muted-foreground, #6b7280); margin-top: 0.5rem;">0%</p>
      </div>
      
      <div id="error-state" class="error-state" style="display: none;">
        <p>Unable to load your care activities. Please try again.</p>
        <button onclick="location.reload()" class="action-button" style="margin-top: 0.5rem;">Retry</button>
      </div>
    </div>
  </div>`;
}

// Body for active careflow
function renderActiveCareflowBody(branding: BrandingConfig) {
  return `<div class="embed-container">
    <div class="activity-container" style="margin: auto;">
      <div class="welcome-message">
        <h1 class="welcome-title">${
          branding?.welcomeTitle || "Welcome Back"
        }</h1>
        <p class="welcome-subtitle">Resuming your care journey</p>
      </div>
      
      <div id="welcome-state" class="welcome-message">
        <button id="continue-button" class="action-button">Continue</button>
      </div>
      
      <div id="loading-state" class="loading-state" style="display: none;">
        <p id="loading-message">Connecting to your care flow...</p>
        <div id="progress-bar" style="width: 200px; height: 4px; background: #e5e7eb; border-radius: 2px; margin-top: 1rem; overflow: hidden;">
          <div id="progress-fill" style="width: 0%; height: 100%; background: var(--primary, #667eea); border-radius: 2px; transition: width 0.3s ease;"></div>
        </div>
        <p id="progress-text" style="font-size: 0.75rem; color: var(--muted-foreground, #6b7280); margin-top: 0.5rem;">0%</p>
      </div>
      
      <div id="error-state" class="error-state" style="display: none;">
        <p>Unable to load your care activities. Please try again.</p>
        <button onclick="location.reload()" class="action-button" style="margin-top: 0.5rem;">Retry</button>
      </div>
    </div>
  </div>`;
}

// Body for preparation state
function renderPreparationBody(branding: BrandingConfig) {
  return `<div class="embed-container">
    <div class="activity-container">
      <div class="welcome-message">
        <h1 class="welcome-title">${
          branding?.welcomeTitle || "Preparing Your Care Journey"
        }</h1>
        <p class="welcome-subtitle">We're setting up your personalized experience</p>
      </div>
      
      <div id="preparation-state" class="loading-state">
        <div class="loading-spinner"></div>
        <p id="loading-message">Preparing your care flow...</p>
        <div id="progress-bar" style="width: 200px; height: 4px; background: #e5e7eb; border-radius: 2px; margin-top: 1rem; overflow: hidden;">
          <div id="progress-fill" style="width: 0%; height: 100%; background: var(--primary, #667eea); border-radius: 2px; transition: width 0.3s ease;"></div>
        </div>
        <p id="progress-text" style="font-size: 0.75rem; color: var(--muted-foreground, #6b7280); margin-top: 0.5rem; text-align: center;">0%</p>
      </div>
      
      <div id="error-state" class="error-state" style="display: none;">
        <p>Unable to prepare your care activities. Please try again.</p>
        <button onclick="location.reload()" class="action-button" style="margin-top: 0.5rem;">Retry</button>
      </div>
    </div>
  </div>`;
}

// Script for new careflow creation (with SSE logic)
function renderNewCareflowScript(
  sessionData: EmbedSessionData,
  sessionId: string,
  instanceId: string | null
) {
  return `<!-- Embed Configuration -->
  <script>
    window.embedConfig = {
      careflowDefinitionId: '${sessionData.careflowDefinitionId}',
      sessionId: '${sessionId}',
      patientIdentifier: ${JSON.stringify(
        sessionData.patientIdentifier || null
      )},
      stakeholderId: '${sessionData.stakeholder_id || ""}',
      mode: 'new-careflow',
      instanceId: '${instanceId}',
      environment: '${sessionData.environment}'
    };
  </script>
  
  <!-- External Embed Script -->
  <script src="/scripts/new-careflow-embed.js"></script>`;
}

// Script for active careflow
function renderActiveCareflowScript(
  sessionData: ActiveSessionTokenData,
  sessionId: string,
  instanceId: string | null
) {
  return `<!-- Embed Configuration -->
  <script>
    window.embedConfig = {
      careflowId: '${sessionData.careflowId}',
      sessionId: '${sessionId}',
      trackId: '${sessionData.track_id || ""}',
      activityId: '${sessionData.activity_id || ""}',
      stakeholderId: '${sessionData.stakeholderId}',
      patientId: '${sessionData.patientId}',
      instanceId: '${instanceId}',
      mode: 'active-careflow',
      environment: '${sessionData.environment}'
    };
  </script>
  
  <!-- External Embed Script -->
  <script src="/scripts/existing-careflow-embed.js"></script>`;
}

// Script for preparation state (with SSE monitoring)
function renderPreparationScript(
  sessionData: EmbedSessionData,
  sessionId: string,
  instanceId: string | null
) {
  return `<!-- Embed Configuration -->
  <script>
    window.embedConfig = {
      sessionId: '${sessionId}',
      instanceId: '${instanceId}',
      mode: 'preparation',
      environment: '${sessionData.environment}'
    };
    
    // Monitor session state changes via SSE
    const eventSource = new EventSource('/api/careflow-status?session_id=' + '${sessionId}&instance_id=' + '${instanceId}');
    
    eventSource.onmessage = function(event) {
      const data = JSON.parse(event.data);
      console.log('Session update:', data);
      
      if (data.type === 'ready') {
        // Redirect to the same session URL to reload with active state
        window.location.reload();
      } else if (data.type === 'error') {
        document.getElementById('preparation-state').style.display = 'none';
        document.getElementById('error-state').style.display = 'block';
      } else if (data.type === 'progress') {
        const progressFill = document.getElementById('progress-fill');
        const progressText = document.getElementById('progress-text');
        const loadingMessage = document.getElementById('loading-message');
        
        if (progressFill) progressFill.style.width = data.progress + '%';
        if (progressText) progressText.textContent = data.progress + '%';
        if (loadingMessage) loadingMessage.textContent = data.message || 'Preparing...';
      }
    };
    
    eventSource.onerror = function(error) {
      console.error('SSE error:', error);
      document.getElementById('preparation-state').style.display = 'none';
      document.getElementById('error-state').style.display = 'block';
    };
  </script>`;
}
