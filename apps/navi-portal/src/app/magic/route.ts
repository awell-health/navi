import { NextRequest, NextResponse } from "next/server";
import { decryptSessionToken } from "@/lib/auth/internal/session";
import { createJWT } from "@/lib/auth/external/jwt";
import { getBrandingByOrgId } from "@/lib/edge-config";
import {
  generateInlineThemeStyle,
  generateFaviconHTML,
} from "@/lib/branding/theme/generator";
import { generateWelcomePageHTML } from "@/components/welcome/welcome-page";
import { kv } from "@vercel/kv";

export const runtime = "edge";

function generateSessionId(): string {
  return crypto.randomUUID();
}

export async function GET(request: NextRequest) {
  const token = request.nextUrl.searchParams.get("token");
  if (!token) {
    return new NextResponse("No token provided", {
      status: 400,
      headers: { "Content-Type": "text/plain" },
    });
  }
  const expiresAt = new Date(Date.now() + 24 * 60 * 60 * 1000); // 24 hours

  // Decrypt the token using AES-GCM
  const tokenData = await decryptSessionToken(token);

  if (!tokenData) {
    return new NextResponse("Invalid token", {
      status: 400,
      headers: { "Content-Type": "text/plain" },
    });
  }

  // Check if token is expired (tokenData.exp is in seconds, Date.now() is in milliseconds)
  if (Math.floor(Date.now() / 1000) > tokenData.exp) {
    return new NextResponse("Token expired", {
      status: 400,
      headers: { "Content-Type": "text/plain" },
    });
  }

  // Generate session
  const sessionId = generateSessionId();
  // Store session in memory
  kv.set(`session:${sessionId}`, {
    ...tokenData,
    sessionId,
    expiresAt,
  });

  console.log("🔐 Session created:", {
    sessionId,
    careflowId: tokenData.careflowId,
    patientId: tokenData.patientId,
    tenantId: tokenData.tenantId,
    orgId: tokenData.orgId,
    environment: tokenData.environment,
  });

  // Fetch organization branding (with 20ms budget) with error handling
  let branding = null;
  let themeStyle = "<style>/* fallback */</style>";
  let faviconHTML = '<link rel="icon" href="/favicon-16x16.png">';
  let welcomePageHTML = "<div>Welcome to your care journey</div>";

  try {
    branding = await getBrandingByOrgId(tokenData.orgId);
  } catch (error) {
    console.warn("⚠️ Branding fetch failed, using defaults:", error);
  }

  // Generate JWT
  const jwt = await createJWT(tokenData);

  // Generate theme CSS inline with fallback
  try {
    themeStyle = generateInlineThemeStyle(branding);
  } catch (error) {
    console.warn("⚠️ Theme CSS generation failed, using fallback:", error);
  }

  // Generate favicon HTML with fallback
  try {
    faviconHTML = generateFaviconHTML(branding);
  } catch (error) {
    console.warn("⚠️ Favicon HTML generation failed, using fallback:", error);
  }

  // Generate welcome page HTML with fallback
  try {
    welcomePageHTML = generateWelcomePageHTML(branding);
  } catch (error) {
    console.warn("⚠️ Welcome page generation failed, using fallback:", error);
  }

  // Create themed portal HTML shell
  const html = `
<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>${branding?.welcomeTitle || "Awell Health Portal"}</title>
  
  <!-- Favicon -->
  ${faviconHTML}
  
  <!-- Google Fonts - non-blocking load -->
  <link rel="preconnect" href="https://fonts.googleapis.com">
  <link rel="preconnect" href="https://fonts.gstatic.com" crossorigin>
  <link href="https://fonts.googleapis.com/css2?family=Inter:wght@400;500;600;700&family=Poppins:wght@400;500;600;700&family=JetBrains+Mono:wght@400;500;600;700&display=swap" rel="stylesheet" media="print" onload="this.media='all'">
  <noscript><link href="https://fonts.googleapis.com/css2?family=Inter:wght@400;500;600;700&family=Poppins:wght@400;500;600;700&family=JetBrains+Mono:wght@400;500;600;700&display=swap" rel="stylesheet"></noscript>
  
  ${themeStyle}
  
  <style>
    * {
      margin: 0;
      padding: 0;
      box-sizing: border-box;
    }
    
    body {
      font-family: var(--font-body, -apple-system, BlinkMacSystemFont, 'Segoe UI', 'Roboto', sans-serif);
      font-size: var(--font-size-base, 1rem);
      line-height: var(--line-height-base, 1.5);
      background-color: var(--background, #f5f7fa);
      color: var(--foreground, #1f2937);
      min-height: 100vh;
      display: flex;
      flex-direction: column;
    }
    
    /* Portal Header */
    .portal-header {
      background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
      color: white;
      padding: 1rem 2rem;
      box-shadow: 0 2px 10px rgba(0, 0, 0, 0.1);
    }
    
    .header-content {
      max-width: 1200px;
      margin: 0 auto;
      display: flex;
      justify-content: space-between;
      align-items: center;
    }
    
    .logo {
      font-size: 1.5rem;
      font-weight: 600;
    }
    
    .patient-info {
      font-size: 0.875rem;
      opacity: 0.9;
    }
    
    /* Main Content Area */
    .portal-main {
      flex: 1;
      max-width: 1200px;
      margin: 0 auto;
      padding: 2rem;
      width: 100%;
    }
    
    /* Activity Container - Where dynamic components load */
    .activity-container {
      background: white;
      border-radius: 12px;
      box-shadow: 0 4px 20px rgba(0, 0, 0, 0.08);
      min-height: 400px;
      padding: 2rem;
      margin-bottom: 2rem;
    }
    
    .loading-state {
      display: flex;
      flex-direction: column;
      align-items: center;
      justify-content: center;
      min-height: 200px;
      color: #6b7280;
    }
    
    .loading-spinner {
      width: 40px;
      height: 40px;
      border: 3px solid #e5e7eb;
      border-top: 3px solid #667eea;
      border-radius: 50%;
      animation: spin 1s linear infinite;
      margin-bottom: 1rem;
    }
    
    @keyframes spin {
      0% { transform: rotate(0deg); }
      100% { transform: rotate(360deg); }
    }
    
    .error-state {
      background: #fef2f2;
      border: 1px solid #fecaca;
      border-radius: 8px;
      padding: 1rem;
      color: #dc2626;
      text-align: center;
    }
    
    .retry-button {
      background: #667eea;
      color: white;
      border: none;
      padding: 0.5rem 1rem;
      border-radius: 6px;
      cursor: pointer;
      margin-top: 0.5rem;
    }
    
    .retry-button:hover {
      background: #5a67d8;
    }
    
    /* Debug info (remove in production) */
    .debug-info {
      background: #f8f9fa;
      border: 1px solid #e9ecef;
      border-radius: 8px;
      padding: 1rem;
      font-size: 0.75rem;
      color: #6c757d;
      white-space: pre-wrap;
      font-family: monospace;
    }
    
    @media (max-width: 768px) {
      .portal-main {
        padding: 1rem;
      }
      
      .header-content {
        flex-direction: column;
        gap: 0.5rem;
        text-align: center;
      }
    }
  </style>
</head>
<body>
  <!-- Themed Welcome Page -->
  ${welcomePageHTML}
  
  <!-- Debug Info (remove in production) -->
  <details style="position: fixed; bottom: 1rem; right: 1rem; max-width: 300px;">
    <summary style="cursor: pointer; padding: 0.5rem; background: var(--muted); border-radius: 4px; font-size: 0.75rem;">
      🔍 Debug Information
    </summary>
    <div style="background: var(--card); border: 1px solid var(--border); border-radius: 8px; padding: 1rem; font-size: 0.75rem; color: var(--muted-foreground); white-space: pre-wrap; font-family: monospace; margin-top: 0.25rem;">
Session: ${sessionId}
Care flow ID: ${tokenData.careflowId}
Patient ID: ${tokenData.patientId}
Tenant ID: ${tokenData.tenantId}
Expires: ${expiresAt.toLocaleTimeString()}
Environment: ${tokenData.environment}
Org: ${tokenData.orgId}
Branding: ${branding ? "Custom" : "Default (Awell)"}
    </div>
  </details>

  <script>
    // Portal Application Logic
    class PortalApp {
      constructor() {
        this.retryCount = 0;
        this.maxRetries = 3;
        
        // Start the portal
        this.init();
      }
      
      async init() {
        console.log('🚀 Themed Portal initialized successfully!');
        console.log('🎨 Theme applied:', '${
          branding ? `Custom (${tokenData.orgId})` : "Default (Awell)"
        }');
      }
      
      async loadNextActivity() {
        try {
          console.log('🎯 Welcome page - Continue button clicked');
          console.log('🔄 Redirecting to careflow activities...');
          
          // Redirect to the careflow activities page
          const careflowId = '${tokenData.careflowId}';
          const stakeholderId = '${tokenData.patientId}';
          
          // Preserve instance_id parameter if it exists
          const urlParams = new URLSearchParams(window.location.search);
          const instanceId = urlParams.get('instance_id');
          
          let redirectUrl = \`/careflows/\${careflowId}/stakeholders/\${stakeholderId}\`;
          if (instanceId) {
            redirectUrl += \`?instance_id=\${instanceId}\`;
          }
          
          window.location.href = redirectUrl;
          
        } catch (error) {
          console.error('❌ Failed to redirect to activities:', error);
          this.showError(error.message);
        }
      }
      

      
      showError(message) {
        console.error('Portal Error:', message);
        // In the welcome page prototype, errors are just logged
        // In production, this would show proper error UI
      }
    }
    
    // Initialize the portal when page loads
    let portalApp;
    document.addEventListener('DOMContentLoaded', () => {
      portalApp = new PortalApp();
    });
  </script>
</body>
</html>`;

  const response = new NextResponse(html, {
    status: 200,
    headers: {
      "Content-Type": "text/html",
      "Referrer-Policy": "strict-origin",
    },
  });

  // Set cookies as per requirements
  response.cookies.set("awell.sid", sessionId, {
    httpOnly: true,
    sameSite: "lax",
    secure: process.env.NODE_ENV === "production",
    maxAge: 30 * 24 * 60 * 60, // 30 days
    path: "/",
  });

  response.cookies.set("awell.jwt", jwt, {
    httpOnly: true,
    sameSite: "lax",
    secure: process.env.NODE_ENV === "production",
    maxAge: 30 * 24 * 60 * 60, // 30 days
    path: "/api/graphql",
  });

  return response;
}
