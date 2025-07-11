"use client";

import { useEffect, useState } from "react";
import { loadNavi } from "@awell-health/navi-js";
import { NaviTestComponent } from "./components/navi-test";

export default function Home() {
  const [isNaviLoaded, setIsNaviLoaded] = useState(false);
  const [loadError, setLoadError] = useState<string | null>(null);

  useEffect(() => {
    // Check if Navi is already loaded
    if (typeof window !== "undefined" && (window as any).Navi) {
      setIsNaviLoaded(true);
      return;
    }

    // Load Navi SDK using NPM package (Stripe-like approach)
    const initializeNavi = async () => {
      try {
        console.log("🔄 Loading Navi SDK via @awell-health/navi-js...");

        // This will load the script from CDN (or localhost in dev) and make window.Navi available
        const naviInstance = await loadNavi("pk_test_demo123");

        if (naviInstance) {
          console.log("✅ Navi SDK loaded successfully via NPM package");
          setIsNaviLoaded(true);
        } else {
          throw new Error("Failed to initialize Navi SDK");
        }
      } catch (error) {
        console.error("❌ Failed to load Navi SDK:", error);
        setLoadError(
          "Failed to load Navi SDK. Make sure the portal is running on localhost:3000"
        );
      }
    };

    initializeNavi();
  }, []);

  return (
    <div className="min-h-screen bg-gray-50 py-8">
      <div className="max-w-6xl mx-auto px-4">
        <div className="bg-white rounded-lg shadow-lg p-8 mb-8">
          <div className="text-center mb-8">
            <h1 className="text-3xl font-bold text-blue-600 mb-4">
              🚀 Navi SDK Test Integration
            </h1>
            <p className="text-gray-600 text-lg">
              Testing the customer-facing SDK with a real Next.js application
            </p>
          </div>

          {/* Navigation */}
          <div className="flex gap-4 justify-center mb-8">
            <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
              <h3 className="font-semibold text-blue-900 mb-2">
                JavaScript SDK Test
              </h3>
              <p className="text-sm text-blue-700 mb-3">
                Tests the vanilla JavaScript SDK via iframe embedding
              </p>
              <span className="text-sm text-blue-600">👈 Current page</span>
            </div>

            <div className="bg-green-50 border border-green-200 rounded-lg p-4">
              <h3 className="font-semibold text-green-900 mb-2">
                React SDK Test
              </h3>
              <p className="text-sm text-green-700 mb-3">
                Tests React components imported directly
              </p>
              <a
                href="/react-demo"
                className="inline-block bg-green-600 hover:bg-green-700 text-white px-4 py-2 rounded-md text-sm font-medium transition-colors"
              >
                Go to React Demo →
              </a>
            </div>
          </div>

          {/* SDK Loading Status */}
          <div className="mb-8">
            <div className="bg-gray-100 rounded-lg p-4">
              <h3 className="font-semibold text-gray-800 mb-2">SDK Status</h3>
              {loadError ? (
                <div className="text-red-600 bg-red-50 p-3 rounded border border-red-200">
                  ❌ {loadError}
                </div>
              ) : isNaviLoaded ? (
                <div className="text-green-600 bg-green-50 p-3 rounded border border-green-200">
                  ✅ Navi SDK loaded successfully
                </div>
              ) : (
                <div className="text-blue-600 bg-blue-50 p-3 rounded border border-blue-200">
                  🔄 Loading Navi SDK...
                </div>
              )}
            </div>
          </div>

          {/* Integration Code Example */}
          <div className="mb-8">
            <h2 className="text-2xl font-semibold text-gray-800 mb-4">
              Integration Example
            </h2>
            <div className="bg-gray-900 text-green-400 p-4 rounded-lg font-mono text-sm overflow-x-auto">
              <pre>{`// Install via NPM
npm install @awell-health/navi-js

// Load Navi SDK (Stripe-like approach)
import { loadNavi } from '@awell-health/navi-js';

const navi = await loadNavi('pk_test_demo123');
const instance = navi.renderActivities('#container', {
  pathwayId: 'pathway_patient_intake',
  stakeholderId: 'stakeholder_demo',
  branding: {
    primary: '#3b82f6',
    secondary: '#6b7280',
    fontFamily: 'Inter, sans-serif'
  }
});`}</pre>
            </div>
          </div>
        </div>

        {/* Test Component */}
        {isNaviLoaded && <NaviTestComponent />}

        {/* Instructions */}
        <div className="bg-white rounded-lg shadow-lg p-8 mt-8">
          <h2 className="text-2xl font-semibold text-gray-800 mb-4">
            🧪 Testing Instructions
          </h2>
          <div className="space-y-4 text-gray-600">
            <div>
              <h3 className="font-semibold text-gray-800">Prerequisites:</h3>
              <ul className="list-disc ml-6 mt-2 space-y-1">
                <li>
                  Main portal running on{" "}
                  <code className="bg-gray-100 px-2 py-1 rounded">
                    localhost:3000
                  </code>
                </li>
                <li>
                  Test app running on{" "}
                  <code className="bg-gray-100 px-2 py-1 rounded">
                    localhost:3001
                  </code>
                </li>
                <li>
                  Navi loader built:{" "}
                  <code className="bg-gray-100 px-2 py-1 rounded">
                    cd packages/navi.js && npm run build
                  </code>
                </li>
              </ul>
            </div>

            <div>
              <h3 className="font-semibold text-gray-800">What to Test:</h3>
              <ul className="list-disc ml-6 mt-2 space-y-1">
                <li>SDK loads without errors</li>
                <li>Different publishable keys work</li>
                <li>Branding changes apply correctly</li>
                <li>Mock data displays properly</li>
                <li>Iframe resizing works</li>
                <li>Event communication works</li>
              </ul>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
