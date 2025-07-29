import { NextRequest, NextResponse } from "next/server";
import { decryptSessionToken } from "@/lib/auth/internal/session";
import { AuthService } from "@awell-health/navi-core";
import { getBrandingByOrgId } from "@/lib/edge-config";
import {
  generateInlineThemeStyle,
  generateFaviconHTML,
} from "@/lib/branding/theme/generator";
import { kv } from "@vercel/kv";
import { env } from "@/env";

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

  // Check if token is expired
  if (Math.floor(Date.now() / 1000) > tokenData.exp) {
    return new NextResponse("Token expired", {
      status: 400,
      headers: { "Content-Type": "text/plain" },
    });
  }

  // Generate session
  const sessionId = generateSessionId();
  // Store session in KV store
  await kv.set(`session:${sessionId}`, {
    ...tokenData,
    sessionId,
    expiresAt,
  });

  console.log("🔐 New care flow session created:", {
    sessionId,
    careflowId: tokenData.careflowId,
    patientId: tokenData.patientId,
    tenantId: tokenData.tenantId,
    orgId: tokenData.orgId,
    environment: tokenData.environment,
  });

  // Fetch organization branding with error handling
  let branding = null;
  let themeStyle = "<style>/* fallback */</style>";
  let faviconHTML = '<link rel="icon" href="/favicon-16x16.png">';

  try {
    branding = await getBrandingByOrgId(tokenData.orgId);
  } catch (error) {
    console.warn("⚠️ Branding fetch failed, using defaults:", error);
  }
  const suppliedBranding = request.nextUrl.searchParams.get("branding");
  if (suppliedBranding) {
    branding = { ...branding, ...JSON.parse(suppliedBranding) };
  }

  // Generate JWT for API authentication using AuthService
  const authService = new AuthService();
  await authService.initialize(env.JWT_SIGNING_KEY);
  const jwt = await authService.createJWTFromSession(
    tokenData,
    sessionId,
    env.JWT_KEY_ID
  );

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

  // Create lightweight embed portal HTML
  const html = `
<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>${branding?.welcomeTitle || "Starting Your Care Journey"}</title>
  
  <!-- Favicon -->
  ${faviconHTML}
  
  <!-- Google Fonts - non-blocking load -->
  <link rel="preconnect" href="https://fonts.googleapis.com">
  <link rel="preconnect" href="https://fonts.gstatic.com" crossorigin>
  <link href="https://fonts.googleapis.com/css2?family=Inter:wght@400;500;600;700&family=Poppins:wght@400;500;600;700&display=swap" rel="stylesheet" media="print" onload="this.media='all'">
  <noscript><link href="https://fonts.googleapis.com/css2?family=Inter:wght@400;500;600;700&family=Poppins:wght@400;500;600;700&display=swap" rel="stylesheet"></noscript>
  
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
    
    .embed-container {
      flex: 1;
      display: flex;
      flex-direction: column;
      padding: 1rem;
      max-width: 100%;
    }
    
    .activity-container {
      background: var(--background, #FFF);
      border-radius: 12px;
      box-shadow: 0 4px 20px rgba(0, 0, 0, 0.08);
      min-height: 400px;
      padding: 2rem;
      margin: 0 auto;
      width: 100%;
      max-width: 800px;
      display: flex;
      flex-direction: column;
      align-items: center;
      justify-content: center;
    }
    
    .loading-state {
      display: flex;
      flex-direction: column;
      align-items: center;
      justify-content: center;
      min-height: 200px;
      color: var(--onSurface, #6b7280);
    }
    
    .loading-spinner {
      width: 40px;
      height: 40px;
      border: 3px solid #e5e7eb;
      border-top: 3px solid var(--primary, #667eea);
      border-radius: 50%;
      animation: spin 1s linear infinite;
      margin-bottom: 1rem;
    }
    
    @keyframes spin {
      0% { transform: rotate(0deg); }
      100% { transform: rotate(360deg); }
    }
    
    .welcome-message {
      text-align: center;
      margin-bottom: 2rem;
    }
    
    .welcome-title {
      font-size: 1.5rem;
      font-weight: 600;
      color: var(--foreground, #1f2937);
      margin-bottom: 0.5rem;
    }
    
    .welcome-subtitle {
      color: var(--muted-foreground, #6b7280);
      font-size: 1rem;
    }
    
    .start-button {
      background: var(--primary, #667eea);
      color: var(--onPrimary, #FFF);
      border: none;
      padding: 0.75rem 2rem;
      border-radius: 8px;
      font-size: 1rem;
      font-weight: 500;
      cursor: pointer;
      transition: background-color 0.2s;
    }
    
    .start-button:hover {
      background: var(--primary-dark, #5a67d8);
    }
    
    .start-button:disabled {
      opacity: 0.6;
      cursor: not-allowed;
    }
    
    .error-state {
      background: #fef2f2;
      border: 1px solid #fecaca;
      border-radius: 8px;
      padding: 1rem;
      color: var(--error, #dc2626);
      text-align: center;
    }
    
    @media (max-width: 768px) {
      .embed-container {
        padding: 0.5rem;
      }
      
      .activity-container {
        padding: 1rem;
        border-radius: 8px;
      }
    }
  </style>
</head>
<body>
  <div class="embed-container">
    <div class="activity-container">
      <div class="welcome-message">
        <h1 class="welcome-title">${
          branding?.welcomeTitle || "Welcome to Your Care Journey"
        }</h1>
        <p class="welcome-subtitle">We're preparing your personalized care activities</p>
      </div>
      
      <div id="welcome-state" class="welcome-message">
        <button id="start-button" class="start-button">Start Your Care Journey</button>
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
        <button onclick="location.reload()" class="start-button" style="margin-top: 0.5rem;">Retry</button>
      </div>
    </div>
  </div>

  <script>
    // Lightweight embed portal application with SSE
    class EmbedApp {
      constructor() {
        this.retryCount = 0;
        this.maxRetries = 3;
        this.eventSource = null;
        this.init();
      }
      
      async init() {
        console.log('🚀 New care flow embed initialized');
        
        // Set up button click handler
        const startButton = document.getElementById('start-button');
        if (startButton) {
          startButton.addEventListener('click', () => {
            this.startCareFlow();
          });
        }
      }
      
      startCareFlow() {
        console.log('🎯 Starting care flow...');
        
        // Hide welcome state, show loading state
        const welcomeState = document.getElementById('welcome-state');
        const loadingState = document.getElementById('loading-state');
        
        if (welcomeState) welcomeState.style.display = 'none';
        if (loadingState) loadingState.style.display = 'flex';
        
        // Start SSE connection for real-time progress
        this.connectSSE();
      }
      
      connectSSE() {
        const careflowId = '${tokenData.careflowId}';
        const sessionId = '${sessionId}';
        
        // Include instance_id in SSE URL if available
        const currentUrlParams = new URLSearchParams(window.location.search);
        const instanceId = currentUrlParams.get('instance_id');
        
        let sseUrl = \`/api/careflow-status?careflow_id=\${careflowId}&session_id=\${sessionId}\`;
        if (instanceId) {
          sseUrl += \`&instance_id=\${instanceId}\`;
        }
        
        console.log('📡 Connecting to SSE for new care flow:', sseUrl);
        
        this.eventSource = new EventSource(sseUrl);
        
        this.eventSource.onmessage = (event) => {
          try {
            const data = JSON.parse(event.data);
            console.log('📨 SSE message:', data);
            
            switch (data.type) {
              case 'connection':
                this.updateLoadingMessage('Connected! Setting up your care journey...');
                break;
                
              case 'progress':
                this.updateProgress(data.progress, data.message);
                break;
                
              case 'ready':
                this.onCareFlowReady(data.redirectUrl);
                break;
                
              default:
                console.log('📝 Unknown SSE message type:', data.type);
            }
          } catch (error) {
            console.error('❌ Error parsing SSE message:', error);
          }
        };
        
        this.eventSource.onerror = (error) => {
          console.error('❌ SSE connection error:', error);
          this.eventSource.close();
          
          // Fallback to timeout-based loading
          setTimeout(() => {
            this.showStartButton();
          }, 1500);
        };
      }
      
      updateLoadingMessage(message) {
        const loadingMessage = document.getElementById('loading-message');
        if (loadingMessage) {
          loadingMessage.textContent = message;
        }
      }
      
      updateProgress(progress, message) {
        const progressFill = document.getElementById('progress-fill');
        const progressText = document.getElementById('progress-text');
        const loadingMessage = document.getElementById('loading-message');
        
        if (progressFill) {
          progressFill.style.width = \`\${progress}%\`;
        }
        
        if (progressText) {
          progressText.textContent = \`\${progress}%\`;
        }
        
        if (loadingMessage && message) {
          loadingMessage.textContent = message;
        }
      }
      
      onCareFlowReady(redirectUrl) {
        console.log('✅ New care flow ready, redirecting to:', redirectUrl);
        
        if (this.eventSource) {
          this.eventSource.close();
        }
        
        // Show 100% completion briefly before redirect
        this.updateProgress(100, 'Complete! Redirecting to your care journey...');
        
        setTimeout(() => {
          // Preserve instance_id parameter when redirecting
          const currentUrlParams = new URLSearchParams(window.location.search);
          const instanceId = currentUrlParams.get('instance_id');
          
          let finalRedirectUrl = redirectUrl;
          if (instanceId) {
            const separator = redirectUrl.includes('?') ? '&' : '?';
            finalRedirectUrl += \`\${separator}instance_id=\${instanceId}\`;
          }
          
          console.log('🔄 Redirecting to care flow with instanceId preserved:', finalRedirectUrl);
          window.location.href = finalRedirectUrl;
        }, 800);
      }
      
      showStartButton() {
        document.getElementById('loading-state').style.display = 'none';
        document.getElementById('welcome-state').style.display = 'block';
        
        document.getElementById('start-button').addEventListener('click', () => {
          this.startCareFlow();
        });
      }
      
      async startCareFlow() {
        console.log('🎯 Starting care flow activities');
        
        try {
          // Disable button to prevent double-clicks
          const button = document.getElementById('start-button');
          button.disabled = true;
          button.textContent = 'Loading...';
          
          // Navigate to care flow activities
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
          console.error('❌ Failed to start care flow:', error);
          this.showError();
        }
      }
      
      showError() {
        document.getElementById('loading-state').style.display = 'none';
        document.getElementById('welcome-state').style.display = 'none';
        document.getElementById('error-state').style.display = 'block';
      }
    }
    
    // Initialize when page loads
    let embedApp;
    document.addEventListener('DOMContentLoaded', () => {
      embedApp = new EmbedApp();
    });
  </script>
</body>
</html>`;

  const response = new NextResponse(html, {
    status: 200,
    headers: {
      "Content-Type": "text/html",
      "Referrer-Policy": "strict-origin",
      "Cache-Control": "no-store", // Don't cache embed pages
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
