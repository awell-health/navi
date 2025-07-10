'use client';

import { useEffect, useRef, useState } from 'react';

interface NaviInstance {
  renderActivities: (containerId: string, options: any) => any;
}

interface NaviEmbedInstance {
  destroy: () => void;
  iframe: HTMLIFrameElement;
  on: (event: string, callback: (data: any) => void) => void;
}

declare global {
  interface window {
    Navi: ((publishableKey: string) => NaviInstance) & {
      version: string;
      debug: () => void;
    };
  }
}

export function NaviTestComponent() {
  const [currentInstance, setCurrentInstance] = useState<NaviEmbedInstance | null>(null);
  const [events, setEvents] = useState<Array<{ type: string; data: any; timestamp: Date }>>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  
  // Configuration state
  const [config, setConfig] = useState({
    publishableKey: 'pk_test_demo123',
    pathwayId: 'pathway_patient_intake',
    stakeholderId: 'stakeholder_demo',
    
    // JWT Parameters - what we need for authentication
    organizationId: 'org_awell_health',
    userId: 'user_patient_123',
    sessionId: 'session_' + Date.now(),
    
    // Branding
    primary: '#3b82f6',
    secondary: '#6b7280',
    fontFamily: 'Inter, sans-serif',
    
    // Iframe sizing
    size: 'standard' as 'compact' | 'standard' | 'full' | 'custom',
    customHeight: 500,
    customWidth: '100%'
  });

  const containerRef = useRef<HTMLDivElement>(null);

  const addEvent = (type: string, data: any) => {
    setEvents(prev => [...prev, { type, data, timestamp: new Date() }]);
  };

  const loadNavi = async () => {
    try {
      setIsLoading(true);
      setError(null);
      
      // Destroy existing instance
      if (currentInstance) {
        currentInstance.destroy();
        setCurrentInstance(null);
      }

      // Clear container
      if (containerRef.current) {
        containerRef.current.innerHTML = '';
      }

      // Validate inputs
      if (!config.publishableKey || !config.pathwayId) {
        throw new Error('Publishable Key and Pathway ID are required');
      }

      // Initialize Navi (script already loaded by root page)
      const navi = (window as any).Navi(config.publishableKey);
      
      // Render activities with all new parameters
      const instance = navi.renderActivities('#navi-container', {
        pathwayId: config.pathwayId,
        stakeholderId: config.stakeholderId,
        
        // JWT creation parameters
        organizationId: config.organizationId,
        userId: config.userId,
        sessionId: config.sessionId,
        
        // Branding
        branding: {
          primary: config.primary,
          secondary: config.secondary,
          fontFamily: config.fontFamily
        },
        
        // Iframe sizing
        size: config.size,
        height: config.size === 'custom' ? config.customHeight : undefined,
        width: config.size === 'custom' ? config.customWidth : undefined
      });

      // Set up event listeners
      instance.on('navi.ready', (data: any) => {
        addEvent('navi.ready', data);
        setIsLoading(false);
      });

      instance.on('navi.error', (data: any) => {
        addEvent('navi.error', data);
        setError(data.message || 'Unknown error');
        setIsLoading(false);
      });

      instance.on('navi.activity.loaded', (data: any) => {
        addEvent('navi.activity.loaded', data);
      });

      instance.on('navi.activity.completed', (data: any) => {
        addEvent('navi.activity.completed', data);
      });

      instance.on('navi.pathway.completed', (data: any) => {
        addEvent('navi.pathway.completed', data);
      });

      setCurrentInstance(instance);
      
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Unknown error';
      setError(errorMessage);
      setIsLoading(false);
      addEvent('error', { message: errorMessage });
    }
  };

  const destroyNavi = () => {
    if (currentInstance) {
      currentInstance.destroy();
      setCurrentInstance(null);
      addEvent('destroy', { message: 'Instance destroyed' });
    }
    if (containerRef.current) {
      containerRef.current.innerHTML = '<div class="flex items-center justify-center h-96 text-gray-500">Click "Load Navi" to see the SDK in action</div>';
    }
  };

  const clearEvents = () => {
    setEvents([]);
  };

  const handleConfigChange = (key: string, value: string) => {
    setConfig(prev => ({ ...prev, [key]: value }));
  };

  return (
    <div className="bg-white rounded-lg shadow-lg p-8">
      <h2 className="text-2xl font-semibold text-gray-800 mb-6">
        🧪 Live SDK Test
      </h2>
      
      {/* Configuration Panel */}
      <div className="bg-gray-50 rounded-lg p-6 mb-6">
        <h3 className="text-lg font-semibold text-gray-800 mb-4">Configuration</h3>
        
        {/* Basic SDK Configuration */}
        <div className="mb-6">
          <h4 className="text-md font-semibold text-gray-700 mb-3">🔧 Basic Configuration</h4>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Publishable Key
              </label>
              <input
                type="text"
                value={config.publishableKey}
                onChange={(e) => handleConfigChange('publishableKey', e.target.value)}
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                placeholder="pk_test_..."
              />
            </div>
            
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Pathway ID
              </label>
              <input
                type="text"
                value={config.pathwayId}
                onChange={(e) => handleConfigChange('pathwayId', e.target.value)}
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                placeholder="pathway_..."
              />
            </div>
          </div>
        </div>

        {/* JWT Parameters - What we need for authentication */}
        <div className="mb-6">
          <h4 className="text-md font-semibold text-gray-700 mb-2">🔐 JWT Authentication Parameters</h4>
          <p className="text-sm text-gray-600 mb-3">
            These parameters will be used to create and sign the JWT token for secure authentication:
          </p>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Organization ID <span className="text-xs text-gray-500">(aud claim)</span>
              </label>
              <input
                type="text"
                value={config.organizationId}
                onChange={(e) => handleConfigChange('organizationId', e.target.value)}
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                placeholder="org_..."
              />
            </div>
            
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                User ID <span className="text-xs text-gray-500">(sub claim)</span>
              </label>
              <input
                type="text"
                value={config.userId}
                onChange={(e) => handleConfigChange('userId', e.target.value)}
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                placeholder="user_..."
              />
            </div>
            
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Session ID <span className="text-xs text-gray-500">(tracking)</span>
              </label>
              <input
                type="text"
                value={config.sessionId}
                onChange={(e) => handleConfigChange('sessionId', e.target.value)}
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                placeholder="session_..."
              />
            </div>
          </div>
        </div>

        {/* Iframe Sizing */}
        <div className="mb-6">
          <h4 className="text-md font-semibold text-gray-700 mb-2">📐 Iframe Size Options</h4>
          <p className="text-sm text-gray-600 mb-3">
            Test different iframe sizes to see how the embed adapts to different use cases:
          </p>
          <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Size Preset</label>
              <select
                value={config.size}
                onChange={(e) => handleConfigChange('size', e.target.value)}
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
              >
                <option value="compact">Compact (300px)</option>
                <option value="standard">Standard (500px)</option>
                <option value="full">Full (80vh)</option>
                <option value="custom">Custom</option>
              </select>
            </div>
            
            {config.size === 'custom' && (
              <>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Custom Height (px)</label>
                  <input
                    type="number"
                    value={config.customHeight}
                    onChange={(e) => handleConfigChange('customHeight', e.target.value)}
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                    placeholder="500"
                  />
                </div>
                
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Custom Width</label>
                  <input
                    type="text"
                    value={config.customWidth}
                    onChange={(e) => handleConfigChange('customWidth', e.target.value)}
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                    placeholder="100% or 800px"
                  />
                </div>
              </>
            )}
          </div>
        </div>

        {/* Branding */}
        <div className="mb-6">
          <h4 className="text-md font-semibold text-gray-700 mb-2">🎨 Branding & Styling</h4>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Primary Color
              </label>
              <input
                type="color"
                value={config.primary}
                onChange={(e) => handleConfigChange('primary', e.target.value)}
                className="w-full h-10 border border-gray-300 rounded-md"
              />
            </div>
            
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Secondary Color
              </label>
              <input
                type="color"
                value={config.secondary}
                onChange={(e) => handleConfigChange('secondary', e.target.value)}
                className="w-full h-10 border border-gray-300 rounded-md"
              />
            </div>
            
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Font Family
              </label>
              <select
                value={config.fontFamily}
                onChange={(e) => handleConfigChange('fontFamily', e.target.value)}
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
              >
                <option value="Inter, sans-serif">Inter</option>
                <option value="Arial, sans-serif">Arial</option>
                <option value="Georgia, serif">Georgia</option>
                <option value="'Courier New', monospace">Courier New</option>
              </select>
            </div>
          </div>
        </div>
        
        <div className="flex gap-3">
          <button
            onClick={loadNavi}
            disabled={isLoading}
            className="bg-blue-600 text-white px-4 py-2 rounded-md hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed"
          >
            {isLoading ? '🔄 Loading...' : '🚀 Load Navi'}
          </button>
          
          <button
            onClick={destroyNavi}
            className="bg-gray-600 text-white px-4 py-2 rounded-md hover:bg-gray-700"
          >
            🗑️ Destroy
          </button>
          
          <button
            onClick={() => {
              if (window.Navi) {
                // Debug functionality will be available on the global Navi object
                console.log('Debug mode enabled', window.Navi);
                if (typeof (window.Navi as any).debug === 'function') {
                  (window.Navi as any).debug();
                }
              } else {
                console.error('Navi SDK not loaded');
              }
            }}
            className="bg-green-600 text-white px-4 py-2 rounded-md hover:bg-green-700"
          >
            🔍 Debug
          </button>
        </div>
        
        {error && (
          <div className="mt-4 p-3 bg-red-50 border border-red-200 rounded-md text-red-700">
            ❌ {error}
          </div>
        )}
      </div>
      
      {/* SDK Container */}
      <div className="mb-6">
        <h3 className="text-lg font-semibold text-gray-800 mb-4">SDK Output</h3>
        <div className="border border-gray-300 rounded-lg overflow-hidden">
          <div 
            ref={containerRef}
            id="navi-container"
            className="min-h-96 bg-white"
          >
            <div className="flex items-center justify-center h-96 text-gray-500">
              Click "Load Navi" to see the SDK in action
            </div>
          </div>
        </div>
      </div>
      
      {/* Events Panel */}
      <div className="bg-gray-50 rounded-lg p-6">
        <div className="flex items-center justify-between mb-4">
          <h3 className="text-lg font-semibold text-gray-800">Events Log</h3>
          <button
            onClick={clearEvents}
            className="text-sm bg-gray-200 text-gray-700 px-3 py-1 rounded hover:bg-gray-300"
          >
            Clear
          </button>
        </div>
        
        <div className="max-h-64 overflow-y-auto">
          {events.length === 0 ? (
            <div className="text-gray-500 text-center py-4">
              No events yet. Load Navi to see events here.
            </div>
          ) : (
            <div className="space-y-2">
              {events.map((event, index) => (
                <div key={index} className="bg-white p-3 rounded border text-sm">
                  <div className="flex items-center justify-between mb-1">
                    <span className="font-medium text-blue-600">{event.type}</span>
                    <span className="text-gray-500 text-xs">
                      {event.timestamp.toLocaleTimeString()}
                    </span>
                  </div>
                  <pre className="text-gray-700 text-xs overflow-x-auto">
                    {JSON.stringify(event.data, null, 2)}
                  </pre>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  );
} 