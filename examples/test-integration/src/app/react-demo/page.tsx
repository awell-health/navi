'use client';

import { useState } from 'react';
import { NaviProvider, MockActivitiesLoader } from '@awell-health/navi-react';

export default function ReactDemoPage() {
  const [config, setConfig] = useState({
    publishableKey: 'pk_test_demo123',
    pathwayId: 'pathway_patient_intake',
    branding: {
      primary: '#3b82f6',
      secondary: '#64748b',
      fontFamily: 'Inter, sans-serif'
    }
  });

  const [showNavi, setShowNavi] = useState(false);

  return (
    <div className="min-h-screen bg-gray-50 py-8">
      <div className="max-w-4xl mx-auto px-4">
        <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
          <div className="flex items-center justify-between mb-6">
            <div className="flex items-center gap-3">
              <span className="text-2xl">🚀</span>
              <h1 className="text-2xl font-bold text-gray-900">
                Navi React SDK Demo
              </h1>
            </div>
            <a
              href="/"
              className="text-sm text-blue-600 hover:text-blue-800 hover:underline"
            >
              ← Back to Home
            </a>
          </div>

          <p className="text-gray-600 mb-8">
            Testing the React components directly imported from @awell-health/navi-react
          </p>

          {/* Configuration Panel */}
          <div className="grid md:grid-cols-2 gap-6 mb-8">
            <div className="space-y-4">
              <h2 className="text-lg font-semibold text-gray-900">Configuration</h2>
              
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Publishable Key
                </label>
                <input
                  type="text"
                  value={config.publishableKey}
                  onChange={(e) => setConfig(prev => ({ ...prev, publishableKey: e.target.value }))}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Pathway ID
                </label>
                <input
                  type="text"
                  value={config.pathwayId}
                  onChange={(e) => setConfig(prev => ({ ...prev, pathwayId: e.target.value }))}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                />
              </div>
            </div>

            <div className="space-y-4">
              <h2 className="text-lg font-semibold text-gray-900">Branding</h2>
              
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Primary Color
                </label>
                <input
                  type="color"
                  value={config.branding.primary}
                  onChange={(e) => setConfig(prev => ({ 
                    ...prev, 
                    branding: { ...prev.branding, primary: e.target.value }
                  }))}
                  className="w-full h-10 border border-gray-300 rounded-md"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Secondary Color
                </label>
                <input
                  type="color"
                  value={config.branding.secondary}
                  onChange={(e) => setConfig(prev => ({ 
                    ...prev, 
                    branding: { ...prev.branding, secondary: e.target.value }
                  }))}
                  className="w-full h-10 border border-gray-300 rounded-md"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Font Family
                </label>
                <select
                  value={config.branding.fontFamily}
                  onChange={(e) => setConfig(prev => ({ 
                    ...prev, 
                    branding: { ...prev.branding, fontFamily: e.target.value }
                  }))}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                >
                  <option value="Inter, sans-serif">Inter</option>
                  <option value="system-ui, sans-serif">System UI</option>
                  <option value="Georgia, serif">Georgia</option>
                  <option value="'Courier New', monospace">Courier New</option>
                </select>
              </div>
            </div>
          </div>

          {/* Controls */}
          <div className="flex gap-4 mb-8">
            <button
              onClick={() => setShowNavi(!showNavi)}
              className={`px-6 py-2 rounded-md font-medium transition-colors ${
                showNavi
                  ? 'bg-red-600 hover:bg-red-700 text-white'
                  : 'bg-blue-600 hover:bg-blue-700 text-white'
              }`}
            >
              {showNavi ? 'Hide Navi' : 'Show Navi'}
            </button>
          </div>

          {/* Navi Component */}
          {showNavi && (
            <div className="border border-gray-200 rounded-lg p-4 bg-gray-50">
              <h3 className="text-lg font-semibold text-gray-900 mb-4">
                Navi Activities
              </h3>
              
              <NaviProvider
                publishableKey={config.publishableKey}
                pathwayId={config.pathwayId}
                branding={config.branding}
              >
                <MockActivitiesLoader />
              </NaviProvider>
            </div>
          )}

          {/* Status Info */}
          <div className="mt-8 p-4 bg-blue-50 rounded-lg">
            <h3 className="text-sm font-semibold text-blue-900 mb-2">Current Configuration:</h3>
            <pre className="text-xs text-blue-800 overflow-x-auto">
              {JSON.stringify(config, null, 2)}
            </pre>
          </div>
        </div>
      </div>
    </div>
  );
} 