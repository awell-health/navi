'use client';

import { useSearchParams } from 'next/navigation';
import { useEffect, useState } from 'react';

interface EmbedProps {
  params: Promise<{
    pathway_id: string;
  }>;
}

export default function EmbedPage({ params }: EmbedProps) {
  const searchParams = useSearchParams();
  const [config, setConfig] = useState({
    publishableKey: '',
    pathwayId: '',
    instanceId: '',
    branding: {
      primary: '#3b82f6',
      secondary: '#64748b',
      fontFamily: 'Inter, sans-serif'
    },
    jwtParams: {
      organizationId: '',
      userId: '',
      sessionId: '',
      stakeholderId: ''
    }
  });
  const [referrer, setReferrer] = useState('');

  useEffect(() => {
    const initializeConfig = async () => {
      const resolvedParams = await params;
      
      // Extract parameters from URL
      const pk = searchParams.get('pk');
      const instanceId = searchParams.get('instance_id');
      const brandingParam = searchParams.get('branding');
      
      // JWT creation parameters
      const orgId = searchParams.get('org_id');
      const userId = searchParams.get('user_id');
      const sessionId = searchParams.get('session_id');
      const stakeholderId = searchParams.get('stakeholder_id');
      
      // Set referrer from client-side only
      if (typeof window !== 'undefined') {
        setReferrer(document.referrer || 'localhost:3001');
      }
      
      setConfig(prev => ({
        ...prev,
        publishableKey: pk || '',
        pathwayId: resolvedParams.pathway_id,
        instanceId: instanceId || '',
        branding: brandingParam ? JSON.parse(brandingParam) : prev.branding,
        
        // Store JWT parameters for display
        jwtParams: {
          organizationId: orgId || '',
          userId: userId || '',
          sessionId: sessionId || '',
          stakeholderId: stakeholderId || ''
        }
      }));

      // Send ready message to parent (customer website)
      if (instanceId) {
        const message = {
          source: 'navi',
          instance_id: instanceId,
          type: 'navi.ready',
          pathway_id: resolvedParams.pathway_id
        };
        
        // Send to parent window (cross-origin)
        window.parent.postMessage(message, '*');
      }
    };

    initializeConfig();
  }, [searchParams, params]);

  return (
    <div 
      className="min-h-screen bg-white p-6"
      style={{
        fontFamily: config.branding.fontFamily,
        '--primary-color': config.branding.primary,
        '--secondary-color': config.branding.secondary
      } as React.CSSProperties}
    >
      {/* Header showing this is cross-origin */}
      <div className="mb-6 p-4 bg-blue-50 border border-blue-200 rounded-lg">
        <div className="text-sm text-blue-800">
          <div className="font-semibold mb-2">🔒 Secure Embed (Cross-Origin)</div>
          <div><strong>Customer Site:</strong> {referrer}</div>
          <div><strong>Navi Portal:</strong> localhost:3000 (this iframe)</div>
          <div><strong>Pathway:</strong> {config.pathwayId}</div>
          <div><strong>Instance:</strong> {config.instanceId}</div>
        </div>
      </div>

      <div className="max-w-2xl mx-auto">
        <div className="mb-6">
          <h1 
            className="text-2xl font-bold mb-2"
            style={{ color: config.branding.primary }}
          >
            Your Care Activities
          </h1>
          <p className="text-gray-600">
            Complete these activities to continue with your care plan
          </p>
        </div>

        {/* Simple HTML Form - No React Components */}
        <div className="space-y-4">
          <div className="border border-gray-200 rounded-lg p-4 bg-white shadow-sm">
            <h3 className="font-semibold text-gray-900 mb-1">Health Questionnaire</h3>
            <p className="text-sm text-gray-600 mb-3">Complete your initial health assessment</p>
            <button
              className="px-4 py-2 text-white rounded-md font-medium"
              style={{ backgroundColor: config.branding.primary }}
              onClick={() => {
                // Send completion message to parent
                window.parent.postMessage({
                  source: 'navi',
                  instance_id: config.instanceId,
                  type: 'navi.activity.completed',
                  activity_id: 'activity_1',
                  pathway_id: config.pathwayId
                }, '*');
              }}
            >
              Start Questionnaire
            </button>
          </div>

          <div className="border border-gray-200 rounded-lg p-4 bg-gray-50 shadow-sm">
            <h3 className="font-semibold text-gray-500 mb-1">Insurance Information</h3>
            <p className="text-sm text-gray-500 mb-3">Provide your insurance details</p>
            <div className="text-gray-400">🔒 Complete previous activity first</div>
          </div>
        </div>

        {/* JWT Parameters Section */}
        <div className="mt-8 p-4 bg-purple-50 border border-purple-200 rounded-lg">
          <h3 className="font-semibold text-purple-900 mb-2">🔐 JWT Creation Parameters</h3>
          <p className="text-sm text-purple-700 mb-3">
            These parameters would be used to create and sign a JWT token for secure authentication:
          </p>
          <div className="grid grid-cols-2 gap-4 text-sm">
            <div>
              <span className="font-medium text-purple-800">Organization ID:</span>
              <div className="bg-purple-100 p-2 rounded font-mono text-xs">
                {config.jwtParams.organizationId || 'Not provided'}
              </div>
            </div>
            <div>
              <span className="font-medium text-purple-800">User ID:</span>
              <div className="bg-purple-100 p-2 rounded font-mono text-xs">
                {config.jwtParams.userId || 'Not provided'}
              </div>
            </div>
            <div>
              <span className="font-medium text-purple-800">Session ID:</span>
              <div className="bg-purple-100 p-2 rounded font-mono text-xs">
                {config.jwtParams.sessionId || 'Not provided'}
              </div>
            </div>
            <div>
              <span className="font-medium text-purple-800">Stakeholder ID:</span>
              <div className="bg-purple-100 p-2 rounded font-mono text-xs">
                {config.jwtParams.stakeholderId || 'Not provided'}
              </div>
            </div>
          </div>
          <div className="mt-3 p-3 bg-purple-100 rounded">
            <div className="text-xs text-purple-700">
              <strong>Next Step:</strong> Use publishable key + these parameters to create a signed JWT token
              that authorizes this user to access activities for this pathway.
            </div>
          </div>
        </div>

        <div className="mt-4 p-4 bg-gray-50 rounded-lg">
          <h3 className="font-semibold text-gray-900 mb-2">Debug Info</h3>
          <div className="text-xs text-gray-600 space-y-1">
            <div>Publishable Key: {config.publishableKey}</div>
            <div>Pathway ID: {config.pathwayId}</div>
            <div>Instance ID: {config.instanceId}</div>
            <div>Branding: {JSON.stringify(config.branding)}</div>
          </div>
        </div>
      </div>
    </div>
  );
} 