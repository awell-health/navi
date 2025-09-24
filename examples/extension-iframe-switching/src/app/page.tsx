"use client";

import { NaviEmbed, NaviProvider } from "@awell-health/navi-js-react";
import { useSearchParams } from "next/navigation";
import { Suspense, useState } from "react";
import React from "react";

const ExtensionIframeSwitchingDemo = () => {
  const searchParams = useSearchParams();
  const sessionId = searchParams.get("session_id");
  const [showNavi, setShowNavi] = useState(true);
  const [showGoogle, setShowGoogle] = useState(false);

  const handleActivityReady = (event: { activityType: string; type: string }) => {
    console.log("Activity ready event:", event);
    
    if (event.activityType === "EXTENSION") {
      console.log("Extension activity started - showing Google iframe");
      setShowNavi(false);
      setShowGoogle(true);
    }
  };

  const handleActivityCompleted = (event: { activityType: string; type: string; data?: { submissionData: unknown } }) => {
    console.log("Activity completed:", event);
    
    if (event.activityType === "EXTENSION") {
      console.log("Extension activity completed - showing Navi iframe");
      setShowGoogle(false);
      setShowNavi(true);
    }
  };

  React.useEffect(() => {
    const handleTestReady = (event: CustomEvent<{ activityType: string; type: string }>) => {
      console.log("🧪 Test extension activity ready:", event.detail);
      if (event.detail.activityType === "EXTENSION") {
        console.log("Extension activity started - showing Google iframe");
        setShowNavi(false);
        setShowGoogle(true);
      }
    };

    const handleTestComplete = (event: CustomEvent<{ activityType: string; type: string }>) => {
      console.log("🧪 Test extension activity complete:", event.detail);
      if (event.detail.activityType === "EXTENSION") {
        console.log("Extension activity completed - showing Navi iframe");
        setShowGoogle(false);
        setShowNavi(true);
      }
    };

    window.addEventListener('test-activity-ready', handleTestReady as EventListener);
    window.addEventListener('test-activity-complete', handleTestComplete as EventListener);

    return () => {
      window.removeEventListener('test-activity-ready', handleTestReady as EventListener);
      window.removeEventListener('test-activity-complete', handleTestComplete as EventListener);
    };
  }, []);

  return (
    <NaviProvider
      publishableKey="pk_test-UfYqfiAQUN6s0gQ7bHczu"
      config={{
        embedOrigin: "http://localhost:3000",
      }}
    >
      <div style={{ 
        display: 'flex', 
        flexDirection: 'column', 
        alignItems: 'center', 
        justifyContent: 'center', 
        minHeight: '100vh',
        padding: '20px',
        fontFamily: 'Arial, sans-serif'
      }}>
        <h1 style={{ 
          fontSize: '24px', 
          fontWeight: 'bold', 
          marginBottom: '16px',
          textAlign: 'center'
        }}>
          Extension Activity Iframe Switching Demo
        </h1>
        
        <p style={{ 
          marginBottom: '24px', 
          textAlign: 'center', 
          maxWidth: '600px',
          lineHeight: '1.5',
          color: '#666'
        }}>
          This demo shows how to hide the Navi iframe and show a third-party iframe 
          when an extension activity starts, then switch back when it completes.
          The switching happens automatically based on activity events.
        </p>
        
        <div style={{
          display: 'flex',
          gap: '10px',
          marginBottom: '20px',
          fontSize: '14px'
        }}>
          <div style={{
            padding: '8px 12px',
            backgroundColor: showNavi ? '#10b981' : '#e5e7eb',
            color: showNavi ? 'white' : '#6b7280',
            borderRadius: '4px',
            fontWeight: '500'
          }}>
            Navi: {showNavi ? 'Visible' : 'Hidden'}
          </div>
          <div style={{
            padding: '8px 12px',
            backgroundColor: showGoogle ? '#3b82f6' : '#e5e7eb',
            color: showGoogle ? 'white' : '#6b7280',
            borderRadius: '4px',
            fontWeight: '500'
          }}>
            Google: {showGoogle ? 'Visible' : 'Hidden'}
          </div>
        </div>
        
        <div style={{ 
          width: '100%', 
          maxWidth: '800px', 
          height: '500px',
          position: 'relative'
        }}>
          <div 
            id="navi-container" 
            style={{ 
              display: showNavi ? 'block' : 'none',
              width: '100%',
              height: '100%',
              border: '2px solid #10b981',
              borderRadius: '8px',
              overflow: 'hidden'
            }}
          >
            <NaviEmbed
              careflowDefinitionId="1CnTTHNYM1Q3"
              patientIdentifier={{
                system: "https://www.medplum.com/docs/api/fhir/resources/patient",
                value: "fake_medplum_jb",
              }}
              onSessionReady={() => {
                console.log("✅ Navi embed is ready");
              }}
              onSessionError={(event) => {
                console.error("❌ Navi embed error:", event);
              }}
              onActivityReady={handleActivityReady}
              onActivityCompleted={handleActivityCompleted}
              style={{ width: '100%', height: '100%' }}
            />
          </div>
          
          <div 
            id="google-container"
            style={{ 
              display: showGoogle ? 'block' : 'none',
              width: '100%',
              height: '100%',
              border: '2px solid #3b82f6',
              borderRadius: '8px',
              overflow: 'hidden',
              position: showNavi ? 'absolute' : 'static',
              top: 0,
              left: 0
            }}
          >
            <div style={{
              backgroundColor: '#3b82f6',
              color: 'white',
              padding: '8px 16px',
              fontSize: '14px',
              fontWeight: '500'
            }}>
              Third-party Application (Google Search)
            </div>
            <iframe
              src="https://www.google.com/search?q=healthcare+workflow&igu=1"
              style={{ 
                width: '100%', 
                height: 'calc(100% - 40px)',
                border: 'none'
              }}
              title="Third-party application (Google)"
            />
          </div>
        </div>
        
        <div style={{
          marginTop: '20px',
          padding: '16px',
          backgroundColor: '#f3f4f6',
          borderRadius: '8px',
          maxWidth: '600px',
          fontSize: '14px',
          color: '#374151'
        }}>
          <strong>How it works:</strong>
          <ul style={{ marginTop: '8px', paddingLeft: '20px' }}>
            <li>When an extension activity becomes ready, the Navi iframe is hidden and Google iframe is shown</li>
            <li>When the extension activity completes, the Google iframe is hidden and Navi iframe is shown again</li>
            <li>Check the browser console to see the activity events being logged</li>
          </ul>
        </div>
      </div>
    </NaviProvider>
  );
};

export default function ExtensionIframeSwitchingPage() {
  return (
    <Suspense fallback={<div>Loading...</div>}>
      <ExtensionIframeSwitchingDemo />
    </Suspense>
  );
}
