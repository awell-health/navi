import { NextRequest, NextResponse } from 'next/server';
import { verifyJWT } from '@/lib/jwt';

// Use Node.js runtime for WebSocket support
export const runtime = 'nodejs';

// Simple GraphQL-over-HTTP endpoint for POC
// TODO: Upgrade to proper WebSocket implementation for subscriptions
export async function POST(request: NextRequest) {
  try {
    // Extract JWT from cookie
    const jwtCookie = request.cookies.get('awell.jwt');
    if (!jwtCookie) {
      return NextResponse.json({ error: 'No JWT found' }, { status: 401 });
    }
    
    console.log('✅ JWT cookie found:', jwtCookie.value.substring(0, 50) + '...');

    // Verify JWT
    const payload = await verifyJWT(jwtCookie.value);
    if (!payload) {
      console.log('🔍 Invalid JWT');
      return NextResponse.json({ error: 'Invalid JWT' }, { status: 401 });
    }

    // Parse GraphQL query from request body
    const { query, variables } = await request.json();
    console.log('🔍 Query:', query);
    console.log('🔍 Variables:', variables);
    
    // For POC, handle nextActivity subscription as a simple query
    if (query.includes('nextActivity')) {
      // Hard-coded activity descriptor as specified in the plan
      const activityDescriptor = {
        data: {
          nextActivity: {
            activityId: 'hello-world-activity',
            componentKey: 'hello',
            componentProps: {
              message: 'Welcome to your care journey!',
              patientName: 'Patient', // In real implementation, would come from session data
              careflowId: payload.sub,
              orgId: payload.org_id,
            }
          }
        }
      };
      
      return NextResponse.json(activityDescriptor);
    }

    // For other queries, proxy to orchestration service
    const orchestrationUrl = process.env.ORCHESTRATION_URL || 'https://api.development.awellhealth.com/orchestration/graphql';
    
    try {
      const orchestrationResponse = await fetch(orchestrationUrl, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${jwtCookie.value}`,
          // Forward session context
          'X-Session-ID': payload.sub,
        },
        body: JSON.stringify({ query, variables }),
      });

      if (!orchestrationResponse.ok) {
        console.error(`Orchestration service error: ${orchestrationResponse.status}`);
        return NextResponse.json(
          { error: 'Orchestration service unavailable' }, 
          { status: 502 }
        );
      }

      const data = await orchestrationResponse.json();
      return NextResponse.json(data);
    } catch (fetchError) {
      console.error('Failed to connect to orchestration service:', fetchError);
      
      // Fallback response when orchestration service is unavailable (like Kong not running)
      return NextResponse.json({
        data: {
          nextActivity: {
            activityId: 'fallback-activity',
            componentKey: 'hello',
            componentProps: {
              message: 'Orchestration service unavailable - using fallback',
              error: 'Could not connect to backend services',
              careflow_id: payload.sub
            }
          }
        }
      });
    }
  } catch (error) {
    console.error('GraphQL endpoint error:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}

// Handle preflight requests for CORS
export async function OPTIONS() {
  return new NextResponse(null, {
    status: 200,
    headers: {
      'Access-Control-Allow-Origin': '*',
      'Access-Control-Allow-Methods': 'POST, OPTIONS',
      'Access-Control-Allow-Headers': 'Content-Type, Authorization',
    },
  });
} 