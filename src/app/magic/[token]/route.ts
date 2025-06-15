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
    sessionId,
    tenantId: tokenData.tenantId,
    patientId: tokenData.patientId,
    careflowId: tokenData.careflowId,
    orgId: tokenData.orgId,
    environment: tokenData.environment,
    expiresAt
  });
  
  // Generate JWT
  const jwt = await createJWT(sessionId);
  
  // Create response with HTML page
  const html = `
<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>Welcome - Awell Health</title>
  <style>
    body {
      font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', 'Roboto', sans-serif;
      margin: 0;
      padding: 20px;
      background-color: #f5f5f5;
      display: flex;
      justify-content: center;
      align-items: center;
      min-height: 100vh;
    }
    .container {
      background: white;
      padding: 2rem;
      border-radius: 8px;
      box-shadow: 0 2px 10px rgba(0, 0, 0, 0.1);
      max-width: 400px;
      text-align: center;
    }
    h1 {
      color: #333;
      margin-bottom: 1rem;
    }
    p {
      color: #666;
      line-height: 1.5;
    }
    .session-info {
      background: #f8f9fa;
      padding: 1rem;
      border-radius: 4px;
      margin-top: 1rem;
      font-size: 0.875rem;
      color: #495057;
    }
  </style>
</head>
<body>
  <div class="container">
    <h1>Hello, Patient! 👋</h1>
    <p>You have successfully authenticated via magic link.</p>
    <p>Your session is now active and you can begin your care journey.</p>
    <div class="session-info">
      <strong>Session Details:</strong><br>
      Patient ID: ${tokenData.patientId}<br>
      Careflow: ${tokenData.careflowId}<br>
      Session expires: ${expiresAt.toLocaleTimeString()}
    </div>
  </div>
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
    path: '/graphql'
  });
  
  return response;
}
