"use client";

import { NaviProvider, NaviEmbed } from "@awell-health/navi-js-react";
import { loadNavi } from "@awell-health/navi-js";
import { techCorpBranding } from "./test_config";
import { useEffect, useState } from "react";

export default function Home() {
  const [naviLoaded, setNaviLoaded] = useState(false);
  const [loadError, setLoadError] = useState<string | null>(null);

  useEffect(() => {
    // Load Navi SDK once at app level with custom configuration
    loadNavi("pk_test_awell_dev_123", {
      // Pull script from CDN but embed to localhost for testing
      origin: "https://cdn.awellhealth.com",
      embedOrigin: "http://localhost:3000",
    })
      .then(() => {
        console.log("✅ Navi SDK loaded successfully");
        setNaviLoaded(true);
      })
      .catch((error) => {
        console.error("❌ Failed to load Navi SDK:", error);
        setLoadError(error.message);
      });
  }, []);

  if (loadError) {
    return (
      <div style={{ padding: "20px", color: "red" }}>
        <h1>Error Loading Navi SDK</h1>
        <p>{loadError}</p>
        <button onClick={() => window.location.reload()}>Retry</button>
      </div>
    );
  }

  if (!naviLoaded) {
    return (
      <div style={{ padding: "20px" }}>
        <h1>Loading Navi SDK...</h1>
        <p>Mixed configuration: CDN script + localhost embed</p>
      </div>
    );
  }

  return (
    <div style={{ padding: "20px" }}>
      <h1>Simple Navi Embed Example</h1>
      <p>✅ Navi SDK loaded! Local development mode active</p>

      <NaviProvider publishableKey="pk_test_demo123">
        <NaviEmbed
          careflowDefinitionId="demo-careflow-123"
          patientIdentifier={{
            system: "medical_record_number",
            value: "patient-123",
          }}
          branding={techCorpBranding}
          style={{
            width: "100%",
            height: "600px",
            border: "1px solid #ddd",
            borderRadius: "8px",
          }}
          onReady={() => {
            console.log("✅ Navi embed is ready");
          }}
          onError={(error: any) => {
            console.error("❌ Navi embed error:", error);
          }}
          onActivityCompleted={(data: any) => {
            console.log("🎉 Activity completed:", data);
          }}
        />
      </NaviProvider>
    </div>
  );
}
