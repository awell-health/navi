"use client";

import { useState, useEffect } from "react";
import { BrandingConfig } from "../../../../packages/navi-core/dist/types/config";

declare global {
  interface Window {
    Navi: (publishableKey: string) => {
      render: (
        containerId: string,
        options: any
      ) => Promise<{
        destroy: () => void;
        iframe: HTMLIFrameElement;
        on: (event: string, callback: (data: any) => void) => void;
      }>;
    };
  }
}

export default function HomePage() {
  const [naviLoaded, setNaviLoaded] = useState(false);
  const [naviInstance, setNaviInstance] = useState<any>(null);
  const [events, setEvents] = useState<
    Array<{ type: string; data: any; timestamp: Date }>
  >([]);
  const [showIframe, setShowIframe] = useState(false);

  // Sunrise Health test configuration from generate-tokens
  const testConfig: Record<string, string> = {
    publishableKey: "pk_test_demo123",
    pathwayId: "Tjsko1X8exEh", // From Sunrise Health token
    stakeholderId: "Eh4UQbKZKBk6hKd0M7wKk", // From Sunrise Health token
    organizationId: "sunrise-health",
    userId: "user_patient_123",
    sessionId: `session_${Date.now()}`,
  };

  // Load navi.js script
  useEffect(() => {
    const script = document.createElement("script");
    script.src = "http://localhost:3000/navi.js";
    script.onload = () => {
      console.log("✅ Navi.js loaded successfully");
      setNaviLoaded(true);
    };
    script.onerror = () => {
      console.error("❌ Failed to load navi.js");
    };
    document.head.appendChild(script);

    return () => {
      document.head.removeChild(script);
    };
  }, []);

  const addEvent = (type: string, data: any) => {
    setEvents((prev) => [...prev, { type, data, timestamp: new Date() }]);
  };

  const startIframeTest = async () => {
    if (!naviLoaded || !window.Navi) {
      alert("Navi.js not loaded yet");
      return;
    }

    // Create Navi instance
    const navi = window.Navi(testConfig.publishableKey);

    console.log("running iframe test", testConfig);
    // Render activities with Sunrise Health config (Use Case 2: existing careflow)
    const instance = await navi.render("#navi-container", {
      careflowId: testConfig.pathwayId, // Use Case 2: Resume existing care flow
      stakeholderId: testConfig.stakeholderId,
      ...(testConfig.branding && { branding: testConfig.branding }),
      // Let the API determine the correct embed URL (/embed/[careflow_id])
    });

    // Set up comprehensive event logging
    const eventTypes = [
      "navi.activity.ready",
      "navi.activity.activate",
      "navi.activity.progress",
      "navi.activity.dataChange",
      "navi.activity.completed",
      "navi.activity.error",
      "navi.activity.focus",
      "navi.activity.blur",
      "navi.height.changed", // 📏 Dynamic iframe resizing
    ];

    eventTypes.forEach((eventType) => {
      instance.on(eventType, (data: any) => {
        console.log(`🎯  ${eventType}:`, data);
        setEvents((prev) => [
          ...prev,
          {
            type: eventType,
            data,
            timestamp: new Date(),
          },
        ]);
      });
    });

    setNaviInstance(instance);
    setShowIframe(true);
  };

  // eslint-disable-next-line @typescript-eslint/no-unused-vars
  const startNewCareFlowTest = async () => {
    if (!naviLoaded || !window.Navi) {
      alert("Navi.js not loaded yet");
      return;
    }

    // Create Navi instance
    const navi = window.Navi(testConfig.publishableKey);

    // Use Case 1: Start new care flow
    try {
      const instance = await navi.render("#navi-container", {
        careflowId: "GeDg7fJmddZi", // New care flow definition
        awellPatientId: "Eh4UQbKZKBk6hKd0M7wKk", // Optional existing patient
        stakeholderId: testConfig.stakeholderId,
        ...(testConfig.branding && {
          branding: {
            ...(testConfig.branding as BrandingConfig),
            welcomeTitle: "New Patient Intake",
            welcomeSubtitle: "Welcome to the new patient intake",
          },
        }),
        size: "standard",
      });

      // Set up comprehensive event logging
      const eventTypes = [
        "navi.activity.ready",
        "navi.activity.activate",
        "navi.activity.progress",
        "navi.activity.dataChange",
        "navi.activity.completed",
        "navi.activity.error",
        "navi.activity.focus",
        "navi.activity.blur",
        "navi.height.changed", // 📏 Dynamic iframe resizing
      ];

      eventTypes.forEach((eventType) => {
        instance.on(eventType, (data: any) => {
          console.log(`🆕 New Care Flow - ${eventType}:`, data);
          setEvents((prev) => [
            ...prev,
            {
              type: `NEW CF - ${eventType}`,
              data,
              timestamp: new Date(),
            },
          ]);
        });
      });

      setNaviInstance(instance);
      setShowIframe(true);
    } catch (error) {
      console.error("❌ Failed to start new care flow:", error);
      addEvent("error", { message: "Failed to start new care flow", error });
    }
  };

  const stopIframeTest = () => {
    if (naviInstance) {
      naviInstance.destroy();
      setNaviInstance(null);
    }
    setShowIframe(false);
  };

  const clearEvents = () => {
    setEvents([]);
  };

  return (
    <div className="min-h-screen bg-gray-50 py-8">
      <div className="max-w-6xl mx-auto px-4">
        <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
          {/* Header */}
          <div className="flex items-center justify-between mb-6">
            <div className="flex items-center gap-3">
              <span className="text-2xl">🧪</span>
              <h1 className="text-2xl font-bold text-gray-900">
                Navi SDK Test Suite
              </h1>
            </div>
          </div>

          <p className="text-gray-600 mb-8">
            Testing complete event integration between navi-portal and navi.js
            using Sunrise Health test data. The iframe will automatically resize
            based on content height changes via{" "}
            <code className="bg-gray-100 px-1 rounded text-sm">
              navi.height.changed
            </code>{" "}
            events.
          </p>

          {/* Status Indicators */}
          <div className="grid md:grid-cols-3 gap-4 mb-8">
            <div
              className={`p-4 rounded-lg border ${
                naviLoaded
                  ? "bg-green-50 border-green-200"
                  : "bg-yellow-50 border-yellow-200"
              }`}
            >
              <div className="flex items-center gap-2">
                <span
                  className={naviLoaded ? "text-green-600" : "text-yellow-600"}
                >
                  {naviLoaded ? "✅" : "⏳"}
                </span>
                <span className="font-medium">Navi.js Loader</span>
              </div>
              <p className="text-sm text-gray-600 mt-1">
                {naviLoaded
                  ? "Ready for embedding"
                  : "Loading from localhost:3000..."}
              </p>
            </div>

            <div
              className={`p-4 rounded-lg border ${
                showIframe
                  ? "bg-blue-50 border-blue-200"
                  : "bg-gray-50 border-gray-200"
              }`}
            >
              <div className="flex items-center gap-2">
                <span
                  className={showIframe ? "text-blue-600" : "text-gray-400"}
                >
                  {showIframe ? "🖼️" : "⏸️"}
                </span>
                <span className="font-medium">Iframe Active</span>
              </div>
              <p className="text-sm text-gray-600 mt-1">
                {showIframe
                  ? "Cross-origin messaging enabled"
                  : "No active iframe"}
              </p>
            </div>

            <div className="p-4 rounded-lg border bg-purple-50 border-purple-200">
              <div className="flex items-center gap-2">
                <span className="text-purple-600">📡</span>
                <span className="font-medium">Events Captured</span>
              </div>
              <p className="text-sm text-gray-600 mt-1">
                {events.length} events logged
              </p>
            </div>
          </div>

          {/* Test Configuration */}
          <div className="mb-8 p-4 bg-orange-50 border border-orange-200 rounded-lg">
            <h3 className="font-semibold text-orange-900 mb-2">
              🌅 Sunrise Health Test Configuration
            </h3>
            <div className="grid md:grid-cols-2 gap-4 text-sm">
              <div>
                <strong>Pathway ID:</strong>{" "}
                <code className="bg-orange-100 px-1 rounded">
                  {testConfig.pathwayId}
                </code>
              </div>
              <div>
                <strong>Stakeholder ID:</strong>{" "}
                <code className="bg-orange-100 px-1 rounded">
                  {testConfig.stakeholderId}
                </code>
              </div>
              <div>
                <strong>Organization:</strong>{" "}
                <code className="bg-orange-100 px-1 rounded">
                  {testConfig.organizationId}
                </code>
              </div>
            </div>
          </div>

          {/* Controls */}
          <div className="flex gap-4 mb-8">
            <button
              onClick={startIframeTest}
              disabled={!naviLoaded || showIframe}
              className={`px-6 py-2 rounded-md font-medium transition-colors ${
                !naviLoaded || showIframe
                  ? "bg-gray-300 text-gray-500 cursor-not-allowed"
                  : "bg-blue-600 hover:bg-blue-700 text-white"
              }`}
            >
              🚀 Start Iframe Test
            </button>

            <button
              onClick={stopIframeTest}
              disabled={!showIframe}
              className={`px-6 py-2 rounded-md font-medium transition-colors ${
                !showIframe
                  ? "bg-gray-300 text-gray-500 cursor-not-allowed"
                  : "bg-red-600 hover:bg-red-700 text-white"
              }`}
            >
              🛑 Stop Test
            </button>

            <button
              onClick={clearEvents}
              className="px-6 py-2 bg-gray-600 hover:bg-gray-700 text-white rounded-md font-medium transition-colors"
            >
              🗑️ Clear Events
            </button>
          </div>

          {/* Main Content Grid */}
          <div className="grid gap-8">
            {/* Iframe Container */}
            <div>
              <h3 className="text-lg font-semibold text-gray-900 mb-4">
                📱 Navi.js Iframe Integration
              </h3>

              <div
                id="navi-container"
                className="border border-gray-200 rounded-lg min-h-[300px] bg-gray-50 flex items-center justify-center transition-all duration-300 ease-in-out"
              >
                {!showIframe && (
                  <div className="text-center text-gray-500">
                    <div className="text-4xl mb-2">🖼️</div>
                    <p>Click "Start Iframe Test" to embed activities</p>
                    <p className="text-sm mt-1">
                      Will create iframe: localhost:3000/embed/
                      {testConfig.pathwayId}
                    </p>
                  </div>
                )}
              </div>
            </div>

            {/* Events Log */}
            <div>
              <div className="flex items-center justify-between mb-4">
                <h3 className="text-lg font-semibold text-gray-900">
                  📡 Event Stream
                </h3>
                <span className="text-sm text-gray-600">
                  {events.length} events
                </span>
              </div>

              <div className="border border-gray-200 rounded-lg bg-gray-50 h-[400px] overflow-y-auto p-4">
                {events.length === 0 ? (
                  <div className="text-center text-gray-500 mt-20">
                    <div className="text-2xl mb-2">📡</div>
                    <p>No events yet</p>
                    <p className="text-sm">
                      Start the iframe test to see activity events
                    </p>
                  </div>
                ) : (
                  <div className="space-y-2">
                    {events.slice(-10).map((event, index) => (
                      <div
                        key={index}
                        className="bg-white p-3 rounded border text-sm"
                      >
                        <div className="flex items-center justify-between mb-1">
                          <span className="font-mono text-blue-600 font-medium">
                            {event.type}
                          </span>
                          <span className="text-gray-500 text-xs">
                            {event.timestamp.toLocaleTimeString()}
                          </span>
                        </div>
                        <pre className="text-xs text-gray-700 whitespace-pre-wrap overflow-x-auto">
                          {JSON.stringify(event.data, null, 2)}
                        </pre>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            </div>
          </div>

          {/* Expected Events Guide */}
          <div className="mt-8 p-4 bg-blue-50 border border-blue-200 rounded-lg">
            <h3 className="font-semibold text-blue-900 mb-2">
              📋 Expected Event Flow
            </h3>
            <div className="text-sm text-blue-800 space-y-1">
              <div>
                <strong>1.</strong> <code>navi.ready</code> - Iframe loaded and
                ready
              </div>
              <div>
                <strong>2.</strong> <code>navi.activity.ready</code> - Activity
                component mounted
              </div>
              <div>
                <strong>3.</strong> <code>navi.height.changed</code> - Iframe
                automatically resizes to content
              </div>
              <div>
                <strong>4.</strong> <code>navi.activity.progress</code> - User
                interacts with form/checklist
              </div>
              <div>
                <strong>5.</strong> <code>navi.activity.completed</code> -
                Activity finished
              </div>
              <div>
                <strong>6.</strong> <code>navi.activity.focus/blur</code> -
                Focus state changes
              </div>
            </div>
          </div>

          {/* Direct Link for Manual Testing */}
          <div className="mt-8 p-4 bg-gray-50 border border-gray-200 rounded-lg">
            <h3 className="font-semibold text-gray-900 mb-2">
              🔗 Direct Testing Links
            </h3>
            <div className="space-y-2 text-sm">
              <div>
                <strong>Real Careflows Page (React Providers):</strong>
                <a
                  href={`http://localhost:3000/careflows/${testConfig.pathwayId}/stakeholders/${testConfig.stakeholderId}?instance_id=manual-test`}
                  target="_blank"
                  className="ml-2 text-blue-600 hover:underline font-mono"
                >
                  localhost:3000/careflows/{testConfig.pathwayId}/stakeholders/
                  {testConfig.stakeholderId}
                </a>
              </div>
              <div>
                <strong>Embed URL (Fallback):</strong>
                <a
                  href={`http://localhost:3000/embed/${testConfig.pathwayId}?instance_id=manual-test&stakeholder_id=${testConfig.stakeholderId}`}
                  target="_blank"
                  className="ml-2 text-gray-600 hover:underline font-mono text-xs"
                >
                  localhost:3000/embed/{testConfig.pathwayId}
                </a>
              </div>
              <div>
                <strong>Magic Link:</strong>
                <span className="ml-2 text-gray-600">
                  Generate with <code>pnpm generate-tokens</code> (Sunrise
                  Health)
                </span>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
