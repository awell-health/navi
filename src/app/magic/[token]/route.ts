import { NextRequest, NextResponse } from 'next/server';
import { decryptToken, type SessionData } from '@/lib/token';
import { createJWT } from '@/lib/jwt';

// Export edge runtime config
export const runtime = 'edge';

// In-memory session storage (stub - in production would use Redis/DB)  
const sessions = new Map<string, SessionData>();

function generateSessionId(): string {
  return crypto.randomUUID();
}

export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ token: string }> }
) {
  const { token } = await params;
  
  // Decrypt the token using AES-GCM
  const tokenData = await decryptToken(token);
  
  if (!tokenData) {
    return new NextResponse('Invalid token', { 
      status: 400,
      headers: { 'Content-Type': 'text/plain' }
    });
  }
  
  // Check if token is expired
  if (Date.now() > tokenData.exp) {
    return new NextResponse('Token expired', { 
      status: 400,
      headers: { 'Content-Type': 'text/plain' }
    });
  }
  
  // Generate session
  const sessionId = generateSessionId();
  const expiresAt = new Date(Date.now() + (15 * 60 * 1000)); // 15 minutes
  
  // Store session in memory
  sessions.set(sessionId, {
    ...tokenData,
    sessionId,
    expiresAt
  });
  
  // Generate JWT
  const jwt = await createJWT(tokenData);
  
  // Create interactive portal HTML shell
  const html = `
<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>Awell Health Portal</title>
  <style>
    * {
      margin: 0;
      padding: 0;
      box-sizing: border-box;
    }
    
    body {
      font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', 'Roboto', sans-serif;
      background-color: #f5f7fa;
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
  <!-- Portal Header -->
  <header class="portal-header">
    <div class="header-content">
      <div class="logo">Awell Health</div>
      <div class="patient-info">
        Patient: ${tokenData.patientId} | Careflow: ${tokenData.careflowId}
      </div>
    </div>
  </header>

  <!-- Main Content -->
  <main class="portal-main">
    <!-- Activity Container - Dynamic components load here -->
    <div id="activity-container" class="activity-container">
      <div class="loading-state">
        <div class="loading-spinner"></div>
        <p>Loading your next activity...</p>
      </div>
    </div>
    
    <!-- Debug Info (remove in production) -->
    <details>
      <summary style="cursor: pointer; padding: 0.5rem; background: #f8f9fa; border-radius: 4px;">
        🔍 Debug Information
      </summary>
      <div class="debug-info" id="debug-info">
Session: ${sessionId}
Expires: ${expiresAt.toLocaleTimeString()}
Environment: ${tokenData.environment}
Org: ${tokenData.orgId}
      </div>
    </details>
  </main>

  <script>
    // Portal Application Logic
    class PortalApp {
      constructor() {
        this.activityContainer = document.getElementById('activity-container');
        this.debugInfo = document.getElementById('debug-info');
        this.retryCount = 0;
        this.maxRetries = 3;
        
        // Start the portal
        this.init();
      }
      
      async init() {
        console.log('🚀 Portal initializing...');
        await this.loadNextActivity();
      }
      
      async loadNextActivity() {
        try {
          console.log('📡 Fetching next activity...');
          
          const response = await fetch('/api/graphql', {
            method: 'POST',
            headers: {
              'Content-Type': 'application/json',
            },
            credentials: 'include', // Include JWT cookies
            body: JSON.stringify({
              query: \`
                query NextActivity {
                  nextActivity {
                    activityId
                    componentKey
                    componentProps
                  }
                }
              \`
            })
          });
          
          if (!response.ok) {
            throw new Error(\`GraphQL request failed: \${response.status}\`);
          }
          
          const data = await response.json();
          console.log('📦 Activity data received:', data);
          
          if (data.data?.nextActivity) {
            await this.renderActivity(data.data.nextActivity);
          } else if (data.error) {
            throw new Error(data.error);
          } else {
            throw new Error('No activity data received');
          }
          
        } catch (error) {
          console.error('❌ Failed to load activity:', error);
          this.showError(error.message);
        }
      }
      
      async renderActivity(activity) {
        const { activityId, componentKey, componentProps } = activity;
        
        console.log(\`🎯 Rendering activity: \${activityId} (component: \${componentKey})\`);
        
        try {
          // For POC, we'll render inline instead of dynamic import
          // TODO: Implement actual dynamic import from CDN
          const componentHtml = this.createActivityComponent(componentKey, componentProps);
          this.activityContainer.innerHTML = componentHtml;
          
          // Update debug info
          this.updateDebugInfo({
            activityId,
            componentKey,
            componentProps,
            loadedAt: new Date().toISOString()
          });
          
        } catch (error) {
          console.error('❌ Failed to render activity:', error);
          this.showError(\`Failed to render activity: \${error.message}\`);
        }
      }
      
      createActivityComponent(componentKey, props) {
        // Simple activity component renderer for POC
        // In production, this would be dynamic imports from CDN
        switch (componentKey) {
          case 'hello':
            return \`
              <div style="text-align: center; padding: 2rem;">
                <h2 style="color: #667eea; margin-bottom: 1rem;">👋 Welcome!</h2>
                <p style="font-size: 1.1rem; margin-bottom: 1.5rem; color: #374151;">
                  \${props.message || 'Welcome to your care journey!'}
                </p>
                <div style="background: #f0f9ff; padding: 1rem; border-radius: 8px; margin: 1rem 0;">
                  <strong>Your Care Context:</strong><br>
                  Careflow: \${props.careflowId || 'Unknown'}<br>
                  Organization: \${props.orgId || 'Unknown'}
                </div>
                <button onclick="portalApp.loadNextActivity()" 
                        style="background: #667eea; color: white; border: none; padding: 0.75rem 1.5rem; border-radius: 6px; cursor: pointer; font-size: 1rem;">
                  Continue Journey →
                </button>
              </div>
            \`;
          
          default:
            return \`
              <div style="text-align: center; padding: 2rem;">
                <h2>🔄 Unknown Activity</h2>
                <p>Component "\${componentKey}" not found</p>
                <button onclick="portalApp.loadNextActivity()" class="retry-button">
                  Try Again
                </button>
              </div>
            \`;
        }
      }
      
      showError(message) {
        this.activityContainer.innerHTML = \`
          <div class="error-state">
            <h3>⚠️ Unable to Load Activity</h3>
            <p>\${message}</p>
            <button onclick="portalApp.retry()" class="retry-button">
              Retry (\${this.maxRetries - this.retryCount} attempts left)
            </button>
          </div>
        \`;
      }
      
      async retry() {
        if (this.retryCount < this.maxRetries) {
          this.retryCount++;
          this.activityContainer.innerHTML = \`
            <div class="loading-state">
              <div class="loading-spinner"></div>
              <p>Retrying... (attempt \${this.retryCount})</p>
            </div>
          \`;
          
          // Wait a bit before retrying
          await new Promise(resolve => setTimeout(resolve, 1000));
          await this.loadNextActivity();
        } else {
          this.showError('Maximum retry attempts reached. Please refresh the page.');
        }
      }
      
      updateDebugInfo(data) {
        const existingContent = this.debugInfo.textContent;
        this.debugInfo.textContent = existingContent + '\\n\\nActivity Data:\\n' + JSON.stringify(data, null, 2);
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
      'Content-Type': 'text/html',
      'Referrer-Policy': 'strict-origin'
    }
  });
  
  // Set cookies as per requirements
  response.cookies.set('awell.sid', sessionId, {
    httpOnly: true,
    sameSite: 'lax',
    secure: process.env.NODE_ENV === 'production',
    maxAge: 15 * 60, // 15 minutes
    path: '/'
  });
  
  response.cookies.set('awell.jwt', jwt, {
    httpOnly: true,
    sameSite: 'lax',
    secure: process.env.NODE_ENV === 'production',
    maxAge: 15 * 60, // 15 minutes
    path: '/api/graphql'
  });
  
  return response;
}
